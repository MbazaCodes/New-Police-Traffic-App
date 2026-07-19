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
import { ROLE_USERS } from "@/lib/mock-engine";
import { AdminDashboard } from "./screens/admin-dashboard";
import { CommissionerDashboard } from "./screens/commissioner-dashboard";
import { WaliokamatwaScreen } from "./screens/waliokamatwa-screen";
import { AdminRequests } from "./screens/admin-requests";
import { AdminCommunications } from "./screens/admin-communications";
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
import { DetainedCitizensScreen } from "./screens/detained-citizens-screen";
import { AdminMissing } from "./screens/admin-missing";

const COMMANDER_NAV: { id: AdminScreen; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
  { id: "dashboard",         label: "Dashboard",       icon: LayoutDashboard },
  { id: "officers",          label: "Maofisa",          icon: Users },
  { id: "incidents",         label: "Matukio",          icon: AlertTriangle, badge: 5 },
  { id: "citations",         label: "Citations",        icon: FileText },
  { id: "patrols",           label: "Patroli",          icon: Shield, badge: 5 },
  { id: "alerts",            label: "Arifa",            icon: Bell, badge: 3 },
  { id: "reports",           label: "Ripoti",           icon: BarChart3 },
  { id: "detained-citizens", label: "Wafungwa",         icon: Shield, badge: 3 },
  { id: "waliokamatwa",      label: "Waliokamatwa",     icon: Users, badge: 5 },
  { id: "requests",         label: "Maombi ya Maafisa",icon: Users, badge: 4 },
  { id: "missing",           label: "Wanaotafutwa",     icon: AlertTriangle, badge: 7 },
  { id: "stations",          label: "Vituo",            icon: Building2 },
  { id: "posts",             label: "Posti",            icon: Network, badge: 1 },
  { id: "assignments",       label: "Mgao",             icon: ArrowRightLeft, badge: 3 },
  { id: "settings",          label: "Mipangilio",       icon: Settings },
  // Commanders do NOT see Watumiaji — that is Admin-only
];

// Officer — field operations (web version)
const OFFICER_NAV: { id: AdminScreen; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
  { id: "dashboard",         label: "Nyumbani",         icon: LayoutDashboard },
  { id: "citations",         label: "Citations",        icon: FileText },
  { id: "incidents",         label: "Matukio",          icon: AlertTriangle, badge: 5 },
  { id: "patrols",           label: "Patroli",          icon: Shield },
  { id: "detained-citizens", label: "Wafungwa",         icon: Shield },
  { id: "waliokamatwa",      label: "Waliokamatwa",     icon: Users },
  { id: "requests",         label: "Maombi ya Maafisa",icon: Users, badge: 4 },
  { id: "missing",           label: "Wanaotafutwa",     icon: AlertTriangle, badge: 7 },
  { id: "alerts",            label: "Arifa",            icon: Bell, badge: 3 },
  { id: "reports",           label: "Ripoti",           icon: BarChart3 },
];

// Admin — management focus
const ADMIN_NAV: { id: AdminScreen; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "officers", label: "Maofisa", icon: Users },
  { id: "users", label: "Watumiaji", icon: Users },
  { id: "stations", label: "Vituo", icon: Building2 },
  { id: "posts", label: "Posti", icon: Network, badge: 1 },
  { id: "assignments", label: "Mgao", icon: ArrowRightLeft, badge: 3 },
  { id: "reports", label: "Ripoti", icon: BarChart3 },
  { id: "missing", label: "Wanaotafutwa", icon: AlertTriangle, badge: 7 },
  { id: "settings", label: "Mipangilio", icon: Settings },
];

