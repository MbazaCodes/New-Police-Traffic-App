"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Search,
  Telescope,
  FolderOpen,
  UserX,
  AlertTriangle,
  FileSearch,
  MessageSquare,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  ChevronDown,
  Bell,
  Users,
  Car,
  Shield,
  FileWarning,
  Clock,
  MapPin,
  TrendingUp,
  Eye,
  Archive,
  Camera,
  Fingerprint,
  Phone,
  Banknote,
  ArrowRight,
  Star,
  Lock,
  BellRing,
  Globe,
  Save,
} from "lucide-react";
import { useTheme } from "next-themes";
import { usePoliceStore } from "@/store/police-store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CidScreen =
  | "dashboard"
  | "intel"
  | "cases"
  | "suspects"
  | "wanted"
  | "evidence"
  | "interviews"
  | "pf3"
  | "reports"
  | "settings";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CID_USER = {
  shortName: "DCP. Grace Mwangi",
  rank: "Deputy Commissioner",
};

const CID_NAV: {
  id: CidScreen;
  label: string;
  icon: typeof Search;
  badge?: number;
}[] = [
  { id: "dashboard", label: "Dashibodi", icon: Search },
  { id: "intel", label: "Konze la Upelelezi", icon: Telescope },
  { id: "cases", label: "Kesi", icon: FolderOpen },
  { id: "suspects", label: "Watuhumiwa", icon: UserX },
  { id: "wanted", label: "Wanaotafutwa", icon: AlertTriangle, badge: 7 },
  { id: "evidence", label: "Ushahidi", icon: FileSearch },
  { id: "interviews", label: "Mahojiano", icon: MessageSquare },
  { id: "pf3", label: "PF3 Forms", icon: FileText },
  { id: "reports", label: "Ripoti", icon: BarChart3 },
  { id: "settings", label: "Mipangilio", icon: Settings },
];

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const CASES = [
  { id: "CID-2025-0041", type: "Wizi", status: "Active", date: "2025-06-12", officer: "IP. Juma Mwenda", region: "Dar es Salaam" },
  { id: "CID-2025-0039", type: "Uhujumu Uchumi", status: "Under Review", date: "2025-06-10", officer: "SP. Aisha Mohammed", region: "Dodoma" },
  { id: "CID-2025-0037", type: "Uhalifu wa Dawa", status: "Active", date: "2025-06-08", officer: "IP. Rashid Kimaro", region: "Mwanza" },
  { id: "CID-2025-0035", type: "Ubakaji", status: "Closed", date: "2025-06-05", officer: "ASP. Fatma Hassan", region: "Arusha" },
  { id: "CID-2025-0033", type: "Wizi wa Gari", status: "Active", date: "2025-06-02", officer: "IP. Peter Msigwa", region: "Mbeya" },
  { id: "CID-2025-0031", type: "Uhuni", status: "Pending", date: "2025-05-28", officer: "SP. Halima Mzee", region: "Tanga" },
  { id: "CID-2025-0029", type: "Ulaghai", status: "Active", date: "2025-05-25", officer: "IP. George Kapufi", region: "Zanzibar" },
  { id: "CID-2025-0027", type: "Mauaji", status: "Under Review", date: "2025-05-20", officer: "ASP. Joyce Lyimo", region: "Kilimanjaro" },
];

const SUSPECTS = [
  { name: "Hassan Omary", nida: "1234567890123", case: "CID-2025-0041", status: "Held", risk: "High" },
  { name: "Amina Yusuf", nida: "2345678901234", case: "CID-2025-0039", status: "Released", risk: "Medium" },
  { name: "Juma Bakari", nida: "3456789012345", case: "CID-2025-0037", status: "On Bail", risk: "High" },
  { name: "Rehema Saidi", nida: "4567890123456", case: "CID-2025-0033", status: "Held", risk: "Low" },
  { name: "Khalid Mnengu", nida: "5678901234567", case: "CID-2025-0031", status: "Wanted", risk: "High" },
  { name: "Zainab Maalim", nida: "6789012345678", case: "CID-2025-0029", status: "On Bail", risk: "Medium" },
];

const WANTED_PERSONS = [
  { name: "Idris Makene", crime: "Wizi wa Pesa — TZS 450,000,000", reward: 5_000_000, color: "bg-[#EF4444]/600" },
  { name: "Salma Juma", crime: "Uhalifu wa Dawa Haramu", reward: 3_000_000, color: "bg-amber-600" },
  { name: "Baraka Mcharo", crime: "Ubakaji na Kujeruhi", reward: 2_500_000, color: "bg-[#EF4444]/700" },
  { name: "Neema Malima", crime: "Uhujumu Uchumi na Ulaghai", reward: 10_000_000, color: "bg-[#1E3A8A]/600" },
  { name: "Thomas Ngowi", crime: "Wizi wa Gari — 3 Vehicles", reward: 1_500_000, color: "bg-[#FF9800]/600" },
  { name: "Farida Hassan", crime: "Mtandao wa Dawa Haramu", reward: 7_000_000, color: "bg-rose-600" },
  { name: "Gideon Mrema", crime: "Mauaji ya Kiusalama", reward: 8_000_000, color: "bg-[#EF4444]/800" },
];

