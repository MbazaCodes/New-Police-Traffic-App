import { describe, it, expect } from "vitest";
import {
  ROLE_DEFAULT_ROUTES,
  ROLE_ROUTE_PREFIXES,
  canRoleAccessPath,
  getDefaultRouteForRole,
} from "@/lib/route-access";

// ── Tests ─────────────────────────────────────────────────────────────

describe("Route Access — Default Routes", () => {
  it("should have a default route for every role in the hierarchy", () => {
    const roles = Object.keys(ROLE_DEFAULT_ROUTES);
    expect(roles).toContain("SUPER_ADMIN");
    expect(roles).toContain("VIEWER");
    expect(roles).toContain("TRAFFIC_OFFICER");
    expect(roles).toContain("INVESTIGATOR");
  });

  it("should route SUPER_ADMIN to /admin/dashboard", () => {
    expect(getDefaultRouteForRole("SUPER_ADMIN")).toBe("/admin/dashboard");
  });

  it("should route VIEWER to /viewer/dashboard", () => {
    expect(getDefaultRouteForRole("VIEWER")).toBe("/viewer/dashboard");
  });

  it("should route TRAFFIC_OFFICER to /officer/traffic/home", () => {
    expect(getDefaultRouteForRole("TRAFFIC_OFFICER")).toBe("/officer/traffic/home");
  });

  it("should route INVESTIGATOR to /cid/home", () => {
    expect(getDefaultRouteForRole("INVESTIGATOR")).toBe("/cid/home");
  });

  // F4 (stabilize): verify liaison roles have default routes
  it("should route all 5 liaison roles to valid dashboards", () => {
    expect(getDefaultRouteForRole("EVIDENCE_OFFICER")).toBe("/clerk/records");
    expect(getDefaultRouteForRole("AUDIT_OFFICER")).toBe("/admin/dashboard");
    expect(getDefaultRouteForRole("EMERGENCY_DISPATCHER")).toBe("/system/dashboard");
    expect(getDefaultRouteForRole("IMMIGRATION_LIAISON")).toBe("/viewer/dashboard");
    expect(getDefaultRouteForRole("PRISON_LIAISON")).toBe("/viewer/dashboard");
  });
});

describe("Route Access — Prefix Map", () => {
  it("should have route prefixes for SUPER_ADMIN", () => {
    expect(ROLE_ROUTE_PREFIXES["SUPER_ADMIN"]).toBeDefined();
    expect(ROLE_ROUTE_PREFIXES["SUPER_ADMIN"]).toContain("/admin");
  });

  // F4 (stabilize): verify liaison roles are in the prefix map
  it("should have route prefixes for all 5 liaison roles", () => {
    expect(ROLE_ROUTE_PREFIXES["EVIDENCE_OFFICER"]).toBeDefined();
    expect(ROLE_ROUTE_PREFIXES["AUDIT_OFFICER"]).toBeDefined();
    expect(ROLE_ROUTE_PREFIXES["EMERGENCY_DISPATCHER"]).toBeDefined();
    expect(ROLE_ROUTE_PREFIXES["IMMIGRATION_LIAISON"]).toBeDefined();
    expect(ROLE_ROUTE_PREFIXES["PRISON_LIAISON"]).toBeDefined();
  });
});

describe("Route Access — canRoleAccessPath", () => {
  it("should allow SUPER_ADMIN to access /admin/anything", () => {
    expect(canRoleAccessPath("SUPER_ADMIN", "/admin/officers")).toBe(true);
    expect(canRoleAccessPath("SUPER_ADMIN", "/admin/dashboard")).toBe(true);
  });

  it("should allow TRAFFIC_OFFICER to access /officer/traffic/*", () => {
    expect(canRoleAccessPath("TRAFFIC_OFFICER", "/officer/traffic/home")).toBe(true);
    expect(canRoleAccessPath("TRAFFIC_OFFICER", "/officer/traffic/citations")).toBe(true);
  });

  it("should deny TRAFFIC_OFFICER from accessing /admin/*", () => {
    expect(canRoleAccessPath("TRAFFIC_OFFICER", "/admin/dashboard")).toBe(false);
  });

  it("should allow VIEWER to access /viewer/*", () => {
    expect(canRoleAccessPath("VIEWER", "/viewer/dashboard")).toBe(true);
  });

  it("should deny VIEWER from accessing /admin/*", () => {
    expect(canRoleAccessPath("VIEWER", "/admin/dashboard")).toBe(false);
  });

  // F4 (stabilize): liaison roles should NOT fall through to the
  // permissive "unknown role" branch (which returns true for everything)
  it("should not let AUDIT_OFFICER access /officer/traffic/* (not in its prefix list)", () => {
    expect(canRoleAccessPath("AUDIT_OFFICER", "/officer/traffic/home")).toBe(false);
  });
});
