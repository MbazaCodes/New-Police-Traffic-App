// @ts-nocheck
"use client";
// Idara Maalum — Special Units Management
// Anti-Poaching, VIP Protection, Special Forces, K9, Marine, Aviation, etc.

import { useState } from "react";
import { Star, Zap, Shield, Anchor, Plane, Dog } from "lucide-react";
import {
  PageHeader, SearchBar, DataTable, FormModal,
  Avatar, StatusBadge, ActionCell, FI, FS, ScopeFields,
  useDeleteRecord, authFetch, toast, useApiData, lbl, sel, inp,
  TZ_POLICE_RANKS,
} from "./mgmt-shared";

const SPECIAL_UNITS = [
  { value: "anti-poaching",     label: "Anti-Poaching",              color: "#10B981", icon: Shield, desc: "Kupambana na ujangili wa wanyama" },
  { value: "vip-protection",    label: "VIP Protection",             color: "#1E3A8A", icon: Star,   desc: "Ulinzi wa watukufu na viongozi" },
  { value: "special-forces",    label: "Field Force Unit (FFU)",     color: "#EF4444", icon: Zap,    desc: "Kitengo cha nguvu maalum" },
  { value: "marine",            label: "Marine Police",              color: "#0891B2", icon: Anchor, desc: "Polisi wa maji na maziwa" },
  { value: "aviation",          label: "Police Air Wing",            color: "#7C3AED", icon: Plane,  desc: "Kitengo cha anga" },
  { value: "k9",                label: "K9 / Mbwa wa Polisi",        color: "#F59E0B", icon: Dog,    desc: "Kitengo cha mbwa wa polisi" },
  { value: "cybercrime",        label: "Cybercrime Unit",            color: "#6366F1", icon: Shield, desc: "Upelelezi wa uhalifu wa kimtandao" },
  { value: "counter-terrorism", label: "Counter-Terrorism",          color: "#DC2626", icon: Shield, desc: "Kupambana na ugaidi" },
  { value: "traffic-enforcement","label":"Traffic Enforcement",      color: "#FF9800", icon: Shield, desc: "Utekelezaji wa sheria za barabarani" },
];

const DEPLOYMENT_STATUS = ["Imewekwa (Deployed)", "Hifadhi (Reserve)", "Mafunzo (Training)", "Likizo (Leave)", "Injured"];

