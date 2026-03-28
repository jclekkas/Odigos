import * as Sentry from "@sentry/node";
import type { Request } from "express";
import {
  analysisResponseSchema,
  type AnalysisRequest,
  type AnalysisResponse,
  type MarketContext,
} from "@shared/schema";
import { applyRuleEngine, checkDocFeeCap } from "../ruleEngine";
import { detectStateFromText, getStateFeeData, getAmbiguousCityOptions } from "../stateFeeLookup";
import { trackEvent } from "../events";
import { openai } from "../openaiClient";
import { enqueueSubmission } from "../ingestor";
import { storage } from "../storage";
import { getMarketContext, getDealerStats } from "../marketContext";
import { writeAuditEvent } from "../audit";
import { withJitteredBackoff, isRetriableError } from "../lib/reliability";
import { aiCircuitBreaker, CircuitOpenError } from "../lib/circuitBreaker";

const AI_MAX_RETRIES = 2;
const AI_ATTEMPT_TIMEOUT_MS = 30_000;
const AI_TOTAL_BUDGET_MS = 75_000;

export type AnalysisInput = AnalysisRequest;

export type AnalysisServiceResult = {
  response: Record<string, unknown>;
  listingId: string | null;
};

export type AnalysisServiceError =
  | { kind: "circuit_open" }
  | { kind: "ai_exhausted" }
  | { kind: "incomplete_response" }
  | { kind: "invalid_response" };

function buildStateFeeSection(stateData: ReturnType<typeof getStateFeeData>): string {
  if (!stateData) return "";
  const capLine = stateData.docFeeCap
    ? `  Cap: YES — $${stateData.docFeeCapAmount} (dealers may NOT charge more)`
    : `  Cap: NO — no state-imposed limit`;
  const rangeLine = `  Typical range: $${stateData.docFeeTypicalRange[0]}–$${stateData.docFeeTypicalRange[1]}`;
  const taxLine = `  State sales tax: ${(stateData.stateSalesTaxRate * 100).toFixed(2)}%`;
  const tradeInLine = `  Trade-in tax credit: ${stateData.tradeInTaxCredit ? "YES" : "NO"}`;
  const notesLine = stateData.specialNotes ? `  Special notes: ${stateData.specialNotes}` : "";
  return `\nSTATE_FEE_REFERENCE (${stateData.name}):\n${capLine}\n${rangeLine}\n${taxLine}\n${tradeInLine}${notesLine ? `\n${notesLine}` : ""}`;
}

function buildStateFeeRulesSection(stateData: ReturnType<typeof getStateFeeData>): string {
  if (!stateData) {
    return `\nSTATE-SPECIFIC FEE RULES (STRICT — MUST FOLLOW):\n\nNo state was detected. Do NOT make state-specific fee claims. Stick to general fee analysis.\nWhen state is unknown: omit all state-specific fee characterizations.`;
  }
  const docFeeRule = stateData.docFeeCap
    ? `- ${stateData.name} has a $${stateData.docFeeCapAmount} doc fee cap. If a doc fee in the quote exceeds this:\n     - Flag it clearly in summary and reasoning as a HARD violation\n     - State the cap amount, the charged amount, the overage ($charged - $cap), and any statute reference\n     - Statute citation rule: if specialNotes contains a statute number or code citation, include it. If not, reference only the state name and cap amount — NEVER fabricate a statute citation.\n     - In the suggestedReply (paid tier): include a direct challenge referencing the cap amount and overage.`
    : `- ${stateData.name} has NO state doc fee cap. Compare the detected doc fee against the typical range ($${stateData.docFeeTypicalRange[0]}–$${stateData.docFeeTypicalRange[1]}). Characterize it as: below typical / within typical / high end / above typical.`;
  return `\nSTATE-SPECIFIC FEE RULES (STRICT — MUST FOLLOW):\n\nA STATE_FEE_REFERENCE block has been injected above for ${stateData.name}. Apply these rules:\n1. Use ONLY the injected STATE_FEE_REFERENCE data for any state-specific claims — NOT general training knowledge.\n2. Doc fee cap analysis:\n   ${docFeeRule}\n3. For the suggestedReply: when a cap is violated AND specialNotes contains a statute reference, include a statutory challenge phrase. When no statute reference is present, challenge the fee by dollar amount only.\n\nWhen state is unknown: omit all state-specific fee characterizations.`;
}

