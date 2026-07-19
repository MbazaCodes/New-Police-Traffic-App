// RBAC (Role-Based Access Control) for TZ Police Digital Platform
// Role hierarchy supports expanded government roles and legacy compatibility.

import type { Session } from "next-auth";
import type { Role } from "@/lib/auth";

// ---------------------------------------------------------------------------
// Role hierarchy — higher index = higher privilege
// ---------------------------------------------------------------------------

export const ROLE_HIERARCHY: Role[] = [
  "VIEWER",
  "CLERK",
  "INVESTIGATOR",
  "GENERAL_OFFICER",
  "TRAFFIC_OFFICER",
  "POST_OFFICER",
  "OFFICER",
  "STATION_COMMANDER",
  "DISTRICT_COMMANDER",
  "REGIONAL_COMMANDER",
  "NATIONAL_COMMANDER",
  "SYSTEM_ADMIN",
  "COMMANDER",
  "SUPER_ADMIN",
];

export function getRoleLevel(role: Role): number {
  const idx = ROLE_HIERARCHY.indexOf(role);
  return idx === -1 ? 0 : idx;
}

export function isAtLeast(userRole: Role, minimum: Role): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(minimum);
}

// ---------------------------------------------------------------------------
// Resources & actions
// ---------------------------------------------------------------------------

export type Resource =
  | "officers"
  | "citations"
  | "incidents"
  | "stations"
  | "posts"
  | "assignments"
  | "alerts"
  | "patrols"
  | "search"
  | "users"
  | "pf3"
  | "inspections"
  | "reports"
  | "audit_logs"
  | "arrests"
  | "bail"
  | "citizens"
  | "devices"
  | "vehicles"
  | "warnings"
  | "requests"
  | "fines"
  | "cases"
  | "missing"
  | string;

export type Action = "view" | "create" | "update" | "delete" | "manage";

// ---------------------------------------------------------------------------
// Permissions matrix
// ---------------------------------------------------------------------------

type ActionList = Action[];

const ALL_ACTIONS: ActionList = ["view", "create", "update", "delete", "manage"];

