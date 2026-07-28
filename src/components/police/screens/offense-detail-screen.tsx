// @ts-nocheck
"use client";

import { ArrowLeft, MapPin, Clock, Car, User, AlertTriangle, FileText, TrendingDown } from "lucide-react";
import { usePoliceStore } from "@/store/police-store";

export function OffenseDetailScreen() {
  const { goBack, selectedOffenseId, navigate } = usePoliceStore();
  const offense = ([] as {id:number;[key:string]:unknown}[]).find((o) => o.id === selectedOffenseId);

  if (!offense) {
    return (
      <div className="min-h-full bg-police flex flex-col items-center justify-center p-4">
        <p className="text-police-muted">Tukio halipatikani.</p>
        <button onClick={() => goBack()} className="mt-4 rounded-xl bg-[#1E3A8A] px-6 py-2 text-white text-[14px] font-bold">Rudi</button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-police">
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2196F3] px-4 py-4">
        <button onClick={() => goBack()} className="mb-3 flex items-center gap-2 text-white/80"><ArrowLeft size={18} /> <span className="text-[13px]">Rudi</span></button>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
            <AlertTriangle size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-white">{offense.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">{offense.status}</span>
              <span className="text-[11px] text-white/70">{offense.date}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {/* Fine & points card */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-police-card p-4 text-center shadow-sm">
            <p className="text-[11px] text-police-muted">Faini</p>
            <p className="mt-1 text-[20px] font-extrabold text-[#EF4444]">{offense.fine}</p>
            <span className="mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ backgroundColor: offense.statusColor }}>{offense.status}</span>
          </div>
          <div className="rounded-2xl bg-police-card p-4 text-center shadow-sm">
            <p className="text-[11px] text-police-muted">Pointi Zilizopunguzwa</p>
            <p className="mt-1 text-[20px] font-extrabold text-[#FF9800]">-{offense.deductedPoints}</p>
            <div className="mt-1 flex items-center justify-center gap-1"><TrendingDown size={12} className="text-[#FF9800]" /><span className="text-[9px] text-police-faint">kutoka 100</span></div>
          </div>
        </div>

        {/* Offense details */}
        <div className="tpf-card p-4">
          <h3 className="mb-3 text-[14px] font-bold text-police">Maelezo ya Kosa</h3>
          <div className="space-y-3">
            <DetailRow icon={<FileText size={15} />} label="Kosa" value={offense.offense} />
            <DetailRow icon={<Car size={15} />} label="Namba ya Gari" value={offense.plate} />
            <DetailRow icon={<User size={15} />} label="Dereva" value={offense.driver} />
            <DetailRow icon={<MapPin size={15} />} label="Eneo" value={offense.location} />
            <DetailRow icon={<Clock size={15} />} label="Tarehe" value={offense.date} />
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button onClick={() => navigate("citation")} className="w-full rounded-xl bg-[#2196F3] py-3 text-[14px] font-bold text-white active:scale-[0.98]">
            Toa Citation kwa Kosa Hili
          </button>
          <button onClick={() => navigate("arrest-form")} className="w-full rounded-xl bg-[#1E3A8A] py-3 text-[14px] font-bold text-white active:scale-[0.98]">
            Fungua Fomu ya Kukamatwa
          </button>
          <button onClick={() => navigate("driver-points")} className="w-full rounded-xl border border-police py-3 text-[14px] font-semibold text-police active:scale-[0.98]">
            Angalia Pointi za Dereva
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A]">{icon}</div>
      <div>
        <p className="text-[10px] text-police-faint uppercase tracking-wide">{label}</p>
        <p className="text-[13px] font-medium text-police">{value}</p>
      </div>
    </div>
  );
}
