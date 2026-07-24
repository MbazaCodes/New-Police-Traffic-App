// @ts-nocheck
"use client";
// Command & Utawala Management Page

import { useState } from "react";
import { Star, Award, Globe, MapPin, Building2, Users } from "lucide-react";
import {
  PageHeader, SearchBar, DataTable, FormModal,
  Avatar, StatusBadge, ActionCell, FI, FS, ScopeFields,
  useDeleteRecord, authFetch, toast, useApiData, lbl, sel,
  TZ_POLICE_RANKS,
} from "./mgmt-shared";

type CommandTab = "national" | "regional" | "district" | "station";

const COMMAND_CFG: Record<CommandTab, {
  label: string; role: string; color: string; icon: any;
  desc: string; scopeField: string;
}> = {
  national:  { label: "Kamanda wa Taifa",  role: "national-commissioner",  color: "#1E3A8A", icon: Globe,     desc: "Inspector General & National Commanders", scopeField: "none" },
  regional:  { label: "Kamanda wa Mkoa",   role: "regional-commissioner",  color: "#8B5CF6", icon: MapPin,    desc: "Regional Police Commanders (RPC)",         scopeField: "region" },
  district:  { label: "Kamanda wa Wilaya", role: "district-commissioner",  color: "#FF9800", icon: Building2, desc: "District Police Commanders (OCD)",         scopeField: "district" },
  station:   { label: "OCS / Kamanda",     role: "station-commissioner",   color: "#10B981", icon: Star,      desc: "Officer Commanding Station (OCS)",         scopeField: "station" },
};

const COMMAND_RANKS = [
  "Inspector General of Police (IGP)",
  "Deputy Inspector General (DIG)",
  "Commissioner of Police (CP)",
  "Deputy Commissioner (DCP)",
  "Assistant Commissioner (ACP)",
  "Senior Superintendent (SSP)",
  "Superintendent (SP)",
  "Assistant Superintendent (ASP)",
];

