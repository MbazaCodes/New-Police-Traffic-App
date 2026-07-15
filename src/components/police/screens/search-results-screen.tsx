"use client";

import {
  ChevronLeft,
  Share2,
  AlertTriangle,
  FileText,
  MessageSquareWarning,
  Hand,
  ShieldCheck,
  CheckCircle2,
  Car,
  User,
  CreditCard,
  Wallet,
} from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { SEARCH_RESULT } from "@/lib/police-data";
import { toast } from "@/hooks/use-toast";

export function SearchResultsScreen() {
  const goBack = usePoliceStore((s) => s.goBack);
  const navigate = usePoliceStore((s) => s.navigate);
  const r = SEARCH_RESULT;

  return (
    <div className="min-h-full bg-[#F5F5F5]">
      {/* Top App Bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-3 py-3">
        <div className="flex items-center gap-1">
          <button onClick={goBack} className="text-gray-700">
            <ChevronLeft size={26} strokeWidth={2.5} />
          </button>
          <h1 className="text-[17px] font-bold text-[#1A237E]">Matokéo ya Utafutaji</h1>
        </div>
        <button className="text-gray-600">
          <Share2 size={20} />
        </button>
      </header>

      <div className="space-y-3 p-4">
        {/* Plate + status header */}
        <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
          <div>
            <div className="inline-block rounded-lg border-2 border-[#1A237E] bg-yellow-50 px-3 py-1 text-[18px] font-extrabold tracking-wider text-[#1A237E]">
              {r.plate}
            </div>
            <p className="mt-2 text-[11px] text-gray-500">Tarehe: {r.date}</p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1.5 text-[12px] font-bold text-green-600">
            <CheckCircle2 size={14} />
            {r.status}
          </span>
        </div>

        {/* Alert box */}
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-extrabold uppercase text-red-600">Alert</span>
                <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  Tahadhari
                </span>
              </div>
              <p className="mt-1 text-[12px] leading-snug text-gray-700">{r.alertMessage}</p>
            </div>
          </div>
        </div>

        {/* Risk Score */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-gray-600">Recent Violation Score</span>
            <span className="text-[13px] font-medium text-gray-500">Driver : Scored {r.riskScore}% points</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#007BFF] to-[#F44336]"
              style={{ width: `${r.riskScore}%` }}
            />
          </div>
          <p className="mt-2 text-[12px] text-gray-600">
            Kiwango cha hatari :{" "}
            <span className="font-extrabold text-red-600">{r.riskLevel}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <ActionButton
            icon={<FileText size={18} />}
            label="Ongeza Citation"
            color="#2563EB"
            onClick={() => navigate("citation")}
          />
          <ActionButton
            icon={<MessageSquareWarning size={18} />}
            label="Ongeza Onyo"
            color="#FF9800"
            onClick={() =>
              toast({ title: "Onyo Limetolewa", description: "Onyo limewasilishwa kwa dereva." })
            }
          />
          <ActionButton
            icon={<Hand size={18} />}
            label="Arrest"
            color="#F44336"
            onClick={() =>
              toast({ title: "Kizuizi Kimewekwa", description: "Mchakato wa kizuizi umeanzishwa." })
            }
          />
        </div>

        {/* Insurance */}
        <SectionCard title="INSURANCE COVER AND STATUS" icon={<ShieldCheck size={18} className="text-[#1A237E]" />}>
          <Row label="Bima" value={r.insurance.company} />
          <Row label="Polisi Na." value={r.insurance.policy} />
          <Row label="Inamalizika" value={r.insurance.expires} />
          <div className="mt-2 flex items-center gap-1.5">
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-600">
              <CheckCircle2 size={12} /> VALID
            </span>
          </div>
        </SectionCard>

        {/* Driver Info */}
        <SectionCard title="DRIVER INFORMATION" icon={<User size={18} className="text-[#1A237E]" />}>
          <Row label="Name" value={r.driver.name} />
          <Row label="Gender" value={r.driver.gender} />
          <Row label="Drive Licence Number" value={r.driver.license} />
          <Row label="Driver Licence Class" value={r.driver.licenseClass} />
          <Row label="NIDA NUMBER" value={r.driver.nida} />
          <Row label="Mobile Number" value={r.driver.mobile} />
        </SectionCard>

        {/* Vehicle Info */}
        <SectionCard title="VEHICLE INFORMATION" icon={<Car size={18} className="text-[#1A237E]" />}>
          <Row label="Model" value={r.vehicle.model} />
          <Row label="Type" value={r.vehicle.type} />
          <Row label="Year" value={r.vehicle.year} />
          <Row label="Color" value={r.vehicle.color} />
          <Row
            label="Accident Involve"
            value={r.vehicle.accidentInvolved ? "Ndiyo" : "Hapana"}
            valueColor={r.vehicle.accidentInvolved ? "text-red-600" : undefined}
          />
        </SectionCard>

        {/* Payment */}
        <SectionCard title="PAYMENT AND BILLS STATUS" icon={<Wallet size={18} className="text-[#1A237E]" />}>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-gray-600">Has Outstanding</span>
            <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-500">
              Has Outstanding
            </span>
          </div>
          <Row label="Jumla ya Makosa" value={String(r.payment.totalViolations)} />
        </SectionCard>

        {/* Violations */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-[13px] font-bold uppercase text-[#1A237E]">
            <CreditCard size={18} /> Violations
          </h3>
          <div className="space-y-2">
            {r.violations.map((v) => (
              <div key={v.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[13px] font-bold text-gray-800">
                      {v.id}. {v.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-500">
                      Tarehe: {v.date} • Eneo: {v.area}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-bold text-gray-800">{v.fine}</p>
                    <span className="mt-1 inline-block rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                      HAJALIPWA
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-xl bg-white py-3 shadow-sm active:scale-[0.97]"
      style={{ borderTop: `3px solid ${color}` }}
    >
      <span style={{ color }}>{icon}</span>
      <span className="px-1 text-center text-[10px] font-semibold text-gray-700">{label}</span>
    </button>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="mb-2.5 flex items-center gap-2 border-b border-gray-100 pb-2 text-[12px] font-bold uppercase tracking-wide text-[#1A237E]">
        {icon}
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[12px] text-gray-500">{label}</span>
      <span className={`text-[12px] font-semibold ${valueColor ?? "text-gray-800"}`}>{value}</span>
    </div>
  );
}
