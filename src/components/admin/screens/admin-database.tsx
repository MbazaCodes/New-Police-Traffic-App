// @ts-nocheck
"use client";
// Admin Database Page — Citizens (with approval), Vehicles, Properties
// Auto-refreshes every 30s. Data from citizen portal + officer entries.

import { useState, useEffect, useCallback } from "react";
import {
  Users, Car, Package, Eye, Pencil, Trash2, Search, X,
  RefreshCw, Download, CheckCircle, XCircle, ShieldCheck,
  AlertCircle, Clock, UserCheck, ChevronDown, Loader2, Smartphone,
} from "lucide-react";
import { authFetch } from "@/lib/client-auth";
import { toast } from "@/hooks/use-toast";

type Tab = "citizens" | "vehicles" | "properties" | "devices";

const TABS = [
  { id:"citizens"   as Tab, label:"Raia",     icon:Users,       color:"#2196F3" },
  { id:"vehicles"   as Tab, label:"Magari",   icon:Car,         color:"#10B981" },
  { id:"properties" as Tab, label:"Mali",     icon:Package,     color:"#FF9800" },
  { id:"devices"    as Tab, label:"Vifaa",    icon:Smartphone,  color:"#8B5CF6" },
];

function ApprovalBadge({ account }: { account?: any }) {
  if (!account) return <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-gray-100 text-gray-400">Hana Portal</span>;
  if (account.approved) return (
    <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-700">
      <ShieldCheck size={10}/> Imeidhinishwa
    </span>
  );
  if (account.status === "rejected") return <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-600">Imekataliwa</span>;
  if (account.status === "suspended") return <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-orange-100 text-orange-600">Imesimamishwa</span>;
  if (account.is_verified) return <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-yellow-100 text-yellow-700"><Clock size={10}/>Inasubiri</span>;
  return <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-gray-100 text-gray-500">Hajathibitishwa</span>;
}

function ApproveMenu({ row, onAction }: { row: any; onAction: (citizenId:string, accountId:string, action:string) => void }) {
  const [open, setOpen] = useState(false);
  const account = row.account?.[0] || row.account;
  if (!account) return null;

  return (
    <div className="relative">
      <button onClick={()=>setOpen(v=>!v)}
        className="flex items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-bold transition"
        style={{ background:"#2563EB15", color:"#2563EB" }}>
        <UserCheck size={13}/> Idhinisha <ChevronDown size={11}/>
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-50 w-44 rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden" onClick={()=>setOpen(false)}>
          <button onClick={()=>onAction(row.id, account.id, "approve")}
            className="flex w-full items-center gap-2 px-4 py-3 text-[12px] font-semibold text-green-700 hover:bg-green-50">
            <CheckCircle size={14}/> Idhinisha Raia
          </button>
          <button onClick={()=>onAction(row.id, account.id, "reject")}
            className="flex w-full items-center gap-2 px-4 py-3 text-[12px] font-semibold text-red-600 hover:bg-red-50">
            <XCircle size={14}/> Kataa / Reject
          </button>
          <button onClick={()=>onAction(row.id, account.id, "suspend")}
            className="flex w-full items-center gap-2 px-4 py-3 text-[12px] font-semibold text-orange-600 hover:bg-orange-50">
            <AlertCircle size={14}/> Simamisha
          </button>
        </div>
      )}
    </div>
  );
}

