"use client";

/**
 * /command — Command Center entry point.
 *
 * This is a PUBLIC_LOGIN_ENTRY_PATH (see src/proxy.ts) so unauthenticated
 * users can reach it to see the login screen. Authenticated commanders are
 * redirected to their tier-specific dashboard:
 *   NATIONAL_COMMANDER  → /command/national/dashboard
 *   REGIONAL_COMMANDER  → /command/regional/dashboard
 *   DISTRICT_COMMANDER  → /command/district/dashboard
 *   STATION_COMMANDER   → /command/station/dashboard
 *
 * Previously this page rendered <AdminShell /> directly — that hybrid routing
 * is now fixed: commanders land on their dedicated CommandShell via redirect.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginScreen } from "@/components/police/screens/login-screen";
import { StatusBar } from "@/components/police/status-bar";
import { usePoliceStore } from "@/store/police-store";
import { resolveDashboardRoute } from "@/lib/dashboard-routes";
import { isCommanderRole } from "@/lib/commander-nav";
import type { AuthRole } from "@/store/police-store";

export default function CommandPage() {
  const router = useRouter();
  const { isAuthenticated, authRole, loginAsRole } = usePoliceStore();
  const [checking, setChecking] = useState(!isAuthenticated);

  // Session restore — if Zustand isn't hydrated, ping /api/auth/session.
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
          loginAsRole(data.user.role as AuthRole);
        } else {
          setChecking(false); // no session → show login
        }
      })
      .catch(() => {
        if (!cancelled) setChecking(false);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, loginAsRole]);

  // Redirect authenticated commanders to their tier dashboard.
  useEffect(() => {
    if (isAuthenticated && authRole && isCommanderRole(authRole)) {
      router.replace(resolveDashboardRoute(authRole));
    }
  }, [isAuthenticated, authRole, router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060d1f]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2196F3] border-t-transparent" />
      </div>
    );
  }

  // Authenticated commander — show spinner while redirecting
  if (isAuthenticated && authRole && isCommanderRole(authRole)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060d1f]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2196F3] border-t-transparent" />
      </div>
    );
  }

  // Not authenticated (or not a commander) — show login screen
  return (
    <div className="min-h-screen bg-police">
      <div className="flex h-full min-h-screen flex-col overflow-hidden">
        <StatusBar dark />
        <div className="flex-1 overflow-y-auto">
          <LoginScreen mode="admin" />
        </div>
      </div>
    </div>
  );
}
