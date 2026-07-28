// @ts-nocheck
"use client";
// Admin Activity Log — All system activities with timestamps

import { useState } from "react";
import { Activity, Search, X, RefreshCw, Filter, Download, Shield, Users, Database, LogIn, Edit, Trash2, Plus } from "lucide-react";
import { useApiData } from "@/hooks/use-api-data";

const ACTION_ICONS: Record<string, any> = {
  login: LogIn, logout: LogIn, create: Plus, update: Edit,
  delete: Trash2, view: Shield, default: Activity,
};
const ACTION_COLORS: Record<string, string> = {
  login:    "#10B981", logout:   "#6B7280",
  create:   "#2196F3", update:   "#FF9800",
  delete:   "#EF4444", error:    "#EF4444",
};

function getColor(action: string) {
  for (const [key, color] of Object.entries(ACTION_COLORS)) {
    if (action.includes(key)) return color;
  }
  return "#8B5CF6";
}

export function AdminActivityLog() {
  const [search, setSearch]     = useState("");
  const [userType, setUserType] = useState("all");
  const [from, setFrom]         = useState("");
  const [to, setTo]             = useState("");
  const [applied, setApplied]   = useState({ search: "", userType: "all", from: "", to: "" });

  const params: Record<string, string> = { limit: "300" };
  if (applied.search)   params.action   = applied.search;
  if (applied.userType !== "all") params.userType = applied.userType;
  if (applied.from)     params.from     = applied.from;
  if (applied.to)       params.to       = applied.to;

  const qs = new URLSearchParams(params).toString();
  const { data, loading, refetch } = useApiData<any>(`/api/activity-logs?${qs}`, undefined, [qs], { refreshMs: 15000 });

  const applyFilters = () => setApplied({ search, userType, from, to });

  const exportCSV = () => {
    const headers = ["Tarehe", "Wakati", "Mtumiaji", "Aina", "Kitendo", "Rasilimali", "Maelezo", "Hali"];
    const rows = data.map((r: any) => {
      const d = new Date(r.created_at);
      return [d.toLocaleDateString("sw-TZ"), d.toLocaleTimeString("sw-TZ"),
        r.user_name||"—", r.user_type||"—", r.action||"—",
        r.resource||"—", r.description||"—", r.success!==false?"✓":"✗"];
    });
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    a.download = `activity_log_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const USER_TYPE_COLORS: Record<string, string> = {
    officer: "#2196F3", citizen: "#10B981", admin: "#8B5CF6", system: "#6B7280",
  };

  return (
    <div className="space-y-5 p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-black text-police">Kumbukumbu ya Shughuli</h1>
          <p className="text-[13px] text-police-muted">Shughuli zote za mfumo — login, mabadiliko, na udhibiti</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 rounded-xl bg-police-soft px-3 py-2 text-[12px] font-semibold text-police">
            <Download size={14}/> CSV
          </button>
          <button onClick={() => refetch()} className="rounded-xl bg-police-soft p-2 text-police-muted"><RefreshCw size={15}/></button>
        </div>
      </div>

      {/* Summary badges */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {["officer","citizen","admin","system"].map(t => {
          const count = data.filter((d: any) => d.user_type === t).length;
          return (
            <div key={t} className="rounded-xl bg-police-card p-3 shadow-sm text-center">
              <p className="text-[20px] font-black" style={{color: USER_TYPE_COLORS[t]}}>{count}</p>
              <p className="text-[10px] capitalize text-police-muted">{t}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-police-card p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-[13px] font-bold text-police">
          <Filter size={15}/> Vichujio
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-center gap-2 rounded-xl border border-police bg-police px-3 col-span-2 sm:col-span-1">
            <Search size={13} className="text-police-faint"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tafuta kitendo..."
              className="h-9 flex-1 bg-transparent text-[12px] text-police focus:outline-none"/>
          </div>
          <select value={userType} onChange={e => setUserType(e.target.value)}
            className="rounded-xl border border-police bg-police px-3 h-9 text-[12px] text-police focus:outline-none">
            <option value="all">Aina Zote</option>
            <option value="officer">Maafisa</option>
            <option value="citizen">Raia</option>
            <option value="admin">Wasimamizi</option>
          </select>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="rounded-xl border border-police bg-police px-3 h-9 text-[12px] text-police focus:outline-none"/>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="rounded-xl border border-police bg-police px-3 h-9 text-[12px] text-police focus:outline-none"/>
        </div>
        <button onClick={applyFilters}
          className="rounded-xl bg-[#1E3A8A] px-4 py-2 text-[12px] font-bold text-white">
          Tafuta
        </button>
      </div>

      {/* Log entries */}
      <div className="rounded-2xl bg-police-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="border-b border-police-soft bg-police-muted/30">
              <tr>
                {["Wakati","Mtumiaji","Aina","Kitendo","Rasilimali","Maelezo","Hali"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-police-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-police-soft">
              {loading ? Array(8).fill(0).map((_,i) => (
                <tr key={i}>{Array(7).fill(0).map((_,j) => <td key={j} className="px-4 py-3"><div className="h-3 w-20 animate-pulse rounded bg-police-soft"/></td>)}</tr>
              )) : data.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-[13px] text-police-muted">Hakuna kumbukumbu bado</td></tr>
              ) : data.map((log: any, i: number) => {
                const color = getColor(log.action || "");
                const d = new Date(log.created_at);
                const success = log.success !== false;
                return (
                  <tr key={log.id || i} className={`hover:bg-police-muted/10 transition ${!success ? "bg-[#EF4444]/3" : ""}`}>
                    <td className="px-4 py-3 text-police-faint whitespace-nowrap">
                      <p className="font-mono text-[10px]">{d.toLocaleDateString("sw-TZ")}</p>
                      <p className="font-mono text-[10px]">{d.toLocaleTimeString("sw-TZ")}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-police">{log.user_name || "Mfumo"}</p>
                      <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white"
                        style={{backgroundColor: USER_TYPE_COLORS[log.user_type] || "#6B7280"}}>
                        {log.user_type || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-police-muted text-[11px]">{log.user_role || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white" style={{backgroundColor: color}}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-police-muted">{log.resource || "—"}</td>
                    <td className="px-4 py-3 text-police max-w-[200px] truncate">{log.description || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${success ? "bg-[#10B981]/15 text-[#10B981]" : "bg-[#EF4444]/15 text-[#EF4444]"}`}>
                        {success ? "✓" : "✗ Kosa"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {data.length > 0 && (
          <div className="border-t border-police-soft px-4 py-2 text-[11px] text-police-faint">
            {data.length} matukio · auto-refresh 15s
          </div>
        )}
      </div>
    </div>
  );
}
