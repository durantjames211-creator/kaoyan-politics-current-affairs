import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAnniversaries } from "@/lib/data";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await getAnniversaries();
  return NextResponse.json({ anniversaries: items });
}
