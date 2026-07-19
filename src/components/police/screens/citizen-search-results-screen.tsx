"use client";

import { useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
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
import { findMatchingMissingAlerts } from "@/lib/shared-missing-alerts";
import { toast } from "@/hooks/use-toast";

export function CitizenSearchResultsScreen() {
  const goBack = usePoliceStore((s) => s.goBack);
  const navigate = usePoliceStore((s) => s.navigate);
  const setIncidentPrefill = usePoliceStore((s) => s.setIncidentPrefill);
  const setWarningPrefill = usePoliceStore((s) => s.setWarningPrefill);
  const setArrestPrefill = usePoliceStore((s) => s.setArrestPrefill);
  const searchStatus = usePoliceStore((s) => s.searchStatus);
  const searchQuery = usePoliceStore((s) => s.searchQuery);
  const searchEntity = usePoliceStore((s) => s.searchEntity);
  const runSearch = usePoliceStore((s) => s.runSearch);
  const setSearchEntity = usePoliceStore((s) => s.setSearchEntity);
  const foundCitizen = useMemo(() => lookupCitizen(searchQuery), [searchQuery]);
  const r = foundCitizen ?? {
    name: searchQuery || "Raia Asiyejulikana", nida: "—", mobile: "—", gender: "Mme" as const, dob: "—", age: 0,
    address: "—", occupation: "—", status: "Haijulikani", statusColor: "#888",
    alerts: [] as string[], criminalRecord: { hasRecord: false, cases: 0, convictions: 0 },
    licenseNo: "—", licenseExpiry: "—", licenseClass: "—", passportNo: "—", passportExpiry: "—",
    vehicles: [], devices: [], history: [], riskScore: 0, riskLevel: "—",
    documents: [] as {type:string;number:string;status:string}[],
  };
  const documents = r.documents ?? [];


  const handleRecordInfo = () => {
    setIncidentPrefill({
      citizenName: r.name,
      citizenNida: r.nida,
      citizenPhone: r.mobile,
      citizenAddress: r.address,
    });
    navigate("incident-detail");
  };

  const handleGiveWarning = () => {
    setWarningPrefill({
      recipientName: r.name,
      plate: r.vehicles[0]?.plate ?? "",
      licenseNo: documents.find((d) => d.type.includes("Leseni"))?.number ?? "",
      phone: r.mobile,
    });
    navigate("warning-form");
  };

  const handleArrest = () => {
    setArrestPrefill({
      suspectName: r.name,
      nida: r.nida,
      phone: r.mobile,
      plate: r.vehicles[0]?.plate ?? "",
      licenseNo: documents.find((d) => d.type.includes("Leseni"))?.number ?? "",
    });
    navigate("arrest-form");
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
    r.statusColor === "#10B981"
      ? "bg-[#10B981]/10 text-[#10B981]"
      : r.statusColor === "#FF9800"
        ? "bg-[#FF9800]/50 text-[#FF9800]"
        : "bg-[#EF4444]/10 text-[#EF4444]";

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
      {(searchStatus === "not-found" || (searchStatus === "found" && !foundCitizen)) && (
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <SearchX size={52} className="text-police-faint" />
          <p className="text-[16px] font-bold text-police-navy">Raia Hajapatikana</p>
          <p className="text-[13px] text-police-muted">
            Hakuna rekodi ya &ldquo;{searchQuery}&rdquo; kwenye mfumo.
          </p>
          <button onClick={() => goBack()} className="rounded-xl border border-police px-6 py-2.5 text-[13px] font-semibold text-police">
            Rudi na Utafute Tena
          </button>
          <div className="mt-2 w-full rounded-2xl border border-[#10B981]/30 bg-[#10B981]/5 p-4 text-left">
            <p className="text-[13px] font-bold text-[#10B981]">Mtu Hajasajiliwa Mfumoni</p>
            <p className="text-[11px] text-police-muted mt-1">Sajili raia mpya mfumoni. Baadaye unaweza kurekodi tukio au makosa yake.</p>
            <button onClick={() => navigate("add-citizen")} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#10B981] py-2.5 text-[13px] font-bold text-white">
              Rekodi Tukio Jipya
            </button>
            <button onClick={() => { setWarningPrefill({ recipientName: searchQuery, plate: "", licenseNo: "", phone: "" }); navigate("warning-form"); }} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[#FF9800] py-2.5 text-[13px] font-semibold text-[#FF9800]">
              Toa Onyo
            </button>
            <button onClick={() => { setArrestPrefill({ suspectName: searchQuery, nida: "", phone: "", plate: "", licenseNo: "" }); navigate("arrest-form"); }} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[#EF4444] py-2.5 text-[13px] font-semibold text-[#EF4444]">
              Fomu ya Kukamatwa
            </button>
          </div>
        </div>
      )}

      {/* Found / idle: show full citizen profile */}
      {(searchStatus === "found" || searchStatus === "idle") && foundCitizen && (
        <div className="space-y-3 p-4">
          {/* Citizen Header Card */}
          <div className="tpf-card p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2196F3] text-[22px] font-extrabold text-white ring-2 ring-[#2196F3]/20">
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
            <div className="rounded-2xl border border-[#EF4444]/20 bg-[#EF4444]/10 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EF4444]/15">
                  <AlertTriangle size={20} className="text-[#EF4444]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-extrabold uppercase text-[#EF4444]">Alert</span>
                    <span className="rounded bg-[#EF4444]/600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      Tahadhari
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] leading-snug text-police">
                    {matchedAlerts[0]?.details ?? r.alerts[0]}
                  </p>
                  {matchedAlerts[0] && (
                    <p className="mt-1 text-[11px] text-[#EF4444]700">
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
              color="#2196F3"
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
              color="#EF4444"
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
                <span className="flex items-center gap-1 rounded-full bg-[#EF4444]/10 px-2.5 py-1 text-[11px] font-bold text-[#EF4444]">
                  <XCircle size={12} /> Ana Rekodi
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-[#10B981]/10 px-2.5 py-1 text-[11px] font-bold text-[#10B981]">
                  <CheckCircle2 size={12} /> Hakana Rekodi
                </span>
              )}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-police-muted p-2.5 text-center">
                <p className="text-[18px] font-bold text-[var(--tpf-text)]">{r.criminalRecord.cases}</p>
                <p className="text-[9px] text-police-faint">Kesi Zilizowekwa</p>
              </div>
              <div className="rounded-xl bg-police-muted p-2.5 text-center">
                <p className="text-[18px] font-bold text-[var(--tpf-text)]">{r.criminalRecord.convictions}</p>
                <p className="text-[9px] text-police-faint">Uhukumu</p>
              </div>
            </div>
            {r.criminalRecord.hasRecord && r.history.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <p className="text-[10px] font-medium uppercase tracking-wide text-police-faint">Historia ya Kesi</p>
                {r.history.map((h, i) => (
                  <div key={i} className="rounded-lg border border-[#EF4444]/20 bg-[#EF4444]/5 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] font-bold text-police">{h.type}</p>
                      <span className="text-[10px] font-bold text-[#EF4444]">{h.case}</span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-police-faint">{h.date} • {h.station}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Documents */}
          <SectionCard
            title="Hati za Kitaifa"
            icon={<FileText size={18} className="text-police-navy" />}
          >
            <div className="space-y-2">
              {documents.map((doc, i) => (
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
                        ? "bg-[#10B981]/10 text-[#10B981]"
                        : doc.status === "Imeisha"
                          ? "bg-[#FF9800]/50 text-[#FF9800]"
                          : "bg-[#EF4444]/10 text-[#EF4444]"
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
                  <button
                    key={i}
                    onClick={() => { setSearchEntity("car"); runSearch(v.plate); navigate("search-results"); }}
                    className="flex w-full items-center gap-3 rounded-xl border border-police-soft bg-police-muted p-2.5 text-left active:scale-[0.99]"
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
                    <ChevronRight size={14} className="text-police-faint" />
                  </button>
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
                      <span className="rounded-full bg-[#2196F3]/15 px-2 py-0.5 text-[10px] font-bold text-[#2196F3]">
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
            <ShieldCheck size={13} className="text-[#10B981]" />
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
    <div className="tpf-card p-4">
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
