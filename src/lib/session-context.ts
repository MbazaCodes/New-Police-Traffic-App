// Session context — bridges login identifier to Zustand store
// No mock data. Reads from Zustand officerProfile set at login.
"use client";
import { usePoliceStore } from "@/store/police-store";

export function saveLoginIdentifier(id: string) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("tpf-login-id", id);
  }
}

export function clearLoginIdentifier() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("tpf-login-id");
  }
}

export function getLoginIdentifier(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("tpf-login-id") ?? "";
}
