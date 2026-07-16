// ===== TZ Police — Supabase Client =====
// Shared by PWA (Next.js) and Web (Next.js).
// Flutter uses its own Supabase Flutter SDK.
//
// Three clients are exported:
//   * `supabase`        — Browser client (anon key, RLS-enforced, persisted session).
//   * `getSupabase()`   — Lazy singleton (same as `supabase`).
//   * `getAdminClient()`— Service-role client (server-only, bypasses RLS).
//   * `getBrowserClient()`— Explicit factory for one-off browser clients.
//
// Plus type-safe table helpers for building queries.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ===== Env =====
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";
// Service-role key — NEVER expose to the browser. Server-only.
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// ===== Table names (single source of truth) =====
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
  AUDIT_LOGS: "audit_logs",
} as const;

export type TableName = (typeof TABLES)[keyof typeof TABLES];

// ===== Row types (mirrors schema.sql) =====
// These map directly to the database columns; for shared app-level types
// see `@tz-police/shared`.

export interface UserRow {
  id: string;
  name: string;
  short_name: string | null;
  rank: string | null;
  rank_short: string | null;
  role: "officer-traffic" | "officer-general" | "admin" | "commander";
  id_number: string;
  station_id: string | null;
  unit: string | null;
  phone: string | null;
  email: string | null;
  password_hash: string | null;
  status: "active" | "off-duty" | "on-leave" | "suspended";
  avatar_url: string | null;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface OfficerRow {
  id: string;
  user_id: string;
  officer_number: string;
  name: string;
  rank: string | null;
  unit: string | null;
  station_id: string | null;
  post_id: string | null;
  status: "active" | "break" | "off-duty";
  phone: string | null;
  patrols_count: number;
  citations_count: number;
  incidents_count: number;
  hours_today: number;
  created_at: string;
  updated_at: string;
}

export interface StationRow {
  id: string;
  name: string;
  region: string;
  district: string | null;
  address: string | null;
  phone: string | null;
  status: "active" | "maintenance" | "inactive";
  established: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostRow {
  id: string;
  name: string;
  station_id: string;
  location: string | null;
  type: "Traffic" | "Patrol";
  status: "active" | "inactive";
  shift: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssignmentRow {
  id: string;
  officer_id: string;
  station_id: string;
  post_id: string | null;
  role: string | null;
  assigned_date: string;
  status: "active" | "on-leave" | "ended";
  created_at: string;
  updated_at: string;
}

export interface VehicleRow {
  id: string;
  plate: string;
  model: string | null;
  type: string | null;
  year: string | null;
  color: string | null;
  owner_name: string | null;
  owner_nida: string | null;
  owner_phone: string | null;
  insurance_company: string | null;
  insurance_policy: string | null;
  insurance_expires: string | null;
  insurance_valid: boolean;
  accident_involved: boolean;
  created_at: string;
  updated_at: string;
}

export interface DriverRow {
  id: string;
  name: string;
  gender: string | null;
  license_number: string | null;
  license_class: string | null;
  nida: string | null;
  mobile: string | null;
  created_at: string;
}

export interface CitizenRow {
  id: string;
  name: string;
  nida: string | null;
  mobile: string | null;
  gender: string | null;
  dob: string | null;
  address: string | null;
  occupation: string | null;
  status: string;
  has_criminal_record: boolean;
  cases_count: number;
  convictions_count: number;
  created_at: string;
  updated_at: string;
}

export interface CitationRow {
  id: string;
  citation_number: string;
  vehicle_id: string | null;
  plate: string | null;
  offense: string;
  driver_name: string | null;
  driver_id: string | null;
  date: string;
  time: string | null;
  location: string | null;
  amount: number;
  status: "paid" | "unpaid";
  officer_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface IncidentRow {
  id: string;
  incident_number: string;
  type: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  date: string;
  time: string;
  status: "urgent" | "active" | "resolved" | "investigating";
  priority: "high" | "medium" | "low";
  assigned_officer_id: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatrolRow {
  id: string;
  patrol_number: string;
  officer_id: string;
  area: string;
  start_time: string;
  end_time: string | null;
  distance_km: number | null;
  status: "active" | "completed" | "cancelled";
  progress: number;
  notes: string | null;
  incidents_observed: string | null;
  last_latitude: number | null;
  last_longitude: number | null;
  last_updated_at: string | null;
  created_at: string;
}

export interface AlertRow {
  id: string;
  title: string;
  message: string;
  source: string | null;
  category: "all" | "mine";
  priority: "normal" | "important" | "urgent";
  icon: string | null;
  icon_color: string | null;
  border_color: string | null;
  is_read: boolean;
  sent_by: string | null;
  audience: string;
  created_at: string;
}

export interface Pf3FormRow {
  id: string;
  reference_number: string;
  region: string | null;
  district: string | null;
  station_id: string | null;
  accident_type: string | null;
  severity: string | null;
  weather: string | null;
  road_surface: string | null;
  light_condition: string | null;
  vehicles_json: Record<string, unknown>[] | null;
  casualties_json: Record<string, unknown>[] | null;
  witnesses_json: Record<string, unknown>[] | null;
  sketch_url: string | null;
  officer_id: string | null;
  status: "draft" | "submitted" | "approved";
  created_at: string;
  updated_at: string;
}

export interface VehicleInspectionRow {
  id: string;
  vehicle_id: string | null;
  plate: string;
  officer_id: string | null;
  location: string | null;
  inspection_date: string;
  documents_json: Record<string, unknown>[] | null;
  mechanical_json: Record<string, unknown>[] | null;
  photos_json: Record<string, unknown>[] | null;
  result: "pass" | "fail";
  officer_signature: string | null;
  notes: string | null;
  created_at: string;
}

export interface AuditLogRow {
  id: string;
  user_id: string | null;
  action: string;
  resource: string;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// Map table name → row type
export interface TableRowMap {
  users: UserRow;
  officers: OfficerRow;
  stations: StationRow;
  posts: PostRow;
  assignments: AssignmentRow;
  vehicles: VehicleRow;
  drivers: DriverRow;
  citizens: CitizenRow;
  citations: CitationRow;
  incidents: IncidentRow;
  patrols: PatrolRow;
  alerts: AlertRow;
  pf3_forms: Pf3FormRow;
  vehicle_inspections: VehicleInspectionRow;
  audit_logs: AuditLogRow;
}

// ===== Lazy singletons =====
let browserClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

/**
 * Browser/anon client. Uses NEXT_PUBLIC_ env vars so it can run in the
 * browser. RLS is enforced. Session is persisted and auto-refreshed.
 */
export function getSupabase(): SupabaseClient {
  if (!browserClient) {
    if (!supabaseUrl || !supabaseAnonKey) {
      // In dev without env vars, return a stub URL (queries will fail loudly).
      console.warn(
        "[database] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set — Supabase calls will fail.",
      );
    }
    browserClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return browserClient;
}

/** Alias for getSupabase() — explicit "this is the browser client" naming. */
export function getBrowserClient(): SupabaseClient {
  return getSupabase();
}

/**
 * Service-role admin client. Bypasses RLS. **Server-only** — never import
 * this from a client component or expose the key to the browser bundle.
 * Throws if SUPABASE_SERVICE_ROLE_KEY is not set.
 */
export function getAdminClient(): SupabaseClient {
  if (!adminClient) {
    if (!supabaseUrl) {
      throw new Error("[database] SUPABASE_URL is not set");
    }
    if (!supabaseServiceRoleKey) {
      throw new Error(
        "[database] SUPABASE_SERVICE_ROLE_KEY is not set — admin client unavailable",
      );
    }
    adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return adminClient;
}

// Default export for backwards compatibility with the original module.
export const supabase = getSupabase();

// ===== Type-safe table helper =====
/**
 * Returns a typed query builder for the given table.
 * Usage:
 *   const { data, error } = await from(supabase, "officers")
 *     .select("id, name, rank")
 *     .eq("station_id", stationId);
 */
export function from<T extends TableName>(
  client: SupabaseClient,
  table: T,
) {
  // We cast the return type to make `select()` results strongly typed.
  // Supabase's own types come from the generated `Database` interface;
  // we use our `TableRowMap` for ergonomics until a codegen step is added.
  return client.from(table) as unknown as ReturnType<
    SupabaseClient["from"]
  > & {
    select: (
      columns?: string,
    ) => PromiseLike<{ data: TableRowMap[T][] | null; error: unknown }>;
  };
}

// ===== RBAC helper (thin wrapper around the SQL function) =====
/**
 * Calls the `has_role(user_uuid, role_name)` Postgres function.
 * Returns true if the user has any of the comma-separated roles.
 */
export async function hasRole(
  client: SupabaseClient,
  userId: string,
  role: "officer-traffic" | "officer-general" | "admin" | "commander" | string,
): Promise<boolean> {
  const { data, error } = await client.rpc("has_role", {
    user_uuid: userId,
    role_name: role,
  });
  if (error) {
    console.error("[database] has_role RPC failed:", error);
    return false;
  }
  return Boolean(data);
}

/**
 * Calls `can_access_resource(user_uuid, resource, action)`.
 */
export async function canAccessResource(
  client: SupabaseClient,
  userId: string,
  resource: string,
  action: string,
): Promise<boolean> {
  const { data, error } = await client.rpc("can_access_resource", {
    user_uuid: userId,
    resource,
    action,
  });
  if (error) {
    console.error("[database] can_access_resource RPC failed:", error);
    return false;
  }
  return Boolean(data);
}
