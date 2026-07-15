"use client";

import Image from "next/image";
import { Pencil, ChevronRight, LogOut, Download } from "lucide-react";
import { TopAppBar } from "../top-app-bar";
import { PoliceIcon } from "../police-icons";
import { PROFILE_STATS, PROFILE_ACTIVITIES, PROFILE_SETTINGS, OFFICER } from "@/lib/police-data";
import { usePoliceStore } from "@/store/police-store";

export function ProfileScreen() {
  const logout = usePoliceStore((s) => s.logout);

  return (
    <div className="min-h-full bg-[#F5F5F5]">
      <TopAppBar title="Akaunti / Dashibodi" subtitle="Maelezo ya afisa na muhtasari wa shughuli" showLogo={false} />

      <div className="space-y-4 p-4">
        {/* Profile Header */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-gray-200">
              <Image src="/police-logo.png" alt="Avatar" width={64} height={64} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-bold text-[#1A237E]">{OFFICER.name}</h2>
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">
                  {OFFICER.status}
                </span>
              </div>
              <p className="mt-0.5 text-[12px] font-medium text-[#2196F3]">
                Namba ya Utambulisho: {OFFICER.id}
              </p>
              <button className="mt-2 inline-flex items-center gap-1 rounded-lg border border-[#2196F3] px-3 py-1 text-[11px] font-semibold text-[#2196F3]">
                <Pencil size={12} /> Hariri Profaili
              </button>
            </div>
          </div>

          <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
            <DetailRow label="Nafasi" value={OFFICER.rank} />
            <DetailRow label="Kitengo" value={OFFICER.unit} />
            <DetailRow label="Kituo" value={OFFICER.station} />
            <DetailRow label="Namba ya Simu" value={OFFICER.phone} />
            <DetailRow label="Barua Pepe" value={OFFICER.email} />
          </div>
        </div>

        {/* Dashboard Stats */}
        <div>
          <h3 className="mb-2 px-1 text-[14px] font-bold text-[#1A237E]">Muhtasari wa Dashibodi</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {PROFILE_STATS.map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${stat.color}18` }}
                  >
                    <PoliceIcon name={stat.icon} size={16} className="" />
                  </div>
                  <div>
                    <p className="text-[18px] font-bold leading-none text-[#1A1A1A]">{stat.value}</p>
                  </div>
                </div>
                <p className="mt-1.5 text-[10px] leading-tight text-gray-500">{stat.label}</p>
                <p className="mt-0.5 text-[9px] text-gray-400">{stat.sub}</p>
              </div>
            ))}
            {/* fill remaining cell for 5 items in 2-col grid */}
            <div className="rounded-xl border-2 border-dashed border-gray-200 p-3">
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Download size={18} className="text-gray-300" />
                <p className="mt-1 text-[9px] text-gray-400">Ripoti Zaidi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-[#1A237E]">Shughuli za Hivi Karibuni</h3>
            <button className="text-[12px] font-medium text-[#2196F3]">Angalia Zote</button>
          </div>
          <div className="space-y-3">
            {PROFILE_ACTIVITIES.map((act, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${act.color}18` }}
                >
                  <PoliceIcon name={act.icon} size={16} className="" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-[#1A1A1A]">{act.title}</p>
                  <p className="text-[11px] text-gray-500">{act.desc}</p>
                  <p className="text-[10px] text-gray-400">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="rounded-2xl bg-white p-2 shadow-sm">
          <h3 className="px-3 pb-1 pt-2 text-[14px] font-bold text-[#1A237E]">Zana na Mipangilio</h3>
          {PROFILE_SETTINGS.map((item) => (
            <button
              key={item.label}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 active:bg-gray-50"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${item.color}18` }}
              >
                <PoliceIcon name={item.icon} size={16} className="" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[13px] font-medium text-[#1A1A1A]">{item.label}</p>
                <p className="text-[11px] text-gray-400">{item.desc}</p>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
          ))}
        </div>

        {/* Download Report Button */}
        <button className="flex w-full items-center gap-3 rounded-2xl bg-[#2196F3] p-4 text-left shadow-md shadow-[#2196F3]/20 active:scale-[0.98]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Download size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-white">Pakua Ripoti Kuu</p>
            <p className="text-[11px] text-white/80">Pakua ripoti ya shughuli zako kwa kipindi</p>
          </div>
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white py-3 text-[14px] font-bold text-red-500 active:scale-[0.98]"
        >
          <LogOut size={18} />
          Toka (Logout)
        </button>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[12px] text-gray-500">{label}</span>
      <span className="text-right text-[12px] font-medium text-gray-700">{value}</span>
    </div>
  );
}
