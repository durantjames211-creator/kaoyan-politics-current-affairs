import { getAffairs, getAnniversaries, getSyncMeta } from "@/lib/data";
import HomeClient from "@/components/HomeClient";

export const dynamic = "force-dynamic";

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
