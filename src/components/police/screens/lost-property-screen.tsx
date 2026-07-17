"use client";

import { useState } from "react";
import { ArrowLeft, Search, X, Plus, CheckCircle, Clock, Package } from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { LOST_PROPERTIES } from "@/lib/police-data";
import { toast } from "@/hooks/use-toast";

const STATUS_MAP = {
  found: { label: "Imepatikana", color: "#10B981" },
  searching: { label: "Inatafutwa", color: "#FF9800" },
  returned: { label: "Imerudishwa", color: "#2196F3" },
};
const CAT_MAP: Record<string, string> = { simu: "📱 Simu", kompyuta: "💻 Kompyuta", hati: "📄 Hati", "mali-nyingine": "🎒 Mali Nyingine" };

export function LostPropertyScreen() {
  const { goBack } = usePoliceStore();
  const [tab, setTab] = useState<"list" | "report">("list");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<(typeof LOST_PROPERTIES)[0] | null>(null);
  const [form, setForm] = useState({ ownerName: "", ownerPhone: "", ownerNida: "", category: "simu", description: "", serialNo: "", deviceNo: "", station: "Kituo Kikuu DSM", notes: "" });
  const [submitted, setSubmitted] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const filtered = LOST_PROPERTIES.filter((p) =>
    p.description.toLowerCase().includes(search.toLowerCase()) ||
    p.serialNo.toLowerCase().includes(search.toLowerCase()) ||
    p.deviceNo.toLowerCase().includes(search.toLowerCase()) ||
    p.owner.toLowerCase().includes(search.toLowerCase())
  );

  const handleReport = () => {
    if (!form.ownerName || !form.description) { toast({ title: "Kosa", description: "Jaza jina na maelezo.", variant: "destructive" }); return; }
    setSubmitted(true);
    toast({ title: "Mali Imesajiliwa ✓", description: `Ripoti ya mali iliyopotea imesajiliwa.` });
  };

  if (submitted) {
    return (
      <div className="min-h-full bg-police p-4">
        <div className="flex flex-col items-center py-10">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#10B981]/15"><CheckCircle size={44} className="text-[#10B981]" /></div>
          <h2 className="mt-4 text-[18px] font-bold text-police">Mali Imesajiliwa</h2>
          <p className="mt-2 text-center text-[12px] text-police-muted">Ripoti ya mali iliyopotea imehifadhiwa. Nambari ya kesi itapelekwa kwa mmiliki.</p>
          <div className="mt-6 w-full space-y-2">
            <button onClick={() => { setSubmitted(false); setForm({ ownerName: "", ownerPhone: "", ownerNida: "", category: "simu", description: "", serialNo: "", deviceNo: "", station: "Kituo Kikuu DSM", notes: "" }); setTab("list"); }} className="w-full rounded-xl bg-[#10B981] py-3 text-[14px] font-bold text-white">Rudi kwenye Orodha</button>
          </div>
        </div>
      </div>
    );
  }

  if (selected) {
    const st = STATUS_MAP[selected.status as keyof typeof STATUS_MAP];
    return (
      <div className="min-h-full bg-police">
        <div className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] px-4 py-4">
          <button onClick={() => setSelected(null)} className="mb-3 flex items-center gap-2 text-white/80"><ArrowLeft size={18} /> <span className="text-[13px]">Rudi</span></button>
          <h1 className="text-[16px] font-bold text-white">{selected.id}</h1>
          <p className="text-[11px] text-white/70">{CAT_MAP[selected.category] ?? selected.category}</p>
        </div>
        <div className="space-y-4 p-4">
          <div className="rounded-2xl bg-police-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-police">Maelezo ya Mali</h3>
              <span className="rounded-full px-3 py-1 text-[11px] font-bold text-white" style={{ backgroundColor: st.color }}>{st.label}</span>
            </div>
            <div className="space-y-2">
              <Row label="Mali" value={selected.description} />
              <Row label="S/N" value={selected.serialNo} />
              <Row label="Nambari ya Kifaa" value={selected.deviceNo} />
            </div>
          </div>
          <div className="rounded-2xl bg-police-card p-4 shadow-sm">
            <h3 className="mb-3 text-[14px] font-bold text-police">Mmiliki</h3>
            <div className="space-y-2">
              <Row label="Jina" value={selected.owner} />
              <Row label="Simu" value={selected.ownerPhone} />
              <Row label="NIDA" value={selected.ownerNida} />
            </div>
          </div>
          <div className="rounded-2xl bg-police-card p-4 shadow-sm">
            <h3 className="mb-3 text-[14px] font-bold text-police">Taarifa za Kesi</h3>
            <div className="space-y-2">
              <Row label="Iliripotiwa" value={`${selected.reportedDate} @ ${selected.reportedStation}`} />
              {selected.foundDate && <Row label="Ilipatikana" value={`${selected.foundDate} — ${selected.foundLocation}`} />}
              <Row label="Maelezo" value={selected.notes} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-police">
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] px-4 py-4">
        <button onClick={() => goBack()} className="mb-3 flex items-center gap-2 text-white/80"><ArrowLeft size={18} /> <span className="text-[13px]">Rudi Nyuma</span></button>
        <h1 className="text-[18px] font-bold text-white">Mali Zilizopotea</h1>
        <p className="text-[11px] text-white/70">Tafuta kwa S/N, IMEI, maelezo au jina la mmiliki</p>
      </div>

      <div className="space-y-3 p-4">
        {/* Tabs */}
        <div className="flex gap-2">
          <button onClick={() => setTab("list")} className={`flex-1 rounded-xl py-2.5 text-[13px] font-bold transition ${tab === "list" ? "bg-[#1E3A8A] text-white" : "bg-police-card text-police"}`}>Orodha</button>
          <button onClick={() => setTab("report")} className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-bold transition ${tab === "report" ? "bg-[#1E3A8A] text-white" : "bg-police-card text-police"}`}><Plus size={15} /> Ripoti Mpya</button>
        </div>

        {tab === "list" ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-police-card p-2.5 text-center shadow-sm">
                <Package size={16} className="mx-auto text-[#1E3A8A]" />
                <p className="mt-1 text-[15px] font-bold text-police">{LOST_PROPERTIES.length}</p>
                <p className="text-[9px] text-police-faint">Jumla</p>
              </div>
              <div className="rounded-xl bg-police-card p-2.5 text-center shadow-sm">
                <Clock size={16} className="mx-auto text-[#FF9800]" />
                <p className="mt-1 text-[15px] font-bold text-police">{LOST_PROPERTIES.filter((p) => p.status === "searching").length}</p>
                <p className="text-[9px] text-police-faint">Inatafutwa</p>
              </div>
              <div className="rounded-xl bg-police-card p-2.5 text-center shadow-sm">
                <CheckCircle size={16} className="mx-auto text-[#10B981]" />
                <p className="mt-1 text-[15px] font-bold text-police">{LOST_PROPERTIES.filter((p) => p.status !== "searching").length}</p>
                <p className="text-[9px] text-police-faint">Imepatikana</p>
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 rounded-xl border border-police bg-police-card px-3 shadow-sm">
              <Search size={16} className="text-police-faint" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="S/N, IMEI, maelezo, mmiliki..." className="h-10 flex-1 bg-transparent text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
              {search && <button onClick={() => setSearch("")}><X size={14} className="text-police-faint" /></button>}
            </div>

            <div className="space-y-2">
              {filtered.map((p) => {
                const st = STATUS_MAP[p.status as keyof typeof STATUS_MAP];
                return (
                  <button key={p.id} onClick={() => setSelected(p)} className="w-full rounded-xl bg-police-card p-3 text-left shadow-sm active:scale-[0.99]">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-police-muted text-[20px]">
                        {CAT_MAP[p.category]?.split(" ")[0] ?? "📦"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[13px] font-bold text-police">{p.description}</p>
                          <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ backgroundColor: st.color }}>{st.label}</span>
                        </div>
                        <p className="mt-0.5 text-[10px] text-police-muted">S/N: {p.serialNo}</p>
                        <p className="mt-0.5 text-[10px] text-police-muted">{p.owner} • {p.reportedDate}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="py-8 text-center text-[13px] text-police-muted">Hakuna matokeo kwa "{search}"</div>
              )}
            </div>
          </>
        ) : (
          /* Report form */
          <div className="rounded-2xl bg-police-card p-4 shadow-sm space-y-3">
            <h3 className="text-[14px] font-bold text-police">Ripoti Mali Iliyopotea</h3>
            <FInput label="Jina la Mmiliki" required value={form.ownerName} onChange={set("ownerName")} placeholder="Jina kamili" />
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Simu" value={form.ownerPhone} onChange={set("ownerPhone")} placeholder="07XX XXX XXX" />
              <FInput label="NIDA" value={form.ownerNida} onChange={set("ownerNida")} placeholder="19XX..." />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-police-muted">Aina ya Mali</label>
              <select value={form.category} onChange={set("category")} className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police focus:outline-none">
                <option value="simu">Simu ya Mkononi</option>
                <option value="kompyuta">Kompyuta / Laptop</option>
                <option value="hati">Hati (Pasi, Leseni, n.k.)</option>
                <option value="mali-nyingine">Mali Nyingine</option>
              </select>
            </div>
            <FInput label="Maelezo ya Mali" required value={form.description} onChange={set("description")} placeholder="Aina, rangi, sura ya mali" />
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Nambari ya Serial (S/N)" value={form.serialNo} onChange={set("serialNo")} placeholder="SM-S928B-..." />
              <FInput label="IMEI / Nambari ya Kifaa" value={form.deviceNo} onChange={set("deviceNo")} placeholder="IMEI: 3584..." />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-police-muted">Kituo cha Kuripoti</label>
              <select value={form.station} onChange={set("station")} className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police focus:outline-none">
                {["Kituo Kikuu DSM", "Kituo cha Ilala", "Kituo cha Kinondoni", "Kituo cha Temeke", "Kituo cha Ubungo"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-police-muted">Maelezo ya Ziada</label>
              <textarea rows={3} value={form.notes} onChange={set("notes")} placeholder="Maelezo mengine..." className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
            </div>
            <button onClick={handleReport} className="w-full rounded-xl bg-[#1E3A8A] py-3 text-[15px] font-bold text-white active:scale-[0.98]">
              Hifadhi Ripoti
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FInput({ label, required, value, onChange, placeholder }: { label: string; required?: boolean; value: string; onChange: React.ChangeEventHandler<HTMLInputElement>; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-medium text-police-muted">{label}{required && <span className="ml-0.5 text-[#EF4444]">*</span>}</label>
      <input value={value} onChange={onChange} placeholder={placeholder} className="w-full rounded-xl border border-police bg-police-input px-3 h-10 text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-1.5 border-b border-police-soft last:border-0">
      <span className="text-[10px] text-police-faint uppercase tracking-wide">{label}</span>
      <span className="text-[12px] font-medium text-police">{value}</span>
    </div>
  );
}
