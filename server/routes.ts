import type { Express } from "express";
import { createServer, type Server } from "http";
import OpenAI from "openai";
import { analysisRequestSchema, analysisResponseSchema, type AnalysisResponse } from "@shared/schema";
import { applyRuleEngine } from "./ruleEngine";

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

6. Be skeptical of payment-only quotes without total cost breakdowns.

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

  return httpServer;
}
