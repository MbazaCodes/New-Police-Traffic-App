// ============================================================
// DATA SCOPE — Role-based data filtering
// Ensures each role only sees data within their jurisdiction
// ============================================================

import type { Session } from "next-auth";

export type Scope = {
  isNational:  boolean;   // sees everything
  isRegional:  boolean;   // filtered by region
  isDistrict:  boolean;   // filtered by district
  isStation:   boolean;   // filtered by station_id
  region:      string | null;
  district:    string | null;
  station_id:  string | null;
  user_id:     string | null;
};

const NATIONAL_ROLES = new Set([
  "SUPER_ADMIN","SYSTEM_ADMIN","NATIONAL_COMMANDER","NATIONAL_CLERK",
  "AUDIT_OFFICER","DIG","COMMANDER",
]);
const REGIONAL_ROLES = new Set([
  "REGIONAL_COMMANDER","REGIONAL_CLERK",
]);
const DISTRICT_ROLES = new Set([
  "DISTRICT_COMMANDER","DISTRICT_CLERK",
]);
const STATION_ROLES = new Set([
  "STATION_COMMANDER","TRAFFIC_OFFICER","GENERAL_OFFICER","POST_OFFICER",
  "INVESTIGATOR","CLERK","EVIDENCE_OFFICER","EMERGENCY_DISPATCHER",
  "IMMIGRATION_LIAISON","PRISON_LIAISON","INVESTIGATOR",
]);

export function getScope(session: Session | null): Scope {
  const role      = session?.user?.role ?? "VIEWER";
  const region    = session?.user?.region    ?? null;
  const district  = session?.user?.district  ?? null;
  const station_id = session?.user?.stationId ?? session?.user?.station_id ?? null;
  const user_id   = session?.user?.id ?? null;

  const isNational = NATIONAL_ROLES.has(role);
  const isRegional = !isNational && REGIONAL_ROLES.has(role);
  const isDistrict = !isNational && !isRegional && DISTRICT_ROLES.has(role);
  const isStation  = !isNational && !isRegional && !isDistrict;

  return {
    isNational, isRegional, isDistrict, isStation,
    region:     isNational ? null : region,
    district:   (isNational || isRegional) ? null : district,
    station_id: (isNational || isRegional || isDistrict) ? null : station_id,
    user_id,
  };
}

/**
 * Build a WHERE clause + params array for scoped queries.
 * Usage:
 *   const { where, params } = buildScopeWhere(scope, 'u', existingParams);
 *   sql += where ? ` AND ${where}` : '';
 */
export function buildScopeWhere(
  scope: Scope,
  tableAlias = "",
  existingParams: unknown[] = [],
  regionCol = "region",
  districtCol = "district",
  stationCol = "station_id",
): { where: string; params: unknown[] } {
  if (scope.isNational) return { where: "", params: existingParams };

  const p = [...existingParams];
  const prefix = tableAlias ? `${tableAlias}.` : "";
  const parts: string[] = [];

  if (scope.isRegional && scope.region) {
    p.push(scope.region);
    parts.push(`${prefix}"${regionCol}" = $${p.length}`);
  } else if (scope.isDistrict && scope.district) {
    p.push(scope.district);
    parts.push(`${prefix}"${districtCol}" = $${p.length}`);
  } else if (scope.isStation && scope.station_id) {
    p.push(scope.station_id);
    parts.push(`${prefix}"${stationCol}" = $${p.length}`);
  } else if (scope.isRegional && scope.region) {
    p.push(scope.region);
    parts.push(`${prefix}"${regionCol}" = $${p.length}`);
  }

  return { where: parts.join(" AND "), params: p };
}

/**
 * Apply scope to a query builder builder.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyScopeToQuery(query: any, scope: Scope): any {
  // National commanders see everything
  if (scope.isNational) return query;
  // Regional: filter by region only
  if (scope.isRegional && scope.region) return query.eq("region", scope.region);
  // District: filter by district if available, else region
  if (scope.isDistrict) {
    if (scope.district) return query.eq("district", scope.district);
    if (scope.region)   return query.eq("region",   scope.region);
  }
  // Station/Post officers: filter by station_id if available, else region
  // NOTE: Don't over-filter — if station_id doesn't match any data, fall back to region
  if (scope.isStation) {
    if (scope.station_id) return query.eq("station_id", scope.station_id);
    if (scope.region)     return query.eq("region",     scope.region);
  }
  return query;
}
