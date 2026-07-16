import { NextRequest, NextResponse } from "next/server";
import { OFFICERS } from "@/lib/admin-data";

// GET /api/officers
// Returns officer list. In prod: replace with Supabase query.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const station = searchParams.get("station");

  let officers = OFFICERS;
  if (status) officers = officers.filter((o) => o.status === status);
  if (station) officers = officers.filter((o) => o.station.toLowerCase().includes(station.toLowerCase()));

  return NextResponse.json({ data: officers, total: officers.length });
}

// POST /api/officers — create new officer (mock)
export async function POST(req: NextRequest) {
  const body = await req.json();
  // TODO: insert into Supabase officers table
  return NextResponse.json({ success: true, id: `TP${Date.now()}`, ...body }, { status: 201 });
}
