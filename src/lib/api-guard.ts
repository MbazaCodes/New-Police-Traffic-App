// ============================================================
// API ROUTE GUARD — TZ Police Digital Platform
// Centralized authorization, audit logging, and error handling
// for all API route handlers.
//
// PROBLEM THIS SOLVES:
//   Before: Every route repeated 15 lines of boilerplate:
//     const session = await getServerSession();
//     const check = requirePermission(session, "officers", "view");
//     if (!check.ok) return error;
//     const scope = getScope(session);
//     // ... data fetching ...
//     // ... catch (e) { return String(e) }  ← loses details
//
//   After: Routes use withAuth() wrapper:
//     export const GET = withAuth("officers", "view", async ({ session, scope }) => {
//       return { ok: true, data: ... };
//     });
//
//   The wrapper AUTOMATICALLY:
//     1. Extracts the session from NextAuth JWT
//     2. Checks RBAC permission (requirePermission)
//     3. Applies role-based data scope (getScope)
//     4. Logs all mutations to PostgreSQL audit_logs table
//     5. Returns consistent JSON error format
//
// USAGE:
//   import { withAuth } from "@/lib/api-guard";
//
//   // Simple GET — read-only, auto-scoped
//   export const GET = withAuth("citations", "view", async ({ scope, searchParams, db }) => {
//     let q = applyScopeToQuery(db.from("citations"), scope).select("*");
//     if (searchParams.status) q = q.eq("status", searchParams.status);
//     const { data } = await q;
//     return { ok: true, data };
//   });
//
//   // Mutation POST — auto-audited
//   export const POST = withAuth("citations", "create", async ({ body, session, db }) => {
//     const { data } = await db.from("citations").insert(body).select().single();
//     return { ok: true, data, status: 201 };
//   });
//   // ^^^ Audit log entry is automatically created for this POST
//
// ============================================================

import { getServerSession } from "@/lib/auth";
import { requirePermission, type Resource, type Action } from "@/lib/rbac";
import { getScope, type Scope } from "@/lib/data-scope";
import { getDbAdmin, isDbEnabled } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";
import { logAuditEvent } from "@/lib/audit-log";
import { headers as nextHeaders } from "next/headers";
import type { NextRequest } from "next/server";
import type { Session } from "next-auth";

// ── Context passed to every route handler ──────────────────────

export type AuthContext<TBody = unknown> = {
  session: Session;
  scope: Scope;
  db: ReturnType<typeof getDbAdmin>;
  request: Request;
  searchParams: URLSearchParams;
  body: TBody;
  params: Record<string, string | string[]>;
  userId: string;
  userName: string | null;
  /** The resource being accessed (e.g., "officers") */
  resource: Resource;
  /** The action being performed (e.g., "view") */
  action: Action;
};

// ── Return type from handlers ─────────────────────────────────

export type HandlerResult = {
  ok: boolean;
  data?: unknown;
  error?: string;
  status?: number;
  total?: number;
  meta?: Record<string, unknown>;
};

// ── Handler type ──────────────────────────────────────────────

export type AuthHandler<TBody = unknown> = (
  ctx: AuthContext<TBody>
) => Promise<HandlerResult>;

// ── HTTP method to audit action mapping ─────────────────────

const METHOD_ACTION_MAP: Record<string, string> = {
  GET:    "view",
  POST:   "create",
  PUT:    "update",
  PATCH:  "update",
  DELETE: "delete",
};

// ── withAuth: the main route guard factory ────────────────────

/**
 * Wraps an API route handler with:
 *   1. Session extraction (getServerSession)
 *   2. RBAC permission check (requirePermission)
 *   3. Data scope computation (getScope)
 *   4. Body parsing (POST/PUT/PATCH only)
 *   5. Automatic audit logging for mutations
 *   6. Consistent error handling (errMsg)
 *
 * @param resource - The RBAC resource name (e.g., "officers", "citations")
 * @param action   - The RBAC action (e.g., "view", "create", "update", "delete")
 * @param handler  - The actual route handler function
 * @param options  - Optional: disable audit, custom role requirements, etc.
 */
