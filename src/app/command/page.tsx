"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { usePoliceStore } from "@/store/police-store";

export default function CommandPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    usePoliceStore.setState({
      isAuthenticated: true,
      userRole: "commander",
      adminScreen: "dashboard",
      currentScreen: "home",
      activeTab: "home",
      history: ["home"],
    });
    setReady(true);
  }, []);

  if (!ready) return null;

  return <AdminShell />;
}
