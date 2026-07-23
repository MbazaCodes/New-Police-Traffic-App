// Assignment [id] — end/patch/delete an assignment (Supabase-backed)
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdminAny, isSupabaseEnabled } from "@/lib/supabase/client";
import { errMsg } from "@/lib/api-error";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "officers", "update");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { status, postId, role } = body;

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (status !== undefined) patch.status = status;
        if (postId !== undefined) patch.post_id = postId || null;
        if (role !== undefined)   patch.role = role || null;

        const { data, error } = await admin.from("assignments")
          .update(patch).eq("id", id).select("*, officer:officers(id, user_id)").single();
        if (error) throw error;

        // Ending an assignment clears the officer's post
        if (status === "completed" || status === "cancelled") {
          await admin.from("officers")
            .update({ post_id: null, updated_at: new Date().toISOString() })
            .eq("id", data.officer?.id ?? data.officer_id);
        }

        await logAction(session, "assignment_updated", "assignments", id, { changes: body });
        return NextResponse.json({ ok: true, data });
      }
    }
    return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "officers", "update");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const { id } = await params;
    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        const { error } = await admin.from("assignments").delete().eq("id", id);
        if (error) throw error;
        await logAction(session, "assignment_deleted", "assignments", id, {});
        return NextResponse.json({ ok: true });
      }
    }
    return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
