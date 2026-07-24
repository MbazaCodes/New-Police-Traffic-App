"use client";
import { useEffect, useState } from "react";
import { OfficerWebShell } from "@/components/police/officer-web-shell";
import { usePoliceStore } from "@/store/police-store";

export default function OfficerPage() {
  const isAuthenticated = usePoliceStore((s) => s.isAuthenticated);
  const login           = usePoliceStore((s) => s.login);
  const loginAsRole     = usePoliceStore((s) => s.loginAsRole);
  const [checking, setChecking] = useState(!isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) { setChecking(false); return; }

    // Zustand is in-memory — on page reload isAuthenticated is false even
    // though the NextAuth cookie is still valid. Ping /api/auth/session to
    // restore the session without forcing the user to log in again.
    fetch("/api/auth/session")
      .then(r => r.json())
      .then(data => {
        if (data?.user?.role) {
          // Session is alive — restore Zustand auth state
          loginAsRole(data.user.role as Parameters<typeof loginAsRole>[0]);
        } else {
          // No session — send to universal gateway (not officer-only login)
          window.location.href = "/";
        }
      })
      .catch(() => { window.location.href = "/"; })
      .finally(() => setChecking(false));
  }, [isAuthenticated, login, loginAsRole]);

  if (checking) return (
    <div className="flex min-h-screen items-center justify-center bg-[#060d1f]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2196F3] border-t-transparent" />
    </div>
  );

  if (!isAuthenticated) return null;
  return <OfficerWebShell />;
}
