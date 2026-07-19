"use client";

import { useState } from "react";
import {
  Users, Shield, AlertTriangle, FileText, Car, Smartphone,
  TrendingUp, TrendingDown, MapPin, Radio, ChevronRight,
  Clock, CheckCircle2, Activity, BarChart3, Building2,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  PieChart, Pie, Cell, Legend,
  CartesianGrid, Tooltip,
} from "recharts";
import { usePoliceStore } from "@/store/police-store";
// police-data imports removed — use Supabase
type ReportTab = "all" | "traffic" | "general" | "cid" | "post" | "investigations" | "prison" | "operations";

// ── Helpers ──────────────────────────────────────────────────
const TRAFFIC_OFFICERS: never[] = [];
const GENERAL_OFFICERS: never[] = [];
const ALL_FIELD_OFFICERS: never[] = [];
const ADMIN_STATIONS: { id: string; name: string; region: string }[] = [];
const REGIONS: { name: string; commissioner?: string }[] = [];
const ACTIVE_OFFICERS = ALL_FIELD_OFFICERS.filter((u) => u.status === "active" || u.status === "patrol");
const ACTIVE_MISSING: never[] = [];
const DETAINED = [].filter((d) => d.status === "held");

const STATUS_COLOR = { active:"#10B981", patrol:"#2196F3", break:"#FF9800", "off-duty":"#9E9E9E" } as Record<string,string>;
const STATUS_LABEL = { active:"Kazini", patrol:"Doria", break:"Mapumziko", "off-duty":"Nje" } as Record<string,string>;
const TYPE_COLOR: Record<string,string> = { person:"#EF4444", car:"#2196F3", device:"#1E3A8A" };

