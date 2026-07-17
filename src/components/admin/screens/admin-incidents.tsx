"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  MapPin,
  Eye,
  UserPlus,
  X,
  Clock,
  User,
} from "lucide-react";
import { ADMIN_INCIDENTS, OFFICERS } from "@/lib/admin-data";
import { getOfficerProfilePath } from "@/lib/admin-navigation";
import { useRecordsStore, type AdminIncidentRecord } from "@/store/records-store";
import { toast } from "@/hooks/use-toast";

type Incident = AdminIncidentRecord;

const TABS = [
  { id: "all", label: "Zote" },
  { id: "urgent", label: "Muhimu" },
  { id: "active", label: "Haijatatuliwa" },
  { id: "investigating", label: "Inachunguzwa" },
  { id: "resolved", label: "Imetatuliwa" },
] as const;

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-[#EF4444]/100/15 text-[#EF4444] border border-[#EF4444]/500/30",
  medium: "bg-[#FF9800]/15 text-[#FF9800] border border-[#FF9800]/30",
  low: "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/500/30",
};

const PRIORITY_LABEL: Record<string, string> = {
  high: "Kipaumbele Juu",
  medium: "Kipaumbele Wastani",
  low: "Kipaumbele Chini",
};

const STATUS_STYLES: Record<string, string> = {
  urgent: "bg-[#EF4444]/100/15 text-[#EF4444] border border-[#EF4444]/500/30",
  active: "bg-[#FF9800]/15 text-[#FF9800] border border-[#FF9800]/30",
  resolved: "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/500/30",
  investigating: "bg-[#2196F3]/15 text-[#2196F3] border border-[#2196F3]/30",
};

const STATUS_LABEL: Record<string, string> = {
  urgent: "MUHIMU",
  active: "Haijatatuliwa",
  resolved: "Imetatuliwa",
  investigating: "Inachunguzwa",
};

