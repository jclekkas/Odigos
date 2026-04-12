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
  source: z.enum(["paste", "upload", "url", "camera"]).default("paste").optional(),
  sessionId: z.string().optional(),
  language: z.enum(["en", "es"]).optional().default("en"),
});

export const marketContextStrengthSchema = z.enum(["none", "thin", "moderate", "strong"]);
export type MarketContextStrength = z.infer<typeof marketContextStrengthSchema>;

// Confidence tiers for market intelligence (surfaced to users)
export const marketConfidenceTierSchema = z.enum(["low", "medium", "high"]);
export type MarketConfidenceTier = z.infer<typeof marketConfidenceTierSchema>;

// Market context returned with analysis results (all keys always present, null for missing values)
export const marketContextSchema = z.object({
  stateCode: z.string().nullable(),
  stateTotalAnalyses: z.number().nullable(),
  stateAvgDealScore: z.number().nullable(),
  stateAvgDocFee: z.number().nullable(),
  docFeeVsStateAvg: z.number().nullable(),
  dealerAnalysisCount: z.number().nullable(),
  dealerAvgDealScore: z.number().nullable(),
  feedbackAgreementPct: z.number().optional(),
  feedbackCount: z.number().optional(),
  stateSampleSize: z.number().optional(),
  stateStrength: marketContextStrengthSchema.optional(),
  dealerSampleSize: z.number().optional(),
  dealerStrength: marketContextStrengthSchema.optional(),
  feedbackSampleSize: z.number().optional(),
  feedbackStrength: marketContextStrengthSchema.optional(),
  overallStrength: marketContextStrengthSchema.optional(),
  // Extended market intelligence fields
  stateP25DocFee: z.number().nullable().optional(),
  stateP75DocFee: z.number().nullable().optional(),
  stateAvgAddOnTotal: z.number().nullable().optional(),
  statePercentWithAddOns: z.number().nullable().optional(),
  stateConfidenceTier: marketConfidenceTierSchema.nullable().optional(),
  dealerAvgDocFee: z.number().nullable().optional(),
  dealerPercentFlaggedRed: z.number().nullable().optional(),
  dealerConfidenceTier: marketConfidenceTierSchema.nullable().optional(),
});

export type MarketContext = z.infer<typeof marketContextSchema>;

// Market signal — structured evidence surfaced to users
export const marketSignalSchema = z.object({
  source: z.enum(["dealer", "state", "pattern", "legal"]),
  message: z.string(),
  confidenceTier: marketConfidenceTierSchema,
  sampleSize: z.number().nullable(),
});

export type MarketSignal = z.infer<typeof marketSignalSchema>;

// Flagged item evidence — data-backed reasoning for flagged fees
export const flaggedItemEvidenceSchema = z.object({
  itemLabel: z.string(),
  message: z.string(),
  confidenceTier: marketConfidenceTierSchema,
});

export type FlaggedItemEvidence = z.infer<typeof flaggedItemEvidenceSchema>;

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
  vehicle_make: z.string().nullable().optional(),
  vehicle_model: z.string().nullable().optional(),
  vehicle_year: z.number().int().nullable().optional(),
  // Lease-specific fields (only populated when purchaseType is "lease" or lease terms detected)
  moneyFactor: z.number().nullable().optional(),
  residualValue: z.number().nullable().optional(),
  residualPercent: z.number().nullable().optional(),
  acquisitionFee: z.number().nullable().optional(),
  dispositionFee: z.number().nullable().optional(),
  mileageAllowance: z.number().int().nullable().optional(),
  excessMileageRate: z.number().nullable().optional(),
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

// Financial-impact confidence (used by the "money at risk" hero block).
// Lower-case and separate from `confidenceLevel` because they answer
// different questions: `confidenceLevel` is confidence in the overall
// analysis; `financialImpactConfidence` is confidence in the specific
// overpayment range / normal OTD range.
export const financialImpactConfidenceSchema = z.enum(["low", "medium", "high"]);
export type FinancialImpactConfidence = z.infer<typeof financialImpactConfidenceSchema>;

// Doc fee cap check result — structured violation data for the statutory cap callout
export const docFeeCapCheckSchema = z.object({
  violated: z.boolean(),
  capAmount: z.number(),
  chargedAmount: z.number(),
  overage: z.number(),
  stateName: z.string(),
  stateAbbreviation: z.string(),
  statuteCitation: z.string().nullable(),
});

export type DocFeeCapCheck = z.infer<typeof docFeeCapCheckSchema>;

// ---------------------------------------------------------------------------
// Lease Math Engine result schemas
// ---------------------------------------------------------------------------

