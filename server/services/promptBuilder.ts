import type { AnalysisRequest, MarketContext, MarketContextStrength } from "@shared/schema";
import type { StateFeeData } from "../stateFeeLookup";

export function buildStateFeeSection(stateData: StateFeeData | null): string {
  if (!stateData) return "";
  const capLine = stateData.docFeeCap
    ? `  Cap: YES — $${stateData.docFeeCapAmount} (dealers may NOT charge more)`
    : `  Cap: NO — no state-imposed limit`;
  const rangeLine = `  Typical range: $${stateData.docFeeTypicalRange[0]}–$${stateData.docFeeTypicalRange[1]}`;
  const taxLine = `  State sales tax: ${(stateData.stateSalesTaxRate * 100).toFixed(2)}%`;
  const tradeInLine = `  Trade-in tax credit: ${stateData.tradeInTaxCredit ? "YES" : "NO"}`;
  const notesLine = stateData.specialNotes ? `  Special notes: ${stateData.specialNotes}` : "";
  return `
STATE_FEE_REFERENCE (${stateData.name}):
${capLine}
${rangeLine}
${taxLine}
${tradeInLine}${notesLine ? `\n${notesLine}` : ""}`;
}

export function buildStateFeeRulesSection(stateData: StateFeeData | null): string {
  return `
STATE-SPECIFIC FEE RULES (STRICT — MUST FOLLOW):
${stateData ? `
A STATE_FEE_REFERENCE block has been injected above for ${stateData.name}. Apply these rules:
1. Use ONLY the injected STATE_FEE_REFERENCE data for any state-specific claims — NOT general training knowledge.
2. Doc fee cap analysis:
   ${stateData.docFeeCap
     ? `- ${stateData.name} has a $${stateData.docFeeCapAmount} doc fee cap. If a doc fee in the quote exceeds this:
     - Flag it clearly in summary and reasoning as a HARD violation
     - State the cap amount, the charged amount, the overage ($charged - $cap), and any statute reference
     - Statute citation rule: if specialNotes contains a statute number or code citation, include it. If not, reference only the state name and cap amount — NEVER fabricate a statute citation.
     - In the suggestedReply (paid tier): include a direct challenge referencing the cap amount and overage.`
     : `- ${stateData.name} has NO state doc fee cap. Compare the detected doc fee against the typical range ($${stateData.docFeeTypicalRange[0]}–$${stateData.docFeeTypicalRange[1]}). Characterize it as: below typical / within typical / high end / above typical.`}
3. For the suggestedReply: when a cap is violated AND specialNotes contains a statute reference, include a statutory challenge phrase. When no statute reference is present, challenge the fee by dollar amount only.
` : `
No state was detected. Do NOT make state-specific fee claims. Stick to general fee analysis.`}
When state is unknown: omit all state-specific fee characterizations.`;
}

function buildMarketIntroPhrase(strength: MarketContextStrength): string {
  if (strength === "strong") return "Observed local market data shows";
  if (strength === "moderate") return "Recent local data suggests";
  if (strength === "thin") return "Early local data suggests";
  return "";
}

