// useOfficer — resolves logged-in officer from Zustand store (populated from Supabase at login)
// No hardcoded names. Falls back to empty/loading state if not authenticated.
"use client";

import { useMemo } from "react";
import { usePoliceStore } from "@/store/police-store";

export interface OfficerProfile {
  name:           string;
  shortName:      string;
  rank:           string;
  rankShort:      string;
  id:             string;
  badgeNo:        string;
  idNumber:       string;
  officerId:      string;
  station:        string;
  stationId:      string;
  stationPhone:   string;
  stationRegion:  string;
  stationDistrict:string;
  unit:           string;
  phone:          string;
  email:          string;
  photo:          string;
  region:         string;
  status:         string;
  role:           string;
  roleRaw:        string;
  lastLogin:      string | null;
  createdAt:      string | null;
  patrolsCount:   number;
  citationsCount: number;
  incidentsCount: number;
  hoursToday:     number;
}

const EMPTY_OFFICER: OfficerProfile = {
  name:"",shortName:"",rank:"",rankShort:"",id:"",badgeNo:"",idNumber:"",officerId:"",
  station:"",stationId:"",stationPhone:"",stationRegion:"",stationDistrict:"",
  unit:"",phone:"",email:"",photo:"",region:"",status:"",role:"",roleRaw:"",
  lastLogin:null,createdAt:null,patrolsCount:0,citationsCount:0,incidentsCount:0,hoursToday:0,
};

export function useOfficer(): OfficerProfile {
  const { isAuthenticated, officerProfile } = usePoliceStore();

  return useMemo(() => {
    if (!isAuthenticated || !officerProfile) return EMPTY_OFFICER;
    return officerProfile;
  }, [isAuthenticated, officerProfile]);
}
