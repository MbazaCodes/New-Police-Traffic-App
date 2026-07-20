// Citations API — Supabase-first
// GET  /api/citations   -> list citations
// POST /api/citations   -> create citation

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { enforceDataScope, requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdmin, getSupabaseAdminAny, isSupabaseEnabled } from "@/lib/supabase/client";
import { getScopeContext } from "@/lib/scope";
import { errMsg } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "citations", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const plate  = url.searchParams.get("plate");
    const search = url.searchParams.get("search")?.toLowerCase() ?? "";

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        let q = admin.from("citations").select("*").order("created_at", { ascending: false });
        if (status && status !== "all") q = q.eq("status", status === "Imelipwa" ? "paid" : status === "Hajalipwa" ? "unpaid" : status);
        if (plate) q = q.ilike("plate", plate);
        if (search) q = q.or(`plate.ilike.%${search}%,offense.ilike.%${search}%,citation_number.ilike.%${search}%`);
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
    const check = requirePermission(session, "citations", "create");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const body = await request.json().catch(() => ({}));
    const { plate, offense, driverName, driverPhone, driverLicense, driverNida, amount, location, vehicleType, notes } = body;

    if (!plate || !offense) {
      return NextResponse.json({ error: "Plate na kosa vinahitajika" }, { status: 400 });
    }

    const citationNumber = `CT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        const { data, error } = await admin.from("citations").insert({
          citation_number: citationNumber,
          plate: plate.toUpperCase(),
          offense, status: "unpaid",
          driver_name: driverName || null,
          driver_phone: driverPhone || null,
          driver_license: driverLicense || null,
          driver_nida: driverNida || null,
          fine_amount: amount ? parseInt(String(amount).replace(/[^\d]/g, ""), 10) : null,
          location: location || null,
          vehicle_type: vehicleType || null,
          notes: notes || null,
          officer_id: session?.user?.id || null,
        }).select().single();
        if (error) throw error;
        await logAction(session, "citation_created", "citations", data.id, { plate, offense });
        return NextResponse.json({ ok: true, data }, { status: 201 });
      }
    }

    return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
