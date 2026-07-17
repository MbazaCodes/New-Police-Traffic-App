"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { LoginScreen } from "@/components/police/screens/login-screen";
import { StatusBar } from "@/components/police/status-bar";

const MobileShell = dynamic(
  () => import("@/components/police/mobile-shell").then((m) => m.MobileShell),
  { ssr: false }
);

// PWA deployment — officers ONLY. Admin/Command web is a separate Vercel project.
export default function Home() {
  const [isAdminHost, setIsAdminHost] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname.toLowerCase();
    if (hostname.includes("admin-web")) {
      setIsAdminHost(true);
    }
  }, []);

  if (isAdminHost) {
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

  return <MobileShell />;
}
