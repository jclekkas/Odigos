/**
 * Client-side image compression for upload flows.
 *
 * Why this exists: Vercel serverless functions reject request bodies over
 * ~4.5 MB at the edge (413 Payload Too Large) before the function runs.
 * Modern phone cameras produce 5–15 MB dealer-quote photos, which means
 * every real upload was dying at the Vercel edge with an unparseable HTML
 * error body. Compressing to JPEG on the client before POSTing keeps us
 * safely under the limit while preserving more than enough resolution for
 * the downstream OCR pipeline (gpt-4o vision at ~2048px long edge).
 *
 * Intentionally dependency-free — uses only native browser canvas APIs.
 */

export interface CompressImageOptions {
  /** Maximum allowed output size in bytes. Default 3.5 MB (under Vercel's 4.5 MB hard limit). */
  maxBytes?: number;
  /** Maximum dimension (longer edge) in pixels after resize. Default 2048. */
  maxDimension?: number;
  /** Output mime type. JPEG is smallest and gpt-4o vision supports it well. */
  mimeType?: "image/jpeg" | "image/webp";
}

const DEFAULT_MAX_BYTES = 3_500_000;
const DEFAULT_MAX_DIMENSION = 2048;
const DEFAULT_MIME: "image/jpeg" = "image/jpeg";
const QUALITY_LADDER = [0.85, 0.75, 0.65, 0.5] as const;

const COMPRESSIBLE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

/**
 * Error subclass so callers can distinguish compression failures (e.g. image
 * still too large at minimum quality) from other upload errors and surface
 * an actionable message.
 */
export class ImageCompressionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageCompressionError";
  }
}

/**
 * Compress an image File so that the returned File is at most `maxBytes`.
 *
 * Returns the original file unchanged when:
 *   - the mime type is not a compressible image (e.g. application/pdf)
 *   - the file is already small enough and no resize is needed
 *
 * Throws `ImageCompressionError` only when the image truly cannot be made
 * small enough even at the lowest quality setting — in practice this should
 * never happen for typical phone photos once the `maxDimension` resize has
 * been applied.
 */
export async function compressImageFile(
  file: File,
  opts: CompressImageOptions = {},
): Promise<File> {
  const maxBytes = opts.maxBytes ?? DEFAULT_MAX_BYTES;
  const maxDimension = opts.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const mimeType = opts.mimeType ?? DEFAULT_MIME;

  // Passthrough 1: not a compressible image (PDF, etc.). Let the caller's
  // upstream size check handle this case — we cannot canvas-compress a PDF.
  if (!COMPRESSIBLE_MIME_TYPES.has(file.type)) {
    return file;
  }

  // Passthrough 2: file is already comfortably under the byte ceiling.
  // We still want to check the pixel dimensions in case it's a massive but
  // highly-compressed image (unusual, but possible), so only skip fully
  // when the byte count is well under half the limit.
  if (file.size <= Math.floor(maxBytes / 2)) {
    return file;
  }

  const bitmap = await loadImageBitmap(file);
  try {
    const { width, height } = scaleToFit(bitmap.width, bitmap.height, maxDimension);

    // Draw once at the target dimensions, then try progressively lower
    // quality JPEG encodes until one fits under the byte ceiling. This is
    // much cheaper than re-rasterizing for every quality attempt.
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new ImageCompressionError(
        "Browser could not create a 2D canvas context for image compression.",
      );
    }
    // Fill white so transparent PNGs flatten cleanly to JPEG (no black bg).
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap as CanvasImageSource, 0, 0, width, height);

    for (const quality of QUALITY_LADDER) {
      const blob = await canvasToBlob(canvas, mimeType, quality);
      if (blob && blob.size <= maxBytes) {
        return blobToFile(blob, file.name, mimeType);
      }
    }

    throw new ImageCompressionError(
      "Image is too large to compress under the upload limit. " +
        "Please use a smaller photo or paste the text manually.",
    );
  } finally {
    // Free the decoded bitmap. ImageBitmap has .close(); HTMLImageElement
    // doesn't need explicit cleanup.
    if (typeof (bitmap as ImageBitmap).close === "function") {
      (bitmap as ImageBitmap).close();
    }
  }
}

/** Load a File into an ImageBitmap (preferred) or HTMLImageElement fallback. */
async function loadImageBitmap(
  file: File,
): Promise<ImageBitmap | HTMLImageElement> {
  // createImageBitmap is supported everywhere we care about and avoids the
  // DOM entirely. Fall back to HTMLImageElement if it's somehow missing.
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(file);
  }
  return loadViaImageElement(file);
}

function loadViaImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ImageCompressionError("Could not decode the image for compression."));
    };
    img.src = url;
  });
}

/** Compute resized dimensions preserving aspect ratio. Never upscales. */
function scaleToFit(
  srcWidth: number,
  srcHeight: number,
  maxDimension: number,
): { width: number; height: number } {
  const longest = Math.max(srcWidth, srcHeight);
  if (longest <= maxDimension) {
    return { width: srcWidth, height: srcHeight };
  }
  const scale = maxDimension / longest;
  return {
    width: Math.round(srcWidth * scale),
    height: Math.round(srcHeight * scale),
  };
}

/** Create an OffscreenCanvas when available, otherwise a detached HTMLCanvasElement. */
function createCanvas(width: number, height: number): HTMLCanvasElement | OffscreenCanvas {
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(width, height);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/** Promise-based wrapper around toBlob / convertToBlob that works on both canvas types. */
async function canvasToBlob(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  mimeType: string,
  quality: number,
): Promise<Blob | null> {
  if (typeof OffscreenCanvas !== "undefined" && canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob({ type: mimeType, quality });
  }
  return new Promise((resolve) => {
    (canvas as HTMLCanvasElement).toBlob((b) => resolve(b), mimeType, quality);
  });
}

/**
 * Wrap a Blob in a File, preserving the caller's original filename stem
 * and swapping the extension to match the output mime so the server's
 * multer filter still accepts it.
 */
function blobToFile(blob: Blob, originalName: string, mimeType: string): File {
  const ext = mimeType === "image/webp" ? "webp" : "jpg";
  const stem = originalName.replace(/\.[^.]+$/, "") || "upload";
  return new File([blob], `${stem}.${ext}`, { type: mimeType });
}
