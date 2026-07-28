// ============================================================
// AUTH — TZ Police Digital Platform
// Looks up users from local PostgreSQL users table.
// ============================================================

import { getDbAdmin, isDbEnabled } from "@/lib/db/client";

export interface User {
  id: string;
  name: string;
  short_name: string | null;
  rank: string | null;
  rank_short: string | null;
  role: string;
  status: string;
  station_id: string | null;
  badge_no: string | null;
  id_number: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  region: string | null;
  unit: string | null;
  photo_url: string | null;
  // R1 (stabilize): police/login route reads last_login + created_at
  // from the DB row. Without these properties, TS2339 was raised.
  last_login?: string | null;
  created_at?: string | null;
  station?: { id: string; name: string; region: string } | null;
}

async function fetchStation(stationId: string) {
  const db = getDbAdmin();
  const { data } = await db.from("stations").select("id, name, region").eq("id", stationId).maybeSingle();
  return data ?? null;
}

export async function findUser(identifier: string): Promise<User | null> {
  if (!isDbEnabled()) return null;
  const db = getDbAdmin();
  const raw = identifier.trim();
  const clean = raw.toLowerCase();

  for (const col of ["id_number", "badge_no", "username", "email"] as const) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (db.from("users") as any)
      .select("*").ilike(col, clean).eq("status", "active").maybeSingle();
    if (error) console.error(`[AUTH] col:${col} error:`, error.message);
    if (data) {
      const station = data.station_id ? await fetchStation(data.station_id) : null;
      return { ...data, station } as User;
    }
  }

  // Phone lookup
  const digitsOnly = raw.replace(/\D/g, "");
  if (digitsOnly.length >= 9) {
    const core = digitsOnly.startsWith("255") ? digitsOnly.slice(3)
      : digitsOnly.startsWith("0") ? digitsOnly.slice(1) : digitsOnly;
    for (const ph of [`0${core}`, `+255${core}`, `255${core}`, core]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (db.from("users") as any)
        .select("*").eq("mobile", ph).eq("status", "active").maybeSingle();
      if (data) {
        const station = data.station_id ? await fetchStation(data.station_id) : null;
        return { ...data, station } as User;
      }
    }
  }

  return null;
}

export function mapRole(role: string): string {
  const map: Record<string, string> = {
    // Top command — IGP/DIG are NATIONAL_COMMANDER, not admin
    "igp":                        "NATIONAL_COMMANDER",
    "deputy-igp":                 "NATIONAL_COMMANDER",
    "dig":                        "NATIONAL_COMMANDER",
    "national-commissioner":      "NATIONAL_COMMANDER",
    // System admin only (IT, not police rank)
    "super-admin":                "SUPER_ADMIN",
    "admin":                      "SUPER_ADMIN",
    "system-admin":               "SYSTEM_ADMIN",

    // Commissioners
    // R1 (stabilize): removed duplicate "national-commissioner" key —
    // it was already defined on line 76 above. TS1117.
    "regional-commissioner":      "REGIONAL_COMMANDER",
    "district-commissioner":      "DISTRICT_COMMANDER",
    "station-commissioner":       "STATION_COMMANDER",
    "commander":                  "NATIONAL_COMMANDER",

    // Officers
    "officer-traffic":            "TRAFFIC_OFFICER",
    "officer-general":            "GENERAL_OFFICER",
    "post-officer":               "POST_OFFICER",
    "operations-officer":         "GENERAL_OFFICER",
    "specialized-operations-officer": "GENERAL_OFFICER",
    "traffic-management-officer": "TRAFFIC_OFFICER",
    "training-officer":           "GENERAL_OFFICER",
    "development-officer":        "GENERAL_OFFICER",
    "community-engagement-officer":"GENERAL_OFFICER",
    "gender-child-protection-officer":"GENERAL_OFFICER",

    // CID & Investigation
    "investigator":               "INVESTIGATOR",
    "cid-officer":                "INVESTIGATOR",
    "investigation-supervisor":   "INVESTIGATOR",
    "cyber-crime":                "INVESTIGATOR",
    "state-security-officer":     "INVESTIGATOR",
    "crimes-against-persons-officer":"INVESTIGATOR",
    "property-crimes-officer":    "INVESTIGATOR",
    "special-investigation-officer":"INVESTIGATOR",
    "financial-crimes-officer":   "INVESTIGATOR",
    "firearms-officer":           "INVESTIGATOR",
    "terrorism-officer":          "INVESTIGATOR",
    "interpol-officer":           "INVESTIGATOR",
    "criminal-intelligence-officer":"INVESTIGATOR",
    "criminal-analysis-officer":  "INVESTIGATOR",

    // Forensic
    "forensic-officer":           "INVESTIGATOR",
    "cyber-forensic-officer":     "INVESTIGATOR",
    "forensic-science-officer":   "INVESTIGATOR",

    // Clerks & Admin
    "clerk":                      "CLERK",
    "national-clerk":             "NATIONAL_CLERK",
    "regional-clerk":             "REGIONAL_CLERK",
    "district-clerk":             "DISTRICT_CLERK",
    "hr-officer":                 "CLERK",
    "administration-officer":     "CLERK",
    "procurement-officer":        "CLERK",
    "corporation-officer":        "CLERK",

    // Audit & Integrity
    "audit-officer":              "AUDIT_OFFICER",
    "chief-internal-auditor":     "AUDIT_OFFICER",
    "internal-auditor":           "AUDIT_OFFICER",
    "integrity-officer":          "AUDIT_OFFICER",
    "monitoring-officer":         "AUDIT_OFFICER",

    // Evidence
    "evidence-officer":           "EVIDENCE_OFFICER",

    // Finance
    "finance-officer":            "CLERK",
    "accounts-officer":           "CLERK",
    "quartermaster":              "CLERK",
    "planning-officer":           "CLERK",
    "transport-officer":          "CLERK",
    "estate-officer":             "CLERK",

    // ICT & Communications
    "ict-officer":                "SYSTEM_ADMIN",
    "communications-officer":     "CLERK",
    "pr-officer":                 "CLERK",
    "legal-officer":              "CLERK",

    // Liaison & Emergency
    "immigration-liaison":        "IMMIGRATION_LIAISON",
    "prison-liaison":             "PRISON_LIAISON",
    "emergency-dispatcher":       "EMERGENCY_DISPATCHER",

    // Zanzibar
    "zanzibar-hr-officer":        "CLERK",
    "zanzibar-operations-officer":"GENERAL_OFFICER",
    "zanzibar-cid-officer":       "INVESTIGATOR",
    "zanzibar-intelligence-officer":"INVESTIGATOR",
    "zanzibar-finance-officer":   "CLERK",
    "zanzibar-community-officer": "GENERAL_OFFICER",
    "zanzibar-forensic-officer":  "INVESTIGATOR",

    // Misc
    "viewer":                     "VIEWER",
    "station-commander":          "STATION_COMMANDER",
  };
  return map[role.toLowerCase()] ?? "VIEWER";
}
