// Lost Item [id] — update status (found, returned, claimed)
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
    const check = requirePermission(session, "citizens", "update");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (body.status)        patch.status         = body.status;
        if (body.foundDate)     patch.found_date     = body.foundDate;
        if (body.foundLocation) patch.found_location = body.foundLocation;
        if (body.notes)         patch.notes          = body.notes;

        const { data, error } = await admin.from("lost_items").update(patch).eq("id", id).select().single();
        if (error) throw error;
        await logAction(session, "lost_item_updated", "lost_items", id, { changes: patch });
        return NextResponse.json({ ok: true, data });
      }
    }
    return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
