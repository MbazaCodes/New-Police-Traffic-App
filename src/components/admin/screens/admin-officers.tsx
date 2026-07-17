"use client";

import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Phone,
  X,
  Shield,
  Clock,
  FileText,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { OFFICERS } from "@/lib/admin-data";
import { getOfficerProfilePath } from "@/lib/admin-navigation";
import { toast } from "@/hooks/use-toast";

type Officer = (typeof OFFICERS)[number];

const STATUS_STYLES: Record<string, string> = {
  active: "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/500/30",
  break: "bg-[#FF9800]/15 text-[#FF9800] border border-[#FF9800]/30",
  "off-duty": "bg-gray-500/15 text-gray-500 border border-gray-500/30",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Kazini",
  break: "Mapumziko",
  "off-duty": "Ametoka",
};

const STATUS_FILTERS = [
  { id: "all", label: "Wote" },
  { id: "active", label: "Kazini" },
  { id: "break", label: "Mapumziko" },
  { id: "off-duty", label: "Ametoka" },
] as const;

export function AdminOfficers() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [unitFilter, setUnitFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Officer | null>(null);

  const units = useMemo(
    () => Array.from(new Set(OFFICERS.map((o) => o.unit))),
    []
  );

  const filtered = OFFICERS.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (unitFilter !== "all" && o.unit !== unitFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        o.name.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.station.toLowerCase().includes(q) ||
        o.phone.includes(q)
      );
    }
    return true;
  });

  const activeCount = OFFICERS.filter((o) => o.status === "active").length;

  const openOfficerProfile = (officerId: string) => {
    router.push(getOfficerProfilePath(pathname, officerId));
  };

  return (
    <div className="space-y-5">
      {/* Heading */}
      <div>
        <h1 className="text-xl font-bold text-police-navy">Maofisa</h1>
        <p className="text-[13px] text-police-muted">
          {filtered.length} ya {OFFICERS.length} maofisa • {activeCount} walioko kazini
        </p>
      </div>

      {/* Search + filters */}
      <div className="rounded-xl bg-police-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-lg bg-police-input px-3">
            <Search size={16} className="text-police-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tafuta kwa jina, ID, kituo, simu..."
              className="h-9 flex-1 bg-transparent text-[13px] text-police placeholder:text-police-faint focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-police-faint">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg bg-police-input px-2.5 py-1.5">
              <Filter size={14} className="text-police-faint" />
              <select
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
                className="bg-transparent text-[12px] text-police focus:outline-none"
              >
                <option value="all">Vitengo Vyote</option>
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition ${
                statusFilter === f.id
                  ? "bg-[#2196F3] text-white"
                  : "bg-police-input text-police-muted hover:text-police"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Officers table */}
      <div className="rounded-xl bg-police-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-[12px]">
            <thead>
              <tr className="border-b border-police-soft bg-police-muted/40 text-[10px] uppercase text-police-faint">
                <th className="px-4 py-3 font-semibold">Jina / Cheo</th>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Kitengo</th>
                <th className="px-4 py-3 font-semibold">Kituo</th>
                <th className="px-4 py-3 font-semibold">Hadhi</th>
                <th className="px-4 py-3 text-center font-semibold">Patroli</th>
                <th className="px-4 py-3 text-center font-semibold">Citations</th>
                <th className="px-4 py-3 text-center font-semibold">Matukio</th>
                <th className="px-4 py-3 text-center font-semibold">Saa</th>
                <th className="px-4 py-3 font-semibold">Simu</th>
                <th className="px-4 py-3 text-right font-semibold">Hatua</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setSelected(o)}
                  className="cursor-pointer border-b border-police-soft transition hover:bg-police-muted/40 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2196F3]/15 text-[11px] font-bold text-[#2196F3]">
                        {o.name
                          .split(" ")
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openOfficerProfile(o.id);
                          }}
                          className="font-semibold text-police hover:underline"
                        >
                          {o.name}
                        </button>
                        <p className="text-[10px] text-police-faint">{o.rank}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-police-muted">
                    {o.id}
                  </td>
                  <td className="px-4 py-3 text-police-muted">{o.unit}</td>
                  <td className="px-4 py-3 text-police-muted">{o.station}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        STATUS_STYLES[o.status]
                      }`}
                    >
                      {STATUS_LABEL[o.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-police-navy">
                    {o.patrols}
                  </td>
                  <td className="px-4 py-3 text-center text-[#1E3A8A]">{o.citations}</td>
                  <td className="px-4 py-3 text-center text-[#FF9800]">
                    {o.incidents}
                  </td>
                  <td className="px-4 py-3 text-center text-police-muted">
                    {o.hoursToday.toFixed(1)}h
                  </td>
                  <td className="px-4 py-3 text-police-muted">{o.phone}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                          openOfficerProfile(o.id);
                      }}
                      className="inline-flex items-center gap-0.5 rounded-lg bg-police-input px-2 py-1 text-[11px] font-semibold text-police-navy hover:bg-police-muted"
                    >
                        Profile <ChevronRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-[13px] text-police-faint">
            Hakuna afisa aliyeonekana kwa vigezo ulivyovipa.
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <OfficerDrawer officer={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function OfficerDrawer({
  officer,
  onClose,
}: {
  officer: Officer;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-md overflow-y-auto bg-police-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-police-soft bg-police-muted/40 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2196F3] text-[14px] font-bold text-white">
            {officer.name
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-bold text-police">{officer.name}</p>
            <p className="text-[11px] text-police-muted">
              {officer.rank} • {officer.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-police-faint hover:bg-police-muted"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-4">
          {/* Status */}
          <div className="flex items-center justify-between rounded-lg border border-police-soft bg-police-muted/40 p-3">
            <span className="text-[12px] text-police-muted">Hadhi ya Sasa</span>
            <span
              className={`rounded-md px-2.5 py-1 text-[11px] font-bold uppercase ${
                STATUS_STYLES[officer.status]
              }`}
            >
              {STATUS_LABEL[officer.status]}
            </span>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase text-police-faint">
              Mawasiliano
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 rounded-lg bg-police-input p-2.5">
                <Phone size={14} className="text-police-faint" />
                <span className="text-[13px] text-police">{officer.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-lg bg-police-input p-2.5">
                <Shield size={14} className="text-police-faint" />
                <div className="flex-1">
                  <p className="text-[13px] text-police">{officer.station}</p>
                  <p className="text-[11px] text-police-faint">{officer.unit}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase text-police-faint">
              Takwimu za Leo
            </p>
            <div className="grid grid-cols-2 gap-2">
              <StatCard
                icon={<Shield size={14} />}
                label="Patroli"
                value={String(officer.patrols)}
                color="#10B981"
              />
              <StatCard
                icon={<FileText size={14} />}
                label="Citations"
                value={String(officer.citations)}
                color="#1E3A8A"
              />
              <StatCard
                icon={<AlertTriangle size={14} />}
                label="Matukio"
                value={String(officer.incidents)}
                color="#FF9800"
              />
              <StatCard
                icon={<Clock size={14} />}
                label="Masaa"
                value={`${officer.hoursToday.toFixed(1)}h`}
                color="#2196F3"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => {
                toast({
                  title: "Imefanikiwa",
                  description: `Umeitisha ${officer.name} kwenye mawasiliano`,
                });
              }}
              className="rounded-lg bg-[#2196F3] py-2.5 text-[12px] font-semibold text-white hover:bg-[#2196F3]"
            >
              Piga Simu
            </button>
            <button
              onClick={() => {
                toast({
                  title: "Imefanikiwa",
                  description: `Ujumbe umetumwa kwa ${officer.name}`,
                });
              }}
              className="rounded-lg bg-police-input py-2.5 text-[12px] font-semibold text-police-navy hover:bg-police-muted"
            >
              Tuma Ujumbe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-police-soft bg-police-muted/40 p-3">
      <div
        className="flex h-7 w-7 items-center justify-center rounded-md"
        style={{ backgroundColor: `${color}1A`, color }}
      >
        {icon}
      </div>
      <p className="mt-2 text-[18px] font-bold text-police-navy">{value}</p>
      <p className="text-[11px] text-police-muted">{label}</p>
    </div>
  );
}
