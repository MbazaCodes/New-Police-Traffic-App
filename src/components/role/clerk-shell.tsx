// @ts-nocheck
"use client";
// CLERK SHELL — Three-tier Data Entry Hierarchy
//
//  NATIONAL_CLERK  → sees ALL data nationwide, manages Regional+District Clerks
//  REGIONAL_CLERK  → sees data for their region, manages District Clerks
//  DISTRICT_CLERK  → sees data for their district only, pure data entry
//  CLERK           → legacy/unscoped clerk (same as National but no user mgmt)
//
// Each level renders the same shell but with scoped API calls and
// role-specific management tabs.

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  LayoutDashboard, Users, Car, AlertTriangle, Shield, UserX,
  FileText, Package, Upload, Globe, Download, Settings, Search,
  Menu, X, ChevronRight, LogOut, RefreshCw, Plus, Loader2,
  Database, Fingerprint, FileSearch, BarChart3, MapPin,
  UserCheck, Building2, Globe2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { authFetch } from "@/lib/client-auth";
import { useApiData } from "@/hooks/use-api-data";
import { toast } from "@/hooks/use-toast";

// ── Clerk level detection ──────────────────────────────────────────────
type ClerkLevel = "national" | "regional" | "district" | "base";

function getClerkLevel(role: string): ClerkLevel {
  const r = (role || "").toLowerCase();
  if (r.includes("national-clerk") || r === "national_clerk") return "national";
  if (r.includes("regional-clerk") || r === "regional_clerk") return "regional";
  if (r.includes("district-clerk") || r === "district_clerk") return "district";
  return "base";
}

const LEVEL_CONFIG: Record<ClerkLevel, {
  title: string; titleSw: string; color: string; bg: string;
  canManageClerks: boolean; canDeleteRecords: boolean; scopeLabel: string;
}> = {
  national: {
    title: "National Clerk",    titleSw: "Karani wa Taifa",
    color: "#1E3A8A",           bg: "from-[#1E3A8A] to-[#2196F3]",
    canManageClerks: true,      canDeleteRecords: true,
    scopeLabel: "Nchi Nzima",
  },
  regional: {
    title: "Regional Clerk",    titleSw: "Karani wa Mkoa",
    color: "#10B981",           bg: "from-[#0d4f3c] to-[#10B981]",
    canManageClerks: true,      canDeleteRecords: true,
    scopeLabel: "Mkoa",
  },
  district: {
    title: "District Clerk",    titleSw: "Karani wa Wilaya",
    color: "#FF9800",           bg: "from-[#b35900] to-[#FF9800]",
    canManageClerks: false,     canDeleteRecords: false,
    scopeLabel: "Wilaya",
  },
  base: {
    title: "Clerk",             titleSw: "Karani",
    color: "#2196F3",           bg: "from-[#1E3A8A] to-[#2196F3]",
    canManageClerks: false,     canDeleteRecords: true,
    scopeLabel: "Nchi Nzima",
  },
};

type ClerkScreen =
  | "dashboard" | "citizens" | "vehicles" | "missing"
  | "incidents" | "arrests" | "citations" | "lost-items"
  | "bulk-import" | "integrated" | "exports"
  | "manage-clerks";   // National + Regional only

// ── Nav builder (level-aware) ──────────────────────────────────────────
function buildNav(level: ClerkLevel) {
  const base: { id: ClerkScreen; label: string; icon: any; group: string }[] = [
    { id: "dashboard",    label: "Dashibodi",          icon: LayoutDashboard, group: "main" },
    { id: "citizens",     label: "Raia",               icon: Users,           group: "rekodi" },
    { id: "vehicles",     label: "Magari",             icon: Car,             group: "rekodi" },
    { id: "missing",      label: "Wanaotafutwa",       icon: AlertTriangle,   group: "rekodi" },
    { id: "incidents",    label: "Matukio",            icon: Shield,          group: "rekodi" },
    { id: "arrests",      label: "Makamato",           icon: UserX,           group: "rekodi" },
    { id: "citations",    label: "Citations",          icon: FileText,        group: "rekodi" },
    { id: "lost-items",   label: "Mali Zilizopotea",   icon: Package,         group: "rekodi" },
    { id: "bulk-import",  label: "Ingiza Wingi",       icon: Upload,          group: "zana" },
    { id: "integrated",   label: "Huduma za Nje",      icon: Globe,           group: "zana" },
    { id: "exports",      label: "Hamisha Data",       icon: Download,        group: "zana" },
  ];
  if (LEVEL_CONFIG[level].canManageClerks) {
    base.push({ id: "manage-clerks", label: level === "national" ? "Simamia Makarani" : "Karani wa Wilaya", icon: UserCheck, group: "usimamizi" });
  }
  return base;
}

const GROUPS = [
  { key: "main",      label: "" },
  { key: "rekodi",    label: "Rekodi" },
  { key: "zana",      label: "Zana" },
  { key: "usimamizi", label: "Usimamizi" },
];

