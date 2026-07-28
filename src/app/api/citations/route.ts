// Citations API — migrated to withAuth() for centralized auth + audit
// GET  /api/citations  → list citations (auto-scoped)
// POST /api/citations  → create citation (auto-audited)
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled } from "@/lib/db/client";
import { applyScopeToQuery } from "@/lib/data-scope";

// GET /api/citations → list citations (auto-scoped via getScope)
export const GET = withAuth("citations", "view", async ({ db, scope, searchParams }) => {
  const status = searchParams.get("status");
  const plate  = searchParams.get("plate");
  const search = searchParams.get("search")?.toLowerCase() ?? "";

  if (!isDbEnabled()) {
    return { ok: true, data: [], total: 0 };
  }

  let q = applyScopeToQuery(db.from("citations"), scope)
    .select("*")
    .order("created_at", { ascending: false });
  if (status && status !== "all") {
    // Translate Swahili status labels used by the UI back to DB values
    const s = status === "Imelipwa" ? "paid" : status === "Hajalipwa" ? "unpaid" : status;
    q = q.eq("status", s);
  }
  if (plate)  q = q.ilike("plate", plate);
  if (search) {
    q = q.or(`plate.ilike.%${search}%,offense.ilike.%${search}%,citation_number.ilike.%${search}%`);
  }

  const { data, error } = await q;
  if (error) throw error;
  return { ok: true, data: data ?? [], total: data?.length ?? 0 };
});

// POST /api/citations → create citation (auto-audited)
export const POST = withAuth("citations", "create", async ({ body, session, db }) => {
  const { plate, offense, driverName, driverPhone, driverLicense, driverNida, amount, location, vehicleType, notes } = body;
  if (!plate || !offense) {
    return { ok: false, error: "Plate na kosa vinahitajika", status: 400 };
  }

  if (!isDbEnabled()) {
    return { ok: false, error: "Database haijawezeshwa", status: 503 };
  }

  const citationNumber = `CT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
  const { data, error } = await db.from("citations").insert({
    citation_number: citationNumber,
    plate:           plate.toUpperCase(),
    offense, status: "unpaid",
    driver_name:     driverName   || null,
    driver_phone:    driverPhone  || null,
    driver_license:  driverLicense|| null,
    driver_nida:     driverNida   || null,
    fine_amount:     amount ? parseInt(String(amount).replace(/[^\d]/g, ""), 10) : null,
    location:        location     || null,
    vehicle_type:    vehicleType  || null,
    notes:           notes        || null,
    officer_id:      session?.user?.id || null,
  }).select().single();

  if (error) throw error;
  return { ok: true, data, status: 201 };
});
