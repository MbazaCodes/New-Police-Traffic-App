"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useRecordsStore, type AdminUserRecord } from "@/store/records-store";
import { toast } from "@/hooks/use-toast";

const USER_ROLES: AdminUserRecord["role"][] = [
  "regional",
  "district-admin",
  "commissioner",
  "all-staffs",
  "admin",
  "commander",
];

const ROLE_LABEL: Record<AdminUserRecord["role"], string> = {
  commander: "Kamanda",
  admin: "Msimamizi",
  regional: "Mkoa",
  "district-admin": "Msimamizi Wilaya",
  commissioner: "Kamanda Mkuu",
  "all-staffs": "Wafanyakazi Wote",
};

export function CreateUserPage({ basePath }: { basePath: "/admin" | "/command" }) {
  const router = useRouter();
  const addAdminUser = useRecordsStore((s) => s.addAdminUser);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rank, setRank] = useState("");
  const [station, setStation] = useState("");
  const [role, setRole] = useState<AdminUserRecord["role"]>("regional");
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      toast({
        title: "Tafadhali jaza taarifa zote",
        description: "Jina na barua pepe ni lazima.",
      });
      return;
    }
    setSaving(true);
    addAdminUser({
      name: name.trim(),
      email: email.trim(),
      rank: rank.trim() || "—",
      station: station.trim() || "—",
      role,
    });
    toast({
      title: "Mtumiaji Ameongezwa",
      description: `${name.trim()} ameongezwa kama ${ROLE_LABEL[role]}`,
    });
    // Reset form
    setName("");
    setEmail("");
    setRank("");
    setStation("");
    setRole("regional");
    setTimeout(() => {
      setSaving(false);
      router.push(basePath);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-police p-4 lg:p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <Link href={`${basePath}`} className="inline-flex items-center gap-2 rounded-lg bg-police-card px-3 py-2 text-[12px] font-semibold text-police-navy shadow-sm hover:bg-police-muted">
          <ArrowLeft size={14} /> Rudi
        </Link>

        <div className="rounded-xl bg-police-card p-5 shadow-sm">
          <h1 className="text-xl font-bold text-police-navy">Ongeza Mtumiaji Mpya</h1>
          <p className="mt-1 text-[13px] text-police-muted">Ongeza mtumiaji mpya wa admin operations. Ataonekana kwenye orodha mara moja.</p>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase text-police-faint">Jina Kamili</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mfano: CP. Saidi Waziri" className="h-10 rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police focus:border-[#2196F3] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase text-police-faint">Barua Pepe</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mfano@polisi.go.tz" type="email" className="h-10 rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police focus:border-[#2196F3] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase text-police-faint">Cheo</label>
              <input value={rank} onChange={(e) => setRank(e.target.value)} placeholder="Mfano: Inspector" className="h-10 rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police focus:border-[#2196F3] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase text-police-faint">Kituo/Mkoa/Wilaya</label>
              <input value={station} onChange={(e) => setStation(e.target.value)} placeholder="Mfano: Makao Makuu - DSM" className="h-10 rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police focus:border-[#2196F3] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase text-police-faint">Nafasi</label>
              <select value={role} onChange={(e) => setRole(e.target.value as AdminUserRecord["role"])} className="h-10 rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police focus:border-[#2196F3] focus:outline-none">
                {USER_ROLES.map((r) => (
                  <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#2196F3] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#1E88E5] disabled:opacity-60"
          >
            <UserPlus size={14} /> {saving ? "Inahifadhi..." : "Save User"}
          </button>
        </div>
      </div>
    </div>
  );
}
