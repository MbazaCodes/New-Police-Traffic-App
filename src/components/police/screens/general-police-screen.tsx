"use client";

import { ChevronRight } from "lucide-react";
import { TopAppBar } from "../top-app-bar";
import { PoliceIcon } from "../police-icons";
import { usePoliceStore } from "@/store/police-store";
import { GENERAL_INCIDENTS } from "@/lib/police-data";

const POLICE_QUICK_ACTIONS = [
  { label: "Ripoti Tukio",      icon: "clipboard",   color: "#2196F3", screen: "incident-detail"        },
  { label: "Tafuta Raia",       icon: "search",      color: "#1E3A8A", screen: "citizen-search-results" },
  { label: "Lipa Faini",        icon: "wallet",      color: "#10B981", screen: "fine-payment"           },
  { label: "Kamata Mtuhumiwa",  icon: "user-x",      color: "#EF4444", screen: "arrest-form"            },
  { label: "Dhamana",           icon: "shield",      color: "#8B5CF6", screen: "bail-out"               },
  { label: "Toa Onyo",          icon: "alert-triangle", color: "#FF9800", screen: "warning-form"        },
];

export function GeneralPoliceScreen() {
  const { navigate, setSelectedIncident } = usePoliceStore();

  const activeIncidents  = GENERAL_INCIDENTS.filter((i) => i.status === "Yanaendelea" || i.status === "Mpya").length;
  const resolvedIncidents = GENERAL_INCIDENTS.filter((i) => i.status === "Tatuliwa").length;
  const heldArrests =.filter((a) => a.status === "held").length;
  const totalWarnings =.length;

  const policeStats = [
    { label: "Matukio Yote",    value: String(GENERAL_INCIDENTS.length), color: "#1E3A8A" },
    { label: "Yanayoendelea",   value: String(activeIncidents),           color: "#FF9800" },
    { label: "Yameitatuliwa",   value: String(resolvedIncidents),         color: "#10B981" },
    { label: "Makamato",        value: String(heldArrests),               color: "#EF4444" },
  ];

  return (
    <div className="min-h-full bg-police">
      <TopAppBar title="Polisi" subtitle="Uendeshaji wa shughuli za polisi" showThemeToggle />

      <div className="space-y-4 p-4">
        {/* Live Stats */}
        <div className="grid grid-cols-4 gap-2">
          {policeStats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center rounded-xl bg-police-card p-2.5 shadow-sm">
              <span className="mt-1 text-[17px] font-bold leading-none" style={{ color: stat.color }}>{stat.value}</span>
              <span className="mt-1 text-center text-[8px] leading-tight text-police-muted">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Hatua za Haraka — all 6 fully navigating */}
        <div className="tpf-card p-4">
          <h3 className="mb-3 text-[16px] font-bold text-police">Hatua za Haraka</h3>
          <div className="grid grid-cols-3 gap-2">
            {POLICE_QUICK_ACTIONS.map((action) => (
              <button key={action.label} onClick={() => navigate(action.screen as Parameters<typeof navigate>[0])} className="flex flex-col items-center gap-1.5 rounded-xl bg-police-muted p-3 active:scale-[0.97]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: `${action.color}18` }}>
                  <PoliceIcon name={action.icon} size={20} className="" style={{ color: action.color }} />
                </div>
                <span className="text-center text-[10px] font-medium leading-tight text-police">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Incidents — clickable → incident view */}
        <div className="tpf-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-police">Matukio ya Karibuni</h3>
            <button onClick={() => navigate("history")} className="text-[13px] font-medium text-[#2196F3]">Angalia Zote</button>
          </div>
          <div className="space-y-2.5">
            {GENERAL_INCIDENTS.map((inc) => (
              <button key={inc.id} onClick={() => { setSelectedIncident(inc.id); navigate("incident-view"); }} className="flex w-full items-center gap-3 rounded-xl border border-police-soft p-2.5 text-left active:scale-[0.99]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${inc.iconColor}18` }}>
                  <PoliceIcon name={inc.icon} size={20} className="" style={{ color: inc.iconColor }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-bold text-police">{inc.title}</p>
                    <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ backgroundColor: inc.statusColor }}>{inc.status}</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-police-muted">{inc.date} saa {inc.time} • {inc.location}</p>
                  {inc.casualties > 0 && <p className="mt-0.5 text-[10px] font-medium text-[#EF4444]">Majeruhi: {inc.casualties}</p>}
                </div>
                <ChevronRight size={18} className="shrink-0 text-police-faint" />
              </button>
            ))}
          </div>
        </div>

        {/* Quick summary pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { label: `${totalWarnings} Maonyo`, color: "#FF9800" },
            { label: `${.length} Makamato Yote`, color: "#1E3A8A" },
            { label: `${GENERAL_INCIDENTS.filter((i) => i.casualties > 0).length} Matukio ya Majeruhi`, color: "#EF4444" },
          ].map((p) => (
            <span key={p.label} className="shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium" style={{ borderColor: `${p.color}40`, color: p.color, backgroundColor: `${p.color}10` }}>
              {p.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
