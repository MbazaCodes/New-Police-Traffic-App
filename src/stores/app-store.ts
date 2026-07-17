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
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: (role: Role) => {
    const users: Record<Role, User> = {
      SUPER_ADMIN: { id: 'u-001', badgeNumber: 'SA-001', name: 'James Mwangi', role, rank: 'Commissioner', station: 'National HQ', region: 'Dar es Salaam', district: 'Kinondoni' },
      SYSTEM_ADMIN: { id: 'u-002', badgeNumber: 'SYS-001', name: 'Peter Kimaro', role, rank: 'ASP', station: 'National HQ', region: 'Dar es Salaam', district: 'Ilala' },
      NATIONAL_COMMANDER: { id: 'u-003', badgeNumber: 'NC-001', name: 'Barnaba Mwansasu', role, rank: 'IGP', station: 'National HQ', region: 'Dar es Salaam', district: 'Kinondoni' },
      REGIONAL_COMMANDER: { id: 'u-004', badgeNumber: 'RC-001', name: 'Hassan Omar', role, rank: 'RPC', station: 'Regional HQ', region: 'Arusha', district: 'Arusha DC' },
      DISTRICT_COMMANDER: { id: 'u-005', badgeNumber: 'DC-001', name: 'Grace Mollel', role, rank: 'OCPD', station: 'Arusha DC Station', region: 'Arusha', district: 'Arusha DC' },
      STATION_COMMANDER: { id: 'u-006', badgeNumber: 'SC-001', name: 'John Lekule', role, rank: 'OCS', station: 'Sokoni Police Post', region: 'Arusha', district: 'Arusha DC' },
      TRAFFIC_OFFICER: { id: 'u-007', badgeNumber: 'TF-001', name: 'Joseph Mcharo', role, rank: 'Sergeant', station: 'Sokoni Police Post', region: 'Arusha', district: 'Arusha DC' },
      GENERAL_OFFICER: { id: 'u-008', badgeNumber: 'GO-001', name: 'Anna Temu', role, rank: 'Constable', station: 'Sokoni Police Post', region: 'Arusha', district: 'Arusha DC' },
      CID: { id: 'u-009', badgeNumber: 'CID-001', name: 'Frank Mushi', role, rank: 'Inspector', station: 'CID Regional Office', region: 'Arusha', district: 'Arusha DC' },
      CLERK: { id: 'u-010', badgeNumber: 'CL-001', name: 'Rehema Juma', role, rank: 'Corporal', station: 'Sokoni Police Post', region: 'Arusha', district: 'Arusha DC' },
      VIEWER: { id: 'u-011', badgeNumber: 'VW-001', name: 'David Kamala', role, rank: 'Lance Corporal', station: 'Sokoni Police Post', region: 'Arusha', district: 'Arusha DC' },
    };
    set({ user: users[role], isAuthenticated: true, currentPage: 'dashboard' });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, currentPage: 'dashboard' });
    // Force full page reload to ensure clean state
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  },
  currentPage: 'dashboard',
  navigate: (page: string) => set({ currentPage: page }),
}));