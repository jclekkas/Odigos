import type { Express } from "express";
import { createServer, type Server } from "http";
import OpenAI from "openai";
import { analysisRequestSchema, analysisResponseSchema, type AnalysisResponse } from "@shared/schema";
import { applyRuleEngine } from "./ruleEngine";
import { getStripeClient, isStripeConfigured } from "./stripeClient";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

console.log("OpenAI configured with base URL:", process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ? "set" : "not set");
console.log("OpenAI API key:", process.env.AI_INTEGRATIONS_OPENAI_API_KEY ? "set" : "not set");

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

      const systemPrompt = `You are an expert car buying advisor helping consumers evaluate car purchase offers. Your job is to analyze dealer quotes, texts, and emails to help buyers understand if they're getting a good deal.

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
      
      const ruleEngineAdjustments = applyRuleEngine(llmResult, llmResult.detectedFields);
      
      const finalResult: AnalysisResponse = {
        ...llmResult,
        dealScore: ruleEngineAdjustments.dealScore,
        confidenceLevel: ruleEngineAdjustments.confidenceLevel,
        verdictLabel: ruleEngineAdjustments.verdictLabel,
        goNoGo: ruleEngineAdjustments.goNoGo,
      };
      
      console.log("Analysis successful - Deal Score:", finalResult.dealScore, "Confidence:", finalResult.confidenceLevel);
      res.json(finalResult);
    } catch (error) {
      console.error("Analysis error:", error);
      
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

  app.get("/api/stripe-status", async (req, res) => {
    try {
      const configured = await isStripeConfigured();
      res.json({ configured });
    } catch {
      res.json({ configured: false });
    }
  });

  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const configured = await isStripeConfigured();
      if (!configured) {
        return res.status(503).json({ error: "Payments not configured" });
      }

      const { analysisId, tier } = req.body;
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
        metadata: { tier: selectedTier },
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
      
      res.json({ paid: true, tier });
    } catch (error) {
      console.error("Session verification error:", error);
      res.json({ paid: false, tier: null });
    }
  });

  return httpServer;
}
