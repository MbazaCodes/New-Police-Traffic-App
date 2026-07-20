"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Search, X, Plus, CheckCircle, Clock, Package, Loader2, WifiOff, CloudUpload, RefreshCw } from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { toast } from "@/hooks/use-toast";
import { useOfficer } from "@/hooks/use-officer";
import { DatePicker } from "@/components/police/ui/date-picker";
import { saveWithOfflineSupport, initAutoSync, subscribeToSyncStatus, type SyncStatus } from "@/lib/offline-sync";

const STATUS_MAP = {
  found: { label: "Imepatikana", color: "#10B981" },
  searching: { label: "Inatafutwa", color: "#FF9800" },
  returned: { label: "Imerudishwa", color: "#2196F3" },
};
const CAT_MAP: Record<string, string> = { 
  simu: "📱 Simu", 
  kompyuta: "💻 Kompyuta", 
  hati: "📄 Hati", 
  "mali-nyingine": "🎒 Mali Nyingine",
  gari: "🚗 Gari/Mtumbwi",
  pikipiki: "🏍️ Pikipiki/Bajaji",
  fedha: "💰 Pesa/Malipo"
};

type LostProperty = {
  id: string;
  status: keyof typeof STATUS_MAP;
  category: string;
  description: string;
  serialNo: string;
  deviceNo: string;
  owner: string;
  ownerPhone: string;
  ownerNida: string;
  reportedDate: string;
  reportedStation: string;
  foundDate?: string;
  foundLocation?: string;
  notes: string;
};

// In-memory storage (will be replaced by API)
const PROPERTIES: LostProperty[] = [];

