"use client";

import Link from "next/link";
import { ArrowLeft, Phone, Building2, Shield, FileText, AlertTriangle, Route } from "lucide-react";
export function OfficerProfilePage({ officerId, basePath }: { officerId: string; basePath: "/admin" | "/command" }) {
  const officer = OFFICERS.find((o) => o.id === officerId);

  if (!officer) {
    return (
      <div className="min-h-screen bg-police p-6">
        <div className="mx-auto max-w-5xl rounded-xl bg-police-card p-6 shadow-sm">
          <h1 className="text-xl font-bold text-police-navy">Afisa Hapatikani</h1>
          <p className="mt-1 text-[13px] text-police-muted">Hatukupata afisa mwenye ID hii: {officerId}</p>
          <Link href={basePath} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-police-input px-3 py-2 text-[12px] font-semibold text-police-navy hover:bg-police-muted">
            <ArrowLeft size={14} /> Rudi Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const incidents = ADMIN_INCIDENTS.filter((i) => i.assignedTo === officer.name);
  const citations = ADMIN_CITATIONS.filter((c) => c.officer === officer.name);
  const patrols = ACTIVE_PATROLS.filter((p) => p.officer === officer.name);

  return (
    <div className="min-h-screen bg-police p-4 lg:p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <Link href={basePath} className="inline-flex items-center gap-2 rounded-lg bg-police-card px-3 py-2 text-[12px] font-semibold text-police-navy shadow-sm hover:bg-police-muted">
          <ArrowLeft size={14} /> Rudi
        </Link>

        <div className="rounded-xl bg-police-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-police-navy">{officer.name}</h1>
              <p className="mt-1 text-[13px] text-police-muted">{officer.rank} • {officer.id}</p>
              <p className="mt-2 flex items-center gap-1 text-[13px] text-police-muted"><Building2 size={14} /> {officer.station}</p>
              <p className="mt-1 text-[13px] text-police-muted">{officer.unit}</p>
              <p className="mt-2 flex items-center gap-1 text-[13px] text-police-muted"><Phone size={14} /> {officer.phone}</p>
            </div>
            <span className="rounded-md bg-[#2196F3]/15 px-2 py-1 text-[11px] font-bold text-[#2196F3]">PROFILE</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric icon={<Shield size={14} />} label="Patroli" value={String(officer.patrols)} />
          <Metric icon={<FileText size={14} />} label="Citations" value={String(officer.citations)} />
          <Metric icon={<AlertTriangle size={14} />} label="Matukio" value={String(officer.incidents)} />
          <Metric icon={<Route size={14} />} label="Saa Leo" value={`${officer.hoursToday.toFixed(1)}h`} />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Section title="Matukio ya Afisa">
            {incidents.length === 0 ? <Empty text="Hakuna matukio." /> : incidents.map((i) => <Row key={i.id} left={i.id} right={`${i.type} • ${i.status}`} />)}
          </Section>
          <Section title="Citations za Afisa">
            {citations.length === 0 ? <Empty text="Hakuna citations." /> : citations.map((c) => <Row key={c.id} left={c.id} right={`${c.offense} • ${c.status}`} />)}
          </Section>
          <Section title="Patroli Zinazoendelea">
            {patrols.length === 0 ? <Empty text="Hakuna patroli hai." /> : patrols.map((p) => <Row key={p.id} left={p.id} right={`${p.area} • ${p.progress}%`} />)}
          </Section>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-police-card p-3 shadow-sm">
      <div className="flex items-center gap-2 text-police-muted">{icon}<span className="text-[11px]">{label}</span></div>
      <p className="mt-1 text-lg font-bold text-police-navy">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-police-card p-4 shadow-sm">
      <h2 className="mb-2 text-[14px] font-bold text-police-navy">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ left, right }: { left: string; right: string }) {
  return (
    <div className="rounded-lg bg-police-muted/40 px-3 py-2 text-[12px]">
      <p className="font-semibold text-police">{left}</p>
      <p className="text-police-muted">{right}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-lg bg-police-muted/40 px-3 py-2 text-[12px] text-police-faint">{text}</p>;
}
