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

/** Official 考研政治口径 formulations keyed by content themes (not news-summary). */
interface ThemeTipRule {
  id: string;
  /** Match title+summary; longer/more specific patterns preferred via priority. */
  re: RegExp;
  tips: string[];
  priority: number;
}

/**
 * Content-aware tip bank: only emit when the affair text actually hits the theme.
 * Phrasing follows textbook / model-answer 规范表述.
 */
const THEME_TIP_RULES: ThemeTipRule[] = [
  {
    id: "xi-guide",
    re: /习近平新时代中国特色社会主义思想|习近平总书记|两个确立|两个维护|重要讲话精神/,
    tips: [
      "坚持以习近平新时代中国特色社会主义思想为指导，深刻领悟「两个确立」的决定性意义，坚决做到「两个维护」。",
      "把党的创新理论转化为坚定理想、锤炼党性和指导实践、推动工作的强大力量。",
    ],
    priority: 100,
  },
  {
    id: "two-combines",
    re: /两个结合|马克思主义基本原理|中华优秀传统文化|马克思主义中国化/,
    tips: [
      "把马克思主义基本原理同中国具体实际相结合、同中华优秀传统文化相结合，不断推进马克思主义中国化时代化。",
      "坚持中国特色社会主义道路、理论、制度、文化，用党的创新理论武装头脑、指导实践。",
    ],
    priority: 95,
  },
  {
    id: "chinese-modernization",
    re: /中国式现代化|民族复兴|强国建设/,
    tips: [
      "以中国式现代化全面推进中华民族伟大复兴，坚持中国共产党领导、坚持中国特色社会主义。",
      "中国式现代化是全体人民共同富裕的现代化，是物质文明和精神文明相协调的现代化。",
    ],
    priority: 92,
  },
  {
    id: "party-self-revolution",
    re: /全面从严治党|自我革命|纪检监察|党风廉政|反腐败/,
    tips: [
      "推进党的自我革命，全面从严治党，永葆党的先进性和纯洁性。",
      "把党的领导贯穿党和国家事业各领域各方面，以党的自我革命引领社会革命。",
    ],
    priority: 90,
  },
  {
    id: "high-quality-development",
    re: /高质量发展|新发展理念|新质生产力|全国两会|两会精神|稳中求进|扩大内需/,
    tips: [
      "完整、准确、全面贯彻新发展理念，加快构建新发展格局，着力推动高质量发展。",
      "把高质量发展作为全面建设社会主义现代化国家的首要任务，以中国式现代化全面推进中华民族伟大复兴。",
      "坚持稳中求进工作总基调，统筹质的有效提升和量的合理增长，更好满足人民日益增长的美好生活需要。",
    ],
    priority: 88,
  },
  {
    id: "people-centered",
    re: /以人民为中心|共同富裕|民生福祉|人民立场/,
    tips: [
      "坚持以人民为中心的发展思想，把实现人民对美好生活的向往作为现代化建设的出发点和落脚点。",
      "推动共同富裕取得更为明显的实质性进展，不断实现发展为了人民、发展依靠人民、发展成果由人民共享。",
    ],
    priority: 86,
  },
  {
    id: "whole-process-democracy",
    re: /全过程人民民主|人民当家作主|人民代表大会|协商民主/,
    tips: [
      "发展全过程人民民主，保障人民当家作主，把民主选举、协商、决策、管理、监督贯通起来。",
      "坚持党的领导、人民当家作主、依法治国有机统一，健全人民当家作主制度体系。",
    ],
    priority: 85,
  },
  {
    id: "belt-road",
    re: /一带一路|丝路|共建「一带一路」|共建"一带一路"|中吉|中老铁路/,
    tips: [
      "高质量共建「一带一路」，坚持共商共建共享，推动互联互通与互利合作。",
      "以共建「一带一路」为实践平台，推动构建人类命运共同体，深化开放合作。",
    ],
    priority: 84,
  },
  {
    id: "community-shared-future",
    re: /人类命运共同体|全球治理|多边主义|国际秩序/,
    tips: [
      "推动构建人类命运共同体，弘扬全人类共同价值，践行真正的多边主义。",
      "积极参与全球治理体系改革和建设，推动建设相互尊重、公平正义、合作共赢的新型国际关系。",
    ],
    priority: 83,
  },
  {
    id: "apec-asia-pacific",
    re: /APEC|亚太经合|亚太合作|亚太媒体|开放.?创新.?合作/,
    tips: [
      "坚持开放的区域主义，推动建设开放型世界经济，促进亚太共同发展繁荣。",
      "统筹国内国际两个大局，以高水平对外开放服务中国式现代化，深化亚太互利合作。",
    ],
    priority: 82,
  },
  {
    id: "major-country-diplomacy",
    re: /中俄|俄罗斯|普京|外交政策|双边机制|会见.*总统|和平共处五项原则|周边外交/,
    tips: [
      "坚定奉行独立自主的和平外交政策，坚持在和平共处五项原则基础上发展同各国友好合作。",
      "推进中国特色大国外交，维护国际公平正义，为世界和平与发展贡献中国智慧和中国方案。",
    ],
    priority: 81,
  },
  {
    id: "africa-south-south",
    re: /中非|非洲国家|南南合作/,
    tips: [
      "秉持真实亲诚理念和正确义利观，深化中非友好合作与南南合作。",
      "推动构建人类命运共同体，支持发展中国家加快发展，促进国际秩序朝着更加公正合理的方向发展。",
    ],
    priority: 80,
  },
  {
    id: "rural-revitalization",
    re: /乡村振兴|乡村致富|产业链|农业|农村|天麻|肉牛|野草药/,
    tips: [
      "全面推进乡村振兴，坚持农业农村优先发展，促进农民农村共同富裕。",
      "完善利益联结机制，发展乡村特色产业，把产业振兴作为乡村振兴的重中之重。",
    ],
    priority: 78,
  },
  {
    id: "eco-civilization",
    re: /生态文明|绿水青山|碳达峰|碳中和|美丽中国|绿色发展/,
    tips: [
      "牢固树立和践行绿水青山就是金山银山的理念，推动经济社会发展绿色化、低碳化。",
      "建设人与自然和谐共生的现代化，协同推进降碳、减污、扩绿、增长。",
    ],
    priority: 77,
  },
  {
    id: "core-values-moral",
    re: /真善美|社会主义核心价值观|思想道德|公民道德|网络文明/,
    tips: [
      "培育和践行社会主义核心价值观，推动形成适应新时代要求的思想观念、精神面貌、文明风尚。",
      "把社会主义核心价值观融入社会发展各方面，做到明大德、守公德、严私德。",
    ],
    priority: 76,
  },
  {
    id: "patriotism-youth",
    re: /爱国主义|时代新人|理想信念|青年教育|英雄烈士|崇尚英雄/,
    tips: [
      "厚植爱国主义情怀，坚定理想信念，把个人理想融入国家和民族的事业之中。",
      "培养担当民族复兴大任的时代新人，在奉献祖国、服务人民中实现人生价值。",
    ],
    priority: 75,
  },
  {
    id: "teacher-education",
    re: /教师节|教育家精神|师德师风|师者|三尺讲台|教书育人/,
    tips: [
      "大力弘扬教育家精神，加强师德师风建设，落实立德树人根本任务。",
      "坚持为党育人、为国育才，培养德智体美劳全面发展的社会主义建设者和接班人。",
    ],
    priority: 74,
  },
  {
    id: "rule-of-law",
    re: /依法治国|法治中国|法治教育|宪法|全面依法治国/,
    tips: [
      "坚持全面依法治国，建设中国特色社会主义法治体系、建设社会主义法治国家。",
      "把法治教育和道德教育结合起来，增强全民法治观念和法治素养。",
    ],
    priority: 73,
  },
  {
    id: "history-justice",
    re: /殖民真相|历史正义|近代史|鸦片战争|甲午战争|辛亥革命/,
    tips: [
      "树立正确的历史观、民族观、国家观、文化观，旗帜鲜明反对历史虚无主义。",
      "把历史事件放在民族独立、人民解放与国家富强的主线中把握其地位与意义。",
    ],
    priority: 72,
  },
  {
    id: "long-march-party-history",
    re: /长征|遵义会议|建党精神|党史学习|党史教育|纪念长征/,
    tips: [
      "弘扬伟大长征精神和伟大建党精神，做到学史明理、学史增信、学史崇德、学史力行。",
      "中国共产党的领导是历史和人民的选择，要把红色资源转化为坚定理想信念的生动教材。",
    ],
    priority: 71,
  },
  {
    id: "reform-opening",
    re: /改革开放|全面深化改革|社会主义市场经济|基本经济制度/,
    tips: [
      "改革开放是决定当代中国命运的关键一招，要坚持和完善社会主义基本经济制度。",
      "进一步全面深化改革，为中国式现代化提供制度保障和动力支撑。",
    ],
    priority: 70,
  },
  {
    id: "manufacturing-innovation",
    re: /中国智造|创新之城|科技创新|新质生产力|制造业/,
    tips: [
      "加快发展新质生产力，坚持创新驱动发展，推动科技自立自强。",
      "以高质量发展为主题，促进实体经济与科技创新深度融合，建设现代化产业体系。",
    ],
    priority: 69,
  },
  {
    id: "security",
    re: /总体国家安全观|国家安全|防灾减灾|应急响应|防汛/,
    tips: [
      "坚持总体国家安全观，统筹发展和安全，提高防范化解重大风险能力。",
      "坚持人民至上、生命至上，把保护人民生命安全和身体健康放在第一位。",
    ],
    priority: 60,
  },
  {
    id: "people-health-humanity",
    re: /人文行医|医学|人民健康|卫生健康/,
    tips: [
      "把保障人民健康放在优先发展的战略位置，推动卫生健康事业高质量发展。",
      "坚持以人民为中心，弘扬敬佑生命、救死扶伤、甘于奉献、大爱无疆的崇高职业精神。",
    ],
    priority: 55,
  },
  {
    id: "opening-opportunity",
    re: /中国机遇|对外开放|高水平开放|全球订单|走向世界/,
    tips: [
      "坚持高水平对外开放，依托我国超大规模市场优势，以国内大循环吸引全球资源要素。",
      "推动建设开放型世界经济，与各国共享中国式现代化发展机遇。",
    ],
    priority: 54,
  },
];

