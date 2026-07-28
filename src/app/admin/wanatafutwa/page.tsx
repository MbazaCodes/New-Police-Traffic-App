"use client";
import { useEffect } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { usePoliceStore } from "@/store/police-store";
export default function Page() {
  const { setAdminScreen } = usePoliceStore();
  useEffect(() => { setAdminScreen("missing"); }, []);
  return <AdminShell />;
}
