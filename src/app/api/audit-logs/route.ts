// Audit logs API — PostgreSQL-backed audit trail
// Refactored: uses api-guard for auth, upgraded to async PostgreSQL queries
import { withAuth } from "@/lib/api-guard";
import { listAuditLogs } from "@/lib/audit-log";

// GET /api/audit-logs → list audit log entries (newest first)
// Now reads from PostgreSQL audit_logs table (not in-memory)
export const GET = withAuth("audit_logs", "view", async ({ searchParams }) => {
  const result = await listAuditLogs({
    limit:    Number(searchParams.get("limit") ?? 100),
    offset:   Number(searchParams.get("offset") ?? 0),
    resource: searchParams.get("resource") ?? undefined,
    userId:   searchParams.get("userId") ?? undefined,
    action:   searchParams.get("action") ?? undefined,
    startDate: searchParams.get("from") ?? undefined,
    endDate:   searchParams.get("to") ?? undefined,
  });
  return { ok: true, ...result };
});
