"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  ChevronDown,
  MapPin,
} from "lucide-react";
import { usePoliceStore, AUTH_ROLES, type AuthRole } from "@/store/police-store";
import { saveLoginIdentifier, clearLoginIdentifier } from "@/lib/session-context";
import type { UserRole } from "@/store/police-store";
import { Shield, Car, UserCheck } from "lucide-react";

type Step = "credentials" | "otp" | "success";

// Role options per mode
const OFFICER_ROLES = [
  { id: "officer-traffic" as UserRole, label: "Afisa Trafiki", sublabel: "Traffic Officer", icon: Car },
  { id: "officer-general" as UserRole, label: "Afisa Polisi", sublabel: "General Officer", icon: UserCheck },
  { id: "officer-post" as unknown as UserRole, label: "Afisa wa Posti", sublabel: "Post Officer", icon: MapPin },
];

type WebRoleOption = {
  id: string;
  label: string;
  route: string;
  storeRole: UserRole;
};

const WEB_ROLES: WebRoleOption[] = [
  { id: "SUPER_ADMIN", label: "Super Admin", route: "/admin/dashboard", storeRole: "admin" },
  { id: "SYSTEM_ADMIN", label: "System Admin", route: "/system/dashboard", storeRole: "admin" },
  { id: "NATIONAL_COMMANDER", label: "National Commander", route: "/command/national/dashboard", storeRole: "commander" },
  { id: "REGIONAL_COMMANDER", label: "Regional Commander", route: "/command/regional/dashboard", storeRole: "commander" },
  { id: "DISTRICT_COMMANDER", label: "District Commander", route: "/command/district/dashboard", storeRole: "commander" },
  { id: "STATION_COMMANDER", label: "Station Commander", route: "/command/station/dashboard", storeRole: "commander" },
  { id: "TRAFFIC_OFFICER", label: "Traffic Officer", route: "/officer/traffic/home", storeRole: "officer-traffic" },
  { id: "GENERAL_OFFICER", label: "General Officer", route: "/officer/general/home", storeRole: "officer-general" },
  { id: "POST_OFFICER", label: "Post Officer (Afisa wa Posti)", route: "/", storeRole: "officer-post" },
  { id: "INVESTIGATOR",            label: "CID / Investigator",         route: "/cid/home",           storeRole: "commander"         },
  { id: "CID_OFFICER",             label: "CID Officer",                route: "/cid/home",           storeRole: "commander"         },
  { id: "INVESTIGATION_SUPERVISOR",label: "Investigation Supervisor",   route: "/cid/home",           storeRole: "commander"         },
  { id: "CYBER_CRIME",             label: "Cyber Crime Unit",           route: "/cid/home",           storeRole: "commander"         },
  { id: "IMMIGRATION_LIAISON",     label: "Immigration Liaison",        route: "/viewer/dashboard",   storeRole: "admin"             },
  { id: "PRISON_LIAISON",          label: "Prison Liaison",             route: "/viewer/dashboard",   storeRole: "admin"             },
  { id: "EMERGENCY_DISPATCHER",    label: "Emergency Dispatcher",       route: "/system/dashboard",   storeRole: "admin"             },
  { id: "EVIDENCE_OFFICER",        label: "Evidence Officer",           route: "/clerk/records",      storeRole: "admin"             },
  { id: "AUDIT_OFFICER",           label: "Audit / Internal Affairs",   route: "/system/dashboard",   storeRole: "admin"             },
  { id: "DIG",                     label: "Deputy IGP",                 route: "/admin",              storeRole: "commander"         },
  { id: "CLERK", label: "Clerk", route: "/clerk/records", storeRole: "admin" },
  { id: "VIEWER", label: "Viewer", route: "/viewer/dashboard", storeRole: "admin" },
];

function toStoreOfficerRole(authRole?: string, fallback: UserRole = "officer-traffic"): UserRole {
  if (authRole === "GENERAL_OFFICER") return "officer-general";
  if (authRole === "TRAFFIC_OFFICER" || authRole === "OFFICER") return "officer-traffic";
  if (authRole === "POST_OFFICER") return "officer-traffic"; // post officers use traffic PWA
  return fallback;
}