export const rateMarkupResultSchema = z.object({
  dealerAPR: z.number(),
  buyRateAPR: z.number(),
  markupAPR: z.number(),
  markupPerMonth: z.number(),
  totalMarkupDollars: z.number(),
});

export const paymentValidationResultSchema = z.object({
  expectedPaymentPreTax: z.number(),
  quotedPayment: z.number(),
  discrepancy: z.number(),
  isSignificant: z.boolean(),
});

export const residualCheckResultSchema = z.object({
  residualPercent: z.number(),
  brandRange: z.tuple([z.number(), z.number()]),
  status: z.enum(["low", "normal", "high"]),
  deviationFromRange: z.number(),
});

export const acqFeeBenchmarkResultSchema = z.object({
  charged: z.number(),
  brandStandard: z.number(),
  overage: z.number(),
  isMarkedUp: z.boolean(),
});

export const leaseMathResultSchema = z.object({
  apr: z.number().nullable(),
  rateMarkup: rateMarkupResultSchema.nullable(),
  paymentValidation: paymentValidationResultSchema.nullable(),
  residualCheck: residualCheckResultSchema.nullable(),
  acquisitionFeeBenchmark: acqFeeBenchmarkResultSchema.nullable(),
  brandMatched: z.string().nullable(),
});

export type LeaseMathResult = z.infer<typeof leaseMathResultSchema>;

// Ranked signal — deterministic priority-ordered negotiation signals
export const rankedSignalSchema = z.object({
  priority: z.number(),
  category: z.enum(["legal", "dealer_pattern", "state_norm", "line_item", "info_gap"]),
  label: z.string(),
  detail: z.string(),
  action: z.string(),
  severity: z.enum(["critical", "warning", "info"]),
});

export type RankedSignal = z.infer<typeof rankedSignalSchema>;

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
  marketContext: marketContextSchema.optional(),
  marketContextUsed: z.boolean().optional(),
  marketContextStrength: marketContextStrengthSchema.optional(),
  marketContextSummary: z.string().optional(),
  // ---------------------------------------------------------------------
  // Financial impact fields — power the "money at risk" hero block
  // ---------------------------------------------------------------------
  // All are nullable so old analyses / weak-evidence rows degrade
  // gracefully instead of forcing false precision.
  estimatedOverpaymentMin: z.number().nullable().optional(),
  estimatedOverpaymentMax: z.number().nullable().optional(),
  estimatedNormalOtdMin: z.number().nullable().optional(),
  estimatedNormalOtdMax: z.number().nullable().optional(),
  primaryIssue: z.string().nullable().optional(),
  marketComparison: z.string().nullable().optional(),
  financialImpactConfidence: financialImpactConfidenceSchema.nullable().optional(),
  financialSummary: z.string().nullable().optional(),
  docFeeCapCheck: docFeeCapCheckSchema.nullable().optional(),
  // ---------------------------------------------------------------------
  // Lease Math Engine — deterministic post-LLM computations
  // ---------------------------------------------------------------------
  leaseMath: leaseMathResultSchema.nullable().optional(),
  // ---------------------------------------------------------------------
  // Ranked Signals — deterministic priority-ordered negotiation signals
  // ---------------------------------------------------------------------
  rankedSignals: z.array(rankedSignalSchema).optional(),
  // ---------------------------------------------------------------------
  // Market Intelligence — data moat signals computed deterministically
  // ---------------------------------------------------------------------
  marketSignals: z.array(marketSignalSchema).optional(),
  flaggedItemEvidence: z.array(flaggedItemEvidenceSchema).optional(),
  dealerSeenBefore: z.boolean().optional(),
  dealerPriorQuoteCount: z.number().nullable().optional(),
  dealerPatternSummary: z.string().nullable().optional(),
});

export type AnalysisResponse = z.infer<typeof analysisResponseSchema>;

import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  numeric,
  integer,
  boolean,
  serial,
  unique,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const auditEventTypeEnum = pgEnum("audit_event_type", [
  "analyze", "payment", "admin_action", "rate_limit_breach",
]);

export const auditOutcomeEnum = pgEnum("audit_outcome", [
  "success", "failure",
]);

export const auditLog = pgTable(
  "audit_log",
  {
    id: serial("id").primaryKey(),
    eventType: auditEventTypeEnum("event_type").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
    ipHash: text("ip_hash").notNull(),
    userAgentHash: text("user_agent_hash").notNull(),
    outcome: auditOutcomeEnum("outcome").notNull(),
    meta: jsonb("meta").$type<Record<string, unknown>>().notNull().default({}),
  },
  (table) => ({
    eventTypeIdx: index("audit_log_event_type_idx").on(table.eventType),
    occurredAtIdx: index("audit_log_occurred_at_idx").on(table.occurredAt),
    eventTypeOccurredAtIdx: index("audit_log_event_type_occurred_at_idx").on(table.eventType, table.occurredAt),
  }),
);

