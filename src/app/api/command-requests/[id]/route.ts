// Command Request [id] — migrated to withAuthAny() for centralized auth + audit
// GET   /api/command-requests/[id] → get single request + comments
// PATCH /api/command-requests/[id] → approve/decline/hold/review (commanders only)
// POST  /api/command-requests/[id] → add comment
import { withAuthAny } from "@/lib/api-guard";
import { isDbEnabled, query } from "@/lib/db/client";

const COMMANDER_ROLES = [
  "SUPER_ADMIN", "NATIONAL_COMMANDER", "REGIONAL_COMMANDER",
  "DISTRICT_COMMANDER", "STATION_COMMANDER", "SYSTEM_ADMIN",
];

// GET /api/command-requests/[id] → fetch single request + comments
export const GET = withAuthAny("command_requests", async ({ params }) => {
  if (!isDbEnabled()) {
    return { ok: false, error: "DB haijawezeshwa", status: 503 };
  }
  const id = String(params.id ?? "");
  const rows = await query(`SELECT * FROM command_requests WHERE id = $1`, [id]);
  if (!rows.length) {
    return { ok: false, error: "Ombi halipatikani", status: 404 };
  }
  const comments = await query(
    `SELECT * FROM request_comments WHERE request_id = $1 ORDER BY created_at ASC`,
    [id]
  );
  return { ok: true, data: rows[0], comments };
});

// PATCH /api/command-requests/[id] → approve/decline/hold/review (auto-audited)
export const PATCH = withAuthAny("command_requests", async ({ params, body, session, db }) => {
  const role = session.user.role ?? "";
  if (!COMMANDER_ROLES.includes(role)) {
    return { ok: false, error: "Huna ruhusa ya kuidhinisha maombi", status: 403 };
  }
  if (!isDbEnabled()) {
    return { ok: false, error: "DB haijawezeshwa", status: 503 };
  }
  const id = String(params.id ?? "");
  const { action, note, hold_reason } = body;

  const statusMap: Record<string, string> = {
    approve: "approved",
    decline: "declined",
    hold:    "on_hold",
    review:  "under_review",
  };
  const newStatus = statusMap[action];
  if (!newStatus) {
    return { ok: false, error: "Hatua batili", status: 400 };
  }

  const now = new Date().toISOString();
  const updateData: Record<string, unknown> = { status: newStatus };
  if (action === "approve" || action === "decline") {
    updateData.response_note     = note ?? null;
    updateData.responded_by_id   = session.user.id;
    updateData.responded_by_name = session.user.name ?? "";
    updateData.responded_at      = now;
  }
  if (action === "hold") {
    updateData.hold_reason = hold_reason ?? note ?? null;
    updateData.held_by_id  = session.user.id;
    updateData.held_at     = now;
  }

  const { data, error } = await db.from("command_requests")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;

  // Auto-add a comment for the action
  if (note || hold_reason) {
    await query(
      `INSERT INTO request_comments (request_id, author_id, author_name, author_role, comment, is_internal)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, session.user.id, session.user.name, role, note ?? hold_reason ?? action, true]
    );
  }

  return { ok: true, data };
});

// POST /api/command-requests/[id] → add comment (auto-audited)
export const POST = withAuthAny("command_requests", async ({ params, body, session }) => {
  if (!isDbEnabled()) {
    return { ok: false, error: "DB haijawezeshwa", status: 503 };
  }
  const id = String(params.id ?? "");
  const { comment, is_internal } = body;
  if (!comment) {
    return { ok: false, error: "Maoni inahitajika", status: 400 };
  }
  await query(
    `INSERT INTO request_comments (request_id, author_id, author_name, author_role, comment, is_internal)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [id, session.user.id, session.user.name, session.user.role, comment, is_internal ?? false]
  );
  return { ok: true };
});
