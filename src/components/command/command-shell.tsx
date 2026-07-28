"use client";

/**
 * CommandShell — the dedicated shell for all /command/* routes.
 *
 * This is the command-center equivalent of AdminShell. It renders the
 * commander sidebar (tier-aware nav), top bar, and the active screen —
 * WITHOUT redirecting to /admin or reusing AdminShell.
 *
 * Key behaviours:
 *  • Reads the URL pathname to determine the active tier + screen (URL-driven).
 *  • Uses `getCommanderNavForRole(authRole)` to show only the screens the
 *    current commander tier is allowed to see.
 *  • Includes the session-restore pattern (fetches /api/auth/session on mount
 *    if Zustand isn't hydrated) so a hard reload of /command/<tier>/<page>
 *    doesn't bounce the user to the login screen.
 *  • Reuses the existing admin screen components (AdminOfficers,
 *    AdminIncidents, CommissionerDashboard, …) so there is zero functional
 *    regression — only the shell wrapper changes.
 *  • Handles the `/logout` page segment by calling `logout()` on mount.
 */

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  Search,
  Menu,
  X,
  Moon,
  Sun,
  ChevronDown,
  Bell,
} from "lucide-react";
import { useTheme } from "next-themes";
import { usePoliceStore } from "@/store/police-store";

// Commander screen components (reused from admin screens — zero duplication)
import { CommissionerDashboard } from "@/components/admin/screens/commissioner-dashboard";
import { AdminOfficers } from "@/components/admin/screens/admin-officers";
import { AdminIncidents } from "@/components/admin/screens/admin-incidents";
import { AdminCitations } from "@/components/admin/screens/admin-citations";
import { AdminPatrols } from "@/components/admin/screens/admin-patrols";
import { AdminAlerts } from "@/components/admin/screens/admin-alerts";
import { AdminReports } from "@/components/admin/screens/admin-reports";
import { AdminSettings } from "@/components/admin/screens/admin-settings";
import { AdminStations } from "@/components/admin/screens/admin-stations";
import { AdminPosts } from "@/components/admin/screens/admin-posts";
import { AdminAssignments } from "@/components/admin/screens/admin-assignments";
import { DetainedCitizensScreen } from "@/components/admin/screens/detained-citizens-screen";
import { WaliokamatwaScreen } from "@/components/admin/screens/waliokamatwa-screen";
import { AdminMissing } from "@/components/admin/screens/admin-missing";

import {
  getCommanderNavForRole,
  getScreenFromPathname,
  getTierFromPathname,
  getTierBasePath,
  type CommandScreen,
} from "@/lib/commander-nav";

/* ── Screen renderer ────────────────────────────────────────────────────── */

function renderCommandScreen(screen: CommandScreen) {
  switch (screen) {
    case "dashboard":
      return <CommissionerDashboard />;
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
    case "detained-citizens":
      return <DetainedCitizensScreen />;
    case "waliokamatwa":
      return <WaliokamatwaScreen />;
    case "missing":
      return <AdminMissing />;
    case "reports":
      return <AdminReports />;
    case "stations":
      return <AdminStations />;
    case "posts":
      return <AdminPosts />;
    case "assignments":
      return <AdminAssignments />;
    case "settings":
      return <AdminSettings />;
    default:
      return <CommissionerDashboard />;
  }
}

/* ── Main shell ─────────────────────────────────────────────────────────── */

