"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard, Users, Shield, FileText, UserX, Fingerprint,
  AlertTriangle, Car, Search, Bell, Settings, LogOut, Menu, X,
  RefreshCw, Lock, CheckCircle2, MapPin, ChevronRight, Plus,
  ClipboardList, Clock, UserCheck, Building2, Grid, Package,
} from "lucide-react";
import { authFetch } from "@/lib/client-auth";
import { UniversalSearchScreen } from "@/components/shared/universal-search-screen";
import { usePoliceStore } from "@/store/police-store";
import Image from "next/image";

// ── Types ────────────────────────────────────────────────────
type Screen = "dashboard"|"arrests"|"missing"|"cases"|"patrols"|"posts"|
              "officers"|"approvals"|"citations"|"bail"|"cid-summary"|"search"|"profile";

const NAV: { id: Screen; label: string; icon: typeof Shield }[] = [
  { id: "dashboard",   label: "Dashibodi",   icon: LayoutDashboard },
  { id: "search",      label: "Tafuta",      icon: Search },
  { id: "arrests",     label: "Wafungwa",    icon: Lock },
  { id: "missing",     label: "Wanapotea",   icon: Fingerprint },
  { id: "cases",       label: "Kesi",        icon: FileText },
  { id: "patrols",     label: "Doria",       icon: Shield },
  { id: "posts",       label: "Posti",       icon: MapPin },
  { id: "officers",    label: "Maafisa",     icon: Users },
  { id: "approvals",   label: "Idhini",      icon: CheckCircle2 },
  { id: "citations",   label: "Citations",   icon: Car },
  { id: "cid-summary", label: "CID",         icon: Search },
];

const STATUS_COLOR: Record<string, string> = {
  detained:      "bg-red-100 text-red-700",
  released:      "bg-green-100 text-green-700",
  bailed:        "bg-blue-100 text-blue-700",
  charged:       "bg-orange-100 text-orange-700",
  acquitted:     "bg-gray-100 text-gray-500",
  active:        "bg-yellow-100 text-yellow-700",
  found:         "bg-green-100 text-green-700",
  closed:        "bg-gray-100 text-gray-500",
  open:          "bg-blue-100 text-blue-700",
  investigating: "bg-purple-100 text-purple-700",
  urgent:        "bg-red-100 text-red-700",
  resolved:      "bg-green-100 text-green-700",
  paid:          "bg-green-100 text-green-700",
  unpaid:        "bg-red-100 text-red-700",
  pending:       "bg-yellow-100 text-yellow-700",
  approved:      "bg-green-100 text-green-700",
  declined:      "bg-red-100 text-red-700",
  on_hold:       "bg-orange-100 text-orange-700",
};

