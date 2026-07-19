"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Radio,
  MapPin,
  AlertTriangle,
  Shield,
  Users,
  Zap,
  Phone,
  Mic,
  Navigation,
  Eye,
  Send,
  Clock,
  Activity,
  ChevronRight,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { usePoliceStore, type AdminScreen } from "@/store/police-store";
import { toast } from "@/hooks/use-toast";

// ── Mock data for Command Center ──────────────────────────────────────────────

const ACTIVE_PATROLS = [
  { id: "PAT-001", officer: "Cprl. Juma Khamis Mwinyi",    badge: "TP123456", unit: "Traffic-01",  area: "Morogoro Road",   status: "active", lat: -6.8235, lng: 39.2695, speed: "45 km/h", lastUpdate: "30s" },
  { id: "PAT-002", officer: "Sgt. Ali Hassan Salum",        badge: "TP234567", unit: "Traffic-02",  area: "Samora Ave",      status: "active", lat: -6.816,  lng: 39.289,  speed: "0 km/h",  lastUpdate: "1m"  },
  { id: "PAT-003", officer: "Insp. Hamisi Rashid Omar",     badge: "GO234567", unit: "General-01",  area: "Ubungo Terminal", status: "sos",    lat: -6.824,  lng: 39.277,  speed: "0 km/h",  lastUpdate: "5s"  },
  { id: "PAT-004", officer: "Cprl. Saidi Juma Bakari",      badge: "TP456789", unit: "Traffic-03",  area: "Ubungo",          status: "break",  lat: -6.778,  lng: 39.233,  speed: "0 km/h",  lastUpdate: "3m"  },
  { id: "PAT-005", officer: "Cpl. Mariamu Ally Komba",      badge: "TP567890", unit: "Patrol-01",   area: "Mbezi Beach",     status: "active", lat: -6.766,  lng: 39.251,  speed: "60 km/h", lastUpdate: "15s" },
  { id: "PAT-006", officer: "Insp. Grace Amina Mushi",      badge: "GO123456", unit: "General-02",  area: "Kariakoo",        status: "active", lat: -6.812,  lng: 39.271,  speed: "0 km/h",  lastUpdate: "2m"  },
];

const RADIO_LOGS = [
  { id: 1, time: "08:32", callSign: "Cprl. Juma (TP-123456)",  message: "Nimefika eneo la ajali - Morogoro Road. Majeruhi 2.", type: "report"    },
  { id: 2, time: "08:30", callSign: "Command Center",           message: "Traffic-01 (Cprl. Juma), nenda Morogoro Road kwa ajali.", type: "dispatch" },
  { id: 3, time: "08:28", callSign: "Insp. Hamisi (GO-234567)", message: "SOS! Nahitaji msaada — Ubungo Terminal!", type: "sos"  },
  { id: 4, time: "08:25", callSign: "Sgt. Ali (TP-234567)",     message: "Nimekamilisha doria — Samora Ave iko safi.", type: "report"    },
  { id: 5, time: "08:20", callSign: "Command Center",           message: "Vikosi vyote: mvua inatarajiwa DSM — tahadhari barabarani.", type: "broadcast" },
  { id: 6, time: "08:15", callSign: "Cpl. Mariamu (TP-567890)", message: "Nimegundua gari linaloshukiwa — plate T 015 QRS, Mbezi Beach.", type: "report" },
  { id: 7, time: "08:10", callSign: "Cprl. Saidi (TP-456789)",  message: "Mapumziko ya dakika 15 — Ubungo station.", type: "status"   },
];

const DISPATCH_QUEUE = [
  { id: "DIS-001", type: "Ajali ya Gari", location: "Morogoro Road, DSM", priority: "high", unassigned: false, assignedTo: "Traffic-01", time: "08:15" },
  { id: "DIS-002", type: "Wizi wa Gari", location: "Kariakoo, DSM", priority: "high", unassigned: true, assignedTo: null, time: "08:28" },
  { id: "DIS-003", type: "Tukio la Umma", location: "Mnazi Mmoja, DSM", priority: "medium", unassigned: true, assignedTo: null, time: "08:35" },
  { id: "DIS-004", type: "Kosa la Trafiki", location: "Posta, DSM", priority: "low", unassigned: true, assignedTo: null, time: "08:40" },
];

