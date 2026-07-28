"use client";

import { useState } from "react";
import { Search, AlertTriangle, X, Plus } from "lucide-react";
import { useApiData } from "@/hooks/use-api-data";

type Incident = {
  id: string; incident_number: string; type: string; location: string;
  status: string; priority: string; description: string | null;
  citizen_name: string | null; created_at: string;
};

const STATUS_STYLES: Record<string,string> = {
  active:        "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30",
  urgent:        "bg-[#DC2626]/15 text-[#DC2626] border border-[#DC2626]/30",
  investigating: "bg-[#FF9800]/15 text-[#FF9800] border border-[#FF9800]/30",
  resolved:      "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30",
};
const STATUS_LABEL: Record<string,string> = {
  active:"Inayoendelea", urgent:"Ya Haraka", investigating:"Inachunguzwa", resolved:"Imetatuliwa",
};
const STATUS_FILTERS = [
  { id:"all", label:"Yote" }, { id:"urgent", label:"Ya Haraka" },
  { id:"active", label:"Hai" }, { id:"investigating", label:"Inachunguzwa" },
  { id:"resolved", label:"Imetatuliwa" },
] as const;

export function AdminIncidents() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Incident | null>(null);

  const { data: incidents, loading, error, refetch } = useApiData<Incident>(
    "/api/incidents",
    { ...(statusFilter !== "all" ? { status: statusFilter } : {}), ...(query ? { search: query } : {}) },
    [query, statusFilter]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[22px] font-black text-police">Matukio</h1>
          <p className="text-[12px] text-police-muted">{incidents.length} matukio</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label:"Yote",          value: incidents.length,                                   color:"#2196F3" },
          { label:"Ya Haraka",     value: incidents.filter(i=>i.status==="urgent").length,    color:"#EF4444" },
          { label:"Yanayoendelea", value: incidents.filter(i=>i.status==="active").length,    color:"#FF9800" },
          { label:"Yametatuliwa",  value: incidents.filter(i=>i.status==="resolved").length,  color:"#10B981" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-police-card p-4 shadow-sm">
            <p className="text-[22px] font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="mt-1 text-[11px] text-police-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-police-card p-3 shadow-sm">
        <div className="flex flex-1 items-center gap-2 rounded-lg bg-police-input px-3 py-2">
          <Search size={14} className="shrink-0 text-police-faint" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tafuta aina, eneo..."
            className="flex-1 bg-transparent text-[13px] text-police placeholder-police-faint focus:outline-none" />
          {query && <button onClick={() => setQuery("")} className="text-police-faint"><X size={14} /></button>}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button key={f.id} onClick={() => setStatusFilter(f.id)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition ${statusFilter===f.id ? "bg-[#2196F3] text-white" : "bg-police-input text-police-muted hover:text-police"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-police-card shadow-sm">
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#2196F3] border-t-transparent" />
            <span className="text-[13px] text-police-muted">Inapakia matukio...</span>
          </div>
        )}
        {!loading && error && (
          <div className="flex flex-col items-center py-12 text-center">
            <AlertTriangle size={32} className="text-[#EF4444]" />
            <p className="mt-2 text-[13px] font-semibold text-[#EF4444]">{error}</p>
            <button onClick={refetch} className="mt-3 rounded-xl bg-[#2196F3] px-4 py-2 text-[12px] text-white">Jaribu Tena</button>
          </div>
        )}
        {!loading && !error && incidents.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center px-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EF4444]/10">
              <AlertTriangle size={32} className="text-[#EF4444] opacity-60" />
            </div>
            <p className="mt-4 text-[15px] font-bold text-police">Hakuna Matukio Bado</p>
            <p className="mt-1 text-[12px] text-police-muted">Matukio yatakayoripotiwa na maofisa yatajitokeza hapa.</p>
          </div>
        )}
        {!loading && !error && incidents.length > 0 && (
          <div className="divide-y divide-police-soft">
            {incidents.map((inc) => (
              <div key={inc.id} onClick={() => setSelected(inc)}
                className="flex cursor-pointer items-start gap-3 p-4 hover:bg-police-muted/20 transition">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EF4444]/12">
                  <AlertTriangle size={16} className="text-[#EF4444]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[13px] font-bold text-police">{inc.type}</p>
                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[inc.status] ?? ""}`}>
                      {STATUS_LABEL[inc.status] ?? inc.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-police-muted">{inc.location} • {new Date(inc.created_at).toLocaleDateString("sw-TZ")}</p>
                  {inc.citizen_name && <p className="text-[11px] text-police-muted mt-0.5">Raia: {inc.citizen_name}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={() => setSelected(null)}>
          <div className="relative w-full max-w-md rounded-2xl bg-police-card p-5 shadow-2xl" onClick={(e)=>e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute right-4 top-4 text-police-muted"><X size={18} /></button>
            <h2 className="text-[16px] font-bold text-police mb-4">{selected.type}</h2>
            <div className="space-y-2.5 text-[13px]">
              {[
                { l:"Namba",  v: selected.incident_number },
                { l:"Eneo",   v: selected.location },
                { l:"Hali",   v: STATUS_LABEL[selected.status] ?? selected.status },
                { l:"Kipaumbele", v: selected.priority },
                { l:"Raia",   v: selected.citizen_name ?? "—" },
                { l:"Maelezo",v: selected.description ?? "—" },
                { l:"Tarehe", v: new Date(selected.created_at).toLocaleDateString("sw-TZ") },
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
