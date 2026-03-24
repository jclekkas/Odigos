/**
 * Backfill Script
 *
 * Migrates all existing dealer_submissions rows into the warehouse:
 *   raw.user_analyses      — one row per submission
 *   core.dealers           — upsert; state-specific sentinels for unknown dealers
 *   core.listings          — one row per submission, ingestion_source='internal_backfill'
 *
 * Idempotent — skips submissions already present in raw.user_analyses.
 *
 * Run with: npm run warehouse:backfill
 */
import { db } from "../db";
import { sql } from "drizzle-orm";
import { dealerSubmissions } from "@shared/schema";
import {
  rawUserAnalyses,
  coreDealers,
  coreListings,
} from "@shared/warehouse";
import { normalizeDealerName, refreshAllViews } from "./warehouseUtils";

// Sentinel city value for unknown dealer rows (state name as city)
const STATE_FULL_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas",
  CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho",
  IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah",
  VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia",
  WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia",
};

function buildSentinelName(stateCode: string | null | undefined): {
  dealerName: string;
  city: string;
  stateCode: string;
} {
  const code = (stateCode ?? "XX").toUpperCase();
  const city = STATE_FULL_NAMES[code] ?? code;
  return {
    dealerName: `Unknown Dealer - ${code}`,
    city,
    stateCode: code,
  };
}

async function getOrCreateDealer(
  dealerName: string,
  city: string,
  stateCode: string
): Promise<string> {
  const normalized = normalizeDealerName(dealerName);

  // Attempt look up existing
  const existing = await db
    .select({ id: coreDealers.id })
    .from(coreDealers)
    .where(
      sql`dealer_name_normalized = ${normalized} AND state_code = ${stateCode} AND city = ${city}`
    )
    .limit(1);

  if (existing.length > 0) return existing[0].id;

  // Insert
  const inserted = await db
    .insert(coreDealers)
    .values({
      dealerName,
      dealerNameNormalized: normalized,
      city,
      stateCode,
    })
    .onConflictDoNothing()
    .returning({ id: coreDealers.id });

  if (inserted.length > 0) return inserted[0].id;

  // Race condition: another process inserted first — refetch
  const refetch = await db
    .select({ id: coreDealers.id })
    .from(coreDealers)
    .where(
      sql`dealer_name_normalized = ${normalized} AND state_code = ${stateCode} AND city = ${city}`
    )
    .limit(1);
  return refetch[0].id;
}

function toStr(val: unknown): string | null {
  if (val == null) return null;
  const n = Number(val);
  return isNaN(n) ? null : n.toFixed(2);
}

