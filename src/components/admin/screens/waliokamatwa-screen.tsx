"use client";
import { useState, useMemo } from "react";
import {
  Search, Download, Filter, Users, CheckCircle2,
  Clock, AlertTriangle, FileText, Eye, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import { DETAINED_CITIZENS } from "@/lib/police-data";
import { avatarUrl } from "@/lib/mock-engine";
import { ARREST_RECORDS } from "@/lib/police-data";

// ── Types ──────────────────────────────────────────────────────────────────
type ViewMode = "list" | "card";
type StatusFilter = "all" | "held" | "released" | "charged" | "investigating";

// ── Enrich DETAINED_CITIZENS with photos and extra fields ──────────────────
const RECORDS = DETAINED_CITIZENS.map((c) => ({
  ...c,
  photo: avatarUrl(c.fullName),
  arrestId: c.id,
  charges: c.reason,
  station: c.station,
  officerName: c.officer,
}));

// Monthly stats derived from records
const MONTHLY = [
  { month: "Jan", count: 12 }, { month: "Feb", count: 18 }, { month: "Mar", count: 14 },
  { month: "Apr", count: 22 }, { month: "Mei", count: RECORDS.length }, { month: "Jun", count: 0 },
];

const STATUS_COLOR: Record<string, string> = {
  held: "#EF4444", released: "#10B981", charged: "#1E3A8A", investigating: "#FF9800",
};
const STATUS_LABEL: Record<string, string> = {
  held: "Kizuizini", released: "Ameachiwa", charged: "Ameshtakiwa", investigating: "Uchunguzi",
};

export function WaliokamatwaScreen() {
  const [view, setView] = useState<ViewMode>("list");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<typeof RECORDS[0] | null>(null);
  const PER_PAGE = 8;

  const filtered = useMemo(() => {
    let r = RECORDS;
    if (statusFilter !== "all") r = r.filter((x) => x.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((x) =>
        x.fullName.toLowerCase().includes(q) ||
        x.charges.toLowerCase().includes(q) ||
        x.station.toLowerCase().includes(q) ||
        x.officerName.toLowerCase().includes(q) ||
        x.id.toLowerCase().includes(q)
      );
    }
    return r;
  }, [statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = [
    { label: "Jumla ya Makamato", value: RECORDS.length,                                           color: "#1E3A8A", icon: <Users size={20}/> },
    { label: "Kizuizini",         value: RECORDS.filter((r) => r.status === "held").length,        color: "#EF4444", icon: <AlertTriangle size={20}/> },
    { label: "Wameachiwa",        value: RECORDS.filter((r) => r.status === "released").length,    color: "#10B981", icon: <CheckCircle2 size={20}/> },
    { label: "Uchunguzi",         value: RECORDS.filter((r) => r.status === "investigating" || r.status === "charged").length, color: "#FF9800", icon: <Clock size={20}/> },
  ];

  function exportCsv() {
    const rows = [
      ["ID","Jina","Mashtaka","Kituo","Afisa","Tarehe","Hali"].join(","),
      ...filtered.map((r) => [r.id, r.fullName, r.charges, r.station, r.officerName, r.detainedDate, STATUS_LABEL[r.status]].map((v) => `"${v}"`).join(",")),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "waliokamatwa.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-police-navy">Waliokamatwa</h1>
          <p className="text-[13px] text-police-muted">{RECORDS.length} rekodi za makamato • {RECORDS.filter(r=>r.status==="held").length} kazizuizini</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView(view === "list" ? "card" : "list")} className="flex items-center gap-2 rounded-xl border border-police px-3 py-2 text-[12px] font-semibold text-police-muted">
            {view === "list" ? "Card View" : "List View"}
          </button>
          <button onClick={exportCsv} className="flex items-center gap-2 rounded-xl bg-[#1E3A8A] px-4 py-2 text-[13px] font-bold text-white">
            <Download size={14}/> Pakua CSV
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-police-card p-4 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor:`${s.color}15`, color:s.color }}>{s.icon}</div>
            <p className="mt-2 text-[26px] font-bold text-police">{s.value}</p>
            <p className="text-[11px] text-police-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Monthly bar chart */}
      <div className="rounded-2xl bg-police-card p-5 shadow-sm">
        <h2 className="mb-3 text-[14px] font-bold text-police">Takwimu za Kila Mwezi</h2>
        <div className="flex h-20 items-end gap-2">
          {MONTHLY.map((m) => {
            const max = Math.max(...MONTHLY.map((x)=>x.count), 1);
            const h = Math.round((m.count / max) * 100);
            return (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[9px] text-police-faint">{m.count || ""}</span>
                <div className="w-full rounded-t-md bg-[#2196F3]" style={{ height:`${Math.max(h,4)}%`, opacity: m.count === 0 ? 0.2 : 1 }}/>
                <span className="text-[9px] text-police-faint">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-police bg-police-card px-3 shadow-sm">
          <Search size={15} className="text-police-faint"/>
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tafuta kwa jina, mashtaka, kituo..." className="h-10 flex-1 bg-transparent text-[13px] text-police placeholder:text-police-faint focus:outline-none"/>
          {search && <button onClick={() => setSearch("")}><X size={13} className="text-police-faint"/></button>}
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all","held","released","charged","investigating"] as StatusFilter[]).map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`rounded-xl px-3 py-2 text-[12px] font-semibold transition ${statusFilter===s ? "text-white shadow" : "bg-police-card border border-police text-police-muted"}`}
              style={statusFilter===s ? { backgroundColor: s==="all" ? "#1E3A8A" : STATUS_COLOR[s] } : {}}>
              {s==="all" ? "Wote" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-[12px] text-police-faint">{filtered.length} rekodi zimepatikana • Ukurasa {page}/{totalPages}</p>

      {/* LIST VIEW */}
      {view === "list" && (
        <div className="rounded-2xl bg-police-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-[#1E3A8A] text-white">
                <tr>{["Picha","Jina","Arrest ID","Mashtaka","Afisa","Kituo","Tarehe","Hali",""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-police-soft">
                {paged.map((r) => (
                  <tr key={r.id} className="hover:bg-police-muted transition">
                    <td className="px-3 py-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.photo} alt={r.fullName} className="h-8 w-8 rounded-full object-cover"/>
                    </td>
                    <td className="px-4 py-2 font-bold text-police whitespace-nowrap">{r.fullName}</td>
                    <td className="px-4 py-2 font-mono text-[10px] text-police-faint">{r.id}</td>
                    <td className="px-4 py-2 text-police-muted max-w-[140px] truncate">{r.charges}</td>
                    <td className="px-4 py-2 text-police-muted whitespace-nowrap">{r.officerName}</td>
                    <td className="px-4 py-2 text-police-muted max-w-[130px] truncate">{r.station}</td>
                    <td className="px-4 py-2 text-police-faint whitespace-nowrap">{r.detainedDate}</td>
                    <td className="px-4 py-2">
                      <span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
                        style={{ backgroundColor: STATUS_COLOR[r.status] }}>
                        {STATUS_LABEL[r.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <button onClick={() => setSelected(r)} className="rounded-lg bg-[#2196F3]/10 px-2 py-1 text-[11px] font-semibold text-[#2196F3]">
                        <Eye size={12}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CARD VIEW */}
      {view === "card" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {paged.map((r) => (
            <div key={r.id} className="rounded-2xl bg-police-card p-4 shadow-sm">
              <div className="flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.photo} alt={r.fullName} className="h-12 w-12 shrink-0 rounded-xl object-cover"/>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-bold text-police leading-tight">{r.fullName}</p>
                    <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
                      style={{ backgroundColor: STATUS_COLOR[r.status] }}>
                      {STATUS_LABEL[r.status]}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-police-faint">{r.id}</p>
                  <p className="mt-0.5 text-[11px] text-police-muted line-clamp-1">{r.charges}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-police-faint">
                <span><span className="font-semibold text-police">Afisa:</span> {r.officerName}</span>
                <span><span className="font-semibold text-police">Kituo:</span> {r.station}</span>
                <span><span className="font-semibold text-police">Tarehe:</span> {r.detainedDate}</span>
                <span><span className="font-semibold text-police">Chumba:</span> {r.cell}</span>
              </div>
              <button onClick={() => setSelected(r)}
                className="mt-3 w-full rounded-xl border border-[#2196F3]/30 bg-[#2196F3]/8 py-1.5 text-[12px] font-semibold text-[#2196F3]">
                Angalia Maelezo
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
            className="rounded-xl border border-police p-2 disabled:opacity-40"><ChevronLeft size={16}/></button>
          {Array.from({length: totalPages}, (_,i) => i+1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`h-8 w-8 rounded-xl text-[12px] font-semibold ${page===p?"bg-[#1E3A8A] text-white":"border border-police text-police-muted"}`}>{p}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
            className="rounded-xl border border-police p-2 disabled:opacity-40"><ChevronRight size={16}/></button>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)}/>
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-police-card shadow-2xl">
            <div className="flex items-center justify-between bg-[#1E3A8A] px-5 py-4">
              <h3 className="text-[16px] font-bold text-white">Maelezo ya Mkamativo</h3>
              <button onClick={() => setSelected(null)} className="rounded-lg p-1 text-white/70 hover:text-white"><X size={18}/></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selected.photo} alt={selected.fullName} className="h-16 w-16 rounded-xl object-cover"/>
                <div>
                  <p className="text-[17px] font-bold text-police">{selected.fullName}</p>
                  <p className="text-[12px] text-police-muted">{selected.id}</p>
                  <span className="mt-1 inline-block rounded-full px-3 py-0.5 text-[10px] font-bold text-white"
                    style={{ backgroundColor: STATUS_COLOR[selected.status] }}>
                    {STATUS_LABEL[selected.status]}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Mashtaka", selected.charges],
                  ["Afisa Aliyekamata", selected.officerName],
                  ["Kituo", selected.station],
                  ["Tarehe ya Kamato", selected.detainedDate],
                  ["Wakati", selected.detainedTime],
                  ["Chumba", selected.cell],
                  ["Hali ya Kiafya", selected.medicalStatus],
                  ["Tarehe ya Mahakama", selected.courtDate],
                  ["Ndugu", selected.nextOfKin],
                  ["Mwanasheria", selected.lawyer],
                  ["NIDA", selected.nida],
                  ["Simu", selected.phone],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-police-muted p-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-police-faint">{label}</p>
                    <p className="mt-0.5 text-[11px] font-medium text-police">{value}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => { window.print(); }}
                className="w-full rounded-xl bg-[#1E3A8A] py-2.5 text-[13px] font-bold text-white flex items-center justify-center gap-2">
                <FileText size={14}/> Chapisha Rekodi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
