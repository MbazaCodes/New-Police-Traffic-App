import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
type ClerkAlert = {
  title: string;
  detail: string;
  priority: "high" | "medium" | "low";
};

export async function GET() {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "reports", "view");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const mock = await loadMockDatabase();

    const totalRecords = mock.summary.totalRecords;
    const pendingReview = mock.summary.openCases;

    const citizensMissingDocs = mock.citizens.filter((item) => {
      const docs = ((item as { documents?: unknown[] }).documents ?? []) as unknown[];
      return docs.length === 0;
    }).length;

    const invalidNidaCount = mock.citizens.filter((item) => {
      const nida = String((item as { nida?: string }).nida ?? "").replace(/\D/g, "");
      return nida.length !== 15;
    }).length;

    const validated = Math.max(0, totalRecords - pendingReview - invalidNidaCount);
    const accuracy = totalRecords > 0 ? (validated / totalRecords) * 100 : 100;
    const qualityScore = Math.max(1, Math.min(5, Number((accuracy / 20).toFixed(1))));

    const closedCases = mock.cases.filter((item) => {
      const status = String((item as { status?: string; caseStatus?: string; state?: string }).status
        ?? (item as { caseStatus?: string }).caseStatus
        ?? (item as { state?: string }).state
        ?? "").toLowerCase();
      return ["closed", "resolved", "completed"].includes(status);
    }).length;

    const firstStation = mock.stations[0] as { stationName?: string; name?: string } | undefined;
    const defaultStation = firstStation?.stationName ?? firstStation?.name ?? "Station not set";

    const records = {
      citizens: mock.citizens.length,
      vehicles: mock.vehicles.length,
      cases: mock.cases.length,
      pendingReview,
      recentEntries: mock.citizens.slice(0, 8).map((item) => {
        const citizen = item as {
          nida?: string;
          name?: string;
          status?: string;
          documents?: unknown[];
          history?: Array<{ date?: string }>;
        };
        const docs = (citizen.documents ?? []) as unknown[];
        const latestHistory = Array.isArray(citizen.history) && citizen.history.length > 0
          ? String(citizen.history[0]?.date ?? "N/A")
          : "N/A";
        return {
          id: String(citizen.nida ?? "N/A"),
          name: String(citizen.name ?? "Unknown"),
          status: String(citizen.status ?? "Pending"),
          documentCount: docs.length,
          updatedAt: latestHistory,
        };
      }),
    };

    const documents = {
      totalAttached: mock.citizens.reduce((sum, item) => {
        const docs = ((item as { documents?: unknown[] }).documents ?? []) as unknown[];
        return sum + docs.length;
      }, 0),
      missing: citizensMissingDocs,
      requiresValidation: invalidNidaCount,
      queue: mock.citizens
        .filter((item) => {
          const docs = ((item as { documents?: unknown[] }).documents ?? []) as unknown[];
          return docs.length === 0;
        })
        .slice(0, 8)
        .map((item) => {
          const citizen = item as { nida?: string; name?: string; status?: string };
          return {
            id: String(citizen.nida ?? "N/A"),
            name: String(citizen.name ?? "Unknown"),
            status: String(citizen.status ?? "Pending"),
          };
        }),
    };

    const notifications: ClerkAlert[] = [
      {
        title: "Pending Record Review",
        detail: `${pendingReview} records are waiting supervisor validation.`,
        priority: pendingReview > 10 ? "high" : "medium",
      },
      {
        title: "NIDA Validation Errors",
        detail: `${invalidNidaCount} entries failed NIDA format checks.`,
        priority: invalidNidaCount > 0 ? "medium" : "low",
      },
      {
        title: "Missing Document Attachments",
        detail: `${citizensMissingDocs} records are missing supporting documents.`,
        priority: citizensMissingDocs > 0 ? "medium" : "low",
      },
      {
        title: "Export Window",
        detail: "Daily command export closes at 18:00.",
        priority: "low",
      },
    ];

    return NextResponse.json(
      {
        data: {
          generatedAt: new Date().toISOString(),
          notifications,
          settings: {
            defaultStation,
            exportFrequency: "Daily at 18:00",
            syncEnabled: mock.summary.syncEnabled,
            offlineEnabled: mock.summary.offlineEnabled,
          },
          profile: {
            recordsEntered: totalRecords,
            validated,
            pending: pendingReview,
            accuracy: Number(accuracy.toFixed(1)),
            casesClosed: closedCases,
            avgTurnaroundMins: 12,
            qualityScore,
            actionRequired: invalidNidaCount,
          },
          records,
          documents,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load clerk overview", detail: String(err) },
      { status: 500 },
    );
  }
}
