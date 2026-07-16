"use client";

import { useState } from "react";
import {
  Search,
  Edit3,
  Ban,
  Mail,
  Shield,
  Clock,
  X,
} from "lucide-react";
import { ADMIN_USERS } from "@/lib/admin-data";
import { toast } from "@/hooks/use-toast";

type User = (typeof ADMIN_USERS)[number];

const ROLE_STYLES: Record<string, string> = {
  commander: "bg-purple-500/15 text-purple-500 border border-purple-500/30",
  admin: "bg-[#2196F3]/15 text-[#2196F3] border border-[#2196F3]/30",
};

const ROLE_LABEL: Record<string, string> = {
  commander: "Kamanda",
  admin: "Msimamizi",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-500/15 text-green-500 border border-green-500/30",
  suspended: "bg-red-500/15 text-red-500 border border-red-500/30",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Hai",
  suspended: "Imesimwa",
};

export function AdminUsers() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>(ADMIN_USERS);
  const [editing, setEditing] = useState<User | null>(null);

  const filtered = users.filter((u) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.station.toLowerCase().includes(q) ||
      u.rank.toLowerCase().includes(q)
    );
  });

  const toggleSuspend = (u: User) => {
    const newStatus = u.status === "active" ? "suspended" : "active";
    setUsers((prev) =>
      prev.map((x) => (x.id === u.id ? { ...x, status: newStatus } : x))
    );
    toast({
      title: newStatus === "suspended" ? "Mtumiaji Amesimwa" : "Mtumiaji Amerejeshwa",
      description: `${u.name} ${newStatus === "suspended" ? "amesimwa" : "amerejeshwa"}`,
    });
  };

  return (
    <div className="space-y-5">
      {/* Heading */}
      <div>
        <h1 className="text-xl font-bold text-police-navy">Watumiaji</h1>
        <p className="text-[13px] text-police-muted">
          Dhibiti watumiaji wa mfumo wa Admin & Command Center
        </p>
      </div>

      {/* Search */}
      <div className="rounded-xl bg-police-card p-4 shadow-sm">
        <div className="flex items-center gap-2 rounded-lg bg-police-input px-3">
          <Search size={16} className="text-police-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tafuta kwa jina, cheo, barua pepe, kituo..."
            className="h-9 flex-1 bg-transparent text-[13px] text-police placeholder:text-police-faint focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-police-faint">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Users table */}
      <div className="rounded-xl bg-police-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-[12px]">
            <thead>
              <tr className="border-b border-police-soft bg-police-muted/40 text-[10px] uppercase text-police-faint">
                <th className="px-4 py-3 font-semibold">Jina</th>
                <th className="px-4 py-3 font-semibold">Nafasi</th>
                <th className="px-4 py-3 font-semibold">Cheo</th>
                <th className="px-4 py-3 font-semibold">Barua Pepe</th>
                <th className="px-4 py-3 font-semibold">Kituo</th>
                <th className="px-4 py-3 font-semibold">Hadhi</th>
                <th className="px-4 py-3 font-semibold">Login ya Mwisho</th>
                <th className="px-4 py-3 text-right font-semibold">Hatua</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-police-soft transition hover:bg-police-muted/40 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold ${
                          u.role === "commander"
                            ? "bg-purple-500/15 text-purple-500"
                            : "bg-[#2196F3]/15 text-[#2196F3]"
                        }`}
                      >
                        {u.name
                          .replace(/^(CP\.|ACP\.|SP\.|CSP\.)\s*/, "")
                          .split(" ")
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-police">{u.name}</p>
                        <p className="font-mono text-[10px] text-police-faint">{u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        ROLE_STYLES[u.role]
                      }`}
                    >
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-police-muted">{u.rank}</td>
                  <td className="px-4 py-3">
                    <a
                      href={`mailto:${u.email}`}
                      className="flex items-center gap-1.5 text-police-navy hover:underline"
                    >
                      <Mail size={11} className="text-police-faint" />
                      <span className="truncate">{u.email}</span>
                    </a>
                  </td>
                  <td className="px-4 py-3 text-police-muted">{u.station}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        STATUS_STYLES[u.status]
                      }`}
                    >
                      {STATUS_LABEL[u.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-police-muted">
                    <Clock size={11} className="mr-1 inline text-police-faint" />
                    {u.lastLogin}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditing(u)}
                        className="flex items-center gap-1 rounded-lg bg-police-input px-2 py-1.5 text-[11px] font-semibold text-police-navy hover:bg-police-muted"
                        title="Hariri"
                      >
                        <Edit3 size={12} /> Hariri
                      </button>
                      <button
                        onClick={() => toggleSuspend(u)}
                        className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold ${
                          u.status === "active"
                            ? "bg-red-500/15 text-red-500 hover:bg-red-500/25"
                            : "bg-green-500/15 text-green-500 hover:bg-green-500/25"
                        }`}
                        title={u.status === "active" ? "Simsa" : "Rudisha"}
                      >
                        <Ban size={12} />
                        {u.status === "active" ? "Simsa" : "Rudisha"}
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
            Hakuna mtumiaji aliyeonekana.
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <EditUserModal
          user={editing}
          onClose={() => setEditing(null)}
          onSave={(updated) => {
            setUsers((prev) =>
              prev.map((x) => (x.id === updated.id ? updated : x))
            );
            toast({
              title: "Imehifadhiwa",
              description: `Taarifa za ${updated.name} zimesasishwa`,
            });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function EditUserModal({
  user,
  onClose,
  onSave,
}: {
  user: User;
  onClose: () => void;
  onSave: (u: User) => void;
}) {
  const [name, setName] = useState(user.name);
  const [rank, setRank] = useState(user.rank);
  const [email, setEmail] = useState(user.email);
  const [station, setStation] = useState(user.station);
  const [role, setRole] = useState(user.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-police-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-police-soft bg-police-muted/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2196F3]/15 text-[#2196F3]">
              <Shield size={18} />
            </div>
            <div>
              <p className="text-[15px] font-bold text-police">Hariri Mtumiaji</p>
              <p className="font-mono text-[11px] text-police-faint">{user.id}</p>
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
          <Field label="Jina Kamili">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-police-soft bg-police-input px-3 py-2 text-[13px] text-police focus:border-[#2196F3] focus:outline-none"
            />
          </Field>
          <Field label="Cheo">
            <input
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              className="w-full rounded-lg border border-police-soft bg-police-input px-3 py-2 text-[13px] text-police focus:border-[#2196F3] focus:outline-none"
            />
          </Field>
          <Field label="Barua Pepe">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full rounded-lg border border-police-soft bg-police-input px-3 py-2 text-[13px] text-police focus:border-[#2196F3] focus:outline-none"
            />
          </Field>
          <Field label="Kituo">
            <input
              value={station}
              onChange={(e) => setStation(e.target.value)}
              className="w-full rounded-lg border border-police-soft bg-police-input px-3 py-2 text-[13px] text-police focus:border-[#2196F3] focus:outline-none"
            />
          </Field>
          <Field label="Nafasi">
            <div className="flex gap-2">
              {(["admin", "commander"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-[12px] font-semibold transition ${
                    role === r
                      ? r === "commander"
                        ? "border-purple-500 bg-purple-500/10 text-purple-500"
                        : "border-[#2196F3] bg-[#2196F3]/10 text-[#2196F3]"
                      : "border-police-soft bg-police-input text-police-muted"
                  }`}
                >
                  {ROLE_LABEL[r]}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={onClose}
              className="rounded-lg bg-police-input py-2.5 text-[12px] font-semibold text-police-navy hover:bg-police-muted"
            >
              Ghairi
            </button>
            <button
              onClick={() =>
                onSave({
                  ...user,
                  name,
                  rank,
                  email,
                  station,
                  role,
                })
              }
              className="rounded-lg bg-[#2196F3] py-2.5 text-[12px] font-semibold text-white hover:bg-[#1E88E5]"
            >
              Hifadhi
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