export function MgmtCommand() {
  const [tab, setTab]       = useState<CommandTab>("national");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<any>(null);

  const cfg = COMMAND_CFG[tab];
  const url = `/api/users?role=${cfg.role}&limit=200${search ? `&search=${encodeURIComponent(search)}` : ""}`;
  const { data, loading, refetch } = useApiData<any>(url, undefined, [tab, search], { refreshMs: 30000 });
  const { deleting, handleDelete } = useDeleteRecord("/api/officers", refetch);

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("sw-TZ") : "—";

  const columns = [
    { key: "name", label: "Jina", render: (_: any, r: any) => (
      <div className="flex items-center gap-2">
        <Avatar name={r.name || "?"} color={cfg.color} />
        <div><p className="font-semibold text-police">{r.name}</p>
          <p className="text-[10px] text-police-faint">{r.rank || "—"}</p></div>
      </div>
    )},
    { key: "badge_no",  label: "Badge",  render: (_: any, r: any) => <span className="font-mono text-[11px] text-police-faint">{r.badge_no || "—"}</span> },
    { key: "region",    label: "Mkoa",   render: (_: any, r: any) => r.region || "—" },
    { key: "unit",      label: "Wilaya/Kituo", render: (_: any, r: any) => r.unit || "—" },
    { key: "phone",     label: "Simu",   render: (_: any, r: any) => r.phone || "—" },
    { key: "status",    label: "Hali",   render: (_: any, r: any) => <StatusBadge status={r.status || "active"} /> },
    { key: "created_at",label: "Tarehe", render: (_: any, r: any) => <span className="text-police-faint">{fmtDate(r.created_at)}</span> },
    { key: "_a", label: "Vitendo", render: (_: any, r: any) => (
      <ActionCell id={r.id} name={r.name} deleting={deleting}
        onEdit={() => { setEditing(r); setShowForm(true); }}
        onDelete={handleDelete} />
    )},
  ];

  return (
    <div className="space-y-5 p-5">
      <PageHeader title="Kamandi na Utawala" subtitle="Simamia maafisa wakubwa wa kamandi"
        color="#1E3A8A" icon={Award}
        onAdd={() => { setEditing(null); setShowForm(true); }} addLabel={`Ongeza ${cfg.label}`} />

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2 border-b border-police-soft pb-3">
        {(Object.entries(COMMAND_CFG) as [CommandTab, any][]).map(([key, c]) => {
          const Icon = c.icon;
          const count = 0;
          return (
            <button key={key} onClick={() => { setTab(key); setSearch(""); }}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-bold transition ${tab === key ? "text-white" : "text-police-muted hover:bg-police-soft"}`}
              style={tab === key ? { backgroundColor: c.color } : {}}>
              <Icon size={14} /> {c.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl p-3 text-[12px]" style={{ backgroundColor: `${cfg.color}08`, border: `1px solid ${cfg.color}20` }}>
        <p className="text-police"><cfg.icon size={14} className="mr-2 inline" style={{ color: cfg.color }} />{cfg.desc} · <strong style={{ color: cfg.color }}>{data.length}</strong> wamesajiliwa</p>
      </div>

      <SearchBar value={search} onChange={setSearch} onClear={() => setSearch("")}
        placeholder={`Tafuta ${cfg.label.toLowerCase()}...`} />

      <DataTable columns={columns} data={data} loading={loading}
        emptyLabel={`Hakuna ${cfg.label} waliohifadhiwa`}
        onAdd={() => { setEditing(null); setShowForm(true); }} />

      {showForm && (
        <CommandForm editing={editing} tab={tab} cfg={cfg}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); refetch(); }} />
      )}
    </div>
  );
}

function CommandForm({ editing, tab, cfg, onClose, onSaved }: any) {
  const isEdit = !!editing;
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [form, setForm] = useState({
    name:         editing?.name       || "",
    badgeNo:      editing?.badge_no   || "",
    rank:         editing?.rank       || COMMAND_RANKS[5],
    phone:        editing?.phone      || "",
    email:        editing?.email      || "",
    region:       editing?.region     || "",
    district:     editing?.unit       || "",
    status:       editing?.status     || "active",
    serviceNo:    editing?.id_number  || "",
    appointment:  "",
    directorate:  "",
  });
  const set = (k: string) => (e: React.ChangeEvent<any>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setError(null);
    if (!form.name.trim())   { setError("Jina linahitajika"); return; }
    if (!form.badgeNo.trim()){ setError("Badge inahitajika"); return; }
    if (tab === "regional" && !form.region)   { setError("Mkoa unahitajika"); return; }
    if (tab === "district" && !form.district) { setError("Wilaya inahitajika"); return; }
    setSaving(true);
    const payload = {
      name: form.name.trim(), badgeNo: form.badgeNo.trim(), rank: form.rank,
      phone: form.phone || null, email: form.email || null,
      region: form.region || null, unit: form.district || null,
      status: form.status, role: cfg.role,
    };
    const ep = isEdit ? `/api/officers/${editing.id}` : "/api/officers";
    const { error: e } = await authFetch(ep, { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (e) { setError(e); return; }
    toast({ title: isEdit ? "Imesasishwa ✓" : "Ameongezwa ✓", description: form.name });
    onSaved();
  };

  return (
    <FormModal title={isEdit ? `Hariri ${cfg.label}` : `Ongeza ${cfg.label}`}
      subtitle={cfg.desc} icon={cfg.icon} color={cfg.color}
      onClose={onClose} onSave={save} saving={saving} error={error}>
      <div className="grid grid-cols-2 gap-3">
        <FI label="Jina Kamili" required value={form.name} onChange={set("name")} />
        <FI label="Namba ya Badge / Service" required value={form.badgeNo} onChange={set("badgeNo")} disabled={isEdit} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FS label="Cheo / Rank" value={form.rank} onChange={set("rank")}>
          {[...COMMAND_RANKS, ...["Chief Inspector","Inspector"]].map(r => <option key={r} value={r}>{r}</option>)}
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
      {(tab === "regional" || tab === "district" || tab === "station") && (
        <ScopeFields region={form.region} district={form.district}
          onRegion={v => setForm(f => ({ ...f, region: v, district: "" }))}
          onDistrict={v => setForm(f => ({ ...f, district: v }))}
          showDistrict={tab !== "regional"} />
      )}
      {tab === "national" && (
        <div className="rounded-xl border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 p-3 space-y-3">
          <p className="text-[11px] font-bold text-[#1E3A8A]">Taarifa za Kamanda wa Taifa</p>
          <FI label="Mkurugenzi / Directorate" value={form.directorate} onChange={set("directorate")} placeholder="e.g. Criminal Investigations" />
          <FI label="Tarehe ya Uteuzi" value={form.appointment} onChange={set("appointment")} type="date" />
        </div>
      )}
    </FormModal>
  );
}
