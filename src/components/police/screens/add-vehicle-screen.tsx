// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Car, CheckCircle, AlertCircle, Loader2, WifiOff, CloudUpload, RefreshCw } from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { useOfficer } from "@/hooks/use-officer";
import { validatePlate, validateMobile, validateLicense, newVehicleRecords } from "@/lib/police-helpers";
import { toast } from "@/hooks/use-toast";
import { DatePicker } from "@/components/police/ui/date-picker";
import { saveWithOfflineSupport, initAutoSync, subscribeToSyncStatus, type SyncStatus } from "@/lib/offline-sync";

const VEHICLE_TYPES = ["Saloon", "SUV", "Pick Up", "Minibus", "Lori", "Bajaji", "Pikipiki", "Basila"];
const INSURANCE_COS = ["Jubilee Insurance", "GA Insurance", "Strategies Insurance", "Alliance Insurance", "Heritage Insurance", "UAP Insurance", "ICEA Lion", "Madison Insurance"];
const COLORS = ["Nyeupe", "Nyeusi", "Fedha", "Nyekundu", "Bluu", "Kijani", "Kahawia", "Dhahabu", "Njano", "Pinki"];

// Common vehicle makes/models in Tanzania
const VEHICLE_MAKES_MODELS = [
  // Toyota
  "Toyota Corolla", "Toyota Land Cruiser", "Toyota Hiace", "Toyota Mark II",
  "Toyota Premio", "Toyota RAV4", "Toyota Hilux", "Toyota Fielder", "Toyota Noah", "Toyota Alphard",
  // Suzuki
  "Suzuki Maruti", "Suzuki Swift", "Suzuki Alto", "Suzuki Every",
  // Honda
  "Honda Fit", "Honda CR-V", "Honda Accord", "Honda Civic",
  // Nissan
  "Nissan Sunny", "Nissan Note", "Nissan X-Trail", "Nissan Navara", "Nissan Caravan",
  // Mitsubishi
  "Mitsubishi Lancer", "Mitsubishi Canter", "Mitsubishi Pajero", "Mitsubishi Fuso",
  // Others
  "Isuzu Elf", "Isuzu NQR", "Mazda BT-50", "Subaru Forester", "Subaru Impreza",
  "Foton", "Daihatsu Hijet", "Hino", "Volvo FH", "Scania", "Mercedes Actros",
  // Bajaji/Pikipiki
  "TVS Apache", "Bajaj Boxer", "Honda Motorcycle", "Yamaha Motorcycle", "Piaggio",
];

