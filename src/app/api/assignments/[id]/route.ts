// Assignment detail API — patch (update), delete (unassign)
// PATCH  /api/assignments/[id]  -> update assignment (e.g. change status)
// DELETE /api/assignments/[id]  -> unassign

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { errMsg } from "@/lib/api-error";

const assignmentsStore: {id:string;officerId:string;stationId:string;postId?:string;role:string;status:string}[] = [];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "assignments", "update");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { id } = await params;
    const idx = assignmentsStore.findIndex((a) => a.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const updated = { ...assignmentsStore[idx], ...body, id: assignmentsStore[idx].id };
    assignmentsStore[idx] = updated;

    logAction(
      session!.user.id,
      "update",
      "assignments",
      id,
      { changes: body },
      session!.user.name,
    );

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update assignment", detail: errMsg(err) },
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
    const check = requirePermission(session, "assignments", "delete");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { id } = await params;
    const idx = assignmentsStore.findIndex((a) => a.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }
    const [removed] = assignmentsStore.splice(idx, 1);

    logAction(
      session!.user.id,
      "delete",
      "assignments",
      id,
      { assignment: removed },
      session!.user.name,
    );

    return NextResponse.json({ data: { id, deleted: true } }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete assignment", detail: errMsg(err) },
      { status: 500 },
    );
  }
}
