"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2, XCircle, PauseCircle, Eye, Clock,
  FileText, ChevronDown, X, AlertTriangle, User, RefreshCw,
} from "lucide-react";
import { authFetch } from "@/lib/client-auth";

const STATUS_COLORS: Record<string, string> = {
  pending:      "bg-yellow-100 text-yellow-700 border-yellow-200",
  under_review: "bg-blue-100 text-blue-700 border-blue-200",
  on_hold:      "bg-orange-100 text-orange-700 border-orange-200",
  approved:     "bg-green-100 text-green-700 border-green-200",
  declined:     "bg-red-100 text-red-700 border-red-200",
};

const PRIORITY_BADGE: Record<string, string> = {
  urgent: "🔴 HARAKA SANA",
  high:   "🟠 JUU",
  normal: "🔵 KAWAIDA",
  low:    "⚪ CHINI",
};

const TYPE_LABELS: Record<string, string> = {
  recruitment: "Ajira", transfer: "Uhamisho", promotion: "Kupandishwa",
  equipment: "Vifaa", budget: "Bajeti", training: "Mafunzo",
  leave: "Likizo", disciplinary: "Kinidhamu", investigation: "Uchunguzi",
  operation: "Operesheni", procurement: "Manunuzi", medical: "Afya",
  legal: "Kisheria", other: "Nyingine",
};

interface Request {
  id: string; reference_no: string; type: string; subject: string;
  description: string; priority: string; status: string;
  requester_name: string; requester_role: string; requester_dept: string;
  requester_region: string; requester_station: string;
  approver_role: string; response_note: string | null;
  hold_reason: string | null; created_at: string;
}

