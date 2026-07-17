"use client";

import { LoginScreen } from "@/components/police/screens/login-screen";
import { StatusBar } from "@/components/police/status-bar";

export default function Home() {
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