// ===== TZ Police — Database Table Names =====
// Shared constants for the PostgreSQL (VPS) database.
// The actual client lives in src/lib/db/client.ts (pg Pool + query builder).

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

// Row types used by the typed query helpers
export interface OfficerRow {
  id: string; badge_no?: string; name?: string; rank?: string;
  station_id?: string; status?: string; phone?: string; email?: string;
}
export interface CitationRow {
  id: string; citation_number?: string; officer_id?: string;
  citizen_id?: string; status?: string; date?: string; fine_amount?: number;
}
export interface IncidentRow {
  id: string; status?: string; type?: string; date?: string;
  assigned_officer_id?: string; location?: string;
}
export interface PatrolRow {
  id: string; patrol_number?: string; officer_id?: string;
  area?: string; status?: string; start_time?: string; end_time?: string;
  progress?: number; distance_km?: number; notes?: string;
}
export interface VehicleRow {
  id: string; plate?: string; make?: string; model?: string;
  color?: string; owner?: string; year?: number;
}
export interface CitizenRow {
  id: string; national_id?: string; name?: string; phone?: string;
  email?: string; status?: string;
}
export interface AuditLogRow {
  id: string; user_id?: string; action?: string; resource?: string;
  resource_id?: string; details?: Record<string, unknown>;
  ip_address?: string; user_agent?: string; created_at?: string;
}
