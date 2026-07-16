"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, Clock, MapPin, Target, Play, Square, Shield, Route, Camera, X, CheckCircle } from "lucide-react";
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
  const { patrolActive, patrolElapsed, startPatrol, endPatrol, tickPatrol } = usePoliceStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [area, setArea] = useState("");
  const [notes, setNotes] = useState("");
  const [events, setEvents] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
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
    toast({ title: "Patroli Imeanza", description: "Kronometer inaendelea kuhesabu." });
  };

  const handleStop = () => {
    endPatrol();
    setShowForm(true);
    toast({ title: "Patroli Imesimama", description: "Jaza fomu kukamilisha ripoti." });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => { if (ev.target?.result) setPhotos((p) => [...p, ev.target!.result as string]); };
      reader.readAsDataURL(f);
    });
  };

  const handleSubmit = () => {
    if (!area) { toast({ title: "Kosa", description: "Taja eneo la patroli.", variant: "destructive" }); return; }
    setSubmitted(true);
    setShowForm(false);
    toast({ title: "Ripoti Imehifadhiwa ✓", description: `Patroli ya ${formatTime(patrolElapsed)} imerekodiwa kikamilifu.` });
  };

  return (
    <div className="min-h-full bg-police">
      <TopAppBar title="Patroli" subtitle="Fanya doria, rekodi na ripoti matukio" />
      <div className="space-y-4 p-4">

        {/* Timer Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2196F3] to-[#1976D2] p-5 shadow-lg">
          <div className="flex flex-col items-center">
            <p className="text-[13px] font-medium text-white/80">{patrolActive ? "Patroli inaendelea..." : submitted ? "Patroli Imekamilika" : "Anza patroli yako"}</p>
            <p className="mt-1 font-mono text-[40px] font-bold tracking-wider text-white">{formatTime(patrolElapsed)}</p>
            <div className="mt-4 flex gap-3">
              {!patrolActive ? (
                <button onClick={handleStart} className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-[14px] font-bold text-[#1976D2] shadow-md active:scale-[0.97]">
                  <Play size={16} fill="#1976D2" /> Anza Patroli
                </button>
              ) : (
                <button onClick={handleStop} className="flex items-center gap-2 rounded-xl bg-[#F44336] px-6 py-2.5 text-[14px] font-bold text-white shadow-md active:scale-[0.97]">
                  <Square size={16} fill="white" /> Maliza Patroli
                </button>
              )}
            </div>
          </div>
          {patrolActive && (
            <span className="absolute right-4 top-4 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-400" />
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {PATROL_STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center rounded-xl bg-police-card p-3 shadow-sm">
              <span className="mt-2 text-[18px] font-bold leading-none text-police-navy">{stat.value}</span>
              <span className="mt-1 text-center text-[9px] leading-tight text-police-muted">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Submitted confirmation */}
        {submitted && (
          <div className="flex items-center gap-3 rounded-2xl border border-[#10B981]/30 bg-[#10B981]/10 p-4">
            <CheckCircle size={24} className="shrink-0 text-[#10B981]" />
            <div>
              <p className="text-[14px] font-bold text-[#10B981]">Ripoti Imehifadhiwa</p>
              <p className="text-[12px] text-police-muted">Ripoti ya patroli imesajiliwa. Eneo: {area}</p>
            </div>
          </div>
        )}

        {/* Patrol Report Form */}
        {showForm && (
          <div className="rounded-2xl bg-police-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-police-navy">Ripoti ya Patroli</h3>
              <span className="rounded-full bg-[#2196F3]/10 px-3 py-1 text-[11px] font-bold text-[#2196F3]">{formatTime(patrolElapsed)}</span>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <ReadField label="Tarehe" icon={<Calendar size={14} />} value={new Date().toLocaleDateString("sw-TZ")} />
                <ReadField label="Muda wa Patroli" icon={<Clock size={14} />} value={formatTime(patrolElapsed)} />
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
                <textarea rows={3} value={events} onChange={(e) => setEvents(e.target.value)} placeholder="Eleza matukio yoyote yaliyobainika..." className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police placeholder:text-police-faint focus:border-[#2196F3] focus:outline-none" />
              </div>

              {/* Photo evidence */}
              <div>
                <label className="mb-1 block text-[12px] font-medium text-police-muted">Picha / Ushahidi wa Picha</label>
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
                        <img src={src} alt={`picha-${i}`} className="h-full w-full object-cover" />
                        <button onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))} className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#F44336]">
                          <X size={10} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={handleSubmit} className="w-full rounded-xl bg-[#2196F3] py-3 text-[15px] font-bold text-white shadow-md shadow-[#2196F3]/30 active:scale-[0.98]">
                Hifadhi Ripoti
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReadField({ label, icon, value }: { label: string; icon: React.ReactNode; value: string }) {
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
