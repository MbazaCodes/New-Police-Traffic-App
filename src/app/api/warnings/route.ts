import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdmin, isSupabaseEnabled } from "@/lib/supabase/client";

export async function GET() {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "warnings", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdmin();
      if (admin) {
        const { data } = await admin.from("warnings").select("*").order("created_at", { ascending: false });
        return NextResponse.json({ ok: true, data });
      }
    }
    return NextResponse.json({ ok: true, data: WARNING_RECORDS });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "warnings", "create");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    const body = await request.json().catch(() => ({}));
    if (!body.citizenName || !body.offense) {
      return NextResponse.json({ error: "Jina na kosa yanahitajika" }, { status: 400 });
    }
    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdmin();
      if (admin) {
        const { data, error } = await admin.from("warnings").insert({
          citizen_name:  body.citizenName,
          citizen_nida:  body.citizenNida || null,
          citizen_phone: body.citizenPhone || null,
          reason:        body.offense,
          location:      body.location || null,
          notes:         body.notes || null,
          warning_date:  new Date().toISOString().split("T")[0],
          warning_time:  new Date().toLocaleTimeString("en-US", { hour12: false }),
        }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        await logAction(session, "CREATE", "warnings", data.id, { citizen: body.citizenName });
        return NextResponse.json({ ok: true, data }, { status: 201 });
      }
    }
    return NextResponse.json({ ok: true, data: { id: `WN-${Date.now()}`, ...body, createdAt: new Date().toISOString() } }, { status: 201 });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
