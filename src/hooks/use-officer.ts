// ============================================================
// useOfficer — replaces the hardcoded OFFICER constant
// Reads from ROLE_USERS via session context
// All screens import this instead of OFFICER from police-data.ts
// ============================================================
"use client";

import { useMemo } from "react";
import { usePoliceStore } from "@/store/police-store";
import { ROLE_USERS } from "@/lib/mock-engine";

export function useOfficer() {
  const { loginIdentifier, userRole, isAuthenticated } = usePoliceStore();

  return useMemo(() => {
    if (!isAuthenticated) return DEFAULT_OFFICER;

    // Try to resolve from loginIdentifier (saved during login)
    if (loginIdentifier) {
      const q = loginIdentifier.trim().toLowerCase().replace(/\s/g, "");
      const found = ROLE_USERS.find((u) =>
        u.username.toLowerCase() === q ||
        u.mobile.replace(/\s/g, "") === q ||
        u.email.toLowerCase() === q ||
        u.badgeNo.toLowerCase() === q
      );
      if (found) return {
        name:      found.name,
        shortName: found.shortName,
        rank:      found.rank,
        rankShort: found.rankShort,
        id:        found.badgeNo,
        station:   found.station,
        unit:      found.unit,
        phone:     found.mobile,
        email:     found.email,
        photo:     found.photo,
        region:    found.region,
        status:    found.status === "active" ? "Mtaandao" : found.status === "patrol" ? "Doria" : "Mapumziko",
      };
    }

    // Fallback: first user matching the current role
    const roleMap: Record<string, string[]> = {
      "officer-traffic": ["officer-traffic"],
      "officer-general": ["officer-general"],
      "admin":           ["admin"],
      "commander":       ["national-commissioner","regional-commissioner","district-commissioner","station-commissioner"],
    };
    const matchRoles = roleMap[userRole] ?? [userRole];
    const fallback = ROLE_USERS.find((u) => matchRoles.includes(u.role));
    if (fallback) return {
      name: fallback.name, shortName: fallback.shortName,
      rank: fallback.rank, rankShort: fallback.rankShort,
      id: fallback.badgeNo, station: fallback.station,
      unit: fallback.unit, phone: fallback.mobile,
      email: fallback.email, photo: fallback.photo,
      region: fallback.region,
      status: fallback.status === "active" ? "Mtaandao" : "Mapumziko",
    };

    return DEFAULT_OFFICER;
  }, [loginIdentifier, userRole, isAuthenticated]);
}

const DEFAULT_OFFICER = {
  name: "Cprl. Juma Khamis Mwinyi",
  shortName: "Cprl. Juma",
  rank: "Corporal",
  rankShort: "Cprl.",
  id: "TP123456",
  station: "Kituo Kikuu cha Polisi DSM",
  unit: "Trafiki - Ilala Zone",
  phone: "0712 345 678",
  email: "juma.mwinyi@polisi.go.tz",
  photo: "",
  region: "Dar es Salaam",
  status: "Mtaandao",
};
