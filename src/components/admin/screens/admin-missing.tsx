// @ts-nocheck
"use client";
import { OFFICERS, ADMIN_CITATIONS, ADMIN_INCIDENTS, ACTIVE_PATROLS, ASSIGNMENTS, POSTS, STATIONS, ADMIN_USERS, WARNING_RECORDS, LIVE_INCIDENTS, INCIDENT_TREND, OFFENSE_DISTRIBUTION, GENERAL_INCIDENT_DISTRIBUTION, COMBINED_DISTRIBUTION, REGION_STATS, ADMIN_USER, settings } from "@/lib/admin-data";
import type { OfficerRecord, CitationRecord, IncidentRecord, PatrolRecord, AssignmentRecord, PostRecord, StationRecord, AdminUserRecord, WarningRecord, MissingRecord, DetainedRecord, LiveIncidentRecord } from "@/lib/admin-data";

import { useState, useRef } from "react";
import { useApiData } from "@/hooks/use-api-data";
import { authFetch } from "@/lib/client-auth";
import { Search, X, Plus, AlertTriangle, Car, Smartphone, User, CheckCircle, Camera, Clock, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type FT = "all" | "person" | "car" | "device";
type FS = "all" | "active" | "found";

const TC: Record<string, string> = { person: "#EF4444", car: "#2196F3", device: "#1E3A8A" };
const TL: Record<string, string> = { person: "Mtu", car: "Gari", device: "Kifaa" };
const SC: Record<string, string> = { active: "#EF4444", found: "#10B981", closed: "#9E9E9E" };
const SL: Record<string, string> = { active: "Inatafutwa", found: "Imepatikana", closed: "Imefungwa" };

export function AdminMissing() {
  const [typeFilter, setTypeFilter] = useState<FT>("all");
  const [statusFilter, setStatusFilter] = useState<FS>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MissingRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ type:"person" as "person"|"car"|"device", title:"", identifier:"", details:"", lastSeen:"", lastSeenLocation:"", reportedBy:"", station:"Kituo Kikuu cha Polisi DSM" });
  const setF = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) => setForm((f) => ({...f,[k]:e.target.value}));

  const { data: records, refetch } = useApiData<MissingRecord>("/api/missing", undefined, [], { refreshMs: 15000 });
  const handleSaveForm = async () => {
    const { error } = await authFetch("/api/missing", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (error) { toast({ title: "Hitilafu", description: error, variant: "destructive" }); return; }
    toast({ title: "Imehifadhiwa ✓" }); setShowForm(false); void refetch();
  };
  const filtered = records.filter((r) => {
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (query) { const q = query.toLowerCase(); return r.title.toLowerCase().includes(q) || r.identifier.toLowerCase().includes(q) || r.caseNo.toLowerCase().includes(q); }
    return true;
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => { if (ev.target?.result) setUploadedPhoto(ev.target.result as string); };
    reader.readAsDataURL(f);
  };

  const handleSave = handleSaveForm; // redirect to the real API save

  if (selected) return (
    <div className="space-y-5">
      <button onClick={() => setSelected(null)} className="text-[13px] font-medium text-[#2196F3]">← Rudi kwenye Orodha</button>
      <div className="rounded-2xl overflow-hidden bg-police-card shadow-sm">
        <div className="p-5" style={{ backgroundColor:`${TC[selected.type]}15`, borderBottom:`3px solid ${TC[selected.type]}` }}>
          <div className="flex items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selected.photo} alt={selected.title} className="h-20 w-20 rounded-2xl object-cover" />
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="rounded-full px-2.5 py-1 text-[11px] font-bold text-white" style={{ backgroundColor:TC[selected.type] }}>{TL[selected.type]}</span>
                <span className="rounded-full px-2.5 py-1 text-[11px] font-bold text-white" style={{ backgroundColor:SC[selected.status] }}>{SL[selected.status]}</span>
                <span className="text-[11px] font-bold text-police-muted">{selected.caseNo}</span>
              </div>
              <h2 className="text-[16px] font-bold text-police">{selected.title}</h2>
              <p className="text-[12px] text-police-muted">{selected.identifier}</p>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-[13px] leading-relaxed text-police">{selected.details}</p>
          <div className="grid grid-cols-2 gap-4 text-[12px]">
            <div><p className="text-[10px] text-police-faint">Alionekana Mara ya Mwisho</p><p className="font-medium text-police">{selected.lastSeen}</p></div>
            <div><p className="text-[10px] text-police-faint">Eneo la Mwisho</p><p className="font-medium text-police">{selected.lastSeenLocation}</p></div>
            <div><p className="text-[10px] text-police-faint">Ripoti Ilitolewa na</p><p className="font-medium text-police">{selected.reportedBy}</p></div>
            <div><p className="text-[10px] text-police-faint">Kituo</p><p className="font-medium text-police">{selected.station}</p></div>
            {selected.rewardAmount && <div><p className="text-[10px] text-police-faint">Tuzo</p><p className="font-bold text-[#10B981]">{selected.rewardAmount}</p></div>}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => toast({ title:"Imesasishwa", description:"Kesi imewekwa kuwa Imepatikana." })} className="flex items-center justify-center gap-2 rounded-xl bg-[#10B981] py-3 text-[13px] font-bold text-white"><CheckCircle size={15} /> Imepatikana</button>
        <button onClick={() => toast({ title:"Tangazo", description:"Ripoti imetumwa kwa vikosi vyote." })} className="flex items-center justify-center gap-2 rounded-xl bg-[#EF4444] py-3 text-[13px] font-bold text-white"><AlertTriangle size={15} /> Tuma Tangazo</button>
      </div>
    </div>
  );

  if (showForm) return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => setShowForm(false)} className="text-[13px] font-medium text-[#2196F3]">← Rudi</button>
        <h2 className="text-[16px] font-bold text-police">Ripoti Mpya ya Kutafuta</h2>
        <div className="w-16" />
      </div>
      <div className="rounded-2xl bg-police-card p-5 shadow-sm space-y-4">
        <div>
          <label className="mb-1 block text-[12px] font-medium text-police-muted">Aina</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(["person","car","device"] as const).map((t) => (
              <button key={t} onClick={() => setForm((f) => ({...f,type:t}))} className={`rounded-xl py-2.5 text-[12px] font-bold transition ${form.type===t?"text-white":"bg-police-muted text-police-muted"}`} style={form.type===t?{backgroundColor:TC[t]}:{}}>{TL[t]}</button>
            ))}
          </div>
        </div>
        <FI label="Kichwa / Jina" required value={form.title} onChange={setF("title")} placeholder="Mtu aliyepotea, Gari lililobiwa..." />
        <FI label="Kitambulisho (NIDA / Plate / S/N)" required value={form.identifier} onChange={setF("identifier")} placeholder="NIDA: 199... / T 001 ABC / SM-..." />
        <div><label className="mb-1 block text-[12px] font-medium text-police-muted">Maelezo Kamili</label><textarea rows={4} value={form.details} onChange={setF("details")} placeholder="Eleza kwa undani sura, nguo, rangi, historia..." className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police placeholder:text-police-faint focus:outline-none" /></div>
        <div className="grid grid-cols-2 gap-3">
          <FI label="Alionekana Mara ya Mwisho" value={form.lastSeen} onChange={setF("lastSeen")} placeholder="13 Mei 2026 • 15:00" />
          <FI label="Eneo la Mwisho" value={form.lastSeenLocation} onChange={setF("lastSeenLocation")} placeholder="Kariakoo Market, DSM" />
        </div>
        <FI label="Ripoti Ilitolewa na" value={form.reportedBy} onChange={setF("reportedBy")} placeholder="Jina kamili la mlanguzi" />
        <div>
          <label className="mb-1 block text-[12px] font-medium text-police-muted">Picha <span className="text-[#EF4444]">*</span> — Commissioner lazima apakue picha</label>
          <div onClick={() => fileRef.current?.click()} className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-police bg-police-input py-5 hover:border-[#2196F3] transition">
            {uploadedPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={uploadedPhoto} alt="preview" className="h-24 w-24 rounded-xl object-cover" />
            ) : (
              <><Camera size={28} className="text-[#2196F3]" /><p className="text-[12px] font-medium text-police-muted">Bonyeza kupakua picha</p></>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
        </div>
        <button onClick={handleSaveForm} className="w-full rounded-xl bg-[#EF4444] py-3.5 text-[15px] font-bold text-white active:scale-[0.98]">
          <AlertTriangle size={16} className="mr-2 inline" /> Wasilisha Ripoti ya Kutafuta
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-police-navy">Wanaotafutwa</h1><p className="text-[13px] text-police-muted">{records.filter((r) => r.status==="active").length} kesi zinazoendelea kati ya {records.length} zote</p></div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-xl bg-[#EF4444] px-4 py-2.5 text-[13px] font-bold text-white"><Plus size={16} /> Ripoti Mpya</button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(["person","car","device"] as const).map((t) => (
          <div key={t} className="rounded-xl bg-police-card p-3 text-center shadow-sm">
            <p className="text-[18px] font-bold" style={{ color:TC[t] }}>{records.filter((r)=>r.type===t&&r.status==="active").length}</p>
            <p className="text-[10px] text-police-muted">{TL[t]} Wanaotafutwa</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {(["all","person","car","device"] as FT[]).map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${typeFilter===t?"bg-[#1E3A8A] text-white":"bg-police-card text-police-muted shadow-sm"}`}>{t==="all"?"Wote":TL[t]}</button>
        ))}
        <div className="ml-auto flex gap-2">
          {(["all","active","found"] as FS[]).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition ${statusFilter===s?"bg-[#1E3A8A] text-white":"bg-police-card text-police-muted"}`}>{s==="all"?"Zote":SL[s]}</button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-police bg-police-card px-3 shadow-sm">
        <Search size={16} className="text-police-faint" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tafuta kwa jina, plate, S/N, kesi..." className="h-10 flex-1 bg-transparent text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
        {query && <button onClick={() => setQuery("")}><X size={14} className="text-police-faint" /></button>}
      </div>
      <div className="space-y-3">
        {filtered.map((r) => (
          <button key={r.id} onClick={() => setSelected(r)} className="flex w-full items-start gap-4 rounded-2xl bg-police-card p-4 text-left shadow-sm hover:shadow-md transition active:scale-[0.99]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={r.photo} alt={r.title} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[14px] font-bold text-police leading-tight">{r.title}</p>
                <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ backgroundColor:SC[r.status] }}>{SL[r.status]}</span>
              </div>
              <p className="mt-0.5 text-[11px] font-medium" style={{ color:TC[r.type] }}>{TL[r.type]} • {r.caseNo}</p>
              <p className="mt-0.5 text-[11px] text-police-muted line-clamp-1">{r.identifier}</p>
              <div className="mt-1 flex items-center gap-3 text-[10px] text-police-faint">
                <span className="flex items-center gap-1"><Clock size={10} /> {r.lastSeen}</span>
                <span className="flex items-center gap-1"><MapPin size={10} /> {r.lastSeenLocation.split(",")[0]}</span>
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && <div className="py-10 text-center text-[13px] text-police-muted">Hakuna rekodi zinazolingana.</div>}
      </div>
    </div>
  );
}

function FI({ label, required, value, onChange, placeholder }: { label:string; required?:boolean; value:string; onChange:React.ChangeEventHandler<HTMLInputElement>; placeholder?:string }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-medium text-police-muted">{label}{required&&<span className="ml-0.5 text-[#EF4444]">*</span>}</label>
      <input value={value} onChange={onChange} placeholder={placeholder} className="w-full rounded-xl border border-police bg-police-input px-3 h-10 text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
    </div>
  );
}
