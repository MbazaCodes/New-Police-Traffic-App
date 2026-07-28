// ============================================================
// AUDIT LOG — TZ Police Digital Platform
// PostgreSQL-backed audit logging for all platform operations.
//
// ARCHITECTURE:
//   Primary: PostgreSQL `audit_logs` table (persistent, queryable)
//   Fallback: In-memory store (dev/testing when DB is unavailable)
//
// The api-guard.ts wrapper calls logAuditEvent() automatically
// for all mutation routes (POST/PUT/PATCH/DELETE). Individual
// routes can also call it manually for custom events.
//
// USAGE (automatic — via api-guard):
//   export const POST = withAuth("officers", "create", async ({ body, db }) => {
//     const { data } = await db.from("officers").insert(body).select().single();
//     return { ok: true, data };
//   });
//   // ↑ Audit log entry created automatically
//
// USAGE (manual — for custom events):
//   import { logAuditEvent } from "@/lib/audit-log";
//   await logAuditEvent({ userId, action: "login", resource: "auth", ... });
//
// ============================================================

import { getDbAdmin, isDbEnabled, query } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  user_name: string | null;
  action: string;
  resource: string;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// ── In-memory fallback store ─────────────────────────────────
const memoryStore: AuditLogEntry[] = [];
let memoryCounter = 0;

// ── Generate ID ─────────────────────────────────────────────
function generateId(): string {
  memoryCounter += 1;
  return `AL-${Date.now()}-${memoryCounter.toString().padStart(4, "0")}`;
}

// ── Extract IP and User-Agent from request ───────────────────
function extractRequestMeta(request?: Request): { ip: string | null; userAgent: string | null } {
  if (!request) return { ip: null, userAgent: null };
  // IP may be forwarded by proxy
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? null;
  const userAgent = request.headers.get("user-agent") ?? null;
  return { ip, userAgent };
}

// ── Core logging function ────────────────────────────────────
// This is the single function called by everything (api-guard, manual calls).

export type AuditEventInput = {
  userId: string | null;
  userName?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  details?: Record<string, unknown> | null;
  request?: Request;
};

/**
 * logAuditEvent: Create an audit log entry.
 * Writes to PostgreSQL when available, falls back to in-memory.
 *
 * This function is:
 *   - Fire-and-forget (errors are logged but never thrown)
 *   - Non-blocking (called via api-guard after response is ready)
 *   - Safe to call from any context (route handler, background task)
 */
