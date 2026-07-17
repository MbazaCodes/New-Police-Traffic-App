"use client";

import { useState } from "react";
import { ArrowLeft, Search, TrendingDown, AlertTriangle, CheckCircle, X } from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { DRIVER_POINTS, CITATION_HISTORY, VIOLATION_POINTS } from "@/lib/police-data";

export function DriverPointsScreen() {
  const { goBack } = usePoliceStore();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<(typeof DRIVER_POINTS)[0] | null>(null);

  const filtered = DRIVER_POINTS.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.id.toLowerCase().includes(search.toLowerCase()) ||
    d.plate.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => ({
    good: "#10B981", warning: "#FF9800", critical: "#EF4444"
  }[status] ?? "#10B981");

  const getStatusLabel = (status: string) => ({
    good: "Nzuri", warning: "Tahadhari", critical: "Hatari"
  }[status] ?? "Nzuri");

  const driverCitations = selected
    ? CITATION_HISTORY.filter((c) => c.driver.toLowerCase().includes(selected.name.split(" ")[1]?.toLowerCase() ?? ""))
    : [];

  if (selected) {
    const pct = selected.points;
    const color = getStatusColor(selected.status);
    const barColor = pct >= 70 ? "#10B981" : pct >= 50 ? "#FF9800" : "#EF4444";

    return (
      <div className="min-h-full bg-police">
        <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2196F3] px-4 py-4">
          <button onClick={() => setSelected(null)} className="mb-3 flex items-center gap-2 text-white/80">
            <ArrowLeft size={18} /> <span className="text-[13px]">Rudi</span>
          </button>
          <h1 className="text-[18px] font-bold text-white">{selected.name}</h1>
          <p className="text-[11px] text-white/70">{selected.id} • {selected.plate}</p>
        </div>

        <div className="space-y-4 p-4">
          {/* Points gauge */}
          <div className="rounded-2xl bg-police-card p-5 shadow-sm text-center">
            <div className="relative mx-auto mb-3 flex h-32 w-32 items-center justify-center rounded-full" style={{ background: `conic-gradient(${barColor} ${pct * 3.6}deg, var(--border-color, #e5e7eb) 0deg)` }}>
              <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-police-card">
                <span className="text-[28px] font-bold" style={{ color: barColor }}>{pct}</span>
                <span className="text-[10px] text-police-muted">/ 100</span>
              </div>
            </div>
            <p className="text-[14px] font-bold text-police">Pointi za Udereva</p>
            <span className="mt-1 inline-block rounded-full px-3 py-1 text-[11px] font-bold text-white" style={{ backgroundColor: color }}>
              {getStatusLabel(selected.status)}
            </span>
            {selected.status === "critical" && (
              <p className="mt-2 text-[11px] text-[#EF4444]">⚠ Chini ya 50 — Anahitaji mafunzo na ushauri</p>
            )}
            {selected.status === "warning" && (
              <p className="mt-2 text-[11px] text-[#FF9800]">⚡ Kati ya 50–70 — Tahadhari inahitajika</p>
            )}
          </div>

          {/* Point breakdown */}
          <div className="rounded-2xl bg-police-card p-4 shadow-sm">
            <h3 className="mb-3 text-[14px] font-bold text-police">Muhtasari wa Pointi</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-police-muted p-3 text-center">
                <p className="text-[18px] font-bold text-[#10B981]">100</p>
                <p className="text-[9px] text-police-muted">Mwanzo wa Mwaka</p>
              </div>
              <div className="rounded-xl bg-police-muted p-3 text-center">
                <p className="text-[18px] font-bold text-[#EF4444]">-{100 - selected.points}</p>
                <p className="text-[9px] text-police-muted">Zimepunguzwa</p>
              </div>
              <div className="rounded-xl bg-police-muted p-3 text-center">
                <p className="text-[18px] font-bold" style={{ color: barColor }}>{selected.points}</p>
                <p className="text-[9px] text-police-muted">Zimebaki</p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="rounded-2xl bg-police-card p-4 shadow-sm">
            <div className="mb-2 flex justify-between text-[11px] text-police-muted">
              <span>0 (Mbaya)</span><span>50 (Onyo)</span><span>100 (Nzuri)</span>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full bg-police-muted">
              <div className="h-4 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: barColor }} />
            </div>
            <div className="mt-2 text-center text-[12px] font-medium text-police">
              {pct}% ya pointi zimebaki
            </div>
          </div>

          {/* Violation deductions */}
          <div className="rounded-2xl bg-police-card p-4 shadow-sm">
            <h3 className="mb-3 text-[14px] font-bold text-police">Makosa na Upunguzaji</h3>
            {driverCitations.length > 0 ? (
              <div className="space-y-2">
                {driverCitations.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-xl bg-police-muted p-3">
                    <div>
                      <p className="text-[12px] font-bold text-police">{c.offense}</p>
                      <p className="text-[10px] text-police-muted">{c.date} • {c.location}</p>
                    </div>
                    <span className="rounded-full bg-[#EF4444]/10 px-2 py-1 text-[11px] font-bold text-[#EF4444]">-{c.deductedPoints}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[12px] text-police-muted">Hakuna makosa yaliyorekodiwa</p>
            )}
          </div>

          {/* Violation table */}
          <div className="rounded-2xl bg-police-card p-4 shadow-sm">
            <h3 className="mb-3 text-[14px] font-bold text-police">Jedwali la Upunguzaji wa Pointi</h3>
            <div className="space-y-1.5">
              {Object.entries(VIOLATION_POINTS).slice(0, 8).map(([v, p]) => (
                <div key={v} className="flex items-center justify-between">
                  <p className="text-[11px] text-police-muted">{v}</p>
                  <span className="text-[11px] font-bold text-[#EF4444]">-{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-police">
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2196F3] px-4 py-4">
        <button onClick={() => goBack()} className="mb-3 flex items-center gap-2 text-white/80">
          <ArrowLeft size={18} /> <span className="text-[13px]">Rudi Nyuma</span>
        </button>
        <h1 className="text-[18px] font-bold text-white">Pointi za Madereva</h1>
        <p className="text-[11px] text-white/70">Kila dereva anaanza na pointi 100 Januari 1. Makosa yanapunguza pointi.</p>
      </div>

      <div className="space-y-3 p-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-police-card p-2.5 text-center shadow-sm">
            <CheckCircle size={18} className="mx-auto text-[#10B981]" />
            <p className="mt-1 text-[15px] font-bold text-police">{DRIVER_POINTS.filter((d) => d.status === "good").length}</p>
            <p className="text-[9px] text-police-faint">Nzuri (70+)</p>
          </div>
          <div className="rounded-xl bg-police-card p-2.5 text-center shadow-sm">
            <AlertTriangle size={18} className="mx-auto text-[#FF9800]" />
            <p className="mt-1 text-[15px] font-bold text-police">{DRIVER_POINTS.filter((d) => d.status === "warning").length}</p>
            <p className="text-[9px] text-police-faint">Tahadhari (50–70)</p>
          </div>
          <div className="rounded-xl bg-police-card p-2.5 text-center shadow-sm">
            <TrendingDown size={18} className="mx-auto text-[#EF4444]" />
            <p className="mt-1 text-[15px] font-bold text-[#EF4444]">{DRIVER_POINTS.filter((d) => d.status === "critical").length}</p>
            <p className="text-[9px] text-police-faint">Hatari (&lt;50)</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl border border-police bg-police-card px-3 shadow-sm">
          <Search size={16} className="text-police-faint" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tafuta kwa jina, leseni au gari..." className="h-10 flex-1 bg-transparent text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
          {search && <button onClick={() => setSearch("")}><X size={14} className="text-police-faint" /></button>}
        </div>

        {/* Driver list */}
        <div className="space-y-2">
          {filtered.map((d) => {
            const color = getStatusColor(d.status);
            const pct = d.points;
            return (
              <button key={d.id} onClick={() => setSelected(d)} className="w-full rounded-xl bg-police-card p-3 text-left shadow-sm active:scale-[0.99]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${color}15` }}>
                    <span className="text-[13px] font-bold" style={{ color }}>{pct}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-bold text-police">{d.name}</p>
                      <span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ backgroundColor: color }}>{getStatusLabel(d.status)}</span>
                    </div>
                    <p className="text-[10px] text-police-muted">{d.id} • {d.plate}</p>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-police-muted">
                      <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
