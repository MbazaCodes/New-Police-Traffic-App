import { NextRequest, NextResponse } from "next/server";
import { ALERTS } from "@/lib/police-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") ?? "all";

  let alerts = ALERTS;
  if (filter === "important") alerts = alerts.filter((a: { important?: boolean }) => a.important);

  return NextResponse.json({ data: alerts, total: alerts.length });
}
