"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeft, Search, CreditCard, CheckCircle2, AlertTriangle,
  Clock, Phone, User, FileText, Wallet, Receipt, TrendingUp,
} from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { useOfficer } from "@/hooks/use-officer";
import { toast } from "@/hooks/use-toast";
import { CITATION_HISTORY } from "@/lib/police-data";

// ── Penalty escalation: +5% per 7-day window of overdue ──────────────────
function calcPenalty(baseAmountStr: string, dueDateStr: string): {
  base: number; penalty: number; total: number; weeksOverdue: number;
} {
  const base = parseInt(baseAmountStr.replace(/[^\d]/g, ""), 10) || 0;
  // Parse due date — try multiple formats
  const due = new Date(dueDateStr);
  const now = new Date();
  if (isNaN(due.getTime()) || now <= due) {
    return { base, penalty: 0, total: base, weeksOverdue: 0 };
  }
  const msOverdue = now.getTime() - due.getTime();
  const daysOverdue = Math.floor(msOverdue / (1000 * 60 * 60 * 24));
  const weeksOverdue = Math.floor(daysOverdue / 7);
  const penaltyRate = weeksOverdue * 0.05; // 5% per 7 days
  const penalty = Math.round(base * penaltyRate);
  return { base, penalty, total: base + penalty, weeksOverdue };
}

const PAYMENT_METHODS = [
  { id: "mpesa",   label: "M-Pesa",   color: "#10B981" },
  { id: "tigopesa",label: "Tigo Pesa",color: "#0066CC" },
  { id: "airtel",  label: "Airtel Money", color: "#EF4444" },
  { id: "cash",    label: "Taslimu",  color: "#FF9800" },
];

const MINOR_OFFENSES = [
  { label: "Kutopita kasi (Speed bumps)", amount: 30000 },
  { label: "Kutovaa mkanda wa usalama", amount: 50000 },
  { label: "Kutumia simu unapodereva", amount: 50000 },
  { label: "Taa za gari hazijakaa sawa", amount: 30000 },
  { label: "Gari chafu kupita kiasi", amount: 20000 },
  { label: "Kupakua abiria mahali pasiporuhusiwa", amount: 40000 },
  { label: "Kukiuka alama za barabara", amount: 50000 },
  { label: "Nyaraka za gari nje ya muda", amount: 75000 },
  { label: "Bima ya gari imekwisha", amount: 100000 },
  { label: "Nyingine", amount: 0 },
];

type Step = "search" | "review" | "pay" | "done";

interface FinePrefill {
  id?: string;
  driverName: string;
  driverPhone: string;
  plate: string;
  offense: string;
  fineAmount: string;
  dueDate: string;
  isNew?: boolean;
}

