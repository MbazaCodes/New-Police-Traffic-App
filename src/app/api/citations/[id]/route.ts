// Citation detail API — get, patch (update status)
// GET   /api/citations/[id]   -> fetch single citation
// PATCH /api/citations/[id]   -> update citation (typically status)

import { NextResponse } from "next/server";
import { ADMIN_CITATIONS } from "@/lib/admin-data";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";

const citationsStore: typeof ADMIN_CITATIONS = [...ADMIN_CITATIONS];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "citations", "view");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { id } = await params;
    const citation = citationsStore.find((c) => c.id === id);
    if (!citation) {
      return NextResponse.json({ error: "Citation not found" }, { status: 404 });
    }
    return NextResponse.json({ data: citation }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch citation", detail: String(err) },
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
    const check = requirePermission(session, "citations", "update");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { id } = await params;
    const idx = citationsStore.findIndex((c) => c.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Citation not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const updated = { ...citationsStore[idx], ...body, id: citationsStore[idx].id };
    citationsStore[idx] = updated;

    logAction(
      session!.user.id,
      "update",
      "citations",
      id,
      { changes: body },
      session!.user.name,
    );

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update citation", detail: String(err) },
      { status: 500 },
    );
  }
}
