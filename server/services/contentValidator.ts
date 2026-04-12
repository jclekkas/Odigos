/**
 * Two-tier content validation for dealer quote text.
 *
 * Tier 1 (free, instant): heuristic keyword scan for common dealer terms.
 * Tier 2 (cheap, ~200 tokens): gpt-4o-mini classification when zero
 *   keywords are found.
 *
 * Fail-open: if the LLM classifier errors, content passes through to the
 * full analysis. A false negative (garbage gets analyzed) wastes one API
 * call; a false positive (real quote gets blocked) harms the user.
 */
import { openai, isOpenAIConfigured } from "../openaiClient.js";
import { AI_FALLBACK_MODEL } from "../config/aiModel.js";
import { logger } from "../logger.js";

/** Terms that appear in virtually all legitimate dealer quotes. */
const DEALER_KEYWORDS: string[] = [
  // Pricing
  "msrp", "sale price", "selling price", "otd", "out the door", "out-the-door",
  "sticker", "invoice", "list price",
  // Fees
  "doc fee", "documentation fee", "dealer fee", "destination", "freight",
  "title fee", "registration", "tag fee", "acquisition fee", "disposition fee",
  // Financing
  "apr", "interest rate", "monthly payment", "finance", "loan", "term",
  "down payment", "trade-in", "trade in", "payoff", "residual",
  "money factor", "lease",
  // Deal structure
  "rebate", "incentive", "discount", "markup", "market adjustment",
  "addendum", "dealer add-on", "protection package", "gap insurance",
  "extended warranty", "service contract",
  // Vehicle identifiers
  "vin", "stock #", "stock number", "mileage",
  // Dealer context
  "dealer", "dealership", "salesman", "sales rep", "f&i", "finance manager",
  "buyer's order", "purchase agreement", "purchase order",
  // Common abbreviations
  "otd price", "/mo", "per month",
];

export interface ContentValidationResult {
  isRelevant: boolean;
  confidence: "high" | "medium" | "low";
  category: string;
  rejectionReason: string | null;
  method: "heuristic" | "llm";
}

export interface HeuristicResult {
  keywordCount: number;
  matchedKeywords: string[];
}

/**
 * Fast, zero-cost keyword scan. Returns the count and list of distinct
 * dealer-related keywords found in the text.
 */
export function heuristicDealerCheck(text: string): HeuristicResult {
  const lower = text.toLowerCase();
  const matched: string[] = [];
  for (const keyword of DEALER_KEYWORDS) {
    if (lower.includes(keyword)) {
      matched.push(keyword);
    }
  }
  return { keywordCount: matched.length, matchedKeywords: matched };
}

const CLASSIFICATION_PROMPT = `You are a content classifier. Determine whether the following text is related to a car dealership transaction, quote, offer, negotiation, or vehicle purchase discussion.

Respond with a JSON object:
{
  "isRelevant": true or false,
  "confidence": "high" or "medium" or "low",
  "category": "<one of: 'dealer_quote', 'deal_negotiation', 'vehicle_listing', 'financing_terms', 'unrelated_text', 'gibberish', 'too_short'>",
  "rejectionReason": "<if not relevant, a user-friendly explanation like 'This text doesn\\'t appear to contain any car dealer pricing, fees, or deal terms.' or 'This looks like a recipe, not a car dealer quote.'; null if relevant>"
}`;

const CLASSIFIER_TIMEOUT_MS = 5_000;
const CLASSIFIER_MAX_TOKENS = 200;

/**
 * Validate whether text looks like dealer quote content.
 *
 * 1. Text < 10 chars → not relevant
 * 2. >= 2 keywords → relevant (zero cost)
 * 3. == 1 keyword  → relevant, low confidence (benefit of the doubt)
 * 4. 0 keywords    → LLM classification via gpt-4o-mini
 * 5. LLM failure   → fail open (treat as relevant)
 */
export async function validateDealerContent(text: string): Promise<ContentValidationResult> {
  const trimmed = text.trim();

  if (trimmed.length < 10) {
    return {
      isRelevant: false,
      confidence: "high",
      category: "too_short",
      rejectionReason: "The text is too short to analyze. Please paste more of the dealer quote.",
      method: "heuristic",
    };
  }

  const { keywordCount } = heuristicDealerCheck(trimmed);

  if (keywordCount >= 2) {
    return {
      isRelevant: true,
      confidence: "high",
      category: "dealer_quote",
      rejectionReason: null,
      method: "heuristic",
    };
  }

  if (keywordCount === 1) {
    return {
      isRelevant: true,
      confidence: "low",
      category: "dealer_quote",
      rejectionReason: null,
      method: "heuristic",
    };
  }

  // Zero keywords — call the cheap LLM classifier
  if (!isOpenAIConfigured()) {
    // Can't classify without AI; fail open
    return {
      isRelevant: true,
      confidence: "low",
      category: "dealer_quote",
      rejectionReason: null,
      method: "heuristic",
    };
  }

  try {
    const llmPromise = openai.chat.completions.create({
      model: AI_FALLBACK_MODEL,
      messages: [
        { role: "system", content: CLASSIFICATION_PROMPT },
        { role: "user", content: trimmed.slice(0, 2000) },
      ],
      max_tokens: CLASSIFIER_MAX_TOKENS,
      response_format: { type: "json_object" },
      temperature: 0,
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Classifier timeout")), CLASSIFIER_TIMEOUT_MS),
    );

    const response = await Promise.race([llmPromise, timeoutPromise]);

    const raw = response.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(raw);

    return {
      isRelevant: typeof parsed.isRelevant === "boolean" ? parsed.isRelevant : true,
      confidence: ["high", "medium", "low"].includes(parsed.confidence) ? parsed.confidence : "low",
      category: typeof parsed.category === "string" ? parsed.category : "dealer_quote",
      rejectionReason: typeof parsed.rejectionReason === "string" ? parsed.rejectionReason : null,
      method: "llm" as const,
    };
  } catch (err) {
    // Fail open — never block a potentially valid submission due to
    // classifier unavailability.
    logger.warn("Content classifier failed, allowing through", {
      source: "contentValidator",
      error: err instanceof Error ? err.message : String(err),
    });
    return {
      isRelevant: true,
      confidence: "low",
      category: "dealer_quote",
      rejectionReason: null,
      method: "llm",
    };
  }
}