export async function logAuditEvent(input: AuditEventInput): Promise<AuditLogEntry> {
  const { ip, userAgent } = extractRequestMeta(input.request);
  const entry: AuditLogEntry = {
    id: generateId(),
    user_id: input.userId,
    user_name: input.userName ?? null,
    action: input.action,
    resource: input.resource,
    resource_id: input.resourceId ?? null,
    details: input.details ?? null,
    ip_address: ip,
    user_agent: userAgent,
    created_at: new Date().toISOString(),
  };

  // ── Try PostgreSQL first ──────────────────────────────────
  if (isDbEnabled()) {
    try {
      await query(
        `INSERT INTO audit_logs (user_id, user_name, action, resource, resource_id, details, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          entry.user_id,
          entry.user_name,
          entry.action,
          entry.resource,
          entry.resource_id,
          entry.details ? JSON.stringify(entry.details) : null,
          entry.ip_address,
          entry.user_agent,
        ]
      );
      return entry;
    } catch (err) {
      console.error("[AUDIT] PostgreSQL write failed, falling back to memory:", errMsg(err));
    }
  }

  // ── Fallback: in-memory ────────────────────────────────────
  memoryStore.push(entry);
  if (memoryStore.length > 1000) {
    memoryStore.splice(0, memoryStore.length - 1000);
  }
  return entry;
}

/**
 * logAction: Legacy-compatible synchronous wrapper.
 * Kept for backward compatibility with routes that call it directly.
 * Now writes to PostgreSQL asynchronously in the background.
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
  let userId: string | null = null;
  let resolvedUserName: string | null = userName;
  if (sessionOrUserId && typeof sessionOrUserId === "object") {
    userId = sessionOrUserId?.user?.id ?? null;
    resolvedUserName = resolvedUserName ?? sessionOrUserId?.user?.name ?? null;
  } else {
    userId = sessionOrUserId ?? null;
  }

  const entry: AuditLogEntry = {
    id: generateId(),
    user_id: userId,
    user_name: resolvedUserName,
    action,
    resource,
    resource_id: resourceId,
    details,
    ip_address: meta?.ip ?? null,
    user_agent: meta?.userAgent ?? null,
    created_at: new Date().toISOString(),
  };

  // Fire-and-forget PostgreSQL write
  if (isDbEnabled()) {
    query(
      `INSERT INTO audit_logs (user_id, user_name, action, resource, resource_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        entry.user_id, entry.user_name, entry.action, entry.resource,
        entry.resource_id,
        entry.details ? JSON.stringify(entry.details) : null,
        entry.ip_address, entry.user_agent,
      ]
    ).catch((err) => {
      console.error("[AUDIT] Background PG write failed:", errMsg(err));
      // Fallback to memory
      memoryStore.push(entry);
      if (memoryStore.length > 1000) memoryStore.splice(0, memoryStore.length - 1000);
    });
  } else {
    memoryStore.push(entry);
    if (memoryStore.length > 1000) memoryStore.splice(0, memoryStore.length - 1000);
  }

  return entry;
}

// ── Query functions ──────────────────────────────────────────

export async function listAuditLogs(opts?: {
  limit?: number;
  offset?: number;
  resource?: string;
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ data: AuditLogEntry[]; total: number }> {
  if (isDbEnabled()) {
    try {
      const conditions: string[] = [];
      const params: unknown[] = [];

      if (opts?.resource) {
        params.push(opts.resource);
        conditions.push(`resource = $${params.length}`);
      }
      if (opts?.userId) {
        params.push(opts.userId);
        conditions.push(`user_id = $${params.length}`);
      }
      if (opts?.action) {
        params.push(opts.action);
        conditions.push(`action = $${params.length}`);
      }
      if (opts?.startDate) {
        params.push(opts.startDate);
        conditions.push(`created_at >= $${params.length}`);
      }
      if (opts?.endDate) {
        params.push(opts.endDate);
        conditions.push(`created_at <= $${params.length}`);
      }

      const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

      const countRow = await query(`SELECT COUNT(*)::int as total FROM audit_logs ${where}`, params);
      const total = countRow[0]?.total ?? 0;

      const limit = opts?.limit ?? 100;
      const offset = opts?.offset ?? 0;
      params.push(limit, offset);

      const rows = await query(
        `SELECT id, user_id, user_name, action, resource, resource_id, details, ip_address, user_agent, created_at
         FROM audit_logs ${where}
         ORDER BY created_at DESC
         LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params
      );

      return {
        data: rows.map((r) => ({
          ...r,
          details: typeof r.details === "string" ? JSON.parse(r.details) : r.details,
        })) as AuditLogEntry[],
        total,
      };
    } catch (err) {
      console.error("[AUDIT] PostgreSQL read failed:", errMsg(err));
    }
  }

  // Fallback: in-memory
  let entries = [...memoryStore].reverse();
  if (opts?.resource) entries = entries.filter((e) => e.resource === opts.resource);
  if (opts?.userId) entries = entries.filter((e) => e.user_id === opts.userId);
  if (opts?.action) entries = entries.filter((e) => e.action === opts.action);
  const limit = opts?.limit ?? 100;
  const offset = opts?.offset ?? 0;
  return { data: entries.slice(offset, offset + limit), total: entries.length };
}

export function clearAuditLogs(): void {
  memoryStore.length = 0;
}
