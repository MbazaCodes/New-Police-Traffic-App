import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdminAny, isSupabaseEnabled } from "@/lib/supabase/client";
import { errMsg } from "@/lib/api-error";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "patrols", "update");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny() as any;
      if (admin) {
        const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (body.status)   patch.status   = body.status;
        if (body.end_time) patch.end_time = body.end_time;
        if (body.notes)    patch.notes    = body.notes;
        const { data, error } = await admin.from("patrols").update(patch).eq("id", id).select().single();
        if (error) throw error;
        await logAction(session, "patrol_updated", "patrols", id, patch);
        return NextResponse.json({ ok: true, data });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
