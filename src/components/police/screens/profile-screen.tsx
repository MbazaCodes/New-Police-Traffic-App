// @ts-nocheck
"use client";
// Profile Screen — fetches fresh officer data from /api/police/me
// Shows all fields from creation: personal info, station, stats, recent activity

import { useState, useEffect } from "react";
import {
  Pencil, LogOut, Download, RefreshCw, Shield, FileText,
  AlertTriangle, Clock, Phone, Mail, MapPin, Hash, User,
  Calendar, Activity, ChevronRight, Loader2,
} from "lucide-react";
import { TopAppBar } from "../top-app-bar";
import { ThemeToggle } from "../theme-toggle";
import { useOfficer } from "@/hooks/use-officer";
import { usePoliceStore } from "@/store/police-store";
import { toast } from "@/hooks/use-toast";

const ROLE_LABELS: Record<string, string> = {
  "officer-traffic":         "Askari wa Trafiki",
  "officer-general":         "Polisi wa Kawaida",
  "post-officer":            "Afisa wa Posti",
  "cid-officer":             "Afisa wa CID",
  "investigator":            "Mpelelezi",
  "station-commissioner":    "Kamanda wa Kituo (OCS)",
  "district-commissioner":   "Kamanda wa Wilaya (OCD)",
  "regional-commissioner":   "Kamanda wa Mkoa (RPC)",
  "national-commissioner":   "Kamanda wa Kitaifa",
  "admin":                   "Msimamizi",
  "super-admin":             "Msimamizi Mkuu",
};

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: "Kazini",       color: "#10B981", bg: "#10B981" },
  "on-leave":{ label: "Mapumziko",    color: "#FF9800", bg: "#FF9800" },
  suspended: { label: "Amesimamishwa",color: "#EF4444", bg: "#EF4444" },
  "off-duty":{ label: "Nje ya Kazi",  color: "#6B7280", bg: "#6B7280" },
};

type LiveProfile = {
  name: string; shortName: string; badgeNo: string; idNumber: string;
  rank: string; rankShort: string; role: string; roleRaw: string;
  unit: string; region: string; phone: string; email: string;
  photo: string; status: string;
  station: string; stationPhone: string; stationRegion: string; stationDistrict: string;
  lastLogin: string | null; createdAt: string | null; updatedAt: string | null;
  patrolsCount: number; citationsCount: number; incidentsCount: number; hoursToday: number;
  recentCitations: { id: string; number: string; offense: string; date: string }[];
  recentArrests:   { id: string; name: string; charge: string; date: string }[];
};

