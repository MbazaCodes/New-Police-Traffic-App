"use client";

import { useState } from "react";
import { ArrowLeft, User, CheckCircle, AlertCircle } from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { OFFICER } from "@/lib/police-data";
import { saveNewCitizen, validateNida, validateMobile, validateName, newCitizenRecords } from "@/lib/mock-database";
import { toast } from "@/hooks/use-toast";

const OCCUPATIONS = ["Mfanyabiashara", "Mwalimu", "Dereva", "Mhudumu wa Afya", "Mwanafunzi", "Fundi", "Mkulima", "Mfanyakazi wa Serikali", "Mwandishi", "Daktari", "Mkandarasi", "Nyingine"];

export function AddCitizenScreen() {
  const { goBack, searchQuery, citizenSearchType } = usePoliceStore();
  const [saved, setSaved] = useState(false);
  const [savedRecord, setSavedRecord] = useState<ReturnType<typeof saveNewCitizen> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill from search query based on what tab was active
  const prefillName   = citizenSearchType === "name"   ? (searchQuery ?? "") : "";
  const prefillNida   = citizenSearchType === "nida"   ? (searchQuery ?? "") : "";
  const prefillMobile = citizenSearchType === "mobile" ? (searchQuery ?? "") : "";

  const [form, setForm] = useState({
    name: prefillName, nida: prefillNida, mobile: prefillMobile,
    gender: "Mme", dob: "", address: "", occupation: "Mfanyabiashara", notes: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    const nameR = validateName(form.name);
    if (!nameR.valid) e.name = nameR.error;
    if (form.nida) { const r = validateNida(form.nida); if (!r.valid) e.nida = r.error; }
    if (form.mobile) { const r = validateMobile(form.mobile); if (!r.valid) e.mobile = r.error; }
    if (!form.address.trim()) e.address = "Jaza makazi ya raia";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) { toast({ title: "Rekebisha makosa", description: "Jaza sehemu zote sahihi.", variant: "destructive" }); return; }
    const rec = saveNewCitizen({
      name: form.name.trim(),
      nida: form.nida.trim(),
      mobile: form.mobile.trim(),
      gender: form.gender,
      dob: form.dob,
      address: form.address.trim(),
      occupation: form.occupation,
      station: OFFICER.station,
      addedBy: OFFICER.shortName,
      notes: form.notes,
    });
    setSavedRecord(rec);
    setSaved(true);
    toast({ title: "Raia Amesajiliwa ✓", description: `${rec.name} amehifadhiwa. ID: ${rec.id}` });
  };

  if (saved && savedRecord) {
    return (
      <div className="min-h-full bg-police p-4">
        <div className="flex flex-col items-center py-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#10B981]/15">
            <CheckCircle size={44} className="text-[#10B981]" />
          </div>
          <h2 className="mt-4 text-[20px] font-bold text-police">Raia Amesajiliwa</h2>
          <p className="mt-1 text-center text-[13px] text-police-muted">Taarifa za raia zimehifadhiwa kwenye mfumo wa kituo.</p>
          <div className="mt-6 w-full rounded-2xl bg-police-card p-4 shadow-sm space-y-2.5">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-[#1E3A8A]/10 text-[22px] font-bold text-[#1E3A8A]">
              {savedRecord.name.charAt(0)}
            </div>
            <Row label="ID ya Rekodi" value={savedRecord.id} bold />
            <Row label="Jina" value={savedRecord.name} />
            <Row label="NIDA" value={savedRecord.nida || "Haijaingizwa"} />
            <Row label="Simu" value={savedRecord.mobile || "Haijaingizwa"} />
            <Row label="Makazi" value={savedRecord.address} />
            <Row label="Imehifadhiwa na" value={savedRecord.addedBy} />
            <Row label="Jumla ya Raia Waliooongezwa" value={String(newCitizenRecords.length)} />
          </div>
          <div className="mt-4 w-full space-y-2">
            <button onClick={() => { setSaved(false); setForm({ name: "", nida: "", mobile: "", gender: "Mme", dob: "", address: "", occupation: "Mfanyabiashara", notes: "" }); setErrors({}); }} className="w-full rounded-xl border border-police py-3 text-[14px] font-semibold text-police">Sajili Raia Mwingine</button>
            <button onClick={() => goBack()} className="w-full rounded-xl bg-[#1E3A8A] py-3 text-[14px] font-bold text-white">Rudi Nyuma</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-police">
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-4 py-4">
        <button onClick={() => goBack()} className="mb-3 flex items-center gap-2 text-white/80">
          <ArrowLeft size={18} /> <span className="text-[13px]">Rudi</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15"><User size={20} className="text-white" /></div>
          <div>
            <h1 className="text-[18px] font-bold text-white">Sajili Raia Mpya</h1>
            <p className="text-[11px] text-white/70">Mtu huyu hayupo kwenye mfumo</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 pb-8">
        {/* Personal info */}
        <div className="rounded-2xl bg-police-card p-4 shadow-sm space-y-3">
          <h3 className="text-[14px] font-bold text-police" style={{ borderLeft: "3px solid #1E3A8A", paddingLeft: "8px" }}>Taarifa Binafsi</h3>
          <FI label="Jina Kamili" required value={form.name} onChange={set("name")} placeholder="Jina na jina la ukoo" error={errors.name} />
          <FI label="Namba ya NIDA" value={form.nida} onChange={set("nida")} placeholder="199012031234567" error={errors.nida} />
          <FI label="Namba ya Simu" value={form.mobile} onChange={set("mobile")} placeholder="0712 345 678" error={errors.mobile} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-police-muted">Jinsia</label>
              <select value={form.gender} onChange={set("gender")} className="w-full rounded-xl border border-police bg-police-input px-3 h-10 text-[13px] text-police focus:outline-none">
                <option value="Mme">Mme</option>
                <option value="Mke">Mke</option>
              </select>
            </div>
            <FI label="Tarehe ya Kuzaliwa" value={form.dob} onChange={set("dob")} placeholder="01 Jan 1990" />
          </div>
          <FI label="Makazi" required value={form.address} onChange={set("address")} placeholder="Mtaa, Kata, Wilaya, Mkoa" error={errors.address} />
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Kazi / Shughuli</label>
            <select value={form.occupation} onChange={set("occupation")} className="w-full rounded-xl border border-police bg-police-input px-3 h-10 text-[13px] text-police focus:outline-none">
              {OCCUPATIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Maelezo / Madokezo</label>
            <textarea rows={3} value={form.notes} onChange={set("notes")} placeholder="Maelezo ya ziada kuhusu raia huyu..." className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
          </div>
        </div>

        {/* Required fields notice */}
        <div className="flex items-start gap-2.5 rounded-2xl border border-[#FF9800]/30 bg-[#FF9800]/5 p-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-[#FF9800]" />
          <div>
            <p className="text-[12px] font-bold text-[#FF9800]">Muhimu</p>
            <p className="text-[11px] text-police-muted">Jina kamili na makazi ni lazima. NIDA na simu ni bora kuwa nazo lakini si lazima.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 p-4">
          <p className="text-[12px] font-medium text-police-muted">Afisa Anayesajili</p>
          <p className="mt-1 text-[15px] font-bold text-[#1E3A8A]">{OFFICER.shortName}</p>
          <p className="text-[11px] text-police-muted">{OFFICER.id} • {OFFICER.station}</p>
        </div>

        <button onClick={handleSave} className="w-full rounded-xl bg-[#1E3A8A] py-3.5 text-[15px] font-bold text-white shadow-md active:scale-[0.98]">
          <User size={16} className="mr-2 inline" /> Hifadhi Taarifa za Raia
        </button>
      </div>
    </div>
  );
}

function FI({ label, required, value, onChange, placeholder, error }: { label: string; required?: boolean; value: string; onChange: React.ChangeEventHandler<HTMLInputElement>; placeholder?: string; error?: string }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-medium text-police-muted">{label}{required && <span className="ml-0.5 text-[#EF4444]">*</span>}</label>
      <input value={value} onChange={onChange} placeholder={placeholder} className={`w-full rounded-xl border bg-police-input px-3 h-10 text-[13px] text-police placeholder:text-police-faint focus:outline-none ${error ? "border-[#EF4444]" : "border-police focus:border-[#1E3A8A]"}`} />
      {error && <div className="mt-1 flex items-center gap-1"><AlertCircle size={11} className="text-[#EF4444]" /><p className="text-[10px] text-[#EF4444]">{error}</p></div>}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between py-1 border-b border-police-soft last:border-0">
      <span className="text-[12px] text-police-muted">{label}</span>
      <span className={`text-[12px] ${bold ? "font-bold text-[#10B981]" : "font-medium text-police"}`}>{value}</span>
    </div>
  );
}