/** Module fallback 规范表述（仅当主题未命中时补位，且仍为书面语口径） */
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
    "改革开放是决定当代中国命运的关键一招，要完整准确全面贯彻新发展理念，推动高质量发展。",
    "坚持和完善社会主义基本经济制度，推动共同富裕取得更为明显的实质性进展。",
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

/** 无模块、弱主题时的书面语兜底（答题口径，非新闻导语/口语） */
const FALLBACK_OFFICIAL_TIPS = [
  "坚持党的领导，发挥中国特色社会主义制度优势，推动相关部署落地见效。",
  "坚持以人民为中心的发展思想，把人民群众满意作为衡量工作成效的根本标准。",
  "坚持实事求是，把马克思主义基本原理同中国具体实际相结合，提高运用科学理论指导实践的能力。",
];

/**
 * Collect official口径 tips matched to content.
 * - Title hits ranked above summary-only hits (avoid RSS body boilerplate).
 * - Round-robin across themes (1st tip each, then 2nd) so one theme cannot monopolize.
 */
function collectThemeTips(title: string, summary: string, limit: number): string[] {
  if (limit <= 0) return [];
  const titleText = title || "";
  const bodyText = summary || "";
  type Hit = ThemeTipRule & { fromTitle: boolean };
  const hits: Hit[] = [];
  for (const rule of THEME_TIP_RULES) {
    const inTitle = titleText.length > 0 && rule.re.test(titleText);
    const inBody = bodyText.length > 0 && rule.re.test(bodyText);
    if (!inTitle && !inBody) continue;
    hits.push({ ...rule, fromTitle: inTitle });
  }
  hits.sort((a, b) => {
    if (a.fromTitle !== b.fromTitle) return a.fromTitle ? -1 : 1;
    return b.priority - a.priority;
  });
  // If title already anchors themes, ignore summary-only hits (RSS boilerplate / 版面套话).
  const ranked = hits.some((h) => h.fromTitle)
    ? hits.filter((h) => h.fromTitle)
    : hits;
  const out: string[] = [];
  // Pass 0: first tip of each theme; pass 1: second tip…
  const maxPass = Math.max(0, ...ranked.map((h) => h.tips.length - 1), 0);
  for (let pass = 0; pass <= maxPass; pass++) {
    for (const rule of ranked) {
      if (out.length >= limit) return out;
      const tip = rule.tips[pass];
      if (tip && !out.includes(tip)) out.push(tip);
    }
  }
  return out;
}

