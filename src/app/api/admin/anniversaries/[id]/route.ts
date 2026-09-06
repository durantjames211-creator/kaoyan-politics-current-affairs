import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAnniversaries, saveAnniversaries } from "@/lib/data";
import type { Importance, ModuleTag } from "@/lib/types";
import { MODULE_TAGS } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const items = await getAnniversaries();
  const idx = items.findIndex((a) => a.id === id);
  if (idx < 0) {
    return NextResponse.json({ error: "未找到" }, { status: 404 });
  }
  const prev = items[idx];
  const modules = Array.isArray(body.modules)
    ? body.modules
        .map(String)
        .filter((m: string): m is ModuleTag =>
          (MODULE_TAGS as string[]).includes(m)
        )
    : prev.modules;

  const importance = (["核心", "重点", "了解"] as Importance[]).includes(
    body.importance
  )
    ? (body.importance as Importance)
    : prev.importance;

  items[idx] = {
    ...prev,
    title: body.title !== undefined ? String(body.title).trim() : prev.title,
    year: body.year !== undefined ? Number(body.year) || prev.year : prev.year,
    eventDate:
      body.eventDate !== undefined
        ? String(body.eventDate || "") || undefined
        : prev.eventDate,
    importance,
    modules,
    knowledgePoints: Array.isArray(body.knowledgePoints)
      ? body.knowledgePoints.map(String)
      : prev.knowledgePoints,
    examRelation:
      body.examRelation !== undefined
        ? String(body.examRelation)
        : prev.examRelation,
    linkage:
      body.linkage !== undefined
        ? String(body.linkage || "") || undefined
        : prev.linkage,
    officialUrl:
      body.officialUrl !== undefined
        ? String(body.officialUrl || "") || undefined
        : prev.officialUrl,
    summary:
      body.summary !== undefined ? String(body.summary) : prev.summary,
  };
  await saveAnniversaries(items);
  return NextResponse.json({ ok: true, item: items[idx] });
}
