"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  X,
  Plus,
  Building2,
  MapPin,
  Phone,
  Users,
  Shield,
  Calendar,
  Eye,
  Pencil,
  Network,
} from "lucide-react";
import { STATIONS } from "@/lib/admin-mgmt-data";
import { getAdminEntityPath } from "@/lib/admin-navigation";
import { toast } from "@/hooks/use-toast";

type Station = (typeof STATIONS)[number];

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-500/15 text-green-500 border border-green-500/30",
  maintenance: "bg-orange-500/15 text-orange-500 border border-orange-500/30",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Inafanya Kazi",
  maintenance: "Inarekebishwa",
};

const FILTER_TABS = [
  { id: "all", label: "Vituo Vyote" },
  { id: "active", label: "Inafanya Kazi" },
  { id: "maintenance", label: "Inarekebishwa" },
] as const;

export function AdminStations() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const filtered = STATIONS.filter((s) => {
    if (filter !== "all" && s.status !== filter) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.region.toLowerCase().includes(q) ||
      s.district.toLowerCase().includes(q)
    );
  });

  const totalStations = STATIONS.length;
  const activeStations = STATIONS.filter((s) => s.status === "active").length;
  const maintenanceStations = STATIONS.filter(
    (s) => s.status === "maintenance"
  ).length;
  const totalOfficers = STATIONS.reduce((sum, s) => sum + s.officersCount, 0);

  return (
    <div className="space-y-5">
      {/* Heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-police-navy">
            Vituo vya Polisi
          </h1>
          <p className="text-[13px] text-police-muted">
            Dhibiti vituo vya polisi nchini Tanzania
          </p>
        </div>
        <button
          onClick={() =>
            toast({
              title: "Ongeza Kituo",
              description: "Fomu ya kuongeza kituo kipya itafungwa hapa",
            })
          }
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#2196F3] px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-[#1E88E5]"
        >
          <Plus size={14} /> Ongeza Kituo
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Building2 size={18} />}
          label="Jumla ya Vituo"
          value={String(totalStations)}
          color="#2196F3"
        />
        <StatCard
          icon={<Shield size={18} />}
          label="Vinavyofanya Kazi"
          value={String(activeStations)}
          color="#4CAF50"
        />
        <StatCard
          icon={<Pencil size={18} />}
          label="Vinavyorekebishwa"
          value={String(maintenanceStations)}
          color="#FF9800"
        />
        <StatCard
          icon={<Users size={18} />}
          label="Jumla ya Maofisa"
          value={String(totalOfficers)}
          color="#9C27B0"
        />
      </div>

      {/* Search + filter tabs */}
      <div className="rounded-xl bg-police-card p-4 shadow-sm">
        <div className="flex items-center gap-2 rounded-lg bg-police-input px-3">
          <Search size={16} className="text-police-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tafuta kwa jina la kituo, mkoa, wilaya..."
            className="h-9 flex-1 bg-transparent text-[13px] text-police placeholder:text-police-faint focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-police-faint">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {FILTER_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition ${
                filter === t.id
                  ? "bg-[#2196F3] text-white"
                  : "bg-police-input text-police-muted hover:text-police"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stations table */}
      <div className="rounded-xl bg-police-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-[12px]">
            <thead>
              <tr className="border-b border-police-soft bg-police-muted/40 text-[10px] uppercase text-police-faint">
                <th className="px-4 py-3 font-semibold">Jina la Kituo</th>
                <th className="px-4 py-3 font-semibold">Mkoa / Wilaya</th>
                <th className="px-4 py-3 font-semibold">Simu</th>
                <th className="px-4 py-3 text-center font-semibold">Maofisa</th>
                <th className="px-4 py-3 text-center font-semibold">Posti</th>
                <th className="px-4 py-3 font-semibold">Hadhi</th>
                <th className="px-4 py-3 font-semibold">Iliyuanzishwa</th>
                <th className="px-4 py-3 text-right font-semibold">Hatua</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => router.push(getAdminEntityPath(pathname, "stations", s.id))}
                  className="border-b border-police-soft transition hover:bg-police-muted/40 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#2196F3]/15 text-[#2196F3]">
                        <Building2 size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-police">{s.name}</p>
                        <p className="flex items-center gap-1 text-[10px] text-police-faint">
                          <MapPin size={10} /> {s.address}
                        </p>
                        <p className="font-mono text-[10px] text-police-faint">
                          {s.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-police">{s.region}</p>
                    <p className="text-[11px] text-police-muted">{s.district}</p>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`tel:${s.phone}`}
                      className="flex items-center gap-1.5 text-police-navy hover:underline"
                    >
                      <Phone size={11} className="text-police-faint" />
                      <span>{s.phone}</span>
                    </a>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#9C27B0]/15 px-2 py-0.5 text-[11px] font-bold text-[#9C27B0]">
                      <Users size={10} />
                      {s.officersCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#2196F3]/15 px-2 py-0.5 text-[11px] font-bold text-[#2196F3]">
                      <Network size={10} />
                      {s.postsCount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        STATUS_STYLES[s.status]
                      }`}
                    >
                      {STATUS_LABEL[s.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-police-muted">
                      <Calendar size={11} className="text-police-faint" />
                      {s.established}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(getAdminEntityPath(pathname, "stations", s.id));
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-police-input text-police-navy hover:bg-police-muted"
                        title="Angalia"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(getAdminEntityPath(pathname, "stations", s.id));
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-police-input text-police-navy hover:bg-police-muted"
                        title="Hariri"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toast({
                            title: "Dhibiti Posti",
                            description: `Una dhibiti posti za ${s.name}`,
                          });
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#2196F3]/15 px-2 py-1.5 text-[11px] font-semibold text-[#2196F3] hover:bg-[#2196F3]/25"
                        title="Dhibiti Posti"
                      >
                        <Network size={12} /> Posti
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-[13px] text-police-faint">
            Hakuna kituo kilichoonekana kwa vigezo ulivyovipa.
          </div>
        )}
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
    <div className="rounded-xl bg-police-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}1A`, color }}
        >
          {icon}
        </div>
        <div>
          <p className="text-xl font-bold text-police-navy">{value}</p>
          <p className="text-[11px] text-police-muted">{label}</p>
        </div>
      </div>
    </div>
  );
}