export const PERMISSIONS: Record<Role, Partial<Record<Resource, ActionList>>> = {
  SUPER_ADMIN: {
    officers: ALL_ACTIONS,
    citations: ALL_ACTIONS,
    incidents: ALL_ACTIONS,
    stations: ALL_ACTIONS,
    posts: ALL_ACTIONS,
    assignments: ALL_ACTIONS,
    alerts: ALL_ACTIONS,
    patrols: ALL_ACTIONS,
    search: ALL_ACTIONS,
    users: ALL_ACTIONS,
    pf3: ALL_ACTIONS,
    inspections: ALL_ACTIONS,
    reports: ALL_ACTIONS,
    audit_logs: ALL_ACTIONS,
  },
  COMMANDER: {
    officers: ["view", "create", "update"],
    citations: ["view", "create", "update"],
    incidents: ALL_ACTIONS,
    stations: ["view", "create", "update"],
    posts: ["view", "create", "update", "delete"],
    assignments: ["view", "create", "update", "delete"],
    alerts: ALL_ACTIONS,
    patrols: ["view", "create", "update"],
    search: ["view", "manage"],
    users: ["view", "create", "update"],
    pf3: ALL_ACTIONS,
    inspections: ALL_ACTIONS,
    reports: ALL_ACTIONS,
    audit_logs: ["view"],
  },

  SYSTEM_ADMIN: {
    officers:    ALL_ACTIONS,
    citations:   ALL_ACTIONS,
    incidents:   ALL_ACTIONS,
    stations:    ALL_ACTIONS,
    posts:       ALL_ACTIONS,
    assignments: ALL_ACTIONS,
    alerts:      ALL_ACTIONS,
    patrols:     ALL_ACTIONS,
    search:      ALL_ACTIONS,
    users:       ALL_ACTIONS,
    pf3:         ALL_ACTIONS,
    inspections: ALL_ACTIONS,
    reports:     ALL_ACTIONS,
    audit_logs:  ["view", "create"],
  },

  NATIONAL_COMMANDER: {
    officers: ["view", "create", "update"],
    citations: ["view", "create", "update"],
    incidents: ["view", "create", "update", "delete"],
    stations: ["view", "create", "update"],
    posts: ["view", "create", "update", "delete"],
    assignments: ["view", "create", "update", "delete"],
    alerts: ["view", "create", "update"],
    patrols: ["view", "create", "update"],
    search: ["view", "manage"],
    users: ["view", "create", "update"],
    pf3: ["view", "create", "update"],
    inspections: ["view", "create", "update"],
    reports: ["view", "create", "update"],
    audit_logs: ["view"],
  },
  REGIONAL_COMMANDER: {
    officers: ["view", "create", "update"],
    citations: ["view", "create", "update"],
    incidents: ["view", "create", "update"],
    stations: ["view", "create", "update"],
    posts: ["view", "create", "update"],
    assignments: ["view", "create", "update", "delete"],
    alerts: ["view", "create", "update"],
    patrols: ["view", "create", "update"],
    search: ["view", "manage"],
    users: ["view"],
    pf3: ["view", "create", "update"],
    inspections: ["view", "create", "update"],
    reports: ["view"],
    audit_logs: ["view"],
  },
  DISTRICT_COMMANDER: {
    officers: ["view", "update"],
    citations: ["view", "create", "update"],
    incidents: ["view", "create", "update"],
    stations: ["view"],
    posts: ["view", "create", "update"],
    assignments: ["view", "create", "update", "delete"],
    alerts: ["view", "create"],
    patrols: ["view", "create", "update"],
    search: ["view"],
    users: ["view"],
    pf3: ["view", "create", "update"],
    inspections: ["view", "create", "update"],
    reports: ["view"],
    audit_logs: ["view"],
  },
  STATION_COMMANDER: {
    officers: ["view", "update"],
    citations: ["view", "create", "update"],
    incidents: ["view", "create", "update"],
    stations: ["view"],
    posts: ["view", "create", "update"],
    assignments: ["view", "create", "update", "delete"],
    alerts: ["view", "create"],
    patrols: ["view", "create", "update"],
    search: ["view"],
    users: ["view"],
    pf3: ["view", "create", "update"],
    inspections: ["view", "create", "update"],
    reports: ["view"],
    audit_logs: ["view"],
  },
  OFFICER: {
    officers: ["view"],
    citations: ["view", "create", "update"],
    incidents: ["view", "create", "update"],
    stations: ["view"],
    posts: ["view"],
    assignments: ["view"],
    alerts: ["view"],
    patrols: ["view", "create", "update"],
    search: ["view"],
    users: [],
    pf3: ["view", "create", "update"],
    inspections: ["view", "create", "update"],
    reports: [],
    audit_logs: [],
  },
  TRAFFIC_OFFICER: {
    officers: ["view"],
    citations: ["view", "create", "update"],
    incidents: ["view", "create"],
    stations: ["view"],
    posts: ["view"],
    assignments: ["view"],
    alerts: ["view"],
    patrols: ["view", "create", "update"],
    search: ["view"],
    users: [],
    pf3: ["view", "create"],
    inspections: ["view", "create", "update"],
    reports: [],
    audit_logs: [],
  },
  POST_OFFICER: {
    officers: ["view"],
    citations: ["view", "create", "update"],
    incidents: ["view", "create"],
    stations: ["view"],
    posts: ["view"],
    assignments: ["view"],
    alerts: ["view"],
    patrols: ["view", "create", "update"],
    search: ["view"],
    users: [],
    pf3: ["view", "create"],
    inspections: ["view", "create"],
    reports: ["view"],
    audit_logs: [],
  },
  GENERAL_OFFICER: {
    officers: ["view"],
    citations: ["view"],
    incidents: ["view", "create", "update"],
    stations: ["view"],
    posts: ["view"],
    assignments: ["view"],
    alerts: ["view"],
    patrols: ["view"],
    search: ["view"],
    users: [],
    pf3: ["view"],
    inspections: ["view"],
    reports: ["view", "create"],
    audit_logs: [],
  },
  INVESTIGATOR: {
    officers: ["view"],
    citations: ["view"],
    incidents: ["view", "create", "update"],
    stations: ["view"],
    posts: ["view"],
    assignments: ["view"],
    alerts: ["view"],
    patrols: ["view"],
    search: ["view", "manage"],
    users: [],
    pf3: ["view", "create", "update"],
    inspections: ["view"],
    reports: ["view"],
    audit_logs: [],
  },
  CLERK: {
    officers: ["view"],
    citations: ["view"],
    incidents: ["view"],
    stations: ["view"],
    posts: ["view"],
    assignments: ["view"],
    alerts: ["view"],
    patrols: ["view"],
    search: ["view"],
    users: ["view"],
    pf3: ["view"],
    inspections: ["view"],
    reports: ["view", "create", "update"],
    audit_logs: [],
  },
  VIEWER: {
    officers: ["view"],
    citations: ["view"],
    incidents: ["view"],
    stations: ["view"],
    posts: ["view"],
    assignments: ["view"],
    alerts: ["view"],
    patrols: ["view"],
    search: ["view"],
    users: ["view"],
    pf3: ["view"],
    inspections: ["view"],
    reports: ["view"],
    audit_logs: ["view"],
  },
};

// ---------------------------------------------------------------------------
// Permission helpers
// ---------------------------------------------------------------------------

export function canAccess(
  userRole: Role,
  resource: Resource,
  action: Action,
): boolean {
  const actions = PERMISSIONS[userRole]?.[resource];
  if (!actions) return false;
  if (actions.includes("manage")) return true;
  return actions.includes(action);
}

// ---------------------------------------------------------------------------
// Session-based helpers — used inside route handlers
// ---------------------------------------------------------------------------

export interface AuthCheckResult {
  ok: boolean;
  status: number;
  error?: string;
  session?: Session;
}

