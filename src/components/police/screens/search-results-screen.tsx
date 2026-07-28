// src/components/police/screens/search-results-screen.tsx
// @ts-nocheck
"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ChevronLeft, Share2, AlertTriangle, FileText, MessageSquareWarning,
  Hand, ShieldCheck, CheckCircle2, XCircle, Car, User, CreditCard,
  Phone, MapPin, Briefcase, Calendar, Loader2, SearchX, Shield,
  Smartphone, Home, Star, AlertCircle, Plus, ChevronRight,
  BookOpen, Globe, BadgeCheck, IdCard, Heart, TrendingDown, Award, Ban,
} from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { findMatchingMissingAlerts } from "@/lib/shared-missing-alerts";
import { toast } from "@/hooks/use-toast";

export function SearchResultsScreen() {
  const goBack              = usePoliceStore(s => s.goBack);
  const navigate            = usePoliceStore(s => s.navigate);
  const searchStatus        = usePoliceStore(s => s.searchStatus);
  const searchQuery         = usePoliceStore(s => s.searchQuery);
  const searchEntity        = usePoliceStore(s => s.searchEntity);
  const userRole            = usePoliceStore(s => s.userRole);
  const setCitationPrefill  = usePoliceStore(s => s.setCitationPrefill);
  const setArrestPrefill    = usePoliceStore(s => s.setArrestPrefill);
  const setWarningPrefill   = usePoliceStore(s => s.setWarningPrefill);
  const setIncidentPrefill  = usePoliceStore(s => s.setIncidentPrefill);

  const [citizen, setCitizen]   = useState<any>(null);
  const [vehicle, setVehicle]   = useState<any>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // Fetch search result from API on mount / query change
  useEffect(() => {
    if (!searchQuery || searchStatus === "idle") return;

    const typeMap: Record<string, string> = {
      car: "plate", device: "mobile", person: "name",
    };
    const type = typeMap[searchEntity] ?? "name";

    setLoading(true);
    setError(null);
    setCitizen(null);
    setVehicle(null);

    fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=${type}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then(r => r.json())
      .then(d => {
        if (d.found && d.data) {
          if (d.type === "citizen") {
            setCitizen(d.data);
            if (d.data.vehicles?.length > 0) setVehicle(d.data.vehicles[0]);
          } else if (d.type === "vehicle") {
            setVehicle(d.data);
            if (d.citizen) setCitizen(d.citizen);
          }
        } else {
          setError(d.error ?? null);
        }
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [searchQuery, searchEntity]);

  const matchedAlerts = useMemo(() => {
    const queries = [searchQuery, vehicle?.plate, citizen?.nida, citizen?.name].filter(Boolean) as string[];
    const all = queries.flatMap(q => findMatchingMissingAlerts(q, searchEntity));
    const seen = new Set<string>();
    return all.filter(a => { if (seen.has(a.id)) return false; seen.add(a.id); return true; });
  }, [citizen, vehicle, searchQuery, searchEntity]);

  useEffect(() => {
    if (matchedAlerts.length > 0) {
      toast({ title: "⚠ ALERT: Rekodi ya Kutafutwa", description: `${matchedAlerts[0].title} (${matchedAlerts[0].identifier})` });
    }
  }, [matchedAlerts]);

  const c = citizen;
  const v = vehicle;

  const goToCitation = () => {
    setCitationPrefill({ plate: v?.plate, model: v?.model, color: v?.color, vehicleType: v?.type, driverName: c?.name, driverLicense: c?.license_no, driverPhone: c?.mobile, driverNida: c?.nida });
    navigate("citation");
  };
  const goToWarning = () => {
    setWarningPrefill({ recipientName: c?.name, plate: v?.plate ?? "", licenseNo: c?.license_no, phone: c?.mobile });
    navigate("warning-form");
  };
  const goToArrest = () => {
    setArrestPrefill({ suspectName: c?.name, nida: c?.nida, phone: c?.mobile, plate: v?.plate ?? "", licenseNo: c?.license_no });
    navigate("arrest-form");
  };
  const goToIncident = () => {
    setIncidentPrefill({ citizenName: c?.name, citizenNida: c?.nida, citizenPhone: c?.mobile, citizenAddress: c?.address });
    navigate("incident-detail");
  };

  const isTraffic = userRole === "officer-traffic";
  const riskScore = c?.risk_score ?? 0;
  const riskColor = riskScore >= 70 ? "#EF4444" : riskScore >= 40 ? "#F59E0B" : "#10B981";
  const riskLabel = riskScore >= 70 ? "Hatari Kubwa" : riskScore >= 40 ? "Wastani" : "Salama";

  // ── Points from proper DB tables ──────────────────────────────────────
  const citizenPointsData = c?.citizen_points ?? { current: c?.good_conduct_points ?? 100, start: 100, deducted: 0, incidents: 0, status: "good", percentage: 100 };
  const driverPointsData  = c?.driver_points_detail ?? { current: c?.driver_points ?? 100, start: 100, deducted: 0, violations: 0, status: "good", percentage: 100 };
  const hasDriverRecord   = c?.is_driver || c?.driver_points_detail !== null || !!c?.license_no;

  const cpCurrent   = citizenPointsData.current ?? 100;
  const cpStart     = citizenPointsData.start ?? 100;
  const cpPercentage = citizenPointsData.percentage ?? Math.round(cpCurrent * 100 / cpStart);
  const cpStatus    = citizenPointsData.status ?? "good";

  const dpCurrent   = driverPointsData?.current ?? c?.driver_points ?? 100;
  const dpStart     = driverPointsData?.start ?? 100;
  const dpPercentage = driverPointsData?.percentage ?? Math.round(dpCurrent * 100 / dpStart);
  const dpStatus    = driverPointsData?.status ?? "good";

  // Status helpers
  const ptsColor = (pts: number) => pts >= 80 ? "#10B981" : pts >= 60 ? "#F59E0B" : pts >= 40 ? "#EF4444" : "#7F1D1D";
  const ptsLabel = (pts: number) => pts >= 80 ? "Njema" : pts >= 60 ? "Tahadhari" : pts >= 40 ? "Hatari" : "Imesimwa";
  const ptsBg    = (pts: number) => pts >= 80 ? "#F0FDF4" : pts >= 60 ? "#FFFBEB" : pts >= 40 ? "#FEF2F2" : "#450A0A";

  const deductions = c?.points_deductions ?? [];

  // ── LOADING ────────────────────────────────────────────────────────────────
  if (loading || searchStatus === "searching") return (
    <div className="min-h-full flex flex-col items-center justify-center gap-3 p-8" style={{ background: "var(--tpf-surface)" }}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--tpf-blue) 10%, transparent)" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--tpf-blue)" }} />
      </div>
      <p className="text-[14px] font-bold" style={{ color: "var(--tpf-text)" }}>Inatafuta...</p>
      <p className="text-[12px]" style={{ color: "var(--tpf-text-4)" }}>"{searchQuery}"</p>
    </div>
  );

  // ── NOT FOUND ──────────────────────────────────────────────────────────────
  if (!loading && !c && !v) return (
    <div className="min-h-full flex flex-col" style={{ background: "var(--tpf-surface)" }}>
      <header className="tpf-header">
        <button onClick={goBack} className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--tpf-card)", border: "1px solid var(--tpf-border)" }}>
          <ChevronLeft size={18} style={{ color: "var(--tpf-text-3)" }} />
        </button>
        <span className="text-[14px] font-bold" style={{ color: "var(--tpf-text)" }}>Matokeo ya Utafutaji</span>
        <div />
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--tpf-border) 30%, transparent)" }}>
          <SearchX size={28} style={{ color: "var(--tpf-text-4)" }} />
        </div>
        <p className="text-[16px] font-bold" style={{ color: "var(--tpf-text)" }}>Haipatikani</p>
        <p className="text-[12px]" style={{ color: "var(--tpf-text-4)" }}>
          "{searchQuery}" — {error ?? "Rekodi haipatikani kwenye mfumo"}
        </p>
        <button onClick={goBack} className="mt-4 rounded-xl px-6 py-3 text-[13px] font-bold text-white" style={{ background: "var(--tpf-blue)" }}>
          Tafuta Tena
        </button>
      </div>
    </div>
  );

  // ── FOUND RESULT ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-full flex flex-col" style={{ background: "var(--tpf-surface)" }}>

      {/* Header */}
      <header className="tpf-header">
        <button onClick={goBack} className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--tpf-card)", border: "1px solid var(--tpf-border)" }}>
          <ChevronLeft size={18} style={{ color: "var(--tpf-text-3)" }} />
        </button>
        <span className="text-[14px] font-bold" style={{ color: "var(--tpf-text)" }}>Matokeo ya Utafutaji</span>
        <button onClick={() => { try { navigator.share({ text: `${c?.name ?? v?.plate} — TPF Search` }) } catch {} }}
          className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ border: "1px solid var(--tpf-border)" }}>
          <Share2 size={15} style={{ color: "var(--tpf-text-3)" }} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto pb-8 space-y-3 p-4">

        {/* ── POINTS ALERT (low points) ──────────────────────────────────── */}
        {c && (cpCurrent < 80 || (hasDriverRecord && dpCurrent < 80)) && (
          <div className="rounded-xl p-3 flex items-center gap-3"
            style={{ background: cpCurrent < 40 || (hasDriverRecord && dpCurrent < 40) ? "#FEF2F2" : "#FFFBEB",
                     border: cpCurrent < 40 || (hasDriverRecord && dpCurrent < 40) ? "1px solid #FECACA" : "1px solid #FDE68A" }}>
            <AlertTriangle size={20} style={{ color: cpCurrent < 40 || (hasDriverRecord && dpCurrent < 40) ? "#DC2626" : "#D97706", flexShrink: 0 }} />
            <div>
              <p className="text-[12px] font-bold" style={{ color: cpCurrent < 40 || (hasDriverRecord && dpCurrent < 40) ? "#DC2626" : "#D97706" }}>
                Pointi {cpCurrent < 40 ? "Zimesimwa!" : "Za Tahadhari!"} — Tabia: {cpCurrent}/{cpStart} ({ptsLabel(cpCurrent)})
              </p>
              {hasDriverRecord && dpCurrent < 80 && (
                <p className="text-[11px]" style={{ color: "#D97706" }}>
                  Leseni: {dpCurrent}/{dpStart} ({ptsLabel(dpCurrent)})
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Criminal record alert ──────────────────────────────────────── */}
        {(matchedAlerts.length > 0 || c?.has_criminal_record) && (
          <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
            <AlertTriangle size={20} style={{ color: "#DC2626", flexShrink: 0 }} />
            <div>
              {c?.has_criminal_record && <p className="text-[12px] font-bold" style={{ color: "#DC2626" }}>⚠ Ana rekodi ya jinai — kesi {c.cases_count ?? 0}, hukumu {c.convictions_count ?? 0}</p>}
              {matchedAlerts.map(a => (
                <p key={a.id} className="text-[11px]" style={{ color: "#DC2626" }}>🔴 {a.title} ({a.identifier})</p>
              ))}
            </div>
          </div>
        )}

        {/* ── Citizen Hero Card ─────────────────────────────────────────── */}
        {c && (
          <div className="rounded-2xl p-4" style={{ background: "var(--tpf-card)", border: "1px solid var(--tpf-border)" }}>
            <div className="flex items-start gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                style={{ background: c.photo_url ? "transparent" : "linear-gradient(135deg, #0F2557, #2563EB)" }}>
                {c.photo_url
                  ? <img src={c.photo_url} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  : <User size={24} className="text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-black truncate" style={{ color: "var(--tpf-text)" }}>{c.name || "—"}</p>
                <p className="text-[11px]" style={{ color: "var(--tpf-text-4)" }}>
                  {c.gender || "—"} · {c.age ? `Miaka ${c.age}` : (c.dob ?? "—")} · {c.nationality || "Mtanzania"}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: riskScore >= 70 ? "#FEF2F2" : riskScore >= 40 ? "#FFFBEB" : "#F0FDF4", color: riskColor }}>
                    {riskLabel} ({riskScore}/100)
                  </span>
                  {c.is_verified && (
                    <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "#F0FDF4", color: "#16A34A" }}>
                      <CheckCircle2 size={10} /> Portal
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Key info rows */}
            <div className="mt-3 space-y-1.5">
              {[
                { icon: CreditCard, label: "NIDA", value: c.nida },
                { icon: Phone, label: "Simu", value: c.mobile ?? c.phone },
                { icon: Shield, label: "Leseni", value: c.license_no },
                { icon: MapPin, label: "Anwani", value: c.address },
                { icon: Briefcase, label: "Kazi", value: c.occupation },
                { icon: Calendar, label: "Kabila", value: c.tribe },
              ].filter(r => r.value && r.value !== "—").map(row => (
                <div key={row.label} className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "var(--tpf-surface-2)" }}>
                  <row.icon size={13} style={{ color: "var(--tpf-text-4)", flexShrink: 0 }} />
                  <span className="text-[11px] w-14 shrink-0" style={{ color: "var(--tpf-text-4)" }}>{row.label}</span>
                  <span className="text-[12px] font-semibold truncate" style={{ color: "var(--tpf-text)" }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* ── POINTS — prominent visual display ──────────────────────── */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {/* Citizen Conduct Points */}
              <div className="rounded-xl p-3" style={{ background: ptsBg(cpCurrent) }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <Award size={11} style={{ color: ptsColor(cpCurrent) }} />
                    <span className="text-[10px] font-bold" style={{ color: ptsColor(cpCurrent) }}>Tabia Njema</span>
                  </div>
                  <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                    style={{ background: `color-mix(in srgb, ${ptsColor(cpCurrent)} 15%, transparent)`, color: ptsColor(cpCurrent) }}>
                    {ptsLabel(cpCurrent)}
                  </span>
                </div>
                <p className="text-[18px] font-black" style={{ color: ptsColor(cpCurrent) }}>
                  {cpCurrent}<span className="text-[11px] opacity-50">/{cpStart}</span>
                </p>
                <div className="mt-1.5 h-2 rounded-full" style={{ background: "var(--tpf-surface-2)" }}>
                  <div className="h-2 rounded-full transition-all"
                    style={{ width: `${cpPercentage}%`, background: ptsColor(cpCurrent) }} />
                </div>
                {citizenPointsData.deducted > 0 && (
                  <p className="mt-1 text-[9px]" style={{ color: "var(--tpf-text-4)" }}>
                    -{Number(citizenPointsData.deducted).toFixed(1)} pointi · {citizenPointsData.incidents ?? 0} matukio
                  </p>
                )}
              </div>

              {/* Driver Points */}
              {hasDriverRecord && (
                <div className="rounded-xl p-3" style={{ background: ptsBg(dpCurrent) }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <Car size={11} style={{ color: ptsColor(dpCurrent) }} />
                      <span className="text-[10px] font-bold" style={{ color: ptsColor(dpCurrent) }}>Pointi Leseni</span>
                    </div>
                    <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                      style={{ background: `color-mix(in srgb, ${ptsColor(dpCurrent)} 15%, transparent)`, color: ptsColor(dpCurrent) }}>
                      {ptsLabel(dpCurrent)}
                    </span>
                  </div>
                  <p className="text-[18px] font-black" style={{ color: ptsColor(dpCurrent) }}>
                    {dpCurrent}<span className="text-[11px] opacity-50">/{dpStart}</span>
                  </p>
                  <div className="mt-1.5 h-2 rounded-full" style={{ background: "var(--tpf-surface-2)" }}>
                    <div className="h-2 rounded-full transition-all"
                      style={{ width: `${dpPercentage}%`, background: ptsColor(dpCurrent) }} />
                  </div>
                  {driverPointsData?.deducted > 0 && (
                    <p className="mt-1 text-[9px]" style={{ color: "var(--tpf-text-4)" }}>
                      -{Number(driverPointsData.deducted).toFixed(1)} pointi · {driverPointsData.violations ?? 0} makosa
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Points Deductions History ────────────────────────────────── */}
        {c && deductions.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: "var(--tpf-card)", border: "1px solid var(--tpf-border)" }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={16} style={{ color: "var(--tpf-red)" }} />
              <p className="text-[14px] font-bold" style={{ color: "var(--tpf-text)" }}>Pointi Zilizopunguzwa</p>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ background: "var(--tpf-surface-2)", color: "var(--tpf-text-4)" }}>
                {deductions.length}
              </span>
            </div>
            <div className="space-y-1.5">
              {deductions.slice(0, 5).map((dd: any) => (
                <div key={dd.id} className="flex items-center justify-between rounded-lg px-3 py-2"
                  style={{ background: "var(--tpf-surface-2)" }}>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold truncate" style={{ color: "var(--tpf-text)" }}>{dd.offense}</p>
                    <p className="text-[10px]" style={{ color: "var(--tpf-text-4)" }}>
                      {dd.deduction_type === "driver" ? "Leseni" : "Tabia"} · {dd.source_type === "citation" ? "Citation" : "Onyo"}
                      {dd.officer_name ? ` · ${dd.officer_name}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[12px] font-bold" style={{ color: "#EF4444" }}>-{dd.points_deducted}</p>
                    <p className="text-[9px]" style={{ color: "var(--tpf-text-4)" }}>{dd.points_before} → {dd.points_after}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Government IDs Section ───────────────────────────────────── */}
        {c && c.government_ids && c.government_ids.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: "var(--tpf-card)", border: "1px solid var(--tpf-border)" }}>
            <div className="flex items-center gap-2 mb-3">
              <IdCard size={16} style={{ color: "var(--tpf-blue)" }} />
              <p className="text-[14px] font-bold" style={{ color: "var(--tpf-text)" }}>Hati za Serikali</p>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ background: "var(--tpf-surface-2)", color: "var(--tpf-text-4)" }}>
                {c.government_ids.length}
              </span>
            </div>
            <div className="space-y-2">
              {c.government_ids.map((gid: any) => {
                const isExpired = gid.expiry_date && new Date(gid.expiry_date) < new Date();
                const statusColor = gid.status === "active" && !isExpired ? "#10B981" : gid.status === "expired" || isExpired ? "#FF9800" : "#EF4444";
                const statusLabel = gid.status === "active" && !isExpired ? "Sahihi" : isExpired ? "Imeisha" : gid.status === "suspended" ? "Imesitishwa" : gid.status;
                return (
                  <div key={gid.id} className="flex items-center justify-between rounded-lg px-3 py-2"
                    style={{ background: "var(--tpf-surface-2)" }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                        style={{ background: `color-mix(in srgb, ${statusColor} 15%, transparent)` }}>
                        {gid.id_type_code === "passport" ? <Globe size={14} style={{ color: statusColor }} /> :
                         gid.id_type_code === "nssf" ? <BookOpen size={14} style={{ color: statusColor }} /> :
                         gid.id_type_code === "nhif" ? <Heart size={14} style={{ color: statusColor }} /> :
                         gid.id_type_code === "driving_license" ? <Car size={14} style={{ color: statusColor }} /> :
                         gid.id_type_code === "tin" ? <CreditCard size={14} style={{ color: statusColor }} /> :
                         <IdCard size={14} style={{ color: statusColor }} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold truncate" style={{ color: "var(--tpf-text)" }}>
                          {gid.type_name_sw || gid.type_name_en || gid.id_type_code}
                        </p>
                        <p className="text-[12px] font-semibold truncate" style={{ color: "var(--tpf-text)", fontFamily: "monospace" }}>
                          {gid.id_number}
                        </p>
                        {gid.expiry_date && (
                          <p className="text-[9px]" style={{ color: isExpired ? "#FF9800" : "var(--tpf-text-4)" }}>
                            Mwisho: {new Date(gid.expiry_date).toLocaleDateString("sw-TZ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {gid.verified && <BadgeCheck size={12} style={{ color: "#10B981" }} />}
                      <span className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                        style={{ background: `color-mix(in srgb, ${statusColor} 15%, transparent)`, color: statusColor }}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Vehicle Card ────────────────────────────────────────────── */}
        {v && (
          <div className="rounded-2xl p-4" style={{ background: "var(--tpf-card)", border: "1px solid var(--tpf-border)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Car size={16} style={{ color: "var(--tpf-blue)" }} />
              <p className="text-[14px] font-bold" style={{ color: "var(--tpf-text)" }}>Gari</p>
            </div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[22px] font-black" style={{ color: "var(--tpf-blue)", fontFamily: "monospace" }}>{v.plate}</p>
              <span className="rounded-full px-3 py-1 text-[11px] font-bold"
                style={{ background: v.insurance_valid ? "#F0FDF4" : "#FEF2F2", color: v.insurance_valid ? "#16A34A" : "#DC2626" }}>
                Bima {v.insurance_valid ? "✓" : "✗"}
              </span>
            </div>
            <div className="space-y-1.5">
              {[
                { label: "Chapa/Mfano", value: [v.make, v.model].filter(Boolean).join(" ") || v.model },
                { label: "Rangi/Mwaka", value: [v.color, v.year].filter(Boolean).join(" · ") },
                { label: "Aina", value: v.type },
                { label: "Chassis", value: v.chassis_no ?? v.chassis_number },
                { label: "Faini Zilizopo", value: v.outstanding_fines > 0 ? `TZS ${v.outstanding_fines.toLocaleString()}` : null },
                { label: "Ajali", value: v.accident_count > 0 ? `${v.accident_count} ajali` : null },
              ].filter(r => r.value).map(row => (
                <div key={row.label} className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "var(--tpf-surface-2)" }}>
                  <span className="text-[11px] w-20 shrink-0" style={{ color: "var(--tpf-text-4)" }}>{row.label}</span>
                  <span className="text-[12px] font-semibold" style={{ color: "var(--tpf-text)" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Citizen's other vehicles ────────────────────────────────── */}
        {c?.vehicles?.length > 1 && (
          <div className="rounded-2xl p-4" style={{ background: "var(--tpf-card)", border: "1px solid var(--tpf-border)" }}>
            <p className="text-[13px] font-bold mb-2" style={{ color: "var(--tpf-text-2)" }}>Magari Mengine ({c.vehicles.length})</p>
            {c.vehicles.slice(0, 5).map((veh: any) => (
              <div key={veh.id} className="flex items-center gap-3 py-2" style={{ borderBottom: "1px solid var(--tpf-border)" }}>
                <Car size={14} style={{ color: "var(--tpf-blue)" }} />
                <span className="text-[12px] font-bold" style={{ color: "var(--tpf-text)", fontFamily: "monospace" }}>{veh.plate}</span>
                <span className="text-[11px]" style={{ color: "var(--tpf-text-4)" }}>{[veh.make, veh.model, veh.color].filter(Boolean).join(" · ")}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Fines ───────────────────────────────────────────────────── */}
        {c?.fines?.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: "var(--tpf-card)", border: "1px solid var(--tpf-border)" }}>
            <p className="text-[13px] font-bold mb-2" style={{ color: "var(--tpf-text-2)" }}>Faini ({c.fines.length})</p>
            {c.fines.slice(0, 3).map((f: any) => (
              <div key={f.id} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--tpf-border)" }}>
                <div>
                  <p className="text-[12px] font-semibold" style={{ color: "var(--tpf-text)" }}>{f.offense ?? "Kosa"}</p>
                  <p className="text-[10px]" style={{ color: "var(--tpf-text-4)" }}>
                    {f.citation_number} · {f.fine_type === "traffic" ? "Trafiki" : f.fine_type ?? "—"}
                  </p>
                </div>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ background: f.status === "paid" ? "#F0FDF4" : "#FEF2F2", color: f.status === "paid" ? "#16A34A" : "#DC2626" }}>
                  {f.status === "paid" ? "Imelipwa" : "TZS " + (f.amount ?? 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Action Buttons ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2">
          {isTraffic && v && c && (
            <button onClick={goToCitation}
              className="flex items-center gap-2 rounded-xl px-3 py-3 text-[12px] font-bold text-white"
              style={{ background: "var(--tpf-red)", gridColumn: "1/-1" }}>
              <FileText size={16} /> Toa Citation / Faini
            </button>
          )}
          {/* Citizen fine button (for post/general officers) */}
          {!isTraffic && c && (
            <button onClick={goToCitation}
              className="flex items-center gap-2 rounded-xl px-3 py-3 text-[12px] font-bold text-white"
              style={{ background: "var(--tpf-red)", gridColumn: "1/-1" }}>
              <FileText size={16} /> Toa Faini ya Raia
            </button>
          )}
          <button onClick={goToWarning}
            className="flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-[12px] font-bold"
            style={{ background: "var(--tpf-card)", border: "1px solid var(--tpf-border)", color: "var(--tpf-amber)" }}>
            <MessageSquareWarning size={15} /> Onyo
          </button>
          <button onClick={goToIncident}
            className="flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-[12px] font-bold"
            style={{ background: "var(--tpf-card)", border: "1px solid var(--tpf-border)", color: "var(--tpf-blue)" }}>
            <FileText size={15} /> Tukio
          </button>
          <button onClick={goToArrest}
            className="flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-[12px] font-bold col-span-2"
            style={{ background: "color-mix(in srgb, var(--tpf-red) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--tpf-red) 30%, transparent)", color: "var(--tpf-red)" }}>
            <Hand size={15} /> Kamatia
          </button>
        </div>
      </div>
    </div>
  );
}
