/**
 * Unified upload helper used by the dealer-quote image/PDF ingestion flow.
 *
 * Files at or below INLINE_UPLOAD_LIMIT go through the direct multipart path
 * (POST /api/extract-text), which is what the app has always done.  Files
 * larger than that but within the per-type hard caps use Vercel Blob client
 * uploads: the browser PUTs directly to Blob storage, then the server fetches
 * the blob, runs the same extractor, and deletes the blob.  This bypasses the
 * Vercel serverless function body size limit (~4.5 MB) for large documents.
 *
 * Per-type caps exist because OpenAI Vision has a ~15 MB binary limit for
 * images, but PDFs are parsed locally with pdf-parse and can go higher.
 */
import { tagFlow } from "@/lib/sentry";

export const INLINE_UPLOAD_LIMIT = 20 * 1024 * 1024;
export const IMAGE_BLOB_HARD_CAP = 15 * 1024 * 1024;
export const PDF_BLOB_HARD_CAP = 100 * 1024 * 1024;

const PDF_MIME = "application/pdf";

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

/**
 * Upload a file through the dealer-quote extraction pipeline.
 *
 * Returns `{ text }` with the extracted text on success.  Throws
 * `FileTooLargeError` if the file exceeds its per-type hard cap, or
 * `UploadExtractionError` on a server-side failure (the thrown error has the
 * same shape as the old inline path used to produce so callers don't need to
 * special-case the two branches).
 */
export async function uploadFileForExtraction(file: File): Promise<{ text: string }> {
  const cap = maxUploadBytesFor(file.type);
  if (file.size > cap) {
    throw new FileTooLargeError(cap, file.type);
  }

  if (file.size <= INLINE_UPLOAD_LIMIT) {
    tagFlow("extract-text", "/api/extract-text");
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/extract-text", {
      method: "POST",
      body: formData,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message =
        (data && typeof data.message === "string" && data.message) ||
        "We couldn't process that image. Please try again or paste the text manually.";
      throw new UploadExtractionError(message, response.status, data?.message ?? "server_error");
    }
    return { text: typeof data?.text === "string" ? data.text : "" };
  }

  // Large-file path: direct browser → Vercel Blob, then ask the server to
  // fetch it, extract text, and delete the blob.
  tagFlow("extract-text-from-blob", "/api/extract-text-from-blob");

  // Dynamic import keeps @vercel/blob out of the initial bundle — only users
  // uploading >20 MB files pay the download cost.
  const { upload } = await import("@vercel/blob/client");

  let blobUrl: string;
  try {
    const result = await upload(`dealer-quotes/${file.name}`, file, {
      access: "public",
      handleUploadUrl: "/api/blob/upload-token",
      contentType: file.type,
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
    body: JSON.stringify({ blobUrl, contentType: file.type }),
  });
  const extractData = await extractResponse.json().catch(() => ({}));
  if (!extractResponse.ok) {
    const message =
      (extractData && typeof extractData.message === "string" && extractData.message) ||
      "We couldn't process that image. Please try again or paste the text manually.";
    throw new UploadExtractionError(message, extractResponse.status, extractData?.message ?? "server_error");
  }
  return { text: typeof extractData?.text === "string" ? extractData.text : "" };
}
