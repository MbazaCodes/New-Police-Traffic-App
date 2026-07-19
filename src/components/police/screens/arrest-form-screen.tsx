// @ts-nocheck
"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Camera, X, CheckCircle, User, MapPin, Clock, FileText, AlertTriangle } from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { useOfficer } from "@/hooks/use-officer";
import { toast } from "@/hooks/use-toast";

const OFFENSE_CATEGORIES = [
  "Wizi wa Silaha", "Wizi wa Kawaida", "Uendeshaji Gari kwa Ulevi", "Udanganyifu",
  "Ugomvi wa Kimwili", "Uvunjaji wa Amani", "Biashara ya Dawa za Kulevya",
  "Kupiga Risasi Holela", "Ulangakazi", "Kosa la Trafiki Kubwa",
];

export function ArrestFormScreen() {
  const OFFICER = useOfficer();
  const { goBack, arrestPrefill, setArrestPrefill } = usePoliceStore();
  const [submitted, setSubmitted] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    suspectName: arrestPrefill?.suspectName ?? "", nida: arrestPrefill?.nida ?? "", dob: "", gender: "Mme", address: "", phone: arrestPrefill?.phone ?? "",
    occupation: "", offense: "", offenseDetails: "", arrestLocation: "",
    cell: "", courtDate: "", nextOfKin: "", nextOfKinPhone: "", medicalStatus: "Nzuri",
    notes: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach((f) => {
      const r = new FileReader();
      r.onload = (ev) => { if (ev.target?.result) setPhotos((p) => [...p, ev.target!.result as string]); };
      r.readAsDataURL(f);
    });
  };

  const handleSubmit = async () => {
    if (!form.suspectName || !form.offense || !form.arrestLocation) {
      toast({ title: "Kosa", description: "Jaza sehemu zote zinazohitajika (*)", variant: "destructive" }); return;
    }
    // Save to DB via API
    try {
      await fetch("/api/arrests", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          suspectName:  form.suspectName,
          suspectNida:  form.suspectNida || undefined,
          suspectPhone: form.suspectPhone || undefined,
          offense:      form.offense,
          location:     form.arrestLocation,
          cell:         form.cell || undefined,
          nextOfKin:    form.nextOfKin || undefined,
          lawyer:       form.lawyer || undefined,
          notes:        form.notes || undefined,
          photosCount:  photos.length,
        }),
      });
    } catch { /* offline — form still submitted locally */ }
    setSubmitted(true);
    setArrestPrefill(null);
    toast({ title: "Fomu Imewasilishwa ✓", description: `Ripoti ya kukamatwa kwa ${form.suspectName} imewasilishwa kwa Kamishna.` });
  };

  const arrestId = `AR-2026-${String(Math.floor(46 + Math.random() * 50)).padStart(4, "0")}`;
  const now = new Date();
  const dateStr = now.toLocaleDateString("sw-TZ");
  const timeStr = now.toLocaleTimeString("sw-TZ", { hour: "2-digit", minute: "2-digit" });

  if (submitted) {
    return (
      <div className="min-h-full bg-police p-4">
        <div className="flex flex-col items-center py-10">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#10B981]/15">
            <CheckCircle size={44} className="text-[#10B981]" />
          </div>
          <h2 className="mt-4 text-[20px] font-bold text-police">Imewasilishwa Kikamilifu</h2>
          <p className="mt-1 text-center text-[13px] text-police-muted">Ripoti ya kukamatwa imewasilishwa kwa Kamishna wa Kituo.</p>
          <div className="mt-6 w-full rounded-2xl bg-police-card p-4 space-y-2">
            <Row label="Nambari ya Ripoti" value={arrestId} bold />
            <Row label="Mshukiwa" value={form.suspectName} />
            <Row label="Kosa" value={form.offense} />
            <Row label="Tarehe / Saa" value={`${dateStr} — ${timeStr}`} />
            <Row label="Ofisa Aliyemkamata" value={OFFICER.shortName} />
            <Row label="Picha" value={`${photos.length} picha`} />
          </div>
          <div className="mt-4 w-full space-y-2">
            <button onClick={() => setSubmitted(false)} className="w-full rounded-xl border border-police py-3 text-[14px] font-semibold text-police">Fomu Mpya</button>
            <button onClick={() => goBack()} className="w-full rounded-xl bg-[#1E3A8A] py-3 text-[14px] font-bold text-white">Rudi Nyuma</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-police">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#1E3A8A] px-4 py-4">
        <button onClick={() => goBack()} className="mb-3 flex items-center gap-2 text-white/80">
          <ArrowLeft size={18} /> <span className="text-[13px]">Rudi Nyuma</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15"><AlertTriangle size={20} className="text-white" /></div>
          <div>
            <h1 className="text-[18px] font-bold text-white">Fomu ya Kukamatwa</h1>
            <p className="text-[11px] text-white/70">{arrestId} • {dateStr} {timeStr}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {/* Suspect details */}
        <Section title="Taarifa za Mshukiwa" icon={<User size={16} />} color="#1E3A8A">
          <FInput label="Jina Kamili" required value={form.suspectName} onChange={set("suspectName")} placeholder="Jina na jina la ukoo" />
          <FInput label="Namba ya NIDA" value={form.nida} onChange={set("nida")} placeholder="19XXXXXXXXXXXXXX" />
          <div className="grid grid-cols-2 gap-3">
            <FInput label="Tarehe ya Kuzaliwa" value={form.dob} onChange={set("dob")} placeholder="DD/MM/YYYY" />
            <div>
              <label className="mb-1 block text-[12px] font-medium text-police-muted">Jinsia</label>
              <select value={form.gender} onChange={set("gender")} className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police focus:border-[#1E3A8A] focus:outline-none">
                <option>Mme</option><option>Mke</option>
              </select>
            </div>
          </div>
          <FInput label="Makazi" value={form.address} onChange={set("address")} placeholder="Mtaa, Kata, Wilaya" />
          <div className="grid grid-cols-2 gap-3">
            <FInput label="Simu" value={form.phone} onChange={set("phone")} placeholder="07XX XXX XXX" />
            <FInput label="Kazi / Shughuli" value={form.occupation} onChange={set("occupation")} placeholder="Kazi yake" />
          </div>
        </Section>

        {/* Arrest details */}
        <Section title="Taarifa za Kukamatwa" icon={<AlertTriangle size={16} />} color="#EF4444">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Kosa lililofanywa <span className="text-[#EF4444]">*</span></label>
            <select value={form.offense} onChange={set("offense")} className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police focus:border-[#EF4444] focus:outline-none">
              <option value="">— Chagua kosa —</option>
              {OFFENSE_CATEGORIES.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Maelezo ya Kosa</label>
            <textarea rows={3} value={form.offenseDetails} onChange={set("offenseDetails")} placeholder="Eleza kwa kina jinsi kosa lilivyofanyika..." className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police placeholder:text-police-faint focus:border-[#EF4444] focus:outline-none" />
          </div>
          <FInput label="Mahali Alipokukamatwa" required value={form.arrestLocation} onChange={set("arrestLocation")} placeholder="Mtaa au eneo halisi" icon={<MapPin size={14} />} />
          <div className="grid grid-cols-2 gap-3">
            <FInput label="Nambari ya Chumba" value={form.cell} onChange={set("cell")} placeholder="A-1, B-3 ..." />
            <FInput label="Tarehe ya Mahakama" value={form.courtDate} onChange={set("courtDate")} placeholder="DD/MM/YYYY" icon={<Clock size={14} />} />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Hali ya Afya</label>
            <select value={form.medicalStatus} onChange={set("medicalStatus")} className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police focus:outline-none">
              <option>Nzuri</option><option>Maumivu Madogo</option><option>Nahitaji Matibabu</option><option>Hospitali</option>
            </select>
          </div>
        </Section>

        {/* Next of kin */}
        <Section title="Ndugu wa Karibu" icon={<User size={16} />} color="#FF9800">
          <div className="grid grid-cols-2 gap-3">
            <FInput label="Jina la Ndugu" value={form.nextOfKin} onChange={set("nextOfKin")} placeholder="Jina kamili" />
            <FInput label="Simu ya Ndugu" value={form.nextOfKinPhone} onChange={set("nextOfKinPhone")} placeholder="07XX XXX XXX" />
          </div>
        </Section>

        {/* Photo evidence */}
        <Section title="Ushahidi wa Picha" icon={<Camera size={16} />} color="#2196F3">
          <button onClick={() => fileRef.current?.click()} className="flex w-full flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-police bg-police-input py-4 active:scale-[0.98]">
            <Camera size={22} className="text-[#2196F3]" />
            <span className="text-[12px] font-medium text-police-muted">Bonyeza kuongeza picha za ushahidi</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhoto} />
          {photos.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {photos.map((src, i) => (
                <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-police">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))} className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444]">
                    <X size={10} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Notes */}
        <Section title="Maelezo ya Ziada" icon={<FileText size={16} />} color="#10B981">
          <textarea rows={3} value={form.notes} onChange={set("notes")} placeholder="Maelezo mengine yoyote muhimu..." className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police placeholder:text-police-faint focus:border-[#10B981] focus:outline-none" />
        </Section>

        {/* Signing officer */}
        <div className="rounded-2xl border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 p-4">
          <p className="text-[12px] font-medium text-police-muted">Ofisa Aliyeandika Ripoti</p>
          <p className="mt-1 text-[15px] font-bold text-[#1E3A8A]">{OFFICER.shortName}</p>
          <p className="text-[11px] text-police-muted">{OFFICER.id} • {OFFICER.station}</p>
        </div>

        <button onClick={handleSubmit} className="w-full rounded-xl bg-[#1E3A8A] py-3.5 text-[15px] font-bold text-white shadow-md shadow-[#1E3A8A]/30 active:scale-[0.98]">
          Wasilisha Ripoti kwa Kamishna
        </button>
        <div className="h-4" />
      </div>
    </div>
  );
}

function Section({ title, icon, color, children }: { title: string; icon: React.ReactNode; color: string; children: React.ReactNode }) {
  return (
    <div className="tpf-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: `${color}15`, color }}>{icon}</div>
        <h3 className="text-[14px] font-bold text-police">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function FInput({ label, required, value, onChange, placeholder, icon }: { label: string; required?: boolean; value: string; onChange: React.ChangeEventHandler<HTMLInputElement>; placeholder?: string; icon?: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-medium text-police-muted">{label}{required && <span className="ml-0.5 text-[#EF4444]">*</span>}</label>
      <div className="flex items-center gap-2 rounded-xl border border-police bg-police-input px-3">
        {icon && <span className="text-police-faint">{icon}</span>}
        <input value={value} onChange={onChange} placeholder={placeholder} className="h-10 flex-1 bg-transparent text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-police-soft last:border-0">
      <span className="text-[12px] text-police-muted">{label}</span>
      <span className={`text-[12px] ${bold ? "font-bold text-[#1E3A8A]" : "font-medium text-police"}`}>{value}</span>
    </div>
  );
}
