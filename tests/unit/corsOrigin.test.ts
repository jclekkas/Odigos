import { describe, it, expect, afterEach, vi } from "vitest";
import { isAllowedCorsOrigin } from "../../server/corsOrigin.js";

// ─── CORS origin allowlist regression guard ──────────────────────────────────
//
// A production outage happened because the CORS allowlist included
// https://odigosauto.com but not https://www.odigosauto.com, so visitors on
// the www subdomain had every POST /api/analyze and POST /api/checkout
// rejected with a 500 "Not allowed by CORS". These tests lock in both
// domains and the surrounding allowlist so the bug can't come back.

describe("isAllowedCorsOrigin", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("production domains", () => {
    it("allows https://odigosauto.com", () => {
      expect(isAllowedCorsOrigin("https://odigosauto.com")).toBe(true);
    });

    it("allows https://www.odigosauto.com (regression guard)", () => {
      expect(isAllowedCorsOrigin("https://www.odigosauto.com")).toBe(true);
    });
  });

  describe("same-origin and server-to-server", () => {
    it("allows requests with no Origin header", () => {
      expect(isAllowedCorsOrigin(undefined)).toBe(true);
    });
  });

  describe("localhost development", () => {
    it("allows http://localhost without a port outside production", () => {
      vi.stubEnv("NODE_ENV", "development");
      expect(isAllowedCorsOrigin("http://localhost")).toBe(true);
    });

    it("allows http://localhost:5000 outside production", () => {
      vi.stubEnv("NODE_ENV", "development");
      expect(isAllowedCorsOrigin("http://localhost:5000")).toBe(true);
    });

    it("allows http://localhost:3000 outside production", () => {
      vi.stubEnv("NODE_ENV", "development");
      expect(isAllowedCorsOrigin("http://localhost:3000")).toBe(true);
    });

    it("blocks localhost in production", () => {
      vi.stubEnv("NODE_ENV", "production");
      expect(isAllowedCorsOrigin("http://localhost:5000")).toBe(false);
    });
  });

  describe("Vercel preview deployments", () => {
    it("allows this project's own preview deployments", () => {
      expect(
        isAllowedCorsOrigin("https://odigos-git-feature-branch.vercel.app"),
      ).toBe(true);
    });

    // The old rule was /\.vercel\.app$/, which matched every deployment on
    // Vercel's shared preview domain. Anyone can create a free account there,
    // so with credentials:true on the cors() middleware that allowlist was
    // effectively open. These lock the narrowed rule in place.
    it("blocks an unrelated project's vercel.app deployment", () => {
      expect(isAllowedCorsOrigin("https://evil-project.vercel.app")).toBe(false);
    });

    it("blocks a bare vercel.app origin", () => {
      expect(isAllowedCorsOrigin("https://vercel.app")).toBe(false);
    });

    it("blocks a look-alike that only ends with the project prefix", () => {
      expect(isAllowedCorsOrigin("https://notodigos-abc.vercel.app")).toBe(false);
    });

    it("blocks plain http preview origins", () => {
      expect(isAllowedCorsOrigin("http://odigos-git-branch.vercel.app")).toBe(false);
    });
  });

  describe("Replit dev domains", () => {
    it("allows *.replit.dev when NODE_ENV is not production", () => {
      vi.stubEnv("NODE_ENV", "development");
      expect(isAllowedCorsOrigin("https://abc-123.replit.dev")).toBe(true);
    });

    it("blocks *.replit.dev in production", () => {
      vi.stubEnv("NODE_ENV", "production");
      expect(isAllowedCorsOrigin("https://abc-123.replit.dev")).toBe(false);
    });
  });

  describe("disallowed origins", () => {
    it("blocks unrelated origins", () => {
      expect(isAllowedCorsOrigin("https://evil.com")).toBe(false);
    });

    it("blocks look-alike subdomain attacks", () => {
      expect(isAllowedCorsOrigin("https://odigosauto.com.evil.com")).toBe(
        false,
      );
    });

    it("blocks http (non-https) version of the production domain", () => {
      expect(isAllowedCorsOrigin("http://odigosauto.com")).toBe(false);
    });

    it("blocks http (non-https) version of the www domain", () => {
      expect(isAllowedCorsOrigin("http://www.odigosauto.com")).toBe(false);
    });

    it("blocks odigosauto.com on a non-standard port", () => {
      expect(isAllowedCorsOrigin("https://odigosauto.com:8443")).toBe(false);
    });
  });
});
