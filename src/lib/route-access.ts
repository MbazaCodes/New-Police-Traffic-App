import type { Role } from "@/lib/auth";

export const ROLE_DEFAULT_ROUTES: Record<string, string> = {
  SUPER_ADMIN:           "/admin/dashboard",
  SYSTEM_ADMIN:          "/system/dashboard",
  NATIONAL_COMMANDER:    "/command/national/dashboard",
  REGIONAL_COMMANDER:    "/command/regional/dashboard",
  DISTRICT_COMMANDER:    "/command/district/dashboard",
  STATION_COMMANDER:     "/command/station/dashboard",
  TRAFFIC_OFFICER:       "/officer/traffic/home",
  GENERAL_OFFICER:       "/officer/general/home",
  POST_OFFICER:          "/officer/post/home",
  INVESTIGATOR:          "/cid/home",
  CLERK:                 "/clerk/records",
  NATIONAL_CLERK:        "/clerk/records",
  REGIONAL_CLERK:        "/clerk/records",
  DISTRICT_CLERK:        "/clerk/records",
  AUDIT_OFFICER:         "/admin/dashboard",
  EVIDENCE_OFFICER:      "/clerk/records",
  EMERGENCY_DISPATCHER:  "/system/dashboard",
  IMMIGRATION_LIAISON:   "/viewer/dashboard",
  PRISON_LIAISON:        "/viewer/dashboard",
  DIG:                   "/command/national/dashboard",
  VIEWER:                "/viewer/dashboard",
  COMMANDER:             "/command/national/dashboard",
  OFFICER:               "/officer/traffic/home",
};

export const ROLE_ROUTE_PREFIXES: Record<string, string[]> = {
  SUPER_ADMIN:           ["/admin", "/command", "/officer", "/cid", "/clerk", "/system", "/viewer"],
  SYSTEM_ADMIN:          ["/system", "/admin"],
  NATIONAL_COMMANDER:    ["/command/national", "/command"],
  REGIONAL_COMMANDER:    ["/command/regional", "/command"],
  DISTRICT_COMMANDER:    ["/command/district", "/command"],
  STATION_COMMANDER:     ["/command/station", "/command"],
  TRAFFIC_OFFICER:       ["/officer/traffic", "/officer/post"],
  GENERAL_OFFICER:       ["/officer/general", "/officer/post"],
  POST_OFFICER:          ["/officer/post", "/officer/traffic", "/officer/general"],
  INVESTIGATOR:          ["/cid"],
  CLERK:                 ["/clerk"],
  NATIONAL_CLERK:        ["/clerk"],
  REGIONAL_CLERK:        ["/clerk"],
  DISTRICT_CLERK:        ["/clerk"],
  AUDIT_OFFICER:         ["/admin", "/clerk"],
  EVIDENCE_OFFICER:      ["/clerk"],
  EMERGENCY_DISPATCHER:  ["/system", "/viewer"],
  IMMIGRATION_LIAISON:   ["/viewer"],
  PRISON_LIAISON:        ["/viewer"],
  DIG:                   ["/command/national", "/command"],
  VIEWER:                ["/viewer"],
  COMMANDER:             ["/command"],
  OFFICER:               ["/officer"],
};

export function getDefaultRouteForRole(role: string): string {
  return ROLE_DEFAULT_ROUTES[role] ?? "/admin/dashboard";
}

export function canRoleAccessPath(role: string, pathname: string): boolean {
  if (pathname.startsWith("/api")) return true;
  if (pathname === "/unauthorized") return true;
  // Super admin and admin can access everything
  if (role === "SUPER_ADMIN" || role === "SYSTEM_ADMIN") return true;
  const allowedPrefixes = ROLE_ROUTE_PREFIXES[role] ?? [];
  // Unknown roles: allow access (they passed auth, let them in)
  if (!allowedPrefixes.length) return true;
  return allowedPrefixes.some(p => pathname === p || pathname.startsWith(`${p}/`));
}
