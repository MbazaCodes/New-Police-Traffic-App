"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCircle2, Clock3, FileWarning, Gauge, ShieldCheck, UserCircle2 } from "lucide-react";

type ClerkOperationsMode = "notifications" | "settings" | "profile";

type ClerkOperationsPanelProps = {
  mode: ClerkOperationsMode;
};

type ClerkOverviewResponse = {
  data: {
    generatedAt: string;
    notifications: { title: string; detail: string; priority: "high" | "medium" | "low" }[];
    settings: {
      defaultStation: string;
      exportFrequency: string;
      syncEnabled: boolean;
      offlineEnabled: boolean;
    };
    profile: {
      recordsEntered: number;
      validated: number;
      pending: number;
      accuracy: number;
      casesClosed: number;
      avgTurnaroundMins: number;
      qualityScore: number;
      actionRequired: number;
    };
  };
};

const FALLBACK_ALERTS: { title: string; detail: string; priority: "high" | "medium" | "low" }[] = [
  { title: "Pending Record Review", detail: "24 records are waiting supervisor validation.", priority: "high" },
  { title: "NIDA Validation Errors", detail: "7 entries failed NIDA format checks.", priority: "medium" },
  { title: "Missing Document Attachments", detail: "11 cases are missing scanned attachments.", priority: "medium" },
  { title: "Export Window", detail: "Daily command export closes at 18:00.", priority: "low" },
];

