"use client";
// Post Officer / Station Home Screen
// A posti (checkpoint/station post) serves ALL citizens — traffic + general duties.
// This screen exposes the FULL combined set of services:
//   Traffic: citation, vehicle inspection, PF3, driver points, accident report
//   General: incident report, arrest, bail, lost property, add citizen/vehicle, warning
//   Shared:  citizen search, vehicle search, patrol, alerts, history

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Bell, Search, X, Car, FileText, AlertTriangle, Shield, ShieldCheck,
  UserX, Package, Users, ChevronRight, AlertCircle, ClipboardList,
  MapPin, Fingerprint, CheckCircle, ScanLine,
} from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { useOfficer } from "@/hooks/use-officer";
import { getSuggestions, validateName } from "@/lib/police-helpers";
import type { ScreenId } from "@/lib/police-data";

// ── All services available at a posti — grouped by category ──────────
const SERVICE_SECTIONS = [
  {
    title: "🚗 Huduma za Trafiki",
    color: "#FF9800",
    services: [
      { label: "Toa Citation",       icon: FileText,       color: "#EF4444", screen: "citation" as ScreenId,           desc: "Faini ya trafiki" },
      { label: "Kagua Gari",         icon: Car,            color: "#2196F3", screen: "vehicle-inspection" as ScreenId,  desc: "Ukaguzi wa hali ya gari" },
      { label: "PF3 / Ajali",        icon: AlertTriangle,  color: "#FF9800", screen: "pf3" as ScreenId,                desc: "Ripoti ajali barabarani" },
      { label: "Pointi za Dereva",   icon: ShieldCheck,    color: "#8B5CF6", screen: "driver-points" as ScreenId,       desc: "Angalia/ondoa pointi" },
      { label: "Ripoti Ajali",       icon: AlertCircle,    color: "#EF4444", screen: "accident-report" as ScreenId,     desc: "Fomu ya ajali" },
      { label: "Toa Onyo",           icon: AlertCircle,    color: "#F57C00", screen: "warning-form" as ScreenId,        desc: "Onyo la trafiki/posti" },
    ],
  },
  {
    title: "👮 Huduma za Polisi wa Kawaida",
    color: "#1E3A8A",
    services: [
      { label: "Ripoti Tukio",       icon: ClipboardList,  color: "#2196F3", screen: "incident-detail" as ScreenId,    desc: "Tukio jipya la polisi" },
      { label: "Kamata Mtuhumiwa",   icon: UserX,          color: "#EF4444", screen: "arrest-form" as ScreenId,         desc: "Fomu ya kukamatwa" },
      { label: "Dhamana / Bail",     icon: Shield,         color: "#8B5CF6", screen: "bail-out" as ScreenId,            desc: "Omba dhamana" },
      { label: "Mali Iliyopotea",    icon: Package,        color: "#10B981", screen: "lost-property" as ScreenId,       desc: "Ripoti mali iliyopotea" },
      { label: "Sajili Raia",        icon: Users,          color: "#1E3A8A", screen: "add-citizen" as ScreenId,         desc: "Ongeza raia mpya" },
      { label: "Sajili Gari",        icon: Car,            color: "#059669", screen: "add-vehicle" as ScreenId,          desc: "Ongeza gari jipya" },
    ],
  },
  {
    title: "💰 Malipo & Utafutaji",
    color: "#10B981",
    services: [
      { label: "Lipa Faini",         icon: CheckCircle,    color: "#10B981", screen: "fine-payment" as ScreenId,        desc: "Lipa faini iliyotolewa" },
      { label: "Tafuta Raia",        icon: Fingerprint,    color: "#1E3A8A", screen: "citizen-search-results" as ScreenId, desc: "Jina, NIDA au simu" },
      { label: "Tafuta Gari",        icon: ScanLine,       color: "#2196F3", screen: "search-results" as ScreenId,      desc: "Namba ya gari / chassis" },
      { label: "Historia",           icon: ClipboardList,  color: "#6B7280", screen: "history" as ScreenId,             desc: "Rekodi za posti" },
    ],
  },
];

// Checkpoint status with colour
const CHECKPOINT_STATUS = [
  { label: "Wazi",              color: "#10B981" },
  { label: "Msongamano Mdogo",  color: "#FF9800" },
  { label: "Msongamano Mkubwa", color: "#EF4444" },
  { label: "Imefungwa Sehemu",  color: "#6B7280" },
] as const;

