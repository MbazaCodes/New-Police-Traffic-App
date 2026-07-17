"use client";

import { useState, useEffect } from "react";
import { Activity, Play, Square, RefreshCw, Shield, Car, AlertTriangle, FileText, User, Radio } from "lucide-react";
import { ROLE_USERS, MISSING_RECORDS } from "@/lib/mock-engine";
import { MOCK_CITIZENS, MOCK_VEHICLES } from "@/lib/mock-database";
import { ARREST_RECORDS, CITATION_HISTORY, GENERAL_INCIDENTS, WARNING_RECORDS } from "@/lib/police-data";

type SimEvent = {
  id: string;
  type: "citation"|"arrest"|"patrol"|"incident"|"warning"|"missing"|"sos";
  officer: string;
  officerPhoto: string;
  subject: string;
  details: string;
  time: string;
  timestamp: number;
  station: string;
};

const EVENT_TEMPLATES = [
  { type: "citation" as const,  details: (v: string) => `Citation imetolewa — Gari ${v} — Over Speeding` },
  { type: "arrest" as const,    details: (n: string) => `Mtuhumiwa amekamtwa — ${n}` },
  { type: "patrol" as const,    details: () => `Patroli ya doria imekamilika` },
  { type: "incident" as const,  details: (n: string) => `Tukio limeripotiwa — ${n}` },
  { type: "warning" as const,   details: (n: string) => `Onyo limetolewa — ${n}` },
  { type: "sos" as const,       details: () => `SOS — Afisa anahitaji msaada!` },
];

