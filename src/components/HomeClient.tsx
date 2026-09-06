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

const TARGET_YEAR = 2026;

function monthKey(date: string) {
  return date.slice(0, 7);
}

function dayPart(date: string) {
  const parts = date.split("-");
  return parts[2] || date;
}

function monthPart(date: string) {
  const parts = date.split("-");
  return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : date;
}

function anniversaryYears(year: number) {
  return TARGET_YEAR - year;
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
  const [annScope, setAnnScope] = useState<"核心" | "全部">("核心");

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

  const visibleAnn = useMemo(() => {
    if (annScope === "全部") return sortedAnn;
    return sortedAnn.filter((a) => a.importance === "核心");
  }, [sortedAnn, annScope]);

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

  const metricVerified = verifiedLabel
    ? verifiedLabel.replace(/\//g, ".").slice(0, 10)
    : "—";

  const syncTitle =
    syncMeta.lastStatus === "ok"
      ? verifiedLabel
        ? `今日已核验 · ${verifiedLabel}（上海）`
        : "同步正常"
      : syncMeta.lastStatus === "error"
        ? "同步异常，请检查源站或 Actions"
        : "等待首次自动核验";

  const syncDotClass =
    syncMeta.lastStatus === "ok"
      ? "sync-dot"
      : syncMeta.lastStatus === "error"
        ? "sync-dot error"
        : "sync-dot warn";

  return (
    <>
      <header className="hero" aria-label="站点导语">
        <div className="hero-copy">
          <p className="eyebrow">CURRENT AFFAIRS ARCHIVE</p>
          <h1>
            把每天的时政，
            <br />
            <em>沉淀成可检索的脉络。</em>
          </h1>
          <p className="hero-intro">
            汇集近 24 小时权威时政与重大周年节点，按史纲 / 毛中特 / 思修 / 形策 /
            习思想筛选。站点以 JSON
            文件持久化；GitHub Actions 每日同步后部署到同一 Pages
            URL，运行时不依赖大模型。
          </p>
          <div className="hero-actions">
            <a href="#week" className="btn-primary">
              看本周必看
            </a>
            <a href="#anniversaries" className="btn-ghost">
              周年专题
            </a>
            <a href="#affairs" className="btn-ghost">
              时政速览
            </a>
          </div>
        </div>
        <div className="metrics" aria-label="资料库统计">
          <div className="metric-tile">
            <strong>{affairs.length}</strong>
            <span>条已核验</span>
          </div>
          <div className="metric-tile">
            <strong>{months.length || 1}</strong>
            <span>个月份</span>
          </div>
          <div className="metric-tile">
            <strong>{anniversaries.length}</strong>
            <span>周年节点</span>
          </div>
          <div className="metric-tile">
            <strong style={{ fontSize: verifiedLabel ? 15 : 26 }}>
              {metricVerified}
            </strong>
            <span>最近核验</span>
          </div>
        </div>
      </header>

      <section className="sync-panel" aria-label="自动更新状态">
        <div className="sync-panel-main">
          <span className={syncDotClass} aria-hidden />
          <p>
            <b>{syncTitle}</b>
            <small>
              {syncMeta.lastMessage ||
                "每日核验后即使没有新增，也会同步刷新网页状态。"}
            </small>
          </p>
        </div>
        <ul className="sync-stats">
          <li>
            <strong>{syncMeta.lastFetched}</strong>
            <span>近24h有效</span>
          </li>
          <li>
            <strong>{syncMeta.lastAdded}</strong>
            <span>新增条目</span>
          </li>
          <li>
            <strong>{syncMeta.lastUpdated ?? 0}</strong>
            <span>修订条目</span>
          </li>
          <li>
            <strong>{weekItems.length}</strong>
            <span>本周重点</span>
          </li>
        </ul>
      </section>
      {syncMeta.feeds?.length > 0 && (
        <ul className="sync-feeds">
          {syncMeta.feeds.map((f) => (
            <li key={f.url}>
              <span className={f.ok ? "ok" : "bad"}>{f.ok ? "✓" : "✗"}</span>{" "}
              {f.url} — {f.message}
            </li>
          ))}
        </ul>
      )}

      <section id="week" className="section scroll-mt-20">
        <div className="section-head">
          <div>
            <p className="eyebrow">WEEKLY ESSENTIALS</p>
            <h2>本周必看</h2>
          </div>
          <span className="section-aside">最近两周 · 核心时政精选</span>
        </div>
        {weekItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-seal">政</div>
            <h3>正在整理本周重点…</h3>
            <p>同步完成后将按发布时间自动刷新。</p>
          </div>
        ) : (
          <div className="weekly-grid">
            {weekItems.map((a, i) => (
              <article key={a.id} className="weekly-card">
                <div className="weekly-rank" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="weekly-meta">
                  {a.modules.slice(0, 2).map((m) => (
                    <span key={m} className="badge badge-mod">
                      {m}
                    </span>
                  ))}
                  <span style={{ marginLeft: "auto" }}>
                    {a.date} · {a.source}
                  </span>
                </div>
                <h3>{a.title}</h3>
                <p className="line-clamp-4">{a.summary}</p>
                {a.sourceUrl && (
                  <a
                    href={a.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="link-out"
                  >
                    查看来源 ↗
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="anniversaries" className="section scroll-mt-20">
        <div className="section-head">
          <div>
            <p className="eyebrow">2026 ANNIVERSARIES</p>
            <h2>2026考研周年专题</h2>
          </div>
          <span className="section-aside">
            逢5逢10重要节点 · 直接对应教材知识点
          </span>
        </div>
        <div className="note-panel">
          <b>复习说明</b>
          <p>
            周年不等于必考。本专题按照教材地位、周年整数程度分为「核心、重点」，优先掌握核心节点；联动栏提示与时政条目的复习衔接。
          </p>
        </div>
        <div className="ann-controls" role="group" aria-label="周年专题显示范围">
          <button
            type="button"
            className={`chip chip-ink ${annScope === "核心" ? "active" : ""}`}
            onClick={() => setAnnScope("核心")}
          >
            核心优先
          </button>
          <button
            type="button"
            className={`chip chip-ink ${annScope === "全部" ? "active" : ""}`}
            onClick={() => setAnnScope("全部")}
          >
            全部节点
          </button>
          <span className="count">{visibleAnn.length} 个周年节点</span>
        </div>
        <div className="anniversary-grid">
          {visibleAnn.map((ann) => (
            <article key={ann.id} className="anniversary-card">
              <div className="anniversary-year">
                <strong>{ann.year}</strong>
                <span>
                  → {TARGET_YEAR} · {anniversaryYears(ann.year)}周年
                </span>
                <b
                  className={`imp badge ${
                    ann.importance === "核心"
                      ? "badge-core"
                      : ann.importance === "重点"
                        ? "badge-focus"
                        : "badge-know"
                  }`}
                >
                  {ann.importance}
                </b>
              </div>
              <h3>{ann.title}</h3>
              <div className="anniversary-modules">
                {ann.modules.map((m) => (
                  <span key={m} className="badge badge-mod">
                    {m}
                  </span>
                ))}
              </div>
              <p className="anniversary-summary">{ann.summary}</p>
              <div className="knowledge-points">
                <b>对应知识点</b>
                <ul>
                  {ann.knowledgePoints.map((k) => (
                    <li key={k}>{k}</li>
                  ))}
                </ul>
              </div>
              <div className="anniversary-angle">
                <b>考查关联</b>
                <p>{ann.examRelation}</p>
              </div>
              {ann.linkage && (
                <div className="anniversary-linkage">
                  <b>2026 复习联动</b>
                  {ann.linkage}
                </div>
              )}
              {ann.officialUrl && (
                <a href={ann.officialUrl} target="_blank" rel="noreferrer">
                  核验权威资料 ↗
                </a>
              )}
            </article>
          ))}
        </div>
      </section>

      <section id="affairs" className="workspace scroll-mt-20">
        <div className="section-head" style={{ marginBottom: 24 }}>
          <div>
            <p className="eyebrow">CURRENT AFFAIRS</p>
            <h2>时政速览</h2>
          </div>
          <span className="section-aside">
            模块筛选 · 月份 · 搜索 · 展开看答题提示
          </span>
        </div>

        <div className="filter-panel">
          <div className="search-box">
            <span className="search-icon" aria-hidden>
              搜
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索标题 / 摘要 / 考点提示…"
              aria-label="搜索时政"
            />
          </div>
          <div className="chip-row">
            <span className="chip-row-label">MODULE</span>
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
          <div className="chip-row">
            <span className="chip-row-label">MONTH</span>
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
        </div>

        <div className="section-head" style={{ marginTop: 48, marginBottom: 8 }}>
          <div>
            <p className="eyebrow">ARCHIVE</p>
            <h2 style={{ fontSize: 28 }}>检索结果</h2>
          </div>
          <span className="section-aside">{filtered.length} 条</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-seal">政</div>
            <h3>暂无匹配条目</h3>
            <p>可调整筛选，或在管理后台同步 / 新增。</p>
          </div>
        ) : (
          <div className="event-list">
            {filtered.map((a) => {
              const open = expanded === a.id;
              return (
                <article key={a.id} className="event-card">
                  <div className="event-date">
                    <strong>{dayPart(a.date)}</strong>
                    <span>{monthPart(a.date)}</span>
                  </div>
                  <div className="event-body-wrap">
                    <div className="event-accent" aria-hidden />
                    <div className="event-body" style={{ flex: 1, minWidth: 0 }}>
                      <button
                        type="button"
                        className="event-toggle-btn"
                        onClick={() => setExpanded(open ? null : a.id)}
                        aria-expanded={open}
                      >
                        {a.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={mediaUrl(a.imageUrl)}
                            alt=""
                            className="event-thumb"
                          />
                        ) : null}
                        <div className="event-meta">
                          {a.modules.map((m) => (
                            <span key={m} className="badge badge-mod">
                              {m}
                            </span>
                          ))}
                          <span>
                            {a.source}
                            {open ? " · 收起提示" : " · 展开答题可用表述"}
                          </span>
                        </div>
                        <h3>{a.title}</h3>
                        <p className={open ? undefined : "line-clamp-2"}>
                          {a.summary}
                        </p>
                      </button>
                      {open && (
                        <div className="event-extra">
                          <div className="answer-material">
                            <b>答题可用表述</b>
                            {(() => {
                              const tips = parseExamTipBullets(a.examTips);
                              if (tips.length === 0) {
                                return (
                                  <p className="prose-cn" style={{ margin: 0, fontSize: 14 }}>
                                    暂无提示，建议结合教材章节与领导人重要讲话原文。
                                  </p>
                                );
                              }
                              return (
                                <ul>
                                  {tips.map((tip) => (
                                    <li key={tip}>{tip}</li>
                                  ))}
                                </ul>
                              );
                            })()}
                          </div>
                          {a.anniversaryIds && a.anniversaryIds.length > 0 && (
                            <div className="ann-link-box">
                              <b>周年联动</b>
                              <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
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
                              className="event-source"
                            >
                              查看来源原文 →
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
