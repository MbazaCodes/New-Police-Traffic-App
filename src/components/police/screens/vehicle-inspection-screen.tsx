// @ts-nocheck
"use client";

import { useOfficer } from "@/hooks/use-officer";
import { useState, useRef, useEffect } from "react";
import {
  Pencil,
  CheckCircle2,
  XCircle,
  Camera,
  Cloud,
  ShieldCheck,
  ShieldAlert,
  PenLine,
  Trash2,
  Loader2,
  WifiOff,
  CloudUpload,
  RefreshCw,
} from "lucide-react";
import { TopAppBar } from "../top-app-bar";
import { usePoliceStore } from "@/store/police-store";
import { useRecordsStore } from "@/store/records-store";
import { toast } from "@/hooks/use-toast";
import { DatePicker } from "@/components/police/ui/date-picker";
import { saveWithOfflineSupport, initAutoSync, subscribeToSyncStatus, type SyncStatus } from "@/lib/offline-sync";

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

export function VehicleInspectionScreen() {
  const OFFICER = useOfficer();
  const v = {} as Record<string,unknown>;
  const goBack = usePoliceStore((s) => s.goBack);
  const addInspection = useRecordsStore((s) => s.addInspection);

  // Offline sync state
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    pending: 0,
    lastSynced: null,
    isOnline: true,
    isSyncing: false,
  });
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [plate, setPlate] = useState(v.plate || "");
  const [model, setModel] = useState(v.model || "");
  const [color, setColor] = useState(v.color || "");
  const [owner, setOwner] = useState(v.owner || "");
  const [notes, setNotes] = useState("");
  const [overloaded, setOverloaded] = useState(false);
  const [result, setResult] = useState<"pass" | "fail" | null>(null);
  const [photos, setPhotos] = useState<{ label: string }[]>(v.photos?.map((p: any) => ({ label: p.label })) || []);
  const [signature, setSignature] = useState("J. Mwinyi");
  
  // New fields for better data capture
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [inspectionTime, setInspectionTime] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedRecord, setSavedRecord] = useState<any>(null);

  // Vehicle type dropdown
  const vehicleTypes = ["Saloon", "SUV", "Pick Up", "Minibus", "Lori", "Bajaji", "Pikipiki", "Basila", "Gari la Kazi"];
  const [vehicleType, setVehicleType] = useState("Saloon");
  
  // Color dropdown
  const colors = ["Nyeupe", "Nyeusi", "Fedha", "Nyekundu", "Bluu", "Kijani", "Kahawia", "Dhahabu", "Njano", "Pinki", "Rangi Nyingine"];

  // Make/Model dropdown state
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

  const now = new Date();
  const today = now.toLocaleDateString("sw-TZ", { day: "numeric", month: "long", year: "numeric" });
  const currentTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  // Default inspection items if not provided
  const defaultDocuments = [
    { label: "Leseni ya Uderevani", status: "Haijathibitishwa", pass: false },
    { label: "Usajili wa Gari", status: "Haijathibitishwa", pass: false },
    { label: "Bima", status: "Haijathibitishwa", pass: false },
    { label: "Ukaguzi ( Inspection Sticker)", status: "Haijathibitishwa", pass: false },
  ];

  const defaultMechanical = [
    { label: "Taa (Headlights)", status: "Haijathibitishwa", pass: false },
    { label: "Taa za Nyuma (Tail Lights)", status: "Haijathibitishwa", pass: false },
    { label: "Breki (Brakes)", status: "Haijathibitishwa", pass: false },
    { label: "Gurudumu (Tires)", status: "Haijathibitishwa", pass: false },
    { label: "Kioo cha Mbele (Windshield)", status: "Haijathibitishwa", pass: false },
    { label: "Wimbi la Kuzuia (Wipers)", status: "Haijathibitishwa", pass: false },
    {label: "Honi (Horn)", status: "Haijathibitishwa", pass: false },
    {label: "Mifuko ya Hewa (Seat Belts)", status: "Haijathibitishwa", pass: false },
  ];

  const documents = v.documents?.length ? v.documents : defaultDocuments;
  const mechanical = v.mechanical?.length ? v.mechanical : defaultMechanical;

  const documentsPass = documents.filter((d: any) => d.pass).length;
  const documentsTotal = documents.length;
  const mechanicalPass = mechanical.filter((m: any) => m.pass).length;
  const mechanicalTotal = mechanical.length;
  const allPass = documents.every((d: any) => d.pass) && mechanical.every((m: any) => m.pass);
  const computedResult: "pass" | "fail" =
    result ?? (allPass ? "pass" : "fail");

  // Filter make/model options
  const filteredMakes = VEHICLE_MAKES_MODELS.filter(option =>
    option.toLowerCase().includes(makeModelSearch.toLowerCase())
  );

  const addPhoto = () =>
    setPhotos((prev) => [...prev, { label: `Picha ${prev.length + 1}` }]);

  const clearSignature = () => {
    setSignature("");
    toast({ title: "Imefutwa", description: "Saini imefutwa." });
  };

  // ENHANCED: Save to API with offline sync support
  const handleSubmit = async () => {
    if (!plate.trim()) {
      toast({ title: "Kosa", description: "Ingiza namba ya gari (plate)", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    const inspectionData = {
      plate: plate.toUpperCase(),
      model: model || "Haijulikana",
      color: color || "Haijulikana",
      owner: owner || "Haijulikana",
      vehicleType,
      officerId: OFFICER.id,
      officerName: OFFICER.name,
      station: OFFICER.station,
      date: `${today} ${currentTime}`,
      inspectionDate,
      location: location || "Haijulikana",
      result: computedResult,
      documentsChecked: documentsTotal,
      mechanicalChecked: mechanicalTotal,
      documentsPass,
      mechanicalPass,
      overloaded,
      notes: notes || undefined,
      photosCount: photos.length,
      signature: signature || undefined,
    };

    // Add to local store
    addInspection(inspectionData);

    try {
      // Use enhanced offline sync - tries API first, falls back to IndexedDB queue
      const result = await saveWithOfflineSupport("/api/inspections", inspectionData, "POST");

      const rec = {
        id: result.data?.id || `INS-${Date.now()}`,
        plate: plate.toUpperCase(),
        result: computedResult,
        date: today,
        cached: result.fromCache,
      };

      setSavedRecord(rec);
      setSaved(true);

      if (result.fromCache) {
        toast({
          title: "Ukaguzi Umekamilika (Hifadhi ya Kawaida) 💾",
          description: "Ripoti ya ukaguzi wa gari imehifadhiwa kawaida. Itasasishawa mara tu utakapoweka mtandao.",
          duration: 5000,
        });
      } else {
        toast({ title: "Ukaguzi Umekamilika ✓", description: "Ripoti ya ukaguzi wa gari imehifadhiwa kwenye database." });
      }
    } catch (error: any) {
      console.error("Save inspection error:", error);
      toast({
        title: "Hitilafu katika Hifadhi ❌",
        description: error.message || "Imeshindikana kuhifadhi taarifa za ukaguzi.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Saved state view
  if (saved && savedRecord) {
    return (
      <div className="min-h-full bg-police p-4">
        <div className="flex flex-col items-center py-8">
          <div className={`flex h-20 w-20 items-center justify-center rounded-full ${savedRecord.result === 'pass' ? 'bg-[#10B981]/15' : 'bg-[#EF4444]/15'}`}>
            {savedRecord.result === 'pass' ? (
              <ShieldCheck size={44} className="text-[#10B981]" />
            ) : (
              <ShieldAlert size={44} className="text-[#EF4444]" />
            )}
          </div>
          <h2 className="mt-4 text-[20px] font-bold text-police">Ukaguzi Umekamilika</h2>
          <p className="mt-1 text-center text-[13px] text-police-muted">Ripoti ya ukaguzi wa gari imehifadhiwa.</p>
          
          <div className="mt-6 w-full rounded-2xl bg-police-card p-4 shadow-sm space-y-2.5">
            <div className="inline-block rounded-lg border-2 border-[#1E3A8A] bg-yellow-50 px-4 py-1.5 text-[18px] font-extrabold tracking-widest text-police-navy">
              {savedRecord.plate}
            </div>
            <Row label="ID ya Ukaguzi" value={savedRecord.id} bold />
            <Row label="Matokeo" value={savedRecord.result === 'pass' ? '✓ HALI SAHIHI' : '✗ LINA KASORO'} bold />
            <Row label="Tarehe" value={savedRecord.date} />
            <Row label="Afisa" value={OFFICER.shortName} />
            <Row label="Kituo" value={OFFICER.station} />
            {savedRecord.cached && (
              <Row label="Hali" value="⏳ Inasubiri usasishaji" bold />
            )}
          </div>
          
          <div className="mt-4 w-full space-y-2">
            <button onClick={() => { 
              setSaved(false); 
              setSavedRecord(null);
              setResult(null);
              setNotes("");
              setLocation("");
              setInspectionDate(new Date().toISOString().split('T')[0]);
            }} className="w-full rounded-xl border border-police py-3 text-[14px] font-semibold text-police">Fanya Ukaguzi Mwingine</button>
            <button onClick={() => goBack()} className="w-full rounded-xl bg-[#1E3A8A] py-3 text-[14px] font-bold text-white">Rudi Nyuma</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-police">
      <TopAppBar title="Ukaguzi wa Gari" subtitle="Jaza taarifa za ukaguzi wa halia ya gari" showBack />

      <div className="space-y-3 p-4 pb-8">
        {/* Vehicle Info Header */}
        <div className="tpf-card p-4">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    value={plate}
                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                    placeholder="Namba ya Gari (Plate)"
                    className="w-full rounded-md border-2 border-[#1E3A8A] bg-yellow-50 px-2.5 py-1 text-[16px] font-extrabold tracking-wider text-police-navy focus:outline-none"
                  />
                  
                  {/* Make/Model - WITH DROPDOWN AND "OTHER" OPTION */}
                  <div className="relative">
                    {isOtherModel ? (
                      /* Manual entry mode */
                      <div className="flex gap-2">
                        <input
                          value={model}
                          onChange={(e) => setModel(e.target.value)}
                          placeholder="Ingiza make/model manual..."
                          className="flex-1 rounded-md border border-[#FF9800] bg-police-input px-2 py-1 text-[13px] text-police focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => { setIsOtherModel(false); setMakeModelOpen(true); }}
                          className="px-2 rounded-md border border-[#2196F3] bg-[#2196F3]/10 text-[11px] font-semibold text-[#2196F3]"
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
                          className="flex w-full items-center gap-2 rounded-md border border-police bg-police-input px-2 py-1 text-left"
                        >
                          <span className={`flex-1 text-[13px] ${model ? "font-medium text-police" : "text-police-faint"}`}>
                            {model || "Chagua Make/Model"}
                          </span>
                          <svg width="12" height="12" viewBox="0 0 12 12" className={`text-police-faint transition ${makeModelOpen ? "rotate-180" : ""}`}>
                            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>

                        {makeModelOpen && (
                          <div className="absolute z-50 mt-1 w-full rounded-md border border-police bg-police-card shadow-lg max-h-48 overflow-hidden">
                            {/* Search */}
                            <div className="p-2 border-b border-police-soft">
                              <input
                                type="text"
                                value={makeModelSearch}
                                onChange={(e) => setMakeModelSearch(e.target.value)}
                                placeholder="Tafuta make/model..."
                                className="w-full rounded-md border border-police bg-police-input px-2 py-1.5 text-[11px] text-police focus:outline-none"
                                autoFocus
                              />
                            </div>

                            {/* Options */}
                            <div className="max-h-32 overflow-y-auto p-1">
                              {filteredMakes.map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => {
                                    setModel(option);
                                    setMakeModelOpen(false);
                                    setMakeModelSearch("");
                                  }}
                                  className={`block w-full text-left px-2 py-1.5 rounded text-[11px] transition ${
                                    model === option ? "bg-[#1E3A8A]/10 font-bold text-[#1E3A8A]" : "text-police hover:bg-police-muted"
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                              
                              {/* Other option */}
                              <button
                                type="button"
                                onClick={() => { setIsOtherModel(true); setMakeModelOpen(false); }}
                                className="block w-full text-left px-2 py-1.5 mt-1 rounded text-[11px] font-semibold text-[#2196F3] border-t border-police-soft pt-1 hover:bg-[#2196F3]/5"
                              >
                                + Ingiza Mwingine (Manual)
                              </button>

                              {filteredMakes.length === 0 && (
                                <p className="px-2 py-2 text-[10px] text-center text-police-faint">
                                  Hakuna matokeo. Chagua &quot;+ Ingiza Mwingine&quot;
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Color dropdown */}
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full rounded-md border border-police bg-police-input px-2 py-1 text-[13px] text-police focus:outline-none"
                  >
                    <option value="">— Chagua Rangi —</option>
                    {colors.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  {/* Vehicle Type */}
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full rounded-md border border-police bg-police-input px-2 py-1 text-[13px] text-police focus:outline-none"
                  >
                    {vehicleTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>

                  <input
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="Jina la Mmiliki"
                    className="w-full rounded-md border border-police bg-police-input px-2 py-1 text-[12px] text-police focus:outline-none"
                  />
                </div>
              ) : (
                <>
                  <span className="inline-block rounded-md border-2 border-[#1E3A8A] bg-yellow-50 px-2.5 py-1 text-[16px] font-extrabold tracking-wider text-police-navy">
                    {plate || "Bonyeza + kuongeza"}
                  </span>
                  <p className="mt-2 text-[13px] text-police-muted">
                    {model || "Mfano"} | {color || "Rangi"} | {vehicleType}
                  </p>
                </>
              )}
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#2196F3] px-2.5 py-1 text-[11px] font-semibold text-[#2196F3] active:scale-[0.97]"
            >
              <Pencil size={12} /> {isEditing ? "Kamilisha" : "Hariri"}
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-police-soft pt-3">
            {isEditing ? (
              <div className="col-span-2">
                <label className="mb-1 block text-[10px] text-police-faint">Mwenye Gari</label>
                <input
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full rounded-md border border-police bg-police-input px-2 py-1 text-[12px] text-police focus:outline-none"
                />
                
                {/* Location field */}
                <label className="mb-1 mt-2 block text-[10px] text-police-faint">Eneo la Ukaguzi</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Andika eneo..."
                  className="w-full rounded-md border border-police bg-police-input px-2 py-1 text-[12px] text-police focus:outline-none"
                />
              </div>
            ) : (
              <>
                <InfoRow label="Mwenye Gari" value={owner || "—"} />
                <InfoRow label="Eneo" value={location || "—"} />
              </>
            )}
            <InfoRow label="Aina ya Gari" value={vehicleType} />
            
            {/* Date picker for inspection date */}
            <div className="col-span-2 mt-1">
              <DatePicker
                label="Tarehe ya Ukaguzi"
                value={inspectionDate}
                onChange={setInspectionDate}
                maxDate={new Date().toISOString().split('T')[0]}
              />
            </div>

            <InfoRow label="Saa" value={currentTime} />
          </div>
        </div>

        {/* Section 1: Documents */}
        <ChecklistSection title="1. Hati na Vibali" items={documents} />

        {/* Section 2: Mechanical */}
        <ChecklistSection title="2. Halia ya Gari (Mechanical Condition)" items={mechanical} />
        
        <div className="rounded-b-2xl bg-police-card px-4 pb-4 -mt-3 pt-1 shadow-sm">
          <label className="mb-1 block text-[11px] font-medium text-police-muted">
            Maelezo ya Ziada (Kama kuna kasoro)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Andika maelezo ya kasoro au halisi nyingine..."
            className="w-full rounded-xl border border-police bg-police-input px-3 py-2 text-[12px] text-police placeholder:text-police-faint focus:outline-none"
          />
        </div>

        {/* Section 3: Load */}
        <div className="tpf-card p-4">
          <h3 className="mb-3 text-[14px] font-bold text-police-navy">3. Upakiaji (Load)</h3>
          <div className="grid grid-cols-3 gap-2">
            <LoadField label="Aina ya Mizigo" value="Abiria" />
            <LoadField label="Uzito (kg)" value="1200" />
            <LoadField label="Idadi ya Abiria" value="4" />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[12px] font-medium text-police">Je, upakiaji unazidi kiwango?</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOverloaded(false)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  !overloaded
                    ? "bg-[#10B981]/10 text-[#10B981]"
                    : "bg-police-muted text-police-faint"
                }`}
              >
                <CheckCircle2 size={14} /> Hapana
              </button>
              <button
                type="button"
                onClick={() => setOverloaded(true)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  overloaded
                    ? "bg-[#EF4444]/10 text-[#EF4444]"
                    : "bg-police-muted text-police-faint"
                }`}
              >
                <XCircle size={14} /> Ndio
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Photos */}
        <div className="tpf-card p-4">
          <h3 className="mb-1 text-[14px] font-bold text-police-navy">4. Picha / Uthibitisho</h3>
          <p className="mb-3 text-[10px] text-police-faint">
            Piga picha sehemu muhimu za gari (nje, ndani, namba ya usajili, kasoro n.k.)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {photos.map((photo, i) => (
              <div
                key={i}
                className="flex aspect-[4/3] flex-col items-center justify-center rounded-xl border-2 border-dashed border-police bg-police-muted"
              >
                <Camera size={20} className="text-police-faint" />
                <span className="mt-1 text-[9px] text-police-faint">{photo.label}</span>
              </div>
            ))}
          </div>
          <button
            onClick={addPhoto}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#2196F3]/40 py-2.5 text-[12px] font-semibold text-[#2196F3] active:scale-[0.98]"
          >
            <Cloud size={16} /> Ongeza Picha
          </button>
        </div>

        {/* Section 5: Results */}
        <div className="tpf-card p-4">
          <h3 className="mb-3 text-[14px] font-bold text-police-navy">5. Matokelo ya Ukaguzi</h3>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setResult("pass")}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 transition ${
                computedResult === "pass"
                  ? "border-[#10B981]/200 bg-[#10B981]/10"
                  : "border-police-soft bg-police-muted opacity-70"
              }`}
            >
              <ShieldCheck size={24} className="text-[#10B981]" />
              <div className="flex-1 text-left">
                <p className="text-[13px] font-bold text-[#10B981]">Gari Halina Kasoro Kubwa</p>
                <p className="text-[11px] text-police-muted">Gari linafaa kuendelea na safari</p>
              </div>
              <CheckCircle2 size={20} className={`text-[#10B981] ${computedResult === "pass" ? "" : "opacity-30"}`} />
            </button>
            <button
              type="button"
              onClick={() => setResult("fail")}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 transition ${
                computedResult === "fail"
                  ? "border-[#EF4444]/20 bg-[#EF4444]/10"
                  : "border-police-soft bg-police-muted opacity-70"
              }`}
            >
              <ShieldAlert size={24} className="text-[#EF4444]" />
              <div className="flex-1 text-left">
                <p className="text-[13px] font-bold text-[#EF4444]">Gari Lina Kasoro</p>
                <p className="text-[11px] text-police-muted">Lipaswe matengenezeko kabla ya kuendelea</p>
              </div>
              <div className={`h-5 w-5 rounded-full border-2 ${computedResult === "fail" ? "border-[#EF4444]/600 bg-[#EF4444]/600" : "border-gray-300"}`} />
            </button>
          </div>
        </div>

        {/* Section 6: Officer Signature */}
        <div className="tpf-card p-4">
          <h3 className="mb-3 text-[14px] font-bold text-police-navy">6. Saini ya Afisa</h3>
          <div className="grid grid-cols-2 gap-2">
            <LoadField label="Jina la Afisa" value={OFFICER.name} />
            <LoadField label="Namba ya Utambulisho" value={OFFICER.id} />
          </div>
          <div className="mt-3 rounded-xl border border-police bg-police-input p-4">
            <div className="flex items-center justify-between">
              <PenLine size={18} className="text-police-faint" />
              <button
                onClick={clearSignature}
                className="text-[11px] font-medium text-police-faint active:opacity-70"
              >
                <Trash2 size={14} className="inline" /> Futa
              </button>
            </div>
            {signature ? (
              <p className="mt-6 text-right font-[cursive] text-[18px] italic text-police-navy">{signature}</p>
            ) : (
              <p className="mt-6 text-right text-[11px] italic text-police-faint">Saini imefutwa — tenwe upya</p>
            )}
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

        {/* Officer Info Card */}
        <div className="rounded-2xl border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 p-4">
          <p className="text-[12px] font-medium text-police-muted">Afisa Anayefanya Ukaguzi</p>
          <p className="mt-1 text-[15px] font-bold text-[#1E3A8A]">{OFFICER.shortName}</p>
          <p className="text-[11px] text-police-muted">{OFFICER.id} • {OFFICER.station}</p>
          {syncStatus.lastSynced && (
            <p className="mt-1 text-[9px] text-police-faint">
              Iliyopita iliyosasilishwa: {new Date(syncStatus.lastSynced).toLocaleString("sw-TZ")}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-bold text-white shadow-md active:scale-[0.98] ${
            isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#1E3A8A]"
          }`}
        >
          {isSubmitting ? <><Loader2 size={20} className="animate-spin" /> Inahifadhi...</> : <><CheckCircle2 size={20} /> Hifadhi na Kamaliza Ukaguzi</>}
        </button>
      </div>
    </div>
  );
}

function ChecklistSection({
  title,
  items,
}: {
  title: string;
  items: { label: string; status: string; pass: boolean }[];
}) {
  return (
    <div className="tpf-card p-4">
      <h3 className="mb-3 text-[14px] font-bold text-police-navy">{title}</h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border border-police-soft px-3 py-2"
          >
            <span className="flex-1 text-[12px] text-police">{item.label}</span>
            <span
              className={`flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                item.pass
                  ? "bg-[#10B981]/10 text-[#10B981]"
                  : "bg-[#FF9800]/50 text-[#FF9800]"
              }`}
            >
              {item.pass ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-police-faint">{label}</p>
      <p className="text-[12px] font-medium text-police">{value}</p>
    </div>
  );
}

function LoadField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium text-police-faint">{label}</label>
      <div className="flex items-center justify-between rounded-lg border border-police bg-police-input px-2.5 py-2">
        <span className="text-[12px] text-police">{value}</span>
        <svg width="10" height="10" viewBox="0 0 12 12" className="text-police-faint">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
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
