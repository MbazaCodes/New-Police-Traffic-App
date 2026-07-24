// @ts-nocheck
"use client";
// Officers Management — Traffic / General / Post sub-pages

import { useState } from "react";
import { Car, Shield, MapPin, Users } from "lucide-react";
import {
  PageHeader, SearchBar, DataTable, FormModal,
  Avatar, StatusBadge, RoleBadge, ActionCell,
  FI, FS, ScopeFields, useDeleteRecord,
  TZ_POLICE_RANKS, authFetch, toast, useApiData,
  lbl, sel,
} from "./mgmt-shared";
import { TZ_ZONE_NAMES, regionsForZone, districtsForRegion } from "@/lib/tz-locations";

type Tab = "traffic" | "general" | "post";

const TAB_CFG = {
  traffic: { label: "Trafiki",       color: "#FF9800", role: "officer-traffic", icon: Car,    desc: "Maafisa wa Usalama Barabarani" },
  general: { label: "Kawaida",       color: "#1E3A8A", role: "officer-general", icon: Shield, desc: "Polisi wa Kawaida (General Duty)" },
  post:    { label: "Posti / Kituo", color: "#10B981", role: "post-officer",    icon: MapPin, desc: "Maafisa wa Vituo vya Ukaguzi" },
};

export function MgmtOfficers() {
  const [tab, setTab]       = useState<Tab>("traffic");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<any>(null);

  const cfg = TAB_CFG[tab];
  const url = `/api/officers?role=${cfg.role}&limit=200${search ? `&search=${encodeURIComponent(search)}` : ""}`;
  const { data, loading, refetch } = useApiData<any>(url, undefined, [tab, search], { refreshMs: 30000 });
  const { deleting, handleDelete } = useDeleteRecord("/api/officers", refetch);

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("sw-TZ") : "—";

  const columns = [
    { key: "name",   label: "Jina", render: (_: any, r: any) => (
      <div className="flex items-center gap-2">
        <Avatar name={r.name || "?"} color={cfg.color} />
        <div><p className="font-semibold text-police">{r.name}</p>
          <p className="text-[10px] text-police-faint">{r.user?.rank || r.rank || "—"}</p></div>
      </div>
    )},
    { key: "badge_no", label: "Badge", render: (_: any, r: any) => <span className="font-mono text-[11px] text-police-faint">{r.badge_no || r.user?.badge_no || "—"}</span> },
    { key: "station", label: "Kituo", render: (_: any, r: any) => r.station?.name || "—" },
    { key: "region",  label: "Mkoa",  render: (_: any, r: any) => r.user?.region || r.region || "—" },
    { key: "phone",   label: "Simu",  render: (_: any, r: any) => r.user?.phone || r.phone || "—" },
    { key: "status",  label: "Hali",  render: (_: any, r: any) => <StatusBadge status={r.status || r.user?.status || "active"} /> },
    { key: "created_at", label: "Tarehe", render: (_: any, r: any) => <span className="text-police-faint">{fmtDate(r.created_at)}</span> },
    { key: "_actions", label: "Vitendo", render: (_: any, r: any) => (
      <ActionCell id={r.id} name={r.name} deleting={deleting}
        onEdit={() => { setEditing(r); setShowForm(true); }}
        onDelete={handleDelete} />
    )},
  ];

  return (
    <div className="space-y-5 p-5">
      <PageHeader title="Usimamizi wa Maafisa" subtitle="Simamia maafisa wa trafiki, kawaida na posti"
        color="#2196F3" icon={Users}
        onAdd={() => { setEditing(null); setShowForm(true); }} addLabel={`Ongeza Afisa wa ${cfg.label}`} />

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-police-soft pb-3">
        {(Object.entries(TAB_CFG) as [Tab, typeof TAB_CFG[Tab]][]).map(([key, c]) => {
          const Icon = c.icon;
          return (
            <button key={key} onClick={() => { setTab(key); setSearch(""); }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-bold transition ${tab === key ? "text-white shadow-sm" : "text-police-muted hover:bg-police-soft"}`}
              style={tab === key ? { backgroundColor: c.color } : {}}>
              <Icon size={14} /> {c.label}
            </button>
          );
        })}
      </div>

      {/* Tab description */}
      <div className="flex items-center gap-3 rounded-xl p-3 text-[12px]"
        style={{ backgroundColor: `${cfg.color}08`, border: `1px solid ${cfg.color}20` }}>
        <cfg.icon size={16} style={{ color: cfg.color }} />
        <span className="text-police">{cfg.desc} · <strong style={{ color: cfg.color }}>{data.length}</strong> wamesajiliwa</span>
      </div>

      <SearchBar value={search} onChange={setSearch} onClear={() => setSearch("")}
        placeholder={`Tafuta ${cfg.label.toLowerCase()} kwa jina, badge...`} />

      <DataTable columns={columns} data={data} loading={loading}
        emptyLabel={`Hakuna maafisa wa ${cfg.label} bado`}
        onAdd={() => { setEditing(null); setShowForm(true); }} />

      {showForm && (
        <OfficerForm editing={editing} tab={tab} cfg={cfg}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); refetch(); }} />
      )}
    </div>
  );
}

function OfficerForm({ editing, tab, cfg, onClose, onSaved }: any) {
  const isEdit = !!editing;
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [zone, setZone]     = useState("");
  const [form, setForm] = useState({
    name:     editing?.name     || "",
    badgeNo:  editing?.badge_no || editing?.user?.badge_no || "",
    rank:     editing?.rank     || editing?.user?.rank     || "Constable",
    phone:    editing?.phone    || editing?.user?.phone    || "",
    email:    editing?.email    || editing?.user?.email    || "",
    region:   editing?.region   || editing?.user?.region   || "",
    district: editing?.unit     || editing?.user?.unit     || "",
    status:   editing?.status   || "active",
    // Post-specific
    postName: editing?.post?.name || "",
    shiftPattern: "",
    checkpointLocation: "",
    // Traffic-specific
    beatArea: "",
    vehicleAssigned: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<any>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setError(null);
    if (!form.name.trim())   { setError("Jina linahitajika"); return; }
    if (!form.badgeNo.trim()){ setError("Badge inahitajika"); return; }
    setSaving(true);
    const payload: any = {
      name: form.name.trim(), badgeNo: form.badgeNo.trim(),
      rank: form.rank, phone: form.phone || null, email: form.email || null,
      region: form.region || null, unit: form.district || null,
      status: form.status, role: cfg.role,
    };
    // Tab-specific extras stored in notes
    if (tab === "post")    payload.notes = `Checkpoint: ${form.checkpointLocation} | Zamu: ${form.shiftPattern}`;
    if (tab === "traffic") payload.notes = `Beat: ${form.beatArea} | Gari: ${form.vehicleAssigned}`;

    const ep = isEdit ? `/api/officers/${editing.id}` : "/api/officers";
    const method = isEdit ? "PATCH" : "POST";
    const { error: e } = await authFetch(ep, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (e) { setError(e); return; }
    toast({ title: isEdit ? "Imesasishwa ✓" : "Ameongezwa ✓", description: form.name });
    onSaved();
  };

  return (
    <FormModal title={isEdit ? "Hariri Afisa" : `Ongeza Afisa wa ${cfg.label}`}
      subtitle={cfg.desc} icon={cfg.icon} color={cfg.color}
      onClose={onClose} onSave={save} saving={saving} error={error}>

      <div className="grid grid-cols-2 gap-3">
        <FI label="Jina Kamili" required value={form.name} onChange={set("name")} placeholder="Jina la afisa" />
        <FI label="Namba ya Badge" required value={form.badgeNo} onChange={set("badgeNo")} placeholder="TPF-001" disabled={isEdit} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Cheo / Rank</label>
          <select value={form.rank} onChange={set("rank")} className={sel}>
            {TZ_POLICE_RANKS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl}>Hali</label>
          <select value={form.status} onChange={set("status")} className={sel}>
            <option value="active">Kazini</option>
            <option value="on-leave">Mapumziko</option>
            <option value="off-duty">Nje ya Kazi</option>
            <option value="suspended">Amesimamishwa</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FI label="Simu" value={form.phone} onChange={set("phone")} placeholder="+255 7XX XXX XXX" />
        <FI label="Barua Pepe" value={form.email} onChange={set("email")} placeholder="afisa@police.go.tz" />
      </div>

      {/* Zone → Region → District */}
      <div>
        <label className={lbl}>Kanda / Zone</label>
        <select value={zone} onChange={e => { setZone(e.target.value); setForm(f => ({ ...f, region: "", district: "" })); }} className={sel}>
          <option value="">— Chagua Kanda —</option>
          {TZ_ZONE_NAMES.map(z => <option key={z} value={z}>{z}</option>)}
        </select>
      </div>
      <ScopeFields region={form.region} district={form.district}
        onRegion={v => setForm(f => ({ ...f, region: v, district: "" }))}
        onDistrict={v => setForm(f => ({ ...f, district: v }))} />

      {/* Tab-specific fields */}
      {tab === "traffic" && (
        <div className="rounded-xl border border-[#FF9800]/20 bg-[#FF9800]/5 p-3 space-y-3">
          <p className="text-[11px] font-bold text-[#FF9800]">Taarifa za Trafiki</p>
          <div className="grid grid-cols-2 gap-3">
            <FI label="Eneo la Doria (Beat)" value={form.beatArea} onChange={set("beatArea")} placeholder="e.g. Kariakoo – Msimbazi" />
            <FI label="Gari Alilonalo" value={form.vehicleAssigned} onChange={set("vehicleAssigned")} placeholder="e.g. TPF-T001" />
          </div>
        </div>
      )}
      {tab === "post" && (
        <div className="rounded-xl border border-[#10B981]/20 bg-[#10B981]/5 p-3 space-y-3">
          <p className="text-[11px] font-bold text-[#10B981]">Taarifa za Posti</p>
          <FI label="Mahali pa Checkpoint" value={form.checkpointLocation} onChange={set("checkpointLocation")} placeholder="e.g. Checkpoint Kikwete, Ubungo" />
          <FI label="Mpangilio wa Zamu" value={form.shiftPattern} onChange={set("shiftPattern")} placeholder="e.g. 06:00–18:00" />
        </div>
      )}
    </FormModal>
  );
}
