/**
 * Live warehouse write path for user-submitted analyses.
 *
 * Called from server/ingestor.ts inside the setImmediate block, AFTER the
 * dealer_submissions row has been successfully written.  All failures are
 * caught by the caller — nothing here should ever throw to the user.
 */
import { db } from "../db";
import { sql, eq, and } from "drizzle-orm";
import type { AnalysisResponse, AnalysisRequest, DetectedFields } from "@shared/schema";
import { failedWarehouseWrites, detectedFieldsSchema } from "@shared/schema";
import { rawUserAnalyses, coreDealers, coreListings } from "@shared/warehouse";
import {
  normalizeDealerName,
  validateStateCode,
  delay,
  getBackoffMs,
  validateFinancialBounds,
  safeSerializePayload,
  getErrorMessage,
} from "./warehouseUtils";

export interface WarehouseWritePayload {
  dealerSubmissionId: string;
  request: AnalysisRequest;
  result: AnalysisResponse;
  stateCode: string | null;
  contentHash?: string | null;
}

function toStr(val: number | null | undefined): string | null {
  if (val == null) return null;
  return val.toFixed(2);
}

/**
 * Upsert a dealer row. Returns the dealer ID without touching listing_count.
 * The caller is responsible for incrementing the counter only when a new
 * listing row is actually inserted (not on conflict / replay).
 *
 * state_code must be a valid seeded US code or null to avoid FK violation
 * on core.states.
 */
async function getOrCreateDealerRow(
  dealerName: string,
  city: string,
  validStateCode: string | null,
): Promise<string> {
  const normalized = normalizeDealerName(dealerName);

  // Build WHERE clause that handles null state correctly
  const stateWhere = validStateCode
    ? sql`state_code = ${validStateCode}`
    : sql`state_code IS NULL`;

  const existing = await db
    .select({ id: coreDealers.id })
    .from(coreDealers)
    .where(sql`dealer_name_normalized = ${normalized} AND ${stateWhere} AND city = ${city}`)
    .limit(1);

  if (existing.length > 0) return existing[0].id;

  const inserted = await db
    .insert(coreDealers)
    .values({
      dealerName,
      dealerNameNormalized: normalized,
      city,
      stateCode: validStateCode,
      listingCount: 0,
    })
    .onConflictDoNothing()
    .returning({ id: coreDealers.id });

  if (inserted.length > 0) return inserted[0].id;

  // Race condition fallback
  const refetch = await db
    .select({ id: coreDealers.id })
    .from(coreDealers)
    .where(sql`dealer_name_normalized = ${normalized} AND ${stateWhere} AND city = ${city}`)
    .limit(1);
  return refetch[0].id;
}

/** Increment listing_count on a dealer row after a confirmed new listing insert. */
async function incrementDealerListingCount(dealerId: string): Promise<void> {
  await db.execute(
    sql`UPDATE core.dealers
        SET listing_count = listing_count + 1, last_seen_at = NOW()
        WHERE id = ${dealerId}`,
  );
}

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

const MAX_ATTEMPTS = 3;