export function PostHomeScreen() {
  const { navigate, unreadAlertCount, patrolRecords, runSearch, setSearchEntity, setCitizenSearchType } = usePoliceStore();
  const OFFICER = useOfficer();

  const unread    = unreadAlertCount();
  const todayStr  = new Date().toLocaleDateString("sw-TZ");
  const timeStr   = new Date().toLocaleTimeString("sw-TZ", { hour: "2-digit", minute: "2-digit" });
  const todayPatrols = patrolRecords.filter((p) => p.date === todayStr).length;

  const [statusIdx, setStatusIdx]         = useState(0);
  const [vehiclesChecked, setVehiclesChecked] = useState(0);
  const [activeSection, setActiveSection] = useState<number | null>(null);

  // Quick search bar
  const [searchValue, setSearchValue] = useState("");
  const [searchSugg, setSearchSugg]   = useState<string[]>([]);
  const [showSugg, setShowSugg]       = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchValue.trim()) { setSearchSugg([]); return; }
    setSearchSugg(getSuggestions(searchValue, "name"));
    setShowSugg(true);
  }, [searchValue]);

  const handleSearch = () => {
    if (!searchValue.trim()) return;
    setShowSugg(false);
    setSearchEntity("person");
    setCitizenSearchType("name");
    runSearch(searchValue);
    navigate("citizen-search-results");
  };

  const status = CHECKPOINT_STATUS[statusIdx];

  return (
    <div className="min-h-full bg-police">
      {/* Header — teal/green for checkpoint */}
      <div className="bg-gradient-to-br from-[#0d4f3c] to-[#1a7a5e] px-4 pb-16 pt-2">
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-[11px] font-semibold text-white/60 uppercase tracking-wide">Afisa wa Posti</p>
            <p className="text-[17px] font-bold text-white">{OFFICER.shortName}</p>
            <p className="text-[11px] text-white/70">{OFFICER.station}{OFFICER.unit ? ` • ${OFFICER.unit}` : ""}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("alerts")} className="relative">
              <Bell size={24} className="text-white" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[9px] font-bold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
            <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-white/60">
              <Image src="/police-logo.png" alt="TPF" width={40} height={40} className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      {/* Status + stats card */}
      <div className="-mt-10 px-4 space-y-3">
        <div className="rounded-2xl bg-police-card p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-police-muted uppercase tracking-wide">Hali ya Posti</p>
              <p className="mt-1 text-[17px] font-extrabold" style={{ color: status.color }}>{status.label}</p>
              <p className="text-[10px] text-police-faint">{timeStr} • {todayStr}</p>
            </div>
            <div className="flex h-13 w-13 items-center justify-center rounded-full" style={{ backgroundColor: `${status.color}20` }}>
              <MapPin size={26} style={{ color: status.color }} />
            </div>
          </div>
          {/* Status toggle */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {CHECKPOINT_STATUS.map((s, i) => (
              <button key={s.label} onClick={() => setStatusIdx(i)}
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold border transition ${
                  statusIdx === i ? "text-white border-transparent" : "text-police-muted border-police-soft"
                }`}
                style={statusIdx === i ? { backgroundColor: s.color } : {}}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Magari Leo",   value: vehiclesChecked, color: "#2196F3", onClick: () => setVehiclesChecked(c => c + 1) },
            { label: "Patroli/Zamu", value: todayPatrols,    color: "#10B981", onClick: () => navigate("patrol") },
            { label: "Arifa",        value: unread,          color: "#EF4444", onClick: () => navigate("alerts") },
          ].map((s) => (
            <button key={s.label} onClick={s.onClick}
              className="flex flex-col items-center rounded-xl bg-police-card p-3 shadow-sm active:scale-[0.97]">
              <span className="text-[20px] font-bold" style={{ color: s.color }}>{s.value}</span>
              <span className="mt-0.5 text-center text-[9px] leading-tight text-police-muted">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Universal quick search */}
      <div className="mt-4 px-4">
        <div className="relative">
          <div className="flex items-center gap-2 rounded-2xl border border-police bg-police-card px-4 shadow-sm focus-within:border-[#0d4f3c]">
            <Search size={16} className="shrink-0 text-police-faint" />
            <input
              ref={inputRef}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              onFocus={() => searchSugg.length > 0 && setShowSugg(true)}
              onBlur={() => setTimeout(() => setShowSugg(false), 150)}
              placeholder="Tafuta raia kwa jina, NIDA au simu..."
              className="h-11 flex-1 bg-transparent text-[13px] text-police placeholder:text-police-faint focus:outline-none"
            />
            {searchValue
              ? <button onClick={() => setSearchValue("")}><X size={14} className="text-police-faint" /></button>
              : <button onClick={() => navigate("search-results")} className="text-[11px] font-semibold text-[#0d4f3c]">Gari</button>
            }
          </div>
          {showSugg && searchSugg.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-police bg-police-card shadow-lg">
              {searchSugg.map((s) => (
                <button key={s} onMouseDown={() => { setSearchValue(s); setShowSugg(false); handleSearch(); }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-police-muted">
                  <Search size={12} className="shrink-0 text-police-faint" />
                  <span className="text-[13px] text-police">{s}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ALL services — accordion by category */}
      <div className="mt-4 px-4 pb-6 space-y-3">
        <p className="text-[12px] font-bold uppercase tracking-wide text-police-muted">
          Huduma Zote za Posti
        </p>

        {SERVICE_SECTIONS.map((section, si) => (
          <div key={si} className="overflow-hidden rounded-2xl bg-police-card shadow-sm">
            {/* Section header — tap to expand/collapse */}
            <button
              className="flex w-full items-center justify-between px-4 py-3"
              onClick={() => setActiveSection(activeSection === si ? null : si)}
            >
              <span className="text-[13px] font-bold text-police">{section.title}</span>
              <ChevronRight
                size={16}
                className="text-police-faint transition-transform"
                style={{ transform: activeSection === si ? "rotate(90deg)" : "rotate(0deg)" }}
              />
            </button>

            {/* Services grid — expanded */}
            {activeSection === si && (
              <div className="grid grid-cols-2 gap-2 px-3 pb-3">
                {section.services.map((s) => (
                  <button
                    key={s.screen}
                    onClick={() => navigate(s.screen)}
                    className="flex items-center gap-3 rounded-xl border border-police-soft p-3 text-left active:scale-[0.97]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${s.color}15` }}>
                      <s.icon size={18} style={{ color: s.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-semibold text-police">{s.label}</p>
                      <p className="truncate text-[10px] text-police-faint">{s.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Collapsed preview — show first 3 icons */}
            {activeSection !== si && (
              <div className="flex items-center gap-2 px-4 pb-3">
                {section.services.slice(0, 4).map((s) => (
                  <button key={s.screen} onClick={() => navigate(s.screen)}
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${s.color}15` }}
                    title={s.label}>
                    <s.icon size={16} style={{ color: s.color }} />
                  </button>
                ))}
                {section.services.length > 4 && (
                  <span className="text-[11px] text-police-faint">+{section.services.length - 4} zaidi</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
