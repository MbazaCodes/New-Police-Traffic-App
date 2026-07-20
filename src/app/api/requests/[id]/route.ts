// PATCH /api/requests/[id]  → approve | reject | reallocate
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdmin, getSupabaseAdminAny, isSupabaseEnabled } from "@/lib/supabase/client";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "requests", "manage");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { action, response, newStation } = body;

    if (!["manage","reject","reallocate"].includes(action)) {
      return NextResponse.json({ error: "action lazima iwe: approve | reject | reallocate" }, { status: 400 });
    }

    const statusMap: Record<string,string> = {
      approve: "approved", reject: "rejected", reallocate: "reallocated"
    };

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        const { data, error } = await admin.from("officer_requests").update({
          status:       statusMap[action],
          response:     response || null,
          new_station:  newStation || null,
          responded_by: session?.user?.name,
          responded_at: new Date().toISOString(),
        }).eq("id", id).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        await logAction(session, action.toUpperCase(), "officer_requests", id, { action, response });
        return NextResponse.json({ ok: true, data });
      }
    }
    // Mock: just return success
    return NextResponse.json({ ok: true, data: { id, status: statusMap[action], action, response, respondedBy: session?.user?.name, respondedAt: new Date().toISOString() } });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
