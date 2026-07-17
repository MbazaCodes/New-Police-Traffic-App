"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Camera, X, CheckCircle, AlertTriangle } from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { OFFICER } from "@/lib/police-data";
import { toast } from "@/hooks/use-toast";

const WARNING_OFFENSES = [
  "Kasi kidogo zaidi ya kiwango", "Tabia mbaya barabarani", "Kuvuka mstari mdogo",
  "Kutumia simu — onyo la kwanza", "Tabia mbaya kwa afisa", "Kuendesha gari vibaya",
  "Kutopiga mwangaza usiku", "Kelele za gari kupita kiasi",
];

export function WarningFormScreen() {
  const { goBack, warningPrefill, setWarningPrefill } = usePoliceStore();
  const [submitted, setSubmitted] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    recipientName: warningPrefill?.recipientName ?? "", plate: warningPrefill?.plate ?? "", licenseNo: warningPrefill?.licenseNo ?? "", offense: "",
    warningType: "traffic", location: "", notes: "", acknowledged: false,
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const warnId = `WR-2026-${String(113 + Math.floor(Math.random() * 50)).padStart(4, "0")}`;
  const now = new Date();
  const dateStr = now.toLocaleDateString("sw-TZ");
  const timeStr = now.toLocaleTimeString("sw-TZ", { hour: "2-digit", minute: "2-digit" });

  const handleSubmit = () => {
    if (!form.recipientName || !form.offense) {
      toast({ title: "Kosa", description: "Jaza jina na kosa.", variant: "destructive" }); return;
    }
    setSubmitted(true);
    setWarningPrefill(null);
    toast({ title: "Onyo Limetolewa ✓", description: `Onyo kwa ${form.recipientName} limesajiliwa.` });
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach((f) => {
      const r = new FileReader();
      r.onload = (ev) => { if (ev.target?.result) setPhotos((p) => [...p, ev.target!.result as string]); };
      r.readAsDataURL(f);
    });
  };

  if (submitted) {
    return (
      <div className="min-h-full bg-police p-4">
        <div className="flex flex-col items-center py-10">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FF9800]/15">
            <CheckCircle size={44} className="text-[#FF9800]" />
          </div>
          <h2 className="mt-4 text-[20px] font-bold text-police">Onyo Limetolewa</h2>
          <p className="mt-1 text-center text-[13px] text-police-muted">Fomu ya onyo imesajiliwa kikamilifu.</p>
          <div className="mt-6 w-full rounded-2xl bg-police-card p-4 space-y-2">
            <Row label="Nambari ya Onyo" value={warnId} bold />
            <Row label="Aliyepewa Onyo" value={form.recipientName} />
            <Row label="Gari" value={form.plate || "—"} />
            <Row label="Kosa" value={form.offense} />
            <Row label="Ofisa" value={OFFICER.shortName} />
          </div>
          <div className="mt-4 w-full space-y-2">
            <button onClick={() => setSubmitted(false)} className="w-full rounded-xl border border-police py-3 text-[14px] font-semibold text-police">Onyo Jingine</button>
            <button onClick={() => goBack()} className="w-full rounded-xl bg-[#FF9800] py-3 text-[14px] font-bold text-white">Rudi Nyuma</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-police">
      <div className="bg-gradient-to-r from-[#FF9800] to-[#F57C00] px-4 py-4">
        <button onClick={() => goBack()} className="mb-3 flex items-center gap-2 text-white/80">
          <ArrowLeft size={18} /> <span className="text-[13px]">Rudi Nyuma</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15"><AlertTriangle size={20} className="text-white" /></div>
          <div>
            <h1 className="text-[18px] font-bold text-white">Fomu ya Onyo</h1>
            <p className="text-[11px] text-white/70">{warnId} • {dateStr} {timeStr}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="rounded-2xl bg-police-card p-4 shadow-sm space-y-3">
          <h3 className="text-[14px] font-bold text-police">Taarifa za Mpokeaji</h3>
          <FInput label="Jina Kamili" required value={form.recipientName} onChange={set("recipientName")} placeholder="Jina la mpokeaji wa onyo" />
          <div className="grid grid-cols-2 gap-3">
            <FInput label="Namba ya Gari" value={form.plate} onChange={set("plate")} placeholder="T123ABC" />
            <FInput label="Namba ya Leseni" value={form.licenseNo} onChange={set("licenseNo")} placeholder="DL..." />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Aina ya Onyo</label>
            <select value={form.warningType} onChange={set("warningType")} className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police focus:outline-none">
              <option value="traffic">Trafiki</option>
              <option value="conduct">Tabia</option>
              <option value="verbal">Onyo la Mdomo</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Kosa <span className="text-[#EF4444]">*</span></label>
            <select value={form.offense} onChange={set("offense")} className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police focus:outline-none">
              <option value="">— Chagua kosa —</option>
              {WARNING_OFFENSES.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <FInput label="Mahali" required value={form.location} onChange={set("location")} placeholder="Mtaa au eneo halisi" />
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Maelezo / Madokezo</label>
            <textarea rows={3} value={form.notes} onChange={set("notes")} placeholder="Maelezo ya ziada..." className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
          </div>

          {/* Photo evidence */}
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Picha / Ushahidi</label>
            <button onClick={() => fileRef.current?.click()} className="flex w-full flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-police bg-police-input py-4">
              <Camera size={20} className="text-[#FF9800]" />
              <span className="text-[12px] font-medium text-police-muted">Ongeza picha za ushahidi</span>
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

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.acknowledged} onChange={(e) => setForm((f) => ({ ...f, acknowledged: e.target.checked }))} className="h-4 w-4 rounded accent-[#FF9800]" />
            <span className="text-[12px] text-police-muted">Mpokeaji amekubaliana na onyo hili</span>
          </label>
        </div>

        <div className="rounded-2xl border border-[#FF9800]/20 bg-[#FF9800]/5 p-4">
          <p className="text-[12px] font-medium text-police-muted">Ofisa Aliyetoa Onyo</p>
          <p className="mt-1 text-[15px] font-bold text-[#FF9800]">{OFFICER.shortName}</p>
          <p className="text-[11px] text-police-muted">{OFFICER.id} • {OFFICER.station}</p>
        </div>

        <button onClick={handleSubmit} className="w-full rounded-xl bg-[#FF9800] py-3.5 text-[15px] font-bold text-white shadow-md shadow-[#FF9800]/30 active:scale-[0.98]">
          Hifadhi Onyo
        </button>
        <div className="h-4" />
      </div>
    </div>
  );
}

function FInput({ label, required, value, onChange, placeholder }: { label: string; required?: boolean; value: string; onChange: React.ChangeEventHandler<HTMLInputElement>; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-medium text-police-muted">{label}{required && <span className="ml-0.5 text-[#EF4444]">*</span>}</label>
      <input value={value} onChange={onChange} placeholder={placeholder} className="w-full rounded-xl border border-police bg-police-input px-3 h-10 text-[13px] text-police placeholder:text-police-faint focus:border-[#FF9800] focus:outline-none" />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-police-soft last:border-0">
      <span className="text-[12px] text-police-muted">{label}</span>
      <span className={`text-[12px] ${bold ? "font-bold text-[#FF9800]" : "font-medium text-police"}`}>{value}</span>
    </div>
  );
}
