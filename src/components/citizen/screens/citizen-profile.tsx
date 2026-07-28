// @ts-nocheck
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  User, Car, Home, Smartphone, Edit3, Save, X, CheckCircle2,
  Shield, Phone, Mail, MapPin, Calendar, Briefcase, Heart,
  Droplets, Globe, RefreshCw, AlertCircle, Plus, Loader2,
  Building2, IdCard, BadgeCheck, BookOpen, Camera, Clock,
  AlertTriangle, TrendingDown, Stethoscope, Key, Package,
  Users, ChevronRight, ChevronDown, Star, Ban, Activity,
} from "lucide-react";

function H() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("citizen-token") || "" : ""}`,
  };
}

const TZ_TRIBES = ["Sukuma","Chagga","Haya","Nyamwezi","Makonde","Yao","Zaramo","Luguru","Bena","Meru","Hehe","Gogo","Fipa","Pare","Mwera","Ngoni","Ha","Nyakyusa","Iraqw","Sandawe","Hadza","Nyaturu","Rangi","Ndamba","Sagara","Zigua","Bondei","Digo","Shambaa","Asu"];
const BLOOD_GROUPS = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const MARITAL = ["Mke/Mume","Mseja","Mjane","Aliyeachika"];
const TZ_REGIONS = ["Dar es Salaam","Dodoma","Mwanza","Arusha","Mbeya","Morogoro","Tanga","Kilimanjaro","Mara","Tabora","Kigoma","Ruvuma","Iringa","Kagera","Geita","Njombe","Katavi","Rukwa","Simiyu","Songwe","Lindi","Mtwara","Pwani","Manyara","Singida","Shinyanga"];

// Days remaining helper
function daysRemaining(dateStr: string): number {
  if (!dateStr) return 0;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000*60*60*24));
}

function ExpiryBadge({ date, label }: { date: string; label: string }) {
  const days = daysRemaining(date);
  const color = days < 0 ? "bg-red-100 text-red-700" : days < 30 ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700";
  const text  = days < 0 ? "Imeisha" : days < 30 ? `Siku ${days} zimebaki` : `Siku ${days} zimebaki`;
  return (
    <div className="flex items-center justify-between text-[12px] border-b border-police-soft pb-2 last:border-0">
      <span className="text-police-muted">{label}</span>
      <div className="text-right">
        <p className="font-mono text-police text-[11px]">{date ? new Date(date).toLocaleDateString("sw-TZ") : "—"}</p>
        {date && <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${color}`}>{text}</span>}
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, color, children, defaultOpen = true }: any) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl bg-police-card border border-police-soft overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-police-muted/10 transition">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{background: color+"18"}}>
            <Icon size={16} style={{color}} />
          </div>
          <span className="text-[14px] font-black text-police">{title}</span>
        </div>
        <ChevronDown size={16} className={`text-police-muted transition-transform ${open?"rotate-180":""}`} />
      </button>
      {open && <div className="px-4 pb-4 space-y-2">{children}</div>}
    </div>
  );
}

function Row({ label, value, mono = false }: any) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-police-soft pb-2 last:border-0">
      <span className="text-[11px] text-police-muted shrink-0">{label}</span>
      <span className={`text-[12px] font-semibold text-police text-right ${mono?"font-mono":""}`}>{value || "—"}</span>
    </div>
  );
}


// ── Profile completion calculator ─────────────────────────────
function calcCompletion(d: any): { pct: number; missing: string[]; filled: number; total: number } {
  const fields = [
    { key: "nida",           label: "NIDA" },
    { key: "dob",            label: "Tarehe ya Kuzaliwa" },
    { key: "gender",         label: "Jinsia" },
    { key: "tribe",          label: "Kabila" },
    { key: "blood_group",    label: "Kundi la Damu" },
    { key: "occupation",     label: "Kazi" },
    { key: "address",        label: "Anwani" },
    { key: "region",         label: "Mkoa" },
    { key: "district",       label: "Wilaya" },
    { key: "mobile",         label: "Simu" },
    { key: "kin_name",       label: "Mtu wa Karibu" },
    { key: "kin_phone",      label: "Simu ya Mtu wa Karibu" },
    { key: "photo_url",      label: "Picha ya Profaili" },
    { key: "religion",       label: "Dini" },
    { key: "marital_status", label: "Hali ya Ndoa" },
  ];
  const filled  = fields.filter(f => d?.[f.key]);
  const missing = fields.filter(f => !d?.[f.key]).map(f => f.label);
  const pct = Math.round((filled.length / fields.length) * 100);
  return { pct, missing: missing.slice(0, 5), filled: filled.length, total: fields.length };
}

