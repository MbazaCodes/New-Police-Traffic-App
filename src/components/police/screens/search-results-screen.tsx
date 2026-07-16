"use client";

import { useEffect, useMemo } from "react";
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
import { useRecordsStore } from "@/store/records-store";
import { SEARCH_RESULT, OFFICER } from "@/lib/police-data";
import { findMatchingMissingAlerts } from "@/lib/shared-missing-alerts";
import { toast } from "@/hooks/use-toast";
import { Loader2, SearchX } from "lucide-react";

export function SearchResultsScreen() {
  const goBack = usePoliceStore((s) => s.goBack);
  const navigate = usePoliceStore((s) => s.navigate);
  const searchStatus = usePoliceStore((s) => s.searchStatus);
  const searchQuery = usePoliceStore((s) => s.searchQuery);
  const searchEntity = usePoliceStore((s) => s.searchEntity);
  const setCitationPrefill = usePoliceStore((s) => s.setCitationPrefill);
  const addWarning = useRecordsStore((s) => s.addWarning);
  const addArrest = useRecordsStore((s) => s.addArrest);
  const r = SEARCH_RESULT;

  const matchedAlerts = useMemo(() => {
    const queries = [searchQuery, r.plate, r.driver.nida, r.driver.name].filter(Boolean);
    const all = queries.flatMap((q) => findMatchingMissingAlerts(q, searchEntity));
    const seen = new Set<string>();
    return all.filter((a) => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
  }, [r.driver.name, r.driver.nida, r.plate, searchEntity, searchQuery]);

  useEffect(() => {
    if (searchStatus !== "found" || matchedAlerts.length === 0) return;
    const first = matchedAlerts[0];
    toast({
      title: "ALERT: Rekodi ya Missing Imeonekana",
      description: `${first.title} (${first.identifier})`,
    });
  }, [matchedAlerts, searchStatus]);

  const goToCitation = () => {
    setCitationPrefill({
      plate: r.plate,
      model: r.vehicle.model,
      color: r.vehicle.color,
      vehicleType: r.vehicle.type,
      driverName: r.driver.name,
      driverLicense: r.driver.license,
      driverPhone: r.driver.mobile,
      driverNida: r.driver.nida,
    });
    navigate("citation");
  };

  const now = new Date();
  const today = now.toLocaleDateString("sw-TZ", { day: "numeric", month: "long", year: "numeric" });

  const handleAddWarning = () => {
    addWarning({
      citizenName: r.driver.name,
      citizenNida: r.driver.nida,
      citizenPhone: r.driver.mobile,
      reason: "Onyo la trafiki — onyo limetolewa kutoka matokeo ya utafutaji",
      location: "Morogoro Road, DSM",
      date: today,
      officer: OFFICER.name,
    });
    toast({ title: "Onyo Limetolewa", description: "Onyo limewasilishwa kwa dereva." });
    setTimeout(() => goBack(), 800);
  };

  const handleArrest = () => {
    addArrest({
      suspectName: r.driver.name,
      suspectNida: r.driver.nida,
      suspectPhone: r.driver.mobile,
      reason: "Kizuizi kimewekwa kutoka matokeo ya utafutaji",
      location: "Morogoro Road, DSM",
      date: today,
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
      officer: OFFICER.name,
      station: OFFICER.station,
    });
    toast({ title: "Kizuizi Kimewekwa", description: "Mchakato wa kizuizi umeanzishwa." });
    setTimeout(() => goBack(), 800);
  };

  return (
    <div className="min-h-full bg-police">
      {/* Top App Bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-police-soft bg-police-card px-3 py-3">
        <div className="flex items-center gap-1">
          <button onClick={goBack} className="text-police">
            <ChevronLeft size={26} strokeWidth={2.5} />
          </button>
          <h1 className="text-[17px] font-bold text-police-navy">Matokéo ya Utafutaji</h1>
        </div>
        <button className="text-police-muted">
          <Share2 size={20} />
        </button>
      </header>

      {/* Searching state */}
      {searchStatus === "searching" && (
        <div className="flex flex-col items-center justify-center gap-4 px-4 py-24">
          <Loader2 size={48} className="animate-spin text-[#2196F3]" />
          <p className="text-[15px] font-bold text-police-navy">Inatafuta taarifa...</p>
          <p className="text-[12px] text-police-muted">
            {searchQuery ? `Inatafuta: "${searchQuery}"` : "Inatafuta rekodi..."}
          </p>
          <p className="text-[11px] text-police-faint">Inafungua taarifa za gari na dereva</p>
        </div>
      )}

      {/* Not found state */}
      {searchStatus === "not-found" && (
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center">
          <SearchX size={48} className="text-police-faint" />
          <p className="text-[15px] font-bold text-police-navy">Taarifa Haijapatikana</p>
          <p className="text-[12px] text-police-muted">
            Hakuna rekodi ya "{searchQuery}" iliyopatikana. Angalia namba na ujaribu tena.
          </p>
          <button
            onClick={goBack}
            className="mt-2 rounded-xl bg-[#2196F3] px-6 py-2.5 text-[13px] font-bold text-white"
          >
            Jaribu Tena
          </button>
        </div>
      )}

      {/* Found / idle: show full results */}
      {(searchStatus === "found" || searchStatus === "idle") && (
      <div className="space-y-3 p-4">
        {/* Plate + status header */}
        <div className="flex items-center justify-between rounded-2xl bg-police-card p-4 shadow-sm">
          <div>
            <div className="inline-block rounded-lg border-2 border-[#1A237E] bg-yellow-50 px-3 py-1 text-[18px] font-extrabold tracking-wider text-police-navy">
              {r.plate}
            </div>
            <p className="mt-2 text-[11px] text-police-muted">Tarehe: {r.date}</p>
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
              <p className="mt-1 text-[12px] leading-snug text-police">{r.alertMessage}</p>
            </div>
          </div>
        </div>

        {matchedAlerts.length > 0 && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-4">
            <p className="text-[12px] font-extrabold uppercase text-red-700">Missing Registry Alert</p>
            <p className="mt-1 text-[12px] text-police">
              {matchedAlerts[0].title} • {matchedAlerts[0].identifier}
            </p>
            <p className="mt-1 text-[11px] text-police-muted">{matchedAlerts[0].details}</p>
            {matchedAlerts[0].imageUrl && (
              <img
                src={matchedAlerts[0].imageUrl}
                alt="Missing record"
                className="mt-2 h-24 w-24 rounded-lg object-cover"
              />
            )}
          </div>
        )}

        {/* Risk Score */}
        <div className="rounded-2xl bg-police-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-police-muted">Recent Violation Score</span>
            <span className="text-[13px] font-medium text-police-muted">Driver : Scored {r.riskScore}% points</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-police-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#007BFF] to-[#F44336]"
              style={{ width: `${r.riskScore}%` }}
            />
          </div>
          <p className="mt-2 text-[12px] text-police-muted">
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
            onClick={() => goToCitation()}
          />
          <ActionButton
            icon={<MessageSquareWarning size={18} />}
            label="Ongeza Onyo"
            color="#FF9800"
            onClick={handleAddWarning}
          />
          <ActionButton
            icon={<Hand size={18} />}
            label="Arrest"
            color="#F44336"
            onClick={handleArrest}
          />
        </div>

        {/* Insurance */}
        <SectionCard title="INSURANCE COVER AND STATUS" icon={<ShieldCheck size={18} className="text-police-navy" />}>
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
        <SectionCard title="DRIVER INFORMATION" icon={<User size={18} className="text-police-navy" />}>
          <Row label="Name" value={r.driver.name} />
          <Row label="Gender" value={r.driver.gender} />
          <Row label="Drive Licence Number" value={r.driver.license} />
          <Row label="Driver Licence Class" value={r.driver.licenseClass} />
          <Row label="NIDA NUMBER" value={r.driver.nida} />
          <Row label="Mobile Number" value={r.driver.mobile} />
        </SectionCard>

        {/* Vehicle Info */}
        <SectionCard title="VEHICLE INFORMATION" icon={<Car size={18} className="text-police-navy" />}>
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
        <SectionCard title="PAYMENT AND BILLS STATUS" icon={<Wallet size={18} className="text-police-navy" />}>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-police-muted">Has Outstanding</span>
            <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-500">
              Has Outstanding
            </span>
          </div>
          <Row label="Jumla ya Makosa" value={String(r.payment.totalViolations)} />
        </SectionCard>

        {/* Violations */}
        <div className="rounded-2xl bg-police-card p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-[13px] font-bold uppercase text-police-navy">
            <CreditCard size={18} /> Violations
          </h3>
          <div className="space-y-2">
            {r.violations.map((v) => (
              <div key={v.id} className="rounded-xl border border-police-soft bg-police-muted p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[13px] font-bold text-police">
                      {v.id}. {v.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-police-muted">
                      Tarehe: {v.date} • Eneo: {v.area}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-bold text-police">{v.fine}</p>
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
      )}
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
      className="flex flex-col items-center gap-1.5 rounded-xl bg-police-card py-3 shadow-sm active:scale-[0.97]"
      style={{ borderTop: `3px solid ${color}` }}
    >
      <span style={{ color }}>{icon}</span>
      <span className="px-1 text-center text-[10px] font-semibold text-police">{label}</span>
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
    <div className="rounded-2xl bg-police-card p-4 shadow-sm">
      <h3 className="mb-2.5 flex items-center gap-2 border-b border-police-soft pb-2 text-[12px] font-bold uppercase tracking-wide text-police-navy">
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
      <span className="text-[12px] text-police-muted">{label}</span>
      <span className={`text-[12px] font-semibold ${valueColor ?? "text-police"}`}>{value}</span>
    </div>
  );
}
