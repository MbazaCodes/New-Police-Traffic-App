// @ts-nocheck
"use client";
// Admin Clerks Management — Simamia Makarani
// Admin creates and manages the 3-tier clerk hierarchy:
//   National Clerk → manages all, creates Regional + District Clerks
//   Regional Clerk → manages their region, creates District Clerks
//   District Clerk → data entry for their district only

import { useState, useCallback } from "react";
import {
  Search, X, Plus, Loader2, RefreshCw, Users,
  Globe2, MapPin, Building2, ChevronDown, ChevronUp,
  Pencil, Trash2, CheckCircle, AlertCircle, Save,
  Database, Shield,
} from "lucide-react";
import { useApiData } from "@/hooks/use-api-data";
import { authFetch } from "@/lib/client-auth";
import { toast } from "@/hooks/use-toast";
import { TZ_ALL_REGIONS, districtsForRegion } from "@/lib/tz-locations";

// ── Clerk role config ────────────────────────────────────────────────
const CLERK_ROLES = [
  {
    value: "national-clerk",
    label: "Karani wa Taifa",
    sublabel: "National Clerk",
    color: "#1E3A8A",
    bg: "#1E3A8A",
    icon: Globe2,
    desc: "Anasimamia makarani wote nchi nzima. Anaweza kuunda Makarani wa Mkoa na Wilaya.",
    canCreate: ["regional-clerk", "district-clerk"],
    scope: "Nchi Nzima",
  },
  {
    value: "regional-clerk",
    label: "Karani wa Mkoa",
    sublabel: "Regional Clerk",
    color: "#10B981",
    bg: "#10B981",
    icon: MapPin,
    desc: "Anasimamia mkoa wake. Anaweza kuunda Makarani wa Wilaya katika mkoa wake.",
    canCreate: ["district-clerk"],
    scope: "Mkoa",
  },
  {
    value: "district-clerk",
    label: "Karani wa Wilaya",
    sublabel: "District Clerk",
    color: "#FF9800",
    bg: "#FF9800",
    icon: Building2,
    desc: "Anafanya kazi ya uingizaji data kwa wilaya yake peke yake.",
    canCreate: [],
    scope: "Wilaya",
  },
];

const ROLE_COLOR: Record<string, string> = {
  "national-clerk": "#1E3A8A",
  "regional-clerk": "#10B981",
  "district-clerk": "#FF9800",
  "clerk":          "#2196F3",
};

const ROLE_LABEL: Record<string, string> = {
  "national-clerk": "Karani wa Taifa",
  "regional-clerk": "Karani wa Mkoa",
  "district-clerk": "Karani wa Wilaya",
  "clerk":          "Karani",
};

type ClerkRow = {
  id: string; name: string; badge_no: string; role: string;
  region?: string; unit?: string; phone?: string; email?: string;
  status: string; created_at: string; station?: { name: string } | null;
};

