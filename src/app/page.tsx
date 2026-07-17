"use client";

import { useEffect, useState, type ComponentType } from "react";
import { LoginScreen } from "@/components/police/screens/login-screen";
import { StatusBar } from "@/components/police/status-bar";
import { usePoliceStore, AUTH_ROLES } from "@/store/police-store";

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-police">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#2196F3]/20 border-t-[#2196F3]" />
        <p className="text-sm text-police-muted">Inapakia...</p>
      </div>
    </div>
  );
}

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

export default function Home() {
  const isAuthenticated = usePoliceStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
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

  return <ShellDispatcher />;
}