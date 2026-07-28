"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard, Map, Building2, Shield, FileText, Users,
  AlertTriangle, Car, Search, Bell, LogOut, Menu, X,
  RefreshCw, Lock, Fingerprint, CheckCircle2, MapPin,
  BarChart3, ClipboardList, ChevronRight, TrendingUp,
  Clock, UserX, Eye,
} from "lucide-react";
import { authFetch } from "@/lib/client-auth";
import { UniversalSearchScreen } from "@/components/shared/universal-search-screen";
import { usePoliceStore } from "@/store/police-store";
import Image from "next/image";

type Screen = "dashboard"|"districts"|"stations"|"patrols"|"cases"|"cid"|
              "citations"|"arrests"|"missing"|"officers"|"reports"|"approvals"|"search";

const NAV: { id: Screen; label: string; icon: typeof Shield; group?: string }[] = [
  { id: "dashboard",  label: "Dashibodi",          icon: LayoutDashboard, group: "Jumla" },
  { id: "search",     label: "Tafuta",             icon: Search,          group: "Jumla" },
  { id: "districts",  label: "Mikoa (26)",            icon: Map,             group: "Jumla" },
  { id: "stations",    label: "Vituo (300+)",          icon: Building2,       group: "Jumla" },
  { id: "officers",   label: "Maafisa",             icon: Users,           group: "Jumla" },
  { id: "patrols",    label: "Ripoti za Doria",     icon: Shield,          group: "Ripoti" },
  { id: "cases",      label: "Ripoti za Kesi",      icon: FileText,        group: "Ripoti" },
  { id: "cid",        label: "Ripoti za CID",       icon: Search,          group: "Ripoti" },
  { id: "citations",  label: "Ripoti za Trafiki",   icon: Car,             group: "Ripoti" },
  { id: "arrests",    label: "Wafungwa & Seli",     icon: Lock,            group: "Ripoti" },
  { id: "missing",    label: "Wanapotea",           icon: Fingerprint,     group: "Ripoti" },
  { id: "approvals",  label: "Idhini za Maombi",   icon: CheckCircle2,    group: "Usimamizi" },
  { id: "reports",    label: "Takwimu za Mkoa",     icon: BarChart3,       group: "Usimamizi" },
];

const SC: Record<string, string> = {
  detained:"bg-red-100 text-red-700", released:"bg-green-100 text-green-700",
  bailed:"bg-blue-100 text-blue-700", charged:"bg-orange-100 text-orange-700",
  active:"bg-yellow-100 text-yellow-700", found:"bg-green-100 text-green-700",
  closed:"bg-gray-100 text-gray-500", open:"bg-blue-100 text-blue-700",
  investigating:"bg-purple-100 text-purple-700", urgent:"bg-red-100 text-red-700",
  resolved:"bg-green-100 text-green-700", paid:"bg-green-100 text-green-700",
  unpaid:"bg-red-100 text-red-700", pending:"bg-yellow-100 text-yellow-700",
  approved:"bg-green-100 text-green-700", declined:"bg-red-100 text-red-700",
  completed:"bg-green-100 text-green-700", cancelled:"bg-gray-100 text-gray-500",
};

