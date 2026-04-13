/**
 * Shared AI model configuration so every call site (analyze, vision
 * text extraction) agrees on which OpenAI model to use. Keeping this in one
 * place means operators can override both via a single env var pair.
 *
 * - AI_PRIMARY_MODEL: the model we prefer. Defaults to gpt-4o.
 * - AI_FALLBACK_MODEL: tried once when the primary returns model_not_found
 *   (e.g. the API key does not have access to gpt-4o). Defaults to gpt-4o-mini
 *   which is broadly available on standard OpenAI plans.
 */
export const AI_PRIMARY_MODEL =
  process.env.OPENAI_MODEL ?? "gpt-4o";

export const AI_FALLBACK_MODEL =
  process.env.OPENAI_FALLBACK_MODEL ?? "gpt-4o-mini";
