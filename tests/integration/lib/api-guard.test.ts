// Integration tests for withAuth() — verifies the wrapper enforces auth,
// RBAC, returns consistent error shapes, and runs the handler on success.
//
// Mocks: @/lib/auth (getServerSession), @/lib/rbac (requirePermission),
//        @/lib/db/client (getDbAdmin, isDbEnabled), @/lib/audit-log (logAuditEvent)
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Mocks ────────────────────────────────────────────────────────

const mockSession = {
  user: {
    id: "u-1",
    name: "Test Officer",
    email: "officer@example.com",
    role: "TRAFFIC_OFFICER",
  },
  expires: "2099-01-01",
};

vi.mock("@/lib/auth", () => ({
  getServerSession: vi.fn(async () => mockSession),
}));

const okCheck = { ok: true, session: mockSession } as any;
const failCheck = {
  ok: false,
  status: 403,
  error: "Hauruhusiwi",
  session: null,
} as any;

vi.mock("@/lib/rbac", () => ({
  requirePermission: vi.fn(() => okCheck),
  requireRole: vi.fn(() => okCheck),
}));

vi.mock("@/lib/data-scope", () => ({
  getScope: vi.fn(() => ({ kind: "all", stationId: null, region: null })),
}));

vi.mock("@/lib/db/client", () => ({
  getDbAdmin: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(async () => ({ data: [], error: null })),
    })),
  })),
  isDbEnabled: vi.fn(() => true),
}));

vi.mock("@/lib/audit-log", () => ({
  logAuditEvent: vi.fn(async () => undefined),
}));

// Import AFTER mocks are registered so the wrapper picks up the stubs.
import { withAuth, withAuthAny } from "@/lib/api-guard";

// ── Helpers ──────────────────────────────────────────────────────

function mkReq(method: string, body?: unknown) {
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.headers = { "content-type": "application/json" };
    init.body = JSON.stringify(body);
  }
  return new NextRequest("http://localhost/api/test", init);
}

// ── Tests ────────────────────────────────────────────────────────

describe("withAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 + handler result on success", async () => {
    const GET = withAuth("citations", "view", async ({ session }) => ({
      ok: true,
      data: { hello: "world", userId: session.user.id },
    }));

    const res = await GET(mkReq("GET"), { params: Promise.resolve({}) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.data.hello).toBe("world");
    expect(json.data.userId).toBe("u-1");
  });

  it("returns handler.status when explicitly set (e.g. 201)", async () => {
    const POST = withAuth("citations", "create", async () => ({
      ok: true,
      data: { id: "c-1" },
      status: 201,
    }));

    const res = await POST(mkReq("POST", { x: 1 }), { params: Promise.resolve({}) });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.id).toBe("c-1");
  });

  it("returns 500 + ok:false when handler throws", async () => {
    const GET = withAuth("citations", "view", async () => {
      throw new Error("boom");
    });

    const res = await GET(mkReq("GET"), { params: Promise.resolve({}) });
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toContain("boom");
  });

  it("propagates RBAC denial (403) from requirePermission", async () => {
    const { requirePermission } = await import("@/lib/rbac");
    (requirePermission as any).mockReturnValueOnce(failCheck);

    const GET = withAuth("citations", "view", async () => ({
      ok: true,
      data: "should-not-reach",
    }));

    const res = await GET(mkReq("GET"), { params: Promise.resolve({}) });
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toBe("Hauruhusiwi");
  });

  it("awaits params Promise and exposes it in ctx", async () => {
    const GET = withAuth("citations", "view", async ({ params }) => ({
      ok: true,
      data: { id: params.id },
    }));

    const res = await GET(mkReq("GET"), {
      params: Promise.resolve({ id: "abc-123" }),
    });
    const json = await res.json();
    expect(json.data.id).toBe("abc-123");
  });
});

describe("withAuthAny", () => {
  beforeEach(() => vi.clearAllMocks());

  it("runs handler for any authenticated user", async () => {
    const GET = withAuthAny("misc", async ({ session }) => ({
      ok: true,
      data: { user: session.user.name },
    }));

    const res = await GET(mkReq("GET"), { params: Promise.resolve({}) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.user).toBe("Test Officer");
  });

  it("returns 401 when session is missing", async () => {
    const { getServerSession } = await import("@/lib/auth");
    (getServerSession as any).mockResolvedValueOnce(null);

    const GET = withAuthAny("misc", async () => ({ ok: true, data: "x" }));

    const res = await GET(mkReq("GET"), { params: Promise.resolve({}) });
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.ok).toBe(false);
  });
});