const Badge = ({ s }: { s: string }) => (
  <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold capitalize ${SC[s] ?? "bg-gray-100 text-gray-500"}`}>{s}</span>
);

const StatCard = ({ label, value, color, icon: Icon, loading }: any) => (
  <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
    <div className="flex items-center justify-between mb-2">
      <Icon size={18} style={{ color }} />
      <span className="text-[26px] font-black" style={{ color }}>{loading ? "—" : (value ?? 0)}</span>
    </div>
    <p className="text-[11px] text-gray-500">{label}</p>
  </div>
);

// ── District card with live data ─────────────────────────────
function DistrictCard({ district, stations, arrests, cases, patrols, citations }: {
  district: string; stations: any[]; arrests: any[]; cases: any[]; patrols: any[]; citations: any[];
}) {
  const dst_stations = stations.filter(s => s.district === district || s.region === district);
  const dst_arrests  = arrests.filter(a => a.location?.toLowerCase().includes(district.toLowerCase()));
  const dst_cases    = cases.filter(c => c.location?.toLowerCase().includes(district.toLowerCase()));
  const dst_patrols  = patrols.filter(p => p.area?.toLowerCase().includes(district.toLowerCase()));
  const dst_cit      = citations.filter(c => c.location?.toLowerCase().includes(district.toLowerCase()));

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin size={16} className="text-blue-500 shrink-0" />
        <h3 className="text-[15px] font-black text-gray-900">{district}</h3>
      </div>
      <div className="grid grid-cols-5 gap-2 text-center">
        {[
          { label: "Vituo",    value: dst_stations.length, color: "#1E3A8A" },
          { label: "Wafungwa", value: dst_arrests.filter(a=>a.status==="detained").length, color: "#EF4444" },
          { label: "Kesi",     value: dst_cases.filter(c=>["open","urgent","investigating"].includes(c.status)).length, color: "#8B5CF6" },
          { label: "Doria",    value: dst_patrols.filter(p=>p.status==="active").length, color: "#10B981" },
          { label: "Citations",value: dst_cit.length, color: "#FF9800" },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-gray-50 p-2">
            <p className="text-[18px] font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[9px] text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>
      {/* Station list */}
      {dst_stations.length > 0 && (
        <div className="mt-3 space-y-1">
          {dst_stations.slice(0, 3).map((s: any) => (
            <div key={s.id} className="flex items-center justify-between text-[12px] border-t border-gray-50 pt-1">
              <span className="text-gray-700 font-medium">{s.name}</span>
              <Badge s={s.status} />
            </div>
          ))}
          {dst_stations.length > 3 && (
            <p className="text-[11px] text-gray-400 text-center pt-1">+{dst_stations.length - 3} vituo zaidi</p>
          )}
        </div>
      )}
    </div>
  );
}

export function NationalCommanderShell() {
  const { officerProfile, logout } = usePoliceStore();
  const region = ""; // National sees ALL
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [menuOpen, setMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Data
  const [stats, setStats]       = useState<any>({});
  const [stations, setStations] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [arrests, setArrests]   = useState<any[]>([]);
  const [missing, setMissing]   = useState<any[]>([]);
  const [cases, setCases]       = useState<any[]>([]);
  const [patrols, setPatrols]   = useState<any[]>([]);
  const [citations, setCitations] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const [stRes, offRes, arrRes, misRes, caseRes, patRes, citRes, appRes] = await Promise.all([
      authFetch("/api/stations?limit=200"),
      authFetch("/api/officers?limit=500"),
      authFetch("/api/arrests?limit=200"),
      authFetch("/api/missing-records?limit=100"),
      authFetch("/api/incidents?limit=200"),
      authFetch("/api/patrols?limit=200"),
      authFetch("/api/citations?limit=200"),
      authFetch("/api/command-requests?status=pending"),
    ]);

    const st = stRes.data?.data ?? [];
    const of = offRes.data?.data ?? [];
    const ar = arrRes.data?.data ?? [];
    const mi = misRes.data?.data ?? [];
    const ca = caseRes.data?.data ?? [];
    const pa = patRes.data?.data ?? [];
    const ci = citRes.data?.data ?? [];
    const ap = appRes.data?.data ?? [];

    setStations(st); setOfficers(of); setArrests(ar); setMissing(mi);
    setCases(ca); setPatrols(pa); setCitations(ci); setApprovals(ap);

    // Unique districts in this region
    const districts = [...new Set(st.map((s: any) => s.district).filter(Boolean))];

    setStats({
      stations:          st.length,
      districts:         districts.length,
      officers:          of.length,
      detained:          ar.filter((a: any) => a.status === "detained").length,
      bailed:            ar.filter((a: any) => a.status === "bailed").length,
      missing_active:    mi.filter((m: any) => m.status === "active").length,
      cases_open:        ca.filter((c: any) => ["open","urgent"].includes(c.status)).length,
      cases_investigating: ca.filter((c: any) => c.status === "investigating").length,
      cases_urgent:      ca.filter((c: any) => c.status === "urgent").length,
      patrols_active:    pa.filter((p: any) => p.status === "active").length,
      patrols_total:     pa.length,
      citations_unpaid:  ci.filter((c: any) => c.status === "unpaid").length,
      citations_total:   ci.length,
      pending_approvals: ap.length,
      districts_list:    districts,
    });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const f = (list: any[], fields: string[]) =>
    !search ? list : list.filter(r => fields.some(f => String(r[f] ?? "").toLowerCase().includes(search.toLowerCase())));

  const handleApproval = async (id: string, action: string) => {
    await authFetch(`/api/command-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ action, note: `${action === "approve" ? "Imeidhinishwa" : "Imekataliwa"} na Kamanda wa Mkoa` }),
    });
    load();
  };

  const officerName  = officerProfile?.name || "Kamanda";
  const regionName   = region || "Mkoa";
  const districts    = (stats.districts_list ?? []) as string[];

  const groups = [...new Set(NAV.map(n => n.group))];

  return (
    <div className="flex h-screen bg-[#f5f7fa] overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0f1b35] flex flex-col transition-transform duration-200 ${menuOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0 lg:flex`}>
        <div className="flex items-center gap-3 p-5 border-b border-white/10">
          <div className="h-9 w-9 overflow-hidden rounded-full bg-white/10">
            <Image src="/police-logo.png" alt="TPF" width={36} height={36} className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-black text-white truncate">TPF — Taifa</p>
            <p className="text-[10px] text-white/40 truncate">{regionName}</p>
          </div>
          <button onClick={() => setMenu(false)} className="lg:hidden text-white/40"><X size={18}/></button>
        </div>
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-[13px] font-bold text-white">{officerName}</p>
          <p className="text-[10px] text-white/40">National Commander</p>
          <p className="text-[10px] text-white/30">Tanzania · {stats.stations ?? 0} vituo · {districts.length} wilaya</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          {groups.map(grp => (
            <div key={grp} className="mb-3">
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/30 px-3 mb-1">{grp}</p>
              {NAV.filter(n => n.group === grp).map(n => (
                <button key={n.id} onClick={() => { setScreen(n.id); setMenu(false); setSearch(""); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition mb-0.5 ${
                    screen === n.id ? "bg-[#2196F3] text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}>
                  <n.icon size={15} />
                  {n.label}
                  {n.id === "approvals" && stats.pending_approvals > 0 && (
                    <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">{stats.pending_approvals}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <button onClick={logout}
          className="flex items-center gap-3 px-5 py-4 text-[13px] text-white/40 hover:text-red-400 border-t border-white/10">
          <LogOut size={16}/> Toka
        </button>
      </aside>

      {menuOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMenu(false)} />}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-3 bg-[#0f1b35] border-b border-white/10 px-4 py-3 shadow-md">
          <button onClick={() => setMenu(true)} className="lg:hidden rounded-xl p-2 bg-gray-100"><Menu size={18}/></button>
          <div className="flex-1 min-w-0">
            <h1 className="text-[16px] font-black text-white">{NAV.find(n=>n.id===screen)?.label}</h1>
            <p className="text-[11px] text-white/50">Mkoa wa {regionName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="rounded-xl p-2 bg-white/10">
              <RefreshCw size={16} className={`text-white/60 ${loading ? "animate-spin" : ""}`}/>
            </button>
            {screen !== "dashboard" && screen !== "districts" && (
              <div className="relative hidden sm:block">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"/>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Tafuta..."
                  className="rounded-xl bg-white/10 pl-8 pr-3 py-2 text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:bg-white/15 w-48"/>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4">

          {/* ── DASHBOARD ── */}
          {screen === "dashboard" && (
            <div className="space-y-4">
              {/* Top stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label:"Wilaya",       value:stats.districts,         color:"#1E3A8A", icon:Map },
                  { label:"Vituo",        value:stats.stations,          color:"#2196F3", icon:Building2 },
                  { label:"Maafisa",      value:stats.officers,          color:"#059669", icon:Users },
                  { label:"Wafungwa Seli",value:stats.detained,          color:"#EF4444", icon:Lock },
                  { label:"Kesi Wazi",    value:stats.cases_open,        color:"#8B5CF6", icon:FileText },
                  { label:"Doria Active", value:stats.patrols_active,    color:"#10B981", icon:Shield },
                  { label:"Wanapotea",    value:stats.missing_active,    color:"#FF9800", icon:Fingerprint },
                  { label:"Kesi Muhimu",  value:stats.cases_urgent,      color:"#DC2626", icon:AlertTriangle },
                  { label:"Citations",    value:stats.citations_total,   color:"#F59E0B", icon:Car },
                  { label:"Zinachunguzwa",value:stats.cases_investigating,color:"#7C3AED", icon:Search },
                  { label:"Maombi",       value:stats.pending_approvals, color:"#DC2626", icon:ClipboardList },
                  { label:"Citations Unpaid",value:stats.citations_unpaid,color:"#EF4444",icon:Car },
                ].map(s => (
                  <StatCard key={s.label} {...s} loading={loading} />
                ))}
              </div>

              {/* District overview grid */}
              <div>
                <h3 className="text-[15px] font-black text-gray-900 mb-3 flex items-center gap-2">
                  <Map size={16} className="text-blue-500"/> Wilaya za Mkoa ({districts.length})
                  <button onClick={() => setScreen("districts")} className="ml-auto text-[12px] text-blue-500 font-medium">Ona Kwa Kina →</button>
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {districts.slice(0, 6).map(d => (
                    <DistrictCard key={d} district={d}
                      stations={stations} arrests={arrests}
                      cases={cases} patrols={patrols} citations={citations} />
                  ))}
                </div>
              </div>

              {/* Recent arrests */}
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[14px] font-black text-gray-900 flex items-center gap-2">
                      <Lock size={14} className="text-red-500"/> Wafungwa Wapya
                    </h3>
                    <button onClick={() => setScreen("arrests")} className="text-[11px] text-blue-500">Ona Wote →</button>
                  </div>
                  {arrests.slice(0, 5).map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 text-[12px]">
                      <div>
                        <p className="font-bold text-gray-900">{a.suspect_name}</p>
                        <p className="text-gray-400">{a.offense} · {a.location}</p>
                      </div>
                      <Badge s={a.status}/>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[14px] font-black text-gray-900 flex items-center gap-2">
                      <ClipboardList size={14} className="text-blue-500"/> Maombi ({stats.pending_approvals ?? 0})
                    </h3>
                    <button onClick={() => setScreen("approvals")} className="text-[11px] text-blue-500">Ona Wote →</button>
                  </div>
                  {approvals.slice(0, 5).map((r: any) => (
                    <div key={r.id} className="py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[12px] font-bold text-gray-900 truncate">{r.subject}</p>
                          <p className="text-[11px] text-white/50">{r.requester_name}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => handleApproval(r.id, "approve")} className="rounded-lg bg-green-500 px-2 py-1 text-[10px] font-bold text-white">✓</button>
                          <button onClick={() => handleApproval(r.id, "decline")} className="rounded-lg bg-red-500 px-2 py-1 text-[10px] font-bold text-white">✗</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {approvals.length === 0 && <p className="text-center text-[12px] text-gray-400 py-4">Hakuna maombi</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── DISTRICTS ── */}
          {screen === "districts" && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {districts.map(d => (
                  <DistrictCard key={d} district={d}
                    stations={stations} arrests={arrests}
                    cases={cases} patrols={patrols} citations={citations} />
                ))}
              </div>
              {districts.length === 0 && (
                <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center text-gray-400">
                  <Map size={32} className="mx-auto mb-2 opacity-30"/>
                  <p>Hakuna data ya wilaya</p>
                </div>
              )}
            </div>
          )}

          {/* ── PATROL REPORTS ── */}
          {screen === "patrols" && (
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                {["active","completed","cancelled"].map(s => (
                  <span key={s} className={`rounded-xl px-3 py-1 text-[11px] font-bold ${SC[s]}`}>
                    {s} ({patrols.filter(p=>p.status===s).length})
                  </span>
                ))}
              </div>
              {f(patrols, ["area","patrol_number"]).map((p: any) => (
                <div key={p.id} className={`rounded-xl bg-white border shadow-sm p-4 ${p.status==="active"?"border-green-200":"border-gray-100"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-black text-gray-900">{p.area}</p>
                      <p className="text-[11px] text-gray-500 font-mono">{p.patrol_number}</p>
                      <div className="flex gap-3 mt-1 text-[10px] text-gray-400">
                        <Clock size={10}/>
                        <span>{p.start_time ? new Date(p.start_time).toLocaleString("sw-TZ") : "—"}</span>
                        {p.end_time && <><span>→</span><span>{new Date(p.end_time).toLocaleString("sw-TZ")}</span></>}
                      </div>
                      {p.notes && <p className="text-[11px] text-gray-400 mt-1">{p.notes}</p>}
                    </div>
                    <Badge s={p.status}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── CASES / INCIDENT REPORTS ── */}
          {screen === "cases" && (
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                {["urgent","open","investigating","resolved"].map(s => (
                  <span key={s} className={`rounded-xl px-3 py-1 text-[11px] font-bold ${SC[s]}`}>
                    {s} ({cases.filter(c=>c.status===s).length})
                  </span>
                ))}
              </div>
              {f(cases, ["type","incident_number","location","description"]).map((c: any) => (
                <div key={c.id} className={`rounded-xl bg-white border shadow-sm p-4 ${c.status==="urgent"?"border-red-200":c.status==="investigating"?"border-purple-200":"border-gray-100"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-black text-gray-900">{c.type}</p>
                      <p className="text-[12px] text-gray-500">{c.location}</p>
                      <div className="flex gap-3 mt-1 text-[10px] text-gray-400">
                        <span className="font-mono">{c.incident_number}</span>
                        <span>·</span><span>{c.date}</span>
                        <span>·</span><Badge s={c.priority}/>
                      </div>
                    </div>
                    <Badge s={c.status}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── CID REPORTS ── */}
          {screen === "cid" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label:"Zinachunguzwa", value: cases.filter(c=>c.status==="investigating").length, color:"#8B5CF6" },
                  { label:"Kesi Muhimu",   value: cases.filter(c=>c.status==="urgent").length,        color:"#EF4444" },
                  { label:"Zilizofungwa",  value: cases.filter(c=>c.status==="resolved").length,      color:"#10B981" },
                  { label:"Wanaotafutwa",  value: missing.filter(m=>m.status==="active").length,      color:"#FF9800" },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
                    <p className="text-[26px] font-black" style={{color:s.color}}>{s.value}</p>
                    <p className="text-[11px] text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
                <h3 className="text-[14px] font-black text-gray-900 mb-3 flex items-center gap-2">
                  <Search size={14} className="text-purple-500"/> Kesi Zinachochunguzwa
                </h3>
                {cases.filter(c=>c.status==="investigating").map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-[13px] font-bold text-gray-900">{c.type}</p>
                      <p className="text-[11px] text-white/50">{c.location} · {c.incident_number}</p>
                    </div>
                    <Badge s={c.priority ?? "medium"}/>
                  </div>
                ))}
                {cases.filter(c=>c.status==="investigating").length === 0 && (
                  <p className="text-center text-[12px] text-gray-400 py-6">Hakuna kesi zinachochunguzwa</p>
                )}
              </div>
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
                <h3 className="text-[14px] font-black text-gray-900 mb-3 flex items-center gap-2">
                  <Fingerprint size={14} className="text-orange-500"/> Wanaotafutwa
                </h3>
                {missing.filter(m=>m.status==="active").map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-[13px] font-bold text-gray-900">{m.identifier}</p>
                      <p className="text-[11px] text-white/50">{m.last_seen_location} · {m.case_no}</p>
                    </div>
                    <Badge s={m.status}/>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TRAFFIC/CITATION REPORTS ── */}
          {screen === "citations" && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 mb-2">
                {[
                  { label:"Zote",      value: citations.length,                                   color:"#2196F3" },
                  { label:"Hazilipwi", value: citations.filter(c=>c.status==="unpaid").length,    color:"#EF4444" },
                  { label:"Zilipwa",   value: citations.filter(c=>c.status==="paid").length,      color:"#10B981" },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-3 text-center">
                    <p className="text-[22px] font-black" style={{color:s.color}}>{s.value}</p>
                    <p className="text-[10px] text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>
              {f(citations, ["driver_name","plate","citation_number","offense","location"]).map((c: any) => (
                <div key={c.id} className={`rounded-xl bg-white border shadow-sm p-4 ${c.status==="unpaid"?"border-red-200":"border-gray-100"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-black text-gray-900">{c.driver_name}</p>
                      <p className="text-[12px] text-gray-500">{c.offense} · <span className="font-mono font-bold">{c.plate}</span></p>
                      <div className="flex gap-3 mt-1 text-[10px] text-gray-400">
                        <span className="font-mono">{c.citation_number}</span>
                        <span>·</span><span>{c.location}</span>
                        <span>·</span><span>TZS {parseInt(c.amount||"0").toLocaleString()}</span>
                      </div>
                    </div>
                    <Badge s={c.status}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── ARRESTS ── */}
          {screen === "arrests" && (
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                {["detained","bailed","released","charged","acquitted"].map(s => (
                  <span key={s} className={`rounded-xl px-3 py-1 text-[11px] font-bold ${SC[s]}`}>
                    {s} ({arrests.filter(a=>a.status===s).length})
                  </span>
                ))}
              </div>
              {f(arrests, ["suspect_name","arrest_number","offense","location"]).map((a: any) => (
                <div key={a.id} className={`rounded-xl bg-white border shadow-sm p-4 ${a.status==="detained"?"border-red-200":a.status==="bailed"?"border-purple-200":"border-gray-100"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-black text-gray-900">{a.suspect_name}</p>
                      <p className="text-[12px] text-gray-500">{a.offense}</p>
                      <div className="flex gap-3 mt-1 text-[10px] text-gray-400">
                        <span className="font-mono">{a.arrest_number}</span>
                        <span>·</span><span>{a.location}</span>
                        <span>·</span><span>{new Date(a.arrest_date).toLocaleDateString("sw-TZ")}</span>
                      </div>
                    </div>
                    <Badge s={a.status}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── MISSING ── */}
          {screen === "missing" && (
            <div className="space-y-2">
              {f(missing, ["identifier","case_no","last_seen_location"]).map((m: any) => (
                <div key={m.id} className={`rounded-xl bg-white border shadow-sm p-4 ${m.status==="active"?"border-orange-200":"border-gray-100"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-black text-gray-900">{m.identifier}</p>
                      <p className="text-[12px] text-gray-500">{m.title}</p>
                      <div className="flex gap-3 mt-1 text-[10px] text-gray-400">
                        <MapPin size={10}/><span>{m.last_seen_location}</span>
                        <span>·</span><span className="font-mono">{m.case_no}</span>
                        <span>·</span><span>{new Date(m.reported_date).toLocaleDateString("sw-TZ")}</span>
                      </div>
                    </div>
                    <Badge s={m.status}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── OFFICERS ── */}
          {screen === "officers" && (
            <div className="space-y-2">
              <p className="text-[13px] text-gray-500">{officers.length} maafisa wote mkoani</p>
              {f(officers, ["name","badge_no","rank","region"]).map((o: any) => (
                <div key={o.id} className="rounded-xl bg-white border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[14px] font-black text-blue-600">
                      {o.name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-gray-900">{o.name}</p>
                      <p className="text-[11px] text-white/50">{o.rank} · {o.officer_number || o.badge_no}</p>
                      <p className="text-[10px] text-gray-300">{o.region}</p>
                    </div>
                    <Badge s={o.status || "active"}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── APPROVALS ── */}
          {screen === "approvals" && (
            <div className="space-y-3">
              {approvals.length === 0 ? (
                <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center text-gray-400">
                  <CheckCircle2 size={32} className="mx-auto mb-2 opacity-30"/>
                  <p>Hakuna maombi yanayosubiri</p>
                </div>
              ) : approvals.map((r: any) => (
                <div key={r.id} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-[10px] font-mono text-gray-400">{r.reference_no}</p>
                      <p className="text-[14px] font-black text-gray-900">{r.subject}</p>
                      <p className="text-[12px] text-gray-500">{r.requester_name} · {r.requester_role?.replace(/_/g," ")}</p>
                    </div>
                    <Badge s={r.status}/>
                  </div>
                  <p className="text-[12px] text-gray-600 mb-3 line-clamp-2">{r.description}</p>
                  {r.status === "pending" && (
                    <div className="flex gap-2">
                      <button onClick={() => handleApproval(r.id, "approve")}
                        className="flex-1 rounded-xl bg-green-500 py-2 text-[12px] font-bold text-white">✅ Idhinisha</button>
                      <button onClick={() => handleApproval(r.id, "hold")}
                        className="flex-1 rounded-xl bg-orange-400 py-2 text-[12px] font-bold text-white">⏸ Simamisha</button>
                      <button onClick={() => handleApproval(r.id, "decline")}
                        className="flex-1 rounded-xl bg-red-500 py-2 text-[12px] font-bold text-white">❌ Kataa</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── REPORTS / TAKWIMU ── */}
          {screen === "reports" && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Patrol summary by district */}
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
                  <h3 className="text-[14px] font-black text-gray-900 mb-3">Doria kwa Wilaya</h3>
                  {districts.map(d => {
                    const dp = patrols.filter(p => p.area?.includes(d));
                    return (
                      <div key={d} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 text-[12px]">
                        <span className="text-gray-700 font-medium">{d}</span>
                        <div className="flex gap-3">
                          <span className="text-green-600 font-bold">{dp.filter(p=>p.status==="active").length} active</span>
                          <span className="text-gray-400">{dp.length} total</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Arrest summary by district */}
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
                  <h3 className="text-[14px] font-black text-gray-900 mb-3">Wakamatwa kwa Eneo</h3>
                  {districts.map(d => {
                    const da = arrests.filter(a => a.location?.includes(d));
                    return (
                      <div key={d} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 text-[12px]">
                        <span className="text-gray-700 font-medium">{d}</span>
                        <div className="flex gap-3">
                          <span className="text-red-600 font-bold">{da.filter(a=>a.status==="detained").length} seli</span>
                          <span className="text-gray-400">{da.length} total</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Cases by status */}
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
                  <h3 className="text-[14px] font-black text-gray-900 mb-3">Kesi kwa Hali</h3>
                  {["open","urgent","investigating","resolved"].map(s => (
                    <div key={s} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 text-[12px]">
                      <Badge s={s}/>
                      <span className="font-bold text-gray-900">{cases.filter(c=>c.status===s).length}</span>
                    </div>
                  ))}
                </div>
                {/* Citations summary */}
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
                  <h3 className="text-[14px] font-black text-gray-900 mb-3">Citations kwa Hali</h3>
                  {["paid","unpaid","pending"].map(s => (
                    <div key={s} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 text-[12px]">
                      <Badge s={s}/>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{citations.filter(c=>c.status===s).length}</p>
                        <p className="text-[10px] text-gray-400">
                          TZS {citations.filter(c=>c.status===s).reduce((sum,c)=>sum+parseInt(c.amount||"0"),0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {screen === "search" && (
            <UniversalSearchScreen onBack={() => setScreen("dashboard")} />
          )}

        </main>
      </div>
    </div>
  );
}
