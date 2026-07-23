"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Car,
  User,
  Calendar,
  Clock,
  MapPin,
  Wallet,
  Save,
  Send,
  ChevronDown,
  Camera,
  UserCog,
  Info,
  Loader2,
  WifiOff,
  CloudUpload,
  RefreshCw,
} from "lucide-react";
import { TopAppBar } from "../top-app-bar";
import { OFFENSE_TYPES, VEHICLE_TYPES } from "@/lib/police-data";
import { usePoliceStore } from "@/store/police-store";
import { useRecordsStore } from "@/store/records-store";
import { toast } from "@/hooks/use-toast";
import { useOfficer } from "@/hooks/use-officer";
import { DatePicker } from "@/components/police/ui/date-picker";
import { saveWithOfflineSupport, initAutoSync, subscribeToSyncStatus, type SyncStatus } from "@/lib/offline-sync";

// Fine amounts by offense type (TZS)
const OFFENSE_FINES: Record<string, string> = {
  "Kupita kwa Taa Nyekundu": "TZS 50,000",
  "Kupita kwa Taa ya Zuia": "TZS 30,000",
  "Kudhibiti Gari Chini ya Uathirika wa Kileo": "TZS 50,000",
  "Kupita kwa Mstari wa Kuzuia": "TZS 40,000",
  "Kupita kwa Kasi Zaidi ya Iliyoidhinishwa": "TZS 100,000",
  "Kuendesha Gari bila Leseni": "TZS 150,000",
  "Gari lisilo na Bima": "TZS 200,000",
  "Usajili wa Gari Umeisha Muda": "TZS 80,000",
  "Ukaguzi wa Gari Umeisha Muda": "TZS 60,000",
  "Kutotumia Helmet/Mkanda": "TZS 30,000",
  "Matumizi ya Simu Wakati wa Kuendesha": "TZS 50,000",
  "Kuendesha Gari akiwa amelewa": "TZS 500,000",
  "Gari lenye Uharibifu wa Vifaa vya Usalama": "TZS 70,000",
  "Kupakia Zaidi ya Uwezo": "TZS 100,000",
  "Kutoa Njia kwa Magari ya Dharura": "TZS 80,000",
};

