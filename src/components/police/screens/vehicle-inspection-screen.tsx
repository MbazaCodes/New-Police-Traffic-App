"use client";

import { useOfficer } from "@/hooks/use-officer";

import { useState } from "react";
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
} from "lucide-react";
import { TopAppBar } from "../top-app-bar";
import { usePoliceStore } from "@/store/police-store";
import { useRecordsStore } from "@/store/records-store";
import { toast } from "@/hooks/use-toast";

export function VehicleInspectionScreen() {
  const OFFICER = useOfficer();
  const v = {} as Record<string,unknown>;
  const goBack = usePoliceStore((s) => s.goBack);
  const addInspection = useRecordsStore((s) => s.addInspection);

  const [isEditing, setIsEditing] = useState(false);
  const [plate, setPlate] = useState(v.plate);
  const [model, setModel] = useState(v.model);
  const [color, setColor] = useState(v.color);
  const [owner, setOwner] = useState(v.owner);
  const [notes, setNotes] = useState("");
  const [overloaded, setOverloaded] = useState(false);
  const [result, setResult] = useState<"pass" | "fail" | null>(null);
  const [photos, setPhotos] = useState<{ label: string }[]>(v.photos.map((p) => ({ label: p.label })));
  const [signature, setSignature] = useState("J. Mwinyi");

  const now = new Date();
  const today = now.toLocaleDateString("sw-TZ", { day: "numeric", month: "long", year: "numeric" });
  const currentTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const documentsPass = v.documents.filter((d) => d.pass).length;
  const documentsTotal = v.documents.length;
  const mechanicalPass = v.mechanical.filter((m) => m.pass).length;
  const mechanicalTotal = v.mechanical.length;
  const allPass = v.documents.every((d) => d.pass) && v.mechanical.every((m) => m.pass);
  const computedResult: "pass" | "fail" =
    result ?? (allPass ? "pass" : "fail");

  const addPhoto = () =>
    setPhotos((prev) => [...prev, { label: `Picha ${prev.length + 1}` }]);

  const clearSignature = () => {
    setSignature("");
    toast({ title: "Imefutwa", description: "Saini imefutwa." });
  };

  const handleSubmit = () => {
    addInspection({
      plate,
      model,
      color,
      owner,
      officer: OFFICER.name,
      date: `${today} ${currentTime}`,
      result: computedResult,
      documentsChecked: documentsTotal,
      mechanicalChecked: mechanicalTotal,
      notes: notes || undefined,
    });
    toast({ title: "Ukaguzi Umekamilika", description: "Ripoti ya ukaguzi wa gari imehifadhiwa." });
    setTimeout(() => goBack(), 800);
  };

  return (
    <div className="min-h-full bg-police">
      <TopAppBar title="Ukaguzi wa Gari" subtitle="Jaza taarifa za ukaguzi wa halia ya gari" showBack />

      <div className="space-y-3 p-4 pb-8">
        {/* Vehicle Info Header */}
        <div className="tpf-card p-4">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    className="w-full rounded-md border-2 border-[#1E3A8A] bg-yellow-50 px-2.5 py-1 text-[16px] font-extrabold tracking-wider text-police-navy focus:outline-none"
                  />
                  <input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Modeli"
                    className="w-full rounded-md border border-police bg-police-input px-2 py-1 text-[13px] text-police-muted focus:outline-none"
                  />
                  <input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Rangi"
                    className="w-full rounded-md border border-police bg-police-input px-2 py-1 text-[13px] text-police-muted focus:outline-none"
                  />
                </div>
              ) : (
                <>
                  <span className="inline-block rounded-md border-2 border-[#1E3A8A] bg-yellow-50 px-2.5 py-1 text-[16px] font-extrabold tracking-wider text-police-navy">
                    {plate}
                  </span>
                  <p className="mt-2 text-[13px] text-police-muted">
                    {model} | {color}
                  </p>
                </>
              )}
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#2196F3] px-2.5 py-1 text-[11px] font-semibold text-[#2196F3] active:scale-[0.97]"
            >
              <Pencil size={12} /> {isEditing ? "Kamilisha" : "Hariri"}
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-police-soft pt-3">
            {isEditing ? (
              <div className="col-span-2">
                <label className="mb-1 block text-[10px] text-police-faint">Mwenye Gari</label>
                <input
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full rounded-md border border-police bg-police-input px-2 py-1 text-[12px] text-police focus:outline-none"
                />
              </div>
            ) : (
              <InfoRow label="Mwenye Gari" value={owner} />
            )}
            <InfoRow label="Namba ya Simu" value={v.phone} />
            <InfoRow label="Eneo la Ukaguzi" value={v.location} />
            <InfoRow label="Tarehe & Saa" value={`${today}, ${currentTime}`} />
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
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Andika maelezo ya kasoro au halisi nyingine..."
            className="w-full rounded-xl border border-police bg-police-input px-3 py-2 text-[12px] text-police placeholder:text-police-faint focus:outline-none"
          />
        </div>

        {/* Section 3: Load */}
        <div className="tpf-card p-4">
          <h3 className="mb-3 text-[14px] font-bold text-police-navy">3. Upakiaji (Load)</h3>
          <div className="grid grid-cols-3 gap-2">
            <LoadField label="Aina ya Mizigo" value="Abiria" />
            <LoadField label="Uzito (kg)" value="1200" />
            <LoadField label="Idadi ya Abiria" value="4" />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[12px] font-medium text-police">Je, upakiaji unazidi kiwango?</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOverloaded(false)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  !overloaded
                    ? "bg-[#10B981]/10 text-[#10B981]"
                    : "bg-police-muted text-police-faint"
                }`}
              >
                <CheckCircle2 size={14} /> Hapana
              </button>
              <button
                type="button"
                onClick={() => setOverloaded(true)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  overloaded
                    ? "bg-[#EF4444]/10 text-[#EF4444]"
                    : "bg-police-muted text-police-faint"
                }`}
              >
                <XCircle size={14} /> Ndio
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Photos */}
        <div className="tpf-card p-4">
          <h3 className="mb-1 text-[14px] font-bold text-police-navy">4. Picha / Uthibitisho</h3>
          <p className="mb-3 text-[10px] text-police-faint">
            Piga picha sehemu muhimu za gari (nje, ndani, namba ya usajili, kasoro n.k.)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {photos.map((photo, i) => (
              <div
                key={i}
                className="flex aspect-[4/3] flex-col items-center justify-center rounded-xl border-2 border-dashed border-police bg-police-muted"
              >
                <Camera size={20} className="text-police-faint" />
                <span className="mt-1 text-[9px] text-police-faint">{photo.label}</span>
              </div>
            ))}
          </div>
          <button
            onClick={addPhoto}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#2196F3]/40 py-2.5 text-[12px] font-semibold text-[#2196F3] active:scale-[0.98]"
          >
            <Cloud size={16} /> Ongeza Picha
          </button>
        </div>

        {/* Section 5: Results */}
        <div className="tpf-card p-4">
          <h3 className="mb-3 text-[14px] font-bold text-police-navy">5. Matokelo ya Ukaguzi</h3>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setResult("pass")}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 transition ${
                computedResult === "pass"
                  ? "border-[#10B981]/200 bg-[#10B981]/10"
                  : "border-police-soft bg-police-muted opacity-70"
              }`}
            >
              <ShieldCheck size={24} className="text-[#10B981]" />
              <div className="flex-1 text-left">
                <p className="text-[13px] font-bold text-[#10B981]700">Gari Halina Kasoro Kubwa</p>
                <p className="text-[11px] text-police-muted">Gari linafaa kuendelea na safari</p>
              </div>
              <CheckCircle2 size={20} className={`text-[#10B981] ${computedResult === "pass" ? "" : "opacity-30"}`} />
            </button>
            <button
              type="button"
              onClick={() => setResult("fail")}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 transition ${
                computedResult === "fail"
                  ? "border-[#EF4444]/20 bg-[#EF4444]/10"
                  : "border-police-soft bg-police-muted opacity-70"
              }`}
            >
              <ShieldAlert size={24} className="text-[#EF4444]" />
              <div className="flex-1 text-left">
                <p className="text-[13px] font-bold text-[#EF4444]">Gari Lina Kasoro</p>
                <p className="text-[11px] text-police-muted">Lipaswe matengenezeko kabla ya kuendelea</p>
              </div>
              <div className={`h-5 w-5 rounded-full border-2 ${computedResult === "fail" ? "border-[#EF4444]/600 bg-[#EF4444]/600" : "border-gray-300"}`} />
            </button>
          </div>
        </div>

        {/* Section 6: Officer Signature */}
        <div className="tpf-card p-4">
          <h3 className="mb-3 text-[14px] font-bold text-police-navy">6. Saini ya Afisa</h3>
          <div className="grid grid-cols-2 gap-2">
            <LoadField label="Jina la Afisa" value={OFFICER.name} />
            <LoadField label="Namba ya Utambulisho" value={OFFICER.id} />
          </div>
          <div className="mt-3 rounded-xl border border-police bg-police-input p-4">
            <div className="flex items-center justify-between">
              <PenLine size={18} className="text-police-faint" />
              <button
                onClick={clearSignature}
                className="text-[11px] font-medium text-police-faint active:opacity-70"
              >
                <Trash2 size={14} className="inline" /> Futa
              </button>
            </div>
            {signature ? (
              <p className="mt-6 text-right font-[cursive] text-[18px] italic text-police-navy">{signature}</p>
            ) : (
              <p className="mt-6 text-right text-[11px] italic text-police-faint">Saini imefutwa — tenwe upya</p>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] py-3.5 text-[15px] font-bold text-white shadow-md active:scale-[0.98]"
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
    <div className="tpf-card p-4">
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
                  ? "bg-[#10B981]/10 text-[#10B981]"
                  : "bg-[#FF9800]/50 text-[#FF9800]"
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
