import { z } from "zod";

// Analysis request schema
export const analysisRequestSchema = z.object({
  dealerText: z.string().min(1, "Please paste dealer text to analyze"),
  condition: z.enum(["unknown", "new", "used"]).default("unknown"),
  vehicle: z.string().optional(),
  zipCode: z.string().optional(),
  purchaseType: z.enum(["unknown", "cash", "finance", "lease"]).default("unknown"),
  apr: z.number().optional(),
  termMonths: z.number().optional(),
  downPayment: z.number().optional(),
});

export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;

// Fee item for itemized fees
export const feeSchema = z.object({
  name: z.string(),
  amount: z.number().nullable(),
});

export type Fee = z.infer<typeof feeSchema>;

// Detected fields from analysis
export const detectedFieldsSchema = z.object({
  salePrice: z.number().nullable(),
  msrp: z.number().nullable(),
  rebates: z.number().nullable(),
  fees: z.array(feeSchema),
  outTheDoorPrice: z.number().nullable(),
  monthlyPayment: z.number().nullable(),
  tradeInValue: z.number().nullable(),
  apr: z.number().nullable(),
  termMonths: z.number().nullable(),
  downPayment: z.number().nullable(),
});

export type DetectedFields = z.infer<typeof detectedFieldsSchema>;

// Missing info item
export const missingInfoSchema = z.object({
  field: z.string(),
  question: z.string(),
});

export type MissingInfo = z.infer<typeof missingInfoSchema>;

// Confidence level for analysis
export const confidenceLevelSchema = z.enum(["HIGH", "MEDIUM", "LOW"]);
export type ConfidenceLevel = z.infer<typeof confidenceLevelSchema>;

// Analysis response schema
export const analysisResponseSchema = z.object({
  dealScore: z.enum(["GREEN", "YELLOW", "RED"]),
  confidenceLevel: confidenceLevelSchema,
  verdictLabel: z.string(),
  goNoGo: z.enum(["GO", "NO-GO", "NEED-MORE-INFO"]),
  summary: z.string(),
  detectedFields: detectedFieldsSchema,
  missingInfo: z.array(missingInfoSchema),
  suggestedReply: z.string(),
  reasoning: z.string(),
});

export type AnalysisResponse = z.infer<typeof analysisResponseSchema>;

// Legacy user schema (keeping for compatibility)
import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
