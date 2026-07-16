"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { LoginScreen } from "@/components/police/screens/login-screen";
import { StatusBar } from "@/components/police/status-bar";
import { usePoliceStore } from "@/store/police-store";

export default function CommandPage() {
  const { isAuthenticated, userRole } = usePoliceStore();

  if (!isAuthenticated || userRole !== "commander") {
    return (
      <div className="min-h-screen bg-police">
        <div className="flex h-full min-h-screen flex-col overflow-hidden">
          <StatusBar dark />
          <div className="flex-1 overflow-y-auto">
            <LoginScreen allowedRoles={["admin", "commander"]} showAdminRole />
          </div>
        </div>
      </div>
    );
  }

  return <AdminShell />;
}