export function CitationScreen() {
  const OFFICER = useOfficer();
  const prefill = usePoliceStore((s) => s.citationPrefill);
  const goBack = usePoliceStore((s) => s.goBack);
  const addCitation = useRecordsStore((s) => s.addCitation);

  // Offline sync state
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    pending: 0,
    lastSynced: null,
    isOnline: true,
    isSyncing: false,
  });
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const [offense, setOffense] = useState("");
  const [vehicleType, setVehicleType] = useState(prefill?.vehicleType || "");
  const [offenseOpen, setOffenseOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);

  // Driver editable fields (in case driver != owner)
  const [driverName, setDriverName] = useState(prefill?.driverName || "");
  const [driverLicense, setDriverLicense] = useState(prefill?.driverLicense || "");
  const [driverPhone, setDriverPhone] = useState(prefill?.driverPhone || "");
  const [driverNida, setDriverNida] = useState(prefill?.driverNida || "");
  const [isOwner, setIsOwner] = useState(true);
  const [notes, setNotes] = useState("");
  
  // Date/Location fields (editable)
  const [citationDate, setCitationDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState("");
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedRecord, setSavedRecord] = useState<any>(null);

  // Initialize auto-sync on mount
  useEffect(() => {
    initAutoSync();
    const unsubscribe = subscribeToSyncStatus((status) => {
      setSyncStatus(status);
      setIsOfflineMode(!status.isOnline || status.pending > 0);
    });
    return unsubscribe;
  }, []);

  const hasPrefill = !!prefill;

  // Current date / time helpers
  const now = new Date();
  const today = now.toLocaleDateString("sw-TZ", { day: "numeric", month: "long", year: "numeric" });
  const currentTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  // Get fine amount based on offense type
  const getFineAmount = () => {
    if (!offense) return "TZS 50,000"; // Default
    return OFFENSE_FINES[offense] || "TZS 50,000";
  };

  // Generate citation number
  const generateCitationNumber = () => {
    const year = new Date().getFullYear();
    const random = String(Math.floor(1000 + Math.random() * 9000)).padStart(4, "0");
    return `CT-${year}-${random}`;
  };

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

  const handleNidaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDriverNida(formatNida(e.target.value));
  };

  const buildPayload = () => ({
    citationNumber: generateCitationNumber(),
    plate: prefill?.plate || "",
    model: prefill?.model || "",
    offense: offense || "Haijawazwa",
    driverName: driverName || "Haijawazwa",
    driverLicense: driverLicense || "—",
    driverPhone: driverPhone || "—",
    driverNida: driverNida.replace(/\D/g, "") || "",
    date: citationDate || today,
    time: currentTime,
    location: location || "Haijajulikana",
    amount: getFineAmount(),
    officerId: OFFICER.id,
    officerName: OFFICER.name,
    officer: OFFICER.name,
    station: OFFICER.station,
    notes: notes || undefined,
    status: "unpaid",
  });

  // ENHANCED: Save with offline sync support
  const handleSave = async () => {
    if (!offense) {
      toast({ title: "Kosa Haujajazwa", description: "Chagua aina ya kosa.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const payload = buildPayload();
    payload.status = "draft";
    addCitation(payload);

    try {
      const result = await saveWithOfflineSupport("/api/citations", payload, "POST");
      
      const rec = {
        id: result.data?.id || generateCitationNumber(),
        citationNumber: payload.citationNumber,
        plate: payload.plate,
        offense: payload.offense,
        amount: payload.amount,
        cached: result.fromCache,
      };
      
      setSavedRecord(rec);
      setSaved(true);
      
      if (result.fromCache) {
        toast({ 
          title: "Rasimu Imehifadhiwa (Hifadhi ya Kawaida) 💾", 
          description: "Data imehifadhiwa kawaida. Itasasishwa mara tu utakapoweka mtandao.",
          duration: 5000,
        });
      } else {
        toast({ title: "Imehifadhiwa ✓", description: "Rasimu ya Citation imehifadhiwa." });
      }
    } catch (error: any) {
      console.error("Save citation error:", error);
      toast({ 
        title: "Hitilafu katika Hifadhi ❌", 
        description: error.message || "Imeshindikana kuhifadhi taarifa za citation.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ENHANCED: Submit with offline sync support
  const handleSubmit = async () => {
    if (!offense) {
      toast({ title: "Kosa Haujajazwa", description: "Chagua aina ya kosa.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const payload = buildPayload();
    payload.status = "unpaid";
    addCitation(payload);

    try {
      const result = await saveWithOfflineSupport("/api/citations", payload, "POST");

      if (result.fromCache) {
        toast({
          title: "Citation Imetolewa (Hifadhi ya Kawaida) 📴",
          description: "Citation itakamilishwa mara tu utakapoweka mtandao.",
          duration: 5000,
        });
      } else {
        toast({
          title: "Citation Imetolewa ✓",
          description: "Citation imewasilishwa na imetumwa kwa dereva.",
        });
      }
      setTimeout(() => goBack(), 800);
    } catch (error: any) {
      console.error("Submit citation error:", error);
      toast({
        title: "Citation Imetolewa (Local)",
        description: "Data imehifadhiwa kawaida. Itakamilika mtandao.",
      });
      setTimeout(() => goBack(), 800);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Saved state view
  if (saved && savedRecord) {
    return (
      <div className="min-h-full bg-police p-4">
        <div className="flex flex-col items-center py-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#10B981]/15">
            <FileText size={44} className="text-[#10B981]" />
          </div>
          <h2 className="mt-4 text-[20px] font-bold text-police">Citation Imehifadhiwa</h2>
          <p className="mt-1 text-center text-[13px] text-police-muted">Taarifa za citation zimehifadhiwa kwenye mfumo.</p>
          
          <div className="mt-6 w-full rounded-2xl bg-police-card p-4 shadow-sm space-y-2.5">
            <div className="inline-block rounded-lg border-2 border-[#1E3A8A] bg-yellow-50 px-4 py-1.5 text-[18px] font-extrabold tracking-widest text-police-navy">
              {savedRecord.citationNumber}
            </div>
            <Row label="Namba ya Gari" value={savedRecord.plate} bold />
            <Row label="Aina ya Kosa" value={savedRecord.offense} />
            <Row label="Faini" value={savedRecord.amount} bold />
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
              setOffense(""); 
              setNotes("");
              setLocation("");
              setCitationDate(new Date().toISOString().split('T')[0]);
            }} className="w-full rounded-xl border border-police py-3 text-[14px] font-semibold text-police">Toa Citation Nyingine</button>
            <button onClick={() => goBack()} className="w-full rounded-xl bg-[#1E3A8A] py-3 text-[14px] font-bold text-white">Rudi Nyuma</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-police">
      <TopAppBar title="Toa Citation" subtitle="Jaza taarifa za kosa la trafiki" showBack />

      <div className="space-y-3 p-4 pb-8">
        {/* Prefill banner */}
        {hasPrefill && (
          <div className="flex items-start gap-2.5 rounded-xl border border-[#2196F3]/20 bg-[#2196F3]/5 p-3">
            <Info size={18} className="mt-0.5 shrink-0 text-[#2196F3]" />
            <div>
              <p className="text-[12px] font-bold text-police-navy">Taarifa Zimejazwa Otomatiki</p>
              <p className="text-[11px] text-police-muted">
                Taarifa za gari na dereva zimechukuliwa kutoka matokeo ya utafutaji. Badilisha taarifa za dereva kama
                si mwenye gari.
              </p>
            </div>
          </div>
        )}

        {/* Citation header */}
        <div className="flex items-center justify-between rounded-2xl bg-police-card p-4 shadow-sm">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-police-faint">Namba ya Citation</p>
            <p className="text-[15px] font-extrabold text-police-navy">{generateCitationNumber()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-police-faint">Afisa</p>
            <p className="text-[13px] font-semibold text-police">{OFFICER.shortName}</p>
          </div>
        </div>

        {/* Section: Vehicle (pre-filled, read-only plate) */}
        <Section title="Taarifa za Gari" icon={<Car size={16} />}>
          <div className="grid grid-cols-2 gap-2.5">
            <FormField label="Namba ya Usajili" value={prefill?.plate || ""} readOnly />
            <Dropdown
              label="Aina ya Gari"
              value={vehicleType}
              placeholder="Chagua aina"
              options={VEHICLE_TYPES}
              open={vehicleOpen}
              onToggle={() => setVehicleOpen(!vehicleOpen)}
              onSelect={(v) => {
                setVehicleType(v);
                setVehicleOpen(false);
              }}
            />
            <FormField label="Modeli" value={prefill?.model || ""} readOnly />
            <FormField label="Rangi" value={prefill?.color || ""} readOnly />
          </div>
        </Section>

        {/* Section: Driver (editable with NIDA format) */}
        <Section
          title="Taarifa za Dereva"
          icon={<UserCog size={16} />}
          badge={
            <span className="rounded-full bg-[#2196F3]/10 px-2 py-0.5 text-[9px] font-bold text-[#2196F3]">
              Inaweza kuhaririwa
            </span>
          }
        >
          {/* Owner toggle */}
          <div className="flex items-center justify-between rounded-xl bg-police-muted px-3 py-2.5">
            <span className="flex items-center gap-1.5 text-[12px] font-medium text-police">
              <User size={14} className="text-[#2196F3]" />
              Dereva ni mwenye gari?
            </span>
            <button
              onClick={() => setIsOwner(!isOwner)}
              className={`relative h-6 w-11 rounded-full transition ${isOwner ? "bg-[#10B981]" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                  isOwner ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {!isOwner && (
            <div className="rounded-xl border border-[#FF9800]/200 bg-[#FF9800]/50 p-2.5">
              <p className="text-[11px] font-medium text-[#FF9800]">
                Dereva sio mwenye gari. Badilisha taarifa za dereva hapa chini.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <EditableField
              label="Jina Kamili"
              value={driverName}
              onChange={setDriverName}
              placeholder="Jina la dereva"
              full
            />
            <EditableField
              label="Namba ya Leseni"
              value={driverLicense}
              onChange={setDriverLicense}
              placeholder="DL123456789TZ"
            />
            <EditableField
              label="Namba ya Simu"
              value={driverPhone}
              onChange={setDriverPhone}
              placeholder="07XX XXX XXX"
              inputMode="tel"
            />
            
            {/* NIDA - WITH FORMATTING */}
            <EditableField
              label="Namba ya NIDA"
              value={driverNida}
              onChange={(v) => setDriverNida(v)}
              placeholder="0000-0000-0000-0000-00"
              isNida
            />
          </div>
          
          {/* NIDA validation hint */}
          {driverNida && driverNida.replace(/\D/g, "").length > 0 && driverNida.replace(/\D/g, "").length < 20 && (
            <p className="mt-1 text-[9px] text-[#FF9800] pl-1">
              NIDA: {driverNida.replace(/\D/g, "").length}/20 tarakimu
            </p>
          )}
          {/* NIDA valid checkmark */}
          {driverNida && driverNida.replace(/\D/g, "").length === 20 && (
            <p className="mt-1 text-[9px] text-[#10B981] pl-1 flex items-center gap-1">
              ✓ NIDA Sahihi
            </p>
          )}
        </Section>

        {/* Section: Offense */}
        <Section title="Maelezo ya Kosa" icon={<FileText size={16} />}>
          <Dropdown
            label="Aina ya Kosa"
            value={offense}
            placeholder="Chagua kosa"
            options={OFFENSE_TYPES}
            open={offenseOpen}
            onToggle={() => setOffenseOpen(!offenseOpen)}
            onSelect={(v) => {
              setOffense(v);
              setOffenseOpen(false);
            }}
            full
          />
          
          {/* Date Picker instead of read-only text */}
          <DatePicker
            label="Tarehe ya Kosa"
            value={citationDate}
            onChange={(val) => setCitationDate(val)}
            maxDate={new Date().toISOString().split('T')[0]}
          />
          
          <div className="grid grid-cols-2 gap-2.5">
            <FormField label="Saa" value={currentTime} icon={<Clock size={14} />} readOnly />
            
            {/* Editable Location */}
            <EditableField
              label="Eneo"
              value={location}
              onChange={setLocation}
              placeholder="Andika eneo..."
              full={false}
            />
          </div>
          
          <div>
            <label className="mb-1 block text-[11px] font-medium text-police-muted">
              Maelezo ya Ziada
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Eleza kwa kifupi kilichotokea..."
              className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[12px] text-police placeholder:text-police-faint focus:border-[#1E3A8A] focus:outline-none"
            />
          </div>
        </Section>

        {/* Section: Fine - Dynamic based on offense */}
        <Section title="Faini na Malipo" icon={<Wallet size={16} />}>
          <div className="grid grid-cols-2 gap-2.5">
            <FormField 
              label="Kiasi cha Faini" 
              value={getFineAmount()} 
              icon={<Wallet size={14} />} 
              readOnly 
            />
            <div>
              <label className="mb-1 block text-[11px] font-medium text-police-muted">Hali ya Malipo</label>
              <div className="flex items-center gap-2 rounded-xl border border-police bg-police-input px-3">
                <span className="h-10 flex-1 text-[12px] font-semibold text-[#FF9800]">
                  Inasubiri Malipo
                </span>
                <ChevronDown size={14} className="text-police-faint" />
              </div>
            </div>
          </div>
          
          {/* Show selected offense details */}
          {offense && (
            <div className="rounded-lg bg-[#FFF7ED] border border-[#FF9800]/20 p-2.5">
              <p className="text-[11px] text-[#92400E]">
                <strong>Kosa:</strong> {offense} → <strong>Faini:</strong> {getFineAmount()}
              </p>
            </div>
          )}
        </Section>

        {/* Evidence */}
        <Section title="Ushahidi (Picha)" icon={<Camera size={16} />}>
          <button className="flex w-full flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-police bg-police-input py-5">
            <Camera size={24} className="text-police-faint" />
            <span className="text-[12px] font-medium text-police-muted">Ongeza picha za ushahidi</span>
            <span className="text-[9px] text-police-faint">JPG, PNG (Max 10MB)</span>
          </button>
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

        {/* Officer Info Card */}
        <div className="rounded-2xl border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 p-4">
          <p className="text-[12px] font-medium text-police-muted">Afisa Anayetoa Citation</p>
          <p className="mt-1 text-[15px] font-bold text-[#1E3A8A]">{OFFICER.shortName}</p>
          <p className="text-[11px] text-police-muted">{OFFICER.id} • {OFFICER.station}</p>
          {syncStatus.lastSynced && (
            <p className="mt-1 text-[9px] text-police-faint">
              Iliyopita iliyosasilishwa: {new Date(syncStatus.lastSynced).toLocaleString("sw-TZ")}
            </p>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-2.5 pt-1">
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-1 rounded-xl border-2 border-[#1E3A8A] bg-police-card py-3 text-[13px] font-bold text-police-navy active:scale-[0.98] flex items-center justify-center gap-1"
          >
            <Save size={16} /> Hifadhi Rasimu
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-[1.5] rounded-xl bg-[#1E3A8A] py-3 text-[13px] font-bold text-white shadow-md active:scale-[0.98] flex items-center justify-center gap-1"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Toa Citation
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  badge,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="tpf-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[14px] font-bold text-police-navy">
          <span className="text-police-navy">{icon}</span>
          {title}
        </h3>
        {badge}
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function FormField({
  label,
  value,
  placeholder,
  icon,
  readOnly = false,
  full = false,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  readOnly?: boolean;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="mb-1 block text-[11px] font-medium text-police-muted">{label}</label>
      <div
        className={`flex items-center gap-2 rounded-xl border border-police px-3 ${
          readOnly ? "bg-police-muted" : "bg-police-input"
        } focus-within:border-[#1E3A8A]`}
      >
        {icon && <span className="text-police-faint">{icon}</span>}
        <input
          defaultValue={value}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`h-10 flex-1 bg-transparent text-[12px] font-medium text-police placeholder:text-police-faint focus:outline-none ${
            readOnly ? "cursor-default" : ""
          }`}
        />
      </div>
    </div>
  );
}

function EditableField({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  full = false,
  isNida = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "text" | "tel" | "numeric";
  full?: boolean;
  isNida?: boolean;
}) {
  // NIDA formatting for this field
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isNida) {
      const digits = e.target.value.replace(/\D/g, "").slice(0, 20);
      const parts = [digits.slice(0,4), digits.slice(4,8), digits.slice(8,12), digits.slice(12,16), digits.slice(16,20)];
      onChange(parts.filter(Boolean).join("-"));
    } else {
      onChange(e.target.value);
    }
  };

  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="mb-1 block text-[11px] font-medium text-police-muted">{label}</label>
      <div className={`flex items-center gap-2 rounded-xl border-2 ${isNida ? "border-[#2196F3]/30" : "border-[#2196F3]/40"} bg-[#2196F3]/5 px-3 focus-within:border-[#2196F3]`}>
        <input
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          inputMode={inputMode}
          className={`h-10 flex-1 bg-transparent text-[12px] font-medium text-police placeholder:text-police-faint focus:outline-none ${
            isNida ? "font-mono tracking-wider" : ""
          }`}
        />
      </div>
    </div>
  );
}

function Dropdown({
  label,
  value,
  placeholder,
  options,
  open,
  onToggle,
  onSelect,
  full = false,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  open: boolean;
  onToggle: () => void;
  onSelect: (v: string) => void;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="mb-1 block text-[11px] font-medium text-police-muted">{label}</label>
      <button
        onClick={onToggle}
        className="relative flex w-full items-center gap-2 rounded-xl border border-police bg-police-input px-3"
      >
        <span className={`h-10 flex-1 text-left text-[12px] ${value ? "font-medium text-police" : "text-police-faint"}`}>
          {value || placeholder}
        </span>
        <ChevronDown size={14} className={`text-police-faint transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="relative z-10 mt-1 max-h-40 overflow-y-auto rounded-xl border border-police bg-police-card py-1 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              className="block w-full px-3 py-2 text-left text-[12px] text-police hover:bg-police-muted"
            >
              {opt}
            </button>
          ))}
        </div>
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
