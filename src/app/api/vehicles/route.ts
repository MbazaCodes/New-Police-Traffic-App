// Vehicles API — list, create
// GET  /api/vehicles?plate=  → search by plate
// POST /api/vehicles         → register vehicle (officer or admin)

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdmin, getSupabaseAdminAny, isSupabaseEnabled } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "vehicles", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const url = new URL(request.url);
    const plate = url.searchParams.get("plate")?.trim().toUpperCase() ?? "";

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        const { data } = plate
          ? await admin.rpc("search_vehicle", { p_plate: plate })
          : await admin.from("vehicles").select("*").order("created_at", { ascending: false }).limit(100);
        return NextResponse.json({ ok: true, data });
      }
    }
    const results = plate
    return NextResponse.json({ ok: true, data: results });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "vehicles", "create");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const body = await request.json().catch(() => ({}));
    const required = ["plate", "model", "ownerName", "ownerNida", "ownerPhone"];
    for (const f of required) {
      if (!body[f]) return NextResponse.json({ error: `Sehemu inayohitajika: ${f}` }, { status: 400 });
    }

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        const { data, error } = await admin.from("vehicles").insert({
          plate:             body.plate.trim().toUpperCase(),
          model:             body.model,
          type:              body.type || "Saloon",
          color:             body.color || "Nyeupe",
          year:              body.year || new Date().getFullYear().toString(),
          owner_name:        body.ownerName,
          owner_nida:        body.ownerNida?.trim().toUpperCase(),
          owner_tin:         body.ownerTin?.trim() || null,
          owner_phone:       body.ownerPhone,
          owner_license:     body.ownerLicense?.toUpperCase() || null,
          insurance_company: body.insuranceCompany || null,
          insurance_policy:  body.insurancePolicy || null,
          insurance_expires: body.insuranceExpiry || null,
          insurance_valid:   !!body.insuranceExpiry && new Date(body.insuranceExpiry) > new Date(),
          inspection_expires: body.inspectionExpiry || null,
          registration_expires: body.registrationExpiry || null,
          outstanding_fines: 0,
          notes:             body.notes || null,
        }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        await logAction(session, "CREATE", "vehicles", data.id, { plate: body.plate });
        return NextResponse.json({ ok: true, data }, { status: 201 });
      }
    }
    // Supabase required for vehicle creation
    return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
