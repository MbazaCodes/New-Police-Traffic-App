"use client";

import { create } from "zustand";
import type { ScreenId } from "@/lib/police-data";
import { ALERTS } from "@/lib/police-data";

export type UserRole = "officer-traffic" | "officer-general" | "admin" | "commander";
export type OfficerRole = "officer-traffic" | "officer-general";
export const OFFICER_ROLES: OfficerRole[] = ["officer-traffic", "officer-general"];

function normalizeOfficerRole(role?: UserRole): OfficerRole {
  if (role === "officer-general" || role === "officer-traffic") return role;
  return "officer-traffic";
}

export type AdminScreen =
  | "dashboard" | "officers" | "incidents" | "citations" | "patrols"
  | "alerts" | "reports" | "users" | "settings" | "stations" | "posts"
  | "assignments" | "detained-citizens"
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
  login: (role?: UserRole) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;

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

export const usePoliceStore = create<PoliceState>((set, get) => ({
  isAuthenticated: false,
  userRole: "officer-traffic",
  login: (role) => {
    const officerRole = normalizeOfficerRole(role);
    set({ isAuthenticated: true, userRole: officerRole, currentScreen: "home", activeTab: "home", history: ["home"], adminScreen: "dashboard" });
  },
  logout: () => set({ isAuthenticated: false, currentScreen: "login", activeTab: "home", history: [], readAlertIds: [] }),
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
}));
