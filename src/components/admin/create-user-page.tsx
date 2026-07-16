"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const USER_ROLES = [
  "regional",
  "district-admin",
  "commissioner",
  "all-staffs",
  "admin",
  "commander",
] as const;

export function CreateUserPage({ basePath }: { basePath: "/admin" | "/command" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rank, setRank] = useState("");
  const [station, setStation] = useState("");
  const [role, setRole] = useState<(typeof USER_ROLES)[number]>("regional");

  return (
    <div className="min-h-screen bg-police p-4 lg:p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <Link href={`${basePath}`} className="inline-flex items-center gap-2 rounded-lg bg-police-card px-3 py-2 text-[12px] font-semibold text-police-navy shadow-sm hover:bg-police-muted">
          <ArrowLeft size={14} /> Rudi
        </Link>

        <div className="rounded-xl bg-police-card p-5 shadow-sm">
          <h1 className="text-xl font-bold text-police-navy">Create User</h1>
          <p className="mt-1 text-[13px] text-police-muted">Ongeza mtumiaji mpya wa admin operations.</p>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jina Kamili" className="h-10 rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police focus:border-[#2196F3] focus:outline-none" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Barua pepe" className="h-10 rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police focus:border-[#2196F3] focus:outline-none" />
            <input value={rank} onChange={(e) => setRank(e.target.value)} placeholder="Cheo" className="h-10 rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police focus:border-[#2196F3] focus:outline-none" />
            <input value={station} onChange={(e) => setStation(e.target.value)} placeholder="Kituo/Mkoa/Wilaya" className="h-10 rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police focus:border-[#2196F3] focus:outline-none" />
            <select value={role} onChange={(e) => setRole(e.target.value as (typeof USER_ROLES)[number])} className="h-10 rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police focus:border-[#2196F3] focus:outline-none">
              {USER_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() =>
              toast({
                title: "User Created",
                description: `${name || "Mtumiaji"} ameongezwa kama ${role}`,
              })
            }
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#2196F3] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#1E88E5]"
          >
            <UserPlus size={14} /> Save User
          </button>
        </div>
      </div>
    </div>
  );
}
