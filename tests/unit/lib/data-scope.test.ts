import { describe, it, expect } from "vitest";
import { getScope, applyScopeToQuery, type Scope } from "@/lib/data-scope";
import type { Session } from "next-auth";
import type { Role } from "@/lib/auth";

// ── Test helpers ──────────────────────────────────────────────────────

function makeSession(role: Role, opts?: { stationId?: string; region?: string; district?: string }): Session {
  return {
    user: {
      id: "test-user-id",
      name: "Test User",
      email: "test@example.com",
      role,
      idNumber: "TEST-001",
      station: "Test Station",
      stationId: opts?.stationId,
      region: opts?.region,
      district: opts?.district,
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
  } as unknown as Session;
}

// Mock query builder that records filter applications
function makeMockQuery() {
  const filters: { col: string; val: unknown }[] = [];
  return {
    filters,
    eq: function (col: string, val: unknown) { filters.push({ col, val }); return this; },
  };
}

// ── Tests ─────────────────────────────────────────────────────────────

describe("Data Scope — getScope", () => {
  it("should return national scope for SUPER_ADMIN", () => {
    const session = makeSession("SUPER_ADMIN");
    const scope = getScope(session);
    expect(scope.isNational).toBe(true);
    expect(scope.isRegional).toBe(false);
    expect(scope.isDistrict).toBe(false);
    expect(scope.isStation).toBe(false);
  });

  it("should return national scope for NATIONAL_COMMANDER", () => {
    const session = makeSession("NATIONAL_COMMANDER");
    const scope = getScope(session);
    expect(scope.isNational).toBe(true);
  });

  it("should return regional scope for REGIONAL_COMMANDER", () => {
    const session = makeSession("REGIONAL_COMMANDER", { region: "Dar es Salaam" });
    const scope = getScope(session);
    expect(scope.isRegional).toBe(true);
    expect(scope.region).toBe("Dar es Salaam");
  });

  it("should return district scope for DISTRICT_COMMANDER", () => {
    const session = makeSession("DISTRICT_COMMANDER", { district: "Ilala" });
    const scope = getScope(session);
    expect(scope.isDistrict).toBe(true);
  });

  it("should return station scope for TRAFFIC_OFFICER", () => {
    const session = makeSession("TRAFFIC_OFFICER", { stationId: "station-123" });
    const scope = getScope(session);
    expect(scope.isStation).toBe(true);
    expect(scope.station_id).toBe("station-123");
  });

  it("should handle null session gracefully", () => {
    const scope = getScope(null);
    // Should not throw — returns a restrictive scope
    expect(scope).toBeDefined();
  });
});

describe("Data Scope — applyScopeToQuery", () => {
  it("should not apply any filter for national scope", () => {
    const session = makeSession("SUPER_ADMIN");
    const scope = getScope(session);
    const q = makeMockQuery();
    applyScopeToQuery(q as any, scope);
    expect(q.filters).toHaveLength(0);
  });

  it("should apply station_id filter for station scope", () => {
    const session = makeSession("TRAFFIC_OFFICER", { stationId: "station-123" });
    const scope = getScope(session);
    const q = makeMockQuery();
    applyScopeToQuery(q as any, scope);
    expect(q.filters).toContainEqual({ col: "station_id", val: "station-123" });
  });

  it("should apply region filter for regional scope", () => {
    const session = makeSession("REGIONAL_COMMANDER", { region: "Dar es Salaam" });
    const scope = getScope(session);
    const q = makeMockQuery();
    applyScopeToQuery(q as any, scope);
    // Regional scope should filter by region
    expect(q.filters.length).toBeGreaterThan(0);
  });
});
