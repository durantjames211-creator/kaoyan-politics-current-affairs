import { XMLParser } from "fast-xml-parser";
import { randomUUID } from "crypto";
import {
  getAffairs,
  saveAffairs,
  getAnniversaries,
  saveSyncMeta,
} from "./data";
import { tagModules, buildExamTips, matchAnniversaries } from "./modules";
import type { Affair, SyncMeta } from "./types";

/** Candidate public RSS feeds — successes recorded, failures kept in meta. */
export const RSS_FEEDS = [
  "https://www.people.com.cn/rss/politics.xml",
  "https://www.chinanews.com.cn/rss/scroll-news.xml",
  "https://www.chinanews.com.cn/rss/importnews.xml",
  "https://feedx.net/rss/people.xml",
];

/** Only ingest items published within this window (requirement: past 24 hours). */
const WINDOW_MS = 24 * 60 * 60 * 1000;

function asArray<T>(v: T | T[] | undefined | null): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function pickImage(item: Record<string, unknown>): string | undefined {
  const enclosure = item.enclosure as
    | { "@_url"?: string; url?: string }
    | undefined;
  const encUrl = enclosure?.["@_url"] || enclosure?.url;
  if (encUrl && /\.(jpg|jpeg|png|gif|webp)/i.test(encUrl)) return encUrl;

  const media = item["media:content"] as
    | { "@_url"?: string }
    | { "@_url"?: string }[]
    | undefined;
  const mediaOne = Array.isArray(media) ? media[0] : media;
  if (mediaOne?.["@_url"]) return mediaOne["@_url"];

  const desc =
    (typeof item.description === "string" && item.description) ||
    (typeof item["content:encoded"] === "string" && item["content:encoded"]) ||
    "";
  const m = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m?.[1];
}

function parsePublished(raw: unknown): Date | null {
  if (!raw) return null;
  const d = new Date(String(raw));
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

interface ParsedItem {
  title: string;
  summary: string;
  date: string;
  publishedAt: string;
  publishedMs: number;
  source: string;
  sourceUrl: string;
  imageUrl?: string;
}

async function fetchFeed(
  url: string
): Promise<{ ok: boolean; message: string; items: ParsedItem[] }> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "KaoyanPoliticsBot/1.0 (+https://github.com/kaoyan-politics-current-affairs)",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
    if (!res.ok) {
      return { ok: false, message: `HTTP ${res.status}`, items: [] };
    }
    const xml = await res.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });
    const doc = parser.parse(xml);
    const channel = doc?.rss?.channel || doc?.feed;
    if (!channel) {
      return { ok: false, message: "无法解析 RSS channel", items: [] };
    }

    const sourceName =
      (typeof channel.title === "string" && channel.title) ||
      new URL(url).hostname;

    const rawItems = asArray(
      channel.item || channel.entry
    ) as Record<string, unknown>[];

    const cutoff = Date.now() - WINDOW_MS;
    const items: ParsedItem[] = [];
    let skippedOld = 0;

    for (const it of rawItems.slice(0, 80)) {
      const titleRaw = it.title;
      const title =
        typeof titleRaw === "string"
          ? stripHtml(titleRaw)
          : typeof (titleRaw as { "#text"?: string })?.["#text"] === "string"
            ? stripHtml((titleRaw as { "#text": string })["#text"])
            : "";
      if (!title) continue;

      const linkRaw = it.link;
      let sourceUrl = "";
      if (typeof linkRaw === "string") sourceUrl = linkRaw;
      else if (linkRaw && typeof linkRaw === "object") {
        const o = linkRaw as { "@_href"?: string; "#text"?: string };
        sourceUrl = o["@_href"] || o["#text"] || "";
      }
      if (!sourceUrl && typeof it.guid === "string") sourceUrl = it.guid;
      if (
        !sourceUrl &&
        it.guid &&
        typeof it.guid === "object" &&
        typeof (it.guid as { "#text"?: string })["#text"] === "string"
      ) {
        sourceUrl = (it.guid as { "#text": string })["#text"];
      }
      if (!sourceUrl) continue;

      const published = parsePublished(
        it.pubDate || it.published || it.updated || it["dc:date"]
      );
      // Require published time within past 24h (authoritative window).
      if (!published || published.getTime() < cutoff) {
        skippedOld += 1;
        continue;
      }

      const desc =
        (typeof it.description === "string" && it.description) ||
        (typeof it.summary === "string" && it.summary) ||
        (typeof it["content:encoded"] === "string" &&
          it["content:encoded"]) ||
        (typeof it.content === "string" && it.content) ||
        "";
      const summary = stripHtml(desc).slice(0, 280);
      const imageUrl = pickImage(it);

      items.push({
        title,
        summary: summary || title,
        date: published.toISOString().slice(0, 10),
        publishedAt: published.toISOString(),
        publishedMs: published.getTime(),
        source: sourceName,
        sourceUrl,
        imageUrl,
      });
    }

    return {
      ok: true,
      message: `近24h ${items.length} 条（跳过过期 ${skippedOld}）`,
      items,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, message: msg, items: [] };
  }
}

function contentChanged(
  prev: Affair,
  next: {
    title: string;
    summary: string;
    imageUrl?: string;
    date: string;
  }
): boolean {
  return (
    prev.title !== next.title ||
    prev.summary !== next.summary ||
    (prev.imageUrl || "") !== (next.imageUrl || "") ||
    prev.date !== next.date
  );
}

