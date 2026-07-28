"use client";

import { Signal, Wifi, BatteryFull } from "lucide-react";

export function StatusBar({ dark = false }: { dark?: boolean }) {
  const color = dark ? "text-white" : "text-black";
  return (
    <div className={`flex items-center justify-between px-6 pt-3 pb-1 ${color}`}>
      <span className="text-[14px] font-semibold tracking-tight">09:41</span>
      <div className="flex items-center gap-1.5">
        <Signal size={16} strokeWidth={2.5} />
        <Wifi size={16} strokeWidth={2.5} />
        <BatteryFull size={20} strokeWidth={2} />
      </div>
    </div>
  );
}
