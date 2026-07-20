"use client";

import { useState, useEffect } from "react";
import { Search, X, Shield, AlertTriangle, ChevronRight, Plus, Save, Loader2 } from "lucide-react";
import { useApiData } from "@/hooks/use-api-data";
import { authFetch } from "@/lib/client-auth";
import { toast } from "@/hooks/use-toast";
import { TZ_ZONE_NAMES, regionsForZone, districtsForRegion, TZ_POLICE_RANKS } from "@/lib/tz-locations";

// ── Officer categories → system roles ────────────────────────────
// Selecting a category filters the system-role list. The role decides
// which panel/PWA the officer lands in at login:
//   officer-traffic  → /officer/traffic (Traffic Officer PWA)
//   officer-general  → /officer/general (General Police PWA)
//   post-officer     → /officer/post
//   cid roles        → /cid
//   commissioners    → /command/*
const OFFICER_CATEGORIES: { value: string; label: string; roles: { value: string; label: string }[] }[] = [
  {
    value: "trafiki", label: "Askari wa Usalama Barabarani (Trafiki)",
    roles: [{ value: "officer-traffic", label: "Traffic Officer — PWA ya Trafiki" }],
  },
  {
    value: "kawaida", label: "Polisi wa Kawaida (General Duty)",
    roles: [{ value: "officer-general", label: "General Officer — PWA ya Polisi" }],
  },
  {
    value: "posti", label: "Afisa wa Posti / Kituo cha Ukaguzi",
    roles: [{ value: "post-officer", label: "Post Officer" }],
  },
  {
    value: "upelelezi", label: "Upelelezi (CID)",
    roles: [
      { value: "cid-officer", label: "CID Officer" },
      { value: "investigator", label: "Investigator" },
    ],
  },
  {
    value: "kamandi", label: "Kamandi (Command)",
    roles: [
      { value: "station-commissioner",  label: "OCS — Kamanda wa Kituo" },
      { value: "district-commissioner", label: "OCD — Kamanda wa Wilaya" },
      { value: "regional-commissioner", label: "RPC — Kamanda wa Mkoa" },
      { value: "national-commissioner", label: "Kamanda wa Kitaifa" },
    ],
  },
];

type Officer = {
  id: string; name: string; officer_number: string; rank: string; status: string;
  station?: { id: string; name: string; region: string } | null;
  user?: { email: string | null; phone: string | null; photo_url: string | null; unit: string | null; badge_no: string | null } | null;
};

type StationOption = { id: string; name: string; region?: string | null; district?: string | null };

const STATUS_STYLES: Record<string, string> = {
  active:    "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30",
  break:     "bg-[#FF9800]/15 text-[#FF9800] border border-[#FF9800]/30",
  "off-duty":"bg-gray-500/15 text-gray-500 border border-gray-500/30",
};
const STATUS_LABEL: Record<string, string> = { active:"Kazini", break:"Mapumziko", "off-duty":"Ametoka" };
const STATUS_FILTERS = [
  { id:"all", label:"Wote" }, { id:"active", label:"Kazini" },
  { id:"break", label:"Mapumziko" }, { id:"off-duty", label:"Ametoka" },
] as const;

