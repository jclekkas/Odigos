/**
 * getMarketContext — best-effort market intelligence enrichment for analyze responses.
 *
 * Contract:
 * - Returns null immediately if state is falsy — no recovery logic.
 * - Dealer lookup uses only exact normalized match — no LIKE, no fuzzy.
 * - Wrapped in both a 200ms timeout guard (Promise.race) and a try/catch.
 * - Slow warehouse queries and errors both degrade gracefully without blocking /api/analyze.
 * - When returning a non-null result, all keys are always present (null for missing values).
 * - docFeeVsStateAvg is clamped: if abs > 2000, set to null (prevents absurd comparisons).
 * - sampleSize thresholds replaced by graded confidence tiers (none/thin/moderate/strong).
 * - Data is returned whenever sampleSize >= 1; strength communicates data quality.
 */
import { db } from "./db";
import { sql } from "drizzle-orm";
import type { AnalysisResponse, MarketContext, MarketContextStrength } from "@shared/schema";
import { normalizeDealerName } from "./warehouse/warehouseUtils";

const DOC_FEE_DELTA_MAX = 2000;

export function buildMarketContextSummary(
  strength: MarketContextStrength,
  mc: MarketContext | null,
  stateCode: string | null,
): string | undefined {
  if (!mc) return undefined;
  const state = stateCode ?? mc.stateCode ?? "this area";

  if (mc.isNationalFallback) {
    return `Based on national pricing data (state average builds with more ${state} quotes)`;
  }

  if (strength === "none") return undefined;

  const strengthRank: Record<MarketContextStrength, number> = { none: 0, thin: 1, moderate: 2, strong: 3 };
  const stateRank = strengthRank[mc.stateStrength ?? "none"];
  const dealerRank = strengthRank[mc.dealerStrength ?? "none"];
  const feedbackRank = strengthRank[mc.feedbackStrength ?? "none"];

  let sampleSize: number;
  let sourceLabel: string;
  if (dealerRank >= stateRank && dealerRank >= feedbackRank && (mc.dealerSampleSize ?? 0) >= 1) {
    sampleSize = mc.dealerSampleSize ?? mc.dealerAnalysisCount ?? 0;
    sourceLabel = "dealer quotes";
  } else if (feedbackRank >= stateRank && feedbackRank >= dealerRank && (mc.feedbackSampleSize ?? 0) >= 1) {
    sampleSize = mc.feedbackSampleSize ?? mc.feedbackCount ?? 0;
    sourceLabel = "user feedback ratings";
  } else {
    sampleSize = mc.stateTotalAnalyses ?? 0;
    sourceLabel = "similar deals";
  }

  const sampleDisplay = strength === "strong" || sampleSize >= 10 ? `${sampleSize}+` : String(sampleSize);
  const introPhrase =
    strength === "strong" ? "Based on strong local data" :
    strength === "moderate" ? "Based on local data" :
    "Based on early deal data";
  const dealWord = sampleSize === 1 && sourceLabel === "similar deals" ? "similar deal" : sourceLabel;
  return `${introPhrase} — ${sampleDisplay} ${dealWord} in ${state}`;
}

export function getStrength(sampleSize: number): MarketContextStrength {
  if (sampleSize <= 0) return "none";
  if (sampleSize <= 2) return "thin";
  if (sampleSize <= 9) return "moderate";
  return "strong";
}

async function getNationalFallback(): Promise<{
  nationalTotalAnalyses: number | null;
  nationalAvgDocFee: number | null;
} | null> {
  try {
    const result = await db.execute<{
      total_listings: string | null;
      avg_doc_fee: string | null;
    }>(sql`
      SELECT total_listings, avg_doc_fee
      FROM core.national_stats
      LIMIT 1
    `);
    const row = result.rows?.[0];
    if (!row) return null;
    const total = row.total_listings != null ? Number(row.total_listings) : null;
    if (!total || total < 1) return null;
    return {
      nationalTotalAnalyses: total,
      nationalAvgDocFee: row.avg_doc_fee != null ? Number(row.avg_doc_fee) : null,
    };
  } catch {
    return null;
  }
}