export function FinePaymentScreen() {
  const { goBack } = usePoliceStore();
  const OFFICER = useOfficer();

  const [step, setStep] = useState<Step>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFine, setSelectedFine] = useState<FinePrefill | null>(null);

  // New fine fields
  const [isNew, setIsNew] = useState(false);
  const [newForm, setNewForm] = useState({
    driverName: "", driverPhone: "", plate: "",
    offense: MINOR_OFFENSES[0].label,
    customAmount: "",
    dueDate: "",
  });

  // Payment
  const [payMethod, setPayMethod] = useState("mpesa");
  const [payPhone, setPayPhone] = useState("");
  const [ref, setRef] = useState("");
  const [processing, setProcessing] = useState(false);

  const receiptNo = useMemo(() => `FP-2026-${Math.floor(1000 + Math.random() * 9000)}`, []);

  // ── Search existing unpaid citations ──────────────────────────────────
  const unpaid = CITATION_HISTORY.filter((c) => c.status === "Hajalipwa");
  const filtered = searchQuery.trim()
    ? unpaid.filter((c) =>
        c.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : unpaid;

  const penalty = selectedFine
    ? calcPenalty(selectedFine.fineAmount, selectedFine.dueDate)
    : null;

  // ── New-fine offense amount ────────────────────────────────────────────
  const selectedOffense = MINOR_OFFENSES.find((o) => o.label === newForm.offense);
  const newAmount = newForm.offense === "Nyingine"
    ? parseInt(newForm.customAmount || "0", 10)
    : (selectedOffense?.amount ?? 0);

  function selectCitation(c: typeof CITATION_HISTORY[0]) {
    // Mock due date: 30 days after citation date
    const parts = c.date.split(" ");
    const months: Record<string, number> = {
      Jan:0,Feb:1,Mar:2,Apr:3,Mei:4,Jun:5,Jul:6,Ago:7,Sep:8,Okt:9,Nov:10,Des:11,
      May:4,Aug:7,Oct:9,Dec:11,
    };
    const day = parseInt(parts[0], 10);
    const mon = months[parts[1]] ?? 0;
    const yr = parseInt(parts[2], 10);
    const due = new Date(yr, mon, day + 30);
    setSelectedFine({
      id: c.id, driverName: c.driver, driverPhone: "0712 345 678",
      plate: c.plate, offense: c.offense, fineAmount: c.fine,
      dueDate: due.toISOString(), isNew: false,
    });
    setStep("review");
  }

  function startNewFine() {
    setIsNew(true);
    const today = new Date();
    const due = new Date(today); due.setDate(due.getDate() + 30);
    setSelectedFine({
      driverName: "", driverPhone: "", plate: "",
      offense: "", fineAmount: `TZS ${newAmount.toLocaleString()}`,
      dueDate: due.toISOString(), isNew: true,
    });
    setStep("review");
  }

  function handlePay() {
    if (!payPhone.trim()) {
      toast({ title: "Ingiza namba ya malipo", variant: "destructive" }); return;
    }
    setProcessing(true);
    const fine = selectedFine!;
    const pen = penalty!;

    // Persist to DB
    const persist = async () => {
      try {
        if (fine.id) {
          // Existing citation — mark as paid
          await fetch("/api/fines", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "pay", fineId: fine.id, paymentMethod: payMethod, paymentRef: `${payMethod.toUpperCase()}-${Date.now()}` }),
          });
        } else {
          // New fine — create + pay in one step
          await fetch("/api/fines", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "create",
              driverName: fine.driverName, driverPhone: fine.driverPhone,
              plate: fine.plate, offense: fine.offense,
              baseAmount: pen.base, dueDate: fine.dueDate,
            }),
          });
        }
      } catch { /* offline — show success anyway */ }
    };

    persist().then(() => {
      setProcessing(false);
      setRef(`REF${Date.now().toString().slice(-8)}`);
      setStep("done");
      toast({ title: "Malipo Yamekamilika ✓", description: `Faini imelipwa. Risiti: ${receiptNo}` });
    });
  }

  // ── DONE ──────────────────────────────────────────────────────────────
  if (step === "done" && selectedFine) {
    const p = calcPenalty(selectedFine.fineAmount, selectedFine.dueDate);
    return (
      <div className="min-h-full bg-police">
        <div className="flex items-center gap-3 border-b border-police-soft px-4 py-3">
          <button onClick={goBack} className="flex h-9 w-9 items-center justify-center rounded-xl text-police-muted hover:bg-police-card active:scale-95">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-[16px] font-bold text-police">Malipo ya Faini</h1>
        </div>
        <div className="flex flex-col items-center px-4 py-10">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#10B981]/15">
            <CheckCircle2 size={44} className="text-[#10B981]" />
          </div>
          <h2 className="mt-4 text-[20px] font-bold text-police">Malipo Yamekubaliwa</h2>
          <p className="mt-1 text-center text-[13px] text-police-muted">Faini imelipwa kikamilifu</p>
          <div className="mt-6 w-full max-w-sm rounded-2xl bg-police-card p-4 space-y-3">
            <Row label="Risiti" value={receiptNo} mono />
            <Row label="Kumbukumbu" value={ref} mono />
            <Row label="Raia" value={selectedFine.driverName} />
            <Row label="Kosa" value={selectedFine.offense} />
            {p.penalty > 0 && <Row label="Faini ya Msingi" value={`TZS ${p.base.toLocaleString()}`} />}
            {p.penalty > 0 && <Row label={`Adhabu (${p.weeksOverdue} × 5%)`} value={`TZS ${p.penalty.toLocaleString()}`} highlight="#EF4444" />}
            <div className="border-t border-police-soft pt-3">
              <Row label="Jumla Iliyolipwa" value={`TZS ${p.total.toLocaleString()}`} bold highlight="#10B981" />
            </div>
            <Row label="Afisa" value={OFFICER.name} />
            <Row label="Tarehe" value={new Date().toLocaleDateString("sw-TZ")} />
          </div>
          <div className="mt-6 flex w-full max-w-sm gap-3">
            <button onClick={goBack} className="flex-1 rounded-xl border border-police-soft py-3 text-[14px] font-semibold text-police hover:bg-police-card active:scale-95">
              Rudi Nyuma
            </button>
            <button
              onClick={() => { setStep("search"); setSelectedFine(null); setPayPhone(""); }}
              className="flex-1 rounded-xl py-3 text-[14px] font-semibold text-white active:scale-95"
              style={{ background: "linear-gradient(135deg,#1E3A8A,#2563EB)" }}
            >
              Faini Nyingine
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PAY ───────────────────────────────────────────────────────────────
  if (step === "pay" && selectedFine && penalty) {
    return (
      <div className="min-h-full bg-police">
        <div className="flex items-center gap-3 border-b border-police-soft px-4 py-3">
          <button onClick={() => setStep("review")} className="flex h-9 w-9 items-center justify-center rounded-xl text-police-muted hover:bg-police-card">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-[16px] font-bold text-police">Lipa Faini</h1>
        </div>
        <div className="space-y-4 p-4">
          {/* Amount summary */}
          <div className="rounded-2xl bg-police-card p-4 text-center">
            {penalty.penalty > 0 && (
              <p className="text-[12px] text-police-muted line-through">TZS {penalty.base.toLocaleString()}</p>
            )}
            <p className="text-[28px] font-black text-[#1E3A8A]">TZS {penalty.total.toLocaleString()}</p>
            {penalty.penalty > 0 && (
              <p className="text-[11px] text-[#EF4444] font-semibold">
                + adhabu TZS {penalty.penalty.toLocaleString()} ({penalty.weeksOverdue} × 5%)
              </p>
            )}
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
                  <span className="text-[13px] font-medium text-police">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Phone number */}
          {payMethod !== "cash" && (
            <div className="rounded-2xl bg-police-card p-4">
              <label className="mb-2 block text-[12px] font-bold text-police">Namba ya {PAYMENT_METHODS.find((m) => m.id === payMethod)?.label}</label>
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
          )}
          {payMethod === "cash" && (
            <div className="rounded-2xl border border-[#FF9800]/30 bg-[#FF9800]/8 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[#FF9800]" />
                <p className="text-[13px] text-police">Mkopo wa taslimu lazima uthibitishwe na risiti iliyoandikwa na kusainiwa na afisa wa juu.</p>
              </div>
              <input
                value={payPhone}
                onChange={(e) => setPayPhone(e.target.value)}
                placeholder="Namba ya risiti ya taslimu"
                className="mt-3 w-full rounded-xl border border-police-soft bg-police px-3 py-2.5 text-[13px] text-police placeholder-police-muted focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={processing}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-bold text-white transition active:scale-95 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#10B981,#059669)" }}
          >
            {processing ? (
              <><span className="animate-spin">⏳</span> Inachakata malipo...</>
            ) : (
              <><Wallet size={18} /> Lipa TZS {penalty.total.toLocaleString()}</>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── REVIEW ────────────────────────────────────────────────────────────
  if (step === "review") {
    const fine = isNew ? {
      driverName: newForm.driverName, driverPhone: newForm.driverPhone,
      plate: newForm.plate, offense: newForm.offense,
      fineAmount: `TZS ${newAmount.toLocaleString()}`,
      dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString(); })(),
    } : selectedFine!;

    const pen = calcPenalty(fine?.fineAmount ?? "TZS 0", fine?.dueDate ?? "");

    return (
      <div className="min-h-full bg-police">
        <div className="flex items-center gap-3 border-b border-police-soft px-4 py-3">
          <button onClick={() => { setStep("search"); setIsNew(false); }} className="flex h-9 w-9 items-center justify-center rounded-xl text-police-muted hover:bg-police-card">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-[16px] font-bold text-police">{isNew ? "Faini Mpya" : "Mapitio ya Faini"}</h1>
        </div>
        <div className="space-y-4 p-4">
          {isNew && (
            <div className="rounded-2xl bg-police-card p-4 space-y-3">
              <p className="text-[13px] font-bold text-police mb-1">Taarifa za Raia</p>
              <FormInput icon={<User size={14}/>} placeholder="Jina kamili la raia *" value={newForm.driverName} onChange={(v)=>setNewForm(f=>({...f,driverName:v}))} />
              <FormInput icon={<Phone size={14}/>} placeholder="Namba ya simu" value={newForm.driverPhone} onChange={(v)=>setNewForm(f=>({...f,driverPhone:v}))} type="tel" />
              <FormInput icon={<FileText size={14}/>} placeholder="Namba ya gari (e.g. T 001 ABC)" value={newForm.plate} onChange={(v)=>setNewForm(f=>({...f,plate:v}))} />
              <div>
                <p className="mb-1.5 text-[11px] font-semibold text-police-muted uppercase tracking-wide">Kosa la Trafiki</p>
                <select
                  value={newForm.offense}
                  onChange={(e) => setNewForm((f) => ({ ...f, offense: e.target.value }))}
                  className="w-full rounded-xl border border-police-soft bg-police px-3 py-2.5 text-[13px] text-police focus:outline-none focus:border-[#2563EB]"
                >
                  {MINOR_OFFENSES.map((o) => (
                    <option key={o.label} value={o.label}>{o.label}{o.amount ? ` — TZS ${o.amount.toLocaleString()}` : ""}</option>
                  ))}
                </select>
              </div>
              {newForm.offense === "Nyingine" && (
                <FormInput icon={<Wallet size={14}/>} placeholder="Kiasi cha faini (TZS)" value={newForm.customAmount} onChange={(v)=>setNewForm(f=>({...f,customAmount:v}))} type="number" />
              )}
            </div>
          )}

          {/* Fine summary card */}
          <div className="rounded-2xl bg-police-card p-4 space-y-3">
            <p className="text-[13px] font-bold text-police">Muhtasari wa Faini</p>
            <Row label="Raia" value={isNew ? newForm.driverName || "—" : fine?.driverName ?? "—"} />
            <Row label="Namba ya Gari" value={isNew ? newForm.plate || "—" : fine?.plate ?? "—"} />
            <Row label="Kosa" value={isNew ? newForm.offense : fine?.offense ?? "—"} />
            <Row label="Faini ya Msingi" value={`TZS ${pen.base.toLocaleString()}`} />
            {pen.penalty > 0 && (
              <>
                <Row label={`Wiki ${pen.weeksOverdue} za Kuchelewa`} value={`${pen.weeksOverdue * 5}%`} highlight="#EF4444" />
                <Row label="Adhabu ya Kuchelewa" value={`TZS ${pen.penalty.toLocaleString()}`} highlight="#EF4444" />
              </>
            )}
            <div className="border-t border-police-soft pt-3">
              <Row label="JUMLA YA KULIPA" value={`TZS ${pen.total.toLocaleString()}`} bold highlight="#1E3A8A" />
            </div>
          </div>

          {/* Penalty warning */}
          {pen.weeksOverdue > 0 && (
            <div className="flex items-start gap-3 rounded-2xl border border-[#EF4444]/25 bg-[#EF4444]/8 p-3">
              <TrendingUp size={16} className="mt-0.5 shrink-0 text-[#EF4444]" />
              <p className="text-[12px] text-[#EF4444]">
                Faini hii imechelewa <strong>wiki {pen.weeksOverdue}</strong> ({pen.weeksOverdue * 7} siku).
                Adhabu ya <strong>5% kwa kila wiki = {pen.weeksOverdue * 5}%</strong> imeongezwa kiotomatiki.
                Kila siku 7 ijayo itaongeza 5% zaidi.
              </p>
            </div>
          )}

          <button
            onClick={() => {
              if (isNew) {
                if (!newForm.driverName.trim() || !newForm.plate.trim()) {
                  toast({ title: "Jaza sehemu zinazohitajika", variant: "destructive" }); return;
                }
                const d = new Date(); d.setDate(d.getDate() + 30);
                setSelectedFine({ ...fine!, fineAmount: `TZS ${pen.total.toLocaleString()}`, dueDate: d.toISOString(), isNew: true });
              }
              setStep("pay");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-bold text-white transition active:scale-95"
            style={{ background: "linear-gradient(135deg,#1E3A8A,#2563EB)" }}
          >
            <CreditCard size={18} />
            Endelea na Malipo — TZS {pen.total.toLocaleString()}
          </button>
        </div>
      </div>
    );
  }

  // ── SEARCH ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-police">
      <div className="flex items-center gap-3 border-b border-police-soft px-4 py-3">
        <button onClick={goBack} className="flex h-9 w-9 items-center justify-center rounded-xl text-police-muted hover:bg-police-card active:scale-95">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-[16px] font-bold text-police">Malipo ya Faini</h1>
          <p className="text-[11px] text-police-muted">Makosa Madogo ya Trafiki</p>
        </div>
      </div>
      <div className="space-y-4 p-4">
        {/* New fine button */}
        <button
          onClick={startNewFine}
          className="flex w-full items-center gap-3 rounded-2xl p-4 text-white transition active:scale-95"
          style={{ background: "linear-gradient(135deg,#10B981,#059669)" }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <Receipt size={20} />
          </div>
          <div className="text-left">
            <p className="text-[15px] font-bold">Faini Mpya</p>
            <p className="text-[11px] text-white/75">Rekodi faini mpya kwa raia</p>
          </div>
        </button>

        {/* Search existing */}
        <div>
          <p className="mb-2 text-[13px] font-bold text-police">Faini Zilizopo Hazijalipwa</p>
          <div className="flex items-center gap-2 rounded-xl border border-police-soft bg-police-card px-3 py-2.5 mb-3">
            <Search size={15} className="text-police-muted" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tafuta jina, namba ya gari, au ID..."
              className="flex-1 bg-transparent text-[13px] text-police placeholder-police-muted focus:outline-none"
            />
          </div>

          <div className="space-y-2.5">
            {filtered.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-police-muted">Hakuna faini zisizolipwa</p>
            ) : filtered.map((c) => {
              const parts = c.date.split(" ");
              const months: Record<string, number> = { Jan:0,Feb:1,Mar:2,Apr:3,Mei:4,Jun:5,Jul:6,Ago:7,Sep:8,Okt:9,Nov:10,Des:11,May:4,Aug:7,Oct:9,Dec:11 };
              const due = new Date(parseInt(parts[2],10), months[parts[1]]??0, parseInt(parts[0],10)+30);
              const pen = calcPenalty(c.fine, due.toISOString());
              return (
                <button
                  key={c.id}
                  onClick={() => selectCitation(c)}
                  className="flex w-full items-start gap-3 rounded-2xl bg-police-card p-3.5 text-left active:scale-[0.99] hover:border hover:border-[#2563EB]/30 transition"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EF4444]/12">
                    <Clock size={18} className="text-[#EF4444]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[13px] font-bold text-police">{c.driver}</p>
                      <span className="shrink-0 text-[12px] font-bold text-[#EF4444]">
                        TZS {pen.total.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-police-muted">{c.plate} • {c.offense}</p>
                    {pen.weeksOverdue > 0 && (
                      <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#EF4444]/10 px-2 py-0.5">
                        <TrendingUp size={9} className="text-[#EF4444]" />
                        <span className="text-[9px] font-bold text-[#EF4444]">+{pen.weeksOverdue * 5}% adhabu</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────
function Row({ label, value, mono, bold, highlight }: { label: string; value: string; mono?: boolean; bold?: boolean; highlight?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[12px] text-police-muted shrink-0">{label}</span>
      <span className={`text-right text-[12px] ${mono ? "font-mono" : ""} ${bold ? "font-bold text-[14px]" : "font-medium"}`} style={highlight ? { color: highlight } : undefined}>
        {value}
      </span>
    </div>
  );
}

function FormInput({ icon, placeholder, value, onChange, type = "text" }: {
  icon: React.ReactNode; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string;
}) {
  return (
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
  );
}
