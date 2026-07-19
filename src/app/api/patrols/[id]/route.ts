// Patrol detail API — patch (end patrol)
// PATCH /api/patrols/[id]  -> update patrol (end patrol, update distance/progress)

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";

const patrolsStore: {id:string;officer:string;area:string;status:string;start:string}[] = [];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "patrols", "update");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { id } = await params;
    const idx = patrolsStore.findIndex((p) => p.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Patrol not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const updated = { ...patrolsStore[idx], ...body, id: patrolsStore[idx].id };
    patrolsStore[idx] = updated;

    logAction(
      session!.user.id,
      body.status === "ended" ? "end_patrol" : "update",
      "patrols",
      id,
      { changes: body },
      session!.user.name,
    );

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update patrol", detail: String(err) },
      { status: 500 },
    );
  }
}
