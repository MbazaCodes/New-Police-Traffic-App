"use client";

import { useState, useEffect, useMemo } from "react";
import {
  CheckCircle2, XCircle, ArrowRightLeft, Clock, Filter,
  Search, X, ChevronDown, Bell, RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePoliceStore } from "@/store/police-store";

type ReqStatus = "pending" | "approved" | "rejected" | "reallocated";
type ReqType   = "Uhamisho" | "Zana za Kazi" | "Likizo" | "Matibabu" | "Mafunzo" | "Nyingine";

interface OfficerRequest {
  id: string;
  type: ReqType;
  officerName: string;
  officerBadge: string;
  station: string;
  region: string;
  details: string;
  priority: "high" | "medium" | "low";
  status: ReqStatus;
  response?: string;
  respondedBy?: string;
  respondedAt?: string;
  newStation?: string;
  createdAt: string;
}

const PRIORITY_COLOR: Record<string, string> = {
  high: "#EF4444", medium: "#FF9800", low: "#10B981",
};
const PRIORITY_LABEL: Record<string, string> = {
  high: "Juu", medium: "Kati", low: "Chini",
};
const STATUS_COLOR: Record<ReqStatus, string> = {
  pending: "#FF9800", approved: "#10B981", rejected: "#EF4444", reallocated: "#2196F3",
};
const STATUS_LABEL: Record<ReqStatus, string> = {
  pending: "Inasubiri", approved: "Imeidhinishwa", rejected: "Imekataliwa", reallocated: "Imehamishwa",
};

