// @ts-nocheck
"use client";
// CLERK SHELL — Data Entry Powerhouse
// Clerk (Karani) role:
//   - Primary data entry officer for ALL record types
//   - Can initiate: citizens, vehicles, missing persons, warrants, incidents
//   - Bulk import (CSV/JSON) → Supabase
//   - Pull from integrated services (NIDA, BRELA, TRA, SUMATRA)
//   - Views all command-initiated operations (missing persons, warrants)
//   - Cannot: manage users, stations, posts, system settings (admin tools)

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  LayoutDashboard, FileText, Users, Car, Search, Upload,
  Download, AlertTriangle, Package, Shield, Bell, Menu, X,
  LogOut, RefreshCw, Plus, ChevronRight, Loader2, Database,
  FileSpreadsheet, Globe, CheckCircle, Clock, Eye, Zap,
  UserX, MapPin, Fingerprint, FileSearch, Settings,
} from "lucide-react";
import { useTheme } from "next-themes";
import { authFetch } from "@/lib/client-auth";
import { useApiData } from "@/hooks/use-api-data";
import { toast } from "@/hooks/use-toast";

// ── Nav ────────────────────────────────────────────────────────────────
type ClerkScreen =
  | "dashboard" | "citizens" | "vehicles" | "missing"
  | "incidents" | "arrests" | "citations" | "lost-items"
  | "bulk-import" | "integrated" | "exports" | "settings";

const NAV_ITEMS: { id: ClerkScreen; label: string; labelSw: string; icon: typeof LayoutDashboard; group?: string }[] = [
  { id: "dashboard",   label: "Dashboard",     labelSw: "Dashibodi",         icon: LayoutDashboard, group: "main" },
  { id: "citizens",    label: "Citizens",       labelSw: "Raia",              icon: Users,           group: "records" },
  { id: "vehicles",    label: "Vehicles",       labelSw: "Magari",            icon: Car,             group: "records" },
  { id: "missing",     label: "Missing/Wanted", labelSw: "Wanaotafutwa",      icon: AlertTriangle,   group: "records" },
  { id: "incidents",   label: "Incidents",      labelSw: "Matukio",           icon: Shield,          group: "records" },
  { id: "arrests",     label: "Arrests",        labelSw: "Makamato",          icon: UserX,           group: "records" },
  { id: "citations",   label: "Citations",      labelSw: "Citations",         icon: FileText,        group: "records" },
  { id: "lost-items",  label: "Lost & Found",   labelSw: "Mali Zilizopotea",  icon: Package,         group: "records" },
  { id: "bulk-import", label: "Bulk Import",    labelSw: "Ingiza Wingi",      icon: Upload,          group: "tools" },
  { id: "integrated",  label: "Ext. Services",  labelSw: "Huduma za Nje",     icon: Globe,           group: "tools" },
  { id: "exports",     label: "Export",         labelSw: "Hamisha",           icon: Download,        group: "tools" },
  { id: "settings",    label: "Settings",       labelSw: "Mipangilio",        icon: Settings,        group: "config" },
];

const GROUPS = [
  { key: "main",    label: "Msingi" },
  { key: "records", label: "Rekodi" },
  { key: "tools",   label: "Zana" },
  { key: "config",  label: "" },
];

