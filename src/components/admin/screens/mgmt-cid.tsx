// @ts-nocheck
"use client";
// CID & Investigators Management Page

import { useState } from "react";
import { Eye, FileSearch, UserX, Shield } from "lucide-react";
import {
  PageHeader, SearchBar, DataTable, FormModal,
  Avatar, StatusBadge, ActionCell, FI, FS, ScopeFields,
  useDeleteRecord, authFetch, toast, useApiData, lbl, sel, inp,
  TZ_POLICE_RANKS,
} from "./mgmt-shared";

const CID_ROLES = [
  { value: "cid-officer",   label: "CID Officer",           color: "#EF4444", icon: Eye,        desc: "Afisa wa Upelelezi wa Jinai" },
  { value: "investigator",  label: "Mpelelezi",             color: "#8B5CF6", icon: FileSearch, desc: "Mpelelezi wa Kesi Maalum" },
];

const SPECIALIZATIONS = [
  "Jinai ya Kawaida", "Uchunguzi wa Fedha", "Uhalifu wa Kimtandao (Cybercrime)",
  "Ugaidi / Counterterrorism", "Biashara ya Madawa", "Biashara ya Binadamu",
  "Uchunguzi wa Ufisadi", "Upelelezi wa Silaha", "Jinai ya Vijana",
  "Jinai dhidi ya Wanawake na Watoto", "Uchunguzi wa Mahali pa Tukio", "Nyingine",
];