function pickTipsForModules(modules: ModuleTag[], n: number): string[] {
  const out: string[] = [];
  for (const m of modules) {
    const bank = MODULE_TIP_BANK[m];
    if (bank?.[0] && !out.includes(bank[0])) out.push(bank[0]);
    if (out.length >= n) break;
  }
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
  return `可联动「${ann.title}」相关考点，对照教材作史纲/习思想规范表述。`;
}

/**
 * 2–3 short, memorizable 「答题可用表述」bullets (官方口径 / 规范表述).
 * Prefers content-matched themes; keeps anniversary 联动; avoids口语与新闻导语复述.
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
  const title = opts?.title || "";
  const summary = opts?.summary || "";

  // 1) Anniversary-linked tips first (max 1)
  for (const ann of anns.slice(0, 1)) {
    const tip = tipFromAnniversary(ann);
    if (!bullets.includes(tip)) bullets.push(tip);
  }

  const themePool = collectThemeTips(title, summary, 4);
  const target = anns.length > 0 ? 3 : 2;
  // Prefer 3 when theme hits are rich
  const want = Math.min(3, Math.max(target, themePool.length >= 2 ? 3 : target));

  // 2) Content-matched official口径（与该条时政相关，勿堆砌无关套话）
  for (const t of themePool) {
    if (bullets.length >= want) break;
    if (!bullets.includes(t)) bullets.push(t);
  }

  // 3) Module bank only to fill remaining slots
  if (bullets.length < want && modules.length) {
    for (const t of pickTipsForModules(modules, want)) {
      if (bullets.length >= want) break;
      if (!bullets.includes(t)) bullets.push(t);
    }
  }

  // 4) Official兜底（书面语），保证 2–3 条
  for (const t of FALLBACK_OFFICIAL_TIPS) {
    if (bullets.length >= 2) break;
    if (!bullets.includes(t)) bullets.push(t);
  }
  // If we already have 2 and themes were rich, allow a 3rd from fallback only when still short of want
  if (bullets.length < want) {
    for (const t of FALLBACK_OFFICIAL_TIPS) {
      if (bullets.length >= want) break;
      if (!bullets.includes(t)) bullets.push(t);
    }
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
