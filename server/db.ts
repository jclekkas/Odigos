import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required but not set");
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // Serverless functions (Vercel) create a new pool per invocation; keep it
  // small to avoid exhausting database connections under concurrency.
  max: process.env.VERCEL ? 1 : 10,
  idleTimeoutMillis: process.env.VERCEL ? 10000 : 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
});

export { pool };
export const db = drizzle(pool, { schema });
