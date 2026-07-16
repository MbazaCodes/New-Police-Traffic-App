// @tz-police/auth — Authentication & RBAC types and helpers
// Re-exports from the app's auth configuration

export type Role =
  | "SUPER_ADMIN"
  | "COMMANDER"
  | "REGIONAL_COMMANDER"
  | "DISTRICT_COMMANDER"
  | "OFFICER"
  | "TRAFFIC_OFFICER"
  | "INVESTIGATOR"
  | "VIEWER";

export interface SessionUser {
  id: string;
  name: string;
  role: Role;
  idNumber: string;
  station?: string;
  email?: string;
  image?: string;
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 100,
  COMMANDER: 90,
  REGIONAL_COMMANDER: 80,
  DISTRICT_COMMANDER: 70,
  OFFICER: 50,
  TRAFFIC_OFFICER: 40,
  INVESTIGATOR: 40,
  VIEWER: 10,
};

export function hasMinRole(userRole: Role, minRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
}

export function isAdminOrHigher(role: Role): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY["DISTRICT_COMMANDER"];
}

export function isCommanderOrHigher(role: Role): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY["COMMANDER"];
}
