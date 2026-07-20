"use client";

import { useEffect, useState } from "react";
import { Loader2, UserPlus, X } from "lucide-react";
import { authFetch } from "@/lib/client-auth";
import { toast } from "@/hooks/use-toast";

type Officer = { id: string; name: string; officer_number: string; station?: { name: string } | null };

export function OfficerAssignmentModal({
  stationId, stationName, postId, postName, onClose, onSaved,
}: {
  stationId: string; stationName: string; postId?: string; postName?: string;
  onClose: () => void; onSaved: () => void;
}) {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [officerId, setOfficerId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/officers").then((r) => r.json()).then((json) => setOfficers(json.data ?? [])).catch(() => {});
  }, []);

  async function assign() {
    if (!officerId) return;
    setSaving(true);
    const { error } = await authFetch(`/api/officers/${officerId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stationId, postId: postId ?? null }),
    });
    setSaving(false);
    if (error) {
      toast({ title: "Imeshindikana kumgawia afisa", description: error, variant: "destructive" });
      return;
    }
    toast({ title: "Afisa amegawiwa", description: postName ? `Amegawiwa ${postName}` : `Amegawiwa ${stationName}` });
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-police-card p-5 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-police-muted"><X size={18} /></button>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2196F3]/15 text-[#2196F3]"><UserPlus size={18} /></div>
          <div><h2 className="text-[16px] font-bold text-police">Mgawie Afisa</h2><p className="text-[12px] text-police-muted">{postName ?? stationName}</p></div>
        </div>
        <label className="mb-1 block text-[11px] font-bold uppercase text-police-muted">Afisa</label>
        <select value={officerId} onChange={(e) => setOfficerId(e.target.value)} className="h-11 w-full rounded-xl border border-police-soft bg-police px-3 text-[13px] text-police focus:border-[#2196F3] focus:outline-none">
          <option value="">— Chagua Afisa —</option>
          {officers.map((officer) => <option key={officer.id} value={officer.id}>{officer.name} ({officer.officer_number}){officer.station?.name ? ` — ${officer.station.name}` : ""}</option>)}
        </select>
        <button disabled={!officerId || saving} onClick={assign} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2196F3] py-3 text-[13px] font-bold text-white disabled:opacity-60">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />} {saving ? "Inahifadhi..." : "Mgawie Afisa"}
        </button>
      </div>
    </div>
  );
}
