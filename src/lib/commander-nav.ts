/**
 * Shared navigation configuration for the Command Shell.
 *
 * This module is the single source of truth for the commander sidebar nav,
 * the per-tier (national / regional / district / station) screen allow-lists,
 * and URL→screen mapping helpers used by both:
 *   - src/components/command/command-shell.tsx  (dedicated CommandShell)
 *   - src/components/admin/admin-shell.tsx      (still used by /admin routes)
 *
 * Extracting these constants here prevents drift between the two shells and
 * makes it trivial to add a new commander screen in one place.
 */

import type { AdminScreen } from "@/store/police-store";
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  FileText,
  Shield,
  Bell,
  BarChart3,
  Settings,
  Building2,
  Network,
  ArrowRightLeft,
} from "lucide-react";

/** A commander screen ID (reuses the AdminScreen union for compatibility). */
export type CommandScreen = AdminScreen;

/** Nav item shape for the commander sidebar. */
// R1 (stabilize): added optional `badge` — admin-shell.tsx and
// commander shells render badge counts on nav items; the previous
// missing property caused TS2339 in 4 shells.
export interface CommandNavItem {
  id: CommandScreen;
  label: string;
  icon: typeof LayoutDashboard;
  group?: string;
  badge?: string | number;
}

/**
 * Full commander nav — 14 screens grouped into "Uendeshaji" (Operations)
 * and "Usimamizi" (Management). Each tier filters this list down via the
 * CMD_* allow-lists below.
 */
export const COMMANDER_NAV: CommandNavItem[] = [
  { id: "dashboard", label: "Dashibodi", icon: LayoutDashboard, group: "" },
  { id: "officers", label: "Maafisa", icon: Users, group: "Uendeshaji" },
  { id: "incidents", label: "Matukio", icon: AlertTriangle, group: "Uendeshaji" },
  { id: "citations", label: "Citations", icon: FileText, group: "Uendeshaji" },
  { id: "patrols", label: "Patroli", icon: Shield, group: "Uendeshaji" },
  { id: "alerts", label: "Arifa", icon: Bell, group: "Uendeshaji" },
  { id: "detained-citizens", label: "Wafungwa", icon: Shield, group: "Uendeshaji" },
  { id: "waliokamatwa", label: "Waliokamatwa", icon: Users, group: "Uendeshaji" },
  { id: "missing", label: "Wanaotafutwa", icon: AlertTriangle, group: "Uendeshaji" },
  { id: "reports", label: "Ripoti", icon: BarChart3, group: "Uendeshaji" },
  { id: "stations", label: "Vituo", icon: Building2, group: "Usimamizi" },
  { id: "posts", label: "Posti", icon: Network, group: "Usimamizi" },
  { id: "assignments", label: "Mgao", icon: ArrowRightLeft, group: "Usimamizi" },
  { id: "settings", label: "Mipangilio", icon: Settings, group: "" },
];

/* ── Per-tier screen allow-lists ────────────────────────────────────────── */

/** National commander + DIG — full operational + management set (14 items). */
export const CMD_ALL: CommandScreen[] = [
  "dashboard", "officers", "incidents", "citations", "patrols", "alerts",
  "detained-citizens", "waliokamatwa", "missing", "reports",
  "stations", "posts", "assignments", "settings",
];

/** Regional commander — drops `stations` (managed at national/district level). */
export const CMD_REGIONAL: CommandScreen[] = CMD_ALL.filter(
  (id) => id !== "stations",
);

/** District commander — operational only, no station/post/assignment mgmt. */
export const CMD_DISTRICT: CommandScreen[] = [
  "dashboard", "officers", "incidents", "citations", "patrols", "alerts",
  "detained-citizens", "waliokamatwa", "missing", "reports", "settings",
];

/** Station commander — same as district (operational only). */
export const CMD_STATION: CommandScreen[] = [
  "dashboard", "officers", "incidents", "citations", "patrols", "alerts",
  "detained-citizens", "waliokamatwa", "missing", "settings",
];

