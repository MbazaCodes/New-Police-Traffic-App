"use client";

import { create } from "zustand";
import type { ScreenId } from "@/lib/police-data";

interface PoliceState {
  // Auth
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;

  // Navigation
  activeTab: ScreenId; // current bottom-nav tab
  currentScreen: ScreenId; // actual screen shown (may be a pushed screen like accident-report)
  history: ScreenId[];

  navigate: (screen: ScreenId) => void;
  setTab: (tab: ScreenId) => void;
  goBack: () => void;

  // UI state
  searchTab: "plate" | "license" | "nida";
  setSearchTab: (t: "plate" | "license" | "nida") => void;
  alertFilter: "all" | "mine" | "important";
  setAlertFilter: (f: "all" | "mine" | "important") => void;
}

export const usePoliceStore = create<PoliceState>((set, get) => ({
  isAuthenticated: false,
  login: () => set({ isAuthenticated: true, currentScreen: "home", activeTab: "home", history: ["home"] }),
  logout: () =>
    set({
      isAuthenticated: false,
      currentScreen: "login",
      activeTab: "home",
      history: [],
    }),

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

  searchTab: "plate",
  setSearchTab: (t) => set({ searchTab: t }),

  alertFilter: "all",
  setAlertFilter: (f) => set({ alertFilter: f }),
}));
