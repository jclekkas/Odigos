import { describe, it, expect, afterEach, vi } from "vitest";
import { isAllowedCorsOrigin } from "../../server/corsOrigin";

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
    it("allows http://localhost without a port", () => {
      expect(isAllowedCorsOrigin("http://localhost")).toBe(true);
    });

    it("allows http://localhost:5000", () => {
      expect(isAllowedCorsOrigin("http://localhost:5000")).toBe(true);
    });

    it("allows http://localhost:3000", () => {
      expect(isAllowedCorsOrigin("http://localhost:3000")).toBe(true);
    });
  });

  describe("Vercel preview deployments", () => {
    it("allows *.vercel.app", () => {
      expect(
        isAllowedCorsOrigin("https://odigos-git-feature-branch.vercel.app"),
      ).toBe(true);
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
