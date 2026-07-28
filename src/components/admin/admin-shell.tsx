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
  Database,
  Activity,
  CheckCircle,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { usePoliceStore, type AdminScreen } from "@/store/police-store";
import { getCommanderNavForRole } from "@/lib/commander-nav";
import { UniversalSearchScreen } from "@/components/shared/universal-search-screen";
import { AdminDashboard } from "./screens/admin-dashboard";
import { CommissionerDashboard } from "./screens/commissioner-dashboard";
import { WaliokamatwaScreen } from "./screens/waliokamatwa-screen";
import { AdminRequests } from "./screens/admin-requests";
import RequestsScreen from "./screens/requests-screen";
import ApprovalsScreen from "./screens/approvals-screen";
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
import { AdminClerks } from "./screens/admin-clerks";
import { MgmtCommand }  from "./screens/mgmt-command";
import { MgmtOfficers } from "./screens/mgmt-officers";
import { MgmtCID }      from "./screens/mgmt-cid";
import { MgmtAdmins }   from "./screens/mgmt-admins";
import { MgmtSpecial }     from "./screens/mgmt-special";
import { AdminDatabase }    from "./screens/admin-database";
import { AdminActivityLog } from "./screens/admin-activity-log";
// MgmtClerks reuses AdminClerks

// NOTE: COMMANDER_NAV and the CMD_* tier allow-lists now live in
// src/lib/commander-nav.ts and are shared with CommandShell.
// Re-exported here for backwards compatibility (other modules may import
// from @/components/admin/admin-shell).
export { COMMANDER_NAV } from "@/lib/commander-nav";

const ADMIN_NAV: { id: AdminScreen; label: string; icon: typeof LayoutDashboard; group?: string }[] = [
  // ── Main ──────────────────────────────────────────────────────
  { id: "search",          label: "Tafuta",                icon: Search,          group: "" },
  { id: "dashboard",       label: "Dashibodi",             icon: LayoutDashboard, group: "" },
  // ── Usimamizi wa Watu ─────────────────────────────────────────
  { id: "mgmt-officers",  label: "Maafisa",               icon: Users,           group: "Usimamizi wa Watu" },
  { id: "mgmt-command",   label: "Kamandi & Utawala",     icon: Shield,          group: "Usimamizi wa Watu" },
  { id: "mgmt-clerks",    label: "Makarani",              icon: Database,        group: "Usimamizi wa Watu" },
  { id: "mgmt-cid",       label: "CID & Upelelezi",       icon: Search,          group: "Usimamizi wa Watu" },
  { id: "mgmt-admins",    label: "Wasimamizi",            icon: Settings,        group: "Usimamizi wa Watu" },
  { id: "mgmt-special",   label: "Idara Maalum",          icon: AlertTriangle,   group: "Usimamizi wa Watu" },
  // ── Uendeshaji ────────────────────────────────────────────────
  { id: "stations",       label: "Vituo",                 icon: Building2,       group: "Uendeshaji" },
  { id: "posts",          label: "Posti",                 icon: Network,         group: "Uendeshaji" },
  { id: "assignments",    label: "Mgao",                  icon: ArrowRightLeft,  group: "Uendeshaji" },
  { id: "missing",        label: "Wanaotafutwa",          icon: AlertTriangle,   group: "Uendeshaji" },
  { id: "reports",        label: "Ripoti",                icon: BarChart3,       group: "Uendeshaji" },
  // ── Maombi & Idhini ───────────────────────────────────────────
  { id: "command-requests", label: "Maombi Yangu",         icon: FileText,        group: "Maombi" },
  { id: "approvals",        label: "Idhini za Maombi",     icon: CheckCircle,     group: "Maombi" },
  // ── Data ──────────────────────────────────────────────────────
  { id: "database",       label: "Database",              icon: Database,        group: "Data" },
  { id: "activity-log",   label: "Kumbukumbu (Logs)",     icon: Activity,        group: "Data" },
  // ── Config ────────────────────────────────────────────────────
  { id: "settings",       label: "Mipangilio",            icon: Settings,        group: "" },
];

