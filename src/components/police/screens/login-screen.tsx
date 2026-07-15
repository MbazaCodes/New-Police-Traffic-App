"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  RefreshCw,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import { usePoliceStore } from "@/store/police-store";

type Step = "credentials" | "otp" | "success";

export function LoginScreen() {
  const login = usePoliceStore((s) => s.login);
  const [step, setStep] = useState<Step>("credentials");
  const [method, setMethod] = useState<"username" | "phone">("username");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [sending, setSending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // Auto-advance OTP inputs
  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKey = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    const next = ["", "", "", "", "", ""];
    text.split("").forEach((c, i) => (next[i] = c));
    setOtp(next);
    otpRefs.current[Math.min(text.length, 5)]?.focus();
  };

  const sendOtp = () => {
    if (!identifier.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setStep("otp");
      setResendTimer(45);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }, 1200);
  };

  const verifyOtp = () => {
    if (otp.join("").length < 6) return;
    setStep("success");
    setTimeout(() => login(), 1100);
  };

  const resendOtp = () => {
    if (resendTimer > 0) return;
    setResendTimer(45);
  };

  const otpComplete = otp.join("").length === 6;
  const maskedIdentifier =
    method === "phone"
      ? identifier.replace(/(\d{3})\d+(\d{2})/, "$1•••••$2")
      : identifier;

  return (
    <div className="relative flex min-h-full flex-col bg-police-card">
      {/* Background cityscape overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#2196F3] to-transparent" />
        <svg className="absolute bottom-0 w-full" viewBox="0 0 400 200" preserveAspectRatio="none">
          <polygon points="0,200 0,120 30,120 30,90 60,90 60,110 90,110 90,70 120,70 120,100 150,100 150,60 180,60 180,95 210,95 210,80 240,80 240,50 270,50 270,90 300,90 300,75 330,75 330,105 360,105 360,85 400,85 400,200" fill="#1A237E" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center px-6 pb-8 pt-8">
        {/* Logo */}
        <div className="mt-2 flex flex-col items-center">
          <div className="h-28 w-28 overflow-hidden rounded-full ring-4 ring-[#0070C0]/20">
            <Image
              src="/police-logo.png"
              alt="Tanzania Police Force"
              width={112}
              height={112}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <h1 className="mt-4 text-center text-[22px] font-extrabold tracking-tight text-police-navy2">
            TANZANIA POLICE FORCE
          </h1>
          <p className="mt-1 text-[13px] font-medium text-[#0070C0]">
            USALAMA WETU, JUKUMU LETU
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-7 w-full rounded-2xl bg-police-card p-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] ring-1 ring-gray-100">
          {/* STEP 1: Credentials */}
          {step === "credentials" && (
            <>
              <h2 className="text-center text-[19px] font-bold text-police-navy2">Officer Login</h2>
              <p className="mt-1 text-center text-[13px] text-police-muted">
                Ingia kutumia akaunti yako ya utumishi
              </p>

              {/* Method toggle */}
              <div className="mt-4 flex gap-2 rounded-xl bg-police-muted p-1">
                <button
                  onClick={() => setMethod("username")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-semibold transition ${
                    method === "username"
                      ? "bg-police-card text-[#0070C0] shadow-sm"
                      : "text-police-muted"
                  }`}
                >
                  <User size={14} /> Username
                </button>
                <button
                  onClick={() => setMethod("phone")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-semibold transition ${
                    method === "phone"
                      ? "bg-police-card text-[#0070C0] shadow-sm"
                      : "text-police-muted"
                  }`}
                >
                  <Phone size={14} /> Mobile Number
                </button>
              </div>

              {/* Identifier Input */}
              <div className="mt-4">
                <label className="mb-1.5 block text-[13px] font-medium text-police-navy2">
                  {method === "username" ? "Username" : "Namba ya Simu"}
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-police bg-police-card px-3 focus-within:border-[#0070C0] focus-within:ring-2 focus-within:ring-[#0070C0]/20">
                  {method === "username" ? (
                    <User size={20} className="text-[#0070C0]" />
                  ) : (
                    <Phone size={20} className="text-[#0070C0]" />
                  )}
                  <input
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                    placeholder={
                      method === "username"
                        ? "Ingiza username yako"
                        : "Ingiza namba ya simu (07XX XXX XXX)"
                    }
                    inputMode={method === "phone" ? "tel" : "text"}
                    className="h-12 flex-1 bg-transparent text-[14px] text-police placeholder:text-police-faint focus:outline-none"
                  />
                </div>
              </div>

              {/* Info note */}
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#0070C0]/5 px-3 py-2.5">
                <Smartphone size={16} className="mt-0.5 shrink-0 text-[#0070C0]" />
                <p className="text-[11px] leading-snug text-police-muted">
                  OTP itatumwa kwa simu yako baada ya kuwasilisha.{" "}
                  <span className="font-medium text-[#0070C0]">Hakuna password inahitajika.</span>
                </p>
              </div>

              {/* Send OTP Button */}
              <button
                onClick={sendOtp}
                disabled={!identifier.trim() || sending}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0070C0] py-3.5 text-[15px] font-bold text-white shadow-lg shadow-[#0070C0]/30 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Inatuma OTP...
                  </>
                ) : (
                  <>
                    <KeyRound size={20} />
                    <span>Tuma OTP</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </>
          )}

          {/* STEP 2: OTP */}
          {step === "otp" && (
            <>
              <button
                onClick={() => {
                  setStep("credentials");
                  setOtp(["", "", "", "", "", ""]);
                }}
                className="mb-3 flex items-center gap-1 text-[12px] font-medium text-police-muted"
              >
                <ArrowLeft size={16} /> Rudi
              </button>

              <h2 className="text-center text-[19px] font-bold text-police-navy2">Thibitisha OTP</h2>
              <p className="mt-1 text-center text-[13px] text-police-muted">
                Tumekutumia OTP yenye tarakimu 6 kwa{" "}
                <span className="font-semibold text-police-navy2">{maskedIdentifier}</span>
              </p>

              {/* OTP Inputs */}
              <div className="mt-5 flex justify-between gap-2" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKey(idx, e)}
                    className={`h-12 w-full rounded-xl border-2 bg-police-card text-center text-[20px] font-bold text-police-navy2 focus:outline-none ${
                      digit
                        ? "border-[#0070C0] bg-[#0070C0]/5"
                        : "border-police focus:border-[#0070C0]"
                    }`}
                  />
                ))}
              </div>

              {/* Resend */}
              <div className="mt-4 flex items-center justify-center gap-1.5">
                <span className="text-[12px] text-police-muted">Hujapata OTP?</span>
                {resendTimer > 0 ? (
                  <span className="text-[12px] font-medium text-police-faint">
                    Tuma tena baada ya {resendTimer}s
                  </span>
                ) : (
                  <button
                    onClick={resendOtp}
                    className="flex items-center gap-1 text-[12px] font-bold text-[#0070C0]"
                  >
                    <RefreshCw size={12} /> Tuma tena
                  </button>
                )}
              </div>

              {/* Verify Button */}
              <button
                onClick={verifyOtp}
                disabled={!otpComplete}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0070C0] py-3.5 text-[15px] font-bold text-white shadow-lg shadow-[#0070C0]/30 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShieldCheck size={20} />
                <span>Thibitisha na Ingia</span>
                <ArrowRight size={18} />
              </button>
            </>
          )}

          {/* STEP 3: Success */}
          {step === "success" && (
            <div className="flex flex-col items-center py-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
                <CheckCircle2 size={48} className="text-green-500" />
              </div>
              <h2 className="mt-4 text-[19px] font-bold text-police-navy2">Login Imefanikiwa!</h2>
              <p className="mt-1 text-center text-[13px] text-police-muted">
                Karibu kwenye mfumo. Inaingia...
              </p>
              <div className="mt-4 h-1 w-32 overflow-hidden rounded-full bg-police-muted">
                <div className="h-full w-full animate-pulse rounded-full bg-[#0070C0]" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 text-center">
          <p className="text-[11px] text-police-muted">
            Mfumo salama wa Jeshi la Polisi Tanzania
          </p>
          <p className="mt-1 text-[11px] text-police-faint">© 2026 Tanzania Police Force</p>
        </div>
      </div>
    </div>
  );
}
