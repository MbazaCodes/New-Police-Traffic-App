'use client';

import { useState, useRef, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import {
  Shield, ShieldCheck, User, Phone, Mail, ChevronDown,
  ArrowRight, ArrowLeft, KeyRound, RefreshCw, Smartphone,
  CheckCircle2, Download, X, Info, Lock,
} from 'lucide-react';
import { usePoliceStore, AUTH_ROLES, type AuthRole } from '@/store/police-store';
import { saveLoginIdentifier, saveOfficerUserId } from '@/lib/session-context';
import type { UserRole } from '@/store/police-store';

type Step = 'credentials' | 'otp' | 'success';
type AccountType = 'officer' | 'administrator' | 'guest';
type LoginMethod = 'username' | 'phone' | 'email';

const ACCOUNT_TYPES: { id: AccountType; label: string; labelSw: string }[] = [
  { id: 'officer',       label: 'Police Officer',   labelSw: 'Afisa wa Polisi' },
  { id: 'administrator', label: 'Administrator',    labelSw: 'Msimamizi' },
  { id: 'guest',         label: 'Guest',            labelSw: 'Mgeni' },
];

const ROLE_ROUTES: Record<string, string> = {
  SUPER_ADMIN:          '/admin/dashboard',
  SYSTEM_ADMIN:         '/system/dashboard',
  NATIONAL_COMMANDER:   '/command/national/dashboard',
  REGIONAL_COMMANDER:   '/command/regional/dashboard',
  DISTRICT_COMMANDER:   '/command/district/dashboard',
  STATION_COMMANDER:    '/command/station/dashboard',
  TRAFFIC_OFFICER:      '/officer/traffic/home',
  GENERAL_OFFICER:      '/officer/general/home',
  POST_OFFICER:         '/officer/post/home',
  INVESTIGATOR:         '/cid/home',
  CID_OFFICER:          '/cid/home',
  INVESTIGATION_SUPERVISOR: '/cid/home',
  CYBER_CRIME:          '/cid/home',
  IMMIGRATION_LIAISON:  '/viewer/dashboard',
  PRISON_LIAISON:       '/viewer/dashboard',
  EMERGENCY_DISPATCHER: '/system/dashboard',
  EVIDENCE_OFFICER:     '/clerk/records',
  AUDIT_OFFICER:        '/system/dashboard',
  DIG:                  '/admin/dashboard',
  CLERK:                '/clerk/records',
  NATIONAL_CLERK:       '/clerk/records',
  REGIONAL_CLERK:       '/clerk/records',
  DISTRICT_CLERK:       '/clerk/records',
  VIEWER:               '/viewer/dashboard',
};

function toStoreRole(authRole: string): UserRole {
  if (authRole === 'TRAFFIC_OFFICER' || authRole === 'POST_OFFICER') return 'officer-traffic';
  if (authRole === 'GENERAL_OFFICER') return 'officer-general';
  if (authRole.includes('COMMANDER') || authRole === 'DIG') return 'commander';
  if (authRole.includes('INVESTIGATOR') || authRole.includes('CID') || authRole === 'CYBER_CRIME') return 'investigator';
  if (authRole.includes('CLERK') || authRole === 'EVIDENCE_OFFICER' || authRole === 'AUDIT_OFFICER') return 'clerk';
  if (authRole === 'VIEWER' || authRole === 'IMMIGRATION_LIAISON' || authRole === 'PRISON_LIAISON') return 'viewer';
  return 'admin';
}

export default function LoginPage() {
  const login = usePoliceStore((s) => s.login);
  const loginAsRole = usePoliceStore((s) => s.loginAsRole);
  const setLoginIdentifier = usePoliceStore((s) => s.setLoginIdentifier);
  const setOfficerProfile = usePoliceStore((s) => s.setOfficerProfile);

  // Force-clear stale session state after logout (tz-force-clear cookie)
  useEffect(() => {
    const hasForceClear = document.cookie.includes("tz-force-clear=1");
    if (hasForceClear) {
      localStorage.removeItem("tz-police-auth");
      localStorage.removeItem("tpf-citizen-store");
      localStorage.removeItem("citizen-token");
      localStorage.removeItem("citizen-session");
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("tpf-login-id");
      sessionStorage.removeItem("tpf-officer-uid");
      sessionStorage.removeItem("pwa-install-dismissed");
      document.cookie = "tz-force-clear=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    }
  }, []);

  const [step, setStep] = useState<Step>('credentials');
  const [accountType, setAccountType] = useState<AccountType | ''>('');
  const [method, setMethod] = useState<LoginMethod>('username');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [resolvedRole, setResolvedRole] = useState('');
  const [showInstall, setShowInstall] = useState(true);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const handleOtpKey = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    const next = ['', '', '', '', '', ''];
    text.split('').forEach((c, i) => (next[i] = c));
    setOtp(next);
    otpRefs.current[Math.min(text.length, 5)]?.focus();
  };

  const sendOtp = async () => {
    const clean = identifier.trim();
    if (!clean) return;
    setErrorMsg('');
    setSending(true);
    try {
      const res = await fetch('/api/police/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: clean, method }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) {
        setErrorMsg(data?.error ?? 'Akaunti haipatikani. Angalia taarifa zako.');
        return;
      }
      if (data?.user?.role) setResolvedRole(data.user.role);
      if (data?.user?.id) saveOfficerUserId(data.user.id);
      if (data?.user) {
        setOfficerProfile({
          name: data.user.name ?? '',
          shortName: data.user.shortName ?? '',
          rank: data.user.rank ?? '',
          rankShort: data.user.rankShort ?? '',
          id: data.user.id ?? '',
          badgeNo: data.user.badgeNo ?? '',
          idNumber: data.user.idNumber ?? '',
          officerId: data.user.officerId ?? '',
          station: data.user.station ?? '',
          stationId: data.user.stationId ?? '',
          stationPhone: '',
          stationRegion: data.user.region ?? '',
          stationDistrict: '',
          unit: data.user.unit ?? '',
          phone: data.user.phone ?? '',
          email: data.user.email ?? '',
          photo: data.user.photo ?? '',
          region: data.user.region ?? '',
          status: data.user.status ?? 'active',
          role: data.user.role ?? '',
          roleRaw: data.user.roleRaw ?? '',
          lastLogin: data.user.lastLogin ?? null,
          createdAt: data.user.createdAt ?? null,
          patrolsCount: data.user.patrolsCount ?? 0,
          citationsCount: data.user.citationsCount ?? 0,
          incidentsCount: data.user.incidentsCount ?? 0,
          hoursToday: data.user.hoursToday ?? 0,
        });
      }
      if (data?.auth?.devOtp) {
        const digits = String(data.auth.devOtp).split('').slice(0, 6);
        setOtp(digits.concat(Array(6 - digits.length).fill('')).slice(0, 6) as string[]);
      }
      setStep('otp');
      setResendTimer(45);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setErrorMsg('Hitilafu ya mtandao. Angalia muunganisho wako.');
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async () => {
    const clean = identifier.trim();
    const code = otp.join('');
    if (!clean || code.length < 6) return;
    setErrorMsg('');
    setVerifying(true);
    try {
      const res = await fetch('/api/police/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: clean, otp: code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setErrorMsg(data?.error ?? 'OTP si sahihi. Jaribu tena.');
        return;
      }
      const result = await signIn('credentials', {
        username: clean,
        otp: `verified:${data?.userId ?? ''}`,
        redirect: false,
      });
      if (!result?.ok || result?.error) {
        setErrorMsg('Imeshindwa kuanzisha kikao. Tafadhali jaribu tena.');
        return;
      }
      const role = resolvedRole;
      const storeRole = toStoreRole(role) as AuthRole;
      saveLoginIdentifier(clean);
      setLoginIdentifier(clean);
      setStep('success');
      const route = ROLE_ROUTES[role] ?? '/admin/dashboard';
      setTimeout(() => {
        if (role === 'TRAFFIC_OFFICER' || role === 'GENERAL_OFFICER' || role === 'POST_OFFICER') {
          // R1 (stabilize): cast AuthRole to UserRole — the police-store
          // login() expects UserRole, but storeRole is AuthRole. The two
          // types overlap but TypeScript can't verify the conversion.
          login(storeRole as unknown as UserRole);
          window.location.href = route + '?pwa=1';
        } else {
          loginAsRole(storeRole);
        }
      }, 900);
    } catch {
      setErrorMsg('Hitilafu ya mtandao. Jaribu tena.');
    } finally {
      setVerifying(false);
    }
  };

  const otpComplete = otp.join('').length === 6;
  const maskedIdentifier = method === 'phone'
    ? `+255 ${identifier.replace(/(\d{3})\d+(\d{2})/, '$1\u2022\u2022\u2022\u2022\u2022$2')}`
    : method === 'email'
    ? identifier.replace(/(.{2})(.*)(@.*)/, '$1\u2022\u2022\u2022$3')
    : identifier;

  const isFormValid = accountType !== '' && identifier.trim() !== '';

  return (
    <div className="flex min-h-screen">
      {/* ─── Left Panel: Branding ─── */}
      <div className="hidden lg:flex lg:w-[55%] flex-col items-center justify-center px-12 relative overflow-hidden"
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

        {/* Government Header */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-md">
          <p className="text-[13px] font-bold tracking-[0.2em] uppercase text-[#D97706] mb-1">
            JAMHURI YA MUUNGANO WA TANZANIA
          </p>
          <p className="text-[11px] tracking-[0.15em] uppercase text-white/50 mb-8">
            WIZARA YA MAMBO YA NDANI YA NCHI
          </p>

          {/* Police Badge */}
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full blur-xl opacity-30"
              style={{ background: "radial-gradient(circle, #2196F3, transparent)" }} />
            <div className="relative h-44 w-44 overflow-hidden rounded-full ring-2 ring-white/10 shadow-2xl">
              <Image
                src="/police-logo.png"
                alt="Tanzania Police Force Badge"
                width={176}
                height={176}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>

          {/* Force Name */}
          <h1 className="text-[32px] font-black tracking-tight text-white leading-tight mb-2">
            JESHI LA POLISI<br />TANZANIA
          </h1>
          <div className="h-0.5 w-16 rounded-full mb-3" style={{ background: "linear-gradient(90deg, #D97706, #F59E0B)" }} />
          <p className="text-[13px] text-white/40 tracking-wide">
            Tanzania Police Digital Operations Platform
          </p>

          {/* Stats */}
          <div className="mt-12 flex gap-10">
            {[
              { label: "Mikoa",   value: "26" },
              { label: "Vituo",   value: "300+" },
              { label: "Maafisa", value: "40K+" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-[24px] font-black text-[#D97706]">{s.value}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-6 text-[10px] text-white/20 tracking-widest uppercase">
          © 2026 Tanzania Police Force — Mfumo Salama
        </div>
      </div>

      {/* ─── Right Panel: Login Form ─── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#f0f4f8] px-6 py-8 lg:w-[45%] relative overflow-y-auto">
        {/* OTP Modal Overlay */}
        {step === 'otp' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(10,20,50,0.75)', backdropFilter: 'blur(6px)' }}>
            <div className="relative w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
              style={{ background: 'var(--tpf-card, #fff)', animation: 'otpSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)' }}>
              {/* Gradient top bar */}
              <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg,#1E3A8A,#2196F3,#10B981)' }} />
              <div className="p-6">
                {/* OTP Header */}
                <div className="flex flex-col items-center mb-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2196F3]/10 mb-3">
                    <ShieldCheck size={32} className="text-[#2196F3]" />
                  </div>
                  <h2 className="text-[20px] font-black text-[#0F2557]">Thibitisha OTP</h2>
                  <p className="mt-1 text-center text-[12px] text-[#64748B] leading-relaxed">
                    Nambari ya uthibitisho imetumwa kwa<br />
                    <span className="font-bold text-[#1E3A8A]">{maskedIdentifier}</span>
                  </p>
                </div>

                {/* OTP Info Banner */}
                <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[#2196F3]/25 bg-[#2196F3]/8 px-4 py-3">
                  <Smartphone size={18} className="shrink-0 text-[#2196F3]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#2196F3]">OTP Yako</p>
                    <p className="text-[11px] text-[#64748B]">Tumia nambari hii kuingia</p>
                  </div>
                </div>

                {/* 6-digit OTP Input */}
                <div className="flex justify-between gap-2 mb-4" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input key={idx} ref={(el) => { otpRefs.current[idx] = el; }}
                      type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKey(idx, e)}
                      className={`h-[52px] w-full rounded-xl border-2 text-center text-[22px] font-black focus:outline-none transition-all ${
                        digit ? 'border-[#2196F3] bg-[#2196F3]/8 text-[#1E3A8A]' : 'border-[#E2E8F0] bg-white text-[#0F2557] focus:border-[#2196F3]'
                      }`}
                    />
                  ))}
                </div>

                {/* Error message */}
                {errorMsg && (
                  <div className="mb-3 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/8 px-3 py-2 text-[12px] text-[#EF4444] text-center">
                    {errorMsg}
                  </div>
                )}

                {/* Verify Button */}
                <button onClick={verifyOtp} disabled={!otpComplete || verifying}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-black text-white shadow-lg transition active:scale-[0.98] disabled:opacity-50"
                  style={{ background: otpComplete ? 'linear-gradient(135deg,#1E3A8A,#2196F3)' : undefined, backgroundColor: otpComplete ? undefined : '#9CA3AF' }}>
                  {verifying
                    ? <><RefreshCw size={18} className="animate-spin" /> Inathibitisha...</>
                    : <><ShieldCheck size={20} /> Thibitisha na Ingia <ArrowRight size={18} /></>}
                </button>

                {/* Resend / Back */}
                <div className="mt-4 flex items-center justify-between">
                  <button onClick={() => { setStep('credentials'); setOtp(['', '', '', '', '', '']); }}
                    className="flex items-center gap-1 text-[12px] font-medium text-[#64748B] hover:text-[#0F172A] transition">
                    <ArrowLeft size={14} /> Rudi
                  </button>
                  {resendTimer > 0
                    ? <span className="text-[12px] text-[#9CA3AF]">Tuma tena {resendTimer}s</span>
                    : <button onClick={() => sendOtp()} className="flex items-center gap-1 text-[12px] font-bold text-[#2196F3]">
                        <RefreshCw size={12} /> Tuma tena
                      </button>}
                </div>
              </div>
            </div>
            <style>{`@keyframes otpSlideUp { from { opacity:0; transform:translateY(40px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
          </div>
        )}

        {/* ─── Login Card ─── */}
        <div className="w-full max-w-[420px] rounded-2xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] bg-white">
          {/* Top accent border */}
          <div className="h-2 w-full" style={{ background: "linear-gradient(90deg, #D97706, #F59E0B, #D97706)" }} />

          <div className="px-8 py-8">
            {/* ─── Credentials Step ─── */}
            {step === 'credentials' && (
              <>
                {/* Small Coat of Arms */}
                <div className="flex justify-center mb-5">
                  <div className="h-[60px] w-[60px] overflow-hidden rounded-full ring-2 ring-[#2196F3]/15">
                    <Image src="/police-logo.png" alt="Tanzania Coat of Arms" width={60} height={60} className="h-full w-full object-cover" priority />
                  </div>
                </div>

                {/* Welcome Header */}
                <h2 className="text-center text-[19px] font-bold text-[#1E293B]">
                  Ingia kwenye Mfumo
                </h2>
                <p className="mt-1 text-center text-[13px] text-[#64748B]">
                  Chagua nafasi yako kuanzia
                </p>

                {/* ─── Account Type Dropdown ─── */}
                <div className="mt-6">
                  <label className="mb-2 block text-[13px] font-semibold text-[#374151]">
                    1. Chagua Aina ya Akaunti
                  </label>
                  <div className="relative">
                    <select
                      value={accountType}
                      onChange={(e) => setAccountType(e.target.value as AccountType)}
                      className="h-12 w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white px-4 pr-10 text-[14px] font-medium text-[#374151] focus:border-[#2196F3] focus:outline-none focus:ring-2 focus:ring-[#2196F3]/20 transition"
                    >
                      <option value="" disabled>&#8212; Chagua Category &#8212;</option>
                      {ACCOUNT_TYPES.map((t) => (
                        <option key={t.id} value={t.id}>{t.label} &#8212; {t.labelSw}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#2196F3]" />
                  </div>
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] text-[#9CA3AF]">
                    <Info size={12} /> * Chagua aina yako ili kuendelea na uingizaji
                  </p>
                </div>

                {/* ─── Login Method Toggle ─── */}
                <div className="mt-5 flex gap-1 rounded-xl bg-[#F3F4F6] p-1">
                  {([
                    { id: 'username', label: 'Badge / Username', Icon: Shield },
                    { id: 'phone',    label: 'Simu',             Icon: Phone },
                    { id: 'email',    label: 'Email',            Icon: Mail },
                  ] as { id: LoginMethod; label: string; Icon: typeof Shield }[]).map(({ id, label, Icon }) => (
                    <button key={id} onClick={() => { setMethod(id); setIdentifier(''); }}
                      className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2.5 text-[11px] font-semibold transition-all ${
                        method === id
                          ? 'bg-white text-[#2563EB] shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                          : 'text-[#6B7280] hover:text-[#374151]'
                      }`}>
                      <Icon size={16} />
                      <span className="leading-none">{label}</span>
                    </button>
                  ))}
                </div>

                {/* ─── Identifier Input ─── */}
                <div className="mt-5">
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#6B7280]">
                    {method === 'username' ? 'Badge Number au Username' : method === 'phone' ? 'Namba ya Simu' : 'Barua Pepe'}
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 focus-within:border-[#2196F3] focus-within:ring-2 focus-within:ring-[#2196F3]/20 transition">
                    {method === 'username' ? <Shield size={18} className="shrink-0 text-[#93C5FD]" />
                      : method === 'phone' ? <Phone size={18} className="shrink-0 text-[#93C5FD]" />
                      : <Mail size={18} className="shrink-0 text-[#93C5FD]" />}
                    {method === 'phone' && (
                      <span className="shrink-0 border-r border-[#E5E7EB] pr-2 text-[13px] font-bold text-[#64748B]">+255</span>
                    )}
                    <input
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && isFormValid && sendOtp()}
                      placeholder={method === 'username' ? 'c.g. SYSADMIN 001 au apps' : method === 'phone' ? '7XX XXX XXX' : 'jina@polisi.go.tz'}
                      inputMode={method === 'phone' ? 'tel' : method === 'email' ? 'email' : 'text'}
                      className="h-12 flex-1 bg-transparent text-[14px] text-[#1E293B] placeholder:text-[#9CA3AF] focus:outline-none"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-[#64748B]">
                    {method === 'username' && 'Badge / User name/email/mobile Number (auto detect)'}
                    {method === 'phone' && 'Ingiza namba bila 0 ya kwanza \u2014 e.g. 712345678'}
                    {method === 'email' && 'Ingiza barua pepe iliyosajiliwa'}
                  </p>
                </div>

                {/* ─── OTP Info Banner ─── */}
                <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-[#EFF6FF] border-l-[3px] border-l-[#2196F3] px-4 py-3">
                  <Lock size={16} className="mt-0.5 shrink-0 text-[#2196F3]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-[#64748B] leading-relaxed">
                      OTP tofauti kwa simu yako baada ya uwazi kisha.{' '}
                      <span className="font-semibold text-[#2563EB]">Hakuna password inahitajika.</span>
                    </p>
                    <p className="mt-1 text-[11px] text-[#9CA3AF]">
                      Ingia kodi nafasi: simu, na barua pepe kwaona
                    </p>
                  </div>
                </div>

                {/* ─── Warning Note (Guest) ─── */}
                {accountType === 'guest' && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#FFFBEB] border-l-[3px] border-l-[#D97706] px-3 py-2.5">
                    <Info size={14} className="mt-0.5 shrink-0 text-[#D97706]" />
                    <p className="text-[11px] text-[#92400E] leading-snug">
                      Ukiwa bado kwenye mfumo... tafadhali fungua programu mpya
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {errorMsg && (
                  <div className="mt-3 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-3 py-2 text-[12px] text-[#EF4444]">
                    {errorMsg}
                  </div>
                )}

                {/* ─── Submit Button ─── */}
                <button onClick={sendOtp} disabled={!isFormValid || sending}
                  className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
                    isFormValid && !sending
                      ? 'bg-[#2196F3] shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:bg-[#1E88E5]'
                      : 'cursor-not-allowed bg-[#9CA3AF] shadow-none'
                  }`}>
                  {sending
                    ? <><RefreshCw size={18} className="animate-spin" /> Inatuma OTP...</>
                    : <><KeyRound size={20} /><span>Ingia kwenye Mfumo</span><ArrowRight size={18} /></>}
                </button>
              </>
            )}

            {/* ─── Success Step ─── */}
            {step === 'success' && (
              <div className="flex flex-col items-center py-6">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#10B981]/10">
                  <div className="absolute inset-0 animate-ping rounded-full bg-[#10B981]/20 opacity-40" />
                  <CheckCircle2 size={48} className="text-[#10B981] relative z-10" />
                </div>
                <h2 className="mt-4 text-[19px] font-bold text-[#0F2557]">Login Imefanikiwa!</h2>
                <p className="mt-1 text-center text-[13px] text-[#64748B]">Karibu kwenye mfumo. Inaingia...</p>
                <div className="mt-4 h-1.5 w-40 overflow-hidden rounded-full bg-[#F1F5F9]">
                  <div className="h-full rounded-full bg-[#2196F3]" style={{ animation: 'progress-fill 0.85s ease-in-out forwards' }} />
                </div>
                <style>{`@keyframes progress-fill { from { width: 0% } to { width: 100% } }`}</style>
              </div>
            )}
          </div>
        </div>

        {/* ─── Bottom info ─── */}
        <div className="mt-6 text-center max-w-[420px]">
          <p className="text-[11px] text-[#64748B]">Mfumo salama wa Jeshi la Polisi Tanzania</p>
          <p className="mt-1 text-[11px] text-[#9CA3AF]">&copy; 2026 Tanzania Police Force</p>
        </div>
      </div>

      {/* ─── Install PWA Banner ─── */}
      {showInstall && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] border-t border-[#E5E7EB]">
          <div className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F2557]">
                <Download size={20} className="text-white" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-[#0F172A]">Install TPDOP</p>
                <p className="text-[12px] text-[#64748B]">Faster access, works offline. Add to Home screen.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="rounded-lg bg-[#0F2557] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#1A3A8A] transition">
                Install
              </button>
              <button onClick={() => setShowInstall(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#374151] transition">
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Bottom dark strip ─── */}
      <div className="fixed bottom-0 left-0 right-0 h-[6px] bg-[#111827] z-30" />
    </div>
  );
}
