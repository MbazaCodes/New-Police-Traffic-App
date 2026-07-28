/**
 * Client-safe dashboard route resolver.
 *
 * This module contains ONLY pure string-mapping functions with NO server-side
 * imports (no pg, no next-auth, no next/headers). It is safe to import from
 * client components ("use client").
 *
 * The canonical resolveDashboardRoute() lives in src/lib/auth.ts but that
 * module imports pg transitively, so it cannot be bundled for the browser.
 * Client components should import from HERE instead.
 */

export type DashboardRole =
  | "SUPER_ADMIN" | "SYSTEM_ADMIN"
  | "NATIONAL_COMMANDER" | "REGIONAL_COMMANDER" | "DISTRICT_COMMANDER" | "STATION_COMMANDER"
  | "TRAFFIC_OFFICER" | "GENERAL_OFFICER" | "POST_OFFICER"
  | "INVESTIGATOR" | "CID_OFFICER" | "CYBER_CRIME"
  | "CLERK" | "NATIONAL_CLERK" | "REGIONAL_CLERK" | "DISTRICT_CLERK"
  | "AUDIT_OFFICER" | "EVIDENCE_OFFICER" | "EMERGENCY_DISPATCHER"
  | "IMMIGRATION_LIAISON" | "PRISON_LIAISON"
  | "DIG" | "VIEWER" | "COMMANDER" | "OFFICER";

const DASHBOARD_ROUTES: Record<DashboardRole, string> = {
  SUPER_ADMIN:          "/admin/dashboard",
  SYSTEM_ADMIN:         "/system/dashboard",
  COMMANDER:            "/command/national/dashboard",
  NATIONAL_COMMANDER:   "/command/national/dashboard",
  REGIONAL_COMMANDER:   "/command/regional/dashboard",
  DISTRICT_COMMANDER:   "/command/district/dashboard",
  STATION_COMMANDER:    "/command/station/dashboard",
  TRAFFIC_OFFICER:      "/officer/traffic/home",
  OFFICER:              "/officer/traffic/home",
  GENERAL_OFFICER:      "/officer/general/home",
  POST_OFFICER:         "/officer/post/home",
  INVESTIGATOR:         "/cid/home",
  CID_OFFICER:          "/cid/home",
  CYBER_CRIME:          "/cid/home",
  CLERK:                "/clerk/records",
  NATIONAL_CLERK:       "/clerk/records",
  REGIONAL_CLERK:       "/clerk/records",
  DISTRICT_CLERK:       "/clerk/records",
  AUDIT_OFFICER:        "/admin/dashboard",
  EVIDENCE_OFFICER:     "/clerk/records",
  EMERGENCY_DISPATCHER: "/system/dashboard",
  IMMIGRATION_LIAISON:  "/viewer/dashboard",
  PRISON_LIAISON:       "/viewer/dashboard",
  DIG:                  "/command/national/dashboard",
  VIEWER:               "/viewer/dashboard",
};

/** Returns the default landing route for the given role. */
export function resolveDashboardRoute(role: string): string {
  return DASHBOARD_ROUTES[role as DashboardRole] ?? "/admin/dashboard";
}
