/**
 * CLI entry for RSS sync — GitHub Actions and local npm run sync.
 * Reuses src/lib/sync.ts (upsert past-24h, always refresh lastVerifiedAt).
 */
import { runSync } from "../src/lib/sync";

async function main() {
  console.log("[sync] starting RSS sync (past 24h upsert)...");
  const meta = await runSync();
  console.log("[sync] done:", JSON.stringify(meta, null, 2));
  if (meta.lastStatus === "error") {
    console.warn("[sync] feeds reported errors, but sync-meta was updated.");
  }
}

main().catch((err) => {
  console.error("[sync] failed:", err);
  process.exitCode = 1;
});
