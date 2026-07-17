"use client";

import { useState } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Activity,
  UserCog,
  Plug,
  Bell,
  Settings,
  Search,
  Menu,
  X,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  Server,
  Database,
  HardDrive,
  Wifi,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  MoreVertical,
  Cpu,
  MemoryStick,
  Zap,
  Cloud,
  MessageSquare,
  CreditCard,
} from "lucide-react";
import { useTheme } from "next-themes";
import { usePoliceStore } from "@/store/police-store";

/* ------------------------------------------------------------------ */
/*  SystemScreen type                                                 */
/* ------------------------------------------------------------------ */
export type SystemScreen =
  | "dashboard"
  | "users"
  | "system-health"
  | "user-management"
  | "integrations"
  | "notifications"
  | "settings";

const SYSTEM_USER = {
  shortName: "ACP. Thomas Mbatia",
  rank: "Assistant Commissioner",
  initials: "TM",
};

/* ------------------------------------------------------------------ */
/*  Nav items                                                         */
/* ------------------------------------------------------------------ */
const SYSTEM_NAV: { id: SystemScreen; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
  { id: "dashboard", label: "Dashibodi", icon: LayoutDashboard },
  { id: "users", label: "Watumiaji", icon: Users },
  { id: "system-health", label: "Afya ya Mfumo", icon: Activity, badge: 1 },
  { id: "user-management", label: "Usimamizi wa Watumiaji", icon: UserCog },
  { id: "integrations", label: "Miunganisho", icon: Plug },
  { id: "notifications", label: "Arifa", icon: Bell, badge: 4 },
  { id: "settings", label: "Mipangilio", icon: Settings },
];

/* ================================================================== */
/*  Screen Components                                                 */
/* ================================================================== */