export async function getDealerStats({
  state,
  dealerName,
}: {
  state: string;
  dealerName: string;
}): Promise<{ dealerAnalysisCount: number; dealerAvgDealScore: number | null } | null> {
  const timeoutPromise = new Promise<null>((resolve) =>
    setTimeout(() => resolve(null), 200),
  );

  const workPromise = (async () => {
    const normalized = normalizeDealerName(dealerName);
    const dealerResult = await db.execute<{
      listing_count: string;
      avg_deal_score: string | null;
    }>(
      sql`
        SELECT listing_count, avg_deal_score
        FROM core.dealers
        WHERE dealer_name_normalized = ${normalized}
          AND state_code = ${state}
        LIMIT 1
      `,
    );
    const dealerRow = dealerResult.rows?.[0];
    if (!dealerRow) return null;
    const count = Number(dealerRow.listing_count);
    if (count < 1) return null;
    return {
      dealerAnalysisCount: count,
      dealerAvgDealScore: dealerRow.avg_deal_score != null ? Number(dealerRow.avg_deal_score) : null,
    };
  })();

  try {
    return await Promise.race([workPromise, timeoutPromise]);
  } catch (err) {
    console.error("[marketContext] getDealerStats failed (non-fatal):", err);
    return null;
  }
}

export async function getMarketContext({
  state,
  dealerName,
  docFee,
}: {
  state: string | null | undefined;
  dealerName: string | null | undefined;
  docFee: number | null | undefined;
}): Promise<MarketContext | null> {
  if (!state) return null;

  const timeoutPromise = new Promise<null>((resolve) =>
    setTimeout(() => resolve(null), 200),
  );

  const workPromise = (async (): Promise<MarketContext | null> => {
    const stateResult = await db.execute<{
      listing_count: string;
      avg_deal_score: string | null;
      avg_doc_fee: string | null;
    }>(
      sql`
        SELECT listing_count, avg_deal_score, avg_doc_fee
        FROM core.state_stats
        WHERE state_code = ${state}
        LIMIT 1
      `,
    );

    const stateRow = stateResult.rows?.[0];
    const stateSampleSize = stateRow ? Number(stateRow.listing_count) : 0;

    if (stateSampleSize < 1) {
      // No state data — try national fallback
      const national = await getNationalFallback();
      if (!national) return null;
      return {
        stateCode: state,
        stateTotalAnalyses: null,
        stateAvgDealScore: null,
        stateAvgDocFee: null,
        docFeeVsStateAvg: null,
        dealerAnalysisCount: null,
        dealerAvgDealScore: null,
        stateSampleSize: 0,
        stateStrength: "none",
        dealerSampleSize: 0,
        dealerStrength: "none",
        feedbackSampleSize: 0,
        feedbackStrength: "none",
        overallStrength: "thin",
        isNationalFallback: true,
        nationalTotalAnalyses: national.nationalTotalAnalyses,
        nationalAvgDocFee: national.nationalAvgDocFee,
      };
    }

    const stateStrength = getStrength(stateSampleSize);

    const stateAvgDealScore = stateRow?.avg_deal_score != null
      ? Number(stateRow.avg_deal_score)
      : null;
    const stateAvgDocFee = stateRow?.avg_doc_fee != null
      ? Number(stateRow.avg_doc_fee)
      : null;

    let docFeeVsStateAvg: number | null = null;
    if (docFee != null && stateAvgDocFee != null) {
      const delta = docFee - stateAvgDocFee;
      docFeeVsStateAvg = Math.abs(delta) > DOC_FEE_DELTA_MAX ? null : delta;
    }

    let dealerAnalysisCount: number | null = null;
    let dealerAvgDealScore: number | null = null;
    let dealerSampleSize = 0;
    let dealerStrength: MarketContextStrength = "none";

    let feedbackAgreementPct: number | undefined;
    let feedbackCount: number | undefined;
    let feedbackSampleSize = 0;
    let feedbackStrength: MarketContextStrength = "none";

    if (dealerName) {
      const normalized = normalizeDealerName(dealerName);
      const dealerResult = await db.execute<{
        listing_count: string;
        avg_deal_score: string | null;
        id: string;
      }>(
        sql`
          SELECT id, listing_count, avg_deal_score
          FROM core.dealers
          WHERE dealer_name_normalized = ${normalized}
            AND state_code = ${state}
          LIMIT 1
        `,
      );
      const dealerRow = dealerResult.rows?.[0];
      if (!dealerRow) {
        console.log(`[marketContext] dealer lookup miss: name="${dealerName}" normalized="${normalized}" state=${state}`);
      }
      if (dealerRow) {
        const count = Number(dealerRow.listing_count);
        dealerSampleSize = count;
        dealerStrength = getStrength(count);

        if (count >= 1) {
          dealerAnalysisCount = count;
          dealerAvgDealScore = dealerRow.avg_deal_score != null ? Number(dealerRow.avg_deal_score) : null;

          // Fetch feedback stats from the dealer_feedback_stats view (best-effort).
          try {
            const fbResult = await db.execute<{
              positive_feedback_count: string;
              total_feedback_count: string;
              feedback_agreement_pct: string | null;
            }>(
              sql`
                SELECT positive_feedback_count, total_feedback_count, feedback_agreement_pct
                FROM core.dealer_feedback_stats
                WHERE dealer_id = ${dealerRow.id}
                LIMIT 1
              `,
            );
            const fbRow = fbResult.rows?.[0];
            if (fbRow) {
              const total = Number(fbRow.total_feedback_count);
              feedbackSampleSize = total;
              feedbackStrength = getStrength(total);
              if (total >= 1) {
                feedbackCount = total;
                feedbackAgreementPct = fbRow.feedback_agreement_pct != null
                  ? Number(fbRow.feedback_agreement_pct)
                  : undefined;
              }
            }
          } catch {
            // Feedback stats are optional — never fail the fetch.
          }
        }
      }
    }

    const strengthRank: Record<MarketContextStrength, number> = { none: 0, thin: 1, moderate: 2, strong: 3 };
    const overallStrength: MarketContextStrength = [stateStrength, dealerStrength, feedbackStrength].reduce(
      (best, s) => strengthRank[s] > strengthRank[best] ? s : best,
      "none" as MarketContextStrength,
    );

    return {
      stateCode: state,
      stateTotalAnalyses: stateSampleSize,
      stateAvgDealScore,
      stateAvgDocFee,
      docFeeVsStateAvg,
      dealerAnalysisCount,
      dealerAvgDealScore,
      ...(feedbackCount !== undefined ? { feedbackCount, feedbackAgreementPct } : {}),
      stateSampleSize,
      stateStrength,
      dealerSampleSize,
      dealerStrength,
      feedbackSampleSize,
      feedbackStrength,
      overallStrength,
    };
  })();

  try {
    const result = await Promise.race([workPromise, timeoutPromise]);
    return result;
  } catch (err) {
    console.error("[marketContext] Error fetching market context (non-fatal):", err);
    return null;
  }
}

