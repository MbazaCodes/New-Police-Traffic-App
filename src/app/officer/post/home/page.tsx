"use client";
import { OfficerWebShell } from "@/components/police/officer-web-shell";
import { usePoliceStore } from "@/store/police-store";
import { LoginScreen } from "@/components/police/screens/login-screen";

export default function OfficerPage() {
  const isAuthenticated = usePoliceStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <LoginScreen mode="officer" />;
  return <OfficerWebShell />;
}
