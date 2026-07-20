// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, User, CheckCircle, AlertCircle, Loader2, WifiOff, CloudUpload, RefreshCw } from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { useOfficer } from "@/hooks/use-officer";
import { validateName, validateMobile, newCitizenRecords } from "@/lib/police-helpers";
import { validateNidaFormatted } from "@/components/police/ui/nida-input";
import { toast } from "@/hooks/use-toast";
import { TZ_ALL_REGIONS, districtsForRegion } from "@/lib/tz-locations";
import { DatePicker } from "@/components/police/ui/date-picker";
import { saveWithOfflineSupport, initAutoSync, subscribeToSyncStatus, type SyncStatus } from "@/lib/offline-sync";

const OCCUPATIONS = ["Mfanyabiashara", "Mwalimu", "Dereva", "Mhudumu wa Afya", "Mwanafunzi", "Fundi", "Mkulima", "Mfanyakazi wa Serikali", "Mwandishi", "Daktari", "Mkandarasi", "Nyingine"];

export function AddCitizenScreen() {
  const OFFICER = useOfficer();
  const { goBack, searchQuery, citizenSearchType } = usePoliceStore();
  const [saved, setSaved] = useState(false);
  const [savedRecord, setSavedRecord] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
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

  // Pre-fill from search query based on what tab was active
  const prefillName   = citizenSearchType === "name"   ? (searchQuery ?? "") : "";
  const prefillNida   = citizenSearchType === "nida"   ? (searchQuery ?? "") : "";
  const prefillMobile = citizenSearchType === "mobile" ? (searchQuery ?? "") : "";

  // Format prefill NIDA if exists
  const formatPrefillNida = (nida: string): string => {
    if (!nida) return "";
    const digits = nida.replace(/\D/g, "");
    if (digits.length !== 20) return nida;
    return `${digits.slice(0,4)}-${digits.slice(4,8)}-${digits.slice(8,12)}-${digits.slice(12,16)}-${digits.slice(16,20)}`;
  };

  const [form, setForm] = useState({
    name: prefillName, 
    nida: formatPrefillNida(prefillNida), 
    mobile: prefillMobile,
    gender: "Mme", 
    dob: "", 
    region: "", 
    district: "", 
    ward: "", 
    address: "", 
    occupation: "Mfanyabiashara", 
    notes: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    const nameR = validateName(form.name);
    if (!nameR.valid) e.name = nameR.error;
    
    // Validate NIDA with new formatted validation
    if (form.nida) { 
      const r = validateNidaFormatted(form.nida); 
      if (!r.valid) e.nida = r.error; 
    }
    
    if (form.mobile) { const r = validateMobile(form.mobile); if (!r.valid) e.mobile = r.error; }
    if (!form.region) e.region = "Chagua mkoa wa makazi";
    if (!form.ward.trim() && !form.address.trim()) e.address = "Jaza kata/mtaa au anwani";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ENHANCED: Save with offline sync support (IndexedDB queue)
  const handleSave = async () => {
    if (!validate()) { 
      toast({ title: "Rekebisha makosa", description: "Jaza sehemu zote sahihi.", variant: "destructive" }); 
      return; 
    }

    setIsSaving(true);

    try {
      // Prepare payload with officer metadata
      const payload = {
        name: form.name.trim(),
        nida: form.nida.replace(/\D/g, ""), // Send clean digits only
        mobile: form.mobile.trim(),
        gender: form.gender,
        dob: form.dob || null,
        address: [form.address.trim(), form.ward.trim() && `Kata ${form.ward.trim()}`, form.district, form.region]
          .filter(Boolean).join(", "),
        occupation: form.occupation,
        notes: form.notes,
        officerId: OFFICER.id,
        station: OFFICER.station,
      };

      // Use enhanced offline sync - tries API first, falls back to IndexedDB queue
      const result = await saveWithOfflineSupport("/api/citizens", payload, "POST");

      const rec = { 
        id: result.data?.id || `CIT-${Date.now()}`, 
        name: form.name,
        nida: form.nida,
        mobile: form.mobile,
        address: [form.address, form.ward, form.district, form.region].filter(Boolean).join(", "),
        addedBy: OFFICER.shortName,
        cached: result.fromCache, // Mark if saved locally
      };
      
      newCitizenRecords.unshift({ id: rec.id, name: rec.name });
      setSavedRecord(rec);
      setSaved(true);
      
      if (result.fromCache) {
        toast({ 
          title: "Raia Amesajiliwa (Hifadhi ya Kawaida) 💾", 
          description: "Data imehifadhiwa kawaida. Itasasishwa mara tu utakapoweka mtandao.",
          variant: "default",
          duration: 5000,
        });
      } else {
        toast({ 
          title: "Raia Amesajiliwa ✓", 
          description: `${rec.name} amehifadhiwa kwenye database. ID: ${rec.id}` 
        });
      }
    } catch (error: any) {
      console.error("Save citizen error:", error);
      
      toast({ 
        title: "Hitilafu katika Hifadhi ❌", 
        description: error.message || "Imeshindikana kuhifadhi taarifa za raia. Tena.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (saved && savedRecord) {
    return (
      <div className="min-h-full bg-police p-4">
        <div className="flex flex-col items-center py-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#10B981]/15">
            <CheckCircle size={44} className="text-[#10B981]" />
          </div>
          <h2 className="mt-4 text-[20px] font-bold text-police">Raia Amesajiliwa</h2>
          <p className="mt-1 text-center text-[13px] text-police-muted">Taarifa za raia zimehifadhiwa kwenye mfumo.</p>
          <div className="mt-6 w-full rounded-2xl bg-police-card p-4 shadow-sm space-y-2.5">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-[#1E3A8A]/10 text-[22px] font-bold text-[#1E3A8A]">
              {savedRecord.name.charAt(0)}
            </div>
            <Row label="ID ya Rekodi" value={savedRecord.id} bold />
            <Row label="Jina" value={savedRecord.name} />
            <Row label="NIDA" value={savedRecord.nida || "Haijaingizwa"} />
            <Row label="Simu" value={savedRecord.mobile || "Haijaingizwa"} />
            <Row label="Makazi" value={savedRecord.address} />
            <Row label="Imehifadhiwa na" value={savedRecord.addedBy} />
            <Row label="Jumla ya Raia Waliooongezwa" value={String(newCitizenRecords.length)} />
            {savedRecord.cached && (
              <Row label="Hali" value="⏳ Inasubiri usasishaji" bold />
            )}
          </div>
          <div className="mt-4 w-full space-y-2">
            <button onClick={() => { 
              setSaved(false); 
              setForm({ 
                name: "", nida: "", mobile: "", gender: "Mme", dob: "", region: "", district: "", ward: "", address: "", occupation: "Mfanyabiashara", notes: "" 
              }); 
              setErrors({}); 
            }} className="w-full rounded-xl border border-police py-3 text-[14px] font-semibold text-police">Sajili Raia Mwingine</button>
            <button onClick={() => goBack()} className="w-full rounded-xl bg-[#1E3A8A] py-3 text-[14px] font-bold text-white">Rudi Nyuma</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-police">
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2196F3] px-4 py-4">
        <button onClick={() => goBack()} className="mb-3 flex items-center gap-2 text-white/80">
          <ArrowLeft size={18} /> <span className="text-[13px]">Rudi</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15"><User size={20} className="text-white" /></div>
          <div>
            <h1 className="text-[18px] font-bold text-white">Sajili Raia Mpya</h1>
            <p className="text-[11px] text-white/70">Mtu huyu hayupo kwenye mfumo - ongeza sasa</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 pb-8">
        {/* Personal info */}
        <div className="rounded-2xl bg-police-card p-4 shadow-sm space-y-3">
          <h3 className="text-[14px] font-bold text-police" style={{ borderLeft: "3px solid #1E3A8A", paddingLeft: "8px" }}>Taarifa Binafsi</h3>
          
          {/* Name */}
          <FI label="Jina Kamili" required value={form.name} onChange={set("name")} placeholder="Jina na jina la ukoo" error={errors.name} />
          
          {/* NIDA - Now with proper formatting */}
          <NidaInputField
            value={form.nida}
            onChange={(val) => setForm((f) => ({ ...f, nida: val }))}
            error={errors.nida}
          />
          
          {/* Phone */}
          <FI label="Namba ya Simu" value={form.mobile} onChange={set("mobile")} placeholder="0712 345 678" error={errors.mobile} inputMode="tel" />
          
          <div className="grid grid-cols-2 gap-3">
            {/* Gender dropdown */}
            <div>
              <label className="mb-1 block text-[12px] font-medium text-police-muted">Jinsia</label>
              <select value={form.gender} onChange={set("gender")} className="w-full rounded-xl border border-police bg-police-input px-3 h-10 text-[13px] text-police focus:outline-none">
                <option value="Mme">Mme</option>
                <option value="Mke">Mke</option>
              </select>
            </div>
            
            {/* Date of Birth - NOW A DATE PICKER */}
            <DatePicker
              label="Tarehe ya Kuzaliwa"
              value={form.dob}
              onChange={(val) => setForm((f) => ({ ...f, dob: val }))}
              maxDate={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Makazi: Mkoa (dropdown) -> Wilaya (dropdown) -> Kata/Mtaa (manual) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-police-muted">Mkoa <span className="text-[#EF4444]">*</span></label>
              <select value={form.region}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value, district: "" }))}
                className="w-full rounded-xl border border-police bg-police-input px-3 h-10 text-[13px] text-police focus:outline-none">
                <option value="">— Chagua —</option>
                {TZ_ALL_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.region && <p className="mt-0.5 text-[10px] text-[#EF4444]">{errors.region}</p>}
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-police-muted">Wilaya</label>
              <select value={form.district} onChange={set("district")} disabled={!form.region}
                className="w-full rounded-xl border border-police bg-police-input px-3 h-10 text-[13px] text-police focus:outline-none disabled:opacity-50">
                <option value="">{form.region ? "— Chagua —" : "Mkoa kwanza"}</option>
                {districtsForRegion(form.region).map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          
          <FI label="Kata / Mtaa" value={form.ward} onChange={set("ward")} placeholder="e.g. Mwenge, Sam Nujoma" error={errors.address} />
          <FI label="Anwani ya Ziada" value={form.address} onChange={set("address")} placeholder="Nyumba na. / maelezo zaidi" />
          
          {/* Occupation dropdown */}
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Kazi / Shughuli</label>
            <select value={form.occupation} onChange={set("occupation")} className="w-full rounded-xl border border-police bg-police-input px-3 h-10 text-[13px] text-police focus:outline-none">
              {OCCUPATIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Maelezo / Madokezo</label>
            <textarea rows={3} value={form.notes} onChange={set("notes")} placeholder="Maelezo ya ziada kuhusu raia huyu..." className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
          </div>
        </div>

        {/* Required fields notice */}
        <div className="flex items-start gap-2.5 rounded-2xl border border-[#FF9800]/30 bg-[#FF9800]/5 p-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-[#FF9800]" />
          <div>
            <p className="text-[12px] font-bold text-[#FF9800]">Muhimu</p>
            <p className="text-[11px] text-police-muted">Jina kamili na makazi ni lazima. NIDA na simu ni bora kuwa nazo lakini si lazima.</p>
          </div>
        </div>

        {/* Sync Status Indicator - Shows when offline or pending items */}
        {(isOfflineMode || syncStatus.pending > 0) && (
          <div className={`rounded-2xl border p-4 flex items-center gap-3 ${
            syncStatus.isSyncing 
              ? "border-[#2196F3]/30 bg-[#2196F3]/5" 
              : syncStatus.isOnline 
                ? "border-[#FF9800]/30 bg-[#FF9800]/5"
                : "border-[#EF4444]/30 bg-[#EF4444]/5"
          }`}>
            {syncStatus.isSyncing ? (
              <RefreshCw size={18} className="text-[#2196F3] animate-spin shrink-0" />
            ) : syncStatus.isOnline ? (
              <CloudUpload size={18} className="text-[#FF9800] shrink-0" />
            ) : (
              <WifiOff size={18} className="text-[#EF4444] shrink-0" />
            )}
            <div className="flex-1">
              <p className={`text-[12px] font-bold ${
                syncStatus.isSyncing ? "text-[#2196F3]" :
                syncStatus.isOnline ? "text-[#FF9800]" : "text-[#EF4444]"
              }`}>
                {syncStatus.isSyncing ? "Inasasisha data..." :
                 syncStatus.isOnline ? `Data ${syncStatus.pending} inasubiri kusasishwa` :
                 "Hakuna Mtandao — Hifadhi ya Kawaida"}
              </p>
              <p className="text-[10px] text-police-muted">
                {!syncStatus.isOnline ? "Data itasasishwa mara tu utakapoweka mtandao." :
                 syncStatus.pending > 0 ? "Bofya kusasisha sasa" : "Yote imesasishwa"}
              </p>
            </div>
            {syncStatus.pending > 0 && syncStatus.isOnline && !syncStatus.isSyncing && (
              <button
                onClick={() => {
                  import("@/lib/offline-sync").then(({ processSyncQueue }) => {
                    processSyncQueue().then(({ success, failed }) => {
                      toast({
                        title: "Matokeo ya Usasishaji",
                        description: `Mafanikio: ${success}, Mashindwa: ${failed}`,
                      });
                    });
                  });
                }}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-[#1E3A8A] text-white text-[11px] font-semibold active:scale-95 transition-transform"
              >
                Sasa Sasisha
              </button>
            )}
          </div>
        )}

        <div className="rounded-2xl border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 p-4">
          <p className="text-[12px] font-medium text-police-muted">Afisa Anayesajili</p>
          <p className="mt-1 text-[15px] font-bold text-[#1E3A8A]">{OFFICER.shortName}</p>
          <p className="text-[11px] text-police-muted">{OFFICER.id} • {OFFICER.station}</p>
          {syncStatus.lastSynced && (
            <p className="mt-1 text-[9px] text-police-faint">
              Iliyopita iliyosasilishwa: {new Date(syncStatus.lastSynced).toLocaleString("sw-TZ")}
            </p>
          )}
        </div>

        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className={`w-full rounded-xl py-3.5 text-[15px] font-bold text-white shadow-md active:scale-[0.98] flex items-center justify-center gap-2 ${
            isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-[#1E3A8A]"
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Inahifadhi...
            </>
          ) : (
            <>
              <User size={16} /> Hifadhi Taarifa za Raia
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Form Input Component
function FI({ label, required, value, onChange, placeholder, error, inputMode }: { 
  label: string; 
  required?: boolean; 
  value: string; 
  onChange: React.ChangeEventHandler<HTMLInputElement>; 
  placeholder?: string; 
  error?: string;
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
        className={`w-full rounded-xl border bg-police-input px-3 h-10 text-[13px] text-police placeholder:text-police-faint focus:outline-none ${error ? "border-[#EF4444]" : "border-police focus:border-[#1E3A8A]"}`} 
      />
      {error && <div className="mt-1 flex items-center gap-1"><AlertCircle size={11} className="text-[#EF4444]" /><p className="text-[10px] text-[#EF4444]">{error}</p></div>}
    </div>
  );
}

// NIDA Input Field using our custom component
function NidaInputField({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const [focused, setFocused] = useState(false);

  const formatNida = (input: string): string => {
    const digits = input.replace(/\D/g, "");
    const truncated = digits.slice(0, 20);
    const parts = [
      truncated.slice(0, 4),
      truncated.slice(4, 8),
      truncated.slice(8, 12),
      truncated.slice(12, 16),
      truncated.slice(16, 20),
    ];
    return parts.filter(Boolean).join("-");
  };

  const isValid = (val: string): boolean => {
    return val.replace(/\D/g, "").length === 20;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(formatNida(e.target.value));
  };

  return (
    <div>
      <label className="mb-1 block text-[12px] font-medium text-police-muted">
        Namba ya NIDA
      </label>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="0000-0000-0000-0000-00"
          className={`w-full rounded-xl border bg-police-input px-3 h-10 text-[13px] font-mono tracking-wider text-police placeholder:text-police-faint focus:outline-none ${
            error
              ? "border-[#EF4444]"
              : isValid(value) && value.length > 0
              ? "border-[#10B981]"
              : "border-police focus:border-[#1E3A8A]"
          }`}
        />
        {isValid(value) && !focused && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#10B981] text-sm">✓</span>
        )}
      </div>
      {error && (
        <div className="mt-1 flex items-center gap-1">
          <AlertCircle size={11} className="text-[#EF4444]" />
          <p className="text-[10px] text-[#EF4444]">{error}</p>
        </div>
      )}
      {!error && value.length > 0 && !isValid(value) && (
        <p className="mt-0.5 text-[9px] text-[#FF9800]">
          Nambari ya NIDA inahitaji tarakimu 20 ({value.replace(/\D/g, "").length}/20)
        </p>
      )}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between py-1 border-b border-police-soft last:border-0">
      <span className="text-[12px] text-police-muted">{label}</span>
      <span className={`text-[12px] ${bold ? "font-bold text-[#10B981]" : "font-medium text-police"}`}>{value}</span>
    </div>
  );
}
