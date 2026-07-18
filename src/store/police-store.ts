"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ScreenId } from "@/lib/police-data";
import { ALERTS } from "@/lib/police-data";

export type UserRole = "officer-traffic" | "officer-general" | "officer-post" | "admin" | "commander";

// Full 11-role auth system
export type AuthRole =
  | "SUPER_ADMIN" | "SYSTEM_ADMIN"
  | "NATIONAL_COMMANDER" | "REGIONAL_COMMANDER" | "DISTRICT_COMMANDER" | "STATION_COMMANDER"
  | "TRAFFIC_OFFICER" | "GENERAL_OFFICER"
  | "INVESTIGATOR" | "CLERK" | "VIEWER";

export const AUTH_ROLES: { id: AuthRole; label: string; labelSw: string; description: string; icon: string; shellType: "mobile" | "admin" | "cid" | "clerk" | "viewer" | "system" }[] = [
  { id: "SUPER_ADMIN", label: "Super Admin", labelSw: "Msimamizi Mkuu", description: "Full system control & user management", icon: "ShieldCheck", shellType: "admin" },
  { id: "SYSTEM_ADMIN", label: "System Admin", labelSw: "Msimamizi wa Mfumo", description: "System health & configuration", icon: "Server", shellType: "system" },
  { id: "NATIONAL_COMMANDER", label: "National Commander", labelSw: "Mkamandeshi Kitaifa", description: "National oversight & analytics", icon: "Landmark", shellType: "admin" },
  { id: "REGIONAL_COMMANDER", label: "Regional Commander", labelSw: "Mkamandeshi wa Mkoa", description: "Regional operations management", icon: "MapPin", shellType: "admin" },
  { id: "DISTRICT_COMMANDER", label: "District Commander", labelSw: "Mkamandeshi wa Wilaya", description: "District-level command", icon: "Building2", shellType: "admin" },
  { id: "STATION_COMMANDER", label: "Station Commander", labelSw: "Mkamandeshi wa Kituo", description: "Station operations & duty rosters", icon: "Building", shellType: "admin" },
  { id: "TRAFFIC_OFFICER", label: "Traffic Officer", labelSw: "Afisa Trafiki", description: "Traffic enforcement & citations", icon: "Car", shellType: "mobile" },
  { id: "POST_OFFICER", label: "Post Officer", labelSw: "Afisa wa Posti", description: "Post station operations & patrol", icon: "MapPin", shellType: "mobile" },
  { id: "GENERAL_OFFICER", label: "General Officer", labelSw: "Afisa Polisi", description: "General policing duties", icon: "UserCheck", shellType: "mobile" },
  { id: "INVESTIGATOR",           label: "CID / Investigator",       labelSw: "Mpelelezi",                      description: "Criminal investigation & intelligence",      icon: "Search",       shellType: "cid" },
  { id: "CID_OFFICER",            label: "CID Officer",               labelSw: "Afisa CID",                      description: "Criminal Investigation Department officer",   icon: "Search",       shellType: "cid" },
  { id: "INVESTIGATION_SUPERVISOR",label:"Investigation Supervisor",   labelSw: "Msimamizi wa Uchunguzi",         description: "Supervises investigation teams",             icon:"ClipboardList",  shellType: "cid" },
  { id: "CYBER_CRIME",            label: "Cyber Crime Unit",          labelSw: "Kitengo cha Uhalifu wa Mtandaoni",description: "Digital forensics & cybercrime",             icon: "Monitor",      shellType: "cid" },
  { id: "IMMIGRATION_LIAISON",    label: "Immigration Liaison",       labelSw: "Afisa Uhamiaji",                 description: "Immigration & border control",               icon: "Globe",        shellType: "viewer" },
  { id: "PRISON_LIAISON",         label: "Prison Liaison",            labelSw: "Afisa Magereza",                 description: "Prison & corrections coordination",          icon: "Lock",         shellType: "viewer" },
  { id: "EMERGENCY_DISPATCHER",   label: "Emergency Dispatcher",      labelSw: "Msimamizi wa Dharura",           description: "911/112 emergency dispatch coordination",    icon: "Phone",        shellType: "system" },
  { id: "EVIDENCE_OFFICER",       label: "Evidence Officer",          labelSw: "Afisa Ushahidi",                 description: "Evidence collection & chain of custody",     icon: "Package",      shellType: "clerk" },
  { id: "AUDIT_OFFICER",          label: "Audit / Internal Affairs",  labelSw: "Afisa Ukaguzi",                  description: "Internal affairs & professional standards",  icon: "FileSearch",   shellType: "system" },
  { id: "DIG",                    label: "Deputy IGP",                labelSw: "Naibu IGP",                      description: "Deputy Inspector General of Police",         icon: "ShieldCheck",  shellType: "admin" },
  { id: "CLERK", label: "Clerk", labelSw: "Karani", description: "Records & file management", icon: "FileText", shellType: "clerk" },
  { id: "VIEWER", label: "Viewer", labelSw: "Mpangaji", description: "Read-only reports & dashboards", icon: "Eye", shellType: "viewer" },
];

