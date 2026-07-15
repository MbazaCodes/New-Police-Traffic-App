"use client";

import { ChevronRight } from "lucide-react";
import { TopAppBar } from "../top-app-bar";
import { PoliceIcon } from "../police-icons";
import { TRAFFIC_STATS, TRAFFIC_QUICK_ACTIONS, RECENT_OFFENSES } from "@/lib/police-data";
import { usePoliceStore } from "@/store/police-store";

export function TrafficScreen() {
  const navigate = usePoliceStore((s) => s.navigate);

  return (
    <div className="min-h-full bg-[#F5F5F5]">
      <TopAppBar title="Trafiki" subtitle="Usalama Wetu, Jukumu Letu" />

      <div className="space-y-4 p-4">
        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-2">
          {TRAFFIC_STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center rounded-xl bg-white p-2.5 shadow-sm"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <PoliceIcon name={stat.icon} size={18} className="" />
              </div>
              {stat.sub && <span className="text-[8px] text-gray-400">{stat.sub}</span>}
              <span
                className="mt-1 text-[16px] font-bold leading-none"
                style={{ color: "#1A1A1A" }}
              >
                {stat.value}
              </span>
              <span className="mt-1 text-center text-[8px] leading-tight text-gray-500">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-[16px] font-bold text-[#1A1A1A]">Hatua za Haraka</h3>
          <div className="grid grid-cols-3 gap-2">
            {TRAFFIC_QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => action.screen && navigate(action.screen)}
                className="flex flex-col items-center gap-1.5 rounded-xl bg-gray-50 p-3 active:scale-[0.97]"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${action.color}18` }}
                >
                  <PoliceIcon name={action.icon} size={20} className="" />
                </div>
                <span className="text-center text-[10px] font-medium leading-tight text-gray-700">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Offenses */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-[#1A1A1A]">Makosa ya Karibuni</h3>
            <button className="text-[13px] font-medium text-[#2563EB]">Angalia Zote</button>
          </div>

          <div className="space-y-2.5">
            {RECENT_OFFENSES.map((offense) => (
              <div
                key={offense.id}
                className="flex items-center gap-3 rounded-xl border border-gray-100 p-2.5"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${offense.iconColor}18` }}
                >
                  <PoliceIcon name={offense.icon} size={20} className="" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-bold text-[#1A1A1A]">{offense.name}</p>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
                      style={{ backgroundColor: offense.statusColor }}
                    >
                      {offense.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-gray-500">
                    {offense.date} • {offense.location}
                  </p>
                  <p className="mt-0.5 text-[12px] font-bold text-[#1A1A1A]">{offense.fine}</p>
                </div>
                <ChevronRight size={18} className="shrink-0 text-gray-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
