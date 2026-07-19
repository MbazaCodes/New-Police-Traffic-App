// Officer detail API — get, patch, delete
// GET    /api/officers/[id]   -> fetch single officer
// PATCH  /api/officers/[id]   -> update officer
// DELETE /api/officers/[id]   -> delete officer

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";

const officersStore: {id:string;name:string;rank:string;status:string;badgeNo:string}[] = [];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "officers", "view");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { id } = await params;
    const officer = officersStore.find((o) => o.id === id);
    if (!officer) {
      return NextResponse.json({ error: "Officer not found" }, { status: 404 });
    }
    return NextResponse.json({ data: officer }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch officer", detail: String(err) },
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
    const check = requirePermission(session, "officers", "update");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { id } = await params;
    const idx = officersStore.findIndex((o) => o.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Officer not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const updated = { ...officersStore[idx], ...body, id: officersStore[idx].id };
    officersStore[idx] = updated;

    logAction(
      session!.user.id,
      "update",
      "officers",
      id,
      { changes: body },
      session!.user.name,
    );

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update officer", detail: String(err) },
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
    const check = requirePermission(session, "officers", "delete");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { id } = await params;
    const idx = officersStore.findIndex((o) => o.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Officer not found" }, { status: 404 });
    }
    const [removed] = officersStore.splice(idx, 1);

    logAction(
      session!.user.id,
      "delete",
      "officers",
      id,
      { officer: removed },
      session!.user.name,
    );

    return NextResponse.json({ data: { id, deleted: true } }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete officer", detail: String(err) },
      { status: 500 },
    );
  }
}
