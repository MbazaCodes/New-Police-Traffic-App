// @ts-nocheck
"use client";
// Admin Hierarchy Management — District / Regional / National Admins

import { useState } from "react";
import { Shield, Globe, MapPin, Building2, Settings } from "lucide-react";
import {
  PageHeader, SearchBar, DataTable, FormModal,
  Avatar, StatusBadge, ActionCell, FI, FS, ScopeFields,
  useDeleteRecord, authFetch, toast, useApiData, lbl, sel,
} from "./mgmt-shared";

const ADMIN_TIERS = [
  { value: "super-admin",    label: "Super Admin",            sublabel: "Msimamizi Mkuu",      color: "#EF4444", icon: Globe,     scope: "Nchi Nzima", desc: "Ruhusa kamili — simamia mfumo wote" },
  { value: "admin",          label: "National Admin",         sublabel: "Msimamizi wa Taifa",  color: "#1E3A8A", icon: Shield,    scope: "Nchi Nzima", desc: "Msimamizi wa mfumo wa kitaifa" },
  { value: "regional-admin", label: "Regional Admin",         sublabel: "Msimamizi wa Mkoa",   color: "#8B5CF6", icon: MapPin,    scope: "Mkoa",       desc: "Msimamizi wa mkoa wake" },
  { value: "district-admin", label: "District Admin",         sublabel: "Msimamizi wa Wilaya", color: "#FF9800", icon: Building2, scope: "Wilaya",     desc: "Msimamizi wa wilaya yake" },
  { value: "viewer",         label: "Viewer",                 sublabel: "Mtazamaji",           color: "#6B7280", icon: Settings,  scope: "—",          desc: "Mtazamaji tu — hakuna mabadiliko" },
];

const ADMIN_PERMISSIONS: Record<string, string[]> = {
  "super-admin":    ["CRUD wote", "Simamia watumiaji", "Mipangilio ya mfumo", "Ufikiaji kamili"],
  "admin":          ["CRUD watumiaji", "Simamia maofisa", "Angalia ripoti zote", "Mipangilio"],
  "regional-admin": ["Simamia mkoa wake", "Watumiaji wa mkoa", "Ripoti za mkoa"],
  "district-admin": ["Simamia wilaya yake", "Watumiaji wa wilaya", "Ripoti za wilaya"],
  "viewer":         ["Angalia peke yake", "Hakuna mabadiliko"],
};

