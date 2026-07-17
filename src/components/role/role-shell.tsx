'use client';

import React, { useEffect } from 'react';
import {
  LayoutDashboard, Users, Settings, User, Bell, HelpCircle, LogOut,
  Shield, Server, Flag, Map, Building, Building2, Car, UserCheck,
  Search, FileText, Eye, BarChart3, Activity, Database,
  FileCheck, FolderOpen, ClipboardList, AlertTriangle, BadgeCheck,
  Lock, Globe, Wrench, ScrollText, Mail, Save, MonitorCheck,
  ListChecks, ShieldCheck, UserCog, Route, Radio, Megaphone,
  FileSearch, Fingerprint, Gavel, ShieldAlert, Truck, FileWarning,
  Calendar, Clock, TrendingUp, PieChart, Printer, Sun, Moon, ChevronRight, LogIn
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore, Role } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ---- Icon mapping ----
const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Users, Settings, User, Bell, HelpCircle, LogOut,
  Shield, Server, Flag, Map, Building, Building2, Car, UserCheck,
  Search, FileText, Eye, BarChart3, Activity, Database,
  FileCheck, FolderOpen, ClipboardList, AlertTriangle, BadgeCheck,
  Lock, Globe, Wrench, ScrollText, Mail, Save, MonitorCheck,
  ListChecks, ShieldCheck, UserCog, Route, Radio, Megaphone,
  FileSearch, Fingerprint, Gavel, ShieldAlert, Truck, FileWarning,
  Calendar, Clock, TrendingUp, PieChart, Printer, LogIn,
};

// ---- Role Navigation Config ----
interface NavItem {
  id: string;
  label: string;
  labelSw: string;
  icon: string;
  badge?: string;
  section?: string;
}

interface RoleNav {
  role: Role;
  label: string;
  labelSw: string;
  color: string;
  bgGradient: string;
  items: NavItem[];
}

