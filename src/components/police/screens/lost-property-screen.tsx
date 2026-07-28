// @ts-nocheck
"use client";
// Mali Zilizopotea / Found — Lost & Found at police post/station
// Records lost items, shows existing reports, allows status updates.

import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, Search, X, Plus, CheckCircle, Clock, Package,
  Loader2, WifiOff, CloudUpload, RefreshCw, AlertCircle,
  Phone, User, Tag, MapPin,
} from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { toast } from "@/hooks/use-toast";
import { useOfficer } from "@/hooks/use-officer";
import { saveWithOfflineSupport, initAutoSync, subscribeToSyncStatus, type SyncStatus } from "@/lib/offline-sync";
import { authFetch } from "@/lib/client-auth";

// ── Category config ──────────────────────────────────────────────────
const CATEGORIES = [
  { value: "simu",        label: "📱 Simu / Kompyuta ndogo" },
  { value: "kompyuta",    label: "💻 Laptop / Kompyuta" },
  { value: "hati",        label: "📄 Hati / Vitambulisho" },
  { value: "fedha",       label: "💰 Pesa / Mkoba" },
  { value: "gari",        label: "🚗 Gari / Usafiri" },
  { value: "pikipiki",    label: "🏍️ Pikipiki / Bajaji" },
  { value: "mzigo",       label: "🎒 Mzigo / Begi" },
  { value: "nguo",        label: "👕 Nguo / Mavazi" },
  { value: "silaha",      label: "🔧 Silaha / Zana" },
  { value: "kipande",     label: "💎 Kito / Thamani" },
  { value: "mali-nyingine", label: "📦 Mali Nyingine" },
];

const STATUS_CONFIG = {
  searching: { label: "Inatafutwa",  color: "#FF9800", bg: "#FF9800" },
  found:     { label: "Imepatikana", color: "#10B981", bg: "#10B981" },
  returned:  { label: "Imerudishwa", color: "#2196F3", bg: "#2196F3" },
  claimed:   { label: "Imedaiwa",    color: "#8B5CF6", bg: "#8B5CF6" },
  unclaimed: { label: "Haijadaiwa",  color: "#6B7280", bg: "#6B7280" },
};

type ItemRow = {
  id: string; item_number: string; category: string; description: string;
  serial_no?: string; device_no?: string; brand?: string; color?: string;
  estimated_value?: string; status: keyof typeof STATUS_CONFIG;
  owner_name?: string; owner_phone?: string; owner_nida?: string;
  station_name?: string; officer_name?: string; reported_date: string;
  found_date?: string; found_location?: string; notes?: string;
};

