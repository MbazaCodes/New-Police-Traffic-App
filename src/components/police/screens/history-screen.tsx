"use client";

import { useState } from "react";
import { Search, ChevronRight, FileText, Filter, Download } from "lucide-react";
import { TopAppBar } from "../top-app-bar";
import { CITATION_HISTORY } from "@/lib/police-data";
import { toast } from "@/hooks/use-toast";

export function HistoryScreen() {
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [query, setQuery] = useState("");

  const filtered = CITATION_HISTORY.filter((c) => {
    if (filter === "paid" && c.status !== "Imelipwa") return false;
    if (filter === "unpaid" && c.status !== "Hajalipwa") return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        c.plate.toLowerCase().includes(q) ||
        c.driver.toLowerCase().includes(q) ||
        c.offense.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalFines = CITATION_HISTORY.reduce((sum, c) => {
    const amt = parseInt(c.fine.replace(/[^\d]/g, ""), 10);
    return sum + amt;
  }, 0);
  const unpaidFines = CITATION_HISTORY.filter((c) => c.status === "Hajalipwa").reduce((sum, c) => {
    const amt = parseInt(c.fine.replace(/[^\d]/g, ""), 10);
    return sum + amt;
  }, 0);

  return (
    <div className="min-h-full bg-police">
      <TopAppBar title="Historia ya Citation" subtitle="Citations zilizotolewa" showBack />

      <div className="space-y-3 p-4 pb-8">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl bg-police-card p-3 shadow-sm">
            <p className="text-[10px] text-police-faint">Jumla ya Faini</p>
            <p className="mt-1 text-[18px] font-bold text-police-navy">
              TZS {totalFines.toLocaleString()}
            </p>
            <p className="mt-0.5 text-[10px] text-police-faint">{CITATION_HISTORY.length} Citations</p>
          </div>
          <div className="rounded-2xl bg-police-card p-3 shadow-sm">
            <p className="text-[10px] text-police-faint">Haijalipwa</p>
            <p className="mt-1 text-[18px] font-bold text-red-500">
              TZS {unpaidFines.toLocaleString()}
            </p>
            <p className="mt-0.5 text-[10px] text-police-faint">
              {CITATION_HISTORY.filter((c) => c.status === "Hajalipwa").length} Hajalipwa
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl border border-police bg-police-card px-3 shadow-sm">
          <Search size={18} className="text-police-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tafuta kwa plate, dereva, au namba..."
            className="h-11 flex-1 bg-transparent text-[13px] text-police placeholder:text-police-faint focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-[11px] text-police-faint">
              Futa
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-police-faint" />
          {([
            { id: "all" as const, label: "Zote" },
            { id: "unpaid" as const, label: "Haijalipwa" },
            { id: "paid" as const, label: "Imelipwa" },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${
                filter === tab.id
                  ? "bg-[#1A237E] text-white"
                  : "bg-police-card text-police-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={() => toast({ title: "Inapakua", description: "Ripoti ya historia inapakuliwa." })}
            className="ml-auto flex items-center gap-1 rounded-lg bg-police-card px-2.5 py-1.5 text-[11px] font-medium text-police-navy shadow-sm"
          >
            <Download size={13} /> Ripoti
          </button>
        </div>

        {/* List */}
        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl bg-police-card py-10 shadow-sm">
              <FileText size={32} className="text-police-faint" />
              <p className="mt-2 text-[13px] text-police-faint">Hakuna citation iliyopatikana</p>
            </div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() =>
                  toast({
                    title: c.id,
                    description: `${c.offense} — ${c.plate}`,
                  })
                }
                className="flex w-full items-center gap-3 rounded-2xl bg-police-card p-3 text-left shadow-sm active:scale-[0.99]"
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${c.statusColor}18` }}
                >
                  <FileText size={20} style={{ color: c.statusColor }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-[#1A237E] bg-yellow-50 px-1.5 py-0.5 text-[11px] font-bold text-police-navy">
                      {c.plate}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
                      style={{ backgroundColor: c.statusColor }}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] font-bold text-police">{c.offense}</p>
                  <p className="text-[11px] text-police-muted">{c.driver}</p>
                  <p className="text-[10px] text-police-faint">
                    {c.date} • {c.time} • {c.location}
                  </p>
                  <p className="mt-0.5 text-[13px] font-bold text-police-navy">{c.fine}</p>
                </div>
                <ChevronRight size={18} className="shrink-0 text-police-faint" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
