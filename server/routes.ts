import type { Express } from "express";
import { createServer, type Server } from "http";
import OpenAI from "openai";
import { analysisRequestSchema, analysisResponseSchema, type AnalysisResponse } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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

CRITICAL REQUIREMENTS:
1. If key information is missing or ambiguous, you MUST explicitly state what's missing and provide the exact questions the buyer should ask the dealer.
2. Be decisive - give a clear GREEN/YELLOW/RED score and GO/NO-GO recommendation.
3. Extract all pricing information you can find (sale price, MSRP, fees, monthly payments, etc.)
4. Be skeptical of deals that only show monthly payments without total cost breakdowns.
5. Flag any suspicious fees or unclear terms.

You must respond with a valid JSON object with this exact structure:
{
  "dealScore": "GREEN" | "YELLOW" | "RED",
  "goNoGo": "GO" | "NO-GO",
  "summary": "Plain English explanation of what this deal means for the buyer",
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
- GREEN: Good deal - clear pricing, reasonable fees, transparent terms, competitive price
- YELLOW: Needs more information - missing key details, some concerns but not dealbreakers
- RED: Poor deal - excessive fees, unclear terms, pressure tactics, or significantly overpriced

GO/NO-GO DECISION:
- GO: Buyer has enough information and the deal is reasonable enough to visit dealership
- NO-GO: Buyer should get more information or look elsewhere before visiting`;

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

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 4096,
      });

      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error("No response from AI");
      }

      const rawResult = JSON.parse(content);
      
      const validationResult = analysisResponseSchema.safeParse(rawResult);
      
      if (!validationResult.success) {
        console.error("AI response validation failed:", validationResult.error.flatten());
        return res.status(502).json({
          error: "Invalid AI response",
          message: "The AI returned an unexpected response format. Please try again."
        });
      }
      
      res.json(validationResult.data);
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ 
        error: "Failed to analyze deal",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  return httpServer;
}
