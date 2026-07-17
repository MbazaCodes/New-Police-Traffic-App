"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { useRecordsStore } from "@/store/records-store";
import { toast } from "@/hooks/use-toast";

export function CreatePostPage({ basePath }: { basePath: "/admin" | "/command" }) {
  const router = useRouter();
  const stations = useRecordsStore((s) => s.adminStations);
  const addAdminPost = useRecordsStore((s) => s.addAdminPost);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [stationId, setStationId] = useState(stations[0]?.id ?? "");
  const [type, setType] = useState<"Traffic" | "Patrol">("Traffic");
  const [shift, setShift] = useState("24/7");
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    if (!name.trim() || !location.trim() || !stationId) {
      toast({
        title: "Tafadhali jaza taarifa zote",
        description: "Jina, eneo, na kituo ni lazima.",
      });
      return;
    }
    setSaving(true);
    const stationName = stations.find((s) => s.id === stationId)?.name ?? stationId;
    addAdminPost({
      name: name.trim(),
      stationId,
      stationName,
      location: location.trim(),
      type,
      shift: shift.trim(),
    });
    toast({
      title: "Posti Imeongezwa",
      description: `${name.trim()} imehifadhiwa kwenye ${stationName}`,
    });
    // Reset and navigate back
    setName("");
    setLocation("");
    setShift("24/7");
    setType("Traffic");
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
          <h1 className="text-xl font-bold text-police-navy">Ongeza Posti Mpya</h1>
          <p className="mt-1 text-[13px] text-police-muted">Ongeza posti mpya kwa kituo. Itaonekana kwenye orodha mara moja.</p>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase text-police-faint">Jina la Posti</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mfano: Posti ya Mwenge" className="h-10 rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police focus:border-[#2196F3] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase text-police-faint">Eneo</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Mfano: Mwenge Bus Terminal" className="h-10 rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police focus:border-[#2196F3] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase text-police-faint">Kituo</label>
              <select value={stationId} onChange={(e) => setStationId(e.target.value)} className="h-10 rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police focus:border-[#2196F3] focus:outline-none">
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase text-police-faint">Aina</label>
              <select value={type} onChange={(e) => setType(e.target.value as "Traffic" | "Patrol")} className="h-10 rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police focus:border-[#2196F3] focus:outline-none">
                <option value="Traffic">Traffic</option>
                <option value="Patrol">Patrol</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase text-police-faint">Mpangilio wa Zamu</label>
              <input value={shift} onChange={(e) => setShift(e.target.value)} placeholder="24/7 au 06:00 - 18:00" className="h-10 rounded-lg border border-police-soft bg-police-input px-3 text-[13px] text-police focus:border-[#2196F3] focus:outline-none" />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#2196F3] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#2196F3] disabled:opacity-60"
          >
            <Plus size={14} /> {saving ? "Inahifadhi..." : "Save Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
