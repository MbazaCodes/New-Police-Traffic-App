"use client";

import { useState } from "react";
import {
  Calendar,
  FileText,
  Download,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { INCIDENT_TREND, OFFENSE_DISTRIBUTION, REGION_STATS } from "@/lib/admin-data";
import { toast } from "@/hooks/use-toast";

const DATE_RANGES = [
  { id: "7d", label: "Siku 7" },
  { id: "30d", label: "Siku 30" },
  { id: "90d", label: "Siku 90" },
  { id: "1y", label: "Mwaka 1" },
] as const;

const CITATIONS_TREND = [
  { day: "Jumatatu", citations: 65, paid: 42 },
  { day: "Jumanne", citations: 72, paid: 50 },
  { day: "Jumatano", citations: 58, paid: 38 },
  { day: "Alhamisi", citations: 81, paid: 55 },
  { day: "Ijumaa", citations: 94, paid: 67 },
  { day: "Jumamosi", citations: 102, paid: 78 },
  { day: "Jumapili", citations: 89, paid: 60 },
];

function escapeCsv(value: string | number): string {
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function AdminReports() {
  const [range, setRange] = useState<string>("7d");

  const totalIncidents = INCIDENT_TREND.reduce((s, d) => s + d.incidents, 0);
  const totalCitations = INCIDENT_TREND.reduce((s, d) => s + d.citations, 0);
  const resolved = REGION_STATS.reduce((s, r) => s + r.resolved, 0);

  const handleRangeChange = (r: string) => {
    setRange(r);
    toast({
      title: "Takwimu zimebadilishwa",
      description: `Muda umewekwa: ${DATE_RANGES.find((d) => d.id === r)?.label ?? r}`,
    });
  };

  const handleExportPdf = () => {
    toast({
      title: "Inapakua",
      description: "Ripoti ya PDF inatengenezwa",
    });
    const html = `<!doctype html><html lang="sw"><head><meta charset="utf-8"><title>TZ Police Report</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#0d1b3d}h1{color:#1A237E}table{border-collapse:collapse;width:100%;margin-top:12px;font-size:12px}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#1A237E;color:#fff}.stat{display:inline-block;margin-right:24px;padding:12px;background:#f5f7fb;border-radius:8px}</style></head><body><h1>Ripoti ya Polisi — TZ</h1><p>Tarehe: ${new Date().toLocaleDateString("en-GB")}</p><div><span class="stat"><b>Matukio Jumla:</b> ${totalIncidents}</span><span class="stat"><b>Citations Jumla:</b> ${totalCitations}</span><span class="stat"><b>Yaliyotatuliwa:</b> ${resolved}</span></div><h2>Mwelekeo wa Matukio (Siku 7)</h2><table><thead><tr><th>Siku</th><th>Matukio</th><th>Citations</th></tr></thead><tbody>${INCIDENT_TREND.map((d) => `<tr><td>${d.day}</td><td>${d.incidents}</td><td>${d.citations}</td></tr>`).join("")}</tbody></table><h2>Takwimu za Mikoa</h2><table><thead><tr><th>Mkoa</th><th>Maofisa</th><th>Matukio</th><th>Citations</th><th>Yaliyotatuliwa</th></tr></thead><tbody>${REGION_STATS.map((r) => `<tr><td>${r.region}</td><td>${r.officers}</td><td>${r.incidents}</td><td>${r.citations}</td><td>${r.resolved}</td></tr>`).join("")}</tbody></table></body></html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      setTimeout(() => w.print(), 500);
    } else {
      toast({ title: "Hitilafu", description: "Tafadhali ruhusu pop-up kwa ajili ya kuchapisha" });
    }
  };

  const handleExportCsv = () => {
    toast({
      title: "Inapakua",
      description: "Faili la CSV linapakuliwa sasa hivi",
    });
    const header = ["Region", "Officers", "Incidents", "Citations", "Resolved"];
    const rows = REGION_STATS.map((r) => [r.region, r.officers, r.incidents, r.citations, r.resolved]);
    const trendHeader = ["Day", "Incidents", "Citations"];
    const trendRows = INCIDENT_TREND.map((d) => [d.day, d.incidents, d.citations]);
    const csv = [
      ["# Region Stats"],
      header,
      ...rows,
      [""],
      ["# Incident Trend (7 days)"],
      trendHeader,
      ...trendRows,
    ]
      .map((r) => r.map(escapeCsv).join(","))
      .join("\n");
    const filename = `police-report-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadFile("\uFEFF" + csv, filename, "text/csv;charset=utf-8;");
  };

  return (
    <div className="space-y-5">
      {/* Heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-police-navy">Ripoti & Takwimu</h1>
          <p className="text-[13px] text-police-muted">
            Changanua na toa ripoti za shughuli za polisi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPdf}
            className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-[12px] font-semibold text-white hover:bg-red-600"
          >
            <FileText size={14} /> Pakua PDF
          </button>
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-lg bg-police-card px-3 py-2 text-[12px] font-semibold text-police-navy shadow-sm hover:bg-police-muted"
          >
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      {/* Date range selector */}
      <div className="flex flex-col gap-3 rounded-xl bg-police-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-police-faint" />
          <span className="text-[13px] font-semibold text-police-navy">
            Muda wa Ripoti:
          </span>
          <div className="flex gap-1.5">
            {DATE_RANGES.map((r) => (
              <button
                key={r.id}
                onClick={() => handleRangeChange(r.id)}
                className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition ${
                  range === r.id
                    ? "bg-[#2196F3] text-white"
                    : "bg-police-input text-police-muted hover:text-police"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-police-muted">
          <span>Kutoka:</span>
          <input
            type="date"
            defaultValue="2026-05-09"
            className="rounded-md border border-police-soft bg-police-input px-2 py-1 text-[12px] text-police focus:outline-none"
          />
          <span>Hadi:</span>
          <input
            type="date"
            defaultValue="2026-05-15"
            className="rounded-md border border-police-soft bg-police-input px-2 py-1 text-[12px] text-police focus:outline-none"
          />
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ReportStat
          icon={<BarChart3 size={16} />}
          label="Matukio Jumla"
          value={String(totalIncidents)}
          color="#FF9800"
        />
        <ReportStat
          icon={<FileText size={16} />}
          label="Citations Jumla"
          value={String(totalCitations)}
          color="#2196F3"
        />
        <ReportStat
          icon={<TrendingUp size={16} />}
          label="Yaliyotatuliwa"
          value={String(resolved)}
          color="#4CAF50"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Bar chart: incidents by day */}
        <div className="rounded-xl bg-police-card p-4 shadow-sm">
          <h2 className="text-[14px] font-bold text-police-navy">
            Matukio kwa Siku
          </h2>
          <p className="mb-3 text-[11px] text-police-muted">
            Idadi ya matukio kwa kila siku ya juma
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={INCIDENT_TREND}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.15)" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-police-muted"
                  stroke="rgba(120,120,120,0.3)"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-police-muted"
                  stroke="rgba(120,120,120,0.3)"
                />
                <Tooltip
                  cursor={{ fill: "rgba(33,150,243,0.08)" }}
                  contentStyle={{
                    backgroundColor: "var(--police-card)",
                    border: "1px solid var(--police-border)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "var(--police-text)",
                  }}
                />
                <Bar dataKey="incidents" fill="#FF9800" radius={[4, 4, 0, 0]} name="Matukio" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart: offense distribution */}
        <div className="rounded-xl bg-police-card p-4 shadow-sm">
          <h2 className="text-[14px] font-bold text-police-navy">
            Ugawanyiko wa Makosa
          </h2>
          <p className="mb-3 text-[11px] text-police-muted">Aina za makosa yaliyoripotiwa</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={OFFENSE_DISTRIBUTION}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  paddingAngle={2}
                  label={(entry) => `${entry.value}`}
                  labelLine={false}
                >
                  {OFFENSE_DISTRIBUTION.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--police-card)",
                    border: "1px solid var(--police-border)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "var(--police-text)",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Line chart: citations trend */}
      <div className="rounded-xl bg-police-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-bold text-police-navy">
              Mwelekeo wa Citations
            </h2>
            <p className="text-[11px] text-police-muted">
              Citations zilizotolewa dhidi ya zilizolipwa
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-police-muted">
              <span className="h-2 w-2 rounded-full bg-[#2196F3]" /> Citations
            </span>
            <span className="flex items-center gap-1 text-police-muted">
              <span className="h-2 w-2 rounded-full bg-[#4CAF50]" /> Zilizolipwa
            </span>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={CITATIONS_TREND}
              margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.15)" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-police-muted"
                stroke="rgba(120,120,120,0.3)"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-police-muted"
                stroke="rgba(120,120,120,0.3)"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--police-card)",
                  border: "1px solid var(--police-border)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "var(--police-text)",
                }}
              />
              <Line
                type="monotone"
                dataKey="citations"
                stroke="#2196F3"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#2196F3" }}
                name="Citations"
              />
              <Line
                type="monotone"
                dataKey="paid"
                stroke="#4CAF50"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#4CAF50" }}
                name="Zilizolipwa"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Region comparison table */}
      <div className="rounded-xl bg-police-card p-4 shadow-sm">
        <h2 className="mb-3 text-[14px] font-bold text-police-navy">
          Ulinganisho wa Mikoa
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-[12px]">
            <thead>
              <tr className="border-b border-police-soft bg-police-muted/40 text-[10px] uppercase text-police-faint">
                <th className="px-3 py-3 font-semibold">Mkoa</th>
                <th className="px-3 py-3 text-right font-semibold">Maofisa</th>
                <th className="px-3 py-3 text-right font-semibold">Matukio</th>
                <th className="px-3 py-3 text-right font-semibold">Citations</th>
                <th className="px-3 py-3 text-right font-semibold">Yaliyotatuliwa</th>
                <th className="px-3 py-3 font-semibold">Kiwango cha Tatuzi</th>
              </tr>
            </thead>
            <tbody>
              {REGION_STATS.map((r) => {
                const rate = Math.round((r.resolved / r.incidents) * 100);
                return (
                  <tr
                    key={r.region}
                    className="border-b border-police-soft transition hover:bg-police-muted/40 last:border-0"
                  >
                    <td className="px-3 py-3 font-semibold text-police">{r.region}</td>
                    <td className="px-3 py-3 text-right text-police-navy">{r.officers}</td>
                    <td className="px-3 py-3 text-right text-orange-500">{r.incidents}</td>
                    <td className="px-3 py-3 text-right text-[#2196F3]">{r.citations}</td>
                    <td className="px-3 py-3 text-right text-green-500">{r.resolved}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-police-input">
                          <div
                            className="h-full rounded-full bg-green-500"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-police">
                          {rate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReportStat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-police-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}1A`, color }}
        >
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-police-navy">{value}</p>
          <p className="text-[11px] text-police-muted">{label}</p>
        </div>
      </div>
    </div>
  );
}
