// =====================================================================
// RBAC - Role-Based Access Control for Tanzania Police Digital Platform
// 11 Roles, each with its own mini-application
// =====================================================================

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

export const ALL_ROLES: Role[] = [
  'SUPER_ADMIN',
  'SYSTEM_ADMIN',
  'NATIONAL_COMMANDER',
  'REGIONAL_COMMANDER',
  'DISTRICT_COMMANDER',
  'STATION_COMMANDER',
  'TRAFFIC_OFFICER',
  'GENERAL_OFFICER',
  'CID',
  'CLERK',
  'VIEWER',
];

export interface RoleConfig {
  id: Role;
  label: string;
  labelSw: string;
  routePrefix: string;
  color: string;
  icon: string;
  pages: string[];
  searchPermissions: SearchPermission[];
  scope: 'national' | 'regional' | 'district' | 'station' | 'all';
}

export interface SearchPermission {
  type: 'citizen' | 'vehicle' | 'officer' | 'case' | 'wanted' | 'pf3' | 'accident';
  label: string;
}

// Search permissions per role
const TRAFFIC_SEARCHES: SearchPermission[] = [
  { type: 'citizen', label: 'Citizen Search' },
  { type: 'vehicle', label: 'Vehicle Search' },
];

const GENERAL_SEARCHES: SearchPermission[] = [
  { type: 'citizen', label: 'Citizen Search' },
  { type: 'officer', label: 'Officer Search' },
];

const INVESTIGATION_SEARCHES: SearchPermission[] = [
  { type: 'citizen', label: 'Citizen Search' },
  { type: 'vehicle', label: 'Vehicle Search' },
  { type: 'officer', label: 'Officer Search' },
  { type: 'case', label: 'Case Search' },
  { type: 'wanted', label: 'Wanted Persons' },
  { type: 'pf3', label: 'PF3 Form Search' },
  { type: 'accident', label: 'Accident Search' },
];

const ALL_SEARCHES: SearchPermission[] = [
  ...INVESTIGATION_SEARCHES,
];

const COMMAND_SEARCHES: SearchPermission[] = [
  { type: 'citizen', label: 'Citizen Search' },
  { type: 'vehicle', label: 'Vehicle Search' },
  { type: 'officer', label: 'Officer Search' },
  { type: 'case', label: 'Case Search' },
  { type: 'wanted', label: 'Wanted Persons' },
];

