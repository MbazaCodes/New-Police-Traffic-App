// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, User, CheckCircle, AlertCircle, Loader2,
  WifiOff, CloudUpload, RefreshCw, Camera, X, FileText,
  Upload, Trash2, Eye,
} from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { useOfficer } from "@/hooks/use-officer";
import { validateName, validateMobile, newCitizenRecords } from "@/lib/police-helpers";
import { toast } from "@/hooks/use-toast";
import { TZ_ALL_REGIONS, districtsForRegion } from "@/lib/tz-locations";
import { DatePicker } from "@/components/police/ui/date-picker";
import {
  saveWithOfflineSupport, initAutoSync,
  subscribeToSyncStatus, type SyncStatus, processSyncQueue,
} from "@/lib/offline-sync";

// ── Tanzanian tribes ──────────────────────────────────────────────────
const TZ_TRIBES = [
  "Chagga","Hehe","Sukuma","Nyamwezi","Makonde","Yao","Zaramo","Luguru",
  "Gogo","Haya","Bena","Fipa","Sangu","Meru","Arusha","Maasai","Nyakyusa",
  "Safwa","Kinga","Bonde","Iramba","Rangi","Isanzu","Nguu","Bondei","Sambaa",
  "Digo","Segeju","Giriama","Swahili","Makua","Mwera","Matumbi","Mbunga",
  "Pogoro","Kaguru","Zigua","Ngindo","Ndengereko","Ndamba","Pangwa",
  "Kisi","Nyiha","Malila","Wanda","Lambya","Ndali","Nyasa","Manda",
  "Rungwa","Pimbwe","Bende","Ha","Jiji","Holoholo","Vinza","Tongwe",
  "Rundi","Zinza","Kerewe","Kwaya","Jita","Zanaki","Ikoma","Ikizu",
  "Nguruimi","Ngoreme","Kurya","Shashi","Suba","Kuria","Nyaturu","Iambi",
  "Iraqw","Barabaig","Datoga","Gorowa","Alagwa","Burunge","Sandawe",
  "Hadza","Nyiramba","Kimbu","Bungu","Mbugwe","Langi",
  "Nyingine",
].sort();

const OCCUPATIONS = [
  "Mfanyabiashara","Mwalimu","Dereva","Mhudumu wa Afya","Mwanafunzi",
  "Fundi","Mkulima","Mfanyakazi wa Serikali","Daktari","Mkandarasi",
  "Mwandishi","Polisi","Jeshi","Mstaafu","Asiyefanya Kazi","Nyingine",
];

const RELIGIONS = ["Kiislamu","Kikristo","Kihindu","Kitamaduni","Nyingine","Sipendelei Kusema"];
const MARITAL   = ["Mseja","Mwenzi (Ndoa)","Talaka","Mjane/Mgane","Nyingine"];
const BLOOD_GRP = ["A+","A-","B+","B-","AB+","AB-","O+","O-","Sijui"];

// ── Document types ────────────────────────────────────────────────────
const DOC_TYPES = [
  { value: "national_id",    label: "Kitambulisho cha Taifa (NIDA)" },
  { value: "passport",       label: "Pasi ya Kusafiria (Passport)" },
  { value: "voters_card",    label: "Kadi ya Kupiga Kura" },
  { value: "driving_license",label: "Leseni ya Udereva" },
  { value: "birth_cert",     label: "Cheti cha Kuzaliwa" },
  { value: "marriage_cert",  label: "Cheti cha Ndoa" },
  { value: "academic",       label: "Vyeti vya Elimu" },
  { value: "court_order",    label: "Amri ya Mahakama" },
  { value: "other",          label: "Hati Nyingine" },
];

type DocEntry = { type: string; label: string; dataUrl: string; name: string };

