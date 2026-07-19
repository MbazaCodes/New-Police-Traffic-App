"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Bell, Search, X, ChevronRight, UserCheck, AlertTriangle, ShieldCheck, Package, AlertCircle } from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import {, GENERAL_INCIDENTS } from "@/lib/police-data";
import { useOfficer } from "@/hooks/use-officer";
type SearchMode = "citizen" | "serial";
type CitizenTab = "name" | "nida" | "mobile";

const CITIZEN_HINTS: Record<CitizenTab, string> = {
  name:   "Jina la kwanza na jina la ukoo: Juma Mwinyi",
  nida:   "Tarakimu 15: 199012031234567",
  mobile: "Namba ya simu: 0712 345 678",
};

const CITIZEN_PLACEHOLDERS: Record<CitizenTab, string> = {
  name: "",
  nida:   "199012031234567",
  mobile: "0712 345 678",
};

export function GeneralHomeScreen() {
  const { citizenSearchType, setCitizenSearchType, navigate, runSearch, setSearchEntity, unreadAlertCount, patrolRecords } = usePoliceStore();
  const OFFICER = useOfficer();
  const [value, setValue] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("citizen");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const unread = unreadAlertCount();
  const todayStr = new Date().toLocaleDateString("sw-TZ");
  const todayPatrols = patrolRecords.filter((p) => p.date === todayStr).length;

  const homeStats = [
    { label: "Matukio",    value: String(GENERAL_INCIDENTS.length),                             color: "#1E3A8A" },
    { label: "Makamato",   value: String(.filter((a) => a.status === "held").length), color: "#1E3A8A" },
    { label: "Maonyo",     value: String(.length),                               color: "#FF9800" },
    { label: "Patroli Leo", value: String(todayPatrols || "0"),                                 color: "#10B981" },
  ];

  useEffect(() => {
    setError("");
    if (!value.trim()) { setSuggestions([]); return; }
    let type: Parameters<typeof getSuggestions>[1] = "name";
    if (searchMode === "serial") type = "serial";
    else if (citizenSearchType === "nida") type = "nida";
    else if (citizenSearchType === "mobile") type = "mobile";
    const s = getSuggestions(value, type);
    setSuggestions(s);
    setShowSuggestions(s.length > 0);
  }, [value, searchMode, citizenSearchType]);

  const validate = (): boolean => {
    let r;
    if (searchMode === "serial") r = validateSerial(value);
    else if (citizenSearchType === "nida") r = validateNida(value);
    else if (citizenSearchType === "mobile") r = validateMobile(value);
    else r = validateName(value);
    if (!r.valid) { setError(r.error); return false; }
    setError("");
    return true;
  };

  const handleSearch = () => {
    if (!validate()) return;
    setShowSuggestions(false);
    if (searchMode === "serial") { runSearch(value); navigate("lost-property"); return; }
    setSearchEntity("person");
    runSearch(value);
    navigate("citizen-search-results");
  };

  const pickSuggestion = (s: string) => {
    setValue(s);
    setShowSuggestions(false);
    setError("");
    inputRef.current?.focus();
  };

  const switchMode = (m: SearchMode) => { setSearchMode(m); setValue(""); setError(""); setSuggestions([]); };
  const switchCitizenTab = (t: CitizenTab) => { setCitizenSearchType(t); setValue(""); setError(""); setSuggestions([]); };

  const hint = searchMode === "serial"
    ? "Mfano: SM-S928B-TZ-001 au IMEI: 358423092847001"
    : CITIZEN_HINTS[citizenSearchType as CitizenTab];

  const placeholder = searchMode === "serial"
    ? "SM-S928B-TZ-001 / 358423092847001"
    : CITIZEN_PLACEHOLDERS[citizenSearchType as CitizenTab];

  return (
    <div className="min-h-full bg-police">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1E3A8A] to-[#2196F3] px-4 pb-16 pt-2">
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-[13px] text-white/80">Karibu,</p>
            <p className="text-[17px] font-bold text-white">{OFFICER.shortName}</p>
            <p className="text-[11px] text-white/70">{OFFICER.station}</p>
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
              <Image src="/police-logo.png" alt="Avatar" width={40} height={40} className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Card */}
      <div className="-mt-10 px-4">
        <div className="flex flex-col items-center rounded-2xl bg-police-card p-5 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <div className="h-20 w-20 overflow-hidden rounded-full ring-2 ring-[#2196F3]/15">
            <Image src="/police-logo.png" alt="TPF" width={80} height={80} className="h-full w-full object-cover" />
          </div>
          <h2 className="mt-3 text-[20px] font-extrabold tracking-tight text-[#1E3A8A]">TANZANIA POLICE FORCE</h2>
          <p className="text-[13px] font-medium text-[#2196F3]">USALAMA WETU, JUKUMU LETU</p>
        </div>
      </div>

      {/* Live Stats */}
      <div className="mt-4 grid grid-cols-4 gap-2 px-4">
        {homeStats.map((s) => (
          <div key={s.label} className="flex flex-col items-center rounded-xl bg-police-card p-2.5 shadow-sm">
            <span className="text-[17px] font-bold" style={{ color: s.color }}>{s.value}</span>
            <span className="mt-0.5 text-center text-[8px] leading-tight text-police-muted">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 px-4">
        <div className="grid grid-cols-2 gap-3">
          <QA icon={<UserCheck size={26} className="text-[#2196F3]" />} bg="#2196F3" title="Tafuta Raia" subtitle="Tafuta raia kwa jina, NIDA au simu" onClick={() => navigate("citizen-search-results")} />
          <QA icon={<AlertTriangle size={26} className="text-[#EF4444]" />} bg="#EF4444" title="Ripoti Tukio" subtitle="Rekodi tukio jipya la polisi" onClick={() => navigate("incident-detail")} />
        </div>

      </div>

      {/* Search with validation */}
      <div className="mt-4 px-4 pb-6">
        <div className="rounded-2xl bg-police-card p-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
          <h3 className="flex items-center gap-2 text-[17px] font-bold text-[#1E3A8A]">
            <ShieldCheck size={20} className="text-[#2196F3]" /> Utafutaji wa Raia
          </h3>

          {/* Mode toggle */}
          <div className="mt-3 flex gap-2">
            <button onClick={() => switchMode("citizen")} className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-semibold transition ${searchMode === "citizen" ? "bg-[#2196F3] text-white" : "bg-police-muted text-police-muted"}`}>
              <UserCheck size={13} /> Raia
            </button>
            <button onClick={() => switchMode("serial")} className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-semibold transition ${searchMode === "serial" ? "bg-[#1E3A8A] text-white" : "bg-police-muted text-police-muted"}`}>
              <Package size={13} /> S/N Mali
            </button>
          </div>

          {/* Citizen sub-tabs */}
          {searchMode === "citizen" && (
            <div className="mt-2 flex gap-2">
              {(["name", "nida", "mobile"] as CitizenTab[]).map((t) => (
                <button key={t} onClick={() => switchCitizenTab(t)} className={`flex-1 rounded-lg py-1.5 text-[11px] font-semibold transition ${citizenSearchType === t ? "bg-[#2196F3] text-white" : "bg-police-muted text-police-muted"}`}>
                  {t === "name" ? "Jina" : t === "nida" ? "NIDA" : "Simu"}
                </button>
              ))}
            </div>
          )}

          {/* Hint */}
          <p className="mt-2 text-[10px] text-police-faint">{hint}</p>

          {/* Input + suggestions */}
          <div className="relative mt-2">
            <div className={`flex items-center gap-2 rounded-xl border bg-police-input px-3 transition ${error ? "border-[#EF4444]" : "border-police focus-within:border-[#2196F3]"}`}>
              <Search size={18} className={error ? "text-[#EF4444]" : "text-police-faint"} />
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder={placeholder}
                className="h-11 flex-1 bg-transparent text-[15px] font-medium text-police placeholder:text-police-faint focus:outline-none"
              />
              {value && <button onClick={() => { setValue(""); setError(""); setSuggestions([]); }} className="text-police-faint"><X size={16} /></button>}
            </div>

            {error && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <AlertCircle size={13} className="shrink-0 text-[#EF4444]" />
                <p className="text-[11px] font-medium text-[#EF4444]">{error}</p>
              </div>
            )}

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-police bg-police-card shadow-lg">
                <p className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-police-faint">Matokeo yanayowezekana</p>
                {suggestions.map((s) => (
                  <button key={s} onMouseDown={() => pickSuggestion(s)} className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-police-muted">
                    <Search size={13} className="shrink-0 text-police-faint" />
                    <span className="text-[13px] font-medium text-police">{s}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleSearch} className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[15px] font-bold text-white shadow-md active:scale-[0.98] transition ${!value.trim() ? "bg-[#2196F3]/50" : "bg-[#2196F3] shadow-[#2196F3]/30"}`}>
            <Search size={18} /> Tafuta
          </button>
        </div>
      </div>
    </div>
  );
}

function QA({ icon, bg, title, subtitle, onClick }: { icon: React.ReactNode; bg: string; title: string; subtitle: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-start rounded-2xl bg-police-card p-4 text-left shadow-[0_4px_12px_rgba(0,0,0,0.06)] active:scale-[0.98]">
      <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: `${bg}15` }}>{icon}</div>
      <div className="mt-2.5 flex w-full items-center justify-between">
        <h4 className="text-[15px] font-bold text-[#1E3A8A]">{title}</h4>
        <ChevronRight size={16} className="text-[#1E3A8A]" />
      </div>
      <p className="mt-0.5 text-[11px] leading-tight text-police-muted">{subtitle}</p>
    </button>
  );
}
