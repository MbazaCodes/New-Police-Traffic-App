"use client";

import Image from "next/image";
import { Pencil, ChevronRight, LogOut, Download } from "lucide-react";
import { TopAppBar } from "../top-app-bar";
import { PoliceIcon } from "../police-icons";
import { ThemeToggle } from "../theme-toggle";
import { PROFILE_STATS, PROFILE_ACTIVITIES, PROFILE_SETTINGS } from "@/lib/police-data";
import { useOfficer } from "@/hooks/use-officer";
import { usePoliceStore } from "@/store/police-store";
import { toast } from "@/hooks/use-toast";

export function ProfileScreen() {
  const OFFICER = useOfficer();
  const logout = usePoliceStore((s) => s.logout);
  const navigate = usePoliceStore((s) => s.navigate);

  return (
    <div className="min-h-full bg-police">
      <TopAppBar title="Akaunti / Dashibodi" subtitle="Maelezo ya afisa na muhtasari wa shughuli" showLogo={false} />

      <div className="space-y-4 p-4">
        {/* Profile Header */}
        <div className="rounded-2xl bg-police-card p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-gray-200">
              <Image src="/police-logo.png" alt="Avatar" width={64} height={64} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-bold text-police-navy">{OFFICER.name}</h2>
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">
                  {OFFICER.status}
                </span>
              </div>
              <p className="mt-0.5 text-[12px] font-medium text-[#2196F3]">
                Namba ya Utambulisho: {OFFICER.id}
              </p>
              <button
                onClick={() =>
                  navigate("edit-profile")
                }
                className="mt-2 inline-flex items-center gap-1 rounded-lg border border-[#2196F3] px-3 py-1 text-[11px] font-semibold text-[#2196F3]"
              >
                <Pencil size={12} /> Hariri Profaili
              </button>
            </div>
          </div>

          <div className="mt-3 space-y-1.5 border-t border-police-soft pt-3">
            <DetailRow label="Nafasi" value={OFFICER.rank} />
            <DetailRow label="Kitengo" value={OFFICER.unit} />
            <DetailRow label="Kituo" value={OFFICER.station} />
            <DetailRow label="Namba ya Simu" value={OFFICER.phone} />
            <DetailRow label="Barua Pepe" value={OFFICER.email} />
          </div>
        </div>

        {/* Dashboard Stats */}
        <div>
          <h3 className="mb-2 px-1 text-[14px] font-bold text-police-navy">Muhtasari wa Dashibodi</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {PROFILE_STATS.map((stat) => (
              <div key={stat.label} className="rounded-xl bg-police-card p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${stat.color}18` }}
                  >
                    <PoliceIcon name={stat.icon} size={16} className="" />
                  </div>
                  <div>
                    <p className="text-[18px] font-bold leading-none text-police">{stat.value}</p>
                  </div>
                </div>
                <p className="mt-1.5 text-[10px] leading-tight text-police-muted">{stat.label}</p>
                <p className="mt-0.5 text-[9px] text-police-faint">{stat.sub}</p>
              </div>
            ))}
            {/* fill remaining cell for 5 items in 2-col grid */}
            <div className="rounded-xl border-2 border-dashed border-police p-3">
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Download size={18} className="text-police-faint" />
                <p className="mt-1 text-[9px] text-police-faint">Ripoti Zaidi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="rounded-2xl bg-police-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-police-navy">Shughuli za Hivi Karibuni</h3>
            <button
              onClick={() => navigate("history")}
              className="text-[12px] font-medium text-[#2196F3]"
            >
              Angalia Zote
            </button>
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
                  <p className="text-[13px] font-semibold text-police">{act.title}</p>
                  <p className="text-[11px] text-police-muted">{act.desc}</p>
                  <p className="text-[10px] text-police-faint">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="rounded-2xl bg-police-card p-2 shadow-sm">
          <h3 className="px-3 pb-1 pt-2 text-[14px] font-bold text-police-navy">Zana na Mipangilio</h3>

          {/* Theme Toggle */}
          <div className="px-3 py-3">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2196F3]/15">
                <PoliceIcon name="shield" size={16} className="" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-medium text-police">Mwonekano (Theme)</p>
                <p className="text-[11px] text-police-faint">Chagua mwangaza au giza</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <div className="mx-3 border-t border-police-soft" />

          {PROFILE_SETTINGS.map((item) => {
            const handleSettingClick = () => {
              if (item.label === "Historia ya Shughuli") {
                navigate("history");
                return;
              }
              if (item.label === "Pakua Ripoti") {
                toast({ title: "Inapakua", description: "Ripoti inapakuliwa kama PDF." });
                return;
              }
              toast({ title: item.label, description: item.label });
            };
            return (
              <button
                key={item.label}
                onClick={handleSettingClick}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 active:bg-police-muted"
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${item.color}18` }}
                >
                  <PoliceIcon name={item.icon} size={16} className="" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[13px] font-medium text-police">{item.label}</p>
                  <p className="text-[11px] text-police-faint">{item.desc}</p>
                </div>
                <ChevronRight size={18} className="text-police-faint" />
              </button>
            );
          })}
        </div>

        {/* Download Report Button */}
        <button
          onClick={() =>
            toast({ title: "Inapakua", description: "Ripoti ya shughuli inapakuliwa kama PDF." })
          }
          className="flex w-full items-center gap-3 rounded-2xl bg-[#2196F3] p-4 text-left shadow-md shadow-[#2196F3]/20 active:scale-[0.98]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-police-card/20">
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
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-police-card py-3 text-[14px] font-bold text-red-500 active:scale-[0.98]"
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
      <span className="text-[12px] text-police-muted">{label}</span>
      <span className="text-right text-[12px] font-medium text-police">{value}</span>
    </div>
  );
}