export function AddCitizenScreen() {
  const OFFICER = useOfficer();
  const { goBack, searchQuery, citizenSearchType } = usePoliceStore();
  const [saved, setSaved]       = useState(false);
  const [savedRecord, setSavedRecord] = useState<any>(null);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("personal");

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    pending: 0, lastSynced: null, isOnline: true, isSyncing: false,
  });
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    initAutoSync();
    const unsub = subscribeToSyncStatus((s) => {
      setSyncStatus(s); setIsOfflineMode(!s.isOnline || s.pending > 0);
    });
    return unsub;
  }, []);

  // Pre-fill from search
  const prefillName   = citizenSearchType === "name"   ? (searchQuery ?? "") : "";
  const prefillNida   = citizenSearchType === "nida"   ? (searchQuery ?? "") : "";
  const prefillMobile = citizenSearchType === "mobile" ? (searchQuery ?? "") : "";

  const fmtNida = (n: string) => {
    const d = n.replace(/\D/g, "").slice(0, 20);
    return [d.slice(0,4),d.slice(4,8),d.slice(8,12),d.slice(12,16),d.slice(16,20)].filter(Boolean).join("-");
  };

  const [form, setForm] = useState({
    name: prefillName, nida: fmtNida(prefillNida), mobile: prefillMobile,
    gender: "Mme", dob: "", nationality: "Mtanzania",
    tribe: "", religion: "", maritalStatus: "", bloodGroup: "",
    region: "", district: "", ward: "", address: "", occupation: "Mfanyabiashara",
    notes: "",
  });

  // Photo
  const photoRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string>("");

  // Documents
  const docRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<DocEntry[]>([]);
  const [pendingDocType, setPendingDocType] = useState("national_id");
  const [previewDoc, setPreviewDoc] = useState<DocEntry | null>(null);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    const nameR = validateName(form.name);
    if (!nameR.valid) e.name = nameR.error;
    if (form.nida) {
      const digits = form.nida.replace(/\D/g, "");
      if (digits.length > 0 && digits.length !== 20) e.nida = `NIDA inahitaji tarakimu 20 (${digits.length}/20)`;
    }
    if (form.mobile) { const r = validateMobile(form.mobile); if (!r.valid) e.mobile = r.error; }
    if (!form.region) e.region = "Chagua mkoa wa makazi";
    if (!form.ward.trim() && !form.address.trim()) e.address = "Jaza kata/mtaa au anwani";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => setPhotoUrl(ev.target?.result as string ?? "");
    r.readAsDataURL(file);
  };

  const handleDocPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const r = new FileReader();
      r.onload = (ev) => {
        const dataUrl = ev.target?.result as string ?? "";
        const docType = DOC_TYPES.find((d) => d.value === pendingDocType);
        setDocs((prev) => [...prev, {
          type: pendingDocType,
          label: docType?.label ?? pendingDocType,
          dataUrl,
          name: file.name,
        }]);
      };
      r.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!validate()) {
      toast({ title: "Rekebisha makosa", description: "Jaza sehemu zote sahihi.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        name:          form.name.trim(),
        nida:          form.nida.replace(/\D/g, "") || null,
        mobile:        form.mobile.trim() || null,
        gender:        form.gender,
        dob:           form.dob || null,
        nationality:   form.nationality,
        tribe:         form.tribe || null,
        religion:      form.religion || null,
        maritalStatus: form.maritalStatus || null,
        bloodGroup:    form.bloodGroup || null,
        region:        form.region,
        district:      form.district || null,
        ward:          form.ward.trim() || null,
        address:       [form.address.trim(), form.ward.trim() && `Kata ${form.ward.trim()}`, form.district, form.region]
                         .filter(Boolean).join(", "),
        occupation:    form.occupation,
        notes:         form.notes.trim() || null,
        photoUrl:      photoUrl || null,
        documents:     docs.length > 0 ? docs.map((d) => ({ type: d.type, label: d.label, name: d.name, dataUrl: d.dataUrl })) : null,
        officerId:     OFFICER.id,
        station:       OFFICER.station,
      };

      const result = await saveWithOfflineSupport("/api/citizens", payload, "POST");
      const rec = {
        id:      result.data?.id || `CIT-${Date.now()}`,
        name:    form.name,
        nida:    form.nida,
        mobile:  form.mobile,
        address: [form.address, form.ward, form.district, form.region].filter(Boolean).join(", "),
        tribe:   form.tribe,
        addedBy: OFFICER.shortName,
        cached:  result.fromCache,
        hasPhoto: !!photoUrl,
        docCount: docs.length,
      };

      newCitizenRecords.unshift({ id: rec.id, name: rec.name });
      setSavedRecord(rec);
      setSaved(true);

      toast({
        title: result.fromCache ? "Raia Amesajiliwa (Offline) 💾" : "Raia Amesajiliwa ✓",
        description: result.fromCache
          ? "Itasasishwa mara tu utakapoweka mtandao."
          : `${rec.name} amehifadhiwa. ID: ${rec.id}`,
      });
    } catch (err: any) {
      toast({ title: "Hitilafu ❌", description: err.message || "Imeshindikana kuhifadhi.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────
  if (saved && savedRecord) {
    return (
      <div className="min-h-full bg-police p-4">
        <div className="flex flex-col items-center py-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#10B981]/15">
            <CheckCircle size={44} className="text-[#10B981]" />
          </div>
          <h2 className="mt-4 text-[20px] font-bold text-police">Raia Amesajiliwa</h2>
          <p className="mt-1 text-center text-[13px] text-police-muted">Taarifa zimehifadhiwa kwenye mfumo.</p>

          {savedRecord.hasPhoto && (
            <div className="mt-3 h-24 w-24 overflow-hidden rounded-full ring-4 ring-[#10B981]/30">
              <img src={photoUrl} alt={savedRecord.name} className="h-full w-full object-cover" />
            </div>
          )}

          <div className="mt-4 w-full rounded-2xl bg-police-card p-4 shadow-sm space-y-2">
            <Row label="ID" value={savedRecord.id} bold />
            <Row label="Jina" value={savedRecord.name} />
            {savedRecord.tribe && <Row label="Kabila" value={savedRecord.tribe} />}
            <Row label="NIDA" value={savedRecord.nida || "—"} />
            <Row label="Simu" value={savedRecord.mobile || "—"} />
            <Row label="Makazi" value={savedRecord.address} />
            {savedRecord.docCount > 0 && <Row label="Nyaraka" value={`Hati ${savedRecord.docCount} zimehifadhiwa`} />}
            <Row label="Imehifadhiwa na" value={savedRecord.addedBy} />
            {savedRecord.cached && <Row label="Hali" value="⏳ Inasubiri usasishaji" bold />}
          </div>

          <div className="mt-4 w-full space-y-2">
            <button onClick={() => {
              setSaved(false);
              setForm({ name:"",nida:"",mobile:"",gender:"Mme",dob:"",nationality:"Mtanzania",
                tribe:"",religion:"",maritalStatus:"",bloodGroup:"",
                region:"",district:"",ward:"",address:"",occupation:"Mfanyabiashara",notes:"" });
              setPhotoUrl(""); setDocs([]); setErrors({});
            }} className="w-full rounded-xl border border-police py-3 text-[14px] font-semibold text-police">
              Sajili Raia Mwingine
            </button>
            <button onClick={() => goBack()} className="w-full rounded-xl bg-[#1E3A8A] py-3 text-[14px] font-bold text-white">
              Rudi Nyuma
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────
  const SECTIONS = [
    { id: "personal",  label: "Taarifa Binafsi" },
    { id: "location",  label: "Makazi" },
    { id: "docs",      label: "Nyaraka & Picha" },
    { id: "extra",     label: "Taarifa Zaidi" },
  ];

  const selectCls = "w-full rounded-xl border border-police bg-police-input px-3 h-10 text-[13px] text-police focus:outline-none focus:border-[#1E3A8A]";

  return (
    <div className="min-h-full bg-police">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2196F3] px-4 py-4">
        <button onClick={() => goBack()} className="mb-3 flex items-center gap-2 text-white/80">
          <ArrowLeft size={18} /><span className="text-[13px]">Rudi</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
            <User size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-white">Sajili Raia Mpya</h1>
            <p className="text-[11px] text-white/70">Jaza taarifa zote za raia</p>
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-police-soft bg-police-card px-4 py-2">
        {SECTIONS.map((s) => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${
              activeSection === s.id ? "bg-[#1E3A8A] text-white" : "text-police-muted hover:bg-police-soft"
            }`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 p-4 pb-8">

        {/* ── SECTION 1: Personal ─────────────────────────────── */}
        {activeSection === "personal" && (
          <div className="rounded-2xl bg-police-card p-4 shadow-sm space-y-3">
            <SectionTitle>Taarifa Binafsi</SectionTitle>

            <FI label="Jina Kamili" required value={form.name} onChange={set("name")}
              placeholder="Jina la kwanza na la ukoo" error={errors.name} />

            <NidaField value={form.nida}
              onChange={(v) => setForm((f) => ({ ...f, nida: v }))}
              error={errors.nida} />

            <FI label="Namba ya Simu" value={form.mobile} onChange={set("mobile")}
              placeholder="0712 345 678" error={errors.mobile} inputMode="tel" />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[12px] font-medium text-police-muted">Jinsia</label>
                <select value={form.gender} onChange={set("gender")} className={selectCls}>
                  <option value="Mme">Mme (Male)</option>
                  <option value="Mke">Mke (Female)</option>
                </select>
              </div>
              <DatePicker label="Tarehe ya Kuzaliwa" value={form.dob}
                onChange={(v) => setForm((f) => ({ ...f, dob: v }))}
                maxDate={new Date().toISOString().split("T")[0]} />
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-medium text-police-muted">Uraia / Nationality</label>
              <select value={form.nationality} onChange={set("nationality")} className={selectCls}>
                <option value="Mtanzania">Mtanzania</option>
                <option value="Mgeni">Mgeni (Foreign National)</option>
                <option value="Mkimbizi">Mkimbizi (Refugee)</option>
              </select>
            </div>

            {/* TRIBE */}
            <div>
              <label className="mb-1 block text-[12px] font-medium text-police-muted">Kabila / Tribe</label>
              <select value={form.tribe} onChange={set("tribe")} className={selectCls}>
                <option value="">— Chagua Kabila —</option>
                {TZ_TRIBES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[12px] font-medium text-police-muted">Dini / Religion</label>
                <select value={form.religion} onChange={set("religion")} className={selectCls}>
                  <option value="">— Chagua —</option>
                  {RELIGIONS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-police-muted">Hali ya Ndoa</label>
                <select value={form.maritalStatus} onChange={set("maritalStatus")} className={selectCls}>
                  <option value="">— Chagua —</option>
                  {MARITAL.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[12px] font-medium text-police-muted">Kundi la Damu</label>
                <select value={form.bloodGroup} onChange={set("bloodGroup")} className={selectCls}>
                  <option value="">— Chagua —</option>
                  {BLOOD_GRP.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-police-muted">Kazi / Shughuli</label>
                <select value={form.occupation} onChange={set("occupation")} className={selectCls}>
                  {OCCUPATIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setActiveSection("location")}
                className="rounded-xl bg-[#1E3A8A] px-5 py-2 text-[13px] font-bold text-white">
                Endelea →
              </button>
            </div>
          </div>
        )}

        {/* ── SECTION 2: Location ─────────────────────────────── */}
        {activeSection === "location" && (
          <div className="rounded-2xl bg-police-card p-4 shadow-sm space-y-3">
            <SectionTitle>Makazi / Address</SectionTitle>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[12px] font-medium text-police-muted">
                  Mkoa / Region <span className="text-[#EF4444]">*</span>
                </label>
                <select value={form.region}
                  onChange={(e) => setForm((f) => ({ ...f, region: e.target.value, district: "" }))}
                  className={selectCls + (errors.region ? " border-[#EF4444]" : "")}>
                  <option value="">— Chagua —</option>
                  {TZ_ALL_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                {errors.region && <Err>{errors.region}</Err>}
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-police-muted">Wilaya / District</label>
                <select value={form.district} onChange={set("district")} disabled={!form.region} className={selectCls + " disabled:opacity-50"}>
                  <option value="">{form.region ? "— Chagua —" : "Mkoa kwanza"}</option>
                  {districtsForRegion(form.region).map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <FI label="Kata / Mtaa" value={form.ward} onChange={set("ward")}
              placeholder="e.g. Mwenge, Kariakoo" error={errors.address} />
            <FI label="Anwani ya Ziada" value={form.address} onChange={set("address")}
              placeholder="Nyumba na., mtaa, maelezo zaidi" />

            <div className="flex justify-between">
              <button onClick={() => setActiveSection("personal")}
                className="rounded-xl border border-police px-5 py-2 text-[13px] font-semibold text-police">
                ← Nyuma
              </button>
              <button onClick={() => setActiveSection("docs")}
                className="rounded-xl bg-[#1E3A8A] px-5 py-2 text-[13px] font-bold text-white">
                Endelea →
              </button>
            </div>
          </div>
        )}

        {/* ── SECTION 3: Photo & Documents ───────────────────── */}
        {activeSection === "docs" && (
          <div className="space-y-3">
            {/* Photo */}
            <div className="rounded-2xl bg-police-card p-4 shadow-sm space-y-3">
              <SectionTitle>Picha ya Raia</SectionTitle>
              <div className="flex items-center gap-4">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-dashed border-police bg-police-input">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Picha" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center">
                      <User size={28} className="text-police-faint" />
                      <span className="mt-1 text-[9px] text-police-faint">Bonyeza kuongeza</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <button onClick={() => photoRef.current?.click()}
                    className="flex items-center gap-2 rounded-xl bg-[#2196F3]/10 px-4 py-2 text-[12px] font-semibold text-[#2196F3]">
                    <Camera size={14} /> {photoUrl ? "Badilisha Picha" : "Ongeza Picha"}
                  </button>
                  {photoUrl && (
                    <button onClick={() => setPhotoUrl("")}
                      className="flex items-center gap-2 rounded-xl bg-[#EF4444]/10 px-4 py-2 text-[12px] font-semibold text-[#EF4444]">
                      <Trash2 size={14} /> Futa Picha
                    </button>
                  )}
                  <p className="text-[10px] text-police-faint">JPG/PNG. Picha ya uso wazi.</p>
                </div>
              </div>
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </div>

            {/* Documents */}
            <div className="rounded-2xl bg-police-card p-4 shadow-sm space-y-3">
              <SectionTitle>Nyaraka / Documents</SectionTitle>

              <div className="flex gap-2">
                <select value={pendingDocType} onChange={(e) => setPendingDocType(e.target.value)}
                  className="flex-1 rounded-xl border border-police bg-police-input px-3 h-9 text-[12px] text-police focus:outline-none">
                  {DOC_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
                <button onClick={() => docRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-xl bg-[#1E3A8A] px-3 py-1.5 text-[12px] font-bold text-white">
                  <Upload size={13} /> Pakia
                </button>
              </div>
              <input ref={docRef} type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={handleDocPick} />

              {docs.length === 0 ? (
                <p className="text-center text-[12px] text-police-faint py-4">
                  Hakuna nyaraka bado. Chagua aina ya hati halafu bonyeza "Pakia".
                </p>
              ) : (
                <div className="space-y-2">
                  {docs.map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-police-soft p-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1E3A8A]/10">
                        <FileText size={16} className="text-[#1E3A8A]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-semibold text-police">{doc.label}</p>
                        <p className="truncate text-[10px] text-police-faint">{doc.name}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {doc.dataUrl.startsWith("data:image") && (
                          <button onClick={() => setPreviewDoc(doc)}
                            className="rounded-lg bg-[#2196F3]/10 p-1.5 text-[#2196F3]">
                            <Eye size={13} />
                          </button>
                        )}
                        <button onClick={() => setDocs((d) => d.filter((_, j) => j !== i))}
                          className="rounded-lg bg-[#EF4444]/10 p-1.5 text-[#EF4444]">
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button onClick={() => setActiveSection("location")}
                className="rounded-xl border border-police px-5 py-2 text-[13px] font-semibold text-police">
                ← Nyuma
              </button>
              <button onClick={() => setActiveSection("extra")}
                className="rounded-xl bg-[#1E3A8A] px-5 py-2 text-[13px] font-bold text-white">
                Endelea →
              </button>
            </div>
          </div>
        )}

        {/* ── SECTION 4: Extra / Submit ────────────────────── */}
        {activeSection === "extra" && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-police-card p-4 shadow-sm space-y-3">
              <SectionTitle>Maelezo ya Ziada</SectionTitle>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-police-muted">Maelezo / Madokezo</label>
                <textarea rows={4} value={form.notes} onChange={set("notes")}
                  placeholder="Maelezo ya ziada kuhusu raia huyu..."
                  className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police placeholder:text-police-faint focus:outline-none focus:border-[#1E3A8A]" />
              </div>
            </div>

            {/* Summary before submit */}
            <div className="rounded-2xl border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 p-4 space-y-1.5">
              <p className="text-[12px] font-bold text-[#1E3A8A]">Muhtasari wa Usajili</p>
              <Row label="Jina" value={form.name || "—"} />
              <Row label="Kabila" value={form.tribe || "—"} />
              <Row label="NIDA" value={form.nida || "—"} />
              <Row label="Mkoa" value={form.region || "—"} />
              <Row label="Picha" value={photoUrl ? "✓ Imeongezwa" : "Haijaongezwa"} />
              <Row label="Nyaraka" value={docs.length > 0 ? `Hati ${docs.length}` : "Hazipo"} />
              <Row label="Afisa" value={OFFICER.shortName} />
            </div>

            {/* Sync status */}
            {(isOfflineMode || syncStatus.pending > 0) && (
              <div className={`rounded-2xl border p-3 flex items-center gap-3 ${
                syncStatus.isSyncing ? "border-[#2196F3]/30 bg-[#2196F3]/5"
                : syncStatus.isOnline ? "border-[#FF9800]/30 bg-[#FF9800]/5"
                : "border-[#EF4444]/30 bg-[#EF4444]/5"}`}>
                {syncStatus.isSyncing ? <RefreshCw size={16} className="text-[#2196F3] animate-spin shrink-0" />
                  : syncStatus.isOnline ? <CloudUpload size={16} className="text-[#FF9800] shrink-0" />
                  : <WifiOff size={16} className="text-[#EF4444] shrink-0" />}
                <p className="flex-1 text-[12px] text-police-muted">
                  {syncStatus.isSyncing ? "Inasasisha..."
                    : syncStatus.isOnline ? `Rekodi ${syncStatus.pending} zinasubiri`
                    : "Huna mtandao — itahifadhiwa kawaida"}
                </p>
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={() => setActiveSection("docs")}
                className="rounded-xl border border-police px-5 py-2 text-[13px] font-semibold text-police">
                ← Nyuma
              </button>
              <button onClick={handleSave} disabled={isSaving}
                className="flex items-center gap-2 rounded-xl bg-[#1E3A8A] px-6 py-2.5 text-[14px] font-bold text-white disabled:opacity-50">
                {isSaving ? <><Loader2 size={15} className="animate-spin" /> Inahifadhi...</> : <><User size={15} /> Hifadhi</>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Document image preview modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewDoc(null)}>
          <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-police-card"
            onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewDoc(null)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white">
              <X size={16} />
            </button>
            <p className="px-4 pt-4 pb-2 text-[13px] font-bold text-police">{previewDoc.label}</p>
            <img src={previewDoc.dataUrl} alt={previewDoc.label} className="max-h-[75vh] w-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[14px] font-bold text-police" style={{ borderLeft: "3px solid #1E3A8A", paddingLeft: "8px" }}>{children}</h3>;
}
function Err({ children }: { children: React.ReactNode }) {
  return <p className="mt-0.5 text-[10px] text-[#EF4444]">{children}</p>;
}
function FI({ label, required, value, onChange, placeholder, error, inputMode }: {
  label: string; required?: boolean; value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string; error?: string; inputMode?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-medium text-police-muted">
        {label}{required && <span className="ml-0.5 text-[#EF4444]">*</span>}
      </label>
      <input value={value} onChange={onChange} placeholder={placeholder}
        inputMode={inputMode as any}
        className={`w-full rounded-xl border bg-police-input px-3 h-10 text-[13px] text-police placeholder:text-police-faint focus:outline-none ${
          error ? "border-[#EF4444]" : "border-police focus:border-[#1E3A8A]"}`} />
      {error && <div className="mt-1 flex items-center gap-1"><AlertCircle size={11} className="text-[#EF4444]" /><p className="text-[10px] text-[#EF4444]">{error}</p></div>}
    </div>
  );
}
function NidaField({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const [focused, setFocused] = useState(false);
  const fmt = (s: string) => {
    const d = s.replace(/\D/g, "").slice(0, 20);
    return [d.slice(0,4),d.slice(4,8),d.slice(8,12),d.slice(12,16),d.slice(16,20)].filter(Boolean).join("-");
  };
  const digits = value.replace(/\D/g, "");
  const valid = digits.length === 20;
  return (
    <div>
      <label className="mb-1 block text-[12px] font-medium text-police-muted">Namba ya NIDA</label>
      <div className="relative">
        <input type="text" inputMode="numeric" value={value}
          onChange={(e) => onChange(fmt(e.target.value))}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder="0000-0000-0000-0000-00"
          className={`w-full rounded-xl border bg-police-input px-3 h-10 text-[13px] font-mono tracking-wider text-police placeholder:text-police-faint focus:outline-none ${
            error ? "border-[#EF4444]" : valid ? "border-[#10B981]" : "border-police focus:border-[#1E3A8A]"}`} />
        {valid && !focused && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#10B981]">✓</span>}
      </div>
      {error && <Err>{error}</Err>}
      {!error && digits.length > 0 && !valid && (
        <p className="mt-0.5 text-[9px] text-[#FF9800]">Nambari {digits.length}/20 — inahitaji 20 tarakimu</p>
      )}
    </div>
  );
}
function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between border-b border-police-soft py-1 last:border-0">
      <span className="text-[12px] text-police-muted">{label}</span>
      <span className={`text-[12px] ${bold ? "font-bold text-[#10B981]" : "font-medium text-police"}`}>{value}</span>
    </div>
  );
}
