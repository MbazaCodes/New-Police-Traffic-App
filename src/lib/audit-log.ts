// Audit log service for TZ Police Digital Platform.
// In-memory implementation; would be backed by Supabase `audit_logs` table
// in production.

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string; // e.g. "create", "update", "delete", "send_alert"
  resource: string; // e.g. "officers", "citations"
  resourceId: string | null;
  details: Record<string, unknown> | null;
  timestamp: string; // ISO string
  ip?: string | null;
  userAgent?: string | null;
}

// In-memory store (resets on server restart — fine for dev)
const auditStore: AuditLogEntry[] = [];

// Seed with a few entries so the audit-logs API returns data immediately.
auditStore.push(
  {
    id: "AL-SEED-001",
    userId: "ADM-001",
    userName: "CP. Saidi Waziri",
    action: "login",
    resource: "auth",
    resourceId: "ADM-001",
    details: { method: "credentials" },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "AL-SEED-002",
    userId: "ADM-002",
    userName: "ACP. Mariam Juma",
    action: "create",
    resource: "alerts",
    resourceId: "AL-001",
    details: { title: "Gari la Uhalifu limeonekana", audience: "Wote" },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
  },
  {
    id: "AL-SEED-003",
    userId: "TP123456",
    userName: "Insp. Juma Mwinyi",
    action: "create",
    resource: "citations",
    resourceId: "CT-2026-0451",
    details: { plate: "T 003 GHI", offense: "Over Speeding" },
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
);

let counter = 0;
function nextId(): string {
  counter += 1;
  return `AL-${Date.now()}-${counter.toString().padStart(4, "0")}`;
}

/**
 * logAction: append a new audit log entry.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function logAction(
  sessionOrUserId: any,
  action: string,
  resource: string,
  resourceId: string | null,
  details: Record<string, unknown> | null = null,
  userName: string | null = null,
  meta?: { ip?: string | null; userAgent?: string | null },
): AuditLogEntry {
  // Accept either a session object or a userId string
  let userId: string | null = null;
  let resolvedUserName: string | null = userName;
  if (sessionOrUserId && typeof sessionOrUserId === "object") {
    userId = sessionOrUserId?.user?.id ?? null;
    resolvedUserName = resolvedUserName ?? sessionOrUserId?.user?.name ?? null;
  } else {
    userId = sessionOrUserId ?? null;
  }
  const entry: AuditLogEntry = {
    id: nextId(),
    userId,
    userName: resolvedUserName,
    action,
    resource,
    resourceId,
    details,
    timestamp: new Date().toISOString(),
    ip: meta?.ip ?? null,
    userAgent: meta?.userAgent ?? null,
  };
  auditStore.push(entry);
  // Cap memory at 1000 entries to prevent unbounded growth.
  if (auditStore.length > 1000) {
    auditStore.splice(0, auditStore.length - 1000);
  }
  return entry;
}

/**
 * listAuditLogs: retrieve audit log entries (newest first).
 */
export function listAuditLogs(opts?: {
  limit?: number;
  offset?: number;
  resource?: string;
  userId?: string;
  action?: string;
}): AuditLogEntry[] {
  const limit = opts?.limit ?? 100;
  const offset = opts?.offset ?? 0;
  let entries = [...auditStore].reverse();
  if (opts?.resource) {
    entries = entries.filter((e) => e.resource === opts.resource);
  }
  if (opts?.userId) {
    entries = entries.filter((e) => e.userId === opts.userId);
  }
  if (opts?.action) {
    entries = entries.filter((e) => e.action === opts.action);
  }
  return entries.slice(offset, offset + limit);
}

/**
 * clearAuditLogs: clear all entries (admin/testing only).
 */
export function clearAuditLogs(): void {
  auditStore.length = 0;
}
