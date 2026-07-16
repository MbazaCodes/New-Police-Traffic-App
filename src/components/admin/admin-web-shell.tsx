"use client";

import { usePoliceStore } from "@/store/police-store";
import { LoginScreen } from "../police/screens/login-screen";
import { AdminShell } from "./admin-shell";

export function AdminWebShell() {
  const { isAuthenticated, userRole } = usePoliceStore();

  // Not logged in -> show admin login (admin/commander roles only)
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-police p-4">
        <div className="w-full max-w-md">
          <LoginScreen mode="admin" />
        </div>
      </div>
    );
  }

  // If an officer role reaches the admin app, redirect to officer PWA
  if (userRole === "officer-traffic" || userRole === "officer-general") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-police p-6 text-center">
        <p className="text-[16px] font-bold text-police-navy">Officer Account</p>
        <p className="text-[13px] text-police-muted">
          Akaunti yako ni ya Afisa. Tafadhali tumia Officer PWA App.
        </p>
        <a
          href="/"
          className="rounded-xl bg-[#2196F3] px-6 py-3 text-[14px] font-bold text-white shadow-md"
        >
          Fungua Officer PWA
        </a>
      </div>
    );
  }

  // Admin / Commander -> render AdminShell
  return <AdminShell />;
}
