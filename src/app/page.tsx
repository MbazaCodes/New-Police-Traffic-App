"use client";

import { usePoliceStore, AUTH_ROLES, type AuthRole } from "@/store/police-store";
import { Shield, ArrowRight, Sun, Moon, Clock, Wifi, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useState, useEffect, useCallback, type ComponentType } from "react";

// ---------------------------------------------------------------------------
// Role metadata
// ---------------------------------------------------------------------------

const ROLE_GRADIENTS: Record<string, string> = {
  SUPER_ADMIN: "from-red-500 to-red-700",
  SYSTEM_ADMIN: "from-emerald-500 to-emerald-700",
  NATIONAL_COMMANDER: "from-amber-500 to-amber-700",
  REGIONAL_COMMANDER: "from-orange-500 to-orange-700",
  DISTRICT_COMMANDER: "from-yellow-500 to-yellow-700",
  STATION_COMMANDER: "from-lime-600 to-lime-800",
  TRAFFIC_OFFICER: "from-blue-500 to-blue-700",
  GENERAL_OFFICER: "from-cyan-500 to-cyan-700",
  INVESTIGATOR: "from-purple-500 to-purple-700",
  CLERK: "from-teal-500 to-teal-700",
  VIEWER: "from-slate-500 to-slate-700",
};

const ROLE_GLOW: Record<string, string> = {
  SUPER_ADMIN: "hover:shadow-red-500/20",
  SYSTEM_ADMIN: "hover:shadow-emerald-500/20",
  NATIONAL_COMMANDER: "hover:shadow-amber-500/20",
  REGIONAL_COMMANDER: "hover:shadow-orange-500/20",
  DISTRICT_COMMANDER: "hover:shadow-yellow-500/20",
  STATION_COMMANDER: "hover:shadow-lime-500/20",
  TRAFFIC_OFFICER: "hover:shadow-blue-500/20",
  GENERAL_OFFICER: "hover:shadow-cyan-500/20",
  INVESTIGATOR: "hover:shadow-purple-500/20",
  CLERK: "hover:shadow-teal-500/20",
  VIEWER: "hover:shadow-slate-500/20",
};

const ROLE_ACCESS: Record<string, { level: number; label: string }> = {
  SUPER_ADMIN: { level: 10, label: "Full Access" },
  SYSTEM_ADMIN: { level: 9, label: "System" },
  NATIONAL_COMMANDER: { level: 8, label: "National" },
  REGIONAL_COMMANDER: { level: 7, label: "Regional" },
  DISTRICT_COMMANDER: { level: 6, label: "District" },
  STATION_COMMANDER: { level: 5, label: "Station" },
  TRAFFIC_OFFICER: { level: 3, label: "Field" },
  GENERAL_OFFICER: { level: 3, label: "Field" },
  INVESTIGATOR: { level: 4, label: "CID" },
  CLERK: { level: 2, label: "Records" },
  VIEWER: { level: 1, label: "Read Only" },
};

const ROLE_ICONS: Record<string, string> = {
  SUPER_ADMIN: "🛡️", SYSTEM_ADMIN: "🖥️",
  NATIONAL_COMMANDER: "🏛️", REGIONAL_COMMANDER: "📍",
  DISTRICT_COMMANDER: "🏢", STATION_COMMANDER: "🏠",
  TRAFFIC_OFFICER: "🚗", GENERAL_OFFICER: "👤",
  INVESTIGATOR: "🔍", CLERK: "📁", VIEWER: "👁️",
};

// ---------------------------------------------------------------------------
// Recently-used helper
// ---------------------------------------------------------------------------

function getRecentRoles(): AuthRole[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("tz-police-recent-roles");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveRecentRole(roleId: AuthRole) {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentRoles().filter((r) => r !== roleId);
    localStorage.setItem("tz-police-recent-roles", JSON.stringify([roleId, ...existing].slice(0, 3)));
  } catch { /* ignore */ }
}

// ---------------------------------------------------------------------------
// Inline keyframe animations
// ---------------------------------------------------------------------------

function Animations() {
  return (
    <style>{`
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes pulseSlow {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      .anim-fade-up {
        animation: fadeInUp 0.5s ease-out both;
      }
      .anim-fade {
        animation: fadeIn 0.4s ease-out both;
      }
      .anim-pulse-slow {
        animation: pulseSlow 3s ease-in-out infinite;
      }
      .shimmer-border {
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
        background-size: 200% 100%;
        animation: shimmer 4s linear infinite;
      }
    `}</style>
  );
}

