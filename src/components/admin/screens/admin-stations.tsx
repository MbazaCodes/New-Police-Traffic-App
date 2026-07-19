"use client";

import { useState } from "react";
import { Search, X, Building2, Plus, AlertTriangle, MapPin, Phone, ChevronRight } from "lucide-react";
import { useApiData } from "@/hooks/use-api-data";
import { authFetch } from "@/lib/client-auth";
import { toast } from "@/hooks/use-toast";

type Station = {
  id: string; name: string; region: string; district: string | null;
  address: string | null; phone: string | null; status: string;
  established: string | null; created_at: string;
  officers_count?: [{ count: number }]; posts_count?: [{ count: number }];
};

const STATUS_STYLES: Record<string,string> = {
  active:      "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30",
  maintenance: "bg-[#FF9800]/15 text-[#FF9800] border border-[#FF9800]/30",
  inactive:    "bg-gray-400/15 text-gray-400 border border-gray-300",
};
const STATUS_LABEL: Record<string,string> = { active:"Inafanya Kazi", maintenance:"Matengenezo", inactive:"Imefungwa" };

export function AdminStations() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Station | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:"", region:"", district:"", address:"", phone:"" });
  const [saving, setSaving] = useState(false);

  const { data: stations, loading, error, refetch } = useApiData<Station>(
    "/api/stations", query ? { search: query } : {}, [query]
  );

  async function handleAddStation() {
    if (!form.name.trim() || !form.region.trim()) {
      toast({ title:"Jina na mkoa vinahitajika", variant:"destructive" }); return;
    }
    setSaving(true);
    const { error } = await authFetch("/api/stations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, region: form.region, district: form.district, address: form.address, phone: form.phone }),
    });
    if (error) {
      toast({ title:"Hitilafu", description: error, variant:"destructive" });
    } else {
      toast({ title:"Kituo kimeongezwa", description: form.name });
      setForm({ name:"", region:"", district:"", address:"", phone:"" });
      setShowAdd(false);
      refetch();
    }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[22px] font-black text-police">Vituo vya Polisi</h1>
          <p className="text-[12px] text-police-muted">{stations.length} vituo</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-xl bg-[#1E3A8A] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm hover:bg-[#1a3278] active:scale-95 transition">
          <Plus size={16} /> Ongeza Kituo
        </button>
      </div>

      {/* Search */}
      <div className="rounded-xl bg-police-card p-3 shadow-sm">
        <div className="flex items-center gap-2 rounded-lg bg-police-input px-3 py-2">
          <Search size={14} className="shrink-0 text-police-faint" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tafuta kituo au mkoa..."
            className="flex-1 bg-transparent text-[13px] text-police placeholder-police-faint focus:outline-none" />
          {query && <button onClick={() => setQuery("")}><X size={14} className="text-police-faint" /></button>}
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl bg-police-card shadow-sm">
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#1E3A8A] border-t-transparent" />
            <span className="text-[13px] text-police-muted">Inapakia vituo...</span>
          </div>
        )}
        {!loading && error && (
          <div className="flex flex-col items-center py-12 text-center">
            <AlertTriangle size={32} className="text-[#EF4444]" />
            <p className="mt-2 text-[13px] text-[#EF4444]">{error}</p>
            <button onClick={refetch} className="mt-3 rounded-xl bg-[#1E3A8A] px-4 py-2 text-[12px] text-white">Jaribu Tena</button>
          </div>
        )}
        {!loading && !error && stations.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center px-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1E3A8A]/10">
              <Building2 size={32} className="text-[#1E3A8A] opacity-60" />
            </div>
            <p className="mt-4 text-[15px] font-bold text-police">Hakuna Vituo Bado</p>
            <p className="mt-1 text-[12px] text-police-muted max-w-xs">Anza kwa kuongeza kituo cha kwanza cha polisi.</p>
            <button onClick={() => setShowAdd(true)}
              className="mt-4 flex items-center gap-2 rounded-xl bg-[#1E3A8A] px-5 py-2.5 text-[13px] font-bold text-white">
              <Plus size={16} /> Ongeza Kituo cha Kwanza
            </button>
          </div>
        )}
        {!loading && !error && stations.length > 0 && (
          <div className="divide-y divide-police-soft">
            {stations.map((s) => (
              <div key={s.id} onClick={() => setSelected(s)}
                className="flex cursor-pointer items-center gap-3 p-4 hover:bg-police-muted/20 transition">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1E3A8A]/12">
                  <Building2 size={18} className="text-[#1E3A8A]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[14px] font-bold text-police">{s.name}</p>
                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[s.status] ?? ""}`}>
                      {STATUS_LABEL[s.status] ?? s.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-[11px] text-police-muted">
                      <MapPin size={10} />{s.region}{s.district ? `, ${s.district}` : ""}
                    </span>
                    {s.phone && <span className="flex items-center gap-1 text-[11px] text-police-muted hidden sm:flex"><Phone size={10} />{s.phone}</span>}
                  </div>
                </div>
                <ChevronRight size={16} className="shrink-0 text-police-faint" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Station Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={() => setShowAdd(false)}>
          <div className="relative w-full max-w-md rounded-2xl bg-police-card p-5 shadow-2xl" onClick={(e)=>e.stopPropagation()}>
            <button onClick={() => setShowAdd(false)} className="absolute right-4 top-4 text-police-muted"><X size={18} /></button>
            <h2 className="text-[16px] font-bold text-police mb-4">Ongeza Kituo Kipya</h2>
            <div className="space-y-3">
              {[
                { label:"Jina la Kituo *", key:"name", placeholder:"e.g. Kituo cha Polisi Kinondoni" },
                { label:"Mkoa *",          key:"region", placeholder:"e.g. Dar es Salaam" },
                { label:"Wilaya",          key:"district", placeholder:"e.g. Kinondoni" },
                { label:"Anwani",          key:"address", placeholder:"e.g. Barabara ya Kawawa" },
                { label:"Simu",            key:"phone", placeholder:"e.g. +255 22 276 0000" },
              ].map(({label, key, placeholder}) => (
                <div key={key}>
                  <label className="mb-1 block text-[11px] font-bold text-police-muted uppercase tracking-wide">{label}</label>
                  <input
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm(f => ({...f, [key]: e.target.value}))}
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-police-soft bg-police px-3 py-2.5 text-[13px] text-police placeholder-police-faint focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>
              ))}
            </div>
            <button onClick={handleAddStation} disabled={saving}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-bold text-white transition active:scale-95 disabled:opacity-60"
              style={{ background:"linear-gradient(135deg,#1E3A8A,#2563EB)" }}>
              {saving ? "Inahifadhi..." : <><Plus size={16} /> Hifadhi Kituo</>}
            </button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={() => setSelected(null)}>
          <div className="relative w-full max-w-md rounded-2xl bg-police-card p-5 shadow-2xl" onClick={(e)=>e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute right-4 top-4 text-police-muted"><X size={18} /></button>
            <h2 className="text-[16px] font-bold text-police mb-4">{selected.name}</h2>
            <div className="space-y-2.5 text-[13px]">
              {[
                { l:"Mkoa",    v: selected.region },
                { l:"Wilaya",  v: selected.district ?? "—" },
                { l:"Anwani",  v: selected.address ?? "—" },
                { l:"Simu",    v: selected.phone ?? "—" },
                { l:"Hali",    v: STATUS_LABEL[selected.status] ?? selected.status },
                { l:"Tarehe",  v: new Date(selected.created_at).toLocaleDateString("sw-TZ") },
              ].map(({l,v}) => (
                <div key={l} className="flex justify-between gap-4">
                  <span className="text-police-muted shrink-0">{l}</span>
                  <span className="text-police font-medium text-right">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
