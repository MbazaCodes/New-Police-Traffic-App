// Officers API — list & create
// GET  /api/officers              -> list officers (with optional filters)
// POST /api/officers              -> create officer

import { NextResponse } from "next/server";
import { OFFICERS } from "@/lib/admin-data";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";

// In-memory mutable copy so create/delete persist across requests within
// the dev server lifetime.
const officersStore: typeof OFFICERS = [...OFFICERS];

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "officers", "view");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase() ?? "";
    const status = url.searchParams.get("status");
    const station = url.searchParams.get("station");

    let result = [...officersStore];
    if (search) {
      result = result.filter(
        (o) =>
          o.name.toLowerCase().includes(search) ||
          o.id.toLowerCase().includes(search) ||
          o.unit.toLowerCase().includes(search),
      );
    }
    if (status && status !== "all") {
      result = result.filter((o) => o.status === status);
    }
    if (station && station !== "all") {
      result = result.filter((o) => o.station.includes(station));
    }

    return NextResponse.json({ data: result, total: result.length }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to list officers", detail: String(err) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "officers", "create");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const body = await request.json().catch(() => ({}));
    const required = ["name", "rank", "unit", "station"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    const newOfficer = {
      id: body.id ?? `TP${Math.floor(100000 + Math.random() * 900000)}`,
      name: String(body.name),
      rank: String(body.rank),
      unit: String(body.unit),
      station: String(body.station),
      status: body.status ?? "active",
      patrols: 0,
      citations: 0,
      incidents: 0,
      hoursToday: 0,
      phone: body.phone ?? "",
    };
    officersStore.push(newOfficer);

    logAction(
      session!.user.id,
      "create",
      "officers",
      newOfficer.id,
      { officer: newOfficer },
      session!.user.name,
    );

    return NextResponse.json({ data: newOfficer }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create officer", detail: String(err) },
      { status: 500 },
    );
  }
}
