// ============================================================
// SESSION CONTEXT — Unified user resolution
// Bridges police-store login state → mock-engine ROLE_USERS
// Provides the "logged in as" context to ALL screens
// DO NOT CREATE NEW DATA — reads from ROLE_USERS only
// ============================================================
"use client";

import { usePoliceStore } from "@/store/police-store";
import { ROLE_USERS, type RoleUser } from "@/lib/mock-engine";
import type { UserRole } from "@/store/police-store";

// Map store UserRole strings → mock-engine role strings for lookup
const ROLE_BRIDGE: Record<UserRole, RoleUser["role"][]> = {
  "officer-traffic":  ["officer-traffic", "post-officer"],
  "officer-general":  ["officer-general"],
  "admin":            ["admin"],
  "commander":        ["national-commissioner", "regional-commissioner", "district-commissioner", "station-commissioner"],
};

// Returns the current logged-in user from ROLE_USERS based on store role + login identifier
export function useSessionUser(): RoleUser | null {
  const { isAuthenticated, userRole, searchQuery } = usePoliceStore();
  if (!isAuthenticated) return null;

  // Try to match by the last searched/entered identifier (login username/mobile)
  // stored transiently in searchQuery during login flow
  const loginId = typeof window !== "undefined" ? sessionStorage.getItem("tpf-login-id") : null;
  if (loginId) {
    const q = loginId.trim().toLowerCase().replace(/\s/g, "");
    const found = ROLE_USERS.find((u) =>
      u.username.toLowerCase() === q ||
      u.mobile.replace(/\s/g, "") === q ||
      u.email.toLowerCase() === q ||
      u.badgeNo.toLowerCase() === q
    );
    if (found) return found;
  }

  // Fallback: first user of the correct role
  const allowedRoles = ROLE_BRIDGE[userRole] ?? [userRole as RoleUser["role"]];
  return ROLE_USERS.find((u) => allowedRoles.includes(u.role)) ?? null;
}

// Save login identifier to session for user resolution
export function saveLoginIdentifier(identifier: string): void {
  if (typeof window === "undefined") return;
  try { sessionStorage.setItem("tpf-login-id", identifier); } catch {}
}

export function clearLoginIdentifier(): void {
  if (typeof window === "undefined") return;
  try { sessionStorage.removeItem("tpf-login-id"); } catch {}
}

// Compute the active officer object from session user or fall back to OFFICER constant
export function getActiveOfficer(user: RoleUser | null) {
  if (!user) {
    // Fall back to first traffic officer in mock-engine
    const fallback = ROLE_USERS.find((u) => u.role === "officer-traffic");
    return fallback ? mapRoleUserToOfficer(fallback) : DEFAULT_OFFICER;
  }
  return mapRoleUserToOfficer(user);
}

function mapRoleUserToOfficer(u: RoleUser) {
  return {
    name:      u.name,
    shortName: u.shortName,
    rank:      u.rank,
    rankShort: u.rankShort,
    id:        u.badgeNo,
    station:   u.station,
    unit:      u.unit,
    phone:     u.mobile,
    email:     u.email,
    status:    u.status === "active" ? "Mtaandao" : u.status === "patrol" ? "Doria" : "Mapumziko",
    photo:     u.photo,
    region:    u.region,
  };
}

const DEFAULT_OFFICER = {
  name: "Cprl. Juma Khamis Mwinyi", shortName: "Cprl. Juma",
  rank: "Corporal", rankShort: "Cprl.", id: "TP123456",
  station: "Kituo Kikuu cha Polisi DSM", unit: "Trafiki - Ilala Zone",
  phone: "0712 345 678", email: "juma.mwinyi@polisi.go.tz",
  status: "Mtaandao", photo: "", region: "Dar es Salaam",
};