export function AddVehicleScreen() {
  const OFFICER = useOfficer();
  const { goBack, searchQuery } = usePoliceStore();
  const [saved, setSaved] = useState(false);
  const [savedRecord, setSavedRecord] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Offline sync state
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    pending: 0,
    lastSynced: null,
    isOnline: true,
    isSyncing: false,
  });
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // State for Make/Model dropdown
  const [makeModelOpen, setMakeModelOpen] = useState(false);
  const [makeModelSearch, setMakeModelSearch] = useState("");
  const [isOtherModel, setIsOtherModel] = useState(false);

  // Initialize auto-sync on mount
  useEffect(() => {
    initAutoSync();
    const unsubscribe = subscribeToSyncStatus((status) => {
      setSyncStatus(status);
      setIsOfflineMode(!status.isOnline || status.pending > 0);
    });
    return unsubscribe;
  }, []);

  const [form, setForm] = useState({
    plate: searchQuery?.toUpperCase() ?? "",
    model: "", type: "Saloon", color: "Nyeupe", year: new Date().getFullYear().toString(),
    ownerName: "", ownerNida: "", ownerPhone: "", ownerLicense: "",
    insuranceCompany: "Jubilee Insurance", insurancePolicy: "", insuranceExpiry: "",
    inspectionExpiry: "", registrationExpiry: "",
    notes: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // NIDA formatting helper
  const formatNida = (input: string): string => {
    const digits = input.replace(/\D/g, "");
    const truncated = digits.slice(0, 20);
    const parts = [
      truncated.slice(0, 4), truncated.slice(4, 8), truncated.slice(8, 12),
      truncated.slice(12, 16), truncated.slice(16, 20),
    ];
    return parts.filter(Boolean).join("-");
  };

  const handleNidaChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: formatNida(e.target.value) }));
  };

  // Validate NIDA
  const validateNida = (v: string): { valid: boolean; error?: string } => {
    if (!v?.trim()) return { valid: true }; // Optional field
    const digits = v.replace(/\D/g, "");
    if (digits.length !== 20) return { valid: false, error: `NIDA lazima iwe nambari 20 (una ${digits.length})` };
    return { valid: true };
  };

  const validate = () => {
    const e: Record<string, string> = {};
    const plateR = validatePlate(form.plate);
    if (!plateR.valid) e.plate = plateR.error;
    if (!form.model.trim()) e.model = "Chagua au ingiza mfano wa gari";
    
    const nidaR = validateNida(form.ownerNida);
    if (!nidaR.valid) e.ownerNida = nidaR.error;
    
    if (form.ownerPhone) { const r = validateMobile(form.ownerPhone); if (!r.valid) e.ownerPhone = r.error; }
    if (form.ownerLicense) { const r = validateLicense(form.ownerLicense); if (!r.valid) e.ownerLicense = r.error; }
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
        plate: form.plate.toUpperCase(),
        model: form.model,
        type: form.type,
        color: form.color,
        year: form.year,
        ownerName: form.ownerName || "Haijajulikana",
        ownerNida: form.ownerNida.replace(/\D/g, ""), // Clean digits only
        ownerPhone: form.ownerPhone,
        ownerLicense: form.ownerLicense?.toUpperCase(),
        station: OFFICER.station,
        addedBy: OFFICER.shortName,
        officerId: OFFICER.id,
        insuranceCompany: form.insuranceCompany,
        insurancePolicy: form.insurancePolicy,
        insuranceExpiry: form.insuranceExpiry || null,
        inspectionExpiry: form.inspectionExpiry || null,
        registrationExpiry: form.registrationExpiry || null,
        notes: form.notes,
      };

      // Use enhanced offline sync - tries API first, falls back to IndexedDB queue
      const result = await saveWithOfflineSupport("/api/vehicles", payload, "POST");

      const rec = { 
        id: result.data?.id || `VEH-${Date.now()}`, 
        plate: form.plate.toUpperCase(),
        model: form.model,
        ownerName: form.ownerName || "Haijajulikana",
        addedBy: OFFICER.shortName,
        station: OFFICER.station,
        cached: result.fromCache, // Mark if saved locally
      };
      
      newVehicleRecords.unshift({ id: rec.id, plate: rec.plate });
      setSavedRecord(rec);
      setSaved(true);
      
      if (result.fromCache) {
        toast({ 
          title: "Gari Limesajiliwa (Hifadhi ya Kawaida) 💾", 
          description: "Data imehifadhiwa kawaida. Itasasishwa mara tu utakapoweka mtandao.",
          variant: "default",
          duration: 5000,
        });
      } else {
        toast({ 
          title: "Gari Limesajiliwa ✓", 
          description: `${rec.plate} imehifadhiwa kwenye database. ID: ${rec.id}` 
        });
      }
    } catch (error: any) {
      console.error("Save vehicle error:", error);
      
      toast({ 
        title: "Hitilafu katika Hifadhi ❌", 
        description: error.message || "Imeshindikana kuhifadhi taarifa za gari. Tena.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Filter make/model options
  const filteredMakes = VEHICLE_MAKES_MODELS.filter(option =>
    option.toLowerCase().includes(makeModelSearch.toLowerCase())
  );

  if (saved && savedRecord) {
    return (
      <div className="min-h-full bg-police p-4">
        <div className="flex flex-col items-center py-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#10B981]/15">
            <CheckCircle size={44} className="text-[#10B981]" />
          </div>
          <h2 className="mt-4 text-[20px] font-bold text-police">Gari Limesajiliwa</h2>
          <p className="mt-1 text-center text-[13px] text-police-muted">Taarifa za gari zimehifadhiwa kwenye mfumo.</p>
          <div className="mt-6 w-full rounded-2xl bg-police-card p-4 shadow-sm space-y-2.5">
            <div className="inline-block rounded-lg border-2 border-[#1E3A8A] bg-yellow-50 px-4 py-1.5 text-[20px] font-extrabold tracking-widest text-police-navy">{savedRecord.plate}</div>
            <Row label="ID ya Rekodi" value={savedRecord.id} bold />
            <Row label="Mfano" value={savedRecord.model} />
            <Row label="Mmiliki" value={savedRecord.ownerName} />
            <Row label="Imehifadhiwa na" value={savedRecord.addedBy} />
            <Row label="Kituo" value={savedRecord.station} />
            <Row label="Jumla ya Magari Yaliyoongezwa Leo" value={String(newVehicleRecords.length)} />
            {savedRecord.cached && (
              <Row label="Hali" value="⏳ Inasubiri usasishaji" bold />
            )}
          </div>
          <div className="mt-4 w-full space-y-2">
            <button onClick={() => { 
              setSaved(false); 
              setForm({ 
                plate: "", model: "", type: "Saloon", color: "Nyeupe", year: new Date().getFullYear().toString(), 
                ownerName: "", ownerNida: "", ownerPhone: "", ownerLicense: "", 
                insuranceCompany: "Jubilee Insurance", insurancePolicy: "", insuranceExpiry: "", 
                inspectionExpiry: "", registrationExpiry: "", notes: "" 
              }); 
              setErrors({}); 
              setIsOtherModel(false); 
            }} className="w-full rounded-xl border border-police py-3 text-[14px] font-semibold text-police">Sajili Gari Jingine</button>
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
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15"><Car size={20} className="text-white" /></div>
          <div>
            <h1 className="text-[18px] font-bold text-white">Sajili Gari Jipya</h1>
            <p className="text-[11px] text-white/70">Gari hili halijasajiliwa mfumoni - ongeza sasa</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 pb-8">
        {/* Vehicle info */}
        <Section title="Taarifa za Gari" color="#1E3A8A">
          <FI label="Namba ya Gari (Plate)" required value={form.plate} onChange={set("plate")} placeholder="T 001 ABC" error={errors.plate} upper />
          
          {/* MAKE/MODEL - DROPDOWN WITH "OTHER" OPTION */}
          <div className="relative">
            <label className="mb-1 block text-[12px] font-medium text-police-muted">
              Mfano (Make/Model) <span className="text-[#EF4444]">*</span>
            </label>
            
            {isOtherModel ? (
              /* Manual entry mode */
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.model}
                  onChange={set("model")}
                  placeholder="Ingiza make/model manual..."
                  className={`flex-1 rounded-xl border bg-police-input px-3 h-10 text-[13px] text-police placeholder:text-police-faint focus:outline-none ${
                    errors.model ? "border-[#EF4444]" : "border-[#FF9800] focus:border-[#FF9800]"
                  }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => { setIsOtherModel(false); setMakeModelOpen(true); }}
                  className="px-3 rounded-xl border border-[#2196F3] bg-[#2196F3]/10 text-[11px] font-semibold text-[#2196F3]"
                >
                  Orodha
                </button>
              </div>
            ) : (
              /* Dropdown mode */
              <>
                <button
                  type="button"
                  onClick={() => setMakeModelOpen(!makeModelOpen)}
                  className={`relative flex w-full items-center gap-2 rounded-xl border bg-police-input px-3 h-10 ${
                    errors.model ? "border-[#EF4444]" : form.model ? "border-[#10B981]" : "border-police focus:border-[#1E3A8A]"
                  }`}
                >
                  <Car size={14} className={form.model ? "text-[#1E3A8A]" : "text-police-faint"} />
                  <span className={`flex-1 text-left text-[13px] ${form.model ? "font-medium text-police" : "text-police-faint"}`}>
                    {form.model || "Chagua Make/Model"}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 12 12" className={`text-police-faint transition ${makeModelOpen ? "rotate-180" : ""}`}>
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {makeModelOpen && (
                  <div className="absolute z-50 mt-1 w-full rounded-xl border border-police bg-police-card shadow-lg max-h-56 overflow-hidden">
                    {/* Search */}
                    <div className="p-2 border-b border-police-soft">
                      <input
                        type="text"
                        value={makeModelSearch}
                        onChange={(e) => setMakeModelSearch(e.target.value)}
                        placeholder="Tafuta make/model..."
                        className="w-full rounded-lg border border-police bg-police-input px-3 py-2 text-[12px] text-police placeholder:text-police-faint focus:outline-none"
                        autoFocus
                      />
                    </div>

                    {/* Options */}
                    <div className="max-h-40 overflow-y-auto p-1">
                      {filteredMakes.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setForm((f) => ({ ...f, model: option }));
                            setMakeModelOpen(false);
                            setMakeModelSearch("");
                          }}
                          className={`block w-full text-left px-3 py-2 rounded-lg text-[12px] transition ${
                            form.model === option ? "bg-[#1E3A8A]/10 font-bold text-[#1E3A8A]" : "text-police hover:bg-police-muted"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                      
                      {/* Other option */}
                      <button
                        type="button"
                        onClick={() => { setIsOtherModel(true); setMakeModelOpen(false); }}
                        className="block w-full text-left px-3 py-2 mt-1 rounded-lg text-[12px] font-semibold text-[#2196F3] border-t border-police-soft pt-2 hover:bg-[#2196F3]/5"
                      >
                        + Ingiza Mwingine (Manual)
                      </button>

                      {filteredMakes.length === 0 && (
                        <p className="px-3 py-3 text-[11px] text-center text-police-faint">
                          Hakuna matokeo. Chagua &quot;+ Ingiza Mwingine&quot;
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
            {errors.model && !isOtherModel && <p className="mt-1 text-[10px] text-[#EF4444]">{errors.model}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FS label="Aina" value={form.type} onChange={set("type")} options={VEHICLE_TYPES} />
            <FS label="Rangi" value={form.color} onChange={set("color")} options={COLORS} />
          </div>
          
          {/* Year - Number input with reasonable range */}
          <FI label="Mwaka wa Usajili" value={form.year} onChange={set("year")} placeholder="2020" inputMode="numeric" />
        </Section>

        {/* Owner info */}
        <Section title="Taarifa za Mmiliki" color="#1E3A8A">
          <FI label="Jina la Mmiliki" value={form.ownerName} onChange={set("ownerName")} placeholder="Jina kamili" />
          
          {/* OWNER NIDA - FORMATTED */}
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">NIDA ya Mmiliki</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={form.ownerNida}
                onChange={handleNidaChange("ownerNida")}
                placeholder="0000-0000-0000-0000-00"
                className={`w-full rounded-xl border bg-police-input px-3 h-10 text-[13px] font-mono tracking-wider text-police placeholder:text-police-faint focus:outline-none ${
                  errors.ownerNida 
                    ? "border-[#EF4444]" 
                    : form.ownerNida.replace(/\D/g, "").length === 20 && form.ownerNida.length > 0
                    ? "border-[#10B981]"
                    : "border-police focus:border-[#1E3A8A]"
                }`}
              />
              {form.ownerNida.replace(/\D/g, "").length === 20 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#10B981] text-sm">✓</span>
              )}
            </div>
            {errors.ownerNida && <p className="mt-1 text-[10px] text-[#EF4444]">{errors.ownerNida}</p>}
            {!errors.ownerNida && form.ownerNida && form.ownerNida.replace(/\D/g, "").length > 0 && form.ownerNida.replace(/\D/g, "").length < 20 && (
              <p className="mt-0.5 text-[9px] text-[#FF9800]">
                Nambari ya NIDA: {form.ownerNida.replace(/\D/g, "").length}/20 tarakimu
              </p>
            )}
          </div>
          
          <FI label="Simu ya Mmiliki" value={form.ownerPhone} onChange={set("ownerPhone")} placeholder="0712 345 678" error={errors.ownerPhone} inputMode="tel" />
          <FI label="Namba ya Leseni" value={form.ownerLicense} onChange={set("ownerLicense")} placeholder="DL001001TZ" error={errors.ownerLicense} upper />
        </Section>

        {/* Insurance - WITH DATE PICKERS */}
        <Section title="Bima na Usajili" color="#10B981">
          <FS label="Kampuni ya Bima" value={form.insuranceCompany} onChange={set("insuranceCompany")} options={INSURANCE_COS} />
          <FI label="Namba ya Polisi ya Bima" value={form.insurancePolicy} onChange={set("insurancePolicy")} placeholder="JUB-2026-00001" />
          
          <div className="grid grid-cols-2 gap-3">
            {/* DATE PICKERS instead of text inputs */}
            <DatePicker
              label="Bima Inamalizika"
              value={form.insuranceExpiry}
              onChange={(val) => setForm((f) => ({ ...f, insuranceExpiry: val }))}
              minDate={new Date().toISOString().split('T')[0]}
            />
            <DatePicker
              label="Ukaguzi Unamalizika"
              value={form.inspectionExpiry}
              onChange={(val) => setForm((f) => ({ ...f, inspectionExpiry: val }))}
              minDate={new Date().toISOString().split('T')[0]}
            />
          </div>
          <DatePicker
            label="Usajili Unamalizika"
            value={form.registrationExpiry}
            onChange={(val) => setForm((f) => ({ ...f, registrationExpiry: val }))}
            minDate={new Date().toISOString().split('T')[0]}
          />
        </Section>

        {/* Notes */}
        <Section title="Maelezo ya Ziada" color="#FF9800">
          <textarea rows={3} value={form.notes} onChange={set("notes")} placeholder="Maelezo mengine yoyote kuhusu gari hili..." className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
        </Section>

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
              <Car size={16} /> Hifadhi Taarifa za Gari
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="tpf-card p-4">
      <h3 className="mb-3 text-[14px] font-bold text-police" style={{ borderLeft: `3px solid ${color}`, paddingLeft: "8px" }}>{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function FI({ label, required, value, onChange, placeholder, error, upper, inputMode }: { 
  label: string; 
  required?: boolean; 
  value: string; 
  onChange: React.ChangeEventHandler<HTMLInputElement>; 
  placeholder?: string; 
  error?: string; 
  upper?: boolean;
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
        className={`w-full rounded-xl border bg-police-input px-3 h-10 text-[13px] text-police placeholder:text-police-faint focus:outline-none ${error ? "border-[#EF4444]" : "border-police focus:border-[#1E3A8A]"} ${upper ? "uppercase" : ""}`} 
      />
      {error && <div className="mt-1 flex items-center gap-1"><AlertCircle size={11} className="text-[#EF4444]" /><p className="text-[10px] text-[#EF4444]">{error}</p></div>}
    </div>
  );
}

function FS({ label, value, onChange, options }: { label: string; value: string; onChange: React.ChangeEventHandler<HTMLSelectElement>; options: string[] }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-medium text-police-muted">{label}</label>
      <select value={value} onChange={onChange} className="w-full rounded-xl border border-police bg-police-input px-3 h-10 text-[13px] text-police focus:outline-none">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
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
