// ===== TZ Police Digital Platform — Shared Constants =====
// Used by: PWA (Next.js), Web (Next.js), Flutter (Dart mirror)

import type { UserRole } from "../types";

// ===== App Info =====
export const APP_NAME = "TZ Police Digital Platform";
export const APP_TAGLINE = "USALAMA WETU, JUKUMU LETU";
export const APP_ORG = "TANZANIA POLICE FORCE";
export const APP_COPYRIGHT = "© 2026 Tanzania Police Force";
export const APP_FOOTER = "Mfumo salama wa Jeshi la Polisi Tanzania";

// ===== Roles =====
export const ROLES: {
  id: UserRole;
  label: string;
  sublabel: string;
  appType: "mobile" | "web";
}[] = [
  { id: "officer-traffic", label: "Afisa Trafiki", sublabel: "Traffic Officer", appType: "mobile" },
  { id: "officer-general", label: "Afisa Polisi", sublabel: "General Officer", appType: "mobile" },
  { id: "admin", label: "Admin", sublabel: "Users & Stations", appType: "web" },
  { id: "commander", label: "Kamanda", sublabel: "Command Center", appType: "web" },
];

// ===== Mobile Screens (Traffic Officer) =====
export const TRAFFIC_OFFICER_NAV = [
  { id: "home", label: "Nyumbani" },
  { id: "traffic", label: "Trafiki" },
  { id: "patrol", label: "Patroli" },
  { id: "alerts", label: "Arifa" },
  { id: "profile", label: "Akaunti" },
] as const;

// ===== Mobile Screens (General Officer) =====
export const GENERAL_OFFICER_NAV = [
  { id: "home", label: "Nyumbani" },
  { id: "traffic", label: "Polisi" }, // "Polisi" replaces "Trafiki"
  { id: "patrol", label: "Patroli" },
  { id: "alerts", label: "Arifa" },
  { id: "profile", label: "Akaunti" },
] as const;

// ===== Admin Nav (focused: users, stations, posts, assignments) =====
export const ADMIN_NAV = [
  { id: "users", label: "Watumiaji" },
  { id: "stations", label: "Vituo" },
  { id: "posts", label: "Posti" },
  { id: "assignments", label: "Mgao" },
  { id: "settings", label: "Mipangilio" },
] as const;

// ===== Commander Nav (full command center) =====
export const COMMANDER_NAV = [
  { id: "dashboard", label: "Dashboard" },
  { id: "officers", label: "Maofisa" },
  { id: "incidents", label: "Matukio" },
  { id: "citations", label: "Citations" },
  { id: "patrols", label: "Patroli" },
  { id: "alerts", label: "Arifa" },
  { id: "reports", label: "Ripoti" },
  { id: "users", label: "Watumiaji" },
  { id: "stations", label: "Vituo" },
  { id: "posts", label: "Posti" },
  { id: "assignments", label: "Mgao" },
  { id: "settings", label: "Mipangilio" },
] as const;

// ===== Search Types =====
export const VEHICLE_SEARCH_TABS = [
  { id: "plate", label: "Namba ya Gari", placeholder: "T123ABC" },
  { id: "license", label: "Leseni", placeholder: "DL123456789TZ" },
  { id: "nida", label: "NIDA", placeholder: "1990123456789" },
] as const;

export const CITIZEN_SEARCH_TABS = [
  { id: "name", label: "Jina", placeholder: "Juma Mwinyi" },
  { id: "nida", label: "NIDA", placeholder: "1990123456789" },
  { id: "mobile", label: "Simu", placeholder: "0712345678" },
] as const;

// ===== Offense Types =====
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
];

// ===== Vehicle Types =====
export const VEHICLE_TYPES = [
  "Saloon",
  "Pick Up",
  "Minibus",
  "Lori",
  "Pikipiki",
  "Bajaji",
  "Basila",
];

// ===== Alert Filter Tabs =====
export const ALERT_FILTERS = [
  { id: "all", label: "Yote" },
  { id: "mine", label: "Kesi Zangu" },
  { id: "important", label: "Muhimu" },
] as const;

// ===== Citation History Filters =====
export const CITATION_FILTERS = [
  { id: "all", label: "Zote" },
  { id: "unpaid", label: "Haijalipwa" },
  { id: "paid", label: "Imelipwa" },
] as const;