function buildMarketIntelligenceSection(
  marketContext: MarketContext,
  stateCode: string,
): string {
  const mc = marketContext;
  const hasUsable = mc.stateTotalAnalyses != null || mc.stateAvgDocFee != null || mc.dealerAvgDealScore != null;
  if (!hasUsable) return "";
  const miLines: string[] = [];
  if (mc.stateTotalAnalyses != null && Number.isFinite(mc.stateTotalAnalyses)) {
    const dealWord = mc.stateTotalAnalyses === 1 ? "deal" : "deals";
    miLines.push(`In ${stateCode}, we have analyzed ${mc.stateTotalAnalyses} ${dealWord}`);
  }
  if (mc.stateAvgDocFee != null && Number.isFinite(mc.stateAvgDocFee)) {
    miLines.push(`Average doc fee in ${stateCode} is $${Math.round(mc.stateAvgDocFee)}`);
  }
  if (mc.dealerAvgDealScore != null && mc.dealerAnalysisCount != null && Number.isFinite(mc.dealerAvgDealScore)) {
    const quoteWord = mc.dealerAnalysisCount === 1 ? "quote" : "quotes";
    miLines.push(`This dealer's average deal score is ${mc.dealerAvgDealScore} across ${mc.dealerAnalysisCount} analyzed ${quoteWord}`);
  }
  if (mc.feedbackCount != null && mc.feedbackCount >= 3 && mc.feedbackAgreementPct != null && Number.isFinite(mc.feedbackAgreementPct)) {
    const pct = Math.round(mc.feedbackAgreementPct * 100);
    miLines.push(`Users agreed with ${pct}% of past ${mc.feedbackCount} analyses for this dealer. Use this as a confidence-calibration signal: for borderline cases, avoid overstating certainty.`);
  }
  if (miLines.length === 0) return "";
  return `\nMARKET_INTELLIGENCE\n${miLines.join("\n")}\nReference these figures in your summary and reasoning when they are materially relevant to evaluating the deal. Do not force their use when they do not meaningfully help. Use the provided figures exactly as written. Do not estimate, round, or invent additional statistics.`;
}

