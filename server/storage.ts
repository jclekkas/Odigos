import {
  type InsertDealerSubmission,
  type InsertDealFeedback,
  type DealerSubmission,
  dealerSubmissions,
  dealFeedback,
  auditLog,
} from "@shared/schema";
import { and, desc, eq, gte, lte } from "drizzle-orm";
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

export interface IStorage {
  saveDealerSubmission(data: InsertDealerSubmission): Promise<{ id: string } | null>;
  getDealerSubmission(id: string): Promise<DealerSubmission | null>;
  createDealFeedback(input: InsertDealFeedback): Promise<void>;
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
}

export const storage: IStorage = process.env.DATABASE_URL
  ? new DrizzleStorage()
  : new MemStorage();
