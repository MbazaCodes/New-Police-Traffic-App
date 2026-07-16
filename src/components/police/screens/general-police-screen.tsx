"use client";

import { ChevronRight } from "lucide-react";
import { TopAppBar } from "../top-app-bar";
import { PoliceIcon } from "../police-icons";
import { usePoliceStore } from "@/store/police-store";
import { useRecordsStore } from "@/store/records-store";
import { OFFICER } from "@/lib/police-data";
import { toast } from "@/hooks/use-toast";

const POLICE_STATS = [
  { label: "Matukio Yote", value: "1,234", icon: "alert", color: "#1A237E" },
  { label: "Yanayoendelea", value: "56", icon: "clock", color: "#FF9800" },
  { label: "Yameitatuliwa", value: "1,178", icon: "check", color: "#4CAF50" },
  { label: "Maofisa Kazini", value: "23", icon: "users", color: "#F44336" },
];

const POLICE_QUICK_ACTIONS = [
  { label: "Ripoti Tukio", icon: "clipboard", color: "#2563EB" },
  { label: "Tafuta Raia", icon: "search", color: "#8B5CF6" },
  { label: "Rekodi Taarifa", icon: "file-text", color: "#10B981" },
  { label: "Kamata Mtuhumiwa", icon: "hand", color: "#F97316" },
  { label: "Ripoti Ajali", icon: "alert", color: "#EF4444" },
  { label: "Historia", icon: "clock", color: "#3B82F6" },
];

const RECENT_INCIDENTS = [
  {
    id: 1,
    title: "Wizi wa simu - Kariakoo",
    status: "Yanaendelea",
    statusColor: "#F97316",
    icon: "alert",
    iconColor: "#F97316",
    date: "12 Mei 2026 • 14:30",
    location: "Kariakoo Market, Ilala",
  },
  {
    id: 2,
    title: "Gharika ya mto Msimbazi",
    status: "Tatuliwa",
    statusColor: "#4CAF50",
    icon: "cloud-rain",
    iconColor: "#3B82F6",
    date: "10 Mei 2026 • 08:15",
    location: "Msimbazi Valley, Kinondoni",
  },
  {
    id: 3,
    title: "Ajali ya gari - Mwendokasi",
    status: "Yanaendelea",
    statusColor: "#F97316",
    icon: "car",
    iconColor: "#EF4444",
    date: "09 Mei 2026 • 17:45",
    location: "Mwendokasi Terminal, Ubungo",
  },
  {
    id: 4,
    title: "Uvamizi wa nyumba - Mbezi",
    status: "Tatuliwa",
    statusColor: "#4CAF50",
    icon: "shield-alert",
    iconColor: "#4CAF50",
    date: "08 Mei 2026 • 22:10",
    location: "Mbezi Beach, Kinondoni",
  },
  {
    id: 5,
    title: "Ufisadi wa umma - Posta",
    status: "Mpya",
    statusColor: "#2563EB",
    icon: "users",
    iconColor: "#8B5CF6",
    date: "07 Mei 2026 • 11:20",
    location: "Posta Mpya, Ilala",
  },
];

export function GeneralPoliceScreen() {
  const navigate = usePoliceStore((s) => s.navigate);
  const addIncident = useRecordsStore((s) => s.addIncident);
  const addArrest = useRecordsStore((s) => s.addArrest);

  const now = new Date();
  const today = now.toLocaleDateString("sw-TZ", { day: "numeric", month: "long", year: "numeric" });
  const currentTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const handleAction = (label: string) => {
    if (label === "Ripoti Tukio") {
      navigate("accident-report");
      return;
    }
    if (label === "Tafuta Raia") {
      navigate("citizen-search-results");
      return;
    }
    if (label === "Rekodi Taarifa") {
      addIncident({
        type: "Taarifa ya Jumla",
        location: "Kituo Kikuu cha Polisi",
        date: today,
        time: currentTime,
        status: "active",
        priority: "medium",
        assignedTo: OFFICER.name,
        description: "Taarifa ya jumla imerekodiwa na afisa wa polisi.",
      });
      toast({ title: "Taarifa Imerekodiwa", description: "Taarifa mpya imehifadhiwa kwenye mfumo." });
      return;
    }
    if (label === "Kamata Mtuhumiwa") {
      addArrest({
        suspectName: "Mtuhumiwa Haijawazwa",
        suspectNida: "—",
        suspectPhone: "—",
        reason: "Kizuizi cha mtuhumiwa — fomu imefunguka",
        location: "Kituo Kikuu cha Polisi",
        date: today,
        time: currentTime,
        officer: OFFICER.name,
        station: OFFICER.station,
      });
      toast({ title: "Fomu ya kukamata imefunguka", description: "Rekodi ya kizuizi imeanzishwa." });
      return;
    }
    if (label === "Ripoti Ajali") {
      navigate("accident-report");
      return;
    }
    if (label === "Historia") {
      navigate("history");
      return;
    }
    toast({ title: label, description: `Kitendo cha "${label}" kimeanzishwa.` });
  };

  return (
    <div className="min-h-full bg-police">
      <TopAppBar
        title="Polisi"
        subtitle="Uendeshaji wa shughuli za polisi"
        showThemeToggle
      />

      <div className="space-y-4 p-4">
        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-2">
          {POLICE_STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center rounded-xl bg-police-card p-2.5 shadow-sm"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <PoliceIcon name={stat.icon} size={18} className="" />
              </div>
              <span
                className="mt-1 text-[16px] font-bold leading-none text-police"
                style={{ color: stat.color }}
              >
                {stat.value}
              </span>
              <span className="mt-1 text-center text-[8px] leading-tight text-police-muted">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl bg-police-card p-4 shadow-sm">
          <h3 className="mb-3 text-[16px] font-bold text-police">Hatua za Haraka</h3>
          <div className="grid grid-cols-3 gap-2">
            {POLICE_QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => handleAction(action.label)}
                className="flex flex-col items-center gap-1.5 rounded-xl bg-police-muted p-3 active:scale-[0.97]"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${action.color}18` }}
                >
                  <PoliceIcon name={action.icon} size={20} className="" />
                </div>
                <span className="text-center text-[10px] font-medium leading-tight text-police">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="rounded-2xl bg-police-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-police">Matukio ya Karibuni</h3>
            <button
              onClick={() => navigate("history")}
              className="text-[13px] font-medium text-[#2563EB]"
            >
              Angalia Zote
            </button>
          </div>

          <div className="space-y-2.5">
            {RECENT_INCIDENTS.map((inc) => (
              <button
                key={inc.id}
                onClick={() => navigate("history")}
                className="flex w-full items-center gap-3 rounded-xl border border-police-soft p-2.5 text-left active:scale-[0.99]"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${inc.iconColor}18` }}
                >
                  <PoliceIcon name={inc.icon} size={20} className="" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-bold text-police">{inc.title}</p>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
                      style={{ backgroundColor: inc.statusColor }}
                    >
                      {inc.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-police-muted">
                    {inc.date} • {inc.location}
                  </p>
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
