// @ts-nocheck
"use client";

import { useState } from "react";
import { Search, ChevronRight, FileText, Filter, AlertTriangle, Shield, X } from "lucide-react";
import { TopAppBar } from "../top-app-bar";
import { usePoliceStore } from "@/store/police-store";
import { useOfficer } from "@/hooks/use-officer";
import { toast } from "@/hooks/use-toast";

type HistoryTab = "citations" | "arrests" | "warnings" | "patrols";

export function HistoryScreen() {
  const { navigate, setSelectedCitation, patrolRecords, authRole } = usePoliceStore();
  const OFFICER = useOfficer();

  const isGeneral = authRole === "GENERAL_OFFICER" || OFFICER.role === "officer-general";
  const isPost    = authRole === "POST_OFFICER"    || OFFICER.role === "post-officer";
  const isTraffic = !isGeneral && !isPost;

  // Role label shown in subtitle
  const roleLabel = isGeneral ? "Afisa Polisi wa Jumla"
    : isPost    ? "Afisa wa Posti"
    : "Afisa wa Trafiki";

  // Default tab: General/Post don't have citations as primary history
  const defaultTab: HistoryTab = isTraffic ? "citations" : "arrests";
  const [tab, setTab] = useState<HistoryTab>(defaultTab);
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [query, setQuery] = useState("");

  const filteredCitations = ([] as {citationNumber:string;plate:string;offense:string;date:string;fine:string;status:string}[]).filter((c) => {
    if (filter === "paid" && c.status !== "Imelipwa") return false;
    if (filter === "unpaid" && c.status !== "Hajalipwa") return false;
    if (query) {
      const q = query.toLowerCase();
      return c.plate.toLowerCase().includes(q) || c.driver.toLowerCase().includes(q) ||
        c.offense.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredArrests = ([] as {status:string;suspectName:string;offense:string;date:string}[]).filter((a) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return a.suspect.toLowerCase().includes(q) || a.offense.toLowerCase().includes(q) || a.id.toLowerCase().includes(q);
  });

  const filteredWarnings = ([] as {recipient:string;offense:string;date:string;location:string}[]).filter((w) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return w.recipient.toLowerCase().includes(q) || w.offense.toLowerCase().includes(q) || w.id.toLowerCase().includes(q);
  });

  const totalFines = 0;
  const unpaidFines = 0;

  const ALL_TABS = [
    { id: "citations" as HistoryTab, label: "Citations",  count: 0,                  icon: <FileText size={13} />,       roles: ["traffic", "post"] },
    { id: "arrests"  as HistoryTab, label: "Makamato",   count: 0,                  icon: <AlertTriangle size={13} />,  roles: ["traffic", "general", "post"] },
    { id: "warnings" as HistoryTab, label: "Maonyo",     count: 0,                  icon: <AlertTriangle size={13} />,  roles: ["traffic", "general", "post"] },
    { id: "patrols"  as HistoryTab, label: "Patroli",    count: patrolRecords.length, icon: <Shield size={13} />,       roles: ["traffic", "general", "post"] },
  ];
  const roleKey = isGeneral ? "general" : isPost ? "post" : "traffic";
  const TABS = ALL_TABS.filter((t) => t.roles.includes(roleKey));

  return (
    <div className="min-h-full bg-police">
      <TopAppBar
        title="Historia ya Rekodi"
        subtitle={isTraffic
          ? "Citations, makamato, maonyo na patroli"
          : isPost
            ? "Citations za posti, makamato, maonyo na patroli"
            : "Makamato, matukio, maonyo na patroli"}
        showBack
      />

      <div className="space-y-3 p-4 pb-8">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="tpf-card p-3">
            <p className="text-[10px] text-police-faint">Jumla ya Faini</p>
            <p className="mt-1 text-[18px] font-bold text-police-navy">TZS {totalFines.toLocaleString()}</p>
            <p className="mt-0.5 text-[10px] text-police-faint">{0} Citations</p>
          </div>
          <div className="tpf-card p-3">
            <p className="text-[10px] text-police-faint">Haijalipwa</p>
            <p className="mt-1 text-[18px] font-bold text-[#EF4444]">TZS {unpaidFines.toLocaleString()}</p>
            <p className="mt-0.5 text-[10px] text-police-faint">{0} Hajalipwa</p>
          </div>
        </div>

        {/* Type tabs */}
        <div className="flex gap-1.5 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold transition ${tab === t.id ? "bg-[#1E3A8A] text-white" : "bg-police-card text-police-muted shadow-sm"}`}>
              {t.icon} {t.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${tab === t.id ? "bg-white/20 text-white" : "bg-police-muted text-police-faint"}`}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl border border-police bg-police-card px-3 shadow-sm">
          <Search size={18} className="text-police-faint" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tafuta rekodi..." className="h-11 flex-1 bg-transparent text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
          {query && <button onClick={() => setQuery("")}><X size={14} className="text-police-faint" /></button>}
        </div>

        {/* Citations */}
        {tab === "citations" && (
          <>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-police-faint" />
              {([{ id: "all", label: "Zote" }, { id: "unpaid", label: "Haijalipwa" }, { id: "paid", label: "Imelipwa" }] as const).map((f) => (
                <button key={f.id} onClick={() => setFilter(f.id)} className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${filter === f.id ? "bg-[#1E3A8A] text-white" : "bg-police-card text-police-muted"}`}>{f.label}</button>
              ))}
            </div>
            <div className="space-y-2.5">
              {filteredCitations.length === 0 ? (
                <EmptyState label="Hakuna citation iliyopatikana" />
              ) : filteredCitations.map((c) => (
                <button key={c.id} onClick={() => { setSelectedCitation(c.id); navigate("citation-detail"); }} className="flex w-full items-center gap-3 rounded-2xl bg-police-card p-3 text-left shadow-sm active:scale-[0.99]">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${c.statusColor}18` }}>
                    <FileText size={20} style={{ color: c.statusColor }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md border border-[#1E3A8A] bg-yellow-50 px-1.5 py-0.5 text-[11px] font-bold text-police-navy">{c.plate}</span>
                      <span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ backgroundColor: c.statusColor }}>{c.status}</span>
                    </div>
                    <p className="mt-1 text-[13px] font-bold text-police">{c.offense}</p>
                    <p className="text-[11px] text-police-muted">{c.driver}</p>
                    <p className="text-[10px] text-police-faint">{c.date} • {c.time} • {c.location}</p>
                    <p className="mt-0.5 text-[13px] font-bold text-police-navy">{c.fine}</p>
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-police-faint" />
                </button>
              ))}
            </div>
          </>
        )}

        {/* Arrests */}
        {tab === "arrests" && (
          <div className="space-y-2.5">
            {filteredArrests.length === 0 ? <EmptyState label="Hakuna makamato" /> : filteredArrests.map((a) => (
              <div key={a.id} className="tpf-card p-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1E3A8A]/10">
                    <AlertTriangle size={20} className="text-[#1E3A8A]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-bold text-police">{a.suspect}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold text-white ${a.status === "held" ? "bg-[#EF4444]" : a.status === "released" ? "bg-[#10B981]" : "bg-[#1E3A8A]"}`}>
                        {a.status === "held" ? "Kizuizini" : a.status === "released" ? "Ameachiwa" : "Ameshtakiwa"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[12px] font-medium text-[#1E3A8A]">{a.id}</p>
                    <p className="text-[11px] text-police-muted">{a.offense}</p>
                    <p className="text-[10px] text-police-faint">{a.arrestDate} saa {a.arrestTime} • {a.arrestLocation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Warnings */}
        {tab === "warnings" && (
          <div className="space-y-2.5">
            {filteredWarnings.length === 0 ? <EmptyState label="Hakuna maonyo" /> : filteredWarnings.map((w) => (
              <div key={w.id} className="tpf-card p-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FF9800]/10">
                    <AlertTriangle size={20} className="text-[#FF9800]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-bold text-police">{w.recipient}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${w.acknowledged ? "bg-[#10B981]/15 text-[#10B981]" : "bg-[#FF9800]/15 text-[#FF9800]"}`}>
                        {w.acknowledged ? "Imekubaliwa" : "Haikubaliwa"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[12px] font-medium text-[#FF9800]">{w.id}</p>
                    <p className="text-[11px] text-police-muted">{w.offense}</p>
                    <p className="text-[10px] text-police-faint">{w.date} saa {w.time} • {w.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Patrols */}
        {tab === "patrols" && (
          <div className="space-y-2.5">
            {patrolRecords.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl bg-police-card py-10 shadow-sm gap-3">
                <Shield size={32} className="text-police-faint" />
                <p className="text-[13px] text-police-faint">Hakuna rekodi ya patroli bado.</p>
                <p className="text-[11px] text-police-muted">Anza patroli kwenye ukurasa wa Patroli.</p>
              </div>
            ) : patrolRecords.map((p) => (
              <div key={p.id} className="tpf-card p-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2196F3]/10">
                    <Shield size={20} className="text-[#2196F3]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-police">{p.area}</p>
                    <p className="text-[11px] text-police-muted">{p.date} • Muda: {p.duration}</p>
                    {p.events && <p className="mt-0.5 text-[11px] text-police-faint line-clamp-1">{p.events}</p>}
                    <p className="mt-0.5 text-[10px] text-[#2196F3]">{p.photos} picha</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-police-card py-10 shadow-sm">
      <FileText size={32} className="text-police-faint" />
      <p className="mt-2 text-[13px] text-police-faint">{label}</p>
    </div>
  );
}
