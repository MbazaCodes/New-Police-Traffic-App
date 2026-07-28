// Test setup — runs before every integration / e2e test file.
// Stubs env vars so api-guard, db client, and NextAuth don't blow up
// when imported in a test environment without real secrets.
import { beforeEach, vi } from "vitest";

beforeEach(() => {
  // Stable test secrets — never use production values.
  process.env.NEXTAUTH_SECRET ??= "test-secret";
  process.env.NEXTAUTH_URL ??= "http://localhost:3000";
  process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";
  // Mark DB as disabled so api-guard's getDbAdmin returns a stub safely.
  process.env.DISABLE_DB ??= "1";
  // Silence console.error noise from intentional test errors.
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});
