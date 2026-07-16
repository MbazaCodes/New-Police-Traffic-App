"use client";

import {
  Users,
  Shield,
  AlertTriangle,
  FileText,
  TrendingUp,
  TrendingDown,
  MapPin,
  Radio,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  DASHBOARD_KPIS,
  INCIDENT_TREND,
  OFFENSE_DISTRIBUTION,
  LIVE_INCIDENTS,
  REGION_STATS,
} from "@/lib/admin-data";
import { usePoliceStore } from "@/store/police-store";

const ICON_MAP: Record<string, typeof Users> = {
  users: Users,
  shield: Shield,
  "alert-triangle": AlertTriangle,
  "file-text": FileText,
};

const STATUS_STYLES: Record<string, string> = {
  urgent: "bg-red-500/15 text-red-500 border border-red-500/30",
  active: "bg-orange-500/15 text-orange-500 border border-orange-500/30",
  resolved: "bg-green-500/15 text-green-500 border border-green-500/30",
};

const STATUS_LABEL: Record<string, string> = {
  urgent: "MUHIMU",
  active: "Haijatatuliwa",
  resolved: "Imetatuliwa",
};

export function AdminDashboard() {
  const { setAdminScreen } = usePoliceStore();

  return (
    <div className="space-y-5">
      {/* Page heading */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-police-navy">Dashboard ya Amri</h1>
          <p className="text-[13px] text-police-muted">
            Muhtasari wa shughuli za polisi — leo, 15 Mei 2026
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-police-card px-3 py-1.5 text-[12px] text-police-muted shadow-sm">
          <Radio size={14} className="text-green-500" />
          <span>Mfumo wa Moja kwa Moja</span>
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {DASHBOARD_KPIS.map((kpi) => {
          const Icon = ICON_MAP[kpi.icon] ?? Users;
          const isUp = kpi.trend === "up";
          return (
            <div
              key={kpi.label}
              className="rounded-xl bg-police-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${kpi.color}1A`, color: kpi.color }}
                >
                  <Icon size={20} />
                </div>
                <span
                  className={`flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
                    isUp
                      ? "bg-green-500/15 text-green-500"
                      : "bg-red-500/15 text-red-500"
                  }`}
                >
                  {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {kpi.change}
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-police-navy">{kpi.value}</p>
              <p className="mt-0.5 text-[12px] text-police-muted">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Incident trend */}
        <div className="rounded-xl bg-police-card p-4 shadow-sm lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-[14px] font-bold text-police-navy">
                Mwelekeo wa Matukio na Citations
              </h2>
              <p className="text-[11px] text-police-muted">Siku 7 zilizopita</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-police-muted">
                <span className="h-2 w-2 rounded-full bg-[#FF9800]" /> Matukio
              </span>
              <span className="flex items-center gap-1 text-police-muted">
                <span className="h-2 w-2 rounded-full bg-[#2196F3]" /> Citations
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={INCIDENT_TREND}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF9800" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FF9800" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="citGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2196F3" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2196F3" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area
                  type="monotone"
                  dataKey="incidents"
                  stroke="#FF9800"
                  strokeWidth={2}
                  fill="url(#incGrad)"
                  name="Matukio"
                />
                <Area
                  type="monotone"
                  dataKey="citations"
                  stroke="#2196F3"
                  strokeWidth={2}
                  fill="url(#citGrad)"
                  name="Citations"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Offense distribution pie */}
        <div className="rounded-xl bg-police-card p-4 shadow-sm">
          <h2 className="text-[14px] font-bold text-police-navy">
            Ugawanyiko wa Makosa
          </h2>
          <p className="text-[11px] text-police-muted">Mwezi huu</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={OFFENSE_DISTRIBUTION}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
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
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 10 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live incidents + region stats */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Live incidents */}
        <div className="rounded-xl bg-police-card p-4 shadow-sm lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-[14px] font-bold text-police-navy">
                Matukio ya Moja kwa Moja
              </h2>
              <p className="text-[11px] text-police-muted">
                  Sasisho la mwisho: sasa hivi
                </p>
            </div>
            <button
              onClick={() => setAdminScreen("incidents")}
              className="rounded-lg bg-police-muted px-3 py-1.5 text-[12px] font-semibold text-police-navy hover:bg-police-input"
            >
              Angalia Zote
            </button>
          </div>
          <div className="space-y-2">
            {LIVE_INCIDENTS.map((inc) => (
              <div
                key={inc.id}
                className="flex items-center gap-3 rounded-lg border border-police-soft bg-police-muted/40 p-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-police-input text-police-navy">
                  <AlertTriangle size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-semibold text-police">
                      {inc.type}
                    </p>
                    <span className="text-[10px] text-police-faint">{inc.time}</span>
                  </div>
                  <p className="truncate text-[11px] text-police-muted">
                    <MapPin size={10} className="mr-0.5 inline" />
                    {inc.location} • {inc.officer}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    STATUS_STYLES[inc.status]
                  }`}
                >
                  {STATUS_LABEL[inc.status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Region stats table */}
        <div className="rounded-xl bg-police-card p-4 shadow-sm">
          <h2 className="text-[14px] font-bold text-police-navy">
            Takwimu za Mikoa
          </h2>
          <p className="mb-3 text-[11px] text-police-muted">Maofisa, matukio, citations</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-police-soft text-[10px] uppercase text-police-faint">
                  <th className="pb-2 font-semibold">Mkoa</th>
                  <th className="pb-2 text-right font-semibold">Walioko</th>
                  <th className="pb-2 text-right font-semibold">Matukio</th>
                  <th className="pb-2 text-right font-semibold">Citations</th>
                </tr>
              </thead>
              <tbody>
                {REGION_STATS.map((r) => (
                  <tr
                    key={r.region}
                    className="border-b border-police-soft last:border-0"
                  >
                    <td className="py-2 font-semibold text-police">{r.region}</td>
                    <td className="py-2 text-right text-police-navy">{r.officers}</td>
                    <td className="py-2 text-right text-orange-500">{r.incidents}</td>
                    <td className="py-2 text-right text-[#2196F3]">{r.citations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
