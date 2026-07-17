"use client";

import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Plus,
  Users,
  Shield,
  UserX,
  ArrowRightLeft,
  Trash2,
  Building2,
  Network,
  X,
  Calendar,
  UserPlus,
} from "lucide-react";
import { getAdminEntityPath } from "@/lib/admin-navigation";
import { toast } from "@/hooks/use-toast";
import {
  useRecordsStore,
  type AdminAssignmentRecord,
  type AdminUnassignedOfficer,
} from "@/store/records-store";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-500/15 text-green-500 border border-green-500/30",
  "on-leave": "bg-orange-500/15 text-orange-500 border border-orange-500/30",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Kazini",
  "on-leave": "Koko",
};

// Reassignment target — either an existing assignment (for reassign) or null
type AssignTarget =
  | { kind: "new"; officer: AdminUnassignedOfficer }
  | { kind: "reassign"; assignment: AdminAssignmentRecord };

export function AdminAssignments() {
  const pathname = usePathname();
  const router = useRouter();
  const assignments = useRecordsStore((s) => s.adminAssignments);
  const unassigned = useRecordsStore((s) => s.adminUnassigned);
  const stations = useRecordsStore((s) => s.adminStations);
  const posts = useRecordsStore((s) => s.adminPosts);
  const addAdminAssignment = useRecordsStore((s) => s.addAdminAssignment);
  const removeAdminAssignment = useRecordsStore((s) => s.removeAdminAssignment);

  const [target, setTarget] = useState<AssignTarget | null>(null);

  const totalAssignments = assignments.length;
  const activeAssignments = assignments.filter((a) => a.status === "active").length;
  const onLeave = assignments.filter((a) => a.status === "on-leave").length;
  const unassignedCount = unassigned.length;

  const handleConfirm = (stationId: string, postId: string, role: string) => {
    if (!target) return;
    const stationName = stations.find((s) => s.id === stationId)?.name ?? stationId;
    const postName = posts.find((p) => p.id === postId)?.name ?? postId;

    if (target.kind === "new") {
      addAdminAssignment({
        officerId: target.officer.id,
        officerName: target.officer.name,
        officerRank: target.officer.rank,
        stationId,
        stationName,
        postId,
        postName,
        role,
      });
      toast({
        title: "Mgao Umewekwa",
        description: `${target.officer.name} amegawiwa kwenye ${stationName} - ${postName} kama ${role}`,
      });
    } else {
      // Reassign: remove old, add new for the same officer
      const a = target.assignment;
      removeAdminAssignment(a.id);
      addAdminAssignment({
        officerId: a.officerId,
        officerName: a.officerName,
        officerRank: a.officerRank,
        stationId,
        stationName,
        postId,
        postName,
        role,
      });
      toast({
        title: "Mgao Umebadilishwa",
        description: `${a.officerName} amehamishiwa kwenye ${stationName} - ${postName}`,
      });
    }
    setTarget(null);
  };

  const handleRemove = (a: AdminAssignmentRecord) => {
    removeAdminAssignment(a.id);
    toast({
      title: "Mgao Umeondolewa",
      description: `Mgao wa ${a.officerName} wa ${a.postName} umebatilishwa`,
    });
  };

  return (
    <div className="space-y-5">
      {/* Heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-police-navy">
            Mgao wa Maofisa
          </h1>
          <p className="text-[13px] text-police-muted">
            Dhibiti ugawaji wa maofisa kwenye vituo na posti
          </p>
        </div>
        <button
          onClick={() => {
            if (unassigned.length === 0) {
              toast({
                title: "Hakuna afisa asiye na mgao",
                description: "Maofisa wote wameshagawiwa",
              });
              return;
            }
            setTarget({ kind: "new", officer: unassigned[0] });
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#2196F3] px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-[#1E88E5]"
        >
          <Plus size={14} /> Ongeza Mgao
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Users size={18} />}
          label="Jumla ya Magawo"
          value={String(totalAssignments)}
          color="#2196F3"
        />
        <StatCard
          icon={<Shield size={18} />}
          label="Walioko Kazini"
          value={String(activeAssignments)}
          color="#4CAF50"
        />
        <StatCard
          icon={<UserX size={18} />}
          label="Walio Koko"
          value={String(onLeave)}
          color="#FF9800"
        />
        <StatCard
          icon={<UserPlus size={18} />}
          label="Bila Mgao"
          value={String(unassignedCount)}
          color="#F44336"
        />
      </div>

      {/* Assigned officers table */}
      <div className="rounded-xl bg-police-card p-4 shadow-sm">
        <h2 className="mb-3 text-[14px] font-bold text-police-navy">
          Maofisa Walivewi Magawo
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-[12px]">
            <thead>
              <tr className="border-b border-police-soft bg-police-muted/40 text-[10px] uppercase text-police-faint">
                <th className="px-4 py-3 font-semibold">Afisa</th>
                <th className="px-4 py-3 font-semibold">Kituo</th>
                <th className="px-4 py-3 font-semibold">Posti</th>
                <th className="px-4 py-3 font-semibold">Nafasi</th>
                <th className="px-4 py-3 font-semibold">Tarehe ya Mgao</th>
                <th className="px-4 py-3 font-semibold">Hadhi</th>
                <th className="px-4 py-3 text-right font-semibold">Hatua</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => router.push(getAdminEntityPath(pathname, "assignments", a.id))}
                  className="border-b border-police-soft transition hover:bg-police-muted/40 last:border-0 cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2196F3]/15 text-[11px] font-bold text-[#2196F3]">
                        {a.officerName
                          .split(" ")
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-police">
                          {a.officerName}
                        </p>
                        <p className="font-mono text-[10px] text-police-faint">
                          {a.officerId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Building2 size={12} className="text-police-faint" />
                      <span className="text-police-muted">
                        {a.stationName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Network size={12} className="text-police-faint" />
                      <span className="text-police-muted">{a.postName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-[#9C27B0]/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#9C27B0]">
                      {a.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-police-muted">
                      <Calendar size={11} className="text-police-faint" />
                      {a.assignedDate}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        STATUS_STYLES[a.status]
                      }`}
                    >
                      {STATUS_LABEL[a.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTarget({ kind: "reassign", assignment: a });
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-police-input text-police-navy hover:bg-police-muted"
                        title="Badilisha Mgao"
                      >
                        <ArrowRightLeft size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(a);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/15 text-red-500 hover:bg-red-500/25"
                        title="Ondoa Mgao"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unassigned officers */}
      <div className="rounded-xl bg-police-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-police-navy">
            Maofisa Bila Mgao
          </h2>
          <span className="rounded-md bg-red-500/15 px-2 py-0.5 text-[11px] font-bold uppercase text-red-500">
            {unassignedCount} wamesubiri
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {unassigned.map((o) => (
            <div
              key={o.id}
              className="rounded-lg border border-police-soft bg-police-muted/40 p-3"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15 text-[12px] font-bold text-red-500">
                  {o.name
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-police">
                    {o.name}
                  </p>
                  <p className="text-[11px] text-police-muted">
                    {o.rank} •{" "}
                    <span className="font-mono text-police-faint">{o.id}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTarget({ kind: "new", officer: o })}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#2196F3] py-2 text-[12px] font-semibold text-white hover:bg-[#1E88E5]"
              >
                <UserPlus size={14} /> Mgawie Afisa huyu
              </button>
            </div>
          ))}
        </div>

        {unassigned.length === 0 && (
          <div className="py-8 text-center text-[13px] text-police-faint">
            Hakuna afisa asiye na mgao kwa sasa.
          </div>
        )}
      </div>

      {/* Assignment modal */}
      {target && (
        <AssignModal
          target={target}
          stations={stations}
          posts={posts}
          onClose={() => setTarget(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}

function AssignModal({
  target,
  stations,
  posts,
  onClose,
  onConfirm,
}: {
  target: AssignTarget;
  stations: { id: string; name: string }[];
  posts: { id: string; name: string; type: string; stationId: string }[];
  onClose: () => void;
  onConfirm: (stationId: string, postId: string, role: string) => void;
}) {
  const officer = target.kind === "new" ? target.officer : {
    id: target.assignment.officerId,
    name: target.assignment.officerName,
    rank: target.assignment.officerRank,
  };

  const [stationId, setStationId] = useState<string>(
    target.kind === "reassign" ? target.assignment.stationId : ""
  );
  const [postId, setPostId] = useState<string>(
    target.kind === "reassign" ? target.assignment.postId : ""
  );
  const [role, setRole] = useState<string>(
    target.kind === "reassign" ? target.assignment.role : "General Duty"
  );

  const availablePosts = useMemo(
    () => posts.filter((p) => p.stationId === stationId),
    [stationId, posts]
  );

  const title = target.kind === "new" ? "Mgawie Afisa Mgao" : "Badilisha Mgao";
  const confirmLabel = target.kind === "new" ? "Thibitisha Mgao" : "Badilisha Mgao";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-police-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-police-soft bg-police-muted/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2196F3]/15 text-[#2196F3]">
              <UserPlus size={18} />
            </div>
            <div>
              <p className="text-[15px] font-bold text-police">{title}</p>
              <p className="font-mono text-[11px] text-police-faint">
                {officer.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-police-faint hover:bg-police-muted"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 p-4">
          {/* Officer (read-only) */}
          <Field label="Afisa">
            <div className="flex items-center gap-2.5 rounded-lg border border-police-soft bg-police-input px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2196F3]/15 text-[11px] font-bold text-[#2196F3]">
                {officer.name
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-police">
                  {officer.name}
                </p>
                <p className="text-[10px] text-police-muted">{officer.rank}</p>
              </div>
            </div>
          </Field>

          {/* Station dropdown */}
          <Field label="Kituo">
            <div className="flex items-center gap-2 rounded-lg border border-police-soft bg-police-input px-3">
              <Building2 size={14} className="text-police-faint" />
              <select
                value={stationId}
                onChange={(e) => {
                  setStationId(e.target.value);
                  setPostId("");
                }}
                className="h-10 flex-1 bg-transparent text-[13px] text-police focus:outline-none"
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

          {/* Post dropdown (filtered by selected station) */}
          <Field label="Posti">
            <div className="flex items-center gap-2 rounded-lg border border-police-soft bg-police-input px-3">
              <Network size={14} className="text-police-faint" />
              <select
                value={postId}
                onChange={(e) => setPostId(e.target.value)}
                disabled={!stationId}
                className="h-10 flex-1 bg-transparent text-[13px] text-police focus:outline-none disabled:opacity-50"
              >
                <option value="">
                  {stationId ? "— Chagua Posti —" : "Chagua kituo kwanza"}
                </option>
                {availablePosts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.type})
                  </option>
                ))}
                {stationId && availablePosts.length === 0 && (
                  <option value="" disabled>
                    Hakuna posti kwenye kituo hiki
                  </option>
                )}
              </select>
            </div>
          </Field>

          {/* Role input */}
          <Field label="Nafasi">
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Mfano: Traffic Officer, Patrol Officer..."
              className="h-10 w-full rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police placeholder:text-police-faint focus:border-[#2196F3] focus:outline-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={onClose}
              className="rounded-lg bg-police-input py-2.5 text-[12px] font-semibold text-police-navy hover:bg-police-muted"
            >
              Ghairi
            </button>
            <button
              disabled={!stationId || !postId || !role.trim()}
              onClick={() => onConfirm(stationId, postId, role.trim())}
              className="rounded-lg bg-[#2196F3] py-2.5 text-[12px] font-semibold text-white hover:bg-[#1E88E5] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {confirmLabel}
            </button>
          </div>
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
