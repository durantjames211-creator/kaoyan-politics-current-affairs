import type { Anniversary, ModuleTag } from "./types";

/** Weighted keyword: prefer long/specific phrases; avoid bare ambiguous tokens. */
interface WeightedKw {
  kw: string;
  w: number;
}

/**
 * Priority-aware module rules.
 * Higher weight = stronger evidence. Weak words alone should not flip a tag.
 */
const RULES: Record<ModuleTag, WeightedKw[]> = {
  习思想: [
    { kw: "习近平新时代中国特色社会主义思想", w: 12 },
    { kw: "习近平", w: 10 },
    { kw: "习近平总书记", w: 11 },
    { kw: "总书记", w: 8 },
    { kw: "中国式现代化", w: 10 },
    { kw: "两个确立", w: 11 },
    { kw: "两个维护", w: 10 },
    { kw: "二十届三中全会", w: 9 },
    { kw: "党的二十大", w: 9 },
    { kw: "二十大", w: 8 },
    { kw: "新发展理念", w: 8 },
    { kw: "人类命运共同体", w: 9 },
    { kw: "全面从严治党", w: 9 },
    { kw: "自我革命", w: 8 },
    { kw: "全过程人民民主", w: 8 },
    { kw: "新质生产力", w: 7 },
    { kw: "绿水青山就是金山银山", w: 8 },
    { kw: "共同富裕", w: 6 },
    { kw: "意识形态工作", w: 7 },
    { kw: "总体国家安全观", w: 8 },
    { kw: "生态文明建设", w: 6 },
    { kw: "党的建设", w: 6 },
    { kw: "全面深化改革", w: 6 },
    { kw: "高质量发展", w: 4 }, // shared; alone is weak for 习思想
  ],
  史纲: [
    { kw: "辛亥革命", w: 11 },
    { kw: "武昌起义", w: 10 },
    { kw: "五四运动", w: 10 },
    { kw: "中国共产党成立", w: 11 },
    { kw: "中共一大", w: 10 },
    { kw: "北伐战争", w: 9 },
    { kw: "九一八事变", w: 10 },
    { kw: "九一八", w: 8 },
    { kw: "长征胜利", w: 11 },
    { kw: "长征精神", w: 10 },
    { kw: "遵义会议", w: 10 },
    { kw: "西安事变", w: 10 },
    { kw: "抗日战争", w: 9 },
    { kw: "抗战胜利", w: 9 },
    { kw: "解放战争", w: 9 },
    { kw: "开国大典", w: 10 },
    { kw: "中华人民共和国成立", w: 11 },
    { kw: "新中国成立", w: 9 },
    { kw: "十一届三中全会", w: 10 },
    { kw: "社会主义改造", w: 9 },
    { kw: "三大改造", w: 9 },
    { kw: "中共八大", w: 8 },
    { kw: "历史决议", w: 8 },
    { kw: "近代史", w: 8 },
    { kw: "党史学习", w: 7 },
    { kw: "党史教育", w: 7 },
    { kw: "建党精神", w: 8 },
    { kw: "建军节", w: 6 },
    { kw: "南昌起义", w: 9 },
    { kw: "秋收起义", w: 9 },
    { kw: "红军长征", w: 10 },
    { kw: "纪念长征", w: 9 },
    { kw: "抗日民族统一战线", w: 9 },
    { kw: "新民主主义革命", w: 9 },
    { kw: "旧民主主义革命", w: 8 },
    { kw: "鸦片战争", w: 8 },
    { kw: "甲午战争", w: 8 },
    { kw: "辛亥革命", w: 11 },
    { kw: "殖民真相", w: 6 },
    { kw: "捍卫历史正义", w: 7 },
    // Avoid bare: 革命 / 历史 / 纪念 / 百年 / 建国
  ],
  毛中特: [
    { kw: "中国特色社会主义", w: 10 },
    { kw: "改革开放", w: 9 },
    { kw: "社会主义基本制度", w: 9 },
    { kw: "社会主义市场经济", w: 8 },
    { kw: "社会主义初级阶段", w: 9 },
    { kw: "马克思主义中国化", w: 9 },
    { kw: "毛泽东思想", w: 9 },
    { kw: "邓小平理论", w: 9 },
    { kw: "三个代表", w: 8 },
    { kw: "科学发展观", w: 8 },
    { kw: "理论体系", w: 7 },
    { kw: "乡村振兴", w: 6 },
    { kw: "共同富裕", w: 6 },
    { kw: "新质生产力", w: 6 },
    { kw: "高质量发展", w: 5 },
    { kw: "全国两会", w: 7 },
    { kw: "两会精神", w: 7 },
    { kw: "五年规划", w: 7 },
    { kw: "十四五", w: 6 },
    { kw: "十五五", w: 6 },
    { kw: "中国式现代化", w: 5 }, // primarily 习思想; weak support here
    { kw: "公有制", w: 7 },
    { kw: "基本经济制度", w: 8 },
  ],
  思修: [
    { kw: "社会主义核心价值观", w: 10 },
    { kw: "爱国主义教育", w: 10 },
    { kw: "爱国主义", w: 8 },
    { kw: "理想信念", w: 8 },
    { kw: "思想道德", w: 9 },
    { kw: "道德建设", w: 8 },
    { kw: "法治教育", w: 8 },
    { kw: "依法治国", w: 7 },
    { kw: "青年教育", w: 7 },
    { kw: "时代新人", w: 8 },
    { kw: "志愿服务", w: 7 },
    { kw: "诚信建设", w: 7 },
    { kw: "英雄烈士", w: 8 },
    { kw: "崇尚英雄", w: 8 },
    { kw: "教育家精神", w: 8 },
    { kw: "师德师风", w: 7 },
    { kw: "教师节", w: 6 },
    { kw: "公民道德", w: 8 },
    { kw: "网络文明", w: 6 },
    { kw: "法治中国", w: 7 },
    { kw: "宪法宣誓", w: 7 },
    { kw: "真善美", w: 6 },
    // Avoid bare: 青年 / 道德 / 法治 / 文明 / 英雄
  ],
  形策: [
    { kw: "外交政策", w: 9 },
    { kw: "中国外交", w: 9 },
    { kw: "周边外交", w: 8 },
    { kw: "多边主义", w: 8 },
    { kw: "联合国大会", w: 8 },
    { kw: "联合国", w: 5 },
    { kw: "一带一路", w: 8 },
    { kw: "中美关系", w: 8 },
    { kw: "中俄", w: 6 },
    { kw: "中非合作", w: 8 },
    { kw: "南南合作", w: 8 },
    { kw: "亚太经合", w: 8 },
    { kw: "APEC", w: 7 },
    { kw: "峰会", w: 4 },
    { kw: "经贸合作", w: 7 },
    { kw: "全球治理", w: 8 },
    { kw: "中央经济工作会议", w: 9 },
    { kw: "国务院常务会议", w: 8 },
    { kw: "宏观调控", w: 7 },
    { kw: "稳就业", w: 6 },
    { kw: "扩大内需", w: 6 },
    { kw: "对外贸易", w: 6 },
    { kw: "国家安全战略", w: 7 },
    { kw: "和平共处五项原则", w: 9 },
    { kw: "构建人类命运共同体", w: 7 },
    { kw: "国际秩序", w: 6 },
    { kw: "国际局势", w: 5 },
    { kw: "重大外交", w: 8 },
  ],
};

