// Reports summary — direct SQL counts + trends + distributions + region stats.
//
// Returns the { aggregated, trends, distribution } shape expected by the
// admin-reports.tsx screen. Previously this route returned a flat object
// which caused every chart and KPI on the reports page to show 0 / empty.
//
// All queries are wrapped in safe helpers so a missing table or column
// never 500s the whole endpoint — it just returns 0 / [] for that metric.
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { isDbEnabled, query } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

async function cnt(sql: string, params: unknown[] = []): Promise<number> {
  try {
    const rows = await query<{ count: string }>(sql, params);
    return parseInt(rows[0]?.count ?? "0", 10);
  } catch { return 0; }
}

async function rows<T = any>(sql: string, params: unknown[] = []): Promise<T[]> {
  try {
    return await query<T>(sql, params);
  } catch { return []; }
}

/** Maps a date-range id ("7d" | "30d" | "90d" | "1y") to a Postgres interval string. */
function rangeToInterval(range: string): string {
  switch (range) {
    case "30d": return "30 days";
    case "90d": return "90 days";
    case "1y":  return "365 days";
    default:    return "7 days";
  }
}

const WEEK_DAYS = ["Jumatatu", "Jumanne", "Jumatano", "Alhamisi", "Ijumaa", "Jumamosi", "Jumapili"];

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "reports", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    if (!isDbEnabled()) return NextResponse.json({ ok: true, data: { aggregated: {}, trends: {}, distribution: {} } });

    const url   = new URL(request.url);
    const range = url.searchParams.get("range") || "7d";
    const interval = rangeToInterval(range);
    const today = new Date().toISOString().split("T")[0];

    /* ── Aggregated KPIs ─────────────────────────────────────────────────── */
    const [
      totalOfficers, activePatrols, totalCitations, todayCitations,
      totalIncidents, totalStations, totalArrests, unpaidFines,
      resolvedIncidents,
    ] = await Promise.all([
      cnt("SELECT COUNT(*) FROM users WHERE status='active'"),
      cnt("SELECT COUNT(*) FROM patrols WHERE status='active'"),
      cnt("SELECT COUNT(*) FROM citations"),
      cnt("SELECT COUNT(*) FROM citations WHERE created_at::date = $1", [today]),
      cnt("SELECT COUNT(*) FROM incidents"),
      cnt("SELECT COUNT(*) FROM stations WHERE status='active'"),
      cnt("SELECT COUNT(*) FROM arrests WHERE status='held'"),
      cnt("SELECT COUNT(*) FROM citations WHERE status='unpaid'"),
      cnt("SELECT COUNT(*) FROM incidents WHERE status='resolved'"),
    ]);

    const resolutionRate = totalIncidents > 0
      ? Math.round((resolvedIncidents / totalIncidents) * 100)
      : 0;

    /* ── Trends (last 7 days for daily, or range-based) ──────────────────── */
    // Incident trend by day of week (last 7 days)
    const incidentRows = await rows<{ day: string; count: string }>(
      `SELECT to_char(created_at, 'Dy') AS day, COUNT(*) AS count
       FROM incidents
       WHERE created_at >= NOW() - INTERVAL '7 days'
       GROUP BY to_char(created_at, 'Dy')
       ORDER BY MIN(created_at)`,
    );
    const citationRows = await rows<{ day: string; count: string }>(
      `SELECT to_char(created_at, 'Dy') AS day, COUNT(*) AS count
       FROM citations
       WHERE created_at >= NOW() - INTERVAL '7 days'
       GROUP BY to_char(created_at, 'Dy')
       ORDER BY MIN(created_at)`,
    );
    const paidRows = await rows<{ day: string; count: string }>(
      `SELECT to_char(created_at, 'Dy') AS day, COUNT(*) AS count
       FROM citations
       WHERE status='paid' AND created_at >= NOW() - INTERVAL '7 days'
       GROUP BY to_char(created_at, 'Dy')
       ORDER BY MIN(created_at)`,
    );

    const dayMap = new Map<string, number>();
    WEEK_DAYS.forEach((d, i) => dayMap.set(d, i));

    const incidentMap = new Map(incidentRows.map(r => [r.day.trim(), parseInt(r.count, 10)]));
    const citationMap = new Map(citationRows.map(r => [r.day.trim(), parseInt(r.count, 10)]));
    const paidMap     = new Map(paidRows.map(r => [r.day.trim(), parseInt(r.count, 10)]));

    // Map Postgres Dy abbreviations to our Swahili day names
    const PG_TO_SW = {
      Mon: "Jumatatu", Tue: "Jumanne", Wed: "Jumatano",
      Thu: "Alhamisi", Fri: "Ijumaa",  Sat: "Jumamosi", Sun: "Jumapili",
    };

    const incidentTrend = WEEK_DAYS.map(day => {
      const pgDay = Object.entries(PG_TO_SW).find(([, sw]) => sw === day)?.[0] ?? "";
      return {
        day,
        incidents: incidentMap.get(pgDay) ?? 0,
        citations: citationMap.get(pgDay) ?? 0,
        paid:      paidMap.get(pgDay) ?? 0,
      };
    });

    const citationTrend = incidentTrend; // same shape — both show daily counts

    /* ── Offense distributions (pie chart data) ──────────────────────────── */
    const offenseRows = await rows<{ offense: string; count: string }>(
      `SELECT offense, COUNT(*) AS count
       FROM citations
       WHERE created_at >= NOW() - INTERVAL '${interval}'
       GROUP BY offense
       ORDER BY count DESC
       LIMIT 10`,
    );
    const PIE_COLORS = ["#2563EB", "#DC2626", "#059669", "#D97706", "#7C3AED", "#0891B2", "#4F46E5", "#DB2777", "#65A30D", "#EA580C"];
    const offenseDistribution = offenseRows.length > 0
      ? offenseRows.map((r, i) => ({ name: r.offense || "Hakuna", value: parseInt(r.count, 10), color: PIE_COLORS[i % PIE_COLORS.length] }))
      : [{ name: "Hakuna data", value: 1, color: "#CBD5E1" }];

    // General incidents distribution by type
    const generalRows = await rows<{ type: string; count: string }>(
      `SELECT type, COUNT(*) AS count
       FROM incidents
       WHERE created_at >= NOW() - INTERVAL '${interval}'
       GROUP BY type
       ORDER BY count DESC
       LIMIT 10`,
    );
    const generalDistribution = generalRows.length > 0
      ? generalRows.map((r, i) => ({ name: r.type || "Hakuna", value: parseInt(r.count, 10), color: PIE_COLORS[i % PIE_COLORS.length] }))
      : [{ name: "Hakuna data", value: 1, color: "#CBD5E1" }];

    // Combined distribution — merges citations + incidents
    const combinedMap = new Map<string, number>();
    offenseRows.forEach(r => combinedMap.set(r.offense || "Citation", (combinedMap.get(r.offense || "Citation") ?? 0) + parseInt(r.count, 10)));
    generalRows.forEach(r => combinedMap.set(r.type || "Incident", (combinedMap.get(r.type || "Incident") ?? 0) + parseInt(r.count, 10)));
    const combinedDistribution = combinedMap.size > 0
      ? [...combinedMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value], i) => ({ name, value, color: PIE_COLORS[i % PIE_COLORS.length] }))
      : [{ name: "Hakuna data", value: 1, color: "#CBD5E1" }];

    /* ── Region stats ────────────────────────────────────────────────────── */
    const regionRows = await rows<{ region: string; officers: string; incidents: string; citations: string; stations: string }>(
      `SELECT
         COALESCE(NULLIF(s.region, ''), 'Hakuna Mkoa') AS region,
         COUNT(DISTINCT o.id) AS officers,
         COUNT(DISTINCT i.id) AS incidents,
         COUNT(DISTINCT c.id) AS citations,
         COUNT(DISTINCT s.id) AS stations
       FROM stations s
       LEFT JOIN officers o ON o.station_id = s.id
       LEFT JOIN incidents i ON i.region = s.region
       LEFT JOIN citations c ON c.region = s.region
       WHERE s.region IS NOT NULL AND s.region != ''
       GROUP BY s.region
       ORDER BY officers DESC
       LIMIT 20`,
    );
    const regionStats = regionRows.length > 0
      ? regionRows.map(r => ({
          region: r.region,
          officers: parseInt(r.officers, 10),
          incidents: parseInt(r.incidents, 10),
          citations: parseInt(r.citations, 10),
          stations: parseInt(r.stations, 10),
        }))
      : [];

    return NextResponse.json({
      ok: true,
      data: {
        aggregated: {
          totalOfficers,
          totalIncidents,
          totalCitations,
          totalResolved: resolvedIncidents,
          resolutionRate,
          activePatrols,
          todayCitations,
          totalStations,
          totalArrests,
          unpaidFines,
        },
        trends: {
          incidentTrend,
          citationTrend,
          offenseDistribution,
          generalDistribution,
          combinedDistribution,
        },
        distribution: {
          regionStats,
        },
      },
    });
  } catch (err) {
    console.error("[REPORTS SUMMARY]", errMsg(err));
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
