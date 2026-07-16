"use client";

import { useState } from "react";
import Image from "next/image";
import { Bell, Search, Camera, ScanLine, ChevronRight, X } from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { OFFICER } from "@/lib/police-data";

export function HomeScreen() {
  const { searchTab, setSearchTab, navigate, openScanner, runSearch, setSearchEntity } = usePoliceStore();
  const [searchValue, setSearchValue] = useState("");

  const currentEntity = searchTab === "nida" ? "person" : "car";

  return (
    <div className="min-h-full bg-police">
      {/* Gradient Header */}
      <div className="bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] px-4 pb-16 pt-2">
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-[13px] text-white/80">Karibu,</p>
            <p className="text-[17px] font-bold text-white">{OFFICER.shortName}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell size={24} className="text-white" />
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F44336] px-1 text-[9px] font-bold text-white">
                3
              </span>
            </div>
            <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-white/60">
              <Image
                src="/police-logo.png"
                alt="Avatar"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Banner Card (overlaps header) */}
      <div className="-mt-10 px-4">
        <div className="flex flex-col items-center rounded-2xl bg-police-card p-5 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <div className="h-20 w-20 overflow-hidden rounded-full ring-2 ring-[#0070C0]/15">
            <Image src="/police-logo.png" alt="TPF" width={80} height={80} className="h-full w-full object-cover" />
          </div>
          <h2 className="mt-3 text-[20px] font-extrabold tracking-tight text-[#1E3A8A]">
            TANZANIA POLICE FORCE
          </h2>
          <p className="text-[13px] font-medium text-[#3B82F6]">USALAMA WETU, JUKUMU LETU</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 px-4">
        <div className="grid grid-cols-2 gap-3">
          <QuickAction
            icon={<Camera size={26} className="text-[#3B82F6]" />}
            bg="#3B82F6"
            title="Soma Nambari"
            subtitle="Tumia kamera kusoma namba ya gari"
            onClick={() => openScanner("ocr")}
          />
          <QuickAction
            icon={<ScanLine size={26} className="text-[#10B981]" />}
            bg="#10B981"
            title="Scan QR"
            subtitle="Changanya QR code ya hati au namba"
            onClick={() => openScanner("qr")}
          />
        </div>
      </div>

      {/* Quick Search */}
      <div className="mt-4 px-4 pb-6">
        <div className="rounded-2xl bg-police-card p-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
          <h3 className="text-[17px] font-bold text-[#1E3A8A]">Utafutaji wa Haraka</h3>

          {/* Tabs */}
          <div className="mt-3 flex gap-2">
            {([
              { id: "plate", label: "Namba ya Gari" },
              { id: "license", label: "Leseni" },
              { id: "nida", label: "NIDA" },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSearchTab(tab.id)}
                className={`flex-1 rounded-lg py-2 text-[12px] font-semibold transition ${
                  searchTab === tab.id
                    ? "bg-[#3B82F6] text-white"
                    : "bg-police-muted text-police-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-police bg-police-input px-3">
            <Search size={18} className="text-police-faint" />
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchValue.trim()) {
                  setSearchEntity(currentEntity);
                  runSearch(searchValue);
                  navigate("search-results");
                }
              }}
              placeholder={searchTab === "plate" ? "T123ABC" : searchTab === "license" ? "DL123456789TZ" : "1990123456789"}
              className="h-11 flex-1 bg-transparent text-[15px] font-medium text-police placeholder:text-police-faint focus:outline-none"
            />
            {searchValue && (
              <button onClick={() => setSearchValue("")} className="text-police-faint">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={() => {
              if (searchValue.trim()) {
                setSearchEntity(currentEntity);
                runSearch(searchValue);
              }
              navigate("search-results");
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#3B82F6] py-3 text-[15px] font-bold text-white shadow-md shadow-[#3B82F6]/30 active:scale-[0.98]"
          >
            <Search size={18} />
            Tafuta
          </button>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  bg,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  bg: string;
  title: string;
  subtitle: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start rounded-2xl bg-police-card p-4 text-left shadow-[0_4px_12px_rgba(0,0,0,0.06)] active:scale-[0.98]"
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: `${bg}15` }}
      >
        {icon}
      </div>
      <div className="mt-2.5 flex w-full items-center justify-between">
        <h4 className="text-[15px] font-bold text-[#1E3A8A]">{title}</h4>
        <ChevronRight size={16} className="text-[#1E3A8A]" />
      </div>
      <p className="mt-0.5 text-[11px] leading-tight text-police-muted">{subtitle}</p>
    </button>
  );
}