function buildSystemPrompt(
  stateData: ReturnType<typeof getStateFeeData>,
  marketContext: MarketContext | null,
  stateCode: string | null,
  language?: string,
): string {
  const stateFeeSection = buildStateFeeSection(stateData);
  const stateFeeRulesSection = buildStateFeeRulesSection(stateData);
  const marketIntelligenceSection =
    marketContext && stateCode ? buildMarketIntelligenceSection(marketContext, stateCode) : "";

  return `You are an expert car buying advisor helping consumers evaluate car purchase offers. Your job is to analyze dealer quotes, texts, and emails to help buyers understand if they're getting a good deal.
${stateFeeSection}
LANGUAGE SAFETY & CERTAINTY RULES (STRICT - MUST FOLLOW):
1. NEVER say "all key details are clear" unless ALL of the following are explicitly present:
   - Out-the-door price
   - APR
   - Financing term
   - Confirmation that terms are approved in writing (not just verbally)

2. If APR or pricing is contingent on credit tier, approval, or paperwork, you MUST explicitly state: "This deal is contingent on [credit approval/final paperwork/etc.]"

3. When some details are missing but the core economics are strong, use phrasing like:
   "The core economic terms are clearly stated, contingent on final paperwork."

4. Do NOT use "high confidence" language if any term is conditional or pending formal documentation.

5. Praise positive signals explicitly:
   - If out-the-door price is provided: "Providing an out-the-door price upfront is a positive transparency signal."
   - If low APR (under 5%): "Low APR meaningfully reduces total cost."

6. BUYER SAFEGUARD RECOGNITION:
   - If the buyer explicitly conditions the deal on APR, pricing, or written confirmation (e.g., "contingent on qualifying for 1.99% APR"), call this out as a positive buyer protection.
   - Use language like: "Conditioning the deal on APR confirmation is a strong buyer safeguard that reduces downside risk."
   - Include this recognition in your summary when applicable.

7. Be skeptical of payment-only quotes without total cost breakdowns.

8. MSRP/SALE PRICE ABSENT BUT CORE TERMS PRESENT:
   - When OTD price, APR, and term are explicitly confirmed in writing but MSRP or sale price are not mentioned:
   - Do NOT treat this as missing information or add warnings.
   - Do NOT add questions asking for MSRP or sale price.
   - Use this approved phrasing pattern in your summary:
     "All core economic terms (out-the-door price, APR, and term) have been explicitly confirmed in writing. While MSRP and base sale price were not discussed, this is common once an all-in price has been agreed and does not materially increase risk."
   - This scenario is GREEN, not YELLOW. The deal has certainty where it matters.

SUGGESTED REPLY RULES:
- Suggested replies must protect the buyer while remaining polite and non-confrontational.
- When a deal is GREEN or YELLOW but contingent on paperwork or APR:
  - The reply should explicitly ask that the final buyer's order reflect the agreed terms.
- Avoid "we'll be there as planned" unless paired with a confirmation request.
- Preferred closing pattern: "Looking forward to coming in — please have the final buyer's order reflecting [OTD price], [APR], and [term] ready when we arrive."
- Never imply the deal is fully finalized unless written documentation has been confirmed.

CRITICAL REQUIREMENTS:
1. If key information is missing or ambiguous, you MUST explicitly state what's missing and provide the exact questions the buyer should ask the dealer.
2. Extract all pricing information you can find (sale price, MSRP, fees, monthly payments, etc.)
3. Flag any suspicious fees or unclear terms like market adjustments, dealer add-ons, protection packages.
4. Never invent numbers or make claims about "market averages" without data.
5. For vehicle_make, vehicle_model, and vehicle_year: extract from the dealer text or the user-provided Vehicle field. Return null for any field that is not clearly determinable — do not guess.
${stateFeeRulesSection}${marketIntelligenceSection}
You must respond with a valid JSON object with this exact structure:
{
  "dealScore": "GREEN" | "YELLOW" | "RED",
  "confidenceLevel": "HIGH" | "MEDIUM" | "LOW",
  "verdictLabel": "Short action-oriented label like 'PROCEED — CONFIRM DETAILS' or 'PAUSE — GET OTD BREAKDOWN'",
  "goNoGo": "GO" | "NO-GO" | "NEED-MORE-INFO",
  "summary": "Plain English explanation following this structure: (1) What we know - facts only, (2) Why it's good/bad, (3) What's missing + next questions. Keep to 4-6 sentences max.",
  "detectedFields": {
    "salePrice": number or null,
    "msrp": number or null,
    "rebates": number or null,
    "fees": [{"name": "fee name", "amount": number or null}],
    "outTheDoorPrice": number or null,
    "monthlyPayment": number or null,
    "tradeInValue": number or null,
    "apr": number or null,
    "termMonths": number or null,
    "downPayment": number or null,
    "vehicle_make": string or null,
    "vehicle_model": string or null,
    "vehicle_year": number (4-digit integer) or null
  },
  "missingInfo": [
    {"field": "What's missing", "question": "Exact question to ask the dealer"}
  ],
  "suggestedReply": "A ready-to-send message the buyer can copy and send to the dealer",
  "reasoning": "Your analysis reasoning explaining how you evaluated the deal"
}

SCORING GUIDELINES:
- GREEN + HIGH confidence: Out-the-door price present, APR/term clear, no red flags
- GREEN + MEDIUM confidence: Good deal but missing MSRP or some details
- YELLOW + MEDIUM confidence: Missing out-the-door price or payment-only quote
- YELLOW + LOW confidence: Vague fees or add-ons detected
- RED + LOW confidence: Market adjustment, multiple high-cost add-ons, contradictory numbers

GO/NO-GO/NEED-MORE-INFO:
- GO: Has enough information and reasonable terms to visit dealership
- NEED-MORE-INFO: Missing critical details, buyer should ask questions first
- NO-GO: Red flags detected, look elsewhere${language === "es" ? `

LANGUAGE INSTRUCTION (MANDATORY):
Respond entirely in Spanish. All text fields in your JSON response — including "summary", "reasoning", "verdictLabel", "issues" (label and explanation fields), "missingInfo", "suggestedReply", and any other human-readable text — must be written in Spanish. Keep all enum values (dealScore, goNoGo, confidenceLevel) in English as specified in the schema.` : ""}`;
}

