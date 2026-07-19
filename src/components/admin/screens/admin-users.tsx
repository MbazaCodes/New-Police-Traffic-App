"use client";

import { useState } from "react";
import { Search, X, Users, Plus, Shield, AlertTriangle, ChevronRight, Mail, Phone } from "lucide-react";
import { useApiData } from "@/hooks/use-api-data";
import { toast } from "@/hooks/use-toast";

type UserRecord = {
  id: string; name: string; short_name: string | null; rank: string | null;
  role: string; status: string; badge_no: string | null; username: string | null;
  email: string | null; phone: string | null; region: string | null; unit: string | null;
  station?: { id: string; name: string } | null;
  created_at: string;
};

const ROLE_STYLES: Record<string,string> = {
  admin:              "bg-[#1E3A8A]/15 text-[#1E3A8A] border border-[#1E3A8A]/30",
  "officer-traffic":  "bg-[#2196F3]/15 text-[#2196F3] border border-[#2196F3]/30",
  "officer-general":  "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30",
  commander:          "bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30",
};
const ROLE_LABEL: Record<string,string> = {
  admin:"Msimamizi", "officer-traffic":"Afisa Trafiki",
  "officer-general":"Afisa Kawaida", commander:"Kamanda",
};
const STATUS_STYLES: Record<string,string> = {
  active:    "bg-[#10B981]/15 text-[#10B981]",
  suspended: "bg-[#EF4444]/15 text-[#EF4444]",
  "off-duty":"bg-gray-400/15 text-gray-400",
};

