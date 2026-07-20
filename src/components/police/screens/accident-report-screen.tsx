// @ts-nocheck
"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Car,
  Users,
  FileText,
  Upload,
  FileCheck,
  ShieldAlert,
  ChevronRight,
  Send,
  Image as ImageIcon,
  Video,
  FileSpreadsheet,
  Loader2,
  UserPlus,
} from "lucide-react";
import { TopAppBar } from "../top-app-bar";
import { usePoliceStore } from "@/store/police-store";
import { useRecordsStore } from "@/store/records-store";
import { toast } from "@/hooks/use-toast";
import { DatePicker } from "@/components/police/ui/date-picker";

interface VehicleRow {
  plate: string;
  model: string;
  color: string;
  damage: string;
}

interface PersonRow {
  name: string;
  role: string;
  phone: string;
  nida?: string;
  condition: string;
}

interface EvidenceRow {
  name: string;
  size: string;
  type: "image" | "video" | "pdf";
}

// Common vehicle makes for dropdown
const VEHICLE_MAKES = [
  "Toyota Corolla", "Toyota Land Cruiser", "Toyota Hiace",
  "Suzuki Maruti", "Honda Fit", "Nissan Sunny",
  "Mitsubishi Lancer", "Isuzu Elf", "Bajaji Boxer", "Pikipiki", "Gari Lingine"
];

