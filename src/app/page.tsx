import { getAffairs, getAnniversaries, getSyncMeta } from "@/lib/data";
import HomeClient from "@/components/HomeClient";

/** Static export: data/*.json is baked in at build time (Actions sync then rebuild). */
export default async function HomePage() {
  const [affairs, anniversaries, syncMeta] = await Promise.all([
    getAffairs(),
    getAnniversaries(),
    getSyncMeta(),
  ]);

  return (
    <HomeClient
      affairs={affairs}
      anniversaries={anniversaries}
      syncMeta={syncMeta}
    />
  );
}
