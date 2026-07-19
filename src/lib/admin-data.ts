// ============================================================
// ADMIN DATA TYPES — typed empty arrays, no mock data.
// All data is loaded from Supabase at runtime.
// ============================================================

export interface OfficerRecord {
  id: string; name: string; shortName?: string; rank?: string; unit?: string;
  station?: string; region?: string; role?: string; status?: string;
  badge?: string; badgeNo?: string; photo?: string; phone?: string;
  email?: string; online?: boolean; lastTime?: string; lastMsg?: string;
  unread?: number;
}
export interface CitationRecord {
  id: string; plate?: string; offense?: string; driver?: string; date?: string;
  fine?: string; status?: string; statusColor?: string; name?: string;
  time?: string; location?: string; iconColor?: string; icon?: string;
}
export interface IncidentRecord {
  id: string; title?: string; type?: string; status?: string; statusColor?: string;
  date?: string; time?: string; location?: string; officer?: string;
  casualties?: number; description?: string; iconColor?: string; icon?: string;
}
export interface PatrolRecord {
  id: string; area?: string; officer?: string; unit?: string; status?: string;
  lastUpdate?: string; active?: number; patrols?: number; lng?: number; lat?: number;
  assignedTo?: string; unassigned?: boolean;
}
export interface AssignmentRecord {
  id: string; officerName?: string; stationName?: string; postName?: string;
  officerId?: string; stationId?: string; postId?: string; role?: string; status?: string;
}
export interface PostRecord {
  id: string; name?: string; location?: string; type?: string;
  officersCount?: number; status?: string; station?: string;
}
export interface StationRecord {
  id: string; name: string; region: string; district?: string; status?: string;
  commissioner?: string; address?: string; officersCount?: number;
  postsCount?: number; established?: string;
}
export interface AdminUserRecord {
  id: string; name?: string; email?: string; role?: string; status?: string;
  created?: string; lastLogin?: string; initials?: string;
}
export interface WarningRecord {
  id: string; recipient?: string; offense?: string; date?: string;
  location?: string; acknowledged?: boolean; time?: string;
}
export interface MissingRecord {
  id: string; title?: string; type?: string; status?: string;
  caseNo?: string; identifier?: string; photo?: string;
  lastSeen?: string; lastSeenLocation?: string; rewardAmount?: number;
  statusColor?: string;
}
export interface DetainedRecord {
  id: string; reason?: string; station?: string; officer?: string;
  suspectName?: string; date?: string; status?: string;
}
export interface LiveIncidentRecord {
  id: string; type?: string; priority?: string; time?: string;
  location?: string; assignedTo?: string; unassigned?: boolean;
}
export interface ChartPoint { name: string; value: number }
export interface RegionStat {
  region: string; officers?: number; incidents?: number; citations?: number; resolved?: number;
}

// Empty — populated from Supabase at runtime
export const OFFICERS: OfficerRecord[] = [];
export const ADMIN_CITATIONS: CitationRecord[] = [];
export const ADMIN_INCIDENTS: IncidentRecord[] = [];
export const ACTIVE_PATROLS: PatrolRecord[] = [];
export const ASSIGNMENTS: AssignmentRecord[] = [];
export const POSTS: PostRecord[] = [];
export const STATIONS: StationRecord[] = [];
export const ADMIN_USERS: AdminUserRecord[] = [];
export const WARNING_RECORDS: WarningRecord[] = [];
export const LIVE_INCIDENTS: LiveIncidentRecord[] = [];
export const INCIDENT_TREND: ChartPoint[] = [];
export const OFFENSE_DISTRIBUTION: ChartPoint[] = [];
export const GENERAL_INCIDENT_DISTRIBUTION: ChartPoint[] = [];
export const COMBINED_DISTRIBUTION: ChartPoint[] = [];
export const REGION_STATS: RegionStat[] = [];

// Auth user — populated at login from Supabase session
export const ADMIN_USER = { id: "", name: "", shortName: "", badgeNo: "", role: "", station: "", region: "" };

// App settings — real values come from user preferences / DB
export const settings = { theme: "dark", language: "sw", notifications: true, biometric: false };
