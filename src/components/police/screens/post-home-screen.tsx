"use client";
// Post Officer Home Screen
// Post Officers man checkpoints/posts — they check vehicles, verify documents,
// issue citations (traffic), conduct searches, and log checkpoint activity.
// They share Traffic screens (citation, vehicle inspection, PF3) but have
// their own home dashboard focused on checkpoint operations.

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Bell, Search, X, Car, ClipboardList, ShieldCheck, AlertTriangle,
         FileText, Eye, CheckCircle, ChevronRight, AlertCircle } from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { useOfficer } from "@/hooks/use-officer";
import { getSuggestions, validateSerial, validateNida, validateMobile, validateName } from "@/lib/police-helpers";

// Post-specific quick actions (checkpoint focus)
const POST_QUICK_ACTIONS = [
  { label: "Kagua Gari",        icon: Car,           color: "#2196F3", screen: "vehicle-inspection", desc: "Angalia hali ya gari" },
  { label: "Toa Citation",      icon: FileText,      color: "#EF4444", screen: "citation",           desc: "Toa faini ya trafiki" },
  { label: "PF3 / Ajali",       icon: AlertTriangle, color: "#FF9800", screen: "pf3",                desc: "Ripoti ajali barabarani" },
  { label: "Toa Onyo",          icon: AlertCircle,   color: "#F57C00", screen: "warning-form",       desc: "Onyo la trafiki kwa dereva" },
  { label: "Tafuta Gari/Raia",  icon: Search,        color: "#1E3A8A", screen: "search-results",     desc: "Angalia kumbukumbu" },
  { label: "Angalia Ripoti",    icon: ClipboardList,  color: "#10B981", screen: "history",            desc: "Historia ya posti" },
];

// Checkpoint status options
const CHECKPOINT_STATUS = ["Wazi", "Msongamano Mdogo", "Msongamano Mkubwa", "Imefungwa Sehemu"] as const;

type SearchTab = "vehicle" | "citizen";

