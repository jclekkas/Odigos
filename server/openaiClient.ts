import OpenAI from "openai";
import type { ChatCompletion, ChatCompletionCreateParamsNonStreaming } from "openai/resources/chat/completions";
import { trackEvent } from "./metrics.js";

// Lazy-init so the module can be imported even if AI_INTEGRATIONS_OPENAI_API_KEY
// is missing. Constructing the OpenAI client with an undefined apiKey throws
// synchronously ("Missing credentials"), which would otherwise crash the whole
// serverless function at cold-start and make /api/health unreachable. Callers
// see an informative error only when they actually invoke the API.
let _rawClient: OpenAI | undefined;

function getRawClient(): OpenAI {
  if (_rawClient) return _rawClient;
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "AI_INTEGRATIONS_OPENAI_API_KEY is not set — AI analysis is unavailable. " +
      "Set AI_INTEGRATIONS_OPENAI_API_KEY on the Vercel project and redeploy.",
    );
  }
  _rawClient = new OpenAI({
    apiKey,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });
  return _rawClient;
}

async function trackedCreate(
  params: ChatCompletionCreateParamsNonStreaming
): Promise<ChatCompletion> {
  const start = Date.now();
  try {
    const response = await getRawClient().chat.completions.create(params);
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

export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.AI_INTEGRATIONS_OPENAI_API_KEY);
}
