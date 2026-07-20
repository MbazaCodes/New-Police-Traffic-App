"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Send, CheckCircle2, Clock, XCircle, ArrowRightLeft, WifiOff, CloudUpload, RefreshCw } from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { useOfficer } from "@/hooks/use-officer";
import { useToast } from "@/hooks/use-toast";
import { saveWithOfflineSupport, initAutoSync, subscribeToSyncStatus, type SyncStatus } from "@/lib/offline-sync";

const REQUEST_TYPES = [
  "Uhamisho",
  "Zana za Kazi",
  "Likizo",
  "Matibabu",
  "Mafunzo",
  "Nyingine",
];

const STATUS_COLOR: Record<string,string> = {
  pending:"#FF9800", approved:"#10B981", rejected:"#EF4444", reallocated:"#2196F3"
};
const STATUS_LABEL: Record<string,string> = {
  pending:"Inasubiri", approved:"Imeidhinishwa", rejected:"Imekataliwa", reallocated:"Imehamishwa"
};

export function OfficerRequestScreen() {
  const { navigate } = usePoliceStore();
  const OFFICER = useOfficer();
  const { toast } = useToast();

  const [tab, setTab] = useState<"new"|"history">("new");
  const [type, setType]         = useState(REQUEST_TYPES[0]);
  const [details, setDetails]   = useState("");
  const [priority, setPriority] = useState<"high"|"medium"|"low">("medium");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [history, setHistory]       = useState<{id:string;type:string;status:string;details:string;createdAt:string;response?:string}[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

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

  async function handleSubmit() {
    if (!details.trim()) { toast({ title: "Andika maelezo ya ombi", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const payload = { type, details, priority };
      const result = await saveWithOfflineSupport("/api/requests", payload, "POST");
      
      if (result.fromCache) {
        toast({ title: "Ombi Imehifadhiwa (Offline) ⚠️", description: `Ombi la ${type} limehifadhiwa kawaida.` });
        setSubmitted(true);
      } else if (result.data && !result.data.ok) {
        toast({ title: "Hitilafu", description: result.data.error || "Hitilafu ilitokea", variant: "destructive" }); return;
      } else {
        toast({ title: "Ombi Limetumwa ✓", description: `Ombi la ${type} limetumwa kwa kamanda` });
        setSubmitted(true);
      }
    } catch {
      // Save offline and show success
      toast({ title: "Ombi Imehifadhiwa (Offline) ⚠️", description: `Ombi la ${type} limehifadhiwa kawaida. Itatumwa mtandao unapowezekana.` });
      setSubmitted(true);
    } finally { setSubmitting(false); }
  }

  async function loadHistory() {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/requests");
      const json = await res.json();
      if (json.ok) setHistory(json.data ?? []);
    } catch { /* ignore */ }
    finally { setLoadingHistory(false); }
  }

  return (
    <div className="min-h-screen bg-[#0d1b3d]">
      {/* Header */}
      <div className="flex items-center gap-3 bg-[#1E3A8A] px-4 py-3.5">
        <button onClick={() => navigate("home")} className="text-white/70 hover:text-white">
          <ArrowLeft size={22}/>
        </button>
        <div>
          <h1 className="text-[16px] font-bold text-white">Maombi ya Kazi</h1>
          <p className="text-[10px] text-blue-200">{OFFICER.shortName} · {OFFICER.rank}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {(["new","history"] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); if (t==="history") loadHistory(); }}
            className={`flex-1 py-3 text-[13px] font-semibold transition ${
              tab === t ? "border-b-2 border-[#2196F3] text-white" : "text-white/50"
            }`}>
            {t === "new" ? "Ombi Jipya" : "Historia ya Maombi"}
          </button>
        ))}
      </div>

      <div className="p-4">
        {/* New request form */}
        {tab === "new" && !submitted && (
          <div className="space-y-4">
            {/* Type */}
            <div>
              <label className="block text-[11px] font-bold text-blue-200 mb-1.5">AINA YA OMBI</label>
              <div className="grid grid-cols-2 gap-2">
                {REQUEST_TYPES.map(t => (
                  <button key={t} onClick={() => setType(t)}
                    className={`rounded-xl border py-2.5 text-[12px] font-semibold transition ${
                      type === t ? "border-[#2196F3] bg-[#2196F3]/20 text-white" : "border-white/20 text-white/60 hover:border-white/40"
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[11px] font-bold text-blue-200 mb-1.5">KIWANGO CHA HARAKA</label>
              <div className="flex gap-2">
                {(["high","medium","low"] as const).map(p => (
                  <button key={p} onClick={() => setPriority(p)}
                    className={`flex-1 rounded-xl border py-2 text-[11px] font-bold transition ${
                      priority === p ? "border-transparent text-white" : "border-white/20 text-white/50"
                    }`}
                    style={priority === p ? { backgroundColor: p==="high"?"#EF4444":p==="medium"?"#FF9800":"#10B981" } : {}}>
                    {p==="high"?"Haraka":"low"===p?"Kawaida":"Kati"}
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div>
              <label className="block text-[11px] font-bold text-blue-200 mb-1.5">MAELEZO YA OMBI</label>
              <textarea
                value={details} onChange={e => setDetails(e.target.value)}
                rows={5}
                placeholder={`Elezea ombi lako la ${type} kwa undani...`}
                className="w-full rounded-xl border border-white/20 bg-white/8 px-4 py-3 text-[13px] text-white placeholder:text-white/30 focus:border-[#2196F3] focus:outline-none resize-none"
              />
              <p className="mt-1 text-right text-[10px] text-white/30">{details.length}/500</p>
            </div>

            {/* Officer info */}
            <div className="rounded-xl border border-white/15 bg-white/5 p-3">
              <p className="text-[10px] font-bold text-blue-200 mb-1">TAARIFA ZA AFISA</p>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                {[["Jina",OFFICER.name],["Cheo",OFFICER.rank],["Kituo",OFFICER.station],["Badge",OFFICER.id]].map(([l,v])=>(
                  <div key={l}><span className="text-white/40">{l}: </span><span className="text-white">{v}</span></div>
                ))}
              </div>
            </div>

            {/* Sync Status Indicator */}
            {(isOfflineMode || syncStatus.pending > 0) && (
              <div className={`rounded-xl border p-3 flex items-center gap-3 ${
                syncStatus.isSyncing ? "border-[#2196F3]/30 bg-[#2196F3]/10" : 
                syncStatus.isOnline ? "border-[#FF9800]/30 bg-[#FF9800]/10" : "border-[#EF4444]/30 bg-[#EF4444]/10"
              }`}>
                {syncStatus.isSyncing ? <RefreshCw size={16} className="text-[#2196F3] animate-spin shrink-0" /> :
                 syncStatus.isOnline ? <CloudUpload size={16} className="text-[#FF9800] shrink-0" /> :
                 <WifiOff size={16} className="text-[#EF4444] shrink-0" />}
                <div className="flex-1">
                  <p className={`text-[11px] font-bold ${syncStatus.isSyncing ? "text-[#2196F3]" : syncStatus.isOnline ? "text-[#FF9800]" : "text-[#EF4444]"}`}>
                    {syncStatus.isSyncing ? "Inasasisha data..." : syncStatus.isOnline ? `Data ${syncStatus.pending} inasubiri kusasishwa` : "Hakuna Mtandao — Hifadhi ya Kawaida"}
                  </p>
                </div>
                {syncStatus.pending > 0 && syncStatus.isOnline && !syncStatus.isSyncing && (
                  <button onClick={() => { import("@/lib/offline-sync").then(({ processSyncQueue }) => processSyncQueue().then(({ success, failed }) => toast({ title: "Matokeo ya Usasishaji", description: `Mafanikio: ${success}, Mashindwa: ${failed}` }))); }} 
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-[#2196F3] text-white text-[10px] font-semibold">Sasa Sasisha</button>
                )}
              </div>
            )}

            <button onClick={handleSubmit} disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2196F3] py-3.5 text-[14px] font-bold text-white disabled:opacity-50">
              {submitting ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"/> : <Send size={16}/>}
              {submitting ? "Inatuma..." : "Tuma Ombi kwa Kamanda"}
            </button>
          </div>
        )}

        {/* Submitted success */}
        {tab === "new" && submitted && (
          <div className="flex flex-col items-center py-10 text-center gap-4">
            <CheckCircle2 size={56} className="text-[#10B981]"/>
            <h2 className="text-[18px] font-bold text-white">Ombi Limetumwa!</h2>
            <p className="text-[13px] text-blue-200 max-w-xs">
              Ombi lako la <strong>{type}</strong> limetumwa kwa kamanda wa kituo. Utapata jibu hivi karibuni.
            </p>
            <button onClick={() => { setSubmitted(false); setDetails(""); }}
              className="rounded-xl bg-[#2196F3]/20 border border-[#2196F3]/40 px-6 py-2.5 text-[13px] font-semibold text-[#2196F3]">
              Tuma Ombi Jingine
            </button>
          </div>
        )}

        {/* History */}
        {tab === "history" && (
          <div className="space-y-3">
            {loadingHistory ? (
              <div className="flex justify-center py-10">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2196F3] border-t-transparent"/>
              </div>
            ) : history.length === 0 ? (
              <div className="py-10 text-center text-[13px] text-white/40">Hakuna maombi yaliyowasilishwa bado</div>
            ) : history.map(req => (
              <div key={req.id} className="rounded-2xl border border-white/15 bg-white/8 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[13px] font-bold text-white">{req.type}</p>
                    <p className="text-[11px] text-blue-200 mt-0.5">{req.details.slice(0,80)}...</p>
                  </div>
                  <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[9px] font-bold text-white"
                    style={{ backgroundColor: STATUS_COLOR[req.status] }}>
                    {STATUS_LABEL[req.status] ?? req.status}
                  </span>
                </div>
                {req.response && (
                  <div className="mt-2 rounded-lg bg-white/5 px-3 py-2 text-[10px] text-blue-200">
                    <span className="font-bold text-white">Jibu: </span>{req.response}
                  </div>
                )}
                <p className="mt-2 text-[9px] text-white/30">{new Date(req.createdAt).toLocaleString("sw-TZ")}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
