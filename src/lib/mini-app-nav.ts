export type MiniNavItem = {
  label: string;
  href: string;
};

export type MiniAppNavConfig = {
  id: string;
  label: string;
  basePath: string;
  roleItems: MiniNavItem[];
};

const UNIVERSAL_ITEMS: MiniNavItem[] = [
  { label: "Notifications", href: "notifications" },
  { label: "Settings", href: "settings" },
  { label: "Profile", href: "profile" },
  { label: "Help", href: "help" },
  { label: "Logout", href: "logout" },
];

export const MINI_APP_NAVS: MiniAppNavConfig[] = [
  {
    id: "super-admin",
    label: "Super Admin",
    basePath: "/admin",
    roleItems: [
      { label: "Dashboard", href: "dashboard" },
      { label: "Users", href: "users" },
      { label: "Roles", href: "roles" },
      { label: "Permissions", href: "permissions" },
      { label: "Regions", href: "regions" },
      { label: "Districts", href: "districts" },
      { label: "Stations", href: "stations" },
      { label: "Citizens", href: "citizens" },
      { label: "Vehicles", href: "vehicles" },
      { label: "Cases", href: "cases" },
      { label: "Reports", href: "reports" },
      { label: "Analytics", href: "analytics" },
      { label: "Notifications", href: "notifications" },
      
      
      { label: "Audit Logs", href: "audit-logs" },
      { label: "Settings", href: "settings" },
      { label: "Profile", href: "profile" },
    ],
  },
  {
    id: "system-admin",
    label: "System Admin",
    basePath: "/system",
    roleItems: [
      { label: "Dashboard", href: "dashboard" },
      { label: "User Management", href: "user-management" },
      { label: "System Health", href: "system-health" },
      { label: "Integrations", href: "integrations" },
      { label: "Notifications", href: "notifications" },
      { label: "Reports", href: "reports" },
      { label: "Settings", href: "settings" },
      { label: "Profile", href: "profile" },
    ],
  },
  {
    id: "national-commander",
    label: "National Commander",
    basePath: "/command/national",
    roleItems: [
      { label: "Dashboard", href: "dashboard" },
      { label: "National Analytics", href: "analytics" },
      { label: "Regions", href: "regions" },
      { label: "Stations", href: "stations" },
      { label: "Officers", href: "officers" },
      { label: "Cases", href: "cases" },
      { label: "Reports", href: "reports" },
      { label: "Notifications", href: "notifications" },
      { label: "Profile", href: "profile" },
    ],
  },
  {
    id: "regional-commander",
    label: "Regional Commander",
    basePath: "/command/regional",
    roleItems: [
      { label: "Dashboard", href: "dashboard" },
      { label: "Regional Analytics", href: "analytics" },
      { label: "Stations", href: "stations" },
      { label: "Officers", href: "officers" },
      { label: "Cases", href: "cases" },
      { label: "Reports", href: "reports" },
      { label: "Notifications", href: "notifications" },
      { label: "Profile", href: "profile" },
    ],
  },
  {
    id: "district-commander",
    label: "District Commander",
    basePath: "/command/district",
    roleItems: [
      { label: "Dashboard", href: "dashboard" },
      { label: "Stations", href: "stations" },
      { label: "Officers", href: "officers" },
      { label: "Cases", href: "cases" },
      { label: "Reports", href: "reports" },
      { label: "Notifications", href: "notifications" },
      { label: "Profile", href: "profile" },
    ],
  },
  {
    id: "station-commander",
    label: "Station Commander",
    basePath: "/command/station",
    roleItems: [
      { label: "Dashboard", href: "dashboard" },
      { label: "Officers", href: "officers" },
      { label: "Daily Reports", href: "daily-reports" },
      { label: "Fines", href: "fines" },
      { label: "Cases", href: "cases" },
      { label: "Notifications", href: "notifications" },
      { label: "Profile", href: "profile" },
    ],
  },
  {
    id: "traffic-officer",
    label: "Traffic Officer",
    basePath: "/officer/traffic",
    roleItems: [
      { label: "Home", href: "home" },
      { label: "Search Citizen", href: "search-citizen" },
      { label: "Search Vehicle", href: "search-vehicle" },
      { label: "Citations", href: "citations" },
      { label: "PF3", href: "pf3" },
      { label: "Vehicle Inspection", href: "vehicle-inspection" },
      { label: "Accident Reports", href: "accident-report" },
      { label: "Patrol", href: "patrols" },
      { label: "History", href: "history" },
      { label: "Notifications", href: "notifications" },
      { label: "Profile", href: "profile" },
    ],
  },
  {
    id: "general-officer",
    label: "General Officer",
    basePath: "/officer/general",
    roleItems: [
      { label: "Home", href: "home" },
      { label: "Search", href: "search" },
      { label: "Incidents", href: "incidents" },
      { label: "Arrests", href: "arrests" },
      { label: "Reports", href: "reports" },
      { label: "History", href: "history" },
      { label: "Notifications", href: "notifications" },
      { label: "Profile", href: "profile" },
    ],
  },
  {
    id: "cid",
    label: "CID / Investigator",
    basePath: "/cid",
    roleItems: [
      { label: "Home", href: "home" },
      { label: "Investigations", href: "investigations" },
      { label: "Reports", href: "reports" },
      { label: "Evidence", href: "evidence" },
      { label: "Suspects", href: "suspects" },
      { label: "Interviews", href: "interviews" },
      { label: "Wanted Persons", href: "wanted-persons" },
      { label: "Cases", href: "cases" },
      { label: "Notifications", href: "notifications" },
      { label: "Profile", href: "profile" },
    ],
  },
  {
    id: "clerk",
    label: "Clerk",
    basePath: "/clerk",
    roleItems: [
      { label: "Police Data Entry", href: "records" },
      { label: "Dashboard", href: "dashboard" },
      { label: "Documents", href: "documents" },
      { label: "Exports", href: "exports" },
      { label: "Notifications", href: "notifications" },
      { label: "Profile", href: "profile" },
    ],
  },
  {
    id: "viewer",
    label: "Viewer",
    basePath: "/viewer",
    roleItems: [
      { label: "Dashboard", href: "dashboard" },
      { label: "Reports", href: "reports" },
      { label: "Profile", href: "profile" },
    ],
  },
];

export function findMiniAppForPath(pathname: string): MiniAppNavConfig | null {
  for (const app of MINI_APP_NAVS) {
    if (pathname === app.basePath || pathname.startsWith(`${app.basePath}/`)) {
      return app;
    }
  }

  // Backward compatibility: legacy investigator routes use CID nav.
  if (pathname === "/investigator" || pathname.startsWith("/investigator/")) {
    return MINI_APP_NAVS.find((app) => app.id === "cid") ?? null;
  }

  return null;
}

export function toAbsoluteHref(basePath: string, href: string): string {
  return `${basePath}/${href}`.replace(/\/+/g, "/");
}

export function getUniversalItemsForApp(app: MiniAppNavConfig): MiniNavItem[] {
  const existing = new Set(app.roleItems.map((item) => item.href));
  return UNIVERSAL_ITEMS.filter((item) => !existing.has(item.href));
}
