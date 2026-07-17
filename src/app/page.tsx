"use client";

import { usePoliceStore, AUTH_ROLES, type AuthRole } from "@/store/police-store";
import { Shield, ArrowRight, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useState } from "react";

// Lazy load shells to reduce initial compilation
import dynamic from "next/dynamic";

const MobileShell = dynamic(
  () => import("@/components/police/mobile-shell").then((m) => m.MobileShell),
  { ssr: false, loading: () => <LoadingScreen /> }
);

const AdminShell = dynamic(
  () => import("@/components/admin/admin-shell").then((m) => m.AdminShell),
  { ssr: false, loading: () => <LoadingScreen /> }
);

const CidShell = dynamic(
  () => import("@/components/role/cid-shell").then((m) => m.CidShell),
  { ssr: false, loading: () => <LoadingScreen /> }
);

const ClerkShell = dynamic(
  () => import("@/components/role/clerk-shell").then((m) => m.ClerkShell),
  { ssr: false, loading: () => <LoadingScreen /> }
);

const ViewerShell = dynamic(
  () => import("@/components/role/viewer-shell").then((m) => m.ViewerShell),
  { ssr: false, loading: () => <LoadingScreen /> }
);

const SystemShell = dynamic(
  () => import("@/components/role/system-shell").then((m) => m.SystemShell),
  { ssr: false, loading: () => <LoadingScreen /> }
);

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

const ROLE_ICONS: Record<string, string> = {
  SUPER_ADMIN: "🛡️", SYSTEM_ADMIN: "🖥️",
  NATIONAL_COMMANDER: "🏛️", REGIONAL_COMMANDER: "📍",
  DISTRICT_COMMANDER: "🏢", STATION_COMMANDER: "🏠",
  TRAFFIC_OFFICER: "🚗", GENERAL_OFFICER: "👤",
  INVESTIGATOR: "🔍", CLERK: "📁", VIEWER: "👁️",
};

function RoleSelectionScreen() {
  const loginAsRole = usePoliceStore((s) => s.loginAsRole);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  function handleLogin(role: typeof AUTH_ROLES[number]) {
    loginAsRole(role.id);
    toast.success(`Karibu, ${role.labelSw}!`);
  }

  const sections = [
    { title: "Administration", titleSw: "Utawala", roles: AUTH_ROLES.filter(r => ["SUPER_ADMIN", "SYSTEM_ADMIN"].includes(r.id)) },
    { title: "Command", titleSw: "Amri", roles: AUTH_ROLES.filter(r => r.id.includes("COMMANDER")) },
    { title: "Officers", titleSw: "Maofisa", roles: AUTH_ROLES.filter(r => r.id.includes("OFFICER")) },
    { title: "Support", titleSw: "Msaada", roles: AUTH_ROLES.filter(r => ["INVESTIGATOR", "CLERK", "VIEWER"].includes(r.id)) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/25">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">TZ Police Digital Platform</h1>
              <p className="text-xs text-white/50">Jeshi la Polisi Tanzania — Usalama Wetu, Jukumu Letu</p>
            </div>
          </div>
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Chagua Jukumu Lako</h2>
          <p className="mt-1 text-sm text-white/50">Select your role to access the platform</p>
        </div>

        {sections.map((section) => (
          <section key={section.title} className="mb-8">
            <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-white/40">
              {section.title} — {section.titleSw}
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {section.roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleLogin(role)}
                  className="group rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:border-white/20 hover:bg-white/10 hover:shadow-xl hover:-translate-y-0.5"
                >
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${ROLE_GRADIENTS[role.id]} shadow-lg text-lg transition-transform group-hover:scale-110`}>
                    {ROLE_ICONS[role.id]}
                  </div>
                  <p className="text-sm font-bold text-white">{role.label}</p>
                  <p className="text-xs text-white/40">{role.labelSw}</p>
                  <p className="mt-1 text-xs text-white/30 line-clamp-2">{role.description}</p>
                  <ArrowRight size={14} className="mt-2 text-white/20 transition-all group-hover:translate-x-1 group-hover:text-white/60" />
                </button>
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="mt-auto border-t border-white/5 bg-black/10 py-4 text-center">
        <p className="text-xs text-white/30">Tanzania Police Force — Digital Platform v2.0</p>
      </footer>
    </div>
  );
}

function ShellDispatcher() {
  const { authRole, userRole } = usePoliceStore();

  if (!authRole) {
    if (userRole === "officer-traffic" || userRole === "officer-general") {
      return <MobileShell />;
    }
    return <AdminShell />;
  }

  const roleConfig = AUTH_ROLES.find(r => r.id === authRole);
  const shellType = roleConfig?.shellType ?? "admin";

  switch (shellType) {
    case "mobile": return <MobileShell />;
    case "cid": return <CidShell />;
    case "clerk": return <ClerkShell />;
    case "viewer": return <ViewerShell />;
    case "system": return <SystemShell />;
    default: return <AdminShell />;
  }
}

export default function Home() {
  const isAuthenticated = usePoliceStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <RoleSelectionScreen />;
  }

  return <ShellDispatcher />;
}