const Badge = ({ status }: { status: string }) => (
  <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold capitalize ${STATUS_COLOR[status] ?? "bg-gray-100 text-gray-500"}`}>{status}</span>
);

// ── Station Commander Shell ───────────────────────────────────
export function StationCommanderShell() {
  const { officerProfile, logout } = usePoliceStore();
  const [screen, setScreen]       = useState<Screen>("dashboard");
  const [menuOpen, setMenu]       = useState(false);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [selected, setSelected]   = useState<any>(null);

  // Data
  const [stats, setStats]         = useState<any>({});
  const [arrests, setArrests]     = useState<any[]>([]);
  const [missing, setMissing]     = useState<any[]>([]);
  const [cases, setCases]         = useState<any[]>([]);
  const [patrols, setPatrols]     = useState<any[]>([]);
  const [posts, setPosts]         = useState<any[]>([]);
  const [officers, setOfficers]   = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [citations, setCitations] = useState<any[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const [
      arrestRes, missingRes, caseRes, patrolRes,
      postRes, officerRes, approvalRes, citationRes,
    ] = await Promise.all([
      authFetch("/api/arrests?limit=100"),
      authFetch("/api/missing-records?limit=50"),
      authFetch("/api/incidents?limit=100"),
      authFetch("/api/patrols?limit=50"),
      authFetch("/api/posts?limit=50"),
      authFetch("/api/officers?limit=100"),
      authFetch("/api/command-requests?status=pending"),
      authFetch("/api/citations?limit=100"),
    ]);

    const a = arrestRes.data?.data   ?? [];
    const m = missingRes.data?.data  ?? [];
    const c = caseRes.data?.data     ?? [];
    const p = patrolRes.data?.data   ?? [];
    const po = postRes.data?.data    ?? [];
    const o = officerRes.data?.data  ?? [];
    const ap = approvalRes.data?.data ?? [];
    const ci = citationRes.data?.data ?? [];

    setArrests(a); setMissing(m); setCases(c); setPatrols(p);
    setPosts(po); setOfficers(o); setApprovals(ap); setCitations(ci);

    setStats({
      detained:    a.filter((x: any) => x.status === "detained").length,
      bailed:      a.filter((x: any) => x.status === "bailed").length,
      released:    a.filter((x: any) => x.status === "released").length,
      missing_active: m.filter((x: any) => x.status === "active").length,
      cases_open:  c.filter((x: any) => ["open","urgent","investigating"].includes(x.status)).length,
      patrols_active: p.filter((x: any) => x.status === "active").length,
      posts_total: po.length,
      officers_active: o.length,
      pending_approvals: ap.length,
      citations_unpaid: ci.filter((x: any) => x.status === "unpaid").length,
    });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const stationName = officerProfile?.station || "Kituo cha Polisi";
  const officerName = officerProfile?.name || "Kamanda";

  // ── Approve/Decline request ──────────────────────────────────
  const handleApproval = async (id: string, action: "approve"|"decline"|"hold", note?: string) => {
    await authFetch(`/api/command-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ action, note }),
    });
    load();
  };

  // ── Filtered lists ────────────────────────────────────────────
  const filtered = (list: any[], fields: string[]) =>
    !search ? list : list.filter(r => fields.some(f => String(r[f]??"").toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="flex h-screen bg-[#f5f7fa] overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0f1b35] flex flex-col transition-transform duration-200 ${menuOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0 lg:flex`}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-5 border-b border-white/10">
          <div className="h-9 w-9 overflow-hidden rounded-full bg-white/10">
            <Image src="/police-logo.png" alt="TPF" width={36} height={36} className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-black text-white truncate">TPF — Kituo</p>
            <p className="text-[10px] text-white/40 truncate">{stationName}</p>
          </div>
          <button onClick={() => setMenu(false)} className="ml-auto lg:hidden text-white/40"><X size={18}/></button>
        </div>

        {/* Officer info */}
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-[13px] font-bold text-white">{officerName}</p>
          <p className="text-[10px] text-white/40">Station Commander</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV.map(n => (
            <button key={n.id} onClick={() => { setScreen(n.id); setMenu(false); setSearch(""); }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition ${
                screen === n.id ? "bg-[#2196F3] text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}>
              <n.icon size={16} />
              {n.label}
              {n.id === "approvals" && stats.pending_approvals > 0 && (
                <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">{stats.pending_approvals}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button onClick={logout}
          className="flex items-center gap-3 px-5 py-4 text-[13px] text-white/40 hover:text-red-400 border-t border-white/10">
          <LogOut size={16}/> Toka
        </button>
      </aside>

      {/* Overlay */}
      {menuOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMenu(false)} />}

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 bg-[#0f1b35] border-b border-white/10 px-4 py-3 shadow-md">
          <button onClick={() => setMenu(true)} className="lg:hidden rounded-xl p-2 bg-gray-100"><Menu size={18}/></button>
          <div className="flex-1">
            <h1 className="text-[16px] font-black text-white">
              {NAV.find(n => n.id === screen)?.label ?? "Dashibodi"}
            </h1>
            <p className="text-[11px] text-white/50">{stationName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="rounded-xl p-2 bg-white/10">
              <RefreshCw size={16} className={`text-white/60 ${loading ? "animate-spin" : ""}`}/>
            </button>
            {screen !== "dashboard" && (
              <div className="relative hidden sm:block">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"/>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Tafuta..."
                  className="rounded-xl bg-gray-100 pl-8 pr-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"/>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4">

          {/* ── DASHBOARD ── */}
          {screen === "dashboard" && (
            <div className="space-y-4">
              {/* Stat grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { label:"Wafungwa Seli",    value: stats.detained,         color:"#EF4444", icon: Lock },
                  { label:"Waliodhamini",      value: stats.bailed,           color:"#8B5CF6", icon: Shield },
                  { label:"Wanapotea",         value: stats.missing_active,   color:"#FF9800", icon: Fingerprint },
                  { label:"Kesi Wazi",         value: stats.cases_open,       color:"#2196F3", icon: FileText },
                  { label:"Doria Zinazoendelea",value: stats.patrols_active,  color:"#10B981", icon: Shield },
                  { label:"Maafisa",           value: stats.officers_active,  color:"#1E3A8A", icon: Users },
                  { label:"Posti",             value: stats.posts_total,      color:"#059669", icon: MapPin },
                  { label:"Maombi Yangosubiri",value: stats.pending_approvals,color:"#DC2626", icon: ClipboardList },
                  { label:"Citations Zisizolipwa",value: stats.citations_unpaid,color:"#F59E0B",icon: Car },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <s.icon size={18} style={{color: s.color}}/>
                      <span className="text-[24px] font-black" style={{color: s.color}}>
                        {loading ? "—" : (s.value ?? 0)}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Two column layout */}
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Seli — wafungwa */}
                <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[14px] font-black text-gray-900 flex items-center gap-2">
                      <Lock size={14} className="text-red-500"/> Seli — Wafungwa ({stats.detained ?? 0})
                    </h3>
                    <button onClick={() => setScreen("arrests")} className="text-[11px] text-blue-500 font-medium">Ona Wote →</button>
                  </div>
                  {arrests.filter(a => a.status === "detained").slice(0, 5).map((a: any) => (
                    <div key={a.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50">
                        <UserX size={14} className="text-red-500"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-gray-900 truncate">{a.suspect_name}</p>
                        <p className="text-[11px] text-white/50">{a.offense}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge status={a.status}/>
                        <p className="text-[10px] text-gray-300 mt-0.5">{new Date(a.arrest_date).toLocaleDateString("sw-TZ")}</p>
                      </div>
                    </div>
                  ))}
                  {arrests.filter(a => a.status === "detained").length === 0 && (
                    <p className="text-center text-[12px] text-gray-400 py-4">Hakuna wafungwa</p>
                  )}
                </div>

                {/* Pending approvals */}
                <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[14px] font-black text-gray-900 flex items-center gap-2">
                      <ClipboardList size={14} className="text-blue-500"/> Maombi Yanayosubiri ({stats.pending_approvals ?? 0})
                    </h3>
                    <button onClick={() => setScreen("approvals")} className="text-[11px] text-blue-500 font-medium">Ona Wote →</button>
                  </div>
                  {approvals.slice(0, 5).map((r: any) => (
                    <div key={r.id} className="py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold text-gray-900 truncate">{r.subject}</p>
                          <p className="text-[11px] text-white/50">{r.requester_name}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => handleApproval(r.id, "approve")}
                            className="rounded-lg bg-green-500 px-2 py-1 text-[10px] font-bold text-white">✓</button>
                          <button onClick={() => handleApproval(r.id, "decline", "Imekataliwa na Kamanda")}
                            className="rounded-lg bg-red-500 px-2 py-1 text-[10px] font-bold text-white">✗</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {approvals.length === 0 && (
                    <p className="text-center text-[12px] text-gray-400 py-4">Hakuna maombi yanayosubiri</p>
                  )}
                </div>

                {/* Active patrols */}
                <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[14px] font-black text-gray-900 flex items-center gap-2">
                      <Shield size={14} className="text-green-500"/> Doria Zinazoendelea ({stats.patrols_active ?? 0})
                    </h3>
                    <button onClick={() => setScreen("patrols")} className="text-[11px] text-blue-500 font-medium">Ona Wote →</button>
                  </div>
                  {patrols.filter(p => p.status === "active").slice(0, 5).map((p: any) => (
                    <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50">
                        <Shield size={14} className="text-green-500"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-gray-900 truncate">{p.area}</p>
                        <p className="text-[11px] text-white/50">{p.patrol_number}</p>
                      </div>
                      <Badge status={p.status}/>
                    </div>
                  ))}
                  {patrols.filter(p => p.status === "active").length === 0 && (
                    <p className="text-center text-[12px] text-gray-400 py-4">Hakuna doria zinazoendelea</p>
                  )}
                </div>

                {/* Missing persons */}
                <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[14px] font-black text-gray-900 flex items-center gap-2">
                      <Fingerprint size={14} className="text-orange-500"/> Wanapotea ({stats.missing_active ?? 0})
                    </h3>
                    <button onClick={() => setScreen("missing")} className="text-[11px] text-blue-500 font-medium">Ona Wote →</button>
                  </div>
                  {missing.filter(m => m.status === "active").slice(0, 5).map((m: any) => (
                    <div key={m.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50">
                        <Fingerprint size={14} className="text-orange-500"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-gray-900 truncate">{m.identifier}</p>
                        <p className="text-[11px] text-white/50">{m.last_seen_location}</p>
                      </div>
                      <Badge status={m.status}/>
                    </div>
                  ))}
                  {missing.filter(m => m.status === "active").length === 0 && (
                    <p className="text-center text-[12px] text-gray-400 py-4">Hakuna ripoti za kutoweka</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── ARRESTS ── */}
          {screen === "arrests" && (
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                {["detained","bailed","released","charged","acquitted"].map(s => (
                  <span key={s} className={`rounded-xl px-3 py-1 text-[11px] font-bold ${STATUS_COLOR[s]}`}>
                    {s} ({arrests.filter(a => a.status===s).length})
                  </span>
                ))}
              </div>
              <div className="space-y-2">
                {filtered(arrests, ["suspect_name","arrest_number","offense"]).map((a: any) => (
                  <div key={a.id} className={`rounded-xl border p-4 bg-white shadow-sm ${a.status==="detained"?"border-red-200":a.status==="bailed"?"border-purple-200":"border-gray-100"}`}>
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
                      <Badge status={a.status}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── MISSING ── */}
          {screen === "missing" && (
            <div className="space-y-2">
              {filtered(missing, ["identifier","case_no","last_seen_location"]).map((m: any) => (
                <div key={m.id} className="rounded-xl bg-white border border-gray-100 shadow-sm p-4">
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
                    <Badge status={m.status}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── CASES ── */}
          {screen === "cases" && (
            <div className="space-y-2">
              {filtered(cases, ["type","incident_number","description","location"]).map((c: any) => (
                <div key={c.id} className={`rounded-xl bg-white border shadow-sm p-4 ${c.status==="urgent"?"border-red-200":c.status==="investigating"?"border-blue-200":"border-gray-100"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-black text-gray-900">{c.type}</p>
                      <p className="text-[12px] text-gray-500">{c.location}</p>
                      <div className="flex gap-3 mt-1 text-[10px] text-gray-400">
                        <span className="font-mono">{c.incident_number}</span>
                        <span>·</span><span>{c.date}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge status={c.status}/>
                      <div><Badge status={c.priority}/></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── PATROLS ── */}
          {screen === "patrols" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-[13px] text-gray-500">{patrols.length} doria zimeandikwa</p>
              </div>
              {filtered(patrols, ["area","patrol_number"]).map((p: any) => (
                <div key={p.id} className={`rounded-xl bg-white border shadow-sm p-4 ${p.status==="active"?"border-green-200":"border-gray-100"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-black text-gray-900">{p.area}</p>
                      <p className="text-[12px] text-gray-500 font-mono">{p.patrol_number}</p>
                      <div className="flex gap-3 mt-1 text-[10px] text-gray-400">
                        <Clock size={10}/><span>{p.start_time ? new Date(p.start_time).toLocaleString("sw-TZ") : "—"}</span>
                      </div>
                    </div>
                    <Badge status={p.status}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── POSTS ── */}
          {screen === "posts" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-[13px] text-gray-500">{posts.length} posti za kituo hiki</p>
              </div>
              {filtered(posts, ["name","location"]).map((p: any) => (
                <div key={p.id} className="rounded-xl bg-white border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-black text-gray-900">{p.name}</p>
                      <div className="flex gap-3 mt-1 text-[11px] text-gray-400">
                        <MapPin size={11}/><span>{p.location || "—"}</span>
                        <span>·</span><span>{p.officers_count ?? 0} maafisa</span>
                        <span>·</span><span className="capitalize">{p.type}</span>
                      </div>
                    </div>
                    <Badge status={p.status}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── OFFICERS ── */}
          {screen === "officers" && (
            <div className="space-y-2">
              {filtered(officers, ["name","badge_no","rank"]).map((o: any) => (
                <div key={o.id} className="rounded-xl bg-white border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[14px] font-black text-blue-600">
                      {o.name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-gray-900">{o.name}</p>
                      <p className="text-[11px] text-white/50">{o.rank} · {o.officer_number || o.badge_no}</p>
                    </div>
                    <Badge status={o.status || "active"}/>
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
                      <p className="text-[12px] text-gray-500">{r.requester_name} · {r.requester_role}</p>
                    </div>
                    <Badge status={r.status}/>
                  </div>
                  <p className="text-[12px] text-gray-600 mb-3 line-clamp-2">{r.description}</p>
                  {r.status === "pending" && (
                    <div className="flex gap-2">
                      <button onClick={() => handleApproval(r.id, "approve")}
                        className="flex-1 rounded-xl bg-green-500 py-2 text-[12px] font-bold text-white">
                        ✅ Idhinisha
                      </button>
                      <button onClick={() => handleApproval(r.id, "hold", "Inahitaji uchunguzi zaidi")}
                        className="flex-1 rounded-xl bg-orange-400 py-2 text-[12px] font-bold text-white">
                        ⏸ Simamisha
                      </button>
                      <button onClick={() => handleApproval(r.id, "decline", "Haikidhi masharti")}
                        className="flex-1 rounded-xl bg-red-500 py-2 text-[12px] font-bold text-white">
                        ❌ Kataa
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── CITATIONS ── */}
          {screen === "citations" && (
            <div className="space-y-2">
              {filtered(citations, ["driver_name","plate","citation_number","offense"]).map((c: any) => (
                <div key={c.id} className={`rounded-xl bg-white border shadow-sm p-4 ${c.status==="unpaid"?"border-red-200":"border-gray-100"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-black text-gray-900">{c.driver_name}</p>
                      <p className="text-[12px] text-gray-500">{c.offense} · <span className="font-mono font-bold">{c.plate}</span></p>
                      <div className="flex gap-3 mt-1 text-[10px] text-gray-400">
                        <span className="font-mono">{c.citation_number}</span>
                        <span>·</span><span>TZS {parseInt(c.amount||"0").toLocaleString()}</span>
                      </div>
                    </div>
                    <Badge status={c.status}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── CID SUMMARY ── */}
          {screen === "cid-summary" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label:"Kesi Zinachochunguzwa", value: cases.filter(c=>c.status==="investigating").length, color:"#8B5CF6" },
                  { label:"Kesi Wazi",              value: cases.filter(c=>c.status==="open").length,          color:"#2196F3" },
                  { label:"Kesi Muhimu",            value: cases.filter(c=>c.status==="urgent").length,        color:"#EF4444" },
                  { label:"Kesi Zilizofungwa",      value: cases.filter(c=>c.status==="resolved").length,      color:"#10B981" },
                  { label:"Watuhumiwa (Seli)",      value: stats.detained ?? 0,                                color:"#DC2626" },
                  { label:"Wanaotafutwa",           value: missing.filter(m=>m.status==="active").length,      color:"#FF9800" },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
                    <p className="text-[24px] font-black" style={{color:s.color}}>{s.value}</p>
                    <p className="text-[11px] text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
                <h3 className="text-[14px] font-black text-gray-900 mb-3">Kesi za Hivi Karibuni</h3>
                {cases.slice(0, 10).map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-[13px] font-bold text-gray-900">{c.type}</p>
                      <p className="text-[11px] text-white/50">{c.location} · {c.incident_number}</p>
                    </div>
                    <Badge status={c.status}/>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── BAIL ── */}
          {screen === "bail" && (
            <div className="space-y-2">
              {filtered(arrests.filter(a => a.status === "bailed"), ["suspect_name","arrest_number"]).map((a: any) => (
                <div key={a.id} className="rounded-xl bg-white border border-purple-200 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-black text-gray-900">{a.suspect_name}</p>
                      <p className="text-[12px] text-gray-500">{a.offense}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{a.arrest_number}</p>
                    </div>
                    <Badge status={a.status}/>
                  </div>
                </div>
              ))}
              {arrests.filter(a => a.status === "bailed").length === 0 && (
                <div className="rounded-2xl bg-white border border-gray-100 p-10 text-center text-gray-400">
                  <Shield size={32} className="mx-auto mb-2 opacity-30"/>
                  <p>Hakuna waliodhaminiwa</p>
                </div>
              )}
            </div>
          )}

          {screen === "profile" && (
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-[24px] font-black text-blue-600">
                  {officerName?.[0]}
                </div>
                <div>
                  <p className="text-[18px] font-black text-gray-900">{officerName}</p>
                  <p className="text-[13px] text-gray-500">Station Commander</p>
                  <p className="text-[12px] text-gray-400">{stationName}</p>
                </div>
              </div>
              <div className="space-y-2 text-[13px]">
                {[
                  { l:"Badge", v: officerProfile?.badgeNo },
                  { l:"Kituo", v: officerProfile?.station },
                  { l:"Mkoa",  v: officerProfile?.region },
                ].map(({l,v}) => (
                  <div key={l} className="flex justify-between border-b border-gray-50 py-2">
                    <span className="text-gray-500">{l}</span>
                    <span className="font-medium text-gray-900">{v || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {screen === "search" && (
            <UniversalSearchScreen onBack={() => setScreen("dashboard")} />
          )}

        </main>
      </div>

      {/* ── Detail Modal ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between bg-[#0f1b35] px-5 py-3">
              <h3 className="text-[15px] font-black text-white">
                {selected.suspect_name ? "Mtuhumiwa" : selected.offense ? "Kesi" : selected.identifier ? "Mpotea" : "Posti"}
              </h3>
              <button onClick={() => setSelected(null)} className="text-white/60 hover:text-white">
                <X size={20}/>
              </button>
            </div>
            <div className="p-5 space-y-3">
              {Object.entries(selected).filter(([k]) =>
                !["id","created_at","updated_at","officer_id","station_id","citizen_id"].includes(k)
              ).map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-4 border-b border-gray-50 pb-2 last:border-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 shrink-0">
                    {k.replace(/_/g," ")}
                  </span>
                  <span className="text-[13px] text-gray-900 font-medium text-right">
                    {String(v ?? "—")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
