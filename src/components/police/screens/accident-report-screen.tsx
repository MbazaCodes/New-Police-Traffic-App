"use client";

import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Car,
  Users,
  FileText,
  Cloud,
  Upload,
  FileCheck,
  ShieldAlert,
  ChevronRight,
  Save,
  Send,
  Image as ImageIcon,
  Video,
  FileSpreadsheet,
} from "lucide-react";
import { TopAppBar } from "../top-app-bar";
import { ACCIDENT_VEHICLES, ACCIDENT_PEOPLE, ACCIDENT_EVIDENCE } from "@/lib/police-data";
import { usePoliceStore } from "@/store/police-store";
import { toast } from "@/hooks/use-toast";

export function AccidentReportScreen() {
  const navigate = usePoliceStore((s) => s.navigate);
  return (
    <div className="min-h-full bg-police">
      <TopAppBar title="Ripoti ya Ajali" subtitle="Jaza taarifa za ajali kwa usahihi" showBack />

      <div className="space-y-3 p-4 pb-8">
        {/* Section 1: Taarifa za Msingi */}
        <Section title="Taarifa za Msingi" icon={<FileText size={16} />}>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Tarehe ya Ajali" icon={<Calendar size={14} />} value="15 Mei 2026" />
            <Field label="Saa ya Ajali" icon={<Clock size={14} />} value="08:15 AM" />
          </div>
          <Field label="Eneo la Ajali" icon={<MapPin size={14} />} value="Morogoro Road, Dar es Salaam" />
          <div>
            <label className="mb-1 block text-[11px] font-medium text-police-muted">
              Mahali Halisi (Maelezo ya Eneo)
            </label>
            <div className="rounded-xl border border-police bg-police-input px-3 py-2.5 text-[12px] text-police">
              Kwenye makutano ya Morogoro Road na Ubungo Terminal
            </div>
          </div>
        </Section>

        {/* Section 2: Magari Husika */}
        <Section
          title="Magari Husika"
          icon={<Car size={16} />}
          count="Jumla ya Magari: 2"
        >
          <div className="space-y-2">
            {ACCIDENT_VEHICLES.map((v, i) => (
              <div key={i} className="rounded-xl border border-police-soft bg-police-muted p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-md border border-[#1A237E] bg-yellow-50 px-2 py-0.5 text-[13px] font-extrabold text-police-navy">
                    {v.plate}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <MiniField label="Aina ya Gari" value={v.model} />
                  <MiniField label="Rangi" value={v.color} />
                  <MiniField label="Uharibifu" value={v.damage} valueColor={v.damage === "Kubwa" ? "text-red-600" : "text-orange-500"} />
                </div>
              </div>
            ))}
          </div>
          <button className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#1A237E]/30 py-2.5 text-[12px] font-semibold text-police-navy">
            <Plus size={16} /> Ongeza Gari
          </button>
        </Section>

        {/* Section 3: Watu Husika */}
        <Section title="Watu Husika" icon={<Users size={16} />} count="Jumla ya Watu: 2">
          <div className="space-y-2">
            {ACCIDENT_PEOPLE.map((p, i) => (
              <div key={i} className="rounded-xl border border-police-soft bg-police-muted p-3">
                <p className="text-[13px] font-bold text-police">{p.name}</p>
                <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                  <MiniField label="Jukumu" value={p.role} />
                  <MiniField label="Namba ya Simu" value={p.phone} />
                </div>
                <div className="mt-1.5">
                  <MiniField label="Hali" value={p.condition} valueColor={p.condition === "Hakuna Madhara" ? "text-green-600" : "text-orange-500"} />
                </div>
              </div>
            ))}
          </div>
          <button className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#1A237E]/30 py-2.5 text-[12px] font-semibold text-police-navy">
            <Plus size={16} /> Ongeza Mtu
          </button>
        </Section>

        {/* Section 4: Maelezo ya Ajali */}
        <Section title="Maelezo ya Ajali" icon={<FileText size={16} />}>
          <label className="mb-1 block text-[11px] font-medium text-police-muted">
            Eleza kwa kifupi kilichotokea
          </label>
          <textarea
            rows={4}
            defaultValue="Gari namba T123ABC lilikuwa linapita kuelekea Ubungo, na likajaribu kubadilisha njia ghafla bila tahadhari na kugongana na gari namba T789GHI lilokuwa linakuja kutoka nyuma."
            className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[12px] leading-relaxed text-police focus:border-[#1A237E] focus:outline-none"
          />
        </Section>

        {/* Section 5: Ushahidi */}
        <Section title="Pakia Ushahidi (Nyaraka / Picha / Video)" icon={<FileText size={16} />}>
          <p className="text-[10px] text-police-faint">Aina Zinaruhusiwa: JPG, PNG, PDF, MP4 (Max 20MB)</p>
          <div className="space-y-2">
            {ACCIDENT_EVIDENCE.map((file, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-xl border border-police-soft bg-police-muted p-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-police-card">
                  {file.type === "image" && <ImageIcon size={16} className="text-[#2196F3]" />}
                  {file.type === "video" && <Video size={16} className="text-purple-500" />}
                  {file.type === "pdf" && <FileSpreadsheet size={16} className="text-red-500" />}
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-police">{file.name}</p>
                  <p className="text-[10px] text-police-faint">{file.size}</p>
                </div>
                <FileCheck size={16} className="text-green-500" />
              </div>
            ))}
          </div>
          <button className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-[#1A237E]/30 py-2.5 text-[12px] font-semibold text-police-navy">
            <Upload size={14} /> Pakia Zaidi
          </button>
        </Section>

        {/* Section 6: Vitendo vya Ziada */}
        <Section title="Vitendo vya Ziada" icon={<ShieldAlert size={16} />}>
          <div className="flex items-center justify-between rounded-xl bg-police-muted px-3 py-2.5">
            <span className="text-[12px] font-medium text-police">Je, kulikuwa na majeruhi?</span>
            <ToggleSwitch defaultOn />
          </div>
          <button
            onClick={() => navigate("pf3")}
            className="flex w-full items-center justify-between rounded-xl border border-[#1A237E]/20 px-3 py-2.5 active:scale-[0.99]"
          >
            <span className="flex items-center gap-2 text-[12px] font-semibold text-police-navy">
              <FileText size={16} /> Tengeneza Fomu PF3
            </span>
            <ChevronRight size={16} className="text-police-faint" />
          </button>
          <button
            onClick={() =>
              toast({ title: "Imetumwa", description: "Taarifa imewasilishwa kwa Kituo Kikuu." })
            }
            className="flex w-full items-center justify-between rounded-xl border border-[#1A237E]/20 px-3 py-2.5 active:scale-[0.99]"
          >
            <span className="flex items-center gap-2 text-[12px] font-semibold text-police-navy">
              <Send size={16} /> Taarifa kwa Kituo Kikuu
            </span>
            <ChevronRight size={16} className="text-police-faint" />
          </button>
        </Section>

        {/* Submit Buttons */}
        <div className="flex gap-2.5 pt-1">
          <button
            onClick={() =>
              toast({ title: "Imehifadhiwa", description: "Rasimu ya ripoti ya ajali imehifadhiwa." })
            }
            className="flex-1 rounded-xl border-2 border-[#1A237E] bg-police-card py-3 text-[13px] font-bold text-police-navy active:scale-[0.98]"
          >
            Hifadhi Rasimu
          </button>
          <button
            onClick={() =>
              toast({ title: "Imetumwa", description: "Ripoti ya ajali imewasilishwa kikamilifu." })
            }
            className="flex-[1.5] rounded-xl bg-[#1A237E] py-3 text-[13px] font-bold text-white shadow-md active:scale-[0.98]"
          >
            Hifadhi na Tuma Ripoti
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-police-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[14px] font-bold text-police-navy">
          <span className="text-police-navy">{icon}</span>
          {title}
        </h3>
        {count && <span className="text-[11px] font-medium text-police-faint">{count}</span>}
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Field({
  label,
  icon,
  value,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-police-muted">{label}</label>
      <div className="flex items-center gap-2 rounded-xl border border-police bg-police-input px-3">
        <span className="text-police-faint">{icon}</span>
        <span className="h-10 flex-1 text-[12px] text-police">{value}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" className="text-police-faint">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

function MiniField({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div>
      <p className="text-[9px] text-police-faint">{label}</p>
      <p className={`text-[12px] font-semibold ${valueColor ?? "text-police"}`}>{value}</p>
    </div>
  );
}

function ToggleSwitch({ defaultOn = false }: { defaultOn?: boolean }) {
  return (
    <div
      className={`relative h-6 w-11 rounded-full transition ${defaultOn ? "bg-green-500" : "bg-gray-300"}`}
    >
      <div
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-police-card shadow transition ${
          defaultOn ? "left-[22px]" : "left-0.5"
        }`}
      />
    </div>
  );
}