function ProfileCompletion({ d, onEdit }: { d: any; onEdit?: () => void }) {
  const { pct, missing, filled, total } = calcCompletion(d);
  const color = pct >= 80 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444";
  const bg    = pct >= 80 ? "bg-green-50 border-green-100" : pct >= 50 ? "bg-amber-50 border-amber-100" : "bg-red-50 border-red-100";
  return (
    <div className={`rounded-2xl border p-4 ${bg}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[13px] font-black" style={{color:"var(--tpf-text,#0f2347)"}}>Ukamilishaji wa Profaili</p>
          <p className="text-[11px]" style={{color:"var(--tpf-text-3,#64748b)"}}>{filled}/{total} taarifa zimejazwa</p>
        </div>
        <span className="text-[28px] font-black" style={{color}}>{pct}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-black/10 mb-2">
        <div className="h-full rounded-full transition-all duration-700"
          style={{width:`${pct}%`, background:color}} />
      </div>
      {missing.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          <span className="text-[10px]" style={{color:"var(--tpf-text-3,#64748b)"}}>Imebaki: </span>
          {missing.map(m => (
            <span key={m} className="rounded-lg bg-white border border-black/10 px-2 py-0.5 text-[10px]"
              style={{color:"var(--tpf-text-3,#64748b)"}}>+ {m}</span>
          ))}
        </div>
      )}
      {onEdit && pct < 100 && (
        <button onClick={onEdit}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-bold text-white"
          style={{background:color}}>
          Kamilisha Profaili →
        </button>
      )}
      {pct === 100 && (
        <p className="mt-2 text-center text-[11px] font-bold" style={{color:"#10B981"}}>✅ Profaili imekamilika!</p>
      )}
    </div>
  );
}

export function CitizenProfile({ citizen }: any) {
  const [tab, setTab]       = useState<"profile"|"vehicles"|"devices"|"properties"|"medical"|"kin">("profile");
  const [data, setData]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm]       = useState<any>({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  // Vehicle add form
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({ plate:"", make:"", model:"", color:"", year:"", chassis_no:"", insurance_company:"", insurance_expires:"" });
  const [addingVehicle, setAddingVehicle] = useState(false);

  // Device add form
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [deviceForm, setDeviceForm] = useState({ deviceType:"simu", brand:"", model:"", serialNo:"", imei:"", color:"", purchaseDate:"" });
  const [addingDevice, setAddingDevice] = useState(false);

  // Property add form
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [propertyForm, setPropertyForm] = useState({ property_type:"nyumba", address:"", region:"", district:"", ward:"", value:"", title_deed_no:"" });
  const [addingProperty, setAddingProperty] = useState(false);

  const load = useCallback(async () => {
    if (!citizen?.id) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/citizen-portal/${citizen.id}`, { headers: H() });
      const json = await res.json();
      if (json.ok) {
        setData(json.data);
        const d = json.data;
        setForm({
          // Core DB columns (verified)
          name: d.name||"", first_name: d.first_name||"", last_name: d.last_name||"",
          middle_name: d.middle_name||"", gender: d.gender||"", dob: d.dob||"",
          occupation: d.occupation||"", tribe: d.tribe||"",
          blood_group: d.blood_group||"", religion: d.religion||"",
          marital_status: d.marital_status||"", nationality: d.nationality||"Tanzania",
          nida: d.nida||"", mobile: d.mobile||"", email: d.email||"",
          license_no: d.license_no||"",
          // Address (uses existing region/district/ward + new extended)
          address: d.address||"", region: d.region||"",
          district: d.district||"", ward: d.ward||"", street: d.street||"",
          home_address: d.home_address||"",
          home_region: d.home_region||"",
          home_district: d.home_district||"",
          home_ward: d.home_ward||"",
          work_address: d.work_address||"",
          work_employer: d.work_employer||"",
          // Medical
          medical_conditions: d.medical_conditions||"",
          allergies: d.allergies||"",
          disability: d.disability||"",
          // Next of kin
          kin_name: d.kin_name||"",
          kin_phone: d.kin_phone||"",
          kin_relationship: d.kin_relationship||"",
          kin_address: d.kin_address||"",
          // Emergency 2
          emergency2_name: d.emergency2_name||"",
          emergency2_phone: d.emergency2_phone||"",
          emergency2_relationship: d.emergency2_relationship||"",
        });
      }
    } catch {}
    setLoading(false);
  }, [citizen?.id]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true); setError(""); setSuccess("");
    try {
      // Ensure base columns also get the extended values
      const payload = {
        ...form,
        region:   form.region   || form.home_region   || "",
        district: form.district || form.home_district || "",
        ward:     form.ward     || form.home_ward     || "",
        address:  form.address  || form.home_address  || "",
      };
      const res = await fetch(`/api/citizen-portal/${citizen.id}/profile`, {
        method: "PATCH", headers: H(), body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.ok) { setSuccess("Imehifadhiwa!"); setEditing(false); load(); }
      else setError(json.error || "Imeshindwa");
    } catch { setError("Hitilafu ya mtandao"); }
    setSaving(false);
  };

  // Profile photo upload
  const uploadPhoto = async (file: File) => {
    setUploadingPhoto(true);
    const formData = new FormData(); formData.append("photo", file);
    try {
      const res = await fetch(`/api/citizen-portal/${citizen.id}/photo`, {
        method: "POST",
        headers: { Authorization: H().Authorization },
        body: formData,
      });
      const json = await res.json();
      if (json.ok) { load(); setSuccess("Picha imehifadhiwa!"); }
      else setError(json.error || "Imeshindwa kupakia picha");
    } catch { setError("Hitilafu kupakia picha"); }
    setUploadingPhoto(false);
  };

  // Add vehicle
  const addVehicle = async () => {
    setAddingVehicle(true);
    try {
      const res = await fetch(`/api/citizen-portal/${citizen.id}/vehicles`, {
        method: "POST", headers: H(), body: JSON.stringify(vehicleForm),
      });
      const json = await res.json();
      if (json.ok) { setShowAddVehicle(false); setVehicleForm({ plate:"",make:"",model:"",color:"",year:"",chassis_no:"",insurance_company:"",insurance_expires:"" }); load(); }
      else setError(json.error || "Imeshindwa");
    } catch { setError("Hitilafu ya mtandao"); }
    setAddingVehicle(false);
  };

  // Add device
  const addDevice = async () => {
    setAddingDevice(true);
    try {
      const res = await fetch(`/api/citizen-portal/${citizen.id}/devices`, {
        method: "POST", headers: H(), body: JSON.stringify(deviceForm),
      });
      const json = await res.json();
      if (json.ok) { setShowAddDevice(false); setDeviceForm({ deviceType:"simu",brand:"",model:"",serialNo:"",imei:"",color:"",purchaseDate:"" }); load(); }
      else setError(json.error || "Imeshindwa");
    } catch { setError("Hitilafu ya mtandao"); }
    setAddingDevice(false);
  };

  // Add property
  const addProperty = async () => {
    setAddingProperty(true);
    try {
      const res = await fetch(`/api/citizen-portal/${citizen.id}/properties`, {
        method: "POST", headers: H(), body: JSON.stringify(propertyForm),
      });
      const json = await res.json();
      if (json.ok) { setShowAddProperty(false); setPropertyForm({ property_type:"nyumba",address:"",region:"",district:"",ward:"",value:"",title_deed_no:"" }); load(); }
      else setError(json.error || "Imeshindwa");
    } catch { setError("Hitilafu ya mtandao"); }
    setAddingProperty(false);
  };

  const d = data || {};
  const vehicles   = d.vehicles   || [];
  const devices    = d.devices    || [];
  const properties = d.properties || [];
  const licenses   = d.licenses   || [];
  const govIds     = d.government_ids || [];

  // Driver points
  const driverPoints = d.driver_points ?? { current: 100, percentage: 100, status: "good" };
  const pointsColor = driverPoints.percentage >= 70 ? "#10B981" : driverPoints.percentage >= 40 ? "#F59E0B" : "#EF4444";

  const inp = {
    background:"var(--tpf-soft,#f8fafc)", border:"1px solid var(--tpf-border,#e2e8f0)",
    borderRadius:"10px", padding:"10px 12px", fontSize:"16px", color:"var(--tpf-text,#0f2347)",
    width:"100%", outline:"none",
  };

  const TABS = [
    { id:"profile",    label:"Profaili",    icon: User },
    { id:"vehicles",   label:"Magari",      icon: Car },
    { id:"devices",    label:"Vifaa",       icon: Smartphone },
    { id:"properties", label:"Mali",        icon: Home },
    { id:"medical",    label:"Afya",        icon: Stethoscope },
    { id:"kin",        label:"Familia",     icon: Users },
  ];

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 size={32} className="animate-spin text-police-muted" />
    </div>
  );

  return (
    <div className="space-y-4 p-3 sm:p-4 pb-6">

      {/* ── Profile header with photo ── */}
      <div className="rounded-2xl bg-police-card border border-police-soft p-5">
        <div className="flex items-start gap-4">
          {/* Profile photo */}
          <div className="relative shrink-0">
            <div className="h-[72px] w-[72px] sm:h-20 sm:w-20 overflow-hidden rounded-full ring-2 ring-[#2196F3]/30 bg-police-soft">
              {d.photo_url ? (
                <img src={d.photo_url} alt={d.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#2196F3]/10 text-[28px] font-black text-[#2196F3]">
                  {(d.name||"R")[0].toUpperCase()}
                </div>
              )}
            </div>
            <button onClick={() => photoRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#2196F3] shadow-md">
              {uploadingPhoto ? <Loader2 size={12} className="animate-spin text-white" /> : <Camera size={12} className="text-white" />}
            </button>
            <input ref={photoRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
          </div>

          {/* Name and ID */}
          <div className="flex-1 min-w-0">
            <h2 className="text-[18px] font-black text-police truncate">{d.name || "Raia"}</h2>
            <p className="text-[12px] text-police-muted">{d.mobile || d.email || "—"}</p>
            {d.nida && <p className="text-[11px] font-mono text-police-muted mt-0.5">{d.nida}</p>}
            {d.dob && <p className="text-[11px] text-police-muted">Amezaliwa: {new Date(d.dob).toLocaleDateString("sw-TZ")}</p>}
            {/* Quick status badges */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {d.approved && (
                <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                  <CheckCircle2 size={9}/> Imethibitishwa
                </span>
              )}
              {vehicles.length > 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                  🚗 {vehicles.length} Gari
                </span>
              )}
              {licenses.filter((l:any) => l.status === "valid").length > 0 && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                  🪪 Leseni Hai
                </span>
              )}
            </div>
          </div>

          <button onClick={() => { setEditing(!editing); setError(""); setSuccess(""); }}
            className={`shrink-0 rounded-xl px-3 py-2 text-[12px] font-bold transition ${
              editing ? "bg-red-100 text-red-600" : "bg-[#2196F3] text-white"
            }`}>
            {editing ? <><X size={13}/> Acha</> : <><Edit3 size={13}/> Hariri</>}
          </button>
        </div>

        {/* Driver points bar */}
        {driverPoints.current !== undefined && (
          <div className="mt-4 rounded-xl bg-police-soft border border-police-soft p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Activity size={14} style={{color: pointsColor}} />
                <span className="text-[12px] font-bold text-police">Alama za Dereva</span>
              </div>
              <span className="text-[18px] font-black" style={{color: pointsColor}}>
                {driverPoints.current}/100
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-police-muted/30">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${driverPoints.percentage ?? driverPoints.current}%`, background: pointsColor }} />
            </div>
            <p className="text-[10px] text-police-muted mt-1">
              {driverPoints.percentage >= 70 ? "✅ Hali Nzuri" : driverPoints.percentage >= 40 ? "⚠️ Tahadhari" : "🚫 Hatari — Leseni inaweza kusimamishwa"}
            </p>
          </div>
        )}
      </div>

      {/* Alerts */}
      {error   && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[12px] text-red-600">{error}</div>}
      {success && <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-[12px] text-green-600">{success}</div>}

      {/* Profile completion bar */}
      {!loading && <ProfileCompletion d={d} onEdit={() => setEditing(true)} />}

      {/* Tab bar */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none" style={{scrollbarWidth:"none"}}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-bold transition ${
              tab === t.id ? "bg-[#2196F3] text-white" : "bg-police-card border border-police-soft text-police-muted"
            }`}>
            <t.icon size={13}/> {t.label}
          </button>
        ))}
      </div>

      {/* ── PROFILE TAB ── */}
      {tab === "profile" && (
        <div className="space-y-3">
          {editing ? (
            <div className="rounded-2xl bg-police-card border border-police-soft p-4 space-y-3">
              <h3 className="text-[14px] font-black text-police">Hariri Taarifa</h3>
              {[
                { key:"name",             label:"Jina Kamili",       type:"text" },
                { key:"dob",              label:"Tarehe ya Kuzaliwa", type:"date" },
                { key:"nida",             label:"Namba ya NIDA",      type:"text" },
                { key:"mobile",           label:"Namba ya Simu",      type:"tel"  },
                { key:"email",            label:"Barua Pepe",         type:"email"},
                { key:"occupation",       label:"Kazi",               type:"text" },
                { key:"address",          label:"Anwani",             type:"text" },
                { key:"street",           label:"Mtaa",               type:"text" },
                { key:"ward",             label:"Kata",               type:"text" },
                { key:"district",         label:"Wilaya",             type:"text" },
                { key:"region",           label:"Mkoa",               type:"text" },
                { key:"occupation",       label:"Kazi / Taaluma",     type:"text" },
                { key:"work_employer",    label:"Mwajiri / Kampuni",  type:"text" },
                { key:"work_address",     label:"Anwani ya Kazi",     type:"text" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{fontSize:"11px",fontWeight:"bold",color:"var(--tpf-text-3)",textTransform:"uppercase",letterSpacing:"0.05em",display:"block",marginBottom:"4px"}}>{f.label}</label>
                  {f.key === "home_region" ? (
                    <select value={form[f.key]} onChange={e=>setForm((x:any)=>({...x,[f.key]:e.target.value}))} style={inp}>
                      <option value="">Chagua mkoa</option>
                      {TZ_REGIONS.map(r=><option key={r} value={r}>{r}</option>)}
                    </select>
                  ) : (
                    <input type={f.type} value={form[f.key]||""} onChange={e=>setForm((x:any)=>({...x,[f.key]:e.target.value}))} style={inp} />
                  )}
                </div>
              ))}
              {/* Selects */}
              {[
                { key:"gender",         label:"Jinsia",    opts:[["Me","Mme (Male)"],["Ke","Mke (Female)"]] },
                { key:"blood_group",    label:"Kundi la Damu", opts: BLOOD_GROUPS.map(b=>[b,b]) },
                { key:"marital_status", label:"Hali ya Ndoa",  opts: MARITAL.map(m=>[m,m]) },
                { key:"tribe",          label:"Kabila",         opts: TZ_TRIBES.map(t=>[t,t]) },
              ].map(f => (
                <div key={f.key}>
                  <label style={{fontSize:"11px",fontWeight:"bold",color:"var(--tpf-text-3)",textTransform:"uppercase",letterSpacing:"0.05em",display:"block",marginBottom:"4px"}}>{f.label}</label>
                  <select value={form[f.key]||""} onChange={e=>setForm((x:any)=>({...x,[f.key]:e.target.value}))} style={inp}>
                    <option value="">Chagua</option>
                    {f.opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              ))}
              <button onClick={save} disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2196F3] py-3 text-[13px] font-bold text-white disabled:opacity-50">
                {saving ? <><Loader2 size={15} className="animate-spin"/> Inahifadhi...</> : <><Save size={15}/> Hifadhi Mabadiliko</>}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Section title="Taarifa za Kibinafsi" icon={User} color="#2196F3">
                <Row label="Jina Kamili"        value={d.name} />
                <Row label="NIDA"               value={d.nida} mono />
                <Row label="Tarehe ya Kuzaliwa" value={d.dob ? new Date(d.dob).toLocaleDateString("sw-TZ") : null} />
                <Row label="Jinsia"             value={d.gender === "Me" ? "Mme" : d.gender === "Ke" ? "Mke" : d.gender} />
                <Row label="Kabila"             value={d.tribe} />
                <Row label="Dini"               value={d.religion} />
                <Row label="Hali ya Ndoa"       value={d.marital_status} />
                <Row label="Kundi la Damu"      value={d.blood_group} />
                <Row label="Taifa"              value={d.nationality || "Tanzania"} />
              </Section>

              <Section title="Mawasiliano" icon={Phone} color="#10B981">
                <Row label="Simu"       value={d.mobile} />
                <Row label="Barua Pepe" value={d.email} />
              </Section>

              <Section title="Anwani ya Nyumbani" icon={Home} color="#FF9800">
                <Row label="Anwani"  value={d.address || d.home_address} />
                <Row label="Kata"    value={d.ward || d.home_ward} />
                <Row label="Wilaya"  value={d.district || d.home_district} />
                <Row label="Mkoa"    value={d.region || d.home_region} />
              </Section>

              <Section title="Kazi / Ajira" icon={Briefcase} color="#8B5CF6" defaultOpen={true}>
                <Row label="Kazi / Taaluma"   value={d.occupation} />
                <Row label="Mwajiri / Kampuni" value={d.work_employer} />
                <Row label="Anwani ya Kazi"    value={d.work_address} />
              </Section>

              <Section title="Vitambulisho" icon={IdCard} color="#1E3A8A" defaultOpen={false}>
                <Row label="NIDA"  value={d.nida} mono />
                <Row label="Simu"  value={d.phone || d.mobile} />
                <Row label="Email" value={d.email} />
                {govIds.map((gid:any) => (
                  <div key={gid.id} className="border-b border-police-soft pb-2 last:border-0">
                    <Row label={gid.id_type_name || gid.id_type_code} value={gid.id_number} mono />
                    <ExpiryBadge date={gid.expires_at} label="Inaisha" />
                  </div>
                ))}
              </Section>

              {/* Driver licence */}
              {licenses.length > 0 && (
                <Section title="Leseni ya Udereva" icon={Key} color="#D97706">
                  {licenses.map((lic:any) => (
                    <div key={lic.id} className="space-y-1.5">
                      <Row label="Namba ya Leseni" value={lic.license_no || lic.license_number} mono />
                      <Row label="Aina/Darasa"     value={lic.class} />
                      <Row label="Tarehe Kutolewa" value={lic.issued_at || lic.issued_date} />
                      <ExpiryBadge date={lic.expires_at || lic.expiry_date} label="Inaisha" />
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-police-muted">Hali</span>
                        <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold capitalize ${
                          lic.status === "valid" ? "bg-green-100 text-green-700" :
                          lic.status === "suspended" ? "bg-red-100 text-red-700" :
                          "bg-orange-100 text-orange-700"
                        }`}>{lic.status}</span>
                      </div>
                    </div>
                  ))}
                </Section>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── VEHICLES TAB ── */}
      {tab === "vehicles" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-police-muted">{vehicles.length} gari zilizosajiliwa</p>
            <button onClick={() => setShowAddVehicle(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#2196F3] px-3 py-2 text-[12px] font-bold text-white">
              <Plus size={13}/> Sajili Gari
            </button>
          </div>

          {vehicles.length === 0 ? (
            <div className="rounded-2xl bg-police-card border border-police-soft p-10 text-center">
              <Car size={32} className="mx-auto mb-2 text-police-muted opacity-40" />
              <p className="text-[13px] text-police-muted">Hakuna magari yaliyosajiliwa</p>
            </div>
          ) : vehicles.map((v:any) => {
            const insExpiry = daysRemaining(v.insurance_expires);
            const insStatus = insExpiry < 0 ? "Imeisha" : insExpiry < 30 ? `Siku ${insExpiry}` : `Siku ${insExpiry}`;
            const insColor  = insExpiry < 0 ? "#EF4444" : insExpiry < 30 ? "#F59E0B" : "#10B981";
            return (
              <div key={v.id} className="rounded-2xl bg-police-card border border-police-soft p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[15px] font-black text-police font-mono">{v.plate}</p>
                    <p className="text-[12px] text-police-muted">{[v.make,v.model].filter(Boolean).join(" ")} · {v.color} · {v.year}</p>
                  </div>
                  <span className={`rounded-xl px-2 py-1 text-[10px] font-bold ${
                    v.status === "stolen" ? "bg-red-100 text-red-700" :
                    v.status === "registered" ? "bg-green-100 text-green-700" :
                    "bg-orange-100 text-orange-700"
                  }`}>{v.status || "registered"}</span>
                </div>
                <Row label="Chassis" value={v.chassis_no} mono />
                {/* Insurance */}
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-police-muted">Bima</span>
                  <div className="text-right">
                    <p className="text-police text-[11px]">{v.insurance_company || "—"}</p>
                    {v.insurance_expires && (
                      <span className="text-[10px] font-bold rounded-lg px-2 py-0.5" style={{background: insColor+"18", color: insColor}}>
                        {insStatus} zimebaki
                      </span>
                    )}
                  </div>
                </div>
                {/* Fines/Citations */}
                {(v.outstanding_fines > 0 || v.accident_count > 0) && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-2 space-y-1">
                    {v.outstanding_fines > 0 && <Row label="Faini Zinazosalia" value={`TZS ${parseInt(v.outstanding_fines).toLocaleString()}`} />}
                    {v.accident_count > 0 && <Row label="Ajali" value={`${v.accident_count} ajali`} />}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add vehicle modal */}
          {showAddVehicle && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center p-4">
              <div className="w-full max-w-md rounded-2xl bg-police-card border border-police-soft shadow-2xl p-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-black text-police">Sajili Gari</h3>
                  <button onClick={() => setShowAddVehicle(false)}><X size={18} className="text-police-muted"/></button>
                </div>
                <div className="space-y-3">
                  {[
                    { key:"plate",              label:"Namba ya Usajili *", placeholder:"T 123 ABC" },
                    { key:"make",               label:"Chapa (Make)",       placeholder:"Toyota" },
                    { key:"model",              label:"Mfano (Model)",      placeholder:"Corolla" },
                    { key:"color",              label:"Rangi",              placeholder:"Nyeupe" },
                    { key:"year",               label:"Mwaka",              placeholder:"2020" },
                    { key:"chassis_no",         label:"Namba ya Chassis",   placeholder:"JTEHK..." },
                    { key:"insurance_company",  label:"Kampuni ya Bima",    placeholder:"AAR, Jubilee..." },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{fontSize:"11px",fontWeight:"bold",color:"var(--tpf-text-3)",display:"block",marginBottom:"4px"}}>{f.label}</label>
                      <input value={vehicleForm[f.key]||""} onChange={e=>setVehicleForm((x:any)=>({...x,[f.key]:e.target.value}))}
                        placeholder={f.placeholder} style={inp} />
                    </div>
                  ))}
                  <div>
                    <label style={{fontSize:"11px",fontWeight:"bold",color:"var(--tpf-text-3)",display:"block",marginBottom:"4px"}}>Bima Inaisha</label>
                    <input type="date" value={vehicleForm.insurance_expires||""} onChange={e=>setVehicleForm((x:any)=>({...x,insurance_expires:e.target.value}))} style={inp} />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setShowAddVehicle(false)} className="flex-1 rounded-xl border border-police-soft py-2.5 text-[13px] font-bold text-police-muted">Ghairi</button>
                  <button onClick={addVehicle} disabled={!vehicleForm.plate || addingVehicle}
                    className="flex-1 rounded-xl bg-[#2196F3] py-2.5 text-[13px] font-bold text-white disabled:opacity-50">
                    {addingVehicle ? "Inahifadhi..." : "Sajili"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── DEVICES TAB ── */}
      {tab === "devices" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-police-muted">{devices.length} vifaa vilivyosajiliwa</p>
            <button onClick={() => setShowAddDevice(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#2196F3] px-3 py-2 text-[12px] font-bold text-white">
              <Plus size={13}/> Sajili Kifaa
            </button>
          </div>
          {devices.length === 0 ? (
            <div className="rounded-2xl bg-police-card border border-police-soft p-10 text-center">
              <Smartphone size={32} className="mx-auto mb-2 text-police-muted opacity-40"/>
              <p className="text-[13px] text-police-muted">Hakuna vifaa vilivyosajiliwa</p>
            </div>
          ) : devices.map((dev:any) => (
            <div key={dev.id} className="rounded-2xl bg-police-card border border-police-soft p-4 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[14px] font-black text-police">{dev.description || [dev.brand,dev.model].filter(Boolean).join(" ") || "Kifaa"}</p>
                  <p className="text-[11px] text-police-muted capitalize">{dev.category || dev.deviceType} · {dev.color}</p>
                </div>
                <span className={`rounded-xl px-2 py-1 text-[10px] font-bold ${
                  dev.status==="stolen"?"bg-red-100 text-red-700":dev.status==="lost"?"bg-orange-100 text-orange-700":"bg-green-100 text-green-700"
                }`}>{dev.status||"active"}</span>
              </div>
              <Row label="Serial No" value={dev.serial_no || dev.serialNo} mono />
              {dev.imei && <Row label="IMEI" value={dev.imei} mono />}
            </div>
          ))}
          {/* Add device modal */}
          {showAddDevice && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center p-4">
              <div className="w-full max-w-md rounded-2xl bg-police-card border border-police-soft shadow-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-black text-police">Sajili Kifaa</h3>
                  <button onClick={() => setShowAddDevice(false)}><X size={18} className="text-police-muted"/></button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label style={{fontSize:"11px",fontWeight:"bold",color:"var(--tpf-text-3)",display:"block",marginBottom:"4px"}}>Aina ya Kifaa</label>
                    <select value={deviceForm.deviceType} onChange={e=>setDeviceForm((x:any)=>({...x,deviceType:e.target.value}))} style={inp}>
                      {["simu","laptop","tablet","TV","camera","radio","generator","nyingine"].map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  {[
                    { key:"brand",       label:"Chapa",       placeholder:"Samsung, Apple..." },
                    { key:"model",       label:"Mfano",       placeholder:"Galaxy A54..." },
                    { key:"serialNo",    label:"Serial No *", placeholder:"SN12345" },
                    { key:"imei",        label:"IMEI (Simu)", placeholder:"358..." },
                    { key:"color",       label:"Rangi",       placeholder:"Nyeusi" },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{fontSize:"11px",fontWeight:"bold",color:"var(--tpf-text-3)",display:"block",marginBottom:"4px"}}>{f.label}</label>
                      <input value={deviceForm[f.key]||""} onChange={e=>setDeviceForm((x:any)=>({...x,[f.key]:e.target.value}))}
                        placeholder={f.placeholder} style={inp} />
                    </div>
                  ))}
                  <div>
                    <label style={{fontSize:"11px",fontWeight:"bold",color:"var(--tpf-text-3)",display:"block",marginBottom:"4px"}}>Tarehe ya Kununua</label>
                    <input type="date" value={deviceForm.purchaseDate||""} onChange={e=>setDeviceForm((x:any)=>({...x,purchaseDate:e.target.value}))} style={inp} />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setShowAddDevice(false)} className="flex-1 rounded-xl border border-police-soft py-2.5 text-[13px] font-bold text-police-muted">Ghairi</button>
                  <button onClick={addDevice} disabled={!deviceForm.serialNo || addingDevice}
                    className="flex-1 rounded-xl bg-[#2196F3] py-2.5 text-[13px] font-bold text-white disabled:opacity-50">
                    {addingDevice ? "Inahifadhi..." : "Sajili"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PROPERTIES TAB ── */}
      {tab === "properties" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-police-muted">{properties.length} mali zilizosajiliwa</p>
            <button onClick={() => setShowAddProperty(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#2196F3] px-3 py-2 text-[12px] font-bold text-white">
              <Plus size={13}/> Sajili Mali
            </button>
          </div>
          {properties.length === 0 ? (
            <div className="rounded-2xl bg-police-card border border-police-soft p-10 text-center">
              <Home size={32} className="mx-auto mb-2 text-police-muted opacity-40"/>
              <p className="text-[13px] text-police-muted">Hakuna mali zilizosajiliwa</p>
            </div>
          ) : properties.map((p:any) => (
            <div key={p.id} className="rounded-2xl bg-police-card border border-police-soft p-4 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[14px] font-black text-police">{p.name || p.address}</p>
                  <p className="text-[11px] text-police-muted capitalize">{p.property_type}</p>
                </div>
                {p.value && <span className="text-[12px] font-black text-[#10B981]">TZS {parseInt(p.value).toLocaleString()}</span>}
              </div>
              <Row label="Wilaya"    value={p.district} />
              <Row label="Mkoa"     value={p.region} />
              {p.title_deed_no && <Row label="Hati Namba" value={p.title_deed_no} mono />}
            </div>
          ))}
          {showAddProperty && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center p-4">
              <div className="w-full max-w-md rounded-2xl bg-police-card border border-police-soft shadow-2xl p-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-black text-police">Sajili Mali</h3>
                  <button onClick={() => setShowAddProperty(false)}><X size={18} className="text-police-muted"/></button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label style={{fontSize:"11px",fontWeight:"bold",color:"var(--tpf-text-3)",display:"block",marginBottom:"4px"}}>Aina ya Mali</label>
                    <select value={propertyForm.property_type} onChange={e=>setPropertyForm((x:any)=>({...x,property_type:e.target.value}))} style={inp}>
                      {["nyumba","ardhi","shamba","biashara","ghorofa","nyingine"].map(t=><option key={t} value={t} className="capitalize">{t}</option>)}
                    </select>
                  </div>
                  {[
                    { key:"address",      label:"Anwani / Maelezo *", placeholder:"Mtaa, Nambari..." },
                    { key:"ward",         label:"Kata",               placeholder:"Kata ya Ilala" },
                    { key:"district",     label:"Wilaya",             placeholder:"Ilala" },
                    { key:"region",       label:"Mkoa",               placeholder:"Dar es Salaam" },
                    { key:"title_deed_no",label:"Hati Namba",         placeholder:"HATI-000001" },
                    { key:"value",        label:"Thamani (TZS)",      placeholder:"50000000" },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{fontSize:"11px",fontWeight:"bold",color:"var(--tpf-text-3)",display:"block",marginBottom:"4px"}}>{f.label}</label>
                      <input value={propertyForm[f.key]||""} onChange={e=>setPropertyForm((x:any)=>({...x,[f.key]:e.target.value}))}
                        placeholder={f.placeholder} style={inp} />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setShowAddProperty(false)} className="flex-1 rounded-xl border border-police-soft py-2.5 text-[13px] font-bold text-police-muted">Ghairi</button>
                  <button onClick={addProperty} disabled={!propertyForm.address || addingProperty}
                    className="flex-1 rounded-xl bg-[#2196F3] py-2.5 text-[13px] font-bold text-white disabled:opacity-50">
                    {addingProperty ? "Inahifadhi..." : "Sajili"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MEDICAL TAB ── */}
      {tab === "medical" && (
        <div className="space-y-3">
          <Section title="Taarifa za Afya" icon={Stethoscope} color="#EF4444">
            <Row label="Kundi la Damu"       value={d.blood_group} />
            <Row label="Magonjwa ya Kudumu"  value={d.medical_conditions || form.medical_conditions || "Hakuna" } />
            <Row label="Mzio"                value={d.allergies || form.allergies || "Hakuna"} />
            <Row label="Ulemavu"             value={d.disability || form.disability || "Hakuna"} />
          </Section>

          {editing && (
            <div className="rounded-2xl bg-police-card border border-police-soft p-4 space-y-3">
              <h3 className="text-[13px] font-black text-police">Hariri Taarifa za Afya</h3>
              {[
                { key:"medical_conditions", label:"Magonjwa ya Kudumu",  placeholder:"Shinikizo la damu, kisukari..." },
                { key:"allergies",          label:"Mzio",                placeholder:"Dawa, chakula..." },
                { key:"disability",         label:"Ulemavu (kama upo)",  placeholder:"Maono, kusikia..." },
              ].map(f => (
                <div key={f.key}>
                  <label style={{fontSize:"11px",fontWeight:"bold",color:"var(--tpf-text-3)",display:"block",marginBottom:"4px"}}>{f.label}</label>
                  <input value={form[f.key]||""} onChange={e=>setForm((x:any)=>({...x,[f.key]:e.target.value}))} placeholder={f.placeholder} style={inp} />
                </div>
              ))}
              <button onClick={save} disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#EF4444] py-3 text-[13px] font-bold text-white disabled:opacity-50">
                {saving ? <><Loader2 size={15} className="animate-spin"/> Inahifadhi...</> : <><Save size={15}/> Hifadhi</>}
              </button>
            </div>
          )}

          {/* Insurance covers */}
          <Section title="Bima za Afya & Mali" icon={Shield} color="#10B981">
            {vehicles.map((v:any) => v.insurance_company && (
              <div key={v.id} className="space-y-1">
                <Row label={`Bima ya Gari (${v.plate})`} value={v.insurance_company} />
                <ExpiryBadge date={v.insurance_expires} label="Inaisha" />
              </div>
            ))}
            {vehicles.filter((v:any) => v.insurance_company).length === 0 && (
              <p className="text-[12px] text-police-muted py-2">Hakuna bima zilizosajiliwa</p>
            )}
          </Section>

          {/* Fees */}
          <Section title="Ada za Huduma" icon={Star} color="#D97706" defaultOpen={false}>
            {[
              { service:"Cheti cha Tabia Njema",  fee:"TZS 2,000" },
              { service:"Ukaguzi wa Gari",         fee:"TZS 5,000" },
              { service:"Fomu ya PF3",             fee:"Bure" },
              { service:"Cheti cha Umiliki",       fee:"TZS 5,000" },
              { service:"Ripoti",                  fee:"TZS 1,000" },
            ].map(f => (
              <div key={f.service} className="flex items-center justify-between text-[12px] border-b border-police-soft pb-2 last:border-0">
                <span className="text-police">{f.service}</span>
                <span className={`font-black ${f.fee==="Bure"?"text-green-600":"text-[#D97706]"}`}>{f.fee}</span>
              </div>
            ))}
          </Section>
        </div>
      )}

      {/* ── NEXT OF KIN TAB ── */}
      {tab === "kin" && (
        <div className="space-y-3">
          <Section title="Mtu wa Karibu (Next of Kin)" icon={Users} color="#8B5CF6">
            <Row label="Jina"             value={d.kin_name       || form.kin_name} />
            <Row label="Uhusiano"         value={d.kin_relationship || form.kin_relationship} />
            <Row label="Simu"             value={d.kin_phone      || form.kin_phone} />
            <Row label="Anwani"           value={d.kin_address    || form.kin_address} />
          </Section>

          <Section title="Mtu wa Dharura 2" icon={Phone} color="#EF4444">
            <Row label="Jina"     value={d.emergency2_name         || form.emergency2_name} />
            <Row label="Uhusiano" value={d.emergency2_relationship || form.emergency2_relationship} />
            <Row label="Simu"     value={d.emergency2_phone        || form.emergency2_phone} />
          </Section>

          {editing && (
            <div className="rounded-2xl bg-police-card border border-police-soft p-4 space-y-3">
              <h3 className="text-[13px] font-black text-police">Hariri Taarifa za Familia</h3>
              {[
                { key:"kin_name",                 label:"Jina la Mtu wa Karibu" },
                { key:"kin_relationship",          label:"Uhusiano (mama, baba, ndugu...)" },
                { key:"kin_phone",                 label:"Simu ya Mtu wa Karibu" },
                { key:"kin_address",               label:"Anwani yake" },
                { key:"emergency2_name",           label:"Mtu wa Dharura 2 — Jina" },
                { key:"emergency2_relationship",   label:"Uhusiano" },
                { key:"emergency2_phone",          label:"Simu" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{fontSize:"11px",fontWeight:"bold",color:"var(--tpf-text-3)",display:"block",marginBottom:"4px"}}>{f.label}</label>
                  <input value={form[f.key]||""} onChange={e=>setForm((x:any)=>({...x,[f.key]:e.target.value}))} style={inp} />
                </div>
              ))}
              <button onClick={save} disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8B5CF6] py-3 text-[13px] font-bold text-white disabled:opacity-50">
                {saving ? <><Loader2 size={15} className="animate-spin"/> Inahifadhi...</> : <><Save size={15}/> Hifadhi</>}
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
