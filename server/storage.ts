import {
  type User,
  type InsertUser,
  type InsertDealerSubmission,
  dealerSubmissions,
  users,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  saveDealerSubmission(data: InsertDealerSubmission): Promise<{ id: string } | null>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async saveDealerSubmission(_data: InsertDealerSubmission): Promise<{ id: string } | null> {
    // No-op in memory mode — DATABASE_URL not present
    return null;
  }
}

export class DrizzleStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(
      (await import("drizzle-orm")).eq(users.id, id),
    );
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { eq } = await import("drizzle-orm");
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async saveDealerSubmission(data: InsertDealerSubmission): Promise<{ id: string } | null> {
    const result = await db.insert(dealerSubmissions).values(data).returning({ id: dealerSubmissions.id });
    return result[0] ?? null;
  }
}

export const storage: IStorage = process.env.DATABASE_URL
  ? new DrizzleStorage()
  : new MemStorage();
