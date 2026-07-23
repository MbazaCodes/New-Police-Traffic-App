// @ts-nocheck
"use client";

import { useOfficer } from "@/hooks/use-officer";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Camera, X, CheckCircle, AlertTriangle, Shield, WifiOff, CloudUpload, RefreshCw } from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { toast } from "@/hooks/use-toast";
import { saveWithOfflineSupport, initAutoSync, subscribeToSyncStatus, type SyncStatus } from "@/lib/offline-sync";

// ── Traffic-specific offenses (vehicle / road) ──────────────────────
const TRAFFIC_OFFENSES = [
  "Kasi zaidi ya kiwango (overspeed)",
  "Kuvuka mstari mwekundu (red light)",
  "Kuvuka mstari mweupe (lane violation)",
  "Kutumia simu wakati wa kuendesha",
  "Kutopiga mwangaza usiku",
  "Kelele za gari kupita kiasi",
  "Mwanga wa mbele mbaya / hazijakaa sawa",
  "Gari lisilo na bima au leseni sahihi",
  "Kuendesha gari vibaya (reckless driving)",
  "Kukaa upande mwingine wa barabara bila sababu",
  "Kupita stopwatch bila kusimama",
  "Kubeba abiria zaidi ya idadi halisi",
];

// ── General police offenses (conduct / community / criminal) ────────
const GENERAL_OFFENSES = [
  "Tabia ya kutisha / kupiga watu (assault)",
  "Kuvuruga amani ya mtaa / ghasia",
  "Matukio ya pombe kupita kiasi mahali pa umma",
  "Uharibifu wa mali (criminal damage)",
  "Tusi / matusi kwa mkubwa / ofisa",
  "Kukaidi amri ya polisi",
  "Kushikwa na mali ya watu wengine bila idhini",
  "Utumiaji wa madawa ya kulevya mahali pa umma",
  "Matatizo ya nyumbani (domestic disturbance)",
  "Kuingia mali ya mtu bila ruhusa (trespass)",
  "Kupiga kelele usiku kupita kiasi",
  "Ushahidi wa vitisho vya silaha",
];

function FInput({ label, value, onChange, placeholder, required, type = "text" }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; required?: boolean; type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-medium text-police-muted">
        {label}{required && <span className="text-[#EF4444]"> *</span>}
      </label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police placeholder:text-police-faint focus:outline-none focus:border-[#FF9800]" />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-police-muted">{label}</span>
      <span className={bold ? "font-bold text-police" : "text-police"}>{value}</span>
    </div>
  );
}

