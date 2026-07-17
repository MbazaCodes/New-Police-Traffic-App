"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Shield,
  AlertTriangle,
  FileText,
  TrendingUp,
  TrendingDown,
  MapPin,
  Radio,
  RefreshCw,
  Activity,
  Database,
  Wifi,
  BadgeDollarSign,
  CheckCircle2,
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
  OFFICERS,
} from "@/lib/admin-data";
import { getOfficerProfilePath } from "@/lib/admin-navigation";
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
  const pathname = usePathname();
  const { setAdminScreen } = usePoliceStore();
  const [simulationState, setSimulationState] = useState<{ running: boolean; startedAt: string | null; updatedAt: string } | null>(null);
  const [mockSummary, setMockSummary] = useState<{ totalRecords: number; onlineOfficers: number; openCases: number; todayFines: number; syncEnabled: boolean; offlineEnabled: boolean } | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDashboardStats() {
      try {
        const [simResponse, mockResponse] = await Promise.all([
          fetch("/api/simulation/status", { cache: "no-store" }),
          fetch("/api/mock-db/refresh", { method: "POST" }),
        ]);

        const simJson = await simResponse.json();
        const mockJson = await mockResponse.json();

        if (!active) return;

        setSimulationState(simJson.data ?? null);
        setMockSummary(mockJson.data?.summary ?? null);
      } catch {
        if (!active) return;
        setSimulationState({ running: false, startedAt: null, updatedAt: new Date().toISOString() });
        setMockSummary({ totalRecords: 0, onlineOfficers: 0, openCases: 0, todayFines: 0, syncEnabled: false, offlineEnabled: false });
      }
    }

    void loadDashboardStats();

    return () => {
      active = false;
    };
  }, []);

  const dashboardCards = useMemo(() => {
    const simulationActive = simulationState?.running ?? false;
    const syncEnabled = mockSummary?.syncEnabled ?? false;

    return [
      {
        label: "Simulation Status",
        value: simulationActive ? "Running" : "Stopped",
        meta: simulationState?.startedAt ? `Started ${new Date(simulationState.startedAt).toLocaleTimeString("sw-TZ", { hour: "2-digit", minute: "2-digit" })}` : "Not started",
        icon: Activity,
        tone: simulationActive ? "green" : "slate",
      },
      {
        label: "Mock DB Records",
        value: String(mockSummary?.totalRecords ?? 0),
        meta: "Citizens, vehicles, officers, stations, cases",
        icon: Database,
        tone: "blue",
      },
      {
        label: "Online Officers",
        value: String(mockSummary?.onlineOfficers ?? 0),
        meta: "Live duty status",
        icon: Wifi,
        tone: "emerald",
      },
      {
        label: "Open Cases",
        value: String(mockSummary?.openCases ?? 0),
        meta: "Awaiting resolution",
        icon: FileText,
        tone: "orange",
      },
      {
        label: "Today's Fines",
        value: String(mockSummary?.todayFines ?? 0),
        meta: "Collected citations",
        icon: BadgeDollarSign,
        tone: "violet",
      },
      {
        label: "Sync Status",
        value: syncEnabled ? "Synced" : "Offline",
        meta: mockSummary?.offlineEnabled ? "Offline mode enabled" : "Live sync disabled",
        icon: CheckCircle2,
        tone: syncEnabled ? "green" : "slate",
      },
    ];
  }, [mockSummary, simulationState]);

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

      {/* Simulation / DB cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {dashboardCards.map((card) => {
          const Icon = card.icon;
          const tones: Record<string, string> = {
            green: "bg-green-500/15 text-green-600",
            blue: "bg-[#2196F3]/15 text-[#2196F3]",
            emerald: "bg-emerald-500/15 text-emerald-600",
            orange: "bg-orange-500/15 text-orange-600",
            violet: "bg-violet-500/15 text-violet-600",
            slate: "bg-slate-500/15 text-slate-600",
          };

          return (
            <div key={card.label} className="rounded-xl bg-police-card p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[card.tone] ?? tones.slate}`}>
                  <Icon size={20} />
                </div>
                <RefreshCw size={14} className="text-police-faint" />
              </div>
              <p className="mt-3 text-2xl font-bold text-police-navy">{card.value}</p>
              <p className="mt-0.5 text-[12px] font-semibold text-police">{card.label}</p>
              <p className="mt-1 text-[11px] text-police-muted">{card.meta}</p>
            </div>
          );
        })}
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

      <div className="rounded-xl bg-police-card p-4 shadow-sm">
        <h2 className="mb-3 text-[14px] font-bold text-police-navy">Admin Operations</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <button onClick={() => setAdminScreen("officers")} className="rounded-lg bg-police-input px-3 py-2 text-[12px] font-semibold text-police-navy hover:bg-police-muted">Officers</button>
          <button onClick={() => setAdminScreen("users")} className="rounded-lg bg-police-input px-3 py-2 text-[12px] font-semibold text-police-navy hover:bg-police-muted">Users</button>
          <button onClick={() => setAdminScreen("stations")} className="rounded-lg bg-police-input px-3 py-2 text-[12px] font-semibold text-police-navy hover:bg-police-muted">Stations</button>
          <button onClick={() => setAdminScreen("posts")} className="rounded-lg bg-police-input px-3 py-2 text-[12px] font-semibold text-police-navy hover:bg-police-muted">Posts</button>
          <button onClick={() => setAdminScreen("assignments")} className="rounded-lg bg-police-input px-3 py-2 text-[12px] font-semibold text-police-navy hover:bg-police-muted">Assignments</button>
          <button onClick={() => setAdminScreen("incidents")} className="rounded-lg bg-police-input px-3 py-2 text-[12px] font-semibold text-police-navy hover:bg-police-muted">Incidents</button>
        </div>
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
                    {inc.location} • {(() => {
                      const officer = OFFICERS.find((o) => o.name === inc.officer);
                      if (!officer) return inc.officer;
                      return (
                        <Link href={getOfficerProfilePath(pathname, officer.id)} className="font-medium text-[#2196F3] hover:underline">
                          {inc.officer}
                        </Link>
                      );
                    })()}
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