/** Clearly non-exam fluff: entertainment / crime-abroad / local accidents without policy frame. */
const FLUFF_RES: RegExp[] = [
  /甜品店|短视频带货|虚拟.?专家|识破.*骗局/,
  /起火致\d+死|\d+死\d+伤.*纵火|纵火可能/,
  /泥石流已致|积水点已经|防汛.级应急响应/,
  /音乐剧精彩上演|读画|画中真意|乡见/,
  /明星|演唱会|综艺|追剧|八卦/,
  /足球赛|篮球联赛|中超|英超/,
];

const SCORE_THRESHOLD = 6; // below → do not tag that module
const SECONDARY_GAP = 3; // secondary tag only if within this of top score
const MAX_TAGS = 2; // prefer 1–2; avoid wrong multi-tags

/**
 * Longest-match, each keyword at most once per field.
 * Prevents「习近平总书记」stacking with 习近平/总书记, and repeated quotes in body.
 */
function scoreTextForModule(
  text: string,
  rules: WeightedKw[],
  weightMul: number
): number {
  if (!text) return 0;
  const sorted = [...rules].sort((a, b) => b.kw.length - a.kw.length);
  const covered: [number, number][] = [];
  const usedKw = new Set<string>();
  let score = 0;
  for (const { kw, w } of sorted) {
    if (usedKw.has(kw)) continue;
    const idx = text.indexOf(kw);
    if (idx < 0) continue;
    const end = idx + kw.length;
    const overlaps = covered.some(([s, e]) => idx < e && end > s);
    if (overlaps) continue;
    covered.push([idx, end]);
    usedKw.add(kw);
    score += Math.max(1, Math.round(w * weightMul));
  }
  return score;
}

