// Vehicles API — list, create
// GET  /api/vehicles?plate=  → search by plate
// POST /api/vehicles         → register vehicle (officer or admin)

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getDbAdmin, isDbEnabled } from "@/lib/db/client";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "vehicles", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const url = new URL(request.url);
    const plate = url.searchParams.get("plate")?.trim().toUpperCase() ?? "";

    if (isDbEnabled()) {
      const admin = getDbAdmin();
      if (admin) {
        let result;
        if (plate) {
          result = await admin.from("vehicles").select("*")
            .ilike("plate", plate.replace(/\s+/g, "%"))
            .order("created_at", { ascending: false }).limit(10);
        } else {
          result = await admin.from("vehicles").select("*")
            .order("created_at", { ascending: false }).limit(100);
        }
        return NextResponse.json({ ok: true, data: result.data ?? [] });
      }
    }
    return NextResponse.json({ ok: true, data: [] });
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

    if (isDbEnabled()) {
      const admin = getDbAdmin();
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
        // Log initial ownership record
        await logInitialVehicleOwnership(
          data.id, body.ownerName, body.ownerNida ?? null, body.ownerPhone ?? null,
          body.ownerCitizenId ?? null,
          session.user.id, session.user.name ?? "", session.user.role ?? ""
        );
        return NextResponse.json({ ok: true, data }, { status: 201 });
      }
    }
    // Supabase required for vehicle creation
    return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// ── Auto-log initial ownership when vehicle is registered ──
// Called internally after vehicle insert
export async function logInitialVehicleOwnership(
  vehicleId: string,
  ownerName: string,
  ownerNida: string | null,
  ownerPhone: string | null,
  ownerCitizenId: string | null,
  recordedById: string,
  recordedByName: string,
  recordedByRole: string
) {
  try {
    const { query } = await import("@/lib/db/client");
    await query(
      `INSERT INTO vehicle_ownership
       (vehicle_id,owner_citizen_id,owner_name,owner_nida,owner_phone,
        status,recorded_by_id,recorded_by_name,recorded_by_role,is_current_owner)
       VALUES($1,$2,$3,$4,$5,'active',$6,$7,$8,TRUE)
       ON CONFLICT DO NOTHING`,
      [vehicleId, ownerCitizenId, ownerName, ownerNida, ownerPhone,
       recordedById, recordedByName, recordedByRole]
    );
  } catch (e) { console.warn("[VEHICLE OWNERSHIP LOG]", e); }
}
