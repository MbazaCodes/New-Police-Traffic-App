"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { LoginScreen } from "@/components/police/screens/login-screen";
import { StatusBar } from "@/components/police/status-bar";
import { usePoliceStore } from "@/store/police-store";

export default function AdminPage() {
  const { isAuthenticated, userRole, authRole } = usePoliceStore();

  // Always show admin login on the admin web domain
  // userRole after loginAsRole is "admin" or "commander"
  const isAdminRole = userRole === "admin" || userRole === "commander";

  if (!isAuthenticated || !isAdminRole) {
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
