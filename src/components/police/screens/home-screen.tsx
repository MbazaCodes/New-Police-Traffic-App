"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Bell, Search, Camera, ScanLine, ChevronRight, X, AlertCircle } from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import {, PATROL_STATS } from "@/lib/police-data";
import { useOfficer } from "@/hooks/use-officer";
import { PoliceIcon } from "../police-icons";
type Tab = "plate" | "license" | "nida";

const TABS: { id: Tab; label: string }[] = [
  { id: "plate",   label: "Namba Gari" },
  { id: "license", label: "Leseni" },
  { id: "nida",    label: "NIDA" },
];

const PLACEHOLDERS: Record<Tab, string> = {
  plate:   "T 001 ABC",
  license: "DL001001TZ",
  nida:    "199012031234567",
};

const HINT_LABELS: Record<Tab, string> = {
  plate:   "Mfano: T 001 ABC au T001ABC",
  license: "Mfano: DL001001TZ",
  nida:    "Tarakimu 15: 199012031234567",
};

export function HomeScreen() {
  const { searchTab, setSearchTab, navigate, openScanner, runSearch, setSearchEntity, setSelectedOffense, unreadAlertCount, patrolRecords } = usePoliceStore();
  const OFFICER = useOfficer();
  const tab = searchTab as Tab;
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const unread = unreadAlertCount();
  const todayStr = new Date().toLocaleDateString("sw-TZ");
  const todayPatrols = patrolRecords.filter((p) => p.date === todayStr).length;
  const unpaidCount  =.filter((c) => c.status === "Hajalipwa").length;
  const arrestsCount =.filter((a) => a.status === "held").length;

  const homeStats = [
    { label: "Makosa Yangu", value: String(.length), color: "#1E3A8A" },
    { label: "Haijalipwa",   value: String(unpaidCount),             color: "#EF4444" },
    { label: "Kizuizini",    value: String(arrestsCount),            color: "#1E3A8A" },
    { label: "Patroli Leo",  value: String(todayPatrols || PATROL_STATS[0].value), color: "#10B981" },
  ];

  // Validate on change
  useEffect(() => {
    setError("");
    if (!value.trim()) { setSuggestions([]); return; }
    // Live suggestions
    const type = tab === "plate" ? "plate" : tab === "license" ? "license" : "nida";
    const s = getSuggestions(value, type);
    setSuggestions(s);
    setShowSuggestions(s.length > 0);
  }, [value, tab]);

  const validate = (): boolean => {
    let r;
    if (tab === "plate")   r = validatePlate(value);
    else if (tab === "license") r = validateLicense(value);
    else r = validateNida(value);
    if (!r.valid) { setError(r.error); return false; }
    setError("");
    return true;
  };

  const handleSearch = () => {
    if (!validate()) return;
    setShowSuggestions(false);
    if (tab === "nida") {
      setSearchEntity("person");
      runSearch(value);
      navigate("citizen-search-results");
    } else {
      setSearchEntity("car");
      runSearch(value);
      navigate("search-results");
    }
  };

  const pickSuggestion = (s: string) => {
    setValue(s);
    setShowSuggestions(false);
    setError("");
    inputRef.current?.focus();
  };

  const switchTab = (t: Tab) => {
    setSearchTab(t);
    setValue("");
    setError("");
    setSuggestions([]);
  };

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

      {/* Stats */}
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
          <QA icon={<Camera size={26} className="text-[#2196F3]" />} bg="#2196F3" title="Soma Nambari" subtitle="Tumia kamera kusoma namba ya gari" onClick={() => openScanner("ocr")} />
          <QA icon={<ScanLine size={26} className="text-[#10B981]" />} bg="#10B981" title="Scan QR" subtitle="Changanya QR code ya hati au namba" onClick={() => openScanner("qr")} />
        </div>

      </div>

      {/* Search with validation */}
      <div className="mt-4 px-4">
        <div className="rounded-2xl bg-police-card p-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
          <h3 className="text-[17px] font-bold text-[#1E3A8A]">Utafutaji wa Haraka</h3>

          {/* Tabs */}
          <div className="mt-3 flex gap-1.5">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => switchTab(t.id)} className={`flex-1 rounded-lg py-2 text-[11px] font-semibold transition ${tab === t.id ? "bg-[#2196F3] text-white" : "bg-police-muted text-police-muted"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Hint */}
          <p className="mt-2 text-[10px] text-police-faint">{HINT_LABELS[tab]}</p>

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
                placeholder={PLACEHOLDERS[tab]}
                className="h-11 flex-1 bg-transparent text-[15px] font-medium text-police placeholder:text-police-faint focus:outline-none uppercase"
              />
              {value && (
                <button onClick={() => { setValue(""); setError(""); setSuggestions([]); }} className="text-police-faint">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <AlertCircle size={13} className="shrink-0 text-[#EF4444]" />
                <p className="text-[11px] font-medium text-[#EF4444]">{error}</p>
              </div>
            )}

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-police bg-police-card shadow-lg">
                <p className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-police-faint">Matokeo yanayowezekana</p>
                {suggestions.map((s) => (
                  <button key={s} onMouseDown={() => pickSuggestion(s)} className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-police-muted active:bg-police-muted">
                    <Search size={13} className="shrink-0 text-police-faint" />
                    <span className="text-[13px] font-medium text-police">{s}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSearch}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[15px] font-bold text-white shadow-md active:scale-[0.98] transition ${!value.trim() ? "bg-[#2196F3]/50" : "bg-[#2196F3] shadow-[#2196F3]/30"}`}
          >
            <Search size={18} /> Tafuta
          </button>
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="mt-4 px-4 pb-6">
        <div className="tpf-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-police">Matukio ya Karibuni</h3>
            <button onClick={() => navigate("history")} className="text-[13px] font-medium text-[#2196F3]">Angalia Zote</button>
          </div>
          {.length === 0 ? (
            <p className="py-4 text-center text-[13px] text-police-muted">Hakuna matukio ya kuonyesha.</p>
          ) : (
            <div className="space-y-2.5">
              {.slice(0, 3).map((o) => (
                <button key={o.id} onClick={() => { setSelectedOffense(o.id); navigate("offense-detail"); }} className="flex w-full items-center gap-3 rounded-xl border border-police-soft p-2.5 text-left active:scale-[0.99]">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${o.iconColor}18` }}>
                    <PoliceIcon name={o.icon} size={20} className="" style={{ color: o.iconColor }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[13px] font-bold text-police">{o.name}</p>
                      <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ backgroundColor: o.statusColor }}>{o.status}</span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-police-muted">{o.date} • {o.location}</p>
                    <p className="mt-0.5 text-[11px] font-bold text-police">{o.fine}</p>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-police-faint" />
                </button>
              ))}
            </div>
          )}
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
