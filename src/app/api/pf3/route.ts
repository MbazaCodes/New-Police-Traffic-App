// PF3 (Police Form 3 — Traffic Accident Report) API (Supabase-backed, was in-memory)
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdminAny, isSupabaseEnabled } from "@/lib/supabase/client";
import { errMsg } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "incidents", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny() as any;
      if (admin) {
        const { data, error } = await admin.from("pf3_reports")
          .select("*").order("created_at", { ascending: false }).limit(100);
        if (error) throw error;
        return NextResponse.json({ ok: true, data: data ?? [], total: data?.length ?? 0 });
      }
    }
    return NextResponse.json({ ok: true, data: [], total: 0 });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "incidents", "create");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    const body = await request.json().catch(() => ({}));
    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny() as any;
      if (admin) {
        const ref = `PF3-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
        const { data, error } = await admin.from("pf3_reports").insert({
          reference_no:     body.referenceNo    || ref,
          region:           body.region         || null,
          district:         body.district       || null,
          station:          body.station        || session?.user?.station || null,
          accident_type:    body.accidentType   || null,
          severity:         body.severity       || "minor",
          weather:          body.weather        || null,
          road_surface:     body.roadSurface    || null,
          light_condition:  body.lightCondition || null,
          location:         body.location       || null,
          date_time:        body.dateTime       || new Date().toISOString(),
          vehicles_json:    body.vehicles       ? JSON.stringify(body.vehicles) : null,
          casualties_json:  body.casualties     ? JSON.stringify(body.casualties) : null,
          officer_name:     body.officerName    || session?.user?.name || null,
          officer_id:       body.officerId      || session?.user?.id || null,
          notes:            body.notes          || null,
          status:           "submitted",
        }).select().single();
        if (error) throw error;
        await logAction(session, "pf3_created", "pf3_reports", data.id, { ref });
        return NextResponse.json({ ok: true, data }, { status: 201 });
      }
    }
    return NextResponse.json({ ok: true, data: { id: `PF3-${Date.now()}` } }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
