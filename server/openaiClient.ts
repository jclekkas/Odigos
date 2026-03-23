import OpenAI from "openai";
import type { ChatCompletion, ChatCompletionCreateParamsNonStreaming } from "openai/resources/chat/completions";
import { trackEvent } from "./metrics";

const rawClient = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

async function trackedCreate(
  params: ChatCompletionCreateParamsNonStreaming
): Promise<ChatCompletion> {
  const start = Date.now();
  try {
    const response = await rawClient.chat.completions.create(params);
    const latencyMs = Date.now() - start;
    const usage = response.usage;
    trackEvent("api_request", {
      endpoint: "openai_chat",
      method: "POST",
      statusCode: 200,
      responseTimeMs: latencyMs,
      promptTokens: usage?.prompt_tokens ?? 0,
      completionTokens: usage?.completion_tokens ?? 0,
      totalTokens: usage?.total_tokens ?? 0,
    });
    return response;
  } catch (err) {
    const latencyMs = Date.now() - start;
    trackEvent("api_error", {
      endpoint: "openai_chat",
      method: "POST",
      statusCode: 500,
      responseTimeMs: latencyMs,
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export const openai = {
  chat: {
    completions: {
      create: trackedCreate,
    },
  },
};
