"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield, Users, Car, AlertTriangle, Search, RefreshCw,
  UserX, Package, FileText, Lock, User, Phone, Clock,
  CheckCircle2, XCircle, PauseCircle, ChevronRight,
  MapPin, Bell, Fingerprint,
} from "lucide-react";
import { usePoliceStore } from "@/store/police-store";

const H = () => ({ "Content-Type": "application/json" });

interface Stats {
  arrests_detained: number;
  arrests_released: number;
  arrests_bailed:   number;
  missing_active:   number;
  citations_today:  number;
  incidents_open:   number;
  cases_open:       number;
}

interface ArrestRow {
  id: string; arrest_number: string; suspect_name: string;
  offense: string; status: string; arrest_date: string;
  location: string;
}

interface MissingRow {
  id: string; case_no: string; title: string; identifier: string;
  status: string; last_seen_location: string; reported_date: string;
}

interface CaseRow {
  id: string; case_number?: string; title: string;
  type: string; status: string; created_at: string;
}

const STATUS_COLOR: Record<string, string> = {
  detained:      "bg-red-100 text-red-700",
  released:      "bg-green-100 text-green-700",
  bailed:        "bg-blue-100 text-blue-700",
  charged:       "bg-orange-100 text-orange-700",
  acquitted:     "bg-gray-100 text-gray-500",
  active:        "bg-yellow-100 text-yellow-700",
  found:         "bg-green-100 text-green-700",
  closed:        "bg-gray-100 text-gray-500",
};

