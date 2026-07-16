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
import { usePoliceStore } from "@/store/police-store";
import { toast } from "@/hooks/use-toast";

export function VehicleInspectionScreen() {
  const v = VEHICLE_INSPECTION;
  const goBack = usePoliceStore((s) => s.goBack);

  return (
    <div className="min-h-full bg-police">
      <TopAppBar title="Ukaguzi wa Gari" subtitle="Jaza taarifa za ukaguzi wa halia ya gari" showBack />

      <div className="space-y-3 p-4 pb-8">
        {/* Vehicle Info Header */}
        <div className="rounded-2xl bg-police-card p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-block rounded-md border-2 border-[#1A237E] bg-yellow-50 px-2.5 py-1 text-[16px] font-extrabold tracking-wider text-police-navy">
                {v.plate}
              </span>
              <p className="mt-2 text-[13px] text-police-muted">
                {v.model} | {v.color}
              </p>
            </div>
            <button className="inline-flex items-center gap-1 rounded-lg border border-[#2196F3] px-2.5 py-1 text-[11px] font-semibold text-[#2196F3]">
              <Pencil size={12} /> Hariri
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-police-soft pt-3">
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
        <div className="rounded-b-2xl bg-police-card px-4 pb-4 -mt-3 pt-1 shadow-sm">
          <label className="mb-1 block text-[11px] font-medium text-police-muted">
            Maelezo ya Ziada (Kama kuna kasoro)
          </label>
          <textarea
            rows={2}
            placeholder="Andika maelezo ya kasoro au halisi nyingine..."
            className="w-full rounded-xl border border-police bg-police-input px-3 py-2 text-[12px] text-police placeholder:text-police-faint focus:outline-none"
          />
        </div>

        {/* Section 3: Load */}
        <div className="rounded-2xl bg-police-card p-4 shadow-sm">
          <h3 className="mb-3 text-[14px] font-bold text-police-navy">3. Upakiaji (Load)</h3>
          <div className="grid grid-cols-3 gap-2">
            <LoadField label="Aina ya Mizigo" value="Abiria" />
            <LoadField label="Uzito (kg)" value="1200" />
            <LoadField label="Idadi ya Abiria" value="4" />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[12px] font-medium text-police">Je, upakiaji unazidi kiwango?</span>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 rounded-lg bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-600">
                <CheckCircle2 size={14} /> Hapana
              </span>
              <span className="flex items-center gap-1 rounded-lg bg-police-muted px-2.5 py-1 text-[11px] font-bold text-police-faint">
                <XCircle size={14} /> Ndio
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Photos */}
        <div className="rounded-2xl bg-police-card p-4 shadow-sm">
          <h3 className="mb-1 text-[14px] font-bold text-police-navy">4. Picha / Uthibitisho</h3>
          <p className="mb-3 text-[10px] text-police-faint">
            Piga picha sehemu muhimu za gari (nje, ndani, namba ya usajili, kasoro n.k.)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {v.photos.map((photo, i) => (
              <div
                key={i}
                className="flex aspect-[4/3] flex-col items-center justify-center rounded-xl border-2 border-dashed border-police bg-police-muted"
              >
                <Camera size={20} className="text-police-faint" />
                <span className="mt-1 text-[9px] text-police-faint">{photo.label}</span>
              </div>
            ))}
          </div>
          <button className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#2196F3]/40 py-2.5 text-[12px] font-semibold text-[#2196F3]">
            <Cloud size={16} /> Ongeza Picha
          </button>
        </div>

        {/* Section 5: Results */}
        <div className="rounded-2xl bg-police-card p-4 shadow-sm">
          <h3 className="mb-3 text-[14px] font-bold text-police-navy">5. Matokelo ya Ukaguzi</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-3">
              <ShieldCheck size={24} className="text-green-600" />
              <div className="flex-1">
                <p className="text-[13px] font-bold text-green-700">Gari Halina Kasoro Kubwa</p>
                <p className="text-[11px] text-police-muted">Gari linafaa kuendelea na safari</p>
              </div>
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-police-soft bg-police-muted p-3 opacity-70">
              <ShieldAlert size={24} className="text-red-500" />
              <div className="flex-1">
                <p className="text-[13px] font-bold text-red-600">Gari Lina Kasoro</p>
                <p className="text-[11px] text-police-muted">Lipaswe matengenezeko kabla ya kuendelea</p>
              </div>
              <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
            </div>
          </div>
        </div>

        {/* Section 6: Officer Signature */}
        <div className="rounded-2xl bg-police-card p-4 shadow-sm">
          <h3 className="mb-3 text-[14px] font-bold text-police-navy">6. Saini ya Afisa</h3>
          <div className="grid grid-cols-2 gap-2">
            <LoadField label="Jina la Afisa" value="Insp. Juma Mwinyi" />
            <LoadField label="Namba ya Utambulisho" value="TP123456" />
          </div>
          <div className="mt-3 rounded-xl border border-police bg-police-input p-4">
            <div className="flex items-center justify-between">
              <PenLine size={18} className="text-police-faint" />
              <button className="text-[11px] font-medium text-police-faint">
                <Trash2 size={14} className="inline" /> Futa
              </button>
            </div>
            <p className="mt-6 text-right font-[cursive] text-[18px] italic text-police-navy">J. Mwinyi</p>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={() => {
            toast({ title: "Ukaguzi Umekamilika", description: "Ripoti ya ukaguzi wa gari imehifadhiwa." });
            setTimeout(() => goBack(), 800);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A237E] py-3.5 text-[15px] font-bold text-white shadow-md active:scale-[0.98]"
        >
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
    <div className="rounded-2xl bg-police-card p-4 shadow-sm">
      <h3 className="mb-3 text-[14px] font-bold text-police-navy">{title}</h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border border-police-soft px-3 py-2"
          >
            <span className="flex-1 text-[12px] text-police">{item.label}</span>
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
      <p className="text-[10px] text-police-faint">{label}</p>
      <p className="text-[12px] font-medium text-police">{value}</p>
    </div>
  );
}

function LoadField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium text-police-faint">{label}</label>
      <div className="flex items-center justify-between rounded-lg border border-police bg-police-input px-2.5 py-2">
        <span className="text-[12px] text-police">{value}</span>
        <svg width="10" height="10" viewBox="0 0 12 12" className="text-police-faint">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
