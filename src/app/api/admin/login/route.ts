import { NextRequest, NextResponse } from "next/server";
import {
  checkAdminPassword,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const password = String(body.password || "");
  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: "密码错误" }, { status: 401 });
  }
  const token = createSessionToken();
  const res = NextResponse.json({ ok: true });
  const opt = sessionCookieOptions(token);
  res.cookies.set(opt);
  return res;
}
