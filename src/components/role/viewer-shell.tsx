"use client";

import { useState } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  BarChart3,
  LineChart,
  Bell,
  HelpCircle,
  Search,
  Menu,
  X,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  Download,
  Filter,
  Users,
  MapPin,
  Building2,
  TrendingUp,
  TrendingDown,
  FileText,
  Clock,
  Eye,
  ChevronRight,
  AlertCircle,
  Info,
  CheckCircle2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { usePoliceStore } from "@/store/police-store";

/* ------------------------------------------------------------------ */
/*  ViewerScreen type                                                 */
/* ------------------------------------------------------------------ */
export type ViewerScreen =
  | "dashboard"
  | "reports"
  | "analytics"
  | "notifications"
  | "help";

const VIEWER_USER = {
  shortName: "",
  rank: "",
  initials: "V",
};

/* ------------------------------------------------------------------ */
/*  Nav items                                                         */
/* ------------------------------------------------------------------ */
const VIEWER_NAV: { id: ViewerScreen; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
  { id: "dashboard", label: "Dashibodi", icon: LayoutDashboard },
  { id: "reports", label: "Ripoti", icon: FileText },
  { id: "analytics", label: "Uchambuzi", icon: LineChart },
  { id: "notifications", label: "Arifa", icon: Bell },
  { id: "help", label: "Msaada", icon: HelpCircle },
];

/* ================================================================== */
/*  Screen Components                                                 */
/* ================================================================== */