export function MgmtCID() {
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch]         = useState("");
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState<any>(null);

  const rolesParam = roleFilter === "all" ? "cid-officer,investigator" : roleFilter;
  const url = `/api/users?roles=${rolesParam}&limit=200${search ? `&search=${encodeURIComponent(search)}` : ""}`;
  const { data, loading, refetch } = useApiData<any>(url, undefined, [roleFilter, search], { refreshMs: 30000 });
  const { deleting, handleDelete } = useDeleteRecord("/api/officers", refetch);

  const getRoleCfg = (role: string) => CID_ROLES.find(r => r.value === role) || CID_ROLES[0];

  const columns = [
    { key: "name", label: "Jina", render: (_: any, r: any) => {
      const c = getRoleCfg(r.role);
      return (
        <div className="flex items-center gap-2">
          <Avatar name={r.name || "?"} color={c.color} />
          <div><p className="font-semibold text-police">{r.name}</p>
            <p className="text-[10px] text-police-faint">{r.rank || "—"}</p></div>
        </div>
      );
    }},
    { key: "badge_no", label: "Badge",  render: (_: any, r: any) => <span className="font-mono text-[11px] text-police-faint">{r.badge_no || "—"}</span> },
    { key: "role", label: "Nafasi", render: (_: any, r: any) => {
      const c = getRoleCfg(r.role);
      return <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: c.color }}>{c.label}</span>;
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
      <PageHeader title="CID na Upelelezi" subtitle="Simamia maafisa wa uchunguzi wa jinai"
        color="#EF4444" icon={Eye}
        onAdd={() => { setEditing(null); setShowForm(true); }} addLabel="Ongeza Mpelelezi" />

      {/* Stats per role */}
      <div className="grid grid-cols-2 gap-3">
        {CID_ROLES.map(r => {
          const count = data.filter((d: any) => d.role === r.value).length;
          const Icon = r.icon;
          return (
            <button key={r.value} onClick={() => setRoleFilter(roleFilter === r.value ? "all" : r.value)}
              className={`flex items-center gap-3 rounded-2xl border-2 bg-police-card p-4 text-left shadow-sm transition ${roleFilter === r.value ? "" : "border-transparent"}`}
              style={roleFilter === r.value ? { borderColor: r.color } : {}}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${r.color}15` }}>
                <Icon size={20} style={{ color: r.color }} />
              </div>
              <div>
                <p className="text-[22px] font-black" style={{ color: r.color }}>{count}</p>
                <p className="text-[11px] text-police-muted">{r.label}</p>
                <p className="text-[10px] text-police-faint">{r.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <SearchBar value={search} onChange={setSearch} onClear={() => setSearch("")}
        placeholder="Tafuta kwa jina, badge, mkoa...">
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="rounded-xl border border-police bg-police-card px-3 h-10 text-[13px] text-police focus:outline-none">
          <option value="all">Wote</option>
          {CID_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </SearchBar>

      <DataTable columns={columns} data={data} loading={loading}
        emptyLabel="Hakuna maafisa wa CID waliohifadhiwa"
        onAdd={() => { setEditing(null); setShowForm(true); }} />

      {showForm && (
        <CIDForm editing={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); refetch(); }} />
      )}
    </div>
  );
}

function CIDForm({ editing, onClose, onSaved }: any) {
  const isEdit = !!editing;
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [form, setForm] = useState({
    name:           editing?.name      || "",
    badgeNo:        editing?.badge_no  || "",
    rank:           editing?.rank      || "Inspector",
    role:           editing?.role      || "cid-officer",
    phone:          editing?.phone     || "",
    email:          editing?.email     || "",
    region:         editing?.region    || "",
    district:       editing?.unit      || "",
    status:         editing?.status    || "active",
    specialization: "",
    caseTypes:      "",
    securityClearance: "Standard",
  });
  const set = (k: string) => (e: React.ChangeEvent<any>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const cfg = CID_ROLES.find(r => r.value === form.role) || CID_ROLES[0];

  const save = async () => {
    setError(null);
    if (!form.name.trim() || !form.badgeNo.trim()) { setError("Jina na Badge vinahitajika"); return; }
    setSaving(true);
    const { error: e } = await authFetch(isEdit ? `/api/officers/${editing.id}` : "/api/officers", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(), badgeNo: form.badgeNo.trim(), rank: form.rank,
        role: form.role, phone: form.phone || null, email: form.email || null,
        region: form.region || null, unit: form.district || null, status: form.status,
      }),
    });
    setSaving(false);
    if (e) { setError(e); return; }
    toast({ title: isEdit ? "Imesasishwa ✓" : "Ameongezwa ✓", description: form.name });
    onSaved();
  };

  return (
    <FormModal title={isEdit ? "Hariri Mpelelezi" : "Ongeza Mpelelezi"}
      subtitle="CID na Upelelezi wa Jinai" icon={Eye} color={cfg.color}
      onClose={onClose} onSave={save} saving={saving} error={error}>

      {/* Role selector */}
      <div>
        <label className={lbl}>Nafasi *</label>
        <div className="flex gap-2">
          {CID_ROLES.map(r => {
            const Icon = r.icon;
            return (
              <button key={r.value} type="button" onClick={() => setForm(f => ({ ...f, role: r.value }))}
                className={`flex flex-1 items-center gap-2 rounded-xl border-2 px-3 py-2 text-[12px] font-bold transition ${form.role === r.value ? "text-white" : "border-police-soft text-police-muted"}`}
                style={form.role === r.value ? { backgroundColor: r.color, borderColor: r.color } : {}}>
                <Icon size={15} /> {r.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FI label="Jina Kamili" required value={form.name} onChange={set("name")} />
        <FI label="Namba ya Badge" required value={form.badgeNo} onChange={set("badgeNo")} disabled={isEdit} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FS label="Cheo / Rank" value={form.rank} onChange={set("rank")}>
          {["Inspector General of Police (IGP)","Commissioner of Police (CP)","Assistant Commissioner (ACP)",
            "Senior Superintendent (SSP)","Superintendent (SP)","Assistant Superintendent (ASP)",
            "Chief Inspector","Inspector","Assistant Inspector","Sergeant","Corporal","Constable"
          ].map(r => <option key={r} value={r}>{r}</option>)}
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

      <div className="rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/5 p-3 space-y-3">
        <p className="text-[11px] font-bold text-[#EF4444]">Taarifa Maalum za CID</p>
        <FS label="Utaalamu / Specialization" value={form.specialization} onChange={set("specialization")}>
          <option value="">— Chagua —</option>
          {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </FS>
        <FS label="Kiwango cha Usalama" value={form.securityClearance} onChange={set("securityClearance")}>
          <option value="Standard">Standard</option>
          <option value="Confidential">Confidential</option>
          <option value="Secret">Secret</option>
          <option value="Top Secret">Top Secret</option>
        </FS>
      </div>
    </FormModal>
  );
}
