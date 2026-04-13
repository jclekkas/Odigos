import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../server/openaiClient", () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
  isOpenAIConfigured: vi.fn(() => true),
}));

vi.mock("../../server/db", () => ({
  db: { execute: vi.fn(), select: vi.fn(), insert: vi.fn() },
  pool: { end: vi.fn() },
}));

import { openai, isOpenAIConfigured } from "../../server/openaiClient.js";
import {
  heuristicDealerCheck,
  validateDealerContent,
} from "../../server/services/contentValidator.js";

beforeEach(() => {
  (openai.chat.completions.create as ReturnType<typeof vi.fn>).mockReset();
  vi.mocked(isOpenAIConfigured).mockReturnValue(true);
});

// ─── heuristicDealerCheck ───────────────────────────────────────────────────

describe("heuristicDealerCheck", () => {
  it("finds multiple keywords in a typical dealer quote", () => {
    const result = heuristicDealerCheck(
      "OTD price $35,000. APR 4.9% for 60 months. Doc fee $199."
    );
    expect(result.keywordCount).toBeGreaterThanOrEqual(3);
    expect(result.matchedKeywords).toEqual(
      expect.arrayContaining(["otd price", "apr", "doc fee"])
    );
  });

  it("returns 0 keywords for pure gibberish", () => {
    const result = heuristicDealerCheck("asdfgh jklmnop qwerty zxcvbn");
    expect(result.keywordCount).toBe(0);
    expect(result.matchedKeywords).toHaveLength(0);
  });

  it("returns 0 keywords for empty string", () => {
    const result = heuristicDealerCheck("");
    expect(result.keywordCount).toBe(0);
  });

  it("returns 0 keywords for unrelated content", () => {
    const result = heuristicDealerCheck(
      "My cat is orange and loves tuna. The weather is sunny today."
    );
    expect(result.keywordCount).toBe(0);
  });

  it("detects a single keyword in short but valid text", () => {
    const result = heuristicDealerCheck("$499 doc fee");
    expect(result.keywordCount).toBeGreaterThanOrEqual(1);
    expect(result.matchedKeywords).toContain("doc fee");
  });

  it("detects keywords case-insensitively", () => {
    const result = heuristicDealerCheck("The MSRP is $40,000 and the APR is 3.5%");
    expect(result.keywordCount).toBeGreaterThanOrEqual(2);
  });

  it("detects financing keywords", () => {
    const result = heuristicDealerCheck(
      "Monthly payment $450, 72 month term, down payment $5,000"
    );
    expect(result.keywordCount).toBeGreaterThanOrEqual(2);
    expect(result.matchedKeywords).toEqual(
      expect.arrayContaining(["monthly payment", "down payment"])
    );
  });

  it("detects lease keywords", () => {
    const result = heuristicDealerCheck(
      "Lease offer: money factor 0.00125, residual 58%, acquisition fee $695"
    );
    expect(result.keywordCount).toBeGreaterThanOrEqual(3);
  });
});

// ─── validateDealerContent ──────────────────────────────────────────────────

describe("validateDealerContent", () => {
  it("rejects text shorter than 10 characters", async () => {
    const result = await validateDealerContent("hi");
    expect(result.isRelevant).toBe(false);
    expect(result.category).toBe("too_short");
    expect(result.method).toBe("heuristic");
    expect(result.rejectionReason).toMatch(/too short/i);
  });

  it("passes text with >= 2 dealer keywords (heuristic, no LLM call)", async () => {
    const result = await validateDealerContent(
      "OTD price $35,000. APR 4.9% for 60 months."
    );
    expect(result.isRelevant).toBe(true);
    expect(result.method).toBe("heuristic");
    expect(openai.chat.completions.create).not.toHaveBeenCalled();
  });

  it("passes text with exactly 1 keyword (benefit of the doubt)", async () => {
    const result = await validateDealerContent(
      "They quoted me 499 for the doc fee and nothing else was listed"
    );
    expect(result.isRelevant).toBe(true);
    expect(result.confidence).toBe("low");
    expect(result.method).toBe("heuristic");
    expect(openai.chat.completions.create).not.toHaveBeenCalled();
  });

  it("calls LLM classifier when zero keywords are found", async () => {
    (openai.chat.completions.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      choices: [{
        message: {
          content: JSON.stringify({
            isRelevant: false,
            confidence: "high",
            category: "unrelated_text",
            rejectionReason: "This text appears to be about pets, not a car dealer quote.",
          }),
        },
      }],
    });

    const result = await validateDealerContent(
      "My cat is orange and loves tuna. He sleeps on the couch all day."
    );
    expect(result.isRelevant).toBe(false);
    expect(result.method).toBe("llm");
    expect(result.rejectionReason).toMatch(/pet/i);
    expect(openai.chat.completions.create).toHaveBeenCalledOnce();
  });

  it("LLM classifier can approve ambiguous text", async () => {
    (openai.chat.completions.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      choices: [{
        message: {
          content: JSON.stringify({
            isRelevant: true,
            confidence: "medium",
            category: "deal_negotiation",
            rejectionReason: null,
          }),
        },
      }],
    });

    const result = await validateDealerContent(
      "Hey John, I talked to the manager and he said we can work something out on the price. Let me know."
    );
    expect(result.isRelevant).toBe(true);
    expect(result.method).toBe("llm");
  });

  it("fails open when LLM classifier throws an error", async () => {
    (openai.chat.completions.create as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Connection timeout")
    );

    const result = await validateDealerContent(
      "The quick brown fox jumps over the lazy dog"
    );
    expect(result.isRelevant).toBe(true);
    expect(result.method).toBe("llm");
  });

  it("fails open when OpenAI is not configured", async () => {
    vi.mocked(isOpenAIConfigured).mockReturnValueOnce(false);

    const result = await validateDealerContent(
      "The quick brown fox jumps over the lazy dog"
    );
    expect(result.isRelevant).toBe(true);
    expect(result.method).toBe("heuristic");
    expect(openai.chat.completions.create).not.toHaveBeenCalled();
  });

  it("fails open when LLM returns invalid JSON", async () => {
    (openai.chat.completions.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      choices: [{
        message: { content: "not valid json at all" },
      }],
    });

    const result = await validateDealerContent(
      "The quick brown fox jumps over a lazy dog near the river bank"
    );
    expect(result.isRelevant).toBe(true);
    expect(result.method).toBe("llm");
  });

  it("rejects recipe text via LLM", async () => {
    (openai.chat.completions.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      choices: [{
        message: {
          content: JSON.stringify({
            isRelevant: false,
            confidence: "high",
            category: "unrelated_text",
            rejectionReason: "This looks like a recipe, not a car dealer quote.",
          }),
        },
      }],
    });

    const result = await validateDealerContent(
      "Preheat oven to 350. Mix flour, eggs, and sugar. Bake for 25 minutes."
    );
    expect(result.isRelevant).toBe(false);
    expect(result.rejectionReason).toMatch(/recipe/i);
  });

  it("passes short but valid text like '$32,500 OTD'", async () => {
    const result = await validateDealerContent("$32,500 OTD");
    expect(result.isRelevant).toBe(true);
    expect(result.method).toBe("heuristic");
  });
});