function scoreModules(title: string, summary: string): Map<ModuleTag, number> {
  const scores = new Map<ModuleTag, number>();
  for (const mod of Object.keys(RULES) as ModuleTag[]) {
    const rules = RULES[mod];
    // Title full weight; summary ~40% to dampen RSS body / 版面附带表述
    const score =
      scoreTextForModule(title, rules, 1) +
      scoreTextForModule(summary, rules, 0.4);
    if (score > 0) scores.set(mod, score);
  }
  return scores;
}

export function isExamRelevant(title: string, summary = ""): boolean {
  const text = `${title} ${summary}`;
  if (!text.trim()) return false;
  if (FLUFF_RES.some((re) => re.test(text))) return false;
  const scores = scoreModules(title, summary);
  let max = 0;
  for (const v of scores.values()) max = Math.max(max, v);
  if (max >= SCORE_THRESHOLD) return true;
  const soft =
    /党中央|国务院|外交部|发布会|公报|决议|讲话|调研|考察|会见|签署|协定|白皮书/.test(
      title
    );
  return soft;
}

/**
 * Stricter auto-tagging: scored rules + priority.
 * Pass title+summary when possible so boilerplate in RSS bodies does not over-tag.
 * Uncertain → [] (empty) rather than wrong default 形策 / multi-tags.
 */
export function tagModules(titleOrText: string, summary = ""): ModuleTag[] {
  // Backward compatible: single-arg treats whole string as title-weighted text
  const title = summary ? titleOrText : titleOrText;
  const body = summary ? summary : "";
  const text = `${title} ${body}`;
  if (!text.trim()) return [];
  if (FLUFF_RES.some((re) => re.test(text))) return [];

  const scores = scoreModules(title, body);
  const ranked = [...scores.entries()]
    .filter(([, s]) => s >= SCORE_THRESHOLD)
    .sort((a, b) => b[1] - a[1]);

  if (ranked.length === 0) return [];

  const [topMod, topScore] = ranked[0];
  const tags: ModuleTag[] = [topMod];

  for (const [mod, s] of ranked.slice(1)) {
    if (tags.length >= MAX_TAGS) break;
    if (topScore - s > SECONDARY_GAP) break;
    if (s < SCORE_THRESHOLD + 1 && mod !== "习思想") continue;
    tags.push(mod);
  }

  // Prefer 习思想 as primary only when it actually clears threshold (usually title hit)
  const xi = scores.get("习思想") ?? 0;
  if (xi >= SCORE_THRESHOLD && tags[0] !== "习思想" && xi >= topScore - 1) {
    const reordered: ModuleTag[] = [
      "习思想",
      ...tags.filter((x) => x !== "习思想"),
    ];
    return reordered.slice(0, MAX_TAGS);
  }

  return tags;
}

/** Module-specific memorizable 规范表述 seeds */
const MODULE_TIP_BANK: Record<ModuleTag, string[]> = {
  习思想: [
    "坚持以习近平新时代中国特色社会主义思想为指导，深刻领悟「两个确立」的决定性意义，坚决做到「两个维护」。",
    "以中国式现代化全面推进中华民族伟大复兴，完整准确全面贯彻新发展理念。",
    "推进党的自我革命，全面从严治党，把党的领导贯穿党和国家事业各领域各方面。",
  ],
  史纲: [
    "近代以来中华民族从苦难走向辉煌，中国共产党的领导是历史和人民的选择。",
    "把历史事件放在民族独立、人民解放与国家富强的主线中把握其地位与意义。",
    "弘扬伟大建党精神与革命精神谱系，做到学史明理、学史增信、学史崇德、学史力行。",
  ],
  毛中特: [
    "坚持中国特色社会主义道路、理论、制度、文化，不断推进马克思主义中国化时代化。",
    "改革开放是决定当代中国命运的关键一招，要统筹质的有效提升和量的合理增长。",
    "坚持和完善社会主义基本经济制度，推动高质量发展与共同富裕取得更为明显的实质性进展。",
  ],
  思修: [
    "培育和践行社会主义核心价值观，厚植爱国主义情怀，坚定理想信念。",
    "把道德修养与法治素养统一起来，做到明大德、守公德、严私德。",
    "青年要勇做新时代的奋斗者，在奉献祖国、服务人民中实现人生价值。",
  ],
  形策: [
    "统筹国内国际两个大局，坚定奉行独立自主的和平外交政策。",
    "推动构建人类命运共同体，践行真正的多边主义，深化「一带一路」国际合作。",
    "坚持稳中求进工作总基调，完整准确全面贯彻新发展理念，扎实推动高质量发展。",
  ],
};