/**
 * Post-LLM enrichment: updates an existing MarketContext in-place with the
 * detected doc fee delta and, if a dealer name was extracted by the LLM,
 * refreshes dealer stats with the authoritative post-LLM name.
 *
 * Must be called after the LLM response has been validated and finalResult built.
 * All failures are non-fatal and silently swallowed.
 */
export async function enrichMarketContextPostLlm(
  marketContext: MarketContext,
  finalResult: AnalysisResponse,
  state: string,
): Promise<void> {
  const detectedFees = finalResult.detectedFields.fees ?? [];
  const docFeeEntry = detectedFees.find((f) => /doc.?fee|document/i.test(f.name));
  const docFeeValue = docFeeEntry?.amount ?? null;
  if (docFeeValue != null && marketContext.stateAvgDocFee != null && Number.isFinite(docFeeValue)) {
    const delta = docFeeValue - marketContext.stateAvgDocFee;
    marketContext.docFeeVsStateAvg = Math.abs(delta) > DOC_FEE_DELTA_MAX ? null : delta;
  }

  const df = finalResult.detectedFields as Record<string, unknown>;
  const dealerNameForCtx = (df?.dealerName as string | undefined) ?? (df?.dealership as string | undefined) ?? null;
  if (!dealerNameForCtx) return;

  try {
    const dealerStats = await getDealerStats({ state, dealerName: dealerNameForCtx });
    if (!dealerStats) return;
    marketContext.dealerAnalysisCount = dealerStats.dealerAnalysisCount;
    marketContext.dealerAvgDealScore = dealerStats.dealerAvgDealScore;
    const enrichedCount = dealerStats.dealerAnalysisCount ?? 0;
    marketContext.dealerSampleSize = enrichedCount;
    marketContext.dealerStrength = getStrength(enrichedCount);
    const rank: Record<MarketContextStrength, number> = { none: 0, thin: 1, moderate: 2, strong: 3 };
    const candidates: MarketContextStrength[] = [
      marketContext.stateStrength ?? "none",
      marketContext.dealerStrength,
      marketContext.feedbackStrength ?? "none",
    ];
    marketContext.overallStrength = candidates.reduce(
      (best, s) => (rank[s] > rank[best] ? s : best),
      "none" as MarketContextStrength,
    );
  } catch {
    // dealer enrichment is non-fatal
  }
}
