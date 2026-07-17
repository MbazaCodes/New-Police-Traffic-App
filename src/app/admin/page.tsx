"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { LoginScreen } from "@/components/police/screens/login-screen";
import { StatusBar } from "@/components/police/status-bar";
import { usePoliceStore } from "@/store/police-store";

const IS_WEB = process.env.NEXT_PUBLIC_APP_MODE === "admin";

export default function AdminPage() {
  const { isAuthenticated, userRole } = usePoliceStore();
  const [isWebMode, setIsWebMode] = useState(IS_WEB);

  useEffect(() => {
    const hostname = window.location.hostname.toLowerCase();
    if (hostname.includes("admin-web")) {
      setIsWebMode(true);
    }
  }, []);

  if (!isWebMode) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d1b3d] p-8 text-center">
        <div className="text-5xl">🚫</div>
        <h1 className="mt-4 text-[20px] font-bold text-white">Ukurasa Huu Haupatikani</h1>
        <p className="mt-2 text-[13px] text-white/60">
          Tafadhali tumia Dashibodi ya Utawala inayotolewa na mkurugenzi wako.
        </p>
      </div>
    );
  }

  if (!isAuthenticated || (userRole !== "admin" && userRole !== "commander")) {
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

  return <AdminShell />;
}
