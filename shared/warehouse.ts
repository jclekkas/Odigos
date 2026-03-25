import { sql } from "drizzle-orm";
import {
  pgSchema,
  text,
  varchar,
  timestamp,
  jsonb,
  numeric,
  integer,
  boolean,
  date,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";

export const rawSchema = pgSchema("raw");
export const coreSchema = pgSchema("core");

// ---------------------------------------------------------------------------
// RAW SCHEMA — verbatim ingestion layer, never modified after insert
// ---------------------------------------------------------------------------

export const rawEnforcementRecords = rawSchema.table(
  "enforcement_records",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    source: text("source").notNull(),
    sourceRecordId: text("source_record_id"),
    sourceUrl: text("source_url"),
    rawJson: jsonb("raw_json"),
    fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
    ingestionVersion: integer("ingestion_version").notNull().default(1),
  },
  (table) => ({
    sourceRecordUnique: uniqueIndex("raw_er_source_record_idx").on(table.source, table.sourceRecordId),
  }),
);

export const rawUserAnalyses = rawSchema.table(
  "user_analyses",
  {
    // UUID stored as varchar(36) — FK to public.dealer_submissions added via SQL in setupViews.ts
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    // References public.dealer_submissions.id — constraint applied as raw SQL (see setupViews.ts)
    dealerSubmissionId: varchar("dealer_submission_id"),
    submittedTextRedacted: text("submitted_text_redacted"),
    stateCode: text("state_code"),
    vehicleYear: integer("vehicle_year"),
    vehicleMake: text("vehicle_make"),
    vehicleModel: text("vehicle_model"),
    analysisResult: jsonb("analysis_result"),
    dealScore: integer("deal_score"),
    verdict: text("verdict"),
    flags: text("flags").array(),
    isPaid: boolean("is_paid").default(false),
    ingestionSource: text("ingestion_source"),
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
    retentionExpiresAt: timestamp("retention_expires_at"),
  },
  (table) => ({
    stateIdx: index("raw_ua_state_idx").on(table.stateCode),
    submittedAtIdx: index("raw_ua_submitted_at_idx").on(table.submittedAt),
    dealerSubmissionIdx: index("raw_ua_dealer_submission_idx").on(table.dealerSubmissionId),
  }),
);

// ---------------------------------------------------------------------------
// CORE SCHEMA — normalized, analytics-ready layer
// ---------------------------------------------------------------------------