/**
 * Sync job:
 * - fetch public RSS
 * - keep only items published in the past 24 hours
 * - upsert by sourceUrl (add OR revise)
 * - retag modules / exam tips / anniversary 联动
 * - ALWAYS refresh lastVerifiedAt（今日已核验）even if zero new
 */
export async function runSync(): Promise<SyncMeta> {
  const existing = await getAffairs();
  const anniversaries = await getAnniversaries();
  const byUrl = new Map<string, number>();
  existing.forEach((a, i) => {
    if (a.sourceUrl) byUrl.set(a.sourceUrl, i);
  });

  const feedResults: SyncMeta["feeds"] = [];
  let fetched = 0;
  let added = 0;
  let updated = 0;
  let skippedOld = 0;
  const now = new Date().toISOString();
  const next: Affair[] = [...existing];

  for (const url of RSS_FEEDS) {
    const result = await fetchFeed(url);
    feedResults.push({
      url,
      ok: result.ok,
      message: result.message,
    });
    if (!result.ok) continue;

    // Count skipped from message if present
    const m = result.message.match(/跳过过期\s+(\d+)/);
    if (m) skippedOld += Number(m[1]) || 0;

    fetched += result.items.length;
    for (const item of result.items) {
      const text = `${item.title} ${item.summary}`;
      const modules = tagModules(item.title, item.summary);
      const matched = matchAnniversaries(text, anniversaries);
      const anniversaryIds = matched.map((a) => a.id);
      const examTips = buildExamTips(
        modules,
        matched.map((a) => a.title),
        {
          title: item.title,
          summary: item.summary,
          anniversaries: matched,
        }
      );

      const idx = byUrl.get(item.sourceUrl);
      if (idx !== undefined) {
        const prev = next[idx];
        const patch = {
          title: item.title,
          summary: item.summary,
          imageUrl: item.imageUrl || prev.imageUrl,
          date: item.date,
        };
        const changed = contentChanged(prev, patch);
        // Upsert-revise: always refresh modules / examTips / anniversary 联动
        next[idx] = {
          ...prev,
          ...patch,
          publishedAt: item.publishedAt,
          source: item.source || prev.source,
          modules,
          examTips,
          anniversaryIds,
          updatedAt: now,
        };
        if (changed) updated += 1;
      } else {
        const affair: Affair = {
          id: randomUUID(),
          title: item.title,
          summary: item.summary,
          date: item.date,
          publishedAt: item.publishedAt,
          source: item.source,
          sourceUrl: item.sourceUrl,
          modules,
          examTips,
          imageUrl: item.imageUrl,
          anniversaryIds,
          createdAt: now,
          updatedAt: now,
        };
        byUrl.set(item.sourceUrl, next.length);
        next.push(affair);
        added += 1;
      }
    }
  }

  // Second pass: ALWAYS re-tag modules + regenerate exam tips for ALL affairs
  // so homepage filters & 答题表述 stay consistent after rule upgrades / each sync.
  for (let i = 0; i < next.length; i++) {
    const a = next[i];
    const text = `${a.title} ${a.summary}`;
    const modules = tagModules(a.title, a.summary);
    const matched = matchAnniversaries(text, anniversaries);
    const anniversaryIds =
      matched.length > 0 ? matched.map((x) => x.id) : a.anniversaryIds || [];
    const examTips = buildExamTips(
      modules,
      matched.map((x) => x.title),
      {
        title: a.title,
        summary: a.summary,
        anniversaries: matched,
      }
    );
    next[i] = {
      ...a,
      modules,
      anniversaryIds,
      examTips,
    };
  }

  next.sort((a, b) => {
    const ta = a.publishedAt || a.date;
    const tb = b.publishedAt || b.date;
    return ta < tb ? 1 : ta > tb ? -1 : 0;
  });
  await saveAffairs(next);

  const okFeeds = feedResults.filter((f) => f.ok).length;
  const meta: SyncMeta = {
    lastSyncAt: now,
    lastVerifiedAt: now, // 今日已核验 — always set, even if zero new items
    lastStatus: okFeeds > 0 ? "ok" : feedResults.length === 0 ? "error" : "error",
    lastMessage:
      okFeeds > 0
        ? `近24小时核验完成：拉取有效 ${fetched} 条，新增 ${added}，修订 ${updated}，跳过过期约 ${skippedOld}`
        : `核验完成但源全部失败（仍已更新今日已核验）：${feedResults
            .map((f) => f.message)
            .join("; ")}`,
    lastFetched: fetched,
    lastAdded: added,
    lastUpdated: updated,
    lastSkippedOld: skippedOld,
    feeds: feedResults,
  };

  // Fix status: if we attempted feeds and some ok → ok; if all failed → error;
  // but verified timestamp is always written.
  if (okFeeds > 0) meta.lastStatus = "ok";
  else if (feedResults.some((f) => !f.ok)) meta.lastStatus = "error";

  await saveSyncMeta(meta);
  return meta;
}

/** Exported for tests / admin preview */
export function isWithin24Hours(isoOrDate: string, now = Date.now()): boolean {
  const t = new Date(isoOrDate).getTime();
  if (Number.isNaN(t)) return false;
  return t >= now - WINDOW_MS && t <= now + 5 * 60 * 1000;
}
