"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, AlertTriangle, Car, Smartphone, User,
  CheckCircle, Clock, MapPin, RefreshCw, X } from "lucide-react";
import { authFetch } from "@/lib/client-auth";
import { toast } from "@/hooks/use-toast";

type FilterType   = "all"|"person"|"car"|"device";
type FilterStatus = "all"|"active"|"found"|"closed";

const TYPE_COLOR:  Record<string,string> = { person:"#EF4444", car:"#2196F3", device:"#1E3A8A" };
const TYPE_LABEL:  Record<string,string> = { person:"Mtu", car:"Gari", device:"Kifaa" };
const TYPE_ICON:   Record<string,any>    = { person:User, car:Car, device:Smartphone };
const STATUS_COLOR:Record<string,string> = { active:"bg-red-100 text-red-700", found:"bg-green-100 text-green-700", closed:"bg-gray-100 text-gray-500" };
const STATUS_LABEL:Record<string,string> = { active:"Inatafutwa", found:"Imepatikana", closed:"Imefungwa" };

export function AdminMissing() {
  const [records, setRecords]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search,  setSearch]    = useState("");
  const [fType,   setFType]     = useState<FilterType>("all");
  const [fStatus, setFStatus]   = useState<FilterStatus>("all");
  const [showAdd, setShowAdd]   = useState(false);
  const [form,    setForm]      = useState({ type:"person", identifier:"", title:"", last_seen_location:"", details:"" });
  const [saving,  setSaving]    = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await authFetch("/api/missing-records?limit=200");
    setRecords(res.data?.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = records.filter(r => {
    if (fType   !== "all" && r.type   !== fType)   return false;
    if (fStatus !== "all" && r.status !== fStatus) return false;
    if (search) {
      const s = search.toLowerCase();
      return [r.identifier, r.title, r.case_no, r.last_seen_location]
        .some(f => String(f ?? "").toLowerCase().includes(s));
    }
    return true;
  });

  const handleAdd = async () => {
    if (!form.identifier.trim()) return;
    setSaving(true);
    const res = await authFetch("/api/missing-records", {
      method: "POST",
      body: JSON.stringify(form),
    });
    if (res.data?.ok) {
      toast({ title: "✅ Imeongezwa", description: "Ripoti ya kutoweka imesajiliwa." });
      setShowAdd(false);
      setForm({ type:"person", identifier:"", title:"", last_seen_location:"", details:"" });
      load();
    } else {
      toast({ title: "Hitilafu", description: res.data?.error ?? "Imeshindwa", variant:"destructive" });
    }
    setSaving(false);
  };

  const markFound = async (id: string) => {
    await authFetch(`/api/missing-records/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "found" }),
    });
    load();
  };

  const counts = {
    all:    records.length,
    active: records.filter(r => r.status === "active").length,
    found:  records.filter(r => r.status === "found").length,
    person: records.filter(r => r.type === "person").length,
    car:    records.filter(r => r.type === "car").length,
    device: records.filter(r => r.type === "device").length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-black text-police">Wanaotafutwa</h2>
          <p className="text-[12px] text-police-faint">{counts.active} wanaotafutwa · {counts.found} walioopatikana</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="rounded-xl bg-police-soft p-2">
            <RefreshCw size={15} className={`text-police-muted ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-xl bg-[#EF4444] px-3 py-2 text-[12px] font-bold text-white shadow">
            <Plus size={14} /> Ripoti Mpya
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { label:"Wote",   value:counts.all,    color:"#1E3A8A" },
          { label:"Inatafutwa", value:counts.active, color:"#EF4444" },
          { label:"Walioopatikana", value:counts.found,  color:"#10B981" },
          { label:"Watu",   value:counts.person, color:"#EF4444" },
          { label:"Magari", value:counts.car,    color:"#2196F3" },
          { label:"Vifaa",  value:counts.device, color:"#1E3A8A" },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-white border border-gray-100 shadow-sm p-3 text-center">
            <p className="text-[20px] font-black" style={{color:s.color}}>{s.value}</p>
            <p className="text-[10px] text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-police-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tafuta jina, namba, mahali..."
            className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#2196F3]" />
        </div>
        <div className="flex gap-1">
          {(["all","person","car","device"] as FilterType[]).map(t => (
            <button key={t} onClick={() => setFType(t)}
              className={`rounded-xl px-3 py-1.5 text-[11px] font-bold transition ${fType===t ? "bg-[#1E3A8A] text-white" : "bg-white border border-gray-200 text-gray-500"}`}>
              {t === "all" ? "Wote" : TYPE_LABEL[t]}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(["all","active","found","closed"] as FilterStatus[]).map(s => (
            <button key={s} onClick={() => setFStatus(s)}
              className={`rounded-xl px-3 py-1.5 text-[11px] font-bold transition ${fStatus===s ? "bg-[#EF4444] text-white" : "bg-white border border-gray-200 text-gray-500"}`}>
              {s === "all" ? "Hali Zote" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Records list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2196F3] border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center">
          <AlertTriangle size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="text-[13px] text-gray-400">Hakuna rekodi zinazolingana</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => {
            const Icon = TYPE_ICON[r.type] ?? User;
            return (
              <div key={r.id} className={`rounded-xl bg-white border shadow-sm p-4 ${r.status==="active" ? "border-red-200" : "border-gray-100"}`}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ background: (TYPE_COLOR[r.type] ?? "#999") + "15" }}>
                    <Icon size={18} style={{ color: TYPE_COLOR[r.type] ?? "#999" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[14px] font-black text-gray-900">{r.identifier}</p>
                        {r.title && <p className="text-[12px] text-gray-500">{r.title}</p>}
                        <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-gray-400">
                          <span className="font-mono">{r.case_no}</span>
                          {r.last_seen_location && <><span>·</span><MapPin size={10} className="inline" /><span>{r.last_seen_location}</span></>}
                          {r.reported_date && <><span>·</span><Clock size={10} className="inline" /><span>{new Date(r.reported_date).toLocaleDateString("sw-TZ")}</span></>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${STATUS_COLOR[r.status] ?? "bg-gray-100 text-gray-500"}`}>
                          {STATUS_LABEL[r.status] ?? r.status}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                          style={{ background: (TYPE_COLOR[r.type]??"#999")+"15", color: TYPE_COLOR[r.type]??"#999" }}>
                          {TYPE_LABEL[r.type] ?? r.type}
                        </span>
                      </div>
                    </div>
                    {r.status === "active" && (
                      <button onClick={() => markFound(r.id)}
                        className="mt-2 flex items-center gap-1 rounded-lg bg-green-500 px-3 py-1 text-[11px] font-bold text-white">
                        <CheckCircle size={11} /> Imeopatikana
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-black text-gray-900">Ripoti ya Kutoweka</h3>
              <button onClick={() => setShowAdd(false)} className="rounded-xl p-1.5 hover:bg-gray-100"><X size={18}/></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Aina</label>
                <div className="flex gap-2">
                  {["person","car","device"].map(t => (
                    <button key={t} onClick={() => setForm(f => ({...f, type:t}))}
                      className={`flex-1 rounded-xl py-2 text-[12px] font-bold transition ${form.type===t ? "bg-[#1E3A8A] text-white" : "bg-gray-100 text-gray-500"}`}>
                      {TYPE_LABEL[t]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                  {form.type === "person" ? "Jina la Mtu" : form.type === "car" ? "Namba ya Gari" : "Maelezo ya Kifaa"} *
                </label>
                <input value={form.identifier} onChange={e => setForm(f => ({...f, identifier:e.target.value}))}
                  placeholder={form.type === "person" ? "Jina kamili" : form.type === "car" ? "T 123 ABC" : "Samsung Galaxy A54"}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#2196F3]" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Mahali pa Mwisho Kuonekana</label>
                <input value={form.last_seen_location} onChange={e => setForm(f => ({...f, last_seen_location:e.target.value}))}
                  placeholder="e.g. Kariakoo, Dar es Salaam"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#2196F3]" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Maelezo Zaidi</label>
                <textarea value={form.details} onChange={e => setForm(f => ({...f, details:e.target.value}))}
                  placeholder="Maelezo ya ziada..."
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#2196F3] resize-none" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-[13px] font-bold text-gray-500">Ghairi</button>
              <button onClick={handleAdd} disabled={!form.identifier.trim() || saving}
                className="flex-1 rounded-xl bg-[#EF4444] py-2.5 text-[13px] font-bold text-white disabled:opacity-50">
                {saving ? "Inahifadhi..." : "Hifadhi Ripoti"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