export function AdminRequests() {
  const { toast } = useToast();
  const { authRole } = usePoliceStore();

  const [requests, setRequests] = useState<OfficerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ReqStatus>("all");
  const [typeFilter, setTypeFilter]     = useState("all");
  const [selected, setSelected]         = useState<OfficerRequest | null>(null);
  const [responding, setResponding]     = useState(false);
  const [response, setResponse]         = useState("");
  const [newStation, setNewStation]     = useState("");
  const [actionMode, setActionMode]     = useState<"approve"|"reject"|"reallocate"|null>(null);

  const isCommander = [
    "NATIONAL_COMMANDER","REGIONAL_COMMANDER","DISTRICT_COMMANDER",
    "STATION_COMMANDER","SUPER_ADMIN","DIG",
  ].includes(authRole ?? "");

  async function fetchRequests() {
    setLoading(true);
    try {
      const res = await fetch("/api/requests");
      const json = await res.json();
      if (json.ok) setRequests(json.data ?? []);
    } catch { /* use existing */ }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchRequests(); }, []);

  const filtered = useMemo(() => {
    let r = requests;
    if (statusFilter !== "all") r = r.filter(x => x.status === statusFilter);
    if (typeFilter !== "all")   r = r.filter(x => x.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(x =>
        x.officerName.toLowerCase().includes(q) ||
        x.officerBadge.toLowerCase().includes(q) ||
        x.station.toLowerCase().includes(q) ||
        x.details.toLowerCase().includes(q)
      );
    }
    return r;
  }, [requests, statusFilter, typeFilter, search]);

  const counts = {
    all: requests.length,
    pending:    requests.filter(r => r.status === "pending").length,
    approved:   requests.filter(r => r.status === "approved").length,
    rejected:   requests.filter(r => r.status === "rejected").length,
    reallocated:requests.filter(r => r.status === "reallocated").length,
  };

  async function handleAction(action: "approve"|"reject"|"reallocate") {
    if (!selected) return;
    if (action !== "reject" && !response.trim()) {
      toast({ title: "Tafadhali andika jibu", variant: "destructive" }); return;
    }
    setResponding(true);
    try {
      const res = await fetch(`/api/requests/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, response, newStation: newStation || undefined }),
      });
      const json = await res.json();
      if (!res.ok) { toast({ title: "Hitilafu", description: json.error, variant: "destructive" }); return; }

      setRequests(prev => prev.map(r =>
        r.id === selected.id
          ? { ...r, status: action === "approve" ? "approved" : action === "reject" ? "rejected" : "reallocated",
              response, respondedAt: new Date().toISOString(), newStation: newStation || undefined }
          : r
      ));
      toast({
        title: action === "approve" ? "Ombi Limeidhinishwa ✓"
             : action === "reject"  ? "Ombi Limekataliwa"
             : "Afisa Amehamishwa ✓",
        description: `Jibu limetumwa kwa ${selected.officerName}`,
      });
      setSelected(null); setActionMode(null); setResponse(""); setNewStation("");
    } catch { toast({ title: "Hitilafu ya mtandao", variant: "destructive" }); }
    finally { setResponding(false); }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="tpf-section-title">Maombi ya Maafisa</h1>
          <p className="tpf-section-subtitle">
            {counts.pending} yanasubiri · {counts.approved} imeidhinishwa · {requests.length} jumla
          </p>
        </div>
        <button onClick={fetchRequests} className="flex items-center gap-1.5 rounded-xl bg-police-muted px-3 py-2 text-[12px] font-semibold text-police-muted">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Sasisha
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all","pending","approved","rejected","reallocated"] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`shrink-0 rounded-xl px-3 py-1.5 text-[11px] font-bold transition ${
              statusFilter === s
                ? s === "all" ? "bg-[#1E3A8A] text-white"
                  : `text-white`
                : "bg-police-card border border-police text-police-muted"
            }`}
            style={statusFilter === s && s !== "all" ? { backgroundColor: STATUS_COLOR[s] } : {}}
          >
            {s === "all" ? "Zote" : STATUS_LABEL[s]} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Search + type filter */}
      <div className="flex flex-wrap gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-police bg-police-card px-3">
          <Search size={14} className="text-police-faint" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tafuta afisa, kituo, maelezo..."
            className="h-9 flex-1 bg-transparent text-[12px] text-police placeholder:text-police-faint focus:outline-none" />
          {search && <button onClick={() => setSearch("")}><X size={12} className="text-police-faint"/></button>}
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="rounded-xl border border-police bg-police-card px-3 py-2 text-[12px] text-police focus:outline-none">
          <option value="all">Aina Zote</option>
          {["Uhamisho","Zana za Kazi","Likizo","Matibabu","Mafunzo","Nyingine"].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Request list */}
      {loading ? (
        <div className="flex justify-center py-10"><RefreshCw size={20} className="animate-spin text-police-faint"/></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-police-card py-10 text-center text-[13px] text-police-faint">Hakuna maombi yaliyopatikana</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => (
            <div key={req.id}
              className="rounded-2xl bg-police-card p-4 shadow-sm cursor-pointer hover:shadow-md transition"
              onClick={() => { setSelected(req); setActionMode(null); setResponse(req.response || ""); setNewStation(req.newStation || ""); }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-bold text-police">{req.officerName}</span>
                    <span className="rounded-full bg-[#1E3A8A]/10 px-2 py-0.5 text-[9px] font-bold text-[#1E3A8A]">{req.officerBadge}</span>
                    <span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
                      style={{ backgroundColor: STATUS_COLOR[req.status] }}>
                      {STATUS_LABEL[req.status]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-police-muted">{req.station} · {req.region}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="rounded-lg border border-police bg-police-muted px-2 py-0.5 text-[10px] font-semibold text-police">{req.type}</span>
                    <span className="rounded-lg px-2 py-0.5 text-[9px] font-bold text-white"
                      style={{ backgroundColor: PRIORITY_COLOR[req.priority] }}>
                      {PRIORITY_LABEL[req.priority]}
                    </span>
                    <span className="text-[10px] text-police-faint">{new Date(req.createdAt).toLocaleDateString("sw-TZ")}</span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-police-muted line-clamp-1">{req.details}</p>
                </div>
                {req.status === "pending" && isCommander && (
                  <div className="flex shrink-0 gap-1">
                    <button onClick={e => { e.stopPropagation(); setSelected(req); setActionMode("approve"); }}
                      className="rounded-lg bg-[#10B981]/15 p-1.5 text-[#10B981] hover:bg-[#10B981]/25">
                      <CheckCircle2 size={16}/>
                    </button>
                    <button onClick={e => { e.stopPropagation(); setSelected(req); setActionMode("reject"); }}
                      className="rounded-lg bg-[#EF4444]/15 p-1.5 text-[#EF4444] hover:bg-[#EF4444]/25">
                      <XCircle size={16}/>
                    </button>
                    <button onClick={e => { e.stopPropagation(); setSelected(req); setActionMode("reallocate"); }}
                      className="rounded-lg bg-[#2196F3]/15 p-1.5 text-[#2196F3] hover:bg-[#2196F3]/25">
                      <ArrowRightLeft size={16}/>
                    </button>
                  </div>
                )}
              </div>
              {req.response && (
                <div className="mt-2.5 rounded-lg bg-police-muted px-3 py-2 text-[10px] text-police-muted">
                  <span className="font-bold">Jibu:</span> {req.response}
                  {req.respondedBy && <span className="ml-1 text-police-faint">— {req.respondedBy}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action modal */}
      {selected && actionMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setSelected(null); setActionMode(null); }}/>
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-police-card shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4" style={{
              backgroundColor: actionMode === "approve" ? "#10B981" : actionMode === "reject" ? "#EF4444" : "#2196F3"
            }}>
              <h3 className="text-[15px] font-bold text-white">
                {actionMode === "approve" ? "Idhinisha Ombi"
                 : actionMode === "reject" ? "Kataa Ombi"
                 : "Hamisha Afisa"}
              </h3>
              <button onClick={() => { setSelected(null); setActionMode(null); }} className="text-white/70 hover:text-white">
                <X size={18}/>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="rounded-xl bg-police-muted p-3">
                <p className="text-[12px] font-bold text-police">{selected.officerName} · {selected.type}</p>
                <p className="text-[11px] text-police-muted mt-0.5">{selected.details}</p>
              </div>

              {actionMode === "reallocate" && (
                <div>
                  <label className="block text-[11px] font-semibold text-police-muted mb-1">Kituo Kipya</label>
                  <input value={newStation} onChange={e => setNewStation(e.target.value)}
                    placeholder="Jina la kituo kipya cha kazi..."
                    className="tpf-input"/>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-police-muted mb-1">
                  {actionMode === "reject" ? "Sababu ya Kukataa (si lazima)" : "Ujumbe wa Jibu"}
                </label>
                <textarea value={response} onChange={e => setResponse(e.target.value)}
                  rows={3}
                  placeholder={actionMode === "approve"
                    ? "Maelezo ya ziada kwa afisa..." 
                    : actionMode === "reject"
                    ? "Sababu ya kukataa..."
                    : `Afisa ${selected.officerName} amehamishwa kwenda ${newStation || "kituo kipya"}...`}
                  className="w-full rounded-xl border border-police bg-police-input px-3 py-2 text-[12px] text-police focus:border-[#2196F3] focus:outline-none resize-none"/>
              </div>

              <div className="flex gap-2">
                <button onClick={() => { setSelected(null); setActionMode(null); }}
                  className="flex-1 rounded-xl border border-police py-2.5 text-[12px] font-semibold text-police-muted">
                  Ghairi
                </button>
                <button onClick={() => handleAction(actionMode)} disabled={responding}
                  className="flex-1 rounded-xl py-2.5 text-[12px] font-bold text-white disabled:opacity-50"
                  style={{ backgroundColor: actionMode === "approve" ? "#10B981" : actionMode === "reject" ? "#EF4444" : "#2196F3" }}>
                  {responding ? <RefreshCw size={14} className="mx-auto animate-spin"/> :
                    actionMode === "approve" ? "Idhinisha" : actionMode === "reject" ? "Kataa" : "Hamisha"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