export function AdminOfficers() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Officer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: officers, loading, error, refetch } = useApiData<Officer>(
    "/api/officers",
    { ...(statusFilter !== "all" ? { status: statusFilter } : {}), ...(query ? { search: query } : {}) },
    [query, statusFilter]
  );

  const activeCount = officers.filter((o) => o.status === "active").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[22px] font-black text-police">Maofisa</h1>
          <p className="text-[12px] text-police-muted">{officers.length} maofisa wote • {activeCount} kazini sasa</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-[#2196F3] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm hover:bg-[#1E88E5] active:scale-95 transition"
        >
          <Plus size={16} /> Ongeza Afisa
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label:"Wote",      value: officers.length,                                          color:"#2196F3" },
          { label:"Kazini",    value: officers.filter(o=>o.status==="active").length,           color:"#10B981" },
          { label:"Mapumziko", value: officers.filter(o=>o.status==="break").length,            color:"#FF9800" },
          { label:"Wametoka",  value: officers.filter(o=>o.status==="off-duty").length,         color:"#6B7280" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-police-card p-4 shadow-sm">
            <p className="text-[22px] font-black leading-none" style={{ color: s.color }}>{s.value}</p>
            <p className="mt-1 text-[11px] text-police-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-police-card p-3 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2 rounded-lg bg-police-input px-3 py-2">
            <Search size={14} className="shrink-0 text-police-faint" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tafuta jina, badge, au kituo..."
              className="flex-1 bg-transparent text-[13px] text-police placeholder-police-faint focus:outline-none" />
            {query && <button onClick={() => setQuery("")} className="text-police-faint"><X size={14} /></button>}
          </div>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button key={f.id} onClick={() => setStatusFilter(f.id)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition ${statusFilter===f.id ? "bg-[#2196F3] text-white" : "bg-police-input text-police-muted hover:text-police"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-police-card shadow-sm">
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#2196F3] border-t-transparent" />
            <span className="text-[13px] text-police-muted">Inapakia maofisa...</span>
          </div>
        )}
        {!loading && error && (
          <div className="flex flex-col items-center py-12 text-center">
            <AlertTriangle size={32} className="text-[#EF4444]" />
            <p className="mt-2 text-[13px] font-semibold text-[#EF4444]">{error}</p>
            <button onClick={refetch} className="mt-3 rounded-xl bg-[#2196F3] px-4 py-2 text-[12px] text-white">Jaribu Tena</button>
          </div>
        )}
        {!loading && !error && officers.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center px-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2196F3]/10">
              <Shield size={32} className="text-[#2196F3] opacity-60" />
            </div>
            <p className="mt-4 text-[15px] font-bold text-police">Hakuna Maofisa Bado</p>
            <p className="mt-1 text-[12px] text-police-muted max-w-xs">Mfumo umeanza upya. Bonyeza &quot;Ongeza Afisa&quot; kuanza kuingiza maofisa.</p>
          </div>
        )}
        {!loading && !error && officers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-[12px]">
              <thead>
                <tr className="border-b border-police-soft bg-police-muted/30 text-[10px] uppercase text-police-faint">
                  <th className="px-4 py-3 font-semibold">Jina / Cheo</th>
                  <th className="px-4 py-3 font-semibold">Badge No</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">Kitengo</th>
                  <th className="px-4 py-3 font-semibold hidden sm:table-cell">Kituo</th>
                  <th className="px-4 py-3 font-semibold">Hadhi</th>
                  <th className="px-4 py-3 font-semibold hidden lg:table-cell">Simu</th>
                  <th className="px-4 py-3 text-right font-semibold">Hatua</th>
                </tr>
              </thead>
              <tbody>
                {officers.map((o) => (
                  <tr key={o.id} onClick={() => setSelected(o)}
                    className="cursor-pointer border-b border-police-soft transition hover:bg-police-muted/30 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2196F3]/15 text-[11px] font-bold text-[#2196F3]">
                          {o.name.split(" ").slice(0,2).map((n)=>n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-police">{o.name}</p>
                          <p className="text-[10px] text-police-faint">{o.rank}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-police-muted">{o.officer_number}</td>
                    <td className="px-4 py-3 text-police-muted hidden md:table-cell">{o.user?.unit ?? "—"}</td>
                    <td className="px-4 py-3 text-police-muted hidden sm:table-cell">{o.station?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[o.status] ?? ""}`}>
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-police-muted hidden lg:table-cell">{o.user?.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={(e)=>{e.stopPropagation();setSelected(o)}}
                        className="flex items-center gap-1 rounded-lg bg-[#2196F3]/10 px-2.5 py-1.5 text-[11px] font-semibold text-[#2196F3] hover:bg-[#2196F3]/20 transition">
                        Angalia <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Officer detail panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={() => setSelected(null)}>
          <div className="relative w-full max-w-md rounded-2xl bg-police-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute right-4 top-4 text-police-muted hover:text-police">
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2196F3]/15 text-[16px] font-bold text-[#2196F3]">
                {selected.name.split(" ").slice(0,2).map((n)=>n[0]).join("")}
              </div>
              <div>
                <p className="text-[16px] font-bold text-police">{selected.name}</p>
                <p className="text-[12px] text-police-muted">{selected.rank} • {selected.officer_number}</p>
              </div>
            </div>
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between"><span className="text-police-muted">Kituo</span><span className="text-police font-medium">{selected.station?.name ?? "—"}</span></div>
              <div className="flex justify-between"><span className="text-police-muted">Kitengo</span><span className="text-police font-medium">{selected.user?.unit ?? "—"}</span></div>
              <div className="flex justify-between"><span className="text-police-muted">Simu</span><span className="text-police font-medium">{selected.user?.phone ?? "—"}</span></div>
              <div className="flex justify-between"><span className="text-police-muted">Barua Pepe</span><span className="text-police font-medium">{selected.user?.email ?? "—"}</span></div>
              <div className="flex justify-between"><span className="text-police-muted">Hadhi</span>
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[selected.status] ?? ""}`}>
                  {STATUS_LABEL[selected.status] ?? selected.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Officer Modal ─────────────────────────────── */}
      {showAddModal && (
        <AddOfficerModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); refetch(); }}
        />
      )}
    </div>
  );
}

