"use client";

import Link from "next/link";
import { ArrowLeft, MapPin, Clock, AlertTriangle } from "lucide-react";
import { getOfficerProfilePath } from "@/lib/admin-navigation";

export function IncidentDetailPage({ incidentId, basePath }: { incidentId: string; basePath: "/admin" | "/command" }) {
  const incident = ADMIN_INCIDENTS.find((i) => i.id === incidentId);

  if (!incident) {
    return (
      <div className="min-h-screen bg-police p-6">
        <div className="mx-auto max-w-4xl rounded-xl bg-police-card p-6 shadow-sm">
          <h1 className="text-xl font-bold text-police-navy">Tukio Halijapatikana</h1>
          <p className="mt-1 text-[13px] text-police-muted">ID: {incidentId}</p>
          <Link href={basePath} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-police-input px-3 py-2 text-[12px] font-semibold text-police-navy hover:bg-police-muted">
            <ArrowLeft size={14} /> Rudi
          </Link>
        </div>
      </div>
    );
  }

  const officer = OFFICERS.find((o) => o.name === incident.assignedTo);

  return (
    <div className="min-h-screen bg-police p-4 lg:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <Link href={basePath} className="inline-flex items-center gap-2 rounded-lg bg-police-card px-3 py-2 text-[12px] font-semibold text-police-navy shadow-sm hover:bg-police-muted">
          <ArrowLeft size={14} /> Rudi
        </Link>

        <div className="rounded-xl bg-police-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] text-police-faint">{incident.id}</p>
              <h1 className="text-xl font-bold text-police-navy">{incident.type}</h1>
            </div>
            <span className="rounded-md bg-[#EF4444]/100/15 px-2 py-1 text-[10px] font-bold uppercase text-[#EF4444]">{incident.priority}</span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <p className="text-[13px] text-police-muted"><MapPin size={13} className="mr-1 inline" />{incident.location}</p>
            <p className="text-[13px] text-police-muted"><Clock size={13} className="mr-1 inline" />{incident.date} {incident.time}</p>
            <p className="text-[13px] text-police-muted">Hadhi: <span className="font-semibold text-police">{incident.status}</span></p>
            <p className="text-[13px] text-police-muted">Afisa: {officer ? <Link href={getOfficerProfilePath(basePath, officer.id)} className="font-semibold text-[#2196F3] hover:underline">{incident.assignedTo}</Link> : incident.assignedTo}</p>
          </div>
          <div className="mt-4 rounded-lg bg-police-muted/40 p-3 text-[13px] text-police">
            <p className="mb-1 text-[11px] font-semibold text-police-muted">Maelezo</p>
            {incident.description}
          </div>
          <div className="mt-4 flex gap-2">
            <button className="inline-flex items-center gap-1 rounded-lg bg-[#2196F3] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#2196F3]"><AlertTriangle size={13} /> Weka Kipaumbele</button>
          </div>
        </div>
      </div>
    </div>
  );
}
