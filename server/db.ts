import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema.js";

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let _pool: pg.Pool | undefined;
let _db: DrizzleDb | undefined;

function getPool(): pg.Pool {
  if (_pool) return _pool;
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set — database operations are unavailable. " +
      "Set DATABASE_URL on the Vercel project and redeploy.",
    );
  }
  _pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    // Serverless functions (Vercel) create a new pool per invocation; keep it
    // small to avoid exhausting database connections under concurrency.
    max: process.env.VERCEL ? 1 : 10,
    idleTimeoutMillis: process.env.VERCEL ? 10000 : 30000,
    connectionTimeoutMillis: 10000,
  });
  _pool.on("error", (err) => {
    console.error("Database pool error:", err.message);
  });
  return _pool;
}

function getDb(): DrizzleDb {
  if (_db) return _db;
  _db = drizzle(getPool(), { schema });
  return _db;
}

/**
 * Lazy Proxy over `pg.Pool`. The real pool is not constructed until a
 * property is accessed, so importing this module never throws — callers
 * hit an informative error only when they actually try to use the DB.
 */
export const pool = new Proxy({} as pg.Pool, {
  get(_target, prop, receiver) {
    const real = getPool();
    const value = Reflect.get(real, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

/**
 * Lazy Proxy over the drizzle instance. Same rationale as `pool` above.
 * Method access is bound to the underlying drizzle instance to preserve
 * `this` even if a caller destructures.
 */
export const db = new Proxy({} as DrizzleDb, {
  get(_target, prop, receiver) {
    const real = getDb();
    const value = Reflect.get(real, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
}) as DrizzleDb;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function isPoolInitialized(): boolean {
  return _pool !== undefined;
}