// ── Add Officer Modal Component ──────────────────────────────────────

function AddOfficerModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [stations, setStations] = useState<StationOption[]>([]);

  const [name, setName] = useState("");
  const [rank, setRank] = useState("Constable");
  const [category, setCategory] = useState("trafiki");
  const [officerRole, setOfficerRole] = useState("officer-traffic");
  const [badgeNo, setBadgeNo] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Cascading posting selection: Zone -> Region -> District -> Station
  const [zone, setZone]         = useState("");
  const [region, setRegion]     = useState("");
  const [district, setDistrict] = useState("");
  const [stationId, setStationId] = useState("");

  // Load stations on mount (keep region/district for cascading filter)
  useEffect(() => {
    fetch("/api/stations")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          setStations(json.data.map((s: { id: string; name: string; region?: string; district?: string }) =>
            ({ id: s.id, name: s.name, region: s.region ?? null, district: s.district ?? null })));
        }
      })
      .catch(() => {});
  }, []);

  // Options derived from the cascade
  const regionOptions   = zone ? regionsForZone(zone) : [];
  const districtOptions = region ? districtsForRegion(region) : [];

  // Stations filtered by selected region/district; fall back to full list if no match
  const stationMatches = stations.filter((s) => {
    if (district && s.district && s.district !== district) return false;
    if (region && s.region && s.region !== region) return false;
    return true;
  });
  const stationOptions = region && stationMatches.length > 0 ? stationMatches : stations;

  // Cascade resets — changing a parent clears its children
  function onZoneChange(v: string)     { setZone(v); setRegion(""); setDistrict(""); setStationId(""); }
  function onRegionChange(v: string)   { setRegion(v); setDistrict(""); setStationId(""); }
  function onDistrictChange(v: string) { setDistrict(v); setStationId(""); }

  async function handleSubmit() {
    setFormError(null);

    if (!name.trim()) { setFormError("Jina la afisa linahitajika"); return; }
    if (!badgeNo.trim()) { setFormError("Namba ya badge inahitajika"); return; }
    if (!zone) { setFormError("Tafadhali chagua kanda"); return; }
    if (!region) { setFormError("Tafadhali chagua mkoa"); return; }
    if (!stationId) { setFormError("Tafadhali chagua kituo"); return; }

    setSaving(true);
    const { error } = await authFetch("/api/officers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        rank,
        badgeNo: badgeNo.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        stationId,
        region,
        unit: district || undefined,
        role: officerRole,
      }),
    });
    setSaving(false);

    if (error) {
      setFormError(error);
      return;
    }

    toast({ title: "Afisa ameongezwa", description: `${name.trim()} ameongezwa kwenye mfumo` });
    onSaved();
  }

  const fields: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string; required?: boolean }[] = [
    { label: "Jina *", value: name, onChange: setName, placeholder: "Mfano: John Mwenda", required: true },
    { label: "Namba ya Badge *", value: badgeNo, onChange: setBadgeNo, placeholder: "Mfano: TPF-1234", required: true },
    { label: "Simu", value: phone, onChange: setPhone, placeholder: "Mfano: +255 700 000 000", type: "tel" },
    { label: "Barua Pepe", value: email, onChange: setEmail, placeholder: "Mfano: afisa@police.go.tz", type: "email" },
  ];

  const selectCls = "w-full rounded-xl border border-police-soft bg-police px-3 py-2.5 text-[13px] text-police focus:outline-none focus:border-[#2196F3] disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={onClose}>
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl bg-police-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 text-police-muted hover:text-police">
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2196F3]/15 text-[#2196F3]">
            <Shield size={18} />
          </div>
          <div>
            <p className="text-[15px] font-bold text-police">Ongeza Afisa Mpya</p>
            <p className="text-[11px] text-police-faint">Jaza taarifa za afisa mpya</p>
          </div>
        </div>

        {formError && (
          <div className="mb-4 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 px-3 py-2.5 text-[12px] text-[#EF4444]">
            {formError}
          </div>
        )}

        <div className="space-y-3">
          {fields.map(({ label, value, onChange, placeholder, type }) => (
            <div key={label}>
              <label className="mb-1 block text-[11px] font-bold text-police-muted uppercase tracking-wide">{label}</label>
              <input
                type={type ?? "text"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-police-soft bg-police px-3 py-2.5 text-[13px] text-police placeholder-police-faint focus:outline-none focus:border-[#2196F3]"
              />
            </div>
          ))}

          {/* Rank dropdown */}
          <div>
            <label className="mb-1 block text-[11px] font-bold text-police-muted uppercase tracking-wide">Nafasi / Cheo</label>
            <select value={rank} onChange={(e) => setRank(e.target.value)} className={selectCls}>
              {TZ_POLICE_RANKS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Category → System Role: decides which panel/PWA opens at login */}
          <div>
            <label className="mb-1 block text-[11px] font-bold text-police-muted uppercase tracking-wide">Kundi / Category *</label>
            <select
              value={category}
              onChange={(e) => {
                const cat = e.target.value;
                setCategory(cat);
                // Category triggers role: auto-select the first role of the category
                const roles = OFFICER_CATEGORIES.find((x) => x.value === cat)?.roles ?? [];
                setOfficerRole(roles[0]?.value ?? "officer-general");
              }}
              className={selectCls}
            >
              {OFFICER_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold text-police-muted uppercase tracking-wide">Aina ya Nafasi (System Role) *</label>
            <select value={officerRole} onChange={(e) => setOfficerRole(e.target.value)} className={selectCls}>
              {(OFFICER_CATEGORIES.find((x) => x.value === category)?.roles ?? []).map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <p className="mt-1 text-[10px] text-police-faint">
              Nafasi hii ndiyo inaamua paneli/PWA atakayofunguliwa afisa akiingia
            </p>
          </div>

          {/* ── Posting: Zone → Region → District → Station (cascading) ── */}
          <div className="pt-2 border-t border-police-soft">
            <p className="text-[11px] font-black text-police-muted uppercase tracking-wide">Kituo cha Kazi</p>
            <p className="text-[10px] text-police-faint">Chagua Kanda kwanza — Mkoa, Wilaya na Kituo vitafunguka hatua kwa hatua</p>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold text-police-muted uppercase tracking-wide">Kanda / Zone *</label>
            <select value={zone} onChange={(e) => onZoneChange(e.target.value)} className={selectCls}>
              <option value="">— Chagua Kanda —</option>
              {TZ_ZONE_NAMES.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold text-police-muted uppercase tracking-wide">Mkoa / Region *</label>
            <select value={region} onChange={(e) => onRegionChange(e.target.value)} disabled={!zone} className={selectCls}>
              <option value="">{zone ? "— Chagua Mkoa —" : "Chagua Kanda kwanza"}</option>
              {regionOptions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold text-police-muted uppercase tracking-wide">Wilaya / District</label>
            <select value={district} onChange={(e) => onDistrictChange(e.target.value)} disabled={!region} className={selectCls}>
              <option value="">{region ? "— Chagua Wilaya —" : "Chagua Mkoa kwanza"}</option>
              {districtOptions.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold text-police-muted uppercase tracking-wide">Kituo / Station *</label>
            <select value={stationId} onChange={(e) => setStationId(e.target.value)} disabled={!region} className={selectCls}>
              <option value="">{region ? "— Chagua Kituo —" : "Chagua Mkoa kwanza"}</option>
              {stationOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}{s.region ? ` (${s.region})` : ""}
                </option>
              ))}
            </select>
            {region && stationMatches.length === 0 && stations.length > 0 && (
              <p className="mt-1 text-[10px] text-[#FF9800]">Hakuna kituo kilichosajiliwa kwenye mkoa huu — vituo vyote vinaonyeshwa</p>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-xl bg-police-input py-2.5 text-[13px] font-semibold text-police-navy hover:bg-police-muted transition disabled:opacity-60"
          >
            Ghairi
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#2196F3] py-2.5 text-[13px] font-bold text-white hover:bg-[#1E88E5] transition active:scale-95 disabled:opacity-60"
          >
            {saving ? <><Loader2 size={14} className="animate-spin" /> Inahifadhi...</> : <><Save size={14} /> Hifadhi</>}
          </button>
        </div>
      </div>
    </div>
  );
}