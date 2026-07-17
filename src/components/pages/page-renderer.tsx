'use client';

import React from 'react';
import { useAppStore, Role } from '@/stores/app-store';

// Admin pages
import {
  AdminDashboard, AdminUsers, AdminRoles, AdminAuditLog, AdminSystemConfig,
  AdminRegions, AdminDistricts, AdminStations, AdminDepartments, AdminReports,
  AdminAnalytics, AdminNotifications, AdminMessages, AdminBackup, AdminActivity,
  AdminMaintenance, AdminSettings, AdminProfile,
  SystemDashboard, SystemUsers, SystemHealth, SystemMaintenance as SysMaint,
  SystemLogs, SystemNotifications, SystemSettings, SystemProfile,
} from '@/components/pages/admin-pages';

// Commander pages
import {
  NationalDashboard, NationalRegions, NationalOfficers, NationalCases,
  NationalReports, NationalAnalytics, NationalNotifications, NationalSettings, NationalProfile,
  RegionalDashboard, RegionalDistricts, RegionalOfficers, RegionalCases,
  RegionalReports, RegionalNotifications, RegionalSettings, RegionalProfile,
  DistrictDashboard, DistrictStations, DistrictOfficers, DistrictCases,
  DistrictReports, DistrictSettings, DistrictProfile,
  StationDashboard, StationOfficers, StationDutyRoster, StationIncidents,
  StationReports, StationSettings, StationProfile,
} from '@/components/pages/commander-pages';

// Officer pages
import {
  TrafficDashboard, TrafficStopPage, TrafficCitizenSearch, TrafficVehicleSearch,
  TrafficViolation, TrafficFine, TrafficAccidentReport, TrafficCheckpoint,
  TrafficReports, TrafficSettings, TrafficProfile,
  GeneralDashboard, GeneralCitizenSearch, GeneralOfficerSearch,
  GeneralIncidentReport, GeneralCaseFile, GeneralReports, GeneralSettings, GeneralProfile,
} from '@/components/pages/officer-pages';

// CID pages
import {
  CidDashboard, CidIntelConsole, CidCitizenSearch, CidVehicleSearch,
  CidOfficerSearch, CidCaseSearch, CidWanted, CidPf3Search,
  CidAccidentSearch, CidSettings, CidProfile,
} from '@/components/pages/cid-pages';

// Shared pages
import {
  NotificationsPage, SettingsPage, ProfilePage, HelpPage, ReportsPage,
  ClerkDashboard, ClerkRecords, ClerkFileManagement, ClerkReports,
  ViewerDashboard, ViewerReports,
} from '@/components/pages/shared-pages';

// Page mapping: role → pageId → component
type PageComponent = React.ComponentType;

const PAGE_MAP: Record<Role, Record<string, PageComponent>> = {
  SUPER_ADMIN: {
    dashboard: AdminDashboard,
    users: AdminUsers,
    roles: AdminRoles,
    'audit-log': AdminAuditLog,
    'system-config': AdminSystemConfig,
    regions: AdminRegions,
    districts: AdminDistricts,
    stations: AdminStations,
    departments: AdminDepartments,
    reports: AdminReports,
    analytics: AdminAnalytics,
    notifications: AdminNotifications,
    messages: AdminMessages,
    backup: AdminBackup,
    activity: AdminActivity,
    maintenance: AdminMaintenance,
    settings: AdminSettings,
    profile: AdminProfile,
    help: HelpPage,
  },
  SYSTEM_ADMIN: {
    dashboard: SystemDashboard,
    users: SystemUsers,
    'system-health': SystemHealth,
    maintenance: SysMaint,
    logs: SystemLogs,
    notifications: SystemNotifications,
    settings: SystemSettings,
    profile: SystemProfile,
    help: HelpPage,
  },
  NATIONAL_COMMANDER: {
    dashboard: NationalDashboard,
    regions: NationalRegions,
    officers: NationalOfficers,
    cases: NationalCases,
    reports: NationalReports,
    analytics: NationalAnalytics,
    notifications: NationalNotifications,
    settings: NationalSettings,
    profile: NationalProfile,
    help: HelpPage,
  },
  REGIONAL_COMMANDER: {
    dashboard: RegionalDashboard,
    districts: RegionalDistricts,
    officers: RegionalOfficers,
    cases: RegionalCases,
    reports: RegionalReports,
    notifications: RegionalNotifications,
    settings: RegionalSettings,
    profile: RegionalProfile,
    help: HelpPage,
  },
  DISTRICT_COMMANDER: {
    dashboard: DistrictDashboard,
    stations: DistrictStations,
    officers: DistrictOfficers,
    cases: DistrictCases,
    reports: DistrictReports,
    settings: DistrictSettings,
    profile: DistrictProfile,
    help: HelpPage,
  },
  STATION_COMMANDER: {
    dashboard: StationDashboard,
    officers: StationOfficers,
    'duty-roster': StationDutyRoster,
    incidents: StationIncidents,
    reports: StationReports,
    settings: StationSettings,
    profile: StationProfile,
    help: HelpPage,
  },
  TRAFFIC_OFFICER: {
    dashboard: TrafficDashboard,
    'traffic-stop': TrafficStopPage,
    'citizen-search': TrafficCitizenSearch,
    'vehicle-search': TrafficVehicleSearch,
    violation: TrafficViolation,
    fine: TrafficFine,
    'accident-report': TrafficAccidentReport,
    checkpoint: TrafficCheckpoint,
    reports: TrafficReports,
    settings: TrafficSettings,
    profile: TrafficProfile,
    help: HelpPage,
  },
  GENERAL_OFFICER: {
    dashboard: GeneralDashboard,
    'citizen-search': GeneralCitizenSearch,
    'officer-search': GeneralOfficerSearch,
    'incident-report': GeneralIncidentReport,
    'case-file': GeneralCaseFile,
    reports: GeneralReports,
    settings: GeneralSettings,
    profile: GeneralProfile,
    help: HelpPage,
  },
  CID: {
    dashboard: CidDashboard,
    'intel-console': CidIntelConsole,
    'citizen-search': CidCitizenSearch,
    'vehicle-search': CidVehicleSearch,
    'officer-search': CidOfficerSearch,
    'case-search': CidCaseSearch,
    wanted: CidWanted,
    'pf3-search': CidPf3Search,
    'accident-search': CidAccidentSearch,
    settings: CidSettings,
    profile: CidProfile,
    help: HelpPage,
  },
  CLERK: {
    dashboard: ClerkDashboard,
    records: ClerkRecords,
    'file-management': ClerkFileManagement,
    reports: ClerkReports,
    settings: SettingsPage,
    profile: ProfilePage,
    help: HelpPage,
    notifications: NotificationsPage,
  },
  VIEWER: {
    dashboard: ViewerDashboard,
    reports: ViewerReports,
    settings: SettingsPage,
    profile: ProfilePage,
    help: HelpPage,
    notifications: NotificationsPage,
  },
};

export function PageRenderer() {
  const { user, currentPage } = useAppStore();

  if (!user) return null;

  const rolePages = PAGE_MAP[user.role];
  const PageComponent = rolePages?.[currentPage];

  if (!PageComponent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">📄</span>
        </div>
        <h2 className="text-lg font-semibold mb-1">Page Not Found</h2>
        <p className="text-sm text-muted-foreground">The page &quot;{currentPage}&quot; is not available for your role.</p>
      </div>
    );
  }

  return <PageComponent />;
}