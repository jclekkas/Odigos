import OpenAI from "openai";
import type { ChatCompletion, ChatCompletionCreateParamsNonStreaming } from "openai/resources/chat/completions";
import { trackEvent } from "./metrics.js";

/**
 * Thrown when the OpenAI client cannot be constructed because required
 * configuration (API key) is missing. Distinct from transient network or
 * provider errors so callers can surface an actionable, operator-facing
 * message instead of collapsing it into a generic "AI service error".
 */
export class OpenAIConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenAIConfigurationError";
  }
}

/**
 * Resolves the OpenAI API key, preferring the Replit-style
 * AI_INTEGRATIONS_OPENAI_API_KEY var (for backwards compatibility with
 * existing deployments) and falling back to the standard OPENAI_API_KEY
 * var used by most OpenAI tooling. This prevents a very common deployment
 * footgun where operators set OPENAI_API_KEY and see a 503 "not configured"
 * error because the code only looked at the Replit-prefixed name.
 */
function resolveApiKey(): string | undefined {
  return process.env.AI_INTEGRATIONS_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY;
}

function resolveBaseUrl(): string | undefined {
  return process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ?? process.env.OPENAI_BASE_URL;
}

// Lazy-init so the module can be imported even if the API key env var
// is missing. Constructing the OpenAI client with an undefined apiKey throws
// synchronously ("Missing credentials"), which would otherwise crash the whole
// serverless function at cold-start and make /api/health unreachable. Callers
// see an informative error only when they actually invoke the API.
let _rawClient: OpenAI | undefined;

function getRawClient(): OpenAI {
  if (_rawClient) return _rawClient;
  const apiKey = resolveApiKey();
  if (!apiKey) {
    throw new OpenAIConfigurationError(
      "OpenAI API key is not set — AI analysis is unavailable. " +
      "Set AI_INTEGRATIONS_OPENAI_API_KEY (or OPENAI_API_KEY) on the Vercel project and redeploy.",
    );
  }
  _rawClient = new OpenAI({
    apiKey,
    baseURL: resolveBaseUrl(),
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
  return Boolean(resolveApiKey());
}

/**
 * Normalized shape for an OpenAI SDK error. The SDK throws instances of
 * `APIError` with a varying set of fields depending on the failure mode
 * (auth, rate limit, model not found, network, etc.). `parseOpenAIError`
 * collapses the shape into a single deterministic object so callers can
 * log and classify without chasing undefined property paths.
 */
export interface ParsedOpenAIError {
  status?: number;
  code?: string;
  type?: string;
  param?: string;
  requestId?: string;
  retryAfter?: string;
  message: string;
}

/**
 * Extracts structured diagnostic information from any error thrown by the
 * OpenAI SDK. Defensive at every step — returns a best-effort shape even
 * for non-APIError exceptions (e.g. TypeErrors, network errors, our own
 * timeout Promise rejections).
 */
export function parseOpenAIError(err: unknown): ParsedOpenAIError {
  const e = (err ?? {}) as Record<string, unknown>;
  const inner = (e.error ?? {}) as Record<string, unknown>;
  const headers = (e.headers ?? {}) as Record<string, unknown>;

  const status = typeof e.status === "number" ? (e.status as number) : undefined;
  const code =
    (typeof e.code === "string" && e.code) ||
    (typeof inner.code === "string" && inner.code) ||
    undefined;
  const type =
    (typeof e.type === "string" && e.type) ||
    (typeof inner.type === "string" && inner.type) ||
    undefined;
  const param =
    (typeof e.param === "string" && e.param) ||
    (typeof inner.param === "string" && inner.param) ||
    undefined;

  let requestId: string | undefined;
  if (typeof e.request_id === "string") requestId = e.request_id as string;
  else if (typeof e.requestID === "string") requestId = e.requestID as string;
  else if (typeof headers["x-request-id"] === "string") requestId = headers["x-request-id"] as string;

  let retryAfter: string | undefined;
  if (typeof headers["retry-after"] === "string") retryAfter = headers["retry-after"] as string;

  const message =
    err instanceof Error
      ? err.message
      : typeof e.message === "string"
        ? (e.message as string)
        : String(err);

  return { status, code: code || undefined, type: type || undefined, param: param || undefined, requestId, retryAfter, message };
}
