// Redirect — use @/lib/db/client for all DB access
export { getDbAdmin as db, getPool, query, queryOne, isDbEnabled } from "@/lib/db/client";
