// ============================================================
// DATA SERVICE — Dual-mode: Supabase live OR Mock Database
// Phase 1: Mock Database only (Supabase not wired)
// Phase 2: Supabase live (flip NEXT_PUBLIC_SUPABASE_URL in .env)
// All app screens import from here — NEVER import mock-database directly
// ============================================================

import { isSupabaseEnabled, getSupabaseAdmin } from "./client";
import {
  MOCK_CITIZENS, MOCK_VEHICLES, MOCK_DEVICES,
  lookupCitizen, lookupVehicle, lookupDevice,
  type MockCitizen, type MockVehicle, type MockDevice,
} from "@/lib/mock-database";
import { ROLE_USERS, ADMIN_STATIONS, ADMIN_POSTS, MISSING_RECORDS } from "@/lib/mock-engine";
import {
  CITATION_HISTORY, ARREST_RECORDS, WARNING_RECORDS,
  GENERAL_INCIDENTS, DETAINED_CITIZENS,
} from "@/lib/police-data";

// ── SEARCH ───────────────────────────────────────────────────

export async function searchCitizen(query: string, type: "name" | "nida" | "mobile" | "license") {
  if (isSupabaseEnabled()) {
    const admin = getSupabaseAdmin();
    if (admin) {
      const { data } = await admin.rpc("search_citizen", { p_query: query, p_type: type });
      if (data) return data as MockCitizen;
    }
  }
  // Mock fallback
  return lookupCitizen(query);
}

export async function searchVehicle(plate: string) {
  if (isSupabaseEnabled()) {
    const admin = getSupabaseAdmin();
    if (admin) {
      const { data } = await admin.rpc("search_vehicle", { p_plate: plate });
      if (data) return data as MockVehicle;
    }
  }
  return lookupVehicle(plate);
}

export async function searchDevice(query: string) {
  if (isSupabaseEnabled()) {
    const admin = getSupabaseAdmin();
    if (admin) {
      const { data } = await admin.rpc("search_device", { p_query: query });
      if (data) return data as MockDevice;
    }
  }
  return lookupDevice(query);
}

// ── CITIZENS ─────────────────────────────────────────────────

export async function getAllCitizens(): Promise<MockCitizen[]> {
  if (isSupabaseEnabled()) {
    const admin = getSupabaseAdmin();
    if (admin) {
      const { data } = await admin.from("citizens").select("*").order("created_at", { ascending: false });
      if (data) return data as unknown as MockCitizen[];
    }
  }
  return MOCK_CITIZENS;
}

// ── VEHICLES ─────────────────────────────────────────────────

export async function getAllVehicles(): Promise<MockVehicle[]> {
  if (isSupabaseEnabled()) {
    const admin = getSupabaseAdmin();
    if (admin) {
      const { data } = await admin.from("vehicles").select("*").order("created_at", { ascending: false });
      if (data) return data as unknown as MockVehicle[];
    }
  }
  return MOCK_VEHICLES;
}

// ── CITATIONS ────────────────────────────────────────────────

export async function getCitations(filter?: { type?: "traffic" | "general"; officerId?: string; stationId?: string }) {
  if (isSupabaseEnabled()) {
    const admin = getSupabaseAdmin();
    if (admin) {
      let query = admin.from("citations").select("*").order("created_at", { ascending: false });
      if (filter?.type) query = query.eq("type", filter.type);
      if (filter?.officerId) query = query.eq("officer_id", filter.officerId);
      const { data } = await query;
      if (data) return data;
    }
  }
  return CITATION_HISTORY;
}

export async function createCitation(citation: {
  plate: string; offense: string; fine: string; driver: string;
  driverNida: string; driverPhone: string; location: string;
  officerId: string; officerName: string; stationId: string; type: "traffic" | "general";
}) {
  if (isSupabaseEnabled()) {
    const admin = getSupabaseAdmin();
    if (admin) {
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
  }
  // Mock: just return success
  return { data: { id: `MOCK-${Date.now()}`, ...citation }, error: null };
}

// ── INCIDENTS ────────────────────────────────────────────────

export async function getIncidents(filter?: { type?: "traffic" | "general" }) {
  if (isSupabaseEnabled()) {
    const admin = getSupabaseAdmin();
    if (admin) {
      let query = admin.from("incidents").select("*").order("created_at", { ascending: false });
      const { data } = await query;
      if (data) return data;
    }
  }
  return GENERAL_INCIDENTS;
}

export async function createIncident(incident: {
  type: string; severity: string; location: string; description: string;
  casualties: number; officerId: string; stationId: string; citizenId?: string;
}) {
  if (isSupabaseEnabled()) {
    const admin = getSupabaseAdmin();
    if (admin) {
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
  }
  return { data: { id: `MOCK-${Date.now()}`, ...incident }, error: null };
}

// ── ARRESTS ──────────────────────────────────────────────────

export async function createArrest(arrest: {
  suspectName: string; suspectNida?: string; suspectPhone?: string;
  offense: string; location: string; officerId: string; stationId: string;
}) {
  if (isSupabaseEnabled()) {
    const admin = getSupabaseAdmin();
    if (admin) {
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
  }
  return { data: { id: `MOCK-${Date.now()}`, ...arrest }, error: null };
}

// ── PATROLS ──────────────────────────────────────────────────

export async function createPatrol(patrol: {
  area: string; type: "gari" | "miguu" | "baiskeli"; durationSecs: number;
  events: string; photosCount: number; officerId: string; stationId: string;
}) {
  if (isSupabaseEnabled()) {
    const admin = getSupabaseAdmin();
    if (admin) {
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
  }
  return { data: { id: `MOCK-${Date.now()}`, ...patrol }, error: null };
}

// ── MISSING RECORDS ──────────────────────────────────────────

export async function getMissingRecords() {
  if (isSupabaseEnabled()) {
    const admin = getSupabaseAdmin();
    if (admin) {
      const { data } = await admin.from("missing_records").select("*").order("created_at", { ascending: false });
      if (data) return data;
    }
  }
  return MISSING_RECORDS;
}

export async function createMissingRecord(record: {
  type: "person" | "car" | "device"; title: string; identifier: string;
  details: string; photoUrl?: string; lastSeen: string; lastSeenLocation: string;
  reportedBy: string; stationId: string;
}) {
  if (isSupabaseEnabled()) {
    const admin = getSupabaseAdmin();
    if (admin) {
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
  }
  return { data: { id: `MOCK-${Date.now()}`, ...record }, error: null };
}

// ── DASHBOARD STATS ──────────────────────────────────────────

export async function getDashboardStats(role: string, region?: string, stationId?: string) {
  if (isSupabaseEnabled()) {
    const admin = getSupabaseAdmin();
    if (admin) {
      const { data } = await admin.rpc("get_dashboard_stats", {
        p_role: role,
        p_region: region,
        p_station_id: stationId,
      });
      if (data) return data;
    }
  }
  // Mock fallback
  return {
    officers_total: ROLE_USERS.filter((u) => ["officer-traffic","officer-general","post-officer"].includes(u.role)).length,
    officers_active: ROLE_USERS.filter((u) => u.status === "active" || u.status === "patrol").length,
    citations_today: CITATION_HISTORY.length,
    incidents_today: GENERAL_INCIDENTS.length,
    arrests_total:   ARREST_RECORDS.length,
    missing_active:  MISSING_RECORDS.filter((m) => m.status === "active").length,
    stations_total:  ADMIN_STATIONS.length,
    posts_total:     ADMIN_POSTS.length,
  };
}
