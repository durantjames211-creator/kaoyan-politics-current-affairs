export type ModuleTag =
  | "史纲"
  | "毛中特"
  | "思修"
  | "形策"
  | "习思想";

export const MODULE_TAGS: ModuleTag[] = [
  "史纲",
  "毛中特",
  "思修",
  "形策",
  "习思想",
];

export type Importance = "核心" | "重点" | "了解";

export interface Affair {
  id: string;
  title: string;
  summary: string;
  date: string; // YYYY-MM-DD
  publishedAt?: string; // ISO timestamp when known
  source: string;
  sourceUrl?: string;
  modules: ModuleTag[];
  examTips?: string;
  imageUrl?: string;
  /** Linked anniversary node ids (联动) */
  anniversaryIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Anniversary {
  id: string;
  title: string;
  year: number;
  eventDate?: string; // MM-DD or YYYY-MM-DD
  importance: Importance;
  modules: ModuleTag[];
  knowledgePoints: string[];
  examRelation: string;
  linkage?: string;
  officialUrl?: string;
  summary: string;
  /** Keywords used to auto-associate affairs during sync */
  keywords?: string[];
}

export interface SyncMeta {
  lastSyncAt: string | null;
  /** Always refreshed on every sync attempt — powers homepage「今日已核验」 */
  lastVerifiedAt: string | null;
  lastStatus: "ok" | "error" | "never";
  lastMessage: string;
  lastFetched: number;
  lastAdded: number;
  lastUpdated: number;
  lastSkippedOld: number;
  feeds: { url: string; ok: boolean; message: string }[];
}
