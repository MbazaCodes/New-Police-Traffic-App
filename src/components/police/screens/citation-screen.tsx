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
} from "lucide-react";
import { TopAppBar } from "../top-app-bar";
import { OFFENSE_TYPES, VEHICLE_TYPES, OFFICER } from "@/lib/police-data";
import { toast } from "@/hooks/use-toast";

export function CitationScreen() {
  const [offense, setOffense] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [offenseOpen, setOffenseOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);

  const handleSave = () =>
    toast({ title: "Imehifadhiwa", description: "Rasimu ya Citation imehifadhiwa." });
  const handleSubmit = () => {
    toast({
      title: "Citation Imetolewa",
      description: "Citation imewasilishwa na imetumwa kwa dereva.",
    });
  };

  return (
    <div className="min-h-full bg-[#F5F5F5]">
      <TopAppBar title="Toa Citation" subtitle="Jaza taarifa za kosa la trafiki" showBack />

      <div className="space-y-3 p-4 pb-8">
        {/* Citation header */}
        <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-400">Namba ya Citation</p>
            <p className="text-[15px] font-extrabold text-[#1A237E]">CT-2026-00452</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-gray-400">Afisa</p>
            <p className="text-[13px] font-semibold text-gray-700">{OFFICER.shortName}</p>
          </div>
        </div>

        {/* Section: Vehicle */}
        <Section title="Taarifa za Gari" icon={<Car size={16} />}>
          <div className="grid grid-cols-2 gap-2.5">
            <FormField label="Namba ya Usajili" placeholder="T123ABC" />
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
            <FormField label="Modeli" placeholder="Toyota Corolla" />
            <FormField label="Rangi" placeholder="Nyeupe" />
          </div>
        </Section>

        {/* Section: Driver */}
        <Section title="Taarifa za Dereva" icon={<User size={16} />}>
          <div className="grid grid-cols-2 gap-2.5">
            <FormField label="Jina Kamili" placeholder="Juma Khamis Mwinyi" full />
            <FormField label="Namba ya Leseni" placeholder="DL123456789TZ" />
            <FormField label="Namba ya Simu" placeholder="07XX XXX XXX" inputMode="tel" />
            <FormField label="Namba ya NIDA" placeholder="1990123456789" />
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
            <FormField label="Tarehe" value="15 Mei 2026" icon={<Calendar size={14} />} />
            <FormField label="Saa" value="08:15 AM" icon={<Clock size={14} />} />
            <FormField label="Eneo" placeholder="Morogoro Road, DSM" icon={<MapPin size={14} />} full />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-gray-500">
              Maelezo ya Ziada
            </label>
            <textarea
              rows={3}
              placeholder="Eleza kwa kifupi kilichotokea..."
              className="w-full rounded-xl border border-gray-200 bg-[#F9FAFB] px-3 py-2.5 text-[12px] text-gray-700 placeholder:text-gray-400 focus:border-[#1A237E] focus:outline-none"
            />
          </div>
        </Section>

        {/* Section: Fine */}
        <Section title="Faini na Malipo" icon={<Wallet size={16} />}>
          <div className="grid grid-cols-2 gap-2.5">
            <FormField label="Kiasi cha Faini" placeholder="TZS 0" icon={<Wallet size={14} />} />
            <div>
              <label className="mb-1 block text-[11px] font-medium text-gray-500">Hali ya Malipo</label>
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-[#F9FAFB] px-3">
                <span className="h-10 flex-1 text-[12px] font-semibold text-orange-500">
                  Inasubiri Malipo
                </span>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
            </div>
          </div>
        </Section>

        {/* Evidence */}
        <Section title="Ushahidi (Picha)" icon={<Camera size={16} />}>
          <button className="flex w-full flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 bg-[#F9FAFB] py-5">
            <Camera size={24} className="text-gray-300" />
            <span className="text-[12px] font-medium text-gray-500">Ongeza picha za ushahidi</span>
            <span className="text-[9px] text-gray-400">JPG, PNG (Max 10MB)</span>
          </button>
        </Section>

        {/* Submit Buttons */}
        <div className="flex gap-2.5 pt-1">
          <button
            onClick={handleSave}
            className="flex-1 rounded-xl border-2 border-[#1A237E] bg-white py-3 text-[13px] font-bold text-[#1A237E] active:scale-[0.98]"
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
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 text-[14px] font-bold text-[#1A237E]">
        <span className="text-[#1A237E]">{icon}</span>
        {title}
      </h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function FormField({
  label,
  value,
  placeholder,
  icon,
  inputMode,
  full = false,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  inputMode?: "text" | "tel" | "numeric";
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="mb-1 block text-[11px] font-medium text-gray-500">{label}</label>
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-[#F9FAFB] px-3 focus-within:border-[#1A237E]">
        {icon && <span className="text-gray-400">{icon}</span>}
        <input
          defaultValue={value}
          placeholder={placeholder}
          inputMode={inputMode}
          className="h-10 flex-1 bg-transparent text-[12px] font-medium text-gray-700 placeholder:text-gray-400 focus:outline-none"
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
      <label className="mb-1 block text-[11px] font-medium text-gray-500">{label}</label>
      <button
        onClick={onToggle}
        className="relative flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-[#F9FAFB] px-3"
      >
        <span className={`h-10 flex-1 text-left text-[12px] ${value ? "font-medium text-gray-700" : "text-gray-400"}`}>
          {value || placeholder}
        </span>
        <ChevronDown size={14} className={`text-gray-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="relative z-10 mt-1 max-h-40 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              className="block w-full px-3 py-2 text-left text-[12px] text-gray-700 hover:bg-gray-50"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