export function AdminShell() {
  const { adminScreen, setAdminScreen, logout, userRole, authRole, loginIdentifier, officerProfile } = usePoliceStore();

  // Use profile stored at login from PostgreSQL (VPS) — no ROLE_USERS lookup
  const displayName     = officerProfile?.name ?? "Msimamizi";
  const displayRank     = officerProfile?.rank ?? "";
  const displayRole     = authRole?.replace(/_/g, " ") ?? (userRole === "commander" ? "Commander" : "Admin");
  const displayStation  = officerProfile?.station ?? "";
  const displayUnit     = officerProfile?.unit ?? "";
  const displayRegion   = officerProfile?.region ?? "";
  const displayPhoto    = officerProfile?.photo ?? "";
  const displayInitials = displayName.split(" ").filter(Boolean).slice(0, 2).map((w: string) => w[0]).join("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const { data: session } = useSession();
  const sessionRole = (session?.user?.role as string) ?? "";
  const roleLabel = displayRole;

  // Nav scoped strictly by role — check ALL possible role sources
  const dbRole = (officerProfile?.roleRaw || officerProfile?.role || "").toLowerCase();
  const isAdminRole =
    ["SUPER_ADMIN","SYSTEM_ADMIN","ADMIN"].includes(authRole ?? "") ||
    ["SUPER_ADMIN","SYSTEM_ADMIN","ADMIN"].includes(sessionRole) ||
    ["super-admin","admin","system-admin"].includes(dbRole) ||
    userRole === "admin";

  // Admin roles → full management panel; commander tiers → scoped operational panel.
  // The commander tier filtering is handled by getCommanderNavForRole() in
  // src/lib/commander-nav.ts (shared with CommandShell).
  const navItems = isAdminRole ? ADMIN_NAV : getCommanderNavForRole(authRole);

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
            {navItems.map((item, idx) => {
              const active = adminScreen === item.id;
              const Icon = item.icon;
              // Show a group header when the group changes between consecutive items.
              const prevGroup = idx > 0 ? navItems[idx - 1].group ?? "" : "";
              const showGroupHeader = (item as any).group !== undefined && (item as any).group !== "" && (item as any).group !== prevGroup;
              return (
                <div key={item.id}>
                  {showGroupHeader && (
                    <p className="px-3 pt-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-police-faint">{(item as any).group}</p>
                  )}
                  <button
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
                </div>
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
            </button>

            {/* Notification Panel */}
            {notifOpen && (
              <div className="tpf-popover w-80">
                <div className="flex items-center justify-between border-b border-[var(--tpf-border)] px-4 py-3">
                  <div>
                    <span className="text-[14px] font-bold text-[var(--tpf-text)]">Arifa</span>
                  </div>
                  <button onClick={() => setNotifOpen(false)} className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--tpf-text-4)] hover:bg-[var(--tpf-surface-2)] hover:text-[var(--tpf-text)] transition"><X size={14}/></button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-police-soft">
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <Bell size={32} className="text-[var(--tpf-text-4)] mb-3" />
                    <p className="text-[13px] font-medium text-[var(--tpf-text-2)]">Hakuna arifa kwa sasa</p>
                    <p className="mt-1 text-[11px] text-[var(--tpf-text-4)]">Arifa mpya zitaonekana hapa</p>
                  </div>
                </div>
                <div className="border-t border-[var(--tpf-border)] px-4 py-2.5">
                  <button onClick={() => { setAdminScreen("alerts"); setNotifOpen(false); }} className="text-[12.5px] font-semibold text-[var(--tpf-blue)] hover:text-[#1D4ED8] transition">
                    Nenda kurasa ya Arifa →
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
        {/* Pin key items for mobile: dashboard + first 3 mgmt/operational + more */}
        {(["SUPER_ADMIN","SYSTEM_ADMIN","ADMIN"].includes(authRole ?? "")
          ? navItems.filter(n => ["dashboard","mgmt-officers","mgmt-command","database"].includes(n.id))
          : navItems.filter(n => ["dashboard","incidents","patrols","missing"].includes(n.id))
        ).slice(0, 4).map((item) => {
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
  // Admin dashboard = system management only
  // Commanders have their own shells (/command/regional, /command/station etc.)
  // Anyone reaching /admin sees the system admin dashboard
  return <AdminDashboard />;
}

function renderAdminScreen(screen: AdminScreen) {
  switch (screen) {
    case "search":
      return <UniversalSearchScreen onBack={() => usePoliceStore.getState().setAdminScreen("dashboard")} />;
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
    case "command-requests":
      return <RequestsScreen />;
    case "approvals":
      return <ApprovalsScreen />;
    case "communications":
      return <AdminCommunications />;
    case "waliokamatwa":
      return <WaliokamatwaScreen />;
    case "missing":
      return <AdminMissing />;
    case "clerks":
      return <AdminClerks />;
    case "mgmt-command":
      return <MgmtCommand />;
    case "mgmt-officers":
      return <MgmtOfficers />;
    case "mgmt-clerks":
      return <AdminClerks />;
    case "mgmt-cid":
      return <MgmtCID />;
    case "mgmt-admins":
      return <MgmtAdmins />;
    case "mgmt-special":
      return <MgmtSpecial />;
    case "database":
      return <AdminDatabase />;
    case "activity-log":
      return <AdminActivityLog />;
    case "settings":
      return <AdminSettings />;
    default:
      return <AdminDashboard />;
  }
}