const EVIDENCE = [
  { id: "EV-001", case: "CID-2025-0041", type: "Simu ya Mkononi", status: "Stored", location: "Mahakama Kuu — Sanduku #12" },
  { id: "EV-002", case: "CID-2025-0041", type: "Kompyuta", status: "In Analysis", location: "Lab ya Digital — PC-04" },
  { id: "EV-003", case: "CID-2025-0037", type: "Fedha ya Pesa", status: "Stored", location: "Benki ya NBC — Akiba #9931" },
  { id: "EV-004", case: "CID-2025-0037", type: "Vifaa vya Kiume", status: "Stored", location: "Mahakama Kuu — Sanduku #15" },
  { id: "EV-005", case: "CID-2025-0035", type: "Gari — Toyota Corolla", status: "Impounded", location: "Yard ya Polisi — Upo Mbagala" },
  { id: "EV-006", case: "CID-2025-0039", type: "Hati za Benki", status: "Under Review", location: "Ofisi ya CID — Kijitonyama" },
];

const INTERVIEWS = [
  { date: "2025-06-14 09:00", suspect: "Hassan Omary", case: "CID-2025-0041", officer: "IP. Juma Mwenda" },
  { date: "2025-06-14 11:30", suspect: "Juma Bakari", case: "CID-2025-0037", officer: "IP. Rashid Kimaro" },
  { date: "2025-06-14 14:00", suspect: "Zainab Maalim", case: "CID-2025-0029", officer: "IP. George Kapufi" },
  { date: "2025-06-15 09:00", suspect: "Rehema Saidi", case: "CID-2025-0033", officer: "IP. Peter Msigwa" },
  { date: "2025-06-15 10:30", suspect: "Amina Yusuf", case: "CID-2025-0039", officer: "SP. Aisha Mohammed" },
  { date: "2025-06-15 14:00", suspect: "Khalid Mnengu", case: "CID-2025-0031", officer: "SP. Halima Mzee" },
  { date: "2025-06-16 09:00", suspect: "Hassan Omary", case: "CID-2025-0041", officer: "IP. Juma Mwenda" },
  { date: "2025-06-16 11:00", suspect: "Juma Bakari", case: "CID-2025-0037", officer: "IP. Rashid Kimaro" },
];

const PF3_FORMS = [
  { id: "PF3-2025-0101", case: "CID-2025-0041", suspect: "Hassan Omary", date: "2025-06-12", status: "Submitted" },
  { id: "PF3-2025-0098", case: "CID-2025-0037", suspect: "Juma Bakari", date: "2025-06-08", status: "Approved" },
  { id: "PF3-2025-0095", case: "CID-2025-0033", suspect: "Rehema Saidi", date: "2025-06-02", status: "Pending" },
  { id: "PF3-2025-0092", case: "CID-2025-0031", suspect: "Khalid Mnengu", date: "2025-05-28", status: "Rejected" },
  { id: "PF3-2025-0089", case: "CID-2025-0029", suspect: "Zainab Maalim", date: "2025-05-25", status: "Submitted" },
  { id: "PF3-2025-0086", case: "CID-2025-0039", suspect: "Amina Yusuf", date: "2025-05-20", status: "Approved" },
];

const RECENT_ACTIVITY = [
  { time: "10 min ago", event: "Kesi mpya imerekodiwa — CID-2025-0041", icon: FolderOpen },
  { time: "25 min ago", event: "PF3 fomu imethibitishwa — PF3-2025-0098", icon: FileText },
  { time: "1 hr ago", event: "Mtuhumiwa amekamatwa — Hassan Omary", icon: UserX },
  { time: "2 hrs ago", event: "Ushahidi mpya — Kompyuta kutoka eneo la tukio", icon: FileSearch },
  { time: "3 hrs ago", event: "Mahojiano yamekamilika — Amina Yusuf", icon: MessageSquare },
  { time: "5 hrs ago", event: "Tangazo la mtafutwa — Idris Makene", icon: AlertTriangle },
];

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function formatTZS(amount: number): string {
  return `TZS ${amount.toLocaleString("en-TZ")}`;
}

function statusColor(status: string) {
  switch (status) {
    case "Active":
    case "Stored":
    case "Submitted":
    case "Held":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 ";
    case "Under Review":
    case "In Analysis":
    case "Pending":
    case "On Bail":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 ";
    case "Closed":
    case "Approved":
    case "Released":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400";
    case "Impounded":
    case "Wanted":
      return "bg-[#EF4444]/15 text-[#EF4444]700 dark:bg-[#EF4444]/900/40 dark:text-[#EF4444]400";
    case "Rejected":
      return "bg-[#EF4444]/15 text-[#EF4444] dark:bg-[#EF4444]/900/40 dark:text-[#EF4444]400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-400";
  }
}

function riskColor(risk: string) {
  switch (risk) {
    case "High":
      return "bg-[#EF4444]/15 text-[#EF4444]700 dark:bg-[#EF4444]/900/40 dark:text-[#EF4444]400";
    case "Medium":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 ";
    case "Low":
      return "bg-[#10B981]/15 text-[#10B981]700 dark:bg-[#10B981]/900/40 dark:text-[#10B981]400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-400";
  }
}

// ---------------------------------------------------------------------------
// Inline screen components
// ---------------------------------------------------------------------------

function CidDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-police">Dashibodi ya CID</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Kesi Zilizo Hai", value: "47", icon: FolderOpen, color: "bg-[#2196F3]" },
          { label: "Wanaotafutwa", value: "12", icon: AlertTriangle, color: "bg-[#EF4444]" },
          { label: "Mahojiano Yasubiri", value: "8", icon: MessageSquare, color: "bg-[#FF9800]" },
          { label: "Vitu vya Ushahidi", value: "156", icon: FileSearch, color: "bg-[#10B981]" },
        ].map((s) => (
          <Card key={s.label} className="bg-police-card border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.color} text-white`}>
                  <s.icon size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-police">{s.value}</p>
                  <p className="text-[12px] text-police-faint">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-police">Haraka / Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Tafuta Raia", icon: Users, desc: "Kwa jina au NIDA" },
            { label: "Tafuta Gari", icon: Car, desc: "Kwa namba ya plati" },
            { label: "Tafuta Kesi", icon: FolderOpen, desc: "Kwa namba ya kesi" },
            { label: "Tafuta Mtafutwa", icon: AlertTriangle, desc: "Orodha ya wanaotafutwa" },
          ].map((a) => (
            <button
              key={a.label}
              className="flex flex-col items-center gap-2 rounded-xl bg-police-card p-4 text-center transition hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2196F3]/10 text-[#2196F3]">
                <a.icon size={20} />
              </div>
              <p className="text-[13px] font-semibold text-police">{a.label}</p>
              <p className="text-[11px] text-police-faint">{a.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-police">Shughuli za Karibuni</h3>
        <Card className="bg-police-card border-none shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y divide-police-muted">
              {RECENT_ACTIVITY.map((a, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2196F3]/10 text-[#2196F3]">
                    <a.icon size={15} />
                  </div>
                  <p className="flex-1 text-[13px] text-police">{a.event}</p>
                  <span className="shrink-0 text-[11px] text-police-faint">{a.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Live data from Supabase

const CITIZENS_DB = [
  { name: "Juma Mwenda", nida: "1234567890123", phone: "+255 713 456 789", region: "Dar es Salaam", status: "Clean" },
  { name: "Aisha Mohammed", nida: "2345678901234", phone: "+255 714 567 890", region: "Dodoma", status: "Suspect" },
  { name: "Rashid Kimaro", nida: "3456789012345", phone: "+255 715 678 901", region: "Mwanza", status: "Clean" },
  { name: "Fatma Hassan", nida: "4567890123456", phone: "+255 716 789 012", region: "Arusha", status: "Witness" },
  { name: "Hassan Omary", nida: "5678901234567", phone: "+255 717 890 123", region: "Dar es Salaam", status: "Suspect" },
  { name: "Neema Malima", nida: "6789012345678", phone: "+255 718 901 234", region: "Mbeya", status: "Wanted" },
  { name: "Salma Juma", nida: "7890123456789", phone: "+255 719 012 345", region: "Tanga", status: "Suspect" },
  { name: "Baraka Mcharo", nida: "8901234567890", phone: "+255 720 123 456", region: "Kilimanjaro", status: "Wanted" },
  { name: "Idris Makene", nida: "9012345678901", phone: "+255 721 234 567", region: "Zanzibar", status: "Wanted" },
  { name: "Thomas Ngowi", nida: "0123456789012", phone: "+255 722 345 678", region: "Iringa", status: "Clean" },
  { name: "Rehema Saidi", nida: "1111111111111", phone: "+255 723 456 789", region: "Morogoro", status: "Clean" },
  { name: "Khalid Mnengu", nida: "2222222222222", phone: "+255 724 567 890", region: "Dar es Salaam", status: "Suspect" },
];

const VEHICLES_DB = [
  { plate: "T 123 ABC", model: "Toyota Corolla 2019", owner: "Juma Mwenda", status: "Clean" },
  { plate: "T 456 DEF", model: "Honda CR-V 2021", owner: "Aisha Mohammed", status: "Stolen" },
  { plate: "T 789 GHI", model: "Nissan Patrol 2020", owner: "Rashid Kimaro", status: "Clean" },
  { plate: "T 111 JKL", model: "Toyota Hilux 2022", owner: "Hassan Omary", status: "Flagged" },
  { plate: "T 222 MNO", model: "Mitsubishi Pajero 2018", owner: "Neema Malima", status: "Stolen" },
  { plate: "T 333 PQR", model: "Toyota Land Cruiser 2023", owner: "Idris Makene", status: "Wanted" },
  { plate: "T 444 STU", model: "Suzuki Vitara 2020", owner: "Fatma Hassan", status: "Clean" },
  { plate: "T 555 VWX", model: "Ford Ranger 2021", owner: "Thomas Ngowi", status: "Clean" },
];

const OFFICERS_DB = [
  { name: "IP. Juma Mwenda", num: "TZ-4451", rank: "Inspector", station: "Central Dar" },
  { name: "SP. Aisha Mohammed", num: "TZ-3302", rank: "Superintendent", station: "Dodoma HQ" },
  { name: "IP. Rashid Kimaro", num: "TZ-4488", rank: "Inspector", station: "Mwanza CID" },
  { name: "ASP. Fatma Hassan", num: "TZ-2201", rank: "Asst. Supt.", station: "Arusha CID" },
  { name: "IP. Peter Msigwa", num: "TZ-4499", rank: "Inspector", station: "Mbeya CID" },
  { name: "SP. Halima Mzee", num: "TZ-3310", rank: "Superintendent", station: "Tanga CID" },
  { name: "IP. George Kapufi", num: "TZ-4460", rank: "Inspector", station: "Zanzibar CID" },
  { name: "ASP. Joyce Lyimo", num: "TZ-2205", rank: "Asst. Supt.", station: "Kilimanjaro" },
];

const ACCIDENTS_DB = [
  { id: "ACC-2025-0141", date: "2025-06-14", location: "Morogoro Rd / Samora", type: "Meli-Meli", casualties: 2, status: "Open" },
  { id: "ACC-2025-0139", date: "2025-06-12", location: "Nelson Mandela / Ali Hassan Mwinyi", type: "Baiskeli na Gari", casualties: 1, status: "Closed" },
  { id: "ACC-2025-0137", date: "2025-06-10", location: "Bagamoyo Rd, Mbagala", type: "Gari 2", casualties: 0, status: "Under Review" },
  { id: "ACC-2025-0135", date: "2025-06-08", location: "Uhuru Rd / Ohio St", type: "Meli na Baiskeli", casualties: 3, status: "Open" },
  { id: "ACC-2025-0133", date: "2025-06-05", location: "Nyerere Rd / Kivukoni", type: "Gari 3", casualties: 1, status: "Closed" },
];

function filterData<T>(data: T[], query: string, keys: (keyof T)[]): T[] {
  if (!query.trim()) return data;
  const q = query.toLowerCase();
  return data.filter((item) =>
    keys.some((key) => String(item[key]).toLowerCase().includes(q))
  );
}

// ---- Intel Console --------------------------------------------------------

function CidIntelConsole() {
  const [universalQuery, setUniversalQuery] = useState("");
  const [tabQueries, setTabQueries] = useState<Record<string, string>>({});

  const getTabQuery = (tab: string) => tabQueries[tab] ?? "";
  const setTabQuery = (tab: string, val: string) =>
    setTabQueries((prev) => ({ ...prev, [tab]: val }));

  // Determine effective query: prefer tab-specific, fall back to universal
  const effectiveQuery = (tab: string) => getTabQuery(tab) || universalQuery;

  const TABS_DATA = [
    { value: "citizen", label: "Raia", placeholder: "Ingiza jina au NIDA..." },
    { value: "vehicle", label: "Gari", placeholder: "Ingiza namba ya plati..." },
    { value: "officer", label: "Afisa", placeholder: "Ingiza jina au namba ya afisa..." },
    { value: "case", label: "Kesi", placeholder: "Ingiza namba ya kesi..." },
    { value: "wanted", label: "Mtafutwa", placeholder: "Ingiza jina la mtafutwa..." },
    { value: "pf3", label: "PF3", placeholder: "Ingiza namba ya PF3..." },
    { value: "accident", label: "Ajali", placeholder: "Ingiza namba ya ajali..." },
  ] as const;

  // Pre-filtered data per tab
  const filteredCitizens = filterData(CITIZENS_DB, effectiveQuery("citizen"), ["name", "nida", "phone", "region"]);
  const filteredVehicles = filterData(VEHICLES_DB, effectiveQuery("vehicle"), ["plate", "model", "owner"]);
  const filteredOfficers = filterData(OFFICERS_DB, effectiveQuery("officer"), ["name", "num", "rank", "station"]);
  const filteredCases = filterData(CASES, effectiveQuery("case"), ["id", "type", "officer", "region"]);
  const filteredWanted = filterData(WANTED_PERSONS, effectiveQuery("wanted"), ["name", "crime"]);
  const filteredPf3 = filterData(PF3_FORMS, effectiveQuery("pf3"), ["id", "case", "suspect"]);
  const filteredAccidents = filterData(ACCIDENTS_DB, effectiveQuery("accident"), ["id", "location", "type"]);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-police">Konze la Upelelezi / Intel Console</h2>

      {/* Universal search */}
      <div className="flex items-center gap-3 rounded-xl bg-police-card px-4 py-3 shadow-sm">
        <Search size={20} className="text-police-faint" />
        <input
          value={universalQuery}
          onChange={(e) => setUniversalQuery(e.target.value)}
          placeholder="Utafutaji wa kimataifa — andika neno lolote..."
          className="h-9 flex-1 bg-transparent text-[14px] text-police placeholder:text-police-faint focus:outline-none"
        />
        {universalQuery && (
          <button onClick={() => setUniversalQuery("")} className="text-[11px] text-police-faint hover:text-police">
            Futa
          </button>
        )}
      </div>

      <Tabs defaultValue="citizen">
        <TabsList className="flex-wrap">
          {TABS_DATA.map((t) => {
            const count = t.value === "citizen" ? filteredCitizens.length
              : t.value === "vehicle" ? filteredVehicles.length
              : t.value === "officer" ? filteredOfficers.length
              : t.value === "case" ? filteredCases.length
              : t.value === "wanted" ? filteredWanted.length
              : t.value === "pf3" ? filteredPf3.length
              : filteredAccidents.length;
            const hasFilter = effectiveQuery(t.value).length > 0;
            return (
              <TabsTrigger key={t.value} value={t.value} className="text-[12px]">
                {t.label}
                {hasFilter && (
                  <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500/20 px-1 text-[10px] font-bold text-blue-400">
                    {count}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {TABS_DATA.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            <Card className="bg-police-card border-none shadow-sm">
              <CardContent className="p-4">
                <div className="mb-4 flex items-center gap-3 rounded-lg bg-police-muted px-3 py-2.5">
                  <Search size={16} className="text-police-faint" />
                  <input
                    value={getTabQuery(t.value)}
                    onChange={(e) => setTabQuery(t.value, e.target.value)}
                    placeholder={t.placeholder}
                    className="h-8 flex-1 bg-transparent text-[13px] text-police placeholder:text-police-faint focus:outline-none"
                  />
                </div>

                {t.value === "citizen" && (
                  filteredCitizens.length === 0 ? (
                    <EmptyState msg="Hakuna raia waliopatikana" />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-police-muted">
                          <TableHead className="text-police-faint">Jina</TableHead>
                          <TableHead className="text-police-faint">NIDA</TableHead>
                          <TableHead className="text-police-faint">Simu</TableHead>
                          <TableHead className="text-police-faint">Mkoa</TableHead>
                          <TableHead className="text-police-faint">Hali</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCitizens.map((r) => (
                          <TableRow key={r.nida} className="border-police-muted hover:bg-police-muted/50">
                            <TableCell className="font-medium text-police">{r.name}</TableCell>
                            <TableCell className="font-mono text-[12px] text-police-faint">{r.nida}</TableCell>
                            <TableCell className="text-police-faint">{r.phone}</TableCell>
                            <TableCell className="text-police-faint">{r.region}</TableCell>
                            <TableCell>
                              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                r.status === "Clean" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 "
                                : r.status === "Suspect" ? "bg-[#EF4444]/15 text-[#EF4444]700 dark:bg-[#EF4444]/900/40 dark:text-[#EF4444]400"
                                : r.status === "Wanted" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                              }`}>
                                {r.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )
                )}

                {t.value === "vehicle" && (
                  filteredVehicles.length === 0 ? (
                    <EmptyState msg="Hakuna gari lililopatikana" />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-police-muted">
                          <TableHead className="text-police-faint">Plati</TableHead>
                          <TableHead className="text-police-faint">Gari</TableHead>
                          <TableHead className="text-police-faint">Mmiliki</TableHead>
                          <TableHead className="text-police-faint">Hali</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredVehicles.map((v) => (
                          <TableRow key={v.plate} className="border-police-muted hover:bg-police-muted/50">
                            <TableCell className="font-mono text-[13px] font-semibold text-police">{v.plate}</TableCell>
                            <TableCell className="text-police-faint">{v.model}</TableCell>
                            <TableCell className="text-police-faint">{v.owner}</TableCell>
                            <TableCell>
                              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                v.status === "Clean" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 "
                                : v.status === "Stolen" ? "bg-[#EF4444]/15 text-[#EF4444]700 dark:bg-[#EF4444]/900/40 dark:text-[#EF4444]400"
                                : v.status === "Wanted" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 "
                              }`}>
                                {v.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )
                )}

                {t.value === "officer" && (
                  filteredOfficers.length === 0 ? (
                    <EmptyState msg="Hakuna afisa aliyepatikana" />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-police-muted">
                          <TableHead className="text-police-faint">Jina</TableHead>
                          <TableHead className="text-police-faint">Namba</TableHead>
                          <TableHead className="text-police-faint">Daraja</TableHead>
                          <TableHead className="text-police-faint">Kituo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOfficers.map((o) => (
                          <TableRow key={o.num} className="border-police-muted hover:bg-police-muted/50">
                            <TableCell className="font-medium text-police">{o.name}</TableCell>
                            <TableCell className="font-mono text-[12px] text-police-faint">{o.num}</TableCell>
                            <TableCell className="text-police-faint">{o.rank}</TableCell>
                            <TableCell className="text-police-faint">{o.station}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )
                )}

                {t.value === "case" && (
                  filteredCases.length === 0 ? (
                    <EmptyState msg="Hakuna kesi iliyopatikana" />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-police-muted">
                          <TableHead className="text-police-faint">Case ID</TableHead>
                          <TableHead className="text-police-faint">Aina</TableHead>
                          <TableHead className="text-police-faint">Hali</TableHead>
                          <TableHead className="text-police-faint">Tarehe</TableHead>
                          <TableHead className="text-police-faint">Afisa</TableHead>
                          <TableHead className="text-police-faint">Mkoa</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCases.map((c) => (
                          <TableRow key={c.id} className="border-police-muted hover:bg-police-muted/50">
                            <TableCell className="font-mono text-[12px] font-semibold text-police">{c.id}</TableCell>
                            <TableCell className="text-police">{c.type}</TableCell>
                            <TableCell><span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusColor(c.status)}`}>{c.status}</span></TableCell>
                            <TableCell className="text-police-faint">{c.date}</TableCell>
                            <TableCell className="text-police">{c.officer}</TableCell>
                            <TableCell className="text-police-faint">{c.region}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )
                )}

                {t.value === "wanted" && (
                  filteredWanted.length === 0 ? (
                    <EmptyState msg="Hakuna mtu anayetafutwa kwa jina hili" />
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredWanted.map((w) => (
                        <div key={w.name} className={`rounded-xl ${w.color} p-4 text-white shadow-lg`}>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold">{w.name}</p>
                            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">
                              TZS {w.reward.toLocaleString()}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-white/80">{w.crime}</p>
                          <p className="mt-2 flex items-center gap-1 text-[11px] text-white/60">
                            <Banknote size={12} /> Tuzo: {formatTZS(w.reward)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {t.value === "pf3" && (
                  filteredPf3.length === 0 ? (
                    <EmptyState msg="Hakuna fomu ya PF3 iliyopatikana" />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-police-muted">
                          <TableHead className="text-police-faint">PF3 ID</TableHead>
                          <TableHead className="text-police-faint">Kesi</TableHead>
                          <TableHead className="text-police-faint">Mtuhumiwa</TableHead>
                          <TableHead className="text-police-faint">Tarehe</TableHead>
                          <TableHead className="text-police-faint">Hali</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPf3.map((p) => (
                          <TableRow key={p.id} className="border-police-muted hover:bg-police-muted/50">
                            <TableCell className="font-mono text-[12px] font-semibold text-police">{p.id}</TableCell>
                            <TableCell className="text-police-faint">{p.case}</TableCell>
                            <TableCell className="text-police">{p.suspect}</TableCell>
                            <TableCell className="text-police-faint">{p.date}</TableCell>
                            <TableCell><span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusColor(p.status)}`}>{p.status}</span></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )
                )}

                {t.value === "accident" && (
                  filteredAccidents.length === 0 ? (
                    <EmptyState msg="Hakuna ajali iliyopatikana" />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-police-muted">
                          <TableHead className="text-police-faint">ID</TableHead>
                          <TableHead className="text-police-faint">Tarehe</TableHead>
                          <TableHead className="text-police-faint">Eneo</TableHead>
                          <TableHead className="text-police-faint">Aina</TableHead>
                          <TableHead className="text-police-faint">Vifo</TableHead>
                          <TableHead className="text-police-faint">Hali</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAccidents.map((a) => (
                          <TableRow key={a.id} className="border-police-muted hover:bg-police-muted/50">
                            <TableCell className="font-mono text-[12px] font-semibold text-police">{a.id}</TableCell>
                            <TableCell className="text-police-faint">{a.date}</TableCell>
                            <TableCell className="text-police text-[12px]">{a.location}</TableCell>
                            <TableCell className="text-police-faint">{a.type}</TableCell>
                            <TableCell className={a.casualties > 0 ? "font-bold text-[#EF4444]" : "text-police-faint"}>{a.casualties}</TableCell>
                            <TableCell><span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusColor(a.status)}`}>{a.status}</span></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-police-faint">
      <Search size={40} className="mb-3 opacity-30" />
      <p className="text-[13px]">{msg}</p>
    </div>
  );
}

// ---- Cases ----------------------------------------------------------------

function CidCases() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-police">Kesi / Cases</h2>
      <Card className="bg-police-card border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-police-muted">
                <TableHead className="text-police-faint">Case ID</TableHead>
                <TableHead className="text-police-faint">Aina</TableHead>
                <TableHead className="text-police-faint">Hali</TableHead>
                <TableHead className="text-police-faint">Tarehe</TableHead>
                <TableHead className="text-police-faint">Afisa</TableHead>
                <TableHead className="text-police-faint">Mkoa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CASES.map((c) => (
                <TableRow key={c.id} className="border-police-muted">
                  <TableCell className="font-mono text-[13px] font-semibold text-police">{c.id}</TableCell>
                  <TableCell className="text-police">{c.type}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusColor(c.status)}`}>
                      {c.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-police-faint">{c.date}</TableCell>
                  <TableCell className="text-police">{c.officer}</TableCell>
                  <TableCell className="text-police-faint">{c.region}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ---- Suspects -------------------------------------------------------------

function CidSuspects() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-police">Watuhumiwa / Suspects</h2>
      <Card className="bg-police-card border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-police-muted">
                <TableHead className="text-police-faint">Jina</TableHead>
                <TableHead className="text-police-faint">NIDA</TableHead>
                <TableHead className="text-police-faint">Kesi</TableHead>
                <TableHead className="text-police-faint">Hali</TableHead>
                <TableHead className="text-police-faint">Hatari</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SUSPECTS.map((s) => (
                <TableRow key={s.nida} className="border-police-muted">
                  <TableCell className="font-medium text-police">{s.name}</TableCell>
                  <TableCell className="font-mono text-[12px] text-police-faint">{s.nida}</TableCell>
                  <TableCell className="font-mono text-[13px] text-police">{s.case}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusColor(s.status)}`}>
                      {s.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${riskColor(s.risk)}`}>
                      {s.risk}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ---- Wanted Persons -------------------------------------------------------

function CidWanted() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-police">Wanaotafutwa / Wanted Persons</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {WANTED_PERSONS.map((w) => (
          <Card key={w.name} className="overflow-hidden bg-police-card border-none shadow-sm">
            <div className="flex items-start gap-4 p-4">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${w.color} text-lg font-bold text-white`}>
                {w.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-police">{w.name}</p>
                <p className="mt-1 text-[12px] text-police-faint">{w.crime}</p>
                <div className="mt-3 flex items-center gap-1.5">
                  <Banknote size={14} className="text-[#10B981]" />
                  <span className="text-[13px] font-semibold text-[#10B981]">{formatTZS(w.reward)}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---- Evidence -------------------------------------------------------------

function CidEvidence() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-police">Ushahidi / Evidence</h2>
      <Card className="bg-police-card border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-police-muted">
                <TableHead className="text-police-faint">ID</TableHead>
                <TableHead className="text-police-faint">Kesi</TableHead>
                <TableHead className="text-police-faint">Aina</TableHead>
                <TableHead className="text-police-faint">Hali</TableHead>
                <TableHead className="text-police-faint">Mahali Pa Kuweka</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {EVIDENCE.map((e) => (
                <TableRow key={e.id} className="border-police-muted">
                  <TableCell className="font-mono text-[13px] font-semibold text-police">{e.id}</TableCell>
                  <TableCell className="font-mono text-[13px] text-police">{e.case}</TableCell>
                  <TableCell className="text-police">{e.type}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusColor(e.status)}`}>
                      {e.status}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-[12px] text-police-faint">{e.location}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ---- Interviews -----------------------------------------------------------

function CidInterviews() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-police">Mahojiano / Interviews</h2>
      <Card className="bg-police-card border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-police-muted">
                <TableHead className="text-police-faint">Tarehe</TableHead>
                <TableHead className="text-police-faint">Mtuhumiwa</TableHead>
                <TableHead className="text-police-faint">Kesi</TableHead>
                <TableHead className="text-police-faint">Afisa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {INTERVIEWS.map((i, idx) => (
                <TableRow key={idx} className="border-police-muted">
                  <TableCell className="text-[13px] text-police">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-police-faint" />
                      {i.date}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-police">{i.suspect}</TableCell>
                  <TableCell className="font-mono text-[13px] text-police">{i.case}</TableCell>
                  <TableCell className="text-police-faint">{i.officer}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ---- PF3 Forms ------------------------------------------------------------

function CidPf3() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-police">PF3 Forms</h2>
      <Card className="bg-police-card border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-police-muted">
                <TableHead className="text-police-faint">PF3 ID</TableHead>
                <TableHead className="text-police-faint">Kesi</TableHead>
                <TableHead className="text-police-faint">Mtuhumiwa</TableHead>
                <TableHead className="text-police-faint">Tarehe</TableHead>
                <TableHead className="text-police-faint">Hali</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PF3_FORMS.map((p) => (
                <TableRow key={p.id} className="border-police-muted">
                  <TableCell className="font-mono text-[13px] font-semibold text-police">{p.id}</TableCell>
                  <TableCell className="font-mono text-[13px] text-police">{p.case}</TableCell>
                  <TableCell className="font-medium text-police">{p.suspect}</TableCell>
                  <TableCell className="text-police-faint">{p.date}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusColor(p.status)}`}>
                      {p.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ---- Reports --------------------------------------------------------------

function CidReports() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-police">Ripoti / Reports</h2>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Jumla ya Kesi", value: "142", icon: FolderOpen, color: "bg-[#2196F3]" },
          { label: "Zilizokamilika", value: "89", icon: Star, color: "bg-[#10B981]" },
          { label: "Zinazoendelea", value: "47", icon: Clock, color: "bg-[#FF9800]" },
          { label: "Wanaotafutwa", value: "12", icon: Eye, color: "bg-[#EF4444]" },
        ].map((s) => (
          <Card key={s.label} className="bg-police-card border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.color} text-white`}>
                  <s.icon size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-police">{s.value}</p>
                  <p className="text-[12px] text-police-faint">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent reports */}
      <h3 className="text-sm font-semibold text-police">Ripoti za Karibuni</h3>
      <Card className="bg-police-card border-none shadow-sm">
        <CardContent className="p-0">
          <div className="divide-y divide-police-muted">
            {[
              { name: "Ripoti ya Kesi Zilizo Hai — Juni 2025", date: "2025-06-13", type: "Monthly" },
              { name: "Orodha ya Wanaotafutwa — Wilaya ya Kinondoni", date: "2025-06-11", type: "Special" },
              { name: "Ushahidi — Kesi CID-2025-0037", date: "2025-06-09", type: "Case" },
              { name: "Ripoti ya Mahojiano — Wiki ya 23", date: "2025-06-08", type: "Weekly" },
              { name: "Tathmini ya Hatari — Q2 2025", date: "2025-06-01", type: "Quarterly" },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2196F3]/10 text-[#2196F3]">
                  <FileText size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-police">{r.name}</p>
                  <p className="text-[11px] text-police-faint">{r.date}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {r.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---- Settings -------------------------------------------------------------

function CidSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-police">Mipangilio / Settings</h2>

      {/* General */}
      <Card className="bg-police-card border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-[15px] text-police">
            <Globe size={18} className="text-[#2196F3]" />
            General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">Lugha / Language</p>
              <p className="text-[12px] text-police-faint">Swahili (Kiswahili)</p>
            </div>
            <Badge variant="outline">Swahili</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">Mkoa / Region</p>
              <p className="text-[12px] text-police-faint">Dar es Salaam</p>
            </div>
            <Badge variant="outline">Dar es Salaam</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">Eneo la Upelelezi</p>
              <p className="text-[12px] text-police-faint">Central CID Office</p>
            </div>
            <Badge variant="outline">Central</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-police-card border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-[15px] text-police">
            <BellRing size={18} className="text-[#FF9800]" />
            Arifa / Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Arifa za kesi mpya", desc: "Pokea arifa kila kesi inaporekodiwa" },
            { label: "Arifa za wanaotafutwa", desc: "Tangazo la mtu anayetafutwa" },
            { label: "Arifa za PF3", desc: "PF3 fomu zilizothibitishwa au kukanushwa" },
            { label: "Kumbukumbu ya mahojiano", desc: "Kukukumbusha mahojiano yanayokuja" },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-police">{n.label}</p>
                <p className="text-[12px] text-police-faint">{n.desc}</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-police-card border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-[15px] text-police">
            <Lock size={18} className="text-[#EF4444]" />
            Usalama / Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Uthibitishaji wa mtandao wa 2 (2FA)", desc: "Ongeza usalama kwa kutumia simu yako" },
            { label: "Kuangalia kikao / Session timeout", desc: "Orodhesha muda kabla ya kufungwa" },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-police">{s.label}</p>
                <p className="text-[12px] text-police-faint">{s.desc}</p>
              </div>
              <Switch />
            </div>
          ))}
          <button className="mt-2 flex items-center gap-2 rounded-lg bg-[#2196F3] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#2196F3]/90">
            <Save size={16} />
            Hifadhi Mabadiliko
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Screen renderer
// ---------------------------------------------------------------------------

function renderCidScreen(screen: CidScreen) {
  switch (screen) {
    case "dashboard":
      return <CidDashboard />;
    case "intel":
      return <CidIntelConsole />;
    case "cases":
      return <CidCases />;
    case "suspects":
      return <CidSuspects />;
    case "wanted":
      return <CidWanted />;
    case "evidence":
      return <CidEvidence />;
    case "interviews":
      return <CidInterviews />;
    case "pf3":
      return <CidPf3 />;
    case "reports":
      return <CidReports />;
    case "settings":
      return <CidSettings />;
    default:
      return <CidDashboard />;
  }
}

// ---------------------------------------------------------------------------
// Main shell
// ---------------------------------------------------------------------------

export function CidShell() {
  const { logout } = usePoliceStore();
  const [cidScreen, setCidScreen] = useState<CidScreen>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex min-h-screen bg-police">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-[#0d1b3d] transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 border-b border-white/10 p-4">
            <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-[#2196F3]">
              <Image src="/police-logo.png" alt="TPF" width={40} height={40} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-white">TZ Police</p>
              <p className="text-[10px] text-white/60">CID / Mpelelezi</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="ml-auto text-white/60 lg:hidden">
              <X size={20} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {CID_NAV.map((item) => {
              const active = cidScreen === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCidScreen(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                    active
                      ? "bg-[#2196F3] text-white shadow-lg shadow-[#2196F3]/30"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span className="flex-1 text-[13px] font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User */}
          <div className="border-t border-white/10 p-3">
            <div className="flex items-center gap-3 rounded-lg bg-white/5 p-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2196F3] text-[12px] font-bold text-white">
                {CID_USER.shortName
                  .split(" ")
                  .filter((_, i) => i === 0 || i === 2)
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-bold text-white">{CID_USER.shortName}</p>
                <p className="truncate text-[10px] text-white/50">{CID_USER.rank}</p>
              </div>
              <button onClick={logout} className="text-white/50 hover:text-white">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-police bg-police-card px-4 py-3">
          <button onClick={() => setSidebarOpen(true)} className="text-police lg:hidden">
            <Menu size={24} />
          </button>

          {/* Search */}
          <div className="hidden flex-1 max-w-md items-center gap-2 rounded-xl bg-police-muted px-3 sm:flex">
            <Search size={16} className="text-police-faint" />
            <input
              placeholder="Tafuta kesi, watuhumiwa, ushahidi..."
              className="h-9 flex-1 bg-transparent text-[13px] text-police placeholder:text-police-faint focus:outline-none"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-police-muted text-police-navy"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-police-muted text-police">
              <Bell size={18} />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[9px] font-bold text-white">
                7
              </span>
            </button>

            {/* User chip */}
            <div className="flex items-center gap-2 rounded-lg bg-police-muted px-2.5 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2196F3] text-[11px] font-bold text-white">
                {CID_USER.shortName
                  .split(" ")
                  .filter((_, i) => i === 0 || i === 2)
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="hidden sm:block">
                <p className="text-[12px] font-bold leading-tight text-police">{CID_USER.shortName}</p>
                <p className="text-[10px] leading-tight text-police-faint">{CID_USER.rank}</p>
              </div>
              <ChevronDown size={14} className="text-police-faint" />
            </div>
          </div>
        </header>

        {/* Screen content */}
        <main key={cidScreen} className="police-screen-enter flex-1 overflow-y-auto p-4 lg:p-6">
          {renderCidScreen(cidScreen)}
        </main>
      </div>
    </div>
  );
}