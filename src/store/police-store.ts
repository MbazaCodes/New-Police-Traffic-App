"use client";

import { create } from "zustand";
import type { ScreenId } from "@/lib/police-data";

export type UserRole = "officer" | "admin" | "commander";
export type AdminScreen =
  | "dashboard"
  | "officers"
  | "incidents"
  | "citations"
  | "patrols"
  | "alerts"
  | "reports"
  | "users"
  | "settings";

interface PoliceState {
  // Auth
  isAuthenticated: boolean;
  userRole: UserRole;
  login: (role?: UserRole) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;

  // Navigation
  activeTab: ScreenId;
  currentScreen: ScreenId;
  history: ScreenId[];

  navigate: (screen: ScreenId) => void;
  setTab: (tab: ScreenId) => void;
  goBack: () => void;

  // Admin navigation
  adminScreen: AdminScreen;
  setAdminScreen: (s: AdminScreen) => void;

  // UI state
  searchTab: "plate" | "license" | "nida";
  setSearchTab: (t: "plate" | "license" | "nida") => void;
  alertFilter: "all" | "mine" | "important";
  setAlertFilter: (f: "all" | "mine" | "important") => void;

  // Search
  searchQuery: string;
  searchStatus: "idle" | "searching" | "found" | "not-found";
  setSearchQuery: (q: string) => void;
  runSearch: (query: string) => void;
  clearSearch: () => void;

  // Citation pre-fill (from search results)
  citationPrefill: {
    plate: string;
    model: string;
    color: string;
    vehicleType: string;
    driverName: string;
    driverLicense: string;
    driverPhone: string;
    driverNida: string;
  } | null;
  setCitationPrefill: (data: PoliceState["citationPrefill"]) => void;

  // Camera Scanner
  scannerOpen: boolean;
  scannerMode: "qr" | "ocr";
  openScanner: (mode: "qr" | "ocr") => void;
  closeScanner: () => void;
}

export const usePoliceStore = create<PoliceState>((set, get) => ({
  isAuthenticated: false,
  userRole: "officer" as UserRole,
  login: (role = "officer" as UserRole) =>
    set({
      isAuthenticated: true,
      userRole: role,
      currentScreen: "home",
      activeTab: "home",
      history: ["home"],
      adminScreen: "dashboard",
    }),
  logout: () =>
    set({
      isAuthenticated: false,
      currentScreen: "login",
      activeTab: "home",
      history: [],
    }),
  setRole: (role) => set({ userRole: role }),

  activeTab: "home",
  currentScreen: "login",
  history: [],

  navigate: (screen) => {
    const { history } = get();
    set({ currentScreen: screen, history: [...history, screen] });
  },

  setTab: (tab) => {
    set({ activeTab: tab, currentScreen: tab, history: [tab] });
  },

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

  searchQuery: "",
  searchStatus: "idle",
  setSearchQuery: (q) => set({ searchQuery: q }),
  runSearch: (query) => {
    set({ searchQuery: query, searchStatus: "searching" });
    // Simulate fetching existing record
    setTimeout(() => {
      const q = query.trim().toUpperCase();
      if (q && (q.startsWith("T") || q.length > 0)) {
        set({ searchStatus: "found" });
      } else {
        set({ searchStatus: "not-found" });
      }
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
}));
