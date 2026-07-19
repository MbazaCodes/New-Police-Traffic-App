"use client";

import { useState } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  FileCheck,
  FolderTree,
  Download,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  Upload,
  Clock,
  File,
  FileSpreadsheet,
  Eye,
  CheckCircle2,
  FolderOpen,
  Folder,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useTheme } from "next-themes";
import { usePoliceStore } from "@/store/police-store";

/* ------------------------------------------------------------------ */
/*  ClerkScreen type                                                  */
/* ------------------------------------------------------------------ */
export type ClerkScreen =
  | "dashboard"
  | "records"
  | "documents"
  | "file-management"
  | "exports"
  | "reports"
  | "settings";

const CLERK_USER = {
  shortName: "Insp. Fatma Hassan",
  rank: "Inspector",
  initials: "FH",
};

/* ------------------------------------------------------------------ */
/*  Nav items                                                         */
/* ------------------------------------------------------------------ */
const CLERK_NAV: { id: ClerkScreen; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
  { id: "dashboard", label: "Dashibodi", icon: LayoutDashboard },
  { id: "records", label: "Rekodi", icon: FileText },
  { id: "documents", label: "Hatika", icon: FileCheck },
  { id: "file-management", label: "Usimamizi wa Faili", icon: FolderTree },
  { id: "exports", label: "Uhamishaji", icon: Download },
  { id: "reports", label: "Ripoti", icon: BarChart3 },
  { id: "settings", label: "Mipangilio", icon: Settings },
];

/* ================================================================== */
/*  Screen Components                                                 */
/* ================================================================== */

