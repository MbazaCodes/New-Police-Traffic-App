// @ts-nocheck
"use client";
import { OFFICERS, ADMIN_CITATIONS, ADMIN_INCIDENTS, ACTIVE_PATROLS, ASSIGNMENTS, POSTS, STATIONS, ADMIN_USERS, WARNING_RECORDS, LIVE_INCIDENTS, INCIDENT_TREND, OFFENSE_DISTRIBUTION, GENERAL_INCIDENT_DISTRIBUTION, COMBINED_DISTRIBUTION, REGION_STATS, ADMIN_USER, settings } from "@/lib/admin-data";
import type { OfficerRecord, CitationRecord, IncidentRecord, PatrolRecord, AssignmentRecord, PostRecord, StationRecord, AdminUserRecord, WarningRecord, MissingRecord, DetainedRecord, LiveIncidentRecord } from "@/lib/admin-data";

import Link from "next/link";
import { ArrowLeft, Building2, MapPin, Phone } from "lucide-react";
export function StationDetailPage({ stationId, basePath }: { stationId: string; basePath: "/admin" | "/command" }) {
  const station = STATIONS.find((s) => s.id === stationId);
  if (!station) return <NotFound basePath={basePath} title="Kituo Hakipatikani" id={stationId} />;

  return (
    <div className="min-h-screen bg-police p-4 lg:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <Link href={basePath} className="inline-flex items-center gap-2 rounded-lg bg-police-card px-3 py-2 text-[12px] font-semibold text-police-navy shadow-sm hover:bg-police-muted"><ArrowLeft size={14} /> Rudi</Link>
        <div className="rounded-xl bg-police-card p-5 shadow-sm">
          <p className="font-mono text-[11px] text-police-faint">{station.id}</p>
          <h1 className="text-xl font-bold text-police-navy">{station.name}</h1>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <p className="text-[13px] text-police-muted"><MapPin size={13} className="mr-1 inline" />{station.address}</p>
            <p className="text-[13px] text-police-muted"><Phone size={13} className="mr-1 inline" />{station.phone}</p>
            <p className="text-[13px] text-police-muted">Mkoa/Wilaya: <span className="font-semibold text-police">{station.region} / {station.district}</span></p>
            <p className="text-[13px] text-police-muted">Maofisa/Posti: <span className="font-semibold text-police">{station.officersCount} / {station.postsCount}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotFound({ basePath, title, id }: { basePath: "/admin" | "/command"; title: string; id: string }) {
  return (
    <div className="min-h-screen bg-police p-6">
      <div className="mx-auto max-w-4xl rounded-xl bg-police-card p-6 shadow-sm">
        <h1 className="text-xl font-bold text-police-navy">{title}</h1>
        <p className="mt-1 text-[13px] text-police-muted">ID: {id}</p>
        <Link href={basePath} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-police-input px-3 py-2 text-[12px] font-semibold text-police-navy hover:bg-police-muted"><ArrowLeft size={14} /> Rudi</Link>
      </div>
    </div>
  );
}
