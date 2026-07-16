"use client";

import { useState } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  FileText,
  Shield,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Menu,
  X,
  Moon,
  Sun,
  ChevronDown,
  Building2,
  Network,
  ArrowRightLeft,
} from "lucide-react";
import { useTheme } from "next-themes";
import { usePoliceStore, type AdminScreen } from "@/store/police-store";
import { ADMIN_USER } from "@/lib/admin-data";
import { AdminDashboard } from "./screens/admin-dashboard";
import { AdminOfficers } from "./screens/admin-officers";
import { AdminIncidents } from "./screens/admin-incidents";
import { AdminCitations } from "./screens/admin-citations";
import { AdminPatrols } from "./screens/admin-patrols";
import { AdminAlerts } from "./screens/admin-alerts";
import { AdminReports } from "./screens/admin-reports";
import { AdminUsers } from "./screens/admin-users";
import { AdminSettings } from "./screens/admin-settings";
import { AdminStations } from "./screens/admin-stations";
import { AdminPosts } from "./screens/admin-posts";
import { AdminAssignments } from "./screens/admin-assignments";

const COMMANDER_NAV: { id: AdminScreen; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "officers", label: "Maofisa", icon: Users },
  { id: "incidents", label: "Matukio", icon: AlertTriangle, badge: 5 },
  { id: "citations", label: "Citations", icon: FileText },
  { id: "patrols", label: "Patroli", icon: Shield, badge: 5 },
  { id: "alerts", label: "Arifa", icon: Bell, badge: 3 },
  { id: "reports", label: "Ripoti", icon: BarChart3 },
  { id: "users", label: "Watumiaji", icon: Users },
  { id: "stations", label: "Vituo", icon: Building2 },
  { id: "posts", label: "Posti", icon: Network, badge: 1 },
  { id: "assignments", label: "Mgao", icon: ArrowRightLeft, badge: 3 },
  { id: "settings", label: "Mipangilio", icon: Settings },
];

// Admin gets a focused set: users, stations, posts, assignments + settings
const ADMIN_NAV: { id: AdminScreen; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
  { id: "users", label: "Watumiaji", icon: Users },
  { id: "stations", label: "Vituo", icon: Building2 },
  { id: "posts", label: "Posti", icon: Network, badge: 1 },
  { id: "assignments", label: "Mgao", icon: ArrowRightLeft, badge: 3 },
  { id: "settings", label: "Mipangilio", icon: Settings },
];

export function AdminShell() {
  const { adminScreen, setAdminScreen, logout, userRole } = usePoliceStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const roleLabel = userRole === "commander" ? "Station Commissioner" : "Admin Panel";
  const navItems = userRole === "commander" ? COMMANDER_NAV : ADMIN_NAV;

  return (
    <div className="flex min-h-screen bg-police">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-[#0d1b3d] transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 border-b border-white/10 p-4">
            <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-[#2196F3]">
              <Image src="/police-logo.png" alt="TPF" width={40} height={40} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-white">TZ Police</p>
              <p className="text-[10px] text-white/60">{roleLabel}</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="ml-auto text-white/60 lg:hidden">
              <X size={20} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {navItems.map((item) => {
              const active = adminScreen === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setAdminScreen(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                    active
                      ? "bg-[#2196F3] text-white shadow-lg shadow-[#2196F3]/30"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span className="flex-1 text-[13px] font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F44336] px-1 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User */}
          <div className="border-t border-white/10 p-3">
            <div className="flex items-center gap-3 rounded-lg bg-white/5 p-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2196F3] text-[12px] font-bold text-white">
                {ADMIN_USER.shortName.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-bold text-white">{ADMIN_USER.shortName}</p>
                <p className="truncate text-[10px] text-white/50">{ADMIN_USER.rank}</p>
              </div>
              <button onClick={logout} className="text-white/50 hover:text-white">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-police bg-police-card px-4 py-3">
          <button onClick={() => setSidebarOpen(true)} className="text-police lg:hidden">
            <Menu size={24} />
          </button>

          {/* Search */}
          <div className="hidden flex-1 max-w-md items-center gap-2 rounded-xl bg-police-muted px-3 sm:flex">
            <Search size={16} className="text-police-faint" />
            <input
              placeholder="Tafuta maofisa, matukio, citations..."
              className="h-9 flex-1 bg-transparent text-[13px] text-police placeholder:text-police-faint focus:outline-none"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-police-muted text-police-navy"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-police-muted text-police">
              <Bell size={18} />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F44336] px-1 text-[9px] font-bold text-white">
                3
              </span>
            </button>

            {/* User chip */}
            <div className="flex items-center gap-2 rounded-lg bg-police-muted px-2.5 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2196F3] text-[11px] font-bold text-white">
                {ADMIN_USER.shortName.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="hidden sm:block">
                <p className="text-[12px] font-bold leading-tight text-police">{ADMIN_USER.shortName}</p>
                <p className="text-[10px] leading-tight text-police-faint">{ADMIN_USER.rank}</p>
              </div>
              <ChevronDown size={14} className="text-police-faint" />
            </div>
          </div>
        </header>

        {/* Screen content */}
        <main key={adminScreen} className="police-screen-enter flex-1 overflow-y-auto p-4 lg:p-6">
          {renderAdminScreen(adminScreen)}
        </main>
      </div>
    </div>
  );
}

function renderAdminScreen(screen: AdminScreen) {
  switch (screen) {
    case "dashboard":
      return <AdminDashboard />;
    case "officers":
      return <AdminOfficers />;
    case "incidents":
      return <AdminIncidents />;
    case "citations":
      return <AdminCitations />;
    case "patrols":
      return <AdminPatrols />;
    case "alerts":
      return <AdminAlerts />;
    case "reports":
      return <AdminReports />;
    case "users":
      return <AdminUsers />;
    case "stations":
      return <AdminStations />;
    case "posts":
      return <AdminPosts />;
    case "assignments":
      return <AdminAssignments />;
    case "settings":
      return <AdminSettings />;
    default:
      return <AdminDashboard />;
  }
}
