// =====================================================================
// Auth Utilities - Session management for Police Digital Platform
// =====================================================================

import { Role } from './rbac';

export interface UserSession {
  id: string;
  badgeNumber: string;
  name: string;
  nameSw: string;
  role: Role;
  rank: string;
  station: string;
  region: string;
  district: string;
  avatar?: string;
  phone?: string;
  email?: string;
}

// Mock users for each role
const MOCK_USERS: Record<Role, UserSession> = {
  SUPER_ADMIN: {
    id: 'u-001',
    badgeNumber: 'SA-001',
    name: 'James Mwangi',
    nameSw: 'James Mwangi',
    role: 'SUPER_ADMIN',
    rank: 'Commissioner',
    station: 'National HQ',
    region: 'Dar es Salaam',
    district: 'Kinondoni',
    phone: '+255712000001',
    email: 'admin@tzpolice.go.tz',
  },
  SYSTEM_ADMIN: {
    id: 'u-002',
    badgeNumber: 'SYS-001',
    name: 'Peter Kimaro',
    nameSw: 'Peter Kimaro',
    role: 'SYSTEM_ADMIN',
    rank: 'ASP',
    station: 'National HQ',
    region: 'Dar es Salaam',
    district: 'Ilala',
    phone: '+255712000002',
    email: 'sysadmin@tzpolice.go.tz',
  },
  NATIONAL_COMMANDER: {
    id: 'u-003',
    badgeNumber: 'NC-001',
    name: 'Barnaba Mwansasu',
    nameSw: 'Barnaba Mwansasu',
    role: 'NATIONAL_COMMANDER',
    rank: 'IGP',
    station: 'National HQ',
    region: 'Dar es Salaam',
    district: 'Kinondoni',
  },
  REGIONAL_COMMANDER: {
    id: 'u-004',
    badgeNumber: 'RC-001',
    name: 'Hassan Omar',
    nameSw: 'Hassan Omar',
    role: 'REGIONAL_COMMANDER',
    rank: 'RPC',
    station: 'Regional HQ Arusha',
    region: 'Arusha',
    district: 'Arusha DC',
  },
  DISTRICT_COMMANDER: {
    id: 'u-005',
    badgeNumber: 'DC-001',
    name: 'Grace Mollel',
    nameSw: 'Grace Mollel',
    role: 'DISTRICT_COMMANDER',
    rank: 'OCPD',
    station: 'Arusha DC Station',
    region: 'Arusha',
    district: 'Arusha DC',
  },
  STATION_COMMANDER: {
    id: 'u-006',
    badgeNumber: 'SC-001',
    name: 'John Lekule',
    nameSw: 'John Lekule',
    role: 'STATION_COMMANDER',
    rank: 'OCS',
    station: 'Sokoni One Police Post',
    region: 'Arusha',
    district: 'Arusha DC',
  },
  TRAFFIC_OFFICER: {
    id: 'u-007',
    badgeNumber: 'TF-001',
    name: 'Joseph Mcharo',
    nameSw: 'Joseph Mcharo',
    role: 'TRAFFIC_OFFICER',
    rank: 'Sergeant',
    station: 'Sokoni One Police Post',
    region: 'Arusha',
    district: 'Arusha DC',
  },
  GENERAL_OFFICER: {
    id: 'u-008',
    badgeNumber: 'GO-001',
    name: 'Anna Temu',
    nameSw: 'Anna Temu',
    role: 'GENERAL_OFFICER',
    rank: 'Constable',
    station: 'Sokoni One Police Post',
    region: 'Arusha',
    district: 'Arusha DC',
  },
  CID: {
    id: 'u-009',
    badgeNumber: 'CID-001',
    name: 'Frank Mushi',
    nameSw: 'Frank Mushi',
    role: 'CID',
    rank: 'Inspector',
    station: 'CID Regional Office Arusha',
    region: 'Arusha',
    district: 'Arusha DC',
  },
  CLERK: {
    id: 'u-010',
    badgeNumber: 'CL-001',
    name: 'Rehema Juma',
    nameSw: 'Rehema Juma',
    role: 'CLERK',
    rank: 'Corporal',
    station: 'Sokoni One Police Post',
    region: 'Arusha',
    district: 'Arusha DC',
  },
  VIEWER: {
    id: 'u-011',
    badgeNumber: 'VW-001',
    name: 'David Kamala',
    nameSw: 'David Kamala',
    role: 'VIEWER',
    rank: 'Lance Corporal',
    station: 'Sokoni One Police Post',
    region: 'Arusha',
    district: 'Arusha DC',
  },
};

const SESSION_KEY = 'tz_police_session';

export function login(role: Role): UserSession {
  const user = MOCK_USERS[role];
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
  return user;
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function getSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;
    return JSON.parse(data) as UserSession;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export function getAllMockUsers(): UserSession[] {
  return Object.values(MOCK_USERS);
}