async function main(): Promise<void> {
  console.log("[backfill] Starting dealer_submissions backfill…");

  // Load all dealer_submissions
  const submissions = await db.select().from(dealerSubmissions);
  console.log(`[backfill] Found ${submissions.length} submissions to process.`);

  let skipped = 0;
  let processed = 0;
  let errors = 0;

  for (const sub of submissions) {
    try {
      // ── Granular idempotency: check raw.user_analyses and core.listings independently ─
      // This allows reruns to repair partial failures where only one table was written.
      const rawExists = await db
        .select({ id: rawUserAnalyses.id })
        .from(rawUserAnalyses)
        .where(sql`dealer_submission_id = ${sub.id}`)
        .limit(1);

      const listingExists = await db
        .select({ id: coreListings.id })
        .from(coreListings)
        .where(
          sql`ingestion_source = 'internal_backfill'
              AND analyzed_at = ${sub.submittedAt}
              AND state_code ${sub.stateCode ? sql`= ${sub.stateCode}` : sql`IS NULL`}`
        )
        .limit(1);

      const rawAlreadyWritten = rawExists.length > 0;
      const listingAlreadyWritten = listingExists.length > 0;

      if (rawAlreadyWritten && listingAlreadyWritten) {
        skipped++;
        continue;
      }

      // ── (a) Insert into raw.user_analyses (skip if already present) ────
      const detectedFields = sub.detectedFields as Record<string, unknown> | null;

      const vehicleYear: number | null = (() => {
        const y = detectedFields?.vehicleYear ?? detectedFields?.year;
        const n = Number(y);
        return Number.isInteger(n) && n > 2000 && n < 2030 ? n : null;
      })();
      const vehicleMake: string | null =
        (detectedFields?.vehicleMake as string | undefined) ?? null;
      const vehicleModel: string | null =
        (detectedFields?.vehicleModel as string | undefined) ?? null;
      const verdict: string | null = sub.goNoGo ?? null;

      if (!rawAlreadyWritten) {
        await db
          .insert(rawUserAnalyses)
          .values({
            dealerSubmissionId: sub.id,
            stateCode: sub.stateCode,
            vehicleYear,
            vehicleMake,
            vehicleModel,
            analysisResult: sub.detectedFields,
            dealScore: sub.dealScore === "GREEN" ? 75
              : sub.dealScore === "YELLOW" ? 50
              : sub.dealScore === "RED" ? 25
              : null,
            verdict,
            flags: [
              ...(sub.flagMarketAdjustment ? ["market_adjustment"] : []),
              ...(sub.flagPaymentOnly ? ["payment_only"] : []),
              ...(sub.flagMissingOtd ? ["missing_otd"] : []),
              ...(sub.flagVagueFees ? ["vague_fees"] : []),
              ...(sub.flagHighCostAddons ? ["high_cost_addons"] : []),
            ],
            ingestionSource: "internal_backfill",
            submittedAt: sub.submittedAt,
            retentionExpiresAt: sub.rawTextExpiresAt,
          })
          .returning({ id: rawUserAnalyses.id });
      }

      // ── (b) Upsert core.dealers ────────────────────────────────────────
      // Try to extract a dealer name from detectedFields
      const detectedDealerName =
        (detectedFields?.dealerName as string | undefined) ??
        (detectedFields?.dealership as string | undefined) ??
        null;

      let dealerName: string;
      let dealerCity: string;
      let dealerState: string;

      if (detectedDealerName && sub.stateCode) {
        dealerName = detectedDealerName.trim();
        dealerCity = sub.stateCode;
        dealerState = sub.stateCode;
      } else {
        const sentinel = buildSentinelName(sub.stateCode);
        dealerName = sentinel.dealerName;
        dealerCity = sentinel.city;
        dealerState = sentinel.stateCode;
      }

      const dealerId = await getOrCreateDealer(dealerName, dealerCity, dealerState);

      // ── (c) Insert into core.listings (only if not already written) ────
      if (listingAlreadyWritten) {
        processed++;
        continue;
      }

      const isFullyProcessed = sub.dealScore !== null;
      const countsTowardRealDeals = isFullyProcessed;

      const fees = Array.isArray(detectedFields?.fees)
        ? (detectedFields.fees as { name: string; amount: number | null }[])
        : [];
      const feeNames = Array.from(new Set(fees.map((f) => f.name.toLowerCase().trim())));

      const hasMarketAdj = sub.flagMarketAdjustment;
      const marketAdjustment = fees
        .filter((f) => /market.?adjust|markup|adm/i.test(f.name))
        .reduce((sum, f) => sum + (f.amount ?? 0), 0);

      const addonTotal = fees
        .filter(
          (f) =>
            /dealer.?add|add.?on|package/i.test(f.name) &&
            (f.amount ?? 0) >= 500,
        )
        .reduce((sum, f) => sum + (f.amount ?? 0), 0);

      const docFee =
        fees.find((f) => /doc.?fee|document/i.test(f.name))?.amount ?? null;

      const dealScoreNum =
        sub.dealScore === "GREEN" ? 75
        : sub.dealScore === "YELLOW" ? 50
        : sub.dealScore === "RED" ? 25
        : null;

      const listedPrice = toStr(detectedFields?.salePrice);
      const otdPrice = toStr(detectedFields?.outTheDoorPrice ?? sub.otdPrice);
      const feeToPrice =
        otdPrice && sub.totalFeesAmount
          ? String(Number(sub.totalFeesAmount) / Number(otdPrice))
          : null;

      await db.insert(coreListings).values({
        dealerId,
        ingestionSource: "internal_backfill",
        isFullyProcessed,
        countsTowardRealDeals,
        analysisVersion: 1,
        isDuplicate: false,
        isTestData: false,
        hasPipelineError: false,
        vehicleYear,
        vehicleMake,
        vehicleModel,
        listedPrice,
        otdPrice,
        monthlyPayment: toStr(detectedFields?.monthlyPayment ?? sub.monthlyPayment),
        aprValue: toStr(detectedFields?.apr ?? sub.apr),
        loanTermMonths: sub.termMonths ?? null,
        downPayment: toStr(detectedFields?.downPayment ?? sub.downPayment),
        docFee: docFee !== null ? String(docFee) : null,
        docFeeOverStateCap: null,
        marketAdjustment: hasMarketAdj && marketAdjustment > 0 ? String(marketAdjustment) : null,
        addonTotal: addonTotal > 0 ? String(addonTotal) : null,
        feeNames,
        flagCount: [
          sub.flagMarketAdjustment,
          sub.flagPaymentOnly,
          sub.flagMissingOtd,
          sub.flagVagueFees,
          sub.flagHighCostAddons,
        ].filter(Boolean).length,
        dealScore: dealScoreNum,
        verdict,
        flags: [
          ...(sub.flagMarketAdjustment ? ["market_adjustment"] : []),
          ...(sub.flagPaymentOnly ? ["payment_only"] : []),
          ...(sub.flagMissingOtd ? ["missing_otd"] : []),
          ...(sub.flagVagueFees ? ["vague_fees"] : []),
          ...(sub.flagHighCostAddons ? ["high_cost_addons"] : []),
        ],
        feeToPrice,
        stateCode: sub.stateCode,
        listingDate: sub.submittedAt.toISOString().slice(0, 10),
        analyzedAt: sub.submittedAt,
      });

      processed++;

      if ((processed + skipped) % 50 === 0) {
        console.log(
          `[backfill] Processed: ${processed}, Skipped: ${skipped}, Errors: ${errors}`
        );
      }
    } catch (err) {
      console.error(`[backfill] Error on submission ${sub.id}:`, err);
      errors++;
    }
  }

  console.log(
    `[backfill] Complete. Processed: ${processed}, Skipped: ${skipped}, Errors: ${errors}`
  );

  await refreshAllViews();
  process.exit(0);
}

main().catch((err) => {
  console.error("[backfill] Fatal error:", err);
  process.exit(1);
});
