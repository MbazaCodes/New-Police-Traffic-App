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
  Save,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useRecordsStore, type AdminPostRecord } from "@/store/records-store";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/500/30",
  inactive: "bg-[#EF4444]/100/15 text-[#EF4444] border border-[#EF4444]/500/30",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Inafanya Kazi",
  inactive: "Imezimwa",
};

const TYPE_STYLES: Record<string, string> = {
  Traffic: "bg-[#2196F3]/15 text-[#2196F3] border border-[#2196F3]/30",
  Patrol: "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/500/30",
};

const FILTER_TABS = [
  { id: "all", label: "Posti Zote" },
  { id: "active", label: "Inafanya Kazi" },
  { id: "inactive", label: "Imezimwa" },
] as const;

type ModalMode = "create" | "edit" | "view";

export function AdminPosts() {
  const posts = useRecordsStore((s) => s.adminPosts);
  const stations = useRecordsStore((s) => s.adminStations);
  const addAdminPost = useRecordsStore((s) => s.addAdminPost);
  const updateAdminPost = useRecordsStore((s) => s.updateAdminPost);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [active, setActive] = useState<AdminPostRecord | null>(null);

  const filtered = posts.filter((p) => {
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

  const totalPosts = posts.length;
  const activePosts = posts.filter((p) => p.status === "active").length;
  const inactivePosts = posts.filter((p) => p.status === "inactive").length;
  const totalOfficers = posts.reduce((sum, p) => sum + p.officersCount, 0);

  const openCreate = () => {
    setActive(null);
    setModalMode("create");
  };
  const openEdit = (p: AdminPostRecord) => {
    setActive(p);
    setModalMode("edit");
  };
  const openView = (p: AdminPostRecord) => {
    setActive(p);
    setModalMode("view");
  };

  const handleSubmit = (data: Omit<AdminPostRecord, "id" | "officersCount" | "status">) => {
    if (modalMode === "edit" && active) {
      updateAdminPost(active.id, data);
      toast({
        title: "Posti Imesasishwa",
        description: `Taarifa za ${data.name} zimehifadhiwa`,
      });
    } else {
      addAdminPost(data);
      toast({
        title: "Posti Imeongezwa",
        description: `${data.name} imeongezwa kwenye orodha`,
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
            Posti za Polisi
          </h1>
          <p className="text-[13px] text-police-muted">
            Dhibiti posti na vituo vya ukaguzi wa polisi
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#2196F3] px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-[#2196F3] transition"
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
          color="#10B981"
        />
        <StatCard
          icon={<Shield size={18} />}
          label="Zilizozimwa"
          value={String(inactivePosts)}
          color="#EF4444"
        />
        <StatCard
          icon={<Users size={18} />}
          label="Jumla ya Maofisa"
          value={String(totalOfficers)}
          color="#1E3A8A"
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
                  onClick={() => openView(p)}
                  className="border-b border-police-soft transition hover:bg-police-muted/40 last:border-0 cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                          p.type === "Traffic"
                            ? "bg-[#2196F3]/15 text-[#2196F3]"
                            : "bg-[#10B981]/15 text-[#10B981]"
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
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#1E3A8A]/15 px-2 py-0.5 text-[11px] font-bold text-[#1E3A8A]">
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
                        onClick={(e) => {
                          e.stopPropagation();
                          openView(p);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-police-input text-police-navy hover:bg-police-muted"
                        title="Angalia"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(p);
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
                            title: "Fomu ya mgao",
                            description: `Inafungua fomu ya kumgawia afisa kwenye ${p.name}`,
                          });
                        }}
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

      {modalMode && (
        <PostModal
          mode={modalMode}
          post={active}
          stations={stations}
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

function PostModal({
  mode,
  post,
  stations,
  onClose,
  onSubmit,
}: {
  mode: ModalMode;
  post: AdminPostRecord | null;
  stations: { id: string; name: string }[];
  onClose: () => void;
  onSubmit: (data: Omit<AdminPostRecord, "id" | "officersCount" | "status">) => void;
}) {
  const [name, setName] = useState(post?.name ?? "");
  const [stationId, setStationId] = useState(post?.stationId ?? stations[0]?.id ?? "");
  const [location, setLocation] = useState(post?.location ?? "");
  const [type, setType] = useState<AdminPostRecord["type"]>(post?.type ?? "Traffic");
  const [shift, setShift] = useState(post?.shift ?? "24/7");

  const isView = mode === "view";
  const title = mode === "create" ? "Ongeza Posti Mpya" : mode === "edit" ? "Hariri Posti" : "Maelezo ya Posti";

  const handleSave = () => {
    if (!name.trim() || !stationId || !location.trim()) {
      toast({ title: "Tafadhali jaza jina, kituo na eneo" });
      return;
    }
    const stationName = stations.find((s) => s.id === stationId)?.name ?? stationId;
    onSubmit({
      name: name.trim(),
      stationId,
      stationName,
      location: location.trim(),
      type,
      shift: shift.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-police-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-police-soft bg-police-muted/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2196F3]/15 text-[#2196F3]">
              <Shield size={18} />
            </div>
            <div>
              <p className="text-[15px] font-bold text-police">{title}</p>
              {post && (
                <p className="font-mono text-[11px] text-police-faint">{post.id}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-police-faint hover:bg-police-muted">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 p-4">
          <Field label="Jina la Posti">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isView}
              placeholder="Mfano: Posti ya Mwenge"
              className="h-10 w-full rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police placeholder:text-police-faint focus:border-[#2196F3] focus:outline-none disabled:opacity-70"
            />
          </Field>
          <Field label="Kituo">
            <div className="flex items-center gap-2 rounded-lg border border-police-soft bg-police-input px-3">
              <Building2 size={14} className="text-police-faint" />
              <select
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
                disabled={isView}
                className="h-10 flex-1 bg-transparent text-[13px] text-police focus:outline-none disabled:opacity-70"
              >
                <option value="">— Chagua Kituo —</option>
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </Field>
          <Field label="Eneo / Mahali">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isView}
              placeholder="Mfano: Mwenge Bus Terminal"
              className="h-10 w-full rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police placeholder:text-police-faint focus:border-[#2196F3] focus:outline-none disabled:opacity-70"
            />
          </Field>
          <Field label="Aina">
            <div className="flex gap-2">
              {(["Traffic", "Patrol"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => !isView && setType(t)}
                  disabled={isView}
                  className={`flex-1 rounded-lg border px-3 py-2 text-[12px] font-semibold transition disabled:opacity-70 ${
                    type === t
                      ? t === "Traffic"
                        ? "border-[#2196F3] bg-[#2196F3]/10 text-[#2196F3]"
                        : "border-[#10B981]/500 bg-[#10B981]/10 text-[#10B981]"
                      : "border-police-soft bg-police-input text-police-muted"
                  }`}
                >
                  {t === "Traffic" ? "Trafiki" : "Patroli"}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Mpangilio wa Zamu">
            <input
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              disabled={isView}
              placeholder="Mfano: 24/7 au 06:00 - 18:00"
              className="h-10 w-full rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police placeholder:text-police-faint focus:border-[#2196F3] focus:outline-none disabled:opacity-70"
            />
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
                className="flex items-center justify-center gap-1.5 rounded-lg bg-[#2196F3] py-2.5 text-[12px] font-semibold text-white hover:bg-[#2196F3]"
              >
                <Save size={13} /> Hifadhi
              </button>
            </div>
          )}
          {isView && (
            <button
              onClick={onClose}
              className="mt-2 w-full rounded-lg bg-[#2196F3] py-2.5 text-[12px] font-semibold text-white hover:bg-[#2196F3]"
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
