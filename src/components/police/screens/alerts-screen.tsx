"use client";

import { Megaphone, ChevronRight } from "lucide-react";
import { TopAppBar } from "../top-app-bar";
import { PoliceIcon } from "../police-icons";
import { ALERTS } from "@/lib/police-data";
import { usePoliceStore } from "@/store/police-store";
import { toast } from "@/hooks/use-toast";

export function AlertsScreen() {
  const { alertFilter, setAlertFilter } = usePoliceStore();

  const tabs = [
    { id: "all" as const, label: "Yote" },
    { id: "mine" as const, label: "Kesi Zangu", badge: 2 },
    { id: "important" as const, label: "Muhimu" },
  ];

  return (
    <div className="min-h-full bg-police">
      <TopAppBar title="Arifa / Tangazo" subtitle="Pata taarifa na matangazo muhimu" />

      <div className="space-y-3 p-4">
        {/* Tuma Tangazo button */}
        <button
          onClick={() =>
            toast({ title: "Tuma Tangazo", description: "Fomu ya kutuma tangazo itafunguka." })
          }
          className="flex w-full items-center gap-3 rounded-2xl bg-[#2196F3] p-4 text-left shadow-md shadow-[#2196F3]/20 active:scale-[0.98]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-police-card/20">
            <Megaphone size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-white">Tuma Tangazo</p>
            <p className="text-[11px] text-white/80">Tuma tangazo kwa maofisa wote au vikundi maalum</p>
          </div>
        </button>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 border-b border-police">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAlertFilter(tab.id)}
              className="relative flex items-center gap-1.5 px-3 py-2.5"
            >
              <span
                className={`text-[13px] font-medium ${
                  alertFilter === tab.id ? "font-bold text-[#2196F3]" : "text-police-muted"
                }`}
              >
                {tab.label}
              </span>
              {tab.badge && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F44336] px-1 text-[9px] font-bold text-white">
                  {tab.badge}
                </span>
              )}
              {alertFilter === tab.id && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#2196F3]" />
              )}
            </button>
          ))}
          <button
            onClick={() =>
              toast({ title: "Arifa Zote", description: "Arifa zote zinaonyeshwa." })
            }
            className="ml-auto py-2.5 text-[12px] font-medium text-[#2196F3]"
          >
            Angalia Yote
          </button>
        </div>

        {/* Alert List */}
        <div className="space-y-2.5">
          {ALERTS.map((alert) => (
            <button
              key={alert.id}
              onClick={() =>
                toast({ title: alert.title, description: alert.source })
              }
              className="block w-full overflow-hidden rounded-2xl bg-police-card text-left shadow-sm active:scale-[0.99]"
              style={{ borderLeft: `4px solid ${alert.borderColor}` }}
            >
              <div className="flex gap-3 p-3.5">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${alert.iconColor}18` }}
                >
                  <PoliceIcon name={alert.icon} size={20} className="" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-[14px] font-bold leading-tight text-police-navy">
                      {alert.title}
                    </h4>
                    <span
                      className="mt-1 h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: alert.dotColor }}
                    />
                  </div>
                  <p className="mt-0.5 text-[10px] text-police-faint">{alert.time}</p>
                  <p className="mt-1.5 text-[12px] leading-snug text-police-muted">{alert.message}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                      style={{ backgroundColor: alert.sourceBg, color: alert.borderColor }}
                    >
                      {alert.source}
                    </span>
                    <ChevronRight size={16} className="text-police-faint" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
