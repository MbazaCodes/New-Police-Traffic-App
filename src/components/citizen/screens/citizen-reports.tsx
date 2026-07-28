// src/components/citizen/screens/citizen-reports.tsx
// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import {
  FileText, Car, Shield, Package, Loader2, CheckCircle,
  ChevronRight, Calendar, ArrowLeft, Clock, AlertCircle,
} from "lucide-react";

// ── Service definitions with full form fields ─────────────────────────────────
const SERVICES = [
  {
    id: "good-conduct",
    label: "Cheti cha Tabia Njema",
    labelEn: "Certificate of Good Conduct",
    icon: Shield,
    color: "var(--tpf-green)",
    fee: 10000,
    processDays: "3-5",
    desc: "Kwa ajili ya kazi, visa, elimu ya juu au mahitaji ya kisheria",
    fields: [
      { key: "purpose", label: "Kusudio la Cheti", type: "select", required: true,
        options: ["Maombi ya Kazi", "Visa / Uhamiaji", "Elimu ya Juu", "Mkopo wa Benki", "Ndoa", "Leseni ya Biashara", "Nyingine"] },
      { key: "employer", label: "Mwajiri / Taasisi (kama ipo)", type: "text", placeholder: "e.g. Serikali ya Tanzania" },
      { key: "destination", label: "Nchi / Mkoa wa Kusudio", type: "text", placeholder: "e.g. Kenya, Dar es Salaam" },
      { key: "notes", label: "Maelezo ya Ziada", type: "textarea", placeholder: "Maelezo yoyote ya ziada..." },
    ],
  },
  {
    id: "vehicle-inspection",
    label: "Omba Ukaguzi wa Gari",
    labelEn: "Vehicle Inspection Request",
    icon: Car,
    color: "var(--tpf-blue)",
    fee: 25000,
    processDays: "1-2",
    desc: "Ukaguzi rasmi wa gari kwa ajili ya usajili, bima, au mahakama",
    fields: [
      { key: "plate", label: "Namba ya Usajili wa Gari *", type: "text", required: true, placeholder: "e.g. T444EGV" },
      { key: "make", label: "Chapa ya Gari", type: "text", placeholder: "e.g. Toyota" },
      { key: "model", label: "Mfano", type: "text", placeholder: "e.g. Ractis" },
      { key: "year", label: "Mwaka wa Uzalishaji", type: "text", placeholder: "e.g. 2009" },
      { key: "inspectionReason", label: "Sababu ya Ukaguzi *", type: "select", required: true,
        options: ["Usajili Mpya", "Upya wa Usajili", "Madai ya Bima", "Amri ya Mahakama", "Uuzaji wa Gari", "Nyingine"] },
      { key: "preferredDate", label: "Tarehe Unayoipenda", type: "date" },
      { key: "notes", label: "Maelezo ya Ziada", type: "textarea", placeholder: "Hali ya gari au maelezo mengine..." },
    ],
  },
  {
    id: "pf3",
    label: "Fomu ya PF3 (Ajali ya Barabara)",
    labelEn: "PF3 Road Accident Form",
    icon: AlertCircle,
    color: "var(--tpf-red)",
    fee: 5000,
    processDays: "1",
    desc: "Fomu rasmi ya polisi kwa ajili ya madai ya bima baada ya ajali",
    fields: [
      { key: "accidentDate", label: "Tarehe ya Ajali *", type: "date", required: true },
      { key: "accidentLocation", label: "Mahali pa Ajali *", type: "text", required: true, placeholder: "e.g. Barabara ya Morogoro, karibu na Ubungo" },
      { key: "plate", label: "Namba ya Gari Lako *", type: "text", required: true, placeholder: "e.g. T444EGV" },
      { key: "otherPlate", label: "Namba ya Gari Lingine (kama ipo)", type: "text", placeholder: "e.g. T123ABC" },
      { key: "injuries", label: "Je, kulikuwa na majeruhi?", type: "select",
        options: ["Hapana", "Ndio — majeruhi wadogo", "Ndio — majeruhi makubwa", "Ndio — kifo"] },
      { key: "insurancePolicy", label: "Namba ya Bima Yako", type: "text", placeholder: "e.g. TPA-2024-123456" },
      { key: "description", label: "Maelezo ya Ajali *", type: "textarea", required: true,
        placeholder: "Eleza kwa undani jinsi ajali ilivyotokea..." },
      { key: "witnesses", label: "Mashahidi (majina na simu)", type: "textarea",
        placeholder: "Jina: ..., Simu: ..." },
    ],
  },
  {
    id: "ownership-cert",
    label: "Cheti cha Umiliki wa Mali",
    labelEn: "Property Ownership Certificate",
    icon: Package,
    color: "var(--tpf-amber)",
    fee: 15000,
    processDays: "5-7",
    desc: "Uthibitisho rasmi wa umiliki wa mali isiyohamia (nyumba, ardhi)",
    fields: [
      { key: "propertyAddress", label: "Anwani ya Mali *", type: "text", required: true, placeholder: "e.g. Kijitonyama, Dar es Salaam" },
      { key: "titleDeedNo", label: "Namba ya Hati Miliki", type: "text", placeholder: "e.g. TTL-12345" },
      { key: "propertyType", label: "Aina ya Mali *", type: "select", required: true,
        options: ["Nyumba ya Kuishi", "Ardhi Tupu", "Shamba", "Jengo la Biashara", "Ghorofa", "Nyingine"] },
      { key: "purpose", label: "Kusudio la Cheti *", type: "select", required: true,
        options: ["Mkopo wa Benki", "Uuzaji wa Mali", "Migogoro ya Kisheria", "Usajili Rasmi", "Nyingine"] },
      { key: "estimatedValue", label: "Thamani ya Mali (TZS)", type: "text", placeholder: "e.g. 50,000,000" },
      { key: "notes", label: "Maelezo ya Ziada", type: "textarea", placeholder: "..." },
    ],
  },
  {
    id: "summary-report",
    label: "Ripoti ya Muhtasari wa Rekodi",
    labelEn: "Police Record Summary",
    icon: FileText,
    color: "#8B5CF6",
    fee: 2000,
    processDays: "1-2",
    desc: "Muhtasari wa rekodi zako zote za polisi (citations, malalamiko, n.k.)",
    fields: [
      { key: "fromDate", label: "Kipindi: Kuanzia Tarehe", type: "date" },
      { key: "toDate", label: "Hadi Tarehe", type: "date" },
      { key: "includeItems", label: "Jumuisha nini?", type: "select",
        options: ["Kila kitu", "Citations tu", "Malalamiko tu", "Malipo tu", "Citations na Malipo"] },
      { key: "purpose", label: "Kusudio", type: "select",
        options: ["Matumizi Binafsi", "Mahakama", "Biashara", "Nyingine"] },
      { key: "notes", label: "Maelezo ya Ziada", type: "textarea", placeholder: "..." },
    ],
  },
];

