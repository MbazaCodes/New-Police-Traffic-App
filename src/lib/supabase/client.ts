// ============================================================
// SUPABASE CLIENT — TZ Police Digital Platform
// Phase 2 wiring — Mock Database remains active in Phase 1
// DUAL MODE: SUPABASE_URL set → Supabase live | not set → Mock Database fallback
// ============================================================

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// ── Public client (anon key — for client components) ─────────
let _publicClient: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (!SUPABASE_URL || !SUPABASE_ANON) return null;
  if (!_publicClient) {
    _publicClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }
  return _publicClient;
}

// ── Server/Admin client (service role — for API routes only) ─
export function getSupabaseAdmin(): SupabaseClient<Database> | null {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;
  return createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ── Is Supabase wired? ────────────────────────────────────────
export function isSupabaseEnabled(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON);
}

export const supabase = getSupabaseClient();