export function AdminIncidents() {
  const pathname = usePathname();
  const router = useRouter();
  const incidents = useRecordsStore((s) => s.adminIncidents);
  const updateAdminIncident = useRecordsStore((s) => s.updateAdminIncident);
  const [tab, setTab] = useState<string>("all");
  const [selected, setSelected] = useState<Incident | null>(null);
  const [assigning, setAssigning] = useState<Incident | null>(null);

  const filtered = useMemo(
    () => (tab === "all" ? incidents : incidents.filter((i) => i.status === tab)),
    [tab, incidents]
  );

  const counts = useMemo(
    () => ({
      all: incidents.length,
      urgent: incidents.filter((i) => i.status === "urgent").length,
      active: incidents.filter((i) => i.status === "active").length,
      investigating: incidents.filter((i) => i.status === "investigating").length,
      resolved: incidents.filter((i) => i.status === "resolved").length,
    }),
    [incidents]
  );

  const handleAssign = (officerName: string) => {
    if (!assigning) return;
    updateAdminIncident(assigning.id, { assignedTo: officerName });
    toast({
      title: "Afisa Amepangiwa",
      description: `${officerName} amepangiwa kwenye ${assigning.id}`,
    });
    setAssigning(null);
  };

  return (
    <div className="space-y-5">
      {/* Heading */}
      <div>
        <h1 className="text-xl font-bold text-police-navy">Matukio</h1>
        <p className="text-[13px] text-police-muted">
          Dhibiti na fuatilia matukio yote ya polisi
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-xl bg-police-card p-1.5 shadow-sm">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium transition ${
              tab === t.id
                ? "bg-[#2196F3] text-white"
                : "text-police-muted hover:bg-police-input"
            }`}
          >
            {t.label}
            <span
              className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                tab === t.id
                  ? "bg-white/25 text-white"
                  : "bg-police-input text-police-faint"
              }`}
            >
              {counts[t.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Incidents table */}
      <div className="rounded-xl bg-police-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-left text-[12px]">
            <thead>
              <tr className="border-b border-police-soft bg-police-muted/40 text-[10px] uppercase text-police-faint">
                <th className="px-4 py-3 font-semibold">Kitambulisho</th>
                <th className="px-4 py-3 font-semibold">Aina</th>
                <th className="px-4 py-3 font-semibold">Eneo</th>
                <th className="px-4 py-3 font-semibold">Tarehe/Saa</th>
                <th className="px-4 py-3 font-semibold">Kipaumbele</th>
                <th className="px-4 py-3 font-semibold">Hadhi</th>
                <th className="px-4 py-3 font-semibold">Afisa</th>
                <th className="px-4 py-3 font-semibold">Maelezo</th>
                <th className="px-4 py-3 text-right font-semibold">Hatua</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inc) => {
                const officer = OFFICERS.find((o) => o.name === inc.assignedTo);
                return (
                <tr
                  key={inc.id}
                  className="border-b border-police-soft transition hover:bg-police-muted/40 last:border-0"
                >
                  <td className="px-4 py-3 font-mono text-[11px] font-semibold text-police-navy">
                    {inc.id}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} className="text-[#FF9800]" />
                      <span className="font-semibold text-police">{inc.type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-police-muted">
                    <MapPin size={11} className="mr-0.5 inline" />
                    {inc.location}
                  </td>
                  <td className="px-4 py-3 text-police-muted">
                    <div>{inc.date}</div>
                    <div className="text-[10px] text-police-faint">{inc.time}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        PRIORITY_STYLES[inc.priority]
                      }`}
                    >
                      {PRIORITY_LABEL[inc.priority]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        STATUS_STYLES[inc.status]
                      }`}
                    >
                      {STATUS_LABEL[inc.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-police-muted">
                    {officer ? (
                      <Link href={getOfficerProfilePath(pathname, officer.id)} className="font-medium text-[#2196F3] hover:underline">
                        {inc.assignedTo}
                      </Link>
                    ) : (
                      inc.assignedTo
                    )}
                  </td>
                  <td className="px-4 py-3 text-police-muted">
                    <span className="line-clamp-1 max-w-[200px]">
                      {inc.description}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setAssigning(inc)}
                        className="flex items-center gap-1 rounded-lg bg-[#2196F3]/10 px-2 py-1.5 text-[11px] font-semibold text-[#2196F3] hover:bg-[#2196F3]/20"
                        title="Pangisha Afisa"
                      >
                        <UserPlus size={12} /> Panga
                      </button>
                      <button
                        onClick={() => setSelected(inc)}
                        className="flex items-center gap-1 rounded-lg bg-police-input px-2 py-1.5 text-[11px] font-semibold text-police-navy hover:bg-police-muted"
                        title="Angalia"
                      >
                        <Eye size={12} /> Angalia
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-[13px] text-police-faint">
            Hakuna matukio kwenye kichungi hiki.
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <IncidentModal
          incident={selected}
          pathname={pathname}
          onClose={() => setSelected(null)}
          onAssign={() => {
            setAssigning(selected);
            setSelected(null);
          }}
        />
      )}

      {/* Assign modal */}
      {assigning && (
        <AssignIncidentModal
          incident={assigning}
          officers={OFFICERS}
          currentOfficer={assigning.assignedTo}
          onClose={() => setAssigning(null)}
          onConfirm={handleAssign}
        />
      )}
    </div>
  );
}

