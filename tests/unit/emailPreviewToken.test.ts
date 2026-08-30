import { describe, it, expect, afterEach, vi } from "vitest";
import {
  signEmailPayload,
  verifyEmailToken,
  isEmailTokenConfigured,
} from "../../server/emailPreviewToken.js";

// ─── Email relay regression guard ────────────────────────────────────────────
//
// POST /api/email-preview used to take the recipient address AND the message
// body straight off the request, with no authentication, so anyone could make
// the server send arbitrary text to arbitrary people from the site's own
// address. The email body now travels inside a server-signed token and the
// route reads its content out of that token, so unsigned or tampered content
// can never reach an inbox. These tests lock that in.

const VALID = {
  goNoGo: "GO",
  verdictLabel: "Solid deal",
  confidenceLevel: "high",
  missingInfo: [{ field: "otdPrice", question: "What is the out-the-door price?" }],
  detectedFields: { salePrice: 28500 },
  summary: "This quote is close to market.",
};

describe("email preview token", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("when no signing secret is configured", () => {
    it("reports itself unconfigured", () => {
      vi.stubEnv("EMAIL_TOKEN_SECRET", "");
      vi.stubEnv("SESSION_SECRET", "");
      expect(isEmailTokenConfigured()).toBe(false);
    });

    it("refuses to sign", () => {
      vi.stubEnv("EMAIL_TOKEN_SECRET", "");
      vi.stubEnv("SESSION_SECRET", "");
      expect(signEmailPayload(VALID)).toBeNull();
    });

    it("refuses to verify, so nothing can be sent unsigned", () => {
      vi.stubEnv("EMAIL_TOKEN_SECRET", "");
      vi.stubEnv("SESSION_SECRET", "");
      expect(verifyEmailToken("anything.atall")).toBeNull();
    });
  });

  describe("round trip", () => {
    it("recovers exactly what was signed", () => {
      vi.stubEnv("EMAIL_TOKEN_SECRET", "test-secret");
      const token = signEmailPayload(VALID);
      expect(token).toBeTruthy();
      expect(verifyEmailToken(token)).toEqual(VALID);
    });

    it("falls back to SESSION_SECRET when EMAIL_TOKEN_SECRET is absent", () => {
      vi.stubEnv("EMAIL_TOKEN_SECRET", "");
      vi.stubEnv("SESSION_SECRET", "session-secret");
      const token = signEmailPayload(VALID);
      expect(verifyEmailToken(token)).toEqual(VALID);
    });

    it("truncates missingInfo to the three items the email shows", () => {
      vi.stubEnv("EMAIL_TOKEN_SECRET", "test-secret");
      const token = signEmailPayload({
        ...VALID,
        missingInfo: Array.from({ length: 6 }, (_, i) => ({
          field: `f${i}`,
          question: `q${i}`,
        })),
      });
      expect(verifyEmailToken(token)?.missingInfo).toHaveLength(3);
    });

    it("returns null for a payload missing the fields the email needs", () => {
      vi.stubEnv("EMAIL_TOKEN_SECRET", "test-secret");
      expect(signEmailPayload({ summary: "only a summary" })).toBeNull();
    });
  });

  describe("forgery and tampering", () => {
    it("rejects a token that was never signed", () => {
      vi.stubEnv("EMAIL_TOKEN_SECRET", "test-secret");
      const forged = Buffer.from(
        JSON.stringify({ p: VALID, exp: Date.now() + 60_000 }),
        "utf8",
      ).toString("base64url");
      expect(verifyEmailToken(`${forged}.notarealsignature`)).toBeNull();
    });

    it("rejects a token whose body was swapped for attacker text", () => {
      vi.stubEnv("EMAIL_TOKEN_SECRET", "test-secret");
      const token = signEmailPayload(VALID)!;
      const signature = token.slice(token.lastIndexOf(".") + 1);
      const tampered = Buffer.from(
        JSON.stringify({
          p: { ...VALID, summary: "Click here to verify your account" },
          exp: Date.now() + 60_000,
        }),
        "utf8",
      ).toString("base64url");
      expect(verifyEmailToken(`${tampered}.${signature}`)).toBeNull();
    });

    it("rejects a token signed with a different secret", () => {
      vi.stubEnv("EMAIL_TOKEN_SECRET", "secret-one");
      const token = signEmailPayload(VALID);
      vi.stubEnv("EMAIL_TOKEN_SECRET", "secret-two");
      expect(verifyEmailToken(token)).toBeNull();
    });

    it("rejects malformed and non-string tokens", () => {
      vi.stubEnv("EMAIL_TOKEN_SECRET", "test-secret");
      expect(verifyEmailToken("")).toBeNull();
      expect(verifyEmailToken("nodothere")).toBeNull();
      expect(verifyEmailToken(".onlyasignature")).toBeNull();
      expect(verifyEmailToken(undefined)).toBeNull();
      expect(verifyEmailToken({ p: VALID })).toBeNull();
    });

    it("rejects an expired token", () => {
      vi.stubEnv("EMAIL_TOKEN_SECRET", "test-secret");
      const now = Date.now();
      vi.useFakeTimers();
      vi.setSystemTime(now);
      const token = signEmailPayload(VALID);
      vi.setSystemTime(now + 25 * 60 * 60 * 1000);
      expect(verifyEmailToken(token)).toBeNull();
      vi.useRealTimers();
    });
  });
});
