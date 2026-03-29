import * as Sentry from "@sentry/node";
import { openai } from "../openaiClient";
import { withJitteredBackoff, isRetriableError } from "../lib/reliability";
import { aiCircuitBreaker, CircuitOpenError } from "../lib/circuitBreaker";
export class AnalyzeServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly body: Record<string, unknown>,
  ) {
    super((body.error as string) ?? "Service error");
  }
}

const AI_MAX_RETRIES = 2;
const AI_ATTEMPT_TIMEOUT_MS = 30_000;
const AI_TOTAL_BUDGET_MS = 75_000;

export async function callAiWithRetry(
  systemPrompt: string,
  userMessage: string,
): Promise<Awaited<ReturnType<typeof openai.chat.completions.create>>> {
  try {
    return await withJitteredBackoff(
      async (attempt) => {
        if (attempt > 1) {
          console.log(`[analyze] AI retry attempt ${attempt}/${AI_MAX_RETRIES + 1}`);
        }
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
              )
            ),
          ])
        );
      },
      {
        maxAttempts: AI_MAX_RETRIES + 1,
        baseDelayMs: 500,
        maxDelayMs: 5000,
        totalBudgetMs: AI_TOTAL_BUDGET_MS,
        onRetry: (attempt, err, delayMs) => {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(
            `[analyze] AI call failed on attempt ${attempt}, retrying in ${Math.round(delayMs)}ms. reason=${msg}`,
          );
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
      throw new AnalyzeServiceError(503, {
        error: "Service temporarily unavailable",
        message: "The analysis service is temporarily unavailable. Please try again in a moment.",
      });
    }
    const isRetriable = isRetriableError(aiErr as Error);
    console.error(`[analyze] AI call exhausted retries. retriable=${isRetriable}`, aiErr);
    Sentry.captureException(aiErr, {
      level: "error",
      extra: { maxRetries: AI_MAX_RETRIES, budgetMs: AI_TOTAL_BUDGET_MS },
    });
    throw new AnalyzeServiceError(502, {
      error: "AI service error",
      message: "Unable to analyze the deal at this time. Please try again.",
    });
  }
}
