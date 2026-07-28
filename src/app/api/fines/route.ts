// Citizen Fines API
// GET  /api/fines          → list fines (filter: status, plate, nida, citizenId, search, fineType)
// POST /api/fines          → create new fine (traffic, citizen, penalty, bail, service) or record payment
//
// UPDATED: Now supports citizen fines (by officer/post), fine_type field,
//          auto-connects to citizen_id for points deduction, uses service_prices
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getDbAdmin, isDbEnabled } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "citations", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const url = new URL(request.url);
    const status    = url.searchParams.get("status");
    const plate     = url.searchParams.get("plate");
    const citizenId = url.searchParams.get("citizenId");
    const fineType  = url.searchParams.get("fineType");
    const search    = url.searchParams.get("search")?.toLowerCase() ?? "";

    if (isDbEnabled()) {
      const admin = getDbAdmin();
      if (admin) {
        let q = admin.from("citizen_fines").select("*").order("created_at", { ascending: false });
        if (status && status !== "all") q = q.eq("status", status);
        if (plate) q = q.ilike("plate", plate);
        if (citizenId) q = q.eq("citizen_id", citizenId);
        if (fineType) q = q.eq("fine_type", fineType);
        if (search) q = q.or(`driver_name.ilike.%${search}%,plate.ilike.%${search}%,offense.ilike.%${search}%`);
        const { data, error } = await q;
        if (error) throw error;
        return NextResponse.json({ ok: true, data, total: data?.length ?? 0 });
      }
    }

    // Database required — return empty when not available
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
    const { action } = body;

    // ── action: "pay" — mark existing fine as paid ────────────────────────
    if (action === "pay") {
      const { fineId, paymentMethod, paymentRef } = body;
      if (!fineId || !paymentMethod) {
        return NextResponse.json({ error: "fineId na paymentMethod vinahitajika" }, { status: 400 });
      }
      if (isDbEnabled()) {
        const admin = getDbAdmin();
        if (admin) {
          const { data, error } = await admin.from("citizen_fines")
            .update({ status: "paid", payment_method: paymentMethod, payment_ref: paymentRef, paid_at: new Date().toISOString() })
            .eq("id", fineId).select().single();
          if (error) throw error;
          await logAction(session, "fine_paid", "citizen_fines", fineId, { paymentMethod });
          return NextResponse.json({ ok: true, data });
        }
      }
      return NextResponse.json({ ok: true, data: { id: fineId, status: "paid" } });
    }

    // ── action: "create" — record a new fine ──────────────────────────────
    const {
      driverName, driverPhone, driverNida,
      citizenId,  // direct citizen link (for non-traffic fines)
      plate, offense, baseAmount, dueDate,
      fineType,    // traffic | citizen | penalty | bail | service
      citationType, // traffic | post | general | cid | command
    } = body;

    if (!driverName && !citizenId) {
      return NextResponse.json({ error: "driverName au citizenId vinahitajika" }, { status: 400 });
    }
    if (!offense) {
      return NextResponse.json({ error: "offense inahitajika" }, { status: 400 });
    }

    // Use admin-configurable base amount if not provided
    let effectiveBaseAmount = baseAmount;
    let penaltyRate = 0.05; // default 5% per week
    let servicePriceRef = null;

    // Load service prices from admin settings
    if (isDbEnabled()) {
      const admin = getDbAdmin();
      if (admin) {
        const { data: prices } = await admin.from("service_prices").select("*").eq("is_active", true);
        const pricesList = prices ?? [];

        // Determine base amount based on fine type
        if (!effectiveBaseAmount) {
          const baseFinePrice = pricesList.find((p: any) => p.code === "traffic_fine_base");
          const bailPrice = pricesList.find((p: any) => p.code === "bail_processing_fee");

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

        // Use admin-configured penalty rate
        const penaltyRatePrice = pricesList.find((p: any) => p.code === "overdue_penalty_rate");
        if (penaltyRatePrice && penaltyRatePrice.is_rate) {
          penaltyRate = Number(penaltyRatePrice.amount) / 100;
        }
      }
    }

    // Fallback default if still no amount
    if (!effectiveBaseAmount) effectiveBaseAmount = 30000; // TZS 30,000 default

    const due = dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 86400000);
    const msOverdue = Math.max(0, Date.now() - due.getTime());
    const weeksOverdue = Math.floor(msOverdue / (7 * 86400000));
    const penaltyAmount = fineType === "bail" || fineType === "service" ? 0 : Math.round(effectiveBaseAmount * weeksOverdue * penaltyRate);
    const totalAmount = effectiveBaseAmount + penaltyAmount;

    const effectiveFineType = fineType || "traffic";
    // R1 (stabilize): compare against Role values (TRAFFIC_OFFICER,
    // POST_OFFICER), not UserRole strings (officer-traffic, officer-post).
    // The previous comparison caused TS2367 because Role and UserRole
    // are disjoint string-literal unions.
    const effectiveCitationType = citationType || (session?.user?.role === "TRAFFIC_OFFICER" ? "traffic" : session?.user?.role === "POST_OFFICER" ? "post" : "general");

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

    if (isDbEnabled()) {
      const admin = getDbAdmin();
      if (admin) {
        const { data, error } = await admin.from("citizen_fines").insert(payload).select().single();
        if (error) throw error;
        await logAction(session, "fine_created", "citizen_fines", data.id, { offense, amount: totalAmount, fineType: effectiveFineType });
        return NextResponse.json({ ok: true, data }, { status: 201 });
      }
    }

    // Database required for fine creation
    return NextResponse.json({ error: "Database haijawezeshwa" }, { status: 503 });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
