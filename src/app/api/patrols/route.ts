import { NextRequest, NextResponse } from "next/server";
import { ACTIVE_PATROLS } from "@/lib/admin-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let patrols = ACTIVE_PATROLS;
  if (status) patrols = patrols.filter((p: { status: string }) => p.status === status);

  return NextResponse.json({ data: patrols, total: patrols.length });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const patrolNo = `PAT-${String(Date.now()).slice(-5)}`;
  return NextResponse.json({ success: true, patrolNo, ...body }, { status: 201 });
}
