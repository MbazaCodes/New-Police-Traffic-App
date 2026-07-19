// Bail Requests API
// GET  /api/bail   → list bail requests (filter: status, arrestId)
// POST /api/bail   → create bail request or approve/reject

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdmin, isSupabaseEnabled } from "@/lib/supabase/client";

const BAIL_CONDITIONS = [
  "Mshtakiwa lazima aripoti kituoni kila wiki",
  "Mshtakiwa haruhusiwi kuacha mkoa",
  "Mshtakiwa lazima asilale nje ya makazi yake bila ruhusa",
  "Mshtakiwa lazima ahudhirie mahakama kwa tarehe yote",
  "Dhamana itafutwa mara moja akikinzana na masharti",
];

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "arrests", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const url = new URL(request.url);
    const status   = url.searchParams.get("status");
    const arrestId = url.searchParams.get("arrestId");

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdmin();
      if (admin) {
        let q = admin.from("bail_requests").select("*").order("created_at", { ascending: false });
        if (status && status !== "all") q = q.eq("status", status);
        if (arrestId) q = q.eq("arrest_id", arrestId);
        const { data, error } = await q;
        if (error) throw error;
        return NextResponse.json({ ok: true, data, total: data?.length ?? 0 });
      }
    }

    return NextResponse.json({ ok: true, data: [], total: 0 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "arrests", "create");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const body = await request.json().catch(() => ({}));
    const { action } = body;

    // ── action: "approve" or "reject" ─────────────────────────────────
    if (action === "approve" || action === "reject") {
      const { bailId, revokeReason } = body;
      if (!bailId) return NextResponse.json({ error: "bailId inahitajika" }, { status: 400 });

      if (isSupabaseEnabled()) {
        const admin = getSupabaseAdmin();
        if (admin) {
          const update: Record<string, unknown> = {
            status:      action === "approve" ? "approved" : "rejected",
            approved_by: session?.user?.badgeNo || null,
            approved_at: new Date().toISOString(),
          };
          if (revokeReason) update.revoke_reason = revokeReason;
          const { data, error } = await admin.from("bail_requests").update(update).eq("id", bailId).select().single();
          if (error) throw error;
          // If approved, update the arrest status to 'bailed'
          if (action === "approve" && data.arrest_id) {
            await admin.from("arrests").update({ status: "bailed" }).eq("id", data.arrest_id);
          }
          await logAction(session, `bail_${action}`, "bail_requests", bailId, {});
          return NextResponse.json({ ok: true, data });
        }
      }
      return NextResponse.json({ ok: true, data: { id: bailId, status: action === "approve" ? "approved" : "rejected" } });
    }

    // ── action: "pay" — record payment for approved bail ──────────────
    if (action === "pay") {
      const { bailId, paymentMethod, paymentRef } = body;
      if (!bailId || !paymentMethod) {
        return NextResponse.json({ error: "bailId na paymentMethod vinahitajika" }, { status: 400 });
      }
      if (isSupabaseEnabled()) {
        const admin = getSupabaseAdmin();
        if (admin) {
          const { data, error } = await admin.from("bail_requests")
            .update({ payment_method: paymentMethod, payment_ref: paymentRef, paid_at: new Date().toISOString(), status: "approved" })
            .eq("id", bailId).select().single();
          if (error) throw error;
          await logAction(session, "bail_paid", "bail_requests", bailId, { paymentMethod });
          return NextResponse.json({ ok: true, data });
        }
      }
      return NextResponse.json({ ok: true, data: { id: bailId, status: "approved", paid_at: new Date().toISOString() } });
    }

    // ── Create new bail request ────────────────────────────────────────
    const {
      arrestId, suspectName, suspectNida, offense, arrestDate, cellNumber,
      bailAmount, guarantorName, guarantorPhone, guarantorNida, guarantorRelation,
      paymentMethod, paymentRef, conditionsAccepted, notes, courtDate,
    } = body;

    if (!suspectName || !offense || !bailAmount || !guarantorName || !guarantorPhone) {
      return NextResponse.json(
        { error: "suspectName, offense, bailAmount, guarantorName, na guarantorPhone vinahitajika" },
        { status: 400 }
      );
    }
    if (!conditionsAccepted) {
      return NextResponse.json({ error: "Masharti ya dhamana lazima yakubaliwe" }, { status: 400 });
    }

    const payload = {
      arrest_id:           arrestId        || null,
      suspect_name:        suspectName,
      suspect_nida:        suspectNida     || null,
      offense,
      arrest_date:         arrestDate      || null,
      cell_number:         cellNumber      || null,
      bail_amount:         bailAmount,
      guarantor_name:      guarantorName,
      guarantor_phone:     guarantorPhone,
      guarantor_nida:      guarantorNida   || null,
      guarantor_relation:  guarantorRelation || null,
      payment_method:      paymentMethod   || null,
      payment_ref:         paymentRef      || null,
      paid_at:             paymentMethod   ? new Date().toISOString() : null,
      conditions_accepted: true,
      conditions_text:     BAIL_CONDITIONS,
      status:              "approved",
      approved_by:         session?.user?.badgeNo  || null,
      approved_at:         new Date().toISOString(),
      court_date:          courtDate       || null,
      officer_id:          session?.user?.badgeNo  || null,
      officer_name:        session?.user?.name     || null,
      station:             session?.user?.station  || null,
      notes:               notes           || null,
    };

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdmin();
      if (admin) {
        const { data, error } = await admin.from("bail_requests").insert(payload).select().single();
        if (error) throw error;
        // Update arrest status → bailed
        if (arrestId) {
          await admin.from("arrests").update({ status: "bailed" }).eq("id", arrestId);
        }
        await logAction(session, "bail_created", "bail_requests", data.id, { suspectName, bailAmount });
        return NextResponse.json({ ok: true, data }, { status: 201 });
      }
    }

    // Supabase required for bail creation
    return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