/* ---- ViewerDashboard ---- */
function ViewerDashboard() {
  const overviewStats = [
    { label: "Total Officers", value: "0", icon: Users, color: "bg-blue-500/15 text-blue-600 dark:text-blue-400", sub: "Data from Supabase" },
    { label: "Active Cases", value: "0", icon: FileText, color: "bg-[#FF9800]/15 text-[#FF9800] ", sub: "—" },
    { label: "Stations", value: "0", icon: Building2, color: "bg-[#10B981]/15 text-[#10B981] ", sub: "—" },
    { label: "Regions", value: "0", icon: MapPin, color: "bg-[#1E3A8A]/15 text-[#1E3A8A] dark:", sub: "—" },
  ];

  const keyMetrics = [
    { label: "Crime Rate (Per 100k)", value: "—", change: "—", positive: false },
    { label: "Case Clearance Rate", value: "—%", change: "—", positive: false },
    { label: "Avg Response Time", value: "— min", change: "—", positive: false },
    { label: "Citizen Satisfaction", value: "—%", change: "—", positive: false },
  ];

  const recentActivity: never[] = [];

  const activityColor: Record<string, string> = {
    incident: "bg-[#EF4444]/100/15 text-[#EF4444]",
    case: "bg-[#FF9800]/15 text-[#FF9800]",
    deploy: "bg-blue-500/15 text-blue-500",
    report: "bg-[#10B981]/15 text-emerald-500",
    alert: "bg-[#1E3A8A]/15 text-[#1E3A8A]",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-police-navy">Dashibodi / Dashboard</h2>
        <p className="text-sm text-police-faint">Mpangaji Read-Only Overview</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {overviewStats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl bg-police-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-police-faint">{s.label}</p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.color}`}>
                  <Icon size={16} />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-police-navy">{s.value}</p>
              <p className="mt-0.5 text-[11px] text-police-faint">{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {keyMetrics.map((m) => (
          <div key={m.label} className="rounded-xl bg-police-card p-4 shadow-sm">
            <p className="text-xs font-medium text-police-faint">{m.label}</p>
            <p className="mt-1 text-xl font-bold text-police-navy">{m.value}</p>
            <div className="mt-1 flex items-center gap-1">
              {m.positive ? <TrendingUp size={12} className="text-emerald-500" /> : <TrendingDown size={12} className="text-[#EF4444]" />}
              <span className={`text-[11px] font-medium ${m.positive ? "text-[#10B981] " : "text-[#EF4444]"}`}>
                {m.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl bg-police-card p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-police-navy">Recent Activity / Shughuli za Hivi Karibuni</h3>
        <div className="space-y-3">
          {recentActivity.map((a, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg bg-police-muted/50 px-3 py-2.5">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold uppercase ${activityColor[a.type] ?? "bg-slate-100 text-slate-500"}`}>
                {a.type[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-police">{a.action}</p>
                <p className="text-[11px] text-police-faint">{a.time}</p>
              </div>
              <Eye size={14} className="shrink-0 text-police-faint" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- ViewerReports ---- */
function ViewerReports() {
  const [filterType, setFilterType] = useState<string>("all");

  const reports: never[] = [];

  const types = ["all", "Crime", "Performance", "Audit", "Traffic", "Deployment", "Regional"];
  const filtered = filterType === "all" ? reports : reports.filter((r) => r.type === filterType);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-police-navy">Ripoti / Reports</h2>
          <p className="text-sm text-police-faint">Available reports (read-only access)</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition ${
                filterType === t
                  ? "bg-[#2196F3] text-white"
                  : "bg-police-muted text-police-faint hover:text-police"
              }`}
            >
              {t === "all" ? "All" : t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((r) => (
          <div key={r.id} className="flex items-center gap-4 rounded-xl bg-police-card p-4 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EF4444]/100/15 text-[#EF4444]">
              <FileText size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-police">{r.name}</p>
              <div className="mt-1 flex items-center gap-3 text-[11px] text-police-faint">
                <span>{r.id}</span>
                <span>&middot;</span>
                <span>{r.type}</span>
                <span>&middot;</span>
                <span>{r.date}</span>
                <span>&middot;</span>
                <span>{r.format}</span>
                <span>&middot;</span>
                <span>{r.size}</span>
              </div>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg bg-police-muted px-3 py-2 text-[12px] font-medium text-police-faint transition hover:text-police">
              <Download size={14} />
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- ViewerAnalytics ---- */
function ViewerAnalytics() {
  const monthlyData = [
    { month: "Jul", theft: 120, assault: 45, traffic: 200 },
    { month: "Aug", theft: 135, assault: 52, traffic: 180 },
    { month: "Sep", theft: 110, assault: 38, traffic: 220 },
    { month: "Oct", theft: 145, assault: 60, traffic: 195 },
    { month: "Nov", theft: 98, assault: 42, traffic: 170 },
    { month: "Dec", theft: 87, assault: 35, traffic: 155 },
  ];

  const maxVal = Math.max(...monthlyData.flatMap((d) => [d.theft, d.assault, d.traffic]));

  const trends = [
    { label: "Overall Crime Rate", value: "-12.4%", positive: true, desc: "Year-over-year decrease in reported incidents" },
    { label: "Traffic Violations", value: "-18.7%", positive: true, desc: "Significant drop due to enforcement campaign" },
    { label: "Property Crime", value: "+3.2%", positive: false, desc: "Slight increase in urban areas" },
    { label: "Violent Crime", value: "-7.8%", positive: true, desc: "Continuing downward trend across regions" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-police-navy">Uchambuzi / Analytics</h2>
        <p className="text-sm text-police-faint">Crime statistics and trend analysis (read-only)</p>
      </div>

      {/* Bar Chart Placeholder */}
      <div className="rounded-xl bg-police-card p-5 shadow-sm">
        <h3 className="mb-4 text-[14px] font-semibold text-police-navy">Monthly Crime Statistics / Takwimu za Uhalifu Kila Mwezi</h3>
        <div className="flex items-end gap-2 h-64 px-2">
          {monthlyData.map((d) => (
            <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex w-full items-end gap-1 h-52">
                <div className="flex-1 rounded-t-md bg-blue-500/80 transition-all" style={{ height: `${(d.theft / maxVal) * 100}%` }} title={`Theft: ${d.theft}`} />
                <div className="flex-1 rounded-t-md bg-[#FF9800]/80 transition-all" style={{ height: `${(d.assault / maxVal) * 100}%` }} title={`Assault: ${d.assault}`} />
                <div className="flex-1 rounded-t-md bg-[#10B981]/80 transition-all" style={{ height: `${(d.traffic / maxVal) * 100}%` }} title={`Traffic: ${d.traffic}`} />
              </div>
              <span className="text-[11px] font-medium text-police-faint">{d.month}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-[11px]">
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-sm bg-blue-500/80" /> Theft</div>
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-sm bg-[#FF9800]/80" /> Assault</div>
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-sm bg-[#10B981]/80" /> Traffic</div>
        </div>
      </div>

      {/* Key Trends */}
      <div className="rounded-xl bg-police-card p-5 shadow-sm">
        <h3 className="mb-4 text-[14px] font-semibold text-police-navy">Key Trends / Mwelekeo Muhimu</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {trends.map((t) => (
            <div key={t.label} className="rounded-lg bg-police-muted/50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-police">{t.label}</p>
                <div className="flex items-center gap-1">
                  {t.positive ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-[#EF4444]" />}
                  <span className={`text-[13px] font-bold ${t.positive ? "text-[#10B981] " : "text-[#EF4444]"}`}>
                    {t.value}
                  </span>
                </div>
              </div>
              <p className="mt-1 text-[12px] text-police-faint">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- ViewerNotifications ---- */
function ViewerNotifications() {
  const notifications: never[] = [];

  const typeConfig: Record<string, { icon: typeof Info; color: string }> = {
    info: { icon: Info, color: "bg-blue-500/15 text-blue-500" },
    warning: { icon: AlertCircle, color: "bg-[#FF9800]/15 text-[#FF9800]" },
    success: { icon: CheckCircle2, color: "bg-[#10B981]/15 text-emerald-500" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-police-navy">Arifa / Notifications</h2>
        <p className="text-sm text-police-faint">Read-only notification feed</p>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => {
          const config = typeConfig[n.type] ?? typeConfig.info;
          const Icon = config.icon;
          return (
            <div
              key={n.id}
              className={`flex items-start gap-3 rounded-xl bg-police-card p-4 shadow-sm transition ${
                !n.read ? "ring-1 ring-blue-500/30" : ""
              }`}
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.color}`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold text-police">{n.title}</p>
                  {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                </div>
                <p className="mt-0.5 text-[12px] text-police-faint">{n.message}</p>
                <div className="mt-1.5 flex items-center gap-1 text-[11px] text-police-faint">
                  <Clock size={10} />
                  {n.time}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- ViewerHelp ---- */
function ViewerHelp() {
  const faqs = [
    {
      q: "How do I view crime statistics?",
      a: "Navigate to the 'Uchambuzi / Analytics' section in the sidebar. You will find monthly and quarterly crime statistics presented in charts and summary tables. All data is updated in real-time.",
    },
    {
      q: "Can I download reports?",
      a: "Yes. Go to 'Ripoti / Reports' in the sidebar. Each report has a Download button. Reports are available in PDF and Excel formats. Note: Downloads may require supervisor approval for certain report types.",
    },
    {
      q: "How often is data updated?",
      a: "Dashboard statistics and analytics are updated in real-time as new data is entered by officers and clerks. Monthly reports are published by the 5th of each month for the previous period.",
    },
    {
      q: "Why can't I edit records?",
      a: "Your account has Viewer (Mpangaji) permissions, which provides read-only access. If you need to modify records, contact your station commander or system administrator to request elevated permissions.",
    },
    {
      q: "How do I filter reports by region?",
      a: "In the Reports section, use the filter buttons above the report list. You can filter by type (Crime, Traffic, Audit, etc.) and use the search bar to find specific reports.",
    },
    {
      q: "Who do I contact for technical issues?",
      a: "For technical issues, contact the ICT Help Desk at extension 2200 or email ict@police.go.tz. For access permission issues, contact your Regional Commander.",
    },
    {
      q: "What do the trend indicators mean?",
      a: "Green arrows (↑) indicate positive trends (e.g., crime decrease, clearance improvement). Red arrows (↓) indicate areas of concern. Percentages show the change compared to the previous period.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-police-navy">Msaada / Help</h2>
        <p className="text-sm text-police-faint">Frequently asked questions and support information</p>
      </div>

      <div className="rounded-xl bg-police-card p-5 shadow-sm">
        <h3 className="mb-4 text-[14px] font-semibold text-police-navy">Frequently Asked Questions / Maswali Yanayoulizwa Mara Kwa Mara</h3>
        <div className="space-y-2">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className="rounded-lg border border-police-muted/50">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <span className="text-[13px] font-medium text-police">{faq.q}</span>
                  <ChevronRight
                    size={16}
                    className={`shrink-0 text-police-faint transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-police-muted/50 px-4 py-3">
                    <p className="text-[12px] leading-relaxed text-police-faint">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Support Info */}
      <div className="rounded-xl bg-police-card p-5 shadow-sm">
        <h3 className="mb-4 text-[14px] font-semibold text-police-navy">Contact Support / Wasiliana na Msaada</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-police-muted/50 p-4 text-center">
            <p className="text-[13px] font-semibold text-police">ICT Help Desk</p>
            <p className="mt-1 text-[12px] text-police-faint">Ext: 2200</p>
          </div>
          <div className="rounded-lg bg-police-muted/50 p-4 text-center">
            <p className="text-[13px] font-semibold text-police">Email Support</p>
            <p className="mt-1 text-[12px] text-blue-600 dark:text-blue-400">ict@police.go.tz</p>
          </div>
          <div className="rounded-lg bg-police-muted/50 p-4 text-center">
            <p className="text-[13px] font-semibold text-police">Working Hours</p>
            <p className="mt-1 text-[12px] text-police-faint">Mon-Fri, 08:00-17:00 EAT</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Screen Router                                                     */
/* ================================================================== */
function renderViewerScreen(screen: ViewerScreen) {
  switch (screen) {
    case "dashboard":
      return <ViewerDashboard />;
    case "reports":
      return <ViewerReports />;
    case "analytics":
      return <ViewerAnalytics />;
    case "notifications":
      return <ViewerNotifications />;
    case "help":
      return <ViewerHelp />;
    default:
      return <ViewerDashboard />;
  }
}

/* ================================================================== */
/*  ViewerShell (read-only)                                           */
/* ================================================================== */
export function ViewerShell() {
  const [viewerScreen, setViewerScreen] = useState<ViewerScreen>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { logout } = usePoliceStore();
  const isDark = theme === "dark";

  return (
    <div className="flex min-h-screen bg-police">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-[#0d1b3d] transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 border-b border-white/10 p-4">
            <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-[#2196F3]">
              <Image src="/police-logo.png" alt="TPF" width={40} height={40} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-white">TZ Police</p>
              <p className="text-[10px] text-white/60">Viewer / Mpangaji</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="ml-auto text-white/60 lg:hidden">
              <X size={20} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {VIEWER_NAV.map((item) => {
              const active = viewerScreen === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setViewerScreen(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                    active
                      ? "bg-[#2196F3] text-white shadow-lg shadow-[#2196F3]/30"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span className="flex-1 text-[13px] font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Read-only badge */}
          <div className="mx-3 mb-2 rounded-lg bg-[#FF9800]/15 px-3 py-2 text-center">
            <p className="text-[11px] font-semibold text-amber-400">🔒 Read-Only Access</p>
          </div>

          {/* User */}
          <div className="border-t border-white/10 p-3">
            <div className="flex items-center gap-3 rounded-lg bg-white/5 p-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2196F3] text-[12px] font-bold text-white">
                {VIEWER_USER.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-bold text-white">{VIEWER_USER.shortName}</p>
                <p className="truncate text-[10px] text-white/50">{VIEWER_USER.rank}</p>
              </div>
              <button onClick={logout} className="text-white/50 hover:text-white">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-police bg-police-card px-4 py-3">
          <button onClick={() => setSidebarOpen(true)} className="text-police lg:hidden">
            <Menu size={24} />
          </button>

          {/* Search */}
          <div className="hidden max-w-md flex-1 items-center gap-2 rounded-xl bg-police-muted px-3 sm:flex">
            <Search size={16} className="text-police-faint" />
            <input
              placeholder="Tafuta ripoti, takwimu..."
              className="h-9 flex-1 bg-transparent text-[13px] text-police placeholder:text-police-faint focus:outline-none"
              readOnly
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-police-muted text-police-navy"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-police-muted text-police">
              <Bell size={18} />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[9px] font-bold text-white">
                5
              </span>
            </button>

            {/* User chip */}
            <div className="flex items-center gap-2 rounded-lg bg-police-muted px-2.5 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2196F3] text-[11px] font-bold text-white">
                {VIEWER_USER.initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-[12px] font-bold leading-tight text-police">{VIEWER_USER.shortName}</p>
                <p className="text-[10px] leading-tight text-police-faint">{VIEWER_USER.rank}</p>
              </div>
              <ChevronDown size={14} className="text-police-faint" />
            </div>
          </div>
        </header>

        {/* Screen content */}
        <main key={viewerScreen} className="police-screen-enter flex-1 overflow-y-auto p-4 lg:p-6">
          {renderViewerScreen(viewerScreen)}
        </main>
      </div>
    </div>
  );
}