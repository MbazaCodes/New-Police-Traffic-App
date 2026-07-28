// @ts-nocheck
"use client";
import { OFFICERS, ADMIN_CITATIONS, ADMIN_INCIDENTS, ACTIVE_PATROLS, ASSIGNMENTS, POSTS, STATIONS, ADMIN_USERS, WARNING_RECORDS, LIVE_INCIDENTS, INCIDENT_TREND, OFFENSE_DISTRIBUTION, GENERAL_INCIDENT_DISTRIBUTION, COMBINED_DISTRIBUTION, REGION_STATS, ADMIN_USER, settings } from "@/lib/admin-data";
import type { OfficerRecord, CitationRecord, IncidentRecord, PatrolRecord, AssignmentRecord, PostRecord, StationRecord, AdminUserRecord, WarningRecord, MissingRecord, DetainedRecord, LiveIncidentRecord } from "@/lib/admin-data";

import Link from "next/link";
import { ArrowLeft, Mail, Building2, BadgeCheck } from "lucide-react";
export function UserDetailPage({ userId, basePath }: { userId: string; basePath: "/admin" | "/command" }) {
  const user = ADMIN_USERS.find((u) => u.id === userId);

  if (!user) {
    return (
      <div className="min-h-screen bg-police p-6">
        <div className="mx-auto max-w-4xl rounded-xl bg-police-card p-6 shadow-sm">
          <h1 className="text-xl font-bold text-police-navy">Mtumiaji Hapatikani</h1>
          <p className="mt-1 text-[13px] text-police-muted">ID: {userId}</p>
          <Link href={basePath} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-police-input px-3 py-2 text-[12px] font-semibold text-police-navy hover:bg-police-muted">
            <ArrowLeft size={14} /> Rudi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-police p-4 lg:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <Link href={basePath} className="inline-flex items-center gap-2 rounded-lg bg-police-card px-3 py-2 text-[12px] font-semibold text-police-navy shadow-sm hover:bg-police-muted">
          <ArrowLeft size={14} /> Rudi
        </Link>

        <div className="rounded-xl bg-police-card p-5 shadow-sm">
          <p className="font-mono text-[11px] text-police-faint">{user.id}</p>
          <h1 className="text-xl font-bold text-police-navy">{user.name}</h1>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <p className="text-[13px] text-police-muted"><BadgeCheck size={13} className="mr-1 inline" />Nafasi: <span className="font-semibold text-police">{user.role}</span></p>
            <p className="text-[13px] text-police-muted">Cheo: <span className="font-semibold text-police">{user.rank}</span></p>
            <p className="text-[13px] text-police-muted"><Mail size={13} className="mr-1 inline" />{user.email}</p>
            <p className="text-[13px] text-police-muted"><Building2 size={13} className="mr-1 inline" />{user.station}</p>
            <p className="text-[13px] text-police-muted">Hadhi: <span className="font-semibold text-police">{user.status}</span></p>
            <p className="text-[13px] text-police-muted">Login ya mwisho: <span className="font-semibold text-police">{user.lastLogin}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