export function CommandShell() {
  const pathname = usePathname();
  const router = useRouter();

  const {
    isAuthenticated,
    loginAsRole,
    authRole,
    officerProfile,
    logout,
  } = usePoliceStore();

  const [checking, setChecking] = useState(!isAuthenticated);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  /* ── Session restore ─────────────────────────────────────────────────── */
  // Zustand persists to localStorage, but on a hard reload the NextAuth cookie
  // may be valid while isAuthenticated is still false. Ping /api/auth/session
  // to rehydrate the store without forcing a re-login.
  useEffect(() => {
    if (isAuthenticated) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.user?.role) {
          loginAsRole(
            data.user.role as Parameters<typeof loginAsRole>[0],
          );
        } else {
          window.location.href = "/?reason=session_expired";
        }
      })
      .catch(() => {
        if (!cancelled) window.location.href = "/";
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, loginAsRole]);

  /* ── Handle /logout route ────────────────────────────────────────────── */
  // When the user navigates to /command/<tier>/logout, immediately call
  // logout() which clears the session and redirects to "/".
  useEffect(() => {
    if (pathname.endsWith("/logout")) {
      logout();
    }
  }, [pathname, logout]);

  /* ── Loading state ───────────────────────────────────────────────────── */
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060d1f]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2196F3] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  /* ── Derive tier + screen from URL ───────────────────────────────────── */
  const tier = getTierFromPathname(pathname);
  const basePath = getTierBasePath(tier);
  const currentScreen = getScreenFromPathname(pathname);
  const navItems = getCommanderNavForRole(authRole);

  /* ── Profile display ─────────────────────────────────────────────────── */
  const displayName = officerProfile?.name ?? "Kamanda";
  const displayRank = officerProfile?.rank ?? "";
  const displayRole = authRole?.replace(/_/g, " ") ?? "Commander";
  const displayStation = officerProfile?.station ?? "";
  const displayPhoto = officerProfile?.photo ?? "";
  const displayInitials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("");

  const navigateTo = (screen: CommandScreen) => {
    router.push(`${basePath}/${screen}`);
    setSidebarOpen(false);
  };

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "var(--tpf-surface)" }}
    >
      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex-shrink-0 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } tpf-sidebar`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#2563EB] ring-2 ring-[#2563EB]/30">
              <Image
                src="/police-logo.png"
                alt="TPF"
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold leading-tight text-white">
                Command Center
              </p>
              <p className="mt-0.5 truncate text-[10px] leading-tight text-white/45">
                {displayRole}
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/10 hover:text-white lg:hidden"
            >
              <X size={16} />
            </button>
          </div>

          {/* Nav */}
          <nav className="app-scroll flex-1 space-y-0.5 overflow-y-auto px-2.5 py-3">
            {navItems.map((item, idx) => {
              const active = currentScreen === item.id;
              const Icon = item.icon;
              // Show a group header when the group changes between consecutive items.
              const prevGroup =
                idx > 0 ? navItems[idx - 1].group ?? "" : "";
              const showGroupHeader =
                item.group !== undefined &&
                item.group !== "" &&
                item.group !== prevGroup;
              return (
                <div key={item.id}>
                  {showGroupHeader && (
                    <p className="px-3 pb-1 pt-3 text-[9px] font-bold uppercase tracking-widest text-police-faint">
                      {item.group}
                    </p>
                  )}
                  <button
                    onClick={() => navigateTo(item.id)}
                    className={`tpf-nav-item ${active ? "active" : ""}`}
                  >
                    <Icon size={16} className="tpf-nav-icon shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                  </button>
                </div>
              );
            })}
          </nav>

          {/* User panel */}
          <div className="border-t border-white/8 p-2.5">
            <div className="group flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/5 p-2.5 transition hover:bg-white/8">
              {displayPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayPhoto}
                  alt={displayName}
                  className="h-8 w-8 shrink-0 rounded-xl object-cover ring-2 ring-white/20"
                />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-[11px] font-bold text-white">
                  {displayInitials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold leading-tight text-white">
                  {displayName}
                </p>
                <p className="truncate text-[10px] leading-tight text-white/45">
                  {displayRank || displayStation || displayRole}
                </p>
              </div>
              <button
                onClick={logout}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/35 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100"
                title="Toka (Logout)"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="tpf-header">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-police lg:hidden"
          >
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
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--tpf-border)] bg-[var(--tpf-surface-2)] text-[var(--tpf-text-3)] transition hover:bg-[var(--tpf-border)] hover:text-[var(--tpf-text)]"
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className={`relative flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                  notifOpen
                    ? "border-[var(--tpf-blue)] bg-[var(--tpf-blue-pale)] text-[var(--tpf-blue)]"
                    : "border-[var(--tpf-border)] bg-[var(--tpf-surface-2)] text-[var(--tpf-text-3)] hover:bg-[var(--tpf-border)]"
                }`}
              >
                <Bell size={16} />
              </button>

              {notifOpen && (
                <div className="tpf-popover w-80">
                  <div className="flex items-center justify-between border-b border-[var(--tpf-border)] px-4 py-3">
                    <span className="text-[14px] font-bold text-[var(--tpf-text)]">
                      Arifa
                    </span>
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--tpf-text-4)] transition hover:bg-[var(--tpf-surface-2)] hover:text-[var(--tpf-text)]"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="max-h-72 divide-y divide-police-soft overflow-y-auto">
                    <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                      <Bell
                        size={32}
                        className="mb-3 text-[var(--tpf-text-4)]"
                      />
                      <p className="text-[13px] font-medium text-[var(--tpf-text-2)]">
                        Hakuna arifa kwa sasa
                      </p>
                      <p className="mt-1 text-[11px] text-[var(--tpf-text-4)]">
                        Arifa mpya zitaonekana hapa
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-[var(--tpf-border)] px-4 py-2.5">
                    <button
                      onClick={() => {
                        navigateTo("alerts");
                        setNotifOpen(false);
                      }}
                      className="text-[12.5px] font-semibold text-[var(--tpf-blue)] transition hover:text-[#1D4ED8]"
                    >
                      Nenda kurasa ya Arifa →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User chip */}
            <div className="flex cursor-default items-center gap-2 rounded-xl border border-[var(--tpf-border)] bg-[var(--tpf-surface-2)] px-2.5 py-1.5 transition hover:bg-[var(--tpf-border)]">
              {displayPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayPhoto}
                  alt={displayName}
                  className="h-7 w-7 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-[10px] font-bold text-white">
                  {displayInitials}
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-[12px] font-semibold leading-tight text-[var(--tpf-text)]">
                  {displayName}
                </p>
                <p className="text-[10px] leading-tight text-[var(--tpf-text-4)]">
                  {displayRank || displayRole}
                </p>
              </div>
              <ChevronDown size={13} className="text-[var(--tpf-text-4)]" />
            </div>
          </div>
        </header>

        {/* Screen content */}
        <main
          key={currentScreen}
          className="police-screen-enter flex-1 overflow-y-auto p-4 pb-20 sm:p-5 sm:pb-5 lg:p-6"
        >
          {renderCommandScreen(currentScreen)}
        </main>
      </div>

      {/* ── Mobile bottom nav ─────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-[var(--tpf-border)] bg-[var(--tpf-card)] lg:hidden">
        {navItems
          .filter((n) =>
            ["dashboard", "incidents", "patrols", "missing"].includes(n.id),
          )
          .slice(0, 4)
          .map((item) => {
            const active = currentScreen === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition"
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${active ? "bg-[#2563EB]/12" : ""}`}
                >
                  <Icon
                    size={18}
                    className={active ? "text-[#2563EB]" : "text-[var(--tpf-text-4)]"}
                  />
                </div>
                <span
                  className={`text-[9px] font-semibold leading-none ${active ? "text-[#2563EB]" : "text-[var(--tpf-text-4)]"}`}
                >
                  {item.label.slice(0, 8)}
                </span>
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
          <span className="text-[9px] font-semibold leading-none text-[var(--tpf-text-4)]">
            Zaidi
          </span>
        </button>
      </nav>
    </div>
  );
}