function buildUserMessage(data: AnalysisInput): string {
  let msg = `Analyze this dealer communication:\n\n${data.dealerText}`;
  if (data.condition !== "unknown") msg += `\n\nVehicle condition: ${data.condition}`;
  if (data.vehicle) msg += `\nVehicle: ${data.vehicle}`;
  if (data.zipCode) msg += `\nBuyer's ZIP code: ${data.zipCode}`;
  if (data.purchaseType !== "unknown") msg += `\nPurchase type: ${data.purchaseType}`;
  if (data.apr) msg += `\nQuoted APR: ${data.apr}%`;
  if (data.termMonths) msg += `\nLoan term: ${data.termMonths} months`;
  if (data.downPayment) msg += `\nDown payment: $${data.downPayment}`;
  return msg;
}

function extractPreLlmDealerName(dealerText: string): string | null {
  const atMatch = dealerText.match(
    /(?:from|at|with|visit(?:ing)?)\s+([A-Z][a-zA-Z0-9 &'-]{3,40}?)\s*(?:Toyota|Honda|Ford|Chevrolet|Chevy|Nissan|Hyundai|Kia|Ram|Dodge|Jeep|Subaru|Mazda|Volkswagen|VW|BMW|Mercedes|Audi|Lexus|Cadillac|Buick|GMC|Chrysler|Volvo|Tesla|Rivian|Lucid|Genesis|Infiniti|Acura|Lincoln|Mitsubishi|MINI|Porsche|Land Rover|Jaguar|Maserati)/i,
  );
  if (!atMatch?.[0]) return null;
  const fullMatch = atMatch[0];
  const makeMatch = fullMatch.match(
    /Toyota|Honda|Ford|Chevrolet|Chevy|Nissan|Hyundai|Kia|Ram|Dodge|Jeep|Subaru|Mazda|Volkswagen|VW|BMW|Mercedes|Audi|Lexus|Cadillac|Buick|GMC|Chrysler|Volvo|Tesla|Rivian|Lucid|Genesis|Infiniti|Acura|Lincoln|Mitsubishi|MINI|Porsche|Land Rover|Jaguar|Maserati/i,
  );
  if (!makeMatch) return null;
  const makeIdx = fullMatch.indexOf(makeMatch[0]);
  const prefixClean = fullMatch
    .slice(0, makeIdx + makeMatch[0].length)
    .replace(/^(?:from|at|with|visit(?:ing)?)\s+/i, "")
    .trim();
  return prefixClean.length >= 4 ? prefixClean : null;
}

async function callAI(systemPrompt: string, userMessage: string): Promise<
  { ok: true; content: string } | { ok: false; error: AnalysisServiceError }
> {
  let response: Awaited<ReturnType<typeof openai.chat.completions.create>>;
  try {
    response = await withJitteredBackoff(
      async (attempt) => {
        if (attempt > 1) console.log(`[analyze] AI retry attempt ${attempt}/${AI_MAX_RETRIES + 1}`);
        return aiCircuitBreaker.execute(() =>
          Promise.race([
            openai.chat.completions.create({
              model: "gpt-4o",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage },
              ],
              response_format: { type: "json_object" },
              max_tokens: 4096,
            }),
            new Promise<never>((_, reject) =>
              setTimeout(
                () => reject(new Error(`AI attempt ${attempt} timed out after ${AI_ATTEMPT_TIMEOUT_MS}ms`)),
                AI_ATTEMPT_TIMEOUT_MS,
              ),
            ),
          ]),
        );
      },
      {
        maxAttempts: AI_MAX_RETRIES + 1,
        baseDelayMs: 500,
        maxDelayMs: 5000,
        totalBudgetMs: AI_TOTAL_BUDGET_MS,
        onRetry: (attempt, err, delayMs) => {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(`[analyze] AI call failed on attempt ${attempt}, retrying in ${Math.round(delayMs)}ms. reason=${msg}`);
          Sentry.addBreadcrumb({
            category: "ai-retry",
            message: `AI retry attempt ${attempt + 1}`,
            level: "warning",
            data: { attempt, delayMs: Math.round(delayMs) },
          });
        },
      },
    );
  } catch (aiErr) {
    if (aiErr instanceof CircuitOpenError) {
      console.error("[analyze] AI circuit breaker is OPEN — fast-failing");
      Sentry.captureException(aiErr, { level: "error" });
      return { ok: false, error: { kind: "circuit_open" } };
    }
    const isRetriable = isRetriableError(aiErr as Error);
    console.error(`[analyze] AI call exhausted retries. retriable=${isRetriable}`, aiErr);
    Sentry.captureException(aiErr, { extra: { maxRetries: AI_MAX_RETRIES, budgetMs: AI_TOTAL_BUDGET_MS } });
    return { ok: false, error: { kind: "ai_exhausted" } };
  }

  console.log("OpenAI API response received");
  console.log("Response choices count:", response.choices?.length || 0);
  console.log("Finish reason:", response.choices[0]?.finish_reason);

  const content = response.choices[0]?.message?.content;
  if (!content) {
    console.error("Empty content in response. Full response:", JSON.stringify(response, null, 2));
    throw new Error("No response from AI - empty content received");
  }
  console.log("Response content length:", content.length);
  return { ok: true, content };
}

