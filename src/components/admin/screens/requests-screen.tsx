"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, FileText, Clock, CheckCircle2, XCircle, PauseCircle,
  ChevronDown, Send, Paperclip, X, AlertTriangle, Eye,
} from "lucide-react";
import { authFetch } from "@/lib/client-auth";

const REQUEST_TYPES = [
  { id: "recruitment",   label: "Ajira Mpya (Recruitment)",    dept: "HR" },
  { id: "transfer",      label: "Uhamisho wa Afisa (Transfer)", dept: "Operations" },
  { id: "promotion",     label: "Kupandishwa Cheo (Promotion)", dept: "HR" },
  { id: "equipment",     label: "Vifaa / Magari (Equipment)",   dept: "Logistics" },
  { id: "budget",        label: "Mgao wa Bajeti (Budget)",      dept: "Finance" },
  { id: "training",      label: "Mafunzo (Training)",           dept: "Training" },
  { id: "leave",         label: "Likizo (Leave)",               dept: "HR" },
  { id: "disciplinary",  label: "Hatua za Kinidhamu",           dept: "Internal Affairs" },
  { id: "investigation", label: "Ufunguzi wa Uchunguzi",        dept: "CID" },
  { id: "operation",     label: "Idhini ya Operesheni",         dept: "Operations" },
  { id: "procurement",   label: "Manunuzi (Procurement)",       dept: "Procurement" },
  { id: "medical",       label: "Huduma za Afya (Medical)",     dept: "Welfare" },
  { id: "legal",         label: "Msaada wa Kisheria (Legal)",   dept: "Legal" },
  { id: "other",         label: "Nyingine (Other)",             dept: "General" },
];

const STATUS_COLORS: Record<string, string> = {
  pending:      "bg-yellow-100 text-yellow-700",
  under_review: "bg-blue-100 text-blue-700",
  on_hold:      "bg-orange-100 text-orange-700",
  approved:     "bg-green-100 text-green-700",
  declined:     "bg-red-100 text-red-700",
  cancelled:    "bg-gray-100 text-gray-500",
  draft:        "bg-gray-100 text-gray-500",
};

const STATUS_ICONS: Record<string, typeof Clock> = {
  pending:      Clock,
  under_review: Eye,
  on_hold:      PauseCircle,
  approved:     CheckCircle2,
  declined:     XCircle,
  cancelled:    XCircle,
};

const PRIORITY_COLORS: Record<string, string> = {
  low:    "text-gray-400",
  normal: "text-blue-500",
  high:   "text-orange-500",
  urgent: "text-red-500",
};

interface Request {
  id: string; reference_no: string; type: string; subject: string;
  description: string; priority: string; status: string;
  requester_name: string; requester_role: string; requester_dept: string;
  approver_role: string; approver_name: string;
  response_note: string | null; hold_reason: string | null;
  created_at: string; responded_at: string | null;
}

