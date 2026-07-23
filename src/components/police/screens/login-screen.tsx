"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Shield,
  User,
  Car,
  UserCheck,
  Phone,
  Mail,
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
  { id: "POST_OFFICER", label: "Post Officer (Afisa wa Posti)", route: "/officer/post/home", storeRole: "officer-post" },
  { id: "INVESTIGATOR",            label: "CID / Investigator",         route: "/cid/home",           storeRole: "investigator"     },
  { id: "CID_OFFICER",             label: "CID Officer",                route: "/cid/home",           storeRole: "investigator"     },
  { id: "INVESTIGATION_SUPERVISOR",label: "Investigation Supervisor",   route: "/cid/home",           storeRole: "investigator"     },
  { id: "CYBER_CRIME",             label: "Cyber Crime Unit",           route: "/cid/home",           storeRole: "investigator"     },
  { id: "IMMIGRATION_LIAISON",     label: "Immigration Liaison",        route: "/viewer/dashboard",   storeRole: "viewer"            },
  { id: "PRISON_LIAISON",          label: "Prison Liaison",             route: "/viewer/dashboard",   storeRole: "viewer"            },
  { id: "EMERGENCY_DISPATCHER",    label: "Emergency Dispatcher",       route: "/system/dashboard",   storeRole: "admin"             },
  { id: "EVIDENCE_OFFICER",        label: "Evidence Officer",           route: "/clerk/records",      storeRole: "clerk"             },
  { id: "AUDIT_OFFICER",           label: "Audit / Internal Affairs",   route: "/system/dashboard",   storeRole: "clerk"             },
  { id: "DIG",                     label: "Deputy IGP",                 route: "/admin",              storeRole: "commander"         },
  { id: "CLERK", label: "Clerk", route: "/clerk/records", storeRole: "clerk" },
  { id: "VIEWER", label: "Viewer", route: "/viewer/dashboard", storeRole: "viewer" },
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
  const setOfficerProfile  = usePoliceStore((s) => s.setOfficerProfile);
  const [step, setStep] = useState<Step>("credentials");
  const [method, setMethod] = useState<"username" | "phone" | "email">("username");
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
      const response = await fetch("/api/police/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: cleanIdentifier,
          method,
          ...(method === "phone" && {
            phone: cleanIdentifier.replace(/\D/g,"").replace(/^(255|0)/,""),
          }),
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.error) {
        setErrorMsg(data?.error ?? "Akaunti haipatikani. Angalia taarifa zako.");
        setSending(false);
        return;
      }

      const apiRole = String(data?.user?.role ?? "");
      if (apiRole) {
        setAuthResolvedRole(apiRole);
        if (mode === "admin") setWebRole(apiRole);
      }

      // Store full profile from Supabase for use across the app
      if (data?.user) {
        setOfficerProfile({
          name:           data.user.name          ?? "",
          shortName:      data.user.shortName      ?? data.user.name?.split(" ").slice(0,2).join(" ") ?? "",
          rank:           data.user.rank           ?? "",
          rankShort:      data.user.rankShort      ?? "",
          id:             data.user.id             ?? "",
          badgeNo:        data.user.badgeNo        ?? data.user.badge ?? "",
          idNumber:       data.user.idNumber       ?? "",
          officerId:      data.user.officerId      ?? "",
          station:        data.user.station        ?? "",
          stationId:      data.user.stationId      ?? "",
          stationPhone:   data.user.stationPhone   ?? "",
          stationRegion:  data.user.stationRegion  ?? "",
          stationDistrict:data.user.stationDistrict?? "",
          unit:           data.user.unit           ?? "",
          phone:          data.user.phone          ?? "",
          email:          data.user.email          ?? "",
          photo:          data.user.photo          ?? "",
          region:         data.user.region         ?? "",
          status:         data.user.status         ?? "active",
          role:           data.user.role           ?? "",
          roleRaw:        data.user.roleRaw        ?? "",
          lastLogin:      data.user.lastLogin      ?? null,
          createdAt:      data.user.createdAt      ?? null,
          patrolsCount:   data.user.patrolsCount   ?? 0,
          citationsCount: data.user.citationsCount ?? 0,
          incidentsCount: data.user.incidentsCount ?? 0,
          hoursToday:     data.user.hoursToday     ?? 0,
        });
      }

      // Pre-fill OTP with bypass code if bypass is on
      if (data?.auth?.devOtp) {
        const digits = String(data.auth.devOtp).split("").slice(0, 6);
        setOtp(digits.concat(Array(6 - digits.length).fill("")).slice(0, 6) as string[]);
      }

      setStep("otp");
      setResendTimer(45);
      setTimeout(() => otpRefs.current[5]?.focus(), 100);
    } catch {
      setErrorMsg("Hitilafu ya mtandao. Angalia muunganisho wako.");
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
      // Strict API verify — no client-side bypass
      const res = await fetch("/api/police/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: cleanIdentifier, otp: otpCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setErrorMsg(data?.error ?? "OTP si sahihi. Jaribu tena.");
        setVerifying(false);
        return;
      }
      const userRole = authResolvedRole ?? "";

      // Create NextAuth session cookie so API routes can read auth state.
      // The OTP is already consumed above, so we pass a pre-verified token
      // that the authorize() function accepts without re-checking the OTP.
      //
      // NOTE: with `redirect: false`, signIn() resolves (does NOT throw) on
      // auth failure — it returns { ok: false, error: "CredentialsSignin" }.
      // We must inspect the result and abort if no session was created,
      // otherwise the Zustand store gets marked authenticated while the server
      // has no cookie, causing every subsequent /api/* call to 401.
      const userId = data?.userId ?? "";
      let sessionOk = false;
      try {
        const result = await signIn("credentials", {
          username: cleanIdentifier,
          otp:      `verified:${userId}`,   // authorize() recognises this pattern
          redirect: false,
        });
        sessionOk = Boolean(result && result.ok && !result.error);
        if (!sessionOk) {
          console.warn("[login] NextAuth signIn failed:", result?.error ?? "unknown");
        }
      } catch (err) {
        console.warn("[login] NextAuth signIn threw:", err);
      }
      if (!sessionOk) {
        setErrorMsg("Imeshindwa kuanzisha kikao cha msingi. Tafadhali jaribu tena.");
        setVerifying(false);
        return;
      }

      if (mode === "admin") {
        const resolvedAuthRole = (userRole || webRole) as AuthRole;
        saveLoginIdentifier(cleanIdentifier);
        setLoginIdentifier(cleanIdentifier);
        setStep("success");
        setTimeout(() => { loginAsRole(resolvedAuthRole); }, 900);
        return;
      }
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
      ? `+255 ${identifier.replace(/(\d{3})\d+(\d{2})/, "$1•••••$2")}`
      : method === "email"
      ? identifier.replace(/(.{2})(.*)(@.*)/, "$1•••$3")
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

      {/* ── OTP MODAL POPUP ────────────────────────────────────────── */}
      {step === "otp" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(10,20,50,0.75)", backdropFilter: "blur(6px)" }}>
          <div
            className="relative w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
            style={{ background: "var(--tpf-card, #fff)", animation: "otpSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)" }}
          >
            {/* Top accent bar */}
            <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg,#1E3A8A,#2196F3,#10B981)" }} />

            <div className="p-6">
              {/* Icon + heading */}
              <div className="flex flex-col items-center mb-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2196F3]/10 mb-3">
                  <ShieldCheck size={32} className="text-[#2196F3]" />
                </div>
                <h2 className="text-[20px] font-black text-police-navy2">Thibitisha OTP</h2>
                <p className="mt-1 text-center text-[12px] text-police-muted leading-relaxed">
                  Nambari ya uthibitisho imetumwa kwa<br />
                  <span className="font-bold text-[#1E3A8A]">{maskedIdentifier}</span>
                </p>
              </div>

              {/* OTP code hint banner */}
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[#2196F3]/25 bg-[#2196F3]/8 px-4 py-3">
                <Smartphone size={18} className="shrink-0 text-[#2196F3]" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#2196F3]">OTP Yako</p>
                  <p className="text-[11px] text-police-muted">Tumia nambari hii kuingia</p>
                </div>
                <div className="flex gap-1">
                  {["1","2","3","4","5","6"].map((d, i) => (
                    <span key={i} className="flex h-7 w-6 items-center justify-center rounded-lg bg-[#1E3A8A] text-[13px] font-black text-white shadow-sm">{d}</span>
                  ))}
                </div>
              </div>

              {/* OTP Inputs */}
              <div className="flex justify-between gap-2 mb-4" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKey(idx, e)}
                    className={`h-13 w-full rounded-xl border-2 bg-police-card text-center text-[22px] font-black focus:outline-none transition-all ${
                      digit
                        ? "border-[#2196F3] bg-[#2196F3]/8 text-[#1E3A8A]"
                        : "border-police-soft text-police-navy2 focus:border-[#2196F3] focus:bg-[#2196F3]/5"
                    }`}
                    style={{ height: "52px" }}
                  />
                ))}
              </div>

              {errorMsg && (
                <div className="mb-3 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/8 px-3 py-2 text-[12px] text-[#EF4444] text-center">
                  {errorMsg}
                </div>
              )}

              {/* Verify button */}
              <button
                onClick={verifyOtp}
                disabled={!otpComplete || verifying}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-black text-white shadow-lg transition active:scale-[0.98] disabled:opacity-50"
                style={{ background: otpComplete ? "linear-gradient(135deg,#1E3A8A,#2196F3)" : undefined, backgroundColor: otpComplete ? undefined : "#9CA3AF" }}
              >
                {verifying ? (
                  <><RefreshCw size={18} className="animate-spin" /> Inathibitisha...</>
                ) : (
                  <><ShieldCheck size={20} /> Thibitisha na Ingia <ArrowRight size={18} /></>
                )}
              </button>

              {/* Resend + back */}
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => { setStep("credentials"); setOtp(["","","","","",""]); }}
                  className="flex items-center gap-1 text-[12px] font-medium text-police-muted hover:text-police transition"
                >
                  <ArrowLeft size={14} /> Rudi
                </button>
                {resendTimer > 0 ? (
                  <span className="text-[12px] text-police-faint">Tuma tena {resendTimer}s</span>
                ) : (
                  <button onClick={resendOtp} className="flex items-center gap-1 text-[12px] font-bold text-[#2196F3]">
                    <RefreshCw size={12} /> Tuma tena
                  </button>
                )}
              </div>
            </div>
          </div>

          <style>{`
            @keyframes otpSlideUp {
              from { opacity: 0; transform: translateY(40px) scale(0.95); }
              to   { opacity: 1; transform: translateY(0)    scale(1);    }
            }
          `}</style>
        </div>
      )}

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

              {/* Role selector — Two Cascading Dropdowns */}
              {mode === "admin" ? (
                <div className="mt-4 space-y-3">
                  {/* DROPDOWN 1: Category Type */}
                  <div>
                    <label className="mb-2 block text-[13px] font-medium text-police-navy2">
                      1. Chagua Aina ya Akaunti
                    </label>
                    <div className="relative">
                      <select
                        value={roleCategory === "all" ? "" : roleCategory}
                        onChange={(e) => {
                          const catId = e.target.value as RoleCategory;
                          setRoleCategory(catId);
                          // Auto-select first role in category
                          const rolesInCat = WEB_ROLES.filter(r => 
                            ROLE_CATEGORIES.find(c => c.id === catId)?.roles.includes(r.id)
                          );
                          if (rolesInCat.length > 0) setWebRole(rolesInCat[0].id);
                        }}
                        className="h-12 w-full appearance-none rounded-xl border border-police bg-police-card px-4 pr-10 text-[14px] font-medium text-police focus:border-[#2196F3] focus:outline-none focus:ring-2 focus:ring-[#2196F3]/20"
                      >
                        <option value="" disabled>— Chagua Category —</option>
                        {ROLE_CATEGORIES.filter(c => c.id !== "all").map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.labelSw} ({cat.label})
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#2196F3]" />
                    </div>
                  </div>

                  {/* DROPDOWN 2: Role Type (filtered by category) */}
                  {roleCategory !== "all" && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                      <label className="mb-2 flex items-center gap-2 text-[13px] font-medium text-police-navy2">
                        <span>2. Chagua Role</span>
                        <span className="rounded bg-[#2196F3]/15 px-2 py-0.5 text-[10px] font-bold text-[#2196F3]">
                          {ROLE_CATEGORIES.find(c => c.id === roleCategory)?.labelSw}
                        </span>
                      </label>
                      <div className="relative">
                        <select
                          value={webRole}
                          onChange={(e) => setWebRole(e.target.value)}
                          className="h-12 w-full appearance-none rounded-xl border-2 border-[#2196F3]/30 bg-[#2196F3]/5 px-4 pr-10 text-[14px] font-bold text-[#1E3A8A] focus:border-[#2196F3] focus:outline-none focus:ring-2 focus:ring-[#2196F3]/30"
                        >
                          {filteredWebRoles.map((r) => (
                            <option key={r.id} value={r.id}>{r.label}</option>
                          ))}
                        </select>
                        <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#2196F3]" />
                      </div>

                      {/* Selected role info card */}
                      <div className="mt-3 rounded-xl border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shield size={16} className="text-[#1E3A8A]" />
                            <span className="text-[13px] font-bold text-[#1E3A8A]">
                              {WEB_ROLES.find(r => r.id === webRole)?.label || "Hakuna"}
                            </span>
                          </div>
                          <span className="rounded-lg bg-white/60 px-2 py-1 text-[10px] font-mono font-semibold text-[#2196F3]">
                            → {WEB_ROLES.find(r => r.id === webRole)?.route || "/admin/dashboard"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hint when no category selected */}
                  {roleCategory === "all" && (
                    <p className="flex items-center gap-2 text-[11px] text-police-faint">
                      <ChevronDown size={12} />
                      Chagua category hapo juu kuona roles zinazopatikana
                    </p>
                  )}
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

              {/* Method toggle — 3 options */}
              <div className="mt-4 flex gap-1.5 rounded-xl bg-police-muted p-1">
                {[
                  { id: "username", label: "Badge / Username", icon: User },
                  { id: "phone",    label: "Simu",             icon: Phone },
                  { id: "email",    label: "Email",            icon: Mail },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => { setMethod(id as "username" | "phone"); setIdentifier(""); }}
                    className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-2 text-[11px] font-semibold transition ${
                      method === id
                        ? "bg-police-card text-[#2196F3] shadow-sm"
                        : "text-police-muted hover:text-police"
                    }`}
                  >
                    <Icon size={14} />
                    <span className="leading-none">{label}</span>
                  </button>
                ))}
              </div>

              {/* Identifier Input */}
              <div className="mt-4">
                <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-police-muted">
                  {method === "username" ? "Badge Number au Username" : method === "phone" ? "Namba ya Simu" : "Barua Pepe"}
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-police bg-police-card px-3 focus-within:border-[#2196F3] focus-within:ring-2 focus-within:ring-[#2196F3]/20">
                  {method === "username" ? (
                    <Shield size={18} className="shrink-0 text-[#2196F3]" />
                  ) : method === "phone" ? (
                    <Phone size={18} className="shrink-0 text-[#2196F3]" />
                  ) : (
                    <Mail size={18} className="shrink-0 text-[#2196F3]" />
                  )}
                  {/* Tanzania country code prefix for phone */}
                  {method === "phone" && (
                    <span className="shrink-0 border-r border-police-soft pr-2 text-[13px] font-bold text-police-muted">+255</span>
                  )}
                  <input
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                    placeholder={
                      method === "username"
                        ? "e.g. SYSADMIN-001 au asp.sys"
                        : method === "phone"
                        ? "7XX XXX XXX"
                        : "jina@polisi.go.tz"
                    }
                    inputMode={method === "phone" ? "tel" : method === "email" ? "email" : "text"}
                    autoComplete={method === "email" ? "email" : method === "phone" ? "tel" : "username"}
                    className="h-12 flex-1 bg-transparent text-[14px] text-police placeholder:text-police-faint focus:outline-none"
                  />
                </div>
                {/* Helper hint */}
                <p className="mt-1.5 text-[11px] text-police-muted">
                  {method === "username" && "Ingiza badge number (e.g. SYSADMIN-001) au username"}
                  {method === "phone" && "Ingiza namba bila 0 ya kwanza — e.g. 712345678"}
                  {method === "email" && "Ingiza barua pepe iliyosajiliwa"}
                </p>
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