const ROLE_NAVS: RoleNav[] = [
  {
    role: 'SUPER_ADMIN', label: 'Super Admin', labelSw: 'Mkuu Mkuu', color: 'text-red-600',
    bgGradient: 'from-red-600 to-red-700',
    items: [
      { id: 'dashboard', label: 'Dashboard', labelSw: 'Dashibodi', icon: 'LayoutDashboard', section: 'Overview' },
      { id: 'users', label: 'User Management', labelSw: 'Watumiaji', icon: 'UserCog', section: 'Management' },
      { id: 'roles', label: 'Roles & Permissions', labelSw: 'Majukumu', icon: 'ShieldCheck', section: 'Management' },
      { id: 'audit-log', label: 'Audit Log', labelSw: 'Kumbukumbu', icon: 'ListChecks', section: 'Management' },
      { id: 'system-config', label: 'System Configuration', labelSw: 'Mpangilio', icon: 'Settings', section: 'Management' },
      { id: 'regions', label: 'Regions', labelSw: 'Mikoa', icon: 'Globe', section: 'Organization' },
      { id: 'districts', label: 'Districts', labelSw: 'Wilaya', icon: 'Map', section: 'Organization' },
      { id: 'stations', label: 'Stations', labelSw: 'Vituo', icon: 'Building', section: 'Organization' },
      { id: 'departments', label: 'Departments', labelSw: 'Idara', icon: 'Building2', section: 'Organization' },
      { id: 'reports', label: 'Reports', labelSw: 'Ripoti', icon: 'BarChart3', section: 'Data' },
      { id: 'analytics', label: 'Analytics', labelSw: 'Uchambuzi', icon: 'TrendingUp', section: 'Data' },
      { id: 'notifications', label: 'Notifications', labelSw: 'Arifa', icon: 'Bell', badge: '5', section: 'Communication' },
      { id: 'messages', label: 'Messages', labelSw: 'Ujumbe', icon: 'Mail', section: 'Communication' },
      { id: 'backup', label: 'Backup & Restore', labelSw: 'Nakala', icon: 'Database', section: 'System' },
      { id: 'activity', label: 'Activity Monitor', labelSw: 'Ufuatiliaji', icon: 'Activity', section: 'System' },
      { id: 'maintenance', label: 'Maintenance', labelSw: 'Matengenezo', icon: 'Wrench', section: 'System' },
      { id: 'settings', label: 'Settings', labelSw: 'Mipangilio', icon: 'Settings', section: 'Account' },
      { id: 'profile', label: 'Profile', labelSw: 'Wasifu', icon: 'User', section: 'Account' },
    ],
  },
  {
    role: 'SYSTEM_ADMIN', label: 'System Admin', labelSw: 'Msimamizi wa Mfumo', color: 'text-orange-600',
    bgGradient: 'from-orange-600 to-orange-700',
    items: [
      { id: 'dashboard', label: 'Dashboard', labelSw: 'Dashibodi', icon: 'LayoutDashboard', section: 'Overview' },
      { id: 'users', label: 'User Management', labelSw: 'Watumiaji', icon: 'Users', section: 'System' },
      { id: 'system-health', label: 'System Health', labelSw: 'Afya ya Mfumo', icon: 'MonitorCheck', section: 'System' },
      { id: 'maintenance', label: 'Maintenance', labelSw: 'Matengenezo', icon: 'Wrench', section: 'System' },
      { id: 'logs', label: 'System Logs', labelSw: 'Kumbukumbu', icon: 'ScrollText', section: 'System' },
      { id: 'notifications', label: 'Notifications', labelSw: 'Arifa', icon: 'Bell', badge: '3', section: 'Communication' },
      { id: 'settings', label: 'Settings', labelSw: 'Mipangilio', icon: 'Settings', section: 'Account' },
      { id: 'profile', label: 'Profile', labelSw: 'Wasifu', icon: 'User', section: 'Account' },
    ],
  },
  {
    role: 'NATIONAL_COMMANDER', label: 'National Commander', labelSw: 'Kamanda Mkuu', color: 'text-green-600',
    bgGradient: 'from-green-600 to-green-700',
    items: [
      { id: 'dashboard', label: 'Dashboard', labelSw: 'Dashibodi', icon: 'LayoutDashboard', section: 'Overview' },
      { id: 'regions', label: 'Regions', labelSw: 'Mikoa', icon: 'Globe', section: 'Command' },
      { id: 'officers', label: 'Officers', labelSw: 'Maafisa', icon: 'Users', section: 'Command' },
      { id: 'cases', label: 'Cases', labelSw: 'Kesi', icon: 'FileText', section: 'Command' },
      { id: 'reports', label: 'Reports', labelSw: 'Ripoti', icon: 'BarChart3', section: 'Data' },
      { id: 'analytics', label: 'Analytics', labelSw: 'Uchambuzi', icon: 'TrendingUp', section: 'Data' },
      { id: 'notifications', label: 'Notifications', labelSw: 'Arifa', icon: 'Bell', badge: '4', section: 'Communication' },
      { id: 'settings', label: 'Settings', labelSw: 'Mipangilio', icon: 'Settings', section: 'Account' },
      { id: 'profile', label: 'Profile', labelSw: 'Wasifu', icon: 'User', section: 'Account' },
    ],
  },
  {
    role: 'REGIONAL_COMMANDER', label: 'Regional Commander', labelSw: 'Kamanda wa Mkoa', color: 'text-teal-600',
    bgGradient: 'from-teal-600 to-teal-700',
    items: [
      { id: 'dashboard', label: 'Dashboard', labelSw: 'Dashibodi', icon: 'LayoutDashboard', section: 'Overview' },
      { id: 'districts', label: 'Districts', labelSw: 'Wilaya', icon: 'Map', section: 'Command' },
      { id: 'officers', label: 'Officers', labelSw: 'Maafisa', icon: 'Users', section: 'Command' },
      { id: 'cases', label: 'Cases', labelSw: 'Kesi', icon: 'FileText', section: 'Command' },
      { id: 'reports', label: 'Reports', labelSw: 'Ripoti', icon: 'BarChart3', section: 'Data' },
      { id: 'notifications', label: 'Notifications', labelSw: 'Arifa', icon: 'Bell', badge: '3', section: 'Communication' },
      { id: 'settings', label: 'Settings', labelSw: 'Mipangilio', icon: 'Settings', section: 'Account' },
      { id: 'profile', label: 'Profile', labelSw: 'Wasifu', icon: 'User', section: 'Account' },
    ],
  },
  {
    role: 'DISTRICT_COMMANDER', label: 'District Commander', labelSw: 'Kamanda wa Wilaya', color: 'text-sky-600',
    bgGradient: 'from-sky-600 to-sky-700',
    items: [
      { id: 'dashboard', label: 'Dashboard', labelSw: 'Dashibodi', icon: 'LayoutDashboard', section: 'Overview' },
      { id: 'stations', label: 'Stations', labelSw: 'Vituo', icon: 'Building', section: 'Command' },
      { id: 'officers', label: 'Officers', labelSw: 'Maafisa', icon: 'Users', section: 'Command' },
      { id: 'cases', label: 'Cases', labelSw: 'Kesi', icon: 'FileText', section: 'Command' },
      { id: 'reports', label: 'Reports', labelSw: 'Ripoti', icon: 'BarChart3', section: 'Data' },
      { id: 'settings', label: 'Settings', labelSw: 'Mipangilio', icon: 'Settings', section: 'Account' },
      { id: 'profile', label: 'Profile', labelSw: 'Wasifu', icon: 'User', section: 'Account' },
    ],
  },
  {
    role: 'STATION_COMMANDER', label: 'Station Commander', labelSw: 'Kamanda wa Kituo', color: 'text-violet-600',
    bgGradient: 'from-violet-600 to-violet-700',
    items: [
      { id: 'dashboard', label: 'Dashboard', labelSw: 'Dashibodi', icon: 'LayoutDashboard', section: 'Overview' },
      { id: 'officers', label: 'Officers', labelSw: 'Maafisa', icon: 'Users', section: 'Operations' },
      { id: 'duty-roster', label: 'Duty Roster', labelSw: 'Ratiba', icon: 'Calendar', section: 'Operations' },
      { id: 'incidents', label: 'Incidents', labelSw: 'Matukio', icon: 'AlertTriangle', section: 'Operations' },
      { id: 'reports', label: 'Reports', labelSw: 'Ripoti', icon: 'BarChart3', section: 'Data' },
      { id: 'settings', label: 'Settings', labelSw: 'Mipangilio', icon: 'Settings', section: 'Account' },
      { id: 'profile', label: 'Profile', labelSw: 'Wasifu', icon: 'User', section: 'Account' },
    ],
  },
  {
    role: 'TRAFFIC_OFFICER', label: 'Traffic Officer', labelSw: 'Afisa wa Barabara', color: 'text-yellow-600',
    bgGradient: 'from-yellow-600 to-amber-700',
    items: [
      { id: 'dashboard', label: 'Dashboard', labelSw: 'Dashibodi', icon: 'LayoutDashboard', section: 'Overview' },
      { id: 'traffic-stop', label: 'Traffic Stop', labelSw: 'Kusitisha Gari', icon: 'Car', section: 'Enforcement' },
      { id: 'citizen-search', label: 'Citizen Search', labelSw: 'Tafuta Raia', icon: 'UserCheck', section: 'Enforcement' },
      { id: 'vehicle-search', label: 'Vehicle Search', labelSw: 'Tafuta Gari', icon: 'Truck', section: 'Enforcement' },
      { id: 'violation', label: 'Issue Violation', labelSw: 'Toa Lawama', icon: 'FileWarning', section: 'Enforcement' },
      { id: 'fine', label: 'Fine Management', labelSw: 'Faini', icon: 'Gavel', section: 'Enforcement' },
      { id: 'accident-report', label: 'Accident Report', labelSw: 'Ajali', icon: 'AlertTriangle', section: 'Enforcement' },
      { id: 'checkpoint', label: 'Checkpoint Log', labelSw: 'Kumbukumbu', icon: 'Route', section: 'Operations' },
      { id: 'reports', label: 'Reports', labelSw: 'Ripoti', icon: 'BarChart3', section: 'Data' },
      { id: 'settings', label: 'Settings', labelSw: 'Mipangilio', icon: 'Settings', section: 'Account' },
      { id: 'profile', label: 'Profile', labelSw: 'Wasifu', icon: 'User', section: 'Account' },
    ],
  },
  {
    role: 'GENERAL_OFFICER', label: 'General Officer', labelSw: 'Afisa wa Jumla', color: 'text-emerald-600',
    bgGradient: 'from-emerald-600 to-emerald-700',
    items: [
      { id: 'dashboard', label: 'Dashboard', labelSw: 'Dashibodi', icon: 'LayoutDashboard', section: 'Overview' },
      { id: 'citizen-search', label: 'Citizen Search', labelSw: 'Tafuta Raia', icon: 'UserCheck', section: 'Operations' },
      { id: 'officer-search', label: 'Officer Search', labelSw: 'Tafuta Afisa', icon: 'Fingerprint', section: 'Operations' },
      { id: 'incident-report', label: 'Incident Report', labelSw: 'Ripoti ya Tukio', icon: 'FileWarning', section: 'Operations' },
      { id: 'case-file', label: 'Case Files', labelSw: 'Mafaili', icon: 'FolderOpen', section: 'Operations' },
      { id: 'reports', label: 'Reports', labelSw: 'Ripoti', icon: 'BarChart3', section: 'Data' },
      { id: 'settings', label: 'Settings', labelSw: 'Mipangilio', icon: 'Settings', section: 'Account' },
      { id: 'profile', label: 'Profile', labelSw: 'Wasifu', icon: 'User', section: 'Account' },
    ],
  },
  {
    role: 'CID', label: 'CID / Investigator', labelSw: 'CID / Mpelelezi', color: 'text-red-800',
    bgGradient: 'from-red-800 to-red-900',
    items: [
      { id: 'dashboard', label: 'Dashboard', labelSw: 'Dashibodi', icon: 'LayoutDashboard', section: 'Overview' },
      { id: 'intel-console', label: 'Intelligence Console', labelSw: 'Konsoli ya Akili', icon: 'ShieldAlert', section: 'Investigation' },
      { id: 'citizen-search', label: 'Citizen Search', labelSw: 'Tafuta Raia', icon: 'UserCheck', section: 'Search' },
      { id: 'vehicle-search', label: 'Vehicle Search', labelSw: 'Tafuta Gari', icon: 'Truck', section: 'Search' },
      { id: 'officer-search', label: 'Officer Search', labelSw: 'Tafuta Afisa', icon: 'Fingerprint', section: 'Search' },
      { id: 'case-search', label: 'Case Search', labelSw: 'Tafuta Kesi', icon: 'FileSearch', section: 'Search' },
      { id: 'wanted', label: 'Wanted Persons', labelSw: 'Waliochotewa', icon: 'ShieldAlert', section: 'Search' },
      { id: 'pf3-search', label: 'PF3 Search', labelSw: 'Tafuta PF3', icon: 'FileCheck', section: 'Search' },
      { id: 'accident-search', label: 'Accident Search', labelSw: 'Tafuta Ajali', icon: 'AlertTriangle', section: 'Search' },
      { id: 'settings', label: 'Settings', labelSw: 'Mipangilio', icon: 'Settings', section: 'Account' },
      { id: 'profile', label: 'Profile', labelSw: 'Wasifu', icon: 'User', section: 'Account' },
    ],
  },
  {
    role: 'CLERK', label: 'Clerk', labelSw: 'Karani', color: 'text-slate-600',
    bgGradient: 'from-slate-600 to-slate-700',
    items: [
      { id: 'dashboard', label: 'Dashboard', labelSw: 'Dashibodi', icon: 'LayoutDashboard', section: 'Overview' },
      { id: 'records', label: 'Records', labelSw: 'Rekodi', icon: 'ClipboardList', section: 'Records' },
      { id: 'file-management', label: 'File Management', labelSw: 'Faili', icon: 'FolderOpen', section: 'Records' },
      { id: 'reports', label: 'Reports', labelSw: 'Ripoti', icon: 'BarChart3', section: 'Data' },
      { id: 'settings', label: 'Settings', labelSw: 'Mipangilio', icon: 'Settings', section: 'Account' },
      { id: 'profile', label: 'Profile', labelSw: 'Wasifu', icon: 'User', section: 'Account' },
    ],
  },
  {
    role: 'VIEWER', label: 'Viewer', labelSw: 'Mtazamaji', color: 'text-slate-500',
    bgGradient: 'from-slate-500 to-slate-600',
    items: [
      { id: 'dashboard', label: 'Dashboard', labelSw: 'Dashibodi', icon: 'LayoutDashboard', section: 'Overview' },
      { id: 'reports', label: 'Reports', labelSw: 'Ripoti', icon: 'BarChart3', section: 'Data' },
      { id: 'settings', label: 'Settings', labelSw: 'Mipangilio', icon: 'Settings', section: 'Account' },
    ],
  },
];

