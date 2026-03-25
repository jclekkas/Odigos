import * as Sentry from "@sentry/node";
import { timingSafeEqual } from "crypto";
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { z } from "zod";
import { analysisRequestSchema, analysisResponseSchema, type AnalysisResponse, type MarketContext } from "@shared/schema";
import { applyRuleEngine, checkDocFeeCap } from "./ruleEngine";
import { detectStateFromText, getStateFeeData, getAmbiguousCityOptions } from "./stateFeeLookup";
import { getStripeClient, isStripeConfigured } from "./stripeClient";
import { trackEvent, getExperimentStats } from "./metrics";
import { extractTextFromFile } from "./extractText";
import { openai } from "./openaiClient";
import { enqueueSubmission } from "./ingestor";
import { storage } from "./storage";
import { getMarketContext, getDealerStats } from "./marketContext";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];

function runUploadMiddleware(req: Request, res: Response): Promise<void> {
  return new Promise((resolve, reject) => {
    upload.single("file")(req, res, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

console.log("OpenAI configured with base URL:", process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ? "set" : "not set");

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/analyze", async (req, res) => {
    try {
      const parseResult = analysisRequestSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: parseResult.error.flatten() 
        });
      }

      const data = parseResult.data;

      console.log("=== NEW DEAL SUBMISSION ===");
      console.log("Timestamp:", new Date().toISOString());
      console.log("Vehicle:", data.vehicle || "Not specified");
      console.log("Condition:", data.condition);
      console.log("Purchase Type:", data.purchaseType);
      console.log("Dealer Text:", data.dealerText);
      console.log("===========================");

      // --- State detection (runs before LLM call to capture all paths in observability) ---
      const stateDetection = detectStateFromText(data.dealerText, data.zipCode);
      const stateData = stateDetection.state ? getStateFeeData(stateDetection.state) : null;

      if (!stateData && stateDetection.state) {
        console.warn(`[stateDetection] State ${stateDetection.state} not found in reference JSON — skipping injection`);
      }

      // Baseline metric fires immediately after detection so every analyze request is counted,
      // even if LLM fails below. Cap violation outcome tracked in the post-LLM metric.
      trackEvent("state_detection", {
        method: stateDetection.method ?? undefined,
        state: stateDetection.state ?? undefined,
      });

      // Build the STATE_FEE_REFERENCE block if we have data
      let stateFeeSection = "";
      if (stateData) {
        const capLine = stateData.docFeeCap
          ? `  Cap: YES — $${stateData.docFeeCapAmount} (dealers may NOT charge more)`
          : `  Cap: NO — no state-imposed limit`;
        const rangeLine = `  Typical range: $${stateData.docFeeTypicalRange[0]}–$${stateData.docFeeTypicalRange[1]}`;
        const taxLine = `  State sales tax: ${(stateData.stateSalesTaxRate * 100).toFixed(2)}%`;
        const tradeInLine = `  Trade-in tax credit: ${stateData.tradeInTaxCredit ? "YES" : "NO"}`;
        const notesLine = stateData.specialNotes ? `  Special notes: ${stateData.specialNotes}` : "";

        stateFeeSection = `
STATE_FEE_REFERENCE (${stateData.name}):
${capLine}
${rangeLine}
${taxLine}
${tradeInLine}${notesLine ? `\n${notesLine}` : ""}`;
      }

      // Build STATE-SPECIFIC FEE RULES section
      const stateFeeRulesSection = `
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

      // --- Market context pre-fetch (state-only, before LLM call) ---
      let marketContext: MarketContext | null = null;
      if (process.env.DATABASE_URL && stateDetection.state) {
        try {
          marketContext = await getMarketContext({
            state: stateDetection.state,
            dealerName: null,
            docFee: null,
          });
        } catch (ctxErr) {
          console.error("[analyze] getMarketContext pre-fetch failed (non-fatal):", ctxErr);
          marketContext = null;
        }
      }

      let marketIntelligenceSection = "";
      if (marketContext) {
        const mc = marketContext;
        const hasUsable = mc.stateTotalAnalyses != null || mc.stateAvgDocFee != null || mc.dealerAvgDealScore != null;
        if (hasUsable) {
          const stCode = stateDetection.state!;
          const miLines: string[] = [];
          if (mc.stateTotalAnalyses != null && Number.isFinite(mc.stateTotalAnalyses)) {
            const dealWord = mc.stateTotalAnalyses === 1 ? "deal" : "deals";
            miLines.push(`In ${stCode}, we have analyzed ${mc.stateTotalAnalyses} ${dealWord}`);
          }
          if (mc.stateAvgDocFee != null && Number.isFinite(mc.stateAvgDocFee)) {
            miLines.push(`Average doc fee in ${stCode} is $${Math.round(mc.stateAvgDocFee)}`);
          }
          if (mc.dealerAvgDealScore != null && mc.dealerAnalysisCount != null && Number.isFinite(mc.dealerAvgDealScore)) {
            const quoteWord = mc.dealerAnalysisCount === 1 ? "quote" : "quotes";
            miLines.push(`This dealer's average deal score is ${mc.dealerAvgDealScore} across ${mc.dealerAnalysisCount} analyzed ${quoteWord}`);
          }
          if (miLines.length > 0) {
            marketIntelligenceSection = `
MARKET_INTELLIGENCE
${miLines.join("\n")}
Reference these figures in your summary and reasoning when they are materially relevant to evaluating the deal. Do not force their use when they do not meaningfully help. Use the provided figures exactly as written. Do not estimate, round, or invent additional statistics.`;
          }
        }
      }

      const systemPrompt = `You are an expert car buying advisor helping consumers evaluate car purchase offers. Your job is to analyze dealer quotes, texts, and emails to help buyers understand if they're getting a good deal.
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
    "downPayment": number or null
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
- NO-GO: Red flags detected, look elsewhere`;

      let userMessage = `Analyze this dealer communication:\n\n${data.dealerText}`;

      if (data.condition !== "unknown") {
        userMessage += `\n\nVehicle condition: ${data.condition}`;
      }
      if (data.vehicle) {
        userMessage += `\nVehicle: ${data.vehicle}`;
      }
      if (data.zipCode) {
        userMessage += `\nBuyer's ZIP code: ${data.zipCode}`;
      }
      if (data.purchaseType !== "unknown") {
        userMessage += `\nPurchase type: ${data.purchaseType}`;
      }
      if (data.apr) {
        userMessage += `\nQuoted APR: ${data.apr}%`;
      }
      if (data.termMonths) {
        userMessage += `\nLoan term: ${data.termMonths} months`;
      }
      if (data.downPayment) {
        userMessage += `\nDown payment: $${data.downPayment}`;
      }

      console.log("Making OpenAI API call with model: gpt-4o");
      console.log("User message length:", userMessage.length);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        response_format: { type: "json_object" },
        max_tokens: 4096,
      });

      console.log("OpenAI API response received");
      console.log("Response choices count:", response.choices?.length || 0);
      console.log("Finish reason:", response.choices[0]?.finish_reason);
      
      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        console.error("Empty content in response. Full response:", JSON.stringify(response, null, 2));
        throw new Error("No response from AI - empty content received");
      }

      console.log("Response content length:", content.length);
      
      let rawResult;
      try {
        rawResult = JSON.parse(content);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", content.substring(0, 500));
        throw new Error("AI returned invalid JSON format");
      }
      
      // Handle missing reasoning field with logging
      if (!rawResult.reasoning) {
        console.warn("AI response missing 'reasoning' field - using summary as fallback");
        if (rawResult.summary) {
          rawResult.reasoning = rawResult.summary;
        } else {
          console.error("AI response missing both 'reasoning' and 'summary' fields");
          return res.status(502).json({
            error: "Incomplete AI response",
            message: "The AI did not provide sufficient analysis. Please try again."
          });
        }
      }
      
      // Fix null arrays - AI sometimes returns null instead of empty arrays
      if (rawResult.detectedFields) {
        if (rawResult.detectedFields.fees === null) {
          rawResult.detectedFields.fees = [];
        }
      }
      if (rawResult.missingInfo === null) {
        rawResult.missingInfo = [];
      }
      
      const validationResult = analysisResponseSchema.safeParse(rawResult);
      
      if (!validationResult.success) {
        console.error("AI response validation failed:", validationResult.error.flatten());
        console.error("Raw result keys:", Object.keys(rawResult));
        return res.status(502).json({
          error: "Invalid AI response",
          message: "The AI returned an unexpected response format. Please try again."
        });
      }
      
      const llmResult = validationResult.data;
      
      // --- Doc fee cap check (hard override) ---
      const docFeeCapResult = stateData
        ? checkDocFeeCap(llmResult.detectedFields.fees, stateData)
        : null;

      // Emit consolidated single-line state+cap log and update metric with capViolation
      const capCheck = !!stateData;
      const capViolation = docFeeCapResult?.violated ?? false;
      console.log(
        `[stateDetection] method=${stateDetection.method ?? "null"} state=${stateDetection.state ?? "null"} capCheck=${capCheck} overage=${docFeeCapResult?.overage ?? 0}`
      );
      trackEvent("state_detection", {
        method: stateDetection.method ?? undefined,
        state: stateDetection.state ?? undefined,
        capViolation,
      });

      // --- Inject missing info for unknown/ambiguous state ---
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

      // --- Post-processing: deterministic cap violation augmentation ---
      // When a cap violation is detected, ensure summary/reasoning/suggestedReply
      // contain the required specifics (cap, charged, overage) regardless of LLM output.
      if (docFeeCapResult?.violated && stateData) {
        const { capAmount, chargedAmount, overage } = docFeeCapResult;
        const stateName = stateData.name;
        const capViolationPrefix = `ALERT: Doc fee of $${chargedAmount} exceeds ${stateName}'s legal cap of $${capAmount} by $${overage}.`;

        // Extract statute citation from specialNotes if present (never fabricate)
        let statuteCitation = "";
        if (stateData.specialNotes) {
          const statuteMatch = stateData.specialNotes.match(/([A-Z]{2,3}[\s.]+[\d.]+[\w.]*|§\s*[\d.]+[\w.]*|\b(?:Section|Sec\.|RS|RCW|ORS|MCL|CGS|GS|A\.?C\.?A\.?|C\.?R\.?S\.?|NRS|HSA|MCA)\s+[\d.-]+\w*)/i);
          if (statuteMatch) {
            statuteCitation = ` (${statuteMatch[0].trim()})`;
          }
        }

        // Augment summary if it doesn't already contain the cap amount
        if (!llmResult.summary.includes(String(capAmount))) {
          llmResult.summary = `${capViolationPrefix} ${llmResult.summary}`;
        }

        // Augment reasoning if it doesn't already contain the overage amount
        if (!llmResult.reasoning.includes(String(overage))) {
          llmResult.reasoning = `Doc fee cap violation: ${stateName} cap is $${capAmount}${statuteCitation}. Charged: $${chargedAmount}. Overage: $${overage}. This is a hard NO-GO regardless of other deal terms. ` + llmResult.reasoning;
        }

        // Augment suggestedReply if it doesn't challenge the specific overage
        if (!llmResult.suggestedReply.includes(String(capAmount)) && !llmResult.suggestedReply.includes(String(overage))) {
          const replyStatuteNote = statuteCitation ? ` per state law${statuteCitation}` : " to comply with state law";
          llmResult.suggestedReply = `I noticed the documentation fee of $${chargedAmount} exceeds the ${stateName} state cap of $${capAmount} by $${overage}. Please adjust the doc fee${replyStatuteNote}. ` + llmResult.suggestedReply;
        }
      }

      const ruleEngineAdjustments = applyRuleEngine(llmResult, llmResult.detectedFields, docFeeCapResult);
      
      const finalResult: AnalysisResponse = {
        ...llmResult,
        dealScore: ruleEngineAdjustments.dealScore,
        confidenceLevel: ruleEngineAdjustments.confidenceLevel,
        verdictLabel: ruleEngineAdjustments.verdictLabel,
        goNoGo: ruleEngineAdjustments.goNoGo,
      };
      
      console.log("Analysis successful - Deal Score:", finalResult.dealScore, "Confidence:", finalResult.confidenceLevel);
      
      trackEvent("submission", {
        vehicle: data.vehicle,
        zipCode: data.zipCode,
        sessionId: data.sessionId,
      });
      trackEvent("submission_score", {
        dealScore: finalResult.dealScore,
        vehicle: data.vehicle,
        sessionId: data.sessionId,
      });

      // --- Pre-save dealer submission to obtain listingId before sending the response ---
      // listingId === dealer_submissions.id (source of truth)
      let listingId: string | null = null;
      try {
        const { zipToStateCode } = await import("./zipToState");
        const { redactPII } = await import("./piiRedact");
        const stateCode = zipToStateCode(data.zipCode);
        const fees = finalResult.detectedFields.fees ?? [];
        const feeAmounts = fees.map((f) => f.amount).filter((a): a is number => a !== null);
        const toNum = (n: number | null | undefined): string | null => n != null ? String(n) : null;

        const submissionRow = await storage.saveDealerSubmission({
          analysisVersion: "v1",
          dealScore: finalResult.dealScore,
          confidenceLevel: finalResult.confidenceLevel,
          goNoGo: finalResult.goNoGo,
          verdictLabel: finalResult.verdictLabel,
          condition: data.condition,
          purchaseType: data.purchaseType,
          source: data.source ?? "paste",
          stateCode,
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
          flagPaymentOnly: finalResult.detectedFields.monthlyPayment !== null && finalResult.detectedFields.salePrice === null && finalResult.detectedFields.outTheDoorPrice === null,
          flagMissingOtd: finalResult.detectedFields.outTheDoorPrice === null,
          flagVagueFees: fees.some((f) => /protection|nitrogen|etch|ceramic|fabric|undercoat|pinstripe/i.test(f.name)),
          flagHighCostAddons: fees.filter((f) => /dealer.?add|add.?on|package/i.test(f.name) && (f.amount ?? 0) >= 500).length > 0,
          highCostAddonCount: fees.filter((f) => (f.amount ?? 0) >= 500).length,
          missingInfoCount: finalResult.missingInfo?.length ?? 0,
          detectedFields: finalResult.detectedFields,
          rawTextRedacted: redactPII(data.dealerText),
          rawTextStoredAt: new Date(),
          rawTextExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        });
        listingId = submissionRow?.id ?? null;
      } catch (saveErr) {
        console.error("[analyze] pre-save submission failed (non-fatal):", saveErr);
      }

      // --- Enrich marketContext with doc fee delta + dealer stats after LLM response ---
      if (marketContext) {
        const detectedFees = finalResult.detectedFields.fees ?? [];
        const docFeeEntry = detectedFees.find((f) => /doc.?fee|document/i.test(f.name));
        const docFeeValue = docFeeEntry?.amount ?? null;
        if (docFeeValue != null && marketContext.stateAvgDocFee != null && Number.isFinite(docFeeValue) && Number.isFinite(marketContext.stateAvgDocFee)) {
          const delta = docFeeValue - marketContext.stateAvgDocFee;
          marketContext.docFeeVsStateAvg = Math.abs(delta) > 2000 ? null : delta;
        }

        const detectedFieldsRaw = finalResult.detectedFields as Record<string, unknown>;
        const dealerNameForCtx: string | null =
          (detectedFieldsRaw?.dealerName as string | undefined) ??
          (detectedFieldsRaw?.dealership as string | undefined) ??
          null;
        if (dealerNameForCtx && stateDetection.state) {
          try {
            const dealerStats = await getDealerStats({
              state: stateDetection.state,
              dealerName: dealerNameForCtx,
            });
            if (dealerStats) {
              marketContext.dealerAnalysisCount = dealerStats.dealerAnalysisCount;
              marketContext.dealerAvgDealScore = dealerStats.dealerAvgDealScore;
            }
          } catch {
            // dealer enrichment is non-fatal
          }
        }
      }

      // Build response — always include listingId; include marketContext only when non-null
      const responsePayload: Record<string, unknown> = { ...finalResult };
      if (listingId) {
        responsePayload.listingId = listingId;
      }
      if (marketContext !== null) {
        responsePayload.marketContext = marketContext;
      }

      res.json(responsePayload);

      // Non-blocking warehouse write — submission row already saved above
      // Pass listingId so ingestor skips the saveDealerSubmission step
      enqueueSubmission({ request: data, result: finalResult, preSavedListingId: listingId });
    } catch (error) {
      console.error("Analysis error:", error);
      Sentry.withScope((scope) => {
        scope.setTag("feature", "analyze");
        scope.setTag("route", "/api/analyze");
        scope.setTag("error_type", error instanceof Error ? error.constructor.name : "unknown");
        Sentry.captureException(error);
      });
      
      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
        if (error.message.includes("timeout") || error.message.includes("ETIMEDOUT")) {
          errorMessage = "Request timed out. Please try again.";
        } else if (error.message.includes("rate limit")) {
          errorMessage = "Too many requests. Please wait a moment and try again.";
        }
      }
      
      res.status(500).json({ 
        error: "Failed to analyze deal",
        message: errorMessage
      });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    try {
      const feedbackSchema = z.object({
        listingId: z.string().min(1),
        rating: z.boolean(),
        comment: z.string().trim().max(500).optional().transform((v) => (v === "" ? undefined : v)),
      });

      const parseResult = feedbackSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid request", details: parseResult.error.flatten() });
      }

      const { listingId, rating, comment } = parseResult.data;

      await storage.createDealFeedback({
        listingId,
        rating,
        comment: comment ?? null,
      });

      return res.json({ ok: true });
    } catch (error) {
      console.error("[feedback] POST /api/feedback error:", error);
      return res.status(500).json({ error: "Failed to save feedback" });
    }
  });

  app.post("/api/extract-text", async (req, res) => {
    try {
      await runUploadMiddleware(req, res);
    } catch (err: any) {
      const reason = err?.code === "LIMIT_FILE_SIZE" ? "file_too_large" : "upload_error";
      trackEvent("file_processing", { fileSuccess: false, fileFailReason: reason });
      const message = err?.code === "LIMIT_FILE_SIZE"
        ? "That file is too large to process. Please use a file under 10 MB."
        : "Something went wrong processing the file.";
      return res.status(400).json({ message });
    }

    try {
      if (!req.file) {
        trackEvent("file_processing", { fileSuccess: false, fileFailReason: "no_file" });
        return res.status(400).json({ message: "No file uploaded." });
      }

      const { mimetype, buffer } = req.file;

      if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
        trackEvent("file_processing", { fileSuccess: false, fileFailReason: "unsupported_mime_type" });
        return res.status(400).json({ message: "That file type isn't supported." });
      }

      let text: string;
      try {
        text = await extractTextFromFile(buffer, mimetype);
      } catch (err) {
        console.error("Text extraction error:", err);
        trackEvent("file_processing", {
          fileSuccess: false,
          fileFailReason: err instanceof Error ? err.message.slice(0, 100) : "extraction_error",
        });
        return res.status(422).json({
          message: "We couldn't read enough text from that file. Try pasting the text or uploading a clearer image.",
        });
      }

      if (text.length < 20) {
        trackEvent("file_processing", {
          fileSuccess: false,
          fileFailReason: "too_short",
        });
        return res.status(422).json({
          message: "We couldn't read enough text from that file. Try pasting the text or uploading a clearer image.",
        });
      }

      trackEvent("file_processing", { fileSuccess: true });
      res.json({ text });
    } catch (err) {
      console.error("extract-text error:", err);
      Sentry.withScope((scope) => {
        scope.setTag("feature", "extract-text");
        scope.setTag("route", "/api/extract-text");
        scope.setTag("error_type", err instanceof Error ? err.constructor.name : "unknown");
        Sentry.captureException(err);
      });
      res.status(500).json({ message: "Something went wrong. Please try again." });
    }
  });

  app.get("/api/stripe-status", async (req, res) => {
    try {
      const configured = await isStripeConfigured();
      res.json({ configured });
    } catch {
      res.json({ configured: false });
    }
  });

  app.post("/api/track", async (req, res) => {
    try {
      const { eventType, metadata } = req.body;
      
      const validTypes = [
        "page_view", "cta_click", "form_start", "form_focus",
        "file_upload_failed", "analysis_failed", "checkout_failed",
        "scorecard_downloaded", "copy_summary", "optional_details_expanded",
        "experiment_assigned", "experiment_converted",
      ];
      if (!eventType || !validTypes.includes(eventType)) {
        return res.status(400).json({ error: "Invalid event type" });
      }
      
      await trackEvent(eventType, {
        ...metadata,
        referrer: req.headers.referer || metadata?.referrer,
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Track error:", error);
      res.status(500).json({ error: "Failed to track event" });
    }
  });

  app.get("/api/experiments", async (_req, res) => {
    try {
      const stats = await getExperimentStats();
      res.json(stats);
    } catch (error) {
      console.error("Experiments error:", error);
      res.status(500).json({ error: "Failed to fetch experiment stats" });
    }
  });

  app.post("/api/checkout", async (req, res) => {
    try {
      const { product, sessionId } = req.body;
      
      if (!product || !["deal_clarity", "negotiation_pack"].includes(product)) {
        return res.status(400).json({ error: "INVALID_PRODUCT" });
      }

      const secretKey = process.env.STRIPE_SECRET_KEY;
      if (!secretKey) {
        return res.status(400).json({ error: "PAYMENTS_NOT_CONFIGURED" });
      }

      let priceId: string | undefined;
      
      if (product === "deal_clarity") {
        priceId = process.env.STRIPE_PRICE_ID_49;
        if (!priceId) {
          return res.status(400).json({ error: "PAYMENTS_NOT_CONFIGURED" });
        }
      } else {
        priceId = process.env.STRIPE_PRICE_ID_79;
        if (!priceId) {
          return res.status(400).json({ error: "PAYMENTS_NOT_CONFIGURED" });
        }
      }

      const stripe = await getStripeClient();
      
      const baseUrl = process.env.REPLIT_DOMAINS
        ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
        : "http://localhost:5000";

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${baseUrl}/analyze?paid=1&product=${product}`,
        cancel_url: `${baseUrl}/analyze?paid=0`,
        metadata: { product, sessionId: sessionId ?? "" },
      });

      trackEvent("checkout_started", {
        stripeSessionId: session.id,
        sessionId: sessionId,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Checkout error:", error);
      Sentry.withScope((scope) => {
        scope.setTag("feature", "checkout");
        scope.setTag("route", "/api/checkout");
        scope.setTag("error_type", error instanceof Error ? error.constructor.name : "unknown");
        Sentry.captureException(error);
      });
      res.status(500).json({ error: "CHECKOUT_FAILED" });
    }
  });

  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const configured = await isStripeConfigured();
      if (!configured) {
        return res.status(503).json({ error: "Payments not configured" });
      }

      const { analysisId, tier, sessionId } = req.body;
      if (!analysisId) {
        return res.status(400).json({ error: "Missing analysisId" });
      }
      
      const selectedTier = tier === "49" ? "49" : "79";

      const stripe = await getStripeClient();
      
      const baseUrl = process.env.REPLIT_DOMAINS
        ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
        : "http://localhost:5000";

      let priceId: string | undefined;

      if (selectedTier === "49") {
        if (process.env.STRIPE_PRICE_ID_49) {
          priceId = process.env.STRIPE_PRICE_ID_49;
        } else {
          const products = await stripe.products.list({ active: true, limit: 20 });
          let product = products.data.find(p => p.name === "Odigos Deal Clarity Pack");
          
          if (!product) {
            product = await stripe.products.create({
              name: "Odigos Deal Clarity Pack",
              description: "Unlock red flags, missing info, and deal explanation",
            });
            const price = await stripe.prices.create({
              product: product.id,
              unit_amount: 4900,
              currency: "usd",
            });
            priceId = price.id;
          } else {
            const prices = await stripe.prices.list({ product: product.id, active: true, limit: 1 });
            priceId = prices.data[0]?.id;
          }
        }
      } else {
        if (process.env.STRIPE_PRICE_ID) {
          priceId = process.env.STRIPE_PRICE_ID;
        } else {
          const products = await stripe.products.list({ active: true, limit: 20 });
          let product = products.data.find(p => p.name === "Odigos Negotiation Pack");
          
          if (!product) {
            product = await stripe.products.create({
              name: "Odigos Negotiation Pack",
              description: "Unlock suggested dealer reply and detailed analysis reasoning",
            });
            const price = await stripe.prices.create({
              product: product.id,
              unit_amount: 7900,
              currency: "usd",
            });
            priceId = price.id;
          } else {
            const prices = await stripe.prices.list({ product: product.id, active: true, limit: 1 });
            priceId = prices.data[0]?.id;
          }
        }
      }

      if (!priceId) {
        return res.status(500).json({ error: "No price configured" });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${baseUrl}/analyze?session_id={CHECKOUT_SESSION_ID}&analysisId=${analysisId}`,
        cancel_url: `${baseUrl}/analyze?canceled=1&analysisId=${analysisId}`,
        metadata: { tier: selectedTier, sessionId: sessionId ?? "" },
      });

      trackEvent("checkout_started", {
        tier: selectedTier,
        stripeSessionId: session.id,
        sessionId: sessionId,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Checkout session error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  app.get("/api/verify-session", async (req, res) => {
    try {
      const { session_id } = req.query;
      
      if (!session_id || typeof session_id !== "string") {
        return res.json({ paid: false, tier: null });
      }

      const configured = await isStripeConfigured();
      if (!configured) {
        return res.json({ paid: false, tier: null });
      }

      const stripe = await getStripeClient();
      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ["line_items.data.price"],
      });
      
      if (session.payment_status !== "paid") {
        return res.json({ paid: false, tier: null });
      }

      let tier: "49" | "79" = "79";
      
      if (session.metadata?.tier) {
        tier = session.metadata.tier === "49" ? "49" : "79";
      } else {
        const lineItems = session.line_items?.data || [];
        const priceAmount = (lineItems[0]?.price as any)?.unit_amount;
        if (priceAmount === 4900) {
          tier = "49";
        }
      }
      
      const paymentSessionId = session.metadata?.sessionId || undefined;
      trackEvent("payment_completed", { tier, sessionId: paymentSessionId, stripeSessionId: session_id });
      
      res.json({ paid: true, tier });
    } catch (error) {
      console.error("Session verification error:", error);
      res.json({ paid: false, tier: null });
    }
  });

  app.post("/api/stripe-webhook", async (req, res) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET is not configured — rejecting webhook");
      return res.status(500).json({ error: "Webhook signing secret is not configured" });
    }
    const sig = req.headers["stripe-signature"];
    if (!sig) {
      trackEvent("stripe_webhook", { webhookStatus: "failed", errorMessage: "missing_signature" });
      return res.status(400).json({ error: "Missing stripe-signature header" });
    }
    let event: import("stripe").Stripe.Event;
    try {
      const stripe = await getStripeClient();
      const rawBody = req.rawBody instanceof Buffer ? req.rawBody : Buffer.from(req.rawBody as string ?? "");
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "signature_verification_failed";
      trackEvent("stripe_webhook", { webhookStatus: "failed", errorMessage: errMsg });
      return res.status(400).json({ error: "Webhook signature verification failed" });
    }
    
    trackEvent("stripe_webhook", { webhookEvent: event.type, webhookStatus: "success" });
    res.json({ received: true });
  });

  app.get("/api/metrics", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    
    try {
      const { getMetricsSummary } = await import("./metrics");
      const summary = await getMetricsSummary();
      res.json(summary);
    } catch (error: any) {
      console.error("Metrics error:", error?.message || error);
      res.status(500).json({ 
        error: "Failed to fetch metrics",
        message: error?.message,
        hasDbUrl: !!process.env.DATABASE_URL
      });
    }
  });

  app.post("/api/admin/import-stripe-history", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    
    try {
      const configured = await isStripeConfigured();
      if (!configured) {
        return res.status(400).json({ error: "Stripe is not configured" });
      }
      
      const stripe = await getStripeClient();
      const { getImportedSessionIds, importHistoricalEvents } = await import("./metrics");
      
      const alreadyImported = await getImportedSessionIds();
      
      const payments: Array<{
        id: string;
        amount: number;
        created: Date;
        tier: "49" | "79";
      }> = [];
      
      let hasMore = true;
      let startingAfter: string | undefined;
      let skipped = 0;
      
      while (hasMore) {
        const sessions = await stripe.checkout.sessions.list({
          limit: 100,
          starting_after: startingAfter,
          expand: ["data.line_items"],
        });
        
        for (const session of sessions.data) {
          if (session.payment_status === "paid") {
            if (alreadyImported.has(session.id)) {
              skipped++;
              continue;
            }
            
            let tier: "49" | "79" = "49";
            const amount = session.amount_total ? session.amount_total / 100 : 49;
            
            if (session.metadata?.tier) {
              tier = session.metadata.tier === "79" ? "79" : "49";
            } else if (amount >= 79) {
              tier = "79";
            }
            
            payments.push({
              id: session.id,
              amount,
              created: new Date(session.created * 1000),
              tier,
            });
          }
        }
        
        hasMore = sessions.has_more;
        if (sessions.data.length > 0) {
          startingAfter = sessions.data[sessions.data.length - 1].id;
        } else {
          hasMore = false;
        }
      }
      
      if (payments.length === 0) {
        return res.json({ 
          success: true, 
          imported: 0,
          skipped,
          totalEvents: 0,
          message: skipped > 0 
            ? `No new payments to import (${skipped} already imported)` 
            : "No payments found in Stripe"
        });
      }
      
      const events = [];
      for (const payment of payments) {
        events.push({
          eventType: "checkout_started" as const,
          createdAt: new Date(payment.created.getTime() - 60000).toISOString(),
          metadata: { tier: payment.tier, stripeSessionId: payment.id },
        });
        events.push({
          eventType: "payment_completed" as const,
          createdAt: payment.created.toISOString(),
          metadata: { tier: payment.tier, stripeSessionId: payment.id },
        });
        events.push({
          eventType: "submission" as const,
          createdAt: new Date(payment.created.getTime() - 120000).toISOString(),
          metadata: { stripeSessionId: payment.id },
        });
      }
      
      await importHistoricalEvents(events);
      
      res.json({ 
        success: true, 
        imported: payments.length,
        skipped,
        totalEvents: events.length,
        message: `Imported ${payments.length} new payments (${events.length} events)${skipped > 0 ? `, skipped ${skipped} duplicates` : ''}`
      });
    } catch (error: any) {
      console.error("Stripe import error:", error);
      res.status(500).json({ 
        error: "Failed to import Stripe history",
        message: error?.message 
      });
    }
  });

  app.get("/api/state-fee/:state", (req, res) => {
    const state = (req.params.state ?? "").toUpperCase();
    const data = getStateFeeData(state);
    if (!data) {
      return res.status(404).json({ error: "Unknown state abbreviation" });
    }
    return res.json(data);
  });

  app.get("/api/health", (_req, res) => {
    const uptimeSeconds = process.uptime();
    const mem = process.memoryUsage();
    const heapUsedMb = Math.round(mem.heapUsed / 1024 / 1024 * 10) / 10;
    const heapTotalMb = Math.round(mem.heapTotal / 1024 / 1024 * 10) / 10;
    const rssM = Math.round(mem.rss / 1024 / 1024 * 10) / 10;
    const status = rssM > 1536 ? "degraded" : "healthy";
    res.json({
      status,
      uptimeSeconds: Math.round(uptimeSeconds),
      memory: { heapUsedMb, heapTotalMb, rssMb: rssM },
    });
  });

  app.post("/api/vitals", async (req, res) => {
    try {
      const { name, value, rating } = req.body;
      const validNames = ["LCP", "CLS", "FID", "INP", "TTFB", "FCP"];
      if (!name || !validNames.includes(name) || typeof value !== "number") {
        return res.status(400).json({ error: "Invalid vitals payload" });
      }
      await trackEvent("vitals", {
        vitalsName: name,
        vitalsValue: value,
        vitalsRating: rating || null,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Vitals error:", error);
      res.status(500).json({ error: "Failed to record vitals" });
    }
  });

  app.get("/api/alerts", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const { getAlertsStatus } = await import("./alerts");
      const status = await getAlertsStatus();
      res.json(status);
    } catch (error: any) {
      console.error("[alerts] /api/alerts error:", error?.message || error);
      res.status(500).json({ error: "Failed to fetch alert status", message: error?.message });
    }
  });

  app.get("/api/technical", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const { getTechnicalSummary, getPiiExpiryStatus } = await import("./metrics");
      const [summary, piiRetention] = await Promise.all([
        getTechnicalSummary(),
        getPiiExpiryStatus(),
      ]);
      res.json({ ...summary, piiRetention });
    } catch (error: any) {
      console.error("Technical metrics error:", error?.message || error);
      res.status(500).json({ error: "Failed to fetch technical metrics", message: error?.message });
    }
  });

  // BI Dashboard endpoints
  type DateRange = "today" | "week" | "month" | "all";
  const VALID_RANGES: DateRange[] = ["today", "week", "month", "all"];

  function requireAdminKey(req: Request, res: Response): boolean {
    const configuredKey = process.env.ADMIN_KEY;
    if (!configuredKey) { res.status(503).json({ error: "Admin access not configured" }); return false; }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" }); return false;
    }
    const providedKey = authHeader.slice("Bearer ".length);
    try {
      const a = Buffer.from(configuredKey);
      const b = Buffer.from(providedKey);
      if (a.length !== b.length || !timingSafeEqual(a, b)) {
        res.status(401).json({ error: "Unauthorized" }); return false;
      }
    } catch {
      res.status(401).json({ error: "Unauthorized" }); return false;
    }
    return true;
  }

  function parseRange(req: Request): DateRange {
    const r = req.query.range;
    return (typeof r === "string" && VALID_RANGES.includes(r as DateRange)) ? (r as DateRange) : "all";
  }

  app.get("/api/admin/bi/funnel", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const range = parseRange(req);
      const { getBIFunnel } = await import("./metrics");
      res.json(await getBIFunnel(range));
    } catch (e: any) { res.status(500).json({ error: e?.message }); }
  });

  app.get("/api/admin/bi/attribution", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const range = parseRange(req);
      const { getBIPageAttribution } = await import("./metrics");
      res.json(await getBIPageAttribution(range));
    } catch (e: any) { res.status(500).json({ error: e?.message }); }
  });

  app.get("/api/admin/bi/behavior", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const range = parseRange(req);
      const { getBIUserBehavior } = await import("./metrics");
      res.json(await getBIUserBehavior(range));
    } catch (e: any) { res.status(500).json({ error: e?.message }); }
  });

  app.get("/api/admin/bi/deal-outcome", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const range = parseRange(req);
      const { getBIDealOutcome } = await import("./metrics");
      res.setHeader("Cache-Control", "private, max-age=120");
      res.json(await getBIDealOutcome(range));
    } catch (e: any) { res.status(500).json({ error: e?.message }); }
  });

  app.get("/api/admin/bi/geographic", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const range = parseRange(req);
      const { getBIGeographic } = await import("./metrics");
      res.setHeader("Cache-Control", "private, max-age=120");
      res.json(await getBIGeographic(range));
    } catch (e: any) { res.status(500).json({ error: e?.message }); }
  });

  app.get("/api/admin/bi/acquisition", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const range = parseRange(req);
      const { getBIAcquisition } = await import("./metrics");
      res.json(await getBIAcquisition(range));
    } catch (e: any) { res.status(500).json({ error: e?.message }); }
  });

  app.get("/api/admin/bi/revenue", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const range = parseRange(req);
      const { getBIRevenue } = await import("./metrics");
      res.json(await getBIRevenue(range));
    } catch (e: any) { res.status(500).json({ error: e?.message }); }
  });

  app.get("/api/admin/bi/fallout", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const range = parseRange(req);
      const { getBIFallout } = await import("./metrics");
      res.json(await getBIFallout(range));
    } catch (e: any) { res.status(500).json({ error: e?.message }); }
  });

  // ── Platform Stats ────────────────────────────────────────────────────────

  app.get("/api/stats", async (_req, res) => {
    try {
      if (!process.env.DATABASE_URL) {
        return res.json({
          real_analyzed_deals: 0,
          user_submissions: 0,
          total_dataset_size: 0,
          unique_dealers: 0,
          new_last_24h: 0,
          last_updated_at: null,
        });
      }

      const { db } = await import("./db");
      const { sql } = await import("drizzle-orm");

      // ── Primary: core.platform_metrics materialized view ──────────────────
      // view columns: real_deals_analyzed, user_submissions, unique_dealers, last_updated_at
      let viewRow: Record<string, unknown> | null = null;
      let viewHasData = false;
      try {
        const viewResult = await db.execute(
          sql`SELECT * FROM core.platform_metrics LIMIT 1`,
        );
        const candidate = viewResult.rows?.[0] as Record<string, unknown> | undefined;
        if (candidate && Number(candidate.real_deals_analyzed ?? 0) > 0) {
          viewRow = candidate;
          viewHasData = true;
        }
      } catch {
        viewRow = null;
      }

      // ── Fallback (view empty/unavailable): direct aggregate with identical semantics ─
      // real_analyzed_deals = counts_toward_real_deals = TRUE
      //   which includes user_submitted + internal_backfill (all with is_fully_processed=true)
      //   and EXCLUDES seed (counts_toward_real_deals always false for seed)
      let fallbackRow: Record<string, unknown> | null = null;
      if (!viewHasData) {
        try {
          const fbResult = await db.execute(sql`
            SELECT
              COUNT(*) FILTER (WHERE counts_toward_real_deals = TRUE)          AS real_deals_analyzed,
              COUNT(*) FILTER (WHERE ingestion_source = 'user_submitted')      AS user_submissions,
              COUNT(DISTINCT dealer_id)                                         AS unique_dealers,
              MAX(analyzed_at)                                                  AS last_updated_at
            FROM core.listings
          `);
          fallbackRow = (fbResult.rows?.[0] as Record<string, unknown>) ?? null;
        } catch {
          fallbackRow = null;
        }
      }

      const statsRow = viewRow ?? fallbackRow ?? {};

      // ── Live supplements: total_dataset_size + new_last_24h (always fresh) ─
      let totalDatasetSize = 0;
      let newLast24h = 0;
      try {
        const liveResult = await db.execute(sql`
          SELECT
            COUNT(*) AS total_dataset_size,
            COUNT(*) FILTER (WHERE analyzed_at >= NOW() - INTERVAL '24 hours') AS new_last_24h
          FROM core.listings
        `);
        const lr = liveResult.rows?.[0] as Record<string, unknown> | undefined;
        totalDatasetSize = Number(lr?.total_dataset_size ?? 0);
        newLast24h = Number(lr?.new_last_24h ?? 0);
      } catch {
        // Ignore — return 0
      }

      res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
      res.json({
        real_analyzed_deals: Number(statsRow.real_deals_analyzed ?? 0),
        user_submissions: Number(statsRow.user_submissions ?? 0),
        total_dataset_size: totalDatasetSize,
        unique_dealers: Number(statsRow.unique_dealers ?? 0),
        new_last_24h: newLast24h,
        last_updated_at: statsRow.last_updated_at ?? null,
      });
    } catch (err) {
      console.error("[stats] /api/stats error:", err);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/stats/count", async (_req, res) => {
    try {
      if (!process.env.DATABASE_URL) {
        return res.json({ count: 0, type: "none" });
      }

      const { db } = await import("./db");
      const { sql } = await import("drizzle-orm");

      let count = 0;
      let type: "real_deals" | "none" = "none";

      try {
        const realResult = await db.execute(
          sql`SELECT COUNT(*) AS cnt FROM core.listings
              WHERE counts_toward_real_deals = TRUE
                AND ingestion_source IN ('user_submitted', 'internal_backfill')`,
        );
        const realRow = realResult.rows?.[0] as Record<string, unknown> | undefined;
        const realDeals = Number(realRow?.cnt ?? 0);

        if (realDeals > 0) {
          count = realDeals;
          type = "real_deals";
        }
      } catch {
      }

      res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
      res.json({ count, type });
    } catch (err) {
      console.error("[stats] /api/stats/count error:", err);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/warehouse/stats", async (_req, res) => {
    try {
      if (!process.env.DATABASE_URL) return res.json([]);
      const { db } = await import("./db");
      const { sql } = await import("drizzle-orm");
      const rows = await db.execute(sql`SELECT * FROM core.national_stats LIMIT 1`);
      res.json(rows.rows?.[0] ?? {});
    } catch (err) {
      console.error("[stats] /api/warehouse/stats error:", err);
      res.status(500).json({ error: "Failed to fetch national stats" });
    }
  });

  app.get("/api/warehouse/stats/state/:stateCode", async (req, res) => {
    try {
      if (!process.env.DATABASE_URL) return res.json(null);
      const { db } = await import("./db");
      const { sql } = await import("drizzle-orm");
      const code = (req.params.stateCode ?? "").toUpperCase().slice(0, 2);
      if (!code) return res.status(400).json({ error: "Invalid state code" });

      const rows = await db.execute(sql`
        SELECT
          ss.*,
          s.doc_fee_cap,
          s.doc_fee_cap_type,
          s.doc_fee_cap_statute,
          s.sales_tax_base,
          s.trade_in_credit
        FROM core.state_stats ss
        LEFT JOIN core.states s ON s.state_code = ss.state_code
        WHERE ss.state_code = ${code}
        LIMIT 1
      `);
      const row = rows.rows?.[0] ?? null;
      if (!row) return res.status(404).json({ error: "State not found" });
      res.json(row);
    } catch (err) {
      console.error("[stats] /api/warehouse/stats/state error:", err);
      res.status(500).json({ error: "Failed to fetch state stats" });
    }
  });

  app.get("/sitemap.xml", (_req, res) => {
    res.type("application/xml");
    res.sendFile("sitemap.xml", { root: "." });
  });

  app.get("/robots.txt", (_req, res) => {
    const siteUrl = process.env.SITE_URL || "https://odigosauto.com";
    res.type("text/plain");
    res.send(`User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml`);
  });

  return httpServer;
}
