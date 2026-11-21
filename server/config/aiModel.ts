/**
 * Shared model names for every OpenAI-compatible call.
 *
 * OPENAI_MODEL is the self-host name (Ollama, LM Studio, OpenAI, or any
 * other server that speaks the Chat Completions API). The older
 * AI_INTEGRATIONS_OPENAI_MODEL name is used only when OPENAI_MODEL is blank.
 *
 * The fallback model defaults to gpt-4o-mini on the official OpenAI host.
 * A custom OPENAI_BASE_URL does not get that default, because a local server
 * will not have gpt-4o-mini unless the operator names it.
 */
function nonBlank(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

export const AI_PRIMARY_MODEL =
  nonBlank("OPENAI_MODEL") ?? nonBlank("AI_INTEGRATIONS_OPENAI_MODEL") ?? "gpt-4o";

function resolveFallbackModel(): string | null {
  const explicit =
    nonBlank("OPENAI_FALLBACK_MODEL") ?? nonBlank("AI_INTEGRATIONS_OPENAI_FALLBACK_MODEL");
  if (explicit) return explicit;
  const base = nonBlank("OPENAI_BASE_URL") ?? nonBlank("AI_INTEGRATIONS_OPENAI_BASE_URL");
  if (base && !/api\.openai\.com/i.test(base)) return null;
  return "gpt-4o-mini";
}

export const AI_FALLBACK_MODEL: string | null = resolveFallbackModel();