function parseAndValidateAIResponse(content: string): {
  ok: true; result: AnalysisResponse;
} | { ok: false; error: AnalysisServiceError } {
  let rawResult: unknown;
  try {
    rawResult = JSON.parse(content);
  } catch {
    console.error("Failed to parse JSON response:", content.substring(0, 500));
    throw new Error("AI returned invalid JSON format");
  }

  const raw = rawResult as Record<string, unknown>;
  if (!raw.reasoning) {
    console.warn("AI response missing 'reasoning' field - using summary as fallback");
    if (raw.summary) {
      raw.reasoning = raw.summary;
    } else {
      console.error("AI response missing both 'reasoning' and 'summary' fields");
      return { ok: false, error: { kind: "incomplete_response" } };
    }
  }

  if (raw.detectedFields && (raw.detectedFields as Record<string, unknown>).fees === null) {
    (raw.detectedFields as Record<string, unknown>).fees = [];
  }
  if (raw.missingInfo === null) raw.missingInfo = [];

  const validationResult = analysisResponseSchema.safeParse(raw);
  if (!validationResult.success) {
    console.error("AI response validation failed:", validationResult.error.flatten());
    console.error("Raw result keys:", Object.keys(raw));
    return { ok: false, error: { kind: "invalid_response" } };
  }
  return { ok: true, result: validationResult.data };
}

function applyDocFeeCapOverrides(
  llmResult: AnalysisResponse,
  docFeeCapResult: ReturnType<typeof checkDocFeeCap>,
  stateData: ReturnType<typeof getStateFeeData>,
  stateDetection: ReturnType<typeof detectStateFromText>,
): AnalysisResponse {
  if (!stateDetection.state) {
    const missingInfoArr = Array.isArray(llmResult.missingInfo) ? [...llmResult.missingInfo] : [];
    if (stateDetection.ambiguousCity) {
      const options = getAmbiguousCityOptions(stateDetection.ambiguousCity);
      const optionsStr = options ? `${options[0]} or ${options[1]}` : "multiple states";
      const cityDisplay = stateDetection.ambiguousCity.charAt(0).toUpperCase() + stateDetection.ambiguousCity.slice(1);
      missingInfoArr.push({
        field: "Dealership state",
        question: `We found a reference to ${cityDisplay}, which could be ${optionsStr}. What's the dealership's ZIP code?`,
      });
    } else {
      missingInfoArr.push({
        field: "Dealership state",
        question: "What city and state is the dealership located in? This helps us check state-specific fee limits.",
      });
    }
    llmResult.missingInfo = missingInfoArr;
  }

  if (docFeeCapResult?.violated && stateData) {
    const { capAmount, chargedAmount, overage } = docFeeCapResult;
    const stateName = stateData.name;
    const capViolationPrefix = `ALERT: Doc fee of $${chargedAmount} exceeds ${stateName}'s legal cap of $${capAmount} by $${overage}.`;

    let statuteCitation = "";
    if (stateData.specialNotes) {
      const statuteMatch = stateData.specialNotes.match(/([A-Z]{2,3}[\s.]+[\d.]+[\w.]*|§\s*[\d.]+[\w.]*|\b(?:Section|Sec\.|RS|RCW|ORS|MCL|CGS|GS|A\.?C\.?A\.?|C\.?R\.?S\.?|NRS|HSA|MCA)\s+[\d.-]+\w*)/i);
      if (statuteMatch) {
        statuteCitation = ` (${statuteMatch[0].trim()})`;
      }
    }

    if (!llmResult.summary.includes(String(capAmount))) {
      llmResult.summary = `${capViolationPrefix} ${llmResult.summary}`;
    }

    if (!llmResult.reasoning.includes(String(overage))) {
      llmResult.reasoning = `Doc fee cap violation: ${stateName} cap is $${capAmount}${statuteCitation}. Charged: $${chargedAmount}. Overage: $${overage}. This is a hard NO-GO regardless of other deal terms. ` + llmResult.reasoning;
    }

    if (!llmResult.suggestedReply.includes(String(capAmount)) && !llmResult.suggestedReply.includes(String(overage))) {
      const replyStatuteNote = statuteCitation ? ` per state law${statuteCitation}` : " to comply with state law";
      llmResult.suggestedReply =
        `I noticed the documentation fee of $${chargedAmount} exceeds the ${stateName} state cap of $${capAmount} by $${overage}. Please adjust the doc fee${replyStatuteNote}. ` +
        llmResult.suggestedReply;
    }
  }

  return llmResult;
}

