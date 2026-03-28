import * as Sentry from "@sentry/node";
import type { Express, Request, Response } from "express";
import multer from "multer";
import { z } from "zod";
import { analysisRequestSchema } from "@shared/schema";
import { trackEvent } from "../events";
import { extractTextFromFile } from "../extractText";
import { storage } from "../storage";
import { writeAuditEvent } from "../audit";
import { runAnalysis, AnalyzeServiceError } from "../services/analyzeService";

console.log("OpenAI configured with base URL:", process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ? "set" : "not set");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
const SHORT_TEXT_MSG = "We couldn't read enough text from that file. Try pasting the text or uploading a clearer image.";

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
      void writeAuditEvent(req, "analyze", "success", {
        route: req.originalUrl, method: req.method, statusCode: 200,
        submissionId: result.listingId ?? null, stateCode: result.stateCode ?? null,
        hasPdf: Boolean(req.file),
      });
    } catch (error) {
      if (error instanceof AnalyzeServiceError) {
        void writeAuditEvent(req, "analyze", "failure", {
          route: req.originalUrl, method: req.method, statusCode: error.statusCode,
        });
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
      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
        if (error.message.includes("timeout") || error.message.includes("ETIMEDOUT")) errorMessage = "Request timed out. Please try again.";
        else if (error.message.includes("rate limit")) errorMessage = "Too many requests. Please wait a moment and try again.";
      }
      res.status(500).json({ error: "Failed to analyze deal", message: errorMessage });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    try {
      const feedbackSchema = z.object({
        listingId: z.string().min(1),
        rating: z.boolean(),
        comment: z.string().trim().max(500).optional().transform((v) => (v === "" ? undefined : v)),
      });
      const parseResult = feedbackSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid request", details: parseResult.error.flatten() });
      }
      const { listingId, rating, comment } = parseResult.data;
      await storage.createDealFeedback({ listingId, rating, comment: comment ?? null });
      return res.json({ ok: true });
    } catch (error) {
      console.error("[feedback] POST /api/feedback error:", error);
      return res.status(500).json({ error: "Failed to save feedback" });
    }
  });

  app.post("/api/extract-text", async (req, res) => {
    try {
      await runUploadMiddleware(req, res);
    } catch (err: any) {
      const reason = err?.code === "LIMIT_FILE_SIZE" ? "file_too_large" : "upload_error";
      trackEvent("file_processing", { fileSuccess: false, fileFailReason: reason });
      return res.status(400).json({
        message: err?.code === "LIMIT_FILE_SIZE"
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
      if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
        trackEvent("file_processing", { fileSuccess: false, fileFailReason: "unsupported_mime_type" });
        return res.status(400).json({ message: "That file type isn't supported." });
      }
      let text: string;
      try {
        text = await extractTextFromFile(buffer, mimetype);
      } catch (err) {
        console.error("Text extraction error:", err);
        trackEvent("file_processing", { fileSuccess: false, fileFailReason: err instanceof Error ? err.message.slice(0, 100) : "extraction_error" });
        return res.status(422).json({ message: SHORT_TEXT_MSG });
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
}
