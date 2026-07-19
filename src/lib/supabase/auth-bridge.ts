// ============================================================
// SUPABASE AUTH BRIDGE
// Looks up users from the Supabase users table.
// Falls back to nothing — no more mock users in production.
// ============================================================

import { getSupabaseAdmin, isSupabaseEnabled } from "./supabase/client";

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

  const clean = identifier.trim().toLowerCase().replace(/\s+/g, "");

  // Try badge_no, username, email first (exact)
  const { data, error } = await admin
    .from("users")
    .select("*, station:stations(id, name, region)")
    .or(
      `badge_no.ilike.${clean},username.ilike.${clean},email.ilike.${clean},phone.ilike.%${clean}%`
    )
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as SupabaseUser;
}

/**
 * Map a Supabase role string to the NextAuth Role type.
 * Supabase stores roles like 'admin', 'officer-traffic', etc.
 * NextAuth uses SCREAMING_SNAKE like 'SYSTEM_ADMIN'.
 */
export function mapSupabaseRole(role: string): string {
  const map: Record<string, string> = {
    "admin":                   "SYSTEM_ADMIN",
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
