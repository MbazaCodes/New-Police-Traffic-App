// Assignment [id] API
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { getDbAdmin, isDbEnabled } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "assignments", "update");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    if (!isDbEnabled()) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const patch: Record<string, unknown> = {};
    if (body.status)   patch.status   = body.status;
    if (body.endDate)  patch.end_date = body.endDate;
    if (body.notes)    patch.notes    = body.notes;

    const admin = getDbAdmin();
    const { data, error } = await (admin as any).from("assignments").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "assignments", "delete");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    if (!isDbEnabled()) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });

    const { id } = await params;
    const admin = getDbAdmin();
    const { error } = await (admin as any).from("assignments").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
