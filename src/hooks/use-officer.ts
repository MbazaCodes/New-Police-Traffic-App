// useOfficer — resolves logged-in officer from Zustand store (populated from Supabase at login)
// No hardcoded names. Falls back to empty/loading state if not authenticated.
"use client";

import { useMemo } from "react";
import { usePoliceStore } from "@/store/police-store";

export interface OfficerProfile {
  name:      string;
  shortName: string;
  rank:      string;
  rankShort: string;
  id:        string;
  badgeNo:   string;
  station:   string;
  unit:      string;
  phone:     string;
  email:     string;
  photo:     string;
  region:    string;
  status:    string;
}

const EMPTY_OFFICER: OfficerProfile = {
  name:      "",
  shortName: "",
  rank:      "",
  rankShort: "",
  id:        "",
  badgeNo:   "",
  station:   "",
  unit:      "",
  phone:     "",
  email:     "",
  photo:     "",
  region:    "",
  status:    "",
};

export function useOfficer(): OfficerProfile {
  const { isAuthenticated, officerProfile } = usePoliceStore();

  return useMemo(() => {
    if (!isAuthenticated || !officerProfile) return EMPTY_OFFICER;
    return officerProfile;
  }, [isAuthenticated, officerProfile]);
}
