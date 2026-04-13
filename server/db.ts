import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema.js";

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let _pool: pg.Pool | undefined;
let _db: DrizzleDb | undefined;

/**
 * Resolve the database connection URL based on NODE_ENV.
 *
 * - production (default): uses DATABASE_URL
 * - staging: prefers DATABASE_URL_STAGING, falls back to DATABASE_URL with a warning
 * - test: prefers DATABASE_URL_TEST, falls back to DATABASE_URL with a warning
 */
function resolveConnectionUrl(): string {
  const env = getEnvironmentLabel();

  if (env === "staging" && process.env.DATABASE_URL_STAGING) {
    return process.env.DATABASE_URL_STAGING;
  }
  if (env === "test" && process.env.DATABASE_URL_TEST) {
    return process.env.DATABASE_URL_TEST;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set — database operations are unavailable. " +
      "Set DATABASE_URL on the Vercel project and redeploy.",
    );
  }

  // Warn if a non-production environment is falling back to the production DATABASE_URL
  if (env !== "production") {
    console.warn(
      `\n⚠️  [db] NODE_ENV="${env}" but no DATABASE_URL_${env.toUpperCase()} is set.\n` +
      `   Falling back to DATABASE_URL — this may be your PRODUCTION database!\n` +
      `   Set DATABASE_URL_${env.toUpperCase()} to use a separate database.\n`,
    );
  }

  return process.env.DATABASE_URL;
}

function getPool(): pg.Pool {
  if (_pool) return _pool;

  const connectionUrl = resolveConnectionUrl();
  const env = getEnvironmentLabel();

  _pool = new pg.Pool({
    connectionString: connectionUrl,
    // Serverless functions (Vercel) create a new pool per invocation; keep it
    // small to avoid exhausting database connections under concurrency.
    max: process.env.VERCEL ? 1 : 10,
    idleTimeoutMillis: process.env.VERCEL ? 10000 : 30000,
    connectionTimeoutMillis: 10000,
  });
  _pool.on("error", (err) => {
    console.error("Database pool error:", err.message);
  });

  console.log(`[db] Pool created (env=${env})`);
  return _pool;
}

function getDb(): DrizzleDb {
  if (_db) return _db;
  _db = drizzle(getPool(), { schema });
  return _db;
}

/**
 * Returns the current environment label based on NODE_ENV.
 * Useful for scripts to display which database they're targeting.
 */
export function getEnvironmentLabel(): "production" | "staging" | "test" | "development" {
  const env = (process.env.NODE_ENV || "production").toLowerCase();
  if (env === "staging") return "staging";
  if (env === "test") return "test";
  if (env === "development") return "development";
  return "production";
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
