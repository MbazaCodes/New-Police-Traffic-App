// @tz-police/auth — Authentication & RBAC types and helpers
// Re-exports from the app's auth configuration

export type Role =
  | "SUPER_ADMIN"
  | "COMMANDER"
  | "SYSTEM_ADMIN"
  | "NATIONAL_COMMANDER"
  | "REGIONAL_COMMANDER"
  | "DISTRICT_COMMANDER"
  | "STATION_COMMANDER"
  | "OFFICER"
  | "TRAFFIC_OFFICER"
  | "GENERAL_OFFICER"
  | "INVESTIGATOR"
  | "CLERK"
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
  COMMANDER: 95,
  SYSTEM_ADMIN: 92,
  NATIONAL_COMMANDER: 90,
  REGIONAL_COMMANDER: 80,
  DISTRICT_COMMANDER: 70,
  STATION_COMMANDER: 60,
  OFFICER: 52,
  TRAFFIC_OFFICER: 40,
  GENERAL_OFFICER: 40,
  INVESTIGATOR: 40,
  CLERK: 20,
  VIEWER: 10,
};

export function hasMinRole(userRole: Role, minRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
}

export function isAdminOrHigher(role: Role): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY["DISTRICT_COMMANDER"];
}

export function isCommanderOrHigher(role: Role): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY["NATIONAL_COMMANDER"];
}
