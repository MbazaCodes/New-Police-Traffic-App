// ===== TZ Police — Typed Query Functions =====
// Each function wraps a PostgreSQL query via the DbAdmin interface
// from src/lib/db/client.ts. Accepts the DbAdmin client so the caller
// decides the context (server-side pool).
//
// NOTE: These are convenience helpers. Most API routes use the
// query builder directly via getDbAdmin().from("table").select(...).

import {
  type OfficerRow,
  type CitationRow,
  type IncidentRow,
  type PatrolRow,
  type VehicleRow,
  type CitizenRow,
  type AuditLogRow,
  TABLES,
} from "./client";

// DbAdmin type mirrors src/lib/db/client.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbAdmin = any;

// ============================================================
// Officers
// ============================================================

export async function getOfficerById(
  db: DbAdmin,
  id: string,
): Promise<OfficerRow | null> {
  const { data, error } = await db.from(TABLES.OFFICERS).select("*").eq("id", id).maybeSingle();
  if (error) { console.error("[queries.getOfficerById]", error); return null; }
  return (data as OfficerRow | null) ?? null;
}

export async function getOfficersByStation(
  db: DbAdmin,
  stationId: string,
): Promise<OfficerRow[]> {
  const { data, error } = await db.from(TABLES.OFFICERS).select("*").eq("station_id", stationId).order("name", { ascending: true });
  if (error) { console.error("[queries.getOfficersByStation]", error); return []; }
  return (data as OfficerRow[]) ?? [];
}

// ============================================================
// Citations
// ============================================================

export async function getCitationsByOfficer(
  db: DbAdmin,
  officerId: string,
): Promise<CitationRow[]> {
  const { data, error } = await db.from(TABLES.CITATIONS).select("*").eq("officer_id", officerId).order("date", { ascending: false });
  if (error) { console.error("[queries.getCitationsByOfficer]", error); return []; }
  return (data as CitationRow[]) ?? [];
}

export async function getCitationsByStatus(
  db: DbAdmin,
  status: "paid" | "unpaid",
): Promise<CitationRow[]> {
  const { data, error } = await db.from(TABLES.CITATIONS).select("*").eq("status", status).order("date", { ascending: false });
  if (error) { console.error("[queries.getCitationsByStatus]", error); return []; }
  return (data as CitationRow[]) ?? [];
}

// ============================================================
// Incidents
// ============================================================

export async function getIncidentsByStatus(
  db: DbAdmin,
  status: string,
): Promise<IncidentRow[]> {
  const { data, error } = await db.from(TABLES.INCIDENTS).select("*").eq("status", status).order("date", { ascending: false });
  if (error) { console.error("[queries.getIncidentsByStatus]", error); return []; }
  return (data as IncidentRow[]) ?? [];
}

export async function assignIncident(
  db: DbAdmin,
  incidentId: string,
  officerId: string,
): Promise<boolean> {
  const { error } = await db.from(TABLES.INCIDENTS).update({
    assigned_officer_id: officerId, status: "active", updated_at: new Date().toISOString(),
  }).eq("id", incidentId);
  if (error) { console.error("[queries.assignIncident]", error); return false; }
  return true;
}

// ============================================================
// Patrols
// ============================================================

export async function getActivePatrols(db: DbAdmin): Promise<PatrolRow[]> {
  const { data, error } = await db.from(TABLES.PATROLS).select("*").eq("status", "active").order("start_time", { ascending: false });
  if (error) { console.error("[queries.getActivePatrols]", error); return []; }
  return (data as PatrolRow[]) ?? [];
}

export interface StartPatrolInput {
  officerId: string;
  area: string;
  notes?: string;
}

export async function startPatrol(
  db: DbAdmin,
  input: StartPatrolInput,
): Promise<PatrolRow | null> {
  const { data, error } = await db.from(TABLES.PATROLS).insert({
    patrol_number: "",
    officer_id: input.officerId,
    area: input.area,
    start_time: new Date().toISOString(),
    status: "active",
    progress: 0,
    notes: input.notes ?? null,
  }).select("*").single();
  if (error) { console.error("[queries.startPatrol]", error); return null; }
  return data as PatrolRow;
}

export async function endPatrol(
  db: DbAdmin,
  patrolId: string,
  extra?: { distance_km?: number; notes?: string; incidents_observed?: string },
): Promise<boolean> {
  const patch: Record<string, unknown> = {
    status: "completed", end_time: new Date().toISOString(),
    progress: 100, updated_at: new Date().toISOString(),
  };
  if (typeof extra?.distance_km === "number") patch.distance_km = extra.distance_km;
  if (extra?.notes) patch.notes = extra.notes;
  if (extra?.incidents_observed) patch.incidents_observed = extra.incidents_observed;

  const { error } = await db.from(TABLES.PATROLS).update(patch).eq("id", patrolId);
  if (error) { console.error("[queries.endPatrol]", error); return false; }
  return true;
}

// ============================================================
// Vehicle search
// ============================================================

export async function searchVehicle(
  db: DbAdmin,
  plate: string,
): Promise<VehicleRow | null> {
  const { data, error } = await db.from(TABLES.VEHICLES).select("*").ilike("plate", plate.trim()).maybeSingle();
  if (error) { console.error("[queries.searchVehicle]", error); return null; }
  return (data as VehicleRow | null) ?? null;
}

// ============================================================
// Citizen search
// ============================================================

export type CitizenSearchType = "name" | "nida" | "mobile";

export async function searchCitizen(
  db: DbAdmin,
  query: string,
  type: CitizenSearchType = "name",
): Promise<CitizenRow[]> {
  const column = type;
  let builder = db.from(TABLES.CITIZENS).select("*");
  if (type === "name") {
    builder = builder.ilike("name", `%${query.trim()}%`);
  } else {
    builder = builder.eq(column, query.trim());
  }
  const { data, error } = await builder.order("name", { ascending: true }).limit(20);
  if (error) { console.error("[queries.searchCitizen]", error); return []; }
  return (data as CitizenRow[]) ?? [];
}

// ============================================================
// Dashboard stats
// ============================================================

export interface DashboardStats {
  activeOfficers: number;
  activePatrols: number;
  todaysIncidents: number;
  todaysCitations: number;
  unpaidCitations: number;
  urgentIncidents: number;
  totalStations: number;
  totalOfficers: number;
}

// ============================================================
// Audit log
// ============================================================

export interface CreateAuditLogInput {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function createAuditLog(
  db: DbAdmin,
  input: CreateAuditLogInput,
): Promise<AuditLogRow | null> {
  const { data, error } = await db.from(TABLES.AUDIT_LOGS).insert({
    user_id: input.userId,
    action: input.action,
    resource: input.resource,
    resource_id: input.resourceId ?? null,
    details: input.details ?? null,
    ip_address: input.ipAddress ?? null,
    user_agent: input.userAgent ?? null,
  }).select("*").single();
  if (error) { console.error("[queries.createAuditLog]", error); return null; }
  return data as AuditLogRow;
}