export function AdminUsers() {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selected, setSelected] = useState<UserRecord | null>(null);

  const { data: users, loading, error, refetch } = useApiData<UserRecord>(
    "/api/users",
    { ...(roleFilter !== "all" ? { role: roleFilter } : {}), ...(query ? { search: query } : {}) },
    [query, roleFilter]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[22px] font-black text-police">Watumiaji</h1>
          <p className="text-[12px] text-police-muted">{users.length} watumiaji wote</p>
        </div>
        <button
          onClick={() => toast({ title:"Ongeza Mtumiaji", description:"Tumia /api/users POST kuongeza mtumiaji mpya" })}
          className="flex items-center gap-2 rounded-xl bg-[#1E3A8A] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm hover:bg-[#1a3278] active:scale-95 transition"
        >
          <Plus size={16} /> Ongeza Mtumiaji
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label:"Wote",          value: users.length,                                           color:"#2196F3" },
          { label:"Wasimamizi",    value: users.filter(u=>u.role==="admin").length,               color:"#1E3A8A" },
          { label:"Maofisa",       value: users.filter(u=>u.role?.startsWith("officer")).length,  color:"#10B981" },
          { label:"Wamesimamishwa",value: users.filter(u=>u.status==="suspended").length,         color:"#EF4444" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-police-card p-4 shadow-sm">
            <p className="text-[22px] font-black leading-none" style={{ color: s.color }}>{s.value}</p>
            <p className="mt-1 text-[11px] text-police-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-police-card p-3 shadow-sm">
        <div className="flex flex-1 items-center gap-2 rounded-lg bg-police-input px-3 py-2">
          <Search size={14} className="shrink-0 text-police-faint" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Tafuta jina, badge, email..."
            className="flex-1 bg-transparent text-[13px] text-police placeholder-police-faint focus:outline-none" />
          {query && <button onClick={() => setQuery("")}><X size={14} className="text-police-faint" /></button>}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {[
            { id:"all", label:"Wote" }, { id:"admin", label:"Wasimamizi" },
            { id:"officer-traffic", label:"Trafiki" }, { id:"officer-general", label:"Kawaida" },
            { id:"commander", label:"Makamanda" },
          ].map((f) => (
            <button key={f.id} onClick={() => setRoleFilter(f.id)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition ${roleFilter===f.id ? "bg-[#1E3A8A] text-white" : "bg-police-input text-police-muted hover:text-police"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-police-card shadow-sm">
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#1E3A8A] border-t-transparent" />
            <span className="text-[13px] text-police-muted">Inapakia watumiaji...</span>
          </div>
        )}
        {!loading && error && (
          <div className="flex flex-col items-center py-12 text-center">
            <AlertTriangle size={32} className="text-[#EF4444]" />
            <p className="mt-2 text-[13px] font-semibold text-[#EF4444]">{error}</p>
            <button onClick={refetch} className="mt-3 rounded-xl bg-[#1E3A8A] px-4 py-2 text-[12px] text-white">Jaribu Tena</button>
          </div>
        )}
        {!loading && !error && users.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center px-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1E3A8A]/10">
              <Users size={32} className="text-[#1E3A8A] opacity-60" />
            </div>
            <p className="mt-4 text-[15px] font-bold text-police">Hakuna Watumiaji Bado</p>
            <p className="mt-1 text-[12px] text-police-muted max-w-xs">
              Mfumo unaanza upya. Bonyeza "Ongeza Mtumiaji" kuanza kuongeza wasimamizi na maofisa.
            </p>
          </div>
        )}
        {!loading && !error && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-[12px]">
              <thead>
                <tr className="border-b border-police-soft bg-police-muted/30 text-[10px] uppercase text-police-faint">
                  <th className="px-4 py-3 font-semibold">Jina</th>
                  <th className="px-4 py-3 font-semibold">Badge / Username</th>
                  <th className="px-4 py-3 font-semibold hidden sm:table-cell">Jukumu</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">Kituo</th>
                  <th className="px-4 py-3 font-semibold">Hali</th>
                  <th className="px-4 py-3 font-semibold hidden lg:table-cell">Email</th>
                  <th className="px-4 py-3 text-right font-semibold">Hatua</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} onClick={() => setSelected(u)}
                    className="cursor-pointer border-b border-police-soft hover:bg-police-muted/30 last:border-0 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1E3A8A]/15 text-[11px] font-bold text-[#1E3A8A]">
                          {u.name.split(" ").slice(0,2).map((n)=>n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-police">{u.name}</p>
                          <p className="text-[10px] text-police-faint">{u.rank ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-police-muted">
                      {u.badge_no ?? u.username ?? "—"}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${ROLE_STYLES[u.role] ?? "bg-gray-100 text-gray-600"}`}>
                        {ROLE_LABEL[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-police-muted hidden md:table-cell">{u.station?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[u.status] ?? ""}`}>
                        {u.status === "active" ? "Hai" : u.status === "suspended" ? "Amesimamishwa" : u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-police-muted hidden lg:table-cell text-[11px]">{u.email ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={(e)=>{e.stopPropagation();setSelected(u)}}
                        className="flex items-center gap-1 rounded-lg bg-[#1E3A8A]/10 px-2.5 py-1.5 text-[11px] font-semibold text-[#1E3A8A] hover:bg-[#1E3A8A]/20 transition ml-auto">
                        Angalia <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={() => setSelected(null)}>
          <div className="relative w-full max-w-md rounded-2xl bg-police-card p-5 shadow-2xl" onClick={(e)=>e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute right-4 top-4 text-police-muted"><X size={18} /></button>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1E3A8A]/15 text-[16px] font-bold text-[#1E3A8A]">
                {selected.name.split(" ").slice(0,2).map((n)=>n[0]).join("")}
              </div>
              <div>
                <p className="text-[16px] font-bold text-police">{selected.name}</p>
                <p className="text-[12px] text-police-muted">{selected.rank ?? "—"}</p>
              </div>
            </div>
            <div className="space-y-2.5 text-[13px]">
              {[
                { l:"Badge",    v: selected.badge_no ?? "—" },
                { l:"Username", v: selected.username ?? "—" },
                { l:"Jukumu",   v: ROLE_LABEL[selected.role] ?? selected.role },
                { l:"Kituo",    v: selected.station?.name ?? "—" },
                { l:"Mkoa",     v: selected.region ?? "—" },
                { l:"Kitengo",  v: selected.unit ?? "—" },
                { l:"Email",    v: selected.email ?? "—" },
                { l:"Simu",     v: selected.phone ?? "—" },
                { l:"Hali",     v: selected.status === "active" ? "Hai" : "Amesimamishwa" },
                { l:"Tarehe",   v: new Date(selected.created_at).toLocaleDateString("sw-TZ") },
              ].map(({l,v}) => (
                <div key={l} className="flex justify-between gap-4">
                  <span className="text-police-muted shrink-0">{l}</span>
                  <span className="text-police font-medium text-right">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