// ── Main Shell ─────────────────────────────────────────────────────────
export function ClerkShell() {
  const { theme, setTheme } = useTheme();
  const [screen, setScreen]       = useState<ClerkScreen>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser]           = useState<any>(null);

  // Fetch clerk profile
  useEffect(() => {
    fetch("/api/police/me")
      .then(r => r.json())
      .then(j => { if (j.ok) setUser(j.data); })
      .catch(() => {});
  }, []);

  const initials = user?.shortName?.split(" ").map((w: string) => w[0]).join("").slice(0,2).toUpperCase() || "CK";

  return (
    <div className="flex h-screen overflow-hidden bg-police">
      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-56 flex-col bg-[#0d1b3d] transition-transform duration-300 lg:static lg:flex lg:translate-x-0 ${sidebarOpen ? "flex translate-x-0" : "hidden -translate-x-full"}`}>
        {/* Logo */}
        <div className="flex h-14 items-center gap-3 border-b border-white/10 px-4">
          <Image src="/police-logo.png" alt="TPF" width={32} height={32} className="h-8 w-8 rounded-full" />
          <div className="min-w-0">
            <p className="text-[12px] font-bold text-white">Karani wa Data</p>
            <p className="text-[9px] text-white/40">Tanzania Police Force</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto text-white/40 lg:hidden"><X size={16} /></button>
        </div>

        {/* User */}
        <div className="border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2196F3] text-[11px] font-bold text-white">{initials}</div>
            <div className="min-w-0">
              {user ? (
                <>
                  <p className="truncate text-[11px] font-bold text-white">{user.shortName || user.name}</p>
                  <p className="truncate text-[9px] text-white/50">{user.rank || "Karani"} · {user.badgeNo}</p>
                  <p className="truncate text-[9px] text-white/30">{user.station || "—"}</p>
                </>
              ) : (
                <div className="space-y-1"><div className="h-2 w-20 animate-pulse rounded bg-white/10"/><div className="h-1.5 w-14 animate-pulse rounded bg-white/10"/></div>
              )}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          {GROUPS.map(group => {
            const items = NAV_ITEMS.filter(n => n.group === group.key);
            return (
              <div key={group.key}>
                {group.label && <p className="px-4 pt-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-white/30">{group.label}</p>}
                {items.map(item => {
                  const Icon = item.icon;
                  const active = screen === item.id;
                  return (
                    <button key={item.id} onClick={() => { setScreen(item.id); setSidebarOpen(false); }}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${active ? "bg-[#2196F3]/20 text-white" : "text-white/50 hover:bg-white/5 hover:text-white"}`}>
                      <Icon size={15} />
                      <span className="text-[12px] font-medium">{item.labelSw}</span>
                      {active && <ChevronRight size={12} className="ml-auto text-[#2196F3]" />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 p-3">
          <button onClick={() => window.location.href = "/api/auth/signout"}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-medium text-white/40 hover:bg-white/10 hover:text-white">
            <LogOut size={13} /> Toka
          </button>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-police-soft bg-police-card px-4 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="text-police lg:hidden"><Menu size={22} /></button>
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-police">{NAV_ITEMS.find(n=>n.id===screen)?.labelSw}</p>
            <p className="text-[10px] text-police-faint">Karani wa Data · {user?.station || "—"}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setTheme(theme==="dark"?"light":"dark")}
              className="rounded-lg bg-police-soft p-2 text-police-muted hover:text-police">
              {theme==="dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        {/* Screen */}
        <main className="flex-1 overflow-y-auto">
          {screen === "dashboard"   && <ClerkDashboard user={user} setScreen={setScreen} />}
          {screen === "citizens"    && <ClerkCitizens />}
          {screen === "vehicles"    && <ClerkVehicles />}
          {screen === "missing"     && <ClerkMissing />}
          {screen === "incidents"   && <ClerkIncidents />}
          {screen === "arrests"     && <ClerkArrests />}
          {screen === "citations"   && <ClerkCitations />}
          {screen === "lost-items"  && <ClerkLostItems />}
          {screen === "bulk-import" && <ClerkBulkImport />}
          {screen === "integrated"  && <ClerkIntegrated />}
          {screen === "exports"     && <ClerkExports user={user} />}
          {screen === "settings"    && <ClerkSettings />}
        </main>
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────
function ClerkDashboard({ user, setScreen }: { user: any; setScreen: (s: ClerkScreen) => void }) {
  const [stats, setStats] = useState({ citizens:0, vehicles:0, missing:0, incidents:0, arrests:0, citations:0, lostItems:0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/citizens?limit=1").then(r=>r.json()),
      fetch("/api/vehicles?limit=1").then(r=>r.json()),
      fetch("/api/missing?limit=1").then(r=>r.json()),
      fetch("/api/incidents?limit=5").then(r=>r.json()),
      fetch("/api/arrests?limit=1").then(r=>r.json()),
      fetch("/api/citations?limit=1").then(r=>r.json()),
      fetch("/api/lost-items?limit=1").then(r=>r.json()),
    ]).then(([cit,veh,mis,inc,arr,cits,lost]) => {
      setStats({
        citizens:  cit.total  ?? cit.data?.length  ?? 0,
        vehicles:  veh.total  ?? veh.data?.length  ?? 0,
        missing:   mis.total  ?? mis.data?.length  ?? 0,
        incidents: inc.total  ?? inc.data?.length  ?? 0,
        arrests:   arr.total  ?? arr.data?.length  ?? 0,
        citations: cits.total ?? cits.data?.length ?? 0,
        lostItems: lost.total ?? lost.data?.length ?? 0,
      });
      setRecent((inc.data ?? []).slice(0,5));
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const STAT_CARDS = [
    { label: "Raia Waliohifadhiwa",     value: stats.citizens,  icon: Users,         color: "#2196F3", screen: "citizens"   as ClerkScreen },
    { label: "Magari",                  value: stats.vehicles,  icon: Car,           color: "#10B981", screen: "vehicles"   as ClerkScreen },
    { label: "Wanaotafutwa",            value: stats.missing,   icon: AlertTriangle, color: "#EF4444", screen: "missing"    as ClerkScreen },
    { label: "Matukio",                 value: stats.incidents, icon: Shield,        color: "#FF9800", screen: "incidents"  as ClerkScreen },
    { label: "Makamato",                value: stats.arrests,   icon: UserX,         color: "#8B5CF6", screen: "arrests"    as ClerkScreen },
    { label: "Citations",               value: stats.citations, icon: FileText,      color: "#EF4444", screen: "citations"  as ClerkScreen },
    { label: "Mali Zilizopotea",        value: stats.lostItems, icon: Package,       color: "#FF9800", screen: "lost-items" as ClerkScreen },
  ];

  const QUICK_ENTRY = [
    { label: "Ongeza Raia",          icon: Users,        color: "#2196F3", screen: "citizens"   as ClerkScreen },
    { label: "Sajili Gari",          icon: Car,          color: "#10B981", screen: "vehicles"   as ClerkScreen },
    { label: "Ripoti Mtu Anayetafutwa", icon: AlertTriangle, color: "#EF4444", screen: "missing"  as ClerkScreen },
    { label: "Ingiza Data kwa Wingi", icon: Upload,       color: "#8B5CF6", screen: "bulk-import"as ClerkScreen },
    { label: "Huduma za Nje",        icon: Globe,        color: "#FF9800", screen: "integrated" as ClerkScreen },
    { label: "Mali Iliyopotea",      icon: Package,      color: "#FF9800", screen: "lost-items" as ClerkScreen },
  ];

  return (
    <div className="space-y-5 p-5">
      {/* Welcome */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-[#2196F3] p-5 text-white">
        <p className="text-[12px] font-semibold text-white/70">Karibu,</p>
        <h1 className="text-[20px] font-black">{user?.shortName || user?.name || "Karani"}</h1>
        <p className="text-[12px] text-white/70">{user?.station} · {user?.rank}</p>
        <p className="mt-2 text-[11px] text-white/50">Tarehe: {new Date().toLocaleDateString("sw-TZ",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {loading
          ? Array(7).fill(0).map((_,i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-police-card"/>)
          : STAT_CARDS.map(s => (
            <button key={s.label} onClick={() => setScreen(s.screen)}
              className="flex flex-col items-start rounded-xl bg-police-card p-3 shadow-sm text-left hover:shadow-md transition active:scale-[0.98]">
              <s.icon size={16} style={{color:s.color}}/>
              <span className="mt-2 text-[22px] font-black" style={{color:s.color}}>{s.value.toLocaleString()}</span>
              <span className="text-[10px] leading-tight text-police-muted">{s.label}</span>
            </button>
          ))
        }
      </div>

      {/* Quick entry */}
      <div>
        <p className="mb-3 text-[13px] font-bold text-police">Ingizo la Haraka</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {QUICK_ENTRY.map(q => (
            <button key={q.label} onClick={() => setScreen(q.screen)}
              className="flex items-center gap-3 rounded-xl bg-police-card p-3 text-left shadow-sm hover:shadow-md active:scale-[0.98]">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{backgroundColor:`${q.color}15`}}>
                <q.icon size={18} style={{color:q.color}}/>
              </div>
              <span className="text-[12px] font-semibold text-police">{q.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent incidents */}
      {recent.length > 0 && (
        <div className="rounded-2xl bg-police-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13px] font-bold text-police">Matukio ya Hivi Karibuni</p>
            <button onClick={() => setScreen("incidents")} className="text-[11px] font-semibold text-[#2196F3]">Angalia Zote</button>
          </div>
          <div className="divide-y divide-police-soft">
            {recent.map((inc:any) => (
              <div key={inc.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-[12px] font-semibold text-police">{inc.incident_type || inc.type || "Tukio"}</p>
                  <p className="text-[10px] text-police-faint">{inc.location || "—"} · {inc.created_at ? new Date(inc.created_at).toLocaleDateString("sw-TZ") : "—"}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold text-white ${inc.status==="open"?"bg-[#FF9800]":inc.status==="closed"?"bg-[#10B981]":"bg-[#2196F3]"}`}>
                  {inc.status || "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Reusable Record List Screen ────────────────────────────────────────
function RecordList({ title, endpoint, columns, addLabel, onAdd, refreshMs, searchPlaceholder }: {
  title: string; endpoint: string; columns: {key:string;label:string;render?:(v:any,row:any)=>string}[];
  addLabel?: string; onAdd?: ()=>void; refreshMs?: number; searchPlaceholder?: string;
}) {
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState("");
  const { data, loading, refetch } = useApiData<any>(
    applied ? `${endpoint}?search=${encodeURIComponent(applied)}&limit=100` : `${endpoint}?limit=100`,
    undefined, [applied], refreshMs ? { refreshMs } : undefined
  );
  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-police bg-police-card px-3">
          <Search size={14} className="shrink-0 text-police-faint"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&setApplied(search)}
            placeholder={searchPlaceholder||"Tafuta..."} className="h-9 flex-1 bg-transparent text-[13px] text-police focus:outline-none"/>
          {search && <button onClick={()=>{setSearch("");setApplied("");}}><X size={13} className="text-police-faint"/></button>}
        </div>
        <button onClick={()=>setApplied(search)} className="rounded-xl bg-[#1E3A8A] px-3 py-2 text-white"><Search size={15}/></button>
        <button onClick={()=>refetch()} className="rounded-xl bg-police-soft p-2 text-police-muted"><RefreshCw size={15}/></button>
        {onAdd && <button onClick={onAdd} className="flex items-center gap-1.5 rounded-xl bg-[#2196F3] px-3 py-2 text-[12px] font-bold text-white"><Plus size={14}/>{addLabel}</button>}
      </div>
      <div className="rounded-2xl bg-police-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="border-b border-police-soft bg-police-muted/30">
              <tr>{columns.map(col=><th key={col.key} className="px-4 py-3 text-left font-semibold text-police-muted">{col.label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-police-soft">
              {loading
                ? Array(5).fill(0).map((_,i)=><tr key={i}>{columns.map((_,j)=><td key={j} className="px-4 py-3"><div className="h-3 animate-pulse rounded bg-police-soft"/></td>)}</tr>)
                : data.length === 0
                  ? <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-[13px] text-police-muted">Hakuna rekodi. {onAdd&&<button onClick={onAdd} className="ml-2 font-semibold text-[#2196F3]">Ongeza kwanza</button>}</td></tr>
                  : data.map((row:any)=>(
                    <tr key={row.id} className="hover:bg-police-muted/10">
                      {columns.map(col=>(
                        <td key={col.key} className="px-4 py-3 text-police">
                          {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        {data.length > 0 && <div className="border-t border-police-soft px-4 py-2 text-[11px] text-police-faint">{data.length} rekodi</div>}
      </div>
    </div>
  );
}

// ── Specific record screens ────────────────────────────────────────────
function ClerkCitizens() {
  const [showAdd, setShowAdd] = useState(false);
  return showAdd
    ? <EmbedCitizenForm onClose={() => setShowAdd(false)} />
    : <RecordList title="Raia" endpoint="/api/citizens" searchPlaceholder="Jina, NIDA, simu..."
        addLabel="Ongeza Raia" onAdd={() => setShowAdd(true)}
        columns={[
          {key:"name",label:"Jina Kamili"},
          {key:"nida",label:"NIDA",render:(_,r)=>r.nida||"—"},
          {key:"phone",label:"Simu",render:(_,r)=>r.mobile||r.phone||"—"},
          {key:"region",label:"Mkoa",render:(_,r)=>r.region||"—"},
          {key:"tribe",label:"Kabila",render:(_,r)=>r.tribe||"—"},
          {key:"created_at",label:"Tarehe",render:(_,r)=>r.created_at?new Date(r.created_at).toLocaleDateString("sw-TZ"):"—"},
        ]} />;
}

function ClerkVehicles() {
  const [showAdd, setShowAdd] = useState(false);
  return showAdd
    ? <EmbedVehicleForm onClose={() => setShowAdd(false)} />
    : <RecordList title="Magari" endpoint="/api/vehicles" searchPlaceholder="Namba ya gari, chassis..."
        addLabel="Sajili Gari" onAdd={() => setShowAdd(true)}
        columns={[
          {key:"plate",label:"Namba ya Gari"},
          {key:"make",label:"Chapa",render:(_,r)=>`${r.make||""}${r.model?" "+r.model:""}`.trim()||"—"},
          {key:"color",label:"Rangi"},
          {key:"owner_name",label:"Mmiliki"},
          {key:"status",label:"Hali"},
          {key:"created_at",label:"Tarehe",render:(_,r)=>r.created_at?new Date(r.created_at).toLocaleDateString("sw-TZ"):"—"},
        ]} />;
}

function ClerkMissing() {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({type:"person",title:"",identifier:"",details:"",lastSeen:"",lastSeenLocation:"",reportedBy:"",station:""});
  const [saving, setSaving] = useState(false);
  const { data, loading, refetch } = useApiData<any>("/api/missing?limit=100", undefined, [], {refreshMs:15000});
  const set = (k:string) => (e:any) => setForm(f=>({...f,[k]:e.target.value}));
  const save = async () => {
    if (!form.title) { toast({title:"Kosa",description:"Kichwa kinahitajika",variant:"destructive"}); return; }
    setSaving(true);
    const {error} = await authFetch("/api/missing",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
    setSaving(false);
    if (error) { toast({title:"Hitilafu",description:error,variant:"destructive"}); return; }
    toast({title:"Imehifadhiwa ✓"}); setShowAdd(false); refetch();
  };
  const TYPE_COLOR:any = {person:"#EF4444",car:"#2196F3",device:"#FF9800",property:"#10B981"};
  const TYPE_LABEL:any = {person:"Mtu",car:"Gari",device:"Kifaa",property:"Mali"};
  if (showAdd) return (
    <div className="max-w-xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setShowAdd(false)} className="text-[#2196F3] text-[13px] font-semibold">← Rudi</button>
        <h2 className="text-[16px] font-bold text-police">Ripoti Mpya — Wanaotafutwa</h2>
      </div>
      <div className="rounded-2xl bg-police-card p-4 shadow-sm space-y-3">
        <div>
          <label className={lbl}>Aina *</label>
          <div className="flex gap-2">
            {["person","car","device","property"].map(t=>(
              <button key={t} onClick={()=>setForm(f=>({...f,type:t}))}
                className={`flex-1 rounded-xl py-2 text-[11px] font-bold border transition ${form.type===t?"text-white border-transparent":"border-police-soft text-police-muted"}`}
                style={form.type===t?{backgroundColor:TYPE_COLOR[t]}:{}}>
                {TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        </div>
        <FI label="Kichwa / Jina *" value={form.title} onChange={set("title")} placeholder={form.type==="person"?"Jina la mtu anayetafutwa":form.type==="car"?"Namba ya gari":"Maelezo ya kifaa"} />
        <FI label={form.type==="person"?"NIDA / Namba ya Kitambulisho":form.type==="car"?"Namba ya Usajili":"Serial Number / IMEI"} value={form.identifier} onChange={set("identifier")} />
        <div>
          <label className={lbl}>Maelezo</label>
          <textarea rows={3} value={form.details} onChange={set("details")} placeholder="Maelezo ya kina..." className={ta}/>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FI label="Alionekana Mwisho (Tarehe)" value={form.lastSeen} onChange={set("lastSeen")} type="date" />
          <FI label="Mahali Alipoonekana Mwisho" value={form.lastSeenLocation} onChange={set("lastSeenLocation")} placeholder="e.g. Kariakoo, DSM" />
        </div>
        <FI label="Aliyeripoti" value={form.reportedBy} onChange={set("reportedBy")} placeholder="Jina la mripoti" />
        <button onClick={save} disabled={saving} className="w-full rounded-xl bg-[#EF4444] py-3 text-[14px] font-bold text-white disabled:opacity-50">
          {saving?<><Loader2 size={14} className="inline animate-spin mr-1"/>Inahifadhi...</>:"Hifadhi Ripoti"}
        </button>
      </div>
    </div>
  );
  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-[16px] font-bold text-police">Wanaotafutwa / Vitu</h2>
          <p className="text-[12px] text-police-muted">Rekodi zilizoanzishwa na Karani na Kamandi</p></div>
        <button onClick={()=>setShowAdd(true)} className="flex items-center gap-2 rounded-xl bg-[#EF4444] px-4 py-2 text-[12px] font-bold text-white"><Plus size={14}/>Ripoti Mpya</button>
      </div>
      <div className="rounded-2xl bg-police-card shadow-sm overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="border-b border-police-soft bg-police-muted/30">
            <tr>
              {["Kesi #","Aina","Kichwa/Jina","Kitambulisho","Mahali pa Mwisho","Hali","Tarehe"].map(h=><th key={h} className="px-4 py-3 text-left font-semibold text-police-muted">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-police-soft">
            {loading ? Array(4).fill(0).map((_,i)=><tr key={i}>{Array(7).fill(0).map((_,j)=><td key={j} className="px-4 py-3"><div className="h-3 animate-pulse rounded bg-police-soft"/></td>)}</tr>)
            : data.length===0 ? <tr><td colSpan={7} className="px-4 py-10 text-center text-police-muted">Hakuna rekodi. <button onClick={()=>setShowAdd(true)} className="font-semibold text-[#EF4444]">Anza ripoti ya kwanza</button></td></tr>
            : data.map((r:any)=>(
              <tr key={r.id} className="hover:bg-police-muted/10">
                <td className="px-4 py-3 font-mono text-[11px] text-police-faint">{r.case_no||r.id?.slice(0,8)}</td>
                <td className="px-4 py-3"><span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{backgroundColor:TYPE_COLOR[r.type]||"#6B7280"}}>{TYPE_LABEL[r.type]||r.type}</span></td>
                <td className="px-4 py-3 font-medium text-police">{r.title}</td>
                <td className="px-4 py-3 text-police-muted">{r.identifier||"—"}</td>
                <td className="px-4 py-3 text-police-muted">{r.last_seen_location||"—"}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${r.status==="active"?"bg-[#EF4444]/15 text-[#EF4444]":"bg-[#10B981]/15 text-[#10B981]"}`}>{r.status==="active"?"Inatafutwa":"Imetatuliwa"}</span></td>
                <td className="px-4 py-3 text-police-faint">{r.created_at?new Date(r.created_at).toLocaleDateString("sw-TZ"):"—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length>0&&<div className="border-t border-police-soft px-4 py-2 text-[11px] text-police-faint">{data.length} rekodi · 15s auto-refresh</div>}
      </div>
    </div>
  );
}

function ClerkIncidents() {
  return <RecordList title="Matukio" endpoint="/api/incidents" searchPlaceholder="Tukio, mahali..."
    columns={[
      {key:"type",label:"Aina",render:(_,r)=>r.incident_type||r.type||"—"},
      {key:"location",label:"Mahali"},
      {key:"status",label:"Hali"},
      {key:"officer_name",label:"Afisa"},
      {key:"created_at",label:"Tarehe",render:(_,r)=>r.created_at?new Date(r.created_at).toLocaleDateString("sw-TZ"):"—"},
    ]} refreshMs={15000}/>;
}

function ClerkArrests() {
  return <RecordList title="Makamato" endpoint="/api/arrests" searchPlaceholder="Jina, kosa..."
    columns={[
      {key:"suspect_name",label:"Jina la Mtuhumiwa"},
      {key:"charge",label:"Kosa"},
      {key:"location",label:"Mahali"},
      {key:"status",label:"Hali"},
      {key:"officer_name",label:"Afisa"},
      {key:"created_at",label:"Tarehe",render:(_,r)=>r.created_at?new Date(r.created_at).toLocaleDateString("sw-TZ"):"—"},
    ]} refreshMs={15000}/>;
}

function ClerkCitations() {
  return <RecordList title="Citations" endpoint="/api/citations" searchPlaceholder="Namba ya gari, kosa..."
    columns={[
      {key:"citation_number",label:"Namba"},
      {key:"plate",label:"Gari"},
      {key:"offense",label:"Kosa"},
      {key:"amount",label:"Faini (TZS)"},
      {key:"status",label:"Hali"},
      {key:"created_at",label:"Tarehe",render:(_,r)=>r.created_at?new Date(r.created_at).toLocaleDateString("sw-TZ"):"—"},
    ]} refreshMs={15000}/>;
}

function ClerkLostItems() {
  return <RecordList title="Mali Zilizopotea" endpoint="/api/lost-items" searchPlaceholder="Maelezo, S/N, jina..."
    columns={[
      {key:"item_number",label:"Namba"},
      {key:"category",label:"Aina"},
      {key:"description",label:"Maelezo"},
      {key:"owner_name",label:"Mwenye"},
      {key:"status",label:"Hali"},
      {key:"reported_date",label:"Tarehe Iliyoripotiwa"},
    ]} refreshMs={15000}/>;
}

// ── Bulk Import ────────────────────────────────────────────────────────
function ClerkBulkImport() {
  const [tab, setTab] = useState<"citizens"|"vehicles">("citizens");
  const [csvText, setCsvText] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const CITIZEN_HEADERS = ["name","nida","mobile","gender","dob","region","district","ward","tribe","occupation"];
  const VEHICLE_HEADERS = ["plate","make","model","color","year","chassis","owner_name","owner_phone","region"];
  const headers = tab==="citizens" ? CITIZEN_HEADERS : VEHICLE_HEADERS;

  const parseCSV = (text: string) => {
    const lines = text.trim().split("\n");
    const headerLine = lines[0].split(",").map(h=>h.trim().toLowerCase());
    return lines.slice(1).map(line => {
      const vals = line.split(",").map(v=>v.trim().replace(/^"|"$/g,""));
      const obj: any = {};
      headerLine.forEach((h,i) => { obj[h] = vals[i] || ""; });
      return obj;
    }).filter(r => Object.values(r).some(v => v));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { const text = ev.target?.result as string; setCsvText(text); setRows(parseCSV(text)); };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleImport = async () => {
    if (!rows.length) return;
    setImporting(true); setDone(0); setErrors([]);
    const endpoint = tab==="citizens" ? "/api/citizens" : "/api/vehicles";
    let success = 0; const errs: string[] = [];
    for (const row of rows) {
      const {error} = await authFetch(endpoint, {
        method:"POST",headers:{"Content-Type":"application/json"},
        body: JSON.stringify(tab==="citizens"
          ? {name:row.name,nida:row.nida,mobile:row.mobile,gender:row.gender||"Mme",dob:row.dob||null,region:row.region,district:row.district,ward:row.ward,tribe:row.tribe,occupation:row.occupation}
          : {plate:row.plate?.toUpperCase(),make:row.make,model:row.model,color:row.color,year:row.year,chassis:row.chassis,ownerName:row.owner_name,ownerPhone:row.owner_phone,region:row.region}
        ),
      });
      if (error) errs.push(`${row.name||row.plate}: ${error}`);
      else success++;
      setDone(success);
    }
    setErrors(errs); setImporting(false);
    toast({title:`${success}/${rows.length} zimeingizwa${errs.length>0?` (Makosa: ${errs.length})`:""}`, variant: errs.length>0?"destructive":"default"});
  };

  return (
    <div className="max-w-3xl space-y-5 p-5">
      <div><h2 className="text-[17px] font-bold text-police">Ingizo la Wingi (Bulk Import)</h2>
        <p className="text-[12px] text-police-muted">Ingiza rekodi nyingi mara moja kwa faili la CSV</p></div>

      <div className="flex gap-2">
        {[{id:"citizens",label:"Raia"},{id:"vehicles",label:"Magari"}].map(t=>(
          <button key={t.id} onClick={()=>{setTab(t.id as any);setRows([]);setCsvText("");setErrors([]);setDone(0);}}
            className={`rounded-xl px-4 py-2 text-[12px] font-bold transition ${tab===t.id?"bg-[#1E3A8A] text-white":"bg-police-soft text-police-muted"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-police-card p-4 shadow-sm space-y-3">
        <div>
          <p className="text-[12px] font-bold text-police mb-1">Muundo wa CSV (Safu mlalo za kwanza):</p>
          <code className="block rounded-lg bg-police-soft px-3 py-2 text-[11px] font-mono text-police-muted">{headers.join(",")}</code>
        </div>
        <div className="flex gap-3">
          <button onClick={()=>fileRef.current?.click()} className="flex items-center gap-2 rounded-xl border-2 border-dashed border-police-soft px-4 py-3 text-[12px] font-semibold text-police-muted hover:border-[#2196F3] hover:text-[#2196F3] transition">
            <Upload size={16}/> Chagua Faili la CSV
          </button>
          <button onClick={()=>{
            const sample = [headers.join(","), headers.map(h=>h==="gender"?"Mme":h==="year"?"2020":"Mfano").join(",")].join("\n");
            const blob = new Blob([sample],{type:"text/csv"});
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href=url; a.download=`mfano_${tab}.csv`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
          }} className="flex items-center gap-2 rounded-xl bg-police-soft px-4 py-3 text-[12px] font-semibold text-police-muted">
            <Download size={16}/> Pakua Mfano wa CSV
          </button>
        </div>
        <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFile}/>

        {rows.length>0 && (
          <>
            <div className="rounded-xl border border-[#10B981]/30 bg-[#10B981]/5 p-3">
              <p className="text-[12px] font-semibold text-[#10B981]">✓ {rows.length} rekodi zimegunduliwa katika faili</p>
            </div>
            {/* Preview first 3 rows */}
            <div className="overflow-x-auto rounded-xl border border-police-soft">
              <table className="w-full text-[11px]">
                <thead className="bg-police-soft"><tr>{headers.map(h=><th key={h} className="px-3 py-2 text-left font-semibold text-police-muted">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-police-soft">
                  {rows.slice(0,3).map((r,i)=><tr key={i}>{headers.map(h=><td key={h} className="px-3 py-2 text-police">{r[h]||"—"}</td>)}</tr>)}
                  {rows.length>3&&<tr><td colSpan={headers.length} className="px-3 py-2 text-center text-police-faint">... na rekodi {rows.length-3} zaidi</td></tr>}
                </tbody>
              </table>
            </div>
            <button onClick={handleImport} disabled={importing}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2196F3] py-3.5 text-[14px] font-bold text-white disabled:opacity-60">
              {importing
                ? <><Loader2 size={16} className="animate-spin"/> Inaingiza {done}/{rows.length}...</>
                : <><Upload size={16}/> Ingiza Rekodi {rows.length}</>}
            </button>
          </>
        )}
        {errors.length>0&&(
          <div className="rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/5 p-3 space-y-1 max-h-40 overflow-y-auto">
            <p className="text-[11px] font-bold text-[#EF4444]">Makosa {errors.length}:</p>
            {errors.map((e,i)=><p key={i} className="text-[10px] text-[#EF4444]">{e}</p>)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Integrated Services ────────────────────────────────────────────────
function ClerkIntegrated() {
  const [active, setActive] = useState<string|null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const SERVICES = [
    { id:"nida", name:"NIDA", desc:"Utafutaji wa Kitambulisho cha Taifa", color:"#1E3A8A", icon:Fingerprint, type:"citizen" },
    { id:"brela", name:"BRELA", desc:"Usajili wa Biashara — Business Registry", color:"#10B981", icon:FileSearch, type:"business" },
    { id:"tra", name:"TRA", desc:"Mamlaka ya Mapato Tanzania — Tax Records", color:"#FF9800", icon:FileText, type:"tax" },
    { id:"sumatra", name:"SUMATRA", desc:"Usajili wa Magari na Leseni", color:"#2196F3", icon:Car, type:"vehicle" },
    { id:"tpf-central", name:"TPF Central DB", desc:"Rekodi za Polisi za Kitaifa", color:"#8B5CF6", icon:Database, type:"police" },
  ];

  const handleSearch = async () => {
    if (!query.trim() || !active) return;
    setLoading(true); setResult(null);
    try {
      // Route to the appropriate internal endpoint
      const svc = SERVICES.find(s=>s.id===active);
      const endpoint = svc?.type==="vehicle"
        ? `/api/search?q=${encodeURIComponent(query)}&type=plate`
        : `/api/search?q=${encodeURIComponent(query)}&type=${svc?.type==="citizen"?"nida":"name"}`;
      const res = await fetch(endpoint);
      const json = await res.json();
      setResult(json);
    } catch { setResult({found:false,error:"Huduma haipatikani sasa hivi"}); }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl space-y-5 p-5">
      <div><h2 className="text-[17px] font-bold text-police">Huduma za Nje / Integrated Services</h2>
        <p className="text-[12px] text-police-muted">Pata data kutoka mifumo iliyounganishwa</p></div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SERVICES.map(s=>(
          <button key={s.id} onClick={()=>{setActive(s.id);setResult(null);setQuery("");}}
            className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${active===s.id?"border-transparent text-white":"border-police-soft bg-police-card text-police"}`}
            style={active===s.id?{backgroundColor:s.color,borderColor:s.color}:{}}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{backgroundColor:active===s.id?"rgba(255,255,255,0.2)":`${s.color}15`}}>
              <s.icon size={20} style={{color:active===s.id?"white":s.color}}/>
            </div>
            <div><p className="text-[13px] font-bold">{s.name}</p><p className={`text-[10px] ${active===s.id?"text-white/70":"text-police-muted"}`}>{s.desc}</p></div>
          </button>
        ))}
      </div>

      {active && (
        <div className="rounded-2xl bg-police-card p-4 shadow-sm space-y-3">
          <p className="text-[13px] font-bold text-police">Tafuta kwenye {SERVICES.find(s=>s.id===active)?.name}</p>
          <div className="flex gap-2">
            <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSearch()}
              placeholder={active==="nida"?"Namba ya NIDA (20 tarakimu)":active==="sumatra"?"Namba ya gari":"Namba au jina..."}
              className="flex-1 rounded-xl border border-police bg-police-input px-3 h-10 text-[13px] text-police focus:outline-none focus:border-[#2196F3]"/>
            <button onClick={handleSearch} disabled={loading} className="rounded-xl bg-[#2196F3] px-4 py-2 text-white disabled:opacity-60">
              {loading?<Loader2 size={16} className="animate-spin"/>:<Search size={16}/>}
            </button>
          </div>
          {result && (
            <div className={`rounded-xl border p-4 ${result.found?"border-[#10B981]/30 bg-[#10B981]/5":"border-[#EF4444]/30 bg-[#EF4444]/5"}`}>
              {result.found ? (
                <div className="space-y-2">
                  <p className="text-[12px] font-bold text-[#10B981]">✓ Imeopatikana</p>
                  <pre className="text-[11px] text-police overflow-x-auto">{JSON.stringify(result.data, null, 2)}</pre>
                  <button onClick={async () => {
                    const d = result.data;
                    const endpoint = result.type==="plate" ? "/api/vehicles" : "/api/citizens";
                    const {error} = await authFetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)});
                    error ? toast({title:"Hitilafu",description:error,variant:"destructive"}) : toast({title:"Imehifadhiwa ✓",description:"Data imewekwa kwenye mfumo"});
                  }} className="rounded-xl bg-[#10B981] px-4 py-2 text-[12px] font-bold text-white">
                    Hifadhi kwenye Mfumo
                  </button>
                </div>
              ) : (
                <p className="text-[12px] text-[#EF4444]">✗ Haijapatikana — {result.error||"Hakuna rekodi kwa hoja hii"}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Exports ────────────────────────────────────────────────────────────
function ClerkExports({ user }: { user: any }) {
  const [exporting, setExporting] = useState<string|null>(null);

  const exportData = async (endpoint: string, filename: string, label: string) => {
    setExporting(label);
    try {
      const res = await fetch(`${endpoint}?limit=1000`);
      const json = await res.json();
      const rows = json.data ?? [];
      if (!rows.length) { toast({title:"Hakuna data ya kuhamisha"}); return; }
      const headers = Object.keys(rows[0]).filter(k=>k!=="id"&&!k.endsWith("_json"));
      const csv = [headers.join(","), ...rows.map((r:any)=>headers.map(h=>{
        const v = r[h]; if (!v) return ""; if (typeof v==="string"&&v.includes(",")) return `"${v}"`;
        return String(v).replace(/\n/g," ");
      }).join(","))].join("\n");
      const blob = new Blob([csv],{type:"text/csv;charset=utf-8"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href=url; a.download=`${filename}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      toast({title:`${label} — Imepakiwa ✓`, description:`Rekodi ${rows.length}`});
    } catch { toast({title:"Hitilafu",variant:"destructive"}); }
    setExporting(null);
  };

  const EXPORTS = [
    { label:"Raia",         endpoint:"/api/citizens",   filename:"raia",     icon:Users,        color:"#2196F3" },
    { label:"Magari",       endpoint:"/api/vehicles",   filename:"magari",   icon:Car,          color:"#10B981" },
    { label:"Citations",    endpoint:"/api/citations",  filename:"citations", icon:FileText,    color:"#EF4444" },
    { label:"Makamato",     endpoint:"/api/arrests",    filename:"makamato", icon:UserX,        color:"#8B5CF6" },
    { label:"Matukio",      endpoint:"/api/incidents",  filename:"matukio",  icon:Shield,       color:"#FF9800" },
    { label:"Wanaotafutwa", endpoint:"/api/missing",    filename:"missing",  icon:AlertTriangle,color:"#EF4444" },
    { label:"Mali Zilizopotea",endpoint:"/api/lost-items",filename:"mali",  icon:Package,      color:"#FF9800" },
  ];

  return (
    <div className="max-w-2xl space-y-5 p-5">
      <div><h2 className="text-[17px] font-bold text-police">Uhamishaji wa Data (Exports)</h2>
        <p className="text-[12px] text-police-muted">Pakua rekodi kama faili la CSV</p></div>
      <div className="rounded-2xl border border-[#FF9800]/30 bg-[#FF9800]/5 p-3">
        <p className="text-[12px] font-semibold text-[#FF9800]">⚠️ Tahadhari: Data iliyopakiwa ni ya siri. Usishiriki na watu wasioruhusiwa.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {EXPORTS.map(e=>(
          <button key={e.label} onClick={()=>exportData(e.endpoint,e.filename,e.label)} disabled={!!exporting}
            className="flex items-center gap-3 rounded-2xl bg-police-card p-4 text-left shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-60">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{backgroundColor:`${e.color}15`}}>
              {exporting===e.label ? <Loader2 size={18} className="animate-spin" style={{color:e.color}}/> : <e.icon size={18} style={{color:e.color}}/>}
            </div>
            <div>
              <p className="text-[13px] font-bold text-police">{e.label}</p>
              <p className="text-[10px] text-police-muted">{exporting===e.label?"Inapakua...":"Pakua CSV"}</p>
            </div>
            <Download size={14} className="ml-auto text-police-faint"/>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Settings ────────────────────────────────────────────────────────────
function ClerkSettings() {
  return (
    <div className="max-w-xl space-y-4 p-5">
      <h2 className="text-[17px] font-bold text-police">Mipangilio</h2>
      <div className="rounded-2xl bg-police-card p-4 shadow-sm space-y-3">
        <p className="text-[13px] font-bold text-police">Akaunti yako</p>
        <p className="text-[12px] text-police-muted">Badilisha jina, nywila, na taarifa za akaunti ukipitia admin.</p>
        <div className="rounded-xl border border-[#2196F3]/20 bg-[#2196F3]/5 p-3">
          <p className="text-[12px] text-[#2196F3]">Unahitaji mabadiliko? Wasiliana na Msimamizi wa Mfumo.</p>
        </div>
      </div>
    </div>
  );
}

// ── Embedded mini-forms ────────────────────────────────────────────────
function EmbedCitizenForm({ onClose }: { onClose: ()=>void }) {
  return (
    <div className="p-5">
      <button onClick={onClose} className="mb-4 text-[13px] font-semibold text-[#2196F3]">← Rudi kwenye Orodha</button>
      <iframe src="/officer/general/home" className="hidden"/>
      {/* Inline redirect to the officer add-citizen screen */}
      <div className="rounded-2xl bg-police-card p-5 shadow-sm text-center">
        <Users size={40} className="mx-auto text-[#2196F3]" />
        <p className="mt-3 text-[14px] font-bold text-police">Sajili Raia Mpya</p>
        <p className="mt-1 text-[12px] text-police-muted">Tumia fomu kamili ya usajili wa raia</p>
        <button onClick={() => window.open("/officer/general/home", "_blank")} className="mt-4 rounded-xl bg-[#2196F3] px-6 py-3 text-[13px] font-bold text-white">
          Fungua Fomu →
        </button>
        <p className="mt-2 text-[10px] text-police-faint">Pia unaweza kutumia Ingizo la Wingi (CSV) kwa rekodi nyingi</p>
      </div>
    </div>
  );
}

function EmbedVehicleForm({ onClose }: { onClose: ()=>void }) {
  return (
    <div className="p-5">
      <button onClick={onClose} className="mb-4 text-[13px] font-semibold text-[#2196F3]">← Rudi kwenye Orodha</button>
      <div className="rounded-2xl bg-police-card p-5 shadow-sm text-center">
        <Car size={40} className="mx-auto text-[#10B981]" />
        <p className="mt-3 text-[14px] font-bold text-police">Sajili Gari Jipya</p>
        <p className="mt-1 text-[12px] text-police-muted">Ingiza kwa fomu au tumia Bulk Import kwa magari mengi</p>
        <button onClick={() => window.open("/officer/traffic/home", "_blank")} className="mt-4 rounded-xl bg-[#10B981] px-6 py-3 text-[13px] font-bold text-white">
          Fungua Fomu →
        </button>
      </div>
    </div>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────
const lbl = "mb-1 block text-[12px] font-medium text-police-muted";
const inp = "w-full rounded-xl border border-police bg-police-input px-3 h-10 text-[13px] text-police focus:outline-none focus:border-[#2196F3]";
const ta  = "w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police focus:outline-none focus:border-[#2196F3]";

function FI({ label, value, onChange, placeholder, type="text" }: {
  label: string; value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className={lbl}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={inp}/>
    </div>
  );
}
