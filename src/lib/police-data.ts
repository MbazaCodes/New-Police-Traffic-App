// TZ Police Digital Platform — Types & Configuration Constants
// All mock data removed. Data now comes from Supabase.

export type ScreenId =
  | "login"
  | "home"
  | "search-results"
  | "citizen-search-results"
  | "traffic"
  | "patrol"
  | "alerts"
  | "profile"
  | "accident-report"
  | "vehicle-inspection"
  | "pf3"
  | "citation"
  | "history"
  | "arrest-form"
  | "warning-form"
  | "lost-property"
  | "driver-points"
  | "incident-detail"
  | "offense-detail"
  | "citation-detail"
  | "edit-profile"
  | "sos-request"
  | "incident-view"
  | "citizen-detail"
  | "add-vehicle"
  | "add-citizen"
  | "fine-payment"
  | "bail-out"
  | "officer-request"

// ── Officer profile (empty — populated from Supabase at login) ──────────
export const OFFICER = {
  name: "",
  shortName: "",
  rank: "",
  rankShort: "",
  id: "",
  station: "",
  unit: "",
  phone: "",
  email: "",
  status: "",
};

// ── Officers list (empty — loaded from Supabase) ───────────────────────
export const OFFICERS_LIST: Record<string, unknown>[] = [];

// ── Home stats (zeros until loaded from Supabase) ──────────────────────
export const HOME_STATS = [
  { label: "Matukio Yote", value: "0", icon: "alert", color: "#1E3A8A" },
  { label: "Kesi Zinazosubiri", value: "0", icon: "clock", color: "#FF9800" },
  { label: "Kesi Zilizotatuliwa", value: "0", icon: "check", color: "#10B981" },
  { label: "Patroli Zinazofanya Kazi", value: "0", icon: "car", color: "#EF4444" },
];

// ── Traffic quick actions (navigation config — not mock data) ───────────
export const TRAFFIC_QUICK_ACTIONS = [
  { label: "Ripoti Tukio",    icon: "clipboard",      color: "#2196F3", screen: "incident-detail"        as ScreenId },
  { label: "Tafuta Raia",     icon: "search",          color: "#1E3A8A", screen: "citizen-search-results" as ScreenId },
  { label: "Rekodi Taarifa",  icon: "file-text",       color: "#10B981", screen: "citation"               as ScreenId },
  { label: "Lipa Faini",      icon: "wallet",          color: "#10B981", screen: "fine-payment"           as ScreenId },
  { label: "Kamata Mtuhumiwa",icon: "user-x",          color: "#EF4444", screen: "arrest-form"            as ScreenId },
  { label: "Dhamana",         icon: "shield",          color: "#8B5CF6", screen: "bail-out"               as ScreenId },
  { label: "Ripoti Ajali",    icon: "alert-triangle",  color: "#F97316", screen: "accident-report"        as ScreenId },
  { label: "Historia",        icon: "clock",           color: "#2196F3", screen: "history"                as ScreenId },
];

// ── Patrol stats (zeros until loaded from Supabase) ─────────────────────
export const PATROL_STATS = [
  { label: "Patroli za Leo", value: "0", icon: "shield", color: "#2196F3" },
  { label: "Eneo Lililofunikwa", value: "0", icon: "map-pin", color: "#10B981" },
  { label: "Muda (Saa)", value: "0", icon: "clock", color: "#FF9800" },
  { label: "Umbali (km)", value: "0", icon: "route", color: "#1E3A8A" },
];

// ── Alerts (empty — loaded from Supabase) ───────────────────────────────
export const ALERTS: Record<string, unknown>[] = [];

// ── Profile stats (zeros until loaded from Supabase) ────────────────────
export const PROFILE_STATS = [
  { label: "Patroli Zilizofanywa", value: "0", sub: "Leo", icon: "car", color: "#2196F3" },
  { label: "Citations Zimetolewa", value: "0", sub: "Leo", icon: "file-text", color: "#FF9800" },
  { label: "Makosa Yaliyoshughulikiwa", value: "0", sub: "Leo", icon: "users", color: "#10B981" },
  { label: "Masaa Kazini", value: "0", sub: "Leo", icon: "calendar", color: "#1E3A8A" },
  { label: "Umbali (km)", value: "0", sub: "Wiki Hii", icon: "route", color: "#2196F3" },
];

