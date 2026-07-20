"use client";

import { useOfficer } from "@/hooks/use-officer";
import { useState, useEffect } from "react";

import {
  FileText,
  Calendar,
  Clock,
  MapPin,
  Car,
  Users,
  Eye,
  Building2,
  ShieldCheck,
  Save,
  Send,
  Download,
  Printer,
  Hash,
  CloudSun,
  Route,
  Sun,
  Loader2,
  WifiOff,
  CloudUpload,
  RefreshCw,
} from "lucide-react";
import { TopAppBar } from "../top-app-bar";
import { PF3_FORM } from "@/lib/police-data";
import { usePoliceStore } from "@/store/police-store";
import { useRecordsStore } from "@/store/records-store";
import { toast } from "@/hooks/use-toast";
import { DatePicker } from "@/components/police/ui/date-picker";
import { saveWithOfflineSupport, initAutoSync, subscribeToSyncStatus, type SyncStatus } from "@/lib/offline-sync";

export function Pf3Screen() {
  const OFFICER = useOfficer();
  const f = PF3_FORM;
  const goBack = usePoliceStore((s) => s.goBack);
  const addPF3 = useRecordsStore((s) => s.addPF3);
  const submitPF3 = useRecordsStore((s) => s.submitPF3);

  // Offline sync state
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    pending: 0,
    lastSynced: null,
    isOnline: true,
    isSyncing: false,
  });
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  // Form state
  const [accidentDate, setAccidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState("");
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

  const now = new Date();
  const today = now.toLocaleDateString("sw-TZ", { day: "numeric", month: "long", year: "numeric" });
  const currentTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  // Generate PF3 reference number
  const generateReferenceNo = () => {
    const year = new Date().getFullYear();
    const random = String(Math.floor(10000 + Math.random() * 90000)).padStart(5, "0");
    return `PF3-${year}-${random}`;
  };

  const buildPayload = () => ({
    referenceNumber: generateReferenceNo(),
    region: f.region,
    district: f.district,
    station: OFFICER.station || f.station,
    officerId: OFFICER.id,
    officerName: OFFICER.name,
    accidentType: f.accidentType,
    severity: f.severity,
    date: accidentDate || today,
    time: currentTime,
    location: location || "Haijajulikana",
    weather: f.weather,
    roadSurface: f.roadSurface,
    lightCondition: f.lightCondition,
    vehicles: f.vehicles.length,
    casualties: f.casualties.length,
    witnesses: f.witnesses.length,
    status: "draft",
  });

  // ENHANCED: Save draft with offline sync
  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    const payload = buildPayload();
    payload.status = "draft";

    try {
      const result = await saveWithOfflineSupport("/api/pf3", payload, "POST");
      
      addPF3(payload);
      
      const rec = {
        id: result.data?.id || generateReferenceNo(),
        referenceNumber: payload.referenceNumber,
        date: payload.date,
        cached: result.fromCache,
      };

      setSavedRecord(rec);
      setSaved(true);

      if (result.fromCache) {
        toast({
          title: "Rasimu Imehifadhiwa (Hifadhi ya Kawaida) 💾",
          description: "Fomu PF3 imehifadhiwa kawaida. Itasasishawa mara tu utakapoweka mtandao.",
          duration: 5000,
        });
      } else {
        toast({ title: "Imehifadhiwa ✓", description: "Rasimu ya Fomu PF3 imehifadhiwa." });
      }
    } catch (error: any) {
      console.error("Save PF3 error:", error);
      // Fallback to local store only
      addPF3(payload);
      toast({ title: "Imehifadhiwa (Local)", description: "Rasimu imehifadhiwa kawaida." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ENHANCED: Submit with offline sync
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const payload = buildPayload();
    payload.status = "submitted";

    try {
      const result = await saveWithOfflineSupport("/api/pf3", payload, "POST");
      
      const id = addPF3(payload);
      submitPF3(id);

      if (result.fromCache) {
        toast({
          title: "Fomu PF3 Imewasilishwa (Hifadhi ya Kawaida) 📴",
          description: "Fomu itakamilishwa mara tu utakapoweka mtandao.",
          duration: 5000,
        });
      } else {
        toast({ title: "Imetumwa kwa Kituo Kikuu ✓", description: "Fomu PF3 imewasilishwa kikamilifu." });
      }
      setTimeout(() => goBack(), 800);
    } catch (error: any) {
      console.error("Submit PF3 error:", error);
      // Fallback
      const id = addPF3(payload);
      submitPF3(id);
      toast({ title: "Fomu PF3 Imetumwa (Local)", description: "Data itakamilishwa mtandao." });
      setTimeout(() => goBack(), 800);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = () =>
    toast({ title: "Inapakua", description: "Fomu PF3 inapakuliwa kama PDF." });
  const handlePrint = () =>
    toast({ title: "Inachapisha", description: "Fomu PF3 inatumwa kwa printer." });

  // Saved state view
  if (saved && savedRecord) {
    return (
      <div className="min-h-full bg-police p-4">
        <div className="flex flex-col items-center py-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1E3A8A]/15">
            <FileText size={44} className="text-[#1E3A8A]" />
          </div>
          <h2 className="mt-4 text-[20px] font-bold text-police">Fomu PF3 Imehifadhiwa</h2>
          <p className="mt-1 text-center text-[13px] text-police-muted">Ripoti ya ajali ya trafiki imehifadhiwa.</p>
          
          <div className="mt-6 w-full rounded-2xl bg-police-card p-4 shadow-sm space-y-2.5">
            <div className="inline-block rounded-lg border-2 border-[#0A3D62] bg-blue-50 px-4 py-1.5 text-[16px] font-extrabold tracking-wider text-police-navy">
              {savedRecord.referenceNumber}
            </div>
            <Row label="Namba ya Kumbukumbu" value={savedRecord.id} bold />
            <Row label="Tarehe ya Ajali" value={savedRecord.date} />
            <Row label="Aina ya Ajali" value={f.accidentType} />
            <Row label="Mkuliko" value={f.severity} bold />
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
              setLocation("");
              setAccidentDate(new Date().toISOString().split('T')[0]);
            }} className="w-full rounded-xl border border-police py-3 text-[14px] font-semibold text-police">Fanya PF3 Mpya</button>
            <button onClick={() => goBack()} className="w-full rounded-xl bg-[#1E3A8A] py-3 text-[14px] font-bold text-white">Rudi Nyuma</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-police">
      <TopAppBar title="Fomu PF3" subtitle="Ripoti Rasmi ya Ajali ya Trafiki" showBack />

      <div className="space-y-3 p-4 pb-8">
        {/* Official form banner */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A3D62] to-[#1E3A8A] p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/70">
                Jeshi la Polisi Tanzania
              </p>
              <h2 className="mt-0.5 text-[18px] font-extrabold">FORM PF3</h2>
              <p className="text-[11px] text-white/80">Traffic Accident Report Form</p>
            </div>
            <div className="rounded-xl bg-police-card/15 px-3 py-2 text-right backdrop-blur">
              <p className="text-[9px] uppercase text-white/60">Namba ya Kumbukumbu</p>
              <p className="text-[13px] font-bold">{generateReferenceNo()}</p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#1E3A8A]/20 bg-police-card py-2.5 text-[12px] font-semibold text-police-navy active:scale-[0.98]"
          >
            <Download size={15} /> Pakua PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#1E3A8A]/20 bg-police-card py-2.5 text-[12px] font-semibold text-police-navy active:scale-[0.98]"
          >
            <Printer size={15} /> Chapisha
          </button>
        </div>

        {/* Section 1: Mamlaka */}
        <Section title="A. Taarifa za Mamlaka" icon={<Building2 size={16} />}>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Mkoa" value={f.region} />
            <Field label="Wilaya" value={f.district} />
            <Field label="Kituo" value={OFFICER.station || f.station} />
            <Field label="Afisa Anayeripoti" value={OFFICER.name} />
          </div>
        </Section>

        {/* Section 2: Maelezo ya Ajali */}
        <Section title="B. Maelezo ya Ajali" icon={<FileText size={16} />}>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Aina ya Ajali" value={f.accidentType} />
            <Field label="Mkuliko" value={f.severity} icon={<ShieldCheck size={14} />} />
            
            {/* Date Picker for accident date */}
            <div className="col-span-2 sm:col-span-1">
              <DatePicker
                label="Tarehe ya Ajali"
                value={accidentDate}
                onChange={setAccidentDate}
                maxDate={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <Field label="Saa" value={currentTime} icon={<Clock size={14} />} />
            
            {/* Editable Location */}
            <div className={""}>
              <label className="mb-1 block text-[11px] font-medium text-police-muted">Eneo</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Andika eneo la ajali..."
                className="flex h-10 w-full items-center gap-2 rounded-xl border border-police bg-police-input px-3 text-[12px] font-medium text-police placeholder:text-police-faint focus:border-[#1E3A8A] focus:outline-none"
              />
            </div>
            
            <Field label="Mahali Halisi" value="" full />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <ConditionChip icon={<CloudSun size={14} />} label="Hali ya Hewa" value={f.weather} />
            <ConditionChip icon={<Route size={14} />} label="Uso wa Barabara" value={f.roadSurface} />
            <ConditionChip icon={<Sun size={14} />} label="Mwanga" value={f.lightCondition} />
          </div>
        </Section>

        {/* Section 3: Magari Husika */}
        <Section title="C. Magari Husika" icon={<Car size={16} />} count={`Jumla: ${f.vehicles.length}`}>
          <div className="space-y-2.5">
            {f.vehicles.map((v, i) => (
              <div key={i} className="rounded-xl border border-police-soft bg-police-muted p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-md border-2 border-[#1E3A8A] bg-yellow-50 px-2.5 py-0.5 text-[14px] font-extrabold tracking-wider text-police-navy">
                    {v.plate}
                  </span>
                  <span className="text-[10px] font-medium text-police-faint">Gari {i + 1}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <MiniField label="Aina" value={`${v.make} (${v.year})`} />
                  <MiniField label="Rangi" value={v.color} />
                  <MiniField label="Dereva" value={v.driver} />
                  <MiniField label="Leseni" value={v.license} />
                  <MiniField label="Mwelekeo" value={v.direction} />
                  <MiniField label="Uharibifu" value={v.damage} />
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      v.insured ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#EF4444]/10 text-[#EF4444]"
                    }`}
                  >
                    {v.insured ? "Bima: Inapatikana" : "Bima: Haiapatikani"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Section 4: Waharibika / Majeruhi */}
        <Section title="D. Waharibika / Majeruhi" icon={<Users size={16} />} count={`Jumla: ${f.casualties.length}`}>
          <div className="space-y-2">
            {f.casualties.map((c, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-police-soft p-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FF9800]/50">
                  <Users size={16} className="text-[#FF9800]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-police">{c.name}</p>
                  <p className="text-[11px] text-police-muted">
                    {c.type} • {c.injury}
                  </p>
                  <p className="text-[10px] text-police-faint">
                    Hospitali: {c.hospital} • Hali: {c.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Section 5: Mashahidi */}
        <Section title="E. Mashahidi" icon={<Eye size={16} />} count={`Jumla: ${f.witnesses.length}`}>
          <div className="space-y-2">
            {f.witnesses.map((w, i) => (
              <div key={i} className="rounded-xl border border-police-soft bg-police-muted p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-bold text-police">{w.name}</p>
                  <p className="text-[10px] text-police-faint">{w.phone}</p>
                </div>
                <p className="mt-1.5 text-[11px] italic leading-snug text-police-muted">"{w.statement}"</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Section 6: Sketch / Ramani */}
        <Section title="F. Ramani ya Ajali" icon={<MapPin size={16} />}>
          <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-xl border-2 border-dashed border-police bg-police-input">
            <MapPin size={28} className="text-police-faint" />
            <p className="mt-1 text-[11px] text-police-faint">Sketch ya eneo la ajali</p>
            <p className="text-[9px] text-police-faint">Bonyeza kuongeza ramani</p>
          </div>
        </Section>

        {/* Section 7: Certification */}
        <Section title="G. Uthibitisho wa Afisa" icon={<ShieldCheck size={16} />}>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Jina la Afisa" value={OFFICER.name} />
            <Field label="Namba ya Utambulisho" value={OFFICER.id} icon={<Hash size={14} />} />
            <Field label="Cheo" value={OFFICER.rank} />
            <Field label="Kituo" value={OFFICER.station} />
          </div>
          <div className="mt-2 rounded-xl border border-police bg-police-input p-4">
            <p className="text-[10px] text-police-faint">Saini ya Afisa</p>
            <p className="mt-4 text-right font-[cursive] text-[18px] italic text-police-navy">J. Mwinyi</p>
            <div className="mt-1 border-t border-dashed border-police pt-1 text-center text-[9px] text-police-faint">
              Saini halali ya Afisa wa Polisi
            </div>
          </div>
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
          <p className="text-[12px] font-medium text-police-muted">Afisa Anayeripoti Ajali</p>
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
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="flex-1 rounded-xl border-2 border-[#1E3A8A] bg-police-card py-3 text-[13px] font-bold text-police-navy active:scale-[0.98]"
          >
            {isSubmitting ? <Loader2 size={16} className="mr-1 inline animate-spin" /> : <Save size={16} className="mr-1 inline" />} Hifadhi Rasimu
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-[1.5] rounded-xl bg-[#1E3A8A] py-3 text-[13px] font-bold text-white shadow-md active:scale-[0.98]"
          >
            {isSubmitting ? <Loader2 size={16} className="mr-1 inline animate-spin" /> : <Send size={16} className="mr-1 inline" />} Wasilisha PF3
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="tpf-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[14px] font-bold text-police-navy">
          <span className="text-police-navy">{icon}</span>
          {title}
        </h3>
        {count && <span className="text-[11px] font-medium text-police-faint">{count}</span>}
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  icon,
  full = false,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="mb-1 block text-[11px] font-medium text-police-muted">{label}</label>
      <div className="flex items-center gap-2 rounded-xl border border-police bg-police-input px-3">
        {icon && <span className="text-police-faint">{icon}</span>}
        <span className="h-10 flex-1 text-[12px] font-medium text-police">{value}</span>
      </div>
    </div>
  );
}

function MiniField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] text-police-faint">{label}</p>
      <p className="text-[12px] font-semibold text-police">{value}</p>
    </div>
  );
}

function ConditionChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-police-muted p-2 text-center">
      <span className="text-police-faint">{icon}</span>
      <span className="mt-1 text-[9px] text-police-faint">{label}</span>
      <span className="text-[11px] font-bold text-police">{value}</span>
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
