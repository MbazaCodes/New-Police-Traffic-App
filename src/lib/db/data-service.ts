// ============================================================
// DATA SERVICE — TZ Police Digital Platform
// All operations backed by local PostgreSQL via pg client.
// ============================================================

import { getDbAdmin, isDbEnabled } from "@/lib/db/client";

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

function db() { return getDbAdmin(); }

// ── SEARCH ───────────────────────────────────────────────────

export async function searchCitizen(query: string, type: "name" | "nida" | "mobile" | "license"): Promise<CitizenResult | null> {
  if (!isDbEnabled()) return null;
  const { data } = await db().rpc<CitizenResult>("search_citizen", { p_query: query, p_type: type });
  return data && data.length > 0 ? data[0] : null;
}

export async function searchVehicle(plate: string): Promise<VehicleResult | null> {
  if (!isDbEnabled()) return null;
  const { data } = await db().rpc<VehicleResult>("search_vehicle", { p_plate: plate });
  return data && data.length > 0 ? data[0] : null;
}

export async function searchDevice(query: string): Promise<DeviceResult[] | null> {
  if (!isDbEnabled()) return null;
  const { data } = await db().rpc<DeviceResult>("search_device", { p_query: query });
  return data ?? null;
}

// ── CITIZENS ─────────────────────────────────────────────────

export async function getAllCitizens(): Promise<CitizenResult[]> {
  if (!isDbEnabled()) return [];
  const { data } = await db().from<CitizenResult>("citizens")
    .select("*").order("created_at", { ascending: false });
  return (data as CitizenResult[]) ?? [];
}

// ── VEHICLES ─────────────────────────────────────────────────

export async function getAllVehicles(): Promise<VehicleResult[]> {
  if (!isDbEnabled()) return [];
  const { data } = await db().from<VehicleResult>("vehicles")
    .select("*").order("created_at", { ascending: false });
  return (data as VehicleResult[]) ?? [];
}

// ── DEVICES ──────────────────────────────────────────────────

export async function getAllDevices(): Promise<DeviceResult[]> {
  if (!isDbEnabled()) return [];
  const { data } = await db().from<DeviceResult>("devices")
    .select("*").order("created_at", { ascending: false });
  return (data as DeviceResult[]) ?? [];
}
