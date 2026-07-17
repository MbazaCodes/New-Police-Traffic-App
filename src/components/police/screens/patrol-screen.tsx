"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, Clock, MapPin, Target, Play, Square, Camera, X, CheckCircle, Shield, ChevronRight } from "lucide-react";
import { TopAppBar } from "../top-app-bar";
import { PATROL_STATS } from "@/lib/police-data";
import { usePoliceStore } from "@/store/police-store";
import { toast } from "@/hooks/use-toast";

function formatTime(secs: number) {
  const h = Math.floor(secs / 3600).toString().padStart(2, "0");
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function PatrolScreen() {
  const { patrolActive, patrolElapsed, patrolRecords, startPatrol, endPatrol, tickPatrol, addPatrolRecord } = usePoliceStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [area, setArea] = useState("");
  const [notes, setNotes] = useState("");
  const [events, setEvents] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [patrolType, setPatrolType] = useState<"gari" | "miguu" | "baiskeli">("gari");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (patrolActive) {
      intervalRef.current = setInterval(() => tickPatrol(), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [patrolActive, tickPatrol]);

  const handleStart = () => {
    startPatrol();
    setSubmitted(false);
    setShowForm(false);
    setArea(""); setNotes(""); setEvents(""); setPhotos([]);
    toast({ title: "Patroli Imeanza", description: "Kronometer inaendelea kuhesabu." });
  };

  const handleStop = () => {
    endPatrol();
    setShowForm(true);
    toast({ title: "Patroli Imesimama", description: "Jaza fomu kukamilisha ripoti." });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach((f) => {
      const r = new FileReader();
      r.onload = (ev) => { if (ev.target?.result) setPhotos((p) => [...p, ev.target!.result as string]); };
      r.readAsDataURL(f);
    });
  };

  const handleSubmit = () => {
    if (!area) { toast({ title: "Kosa", description: "Taja eneo la patroli.", variant: "destructive" }); return; }
    const now = new Date();
    const typeLabels = { gari: "Gari", miguu: "Miguu", baiskeli: "Baiskeli" };
    addPatrolRecord({
      id: `PT-${Date.now()}`,
      date: now.toLocaleDateString("sw-TZ"),
      area: `${area} (${typeLabels[patrolType]})`,
      duration: formatTime(patrolElapsed),
      durationSecs: patrolElapsed,
      events,
      photos: photos.length,
    });
    setSubmitted(true);
    setShowForm(false);
    toast({ title: "Ripoti Imehifadhiwa ✓", description: `Patroli ya ${formatTime(patrolElapsed)} (${typeLabels[patrolType]}) imerekodiwa.` });
  };

  const todayPatrols = patrolRecords.filter((p) => p.date === new Date().toLocaleDateString("sw-TZ"));

  return (
    <div className="min-h-full bg-police">
      <TopAppBar title="Patroli" subtitle="Fanya doria, rekodi na ripoti matukio" />
      <div className="space-y-4 p-4">

        {/* Timer Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2196F3] to-[#2196F3] p-5 shadow-lg">
          <div className="flex flex-col items-center">
            <p className="text-[13px] font-medium text-white/80">
              {patrolActive ? "Patroli inaendelea..." : submitted ? "Patroli Imekamilika" : "Anza patroli yako"}
            </p>
            <p className="mt-1 font-mono text-[40px] font-bold tracking-wider text-white">{formatTime(patrolElapsed)}</p>
            <div className="mt-4 flex gap-3">
              {!patrolActive ? (
                <button onClick={handleStart} className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-[14px] font-bold text-[#2196F3] shadow-md active:scale-[0.97]">
                  <Play size={16} fill="#2196F3" /> Anza Patroli
                </button>
              ) : (
                <button onClick={handleStop} className="flex items-center gap-2 rounded-xl bg-[#EF4444] px-6 py-2.5 text-[14px] font-bold text-white shadow-md active:scale-[0.97]">
                  <Square size={16} fill="white" /> Maliza Patroli
                </button>
              )}
            </div>
          </div>
          {patrolActive && (
            <span className="absolute right-4 top-4 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981]/300 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#10B981]/400" />
            </span>
          )}
        </div>

        {/* Live stats */}
        <div className="space-y-2">
          {/* Patrol type selector — visible before starting */}
          {!patrolActive && !showForm && (
            <div className="rounded-2xl bg-police-card p-3 shadow-sm">
              <p className="mb-2 text-[12px] font-medium text-police-muted">Aina ya Patroli</p>
              <div className="flex gap-2">
                {([
                  { id: "gari",     label: "🚗 Gari",     },
                  { id: "miguu",    label: "🚶 Miguu",    },
                  { id: "baiskeli", label: "🚲 Baiskeli", },
                ] as const).map((t) => (
                  <button key={t.id} onClick={() => setPatrolType(t.id)} className={`flex-1 rounded-xl py-2 text-[12px] font-bold transition ${patrolType === t.id ? "bg-[#2196F3] text-white" : "bg-police-muted text-police-muted"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Leo", value: String(todayPatrols.length), sub: "Patroli" },
            { label: "Jumla", value: String(patrolRecords.length), sub: "Zote" },
            { label: "Muda", value: todayPatrols.length > 0 ? formatTime(todayPatrols.reduce((s, p) => s + p.durationSecs, 0)) : "00:00", sub: "Leo" },
            { label: "Picha", value: String(patrolRecords.reduce((s, p) => s + p.photos, 0)), sub: "Jumla" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center rounded-xl bg-police-card p-2.5 shadow-sm">
              <span className="text-[16px] font-bold leading-none text-police-navy">{s.value}</span>
              <span className="mt-1 text-center text-[8px] leading-tight text-police-muted">{s.sub}</span>
            </div>
          ))}
        </div>
        </div>

        {/* Success banner */}
        {submitted && (
          <div className="flex items-center gap-3 rounded-2xl border border-[#10B981]/30 bg-[#10B981]/10 p-4">
            <CheckCircle size={24} className="shrink-0 text-[#10B981]" />
            <div>
              <p className="text-[14px] font-bold text-[#10B981]">Ripoti Imehifadhiwa</p>
              <p className="text-[12px] text-police-muted">Eneo: {area} • Historia imesasishwa.</p>
            </div>
          </div>
        )}

        {/* Report Form */}
        {showForm && (
          <div className="rounded-2xl bg-police-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-police-navy">Ripoti ya Patroli</h3>
              <span className="rounded-full bg-[#2196F3]/10 px-3 py-1 text-[11px] font-bold text-[#2196F3]">{formatTime(patrolElapsed)}</span>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <RF label="Tarehe" icon={<Calendar size={14} />} value={new Date().toLocaleDateString("sw-TZ")} />
                <RF label="Muda" icon={<Clock size={14} />} value={formatTime(patrolElapsed)} />
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-police-muted">Eneo / Kanda <span className="text-[#EF4444]">*</span></label>
                <div className="flex items-center gap-2 rounded-xl border border-police bg-police-input px-3">
                  <MapPin size={14} className="shrink-0 text-police-faint" />
                  <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Mfano: Kariakoo - Ilala Zone" className="h-10 flex-1 bg-transparent text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-police-muted">Lengo la Patroli</label>
                <div className="flex items-center gap-2 rounded-xl border border-police bg-police-input px-3">
                  <Target size={14} className="shrink-0 text-police-faint" />
                  <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Lengo la doria..." className="h-10 flex-1 bg-transparent text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-police-muted">Matukio Yaliyobainika</label>
                <textarea rows={3} value={events} onChange={(e) => setEvents(e.target.value)} placeholder="Eleza matukio yoyote..." className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-police-muted">Picha / Ushahidi</label>
                <button onClick={() => fileRef.current?.click()} className="flex w-full flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-police bg-police-input py-4">
                  <Camera size={22} className="text-[#2196F3]" />
                  <span className="text-[12px] font-medium text-police-muted">Bonyeza kuongeza picha</span>
                </button>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoChange} />
                {photos.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {photos.map((src, i) => (
                      <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-police">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="h-full w-full object-cover" />
                        <button onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))} className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444]"><X size={10} className="text-white" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={handleSubmit} className="w-full rounded-xl bg-[#2196F3] py-3 text-[15px] font-bold text-white shadow-md active:scale-[0.98]">
                Hifadhi Ripoti
              </button>
            </div>
          </div>
        )}

        {/* Patrol History */}
        {patrolRecords.length > 0 && !showForm && (
          <div className="rounded-2xl bg-police-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-police">Historia ya Patroli</h3>
              <span className="text-[12px] text-[#2196F3]">{patrolRecords.length} rekodi</span>
            </div>
            <div className="space-y-2">
              {patrolRecords.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-police-soft p-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2196F3]/10">
                    <Shield size={16} className="text-[#2196F3]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-police">{p.area}</p>
                    <p className="text-[10px] text-police-faint">{p.date} • {p.duration} • {p.photos} picha</p>
                  </div>
                  <ChevronRight size={14} className="text-police-faint" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RF({ label, icon, value }: { label: string; icon: React.ReactNode; value: string }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-medium text-police-muted">{label}</label>
      <div className="flex items-center gap-2 rounded-xl border border-police bg-police-input px-3 h-10">
        <span className="text-police-faint">{icon}</span>
        <span className="text-[13px] text-police">{value}</span>
      </div>
    </div>
  );
}