export function ProfileScreen() {
  const OFFICER = useOfficer();   // Zustand cached data (from login)
  const { logout, navigate } = usePoliceStore();

  const [liveData, setLiveData] = useState<LiveProfile | null>(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res  = await fetch("/api/police/me");
      const json = await res.json();
      if (json.ok && json.data) setLiveData(json.data);
    } catch { /* use cached */ }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { void fetchProfile(); }, []);

  // Merge: live data takes priority; fall back to Zustand cache
  const d = liveData ?? {
    name:           OFFICER.name,
    shortName:      OFFICER.shortName,
    badgeNo:        OFFICER.badgeNo,
    idNumber:       OFFICER.idNumber,
    rank:           OFFICER.rank,
    rankShort:      OFFICER.rankShort,
    role:           OFFICER.role,
    roleRaw:        OFFICER.roleRaw,
    unit:           OFFICER.unit,
    region:         OFFICER.region,
    phone:          OFFICER.phone,
    email:          OFFICER.email,
    photo:          OFFICER.photo,
    status:         OFFICER.status,
    station:        OFFICER.station,
    stationPhone:   OFFICER.stationPhone,
    stationRegion:  OFFICER.stationRegion,
    stationDistrict:OFFICER.stationDistrict,
    lastLogin:      OFFICER.lastLogin,
    createdAt:      OFFICER.createdAt,
    updatedAt:      null,
    patrolsCount:   OFFICER.patrolsCount,
    citationsCount: OFFICER.citationsCount,
    incidentsCount: OFFICER.incidentsCount,
    hoursToday:     OFFICER.hoursToday,
    recentCitations: [],
    recentArrests:   [],
  };

  const statusCfg = STATUS_STYLES[d.status] ?? STATUS_STYLES.active;
  const roleLabel = ROLE_LABELS[d.roleRaw ?? d.role] ?? d.role;

  const fmtDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("sw-TZ", { year:"numeric", month:"long", day:"numeric" });
  };
  const fmtDateTime = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("sw-TZ", { dateStyle:"medium", timeStyle:"short" });
  };

  const handleDownload = () => {
    const html = `<!doctype html><html><head><meta charset="utf-8">
<title>Taarifa za Afisa — ${d.name}</title>
<style>
  body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
  h1 { color: #1E3A8A; border-bottom: 3px solid #1E3A8A; padding-bottom: 8px; }
  table { border-collapse: collapse; width: 100%; margin-top: 16px; }
  td, th { border: 1px solid #ccc; padding: 8px 12px; }
  th { background: #1E3A8A; color: #fff; text-align: left; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 99px; background: #10B981; color: #fff; font-size: 12px; }
</style></head><body>
<h1>TAARIFA ZA AFISA — JESHI LA POLISI TANZANIA</h1>
<table>
<tr><th colspan="2">Taarifa Binafsi</th></tr>
<tr><td>Jina Kamili</td><td>${d.name}</td></tr>
<tr><td>Cheo / Rank</td><td>${d.rank}</td></tr>
<tr><td>Nafasi</td><td>${roleLabel}</td></tr>
<tr><td>Namba ya Badge</td><td>${d.badgeNo}</td></tr>
<tr><td>Namba ya Kitambulisho</td><td>${d.idNumber || "—"}</td></tr>
<tr><td>Simu</td><td>${d.phone || "—"}</td></tr>
<tr><td>Barua Pepe</td><td>${d.email || "—"}</td></tr>
<tr><td>Hali</td><td><span class="badge">${statusCfg.label}</span></td></tr>
<tr><td>Tarehe ya Usajili</td><td>${fmtDate(d.createdAt)}</td></tr>
<tr><th colspan="2">Kituo cha Kazi</th></tr>
<tr><td>Kituo</td><td>${d.station || "—"}</td></tr>
<tr><td>Kitengo</td><td>${d.unit || "—"}</td></tr>
<tr><td>Mkoa</td><td>${d.stationRegion || d.region || "—"}</td></tr>
<tr><td>Wilaya</td><td>${d.stationDistrict || "—"}</td></tr>
<tr><td>Simu ya Kituo</td><td>${d.stationPhone || "—"}</td></tr>
<tr><th colspan="2">Takwimu</th></tr>
<tr><td>Patroli</td><td>${d.patrolsCount}</td></tr>
<tr><td>Citations</td><td>${d.citationsCount}</td></tr>
<tr><td>Matukio</td><td>${d.incidentsCount}</td></tr>
</table>
<p style="margin-top:24px;font-size:11px;color:#999">Imetolewa: ${new Date().toLocaleString("sw-TZ")} · Mfumo wa Dijitali wa TPF</p>
</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `Afisa_${d.badgeNo || d.name.split(" ")[0]}.html`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    toast({ title: "Ripoti Imepakiwa ✓" });
  };

  return (
    <div className="min-h-full bg-police">
      <TopAppBar title="Profaili ya Afisa" subtitle="Taarifa zako zote kutoka usajili" showLogo={false} />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[#2196F3]" />
          <p className="ml-3 text-[14px] text-police-muted">Inapakia taarifa...</p>
        </div>
      ) : (
      <div className="space-y-4 p-4 pb-8">

        {/* ── Hero card ───────────────────────────────────────── */}
        <div className="rounded-2xl bg-police-card p-5 shadow-sm">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              {d.photo ? (
                <img src={d.photo} alt={d.name}
                  className="h-20 w-20 rounded-full object-cover ring-3 ring-[#2196F3]/30" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1E3A8A] text-[26px] font-black text-white">
                  {d.shortName.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-police-card"
                style={{ backgroundColor: statusCfg.bg }}>
                <span className="h-2 w-2 rounded-full bg-white" />
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[18px] font-bold text-police">{d.name}</h2>
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
                  style={{ backgroundColor: statusCfg.bg }}>
                  {statusCfg.label}
                </span>
              </div>
              <p className="mt-0.5 text-[13px] font-semibold text-[#2196F3]">{d.rank}</p>
              <p className="text-[12px] text-police-muted">{roleLabel}</p>
              <p className="mt-1 font-mono text-[11px] text-police-faint">{d.badgeNo}</p>

              <button onClick={() => navigate("edit-profile")}
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-[#2196F3] px-3 py-1.5 text-[11px] font-semibold text-[#2196F3]">
                <Pencil size={11} /> Hariri Profaili
              </button>
            </div>

            <button onClick={() => fetchProfile(true)} disabled={refreshing}
              className="shrink-0 rounded-xl bg-police-soft p-2">
              <RefreshCw size={16} className={`text-police-muted ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* ── Stats ───────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Patroli",   value: d.patrolsCount,   color: "#2196F3", icon: Shield },
            { label: "Citations", value: d.citationsCount, color: "#EF4444", icon: FileText },
            { label: "Matukio",   value: d.incidentsCount, color: "#FF9800", icon: AlertTriangle },
            { label: "Saa Leo",   value: d.hoursToday,     color: "#10B981", icon: Clock },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center rounded-xl bg-police-card p-3 shadow-sm">
              <s.icon size={16} style={{ color: s.color }} />
              <span className="mt-1 text-[18px] font-bold" style={{ color: s.color }}>{s.value}</span>
              <span className="mt-0.5 text-center text-[9px] leading-tight text-police-muted">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Personal details ─────────────────────────────────── */}
        <Section title="Taarifa Binafsi" icon={User} color="#1E3A8A">
          <Row icon={Hash}     label="Badge / Namba"        value={d.badgeNo || "—"} mono />
          <Row icon={Hash}     label="Kitambulisho (ID)"    value={d.idNumber || "—"} mono />
          <Row icon={Phone}    label="Simu"                 value={d.phone || "—"} />
          <Row icon={Mail}     label="Barua Pepe"           value={d.email || "—"} />
          <Row icon={Shield}   label="Nafasi ya Mfumo"      value={roleLabel} />
          <Row icon={Activity} label="Hali"                 value={statusCfg.label} valueColor={statusCfg.color} />
          <Row icon={Calendar} label="Tarehe ya Usajili"    value={fmtDate(d.createdAt)} />
          <Row icon={Clock}    label="Mara ya Mwisho Kuingia" value={fmtDateTime(d.lastLogin)} />
        </Section>

        {/* ── Station details ──────────────────────────────────── */}
        <Section title="Kituo cha Kazi" icon={MapPin} color="#10B981">
          <Row icon={MapPin} label="Kituo"    value={d.station || "—"} />
          <Row icon={Shield} label="Kitengo"  value={d.unit || "—"} />
          <Row icon={MapPin} label="Mkoa"     value={d.stationRegion || d.region || "—"} />
          <Row icon={MapPin} label="Wilaya"   value={d.stationDistrict || "—"} />
          {d.stationPhone && <Row icon={Phone} label="Simu ya Kituo" value={d.stationPhone} />}
        </Section>

        {/* ── Recent citations ─────────────────────────────────── */}
        {d.recentCitations.length > 0 && (
          <Section title="Citations za Hivi Karibuni" icon={FileText} color="#EF4444">
            {d.recentCitations.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-police-soft last:border-0">
                <div>
                  <p className="text-[12px] font-semibold text-police">{c.offense}</p>
                  <p className="font-mono text-[10px] text-police-faint">{c.number}</p>
                </div>
                <p className="text-[10px] text-police-muted">{fmtDate(c.date)}</p>
              </div>
            ))}
            <button onClick={() => navigate("history")} className="mt-2 flex w-full items-center justify-center gap-1 text-[12px] font-semibold text-[#2196F3]">
              Angalia Zote <ChevronRight size={13} />
            </button>
          </Section>
        )}

        {/* ── Recent arrests ────────────────────────────────────── */}
        {d.recentArrests.length > 0 && (
          <Section title="Makamato ya Hivi Karibuni" icon={AlertTriangle} color="#FF9800">
            {d.recentArrests.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-police-soft last:border-0">
                <div>
                  <p className="text-[12px] font-semibold text-police">{a.name}</p>
                  <p className="text-[10px] text-police-faint">{a.charge}</p>
                </div>
                <p className="text-[10px] text-police-muted">{fmtDate(a.date)}</p>
              </div>
            ))}
          </Section>
        )}

        {/* ── Settings ─────────────────────────────────────────── */}
        <div className="rounded-2xl bg-police-card p-4 shadow-sm space-y-3">
          <p className="text-[13px] font-bold text-police">Mipangilio</p>
          <div className="pb-1">
            <p className="text-[12px] font-medium text-police mb-2">Mwonekano (Theme)</p>
            <ThemeToggle />
          </div>
        </div>

        {/* ── Actions ─────────────────────────────────────────────── */}
        <button onClick={handleDownload}
          className="flex w-full items-center gap-3 rounded-2xl bg-[#2196F3] p-4 text-left shadow-md active:scale-[0.98]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Download size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-white">Pakua Taarifa Zangu</p>
            <p className="text-[11px] text-white/80">Hifadhi PDF ya taarifa zako zote</p>
          </div>
        </button>

        <button onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#EF4444]/20 bg-police-card py-3 text-[14px] font-bold text-[#EF4444] active:scale-[0.98]">
          <LogOut size={18} /> Toka (Logout)
        </button>
      </div>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, color, children }: {
  title: string; icon: any; color: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-police-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <Icon size={15} style={{ color }} />
        </div>
        <h3 className="text-[14px] font-bold text-police">{title}</h3>
      </div>
      <div className="space-y-0">{children}</div>
    </div>
  );
}

function Row({ icon: Icon, label, value, mono, valueColor }: {
  icon: any; label: string; value: string; mono?: boolean; valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-police-soft last:border-0">
      <div className="flex items-center gap-2 shrink-0">
        <Icon size={13} className="text-police-faint" />
        <span className="text-[12px] text-police-muted">{label}</span>
      </div>
      <span className={`text-right text-[12px] font-medium ${mono ? "font-mono" : ""}`}
        style={valueColor ? { color: valueColor } : {}}>
        {value || "—"}
      </span>
    </div>
  );
}
