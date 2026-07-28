// Devices API — migrated to withAuth() for centralized auth + audit
// GET    /api/devices?query=  → search by serial/IMEI
// POST   /api/devices         → report lost/stolen device (auto-audited)
// PATCH  /api/devices/[id]    → update status (handled in [id]/route.ts)
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled, query as dbQuery } from "@/lib/db/client";

// GET /api/devices → search/list devices
export const GET = withAuth("devices", "view", async ({ db, searchParams }) => {
  if (!isDbEnabled()) return { ok: true, data: [] };
  const q = searchParams.get("query")?.trim() ?? "";

  let result;
  if (q) {
    result = await db.from("devices").select("*")
      .or(`serial_no.ilike.%${q}%,imei.ilike.%${q}%,description.ilike.%${q}%,owner_name.ilike.%${q}%`)
      .order("created_at", { ascending: false })
      .limit(20);
  } else {
    result = await db.from("devices").select("*")
      .order("created_at", { ascending: false })
      .limit(100);
  }
  return { ok: true, data: result.data ?? [] };
});

// POST /api/devices → report lost/stolen device (auto-audited)
export const POST = withAuth("devices", "create", async ({ body, session, db }) => {
  if (!body.description || !body.ownerName) {
    return { ok: false, error: "Maelezo na jina la mmiliki yanahitajika", status: 400 };
  }
  if (!isDbEnabled()) {
    return { ok: false, error: "Database haijawezeshwa", status: 503 };
  }

  const { data, error } = await db.from("devices").insert({
    serial_no:   body.serialNo || `SN-${Date.now()}`,
    imei:        body.imei || null,
    description: body.description,
    category:    body.category || "simu",
    owner_name:  body.ownerName,
    owner_phone: body.ownerPhone || null,
    status:      body.status || "stolen",
    report_date: new Date().toISOString().split("T")[0],
  }).select().single();

  if (error) {
    return { ok: false, error: error.message, status: 400 };
  }

  // Log initial ownership record (best-effort)
  try {
    await dbQuery(
      `INSERT INTO device_ownership
       (device_id,owner_citizen_id,owner_name,owner_nida,owner_phone,
        status,recorded_by_id,recorded_by_name,recorded_by_role,is_current_owner)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,TRUE)`,
      [
        data.id,
        body.ownerCitizenId ?? null,
        body.ownerName,
        body.ownerNida ?? null,
        body.ownerPhone ?? null,
        data.status ?? "active",
        session?.user?.id ?? "",
        session?.user?.name ?? "",
        session?.user?.role ?? "",
      ]
    );
  } catch (e) {
    console.warn("[DEVICE OWNERSHIP LOG]", e);
  }

  return { ok: true, data, status: 201 };
});