export function WarningFormScreen() {
  const OFFICER = useOfficer();
  const { goBack, warningPrefill, setWarningPrefill, authRole } = usePoliceStore();

  // Role detection
  const isPost    = authRole === "POST_OFFICER"    || OFFICER.role === "post-officer";
  const isGeneral = (authRole === "GENERAL_OFFICER" || OFFICER.role === "officer-general") && !isPost;
  // Post Officers work checkpoints: they use traffic-style warnings (vehicle fields shown)
  // but with a green accent colour to distinguish from Traffic Officers
  const accentColor = isGeneral ? "#1E3A8A" : isPost ? "#0d4f3c" : "#FF9800";
  const accentLight = isGeneral ? "#1E3A8A" : isPost ? "#1a7a5e" : "#F57C00";
  const offenses    = isGeneral ? GENERAL_OFFENSES : TRAFFIC_OFFENSES; // Post uses traffic offenses

  const [submitted, setSubmitted] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    recipientName: warningPrefill?.recipientName ?? "",
    plate:         warningPrefill?.plate ?? "",
    licenseNo:     warningPrefill?.licenseNo ?? "",
    offense:       "",
    warningType:   isGeneral ? "conduct" : "traffic",
    location:      "",
    notes:         "",
    acknowledged:  false,
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    pending: 0, lastSynced: null, isOnline: true, isSyncing: false,
  });
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    initAutoSync();
    const unsubscribe = subscribeToSyncStatus((status) => {
      setSyncStatus(status);
      setIsOfflineMode(!status.isOnline || status.pending > 0);
    });
    return unsubscribe;
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const warnId = `WR-2026-${String(113 + Math.floor(Math.random() * 50)).padStart(4, "0")}`;
  const now = new Date();
  const dateStr = now.toLocaleDateString("sw-TZ");
  const timeStr = now.toLocaleTimeString("sw-TZ", { hour: "2-digit", minute: "2-digit" });

  const handleSubmit = async () => {
    if (!form.recipientName || !form.offense) {
      toast({ title: "Kosa", description: "Jaza jina na kosa.", variant: "destructive" });
      return;
    }
    try {
      const payload = {
        citizenName:  form.recipientName,
        offense:      form.offense,
        warningType:  form.warningType,
        location:     form.location || undefined,
        notes:        form.notes || undefined,
        ...(isGeneral ? {} : {
          plate:     form.plate || undefined,
          licenseNo: form.licenseNo || undefined,
        }),
      };
      const result = await saveWithOfflineSupport("/api/warnings", payload, "POST");
      if (result.fromCache) {
        toast({ title: "Onyo Imehifadhiwa (Offline) ⚠️", description: `Onyo kwa ${form.recipientName} imehifadhiwa.` });
      } else {
        toast({ title: "Onyo Limetolewa ✓", description: `Onyo kwa ${form.recipientName} limesajiliwa.` });
      }
    } catch { /* offline — continue */ }
    setSubmitted(true);
    setWarningPrefill(null);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach((f) => {
      const r = new FileReader();
      r.onload = (ev) => { if (ev.target?.result) setPhotos((p) => [...p, ev.target!.result as string]); };
      r.readAsDataURL(f);
    });
  };

  if (submitted) {
    return (
      <div className="min-h-full bg-police p-4">
        <div className="flex flex-col items-center py-10">
          <div className="flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: `${accentColor}20` }}>
            <CheckCircle size={44} style={{ color: accentColor }} />
          </div>
          <h2 className="mt-4 text-[20px] font-bold text-police">Onyo Limetolewa</h2>
          <p className="mt-1 text-center text-[13px] text-police-muted">Fomu ya onyo imesajiliwa kikamilifu.</p>
          <div className="mt-6 w-full rounded-2xl bg-police-card p-4 space-y-2">
            <Row label="Nambari ya Onyo" value={warnId} bold />
            <Row label="Aliyepewa Onyo" value={form.recipientName} />
            {!isGeneral && form.plate && <Row label="Gari" value={form.plate} />}
            <Row label="Kosa" value={form.offense} />
            <Row label="Aina" value={form.warningType} />
            <Row label="Ofisa" value={OFFICER.shortName} />
          </div>
          <div className="mt-4 w-full space-y-2">
            <button onClick={() => setSubmitted(false)}
              className="w-full rounded-xl border border-police py-3 text-[14px] font-semibold text-police">
              Onyo Jingine
            </button>
            <button onClick={() => goBack()}
              className="w-full rounded-xl py-3 text-[14px] font-bold text-white"
              style={{ backgroundColor: accentColor }}>
              Rudi Nyuma
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-police">
      {/* Header — blue for General, orange for Traffic */}
      <div className="px-4 py-4" style={{ background: `linear-gradient(to right, ${accentColor}, ${accentLight})` }}>
        <button onClick={() => goBack()} className="mb-3 flex items-center gap-2 text-white/80">
          <ArrowLeft size={18} /> <span className="text-[13px]">Rudi Nyuma</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
            {isGeneral
              ? <Shield size={20} className="text-white" />
              : <AlertTriangle size={20} className="text-white" />
            }
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-white">
              {isGeneral ? "Onyo la Polisi" : isPost ? "Onyo la Posti / Checkpoint" : "Onyo la Trafiki"}
            </h1>
            <p className="text-[11px] text-white/70">{warnId} • {dateStr} {timeStr}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="rounded-2xl bg-police-card p-4 shadow-sm space-y-3">
          <h3 className="text-[14px] font-bold text-police">Taarifa za Mpokeaji</h3>

          <FInput label="Jina Kamili" required value={form.recipientName} onChange={set("recipientName")}
            placeholder={isGeneral ? "Jina la mtuhumiwa/aliyepewa onyo" : "Jina la dereva"} />

          {/* Vehicle fields ONLY for Traffic officers */}
          {!isGeneral && (
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Namba ya Gari" value={form.plate} onChange={set("plate")} placeholder="T 001 ABC" />
              <FInput label="Namba ya Leseni" value={form.licenseNo} onChange={set("licenseNo")} placeholder="DL..." />
            </div>
          )}

          {/* Warning type */}
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Aina ya Onyo</label>
            <select value={form.warningType} onChange={set("warningType")}
              className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police focus:outline-none">
              {isGeneral ? (
                <>
                  <option value="conduct">Tabia / Mwenendo</option>
                  <option value="verbal">Onyo la Mdomo</option>
                  <option value="written">Onyo la Maandishi</option>
                  <option value="community">Uharibifu wa Jamii</option>
                </>
              ) : (
                <>
                  <option value="traffic">Trafiki</option>
                  <option value="verbal">Onyo la Mdomo</option>
                  <option value="written">Onyo la Maandishi</option>
                </>
              )}
            </select>
          </div>

          {/* Offense list — different per role */}
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">
              Kosa <span className="text-[#EF4444]">*</span>
            </label>
            <select value={form.offense} onChange={set("offense")}
              className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police focus:outline-none">
              <option value="">— Chagua kosa —</option>
              {offenses.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>

          <FInput label="Mahali" required value={form.location} onChange={set("location")}
            placeholder={isGeneral ? "Mtaa / eneo la tukio" : "Barabara au makutano"} />

          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Maelezo / Madokezo</label>
            <textarea rows={3} value={form.notes} onChange={set("notes")}
              placeholder="Maelezo ya ziada..."
              className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
          </div>

          {/* Photo evidence */}
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Picha / Ushahidi</label>
            <button onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-police bg-police-input py-4">
              <Camera size={20} style={{ color: accentColor }} />
              <span className="text-[12px] font-medium text-police-muted">Ongeza picha za ushahidi</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhoto} />
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {photos.map((src, i) => (
                  <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-police">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                      className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444]">
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.acknowledged}
              onChange={(e) => setForm((f) => ({ ...f, acknowledged: e.target.checked }))}
              className="h-4 w-4 rounded" style={{ accentColor }} />
            <span className="text-[12px] text-police-muted">Mpokeaji amekubaliana na onyo hili</span>
          </label>
        </div>

        {/* Officer card */}
        <div className="rounded-2xl border p-4" style={{ borderColor: `${accentColor}30`, backgroundColor: `${accentColor}08` }}>
          <p className="text-[12px] font-medium text-police-muted">Afisa</p>
          <p className="mt-1 text-[15px] font-bold" style={{ color: accentColor }}>{OFFICER.shortName}</p>
          <p className="text-[11px] text-police-muted">{OFFICER.id} • {OFFICER.station}</p>
          <p className="text-[10px] text-police-faint mt-0.5">
            {isGeneral ? "Polisi wa Kawaida" : isPost ? "Afisa wa Posti" : "Askari wa Trafiki"}
          </p>
        </div>

        {/* Offline/Sync status */}
        {(isOfflineMode || syncStatus.pending > 0) && (
          <div className={`rounded-2xl border p-4 flex items-center gap-3 ${
            syncStatus.isSyncing ? "border-[#2196F3]/30 bg-[#2196F3]/5"
            : syncStatus.isOnline ? "border-[#FF9800]/30 bg-[#FF9800]/5"
            : "border-[#EF4444]/30 bg-[#EF4444]/5"
          }`}>
            {syncStatus.isSyncing
              ? <RefreshCw size={18} className="text-[#2196F3] animate-spin shrink-0" />
              : syncStatus.isOnline
                ? <CloudUpload size={18} className="text-[#FF9800] shrink-0" />
                : <WifiOff size={18} className="text-[#EF4444] shrink-0" />}
            <div>
              <p className="text-[12px] font-semibold text-police">
                {syncStatus.isSyncing ? "Inasync..." : syncStatus.isOnline ? "Inasubiri sync" : "Huna mtandao"}
              </p>
              {syncStatus.pending > 0 && (
                <p className="text-[11px] text-police-muted">Rekodi {syncStatus.pending} zinasubiri</p>
              )}
            </div>
          </div>
        )}

        <button onClick={handleSubmit}
          className="w-full rounded-xl py-4 text-[15px] font-bold text-white shadow-lg active:scale-[0.98] transition"
          style={{ backgroundColor: accentColor }}>
          Wasilisha Onyo
        </button>
      </div>
    </div>
  );
}