function pickTipsForModules(modules: ModuleTag[], n: number): string[] {
  const out: string[] = [];
  for (const m of modules) {
    const bank = MODULE_TIP_BANK[m];
    if (bank?.[0] && !out.includes(bank[0])) out.push(bank[0]);
    if (out.length >= n) break;
  }
  // fill from first module's bank
  if (modules[0]) {
    for (const t of MODULE_TIP_BANK[modules[0]]) {
      if (out.length >= n) break;
      if (!out.includes(t)) out.push(t);
    }
  }
  return out.slice(0, n);
}

function tipFromAnniversary(ann: {
  title: string;
  knowledgePoints?: string[];
  examRelation?: string;
}): string {
  const kp = ann.knowledgePoints?.[0];
  if (kp) {
    return `可联动「${ann.title}」：${kp.replace(/[。；;]+$/, "")}。`;
  }
  if (ann.examRelation) {
    return `可联动「${ann.title}」：${ann.examRelation.replace(/[。；;]+$/, "").slice(0, 48)}。`;
  }
  return `可联动「${ann.title}」周年专题，对照教材考点作规范表述。`;
}

/**
 * 2–3 short, memorizable Chinese bullets (规范表述), joined by newlines.
 * Links anniversary themes when matched.
 */
export function buildExamTips(
  modules: ModuleTag[],
  anniversaryTitles: string[],
  opts?: {
    title?: string;
    summary?: string;
    anniversaries?: Pick<
      Anniversary,
      "title" | "knowledgePoints" | "examRelation"
    >[];
  }
): string {
  const bullets: string[] = [];
  const anns = opts?.anniversaries?.length
    ? opts.anniversaries
    : anniversaryTitles.map((title) => ({ title }));

  // Anniversary-linked tips first (max 1–2)
  for (const ann of anns.slice(0, 2)) {
    const tip = tipFromAnniversary(ann);
    if (!bullets.includes(tip)) bullets.push(tip);
  }

  const GENERIC_TIPS = [
    "提炼材料中的政策主题词与价值导向，对照教材原理作规范表述，避免堆砌细节。",
    "答题宜点明党的领导与人民立场，结合权威报道关键词作答。",
    "若与周年节点相关，优先联动史纲/习思想既有考点作对比分析。",
  ];

  const need = Math.max(2, Math.min(3, 2 + (anns.length > 0 ? 1 : 0))) - bullets.length;
  const modTips = modules.length
    ? pickTipsForModules(modules, Math.max(need, 2))
    : GENERIC_TIPS;
  for (const t of modTips) {
    if (bullets.length >= 3) break;
    if (!bullets.includes(t)) bullets.push(t);
  }

  // Ensure 2–3
  for (const t of GENERIC_TIPS) {
    if (bullets.length >= 2) break;
    if (!bullets.includes(t)) bullets.push(t);
  }

  return bullets
    .slice(0, 3)
    .map((b) => (b.startsWith("·") || b.startsWith("•") ? b : `· ${b}`))
    .join("\n");
}

export function matchAnniversaries(
  text: string,
  anniversaries: Anniversary[]
): Anniversary[] {
  // Prefer title+keywords; knowledge points only if reasonably specific (>=6 chars)
  return anniversaries.filter((ann) => {
    const primary = [ann.title, ...(ann.keywords || [])].filter(Boolean) as string[];
    const secondary = ann.knowledgePoints
      .filter((k) => k && k.length >= 6)
      .slice(0, 2);
    const keys = [...primary, ...secondary];
    return keys.some((k) => {
      if (!k || k.length < 2) return false;
      // Short keys (≤2) are too ambiguous for body-only hits (e.g.「中非」in random Africa news)
      if (k.length <= 2) return false;
      return text.includes(k);
    });
  });
}

/** Parse stored examTips into bullet lines for UI. */
export function parseExamTipBullets(examTips?: string): string[] {
  if (!examTips?.trim()) return [];
  return examTips
    .split(/\n+/)
    .map((l) => l.replace(/^[·•\-\*\d.、]+\s*/, "").trim())
    .filter(Boolean);
}