const StatusBadge = ({ status }: { status: string }) => (
  <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold capitalize ${STATUS_COLOR[status] ?? "bg-gray-100 text-gray-500"}`}>
    {status}
  </span>
);

export function PostDashboardScreen() {
  const { officerProfile } = usePoliceStore();
  const stationId = officerProfile?.stationId;
  const postName  = officerProfile?.station || "Posti";

  const [tab, setTab]             = useState<"overview"|"arrests"|"missing"|"cases">("overview");
  const [stats, setStats]         = useState<Stats | null>(null);
  const [arrests, setArrests]     = useState<ArrestRow[]>([]);
  const [missing, setMissing]     = useState<MissingRow[]>([]);
  const [cases, setCases]         = useState<CaseRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [arrestRes, missingRes, caseRes, incRes] = await Promise.all([
        fetch(`/api/arrests?limit=100`, { headers: H() }).then(r => r.json()),
        fetch(`/api/missing-records?limit=50`, { headers: H() }).then(r => r.json()),
        fetch(`/api/incidents?status=open&limit=50`, { headers: H() }).then(r => r.json()),
        fetch(`/api/incidents?status=investigating&limit=50`, { headers: H() }).then(r => r.json()),
      ]);

      const arrestData: ArrestRow[] = arrestRes?.data ?? [];
      const missingData: MissingRow[] = missingRes?.data ?? [];
      const caseData: CaseRow[] = [
        ...(caseRes?.data ?? []),
        ...(incRes?.data ?? []),
      ].map((r: any) => ({
        id: r.id,
        title: r.type || r.title || "Kesi",
        type: r.type || "incident",
        status: r.status || "open",
        created_at: r.created_at || r.date,
      }));

      setArrests(arrestData);
      setMissing(missingData);
      setCases(caseData);

      setStats({
        arrests_detained: arrestData.filter(a => a.status === "detained").length,
        arrests_released: arrestData.filter(a => a.status === "released").length,
        arrests_bailed:   arrestData.filter(a => a.status === "bailed").length,
        missing_active:   missingData.filter(m => m.status === "active").length,
        citations_today:  0,
        incidents_open:   caseData.filter(c => c.status === "open" || c.status === "urgent").length,
        cases_open:       caseData.filter(c => c.status === "investigating").length,
      });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [stationId]);

  useEffect(() => { load(); }, [load]);

  const filteredArrests = arrests.filter(a =>
    !search || a.suspect_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.arrest_number?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredMissing = missing.filter(m =>
    !search || m.identifier?.toLowerCase().includes(search.toLowerCase()) ||
    m.case_no?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredCases = cases.filter(c =>
    !search || c.title?.toLowerCase().includes(search.toLowerCase())
  );

  const TABS = [
    { id: "overview", label: "Dashibodi",   icon: Shield },
    { id: "arrests",  label: "Wafungwa",    icon: UserX  },
    { id: "missing",  label: "Wanapotea",   icon: Fingerprint },
    { id: "cases",    label: "Kesi",        icon: FileText },
  ] as const;

  return (
    <div className="flex flex-col min-h-full bg-[#0a0f1e]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0f1e] border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[16px] font-black text-white">{postName}</h1>
            <p className="text-[11px] text-white/50">Dashibodi ya Posti</p>
          </div>
          <button onClick={load} className="rounded-xl bg-white/10 p-2">
            <RefreshCw size={16} className={`text-white/70 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-bold transition ${
                tab === t.id ? "bg-[#2196F3] text-white" : "bg-white/10 text-white/60"
              }`}>
              <t.icon size={12} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label:"Wamefungwa",   value: stats?.arrests_detained ?? 0, color:"#EF4444", icon: Lock },
                { label:"Walioachiwa",  value: stats?.arrests_released ?? 0, color:"#10B981", icon: CheckCircle2 },
                { label:"Waliodhamini", value: stats?.arrests_bailed ?? 0,   color:"#8B5CF6", icon: Shield },
                { label:"Wanapotea",    value: stats?.missing_active ?? 0,   color:"#FF9800", icon: Fingerprint },
                { label:"Kesi Wazi",    value: stats?.incidents_open ?? 0,   color:"#2196F3", icon: AlertTriangle },
                { label:"Zinachochunguzwa", value: stats?.cases_open ?? 0,   color:"#F59E0B", icon: Search },
              ].map(s => (
                <div key={s.label} className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <s.icon size={16} style={{ color: s.color }} />
                    <span className="text-[22px] font-black text-white">{loading ? "—" : s.value}</span>
                  </div>
                  <p className="text-[11px] text-white/50">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Wafungwa wa Seli (Detained in cell) */}
            <div>
              <h3 className="text-[13px] font-bold text-white/70 mb-2 flex items-center gap-2">
                <Lock size={14} className="text-red-400" /> Seli — Waliofungwa ({stats?.arrests_detained ?? 0})
              </h3>
              {loading ? (
                <div className="flex justify-center py-6">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2196F3] border-t-transparent" />
                </div>
              ) : arrests.filter(a => a.status === "detained").length === 0 ? (
                <div className="rounded-2xl bg-white/5 p-6 text-center text-white/40">
                  <Lock size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-[12px]">Hakuna wafungwa sasa hivi</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {arrests.filter(a => a.status === "detained").slice(0, 5).map(a => (
                    <div key={a.id} className="rounded-xl bg-red-950/30 border border-red-900/30 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/20">
                            <UserX size={16} className="text-red-400" />
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-white">{a.suspect_name}</p>
                            <p className="text-[11px] text-white/50">{a.offense}</p>
                            <p className="text-[10px] text-white/30">{a.arrest_number} · {a.location}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <StatusBadge status={a.status} />
                          <p className="text-[10px] text-white/30 mt-1">
                            {new Date(a.arrest_date).toLocaleDateString("sw-TZ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {arrests.filter(a => a.status === "detained").length > 5 && (
                    <button onClick={() => setTab("arrests")}
                      className="flex w-full items-center justify-center gap-1 rounded-xl bg-white/5 py-2 text-[12px] text-white/50">
                      Ona wote <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Missing persons preview */}
            <div>
              <h3 className="text-[13px] font-bold text-white/70 mb-2 flex items-center gap-2">
                <Fingerprint size={14} className="text-orange-400" /> Wanapotea ({stats?.missing_active ?? 0})
              </h3>
              {missing.filter(m => m.status === "active").slice(0, 3).map(m => (
                <div key={m.id} className="rounded-xl bg-orange-950/20 border border-orange-900/30 p-3 mb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-bold text-white">{m.identifier}</p>
                      <p className="text-[11px] text-white/50">{m.last_seen_location}</p>
                      <p className="text-[10px] text-white/30">{m.case_no} · {new Date(m.reported_date).toLocaleDateString("sw-TZ")}</p>
                    </div>
                    <StatusBadge status={m.status} />
                  </div>
                </div>
              ))}
              {missing.filter(m => m.status === "active").length === 0 && !loading && (
                <div className="rounded-xl bg-white/5 p-4 text-center text-white/30 text-[12px]">Hakuna ripoti za kutoweka</div>
              )}
            </div>
          </>
        )}

        {/* ── ARRESTS (WAFUNGWA) ── */}
        {tab === "arrests" && (
          <>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Tafuta jina au namba..."
                className="w-full rounded-xl bg-white/10 pl-9 pr-3 py-2.5 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:bg-white/15" />
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
              {["Wote","Wafungwa","Walioachiwa","Waliodhamini"].map((f, i) => {
                const statusMap = [undefined,"detained","released","bailed"];
                const count = i === 0 ? arrests.length : arrests.filter(a => a.status === statusMap[i]).length;
                return (
                  <button key={f} onClick={() => setSearch("")}
                    className="rounded-xl bg-white/10 px-3 py-1 text-[11px] text-white/60 font-medium">
                    {f} ({count})
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              {filteredArrests.length === 0 ? (
                <div className="rounded-2xl bg-white/5 p-10 text-center text-white/30">
                  <UserX size={32} className="mx-auto mb-2 opacity-30" />
                  <p>Hakuna watuhumiwa</p>
                </div>
              ) : filteredArrests.map(a => (
                <div key={a.id} className={`rounded-xl border p-3 ${
                  a.status === "detained" ? "bg-red-950/20 border-red-900/30" :
                  a.status === "bailed"   ? "bg-purple-950/20 border-purple-900/30" :
                  "bg-white/5 border-white/10"
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        a.status === "detained" ? "bg-red-500/20" : "bg-white/10"
                      }`}>
                        <UserX size={18} className={a.status === "detained" ? "text-red-400" : "text-white/40"} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-white">{a.suspect_name}</p>
                        <p className="text-[11px] text-white/60">{a.offense}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-white/30 font-mono">{a.arrest_number}</span>
                          <span className="text-[10px] text-white/30">·</span>
                          <span className="text-[10px] text-white/30">{a.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <StatusBadge status={a.status} />
                      <p className="text-[10px] text-white/30">{new Date(a.arrest_date).toLocaleDateString("sw-TZ")}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── MISSING PERSONS ── */}
        {tab === "missing" && (
          <>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Tafuta jina au namba..."
                className="w-full rounded-xl bg-white/10 pl-9 pr-3 py-2.5 text-[13px] text-white placeholder:text-white/30 focus:outline-none" />
            </div>

            <div className="space-y-2">
              {filteredMissing.length === 0 ? (
                <div className="rounded-2xl bg-white/5 p-10 text-center text-white/30">
                  <Fingerprint size={32} className="mx-auto mb-2 opacity-30" />
                  <p>Hakuna ripoti za kutoweka</p>
                </div>
              ) : filteredMissing.map(m => (
                <div key={m.id} className={`rounded-xl border p-3 ${
                  m.status === "active" ? "bg-orange-950/20 border-orange-900/30" : "bg-white/5 border-white/10"
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/20">
                        <Fingerprint size={18} className="text-orange-400" />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-white">{m.identifier}</p>
                        <p className="text-[11px] text-white/60">{m.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <MapPin size={10} className="text-white/30" />
                          <span className="text-[10px] text-white/30">{m.last_seen_location}</span>
                        </div>
                        <span className="text-[10px] text-white/30 font-mono">{m.case_no}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <StatusBadge status={m.status} />
                      <p className="text-[10px] text-white/30">{new Date(m.reported_date).toLocaleDateString("sw-TZ")}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── CASES ── */}
        {tab === "cases" && (
          <>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Tafuta kesi..."
                className="w-full rounded-xl bg-white/10 pl-9 pr-3 py-2.5 text-[13px] text-white placeholder:text-white/30 focus:outline-none" />
            </div>

            <div className="space-y-2">
              {filteredCases.length === 0 ? (
                <div className="rounded-2xl bg-white/5 p-10 text-center text-white/30">
                  <FileText size={32} className="mx-auto mb-2 opacity-30" />
                  <p>Hakuna kesi zilizowazi</p>
                </div>
              ) : filteredCases.map(c => (
                <div key={c.id} className={`rounded-xl border p-3 ${
                  c.status === "urgent" ? "bg-red-950/20 border-red-900/30" :
                  c.status === "investigating" ? "bg-blue-950/20 border-blue-900/30" :
                  "bg-white/5 border-white/10"
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[14px] font-bold text-white">{c.title}</p>
                      <p className="text-[11px] text-white/50 capitalize">{c.type}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString("sw-TZ") : "—"}
                      </p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
