"use client";
import { OFFICERS, ADMIN_CITATIONS, ADMIN_INCIDENTS, ACTIVE_PATROLS, ASSIGNMENTS, POSTS, STATIONS, ADMIN_USERS, WARNING_RECORDS, LIVE_INCIDENTS, INCIDENT_TREND, OFFENSE_DISTRIBUTION, GENERAL_INCIDENT_DISTRIBUTION, COMBINED_DISTRIBUTION, REGION_STATS, ADMIN_USER, settings } from "@/lib/admin-data";
import type { OfficerRecord, CitationRecord, IncidentRecord, PatrolRecord, AssignmentRecord, PostRecord, StationRecord, AdminUserRecord, WarningRecord, MissingRecord, DetainedRecord, LiveIncidentRecord } from "@/lib/admin-data";

import { useState, useEffect, useCallback } from "react";
import {
  Settings,
  Shield,
  Bell,
  Server,
  Save,
  Globe,
  Clock,
  Lock,
  Smartphone,
  Mail,
  MessageSquare,
  Database,
  HardDrive,
  CreditCard,
  Edit3,
  Loader2,
  Plus,
  X,
  CheckCircle2,
  Percent,
  DollarSign,
  FileText,
  Car,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-[#2196F3]" : "bg-police-input"
      }`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export function AdminSettings() {
  // General
  const [orgName, setOrgName] = useState("Jeshi la Polisi Tanzania");
  const [timezone, setTimezone] = useState("Africa/Dar_es_Salaam");
  const [language, setLanguage] = useState("sw");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Security
  const [twoFA, setTwoFA] = useState(true);
  const [otpRequired, setOtpRequired] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(true);
  const [ipRestriction, setIpRestriction] = useState(false);

  // Notifications
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [urgentOnly, setUrgentOnly] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);

  // System
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [debugMode, setDebugMode] = useState(false);

  // ── Service Prices (editable pricing) ────────────────────────────────────
  const [servicePrices, setServicePrices] = useState<any[]>([]);
  const [pricesLoading, setPricesLoading] = useState(true);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [savingPrice, setSavingPrice] = useState(false);
  const [addNewPrice, setAddNewPrice] = useState(false);
  const [newPriceForm, setNewPriceForm] = useState({
    code: "", name_en: "", name_sw: "", category: "fine", amount: 0, is_rate: false, unit: "TZS", description: "",
  });

  const CATEGORY_ICONS: Record<string, any> = {
    fine: CreditCard,
    penalty: AlertCircle,
    service: FileText,
    application: CheckCircle2,
  };

  const loadPrices = useCallback(async () => {
    setPricesLoading(true);
    try {
      const res = await fetch("/api/service-prices");
      const json = await res.json();
      if (json.ok) setServicePrices(json.data ?? []);
    } catch (e) {
      console.error("[SERVICE_PRICES LOAD]", e);
    }
    setPricesLoading(false);
  }, []);

  useEffect(() => { loadPrices(); }, [loadPrices]);

  const handleSave = () => {
    // Persist to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("tpf-settings", JSON.stringify(settings));
    }
    toast({
      title: "Imehifadhiwa",
      description: "Mipangilio yote ya mfumo imesasishwa kwa fanaka",
    });
  };

  return (
    <div className="space-y-5">
      {/* Heading */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-police-navy">Mipangilio</h1>
          <p className="text-[13px] text-police-muted">
            Dhibiti mipangilio ya mfumo wa Admin & Command Center
          </p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-lg bg-[#2196F3] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#2196F3]"
        >
          <Save size={14} /> Hifadhi Mabadiliko
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* General */}
        <SectionCard
          icon={<Settings size={16} />}
          title="Jumla"
          description="Mipangilio ya jumla ya mfumo"
        >
          <Field label="Jina la Shirika">
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full rounded-lg border border-police-soft bg-police-input px-3 py-2 text-[13px] text-police focus:border-[#2196F3] focus:outline-none"
            />
          </Field>
          <Field label="Saa ya Mtaa">
            <div className="flex items-center gap-2 rounded-lg border border-police-soft bg-police-input px-3 py-2">
              <Clock size={14} className="text-police-faint" />
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="flex-1 bg-transparent text-[13px] text-police focus:outline-none"
              >
                <option value="Africa/Dar_es_Salaam">Africa/Dar_es_Salaam (GMT+3)</option>
                <option value="Africa/Nairobi">Africa/Nairobi (GMT+3)</option>
                <option value="UTC">UTC (GMT+0)</option>
              </select>
            </div>
          </Field>
          <Field label="Lugha">
            <div className="flex items-center gap-2 rounded-lg border border-police-soft bg-police-input px-3 py-2">
              <Globe size={14} className="text-police-faint" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="flex-1 bg-transparent text-[13px] text-police focus:outline-none"
              >
                <option value="sw">Kiswahili</option>
                <option value="en">English</option>
              </select>
            </div>
          </Field>
          <ToggleRow
            label="Sasisho za Moja kwa Moja"
            description="Onyesha data mpya kila sekunde 30"
            checked={autoRefresh}
            onChange={setAutoRefresh}
          />
        </SectionCard>

        {/* Security */}
        <SectionCard
          icon={<Shield size={16} />}
          title="Usalama"
          description="Mipangilio ya usalama wa mfumo"
          accent="#10B981"
        >
          <ToggleRow
            label="Uthibitishaji wa Hatua Mbili (2FA)"
            description="Watumiaji watalazimika kutumia 2FA kuingia"
            checked={twoFA}
            onChange={setTwoFA}
          />
          <ToggleRow
            label="OTP Inahitajika"
            description="Tuma OTP kwenye simu kwa kila login"
            checked={otpRequired}
            onChange={setOtpRequired}
          />
          <ToggleRow
            label="Muda wa Kikao"
            description="Tokomeza kikao baada ya dakika 30 bila shughuli"
            checked={sessionTimeout}
            onChange={setSessionTimeout}
          />
          <ToggleRow
            label="Kizuizi cha IP"
            description="Ruhusu login kutoka IP maalum tu"
            checked={ipRestriction}
            onChange={setIpRestriction}
          />
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-[#FF9800]/30 bg-[#FF9800]/10 p-3 text-[11px] text-[#FF9800] dark:text-[#FF9800]400">
            <Lock size={14} className="shrink-0" />
            Badilisha nywila ya msimamizi kila baada ya siku 90 kwa usalama zaidi.
          </div>
        </SectionCard>

        {/* Notifications */}
        <SectionCard
          icon={<Bell size={16} />}
          title="Arifa"
          description="Mipangilio ya arifa na taarifa"
          accent="#FF9800"
        >
          <ToggleRow
            label="Arifa za Barua Pepe"
            description="Tuma arifa kwenye barua pepe"
            checked={emailNotif}
            onChange={setEmailNotif}
            icon={<Mail size={14} />}
          />
          <ToggleRow
            label="Arifa za SMS"
            description="Tuma arifa kwenye simu (SMS)"
            checked={smsNotif}
            onChange={setSmsNotif}
            icon={<Smartphone size={14} />}
          />
          <ToggleRow
            label="Arifa za Muhimu Tu"
            description="Pata arifa za matukio ya muhimu tu"
            checked={urgentOnly}
            onChange={setUrgentOnly}
            icon={<MessageSquare size={14} />}
          />
          <ToggleRow
            label="Muhtasari wa Kila Siku"
            description="Tuma muhtasari wa shughuli kila asubuhi"
            checked={dailyDigest}
            onChange={setDailyDigest}
          />
        </SectionCard>

        {/* System */}
        <SectionCard
          icon={<Server size={16} />}
          title="Mfumo"
          description="Mipangilio ya mfumo na matengenezo"
          accent="#1E3A8A"
        >
          <ToggleRow
            label="Hali ya Matengenezo"
            description="Funga mfumo kwa watumiaji wa kawaida"
            checked={maintenanceMode}
            onChange={setMaintenanceMode}
            icon={<Database size={14} />}
          />
          <ToggleRow
            label="Hifadhi nakala Otomatiki"
            description="Hifadhi data kila saa 6"
            checked={autoBackup}
            onChange={setAutoBackup}
            icon={<HardDrive size={14} />}
          />
          <ToggleRow
            label="Hali ya Debug"
            description="Onyesha makosa ya mfumo kwa waendelezaji"
            checked={debugMode}
            onChange={setDebugMode}
          />
          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
            <SystemStat label="Toleo" value="v2.4.1" />
            <SystemStat label="Seva" value="Online" status="online" />
            <SystemStat label="Hifadhi Data" value="68% / 1TB" />
            <SystemStat label="Mwisho wa Backup" value="15 Mei 06:00" />
          </div>
        </SectionCard>
      </div>

      {/* ═══ Service Prices — Editable Pricing ═══ */}
      <div className="rounded-xl bg-police-card p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: "#2196F31A", color: "#2196F3" }}>
              <CreditCard size={16} />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-police-navy">Bei za Huduma</h2>
              <p className="text-[11px] text-police-muted">
                Badilisha bei za faini, huduma, na maombi — admin inaweza kubadilisha kila wakati
              </p>
            </div>
          </div>
          <button onClick={() => setAddNewPrice(v => !v)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2196F3] px-3 py-2 text-[12px] font-semibold text-white">
            <Plus size={14} /> Ongeza Bei
          </button>
        </div>

        {/* Add new price form */}
        {addNewPrice && (
          <div className="mb-4 space-y-3 rounded-xl border-2 border-[#2196F3]/30 bg-[#2196F3]/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-bold text-[#2196F3]">Sajili Bei Mpya</p>
              <button onClick={() => setAddNewPrice(false)} className="text-police-faint"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase text-police-faint">Code *</label>
                <input value={newPriceForm.code}
                  onChange={e => setNewPriceForm(f => ({ ...f, code: e.target.value }))}
                  className="w-full rounded-lg border border-police-soft bg-police-input px-3 py-2 text-[13px] text-police focus:border-[#2196F3] focus:outline-none"
                  placeholder="e.g. traffic_fine_base" />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase text-police-faint">Category</label>
                <select value={newPriceForm.category}
                  onChange={e => setNewPriceForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-lg border border-police-soft bg-police-input px-3 py-2 text-[13px] text-police focus:border-[#2196F3] focus:outline-none">
                  <option value="fine">Faini</option>
                  <option value="penalty">Malipo ya Kuchelewa</option>
                  <option value="service">Huduma</option>
                  <option value="application">Maombi</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase text-police-faint">Jina (EN) *</label>
                <input value={newPriceForm.name_en}
                  onChange={e => setNewPriceForm(f => ({ ...f, name_en: e.target.value }))}
                  className="w-full rounded-lg border border-police-soft bg-police-input px-3 py-2 text-[13px] text-police focus:border-[#2196F3] focus:outline-none"
                  placeholder="Base Traffic Fine" />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase text-police-faint">Jina (SW) *</label>
                <input value={newPriceForm.name_sw}
                  onChange={e => setNewPriceForm(f => ({ ...f, name_sw: e.target.value }))}
                  className="w-full rounded-lg border border-police-soft bg-police-input px-3 py-2 text-[13px] text-police focus:border-[#2196F3] focus:outline-none"
                  placeholder="Faini ya Trafiki" />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase text-police-faint">Bei (TZS) *</label>
                <input type="number" value={newPriceForm.amount}
                  onChange={e => setNewPriceForm(f => ({ ...f, amount: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-police-soft bg-police-input px-3 py-2 text-[13px] text-police focus:border-[#2196F3] focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase text-police-faint">Aina</label>
                <select value={newPriceForm.is_rate ? "rate" : "amount"}
                  onChange={e => setNewPriceForm(f => ({ ...f, is_rate: e.target.value === "rate", unit: e.target.value === "rate" ? "%" : "TZS" }))}
                  className="w-full rounded-lg border border-police-soft bg-police-input px-3 py-2 text-[13px] text-police focus:border-[#2196F3] focus:outline-none">
                  <option value="amount">Kiasi (TZS)</option>
                  <option value="rate">Asilimia (%)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase text-police-faint">Maelezo</label>
              <input value={newPriceForm.description}
                onChange={e => setNewPriceForm(f => ({ ...f, description: e.target.value }))}
                className="w-full rounded-lg border border-police-soft bg-police-input px-3 py-2 text-[13px] text-police focus:border-[#2196F3] focus:outline-none"
                placeholder="Optional description" />
            </div>
            <button
              onClick={async () => {
                if (!newPriceForm.code || !newPriceForm.name_en || !newPriceForm.name_sw) {
                  toast({ title: "Error", description: "Code, name_en, name_sw ni lazima" });
                  return;
                }
                try {
                  const res = await fetch("/api/service-prices", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newPriceForm),
                  });
                  const json = await res.json();
                  if (json.ok) {
                    toast({ title: "Imeongezwa!", description: "Bei mpya imeongezwa kikamilifu" });
                    setAddNewPrice(false);
                    setNewPriceForm({ code:"", name_en:"", name_sw:"", category:"fine", amount:0, is_rate:false, unit:"TZS", description:"" });
                    loadPrices();
                  } else {
                    toast({ title: "Error", description: json.error ?? "Imeshindwa" });
                  }
                } catch (e) { toast({ title: "Error", description: "Imeshindwa kuongeza bei" }); }
              }}
              className="w-full rounded-lg bg-[#2196F3] py-2.5 text-[13px] font-semibold text-white">
              Ongeza Bei
            </button>
          </div>
        )}

        {/* Prices list */}
        {pricesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-[#2196F3]" />
            <span className="ml-2 text-[13px] text-police-muted">Inapakia bei...</span>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Group by category */}
            {["fine", "penalty", "service", "application"].map(cat => {
              const catPrices = servicePrices.filter(p => p.category === cat);
              if (catPrices.length === 0) return null;
              const CatIcon = CATEGORY_ICONS[cat] || CreditCard;
              const catLabel = cat === "fine" ? "Faini" : cat === "penalty" ? "Malipo ya Kuchelewa" : cat === "service" ? "Huduma" : "Maombi";
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-2 mt-3">
                    <CatIcon size={13} className="text-police-muted" />
                    <span className="text-[11px] font-bold uppercase tracking-wide text-police-faint">{catLabel}</span>
                    <span className="rounded-full bg-police-muted px-1.5 py-0.5 text-[9px] font-bold text-police-muted">{catPrices.length}</span>
                  </div>
                  {catPrices.map((price) => (
                    <div key={price.id} className="flex items-center justify-between rounded-lg border border-police-soft bg-police-muted/40 p-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-semibold text-police truncate">
                            {price.name_sw || price.name_en}
                          </p>
                          <span className="rounded-md bg-police-input px-1.5 py-0.5 text-[9px] font-mono text-police-faint">
                            {price.code}
                          </span>
                        </div>
                        <p className="text-[10px] text-police-muted mt-0.5">
                          {price.name_en} {price.description ? `— ${price.description}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {editingPrice === price.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="w-20 rounded-lg border border-[#2196F3] bg-police-input px-2 py-1 text-[13px] font-semibold text-police focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={async () => {
                                setSavingPrice(true);
                                try {
                                  const res = await fetch("/api/service-prices", {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ id: price.id, amount: Number(editAmount) }),
                                  });
                                  const json = await res.json();
                                  if (json.ok) {
                                    toast({ title: "Imesasishwa!", description: `Bei ya ${price.name_sw || price.name_en} imesasishwa` });
                                    loadPrices();
                                  } else {
                                    toast({ title: "Error", description: json.error });
                                  }
                                } catch (e) { toast({ title: "Error", description: "Imeshindwa kusasisha" }); }
                                setEditingPrice(null);
                                setSavingPrice(false);
                              }}
                              disabled={savingPrice}
                              className="rounded-lg bg-[#10B981] px-2 py-1 text-[12px] font-bold text-white">
                              {savingPrice ? "..." : "✓"}
                            </button>
                            <button onClick={() => setEditingPrice(null)}
                              className="rounded-lg bg-police-soft px-2 py-1 text-[12px] font-bold text-police-muted">
                              ✗
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-1 rounded-lg bg-police-card px-3 py-1.5 text-[14px] font-black text-police-navy">
                              {price.is_rate ? (
                                <>
                                  <Percent size={12} className="text-[#2196F3]" />
                                  {price.amount}
                                </>
                              ) : (
                                <>
                                  TZS {Number(price.amount).toLocaleString()}
                              </>
                              )}
                            </div>
                            <button onClick={() => {
                              setEditingPrice(price.id);
                              setEditAmount(String(price.amount));
                            }}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-police-soft bg-police-card"
                              title="Badilisha bei">
                              <Edit3 size={13} className="text-police-muted" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="sticky bottom-0 -mx-4 flex items-center justify-between border-t border-police-soft bg-police-card/95 px-4 py-3 backdrop-blur lg:-mx-6 lg:px-6">
        <p className="text-[12px] text-police-muted">
          Mabadiliko yatakawika kwenye mfumo mzima baada ya kuhifadhi.
        </p>
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-lg bg-[#2196F3] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#2196F3]"
        >
          <Save size={14} /> Hifadhi Sasa
        </button>
      </div>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  description,
  accent = "#2196F3",
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-police-card p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accent}1A`, color: accent }}
        >
          {icon}
        </div>
        <div>
          <h2 className="text-[14px] font-bold text-police-navy">{title}</h2>
          <p className="text-[11px] text-police-muted">{description}</p>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase text-police-faint">
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  icon,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-police-soft bg-police-muted/40 p-3">
      <div className="flex items-start gap-2.5">
        {icon && <span className="mt-0.5 text-police-faint">{icon}</span>}
        <div>
          <p className="text-[13px] font-semibold text-police">{label}</p>
          <p className="text-[11px] text-police-muted">{description}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function SystemStat({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status?: "online" | "offline";
}) {
  return (
    <div className="rounded-lg border border-police-soft bg-police-input p-2.5">
      <p className="text-[10px] uppercase text-police-faint">{label}</p>
      <p className="mt-0.5 flex items-center gap-1 text-[12px] font-semibold text-police">
        {status === "online" && (
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
        )}
        {value}
      </p>
    </div>
  );
}
