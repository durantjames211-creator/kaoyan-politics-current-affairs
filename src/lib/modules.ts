import type { Anniversary, ModuleTag } from "./types";
import { MODULE_TAGS } from "./types";

const KEYWORDS: Record<ModuleTag, string[]> = {
  史纲: [
    "辛亥革命",
    "长征",
    "抗战",
    "解放战争",
    "五四",
    "建党",
    "建军",
    "近代史",
    "党史",
    "革命",
    "历史",
    "纪念",
    "百年",
    "九一八",
    "西安事变",
    "北伐",
    "开国",
    "建国",
  ],
  毛中特: [
    "改革开放",
    "现代化",
    "中国特色社会主义",
    "共同富裕",
    "新农村",
    "乡村振兴",
    "高质量发展",
    "两会",
    "规划",
    "社会主义",
    "新质生产力",
  ],
  思修: [
    "道德",
    "法治",
    "青年",
    "爱国主义",
    "社会主义核心价值观",
    "诚信",
    "文明",
    "志愿服务",
    "英雄",
    "理想信念",
  ],
  形策: [
    "外交",
    "国际",
    "联合国",
    "一带一路",
    "中美",
    "中俄",
    "全球",
    "峰会",
    "经贸",
    "多边",
    "周边",
    "中非",
    "南南",
  ],
  习思想: [
    "习近平",
    "二十大",
    "中国式现代化",
    "新发展理念",
    "人类命运共同体",
    "全面从严治党",
    "党建",
    "意识形态",
    "国家安全",
    "生态文明",
    "自我革命",
  ],
};

export function tagModules(text: string): ModuleTag[] {
  const hits = new Set<ModuleTag>();
  for (const mod of MODULE_TAGS) {
    for (const kw of KEYWORDS[mod]) {
      if (text.includes(kw)) {
        hits.add(mod);
        break;
      }
    }
  }
  if (hits.size === 0) hits.add("形策");
  return Array.from(hits);
}

/** Build exam tips from modules + optional anniversary titles */
export function buildExamTips(
  modules: ModuleTag[],
  anniversaryTitles: string[]
): string {
  const modPart = modules.length
    ? `模块侧重：${modules.join("、")}。`
    : "";
  const annPart = anniversaryTitles.length
    ? `可联动周年专题：${anniversaryTitles.join("、")}。`
    : "";
  return `${modPart}${annPart}对照教材考点与权威报道原文记忆关键词表述。`.trim();
}

export function matchAnniversaries(
  text: string,
  anniversaries: Anniversary[]
): Anniversary[] {
  return anniversaries.filter((ann) => {
    const keys = [
      ann.title,
      ...(ann.keywords || []),
      ...ann.knowledgePoints.slice(0, 2),
    ].filter(Boolean);
    return keys.some((k) => k && text.includes(k));
  });
}
