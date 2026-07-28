// @ts-nocheck
"use client";
import { OFFICERS, ADMIN_CITATIONS, ADMIN_INCIDENTS, ACTIVE_PATROLS, ASSIGNMENTS, POSTS, STATIONS, ADMIN_USERS, WARNING_RECORDS, LIVE_INCIDENTS, INCIDENT_TREND, OFFENSE_DISTRIBUTION, GENERAL_INCIDENT_DISTRIBUTION, COMBINED_DISTRIBUTION, REGION_STATS, ADMIN_USER, settings } from "@/lib/admin-data";
import type { OfficerRecord, CitationRecord, IncidentRecord, PatrolRecord, AssignmentRecord, PostRecord, StationRecord, AdminUserRecord, WarningRecord, MissingRecord, DetainedRecord, LiveIncidentRecord } from "@/lib/admin-data";

import Link from "next/link";
import { ArrowLeft, Building2, Network, User } from "lucide-react";
export function AssignmentDetailPage({ assignmentId, basePath }: { assignmentId: string; basePath: "/admin" | "/command" }) {
  const assignment = ASSIGNMENTS.find((a) => a.id === assignmentId);
  if (!assignment) {
    return (
      <div className="min-h-screen bg-police p-6">
        <div className="mx-auto max-w-4xl rounded-xl bg-police-card p-6 shadow-sm">
          <h1 className="text-xl font-bold text-police-navy">Mgao Haujapatikana</h1>
          <p className="mt-1 text-[13px] text-police-muted">ID: {assignmentId}</p>
          <Link href={basePath} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-police-input px-3 py-2 text-[12px] font-semibold text-police-navy hover:bg-police-muted"><ArrowLeft size={14} /> Rudi</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-police p-4 lg:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <Link href={basePath} className="inline-flex items-center gap-2 rounded-lg bg-police-card px-3 py-2 text-[12px] font-semibold text-police-navy shadow-sm hover:bg-police-muted"><ArrowLeft size={14} /> Rudi</Link>
        <div className="rounded-xl bg-police-card p-5 shadow-sm">
          <p className="font-mono text-[11px] text-police-faint">{assignment.id}</p>
          <h1 className="text-xl font-bold text-police-navy">{assignment.officerName}</h1>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <p className="text-[13px] text-police-muted"><User size={13} className="mr-1 inline" />Nafasi: <span className="font-semibold text-police">{assignment.role}</span></p>
            <p className="text-[13px] text-police-muted">Cheo: <span className="font-semibold text-police">{assignment.officerRank}</span></p>
            <p className="text-[13px] text-police-muted"><Building2 size={13} className="mr-1 inline" />{assignment.stationName}</p>
            <p className="text-[13px] text-police-muted"><Network size={13} className="mr-1 inline" />{assignment.postName}</p>
            <p className="text-[13px] text-police-muted">Tarehe: <span className="font-semibold text-police">{assignment.assignedDate}</span></p>
            <p className="text-[13px] text-police-muted">Hadhi: <span className="font-semibold text-police">{assignment.status}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
