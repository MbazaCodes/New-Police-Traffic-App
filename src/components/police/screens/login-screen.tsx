"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import {
  ShieldCheck, Shield, User, Car, UserCheck, Phone, Mail,
  ArrowRight, ArrowLeft, KeyRound, RefreshCw, Smartphone,
  CheckCircle2, ChevronDown,
} from "lucide-react";
import { usePoliceStore, AUTH_ROLES, type AuthRole } from "@/store/police-store";
import { saveLoginIdentifier, saveOfficerUserId } from "@/lib/session-context";
import type { UserRole } from "@/store/police-store";

type Step = "credentials" | "otp" | "success";
type RoleCategory = "admin" | "command" | "officers" | "cid" | "specialist" | "clerk";

const CATEGORIES: { id: RoleCategory; labelSw: string; hint: string }[] = [
  { id: "admin",      labelSw: "Usimamizi (Admin / ICT)",    hint: "Super Admin, System Admin, ICT Officer" },
  { id: "command",    labelSw: "Kamandi",                     hint: "IGP, DIG, National, Regional, District, Station Commander" },
  { id: "officers",   labelSw: "Maafisa wa Polisi",           hint: "Trafiki, Polisi Jumla, Posti, Operesheni" },
  { id: "cid",        labelSw: "Upelelezi (CID / Forensic)",  hint: "CID, Upelelezi, Silaha, Ugaidi, Fedha, Interpol" },
  { id: "specialist", labelSw: "Idara Maalum",                hint: "Uhamiaji, Magereza, Dharura, Ushahidi, Ukaguzi" },
  { id: "clerk",      labelSw: "Karani / Utawala / Fedha",    hint: "Karani, Fedha, Manunuzi, Rasilimali, HR, Sheria" },
];

const ROLE_ROUTES: Record<string, string> = {
  SUPER_ADMIN:           "/admin/dashboard",
  SYSTEM_ADMIN:          "/system/dashboard",
  NATIONAL_COMMANDER:    "/command/national/dashboard",
  REGIONAL_COMMANDER:    "/command/regional/dashboard",
  DISTRICT_COMMANDER:    "/command/district/dashboard",
  STATION_COMMANDER:     "/command/station/dashboard",
  TRAFFIC_OFFICER:       "/officer/traffic/home",
  GENERAL_OFFICER:       "/officer/general/home",
  POST_OFFICER:          "/officer/post/home",
  INVESTIGATOR:          "/cid/home",
  EVIDENCE_OFFICER:      "/clerk/records",
  AUDIT_OFFICER:         "/admin/dashboard",
  CLERK:                 "/clerk/records",
  NATIONAL_CLERK:        "/clerk/records",
  REGIONAL_CLERK:        "/clerk/records",
  DISTRICT_CLERK:        "/clerk/records",
  DIG:                   "/command/national/dashboard",
  EMERGENCY_DISPATCHER:  "/system/dashboard",
  IMMIGRATION_LIAISON:   "/viewer/dashboard",
  PRISON_LIAISON:        "/viewer/dashboard",
  COMMANDER:             "/command/national/dashboard",
  OFFICER:               "/officer/general/home",
  VIEWER:                "/viewer/dashboard",
};

function toStoreRole(authRole: string): UserRole {
  if (authRole === "TRAFFIC_OFFICER" || authRole === "POST_OFFICER") return "officer-traffic";
  if (authRole === "GENERAL_OFFICER") return "officer-general";
  if (authRole.includes("COMMANDER")) return "commander";
  if (authRole.includes("INVESTIGATOR") || authRole.includes("CID")) return "cid-officer";
  if (authRole.includes("CLERK") || authRole === "EVIDENCE_OFFICER") return "clerk";
  if (authRole === "SUPER_ADMIN" || authRole === "SYSTEM_ADMIN") return "admin";
  return "officer-general";
}

