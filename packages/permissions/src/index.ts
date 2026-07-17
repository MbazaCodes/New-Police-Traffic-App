// @tz-police/permissions — Permission matrix for role-based access control

import type { Role } from "@tz-police/auth";

export type Resource =
  | "users"
  | "officers"
  | "stations"
  | "posts"
  | "assignments"
  | "citations"
  | "incidents"
  | "patrols"
  | "alerts"
  | "pf3"
  | "inspections"
  | "reports"
  | "audit_logs"
  | "settings";

export type Action = "read" | "create" | "update" | "delete" | "broadcast" | "assign";

// Permission matrix: role → resource → allowed actions
export const PERMISSIONS: Record<Role, Partial<Record<Resource, Action[]>>> = {
  SUPER_ADMIN: {
    users: ["read", "create", "update", "delete"],
    officers: ["read", "create", "update", "delete"],
    stations: ["read", "create", "update", "delete"],
    posts: ["read", "create", "update", "delete"],
    assignments: ["read", "create", "update", "delete"],
    citations: ["read", "create", "update", "delete"],
    incidents: ["read", "create", "update", "delete", "assign"],
    patrols: ["read", "create", "update", "delete"],
    alerts: ["read", "create", "broadcast"],
    pf3: ["read", "create", "update", "delete"],
    inspections: ["read", "create", "update", "delete"],
    reports: ["read"],
    audit_logs: ["read"],
    settings: ["read", "update"],
  },
  SYSTEM_ADMIN: {
    users: ["read", "create", "update"],
    officers: ["read", "update"],
    stations: ["read", "update"],
    posts: ["read", "update"],
    assignments: ["read", "create", "update"],
    citations: ["read"],
    incidents: ["read"],
    patrols: ["read"],
    alerts: ["read"],
    reports: ["read"],
    settings: ["read", "update"],
  },
  NATIONAL_COMMANDER: {
    users: ["read"],
    officers: ["read", "create", "update"],
    stations: ["read", "create", "update"],
    posts: ["read", "create", "update"],
    assignments: ["read", "create", "update", "delete"],
    citations: ["read", "create", "update"],
    incidents: ["read", "create", "update", "assign"],
    patrols: ["read", "create", "update"],
    alerts: ["read", "create", "broadcast"],
    pf3: ["read", "create", "update"],
    inspections: ["read", "create", "update"],
    reports: ["read"],
    audit_logs: ["read"],
    settings: ["read", "update"],
  },
  COMMANDER: {
    users: ["read"],
    officers: ["read", "create", "update"],
    stations: ["read", "create", "update"],
    posts: ["read", "create", "update"],
    assignments: ["read", "create", "update", "delete"],
    citations: ["read", "create", "update"],
    incidents: ["read", "create", "update", "assign"],
    patrols: ["read", "create", "update"],
    alerts: ["read", "create", "broadcast"],
    pf3: ["read", "create", "update"],
    inspections: ["read", "create", "update"],
    reports: ["read"],
    audit_logs: ["read"],
    settings: ["read", "update"],
  },
  REGIONAL_COMMANDER: {
    officers: ["read", "update"],
    stations: ["read"],
    posts: ["read"],
    assignments: ["read", "create", "update"],
    citations: ["read", "create", "update"],
    incidents: ["read", "create", "update", "assign"],
    patrols: ["read", "create", "update"],
    alerts: ["read", "create", "broadcast"],
    pf3: ["read", "create", "update"],
    inspections: ["read", "create", "update"],
    reports: ["read"],
    settings: ["read"],
  },
  DISTRICT_COMMANDER: {
    officers: ["read", "update"],
    stations: ["read"],
    posts: ["read"],
    assignments: ["read", "create", "update"],
    citations: ["read", "create", "update"],
    incidents: ["read", "create", "update", "assign"],
    patrols: ["read", "create", "update"],
    alerts: ["read", "create", "broadcast"],
    pf3: ["read", "create", "update"],
    inspections: ["read", "create", "update"],
    reports: ["read"],
    settings: ["read"],
  },
  STATION_COMMANDER: {
    officers: ["read", "update"],
    assignments: ["read", "create", "update"],
    citations: ["read", "create", "update"],
    incidents: ["read", "create", "update", "assign"],
    patrols: ["read", "create", "update"],
    alerts: ["read", "create"],
    pf3: ["read", "create", "update"],
    inspections: ["read", "create", "update"],
    reports: ["read"],
    settings: ["read"],
  },
  OFFICER: {
    officers: ["read"],
    citations: ["read", "create", "update"],
    incidents: ["read", "create", "update"],
    patrols: ["read", "create", "update"],
    alerts: ["read"],
    pf3: ["read", "create"],
    inspections: ["read", "create"],
    settings: ["read"],
  },
  TRAFFIC_OFFICER: {
    officers: ["read"],
    citations: ["read", "create", "update"],
    incidents: ["read", "create"],
    patrols: ["read", "create", "update"],
    alerts: ["read"],
    inspections: ["read", "create"],
    pf3: ["read", "create"],
    settings: ["read"],
  },
  GENERAL_OFFICER: {
    officers: ["read"],
    incidents: ["read", "create", "update"],
    alerts: ["read"],
    reports: ["read", "create"],
    settings: ["read"],
  },
  INVESTIGATOR: {
    officers: ["read"],
    incidents: ["read", "create", "update"],
    pf3: ["read", "create", "update"],
    citations: ["read"],
    alerts: ["read"],
    settings: ["read"],
  },
  CLERK: {
    users: ["read"],
    reports: ["read", "create"],
    citations: ["read"],
    incidents: ["read"],
    settings: ["read", "update"],
  },
  VIEWER: {
    officers: ["read"],
    citations: ["read"],
    incidents: ["read"],
    patrols: ["read"],
    alerts: ["read"],
    reports: ["read"],
    settings: ["read"],
  },
};

export function canAccess(role: Role, resource: Resource, action: Action): boolean {
  const actions = PERMISSIONS[role]?.[resource];
  return actions?.includes(action) ?? false;
}

export function getAccessibleResources(role: Role): Resource[] {
  const rolePerms = PERMISSIONS[role];
  if (!rolePerms) return [];
  return Object.keys(rolePerms).filter((r) => (rolePerms as Record<string, Action[]>)[r].length > 0) as Resource[];
}
