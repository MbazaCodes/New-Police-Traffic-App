// ============================================================
// DATA SERVICE — Supabase-first data layer
// All operations require Supabase. No mock/fallback data.
// ============================================================

import { isSupabaseEnabled, getSupabaseAdmin } from "./client";

// ── Types ───────────────────────────────────────────────────

export interface CitizenResult {
  id: string; name: string; nida: string; mobile: string;
  gender: string; dob?: string; address?: string;
  status: string; station_id?: string;
}

export interface VehicleResult {
  id: string; plate: string; model: string; type: string;
  color: string; year: string; owner_name: string;
  owner_nida: string; owner_phone: string;
  insurance_valid: boolean; outstanding_fines: number;
  license_no?: string; license_expiry?: string;
  insurance_expiry?: string; inspection_expiry?: string;
  registration_expiry?: string; status: string;
}

export interface DeviceResult {
  id: string; serial_no: string; imei?: string;
  description: string; category: string;
  owner_name: string; owner_phone?: string;
  status: string; report_date: string;
}

// ── SEARCH ───────────────────────────────────────────────────

export async function searchCitizen(query: string, type: "name" | "nida" | "mobile" | "license"): Promise<CitizenResult | null> {
  if (!isSupabaseEnabled()) return null;
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const { data } = await admin.rpc("search_citizen", { p_query: query, p_type: type });
  return (data && data.length > 0) ? data[0] as CitizenResult : null;
}

export async function searchVehicle(plate: string): Promise<VehicleResult | null> {
  if (!isSupabaseEnabled()) return null;
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const { data } = await admin.rpc("search_vehicle", { p_plate: plate });
  return (data && data.length > 0) ? data[0] as VehicleResult : null;
}

export async function searchDevice(query: string): Promise<DeviceResult[] | null> {
  if (!isSupabaseEnabled()) return null;
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const { data } = await admin.rpc("search_device", { p_query: query });
  return data as DeviceResult[] ?? null;
}

// ── CITIZENS ─────────────────────────────────────────────────

export async function getAllCitizens(): Promise<CitizenResult[]> {
  if (!isSupabaseEnabled()) return [];
  const admin = getSupabaseAdmin();
  if (!admin) return [];

  const { data } = await admin.from("citizens").select("*").order("created_at", { ascending: false });
  return (data as CitizenResult[]) ?? [];
}

// ── VEHICLES ─────────────────────────────────────────────────

export async function getAllVehicles(): Promise<VehicleResult[]> {
  if (!isSupabaseEnabled()) return [];
  const admin = getSupabaseAdmin();
  if (!admin) return [];

  const { data } = await admin.from("vehicles").select("*").order("created_at", { ascending: false });
  return (data as VehicleResult[]) ?? [];
}

// ── CITATIONS ────────────────────────────────────────────────

export async function getCitations(filter?: { type?: "traffic" | "general"; officerId?: string; stationId?: string }) {
  if (!isSupabaseEnabled()) return [];
  const admin = getSupabaseAdmin();
  if (!admin) return [];

  let query = admin.from("citations").select("*").order("created_at", { ascending: false });
  if (filter?.type) query = query.eq("type", filter.type);
  if (filter?.officerId) query = query.eq("officer_id", filter.officerId);
  const { data } = await query;
  return data ?? [];
}

export async function createCitation(citation: {
  plate: string; offense: string; fine: string; driver: string;
  driverNida: string; driverPhone: string; location: string;
  officerId: string; officerName: string; stationId: string; type: "traffic" | "general";
}) {
  if (!isSupabaseEnabled()) return { data: null, error: "Supabase haijawezeshwa" };
  const admin = getSupabaseAdmin();
  if (!admin) return { data: null, error: "Supabase client error" };

  const { data, error } = await admin.from("citations").insert({
    citation_number: `CT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    officer_id: citation.officerId,
    plate: citation.plate,
    offense: citation.offense,
    fine_amount: parseInt(citation.fine.replace(/[^\d]/g, ""), 10),
    location: citation.location,
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString("en-US", { hour12: false }),
    status: "unpaid",
    type: citation.type,
    points_deducted: 5,
    station_id: citation.stationId,
  }).select().single();
  return { data, error };
}

// ── INCIDENTS ────────────────────────────────────────────────

export async function getIncidents(filter?: { type?: "traffic" | "general" }) {
  if (!isSupabaseEnabled()) return [];
  const admin = getSupabaseAdmin();
  if (!admin) return [];

  let query = admin.from("incidents").select("*").order("created_at", { ascending: false });
  const { data } = await query;
  return data ?? [];
}

export async function createIncident(incident: {
  type: string; severity: string; location: string; description: string;
  casualties: number; officerId: string; stationId: string; citizenId?: string;
}) {
  if (!isSupabaseEnabled()) return { data: null, error: "Supabase haijawezeshwa" };
  const admin = getSupabaseAdmin();
  if (!admin) return { data: null, error: "Supabase client error" };

  const { data, error } = await admin.from("incidents").insert({
    incident_number: `INC-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    officer_id: incident.officerId,
    type: incident.type,
    severity: incident.severity,
    location: incident.location,
    description: incident.description,
    casualties: incident.casualties,
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString("en-US", { hour12: false }),
    status: "active" as const,
    priority: "medium" as const,
    station_id: incident.stationId,
    citizen_id: incident.citizenId ?? null,
  }).select().single();
  return { data, error };
}

