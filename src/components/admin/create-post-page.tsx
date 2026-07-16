"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { STATIONS } from "@/lib/admin-mgmt-data";
import { toast } from "@/hooks/use-toast";

export function CreatePostPage({ basePath }: { basePath: "/admin" | "/command" }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [stationId, setStationId] = useState(STATIONS[0]?.id ?? "");
  const [type, setType] = useState<"Traffic" | "Patrol">("Traffic");

  return (
    <div className="min-h-screen bg-police p-4 lg:p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <Link href={`${basePath}`} className="inline-flex items-center gap-2 rounded-lg bg-police-card px-3 py-2 text-[12px] font-semibold text-police-navy shadow-sm hover:bg-police-muted">
          <ArrowLeft size={14} /> Rudi
        </Link>

        <div className="rounded-xl bg-police-card p-5 shadow-sm">
          <h1 className="text-xl font-bold text-police-navy">Create Post</h1>
          <p className="mt-1 text-[13px] text-police-muted">Ongeza posti mpya kwa kituo.</p>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jina la Posti" className="h-10 rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police focus:border-[#2196F3] focus:outline-none" />
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Eneo" className="h-10 rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police focus:border-[#2196F3] focus:outline-none" />
            <select value={stationId} onChange={(e) => setStationId(e.target.value)} className="h-10 rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police focus:border-[#2196F3] focus:outline-none">
              {STATIONS.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select value={type} onChange={(e) => setType(e.target.value as "Traffic" | "Patrol")} className="h-10 rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police focus:border-[#2196F3] focus:outline-none">
              <option value="Traffic">Traffic</option>
              <option value="Patrol">Patrol</option>
            </select>
          </div>

          <button
            onClick={() =>
              toast({
                title: "Post Created",
                description: `${name || "Posti"} imeongezwa (${type})`,
              })
            }
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#2196F3] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#1E88E5]"
          >
            <Plus size={14} /> Save Post
          </button>
        </div>
      </div>
    </div>
  );
}
