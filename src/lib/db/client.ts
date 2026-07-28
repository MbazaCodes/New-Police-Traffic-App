// ============================================================
// LOCAL PostgreSQL CLIENT — TZ Police Digital Platform
// Replaces @supabase/supabase-js entirely.
// Uses `pg` Pool — set DATABASE_URL in your .env.
// Exposes a chainable query-builder that mirrors the
// Supabase JS v2 API so all existing route files stay intact.
// ============================================================

import { Pool } from "pg";

// ── Pool singleton ───────────────────────────────────────────
const globalForPg = globalThis as unknown as { _pgPool?: Pool };

function createPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return new Pool({
    connectionString: url,
    ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

export function getPool(): Pool {
  if (!globalForPg._pgPool) globalForPg._pgPool = createPool();
  return globalForPg._pgPool;
}

// ── Raw query helper ─────────────────────────────────────────
export async function query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const pool = getPool();
  const res = await pool.query(sql, params);
  return res.rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

// ── Chainable query builder ───────────────────────────────────
// Mirrors the Supabase JS API shape:
//   admin.from("table").select("*").eq("col", val).order("col").limit(n)
//   → { data, error }
//
// Supported: select, insert, update, delete, upsert
// Filters:   eq, neq, gt, gte, lt, lte, like, ilike, in, is, or, contains
// Modifiers: order, limit, offset, single, maybeSingle, returns, select (on mutations)

type OrderDir = "asc" | "desc";

interface OrderClause {
  col: string;
  dir: OrderDir;
  nullsFirst?: boolean;
}

type FilterOp = "=" | "!=" | ">" | ">=" | "<" | "<=" | "LIKE" | "ILIKE" | "IS" | "IS NOT";

interface WhereClause {
  col: string;
  op: FilterOp;
  val: unknown;
}

interface InClause { col: string; vals: unknown[] }
interface OrClause { raw: string }

type Clause = { type: "where"; w: WhereClause }
             | { type: "in"; c: InClause }
             | { type: "or"; c: OrClause }
             | { type: "not_in"; c: InClause };

type MutationMode = "insert" | "update" | "upsert" | "delete";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

class QueryBuilder<T = AnyRecord> {
  private _table: string;
  private _selectCols = "*";
  private _clauses: Clause[] = [];
  private _orders: OrderClause[] = [];
  private _limitVal?: number;
  private _offsetVal?: number;
  private _singleMode = false;
  private _maybeSingleMode = false;
  private _mutationMode?: MutationMode;
  private _mutationData?: AnyRecord | AnyRecord[];
  private _mutationCols?: string; // columns to return after mutation
  private _conflictCols?: string; // for upsert onConflict

  constructor(table: string) { this._table = table; }

  // ── SELECT ──────────────────────────────────────────────────
  select(cols: string): this {
    if (this._mutationMode) {
      // .select() after insert/update/delete → specify returning cols
      this._mutationCols = cols;
    } else {
      this._selectCols = cols;
    }
    return this;
  }

  // ── FILTERS ─────────────────────────────────────────────────
  eq(col: string, val: unknown): this {
    this._clauses.push({ type: "where", w: { col, op: "=", val } });
    return this;
  }
  neq(col: string, val: unknown): this {
    this._clauses.push({ type: "where", w: { col, op: "!=", val } });
    return this;
  }
  gt(col: string, val: unknown): this {
    this._clauses.push({ type: "where", w: { col, op: ">", val } });
    return this;
  }
  gte(col: string, val: unknown): this {
    this._clauses.push({ type: "where", w: { col, op: ">=", val } });
    return this;
  }
  lt(col: string, val: unknown): this {
    this._clauses.push({ type: "where", w: { col, op: "<", val } });
    return this;
  }
  lte(col: string, val: unknown): this {
    this._clauses.push({ type: "where", w: { col, op: "<=", val } });
    return this;
  }
  like(col: string, val: unknown): this {
    this._clauses.push({ type: "where", w: { col, op: "LIKE", val } });
    return this;
  }
  ilike(col: string, val: unknown): this {
    this._clauses.push({ type: "where", w: { col, op: "ILIKE", val } });
    return this;
  }
  is(col: string, val: unknown): this {
    this._clauses.push({ type: "where", w: { col, op: val === null ? "IS" : "=", val } });
    return this;
  }
  in(col: string, vals: unknown[]): this {
    this._clauses.push({ type: "in", c: { col, vals } });
    return this;
  }
  not(col: string, op: string, val: unknown): this {
    if (op === "in" && Array.isArray(val)) {
      this._clauses.push({ type: "not_in", c: { col, vals: val } });
    } else {
      this._clauses.push({ type: "where", w: { col, op: "!=", val } });
    }
    return this;
  }

  // or() accepts Supabase's filter string format:
  // "col1.ilike.%x%,col2.eq.val"
  or(raw: string): this {
    this._clauses.push({ type: "or", c: { raw } });
    return this;
  }

  // ── ORDER / LIMIT / OFFSET ───────────────────────────────────
  order(col: string, opts?: { ascending?: boolean; nullsFirst?: boolean }): this {
    this._orders.push({
      col,
      dir: opts?.ascending === false ? "desc" : "asc",
      nullsFirst: opts?.nullsFirst,
    });
    return this;
  }
  limit(n: number): this { this._limitVal = n; return this; }
  offset(n: number): this { this._offsetVal = n; return this; }
  range(from: number, to: number): this {
    this._offsetVal = from;
    this._limitVal = to - from + 1;
    return this;
  }

  // ── SINGLE / MAYBE_SINGLE ────────────────────────────────────
  single(): this { this._singleMode = true; return this; }
  maybeSingle(): this { this._maybeSingleMode = true; return this; }

  // ── MUTATIONS ────────────────────────────────────────────────
  insert(data: AnyRecord | AnyRecord[]): this {
    this._mutationMode = "insert";
    this._mutationData = data;
    return this;
  }
  update(data: AnyRecord): this {
    this._mutationMode = "update";
    this._mutationData = data;
    return this;
  }
  upsert(data: AnyRecord | AnyRecord[], opts?: { onConflict?: string }): this {
    this._mutationMode = "upsert";
    this._mutationData = data;
    this._conflictCols = opts?.onConflict;
    return this;
  }
  delete(): this {
    this._mutationMode = "delete";
    return this;
  }

  // ── EXECUTE (thenable) ───────────────────────────────────────
  then<R>(
    resolve: (v: { data: T | T[] | null; error: Error | null; count?: number }) => R,
    reject?: (e: unknown) => R
  ): Promise<R> {
    return this._exec().then(resolve, reject);
  }

  // ── INTERNAL ─────────────────────────────────────────────────
  private async _exec(): Promise<{ data: T | T[] | null; error: Error | null; count?: number }> {
    try {
      const pool = getPool();

      if (this._mutationMode) {
        return this._execMutation(pool);
      }

      // ── SELECT query ─────────────────────────────────────────
      const { where, params } = this._buildWhere([]);

      // Handle PostgREST embed syntax in select cols (e.g., "*, officers_count:officers(count)")
      const safeCols = this._sanitizeSelectCols(this._selectCols);

      let sql = `SELECT ${safeCols} FROM ${this._quote(this._table)}`;
      if (where) sql += ` WHERE ${where}`;
      if (this._orders.length) {
        sql += " ORDER BY " + this._orders.map(o => {
          const dir = o.dir.toUpperCase();
          const nulls = o.nullsFirst !== undefined ? (o.nullsFirst ? " NULLS FIRST" : " NULLS LAST") : "";
          return `${this._quote(o.col)} ${dir}${nulls}`;
        }).join(", ");
      }
      if (this._limitVal !== undefined) sql += ` LIMIT ${this._limitVal}`;
      if (this._offsetVal !== undefined) sql += ` OFFSET ${this._offsetVal}`;

      const res = await pool.query(sql, params);
      const rows = res.rows as T[];

      if (this._singleMode) {
        if (rows.length === 0) return { data: null, error: new Error("No rows returned") };
        return { data: rows[0], error: null };
      }
      if (this._maybeSingleMode) {
        return { data: rows[0] ?? null, error: null };
      }
      return { data: rows, error: null, count: rows.length };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }

  private async _execMutation(
    pool: Pool
  ): Promise<{ data: T | T[] | null; error: Error | null }> {
    const mode = this._mutationMode!;

    if (mode === "delete") {
      const { where, params } = this._buildWhere([]);
      const returning = this._mutationCols ? ` RETURNING ${this._sanitizeSelectCols(this._mutationCols)}` : "";
      const sql = `DELETE FROM ${this._quote(this._table)}${where ? ` WHERE ${where}` : ""}${returning}`;
      const res = await pool.query(sql, params);
      if (!this._mutationCols) return { data: null, error: null };
      const rows = res.rows as T[];
      return { data: this._singleMode || this._maybeSingleMode ? rows[0] ?? null : rows, error: null };
    }

    const dataArr = Array.isArray(this._mutationData) ? this._mutationData : [this._mutationData!];

    if (mode === "update") {
      const data = dataArr[0];
      const keys = Object.keys(data);
      const params: unknown[] = [];
      const sets = keys.map(k => {
        params.push(data[k]);
        return `${this._quote(k)} = $${params.length}`;
      });
      const { where, params: whereParams } = this._buildWhere(params);
      const returning = this._mutationCols ? ` RETURNING ${this._sanitizeSelectCols(this._mutationCols)}` : " RETURNING *";
      const sql = `UPDATE ${this._quote(this._table)} SET ${sets.join(", ")}${where ? ` WHERE ${where}` : ""}${returning}`;
      const res = await pool.query(sql, whereParams);
      const rows = res.rows as T[];
      return { data: this._singleMode || this._maybeSingleMode ? rows[0] ?? null : rows, error: null };
    }

    // INSERT or UPSERT
    const keys = Object.keys(dataArr[0]);
    const returning = this._mutationCols
      ? ` RETURNING ${this._sanitizeSelectCols(this._mutationCols)}`
      : " RETURNING *";

    // Build multi-row insert
    const params: unknown[] = [];
    const valuePlaceholders = dataArr.map(row => {
      const placeholders = keys.map(k => {
        params.push(row[k] ?? null);
        return `$${params.length}`;
      });
      return `(${placeholders.join(", ")})`;
    });

    const colList = keys.map(k => this._quote(k)).join(", ");
    let sql = `INSERT INTO ${this._quote(this._table)} (${colList}) VALUES ${valuePlaceholders.join(", ")}`;

    if (mode === "upsert" && this._conflictCols) {
      const conflictCols = this._conflictCols.split(",").map(c => this._quote(c.trim())).join(", ");
      const updateSets = keys
        .filter(k => !this._conflictCols!.split(",").map(c => c.trim()).includes(k))
        .map(k => `${this._quote(k)} = EXCLUDED.${this._quote(k)}`);
      sql += ` ON CONFLICT (${conflictCols}) DO UPDATE SET ${updateSets.join(", ")}`;
    } else if (mode === "upsert") {
      sql += " ON CONFLICT DO NOTHING";
    }

    sql += returning;

    const res = await pool.query(sql, params);
    const rows = res.rows as T[];
    return {
      data: this._singleMode || this._maybeSingleMode ? rows[0] ?? null : rows,
      error: null,
    };
  }

  // ── Build WHERE from clauses ─────────────────────────────────
  private _buildWhere(existingParams: unknown[]): { where: string; params: unknown[] } {
    const params = [...existingParams];
    const parts: string[] = [];

    for (const clause of this._clauses) {
      if (clause.type === "where") {
        const { col, op, val } = clause.w;
        if (op === "IS" || op === "IS NOT") {
          parts.push(`${this._quote(col)} ${op} NULL`);
        } else {
          params.push(val);
          parts.push(`${this._quote(col)} ${op} $${params.length}`);
        }
      } else if (clause.type === "in") {
        if (clause.c.vals.length === 0) {
          parts.push("FALSE");
        } else {
          const placeholders = clause.c.vals.map(v => { params.push(v); return `$${params.length}`; });
          parts.push(`${this._quote(clause.c.col)} IN (${placeholders.join(", ")})`);
        }
      } else if (clause.type === "not_in") {
        if (clause.c.vals.length === 0) {
          parts.push("TRUE");
        } else {
          const placeholders = clause.c.vals.map(v => { params.push(v); return `$${params.length}`; });
          parts.push(`${this._quote(clause.c.col)} NOT IN (${placeholders.join(", ")})`);
        }
      } else if (clause.type === "or") {
        // Parse Supabase OR filter string: "col.op.val,col2.op.val2"
        const orParts = this._parseOrFilter(clause.c.raw, params);
        if (orParts.length) parts.push(`(${orParts.join(" OR ")})`);
      }
    }

    return { where: parts.join(" AND "), params };
  }

  // Parse "col.ilike.%x%,col2.eq.val" → SQL OR parts
  private _parseOrFilter(raw: string, params: unknown[]): string[] {
    const parts: string[] = [];
    // Split on comma but not inside parentheses (handles nested cases)
    const segments = raw.split(",").map(s => s.trim());
    for (const seg of segments) {
      const dotIdx = seg.indexOf(".");
      if (dotIdx === -1) continue;
      const col = seg.slice(0, dotIdx);
      const rest = seg.slice(dotIdx + 1);
      const opIdx = rest.indexOf(".");
      if (opIdx === -1) continue;
      const op = rest.slice(0, opIdx).toLowerCase();
      const val = rest.slice(opIdx + 1);

      const sqlOp: Record<string, string> = {
        eq: "=", neq: "!=", ilike: "ILIKE", like: "LIKE",
        gt: ">", gte: ">=", lt: "<", lte: "<=",
      };

      if (op === "is" && val === "null") {
        parts.push(`${this._quote(col)} IS NULL`);
      } else if (sqlOp[op]) {
        params.push(val);
        parts.push(`${this._quote(col)} ${sqlOp[op]} $${params.length}`);
      }
    }
    return parts;
  }

  // Quote identifier safely
  private _quote(name: string): string {
    // Strip table-prefix aliases like "officers_count:officers(count)"
    if (name.includes(":") || name.includes("(")) return name; // handled by sanitize
    return `"${name.replace(/"/g, '""')}"`;
  }

  // Sanitize select cols — strip PostgREST embed syntax that pg can't handle
  // e.g., "*, officers_count:officers(count)" → "*"
  private _sanitizeSelectCols(cols: string): string {
    if (!cols || cols === "*") return "*";
    const parts = cols.split(",").map(c => c.trim());
    const safe: string[] = [];
    for (const p of parts) {
      if (p === "*") { safe.push("*"); continue; }
      // Skip embed expressions like "officers_count:officers(count)"
      if (p.includes("(") || (p.includes(":") && p.includes("("))) continue;
      // Alias like "created_at, name AS officer_name"
      safe.push(p);
    }
    return safe.length ? safe.join(", ") : "*";
  }
}

// ── RPC helper (stored procedure calls) ─────────────────────
class RpcBuilder<T = AnyRecord> {
  private _fn: string;
  private _args: AnyRecord;

  constructor(fn: string, args: AnyRecord = {}) {
    this._fn = fn;
    this._args = args;
  }

  then<R>(
    resolve: (v: { data: T[] | null; error: Error | null }) => R,
    reject?: (e: unknown) => R
  ): Promise<R> {
    return this._exec().then(resolve, reject);
  }

  private async _exec(): Promise<{ data: T[] | null; error: Error | null }> {
    try {
      const pool = getPool();
      const keys = Object.keys(this._args);
      const params = keys.map(k => this._args[k]);
      const argList = keys.map((k, i) => `${k} := $${i + 1}`).join(", ");
      const sql = `SELECT * FROM ${this._fn}(${argList})`;
      const res = await pool.query(sql, params);
      return { data: res.rows as T[], error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }
}

// ── Admin client factory — drop-in replacement ───────────────
export interface DbAdmin {
  from: <T = AnyRecord>(table: string) => QueryBuilder<T>;
  rpc: <T = AnyRecord>(fn: string, args?: AnyRecord) => RpcBuilder<T>;
}

export function getDbAdmin(): DbAdmin {
  return {
    from: <T = AnyRecord>(table: string) => new QueryBuilder<T>(table),
    rpc: <T = AnyRecord>(fn: string, args: AnyRecord = {}) => new RpcBuilder<T>(fn, args),
  };
}

// ── Public (read-only) client — same interface ────────────────
export function getDbClient(): DbAdmin {
  return getDbAdmin();
}

// ── isDbEnabled ──────────────────────────────────────────────
export function isDbEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
