"use client";

import { useState } from "react";
import { ArrowLeft, Car, CheckCircle, AlertCircle } from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { useOfficer } from "@/hooks/use-officer";
import { toast } from "@/hooks/use-toast";

const VEHICLE_TYPES = ["Saloon", "SUV", "Pick Up", "Minibus", "Lori", "Bajaji", "Pikipiki", "Basila"];
const INSURANCE_COS = ["Jubilee Insurance", "GA Insurance", "Strategies Insurance", "Alliance Insurance", "Heritage Insurance", "UAP Insurance", "ICEA Lion", "Madison Insurance"];
const COLORS = ["Nyeupe", "Nyeusi", "Fedha", "Nyekundu", "Bluu", "Kijani", "Kahawia", "Dhahabu", "Njano", "Pinki"];

export function AddVehicleScreen() {
  const OFFICER = useOfficer();
  const { goBack, searchQuery } = usePoliceStore();
  const [saved, setSaved] = useState(false);
  const [savedRecord, setSavedRecord] = useState<ReturnType<typeof saveNewVehicle> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    plate: searchQuery?.toUpperCase() ?? "",
    model: "", type: "Saloon", color: "Nyeupe", year: new Date().getFullYear().toString(),
    ownerName: "", ownerNida: "", ownerPhone: "", ownerLicense: "",
    insuranceCompany: "Jubilee Insurance", insurancePolicy: "", insuranceExpiry: "",
    inspectionExpiry: "", registrationExpiry: "",
    notes: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    const plateR = validatePlate(form.plate);
    if (!plateR.valid) e.plate = plateR.error;
    if (!form.model.trim()) e.model = "Jaza mfano wa gari";
    if (form.ownerNida) { const r = validateNida(form.ownerNida); if (!r.valid) e.ownerNida = r.error; }
    if (form.ownerPhone) { const r = validateMobile(form.ownerPhone); if (!r.valid) e.ownerPhone = r.error; }
    if (form.ownerLicense) { const r = validateLicense(form.ownerLicense); if (!r.valid) e.ownerLicense = r.error; }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) { toast({ title: "Rekebisha makosa", description: "Jaza sehemu zote sahihi.", variant: "destructive" }); return; }
    const rec = saveNewVehicle({
      plate: form.plate.toUpperCase(),
      model: form.model, type: form.type, color: form.color, year: form.year,
      ownerName: form.ownerName, ownerNida: form.ownerNida,
      ownerPhone: form.ownerPhone, ownerLicense: form.ownerLicense,
      station: OFFICER.station, addedBy: OFFICER.shortName,
      notes: form.notes,
    });
    setSavedRecord(rec);
    setSaved(true);
    toast({ title: "Gari Limesajiliwa ✓", description: `${rec.plate} imehifadhiwa. ID: ${rec.id}` });
  };

  if (saved && savedRecord) {
    return (
      <div className="min-h-full bg-police p-4">
        <div className="flex flex-col items-center py-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#10B981]/15">
            <CheckCircle size={44} className="text-[#10B981]" />
          </div>
          <h2 className="mt-4 text-[20px] font-bold text-police">Gari Limesajiliwa</h2>
          <p className="mt-1 text-center text-[13px] text-police-muted">Taarifa za gari zimehifadhiwa kwenye mfumo wa kituo.</p>
          <div className="mt-6 w-full rounded-2xl bg-police-card p-4 shadow-sm space-y-2.5">
            <div className="inline-block rounded-lg border-2 border-[#1E3A8A] bg-yellow-50 px-4 py-1.5 text-[20px] font-extrabold tracking-widest text-police-navy">{savedRecord.plate}</div>
            <Row label="ID ya Rekodi" value={savedRecord.id} bold />
            <Row label="Mfano" value={savedRecord.model} />
            <Row label="Mmiliki" value={savedRecord.ownerName || "Haijajulikana"} />
            <Row label="Imehifadhiwa na" value={savedRecord.addedBy} />
            <Row label="Kituo" value={savedRecord.station} />
            <Row label="Jumla ya Magari Yaliyoongezwa Leo" value={String(newVehicleRecords.length)} />
          </div>
          <div className="mt-4 w-full space-y-2">
            <button onClick={() => { setSaved(false); setForm({ plate: "", model: "", type: "Saloon", color: "Nyeupe", year: new Date().getFullYear().toString(), ownerName: "", ownerNida: "", ownerPhone: "", ownerLicense: "", insuranceCompany: "Jubilee Insurance", insurancePolicy: "", insuranceExpiry: "", inspectionExpiry: "", registrationExpiry: "", notes: "" }); setErrors({}); }} className="w-full rounded-xl border border-police py-3 text-[14px] font-semibold text-police">Sajili Gari Jingine</button>
            <button onClick={() => goBack()} className="w-full rounded-xl bg-[#1E3A8A] py-3 text-[14px] font-bold text-white">Rudi Nyuma</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-police">
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2196F3] px-4 py-4">
        <button onClick={() => goBack()} className="mb-3 flex items-center gap-2 text-white/80">
          <ArrowLeft size={18} /> <span className="text-[13px]">Rudi</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15"><Car size={20} className="text-white" /></div>
          <div>
            <h1 className="text-[18px] font-bold text-white">Sajili Gari Jipya</h1>
            <p className="text-[11px] text-white/70">Gari hili halijasajiliwa mfumoni</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 pb-8">
        {/* Vehicle info */}
        <Section title="Taarifa za Gari" color="#1E3A8A">
          <FI label="Namba ya Gari (Plate)" required value={form.plate} onChange={set("plate")} placeholder="T 001 ABC" error={errors.plate} upper />
          <FI label="Mfano (Make/Model)" required value={form.model} onChange={set("model")} placeholder="Toyota Corolla" error={errors.model} />
          <div className="grid grid-cols-2 gap-3">
            <FS label="Aina" value={form.type} onChange={set("type")} options={VEHICLE_TYPES} />
            <FS label="Rangi" value={form.color} onChange={set("color")} options={COLORS} />
          </div>
          <FI label="Mwaka" value={form.year} onChange={set("year")} placeholder="2020" />
        </Section>

        {/* Owner info */}
        <Section title="Taarifa za Mmiliki" color="#1E3A8A">
          <FI label="Jina la Mmiliki" value={form.ownerName} onChange={set("ownerName")} placeholder="Jina kamili" />
          <FI label="NIDA ya Mmiliki" value={form.ownerNida} onChange={set("ownerNida")} placeholder="199012031234567" error={errors.ownerNida} />
          <FI label="Simu ya Mmiliki" value={form.ownerPhone} onChange={set("ownerPhone")} placeholder="0712 345 678" error={errors.ownerPhone} />
          <FI label="Namba ya Leseni" value={form.ownerLicense} onChange={set("ownerLicense")} placeholder="DL001001TZ" error={errors.ownerLicense} upper />
        </Section>

        {/* Insurance */}
        <Section title="Bima na Usajili" color="#10B981">
          <FS label="Kampuni ya Bima" value={form.insuranceCompany} onChange={set("insuranceCompany")} options={INSURANCE_COS} />
          <FI label="Namba ya Polisi ya Bima" value={form.insurancePolicy} onChange={set("insurancePolicy")} placeholder="JUB-2026-00001" />
          <div className="grid grid-cols-2 gap-3">
            <FI label="Bima Inamalizika" value={form.insuranceExpiry} onChange={set("insuranceExpiry")} placeholder="31 Des 2027" />
            <FI label="Ukaguzi Unamalizika" value={form.inspectionExpiry} onChange={set("inspectionExpiry")} placeholder="31 Des 2027" />
          </div>
          <FI label="Usajili Unamalizika" value={form.registrationExpiry} onChange={set("registrationExpiry")} placeholder="31 Des 2027" />
        </Section>

        {/* Notes */}
        <Section title="Maelezo ya Ziada" color="#FF9800">
          <textarea rows={3} value={form.notes} onChange={set("notes")} placeholder="Maelezo mengine yoyote kuhusu gari hili..." className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
        </Section>

        <div className="rounded-2xl border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 p-4">
          <p className="text-[12px] font-medium text-police-muted">Afisa Anayesajili</p>
          <p className="mt-1 text-[15px] font-bold text-[#1E3A8A]">{OFFICER.shortName}</p>
          <p className="text-[11px] text-police-muted">{OFFICER.id} • {OFFICER.station}</p>
        </div>

        <button onClick={handleSave} className="w-full rounded-xl bg-[#1E3A8A] py-3.5 text-[15px] font-bold text-white shadow-md active:scale-[0.98]">
          <Car size={16} className="mr-2 inline" /> Hifadhi Taarifa za Gari
        </button>
      </div>
    </div>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="tpf-card p-4">
      <h3 className="mb-3 text-[14px] font-bold text-police" style={{ borderLeft: `3px solid ${color}`, paddingLeft: "8px" }}>{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function FI({ label, required, value, onChange, placeholder, error, upper }: { label: string; required?: boolean; value: string; onChange: React.ChangeEventHandler<HTMLInputElement>; placeholder?: string; error?: string; upper?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-medium text-police-muted">{label}{required && <span className="ml-0.5 text-[#EF4444]">*</span>}</label>
      <input value={value} onChange={onChange} placeholder={placeholder} className={`w-full rounded-xl border bg-police-input px-3 h-10 text-[13px] text-police placeholder:text-police-faint focus:outline-none ${error ? "border-[#EF4444]" : "border-police focus:border-[#1E3A8A]"} ${upper ? "uppercase" : ""}`} />
      {error && <div className="mt-1 flex items-center gap-1"><AlertCircle size={11} className="text-[#EF4444]" /><p className="text-[10px] text-[#EF4444]">{error}</p></div>}
    </div>
  );
}

function FS({ label, value, onChange, options }: { label: string; value: string; onChange: React.ChangeEventHandler<HTMLSelectElement>; options: string[] }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-medium text-police-muted">{label}</label>
      <select value={value} onChange={onChange} className="w-full rounded-xl border border-police bg-police-input px-3 h-10 text-[13px] text-police focus:outline-none">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
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