export const coreStates = coreSchema.table("states", {
  stateCode: text("state_code").primaryKey(),
  stateName: text("state_name").notNull(),
  docFeeCap: numeric("doc_fee_cap"),
  docFeeCapType: text("doc_fee_cap_type"),
  docFeeCapStatute: text("doc_fee_cap_statute"),
  salesTaxBase: numeric("sales_tax_base"),
  tradeInCredit: boolean("trade_in_credit"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const coreMetroAreas = coreSchema.table(
  "metro_areas",
  {
    // UUID stored as varchar(36)
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    metroName: text("metro_name").notNull(),
    stateCode: text("state_code").references(() => coreStates.stateCode),
    population: integer("population"),
  },
  (table) => ({
    stateIdx: index("core_metro_state_idx").on(table.stateCode),
    metroNameStateUnique: uniqueIndex("core_metro_name_state_idx").on(table.metroName, table.stateCode),
  }),
);

export const coreDealers = coreSchema.table(
  "dealers",
  {
    // UUID stored as varchar(36)
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    dealerName: text("dealer_name").notNull(),
    dealerNameNormalized: text("dealer_name_normalized").notNull(),
    city: text("city"),
    stateCode: text("state_code").references(() => coreStates.stateCode),
    metroAreaId: varchar("metro_area_id", { length: 36 }).references(() => coreMetroAreas.id),
    firstSeenAt: timestamp("first_seen_at").defaultNow().notNull(),
    lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
    listingCount: integer("listing_count").notNull().default(0),
    complaintCount: integer("complaint_count").notNull().default(0),
    avgDealScore: numeric("avg_deal_score"),
  },
  (table) => ({
    stateIdx: index("core_dealers_state_idx").on(table.stateCode),
    normalizedIdx: index("core_dealers_normalized_idx").on(table.dealerNameNormalized),
    uniqueDealer: uniqueIndex("core_dealers_unique_idx").on(
      table.dealerNameNormalized,
      table.city,
      table.stateCode,
    ),
  }),
);

export const coreListings = coreSchema.table(
  "listings",
  {
    // UUID stored as varchar(36)
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    dealerId: varchar("dealer_id", { length: 36 }).references(() => coreDealers.id),
    // References public.dealer_submissions.id — bridges feedback loop back to the warehouse.
    dealerSubmissionId: varchar("dealer_submission_id", { length: 36 }),

    // Ingestion tracking — allowed values enforced by CHECK constraint below
    ingestionSource: text("ingestion_source").notNull(),
    isFullyProcessed: boolean("is_fully_processed").notNull().default(false),
    countsTowardRealDeals: boolean("counts_toward_real_deals").notNull().default(false),
    analysisVersion: integer("analysis_version").notNull().default(1),

    // Quality / trust flags
    isDuplicate: boolean("is_duplicate").notNull().default(false),
    isTestData: boolean("is_test_data").notNull().default(false),
    hasPipelineError: boolean("has_pipeline_error").notNull().default(false),
    pipelineErrorReason: text("pipeline_error_reason"),

    // Vehicle
    vehicleYear: integer("vehicle_year"),
    vehicleMake: text("vehicle_make"),
    vehicleModel: text("vehicle_model"),
    vehicleTrim: text("vehicle_trim"),
    vehicleType: text("vehicle_type"),

    // Pricing
    listedPrice: numeric("listed_price"),
    otdPrice: numeric("otd_price"),
    monthlyPayment: numeric("monthly_payment"),
    aprValue: numeric("apr_value"),
    loanTermMonths: integer("loan_term_months"),
    downPayment: numeric("down_payment"),

    // Fees
    docFee: numeric("doc_fee"),
    docFeeOverStateCap: boolean("doc_fee_over_state_cap"),
    marketAdjustment: numeric("market_adjustment"),
    addonTotal: numeric("addon_total"),
    feeNames: text("fee_names").array(),
    flagCount: integer("flag_count").notNull().default(0),

    // Analysis output
    dealScore: integer("deal_score"),
    verdict: text("verdict"),
    flags: text("flags").array(),
    feeToPrice: numeric("fee_to_price_ratio"),

    // Geography
    stateCode: text("state_code").references(() => coreStates.stateCode),
    listingDate: date("listing_date"),
    analyzedAt: timestamp("analyzed_at"),
  },
  (table) => ({
    dealerIdx: index("core_listings_dealer_idx").on(table.dealerId),
    scoreIdx: index("core_listings_score_idx").on(table.dealScore),
    dateIdx: index("core_listings_date_idx").on(table.listingDate),
    stateIdx: index("core_listings_state_idx").on(table.stateCode),
    sourceIdx: index("core_listings_source_idx").on(table.ingestionSource),
    analyzedAtIdx: index("core_listings_analyzed_at_idx").on(table.analyzedAt),
    countsIdx: index("core_listings_counts_real_idx").on(table.countsTowardRealDeals),
    vehicleIdx: index("core_listings_vehicle_idx").on(
      table.vehicleMake,
      table.vehicleModel,
      table.vehicleYear,
    ),
    ingestionSourceCheck: check(
      "listings_ingestion_source_check",
      sql`${table.ingestionSource} IN ('user_submitted', 'seed', 'internal_backfill')`,
    ),
  }),
);

export const coreConsumerComplaints = coreSchema.table(
  "consumer_complaints",
  {
    // UUID stored as varchar(36)
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    rawRecordId: integer("raw_record_id").references(() => rawEnforcementRecords.id),
    complaintDate: date("complaint_date"),
    stateCode: text("state_code").references(() => coreStates.stateCode),
    companyName: text("company_name"),
    dealerId: varchar("dealer_id", { length: 36 }).references(() => coreDealers.id),
    complaintType: text("complaint_type"),
    complaintSubtype: text("complaint_subtype"),
    companyResponse: text("company_response"),
    analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
  },
  (table) => ({
    stateIdx: index("core_complaints_state_idx").on(table.stateCode, table.complaintDate),
    dealerIdx: index("core_complaints_dealer_idx").on(table.dealerId),
  }),
);

// ---------------------------------------------------------------------------
// Drizzle inferred types
// ---------------------------------------------------------------------------

export type RawEnforcementRecord = typeof rawEnforcementRecords.$inferSelect;
export type InsertRawEnforcementRecord = typeof rawEnforcementRecords.$inferInsert;

export type RawUserAnalysis = typeof rawUserAnalyses.$inferSelect;
export type InsertRawUserAnalysis = typeof rawUserAnalyses.$inferInsert;

export type CoreState = typeof coreStates.$inferSelect;
export type InsertCoreState = typeof coreStates.$inferInsert;

export type CoreMetroArea = typeof coreMetroAreas.$inferSelect;
export type InsertCoreMetroArea = typeof coreMetroAreas.$inferInsert;

export type CoreDealer = typeof coreDealers.$inferSelect;
export type InsertCoreDealer = typeof coreDealers.$inferInsert;

export type CoreListing = typeof coreListings.$inferSelect;
export type InsertCoreListing = typeof coreListings.$inferInsert;

export type CoreConsumerComplaint = typeof coreConsumerComplaints.$inferSelect;
export type InsertCoreConsumerComplaint = typeof coreConsumerComplaints.$inferInsert;