export function LostPropertyScreen() {
  const OFFICER = useOfficer();
  const { goBack } = usePoliceStore();

  const [tab, setTab]           = useState<"list" | "report">("list");
  const [items, setItems]       = useState<ItemRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<ItemRow | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [savedItem, setSavedItem] = useState<ItemRow | null>(null);

  // Updating status of an existing item
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  // Form state
  const [form, setForm] = useState({
    ownerName: "", ownerPhone: "", ownerNida: "",
    reporterName: "", reporterPhone: "",
    category: "simu", description: "", serialNo: "",
    deviceNo: "", brand: "", color: "", estimatedValue: "",
    station: OFFICER?.station || "", notes: "",
  });

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  // ── Load items ──────────────────────────────────────────────────────
  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/lost-items?${params}`);
      const json = await res.json();
      setItems(json.data ?? []);
    } catch { /* offline — show empty */ }
    setLoading(false);
  }, [statusFilter, search]);

  useEffect(() => { void loadItems(); }, [loadItems]);

  // ── Submit new report ───────────────────────────────────────────────
  const handleReport = async () => {
    if (!form.description.trim()) {
      toast({ title: "Kosa", description: "Jaza maelezo ya mali.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        category:       form.category,
        description:    form.description.trim(),
        serialNo:       form.serialNo.trim() || null,
        deviceNo:       form.deviceNo.trim() || null,
        brand:          form.brand.trim() || null,
        color:          form.color.trim() || null,
        estimatedValue: form.estimatedValue.trim() || null,
        ownerName:      form.ownerName.trim() || null,
        ownerPhone:     form.ownerPhone.trim() || null,
        ownerNida:      form.ownerNida.replace(/\D/g, "") || null,
        reporterName:   form.reporterName.trim() || form.ownerName.trim() || null,
        reporterPhone:  form.reporterPhone.trim() || form.ownerPhone.trim() || null,
        station:        OFFICER?.station || form.station,
        reportedBy:     OFFICER?.shortName || "Afisa",
        notes:          form.notes.trim() || null,
      };

      const result = await saveWithOfflineSupport("/api/lost-items", payload, "POST");

      const saved: ItemRow = {
        id:            result.data?.id || `LI-${Date.now()}`,
        item_number:   result.data?.item_number || `LI-${new Date().getFullYear()}-????`,
        category:      form.category,
        description:   form.description,
        status:        "searching",
        owner_name:    form.ownerName || undefined,
        owner_phone:   form.ownerPhone || undefined,
        station_name:  OFFICER?.station,
        officer_name:  OFFICER?.shortName,
        reported_date: new Date().toISOString().split("T")[0],
      };

      setSavedItem(saved);
      setItems((prev) => [saved, ...prev]);
      setSubmitted(true);

      toast({
        title: result.fromCache ? "Imehifadhiwa (Offline) 💾" : "Ripoti Imesajiliwa ✓",
        description: `${form.category} — ${form.description.slice(0, 40)}`,
      });
    } catch (err: any) {
      toast({ title: "Hitilafu", description: err.message || "Imeshindikana.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Update status ────────────────────────────────────────────────────
  const handleStatusUpdate = async (item: ItemRow, newStatus: string) => {
    setUpdatingId(item.id);
    const { error } = await authFetch(`/api/lost-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status:        newStatus,
        foundDate:     newStatus === "found" ? new Date().toISOString().split("T")[0] : undefined,
        foundLocation: newStatus === "found" ? OFFICER?.station : undefined,
      }),
    });
    setUpdatingId(null);
    if (error) {
      toast({ title: "Hitilafu", description: error, variant: "destructive" });
      return;
    }
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, status: newStatus as any } : i));
    setSelected(null);
    toast({ title: "Imesasishwa", description: `Hali imebadilishwa kuwa ${STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG]?.label}` });
  };

  // ── Reset form ────────────────────────────────────────────────────────
  const resetForm = () => {
    setForm({ ownerName:"",ownerPhone:"",ownerNida:"",reporterName:"",reporterPhone:"",
      category:"simu",description:"",serialNo:"",deviceNo:"",brand:"",color:"",
      estimatedValue:"",station:OFFICER?.station||"",notes:"" });
    setSubmitted(false); setSavedItem(null);
  };

  const catLabel = (cat: string) => CATEGORIES.find((c) => c.value === cat)?.label ?? cat;

  // ── SUCCESS SCREEN ─────────────────────────────────────────────────
  if (submitted && savedItem) {
    return (
      <div className="min-h-full bg-police p-4">
        <div className="flex flex-col items-center py-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#10B981]/15">
            <CheckCircle size={44} className="text-[#10B981]" />
          </div>
          <h2 className="mt-4 text-[20px] font-bold text-police">Ripoti Imesajiliwa</h2>
          <p className="mt-1 text-center text-[13px] text-police-muted">Mali iliyopotea imerekodiwa kwenye mfumo.</p>

          <div className="mt-5 w-full rounded-2xl bg-police-card p-4 shadow-sm space-y-2">
            <Row label="Nambari" value={savedItem.item_number} bold />
            <Row label="Aina" value={catLabel(savedItem.category)} />
            <Row label="Maelezo" value={savedItem.description} />
            {savedItem.owner_name && <Row label="Mwenye Mali" value={savedItem.owner_name} />}
            <Row label="Hali" value="Inatafutwa" />
            <Row label="Kituo" value={savedItem.station_name ?? OFFICER?.station ?? "—"} />
            <Row label="Afisa" value={savedItem.officer_name ?? OFFICER?.shortName ?? "—"} />
          </div>

          <div className="mt-4 w-full space-y-2">
            <button onClick={() => { resetForm(); setTab("report"); }}
              className="w-full rounded-xl border border-police py-3 text-[14px] font-semibold text-police">
              Ripoti Mali Nyingine
            </button>
            <button onClick={() => { resetForm(); setTab("list"); void loadItems(); }}
              className="w-full rounded-xl bg-[#1E3A8A] py-3 text-[14px] font-bold text-white">
              Angalia Orodha
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-police">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2196F3] px-4 py-4">
        <button onClick={() => goBack()} className="mb-3 flex items-center gap-2 text-white/80">
          <ArrowLeft size={18} /><span className="text-[13px]">Rudi</span>
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
              <Package size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-white">Mali Zilizopotea</h1>
              <p className="text-[11px] text-white/70">Ripoti na Ufuatiliaji • {OFFICER?.station}</p>
            </div>
          </div>
          <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white">
            {items.length} ripoti
          </span>
        </div>

        {/* Tabs */}
        <div className="mt-3 flex gap-2">
          <button onClick={() => setTab("list")}
            className={`flex-1 rounded-xl py-2 text-[12px] font-bold transition ${tab === "list" ? "bg-white text-[#1E3A8A]" : "text-white/70 border border-white/30"}`}>
            📋 Orodha
          </button>
          <button onClick={() => setTab("report")}
            className={`flex-1 rounded-xl py-2 text-[12px] font-bold transition ${tab === "report" ? "bg-white text-[#1E3A8A]" : "text-white/70 border border-white/30"}`}>
            ➕ Ripoti Mpya
          </button>
        </div>
      </div>

      {/* ── LIST TAB ──────────────────────────────────────────────────── */}
      {tab === "list" && (
        <div className="p-4 space-y-3">
          {/* Search + filter */}
          <div className="flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-police bg-police-card px-3">
              <Search size={14} className="text-police-faint" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadItems()}
                placeholder="Tafuta kwa maelezo, S/N, jina..."
                className="h-9 flex-1 bg-transparent text-[13px] text-police focus:outline-none" />
              {search && <button onClick={() => { setSearch(""); loadItems(); }}><X size={13} className="text-police-faint" /></button>}
            </div>
            <button onClick={() => loadItems()}
              className="rounded-xl bg-[#1E3A8A] px-3 py-2 text-white">
              <Search size={16} />
            </button>
          </div>

          {/* Status filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {["all", ...Object.keys(STATUS_CONFIG)].map((s) => (
              <button key={s} onClick={() => { setStatusFilter(s); }}
                className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold border transition ${
                  statusFilter === s ? "text-white border-transparent bg-[#1E3A8A]" : "text-police-muted border-police-soft"
                }`}>
                {s === "all" ? "Zote" : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={28} className="animate-spin text-[#2196F3]" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Package size={40} className="text-police-faint" />
              <p className="mt-3 text-[14px] font-bold text-police">Hakuna Ripoti</p>
              <p className="mt-1 text-[12px] text-police-muted">Bonyeza "Ripoti Mpya" kuanza kurekodi mali iliyopotea.</p>
              <button onClick={() => setTab("report")}
                className="mt-4 flex items-center gap-2 rounded-xl bg-[#1E3A8A] px-5 py-2.5 text-[13px] font-bold text-white">
                <Plus size={15} /> Ripoti ya Kwanza
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => {
                const st = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.searching;
                return (
                  <button key={item.id} onClick={() => setSelected(item)}
                    className="w-full rounded-2xl bg-police-card p-4 text-left shadow-sm active:scale-[0.99]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1E3A8A]/10 text-[20px]">
                          {catLabel(item.category).split(" ")[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-bold text-police">{item.description}</p>
                          <p className="text-[10px] text-police-muted">{item.item_number} • {item.reported_date}</p>
                          {item.owner_name && (
                            <p className="flex items-center gap-1 text-[10px] text-police-faint">
                              <User size={9} />{item.owner_name}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
                        style={{ backgroundColor: st.bg }}>
                        {st.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── REPORT TAB ───────────────────────────────────────────────── */}
      {tab === "report" && (
        <div className="space-y-4 p-4 pb-8">

          {/* Item details */}
          <div className="rounded-2xl bg-police-card p-4 shadow-sm space-y-3">
            <h3 className="text-[14px] font-bold text-police" style={{ borderLeft: "3px solid #1E3A8A", paddingLeft: "8px" }}>
              Taarifa za Mali
            </h3>

            <div>
              <label className="mb-1 block text-[12px] font-medium text-police-muted">Aina ya Mali *</label>
              <select value={form.category} onChange={set("category")} className={sel}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <FI label="Maelezo ya Mali *" required value={form.description} onChange={set("description")}
              placeholder="e.g. Simu Samsung Galaxy, nyeusi, uliovunjika screen..." />

            <div className="grid grid-cols-2 gap-3">
              <FI label="Serial Number / S/N" value={form.serialNo} onChange={set("serialNo")} placeholder="IMEI / S/N" />
              <FI label="Namba ya Kifaa" value={form.deviceNo} onChange={set("deviceNo")} placeholder="e.g. IMEI" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FI label="Brand / Chapa" value={form.brand} onChange={set("brand")} placeholder="e.g. Samsung, iPhone" />
              <FI label="Rangi / Color" value={form.color} onChange={set("color")} placeholder="e.g. Nyeusi, Nyeupe" />
            </div>
            <FI label="Thamani ya Kukadiriwa (TZS)" value={form.estimatedValue} onChange={set("estimatedValue")}
              placeholder="e.g. 500,000" inputMode="numeric" />
          </div>

          {/* Owner */}
          <div className="rounded-2xl bg-police-card p-4 shadow-sm space-y-3">
            <h3 className="text-[14px] font-bold text-police" style={{ borderLeft: "3px solid #10B981", paddingLeft: "8px" }}>
              Mwenye Mali (Aliyeripoti)
            </h3>
            <FI label="Jina la Mwenye Mali" value={form.ownerName} onChange={set("ownerName")} placeholder="Jina kamili" />
            <div className="grid grid-cols-2 gap-3">
              <FI label="Simu" value={form.ownerPhone} onChange={set("ownerPhone")} placeholder="0712 345 678" inputMode="tel" />
              <FI label="NIDA" value={form.ownerNida} onChange={(e) => {
                const d = e.target.value.replace(/\D/g, "").slice(0, 20);
                setForm((f) => ({ ...f, ownerNida: d }));
              }} placeholder="Tarakimu 20" inputMode="numeric" />
            </div>

            {/* Different reporter */}
            <p className="text-[11px] font-semibold text-police-muted pt-1">Aliyeripoti (kama ni tofauti na mwenye mali):</p>
            <div className="grid grid-cols-2 gap-3">
              <FI label="Jina la Mripoti" value={form.reporterName} onChange={set("reporterName")} placeholder="Jina" />
              <FI label="Simu ya Mripoti" value={form.reporterPhone} onChange={set("reporterPhone")} placeholder="0712..." inputMode="tel" />
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-2xl bg-police-card p-4 shadow-sm space-y-3">
            <h3 className="text-[14px] font-bold text-police" style={{ borderLeft: "3px solid #FF9800", paddingLeft: "8px" }}>
              Maelezo ya Ziada
            </h3>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-police-muted">Madokezo / Maelezo</label>
              <textarea rows={3} value={form.notes} onChange={set("notes")}
                placeholder="Hali ya mali, mahali ilipopotea, mazingira ya kutoweka..."
                className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police placeholder:text-police-faint focus:outline-none focus:border-[#1E3A8A]" />
            </div>
          </div>

          {/* Officer / Station */}
          <div className="rounded-2xl border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 p-4">
            <p className="text-[12px] font-medium text-police-muted">Afisa Anayerekodi</p>
            <p className="mt-1 text-[15px] font-bold text-[#1E3A8A]">{OFFICER?.shortName}</p>
            <p className="text-[11px] text-police-muted">{OFFICER?.id} • {OFFICER?.station}</p>
          </div>

          {/* Offline indicator */}
          {(isOfflineMode || syncStatus.pending > 0) && (
            <div className={`rounded-2xl border p-3 flex items-center gap-3 ${
              syncStatus.isSyncing ? "border-[#2196F3]/30 bg-[#2196F3]/5"
              : syncStatus.isOnline ? "border-[#FF9800]/30 bg-[#FF9800]/5"
              : "border-[#EF4444]/30 bg-[#EF4444]/5"}`}>
              {syncStatus.isSyncing ? <RefreshCw size={15} className="animate-spin text-[#2196F3]" />
                : syncStatus.isOnline ? <CloudUpload size={15} className="text-[#FF9800]" />
                : <WifiOff size={15} className="text-[#EF4444]" />}
              <p className="text-[12px] text-police-muted">
                {syncStatus.isSyncing ? "Inasasisha..." : syncStatus.isOnline
                  ? `Rekodi ${syncStatus.pending} zinasubiri` : "Huna mtandao — itahifadhiwa kawaida"}
              </p>
            </div>
          )}

          <button onClick={handleReport} disabled={isSaving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] py-4 text-[15px] font-bold text-white disabled:opacity-50">
            {isSaving ? <><Loader2 size={16} className="animate-spin" /> Inarekodiwa...</> : <><Package size={16} /> Rekodi Mali Iliyopotea</>}
          </button>
        </div>
      )}

      {/* ── DETAIL MODAL ─────────────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
          onClick={() => setSelected(null)}>
          <div className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl bg-police-card p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute right-4 top-4 text-police-faint"><X size={18} /></button>

            {/* Status badge */}
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1E3A8A]/10 text-[22px]">
                {catLabel(selected.category).split(" ")[0]}
              </div>
              <div>
                <p className="text-[15px] font-bold text-police">{selected.description}</p>
                <p className="text-[11px] text-police-muted">{selected.item_number}</p>
                <span className="mt-1 inline-block rounded-full px-3 py-0.5 text-[10px] font-bold text-white"
                  style={{ backgroundColor: STATUS_CONFIG[selected.status]?.bg ?? "#6B7280" }}>
                  {STATUS_CONFIG[selected.status]?.label}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-[13px]">
              <Row label="Aina"          value={catLabel(selected.category)} />
              {selected.serial_no && <Row label="S/N"            value={selected.serial_no} />}
              {selected.brand     && <Row label="Brand"          value={selected.brand} />}
              {selected.color     && <Row label="Rangi"          value={selected.color} />}
              {selected.estimated_value && <Row label="Thamani"  value={`TZS ${selected.estimated_value}`} />}
              <div className="my-2 border-t border-police-soft" />
              {selected.owner_name  && <Row label="Mwenye Mali"  value={selected.owner_name} />}
              {selected.owner_phone && <Row label="Simu"         value={selected.owner_phone} />}
              {selected.owner_nida  && <Row label="NIDA"         value={selected.owner_nida} />}
              <div className="my-2 border-t border-police-soft" />
              <Row label="Tarehe"        value={selected.reported_date} />
              {selected.station_name && <Row label="Kituo"       value={selected.station_name} />}
              {selected.officer_name && <Row label="Afisa"       value={selected.officer_name} />}
              {selected.notes        && <Row label="Maelezo"     value={selected.notes} />}
              {selected.found_date   && <Row label="Ilipatikana" value={selected.found_date} />}
              {selected.found_location && <Row label="Mahali"    value={selected.found_location} />}
            </div>

            {/* Status update buttons */}
            {selected.status === "searching" && (
              <div className="mt-4 space-y-2">
                <p className="text-[11px] font-bold text-police-muted uppercase">Badilisha Hali:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleStatusUpdate(selected, "found")} disabled={!!updatingId}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-[#10B981] py-2.5 text-[12px] font-bold text-white disabled:opacity-50">
                    {updatingId === selected.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                    Imepatikana
                  </button>
                  <button onClick={() => handleStatusUpdate(selected, "unclaimed")} disabled={!!updatingId}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-[#6B7280] py-2.5 text-[12px] font-bold text-white disabled:opacity-50">
                    <Clock size={13} /> Haijadaiwa
                  </button>
                </div>
              </div>
            )}
            {selected.status === "found" && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={() => handleStatusUpdate(selected, "returned")} disabled={!!updatingId}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-[#2196F3] py-2.5 text-[12px] font-bold text-white disabled:opacity-50">
                  {updatingId === selected.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                  Imerudishwa
                </button>
                <button onClick={() => handleStatusUpdate(selected, "claimed")} disabled={!!updatingId}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-[#8B5CF6] py-2.5 text-[12px] font-bold text-white disabled:opacity-50">
                  <User size={13} /> Imedaiwa
                </button>
              </div>
            )}

            <button onClick={() => setSelected(null)}
              className="mt-3 w-full rounded-xl border border-police py-2 text-[13px] font-semibold text-police">
              Funga
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────
const sel = "w-full rounded-xl border border-police bg-police-input px-3 h-10 text-[13px] text-police focus:outline-none focus:border-[#1E3A8A]";

function FI({ label, required, value, onChange, placeholder, inputMode }: {
  label: string; required?: boolean; value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string; inputMode?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-medium text-police-muted">
        {label}{required && <span className="ml-0.5 text-[#EF4444]">*</span>}
      </label>
      <input value={value} onChange={onChange} placeholder={placeholder}
        inputMode={inputMode as any}
        className="w-full rounded-xl border border-police bg-police-input px-3 h-10 text-[13px] text-police placeholder:text-police-faint focus:outline-none focus:border-[#1E3A8A]" />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between gap-3 py-1 border-b border-police-soft last:border-0">
      <span className="shrink-0 text-[12px] text-police-muted">{label}</span>
      <span className={`text-right text-[12px] ${bold ? "font-bold text-[#10B981]" : "font-medium text-police"}`}>{value}</span>
    </div>
  );
}
