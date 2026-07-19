import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdmin, isSupabaseEnabled } from "@/lib/supabase/client";
import { ARREST_RECORDS } from "@/lib/police-data";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "arrests", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdmin();
      if (admin) {
        const { data } = await admin.from("arrests").select("*").order("created_at", { ascending: false });
        return NextResponse.json({ ok: true, data });
      }
    }
    return NextResponse.json({ ok: true, data: ARREST_RECORDS });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "arrests", "create");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    const body = await request.json().catch(() => ({}));
    if (!body.suspectName || !body.offense || !body.location) {
      return NextResponse.json({ error: "Jina, kosa na eneo yanahitajika" }, { status: 400 });
    }
    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdmin();
      if (admin) {
        const { data, error } = await admin.from("arrests").insert({
          suspect_name:  body.suspectName,
          suspect_nida:  body.suspectNida || null,
          suspect_phone: body.suspectPhone || null,
          offense:       body.offense,
          location:      body.location,
          cell:          body.cell || null,
          next_of_kin:   body.nextOfKin || null,
          lawyer:        body.lawyer || null,
          notes:         body.notes || null,
          arrest_date:   new Date().toISOString().split("T")[0],
          arrest_time:   new Date().toLocaleTimeString("en-US", { hour12: false }),
          status:        "held",
        }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        await logAction(session, "CREATE", "arrests", data.id, { suspect: body.suspectName });
        return NextResponse.json({ ok: true, data }, { status: 201 });
      }
    }
    return NextResponse.json({ ok: true, data: { id: `AR-${Date.now()}`, ...body, status: "held", createdAt: new Date().toISOString() } }, { status: 201 });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
