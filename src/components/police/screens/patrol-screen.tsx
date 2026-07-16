"use client";

import { Calendar, Clock, MapPin, Target, Cloud, Play, Shield, Route } from "lucide-react";
import { TopAppBar } from "../top-app-bar";
import { PATROL_STATS } from "@/lib/police-data";
import { toast } from "@/hooks/use-toast";

export function PatrolScreen() {
  return (
    <div className="min-h-full bg-police">
      <TopAppBar title="Patroli" subtitle="Fanya doria, rekodi na ripoti matukio" />

      <div className="space-y-4 p-4">
        {/* Hero gradient card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2196F3] to-[#1976D2] p-5 shadow-lg">
          {/* Dashed path decoration */}
          <svg className="absolute right-2 top-2 h-24 w-24 opacity-30" viewBox="0 0 100 100" fill="none">
            <path d="M10,80 Q30,20 50,50 T90,30" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="10" cy="80" r="4" fill="#4CAF50" />
            <circle cx="50" cy="50" r="4" fill="white" />
            <circle cx="90" cy="30" r="4" fill="#FF9800" />
          </svg>

          <h3 className="max-w-[70%] text-[18px] font-bold leading-tight text-white">
            Anza kurekodi patroli yako mpya
          </h3>
          <p className="mt-1.5 max-w-[80%] text-[12px] leading-snug text-white/85">
            Bonyeza kitufe hapa chini kuanza doria yako na kurekodi shughuli.
          </p>
          <button
            onClick={() =>
              toast({ title: "Patroli Imeanza", description: "Kurekodi patroli yako imeanza." })
            }
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-police-card px-5 py-2.5 text-[14px] font-bold text-[#1976D2] shadow-md active:scale-[0.97]"
          >
            <Play size={16} fill="#1976D2" />
            Anza Patroli
          </button>
        </div>

        {/* Patrol Info Cards */}
        <div className="grid grid-cols-3 gap-2">
          {PATROL_STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center rounded-xl bg-police-card p-3 shadow-sm">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: `${stat.color}18` }}
              >
                <StatIcon name={stat.icon} color={stat.color} />
              </div>
              <span className="mt-2 text-[20px] font-bold leading-none text-police-navy">
                {stat.value}
              </span>
              <span className="mt-1 text-center text-[10px] leading-tight text-police-muted">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Patrol Report Form */}
        <div className="rounded-2xl bg-police-card p-4 shadow-sm">
          <h3 className="text-[16px] font-bold text-police-navy">Patrol Report</h3>
          <p className="mb-3 text-[11px] text-police-muted">Jaza taarifa za patroli yako ya leo</p>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Tarehe" icon={<Calendar size={16} />} value="15 Mei 2026" />
              <FormField label="Kuanza Saa" icon={<Clock size={16} />} value="07:30" />
            </div>
            <FormField label="Maliza Saa" icon={<Clock size={16} />} value="08:15" />
            <FormField label="Eneo / Kanda" icon={<MapPin size={16} />} value="Chagua eneo / kanda" placeholder />
            <FormField label="Lengo la Patroli" icon={<Target size={16} />} value="Chagua lengo la patroli" placeholder />

            <div>
              <label className="mb-1 block text-[12px] font-medium text-police-muted">Maelezo ya Patroli</label>
              <textarea
                rows={3}
                placeholder="Eleza kwa kifupi shughuli uliozifanya..."
                className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police placeholder:text-police-faint focus:border-[#2196F3] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-medium text-police-muted">Matukio Yaliyobainika</label>
              <textarea
                rows={3}
                placeholder="Eleza matukio yoyote yaliyobainika..."
                className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police placeholder:text-police-faint focus:border-[#2196F3] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-medium text-police-muted">Picha (Hiari)</label>
              <button className="flex w-full flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-police bg-police-input py-5">
                <Cloud size={24} className="text-[#2196F3]" />
                <span className="text-[12px] font-medium text-police-muted">Ongeza picha</span>
              </button>
            </div>

            <button
              onClick={() =>
                toast({ title: "Imehifadhiwa", description: "Ripoti ya patroli imehifadhiwa kikamilifu." })
              }
              className="w-full rounded-xl bg-[#2196F3] py-3 text-[15px] font-bold text-white shadow-md shadow-[#2196F3]/30 active:scale-[0.98]"
            >
              Hifadhi Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatIcon({ name, color }: { name: string; color: string }) {
  if (name === "shield") return <Shield size={18} className="" style={{ color }} />;
  if (name === "map-pin") return <MapPin size={18} className="" style={{ color }} />;
  if (name === "clock") return <Clock size={18} className="" style={{ color }} />;
  if (name === "route") return <Route size={18} className="" style={{ color }} />;
  return <MapPin size={18} className="" style={{ color }} />;
}

function FormField({
  label,
  icon,
  value,
  placeholder = false,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  placeholder?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-medium text-police-muted">{label}</label>
      <div className="flex items-center gap-2 rounded-xl border border-police bg-police-input px-3">
        <span className="text-police-faint">{icon}</span>
        <span className={`h-11 flex-1 text-[13px] ${placeholder ? "text-police-faint" : "text-police"}`}>
          {value}
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" className="text-police-faint">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