export function AdminShell() {
  const { adminScreen, setAdminScreen, logout, userRole, authRole, loginIdentifier } = usePoliceStore();

  // Resolve the real logged-in user from ROLE_USERS
  const sessionUser = (() => {
    if (loginIdentifier) {
      const q = loginIdentifier.trim().toLowerCase().replace(/\s/g, "");
      const found = ROLE_USERS.find((u) =>
        u.username.toLowerCase() === q ||
        u.mobile.replace(/\s/g, "") === q ||
        u.email.toLowerCase() === q ||
        u.badgeNo.toLowerCase() === q
      );
      if (found) return found;
    }
    // Fallback: match by authRole
    const roleMap: Record<string, string[]> = {
      SYSTEM_ADMIN: ["admin"], SUPER_ADMIN: ["admin"],
      NATIONAL_COMMANDER: ["national-commissioner"],
      REGIONAL_COMMANDER: ["regional-commissioner"],
      DISTRICT_COMMANDER: ["district-commissioner"],
      STATION_COMMANDER: ["station-commissioner"],
    };
    const matchRoles = roleMap[authRole ?? ""] ?? [];
    return ROLE_USERS.find((u) => matchRoles.includes(u.role)) ?? ROLE_USERS.find((u) => u.role === "admin");
  })();

  const displayName  = sessionUser?.shortName ?? "Msimamizi";
  const displayRank  = sessionUser?.rank ?? "";
  const displayRole  = authRole?.replace(/_/g, " ") ?? (userRole === "commander" ? "Commander" : "Admin");
  const displayStation = sessionUser?.station ?? "";
  const displayUnit  = sessionUser?.unit ?? "";
  const displayRegion = sessionUser?.region ?? "";
  const displayPhoto = sessionUser?.photo ?? "";
  const displayInitials = displayName.split(" ").filter(Boolean).slice(0, 2).map((w: string) => w[0]).join("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const roleLabel = displayRole;
  // Nav is STRICTLY scoped by hierarchy level — each level sees ONLY its items
  const navItems = (() => {
    // Command hierarchy
    if (authRole === "NATIONAL_COMMANDER" || authRole === "SUPER_ADMIN" || authRole === "DIG") return COMMANDER_NAV;
    if (authRole === "REGIONAL_COMMANDER") return COMMANDER_NAV.filter((n) =>
      !["users","stations"].includes(n.id)
    );
    if (authRole === "DISTRICT_COMMANDER") return COMMANDER_NAV.filter((n) =>
      ["dashboard","officers","incidents","citations","patrols","alerts","reports","detained-citizens","waliokamatwa","missing"].includes(n.id)
    );
    if (authRole === "STATION_COMMANDER") return COMMANDER_NAV.filter((n) =>
      ["dashboard","officers","incidents","citations","patrols","alerts","detained-citizens","waliokamatwa","missing"].includes(n.id)
    );
    if (authRole === "SYSTEM_ADMIN") return ADMIN_NAV;
    return ADMIN_NAV;
  })();

  return (
    <div className="flex min-h-screen" style={{ background: "var(--tpf-surface)" }}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex-shrink-0 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } tpf-sidebar`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3.5">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-[#2563EB] ring-2 ring-[#2563EB]/30 shrink-0">
              <Image src="/police-logo.png" alt="TPF" width={36} height={36} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-white leading-tight">TZ Police Force</p>
              <p className="text-[10px] text-white/45 truncate leading-tight mt-0.5">{displayRole}</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white transition lg:hidden">
              <X size={16} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5 app-scroll">
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
                  className={`tpf-nav-item ${active ? "active" : ""}`}
                >
                  <Icon size={16} className="tpf-nav-icon shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#EF4444] px-1 text-[9px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User */}
          <div className="border-t border-white/8 p-2.5">
            <div className="flex items-center gap-2.5 rounded-xl bg-white/5 border border-white/8 p-2.5 hover:bg-white/8 transition group">
              {displayPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={displayPhoto} alt={displayName} className="h-8 w-8 shrink-0 rounded-xl object-cover ring-2 ring-white/20" />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-[11px] font-bold text-white">{displayInitials}</div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-white leading-tight">{displayName}</p>
                <p className="truncate text-[10px] text-white/45 leading-tight">{displayRank || displayStation}</p>
              </div>
              <button onClick={logout} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/35 hover:bg-white/10 hover:text-white transition opacity-0 group-hover:opacity-100">
                <LogOut size={14} />
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
        <header className="tpf-header">
          <button onClick={() => setSidebarOpen(true)} className="text-police lg:hidden">
            <Menu size={24} />
          </button>

          {/* Search */}
          <div className="tpf-search hidden max-w-xs flex-1 sm:flex">
            <Search size={14} className="shrink-0 text-[var(--tpf-text-4)]" />
            <input placeholder="Tafuta maofisa, matukio, citations..." />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--tpf-border)] bg-[var(--tpf-surface-2)] text-[var(--tpf-text-3)] hover:bg-[var(--tpf-border)] hover:text-[var(--tpf-text)] transition"
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Notifications */}
          <div className="relative">
            <button onClick={() => setNotifOpen(!notifOpen)} className={`relative flex h-9 w-9 items-center justify-center rounded-lg border transition ${notifOpen ? "border-[var(--tpf-blue)] bg-[var(--tpf-blue-pale)] text-[var(--tpf-blue)]" : "border-[var(--tpf-border)] bg-[var(--tpf-surface-2)] text-[var(--tpf-text-3)] hover:bg-[var(--tpf-border)]"}`}>
              <Bell size={16} />
              <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#DC2626] px-1 text-[9px] font-bold text-white shadow-sm">
                3
              </span>
            </button>

            {/* Notification Panel */}
            {notifOpen && (
              <div className="tpf-popover w-80">
                <div className="flex items-center justify-between border-b border-[var(--tpf-border)] px-4 py-3">
                  <div>
                    <span className="text-[14px] font-bold text-[var(--tpf-text)]">Arifa</span>
                    <span className="ml-2 tpf-badge tpf-badge-red">3</span>
                  </div>
                  <button onClick={() => setNotifOpen(false)} className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--tpf-text-4)] hover:bg-[var(--tpf-surface-2)] hover:text-[var(--tpf-text)] transition"><X size={14}/></button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-police-soft">
                  {[
                    { id:"N1", title:"SOS — Insp. Hamisi anahitaji msaada", time:"sasa hivi", color:"#EF4444", read:false },
                    { id:"N2", title:"Gari T 003 GHI limeripotiwa libiwa", time:"dk 5", color:"#FF9800", read:false },
                    { id:"N3", title:"Citation mpya — T 009 YZA — Bajaji bila bima", time:"dk 12", color:"#2196F3", read:false },
                    { id:"N4", title:"Ripoti ya Patroli imekamilika — Cprl. Juma", time:"dk 30", color:"#10B981", read:true },
                    { id:"N5", title:"Mkutano wa Kamanda — Kesho 09:00", time:"saa 1", color:"#1E3A8A", read:true },
                  ].map((n) => (
                    <div key={n.id} className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition hover:bg-[var(--tpf-surface-2)] ${n.read ? "opacity-50" : ""}`}>
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor:n.color }}/>
                      <div className="min-w-0 flex-1">
                        <p className={`text-[12.5px] leading-tight text-[var(--tpf-text-2)] ${!n.read ? "font-semibold" : ""}`}>{n.title}</p>
                        <p className="mt-1 text-[11px] text-[var(--tpf-text-4)]">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[var(--tpf-border)] px-4 py-2.5">
                  <button onClick={() => { setAdminScreen("alerts"); setNotifOpen(false); }} className="text-[12.5px] font-semibold text-[var(--tpf-blue)] hover:text-[#1D4ED8] transition">
                    Ona arifa zote →
                  </button>
                </div>
              </div>
            )}

          </div>
            {/* User chip */}
            <div className="flex items-center gap-2 rounded-xl border border-[var(--tpf-border)] bg-[var(--tpf-surface-2)] px-2.5 py-1.5 hover:bg-[var(--tpf-border)] transition cursor-default">
              {displayPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={displayPhoto} alt={displayName} className="h-7 w-7 rounded-lg object-cover" />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-[10px] font-bold text-white">{displayInitials}</div>
              )}
              <div className="hidden sm:block">
                <p className="text-[12px] font-semibold leading-tight text-[var(--tpf-text)]">{displayName}</p>
                <p className="text-[10px] leading-tight text-[var(--tpf-text-4)]">{displayRank || displayRole}</p>
              </div>
              <ChevronDown size={13} className="text-[var(--tpf-text-4)]" />
            </div>
          </div>
        </header>

        {/* Screen content */}
        <main key={adminScreen} className="police-screen-enter flex-1 overflow-y-auto p-4 pb-20 sm:p-5 sm:pb-5 lg:p-6">
          {renderAdminScreen(adminScreen)}
        </main>
      </div>

      {/* Mobile bottom nav — visible only on small screens (lg:hidden) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-[var(--tpf-border)] bg-[var(--tpf-card)] lg:hidden">
        {navItems.slice(0, 5).map((item) => {
          const active = adminScreen === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setAdminScreen(item.id)}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition"
            >
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${active ? "bg-[#2563EB]/12" : ""}`}>
                <Icon size={18} className={active ? "text-[#2563EB]" : "text-[var(--tpf-text-4)]"} />
              </div>
              <span className={`text-[9px] font-semibold leading-none ${active ? "text-[#2563EB]" : "text-[var(--tpf-text-4)]"}`}>
                {item.label.slice(0, 8)}
              </span>
              {item.badge && !active && (
                <span className="absolute right-2 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#EF4444] px-0.5 text-[8px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
        {/* More button — opens sidebar */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg">
            <Menu size={18} className="text-[var(--tpf-text-4)]" />
          </div>
          <span className="text-[9px] font-semibold leading-none text-[var(--tpf-text-4)]">Zaidi</span>
        </button>
      </nav>
    </div>
  );
}

function DashboardRouter() {
  const { authRole } = usePoliceStore();
  const cmdRoles = ["NATIONAL_COMMANDER","REGIONAL_COMMANDER","DISTRICT_COMMANDER","STATION_COMMANDER","SUPER_ADMIN"];
  return cmdRoles.includes(authRole ?? "") ? <CommissionerDashboard /> : <AdminDashboard />;
}

function renderAdminScreen(screen: AdminScreen) {
  switch (screen) {
    case "dashboard":
      return <DashboardRouter />;
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
    case "detained-citizens":
      return <DetainedCitizensScreen />;
    case "requests":
      return <AdminRequests />;
    case "communications":
      return <AdminCommunications />;
    case "waliokamatwa":
      return <WaliokamatwaScreen />;
    case "missing":
      return <AdminMissing />;
    case "settings":
      return <AdminSettings />;
    default:
      return <AdminDashboard />;
  }
}
