import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAffairs, saveAffairs } from "@/lib/data";
import type { Affair, ModuleTag } from "@/lib/types";
import { MODULE_TAGS } from "@/lib/types";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const affairs = await getAffairs();
  return NextResponse.json({ affairs });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  if (!title) {
    return NextResponse.json({ error: "标题必填" }, { status: 400 });
  }
  const modules = (Array.isArray(body.modules) ? body.modules : [])
    .map(String)
    .filter((m: string): m is ModuleTag =>
      (MODULE_TAGS as string[]).includes(m)
    );

  const now = new Date().toISOString();
  const item: Affair = {
    id: randomUUID(),
    title,
    summary: String(body.summary || "").trim(),
    date: String(body.date || now.slice(0, 10)),
    source: String(body.source || "手动录入"),
    sourceUrl: body.sourceUrl ? String(body.sourceUrl) : undefined,
    modules,
    examTips: body.examTips ? String(body.examTips) : undefined,
    imageUrl: body.imageUrl ? String(body.imageUrl) : undefined,
    createdAt: now,
    updatedAt: now,
  };

  const affairs = await getAffairs();
  affairs.unshift(item);
  await saveAffairs(affairs);
  return NextResponse.json({ ok: true, item });
}
