"use client";

import { useState } from "react";
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

  const handleSave = () => {
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

      {/* Bottom save bar */}
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