export function PostHomeScreen() {
  const { navigate, unreadAlertCount, patrolRecords } = usePoliceStore();
  const OFFICER = useOfficer();

  const unread    = unreadAlertCount();
  const todayStr  = new Date().toLocaleDateString("sw-TZ");
  const timeStr   = new Date().toLocaleTimeString("sw-TZ", { hour: "2-digit", minute: "2-digit" });
  const todayPatrols = patrolRecords.filter((p) => p.date === todayStr).length;

  const [checkpointStatus, setCheckpointStatus] = useState<(typeof CHECKPOINT_STATUS)[number]>("Wazi");
  const [vehiclesChecked,   setVehiclesChecked]  = useState(0);
  const [citationsIssued,   setCitationsIssued]  = useState(0);

  // Quick search
  const [tab,   setTab]   = useState<SearchTab>("vehicle");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSugg, setShowSugg] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { runSearch, setSearchEntity, setCitizenSearchType, searchTab, setSearchTab } = usePoliceStore();

  useEffect(() => {
    setError("");
    if (!value.trim()) { setSuggestions([]); return; }
    const type = tab === "vehicle" ? "serial" : "name";
    const s = getSuggestions(value, type as Parameters<typeof getSuggestions>[1]);
    setSuggestions(s);
    setShowSugg(s.length > 0);
  }, [value, tab]);

  const handleSearch = () => {
    if (!value.trim()) { setError("Jaza namba au jina"); return; }
    setShowSugg(false);
    if (tab === "vehicle") {
      setSearchTab("plate");
      runSearch(value);
      navigate("search-results");
    } else {
      setSearchEntity("person");
      setCitizenSearchType("name");
      runSearch(value);
      navigate("citizen-search-results");
    }
  };

  const statusColor: Record<(typeof CHECKPOINT_STATUS)[number], string> = {
    "Wazi": "#10B981",
    "Msongamano Mdogo": "#FF9800",
    "Msongamano Mkubwa": "#EF4444",
    "Imefungwa Sehemu": "#6B7280",
  };

  return (
    <div className="min-h-full bg-police">
      {/* Header — green tones for Post/Checkpoint */}
      <div className="bg-gradient-to-br from-[#0d4f3c] to-[#1a7a5e] px-4 pb-16 pt-2">
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-[13px] text-white/80">Posti ya Ukaguzi</p>
            <p className="text-[17px] font-bold text-white">{OFFICER.shortName}</p>
            <p className="text-[11px] text-white/70">{OFFICER.station} • {OFFICER.unit || "Posti"}</p>
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

      {/* Hero card */}
      <div className="-mt-10 px-4">
        <div className="rounded-2xl bg-police-card p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] font-semibold text-police-muted">Hali ya Posti Sasa</p>
              <p className="mt-1 text-[18px] font-extrabold" style={{ color: statusColor[checkpointStatus] }}>
                {checkpointStatus}
              </p>
              <p className="text-[11px] text-police-faint mt-0.5">{timeStr} • {todayStr}</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: `${statusColor[checkpointStatus]}20` }}>
              <ShieldCheck size={28} style={{ color: statusColor[checkpointStatus] }} />
            </div>
          </div>

          {/* Status selector */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {CHECKPOINT_STATUS.map((s) => (
              <button key={s} onClick={() => setCheckpointStatus(s)}
                className={`rounded-full px-3 py-1 text-[10px] font-bold border transition ${
                  checkpointStatus === s ? "text-white border-transparent" : "text-police-muted border-police-soft bg-transparent"
                }`}
                style={checkpointStatus === s ? { backgroundColor: statusColor[s], borderColor: statusColor[s] } : {}}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live stats */}
      <div className="mt-4 grid grid-cols-3 gap-2 px-4">
        {[
          { label: "Magari Yakaguliwa Leo",   value: vehiclesChecked, color: "#2196F3", onClick: () => setVehiclesChecked(c => c + 1) },
          { label: "Citations Zilitolewa",     value: citationsIssued, color: "#EF4444", onClick: () => navigate("history") },
          { label: "Patroli / Zamu",           value: todayPatrols,    color: "#10B981", onClick: () => navigate("patrol") },
        ].map((s) => (
          <button key={s.label} onClick={s.onClick}
            className="flex flex-col items-center rounded-xl bg-police-card p-3 shadow-sm active:scale-[0.97]">
            <span className="text-[20px] font-bold" style={{ color: s.color }}>{s.value}</span>
            <span className="mt-1 text-center text-[9px] leading-tight text-police-muted">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-4 px-4">
        <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-police-muted">Vitendo vya Haraka</p>
        <div className="grid grid-cols-2 gap-3">
          {POST_QUICK_ACTIONS.map((a) => (
            <button key={a.screen} onClick={() => navigate(a.screen as Parameters<typeof navigate>[0])}
              className="flex flex-col items-start rounded-2xl bg-police-card p-4 text-left shadow-sm active:scale-[0.98]">
              <div className="flex h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: `${a.color}15` }}>
                <a.icon size={22} style={{ color: a.color }} />
              </div>
              <div className="mt-2.5 flex w-full items-center justify-between">
                <p className="text-[13px] font-bold text-police">{a.label}</p>
                <ChevronRight size={14} className="text-police-faint" />
              </div>
              <p className="mt-0.5 text-[10px] leading-tight text-police-muted">{a.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Quick vehicle / citizen search */}
      <div className="mt-4 px-4 pb-6">
        <div className="rounded-2xl bg-police-card p-4 shadow-sm">
          <h3 className="flex items-center gap-2 text-[15px] font-bold text-police">
            <Search size={16} className="text-[#0d4f3c]" /> Utafutaji wa Haraka
          </h3>

          <div className="mt-3 flex gap-2">
            {[{ id: "vehicle" as const, label: "🚗 Gari" }, { id: "citizen" as const, label: "👤 Raia" }].map((t) => (
              <button key={t.id} onClick={() => { setTab(t.id); setValue(""); setError(""); }}
                className={`flex-1 rounded-xl py-2 text-[12px] font-semibold transition ${
                  tab === t.id ? "bg-[#0d4f3c] text-white" : "bg-police-soft text-police-muted"
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          <p className="mt-2 text-[10px] text-police-faint">
            {tab === "vehicle" ? "Namba ya Gari: T 001 ABC au IMEI ya kifaa" : "Jina, NIDA au namba ya simu ya raia"}
          </p>

          <div className="relative mt-2">
            <div className={`flex items-center gap-2 rounded-xl border bg-police-input px-3 transition ${error ? "border-[#EF4444]" : "border-police focus-within:border-[#0d4f3c]"}`}>
              <Search size={16} className={error ? "text-[#EF4444]" : "text-police-faint"} />
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                onFocus={() => suggestions.length > 0 && setShowSugg(true)}
                onBlur={() => setTimeout(() => setShowSugg(false), 150)}
                placeholder={tab === "vehicle" ? "T 001 ABC..." : "Jina la raia..."}
                className="h-10 flex-1 bg-transparent text-[14px] text-police placeholder:text-police-faint focus:outline-none"
              />
              {value && <button onClick={() => { setValue(""); setError(""); setSuggestions([]); }}><X size={14} className="text-police-faint" /></button>}
            </div>
            {error && <p className="mt-1 text-[11px] text-[#EF4444]">{error}</p>}
            {showSugg && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-police bg-police-card shadow-lg">
                {suggestions.map((s) => (
                  <button key={s} onMouseDown={() => { setValue(s); setShowSugg(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-police-muted">
                    <Search size={12} className="shrink-0 text-police-faint" />
                    <span className="text-[13px] text-police">{s}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleSearch}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d4f3c] py-3 text-[14px] font-bold text-white active:scale-[0.98]">
            <Search size={16} /> Tafuta
          </button>
        </div>
      </div>
    </div>
  );
}