// ── Shared input styles ────────────────────────────────────────────────────────
const inp = (extra?: any) => ({
  border: "1px solid var(--tpf-border)", background: "var(--tpf-surface-2)",
  color: "var(--tpf-text)", borderRadius: "10px", padding: "0 12px", height: "44px",
  fontSize: "13px", width: "100%", outline: "none", boxSizing: "border-box", ...extra,
});

const ta = {
  border: "1px solid var(--tpf-border)", background: "var(--tpf-surface-2)",
  color: "var(--tpf-text)", borderRadius: "10px", padding: "10px 12px",
  fontSize: "13px", width: "100%", outline: "none", minHeight: "80px",
  resize: "vertical" as const, boxSizing: "border-box" as const,
};

const lbl = {
  display: "block", fontSize: "10px", fontWeight: "700",
  textTransform: "uppercase" as const, letterSpacing: "0.7px",
  color: "var(--tpf-text-4)", marginBottom: "4px",
};

// ── Field renderer ─────────────────────────────────────────────────────────────
function Field({ field, value, onChange }: { field: any; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={lbl}>{field.label}</label>
      {field.type === "select" ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inp(), appearance: "auto" as any }}>
          <option value="">— Chagua —</option>
          {field.options.map((o: string) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : field.type === "textarea" ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={field.placeholder} style={ta} />
      ) : (
        <input
          type={field.type === "date" ? "date" : "text"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          style={inp()}
        />
      )}
    </div>
  );
}

