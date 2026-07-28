// @ts-nocheck
"use client";
/**
 * CitizenShell — the dedicated shell for all /citizen/* routes.
 *
 * URL-DRIVEN: the active screen is derived from the URL pathname.
 * Layout: sticky header + scrollable main + fixed 5-tab bottom nav.
 * Includes CitizenPwaManager for install prompt & offline detection.
 * Mobile-first design with proper safe-area insets, touch-optimized
 * interactions, and app-like feel when running as PWA.
 */

import { useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, FileText, CreditCard, AlertTriangle,
  User, LogOut, Menu, X,
} from "lucide-react";
import { useCitizenStore } from "@/store/citizen-store";
import { CitizenDashboard }  from "./screens/citizen-dashboard";
import { CitizenReports }    from "./screens/citizen-reports";
import { CitizenPayments }   from "./screens/citizen-payments";
import { CitizenComplaints } from "./screens/citizen-complaints";
import { CitizenProfile }    from "./screens/citizen-profile";
import { CitizenPwaManager } from "./citizen-pwa-manager";

type CS = "dashboard" | "reports" | "payments" | "complaints" | "profile";

const NAV: { id: CS; label: string; labelSw: string; icon: typeof LayoutDashboard; href: string }[] = [
  { id: "dashboard",  label: "Dashboard",  labelSw: "Dashibodi",  icon: LayoutDashboard, href: "/citizen/dashboard" },
  { id: "reports",    label: "Applications", labelSw: "Maombi", icon: FileText,   href: "/citizen/reports" },
  { id: "payments",   label: "Payments",   labelSw: "Malipo",     icon: CreditCard,      href: "/citizen/payments" },
  { id: "complaints", label: "Complaints", labelSw: "Malalamiko", icon: AlertTriangle,   href: "/citizen/complaints" },
  { id: "profile",    label: "Profile",    labelSw: "Profaili",   icon: User,            href: "/citizen/profile" },
];

/** Derives the active screen from the URL pathname. */
function getScreenFromPath(pathname: string): CS {
  if (pathname.includes("/citizen/reports") || pathname.includes("/citizen/applications")) return "reports";
  if (pathname.includes("/citizen/payments"))    return "payments";
  if (pathname.includes("/citizen/complaints"))  return "complaints";
  if (pathname.includes("/citizen/profile"))     return "profile";
  return "dashboard";
}

export function CitizenShell() {
  const pathname = usePathname();
  const router = useRouter();
  const { citizen, logout } = useCitizenStore();
  const [menuOpen, setMenuOpen] = useState(false);

  // URL-driven screen selection
  const screen: CS = getScreenFromPath(pathname);

  const displayName =
    citizen?.name && citizen.name !== "Raia"
      ? citizen.name
      : citizen?.phone || citizen?.email || "Raia";
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const currentNav = NAV.find((n) => n.id === screen)!;

  const navigate = (href: string) => {
    router.push(href);
    setMenuOpen(false);
  };

  return (
    <div className="flex flex-col" style={{ height:"100dvh", background:"var(--tpf-surface)", paddingBottom:"env(safe-area-inset-bottom,0px)" }}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="tpf-header shrink-0">
        <div className="flex items-center gap-3">
          <Image
            src="/police-logo.png"
            alt="TPF"
            width={28}
            height={28}
            className="h-7 w-7 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-[12px] sm:text-[13px] font-black truncate" style={{ color: "var(--tpf-text)" }}>
              TPF Raia
            </p>
            <p className="text-[9px] sm:text-[10px]" style={{ color: "var(--tpf-text-4)" }}>
              {currentNav.labelSw}
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* Show user info on larger screens */}
          <div className="hidden text-right sm:block">
            <p className="text-[11px] sm:text-[12px] font-semibold truncate max-w-[120px]" style={{ color: "var(--tpf-text)" }}>
              {displayName}
            </p>
            <p className="text-[9px] sm:text-[10px] truncate max-w-[120px]" style={{ color: "var(--tpf-text-4)" }}>
              {citizen?.phone || citizen?.email || ""}
            </p>
          </div>
          {/* Avatar */}
          <div
            className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl text-[10px] sm:text-[11px] font-bold text-white"
            style={{ background: "linear-gradient(135deg, var(--tpf-citizen-accent), var(--tpf-citizen-accent-dark))" }}
          >
            {initials}
          </div>
          {/* Logout */}
          <button
            onClick={logout}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg transition hover:bg-red-50 active:scale-90 touch-manipulation"
            style={{ color: "var(--tpf-text-4)" }}
            title="Toka (Logout)"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* ── Screen content ──────────────────────────────────────────────────── */}
      <main className="app-scroll flex-1 overflow-y-auto" style={{ paddingBottom:"calc(80px + env(safe-area-inset-bottom,0px))" }}>
        {screen === "dashboard"  && <CitizenDashboard  citizen={citizen} setScreen={(s: CS) => navigate(`/citizen/${s}`)} />}
        {screen === "reports"    && <CitizenReports    citizen={citizen} />}
        {screen === "payments"   && <CitizenPayments   citizen={citizen} />}
        {screen === "complaints" && <CitizenComplaints citizen={citizen} />}
        {screen === "profile"    && <CitizenProfile    citizen={citizen} />}
      </main>

      {/* ── Bottom nav — Mobile-optimized, touch-friendly, safe-area ── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex items-stretch"
        style={{
          height: "calc(64px + env(safe-area-inset-bottom,0px))",
          paddingBottom: "env(safe-area-inset-bottom,0px)",
          background: "var(--tpf-card)",
          borderTop: "1px solid var(--tpf-border)",
        }}
      >
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = screen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.href)}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 transition active:scale-[0.92] touch-manipulation"
              style={{ color: active ? "var(--tpf-citizen-accent)" : "var(--tpf-text-4)" }}
            >
              <div
                className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl transition"
                style={active ? { background: "color-mix(in srgb, var(--tpf-citizen-accent) 12%, transparent)" } : {}}
              >
                <Icon size={18} />
                {active && (
                  <span
                    className="absolute -top-0.5 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full"
                    style={{ background: "var(--tpf-citizen-accent)" }}
                  />
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold leading-none">{item.labelSw}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Mobile menu overlay (currently unused) ──────────────────── */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}
