// @ts-nocheck
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  ShieldCheck, Phone, Mail, Hash, ArrowRight, ArrowLeft,
  RefreshCw, KeyRound, CheckCircle2, User, Sparkles,
} from "lucide-react";
import { useCitizenStore } from "@/store/citizen-store";
import { useRouter } from "next/navigation";

type Step   = "credentials" | "otp" | "success";
type IdType = "phone" | "email" | "nida";
type Mode   = "login" | "register";

export default function CitizenEntry() {
  const router = useRouter();
  const { isAuthenticated, setCitizen } = useCitizenStore();

  // Force-clear stale session state after logout
  useEffect(() => {
    const hasForceClear = document.cookie.includes("tz-force-clear=1");
    if (hasForceClear) {
      localStorage.removeItem("tpf-citizen-store");
      localStorage.removeItem("citizen-token");
      localStorage.removeItem("citizen-session");
      localStorage.removeItem("tz-police-auth");
      sessionStorage.removeItem("tpf-login-id");
      sessionStorage.removeItem("tpf-officer-uid");
      document.cookie = "tz-force-clear=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    }
  }, []);

  // Detect PWA standalone mode
  const [isStandalone, setIsStandalone] = useState(false);
  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
  }, []);

  const [step, setStep]           = useState<Step>("credentials");
  const [mode, setMode]           = useState<Mode>("login");
  const [idType, setIdType]       = useState<IdType>("phone");
  const [identifier, setIdentifier] = useState("");
  const [name, setName]           = useState("");
  const [otp, setOtp]             = useState(["","","","","",""]);
  const [devOtp, setDevOtp]       = useState("");
  const [sending, setSending]     = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg]   = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement|null)[]>([]);

  useEffect(() => {
    if (isAuthenticated) router.replace("/citizen/dashboard");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val; setOtp(next);
    if (val && idx < 5) otpRefs.current[idx+1]?.focus();
  };
  const handleOtpKey = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      const next = [...otp]; next[idx-1] = ""; setOtp(next);
      otpRefs.current[idx-1]?.focus();
    }
  };
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    if (!text) return;
    const next = ["","","","","",""];
    text.split("").forEach((c,i) => (next[i] = c));
    setOtp(next as any);
    otpRefs.current[Math.min(text.length,5)]?.focus();
  };

  const maskedIdentifier = idType === "phone"
    ? identifier.replace(/(\d{3})\d+(\d{3})/, "$1****$2")
    : identifier.replace(/(.{2}).+(@.+)/, "$1***$2");

  const sendOtp = async () => {
    const id = identifier.trim();
    if (!id) { setErrorMsg("Weka " + (idType==="phone"?"namba ya simu":idType==="email"?"barua pepe":"NIDA")); return; }
    if (mode === "register" && !name.trim()) { setErrorMsg("Weka jina lako kamili"); return; }
    setErrorMsg(""); setSending(true);
    try {
      const res = await fetch("/api/citizen-portal/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: id, idType, name: name.trim() || undefined, mode }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok && res.status !== 409) { setErrorMsg(json.error || "Hitilafu. Jaribu tena."); return; }
      if (json.devOtp) setDevOtp(String(json.devOtp));
      setStep("otp"); setResendTimer(45);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch { setErrorMsg("Hitilafu ya mtandao. Jaribu tena."); }
    finally { setSending(false); }
  };

  const verifyOtp = async () => {
    const id = identifier.trim();
    const code = otp.join("");
    if (!id || code.length < 6) return;
    setErrorMsg(""); setVerifying(true);
    try {
      const res = await fetch("/api/citizen-portal/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: id, idType, otp: code }),
      });
      const json = await res.json().catch(() => ({}));
      if (!json.ok) { setErrorMsg(json.error || "OTP si sahihi. Jaribu tena."); return; }
      if (json.citizen) setCitizen(json.citizen);
      setStep("success");
      setTimeout(() => router.replace("/citizen/dashboard?pwa=1"), 1000);
    } catch { setErrorMsg("Hitilafu ya mtandao. Jaribu tena."); }
    finally { setVerifying(false); }
  };

  const otpComplete = otp.join("").length === 6;

  return (
    <div className="flex min-h-[100dvh] w-full safe-area-pb">

      {/* ── LEFT PANEL — Branding (desktop only) ── */}
      {!isStandalone && (
        <div className="relative hidden lg:flex lg:w-1/2 flex-col items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(160deg, #0a1a12 0%, #0d4f3c 50%, #0a1a12 100%)" }}>
          {/* Background pattern */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
            <div className="absolute bottom-0 left-0 right-0 h-64 opacity-20"
              style={{ background: "linear-gradient(to top, #10B981, transparent)" }} />
            <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, #2196F3, transparent 70%)" }} />
            <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, #10B981, transparent 70%)" }} />
          </div>

          <div className="relative z-10 flex flex-col items-center px-12 text-center">
            {/* Coat of arms */}
            <img src="/coat-of-arms.svg" alt="Coat of Arms" className="h-20 w-20 object-contain drop-shadow-lg mb-4"
              onError={e => { (e.target as HTMLImageElement).style.display="none"; }} />

            <p className="text-[13px] font-bold tracking-[0.2em] uppercase text-[#10B981] mb-1">
              JAMHURI YA MUUNGANO WA TANZANIA
            </p>
            <p className="text-[11px] tracking-[0.15em] uppercase text-white/50 mb-8">
              WIZARA YA MAMBO YA NDANI YA NCHI
            </p>

            {/* Police logo */}
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full blur-xl opacity-30"
                style={{ background: "radial-gradient(circle, #10B981, transparent)" }} />
              <div className="relative h-44 w-44 overflow-hidden rounded-full ring-2 ring-white/10 shadow-2xl">
                <Image src="/police-logo.png" alt="Tanzania Police Force"
                  width={176} height={176} className="h-full w-full object-cover" priority />
              </div>
            </div>

            <h1 className="text-[32px] font-black tracking-tight text-white leading-tight mb-2">
              JESHI LA POLISI<br />TANZANIA
            </h1>
            <div className="h-0.5 w-16 rounded-full mb-3"
              style={{ background: "linear-gradient(90deg, #10B981, #059669)" }} />
            <p className="text-[13px] text-white/40 tracking-wide">
              Tanzania Police — Huduma za Raia
            </p>

            {/* Citizen portal description */}
            <div className="mt-10 rounded-2xl bg-white/5 border border-white/10 p-5 text-left max-w-sm">
              <p className="text-[13px] font-bold text-white mb-2 flex items-center gap-2">
                <User size={16} className="text-[#10B981]" /> Huduma za Raia
              </p>
              {[
                "Angalia taarifa zako za kibinafsi",
                "Sajili magari na mali",
                "Toa malalamiko na ripoti",
                "Fuatilia maombi yako",
                "Lipa faini za trafiki",
              ].map(s => (
                <div key={s} className="flex items-center gap-2 mt-1.5 text-[11px] text-white/50">
                  <CheckCircle2 size={11} className="text-[#10B981] shrink-0" />
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-6 text-[10px] text-white/20 tracking-widest uppercase">
            © 2026 Tanzania Police Force — Huduma za Raia
          </div>
        </div>
      )}

      {/* ── RIGHT PANEL — Form (mobile-first, PWA-optimized) ── */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-3 sm:px-4 py-4 sm:py-8"
        style={{ background: isStandalone ? "#f0f4f8" : undefined, minHeight: "100dvh" }}>

        {/* PWA standalone: show status bar spacer */}
        {isStandalone && (
          <div style={{ height: "env(safe-area-inset-top, 0px)" }} />
        )}

        {/* Mobile logo — compact for small screens */}
        <div className="mb-3 sm:mb-6 flex flex-col items-center lg:hidden">
          <div className="h-14 sm:h-20 w-14 sm:w-20 overflow-hidden rounded-full shadow-lg">
            <Image src="/police-logo.png" alt="TPF" width={80} height={80} className="h-full w-full object-cover" />
          </div>
          <h1 className="mt-2 sm:mt-3 text-[14px] sm:text-[18px] font-black text-[#0f2347]">JESHI LA POLISI TANZANIA</h1>
          <p className="text-[10px] sm:text-[12px] text-[#10B981] font-semibold mt-0.5">Huduma za Raia</p>
          {/* PWA badge */}
          {isStandalone && (
            <div className="mt-1.5 flex items-center gap-1 rounded-full bg-[#10B981]/10 px-2.5 py-0.5">
              <Sparkles size={10} className="text-[#10B981]" />
              <span className="text-[9px] font-bold text-[#10B981]">Programu ya Simu</span>
            </div>
          )}
        </div>

        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white shadow-xl overflow-hidden">
            {/* Green accent bar (citizen theme) */}
            <div className="h-1.5 w-full"
              style={{ background: "linear-gradient(90deg, #10B981, #059669, #10B981)" }} />

            <div className="p-4 sm:p-6 lg:p-8">

              {/* ── CREDENTIALS STEP ── */}
              {step === "credentials" && (
                <>
                  {/* Logo inside card */}
                  <div className="flex flex-col items-center mb-4 sm:mb-5">
                    <div className="h-12 sm:h-14 w-12 sm:w-14 overflow-hidden rounded-full shadow mb-2 sm:mb-3">
                      <Image src="/police-logo.png" alt="TPF" width={56} height={56} className="h-full w-full object-cover" />
                    </div>
                    <h2 className="text-[18px] sm:text-[20px] font-black text-[#0f2347]">Ingia kwenye Mfumo</h2>
                    <p className="text-[11px] sm:text-[12px] text-gray-400 mt-0.5">Chagua njia yako ya kuingia</p>
                  </div>

                  {/* Mode toggle — Ingia / Jisajili */}
                  <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-4 sm:mb-5">
                    {([["login","🔑 Ingia"],["register","✨ Jisajili"]] as const).map(([m, label]) => (
                      <button key={m} onClick={() => { setMode(m); setErrorMsg(""); }}
                        className={`flex-1 py-2 sm:py-2.5 text-[12px] sm:text-[13px] font-bold transition touch-manipulation ${
                          mode === m
                            ? "bg-[#0f2347] text-white"
                            : "bg-white text-gray-400 hover:bg-gray-50"
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Registration name field */}
                  {mode === "register" && (
                    <div className="mb-3 sm:mb-4">
                      <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                        Jina Kamili *
                      </label>
                      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 focus-within:border-[#10B981] focus-within:ring-2 focus-within:ring-[#10B981]/20 transition">
                        <User size={16} className="shrink-0 text-[#10B981]" />
                        <input value={name} onChange={e => setName(e.target.value)}
                          placeholder="Jina na Familiya"
                          className="h-10 sm:h-11 flex-1 bg-transparent text-[13px] sm:text-[14px] text-gray-900 placeholder:text-gray-300 focus:outline-none" />
                      </div>
                    </div>
                  )}

                  {/* Label */}
                  <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Ingia kwa
                  </label>

                  {/* Method buttons */}
                  <div className="flex gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    {([
                      ["phone", "📞 Simu"],
                      ["email", "✉ Barua"],
                      ["nida",  "# NIDA"],
                    ] as const).map(([t, label]) => (
                      <button key={t}
                        onClick={() => { setIdType(t); setIdentifier(""); setErrorMsg(""); }}
                        className={`flex-1 rounded-xl border py-2 text-[11px] sm:text-[12px] font-bold transition touch-manipulation ${
                          idType === t
                            ? "border-[#0f2347] bg-[#0f2347] text-white"
                            : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Identifier input */}
                  <div className="mb-3 sm:mb-4">
                    <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      {idType === "phone" ? "Namba ya Simu" : idType === "email" ? "Barua Pepe" : "Namba ya NIDA"}
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 focus-within:border-[#10B981] focus-within:ring-2 focus-within:ring-[#10B981]/20 transition">
                      {idType === "phone" && (
                        <>
                          <Phone size={16} className="shrink-0 text-[#10B981]" />
                          <span className="shrink-0 border-r border-gray-200 pr-2 text-[13px] font-bold text-gray-400">+255</span>
                        </>
                      )}
                      {idType === "email" && <Mail size={16} className="shrink-0 text-[#10B981]" />}
                      {idType === "nida"  && <Hash size={16} className="shrink-0 text-[#10B981]" />}
                      <input value={identifier} onChange={e => setIdentifier(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && sendOtp()}
                        placeholder={
                          idType === "phone" ? "e.g. 712345678"
                          : idType === "email" ? "jina@barua.com"
                          : "YYYYMMDD-XXXXX-XX"
                        }
                        inputMode={idType === "phone" ? "tel" : idType === "email" ? "email" : "text"}
                        className="h-10 sm:h-11 flex-1 bg-transparent text-[13px] sm:text-[14px] text-gray-900 placeholder:text-gray-300 focus:outline-none" />
                    </div>
                    <p className="mt-1 text-[10px] sm:text-[11px] text-gray-400">
                      {idType === "phone"
                        ? "OTP itatumwa kwa simu yako. Hakuna password inayohitajika."
                        : idType === "email"
                        ? "OTP itatumwa kwa barua pepe yako."
                        : "Weka namba yako ya Kitambulisho cha Taifa (NIDA)."}
                    </p>
                    {!identifier.trim() && (
                      <p className="mt-1 text-[10px] sm:text-[11px] text-amber-500">
                        ⬆ Ingiza {idType === "phone" ? "simu" : idType === "email" ? "barua pepe" : "NIDA"} kwanza
                      </p>
                    )}
                  </div>

                  {errorMsg && (
                    <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
                      {errorMsg}
                    </div>
                  )}

                  <button onClick={sendOtp}
                    disabled={!identifier.trim() || sending || (mode==="register" && !name.trim())}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 sm:py-3.5 text-[13px] sm:text-[14px] font-black text-white shadow transition active:scale-[0.96] touch-manipulation ${
                      !identifier.trim() || sending || (mode==="register" && !name.trim())
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-[#0f2347] hover:bg-[#1a3a6a]"
                    }`}>
                    {sending
                      ? <><RefreshCw size={17} className="animate-spin" /> Inatuma OTP...</>
                      : <><KeyRound size={18}/> Tuma OTP <ArrowRight size={17}/></>
                    }
                  </button>
                </>
              )}

              {/* ── OTP STEP ── */}
              {step === "otp" && (
                <>
                  <div className="flex flex-col items-center mb-4 sm:mb-6">
                    <div className="flex h-14 sm:h-16 w-14 sm:w-16 items-center justify-center rounded-2xl bg-[#0f2347]/10 mb-2 sm:mb-3">
                      <ShieldCheck size={26} className="text-[#0f2347] sm:text-[30px]" />
                    </div>
                    <h2 className="text-[18px] sm:text-[20px] font-black text-[#0f2347]">Thibitisha OTP</h2>
                    <p className="mt-1 text-center text-[11px] sm:text-[12px] text-gray-400 leading-relaxed">
                      Nambari ya uthibitisho imetumwa kwa<br />
                      <span className="font-bold text-[#0f2347]">{maskedIdentifier}</span>
                    </p>
                  </div>

                  {/* Dev OTP display */}
                  {devOtp && (
                    <div className="mb-3 sm:mb-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 sm:px-4 py-2 sm:py-3">
                      <KeyRound size={16} className="shrink-0 text-amber-600" />
                      <div>
                        <p className="text-[10px] font-bold uppercase text-amber-600">OTP ya Majaribio</p>
                        <p className="text-[18px] sm:text-[20px] font-black tracking-[6px] text-amber-800">{devOtp}</p>
                      </div>
                    </div>
                  )}

                  {/* OTP boxes */}
                  <div className="flex justify-between gap-1.5 sm:gap-2 mb-4 sm:mb-5" onPaste={handleOtpPaste}>
                    {otp.map((digit, idx) => (
                      <input key={idx} ref={el => { otpRefs.current[idx] = el; }}
                        type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={e => handleOtpChange(idx, e.target.value)}
                        onKeyDown={e => handleOtpKey(idx, e)}
                        className={`h-12 sm:h-14 w-full rounded-xl border-2 bg-gray-50 text-center text-[18px] sm:text-[22px] font-black focus:outline-none transition-all ${
                          digit
                            ? "border-[#10B981] bg-green-50 text-[#0f2347]"
                            : "border-gray-200 text-gray-800 focus:border-[#10B981]"
                        }`}
                      />
                    ))}
                  </div>

                  {errorMsg && (
                    <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600 text-center">
                      {errorMsg}
                    </div>
                  )}

                  <button onClick={verifyOtp} disabled={!otpComplete || verifying}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 sm:py-3.5 text-[13px] sm:text-[14px] font-black text-white shadow transition touch-manipulation ${
                      !otpComplete || verifying ? "bg-gray-300 cursor-not-allowed" : "bg-[#0f2347] hover:bg-[#1a3a6a]"
                    }`}>
                    {verifying
                      ? <><RefreshCw size={17} className="animate-spin"/> Inathibitisha...</>
                      : <><ShieldCheck size={18}/> Thibitisha na Ingia <ArrowRight size={17}/></>
                    }
                  </button>

                  <div className="mt-3 sm:mt-4 flex items-center justify-between">
                    <button onClick={() => { setStep("credentials"); setOtp(["","","","","",""]); setErrorMsg(""); }}
                      className="flex items-center gap-1 text-[11px] sm:text-[12px] text-gray-400 hover:text-gray-600 transition">
                      <ArrowLeft size={13}/> Rudi
                    </button>
                    {resendTimer > 0
                      ? <span className="text-[11px] sm:text-[12px] text-gray-400">Tuma tena baada ya {resendTimer}s</span>
                      : <button onClick={sendOtp} className="flex items-center gap-1 text-[11px] sm:text-[12px] font-bold text-[#10B981]">
                          <RefreshCw size={12}/> Tuma tena
                        </button>
                    }
                  </div>
                </>
              )}

              {/* ── SUCCESS ── */}
              {step === "success" && (
                <div className="flex flex-col items-center py-6 sm:py-8">
                  <div className="relative flex h-16 sm:h-20 w-16 sm:w-20 items-center justify-center rounded-full bg-green-100 mb-3 sm:mb-4">
                    <div className="absolute inset-0 animate-ping rounded-full bg-green-200 opacity-50" />
                    <CheckCircle2 size={36} className="text-green-500 relative z-10 sm:text-[44px]" />
                  </div>
                  <h2 className="text-[18px] sm:text-[20px] font-black text-[#0f2347]">Umefanikiwa!</h2>
                  <p className="mt-1 text-[12px] sm:text-[13px] text-gray-400">Karibu kwenye Huduma za Raia</p>
                  <div className="mt-4 sm:mt-5 h-1.5 w-40 sm:w-48 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-[#10B981]"
                      style={{ animation: "progress-fill 1s ease-in-out forwards" }} />
                  </div>
                  <style>{`@keyframes progress-fill{from{width:0%}to{width:100%}}`}</style>
                </div>
              )}

            </div>
          </div>

          <p className="mt-3 sm:mt-4 text-center text-[10px] sm:text-[11px] text-gray-400">
            Huduma za Raia — Jeshi la Polisi Tanzania · © 2026
          </p>
        </div>

        {/* PWA standalone: bottom safe area spacer */}
        {isStandalone && (
          <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
        )}
      </div>
    </div>
  );
}
