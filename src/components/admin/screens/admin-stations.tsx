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
  Save,
} from "lucide-react";
import { getAdminEntityPath } from "@/lib/admin-navigation";
import { toast } from "@/hooks/use-toast";
import { useRecordsStore, type AdminStationRecord } from "@/store/records-store";

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

type ModalMode = "create" | "edit" | "view";

export function AdminStations() {
  const pathname = usePathname();
  const router = useRouter();
  const stations = useRecordsStore((s) => s.adminStations);
  const addAdminStation = useRecordsStore((s) => s.addAdminStation);
  const updateAdminStation = useRecordsStore((s) => s.updateAdminStation);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [active, setActive] = useState<AdminStationRecord | null>(null);

  const filtered = stations.filter((s) => {
    if (filter !== "all" && s.status !== filter) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.region.toLowerCase().includes(q) ||
      s.district.toLowerCase().includes(q)
    );
  });

  const totalStations = stations.length;
  const activeStations = stations.filter((s) => s.status === "active").length;
  const maintenanceStations = stations.filter(
    (s) => s.status === "maintenance"
  ).length;
  const totalOfficers = stations.reduce((sum, s) => sum + s.officersCount, 0);

  const openCreate = () => {
    setActive(null);
    setModalMode("create");
  };
  const openEdit = (s: AdminStationRecord) => {
    setActive(s);
    setModalMode("edit");
  };
  const openView = (s: AdminStationRecord) => {
    setActive(s);
    setModalMode("view");
  };

  const handleSubmit = (data: Omit<AdminStationRecord, "id" | "officersCount" | "postsCount" | "established">) => {
    if (modalMode === "edit" && active) {
      updateAdminStation(active.id, data);
      toast({
        title: "Kituo Kimesasishwa",
        description: `Taarifa za ${data.name} zimehifadhiwa`,
      });
    } else {
      addAdminStation(data);
      toast({
        title: "Kituo Kimeongezwa",
        description: `${data.name} kimeongezwa kwenye orodha`,
      });
    }
    setModalMode(null);
    setActive(null);
  };

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
          onClick={openCreate}
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
                  onClick={() => openView(s)}
                  className="border-b border-police-soft transition hover:bg-police-muted/40 last:border-0 cursor-pointer"
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
                      onClick={(e) => e.stopPropagation()}
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
                          openView(s);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-police-input text-police-navy hover:bg-police-muted"
                        title="Angalia"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(s);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-police-input text-police-navy hover:bg-police-muted"
                        title="Hariri"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(getAdminEntityPath(pathname, "stations", s.id));
                          toast({
                            title: "Inafungua posti za kituo hiki",
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

      {modalMode && (
        <StationModal
          mode={modalMode}
          station={active}
          onClose={() => {
            setModalMode(null);
            setActive(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

function StationModal({
  mode,
  station,
  onClose,
  onSubmit,
}: {
  mode: ModalMode;
  station: AdminStationRecord | null;
  onClose: () => void;
  onSubmit: (data: Omit<AdminStationRecord, "id" | "officersCount" | "postsCount" | "established">) => void;
}) {
  const [name, setName] = useState(station?.name ?? "");
  const [region, setRegion] = useState(station?.region ?? "");
  const [district, setDistrict] = useState(station?.district ?? "");
  const [address, setAddress] = useState(station?.address ?? "");
  const [phone, setPhone] = useState(station?.phone ?? "");
  const [status, setStatus] = useState<AdminStationRecord["status"]>(station?.status ?? "active");

  const isView = mode === "view";
  const title = mode === "create" ? "Ongeza Kituo Kipya" : mode === "edit" ? "Hariri Kituo" : "Maelezo ya Kituo";

  const handleSave = () => {
    if (!name.trim() || !region.trim() || !district.trim()) {
      toast({ title: "Tafadhali jaza jina, mkoa na wilaya" });
      return;
    }
    onSubmit({
      name: name.trim(),
      region: region.trim(),
      district: district.trim(),
      address: address.trim(),
      phone: phone.trim(),
      status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-police-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-police-soft bg-police-muted/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2196F3]/15 text-[#2196F3]">
              <Building2 size={18} />
            </div>
            <div>
              <p className="text-[15px] font-bold text-police">{title}</p>
              {station && (
                <p className="font-mono text-[11px] text-police-faint">{station.id}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-police-faint hover:bg-police-muted">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 p-4">
          <Field label="Jina la Kituo">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isView}
              placeholder="Mfano: Kituo cha Polisi Mjini"
              className="h-10 w-full rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police placeholder:text-police-faint focus:border-[#2196F3] focus:outline-none disabled:opacity-70"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Mkoa">
              <input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                disabled={isView}
                placeholder="Dar es Salaam"
                className="h-10 w-full rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police placeholder:text-police-faint focus:border-[#2196F3] focus:outline-none disabled:opacity-70"
              />
            </Field>
            <Field label="Wilaya">
              <input
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                disabled={isView}
                placeholder="Ilala"
                className="h-10 w-full rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police placeholder:text-police-faint focus:border-[#2196F3] focus:outline-none disabled:opacity-70"
              />
            </Field>
          </div>
          <Field label="Anwani">
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isView}
              placeholder="Sokoine Drive, Dar es Salaam"
              className="h-10 w-full rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police placeholder:text-police-faint focus:border-[#2196F3] focus:outline-none disabled:opacity-70"
            />
          </Field>
          <Field label="Simu">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isView}
              placeholder="022 211 0001"
              className="h-10 w-full rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police placeholder:text-police-faint focus:border-[#2196F3] focus:outline-none disabled:opacity-70"
            />
          </Field>
          <Field label="Hadhi">
            <div className="flex gap-2">
              {(["active", "maintenance"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => !isView && setStatus(st)}
                  disabled={isView}
                  className={`flex-1 rounded-lg border px-3 py-2 text-[12px] font-semibold transition disabled:opacity-70 ${
                    status === st
                      ? st === "active"
                        ? "border-green-500 bg-green-500/10 text-green-500"
                        : "border-orange-500 bg-orange-500/10 text-orange-500"
                      : "border-police-soft bg-police-input text-police-muted"
                  }`}
                >
                  {STATUS_LABEL[st]}
                </button>
              ))}
            </div>
          </Field>

          {!isView && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={onClose}
                className="rounded-lg bg-police-input py-2.5 text-[12px] font-semibold text-police-navy hover:bg-police-muted"
              >
                Ghairi
              </button>
              <button
                onClick={handleSave}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-[#2196F3] py-2.5 text-[12px] font-semibold text-white hover:bg-[#1E88E5]"
              >
                <Save size={13} /> Hifadhi
              </button>
            </div>
          )}
          {isView && (
            <button
              onClick={onClose}
              className="mt-2 w-full rounded-lg bg-[#2196F3] py-2.5 text-[12px] font-semibold text-white hover:bg-[#1E88E5]"
            >
              Funga
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase text-police-faint">
        {label}
      </label>
      {children}
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
