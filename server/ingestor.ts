/**
 * Submission ingestion abstraction layer.
 *
 * enqueueSubmission() fires after the HTTP response has already been sent,
 * so the user is never blocked by storage writes.
 *
 * To swap setImmediate for a real job queue (Bull, BullMQ, Temporal, etc.)
 * in the future, replace only the body of this function — no route changes needed.
 */
import { storage } from "./storage";
import { redactPII } from "./piiRedact";
import { zipToStateCode } from "./zipToState";
import type { AnalysisResponse, AnalysisRequest } from "@shared/schema";

export interface SubmissionPayload {
  request: AnalysisRequest;
  result: AnalysisResponse;
}

export function enqueueSubmission(payload: SubmissionPayload): void {
  // Non-blocking: setImmediate fires after the current event loop tick,
  // well after res.json() has completed.
  setImmediate(async () => {
    try {
      const { request: data, result: finalResult } = payload;

      const stateCode = zipToStateCode(data.zipCode);
      const fees = finalResult.detectedFields.fees ?? [];
      const feeAmounts = fees
        .map((f) => f.amount)
        .filter((a): a is number => a !== null);

      // Numeric values are passed as strings — Drizzle's numeric() type maps to
      // PostgreSQL NUMERIC which preserves precision; JS strings avoid float drift.
      const toNum = (n: number | null | undefined): string | null =>
        n != null ? String(n) : null;

      const submission = await storage.saveDealerSubmission({
        analysisVersion: "v1",
        dealScore: finalResult.dealScore,
        confidenceLevel: finalResult.confidenceLevel,
        goNoGo: finalResult.goNoGo,
        verdictLabel: finalResult.verdictLabel,
        condition: data.condition,
        purchaseType: data.purchaseType,
        source: data.source ?? "paste",
        stateCode,

        // Financial signals
        salePrice: toNum(finalResult.detectedFields.salePrice),
        msrp: toNum(finalResult.detectedFields.msrp),
        otdPrice: toNum(finalResult.detectedFields.outTheDoorPrice),
        monthlyPayment: toNum(finalResult.detectedFields.monthlyPayment),
        apr: toNum(finalResult.detectedFields.apr),
        termMonths: finalResult.detectedFields.termMonths,
        downPayment: toNum(finalResult.detectedFields.downPayment),
        rebates: toNum(finalResult.detectedFields.rebates),
        tradeInValue: toNum(finalResult.detectedFields.tradeInValue),
        totalFeesAmount:
          feeAmounts.length > 0
            ? String(feeAmounts.reduce((a, b) => a + b, 0))
            : null,

        // Fee intelligence
        feeCount: fees.length,
        feeNames: Array.from(new Set(fees.map((f) => f.name.toLowerCase().trim()))),

        // Tactic flags
        flagMarketAdjustment: fees.some((f) =>
          /market.?adjust|markup|adm/i.test(f.name),
        ),
        flagPaymentOnly:
          finalResult.detectedFields.monthlyPayment !== null &&
          finalResult.detectedFields.salePrice === null &&
          finalResult.detectedFields.outTheDoorPrice === null,
        flagMissingOtd: finalResult.detectedFields.outTheDoorPrice === null,
        flagVagueFees: fees.some((f) =>
          /protection|nitrogen|etch|ceramic|fabric|undercoat|pinstripe/i.test(
            f.name,
          ),
        ),
        flagHighCostAddons:
          fees.filter(
            (f) =>
              /dealer.?add|add.?on|package/i.test(f.name) &&
              (f.amount ?? 0) >= 500,
          ).length > 0,
        highCostAddonCount: fees.filter((f) => (f.amount ?? 0) >= 500).length,
        missingInfoCount: finalResult.missingInfo?.length ?? 0,

        // Full structured payload
        detectedFields: finalResult.detectedFields,

        // Tier 2: PII-redacted text + 90-day expiry
        rawTextRedacted: redactPII(data.dealerText),
        rawTextStoredAt: new Date(),
        rawTextExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });

      // ── Warehouse write path ────────────────────────────────────────────────
      // Failures here are logged but never bubble up to the user's request.
      try {
        if (process.env.DATABASE_URL && submission?.id) {
          const { writeSubmissionToWarehouse } = await import(
            "./warehouse/warehouseWriter"
          );
          await writeSubmissionToWarehouse({
            dealerSubmissionId: submission.id,
            request: data,
            result: finalResult,
            stateCode,
          });
        }
      } catch (warehouseErr) {
        console.error(
          "[submission-ingestor] warehouse write failed (non-fatal):",
          warehouseErr,
        );
      }
    } catch (err) {
      console.error("[submission-ingestor] non-blocking write failed:", err);
      // Never rethrows — user already has their result
    }
  });
}
