// Command Requests API — migrated to withAuth() / withAuthAny()
// GET  /api/command-requests → list (scoped by role: commanders see all, others see own)
// POST /api/command-requests → create new request (auto-audited)
import { withAuthAny } from "@/lib/api-guard";
import { isDbEnabled, query } from "@/lib/db/client";

const COMMANDER_ROLES = [
  "SUPER_ADMIN", "NATIONAL_COMMANDER", "REGIONAL_COMMANDER",
  "DISTRICT_COMMANDER", "STATION_COMMANDER", "SYSTEM_ADMIN",
];

// GET /api/command-requests → list (role-scoped)
export const GET = withAuthAny("command_requests", async ({ session, searchParams }) => {
  if (!isDbEnabled()) return { ok: true, data: [], total: 0 };

  const status = searchParams.get("status") ?? "";
  const type   = searchParams.get("type") ?? "";
  const role   = session.user.role ?? "";
  const userId = session.user.id ?? "";

  const isCommander = COMMANDER_ROLES.includes(role);

  let sql = `SELECT * FROM command_requests`;
  const params: unknown[] = [];
  const where: string[] = [];

  if (!isCommander) {
    // Non-commanders see only their own requests
    params.push(userId);
    where.push(`requester_id = $${params.length}`);
  }
  if (status) {
    params.push(status);
    where.push(`status = $${params.length}`);
  }
  if (type) {
    params.push(type);
    where.push(`type = $${params.length}`);
  }
  if (where.length) sql += ` WHERE ${where.join(" AND ")}`;
  sql += ` ORDER BY created_at DESC LIMIT 200`;

  const rows = await query(sql, params);
  return { ok: true, data: rows, total: rows.length };
});

// POST /api/command-requests → create (auto-audited)
export const POST = withAuthAny("command_requests", async ({ body, session, db }) => {
  if (!isDbEnabled()) {
    return { ok: false, error: "DB haijawezeshwa", status: 503 };
  }
  const { type, subject, description, priority, approver_role, approver_name, approver_id, form_data, attachments } = body;
  if (!type || !subject || !description) {
    return { ok: false, error: "Aina, kichwa na maelezo vinahitajika", status: 400 };
  }

  const refRows = await query<{ ref: string }>(
    `SELECT generate_request_ref($1) AS ref`, [type]
  );
  const ref = refRows[0]?.ref ?? `REQ-${Date.now()}`;

  const { data, error } = await db.from("command_requests").insert({
    reference_no:      ref,
    type,
    subject:           String(subject).trim(),
    description:       String(description).trim(),
    priority:          priority ?? "normal",
    status:            "pending",
    requester_id:      session.user.id,
    requester_name:    session.user.name ?? "",
    requester_role:    session.user.role ?? "",
    requester_dept:    body.requester_dept ?? null,
    requester_region:  (session.user as any).region ?? null,
    requester_station: (session.user as any).station ?? null,
    approver_id:       approver_id ?? null,
    approver_role:     approver_role ?? "NATIONAL_COMMANDER",
    approver_name:     approver_name ?? null,
    attachments:       JSON.stringify(attachments ?? []),
    form_data:         JSON.stringify(form_data ?? {}),
  }).select().single();

  if (error) throw error;
  return { ok: true, data, status: 201 };
});