// ── Main Shell ─────────────────────────────────────────────────────────
export function ClerkShell() {
  const { theme, setTheme } = useTheme();
  const [screen, setScreen]       = useState<ClerkScreen>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser]           = useState<any>(null);

  useEffect(() => {
    const uid = typeof window !== "undefined"
      ? (sessionStorage.getItem("tpf-officer-uid") || "") : "";
    fetch("/api/police/me", {
      headers: uid ? { "x-officer-id": uid } : {},
    }).then(r => r.json()).then(j => { if (j.ok) setUser(j.data); }).catch(() => {});
  }, []);

  const level = getClerkLevel(user?.roleRaw || user?.role || "");
  const cfg   = LEVEL_CONFIG[level];
  const nav   = buildNav(level);
  const initials = (user?.shortName || user?.name || "CK").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const scopeValue = level === "regional" ? (user?.region || user?.stationRegion || "Mkoa")
    : level === "district" ? (user?.stationDistrict || user?.unit || "Wilaya") : "";

  return (
    <div className="flex h-screen overflow-hidden bg-police">
      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-56 flex-col bg-[#0d1b3d] transition-transform duration-300 lg:static lg:flex lg:translate-x-0 ${sidebarOpen ? "flex translate-x-0" : "hidden -translate-x-full"}`}>
        {/* Logo + level badge */}
        <div className="border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <Image src="/police-logo.png" alt="TPF" width={28} height={28} className="h-7 w-7 rounded-full" />
            <div className="min-w-0">
              <p className="text-[11px] font-black text-white">TPF — Karani</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="ml-auto text-white/40 lg:hidden"><X size={15}/></button>
          </div>
          {/* Level pill */}
          <div className="mt-2 rounded-lg px-2 py-1 text-center text-[9px] font-black uppercase tracking-widest text-white" style={{ backgroundColor: cfg.color }}>
            {cfg.titleSw}
          </div>
        </div>

        {/* User info */}
        <div className="border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: cfg.color }}>{initials}</div>
            <div className="min-w-0">
              {user ? (
                <>
                  <p className="truncate text-[11px] font-bold text-white">{user.shortName || user.name}</p>
                  <p className="truncate text-[9px] text-white/50">{user.rank || cfg.title} · {user.badgeNo}</p>
                  {scopeValue && <p className="truncate text-[9px] text-white/30">{cfg.scopeLabel}: {scopeValue}</p>}
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
            const items = nav.filter(n => n.group === group.key);
            if (!items.length) return null;
            return (
              <div key={group.key}>
                {group.label && <p className="px-4 pt-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-white/30">{group.label}</p>}
                {items.map(item => {
                  const Icon = item.icon;
                  const active = screen === item.id;
                  return (
                    <button key={item.id} onClick={() => { setScreen(item.id); setSidebarOpen(false); }}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${active ? "text-white" : "text-white/50 hover:bg-white/5 hover:text-white"}`}
                      style={active ? { backgroundColor: `${cfg.color}30` } : {}}>
                      <Icon size={15} style={active ? { color: cfg.color } : {}} />
                      <span className="text-[12px] font-medium">{item.label}</span>
                      {active && <ChevronRight size={12} className="ml-auto" style={{ color: cfg.color }} />}
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
            <LogOut size={13}/> Toka
          </button>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)}/>}

      {/* ── Main area ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-police-soft bg-police-card px-4 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="text-police lg:hidden"><Menu size={22}/></button>
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-police">{nav.find(n => n.id === screen)?.label || "Dashibodi"}</p>
            <p className="text-[10px] text-police-faint">{cfg.titleSw}{scopeValue ? ` · ${scopeValue}` : ""}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-lg bg-police-soft p-2 text-police-muted">{theme === "dark" ? "☀️" : "🌙"}</button>
          </div>
        </header>

        {/* Screen renderer */}
        <main className="flex-1 overflow-y-auto">
          {screen === "dashboard"     && <ClerkDashboard user={user} level={level} cfg={cfg} scopeValue={scopeValue} setScreen={setScreen} />}
          {screen === "citizens"      && <RecordScreen title="Raia" endpoint="/api/citizens" user={user} level={level} searchKey="name,nida,mobile" columns={citizenCols} addLabel="Ongeza Raia" />}
          {screen === "vehicles"      && <RecordScreen title="Magari" endpoint="/api/vehicles" user={user} level={level} searchKey="plate,owner" columns={vehicleCols} addLabel="Sajili Gari" />}
          {screen === "missing"       && <MissingScreen user={user} level={level} cfg={cfg} />}
          {screen === "incidents"     && <RecordScreen title="Matukio" endpoint="/api/incidents" user={user} level={level} columns={incidentCols} />}
          {screen === "arrests"       && <RecordScreen title="Makamato" endpoint="/api/arrests" user={user} level={level} columns={arrestCols} />}
          {screen === "citations"     && <RecordScreen title="Citations" endpoint="/api/citations" user={user} level={level} columns={citationCols} />}
          {screen === "lost-items"    && <RecordScreen title="Mali Zilizopotea" endpoint="/api/lost-items" user={user} level={level} columns={lostCols} />}
          {screen === "bulk-import"   && <BulkImport user={user} level={level} cfg={cfg} />}
          {screen === "integrated"    && <IntegratedServices />}
          {screen === "exports"       && <Exports user={user} cfg={cfg} />}
          {screen === "manage-clerks" && <ManageClerks user={user} level={level} cfg={cfg} />}
        </main>
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────
function ClerkDashboard({ user, level, cfg, scopeValue, setScreen }: any) {
  const [stats, setStats] = useState({ citizens:0, vehicles:0, missing:0, incidents:0, arrests:0, citations:0, lostItems:0, clerks:0 });
  const [loading, setLoading] = useState(true);

  const scopeParam = level === "regional" && scopeValue
    ? `&region=${encodeURIComponent(scopeValue)}`
    : level === "district" && scopeValue
      ? `&district=${encodeURIComponent(scopeValue)}` : "";

  useEffect(() => {
    Promise.all([
      fetch(`/api/citizens?limit=1${scopeParam}`).then(r=>r.json()),
      fetch(`/api/vehicles?limit=1${scopeParam}`).then(r=>r.json()),
      fetch(`/api/missing?limit=1${scopeParam}`).then(r=>r.json()),
      fetch(`/api/incidents?limit=1${scopeParam}`).then(r=>r.json()),
      fetch(`/api/arrests?limit=1${scopeParam}`).then(r=>r.json()),
      fetch(`/api/citations?limit=1${scopeParam}`).then(r=>r.json()),
      fetch(`/api/lost-items?limit=1${scopeParam}`).then(r=>r.json()),
      cfg.canManageClerks ? fetch(`/api/users?role=district-clerk${scopeParam}&limit=1`).then(r=>r.json()) : Promise.resolve({total:0}),
    ]).then(([cit,veh,mis,inc,arr,cts,lst,clk]) => {
      setStats({ citizens:cit.total??0, vehicles:veh.total??0, missing:mis.total??0, incidents:inc.total??0, arrests:arr.total??0, citations:cts.total??0, lostItems:lst.total??0, clerks:clk.total??0 });
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, [scopeParam, cfg.canManageClerks]);

  const CARDS = [
    { label:"Raia",              value:stats.citizens,  icon:Users,          color:"#2196F3", screen:"citizens"   },
    { label:"Magari",            value:stats.vehicles,  icon:Car,            color:"#10B981", screen:"vehicles"   },
    { label:"Wanaotafutwa",      value:stats.missing,   icon:AlertTriangle,  color:"#EF4444", screen:"missing"    },
    { label:"Matukio",           value:stats.incidents, icon:Shield,         color:"#FF9800", screen:"incidents"  },
    { label:"Makamato",          value:stats.arrests,   icon:UserX,          color:"#8B5CF6", screen:"arrests"    },
    { label:"Citations",         value:stats.citations, icon:FileText,       color:"#EF4444", screen:"citations"  },
    { label:"Mali Zilizopotea",  value:stats.lostItems, icon:Package,        color:"#FF9800", screen:"lost-items" },
    ...(cfg.canManageClerks ? [{ label: level==="national"?"Makarani Wote":"Karani wa Wilaya", value:stats.clerks, icon:UserCheck, color:cfg.color, screen:"manage-clerks" }] : []),
  ];

  return (
    <div className="space-y-5 p-5">
      {/* Header card */}
      <div className={`rounded-2xl bg-gradient-to-r ${cfg.bg} p-5 text-white`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold text-white/60 uppercase tracking-wide">{cfg.titleSw}</p>
            <h1 className="text-[20px] font-black">{user?.shortName || user?.name || "Karani"}</h1>
            <p className="text-[12px] text-white/70">{user?.rank} · {user?.badgeNo}</p>
          </div>
          <div className="text-right">
            {scopeValue && (
              <div className="rounded-xl bg-white/20 px-3 py-1.5 text-right">
                <p className="text-[9px] text-white/60 uppercase tracking-wide">{cfg.scopeLabel}</p>
                <p className="text-[14px] font-black">{scopeValue}</p>
              </div>
            )}
          </div>
        </div>
        <p className="mt-3 text-[11px] text-white/50">{new Date().toLocaleDateString("sw-TZ",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
      </div>

      {/* Scope reminder for scoped clerks */}
      {(level === "regional" || level === "district") && (
        <div className="flex items-center gap-3 rounded-xl border p-3" style={{borderColor:`${cfg.color}30`,backgroundColor:`${cfg.color}08`}}>
          <MapPin size={16} style={{color:cfg.color}}/>
          <p className="text-[12px] text-police">
            Unaona data ya <strong>{cfg.scopeLabel}: {scopeValue}</strong> peke yake.
            {level === "regional" && " Unasimamiwa na Karani wa Taifa."}
            {level === "district" && " Unasimamiwa na Karani wa Mkoa."}
          </p>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {loading
          ? Array(8).fill(0).map((_,i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-police-card"/>)
          : CARDS.map(s => (
            <button key={s.label} onClick={() => setScreen(s.screen as ClerkScreen)}
              className="flex flex-col items-start rounded-xl bg-police-card p-3 shadow-sm text-left hover:shadow-md active:scale-[0.98] transition">
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
          {[
            { label:"Ongeza Raia",           icon:Users,        screen:"citizens"   },
            { label:"Sajili Gari",           icon:Car,          screen:"vehicles"   },
            { label:"Ripoti Anayetafutwa",   icon:AlertTriangle,screen:"missing"    },
            { label:"Ingiza Wingi (CSV)",    icon:Upload,       screen:"bulk-import"},
            { label:"Huduma za Nje",         icon:Globe,        screen:"integrated" },
            ...(cfg.canManageClerks ? [{ label: level==="national"?"Ongeza Karani wa Mkoa":"Ongeza Karani wa Wilaya", icon:UserCheck, screen:"manage-clerks" }] : []),
          ].map((q:any) => (
            <button key={q.label} onClick={() => setScreen(q.screen)}
              className="flex items-center gap-3 rounded-xl bg-police-card p-3 text-left shadow-sm hover:shadow-md active:scale-[0.98]">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{backgroundColor:`${cfg.color}15`}}>
                <q.icon size={18} style={{color:cfg.color}}/>
              </div>
              <span className="text-[12px] font-semibold text-police">{q.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Generic record list ────────────────────────────────────────────────
function RecordScreen({ title, endpoint, user, level, columns, addLabel, searchKey }: any) {
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState("");

  // Scope param: regional/district clerks see only their scope
  const scopeParam = level === "regional" && user?.region
    ? `&region=${encodeURIComponent(user.region)}`
    : level === "district" && (user?.stationDistrict || user?.unit)
      ? `&district=${encodeURIComponent(user.stationDistrict || user.unit)}` : "";

  const url = `${endpoint}?limit=200${scopeParam}${applied ? `&search=${encodeURIComponent(applied)}` : ""}`;
  const { data, loading, refetch } = useApiData<any>(url, undefined, [applied, scopeParam], { refreshMs: 15000 });

  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-police bg-police-card px-3">
          <Search size={14} className="shrink-0 text-police-faint"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&setApplied(search)}
            placeholder={`Tafuta ${title.toLowerCase()}...`} className="h-9 flex-1 bg-transparent text-[13px] text-police focus:outline-none"/>
          {search && <button onClick={()=>{setSearch("");setApplied("");}}><X size={13} className="text-police-faint"/></button>}
        </div>
        <button onClick={()=>setApplied(search)} className="rounded-xl bg-police-soft p-2 text-police-muted"><Search size={15}/></button>
        <button onClick={()=>refetch()} className="rounded-xl bg-police-soft p-2 text-police-muted"><RefreshCw size={15}/></button>
      </div>
      <div className="rounded-2xl bg-police-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="border-b border-police-soft bg-police-muted/30">
              <tr>{columns.map((c:any)=><th key={c.key} className="px-4 py-3 text-left text-[11px] font-semibold text-police-muted">{c.label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-police-soft">
              {loading ? Array(5).fill(0).map((_,i)=><tr key={i}>{columns.map((_:any,j:number)=><td key={j} className="px-4 py-3"><div className="h-3 w-20 animate-pulse rounded bg-police-soft"/></td>)}</tr>)
                : data.length===0
                  ? <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-[13px] text-police-muted">Hakuna rekodi{applied&&` kwa "${applied}"`}.</td></tr>
                  : data.map((row:any)=>(
                    <tr key={row.id} className="hover:bg-police-muted/10 transition">
                      {columns.map((col:any)=>(
                        <td key={col.key} className="px-4 py-3 text-police">
                          {col.render ? col.render(row[col.key], row) : (row[col.key]??row[col.alt]??row[col.key2]??"—")}
                        </td>
                      ))}
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        {data.length > 0 && <div className="border-t border-police-soft px-4 py-2 text-[11px] text-police-faint">{data.length} rekodi · auto-refresh 15s</div>}
      </div>
    </div>
  );
}

// ── Missing Persons ────────────────────────────────────────────────────
function MissingScreen({ user, level, cfg }: any) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState({ type:"person", title:"", identifier:"", details:"", lastSeen:"", lastSeenLocation:"", reportedBy:"" });

  const scopeParam = level==="regional"&&user?.region
    ? `&region=${encodeURIComponent(user.region)}`
    : level==="district"&&(user?.stationDistrict||user?.unit)
      ? `&district=${encodeURIComponent(user.stationDistrict||user.unit)}` : "";

  const { data, loading, refetch } = useApiData<any>(`/api/missing?limit=200${scopeParam}`, undefined, [scopeParam], {refreshMs:15000});
  const set = (k:string) => (e:any) => setForm(f=>({...f,[k]:e.target.value}));

  const save = async () => {
    if (!form.title) { toast({title:"Kosa",description:"Kichwa kinahitajika",variant:"destructive"}); return; }
    setSaving(true);
    const {error} = await authFetch("/api/missing",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({...form, station:user?.station||"", reportedBy:form.reportedBy||user?.name})});
    setSaving(false);
    if (error) { toast({title:"Hitilafu",description:error,variant:"destructive"}); return; }
    toast({title:"Ripoti Imehifadhiwa ✓"}); setShowForm(false);
    setForm({type:"person",title:"",identifier:"",details:"",lastSeen:"",lastSeenLocation:"",reportedBy:""});
    refetch();
  };

  const TYPE_COLOR:any={person:"#EF4444",car:"#2196F3",device:"#FF9800",property:"#10B981"};
  const TYPE_SW:any={person:"Mtu",car:"Gari",device:"Kifaa",property:"Mali"};

  return (
    <div className="space-y-4 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-bold text-police">Wanaotafutwa / Vitu</h2>
          <p className="text-[12px] text-police-muted">
            {level==="national"?"Ripoti zote nchi nzima":level==="regional"?`Mkoa: ${user?.region||"—"}`:`Wilaya: ${user?.stationDistrict||"—"}`}
            {" · "}Inahuishwa kila 15s
          </p>
        </div>
        <button onClick={()=>setShowForm(v=>!v)} className="flex items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-bold text-white" style={{backgroundColor:cfg.color}}>
          <Plus size={14}/> Ripoti Mpya
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-2xl bg-police-card p-4 shadow-sm space-y-3">
          <p className="text-[13px] font-bold text-police">Taarifa za Ripoti Mpya</p>
          {/* Type selector */}
          <div className="flex gap-2">
            {Object.entries(TYPE_SW).map(([t,l]:any)=>(
              <button key={t} onClick={()=>setForm(f=>({...f,type:t}))}
                className={`flex-1 rounded-xl py-2 text-[11px] font-bold border transition ${form.type===t?"text-white border-transparent":"border-police-soft text-police-muted"}`}
                style={form.type===t?{backgroundColor:TYPE_COLOR[t]}:{}}>
                {l}
              </button>
            ))}
          </div>
          <FI label="Kichwa / Jina *" value={form.title} onChange={set("title")} placeholder={form.type==="person"?"Jina la mtu anayetafutwa":"Namba ya gari au maelezo"}/>
          <FI label={form.type==="person"?"Kitambulisho (NIDA)":form.type==="car"?"Namba ya Usajili":"Serial / IMEI"} value={form.identifier} onChange={set("identifier")}/>
          <div><label className={lbl}>Maelezo</label>
            <textarea rows={3} value={form.details} onChange={set("details")} placeholder="Maelezo ya kina, sifa, hali..." className={ta}/></div>
          <div className="grid grid-cols-2 gap-3">
            <FI label="Alionekana Mwisho" value={form.lastSeen} onChange={set("lastSeen")} type="date"/>
            <FI label="Mahali pa Mwisho" value={form.lastSeenLocation} onChange={set("lastSeenLocation")} placeholder="e.g. Kariakoo, DSM"/>
          </div>
          <FI label="Aliyeripoti" value={form.reportedBy} onChange={set("reportedBy")} placeholder="Jina la mripoti"/>
          <div className="flex gap-3">
            <button onClick={()=>setShowForm(false)} className="flex-1 rounded-xl border border-police py-2.5 text-[13px] font-semibold text-police">Ghairi</button>
            <button onClick={save} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold text-white disabled:opacity-50" style={{backgroundColor:cfg.color}}>
              {saving?<><Loader2 size={13} className="animate-spin"/>Inahifadhi...</>:"Hifadhi Ripoti"}
            </button>
          </div>
        </div>
      )}

      {/* Records table */}
      <div className="rounded-2xl bg-police-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="border-b border-police-soft bg-police-muted/30">
              <tr>{["Kesi #","Aina","Kichwa/Jina","Kitambulisho","Mahali pa Mwisho","Hali","Tarehe"].map(h=><th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-police-muted">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-police-soft">
              {loading ? Array(4).fill(0).map((_,i)=><tr key={i}>{Array(7).fill(0).map((_,j)=><td key={j} className="px-4 py-3"><div className="h-3 w-16 animate-pulse rounded bg-police-soft"/></td>)}</tr>)
                : data.length===0
                  ? <tr><td colSpan={7} className="px-4 py-10 text-center text-police-muted">Hakuna ripoti bado.<button onClick={()=>setShowForm(true)} className="ml-2 font-semibold" style={{color:cfg.color}}>Anza ripoti ya kwanza</button></td></tr>
                  : data.map((r:any)=>(
                    <tr key={r.id} className="hover:bg-police-muted/10">
                      <td className="px-4 py-3 font-mono text-[10px] text-police-faint">{r.case_no||r.id?.slice(0,8)}</td>
                      <td className="px-4 py-3"><span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{backgroundColor:TYPE_COLOR[r.type]||"#6B7280"}}>{TYPE_SW[r.type]||r.type}</span></td>
                      <td className="px-4 py-3 font-medium text-police">{r.title}</td>
                      <td className="px-4 py-3 text-police-muted">{r.identifier||"—"}</td>
                      <td className="px-4 py-3 text-police-muted">{r.last_seen_location||"—"}</td>
                      <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${r.status==="active"?"bg-[#EF4444]/15 text-[#EF4444]":"bg-[#10B981]/15 text-[#10B981]"}`}>{r.status==="active"?"Inatafutwa":"Imetatuliwa"}</span></td>
                      <td className="px-4 py-3 text-police-faint">{r.created_at?new Date(r.created_at).toLocaleDateString("sw-TZ"):"—"}</td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        {data.length>0&&<div className="border-t border-police-soft px-4 py-2 text-[11px] text-police-faint">{data.length} rekodi</div>}
      </div>
    </div>
  );
}

// ── Manage Clerks ──────────────────────────────────────────────────────
function ManageClerks({ user, level, cfg }: any) {
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({ name:"", badgeNo:"", phone:"", email:"", region:"", district:"", role: level==="national" ? "regional-clerk" : "district-clerk" });

  // National sees all regional+district clerks; Regional sees only district clerks in their region
  const roleFilter = level==="national" ? "regional-clerk,district-clerk" : "district-clerk";
  const scopeParam = level==="regional"&&user?.region ? `&region=${encodeURIComponent(user.region)}` : "";
  const { data: clerks, loading, refetch } = useApiData<any>(`/api/users?roles=${roleFilter}${scopeParam}&limit=200`);

  const set = (k:string) => (e:any) => setForm(f=>({...f,[k]:e.target.value}));

  const save = async () => {
    if (!form.name || !form.badgeNo) { toast({title:"Kosa",description:"Jina na Badge vinahitajika",variant:"destructive"}); return; }
    setSaving(true);
    const {error} = await authFetch("/api/officers",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ name:form.name, badgeNo:form.badgeNo, phone:form.phone, email:form.email,
        region:form.region||user?.region, unit:form.district, role:form.role, stationId:null })});
    setSaving(false);
    if (error) { toast({title:"Hitilafu",description:error,variant:"destructive"}); return; }
    toast({title:"Karani Ameongezwa ✓"}); setShowAdd(false); refetch();
  };

  const ROLE_LABEL:any = {"regional-clerk":"Karani wa Mkoa","district-clerk":"Karani wa Wilaya","clerk":"Karani"};
  const ROLE_COLOR:any = {"regional-clerk":"#10B981","district-clerk":"#FF9800","clerk":"#2196F3"};

  return (
    <div className="space-y-4 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-bold text-police">
            {level==="national" ? "Simamia Makarani Wote" : "Karani wa Wilaya"}
          </h2>
          <p className="text-[12px] text-police-muted">
            {level==="national"
              ? "Unda na simamia Makarani wa Mkoa na Wilaya nchi nzima"
              : `Simamia Makarani wa Wilaya katika Mkoa wa ${user?.region||"—"}`}
          </p>
        </div>
        <button onClick={()=>setShowAdd(v=>!v)} className="flex items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-bold text-white" style={{backgroundColor:cfg.color}}>
          <Plus size={14}/> {level==="national"?"Ongeza Karani wa Mkoa":"Ongeza Karani wa Wilaya"}
        </button>
      </div>

      {/* Add clerk form */}
      {showAdd && (
        <div className="rounded-2xl bg-police-card p-4 shadow-sm space-y-3">
          <p className="text-[13px] font-bold text-police">Taarifa za Karani Mpya</p>

          {level==="national" && (
            <div>
              <label className={lbl}>Aina ya Karani</label>
              <div className="flex gap-2">
                {[["regional-clerk","Karani wa Mkoa"],["district-clerk","Karani wa Wilaya"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setForm(f=>({...f,role:v}))}
                    className={`flex-1 rounded-xl py-2 text-[11px] font-bold border transition ${form.role===v?"text-white border-transparent":"border-police-soft text-police-muted"}`}
                    style={form.role===v?{backgroundColor:ROLE_COLOR[v]}:{}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <FI label="Jina Kamili *" value={form.name} onChange={set("name")} placeholder="Jina la karani"/>
            <FI label="Namba ya Badge *" value={form.badgeNo} onChange={set("badgeNo")} placeholder="TPF-CL-001"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FI label="Simu" value={form.phone} onChange={set("phone")} placeholder="+255..."/>
            <FI label="Barua Pepe" value={form.email} onChange={set("email")} placeholder="email@police.go.tz"/>
          </div>
          {(level==="national"||form.role==="district-clerk") && (
            <div className="grid grid-cols-2 gap-3">
              <FI label="Mkoa" value={form.region} onChange={set("region")} placeholder={user?.region||"Mkoa"}/>
              {form.role==="district-clerk" && <FI label="Wilaya" value={form.district} onChange={set("district")} placeholder="Wilaya"/>}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={()=>setShowAdd(false)} className="flex-1 rounded-xl border border-police py-2.5 text-[13px] font-semibold text-police">Ghairi</button>
            <button onClick={save} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold text-white disabled:opacity-50" style={{backgroundColor:cfg.color}}>
              {saving?<><Loader2 size={13} className="animate-spin"/>Inahifadhi...</>:"Hifadhi"}
            </button>
          </div>
        </div>
      )}

      {/* Clerks table */}
      <div className="rounded-2xl bg-police-card shadow-sm overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="border-b border-police-soft bg-police-muted/30">
            <tr>{["Jina","Badge","Aina","Mkoa","Wilaya","Simu","Hali","Tarehe Usajili"].map(h=><th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-police-muted">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-police-soft">
            {loading ? Array(4).fill(0).map((_,i)=><tr key={i}>{Array(8).fill(0).map((_,j)=><td key={j} className="px-4 py-3"><div className="h-3 w-16 animate-pulse rounded bg-police-soft"/></td>)}</tr>)
              : clerks.length===0
                ? <tr><td colSpan={8} className="px-4 py-10 text-center text-police-muted">Hakuna makarani bado. <button onClick={()=>setShowAdd(true)} className="font-semibold" style={{color:cfg.color}}>Ongeza wa kwanza</button></td></tr>
                : clerks.map((c:any)=>(
                  <tr key={c.id} className="hover:bg-police-muted/10">
                    <td className="px-4 py-3 font-semibold text-police">{c.name}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-police-faint">{c.badge_no}</td>
                    <td className="px-4 py-3"><span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{backgroundColor:ROLE_COLOR[c.role]||"#6B7280"}}>{ROLE_LABEL[c.role]||c.role}</span></td>
                    <td className="px-4 py-3 text-police-muted">{c.region||"—"}</td>
                    <td className="px-4 py-3 text-police-muted">{c.unit||"—"}</td>
                    <td className="px-4 py-3 text-police-muted">{c.phone||"—"}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${c.status==="active"?"bg-[#10B981]/15 text-[#10B981]":"bg-gray-500/15 text-gray-500"}`}>{c.status==="active"?"Kazini":"Nje"}</span></td>
                    <td className="px-4 py-3 text-police-faint">{c.created_at?new Date(c.created_at).toLocaleDateString("sw-TZ"):"—"}</td>
                  </tr>
                ))
            }
          </tbody>
        </table>
        {clerks.length>0&&<div className="border-t border-police-soft px-4 py-2 text-[11px] text-police-faint">{clerks.length} makarani</div>}
      </div>
    </div>
  );
}

// ── Bulk Import (level-aware) ──────────────────────────────────────────
function BulkImport({ user, level, cfg }: any) {
  const [tab, setTab]         = useState<"citizens"|"vehicles">("citizens");
  const [rows, setRows]       = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [done, setDone]       = useState(0);
  const [errs, setErrs]       = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const H_CIT = ["name","nida","mobile","gender","dob","region","district","ward","tribe","occupation"];
  const H_VEH = ["plate","make","model","color","year","chassis","owner_name","owner_phone","region"];
  const headers = tab==="citizens" ? H_CIT : H_VEH;

  const parseCSV = (text:string) => {
    const lines = text.trim().split("\n");
    const hdr = lines[0].split(",").map(h=>h.trim().toLowerCase().replace(/^"|"$/g,""));
    return lines.slice(1).map(line=>{
      const vals=line.split(",").map(v=>v.trim().replace(/^"|"$/g,""));
      const obj:any={};
      hdr.forEach((h,i)=>{obj[h]=vals[i]||"";});
      return obj;
    }).filter(r=>Object.values(r).some(v=>v));
  };

  const handleFile = (e:React.ChangeEvent<HTMLInputElement>) => {
    const f=e.target.files?.[0];if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{const t=ev.target?.result as string;setRows(parseCSV(t));};
    r.readAsText(f); e.target.value="";
  };

  const handleImport = async () => {
    if(!rows.length)return;
    setImporting(true);setDone(0);setErrs([]);
    let ok=0;const e:string[]=[];
    for(const row of rows){
      // Scoped clerks: inject their region/district
      const scopeRegion = (level==="regional"||level==="district") ? (user?.region||row.region) : row.region;
      const scopeDistrict = level==="district" ? (user?.stationDistrict||user?.unit||row.district) : row.district;
      const payload = tab==="citizens"
        ? {name:row.name,nida:row.nida,mobile:row.mobile,gender:row.gender||"Mme",dob:row.dob||null,region:scopeRegion,district:scopeDistrict,ward:row.ward,tribe:row.tribe,occupation:row.occupation}
        : {plate:row.plate?.toUpperCase(),make:row.make,model:row.model,color:row.color,year:row.year,chassis:row.chassis,ownerName:row.owner_name,ownerPhone:row.owner_phone,region:scopeRegion};
      const {error}=await authFetch(tab==="citizens"?"/api/citizens":"/api/vehicles",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      if(error)e.push(`${row.name||row.plate}: ${error}`);else ok++;
      setDone(ok);
    }
    setErrs(e);setImporting(false);
    toast({title:`${ok}/${rows.length} zimeingizwa${e.length?` (Makosa: ${e.length})`:""}`,variant:e.length?"destructive":"default"});
  };

  return (
    <div className="max-w-3xl space-y-5 p-5">
      <div><h2 className="text-[17px] font-bold text-police">Ingizo la Wingi (Bulk Import)</h2>
        <p className="text-[12px] text-police-muted">
          {level==="district"?`Data itaingizwa kwa Wilaya: ${user?.stationDistrict||"yako"}`:level==="regional"?`Data itaingizwa kwa Mkoa: ${user?.region||"wako"}`:"Data itaingizwa bila vikwazo vya eneo"}
        </p>
      </div>
      <div className="flex gap-2">
        {[{id:"citizens",label:"Raia"},{id:"vehicles",label:"Magari"}].map(t=>(
          <button key={t.id} onClick={()=>{setTab(t.id as any);setRows([]);setErrs([]);setDone(0);}}
            className={`rounded-xl px-4 py-2 text-[12px] font-bold ${tab===t.id?"text-white":"bg-police-soft text-police-muted"}`}
            style={tab===t.id?{backgroundColor:cfg.color}:{}}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl bg-police-card p-4 shadow-sm space-y-3">
        <code className="block rounded-lg bg-police-soft px-3 py-2 text-[11px] font-mono text-police-muted">{headers.join(",")}</code>
        <div className="flex gap-3">
          <button onClick={()=>fileRef.current?.click()} className="flex items-center gap-2 rounded-xl border-2 border-dashed border-police-soft px-4 py-3 text-[12px] font-semibold text-police-muted hover:border-[#2196F3] hover:text-[#2196F3] transition">
            <Upload size={16}/> Chagua CSV
          </button>
          <button onClick={()=>{
            const blob=new Blob([[headers.join(","),headers.map(h=>h==="gender"?"Mme":h==="year"?"2020":"Mfano").join(",")].join("\n"),{type:"text/csv"}]);
            const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`mfano_${tab}.csv`;document.body.appendChild(a);a.click();document.body.removeChild(a);
          }} className="flex items-center gap-2 rounded-xl bg-police-soft px-4 py-3 text-[12px] font-semibold text-police-muted">
            <Download size={16}/> Mfano wa CSV
          </button>
        </div>
        <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFile}/>
        {rows.length>0&&(
          <>
            <div className="rounded-xl border border-[#10B981]/30 bg-[#10B981]/5 p-3">
              <p className="text-[12px] font-semibold text-[#10B981]">✓ {rows.length} rekodi zimegunduliwa</p>
            </div>
            <button onClick={handleImport} disabled={importing}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-bold text-white disabled:opacity-60"
              style={{backgroundColor:cfg.color}}>
              {importing?<><Loader2 size={16} className="animate-spin"/>Inaingiza {done}/{rows.length}...</>:<><Upload size={16}/>Ingiza Rekodi {rows.length}</>}
            </button>
          </>
        )}
        {errs.length>0&&(<div className="max-h-40 overflow-y-auto rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/5 p-3 space-y-0.5">
          <p className="text-[11px] font-bold text-[#EF4444]">Makosa {errs.length}:</p>
          {errs.map((e,i)=><p key={i} className="text-[10px] text-[#EF4444]">{e}</p>)}
        </div>)}
      </div>
    </div>
  );
}

// ── Integrated Services ────────────────────────────────────────────────
function IntegratedServices() {
  const [active, setActive]  = useState<string|null>(null);
  const [query, setQuery]    = useState("");
  const [loading, setLoading]= useState(false);
  const [result, setResult]  = useState<any>(null);
  const SVCS = [
    {id:"nida",name:"NIDA",desc:"Kitambulisho cha Taifa",color:"#1E3A8A",icon:Fingerprint,qtype:"nida"},
    {id:"sumatra",name:"SUMATRA",desc:"Usajili wa Magari",color:"#2196F3",icon:Car,qtype:"plate"},
    {id:"brela",name:"BRELA",desc:"Usajili wa Biashara",color:"#10B981",icon:FileSearch,qtype:"name"},
    {id:"tpf",name:"TPF Central",desc:"Rekodi za Polisi",color:"#8B5CF6",icon:Database,qtype:"name"},
  ];
  const search = async () => {
    if(!query.trim()||!active)return;
    setLoading(true);setResult(null);
    const svc=SVCS.find(s=>s.id===active);
    const res=await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${svc?.qtype}`);
    const json=await res.json();
    setResult(json);setLoading(false);
  };
  return (
    <div className="max-w-2xl space-y-5 p-5">
      <div><h2 className="text-[17px] font-bold text-police">Huduma za Nje (Integrated)</h2>
        <p className="text-[12px] text-police-muted">Pata data kutoka mifumo iliyounganishwa</p></div>
      <div className="grid grid-cols-2 gap-3">
        {SVCS.map(s=>(
          <button key={s.id} onClick={()=>{setActive(s.id);setResult(null);setQuery("");}}
            className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${active===s.id?"border-transparent text-white":"border-police-soft bg-police-card"}`}
            style={active===s.id?{backgroundColor:s.color}:{}}>
            <s.icon size={20} style={{color:active===s.id?"white":s.color}}/>
            <div><p className="text-[12px] font-bold">{s.name}</p><p className={`text-[10px] ${active===s.id?"text-white/70":"text-police-muted"}`}>{s.desc}</p></div>
          </button>
        ))}
      </div>
      {active&&(<div className="rounded-2xl bg-police-card p-4 shadow-sm space-y-3">
        <p className="text-[12px] font-bold text-police">Tafuta kwenye {SVCS.find(s=>s.id===active)?.name}</p>
        <div className="flex gap-2">
          <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&search()}
            placeholder={active==="nida"?"Namba ya NIDA...":active==="sumatra"?"Namba ya gari...":"Jina au namba..."}
            className="flex-1 rounded-xl border border-police bg-police-input px-3 h-10 text-[13px] text-police focus:outline-none"/>
          <button onClick={search} disabled={loading} className="rounded-xl bg-[#2196F3] px-4 py-2 text-white disabled:opacity-60">
            {loading?<Loader2 size={15} className="animate-spin"/>:<Search size={15}/>}
          </button>
        </div>
        {result&&(<div className={`rounded-xl border p-4 ${result.found?"border-[#10B981]/30 bg-[#10B981]/5":"border-[#EF4444]/30 bg-[#EF4444]/5"}`}>
          {result.found
            ?<><p className="text-[12px] font-bold text-[#10B981]">✓ Imepatikana</p>
              <pre className="mt-2 overflow-x-auto text-[11px] text-police">{JSON.stringify(result.data,null,2)}</pre>
              <button onClick={async()=>{
                const ep=result.type==="plate"?"/api/vehicles":"/api/citizens";
                const{error}=await authFetch(ep,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(result.data)});
                error?toast({title:"Hitilafu",description:error,variant:"destructive"}):toast({title:"Imehifadhiwa ✓"});
              }} className="mt-2 rounded-xl bg-[#10B981] px-4 py-2 text-[12px] font-bold text-white">Hifadhi kwenye Mfumo</button></>
            :<p className="text-[12px] text-[#EF4444]">✗ Haijapatikana</p>}
        </div>)}
      </div>)}
    </div>
  );
}

// ── Exports ────────────────────────────────────────────────────────────
function Exports({ user, cfg }: any) {
  const [exporting, setExporting] = useState<string|null>(null);
  const ITEMS = [
    {label:"Raia",endpoint:"/api/citizens",fn:"raia",icon:Users},
    {label:"Magari",endpoint:"/api/vehicles",fn:"magari",icon:Car},
    {label:"Citations",endpoint:"/api/citations",fn:"citations",icon:FileText},
    {label:"Makamato",endpoint:"/api/arrests",fn:"makamato",icon:UserX},
    {label:"Matukio",endpoint:"/api/incidents",fn:"matukio",icon:Shield},
    {label:"Wanaotafutwa",endpoint:"/api/missing",fn:"missing",icon:AlertTriangle},
    {label:"Mali Zilizopotea",endpoint:"/api/lost-items",fn:"mali",icon:Package},
  ];
  const exportCSV = async (endpoint:string,fn:string,label:string) => {
    setExporting(label);
    const res=await fetch(`${endpoint}?limit=1000`);const json=await res.json();
    const rows=json.data??[];if(!rows.length){toast({title:"Hakuna data"});setExporting(null);return;}
    const hdrs=Object.keys(rows[0]).filter(k=>k!=="id"&&!k.endsWith("_json"));
    const csv=[hdrs.join(","),...rows.map((r:any)=>hdrs.map(h=>{const v=r[h];if(!v)return"";if(typeof v==="string"&&v.includes(","))return`"${v}"`;return String(v).replace(/\n/g," ");}).join(","))].join("\n");
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=`${fn}_${new Date().toISOString().split("T")[0]}.csv`;document.body.appendChild(a);a.click();document.body.removeChild(a);
    toast({title:`${label} imepakiwa ✓`,description:`Rekodi ${rows.length}`});setExporting(null);
  };
  return (
    <div className="max-w-2xl space-y-4 p-5">
      <h2 className="text-[17px] font-bold text-police">Hamisha Data</h2>
      <div className="rounded-xl border border-[#FF9800]/30 bg-[#FF9800]/5 p-3"><p className="text-[11px] font-semibold text-[#FF9800]">⚠️ Data ni ya siri. Usishiriki bila ruhusa.</p></div>
      <div className="grid grid-cols-2 gap-3">
        {ITEMS.map(e=>(
          <button key={e.label} onClick={()=>exportCSV(e.endpoint,e.fn,e.label)} disabled={!!exporting}
            className="flex items-center gap-3 rounded-2xl bg-police-card p-4 text-left shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-60">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{backgroundColor:`${cfg.color}15`}}>
              {exporting===e.label?<Loader2 size={16} className="animate-spin" style={{color:cfg.color}}/>:<e.icon size={16} style={{color:cfg.color}}/>}
            </div>
            <div><p className="text-[12px] font-bold text-police">{e.label}</p><p className="text-[10px] text-police-muted">{exporting===e.label?"Inapakua...":"Pakua CSV"}</p></div>
            <Download size={13} className="ml-auto text-police-faint"/>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Column definitions ─────────────────────────────────────────────────
const fmt=(row:any,k:string)=>row[k]?new Date(row[k]).toLocaleDateString("sw-TZ"):"—";
const citizenCols=[{key:"name",label:"Jina"},{key:"nida",label:"NIDA"},{key:"phone",label:"Simu",render:(_:any,r:any)=>r.mobile||r.phone||"—"},{key:"region",label:"Mkoa"},{key:"tribe",label:"Kabila"},{key:"created_at",label:"Tarehe",render:(_:any,r:any)=>fmt(r,"created_at")}];
const vehicleCols=[{key:"plate",label:"Namba ya Gari"},{key:"make",label:"Chapa",render:(_:any,r:any)=>`${r.make||""}${r.model?" "+r.model:""}`.trim()||"—"},{key:"color",label:"Rangi"},{key:"owner_name",label:"Mmiliki"},{key:"status",label:"Hali"},{key:"created_at",label:"Tarehe",render:(_:any,r:any)=>fmt(r,"created_at")}];
const incidentCols=[{key:"type",label:"Aina",render:(_:any,r:any)=>r.incident_type||r.type||"—"},{key:"location",label:"Mahali"},{key:"status",label:"Hali"},{key:"officer_name",label:"Afisa"},{key:"created_at",label:"Tarehe",render:(_:any,r:any)=>fmt(r,"created_at")}];
const arrestCols=[{key:"suspect_name",label:"Mtuhumiwa"},{key:"charge",label:"Kosa"},{key:"status",label:"Hali"},{key:"officer_name",label:"Afisa"},{key:"created_at",label:"Tarehe",render:(_:any,r:any)=>fmt(r,"created_at")}];
const citationCols=[{key:"citation_number",label:"Namba"},{key:"plate",label:"Gari"},{key:"offense",label:"Kosa"},{key:"amount",label:"Faini"},{key:"status",label:"Hali"},{key:"created_at",label:"Tarehe",render:(_:any,r:any)=>fmt(r,"created_at")}];
const lostCols=[{key:"item_number",label:"Namba"},{key:"category",label:"Aina"},{key:"description",label:"Maelezo"},{key:"owner_name",label:"Mwenye"},{key:"status",label:"Hali"},{key:"reported_date",label:"Tarehe Iliyoripotiwa"}];

// ── Helpers ────────────────────────────────────────────────────────────
const lbl="mb-1 block text-[12px] font-medium text-police-muted";
const inp="w-full rounded-xl border border-police bg-police-input px-3 h-10 text-[13px] text-police focus:outline-none focus:border-[#2196F3]";
const ta="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police focus:outline-none focus:border-[#2196F3]";

function FI({label,value,onChange,placeholder,type="text"}:{label:string;value:string;onChange:any;placeholder?:string;type?:string}) {
  return (<div><label className={lbl}>{label}</label><input type={type} value={value} onChange={onChange} placeholder={placeholder} className={inp}/></div>);
}
