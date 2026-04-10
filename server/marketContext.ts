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
 *
 * ---------------------------------------------------------------------------
 * Seeded-data policy (cold-start data flywheel)
 * ---------------------------------------------------------------------------
 * Seeded rows (curated forum-derived quotes, tagged via seedForumQuotes.ts)
 * are handled metric-by-metric — NOT via a global include/exclude filter.
 *
 *  STATE-LEVEL aggregates — seeded rows ALLOWED.
 *   - Reads from `core.state_stats`, which aggregates ALL `core.listings`
 *     regardless of ingestion_source. Seeded rows (ingestion_source = 'seed')
 *     naturally contribute to avgDocFee / avgDealScore at the state level.
 *   - The `core.state_stats` definition already filters out rows where
 *     the aggregated field is NULL (`AVG(...)` ignores NULLs), satisfying
 *     the "partial rows cannot pollute averages" rule.
 *   - Seeded rows with no stateCode never contribute, because
 *     `core.state_stats` groups by `state_code` and the seed script
 *     refuses to propagate a listing without a valid state.
 *
 *  DEALER-LEVEL aggregates — seeded rows DISALLOWED.
 *   - `core.dealers.listing_count` is a counter maintained by the warehouse
 *     writer. The seed script (seedForumQuotes.ts::tagSeededRow) DECREMENTS
 *     this counter immediately after tagging a row as seed, so the counter
 *     reflects only real user submissions. `getDealerStats()` below reads
 *     that counter and naturally excludes seeded rows.
 *   - `core.dealer_feedback_stats` joins `deal_feedback` → `dealer_submissions`
 *     → `core.listings.dealer_id`. Seeded rows never receive feedback, so
 *     they do not contribute to feedback aggregates.
 *
 *  TACTIC FLAGS (flag_market_adjustment, flag_vague_fees, ...) — HARD RULE.
 *   - These are LLM inferences from reconstructed prose when the source row
 *     is seeded. This file MUST NOT aggregate on `flag_*` columns in any
 *     seeded-inclusive query. Every aggregate here uses numeric columns
 *     (doc_fee, deal_score) only.
 *
 * Changes to this file that introduce new aggregates must classify the new
 * metric against this policy before merging.
 */
import { db } from "./db.js";
import { sql } from "drizzle-orm";
import type { MarketContext, MarketContextStrength } from "../shared/schema.js";
import { normalizeDealerName } from "./warehouse/warehouseUtils.js";

const DOC_FEE_DELTA_MAX = 2000;

export function getStrength(sampleSize: number): MarketContextStrength {
  if (sampleSize <= 0) return "none";
  if (sampleSize <= 2) return "thin";
  if (sampleSize <= 9) return "moderate";
  return "strong";
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
      return null;
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
