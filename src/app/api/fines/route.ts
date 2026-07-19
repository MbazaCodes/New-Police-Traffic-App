// Citizen Fines API
// GET  /api/fines          → list fines (filter: status, plate, nida, search)
// POST /api/fines          → create new fine or record payment

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdmin, isSupabaseEnabled } from "@/lib/supabase/client";

// ── Fallback in-memory store (demo / offline) ─────────────────────────────
const MOCK_FINES: Record<string, unknown>[] = [
  { id: "FP-2026-1001", driver_name: "Juma Khamis Mwinyi",  plate: "T 003 GHI", offense: "Over Speeding",      base_amount: 150000, penalty_amount: 0,     total_amount: 150000, weeks_overdue: 0, status: "unpaid", due_date: new Date(Date.now() + 20 * 86400000).toISOString(), created_at: new Date().toISOString() },
  { id: "FP-2026-1002", driver_name: "Grace Amina Mushi",   plate: "T 007 STU", offense: "Kutumia Simu",       base_amount:  50000, penalty_amount: 0,     total_amount:  50000, weeks_overdue: 0, status: "unpaid", due_date: new Date(Date.now() + 15 * 86400000).toISOString(), created_at: new Date().toISOString() },
  { id: "FP-2026-1003", driver_name: "Baraka Msangi",       plate: "T888ZZZ",   offense: "No Insurance",       base_amount: 200000, penalty_amount: 30000, total_amount: 230000, weeks_overdue: 2, status: "unpaid", due_date: new Date(Date.now() - 14 * 86400000).toISOString(), created_at: new Date().toISOString() },
  { id: "FP-2026-1004", driver_name: "Hamisi Rashid Omar",  plate: "T 018 ZAB", offense: "Kutopita kasi",      base_amount:  30000, penalty_amount: 4500,  total_amount:  34500, weeks_overdue: 3, status: "unpaid", due_date: new Date(Date.now() - 21 * 86400000).toISOString(), created_at: new Date().toISOString() },
];

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
      const admin = getSupabaseAdmin();
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

    // Fallback mock
    let result = [...MOCK_FINES];
    if (status && status !== "all") result = result.filter((f) => f.status === status);
    if (plate) result = result.filter((f) => String(f.plate).toLowerCase() === plate.toLowerCase());
    if (search) result = result.filter((f) =>
      String(f.driver_name).toLowerCase().includes(search) ||
      String(f.plate).toLowerCase().includes(search) ||
      String(f.offense).toLowerCase().includes(search)
    );
    return NextResponse.json({ ok: true, data: result, total: result.length });
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
        const admin = getSupabaseAdmin();
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
      const admin = getSupabaseAdmin();
      if (admin) {
        const { data, error } = await admin.from("citizen_fines").insert(payload).select().single();
        if (error) throw error;
        await logAction(session, "fine_created", "citizen_fines", data.id, { offense, amount: totalAmount });
        return NextResponse.json({ ok: true, data }, { status: 201 });
      }
    }

    const mockId = `FP-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    return NextResponse.json({ ok: true, data: { ...payload, id: mockId, created_at: new Date().toISOString() } }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
