"use client";

import { useState } from "react";
import {
  FileText,
  Car,
  User,
  Calendar,
  Clock,
  MapPin,
  Wallet,
  Save,
  Send,
  ChevronDown,
  Camera,
  UserCog,
  Info,
} from "lucide-react";
import { TopAppBar } from "../top-app-bar";
import { OFFENSE_TYPES, VEHICLE_TYPES} from "@/lib/police-data";
import { usePoliceStore } from "@/store/police-store";
import { useRecordsStore } from "@/store/records-store";
import { toast } from "@/hooks/use-toast";

export function CitationScreen() {
  const OFFICER = useOfficer();
  const prefill = usePoliceStore((s) => s.citationPrefill);
  const goBack = usePoliceStore((s) => s.goBack);
  const addCitation = useRecordsStore((s) => s.addCitation);

  const [offense, setOffense] = useState("");
  const [vehicleType, setVehicleType] = useState(prefill?.vehicleType || "");
  const [offenseOpen, setOffenseOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);

  // Driver editable fields (in case driver != owner)
  const [driverName, setDriverName] = useState(prefill?.driverName || "");
  const [driverLicense, setDriverLicense] = useState(prefill?.driverLicense || "");
  const [driverPhone, setDriverPhone] = useState(prefill?.driverPhone || "");
  const [driverNida, setDriverNida] = useState(prefill?.driverNida || "");
  const [isOwner, setIsOwner] = useState(true);
  const [notes, setNotes] = useState("");

  const hasPrefill = !!prefill;

  // Current date / time helpers
  const now = new Date();
  const today = now.toLocaleDateString("sw-TZ", { day: "numeric", month: "long", year: "numeric" });
  const currentTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const buildPayload = () => ({
    plate: prefill?.plate || "",
    offense: offense || "Haijawazwa",
    driverName: driverName || "Haijawazwa",
    driverLicense: driverLicense || "—",
    driverPhone: driverPhone || "—",
    date: today,
    time: currentTime,
    location: "Morogoro Road, DSM",
    amount: "TZS 50,000",
    officer: OFFICER.name,
    notes: notes || undefined,
  });

  const handleSave = () => {
    addCitation(buildPayload());
    toast({ title: "Imehifadhiwa", description: "Rasimu ya Citation imehifadhiwa." });
  };
  const handleSubmit = () => {
    addCitation(buildPayload());
    toast({
      title: "Citation Imetolewa",
      description: "Citation imewasilishwa na imetumwa kwa dereva.",
    });
    setTimeout(() => goBack(), 800);
  };

  return (
    <div className="min-h-full bg-police">
      <TopAppBar title="Toa Citation" subtitle="Jaza taarifa za kosa la trafiki" showBack />

      <div className="space-y-3 p-4 pb-8">
        {/* Prefill banner */}
        {hasPrefill && (
          <div className="flex items-start gap-2.5 rounded-xl border border-[#2196F3]/20 bg-[#2196F3]/5 p-3">
            <Info size={18} className="mt-0.5 shrink-0 text-[#2196F3]" />
            <div>
              <p className="text-[12px] font-bold text-police-navy">Taarifa Zimejazwa Otomatiki</p>
              <p className="text-[11px] text-police-muted">
                Taarifa za gari na dereva zimechukuliwa kutoka matokeo ya utafutaji. Badilisha taarifa za dereva kama
                si mwenye gari.
              </p>
            </div>
          </div>
        )}

        {/* Citation header */}
        <div className="flex items-center justify-between rounded-2xl bg-police-card p-4 shadow-sm">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-police-faint">Namba ya Citation</p>
            <p className="text-[15px] font-extrabold text-police-navy">CT-2026-00452</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-police-faint">Afisa</p>
            <p className="text-[13px] font-semibold text-police">{OFFICER.shortName}</p>
          </div>
        </div>

        {/* Section: Vehicle (pre-filled, read-only plate) */}
        <Section title="Taarifa za Gari" icon={<Car size={16} />}>
          <div className="grid grid-cols-2 gap-2.5">
            <FormField label="Namba ya Usajili" value={prefill?.plate || ""} readOnly />
            <Dropdown
              label="Aina ya Gari"
              value={vehicleType}
              placeholder="Chagua aina"
              options={VEHICLE_TYPES}
              open={vehicleOpen}
              onToggle={() => setVehicleOpen(!vehicleOpen)}
              onSelect={(v) => {
                setVehicleType(v);
                setVehicleOpen(false);
              }}
            />
            <FormField label="Modeli" value={prefill?.model || ""} readOnly />
            <FormField label="Rangi" value={prefill?.color || ""} readOnly />
          </div>
        </Section>

        {/* Section: Driver (editable) */}
        <Section
          title="Taarifa za Dereva"
          icon={<UserCog size={16} />}
          badge={
            <span className="rounded-full bg-[#2196F3]/10 px-2 py-0.5 text-[9px] font-bold text-[#2196F3]">
              Inaweza kuhaririwa
            </span>
          }
        >
          {/* Owner toggle */}
          <div className="flex items-center justify-between rounded-xl bg-police-muted px-3 py-2.5">
            <span className="flex items-center gap-1.5 text-[12px] font-medium text-police">
              <User size={14} className="text-[#2196F3]" />
              Dereva ni mwenye gari?
            </span>
            <button
              onClick={() => setIsOwner(!isOwner)}
              className={`relative h-6 w-11 rounded-full transition ${isOwner ? "bg-green-500" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                  isOwner ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {!isOwner && (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-2.5">
              <p className="text-[11px] font-medium text-orange-600">
                Dereva sio mwenye gari. Badilisha taarifa za dereva hapa chini.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <EditableField
              label="Jina Kamili"
              value={driverName}
              onChange={setDriverName}
              placeholder="Jina la dereva"
              full
            />
            <EditableField
              label="Namba ya Leseni"
              value={driverLicense}
              onChange={setDriverLicense}
              placeholder="DL123456789TZ"
            />
            <EditableField
              label="Namba ya Simu"
              value={driverPhone}
              onChange={setDriverPhone}
              placeholder="07XX XXX XXX"
              inputMode="tel"
            />
            <EditableField
              label="Namba ya NIDA"
              value={driverNida}
              onChange={setDriverNida}
              placeholder="1990123456789"
            />
          </div>
        </Section>

        {/* Section: Offense */}
        <Section title="Maelezo ya Kosa" icon={<FileText size={16} />}>
          <Dropdown
            label="Aina ya Kosa"
            value={offense}
            placeholder="Chagua kosa"
            options={OFFENSE_TYPES}
            open={offenseOpen}
            onToggle={() => setOffenseOpen(!offenseOpen)}
            onSelect={(v) => {
              setOffense(v);
              setOffenseOpen(false);
            }}
            full
          />
          <div className="grid grid-cols-2 gap-2.5">
            <FormField label="Tarehe" value={today} icon={<Calendar size={14} />} readOnly />
            <FormField label="Saa" value={currentTime} icon={<Clock size={14} />} readOnly />
            <FormField label="Eneo" value="Morogoro Road, DSM" icon={<MapPin size={14} />} readOnly full />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-police-muted">
              Maelezo ya Ziada
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Eleza kwa kifupi kilichotokea..."
              className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[12px] text-police placeholder:text-police-faint focus:border-[#1A237E] focus:outline-none"
            />
          </div>
        </Section>

        {/* Section: Fine */}
        <Section title="Faini na Malipo" icon={<Wallet size={16} />}>
          <div className="grid grid-cols-2 gap-2.5">
            <FormField label="Kiasi cha Faini" value="TZS 50,000" icon={<Wallet size={14} />} readOnly />
            <div>
              <label className="mb-1 block text-[11px] font-medium text-police-muted">Hali ya Malipo</label>
              <div className="flex items-center gap-2 rounded-xl border border-police bg-police-input px-3">
                <span className="h-10 flex-1 text-[12px] font-semibold text-orange-500">
                  Inasubiri Malipo
                </span>
                <ChevronDown size={14} className="text-police-faint" />
              </div>
            </div>
          </div>
        </Section>

        {/* Evidence */}
        <Section title="Ushahidi (Picha)" icon={<Camera size={16} />}>
          <button className="flex w-full flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-police bg-police-input py-5">
            <Camera size={24} className="text-police-faint" />
            <span className="text-[12px] font-medium text-police-muted">Ongeza picha za ushahidi</span>
            <span className="text-[9px] text-police-faint">JPG, PNG (Max 10MB)</span>
          </button>
        </Section>

        {/* Submit Buttons */}
        <div className="flex gap-2.5 pt-1">
          <button
            onClick={handleSave}
            className="flex-1 rounded-xl border-2 border-[#1A237E] bg-police-card py-3 text-[13px] font-bold text-police-navy active:scale-[0.98]"
          >
            <Save size={16} className="mr-1 inline" /> Hifadhi
          </button>
          <button
            onClick={handleSubmit}
            className="flex-[1.5] rounded-xl bg-[#1A237E] py-3 text-[13px] font-bold text-white shadow-md active:scale-[0.98]"
          >
            <Send size={16} className="mr-1 inline" /> Toa Citation
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  badge,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-police-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[14px] font-bold text-police-navy">
          <span className="text-police-navy">{icon}</span>
          {title}
        </h3>
        {badge}
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function FormField({
  label,
  value,
  placeholder,
  icon,
  readOnly = false,
  full = false,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  readOnly?: boolean;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="mb-1 block text-[11px] font-medium text-police-muted">{label}</label>
      <div
        className={`flex items-center gap-2 rounded-xl border border-police px-3 ${
          readOnly ? "bg-police-muted" : "bg-police-input"
        } focus-within:border-[#1A237E]`}
      >
        {icon && <span className="text-police-faint">{icon}</span>}
        <input
          defaultValue={value}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`h-10 flex-1 bg-transparent text-[12px] font-medium text-police placeholder:text-police-faint focus:outline-none ${
            readOnly ? "cursor-default" : ""
          }`}
        />
      </div>
    </div>
  );
}

function EditableField({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  full = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "text" | "tel" | "numeric";
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="mb-1 block text-[11px] font-medium text-police-muted">{label}</label>
      <div className="flex items-center gap-2 rounded-xl border-2 border-[#2196F3]/40 bg-[#2196F3]/5 px-3 focus-within:border-[#2196F3]">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          className="h-10 flex-1 bg-transparent text-[12px] font-medium text-police placeholder:text-police-faint focus:outline-none"
        />
      </div>
    </div>
  );
}

function Dropdown({
  label,
  value,
  placeholder,
  options,
  open,
  onToggle,
  onSelect,
  full = false,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  open: boolean;
  onToggle: () => void;
  onSelect: (v: string) => void;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="mb-1 block text-[11px] font-medium text-police-muted">{label}</label>
      <button
        onClick={onToggle}
        className="relative flex w-full items-center gap-2 rounded-xl border border-police bg-police-input px-3"
      >
        <span className={`h-10 flex-1 text-left text-[12px] ${value ? "font-medium text-police" : "text-police-faint"}`}>
          {value || placeholder}
        </span>
        <ChevronDown size={14} className={`text-police-faint transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="relative z-10 mt-1 max-h-40 overflow-y-auto rounded-xl border border-police bg-police-card py-1 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              className="block w-full px-3 py-2 text-left text-[12px] text-police hover:bg-police-muted"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
