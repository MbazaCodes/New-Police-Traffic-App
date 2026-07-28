// Vehicles API — list, create
// Refactored: uses api-guard for centralized auth, audit, error handling.
// No more manual session/permission/error boilerplate.
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled, query } from "@/lib/db/client";

// GET /api/vehicles?plate= → search by plate
export const GET = withAuth("vehicles", "view", async ({ db, searchParams }) => {
  if (!isDbEnabled()) return { ok: true, data: [] };

  const plate = searchParams.get("plate")?.trim().toUpperCase() ?? "";
  let result;
  if (plate) {
    result = await db.from("vehicles").select("*")
      .ilike("plate", plate.replace(/\s+/g, "%"))
      .order("created_at", { ascending: false }).limit(10);
  } else {
    result = await db.from("vehicles").select("*")
      .order("created_at", { ascending: false }).limit(100);
  }
  return { ok: true, data: result.data ?? [] };
});

// POST /api/vehicles → register vehicle (auto-audited)
export const POST = withAuth("vehicles", "create", async ({ body, session, db }) => {
  const b = body as {
    plate: string; model: string; ownerName: string; ownerNida?: string;
    ownerPhone: string; type?: string; color?: string; year?: string;
    ownerTin?: string; ownerLicense?: string; ownerCitizenId?: string;
    insuranceCompany?: string; insurancePolicy?: string;
    insuranceExpiry?: string; inspectionExpiry?: string;
    registrationExpiry?: string; notes?: string;
  };

  const required = ["plate", "model", "ownerName", "ownerNida", "ownerPhone"] as const;
  for (const f of required) {
    if (!b[f]) return { ok: false, error: `Sehemu inayohitajika: ${f}`, status: 400 };
  }

  if (!isDbEnabled()) return { ok: false, error: "Database haijawezeshwa", status: 503 };

  const { data, error } = await db.from("vehicles").insert({
    plate:             b.plate.trim().toUpperCase(),
    model:             b.model,
    type:              b.type || "Saloon",
    color:             b.color || "Nyeupe",
    year:              b.year || new Date().getFullYear().toString(),
    owner_name:        b.ownerName,
    owner_nida:        b.ownerNida?.trim().toUpperCase(),
    owner_tin:         b.ownerTin?.trim() || null,
    owner_phone:       b.ownerPhone,
    owner_license:     b.ownerLicense?.toUpperCase() || null,
    insurance_company: b.insuranceCompany || null,
    insurance_policy:  b.insurancePolicy || null,
    insurance_expires: b.insuranceExpiry || null,
    insurance_valid:   !!b.insuranceExpiry && new Date(b.insuranceExpiry) > new Date(),
    inspection_expires: b.inspectionExpiry || null,
    registration_expires: b.registrationExpiry || null,
    outstanding_fines: 0,
    notes:             b.notes || null,
  }).select().single();
  if (error) return { ok: false, error: error.message, status: 400 };

  // Auto-log initial ownership
  await logInitialVehicleOwnership(
    data.id, b.ownerName, b.ownerNida ?? null, b.ownerPhone ?? null,
    b.ownerCitizenId ?? null,
    session.user.id, session.user.name ?? "", session.user.role ?? ""
  );

  return { ok: true, data, status: 201 };
});

// ── Auto-log initial ownership when vehicle is registered ──
async function logInitialVehicleOwnership(
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
