import type { Express } from "express";
import { z } from "zod";
import { createSmtpTransport } from "../alerts.js";

const emailPreviewSchema = z.object({
  email: z.string().email("A valid email address is required"),
  analysisResult: z.object({
    goNoGo: z.string(),
    verdictLabel: z.string(),
    confidenceLevel: z.string(),
    missingInfo: z.array(z.object({ field: z.string(), question: z.string() })).optional(),
    detectedFields: z.record(z.unknown()).optional(),
    summary: z.string().optional(),
  }),
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCurrencyOrNA(value: unknown): string {
  if (value == null) return "Not specified";
  const n = Number(value);
  if (!Number.isFinite(n)) return "Not specified";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function buildEmailContent(analysisResult: z.infer<typeof emailPreviewSchema>["analysisResult"]) {
  const { goNoGo, verdictLabel, confidenceLevel, missingInfo, detectedFields, summary } = analysisResult;

  const topIssues = (missingInfo ?? []).slice(0, 3);
  const fields = detectedFields as Record<string, unknown> | undefined;

  const fieldLines = fields
    ? [
        `Sale Price: ${formatCurrencyOrNA(fields.salePrice)}`,
        `Out-the-Door Price: ${formatCurrencyOrNA(fields.outTheDoorPrice)}`,
        `Monthly Payment: ${formatCurrencyOrNA(fields.monthlyPayment)}`,
        `APR: ${fields.apr != null ? `${fields.apr}%` : "Not specified"}`,
        `Term: ${fields.termMonths != null ? `${fields.termMonths} months` : "Not specified"}`,
        `Down Payment: ${formatCurrencyOrNA(fields.downPayment)}`,
      ]
    : [];

  const issueLines = topIssues.map((item, i) => `${i + 1}. ${item.field}: ${item.question}`);

  const textBody = [
    `Odigos Deal Analysis`,
    ``,
    `Verdict: ${goNoGo}`,
    verdictLabel ? verdictLabel : "",
    `Confidence: ${confidenceLevel}`,
    ``,
    summary ? `Summary:\n${summary}` : "",
    ``,
    fieldLines.length > 0 ? `Detected Pricing Fields:\n${fieldLines.join("\n")}` : "",
    ``,
    topIssues.length > 0 ? `Top Issues Found:\n${issueLines.join("\n")}` : "No major issues surfaced.",
  ]
    .filter((line) => line !== undefined)
    .join("\n");

  const verdictColor =
    goNoGo === "GO" ? "#10b981" : goNoGo === "NO-GO" ? "#ef4444" : "#f59e0b";

  const issueHtml =
    topIssues.length > 0
      ? `<ol style="margin:0;padding-left:20px;color:#6b7280;font-size:14px;">
          ${topIssues
            .map(
              (item) =>
                `<li style="margin-bottom:6px;"><strong style="color:#111;">${escapeHtml(item.field)}:</strong> ${escapeHtml(item.question)}</li>`
            )
            .join("")}
        </ol>`
      : `<p style="color:#6b7280;font-size:14px;">No major issues surfaced.</p>`;

  const fieldHtml =
    fieldLines.length > 0
      ? `<table style="width:100%;border-collapse:collapse;font-size:14px;">
          ${fieldLines
            .map(
              (line) =>
                `<tr><td style="padding:6px 0;color:#6b7280;border-bottom:1px solid #e5e7eb;">${escapeHtml(line)}</td></tr>`
            )
            .join("")}
        </table>`
      : "";

  const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111;">
  <h1 style="font-size:20px;font-weight:700;margin-bottom:24px;">Odigos Deal Analysis</h1>

  <div style="border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:20px;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
      <span style="display:inline-block;background:${verdictColor}22;border:1px solid ${verdictColor}55;color:${verdictColor};padding:2px 10px;border-radius:4px;font-size:12px;font-weight:700;">${escapeHtml(goNoGo)}</span>
      <span style="font-size:12px;color:#6b7280;border:1px solid #e5e7eb;padding:2px 8px;border-radius:4px;">${escapeHtml(confidenceLevel)} confidence</span>
    </div>
    ${verdictLabel ? `<p style="font-size:15px;font-weight:600;color:${verdictColor};margin:0 0 8px 0;">${escapeHtml(verdictLabel)}</p>` : ""}
    ${summary ? `<p style="font-size:14px;color:#6b7280;margin:0;">${escapeHtml(summary)}</p>` : ""}
  </div>

  ${fieldHtml ? `<h2 style="font-size:15px;font-weight:600;margin-bottom:10px;">Detected Pricing Fields</h2>${fieldHtml}<br/>` : ""}

  <h2 style="font-size:15px;font-weight:600;margin-bottom:10px;">Top Issues Found</h2>
  ${issueHtml}
</body>
</html>`;

  return { textBody, htmlBody };
}

export function registerEmailPreviewRoutes(app: Express): void {
  app.post("/api/email-preview", async (req, res) => {
    const emailFrom = process.env.ALERT_EMAIL_FROM || "alerts@odigosauto.com";

    const transport = await createSmtpTransport();
    if (!transport) {
      return res.status(503).json({
        error: "SMTP_NOT_CONFIGURED",
        message: "Email sending is not configured on this server.",
      });
    }

    const parsed = emailPreviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message ?? "Invalid request body.",
      });
    }

    const { email, analysisResult } = parsed.data;

    try {
      const { textBody, htmlBody } = buildEmailContent(analysisResult);

      await transport.sendMail({
        from: emailFrom,
        to: email,
        subject: `Your Odigos Deal Analysis`,
        text: textBody,
        html: htmlBody,
      });

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("[email-preview] Failed to send email:", err);
      return res.status(500).json({
        error: "SEND_FAILED",
        message: "Could not send the email. Please try again.",
      });
    }
  });
}
