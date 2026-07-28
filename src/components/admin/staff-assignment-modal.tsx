"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, Shield, AlertTriangle, Search, CheckCircle2 } from "lucide-react";
import { authFetch } from "@/lib/client-auth";

interface Officer {
  id: string; user_id: string; name: string; badge_no: string;
  rank: string; role: string; station_name: string; photo_url: string | null;
}

interface StaffRole {
  id: string; label: string; max: number | null; commanding: boolean;
}

interface Props {
  mode: "station" | "post";
  entityId: string;
  entityName: string;
  roles: StaffRole[];
  onClose: () => void;
  onSaved: () => void;
}

export function StaffAssignmentModal({ mode, entityId, entityName, roles, onClose, onSaved }: Props) {
  const [search, setSearch]     = useState("");
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading]   = useState(false);
  const [selected, setSelected] = useState<Officer | null>(null);
  const [role, setRole]         = useState(roles[0]?.id ?? "officer");
  const [rank, setRank]         = useState("");
  const [shift, setShift]       = useState("");
  const [notes, setNotes]       = useState("");
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  // Search officers
  useEffect(() => {
    if (search.length < 2) { setOfficers([]); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      const { data } = await authFetch(`/api/officers?search=${encodeURIComponent(search)}&limit=20`);
      setOfficers(data?.data ?? []);
      setLoading(false);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const save = async () => {
    if (!selected) { setError("Chagua afisa kwanza"); return; }
    setError(""); setSaving(true);

    const endpoint = mode === "station"
      ? `/api/stations/${entityId}/staff`
      : `/api/posts/${entityId}/staff`;

    const { data, error: err } = await authFetch(endpoint, {
      method: "POST",
      body: JSON.stringify({
        user_id: selected.user_id || selected.id,
        station_role: role,
        rank: rank || selected.rank || null,
        shift: shift || null,
        notes: notes || null,
      }),
    });

    setSaving(false);
    if (err || !data?.ok) {
      setError(data?.error ?? err ?? "Imeshindwa kuteua afisa");
      return;
    }
    onSaved();
    onClose();
  };

  const selectedRole = roles.find(r => r.id === role);

  const TPF_RANKS = ["IGP","DIG","COMMISSIONER","ACP","SP","ASP","IP","SGT","CPL","PC","CADET"];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-md rounded-3xl bg-police-card shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="h-1 w-full bg-gradient-to-r from-[#1E3A8A] via-[#2196F3] to-[#10B981]" />
        <div className="flex items-center justify-between p-5 border-b border-police-soft">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-[#2196F3]" />
            <div>
              <h2 className="text-[16px] font-black text-police">
                {mode === "station" ? "Weka Afisa Kituo" : "Weka Afisa Posti"}
              </h2>
              <p className="text-[11px] text-police-muted">{entityName}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-police-soft">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4">
          {/* Role selector */}
          <div>
            <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-police-muted">
              Wadhifu / Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map(r => (
                <button key={r.id} onClick={() => setRole(r.id)}
                  className={`rounded-xl border-2 p-2.5 text-left transition ${role === r.id ? "border-[#2196F3] bg-[#2196F3]/8" : "border-police-soft bg-police-card"}`}>
                  <div className="flex items-center gap-1.5">
                    {r.commanding && <Shield size={12} className={role === r.id ? "text-[#2196F3]" : "text-police-muted"} />}
                    <span className={`text-[12px] font-bold ${role === r.id ? "text-[#1E3A8A]" : "text-police-muted"}`}>{r.id}</span>
                  </div>
                  <p className="text-[10px] text-police-faint leading-tight mt-0.5">{r.label.split("—")[1]?.trim() ?? r.label}</p>
                  {r.max && <p className="text-[9px] text-orange-500 font-bold mt-0.5">Max: {r.max}</p>}
                </button>
              ))}
            </div>

            {selectedRole?.commanding && (
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-orange-50 border border-orange-200 px-3 py-2">
                <AlertTriangle size={14} className="text-orange-500 shrink-0" />
                <p className="text-[11px] text-orange-700">
                  {selectedRole.id === "OCD"
                    ? "Kila kituo kina OCD mmoja tu. Kukiweka mpya kutaisha wadhifu wa OCD wa sasa."
                    : `Max ${selectedRole.max} ${selectedRole.id} kwa ${mode === "station" ? "kituo" : "posti"} kimoja.`}
                </p>
              </div>
            )}
          </div>

          {/* Rank */}
          <div>
            <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-police-muted">
              Cheo (Rank)
            </label>
            <select value={rank} onChange={e => setRank(e.target.value)}
              className="w-full rounded-xl border border-police bg-police-card px-3 py-2.5 text-[13px] focus:border-[#2196F3] focus:outline-none">
              <option value="">— Chagua cheo au acha tupu —</option>
              {TPF_RANKS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Shift (only for posts) */}
          {mode === "post" && (
            <div>
              <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-police-muted">
                Zamu (Shift)
              </label>
              <select value={shift} onChange={e => setShift(e.target.value)}
                className="w-full rounded-xl border border-police bg-police-card px-3 py-2.5 text-[13px] focus:border-[#2196F3] focus:outline-none">
                <option value="">— Chagua zamu —</option>
                <option value="morning">Asubuhi (6am–2pm)</option>
                <option value="afternoon">Mchana (2pm–10pm)</option>
                <option value="night">Usiku (10pm–6am)</option>
                <option value="all">Zamu Zote</option>
              </select>
            </div>
          )}

          {/* Officer search */}
          <div>
            <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-police-muted">
              Tafuta Afisa
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-police-muted" />
              <input value={search} onChange={e => { setSearch(e.target.value); setSelected(null); }}
                placeholder="Jina, badge, simu..."
                className="w-full rounded-xl border border-police bg-police-card pl-9 pr-3 py-2.5 text-[13px] focus:border-[#2196F3] focus:outline-none" />
            </div>

            {/* Results */}
            {loading && <p className="mt-2 text-[12px] text-police-muted text-center">Inatafuta...</p>}
            {officers.length > 0 && !selected && (
              <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-police-soft bg-police-card shadow-sm divide-y divide-police-soft">
                {officers.map(o => (
                  <button key={o.id} onClick={() => { setSelected(o); setSearch(o.name); setRank(o.rank || ""); }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-police-soft transition">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2196F3]/10 text-[13px] font-bold text-[#2196F3]">
                      {o.name?.[0] ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-police truncate">{o.name}</p>
                      <p className="text-[11px] text-police-muted">{o.badge_no} · {o.rank} · {o.station_name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected officer */}
            {selected && (
              <div className="mt-2 flex items-center gap-3 rounded-xl bg-[#2196F3]/8 border border-[#2196F3]/20 px-3 py-2.5">
                <CheckCircle2 size={16} className="text-[#2196F3] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-[#1E3A8A]">{selected.name}</p>
                  <p className="text-[11px] text-police-muted">{selected.badge_no} · {selected.rank}</p>
                </div>
                <button onClick={() => { setSelected(null); setSearch(""); }} className="text-police-muted hover:text-red-500">
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-police-muted">
              Maelezo (si lazima)
            </label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="Sababu ya mgawo, masharti, n.k..."
              className="w-full rounded-xl border border-police bg-police-card px-3 py-2 text-[13px] focus:border-[#2196F3] focus:outline-none resize-none" />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5">
              <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-[12px] text-red-600">{error}</p>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-police-soft">
          <button onClick={save} disabled={saving || !selected}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] py-3 text-[14px] font-black text-white disabled:opacity-50">
            {saving ? "Inateua..." : <><UserPlus size={16} /> Teua Afisa</>}
          </button>
        </div>
      </div>
    </div>
  );
}