/* ---- ClerkDashboard ---- */
function ClerkDashboard() {
  const stats = [
    { label: "Total Records", value: "2,847", icon: FileText, color: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
    { label: "Pending Review", value: "23", icon: Clock, color: "bg-[#FF9800]/15 text-[#FF9800] " },
    { label: "Filed Today", value: "45", icon: CheckCircle2, color: "bg-[#10B981]/15 text-[#10B981] " },
    { label: "Exports This Week", value: "12", icon: Download, color: "bg-[#1E3A8A]/15 text-[#1E3A8A] dark:" },
  ];

  const recentActivity = [
    { action: "Record TPF-2024-8842 filed", user: "PC. Mwangi", time: "2 min ago", type: "filed" },
    { action: "Document DOC-3091 uploaded", user: "Cpl. Juma", time: "15 min ago", type: "upload" },
    { action: "Export #EXP-442 completed", user: "System", time: "32 min ago", type: "export" },
    { action: "Record TPF-2024-8841 reviewed", user: "Insp. Hassan", time: "1 hr ago", type: "review" },
    { action: "Case file C-2024-0561 updated", user: "Sgt. Kimaro", time: "2 hrs ago", type: "update" },
    { action: "Record TPF-2024-8840 archived", user: "PC. Rashid", time: "3 hrs ago", type: "archive" },
  ];

  const typeColor: Record<string, string> = {
    filed: "bg-[#10B981]/15 text-[#10B981] ",
    upload: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    export: "bg-[#1E3A8A]/15 text-[#1E3A8A] dark:",
    review: "bg-[#FF9800]/15 text-[#FF9800] ",
    update: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
    archive: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-police-navy">Dashibodi / Dashboard</h2>
        <p className="text-sm text-police-faint">Karani Records Management Overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl bg-police-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-police-faint">{s.label}</p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.color}`}>
                  <Icon size={16} />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-police-navy">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl bg-police-card p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-police-navy">Recent Activity / Shughuli za Hivi Karibuni</h3>
        <div className="space-y-3">
          {recentActivity.map((a, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg bg-police-muted/50 px-3 py-2.5">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold uppercase ${typeColor[a.type] ?? "bg-slate-100 text-slate-500"}`}>
                {a.type[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-police">{a.action}</p>
                <p className="text-[11px] text-police-faint">{a.user} &middot; {a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- ClerkRecords ---- */
function ClerkRecords() {
  const records = [
    { id: "TPF-2024-8842", type: "Case File", status: "Filed", date: "2024-12-15", officer: "PC. Mwangi", region: "Dar es Salaam" },
    { id: "TPF-2024-8841", type: "Incident", status: "Under Review", date: "2024-12-15", officer: "Sgt. Kimaro", region: "Dodoma" },
    { id: "TPF-2024-8840", type: "Citation", status: "Archived", date: "2024-12-14", officer: "Cpl. Juma", region: "Arusha" },
    { id: "TPF-2024-8839", type: "Case File", status: "Filed", date: "2024-12-14", officer: "PC. Rashid", region: "Mwanza" },
    { id: "TPF-2024-8838", type: "Arrest", status: "Pending", date: "2024-12-14", officer: "PC. Omary", region: "Mbeya" },
    { id: "TPF-2024-8837", type: "Incident", status: "Filed", date: "2024-12-13", officer: "Sgt. Massawe", region: "Tanga" },
    { id: "TPF-2024-8836", type: "Case File", status: "Under Review", date: "2024-12-13", officer: "PC. Saidi", region: "Zanzibar" },
    { id: "TPF-2024-8835", type: "Citation", status: "Filed", date: "2024-12-12", officer: "Cpl. Hamisi", region: "Morogoro" },
  ];

  const statusStyle: Record<string, string> = {
    Filed: "bg-[#10B981]/15 text-[#10B981] ",
    "Under Review": "bg-[#FF9800]/15 text-[#FF9800] ",
    Archived: "bg-slate-500/15 text-slate-500",
    Pending: "bg-[#EF4444]/100/15 text-[#EF4444] dark:text-[#EF4444]400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-police-navy">Rekodi / Records</h2>
          <p className="text-sm text-police-faint">Manage and review police records</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-police-muted px-3 py-1.5">
          <Filter size={14} className="text-police-faint" />
          <span className="text-xs text-police-faint">Filter</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl bg-police-card shadow-sm">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-police-muted text-police-faint">
              <th className="px-4 py-3 font-medium">Record ID</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Officer</th>
              <th className="px-4 py-3 font-medium">Region</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-police-muted/50 last:border-b-0 hover:bg-police-muted/30">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-police">{r.id}</td>
                <td className="px-4 py-3 text-police">{r.type}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusStyle[r.status] ?? ""}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-police-faint">{r.date}</td>
                <td className="px-4 py-3 text-police">{r.officer}</td>
                <td className="px-4 py-3 text-police-faint">{r.region}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---- ClerkDocuments ---- */
function ClerkDocuments() {
  const documents = [
    { name: "Case Brief - TPF-2024-8842", type: "PDF", size: "2.4 MB", date: "2024-12-15", category: "Case Files" },
    { name: "Witness Statement - Mwangi", type: "DOC", size: "1.1 MB", date: "2024-12-15", category: "Statements" },
    { name: "Incident Report - Dodoma", type: "PDF", size: "3.8 MB", date: "2024-12-14", category: "Reports" },
    { name: "Evidence Log - Arusha", type: "PDF", size: "890 KB", date: "2024-12-14", category: "Evidence" },
    { name: "Citation Record - Batch 44", type: "DOC", size: "560 KB", date: "2024-12-13", category: "Citations" },
    { name: "Monthly Summary - Nov 2024", type: "PDF", size: "4.2 MB", date: "2024-12-12", category: "Reports" },
    { name: "Arrest Warrant - Omary", type: "PDF", size: "320 KB", date: "2024-12-11", category: "Legal" },
    { name: "Station Log - Kinondoni", type: "DOC", size: "1.8 MB", date: "2024-12-10", category: "Logs" },
  ];

  const typeIcon: Record<string, typeof File> = { PDF: File, DOC: FileSpreadsheet };
  const typeColor: Record<string, string> = { PDF: "bg-[#EF4444]/100/15 text-[#EF4444]", DOC: "bg-blue-500/15 text-blue-500" };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-police-navy">Hatika / Documents</h2>
        <p className="text-sm text-police-faint">Manage uploaded documents and attachments</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {documents.map((d, i) => {
          const Icon = typeIcon[d.type] ?? File;
          return (
            <div key={i} className="flex flex-col gap-3 rounded-xl bg-police-card p-4 shadow-sm transition hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${typeColor[d.type] ?? "bg-slate-100 text-slate-500"}`}>
                  <Icon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-police">{d.name}</p>
                  <p className="mt-0.5 text-[11px] text-police-faint">{d.category}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-police-faint">
                <span>{d.size}</span>
                <span>{d.date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-full bg-police-muted px-2 py-0.5 text-[10px] font-semibold text-police-faint">{d.type}</span>
                <button className="flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  <Eye size={12} /> View
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- ClerkFileManagement ---- */
function ClerkFileManagement() {
  const folderTree = [
    { name: "Dar es Salaam Region", files: 142, subfolders: ["Kinondoni", "Ilala", "Temeke", "Kigamboni"] },
    { name: "Dodoma Region", files: 89, subfolders: ["Dodoma MC", "Kondoa", "Mpwapwa"] },
    { name: "Arusha Region", files: 67, subfolders: ["Arusha CC", "Moshi", "Karatu"] },
    { name: "Mwanza Region", files: 54, subfolders: ["Mwanza CC", "Misungwi", "Sengerema"] },
    { name: "Mbeya Region", files: 38, subfolders: ["Mbeya CC", "Songwe"] },
  ];

  const recentFiles = [
    { name: "TPF-2024-8842-brief.pdf", path: "Dar es Salaam/Kinondoni/", size: "2.4 MB", date: "2024-12-15" },
    { name: "witness-mwangi.doc", path: "Dodoma/Dodoma MC/", size: "1.1 MB", date: "2024-12-15" },
    { name: "incident-dodoma-dec.pdf", path: "Dodoma/Dodoma MC/", size: "3.8 MB", date: "2024-12-14" },
    { name: "evidence-arusha.pdf", path: "Arusha/Arusha CC/", size: "890 KB", date: "2024-12-14" },
  ];

  const [expandedFolder, setExpandedFolder] = useState<string | null>("Dar es Salaam Region");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-police-navy">Usimamizi wa Faili / File Management</h2>
          <p className="text-sm text-police-faint">Browse, search, and organize case files</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-police-muted px-3">
            <Search size={14} className="text-police-faint" />
            <input placeholder="Search files..." className="h-8 w-40 bg-transparent text-[13px] text-police placeholder:text-police-faint focus:outline-none sm:w-56" />
          </div>
          <button className="flex items-center gap-1.5 rounded-lg bg-[#2196F3] px-3 py-2 text-[12px] font-semibold text-white shadow-md shadow-[#2196F3]/30 hover:bg-[#2196F3] transition">
            <Upload size={14} /> Upload
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Folder Tree */}
        <div className="rounded-xl bg-police-card p-4 shadow-sm lg:col-span-1">
          <h3 className="mb-3 text-[13px] font-semibold text-police-navy">Folders / Vifungo</h3>
          <div className="max-h-96 space-y-1 overflow-y-auto">
            {folderTree.map((f) => {
              const expanded = expandedFolder === f.name;
              return (
                <div key={f.name}>
                  <button
                    onClick={() => setExpandedFolder(expanded ? null : f.name)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-[13px] font-medium text-police hover:bg-police-muted transition"
                  >
                    {expanded ? <ChevronDown size={14} className="text-police-faint" /> : <ChevronRight size={14} className="text-police-faint" />}
                    <FolderOpen size={16} className="text-[#FF9800]" />
                    <span className="flex-1 truncate text-left">{f.name}</span>
                    <span className="text-[10px] text-police-faint">{f.files}</span>
                  </button>
                  {expanded && f.subfolders.length > 0 && (
                    <div className="ml-6 space-y-0.5">
                      {f.subfolders.map((sf) => (
                        <div key={sf} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] text-police-faint hover:bg-police-muted/50 transition">
                          <Folder size={14} className="text-amber-400/70" />
                          {sf}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Files */}
        <div className="rounded-xl bg-police-card p-4 shadow-sm lg:col-span-2">
          <h3 className="mb-3 text-[13px] font-semibold text-police-navy">Recent Files / Faili za Hivi Karibuni</h3>
          <div className="space-y-2">
            {recentFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg bg-police-muted/50 px-3 py-2.5 hover:bg-police-muted/80 transition">
                <File size={18} className="shrink-0 text-[#EF4444]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-police">{f.name}</p>
                  <p className="text-[11px] text-police-faint">{f.path}</p>
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-[11px] text-police-faint">{f.size}</p>
                  <p className="text-[11px] text-police-faint">{f.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- ClerkExports ---- */
function ClerkExports() {
  const exports = [
    { id: "EXP-442", type: "Case Records", format: "CSV", date: "2024-12-15 14:30", status: "Completed", records: 150 },
    { id: "EXP-441", type: "Monthly Report", format: "PDF", date: "2024-12-15 10:15", status: "Completed", records: 1 },
    { id: "EXP-440", type: "Citation Data", format: "Excel", date: "2024-12-14 16:45", status: "Completed", records: 234 },
    { id: "EXP-439", type: "Incident Log", format: "CSV", date: "2024-12-14 09:00", status: "Failed", records: 0 },
    { id: "EXP-438", type: "Officer Roster", format: "PDF", date: "2024-12-13 11:20", status: "Completed", records: 89 },
    { id: "EXP-437", type: "Arrest Records", format: "CSV", date: "2024-12-13 08:30", status: "Processing", records: 45 },
    { id: "EXP-436", type: "Evidence Inventory", format: "Excel", date: "2024-12-12 15:00", status: "Completed", records: 312 },
  ];

  const statusStyle: Record<string, string> = {
    Completed: "bg-[#10B981]/15 text-[#10B981] ",
    Failed: "bg-[#EF4444]/100/15 text-[#EF4444] dark:text-[#EF4444]400",
    Processing: "bg-[#FF9800]/15 text-[#FF9800] ",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-police-navy">Uhamishaji / Exports</h2>
        <p className="text-sm text-police-faint">Track and download exported data</p>
      </div>

      <div className="overflow-x-auto rounded-xl bg-police-card shadow-sm">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-police-muted text-police-faint">
              <th className="px-4 py-3 font-medium">Export ID</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Format</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Records</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {exports.map((e) => (
              <tr key={e.id} className="border-b border-police-muted/50 last:border-b-0 hover:bg-police-muted/30">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-police">{e.id}</td>
                <td className="px-4 py-3 text-police">{e.type}</td>
                <td className="px-4 py-3 text-police-faint">{e.format}</td>
                <td className="px-4 py-3 text-police-faint">{e.date}</td>
                <td className="px-4 py-3 text-police">{e.records}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusStyle[e.status] ?? ""}`}>
                    {e.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {e.status === "Completed" ? (
                    <button className="flex items-center gap-1 text-[12px] font-medium text-blue-600 dark:text-blue-400 hover:underline">
                      <Download size={12} /> Download
                    </button>
                  ) : (
                    <span className="text-[12px] text-police-faint">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---- ClerkReports ---- */
function ClerkReports() {
  const summaryStats = [
    { label: "Reports Generated", value: "156", change: "+12%", positive: true },
    { label: "Records Filed (Month)", value: "423", change: "+8%", positive: true },
    { label: "Pending Reviews", value: "23", change: "-5%", positive: true },
    { label: "Avg Processing Time", value: "2.3 hrs", change: "+0.5 hrs", positive: false },
  ];

  const recentReports = [
    { name: "Monthly Records Summary - December 2024", type: "Monthly", date: "2024-12-15", status: "Ready" },
    { name: "Quarterly Audit Report Q4 2024", type: "Quarterly", date: "2024-12-14", status: "Ready" },
    { name: "Region-wise Filing Statistics", type: "Analytical", date: "2024-12-13", status: "Ready" },
    { name: "Pending Review Backlog Report", type: "Operational", date: "2024-12-12", status: "Generating" },
    { name: "Annual Records Report 2024", type: "Annual", date: "2024-12-10", status: "Draft" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-police-navy">Ripoti / Reports</h2>
        <p className="text-sm text-police-faint">View and generate records management reports</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryStats.map((s) => (
          <div key={s.label} className="rounded-xl bg-police-card p-4 shadow-sm">
            <p className="text-xs font-medium text-police-faint">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-police-navy">{s.value}</p>
            <p className={`mt-1 text-[11px] font-medium ${s.positive ? "text-[#10B981] " : "text-[#EF4444]"}`}>
              {s.change} from last period
            </p>
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      <div className="rounded-xl bg-police-card p-5 shadow-sm">
        <h3 className="mb-4 text-[13px] font-semibold text-police-navy">Recent Reports / Ripoti za Hivi Karibuni</h3>
        <div className="space-y-3">
          {recentReports.map((r, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg bg-police-muted/50 px-3 py-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1E3A8A]/15 text-[#1E3A8A] dark:">
                <BarChart3 size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-police">{r.name}</p>
                <p className="text-[11px] text-police-faint">{r.type} &middot; {r.date}</p>
              </div>
              <span className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                r.status === "Ready" ? "bg-[#10B981]/15 text-[#10B981] " :
                r.status === "Generating" ? "bg-[#FF9800]/15 text-[#FF9800] " :
                "bg-slate-500/15 text-slate-500"
              }`}>
                {r.status}
              </span>
              <button className="flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline">
                <Download size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- ClerkSettings ---- */
function ClerkSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-police-navy">Mipangilio / Settings</h2>
        <p className="text-sm text-police-faint">Configure your clerk workspace preferences</p>
      </div>

      {/* General */}
      <div className="rounded-xl bg-police-card p-5 shadow-sm">
        <h3 className="mb-4 text-[14px] font-semibold text-police-navy">General / Jumla</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">Default Region</p>
              <p className="text-[11px] text-police-faint">Set your default region for filing</p>
            </div>
            <span className="rounded-lg bg-police-muted px-3 py-1.5 text-[12px] font-medium text-police">Dar es Salaam</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">Language</p>
              <p className="text-[11px] text-police-faint">Interface display language</p>
            </div>
            <span className="rounded-lg bg-police-muted px-3 py-1.5 text-[12px] font-medium text-police">Kiswahili</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">Records Per Page</p>
              <p className="text-[11px] text-police-faint">Number of records shown per page</p>
            </div>
            <span className="rounded-lg bg-police-muted px-3 py-1.5 text-[12px] font-medium text-police">25</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl bg-police-card p-5 shadow-sm">
        <h3 className="mb-4 text-[14px] font-semibold text-police-navy">Notifications / Arifa</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">New Record Alerts</p>
              <p className="text-[11px] text-police-faint">Get notified when new records are filed</p>
            </div>
            <div className="h-6 w-10 rounded-full bg-[#2196F3] p-0.5 transition-colors">
              <div className="h-5 w-5 translate-x-4 rounded-full bg-white shadow transition-transform" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">Export Complete</p>
              <p className="text-[11px] text-police-faint">Notify when export finishes</p>
            </div>
            <div className="h-6 w-10 rounded-full bg-[#2196F3] p-0.5 transition-colors">
              <div className="h-5 w-5 translate-x-4 rounded-full bg-white shadow transition-transform" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">Review Reminders</p>
              <p className="text-[11px] text-police-faint">Daily reminder for pending reviews</p>
            </div>
            <div className="h-6 w-10 rounded-full bg-slate-300 p-0.5 transition-colors dark:bg-slate-600">
              <div className="h-5 w-5 rounded-full bg-white shadow transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-xl bg-police-card p-5 shadow-sm">
        <h3 className="mb-4 text-[14px] font-semibold text-police-navy">Security / Usalama</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">Two-Factor Authentication</p>
              <p className="text-[11px] text-police-faint">Add extra layer of security</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-[#10B981]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#10B981] ">Enabled</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">Session Timeout</p>
              <p className="text-[11px] text-police-faint">Auto-logout after inactivity</p>
            </div>
            <span className="rounded-lg bg-police-muted px-3 py-1.5 text-[12px] font-medium text-police">30 minutes</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-police">Change Password</p>
              <p className="text-[11px] text-police-faint">Update your account password</p>
            </div>
            <button className="rounded-lg bg-police-muted px-3 py-1.5 text-[12px] font-medium text-police hover:bg-police-muted/80 transition">Update</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Screen Router                                                     */
/* ================================================================== */
function renderClerkScreen(screen: ClerkScreen) {
  switch (screen) {
    case "dashboard":
      return <ClerkDashboard />;
    case "records":
      return <ClerkRecords />;
    case "documents":
      return <ClerkDocuments />;
    case "file-management":
      return <ClerkFileManagement />;
    case "exports":
      return <ClerkExports />;
    case "reports":
      return <ClerkReports />;
    case "settings":
      return <ClerkSettings />;
    default:
      return <ClerkDashboard />;
  }
}

/* ================================================================== */
/*  ClerkShell                                                        */
/* ================================================================== */
export function ClerkShell() {
  const [clerkScreen, setClerkScreen] = useState<ClerkScreen>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { logout } = usePoliceStore();
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
              <p className="text-[10px] text-white/60">Clerk / Karani</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="ml-auto text-white/60 lg:hidden">
              <X size={20} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {CLERK_NAV.map((item) => {
              const active = clerkScreen === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setClerkScreen(item.id);
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
                {CLERK_USER.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-bold text-white">{CLERK_USER.shortName}</p>
                <p className="truncate text-[10px] text-white/50">{CLERK_USER.rank}</p>
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
          <div className="hidden max-w-md flex-1 items-center gap-2 rounded-xl bg-police-muted px-3 sm:flex">
            <Search size={16} className="text-police-faint" />
            <input
              placeholder="Tafuta rekodi, hatika, faili..."
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
                2
              </span>
            </button>

            {/* User chip */}
            <div className="flex items-center gap-2 rounded-lg bg-police-muted px-2.5 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2196F3] text-[11px] font-bold text-white">
                {CLERK_USER.initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-[12px] font-bold leading-tight text-police">{CLERK_USER.shortName}</p>
                <p className="text-[10px] leading-tight text-police-faint">{CLERK_USER.rank}</p>
              </div>
              <ChevronDown size={14} className="text-police-faint" />
            </div>
          </div>
        </header>

        {/* Screen content */}
        <main key={clerkScreen} className="police-screen-enter flex-1 overflow-y-auto p-4 lg:p-6">
          {renderClerkScreen(clerkScreen)}
        </main>
      </div>
    </div>
  );
}