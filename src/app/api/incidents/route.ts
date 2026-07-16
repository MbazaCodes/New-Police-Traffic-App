import { NextRequest, NextResponse } from "next/server";
import { ADMIN_INCIDENTS, LIVE_INCIDENTS } from "@/lib/admin-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const live = searchParams.get("live");
  const status = searchParams.get("status");

  if (live === "true") {
    return NextResponse.json({ data: LIVE_INCIDENTS, total: LIVE_INCIDENTS.length });
  }

  let incidents = ADMIN_INCIDENTS;
  if (status) incidents = incidents.filter((i: { status: string }) => i.status === status);
  return NextResponse.json({ data: incidents, total: incidents.length });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const incidentNo = `INC-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
  return NextResponse.json({ success: true, incidentNo, ...body }, { status: 201 });
}
