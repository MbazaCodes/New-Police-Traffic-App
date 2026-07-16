"use client";

import { create } from "zustand";
import type { ScreenId } from "@/lib/police-data";

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
  | "assignments" | "detained-citizens";

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

  searchQuery: string;
  searchEntity: "person" | "car" | "device";
  searchStatus: "idle" | "searching" | "found" | "not-found";
  setSearchQuery: (q: string) => void;
  setSearchEntity: (t: "person" | "car" | "device") => void;
  runSearch: (query: string) => void;
  clearSearch: () => void;

  citationPrefill: {
    plate: string; model: string; color: string; vehicleType: string;
    driverName: string; driverLicense: string; driverPhone: string; driverNida: string;
  } | null;
  setCitationPrefill: (data: PoliceState["citationPrefill"]) => void;

  scannerOpen: boolean;
  scannerMode: "qr" | "ocr";
  openScanner: (mode: "qr" | "ocr") => void;
  closeScanner: () => void;

  // Patrol timer
  patrolActive: boolean;
  patrolStartTime: number | null;
  patrolElapsed: number;
  startPatrol: () => void;
  endPatrol: () => void;
  tickPatrol: () => void;

  // Selected offense for detail
  selectedOffenseId: number | null;
  setSelectedOffense: (id: number | null) => void;
}

export const usePoliceStore = create<PoliceState>((set, get) => ({
  isAuthenticated: false,
  userRole: "officer-traffic" as UserRole,
  login: (role) => {
    const officerRole = normalizeOfficerRole(role);
    set({ isAuthenticated: true, userRole: officerRole, currentScreen: "home", activeTab: "home", history: ["home"], adminScreen: "dashboard" });
  },
  logout: () => set({ isAuthenticated: false, currentScreen: "login", activeTab: "home", history: [] }),
  setRole: (role) => set({ userRole: normalizeOfficerRole(role) }),

  activeTab: "home",
  currentScreen: "login",
  history: [],

  navigate: (screen) => {
    const { history } = get();
    set({ currentScreen: screen, history: [...history, screen] });
  },
  setTab: (tab) => set({ activeTab: tab, currentScreen: tab, history: [tab] }),
  goBack: () => {
    const { history } = get();
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const prev = newHistory[newHistory.length - 1];
      set({ currentScreen: prev, history: newHistory });
    } else {
      set({ currentScreen: get().activeTab });
    }
  },

  adminScreen: "dashboard" as AdminScreen,
  setAdminScreen: (s) => set({ adminScreen: s }),

  searchTab: "plate",
  setSearchTab: (t) => set({ searchTab: t }),
  citizenSearchType: "name" as "name" | "nida" | "mobile",
  setCitizenSearchType: (t) => set({ citizenSearchType: t }),

  searchQuery: "",
  searchEntity: "car",
  searchStatus: "idle",
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSearchEntity: (t) => set({ searchEntity: t }),
  runSearch: (query) => {
    set({ searchQuery: query, searchStatus: "searching" });
    setTimeout(() => {
      const q = query.trim().toUpperCase();
      if (q && q.length > 0) set({ searchStatus: "found" });
      else set({ searchStatus: "not-found" });
    }, 1400);
  },
  clearSearch: () => set({ searchQuery: "", searchStatus: "idle" }),

  citationPrefill: null,
  setCitationPrefill: (data) => set({ citationPrefill: data }),

  alertFilter: "all",
  setAlertFilter: (f) => set({ alertFilter: f }),

  scannerOpen: false,
  scannerMode: "qr",
  openScanner: (mode) => set({ scannerOpen: true, scannerMode: mode }),
  closeScanner: () => set({ scannerOpen: false }),

  // Patrol timer
  patrolActive: false,
  patrolStartTime: null,
  patrolElapsed: 0,
  startPatrol: () => set({ patrolActive: true, patrolStartTime: Date.now(), patrolElapsed: 0 }),
  endPatrol: () => set({ patrolActive: false, patrolStartTime: null }),
  tickPatrol: () => {
    const { patrolStartTime } = get();
    if (patrolStartTime) set({ patrolElapsed: Math.floor((Date.now() - patrolStartTime) / 1000) });
  },

  selectedOffenseId: null,
  setSelectedOffense: (id) => set({ selectedOffenseId: id }),
}));