/**
 * Returns the commander nav items filtered for the given auth role.
 *
 * Falls back to the full CMD_ALL set if the role is unrecognised, so a new
 * commander role never sees an empty sidebar.
 */
export function getCommanderNavForRole(
  authRole: string | null | undefined,
): CommandNavItem[] {
  if (
    authRole === "NATIONAL_COMMANDER" ||
    authRole === "DIG" ||
    authRole === "COMMANDER"
  ) {
    return COMMANDER_NAV.filter((n) => CMD_ALL.includes(n.id));
  }
  if (authRole === "REGIONAL_COMMANDER") {
    return COMMANDER_NAV.filter((n) => CMD_REGIONAL.includes(n.id));
  }
  if (authRole === "DISTRICT_COMMANDER") {
    return COMMANDER_NAV.filter((n) => CMD_DISTRICT.includes(n.id));
  }
  if (authRole === "STATION_COMMANDER") {
    return COMMANDER_NAV.filter((n) => CMD_STATION.includes(n.id));
  }
  // Default: full set (safe fallback)
  return COMMANDER_NAV.filter((n) => CMD_ALL.includes(n.id));
}

/* ── URL helpers ────────────────────────────────────────────────────────── */

/**
 * Maps a URL page segment (e.g. "cases", "analytics", "notifications") to a
 * canonical CommandScreen ID. Many real-world routes are aliases of the same
 * underlying screen — e.g. `/cases` and `/incidents` both render
 * <AdminIncidents />, `/notifications` and `/alerts` both render
 * <AdminAlerts />.
 */
const PAGE_TO_SCREEN: Record<string, CommandScreen> = {
  dashboard: "dashboard",
  officers: "officers",
  incidents: "incidents",
  cases: "incidents", // cases ≈ incidents
  citations: "citations",
  fines: "citations", // fines ≈ citations
  patrols: "patrols",
  alerts: "alerts",
  notifications: "alerts", // notifications ≈ alerts
  "detained-citizens": "detained-citizens",
  waliokamatwa: "waliokamatwa",
  missing: "missing",
  reports: "reports",
  "daily-reports": "reports", // daily-reports ≈ reports
  analytics: "reports", // analytics ≈ reports
  stations: "stations",
  regions: "stations", // regions ≈ stations
  posts: "posts",
  assignments: "assignments",
  settings: "settings",
  profile: "settings", // profile ≈ settings
  help: "settings", // help ≈ settings (placeholder)
};

/**
 * Extracts the active screen from a pathname like
 * `/command/national/officers` → `"officers"`.
 *
 * Returns `"dashboard"` for unrecognised or missing page segments.
 */
export function getScreenFromPathname(pathname: string): CommandScreen {
  const segments = pathname.split("/").filter(Boolean);
  // segments[0] = "command", segments[1] = tier, segments[2] = page
  const page = segments[2];
  if (page && PAGE_TO_SCREEN[page]) {
    return PAGE_TO_SCREEN[page];
  }
  return "dashboard";
}

/**
 * Extracts the tier from a pathname like `/command/national/officers` →
 * `"national"`. Falls back to `"national"` if the tier is missing.
 */
export function getTierFromPathname(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  return segments[1] ?? "national";
}

/**
 * Returns the base path for a tier, e.g. `"national"` → `"/command/national"`.
 * Used by the shell to build nav links.
 */
export function getTierBasePath(tier: string): string {
  return `/command/${tier}`;
}

/** Returns true if the given authRole is one of the 4 commander tiers + DIG. */
export function isCommanderRole(
  authRole: string | null | undefined,
): boolean {
  return (
    authRole === "NATIONAL_COMMANDER" ||
    authRole === "REGIONAL_COMMANDER" ||
    authRole === "DISTRICT_COMMANDER" ||
    authRole === "STATION_COMMANDER" ||
    authRole === "DIG" ||
    authRole === "COMMANDER"
  );
}