const SOS_ALERT = ACTIVE_PATROLS.find((p) => p.status === "sos");

const GRID_PATROL_STATUS = [
  { area: "Ilala", patrols: 4, active: 3 },
  { area: "Kinondoni", patrols: 5, active: 5 },
  { area: "Temeke", patrols: 3, active: 2 },
  { area: "Ubungo", patrols: 4, active: 3 },
  { area: "Kigamboni", patrols: 2, active: 1 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const PATROL_STATUS_STYLE: Record<string, string> = {
  active: "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/500/30",
  sos: "bg-[#EF4444]/100/15 text-[#EF4444] border border-[#EF4444]/500/30 animate-pulse",
  break: "bg-[#FF9800]/15 text-[#FF9800] border border-[#FF9800]/30",
  "off-duty": "bg-gray-500/15 text-gray-400 border border-gray-500/20",
};

const PATROL_STATUS_LABEL: Record<string, string> = {
  active: "Kazini",
  sos: "SOS!",
  break: "Mapumziko",
  "off-duty": "Nje ya Zamu",
};

const RADIO_TYPE_STYLE: Record<string, string> = {
  report: "text-[#2196F3]",
  dispatch: "text-[#1E3A8A]",
  sos: "text-[#EF4444] font-bold",
  broadcast: "text-[#FF9800]",
  status: "text-police-muted",
};

const PRIORITY_STYLE: Record<string, string> = {
  high: "bg-[#EF4444]/100/15 text-[#EF4444] border border-[#EF4444]/500/30",
  medium: "bg-[#FF9800]/15 text-[#FF9800] border border-[#FF9800]/30",
  low: "bg-blue-500/15 text-[#2196F3] border border-blue-500/30",
};

// ── Map placeholder (ASCII/SVG style — real map via Supabase + MapLibre later) ─

function MapView({ patrols }: { patrols: typeof ACTIVE_PATROLS }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-[#0d1b3d]">
      {/* Grid lines */}
      <svg className="absolute inset-0 h-full w-full opacity-10" preserveAspectRatio="none">
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`} stroke="#2196F3" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`v${i}`} x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%" stroke="#2196F3" strokeWidth="0.5" />
        ))}
      </svg>

      {/* Roads - simplified DSM road mockup */}
      <svg className="absolute inset-0 h-full w-full opacity-20" preserveAspectRatio="none">
        <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="#10B981" strokeWidth="1.5" />
        <line x1="50%" y1="10%" x2="50%" y2="90%" stroke="#10B981" strokeWidth="1.5" />
        <line x1="20%" y1="20%" x2="80%" y2="80%" stroke="#10B981" strokeWidth="1" />
        <line x1="80%" y1="20%" x2="20%" y2="80%" stroke="#10B981" strokeWidth="1" />
      </svg>

      {/* Patrol pins */}
      {patrols.map((p, i) => {
        // Map GPS coords to percentage position (rough DSM bounding box)
        const x = ((p.lng - 39.2) / 0.15) * 80 + 10;
        const y = ((p.lat + 6.85) / 0.1) * 80 + 10;
        const isSos = p.status === "sos";

        return (
          <div
            key={p.id}
            className="absolute flex flex-col items-center"
            style={{ left: `${Math.max(5, Math.min(90, x))}%`, top: `${Math.max(5, Math.min(85, y))}%`, transform: "translate(-50%, -50%)" }}
          >
            {isSos && (
              <div className="absolute h-8 w-8 animate-ping rounded-full bg-[#EF4444]/100/40" />
            )}
            <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-[9px] font-bold text-white ${isSos ? "border-[#EF4444]/500 bg-[#EF4444]/600" : "border-[#2196F3] bg-[#1E3A8A]"}`}>
              {i + 1}
            </div>
            <div className="mt-0.5 rounded bg-black/70 px-1 py-0.5 text-[8px] text-white whitespace-nowrap">
              {p.unit}
            </div>
          </div>
        );
      })}

      {/* Map label */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/60 px-2 py-1 text-[10px] text-white/70">
        <MapPin size={10} />
        Dar es Salaam — Mfumo wa Ramani
      </div>

      {/* Live indicator */}
      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-lg bg-black/60 px-2 py-1 text-[10px] text-[#10B981]400">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#10B981]" />
        MOJA KWA MOJA
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function CommandCenter() {
  const pathname = usePathname();
  const { setAdminScreen } = usePoliceStore();
  const [radioMessage, setRadioMessage] = useState("");
  const [selectedPatrol, setSelectedPatrol] = useState<string | null>(null);
  const [logs, setLogs] = useState(RADIO_LOGS);
  const [dispatchQueue, setDispatchQueue] = useState(DISPATCH_QUEUE);
  const [showEmergency, setShowEmergency] = useState(false);

  function sendRadio() {
    if (!radioMessage.trim()) return;
    const newLog = {
      id: logs.length + 1,
      time: new Date().toLocaleTimeString("sw-TZ", { hour: "2-digit", minute: "2-digit" }),
      callSign: "Command",
      message: radioMessage.trim(),
      type: "broadcast" as const,
    };
    setLogs([newLog, ...logs]);
    setRadioMessage("");
  }

  function assignDispatch(id: string) {
    setDispatchQueue((q) =>
      q.map((d) =>
        d.id === id ? { ...d, unassigned: false, assignedTo: "Traffic-01" } : d
      )
    );
  }

  const sosOfficer = ACTIVE_PATROLS.find((p) => p.status === "sos");
  const sosOfficerId = sosOfficer
    ? OFFICERS.find((o) => o.name === sosOfficer.officer)?.id
    : undefined;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-police-navy">Kituo cha Amri</h1>
          <p className="text-[13px] text-police-muted">Udhibiti wa moja kwa moja — Dar es Salaam</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg bg-[#10B981]/10 px-3 py-1.5 text-[12px] text-[#10B981] border border-[#10B981]/500/20">
            <Wifi size={13} />
            <span>Mawasiliano: Yakiwa</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-police-card px-3 py-1.5 text-[12px] text-police-muted shadow-sm">
            <Radio size={13} className="text-[#2196F3]" />
            <span>Ch. 3 — Trafiki DSM</span>
          </div>
        </div>
      </div>

      {/* SOS Banner */}
      {sosOfficer && (
        <div className="flex items-center gap-3 rounded-xl border border-[#EF4444]/500/40 bg-[#EF4444]/100/10 p-4">
          <div className="flex h-10 w-10 shrink-0 animate-pulse items-center justify-center rounded-full bg-[#EF4444]/100 text-white">
            <Zap size={20} />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-[#EF4444]">🚨 SIMU YA MSAADA — SOS</p>
            <p className="text-[12px] text-[#EF4444]400">
              {sosOfficerId ? (
                <Link href={`/command/officers/${encodeURIComponent(sosOfficerId)}`} className="font-semibold text-[#EF4444]300 underline-offset-2 hover:underline">
                  {sosOfficer.officer}
                </Link>
              ) : (
                sosOfficer.officer
              )} · {sosOfficer.unit} · {sosOfficer.area}
            </p>
          </div>
          <button
            onClick={() => setShowEmergency(true)}
            className="flex items-center gap-2 rounded-lg bg-[#EF4444]/100 px-4 py-2 text-[13px] font-bold text-white hover:bg-[#EF4444]/600"
          >
            <Phone size={14} />
            Piga Simu
          </button>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Maofisa Kazini", value: ACTIVE_PATROLS.filter((p) => p.status === "active").length.toString(), icon: Users, color: "#2196F3", screen: "officers" as AdminScreen },
          { label: "Patroli Kazini", value: "23", icon: Shield, color: "#10B981", screen: "patrols" as AdminScreen },
          { label: "Matukio Yangu", value: LIVE_INCIDENTS.filter((i) => i.status !== "resolved").length.toString(), icon: AlertTriangle, color: "#FF9800", screen: "incidents" as AdminScreen },
          { label: "Simu za SOS", value: "1", icon: Zap, color: "#EF4444", screen: "alerts" as AdminScreen },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <button
              key={kpi.label}
              onClick={() => {
                setAdminScreen(kpi.screen);
                toast({
                  title: "Inaendelea",
                  description: `Inafungua skrini ya ${kpi.label}`,
                });
              }}
              className="rounded-xl bg-police-card p-3 shadow-sm text-left transition hover:bg-police-muted hover:shadow-md"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg mb-2" style={{ backgroundColor: `${kpi.color}1A`, color: kpi.color }}>
                <Icon size={16} />
              </div>
              <p className="text-xl font-bold text-police-navy">{kpi.value}</p>
              <p className="text-[11px] text-police-muted">{kpi.label}</p>
            </button>
          );
        })}
      </div>

      {/* Main 3-col layout */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Map — takes 2 cols */}
        <div className="xl:col-span-2">
          <div className="rounded-xl bg-police-card p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-[14px] font-bold text-police-navy">Ramani ya Moja kwa Moja</h2>
              <div className="flex items-center gap-3 text-[10px] text-police-muted">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#1E3A8A]" />Kazini</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#EF4444]/100" />SOS</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#FF9800]" />Mapumziko</span>
              </div>
            </div>
            <div className="h-72">
              <MapView patrols={ACTIVE_PATROLS} />
            </div>
          </div>
        </div>

        {/* Patrol list */}
        <div className="rounded-xl bg-police-card p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[14px] font-bold text-police-navy">Doria Zinazoendelea</h2>
            <span className="rounded-md bg-[#2196F3]/10 px-2 py-0.5 text-[11px] font-bold text-[#2196F3]">
              {ACTIVE_PATROLS.length}
            </span>
          </div>
          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 280 }}>
            {ACTIVE_PATROLS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPatrol(selectedPatrol === p.id ? null : p.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition ${
                  selectedPatrol === p.id
                    ? "border-[#2196F3]/40 bg-[#2196F3]/5"
                    : "border-police-soft bg-police-muted/30 hover:border-police"
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1E3A8A] text-[10px] font-bold text-white">
                  {p.unit.split("-")[1]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-police">
                    {(() => {
                      const officer = OFFICERS.find((o) => o.name === p.officer);
                      if (!officer) return p.officer;
                      return (
                        <Link
                          href={`${pathname.startsWith("/command") ? "/command" : "/admin"}/officers/${encodeURIComponent(officer.id)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#2196F3] hover:underline"
                        >
                          {p.officer}
                        </Link>
                      );
                    })()}
                  </p>
                  <p className="text-[10px] text-police-muted">{p.area} · {p.lastUpdate} iliyopita</p>
                </div>
                <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold ${PATROL_STATUS_STYLE[p.status]}`}>
                  {PATROL_STATUS_LABEL[p.status]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Dispatch queue */}
        <div className="rounded-xl bg-police-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[14px] font-bold text-police-navy">Foleni ya Kutuma</h2>
            <span className="rounded-md bg-[#FF9800]/10 px-2 py-0.5 text-[11px] font-bold text-[#FF9800]">
              {dispatchQueue.filter((d) => d.unassigned).length} Kusubiri
            </span>
          </div>
          <div className="space-y-2">
            {dispatchQueue.map((d) => (
              <div key={d.id} className="rounded-lg border border-police-soft bg-police-muted/20 p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${PRIORITY_STYLE[d.priority]}`}>
                        {d.priority.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-police-faint">{d.time}</span>
                    </div>
                    <p className="text-[12px] font-semibold text-police">{d.type}</p>
                    <p className="flex items-center gap-0.5 text-[10px] text-police-muted">
                      <MapPin size={9} />
                      {d.location}
                    </p>
                    {!d.unassigned && (
                      <p className="mt-0.5 text-[10px] text-[#10B981]">→ {d.assignedTo}</p>
                    )}
                  </div>
                  {d.unassigned && (
                    <button
                      onClick={() => assignDispatch(d.id)}
                      className="shrink-0 rounded-lg bg-[#1E3A8A] px-2 py-1.5 text-[10px] font-bold text-white hover:bg-[#2196F3]"
                    >
                      <Send size={11} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Radio log */}
        <div className="rounded-xl bg-police-card p-4 shadow-sm lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[14px] font-bold text-police-navy">Kumbukumbu ya Redio</h2>
            <div className="flex items-center gap-1.5 text-[11px] text-[#10B981]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#10B981]" />
              Inasikiliza
            </div>
          </div>

          {/* Log feed */}
          <div className="mb-3 h-48 space-y-2 overflow-y-auto app-scroll">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 rounded-lg border border-police-soft bg-police-muted/20 px-3 py-2">
                <span className="shrink-0 text-[10px] text-police-faint font-mono">{log.time}</span>
                <span className={`shrink-0 text-[11px] font-bold ${RADIO_TYPE_STYLE[log.type]}`}>[{log.callSign}]</span>
                <p className="text-[12px] text-police">{log.message}</p>
              </div>
            ))}
          </div>

          {/* Send message */}
          <div className="flex items-center gap-2 rounded-lg border border-police bg-police-input px-3 py-2">
            <Mic size={15} className="shrink-0 text-police-navy" />
            <input
              value={radioMessage}
              onChange={(e) => setRadioMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendRadio()}
              placeholder="Tuma ujumbe kwa vikosi vyote..."
              className="flex-1 bg-transparent text-[13px] text-police placeholder:text-police-faint focus:outline-none"
            />
            <button
              onClick={sendRadio}
              disabled={!radioMessage.trim()}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#2196F3] text-white disabled:opacity-40"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Area patrol coverage */}
      <div className="rounded-xl bg-police-card p-4 shadow-sm">
        <h2 className="mb-3 text-[14px] font-bold text-police-navy">Ufunikaji wa Doria — Wilaya za DSM</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {GRID_PATROL_STATUS.map((area) => {
            const pct = Math.round((area.active / area.patrols) * 100);
            const color = pct >= 80 ? "#10B981" : pct >= 50 ? "#FF9800" : "#EF4444";
            return (
              <button
                key={area.area}
                onClick={() => {
                  setAdminScreen("patrols");
                  toast({
                    title: "Inaendelea",
                    description: `Inafungua skrini ya Patroli (${area.area})`,
                  });
                }}
                className="rounded-xl border border-police-soft bg-police-muted/30 p-3 text-center transition hover:bg-police-muted/60"
              >
                <p className="text-[13px] font-bold text-police">{area.area}</p>
                <p className="mt-1 text-2xl font-bold" style={{ color }}>{pct}%</p>
                <p className="text-[10px] text-police-muted">{area.active}/{area.patrols} Doria</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-police-input">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Emergency contacts modal */}
      {showEmergency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowEmergency(false)} aria-hidden />
          <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-police-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-police-soft bg-[#EF4444]/100/10 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EF4444]/100/15 text-[#EF4444]">
                  <Phone size={18} />
                </div>
                <p className="text-[15px] font-bold text-police">Nambari za Dharura</p>
              </div>
              <button onClick={() => setShowEmergency(false)} className="rounded-lg p-1.5 text-police-faint hover:bg-police-muted">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2 p-4">
              {[
                { label: "Polisi (Dharura)", number: "112" },
                { label: "Zima Moto", number: "115" },
                { label: "Ardhi ya Wagonjwa", number: "114" },
                { label: "Msaada wa Ajali", number: "111" },
              ].map((e) => (
                <a
                  key={e.number}
                  href={`tel:${e.number}`}
                  className="flex items-center justify-between rounded-lg border border-police-soft bg-police-input p-3 transition hover:bg-police-muted"
                >
                  <span className="text-[13px] font-semibold text-police">{e.label}</span>
                  <span className="flex items-center gap-2 font-mono text-[14px] font-bold text-[#EF4444]">
                    {e.number} <Phone size={14} />
                  </span>
                </a>
              ))}
              <p className="mt-2 rounded-lg bg-[#EF4444]/100/5 p-2 text-center text-[11px] text-[#EF4444]">
                Bonyeza nambari kupiga simu moja kwa moja
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
