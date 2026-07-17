"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Database, FileText, FolderOpen, Download, ArrowRight } from "lucide-react";

type ClerkDataEntryConsoleProps = {
  title: string;
  subtitle: string;
  mode?: "dashboard" | "records" | "documents";
};

type ClerkOverviewResponse = {
  data: {
    generatedAt: string;
    records: {
      citizens: number;
      vehicles: number;
      cases: number;
      pendingReview: number;
      recentEntries: Array<{
        id: string;
        name: string;
        status: string;
        documentCount: number;
        updatedAt: string;
      }>;
    };
    documents: {
      totalAttached: number;
      missing: number;
      requiresValidation: number;
      queue: Array<{
        id: string;
        name: string;
        status: string;
      }>;
    };
  };
};

const QUICK_ACTIONS = [
  {
    label: "Police Data Entry",
    description: "Create and update citizen, vehicle, and case records.",
    href: "/clerk/records",
    icon: Database,
  },
  {
    label: "Documents",
    description: "Attach scanned forms and supporting documents.",
    href: "/clerk/documents",
    icon: FolderOpen,
  },
  {
    label: "Exports",
    description: "Export validated records for command and reports.",
    href: "/clerk/exports",
    icon: Download,
  },
];

export function ClerkDataEntryConsole({ title, subtitle, mode = "dashboard" }: ClerkDataEntryConsoleProps) {
  const [payload, setPayload] = useState<ClerkOverviewResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const response = await fetch("/api/clerk/overview", { cache: "no-store" });
        if (!response.ok) return;
        const json: ClerkOverviewResponse = await response.json();
        if (mounted) {
          setPayload(json.data);
        }
      } catch {
        // Keep fallback values when endpoint is unavailable.
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const records = useMemo(
    () => payload?.records ?? {
      citizens: 20,
      vehicles: 20,
      cases: 20,
      pendingReview: 8,
      recentEntries: [] as ClerkOverviewResponse["data"]["records"]["recentEntries"],
    },
    [payload],
  );

  const documents = useMemo(
    () => payload?.documents ?? {
      totalAttached: 0,
      missing: 0,
      requiresValidation: 0,
      queue: [] as ClerkOverviewResponse["data"]["documents"]["queue"],
    },
    [payload],
  );

  return (
    <main className="min-h-screen bg-police px-4 py-6 md:px-8 md:py-10">
      <section className="mx-auto w-full max-w-6xl space-y-6">
        <div className="rounded-2xl bg-police-card p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-police-faint">Clerk Workspace</p>
          <h1 className="mt-2 text-2xl font-bold text-police-navy2">{title}</h1>
          <p className="mt-2 text-sm text-police-muted">{subtitle}</p>
          {loading && <p className="mt-2 text-xs text-police-faint">Loading live clerk data...</p>}
          {!loading && payload && (
            <p className="mt-2 text-xs text-police-faint">
              Live data updated: {new Date(payload.generatedAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-police-card p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.1em] text-police-faint">Citizens</p>
            <p className="mt-2 text-xl font-bold text-police-navy2">{records.citizens}</p>
          </div>
          <div className="rounded-2xl bg-police-card p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.1em] text-police-faint">Vehicles</p>
            <p className="mt-2 text-xl font-bold text-police-navy2">{records.vehicles}</p>
          </div>
          <div className="rounded-2xl bg-police-card p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.1em] text-police-faint">Cases</p>
            <p className="mt-2 text-xl font-bold text-police-navy2">{records.cases}</p>
          </div>
          <div className="rounded-2xl bg-police-card p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.1em] text-police-faint">Pending Review</p>
            <p className="mt-2 text-xl font-bold text-police-navy2">{records.pendingReview}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group rounded-2xl bg-police-card p-5 shadow-sm ring-1 ring-police transition hover:ring-[#1E3A8A]/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E3A8A]/10 text-[#1E3A8A]">
                    <Icon size={18} />
                  </div>
                  <ArrowRight size={16} className="text-police-faint transition group-hover:translate-x-0.5" />
                </div>
                <h2 className="mt-4 text-base font-semibold text-police-navy2">{action.label}</h2>
                <p className="mt-1 text-sm text-police-muted">{action.description}</p>
              </Link>
            );
          })}
        </div>

        {mode !== "documents" && (
          <div className="rounded-2xl bg-police-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-[#1E3A8A]" />
              <p className="text-sm font-semibold text-police-navy2">Recent Data Entry Records</p>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="text-police-faint">
                    <th className="pb-2 pr-4 font-semibold">Citizen</th>
                    <th className="pb-2 pr-4 font-semibold">NIDA</th>
                    <th className="pb-2 pr-4 font-semibold">Status</th>
                    <th className="pb-2 pr-4 font-semibold">Documents</th>
                    <th className="pb-2 font-semibold">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {records.recentEntries.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-3 text-police-muted">No recent entries available.</td>
                    </tr>
                  )}
                  {records.recentEntries.map((entry) => (
                    <tr key={entry.id} className="border-t border-police">
                      <td className="py-2 pr-4 text-police-navy2">{entry.name}</td>
                      <td className="py-2 pr-4 text-police-muted">{entry.id}</td>
                      <td className="py-2 pr-4 text-police-muted">{entry.status}</td>
                      <td className="py-2 pr-4 text-police-muted">{entry.documentCount}</td>
                      <td className="py-2 text-police-muted">{entry.updatedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {mode === "documents" && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-police-card p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.1em] text-police-faint">Total Attachments</p>
              <p className="mt-2 text-xl font-bold text-police-navy2">{documents.totalAttached}</p>
            </div>
            <div className="rounded-2xl bg-police-card p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.1em] text-police-faint">Missing Documents</p>
              <p className="mt-2 text-xl font-bold text-police-navy2">{documents.missing}</p>
            </div>
            <div className="rounded-2xl bg-police-card p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.1em] text-police-faint">Needs Validation</p>
              <p className="mt-2 text-xl font-bold text-police-navy2">{documents.requiresValidation}</p>
            </div>

            <div className="rounded-2xl bg-police-card p-6 shadow-sm md:col-span-3">
              <div className="flex items-center gap-2">
                <FolderOpen size={16} className="text-[#1E3A8A]" />
                <p className="text-sm font-semibold text-police-navy2">Document Queue</p>
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {documents.queue.length === 0 && (
                  <li className="text-police-muted">No pending document queue entries.</li>
                )}
                {documents.queue.map((item) => (
                  <li key={item.id} className="rounded-xl border border-police px-3 py-2 text-police-navy2">
                    <span className="font-semibold">{item.name}</span>
                    <span className="ml-2 text-police-muted">({item.id})</span>
                    <span className="ml-2 text-police-faint">{item.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-police-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-[#1E3A8A]" />
            <p className="text-sm font-semibold text-police-navy2">Data Entry Checklist</p>
          </div>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-police-muted">
            <li>Capture complete citizen identity details and verify NIDA/mobile format.</li>
            <li>Link vehicles and incident/case references before saving final records.</li>
            <li>Upload supporting documents then export confirmed entries for supervisors.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
