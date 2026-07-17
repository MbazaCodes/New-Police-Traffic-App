'use client';

import React from 'react';
import {
  LayoutDashboard, Users, Settings, User, Bell, HelpCircle, LogOut,
  Shield, Server, Flag, Map, Building, Building2, Car, UserCheck,
  Search, FileText, Eye, BarChart3, Activity, Database,
  FileCheck, FolderOpen, ClipboardList, AlertTriangle, BadgeCheck,
  Lock, Globe, Wrench, ScrollText, Mail, Save, MonitorCheck,
  ListChecks, ShieldCheck, UserCog, Route, Radio, Megaphone,
  FileSearch, Fingerprint, Gavel, ShieldAlert, Truck, FileWarning,
  Calendar, Clock, TrendingUp, PieChart, Printer
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

// ---- Icon mapping ----
const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Users, Settings, User, Bell, HelpCircle, LogOut,
  Shield, Server, Flag, Map, Building, Building2, Car, UserCheck,
  Search, FileText, Eye, BarChart3, Activity, Database,
  FileCheck, FolderOpen, ClipboardList, AlertTriangle, BadgeCheck,
  Lock, Globe, Wrench, ScrollText, Mail, Save, MonitorCheck,
  ListChecks, ShieldCheck, UserCog, Route, Radio, Megaphone,
  FileSearch, Fingerprint, Gavel, ShieldAlert, Truck, FileWarning,
  Calendar, Clock, TrendingUp, PieChart, Printer,
};

// ---- Role Navigation Config ----
interface NavItem {
  id: string;
  label: string;
  labelSw: string;
  icon: string;
  badge?: string;
}

interface RoleNav {
  role: Role;
  label: string;
  labelSw: string;
  color: string;
  items: NavItem[];
}