/**
 * requireRole: ensures the session exists and the user role is allowed.
 * Returns an error result if unauthorized. Otherwise returns ok=true with
 * the session so callers can proceed.
 *
 * Usage:
 *   const check = requireRole(await getServerSession(), ["OFFICER"]);
 *   if (!check.ok) return NextResponse.json({error: check.error}, {status: check.status});
 */
export function requireRole(
  session: Session | null,
  allowedRoles: Role[],
): AuthCheckResult {
  if (!session?.user) {
    return { ok: false, status: 401, error: "Unauthorized — authentication required" };
  }
  const userRole = session.user.role as Role;
  if (!allowedRoles.includes(userRole)) {
    return { ok: false, status: 403, error: "Forbidden — insufficient role" };
  }
  return { ok: true, status: 200, session };
}

/**
 * requirePermission: ensures the session exists and the user can perform
 * the given action on the given resource.
 */
export function requirePermission(
  session: Session | null,
  resource: Resource,
  action: Action,
): AuthCheckResult {
  if (!session?.user) {
    return { ok: false, status: 401, error: "Unauthorized — authentication required" };
  }
  const userRole = session.user.role as Role;
  if (!canAccess(userRole, resource, action)) {
    return { ok: false, status: 403, error: `Forbidden — cannot ${action} ${resource}` };
  }
  return { ok: true, status: 200, session };
}

// Convenience: all roles that may authenticate (any user)
export const ALL_ROLES: Role[] = [...ROLE_HIERARCHY];

// Convenience: admin-level roles (can manage other users)
export const ADMIN_ROLES: Role[] = ["SUPER_ADMIN", "COMMANDER"];

// Convenience: command-level roles
export const COMMAND_ROLES: Role[] = [
  "SUPER_ADMIN",
  "COMMANDER",
  "SYSTEM_ADMIN",
  "NATIONAL_COMMANDER",
  "REGIONAL_COMMANDER",
  "DISTRICT_COMMANDER",
  "STATION_COMMANDER",
];

// Convenience: officer-level roles (field operations)
export const FIELD_ROLES: Role[] = [
  "OFFICER",
  "TRAFFIC_OFFICER",
  "GENERAL_OFFICER",
  "INVESTIGATOR",
];

export type SearchDomain =
  | "citizens"
  | "vehicles"
  | "incidents"
  | "officers"
  | "cases"
  | "wanted"
  | "pf3"
  | "accidents";

export function getSearchAccessForRole(role: Role): SearchDomain[] {
  switch (role) {
    case "SUPER_ADMIN":
    case "COMMANDER":
    case "NATIONAL_COMMANDER":
      return ["citizens", "vehicles", "incidents", "officers", "cases", "wanted", "pf3", "accidents"];
    case "REGIONAL_COMMANDER":
    case "DISTRICT_COMMANDER":
    case "STATION_COMMANDER":
      return ["citizens", "vehicles", "incidents", "officers", "cases", "pf3", "accidents"];
    case "SYSTEM_ADMIN":
      return ["citizens", "vehicles", "incidents", "officers", "cases"];
    case "TRAFFIC_OFFICER":
      return ["citizens", "vehicles", "pf3", "accidents"];
    case "GENERAL_OFFICER":
      return ["citizens", "incidents"];
    case "INVESTIGATOR":
      return ["citizens", "vehicles", "incidents", "officers", "cases", "wanted", "pf3", "accidents"];
    case "CLERK":
      return ["citizens", "vehicles", "cases"];
    case "VIEWER":
      return ["citizens", "vehicles", "incidents"];
    case "OFFICER":
      return ["citizens", "vehicles", "incidents", "pf3"];
    default:
      return [];
  }
}

export type ScopeContext = {
  role: Role;
  region?: string;
  district?: string;
  station?: string;
  ownerId?: string;
};

export function enforceDataScope<T extends Record<string, unknown>>(
  records: T[],
  context: ScopeContext,
): T[] {
  const { role, region, district, station, ownerId } = context;

  if (role === "SUPER_ADMIN" || role === "COMMANDER" || role === "SYSTEM_ADMIN" || role === "NATIONAL_COMMANDER") {
    return records;
  }

  if (role === "REGIONAL_COMMANDER") {
    return records.filter((r) => String(r.region ?? "") === String(region ?? ""));
  }

  if (role === "DISTRICT_COMMANDER") {
    return records.filter((r) => String(r.district ?? "") === String(district ?? ""));
  }

  if (role === "STATION_COMMANDER") {
    return records.filter((r) => String(r.station ?? "") === String(station ?? ""));
  }

  if (role === "TRAFFIC_OFFICER" || role === "GENERAL_OFFICER" || role === "OFFICER" || role === "INVESTIGATOR") {
    return records.filter((r) => {
      const owner = String(r.ownerId ?? r.officerId ?? r.assignedToId ?? r.createdBy ?? "");
      return ownerId ? owner === ownerId : false;
    });
  }

  if (role === "CLERK" || role === "VIEWER") {
    return records.filter((r) => Boolean(r.isPublic));
  }

  return [];
}