function priorityColor(priority: string): string {
  if (priority === "high") return "bg-red-100 text-red-700";
  if (priority === "medium") return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

function NotificationsView({ alerts }: { alerts: { title: string; detail: string; priority: "high" | "medium" | "low" }[] }) {
  return (
    <section className="space-y-4 rounded-2xl bg-police-card p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Bell size={18} className="text-[#1E3A8A]" />
        <h2 className="text-lg font-semibold text-police-navy2">Data Entry Notifications</h2>
      </div>
      <p className="text-sm text-police-muted">
        Live queue alerts for validation, document compliance, and export deadlines.
      </p>
      <ul className="space-y-3">
        {alerts.map((alert) => (
          <li key={alert.title} className="rounded-xl border border-police p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-police-navy2">{alert.title}</p>
                <p className="mt-1 text-sm text-police-muted">{alert.detail}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${priorityColor(alert.priority)}`}>
                {alert.priority}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SettingsView({
  defaultStation,
  exportFrequency,
  syncEnabled,
  offlineEnabled,
}: {
  defaultStation: string;
  exportFrequency: string;
  syncEnabled: boolean;
  offlineEnabled: boolean;
}) {
  return (
    <section className="space-y-4 rounded-2xl bg-police-card p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <ShieldCheck size={18} className="text-[#1E3A8A]" />
        <h2 className="text-lg font-semibold text-police-navy2">Data Entry Settings</h2>
      </div>
      <p className="text-sm text-police-muted">
        Configure validation and workflow defaults used by Clerk intake operations.
      </p>

      <div className="space-y-3 rounded-xl border border-police p-4">
        <label className="flex items-center justify-between gap-3 text-sm text-police-navy2">
          <span>Require NIDA format validation before save</span>
          <input type="checkbox" defaultChecked className="h-4 w-4" />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm text-police-navy2">
          <span>Require mandatory document attachment for cases</span>
          <input type="checkbox" defaultChecked className="h-4 w-4" />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm text-police-navy2">
          <span>Enable offline-first data capture mode</span>
          <input type="checkbox" checked={offlineEnabled} readOnly className="h-4 w-4" />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm text-police-navy2">
          <span>Enable sync queue to command center</span>
          <input type="checkbox" checked={syncEnabled} readOnly className="h-4 w-4" />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-police p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-police-faint">Default Station</p>
          <p className="mt-1 text-sm font-semibold text-police-navy2">{defaultStation}</p>
        </div>
        <div className="rounded-xl border border-police p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-police-faint">Export Frequency</p>
          <p className="mt-1 text-sm font-semibold text-police-navy2">{exportFrequency}</p>
        </div>
      </div>
    </section>
  );
}

function ProfileView({
  recordsEntered,
  validated,
  pending,
  accuracy,
  casesClosed,
  avgTurnaroundMins,
  qualityScore,
  actionRequired,
}: {
  recordsEntered: number;
  validated: number;
  pending: number;
  accuracy: number;
  casesClosed: number;
  avgTurnaroundMins: number;
  qualityScore: number;
  actionRequired: number;
}) {
  return (
    <section className="space-y-4 rounded-2xl bg-police-card p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <UserCircle2 size={18} className="text-[#1E3A8A]" />
        <h2 className="text-lg font-semibold text-police-navy2">Clerk Profile</h2>
      </div>
      <p className="text-sm text-police-muted">
        Data entry performance profile used by command supervisors.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-police p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-police-faint">Records Entered</p>
          <p className="mt-2 text-xl font-bold text-police-navy2">{recordsEntered}</p>
        </div>
        <div className="rounded-xl border border-police p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-police-faint">Validated</p>
          <p className="mt-2 text-xl font-bold text-police-navy2">{validated}</p>
        </div>
        <div className="rounded-xl border border-police p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-police-faint">Pending</p>
          <p className="mt-2 text-xl font-bold text-police-navy2">{pending}</p>
        </div>
        <div className="rounded-xl border border-police p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-police-faint">Accuracy</p>
          <p className="mt-2 text-xl font-bold text-police-navy2">{accuracy.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-[#1E3A8A]/5 p-4">
          <div className="flex items-center gap-2 text-[#1E3A8A]">
            <CheckCircle2 size={16} />
            <span className="text-sm font-semibold">Cases Closed</span>
          </div>
          <p className="mt-2 text-sm text-police-muted">{casesClosed} entries linked to closed investigations.</p>
        </div>
        <div className="rounded-xl bg-[#1E3A8A]/5 p-4">
          <div className="flex items-center gap-2 text-[#1E3A8A]">
            <Clock3 size={16} />
            <span className="text-sm font-semibold">Average Turnaround</span>
          </div>
          <p className="mt-2 text-sm text-police-muted">{avgTurnaroundMins} minutes per complete intake record.</p>
        </div>
        <div className="rounded-xl bg-[#1E3A8A]/5 p-4">
          <div className="flex items-center gap-2 text-[#1E3A8A]">
            <Gauge size={16} />
            <span className="text-sm font-semibold">Quality Score</span>
          </div>
          <p className="mt-2 text-sm text-police-muted">Supervisor score: {qualityScore.toFixed(1)}/5 for submission quality.</p>
        </div>
      </div>

      <div className="rounded-xl border border-police p-4">
        <div className="flex items-center gap-2 text-police-navy2">
          <FileWarning size={16} />
          <p className="text-sm font-semibold">Action Required</p>
        </div>
        <p className="mt-1 text-sm text-police-muted">
          {actionRequired} records need identity correction before next export cycle.
        </p>
      </div>
    </section>
  );
}

export function ClerkOperationsPanel({ mode }: ClerkOperationsPanelProps) {
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
        // Keep fallback values when API is not available.
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

  const alerts = payload?.notifications ?? FALLBACK_ALERTS;
  const settings = useMemo(
    () => payload?.settings ?? {
      defaultStation: "Oysterbay Station",
      exportFrequency: "Daily at 18:00",
      syncEnabled: true,
      offlineEnabled: true,
    },
    [payload],
  );

  const profile = useMemo(
    () => payload?.profile ?? {
      recordsEntered: 418,
      validated: 392,
      pending: 24,
      accuracy: 97.4,
      casesClosed: 131,
      avgTurnaroundMins: 12,
      qualityScore: 4.8,
      actionRequired: 3,
    },
    [payload],
  );

  return (
    <main className="min-h-screen bg-police px-4 py-6 md:px-8 md:py-10">
      <section className="mx-auto w-full max-w-6xl space-y-3">
        {loading && <p className="text-sm text-police-muted">Loading live clerk data...</p>}
        {!loading && payload && (
          <p className="text-xs text-police-faint">Live data updated: {new Date(payload.generatedAt).toLocaleString()}</p>
        )}

        {mode === "notifications" && <NotificationsView alerts={alerts} />}
        {mode === "settings" && <SettingsView {...settings} />}
        {mode === "profile" && <ProfileView {...profile} />}
      </section>
    </main>
  );
}
