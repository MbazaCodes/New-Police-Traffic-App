import { describe, it, expect } from "vitest";
import {
  ROLE_HIERARCHY,
  requirePermission,
  requireRole,
  canAccess,
  type Resource,
  type Action,
} from "@/lib/rbac";
import type { Session } from "next-auth";
import type { Role } from "@/lib/auth";

// ── Test helpers ──────────────────────────────────────────────────────

function makeSession(role: Role | null): Session | null {
  if (!role) return null;
  return {
    user: {
      id: "test-user-id",
      name: "Test User",
      email: "test@example.com",
      role,
      idNumber: "TEST-001",
      station: "Test Station",
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
  } as unknown as Session;
}

// ── Tests ─────────────────────────────────────────────────────────────

describe("RBAC — Role Hierarchy", () => {
  it("should have 23 roles in the hierarchy", () => {
    expect(ROLE_HIERARCHY).toHaveLength(23);
  });

  it("should include all liaison roles", () => {
    expect(ROLE_HIERARCHY).toContain("EVIDENCE_OFFICER");
    expect(ROLE_HIERARCHY).toContain("AUDIT_OFFICER");
    expect(ROLE_HIERARCHY).toContain("EMERGENCY_DISPATCHER");
    expect(ROLE_HIERARCHY).toContain("IMMIGRATION_LIAISON");
    expect(ROLE_HIERARCHY).toContain("PRISON_LIAISON");
  });

  it("should have VIEWER at the lowest privilege", () => {
    expect(ROLE_HIERARCHY[0]).toBe("VIEWER");
  });

  it("should have SUPER_ADMIN at the highest privilege", () => {
    expect(ROLE_HIERARCHY[ROLE_HIERARCHY.length - 1]).toBe("SUPER_ADMIN");
  });
});

describe("RBAC — requirePermission", () => {
  it("should reject null sessions", () => {
    const result = requirePermission(null, "officers", "view");
    expect(result.ok).toBe(false);
  });

  it("should allow SUPER_ADMIN to view users", () => {
    const session = makeSession("SUPER_ADMIN");
    const result = requirePermission(session, "users", "view");
    expect(result.ok).toBe(true);
  });

  it("should allow VIEWER to view officers (read-only)", () => {
    const session = makeSession("VIEWER");
    const result = requirePermission(session, "officers", "view");
    expect(result.ok).toBe(true);
  });

  it("should deny VIEWER from creating users", () => {
    const session = makeSession("VIEWER");
    const result = requirePermission(session, "users", "create");
    expect(result.ok).toBe(false);
  });

  it("should allow TRAFFIC_OFFICER to create citations", () => {
    const session = makeSession("TRAFFIC_OFFICER");
    const result = requirePermission(session, "citations", "create");
    expect(result.ok).toBe(true);
  });
});

describe("RBAC — requireRole", () => {
  it("should reject null sessions", () => {
    const result = requireRole(null, ["SUPER_ADMIN"]);
    expect(result.ok).toBe(false);
  });

  it("should allow when user has one of the required roles", () => {
    const session = makeSession("COMMANDER");
    const result = requireRole(session, ["SUPER_ADMIN", "COMMANDER"]);
    expect(result.ok).toBe(true);
  });

  it("should deny when user lacks all required roles", () => {
    const session = makeSession("VIEWER");
    const result = requireRole(session, ["SUPER_ADMIN", "COMMANDER"]);
    expect(result.ok).toBe(false);
  });
});

describe("RBAC — canAccess (if exported)", () => {
  it("should be a function if exported", () => {
    // canAccess may or may not be exported depending on the codebase version
    expect(typeof canAccess).toBe("function");
  });
});
