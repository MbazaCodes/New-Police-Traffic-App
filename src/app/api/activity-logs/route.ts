// Activity Logs API — migrated to withAuth() for centralized auth
// Records all user actions: login, create, update, delete + timestamps
//
// Migration notes:
// - GET uses withAuth("audit_logs", "view") — RBAC-enforced.
// - POST is a write from internal clients (e.g. login flow) and is
//   auto-audited. We use withAuthAny + skipAudit to avoid recursive
//   audit logging (the activity_logs table IS the audit log).
import { withAuth, withAuthAny } from "@/lib/api-guard";
import { isDbEnabled } from "@/lib/db/client";

// GET /api/activity-logs → list activity logs (filter: userId, action, userType, from, to)
export const GET = withAuth("audit_logs", "view", async ({ db, searchParams }) => {
  const userId   = searchParams.get("userId");
  const action   = searchParams.get("action");
  const userType = searchParams.get("userType");
  const from     = searchParams.get("from");
  const to       = searchParams.get("to");
  const limit    = Math.min(parseInt(searchParams.get("limit") ?? "100"), 500);

  if (!isDbEnabled()) {
    return { ok: true, data: [], total: 0 };
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
  }

  let q = db
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (userId)   q = q.eq("user_id", userId);
  if (action)   q = q.ilike("action", `%${action}%`);
  if (userType) q = q.eq("user_type", userType);
  if (from)     q = q.gte("created_at", from);
  if (to)       q = q.lte("created_at", to);

  const { data, error } = await q;
  if (error) throw error;
  return { ok: true, data: data ?? [], total: data?.length ?? 0 };
});

// POST /api/activity-logs → record an activity log entry
// (Any authenticated user; skip wrapper audit to avoid recursion.)
export const POST = withAuthAny(
  "activity_logs",
  async ({ body, db }) => {
    if (!isDbEnabled()) return { ok: true };

    await db.from("activity_logs").insert({
      user_id:       body.userId      || null,
      user_type:     body.userType    || "officer",
      user_name:     body.userName    || null,
      user_role:     body.userRole    || null,
      action:        body.action      || "unknown",
      resource:      body.resource    || null,
      resource_id:   body.resourceId  || null,
      description:   body.description || null,
      changes:       body.changes     || null,
      ip_address:    body.ipAddress   || null,
      success:       body.success     ?? true,
      error_message: body.errorMessage || null,
    });
    return { ok: true };
  },
  { skipAudit: true }
);
