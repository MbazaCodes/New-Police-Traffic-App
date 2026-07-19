import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { isSupabaseEnabled, getSupabaseAdmin } from "@/lib/supabase/client";

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

    // Load real data from Supabase (or return empty state)
    let totalRecords = 0;
    let pendingReview = 0;
    let citizensMissingDocs = 0;
    let invalidNidaCount = 0;
    let closedCases = 0;
    let defaultStation = "Station not set";
    let syncEnabled = true;
    let offlineEnabled = false;
    
    const recentEntries: Array<{ id: string; name: string; status: string; documentCount: number; updatedAt: string }> = [];
    const documentsQueue: Array<{ id: string; name: string; status: string }> = [];

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdmin();
      if (admin) {
        try {
          // Fetch citizens count
          const { count: citizensCount } = await admin
            .from("citizens")
            .select("*", { count: "exact", head: true });
          totalRecords = citizensCount ?? 0;

          // Fetch recent citizens
          const { data: citizens } = await admin
            .from("citizens")
            .select("id, nida, name, status, documents, created_at")
            .order("created_at", { ascending: false })
            .limit(8);

          if (citizens) {
            for (const citizen of citizens) {
              const docs = (citizen.documents as unknown[] | null) ?? [];
              
              // Build recent entries
              recentEntries.push({
                id: String(citizen.nida ?? citizen.id),
                name: String(citizen.name ?? "Unknown"),
                status: String(citizen.status ?? "Pending"),
                documentCount: docs.length,
                updatedAt: citizen.created_at ? new Date(citizen.created_at).toISOString().split('T')[0] : "N/A",
              });

              // Check missing documents
              if (docs.length === 0) {
                citizensMissingDocs++;
                documentsQueue.push({
                  id: String(citizen.nida ?? citizen.id),
                  name: String(citizen.name ?? "Unknown"),
                  status: String(citizen.status ?? "Pending"),
                });
              }

              // Validate NIDA format (15 digits)
              const nida = String(citizen.nida ?? "").replace(/\D/g, "");
              if (nida.length !== 15 && nida.length > 0) {
                invalidNidaCount++;
              }
            }
          }

          // Fetch cases count for pending/closed
          const { count: openCasesCount } = await admin
            .from("cases")
            .select("*", { count: "exact", head: true })
            .eq("status", "open");
          pendingReview = openCasesCount ?? 0;

          const { count: closedCasesCount } = await admin
            .from("cases")
            .select("*", { count: "exact", head: true })
            .in("status", ["closed", "resolved", "completed"]);
          closedCases = closedCasesCount ?? 0;

          // Get first station name
          const { data: stations } = await admin
            .from("stations")
            .select("name, station_name")
            .limit(1);
          
          if (stations && stations.length > 0) {
            defaultStation = (stations[0].station_name ?? stations[0].name) ?? "Station not set";
          }
        } catch (dbError) {
          console.error("Supabase query error:", dbError);
          // Continue with empty data on error
        }
      }
    }

    // Calculate derived metrics
    const validated = Math.max(0, totalRecords - pendingReview - invalidNidaCount);
    const accuracy = totalRecords > 0 ? (validated / totalRecords) * 100 : 100;
    const qualityScore = Math.max(1, Math.min(5, Number((accuracy / 20).toFixed(1))));

    const records = {
      citizens: totalRecords,
      vehicles: 0, // Will be populated when vehicles table is queried
      cases: pendingReview + closedCases,
      pendingReview,
      recentEntries,
    };

    const documents = {
      totalAttached: totalRecords - citizensMissingDocs,
      missing: citizensMissingDocs,
      requiresValidation: invalidNidaCount,
      queue: documentsQueue.slice(0, 8),
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
            syncEnabled,
            offlineEnabled,
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