export function LoginScreen() {
  const { setOfficerProfile } = usePoliceStore();
  const [step, setStep]               = useState<Step>("credentials");
  const [category, setCategory]       = useState<RoleCategory | "">("");
  const [method, setMethod]           = useState<"username" | "phone" | "email">("username");
  const [identifier, setIdentifier]   = useState("");
  const [otp, setOtp]                 = useState(["","","","","",""]);
  const [sending, setSending]         = useState(false);
  const [verifying, setVerifying]     = useState(false);
  const [errorMsg, setErrorMsg]       = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [resolvedRole, setResolvedRole] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleOtpChange = (idx: number, val: string) => {
    const d = val.replace(/\D/, "");
    const next = [...otp]; next[idx] = d; setOtp(next);
    if (d && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKey = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      const next = [...otp]; next[idx - 1] = ""; setOtp(next);
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    const next = ["","","","","",""];
    text.split("").forEach((c, i) => (next[i] = c));
    setOtp(next);
    otpRefs.current[Math.min(text.length, 5)]?.focus();
  };

  const sendOtp = async () => {
    const clean = identifier.trim();
    if (!clean) return;
    setErrorMsg(""); setSending(true);
    try {
      const res = await fetch("/api/police/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: clean, method }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) {
        setErrorMsg(data?.error ?? "Akaunti haipatikani. Angalia taarifa zako.");
        return;
      }
      if (data?.user?.role) setResolvedRole(data.user.role);
      if (data?.user?.id) saveOfficerUserId(data.user.id);
      if (data?.user) {
        setOfficerProfile({
          name:            data.user.name          ?? "",
          shortName:       data.user.shortName      ?? "",
          rank:            data.user.rank           ?? "",
          rankShort:       data.user.rankShort      ?? "",
          id:              data.user.id             ?? "",
          badgeNo:         data.user.badgeNo        ?? "",
          idNumber:        data.user.idNumber       ?? "",
          officerId:       data.user.officerId      ?? "",
          station:         data.user.station        ?? "",
          stationId:       data.user.stationId      ?? "",
          stationPhone:    "",
          stationRegion:   data.user.region         ?? "",
          stationDistrict: "",
          unit:            data.user.unit           ?? "",
          phone:           data.user.phone          ?? "",
          email:           data.user.email          ?? "",
          photo:           data.user.photo          ?? "",
          region:          data.user.region         ?? "",
          status:          data.user.status         ?? "active",
          role:            data.user.role           ?? "",
          roleRaw:         data.user.roleRaw        ?? "",
          lastLogin:       data.user.lastLogin      ?? null,
          createdAt:       data.user.createdAt      ?? null,
          patrolsCount:    data.user.patrolsCount   ?? 0,
          citationsCount:  data.user.citationsCount ?? 0,
          incidentsCount:  data.user.incidentsCount ?? 0,
          hoursToday:      data.user.hoursToday     ?? 0,
        });
      }
      if (data?.auth?.devOtp) {
        const digits = String(data.auth.devOtp).split("").slice(0, 6);
        setOtp(digits.concat(Array(6 - digits.length).fill("")).slice(0, 6) as string[]);
      }
      setStep("otp"); setResendTimer(45);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setErrorMsg("Hitilafu ya mtandao. Angalia muunganisho wako.");
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async () => {
    const clean = identifier.trim();
    const code = otp.join("");
    if (!clean || code.length < 6) return;
    setErrorMsg(""); setVerifying(true);
    try {
      const res = await fetch("/api/police/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: clean, otp: code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setErrorMsg(data?.error ?? "OTP si sahihi. Jaribu tena.");
        return;
      }
      const result = await signIn("credentials", {
        username: clean,
        otp: `verified:${data?.userId ?? ""}`,
        redirect: false,
      });
      if (!result?.ok || result?.error) {
        setErrorMsg("Imeshindwa kuanzisha kikao. Tafadhali jaribu tena.");
        return;
      }
      setStep("success");
      const role = resolvedRole;
      setTimeout(() => {
        const route = ROLE_ROUTES[role] ?? "/admin/dashboard";
        window.location.href = route;
      }, 900);
    } catch {
      setErrorMsg("Hitilafu ya mtandao. Jaribu tena.");
    } finally {
      setVerifying(false);
    }
  };

  const otpComplete = otp.join("").length === 6;

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen w-full">

      {/* ── LEFT PANEL — Branding ── */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0a1628 0%, #0f2347 50%, #0a1628 100%)" }}>

        {/* Background pattern */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="absolute bottom-0 left-0 right-0 h-64 opacity-20"
            style={{ background: "linear-gradient(to top, #1E3A8A, transparent)" }} />
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #2196F3, transparent 70%)" }} />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #D97706, transparent 70%)" }} />
        </div>

        <div className="relative z-10 flex flex-col items-center px-12 text-center">
          {/* Tanzania coat of arms */}
          <div className="mb-4">
            <img src="/coat-of-arms.png" alt="Coat of Arms"
              className="h-24 w-24 object-contain drop-shadow-lg"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>

          {/* Header text */}
          <p className="text-[13px] font-bold tracking-[0.2em] uppercase text-[#D97706] mb-1">
            JAMHURI YA MUUNGANO WA TANZANIA
          </p>
          <p className="text-[11px] tracking-[0.15em] uppercase text-white/50 mb-8">
            WIZARA YA MAMBO YA NDANI YA NCHI
          </p>

          {/* Police logo */}
          <div className="mb-6 relative">
            <div className="absolute inset-0 rounded-full blur-xl opacity-30"
              style={{ background: "radial-gradient(circle, #2196F3, transparent)" }} />
            <div className="relative h-40 w-40 overflow-hidden rounded-full ring-2 ring-white/10 shadow-2xl">
              <Image src="/police-logo.png" alt="Tanzania Police Force"
                width={160} height={160} className="h-full w-full object-cover" priority />
            </div>
          </div>

          {/* Name */}
          <h1 className="text-[32px] font-black tracking-tight text-white leading-tight mb-2">
            JESHI LA POLISI<br />TANZANIA
          </h1>
          <div className="h-0.5 w-16 rounded-full mb-3" style={{ background: "linear-gradient(90deg, #D97706, #F59E0B)" }} />
          <p className="text-[13px] text-white/40 tracking-wide">
            Tanzania Police Digital Operations Platform
          </p>

          {/* Stats strip */}
          <div className="mt-12 flex gap-8">
            {[
              { label: "Mikoa", value: "26" },
              { label: "Vituo", value: "300+" },
              { label: "Maafisa", value: "40K+" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-[22px] font-black text-[#D97706]">{s.value}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom label */}
        <div className="absolute bottom-6 text-[10px] text-white/20 tracking-widest uppercase">
          © 2026 Tanzania Police Force — Mfumo Salama
        </div>
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-[#f0f4f8] px-4 py-8">

        {/* Mobile logo (only on small screens) */}
        <div className="mb-6 flex flex-col items-center lg:hidden">
          <div className="h-20 w-20 overflow-hidden rounded-full shadow-lg">
            <Image src="/police-logo.png" alt="TPF" width={80} height={80} className="h-full w-full object-cover" />
          </div>
          <h1 className="mt-3 text-[18px] font-black text-[#0f2347]">JESHI LA POLISI TANZANIA</h1>
        </div>

        {/* Card */}
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white shadow-xl overflow-hidden">
            {/* Orange top border */}
            <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #D97706, #F59E0B, #D97706)" }} />

            <div className="p-8">

              {/* ── CREDENTIALS STEP ── */}
              {step === "credentials" && (
                <>
                  {/* Logo inside card */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="h-16 w-16 overflow-hidden rounded-full shadow mb-3">
                      <Image src="/police-logo.png" alt="TPF" width={64} height={64} className="h-full w-full object-cover" />
                    </div>
                    <h2 className="text-[20px] font-black text-[#0f2347]">Ingia kwenye Mfumo</h2>
                    <p className="text-[12px] text-gray-400 mt-0.5">Chagua nafasi yako kisha ingia</p>
                  </div>

                  {/* Category */}
                  <div className="mb-4">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      1. Chagua Aina ya Akaunti
                    </label>
                    <div className="relative">
                      <select value={category} onChange={e => setCategory(e.target.value as RoleCategory)}
                        className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 pr-10 text-[13px] font-medium text-gray-800 focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20">
                        <option value="" disabled>— Chagua Category —</option>
                        {CATEGORIES.map(c => (
                          <option key={c.id} value={c.id}>{c.labelSw}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#D97706]" />
                    </div>
                    {category && (
                      <p className="mt-1 text-[11px] text-gray-400">
                        {CATEGORIES.find(c => c.id === category)?.hint}
                      </p>
                    )}
                    {!category && (
                      <p className="mt-1 text-[11px] text-gray-400">
                        Chagua category hapo juu kuona roles zinazopatikana
                      </p>
                    )}
                  </div>

                  {/* Method toggle */}
                  <div className="mb-4 flex rounded-xl border border-gray-200 overflow-hidden">
                    {[
                      { id: "username", label: "Badge / Username", icon: User },
                      { id: "phone",    label: "Simu",             icon: Phone },
                      { id: "email",    label: "Email",            icon: Mail },
                    ].map(({ id, label, icon: Icon }) => (
                      <button key={id}
                        onClick={() => { setMethod(id as typeof method); setIdentifier(""); }}
                        className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition ${
                          method === id
                            ? "bg-[#0f2347] text-white"
                            : "bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                        }`}>
                        <Icon size={14} />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Identifier input */}
                  <div className="mb-4">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      {method === "username" ? "BADGE NUMBER AU USERNAME" : method === "phone" ? "NAMBA YA SIMU" : "BARUA PEPE"}
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 focus-within:border-[#D97706] focus-within:ring-2 focus-within:ring-[#D97706]/20 transition">
                      {method === "username" && <Shield size={17} className="shrink-0 text-[#D97706]" />}
                      {method === "phone"    && <Phone size={17} className="shrink-0 text-[#D97706]" />}
                      {method === "email"    && <Mail size={17} className="shrink-0 text-[#D97706]" />}
                      {method === "phone" && (
                        <span className="shrink-0 border-r border-gray-200 pr-2 text-[13px] font-bold text-gray-400">+255</span>
                      )}
                      <input value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && sendOtp()}
                        placeholder={
                          method === "username" ? "e.g. SYSADMIN-001 au asp.sys"
                          : method === "phone"  ? "7XX XXX XXX"
                          : "jina@polisi.go.tz"
                        }
                        inputMode={method === "phone" ? "tel" : method === "email" ? "email" : "text"}
                        className="h-11 flex-1 bg-transparent text-[14px] text-gray-900 placeholder:text-gray-300 focus:outline-none"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-gray-400">
                      {method === "username" && "Ingiza badge number au username — mfumo utaelekeza kiotomatiki"}
                      {method === "phone"    && "Ingiza namba bila 0 ya kwanza — e.g. 712345678"}
                      {method === "email"    && "Ingiza barua pepe iliyosajiliwa"}
                    </p>
                  </div>

                  {/* OTP notice */}
                  <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-blue-50 border border-blue-100 px-3 py-2.5">
                    <Smartphone size={15} className="mt-0.5 shrink-0 text-blue-400" />
                    <p className="text-[11px] text-blue-600 leading-snug">
                      OTP itatumwa kwa simu yako baada ya kuwasilisha.{" "}
                      <span className="font-semibold">Hakuna password inahitajika.</span>
                    </p>
                  </div>

                  {!identifier.trim() && (
                    <p className="mb-3 text-center text-[11px] text-amber-500">
                      ⬆ Ingiza badge number, simu, au barua pepe kwanza
                    </p>
                  )}

                  {errorMsg && (
                    <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
                      {errorMsg}
                    </div>
                  )}

                  <button onClick={sendOtp} disabled={!identifier.trim() || sending}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-black text-white shadow transition active:scale-[0.98] ${
                      !identifier.trim() || sending
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-[#0f2347] hover:bg-[#1a3a6a] shadow-[#0f2347]/20"
                    }`}>
                    {sending
                      ? <><RefreshCw size={17} className="animate-spin" /> Inatuma OTP...</>
                      : <><KeyRound size={18} /><span>Tuma OTP</span><ArrowRight size={17} /></>
                    }
                  </button>
                </>
              )}

              {/* ── OTP STEP ── */}
              {step === "otp" && (
                <>
                  <div className="flex flex-col items-center mb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0f2347]/10 mb-3">
                      <ShieldCheck size={30} className="text-[#0f2347]" />
                    </div>
                    <h2 className="text-[20px] font-black text-[#0f2347]">Thibitisha OTP</h2>
                    <p className="mt-1 text-center text-[12px] text-gray-400 leading-relaxed">
                      Nambari ya uthibitisho imetumwa kwa<br />
                      <span className="font-bold text-[#0f2347]">{identifier}</span>
                    </p>
                  </div>

                  {/* OTP inputs */}
                  <div className="flex justify-between gap-2 mb-5" onPaste={handleOtpPaste}>
                    {otp.map((digit, idx) => (
                      <input key={idx} ref={el => { otpRefs.current[idx] = el; }}
                        type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={e => handleOtpChange(idx, e.target.value)}
                        onKeyDown={e => handleOtpKey(idx, e)}
                        className={`h-14 w-full rounded-xl border-2 bg-gray-50 text-center text-[22px] font-black focus:outline-none transition-all ${
                          digit
                            ? "border-[#D97706] bg-amber-50 text-[#0f2347]"
                            : "border-gray-200 text-gray-800 focus:border-[#D97706]"
                        }`}
                      />
                    ))}
                  </div>

                  {errorMsg && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600 text-center">
                      {errorMsg}
                    </div>
                  )}

                  <button onClick={verifyOtp} disabled={!otpComplete || verifying}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-black text-white shadow transition active:scale-[0.98] ${
                      !otpComplete || verifying
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-[#0f2347] hover:bg-[#1a3a6a]"
                    }`}>
                    {verifying
                      ? <><RefreshCw size={17} className="animate-spin" /> Inathibitisha...</>
                      : <><ShieldCheck size={18} /> Thibitisha na Ingia <ArrowRight size={17} /></>
                    }
                  </button>

                  <div className="mt-4 flex items-center justify-between">
                    <button onClick={() => { setStep("credentials"); setOtp(["","","","","",""]); setErrorMsg(""); }}
                      className="flex items-center gap-1 text-[12px] text-gray-400 hover:text-gray-600 transition">
                      <ArrowLeft size={13} /> Rudi
                    </button>
                    {resendTimer > 0
                      ? <span className="text-[12px] text-gray-400">Tuma tena baada ya {resendTimer}s</span>
                      : <button onClick={sendOtp} className="flex items-center gap-1 text-[12px] font-bold text-[#D97706]">
                          <RefreshCw size={12} /> Tuma tena
                        </button>
                    }
                  </div>
                </>
              )}

              {/* ── SUCCESS STEP ── */}
              {step === "success" && (
                <div className="flex flex-col items-center py-8">
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-4">
                    <div className="absolute inset-0 animate-ping rounded-full bg-green-200 opacity-50" />
                    <CheckCircle2 size={44} className="text-green-500 relative z-10" />
                  </div>
                  <h2 className="text-[20px] font-black text-[#0f2347]">Login Imefanikiwa!</h2>
                  <p className="mt-1 text-[13px] text-gray-400">Karibu kwenye mfumo. Inaingia...</p>
                  <div className="mt-5 h-1.5 w-48 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-[#D97706]"
                      style={{ animation: "progress-fill 0.9s ease-in-out forwards" }} />
                  </div>
                  <style>{`@keyframes progress-fill { from{width:0%} to{width:100%} }`}</style>
                </div>
              )}

            </div>
          </div>

          {/* Footer */}
          <p className="mt-4 text-center text-[11px] text-gray-400">
            Mfumo salama wa Jeshi la Polisi Tanzania · © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