// ── Main Component ────────────────────────────────────────────────────
export function AdminClerks() {
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAdd, setShowAdd]       = useState(false);
  const [editing, setEditing]       = useState<ClerkRow | null>(null);
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [deleting, setDeleting]     = useState<string | null>(null);

  const url = `/api/users?roles=national-clerk,regional-clerk,district-clerk,clerk&limit=200${roleFilter !== "all" ? `&role=${roleFilter}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
  const { data: clerks, loading, refetch } = useApiData<ClerkRow>(url, undefined, [roleFilter, search], { refreshMs: 30000 });

  // Stats per tier
  const national = clerks.filter(c => c.role === "national-clerk").length;
  const regional = clerks.filter(c => c.role === "regional-clerk").length;
  const district = clerks.filter(c => c.role === "district-clerk").length;
  const general  = clerks.filter(c => c.role === "clerk").length;

  const handleDelete = async (clerk: ClerkRow) => {
    if (!confirm(`Una uhakika kutaka kufuta akaunti ya ${clerk.name}? Hatua hii haiwezi kutenduliwa.`)) return;
    setDeleting(clerk.id);
    const { error } = await authFetch(`/api/officers/${clerk.id}`, { method: "DELETE" });
    setDeleting(null);
    if (error) { toast({ title: "Hitilafu", description: error, variant: "destructive" }); return; }
    toast({ title: "Imefutwa ✓", description: `Akaunti ya ${clerk.name} imefutwa` });
    refetch();
  };

  return (
    <div className="space-y-5 p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-black text-police">Simamia Makarani</h1>
          <p className="text-[13px] text-police-muted">Unda na simamia hierarchy ya makarani wa data</p>
        </div>
        <button onClick={() => { setShowAdd(true); setEditing(null); }}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-[#1E3A8A] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm hover:bg-[#1E3A8A]/90">
          <Plus size={15} /> Ongeza Karani
        </button>
      </div>

      {/* Tier overview cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Karani wa Taifa",  count: national, color: "#1E3A8A", icon: Globe2,     role: "national-clerk" },
          { label: "Karani wa Mkoa",   count: regional, color: "#10B981", icon: MapPin,     role: "regional-clerk" },
          { label: "Karani wa Wilaya", count: district, color: "#FF9800", icon: Building2,  role: "district-clerk" },
          { label: "Karani (Jumla)",   count: general,  color: "#2196F3", icon: Database,   role: "clerk" },
        ].map(s => (
          <button key={s.role}
            onClick={() => setRoleFilter(roleFilter === s.role ? "all" : s.role)}
            className={`flex flex-col rounded-2xl border-2 bg-police-card p-4 text-left shadow-sm transition hover:shadow-md ${roleFilter === s.role ? "" : "border-transparent"}`}
            style={roleFilter === s.role ? { borderColor: s.color } : {}}>
            <s.icon size={18} style={{ color: s.color }} />
            <span className="mt-2 text-[24px] font-black" style={{ color: s.color }}>{s.count}</span>
            <span className="text-[10px] leading-tight text-police-muted">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Tier description cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {CLERK_ROLES.map(role => {
          const Icon = role.icon;
          return (
            <div key={role.value} className="rounded-2xl border-l-4 bg-police-card p-4 shadow-sm" style={{ borderColor: role.color }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${role.color}15` }}>
                  <Icon size={18} style={{ color: role.color }} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-police">{role.label}</p>
                  <span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ backgroundColor: role.color }}>{role.scope}</span>
                </div>
              </div>
              <p className="text-[11px] text-police-muted">{role.desc}</p>
              {role.canCreate.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {role.canCreate.map(r => (
                    <span key={r} className="rounded-full border px-2 py-0.5 text-[9px] font-semibold text-police-muted" style={{ borderColor: `${ROLE_COLOR[r]}40` }}>
                      Huunda: {ROLE_LABEL[r]}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-police bg-police-card px-3">
          <Search size={15} className="shrink-0 text-police-faint" />
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Escape" && setSearch("")}
            placeholder="Tafuta kwa jina, badge, mkoa..."
            className="h-10 flex-1 bg-transparent text-[13px] text-police focus:outline-none" />
          {search && <button onClick={() => setSearch("")}><X size={13} className="text-police-faint" /></button>}
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="rounded-xl border border-police bg-police-card px-3 h-10 text-[13px] text-police focus:outline-none">
          <option value="all">Aina Zote</option>
          <option value="national-clerk">Karani wa Taifa</option>
          <option value="regional-clerk">Karani wa Mkoa</option>
          <option value="district-clerk">Karani wa Wilaya</option>
          <option value="clerk">Karani</option>
        </select>
        <button onClick={() => refetch()} className="rounded-xl bg-police-soft p-2 text-police-muted hover:text-police">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Clerks table */}
      <div className="rounded-2xl bg-police-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="border-b border-police-soft bg-police-muted/30">
              <tr>
                {["Jina", "Badge", "Aina", "Mkoa / Wilaya", "Simu", "Barua Pepe", "Hali", "Tarehe Usajili", "Vitendo"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-police-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-police-soft">
              {loading
                ? Array(5).fill(0).map((_, i) => (
                  <tr key={i}>{Array(9).fill(0).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-3 w-20 animate-pulse rounded bg-police-soft" /></td>
                  ))}</tr>
                ))
                : clerks.length === 0
                  ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Database size={32} className="text-police-faint" />
                          <p className="text-[14px] font-bold text-police">Hakuna makarani bado</p>
                          <p className="text-[12px] text-police-muted">Anza kwa kuunda Karani wa Taifa</p>
                          <button onClick={() => setShowAdd(true)}
                            className="flex items-center gap-2 rounded-xl bg-[#1E3A8A] px-4 py-2 text-[12px] font-bold text-white">
                            <Plus size={14} /> Ongeza Karani wa Kwanza
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                  : clerks.map(clerk => (
                    <tr key={clerk.id} className="hover:bg-police-muted/10 transition">
                      {/* Name + expand */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                            style={{ backgroundColor: ROLE_COLOR[clerk.role] || "#6B7280" }}>
                            {clerk.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-police">{clerk.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-police-faint">{clerk.badge_no || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white whitespace-nowrap"
                          style={{ backgroundColor: ROLE_COLOR[clerk.role] || "#6B7280" }}>
                          {ROLE_LABEL[clerk.role] || clerk.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-police-muted">
                        {clerk.region || "—"}{clerk.unit ? ` / ${clerk.unit}` : ""}
                      </td>
                      <td className="px-4 py-3 text-police-muted">{clerk.phone || "—"}</td>
                      <td className="px-4 py-3 text-police-muted">{clerk.email || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          clerk.status === "active" ? "bg-[#10B981]/15 text-[#10B981]" : "bg-gray-500/15 text-gray-500"
                        }`}>
                          {clerk.status === "active" ? "Kazini" : clerk.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-police-faint whitespace-nowrap">
                        {clerk.created_at ? new Date(clerk.created_at).toLocaleDateString("sw-TZ") : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => { setEditing(clerk); setShowAdd(true); }}
                            className="rounded-lg bg-[#2196F3]/10 p-1.5 text-[#2196F3] hover:bg-[#2196F3]/20">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => handleDelete(clerk)} disabled={deleting === clerk.id}
                            className="rounded-lg bg-[#EF4444]/10 p-1.5 text-[#EF4444] hover:bg-[#EF4444]/20 disabled:opacity-50">
                            {deleting === clerk.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        {clerks.length > 0 && (
          <div className="flex items-center justify-between border-t border-police-soft px-4 py-2">
            <p className="text-[11px] text-police-faint">{clerks.length} makarani · auto-refresh 30s</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showAdd && (
        <ClerkFormModal
          editing={editing}
          onClose={() => { setShowAdd(false); setEditing(null); }}
          onSaved={() => { setShowAdd(false); setEditing(null); refetch(); }}
        />
      )}
    </div>
  );
}

// ── Add / Edit Clerk Modal ────────────────────────────────────────────
function ClerkFormModal({ editing, onClose, onSaved }: {
  editing: ClerkRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!editing;
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const [form, setForm] = useState({
    name:     editing?.name     || "",
    badgeNo:  editing?.badge_no || "",
    phone:    editing?.phone    || "",
    email:    editing?.email    || "",
    role:     editing?.role     || "district-clerk",
    region:   editing?.region   || "",
    district: editing?.unit     || "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const selectedRole = CLERK_ROLES.find(r => r.value === form.role);

  const handleSave = async () => {
    setError(null);
    if (!form.name.trim())   { setError("Jina linahitajika"); return; }
    if (!form.badgeNo.trim()){ setError("Badge inahitajika"); return; }
    if (!form.role)          { setError("Aina ya karani inahitajika"); return; }
    if (form.role === "regional-clerk" && !form.region)  { setError("Mkoa unahitajika kwa Karani wa Mkoa"); return; }
    if (form.role === "district-clerk" && !form.district){ setError("Wilaya inahitajika kwa Karani wa Wilaya"); return; }

    setSaving(true);
    if (isEdit) {
      const { error: e } = await authFetch(`/api/officers/${editing!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          role: form.role,
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          region: form.region || null,
          unit: form.district || null,
        }),
      });
      setSaving(false);
      if (e) { setError(e); return; }
      toast({ title: "Imesasishwa ✓", description: `Taarifa za ${form.name} zimehifadhiwa` });
    } else {
      const { error: e } = await authFetch("/api/officers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:     form.name.trim(),
          badgeNo:  form.badgeNo.trim(),
          phone:    form.phone.trim()  || null,
          email:    form.email.trim()  || null,
          role:     form.role,
          region:   form.region  || null,
          unit:     form.district || null,
          stationId: null,
          rank:     "Clerk",
        }),
      });
      setSaving(false);
      if (e) { setError(e); return; }
      toast({ title: "Karani Ameongezwa ✓", description: `${form.name} amesajiliwa kama ${selectedRole?.label}` });
    }
    onSaved();
  };

  const sel = "w-full rounded-xl border border-police-soft bg-police px-3 h-10 text-[13px] text-police focus:outline-none focus:border-[#1E3A8A]";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center backdrop-blur-sm"
      onClick={onClose}>
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-police-card p-5 shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E3A8A]/10">
            <Database size={20} className="text-[#1E3A8A]" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-police">
              {isEdit ? "Hariri Karani" : "Ongeza Karani Mpya"}
            </h2>
            <p className="text-[11px] text-police-muted">
              {isEdit ? `Sasisha taarifa za ${editing!.name}` : "Jaza taarifa za karani mpya wa data"}
            </p>
          </div>
          <button onClick={onClose} className="ml-auto text-police-faint hover:text-police"><X size={18} /></button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-[#EF4444]/10 px-3 py-2 text-[12px] font-medium text-[#EF4444]">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div className="space-y-3">
          {/* Role selector — the most important field */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-police-muted">Aina ya Karani *</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CLERK_ROLES.map(r => {
                const Icon = r.icon;
                const active = form.role === r.value;
                return (
                  <button key={r.value} type="button"
                    onClick={() => setForm(f => ({ ...f, role: r.value, region: "", district: "" }))}
                    className={`flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 text-center transition ${active ? "text-white" : "border-police-soft bg-police text-police-muted hover:border-police"}`}
                    style={active ? { backgroundColor: r.color, borderColor: r.color } : {}}>
                    <Icon size={18} style={active ? { color: "white" } : { color: r.color }} />
                    <span className="text-[10px] font-bold leading-tight">{r.label.replace("Karani wa ", "")}</span>
                  </button>
                );
              })}
            </div>
            {selectedRole && (
              <div className="mt-2 rounded-xl p-3 text-[11px] text-police-muted" style={{ backgroundColor: `${selectedRole.color}08`, border: `1px solid ${selectedRole.color}20` }}>
                <p className="font-semibold mb-0.5" style={{ color: selectedRole.color }}>{selectedRole.label} — Wigo: {selectedRole.scope}</p>
                <p>{selectedRole.desc}</p>
              </div>
            )}
          </div>

          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-police-muted">Jina Kamili *</label>
              <input value={form.name} onChange={set("name")} placeholder="Jina la karani" className={sel} />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-police-muted">Namba ya Badge *</label>
              <input value={form.badgeNo} onChange={set("badgeNo")} placeholder="e.g. TPF-CL-001" className={sel} disabled={isEdit} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-police-muted">Simu</label>
              <input value={form.phone} onChange={set("phone")} placeholder="+255 7XX XXX XXX" className={sel} />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-police-muted">Barua Pepe</label>
              <input value={form.email} onChange={set("email")} placeholder="karani@police.go.tz" className={sel} />
            </div>
          </div>

          {/* Scope fields — shown based on role */}
          {(form.role === "regional-clerk" || form.role === "district-clerk") && (
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-police-muted">
                Mkoa / Region {form.role === "regional-clerk" ? "*" : "*"}
              </label>
              <select value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value, district: "" }))} className={sel}>
                <option value="">— Chagua Mkoa —</option>
                {TZ_ALL_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          )}

          {form.role === "district-clerk" && (
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-police-muted">Wilaya / District *</label>
              <select value={form.district} onChange={set("district")} disabled={!form.region} className={sel + " disabled:opacity-50"}>
                <option value="">{form.region ? "— Chagua Wilaya —" : "Chagua Mkoa kwanza"}</option>
                {districtsForRegion(form.region).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}

          {/* Scope summary */}
          {(form.region || form.district) && (
            <div className="rounded-xl bg-police-soft px-3 py-2 text-[11px]">
              <p className="text-police-muted">
                Wigo wa kazi:
                {form.role === "district-clerk" && form.district
                  ? <> <strong className="text-police">Wilaya ya {form.district}</strong>, Mkoa wa {form.region}</>
                  : form.role === "regional-clerk" && form.region
                    ? <> <strong className="text-police">Mkoa wa {form.region}</strong> wote</>
                    : " Nchi nzima"
                }
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} disabled={saving}
            className="flex-1 rounded-xl border border-police-soft py-3 text-[13px] font-semibold text-police disabled:opacity-50">
            Ghairi
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] py-3 text-[13px] font-bold text-white disabled:opacity-50">
            {saving
              ? <><Loader2 size={15} className="animate-spin" /> Inahifadhi...</>
              : <><Save size={15} /> {isEdit ? "Hifadhi Mabadiliko" : "Ongeza Karani"}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
