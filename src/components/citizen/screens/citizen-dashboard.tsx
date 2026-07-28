// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { Shield, FileText, CreditCard, AlertTriangle, Star, Car, Home, Loader2, ChevronRight, TrendingDown, History, Award, Ban, CheckCircle2, Clock } from "lucide-react";


// ── Profile completion ──────────────────────────────────────────
function calcCompletion(d: any) {
  const fields = ["nida","dob","gender","tribe","blood_group","occupation",
    "address","region","district","mobile","kin_name","kin_phone","photo_url","religion","marital_status"];
  const filled = fields.filter(f => d?.[f.key !== undefined ? f.key : f]).length;
  // Use object keys check
  const filledCount = fields.filter(k => d?.[k]).length;
  const pct = Math.round((filledCount / fields.length) * 100);
  return { pct, filledCount, total: fields.length };
}

function ProfileProgressBar({ d, onClick }: { d: any; onClick?: () => void }) {
  const { pct, filledCount, total } = calcCompletion(d);
  const color = pct >= 80 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444";
  return (
    <button onClick={onClick} className="flex w-full flex-col gap-2 rounded-2xl p-4 text-left transition active:scale-[0.98]"
      style={{ background: `color-mix(in srgb, ${color} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 25%, transparent)` }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] font-black" style={{color:"var(--tpf-text,#0f2347)"}}>Ukamilishaji wa Profaili</p>
          <p className="text-[11px]" style={{color:"var(--tpf-text-3,#64748b)"}}>{filledCount}/{total} taarifa zimejazwa</p>
        </div>
        <span className="text-[26px] font-black" style={{color}}>{pct}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/10">
        <div className="h-full rounded-full transition-all duration-700" style={{width:`${pct}%`, background:color}} />
      </div>
      {pct < 100 && (
        <p className="text-[11px] font-semibold" style={{color}}>
          {pct < 50 ? "⚠️ Profaili yako ina upungufu mkubwa" : pct < 80 ? "📝 Karibu kukamilika" : "✨ Ongeza taarifa zilizobaki"}  → Bonyeza kukamilisha
        </p>
      )}
      {pct === 100 && <p className="text-[11px] font-bold text-green-600">✅ Profaili imekamilika!</p>}
    </button>
  );
}

export function CitizenDashboard({ citizen, setScreen }: any) {
  const [data, setData]   = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!citizen?.id) { setLoading(false); return; }
    const token = localStorage.getItem("citizen-token") || "";
    fetch(`/api/citizen-portal/${citizen.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(j => { if (j.ok) setData(j.data); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [citizen?.id]);

  const d = data || {};
  const stats = d.stats || {};
  const citations = d.citations || [];

  // ── Points from proper DB tables ────────────────────────────────────────
  const citizenPoints = d.citizenPointsDetail ?? {
    current:   d.goodConductPoints ?? citizen?.goodConductPoints ?? 100,
    start:     100,
    deducted:  0,
    incidents: 0,
    status:    "good",
    percentage: 100,
  };
  const driverPointsDetail = d.driverPointsDetail ?? null;
  const isDriver = d.isDriver ?? citizen?.isDriver ?? !!driverPointsDetail;
  const dpCurrent = driverPointsDetail?.current ?? d.driverPoints ?? citizen?.driverPoints ?? 100;
  const dpStart   = driverPointsDetail?.start ?? 100;

  const deductions = d.pointsDeductions ?? [];

  // ── Status helpers ──────────────────────────────────────────────────────
  const statusColor = (pts: number) => pts >= 80 ? "#10B981" : pts >= 60 ? "#F59E0B" : pts >= 40 ? "#EF4444" : "#7F1D1D";
  const statusLabel = (pts: number) => pts >= 80 ? "Njema" : pts >= 60 ? "Tahadhari" : pts >= 40 ? "Hatari" : "Imesimwa";
  const statusBg    = (pts: number) => pts >= 80 ? "bg-[#10B981]/10 text-[#10B981]" : pts >= 60 ? "bg-[#F59E0B]/10 text-[#F59E0B]" : pts >= 40 ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#7F1D1D]/10 text-[#7F1D1D]";

  const gcColor = statusColor(citizenPoints.current);
  const gcLabel = statusLabel(citizenPoints.current);
  const dpColor = statusColor(dpCurrent);
  const dpLabel = statusLabel(dpCurrent);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={28} className="animate-spin" style={{ color: "var(--tpf-blue)" }} />
    </div>
  );

  // Profile completion prompt
  const profileIncomplete = !d.profileComplete && !citizen?.profileComplete;
  const noNida = !d.nida && !citizen?.nida;

  return (
    <div className="space-y-3 sm:space-y-4 px-3 sm:px-5 py-3 sm:py-4">
      {/* ── Welcome hero — with prominent points display ───────────────────── */}
      <div className="rounded-2xl p-3 sm:p-5 text-white"
        style={{ background: "linear-gradient(135deg, #0F2557 0%, #1A3A8A 60%, #2563EB 100%)" }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Profile picture */}
            {d.photo_url || citizen?.photo_url ? (
              <img src={d.photo_url || citizen?.photo_url} alt=""
                className="h-12 w-12 rounded-xl object-cover ring-2 ring-white/30" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: "rgb(255 255 255 / 0.12)" }}>
                <Shield size={24} className="text-white" />
              </div>
            )}
            <div>
              <p className="text-[11px] font-semibold" style={{ color: "rgb(255 255 255 / 0.6)" }}>Karibu,</p>
              <h1 className="text-[20px] font-black text-white">{d.name || citizen?.name || "Raia"}</h1>
              <p className="text-[11px]" style={{ color: "rgb(255 255 255 / 0.5)" }}>
                {citizen?.nida ? `NIDA: ${citizen.nida}` : citizen?.phone || ""}
              </p>
            </div>
          </div>
        </div>

        {/* ── POINTS CARDS — the star of the dashboard ────────────────────── */}
        <div className="mt-4 flex flex-wrap gap-2">
          {/* Citizen Conduct Points */}
          <div className="flex-1 rounded-xl px-3 py-2.5" style={{ background: "rgb(255 255 255 / 0.1)" }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Award size={12} style={{ color: "#FCD34D" }} />
                <p className="text-[10px] font-semibold" style={{ color: "rgb(255 255 255 / 0.7)" }}>Tabia Njema</p>
              </div>
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${statusBg(citizenPoints.current)}`}
                style={{ background: citizenPoints.current >= 80 ? "rgb(16 185 129 / 0.2)" : citizenPoints.current >= 60 ? "rgb(245 158 11 / 0.2)" : "rgb(239 68 68 / 0.2)" }}>
                {gcLabel}
              </span>
            </div>
            <p className="text-[22px] font-black text-white">
              {citizenPoints.current}<span className="text-[12px] text-white/50">/{citizenPoints.start}</span>
            </p>
            {/* Progress bar */}
            <div className="mt-1.5 h-2 rounded-full" style={{ background: "rgb(255 255 255 / 0.15)" }}>
              <div className="h-2 rounded-full transition-all duration-500"
                style={{ width: `${citizenPoints.percentage}%`, background: gcColor }} />
            </div>
            {/* Deduction summary */}
            {citizenPoints.deducted > 0 && (
              <div className="mt-1.5 flex items-center gap-1">
                <TrendingDown size={10} style={{ color: "rgb(255 255 255 / 0.5)" }} />
                <span className="text-[9px]" style={{ color: "rgb(255 255 255 / 0.5)" }}>
                  -{Number(citizenPoints.deducted).toFixed(1)} pointi · {citizenPoints.incidents} matukio
                </span>
              </div>
            )}
          </div>

          {/* Driver Points — drivers only */}
          {isDriver && (
            <div className="flex-1 rounded-xl px-3 py-2.5" style={{ background: "rgb(255 255 255 / 0.1)" }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Car size={12} style={{ color: "#93C5FD" }} />
                  <p className="text-[10px] font-semibold" style={{ color: "rgb(255 255 255 / 0.7)" }}>Pointi Leseni</p>
                </div>
                <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                  style={{ background: dpCurrent >= 80 ? "rgb(16 185 129 / 0.2)" : dpCurrent >= 60 ? "rgb(245 158 11 / 0.2)" : "rgb(239 68 68 / 0.2)",
                           color: dpCurrent >= 80 ? "#10B981" : dpCurrent >= 60 ? "#F59E0B" : "#EF4444" }}>
                  {dpLabel}
                </span>
              </div>
              <p className="text-[22px] font-black text-white">
                {dpCurrent}<span className="text-[12px] text-white/50">/{dpStart}</span>
              </p>
              <div className="mt-1.5 h-2 rounded-full" style={{ background: "rgb(255 255 255 / 0.15)" }}>
                <div className="h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(dpCurrent * 100 / dpStart)}%`, background: dpColor }} />
              </div>
              {driverPointsDetail?.deducted > 0 && (
                <div className="mt-1.5 flex items-center gap-1">
                  <TrendingDown size={10} style={{ color: "rgb(255 255 255 / 0.5)" }} />
                  <span className="text-[9px]" style={{ color: "rgb(255 255 255 / 0.5)" }}>
                    -{Number(driverPointsDetail.deducted).toFixed(1)} pointi · {driverPointsDetail.violations} makosa
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Points Status Warning ───────────────────────────────────────────── */}
      {(citizenPoints.current < 80 || (isDriver && dpCurrent < 80)) && (
        <div className="rounded-2xl p-4"
          style={{
            background: citizenPoints.current < 40 || (isDriver && dpCurrent < 40)
              ? "color-mix(in srgb, #EF4444 8%, transparent)"
              : "color-mix(in srgb, #F59E0B 8%, transparent)",
            border: citizenPoints.current < 40 || (isDriver && dpCurrent < 40)
              ? "1px solid color-mix(in srgb, #EF4444 25%, transparent)"
              : "1px solid color-mix(in srgb, #F59E0B 25%, transparent)"
          }}>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: citizenPoints.current < 40 || (isDriver && dpCurrent < 40)
                ? "color-mix(in srgb, #EF4444 15%, transparent)"
                : "color-mix(in srgb, #F59E0B 15%, transparent)" }}>
              {citizenPoints.current < 40 || (isDriver && dpCurrent < 40)
                ? <Ban size={18} style={{ color: "#EF4444" }} />
                : <AlertTriangle size={18} style={{ color: "#F59E0B" }} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold" style={{ color: "var(--tpf-text)" }}>
                {citizenPoints.current < 40 ? "Pointi Zimesimwa!" : citizenPoints.current < 60 ? "Tahadhari ya Pointi" : "Pointi Zinaelekea Kushuka"}
              </p>
              <p className="text-[11px]" style={{ color: "var(--tpf-text-4)" }}>
                {citizenPoints.current < 40
                  ? "Pointi zako ni chini ya 40%. Huduma zingine zinaweza kusimamishwa."
                  : citizenPoints.current < 60
                    ? "Pointi zako ni chini ya 60%. Tahadhari — kosa zaidi kunaweza kusimamisha huduma."
                    : "Pointi zako zinaelekea kushuka. Jitie kuepuka makosa ya ziada."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile completion progress bar */}
      <ProfileProgressBar d={d} onClick={() => setScreen("profile")} />

      {/* ── Recent Points Deductions ────────────────────────────────────────── */}
      {deductions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-bold" style={{ color: "var(--tpf-text-2)" }}>Pointi Zilizopunguzwa</p>
            <button onClick={() => setScreen("reports")}
              className="text-[11px] font-semibold" style={{ color: "var(--tpf-blue)" }}>
              Angalia Zote
            </button>
          </div>
          <div className="space-y-2">
            {deductions.slice(0, 3).map((dd: any) => (
              <div key={dd.id} className="flex items-center gap-3 rounded-xl p-3"
                style={{ background: "var(--tpf-card)", border: "1px solid var(--tpf-border)" }}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "color-mix(in srgb, #EF4444 10%, transparent)" }}>
                  <TrendingDown size={16} style={{ color: "#EF4444" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[12px] font-semibold" style={{ color: "var(--tpf-text)" }}>
                    {dd.offense || "Kosa"}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--tpf-text-4)" }}>
                    {dd.deduction_type === "driver" ? "Leseni" : "Tabia"} · -{dd.points_deducted} pointi
                    {dd.officer_name ? ` · Afisa: ${dd.officer_name}` : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[11px] font-bold" style={{ color: "#EF4444" }}>
                    {dd.points_after}/{dd.points_before}
                  </p>
                  <p className="text-[9px]" style={{ color: "var(--tpf-text-4)" }}>
                    {dd.deduction_date ? new Date(dd.deduction_date).toLocaleDateString("sw-TZ") : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Malalamiko",  val: stats.complaints  || 0, color: "var(--tpf-red)",   icon: AlertTriangle, s: "complaints" },
          { label: "Maombi",      val: stats.applications|| 0, color: "var(--tpf-blue)",  icon: FileText,      s: "reports" },
          { label: "Malipo",      val: stats.payments    || 0, color: "var(--tpf-amber)", icon: CreditCard,    s: "payments" },
          { label: "Mali",        val: stats.properties  || 0, color: "var(--tpf-green)", icon: Home,          s: "profile" },
        ].map(s => (
          <button key={s.label} onClick={() => setScreen(s.s)}
            className="flex flex-col items-center rounded-2xl p-3 shadow-sm text-center transition active:scale-95"
            style={{ background: "var(--tpf-card)", border: "1px solid var(--tpf-border)" }}>
            <s.icon size={16} style={{ color: s.color }} />
            <span className="mt-1.5 text-[20px] font-black" style={{ color: s.color }}>{s.val}</span>
            <span className="text-[9px] leading-tight" style={{ color: "var(--tpf-text-4)" }}>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <p className="mb-3 text-[13px] font-bold" style={{ color: "var(--tpf-text-2)" }}>Vitendo vya Haraka</p>
        <div className="space-y-2">
          {[
            { label: "Omba Cheti cha Tabia Njema",  color: "var(--tpf-green)", icon: Shield,        s: "reports",    fee: "TZS 10,000" },
            { label: "Ripoti Tukio au Malalamiko",  color: "var(--tpf-red)",   icon: AlertTriangle, s: "complaints", fee: "Bure" },
            { label: "Angalia Malipo Yangu",         color: "var(--tpf-amber)", icon: CreditCard,    s: "payments",   fee: "" },
            { label: "Omba Ukaguzi wa Gari",         color: "var(--tpf-blue)",  icon: Car,           s: "reports",    fee: "TZS 25,000" },
          ].map(a => (
            <button key={a.label} onClick={() => setScreen(a.s)}
              className="flex w-full items-center gap-3 rounded-2xl p-3.5 text-left transition active:scale-[0.98]"
              style={{ background: "var(--tpf-card)", border: "1px solid var(--tpf-border)" }}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: `color-mix(in srgb, ${a.color} 12%, transparent)` }}>
                <a.icon size={18} style={{ color: a.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold" style={{ color: "var(--tpf-text)" }}>{a.label}</p>
                {a.fee && <p className="text-[10px]" style={{ color: "var(--tpf-text-4)" }}>{a.fee}</p>}
              </div>
              <ChevronRight size={14} style={{ color: "var(--tpf-border-2)" }} />
            </button>
          ))}
        </div>
      </div>

      {/* Recent citations */}
      {citations.length > 0 && (
        <div>
          <p className="mb-2 text-[13px] font-bold" style={{ color: "var(--tpf-text-2)" }}>Faini za Hivi Karibuni</p>
          <div className="space-y-2">
            {citations.slice(0, 3).map((c: any) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl p-3"
                style={{ background: "var(--tpf-card)", border: "1px solid var(--tpf-border)" }}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: c.fine_type === "traffic"
                    ? "color-mix(in srgb, var(--tpf-blue) 10%, transparent)"
                    : "color-mix(in srgb, var(--tpf-red) 10%, transparent)" }}>
                  {c.fine_type === "traffic" ? <Car size={16} style={{ color: "var(--tpf-blue)" }} /> : <FileText size={16} style={{ color: "var(--tpf-red)" }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[12px] font-semibold" style={{ color: "var(--tpf-text)" }}>{c.offense || "Kosa"}</p>
                  <p className="text-[10px]" style={{ color: "var(--tpf-text-4)" }}>
                    {c.citation_number} · {c.fine_type === "traffic" ? "Trafiki" : "Raia"}
                    · {c.created_at ? new Date(c.created_at).toLocaleDateString("sw-TZ") : ""}
                  </p>
                </div>
                <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={c.status === "paid"
                    ? { background: "color-mix(in srgb, var(--tpf-green) 15%, transparent)", color: "var(--tpf-green)" }
                    : { background: "color-mix(in srgb, var(--tpf-red) 12%, transparent)", color: "var(--tpf-red)" }}>
                  {c.status === "paid" ? "Imelipwa" : `TZS ${(c.total_amount ?? c.fine_amount ?? c.amount ?? 0).toLocaleString()}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