export default function RequestsScreen() {
  const [requests, setRequests]   = useState<Request[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showNew, setShowNew]     = useState(false);
  const [selected, setSelected]   = useState<Request | null>(null);
  const [filterStatus, setFilter] = useState("");

  // New request form
  const [type, setType]           = useState(REQUEST_TYPES[0].id);
  const [subject, setSubject]     = useState("");
  const [description, setDesc]    = useState("");
  const [priority, setPriority]   = useState("normal");
  const [approverRole, setApprRole] = useState("NATIONAL_COMMANDER");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = filterStatus ? `?status=${filterStatus}` : "";
    const { data } = await authFetch(`/api/command-requests${params}`);
    if (data?.ok) setRequests(data.data ?? []);
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!subject.trim() || !description.trim()) {
      setError("Kichwa na maelezo vinahitajika"); return;
    }
    setError(""); setSubmitting(true);
    const { data, error: err } = await authFetch("/api/command-requests", {
      method: "POST",
      body: JSON.stringify({ type, subject, description, priority, approver_role: approverRole }),
    });
    setSubmitting(false);
    if (err || !data?.ok) { setError(data?.error ?? "Imeshindwa kutuma ombi"); return; }
    setShowNew(false); setSubject(""); setDesc(""); setPriority("normal");
    load();
  };

  const statusLabel: Record<string, string> = {
    pending: "Inasubiri", under_review: "Inakaguliwa",
    on_hold: "Imesimama", approved: "Imeidhinishwa",
    declined: "Imekataliwa", cancelled: "Imeghairiwa",
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-black text-police">Maombi Yangu</h1>
          <p className="text-[12px] text-police-muted">Tuma maombi kwa viongozi wa juu</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 rounded-xl bg-[#2196F3] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm hover:bg-[#1E88E5]">
          <Plus size={16} /> Ombi Jipya
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["", "pending", "under_review", "on_hold", "approved", "declined"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-xl px-3 py-1.5 text-[12px] font-semibold transition ${filterStatus === s ? "bg-[#2196F3] text-white" : "bg-police-soft text-police-muted hover:bg-police-card"}`}>
            {s ? statusLabel[s] : "Zote"}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2196F3] border-t-transparent" /></div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-police-muted">
          <FileText size={40} className="mb-3 opacity-30" />
          <p className="font-medium">Hakuna maombi</p>
          <p className="text-[12px]">Bonyeza "Ombi Jipya" kutuma ombi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => {
            const Icon = STATUS_ICONS[r.status] ?? Clock;
            return (
              <button key={r.id} onClick={() => setSelected(r)}
                className="w-full rounded-2xl bg-police-card p-4 shadow-sm text-left hover:shadow-md transition border border-transparent hover:border-[#2196F3]/20">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold text-police-muted">{r.reference_no}</span>
                      <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${STATUS_COLORS[r.status] ?? "bg-gray-100 text-gray-500"}`}>
                        <Icon size={10} className="inline mr-1" />{statusLabel[r.status] ?? r.status}
                      </span>
                      <span className={`text-[10px] font-bold ${PRIORITY_COLORS[r.priority]}`}>
                        {r.priority === "urgent" ? "🔴 HARAKA" : r.priority === "high" ? "🟠 JUU" : r.priority === "normal" ? "🔵 KAWAIDA" : "⚪ CHINI"}
                      </span>
                    </div>
                    <p className="text-[14px] font-bold text-police truncate">{r.subject}</p>
                    <p className="text-[12px] text-police-muted mt-0.5">
                      {REQUEST_TYPES.find(t => t.id === r.type)?.label ?? r.type} · Kwa: {r.approver_role.replace(/_/g," ")}
                    </p>
                  </div>
                  <div className="text-[11px] text-police-faint whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString("sw-TZ")}
                  </div>
                </div>
                {r.response_note && (
                  <div className={`mt-2 rounded-lg px-3 py-2 text-[11px] ${r.status === "approved" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                    💬 {r.response_note}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* New Request Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-lg rounded-3xl bg-police-card shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="h-1 w-full bg-gradient-to-r from-[#1E3A8A] via-[#2196F3] to-[#10B981]" />
            <div className="flex items-center justify-between p-5 border-b border-police-soft">
              <h2 className="text-[17px] font-black text-police">Tuma Ombi Jipya</h2>
              <button onClick={() => setShowNew(false)} className="rounded-full p-1 hover:bg-police-soft"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto p-5 space-y-4">
              {/* Type */}
              <div>
                <label className="mb-1 block text-[12px] font-bold text-police-muted uppercase tracking-wide">Aina ya Ombi</label>
                <select value={type} onChange={e => setType(e.target.value)}
                  className="w-full rounded-xl border border-police bg-police-card px-3 py-2.5 text-[13px] focus:border-[#2196F3] focus:outline-none">
                  {REQUEST_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              {/* Subject */}
              <div>
                <label className="mb-1 block text-[12px] font-bold text-police-muted uppercase tracking-wide">Kichwa cha Ombi</label>
                <input value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Kuomba Kuajiri Maafisa 10 wa Trafiki Dar es Salaam"
                  className="w-full rounded-xl border border-police bg-police-card px-3 py-2.5 text-[13px] focus:border-[#2196F3] focus:outline-none" />
              </div>
              {/* Description */}
              <div>
                <label className="mb-1 block text-[12px] font-bold text-police-muted uppercase tracking-wide">Maelezo ya Kina</label>
                <textarea value={description} onChange={e => setDesc(e.target.value)} rows={4}
                  placeholder="Eleza sababu, mahitaji, na maelezo yote muhimu..."
                  className="w-full rounded-xl border border-police bg-police-card px-3 py-2.5 text-[13px] focus:border-[#2196F3] focus:outline-none resize-none" />
              </div>
              {/* Priority & Approver */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[12px] font-bold text-police-muted uppercase tracking-wide">Kiwango</label>
                  <select value={priority} onChange={e => setPriority(e.target.value)}
                    className="w-full rounded-xl border border-police bg-police-card px-3 py-2.5 text-[13px] focus:border-[#2196F3] focus:outline-none">
                    <option value="low">Chini</option>
                    <option value="normal">Kawaida</option>
                    <option value="high">Juu</option>
                    <option value="urgent">Haraka Sana</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[12px] font-bold text-police-muted uppercase tracking-wide">Tuma Kwa</label>
                  <select value={approverRole} onChange={e => setApprRole(e.target.value)}
                    className="w-full rounded-xl border border-police bg-police-card px-3 py-2.5 text-[13px] focus:border-[#2196F3] focus:outline-none">
                    <option value="NATIONAL_COMMANDER">IGP / Kamishna</option>
                    <option value="REGIONAL_COMMANDER">Kamanda wa Mkoa</option>
                    <option value="DISTRICT_COMMANDER">Kamanda wa Wilaya</option>
                    <option value="STATION_COMMANDER">Kamanda wa Kituo</option>
                    <option value="SUPER_ADMIN">Msimamizi Mkuu</option>
                  </select>
                </div>
              </div>

              {error && <div className="rounded-xl bg-red-50 px-3 py-2 text-[12px] text-red-600">{error}</div>}
            </div>
            <div className="p-5 border-t border-police-soft">
              <button onClick={submit} disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] py-3 text-[14px] font-bold text-white disabled:opacity-60">
                {submitting ? "Inatuma..." : <><Send size={16} /> Tuma Ombi</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-lg rounded-3xl bg-police-card shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="h-1 w-full bg-gradient-to-r from-[#1E3A8A] via-[#2196F3] to-[#10B981]" />
            <div className="flex items-center justify-between p-5 border-b border-police-soft">
              <div>
                <p className="text-[11px] font-mono text-police-muted">{selected.reference_no}</p>
                <h2 className="text-[16px] font-black text-police">{selected.subject}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-full p-1 hover:bg-police-soft"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto p-5 space-y-4">
              <div className="flex gap-2 flex-wrap">
                <span className={`rounded-xl px-3 py-1 text-[11px] font-bold ${STATUS_COLORS[selected.status]}`}>
                  {statusLabel[selected.status] ?? selected.status}
                </span>
                <span className={`text-[11px] font-bold ${PRIORITY_COLORS[selected.priority]}`}>
                  {selected.priority === "urgent" ? "🔴 HARAKA" : selected.priority === "high" ? "🟠 JUU" : "🔵 KAWAIDA"}
                </span>
              </div>
              <div className="rounded-xl bg-police-soft p-4">
                <p className="text-[12px] font-bold text-police-muted mb-1">MAELEZO</p>
                <p className="text-[13px] text-police whitespace-pre-wrap">{selected.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div><p className="text-police-muted font-bold">Imetumwa Kwa</p><p className="text-police">{selected.approver_role?.replace(/_/g," ")}</p></div>
                <div><p className="text-police-muted font-bold">Tarehe</p><p className="text-police">{new Date(selected.created_at).toLocaleString("sw-TZ")}</p></div>
              </div>
              {selected.response_note && (
                <div className={`rounded-xl p-4 ${selected.status === "approved" ? "bg-green-50" : selected.status === "on_hold" ? "bg-orange-50" : "bg-red-50"}`}>
                  <p className="text-[11px] font-bold mb-1">{selected.status === "approved" ? "✅ JIBU LA KIONGOZI" : selected.status === "on_hold" ? "⏸ SABABU YA KUSIMAMISHA" : "❌ SABABU YA KUKATAA"}</p>
                  <p className="text-[13px]">{selected.response_note}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
