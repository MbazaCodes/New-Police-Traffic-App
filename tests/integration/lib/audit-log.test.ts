import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { logAuditEvent, logAction, listAuditLogs, clearAuditLogs } from "@/lib/audit-log";

// Force the in-memory fallback path by clearing DATABASE_URL.
// tests/utils/setup.ts sets a stub URL which would make isDbEnabled() return true,
// causing logAuditEvent to attempt a real PG query and asynchronously fall back
// to memory — leading to non-deterministic test results.

const originalDbUrl = process.env.DATABASE_URL;

describe("audit-log", () => {
  beforeEach(() => {
    delete process.env.DATABASE_URL;
    clearAuditLogs();
  });

  afterEach(() => {
    process.env.DATABASE_URL = originalDbUrl;
  });

  describe("logAuditEvent", () => {
    it("writes an entry to the in-memory store when DB is unavailable", async () => {
      const entry = await logAuditEvent({
        userId: "user-1",
        action: "create",
        resource: "citations",
        resourceId: "cit-123",
        details: { amount: 5000 },
      });

      expect(entry.id).toMatch(/^AL-\d+-\d{4}$/);
      expect(entry.user_id).toBe("user-1");
      expect(entry.action).toBe("create");
      expect(entry.resource).toBe("citations");
      expect(entry.resource_id).toBe("cit-123");
      expect(entry.details).toEqual({ amount: 5000 });
      expect(entry.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("extracts IP and user-agent from request headers", async () => {
      const request = new Request("https://example.com/api/x", {
        headers: {
          "x-forwarded-for": "203.0.113.5, 198.51.100.1",
          "user-agent": "Mozilla/5.0 (Test Browser)",
        },
      });

      const entry = await logAuditEvent({
        userId: "user-1",
        action: "view",
        resource: "officers",
        request,
      });

      expect(entry.ip_address).toBe("203.0.113.5");
      expect(entry.user_agent).toBe("Mozilla/5.0 (Test Browser)");
    });

    it("supports null userId for anonymous events", async () => {
      const entry = await logAuditEvent({
        userId: null,
        action: "login_failed",
        resource: "auth",
      });

      expect(entry.user_id).toBeNull();
      expect(entry.user_name).toBeNull();
    });
  });

  describe("logAction (legacy sync wrapper)", () => {
    it("accepts a session object and extracts user.id and user.name", () => {
      const entry = logAction(
        { user: { id: "user-2", name: "Ofisa Mkuu" } },
        "update",
        "officers",
        "off-456",
        { field: "rank", from: "Inspector", to: "ASP" },
      );

      expect(entry.user_id).toBe("user-2");
      expect(entry.user_name).toBe("Ofisa Mkuu");
      expect(entry.action).toBe("update");
      expect(entry.resource).toBe("officers");
      expect(entry.resource_id).toBe("off-456");
      expect(entry.details).toEqual({ field: "rank", from: "Inspector", to: "ASP" });
    });

    it("accepts a raw user ID string", () => {
      const entry = logAction("user-3", "delete", "citations", "cit-789");

      expect(entry.user_id).toBe("user-3");
      expect(entry.user_name).toBeNull();
      expect(entry.action).toBe("delete");
    });

    it("accepts explicit userName override", () => {
      const entry = logAction(
        "user-4",
        "view",
        "audit_logs",
        null,
        null,
        "Admin Supervisor",
      );

      expect(entry.user_id).toBe("user-4");
      expect(entry.user_name).toBe("Admin Supervisor");
    });
  });

  describe("listAuditLogs", () => {
    it("returns entries in reverse-chronological order", async () => {
      await logAuditEvent({ userId: "u1", action: "create", resource: "a" });
      await logAuditEvent({ userId: "u2", action: "create", resource: "b" });
      await logAuditEvent({ userId: "u3", action: "create", resource: "c" });

      const { data, total } = await listAuditLogs();
      expect(total).toBe(3);
      expect(data[0].user_id).toBe("u3");
      expect(data[2].user_id).toBe("u1");
    });

    it("filters by resource", async () => {
      await logAuditEvent({ userId: "u1", action: "create", resource: "citations" });
      await logAuditEvent({ userId: "u2", action: "create", resource: "arrests" });
      await logAuditEvent({ userId: "u3", action: "create", resource: "citations" });

      const { data, total } = await listAuditLogs({ resource: "citations" });
      expect(total).toBe(2);
      expect(data.every((e) => e.resource === "citations")).toBe(true);
    });

    it("filters by userId", async () => {
      await logAuditEvent({ userId: "u1", action: "create", resource: "a" });
      await logAuditEvent({ userId: "u2", action: "create", resource: "b" });
      await logAuditEvent({ userId: "u1", action: "create", resource: "c" });

      const { data, total } = await listAuditLogs({ userId: "u1" });
      expect(total).toBe(2);
      expect(data.every((e) => e.user_id === "u1")).toBe(true);
    });

    it("filters by action", async () => {
      await logAuditEvent({ userId: "u1", action: "create", resource: "a" });
      await logAuditEvent({ userId: "u2", action: "update", resource: "b" });
      await logAuditEvent({ userId: "u3", action: "create", resource: "c" });

      const { data, total } = await listAuditLogs({ action: "create" });
      expect(total).toBe(2);
      expect(data.every((e) => e.action === "create")).toBe(true);
    });

    it("respects limit and offset for pagination", async () => {
      for (let i = 0; i < 10; i++) {
        await logAuditEvent({ userId: `u${i}`, action: "create", resource: "x" });
      }

      const page1 = await listAuditLogs({ limit: 3, offset: 0 });
      const page2 = await listAuditLogs({ limit: 3, offset: 3 });

      expect(page1.total).toBe(10);
      expect(page1.data).toHaveLength(3);
      expect(page2.data).toHaveLength(3);
      // Pages should not overlap
      const page1Ids = new Set(page1.data.map((e) => e.id));
      const page2Ids = new Set(page2.data.map((e) => e.id));
      const overlap = [...page1Ids].filter((id) => page2Ids.has(id));
      expect(overlap).toHaveLength(0);
    });
  });

  describe("memory store bounds", () => {
    it("does not grow beyond 1000 entries", async () => {
      for (let i = 0; i < 1050; i++) {
        await logAuditEvent({ userId: `u${i}`, action: "create", resource: "x" });
      }

      const { total } = await listAuditLogs();
      expect(total).toBe(1000);
    });
  });
});