export function AdminDatabase() {
  const [tab,      setTab]      = useState<Tab>("citizens");
  const [data,     setData]     = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [applied,  setApplied]  = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const curTab = TABS.find(t => t.id === tab)!;

  const fetchData = useCallback(async (q = applied) => {
    setLoading(true);
    const params = new URLSearchParams({ tab, limit: "200" });
    if (q) params.set("search", q);
    const { data: json } = await authFetch(`/api/admin/database?${params}`);
    setData(json?.data || []);
    setLastRefresh(new Date());
    setLoading(false);
  }, [tab, applied]);

  useEffect(() => { fetchData(""); setApplied(""); setSearch(""); }, [tab]);

  // Auto-refresh every 30s
  useEffect(() => {
    const t = setInterval(() => fetchData(applied), 30000);
    return () => clearInterval(t);
  }, [fetchData, applied]);

  const handleApproval = async (citizenId: string, accountId: string, action: string) => {
    const labels: Record<string,string> = { approve:"Inaidhinisha...", reject:"Inakataa...", suspend:"Inasimamisha..." };
    const { data: res, error } = await authFetch("/api/admin/database", {
      method:"PATCH",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ citizenId, accountId, action }),
    });
    if (error) { toast({ title:"Hitilafu", description: error, variant:"destructive" }); return; }
    toast({ title: action==="approve" ? "✅ Imeidhinishwa" : "⚠️ Imesimamishwa", description: res?.message });
    fetchData(applied);
  };

  const [exporting, setExporting] = useState(false);

  // CSV-safe: wrap in quotes, escape internal quotes
  const esc = (v: any) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const CSV_SPEC: Record<string, { headers: string[]; row: (r: any) => any[] }> = {
    citizens: {
      headers: ["Jina","NIDA","Simu","Barua Pepe","Jinsia","Mkoa","Wilaya","Kazi",
                "Magari","Vifaa","Mali","Portal","Imeidhinishwa","Tarehe"],
      row: (r) => [r.name, r.nida, r.mobile || r.phone, r.email, r.gender,
                   r.region, r.district, r.occupation,
                   r.vehicles_count, r.devices_count, r.properties_count,
                   r.source === "portal" ? "Ndiyo" : "Hapana",
                   r.approved ? "Ndiyo" : "Hapana",
                   r.created_at?.slice(0,10)],
    },
    vehicles: {
      headers: ["Namba ya Gari","Chapa","Mfano","Aina","Rangi","Mwaka","Chassis",
                "Mmiliki","NIDA ya Mmiliki","Simu","Bima","Hali","Tarehe"],
      row: (r) => [r.plate, r.make, r.model, r.type, r.color, r.year, r.chassis_no,
                   r.owner_name, r.owner_nida, r.owner_phone,
                   r.insurance_valid ? "Ndiyo" : "Hapana",
                   r.status, r.created_at?.slice(0,10)],
    },
    properties: {
      headers: ["Jina la Mali","Aina","Mkoa","Wilaya","Kata","Hati Namba",
                "Thamani (TZS)","Mmiliki","Simu","Aina ya Umiliki","Tarehe"],
      row: (r) => [r.title, r.property_type, r.region, r.district, r.ward,
                   r.title_deed_no, r.value, r.owner_name, r.owner_phone,
                   r.ownership_type, r.created_at?.slice(0,10)],
    },
    devices: {
      headers: ["Maelezo","Aina","Serial No","IMEI","Mmiliki","Simu","Hali","Tarehe"],
      row: (r) => [r.description, r.category, r.serial_no, r.imei,
                   r.owner_name, r.owner_phone, r.status, r.created_at?.slice(0,10)],
    },
  };

  /** Pulls the FULL table from the API (not just the rows on screen), then downloads. */
  const exportCSV = async () => {
    setExporting(true);
    try {
      const { data: res, error } = await authFetch(
        `/api/admin/database?tab=${tab}&limit=2000`
      );
      if (error) {
        toast({ title:"Hitilafu", description: error, variant:"destructive" });
        return;
      }
      const rows: any[] = res?.data ?? [];
      if (!rows.length) {
        toast({ title:"Hakuna data", description:"Hakuna rekodi za kupakua." });
        return;
      }

      const spec = CSV_SPEC[tab] ?? CSV_SPEC.citizens;
      const csv = [
        spec.headers.map(esc).join(","),
        ...rows.map(r => spec.row(r).map(esc).join(",")),
      ].join("\n");

      // BOM so Excel opens Swahili characters correctly
      const blob = new Blob(["\uFEFF" + csv], { type:"text/csv;charset=utf-8;" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${tab}_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(a.href);

      toast({ title:"✅ Imepakuliwa", description:`${rows.length} rekodi za ${tab}.` });
    } finally {
      setExporting(false);
    }
  };

  // Stats for citizens
  const approved = data.filter((r:any) => r.account?.[0]?.approved || r.account?.approved).length;
  const pending  = data.filter((r:any) => {
    const a = r.account?.[0] || r.account;
    return a?.is_verified && !a?.approved;
  }).length;

  return (
    <div className="space-y-4 p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[20px] font-black text-police">Database ya Mfumo</h1>
          <p className="text-[12px] text-police-muted">
            Rekodi zote — zilizoingia na maafisa, huduma za nje, na raia
            <span className="ml-2 text-[10px] text-police-faint">
              · Ilisasishwa: {lastRefresh.toLocaleTimeString("sw-TZ")} · Auto-refresh 30s
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>fetchData(applied)}
            className="flex items-center gap-1.5 rounded-xl bg-police-soft px-3 py-2 text-[12px] font-semibold text-police">
            <RefreshCw size={14}/> Refresh
          </button>
          <button onClick={exportCSV} disabled={exporting}
            className="flex items-center gap-1.5 rounded-xl bg-police-soft px-3 py-2 text-[12px] font-semibold text-police disabled:opacity-50">
            {exporting ? <RefreshCw size={14} className="animate-spin"/> : <Download size={14}/>}
            {exporting ? "Inapakua..." : "CSV"}
          </button>
        </div>
      </div>

      {/* Tab buttons */}
      <div className="flex gap-3 flex-wrap">
        {TABS.map(t => {
          const Icon = t.icon; const active = tab === t.id;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`flex items-center gap-2 rounded-2xl border-2 px-5 py-3 transition ${active?"text-white shadow-sm":"border-transparent bg-police-card text-police-muted hover:bg-police-soft"}`}
              style={active?{backgroundColor:t.color,borderColor:t.color}:{}}>
              <Icon size={16}/>
              <span className="text-[13px] font-bold">{t.label}</span>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-black"
                style={{background: active?"rgba(255,255,255,0.25)":undefined, color: active?"white":t.color, backgroundColor: active?undefined:`${t.color}15`}}>
                {loading ? "..." : data.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Citizens stats bar */}
      {tab==="citizens" && !loading && data.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            {label:"Jumla ya Raia",   val:data.length,  color:"#2196F3", icon:Users},
            {label:"Wameidhinishwa",  val:approved,     color:"#10B981", icon:CheckCircle},
            {label:"Wanasubiri",      val:pending,      color:"#FF9800", icon:Clock},
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3 rounded-2xl bg-police-card p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{background:`${s.color}15`}}>
                <s.icon size={18} style={{color:s.color}}/>
              </div>
              <div>
                <p className="text-[22px] font-black" style={{color:s.color}}>{s.val}</p>
                <p className="text-[10px] text-police-faint">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="flex gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-police bg-police-card px-3">
          <Search size={15} className="shrink-0 text-police-faint"/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            onKeyDown={e=>e.key==="Enter" && (setApplied(search), fetchData(search))}
            placeholder={`Tafuta ${curTab.label.toLowerCase()}...`}
            className="h-10 flex-1 bg-transparent text-[13px] text-police focus:outline-none"/>
          {search && <button onClick={()=>{setSearch("");setApplied("");fetchData("");}}><X size={13} className="text-police-faint"/></button>}
        </div>
        <button onClick={()=>{setApplied(search);fetchData(search);}}
          style={{backgroundColor:curTab.color}}
          className="rounded-xl px-4 py-2 text-white">
          <Search size={15}/>
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-police-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="border-b border-police-soft" style={{backgroundColor:`${curTab.color}10`}}>
              <tr>
                {tab==="citizens" && ["Jina","NIDA","Simu","Mkoa","Portal Status","Aloidhinishwa","Mwisho Kuingia","Vitendo"].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-police-muted whitespace-nowrap">{h}</th>
                ))}
                {tab==="vehicles" && ["Namba ya Gari","Chapa","Mfano","Rangi","Mwaka","Mmiliki","Chassis","Tarehe","Vitendo"].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-police-muted whitespace-nowrap">{h}</th>
                ))}
                {tab==="properties" && ["Jina la Mali","Aina","Mkoa","Wilaya","Hati Namba","Thamani (TZS)","Tarehe","Vitendo"].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-police-muted whitespace-nowrap">{h}</th>
                ))}
                {tab==="devices" && ["Maelezo","Aina","Serial No","IMEI","Mmiliki","Simu","Hali","Tarehe","Vitendo"].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-police-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-police-soft">
              {loading ? Array(6).fill(0).map((_,i)=>(
                <tr key={i}>{Array(8).fill(0).map((_,j)=>(
                  <td key={j} className="px-4 py-3"><div className="h-3 w-20 animate-pulse rounded bg-police-soft"/></td>
                ))}</tr>
              )) : data.length===0 ? (
                <tr><td colSpan={9} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <curTab.icon size={32} className="text-police-faint"/>
                    <p className="text-[14px] font-bold text-police">Hakuna rekodi bado</p>
                    <p className="text-[12px] text-police-muted">Data itaonekana hapa baada ya raia kusajili au maafisa kuingiza taarifa</p>
                  </div>
                </td></tr>
              ) : data.map((row:any, i:number) => {
                const account = row.account?.[0] || row.account;
                return (
                  <tr key={row.id||i} className="hover:bg-police-muted/10 transition">
                    {tab==="citizens" && <>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                            style={{background:"#2196F3"}}>
                            {(row.name||"?").split(" ").map((w:string)=>w[0]).join("").slice(0,2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-police">{row.name||"—"}</p>
                            {account?.is_driver && <span className="text-[9px] text-[#2196F3] font-bold">🚗 Dereva</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-police-faint">{row.nida||"—"}</td>
                      <td className="px-4 py-3 text-police-muted">{row.mobile||row.phone||"—"}</td>
                      <td className="px-4 py-3 text-police-muted">{row.region||"—"}</td>
                      <td className="px-4 py-3"><ApprovalBadge account={account}/></td>
                      <td className="px-4 py-3">
                        {account?.approved
                          ? <div>
                              <p className="text-[11px] font-bold text-green-700">{account.approved_by||"Msimamizi"}</p>
                              <p className="text-[9px] text-police-faint">{account.approved_at?.slice(0,10)||""}</p>
                            </div>
                          : <span className="text-police-faint text-[11px]">—</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-police-faint text-[11px]">
                        {account?.last_login ? new Date(account.last_login).toLocaleDateString("sw-TZ") : "Hajaingia"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={()=>setSelected(row)}
                            className="rounded-lg bg-[#2196F3]/10 p-1.5 text-[#2196F3] hover:bg-[#2196F3]/20" title="Angalia">
                            <Eye size={13}/>
                          </button>
                          {account && <ApproveMenu row={row} onAction={handleApproval}/>}
                        </div>
                      </td>
                    </>}

                    {tab==="vehicles" && <>
                      <td className="px-4 py-3"><span className="font-mono font-black text-[13px] text-police">{row.plate}</span></td>
                      <td className="px-4 py-3 text-police">{row.make||"—"}</td>
                      <td className="px-4 py-3 text-police-muted">{row.model||"—"}</td>
                      <td className="px-4 py-3 text-police-muted">{row.color||"—"}</td>
                      <td className="px-4 py-3 text-police-muted">{row.year||"—"}</td>
                      <td className="px-4 py-3 text-police">{row.owner_name||"—"}</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-police-faint">{row.chassis_no||"—"}</td>
                      <td className="px-4 py-3 text-police-faint">{row.created_at?.slice(0,10)||"—"}</td>
                      <td className="px-4 py-3">
                        <button onClick={()=>setSelected(row)} className="rounded-lg bg-[#2196F3]/10 p-1.5 text-[#2196F3]"><Eye size={13}/></button>
                      </td>
                    </>}

                    {tab==="properties" && <>
                      <td className="px-4 py-3 font-semibold text-police">{row.title||"—"}</td>
                      <td className="px-4 py-3 text-police-muted">{row.property_type||"—"}</td>
                      <td className="px-4 py-3 text-police-muted">{row.region||"—"}</td>
                      <td className="px-4 py-3 text-police-muted">{row.district||"—"}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-police-faint">{row.title_deed_no||"—"}</td>
                      <td className="px-4 py-3 font-semibold" style={{color:"#10B981"}}>
                        {row.value ? `TZS ${parseInt(row.value||"0").toLocaleString()}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-police-faint">{row.created_at?.slice(0,10)||"—"}</td>
                      <td className="px-4 py-3">
                        <button onClick={()=>setSelected(row)} className="rounded-lg bg-[#2196F3]/10 p-1.5 text-[#2196F3]"><Eye size={13}/></button>
                      </td>
                    </>}

                    {tab==="devices" && <>
                      <td className="px-4 py-3 font-semibold text-police">{row.description||"—"}</td>
                      <td className="px-4 py-3 text-police-muted capitalize">{row.category||row.device_type||"—"}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-police-faint">{row.serial_no||"—"}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-police-faint">{row.imei||"—"}</td>
                      <td className="px-4 py-3 text-police">{row.owner_name||"—"}</td>
                      <td className="px-4 py-3 text-police-muted">{row.owner_phone||"—"}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                          row.status==="stolen" ? "bg-red-100 text-red-600" :
                          row.status==="active" ? "bg-green-100 text-green-600" :
                          "bg-gray-100 text-gray-500"
                        }`}>{row.status||"—"}</span>
                      </td>
                      <td className="px-4 py-3 text-police-faint">{row.created_at?.slice(0,10)||"—"}</td>
                      <td className="px-4 py-3">
                        <button onClick={()=>setSelected(row)} className="rounded-lg bg-[#2196F3]/10 p-1.5 text-[#2196F3]"><Eye size={13}/></button>
                      </td>
                    </>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {data.length > 0 && (
          <div className="flex items-center justify-between border-t border-police-soft px-4 py-2">
            <p className="text-[11px] text-police-faint">{data.length} rekodi · auto-refresh 30s</p>
            <p className="text-[11px] text-police-faint">Ilisasishwa: {lastRefresh.toLocaleTimeString("sw-TZ")}</p>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={()=>setSelected(null)}>
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-police-card p-5 shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-bold text-police">Maelezo Kamili</h3>
              <button onClick={()=>setSelected(null)} className="text-police-faint hover:text-police"><X size={18}/></button>
            </div>
            {/* Citizen approval in modal */}
            {tab==="citizens" && (selected.account?.[0] || selected.account) && (
              <div className="mb-4 flex items-center justify-between rounded-xl p-3" style={{background:"#EFF6FF"}}>
                <div>
                  <p className="text-[12px] font-bold text-[#1E3A8A]">Hali ya Portal</p>
                  <ApprovalBadge account={selected.account?.[0]||selected.account}/>
                </div>
                <ApproveMenu row={selected} onAction={(cid,aid,act)=>{handleApproval(cid,aid,act);setSelected(null);}}/>
              </div>
            )}
            <div className="space-y-1">
              {Object.entries(selected).filter(([k])=>k!=="account").map(([k,v])=>(
                <div key={k} className="flex justify-between gap-3 border-b border-police-soft py-1.5 last:border-0">
                  <span className="text-[11px] text-police-muted capitalize">{k.replace(/_/g," ")}</span>
                  <span className="text-right text-[12px] font-medium text-police break-all max-w-[60%]">
                    {typeof v==="boolean"?(v?"Ndiyo":"Hapana"):v?String(v):"—"}
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
