"use client";

import { useEffect, useMemo } from "react";
import {
  ChevronLeft,
  Share2,
  AlertTriangle,
  FileText,
  MessageSquareWarning,
  Hand,
  User,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Car,
  History,
  Loader2,
  SearchX,
  Phone,
  CreditCard,
  MapPin,
  Briefcase,
  Calendar,
  UserCircle2,
} from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { useRecordsStore } from "@/store/records-store";
import { CITIZEN_RESULT } from "@/lib/admin-mgmt-data";
import { OFFICER } from "@/lib/police-data";
import { findMatchingMissingAlerts } from "@/lib/shared-missing-alerts";
import { toast } from "@/hooks/use-toast";

export function CitizenSearchResultsScreen() {
  const goBack = usePoliceStore((s) => s.goBack);
  const searchStatus = usePoliceStore((s) => s.searchStatus);
  const searchQuery = usePoliceStore((s) => s.searchQuery);
  const searchEntity = usePoliceStore((s) => s.searchEntity);
  const runSearch = usePoliceStore((s) => s.runSearch);
  const addIncident = useRecordsStore((s) => s.addIncident);
  const addWarning = useRecordsStore((s) => s.addWarning);
  const addArrest = useRecordsStore((s) => s.addArrest);
  const r = CITIZEN_RESULT;

  const now = new Date();
  const today = now.toLocaleDateString("sw-TZ", { day: "numeric", month: "long", year: "numeric" });
  const currentTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const handleRecordInfo = () => {
    addIncident({
      type: "Taarifa ya Raia",
      location: r.address,
      date: today,
      time: currentTime,
      status: "active",
      priority: "medium",
      assignedTo: OFFICER.name,
      description: `Taarifa imerekodiwa kwa raia: ${r.name} (NIDA: ${r.nida})`,
    });
    toast({ title: "Taarifa Imerekodiwa", description: "Taarifa mpya ya raia imerekodiwa kikamilifu." });
    setTimeout(() => goBack(), 800);
  };

  const handleGiveWarning = () => {
    addWarning({
      citizenName: r.name,
      citizenNida: r.nida,
      citizenPhone: r.mobile,
      reason: "Onyo limetolewa kutoka matokeo ya utafutaji wa raia",
      location: r.address,
      date: today,
      officer: OFFICER.name,
    });
    toast({ title: "Onyo Limetolewa", description: "Onyo limewasilishwa kwa raia." });
    setTimeout(() => goBack(), 800);
  };

  const handleArrest = () => {
    addArrest({
      suspectName: r.name,
      suspectNida: r.nida,
      suspectPhone: r.mobile,
      reason: "Kizuizi kimewekwa kutoka matokeo ya utafutaji wa raia",
      location: r.address,
      date: today,
      time: currentTime,
      officer: OFFICER.name,
      station: OFFICER.station,
    });
    toast({ title: "Kizuizi Kimewekwa", description: "Mchakato wa kuzuia/kamata umeanzishwa." });
    setTimeout(() => goBack(), 800);
  };

  const matchedAlerts = useMemo(() => {
    const queries = [searchQuery, r.name, r.nida, r.mobile, ...r.vehicles.map((v) => v.plate)].filter(Boolean);
    const all = queries.flatMap((q) => findMatchingMissingAlerts(q, searchEntity));
    const seen = new Set<string>();
    return all.filter((a) => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
  }, [r.mobile, r.name, r.nida, r.vehicles, searchEntity, searchQuery]);

  useEffect(() => {
    if (searchStatus !== "found" || matchedAlerts.length === 0) return;
    toast({
      title: "ALERT: Missing Rekodi Imeonekana",
      description: `${matchedAlerts[0].title} (${matchedAlerts[0].identifier})`,
    });
  }, [matchedAlerts, searchStatus]);

  const initials = r.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const statusBadgeBg =
    r.statusColor === "#4CAF50"
      ? "bg-green-50 text-green-600"
      : r.statusColor === "#FF9800"
        ? "bg-orange-50 text-orange-500"
        : "bg-red-50 text-red-600";

  return (
    <div className="min-h-full bg-police">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-police-soft bg-police-card px-3 py-3">
        <div className="flex items-center gap-1">
          <button onClick={goBack} className="text-police">
            <ChevronLeft size={26} strokeWidth={2.5} />
          </button>
          <h1 className="text-[17px] font-bold text-police-navy">Matokeo ya Raia</h1>
        </div>
        <button
          onClick={() =>
            toast({
              title: "Shiriki Taarifa",
              description: "Taarifa za raia zimeshirikiwa kikamilifu.",
            })
          }
          className="text-police-muted"
        >
          <Share2 size={20} />
        </button>
      </header>

      {/* Searching state */}
      {searchStatus === "searching" && (
        <div className="flex flex-col items-center justify-center gap-4 px-4 py-24">
          <Loader2 size={48} className="animate-spin text-[#2196F3]" />
          <p className="text-[15px] font-bold text-police-navy">Inatafuta taarifa za raia...</p>
          <p className="text-[12px] text-police-muted">
            {searchQuery ? `Inatafuta: "${searchQuery}"` : "Inatafuta rekodi ya raia..."}
          </p>
          <p className="text-[11px] text-police-faint">Inafungua taarifa za mtu na historia yake</p>
        </div>
      )}

      {/* Not found state */}
      {searchStatus === "not-found" && (
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center">
          <SearchX size={48} className="text-police-faint" />
          <p className="text-[15px] font-bold text-police-navy">Raia Hajapatikana</p>
          <p className="text-[12px] text-police-muted">
            Hakuna rekodi ya &quot;{searchQuery}&quot; iliyopatikana. Angalia neno la utafutaji na
            ujaribu tena.
          </p>
          <button
            onClick={() => {
              runSearch(searchQuery);
            }}
            className="mt-2 rounded-xl bg-[#2196F3] px-6 py-2.5 text-[13px] font-bold text-white"
          >
            Jaribu Tena
          </button>
        </div>
      )}

      {/* Found / idle: show full citizen profile */}
      {(searchStatus === "found" || searchStatus === "idle") && (
        <div className="space-y-3 p-4">
          {/* Citizen Header Card */}
          <div className="rounded-2xl bg-police-card p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] text-[22px] font-extrabold text-white ring-2 ring-[#3B82F6]/20">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[16px] font-bold text-police">{r.name}</h2>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusBadgeBg}`}
                  >
                    {r.status}
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  <p className="flex items-center gap-1.5 text-[12px] text-police-muted">
                    <CreditCard size={13} className="text-police-faint" />
                    NIDA: <span className="font-semibold text-police">{r.nida}</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-[12px] text-police-muted">
                    <Phone size={13} className="text-police-faint" />
                    Simu: <span className="font-semibold text-police">{r.mobile}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Alert box (only if alerts exist) */}
          {(r.alerts.length > 0 || matchedAlerts.length > 0) && (
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
                  <p className="mt-1 text-[12px] leading-snug text-police">
                    {matchedAlerts[0]?.details ?? r.alerts[0]}
                  </p>
                  {matchedAlerts[0] && (
                    <p className="mt-1 text-[11px] text-red-700">
                      {matchedAlerts[0].title} • {matchedAlerts[0].identifier}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <ActionButton
              icon={<FileText size={18} />}
              label="Rekodi Taarifa"
              color="#2563EB"
              onClick={handleRecordInfo}
            />
            <ActionButton
              icon={<MessageSquareWarning size={18} />}
              label="Toa Onyo"
              color="#FF9800"
              onClick={handleGiveWarning}
            />
            <ActionButton
              icon={<Hand size={18} />}
              label="Kamata"
              color="#F44336"
              onClick={handleArrest}
            />
          </div>

          {/* Personal Info */}
          <SectionCard
            title="Taarifa za Kibinafsi"
            icon={<User size={18} className="text-police-navy" />}
          >
            <Row icon={<UserCircle2 size={14} />} label="Jinsia" value={r.gender} />
            <Row icon={<Calendar size={14} />} label="Tarehe ya Kuzaliwa" value={r.dob} />
            <Row icon={<User size={14} />} label="Umri" value={`${r.age} miaka`} />
            <Row icon={<MapPin size={14} />} label="Anuani" value={r.address} />
            <Row icon={<Briefcase size={14} />} label="Kazi" value={r.occupation} />
          </SectionCard>

          {/* Criminal Record */}
          <SectionCard
            title="Rekodi ya Uhalifu"
            icon={<ShieldAlert size={18} className="text-police-navy" />}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-police-muted">Status ya Rekodi</span>
              {r.criminalRecord.hasRecord ? (
                <span className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600">
                  <XCircle size={12} /> Ana Rekodi
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-600">
                  <CheckCircle2 size={12} /> Hakana Rekodi
                </span>
              )}
            </div>
            <Row label="Kesi Zilizowekwa" value={String(r.criminalRecord.cases)} />
            <Row label="Uhukumu" value={String(r.criminalRecord.convictions)} />
          </SectionCard>

          {/* Documents */}
          <SectionCard
            title="Hati za Kitaifa"
            icon={<FileText size={18} className="text-police-navy" />}
          >
            <div className="space-y-2">
              {r.documents.map((doc, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-police-soft bg-police-muted p-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-bold text-police">{doc.type}</p>
                    <p className="mt-0.5 text-[11px] text-police-muted">{doc.number}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      doc.status === "Sahihi"
                        ? "bg-green-50 text-green-600"
                        : doc.status === "Imeisha"
                          ? "bg-orange-50 text-orange-500"
                          : "bg-red-50 text-red-600"
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Vehicles */}
          <SectionCard
            title="Magari Yaliyosajiliwa"
            icon={<Car size={18} className="text-police-navy" />}
          >
            {r.vehicles.length > 0 ? (
              <div className="space-y-2">
                {r.vehicles.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-police-soft bg-police-muted p-2.5"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1E3A8A]/10">
                      <Car size={20} className="text-[#1E3A8A]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="inline-block rounded-md border-2 border-[#1E3A8A] bg-yellow-50 px-2 py-0.5 text-[12px] font-extrabold tracking-wider text-police-navy">
                        {v.plate}
                      </div>
                      <p className="mt-1 text-[12px] font-semibold text-police">
                        {v.model} • {v.color}
                      </p>
                      <p className="text-[11px] text-police-muted">Mwaka: {v.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-police-muted">Hakuna gari lililosajiliwa.</p>
            )}
          </SectionCard>

          {/* History */}
          <SectionCard
            title="Historia ya Mwingiliano"
            icon={<History size={18} className="text-police-navy" />}
          >
            {r.history.length > 0 ? (
              <div className="space-y-2.5">
                {r.history.map((h, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-police-soft bg-police-muted p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[12px] font-bold text-police">{h.type}</p>
                      <span className="rounded-full bg-[#3B82F6]/15 px-2 py-0.5 text-[10px] font-bold text-[#2563EB]">
                        {h.case}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-police-muted">
                      <Calendar size={11} />
                      {h.date}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-police-muted">
                      <MapPin size={11} />
                      {h.station}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-police-muted">Hakuna historia ya mwingiliano.</p>
            )}
          </SectionCard>

          {/* Verified footer */}
          <div className="flex items-center justify-center gap-1.5 py-2 text-[11px] text-police-faint">
            <ShieldCheck size={13} className="text-green-500" />
            Taarifa zimehakikiwa kutoka NIDA & LINESS
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
      <h3 className="mb-2.5 flex items-center gap-2 border-b border-police-soft pb-2 text-[13px] font-bold uppercase tracking-wide text-police-navy">
        {icon}
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="flex items-center gap-1.5 text-[12px] text-police-muted">
        {icon}
        {label}
      </span>
      <span className="text-right text-[12px] font-semibold text-police">{value}</span>
    </div>
  );
}
