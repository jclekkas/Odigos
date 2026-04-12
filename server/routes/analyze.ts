import * as Sentry from "@sentry/node";
import type { Express, Request, Response } from "express";
import multer from "multer";
import { z } from "zod";
import { del } from "@vercel/blob";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { analysisRequestSchema } from "../../shared/schema.js";
import { trackEvent } from "../events.js";
import { extractTextFromFile, extractTextFromUrl, IrrelevantContentError } from "../extractText.js";
import { storage } from "../storage.js";
import { writeAuditEvent } from "../audit.js";
import { runAnalysis, AnalyzeServiceError } from "../services/analyzeService.js";
import {
  isOpenAIConfigured,
  OpenAIConfigurationError,
  parseOpenAIError,
} from "../openaiClient.js";
import { CircuitOpenError } from "../lib/circuitBreaker.js";
import { AI_PRIMARY_MODEL } from "../config/aiModel.js";
import { logger } from "../logger.js";

// OpenAI base URL configured via AI_INTEGRATIONS_OPENAI_BASE_URL env var

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"] as const;
const ALLOWED_MIME_SET: readonly string[] = ALLOWED_MIME_TYPES;
const SHORT_TEXT_MSG = "We couldn't read enough text from that file. Try pasting the text or uploading a clearer image.";

// Per-type ceilings for the Vercel Blob escape hatch.  Images are bounded by
// OpenAI Vision's binary payload limit (~15 MB); PDFs run through pdf-parse
// locally so they can go higher.
const IMAGE_BLOB_CAP = 15 * 1024 * 1024;
const PDF_BLOB_CAP = 100 * 1024 * 1024;
const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";
const BLOB_PATH_PREFIX = "dealer-quotes/";
const BLOB_FETCH_TIMEOUT_MS = 25_000;

function runUploadMiddleware(req: Request, res: Response): Promise<void> {
  return new Promise((resolve, reject) => {
    upload.single("file")(req, res, (err) => (err ? reject(err) : resolve()));
  });
}