export function MgmtSpecial() {
  const [unitFilter, setUnitFilter] = useState("all");
  const [search, setSearch]         = useState("");
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState<any>(null);
  const [showUnitCards, setShowUnitCards] = useState(true);

  const url = `/api/users?${unitFilter !== "all" ? `unit=${encodeURIComponent(unitFilter)}` : "roles=officer-general,officer-traffic,cid-officer,investigator"}&limit=200${search ? `&search=${encodeURIComponent(search)}` : ""}`;
  const { data: allOfficers, loading, refetch } = useApiData<any>(url, undefined, [unitFilter, search], { refreshMs: 30000 });

  // Filter by special unit tag (stored in officer notes or unit field)
  const data = unitFilter === "all"
    ? allOfficers.filter((o: any) => SPECIAL_UNITS.some(u => (o.unit || "").includes(u.value) || (o.notes || "").includes(u.value)))
    : allOfficers;

  const { deleting, handleDelete } = useDeleteRecord("/api/officers", refetch);

  const getUnitCfg = (officer: any) => {
    const unitVal = officer.unit || officer.notes || "";
    return SPECIAL_UNITS.find(u => unitVal.includes(u.value)) || SPECIAL_UNITS[0];
  };

  const columns = [
    { key: "name", label: "Jina", render: (_: any, r: any) => {
      const u = getUnitCfg(r);
      return (
        <div className="flex items-center gap-2">
          <Avatar name={r.name || "?"} color={u.color} />
          <div><p className="font-semibold text-police">{r.name}</p>
            <p className="text-[10px] text-police-faint">{r.rank || "—"}</p></div>
        </div>
      );
    }},
    { key: "badge_no", label: "Badge", render: (_: any, r: any) => <span className="font-mono text-[11px] text-police-faint">{r.badge_no || "—"}</span> },
    { key: "unit", label: "Kitengo", render: (_: any, r: any) => {
      const u = getUnitCfg(r);
      return <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: u.color }}>{u.label}</span>;
    }},
    { key: "region", label: "Mkoa", render: (_: any, r: any) => r.region || "—" },
    { key: "phone",  label: "Simu", render: (_: any, r: any) => r.phone || "—" },
    { key: "status", label: "Hali", render: (_: any, r: any) => <StatusBadge status={r.status || "active"} /> },
    { key: "created_at", label: "Tarehe", render: (_: any, r: any) => r.created_at ? new Date(r.created_at).toLocaleDateString("sw-TZ") : "—" },
    { key: "_a", label: "Vitendo", render: (_: any, r: any) => (
      <ActionCell id={r.id} name={r.name} deleting={deleting}
        onEdit={() => { setEditing(r); setShowForm(true); }}
        onDelete={handleDelete} />
    )},
  ];

  return (
    <div className="space-y-5 p-5">
      <PageHeader title="Idara Maalum" subtitle="Simamia vitengo maalum vya polisi"
        color="#EF4444" icon={Star}
        onAdd={() => { setEditing(null); setShowForm(true); }} addLabel="Ongeza Afisa wa Kitengo" />

      {/* Unit grid */}
      <div>
        <button onClick={() => setShowUnitCards(v => !v)}
          className="mb-3 flex items-center gap-2 text-[12px] font-semibold text-police-muted hover:text-police">
          Vitengo ({SPECIAL_UNITS.length}) {showUnitCards ? "▲" : "▼"}
        </button>
        {showUnitCards && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {SPECIAL_UNITS.map(u => {
              const Icon = u.icon;
              const active = unitFilter === u.value;
              return (
                <button key={u.value}
                  onClick={() => setUnitFilter(active ? "all" : u.value)}
                  className={`flex items-center gap-2 rounded-xl border-2 bg-police-card p-3 text-left text-[11px] transition ${active ? "text-white" : "border-transparent text-police-muted hover:border-police-soft"}`}
                  style={active ? { backgroundColor: u.color, borderColor: u.color } : {}}>
                  <Icon size={15} style={{ color: active ? "white" : u.color }} />
                  <div className="min-w-0">
                    <p className="truncate font-bold">{u.label}</p>
                    <p className={`truncate text-[9px] ${active ? "text-white/70" : "text-police-faint"}`}>{u.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <SearchBar value={search} onChange={setSearch} onClear={() => setSearch("")}
        placeholder="Tafuta afisa wa kitengo maalum..." />

      <DataTable columns={columns} data={data} loading={loading}
        emptyLabel="Hakuna maafisa wa idara maalum waliohifadhiwa"
        onAdd={() => { setEditing(null); setShowForm(true); }} />

      {showForm && (
        <SpecialForm editing={editing} units={SPECIAL_UNITS}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); refetch(); }} />
      )}
    </div>
  );
}

function SpecialForm({ editing, units, onClose, onSaved }: any) {
  const isEdit = !!editing;
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [form, setForm] = useState({
    name:               editing?.name      || "",
    badgeNo:            editing?.badge_no  || "",
    rank:               editing?.rank      || "Constable",
    phone:              editing?.phone     || "",
    email:              editing?.email     || "",
    region:             editing?.region    || "",
    district:           editing?.unit?.includes("-") ? "" : (editing?.unit || ""),
    status:             editing?.status    || "active",
    specialUnit:        units[0].value,
    deploymentStatus:   "Imewekwa (Deployed)",
    specialSkills:      "",
    certifications:     "",
    deploymentLocation: "",
  });
  const set = (k: string) => (e: React.ChangeEvent<any>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const selectedUnit = units.find((u: any) => u.value === form.specialUnit) || units[0];
  const UIcon = selectedUnit.icon;

  const save = async () => {
    setError(null);
    if (!form.name.trim() || !form.badgeNo.trim()) { setError("Jina na Badge vinahitajika"); return; }
    setSaving(true);
    const { error: e } = await authFetch(isEdit ? `/api/officers/${editing.id}` : "/api/officers", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(), badgeNo: form.badgeNo.trim(), rank: form.rank,
        role: "officer-general", phone: form.phone || null, email: form.email || null,
        region: form.region || null,
        unit: `${form.specialUnit}|${form.deploymentLocation || ""}`,
        status: form.status,
      }),
    });
    setSaving(false);
    if (e) { setError(e); return; }
    toast({ title: isEdit ? "Imesasishwa ✓" : "Ameongezwa ✓", description: `${form.name} — ${selectedUnit.label}` });
    onSaved();
  };

  return (
    <FormModal title={isEdit ? "Hariri Afisa wa Idara Maalum" : "Ongeza Afisa wa Idara Maalum"}
      subtitle={selectedUnit.label} icon={UIcon} color={selectedUnit.color}
      onClose={onClose} onSave={save} saving={saving} error={error}>

      {/* Unit selector */}
      <div>
        <label className={lbl}>Kitengo Maalum *</label>
        <select value={form.specialUnit} onChange={set("specialUnit")} className={sel}>
          {units.map((u: any) => <option key={u.value} value={u.value}>{u.label}</option>)}
        </select>
        <p className="mt-1 text-[10px] text-police-faint">{selectedUnit.desc}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FI label="Jina Kamili" required value={form.name} onChange={set("name")} />
        <FI label="Namba ya Badge" required value={form.badgeNo} onChange={set("badgeNo")} disabled={isEdit} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FS label="Cheo" value={form.rank} onChange={set("rank")}>
          {TZ_POLICE_RANKS.map((r: string) => <option key={r} value={r}>{r}</option>)}
        </FS>
        <FS label="Hali" value={form.status} onChange={set("status")}>
          <option value="active">Kazini</option>
          <option value="on-leave">Mapumziko</option>
          <option value="suspended">Amesimamishwa</option>
        </FS>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FI label="Simu" value={form.phone} onChange={set("phone")} />
        <FI label="Barua Pepe" value={form.email} onChange={set("email")} />
      </div>
      <ScopeFields region={form.region} district={form.district}
        onRegion={v => setForm(f => ({ ...f, region: v, district: "" }))}
        onDistrict={v => setForm(f => ({ ...f, district: v }))} />

      {/* Special unit fields */}
      <div className="rounded-xl p-3 space-y-3" style={{ backgroundColor: `${selectedUnit.color}08`, border: `1px solid ${selectedUnit.color}20` }}>
        <p className="text-[11px] font-bold" style={{ color: selectedUnit.color }}>Taarifa za {selectedUnit.label}</p>
        <FI label="Mahali pa Uwekaji (Deployment)" value={form.deploymentLocation} onChange={set("deploymentLocation")}
          placeholder="e.g. Serengeti National Park, VIP Zone A" />
        <FS label="Hali ya Uwekaji" value={form.deploymentStatus} onChange={set("deploymentStatus")}>
          {DEPLOYMENT_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
        </FS>
        <FI label="Ujuzi Maalum" value={form.specialSkills} onChange={set("specialSkills")}
          placeholder="e.g. Sniper, K9 Handler, Dive Certified" />
        <FI label="Vyeti / Certifications" value={form.certifications} onChange={set("certifications")}
          placeholder="e.g. Counter-Terrorism 2023, Maritime 2022" />
      </div>
    </FormModal>
  );
}
