"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users, FileText, AlertTriangle, Shield, Database,
  Activity, Building2, UserCheck, Car, RefreshCw,
  ShieldCheck, Settings, Key, Bell, Clock, CheckCircle2,
  XCircle, Home, Smartphone, Package, TrendingUp, Server,
} from "lucide-react";
import { authFetch } from "@/lib/client-auth";
import { usePoliceStore } from "@/store/police-store";

interface SysStats {
  // Users
  total_users: number;
  active_users: number;
  pending_users: number;
  admins: number;
  commanders: number;
  officers: number;
  clerks: number;
  cid: number;
  // Operations data
  citizens: number;
  citizen_accounts: number;
  pending_approvals: number;
  vehicles: number;
  properties: number;
  devices: number;
  stations: number;
  posts: number;
  // Activity
  citations: number;
  incidents: number;
  arrests: number;
  patrols: number;
  missing: number;
}

const EMPTY: SysStats = {
  total_users:0, active_users:0, pending_users:0, admins:0,
  commanders:0, officers:0, clerks:0, cid:0,
  citizens:0, citizen_accounts:0, pending_approvals:0,
  vehicles:0, properties:0, devices:0, stations:0, posts:0,
  citations:0, incidents:0, arrests:0, patrols:0, missing:0,
};

const StatCard = ({ label, value, color, icon: Icon, sub, onClick, loading }: any) => (
  <div onClick={onClick}
    className={`rounded-2xl bg-white border border-gray-100 shadow-sm p-4 ${onClick ? "cursor-pointer hover:shadow-md hover:border-blue-200 transition" : ""}`}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: color + "18" }}>
        <Icon size={18} style={{ color }} />
      </div>
      <span className="text-[26px] font-black" style={{ color }}>
        {loading ? "—" : (value ?? 0).toLocaleString()}
      </span>
    </div>
    <p className="text-[12px] font-semibold text-gray-700">{label}</p>
    {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

export function AdminDashboard() {
  const { setAdminScreen } = usePoliceStore();
  const [stats, setStats]   = useState<SysStats>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, stationsRes, dbRes] = await Promise.all([
        authFetch("/api/users?limit=500"),
        authFetch("/api/stations?limit=200"),
        authFetch("/api/admin/database?tab=citizens&limit=1000"),
      ]);

      const users    = usersRes.data?.data    ?? [];
      const stations = stationsRes.data?.data ?? [];
      const citizens = dbRes.data?.data       ?? [];

      setRecentUsers(users.slice(0, 8));

      setStats({
        total_users:       users.length,
        active_users:      users.filter((u: any) => u.status === "active").length,
        pending_users:     users.filter((u: any) => !u.status || u.status === "pending").length,
        admins:            users.filter((u: any) => ["admin","super-admin"].includes(u.role)).length,
        commanders:        users.filter((u: any) => String(u.role ?? "").includes("commissioner")).length,
        officers:          users.filter((u: any) => String(u.role ?? "").includes("officer")).length,
        clerks:            users.filter((u: any) => String(u.role ?? "").includes("clerk")).length,
        cid:               users.filter((u: any) => ["investigator","cid-officer","cyber-crime","investigation-supervisor"].includes(u.role)).length,
        citizens:          citizens.length,
        citizen_accounts:  citizens.filter((c: any) => c.portal_status === "registered" || c.source === "portal").length,
        pending_approvals: citizens.filter((c: any) => c.portal_status === "pending" || (!c.approved && c.source === "portal")).length,
        vehicles:          0,
        properties:        0,
        devices:           0,
        stations:          stations.length,
        posts:             0,
        citations:         0,
        incidents:         0,
        arrests:           0,
        patrols:           0,
        missing:           0,
      });
      setLastSync(new Date());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const roleColor: Record<string,string> = {
    "national-commissioner":  "#1E3A8A",
    "regional-commissioner":  "#2196F3",
    "district-commissioner":  "#0284C7",
    "station-commissioner":   "#0891B2",
    "officer-traffic":        "#10B981",
    "officer-general":        "#059669",
    "post-officer":           "#047857",
    "investigator":           "#8B5CF6",
    "cid-officer":            "#7C3AED",
    "cyber-crime":            "#6D28D9",
    "national-clerk":         "#F59E0B",
    "regional-clerk":         "#D97706",
    "district-clerk":         "#B45309",
    "clerk":                  "#92400E",
    "admin":                  "#EF4444",
    "super-admin":            "#DC2626",
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-black text-gray-900">Dashibodi ya Mfumo</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">
            Usimamizi wa Mfumo — Imesasishwa {lastSync.toLocaleTimeString("sw-TZ")}
          </p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-3 py-2 text-[12px] font-semibold text-gray-600 shadow-sm hover:shadow transition">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Sasisha
        </button>
      </div>

      {/* ── SECTION 1: User Management ── */}
      <div>
        <h2 className="text-[13px] font-black text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Key size={14} /> Usimamizi wa Watumiaji
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Watumiaji Wote"    value={stats.total_users}    color="#1E3A8A" icon={Users}      loading={loading} onClick={() => setAdminScreen("users")} />
          <StatCard label="Wanaotumia Sasa"   value={stats.active_users}   color="#10B981" icon={UserCheck}  loading={loading} sub="Akaunti hai" />
          <StatCard label="Wanaosubiri"       value={stats.pending_users}  color="#F59E0B" icon={Clock}      loading={loading} sub="Hawajaidhinishwa" />
          <StatCard label="Maombi ya Raia"    value={stats.pending_approvals} color="#EF4444" icon={Bell}   loading={loading} onClick={() => setAdminScreen("citizens")} sub="Hayajaidhinishwa" />
        </div>
      </div>

      {/* ── SECTION 2: Roles breakdown ── */}
      <div>
        <h2 className="text-[13px] font-black text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Shield size={14} /> Watumiaji kwa Nafasi
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Kamandi"     value={stats.commanders} color="#1E3A8A" icon={Shield}    loading={loading} />
          <StatCard label="Maafisa"     value={stats.officers}   color="#10B981" icon={UserCheck}  loading={loading} />
          <StatCard label="CID"         value={stats.cid}        color="#8B5CF6" icon={Activity}   loading={loading} />
          <StatCard label="Makarani"    value={stats.clerks}     color="#F59E0B" icon={FileText}   loading={loading} />
        </div>
      </div>

      {/* ── SECTION 3: Database stats ── */}
      <div>
        <h2 className="text-[13px] font-black text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Database size={14} /> Hali ya Database
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Vituo"         value={stats.stations}         color="#2196F3" icon={Building2}  loading={loading} onClick={() => setAdminScreen("stations")} />
          <StatCard label="Raia"          value={stats.citizens}         color="#059669" icon={Users}      loading={loading} onClick={() => setAdminScreen("citizens")} />
          <StatCard label="Magari"        value={stats.vehicles}         color="#FF9800" icon={Car}        loading={loading} onClick={() => setAdminScreen("database")} />
          <StatCard label="Akaunti Raia"  value={stats.citizen_accounts} color="#8B5CF6" icon={Smartphone} loading={loading} />
        </div>
      </div>

      {/* ── SECTION 4: Recent users + System quick actions ── */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Recent users */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14px] font-black text-gray-900 flex items-center gap-2">
              <Users size={14} className="text-blue-500"/> Watumiaji wa Mfumo
            </h3>
            <button onClick={() => setAdminScreen("users")}
              className="text-[11px] text-blue-500 font-medium hover:underline">Simamia →</button>
          </div>
          <div className="space-y-2">
            {recentUsers.map((u: any) => (
              <div key={u.id} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-black text-white"
                  style={{ background: roleColor[u.role] ?? "#6B7280" }}>
                  {u.name?.[0] ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-gray-900 truncate">{u.name}</p>
                  <p className="text-[10px] text-gray-400">{u.role} · {u.badge_no}</p>
                </div>
                <span className={`rounded-lg px-2 py-0.5 text-[9px] font-bold ${
                  u.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>{u.status}</span>
              </div>
            ))}
            {recentUsers.length === 0 && !loading && (
              <p className="text-center text-[12px] text-gray-400 py-4">Hakuna watumiaji bado</p>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
          <h3 className="text-[14px] font-black text-gray-900 mb-3 flex items-center gap-2">
            <Settings size={14} className="text-gray-500"/> Vitendo vya Haraka
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label:"Ongeza Mtumiaji",    icon:Users,      screen:"users",    color:"#1E3A8A" },
              { label:"Simamia Vituo",       icon:Building2,  screen:"stations", color:"#2196F3" },
              { label:"Angalia Database",    icon:Database,   screen:"database", color:"#10B981" },
              { label:"Raia & Akaunti",      icon:UserCheck,  screen:"citizens", color:"#8B5CF6" },
              { label:"Maafisa",             icon:Shield,     screen:"officers", color:"#059669" },
              { label:"Mipangilio",          icon:Settings,   screen:"settings", color:"#F59E0B" },
              { label:"Idhini",              icon:CheckCircle2,screen:"approvals",color:"#EF4444" },
              { label:"Ripoti",              icon:FileText,   screen:"reports",  color:"#FF9800" },
            ].map(a => (
              <button key={a.label}
                onClick={() => setAdminScreen(a.screen as any)}
                className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 hover:bg-white hover:shadow-sm hover:border-gray-200 transition">
                <a.icon size={15} style={{ color: a.color }} />
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 5: System info ── */}
      <div className="rounded-2xl bg-[#0f1b35] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Server size={14} className="text-white/50" />
          <h3 className="text-[12px] font-bold text-white/50 uppercase tracking-wider">Taarifa za Mfumo</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Jukwaa",    value: "Next.js 16"         },
            { label: "Database",  value: "PostgreSQL / Supabase" },
            { label: "Seva",      value: "Ubuntu 22 VPS"      },
            { label: "Toleo",     value: "v1.0.0 — 2026"      },
          ].map(s => (
            <div key={s.label} className="rounded-xl bg-white/5 p-3">
              <p className="text-[10px] text-white/30 uppercase tracking-wider">{s.label}</p>
              <p className="text-[12px] font-bold text-white mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
