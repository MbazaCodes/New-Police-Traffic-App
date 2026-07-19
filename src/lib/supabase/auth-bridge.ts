// ============================================================
// SUPABASE AUTH BRIDGE
// Looks up users from the Supabase users table.
// Falls back to nothing — no more mock users in production.
// ============================================================

import { getSupabaseAdmin, isSupabaseEnabled } from "./client";

export interface SupabaseUser {
  id: string;
  name: string;
  short_name: string | null;
  rank: string | null;
  rank_short: string | null;
  role: string;
  status: string;
  station_id: string | null;
  badge_no: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  region: string | null;
  unit: string | null;
  photo_url: string | null;
  station?: { id: string; name: string; region: string } | null;
}

/**
 * Look up a user by badge_no, username, email, or phone.
 * Used by the login flow in the admin web shell.
 */
export async function findSupabaseUser(identifier: string): Promise<SupabaseUser | null> {
  if (!isSupabaseEnabled()) return null;
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const raw = identifier.trim();
  const clean = raw.toLowerCase();

  // Try each field individually — avoids PostgREST .or() escaping issues with @ in email
  const cols: Array<"badge_no" | "username" | "email"> = ["badge_no", "username", "email"];
  for (const col of cols) {
    const { data } = await admin
      .from("users")
      .select("*, station:stations(id, name, region)")
      .ilike(col, clean)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();
    if (data) return data as SupabaseUser;
  }

  // Phone number lookup with TZ normalization
  const digitsOnly = raw.replace(/\D/g, "");
  if (digitsOnly.length >= 9) {
    const core = digitsOnly.startsWith("255") ? digitsOnly.slice(3)
      : digitsOnly.startsWith("0") ? digitsOnly.slice(1) : digitsOnly;
    for (const ph of [`0${core}`, `+255${core}`, `255${core}`, core]) {
      const { data } = await admin
        .from("users")
        .select("*, station:stations(id, name, region)")
        .eq("phone", ph)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();
      if (data) return data as SupabaseUser;
    }
  }

  return null;
}

/**
 * Map a Supabase role string to the NextAuth Role type.
 * Supabase stores roles like 'admin', 'officer-traffic', etc.
 * NextAuth uses SCREAMING_SNAKE like 'SYSTEM_ADMIN'.
 */
export function mapSupabaseRole(role: string): string {
  const map: Record<string, string> = {
    "super-admin":             "SUPER_ADMIN",
    "admin":                   "SUPER_ADMIN",
    "national-commissioner":   "NATIONAL_COMMANDER",
    "regional-commissioner":   "REGIONAL_COMMANDER",
    "district-commissioner":   "DISTRICT_COMMANDER",
    "station-commissioner":    "STATION_COMMANDER",
    "officer-traffic":         "TRAFFIC_OFFICER",
    "officer-general":         "GENERAL_OFFICER",
    "post-officer":            "GENERAL_OFFICER",
    "cid-officer":             "INVESTIGATOR",
    "investigation-supervisor":"INVESTIGATOR",
    "cyber-crime":             "INVESTIGATOR",
    "immigration-liaison":     "OFFICER",
    "prison-liaison":          "OFFICER",
    "emergency-dispatcher":    "OFFICER",
    "evidence-officer":        "OFFICER",
    "audit-officer":           "CLERK",
    "investigator":            "INVESTIGATOR",
    "viewer":                  "VIEWER",
    "dig":                     "NATIONAL_COMMANDER",
    "commander":               "NATIONAL_COMMANDER",
  };
  return map[role.toLowerCase()] ?? "VIEWER";
}