export default function SimulationPage() {
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState<SimEvent[]>([]);
  const [tick, setTick] = useState(0);

  // Seed with real data from mock database
  const seedEvents: SimEvent[] = [
    { id:"SE-001", type:"citation",  officer:"Cprl. Juma Mwinyi",  officerPhoto:ROLE_USERS.find(u=>u.username==="juma.mwinyi")?.photo??"", subject:"T 003 GHI",        details:"Citation — Over Speeding 95km/h",        time:"08:15", timestamp:Date.now()-3600000, station:"Kituo Kikuu DSM" },
    { id:"SE-002", type:"arrest",    officer:"Insp. Grace Mushi",  officerPhoto:ROLE_USERS.find(u=>u.username==="grace.mushi")?.photo??"",  subject:"Nassoro Kombo",    details:"Kukamatwa — Wizi wa Benki AR-2026-0045", time:"07:20", timestamp:Date.now()-7200000, station:"Kituo cha Ilala" },
    { id:"SE-003", type:"patrol",    officer:"Sgt. Fatuma Hassan", officerPhoto:ROLE_USERS.find(u=>u.username==="fatuma.hassan")?.photo??"",subject:"Kariakoo-Ilala",  details:"Patroli ya Gari — 12.5km imekamilika",   time:"09:00", timestamp:Date.now()-1800000, station:"Kituo cha Kinondoni" },
    { id:"SE-004", type:"incident",  officer:"Cpl. Mariamu Ally",  officerPhoto:ROLE_USERS.find(u=>u.username==="mariamu.ally")?.photo??"", subject:"Kariakoo Market", details:"Wizi wa simu — mshukiwa amekimbia",      time:"14:30", timestamp:Date.now()-900000,  station:"Kituo cha Ilala" },
    { id:"SE-005", type:"sos",       officer:"Insp. Hamisi Rashid",officerPhoto:ROLE_USERS.find(u=>u.username==="hamisi.rashid")?.photo??"",subject:"Sinza DSM",       details:"Omba msaada — Tishio la usalama",        time:"22:45", timestamp:Date.now()-300000,  station:"Kituo cha Ubungo" },
    { id:"SE-006", type:"citation",  officer:"Sgt. Ali Hassan",    officerPhoto:ROLE_USERS.find(u=>u.username==="ali.hassan")?.photo??"",   subject:"T 009 YZA",        details:"Bajaji bila bima — faini TZS 200,000",   time:"10:30", timestamp:Date.now()-600000,  station:"Kituo cha Ilala" },
    { id:"SE-007", type:"missing",   officer:"CSP. Yusuph",        officerPhoto:ROLE_USERS.find(u=>u.username==="csp.kikuu")?.photo??"",    subject:"Amani Mwanga",     details:"Mtoto aliyepotea — MP-2026-0031",        time:"15:00", timestamp:Date.now()-1200000, station:"Kituo Kikuu DSM" },
  ];

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      const officers = ROLE_USERS.filter((u) => ["officer-traffic","officer-general"].includes(u.role));
      const officer = officers[Math.floor(Math.random() * officers.length)];
      const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
      const vehicle = MOCK_VEHICLES[Math.floor(Math.random() * MOCK_VEHICLES.length)];
      const citizen = MOCK_CITIZENS[Math.floor(Math.random() * MOCK_CITIZENS.length)];
      const now = new Date();
      const newEvent: SimEvent = {
        id: `SIM-${Date.now()}`,
        type: template.type,
        officer: officer.shortName,
        officerPhoto: officer.photo,
        subject: template.type === "citation" ? vehicle.plate : citizen.name,
        details: template.details(template.type === "citation" ? vehicle.plate : citizen.name),
        time: `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`,
        timestamp: Date.now(),
        station: officer.station,
      };
      setEvents((prev) => [newEvent, ...prev].slice(0, 50));
      setTick((t) => t + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [running]);

  const allEvents = [...(events.length ? events : seedEvents), ...seedEvents].slice(0, 20);

  const typeColor = { citation:"#2196F3", arrest:"#1E3A8A", patrol:"#10B981", incident:"#FF9800", warning:"#FF9800", missing:"#EF4444", sos:"#EF4444" };
  const typeLabel = { citation:"Citation", arrest:"Kamato", patrol:"Patroli", incident:"Tukio", warning:"Onyo", missing:"Kutafuta", sos:"SOS" };
  const typeIcon = { citation:<FileText size={14} />, arrest:<User size={14} />, patrol:<Shield size={14} />, incident:<AlertTriangle size={14} />, warning:<AlertTriangle size={14} />, missing:<Radio size={14} />, sos:<AlertTriangle size={14} /> };

  return (
    <div className="min-h-screen bg-police p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF9800]">
            <Activity size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-police-navy">Simulation Engine</h1>
            <p className="text-[13px] text-police-muted">Programu ya kuiga matukio ya polisi kwa wakati halisi — data kutoka Mock Database</p>
          </div>
          <div className="ml-auto flex gap-3">
            {running ? (
              <button onClick={() => setRunning(false)} className="flex items-center gap-2 rounded-xl bg-[#EF4444] px-5 py-2.5 text-[13px] font-bold text-white">
                <Square size={15} fill="white" /> Simamisha
              </button>
            ) : (
              <button onClick={() => setRunning(true)} className="flex items-center gap-2 rounded-xl bg-[#10B981] px-5 py-2.5 text-[13px] font-bold text-white">
                <Play size={15} fill="white" /> Anza Simulation
              </button>
            )}
            <button onClick={() => setEvents([])} className="flex items-center gap-2 rounded-xl border border-police px-4 py-2.5 text-[13px] font-semibold text-police">
              <RefreshCw size={15} /> Futa
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label:"Citations", value:CITATION_HISTORY.length, color:"#2196F3", icon:<FileText size={18}/> },
            { label:"Makamato", value:ARREST_RECORDS.length, color:"#1E3A8A", icon:<User size={18}/> },
            { label:"Matukio", value:GENERAL_INCIDENTS.length, color:"#FF9800", icon:<AlertTriangle size={18}/> },
            { label:"Maofisa Kazini", value:ROLE_USERS.filter(u=>u.status==="active"||u.status==="patrol").length, color:"#10B981", icon:<Shield size={18}/> },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-police-card p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ backgroundColor:`${s.color}15`, color:s.color }}>{s.icon}</div>
                {running && <span className="flex h-2 w-2"><span className="animate-ping absolute inline-flex h-2 w-2 rounded-full opacity-75" style={{backgroundColor:s.color}}/><span className="relative inline-flex h-2 w-2 rounded-full" style={{backgroundColor:s.color}}/></span>}
              </div>
              <p className="mt-2 text-[24px] font-bold text-police">{s.value}</p>
              <p className="text-[11px] text-police-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Status banner */}
        <div className={`flex items-center gap-3 rounded-2xl p-4 ${running ? "bg-[#10B981]/10 border border-[#10B981]/30" : "bg-police-card border border-police-soft"}`}>
          {running ? (
            <><span className="flex h-3 w-3"><span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-[#10B981] opacity-75"/><span className="relative inline-flex h-3 w-3 rounded-full bg-[#10B981]"/></span>
            <p className="text-[14px] font-bold text-[#10B981]">Simulation Inafanya Kazi — Matukio yanaongezwa kila sekunde 4 kutoka Mock Database</p></>
          ) : (
            <><Activity size={18} className="text-police-faint"/>
            <p className="text-[14px] text-police-muted">Simulation imesimama — Bonyeza &apos;Anza Simulation&apos; kuona matukio</p></>
          )}
          {running && <span className="ml-auto text-[12px] font-bold text-[#10B981]">{tick} matukio mapya</span>}
        </div>

        {/* Event log */}
        <div className="rounded-2xl bg-police-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-police-soft">
            <h2 className="text-[15px] font-bold text-police">Kumbukumbu ya Matukio</h2>
            <span className="text-[12px] text-police-muted">{allEvents.length} matukio</span>
          </div>
          <div className="divide-y divide-police-soft max-h-[500px] overflow-y-auto">
            {allEvents.map((e) => (
              <div key={e.id} className="flex items-start gap-4 px-5 py-3 hover:bg-police-muted transition">
                <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor:typeColor[e.type] }}>
                  {typeIcon[e.type]}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {e.officerPhoto && <img src={e.officerPhoto} alt={e.officer} className="h-7 w-7 rounded-full" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-police">{e.details}</p>
                  <p className="text-[11px] text-police-muted">{e.officer} • {e.station}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ backgroundColor:typeColor[e.type] }}>{typeLabel[e.type]}</span>
                  <p className="mt-1 text-[10px] text-police-faint">{e.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#FF9800]/20 bg-[#FF9800]/5 p-4 text-center">
          <p className="text-[12px] font-bold text-[#FF9800]">Simulation Engine — Data-Driven</p>
          <p className="text-[11px] text-police-muted">Maofisa: {ROLE_USERS.length} • Magari: {MOCK_VEHICLES.length} • Raia: {MOCK_CITIZENS.length} — Yote kutoka Mock Database</p>
        </div>
      </div>
    </div>
  );
}