function authRoleToStoreRole(authRole: AuthRole): UserRole {
  if (authRole === "TRAFFIC_OFFICER") return "officer-traffic";
  if (authRole === "GENERAL_OFFICER") return "officer-general";
  if (["SUPER_ADMIN","SYSTEM_ADMIN","CLERK","VIEWER","EVIDENCE_OFFICER"].includes(authRole)) return "admin";
  if (["EMERGENCY_DISPATCHER","AUDIT_OFFICER"].includes(authRole)) return "admin";
  if (["INVESTIGATOR","CID_OFFICER","CYBER_CRIME","INVESTIGATION_SUPERVISOR"].includes(authRole)) return "commander";
  if (["IMMIGRATION_LIAISON","PRISON_LIAISON"].includes(authRole)) return "admin";
  if (authRole === "DIG") return "commander";
  return "commander";
}
export type OfficerRole = "officer-traffic" | "officer-general" | "officer-post";
export const OFFICER_ROLES: OfficerRole[] = ["officer-traffic", "officer-general", "officer-post"];

function normalizeOfficerRole(role?: UserRole): OfficerRole {
  if (role === "officer-general" || role === "officer-traffic" || role === "officer-post") return role as OfficerRole;
  return "officer-traffic";
}

export type AdminScreen =
  | "dashboard" | "officers" | "incidents" | "citations" | "patrols"
  | "alerts" | "reports" | "users" | "settings" | "stations" | "posts"
  | "assignments" | "detained-citizens" | "waliokamatwa"
  | "missing";

export interface CitationPrefill {
  plate: string; model: string; color: string; vehicleType: string;
  driverName: string; driverLicense: string; driverPhone: string; driverNida: string;
}

export interface ArrestPrefill {
  suspectName: string; nida: string; phone: string; plate: string; licenseNo: string;
}

export interface WarningPrefill {
  recipientName: string; plate: string; licenseNo: string; phone: string;
}


export interface IncidentPrefill {
  citizenName: string; citizenNida: string; citizenPhone: string; citizenAddress: string;
}

export interface PatrolRecord {
  id: string; date: string; area: string; duration: string;
  durationSecs: number; events: string; photos: number;
}

interface PoliceState {
  isAuthenticated: boolean;
  userRole: UserRole;
  authRole: AuthRole | null;
  login: (role?: UserRole) => void;
  loginAsRole: (authRole: AuthRole) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;

  loginIdentifier: string;
  setLoginIdentifier: (id: string) => void;

  activeTab: ScreenId;
  currentScreen: ScreenId;
  history: ScreenId[];
  navigate: (screen: ScreenId) => void;
  setTab: (tab: ScreenId) => void;
  goBack: () => void;

  adminScreen: AdminScreen;
  setAdminScreen: (s: AdminScreen) => void;

  searchTab: "plate" | "license" | "nida" | "serial";
  setSearchTab: (t: "plate" | "license" | "nida" | "serial") => void;
  citizenSearchType: "name" | "nida" | "mobile";
  setCitizenSearchType: (t: "name" | "nida" | "mobile") => void;
  alertFilter: "all" | "mine" | "important";
  setAlertFilter: (f: "all" | "mine" | "important") => void;

  // Unread alerts count — derived from ALERTS unread flags + readIds
  readAlertIds: number[];
  markAlertRead: (id: number) => void;
  markAllAlertsRead: () => void;
  unreadAlertCount: () => number;

  searchQuery: string;
  searchEntity: "person" | "car" | "device";
  searchStatus: "idle" | "searching" | "found" | "not-found";
  setSearchQuery: (q: string) => void;
  setSearchEntity: (t: "person" | "car" | "device") => void;
  runSearch: (query: string) => void;
  clearSearch: () => void;

  // Prefills
  citationPrefill: CitationPrefill | null;
  setCitationPrefill: (data: CitationPrefill | null) => void;
  arrestPrefill: ArrestPrefill | null;
  setArrestPrefill: (data: ArrestPrefill | null) => void;
  warningPrefill: WarningPrefill | null;
  setWarningPrefill: (data: WarningPrefill | null) => void;

  incidentPrefill: IncidentPrefill | null;
  setIncidentPrefill: (data: IncidentPrefill | null) => void;
  selectedIncidentId: number | null;
  setSelectedIncident: (id: number | null) => void;

  // Scanner
  scannerOpen: boolean;
  scannerMode: "qr" | "ocr";
  openScanner: (mode: "qr" | "ocr") => void;
  closeScanner: () => void;

  // Patrol timer
  patrolActive: boolean;
  patrolStartTime: number | null;
  patrolElapsed: number;
  patrolRecords: PatrolRecord[];
  startPatrol: () => void;
  endPatrol: () => void;
  tickPatrol: () => void;
  addPatrolRecord: (r: PatrolRecord) => void;

  // Selected offense/citation for detail
  selectedOffenseId: number | null;
  setSelectedOffense: (id: number | null) => void;
  selectedCitationId: string | null;
  setSelectedCitation: (id: string | null) => void;
}