export function withAuth<TBody = unknown>(
  resource: Resource,
  action: Action,
  handler: AuthHandler<TBody>,
  options: {
    /** Skip automatic audit logging for this route (e.g., auth routes) */
    skipAudit?: boolean;
    /** Override the audit action name (e.g., "login" instead of "create") */
    auditAction?: string;
    /** Require specific roles instead of RBAC permission matrix */
    requireRoles?: string[];
  } = {}
): (request: Request, context?: Record<string, string | string[]>) => Promise<Response> {
  return async (request: Request, context?: Record<string, string | string[]>) => {
    const method = request.method.toUpperCase();
    const auditAction = options.auditAction ?? METHOD_ACTION_MAP[method] ?? action;

    try {
      // ── 1. Session extraction ──────────────────────────────
      const session = await getServerSession();

      // ── 2. Authorization check ────────────────────────────
      let authResult;
      if (options.requireRoles) {
        // Use requireRole if specific roles are specified
        const { requireRole } = await import("@/lib/rbac");
        authResult = requireRole(session, options.requireRoles as any);
      } else {
        // Use permission matrix
        authResult = requirePermission(session, resource, action);
      }

      if (!authResult.ok) {
        return NextResponse.json(
          { ok: false, error: authResult.error },
          { status: authResult.status }
        );
      }

      const validatedSession = authResult.session!;

      // ── 3. Data scope ─────────────────────────────────────
      const scope = getScope(validatedSession);

      // ── 4. Request context ──────────────────────────────────
      const url = new URL(request.url);
      const searchParams = url.searchParams;

      // Parse body only for mutation methods
      let body: TBody = {} as TBody;
      if (["POST", "PUT", "PATCH"].includes(method)) {
        body = await request.json().catch(() => ({})) as TBody;
      }

      const db = getDbAdmin();

      const ctx: AuthContext<TBody> = {
        session: validatedSession,
        scope,
        db,
        request,
        searchParams,
        body,
        params: context ?? {},
        userId: validatedSession.user.id,
        userName: validatedSession.user.name,
        resource,
        action,
      };

      // ── 5. Execute handler ────────────────────────────────
      const result = await handler(ctx);

      // ── 6. Auto-audit for mutations ───────────────────────
      if (!options.skipAudit && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        try {
          const resourceId = extractResourceId(result);
          await logAuditEvent({
            userId: validatedSession.user.id,
            userName: validatedSession.user.name ?? null,
            action: auditAction,
            resource: resource as string,
            resourceId,
            details: {
              method,
              ...(body instanceof Object ? body : {}),
            },
            request,
          });
        } catch (auditErr) {
          // Audit failure should NEVER break the response
          console.error("[API-GUARD] Audit log failed:", auditErr);
        }
      }

      // ── 7. Return response ─────────────────────────────────
      return NextResponse.json(result, {
        status: result.status ?? (result.ok ? 200 : 500),
      });
    } catch (err) {
      // ── Consistent error handling ──────────────────────────
      console.error(`[API-GUARD] ${method} /api/${resource}`, err);
      return NextResponse.json(
        { ok: false, error: errMsg(err) },
        { status: 500 }
      );
    }
  };
}

// ── withAuthAny: allow ANY authenticated user ─────────────────
// Skips RBAC check, just requires a valid session.

export function withAuthAny<TBody = unknown>(
  resource: Resource,
  handler: AuthHandler<TBody>,
  options: { skipAudit?: boolean; auditAction?: string } = {}
): (request: Request, context?: Record<string, string | string[]>) => Promise<Response> {
  return async (request: Request, context?: Record<string, string | string[]>) => {
    try {
      const session = await getServerSession();
      if (!session?.user) {
        return NextResponse.json(
          { ok: false, error: "Uthibitishaji umekosea. Tafadhali ingia tena." },
          { status: 401 }
        );
      }

      const scope = getScope(session);
      const url = new URL(request.url);
      const method = request.method.toUpperCase();
      const searchParams = url.searchParams;

      let body: TBody = {} as TBody;
      if (["POST", "PUT", "PATCH"].includes(method)) {
        body = await request.json().catch(() => ({})) as TBody;
      }

      const db = getDbAdmin();

      const ctx: AuthContext<TBody> = {
        session,
        scope,
        db,
        request,
        searchParams,
        body,
        params: context ?? {},
        userId: session.user.id,
        userName: session.user.name,
        resource,
        action: "view",
      };

      const result = await handler(ctx);

      if (!options.skipAudit && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        try {
          const resourceId = extractResourceId(result);
          await logAuditEvent({
            userId: session.user.id,
            userName: session.user.name ?? null,
            action: options.auditAction ?? METHOD_ACTION_MAP[method] ?? "create",
            resource: resource as string,
            resourceId,
            details: { method, ...(body instanceof Object ? body : {}) },
            request,
          });
        } catch (auditErr) {
          console.error("[API-GUARD] Audit log failed:", auditErr);
        }
      }

      return NextResponse.json(result, {
        status: result.status ?? (result.ok ? 200 : 500),
      });
    } catch (err) {
      console.error(`[API-GUARD] ${request.method} /api/${resource}`, err);
      return NextResponse.json(
        { ok: false, error: errMsg(err) },
        { status: 500 }
      );
    }
  };
}

// ── Helper: extract resource ID from handler result ───────────

function extractResourceId(result: HandlerResult): string | null {
  if (!result.data) return null;
  if (typeof result.data === "object" && "id" in (result.data as object)) {
    return String((result.data as { id: unknown }).id);
  }
  return null;
}

// Re-export NextResponse for convenience
export { NextResponse } from "next/server";
