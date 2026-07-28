// Citizen Fines API — migrated to withAuth() for centralized auth + audit
// GET  /api/fines  → list fines (filter: status, plate, nida, citizenId, search, fineType)
// POST /api/fines  → create new fine or record payment (auto-audited)
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled } from "@/lib/db/client";

// GET /api/fines → list fines
export const GET = withAuth("citations", "view", async ({ db, searchParams }) => {
  const status    = searchParams.get("status");
  const plate     = searchParams.get("plate");
  const citizenId = searchParams.get("citizenId");
  const fineType  = searchParams.get("fineType");
  const search    = searchParams.get("search")?.toLowerCase() ?? "";

  if (!isDbEnabled()) {
    return { ok: true, data: [], total: 0 };
  }

  let q = db.from("citizen_fines").select("*").order("created_at", { ascending: false });
  if (status && status !== "all") q = q.eq("status", status);
  if (plate)                     q = q.ilike("plate", plate);
  if (citizenId)                 q = q.eq("citizen_id", citizenId);
  if (fineType)                  q = q.eq("fine_type", fineType);
  if (search) {
    q = q.or(`driver_name.ilike.%${search}%,plate.ilike.%${search}%,offense.ilike.%${search}%`);
  }

  const { data, error } = await q;
  if (error) throw error;
  return { ok: true, data: data ?? [], total: data?.length ?? 0 };
});

// POST /api/fines → create fine or record payment (auto-audited)
export const POST = withAuth("citations", "create", async ({ body, session, db }) => {
  const { action } = body;

  // ── action: "pay" — mark existing fine as paid ────────────────────────
  if (action === "pay") {
    const { fineId, paymentMethod, paymentRef } = body;
    if (!fineId || !paymentMethod) {
      return { ok: false, error: "fineId na paymentMethod vinahitajika", status: 400 };
    }
    if (!isDbEnabled()) {
      return { ok: true, data: { id: fineId, status: "paid" } };
    }
    const { data, error } = await db.from("citizen_fines")
      .update({
        status:         "paid",
        payment_method: paymentMethod,
        payment_ref:    paymentRef,
        paid_at:        new Date().toISOString(),
      })
      .eq("id", fineId)
      .select()
      .single();
    if (error) throw error;
    return { ok: true, data };
  }

  // ── action: "create" — record a new fine ──────────────────────────────
  const {
    driverName, driverPhone, driverNida,
    citizenId,
    plate, offense, baseAmount, dueDate,
    fineType,
    citationType,
  } = body;

  if (!driverName && !citizenId) {
    return { ok: false, error: "driverName au citizenId vinahitajika", status: 400 };
  }
  if (!offense) {
    return { ok: false, error: "offense inahitajika", status: 400 };
  }

  // Use admin-configurable base amount if not provided
  let effectiveBaseAmount = baseAmount;
  let penaltyRate = 0.05; // default 5% per week
  let servicePriceRef: string | null = null;

  if (isDbEnabled()) {
    const { data: prices } = await db.from("service_prices").select("*").eq("is_active", true);
    const pricesList = prices ?? [];

    if (!effectiveBaseAmount) {
      const baseFinePrice = pricesList.find((p: any) => p.code === "traffic_fine_base");
      const bailPrice     = pricesList.find((p: any) => p.code === "bail_processing_fee");

      if (fineType === "traffic" && baseFinePrice) {
        effectiveBaseAmount = Number(baseFinePrice.amount);
        servicePriceRef = baseFinePrice.code;
      } else if (fineType === "bail" && bailPrice) {
        effectiveBaseAmount = Number(bailPrice.amount);
        servicePriceRef = bailPrice.code;
      } else if (fineType === "citizen" && baseFinePrice) {
        effectiveBaseAmount = Number(baseFinePrice.amount);
        servicePriceRef = baseFinePrice.code;
      } else if (baseFinePrice) {
        effectiveBaseAmount = Number(baseFinePrice.amount);
        servicePriceRef = baseFinePrice.code;
      }
    }

    const penaltyRatePrice = pricesList.find((p: any) => p.code === "overdue_penalty_rate");
    if (penaltyRatePrice && penaltyRatePrice.is_rate) {
      penaltyRate = Number(penaltyRatePrice.amount) / 100;
    }
  }

  // Fallback default if still no amount
  if (!effectiveBaseAmount) effectiveBaseAmount = 30000; // TZS 30,000 default

  const due = dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 86400000);
  const msOverdue = Math.max(0, Date.now() - due.getTime());
  const weeksOverdue = Math.floor(msOverdue / (7 * 86400000));
  const penaltyAmount = fineType === "bail" || fineType === "service"
    ? 0
    : Math.round(effectiveBaseAmount * weeksOverdue * penaltyRate);
  const totalAmount = effectiveBaseAmount + penaltyAmount;

  const effectiveFineType = fineType || "traffic";
  const effectiveCitationType =
    citationType ||
    (session?.user?.role === "TRAFFIC_OFFICER"
      ? "traffic"
      : session?.user?.role === "POST_OFFICER"
        ? "post"
        : "general");

  const payload = {
    driver_name:    driverName || null,
    driver_phone:   driverPhone  || null,
    driver_nida:    driverNida   || null,
    citizen_id:     citizenId    || null,
    plate:          plate        || null,
    offense,
    base_amount:    effectiveBaseAmount,
    penalty_amount: penaltyAmount,
    total_amount:   totalAmount,
    weeks_overdue:  weeksOverdue,
    due_date:       due.toISOString(),
    status:         "unpaid",
    fine_type:      effectiveFineType,
    citation_type:  effectiveCitationType,
    officer_id:     session?.user?.badgeNo   || null,
    officer_name:   session?.user?.name      || null,
    station:        session?.user?.station   || null,
    region:         session?.user?.region    || null,
    service_price_code: servicePriceRef,
  };

  if (!isDbEnabled()) {
    return { ok: false, error: "Database haijawezeshwa", status: 503 };
  }

  const { data, error } = await db.from("citizen_fines").insert(payload).select().single();
  if (error) throw error;
  return { ok: true, data, status: 201 };
});
