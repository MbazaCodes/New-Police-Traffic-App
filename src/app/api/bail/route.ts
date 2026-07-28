// Bail Requests API — migrated to withAuth() for centralized auth + audit
// GET  /api/bail   → list bail requests (filter: status, arrestId)
// POST /api/bail   → create bail request or approve/reject/pay
//
// Migration: getServerSession + requirePermission + logAction → withAuth
// (audit logging is now automatic for POST; the explicit logAction calls
//  for bail_{approve,reject,paid,created} have been removed — the wrapper
//  emits one "create" audit row per POST which is sufficient.)
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled } from "@/lib/db/client";

const BAIL_CONDITIONS = [
  "Mshtakiwa lazima aripoti kituoni kila wiki",
  "Mshtakiwa haruhusiwi kuacha mkoa",
  "Mshtakiwa lazima asilale nje ya makazi yake bila ruhusa",
  "Mshtakiwa lazima ahudhirie mahakama kwa tarehe yote",
  "Dhamana itafutwa mara moja akikinzana na masharti",
];

// GET /api/bail → list bail requests
export const GET = withAuth("arrests", "view", async ({ db, searchParams }) => {
  const status   = searchParams.get("status");
  const arrestId = searchParams.get("arrestId");

  if (!isDbEnabled()) {
    return { ok: true, data: [], total: 0 };
  }

  let q = db
    .from("bail_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (status && status !== "all") q = q.eq("status", status);
  if (arrestId) q = q.eq("arrest_id", arrestId);

  const { data, error } = await q;
  if (error) throw error;
  return { ok: true, data: data ?? [], total: data?.length ?? 0 };
});

// POST /api/bail → create / approve / reject / pay (auto-audited)
export const POST = withAuth("arrests", "create", async ({ body, session, db }) => {
  const { action } = body;

  // ── action: "approve" or "reject" ─────────────────────────────────
  if (action === "approve" || action === "reject") {
    const { bailId, revokeReason } = body;
    if (!bailId) return { ok: false, error: "bailId inahitajika", status: 400 };

    if (!isDbEnabled()) {
      return {
        ok: true,
        data: { id: bailId, status: action === "approve" ? "approved" : "rejected" },
      };
    }

    const update: Record<string, unknown> = {
      status:      action === "approve" ? "approved" : "rejected",
      approved_by: session?.user?.badgeNo || null,
      approved_at: new Date().toISOString(),
    };
    if (revokeReason) update.revoke_reason = revokeReason;

    const { data, error } = await db
      .from("bail_requests")
      .update(update)
      .eq("id", bailId)
      .select()
      .single();
    if (error) throw error;

    // If approved, update the arrest status to 'bailed'
    if (action === "approve" && data.arrest_id) {
      await db.from("arrests").update({ status: "bailed" }).eq("id", data.arrest_id);
    }
    return { ok: true, data };
  }

  // ── action: "pay" — record payment for approved bail ──────────────
  if (action === "pay") {
    const { bailId, paymentMethod, paymentRef } = body;
    if (!bailId || !paymentMethod) {
      return { ok: false, error: "bailId na paymentMethod vinahitajika", status: 400 };
    }
    if (!isDbEnabled()) {
      return {
        ok: true,
        data: { id: bailId, status: "approved", paid_at: new Date().toISOString() },
      };
    }
    const { data, error } = await db
      .from("bail_requests")
      .update({
        payment_method: paymentMethod,
        payment_ref:    paymentRef,
        paid_at:        new Date().toISOString(),
        status:         "approved",
      })
      .eq("id", bailId)
      .select()
      .single();
    if (error) throw error;
    return { ok: true, data };
  }

  // ── Create new bail request ────────────────────────────────────────
  const {
    arrestId, suspectName, suspectNida, offense, arrestDate, cellNumber,
    bailAmount, guarantorName, guarantorPhone, guarantorNida, guarantorRelation,
    paymentMethod, paymentRef, conditionsAccepted, notes, courtDate,
  } = body;

  if (!suspectName || !offense || !bailAmount || !guarantorName || !guarantorPhone) {
    return {
      ok: false,
      error: "suspectName, offense, bailAmount, guarantorName, na guarantorPhone vinahitajika",
      status: 400,
    };
  }
  if (!conditionsAccepted) {
    return { ok: false, error: "Masharti ya dhamana lazima yakubaliwe", status: 400 };
  }

  if (!isDbEnabled()) {
    return { ok: false, error: "Database haijawezeshwa", status: 503 };
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

  const { data, error } = await db
    .from("bail_requests")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;

  // Update arrest status → bailed
  if (arrestId) {
    await db.from("arrests").update({ status: "bailed" }).eq("id", arrestId);
  }
  return { ok: true, data, status: 201 };
});
