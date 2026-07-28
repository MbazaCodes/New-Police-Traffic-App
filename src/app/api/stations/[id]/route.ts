// Station detail API — get, patch, delete
// GET    /api/stations/[id]  -> fetch single station
// PATCH  /api/stations/[id]  -> update station
// DELETE /api/stations/[id]  -> delete station

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { errMsg } from "@/lib/api-error";

const stationsStore: {id:string;name:string;region:string;status:string}[] = [];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "stations", "view");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { id } = await params;
    const station = stationsStore.find((s) => s.id === id);
    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }
    return NextResponse.json({ data: station }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch station", detail: errMsg(err) },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "stations", "update");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { id } = await params;
    const idx = stationsStore.findIndex((s) => s.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const updated = { ...stationsStore[idx], ...body, id: stationsStore[idx].id };
    stationsStore[idx] = updated;

    logAction(
      session!.user.id,
      "update",
      "stations",
      id,
      { changes: body },
      session!.user.name,
    );

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update station", detail: errMsg(err) },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "stations", "delete");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { id } = await params;
    const idx = stationsStore.findIndex((s) => s.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }
    const [removed] = stationsStore.splice(idx, 1);

    logAction(
      session!.user.id,
      "delete",
      "stations",
      id,
      { station: removed },
      session!.user.name,
    );

    return NextResponse.json({ data: { id, deleted: true } }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete station", detail: errMsg(err) },
      { status: 500 },
    );
  }
}
