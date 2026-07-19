"use client";

import { useState, useMemo } from "react";
import {
  Search, X, Plus, CheckCircle, Clock, AlertTriangle,
  User, Phone, MapPin, Calendar, FileText, Shield,
  ChevronRight, UserCheck, UserX, RefreshCw,
} from "lucide-react";
import { DETAINED_CITIZENS } from "@/lib/police-data";
import { toast } from "@/hooks/use-toast";
import { usePoliceStore } from "@/store/police-store";

const STATUS_MAP = {
  held:         { label:"Kizuizini",   color:"#EF4444", bg:"#FEF2F2" },
  released:     { label:"Ameachiwa",   color:"#10B981", bg:"#F0FDF4" },
  charged:      { label:"Ameshtakiwa", color:"#1E3A8A", bg:"#EFF6FF" },
  investigating:{ label:"Uchunguzi",   color:"#FF9800", bg:"#FFF7ED" },
} as const;

type Status = keyof typeof STATUS_MAP;

interface DetainedRecord {
  id: string; fullName: string; nida: string; dob: string; gender: string;
  address: string; phone: string; occupation: string;
  reason: string; type: string; cell: string;
  detainedDate: string; detainedTime: string;
  courtDate: string; nextOfKin: string; lawyer: string;
  medicalStatus: string; officer: string; station: string;
  status: Status; notes?: string;
}

// Merge static DETAINED_CITIZENS with any newly added
const BASE: DetainedRecord[] = (DETAINED_CITIZENS as unknown as DetainedRecord[]);

const EMPTY_FORM: Omit<DetainedRecord,"id"> = {
  fullName:"", nida:"", dob:"", gender:"Mme", address:"", phone:"", occupation:"",
  reason:"", type:"arrested", cell:"", detainedDate:"", detainedTime:"",
  courtDate:"", nextOfKin:"", lawyer:"", medicalStatus:"Nzuri",
  officer:"", station:"", status:"held",
};

