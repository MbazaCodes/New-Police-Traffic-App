// Incident detail API — get, patch (assign / update status)
// GET   /api/incidents/[id]  -> fetch single incident
// PATCH /api/incidents/[id]  -> update incident (assign officer, change status)

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";


export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "incidents", "view");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { id } = await params;
    const incident = incidentsStore.find((i) => i.id === id);
    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }
    return NextResponse.json({ data: incident }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch incident", detail: String(err) },
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
    const check = requirePermission(session, "incidents", "update");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { id } = await params;
    const idx = incidentsStore.findIndex((i) => i.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const updated = { ...incidentsStore[idx], ...body, id: incidentsStore[idx].id };
    incidentsStore[idx] = updated;

    logAction(
      session!.user.id,
      "update",
      "incidents",
      id,
      { changes: body },
      session!.user.name,
    );

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update incident", detail: String(err) },
      { status: 500 },
    );
  }
}
