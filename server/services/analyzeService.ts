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
import { getMarketContext, getDealerStats, buildMarketContextSummary, getStrength } from "../marketContext";
import {
  buildStateFeeSection,
  buildStateFeeRulesSection,
  buildMarketIntelligenceSection,
  buildSystemPrompt,
  buildUserMessage,
} from "./promptBuilder";
import { callAiWithRetry, AnalyzeServiceError } from "./aiCall";
import { saveSubmission } from "./submissionPersister";

export type AnalyzeInput = z.infer<typeof analysisRequestSchema>;
export { AnalyzeServiceError };

export interface AnalyzeServiceResult {
  payload: Record<string, unknown>;
  listingId: string | null;
  stateCode: string | null;
}

// ─── Private helpers ──────────────────────────────────────────────────────────

const MAKE_PATTERN =
  /Toyota|Honda|Ford|Chevrolet|Chevy|Nissan|Hyundai|Kia|Ram|Dodge|Jeep|Subaru|Mazda|Volkswagen|VW|BMW|Mercedes|Audi|Lexus|Cadillac|Buick|GMC|Chrysler|Volvo|Tesla|Rivian|Lucid|Genesis|Infiniti|Acura|Lincoln|Mitsubishi|MINI|Porsche|Land Rover|Jaguar|Maserati/i;

function extractDealerName(dealerText: string): string | null {
  const atMatch = dealerText.match(
    new RegExp(`(?:from|at|with|visit(?:ing)?)\\s+([A-Z][a-zA-Z0-9 &'-]{3,40}?)\\s*(?:${MAKE_PATTERN.source})`, "i"),
  );
  if (!atMatch?.[0]) return null;
  const fullMatch = atMatch[0];
  const makeMatch = fullMatch.match(MAKE_PATTERN);
  if (!makeMatch) return null;
  const makeIdx = fullMatch.indexOf(makeMatch[0]);
  const prefixClean = fullMatch
    .slice(0, makeIdx + makeMatch[0].length)
    .replace(/^(?:from|at|with|visit(?:ing)?)\s+/i, "")
    .trim();
  return prefixClean.length >= 4 ? prefixClean : null;
}

type DocFeeCapResult = NonNullable<ReturnType<typeof checkDocFeeCap>>;

function injectDocFeeCapWarnings(
  llmResult: z.infer<typeof analysisResponseSchema>,
  result: DocFeeCapResult,
  stateData: NonNullable<ReturnType<typeof getStateFeeData>>,
): void {
  const { capAmount, chargedAmount, overage } = result;
  const stateName = stateData.name;
  const capViolationPrefix = `ALERT: Doc fee of $${chargedAmount} exceeds ${stateName}'s legal cap of $${capAmount} by $${overage}.`;

  let statuteCitation = "";
  if (stateData.specialNotes) {
    const match = stateData.specialNotes.match(
      /([A-Z]{2,3}[\s.]+[\d.]+[\w.]*|§\s*[\d.]+[\w.]*|\b(?:Section|Sec\.|RS|RCW|ORS|MCL|CGS|GS|A\.?C\.?A\.?|C\.?R\.?S\.?|NRS|HSA|MCA)\s+[\d.-]+\w*)/i,
    );
    if (match) statuteCitation = ` (${match[0].trim()})`;
  }

  if (!llmResult.summary.includes(String(capAmount))) {
    llmResult.summary = `${capViolationPrefix} ${llmResult.summary}`;
  }
  if (!llmResult.reasoning.includes(String(overage))) {
    llmResult.reasoning =
      `Doc fee cap violation: ${stateName} cap is $${capAmount}${statuteCitation}. Charged: $${chargedAmount}. Overage: $${overage}. This is a hard NO-GO regardless of other deal terms. ` +
      llmResult.reasoning;
  }
  if (!llmResult.suggestedReply.includes(String(capAmount)) && !llmResult.suggestedReply.includes(String(overage))) {
    const replyStatuteNote = statuteCitation ? ` per state law${statuteCitation}` : " to comply with state law";
    llmResult.suggestedReply =
      `I noticed the documentation fee of $${chargedAmount} exceeds the ${stateName} state cap of $${capAmount} by $${overage}. Please adjust the doc fee${replyStatuteNote}. ` +
      llmResult.suggestedReply;
  }
}

async function enrichMarketContextPostLlm(
  marketContext: MarketContext,
  finalResult: AnalysisResponse,
  state: string,
): Promise<void> {
  const detectedFees = finalResult.detectedFields.fees ?? [];
  const docFeeEntry = detectedFees.find((f) => /doc.?fee|document/i.test(f.name));
  const docFeeValue = docFeeEntry?.amount ?? null;
  if (docFeeValue != null && marketContext.stateAvgDocFee != null && Number.isFinite(docFeeValue)) {
    const delta = docFeeValue - marketContext.stateAvgDocFee;
    marketContext.docFeeVsStateAvg = Math.abs(delta) > 2000 ? null : delta;
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

  // 5. Build and send prompt
  const overallStrength = marketContext?.overallStrength ?? "none";
  const systemPrompt = buildSystemPrompt({
    stateFeeSection: buildStateFeeSection(stateData),
    stateFeeRulesSection: buildStateFeeRulesSection(stateData),
    marketIntelligenceSection: buildMarketIntelligenceSection(marketContext, stateDetection.state ?? "", overallStrength),
    language: data.language,
  });
  const userMessage = buildUserMessage(data);
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
    else {
      throw new AnalyzeServiceError(502, { error: "Incomplete AI response", message: "The AI did not provide sufficient analysis. Please try again." });
    }
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
