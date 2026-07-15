"use client";

import { ChevronLeft, Bell } from "lucide-react";
import Image from "next/image";
import { usePoliceStore } from "@/store/police-store";

export function TopAppBar({
  title,
  subtitle,
  showBack = false,
  showBell = true,
  showLogo = true,
  dark = false,
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showBell?: boolean;
  showLogo?: boolean;
  dark?: boolean;
}) {
  const goBack = usePoliceStore((s) => s.goBack);
  const textColor = dark ? "text-white" : "text-[#1A237E]";
  const subColor = dark ? "text-white/70" : "text-gray-500";

  return (
    <header className="flex items-center justify-between bg-white px-4 pb-3 pt-1 shrink-0">
      <div className="flex items-center gap-3">
        {showBack && (
          <button onClick={goBack} className="text-gray-600">
            <ChevronLeft size={26} strokeWidth={2.5} />
          </button>
        )}
        <div>
          <h1 className={`text-[20px] font-bold leading-tight ${textColor}`}>{title}</h1>
          {subtitle && <p className={`text-[12px] ${subColor}`}>{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {showBell && (
          <div className="relative">
            <button className="text-gray-700">
              <Bell size={24} />
            </button>
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F44336] px-1 text-[9px] font-bold text-white">
              3
            </span>
          </div>
        )}
        {showLogo && (
          <div className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-[#2196F3]">
            <Image
              src="/police-logo.png"
              alt="Polisi"
              width={36}
              height={36}
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </div>
    </header>
  );
}
