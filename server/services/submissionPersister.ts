import { storage } from "../storage";
import { zipToStateCode } from "../zipToState";
import { redactPII } from "../piiRedact";
import { normalizeSubmissionText, sha256Hex } from "../warehouse/warehouseUtils";
import type { AnalysisRequest, AnalysisResponse } from "@shared/schema";

export async function saveSubmission(
  data: AnalysisRequest,
  finalResult: AnalysisResponse,
): Promise<string | null> {
  try {
    const stateCode = zipToStateCode(data.zipCode);
    const fees = finalResult.detectedFields.fees ?? [];
    const feeAmounts = fees.map((f) => f.amount).filter((a): a is number => a !== null);
    const toNum = (n: number | null | undefined): string | null => (n != null ? String(n) : null);
    const contentHash = sha256Hex(normalizeSubmissionText(data.dealerText));

    const submissionRow = await storage.saveDealerSubmission({
      analysisVersion: "v2",
      dealScore: finalResult.dealScore,
      confidenceLevel: finalResult.confidenceLevel,
      goNoGo: finalResult.goNoGo,
      verdictLabel: finalResult.verdictLabel,
      condition: data.condition,
      purchaseType: data.purchaseType,
      source: data.source ?? "paste",
      stateCode,
      contentHash,
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
        feeAmounts.length > 0 ? String(feeAmounts.reduce((a, b) => a + b, 0)) : null,
      feeCount: fees.length,
      feeNames: Array.from(new Set(fees.map((f) => f.name.toLowerCase().trim()))),
      flagMarketAdjustment: fees.some((f) => /market.?adjust|markup|adm/i.test(f.name)),
      flagPaymentOnly:
        finalResult.detectedFields.monthlyPayment !== null &&
        finalResult.detectedFields.salePrice === null &&
        finalResult.detectedFields.outTheDoorPrice === null,
      flagMissingOtd: finalResult.detectedFields.outTheDoorPrice === null,
      flagVagueFees: fees.some((f) =>
        /protection|nitrogen|etch|ceramic|fabric|undercoat|pinstripe/i.test(f.name),
      ),
      flagHighCostAddons:
        fees.filter((f) => /dealer.?add|add.?on|package/i.test(f.name) && (f.amount ?? 0) >= 500)
          .length > 0,
      highCostAddonCount: fees.filter((f) => (f.amount ?? 0) >= 500).length,
      missingInfoCount: finalResult.missingInfo?.length ?? 0,
      detectedFields: finalResult.detectedFields,
      rawTextRedacted: redactPII(data.dealerText),
      rawTextStoredAt: new Date(),
      rawTextExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });
    return submissionRow?.id ?? null;
  } catch (saveErr) {
    console.error("[analyze] pre-save submission failed (non-fatal):", saveErr);
    return null;
  }
}
