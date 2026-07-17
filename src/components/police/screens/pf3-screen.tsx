"use client";

import { useOfficer } from "@/hooks/use-officer";

import {
  FileText,
  Calendar,
  Clock,
  MapPin,
  Car,
  Users,
  Eye,
  Building2,
  ShieldCheck,
  Save,
  Send,
  Download,
  Printer,
  Hash,
  CloudSun,
  Route,
  Sun,
} from "lucide-react";
import { TopAppBar } from "../top-app-bar";
import { PF3_FORM } from "@/lib/police-data";
import { usePoliceStore } from "@/store/police-store";
import { useRecordsStore } from "@/store/records-store";
import { toast } from "@/hooks/use-toast";

export function Pf3Screen() {
  const OFFICER = useOfficer();
  const f = PF3_FORM;
  const goBack = usePoliceStore((s) => s.goBack);
  const addPF3 = useRecordsStore((s) => s.addPF3);
  const submitPF3 = useRecordsStore((s) => s.submitPF3);

  const now = new Date();
  const today = now.toLocaleDateString("sw-TZ", { day: "numeric", month: "long", year: "numeric" });
  const currentTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const buildPayload = () => ({
    region: f.region,
    district: f.district,
    station: f.station,
    accidentType: f.accidentType,
    severity: f.severity,
    date: `${today} ${currentTime}`,
    vehicles: f.vehicles.length,
    casualties: f.casualties.length,
    witnesses: f.witnesses.length,
  });

  const handleSaveDraft = () => {
    addPF3(buildPayload());
    toast({ title: "Imehifadhiwa", description: "Rasimu ya Fomu PF3 imehifadhiwa." });
  };
  const handleSubmit = () => {
    const id = addPF3(buildPayload());
    submitPF3(id);
    toast({ title: "Imetumwa kwa Kituo Kikuu", description: "Fomu PF3 imewasilishwa kikamilifu." });
    setTimeout(() => goBack(), 800);
  };
  const handleDownload = () =>
    toast({ title: "Inapakua", description: "Fomu PF3 inapakuliwa kama PDF." });
  const handlePrint = () =>
    toast({ title: "Inachapisha", description: "Fomu PF3 inatumwa kwa printer." });

  return (
    <div className="min-h-full bg-police">
      <TopAppBar title="Fomu PF3" subtitle="Ripoti Rasmi ya Ajali ya Trafiki" showBack />

      <div className="space-y-3 p-4 pb-8">
        {/* Official form banner */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A3D62] to-[#1E3A8A] p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/70">
                Jeshi la Polisi Tanzania
              </p>
              <h2 className="mt-0.5 text-[18px] font-extrabold">FORM PF3</h2>
              <p className="text-[11px] text-white/80">Traffic Accident Report Form</p>
            </div>
            <div className="rounded-xl bg-police-card/15 px-3 py-2 text-right backdrop-blur">
              <p className="text-[9px] uppercase text-white/60">Namba ya Kumbukumbu</p>
              <p className="text-[13px] font-bold">{f.referenceNo}</p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#1E3A8A]/20 bg-police-card py-2.5 text-[12px] font-semibold text-police-navy active:scale-[0.98]"
          >
            <Download size={15} /> Pakua PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#1E3A8A]/20 bg-police-card py-2.5 text-[12px] font-semibold text-police-navy active:scale-[0.98]"
          >
            <Printer size={15} /> Chapisha
          </button>
        </div>

        {/* Section 1: Mamlaka */}
        <Section title="A. Taarifa za Mamlaka" icon={<Building2 size={16} />}>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Mkoa" value={f.region} />
            <Field label="Wilaya" value={f.district} />
            <Field label="Kituo" value={f.station} />
            <Field label="Afisa Anayeripoti" value={OFFICER.name} />
          </div>
        </Section>

        {/* Section 2: Maelezo ya Ajali */}
        <Section title="B. Maelezo ya Ajali" icon={<FileText size={16} />}>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Aina ya Ajali" value={f.accidentType} />
            <Field label="Mkuliko" value={f.severity} icon={<ShieldCheck size={14} />} />
            <Field label="Tarehe" value="15 Mei 2026" icon={<Calendar size={14} />} />
            <Field label="Saa" value="08:15 AM" icon={<Clock size={14} />} />
            <Field label="Eneo" value="Morogoro Road, Dar es Salaam" icon={<MapPin size={14} />} full />
            <Field label="Mahali Halisi" value="Makutano ya Morogoro Road na Ubungo Terminal" full />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <ConditionChip icon={<CloudSun size={14} />} label="Hali ya Hewa" value={f.weather} />
            <ConditionChip icon={<Route size={14} />} label="Uso wa Barabara" value={f.roadSurface} />
            <ConditionChip icon={<Sun size={14} />} label="Mwanga" value={f.lightCondition} />
          </div>
        </Section>

        {/* Section 3: Magari Husika */}
        <Section title="C. Magari Husika" icon={<Car size={16} />} count={`Jumla: ${f.vehicles.length}`}>
          <div className="space-y-2.5">
            {f.vehicles.map((v, i) => (
              <div key={i} className="rounded-xl border border-police-soft bg-police-muted p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-md border-2 border-[#1E3A8A] bg-yellow-50 px-2.5 py-0.5 text-[14px] font-extrabold tracking-wider text-police-navy">
                    {v.plate}
                  </span>
                  <span className="text-[10px] font-medium text-police-faint">Gari {i + 1}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <MiniField label="Aina" value={`${v.make} (${v.year})`} />
                  <MiniField label="Rangi" value={v.color} />
                  <MiniField label="Dereva" value={v.driver} />
                  <MiniField label="Leseni" value={v.license} />
                  <MiniField label="Mwelekeo" value={v.direction} />
                  <MiniField label="Uharibifu" value={v.damage} />
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      v.insured ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#EF4444]/10 text-[#EF4444]"
                    }`}
                  >
                    {v.insured ? "Bima: Inapatikana" : "Bima: Haiapatikani"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Section 4: Waharibika / Majeruhi */}
        <Section title="D. Waharibika / Majeruhi" icon={<Users size={16} />} count={`Jumla: ${f.casualties.length}`}>
          <div className="space-y-2">
            {f.casualties.map((c, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-police-soft p-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FF9800]/50">
                  <Users size={16} className="text-[#FF9800]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-police">{c.name}</p>
                  <p className="text-[11px] text-police-muted">
                    {c.type} • {c.injury}
                  </p>
                  <p className="text-[10px] text-police-faint">
                    Hospitali: {c.hospital} • Hali: {c.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Section 5: Mashahidi */}
        <Section title="E. Mashahidi" icon={<Eye size={16} />} count={`Jumla: ${f.witnesses.length}`}>
          <div className="space-y-2">
            {f.witnesses.map((w, i) => (
              <div key={i} className="rounded-xl border border-police-soft bg-police-muted p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-bold text-police">{w.name}</p>
                  <p className="text-[10px] text-police-faint">{w.phone}</p>
                </div>
                <p className="mt-1.5 text-[11px] italic leading-snug text-police-muted">"{w.statement}"</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Section 6: Sketch / Ramani */}
        <Section title="F. Ramani ya Ajali" icon={<MapPin size={16} />}>
          <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-xl border-2 border-dashed border-police bg-police-input">
            <MapPin size={28} className="text-police-faint" />
            <p className="mt-1 text-[11px] text-police-faint">Sketch ya eneo la ajali</p>
            <p className="text-[9px] text-police-faint">Bonyeza kuongeza ramani</p>
          </div>
        </Section>

        {/* Section 7: Certification */}
        <Section title="G. Uthibitisho wa Afisa" icon={<ShieldCheck size={16} />}>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Jina la Afisa" value={OFFICER.name} />
            <Field label="Namba ya Utambulisho" value={OFFICER.id} icon={<Hash size={14} />} />
            <Field label="Cheo" value={OFFICER.rank} />
            <Field label="Kituo" value={OFFICER.station} />
          </div>
          <div className="mt-2 rounded-xl border border-police bg-police-input p-4">
            <p className="text-[10px] text-police-faint">Saini ya Afisa</p>
            <p className="mt-4 text-right font-[cursive] text-[18px] italic text-police-navy">J. Mwinyi</p>
            <div className="mt-1 border-t border-dashed border-police pt-1 text-center text-[9px] text-police-faint">
              Saini halali ya Afisa wa Polisi
            </div>
          </div>
        </Section>

        {/* Submit Buttons */}
        <div className="flex gap-2.5 pt-1">
          <button
            onClick={handleSaveDraft}
            className="flex-1 rounded-xl border-2 border-[#1E3A8A] bg-police-card py-3 text-[13px] font-bold text-police-navy active:scale-[0.98]"
          >
            <Save size={16} className="mr-1 inline" /> Hifadhi Rasimu
          </button>
          <button
            onClick={handleSubmit}
            className="flex-[1.5] rounded-xl bg-[#1E3A8A] py-3 text-[13px] font-bold text-white shadow-md active:scale-[0.98]"
          >
            <Send size={16} className="mr-1 inline" /> Wasilisha PF3
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-police-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[14px] font-bold text-police-navy">
          <span className="text-police-navy">{icon}</span>
          {title}
        </h3>
        {count && <span className="text-[11px] font-medium text-police-faint">{count}</span>}
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  icon,
  full = false,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="mb-1 block text-[11px] font-medium text-police-muted">{label}</label>
      <div className="flex items-center gap-2 rounded-xl border border-police bg-police-input px-3">
        {icon && <span className="text-police-faint">{icon}</span>}
        <span className="h-10 flex-1 text-[12px] font-medium text-police">{value}</span>
      </div>
    </div>
  );
}

function MiniField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] text-police-faint">{label}</p>
      <p className="text-[12px] font-semibold text-police">{value}</p>
    </div>
  );
}

function ConditionChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-police-muted p-2 text-center">
      <span className="text-police-faint">{icon}</span>
      <span className="mt-1 text-[9px] text-police-faint">{label}</span>
      <span className="text-[11px] font-bold text-police">{value}</span>
    </div>
  );
}
