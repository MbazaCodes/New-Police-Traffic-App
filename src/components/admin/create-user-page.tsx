"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, UserPlus, User, Phone, Mail, Shield, MapPin,
  Building2, BadgeCheck, Hash, Eye, EyeOff, CheckCircle2, AlertTriangle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useApiData } from "@/hooks/use-api-data";

// ── Tanzania regions ──────────────────────────────────────────
const TZ_REGIONS = [
  "Dar es Salaam","Mwanza","Arusha","Dodoma","Mbeya","Morogoro",
  "Tanga","Zanzibar Mjini Magharibi","Zanzibar Kaskazini Unguja",
  "Zanzibar Kusini Unguja","Zanzibar Kaskazini Pemba","Zanzibar Kusini Pemba",
  "Kilimanjaro","Kagera","Mara","Geita","Simiyu","Shinyanga","Tabora",
  "Singida","Katavi","Rukwa","Ruvuma","Iringa","Njombe","Songwe",
  "Lindi","Mtwara","Pwani","Makao Makuu",
].sort();

// ── Police ranks ──────────────────────────────────────────────
const POLICE_RANKS = [
  { label: "Inspector General of Police (IGP)", short: "IGP" },
  { label: "Deputy Inspector General (DIG)",    short: "DIG" },
  { label: "Commissioner of Police (CP)",       short: "CP"  },
  { label: "Asst. Commissioner of Police (ACP)",short: "ACP" },
  { label: "Senior Superintendent (SSP)",       short: "SSP" },
  { label: "Superintendent of Police (SP)",     short: "SP"  },
  { label: "Asst. Superintendent (ASP)",        short: "ASP" },
  { label: "Inspector (Insp.)",                 short: "Insp." },
  { label: "Sergeant Major (SM)",               short: "SM"  },
  { label: "Sergeant (Sgt.)",                   short: "Sgt." },
  { label: "Corporal (Cprl.)",                  short: "Cprl." },
  { label: "Constable (Cst.)",                  short: "Cst." },
  { label: "Civilian Staff",                    short: "Civ." },
];

// ── Roles ─────────────────────────────────────────────────────
const USER_ROLES = [
  { value: "super-admin",            label: "Super Admin" },
  { value: "admin",                  label: "System Admin / Msimamizi" },
  { value: "national-commissioner",  label: "National Commander (IGP/DIG)" },
  { value: "regional-commissioner",  label: "Regional Commander" },
  { value: "district-commissioner",  label: "District Commander" },
  { value: "station-commissioner",   label: "Station Commander (OC)" },
  { value: "officer-traffic",        label: "Traffic Officer" },
  { value: "officer-general",        label: "General Duty Officer" },
  { value: "post-officer",           label: "Post Officer" },
  { value: "cid-officer",            label: "CID Officer" },
  { value: "investigator",           label: "Investigator" },
  { value: "commander",              label: "Commander" },
  { value: "viewer",                 label: "Viewer (Read Only)" },
];

// ── Badge generator: FIRSTNAME-LASTNAME-XXX ───────────────────
function generateBadge(firstName: string, lastName: string, seq: string): string {
  const f = firstName.trim().toUpperCase().replace(/[^A-Z]/g, "").slice(0, 10);
  const l = lastName.trim().toUpperCase().replace(/[^A-Z]/g, "").slice(0, 10);
  const n = seq.replace(/\D/g, "").padStart(3, "0").slice(0, 3);
  if (!f && !l) return "";
  return [f, l, n].filter(Boolean).join("-");
}

// ── Username generator ────────────────────────────────────────
function generateUsername(firstName: string, lastName: string): string {
  const f = firstName.trim().toLowerCase().replace(/[^a-z]/g, "");
  const l = lastName.trim().toLowerCase().replace(/[^a-z]/g, "");
  if (!f) return "";
  return l ? `${f}.${l}` : f;
}

