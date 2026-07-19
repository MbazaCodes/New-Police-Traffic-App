"use client";

import { useState, useRef } from "react";
import {
  ArrowLeft, Search, TrendingDown, AlertTriangle, CheckCircle,
  X, Printer, FileText, Shield, Star, Calendar, ChevronRight,
} from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { useOfficer } from "@/hooks/use-officer";

type Tab = "driver" | "citizen";

function pointsColor(pts: number) {
  return pts >= 80 ? "#10B981" : pts >= 60 ? "#FF9800" : pts >= 40 ? "#EF4444" : "#7C3AED";
}
function pointsStatus(pts: number) {
  return pts >= 80 ? "good" : pts >= 60 ? "warning" : pts >= 40 ? "critical" : "suspended";
}

// ── Good Conduct Report ────────────────────────────────────────────────────
function printConductReport(record: DriverPointsRecord | CitizenPointsRecord, isDriver: boolean, officerName: string, officerBadge: string, officerStation: string) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("sw-TZ", { day:"2-digit", month:"long", year:"numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit", hour12: false });
  const statusLabel = POINTS_STATUS_LABEL(record.points);
  const color = pointsColor(record.points);
  const pct = record.points;

  const html = `<!DOCTYPE html>
<html lang="sw">
<head><meta charset="UTF-8"><title>Ripoti ya Mwenendo</title>
<style>
  body{font-family:Arial,sans-serif;max-width:700px;margin:0 auto;padding:24px;color:#1a1a1a}
  .header{text-align:center;border-bottom:3px solid #1E3A8A;padding-bottom:16px;margin-bottom:20px}
  .logo{font-size:28px;font-weight:900;color:#1E3A8A;letter-spacing:2px}
  .subtitle{color:#2196F3;font-size:12px;letter-spacing:3px;margin-top:2px}
  .title{font-size:18px;font-weight:bold;color:#1E3A8A;margin-top:12px}
  .ref{font-size:11px;color:#666;margin-top:4px}
  .score-box{text-align:center;background:#f8faff;border:2px solid ${color};border-radius:12px;padding:24px;margin:20px 0}
  .score-num{font-size:56px;font-weight:900;color:${color}}
  .score-label{font-size:13px;color:#666;margin-top:4px}
  .badge{display:inline-block;background:${color};color:white;padding:4px 16px;border-radius:20px;font-size:12px;font-weight:bold;margin-top:8px}
  .section{margin:16px 0}
  .section h3{font-size:13px;font-weight:bold;color:#1E3A8A;border-bottom:1px solid #e5e7eb;padding-bottom:4px;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px}
  .row{display:flex;justify-content:space-between;padding:5px 0;font-size:12px;border-bottom:1px solid #f3f4f6}
  .row .label{color:#666;font-weight:bold}
  .row .value{color:#1a1a1a;text-align:right}
  .deductions{margin:12px 0}
  .ded-row{display:grid;grid-template-columns:1fr 2fr 0.7fr 1fr;gap:8px;padding:5px 0;font-size:11px;border-bottom:1px solid #f3f4f6}
  .ded-header{font-weight:bold;color:#1E3A8A;font-size:10px;text-transform:uppercase}
  .red{color:#EF4444;font-weight:bold}
  .footer{margin-top:30px;border-top:2px solid #1E3A8A;padding-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:20px;font-size:11px}
  .sig-box{text-align:center}
  .sig-line{border-bottom:1px solid #1a1a1a;margin-bottom:4px;height:40px}
  .sig-label{color:#666;font-size:10px}
  .warning-box{background:#fff3cd;border:1px solid #FF9800;border-radius:8px;padding:10px;font-size:11px;margin:12px 0;color:#7c5a00}
  @media print{body{padding:10px}}
</style></head>
<body>
<div class="header">
  <div class="logo">JESHI LA POLISI TANZANIA</div>
  <div class="subtitle">TANZANIA POLICE FORCE — USALAMA WETU, JUKUMU LETU</div>
  <div class="title">RIPOTI YA MWENENDO MZURI — ${isDriver ? "DEREVA" : "RAIA"}</div>
  <div class="ref">Nambari ya Ripoti: ${isDriver ? "GCR" : "CCR"}-${now.getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))} &nbsp;|&nbsp; Tarehe: ${dateStr} ${timeStr}</div>
</div>

<div class="score-box">
  <div class="score-num">${pct}</div>
  <div class="score-label">POINTI ZA ${isDriver ? "UDEREVA" : "MWENENDO WA RAIA"} — Mwaka ${now.getFullYear()}</div>
  <div class="score-label">Mwanzo wa Mwaka: <strong>100 pointi</strong> &nbsp;|&nbsp; Zimepunguzwa: <strong>${record.deducted}</strong></div>
  <div class="badge">${statusLabel.toUpperCase()}</div>
</div>

${pct < 40 ? `<div class="warning-box">⚠️ <strong>ONYO:</strong> Pointi chini ya 40 — ${isDriver ? "Leseni inaweza kusimamishwa na Mamlaka ya Usajili" : "Mwenendo mbaya — hatua za kisheria zinaweza kuchukuliwa"}</div>` : ""}
${pct >= 40 && pct < 60 ? `<div class="warning-box" style="background:#fef2f2;border-color:#EF4444;color:#7c2020">⚠️ <strong>TAHADHARI:</strong> Pointi zimepungua sana. Kuzingatiwa tahadhari.</div>` : ""}

<div class="section">
  <h3>Taarifa Binafsi</h3>
  ${'id' in record ? `<div class="row"><span class="label">Leseni No:</span><span class="value">${(record as DriverPointsRecord).id}</span></div>` : ""}
  <div class="row"><span class="label">Jina Kamili:</span><span class="value">${record.name}</span></div>
  <div class="row"><span class="label">NIDA:</span><span class="value">${record.nida}</span></div>
  <div class="row"><span class="label">Simu:</span><span class="value">${record.phone ?? (record as DriverPointsRecord).plate ?? "—"}</span></div>
  ${'plate' in record ? `<div class="row"><span class="label">Gari (Plate):</span><span class="value">${(record as DriverPointsRecord).plate}</span></div>` : ""}
</div>

<div class="section">
  <h3>Muhtasari wa Pointi — Mwaka ${now.getFullYear()}</h3>
  <div class="row"><span class="label">Pointi za Mwanzo (01 Jan ${now.getFullYear()}):</span><span class="value">100</span></div>
  <div class="row"><span class="label">Jumla ya Makosa:</span><span class="value">${record.violations} ${'incidents' in record ? "matukio" : "makosa"}</span></div>
  <div class="row"><span class="label">Jumla ya Pointi Zilizopunguzwa:</span><span class="value red">-${record.deducted}</span></div>
  <div class="row"><span class="label">Pointi Zilizobaki (Leo ${dateStr}):</span><span class="value" style="color:${color};font-weight:bold">${pct}</span></div>
</div>

${record.deductions.length > 0 ? `
<div class="section">
  <h3>Historia ya Makosa na Kupunguzwa Pointi</h3>
  <div class="deductions">
    <div class="ded-row ded-header"><span>Tarehe</span><span>Kosa</span><span>Pointi</span><span>Afisa</span></div>
    ${record.deductions.map(d => `
    <div class="ded-row">
      <span>${d.date}</span>
      <span>${d.offense} (${d.type === "citation" ? "Citation" : "Onyo"})</span>
      <span class="red">-${d.deducted}</span>
      <span>${d.officer}</span>
    </div>`).join("")}
  </div>