async function saveSubmissionAndEnqueue(
  data: AnalysisInput,
  finalResult: AnalysisResponse,
  stateDetection: ReturnType<typeof detectStateFromText>,
): Promise<string | null> {
  try {
    const { zipToStateCode } = await import("../zipToState");
    const { redactPII } = await import("../piiRedact");
    const { normalizeSubmissionText, sha256Hex } = await import("../warehouse/warehouseUtils");
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
      totalFeesAmount: feeAmounts.length > 0 ? String(feeAmounts.reduce((a, b) => a + b, 0)) : null,
      feeCount: fees.length,
      feeNames: Array.from(new Set(fees.map((f) => f.name.toLowerCase().trim()))),
      flagMarketAdjustment: fees.some((f) => /market.?adjust|markup|adm/i.test(f.name)),
      flagPaymentOnly:
        finalResult.detectedFields.monthlyPayment !== null &&
        finalResult.detectedFields.salePrice === null &&
        finalResult.detectedFields.outTheDoorPrice === null,
      flagMissingOtd: finalResult.detectedFields.outTheDoorPrice === null,
      flagVagueFees: fees.some((f) => /protection|nitrogen|etch|ceramic|fabric|undercoat|pinstripe/i.test(f.name)),
      flagHighCostAddons:
        fees.filter((f) => /dealer.?add|add.?on|package/i.test(f.name) && (f.amount ?? 0) >= 500).length > 0,
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

async function enrichMarketContext(
  marketContext: MarketContext,
  finalResult: AnalysisResponse,
  stateDetection: ReturnType<typeof detectStateFromText>,
): Promise<MarketContext> {
  const mc = { ...marketContext };
  const detectedFees = finalResult.detectedFields.fees ?? [];
  const docFeeEntry = detectedFees.find((f) => /doc.?fee|document/i.test(f.name));
  const docFeeValue = docFeeEntry?.amount ?? null;
  if (
    docFeeValue != null &&
    mc.stateAvgDocFee != null &&
    Number.isFinite(docFeeValue) &&
    Number.isFinite(mc.stateAvgDocFee)
  ) {
    const delta = docFeeValue - mc.stateAvgDocFee;
    mc.docFeeVsStateAvg = Math.abs(delta) > 2000 ? null : delta;
  }

  const detectedFieldsRaw = finalResult.detectedFields as Record<string, unknown>;
  const dealerNameForCtx: string | null =
    (detectedFieldsRaw?.dealerName as string | undefined) ??
    (detectedFieldsRaw?.dealership as string | undefined) ??
    null;
  if (dealerNameForCtx && stateDetection.state) {
    try {
      const dealerStats = await getDealerStats({ state: stateDetection.state, dealerName: dealerNameForCtx });
      if (dealerStats) {
        mc.dealerAnalysisCount = dealerStats.dealerAnalysisCount;
        mc.dealerAvgDealScore = dealerStats.dealerAvgDealScore;
      }
    } catch {
      // dealer enrichment is non-fatal
    }
  }
  return mc;
}

export async function runAnalysis(
  data: AnalysisInput,
  req: Request,
): Promise<{ ok: true; result: AnalysisServiceResult } | { ok: false; error: AnalysisServiceError }> {
  console.log("=== NEW DEAL SUBMISSION ===");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Vehicle:", data.vehicle || "Not specified");
  console.log("Condition:", data.condition);
  console.log("Purchase Type:", data.purchaseType);
  console.log("Dealer Text:", data.dealerText);
  console.log("===========================");

  const stateDetection = detectStateFromText(data.dealerText, data.zipCode);
  const stateData = stateDetection.state ? getStateFeeData(stateDetection.state) : null;

  if (!stateData && stateDetection.state) {
    console.warn(`[stateDetection] State ${stateDetection.state} not found in reference JSON — skipping injection`);
  }

  void trackEvent("state_detection", {
    method: stateDetection.method ?? undefined,
    state: stateDetection.state ?? undefined,
  });

  const preLlmDealerName = data.dealerText ? extractPreLlmDealerName(data.dealerText) : null;

  let marketContext: MarketContext | null = null;
  if (process.env.DATABASE_URL && stateDetection.state) {
    try {
      marketContext = await getMarketContext({ state: stateDetection.state, dealerName: preLlmDealerName, docFee: null });
    } catch (ctxErr) {
      console.error("[analyze] getMarketContext pre-fetch failed (non-fatal):", ctxErr);
    }
  }

  const feedbackInjected =
    marketContext != null &&
    marketContext.feedbackCount != null &&
    marketContext.feedbackCount >= 3 &&
    marketContext.feedbackAgreementPct != null &&
    Number.isFinite(marketContext.feedbackAgreementPct);

  console.log(
    `[analyze:feedback] dealerExtracted=${preLlmDealerName != null} dealer=${preLlmDealerName ?? "none"} feedbackInjected=${feedbackInjected}` +
      (feedbackInjected
        ? ` count=${marketContext!.feedbackCount} agreement=${Math.round(marketContext!.feedbackAgreementPct! * 100)}%`
        : ""),
  );
  trackEvent("feedback_signal", { dealerExtracted: preLlmDealerName != null, feedbackInjected });

  const systemPrompt = buildSystemPrompt(stateData, marketContext, stateDetection.state ?? null, data.language);
  const userMessage = buildUserMessage(data);

  console.log("Making OpenAI API call with model: gpt-4o");
  console.log("User message length:", userMessage.length);

  const aiResult = await callAI(systemPrompt, userMessage);
  if (!aiResult.ok) return aiResult;

  const parseResult = parseAndValidateAIResponse(aiResult.content);
  if (!parseResult.ok) return parseResult;

  let llmResult = parseResult.result;

  const docFeeCapResult = stateData ? checkDocFeeCap(llmResult.detectedFields.fees, stateData) : null;
  const capCheck = !!stateData;
  const capViolation = docFeeCapResult?.violated ?? false;
  console.log(
    `[stateDetection] method=${stateDetection.method ?? "null"} state=${stateDetection.state ?? "null"} capCheck=${capCheck} overage=${docFeeCapResult?.overage ?? 0}`,
  );
  void trackEvent("state_detection", {
    method: stateDetection.method ?? undefined,
    state: stateDetection.state ?? undefined,
    capViolation,
  });

  llmResult = applyDocFeeCapOverrides(llmResult, docFeeCapResult, stateData, stateDetection);

  const ruleEngineAdjustments = applyRuleEngine(llmResult, llmResult.detectedFields, docFeeCapResult);
  const finalResult: AnalysisResponse = {
    ...llmResult,
    dealScore: ruleEngineAdjustments.dealScore,
    confidenceLevel: ruleEngineAdjustments.confidenceLevel,
    verdictLabel: ruleEngineAdjustments.verdictLabel,
    goNoGo: ruleEngineAdjustments.goNoGo,
  };

  console.log("Analysis successful - Deal Score:", finalResult.dealScore, "Confidence:", finalResult.confidenceLevel);

  void trackEvent("submission", { vehicle: data.vehicle, zipCode: data.zipCode, sessionId: data.sessionId });
  void trackEvent("submission_score", { dealScore: finalResult.dealScore, vehicle: data.vehicle, sessionId: data.sessionId });

  const listingId = await saveSubmissionAndEnqueue(data, finalResult, stateDetection);

  if (marketContext) {
    marketContext = await enrichMarketContext(marketContext, finalResult, stateDetection);
  }

  const responsePayload: Record<string, unknown> = { ...finalResult };
  if (listingId) responsePayload.listingId = listingId;
  if (marketContext !== null) responsePayload.marketContext = marketContext;

  enqueueSubmission({ request: data, result: finalResult, preSavedListingId: listingId });

  void writeAuditEvent(req, "analyze", "success", {
    route: req.originalUrl,
    method: req.method,
    statusCode: 200,
    submissionId: listingId ?? null,
    stateCode: stateDetection.state ?? null,
    hasPdf: Boolean(req.file),
  });

  return { ok: true, result: { response: responsePayload, listingId } };
}
