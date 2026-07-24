"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OfficerWebShell } from "@/components/police/officer-web-shell";
import { usePoliceStore } from "@/store/police-store";

export default function OfficerPage() {
  const isAuthenticated = usePoliceStore((s) => s.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    // If not authenticated, go to root (universal login page).
    // Never show <LoginScreen mode="officer"> here — that would trap
    // admins/clerks/commanders who navigate to this URL after logging out.
    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null; // wait for redirect
  return <OfficerWebShell />;
}
