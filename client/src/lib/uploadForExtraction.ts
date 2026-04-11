/**
 * Unified upload helper used by the dealer-quote image/PDF ingestion flow.
 *
 * Layered strategy (cheapest path first):
 *   1. Reject files over the per-type hard cap (FileTooLargeError).
 *   2. For compressible images: run compressImageFile() to try to fit the
 *      Vercel serverless body limit (~4.5 MB).  If compression succeeds, go
 *      through the inline /api/extract-text multipart path — no Blob roundtrip.
 *   3. If the (possibly compressed) file is still over the Vercel body limit,
 *      or if compression itself failed, fall back to the Vercel Blob
 *      direct-upload path: browser PUTs straight to Blob storage, then the
 *      server fetches the blob, extracts, and deletes it.
 *
 * Per-type hard caps exist because OpenAI Vision has a ~15 MB binary ceiling
 * for images, while PDFs are parsed locally with pdf-parse and can go higher.
 */
import { tagFlow } from "@/lib/sentry";
import { compressImageFile, ImageCompressionError } from "@/lib/compressImage";

/**
 * Maximum request-body size Vercel's edge will accept before rejecting with
 * 413.  We target this, not 4.5 MB exactly, to leave headroom for multipart
 * framing overhead.
 */
export const VERCEL_SAFE_UPLOAD_BYTES = 3_500_000;

/** Hard ceiling for images — matches OpenAI Vision's binary payload limit. */
export const IMAGE_BLOB_HARD_CAP = 15 * 1024 * 1024;

/** Hard ceiling for PDFs — parsed server-side via pdf-parse, no AI cost. */
export const PDF_BLOB_HARD_CAP = 100 * 1024 * 1024;

const PDF_MIME = "application/pdf";
const COMPRESSIBLE_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export function maxUploadBytesFor(contentType: string): number {
  return contentType === PDF_MIME ? PDF_BLOB_HARD_CAP : IMAGE_BLOB_HARD_CAP;
}

export class FileTooLargeError extends Error {
  constructor(public readonly cap: number, public readonly contentType: string) {
    super("File exceeds maximum upload size");
    this.name = "FileTooLargeError";
  }
}

export class UploadExtractionError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly reason: string,
  ) {
    super(message);
    this.name = "UploadExtractionError";
  }
}

export interface UploadForExtractionResult {
  text: string;
  /** Populated when client-side compression actually shrunk the file. */
  compressed?: {
    originalBytes: number;
    compressedBytes: number;
  };
}

/**
 * Upload a file through the dealer-quote extraction pipeline.
 *
 * Handles compression, inline vs Blob branching, and normalizes all
 * downstream failure modes into typed errors so callers don't need to
 * special-case the individual paths.
 */
export async function uploadFileForExtraction(file: File): Promise<UploadForExtractionResult> {
  const cap = maxUploadBytesFor(file.type);
  if (file.size > cap) {
    throw new FileTooLargeError(cap, file.type);
  }

  // Step 1: squeeze compressible images under Vercel's body limit so we can
  // take the cheap inline path.  PDFs are passthrough — they cannot be
  // canvas-compressed, so we route large ones through Blob instead.
  let uploadFile = file;
  let compressed: UploadForExtractionResult["compressed"];
  if (COMPRESSIBLE_IMAGE_TYPES.has(file.type)) {
    try {
      uploadFile = await compressImageFile(file, { maxBytes: VERCEL_SAFE_UPLOAD_BYTES });
      if (uploadFile !== file) {
        compressed = {
          originalBytes: file.size,
          compressedBytes: uploadFile.size,
        };
      }
    } catch (err) {
      if (err instanceof ImageCompressionError) {
        // Compression couldn't rescue the image — fall back to the Blob path
        // with the original bytes rather than surfacing a failure to the user.
        // The per-type hard cap above already guarantees the raw file is
        // within Blob storage limits.
        uploadFile = file;
      } else {
        throw err;
      }
    }
  }

  // Step 2: inline multipart if the payload fits; otherwise Blob.
  if (uploadFile.size <= VERCEL_SAFE_UPLOAD_BYTES) {
    const text = await postMultipartExtraction(uploadFile);
    return { text, compressed };
  }

  const text = await postBlobExtraction(uploadFile);
  return { text, compressed };
}

/** Inline multipart POST to /api/extract-text with 413-aware error handling. */
async function postMultipartExtraction(uploadFile: File): Promise<string> {
  tagFlow("extract-text", "/api/extract-text");
  const formData = new FormData();
  formData.append("file", uploadFile);
  const response = await fetch("/api/extract-text", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    // 413 responses from Vercel's edge come back as HTML, not JSON.
    // Try JSON first, fall back to a status-aware message so the user sees
    // something actionable instead of "Something went wrong".
    let serverMessage: string | undefined;
    try {
      serverMessage = (await response.clone().json()).message;
    } catch {
      // non-JSON body (HTML error page from the platform) — ignore
    }
    const isPayloadTooLarge = response.status === 413;
    const reason = isPayloadTooLarge
      ? "payload_too_large"
      : serverMessage ?? "server_error";
    const message = isPayloadTooLarge
      ? "That file is too large for upload. Please try a smaller photo or paste the text manually."
      : serverMessage ??
        "We couldn't process that image. Please try again or paste the text manually.";
    throw new UploadExtractionError(message, response.status, reason);
  }
  const data = await response.json().catch(() => ({}));
  return typeof data?.text === "string" ? data.text : "";
}

/**
 * Blob direct-upload path.  Dynamic-imports @vercel/blob/client so the SDK
 * stays out of the initial JS bundle for users who never hit the fallback.
 */
async function postBlobExtraction(uploadFile: File): Promise<string> {
  tagFlow("extract-text-from-blob", "/api/extract-text-from-blob");

  const { upload } = await import("@vercel/blob/client");

  let blobUrl: string;
  try {
    const result = await upload(`dealer-quotes/${uploadFile.name}`, uploadFile, {
      access: "public",
      handleUploadUrl: "/api/blob/upload-token",
      contentType: uploadFile.type,
    });
    blobUrl = result.url;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    throw new UploadExtractionError(
      "Something went wrong uploading that file. Please try again.",
      0,
      `blob_upload_failed:${message.slice(0, 80)}`,
    );
  }

  const extractResponse = await fetch("/api/extract-text-from-blob", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blobUrl, contentType: uploadFile.type }),
  });
  const extractData = await extractResponse.json().catch(() => ({}));
  if (!extractResponse.ok) {
    const message =
      (extractData && typeof extractData.message === "string" && extractData.message) ||
      "We couldn't process that image. Please try again or paste the text manually.";
    throw new UploadExtractionError(
      message,
      extractResponse.status,
      extractData?.message ?? "server_error",
    );
  }
  return typeof extractData?.text === "string" ? extractData.text : "";
}
