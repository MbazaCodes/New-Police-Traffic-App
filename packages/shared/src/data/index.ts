// Barrel re-export — copy police-data.ts, admin-data.ts, admin-mgmt-data.ts here
// In production, these would be fetched from Supabase.
// For now, re-export from the root source for compatibility.
export { OFFICER } from "../../../src/lib/police-data";
export { HOME_STATS } from "../../../src/lib/police-data";
export { TRAFFIC_STATS } from "../../../src/lib/police-data";
export { TRAFFIC_QUICK_ACTIONS } from "../../../src/lib/police-data";
export { RECENT_OFFENSES } from "../../../src/lib/police-data";
export { SEARCH_RESULT } from "../../../src/lib/police-data";
export { PATROL_STATS } from "../../../src/lib/police-data";
export { ALERTS } from "../../../src/lib/police-data";
export { PROFILE_STATS } from "../../../src/lib/police-data";
export { PROFILE_ACTIVITIES } from "../../../src/lib/police-data";
export { PROFILE_SETTINGS } from "../../../src/lib/police-data";
export { ACCIDENT_VEHICLES } from "../../../src/lib/police-data";
export { ACCIDENT_PEOPLE } from "../../../src/lib/police-data";
export { ACCIDENT_EVIDENCE } from "../../../src/lib/police-data";
export { VEHICLE_INSPECTION } from "../../../src/lib/police-data";
export { PF3_FORM } from "../../../src/lib/police-data";
export { CITATION_HISTORY } from "../../../src/lib/police-data";
export { OFFENSE_TYPES } from "../../../src/lib/police-data";
export { VEHICLE_TYPES } from "../../../src/lib/police-data";

// Admin data
export { ADMIN_USER } from "../../../src/lib/admin-data";
export { DASHBOARD_KPIS } from "../../../src/lib/admin-data";
export { INCIDENT_TREND } from "../../../src/lib/admin-data";
export { OFFENSE_DISTRIBUTION } from "../../../src/lib/admin-data";
export { LIVE_INCIDENTS } from "../../../src/lib/admin-data";
export { OFFICERS } from "../../../src/lib/admin-data";
export { ADMIN_INCIDENTS } from "../../../src/lib/admin-data";
export { ADMIN_CITATIONS } from "../../../src/lib/admin-data";
export { ACTIVE_PATROLS } from "../../../src/lib/admin-data";
export { ADMIN_ALERTS_HISTORY } from "../../../src/lib/admin-data";
export { ADMIN_USERS } from "../../../src/lib/admin-data";
export { REGION_STATS } from "../../../src/lib/admin-data";

// Admin management data
export { STATIONS } from "../../../src/lib/admin-mgmt-data";
export { POSTS } from "../../../src/lib/admin-mgmt-data";
export { ASSIGNMENTS } from "../../../src/lib/admin-mgmt-data";
export { UNASSIGNED_OFFICERS } from "../../../src/lib/admin-mgmt-data";
export { CITIZEN_RESULT } from "../../../src/lib/admin-mgmt-data";
