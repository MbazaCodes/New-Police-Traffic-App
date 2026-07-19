// @ts-nocheck
"use client";
import { OFFICERS, ADMIN_CITATIONS, ADMIN_INCIDENTS, ACTIVE_PATROLS, ASSIGNMENTS, POSTS, STATIONS, ADMIN_USERS, WARNING_RECORDS, LIVE_INCIDENTS, INCIDENT_TREND, OFFENSE_DISTRIBUTION, GENERAL_INCIDENT_DISTRIBUTION, COMBINED_DISTRIBUTION, REGION_STATS, ADMIN_USER, settings } from "@/lib/admin-data";
import type { OfficerRecord, CitationRecord, IncidentRecord, PatrolRecord, AssignmentRecord, PostRecord, StationRecord, AdminUserRecord, WarningRecord, MissingRecord, DetainedRecord, LiveIncidentRecord } from "@/lib/admin-data";

import Link from "next/link";
import { ArrowLeft, CarFront, BadgeDollarSign, Calendar } from "lucide-react";
import { getOfficerProfilePath } from "@/lib/admin-navigation";

export function CitationDetailPage({ citationId, basePath }: { citationId: string; basePath: "/admin" | "/command" }) {
  const citation = ADMIN_CITATIONS.find((c) => c.id === citationId);

  if (!citation) {
    return (
      <div className="min-h-screen bg-police p-6">
        <div className="mx-auto max-w-4xl rounded-xl bg-police-card p-6 shadow-sm">
          <h1 className="text-xl font-bold text-police-navy">Citation Haijapatikana</h1>
          <p className="mt-1 text-[13px] text-police-muted">ID: {citationId}</p>
          <Link href={basePath} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-police-input px-3 py-2 text-[12px] font-semibold text-police-navy hover:bg-police-muted">
            <ArrowLeft size={14} /> Rudi
          </Link>
        </div>
      </div>
    );
  }

  const officer = OFFICERS.find((o) => o.name === citation.officer);

  return (
    <div className="min-h-screen bg-police p-4 lg:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <Link href={basePath} className="inline-flex items-center gap-2 rounded-lg bg-police-card px-3 py-2 text-[12px] font-semibold text-police-navy shadow-sm hover:bg-police-muted">
          <ArrowLeft size={14} /> Rudi
        </Link>

        <div className="rounded-xl bg-police-card p-5 shadow-sm">
          <p className="font-mono text-[11px] text-police-faint">{citation.id}</p>
          <h1 className="text-xl font-bold text-police-navy">{citation.offense}</h1>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <p className="text-[13px] text-police-muted"><CarFront size={13} className="mr-1 inline" />Namba: <span className="font-semibold text-police">{citation.plate}</span></p>
            <p className="text-[13px] text-police-muted"><BadgeDollarSign size={13} className="mr-1 inline" />Kiasi: <span className="font-semibold text-police">TZS {parseInt(citation.amount.replace(/[^\d]/g, ""), 10).toLocaleString()}</span></p>
            <p className="text-[13px] text-police-muted"><Calendar size={13} className="mr-1 inline" />Tarehe: {citation.date}</p>
            <p className="text-[13px] text-police-muted">Dereva: <span className="font-semibold text-police">{citation.driver}</span></p>
            <p className="text-[13px] text-police-muted">Hadhi: <span className="font-semibold text-police">{citation.status}</span></p>
            <p className="text-[13px] text-police-muted">Afisa: {officer ? <Link href={getOfficerProfilePath(basePath, officer.id)} className="font-semibold text-[#2196F3] hover:underline">{citation.officer}</Link> : citation.officer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
