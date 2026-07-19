// Citizen Fines API
// GET  /api/fines          → list fines (filter: status, plate, nida, search)
// POST /api/fines          → create new fine or record payment

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdmin, getSupabaseAdminAny, isSupabaseEnabled } from "@/lib/supabase/client";

// ── No fallback mock data — requires Supabase ──────────────────────────

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
        let q = admin.from("citizen_fines").select("*").order("created_at", { ascending: false });
        if (status && status !== "all") q = q.eq("status", status);
        if (plate) q = q.ilike("plate", plate);
        if (search) q = q.or(`driver_name.ilike.%${search}%,plate.ilike.%${search}%,offense.ilike.%${search}%`);
        const { data, error } = await q;
        if (error) throw error;
        return NextResponse.json({ ok: true, data, total: data?.length ?? 0 });
      }
    }

    // Supabase required — return empty when not available
    return NextResponse.json({ ok: true, data: [], total: 0 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "citations", "create");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const body = await request.json().catch(() => ({}));
    const { action } = body;

    // ── action: "pay" — mark existing fine as paid ────────────────────
    if (action === "pay") {
      const { fineId, paymentMethod, paymentRef } = body;
      if (!fineId || !paymentMethod) {
        return NextResponse.json({ error: "fineId na paymentMethod vinahitajika" }, { status: 400 });
      }
      if (isSupabaseEnabled()) {
        const admin = getSupabaseAdminAny();
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

    // ── action: "create" — record a new fine ──────────────────────────
    const { driverName, driverPhone, driverNida, plate, offense, baseAmount, dueDate } = body;
    if (!driverName || !offense || !baseAmount) {
      return NextResponse.json({ error: "driverName, offense na baseAmount vinahitajika" }, { status: 400 });
    }

    const due = dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 86400000);
    const msOverdue = Math.max(0, Date.now() - due.getTime());
    const weeksOverdue = Math.floor(msOverdue / (7 * 86400000));
    const penaltyAmount = Math.round(baseAmount * weeksOverdue * 0.05);
    const totalAmount = baseAmount + penaltyAmount;

    const payload = {
      driver_name:    driverName,
      driver_phone:   driverPhone  || null,
      driver_nida:    driverNida   || null,
      plate:          plate        || null,
      offense,
      base_amount:    baseAmount,
      penalty_amount: penaltyAmount,
      total_amount:   totalAmount,
      weeks_overdue:  weeksOverdue,
      due_date:       due.toISOString(),
      status:         "unpaid",
      officer_id:     session?.user?.badgeNo   || null,
      officer_name:   session?.user?.name      || null,
      station:        session?.user?.station   || null,
      region:         session?.user?.region    || null,
    };

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        const { data, error } = await admin.from("citizen_fines").insert(payload).select().single();
        if (error) throw error;
        await logAction(session, "fine_created", "citizen_fines", data.id, { offense, amount: totalAmount });
        return NextResponse.json({ ok: true, data }, { status: 201 });
      }
    }

    // Supabase required for fine creation
    return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
