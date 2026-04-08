import {
  type InsertDealerSubmission,
  type InsertDealFeedback,
  type DealerSubmission,
  dealerSubmissions,
  dealFeedback,
  auditLog,
} from "@shared/schema";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "./db";

export type AuditEventType = "analyze" | "payment" | "admin_action" | "rate_limit_breach";
export type AuditOutcome = "success" | "failure";

export interface InsertAuditLogInput {
  eventType: AuditEventType;
  ipHash: string;
  userAgentHash: string;
  outcome: AuditOutcome;
  meta: Record<string, unknown>;
  occurredAt?: Date;
}

export interface ListAuditLogInput {
  eventType?: AuditEventType;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

export async function insertAuditLog(input: InsertAuditLogInput) {
  const [row] = await db.insert(auditLog).values({
    eventType: input.eventType,
    occurredAt: input.occurredAt ?? new Date(),
    ipHash: input.ipHash,
    userAgentHash: input.userAgentHash,
    outcome: input.outcome,
    meta: input.meta,
  }).returning();
  return row;
}

export async function listAuditLog(input: ListAuditLogInput) {
  const filters = [];
  if (input.eventType) filters.push(eq(auditLog.eventType, input.eventType));
  if (input.from) filters.push(gte(auditLog.occurredAt, input.from));
  if (input.to) filters.push(lte(auditLog.occurredAt, input.to));

  return db.select().from(auditLog)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(auditLog.occurredAt), desc(auditLog.id))
    .limit(Math.min(input.limit ?? 100, 500))
    .offset(input.offset ?? 0);
}

export interface StateAggregateSummaryRow {
  stateCode: string;
  avgDocFee: number | null;
  count: number;
}

export interface IStorage {
  saveDealerSubmission(data: InsertDealerSubmission): Promise<{ id: string } | null>;
  getDealerSubmission(id: string): Promise<DealerSubmission | null>;
  createDealFeedback(input: InsertDealFeedback): Promise<void>;
  findByContentHash(hash: string): Promise<DealerSubmission | null>;
  markAsSeed(id: string, opts: { seedBatchId: string }): Promise<void>;
  getStateAggregateSummary(): Promise<StateAggregateSummaryRow[]>;
}

export class MemStorage implements IStorage {
  async saveDealerSubmission(_data: InsertDealerSubmission): Promise<{ id: string } | null> {
    return null;
  }

  async getDealerSubmission(_id: string): Promise<DealerSubmission | null> {
    return null;
  }

  async createDealFeedback(_input: InsertDealFeedback): Promise<void> {
    // No-op in memory mode — DATABASE_URL not present
  }

  async findByContentHash(_hash: string): Promise<DealerSubmission | null> {
    return null;
  }

  async markAsSeed(_id: string, _opts: { seedBatchId: string }): Promise<void> {
    // No-op in memory mode
  }

  async getStateAggregateSummary(): Promise<StateAggregateSummaryRow[]> {
    return [];
  }
}

export class DrizzleStorage implements IStorage {
  async saveDealerSubmission(data: InsertDealerSubmission): Promise<{ id: string } | null> {
    const result = await db.insert(dealerSubmissions).values(data).returning({ id: dealerSubmissions.id });
    return result[0] ?? null;
  }

  async getDealerSubmission(id: string): Promise<DealerSubmission | null> {
    const rows = await db
      .select()
      .from(dealerSubmissions)
      .where(eq(dealerSubmissions.id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  async createDealFeedback(input: InsertDealFeedback): Promise<void> {
    await db
      .insert(dealFeedback)
      .values(input)
      .onConflictDoNothing();
  }

  async findByContentHash(hash: string): Promise<DealerSubmission | null> {
    const rows = await db
      .select()
      .from(dealerSubmissions)
      .where(eq(dealerSubmissions.contentHash, hash))
      .limit(1);
    return rows[0] ?? null;
  }

  async markAsSeed(id: string, opts: { seedBatchId: string }): Promise<void> {
    await db
      .update(dealerSubmissions)
      .set({
        ingestionSource: "seed_curated",
        isSeeded: true,
        excludeFromMetrics: true,
        excludeFromEval: true,
        seedBatchId: opts.seedBatchId,
        seededAt: new Date(),
      })
      .where(eq(dealerSubmissions.id, id));
  }

  /**
   * Returns one row per known state with its current avgDocFee and listing
   * count, using the same eligibility rules as `marketContext.ts`:
   *   - `state_code IS NOT NULL`
   *   - `doc_fee IS NOT NULL` for the average
   *
   * Queries the `core.state_stats` materialized view (populated from
   * `core.listings`) so the output reflects what `marketContext` would
   * actually see. Callers that care about seeing freshly-seeded rows
   * must refresh the view first (see `refreshAllViews()`).
   */
  async getStateAggregateSummary(): Promise<StateAggregateSummaryRow[]> {
    const result = await db.execute<{
      state_code: string;
      avg_doc_fee: string | null;
      listing_count: string;
    }>(sql`
      SELECT state_code, avg_doc_fee, listing_count
      FROM core.state_stats
      WHERE state_code IS NOT NULL
      ORDER BY state_code
    `);
    return (result.rows ?? []).map((row) => ({
      stateCode: row.state_code,
      avgDocFee: row.avg_doc_fee != null ? Number(row.avg_doc_fee) : null,
      count: Number(row.listing_count),
    }));
  }
}

export const storage: IStorage = process.env.DATABASE_URL
  ? new DrizzleStorage()
  : new MemStorage();