function roleMatchesSelection(selectedRole: string, authRole?: string): boolean {
  if (!authRole) return false;
  if (selectedRole === authRole) return true;

  // Legacy commander role can access all command tiers.
  if (authRole === "COMMANDER") {
    return [
      "NATIONAL_COMMANDER",
      "REGIONAL_COMMANDER",
      "DISTRICT_COMMANDER",
      "STATION_COMMANDER",
    ].includes(selectedRole);
  }

  // Legacy officer role can access both officer tracks.
  if (authRole === "OFFICER") {
    return ["TRAFFIC_OFFICER", "GENERAL_OFFICER"].includes(selectedRole);
  }

  return false;
}

export function LoginScreen({ mode = "officer" }: { mode?: "officer" | "admin" }) {
  const router = useRouter();
  const login = usePoliceStore((s) => s.login);
  const setLoginIdentifier = usePoliceStore((s) => s.setLoginIdentifier);
  const [step, setStep] = useState<Step>("credentials");
  const [method, setMethod] = useState<"username" | "phone">("username");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [sending, setSending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [role, setRole] = useState<UserRole>(OFFICER_ROLES[0].id);
  const [webRole, setWebRole] = useState<string>(WEB_ROLES[0].id);
  const [authResolvedRole, setAuthResolvedRole] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [verifying, setVerifying] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Category filter for role selector
  type RoleCategory = "all"|"command"|"officers"|"cid"|"specialist"|"admin";
  const [roleCategory, setRoleCategory] = useState<RoleCategory>("all");

  const ROLE_CATEGORIES: { id: RoleCategory; label: string; labelSw: string; roles: string[] }[] = [
    { id:"all",        label:"All",          labelSw:"Zote",          roles:[] },
    { id:"command",    label:"Command",      labelSw:"Uongozi",       roles:["NATIONAL_COMMANDER","DIG","SUPER_ADMIN","REGIONAL_COMMANDER","DISTRICT_COMMANDER","STATION_COMMANDER"] },
    { id:"officers",   label:"Officers",     labelSw:"Maafisa",       roles:["TRAFFIC_OFFICER","GENERAL_OFFICER","POST_OFFICER"] },
    { id:"cid",        label:"CID",          labelSw:"Upelelezi",     roles:["INVESTIGATOR","CID_OFFICER","INVESTIGATION_SUPERVISOR","CYBER_CRIME"] },
    { id:"specialist", label:"Specialist",   labelSw:"Idara Maalum",  roles:["IMMIGRATION_LIAISON","PRISON_LIAISON","EMERGENCY_DISPATCHER","EVIDENCE_OFFICER","AUDIT_OFFICER"] },
    { id:"admin",      label:"Admin",        labelSw:"Utawala",       roles:["SYSTEM_ADMIN","CLERK","VIEWER"] },
  ];

  const filteredWebRoles = roleCategory === "all"
    ? WEB_ROLES
    : WEB_ROLES.filter(r => ROLE_CATEGORIES.find(c=>c.id===roleCategory)?.roles.includes(r.id));

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

  const sendOtp = async () => {
    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) return;

    setErrorMsg("");
    setSending(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: cleanIdentifier }),
      });
      const data = await response.json().catch(() => ({}));

      // If API returns error, still proceed in demo mode for ALL modes
      if (!response.ok || data?.error) {
        // Demo platform: always proceed to OTP regardless of API result
        // Role identity is resolved from dropdown selection + mock DB on client
        console.warn("sendOtp API error (demo mode continues):", data?.error);
      }

      const apiRole = String(data?.user?.role ?? "");
      if (apiRole) {
        // Use DB-resolved role if available (works when API succeeds)
        setAuthResolvedRole(apiRole);
        if (mode === "admin") setWebRole(apiRole);
      }
      // Always proceed to OTP — demo mode, any 6 digits accepted
      setOtp(["1","2","3","4","5","6"]);
      setStep("otp");
      setResendTimer(45);
      setTimeout(() => otpRefs.current[5]?.focus(), 100);
    } catch {
      // Network error — always proceed in demo mode (both officer and admin)
      console.warn("sendOtp network error — proceeding in demo mode");
    } finally {
      setSending(false);
    }
  };

  const loginAsRole = usePoliceStore((s) => s.loginAsRole);

  const verifyOtp = async () => {
    const cleanIdentifier = identifier.trim();
    const otpCode = otp.join("");

    if (!cleanIdentifier || otpCode.length < 6) return;

    setErrorMsg("");
    setVerifying(true);

    try {
      // ── BYPASS (demo mode — works on Vercel serverless) ─────────────
      // Any 6-digit code is accepted. We skip the API call entirely to
      // avoid in-memory otpStore mismatch across Vercel serverless instances.
      if (!/^\d{6}$/.test(otpCode)) {
        setErrorMsg("OTP lazima iwe na tarakimu 6.");
        setVerifying(false);
        return;
      }

      // ── Resolve identity from mock DB ────────────────────────────────
      const userRole = authResolvedRole ?? "";

      if (mode === "admin") {
        // Use DB-resolved role if available, otherwise use the dropdown selection
        const resolvedAuthRole = (userRole || webRole) as AuthRole;
        saveLoginIdentifier(cleanIdentifier);
        setLoginIdentifier(cleanIdentifier);
        setStep("success");
        setTimeout(() => {
          loginAsRole(resolvedAuthRole);
        }, 900);
        return;
      }

      // Officer / Post Officer mode — map DB role to store role
      const mappedRole = toStoreOfficerRole(userRole, role);
      saveLoginIdentifier(cleanIdentifier);
      setLoginIdentifier(cleanIdentifier);
      setStep("success");
      setTimeout(() => { login(mappedRole); }, 900);

    } catch {
      setErrorMsg("Hitilafu ya mtandao. Jaribu tena.");
    } finally {
      setVerifying(false);
    }
  };

  const resendOtp = () => {
    if (resendTimer > 0) return;
    void sendOtp();
  };

  const openExternalApp = (url: string) => {
    if (typeof window === "undefined") return;

    const openedWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (openedWindow) {
      openedWindow.opener = null;
      return;
    }

    // Fallback for PWA contexts where opening a new tab is blocked.
    window.location.assign(url);
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
          <polygon points="0,200 0,120 30,120 30,90 60,90 60,110 90,110 90,70 120,70 120,100 150,100 150,60 180,60 180,95 210,95 210,80 240,80 240,50 270,50 270,90 300,90 300,75 330,75 330,105 360,105 360,85 400,85 400,200" fill="#1E3A8A" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center px-6 pb-8 pt-8">
        {/* Logo */}
        <div className="mt-2 flex flex-col items-center">
          <div className="h-28 w-28 overflow-hidden rounded-full ring-4 ring-[#2196F3]/20">
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
          <p className="mt-1 text-[13px] font-medium text-[#2196F3]">
            USALAMA WETU, JUKUMU LETU
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-7 w-full rounded-2xl bg-police-card p-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] ring-1 ring-gray-100">
          {/* STEP 1: Credentials */}
          {step === "credentials" && (
            <>
              <h2 className="text-center text-[19px] font-bold text-police-navy2">Ingia kwenye Mfumo</h2>
              <p className="mt-1 text-center text-[13px] text-police-muted">
                Chagua nafasi yako kisha ingia
              </p>

              {/* Role selector */}
              {mode === "admin" ? (
                <div className="mt-4">
                  <label className="mb-1.5 block text-[13px] font-medium text-police-navy2">Aina ya Role</label>
                  {/* Category filter buttons */}
                  <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
                    {ROLE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setRoleCategory(cat.id);
                          // Auto-select first role of category
                          if (cat.id !== "all" && cat.roles.length > 0) {
                            setWebRole(cat.roles[0]);
                          }
                        }}
                        className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
                          roleCategory === cat.id
                            ? "bg-[#1E3A8A] text-white"
                            : "bg-police-muted text-police-muted border border-police"
                        }`}
                      >
                        {cat.labelSw}
                      </button>
                    ))}
                  </div>
                  <label className="mb-1.5 block text-[12px] font-medium text-police-muted">Role</label>
                  <div className="relative">
                    <select
                      value={webRole}
                      onChange={(e) => setWebRole(e.target.value)}
                      className="h-12 w-full appearance-none rounded-xl border border-police bg-police-card px-3 pr-10 text-[14px] text-police focus:border-[#2196F3] focus:outline-none focus:ring-2 focus:ring-[#2196F3]/20"
                    >
                      <optgroup label="═══ UONGOZI WA KITAIFA ═══">
                        <option value="NATIONAL_COMMANDER">IGP — Inspector General of Police</option>
                        <option value="DIG">DIG — Deputy Inspector General</option>
                        <option value="SUPER_ADMIN">Super Admin — Msimamizi Mkuu</option>
                      </optgroup>
                      <optgroup label="═══ MAKAMISHNA WA MIKOA ═══">
                        <option value="REGIONAL_COMMANDER">Regional Commissioner — Mkamishna wa Mkoa</option>
                        <option value="DISTRICT_COMMANDER">District Commander — Mkamishna wa Wilaya</option>
                        <option value="STATION_COMMANDER">Station Commissioner — Mkamishna wa Kituo</option>
                      </optgroup>
                      <optgroup label="═══ MAAFISA WA UWANJA ═══">
                        <option value="TRAFFIC_OFFICER">Traffic Officer — Afisa Trafiki</option>
                        <option value="GENERAL_OFFICER">General Officer — Afisa Polisi</option>
                        <option value="POST_OFFICER">Post Officer — Afisa wa Posti</option>
                      </optgroup>
                      <optgroup label="═══ KITENGO CHA UPELELEZI (CID) ═══">
                        <option value="INVESTIGATOR">CID / Investigator — Mpelelezi</option>
                        <option value="CID_OFFICER">CID Officer — Afisa CID</option>
                        <option value="INVESTIGATION_SUPERVISOR">Investigation Supervisor — Msimamizi wa Uchunguzi</option>
                        <option value="CYBER_CRIME">Cyber Crime Unit — Uhalifu wa Mtandaoni</option>
                      </optgroup>
                      <optgroup label="═══ IDARA MAALUM ═══">
                        <option value="IMMIGRATION_LIAISON">Immigration Liaison — Afisa Uhamiaji</option>
                        <option value="PRISON_LIAISON">Prison Liaison — Afisa Magereza</option>
                        <option value="EMERGENCY_DISPATCHER">Emergency Dispatcher — Msimamizi wa Dharura (911)</option>
                        <option value="EVIDENCE_OFFICER">Evidence Officer — Afisa Ushahidi</option>
                        <option value="AUDIT_OFFICER">Audit / Internal Affairs — Afisa Ukaguzi</option>
                      </optgroup>
                      <optgroup label="═══ UTAWALA ═══">
                        <option value="SYSTEM_ADMIN">System Admin — Msimamizi wa Mfumo</option>
                        <option value="CLERK">Clerk — Karani</option>
                        <option value="VIEWER">Viewer — Mwangalizi (Read-only)</option>
                      </optgroup>
                    </select>
                    <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-police-faint" />
                  </div>
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {OFFICER_ROLES.map((r) => {
                    const Icon = r.icon;
                    const active = role === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => setRole(r.id)}
                        className={`flex items-center gap-2.5 rounded-xl border-2 p-2.5 text-left transition ${
                          active
                            ? "border-[#2196F3] bg-[#2196F3]/5"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <Icon
                          size={18}
                          className={active ? "text-[#2196F3]" : "text-gray-400"}
                        />
                        <div className="min-w-0">
                          <div
                            className={`text-[11px] font-bold leading-tight ${
                              active ? "text-police-navy2" : "text-gray-500"
                            }`}
                          >
                            {r.label}
                          </div>
                          <div className="text-[8px] leading-tight text-gray-400">{r.sublabel}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Method toggle */}
              <div className="mt-4 flex gap-2 rounded-xl bg-police-muted p-1">
                <button
                  onClick={() => setMethod("username")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-semibold transition ${
                    method === "username"
                      ? "bg-police-card text-[#2196F3] shadow-sm"
                      : "text-police-muted"
                  }`}
                >
                  <User size={14} /> Username
                </button>
                <button
                  onClick={() => setMethod("phone")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-semibold transition ${
                    method === "phone"
                      ? "bg-police-card text-[#2196F3] shadow-sm"
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
                <div className="flex items-center gap-2 rounded-xl border border-police bg-police-card px-3 focus-within:border-[#2196F3] focus-within:ring-2 focus-within:ring-[#2196F3]/20">
                  {method === "username" ? (
                    <User size={20} className="text-[#2196F3]" />
                  ) : (
                    <Phone size={20} className="text-[#2196F3]" />
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
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#2196F3]/5 px-3 py-2.5">
                <Smartphone size={16} className="mt-0.5 shrink-0 text-[#2196F3]" />
                <p className="text-[11px] leading-snug text-police-muted">
                  OTP itatumwa kwa simu yako baada ya kuwasilisha.{" "}
                  <span className="font-medium text-[#2196F3]">Hakuna password inahitajika.</span>
                </p>
              </div>

              {errorMsg && (
                <div className="mt-3 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-3 py-2 text-[12px] text-[#EF4444]700">
                  {errorMsg}
                </div>
              )}

              {/* Send OTP Button */}
              <button
                onClick={sendOtp}
                disabled={!identifier.trim() || sending}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2196F3] py-3.5 text-[15px] font-bold text-white shadow-lg shadow-[#2196F3]/30 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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

              {/* Demo mode badge */}
              <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#1E3A8A]/8 border border-[#1E3A8A]/20 px-4 py-2.5">
                <span className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wide">Demo Mode</span>
                <span className="text-[12px] text-police-muted">— Tumia tarakimu yoyote 6:</span>
                <span className="rounded-lg bg-[#1E3A8A] px-2.5 py-0.5 text-[13px] font-bold tracking-widest text-white">123456</span>
              </div>

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
                        ? "border-[#2196F3] bg-[#2196F3]/5"
                        : "border-police focus:border-[#2196F3]"
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
                    className="flex items-center gap-1 text-[12px] font-bold text-[#2196F3]"
                  >
                    <RefreshCw size={12} /> Tuma tena
                  </button>
                )}
              </div>

              {/* Verify Button */}
              <button
                onClick={verifyOtp}
                disabled={!otpComplete || verifying}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2196F3] py-3.5 text-[15px] font-bold text-white shadow-lg shadow-[#2196F3]/30 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {verifying ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Inathibitisha...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={20} />
                    <span>Thibitisha na Ingia</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {errorMsg && (
                <div className="mt-3 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-3 py-2 text-[12px] text-[#EF4444]700">
                  {errorMsg}
                </div>
              )}
            </>
          )}

          {/* STEP 3: Success */}
          {step === "success" && (
            <div className="flex flex-col items-center py-6">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#10B981]/10">
                <div className="absolute inset-0 animate-ping rounded-full bg-[#10B981]/200 opacity-40" />
                <CheckCircle2 size={48} className="text-[#10B981] relative z-10" />
              </div>
              <h2 className="mt-4 text-[19px] font-bold text-police-navy2">Login Imefanikiwa!</h2>
              <p className="mt-1 text-center text-[13px] text-police-muted">
                Karibu kwenye mfumo. Inaingia...
              </p>
              <div className="mt-4 h-1.5 w-40 overflow-hidden rounded-full bg-police-muted">
                <div
                  className="h-full rounded-full bg-[#2196F3]"
                  style={{ animation: "progress-fill 0.85s ease-in-out forwards" }}
                />
              </div>
              <style>{`@keyframes progress-fill { from { width: 0% } to { width: 100% } }`}</style>
            </div>
          )}
        </div>



        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-[11px] text-police-muted">
            Mfumo salama wa Jeshi la Polisi Tanzania
          </p>
          <p className="mt-1 text-[11px] text-police-faint">© 2026 Tanzania Police Force</p>
        </div>
      </div>
    </div>
  );
}