// ---------------------------------------------------------------------------
// Loading Screen
// ---------------------------------------------------------------------------

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d1b3d]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-blue-500" />
        <p className="text-sm text-white/60">Inapakia...</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Role Card
// ---------------------------------------------------------------------------

function RoleCard({
  role,
  index,
  onClick,
}: {
  role: typeof AUTH_ROLES[number];
  index: number;
  onClick: () => void;
}) {
  const access = ROLE_ACCESS[role.id];
  const gradient = ROLE_GRADIENTS[role.id];
  const glow = ROLE_GLOW[role.id];
  const icon = ROLE_ICONS[role.id];

  return (
    <button
      onClick={onClick}
      className={`anim-fade-up group relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 text-left backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.16] hover:bg-white/[0.08] hover:shadow-2xl ${glow}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${gradient} opacity-60 transition-opacity group-hover:opacity-100`} />

      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-lg shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:shadow-xl`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white">{role.label}</p>
            <ArrowRight size={14} className="text-white/15 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white/50" />
          </div>
          <p className="text-xs text-white/35">{role.labelSw}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-white/25 line-clamp-2">{role.description}</p>
        </div>
      </div>

      {/* Access level pill */}
      <div className="mt-3 flex items-center gap-2 border-t border-white/[0.06] pt-2.5">
        <span className={`inline-flex items-center rounded-md bg-gradient-to-r ${gradient} px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm`}>
          L{access.level}
        </span>
        <span className="text-[10px] text-white/25">{access.label}</span>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Recently Used Section
// ---------------------------------------------------------------------------

function RecentRolesSection({ onSelect }: { onSelect: (roleId: AuthRole) => void }) {
  const [recent, setRecent] = useState<AuthRole[]>([]);

  useEffect(() => { setRecent(getRecentRoles()); }, []);

  if (recent.length === 0) return null;

  return (
    <section className="mb-8 anim-fade">
      <div className="mb-3 flex items-center gap-2 px-1">
        <Clock size={13} className="text-white/30" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/30">
          Hivi Karibuni — Recently Used
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {recent.map((roleId, i) => {
          const role = AUTH_ROLES.find((r) => r.id === roleId);
          if (!role) return null;
          const gradient = ROLE_GRADIENTS[roleId];
          return (
            <button
              key={roleId}
              onClick={() => onSelect(roleId)}
              className="anim-fade-up flex items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-white/[0.08] hover:shadow-lg"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br ${gradient} text-sm shadow`}>
                {ROLE_ICONS[roleId]}
              </span>
              <div className="text-left">
                <p className="text-[13px] font-semibold text-white">{role.label}</p>
                <p className="text-[10px] text-white/30">{role.labelSw}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Role Selection Screen
// ---------------------------------------------------------------------------

function RoleSelectionScreen() {
  const loginAsRole = usePoliceStore((s) => s.loginAsRole);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleLogin = useCallback((role: typeof AUTH_ROLES[number]) => {
    loginAsRole(role.id);
    saveRecentRole(role.id);
    toast.success(`Karibu, ${role.labelSw}!`, { description: role.label });
  }, [loginAsRole]);

  const handleRecentSelect = useCallback((roleId: AuthRole) => {
    const role = AUTH_ROLES.find((r) => r.id === roleId);
    if (role) handleLogin(role);
  }, [handleLogin]);

  const sections = [
    { title: "Administration", titleSw: "Utawala", roles: AUTH_ROLES.filter(r => ["SUPER_ADMIN", "SYSTEM_ADMIN"].includes(r.id)) },
    { title: "Command", titleSw: "Amri", roles: AUTH_ROLES.filter(r => r.id.includes("COMMANDER")) },
    { title: "Officers", titleSw: "Maofisa", roles: AUTH_ROLES.filter(r => r.id.includes("OFFICER")) },
    { title: "Support", titleSw: "Msaada", roles: AUTH_ROLES.filter(r => ["INVESTIGATOR", "CLERK", "VIEWER"].includes(r.id)) },
  ];

  let cardIndex = 0;

  return (
    <>
      <Animations />
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900 text-white">
        {/* Header */}
        <header className="relative border-b border-white/[0.06] bg-black/30 backdrop-blur-xl">
          {/* Shimmer line */}
          <div className="absolute inset-x-0 top-0 h-px shimmer-border" />
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20">
                <Shield className="h-6 w-6 text-white" />
                <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-400 anim-pulse-slow" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight sm:text-lg">TZ Police Digital Platform</h1>
                <p className="text-[11px] text-white/40 sm:text-xs">Jeshi la Polisi Tanzania — Usalama Wetu, Jukumu Letu</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 sm:flex">
                <Wifi size={12} className="text-emerald-400" />
                <span className="text-[11px] text-white/40">System Online</span>
              </div>
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-white/50 transition-all hover:bg-white/[0.08] hover:text-white"
              >
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          {/* Hero area */}
          <div className={`mb-10 text-center transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[11px] text-white/40">
              <Zap size={11} className="text-amber-400" />
              <span>Tanzania Police Force — Digital Operations Center</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
              Chagua Jukumu Lako
            </h2>
            <p className="mt-2 text-sm text-white/35">
              Select your role to access the platform
            </p>
          </div>

          {/* Recently Used */}
          <RecentRolesSection onSelect={handleRecentSelect} />

          {/* Role sections */}
          {sections.map((section, si) => (
            <section key={section.title} className="mb-8">
              <div className="mb-3 flex items-center gap-2 px-1">
                <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30">
                  {section.title} — {section.titleSw}
                </h3>
                <span className="text-[10px] text-white/15">({section.roles.length})</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {section.roles.map((role) => {
                  const idx = cardIndex++;
                  return (
                    <RoleCard
                      key={role.id}
                      role={role}
                      index={si * 4 + idx}
                      onClick={() => handleLogin(role)}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-white/[0.05] bg-black/20 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-4 sm:flex-row sm:justify-between sm:px-6">
            <div className="flex items-center gap-3 text-[11px] text-white/20">
              <span>Tanzania Police Force</span>
              <span className="text-white/10">|</span>
              <span>Digital Platform v2.0</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-white/15">
              <span className="rounded border border-white/[0.06] px-1.5 py-0.5 font-mono text-[10px]">PROD</span>
              <span>&copy; {new Date().getFullYear()} Jeshi la Polisi Tanzania</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Shell Dispatcher — uses runtime import() to avoid OOM during compilation
// Only the selected shell is compiled, not all 6
// ---------------------------------------------------------------------------

function ShellDispatcher() {
  const { authRole, userRole } = usePoliceStore();
  const [ShellComponent, setShellComponent] = useState<ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadShell() {
      let mod: Record<string, ComponentType>;
      const roleConfig = authRole ? AUTH_ROLES.find((r) => r.id === authRole) : null;
      const shellType = roleConfig?.shellType ?? (userRole === "officer-traffic" || userRole === "officer-general" ? "mobile" : "admin");

      try {
        switch (shellType) {
          case "mobile":
            mod = await import("@/components/police/mobile-shell");
            if (!cancelled) setShellComponent(() => mod.MobileShell);
            break;
          case "cid":
            mod = await import("@/components/role/cid-shell");
            if (!cancelled) setShellComponent(() => mod.CidShell);
            break;
          case "clerk":
            mod = await import("@/components/role/clerk-shell");
            if (!cancelled) setShellComponent(() => mod.ClerkShell);
            break;
          case "viewer":
            mod = await import("@/components/role/viewer-shell");
            if (!cancelled) setShellComponent(() => mod.ViewerShell);
            break;
          case "system":
            mod = await import("@/components/role/system-shell");
            if (!cancelled) setShellComponent(() => mod.SystemShell);
            break;
          default:
            mod = await import("@/components/admin/admin-shell");
            if (!cancelled) setShellComponent(() => mod.AdminShell);
            break;
        }
      } catch (err) {
        console.error("Failed to load shell:", err);
      }
    }

    loadShell();
    return () => { cancelled = true; };
  }, [authRole, userRole]);

  if (!ShellComponent) return <LoadingScreen />;
  return <ShellComponent />;
}

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------

export default function Home() {
  const isAuthenticated = usePoliceStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <RoleSelectionScreen />;
  }

  return <ShellDispatcher />;
}