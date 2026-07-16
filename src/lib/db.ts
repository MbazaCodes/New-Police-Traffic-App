// TZ Police Digital Platform — Database client
// DEV: Uses mock data from src/lib/police-data.ts & admin-data.ts
// PROD: Switch to Supabase client (see .env.example)

// Lazy Prisma init — won't crash if DATABASE_URL not set
let _prisma: import("@prisma/client").PrismaClient | null = null;

export function getDb() {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL !== "file:./db/dev.db") {
    if (!_prisma) {
      const { PrismaClient } = require("@prisma/client");
      _prisma = new PrismaClient({ log: ["error"] });
    }
    return _prisma;
  }
  // Return null in mock/dev mode — all data comes from src/lib/*-data.ts
  return null;
}

export const db = getDb();