// ── ARRESTS ──────────────────────────────────────────────────

export async function createArrest(arrest: {
  suspectName: string; suspectNida?: string; suspectPhone?: string;
  offense: string; location: string; officerId: string; stationId: string;
}) {
  if (!isSupabaseEnabled()) return { data: null, error: "Supabase haijawezeshwa" };
  const admin = getSupabaseAdmin();
  if (!admin) return { data: null, error: "Supabase client error" };

  const { data, error } = await admin.from("arrests").insert({
    arrest_number: `AR-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    officer_id: arrest.officerId,
    suspect_name: arrest.suspectName,
    suspect_nida: arrest.suspectNida ?? null,
    suspect_phone: arrest.suspectPhone ?? null,
    offense: arrest.offense,
    location: arrest.location,
    arrest_date: new Date().toISOString().split("T")[0],
    arrest_time: new Date().toLocaleTimeString("en-US", { hour12: false }),
    status: "held" as const,
    station_id: arrest.stationId,
  }).select().single();
  return { data, error };
}

// ── PATROLS ──────────────────────────────────────────────────

export async function createPatrol(patrol: {
  area: string; type: "gari" | "miguu" | "baiskeli"; durationSecs: number;
  events: string; photosCount: number; officerId: string; stationId: string;
}) {
  if (!isSupabaseEnabled()) return { data: null, error: "Supabase haijawezeshwa" };
  const admin = getSupabaseAdmin();
  if (!admin) return { data: null, error: "Supabase client error" };

  const { data, error } = await admin.from("patrols").insert({
    patrol_number: `PT-${Date.now()}`,
    officer_id: patrol.officerId,
    area: patrol.area,
    patrol_type: patrol.type,
    start_time: new Date(Date.now() - patrol.durationSecs * 1000).toISOString(),
    end_time: new Date().toISOString(),
    duration_secs: patrol.durationSecs,
    events: patrol.events,
    photos_count: patrol.photosCount,
    status: "completed" as const,
    station_id: patrol.stationId,
  }).select().single();
  return { data, error };
}

// ── MISSING RECORDS ──────────────────────────────────────────

export async function getMissingRecords() {
  if (!isSupabaseEnabled()) return [];
  const admin = getSupabaseAdmin();
  if (!admin) return [];

  const { data } = await admin.from("missing_records").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

export async function createMissingRecord(record: {
  type: "person" | "car" | "device"; title: string; identifier: string;
  details: string; photoUrl?: string; lastSeen: string; lastSeenLocation: string;
  reportedBy: string; stationId: string;
}) {
  if (!isSupabaseEnabled()) return { data: null, error: "Supabase haijawezeshwa" };
  const admin = getSupabaseAdmin();
  if (!admin) return { data: null, error: "Supabase client error" };

  const { data, error } = await admin.from("missing_records").insert({
    case_no: `MS-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    type: record.type,
    title: record.title,
    identifier: record.identifier,
    details: record.details,
    photo_url: record.photoUrl ?? null,
    last_seen: record.lastSeen,
    last_seen_location: record.lastSeenLocation,
    reported_by: record.reportedBy,
    reported_date: new Date().toISOString().split("T")[0],
    station_id: record.stationId,
    status: "active" as const,
  }).select().single();
  return { data, error };
}

// ── DASHBOARD STATS ──────────────────────────────────────────

export async function getDashboardStats(role: string, region?: string, stationId?: string) {
  if (!isSupabaseEnabled()) {
    return {
      officers_total: 0,
      officers_active: 0,
      citations_today: 0,
      incidents_today: 0,
      arrests_total: 0,
      missing_active: 0,
      stations_total: 0,
      posts_total: 0,
    };
  }
  const admin = getSupabaseAdmin();
  if (!admin) {
    return {
      officers_total: 0,
      officers_active: 0,
      citations_today: 0,
      incidents_today: 0,
      arrests_total: 0,
      missing_active: 0,
      stations_total: 0,
      posts_total: 0,
    };
  }

  const { data } = await admin.rpc("get_dashboard_stats", {
    p_role: role,
    p_region: region,
    p_station_id: stationId,
  });
  return data ?? {
    officers_total: 0,
    officers_active: 0,
    citations_today: 0,
    incidents_today: 0,
    arrests_total: 0,
    missing_active: 0,
    stations_total: 0,
    posts_total: 0,
  };
}
