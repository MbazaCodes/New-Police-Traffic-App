// Stations API — list & create
// GET  /api/stations  -> list stations
// POST /api/stations  -> create station

import { NextResponse } from "next/server";
import { STATIONS } from "@/lib/admin-mgmt-data";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";

const stationsStore: typeof STATIONS = [...STATIONS];

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "stations", "view");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const url = new URL(request.url);
    const region = url.searchParams.get("region");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search")?.toLowerCase() ?? "";

    let result = [...stationsStore];
    if (region && region !== "all") {
      result = result.filter((s) => s.region === region);
    }
    if (status && status !== "all") {
      result = result.filter((s) => s.status === status);
    }
    if (search) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.id.toLowerCase().includes(search) ||
          s.region.toLowerCase().includes(search) ||
          s.district.toLowerCase().includes(search),
      );
    }

    return NextResponse.json({ data: result, total: result.length }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to list stations", detail: String(err) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "stations", "create");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const body = await request.json().catch(() => ({}));
    for (const field of ["name", "region", "district", "address"]) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    const newStation = {
      id: body.id ?? `ST-${Math.floor(100 + Math.random() * 900)}`,
      name: String(body.name),
      region: String(body.region),
      district: String(body.district),
      address: String(body.address),
      phone: body.phone ?? "",
      officersCount: 0,
      postsCount: 0,
      status: body.status ?? "active",
      established: body.established ?? new Date().getFullYear().toString(),
    };
    stationsStore.push(newStation);

    logAction(
      session!.user.id,
      "create",
      "stations",
      newStation.id,
      { station: newStation },
      session!.user.name,
    );

    return NextResponse.json({ data: newStation }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create station", detail: String(err) },
      { status: 500 },
    );
  }
}