export function buildMarketIntelligenceSection(
  marketContext: MarketContext | null,
  stateCode: string,
  overallStrength: MarketContextStrength,
): string {
  if (!marketContext) return "";
  const mc = marketContext;

  if (mc.isNationalFallback) {
    const miLines: string[] = [];
    if (mc.nationalTotalAnalyses != null && Number.isFinite(mc.nationalTotalAnalyses)) {
      miLines.push(`National baseline: we have analyzed ${mc.nationalTotalAnalyses} deals nationwide`);
    }
    if (mc.nationalAvgDocFee != null && Number.isFinite(mc.nationalAvgDocFee)) {
      miLines.push(
        `National average doc fee is $${Math.round(mc.nationalAvgDocFee)} (${stateCode} state average builds as more ${stateCode} quotes are analyzed)`,
      );
    }
    if (miLines.length === 0) return "";
    return `
MARKET_INTELLIGENCE
${miLines.join("\n")}
Reference these figures in your summary and reasoning when they are materially relevant to evaluating the deal. Do not force their use when they do not meaningfully help. Use the provided figures exactly as written. Do not estimate, round, or invent additional statistics. Note: these are national averages — state-specific data for ${stateCode} is not yet available.`;
  }

  if (overallStrength === "none") return "";

  const hasUsable = mc.stateTotalAnalyses != null || mc.stateAvgDocFee != null || mc.dealerAvgDealScore != null;
  if (!hasUsable) return "";

  const introPhrase = buildMarketIntroPhrase(overallStrength);
  const miLines: string[] = [];
  if (mc.stateTotalAnalyses != null && Number.isFinite(mc.stateTotalAnalyses)) {
    const dealWord = mc.stateTotalAnalyses === 1 ? "deal" : "deals";
    miLines.push(`${introPhrase}: Average doc fee in ${stateCode} is based on ${mc.stateTotalAnalyses} ${dealWord} analyzed`);
  }
  if (mc.stateAvgDocFee != null && Number.isFinite(mc.stateAvgDocFee)) {
    miLines.push(
      `Average doc fee in ${stateCode} is $${Math.round(mc.stateAvgDocFee)} across ${mc.stateTotalAnalyses ?? 0} analyzed ${(mc.stateTotalAnalyses ?? 0) === 1 ? "analysis" : "analyses"}`,
    );
  }
  if (mc.dealerAvgDealScore != null && mc.dealerAnalysisCount != null && Number.isFinite(mc.dealerAvgDealScore)) {
    const quoteWord = mc.dealerAnalysisCount === 1 ? "quote" : "quotes";
    miLines.push(`This dealer's average deal score is ${mc.dealerAvgDealScore} across ${mc.dealerAnalysisCount} analyzed ${quoteWord}`);
  }
  if (
    mc.feedbackCount != null &&
    mc.feedbackCount >= 1 &&
    mc.feedbackAgreementPct != null &&
    Number.isFinite(mc.feedbackAgreementPct)
  ) {
    const pct = Math.round(mc.feedbackAgreementPct * 100);
    miLines.push(
      `Users agreed with ${pct}% of past ${mc.feedbackCount} analyses for this dealer. Use this as a confidence-calibration signal: for borderline cases, avoid overstating certainty.`,
    );
  }
  if (miLines.length === 0) return "";
  return `
MARKET_INTELLIGENCE
${miLines.join("\n")}
Reference these figures in your summary and reasoning when they are materially relevant to evaluating the deal. Do not force their use when they do not meaningfully help. Use the provided figures exactly as written. Do not estimate, round, or invent additional statistics.`;
}

export function buildSystemPrompt({
  stateFeeSection,
  stateFeeRulesSection,
  marketIntelligenceSection,
  language,
}: {
  stateFeeSection: string;
  stateFeeRulesSection: string;
  marketIntelligenceSection: string;
  language?: string;
}): string {
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

export function buildUserMessage(data: AnalysisRequest): string {
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

export interface PromptContext {
  stateData: StateFeeData | null;
  marketContext: MarketContext | null;
  stateCode: string;
  overallStrength: MarketContextStrength;
}

/**
 * Primary entry point: builds the full {systemPrompt, userMessage} pair for
 * a given analysis input and resolved market/fee context.
 */
export function buildPrompt(
  input: AnalysisRequest,
  context: PromptContext,
): { systemPrompt: string; userMessage: string } {
  return {
    systemPrompt: buildSystemPrompt({
      stateFeeSection: buildStateFeeSection(context.stateData),
      stateFeeRulesSection: buildStateFeeRulesSection(context.stateData),
      marketIntelligenceSection: buildMarketIntelligenceSection(
        context.marketContext,
        context.stateCode,
        context.overallStrength,
      ),
      language: input.language,
    }),
    userMessage: buildUserMessage(input),
  };
}