export function CommissionerDashboard() {
  const { authRole, loginIdentifier } = usePoliceStore();
  const [reportTab, setReportTab] = useState<ReportTab>("all");

  // Resolve session user
  const sessionUser = null;

  const isNational = authRole === "NATIONAL_COMMANDER" || authRole === "SUPER_ADMIN";
  const isRegional = authRole === "REGIONAL_COMMANDER";
  const myRegion   = sessionUser?.region;

  // Filter data by scope
  const myStations = isNational ? ADMIN_STATIONS : ADMIN_STATIONS.filter((s) => s.region === myRegion);
  const myOfficers = isNational ? ALL_FIELD_OFFICERS : ALL_FIELD_OFFICERS.filter((u) => u.region === myRegion);
  const myActive   = myOfficers.filter((u) => u.status === "active" || u.status === "patrol");
  const myTraffic  = myOfficers.filter((u) => u.role === "officer-traffic");
  const myGeneral  = myOfficers.filter((u) => u.role === "officer-general");
  const myRegions  = isNational ? REGIONS : REGIONS.filter((r) => r.name === myRegion);

  const totalFines     = ([] as {fine:string}[]).reduce((s,c) => s + parseInt(c.fine.replace(/[^\d]/g,""),10), 0);
  const unpaidFines    = ([] as {status:string;fine:string}[]).filter((c) => c.status==="Hajalipwa").reduce((s,c) => s + parseInt(c.fine.replace(/[^\d]/g,""),10), 0);
  const trafficCitations = ([] as {status:string}[]).filter((c) => reportTab==="all" || reportTab==="traffic");
  const generalIncidents = [].filter((_) => reportTab==="all" || reportTab==="general");

  const primaryKpis = [
    { label:"Maofisa Kazini",    value:String(myActive.length),           sub:`kati ya ${myOfficers.length}`,           color:"#2196F3", icon:<Users size={20}/>,        trend:"up"      },
    { label:"Citations Leo",     value:String(0),   sub:"trafiki — " + trafficCitations.length,  color:"#1E3A8A", icon:<FileText size={20}/>,     trend:"up"      },
    { label:"Matukio (Jumla)",   value:String([].length),  sub:"general polisi",                         color:"#FF9800", icon:<AlertTriangle size={20}/>, trend:"neutral" },
    { label:"Wanaotafutwa",      value:String(ACTIVE_MISSING.length),     sub:"watu + magari + vifaa",                  color:"#EF4444", icon:<Shield size={20}/>,       trend:"down"    },
    { label:"Waliokamatwa",      value:String(DETAINED.length),           sub:`${DETAINED.length} kazizuizini`,         color:"#1E3A8A", icon:<Users size={20}/>,        trend:"neutral" },
  ];

  const secondaryKpis = [
    { label:"Vituo",           value:String(myStations.length)          },
    { label:"Maofisa Trafiki", value:String(myTraffic.length)           },
    { label:"Maofisa Jumla",   value:String(myGeneral.length)           },
    { label:"Wafungwa",        value:String(DETAINED.length)            },
    { label:"Makamato Yote",   value:String(0)      },
    { label:"Maonyo",          value:String(0)     },
    { label:"Raia (DB)",       value:String(0)       },
    { label:"Magari (DB)",     value:String(0)       },
  ];

  return (
    <div className="space-y-6">
      {/* Identity header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            {sessionUser?.photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sessionUser.photo} alt={sessionUser.name} className="h-12 w-12 rounded-full ring-2 ring-[#2196F3]/30" />
            )}
            <div>
              <h1 className="text-[22px] font-extrabold text-police-navy leading-tight">{sessionUser?.name ?? "Kamishna"}</h1>
              <p className="text-[13px] font-medium text-[#2196F3]">{sessionUser?.rank}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-police-muted">
                <span className="flex items-center gap-1"><Building2 size={11} />{sessionUser?.station}</span>
                <span className="flex items-center gap-1"><MapPin size={11} />{sessionUser?.region}</span>
                <span className="flex items-center gap-1"><Clock size={11} />{sessionUser?.unit}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 px-3 py-1.5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#10B981]" />
          <span className="text-[11px] font-bold text-[#10B981]">Mfumo wa Moja kwa Moja</span>
        </div>
      </div>

      {/* Report type filter — Traffic / General / All */}
      <div className="flex gap-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
      {([
          { id:"all",            label:"Zote",            color:"#1E3A8A" },
          { id:"traffic",        label:"Trafiki",         color:"#2196F3" },
          { id:"general",        label:"Polisi Jumla",    color:"#10B981" },
          { id:"cid",            label:"CID",             color:"#EF4444" },
          { id:"post",           label:"Posti",           color:"#FF9800" },
          { id:"investigations", label:"Uchunguzi",       color:"#1E3A8A" },
          { id:"prison",         label:"Magereza",        color:"#607D8B" },
          { id:"operations",     label:"Operesheni",      color:"#2196F3" },
        ] as const).map((t) => (
          <button key={t.id} onClick={() => setReportTab(t.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold transition ${reportTab===t.id?"text-white shadow":"bg-police-card border border-police text-police-muted"}`}
            style={reportTab===t.id?{backgroundColor:t.color}:{}}>
            {t.id==="traffic" ? <Car size={14}/> : t.id==="general" ? <Shield size={14}/> : <Activity size={14}/>}
            {t.label}
          </button>
        ))}
      </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {primaryKpis.map((k) => (
          <div key={k.label} className="tpf-card p-5">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{backgroundColor:`${k.color}15`,color:k.color}}>
                {k.icon}
              </div>
              <span className={`flex items-center gap-1 text-[11px] font-semibold ${k.trend==="up"?"text-[#10B981]":k.trend==="down"?"text-[#EF4444]":"text-police-muted"}`}>
                {k.trend==="up" ? <TrendingUp size={12}/> : k.trend==="down" ? <TrendingDown size={12}/> : null}
              </span>
            </div>
            <p className="mt-3 text-[28px] font-bold text-police">{k.value}</p>
            <p className="mt-0.5 text-[12px] font-medium text-police-muted">{k.label}</p>
            <p className="text-[10px] text-police-faint">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-8">
        {secondaryKpis.map((k) => (
          <div key={k.label} className="rounded-xl bg-police-card p-3 text-center shadow-sm">
            <p className="tpf-section-title">{k.value}</p>
            <p className="mt-0.5 text-[9px] leading-tight text-police-faint">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Traffic Fines Summary */}
        {(reportTab === "all" || reportTab === "traffic") && (
          <div className="tpf-card p-5">
            <h2 className="mb-4 flex items-center gap-2 text-[15px] font-bold text-police">
              <Car size={18} className="text-[#2196F3]"/> Muhtasari wa Trafiki
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label:"Citations Zote",  value:String(0),  color:"#1E3A8A" },
                { label:"Hazijalipwa",     value:String(0), color:"#EF4444" },
                { label:"Jumla ya Faini",  value:`TZS ${(totalFines/1000).toFixed(0)}k`,  color:"#1E3A8A" },
                { label:"Faini Hazijalipwa", value:`TZS ${(unpaidFines/1000).toFixed(0)}k`, color:"#FF9800" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-police-muted p-3 text-center">
                  <p className="text-[18px] font-bold" style={{color:s.color}}>{s.value}</p>
                  <p className="text-[9px] text-police-faint">{s.label}</p>
                </div>
              ))}
            </div>
            {/* Top 5 citations */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-police-faint">Citations za Hivi Karibuni</p>
              {[].slice(0,5).map((c,i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-police-soft p-2.5">
                  <div className="rounded-md border-2 border-[#1E3A8A] bg-yellow-50 px-2 py-0.5 text-[11px] font-extrabold tracking-wide text-police-navy">{c.plate}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold text-police truncate">{c.offense}</p>
                    <p className="text-[10px] text-police-muted">{c.driver} • {c.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-bold text-police">{c.fine}</p>
                    <span className={`text-[9px] font-bold ${c.status==="Imelipwa"?"text-[#10B981]":"text-[#EF4444]"}`}>{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* General Police Summary */}
        {(reportTab === "all" || reportTab === "general") && (
          <div className="tpf-card p-5">
            <h2 className="mb-4 flex items-center gap-2 text-[15px] font-bold text-police">
              <Shield size={18} className="text-[#10B981]"/> Muhtasari wa Polisi Jumla
            </h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label:"Matukio",    value:String([].length),   color:"#FF9800" },
                { label:"Makamato",   value:String(0),      color:"#1E3A8A" },
                { label:"Maonyo",     value:String(0),     color:"#2196F3" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-police-muted p-3 text-center">
                  <p className="text-[20px] font-bold" style={{color:s.color}}>{s.value}</p>
                  <p className="text-[10px] text-police-faint">{s.label}</p>
                </div>
              ))}
            </div>
            {/* Recent incidents */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-police-faint">Matukio ya Hivi Karibuni</p>
              {[].slice(0,5).map((inc) => (
                <div key={inc.id} className="flex items-start gap-3 rounded-xl border border-police-soft p-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[12px] font-bold text-police truncate">{inc.title}</p>
                      <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{backgroundColor:inc.statusColor}}>{inc.status}</span>
                    </div>
                    <p className="text-[10px] text-police-muted">{inc.date} • {inc.location}</p>
                  </div>
                  {inc.casualties > 0 && <span className="text-[10px] font-bold text-[#EF4444]">{inc.casualties} majeruhi</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trend chart */}
      <div className="tpf-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-[15px] font-bold text-police">
          <BarChart3 size={18} className="text-[#1E3A8A]"/> Mwelekeo wa Wiki Hii
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={INCIDENT_TREND} margin={{top:5,right:10,left:-20,bottom:5}}>
            <defs>
              <linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF9800" stopOpacity={0.2}/><stop offset="95%" stopColor="#FF9800" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="cg2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2196F3" stopOpacity={0.2}/><stop offset="95%" stopColor="#2196F3" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/>
            <XAxis dataKey="day" tick={{fontSize:11}}/>
            <YAxis tick={{fontSize:11}}/>
            <Tooltip/>
            {(reportTab==="all"||reportTab==="general") && <Area type="monotone" dataKey="incidents" stroke="#FF9800" strokeWidth={2} fill="url(#cg1)" name="Matukio"/>}
            {(reportTab==="all"||reportTab==="traffic") && <Area type="monotone" dataKey="citations" stroke="#2196F3" strokeWidth={2} fill="url(#cg2)" name="Citations"/>}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Offense Distribution Pie Chart — filtered by reportTab */}
      <div className="tpf-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-[15px] font-bold text-police">
              <BarChart3 size={18} className="text-[#1E3A8A]"/> Ugawanyiko wa Makosa
            </h2>
            <p className="mt-0.5 text-[11px] text-police-muted">
              {reportTab==="traffic" ? "Makosa ya trafiki yaliyoripotiwa" : reportTab==="general" ? "Aina za matukio ya polisi jumla" : "Makosa ya trafiki na matukio yote ya polisi"}
            </p>
          </div>
          <span className="rounded-full px-3 py-1.5 text-[11px] font-bold text-white" style={{ backgroundColor: reportTab==="traffic" ? "#2196F3" : reportTab==="general" ? "#10B981" : "#1E3A8A" }}>
            {reportTab==="traffic" ? "Trafiki" : reportTab==="general" ? "Polisi Jumla" : "Zote Mbili"}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Pie chart */}
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportTab==="traffic" ? OFFENSE_DISTRIBUTION : reportTab==="general" ? GENERAL_INCIDENT_DISTRIBUTION : COMBINED_DISTRIBUTION}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {(reportTab==="traffic" ? OFFENSE_DISTRIBUTION : reportTab==="general" ? GENERAL_INCIDENT_DISTRIBUTION : COMBINED_DISTRIBUTION).map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor:"var(--police-card)", border:"1px solid var(--police-border)", borderRadius:8, fontSize:12 }}
                  formatter={(v, n) => [`${v} kesi`, n]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Bar breakdown */}
          <div className="space-y-2 justify-center flex flex-col">
            {(reportTab==="traffic" ? OFFENSE_DISTRIBUTION : reportTab==="general" ? GENERAL_INCIDENT_DISTRIBUTION : COMBINED_DISTRIBUTION).map((item) => {
              const total = (reportTab==="traffic" ? OFFENSE_DISTRIBUTION : reportTab==="general" ? GENERAL_INCIDENT_DISTRIBUTION : COMBINED_DISTRIBUTION).reduce((s,i)=>s+i.value,0);
              const pct = Math.round((item.value/total)*100);
              return (
                <div key={item.name} className="flex items-center gap-2.5">
                  <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }}/>
                  <span className="w-28 text-[11px] text-police truncate">{item.name}</span>
                  <div className="flex-1 h-2 overflow-hidden rounded-full bg-police-muted">
                    <div className="h-full rounded-full transition-all" style={{ width:`${pct}%`, backgroundColor: item.color }}/>
                  </div>
                  <span className="w-12 text-right text-[11px] font-bold text-police">{item.value}</span>
                  <span className="w-8 text-right text-[10px] text-police-faint">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Officers + Wanaotafutwa */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active Officers */}
        <div className="tpf-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[15px] font-bold text-police">
              <Users size={18} className="text-[#2196F3]"/> Maofisa Walioko Kazini
            </h2>
            <span className="rounded-full bg-[#10B981]/10 px-2.5 py-1 text-[11px] font-bold text-[#10B981]">{myActive.length} kazini</span>
          </div>
          {/* Traffic / General split */}
          <div className="mb-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-[#2196F3]/10 p-3 text-center">
              <p className="text-[20px] font-bold text-[#2196F3]">{myTraffic.filter(u=>u.status==="active"||u.status==="patrol").length}</p>
              <p className="text-[10px] text-[#2196F3] font-medium">Trafiki Kazini</p>
              <p className="text-[9px] text-police-faint">{myTraffic.length} jumla</p>
            </div>
            <div className="rounded-xl bg-[#10B981]/10 p-3 text-center">
              <p className="text-[20px] font-bold text-[#10B981]">{myGeneral.filter(u=>u.status==="active"||u.status==="patrol").length}</p>
              <p className="text-[10px] text-[#10B981] font-medium">Jumla Kazini</p>
              <p className="text-[9px] text-police-faint">{myGeneral.length} jumla</p>
            </div>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {myOfficers.map((o) => (
              <div key={o.id} className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={o.photo} alt={o.name} className="h-8 w-8 shrink-0 rounded-full"/>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-bold text-police">{o.name}</p>
                  <p className="text-[10px] text-police-muted">{o.role==="officer-traffic"?"Trafiki":"Jumla"} • {o.unit}</p>
                </div>
                <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold" style={{backgroundColor:`${STATUS_COLOR[o.status]}20`,color:STATUS_COLOR[o.status]}}>
                  {STATUS_LABEL[o.status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Records */}
        <div className="tpf-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[15px] font-bold text-police">
              <AlertTriangle size={18} className="text-[#EF4444]"/> Wanaotafutwa
            </h2>
            <span className="rounded-full bg-[#EF4444]/10 px-2.5 py-1 text-[11px] font-bold text-[#EF4444]">{ACTIVE_MISSING.length} zinazoendelea</span>
          </div>
          <div className="mb-3 grid grid-cols-3 gap-2">
            {(["person","car","device"] as const).map((t) => (
              <div key={t} className="rounded-xl bg-police-muted p-2.5 text-center">
                <p className="text-[18px] font-bold" style={{color:TYPE_COLOR[t]}}>{ACTIVE_MISSING.filter(m=>m.type===t).length}</p>
                <p className="text-[9px] text-police-faint">{t==="person"?"Watu":t==="car"?"Magari":"Vifaa"}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {ACTIVE_MISSING.slice(0,5).map((m) => (
              <div key={m.id} className="flex items-start gap-3 rounded-xl border border-police-soft p-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.photo} alt={m.title} className="h-10 w-10 shrink-0 rounded-xl object-cover"/>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold text-police leading-tight line-clamp-1">{m.title}</p>
                  <p className="text-[10px] font-medium" style={{color:TYPE_COLOR[m.type]}}>{m.caseNo}</p>
                  <p className="text-[10px] text-police-faint">{m.lastSeenLocation.split(",")[0]}</p>
                </div>
                {m.rewardAmount && <span className="shrink-0 rounded-full bg-[#10B981]/10 px-2 py-0.5 text-[9px] font-bold text-[#10B981]">{m.rewardAmount}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stations + Regions */}
      {isNational && (
        <div className="tpf-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-[15px] font-bold text-police">
            <MapPin size={18} className="text-[#1E3A8A]"/> Mikoa ya Tanzania — Muhtasari
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="border-b-2 border-[#1E3A8A]">
                <tr className="text-left text-[11px] text-police-faint">
                  <th className="pb-2 pr-4">Mkoa</th>
                  <th className="pb-2 pr-4">Kamishna</th>
                  <th className="pb-2 pr-4">Maofisa</th>
                  <th className="pb-2 pr-4">Vituo</th>
                  <th className="pb-2 pr-4">Matukio</th>
                  <th className="pb-2">Citations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-police-soft">
                {REGION_STATS.map((r) => (
                  <tr key={r.region} className="hover:bg-police-muted transition">
                    <td className="py-2 pr-4 font-bold text-police">{r.region}</td>
                    <td className="py-2 pr-4 text-police-muted text-[11px] max-w-[140px] truncate">
                      {REGIONS.find(rg=>rg.name===r.region)?.commissioner ?? "—"}
                    </td>
                    <td className="py-2 pr-4 text-police-muted">{r.officers}</td>
                    <td className="py-2 pr-4 text-police-muted">{ADMIN_STATIONS.filter(s=>s.region===r.region).length}</td>
                    <td className="py-2 pr-4 text-[#FF9800] font-bold">{r.incidents}</td>
                    <td className="py-2 text-[#2196F3] font-bold">{r.citations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Regional stations breakdown */}
      {(isRegional || !isNational) && myStations.length > 0 && (
        <div className="tpf-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-[15px] font-bold text-police">
            <Building2 size={18} className="text-[#1E3A8A]"/> Vituo vya Mkoa
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {myStations.map((st) => (
              <div key={st.id} className="rounded-xl border border-police-soft p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-bold text-police">{st.name}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${st.status==="active"?"bg-[#10B981]/15 text-[#10B981]":"bg-[#FF9800]/15 text-[#FF9800]"}`}>{st.status}</span>
                </div>
                <p className="mt-0.5 text-[10px] text-police-muted">{st.commissioner}</p>
                <p className="text-[10px] text-police-faint">{st.address}</p>
                <div className="mt-2 flex gap-3 text-[10px] text-police-faint">
                  <span>{st.officersCount} maofisa</span>
                  <span>{st.postsCount} posti</span>
                  <span>Est. {st.established}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
