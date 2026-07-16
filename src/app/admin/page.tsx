"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { usePoliceStore } from "@/store/police-store";

export default function AdminPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    usePoliceStore.setState({
      isAuthenticated: true,
      userRole: "admin",
      adminScreen: "users",
      currentScreen: "home",
      activeTab: "home",
      history: ["home"],
    });
    setReady(true);
  }, []);

  if (!ready) return null;

  return <AdminShell />;
}
