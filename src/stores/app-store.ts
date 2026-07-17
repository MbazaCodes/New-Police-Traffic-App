import { create } from 'zustand';

export type Role =
  | 'SUPER_ADMIN'
  | 'SYSTEM_ADMIN'
  | 'NATIONAL_COMMANDER'
  | 'REGIONAL_COMMANDER'
  | 'DISTRICT_COMMANDER'
  | 'STATION_COMMANDER'
  | 'TRAFFIC_OFFICER'
  | 'GENERAL_OFFICER'
  | 'CID'
  | 'CLERK'
  | 'VIEWER';

export interface User {
  id: string;
  badgeNumber: string;
  name: string;
  role: Role;
  rank: string;
  station: string;
  region: string;
  district: string;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: Role) => void;
  logout: () => void;
  currentPage: string;
  navigate: (page: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  hydrated: boolean;
  hydrate: () => void;
}

const STORAGE_KEY = 'tz-police-session';

const USERS: Record<Role, User> = {
  SUPER_ADMIN: { id: 'u-001', badgeNumber: 'SA-001', name: 'James Mwangi', role: 'SUPER_ADMIN', rank: 'Commissioner', station: 'National HQ', region: 'Dar es Salaam', district: 'Kinondoni' },
  SYSTEM_ADMIN: { id: 'u-002', badgeNumber: 'SYS-001', name: 'Peter Kimaro', role: 'SYSTEM_ADMIN', rank: 'ASP', station: 'National HQ', region: 'Dar es Salaam', district: 'Ilala' },
  NATIONAL_COMMANDER: { id: 'u-003', badgeNumber: 'NC-001', name: 'Barnaba Mwansasu', role: 'NATIONAL_COMMANDER', rank: 'IGP', station: 'National HQ', region: 'Dar es Salaam', district: 'Kinondoni' },
  REGIONAL_COMMANDER: { id: 'u-004', badgeNumber: 'RC-001', name: 'Hassan Omar', role: 'REGIONAL_COMMANDER', rank: 'RPC', station: 'Regional HQ', region: 'Arusha', district: 'Arusha DC' },
  DISTRICT_COMMANDER: { id: 'u-005', badgeNumber: 'DC-001', name: 'Grace Mollel', role: 'DISTRICT_COMMANDER', rank: 'OCPD', station: 'Arusha DC Station', region: 'Arusha', district: 'Arusha DC' },
  STATION_COMMANDER: { id: 'u-006', badgeNumber: 'SC-001', name: 'John Lekule', role: 'STATION_COMMANDER', rank: 'OCS', station: 'Sokoni Police Post', region: 'Arusha', district: 'Arusha DC' },
  TRAFFIC_OFFICER: { id: 'u-007', badgeNumber: 'TF-001', name: 'Joseph Mcharo', role: 'TRAFFIC_OFFICER', rank: 'Sergeant', station: 'Sokoni Police Post', region: 'Arusha', district: 'Arusha DC' },
  GENERAL_OFFICER: { id: 'u-008', badgeNumber: 'GO-001', name: 'Anna Temu', role: 'GENERAL_OFFICER', rank: 'Constable', station: 'Sokoni Police Post', region: 'Arusha', district: 'Arusha DC' },
  CID: { id: 'u-009', badgeNumber: 'CID-001', name: 'Frank Mushi', role: 'CID', rank: 'Inspector', station: 'CID Regional Office', region: 'Arusha', district: 'Arusha DC' },
  CLERK: { id: 'u-010', badgeNumber: 'CL-001', name: 'Rehema Juma', role: 'CLERK', rank: 'Corporal', station: 'Sokoni Police Post', region: 'Arusha', district: 'Arusha DC' },
  VIEWER: { id: 'u-011', badgeNumber: 'VW-001', name: 'David Kamala', role: 'VIEWER', rank: 'Lance Corporal', station: 'Sokoni Police Post', region: 'Arusha', district: 'Arusha DC' },
};

// Manual persistence helpers
function loadState(): Partial<AppState> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveState(state: Partial<AppState>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked
  }
}

function clearState() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}

export const useAppStore = create<AppState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  currentPage: 'dashboard',
  theme: 'light',
  hydrated: false,

  hydrate: () => {
    const saved = loadState();
    if (saved) {
      set({
        user: saved.user || null,
        isAuthenticated: saved.isAuthenticated || false,
        currentPage: saved.currentPage || 'dashboard',
        theme: saved.theme || 'light',
        hydrated: true,
      });
      // Apply theme
      if (saved.theme === 'dark' && typeof document !== 'undefined') {
        document.documentElement.classList.add('dark');
      }
    } else {
      set({ hydrated: true });
    }
  },

  login: (role: Role) => {
    const user = USERS[role];
    const state = { user, isAuthenticated: true, currentPage: 'dashboard' };
    set(state);
    saveState(state);
  },

  logout: () => {
    const state = { user: null, isAuthenticated: false, currentPage: 'dashboard' };
    set(state);
    clearState();
  },

  navigate: (page: string) => {
    set({ currentPage: page });
    const { user, isAuthenticated, theme } = get();
    saveState({ user, isAuthenticated, currentPage: page, theme });
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: newTheme });
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
    const { user, isAuthenticated, currentPage } = get();
    saveState({ user, isAuthenticated, currentPage, theme: newTheme });
  },
}));

// Hydrate on load
if (typeof window !== 'undefined') {
  // Use requestAnimationFrame to ensure it runs after React hydration
  requestAnimationFrame(() => {
    useAppStore.getState().hydrate();
  });
}