async function performWarehouseWrite(payload: WarehouseWritePayload): Promise<void> {
  const { dealerSubmissionId, request: data, result: finalResult, stateCode, contentHash } = payload;
  const fees = finalResult.detectedFields.fees ?? [];

  // Validate state to prevent FK violations
  const validState = validateStateCode(stateCode);

  // ── (a) raw.user_analyses — idempotent via dealer_submission_id ────────────
  // ON CONFLICT DO NOTHING ensures replaying the same DLQ row doesn't create
  // a duplicate raw.user_analyses record.
  await db.insert(rawUserAnalyses).values({
    dealerSubmissionId,
    stateCode: validState,
    analysisResult: finalResult.detectedFields,
    dealScore:
      finalResult.dealScore === "GREEN" ? 75
      : finalResult.dealScore === "YELLOW" ? 50
      : finalResult.dealScore === "RED" ? 25
      : null,
    verdict: finalResult.goNoGo,
    flags: [
      ...(fees.some((f) => /market.?adjust|markup|adm/i.test(f.name)) ? ["market_adjustment"] : []),
      ...(finalResult.detectedFields.outTheDoorPrice === null ? ["missing_otd"] : []),
      ...(fees.some((f) => /protection|nitrogen|etch|ceramic|fabric|undercoat|pinstripe/i.test(f.name)) ? ["vague_fees"] : []),
    ],
    ingestionSource: "user_submitted",
    retentionExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  }).onConflictDoNothing();

  // ── (b) core.dealers ───────────────────────────────────────────────────────
  // Try to extract dealer-identifying text from the analysis result.
  const detectedFieldsRaw = finalResult.detectedFields as Record<string, unknown>;
  const extractedDealerName: string | null =
    (detectedFieldsRaw?.dealerName as string | undefined) ??
    (detectedFieldsRaw?.dealership as string | undefined) ??
    null;

  // Simple heuristic on request.dealerText
  let textDealerName: string | null = null;
  if (!extractedDealerName && data.dealerText) {
    const atMatch = data.dealerText.match(
      /(?:from|at|with|visit(?:ing)?)\s+([A-Z][a-zA-Z0-9 &'-]{3,40}?)\s*(?:Toyota|Honda|Ford|Chevrolet|Chevy|Nissan|Hyundai|Kia|Ram|Dodge|Jeep|Subaru|Mazda|Volkswagen|VW|BMW|Mercedes|Audi|Lexus|Cadillac|Buick|GMC|Chrysler|Volvo|Tesla|Rivian|Lucid|Genesis|Infiniti|Acura|Lincoln|Mitsubishi|MINI|Porsche|Land Rover|Jaguar|Maserati)/i
    );
    if (atMatch?.[0]) {
      const fullMatch = atMatch[0];
      const makeMatch = fullMatch.match(
        /Toyota|Honda|Ford|Chevrolet|Chevy|Nissan|Hyundai|Kia|Ram|Dodge|Jeep|Subaru|Mazda|Volkswagen|VW|BMW|Mercedes|Audi|Lexus|Cadillac|Buick|GMC|Chrysler|Volvo|Tesla|Rivian|Lucid|Genesis|Infiniti|Acura|Lincoln|Mitsubishi|MINI|Porsche|Land Rover|Jaguar|Maserati/i
      );
      if (makeMatch) {
        const makeIdx = fullMatch.indexOf(makeMatch[0]);
        const prefixClean = fullMatch
          .slice(0, makeIdx + makeMatch[0].length)
          .replace(/^(?:from|at|with|visit(?:ing)?)\s+/i, "")
          .trim();
        if (prefixClean.length >= 4) textDealerName = prefixClean;
      }
    }
  }

  // Resolve sentinel details — dealer name includes raw code for human readability
  // but stateCode stored in DB is always null when state is unknown
  const rawStateCode = stateCode ?? "XX";
  const sentinelCity = STATE_FULL_NAMES[rawStateCode] ?? rawStateCode;

  const resolvedDealerName = extractedDealerName ?? textDealerName ?? `Unknown Dealer - ${rawStateCode}`;
  const dealerCity = (extractedDealerName || textDealerName) ? (validState ?? rawStateCode) : sentinelCity;

  const dealerId = await getOrCreateDealerRow(resolvedDealerName, dealerCity, validState);

  // ── (c) core.listings ─────────────────────────────────────────────────────
  const hasMarketAdj = fees.some((f) => /market.?adjust|markup|adm/i.test(f.name));
  const marketAdjustment = fees
    .filter((f) => /market.?adjust|markup|adm/i.test(f.name))
    .reduce((sum, f) => sum + (f.amount ?? 0), 0);

  const addonTotal = fees
    .filter(
      (f) =>
        /dealer.?add|add.?on|package/i.test(f.name) && (f.amount ?? 0) >= 500,
    )
    .reduce((sum, f) => sum + (f.amount ?? 0), 0);

  const docFeeAmount =
    fees.find((f) => /doc.?fee|document/i.test(f.name))?.amount ?? null;

  const feeNames = Array.from(new Set(fees.map((f) => f.name.toLowerCase().trim())));

  const flagList: string[] = [
    ...(hasMarketAdj ? ["market_adjustment"] : []),
    ...(finalResult.detectedFields.outTheDoorPrice === null ? ["missing_otd"] : []),
    ...(fees.some((f) => /protection|nitrogen|etch|ceramic|fabric|undercoat|pinstripe/i.test(f.name)) ? ["vague_fees"] : []),
  ];

  const otdPrice = toStr(finalResult.detectedFields.outTheDoorPrice);
  const totalFeesAmount = fees
    .map((f) => f.amount)
    .filter((a): a is number => a !== null)
    .reduce((s, a) => s + a, 0);

  const feeToPrice =
    otdPrice && totalFeesAmount > 0
      ? String(totalFeesAmount / Number(otdPrice))
      : null;

  const dealScoreNum =
    finalResult.dealScore === "GREEN" ? 75
    : finalResult.dealScore === "YELLOW" ? 50
    : finalResult.dealScore === "RED" ? 25
    : null;

  const matchingAddons = fees.filter(
    (f) => /dealer.?add|add.?on|package/i.test(f.name) && (f.amount ?? 0) >= 500,
  );
  const feeAmountsForValidation = fees.map((f) => f.amount).filter((a): a is number => a !== null);

  // ── Financial sanity validation ────────────────────────────────────────────
  const sanityFlags = validateFinancialBounds({
    vehiclePrice: finalResult.detectedFields.salePrice,
    tradeInValue: finalResult.detectedFields.tradeInValue,
    docFee: docFeeAmount,
    dealerAddonCost: matchingAddons.length > 0 ? addonTotal : null,
    totalFees: feeAmountsForValidation.length > 0 ? totalFeesAmount : null,
  });

  // ── Content dedup: look for an existing non-duplicate listing with same hash ─
  let isDuplicate = false;
  let duplicateOfListingId: string | null = null;

  if (contentHash) {
    const existing = await db
      .select({ id: coreListings.id })
      .from(coreListings)
      .where(
        and(
          eq(coreListings.contentHash, contentHash),
          eq(coreListings.isDuplicate, false),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      isDuplicate = true;
      duplicateOfListingId = existing[0].id;
    }
  }

  const now = new Date();
  // Idempotent insert: if a listing for this submission already exists (on DLQ
  // replay or duplicate request), ON CONFLICT DO NOTHING returns an empty array.
  // We only increment the dealer listing_count when a genuinely new row is inserted.
  const insertedListings = await db.insert(coreListings).values({
    dealerId,
    dealerSubmissionId,
    ingestionSource: "user_submitted",
    isFullyProcessed: true,
    countsTowardRealDeals: true,
    analysisVersion: 1,
    isDuplicate,
    duplicateOfListingId,
    isTestData: false,
    hasPipelineError: false,
    contentHash: contentHash ?? null,
    sanityFlags,
    listedPrice: toStr(finalResult.detectedFields.salePrice),
    otdPrice,
    monthlyPayment: toStr(finalResult.detectedFields.monthlyPayment),
    aprValue: toStr(finalResult.detectedFields.apr),
    loanTermMonths: finalResult.detectedFields.termMonths ?? null,
    downPayment: toStr(finalResult.detectedFields.downPayment),
    docFee: docFeeAmount !== null ? String(docFeeAmount) : null,
    docFeeOverStateCap: null,
    marketAdjustment: hasMarketAdj && marketAdjustment > 0 ? String(marketAdjustment) : null,
    addonTotal: addonTotal > 0 ? String(addonTotal) : null,
    feeNames,
    flagCount: flagList.length,
    dealScore: dealScoreNum,
    verdict: finalResult.goNoGo,
    flags: flagList,
    feeToPrice,
    stateCode: validState,
    listingDate: now.toISOString().slice(0, 10),
    analyzedAt: now,
  }).onConflictDoNothing().returning({ id: coreListings.id });

  const newListingInserted = insertedListings.length > 0;

  // Only increment the dealer aggregate counter when a truly new listing row was
  // inserted. On DLQ replay the listing already exists (conflict), so we skip
  // the increment to keep replay side effects fully idempotent.
  if (newListingInserted) {
    await incrementDealerListingCount(dealerId);
  }

  console.log(
    `[warehouse] Wrote submission ${dealerSubmissionId} to warehouse (state=${validState ?? "unknown"}, score=${finalResult.dealScore}, duplicate=${isDuplicate}, newListing=${newListingInserted})`,
  );
}

export async function writeSubmissionToWarehouse(
  payload: WarehouseWritePayload,
): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const backoff = getBackoffMs(attempt);
    if (backoff > 0) {
      await delay(backoff);
    }

    try {
      await performWarehouseWrite(payload);
      return;
    } catch (err) {
      lastError = err;
      console.warn(
        `[warehouse] Write attempt ${attempt}/${MAX_ATTEMPTS} failed for submission ${payload.dealerSubmissionId}:`,
        getErrorMessage(err),
      );
    }
  }

  // All attempts exhausted — write to DLQ
  try {
    const now = new Date();
    await db.insert(failedWarehouseWrites).values({
      submissionId: payload.dealerSubmissionId,
      payload: safeSerializePayload({
        dealerSubmissionId: payload.dealerSubmissionId,
        stateCode: payload.stateCode,
        dealScore: payload.result.dealScore,
        verdict: payload.result.goNoGo,
      }),
      errorMessage: getErrorMessage(lastError),
      attemptCount: 0,
      status: "pending",
      maxAttempts: 5,
      nextAttemptAt: now,
      firstFailedAt: now,
      lastFailedAt: now,
      lastErrorMessage: getErrorMessage(lastError).slice(0, 500),
    }).onConflictDoNothing();
    console.error(
      `[warehouse] All ${MAX_ATTEMPTS} attempts failed for submission ${payload.dealerSubmissionId}. Written to DLQ.`,
    );
  } catch (dlqErr) {
    console.error(
      `[warehouse] CRITICAL: Failed to write to DLQ for submission ${payload.dealerSubmissionId}:`,
      getErrorMessage(dlqErr),
    );
  }
}

/**
 * Exported for DLQ replay: re-attempt a warehouse write for a given submission.
 * Reconstructs the payload from the dealer_submissions table and performs the write.
 * The write is idempotent — duplicate records are silently skipped.
 */
export async function performWarehouseWriteById(
  submissionId: string,
  _dlqPayload: Record<string, unknown>,
): Promise<void> {
  const { storage } = await import("../storage");
  const submission = await storage.getDealerSubmission(submissionId);
  if (!submission) {
    throw new Error(`DLQ replay: submission ${submissionId} not found in dealer_submissions`);
  }

  const { zipToStateCode } = await import("../zipToState");
  const { normalizeSubmissionText, sha256Hex } = await import("./warehouseUtils");

  // Reconstruct a minimal WarehouseWritePayload from the stored submission row
  const stateCode = submission.stateCode ?? zipToStateCode(submission.zipCode ?? "");
  const contentHash = submission.contentHash ?? (
    submission.rawTextRedacted ? sha256Hex(normalizeSubmissionText(submission.rawTextRedacted)) : null
  );

  // We don't have the original AnalysisRequest/AnalysisResponse objects for DLQ replay,
  // so we synthesize minimal ones from the stored submission data.
  const fallbackDetectedFields: DetectedFields = {
    salePrice: submission.salePrice != null ? Number(submission.salePrice) : null,
    msrp: submission.msrp != null ? Number(submission.msrp) : null,
    rebates: null,
    fees: [],
    outTheDoorPrice: submission.otdPrice != null ? Number(submission.otdPrice) : null,
    monthlyPayment: submission.monthlyPayment != null ? Number(submission.monthlyPayment) : null,
    tradeInValue: null,
    apr: null,
    termMonths: null,
    downPayment: null,
  };

  const parsedDetectedFields = detectedFieldsSchema.safeParse(submission.detectedFields);
  const detectedFields: DetectedFields = parsedDetectedFields.success
    ? parsedDetectedFields.data
    : fallbackDetectedFields;

  const syntheticRequest: AnalysisRequest = {
    dealerText: submission.rawTextRedacted ?? "",
    condition: (submission.condition as AnalysisRequest["condition"]) ?? "unknown",
    purchaseType: (submission.purchaseType as AnalysisRequest["purchaseType"]) ?? "unknown",
  };

  const syntheticResult: AnalysisResponse = {
    dealScore: (submission.dealScore as AnalysisResponse["dealScore"]) ?? "YELLOW",
    confidenceLevel: (submission.confidenceLevel as AnalysisResponse["confidenceLevel"]) ?? "MEDIUM",
    verdictLabel: submission.verdictLabel ?? "",
    goNoGo: (submission.goNoGo as AnalysisResponse["goNoGo"]) ?? "NEED-MORE-INFO",
    summary: "",
    detectedFields,
    missingInfo: [],
    suggestedReply: "",
    reasoning: "",
  };

  await performWarehouseWrite({
    dealerSubmissionId: submissionId,
    request: syntheticRequest,
    result: syntheticResult,
    stateCode,
    contentHash,
  });
}
