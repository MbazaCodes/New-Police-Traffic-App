"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  MapPin,
  Clock,
  Route,
  Activity,
  CheckCircle2,
  Navigation,
  X,
  Phone,
} from "lucide-react";
import { OFFICERS } from "@/lib/admin-data";
import { getOfficerProfilePath } from "@/lib/admin-navigation";
import { useRecordsStore, type AdminPatrolRecord } from "@/store/records-store";
import { toast } from "@/hooks/use-toast";

export function AdminPatrols() {
  const pathname = usePathname();
  const patrols = useRecordsStore((s) => s.adminPatrols);
  const endAdminPatrol = useRecordsStore((s) => s.endAdminPatrol);
  const [activePin, setActivePin] = useState<AdminPatrolRecord | null>(null);

  const total = patrols.length;
  const activeList = patrols.filter((p) => p.status === "active");
  const totalDistance = activeList.reduce(
    (sum, p) => sum + parseFloat(p.distance),
    0
  );
  const avgProgress =
    total > 0
      ? Math.round(activeList.reduce((sum, p) => sum + p.progress, 0) / Math.max(activeList.length, 1))
      : 0;

  const handleEndPatrol = (p: AdminPatrolRecord) => {
    endAdminPatrol(p.id);
    toast({
      title: "Patroli Imekamilika",
      description: `Patroli ya ${p.officer} (${p.id}) imemalizika`,
    });
  };

  return (
    <div className="space-y-5">
      {/* Heading */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-police-navy">Patroli</h1>
          <p className="text-[13px] text-police-muted">
            Fuatilia patroli zinazoendelea moja kwa moja
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-police-card px-3 py-1.5 text-[12px] text-police-muted shadow-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#10B981]" />
          {activeList.length} patroli sasa zinazoendelea
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <PatrolStat
          icon={<Shield size={18} />}
          label="Patroli Zinazoendelea"
          value={String(activeList.length)}
          color="#10B981"
        />
        <PatrolStat
          icon={<Route size={18} />}
          label="Jumla ya Umbali"
          value={`${totalDistance.toFixed(1)} km`}
          color="#2196F3"
        />
        <PatrolStat
          icon={<Activity size={18} />}
          label="Wastani wa Maendeleo"
          value={`${avgProgress}%`}
          color="#FF9800"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Active patrols list */}
        <div className="rounded-xl bg-police-card p-4 shadow-sm xl:col-span-2">
          <h2 className="mb-3 text-[14px] font-bold text-police-navy">
            Patroli Zinazoendelea
          </h2>
          <div className="space-y-3">
            {patrols.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border border-police-soft bg-police-muted/40 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      p.status === "completed" ? "bg-police-input text-police-muted" : "bg-[#10B981]/15 text-[#10B981]"
                    }`}>
                      <Shield size={16} />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-police">
                        {(() => {
                          const officer = OFFICERS.find((o) => o.name === p.officer);
                          if (!officer) return p.officer;
                          return (
                            <Link href={getOfficerProfilePath(pathname, officer.id)} className="hover:underline text-[#2196F3]">
                              {p.officer}
                            </Link>
                          );
                        })()}
                      </p>
                      <p className="text-[11px] text-police-muted">
                        <MapPin size={10} className="mr-0.5 inline" />
                        {p.area}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                    p.status === "completed" ? "bg-police-input text-police-muted" : "bg-[#10B981]/15 text-[#10B981]"
                  }`}>
                    {p.status === "completed" ? "Imekamilika" : "Inaendelea"}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-police-muted">
                    <Clock size={12} /> Anza: <strong className="text-police">{p.start}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-police-muted">
                    <Route size={12} /> Umbali:{" "}
                    <strong className="text-police">{p.distance}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-police-muted">
                    <Navigation size={12} /> ID:{" "}
                    <strong className="text-police">{p.id}</strong>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-[10px] text-police-faint">
                    <span>Maendeleo ya Patroli</span>
                    <span className="font-bold text-police-navy">{p.progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-police-input">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2196F3] to-[#10B981] transition-all"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() =>
                      toast({
                        title: "Imefanikiwa",
                        description: `Umeongea na ${p.officer} kwenye redio`,
                      })
                    }
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#2196F3] py-1.5 text-[11px] font-semibold text-white hover:bg-[#2196F3]"
                  >
                    <Phone size={12} /> Wasiliana
                  </button>
                  <button
                    onClick={() => handleEndPatrol(p)}
                    disabled={p.status === "completed"}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-police-input py-1.5 text-[11px] font-semibold text-police-navy hover:bg-police-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {p.status === "completed" ? "Imekamilika" : "Maliza Patroli"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map placeholder */}
        <div className="rounded-xl bg-police-card p-4 shadow-sm">
          <h2 className="mb-3 text-[14px] font-bold text-police-navy">
            Ramani ya Patroli
          </h2>
          <div
            className="relative h-[420px] w-full overflow-hidden rounded-lg border border-police-soft"
            style={{
              background:
                "linear-gradient(135deg, rgba(33,150,243,0.08) 0%, rgba(76,175,80,0.08) 100%)",
            }}
          >
            {/* Grid lines */}
            <svg className="absolute inset-0 h-full w-full opacity-30" aria-hidden>
              <defs>
                <pattern
                  id="grid"
                  width="32"
                  height="32"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 32 0 L 0 0 0 32"
                    fill="none"
                    stroke="var(--police-border)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Fake roads */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 300 420"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path
                d="M 0 120 Q 100 100 200 150 T 300 180"
                fill="none"
                stroke="rgba(120,144,176,0.35)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M 50 0 L 80 200 L 120 420"
                fill="none"
                stroke="rgba(120,144,176,0.35)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M 0 300 Q 150 280 300 320"
                fill="none"
                stroke="rgba(120,144,176,0.25)"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>

            {/* Patrol pins */}
            {patrols.map((p, i) => {
              const positions = [
                { top: "22%", left: "28%" },
                { top: "40%", left: "62%" },
                { top: "60%", left: "20%" },
                { top: "75%", left: "70%" },
                { top: "32%", left: "80%" },
              ];
              const pos = positions[i % positions.length];
              const isCompleted = p.status === "completed";
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePin(p)}
                  className="group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                  style={pos}
                  title={p.officer}
                >
                  <div className="relative">
                    {!isCompleted && (
                      <span className="absolute inset-0 -m-1 animate-ping rounded-full bg-[#10B981]/30" />
                    )}
                    <div className={`relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow-lg transition group-hover:scale-125 ${
                      isCompleted ? "bg-police-muted text-police-navy" : "bg-[#10B981]"
                    }`}>
                      <Shield size={11} className={isCompleted ? "" : "text-white"} />
                    </div>
                  </div>
                  <div className="pointer-events-none absolute left-1/2 top-7 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-police-card px-2 py-1 text-[10px] font-semibold text-police shadow-md group-hover:block">
                    {p.officer.split(" ").slice(-1)[0]} • {p.progress}% {isCompleted ? "(Imekamilika)" : ""}
                  </div>
                </button>
              );
            })}

            {/* Legend */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-police-card/95 px-2.5 py-1.5 text-[10px] text-police-muted shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#10B981]" />
              Patroli Inaendelea
            </div>
            <div className="absolute right-3 top-3 rounded-lg bg-police-card/95 px-2.5 py-1.5 text-[10px] font-semibold text-police-navy shadow-sm">
              Dar es Salaam
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-lg bg-police-muted/40 p-2.5 text-[11px] text-police-muted">
            <CheckCircle2 size={14} className="text-[#10B981]" />
            Ramani hii ni mfano.unganisha na Google Maps kwa ajili ya kufuatilia live. Bonyeza pini kuona maelezo.
          </div>
        </div>
      </div>

      {/* Map pin detail modal */}
      {activePin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setActivePin(null)} aria-hidden />
          <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-police-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-police-soft bg-police-muted/40 p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  activePin.status === "completed" ? "bg-police-input text-police-muted" : "bg-[#10B981]/15 text-[#10B981]"
                }`}>
                  <Shield size={18} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-police">Maelezo ya Patroli</p>
                  <p className="font-mono text-[11px] text-police-faint">{activePin.id}</p>
                </div>
              </div>
              <button onClick={() => setActivePin(null)} className="rounded-lg p-1.5 text-police-faint hover:bg-police-muted">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2 p-4 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-police-muted">Afisa:</span>
                <span className="font-semibold text-police">{activePin.officer}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-police-muted">Eneo:</span>
                <span className="font-semibold text-police">{activePin.area}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-police-muted">Anza:</span>
                <span className="font-semibold text-police">{activePin.start}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-police-muted">Umbali:</span>
                <span className="font-semibold text-police">{activePin.distance}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-police-muted">Hadhi:</span>
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                  activePin.status === "completed" ? "bg-police-input text-police-muted" : "bg-[#10B981]/15 text-[#10B981]"
                }`}>
                  {activePin.status === "completed" ? "Imekamilika" : "Inaendelea"}
                </span>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-[10px] text-police-faint">
                  <span>Maendeleo</span>
                  <span className="font-bold text-police-navy">{activePin.progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-police-input">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#2196F3] to-[#10B981]"
                    style={{ width: `${activePin.progress}%` }}
                  />
                </div>
              </div>
              <button
                onClick={() => setActivePin(null)}
                className="mt-2 w-full rounded-lg bg-[#2196F3] py-2.5 text-[12px] font-semibold text-white hover:bg-[#2196F3]"
              >
                Funga
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PatrolStat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-police-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}1A`, color }}
        >
          {icon}
        </div>
        <div>
          <p className="text-xl font-bold text-police-navy">{value}</p>
          <p className="text-[11px] text-police-muted">{label}</p>
        </div>
      </div>
    </div>
  );
}