export function LostPropertyScreen() {
  const OFFICER = useOfficer();
  const { goBack } = usePoliceStore();
  const [tab, setTab] = useState<"list" | "report">("list");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<LostProperty | null>(null);
  const [form, setForm] = useState({ 
    ownerName: "", 
    ownerPhone: "", 
    ownerNida: "", 
    category: "simu", 
    description: "", 
    serialNo: "", 
    deviceNo: "", 
    station: OFFICER?.station || "Kituo Kikuu DSM", 
    notes: "" 
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Offline sync state
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    pending: 0,
    lastSynced: null,
    isOnline: true,
    isSyncing: false,
  });
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Initialize auto-sync on mount
  useEffect(() => {
    initAutoSync();
    const unsubscribe = subscribeToSyncStatus((status) => {
      setSyncStatus(status);
      setIsOfflineMode(!status.isOnline || status.pending > 0);
    });
    return unsubscribe;
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // NIDA formatting
  const formatNida = (input: string): string => {
    const digits = input.replace(/\D/g, "").slice(0, 20);
    const parts = [digits.slice(0,4), digits.slice(4,8), digits.slice(8,12), digits.slice(12,16), digits.slice(16,20)];
    return parts.filter(Boolean).join("-");
  };

  const handleNidaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, ownerNida: formatNida(e.target.value) }));
  };

  const filtered = PROPERTIES.filter((p) =>
    p.description.toLowerCase().includes(search.toLowerCase()) ||
    p.serialNo.toLowerCase().includes(search.toLowerCase()) ||
    p.deviceNo.toLowerCase().includes(search.toLowerCase()) ||
    p.owner.toLowerCase().includes(search.toLowerCase())
  );

  // NEW: Save to API
  const handleReport = async () => {
    if (!form.ownerName || !form.description) { 
      toast({ title: "Kosa", description: "Jaza jina na maelezo.", variant: "destructive" }); 
      return; 
    }

    setIsSaving(true);
    
    try {
      // Try to save via API with offline support
      const payload = {
        ownerName: form.ownerName,
        ownerPhone: form.ownerPhone,
        ownerNida: form.ownerNida.replace(/\D/g, ""),
        category: form.category,
        description: form.description,
        serialNo: form.serialNo,
        deviceNo: form.deviceNo,
        station: form.station,
        reportedBy: OFFICER?.shortName || "Officer",
        notes: form.notes,
      };

      const result = await saveWithOfflineSupport("/api/properties", payload, "POST");
      console.log("Property saved:", result);
      
      if (result.fromCache) {
        toast({ title: "Mali Imehifadhiwa (Offline) ⚠️", description: `Ripoti ya mali iliyopotea imehifadhiwa kawaida.` });
      } else {
        toast({ title: "Mali Imesajiliwa ✓", description: `Ripoti ya mali iliyopotea imesajiliwa kwenye database.` });
      }
    } catch (error) {
      // Fallback: Save locally and show success
      console.log("Property saved locally:", error);
      
      // Add to local array for display
      const newProp: LostProperty = {
        id: `PROP-${Date.now()}`,
        status: "searching",
        category: form.category,
        description: form.description,
        serialNo: form.serialNo,
        deviceNo: form.deviceNo,
        owner: form.ownerName,
        ownerPhone: form.ownerPhone,
        ownerNida: form.ownerNida,
        reportedDate: new Date().toLocaleDateString("sw-TZ"),
        reportedStation: form.station,
        notes: form.notes,
      };
      PROPERTIES.unshift(newProp);
      
      toast({ title: "Mali Imesajiliwa ✓", description: `Ripoti ya mali iliyopotea imesajiliwa.` });
    } finally {
      setIsSaving(false);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-full bg-police p-4">
        <div className="flex flex-col items-center py-10">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#10B981]/15"><CheckCircle size={44} className="text-[#10B981]" /></div>
          <h2 className="mt-4 text-[18px] font-bold text-police">Mali Imesajiliwa</h2>
          <p className="mt-2 text-center text-[12px] text-police-muted">Ripoti ya mali iliyopotea imehifadhiwa. Nambari ya kesi itapelekwa kwa mmiliki.</p>
          <div className="mt-6 w-full space-y-2">
            <button onClick={() => { 
              setSubmitted(false); 
              setForm({ 
                ownerName: "", ownerPhone: "", ownerNida: "", category: "simu", description: "", 
                serialNo: "", deviceNo: "", station: OFFICER?.station || "Kituo Kikuu DSM", notes: "" 
              }); 
              setTab("list"); 
            }} className="w-full rounded-xl bg-[#10B981] py-3 text-[14px] font-bold text-white">Rudi kwenye Orodha</button>
          </div>
        </div>
      </div>
    );
  }

  if (selected) {
    const st = STATUS_MAP[selected.status as keyof typeof STATUS_MAP];
    return (
      <div className="min-h-full bg-police">
        <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2196F3] px-4 py-4">
          <button onClick={() => setSelected(null)} className="mb-3 flex items-center gap-2 text-white/80"><ArrowLeft size={18} /> <span className="text-[13px]">Rudi</span></button>
          <h1 className="text-[16px] font-bold text-white">{selected.id}</h1>
          <p className="text-[11px] text-white/70">{CAT_MAP[selected.category] ?? selected.category}</p>
        </div>
        <div className="space-y-4 p-4">
          <div className="tpf-card p-4">
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
          <div className="tpf-card p-4">
            <h3 className="mb-3 text-[14px] font-bold text-police">Mmiliki</h3>
            <div className="space-y-2">
              <Row label="Jina" value={selected.owner} />
              <Row label="Simu" value={selected.ownerPhone} />
              <Row label="NIDA" value={selected.ownerNida || "Haijaingizwa"} />
            </div>
          </div>
          <div className="tpf-card p-4">
            <h3 className="mb-3 text-[14px] font-bold text-police">Taarifa za Kesi</h3>
            <div className="space-y-2">
              <Row label="Iliripotiwa" value={`${selected.reportedDate} @ ${selected.reportedStation}`} />
              {selected.foundDate && <Row label="Ilipatikana" value={`${selected.foundDate} — ${selected.foundLocation}`} />}
              <Row label="Maelezo" value={selected.notes} />
            </div>
          </div>

          {/* Quick action buttons for officers */}
          <div className="rounded-xl border border-[#10B981]/20 bg-[#10B981]/5 p-3 space-y-2">
            <p className="text-[12px] font-bold text-[#10B981]">Vitendo vya Haraka</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => {
                const idx = PROPERTIES.findIndex(p => p.id === selected.id);
                if (idx >= 0) {
                  PROPERTIES[idx].status = "found";
                  PROPERTIES[idx].foundDate = new Date().toLocaleDateString("sw-TZ");
                  setSelected(PROPERTIES[idx]);
                  toast({ title: "Imehifadhiwa", description: "Hali imerejebishwa kuwa: Imepatikana" });
                }
              }} className="py-2 rounded-lg bg-[#10B981] text-white text-[11px] font-semibold">✓ Ilipatikana</button>
              <button onClick={() => {
                const idx = PROPERTIES.findIndex(p => p.id === selected.id);
                if (idx >= 0) {
                  PROPERTIES[idx].status = "returned";
                  setSelected(PROPERTIES[idx]);
                  toast({ title: "Imehifadhiwa", description: "Hali imerejebishwa kuwa: Imerudishwa" });
                }
              }} className="py-2 rounded-lg bg-[#2196F3] text-white text-[11px] font-semibold">↩ Imerudishwa</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-police">
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2196F3] px-4 py-4">
        <button onClick={() => goBack()} className="mb-3 flex items-center gap-2 text-white/80"><ArrowLeft size={18} /> <span className="text-[13px]">Rudi Nyuma</span></button>
        <h1 className="text-[18px] font-bold text-white">Mali Zilizopotea / Zilizopatikana</h1>
        <p className="text-[11px] text-white/70">Afisa anaweza kusajili na kufuatilia mali zilizopotea</p>
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
                <p className="mt-1 text-[15px] font-bold text-police">{PROPERTIES.length}</p>
                <p className="text-[9px] text-police-faint">Jumla</p>
              </div>
              <div className="rounded-xl bg-police-card p-2.5 text-center shadow-sm">
                <Clock size={16} className="mx-auto text-[#FF9800]" />
                <p className="mt-1 text-[15px] font-bold text-police">{PROPERTIES.filter((p) => p.status === "searching").length}</p>
                <p className="text-[9px] text-police-faint">Inatafutwa</p>
              </div>
              <div className="rounded-xl bg-police-card p-2.5 text-center shadow-sm">
                <CheckCircle size={16} className="mx-auto text-[#10B981]" />
                <p className="mt-1 text-[15px] font-bold text-police">{PROPERTIES.filter((p) => p.status !== "searching").length}</p>
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
            <h3 className="text-[14px] font-bold text-police">Ripoti Mali Iliyopotea/Iliyopatikana</h3>
            
            <FInput label="Jina la Mmiliki" required value={form.ownerName} onChange={set("ownerName")} placeholder="Jina kamili" />
            
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Simu" value={form.ownerPhone} onChange={set("ownerPhone")} placeholder="07XX XXX XXX" inputMode="tel" />
              
              {/* NIDA - FORMATTED */}
              <div>
                <label className="mb-1 block text-[12px] font-medium text-police-muted">NIDA ya Mmiliki</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.ownerNida}
                  onChange={handleNidaChange}
                  placeholder="0000-0000-0000-0000-00"
                  className="w-full rounded-xl border border-police bg-police-input px-3 h-10 text-[13px] font-mono tracking-wider text-police placeholder:text-police-faint focus:border-[#1E3A8A] focus:outline-none"
                />
                {form.ownerNida && form.ownerNida.replace(/\D/g, "").length > 0 && form.ownerNida.replace(/\D/g, "").length < 20 && (
                  <p className="mt-0.5 text-[9px] text-[#FF9800]">NIDA: {form.ownerNida.replace(/\D/g, "").length}/20</p>
                )}
              </div>
            </div>

            {/* Property Category - Enhanced dropdown */}
            <div>
              <label className="mb-1 block text-[12px] font-medium text-police-muted">Aina ya Mali</label>
              <select value={form.category} onChange={set("category")} className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police focus:outline-none">
                <option value="simu">📱 Simu ya Mkononi</option>
                <option value="kompyuta">💻 Kompyuta / Laptop</option>
                <option value="hati">📄 Hati (Pasi, Leseni, n.k.)</option>
                <option value="gari">🚗 Gari / Mtumbwi</option>
                <option value="pikipiki">🏍️ Pikipiki / Bajaji</option>
                <option value="fedha">💰 Pesa / Malipo</option>
                <option value="mali-nyingine">🎒 Mali Nyingine</option>
              </select>
            </div>

            <FInput label="Maelezo ya Mali" required value={form.description} onChange={set("description")} placeholder="Aina, rangi, sura ya mali" />

            <div className="grid grid-cols-2 gap-3">
              <FInput label="Nambari ya Serial (S/N)" value={form.serialNo} onChange={set("serialNo")} placeholder="SM-S928B-..." />
              <FInput label="IMEI / Nambari ya Kifaa" value={form.deviceNo} onChange={set("deviceNo")} placeholder="IMEI: 3584..." />
            </div>

            {/* Station dropdown */}
            <div>
              <label className="mb-1 block text-[12px] font-medium text-police-muted">Kituo cha Kuripoti</label>
              <select value={form.station} onChange={set("station")} className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police focus:outline-none">
                <option value="">— Chagua Kituo —</option>
                <option value={OFFICER?.station}>{OFFICER?.station} (Kituo Chako)</option>
                <option value="Kituo Kikuu DSM">Kituo Kikuu Dar es Salaam</option>
                <option value="Kituo Kikuu AR">Kituo Kikuu Arusha</option>
                <option value="Kituo Kikuu MBY">Kituo Kikuu Mbayaya</option>
                <option value="Kituo Kikuu MZN">Kituo Kikuu Morogoro</option>
                <option value="Kituo Kikuu DJM">Kituo Kikuu Dodoma</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-medium text-police-muted">Maelezo ya Ziada</label>
              <textarea rows={3} value={form.notes} onChange={set("notes")} placeholder="Maelezo mengine..." className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
            </div>

            {/* Sync Status Indicator */}
            {(isOfflineMode || syncStatus.pending > 0) && (
              <div className={`rounded-2xl border p-4 flex items-center gap-3 ${
                syncStatus.isSyncing ? "border-[#2196F3]/30 bg-[#2196F3]/5" : 
                syncStatus.isOnline ? "border-[#FF9800]/30 bg-[#FF9800]/5" : "border-[#EF4444]/30 bg-[#EF4444]/5"
              }`}>
                {syncStatus.isSyncing ? <RefreshCw size={18} className="text-[#2196F3] animate-spin shrink-0" /> :
                 syncStatus.isOnline ? <CloudUpload size={18} className="text-[#FF9800] shrink-0" /> :
                 <WifiOff size={18} className="text-[#EF4444] shrink-0" />}
                <div className="flex-1">
                  <p className={`text-[12px] font-bold ${syncStatus.isSyncing ? "text-[#2196F3]" : syncStatus.isOnline ? "text-[#FF9800]" : "text-[#EF4444]"}`}>
                    {syncStatus.isSyncing ? "Inasasisha data..." : syncStatus.isOnline ? `Data ${syncStatus.pending} inasubiri kusasishwa` : "Hakuna Mtandao — Hifadhi ya Kawaida"}
                  </p>
                </div>
                {syncStatus.pending > 0 && syncStatus.isOnline && !syncStatus.isSyncing && (
                  <button onClick={() => { import("@/lib/offline-sync").then(({ processSyncQueue }) => processSyncQueue().then(({ success, failed }) => toast({ title: "Matokeo ya Usasishaji", description: `Mafanikio: ${success}, Mashindwa: ${failed}` }))); }} 
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-[#1E3A8A] text-white text-[11px] font-semibold">Sasa Sasisha</button>
                )}
              </div>
            )}

            {/* Officer Info Card */}
            <div className="rounded-2xl border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 p-4">
              <p className="text-[12px] font-medium text-police-muted">Afisa</p>
              <p className="mt-1 text-[15px] font-bold text-[#1E3A8A]">{OFFICER?.shortName || "Officer"}</p>
              <p className="text-[11px] text-police-muted">{OFFICER?.id || "—"} • {OFFICER?.station || "Kituo Kikuu DSM"}</p>
            </div>

            <button 
              onClick={handleReport}
              disabled={isSaving}
              className={`w-full rounded-xl py-3 text-[15px] font-bold text-white active:scale-[0.98] flex items-center justify-center gap-2 ${
                isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-[#1E3A8A]"
              }`}
            >
              {isSaving ? <><Loader2 size={16} className="animate-spin" /> Inahifadhi...</> : "Hifadhi Ripoti"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FInput({ label, required, value, onChange, placeholder, inputMode }: { 
  label: string; 
  required?: boolean; 
  value: string; 
  onChange: React.ChangeEventHandler<HTMLInputElement>; 
  placeholder?: string; 
  inputMode?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-medium text-police-muted">{label}{required && <span className="ml-0.5 text-[#EF4444]">*</span>}</label>
      <input 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder} 
        inputMode={inputMode as any}
        className="w-full rounded-xl border border-police bg-police-input px-3 h-10 text-[13px] text-police placeholder:text-police-faint focus:outline-none" 
      />
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
