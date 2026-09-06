"use client";

import { useMemo, useState } from "react";
import type { Affair, Anniversary, ModuleTag, SyncMeta } from "@/lib/types";
import { MODULE_TAGS } from "@/lib/types";
import { mediaUrl } from "@/lib/basePath";
import { parseExamTipBullets } from "@/lib/modules";

interface Props {
  affairs: Affair[];
  anniversaries: Anniversary[];
  syncMeta: SyncMeta;
}

function monthKey(date: string) {
  return date.slice(0, 7);
}

export default function HomeClient({
  affairs,
  anniversaries,
  syncMeta,
}: Props) {
  const [module, setModule] = useState<ModuleTag | "全部">("全部");
  const [month, setMonth] = useState<string>("全部");
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const months = useMemo(() => {
    const set = new Set(affairs.map((a) => monthKey(a.date)));
    return Array.from(set).sort().reverse();
  }, [affairs]);

  const filtered = useMemo(() => {
    return affairs.filter((a) => {
      if (module !== "全部" && !a.modules.includes(module)) return false;
      if (month !== "全部" && monthKey(a.date) !== month) return false;
      if (q.trim()) {
        const hay = `${a.title} ${a.summary} ${a.examTips || ""} ${a.source}`;
        if (!hay.includes(q.trim())) return false;
      }
      return true;
    });
  }, [affairs, module, month, q]);

  const weekItems = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 14 * 24 * 3600 * 1000;
    const recent = affairs.filter((a) => {
      const t = new Date(a.publishedAt || a.date).getTime();
      return Number.isFinite(t) && t >= weekAgo;
    });
    return (recent.length ? recent : affairs).slice(0, 5);
  }, [affairs]);

  const sortedAnn = useMemo(
    () =>
      [...anniversaries].sort((a, b) => {
        const rank = (x: Anniversary) =>
          x.importance === "核心" ? 0 : x.importance === "重点" ? 1 : 2;
        return rank(a) - rank(b) || a.year - b.year;
      }),
    [anniversaries]
  );

  const annById = useMemo(() => {
    const m = new Map<string, Anniversary>();
    anniversaries.forEach((a) => m.set(a.id, a));
    return m;
  }, [anniversaries]);

  const verifiedLabel = syncMeta.lastVerifiedAt
    ? new Date(syncMeta.lastVerifiedAt).toLocaleString("zh-CN", {
        timeZone: "Asia/Shanghai",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <section className="pb-8 pt-10">
        <div className="card overflow-hidden">
          <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_1fr] md:p-8">
            <div>
              <p className="text-sm font-medium text-red-700">2026 考研政治专项</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                考研政治 · 时政月鉴
              </h1>
              <p className="prose-cn mt-3 max-w-xl text-slate-600">
                汇集近 24
                小时权威时政与重大周年节点，按史纲 / 毛中特 / 思修 / 形策 /
                习思想筛选。站点以 JSON
                文件持久化；GitHub Actions 每日同步后部署到同一 Pages URL，运行时不依赖大模型。
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="#week"
                  className="rounded-full bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
                >
                  看本周必看
                </a>
                <a
                  href="#anniversaries"
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-red-300"
                >
                  周年专题
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Metric label="时政条目" value={String(affairs.length)} />
              <Metric label="覆盖月份" value={String(months.length || 1)} />
              <Metric label="周年节点" value={String(anniversaries.length)} />
              <Metric label="今日已核验" value={verifiedLabel || "尚未核验"} />
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <div className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">同步状态</h2>
            <StatusPill status={syncMeta.lastStatus} />
          </div>
          <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-sm text-emerald-900">
            <span className="font-semibold">今日已核验：</span>
            {verifiedLabel ? `${verifiedLabel}（上海）` : "尚未核验 — 请触发同步"}
            <span className="ml-2 text-xs text-emerald-700/80">
              （即使当天无重要新增，每次同步也会刷新此刻度）
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">{syncMeta.lastMessage}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
            <span>近24h有效 {syncMeta.lastFetched} 条</span>
            <span>新增 {syncMeta.lastAdded} 条</span>
            <span>修订 {syncMeta.lastUpdated ?? 0} 条</span>
            <span>跳过过期 {syncMeta.lastSkippedOld ?? 0} 条</span>
            {syncMeta.lastSyncAt && (
              <span>
                同步时间{" "}
                {new Date(syncMeta.lastSyncAt).toLocaleString("zh-CN", {
                  timeZone: "Asia/Shanghai",
                })}{" "}
                （上海）
              </span>
            )}
          </div>
          {syncMeta.feeds?.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-slate-500">
              {syncMeta.feeds.map((f) => (
                <li key={f.url}>
                  <span className={f.ok ? "text-emerald-600" : "text-rose-600"}>
                    {f.ok ? "✓" : "✗"}
                  </span>{" "}
                  {f.url} — {f.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section id="week" className="mb-10 scroll-mt-20">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">本周必看</h2>
            <p className="mt-1 text-sm text-slate-500">
              同步后按发布时间自动刷新；优先展示近两周时政
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {weekItems.map((a) => (
            <article key={a.id} className="card p-5">
              <div className="flex flex-wrap gap-2">
                {a.modules.map((m) => (
                  <span key={m} className="badge badge-mod">
                    {m}
                  </span>
                ))}
              </div>
              <h3 className="mt-3 text-lg font-semibold leading-snug">{a.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-slate-600">{a.summary}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>
                  {a.date} · {a.source}
                </span>
                {a.sourceUrl && (
                  <a
                    href={a.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    来源
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="anniversaries" className="mb-10 scroll-mt-20">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">2026考研周年专题</h2>
          <p className="mt-1 text-sm text-slate-500">
            核心 / 重点节点 · 知识点 · 考查关联 · 联动复习
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedAnn.map((ann) => (
            <article key={ann.id} className="card flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-slate-400">{ann.year} 年</p>
                  <h3 className="mt-1 text-lg font-bold">{ann.title}</h3>
                </div>
                <span
                  className={`badge ${
                    ann.importance === "核心" ? "badge-core" : "badge-focus"
                  }`}
                >
                  {ann.importance}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {ann.modules.map((m) => (
                  <span key={m} className="badge badge-mod">
                    {m}
                  </span>
                ))}
              </div>
              <p className="prose-cn mt-3 text-sm text-slate-600">{ann.summary}</p>
              <div className="mt-3">
                <p className="text-xs font-semibold text-slate-500">对应知识点</p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-slate-700">
                  {ann.knowledgePoints.map((k) => (
                    <li key={k}>{k}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
                <p className="font-semibold text-slate-700">考查关联</p>
                <p className="mt-1 text-slate-600">{ann.examRelation}</p>
              </div>
              {ann.linkage && (
                <div className="mt-2 rounded-lg border border-amber-100 bg-amber-50/60 p-3 text-sm">
                  <p className="font-semibold text-amber-800">联动</p>
                  <p className="mt-1 text-amber-900/80">{ann.linkage}</p>
                </div>
              )}
              {ann.officialUrl && (
                <a
                  href={ann.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-auto pt-4 text-sm text-blue-600 hover:underline"
                >
                  权威参考链接 →
                </a>
              )}
            </article>
          ))}
        </div>
      </section>

      <section id="affairs" className="scroll-mt-20">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">时政速览</h2>
          <p className="mt-1 text-sm text-slate-500">
            模块筛选 · 月份 · 搜索 · 展开看答题提示与周年联动
          </p>
        </div>

        <div className="card mb-4 space-y-3 p-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`chip ${module === "全部" ? "active" : ""}`}
              onClick={() => setModule("全部")}
            >
              全部模块
            </button>
            {MODULE_TAGS.map((m) => (
              <button
                key={m}
                type="button"
                className={`chip ${module === m ? "active" : ""}`}
                onClick={() => setModule(m)}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`chip ${month === "全部" ? "active" : ""}`}
              onClick={() => setMonth("全部")}
            >
              全部月份
            </button>
            {months.map((m) => (
              <button
                key={m}
                type="button"
                className={`chip ${month === m ? "active" : ""}`}
                onClick={() => setMonth(m)}
              >
                {m}
              </button>
            ))}
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索标题 / 摘要 / 考点提示…"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none ring-red-200 focus:ring-2"
          />
        </div>

        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="card p-8 text-center text-slate-500">
              暂无匹配条目。可调整筛选，或在管理后台同步 / 新增。
            </div>
          )}
          {filtered.map((a) => {
            const open = expanded === a.id;
            return (
              <article key={a.id} className="card overflow-hidden">
                <button
                  type="button"
                  className="flex w-full flex-col gap-3 p-5 text-left hover:bg-slate-50/60 md:flex-row"
                  onClick={() => setExpanded(open ? null : a.id)}
                >
                  {a.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaUrl(a.imageUrl)}
                      alt=""
                      className="h-28 w-full rounded-lg object-cover md:h-24 md:w-36"
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-1.5">
                      {a.modules.map((m) => (
                        <span key={m} className="badge badge-mod">
                          {m}
                        </span>
                      ))}
                    </div>
                    <h3 className="mt-2 text-lg font-semibold">{a.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                      {a.summary}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {a.date} · {a.source} · 点击展开答题可用表述
                    </p>
                  </div>
                </button>
                {open && (
                  <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-4">
                    <p className="text-sm font-semibold text-slate-700">
                      答题可用表述
                    </p>
                    {(() => {
                      const tips = parseExamTipBullets(a.examTips);
                      if (tips.length === 0) {
                        return (
                          <p className="prose-cn mt-1 text-sm text-slate-600">
                            暂无提示，建议结合教材章节与领导人重要讲话原文。
                          </p>
                        );
                      }
                      return (
                        <ul className="mt-2 space-y-2">
                          {tips.map((tip) => (
                            <li
                              key={tip}
                              className="flex gap-2 rounded-lg border border-red-100 bg-white px-3 py-2 text-sm leading-relaxed text-slate-700"
                            >
                              <span className="mt-0.5 shrink-0 font-bold text-red-700">
                                ·
                              </span>
                              <span className="prose-cn">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    })()}
                    {a.anniversaryIds && a.anniversaryIds.length > 0 && (
                      <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50/70 p-3">
                        <p className="text-sm font-semibold text-amber-900">
                          周年联动
                        </p>
                        <ul className="mt-1 space-y-1 text-sm text-amber-950/80">
                          {a.anniversaryIds.map((id) => {
                            const ann = annById.get(id);
                            return (
                              <li key={id}>
                                {ann
                                  ? `${ann.year} · ${ann.title}（${ann.importance}）`
                                  : id}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    {a.sourceUrl && (
                      <a
                        href={a.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block text-sm text-blue-600 hover:underline"
                      >
                        查看来源原文 →
                      </a>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`rounded-xl bg-slate-50 p-4 ${className}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 break-all text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: SyncMeta["lastStatus"] }) {
  const map = {
    ok: "bg-emerald-50 text-emerald-700 border-emerald-200",
    error: "bg-rose-50 text-rose-700 border-rose-200",
    never: "bg-slate-50 text-slate-600 border-slate-200",
  } as const;
  const label = { ok: "正常", error: "异常", never: "未同步" } as const;
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${map[status]}`}
    >
      {label[status]}
    </span>
  );
}