function AssignIncidentModal({
  incident,
  officers,
  currentOfficer,
  onClose,
  onConfirm,
}: {
  incident: Incident;
  officers: { id: string; name: string; rank: string }[];
  currentOfficer: string;
  onClose: () => void;
  onConfirm: (officerName: string) => void;
}) {
  const [selected, setSelected] = useState<string>(
    officers.find((o) => o.name === currentOfficer)?.id ?? ""
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-police-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-police-soft bg-police-muted/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2196F3]/15 text-[#2196F3]">
              <UserPlus size={18} />
            </div>
            <div>
              <p className="text-[15px] font-bold text-police">Pangisha Afisa</p>
              <p className="font-mono text-[11px] text-police-faint">{incident.id} · {incident.type}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-police-faint hover:bg-police-muted">
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase text-police-faint">Chagua Afisa</p>
          <div className="max-h-72 space-y-1.5 overflow-y-auto app-scroll">
            {officers.map((o) => (
              <button
                key={o.id}
                onClick={() => setSelected(o.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition ${
                  selected === o.id
                    ? "border-[#2196F3] bg-[#2196F3]/5"
                    : "border-police-soft bg-police-input hover:bg-police-muted"
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2196F3]/15 text-[10px] font-bold text-[#2196F3]">
                  {o.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-police">{o.name}</p>
                  <p className="text-[10px] text-police-muted">{o.rank} · <span className="font-mono">{o.id}</span></p>
                </div>
                {selected === o.id && <span className="text-[11px] font-bold text-[#2196F3]">✓</span>}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3">
            <button
              onClick={onClose}
              className="rounded-lg bg-police-input py-2.5 text-[12px] font-semibold text-police-navy hover:bg-police-muted"
            >
              Ghairi
            </button>
            <button
              disabled={!selected}
              onClick={() => {
                const off = officers.find((o) => o.id === selected);
                if (off) onConfirm(off.name);
              }}
              className="rounded-lg bg-[#2196F3] py-2.5 text-[12px] font-semibold text-white hover:bg-[#2196F3] disabled:opacity-50"
            >
              Thibitisha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function IncidentModal({
  incident,
  pathname,
  onClose,
  onAssign,
}: {
  incident: Incident;
  pathname: string;
  onClose: () => void;
  onAssign: () => void;
}) {
  const officer = OFFICERS.find((o) => o.name === incident.assignedTo);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-police-card shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-police-soft bg-police-muted/40 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF9800]/15 text-[#FF9800]">
              <AlertTriangle size={22} />
            </div>
            <div>
              <p className="text-[15px] font-bold text-police">{incident.type}</p>
              <p className="font-mono text-[11px] text-police-faint">{incident.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-police-faint hover:bg-police-muted"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-md px-2.5 py-1 text-[11px] font-bold uppercase ${
                PRIORITY_STYLES[incident.priority]
              }`}
            >
              {PRIORITY_LABEL[incident.priority]}
            </span>
            <span
              className={`rounded-md px-2.5 py-1 text-[11px] font-bold uppercase ${
                STATUS_STYLES[incident.status]
              }`}
            >
              {STATUS_LABEL[incident.status]}
            </span>
          </div>

          <DetailRow
            icon={<MapPin size={14} />}
            label="Eneo"
            value={incident.location}
          />
          <DetailRow
            icon={<Clock size={14} />}
            label="Tarehe & Saa"
            value={`${incident.date} • ${incident.time}`}
          />
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase text-police-faint">Afisa Aliyepangiwa</p>
            {officer ? (
              <Link href={getOfficerProfilePath(pathname, officer.id)} className="font-medium text-[#2196F3] hover:underline">
                {incident.assignedTo}
              </Link>
            ) : (
              <p className="text-[13px] text-police">{incident.assignedTo}</p>
            )}
          </div>

          <div className="rounded-lg border border-police-soft bg-police-muted/40 p-3">
            <p className="mb-1 text-[11px] font-semibold uppercase text-police-faint">
              Maelezo ya Tukio
            </p>
            <p className="text-[13px] text-police">{incident.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => {
                toast({
                  title: "Imefanikiwa",
                  description: `Tukio ${incident.id} limewekwa kipaumbele juu`,
                });
              }}
              className="rounded-lg bg-[#EF4444]/100 py-2.5 text-[12px] font-semibold text-white hover:bg-[#EF4444]/600"
            >
              Weka Kipaumbele
            </button>
            <button
              onClick={() => {
                onClose();
                onAssign();
              }}
              className="rounded-lg bg-[#2196F3] py-2.5 text-[12px] font-semibold text-white hover:bg-[#2196F3]"
            >
              <User size={12} className="mr-1 inline" /> Pangisha Afisa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-police-input p-2.5">
      <span className="text-police-faint">{icon}</span>
      <div className="flex-1">
        <p className="text-[10px] uppercase text-police-faint">{label}</p>
        <p className="text-[13px] text-police">{value}</p>
      </div>
    </div>
  );
}