// Metrics events table
export const metricsEvents = pgTable("metrics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventType: text("event_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  metadata: jsonb("metadata"),
});

export const insertMetricsEventSchema = createInsertSchema(metricsEvents).omit({
  id: true,
  createdAt: true,
});

export type InsertMetricsEvent = z.infer<typeof insertMetricsEventSchema>;
export type MetricsEvent = typeof metricsEvents.$inferSelect;

// ---------------------------------------------------------------------------
// Dealer Submissions — Privacy-First Intelligence Pipeline
// ---------------------------------------------------------------------------
// Two-tier retention model:
//   Tier 1: Derived signals (no PII, no expiry) — used for aggregate analysis
//   Tier 2: PII-redacted raw text (90-day expiry, then nulled)
// ZIP code is NEVER stored — only the 2-letter state derived from its prefix.
// ---------------------------------------------------------------------------
export const dealerSubmissions = pgTable(
  "dealer_submissions",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),

    // Tracks prompt/extraction logic version so datasets are comparable over time
    analysisVersion: text("analysis_version").notNull().default("v2"),

    // --- Scoring ---
    dealScore: text("deal_score").notNull(),
    confidenceLevel: text("confidence_level").notNull(),
    goNoGo: text("go_no_go").notNull(),
    verdictLabel: text("verdict_label").notNull(),

    // --- Buyer context (user-declared, not identifying) ---
    condition: text("condition").notNull().default("unknown"),
    purchaseType: text("purchase_type").notNull().default("unknown"),
    source: text("source").notNull().default("paste"),

    // --- Geography: state only, ZIP is never persisted ---
    stateCode: text("state_code"),

    // --- Extracted financial signals (all nullable) ---
    salePrice: numeric("sale_price"),
    msrp: numeric("msrp"),
    otdPrice: numeric("otd_price"),
    monthlyPayment: numeric("monthly_payment"),
    apr: numeric("apr"),
    termMonths: integer("term_months"),
    downPayment: numeric("down_payment"),
    rebates: numeric("rebates"),
    tradeInValue: numeric("trade_in_value"),
    totalFeesAmount: numeric("total_fees_amount"),

    // --- Fee intelligence ---
    feeCount: integer("fee_count").notNull().default(0),
    feeNames: text("fee_names").array().notNull().default(sql`ARRAY[]::text[]`),

    // --- Tactic flags (boolean columns for fast WHERE queries) ---
    flagMarketAdjustment: boolean("flag_market_adjustment").notNull().default(false),
    flagPaymentOnly: boolean("flag_payment_only").notNull().default(false),
    flagMissingOtd: boolean("flag_missing_otd").notNull().default(false),
    flagVagueFees: boolean("flag_vague_fees").notNull().default(false),
    flagHighCostAddons: boolean("flag_high_cost_addons").notNull().default(false),
    highCostAddonCount: integer("high_cost_addon_count").notNull().default(0),
    missingInfoCount: integer("missing_info_count").notNull().default(0),

    // --- Full structured payload (JSONB for schema evolution) ---
    detectedFields: jsonb("detected_fields"),

    // --- Tier 2: PII-redacted text with 90-day expiry ---
    // Best-effort redaction only — not guaranteed to catch every PII pattern.
    rawTextRedacted: text("raw_text_redacted"),
    rawTextStoredAt: timestamp("raw_text_stored_at"),
    rawTextExpiresAt: timestamp("raw_text_expires_at"),
    rawTextClearedAt: timestamp("raw_text_cleared_at"),

    // --- Content deduplication ---
    // SHA-256 hex hash of normalized submission text (CRLF→LF, outer whitespace trimmed)
    contentHash: text("content_hash"),

    // --- Provenance & exclusion flags for seeded rows ---
    // Orthogonal design: `isSeeded` is the provenance marker, while
    // `excludeFromMetrics`/`excludeFromEval` are independent exclusion
    // controls so we can later exclude non-seeded rows (e.g. internal
    // test data) without rewriting every metrics query. Metrics queries
    // must filter on `exclude_from_metrics = false`, not on
    // `ingestion_source = 'user'`.
    ingestionSource: text("ingestion_source").notNull().default("user"),
    isSeeded: boolean("is_seeded").notNull().default(false),
    excludeFromMetrics: boolean("exclude_from_metrics").notNull().default(false),
    excludeFromEval: boolean("exclude_from_eval").notNull().default(false),
    seedBatchId: text("seed_batch_id"),
    seededAt: timestamp("seeded_at"),
  },
  (table) => ({
    submittedAtIdx: index("ds_submitted_at_idx").on(table.submittedAt),
    dealScoreIdx: index("ds_deal_score_idx").on(table.dealScore),
    stateCodeIdx: index("ds_state_code_idx").on(table.stateCode),
    flagMarketAdjIdx: index("ds_flag_market_adj_idx").on(table.flagMarketAdjustment),
    feeNamesIdx: index("ds_fee_names_idx").on(table.feeNames),
    ingestionSourceIdx: index("ds_ingestion_source_idx").on(table.ingestionSource),
    isSeededIdx: index("ds_is_seeded_idx").on(table.isSeeded),
    excludeFromMetricsIdx: index("ds_exclude_from_metrics_idx").on(table.excludeFromMetrics),
  }),
);

