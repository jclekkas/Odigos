import { afterEach, describe, expect, it, vi } from "vitest";

describe("OpenAI bring-your-own-key config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("uses OPENAI_API_KEY when it is set, even if a legacy key is also present", async () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-selfhost-key-1234");
    vi.stubEnv("AI_INTEGRATIONS_OPENAI_API_KEY", "sk-legacy-key-5678");
    vi.resetModules();
    const { getOpenAIRuntimeConfig } = await import("../../server/openaiClient.js");
    const config = getOpenAIRuntimeConfig();
    expect(config.configured).toBe(true);
    expect(config.keySource).toBe("OPENAI_API_KEY");
    expect(config.keySuffix).toBe("1234");
  });

  it("accepts the legacy key only when OPENAI_API_KEY is blank", async () => {
    vi.stubEnv("OPENAI_API_KEY", "   ");
    vi.stubEnv("AI_INTEGRATIONS_OPENAI_API_KEY", "sk-legacy-key-5678");
    vi.resetModules();
    const { getOpenAIRuntimeConfig } = await import("../../server/openaiClient.js");
    expect(getOpenAIRuntimeConfig().keySource).toBe("AI_INTEGRATIONS_OPENAI_API_KEY");
  });

  it("reports no key when neither variable is set", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("AI_INTEGRATIONS_OPENAI_API_KEY", "");
    vi.resetModules();
    const { isOpenAIConfigured } = await import("../../server/openaiClient.js");
    expect(isOpenAIConfigured()).toBe(false);
  });

  it("prefers OPENAI_BASE_URL and OPENAI_MODEL for a local server", async () => {
    vi.stubEnv("OPENAI_BASE_URL", "http://127.0.0.1:11434/v1");
    vi.stubEnv("AI_INTEGRATIONS_OPENAI_BASE_URL", "https://owner.example/v1");
    vi.stubEnv("OPENAI_MODEL", "llama3.1");
    vi.stubEnv("OPENAI_FALLBACK_MODEL", "");
    vi.stubEnv("AI_INTEGRATIONS_OPENAI_FALLBACK_MODEL", "");
    vi.resetModules();
    const client = await import("../../server/openaiClient.js");
    const models = await import("../../server/config/aiModel.js");
    expect(client.getOpenAIRuntimeConfig().baseURL).toBe("http://127.0.0.1:11434/v1");
    expect(client.getOpenAIRuntimeConfig().baseURLSource).toBe("OPENAI_BASE_URL");
    expect(models.AI_PRIMARY_MODEL).toBe("llama3.1");
    expect(models.AI_FALLBACK_MODEL).toBeNull();
  });
});
