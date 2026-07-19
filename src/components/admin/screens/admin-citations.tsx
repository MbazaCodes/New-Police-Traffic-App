"use client";

import { useState } from "react";
import { Search, FileText, X, AlertTriangle, CheckCircle2, Clock, ChevronRight, Plus } from "lucide-react";
import { useApiData } from "@/hooks/use-api-data";

type Citation = {
  id: string; citation_number: string; plate: string; offense: string;
  status: string; fine_amount: number | null; location: string | null;
  driver_name: string | null; driver_phone: string | null;
  created_at: string;
};

const STATUS_STYLES: Record<string, string> = {
  unpaid: "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30",
  paid:   "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30",
};
const STATUS_LABEL: Record<string, string> = { unpaid:"Hajalipwa", paid:"Imelipwa" };
const STATUS_FILTERS = [
  { id:"all", label:"Zote" }, { id:"unpaid", label:"Hazijalipwa" }, { id:"paid", label:"Zimelipwa" },
] as const;

export function AdminCitations() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Citation | null>(null);

  const { data: citations, loading, error, refetch } = useApiData<Citation>(
    "/api/citations",
    { ...(statusFilter !== "all" ? { status: statusFilter } : {}), ...(query ? { search: query } : {}) },
    [query, statusFilter]
  );

  const paid   = citations.filter((c) => c.status === "paid").length;
  const unpaid = citations.filter((c) => c.status === "unpaid").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[22px] font-black text-police">Citations</h1>
          <p className="text-[12px] text-police-muted">{citations.length} jumla • {paid} zimelipwa • {unpaid} hazijalipwa</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label:"Jumla",        value: citations.length, color:"#2196F3" },
          { label:"Zimelipwa",   value: paid,              color:"#10B981" },
          { label:"Hazijalipwa", value: unpaid,            color:"#EF4444" },
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
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tafuta plate, kosa, au namba..."
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
            <span className="text-[13px] text-police-muted">Inapakia citations...</span>
          </div>
        )}
        {!loading && error && (
          <div className="flex flex-col items-center py-12 text-center">
            <AlertTriangle size={32} className="text-[#EF4444]" />
            <p className="mt-2 text-[13px] font-semibold text-[#EF4444]">{error}</p>
            <button onClick={refetch} className="mt-3 rounded-xl bg-[#2196F3] px-4 py-2 text-[12px] text-white">Jaribu Tena</button>
          </div>
        )}
        {!loading && !error && citations.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center px-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2196F3]/10">
              <FileText size={32} className="text-[#2196F3] opacity-60" />
            </div>
            <p className="mt-4 text-[15px] font-bold text-police">Hakuna Citations Bado</p>
            <p className="mt-1 text-[12px] text-police-muted">Maofisa wa trafiki watakapoandika faini, zitaonekana hapa.</p>
          </div>
        )}
        {!loading && !error && citations.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-[12px]">
              <thead>
                <tr className="border-b border-police-soft bg-police-muted/30 text-[10px] uppercase text-police-faint">
                  <th className="px-4 py-3 font-semibold">Namba</th>
                  <th className="px-4 py-3 font-semibold">Plate</th>
                  <th className="px-4 py-3 font-semibold">Kosa</th>
                  <th className="px-4 py-3 font-semibold hidden sm:table-cell">Dereva</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">Faini</th>
                  <th className="px-4 py-3 font-semibold">Hali</th>
                  <th className="px-4 py-3 font-semibold hidden lg:table-cell">Tarehe</th>
                </tr>
              </thead>
              <tbody>
                {citations.map((c) => (
                  <tr key={c.id} onClick={() => setSelected(c)}
                    className="cursor-pointer border-b border-police-soft hover:bg-police-muted/30 last:border-0 transition">
                    <td className="px-4 py-3 font-mono text-[11px] text-police-muted">{c.citation_number}</td>
                    <td className="px-4 py-3 font-bold text-police">{c.plate}</td>
                    <td className="px-4 py-3 text-police-muted">{c.offense}</td>
                    <td className="px-4 py-3 text-police-muted hidden sm:table-cell">{c.driver_name ?? "—"}</td>
                    <td className="px-4 py-3 font-semibold text-[#1E3A8A] hidden md:table-cell">
                      {c.fine_amount ? `TZS ${c.fine_amount.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[c.status] ?? ""}`}>
                        {STATUS_LABEL[c.status] ?? c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-police-muted hidden lg:table-cell">
                      {new Date(c.created_at).toLocaleDateString("sw-TZ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={() => setSelected(null)}>
          <div className="relative w-full max-w-md rounded-2xl bg-police-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute right-4 top-4 text-police-muted"><X size={18} /></button>
            <h2 className="text-[16px] font-bold text-police mb-4">Maelezo ya Citation</h2>
            <div className="space-y-2.5 text-[13px]">
              {[
                { l:"Namba", v: selected.citation_number },
                { l:"Plate", v: selected.plate },
                { l:"Kosa",  v: selected.offense },
                { l:"Dereva", v: selected.driver_name ?? "—" },
                { l:"Simu",  v: selected.driver_phone ?? "—" },
                { l:"Eneo",  v: selected.location ?? "—" },
                { l:"Faini", v: selected.fine_amount ? `TZS ${selected.fine_amount.toLocaleString()}` : "—" },
                { l:"Hali",  v: STATUS_LABEL[selected.status] ?? selected.status },
                { l:"Tarehe",v: new Date(selected.created_at).toLocaleDateString("sw-TZ") },
              ].map(({l, v}) => (
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
