"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Building2, MapPin, Phone, Mail, Hash, Calendar,
  Shield, CheckCircle2, AlertTriangle, Save, Eye, EyeOff,
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

// ── Station types ─────────────────────────────────────────────
const STATION_TYPES = [
  { value: "regional", label: "Kituo cha Mkoa (Regional HQ)" },
  { value: "district", label: "Kituo cha Wilaya (District HQ)" },
  { value: "police", label: "Kituo cha Polisi (Police Station)" },
  { value: "post", label: "Posti ya Polisi (Police Post)" },
  { value: "highway", label: "Kituo cha Barabara Kuu (Highway Patrol)" },
  { value: "traffic", label: "Kituo cha Trafiki (Traffic Unit)" },
  { value: "marine", label: "Kituo cha Bahari (Marine Police)" },
  { value: "airport", label: "Kituo cha Ndege (Airport Police)" },
  { value: "railway", label: "Kituo ya Reli (Railway Police)" },
  { value: "special", label: "Kitu Maalum (Special Unit)" },
];

// ── Station status options ────────────────────────────────────
const STATION_STATUS = [
  { value: "active", label: "Inafanya Kazi / Active", color: "#10B981" },
  { value: "maintenance", label: "Matengenezo / Maintenance", color: "#FF9800" },
  { value: "inactive", label: "Imefungwa / Inactive", color: "#EF4444" },
  { value: "planned", label: "Ipaswayo / Planned", color: "#2196F3" },
];

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
export function CreateStationPage({ basePath }: { basePath: "/admin" | "/command" }) {
  const router = useRouter();

  // Basic info
  const [name, setName] = useState("");
  const [stationType, setStationType] = useState("police");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("active");

  // Location
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // Contact
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  // Operational
  const [establishedDate, setEstablishedDate] = useState("");
  const [officerCapacity, setOfficerCapacity] = useState("");
  const [postCount, setPostCount] = useState("0");
  const [jurisdiction, setJurisdiction] = useState("");
  const [description, setDescription] = useState("");

  // Meta
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate station code from name and region
  useEffect(() => {
    if (name.trim() && region) {
      const namePart = name.trim().toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
      const regionPart = region.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);
      setCode(`${namePart}-${regionPart}`);
    }
  }, [name, region]);

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Jina la kituo linahitajika";
    if (!region) e.region = "Mkoa unahitajika";
    if (!stationType) e.stationType = "Aina ya kituo inahitajika";
    if (!status) e.status = "Hali inahitajika";
    if (phone && !/^[0-9+\s-]{9,15}$/.test(phone)) e.phone = "Namba ya simu si sahihi";
    if (email && !/\S+@\S+\.\S+/.test(email)) e.email = "Barua pepe si sahihi";
    if (latitude && !/^-?\d+(\.\d+)?$/.test(latitude)) e.latitude = "Latitude si sahihi";
    if (longitude && !/^-?\d+(\.\d+)?$/.test(longitude)) e.longitude = "Longitude si sahihi";
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
      const res = await fetch("/api/stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          code,
          type: stationType,
          status,
          region,
          district: district.trim() || null,
          ward: ward.trim() || null,
          address: address.trim() || null,
          latitude: latitude.trim() || null,
          longitude: longitude.trim() || null,
          phone: phone.trim() || null,
          email: email.trim() || null,
          emergency_contact: emergencyContact.trim() || null,
          established_date: establishedDate || null,
          officer_capacity: officerCapacity ? parseInt(officerCapacity, 10) : null,
          post_count: parseInt(postCount, 10) || 0,
          jurisdiction: jurisdiction.trim() || null,
          description: description.trim() || null,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Hitilafu ya seva");
      setSaved(true);
      toast({
        title: "Kituo Kimeongezwa ✓",
        description: `${name.trim()} — Code: ${code}`,
      });
      setTimeout(() => router.push(`${basePath}/stations`), 1500);
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
        <h2 className="mt-4 text-[20px] font-black text-police">Kituo Kimeundwa!</h2>
        <p className="mt-1 text-[13px] text-police-muted">Jina: <strong>{name}</strong></p>
        <p className="mt-0.5 text-[13px] text-police-muted">Code: <strong>{code || "Auto-generated"}</strong></p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-police p-4 pb-20 lg:p-6">
      <div className="mx-auto max-w-2xl space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href={`${basePath}/stations`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-police-soft bg-police-card text-police-muted hover:bg-police-muted transition">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-[20px] font-black text-police">Ongeza Kituo Kipya</h1>
            <p className="text-[11px] text-police-muted">Jaza taarifa kamili za kituo — Code inaundwa kiotomatiki</p>
          </div>
        </div>

        {/* Code preview */}
        <div className={`flex items-center gap-3 rounded-2xl border p-4 transition ${
          code ? "border-[#2196F3]/30 bg-[#2196F3]/5" : "border-police-soft bg-police-card"
        }`}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1E3A8A]/15">
            <Building2 size={24} className="text-[#1E3A8A]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-police-muted">Nambari ya Kituo (Auto)</p>
            <p className={`text-[18px] font-black tracking-widest ${code ? "text-[#1E3A8A]" : "text-police-faint"}`}>
              {code || "NAME-REG"}
            </p>
          </div>
        </div>

        {/* ── SECTION 1: Basic Info ── */}
        <div className="rounded-2xl bg-police-card p-5 shadow-sm space-y-4">
          <h2 className="flex items-center gap-2 text-[14px] font-bold text-police">
            <Building2 size={16} className="text-[#1E3A8A]" /> Taarifa za Msingi
          </h2>

          <Field label="Jina la Kituo *" required>
            <Input icon={<Building2 size={14} />}
              value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kituo cha Polisi Kinondoni" />
            {errors.name && <p className="mt-0.5 text-[10px] text-[#EF4444]">{errors.name}</p>}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Aina ya Kituo *" required>
              <Select icon={<Shield size={14} />} value={stationType} onChange={(e) => setStationType(e.target.value)}>
                {STATION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
              {errors.stationType && <p className="mt-0.5 text-[10px] text-[#EF4444]">{errors.stationType}</p>}
            </Field>

            <Field label="Hali / Status *" required>
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATION_STATUS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
              {errors.status && <p className="mt-0.5 text-[10px] text-[#EF4444]">{errors.status}</p>}
            </Field>
          </div>

          <Field label="Maelezo / Description" hint="Maelezo ya ziada kuhusu kituo">
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Kituo kikubwa kinachohudumia eneo la Kinondoni..."
              rows={3}
              className="w-full rounded-xl border border-police-soft bg-police px-3 py-2.5 text-[13px] text-police placeholder-police-faint focus:border-[#2196F3] focus:outline-none resize-none"
            />
          </Field>
        </div>

        {/* ── SECTION 2: Location ── */}
        <div className="rounded-2xl bg-police-card p-5 shadow-sm space-y-4">
          <h2 className="flex items-center gap-2 text-[14px] font-bold text-police">
            <MapPin size={16} className="text-[#2196F3]" /> Eneo na Mahali
          </h2>

          <Field label="Mkoa / Region *" required>
            <Select icon={<MapPin size={14} />} value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="">Chagua mkoa...</option>
              {TZ_REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Select>
            {errors.region && <p className="mt-0.5 text-[10px] text-[#EF4444]">{errors.region}</p>}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Wilaya / District">
              <Input icon={<MapPin size={14} />}
                value={district} onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Kinondoni" />
            </Field>
            <Field label="Kata / Ward">
              <Input icon={<MapPin size={14} />}
                value={ward} onChange={(e) => setWard(e.target.value)}
                placeholder="e.g. Mwenge" />
            </Field>
          </div>

          <Field label="Anwani Kamili / Full Address">
            <Input icon={<MapPin size={14} />}
              value={address} onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Barabara ya Kawawa, Upanga" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude (GPS)" hint="-6.7924">
              <Input icon={<MapPin size={14} />}
                value={latitude} onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g. -6.7924" type="text" />
              {errors.latitude && <p className="mt-0.5 text-[10px] text-[#EF4444]">{errors.latitude}</p>}
            </Field>
            <Field label="Longitute (GPS)" hint="39.2083">
              <Input icon={<MapPin size={14} />}
                value={longitude} onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g. 39.2083" type="text" />
              {errors.longitude && <p className="mt-0.5 text-[10px] text-[#EF4444]">{errors.longitude}</p>}
            </Field>
          </div>

          <Field label="Eneo la Utawala / Jurisdiction" hint="Maeneo ambayo kituo kinahudumu">
            <input
              value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)}
              placeholder="e.g. Wilaya yote ya Kinondoni..."
              className="w-full rounded-xl border border-police-soft bg-police px-3 py-2.5 text-[13px] text-police placeholder-police-faint focus:border-[#2196F3] focus:outline-none"
            />
          </Field>
        </div>

        {/* ── SECTION 3: Contact Info ── */}
        <div className="rounded-2xl bg-police-card p-5 shadow-sm space-y-4">
          <h2 className="flex items-center gap-2 text-[14px] font-bold text-police">
            <Phone size={16} className="text-[#10B981]" /> Maelezo ya Wasiliana
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Simu / Phone" hint="Namba ya simu ya kituo">
              <Input icon={<Phone size={14} />}
                value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="0712345678" type="tel" />
              {errors.phone && <p className="mt-0.5 text-[10px] text-[#EF4444]">{errors.phone}</p>}
            </Field>
            <Field label="Barua Pepe / Email">
              <Input icon={<Mail size={14} />}
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="kinondoni@polisi.go.tz" type="email" />
              {errors.email && <p className="mt-0.5 text-[10px] text-[#EF4444]">{errors.email}</p>}
            </Field>
          </div>

          <Field label="Simu ya Dharura / Emergency Contact" hint="Namba ya simu ya dharura (24/7)">
            <Input icon={<Phone size={14} />}
              value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="e.g. +255 22 276 0000" type="tel" />
          </Field>
        </div>

        {/* ── SECTION 4: Operational Details ── */}
        <div className="rounded-2xl bg-police-card p-5 shadow-sm space-y-4">
          <h2 className="flex items-center gap-2 text-[14px] font-bold text-police">
            <Calendar size={16} className="text-[#FF9800]" /> Maelezo ya Uendeshaji
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tarehe ya Uanzishaji" hint="Lipo lini kituo kilianza?">
              <Input icon={<Calendar size={14} />}
                value={establishedDate} onChange={(e) => setEstablishedDate(e.target.value)}
                placeholder="e.g. 1961-01-01" type="date" />
            </Field>
            <Field label="Uwezo wa Maofisa" hint="Idadi ya maofisa uwezo wa kituo">
              <Input icon={<Hash size={14} />}
                value={officerCapacity} onChange={(e) => setOfficerCapacity(e.target.value)}
                placeholder="e.g. 50" type="number" min="1" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Idadi ya Posti" hint="Posti zilizo chini ya kituo hili">
              <Input icon={<Hash size={14} />}
                value={postCount} onChange={(e) => setPostCount(e.target.value)}
                placeholder="0" type="number" min="0" />
            </Field>
            <Field label="Nambari ya Kituo (Manual)" hint="Acha tupu kwa auto-generate">
              <Input icon={<Hash size={14} />}
                value={code} onChange={(e) => setCode(e.target.value)}
                placeholder="Auto-generated" />
            </Field>
          </div>
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
          style={{ background: "linear-gradient(135deg,#1E3A8A,#2563EB)" }}
        >
          {saving ? (
            <><span className="animate-spin">⏳</span> Inahifadhi...</>
          ) : (
            <><Save size={20} /> Unda Kituo — {code || "Auto-Generate"}</>
          )}
        </button>

        <p className="pb-4 text-center text-[11px] text-police-faint">
          Nambari ya kituo inaundwa kiotomatiki kutoka jina na mkoa. Taarifa zote zinahifadhiwa kwenye database.
        </p>
      </div>
    </div>
  );
}