export const usePoliceStore = create<PoliceState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      userRole: "officer-traffic",
      authRole: null,
      loginIdentifier: "",
      setLoginIdentifier: (id) => set({ loginIdentifier: id }),

      login: (role) => {
        const officerRole = normalizeOfficerRole(role);
        set({ isAuthenticated: true, userRole: officerRole, currentScreen: "home", activeTab: "home", history: ["home"], adminScreen: "dashboard" });
      },
      loginAsRole: (authRole) => {
        const storeRole = authRoleToStoreRole(authRole);
        // Admin/commander roles must NOT be normalized through the officer normalizer
        const finalRole: UserRole = (storeRole === "admin" || storeRole === "commander")
          ? storeRole
          : normalizeOfficerRole(storeRole);
        set({ isAuthenticated: true, userRole: finalRole, authRole, currentScreen: "home", activeTab: "home", history: ["home"], adminScreen: "dashboard" });
      },
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("tz-police-auth");
        }
        set({ isAuthenticated: false, userRole: "officer-traffic", authRole: null, loginIdentifier: "", currentScreen: "login", activeTab: "home", history: [], readAlertIds: [] });
      },
  setRole: (role) => set({ userRole: normalizeOfficerRole(role) }),

  activeTab: "home",
  currentScreen: "login",
  history: [],
  navigate: (screen) => set({ currentScreen: screen, history: [...get().history, screen] }),
  setTab: (tab) => set({ activeTab: tab, currentScreen: tab, history: [tab] }),
  goBack: () => {
    const { history } = get();
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      set({ currentScreen: newHistory[newHistory.length - 1], history: newHistory });
    } else {
      set({ currentScreen: get().activeTab });
    }
  },

  adminScreen: "dashboard",
  setAdminScreen: (s) => set({ adminScreen: s }),

  searchTab: "plate",
  setSearchTab: (t) => set({ searchTab: t }),
  citizenSearchType: "name",
  setCitizenSearchType: (t) => set({ citizenSearchType: t }),
  alertFilter: "all",
  setAlertFilter: (f) => set({ alertFilter: f }),

  // Alerts
  readAlertIds: [],
  markAlertRead: (id) => set((s) => ({ readAlertIds: s.readAlertIds.includes(id) ? s.readAlertIds : [...s.readAlertIds, id] })),
  markAllAlertsRead: () => set({ readAlertIds: ALERTS.map((a) => a.id) }),
  unreadAlertCount: () => ALERTS.filter((a) => a.unread && !get().readAlertIds.includes(a.id)).length,

  searchQuery: "",
  searchEntity: "car",
  searchStatus: "idle",
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSearchEntity: (t) => set({ searchEntity: t }),
  runSearch: (query) => {
    set({ searchQuery: query, searchStatus: "searching" });
    setTimeout(async () => {
      if (!query.trim()) { set({ searchStatus: "not-found" }); return; }
      // Dynamic import to avoid circular dependency
      const { universalSearch } = await import("@/lib/mock-database");
      const { citizen, vehicle, device } = universalSearch(query);
      set({ searchStatus: (citizen || vehicle || device) ? "found" : "not-found" });
    }, 1000);
  },
  clearSearch: () => set({ searchQuery: "", searchStatus: "idle" }),

  citationPrefill: null,
  setCitationPrefill: (data) => set({ citationPrefill: data }),
  arrestPrefill: null,
  setArrestPrefill: (data) => set({ arrestPrefill: data }),
  warningPrefill: null,
  setWarningPrefill: (data) => set({ warningPrefill: data }),
  incidentPrefill: null,
  setIncidentPrefill: (data) => set({ incidentPrefill: data }),
  selectedIncidentId: null,
  setSelectedIncident: (id) => set({ selectedIncidentId: id }),

  scannerOpen: false,
  scannerMode: "qr",
  openScanner: (mode) => set({ scannerOpen: true, scannerMode: mode }),
  closeScanner: () => set({ scannerOpen: false }),

  // Patrol
  patrolActive: false,
  patrolStartTime: null,
  patrolElapsed: 0,
  patrolRecords: [],
  startPatrol: () => set({ patrolActive: true, patrolStartTime: Date.now(), patrolElapsed: 0 }),
  endPatrol: () => set({ patrolActive: false, patrolStartTime: null }),
  tickPatrol: () => {
    const { patrolStartTime } = get();
    if (patrolStartTime) set({ patrolElapsed: Math.floor((Date.now() - patrolStartTime) / 1000) });
  },
  addPatrolRecord: (r) => set((s) => ({ patrolRecords: [r, ...s.patrolRecords] })),

  selectedOffenseId: null,
  setSelectedOffense: (id) => set({ selectedOffenseId: id }),
  selectedCitationId: null,
  setSelectedCitation: (id) => set({ selectedCitationId: id }),
    }),
    {
      name: "tz-police-auth",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        authRole: state.authRole,
        userRole: state.userRole,
      }) as PoliceState,
    }
  )
);