const ROLE_NAVS: RoleNav[] = [
  {
    role: 'SUPER_ADMIN', label: 'Super Admin', labelSw: 'Mkuu Mkuu', color: 'text-red-600',
    items: [
      { id: 'dashboard', label: 'Dashboard', labelSw: 'Dashibodi', icon: 'LayoutDashboard' },
      { id: 'users', label: 'User Management', labelSw: 'Usimamizi wa Watumiaji', icon: 'UserCog' },
      { id: 'roles', label: 'Roles & Permissions', labelSw: 'Majukumu na Ruhusa', icon: 'ShieldCheck' },
      { id: 'audit-log', label: 'Audit Log', labelSw: 'Kumbukumbu', icon: 'ListChecks' },
      { id: 'system-config', label: 'System Configuration', labelSw: 'Mpangilio wa Mfumo', icon: 'Settings' },
      { id: 'regions', label: 'Regions', labelSw: 'Mikoa', icon: 'Globe' },
      { id: 'districts', label: 'Districts', labelSw: 'Wilaya', icon: 'Map' },
      { id: 'stations', label: 'Stations', labelSw: 'Vituo', icon: 'Building' },
      { id: 'departments', label: 'Departments', labelSw: 'Idara', icon: 'Building2' },
      { id: 'reports', label: 'Reports', labelSw: 'Ripoti', icon: 'BarChart3' },
      { id: 'analytics', label: 'Analytics', labelSw: 'Uchambuzi', icon: 'TrendingUp' },
      { id: 'notifications', label: 'Notifications', labelSw: 'Arifa', icon: 'Bell', badge: '5' },
      { id: 'messages', label: 'Messages', labelSw: 'Ujumbe', icon: 'Mail' },
      { id: 'backup', label: 'Backup & Restore', labelSw: 'Nakala', icon: 'Database' },
      { id: 'activity', label: 'Activity Monitor', labelSw: 'Ufuatiliaji', icon: 'Activity' },
      { id: 'maintenance', label: 'Maintenance', labelSw: 'Matengenezo', icon: 'Wrench' },
      { id: 'settings', label: 'Settings', labelSw: 'Mipangilio', icon: 'Settings' },
      { id: 'profile', label: 'Profile', labelSw: 'Wasifu', icon: 'User' },
    ],
  },
  {
    role: 'SYSTEM_ADMIN', label: 'System Admin', labelSw: 'Msimamizi wa Mfumo', color: 'text-orange-600',
    items: [
      { id: 'dashboard', label: 'Dashboard', labelSw: 'Dashibodi', icon: 'LayoutDashboard' },
      { id: 'users', label: 'User Management', labelSw: 'Watumiaji', icon: 'Users' },
      { id: 'system-health', label: 'System Health', labelSw: 'Afya ya Mfumo', icon: 'MonitorCheck' },
      { id: 'maintenance', label: 'Maintenance', labelSw: 'Matengenezo', icon: 'Wrench' },
      { id: 'logs', label: 'System Logs', labelSw: 'Kumbukumbu', icon: 'ScrollText' },
      { id: 'notifications', label: 'Notifications', labelSw: 'Arifa', icon: 'Bell', badge: '3' },
      { id: 'settings', label: 'Settings', labelSw: 'Mipangilio', icon: 'Settings' },
      { id: 'profile', label: 'Profile', labelSw: 'Wasifu', icon: 'User' },
    ],
  },
  {
    role: 'NATIONAL_COMMANDER', label: 'National Commander', labelSw: 'Kamanda Mkuu', color: 'text-green-600',
    items: [
      { id: 'dashboard', label: 'Dashboard', labelSw: 'Dashibodi', icon: 'LayoutDashboard' },
      { id: 'regions', label: 'Regions', labelSw: 'Mikoa', icon: 'Globe' },
      { id: 'officers', label: 'Officers', labelSw: 'Maafisa', icon: 'Users' },
      { id: 'cases', label: 'Cases', labelSw: 'Kesi', icon: 'FileText' },
      { id: 'reports', label: 'Reports', labelSw: 'Ripoti', icon: 'BarChart3' },
      { id: 'analytics', label: 'Analytics', labelSw: 'Uchambuzi', icon: 'TrendingUp' },
      { id: 'notifications', label: 'Notifications', labelSw: 'Arifa', icon: 'Bell', badge: '4' },
      { id: 'settings', label: 'Settings', labelSw: 'Mipangilio', icon: 'Settings' },
      { id: 'profile', label: 'Profile', labelSw: 'Wasifu', icon: 'User' },
    ],
  },
  {
    role: 'REGIONAL_COMMANDER', label: 'Regional Commander', labelSw: 'Kamanda wa Mkoa', color: 'text-teal-600',
    items: [
      { id: 'dashboard', label: 'Dashboard', labelSw: 'Dashibodi', icon: 'LayoutDashboard' },
      { id: 'districts', label: 'Districts', labelSw: 'Wilaya', icon: 'Map' },
      { id: 'officers', label: 'Officers', labelSw: 'Maafisa', icon: 'Users' },
      { id: 'cases', label: 'Cases', labelSw: 'Kesi', icon: 'FileText' },
      { id: 'reports', label: 'Reports', labelSw: 'Ripoti', icon: 'BarChart3' },
      { id: 'notifications', label: 'Notifications', labelSw: 'Arifa', icon: 'Bell', badge: '3' },
      { id: 'settings', label: 'Settings', labelSw: 'Mipangilio', icon: 'Settings' },
      { id: 'profile', label: 'Profile', labelSw: 'Wasifu', icon: 'User' },
    ],
  },
  {
    role: 'DISTRICT_COMMANDER', label: 'District Commander', labelSw: 'Kamanda wa Wilaya', color: 'text-sky-600',
    items: [
      { id: 'dashboard', label: 'Dashboard', labelSw: 'Dashibodi', icon: 'LayoutDashboard' },
      { id: 'stations', label: 'Stations', labelSw: 'Vituo', icon: 'Building' },
      { id: 'officers', label: 'Officers', labelSw: 'Maafisa', icon: 'Users' },
      { id: 'cases', label: 'Cases', labelSw: 'Kesi', icon: 'FileText' },
      { id: 'reports', label: 'Reports', labelSw: 'Ripoti', icon: 'BarChart3' },
      { id: 'settings', label: 'Settings', labelSw: 'Mipangilio', icon: 'Settings' },
      { id: 'profile', label: 'Profile', labelSw: 'Wasifu', icon: 'User' },
    ],
  },
  {
    role: 'STATION_COMMANDER', label: 'Station Commander', labelSw: 'Kamanda wa Kituo', color: 'text-violet-600',
    items: [
      { id: 'dashboard', label: 'Dashboard', labelSw: 'Dashibodi', icon: 'LayoutDashboard' },
      { id: 'officers', label: 'Officers', labelSw: 'Maafisa', icon: 'Users' },
      { id: 'duty-roster', label: 'Duty Roster', labelSw: 'Orodha ya Ratiba', icon: 'Calendar' },
      { id: 'incidents', label: 'Incidents', labelSw: 'Matukio', icon: 'AlertTriangle' },
      { id: 'reports', label: 'Reports', labelSw: 'Ripoti', icon: 'BarChart3' },
      { id: 'settings', label: 'Settings', labelSw: 'Mipangilio', icon: 'Settings' },
      { id: 'profile', label: 'Profile', labelSw: 'Wasifu', icon: 'User' },
    ],
  },
  {
    role: 'TRAFFIC_OFFICER', label: 'Traffic Officer', labelSw: 'Afisa wa Barabara', color: 'text-yellow-600',
    items: [
      { id: 'dashboard', label: 'Dashboard', labelSw: 'Dashibodi', icon: 'LayoutDashboard' },
      { id: 'traffic-stop', label: 'Traffic Stop', labelSw: 'Kusitisha Gari', icon: 'Car' },
      { id: 'citizen-search', label: 'Citizen Search', labelSw: 'Tafuta Raia', icon: 'UserCheck' },
      { id: 'vehicle-search', label: 'Vehicle Search', labelSw: 'Tafuta Gari', icon: 'Truck' },
      { id: 'violation', label: 'Issue Violation', labelSw: 'Toa Lawama', icon: 'FileWarning' },
      { id: 'fine', label: 'Fine Management', labelSw: 'Faini', icon: 'Gavel' },
      { id: 'accident-report', label: 'Accident Report', labelSw: 'Ripoti ya Ajali', icon: 'AlertTriangle' },
      { id: 'checkpoint', label: 'Checkpoint Log', labelSw: 'Kumbukumbu', icon: 'Route' },
      { id: 'reports', label: 'Reports', labelSw: 'Ripoti', icon: 'BarChart3' },
      { id: 'settings', label: 'Settings', labelSw: 'Mipangilio', icon: 'Settings' },
      { id: 'profile', label: 'Profile', labelSw: 'Wasifu', icon: 'User' },
    ],
  },
  {
    role: 'GENERAL_OFFICER', label: 'General Officer', labelSw: 'Afisa wa Jumla', color: 'text-emerald-600',
    items: [
      { id: 'dashboard', label: 'Dashboard', labelSw: 'Dashibodi', icon: 'LayoutDashboard' },
      { id: 'citizen-search', label: 'Citizen Search', labelSw: 'Tafuta Raia', icon: 'UserCheck' },
      { id: 'officer-search', label: 'Officer Search', labelSw: 'Tafuta Afisa', icon: 'Fingerprint' },
      { id: 'incident-report', label: 'Incident Report', labelSw: 'Ripoti ya Tukio', icon: 'FileWarning' },
      { id: 'case-file', label: 'Case Files', labelSw: 'Mafaili ya Kesi', icon: 'FolderOpen' },
      { id: 'reports', label: 'Reports', labelSw: 'Ripoti', icon: 'BarChart3' },
      { id: 'settings', label: 'Settings', labelSw: 'Mipangilio', icon: 'Settings' },
      { id: 'profile', label: 'Profile', labelSw: 'Wasifu', icon: 'User' },
    ],
  },
  {
    role: 'CID', label: 'CID / Investigator', labelSw: 'CID / Mpelelezi', color: 'text-red-800',
    items: [
      { id: 'dashboard', label: 'Dashboard', labelSw: 'Dashibodi', icon: 'LayoutDashboard' },
      { id: 'intel-console', label: 'Intelligence Console', labelSw: 'Konsoli ya Akili', icon: 'ShieldAlert' },
      { id: 'citizen-search', label: 'Citizen Search', labelSw: 'Tafuta Raia', icon: 'UserCheck' },
      { id: 'vehicle-search', label: 'Vehicle Search', labelSw: 'Tafuta Gari', icon: 'Truck' },
      { id: 'officer-search', label: 'Officer Search', labelSw: 'Tafuta Afisa', icon: 'Fingerprint' },
      { id: 'case-search', label: 'Case Search', labelSw: 'Tafuta Kesi', icon: 'FileSearch' },
      { id: 'wanted', label: 'Wanted Persons', labelSw: 'Watu Waliochotewa', icon: 'ShieldAlert' },
      { id: 'pf3-search', label: 'PF3 Search', labelSw: 'Tafuta PF3', icon: 'FileCheck' },
      { id: 'accident-search', label: 'Accident Search', labelSw: 'Tafuta Ajali', icon: 'AlertTriangle' },
      { id: 'settings', label: 'Settings', labelSw: 'Mipangilio', icon: 'Settings' },
      { id: 'profile', label: 'Profile', labelSw: 'Wasifu', icon: 'User' },
    ],
  },
  {
    role: 'CLERK', label: 'Clerk', labelSw: 'Karani', color: 'text-slate-600',
    items: [
      { id: 'dashboard', label: 'Dashboard', labelSw: 'Dashibodi', icon: 'LayoutDashboard' },
      { id: 'records', label: 'Records', labelSw: 'Rekodi', icon: 'ClipboardList' },
      { id: 'file-management', label: 'File Management', labelSw: 'Msimamizi wa Faili', icon: 'FolderOpen' },
      { id: 'reports', label: 'Reports', labelSw: 'Ripoti', icon: 'BarChart3' },
      { id: 'settings', label: 'Settings', labelSw: 'Mipangilio', icon: 'Settings' },
      { id: 'profile', label: 'Profile', labelSw: 'Wasifu', icon: 'User' },
    ],
  },
  {
    role: 'VIEWER', label: 'Viewer', labelSw: 'Mtazamaji', color: 'text-slate-500',
    items: [
      { id: 'dashboard', label: 'Dashboard', labelSw: 'Dashibodi', icon: 'LayoutDashboard' },
      { id: 'reports', label: 'Reports', labelSw: 'Ripoti', icon: 'BarChart3' },
      { id: 'settings', label: 'Settings', labelSw: 'Mipangilio', icon: 'Settings' },
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

  return (
    <div className="flex flex-col h-full">
      {/* Role Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm',
            role === 'SUPER_ADMIN' && 'bg-red-600',
            role === 'SYSTEM_ADMIN' && 'bg-orange-600',
            role === 'NATIONAL_COMMANDER' && 'bg-green-600',
            role === 'REGIONAL_COMMANDER' && 'bg-teal-600',
            role === 'DISTRICT_COMMANDER' && 'bg-sky-600',
            role === 'STATION_COMMANDER' && 'bg-violet-600',
            role === 'TRAFFIC_OFFICER' && 'bg-yellow-600',
            role === 'GENERAL_OFFICER' && 'bg-emerald-600',
            role === 'CID' && 'bg-red-800',
            role === 'CLERK' && 'bg-slate-600',
            role === 'VIEWER' && 'bg-slate-500',
          )}>
            {nav.label.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-sm truncate">{nav.label}</h2>
            <p className="text-xs text-muted-foreground truncate">{nav.labelSw}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <div className="px-3 space-y-1">
          {nav.items.map((item) => {
            const IconComp = iconMap[item.icon] || LayoutDashboard;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                  'hover:bg-accent hover:text-accent-foreground',
                  isActive && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
                )}
              >
                <IconComp className="h-4 w-4 shrink-0" />
                <span className="truncate flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge variant={isActive ? 'secondary' : 'destructive'} className="h-5 min-w-[20px] flex items-center justify-center text-[10px] px-1">
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t space-y-1">
        <Separator className="mb-2" />
        <button
          onClick={() => onNavigate('help')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Help / Msaada</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout / Toka</span>
        </button>
      </div>
    </div>
  );
}

// ---- Main Shell Component ----
export function RoleShell({ children }: { children: React.ReactNode }) {
  const { user, currentPage, navigate, logout } = useAppStore();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  if (!user) return null;

  const handleNavigate = (page: string) => {
    navigate(page);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r bg-card">
        <SidebarContent role={user.role} currentPage={currentPage} onNavigate={handleNavigate} onLogout={logout} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
          {/* Mobile menu button */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <MenuIcon />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SidebarContent role={user.role} currentPage={currentPage} onNavigate={handleNavigate} onLogout={logout} />
            </SheetContent>
          </Sheet>

          {/* Breadcrumb */}
          <div className="flex-1">
            <h1 className="text-sm font-medium capitalize">{currentPage.replace(/-/g, ' ')}</h1>
            <p className="text-xs text-muted-foreground">{getRoleNav(user.role)?.label}</p>
          </div>

          {/* User info */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative" onClick={() => handleNavigate('notifications')}>
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">5</span>
            </Button>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-xs font-medium leading-none">{user.name}</p>
                <p className="text-[10px] text-muted-foreground">{user.rank} • {user.badgeNumber}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Tanzania Police Digital Platform v2.0</span>
            <span>{user.station} • {user.region}</span>
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