import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAffairs, saveAffairs } from "@/lib/data";
import type { ModuleTag } from "@/lib/types";
import { MODULE_TAGS } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const affairs = await getAffairs();
  const idx = affairs.findIndex((a) => a.id === id);
  if (idx < 0) {
    return NextResponse.json({ error: "未找到" }, { status: 404 });
  }
  const prev = affairs[idx];
  const modules = Array.isArray(body.modules)
    ? body.modules
        .map(String)
        .filter((m: string): m is ModuleTag =>
          (MODULE_TAGS as string[]).includes(m)
        )
    : prev.modules;

  affairs[idx] = {
    ...prev,
    title: body.title !== undefined ? String(body.title).trim() : prev.title,
    summary:
      body.summary !== undefined ? String(body.summary).trim() : prev.summary,
    date: body.date !== undefined ? String(body.date) : prev.date,
    source: body.source !== undefined ? String(body.source) : prev.source,
    sourceUrl:
      body.sourceUrl !== undefined
        ? String(body.sourceUrl || "") || undefined
        : prev.sourceUrl,
    modules,
    examTips:
      body.examTips !== undefined
        ? String(body.examTips || "") || undefined
        : prev.examTips,
    imageUrl:
      body.imageUrl !== undefined
        ? String(body.imageUrl || "") || undefined
        : prev.imageUrl,
    updatedAt: new Date().toISOString(),
  };
  await saveAffairs(affairs);
  return NextResponse.json({ ok: true, item: affairs[idx] });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const affairs = await getAffairs();
  const next = affairs.filter((a) => a.id !== id);
  if (next.length === affairs.length) {
    return NextResponse.json({ error: "未找到" }, { status: 404 });
  }
  await saveAffairs(next);
  return NextResponse.json({ ok: true });
}