// Role configurations
export const ROLES: Record<Role, RoleConfig> = {
  SUPER_ADMIN: {
    id: 'SUPER_ADMIN',
    label: 'Super Admin',
    labelSw: 'Mkuu Mkuu',
    routePrefix: '/admin',
    color: '#dc2626',
    icon: 'Shield',
    pages: [
      'dashboard', 'users', 'roles', 'permissions', 'audit-log',
      'system-config', 'regions', 'districts', 'stations', 'departments',
      'reports', 'analytics', 'notifications', 'messages',
      'backup', 'activity', 'settings', 'profile'
    ],
    searchPermissions: ALL_SEARCHES,
    scope: 'all',
  },
  SYSTEM_ADMIN: {
    id: 'SYSTEM_ADMIN',
    label: 'System Admin',
    labelSw: 'Msimamizi wa Mfumo',
    routePrefix: '/system',
    color: '#ea580c',
    icon: 'Server',
    pages: [
      'dashboard', 'users', 'system-health', 'maintenance',
      'logs', 'notifications', 'settings', 'profile'
    ],
    searchPermissions: [],
    scope: 'all',
  },
  NATIONAL_COMMANDER: {
    id: 'NATIONAL_COMMANDER',
    label: 'National Commander',
    labelSw: 'Kamanda Mkuu wa Kitaifa',
    routePrefix: '/command/national',
    color: '#16a34a',
    icon: 'Flag',
    pages: [
      'dashboard', 'regions', 'officers', 'cases', 'reports',
      'analytics', 'notifications', 'settings', 'profile'
    ],
    searchPermissions: COMMAND_SEARCHES,
    scope: 'national',
  },
  REGIONAL_COMMANDER: {
    id: 'REGIONAL_COMMANDER',
    label: 'Regional Commander',
    labelSw: 'Kamanda wa Mkoa',
    routePrefix: '/command/regional',
    color: '#0d9488',
    icon: 'Map',
    pages: [
      'dashboard', 'districts', 'officers', 'cases', 'reports',
      'notifications', 'settings', 'profile'
    ],
    searchPermissions: COMMAND_SEARCHES,
    scope: 'regional',
  },
  DISTRICT_COMMANDER: {
    id: 'DISTRICT_COMMANDER',
    label: 'District Commander',
    labelSw: 'Kamanda wa Wilaya',
    routePrefix: '/command/district',
    color: '#0284c7',
    icon: 'Building',
    pages: [
      'dashboard', 'stations', 'officers', 'cases', 'reports',
      'settings', 'profile'
    ],
    searchPermissions: COMMAND_SEARCHES,
    scope: 'district',
  },
  STATION_COMMANDER: {
    id: 'STATION_COMMANDER',
    label: 'Station Commander',
    labelSw: 'Kamanda wa Kituo',
    routePrefix: '/command/station',
    color: '#7c3aed',
    icon: 'Building2',
    pages: [
      'dashboard', 'officers', 'duty-roster', 'incidents',
      'reports', 'settings', 'profile'
    ],
    searchPermissions: COMMAND_SEARCHES,
    scope: 'station',
  },
  TRAFFIC_OFFICER: {
    id: 'TRAFFIC_OFFICER',
    label: 'Traffic Officer',
    labelSw: 'Afisa wa Usalama Barabarani',
    routePrefix: '/officer/traffic',
    color: '#ca8a04',
    icon: 'Car',
    pages: [
      'dashboard', 'traffic-stop', 'citizen-search', 'vehicle-search',
      'violation', 'fine', 'accident-report', 'checkpoint',
      'reports', 'settings', 'profile'
    ],
    searchPermissions: TRAFFIC_SEARCHES,
    scope: 'station',
  },
  GENERAL_OFFICER: {
    id: 'GENERAL_OFFICER',
    label: 'General Duty Officer',
    labelSw: 'Afisa wa Jumla',
    routePrefix: '/officer/general',
    color: '#059669',
    icon: 'UserCheck',
    pages: [
      'dashboard', 'citizen-search', 'officer-search', 'incident-report',
      'case-file', 'reports', 'settings', 'profile'
    ],
    searchPermissions: GENERAL_SEARCHES,
    scope: 'station',
  },
  CID: {
    id: 'CID',
    label: 'CID / Investigator',
    labelSw: 'CID / Mpelelezi',
    routePrefix: '/cid',
    color: '#991b1b',
    icon: 'Search',
    pages: [
      'dashboard', 'intel-console', 'citizen-search', 'vehicle-search',
      'officer-search', 'case-search', 'wanted', 'pf3-search',
      'accident-search', 'settings', 'profile'
    ],
    searchPermissions: ALL_SEARCHES,
    scope: 'all',
  },
  CLERK: {
    id: 'CLERK',
    label: 'Clerk',
    labelSw: 'Karani',
    routePrefix: '/clerk',
    color: '#64748b',
    icon: 'FileText',
    pages: [
      'dashboard', 'records', 'file-management', 'reports',
      'settings', 'profile'
    ],
    searchPermissions: [],
    scope: 'station',
  },
  VIEWER: {
    id: 'VIEWER',
    label: 'Viewer',
    labelSw: 'Mtazamaji',
    routePrefix: '/viewer',
    color: '#94a3b8',
    icon: 'Eye',
    pages: [
      'dashboard', 'reports', 'settings'
    ],
    searchPermissions: [],
    scope: 'station',
  },
};

export function getRoleConfig(role: Role): RoleConfig {
  return ROLES[role];
}

export function getRoleByRoute(pathname: string): RoleConfig | null {
  for (const role of ALL_ROLES) {
    const config = ROLES[role];
    if (pathname.startsWith(config.routePrefix)) {
      return config;
    }
  }
  return null;
}

export function hasSearchPermission(role: Role, searchType: SearchPermission['type']): boolean {
  return ROLES[role].searchPermissions.some(p => p.type === searchType);
}

export function canAccessPage(role: Role, page: string): boolean {
  const config = ROLES[role];
  return config.pages.includes(page);
}