// ── Profile activities (empty — loaded from Supabase) ───────────────────
export const PROFILE_ACTIVITIES: Record<string, unknown>[] = [];

// ── Profile settings (UI config — not mock data) ───────────────────────
export const PROFILE_SETTINGS = [
  { label: "Profaili Yangu", desc: "Maelezo binafsi", icon: "user", color: "#2196F3" },
  { label: "Mipangilio", desc: "Badilisha mipangilio", icon: "settings", color: "#2196F3" },
  { label: "Usalama", desc: "Nenosiri na usalama", icon: "shield", color: "#2196F3" },
  { label: "Pakua Ripoti", desc: "Ripoti na takwimu", icon: "download", color: "#10B981" },
  { label: "Historia ya Shughuli", desc: "Rekodi zako zote", icon: "clock", color: "#FF9800" },
  { label: "Msaada", desc: "Usaidizi na maelekezo", icon: "help-circle", color: "#2196F3" },
];

// ── Accident form templates (empty — filled by officer) ────────────────
export const ACCIDENT_VEHICLES: Record<string, unknown>[] = [];
export const ACCIDENT_PEOPLE: Record<string, unknown>[] = [];
export const ACCIDENT_EVIDENCE: Record<string, unknown>[] = [];

// ── Vehicle inspection template (empty defaults) ───────────────────────
export const VEHICLE_INSPECTION = {
  plate: "",
  model: "",
  color: "",
  owner: "",
  phone: "",
  location: "",
  datetime: "",
  documents: [] as { label: string; status: string; pass: boolean }[],
  mechanical: [] as { label: string; status: string; pass: boolean }[],
  photos: [] as { label: string }[],
};

// ── PF3 form template (empty defaults) ────────────────────────────────
export const PF3_FORM = {
  referenceNo: "",
  region: "",
  district: "",
  station: "",
  accidentType: "",
  severity: "",
  weather: "",
  roadSurface: "",
  lightCondition: "",
  vehicles: [] as { plate: string; make: string; year: string; color: string; driver: string; license: string; direction: string; damage: string; insured: boolean }[],
  casualties: [] as { name: string; type: string; injury: string; hospital: string; status: string }[],
  witnesses: [] as { name: string; phone: string; statement: string }[],
};

// ── Offense types (configuration constants) ───────────────────────────
export const OFFENSE_TYPES = [
  "Over Speeding",
  "No Seatbelt",
  "Traffic Light Violation",
  "Kutumia Simu wakati wa Udereva",
  "Kutopita kasi",
  "Kutopita mstari",
  "Gari bila Bima",
  "Leseni imekwisha",
  "Kukata kona hatari",
  "Kuepuka kodi",
  "Overloading",
  "No Inspection Certificate",
  "Driving Under Influence",
  "Wrong Overtaking",
];

export const VEHICLE_TYPES = ["Saloon", "Pick Up", "Minibus", "Lori", "Pikipiki", "Bajaji", "Basila"];

// ── Violation points deduction table (configuration constants) ─────────
export const VIOLATION_POINTS: Record<string, number> = {
  // Traffic offenses
  "Over Speeding":                    3.0,
  "Driving Under Influence":          3.0,
  "Wrong Overtaking":                 2.0,
  "Traffic Light Violation":          2.0,
  "No Insurance / Gari bila Bima":    2.0,
  "No Seatbelt":                      0.5,
  "Kutumia Simu wakati wa Udereva":   1.0,
  "Kukata kona hatari":               2.0,
  "Overloading":                      1.5,
  "No Inspection Certificate":        1.0,
  "Defective Vehicle":                1.0,
  "Leseni imekwisha":                 1.5,
  "Kutopita kasi":                    0.5,
  "Kutopita mstari":                  1.0,
  "Kuepuka kodi":                     1.0,
  // Warning/citizen offenses
  "Ugomvi na Mapigano":               2.0,
  "Kelele za Usiku":                  0.5,
  "Kunywa pombe hadharani":           1.0,
  "Kutotii Amri za Polisi":           1.5,
  "Kuzuia Utekelezaji wa Sheria":     2.5,
  "Uvunjaji wa Amri ya Mahakama":     3.0,
  "Ulevi wa Kupindukia":              2.0,
  "Uchafuzi wa Mazingira":            0.5,
};