export default function ApprovalsScreen() {
  const [requests, setRequests]   = useState<Request[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<Request | null>(null);
  const [filterStatus, setFilter] = useState("pending");
  const [action, setAction]       = useState<"approve"|"decline"|"hold"|"review"|null>(null);
  const [note, setNote]           = useState("");
  const [processing, setProc]     = useState(false);
  const [error, setError]         = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = filterStatus ? `?status=${filterStatus}` : "";
    const { data } = await authFetch(`/api/command-requests${params}`);
    if (data?.ok) setRequests(data.data ?? []);
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const takeAction = async () => {
    if (!selected || !action) return;
    if ((action === "decline" || action === "hold") && !note.trim()) {
      setError("Tafadhali andika sababu"); return;
    }
    setError(""); setProc(true);
    const { data, error: err } = await authFetch(`/api/command-requests/${selected.id}`, {
      method: "PATCH",
      body: JSON.stringify({ action, note, hold_reason: note }),
    });
    setProc(false);
    if (err || !data?.ok) { setError(data?.error ?? "Imeshindwa"); return; }
    setSelected(null); setAction(null); setNote("");
    load();
  };

  const pendingCount   = requests.filter(r => r.status === "pending").length;
  const urgentCount    = requests.filter(r => r.priority === "urgent" && r.status === "pending").length;

  const statusLabel: Record<string, string> = {
    pending: "Inasubiri", under_review: "Inakaguliwa",
    on_hold: "Imesimama", approved: "Imeidhinishwa", declined: "Imekataliwa",
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-black text-police">Idhini za Maombi</h1>
          <p className="text-[12px] text-police-muted">Kagua na idhinisha maombi kutoka kwa maafisa</p>
        </div>
        <button onClick={load} className="rounded-xl p-2.5 bg-police-soft hover:bg-police-card transition">
          <RefreshCw size={16} className="text-police-muted" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-yellow-50 border border-yellow-100 p-3 text-center">
          <p className="text-[24px] font-black text-yellow-600">{pendingCount}</p>
          <p className="text-[11px] text-yellow-600 font-medium">Yanasubiri</p>
        </div>
        <div className="rounded-2xl bg-red-50 border border-red-100 p-3 text-center">
          <p className="text-[24px] font-black text-red-600">{urgentCount}</p>
          <p className="text-[11px] text-red-600 font-medium">Haraka Sana</p>
        </div>
        <div className="rounded-2xl bg-green-50 border border-green-100 p-3 text-center">
          <p className="text-[24px] font-black text-green-600">{requests.filter(r=>r.status==="approved").length}</p>
          <p className="text-[11px] text-green-600 font-medium">Zilizoidhinishwa</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["pending","under_review","on_hold","approved","declined",""].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-xl px-3 py-1.5 text-[12px] font-semibold transition ${filterStatus === s ? "bg-[#1E3A8A] text-white" : "bg-police-soft text-police-muted hover:bg-police-card"}`}>
            {s ? statusLabel[s] : "Zote"}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1E3A8A] border-t-transparent" /></div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-police-muted">
          <CheckCircle2 size={40} className="mb-3 opacity-30" />
          <p className="font-medium">Hakuna maombi {filterStatus ? statusLabel[filterStatus] : ""}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => (
            <button key={r.id} onClick={() => setSelected(r)}
              className={`w-full rounded-2xl bg-police-card p-4 shadow-sm text-left hover:shadow-md transition border ${r.priority === "urgent" ? "border-red-200" : "border-transparent hover:border-[#1E3A8A]/20"}`}>
              {r.priority === "urgent" && r.status === "pending" && (
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-red-600">
                  <AlertTriangle size={12} /> OMBI LA HARAKA SANA
                </div>
              )}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-police-muted">{r.reference_no}</span>
                    <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border ${STATUS_COLORS[r.status] ?? ""}`}>
                      {statusLabel[r.status] ?? r.status}
                    </span>
                    <span className="text-[10px] font-bold text-police-muted">{PRIORITY_BADGE[r.priority]}</span>
                  </div>
                  <p className="text-[14px] font-bold text-police truncate">{r.subject}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <User size={11} className="text-police-muted" />
                    <p className="text-[11px] text-police-muted">
                      {r.requester_name} · {TYPE_LABELS[r.type] ?? r.type}
                      {r.requester_region ? ` · ${r.requester_region}` : ""}
                    </p>
                  </div>
                </div>
                <div className="text-[11px] text-police-faint whitespace-nowrap">
                  {new Date(r.created_at).toLocaleDateString("sw-TZ")}
                </div>
              </div>

              {/* Quick action buttons for pending */}
              {r.status === "pending" && (
                <div className="mt-3 flex gap-2" onClick={e => e.stopPropagation()}>
                  <button onClick={() => { setSelected(r); setAction("approve"); }}
                    className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-green-500 py-2 text-[12px] font-bold text-white hover:bg-green-600">
                    <CheckCircle2 size={14} /> Idhinisha
                  </button>
                  <button onClick={() => { setSelected(r); setAction("hold"); }}
                    className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-orange-400 py-2 text-[12px] font-bold text-white hover:bg-orange-500">
                    <PauseCircle size={14} /> Simamisha
                  </button>
                  <button onClick={() => { setSelected(r); setAction("decline"); }}
                    className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-red-500 py-2 text-[12px] font-bold text-white hover:bg-red-600">
                    <XCircle size={14} /> Kataa
                  </button>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Detail + Action Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-lg rounded-3xl bg-police-card shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className={`h-1.5 w-full ${action === "approve" ? "bg-green-500" : action === "decline" ? "bg-red-500" : action === "hold" ? "bg-orange-400" : "bg-gradient-to-r from-[#1E3A8A] to-[#2196F3]"}`} />
            <div className="flex items-center justify-between p-5 border-b border-police-soft">
              <div>
                <p className="text-[11px] font-mono text-police-muted">{selected.reference_no}</p>
                <h2 className="text-[16px] font-black text-police">{selected.subject}</h2>
              </div>
              <button onClick={() => { setSelected(null); setAction(null); setNote(""); setError(""); }}
                className="rounded-full p-1 hover:bg-police-soft"><X size={18} /></button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4">
              {/* Requester info */}
              <div className="rounded-xl bg-police-soft p-3">
                <div className="flex items-center gap-2 mb-2">
                  <User size={14} className="text-police-muted" />
                  <p className="text-[12px] font-bold text-police-muted uppercase tracking-wide">Mtumaji wa Ombi</p>
                </div>
                <p className="text-[14px] font-bold text-police">{selected.requester_name}</p>
                <p className="text-[12px] text-police-muted">{selected.requester_role?.replace(/_/g," ")} {selected.requester_station ? `· ${selected.requester_station}` : ""} {selected.requester_region ? `· ${selected.requester_region}` : ""}</p>
              </div>

              {/* Description */}
              <div>
                <p className="text-[12px] font-bold text-police-muted mb-1 uppercase tracking-wide">Maelezo</p>
                <p className="text-[13px] text-police whitespace-pre-wrap leading-relaxed">{selected.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div><p className="text-police-muted font-bold">Aina</p><p className="text-police">{TYPE_LABELS[selected.type] ?? selected.type}</p></div>
                <div><p className="text-police-muted font-bold">Kiwango</p><p className="text-police">{PRIORITY_BADGE[selected.priority]}</p></div>
                <div><p className="text-police-muted font-bold">Tarehe</p><p className="text-police">{new Date(selected.created_at).toLocaleString("sw-TZ")}</p></div>
                <div><p className="text-police-muted font-bold">Hali</p><p className={`font-bold ${STATUS_COLORS[selected.status]?.split(" ")[1]}`}>{statusLabel[selected.status]}</p></div>
              </div>

              {/* Action selector */}
              {selected.status === "pending" || selected.status === "under_review" ? (
                <div className="space-y-3">
                  <p className="text-[12px] font-bold text-police-muted uppercase tracking-wide">Chagua Hatua</p>
                  <div className="grid grid-cols-3 gap-2">
                    {([["approve","Idhinisha","bg-green-500"],["hold","Simamisha","bg-orange-400"],["decline","Kataa","bg-red-500"]] as const).map(([a, label, cls]) => (
                      <button key={a} onClick={() => setAction(a as any)}
                        className={`rounded-xl py-2.5 text-[12px] font-bold text-white transition ${cls} ${action === a ? "ring-2 ring-offset-2 ring-current scale-95" : "opacity-80 hover:opacity-100"}`}>
                        {label}
                      </button>
                    ))}
                  </div>

                  {action && (
                    <div>
                      <label className="mb-1 block text-[12px] font-bold text-police-muted uppercase tracking-wide">
                        {action === "approve" ? "Maoni (si lazima)" : "Sababu (lazima)"}
                      </label>
                      <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                        placeholder={action === "approve" ? "Maoni ya ziada..." : action === "hold" ? "Eleza sababu ya kusimamisha..." : "Eleza sababu ya kukataa..."}
                        className="w-full rounded-xl border border-police bg-police-soft px-3 py-2 text-[13px] focus:border-[#1E3A8A] focus:outline-none resize-none" />
                    </div>
                  )}
                  {error && <div className="rounded-xl bg-red-50 px-3 py-2 text-[12px] text-red-600">{error}</div>}
                </div>
              ) : (
                selected.response_note && (
                  <div className={`rounded-xl p-4 ${selected.status === "approved" ? "bg-green-50" : selected.status === "on_hold" ? "bg-orange-50" : "bg-red-50"}`}>
                    <p className="text-[11px] font-bold mb-1">{selected.status === "approved" ? "✅ UAMUZI" : selected.status === "on_hold" ? "⏸ SABABU YA KUSIMAMISHA" : "❌ SABABU YA KUKATAA"}</p>
                    <p className="text-[13px]">{selected.response_note}</p>
                  </div>
                )
              )}
            </div>

            {action && (
              <div className="p-5 border-t border-police-soft">
                <button onClick={takeAction} disabled={processing}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-black text-white disabled:opacity-60 ${action === "approve" ? "bg-green-500" : action === "hold" ? "bg-orange-400" : "bg-red-500"}`}>
                  {processing ? "Inachakata..." : action === "approve" ? "✅ Thibitisha Idhini" : action === "hold" ? "⏸ Simamisha Ombi" : "❌ Kataa Ombi"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
