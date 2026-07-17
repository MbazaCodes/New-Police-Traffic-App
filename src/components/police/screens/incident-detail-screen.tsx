"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Camera, X, CheckCircle, MapPin, AlertTriangle } from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { OFFICER } from "@/lib/police-data";
import { toast } from "@/hooks/use-toast";

const INCIDENT_TYPES = [
  "Mgongano wa Magari", "Ajali ya Baiskeli/Pikipiki", "Mtu Aliyegongwa",
  "Wizi wa Gari", "Ugomvi wa Barabarani", "Gari Lililokwama",
  "Tukio la Kiusalama", "Dharura ya Matibabu", "Moto", "Nyingine",
];

export function IncidentDetailScreen() {
  const { goBack, incidentPrefill, setIncidentPrefill } = usePoliceStore();
  const [submitted, setSubmitted] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    incidentType: "", severity: "medium",
    location: incidentPrefill?.citizenAddress ?? "",
    description: incidentPrefill ? `Inahusiana na raia: ${incidentPrefill.citizenName} (${incidentPrefill.citizenNida})` : "",
    casualties: "0", vehicles: "", witnesses: "", actionTaken: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const incidentId = `INC-2026-${String(1235 + Math.floor(Math.random() * 100)).padStart(4, "0")}`;
  const now = new Date();

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach((f) => {
      const r = new FileReader();
      r.onload = (ev) => { if (ev.target?.result) setPhotos((p) => [...p, ev.target!.result as string]); };
      r.readAsDataURL(f);
    });
  };

  const handleSubmit = () => {
    if (!form.incidentType || !form.location) {
      toast({ title: "Kosa", description: "Jaza aina ya tukio na mahali.", variant: "destructive" }); return;
    }
    setSubmitted(true);
    setIncidentPrefill(null);
    toast({ title: "Tukio Limeripotiwa ✓", description: `${incidentId} — Ripoti imepelekwa kwa Kamanda.` });
  };

  if (submitted) {
    return (
      <div className="min-h-full bg-police p-4">
        <div className="flex flex-col items-center py-10">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#10B981]/15"><CheckCircle size={44} className="text-[#10B981]" /></div>
          <h2 className="mt-4 text-[18px] font-bold text-police">Tukio Limeripotiwa</h2>
          <p className="mt-1 text-center text-[12px] text-police-muted">Ripoti imepelekwa. Kamanda atawasiliana nawe.</p>
          <div className="mt-6 w-full rounded-2xl bg-police-card p-4 space-y-2">
            <div className="flex justify-between py-1.5 border-b border-police-soft">
              <span className="text-[11px] text-police-muted">Nambari ya Ripoti</span>
              <span className="text-[11px] font-bold text-[#10B981]">{incidentId}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-police-soft">
              <span className="text-[11px] text-police-muted">Aina</span>
              <span className="text-[11px] font-medium text-police">{form.incidentType}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[11px] text-police-muted">Mahali</span>
              <span className="text-[11px] font-medium text-police">{form.location}</span>
            </div>
          </div>
          <div className="mt-4 w-full space-y-2">
            <button onClick={() => setSubmitted(false)} className="w-full rounded-xl border border-police py-3 text-[14px] font-semibold text-police">Ripoti Nyingine</button>
            <button onClick={() => goBack()} className="w-full rounded-xl bg-[#2563EB] py-3 text-[14px] font-bold text-white">Rudi Nyuma</button>
          </div>
        </div>
      </div>
    );
  }

  const severityMap = { low: { label: "Ndogo", color: "#10B981" }, medium: { label: "Wastani", color: "#FF9800" }, high: { label: "Kubwa", color: "#EF4444" }, critical: { label: "Hatari Sana", color: "#7C3AED" } };

  return (
    <div className="min-h-full bg-police">
      <div className="bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] px-4 py-4">
        <button onClick={() => goBack()} className="mb-3 flex items-center gap-2 text-white/80"><ArrowLeft size={18} /> <span className="text-[13px]">Rudi Nyuma</span></button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15"><AlertTriangle size={20} className="text-white" /></div>
          <div>
            <h1 className="text-[18px] font-bold text-white">Ripoti Tukio</h1>
            <p className="text-[11px] text-white/70">{incidentId} • {now.toLocaleDateString("sw-TZ")} {now.toLocaleTimeString("sw-TZ", { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="rounded-2xl bg-police-card p-4 shadow-sm space-y-3">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Aina ya Tukio <span className="text-[#EF4444]">*</span></label>
            <select value={form.incidentType} onChange={set("incidentType")} className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police focus:outline-none">
              <option value="">— Chagua aina —</option>
              {INCIDENT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Ukubwa wa Tukio</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(severityMap).map(([k, v]) => (
                <button key={k} onClick={() => setForm((f) => ({ ...f, severity: k }))} className={`rounded-lg py-2 text-[11px] font-bold border transition ${form.severity === k ? "text-white" : "bg-police-muted text-police-muted border-transparent"}`} style={form.severity === k ? { backgroundColor: v.color, borderColor: v.color } : {}}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Mahali <span className="text-[#EF4444]">*</span></label>
            <div className="flex items-center gap-2 rounded-xl border border-police bg-police-input px-3">
              <MapPin size={14} className="shrink-0 text-police-faint" />
              <input value={form.location} onChange={set("location")} placeholder="Mtaa, barabara, eneo halisi" className="h-10 flex-1 bg-transparent text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Maelezo ya Tukio</label>
            <textarea rows={3} value={form.description} onChange={set("description")} placeholder="Eleza tukio kwa undani..." className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-police-muted">Wahanga (Idadi)</label>
              <input type="number" min="0" value={form.casualties} onChange={set("casualties")} className="w-full rounded-xl border border-police bg-police-input px-3 h-10 text-[13px] text-police focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-police-muted">Magari Yaliyohusika</label>
              <input value={form.vehicles} onChange={set("vehicles")} placeholder="T123ABC, T789GHI" className="w-full rounded-xl border border-police bg-police-input px-3 h-10 text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Mashahidi</label>
            <input value={form.witnesses} onChange={set("witnesses")} placeholder="Majina na nambari za simu" className="w-full rounded-xl border border-police bg-police-input px-3 h-10 text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Hatua Zilizochukuliwa</label>
            <textarea rows={2} value={form.actionTaken} onChange={set("actionTaken")} placeholder="Hatua ulizochukua..." className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
          </div>

          {/* Photo */}
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Picha za Ushahidi</label>
            <button onClick={() => fileRef.current?.click()} className="flex w-full flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-police bg-police-input py-4">
              <Camera size={20} className="text-[#2563EB]" />
              <span className="text-[12px] font-medium text-police-muted">Ongeza picha za eneo</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhoto} />
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {photos.map((src, i) => (
                  <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-police">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))} className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#F44336]"><X size={10} className="text-white" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[#2563EB]/20 bg-[#2563EB]/5 p-4">
          <p className="text-[12px] font-medium text-police-muted">Ofisa Aliyeripoti</p>
          <p className="mt-1 text-[15px] font-bold text-[#2563EB]">{OFFICER.shortName}</p>
          <p className="text-[11px] text-police-muted">{OFFICER.id} • {OFFICER.station}</p>
        </div>

        <button onClick={handleSubmit} className="w-full rounded-xl bg-[#2563EB] py-3.5 text-[15px] font-bold text-white shadow-md active:scale-[0.98]">
          Wasilisha Ripoti kwa Kamanda
        </button>
        <div className="h-4" />
      </div>
    </div>
  );
}
