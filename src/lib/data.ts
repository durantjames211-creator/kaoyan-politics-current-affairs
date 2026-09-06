import { promises as fs } from "fs";
import path from "path";
import type { Affair, Anniversary, SyncMeta } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJson<T>(filename: string, fallback: T): Promise<T> {
  await ensureDataDir();
  const file = path.join(DATA_DIR, filename);
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    await fs.writeFile(file, JSON.stringify(fallback, null, 2), "utf-8");
    return fallback;
  }
}

async function writeJson<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir();
  const file = path.join(DATA_DIR, filename);
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

export async function getAffairs(): Promise<Affair[]> {
  return readJson<Affair[]>("affairs.json", []);
}

export async function saveAffairs(affairs: Affair[]): Promise<void> {
  await writeJson("affairs.json", affairs);
}

export async function getAnniversaries(): Promise<Anniversary[]> {
  return readJson<Anniversary[]>("anniversaries.json", []);
}

export async function saveAnniversaries(
  items: Anniversary[]
): Promise<void> {
  await writeJson("anniversaries.json", items);
}

const DEFAULT_META: SyncMeta = {
  lastSyncAt: null,
  lastVerifiedAt: null,
  lastStatus: "never",
  lastMessage: "尚未同步（可使用管理后台或 Cron 触发）",
  lastFetched: 0,
  lastAdded: 0,
  lastUpdated: 0,
  lastSkippedOld: 0,
  feeds: [],
};

export async function getSyncMeta(): Promise<SyncMeta> {
  const meta = await readJson<SyncMeta>("sync-meta.json", DEFAULT_META);
  return { ...DEFAULT_META, ...meta };
}

export async function saveSyncMeta(meta: SyncMeta): Promise<void> {
  await writeJson("sync-meta.json", meta);
}
