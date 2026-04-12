import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";
import express from "express";
import { createServer } from "http";
import request from "supertest";

// ─── Module mocks ───────────────────────────────────────────────────────────
// Mock @vercel/blob (server `del`) and @vercel/blob/client (`handleUpload`)
// so tests never touch the network or need a real BLOB_READ_WRITE_TOKEN.

vi.mock("@vercel/blob", () => ({
  del: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@vercel/blob/client", () => ({
  handleUpload: vi.fn(async ({ onBeforeGenerateToken }: any) => {
    // Exercise the route's onBeforeGenerateToken so its allowlist/caps are
    // observable from the test.
    const options = await onBeforeGenerateToken("dealer-quotes/test.png", null, false);
    return {
      type: "blob.generate-client-token",
      clientToken: "mock-client-token",
      _debugOptions: options,
    };
  }),
}));

vi.mock("../../server/openaiClient", () => ({
  openai: {
    chat: { completions: { create: vi.fn() } },
  },
}));

vi.mock("../../server/metrics", () => ({
  trackEvent: vi.fn(),
  getMetricsSummary: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../server/ingestor", () => ({
  enqueueSubmission: vi.fn(),
}));

vi.mock("../../server/stripeClient", () => ({
  isStripeConfigured: vi.fn().mockResolvedValue(false),
  getStripeClient: vi.fn(),
}));

vi.mock("../../server/extractText", () => {
  class IrrelevantContentError extends Error {
    constructor(
      public readonly rejectionReason: string,
      public readonly documentType: string,
    ) {
      super(rejectionReason);
      this.name = "IrrelevantContentError";
    }
  }
  return {
    extractTextFromFile: vi.fn(),
    IrrelevantContentError,
  };
});

vi.mock("../../server/db", () => ({
  db: {
    execute: vi.fn().mockResolvedValue({ rows: [] }),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: "mock-submission-id" }]),
    onConflictDoNothing: vi.fn().mockResolvedValue([]),
  },
}));

import { del } from "@vercel/blob";
import { handleUpload } from "@vercel/blob/client";
import { extractTextFromFile } from "../../server/extractText";
import { registerRoutes } from "../../server/routes";

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeStreamResponse(chunks: Uint8Array[], ok = true): Response {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });
  // Casting: supertest/vitest runs on Node where global `Response` is the
  // undici Response, which accepts a ReadableStream as body.
  return new Response(stream, { status: ok ? 200 : 500 }) as unknown as Response;
}

function bytes(n: number): Uint8Array {
  return new Uint8Array(n);
}

const VALID_BLOB_URL = "https://mocksite.public.blob.vercel-storage.com/dealer-quotes/test-abc123.png";

// ─── Test harness ───────────────────────────────────────────────────────────

let app: express.Express;
let server: ReturnType<typeof createServer>;

beforeAll(async () => {
  app = express();
  app.use(express.json());
  server = createServer(app);
  await registerRoutes(app);
});

afterAll(() => {
  server.close();
});

beforeEach(() => {
  vi.mocked(extractTextFromFile).mockReset();
  vi.mocked(del).mockClear();
  vi.mocked(handleUpload).mockClear();
});

// ─── POST /api/extract-text-from-blob ───────────────────────────────────────

