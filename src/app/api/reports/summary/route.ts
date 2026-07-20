// Reports summary API — dashboard KPIs, trends, distribution
// GET /api/reports/summary -> aggregated dashboard data from Supabase

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { enforceDataScope, requirePermission } from "@/lib/rbac";
import { annotateRecordScope, getScopeContext } from "@/lib/scope";
import { getSupabaseAdmin, getSupabaseAdminAny, isSupabaseEnabled } from "@/lib/supabase/client";
import { errMsg } from "@/lib/api-error";

export async function GET() {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "reports", "view");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const scope = getScopeContext(session);

    // Try to get real data from Supabase
    let totalOfficers = 0;
    let totalIncidents = 0;
    let totalCitations = 0;
    let totalResolved = 0;
    let activePatrols = 0;
    let todayCitations = 0;
    let regionStats: any[] = [];
    let liveIncidents: any[] = [];
    let incidentTrend: any[] = [];
    let offenseDistribution: any[] = [];

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        // Get officers count
        const { count: officerCount } = await admin.from("users").select("*", { count: "exact", head: true }).eq("status", "active");
        totalOfficers = officerCount ?? 0;

        // Get incidents stats
        const { data: incidents } = await admin.from("general_incidents").select("status");
        totalIncidents = incidents?.length ?? 0;
        totalResolved = incidents?.filter(i => i.status === "resolved").length ?? 0;

        // Get citations count
        const { count: citationCount } = await admin.from("citations").select("*", { count: "exact", head: true });
        totalCitations = citationCount ?? 0;

        // Get active patrols
        const { count: patrolCount } = await admin.from("patrols").select("*", { count: "exact", head: true }).eq("status", "active");
        activePatrols = patrolCount ?? 0;

        // Get today's citations
        const today = new Date().toISOString().split('T')[0];
        const { count: todayCitCount } = await admin.from("citations").select("*", { count: "exact", head: true }).gte("created_at", today);
        todayCitations = todayCitCount ?? 0;

        // Get region stats from stations
        const { data: stations } = await admin.from("stations").select("*");
        regionStats = (stations ?? []).map(s => ({
          ...s,
          region: s.region,
          district: s.district || "Regional",
          station: s.name,
          officers: 0,
          incidents: 0,
          citations: 0,
          resolved: 0,
          isPublic: true,
        }));

        // Get live incidents (unresolved)
        const { data: unresolved } = await admin.from("general_incidents").select("*").neq("status", "resolved").limit(20);
        liveIncidents = (unresolved ?? []).map(i => ({
          ...i,
          region: i.region || "Unknown",
          district: i.district || "Unknown",
          station: i.station || "Unknown",
          isPublic: false,
        }));
      }
    }

    const scopedRegions = enforceDataScope(
      regionStats.map((r) =>
        annotateRecordScope(r, scope),
      ),
      scope,
    );

    const scopedLiveIncidents = enforceDataScope(
      liveIncidents.map((i) =>
        annotateRecordScope(i, scope),
      ),
      scope,
    );

    const resolutionRate = totalIncidents > 0 ? Math.round((totalResolved / totalIncidents) * 100) : 0;

    const summary = {
      kpis: [],
      aggregated: {
        totalOfficers,
        totalIncidents,
        totalCitations,
        totalResolved,
        resolutionRate,
        activePatrols,
        todayCitations,
      },
      trends: {
        incidentTrend,
        offenseDistribution,
      },
      distribution: {
        regionStats: scopedRegions,
        liveIncidents: scopedLiveIncidents,
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: summary }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to build reports summary", detail: errMsg(err) },
      { status: 500 },
    );
  }
}