// ── Field component ───────────────────────────────────────────
function Field({ label, required, children, hint }: {
  label: string; required?: boolean; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-bold uppercase tracking-wide text-police-muted">
        {label}{required && <span className="ml-0.5 text-[#EF4444]">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-police-faint">{hint}</p>}
    </div>
  );
}

function Input({ icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-police-soft bg-police px-3 py-2.5 focus-within:border-[#2196F3] focus-within:ring-1 focus-within:ring-[#2196F3]/20 transition">
      {icon && <span className="shrink-0 text-police-muted">{icon}</span>}
      <input {...props} className="flex-1 bg-transparent text-[13px] text-police placeholder-police-faint focus:outline-none" />
    </div>
  );
}

function Select({ icon, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-police-soft bg-police px-3 py-2.5 focus-within:border-[#2196F3] transition">
      {icon && <span className="shrink-0 text-police-muted">{icon}</span>}
      <select {...props} className="flex-1 bg-transparent text-[13px] text-police focus:outline-none appearance-none">
        {children}
      </select>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export function CreateUserPage({ basePath }: { basePath: "/admin" | "/command" }) {
  const router = useRouter();

  // Personal
  const [firstName,  setFirstName]  = useState("");
  const [lastName,   setLastName]   = useState("");
  const [phone,      setPhone]      = useState("");
  const [email,      setEmail]      = useState("");
  const [gender,     setGender]     = useState("");
  const [idNumber,   setIdNumber]   = useState("");

  // Police identity
  const [badgeSeq,   setBadgeSeq]   = useState("001");
  const [rank,       setRank]       = useState("");
  const [rankShort,  setRankShort]  = useState("");
  const [role,       setRole]       = useState("officer-general");
  const [unit,       setUnit]       = useState("");
  const [stationId,  setStationId]  = useState("");
  const [region,     setRegion]     = useState("");
  const [status,     setStatus]     = useState("active");

  // Meta
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [errors,     setErrors]     = useState<Record<string, string>>({});

  // Live station list
  const { data: stations } = useApiData<{ id: string; name: string; region: string }>("/api/stations");

  // Auto-derived fields
  const badgeNo  = generateBadge(firstName, lastName, badgeSeq);
  const username = generateUsername(firstName, lastName);

  // Auto-set region when station is picked
  useEffect(() => {
    const st = stations.find((s) => s.id === stationId);
    if (st?.region) setRegion(st.region);
  }, [stationId, stations]);

  // Auto-set rank short when rank changes
  function handleRankChange(val: string) {
    setRank(val);
    const found = POLICE_RANKS.find((r) => r.label === val);
    if (found) setRankShort(found.short);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "Jina la kwanza linahitajika";
    if (!lastName.trim())  e.lastName  = "Jina la mwisho linahitajika";
    if (!role)             e.role      = "Nafasi inahitajika";
    if (!badgeNo)          e.badge     = "Badge number haikuundwa";
    if (phone && !/^[0-9+\s-]{9,15}$/.test(phone)) e.phone = "Namba ya simu si sahihi";
    if (email && !/\S+@\S+\.\S+/.test(email))       e.email = "Barua pepe si sahihi";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) {
      toast({ title: "Tafadhali angalia makosa", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:      `${firstName.trim()} ${lastName.trim()}`,
          firstName: firstName.trim(),
          lastName:  lastName.trim(),
          phone:     phone.trim()   || null,
          email:     email.trim()   || null,
          gender:    gender         || null,
          idNumber:  idNumber.trim()|| null,
          badgeNo,
          username,
          rank:      rank           || null,
          rankShort: rankShort      || null,
          role,
          unit:      unit.trim()    || null,
          stationId: stationId      || null,
          region:    region         || null,
          status,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Hitilafu ya seva");
      setSaved(true);
      toast({ title: "Mtumiaji Ameongezwa ✓", description: `${firstName} ${lastName} — Badge: ${badgeNo}` });
      setTimeout(() => router.push(`${basePath}/users`), 1500);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({ title: "Hitilafu", description: msg, variant: "destructive" });
    }
    setSaving(false);
  }

  if (saved) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-police p-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#10B981]/15">
          <CheckCircle2 size={44} className="text-[#10B981]" />
        </div>
        <h2 className="mt-4 text-[20px] font-black text-police">Mtumiaji Ameundwa!</h2>
        <p className="mt-1 text-[13px] text-police-muted">Badge: <strong>{badgeNo}</strong></p>
        <p className="mt-0.5 text-[13px] text-police-muted">Username: <strong>{username}</strong></p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-police p-4 pb-20 lg:p-6">
      <div className="mx-auto max-w-2xl space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href={`${basePath}/users`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-police-soft bg-police-card text-police-muted hover:bg-police-muted transition">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-[20px] font-black text-police">Ongeza Mtumiaji Mpya</h1>
            <p className="text-[11px] text-police-muted">Jaza taarifa zote — Badge inaundwa kiotomatiki</p>
          </div>
        </div>

        {/* Badge preview */}
        <div className={`flex items-center gap-3 rounded-2xl border p-4 transition ${
          badgeNo ? "border-[#2196F3]/30 bg-[#2196F3]/5" : "border-police-soft bg-police-card"
        }`}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1E3A8A]/15">
            <BadgeCheck size={24} className="text-[#1E3A8A]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-police-muted">Badge Number (Auto)</p>
            <p className={`text-[18px] font-black tracking-widest ${badgeNo ? "text-[#1E3A8A]" : "text-police-faint"}`}>
              {badgeNo || "JINA-MWISHO-001"}
            </p>
            {username && <p className="text-[11px] text-police-muted mt-0.5">Username: <strong>{username}</strong></p>}
          </div>
        </div>

        {/* ── SECTION 1: Personal Info ── */}
        <div className="rounded-2xl bg-police-card p-5 shadow-sm space-y-4">
          <h2 className="flex items-center gap-2 text-[14px] font-bold text-police">
            <User size={16} className="text-[#2196F3]" /> Taarifa Binafsi
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Jina la Kwanza" required>
              <Input icon={<User size={14} />}
                value={firstName} onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Juma" />
              {errors.firstName && <p className="mt-0.5 text-[10px] text-[#EF4444]">{errors.firstName}</p>}
            </Field>
            <Field label="Jina la Mwisho" required>
              <Input icon={<User size={14} />}
                value={lastName} onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Ally" />
              {errors.lastName && <p className="mt-0.5 text-[10px] text-[#EF4444]">{errors.lastName}</p>}
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Jinsia">
              <Select icon={<User size={14} />} value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Chagua...</option>
                <option value="M">Mume</option>
                <option value="F">Mke</option>
              </Select>
            </Field>
            <Field label="Namba ya Kitambulisho (NIDA)" hint="SA-2026-001">
              <Input icon={<Hash size={14} />}
                value={idNumber} onChange={(e) => setIdNumber(e.target.value)}
                placeholder="e.g. 19901203-12345-00001-7" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Namba ya Simu" hint="Itumike kuingia">
              <Input icon={<Phone size={14} />}
                value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="0712345678" type="tel" />
              {errors.phone && <p className="mt-0.5 text-[10px] text-[#EF4444]">{errors.phone}</p>}
            </Field>
            <Field label="Barua Pepe" hint="Itumike kuingia">
              <Input icon={<Mail size={14} />}
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="juma@polisi.go.tz" type="email" />
              {errors.email && <p className="mt-0.5 text-[10px] text-[#EF4444]">{errors.email}</p>}
            </Field>
          </div>
        </div>

        {/* ── SECTION 2: Police Identity ── */}
        <div className="rounded-2xl bg-police-card p-5 shadow-sm space-y-4">
          <h2 className="flex items-center gap-2 text-[14px] font-bold text-police">
            <Shield size={16} className="text-[#1E3A8A]" /> Utambulisho wa Polisi
          </h2>

          {/* Badge number builder */}
          <div className="rounded-xl border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 p-4 space-y-3">
            <p className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wide">
              Jinsi Badge Inavyounda: JINA-MWISHO-XXX
            </p>
            <div className="grid grid-cols-3 gap-2 text-[12px]">
              <div className="rounded-lg border border-[#1E3A8A]/20 bg-white/50 dark:bg-black/10 px-3 py-2 text-center">
                <p className="text-[9px] text-police-muted uppercase">Jina la Kwanza</p>
                <p className="font-black text-[#1E3A8A] text-[15px]">{firstName.toUpperCase().replace(/[^A-Z]/g,"") || "JINA"}</p>
              </div>
              <div className="rounded-lg border border-[#1E3A8A]/20 bg-white/50 dark:bg-black/10 px-3 py-2 text-center">
                <p className="text-[9px] text-police-muted uppercase">Jina la Mwisho</p>
                <p className="font-black text-[#1E3A8A] text-[15px]">{lastName.toUpperCase().replace(/[^A-Z]/g,"") || "MWISHO"}</p>
              </div>
              <div className="rounded-lg border border-[#2196F3]/30 bg-[#2196F3]/10 px-3 py-2 text-center">
                <p className="text-[9px] text-police-muted uppercase">Nambari (3)</p>
                <input
                  value={badgeSeq}
                  onChange={(e) => setBadgeSeq(e.target.value.replace(/\D/g,"").slice(0,3))}
                  maxLength={3}
                  className="w-full bg-transparent text-center text-[15px] font-black text-[#2196F3] focus:outline-none"
                  placeholder="001"
                />
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2">
              <BadgeCheck size={16} className="text-white" />
              <span className="text-[14px] font-black tracking-widest text-white">{badgeNo || "JINA-MWISHO-001"}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Cheo / Rank" required>
              <Select icon={<Shield size={14} />}
                value={rank} onChange={(e) => handleRankChange(e.target.value)}>
                <option value="">Chagua cheo...</option>
                {POLICE_RANKS.map((r) => (
                  <option key={r.short} value={r.label}>{r.short} — {r.label.split("(")[0].trim()}</option>
                ))}
              </Select>
            </Field>
            <Field label="Cheo Kifupi" hint="Auto-inajaza">
              <Input icon={<Shield size={14} />}
                value={rankShort} onChange={(e) => setRankShort(e.target.value)}
                placeholder="e.g. ASP" />
            </Field>
          </div>

          <Field label="Nafasi / Role" required>
            <Select icon={<BadgeCheck size={14} />}
              value={role} onChange={(e) => setRole(e.target.value)}>
              {USER_ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </Select>
            {errors.role && <p className="text-[10px] text-[#EF4444]">{errors.role}</p>}
          </Field>

          <Field label="Kitengo / Unit" hint="e.g. Trafiki, CID, Ulinzi">
            <Input icon={<Shield size={14} />}
              value={unit} onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. Traffic Unit" />
          </Field>

          <Field label="Hali / Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Hai / Active</option>
              <option value="off-duty">Zamu Imekwisha / Off Duty</option>
              <option value="on-leave">Likizoni / On Leave</option>
              <option value="suspended">Amesimamishwa / Suspended</option>
            </Select>
          </Field>
        </div>

        {/* ── SECTION 3: Station & Location ── */}
        <div className="rounded-2xl bg-police-card p-5 shadow-sm space-y-4">
          <h2 className="flex items-center gap-2 text-[14px] font-bold text-police">
            <Building2 size={16} className="text-[#10B981]" /> Kituo na Eneo
          </h2>

          <Field label="Kituo cha Polisi">
            <Select icon={<Building2 size={14} />}
              value={stationId} onChange={(e) => setStationId(e.target.value)}>
              <option value="">Chagua kituo...</option>
              {stations.map((s) => (
                <option key={s.id} value={s.id}>{s.name} — {s.region}</option>
              ))}
            </Select>
            {stations.length === 0 && (
              <p className="text-[10px] text-[#FF9800]">⚠ Hakuna vituo — ongeza kituo kwanza kwenye Vituo</p>
            )}
          </Field>

          <Field label="Mkoa / Region">
            <Select icon={<MapPin size={14} />}
              value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="">Chagua mkoa...</option>
              {TZ_REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Select>
          </Field>
        </div>

        {/* ── Error summary ── */}
        {Object.keys(errors).length > 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-[#EF4444]/25 bg-[#EF4444]/8 p-4">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[#EF4444]" />
            <div>
              <p className="text-[13px] font-bold text-[#EF4444]">Tafadhali rekebisha makosa:</p>
              <ul className="mt-1 space-y-0.5">
                {Object.values(errors).map((e, i) => (
                  <li key={i} className="text-[12px] text-[#EF4444]">• {e}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── Save button ── */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-black text-white shadow-lg transition active:scale-[0.98] disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#1E3A8A,#2196F3)" }}
        >
          {saving ? (
            <><span className="animate-spin">⏳</span> Inahifadhi...</>
          ) : (
            <><UserPlus size={20} /> Unda Mtumiaji — {badgeNo || "JINA-MWISHO-001"}</>
          )}
        </button>

        <p className="pb-4 text-center text-[11px] text-police-faint">
          Badge na username zinaundwa kiotomatiki kutoka kwa jina. OTP itumike kuingia — hakuna password.
        </p>
      </div>
    </div>
  );
}
