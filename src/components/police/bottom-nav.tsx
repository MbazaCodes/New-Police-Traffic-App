"use client";

import { usePoliceStore } from "@/store/police-store";
import { Bell, Car, Home, Shield, User } from "lucide-react";
import type { ScreenId } from "@/lib/police-data";

const NAV_ITEMS: { id: ScreenId; label: string; icon: typeof Home }[] = [
  { id: "home",    label: "Nyumbani", icon: Home },
  { id: "traffic", label: "Trafiki",  icon: Car },
  { id: "patrol",  label: "Patroli",  icon: Shield },
  { id: "alerts",  label: "Arifa",    icon: Bell },
  { id: "profile", label: "Akaunti",  icon: User },
];

export function BottomNav() {
  const { activeTab, setTab, unreadAlertCount } = usePoliceStore();
  const unread = unreadAlertCount();

  return (
    <nav className="flex items-stretch justify-around border-t border-police bg-police-card px-1 pt-2 pb-3 shrink-0">
      {NAV_ITEMS.map((item) => {
        const active = activeTab === item.id;
        const Icon = item.icon;
        return (
          <button key={item.id} onClick={() => setTab(item.id)} className="relative flex flex-1 flex-col items-center gap-1 pt-1">
            <div className="relative">
              <Icon size={24} strokeWidth={active ? 2.5 : 2} className={active ? "text-[#2196F3]" : "text-police-faint"} />
              {item.id === "alerts" && unread > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F44336] px-1 text-[9px] font-bold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </div>
            <span className={`text-[11px] font-medium ${active ? "font-bold text-[#2196F3]" : "text-police-faint"}`}>{item.label}</span>
            {active && <span className="absolute -top-px h-0.5 w-8 rounded-full bg-[#2196F3]" />}
          </button>
        );
      })}
    </nav>
  );
}
