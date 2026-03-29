import { z } from "zod";
import {
  analysisRequestSchema,
  analysisResponseSchema,
  type AnalysisResponse,
  type MarketContext,
  type MarketContextStrength,
} from "@shared/schema";
import { applyRuleEngine, checkDocFeeCap } from "../ruleEngine";
import { detectStateFromText, getStateFeeData, getAmbiguousCityOptions } from "../stateFeeLookup";
import { trackEvent } from "../events";
import { enqueueSubmission } from "../ingestor";
import {
  getMarketContext,
  buildMarketContextSummary,
  enrichMarketContextPostLlm,
} from "../marketContext";
import { buildPrompt } from "./promptBuilder";
import { callAiWithRetry, AnalyzeServiceError } from "./aiCall";
import { saveSubmission } from "./submissionPersister";
import { extractDealerName } from "./dealerNameExtractor";
import { injectDocFeeCapWarnings } from "./docFeeCapWarnings";

export type AnalyzeInput = z.infer<typeof analysisRequestSchema>;
export { AnalyzeServiceError };

export interface AnalyzeServiceResult {
  payload: Record<string, unknown>;
  listingId: string | null;
  stateCode: string | null;
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

export async function runAnalysis(data: AnalyzeInput): Promise<AnalyzeServiceResult> {
  console.log("=== NEW DEAL SUBMISSION ===");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Vehicle:", data.vehicle || "Not specified");
  console.log("Condition:", data.condition, "| Purchase Type:", data.purchaseType);
  console.log("Dealer Text present:", Boolean(data.dealerText), "length:", data.dealerText?.length ?? 0);
  console.log("===========================");

  // 1. State detection + state fee data
  const stateDetection = detectStateFromText(data.dealerText, data.zipCode);
  const stateData = stateDetection.state ? getStateFeeData(stateDetection.state) : null;
  if (!stateData && stateDetection.state) {
    console.warn(`[stateDetection] State ${stateDetection.state} not found in reference JSON — skipping injection`);
  }
  void trackEvent("state_detection", { method: stateDetection.method ?? undefined, state: stateDetection.state ?? undefined });

  // 2. Pre-LLM dealer name extraction
  const preLlmDealerName = data.dealerText ? extractDealerName(data.dealerText) : null;

  // 3. Market context pre-fetch
  let marketContext: MarketContext | null = null;
  if (process.env.DATABASE_URL && stateDetection.state) {
    try {
      marketContext = await getMarketContext({ state: stateDetection.state, dealerName: preLlmDealerName, docFee: null });
    } catch (ctxErr) {
      console.error("[analyze] getMarketContext pre-fetch failed (non-fatal):", ctxErr);
    }
  }

  // 4. Feedback signal telemetry
  const feedbackInjected =
    marketContext?.feedbackCount != null &&
    marketContext.feedbackCount >= 1 &&
    marketContext.feedbackAgreementPct != null &&
    Number.isFinite(marketContext.feedbackAgreementPct);
  console.log(
    `[analyze:feedback] dealerExtracted=${preLlmDealerName != null} dealer=${preLlmDealerName ?? "none"} feedbackInjected=${feedbackInjected}` +
      (feedbackInjected ? ` count=${marketContext!.feedbackCount} agreement=${Math.round(marketContext!.feedbackAgreementPct! * 100)}%` : ""),
  );
  trackEvent("feedback_signal", { dealerExtracted: preLlmDealerName != null, feedbackInjected });

  // 5. Build prompt and call AI
  const overallStrength = marketContext?.overallStrength ?? "none";
  const { systemPrompt, userMessage } = buildPrompt(data, {
    stateData,
    marketContext,
    stateCode: stateDetection.state ?? "",
    overallStrength,
  });
  console.log("Making OpenAI API call with model: gpt-4o, user message length:", userMessage.length);
  const aiResponse = await callAiWithRetry(systemPrompt, userMessage);

  // 6. Parse and validate AI response
  console.log("OpenAI response received. choices:", aiResponse.choices?.length ?? 0, "finish:", aiResponse.choices[0]?.finish_reason);
  const content = aiResponse.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI - empty content received");

  let rawResult: Record<string, unknown>;
  try {
    rawResult = JSON.parse(content);
  } catch {
    console.error("Failed to parse JSON response:", content.substring(0, 500));
    throw new Error("AI returned invalid JSON format");
  }

  if (!rawResult.reasoning) {
    if (rawResult.summary) { rawResult.reasoning = rawResult.summary; }
    else throw new AnalyzeServiceError(502, { error: "Incomplete AI response", message: "The AI did not provide sufficient analysis. Please try again." });
  }
  if ((rawResult.detectedFields as Record<string, unknown>)?.fees === null) {
    (rawResult.detectedFields as Record<string, unknown>).fees = [];
  }
  if (rawResult.missingInfo === null) rawResult.missingInfo = [];

  const validationResult = analysisResponseSchema.safeParse(rawResult);
  if (!validationResult.success) {
    console.error("AI response validation failed:", validationResult.error.flatten());
    throw new AnalyzeServiceError(502, { error: "Invalid AI response", message: "The AI returned an unexpected response format. Please try again." });
  }
  const llmResult = validationResult.data;

  // 7. Doc fee cap check + missing state info
  const docFeeCapResult = stateData ? checkDocFeeCap(llmResult.detectedFields.fees, stateData) : null;
  const capViolation = docFeeCapResult?.violated ?? false;
  console.log(`[stateDetection] method=${stateDetection.method ?? "null"} state=${stateDetection.state ?? "null"} capCheck=${!!stateData} overage=${docFeeCapResult?.overage ?? 0}`);
  void trackEvent("state_detection", { method: stateDetection.method ?? undefined, state: stateDetection.state ?? undefined, capViolation });

  if (!stateDetection.state) {
    const missingInfoArr = Array.isArray(llmResult.missingInfo) ? [...llmResult.missingInfo] : [];
    if (stateDetection.ambiguousCity) {
      const options = getAmbiguousCityOptions(stateDetection.ambiguousCity);
      const optionsStr = options ? `${options[0]} or ${options[1]}` : "multiple states";
      const cityDisplay = stateDetection.ambiguousCity.charAt(0).toUpperCase() + stateDetection.ambiguousCity.slice(1);
      missingInfoArr.push({ field: "Dealership state", question: `We found a reference to ${cityDisplay}, which could be ${optionsStr}. What's the dealership's ZIP code?` });
    } else {
      missingInfoArr.push({ field: "Dealership state", question: "What city and state is the dealership located in? This helps us check state-specific fee limits." });
    }
    llmResult.missingInfo = missingInfoArr;
  }
  if (docFeeCapResult?.violated && stateData) {
    injectDocFeeCapWarnings(llmResult, docFeeCapResult, stateData);
  }

  // 8. Rule engine
  const ruleEngineAdjustments = applyRuleEngine(llmResult, llmResult.detectedFields, docFeeCapResult);
  const finalResult: AnalysisResponse = { ...llmResult, ...ruleEngineAdjustments };
  console.log("Analysis successful - Deal Score:", finalResult.dealScore, "Confidence:", finalResult.confidenceLevel);
  void trackEvent("submission", { vehicle: data.vehicle, zipCode: data.zipCode, sessionId: data.sessionId });

  // 9. Persist submission
  const listingId = await saveSubmission(data, finalResult);

  // 10. Post-LLM market context enrichment
  if (marketContext && stateDetection.state) {
    await enrichMarketContextPostLlm(marketContext, finalResult, stateDetection.state);
  }

  // 11. Compose final payload
  const finalOverallStrength: MarketContextStrength = marketContext?.overallStrength ?? overallStrength;
  const marketContextUsed = finalOverallStrength !== "none";
  const marketContextSummary = buildMarketContextSummary(finalOverallStrength, marketContext, stateDetection.state ?? null);

  const payload: Record<string, unknown> = { ...finalResult };
  if (listingId) payload.listingId = listingId;
  if (marketContext !== null) payload.marketContext = marketContext;
  payload.marketContextUsed = marketContextUsed;
  payload.marketContextStrength = finalOverallStrength;
  if (marketContextSummary) payload.marketContextSummary = marketContextSummary;

  void trackEvent("submission_score", { dealScore: finalResult.dealScore, vehicle: data.vehicle, sessionId: data.sessionId, marketContextUsed, marketContextStrength: finalOverallStrength });
  enqueueSubmission({ request: data, result: finalResult, preSavedListingId: listingId });

  return { payload, listingId, stateCode: stateDetection.state ?? null };
}