export function getRoleNav(role: Role): RoleNav | undefined {
  return ROLE_NAVS.find(r => r.role === role);
}

// ---- Sidebar Component ----
function SidebarContent({ role, currentPage, onNavigate, onLogout }: {
  role: Role;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}) {
  const nav = getRoleNav(role);
  if (!nav) return null;

  // Group items by section
  const sections: Record<string, NavItem[]> = {};
  let noSectionItems: NavItem[] = [];
  nav.items.forEach(item => {
    if (item.section) {
      if (!sections[item.section]) sections[item.section] = [];
      sections[item.section].push(item);
    } else {
      noSectionItems.push(item);
    }
  });

  return (
    <div className="flex flex-col h-full">
      {/* Role Header */}
      <div className="p-4">
        <div className={cn(
          'rounded-xl bg-gradient-to-br p-4 text-white shadow-lg',
          nav.bgGradient,
        )}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-sm border border-white/20">
              {nav.label.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-sm truncate drop-shadow-sm">{nav.label}</h2>
              <p className="text-[11px] text-white/80 truncate">{nav.labelSw}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-1">
        <div className="px-3 space-y-1">
          {noSectionItems.map((item) => (
            <SidebarItem key={item.id} item={item} isActive={currentPage === item.id} onNavigate={onNavigate} />
          ))}
          {Object.entries(sections).map(([section, items]) => (
            <div key={section} className="mt-3 first:mt-1">
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{section}</p>
              {items.map((item) => (
                <SidebarItem key={item.id} item={item} isActive={currentPage === item.id} onNavigate={onNavigate} />
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t space-y-0.5">
        <button
          onClick={() => onNavigate('help')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors text-muted-foreground"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Help / Msaada</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-medium"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout / Toka</span>
        </button>
      </div>
    </div>
  );
}

function SidebarItem({ item, isActive, onNavigate }: { item: NavItem; isActive: boolean; onNavigate: (p: string) => void }) {
  const IconComp = iconMap[item.icon] || LayoutDashboard;
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onNavigate(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-150',
              'hover:bg-accent hover:text-accent-foreground',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground font-medium'
                : 'text-foreground/80',
            )}
          >
            <IconComp className="h-4 w-4 shrink-0" />
            <span className="truncate flex-1 text-left">{item.label}</span>
            {item.badge && (
              <Badge variant={isActive ? 'secondary' : 'destructive'} className="h-5 min-w-[20px] flex items-center justify-center text-[10px] px-1.5">
                {item.badge}
              </Badge>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          <p>{item.labelSw}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ---- Main Shell Component ----
export function RoleShell({ children }: { children: React.ReactNode }) {
  const { user, currentPage, navigate, logout, theme, toggleTheme } = useAppStore();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [pageKey, setPageKey] = React.useState(0);

  // Apply theme class on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  if (!user) return null;

  const handleNavigate = (page: string) => {
    navigate(page);
    setMobileOpen(false);
    setPageKey(k => k + 1);
  };

  const handleLogout = () => {
    logout();
    // Force navigation — must be synchronous for agent-browser to catch it
    window.location.replace(window.location.origin + '/');
  };

  const nav = getRoleNav(user.role);
  const currentPageItem = nav?.items.find(i => i.id === currentPage);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r bg-card/50 backdrop-blur-sm">
        <SidebarContent role={user.role} currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64 min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9">
                <MenuIcon />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarContent role={user.role} currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout} />
            </SheetContent>
          </Sheet>

          {/* Breadcrumb */}
          <div className="flex-1 flex items-center gap-1.5 min-w-0">
            <div className="flex items-center gap-1 text-muted-foreground">
              <ChevronRight className="h-3 w-3" />
              <span className="text-xs truncate max-w-[100px]">{nav?.label}</span>
            </div>
            {currentPageItem && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <ChevronRight className="h-3 w-3" />
                <span className="text-xs font-medium text-foreground truncate">{currentPageItem.label}</span>
              </div>
            )}
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-1.5">
            {/* Dark mode toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme}>
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Notifications */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9" onClick={() => handleNavigate('notifications')}>
                    <Bell className="h-4 w-4" />
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold shadow-sm">5</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* User info */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigate('profile')}>
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarFallback className={cn(
                  'text-xs font-bold text-white',
                  `bg-gradient-to-br ${nav?.bgGradient || 'from-gray-600 to-gray-700'}`,
                )}>
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold leading-none">{user.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{user.rank} • {user.badgeNumber}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content with transition */}
        <main className="flex-1 p-4 lg:p-6" key={pageKey}>
          <div className="animate-in fade-in-0 duration-200">
            {children}
          </div>
        </main>

        {/* Sticky Footer */}
        <footer className="mt-auto border-t bg-card/30 px-4 py-2.5 lg:px-6">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-medium">Tanzania Police Digital Platform</span>
              <span className="text-muted-foreground/50">v2.1</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span>{user.station}</span>
              <span className="text-muted-foreground/40">•</span>
              <span>{user.region}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}