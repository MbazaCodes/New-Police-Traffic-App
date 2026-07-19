// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft, Share2, AlertTriangle, FileText, MessageSquareWarning,
  Hand, ShieldCheck, CheckCircle2, Car, User, CreditCard, Wallet,
  Plus, ArrowRight,
} from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { findMatchingMissingAlerts } from "@/lib/shared-missing-alerts";
import { toast } from "@/hooks/use-toast";
import { Loader2, SearchX } from "lucide-react";

export function SearchResultsScreen() {
  const goBack = usePoliceStore((s) => s.goBack);
  const navigate = usePoliceStore((s) => s.navigate);
  const searchStatus = usePoliceStore((s) => s.searchStatus);
  const searchQuery = usePoliceStore((s) => s.searchQuery);
  const searchEntity = usePoliceStore((s) => s.searchEntity);
  const userRole = usePoliceStore((s) => s.userRole);
  const setCitationPrefill = usePoliceStore((s) => s.setCitationPrefill);
  const setArrestPrefill = usePoliceStore((s) => s.setArrestPrefill);
  const setWarningPrefill = usePoliceStore((s) => s.setWarningPrefill);

  // Search results come from Supabase via /api/search
  const { vehicle: foundVehicle, citizen: foundCitizen } = useMemo(
    () => ({ vehicle: null as Record<string,unknown>|null, citizen: null as Record<string,unknown>|null }),
    [searchQuery]
  );

  const v = foundVehicle;
  const c = foundCitizen;

  const matchedAlerts = useMemo(() => {
    const queries = [searchQuery, v?.plate, c?.nida, c?.name].filter(Boolean) as string[];
    const all = queries.flatMap((q) => findMatchingMissingAlerts(q, searchEntity));
    const seen = new Set<string>();
    return all.filter((a) => { if (seen.has(a.id)) return false; seen.add(a.id); return true; });
  }, [c?.name, c?.nida, searchEntity, searchQuery, v?.plate]);

  useEffect(() => {
    if (searchStatus !== "found" || matchedAlerts.length === 0) return;
    toast({ title: "⚠ ALERT: Missing Rekodi", description: `${matchedAlerts[0].title} (${matchedAlerts[0].identifier})` });
  }, [matchedAlerts, searchStatus]);

  // If search done but nothing found → not-found
  const effectiveStatus = searchStatus === "found" && !v && !c ? "not-found" : searchStatus;

  const goToCitation = () => {
    if (!v || !c) return;
    setCitationPrefill({ plate: v.plate, model: v.model, color: v.color, vehicleType: v.type, driverName: c.name, driverLicense: c.licenseNo, driverPhone: c.mobile, driverNida: c.nida });
    navigate("citation");
  };
  const goToWarning = () => {
    if (!c) return;
    setWarningPrefill({ recipientName: c.name, plate: v?.plate ?? "", licenseNo: c.licenseNo, phone: c.mobile });
    navigate("warning-form");
  };
  const goToArrest = () => {
    if (!c) return;
    setArrestPrefill({ suspectName: c.name, nida: c.nida, phone: c.mobile, plate: v?.plate ?? "", licenseNo: c.licenseNo });
    navigate("arrest-form");
  };

  const isTraffic = userRole === "officer-traffic";

  return (
    <div className="min-h-full bg-police">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-police-soft bg-police-card px-3 py-3">
        <div className="flex items-center gap-1">
          <button onClick={goBack} className="text-police"><ChevronLeft size={26} strokeWidth={2.5} /></button>
          <h1 className="text-[17px] font-bold text-police-navy">Matokeo ya Utafutaji</h1>
        </div>
        <button onClick={() => toast({ title: "Imeshirikiwa", description: "Taarifa zimeshirikiwa." })} className="text-police-muted">
          <Share2 size={20} />
        </button>
      </header>

      {/* Searching */}
      {effectiveStatus === "searching" && (
        <div className="flex flex-col items-center justify-center gap-4 px-4 py-24">
          <Loader2 size={48} className="animate-spin text-[#2196F3]" />
          <p className="text-[15px] font-bold text-police-navy">Inatafuta taarifa...</p>
          <p className="text-[12px] text-police-muted">Inatafuta: &ldquo;{searchQuery}&rdquo;</p>
        </div>
      )}

      {/* Not found — with "Add New" option */}
      {effectiveStatus === "not-found" && (
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <SearchX size={52} className="text-police-faint" />
          <p className="text-[16px] font-bold text-police-navy">Taarifa Haijapatikana</p>
          <p className="text-[13px] text-police-muted">
            Hakuna rekodi ya &ldquo;{searchQuery}&rdquo; katika mfumo.
          </p>
          <button onClick={goBack} className="rounded-xl border border-police px-6 py-2.5 text-[13px] font-semibold text-police">
            Rudi na Utafute Tena
          </button>
          {/* Traffic officer → offer to create citation */}
          {isTraffic && (
            <div className="mt-2 w-full rounded-2xl border border-[#2196F3]/30 bg-[#2196F3]/5 p-4">
              <p className="text-[13px] font-bold text-[#2196F3]">Sajili Gari Jipya</p>
              <p className="text-[11px] text-police-muted mt-1">Gari hili halijasajiliwa. Sajili kwanza ili citation na historia ziweze kuhifadhiwa vizuri.</p>
              <button
                onClick={() => navigate("add-vehicle")}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2196F3] py-2.5 text-[13px] font-bold text-white"
              >
                <Plus size={15} /> Sajili Gari Hili Mfumoni
              </button>
            </div>
          )}
          {/* General officer → offer to record incident */}
          {!isTraffic && (
            <div className="mt-2 w-full rounded-2xl border border-[#10B981]/30 bg-[#10B981]/5 p-4">
              <p className="text-[13px] font-bold text-[#10B981]">Ongeza Raia Mpya</p>
              <p className="text-[11px] text-police-muted mt-1">Mtu huyu hayupo mfumoni. Unaweza kurekodi tukio na data unayoijua.</p>
              <button
                onClick={() => navigate("incident-detail")}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#10B981] py-2.5 text-[13px] font-bold text-white"
              >
                <Plus size={15} /> Rekodi Tukio Jipya
              </button>
              <button
                onClick={() => navigate("arrest-form")}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[#10B981] py-2.5 text-[13px] font-semibold text-[#10B981]"
              >
                <ArrowRight size={15} /> Fomu ya Kukamatwa
              </button>
            </div>
          )}
        </div>
      )}

      {/* Found */}
      {(effectiveStatus === "found" || effectiveStatus === "idle") && (v || c) && (
        <div className="space-y-3 p-4">
          {/* Plate header */}
          {v && (
            <div className="flex items-center justify-between rounded-2xl bg-police-card p-4 shadow-sm">
              <div>
                <div className="inline-block rounded-lg border-2 border-[#1E3A8A] bg-yellow-50 px-3 py-1 text-[18px] font-extrabold tracking-wider text-police-navy">{v.plate}</div>
                <p className="mt-1.5 text-[11px] text-police-muted">{v.model} • {v.color} • {v.year}</p>
              </div>
              <span className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-bold ${v.outstandingFines > 0 ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#10B981]/10 text-[#10B981]"}`}>
                {v.outstandingFines > 0 ? "⚠ Ana Faini" : <><CheckCircle2 size={14} /> Safi</>}
              </span>
            </div>
          )}

          {/* Alert box */}
          {(matchedAlerts.length > 0 || (c && c.alerts.length > 0)) && (
            <div className="rounded-2xl border border-[#EF4444]/20 bg-[#EF4444]/10 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EF4444]/15">
                  <AlertTriangle size={20} className="text-[#EF4444]" />
                </div>
                <div>
                  <span className="text-[13px] font-extrabold uppercase text-[#EF4444]">Alert — Tahadhari</span>
                  {c?.alerts.map((a, i) => <p key={i} className="mt-1 text-[12px] text-police">{a}</p>)}
                  {matchedAlerts[0] && <p className="mt-1 text-[11px] text-[#EF4444]700">{matchedAlerts[0].title} • {matchedAlerts[0].identifier}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Risk score */}
          {c && (
            <div className="tpf-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-semibold text-police-muted">Kiwango cha Hatari</span>
                <span className="text-[13px] font-bold" style={{ color: c.riskScore > 70 ? "#EF4444" : c.riskScore > 40 ? "#FF9800" : "#10B981" }}>{c.riskLevel}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-police-muted">
                <div className="h-full rounded-full transition-all" style={{ width: `${c.riskScore}%`, backgroundColor: c.riskScore > 70 ? "#EF4444" : c.riskScore > 40 ? "#FF9800" : "#10B981" }} />
              </div>
              <p className="mt-1 text-[11px] text-police-muted">{c.riskScore}% hatari • Pointi: {100 - Math.round(c.riskScore)}/100</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {v && <ActionButton icon={<FileText size={18} />} label="Ongeza Citation" color="#2196F3" onClick={goToCitation} />}
            <ActionButton icon={<MessageSquareWarning size={18} />} label="Toa Onyo" color="#FF9800" onClick={goToWarning} />
            <ActionButton icon={<Hand size={18} />} label="Kamata" color="#EF4444" onClick={goToArrest} />
          </div>

          {/* Insurance */}
          {v && (
            <SectionCard title="BIMA NA HALI" icon={<ShieldCheck size={18} className="text-police-navy" />}>
              <Row label="Kampuni ya Bima" value={v.insurance.company} />
              <Row label="Namba ya Polisi" value={v.insurance.policy} />
              <Row label="Inamalizika" value={v.insurance.expires} />
              <div className="mt-2">
                <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold w-fit ${v.insurance.valid ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#EF4444]/10 text-[#EF4444]"}`}>
                  {v.insurance.valid ? <><CheckCircle2 size={12} /> VALID</> : "✗ IMEKWISHA"}
                </span>
              </div>
            </SectionCard>
          )}

          {/* Driver */}
          {c && (
            <SectionCard title="TAARIFA ZA DEREVA" icon={<User size={18} className="text-police-navy" />}>
              <Row label="Jina" value={c.name} />
              <Row label="Jinsia" value={c.gender} />
              <Row label="Tarehe ya Kuzaliwa" value={c.dob} />
              <Row label="Namba ya Leseni" value={c.licenseNo} />
              <Row label="Daraja la Leseni" value={c.licenseClass} />
              <Row label="Leseni Inamalizika" value={c.licenseExpiry} />
              <Row label="Namba ya NIDA" value={c.nida} />
              <Row label="Namba ya Simu" value={c.mobile} />
              <Row label="Makazi" value={c.address} />
            </SectionCard>
          )}

          {/* Vehicle */}
          {v && (
            <SectionCard title="TAARIFA ZA GARI" icon={<Car size={18} className="text-police-navy" />}>
              <Row label="Mfano" value={v.model} />
              <Row label="Aina" value={v.type} />
              <Row label="Mwaka" value={v.year} />
              <Row label="Rangi" value={v.color} />
              <Row label="Ukaguzi Inamalizika" value={v.inspectionExpiry} />
              <Row label="Usajili Inamalizika" value={v.registrationExpiry} />
              <Row label="Imehusika na Ajali" value={v.accidentInvolved ? "Ndiyo" : "Hapana"} valueColor={v.accidentInvolved ? "text-[#EF4444]" : undefined} />
            </SectionCard>
          )}

          {/* Fines */}
          {v && (
            <SectionCard title="FAINI NA MALIPO" icon={<Wallet size={18} className="text-police-navy" />}>
              <Row label="Faini Isiyolipwa" value={v.outstandingFines > 0 ? `TZS ${v.outstandingFines.toLocaleString()}` : "Hakuna"} valueColor={v.outstandingFines > 0 ? "text-[#EF4444]" : undefined} />
              <Row label="Jumla ya Makosa" value={String(v.violations.length)} />
              {v.violations.length > 0 && (
                <div className="mt-2 space-y-2">
                  {v.violations.map((vi) => (
                    <div key={vi.id} className="rounded-xl border border-police-soft bg-police-muted p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[13px] font-bold text-police">{vi.name}</p>
                          <p className="mt-0.5 text-[11px] text-police-muted">{vi.date} • {vi.area}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[13px] font-bold text-police">{vi.fine}</p>
                          <span className={`mt-1 inline-block rounded px-2 py-0.5 text-[10px] font-bold ${vi.paid ? "bg-[#10B981]/15 text-[#10B981]" : "bg-[#EF4444]/15 text-[#EF4444]"}`}>
                            {vi.paid ? "IMELIPWA" : "HAJALIPWA"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          )}

          {/* Criminal record */}
          {c && c.criminalRecord.hasRecord && (
            <SectionCard title="REKODI YA UHALIFU" icon={<CreditCard size={18} className="text-police-navy" />}>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="rounded-xl bg-police-muted p-2.5 text-center">
                  <p className="text-[18px] font-bold text-[#EF4444]">{c.criminalRecord.cases}</p>
                  <p className="text-[9px] text-police-faint">Kesi Zilizowekwa</p>
                </div>
                <div className="rounded-xl bg-police-muted p-2.5 text-center">
                  <p className="text-[18px] font-bold text-[#EF4444]">{c.criminalRecord.convictions}</p>
                  <p className="text-[9px] text-police-faint">Hukumu</p>
                </div>
              </div>
              {c.history.map((h, i) => (
                <div key={i} className="rounded-lg border border-[#EF4444]/20 bg-[#EF4444]/5 px-3 py-2 mb-1.5">
                  <div className="flex justify-between"><p className="text-[12px] font-bold text-police">{h.type}</p><span className="text-[10px] font-bold text-[#EF4444]">{h.case}</span></div>
                  <p className="text-[10px] text-police-faint">{h.date} • {h.station}</p>
                </div>
              ))}
            </SectionCard>
          )}
        </div>
      )}
    </div>
  );
}

function ActionButton({ icon, label, color, onClick }: { icon: React.ReactNode; label: string; color: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 rounded-xl bg-police-card py-3 shadow-sm active:scale-[0.97]" style={{ borderTop: `3px solid ${color}` }}>
      <span style={{ color }}>{icon}</span>
      <span className="px-1 text-center text-[10px] font-semibold text-police">{label}</span>
    </button>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="tpf-card p-4">
      <h3 className="mb-2.5 flex items-center gap-2 border-b border-police-soft pb-2 text-[12px] font-bold uppercase tracking-wide text-police-navy">{icon}{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[12px] text-police-muted">{label}</span>
      <span className={`text-right text-[12px] font-semibold ${valueColor ?? "text-police"}`}>{value}</span>
    </div>
  );
}
