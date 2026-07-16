// TZ Police Digital Platform — Database client
// DEV:  Mock-safe — no crash without DATABASE_URL
// PROD: Set DATABASE_URL to Supabase PostgreSQL connection string

import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var _prisma: PrismaClient | undefined;
}

function createClient() {
  const url = process.env.DATABASE_URL ?? "";
  // Skip Prisma init in pure mock/dev mode (SQLite file path not set up)
  if (!url || url === "file:./db/dev.db") {
    return null as unknown as PrismaClient;
  }
  return new PrismaClient({ log: ["error"] });
}

export const db: PrismaClient =
  global._prisma ?? createClient();

if (process.env.NODE_ENV !== "production" && db) {
  global._prisma = db;
}