export const insertDealerSubmissionSchema = createInsertSchema(dealerSubmissions).omit({
  id: true,
  submittedAt: true,
});

export type InsertDealerSubmission = z.infer<typeof insertDealerSubmissionSchema>;
export type DealerSubmission = typeof dealerSubmissions.$inferSelect;

// ---------------------------------------------------------------------------
// Deal Feedback — thumbs up/down signal per submission
// ---------------------------------------------------------------------------
// UNIQUE constraint on listing_id: only one feedback row per submission.
// listingId === dealer_submissions.id (source of truth)
// ---------------------------------------------------------------------------
export const dealFeedback = pgTable(
  "deal_feedback",
  {
    id: serial("id").primaryKey(),
    listingId: varchar("listing_id").notNull().references(() => dealerSubmissions.id, { onDelete: "cascade" }),
    rating: boolean("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    // Enhanced feedback fields (all optional)
    userPaidAmountFinal: numeric("user_paid_amount_final"),
    docFeeRemoved: boolean("doc_fee_removed"),
    addOnsRemoved: text("add_ons_removed").array(),
    overpaymentEstimateFeltAccurate: boolean("overpayment_estimate_felt_accurate"),
    // Progressive disclosure outcome fields (all nullable — collected in stage 2)
    finalPaidAmount: numeric("final_paid_amount"),
    feesRemoved: boolean("fees_removed"),
    outcomeStatus: text("outcome_status"), // 'bought_as_is' | 'negotiated_down' | 'walked_away' | 'still_negotiating'
    followUpCompletedAt: timestamp("follow_up_completed_at", { withTimezone: true }),
  },
  (table) => ({
    listingIdUnique: unique("deal_feedback_listing_id_unique").on(table.listingId),
  }),
);

export const insertDealFeedbackSchema = createInsertSchema(dealFeedback).omit({
  id: true,
  createdAt: true,
});

export type InsertDealFeedback = z.infer<typeof insertDealFeedbackSchema>;
export type SelectDealFeedback = typeof dealFeedback.$inferSelect;

// ---------------------------------------------------------------------------
// Failed Warehouse Writes — Dead-Letter Queue (DLQ)
// ---------------------------------------------------------------------------
// Captures warehouse write failures after all retry attempts are exhausted.
// Payload never contains raw document text (only structured metadata).
// ---------------------------------------------------------------------------
export const failedWarehouseWrites = pgTable(
  "failed_warehouse_writes",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    submissionId: varchar("submission_id").notNull().references(() => dealerSubmissions.id, { onDelete: "cascade" }),
    payload: jsonb("payload").notNull().$type<Record<string, unknown>>(),
    errorMessage: text("error_message").notNull(),
    attemptCount: integer("attempt_count").notNull().default(0),
    failedAt: timestamp("failed_at").defaultNow().notNull(),
    // Replay tracking columns
    status: varchar("status", { length: 16 }).notNull().default("pending"),
    maxAttempts: integer("max_attempts").notNull().default(5),
    nextAttemptAt: timestamp("next_attempt_at").defaultNow().notNull(),
    firstFailedAt: timestamp("first_failed_at").defaultNow().notNull(),
    lastFailedAt: timestamp("last_failed_at").defaultNow().notNull(),
    leaseExpiresAt: timestamp("lease_expires_at"),
    lastErrorCode: varchar("last_error_code", { length: 64 }),
    lastErrorMessage: text("last_error_message"),
  },
  (table) => ({
    submissionIdIdx: index("dlq_submission_id_idx").on(table.submissionId),
    failedAtIdx: index("dlq_failed_at_idx").on(table.failedAt),
    statusNextAttemptIdx: index("dlq_status_next_attempt_idx").on(table.status, table.nextAttemptAt),
  }),
);

export const insertFailedWarehouseWriteSchema = createInsertSchema(failedWarehouseWrites).omit({
  id: true,
  failedAt: true,
});

export type InsertFailedWarehouseWrite = z.infer<typeof insertFailedWarehouseWriteSchema>;
export type FailedWarehouseWrite = typeof failedWarehouseWrites.$inferSelect;
