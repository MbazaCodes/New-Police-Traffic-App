"use client";

import { useState } from "react";
import {
  Search,
  X,
  Plus,
  MapPin,
  Building2,
  Users,
  Shield,
  Clock,
  Eye,
  Pencil,
  UserPlus,
  TrafficCone,
} from "lucide-react";
import { POSTS } from "@/lib/admin-mgmt-data";
import { toast } from "@/hooks/use-toast";

type Post = (typeof POSTS)[number];

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-500/15 text-green-500 border border-green-500/30",
  inactive: "bg-red-500/15 text-red-500 border border-red-500/30",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Inafanya Kazi",
  inactive: "Imezimwa",
};

const TYPE_STYLES: Record<string, string> = {
  Traffic: "bg-[#2196F3]/15 text-[#2196F3] border border-[#2196F3]/30",
  Patrol: "bg-green-500/15 text-green-500 border border-green-500/30",
};

const FILTER_TABS = [
  { id: "all", label: "Posti Zote" },
  { id: "active", label: "Inafanya Kazi" },
  { id: "inactive", label: "Imezimwa" },
] as const;

export function AdminPosts() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const filtered = POSTS.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.stationName.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q)
    );
  });

  const totalPosts = POSTS.length;
  const activePosts = POSTS.filter((p) => p.status === "active").length;
  const inactivePosts = POSTS.filter((p) => p.status === "inactive").length;
  const totalOfficers = POSTS.reduce((sum, p) => sum + p.officersCount, 0);

  return (
    <div className="space-y-5">
      {/* Heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-police-navy">
            Posti za Polisi
          </h1>
          <p className="text-[13px] text-police-muted">
            Dhibiti posti na vituo vya ukaguzi wa polisi
          </p>
        </div>
        <button
          onClick={() =>
            toast({
              title: "Ongeza Posti",
              description: "Fomu ya kuongeza posti mpya itafungwa hapa",
            })
          }
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#2196F3] px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-[#1E88E5]"
        >
          <Plus size={14} /> Ongeza Posti
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Shield size={18} />}
          label="Jumla ya Posti"
          value={String(totalPosts)}
          color="#2196F3"
        />
        <StatCard
          icon={<Shield size={18} />}
          label="Zinazofanya Kazi"
          value={String(activePosts)}
          color="#4CAF50"
        />
        <StatCard
          icon={<Shield size={18} />}
          label="Zilizozimwa"
          value={String(inactivePosts)}
          color="#F44336"
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
            placeholder="Tafuta kwa jina, eneo, kituo, aina..."
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

      {/* Posts table */}
      <div className="rounded-xl bg-police-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-[12px]">
            <thead>
              <tr className="border-b border-police-soft bg-police-muted/40 text-[10px] uppercase text-police-faint">
                <th className="px-4 py-3 font-semibold">Jina la Posti</th>
                <th className="px-4 py-3 font-semibold">Kituo</th>
                <th className="px-4 py-3 font-semibold">Aina</th>
                <th className="px-4 py-3 text-center font-semibold">Maofisa</th>
                <th className="px-4 py-3 font-semibold">Mpangilio wa Zamu</th>
                <th className="px-4 py-3 font-semibold">Hadhi</th>
                <th className="px-4 py-3 text-right font-semibold">Hatua</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-police-soft transition hover:bg-police-muted/40 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                          p.type === "Traffic"
                            ? "bg-[#2196F3]/15 text-[#2196F3]"
                            : "bg-green-500/15 text-green-500"
                        }`}
                      >
                        {p.type === "Traffic" ? (
                          <TrafficCone size={16} />
                        ) : (
                          <Shield size={16} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-police">{p.name}</p>
                        <p className="flex items-center gap-1 text-[10px] text-police-faint">
                          <MapPin size={10} /> {p.location}
                        </p>
                        <p className="font-mono text-[10px] text-police-faint">
                          {p.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Building2 size={12} className="text-police-faint" />
                      <span className="text-police-muted">{p.stationName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        TYPE_STYLES[p.type]
                      }`}
                    >
                      {p.type === "Traffic" ? "Trafiki" : "Patroli"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#9C27B0]/15 px-2 py-0.5 text-[11px] font-bold text-[#9C27B0]">
                      <Users size={10} />
                      {p.officersCount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-police-muted">
                      <Clock size={11} className="text-police-faint" />
                      {p.shift}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        STATUS_STYLES[p.status]
                      }`}
                    >
                      {STATUS_LABEL[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() =>
                          toast({
                            title: "Maelezo ya Posti",
                            description: `Unaangalia maelezo ya ${p.name}`,
                          })
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-police-input text-police-navy hover:bg-police-muted"
                        title="Angalia"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() =>
                          toast({
                            title: "Hariri Posti",
                            description: `Una hariri taarifa za ${p.name}`,
                          })
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-police-input text-police-navy hover:bg-police-muted"
                        title="Hariri"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() =>
                          toast({
                            title: "Mgao wa Afisa",
                            description: `Fomu ya kumgawia afisa kwenye ${p.name} itafungwa`,
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-lg bg-[#2196F3]/15 px-2 py-1.5 text-[11px] font-semibold text-[#2196F3] hover:bg-[#2196F3]/25"
                        title="Mgawie Afisa"
                      >
                        <UserPlus size={12} /> Mgawie
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
            Hakuna posti iliyonekana kwa vigezo ulivyovipa.
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