// ── Points system constants ────────────────────────────────────────────
export const POINTS_YEAR_START = 100;  // Everyone starts at 100 on Jan 1
export const POINTS_STATUS = (pts: number) =>
  pts >= 80 ? "good" : pts >= 60 ? "warning" : pts >= 40 ? "critical" : "suspended";
export const POINTS_STATUS_LABEL = (pts: number) =>
  pts >= 80 ? "Nzuri" : pts >= 60 ? "Tahadhari" : pts >= 40 ? "Hatari" : "Imesimamishwa";
export const POINTS_STATUS_COLOR = (pts: number) =>
  pts >= 80 ? "#10B981" : pts >= 60 ? "#FF9800" : pts >= 40 ? "#EF4444" : "#7C3AED";

// ── Driver points registry types ───────────────────────────────────────
export interface PointsDeduction {
  date: string; offense: string; deducted: number; type: "citation" | "warning";
  officer: string; location: string;
}
export interface DriverPointsRecord {
  id: string;
  nida: string;
  name: string;
  plate: string;
  yearStart: number;
  points: number;
  deducted: number;
  violations: number;
  lastViolation: string;
  status: "good" | "warning" | "critical" | "suspended";
  deductions: PointsDeduction[];
}

// ── Driver points (empty — loaded from Supabase) ──────────────────────
export const DRIVER_POINTS: DriverPointsRecord[] = [];

// ── Citizen conduct points types ───────────────────────────────────────
export interface CitizenPointsRecord {
  nida: string; name: string; phone: string;
  yearStart: number; points: number; deducted: number;
  incidents: number; lastIncident: string;
  status: "good" | "warning" | "critical" | "suspended";
  deductions: PointsDeduction[];
}

// ── Citizen points (empty — loaded from Supabase) ─────────────────────
export const CITIZEN_POINTS: CitizenPointsRecord[] = [];

// ── Lost properties (empty — loaded from Supabase) ─────────────────────
export const LOST_PROPERTIES: Record<string, unknown>[] = [];

// ── Detained citizens (empty — loaded from Supabase) ──────────────────
export const DETAINED_CITIZENS: Record<string, unknown>[] = [];

// ── Chat messages (empty — loaded from Supabase) ──────────────────────
export const CHAT_MESSAGES: Record<string, unknown>[] = [];

// ── Search result (empty template) ────────────────────────────────────
export const SEARCH_RESULT = {
  plate: "",
  model: "",
  year: "",
  color: "",
  type: "",
  owner: "",
  ownerNida: "",
  ownerPhone: "",
  licenseNo: "",
  licenseExpiry: "",
  insuranceExpiry: "",
  inspectionExpiry: "",
  registrationExpiry: "",
  status: "clear" as const,
  outstanding_fines: 0,
  total_fines_amount: "TZS 0",
};

// ── General incidents (empty — loaded from Supabase) ──────────────────
export const GENERAL_INCIDENTS: Record<string, unknown>[] = [];

// ── Traffic stats (zeros until loaded from Supabase) ───────────────────
export const TRAFFIC_STATS = [
  { label: "Jumla ya Makosa", value: "0", icon: "clipboard", color: "#2196F3" },
  { label: "Inasubiri",       value: "0", icon: "clock",     color: "#FF9800" },
  { label: "Imelipwa",        value: "0", icon: "check",     color: "#10B981" },
  { label: "Jumla ya Faini",  value: "0k", sub: "TZS", icon: "wallet", color: "#1E3A8A" },
];
