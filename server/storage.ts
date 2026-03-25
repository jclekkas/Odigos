import {
  type InsertDealerSubmission,
  type InsertDealFeedback,
  dealerSubmissions,
  dealFeedback,
} from "@shared/schema";
import { db } from "./db";

export interface IStorage {
  saveDealerSubmission(data: InsertDealerSubmission): Promise<{ id: string } | null>;
  createDealFeedback(input: InsertDealFeedback): Promise<void>;
}

export class MemStorage implements IStorage {
  async saveDealerSubmission(_data: InsertDealerSubmission): Promise<{ id: string } | null> {
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
