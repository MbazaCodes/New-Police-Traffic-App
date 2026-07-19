// @ts-nocheck
"use client";
import { useState, useEffect, useCallback } from "react";
import { Calendar, FileText, Download, TrendingUp, BarChart3, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { toast } from "@/hooks/use-toast";

const DATE_RANGES = [
  { id: "7d",  label: "Siku 7"  },
  { id: "30d", label: "Siku 30" },
  { id: "90d", label: "Siku 90" },
  { id: "1y",  label: "Mwaka 1" },
] as const;

const WEEK_DAYS = ["Jumatatu", "Jumanne", "Jumatano", "Alhamisi", "Ijumaa", "Jumamosi", "Jumapili"];

const EMPTY_TREND = WEEK_DAYS.map((day) => ({ day, incidents: 0, citations: 0, paid: 0 }));
const EMPTY_PIE   = [{ name: "Hakuna data", value: 1, color: "#CBD5E1" }];

function escapeCsv(v: string | number) {
  const s = String(v);
  return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
}
function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function AdminReports() {
  const [range,      setRange]      = useState<string>("7d");
  const [reportType, setReportType] = useState<"all" | "traffic" | "general">("all");
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  // Real data from API
  const [kpis,        setKpis]        = useState({ totalOfficers: 0, totalIncidents: 0, totalCitations: 0, totalResolved: 0, resolutionRate: 0, activePatrols: 0, todayCitations: 0 });
  const [incidentTrend, setIncidentTrend] = useState(EMPTY_TREND);
  const [citationTrend, setCitationTrend] = useState(EMPTY_TREND);
  const [distribution,  setDistribution]  = useState({ traffic: EMPTY_PIE, general: EMPTY_PIE, combined: EMPTY_PIE });
  const [regionStats,   setRegionStats]   = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`/api/reports/summary?range=${range}&type=${reportType}`);
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Hitilafu ya seva"); return; }

      const d = json.data;
      if (d?.aggregated) setKpis(d.aggregated);
      if (d?.trends?.incidentTrend?.length)  setIncidentTrend(d.trends.incidentTrend);
      if (d?.trends?.citationTrend?.length)  setCitationTrend(d.trends.citationTrend);
      if (d?.trends?.offenseDistribution)    setDistribution(prev => ({ ...prev, traffic:  d.trends.offenseDistribution.length  ? d.trends.offenseDistribution  : EMPTY_PIE }));
      if (d?.trends?.generalDistribution)    setDistribution(prev => ({ ...prev, general:  d.trends.generalDistribution.length  ? d.trends.generalDistribution  : EMPTY_PIE }));
      if (d?.trends?.combinedDistribution)   setDistribution(prev => ({ ...prev, combined: d.trends.combinedDistribution.length ? d.trends.combinedDistribution : EMPTY_PIE }));
      if (d?.distribution?.regionStats)      setRegionStats(d.distribution.regionStats);
    } catch (e) {
      setError("Hitilafu ya mtandao — " + String(e));
    } finally {
      setLoading(false);
    }
  }, [range, reportType]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const pieData = reportType === "traffic" ? distribution.traffic : reportType === "general" ? distribution.general : distribution.combined;

  const handleExportCsv = () => {
    const header    = ["Mkoa", "Maofisa", "Matukio", "Citations", "Yaliyotatuliwa"];
    const rows      = regionStats.map((r) => [r.region ?? r.name, r.officers ?? 0, r.incidents ?? 0, r.citations ?? 0, r.resolved ?? 0]);
    const trendHdr  = ["Siku", "Matukio", "Citations"];
    const trendRows = incidentTrend.map((d) => [d.day, d.incidents, d.citations]);
    const csv = [["# Takwimu za Mikoa"], header, ...rows, [""], ["# Mwelekeo wa Matukio"], trendHdr, ...trendRows]
      .map((r) => r.map(escapeCsv).join(",")).join("\n");
    downloadFile("\uFEFF" + csv, `ripoti-polisi-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8;");
  };

  const handleExportPdf = () => {
    const html = `<!doctype html><html lang="sw"><head><meta charset="utf-8"><title>TZ Police Report</title>
<style>body{font-family:Arial,sans-serif;padding:24px;color:#0d1b3d}h1{color:#1E3A8A}table{border-collapse:collapse;width:100%;margin-top:12px;font-size:12px}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#1E3A8A;color:#fff}.stat{display:inline-block;margin-right:24px;padding:12px;background:#f5f7fb;border-radius:8px}</style>
</head><body><h1>Ripoti ya Polisi — TZ</h1><p>Tarehe: ${new Date().toLocaleDateString("en-GB")}</p>
<div>
  <span class="stat"><b>Maofisa:</b> ${kpis.totalOfficers}</span>
  <span class="stat"><b>Matukio:</b> ${kpis.totalIncidents}</span>
  <span class="stat"><b>Citations:</b> ${kpis.totalCitations}</span>
  <span class="stat"><b>Yaliyotatuliwa:</b> ${kpis.totalResolved} (${kpis.resolutionRate}%)</span>
</div>
<h2>Mwelekeo wa Matukio</h2>
<table><thead><tr><th>Siku</th><th>Matukio</th><th>Citations</th></tr></thead><tbody>
${incidentTrend.map((d) => `<tr><td>${d.day}</td><td>${d.incidents}</td><td>${d.citations}</td></tr>`).join("")}
</tbody></table>
<h2>Takwimu za Mikoa</h2>
<table><thead><tr><th>Mkoa</th><th>Maofisa</th><th>Matukio</th><th>Citations</th><th>Yaliyotatuliwa</th></tr></thead><tbody>
${regionStats.map((r) => `<tr><td>${r.region ?? r.name}</td><td>${r.officers ?? 0}</td><td>${r.incidents ?? 0}</td><td>${r.citations ?? 0}</td><td>${r.resolved ?? 0}</td></tr>`).join("")}
</tbody></table></body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); }
    else toast({ title: "Hitilafu", description: "Ruhusu pop-up kwa kuchapisha" });
  };

  const tooltipStyle = { backgroundColor: "var(--police-card)", border: "1px solid var(--police-border)", borderRadius: 8, fontSize: 12, color: "var(--police-text)" };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-police-navy">Ripoti &amp; Takwimu</h1>
          <p className="text-[13px] text-police-muted">Changanua na toa ripoti za shughuli za polisi</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={fetchData} disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-police-card border border-police px-3 py-2 text-[12px] font-semibold text-police hover:bg-police-muted disabled:opacity-50">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Onyesha upya
          </button>
          <button onClick={handleExportPdf}
            className="inline-flex items-center gap-2 rounded-lg bg-[#EF4444] px-3 py-2 text-[12px] font-semibold text-white">
            <FileText size={13} /> Pakua PDF
          </button>
          <button onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-lg bg-police-card border border-police px-3 py-2 text-[12px] font-semibold text-police-navy">
            <Download size={13} /> CSV
          </button>
        </div>
      </div>

      {/* Report type + date range */}
      <div className="flex flex-col gap-3 rounded-xl bg-police-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 flex-wrap">
          {([{ id: "all", label: "Jumla", color: "#1E3A8A" }, { id: "traffic", label: "Trafiki", color: "#2196F3" }, { id: "general", label: "Polisi Jumla", color: "#10B981" }] as const).map((t) => (
            <button key={t.id} onClick={() => setReportType(t.id)}
              className={`rounded-xl px-4 py-2 text-[13px] font-bold transition ${reportType === t.id ? "text-white shadow-md" : "bg-police-input text-police-muted border border-police"}`}
              style={reportType === t.id ? { backgroundColor: t.color } : {}}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap items-center">
          <Calendar size={14} className="text-police-faint" />
          {DATE_RANGES.map((r) => (
            <button key={r.id} onClick={() => setRange(r.id)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition ${range === r.id ? "bg-[#2196F3] text-white" : "bg-police-input text-police-muted hover:text-police"}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/5 p-4 text-[13px] text-[#EF4444]">
          <AlertTriangle size={16} /> {error}
          <button onClick={fetchData} className="ml-auto underline">Jaribu tena</button>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard icon={<BarChart3 size={16} />} label="Matukio"        value={kpis.totalIncidents}  color="#FF9800" loading={loading} />
        <KpiCard icon={<FileText   size={16} />} label="Citations"      value={kpis.totalCitations}  color="#2196F3" loading={loading} />
        <KpiCard icon={<TrendingUp size={16} />} label="Yaliyotatuliwa" value={`${kpis.totalResolved} (${kpis.resolutionRate}%)`} color="#10B981" loading={loading} />
        <KpiCard icon={<BarChart3  size={16} />} label="Maofisa Kazini" value={kpis.totalOfficers}   color="#1E3A8A" loading={loading} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Bar: incidents by day */}
        <div className="rounded-xl bg-police-card p-4 shadow-sm">
          <h2 className="text-[14px] font-bold text-police-navy">Matukio kwa Siku</h2>
          <p className="mb-3 text-[11px] text-police-muted">Idadi ya matukio kwa kila siku ya juma</p>
          {loading ? <ChartSkeleton /> : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incidentTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.15)" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="rgba(120,120,120,0.3)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="rgba(120,120,120,0.3)" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="incidents" fill="#FF9800" radius={[4, 4, 0, 0]} name="Matukio" />
                  <Bar dataKey="citations" fill="#2196F3" radius={[4, 4, 0, 0]} name="Citations" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pie: offense distribution */}
        <div className="rounded-xl bg-police-card p-4 shadow-sm">
          <h2 className="text-[14px] font-bold text-police-navy">Ugawanyiko wa Makosa</h2>
          <p className="mb-3 text-[11px] text-police-muted">
            {reportType === "traffic" ? "Makosa ya trafiki" : reportType === "general" ? "Matukio ya polisi jumla" : "Makosa yote"}
          </p>
          {loading ? <ChartSkeleton /> : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={2}>
                    {pieData.map((entry) => <Cell key={entry.name} fill={entry.color ?? "#CBD5E1"} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [`${v} kesi`, n]} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Line: citations trend */}
      <div className="rounded-xl bg-police-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-bold text-police-navy">Mwelekeo wa Citations</h2>
            <p className="text-[11px] text-police-muted">Citations zilizotolewa dhidi ya zilizolipwa</p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-police-muted"><span className="h-2 w-2 rounded-full bg-[#2196F3]" /> Citations</span>
            <span className="flex items-center gap-1 text-police-muted"><span className="h-2 w-2 rounded-full bg-[#10B981]" /> Zilizolipwa</span>
          </div>
        </div>
        {loading ? <ChartSkeleton h={288} /> : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={citationTrend.length ? citationTrend : EMPTY_TREND} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.15)" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="rgba(120,120,120,0.3)" />
                <YAxis tick={{ fontSize: 10 }} stroke="rgba(120,120,120,0.3)" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="citations" stroke="#2196F3" strokeWidth={2.5} dot={{ r: 3 }} name="Citations" />
                <Line type="monotone" dataKey="paid"      stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} name="Zilizolipwa" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Region stats table */}
      <div className="rounded-xl bg-police-card p-4 shadow-sm">
        <h2 className="mb-3 text-[14px] font-bold text-police-navy">Ulinganisho wa Mikoa</h2>
        {loading ? (
          <div className="h-20 flex items-center justify-center"><Loader2 size={20} className="animate-spin text-police-faint" /></div>
        ) : regionStats.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-police-muted">Hakuna vituo vilivyopatikana — ongeza vituo kwenye Supabase</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-[12px]">
              <thead>
                <tr className="border-b border-police-soft bg-police-muted/40 text-[10px] uppercase text-police-faint">
                  <th className="px-3 py-3 font-semibold">Mkoa / Kituo</th>
                  <th className="px-3 py-3 text-right font-semibold">Maofisa</th>
                  <th className="px-3 py-3 text-right font-semibold">Matukio</th>
                  <th className="px-3 py-3 text-right font-semibold">Citations</th>
                  <th className="px-3 py-3 text-right font-semibold">Yaliyotatuliwa</th>
                  <th className="px-3 py-3 font-semibold">Tatuzi</th>
                </tr>
              </thead>
              <tbody>
                {regionStats.map((r, i) => {
                  const inc  = r.incidents ?? 0;
                  const res  = r.resolved  ?? 0;
                  const rate = inc > 0 ? Math.round((res / inc) * 100) : 0;
                  return (
                    <tr key={r.id ?? i} className="border-b border-police-soft hover:bg-police-muted/40 last:border-0">
                      <td className="px-3 py-3 font-semibold text-police">{r.region ?? r.name ?? "—"}</td>
                      <td className="px-3 py-3 text-right text-police-navy">{r.officers ?? 0}</td>
                      <td className="px-3 py-3 text-right text-[#FF9800]">{inc}</td>
                      <td className="px-3 py-3 text-right text-[#2196F3]">{r.citations ?? 0}</td>
                      <td className="px-3 py-3 text-right text-[#10B981]">{res}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-police-input">
                            <div className="h-full rounded-full bg-[#10B981]" style={{ width: `${rate}%` }} />
                          </div>
                          <span className="text-[11px] font-semibold text-police">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, color, loading }: { icon: React.ReactNode; label: string; value: string | number; color: string; loading: boolean }) {
  return (
    <div className="rounded-xl bg-police-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}1A`, color }}>
          {icon}
        </div>
        <div>
          {loading
            ? <div className="h-7 w-16 animate-pulse rounded bg-police-input" />
            : <p className="text-2xl font-bold text-police-navy">{value}</p>
          }
          <p className="text-[11px] text-police-muted">{label}</p>
        </div>
      </div>
    </div>
  );
}

function ChartSkeleton({ h = 256 }: { h?: number }) {
  return (
    <div className="flex items-center justify-center rounded-lg bg-police-input animate-pulse" style={{ height: h }}>
      <Loader2 size={22} className="animate-spin text-police-faint" />
    </div>
  );
}