// ── Past applications list ─────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  pending: "#F59E0B", processing: "#3B82F6", approved: "#10B981",
  rejected: "#EF4444", completed: "#10B981",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "Inasubiri", processing: "Inashughulikiwa",
  approved: "Imeidhinishwa", rejected: "Imekataliwa", completed: "Imekamilika",
};

// ── Main component ─────────────────────────────────────────────────────────────
export function CitizenReports({ citizen }: any) {
  const [view, setView]           = useState<"list" | "form" | "done">("list");
  const [selected, setSelected]   = useState<typeof SERVICES[0] | null>(null);
  const [formData, setFormData]   = useState<Record<string, string>>({});
  const [applying, setApplying]   = useState(false);
  const [doneRef, setDoneRef]     = useState("");
  const [error, setError]         = useState<string | null>(null);
  const [history, setHistory]     = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const token = () => typeof window !== "undefined" ? localStorage.getItem("citizen-token") || "" : "";
  const H = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

  useEffect(() => {
    if (!citizen?.id) { setLoadingHistory(false); return; }
    fetch(`/api/citizen-portal/${citizen.id}/applications`, { headers: H() })
      .then(r => r.json())
      .then(j => { if (j.ok) setHistory(j.data || []); })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, [citizen?.id]);

  const openForm = (svc: typeof SERVICES[0]) => {
    setSelected(svc);
    setFormData({});
    setError(null);
    // Pre-fill today for date fields
    const today = new Date().toISOString().split("T")[0];
    const defaults: Record<string, string> = {};
    svc.fields.forEach(f => {
      if (f.key === "toDate" || f.key === "fromDate") defaults[f.key] = today;
    });
    setFormData(defaults);
    setView("form");
  };

  const handleSubmit = async () => {
    if (!citizen?.id) { setError("Tafadhali ingia kwanza"); return; }
    if (!selected) return;

    // Validate required fields
    for (const f of selected.fields) {
      if (f.required && !formData[f.key]?.trim()) {
        setError(`"${f.label}" inahitajika`); return;
      }
    }

    setApplying(true); setError(null);
    const res = await fetch(`/api/citizen-portal/${citizen.id}/applications`, {
      method: "POST", headers: H(),
      body: JSON.stringify({ appType: selected.id, data: formData }),
    });
    const json = await res.json();
    setApplying(false);

    if (!json.ok) { setError(json.error || "Imeshindikana. Jaribu tena."); return; }
    setDoneRef(json.data?.reference_no || `APP-${Date.now().toString().slice(-6)}`);
    setHistory(h => [json.data, ...h]);
    setView("done");
  };

  // ── DONE VIEW ──────────────────────────────────────────────────────────────
  if (view === "done") return (
    <div className="flex flex-col items-center p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full"
        style={{ background: "color-mix(in srgb, var(--tpf-green) 15%, transparent)" }}>
        <CheckCircle size={44} style={{ color: "var(--tpf-green)" }} />
      </div>
      <h2 className="mt-4 text-[20px] font-black" style={{ color: "var(--tpf-text)" }}>Ombi Limewasilishwa!</h2>
      <p className="mt-1 text-[13px]" style={{ color: "var(--tpf-text-3)" }}>Nambari ya Kumbukumbu:</p>
      <p className="mt-1 text-[22px] font-black" style={{ color: "var(--tpf-blue)" }}>{doneRef}</p>
      <div className="mt-4 rounded-xl p-4 text-left" style={{ background: "var(--tpf-card)", border: "1px solid var(--tpf-border)", width: "100%" }}>
        <p className="text-[12px]" style={{ color: "var(--tpf-text-3)" }}>
          ✅ Ombi lako la <strong>{selected?.label}</strong> limepokelewa.<br/>
          ⏱ Muda wa kuchakata: siku <strong>{selected?.processDays}</strong> za kazi.<br/>
          📞 Utapata taarifa kupitia simu yako: <strong>{citizen?.phone}</strong>
        </p>
      </div>
      <div className="mt-4 flex gap-3 w-full">
        <button onClick={() => setView("list")}
          className="flex-1 rounded-xl py-3 text-[13px] font-bold"
          style={{ background: "var(--tpf-card)", border: "1px solid var(--tpf-border)", color: "var(--tpf-text)" }}>
          Rudi Nyumbani
        </button>
        <button onClick={() => { setView("list"); setTimeout(() => openForm(SERVICES[0]), 50); }}
          className="flex-1 rounded-xl py-3 text-[13px] font-bold text-white"
          style={{ background: "var(--tpf-blue)" }}>
          Ombi Jingine
        </button>
      </div>
    </div>
  );

  // ── FORM VIEW ──────────────────────────────────────────────────────────────
  if (view === "form" && selected) {
    const Icon = selected.icon;
    return (
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setView("list")}
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "var(--tpf-card)", border: "1px solid var(--tpf-border)" }}>
            <ArrowLeft size={16} style={{ color: "var(--tpf-text-3)" }} />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: `color-mix(in srgb, ${selected.color} 15%, transparent)` }}>
            <Icon size={20} style={{ color: selected.color }} />
          </div>
          <div>
            <p className="text-[14px] font-black" style={{ color: "var(--tpf-text)" }}>{selected.label}</p>
            <p className="text-[10px]" style={{ color: "var(--tpf-text-4)" }}>{selected.labelEn}</p>
          </div>
        </div>

        {/* Info bar */}
        <div className="rounded-xl p-3 flex items-center justify-between"
          style={{ background: "var(--tpf-card)", border: `1px solid ${selected.color}30` }}>
          <div className="flex items-center gap-2">
            <Clock size={13} style={{ color: selected.color }} />
            <span className="text-[11px]" style={{ color: "var(--tpf-text-3)" }}>
              Siku {selected.processDays} za kazi
            </span>
          </div>
          <div className="text-[13px] font-black" style={{ color: selected.color }}>
            TZS {selected.fee.toLocaleString()}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl px-4 py-3 text-[12px] font-medium"
            style={{ background: "#FEF2F2", color: "var(--tpf-red)", border: "1px solid #FECACA" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form fields */}
        <div className="rounded-2xl p-4 space-y-3"
          style={{ background: "var(--tpf-card)", border: "1px solid var(--tpf-border)" }}>
          <p className="text-[12px] font-bold" style={{ color: "var(--tpf-text-2)" }}>Jaza Fomu</p>
          {selected.fields.map(field => (
            <Field
              key={field.key}
              field={field}
              value={formData[field.key] || ""}
              onChange={v => setFormData(prev => ({ ...prev, [field.key]: v }))}
            />
          ))}
        </div>

        {/* Citizen info display */}
        <div className="rounded-xl p-3" style={{ background: "var(--tpf-surface-2)", border: "1px solid var(--tpf-border)" }}>
          <p className="text-[10px] font-bold mb-1" style={{ color: "var(--tpf-text-4)", textTransform: "uppercase" }}>Taarifa za Mwombaji</p>
          <p className="text-[12px] font-semibold" style={{ color: "var(--tpf-text)" }}>{citizen?.name || "—"}</p>
          <p className="text-[11px]" style={{ color: "var(--tpf-text-4)" }}>{citizen?.phone || citizen?.email || "—"}</p>
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={applying}
          className="w-full rounded-xl py-4 text-[14px] font-black text-white flex items-center justify-center gap-2"
          style={{ background: applying ? "var(--tpf-border-2)" : selected.color, opacity: applying ? 0.8 : 1 }}>
          {applying ? <><Loader2 size={16} className="animate-spin" /> Inawasilisha...</> : <>📤 Wasilisha Ombi — TZS {selected.fee.toLocaleString()}</>}
        </button>

        <p className="text-[10px] text-center" style={{ color: "var(--tpf-text-4)" }}>
          Malipo yanafanywa ofisini au kupitia namba ya akaunti itakayotumwa kwa SMS
        </p>
      </div>
    );
  }

  // ── LIST VIEW (main) ───────────────────────────────────────────────────────
  return (
    <div className="space-y-3 sm:space-y-4 px-3 sm:px-5 py-3 sm:py-4">
      <div>
        <h2 className="text-[18px] font-black" style={{ color: "var(--tpf-text)" }}>Huduma za Polisi</h2>
        <p className="text-[12px]" style={{ color: "var(--tpf-text-4)" }}>Omba ripoti na vyeti rasmi vya polisi</p>
      </div>

      {/* Services grid */}
      <div className="space-y-2">
        {SERVICES.map(svc => {
          const Icon = svc.icon;
          return (
            <button key={svc.id} onClick={() => openForm(svc)}
              className="flex w-full items-center gap-3 rounded-2xl p-4 text-left transition active:scale-[0.98]"
              style={{ background: "var(--tpf-card)", border: "1px solid var(--tpf-border)" }}>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ background: `color-mix(in srgb, ${svc.color} 12%, transparent)` }}>
                <Icon size={22} style={{ color: svc.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold" style={{ color: "var(--tpf-text)" }}>{svc.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--tpf-text-4)" }}>{svc.desc}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] font-bold" style={{ color: svc.color }}>
                    TZS {svc.fee.toLocaleString()}
                  </span>
                  <span className="text-[10px]" style={{ color: "var(--tpf-text-4)" }}>
                    · Siku {svc.processDays}
                  </span>
                </div>
              </div>
              <ChevronRight size={15} style={{ color: "var(--tpf-border-2)", flexShrink: 0 }} />
            </button>
          );
        })}
      </div>

      {/* Past applications */}
      <div>
        <p className="mb-2 text-[13px] font-bold" style={{ color: "var(--tpf-text-2)" }}>
          Maombi Yako ({history.length})
        </p>
        {loadingHistory ? (
          <div className="flex justify-center py-6">
            <Loader2 size={22} className="animate-spin" style={{ color: "var(--tpf-blue)" }} />
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-xl p-6 text-center" style={{ background: "var(--tpf-card)", border: "1px solid var(--tpf-border)" }}>
            <FileText size={28} style={{ color: "var(--tpf-border-2)", margin: "0 auto 8px" }} />
            <p className="text-[12px]" style={{ color: "var(--tpf-text-4)" }}>Bado hujafanya maombi yoyote</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((app: any) => {
              const svc = SERVICES.find(s => s.id === app.app_type);
              const Icon = svc?.icon || FileText;
              const statusColor = STATUS_COLOR[app.status] || "#94A3B8";
              return (
                <div key={app.id} className="flex items-center gap-3 rounded-xl p-3"
                  style={{ background: "var(--tpf-card)", border: "1px solid var(--tpf-border)" }}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `color-mix(in srgb, ${svc?.color || "#8B5CF6"} 12%, transparent)` }}>
                    <Icon size={16} style={{ color: svc?.color || "#8B5CF6" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-[12px] font-semibold" style={{ color: "var(--tpf-text)" }}>
                      {svc?.label || app.app_type || app.title || "Ombi"}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--tpf-text-4)" }}>
                      {app.reference_no || app.id?.slice(0, 8)} · {app.created_at ? new Date(app.created_at).toLocaleDateString("sw-TZ") : ""}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: `${statusColor}18`, color: statusColor }}>
                    {STATUS_LABEL[app.status] || app.status || "Inasubiri"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
