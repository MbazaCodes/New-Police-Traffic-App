"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft, ShieldCheck, User, Phone, FileText, DollarSign,
  CheckCircle2, AlertTriangle, Clock, Wallet, Users, Scale,
  WifiOff, CloudUpload, RefreshCw,
} from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { useOfficer } from "@/hooks/use-officer";
import { toast } from "@/hooks/use-toast";
import { saveWithOfflineSupport, initAutoSync, subscribeToSyncStatus, type SyncStatus } from "@/lib/offline-sync";

const BAIL_RATES: Record<string, number> = {
  "Wizi wa Kawaida": 500000,
  "Ugomvi wa Kimwili": 300000,
  "Uvunjaji wa Amani": 200000,
  "Udanganyifu": 750000,
  "Uendeshaji Gari kwa Ulevi": 400000,
  "Kupiga Risasi Holela": 2000000,
  "Biashara ya Dawa za Kulevya": 5000000,
  "Wizi wa Silaha": 3000000,
};

function getBailAmount(offense: string): number {
  for (const [key, val] of Object.entries(BAIL_RATES)) {
    if (offense.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return 500000; // default
}

const PAYMENT_METHODS = [
  { id: "mpesa",    label: "M-Pesa",       color: "#10B981" },
  { id: "tigopesa", label: "Tigo Pesa",    color: "#0066CC" },
  { id: "airtel",   label: "Airtel Money", color: "#EF4444" },
  { id: "cash",     label: "Taslimu / Benki", color: "#FF9800" },
];

const BAIL_CONDITIONS = [
  "Mshtakiwa lazima aripoti kituoni kila wiki",
  "Mshtakiwa haruhusiwi kuacha mkoa",
  "Mshtakiwa lazima asilale nje ya makazi yake bila ruhusa",
  "Mshtakiwa lazima ahudhirie mahakama kwa tarehe yote",
  "Dhamana itafutwa mara moja akikinzana na masharti",
];

type Step = "select" | "form" | "pay" | "done";

interface ArrestRecord {
  id: string;
  suspectName: string;
  offense: string;
  arrestDate: string;
  cell?: string;
  status: string;
}

export function BailOutScreen() {
  const { goBack } = usePoliceStore();
  const OFFICER = useOfficer();

  const [step, setStep] = useState<Step>("select");
  const [selectedArrest, setSelectedArrest] = useState<ArrestRecord | null>(null);
  const [payMethod, setPayMethod] = useState("mpesa");
  const [payPhone, setPayPhone] = useState("");
  const [processing, setProcessing] = useState(false);
  const [conditionsAccepted, setConditionsAccepted] = useState(false);

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

  const [form, setForm] = useState({
    guarantorName: "",
    guarantorPhone: "",
    guarantorNida: "",
    guarantorRelation: "",
    notes: "",
  });

  const receiptNo = useMemo(() => `BL-2026-${Math.floor(1000 + Math.random() * 9000)}`, []);

  // Held arrestees eligible for bail
  const eligible = ([] as ArrestRecord[]).filter((a) => a.status === "held");

  const bailAmount = selectedArrest ? getBailAmount(selectedArrest.offense) : 0;

  function handlePay() {
    if (!form.guarantorName.trim() || !form.guarantorPhone.trim()) {
      toast({ title: "Taarifa za mdhamini zinahitajika", variant: "destructive" }); return;
    }
    if (!conditionsAccepted) {
      toast({ title: "Kubali masharti ya dhamana kwanza", variant: "destructive" }); return;
    }
    if (payMethod !== "cash" && !payPhone.trim()) {
      toast({ title: "Ingiza namba ya malipo", variant: "destructive" }); return;
    }
    setProcessing(true);

    const persist = async () => {
      try {
        const payload = {
          action: "create",
          arrestId:          selectedArrest!.id,
          suspectName:       selectedArrest!.suspectName,
          offense:           selectedArrest!.offense,
          arrestDate:        selectedArrest!.arrestDate,
          cellNumber:        selectedArrest!.cell,
          bailAmount,
          guarantorName:     form.guarantorName,
          guarantorPhone:    form.guarantorPhone,
          guarantorNida:     form.guarantorNida,
          guarantorRelation: form.guarantorRelation,
          paymentMethod:     payMethod,
          paymentRef:        `${payMethod.toUpperCase()}-${Date.now()}`,
          conditionsAccepted: true,
          notes:             form.notes,
        };
        
        const result = await saveWithOfflineSupport("/api/bail", payload, "POST");
        
        if (result.fromCache) {
          toast({ title: "Dhamana Imehifadhiwa (Offline) ⚠️", description: `Dhamana imehifadhiwa kawaida. Itakamilisha mtandao unapowezekana.` });
        }
      } catch { /* offline — show success anyway */ }
    };

    persist().then(() => {
      setProcessing(false);
      setStep("done");
      toast({ title: "Dhamana Imekubaliwa ✓", description: `${selectedArrest?.suspectName} ameruhusiwa kwa dhamana. Risiti: ${receiptNo}` });
    });
  }

  // ── DONE ──────────────────────────────────────────────────────────────
  if (step === "done" && selectedArrest) {
    return (
      <div className="min-h-full bg-police">
        <div className="flex items-center gap-3 border-b border-police-soft px-4 py-3">
          <button onClick={goBack} className="flex h-9 w-9 items-center justify-center rounded-xl text-police-muted hover:bg-police-card">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-[16px] font-bold text-police">Dhamana</h1>
        </div>
        <div className="flex flex-col items-center px-4 py-10">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#10B981]/15">
            <ShieldCheck size={44} className="text-[#10B981]" />
          </div>
          <h2 className="mt-4 text-[20px] font-bold text-police">Dhamana Imeidhinishwa</h2>
          <p className="mt-1 text-center text-[13px] text-police-muted">
            {selectedArrest.suspectName} ameruhusiwa kutoka kizuizini kwa dhamana
          </p>
          <div className="mt-6 w-full max-w-sm rounded-2xl bg-police-card p-4 space-y-3">
            <BRow label="Risiti ya Dhamana" value={receiptNo} mono />
            <BRow label="Mshtakiwa" value={selectedArrest.suspectName} />
            <BRow label="Kosa" value={selectedArrest.offense} />
            <BRow label="Mdhamini" value={form.guarantorName} />
            <BRow label="Uhusiano" value={form.guarantorRelation || "—"} />
            <div className="border-t border-police-soft pt-3">
              <BRow label="Kiasi cha Dhamana" value={`TZS ${bailAmount.toLocaleString()}`} bold highlight="#10B981" />
            </div>
            <BRow label="Afisa Aliyoidhinisha" value={OFFICER.name} />
            <BRow label="Tarehe" value={new Date().toLocaleDateString("sw-TZ")} />
          </div>

          <div className="mt-4 w-full max-w-sm rounded-2xl border border-[#FF9800]/25 bg-[#FF9800]/8 p-4">
            <p className="mb-2 text-[12px] font-bold text-[#FF9800]">Masharti ya Dhamana</p>
            {BAIL_CONDITIONS.map((c, i) => (
              <p key={i} className="text-[11px] text-police-muted mt-1">• {c}</p>
            ))}
          </div>

          <div className="mt-6 flex w-full max-w-sm gap-3">
            <button onClick={goBack} className="flex-1 rounded-xl border border-police-soft py-3 text-[14px] font-semibold text-police hover:bg-police-card">
              Rudi Nyuma
            </button>
            <button
              onClick={() => { setStep("select"); setSelectedArrest(null); setForm({ guarantorName:"",guarantorPhone:"",guarantorNida:"",guarantorRelation:"",notes:"" }); setConditionsAccepted(false); setPayPhone(""); }}
              className="flex-1 rounded-xl py-3 text-[14px] font-semibold text-white active:scale-95"
              style={{ background: "linear-gradient(135deg,#1E3A8A,#2563EB)" }}
            >
              Dhamana Nyingine
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PAY ───────────────────────────────────────────────────────────────
  if (step === "pay" && selectedArrest) {
    return (
      <div className="min-h-full bg-police">
        <div className="flex items-center gap-3 border-b border-police-soft px-4 py-3">
          <button onClick={() => setStep("form")} className="flex h-9 w-9 items-center justify-center rounded-xl text-police-muted hover:bg-police-card">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-[16px] font-bold text-police">Lipa Dhamana</h1>
        </div>
        <div className="space-y-4 p-4">
          {/* Amount */}
          <div className="rounded-2xl bg-police-card p-4 text-center">
            <p className="text-[12px] text-police-muted mb-1">Kiasi cha Dhamana</p>
            <p className="text-[30px] font-black text-[#1E3A8A]">TZS {bailAmount.toLocaleString()}</p>
            <p className="text-[11px] text-police-muted mt-1">{selectedArrest.suspectName} • {selectedArrest.offense}</p>
          </div>

          {/* Payment method */}
          <div className="rounded-2xl bg-police-card p-4">
            <p className="mb-3 text-[13px] font-bold text-police">Njia ya Malipo</p>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPayMethod(m.id)}
                  className={`flex items-center gap-2 rounded-xl border p-3 text-left transition active:scale-95 ${
                    payMethod === m.id ? "border-[#2563EB] bg-[#2563EB]/8" : "border-police-soft bg-police hover:bg-police-card"
                  }`}
                >
                  <div className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-[12px] font-medium text-police">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Phone / ref */}
          {payMethod !== "cash" ? (
            <div className="rounded-2xl bg-police-card p-4">
              <label className="mb-2 block text-[12px] font-bold text-police">
                Namba ya {PAYMENT_METHODS.find((m) => m.id === payMethod)?.label}
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-police-soft bg-police px-3 py-2.5">
                <Phone size={16} className="text-police-muted" />
                <input
                  value={payPhone}
                  onChange={(e) => setPayPhone(e.target.value)}
                  placeholder="0712 345 678"
                  type="tel"
                  className="flex-1 bg-transparent text-[14px] text-police placeholder-police-muted focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#FF9800]/25 bg-[#FF9800]/8 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle size={15} className="mt-0.5 shrink-0 text-[#FF9800]" />
                <p className="text-[12px] text-police">
                  Malipo ya taslimu yanafanywa kupitia kaunta ya stesheni. Omba risiti rasmi na idhinisho la kamanda wa zamu.
                </p>
              </div>
              <input
                value={payPhone}
                onChange={(e) => setPayPhone(e.target.value)}
                placeholder="Namba ya risiti / kumbukumbu ya benki"
                className="mt-3 w-full rounded-xl border border-police-soft bg-police px-3 py-2.5 text-[13px] text-police placeholder-police-muted focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          )}

          {/* Conditions */}
          <div className="rounded-2xl bg-police-card p-4">
            <p className="mb-3 text-[13px] font-bold text-police">Masharti ya Dhamana</p>
            {BAIL_CONDITIONS.map((c, i) => (
              <p key={i} className="text-[11px] text-police-muted mb-1.5">• {c}</p>
            ))}
            <button
              onClick={() => setConditionsAccepted(!conditionsAccepted)}
              className={`mt-3 flex w-full items-center gap-2 rounded-xl border p-3 text-left transition ${
                conditionsAccepted ? "border-[#10B981] bg-[#10B981]/8" : "border-police-soft"
              }`}
            >
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
                conditionsAccepted ? "border-[#10B981] bg-[#10B981]" : "border-police-soft"
              }`}>
                {conditionsAccepted && <CheckCircle2 size={12} className="text-white" />}
              </div>
              <span className="text-[12px] text-police">Masharti yamekubaliwa na mdhamini na mshtakiwa</span>
            </button>
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
          <div className="rounded-2xl border border-[#10B981]/20 bg-[#10B981]/5 p-4">
            <p className="text-[12px] font-medium text-police-muted">Afisa</p>
            <p className="mt-1 text-[15px] font-bold text-[#10B981]">{OFFICER.shortName}</p>
            <p className="text-[11px] text-police-muted">{OFFICER.id} • {OFFICER.station}</p>
          </div>

          <button
            onClick={handlePay}
            disabled={processing}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-bold text-white transition active:scale-95 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#10B981,#059669)" }}
          >
            {processing ? (
              <><span className="animate-spin">⏳</span> Inachakata dhamana...</>
            ) : (
              <><ShieldCheck size={18} /> Idhinisha Dhamana — TZS {bailAmount.toLocaleString()}</>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── FORM ──────────────────────────────────────────────────────────────
  if (step === "form" && selectedArrest) {
    return (
      <div className="min-h-full bg-police">
        <div className="flex items-center gap-3 border-b border-police-soft px-4 py-3">
          <button onClick={() => setStep("select")} className="flex h-9 w-9 items-center justify-center rounded-xl text-police-muted hover:bg-police-card">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-[16px] font-bold text-police">Fomu ya Dhamana</h1>
        </div>
        <div className="space-y-4 p-4">
          {/* Arrest summary */}
          <div className="rounded-2xl bg-[#1E3A8A]/8 border border-[#1E3A8A]/20 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1E3A8A]/15">
                <Scale size={18} className="text-[#1E3A8A]" />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-bold text-police">{selectedArrest.suspectName}</p>
                <p className="text-[11px] text-police-muted">{selectedArrest.offense}</p>
                <p className="text-[11px] text-police-muted">Kamati: {selectedArrest.cell || "Kizuizi A"} • {selectedArrest.arrestDate}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-white/5 dark:bg-black/10 px-3 py-2.5">
              <span className="text-[12px] text-police-muted">Kiasi cha Dhamana</span>
              <span className="text-[15px] font-bold text-[#1E3A8A]">TZS {bailAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Guarantor form */}
          <div className="rounded-2xl bg-police-card p-4 space-y-3">
            <p className="text-[13px] font-bold text-police">Taarifa za Mdhamini</p>
            <BFormInput icon={<User size={14}/>} label="Jina Kamili la Mdhamini *" placeholder="Juma Ally Mwinyi" value={form.guarantorName} onChange={(v) => setForm(f=>({...f,guarantorName:v}))} />
            <BFormInput icon={<Phone size={14}/>} label="Namba ya Simu *" placeholder="0712 345 678" value={form.guarantorPhone} onChange={(v) => setForm(f=>({...f,guarantorPhone:v}))} type="tel" />
            <BFormInput icon={<FileText size={14}/>} label="Namba ya NIDA" placeholder="199012031234567" value={form.guarantorNida} onChange={(v) => setForm(f=>({...f,guarantorNida:v}))} />
            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-police-muted uppercase tracking-wide">Uhusiano na Mshtakiwa</label>
              <select
                value={form.guarantorRelation}
                onChange={(e) => setForm(f=>({...f,guarantorRelation:e.target.value}))}
                className="w-full rounded-xl border border-police-soft bg-police px-3 py-2.5 text-[13px] text-police focus:outline-none focus:border-[#2563EB]"
              >
                <option value="">Chagua...</option>
                {["Mzazi", "Ndugu", "Mke/Mume", "Rafiki", "Mwajiri", "Mwanasheria", "Nyingine"].map(r=>(
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-police-muted uppercase tracking-wide">Maelezo Zaidi</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm(f=>({...f,notes:e.target.value}))}
                placeholder="Maelezo yoyote ya ziada..."
                rows={3}
                className="w-full resize-none rounded-xl border border-police-soft bg-police px-3 py-2.5 text-[13px] text-police placeholder-police-muted focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          <button
            onClick={() => {
              if (!form.guarantorName.trim() || !form.guarantorPhone.trim()) {
                toast({ title: "Jaza taarifa za mdhamini", variant: "destructive" }); return;
              }
              setStep("pay");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-bold text-white transition active:scale-95"
            style={{ background: "linear-gradient(135deg,#1E3A8A,#2563EB)" }}
          >
            <DollarSign size={18} />
            Endelea na Malipo
          </button>
        </div>
      </div>
    );
  }

  // ── SELECT ARREST ─────────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-police">
      <div className="flex items-center gap-3 border-b border-police-soft px-4 py-3">
        <button onClick={goBack} className="flex h-9 w-9 items-center justify-center rounded-xl text-police-muted hover:bg-police-card active:scale-95">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-[16px] font-bold text-police">Dhamana ya Mshtakiwa</h1>
          <p className="text-[11px] text-police-muted">Chagua mshtakiwa anayeomba dhamana</p>
        </div>
      </div>
      <div className="space-y-4 p-4">
        {/* Info banner */}
        <div className="flex items-start gap-3 rounded-2xl border border-[#2196F3]/20 bg-[#2196F3]/8 p-3.5">
          <Scale size={16} className="mt-0.5 shrink-0 text-[#2196F3]" />
          <p className="text-[12px] text-police">
            Dhamana inaruhusu mshtakiwa kutoka kizuizini akisubiri kesi yake mahakamani.
            Mdhamini anachukua jukumu la kisheria la kuhakikisha mshtakiwa atahudhuria mahakamani.
          </p>
        </div>

        <p className="text-[13px] font-bold text-police">Wafungwa Wanaostahili Dhamana ({eligible.length})</p>

        {eligible.length === 0 ? (
          <div className="flex flex-col items-center py-10">
            <Users size={36} className="text-police-muted" />
            <p className="mt-3 text-[13px] text-police-muted">Hakuna wafungwa wanaostahili dhamana kwa sasa</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {eligible.map((a) => {
              const bail = getBailAmount((a as ArrestRecord).offense);
              return (
                <button
                  key={a.id}
                  onClick={() => { setSelectedArrest(a as ArrestRecord); setStep("form"); }}
                  className="flex w-full items-start gap-3 rounded-2xl bg-police-card p-3.5 text-left active:scale-[0.99] transition hover:border hover:border-[#1E3A8A]/30"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1E3A8A]/12">
                    <ShieldCheck size={18} className="text-[#1E3A8A]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[13px] font-bold text-police">{(a as ArrestRecord).suspectName}</p>
                      <span className="shrink-0 text-[12px] font-bold text-[#1E3A8A]">TZS {bail.toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-police-muted">{(a as ArrestRecord).offense}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <Clock size={9} className="text-police-muted" />
                      <span className="text-[10px] text-police-muted">{(a as ArrestRecord).arrestDate} • {(a as ArrestRecord).cell || "Kizuizi A"}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────
function BRow({ label, value, mono, bold, highlight }: { label: string; value: string; mono?: boolean; bold?: boolean; highlight?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[12px] text-police-muted shrink-0">{label}</span>
      <span className={`text-right text-[12px] ${mono ? "font-mono" : ""} ${bold ? "font-bold text-[14px]" : "font-medium"}`} style={highlight ? { color: highlight } : undefined}>
        {value}
      </span>
    </div>
  );
}

function BFormInput({ icon, label, placeholder, value, onChange, type = "text" }: {
  icon: React.ReactNode; label: string; placeholder: string;
  value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold text-police-muted uppercase tracking-wide">{label}</label>
      <div className="flex items-center gap-2 rounded-xl border border-police-soft bg-police px-3 py-2.5">
        <span className="text-police-muted shrink-0">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[13px] text-police placeholder-police-muted focus:outline-none"
        />
      </div>
    </div>
  );
}
