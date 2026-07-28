// Requests API — migrated to withAuth() for centralized auth + audit
// GET    /api/requests          → list requests (officers see own; commanders see all in scope)
// POST   /api/requests          → create request (officer, auto-audited)
// PATCH  /api/requests/[id]     → approve/reject/reallocate (commander)
import { withAuthAny } from "@/lib/api-guard";
import { isDbEnabled } from "@/lib/db/client";

// GET /api/requests → list requests (scope-aware for officers vs commanders)
export const GET = withAuthAny("officer_requests", async ({ session, db, searchParams }) => {
  const status = searchParams.get("status") ?? "";
  const type   = searchParams.get("type") ?? "";

  if (!isDbEnabled()) {
    return { ok: true, data: [] };
  }

  let q = db
    .from("officer_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  if (type)   q = q.eq("type", type);

  // Scope: officers see own; commanders see all in scope
  const userRole  = session.user.role ?? "";
  const isOfficer = ["TRAFFIC_OFFICER", "GENERAL_OFFICER", "POST_OFFICER"].includes(userRole);
  if (isOfficer) {
    const badge = (session.user as { badgeNo?: string }).badgeNo ?? session.user.id ?? "";
    q = q.eq("officer_badge", badge);
  }

  const { data } = await q;
  return { ok: true, data: data ?? [] };
});

// POST /api/requests → create officer request (auto-audited)
export const POST = withAuthAny("officer_requests", async ({ session, body, db }) => {
  if (!body.type || !body.details) {
    return { ok: false, error: "Aina na maelezo yanahitajika", status: 400 };
  }

  if (!isDbEnabled()) {
    return { ok: false, error: "Database haijawezeshwa", status: 503 };
  }

  const officerBadge = (session.user as { badgeNo?: string }).badgeNo ?? session.user.id ?? "";
  const station      = (session.user as { station?: string }).station ?? "";
  const region       = (session.user as { region?: string }).region ?? "";

  const { data, error } = await db.from("officer_requests").insert({
    type:          body.type,
    officer_id:    session.user.id ?? "",
    officer_name:  session.user.name ?? "",
    officer_badge: officerBadge,
    station,
    region,
    details:       body.details,
    priority:      body.priority ?? "medium",
    status:        "pending",
  }).select().single();

  if (error) {
    return { ok: false, error: error.message, status: 400 };
  }
  return { ok: true, data, status: 201 };
});