describe("POST /api/extract-text-from-blob", () => {
  it("rejects non-Vercel-Blob hostnames (SSRF guard)", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const res = await request(app)
      .post("/api/extract-text-from-blob")
      .send({ blobUrl: "https://evil.example.com/x.png", contentType: "image/png" });

    expect(res.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(extractTextFromFile).not.toHaveBeenCalled();
    expect(del).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });

  it("rejects non-HTTPS blob URLs", async () => {
    const res = await request(app)
      .post("/api/extract-text-from-blob")
      .send({
        blobUrl: "http://mocksite.public.blob.vercel-storage.com/dealer-quotes/x.png",
        contentType: "image/png",
      });
    expect(res.status).toBe(400);
  });

  it("rejects disallowed content types", async () => {
    const res = await request(app)
      .post("/api/extract-text-from-blob")
      .send({ blobUrl: VALID_BLOB_URL, contentType: "text/plain" });
    expect(res.status).toBe(400);
  });

  it("returns extracted text for a valid image blob and deletes the blob", async () => {
    vi.mocked(extractTextFromFile).mockResolvedValueOnce(
      "OTD price $35,000. APR 4.9%. 60 months financing.",
    );
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(makeStreamResponse([bytes(1024)]));

    const res = await request(app)
      .post("/api/extract-text-from-blob")
      .send({ blobUrl: VALID_BLOB_URL, contentType: "image/png" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("text");
    expect(res.body.text).toContain("OTD price");
    expect(extractTextFromFile).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledWith(VALID_BLOB_URL);

    fetchSpy.mockRestore();
  });

  it("returns 413 when streamed bytes exceed the image cap (15 MB)", async () => {
    const OVER_IMAGE_CAP = 16 * 1024 * 1024;
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(makeStreamResponse([bytes(OVER_IMAGE_CAP)]));

    const res = await request(app)
      .post("/api/extract-text-from-blob")
      .send({ blobUrl: VALID_BLOB_URL, contentType: "image/jpeg" });

    expect(res.status).toBe(413);
    expect(extractTextFromFile).not.toHaveBeenCalled();
    // Cleanup still runs even though extraction never started.
    expect(del).toHaveBeenCalledTimes(1);

    fetchSpy.mockRestore();
  });

  it("accepts a PDF blob between the image cap and the PDF cap (per-type cap branching)", async () => {
    const OVER_IMAGE_CAP_UNDER_PDF_CAP = 16 * 1024 * 1024;
    vi.mocked(extractTextFromFile).mockResolvedValueOnce(
      "Sale price $28,000. Documentation fee $199.",
    );
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(makeStreamResponse([bytes(OVER_IMAGE_CAP_UNDER_PDF_CAP)]));

    const res = await request(app)
      .post("/api/extract-text-from-blob")
      .send({ blobUrl: VALID_BLOB_URL, contentType: "application/pdf" });

    expect(res.status).toBe(200);
    expect(extractTextFromFile).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledTimes(1);

    fetchSpy.mockRestore();
  });

  it("returns 422 when the extractor throws and still deletes the blob", async () => {
    vi.mocked(extractTextFromFile).mockRejectedValueOnce(new Error("OCR failed"));
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(makeStreamResponse([bytes(512)]));

    const res = await request(app)
      .post("/api/extract-text-from-blob")
      .send({ blobUrl: VALID_BLOB_URL, contentType: "image/png" });

    expect(res.status).toBe(422);
    expect(del).toHaveBeenCalledTimes(1);

    fetchSpy.mockRestore();
  });

  it("returns 422 when extracted text is too short (<20 chars)", async () => {
    vi.mocked(extractTextFromFile).mockResolvedValueOnce("hi");
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(makeStreamResponse([bytes(512)]));

    const res = await request(app)
      .post("/api/extract-text-from-blob")
      .send({ blobUrl: VALID_BLOB_URL, contentType: "image/png" });

    expect(res.status).toBe(422);
    expect(res.body.message).toMatch(/couldn't read/i);
    expect(del).toHaveBeenCalledTimes(1);

    fetchSpy.mockRestore();
  });

  it("returns 502 when the blob fetch returns non-ok status", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("nope", { status: 404 }) as unknown as Response);

    const res = await request(app)
      .post("/api/extract-text-from-blob")
      .send({ blobUrl: VALID_BLOB_URL, contentType: "image/png" });

    expect(res.status).toBe(502);
    expect(extractTextFromFile).not.toHaveBeenCalled();
    expect(del).toHaveBeenCalledTimes(1);

    fetchSpy.mockRestore();
  });
});

// ─── POST /api/blob/upload-token ────────────────────────────────────────────

describe("POST /api/blob/upload-token", () => {
  it("delegates to handleUpload with the allowlist and PDF cap", async () => {
    const res = await request(app)
      .post("/api/blob/upload-token")
      .send({
        type: "blob.generate-client-token",
        payload: {
          pathname: "dealer-quotes/quote.pdf",
          callbackUrl: "https://example.com/api/blob/upload-token",
          multipart: false,
          clientPayload: null,
        },
      });

    expect(res.status).toBe(200);
    expect(handleUpload).toHaveBeenCalledTimes(1);

    // The mocked handleUpload calls onBeforeGenerateToken and surfaces the
    // returned options under `_debugOptions` so we can assert on them.
    expect(res.body._debugOptions).toBeDefined();
    expect(res.body._debugOptions.allowedContentTypes).toEqual([
      "image/png",
      "image/jpeg",
      "image/webp",
      "application/pdf",
    ]);
    expect(res.body._debugOptions.maximumSizeInBytes).toBe(100 * 1024 * 1024);
    expect(res.body._debugOptions.addRandomSuffix).toBe(true);
    expect(typeof res.body._debugOptions.validUntil).toBe("number");
  });
});
