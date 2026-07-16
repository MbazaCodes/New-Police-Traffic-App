"use client";

import {
  Shield,
  MapPin,
  Clock,
  Route,
  Activity,
  CheckCircle2,
  Navigation,
} from "lucide-react";
import { ACTIVE_PATROLS } from "@/lib/admin-data";
import { toast } from "@/hooks/use-toast";

export function AdminPatrols() {
  const total = ACTIVE_PATROLS.length;
  const totalDistance = ACTIVE_PATROLS.reduce(
    (sum, p) => sum + parseFloat(p.distance),
    0
  );
  const avgProgress = Math.round(
    ACTIVE_PATROLS.reduce((sum, p) => sum + p.progress, 0) / total
  );

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
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          {total} patroli sasa zinazoendelea
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <PatrolStat
          icon={<Shield size={18} />}
          label="Patroli Zinazoendelea"
          value={String(total)}
          color="#4CAF50"
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
            {ACTIVE_PATROLS.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border border-police-soft bg-police-muted/40 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/15 text-green-500">
                      <Shield size={16} />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-police">
                        {p.officer}
                      </p>
                      <p className="text-[11px] text-police-muted">
                        <MapPin size={10} className="mr-0.5 inline" />
                        {p.area}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-md bg-green-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-green-500">
                    Inaendelea
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
                      className="h-full rounded-full bg-gradient-to-r from-[#2196F3] to-[#4CAF50] transition-all"
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
                    className="flex-1 rounded-lg bg-[#2196F3] py-1.5 text-[11px] font-semibold text-white hover:bg-[#1E88E5]"
                  >
                    Wasiliana
                  </button>
                  <button
                    onClick={() =>
                      toast({
                        title: "Imefanikiwa",
                        description: `Patroli ya ${p.id} imeishia`,
                      })
                    }
                    className="flex-1 rounded-lg bg-police-input py-1.5 text-[11px] font-semibold text-police-navy hover:bg-police-muted"
                  >
                    Maliza Patroli
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
            {ACTIVE_PATROLS.map((p, i) => {
              const positions = [
                { top: "22%", left: "28%" },
                { top: "40%", left: "62%" },
                { top: "60%", left: "20%" },
                { top: "75%", left: "70%" },
                { top: "32%", left: "80%" },
              ];
              const pos = positions[i % positions.length];
              return (
                <div
                  key={p.id}
                  className="group absolute -translate-x-1/2 -translate-y-1/2"
                  style={pos}
                >
                  <div className="relative">
                    <span className="absolute inset-0 -m-1 animate-ping rounded-full bg-green-500/30" />
                    <div className="relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-green-500 shadow-lg">
                      <Shield size={9} className="text-white" />
                    </div>
                  </div>
                  <div className="pointer-events-none absolute left-1/2 top-7 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-police-card px-2 py-1 text-[10px] font-semibold text-police shadow-md group-hover:block">
                    {p.officer.split(" ").slice(-1)[0]} • {p.progress}%
                  </div>
                </div>
              );
            })}

            {/* Legend */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-police-card/95 px-2.5 py-1.5 text-[10px] text-police-muted shadow-sm">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Patroli Inaendelea
            </div>
            <div className="absolute right-3 top-3 rounded-lg bg-police-card/95 px-2.5 py-1.5 text-[10px] font-semibold text-police-navy shadow-sm">
              Dar es Salaam
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-lg bg-police-muted/40 p-2.5 text-[11px] text-police-muted">
            <CheckCircle2 size={14} className="text-green-500" />
            Ramani hii ni mfano.unganisha na Google Maps kwa ajili ya kufuatilia live.
          </div>
        </div>
      </div>
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
