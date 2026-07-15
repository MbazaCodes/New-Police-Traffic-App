"use client";

import {
  Pencil,
  CheckCircle2,
  XCircle,
  Camera,
  Cloud,
  ShieldCheck,
  ShieldAlert,
  PenLine,
  Trash2,
  Car,
} from "lucide-react";
import { TopAppBar } from "../top-app-bar";
import { VEHICLE_INSPECTION } from "@/lib/police-data";

export function VehicleInspectionScreen() {
  const v = VEHICLE_INSPECTION;

  return (
    <div className="min-h-full bg-[#F5F5F5]">
      <TopAppBar title="Ukaguzi wa Gari" subtitle="Jaza taarifa za ukaguzi wa halia ya gari" showBack />

      <div className="space-y-3 p-4 pb-8">
        {/* Vehicle Info Header */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-block rounded-md border-2 border-[#1A237E] bg-yellow-50 px-2.5 py-1 text-[16px] font-extrabold tracking-wider text-[#1A237E]">
                {v.plate}
              </span>
              <p className="mt-2 text-[13px] text-gray-500">
                {v.model} | {v.color}
              </p>
            </div>
            <button className="inline-flex items-center gap-1 rounded-lg border border-[#2196F3] px-2.5 py-1 text-[11px] font-semibold text-[#2196F3]">
              <Pencil size={12} /> Hariri
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
            <InfoRow label="Mwenye Gari" value={v.owner} />
            <InfoRow label="Namba ya Simu" value={v.phone} />
            <InfoRow label="Eneo la Ukaguzi" value={v.location} />
            <InfoRow label="Tarehe & Saa" value={v.datetime} />
          </div>
        </div>

        {/* Section 1: Documents */}
        <ChecklistSection title="1. Hati na Vibali" items={v.documents} />

        {/* Section 2: Mechanical */}
        <ChecklistSection title="2. Halia ya Gari (Mechanical Condition)" items={v.mechanical} />
        <div className="rounded-b-2xl bg-white px-4 pb-4 -mt-3 pt-1 shadow-sm">
          <label className="mb-1 block text-[11px] font-medium text-gray-500">
            Maelezo ya Ziada (Kama kuna kasoro)
          </label>
          <textarea
            rows={2}
            placeholder="Andika maelezo ya kasoro au halisi nyingine..."
            className="w-full rounded-xl border border-gray-200 bg-[#F9FAFB] px-3 py-2 text-[12px] text-gray-700 placeholder:text-gray-400 focus:outline-none"
          />
        </div>

        {/* Section 3: Load */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-[14px] font-bold text-[#1A237E]">3. Upakiaji (Load)</h3>
          <div className="grid grid-cols-3 gap-2">
            <LoadField label="Aina ya Mizigo" value="Abiria" />
            <LoadField label="Uzito (kg)" value="1200" />
            <LoadField label="Idadi ya Abiria" value="4" />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[12px] font-medium text-gray-700">Je, upakiaji unazidi kiwango?</span>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 rounded-lg bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-600">
                <CheckCircle2 size={14} /> Hapana
              </span>
              <span className="flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-400">
                <XCircle size={14} /> Ndio
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Photos */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-1 text-[14px] font-bold text-[#1A237E]">4. Picha / Uthibitisho</h3>
          <p className="mb-3 text-[10px] text-gray-400">
            Piga picha sehemu muhimu za gari (nje, ndani, namba ya usajili, kasoro n.k.)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {v.photos.map((photo, i) => (
              <div
                key={i}
                className="flex aspect-[4/3] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50"
              >
                <Camera size={20} className="text-gray-300" />
                <span className="mt-1 text-[9px] text-gray-400">{photo.label}</span>
              </div>
            ))}
          </div>
          <button className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#2196F3]/40 py-2.5 text-[12px] font-semibold text-[#2196F3]">
            <Cloud size={16} /> Ongeza Picha
          </button>
        </div>

        {/* Section 5: Results */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-[14px] font-bold text-[#1A237E]">5. Matokelo ya Ukaguzi</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-3">
              <ShieldCheck size={24} className="text-green-600" />
              <div className="flex-1">
                <p className="text-[13px] font-bold text-green-700">Gari Halina Kasoro Kubwa</p>
                <p className="text-[11px] text-gray-500">Gari linafaa kuendelea na safari</p>
              </div>
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 opacity-70">
              <ShieldAlert size={24} className="text-red-500" />
              <div className="flex-1">
                <p className="text-[13px] font-bold text-red-600">Gari Lina Kasoro</p>
                <p className="text-[11px] text-gray-500">Lipaswe matengenezeko kabla ya kuendelea</p>
              </div>
              <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
            </div>
          </div>
        </div>

        {/* Section 6: Officer Signature */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-[14px] font-bold text-[#1A237E]">6. Saini ya Afisa</h3>
          <div className="grid grid-cols-2 gap-2">
            <LoadField label="Jina la Afisa" value="Insp. Juma Mwinyi" />
            <LoadField label="Namba ya Utambulisho" value="TP123456" />
          </div>
          <div className="mt-3 rounded-xl border border-gray-200 bg-[#F9FAFB] p-4">
            <div className="flex items-center justify-between">
              <PenLine size={18} className="text-gray-300" />
              <button className="text-[11px] font-medium text-gray-400">
                <Trash2 size={14} className="inline" /> Futa
              </button>
            </div>
            <p className="mt-6 text-right font-[cursive] text-[18px] italic text-[#1A237E]">J. Mwinyi</p>
          </div>
        </div>

        {/* Submit */}
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A237E] py-3.5 text-[15px] font-bold text-white shadow-md active:scale-[0.98]">
          <CheckCircle2 size={20} />
          Hifadhi na Kamaliza Ukaguzi
        </button>
      </div>
    </div>
  );
}

function ChecklistSection({
  title,
  items,
}: {
  title: string;
  items: { label: string; status: string; pass: boolean }[];
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-[14px] font-bold text-[#1A237E]">{title}</h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
          >
            <span className="flex-1 text-[12px] text-gray-700">{item.label}</span>
            <span
              className={`flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                item.pass
                  ? "bg-green-50 text-green-600"
                  : "bg-orange-50 text-orange-500"
              }`}
            >
              {item.pass ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400">{label}</p>
      <p className="text-[12px] font-medium text-gray-700">{value}</p>
    </div>
  );
}

function LoadField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium text-gray-400">{label}</label>
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-[#F9FAFB] px-2.5 py-2">
        <span className="text-[12px] text-gray-700">{value}</span>
        <svg width="10" height="10" viewBox="0 0 12 12" className="text-gray-400">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
