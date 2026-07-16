"use client";

import { usePoliceStore } from "@/store/police-store";
import type { ScreenId } from "@/lib/police-data";
import { Bell, Shield, User, Home, UserCheck } from "lucide-react";

// General officer bottom nav: Nyumbani, Polisi, Patroli, Arifa, Akaunti
const NAV_ITEMS: { id: ScreenId; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Nyumbani", icon: Home },
  { id: "traffic", label: "Polisi", icon: Shield },
  { id: "patrol", label: "Patroli", icon: UserCheck },
  { id: "alerts", label: "Arifa", icon: Bell },
  { id: "profile", label: "Akaunti", icon: User },
];

export function GeneralBottomNav() {
  const { activeTab, setTab } = usePoliceStore();

  return (
    <nav className="flex items-stretch justify-around border-t border-police bg-police-card px-1 pt-2 pb-3 shrink-0">
      {NAV_ITEMS.map((item) => {
        const active = activeTab === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className="relative flex flex-1 flex-col items-center gap-1 pt-1"
          >
            <div className="relative">
              <Icon
                size={24}
                strokeWidth={active ? 2.5 : 2}
                className={active ? "text-[#2196F3]" : "text-police-faint"}
              />
              {item.id === "alerts" && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F44336] px-1 text-[9px] font-bold text-white">
                  3
                </span>
              )}
            </div>
            <span
              className={`text-[11px] font-medium ${
                active ? "font-bold text-[#2196F3]" : "text-police-faint"
              }`}
            >
              {item.label}
            </span>
            {active && (
              <span className="absolute -top-px h-0.5 w-8 rounded-full bg-[#2196F3]" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
