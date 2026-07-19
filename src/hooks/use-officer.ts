// ============================================================
// useOfficer — single source of truth for logged-in officer
// Resolves from ROLE_USERS via loginIdentifier (store or sessionStorage)
// Replaces all hardcoded OFFICER constants across PWA screens
// ============================================================
"use client";

import { useMemo } from "react";
import { usePoliceStore } from "@/store/police-store";
export function useOfficer() {
  const { loginIdentifier, userRole, isAuthenticated } = usePoliceStore();

  return useMemo(() => {
    if (!isAuthenticated) return DEFAULT_OFFICER;

    // 1. Try Zustand store identifier
    // 2. Try sessionStorage (survives hot reload)
    const stored = loginIdentifier ||
      (typeof window !== "undefined" ? sessionStorage.getItem("tpf-login-id") ?? "" : "");

    if (stored) {
      const q = stored.trim().toLowerCase().replace(/\s/g, "");
      const found = ROLE_USERS.find((u) =>
        u.username.toLowerCase() === q ||
        u.mobile.replace(/\s/g, "") === q ||
        u.email.toLowerCase() === q ||
        u.badgeNo.toLowerCase() === q
      );
      if (found) return mapUser(found);
    }

    // 3. Fallback: first user matching current role
    const roleMap: Record<string, string[]> = {
      "officer-traffic": ["officer-traffic", "post-officer"],
      "officer-general": ["officer-general"],
      "admin":           ["admin"],
      "commander":       ["national-commissioner","regional-commissioner","district-commissioner","station-commissioner"],
    };
    const matchRoles = roleMap[userRole] ?? [];
    const fallback = ROLE_USERS.find((u) => matchRoles.includes(u.role));
    return fallback ? mapUser(fallback) : DEFAULT_OFFICER;

  }, [loginIdentifier, userRole, isAuthenticated]);
}

function mapUser(u: typeof ROLE_USERS[0]) {
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
    photo:     u.photo,
    region:    u.region,
    status:    u.status === "active" ? "Mtaandao" : u.status === "patrol" ? "Doria" : u.status === "break" ? "Mapumziko" : "Nje ya Kazi",
  };
}

const DEFAULT_OFFICER = {
  name:      "Cprl. Juma Khamis Mwinyi",
  shortName: "Cprl. Juma",
  rank:      "Corporal",
  rankShort: "Cprl.",
  id:        "TP123456",
  station:   "Kituo Kikuu cha Polisi DSM",
  unit:      "Trafiki - Ilala Zone",
  phone:     "0712 345 678",
  email:     "juma.mwinyi@polisi.go.tz",
  photo:     "",
  region:    "Dar es Salaam",
  status:    "Mtaandao",
};
