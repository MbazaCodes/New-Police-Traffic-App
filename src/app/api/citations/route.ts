import { NextRequest, NextResponse } from "next/server";
import { ADMIN_CITATIONS } from "@/lib/admin-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let citations = ADMIN_CITATIONS;
  if (status) citations = citations.filter((c: { status: string }) => c.status === status);

  return NextResponse.json({ data: citations, total: citations.length });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const citationNo = `CIT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
  return NextResponse.json({ success: true, citationNo, ...body }, { status: 201 });
}
