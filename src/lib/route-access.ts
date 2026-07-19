import type { Role } from "@/lib/auth";

export const ROLE_DEFAULT_ROUTES: Record<Role, string> = {
  SUPER_ADMIN: "/admin/dashboard",
  SYSTEM_ADMIN: "/system/dashboard",
  NATIONAL_COMMANDER: "/command/national/dashboard",
  REGIONAL_COMMANDER: "/command/regional/dashboard",
  DISTRICT_COMMANDER: "/command/district/dashboard",
  STATION_COMMANDER: "/command/station/dashboard",
  TRAFFIC_OFFICER: "/officer/traffic/home",
  GENERAL_OFFICER: "/officer/general/home",
  POST_OFFICER: "/officer/post/home",
  INVESTIGATOR: "/cid/home",
  CLERK: "/clerk/records",
  VIEWER: "/viewer/dashboard",
  // legacy compatibility
  COMMANDER: "/command/national/dashboard",
  OFFICER: "/officer/traffic/home",
};

export const ROLE_ROUTE_PREFIXES: Record<Role, string[]> = {
  SUPER_ADMIN: ["/admin"],
  SYSTEM_ADMIN: ["/system"],
  NATIONAL_COMMANDER: ["/command/national"],
  REGIONAL_COMMANDER: ["/command/regional"],
  DISTRICT_COMMANDER: ["/command/district"],
  STATION_COMMANDER: ["/command/station"],
  TRAFFIC_OFFICER: ["/officer/traffic", "/officer/post"],
  GENERAL_OFFICER: ["/officer/general", "/officer/post"],
  POST_OFFICER: ["/officer/post", "/officer/traffic", "/officer/general"],
  INVESTIGATOR: ["/cid", "/investigator"],
  CLERK: ["/clerk"],
  VIEWER: ["/viewer", "/dashboard"],
  // legacy compatibility
  COMMANDER: ["/command", "/command/national"],
  OFFICER: ["/officer", "/officer/traffic"],
};

export function getDefaultRouteForRole(role: Role): string {
  return ROLE_DEFAULT_ROUTES[role] ?? "/dashboard";
}

export function canRoleAccessPath(role: Role, pathname: string): boolean {
  if (pathname.startsWith("/api")) return true;
  if (pathname === "/unauthorized") return true;

  const allowedPrefixes = ROLE_ROUTE_PREFIXES[role] ?? [];
  return allowedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