export function registerAnalyzeRoutes(app: Express): void {
  app.post("/api/analyze", async (req, res) => {
    const parseResult = analysisRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid request", details: parseResult.error.flatten() });
    }
    try {
      const result = await runAnalysis(parseResult.data);
      res.json(result.payload);
      writeAuditEvent(req, "analyze", "success", {
        route: req.originalUrl, method: req.method, statusCode: 200,
        submissionId: result.listingId ?? null, stateCode: result.stateCode ?? null,
        hasPdf: Boolean(req.file),
      }).catch(err => console.error("[audit] analyze success write failed:", err));
    } catch (error) {
      if (error instanceof AnalyzeServiceError) {
        writeAuditEvent(req, "analyze", "failure", {
          route: req.originalUrl, method: req.method, statusCode: error.statusCode,
        }).catch(err => console.error("[audit] analyze failure write failed:", err));
        return res.status(error.statusCode).json(error.body);
      }
      console.error("Analysis error:", error);
      await writeAuditEvent(req, "analyze", "failure", {
        route: req.originalUrl, method: req.method, statusCode: 500,
        errorClass: error instanceof Error ? error.name : "UnknownError",
      });
      Sentry.withScope((scope) => {
        scope.setTag("feature", "analyze");
        scope.setTag("route", "/api/analyze");
        scope.setTag("error_type", error instanceof Error ? error.constructor.name : "unknown");
        Sentry.captureException(error);
      });
      let userMessage = "An unexpected error occurred. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("timeout") || error.message.includes("ETIMEDOUT")) userMessage = "Request timed out. Please try again.";
        else if (error.message.includes("rate limit")) userMessage = "Too many requests. Please wait a moment and try again.";
      }
      res.status(500).json({ error: "Failed to analyze deal", message: userMessage });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    try {
      const feedbackSchema = z.object({
        listingId: z.string().min(1),
        rating: z.boolean(),
        comment: z.string().trim().max(500).optional().transform((v) => (v === "" ? undefined : v)),
        // Enhanced feedback fields
        userPaidAmountFinal: z.number().positive().optional(),
        docFeeRemoved: z.boolean().optional(),
        addOnsRemoved: z.array(z.string()).optional(),
        overpaymentEstimateFeltAccurate: z.boolean().optional(),
      });
      const parseResult = feedbackSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid request", details: parseResult.error.flatten() });
      }
      const { listingId, rating, comment, userPaidAmountFinal, docFeeRemoved, addOnsRemoved, overpaymentEstimateFeltAccurate } = parseResult.data;
      await storage.createDealFeedback({
        listingId,
        rating,
        comment: comment ?? null,
        userPaidAmountFinal: userPaidAmountFinal != null ? String(userPaidAmountFinal) : null,
        docFeeRemoved: docFeeRemoved ?? null,
        addOnsRemoved: addOnsRemoved ?? null,
        overpaymentEstimateFeltAccurate: overpaymentEstimateFeltAccurate ?? null,
      });
      return res.json({ ok: true });
    } catch (error) {
      console.error("[feedback] POST /api/feedback error:", error);
      return res.status(500).json({ error: "Failed to save feedback" });
    }
  });

  app.patch("/api/feedback/:listingId/outcome", async (req, res) => {
    try {
      const outcomeSchema = z.object({
        finalPaidAmount: z.number().positive().optional(),
        feesRemoved: z.boolean().optional(),
        outcomeStatus: z
          .enum(["bought_as_is", "negotiated_down", "walked_away", "still_negotiating"])
          .optional(),
      });
      const parseResult = outcomeSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid request", details: parseResult.error.flatten() });
      }
      const { listingId } = req.params;
      if (!listingId) {
        return res.status(400).json({ error: "Missing listingId" });
      }
      const data = parseResult.data;
      // At least one outcome field must be provided
      if (data.finalPaidAmount == null && data.feesRemoved == null && data.outcomeStatus == null) {
        return res.status(400).json({ error: "At least one outcome field is required" });
      }
      await storage.updateFeedbackOutcome(listingId, {
        finalPaidAmount: data.finalPaidAmount != null ? String(data.finalPaidAmount) : undefined,
        feesRemoved: data.feesRemoved,
        outcomeStatus: data.outcomeStatus,
        followUpCompletedAt: new Date(),
      });
      return res.json({ ok: true });
    } catch (error) {
      console.error("[feedback] PATCH /api/feedback/:listingId/outcome error:", error);
      return res.status(500).json({ error: "Failed to save feedback outcome" });
    }
  });

  app.post("/api/extract-text", async (req, res) => {
    try {
      await runUploadMiddleware(req, res);
    } catch (err: unknown) {
      const multerErr = err as { code?: string };
      const reason = multerErr?.code === "LIMIT_FILE_SIZE" ? "file_too_large" : "upload_error";
      trackEvent("file_processing", { fileSuccess: false, fileFailReason: reason });
      return res.status(400).json({
        message: multerErr?.code === "LIMIT_FILE_SIZE"
          ? "That file is too large to process. Please use a file under 10 MB."
          : "Something went wrong processing the file.",
      });
    }
    try {
      if (!req.file) {
        trackEvent("file_processing", { fileSuccess: false, fileFailReason: "no_file" });
        return res.status(400).json({ message: "No file uploaded." });
      }
      const { mimetype, buffer } = req.file;
      if (!ALLOWED_MIME_SET.includes(mimetype)) {
        trackEvent("file_processing", { fileSuccess: false, fileFailReason: "unsupported_mime_type" });
        return res.status(400).json({ message: "That file type isn't supported." });
      }

      // Pre-flight: fail fast with an actionable message if the AI service
      // is not configured at all. Without this, a missing API key bubbles
      // up from the OpenAI vision call and gets masked as the misleading
      // "couldn't read enough text" error — giving operators zero signal
      // that the real problem is a missing OPENAI_API_KEY env var.
      //
      // Only relevant for image uploads — PDF parsing is purely local
      // and does not hit OpenAI.
      if (mimetype !== "application/pdf" && !isOpenAIConfigured()) {
        logger.error("extract-text called but AI service is not configured", { source: "extract-text" });
        trackEvent("file_processing", { fileSuccess: false, fileFailReason: "ai_not_configured" });
        return res.status(503).json({
          error: "AI service not configured",
          message:
            "The AI analysis service is not configured on this deployment. " +
            "Ask the operator to set AI_INTEGRATIONS_OPENAI_API_KEY (or OPENAI_API_KEY) and redeploy.",
        });
      }

      let text: string;
      try {
        text = await extractTextFromFile(buffer, mimetype);
      } catch (err) {
        // ── Error classification ──────────────────────────────────────
        // Distinguish real OCR-short-text from OpenAI failures, PDF
        // parse failures, config issues, etc. Before this block existed,
        // every failure mode was collapsed into the same misleading 422
        // "couldn't read enough text" message, which blamed the user's
        // photo for a missing API key / auth failure / rate limit.
        console.error("Text extraction error:", err);

        // PDF-specific errors from extractTextFromFile keep the 422
        // "short text" surface — they are genuinely about the file,
        // not the AI provider.
        if (err instanceof IrrelevantContentError) {
          trackEvent("file_processing", {
            fileSuccess: false,
            fileFailReason: "content_not_relevant",
            documentType: err.documentType,
          });
          return res.status(422).json({
            error: "content_not_relevant",
            message: err.rejectionReason,
            documentType: err.documentType,
          });
        }

        const errMessage = err instanceof Error ? err.message : String(err);
        if (
          errMessage === "Could not parse PDF file" ||
          errMessage === "PDF contained insufficient extractable text"
        ) {
          trackEvent("file_processing", { fileSuccess: false, fileFailReason: "pdf_short" });
          return res.status(422).json({ message: SHORT_TEXT_MSG });
        }

        // Everything below is an error from the OpenAI vision call.
        // Normalize once and classify.
        const parsed = parseOpenAIError(err);

        if (err instanceof CircuitOpenError) {
          logger.error("extract-text: AI circuit breaker is OPEN", { source: "extract-text" });
          Sentry.captureException(err, { level: "error" });
          trackEvent("file_processing", { fileSuccess: false, fileFailReason: "circuit_open" });
          return res.status(503).json({
            error: "Service temporarily unavailable",
            message: "The text-extraction service is temporarily unavailable. Please try again in a moment.",
          });
        }
        if (err instanceof OpenAIConfigurationError) {
          logger.error("extract-text: AI client configuration error", { source: "extract-text", openai: parsed });
          Sentry.captureException(err, { level: "error", extra: { ...parsed } });
          trackEvent("file_processing", { fileSuccess: false, fileFailReason: "ai_not_configured" });
          return res.status(503).json({
            error: "AI service not configured",
            message:
              "The AI analysis service is not configured on this deployment. " +
              "Ask the operator to set AI_INTEGRATIONS_OPENAI_API_KEY (or OPENAI_API_KEY) and redeploy.",
          });
        }
        if (parsed.status === 401 || parsed.status === 403) {
          logger.error("extract-text: AI authentication failed", { source: "extract-text", openai: parsed });
          Sentry.captureException(err, { level: "error", extra: { ...parsed } });
          trackEvent("file_processing", { fileSuccess: false, fileFailReason: "ai_auth_failed" });
          return res.status(502).json({
            error: "AI authentication failed",
            message:
              "The AI provider rejected our credentials. The API key may be invalid, " +
              "revoked, or missing access to the required model.",
            code: parsed.code,
            requestId: parsed.requestId,
          });
        }
        if (parsed.status === 429 && parsed.code === "insufficient_quota") {
          logger.error("extract-text: AI quota exhausted", { source: "extract-text", openai: parsed });
          Sentry.captureException(err, { level: "error", extra: { ...parsed } });
          trackEvent("file_processing", { fileSuccess: false, fileFailReason: "ai_quota_exhausted" });
          return res.status(402).json({
            error: "AI quota exhausted",
            message:
              "AI quota exhausted — the deployment's OpenAI billing is out of credit. " +
              "Ask the operator to top up.",
            code: parsed.code,
            requestId: parsed.requestId,
          });
        }
        if (parsed.status === 429) {
          logger.error("extract-text: AI rate limited", { source: "extract-text", openai: parsed });
          Sentry.captureException(err, { level: "error", extra: { ...parsed } });
          trackEvent("file_processing", { fileSuccess: false, fileFailReason: "ai_rate_limit" });
          return res.status(429).json({
            error: "AI rate limit",
            message: "We're hitting our AI rate limit. Please try again in a few seconds.",
            code: parsed.code,
            retryAfter: parsed.retryAfter,
            requestId: parsed.requestId,
          });
        }
        const isModelNotFound =
          parsed.status === 404 ||
          parsed.code === "model_not_found" ||
          parsed.code === "model_not_available";
        if (isModelNotFound) {
          logger.error("extract-text: AI model unavailable", { source: "extract-text", openai: parsed });
          Sentry.captureException(err, { level: "error", extra: { ...parsed } });
          trackEvent("file_processing", { fileSuccess: false, fileFailReason: "ai_model_unavailable" });
          return res.status(502).json({
            error: "AI model unavailable",
            message:
              `AI model unavailable — the API key does not have access to the configured model (${AI_PRIMARY_MODEL}).`,
            code: parsed.code,
            requestId: parsed.requestId,
          });
        }
        if (typeof parsed.status === "number" && parsed.status >= 500) {
          logger.error("extract-text: AI provider upstream error", { source: "extract-text", openai: parsed });
          Sentry.captureException(err, { level: "error", extra: { ...parsed } });
          trackEvent("file_processing", { fileSuccess: false, fileFailReason: "ai_upstream_error" });
          return res.status(502).json({
            error: "AI provider unavailable",
            message: `AI provider is temporarily unavailable (upstream ${parsed.status}). Please try again.`,
            code: parsed.code,
            requestId: parsed.requestId,
          });
        }
        if (parsed.code === "content_filter" || parsed.type === "content_filter") {
          logger.warn("extract-text: content filter triggered", { source: "extract-text", openai: parsed });
          Sentry.captureException(err, { level: "warning", extra: { ...parsed } });
          trackEvent("file_processing", { fileSuccess: false, fileFailReason: "content_filter" });
          return res.status(422).json({
            error: "Content filtered",
            message:
              "The AI could not process this image due to a safety filter. " +
              "Try a different photo or paste the text.",
            code: parsed.code,
            requestId: parsed.requestId,
          });
        }

        // True fallback — unknown failure mode. Surface debug code + request
        // id so operators can trace it in OpenAI's dashboard instead of
        // debugging a misleading "couldn't read enough text" bug report.
        logger.error("extract-text: unclassified extraction error", { source: "extract-text", openai: parsed });
        Sentry.withScope((scope) => {
          scope.setTag("feature", "extract-text");
          scope.setTag("route", "/api/extract-text");
          Sentry.captureException(err, { extra: { ...parsed } });
        });
        trackEvent("file_processing", {
          fileSuccess: false,
          fileFailReason: errMessage.slice(0, 100),
        });
        return res.status(500).json({
          error: "Text extraction failed",
          message:
            "We couldn't extract text from that file. Please try again, upload a clearer image, or paste the text.",
          debugCode: parsed.code ?? (typeof parsed.status === "number" ? `http_${parsed.status}` : "unknown"),
          requestId: parsed.requestId,
        });
      }
      if (text.length < 20) {
        trackEvent("file_processing", { fileSuccess: false, fileFailReason: "too_short" });
        return res.status(422).json({ message: SHORT_TEXT_MSG });
      }
      trackEvent("file_processing", { fileSuccess: true });
      return res.json({ text });
    } catch (err) {
      console.error("extract-text error:", err);
      Sentry.withScope((scope) => {
        scope.setTag("feature", "extract-text");
        scope.setTag("route", "/api/extract-text");
        scope.setTag("error_type", err instanceof Error ? err.constructor.name : "unknown");
        Sentry.captureException(err);
      });
      res.status(500).json({ message: "Something went wrong. Please try again." });
    }
  });

  // ─── POST /api/blob/upload-token ────────────────────────────────────────────
  // Issues a short-lived client upload token for Vercel Blob.  Called by the
  // browser before a direct-to-storage upload when a file exceeds the inline
  // 20 MB multipart ceiling.  onBeforeGenerateToken enforces the MIME allowlist
  // and the largest per-type cap (PDFs).  The narrower image cap is enforced
  // on the /api/extract-text-from-blob route because contentType isn't known
  // at token-issue time for all flows.
  app.post("/api/blob/upload-token", async (req, res) => {
    try {
      const body = req.body as HandleUploadBody;
      const json = await handleUpload({
        body,
        request: req,
        onBeforeGenerateToken: async (pathname) => {
          if (!pathname.startsWith(BLOB_PATH_PREFIX)) {
            throw new Error("Invalid pathname prefix");
          }
          return {
            allowedContentTypes: [...ALLOWED_MIME_TYPES],
            addRandomSuffix: true,
            maximumSizeInBytes: PDF_BLOB_CAP,
            validUntil: Date.now() + 60_000,
          };
        },
        onUploadCompleted: async () => {
          // Synchronous text extraction happens via POST /api/extract-text-from-blob
          // issued by the client after upload() resolves.  This webhook just
          // signals completion; nothing else to do.
        },
      });
      return res.json(json);
    } catch (err) {
      console.error("[blob-upload-token] error:", err);
      Sentry.withScope((scope) => {
        scope.setTag("feature", "blob-upload-token");
        scope.setTag("route", "/api/blob/upload-token");
        scope.setTag("error_type", err instanceof Error ? err.constructor.name : "unknown");
        Sentry.captureException(err);
      });
      return res.status(400).json({
        message: "Unable to authorize upload. Please try again.",
      });
    }
  });

  // ─── POST /api/extract-text-from-blob ──────────────────────────────────────
  // Companion endpoint to /api/blob/upload-token.  Fetches a blob that the
  // browser just uploaded, runs the same extractor used by /api/extract-text,
  // and always deletes the blob afterward to prevent orphaned storage.
  app.post("/api/extract-text-from-blob", async (req, res) => {
    const blobSchema = z.object({
      blobUrl: z.string().url(),
      contentType: z.enum(ALLOWED_MIME_TYPES),
    });
    const parseResult = blobSchema.safeParse(req.body);
    if (!parseResult.success) {
      trackEvent("file_processing", { fileSuccess: false, fileFailReason: "invalid_request" });
      return res.status(400).json({ message: "Invalid request." });
    }
    const { blobUrl, contentType } = parseResult.data;

    // SSRF guard: only accept Vercel Blob storage hostnames over HTTPS.
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(blobUrl);
    } catch {
      trackEvent("file_processing", { fileSuccess: false, fileFailReason: "invalid_blob_url" });
      return res.status(400).json({ message: "Invalid blob URL." });
    }
    if (parsedUrl.protocol !== "https:" || !parsedUrl.hostname.endsWith(BLOB_HOST_SUFFIX)) {
      trackEvent("file_processing", { fileSuccess: false, fileFailReason: "blob_host_rejected" });
      return res.status(400).json({ message: "Invalid blob URL." });
    }

    const perTypeCap = contentType === "application/pdf" ? PDF_BLOB_CAP : IMAGE_BLOB_CAP;

    try {
      // Streaming fetch with a running byte cap.  Do NOT trust Content-Length —
      // it's advisory and can be spoofed.  If the running total exceeds the
      // cap we abort the fetch and return 413.
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), BLOB_FETCH_TIMEOUT_MS);

      let buffer: Buffer;
      try {
        const response = await fetch(blobUrl, { signal: controller.signal });
        if (!response.ok) {
          trackEvent("file_processing", { fileSuccess: false, fileFailReason: "blob_fetch_failed" });
          return res.status(502).json({ message: "Unable to retrieve uploaded file." });
        }
        if (!response.body) {
          trackEvent("file_processing", { fileSuccess: false, fileFailReason: "blob_empty_body" });
          return res.status(502).json({ message: "Unable to retrieve uploaded file." });
        }

        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let total = 0;
        let capped = false;
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            total += value.byteLength;
            if (total > perTypeCap) {
              capped = true;
              try { controller.abort(); } catch { /* ignore */ }
              break;
            }
            chunks.push(value);
          }
        }
        if (capped) {
          trackEvent("file_processing", { fileSuccess: false, fileFailReason: "file_too_large" });
          return res.status(413).json({
            message: `That file is too large to process. Please use a file under ${Math.round(perTypeCap / (1024 * 1024))} MB.`,
          });
        }
        buffer = Buffer.concat(chunks, total);
      } finally {
        clearTimeout(timeout);
      }

      let text: string;
      try {
        text = await extractTextFromFile(buffer, contentType);
      } catch (err) {
        if (err instanceof IrrelevantContentError) {
          trackEvent("file_processing", {
            fileSuccess: false,
            fileFailReason: "content_not_relevant",
            documentType: err.documentType,
          });
          return res.status(422).json({
            error: "content_not_relevant",
            message: err.rejectionReason,
            documentType: err.documentType,
          });
        }
        console.error("[extract-text-from-blob] extraction error:", err);
        trackEvent("file_processing", {
          fileSuccess: false,
          fileFailReason: err instanceof Error ? err.message.slice(0, 100) : "extraction_error",
        });
        return res.status(422).json({ message: SHORT_TEXT_MSG });
      }

      if (text.length < 20) {
        trackEvent("file_processing", { fileSuccess: false, fileFailReason: "too_short" });
        return res.status(422).json({ message: SHORT_TEXT_MSG });
      }

      trackEvent("file_processing", { fileSuccess: true });
      return res.json({ text });
    } catch (err) {
      console.error("[extract-text-from-blob] error:", err);
      Sentry.withScope((scope) => {
        scope.setTag("feature", "extract-text-blob");
        scope.setTag("route", "/api/extract-text-from-blob");
        scope.setTag("error_type", err instanceof Error ? err.constructor.name : "unknown");
        Sentry.captureException(err);
      });
      return res.status(500).json({ message: "Something went wrong. Please try again." });
    } finally {
      // Always clean up — runs on success, extraction error, and timeout.
      del(blobUrl).catch((err) => console.error("[blob] del failed:", err));
    }
  });

  app.post("/api/extract-url", async (req, res) => {
    try {
      const urlSchema = z.object({ url: z.string().url("Please enter a valid URL") });
      const parseResult = urlSchema.safeParse(req.body);
      if (!parseResult.success) {
        trackEvent("url_processing", { urlSuccess: false, urlFailReason: "invalid_url" });
        return res.status(400).json({ message: "Please enter a valid URL." });
      }
      const { url } = parseResult.data;

      let text: string;
      try {
        text = await extractTextFromUrl(url);
      } catch (err) {
        console.error("URL extraction error:", err);
        const reason = err instanceof Error ? err.message.slice(0, 100) : "extraction_error";
        trackEvent("url_processing", { urlSuccess: false, urlFailReason: reason });
        return res.status(422).json({
          message: err instanceof Error && err.message.includes("Internal")
            ? "That URL cannot be accessed."
            : "We couldn't extract enough content from that page. Try pasting the text directly instead.",
        });
      }

      if (text.length < 20) {
        trackEvent("url_processing", { urlSuccess: false, urlFailReason: "too_short" });
        return res.status(422).json({ message: "We couldn't find enough content on that page. Try pasting the dealer quote text directly." });
      }

      trackEvent("url_processing", { urlSuccess: true });
      return res.json({ text });
    } catch (err) {
      console.error("extract-url error:", err);
      Sentry.withScope((scope) => {
        scope.setTag("feature", "extract-url");
        scope.setTag("route", "/api/extract-url");
        scope.setTag("error_type", err instanceof Error ? err.constructor.name : "unknown");
        Sentry.captureException(err);
      });
      res.status(500).json({ message: "Something went wrong. Please try again." });
    }
  });
}
