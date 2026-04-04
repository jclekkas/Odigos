import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../server/db", () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 1 }]),
      }),
    }),
  },
}));

vi.mock("../../server/storage", () => ({
  insertAuditLog: vi.fn().mockResolvedValue({ id: 1 }),
}));

import {
  sha256Hex,
  getRequestIp,
  hashRequestContext,
  redactAuditMeta,
  writeAuditEvent,
} from "../../server/audit";
import { insertAuditLog } from "../../server/storage";

const mockInsertAuditLog = insertAuditLog as ReturnType<typeof vi.fn>;

function makeReq(overrides: Record<string, unknown> = {}) {
  return {
    headers: {} as Record<string, string | string[] | undefined>,
    ip: "127.0.0.1",
    socket: { remoteAddress: "127.0.0.1" },
    ...overrides,
  } as Pick<import("express").Request, "headers" | "ip" | "socket">;
}

// ─── sha256Hex ───────────────────────────────────────────────────────────────

describe("sha256Hex", () => {
  it("produces a consistent hash for the same input", () => {
    const hash1 = sha256Hex("hello");
    const hash2 = sha256Hex("hello");
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // 256 bits = 64 hex chars
  });

  it("produces different hashes for different inputs", () => {
    expect(sha256Hex("a")).not.toBe(sha256Hex("b"));
  });
});

// ─── getRequestIp ────────────────────────────────────────────────────────────

describe("getRequestIp", () => {
  it("extracts the first IP from x-forwarded-for header", () => {
    const req = makeReq({
      headers: { "x-forwarded-for": "10.0.0.1, 192.168.1.1" },
    });
    expect(getRequestIp(req)).toBe("10.0.0.1");
  });

  it("falls back to req.ip when x-forwarded-for is absent", () => {
    const req = makeReq({ ip: "192.168.0.42" });
    expect(getRequestIp(req)).toBe("192.168.0.42");
  });

  it("falls back to socket.remoteAddress when ip is falsy", () => {
    const req = makeReq({
      ip: undefined,
      socket: { remoteAddress: "10.10.10.10" },
    });
    expect(getRequestIp(req)).toBe("10.10.10.10");
  });

  it('returns "unknown" when nothing is available', () => {
    const req = makeReq({
      ip: undefined,
      socket: { remoteAddress: undefined },
    });
    expect(getRequestIp(req)).toBe("unknown");
  });
});

// ─── hashRequestContext ──────────────────────────────────────────────────────

describe("hashRequestContext", () => {
  it("returns ipHash and userAgentHash as hex strings", () => {
    const req = makeReq({
      headers: { "user-agent": "TestAgent/1.0" },
      ip: "1.2.3.4",
    });
    const result = hashRequestContext(req);
    expect(result).toHaveProperty("ipHash");
    expect(result).toHaveProperty("userAgentHash");
    expect(result.ipHash).toHaveLength(64);
    expect(result.userAgentHash).toHaveLength(64);
    expect(result.ipHash).toBe(sha256Hex("1.2.3.4"));
    expect(result.userAgentHash).toBe(sha256Hex("TestAgent/1.0"));
  });

  it('uses "unknown" for missing user-agent', () => {
    const req = makeReq({ headers: {} });
    const result = hashRequestContext(req);
    expect(result.userAgentHash).toBe(sha256Hex("unknown"));
  });
});

// ─── redactAuditMeta ─────────────────────────────────────────────────────────

describe("redactAuditMeta", () => {
  it("removes sensitive keys", () => {
    const meta = {
      rawText: "secret",
      submittedText: "secret",
      text: "secret",
      fileText: "secret",
      email: "user@example.com",
      phone: "555-1234",
      address: "123 Main St",
      name: "John Doe",
      route: "/api/test",
    };
    const result = redactAuditMeta(meta);
    expect(result).not.toHaveProperty("rawText");
    expect(result).not.toHaveProperty("submittedText");
    expect(result).not.toHaveProperty("text");
    expect(result).not.toHaveProperty("fileText");
    expect(result).not.toHaveProperty("email");
    expect(result).not.toHaveProperty("phone");
    expect(result).not.toHaveProperty("address");
    expect(result).not.toHaveProperty("name");
  });

  it("preserves non-sensitive keys", () => {
    const meta = { route: "/api/test", statusCode: 200, provider: "stripe" };
    const result = redactAuditMeta(meta);
    expect(result).toEqual(meta);
  });

  it("does not mutate the original object", () => {
    const meta = { rawText: "secret", route: "/api/test" };
    redactAuditMeta(meta);
    expect(meta).toHaveProperty("rawText");
  });
});

// ─── writeAuditEvent ─────────────────────────────────────────────────────────

describe("writeAuditEvent", () => {
  beforeEach(() => {
    mockInsertAuditLog.mockClear();
  });

  it("calls insertAuditLog with correct params", async () => {
    const req = makeReq({
      headers: { "user-agent": "TestBot/1.0" },
      ip: "8.8.8.8",
    });
    await writeAuditEvent(req, "payment", "success", {
      route: "/api/stripe-webhook",
      statusCode: 200,
    });

    expect(mockInsertAuditLog).toHaveBeenCalledTimes(1);
    const arg = mockInsertAuditLog.mock.calls[0][0];
    expect(arg.eventType).toBe("payment");
    expect(arg.outcome).toBe("success");
    expect(arg.ipHash).toBe(sha256Hex("8.8.8.8"));
    expect(arg.userAgentHash).toBe(sha256Hex("TestBot/1.0"));
    expect(arg.meta).toEqual({ route: "/api/stripe-webhook", statusCode: 200 });
  });

  it("redacts sensitive fields from meta before writing", async () => {
    const req = makeReq({ ip: "1.1.1.1" });
    await writeAuditEvent(req, "analyze", "success", {
      route: "/api/analyze",
      rawText: "SHOULD_NOT_PERSIST",
    });

    const arg = mockInsertAuditLog.mock.calls[0][0];
    expect(arg.meta).not.toHaveProperty("rawText");
    expect(arg.meta.route).toBe("/api/analyze");
  });

  it("does not throw when insertAuditLog rejects", async () => {
    mockInsertAuditLog.mockRejectedValueOnce(new Error("DB down"));
    const req = makeReq({ ip: "1.1.1.1" });
    await expect(
      writeAuditEvent(req, "payment", "failure", { route: "/test" }),
    ).resolves.toBeUndefined();
  });
});
