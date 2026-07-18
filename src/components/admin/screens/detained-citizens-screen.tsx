"use client";

import { useState } from "react";
import { Search, X, Plus, Shield, Clock, CheckCircle, AlertTriangle, User, Phone, MapPin, Calendar, FileText } from "lucide-react";
import { DETAINED_CITIZENS } from "@/lib/police-data";
import { avatarUrl } from "@/lib/mock-engine";
import { toast } from "@/hooks/use-toast";

const STATUS_MAP = {
  held: { label: "Kizuizini", color: "#EF4444", bg: "#FEF2F2" },
  released: { label: "Ameachiwa", color: "#10B981", bg: "#F0FDF4" },
  charged: { label: "Ameshtakiwa", color: "#1E3A8A", bg: "#F5F3FF" },
};

const TYPE_MAP = {
  arrested: { label: "Kukamatwa", color: "#EF4444" },
  detained: { label: "Kizuizini", color: "#FF9800" },
  traffic: { label: "Trafiki", color: "#2196F3" },
};

export function DetainedCitizensScreen() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "held" | "released" | "charged">("all");
  const [selected, setSelected] = useState<(typeof DETAINED_CITIZENS)[0] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: "", nida: "", dob: "", gender: "Mme", address: "", phone: "", occupation: "", reason: "", type: "arrested", cell: "", courtDate: "", nextOfKin: "", medicalStatus: "Nzuri", officer: "", notes: "" });

  const setF = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const filtered = DETAINED_CITIZENS.filter((c) => {
    const matchFilter = filter === "all" || c.status === filter;
    const matchSearch = c.fullName.toLowerCase().includes(search.toLowerCase()) || c.reason.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleSave = () => {
    if (!form.fullName || !form.reason) { toast({ title: "Kosa", description: "Jaza jina na sababu.", variant: "destructive" }); return; }
    toast({ title: "Mfungwa Amesajiliwa ✓", description: `${form.fullName} amewekwa kwenye rekodi ya kituo.` });
    setShowForm(false);
  };

  if (selected) {
    const st = STATUS_MAP[selected.status as keyof typeof STATUS_MAP];
    const ty = TYPE_MAP[selected.type as keyof typeof TYPE_MAP];
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-[13px] font-medium text-[#2196F3]">← Rudi kwenye Orodha</button>
          <span className="rounded-full px-3 py-1 text-[11px] font-bold text-white" style={{ backgroundColor: st.color }}>{st.label}</span>
        </div>

        {/* Header card */}
        <div className="rounded-2xl bg-[#1E3A8A] p-5 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15"><User size={28} className="text-white" /></div>
            <div>
              <h2 className="text-[18px] font-bold">{selected.fullName}</h2>
              <p className="text-[12px] text-white/70">{selected.id} • {selected.cell} • <span style={{ color: ty.color === "#EF4444" ? "#fca5a5" : ty.color === "#FF9800" ? "#fcd34d" : "#93c5fd" }}>{ty.label}</span></p>
            </div>
          </div>
        </div>

        {/* Personal */}
        <div className="rounded-2xl bg-white dark:bg-[#1a2332] p-4 shadow-sm">
          <h3 className="mb-3 text-[14px] font-bold text-police">Taarifa Binafsi</h3>
          <div className="space-y-2">
            <DR icon={<User size={14} />} label="NIDA" value={selected.nida} />
            <DR icon={<Calendar size={14} />} label="Tarehe ya Kuzaliwa" value={`${selected.dob} (${selected.gender})`} />
            <DR icon={<MapPin size={14} />} label="Makazi" value={selected.address} />
            <DR icon={<Phone size={14} />} label="Simu" value={selected.phone} />
            <DR icon={<FileText size={14} />} label="Kazi" value={selected.occupation} />
          </div>
        </div>

        {/* Detention */}
        <div className="rounded-2xl bg-white dark:bg-[#1a2332] p-4 shadow-sm">
          <h3 className="mb-3 text-[14px] font-bold text-police">Taarifa za Kizuizi</h3>
          <div className="space-y-2">
            <DR icon={<AlertTriangle size={14} />} label="Sababu" value={selected.reason} />
            <DR icon={<Clock size={14} />} label="Alipokamatwa" value={`${selected.detainedDate} saa ${selected.detainedTime}`} />
            <DR icon={<Shield size={14} />} label="Chumba" value={`${selected.cell} — ${selected.station}`} />
            <DR icon={<User size={14} />} label="Ofisa Aliyemkamata" value={selected.officer} />
            <DR icon={<Calendar size={14} />} label="Tarehe ya Mahakama" value={selected.courtDate} />
            <DR icon={<Shield size={14} />} label="Hali ya Afya" value={selected.medicalStatus} />
          </div>
        </div>

        {/* Contacts */}
        <div className="rounded-2xl bg-white dark:bg-[#1a2332] p-4 shadow-sm">
          <h3 className="mb-3 text-[14px] font-bold text-police">Mawasiliano</h3>
          <div className="space-y-2">
            <DR icon={<Phone size={14} />} label="Ndugu wa Karibu" value={selected.nextOfKin} />
            <DR icon={<User size={14} />} label="Wakili" value={selected.lawyer} />
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => { toast({ title: "Hati Imepakiwa", description: "Hati ya kizuizi imeandaliwa." }); }} className="rounded-xl bg-[#2196F3] py-2.5 text-[13px] font-bold text-white">Chapisha Hati</button>
          <button onClick={() => { toast({ title: "Imesasishwa", description: "Hali imebadilishwa." }); }} className="rounded-xl bg-[#10B981] py-2.5 text-[13px] font-bold text-white">Sasisha Hali</button>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setShowForm(false)} className="text-[13px] font-medium text-[#2196F3]">← Rudi</button>
          <h2 className="text-[16px] font-bold text-police">Ongeza Mfungwa / Mzuiziwaji</h2>
          <div className="w-12" />
        </div>
        <div className="rounded-2xl bg-white dark:bg-[#1a2332] p-4 shadow-sm space-y-3">
          <FI label="Jina Kamili" required value={form.fullName} onChange={setF("fullName")} placeholder="Jina na jina la ukoo" />
          <div className="grid grid-cols-2 gap-3">
            <FI label="NIDA" value={form.nida} onChange={setF("nida")} placeholder="19XX..." />
            <FI label="Tarehe ya Kuzaliwa" value={form.dob} onChange={setF("dob")} placeholder="DD/MM/YYYY" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Jinsia</label>
            <select value={form.gender} onChange={setF("gender")} className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police focus:outline-none">
              <option>Mme</option><option>Mke</option>
            </select>
          </div>
          <FI label="Makazi" value={form.address} onChange={setF("address")} placeholder="Mtaa, Kata, Wilaya" />
          <div className="grid grid-cols-2 gap-3">
            <FI label="Simu" value={form.phone} onChange={setF("phone")} placeholder="07XX..." />
            <FI label="Kazi" value={form.occupation} onChange={setF("occupation")} placeholder="Shughuli" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Sababu ya Kizuizi <span className="text-[#EF4444]">*</span></label>
            <input value={form.reason} onChange={setF("reason")} placeholder="Kosa au sababu..." className="w-full rounded-xl border border-police bg-police-input px-3 h-10 text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Aina ya Kizuizi</label>
            <select value={form.type} onChange={setF("type")} className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police focus:outline-none">
              <option value="arrested">Kukamatwa</option>
              <option value="detained">Kizuizi cha Muda</option>
              <option value="traffic">Kosa la Trafiki</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FI label="Nambari ya Chumba" value={form.cell} onChange={setF("cell")} placeholder="A-1, B-3..." />
            <FI label="Tarehe ya Mahakama" value={form.courtDate} onChange={setF("courtDate")} placeholder="DD/MM/YYYY" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Hali ya Afya</label>
            <select value={form.medicalStatus} onChange={setF("medicalStatus")} className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police focus:outline-none">
              <option>Nzuri</option><option>Maumivu Madogo</option><option>Nahitaji Matibabu</option>
            </select>
          </div>
          <FI label="Ofisa Aliyemkamata" value={form.officer} onChange={setF("officer")} placeholder="Jina na cheo" />
          <FI label="Ndugu wa Karibu" value={form.nextOfKin} onChange={setF("nextOfKin")} placeholder="Jina na nambari ya simu" />
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Maelezo ya Ziada</label>
            <textarea rows={3} value={form.notes} onChange={setF("notes")} placeholder="Maelezo mengine..." className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
          </div>
          <button onClick={handleSave} className="w-full rounded-xl bg-[#1E3A8A] py-3 text-[15px] font-bold text-white active:scale-[0.98]">
            Hifadhi Rekodi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-police">Wafungwa / Wazuiziwaji</h2>
          <p className="text-[13px] text-police-muted">{DETAINED_CITIZENS.length} rekodi • Kituo cha DSM</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 rounded-xl bg-[#1E3A8A] px-4 py-2.5 text-[13px] font-bold text-white">
          <Plus size={16} /> Ongeza
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<AlertTriangle size={18} className="text-[#EF4444]" />} value={DETAINED_CITIZENS.filter((c) => c.status === "held").length} label="Kizuizini" color="#EF4444" />
        <StatCard icon={<CheckCircle size={18} className="text-[#10B981]" />} value={DETAINED_CITIZENS.filter((c) => c.status === "released").length} label="Wameachiwa" color="#10B981" />
        <StatCard icon={<Shield size={18} className="text-[#1E3A8A]" />} value={DETAINED_CITIZENS.filter((c) => c.status === "charged").length} label="Wameshtakiwa" color="#1E3A8A" />
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl border border-police bg-police-card px-3 shadow-sm">
        <Search size={16} className="text-police-faint" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tafuta kwa jina, ID, au kosa..." className="h-10 flex-1 bg-transparent text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
        {search && <button onClick={() => setSearch("")}><X size={14} className="text-police-faint" /></button>}
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto">
        {([["all", "Yote"], ["held", "Kizuizini"], ["released", "Wameachiwa"], ["charged", "Wameshtakiwa"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)} className={`shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${filter === id ? "bg-[#1E3A8A] text-white" : "bg-police-muted text-police-muted"}`}>{label}</button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map((c) => {
          const st = STATUS_MAP[c.status as keyof typeof STATUS_MAP];
          const ty = TYPE_MAP[c.type as keyof typeof TYPE_MAP];
          return (
            <button key={c.id} onClick={() => setSelected(c)} className="w-full rounded-xl bg-white dark:bg-[#1a2332] p-3 text-left shadow-sm border border-police-soft active:scale-[0.99]">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1E3A8A]/10">
                  <User size={18} className="text-[#1E3A8A]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[14px] font-bold text-police">{c.fullName}</p>
                    <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ backgroundColor: st.color }}>{st.label}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-[10px] font-medium" style={{ color: ty.color }}>{ty.label}</span>
                    <span className="text-[10px] text-police-faint">•</span>
                    <span className="text-[10px] text-police-faint">{c.cell} • {c.station}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-police-muted">{c.reason}</p>
                  <p className="mt-0.5 text-[10px] text-police-faint">{c.detainedDate} • Mahakama: {c.courtDate}</p>
                </div>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-8 text-center text-[13px] text-police-muted">Hakuna rekodi zinazofanana na utafutaji wako.</div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: number; label: string; color: string }) {
  return (
    <div className="rounded-xl bg-white dark:bg-[#1a2332] p-3 shadow-sm text-center">
      <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: `${color}15` }}>{icon}</div>
      <p className="text-[18px] font-bold text-police">{value}</p>
      <p className="text-[10px] text-police-muted">{label}</p>
    </div>
  );
}

function DR({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-1.5 border-b border-police-soft last:border-0">
      <span className="mt-0.5 text-police-faint">{icon}</span>
      <div>
        <p className="text-[10px] text-police-faint">{label}</p>
        <p className="text-[12px] font-medium text-police">{value}</p>
      </div>
    </div>
  );
}

function FI({ label, required, value, onChange, placeholder }: { label: string; required?: boolean; value: string; onChange: React.ChangeEventHandler<HTMLInputElement>; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-medium text-police-muted">{label}{required && <span className="ml-0.5 text-[#EF4444]">*</span>}</label>
      <input value={value} onChange={onChange} placeholder={placeholder} className="w-full rounded-xl border border-police bg-police-input px-3 h-10 text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
    </div>
  );
}
