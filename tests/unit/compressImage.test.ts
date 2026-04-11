import { describe, it, expect } from "vitest";
import { compressImageFile, ImageCompressionError } from "../../client/src/lib/compressImage";

// These tests run in the node unit project (no jsdom). That means the full
// canvas path (createImageBitmap / OffscreenCanvas / toBlob) is exercised
// manually in the browser during QA. Here we cover the passthrough branches
// that govern whether the canvas path runs at all — which is where the
// production bug lived (files slipping past the size check without ever
// being re-encoded).

function fakeFile(bytes: number, type: string, name = "test"): File {
  // Build a real Uint8Array-backed Blob so .size reflects the requested bytes.
  const buf = new Uint8Array(bytes);
  return new File([buf], name, { type });
}

describe("compressImageFile", () => {
  it("returns PDFs unchanged (cannot be canvas-compressed)", async () => {
    const pdf = fakeFile(10_000_000, "application/pdf", "quote.pdf");
    const result = await compressImageFile(pdf);
    expect(result).toBe(pdf);
  });

  it("returns unknown mime types unchanged", async () => {
    const bin = fakeFile(5_000_000, "application/octet-stream", "weird.bin");
    const result = await compressImageFile(bin);
    expect(result).toBe(bin);
  });

  it("returns small JPEGs unchanged (below half the byte ceiling)", async () => {
    // 500 KB — comfortably under half of the 3.5 MB default.
    const small = fakeFile(500_000, "image/jpeg", "small.jpg");
    const result = await compressImageFile(small);
    expect(result).toBe(small);
  });

  it("respects a custom maxBytes passthrough threshold", async () => {
    // With maxBytes = 10 MB, a 2 MB file is under half (5 MB) → passthrough.
    const mid = fakeFile(2_000_000, "image/png", "mid.png");
    const result = await compressImageFile(mid, { maxBytes: 10_000_000 });
    expect(result).toBe(mid);
  });

  it("ImageCompressionError has the expected name", () => {
    // Defensive: callers rely on instanceof for error classification.
    const err = new ImageCompressionError("boom");
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("ImageCompressionError");
    expect(err.message).toBe("boom");
  });
});
