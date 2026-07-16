// ===== TZ Police Digital Platform — Shared Data Service =====
//
// `AppDataService` is a thin synchronous data layer that today simply returns
// the static mock data from `mock_data.dart`, but is shaped to be the single
// swap-in point when the backend (Supabase) comes online.
//
// Each getter returns the same shape as its TypeScript counterpart so the
// Flutter widgets can consume them exactly like the PWA does. When the real
// backend is wired in, only the bodies of these methods change — the call
// sites stay the same.

import 'mock_data.dart';

class AppDataService {
  AppDataService._();
  static final AppDataService instance = AppDataService._();

  // ── Officer ───────────────────────────────────────────────────────────────
  Map<String, Object> getOfficer() => OFFICER;

  // ── Stats ─────────────────────────────────────────────────────────────────
  List<Map<String, Object>> getHomeStats() => HOME_STATS;
  List<Map<String, Object>> getTrafficStats() => TRAFFIC_STATS;
  List<Map<String, Object>> getPatrolStats() => PATROL_STATS;

  // ── Traffic ───────────────────────────────────────────────────────────────
  List<Map<String, Object>> getTrafficQuickActions() => TRAFFIC_QUICK_ACTIONS;
  List<Map<String, Object>> getRecentOffenses() => RECENT_OFFENSES;

  // ── Alerts ────────────────────────────────────────────────────────────────
  List<Map<String, Object>> getAlerts() => ALERTS;

  // ── Search ────────────────────────────────────────────────────────────────
  /// Vehicle search. Today this always returns [SEARCH_RESULT] regardless of
  /// the [plate] argument, matching the PWA mock behaviour. When Supabase is
  /// wired in, this will become an async query.
  Map<String, Object> getSearchResult(String plate) {
    final result = Map<String, Object>.from(SEARCH_RESULT);
    // Surface the queried plate so the UI can display what the officer typed.
    result['plate'] = plate.isEmpty ? SEARCH_RESULT['plate'] as String : plate;
    return result;
  }

  /// Citizen search. Today always returns [CITIZEN_RESULT].
  Map<String, Object?> getCitizenResult(String query) {
    final result = Map<String, Object?>.from(CITIZEN_RESULT);
    if (query.isNotEmpty) result['_query'] = query;
    return result;
  }

  // ── Admin: people ─────────────────────────────────────────────────────────
  List<Map<String, Object>> getOfficers() => OFFICERS;
  List<Map<String, Object>> getIncidents() => ADMIN_INCIDENTS;
  List<Map<String, Object>> getCitations() => ADMIN_CITATIONS;
  List<Map<String, Object>> getActivePatrols() => ACTIVE_PATROLS;

  // ── Admin: management ─────────────────────────────────────────────────────
  List<Map<String, Object>> getStations() => STATIONS;
  List<Map<String, Object>> getPosts() => POSTS;
  List<Map<String, Object>> getAssignments() => ASSIGNMENTS;
  List<Map<String, Object>> getUnassignedOfficers() => UNASSIGNED_OFFICERS;

  // ── Citation history (officer mobile) ─────────────────────────────────────
  List<Map<String, Object>> getCitationHistory() => CITATION_HISTORY;

  // ── Admin: dashboard aggregates ───────────────────────────────────────────
  List<Map<String, Object>> getDashboardKPIs() => DASHBOARD_KPIS;
  List<Map<String, Object>> getIncidentTrend() => INCIDENT_TREND;
  List<Map<String, Object>> getOffenseDistribution() => OFFENSE_DISTRIBUTION;
  List<Map<String, Object>> getRegionStats() => REGION_STATS;

  // ── Admin: alerts history ─────────────────────────────────────────────────
  List<Map<String, Object>> getAlertsHistory() => ADMIN_ALERTS_HISTORY;

  // ── Admin: users ──────────────────────────────────────────────────────────
  Map<String, Object> getAdminUser() => ADMIN_USER;
  List<Map<String, Object>> getAdminUsers() => ADMIN_USERS;

  // ── Convenience helpers ───────────────────────────────────────────────────

  /// Filters officers by status (`active`, `break`, `off-duty`).
  /// Pass `null` for "all".
  List<Map<String, Object>> officersByStatus(String? status) {
    if (status == null) return OFFICERS;
    return OFFICERS.where((o) => o['status'] == status).toList();
  }

  /// Filters incidents by status (`urgent`, `active`, `resolved`,
  /// `investigating`). Pass `null` for "all".
  List<Map<String, Object>> incidentsByStatus(String? status) {
    if (status == null) return ADMIN_INCIDENTS;
    return ADMIN_INCIDENTS.where((i) => i['status'] == status).toList();
  }

  /// Filters citations by status (`paid`, `unpaid`).
  /// Pass `null` for "all".
  List<Map<String, Object>> citationsByStatus(String? status) {
    if (status == null) return ADMIN_CITATIONS;
    return ADMIN_CITATIONS.where((c) => c['status'] == status).toList();
  }

  /// Posts belonging to a given station id. Pass `null` for all posts.
  List<Map<String, Object>> postsByStation(String? stationId) {
    if (stationId == null) return POSTS;
    return POSTS.where((p) => p['stationId'] == stationId).toList();
  }
}
