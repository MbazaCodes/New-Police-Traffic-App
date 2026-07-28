// ===== TZ Police — Supabase Client =====
// Shared by PWA (Next.js) and Web (Next.js)
// Flutter uses its own Supabase Flutter SDK

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return client;
}

export const supabase = getSupabase();

// ===== Table names =====
export const TABLES = {
  USERS: "users",
  OFFICERS: "officers",
  STATIONS: "stations",
  POSTS: "posts",
  ASSIGNMENTS: "assignments",
  VEHICLES: "vehicles",
  DRIVERS: "drivers",
  CITIZENS: "citizens",
  CITATIONS: "citations",
  INCIDENTS: "incidents",
  PATROLS: "patrols",
  ALERTS: "alerts",
  PF3_FORMS: "pf3_forms",
  VEHICLE_INSPECTIONS: "vehicle_inspections",
} as const;
