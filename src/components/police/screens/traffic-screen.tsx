// @ts-nocheck
"use client";

import { ChevronRight } from "lucide-react";
import { TopAppBar } from "../top-app-bar";
import { PoliceIcon } from "../police-icons";
import { TRAFFIC_QUICK_ACTIONS } from "@/lib/police-data";
import { usePoliceStore } from "@/store/police-store";

export function TrafficScreen() {
  const { navigate, setSelectedOffense } = usePoliceStore();

  return (
    <div className="min-h-full bg-police">
      <TopAppBar title="Trafiki" subtitle="Usalama Wetu, Jukumu Letu" showThemeToggle />

      <div className="space-y-4 p-4">
        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-2">
          {([] as {label:string;value:string;color:string}[]).map((stat) => (
            <div key={stat.label} className="flex flex-col items-center rounded-xl bg-police-card p-2.5 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${stat.color}15` }}>
                <PoliceIcon name={stat.icon} size={18} className="" />
              </div>
              {stat.sub && <span className="text-[8px] text-police-faint">{stat.sub}</span>}
              <span className="mt-1 text-[16px] font-bold leading-none" style={{ color: "#1A1A1A" }}>{stat.value}</span>
              <span className="mt-1 text-center text-[8px] leading-tight text-police-muted">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Hatua za Haraka — fully functional */}
        <div className="tpf-card p-4">
          <h3 className="mb-3 text-[16px] font-bold text-police">Hatua za Haraka</h3>
          <div className="grid grid-cols-3 gap-2">
            {TRAFFIC_QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => action.screen && navigate(action.screen)}
                className="flex flex-col items-center gap-1.5 rounded-xl bg-police-muted p-3 active:scale-[0.97]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: `${action.color}18` }}>
                  <PoliceIcon name={action.icon} size={20} className="" style={{ color: action.color }} />
                </div>
                <span className="text-center text-[10px] font-medium leading-tight text-police">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Makosa ya Karibuni — clickable */}
        <div className="tpf-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-police">Makosa ya Karibuni</h3>
            <button onClick={() => navigate("history")} className="text-[13px] font-medium text-[#2196F3]">Angalia Zote</button>
          </div>
          <div className="space-y-2.5">
            {([] as {id:number;offense:string;plate:string;driver:string;time:string;amount:string}[]).map((offense) => (
              <button
                key={offense.id}
                onClick={() => { setSelectedOffense(offense.id); navigate("offense-detail"); }}
                className="flex w-full items-center gap-3 rounded-xl border border-police-soft p-2.5 text-left active:scale-[0.99]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${offense.iconColor}18` }}>
                  <PoliceIcon name={offense.icon} size={20} className="" style={{ color: offense.iconColor }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-bold text-police">{offense.name}</p>
                    <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ backgroundColor: offense.statusColor }}>{offense.status}</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-police-muted">{offense.date} • {offense.location}</p>
                  <p className="mt-0.5 text-[12px] font-bold text-police">{offense.fine}</p>
                </div>
                <ChevronRight size={18} className="shrink-0 text-police-faint" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