</div>` : `<div class="section"><h3>Historia ya Makosa</h3><p style="font-size:12px;color:#666;text-align:center;padding:16px">Hakuna makosa yaliyorekodiwa mwaka huu — Rekodi safi!</p></div>`}

<div class="footer">
  <div class="sig-box">
    <div class="sig-line"></div>
    <div class="sig-label"><strong>${officerName}</strong> (${officerBadge})</div>
    <div class="sig-label">${officerStation}</div>
    <div class="sig-label">Afisa aliyetoa ripoti</div>
  </div>
  <div class="sig-box">
    <div class="sig-line"></div>
    <div class="sig-label">Mkurugenzi / Kamanda wa Kituo</div>
    <div class="sig-label">Muhuri wa Rasmi</div>
  </div>
</div>

<p style="text-align:center;font-size:10px;color:#999;margin-top:20px">Ripoti hii imetolewa tarehe ${dateStr} ${timeStr} na ni sahihi kwa wakati wa kutolewa tu. Jeshi la Polisi Tanzania — Mfumo wa Kidigitali.</p>
</body></html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  }
}

// ── Main Screen ────────────────────────────────────────────────────────────
export function DriverPointsScreen() {
  const { goBack } = usePoliceStore();
  const OFFICER = useOfficer();
  const [tab, setTab] = useState<Tab>("driver");
  const [search, setSearch] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<DriverPointsRecord | null>(null);
  const [selectedCitizen, setSelectedCitizen] = useState<CitizenPointsRecord | null>(null);

  const filteredDrivers = DRIVER_POINTS.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.id.toLowerCase().includes(search.toLowerCase()) ||
    d.plate.toLowerCase().includes(search.toLowerCase()) ||
    d.nida.includes(search)
  );

  const filteredCitizens = CITIZEN_POINTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.nida.includes(search) ||
    c.phone.includes(search)
  );

  // ── Detail view ──────────────────────────────────────────────────────────
  const record = tab === "driver" ? selectedDriver : selectedCitizen;
  if (record) {
    const isDriver = tab === "driver";
    const pts = record.points;
    const color = pointsColor(pts);
    const pct = pts;

    return (
      <div className="min-h-full bg-police">
        <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2196F3] px-4 py-4">
          <button onClick={() => { setSelectedDriver(null); setSelectedCitizen(null); }}
            className="mb-3 flex items-center gap-2 text-white/80">
            <ArrowLeft size={18}/><span className="text-[13px]">Rudi</span>
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[18px] font-bold text-white">{record.name}</h1>
              <p className="text-[11px] text-white/70">
                {isDriver ? `${(record as DriverPointsRecord).id} · ${(record as DriverPointsRecord).plate}` : `NIDA: ${record.nida}`}
              </p>
            </div>
            <button onClick={() => printConductReport(record, isDriver, OFFICER.name, OFFICER.id, OFFICER.station)}
              className="flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-1.5 text-[12px] font-bold text-white">
              <Printer size={14}/> Chapisha
            </button>
          </div>
        </div>

        <div className="space-y-4 p-4 pb-8">
          {/* Points gauge */}
          <div className="rounded-2xl bg-police-card p-5 shadow-sm text-center">
            <div className="relative mx-auto mb-3 flex h-36 w-36 items-center justify-center rounded-full"
              style={{ background: `conic-gradient(${color} ${pct * 3.6}deg, #e5e7eb 0deg)` }}>
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-police-card">
                <span className="text-[32px] font-bold" style={{ color }}>{pct}</span>
                <span className="text-[10px] text-police-muted">/ 100</span>
              </div>
            </div>
            <p className="text-[14px] font-bold text-police">
              Pointi za {isDriver ? "Udereva" : "Mwenendo wa Raia"}
            </p>
            <span className="mt-1 inline-block rounded-full px-3 py-1 text-[11px] font-bold text-white"
              style={{ backgroundColor: color }}>
              {POINTS_STATUS_LABEL(pts)}
            </span>

            {/* Year context */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[["100","Mwanzo (Jan 1)"],[`-${record.deducted}`,"Zimepunguzwa"],[`${pct}`,"Zilizobaki"]].map(([v,l],i) => (
                <div key={l} className="rounded-xl bg-police-muted p-2 text-center">
                  <p className="text-[16px] font-bold" style={{ color: i===1?"#EF4444":i===2?color:"#10B981" }}>{v}</p>
                  <p className="text-[9px] text-police-faint mt-0.5">{l}</p>
                </div>
              ))}
            </div>

            {pts < 40 && <p className="mt-2 text-[11px] text-[#7C3AED] font-bold">⚠ Pointi zimepungua sana — hatua za kisheria zinaweza kuchukuliwa</p>}
            {pts >= 40 && pts < 60 && <p className="mt-2 text-[11px] text-[#EF4444]">⚠ Chini ya 60 — Tahadhari inahitajika</p>}
            {pts >= 60 && pts < 80 && <p className="mt-2 text-[11px] text-[#FF9800]">⚡ Kati ya 60–80 — Angalia tabia ya barabara</p>}
            {pts >= 80 && <p className="mt-2 text-[11px] text-[#10B981]">✓ Mwenendo mzuri — endelea hivyo</p>}
          </div>

          {/* Deductions log */}
          <div className="tpf-card p-4">
            <h3 className="mb-3 text-[14px] font-bold text-police">Historia ya Makosa {new Date().getFullYear()}</h3>
            {record.deductions.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <CheckCircle size={32} className="text-[#10B981] mb-2"/>
                <p className="text-[13px] font-bold text-police">Rekodi Safi!</p>
                <p className="text-[11px] text-police-muted">Hakuna makosa mwaka huu</p>
              </div>
            ) : record.deductions.map((d, i) => (
              <div key={i} className="flex items-start justify-between border-b border-police-soft py-2.5 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold text-police leading-tight">{d.offense}</p>
                  <p className="text-[10px] text-police-muted">{d.date} · {d.officer} · {d.location}</p>
                  <span className="mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[8px] font-bold text-white"
                    style={{ backgroundColor: d.type==="citation"?"#2196F3":"#FF9800" }}>
                    {d.type === "citation" ? "Citation" : "Onyo"}
                  </span>
                </div>
                <span className="ml-3 shrink-0 text-[14px] font-bold text-[#EF4444]">-{d.deducted}</span>
              </div>
            ))}
          </div>

          {/* Good conduct report button */}
          <button onClick={() => printConductReport(record, isDriver, OFFICER.name, OFFICER.id, OFFICER.station)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1E3A8A] py-3.5 text-[14px] font-bold text-white shadow-md">
            <FileText size={16}/> Chapisha Ripoti ya Mwenendo Mzuri
          </button>
        </div>
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-police">
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2196F3] px-4 py-4">
        <button onClick={goBack} className="mb-3 flex items-center gap-2 text-white/80">
          <ArrowLeft size={18}/><span className="text-[13px]">Nyumbani</span>
        </button>
        <h1 className="text-[20px] font-bold text-white">Pointi za Mwenendo</h1>
        <p className="text-[11px] text-white/70">Kila mtu anaanza na pointi 100 tarehe 01 Januari</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-police-soft bg-police-card">
        {(["driver","citizen"] as Tab[]).map(t => (
          <button key={t} onClick={() => { setTab(t); setSearch(""); }}
            className={`flex-1 py-3 text-[13px] font-semibold transition ${
              tab===t ? "border-b-2 border-[#2196F3] text-[#2196F3]" : "text-police-muted"
            }`}>
            {t==="driver" ? "🚗 Pointi za Madereva" : "👤 Pointi za Raia"}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3">
        {/* System info */}
        <div className="rounded-xl border border-[#2196F3]/20 bg-[#2196F3]/5 p-3 text-[11px] text-police-muted">
          <span className="font-bold text-[#2196F3]">Mfumo wa Pointi:</span> Kila mtu anaanza na pointi 100. Citation hupunguza 0.5–3.0, onyo 0.5–2.5.
          Chini ya 40 → Imesimamishwa. Chini ya 60 → Hatari. Chini ya 80 → Tahadhari.
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl bg-police-card border border-police px-3 shadow-sm">
          <Search size={15} className="text-police-faint"/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={tab==="driver" ? "Tafuta kwa jina, leseni, gari, NIDA..." : "Tafuta kwa jina, NIDA, simu..."}
            className="h-10 flex-1 bg-transparent text-[13px] text-police placeholder:text-police-faint focus:outline-none"/>
          {search && <button onClick={() => setSearch("")}><X size={13} className="text-police-faint"/></button>}
        </div>

        {/* Driver list */}
        {tab === "driver" && filteredDrivers.map(d => {
          const color = pointsColor(d.points);
          return (
            <div key={d.id} onClick={() => setSelectedDriver(d)}
              className="flex items-center gap-3 rounded-2xl bg-police-card p-4 shadow-sm cursor-pointer active:scale-[0.99]">
              {/* Mini gauge */}
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
                style={{ background: `conic-gradient(${color} ${d.points * 3.6}deg, #e5e7eb 0deg)` }}>
                <div className="flex h-10 w-10 flex-col items-center justify-center rounded-full bg-police-card">
                  <span className="text-[11px] font-bold" style={{ color }}>{d.points}</span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-police leading-tight">{d.name}</p>
                <p className="text-[11px] text-police-muted">{d.id} · {d.plate}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ backgroundColor: color }}>
                    {POINTS_STATUS_LABEL(d.points)}
                  </span>
                  <span className="text-[10px] text-police-faint">{d.violations} makosa · -{d.deducted} pts</span>
                </div>
              </div>
              <ChevronRight size={16} className="shrink-0 text-police-faint"/>
            </div>
          );
        })}

        {/* Citizen list */}
        {tab === "citizen" && filteredCitizens.map(c => {
          const color = pointsColor(c.points);
          return (
            <div key={c.nida} onClick={() => setSelectedCitizen(c as CitizenPointsRecord & {phone:string})}
              className="flex items-center gap-3 rounded-2xl bg-police-card p-4 shadow-sm cursor-pointer active:scale-[0.99]">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
                style={{ background: `conic-gradient(${color} ${c.points * 3.6}deg, #e5e7eb 0deg)` }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-police-card">
                  <span className="text-[11px] font-bold" style={{ color }}>{c.points}</span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-police">{c.name}</p>
                <p className="text-[11px] text-police-muted">NIDA: {c.nida}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ backgroundColor: color }}>
                    {POINTS_STATUS_LABEL(c.points)}
                  </span>
                  <span className="text-[10px] text-police-faint">{c.incidents} matukio · -{c.deducted} pts</span>
                </div>
              </div>
              <ChevronRight size={16} className="shrink-0 text-police-faint"/>
            </div>
          );
        })}

        {((tab==="driver" && filteredDrivers.length===0)||(tab==="citizen" && filteredCitizens.length===0)) && (
          <div className="py-10 text-center text-[13px] text-police-faint">Hakuna rekodi zilizopatikana</div>
        )}
      </div>
    </div>
  );
}