/* ---- SystemDashboard ---- */
function SystemDashboard() {
  const systemStats = [
    { label: "CPU Usage", value: "45%", icon: Cpu, color: "bg-blue-500/15 text-blue-600 dark:text-blue-400", bar: 45, barColor: "bg-blue-500" },
    { label: "Memory Usage", value: "62%", icon: MemoryStick, color: "bg-[#1E3A8A]/15 text-[#1E3A8A] ", bar: 62, barColor: "bg-[#1E3A8A]" },
    { label: "Uptime", value: "99.9%", icon: Zap, color: "bg-[#10B981]/15 text-[#10B981] ", bar: 99.9, barColor: "bg-[#10B981]" },
    { label: "Active Users", value: "23", icon: Users, color: "bg-[#FF9800]/15 text-[#FF9800] ", bar: 23, barColor: "bg-[#FF9800]" },
  ];

  const serverStatus = [
    { name: "Web Server (Next.js)", status: "Online", region: "Dar es Salaam", load: "32%", icon: Server },
    { name: "API Gateway", status: "Online", region: "Dar es Salaam", load: "18%", icon: Cloud },
    { name: "Worker Queue", status: "Online", region: "Dodoma", load: "5 jobs", icon: RefreshCw },
    { name: "CDN Edge", status: "Online", region: "Multi-region", load: "N/A", icon: Wifi },
  ];

  const recentEvents = [
    { event: "Auto-backup completed successfully", time: "5 min ago", type: "success" },
    { event: "User Cpl. Juma logged in from new device", time: "15 min ago", type: "warning" },
    { event: "Database optimization job completed", time: "32 min ago", type: "success" },
    { event: "Rate limit triggered for IP 196.43.x.x", time: "1 hr ago", type: "alert" },
    { event: "SSL certificate renewed for police.go.tz", time: "2 hrs ago", type: "success" },
    { event: "SMS Gateway reconnected after timeout", time: "3 hrs ago", type: "warning" },
    { event: "New user account created: PC. Rashid", time: "4 hrs ago", type: "info" },
  ];

  const eventColor: Record<string, string> = {
    success: "bg-[#10B981]",
    warning: "bg-[#FF9800]",
    alert: "bg-[#EF4444]/100",
    info: "bg-blue-500",
  };

  const eventIcon: Record<string, typeof CheckCircle2> = {
    success: CheckCircle2,
    warning: AlertTriangle,
    alert: AlertCircle,
    info: Activity,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-police-navy">Dashibodi / Dashboard</h2>
        <p className="text-sm text-police-faint">System Admin / Msimamizi wa Mfumo</p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {systemStats.map((s) => {
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
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-police-muted">
                <div className={`h-full rounded-full ${s.barColor} transition-all`} style={{ width: `${Math.min(s.bar, 100)}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Server Status */}
        <div className="rounded-xl bg-police-card p-5 shadow-sm">
          <h3 className="mb-4 text-[14px] font-semibold text-police-navy">Server Status / Hali ya Seva</h3>
          <div className="space-y-3">
            {serverStatus.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.name} className="flex items-center gap-3 rounded-lg bg-police-muted/50 px-3 py-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#10B981]/15 text-[#10B981] ">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-police">{s.name}</p>
                    <p className="text-[11px] text-police-faint">{s.region} &middot; Load: {s.load}</p>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-[#10B981] ">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                    {s.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent System Events */}
        <div className="rounded-xl bg-police-card p-5 shadow-sm">
          <h3 className="mb-4 text-[14px] font-semibold text-police-navy">System Events / Matukio ya Mfumo</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentEvents.map((e, i) => {
              const Icon = eventIcon[e.type] ?? Activity;
              const color = eventColor[e.type] ?? "bg-slate-500";
              return (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-police-muted/50 px-3 py-2.5">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${color} text-white`}>
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium text-police">{e.event}</p>
                    <p className="text-[11px] text-police-faint">{e.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- SystemUsers ---- */
function SystemUsers() {
  const users = [
    { name: "Insp. Fatma Hassan", role: "Clerk / Karani", status: "Online", lastLogin: "2024-12-15 14:30", initials: "FH" },
    { name: "PC. John Makalla", role: "Viewer / Mpangaji", status: "Online", lastLogin: "2024-12-15 14:15", initials: "JM" },
    { name: "Sgt. Joseph Kimaro", role: "Station Commander", status: "Offline", lastLogin: "2024-12-15 09:00", initials: "JK" },
    { name: "Cpl. Amina Juma", role: "Traffic Officer", status: "Online", lastLogin: "2024-12-15 13:45", initials: "AJ" },
    { name: "PC. Hamisi Rashid", role: "General Officer", status: "Offline", lastLogin: "2024-12-14 17:30", initials: "HR" },
    { name: "ASP. Grace Mwangi", role: "Regional Commander", status: "Online", lastLogin: "2024-12-15 12:00", initials: "GM" },
    { name: "IP. David Omary", role: "Investigator / CID", status: "Away", lastLogin: "2024-12-15 11:20", initials: "DO" },
    { name: "ACP. Thomas Mbatia", role: "System Admin", status: "Online", lastLogin: "2024-12-15 14:00", initials: "TM" },
  ];

  const statusDot: Record<string, string> = {
    Online: "bg-[#10B981]",
    Offline: "bg-slate-400",
    Away: "bg-[#FF9800]",
  };

  const statusStyle: Record<string, string> = {
    Online: "text-[#10B981] ",
    Offline: "text-slate-500",
    Away: "text-[#FF9800] ",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-police-navy">Watumiaji / Users</h2>
          <p className="text-sm text-police-faint">Active and registered system users</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-police-muted px-3 py-1.5">
          <span className="text-xs text-police-faint">{users.filter((u) => u.status === "Online").length} online</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl bg-police-card shadow-sm">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-police-muted text-police-faint">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Last Login</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.name} className="border-b border-police-muted/50 last:border-b-0 hover:bg-police-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2196F3] text-[11px] font-bold text-white">
                      {u.initials}
                    </div>
                    <span className="font-medium text-police">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-police-faint">{u.role}</td>
                <td className="px-4 py-3">
                  <span className={`flex items-center gap-1.5 text-[12px] font-medium ${statusStyle[u.status]}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusDot[u.status]}`} />
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-police-faint">{u.lastLogin}</td>
                <td className="px-4 py-3">
                  <button className="text-police-faint hover:text-police transition">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---- SystemHealth ---- */
function SystemHealth() {
  const servers = [
    { name: "API Server", status: "Healthy", responseTime: "45ms", uptime: "99.98%", lastCheck: "30 sec ago", icon: Server, details: ["Region: Dar es Salaam", "Port: 443 (HTTPS)", "Version: v2.14.3"] },
    { name: "Database (PostgreSQL)", status: "Healthy", responseTime: "12ms", uptime: "99.99%", lastCheck: "15 sec ago", icon: Database, details: ["Region: Dodoma", "Connections: 23/100", "Storage: 4.2 GB / 50 GB"] },
    { name: "Redis Cache", status: "Healthy", responseTime: "2ms", uptime: "99.97%", lastCheck: "10 sec ago", icon: Zap, details: ["Memory: 256 MB", "Keys: 12,847", "Hit Rate: 94.2%"] },
    { name: "File Storage", status: "Warning", responseTime: "120ms", uptime: "99.5%", lastCheck: "45 sec ago", icon: HardDrive, details: ["Region: Multi-CDN", "Storage: 180 GB / 200 GB", "Files: 84,231"] },
  ];

  const statusConfig: Record<string, { color: string; textColor: string; dot: string }> = {
    Healthy: { color: "bg-[#10B981]/15", textColor: "text-[#10B981] ", dot: "bg-[#10B981]" },
    Warning: { color: "bg-[#FF9800]/15", textColor: "text-[#FF9800] ", dot: "bg-[#FF9800]" },
    Critical: { color: "bg-[#EF4444]/100/15", textColor: "text-[#EF4444] dark:text-[#EF4444]400", dot: "bg-[#EF4444]/100" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-police-navy">Afya ya Mfumo / System Health</h2>
        <p className="text-sm text-police-faint">Real-time server and service monitoring</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {servers.map((s) => {
          const config = statusConfig[s.status] ?? statusConfig.Healthy;
          const Icon = s.icon;
          return (
            <div key={s.name} className={`rounded-xl bg-police-card p-5 shadow-sm ring-1 ${s.status === "Warning" ? "ring-amber-500/30" : "ring-transparent"}`}>
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${config.color} ${config.textColor}`}>
                  <Icon size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[14px] font-semibold text-police-navy">{s.name}</h3>
                    <span className={`flex items-center gap-1 text-[11px] font-semibold ${config.textColor}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                      {s.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-[12px] text-police-faint">
                    <span>Response: {s.responseTime}</span>
                    <span>Uptime: {s.uptime}</span>
                    <span>Checked: {s.lastCheck}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-1 border-t border-police-muted/50 pt-3">
                {s.details.map((d, i) => (
                  <p key={i} className="text-[11px] text-police-faint">{d}</p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- SystemUserManagement ---- */
function SystemUserManagement() {
  const users = [
    { id: 1, name: "Insp. Fatma Hassan", email: "f.hassan@police.go.tz", role: "Clerk", status: "Active", created: "2024-03-15", lastLogin: "2024-12-15" },
    { id: 2, name: "PC. John Makalla", email: "j.makalla@police.go.tz", role: "Viewer", status: "Active", created: "2024-05-22", lastLogin: "2024-12-15" },
    { id: 3, name: "Sgt. Joseph Kimaro", email: "j.kimaro@police.go.tz", role: "Station Commander", status: "Active", created: "2024-01-10", lastLogin: "2024-12-15" },
    { id: 4, name: "Cpl. Amina Juma", email: "a.juma@police.go.tz", role: "Traffic Officer", status: "Active", created: "2024-06-01", lastLogin: "2024-12-15" },
    { id: 5, name: "PC. Hamisi Rashid", email: "h.rashid@police.go.tz", role: "General Officer", status: "Suspended", created: "2024-02-28", lastLogin: "2024-12-14" },
    { id: 6, name: "ASP. Grace Mwangi", email: "g.mwangi@police.go.tz", role: "Regional Commander", status: "Active", created: "2024-01-05", lastLogin: "2024-12-15" },
  ];

  const statusStyle: Record<string, string> = {
    Active: "bg-[#10B981]/15 text-[#10B981] ",
    Suspended: "bg-[#EF4444]/100/15 text-[#EF4444] dark:text-[#EF4444]400",
    Inactive: "bg-slate-500/15 text-slate-500",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-police-navy">Usimamizi wa Watumiaji / User Management</h2>
          <p className="text-sm text-police-faint">Create, edit, and manage user accounts</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-[#2196F3] px-4 py-2 text-[12px] font-semibold text-white shadow-md shadow-[#2196F3]/30 hover:bg-[#2196F3] transition">
          + Add User
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl bg-police-card shadow-sm">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-police-muted text-police-faint">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Last Login</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-police-muted/50 last:border-b-0 hover:bg-police-muted/30">
                <td className="px-4 py-3 font-medium text-police">{u.name}</td>
                <td className="px-4 py-3 text-police-faint">{u.email}</td>
                <td className="px-4 py-3 text-police">{u.role}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusStyle[u.status] ?? ""}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-police-faint">{u.created}</td>
                <td className="px-4 py-3 text-police-faint">{u.lastLogin}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button className="rounded px-2 py-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition">Edit</button>
                    <button className="rounded px-2 py-1 text-[11px] font-medium text-police-faint hover:bg-police-muted transition">Disable</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---- SystemIntegrations ---- */
function SystemIntegrations() {
  const integrations = [
    {
      name: "Supabase",
      description: "Primary database and authentication backend",
      status: "Connected",
      icon: Database,
      color: "bg-[#10B981]/15 text-[#10B981] ",
      details: { latency: "12ms", region: "Dodoma", version: "v2.39.3" },
    },
    {
      name: "Payment Gateway",
      description: "Fine and fee payment processing via NMB & CRDB",
      status: "Connected",
      icon: CreditCard,
      color: "bg-[#10B981]/15 text-[#10B981] ",
      details: { latency: "340ms", provider: "NMB / CRDB", version: "v1.8.0" },
    },
    {
      name: "SMS Gateway",
      description: "Bulk SMS notifications via Vodacom & Airtel",
      status: "Degraded",
      icon: MessageSquare,
      color: "bg-[#FF9800]/15 text-[#FF9800] ",
      details: { latency: "1,200ms", provider: "Twilio TZ", version: "v3.2.1" },
    },
    {
      name: "Email Service",
      description: "Transaction emails and system alerts",
      status: "Connected",
      icon: Mail,
      color: "bg-[#10B981]/15 text-[#10B981] ",
      details: { latency: "85ms", provider: "SendGrid", version: "v7.1.0" },
    },
  ];

  const statusDot: Record<string, string> = {
    Connected: "bg-[#10B981]",
    Degraded: "bg-[#FF9800]",
    Disconnected: "bg-[#EF4444]/100",
  };

  const statusTextColor: Record<string, string> = {
    Connected: "text-[#10B981] ",
    Degraded: "text-[#FF9800] ",
    Disconnected: "text-[#EF4444] dark:text-[#EF4444]400",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-police-navy">Miunganisho / Integrations</h2>
        <p className="text-sm text-police-faint">External service connections and status</p>
      </div>

      <div className="space-y-4">
        {integrations.map((svc) => {
          const Icon = svc.icon;
          return (
            <div key={svc.name} className="rounded-xl bg-police-card p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${svc.color}`}>
                  <Icon size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-[14px] font-semibold text-police-navy">{svc.name}</h3>
                    <span className={`flex items-center gap-1 text-[11px] font-semibold ${statusTextColor[svc.status]}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusDot[svc.status]}`} />
                      {svc.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-police-faint">{svc.description}</p>
                  <div className="mt-3 flex items-center gap-6 text-[11px] text-police-faint">
                    {Object.entries(svc.details).map(([k, v]) => (
                      <span key={k}><span className="font-medium text-police">{k}:</span> {v}</span>
                    ))}
                  </div>
                </div>
                <button className="shrink-0 rounded-lg bg-police-muted px-3 py-1.5 text-[12px] font-medium text-police-faint hover:text-police transition">
                  Configure
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- SystemNotifications ---- */
function SystemNotifications() {
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  const systemAlerts = [
    { title: "File Storage nearing capacity", message: "File storage is at 90% (180 GB / 200 GB). Consider archiving old files or upgrading storage.", severity: "warning", time: "10 min ago" },
    { title: "SMS Gateway latency increased", message: "Average response time has increased to 1,200ms. Airtel endpoint experiencing intermittent timeouts.", severity: "warning", time: "25 min ago" },
    { title: "Auto-backup completed", message: "Daily database backup completed successfully. Size: 4.2 GB. Duration: 8 min 32 sec.", severity: "success", time: "1 hr ago" },
    { title: "SSL certificate renewed", message: "SSL certificate for police.go.tz has been auto-renewed. Expires: 2025-12-15.", severity: "success", time: "2 hrs ago" },
    { title: "Failed login attempts detected", message: "15 failed login attempts from IP 196.43.x.x in the last hour. Rate limit has been applied.", severity: "alert", time: "3 hrs ago" },
    { title: "Database connection pool optimization", message: "Connection pool resized from 30 to 50. No service disruption detected.", severity: "info", time: "5 hrs ago" },
  ];

  const severityConfig: Record<string, { icon: typeof AlertCircle; color: string }> = {
    success: { icon: CheckCircle2, color: "bg-[#10B981]/15 text-emerald-500" },
    warning: { icon: AlertTriangle, color: "bg-[#FF9800]/15 text-[#FF9800]" },
    alert: { icon: AlertCircle, color: "bg-[#EF4444]/100/15 text-[#EF4444]" },
    info: { icon: Activity, color: "bg-blue-500/15 text-blue-500" },
  };

  const toggleBtn = (enabled: boolean, onToggle: () => void) => (
    <button
      onClick={onToggle}
      className={`relative h-6 w-10 rounded-full p-0.5 transition-colors ${enabled ? "bg-[#2196F3]" : "bg-slate-300 dark:bg-slate-600"}`}
    >
      <div className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-police-navy">Arifa / Notifications</h2>
        <p className="text-sm text-police-faint">System alert settings and recent notifications</p>
      </div>

      {/* Notification Settings */}
      <div className="rounded-xl bg-police-card p-5 shadow-sm">
        <h3 className="mb-4 text-[14px] font-semibold text-police-navy">Notification Channels / Njia za Arifa</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">In-App Notifications</p>
              <p className="text-[11px] text-police-faint">Show alerts within the platform</p>
            </div>
            {toggleBtn(notifEnabled, () => setNotifEnabled(!notifEnabled))}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">Email Alerts</p>
              <p className="text-[11px] text-police-faint">Send critical alerts to admin email</p>
            </div>
            {toggleBtn(emailEnabled, () => setEmailEnabled(!emailEnabled))}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">SMS Alerts</p>
              <p className="text-[11px] text-police-faint">Send critical alerts via SMS (currently degraded)</p>
            </div>
            {toggleBtn(smsEnabled, () => setSmsEnabled(!smsEnabled))}
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="rounded-xl bg-police-card p-5 shadow-sm">
        <h3 className="mb-4 text-[14px] font-semibold text-police-navy">Recent System Alerts / Arifa za Hivi Karibuni</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {systemAlerts.map((a, i) => {
            const config = severityConfig[a.severity] ?? severityConfig.info;
            const Icon = config.icon;
            return (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-police-muted/50 px-3 py-2.5">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.color}`}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-police">{a.title}</p>
                  <p className="mt-0.5 text-[12px] text-police-faint">{a.message}</p>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-police-faint">
                    <Clock size={10} />
                    {a.time}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---- SystemSettings ---- */
function SystemSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-police-navy">Mipangilio / Settings</h2>
        <p className="text-sm text-police-faint">System configuration and preferences</p>
      </div>

      {/* General */}
      <div className="rounded-xl bg-police-card p-5 shadow-sm">
        <h3 className="mb-4 text-[14px] font-semibold text-police-navy">General / Jumla</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">Platform Name</p>
              <p className="text-[11px] text-police-faint">Display name across the application</p>
            </div>
            <span className="rounded-lg bg-police-muted px-3 py-1.5 text-[12px] font-medium text-police">TZ Police Digital Platform</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">Default Language</p>
              <p className="text-[11px] text-police-faint">System-wide default language</p>
            </div>
            <span className="rounded-lg bg-police-muted px-3 py-1.5 text-[12px] font-medium text-police">Kiswahili</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">Time Zone</p>
              <p className="text-[11px] text-police-faint">Server time zone for timestamps</p>
            </div>
            <span className="rounded-lg bg-police-muted px-3 py-1.5 text-[12px] font-medium text-police">Africa/Dar_es_Salaam (EAT)</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">Maintenance Mode</p>
              <p className="text-[11px] text-police-faint">Disable user access during maintenance</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-[#10B981]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#10B981] ">Disabled</span>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-xl bg-police-card p-5 shadow-sm">
        <h3 className="mb-4 text-[14px] font-semibold text-police-navy">Security / Usalama</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">Session Timeout</p>
              <p className="text-[11px] text-police-faint">Global session timeout for all users</p>
            </div>
            <span className="rounded-lg bg-police-muted px-3 py-1.5 text-[12px] font-medium text-police">30 minutes</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">Password Policy</p>
              <p className="text-[11px] text-police-faint">Minimum password requirements</p>
            </div>
            <span className="rounded-lg bg-police-muted px-3 py-1.5 text-[12px] font-medium text-police">Min 12 chars, mixed case + numbers</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">Two-Factor Authentication</p>
              <p className="text-[11px] text-police-faint">Require 2FA for all admin roles</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-[#10B981]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#10B981] ">Enforced</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">IP Whitelist</p>
              <p className="text-[11px] text-police-faint">Restrict admin access to specific IPs</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-[#FF9800]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#FF9800] ">5 IPs configured</span>
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="rounded-xl bg-police-card p-5 shadow-sm">
        <h3 className="mb-4 text-[14px] font-semibold text-police-navy">Email / Barua Pepe</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">SMTP Provider</p>
              <p className="text-[11px] text-police-faint">Email delivery service</p>
            </div>
            <span className="rounded-lg bg-police-muted px-3 py-1.5 text-[12px] font-medium text-police">SendGrid</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">From Address</p>
              <p className="text-[11px] text-police-faint">Sender email address</p>
            </div>
            <span className="rounded-lg bg-police-muted px-3 py-1.5 text-[12px] font-medium text-police">noreply@police.go.tz</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">Daily Email Limit</p>
              <p className="text-[11px] text-police-faint">Maximum emails per day</p>
            </div>
            <span className="rounded-lg bg-police-muted px-3 py-1.5 text-[12px] font-medium text-police">10,000</span>
          </div>
        </div>
      </div>

      {/* Backup */}
      <div className="rounded-xl bg-police-card p-5 shadow-sm">
        <h3 className="mb-4 text-[14px] font-semibold text-police-navy">Backup / Nakala</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">Auto-Backup Schedule</p>
              <p className="text-[11px] text-police-faint">Frequency of automatic backups</p>
            </div>
            <span className="rounded-lg bg-police-muted px-3 py-1.5 text-[12px] font-medium text-police">Daily at 02:00 EAT</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">Backup Retention</p>
              <p className="text-[11px] text-police-faint">How long to keep backups</p>
            </div>
            <span className="rounded-lg bg-police-muted px-3 py-1.5 text-[12px] font-medium text-police">30 days</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">Last Backup</p>
              <p className="text-[11px] text-police-faint">Most recent backup details</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#10B981] ">
              <CheckCircle2 size={14} />
              2024-12-15 02:08 (4.2 GB)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">Backup Storage</p>
              <p className="text-[11px] text-police-faint">Remote backup location</p>
            </div>
            <span className="rounded-lg bg-police-muted px-3 py-1.5 text-[12px] font-medium text-police">AWS S3 (us-east-1)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Screen Router                                                     */
/* ================================================================== */
function renderSystemScreen(screen: SystemScreen) {
  switch (screen) {
    case "dashboard":
      return <SystemDashboard />;
    case "users":
      return <SystemUsers />;
    case "system-health":
      return <SystemHealth />;
    case "user-management":
      return <SystemUserManagement />;
    case "integrations":
      return <SystemIntegrations />;
    case "notifications":
      return <SystemNotifications />;
    case "settings":
      return <SystemSettings />;
    default:
      return <SystemDashboard />;
  }
}

/* ================================================================== */
/*  SystemShell                                                       */
/* ================================================================== */
export function SystemShell() {
  const [systemScreen, setSystemScreen] = useState<SystemScreen>("dashboard");
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
              <p className="text-[10px] text-white/60">System Admin / Msimamizi wa Mfumo</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="ml-auto text-white/60 lg:hidden">
              <X size={20} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {SYSTEM_NAV.map((item) => {
              const active = systemScreen === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSystemScreen(item.id);
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

          {/* User */}
          <div className="border-t border-white/10 p-3">
            <div className="flex items-center gap-3 rounded-lg bg-white/5 p-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2196F3] text-[12px] font-bold text-white">
                {SYSTEM_USER.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-bold text-white">{SYSTEM_USER.shortName}</p>
                <p className="truncate text-[10px] text-white/50">{SYSTEM_USER.rank}</p>
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
              placeholder="Tafuta watumiaji, huduma, matukio..."
              className="h-9 flex-1 bg-transparent text-[13px] text-police placeholder:text-police-faint focus:outline-none"
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
                4
              </span>
            </button>

            {/* User chip */}
            <div className="flex items-center gap-2 rounded-lg bg-police-muted px-2.5 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2196F3] text-[11px] font-bold text-white">
                {SYSTEM_USER.initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-[12px] font-bold leading-tight text-police">{SYSTEM_USER.shortName}</p>
                <p className="text-[10px] leading-tight text-police-faint">{SYSTEM_USER.rank}</p>
              </div>
              <ChevronDown size={14} className="text-police-faint" />
            </div>
          </div>
        </header>

        {/* Screen content */}
        <main key={systemScreen} className="police-screen-enter flex-1 overflow-y-auto p-4 lg:p-6">
          {renderSystemScreen(systemScreen)}
        </main>
      </div>
    </div>
  );
}