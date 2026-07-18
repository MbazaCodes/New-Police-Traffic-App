"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  User, Phone, ArrowRight, ArrowLeft, KeyRound, RefreshCw,
  CheckCircle2, ChevronRight, Car, Shield, UserCheck, MapPin,
  Search, Lock, Globe, Package, FileSearch, Landmark, Building2,
  Building, ShieldCheck, Server, Eye, FileText, Phone as PhoneIcon,
  ClipboardList, Monitor, Users, ChevronDown,
} from "lucide-react";
import { usePoliceStore, type AuthRole } from "@/store/police-store";
import { saveLoginIdentifier } from "@/lib/session-context";
import type { UserRole } from "@/store/police-store";

type Step = "category" | "role" | "credentials" | "otp" | "success";

// ── Category definitions ──────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: "command",
    label: "Uongozi",
    labelEn: "Command",
    icon: Landmark,
    color: "#1E3A8A",
    description: "IGP, DIG, Makamishna wa Mikoa, Wilaya, Vituo",
  },
  {
    id: "officers",
    label: "Maafisa wa Uwanja",
    labelEn: "Field Officers",
    icon: Shield,
    color: "#2196F3",
    description: "Trafiki, Polisi Jumla, Posti",
  },
  {
    id: "cid",
    label: "Upelelezi (CID)",
    labelEn: "CID & Investigations",
    icon: Search,
    color: "#EF4444",
    description: "Upelelezi, Uhalifu wa Mtandaoni, Msimamizi",
  },
  {
    id: "specialist",
    label: "Idara Maalum",
    labelEn: "Specialist Units",
    icon: Package,
    color: "#FF9800",
    description: "Uhamiaji, Magereza, Dharura, Ushahidi, Ukaguzi",
  },
  {
    id: "admin",
    label: "Utawala",
    labelEn: "Administration",
    icon: Server,
    color: "#10B981",
    description: "Msimamizi wa Mfumo, Karani, Mwangalizi",
  },
] as const;

type CategoryId = typeof CATEGORIES[number]["id"];

