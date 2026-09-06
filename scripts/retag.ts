/**
 * Re-tag all affairs with stricter module rules + regenerate exam tips.
 */
import { getAffairs, saveAffairs, getAnniversaries } from "../src/lib/data";
import { tagModules, buildExamTips, matchAnniversaries } from "../src/lib/modules";

async function main() {
  const affairs = await getAffairs();
  const anniversaries = await getAnniversaries();
  const now = new Date().toISOString();
  let changed = 0;
  const dist: Record<string, number> = {};
  let empty = 0;

  const next = affairs.map((a) => {
    const text = `${a.title} ${a.summary}`;
    const modules = tagModules(a.title, a.summary);
    const matched = matchAnniversaries(text, anniversaries);
    const anniversaryIds =
      matched.length > 0 ? matched.map((x) => x.id) : a.anniversaryIds || [];
    const examTips = buildExamTips(
      modules,
      matched.map((x) => x.title),
      {
        title: a.title,
        summary: a.summary,
        anniversaries: matched,
      }
    );

    const modKey = modules.join("+") || "(empty)";
    dist[modKey] = (dist[modKey] || 0) + 1;
    if (modules.length === 0) empty += 1;

    const same =
      JSON.stringify(a.modules) === JSON.stringify(modules) &&
      a.examTips === examTips &&
      JSON.stringify(a.anniversaryIds || []) === JSON.stringify(anniversaryIds);
    if (!same) changed += 1;

    return {
      ...a,
      modules,
      examTips,
      anniversaryIds,
      updatedAt: same ? a.updatedAt : now,
    };
  });

  await saveAffairs(next);
  console.log(
    JSON.stringify(
      {
        total: next.length,
        changed,
        emptyModules: empty,
        distribution: dist,
        samples: next.slice(0, 6).map((a) => ({
          title: a.title.slice(0, 40),
          modules: a.modules,
          tips: a.examTips,
        })),
        taggedSamples: next
          .filter((a) => a.modules.length)
          .slice(0, 8)
          .map((a) => ({
            title: a.title.slice(0, 48),
            modules: a.modules,
            tipLines: (a.examTips || "").split("\n").length,
          })),
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