export function AccidentReportScreen() {
  const navigate = usePoliceStore((s) => s.navigate);
  const goBack = usePoliceStore((s) => s.goBack);
  const addAccident = useRecordsStore((s) => s.addAccident);
  const submitAccident = useRecordsStore((s) => s.submitAccident);
  
  // Date/Time state (now using date picker)
  const [accidentDate, setAccidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [accidentTime, setAccidentTime] = useState("");
  
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [hasInjuries, setHasInjuries] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [people, setPeople] = useState<PersonRow[]>([]);
  const [evidence, setEvidence] = useState<EvidenceRow[]>([]);

  // Add vehicle with make/model dropdown support
  const addVehicle = () =>
    setVehicles((prev) => [
      ...prev,
      { 
        plate: `T${Math.floor(100 + Math.random() * 900)}XXX`, 
        model: "Haijawazwa", 
        color: "—", 
        damage: "—" 
      },
    ]);

  // Update vehicle with proper data
  const updateVehicle = (index: number, field: keyof VehicleRow, value: string) => {
    setVehicles(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const addPerson = () =>
    setPeople((prev) => [
      ...prev,
      { name: "", role: "Shahidi", phone: "", condition: "Hakuna Madhara" },
    ]);

  // Update person with NIDA support
  const updatePerson = (index: number, field: keyof PersonRow, value: string) => {
    if (field === 'nida') {
      // Format NIDA
      const digits = value.replace(/\D/g, "").slice(0, 20);
      const parts = [digits.slice(0,4), digits.slice(4,8), digits.slice(8,12), digits.slice(12,16), digits.slice(16,20)];
      setPeople(prev => prev.map((p, i) => i === index ? { ...p, nida: parts.filter(Boolean).join("-") } : p));
    } else {
      setPeople(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
    }
  };

  const addEvidence = () =>
    setEvidence((prev) => [
      ...prev,
      { name: `picha_${prev.length + 1}.jpg`, size: "1.5 MB", type: "image" as const },
    ]);

  const now = new Date();
  const today = now.toLocaleDateString("sw-TZ", { day: "numeric", month: "long", year: "numeric" });
  const currentTime = accidentTime || now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const buildPayload = () => ({
    date: accidentDate ? new Date(accidentDate).toLocaleDateString("sw-TZ") : today,
    time: currentTime,
    location: location || "Eneo halisi litajazwa",
    severity: hasInjuries ? "Kubwa" : "Ndogo",
    vehicles: vehicles.map((v) => ({
      plate: v.plate,
      model: v.model,
      color: v.color,
      damage: v.damage,
    })),
    people: people.map((p) => ({
      name: p.name || "Mtu Mpya",
      role: p.role,
      phone: p.phone || "07XX XXX XXX",
      condition: p.condition,
      nida: p.nida?.replace(/\D/g, "") || "",
    })),
    description: description || "—",
    evidence: evidence.map((e) => ({ name: e.name, size: e.size, type: e.type })),
  });

  const handleSaveDraft = async () => {
    const payload = buildPayload();
    addAccident(payload);
    
    try {
      await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, status: "draft" }),
      });
      toast({ title: "Imehifadhiwa", description: "Rasimu ya ripoti ya ajali imehifadhiwa kwenye database." });
    } catch {
      toast({ title: "Imehifadhiwa", description: "Rasimu ya ripoti ya ajali imehifadhiwa kawaida." });
    }
    
    setTimeout(() => goBack(), 800);
  };

  const handleSubmit = async () => {
    if (!location.trim()) {
      toast({ title: "Eneo Linahitajika", description: "Jaza eneo la ajali", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const payload = buildPayload();
    const id = addAccident(payload);

    try {
      await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, status: "reported" }),
      });
      
      submitAccident(id);
      toast({ title: "Imetumwa ✓", description: "Ripoti ya ajali imewasilishwa kikamilifu." });
    } catch {
      submitAccident(id);
      toast({ title: "Imetumwa", description: "Ripoti ya ajali imewasilishwa (local)." });
    }

    setTimeout(() => goBack(), 800);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-full bg-police">
      <TopAppBar title="Ripoti ya Ajali" subtitle="Jaza taarifa za ajali kwa usahihi" showBack />

      <div className="space-y-3 p-4 pb-8">
        {/* Section 1: Taarifa za Msingi */}
        <Section title="Taarifa za Msingi" icon={<FileText size={16} />}>
          <div className="grid grid-cols-2 gap-2.5">
            {/* DATE PICKER instead of read-only */}
            <DatePicker
              label="Tarehe ya Ajali"
              value={accidentDate}
              onChange={setAccidentDate}
              maxDate={new Date().toISOString().split('T')[0]}
            />
            
            <div>
              <label className="mb-1 block text-[11px] font-medium text-police-muted">Saa ya Ajali</label>
              <div className="flex items-center gap-2 rounded-xl border border-police bg-police-input px-3 h-10">
                <Clock size={14} className="text-police-faint" />
                <input
                  type="time"
                  value={accidentTime}
                  onChange={(e) => setAccidentTime(e.target.value)}
                  className="flex-1 bg-transparent text-[12px] text-police focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Location - Now editable */}
          <Field label="Eneo la Ajali" icon={<MapPin size={14} />} value={location} editable onValueChange={setLocation} />
          
          <div>
            <label className="mb-1 block text-[11px] font-medium text-police-muted">
              Mahali Halisi (Maelezo ya Eneo)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Eleza mazingira ya ajali..."
              className="w-full rounded-xl border border-police bg-police-input px-3 py-2 text-[12px] text-police placeholder:text-police-faint focus:border-[#1E3A8A] focus:outline-none"
            />
          </div>
        </Section>

        {/* Section 2: Magari Husika - WITH ADD NEW SUPPORT */}
        <Section
          title="Magari Husika"
          icon={<Car size={16} />}
          count={`Jumla ya Magari: ${vehicles.length}`}
        >
          <div className="space-y-2">
            {vehicles.map((v, i) => (
              <div key={i} className="rounded-xl border border-police-soft bg-police-muted p-3">
                <div className="mb-2 flex items-center gap-2">
                  <input
                    value={v.plate}
                    onChange={(e) => updateVehicle(i, 'plate', e.target.value.toUpperCase())}
                    placeholder="Plate No."
                    className="rounded-md border border-[#1E3A8A] bg-yellow-50 px-2 py-0.5 text-[13px] font-extrabold tracking-wider text-police-navy w-28 focus:outline-none"
                  />
                  
                  {/* Make/Model dropdown or manual entry */}
                  <select
                    value={v.model}
                    onChange={(e) => updateVehicle(i, 'model', e.target.value)}
                    className="flex-1 rounded-md border border-police bg-police-input px-2 py-1 text-[11px] text-police focus:outline-none"
                  >
                    <option value="Haijawazwa">— Chagua Make —</option>
                    {VEHICLE_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                    <option value="Gari Lingine">+ Gari Lingine</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-3 gap-1.5">
                  {/* Color dropdown */}
                  <select
                    value={v.color}
                    onChange={(e) => updateVehicle(i, 'color', e.target.value)}
                    className="rounded border border-police bg-police-input px-1.5 py-1 text-[10px] text-police focus:outline-none"
                  >
                    <option value="—">Rangi</option>
                    <option value="Nyeupe">Nyeupe</option>
                    <option value="Nyeusi">Nyeusi</option>
                    <option value="Nyekundu">Nyekundu</option>
                    <option value="Bluu">Bluu</option>
                    <option value="Kijani">Kijani</option>
                  </select>
                  
                  {/* Damage level */}
                  <select
                    value={v.damage}
                    onChange={(e) => updateVehicle(i, 'damage', e.target.value)}
                    className={`rounded border border-police bg-police-input px-1.5 py-1 text-[10px] font-semibold focus:outline-none ${
                      v.damage === "Kubwa" ? "text-[#EF4444]" : "text-[#FF9800]"
                    }`}
                  >
                    <option value="—">Uharibifu</option>
                    <option value="Ndogo">Ndogo</option>
                    <option value="Kati">Kati</option>
                    <option value="Kubwa">Kubwa</option>
                  </select>
                  
                  <button
                    onClick={() => setVehicles(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-[10px] text-[#EF4444]"
                  >
                    Ondoa
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Add vehicle button with option to search/register */}
          <div className="mt-2 space-y-2">
            <button
              onClick={addVehicle}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#1E3A8A]/30 py-2.5 text-[12px] font-semibold text-police-navy active:scale-[0.98]"
            >
              <Plus size={16} /> Ongeza Gari
            </button>
            
            {vehicles.length === 0 && (
              <p className="text-[10px] text-center text-police-faint">
                Bonyeza kuongeza gari lililohusika katika ajali
              </p>
            )}
          </div>
        </Section>

        {/* Section 3: Watu Husika - WITH ADD NEW CITIZEN SUPPORT */}
        <Section title="Watu Husika" icon={<Users size={16} />} count={`Jumla ya Watu: ${people.length}`}>
          <div className="space-y-2">
            {people.map((p, i) => (
              <div key={i} className="rounded-xl border border-police-soft bg-police-muted p-3">
                <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                  <input
                    value={p.name}
                    onChange={(e) => updatePerson(i, 'name', e.target.value)}
                    placeholder="Jina kamili"
                    className="rounded border border-police bg-white px-2 py-1 text-[12px] font-medium text-police focus:outline-none"
                  />
                  
                  {/* Role dropdown */}
                  <select
                    value={p.role}
                    onChange={(e) => updatePerson(i, 'role', e.target.value)}
                    className="rounded border border-police bg-police-input px-2 py-1 text-[11px] text-police focus:outline-none"
                  >
                    <option value="Dereva">Dereva</option>
                    <option value="Abiria">Abiria</option>
                    <option value="Mwenendo">Mwenendo</option>
                    <option value="Shahidi">Shahidi</option>
                    <option value="Mpolisi">Mpolisi</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-3 gap-1.5">
                  <input
                    value={p.phone}
                    onChange={(e) => updatePerson(i, 'phone', e.target.value)}
                    placeholder="Simu"
                    inputMode="tel"
                    className="rounded border border-police bg-white px-2 py-1 text-[11px] text-police focus:outline-none"
                  />
                  
                  {/* NIDA formatted input */}
                  <input
                    value={p.nida || ""}
                    onChange={(e) => updatePerson(i, 'nida', e.target.value)}
                    placeholder="NIDA"
                    inputMode="numeric"
                    className="rounded border border-police bg-white px-2 py-1 text-[11px] font-mono text-police focus:outline-none"
                  />
                  
                  {/* Condition */}
                  <select
                    value={p.condition}
                    onChange={(e) => updatePerson(i, 'condition', e.target.value)}
                    className={`rounded border border-police bg-police-input px-1.5 py-1 text-[10px] font-semibold focus:outline-none ${
                      p.condition === "Hakuna Madhara" ? "text-[#10B981]" : "text-[#FF9800]"
                    }`}
                  >
                    <option value="Hakuna Madhara">Salama</option>
                    <option value="Madogo">Madogo</option>
                    <option value="Kubwa">Kubwa</option>
                    <option value="Kufariki">Kufariki</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={addPerson}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#1E3A8A]/30 py-2.5 text-[12px] font-semibold text-police-navy active:scale-[0.98]"
          >
            <UserPlus size={16} /> Ongeza Mtu / Shahidi
          </button>
        </Section>

        {/* Section 4: Maelezo ya Ajali */}
        <Section title="Maelezo ya Ajali" icon={<FileText size={16} />}>
          <label className="mb-1 block text-[11px] font-medium text-police-muted">
            Eleza kwa kifupi kilichotokea
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Eleza kwa kifupi kilichotokea..."
            className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[12px] leading-relaxed text-police placeholder:text-police-faint focus:border-[#1E3A8A] focus:outline-none"
          />
        </Section>

        {/* Section 5: Ushahidi */}
        <Section title="Pakia Ushahidi (Nyaraka / Picha / Video)" icon={<FileText size={16} />}>
          <p className="text-[10px] text-police-faint">Aina Zinaruhusiwa: JPG, PNG, PDF, MP4 (Max 20MB)</p>
          <div className="space-y-2">
            {evidence.map((file, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-xl border border-police-soft bg-police-muted p-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-police-card">
                  {file.type === "image" && <ImageIcon size={16} className="text-[#2196F3]" />}
                  {file.type === "video" && <Video size={16} className="text-[#1E3A8A]" />}
                  {file.type === "pdf" && <FileSpreadsheet size={16} className="text-[#EF4444]" />}
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-police">{file.name}</p>
                  <p className="text-[10px] text-police-faint">{file.size}</p>
                </div>
                <FileCheck size={16} className="text-[#10B981]" />
              </div>
            ))}
          </div>
          <button
            onClick={addEvidence}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#1E3A8A]/30 py-2.5 text-[12px] font-semibold text-police-navy active:scale-[0.98]"
          >
            <Upload size={14} /> Pakia Zaidi
          </button>
        </Section>

        {/* Section 6: Vitendo vya Ziada */}
        <Section title="Vitendo vya Ziada" icon={<ShieldAlert size={16} />}>
          <div className="flex items-center justify-between rounded-xl bg-police-muted px-3 py-2.5">
            <span className="text-[12px] font-medium text-police">Je, kulikuwa na majeruhi?</span>
            <button
              type="button"
              onClick={() => setHasInjuries(!hasInjuries)}
              className={`relative h-6 w-11 rounded-full transition ${hasInjuries ? "bg-[#10B981]" : "bg-gray-300"}`}
              aria-pressed={hasInjuries}
              aria-label="Toggle injuries"
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                  hasInjuries ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>
          <button
            onClick={() => navigate("pf3")}
            className="flex w-full items-center justify-between rounded-xl border border-[#1E3A8A]/20 px-3 py-2.5 active:scale-[0.99]"
          >
            <span className="flex items-center gap-2 text-[12px] font-semibold text-police-navy">
              <FileText size={16} /> Tengeneza Fomu PF3
            </span>
            <ChevronRight size={16} className="text-police-faint" />
          </button>
          <button
            onClick={() =>
              toast({ title: "Imetumwa", description: "Taarifa imewasilishwa kwa Kituo Kikuu." })
            }
            className="flex w-full items-center justify-between rounded-xl border border-[#1E3A8A]/20 px-3 py-2.5 active:scale-[0.99]"
          >
            <span className="flex items-center gap-2 text-[12px] font-semibold text-police-navy">
              <Send size={16} /> Taarifa kwa Kituo Kikuu
            </span>
            <ChevronRight size={16} className="text-police-faint" />
          </button>
        </Section>

        {/* Submit Buttons */}
        <div className="flex gap-2.5 pt-1">
          <button
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="flex-1 rounded-xl border-2 border-[#1E3A8A] bg-police-card py-3 text-[13px] font-bold text-police-navy active:scale-[0.98]"
          >
            Hifadhi Rasimu
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-[1.5] rounded-xl bg-[#1E3A8A] py-3 text-[13px] font-bold text-white shadow-md active:scale-[0.98] flex items-center justify-center gap-1"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
            Hifadhi na Tuma Ripoti
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
    <div className="tpf-card p-4">
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
  icon,
  value,
  editable,
  onValueChange,
}: {
  label: string;
  icon: React.ReactNode;
  value?: string;
  editable?: boolean;
  onValueChange?: (val: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-police-muted">{label}</label>
      {editable ? (
        <div className="flex items-center gap-2 rounded-xl border border-[#2196F3]/40 bg-[#2196F3]/5 px-3">
          {icon && <span className="text-police-faint">{icon}</span>}
          <input
            value={value || ""}
            onChange={(e) => onValueChange?.(e.target.value)}
            placeholder="Ingiza eneo..."
            className="h-10 flex-1 bg-transparent text-[12px] font-medium text-police placeholder:text-police-faint focus:outline-none"
          />
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-police bg-police-input px-3">
          {icon && <span className="text-police-faint">{icon}</span>}
          <span className="h-10 flex-1 text-[12px] text-police">{value || "—"}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" className="text-police-faint">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );
}