// ── Role definitions per category ─────────────────────────────────────────
const ROLES_BY_CATEGORY: Record<CategoryId, {
  id: AuthRole; label: string; labelSw: string; icon: React.ElementType; color: string;
}[]> = {
  command: [
    { id: "NATIONAL_COMMANDER",  label: "IGP",                       labelSw: "Mkurugenzi Mkuu wa Polisi",    icon: Landmark,   color: "#1E3A8A" },
    { id: "DIG",                 label: "Deputy IGP",                labelSw: "Naibu Mkurugenzi Mkuu",       icon: ShieldCheck, color: "#1E3A8A" },
    { id: "SUPER_ADMIN",         label: "Super Admin",               labelSw: "Msimamizi Mkuu",              icon: ShieldCheck, color: "#1E3A8A" },
    { id: "REGIONAL_COMMANDER",  label: "Regional Commissioner",     labelSw: "Kamishna wa Mkoa",            icon: MapPin,      color: "#2196F3" },
    { id: "DISTRICT_COMMANDER",  label: "District Commander",        labelSw: "Kamanda wa Wilaya",           icon: Building2,   color: "#2196F3" },
    { id: "STATION_COMMANDER",   label: "Station Commissioner",      labelSw: "Kamishna wa Kituo",           icon: Building,    color: "#2196F3" },
  ],
  officers: [
    { id: "TRAFFIC_OFFICER",     label: "Traffic Officer",           labelSw: "Afisa Trafiki",               icon: Car,         color: "#2196F3" },
    { id: "GENERAL_OFFICER",     label: "General Officer",           labelSw: "Afisa Polisi wa Jumla",       icon: UserCheck,   color: "#2196F3" },
    { id: "POST_OFFICER",        label: "Post Officer",              labelSw: "Afisa wa Posti",              icon: MapPin,      color: "#2196F3" },
  ],
  cid: [
    { id: "INVESTIGATOR",              label: "CID / Investigator",          labelSw: "Mpelelezi",                   icon: Search,         color: "#EF4444" },
    { id: "CID_OFFICER",               label: "CID Officer",                 labelSw: "Afisa CID",                   icon: Search,         color: "#EF4444" },
    { id: "INVESTIGATION_SUPERVISOR",  label: "Investigation Supervisor",    labelSw: "Msimamizi wa Uchunguzi",      icon: ClipboardList,  color: "#EF4444" },
    { id: "CYBER_CRIME",               label: "Cyber Crime Unit",            labelSw: "Uhalifu wa Mtandaoni",        icon: Monitor,        color: "#EF4444" },
  ],
  specialist: [
    { id: "IMMIGRATION_LIAISON",     label: "Immigration Liaison",       labelSw: "Afisa Uhamiaji",              icon: Globe,      color: "#FF9800" },
    { id: "PRISON_LIAISON",          label: "Prison Liaison",            labelSw: "Afisa Magereza",              icon: Lock,       color: "#FF9800" },
    { id: "EMERGENCY_DISPATCHER",    label: "Emergency Dispatcher",      labelSw: "Msimamizi wa Dharura (911)", icon: PhoneIcon,  color: "#FF9800" },
    { id: "EVIDENCE_OFFICER",        label: "Evidence Officer",          labelSw: "Afisa Ushahidi",              icon: Package,    color: "#FF9800" },
    { id: "AUDIT_OFFICER",           label: "Audit / Internal Affairs",  labelSw: "Afisa Ukaguzi",               icon: FileSearch, color: "#FF9800" },
  ],
  admin: [
    { id: "SYSTEM_ADMIN",  label: "System Admin",  labelSw: "Msimamizi wa Mfumo",  icon: Server,   color: "#10B981" },
    { id: "CLERK",         label: "Clerk",          labelSw: "Karani",              icon: FileText, color: "#10B981" },
    { id: "VIEWER",        label: "Viewer",          labelSw: "Mwangalizi",          icon: Eye,      color: "#10B981" },
  ],
};

