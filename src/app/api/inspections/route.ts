// Vehicle Inspections API — /api/inspections (Supabase-backed, was in-memory)
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdminAny, isSupabaseEnabled } from "@/lib/supabase/client";
import { errMsg } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "vehicles", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    const url = new URL(request.url);
    const plate = url.searchParams.get("plate");
    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny() as any;
      if (admin) {
        let q = admin.from("vehicle_inspections")
          .select("*, officer:users(id,name,badge_no)")
          .order("created_at", { ascending: false }).limit(100);
        if (plate) q = q.ilike("plate", `%${plate}%`);
        const { data, error } = await q;
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
    const check = requirePermission(session, "vehicles", "create");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    const body = await request.json().catch(() => ({}));
    if (!body.plate) return NextResponse.json({ error: "Plate inahitajika" }, { status: 400 });
    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny() as any;
      if (admin) {
        const { data, error } = await admin.from("vehicle_inspections").insert({
          plate:       body.plate,
          model:       body.model       || null,
          color:       body.color       || null,
          owner_name:  body.owner       || body.ownerName || null,
          owner_phone: body.phone       || null,
          location:    body.location    || null,
          officer_id:  body.officerId   || session?.user?.id || null,
          officer_name:body.officerName || session?.user?.name || null,
          station_name:body.station     || session?.user?.station || null,
          documents:   body.documents   ? JSON.stringify(body.documents) : null,
          overall_pass:body.overallPass ?? null,
          notes:       body.notes       || null,
        }).select().single();
        if (error) throw error;
        await logAction(session, "inspection_created", "vehicle_inspections", data.id, { plate: body.plate });
        return NextResponse.json({ ok: true, data }, { status: 201 });
      }
    }
    return NextResponse.json({ ok: true, data: { id: `INSP-${Date.now()}` } }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