export function MgmtAdmins() {
  const [tierFilter, setTierFilter] = useState("all");
  const [search, setSearch]         = useState("");
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState<any>(null);

  const roles = "super-admin,admin,regional-admin,district-admin,viewer";
  const url = `/api/users?${tierFilter !== "all" ? `role=${tierFilter}` : `roles=${roles}`}&limit=200${search ? `&search=${encodeURIComponent(search)}` : ""}`;
  const { data, loading, refetch } = useApiData<any>(url, undefined, [tierFilter, search], { refreshMs: 30000 });
  const { deleting, handleDelete } = useDeleteRecord("/api/officers", refetch);

  const getTierCfg = (role: string) => ADMIN_TIERS.find(t => t.value === role) || ADMIN_TIERS[1];

  const columns = [
    { key: "name", label: "Jina", render: (_: any, r: any) => {
      const t = getTierCfg(r.role);
      return (
        <div className="flex items-center gap-2">
          <Avatar name={r.name || "?"} color={t.color} />
          <div><p className="font-semibold text-police">{r.name}</p>
            <p className="text-[10px] text-police-faint">{t.sublabel}</p></div>
        </div>
      );
    }},
    { key: "badge_no", label: "Badge / ID", render: (_: any, r: any) => <span className="font-mono text-[11px] text-police-faint">{r.badge_no || "—"}</span> },
    { key: "role", label: "Kiwango", render: (_: any, r: any) => {
      const t = getTierCfg(r.role);
      return (
        <div>
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: t.color }}>{t.label}</span>
          <p className="mt-0.5 text-[9px] text-police-faint">{t.scope}</p>
        </div>
      );
    }},
    { key: "region", label: "Eneo", render: (_: any, r: any) => <span>{r.region || ""}{r.unit ? ` / ${r.unit}` : ""}{!r.region && !r.unit ? "Nchi Nzima" : ""}</span> },
    { key: "phone",  label: "Simu",  render: (_: any, r: any) => r.phone || "—" },
    { key: "email",  label: "Barua Pepe", render: (_: any, r: any) => r.email || "—" },
    { key: "status", label: "Hali",  render: (_: any, r: any) => <StatusBadge status={r.status || "active"} /> },
    { key: "created_at", label: "Tarehe", render: (_: any, r: any) => r.created_at ? new Date(r.created_at).toLocaleDateString("sw-TZ") : "—" },
    { key: "_a", label: "Vitendo", render: (_: any, r: any) => (
      <ActionCell id={r.id} name={r.name} deleting={deleting}
        onEdit={() => { setEditing(r); setShowForm(true); }}
        onDelete={handleDelete} />
    )},
  ];

  return (
    <div className="space-y-5 p-5">
      <PageHeader title="Usimamizi wa Wasimamizi" subtitle="Simamia wasimamizi wa ngazi mbalimbali"
        color="#1E3A8A" icon={Shield}
        onAdd={() => { setEditing(null); setShowForm(true); }} addLabel="Ongeza Msimamizi" />

      {/* Tier cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {ADMIN_TIERS.map(t => {
          const count = data.filter((d: any) => d.role === t.value).length;
          const Icon = t.icon;
          return (
            <button key={t.value}
              onClick={() => setTierFilter(tierFilter === t.value ? "all" : t.value)}
              className={`flex flex-col items-center rounded-2xl border-2 bg-police-card p-3 text-center shadow-sm transition ${tierFilter === t.value ? "" : "border-transparent"}`}
              style={tierFilter === t.value ? { borderColor: t.color } : {}}>
              <Icon size={16} style={{ color: t.color }} />
              <span className="mt-1.5 text-[20px] font-black" style={{ color: t.color }}>{count}</span>
              <span className="text-[9px] leading-tight text-police-muted">{t.label}</span>
              <span className="mt-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-bold text-white" style={{ backgroundColor: t.color }}>{t.scope}</span>
            </button>
          );
        })}
      </div>

      <SearchBar value={search} onChange={setSearch} onClear={() => setSearch("")}
        placeholder="Tafuta msimamizi kwa jina, badge...">
        <select value={tierFilter} onChange={e => setTierFilter(e.target.value)}
          className="rounded-xl border border-police bg-police-card px-3 h-10 text-[13px] text-police focus:outline-none">
          <option value="all">Wote</option>
          {ADMIN_TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </SearchBar>

      <DataTable columns={columns} data={data} loading={loading}
        emptyLabel="Hakuna wasimamizi waliohifadhiwa"
        onAdd={() => { setEditing(null); setShowForm(true); }} />

      {showForm && (
        <AdminForm editing={editing} adminTiers={ADMIN_TIERS} adminPermissions={ADMIN_PERMISSIONS}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); refetch(); }} />
      )}
    </div>
  );
}

function AdminForm({ editing, adminTiers, adminPermissions, onClose, onSaved }: any) {
  const isEdit = !!editing;
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [form, setForm] = useState({
    name:    editing?.name     || "",
    badgeNo: editing?.badge_no || "",
    role:    editing?.role     || "district-admin",
    phone:   editing?.phone    || "",
    email:   editing?.email    || "",
    region:  editing?.region   || "",
    district:editing?.unit     || "",
    status:  editing?.status   || "active",
  });
  const set = (k: string) => (e: React.ChangeEvent<any>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const selectedTier = adminTiers.find((t: any) => t.value === form.role) || adminTiers[1];
  const Icon = selectedTier.icon;

  const save = async () => {
    setError(null);
    if (!form.name.trim() || !form.badgeNo.trim()) { setError("Jina na Badge vinahitajika"); return; }
    if (["regional-admin"].includes(form.role) && !form.region) { setError("Mkoa unahitajika"); return; }
    if (["district-admin"].includes(form.role) && !form.district) { setError("Wilaya inahitajika"); return; }
    setSaving(true);
    const { error: e } = await authFetch(isEdit ? `/api/officers/${editing.id}` : "/api/officers", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(), badgeNo: form.badgeNo.trim(), role: form.role,
        phone: form.phone || null, email: form.email || null,
        region: form.region || null, unit: form.district || null, status: form.status,
        rank: "Admin",
      }),
    });
    setSaving(false);
    if (e) { setError(e); return; }
    toast({ title: isEdit ? "Imesasishwa ✓" : "Ameongezwa ✓", description: `${form.name} — ${selectedTier.label}` });
    onSaved();
  };

  return (
    <FormModal title={isEdit ? "Hariri Msimamizi" : "Ongeza Msimamizi"} subtitle="Simamia kiwango na ruhusa"
      icon={Icon} color={selectedTier.color}
      onClose={onClose} onSave={save} saving={saving} error={error}>

      {/* Tier selector */}
      <div>
        <label className={lbl}>Kiwango cha Usimamizi *</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {adminTiers.map((t: any) => {
            const TIcon = t.icon;
            const active = form.role === t.value;
            return (
              <button key={t.value} type="button"
                onClick={() => setForm(f => ({ ...f, role: t.value, region: "", district: "" }))}
                className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-center transition ${active ? "text-white" : "border-police-soft text-police-muted"}`}
                style={active ? { backgroundColor: t.color, borderColor: t.color } : {}}>
                <TIcon size={16} style={active ? { color: "white" } : { color: t.color }} />
                <span className="text-[9px] font-bold leading-tight">{t.label}</span>
                <span className={`text-[8px] ${active ? "text-white/70" : "text-police-faint"}`}>{t.scope}</span>
              </button>
            );
          })}
        </div>
        {/* Permissions preview */}
        <div className="mt-2 rounded-xl p-2 text-[10px]" style={{ backgroundColor: `${selectedTier.color}08` }}>
          <p className="font-bold mb-1" style={{ color: selectedTier.color }}>Ruhusa:</p>
          <div className="flex flex-wrap gap-1">
            {(adminPermissions[form.role] || []).map((p: string) => (
              <span key={p} className="rounded-full border px-2 py-0.5 text-police-muted" style={{ borderColor: `${selectedTier.color}30` }}>{p}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FI label="Jina Kamili" required value={form.name} onChange={set("name")} />
        <FI label="Namba ya Badge / ID" required value={form.badgeNo} onChange={set("badgeNo")} disabled={isEdit} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FI label="Simu" value={form.phone} onChange={set("phone")} />
        <FI label="Barua Pepe" value={form.email} onChange={set("email")} />
      </div>
      <FS label="Hali" value={form.status} onChange={set("status")}>
        <option value="active">Kazini / Hai</option>
        <option value="inactive">Imezimwa</option>
        <option value="suspended">Imesimamishwa</option>
      </FS>
      {["regional-admin", "district-admin"].includes(form.role) && (
        <ScopeFields region={form.region} district={form.district}
          onRegion={v => setForm(f => ({ ...f, region: v, district: "" }))}
          onDistrict={v => setForm(f => ({ ...f, district: v }))}
          showDistrict={form.role === "district-admin"} />
      )}
    </FormModal>
  );
}