export function LoginScreen({ mode = "admin" }: { mode?: "officer" | "admin" }) {
  const login        = usePoliceStore((s) => s.login);
  const loginAsRole  = usePoliceStore((s) => s.loginAsRole);
  const setLoginIdentifier = usePoliceStore((s) => s.setLoginIdentifier);

  const [step, setStep]               = useState<Step>("category");
  const [category, setCategory]       = useState<CategoryId | null>(null);
  const [selectedRole, setSelectedRole] = useState<AuthRole | null>(null);
  const [method, setMethod]           = useState<"username" | "phone">("username");
  const [identifier, setIdentifier]   = useState("");
  const [otp, setOtp]                 = useState(["","","","","",""]);
  const [sending, setSending]         = useState(false);
  const [verifying, setVerifying]     = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [errorMsg, setErrorMsg]       = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val; setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };
  const handleOtpKey = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    if (!text) return;
    const next = ["","","","","",""]; text.split("").forEach((c,i) => (next[i]=c));
    setOtp(next); otpRefs.current[Math.min(text.length,5)]?.focus();
  };

  const sendOtp = async () => {
    const cleanId = identifier.trim();
    if (!cleanId) { setErrorMsg("Tafadhali ingiza username au namba ya simu."); return; }
    setErrorMsg(""); setSending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ identifier: cleanId }),
      });
      const data = await res.json().catch(() => ({}));
      // Demo mode: proceed regardless of API result
      if (data?.user?.role) setSelectedRole(data.user.role as AuthRole);
    } catch { /* demo mode continues */ } finally { setSending(false); }
    setOtp(["1","2","3","4","5","6"]);
    setStep("otp"); setResendTimer(45);
    setTimeout(() => otpRefs.current[5]?.focus(), 100);
  };

  const verifyOtp = () => {
    const code = otp.join("");
    if (!/^\d{6}$/.test(code)) { setErrorMsg("OTP lazima iwe na tarakimu 6."); return; }
    setErrorMsg(""); setVerifying(true);
    const role = selectedRole!;
    saveLoginIdentifier(identifier.trim());
    setLoginIdentifier(identifier.trim());
    setStep("success");
    setTimeout(() => {
      setVerifying(false);
      loginAsRole(role);
    }, 900);
  };

  const catColor = category ? CATEGORIES.find(c => c.id === category)?.color ?? "#1E3A8A" : "#1E3A8A";
  const roleInfo = selectedRole
    ? Object.values(ROLES_BY_CATEGORY).flat().find(r => r.id === selectedRole)
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#0d1b3d] via-[#1E3A8A] to-[#1565C0]">

      {/* Header */}
      <div className="flex flex-col items-center gap-3 px-6 pt-10 pb-6 sm:pt-14">
        <div className="relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full border-4 border-white/20 bg-white shadow-2xl">
          <Image src="/police-logo.png" alt="TPF" fill style={{objectFit:"contain"}} priority />
        </div>
        <div className="text-center">
          <h1 className="text-[18px] sm:text-[22px] font-extrabold tracking-wide text-white">
            TANZANIA POLICE FORCE
          </h1>
          <p className="text-[11px] sm:text-[13px] font-medium tracking-widest text-blue-200">
            USALAMA WETU, JUKUMU LETU
          </p>
        </div>
      </div>

      {/* Main card */}
      <div className="mx-auto w-full max-w-md flex-1 px-4 pb-8 sm:max-w-lg">
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">

          {/* Progress bar */}
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-[#2196F3] transition-all duration-500"
              style={{ width:
                step==="category" ? "20%" : step==="role" ? "40%" :
                step==="credentials" ? "60%" : step==="otp" ? "80%" : "100%"
              }}
            />
          </div>

          <div className="p-5 sm:p-7">

            {/* ── STEP 1: CATEGORY ─────────────────────────── */}
            {step === "category" && (
              <>
                <h2 className="text-[18px] font-bold text-[#0d1b3d]">Ingia kwenye Mfumo</h2>
                <p className="mt-1 text-[13px] text-gray-500">Chagua aina ya akaunti yako</p>

                <div className="mt-5 grid grid-cols-1 gap-3">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => { setCategory(cat.id); setStep("role"); }}
                        className="flex items-center gap-4 rounded-xl border-2 border-gray-100 bg-white p-4 text-left transition hover:border-[#2196F3]/40 hover:bg-[#2196F3]/5 active:scale-[0.98]"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{backgroundColor:`${cat.color}18`}}>
                          <Icon size={22} style={{color:cat.color}} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-bold text-[#0d1b3d]">{cat.label}</p>
                          <p className="text-[11px] text-gray-400">{cat.description}</p>
                        </div>
                        <ChevronRight size={18} className="shrink-0 text-gray-300" />
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── STEP 2: ROLE ─────────────────────────────── */}
            {step === "role" && category && (
              <>
                <button onClick={() => setStep("category")} className="mb-4 flex items-center gap-1.5 text-[13px] font-medium text-[#2196F3]">
                  <ArrowLeft size={16} /> Rudi
                </button>
                <h2 className="text-[18px] font-bold text-[#0d1b3d]">Chagua Role</h2>
                <p className="mt-1 text-[13px] text-gray-500">
                  {CATEGORIES.find(c=>c.id===category)?.label} — chagua nafasi yako haswa
                </p>

                <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {ROLES_BY_CATEGORY[category].map((r) => {
                    const Icon = r.icon;
                    const isSelected = selectedRole === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => { setSelectedRole(r.id); setStep("credentials"); }}
                        className={`flex items-center gap-3 rounded-xl border-2 p-3.5 text-left transition active:scale-[0.98] ${
                          isSelected
                            ? "border-[#2196F3] bg-[#2196F3]/8"
                            : "border-gray-100 hover:border-[#2196F3]/30 hover:bg-[#2196F3]/4"
                        }`}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{backgroundColor:`${r.color}15`}}>
                          <Icon size={18} style={{color:r.color}} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-bold leading-tight text-[#0d1b3d]">{r.label}</p>
                          <p className="text-[10px] text-gray-400 leading-tight">{r.labelSw}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── STEP 3: CREDENTIALS ──────────────────────── */}
            {step === "credentials" && selectedRole && (
              <>
                <button onClick={() => setStep("role")} className="mb-4 flex items-center gap-1.5 text-[13px] font-medium text-[#2196F3]">
                  <ArrowLeft size={16} /> Rudi
                </button>

                {/* Selected role badge */}
                <div className="mb-4 flex items-center gap-3 rounded-xl bg-[#1E3A8A]/8 p-3">
                  {(() => { const Icon = roleInfo?.icon ?? Shield; return <Icon size={18} style={{color:roleInfo?.color ?? "#1E3A8A"}} />; })()}
                  <div>
                    <p className="text-[12px] font-bold text-[#1E3A8A]">{roleInfo?.label}</p>
                    <p className="text-[10px] text-gray-400">{roleInfo?.labelSw}</p>
                  </div>
                </div>

                <h2 className="text-[17px] font-bold text-[#0d1b3d]">Ingiza Kitambulisho</h2>

                {/* Method toggle */}
                <div className="mt-3 flex gap-1.5 rounded-xl bg-gray-100 p-1">
                  {(["username","phone"] as const).map((m) => (
                    <button key={m} onClick={() => setMethod(m)}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-semibold transition ${
                        method===m ? "bg-white text-[#2196F3] shadow-sm" : "text-gray-500"
                      }`}>
                      {m==="username" ? <><User size={13}/> Username</> : <><Phone size={13}/> Simu</>}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <div className="mt-3">
                  <div className="flex items-center gap-2.5 rounded-xl border-2 border-gray-200 bg-white px-3.5 focus-within:border-[#2196F3]">
                    {method==="username" ? <User size={18} className="text-[#2196F3]"/> : <Phone size={18} className="text-[#2196F3]"/>}
                    <input
                      value={identifier}
                      onChange={(e) => { setIdentifier(e.target.value); setErrorMsg(""); }}
                      onKeyDown={(e) => e.key==="Enter" && sendOtp()}
                      placeholder={method==="username" ? "Ingiza username yako" : "07XX XXX XXX"}
                      inputMode={method==="phone" ? "tel" : "text"}
                      autoComplete="username"
                      className="h-12 flex-1 bg-transparent text-[14px] text-[#0d1b3d] placeholder:text-gray-300 focus:outline-none"
                    />
                  </div>
                  {errorMsg && <p className="mt-1.5 text-[12px] text-[#EF4444]">{errorMsg}</p>}
                </div>

                {/* Demo hint */}
                <div className="mt-3 rounded-xl border border-[#2196F3]/20 bg-[#2196F3]/5 px-3 py-2.5">
                  <p className="text-[11px] text-[#1E3A8A]">
                    <span className="font-bold">Demo Mode —</span> Ingiza username yoyote sahihi. OTP itajazwa kiotomatiki: <span className="font-bold tracking-widest">123456</span>
                  </p>
                </div>

                <button
                  onClick={sendOtp}
                  disabled={sending || !identifier.trim()}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] py-3.5 text-[14px] font-bold text-white disabled:opacity-50 active:scale-[0.98] transition"
                >
                  {sending ? <RefreshCw size={16} className="animate-spin"/> : <><ArrowRight size={16}/> Endelea</>}
                </button>
              </>
            )}

            {/* ── STEP 4: OTP ──────────────────────────────── */}
            {step === "otp" && (
              <>
                <div className="mb-4 flex items-center gap-3 rounded-xl bg-[#1E3A8A]/8 p-3">
                  {(() => { const Icon = roleInfo?.icon ?? Shield; return <Icon size={18} style={{color:roleInfo?.color ?? "#1E3A8A"}} />; })()}
                  <div>
                    <p className="text-[12px] font-bold text-[#1E3A8A]">{roleInfo?.label}</p>
                    <p className="text-[10px] text-gray-400">{identifier}</p>
                  </div>
                </div>

                <h2 className="text-[17px] font-bold text-[#0d1b3d]">Thibitisha OTP</h2>
                <p className="mt-1 text-[12px] text-gray-500">OTP imejazwa kiotomatiki. Bonyeza Thibitisha.</p>

                {/* Demo badge */}
                <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-[#2196F3]/30 bg-[#2196F3]/8 py-2.5">
                  <span className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wide">Demo</span>
                  <span className="rounded-lg bg-[#1E3A8A] px-3 py-0.5 text-[14px] font-bold tracking-[0.4em] text-white">123456</span>
                </div>

                {/* OTP inputs */}
                <div className="mt-4 flex justify-center gap-2 sm:gap-3">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      value={digit}
                      maxLength={1}
                      inputMode="numeric"
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKey(i, e)}
                      onPaste={handleOtpPaste}
                      className="h-12 w-10 rounded-xl border-2 border-gray-200 bg-white text-center text-[18px] font-bold text-[#1E3A8A] focus:border-[#2196F3] focus:outline-none sm:h-13 sm:w-12"
                    />
                  ))}
                </div>

                {errorMsg && <p className="mt-2 text-center text-[12px] text-[#EF4444]">{errorMsg}</p>}

                <button
                  onClick={verifyOtp}
                  disabled={verifying || otp.join("").length < 6}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] py-3.5 text-[14px] font-bold text-white disabled:opacity-50 transition active:scale-[0.98]"
                >
                  {verifying ? <RefreshCw size={16} className="animate-spin"/> : <><KeyRound size={16}/> Thibitisha OTP</>}
                </button>

                <button
                  onClick={() => { setStep("credentials"); setOtp(["","","","","",""]); }}
                  className="mt-2.5 w-full py-2 text-[12px] font-medium text-gray-400"
                >
                  ← Rudi nyuma
                </button>

                {resendTimer > 0 ? (
                  <p className="mt-1 text-center text-[11px] text-gray-400">Tuma tena kwa sekunde {resendTimer}</p>
                ) : (
                  <button onClick={sendOtp} className="mt-1 w-full text-center text-[12px] font-medium text-[#2196F3]">
                    <RefreshCw size={12} className="inline mr-1"/> Tuma OTP tena
                  </button>
                )}
              </>
            )}

            {/* ── STEP 5: SUCCESS ──────────────────────────── */}
            {step === "success" && (
              <div className="flex flex-col items-center py-6">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
                  <span className="absolute inset-0 animate-ping rounded-full bg-green-200 opacity-40" />
                  <CheckCircle2 size={44} className="relative z-10 text-green-500" />
                </div>
                <h2 className="mt-4 text-[19px] font-bold text-[#0d1b3d]">Login Imefanikiwa!</h2>
                <p className="mt-1 text-center text-[13px] text-gray-500">
                  Karibu, {roleInfo?.labelSw}. Inaingia...
                </p>
                <div className="mt-4 h-1.5 w-40 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-[#2196F3]"
                    style={{animation:"progress-fill 0.85s ease-in-out forwards"}}/>
                </div>
                <style>{`@keyframes progress-fill{from{width:0%}to{width:100%}}`}</style>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <p className="mt-5 text-center text-[11px] text-blue-200/60">
          Mfumo Salama wa Jeshi la Polisi Tanzania • © 2026 Tanzania Police Force
        </p>
      </div>
    </div>
  );
}