export function DetainedCitizensScreen() {
  const { authRole } = usePoliceStore();
  const [records, setRecords]     = useState<DetainedRecord[]>(BASE);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState<"all"|Status>("all");
  const [selected, setSelected]   = useState<DetainedRecord|null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState<Omit<DetainedRecord,"id">>(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);

  const isCommander = ["NATIONAL_COMMANDER","REGIONAL_COMMANDER","DISTRICT_COMMANDER",
    "STATION_COMMANDER","SUPER_ADMIN","DIG"].includes(authRole ?? "");

  const filtered = useMemo(() => {
    let r = records;
    if (filter !== "all") r = r.filter(c => c.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(c =>
        c.fullName.toLowerCase().includes(q) ||
        c.reason.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.nida.toLowerCase().includes(q) ||
        c.cell.toLowerCase().includes(q)
      );
    }
    return r;
  }, [records, filter, search]);

  const counts = {
    all: records.length,
    held: records.filter(r=>r.status==="held").length,
    released: records.filter(r=>r.status==="released").length,
    charged: records.filter(r=>r.status==="charged").length,
    investigating: records.filter(r=>r.status==="investigating").length,
  };

  const setF = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  // Add new detained person
  async function handleAdd() {
    if (!form.fullName || !form.reason) {
      toast({ title:"Kosa", description:"Jaza jina na sababu.", variant:"destructive" }); return;
    }
    setSaving(true);
    const now = new Date();
    const newRecord: DetainedRecord = {
      ...form,
      id: `DET-${Date.now()}`,
      detainedDate: form.detainedDate || now.toLocaleDateString("sw-TZ"),
      detainedTime: form.detainedTime || now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false}),
    };
    try {
      await fetch("/api/arrests", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          suspectName: form.fullName, suspectNida: form.nida,
          suspectPhone: form.phone, offense: form.reason,
          location: form.address, cell: form.cell,
          nextOfKin: form.nextOfKin, lawyer: form.lawyer, notes: form.notes,
        }),
      });
    } catch { /* offline — local only */ }
    setRecords(r => [newRecord, ...r]);
    setShowForm(false);
    setForm(EMPTY_FORM);
    setSaving(false);
    toast({ title:`${form.fullName} Amesajiliwa ✓`, description:`Chumba: ${form.cell || "Hajapewa"}` });
  }

  // Release / update status
  async function handleStatusChange(id: string, newStatus: Status, reason?: string) {
    try {
      await fetch(`/api/arrests/${id}`, {
        method: "PATCH", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ status: newStatus, notes: reason }),
      });
    } catch { /* offline */ }
    setRecords(r => r.map(rec => rec.id === id ? { ...rec, status: newStatus } : rec));
    setSelected(s => s ? { ...s, status: newStatus } : null);
    toast({
      title: newStatus==="released" ? "Ameachiwa Huru ✓" : newStatus==="charged" ? "Ameshtakiwa ✓" : "Hali Imebadilishwa ✓",
      description: `Rekodi imesasishwa`,
    });
  }

  // ── Detail view ─────────────────────────────────────────────────────────
  if (selected) {
    const st = STATUS_MAP[selected.status];
    return (
      <div className="space-y-4 p-4 pb-8">
        <div className="flex items-center justify-between">
          <button onClick={() => setSelected(null)}
            className="flex items-center gap-1.5 text-[13px] font-medium text-[#2196F3]">
            ← Rudi kwenye Orodha
          </button>
          <span className="rounded-full px-3 py-1 text-[11px] font-bold text-white"
            style={{ backgroundColor: st.color }}>{st.label}</span>
        </div>

        {/* Header card */}
        <div className="rounded-2xl bg-[#1E3A8A] p-5 text-white">
          <div className="flex items-center gap-4">
            <img src={avatarUrl(selected.fullName)} alt={selected.fullName}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-white/30"/>
            <div>
              <h2 className="text-[18px] font-bold">{selected.fullName}</h2>
              <p className="text-[12px] text-white/70">{selected.id} · Chumba {selected.cell || "—"}</p>
              <p className="text-[11px] text-white/50">{selected.reason}</p>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            ["NIDA", selected.nida], ["Simu", selected.phone],
            ["Tarehe ya Kuzaliwa", selected.dob], ["Jinsia", selected.gender],
            ["Makazi", selected.address], ["Kazi", selected.occupation],
            ["Alipokamatwa", `${selected.detainedDate} ${selected.detainedTime}`],
            ["Afisa Aliyemkamata", selected.officer || "—"],
            ["Hali ya Kiafya", selected.medicalStatus], ["Chumba", selected.cell || "—"],
            ["Tarehe ya Mahakama", selected.courtDate || "—"], ["Ndugu", selected.nextOfKin || "—"],
            ["Mwanasheria", selected.lawyer || "—"], ["Sababu", selected.reason],
          ].map(([l,v]) => (
            <div key={l} className="rounded-xl bg-police-muted p-2.5">
              <p className="text-[9px] font-bold uppercase tracking-wide text-police-faint">{l}</p>
              <p className="mt-0.5 text-[11px] font-medium text-police">{v}</p>
            </div>
          ))}
        </div>

        {/* Action buttons — commanders only */}
        {isCommander && (
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-police-faint">Vitendo vya Kamanda</p>
            <div className="grid grid-cols-2 gap-2">
              {selected.status !== "released" && (
                <button onClick={() => handleStatusChange(selected.id,"released","Ameachiwa na Kamanda")}
                  className="tpf-btn tpf-btn-success w-full">
                  <UserCheck size={14}/> Achilia Huru
                </button>
              )}
              {selected.status === "held" && (
                <button onClick={() => handleStatusChange(selected.id,"charged")}
                  className="tpf-btn tpf-btn-primary w-full">
                  <Shield size={14}/> Mshtaki
                </button>
              )}
              {selected.status !== "investigating" && selected.status !== "released" && (
                <button onClick={() => handleStatusChange(selected.id,"investigating")}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#FF9800] py-2.5 text-[12px] font-bold text-white">
                  <Search size={14}/> Uchunguzi
                </button>
              )}
              <button onClick={() => { window.print(); }}
                className="flex items-center justify-center gap-2 rounded-xl border border-police py-2.5 text-[12px] font-semibold text-police col-span-2">
                <FileText size={14}/> Chapisha Rekodi
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Add form ─────────────────────────────────────────────────────────────
  if (showForm) {
    return (
      <div className="space-y-4 p-4 pb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-police">Sajili Mfungwa Mpya</h2>
          <button onClick={() => setShowForm(false)} className="rounded-lg p-1.5 text-police-faint"><X size={18}/></button>
        </div>

        {[
          ["Jina Kamili *", "text", "fullName", "Juma Khamis Mwinyi"],
          ["NIDA", "text", "nida", "199012031234567"],
          ["Tarehe ya Kuzaliwa", "date", "dob", ""],
          ["Simu", "tel", "phone", "0712 345 678"],
          ["Makazi", "text", "address", "Kariakoo, Ilala"],
          ["Kazi", "text", "occupation", "Mfanyabiashara"],
          ["Sababu ya Kizuizi *", "text", "reason", "Wizi wa gari"],
          ["Chumba / Cell", "text", "cell", "C-04"],
          ["Ndugu wa Karibu", "text", "nextOfKin", "Mama Juma — 0788 000 111"],
          ["Mwanasheria", "text", "lawyer", "Adv. Said Kombo"],
          ["Tarehe ya Mahakama", "date", "courtDate", ""],
          ["Afisa Aliyemkamata", "text", "officer", "Cprl. Juma Mwinyi"],
        ].map(([label, type, key, placeholder]) => (
          <div key={key as string}>
            <label className="tpf-label">{label as string}</label>
            <input type={type as string} value={(form as Record<string,string>)[key as string]}
              onChange={setF(key as keyof typeof form)}
              placeholder={placeholder as string}
              className="tpf-input"/>
          </div>
        ))}

        <div>
          <label className="tpf-label">Jinsia</label>
          <select value={form.gender} onChange={setF("gender")}
            className="tpf-select">
            <option value="Mme">Mme (Male)</option>
            <option value="Mke">Mke (Female)</option>
          </select>
        </div>

        <div>
          <label className="tpf-label">Hali ya Kiafya</label>
          <select value={form.medicalStatus} onChange={setF("medicalStatus")}
            className="tpf-select">
            {["Nzuri","Jeraha Ndogo","Jeraha Kubwa","Anahitaji Daktari"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={() => setShowForm(false)}
            className="tpf-btn tpf-btn-secondary flex-1">
            Ghairi
          </button>
          <button onClick={handleAdd} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] py-2.5 text-[13px] font-bold text-white disabled:opacity-50">
            {saving ? <RefreshCw size={14} className="animate-spin"/> : <Plus size={14}/>}
            Sajili Mfungwa
          </button>
        </div>
      </div>
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 p-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="tpf-section-title">Wafungwa</h1>
          <p className="text-[12px] text-police-muted">{counts.held} kizuizini · {records.length} jumla</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="tpf-btn tpf-btn-primary tpf-btn-sm">
          <Plus size={14}/> Ongeza
        </button>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {([
          ["Jumla",  counts.all,          "#1E3A8A"],
          ["Kizuizini", counts.held,      "#EF4444"],
          ["Uchunguzi",counts.investigating,"#FF9800"],
          ["Wameachiwa",counts.released,  "#10B981"],
        ] as const).map(([l,v,c]) => (
          <div key={l} className="rounded-xl bg-police-card p-2.5 text-center shadow-sm">
            <p className="text-[20px] font-bold" style={{ color: c }}>{v}</p>
            <p className="text-[9px] text-police-faint">{l}</p>
          </div>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {(["all","held","charged","investigating","released"] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`shrink-0 rounded-xl px-3 py-1.5 text-[11px] font-semibold transition ${
              filter===s ? "text-white shadow-sm" : "bg-police-card border border-police text-police-muted"
            }`}
            style={filter===s ? { backgroundColor: s==="all"?"#1E3A8A":STATUS_MAP[s as Status]?.color } : {}}>
            {s==="all" ? "Wote" : STATUS_MAP[s as Status]?.label} ({s==="all"?counts.all:(counts as Record<string,number>)[s]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl border border-police bg-police-card px-3 shadow-sm">
        <Search size={14} className="text-police-faint"/>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tafuta jina, NIDA, sababu, chumba..."
          className="h-9 flex-1 bg-transparent text-[12px] text-police placeholder:text-police-faint focus:outline-none"/>
        {search && <button onClick={() => setSearch("")}><X size={12} className="text-police-faint"/></button>}
      </div>

      {/* Table */}
      <div className="tpf-table-wrap">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead className="">
              <tr>
                {["Picha","Jina","ID","Sababu","Chumba","Afisa","Tarehe","Hali",""].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-[10px] font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-police-soft">
              {filtered.map(c => {
                const st = STATUS_MAP[c.status];
                return (
                  <tr key={c.id} className="hover:bg-police-muted transition cursor-pointer" onClick={() => setSelected(c)}>
                    <td className="px-3 py-2">
                      <img src={avatarUrl(c.fullName)} alt={c.fullName} className="h-8 w-8 rounded-full object-cover"/>
                    </td>
                    <td className="px-3 py-2 font-bold text-police whitespace-nowrap">{c.fullName}</td>
                    <td className="px-3 py-2 font-mono text-[9px] text-police-faint">{c.id}</td>
                    <td className="px-3 py-2 text-police-muted max-w-[120px] truncate">{c.reason}</td>
                    <td className="px-3 py-2 text-police-faint">{c.cell || "—"}</td>
                    <td className="px-3 py-2 text-police-muted whitespace-nowrap">{c.officer || "—"}</td>
                    <td className="px-3 py-2 text-police-faint whitespace-nowrap">{c.detainedDate}</td>
                    <td className="px-3 py-2">
                      <span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
                        style={{ backgroundColor: st.color }}>{st.label}</span>
                    </td>
                    <td className="px-2 py-2">
                      <ChevronRight size={14} className="text-police-faint"/>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-8 text-center text-[13px] text-police-faint">Hakuna rekodi zilizopatikana</div>
          )}
        </div>
      </div>
    </div>
  );
}
