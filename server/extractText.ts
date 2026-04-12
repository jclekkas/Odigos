import { openai } from "./openaiClient.js";
import { AI_PRIMARY_MODEL } from "./config/aiModel.js";
import { logger } from "./logger.js";

const IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
const PDF_MIME_TYPE = "application/pdf";

export class IrrelevantContentError extends Error {
  constructor(
    public readonly rejectionReason: string,
    public readonly documentType: string,
  ) {
    super(rejectionReason);
    this.name = "IrrelevantContentError";
  }
}

interface VisionExtractionResult {
  extractedText: string;
  isRelevantDocument: boolean;
  documentType: string;
  rejectionReason: string | null;
}

const VISION_PROMPT = `You are an OCR assistant specialized in dealer documents. Examine this image and respond with a JSON object with these fields:

{
  "extractedText": "<all text from the image exactly as it appears, including numbers, fees, prices, and terms; empty string if no text is found>",
  "isRelevantDocument": <true if the image is a car dealer quote, offer sheet, buyer's order, finance worksheet, lease agreement, vehicle purchase document, text/email about a car deal, or similar automotive sales document; false otherwise>,
  "documentType": "<one of: 'dealer_quote', 'finance_document', 'vehicle_listing', 'text_message', 'email', 'receipt', 'other_auto_document', 'non_auto_document', 'photo_not_document', 'unreadable'>",
  "rejectionReason": "<if isRelevantDocument is false, a short user-friendly explanation of what the image actually shows, e.g. 'This appears to be a photo of a pet, not a dealer document' or 'This looks like a restaurant receipt, not a car deal'; null if relevant>"
}

Output only the JSON object. No commentary, labels, or markdown.`;

async function extractTextViaVision(buffer: Buffer, mimetype: string): Promise<VisionExtractionResult> {
  const base64 = buffer.toString("base64");
  const response = await openai.chat.completions.create({
    model: AI_PRIMARY_MODEL,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: VISION_PROMPT },
          {
            type: "image_url",
            image_url: { url: `data:${mimetype};base64,${base64}` },
          },
        ],
      },
    ],
    max_tokens: 2000,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content ?? "";

  // Parse the structured JSON response. If parsing fails (model returned
  // plain text instead of JSON), fall back to treating the entire response
  // as extracted text with isRelevantDocument: true — this prevents a
  // regression if the model occasionally ignores the structured format.
  try {
    const parsed = JSON.parse(raw);
    return {
      extractedText: typeof parsed.extractedText === "string" ? parsed.extractedText : raw,
      isRelevantDocument: typeof parsed.isRelevantDocument === "boolean" ? parsed.isRelevantDocument : true,
      documentType: typeof parsed.documentType === "string" ? parsed.documentType : "dealer_quote",
      rejectionReason: typeof parsed.rejectionReason === "string" ? parsed.rejectionReason : null,
    };
  } catch {
    logger.warn("Vision API returned non-JSON response, treating as plain text", { source: "extractText" });
    return {
      extractedText: raw,
      isRelevantDocument: true,
      documentType: "dealer_quote",
      rejectionReason: null,
    };
  }
}

const URL_FETCH_TIMEOUT_MS = 15_000;
const URL_MAX_CONTENT_LENGTH = 5 * 1024 * 1024; // 5MB

export async function extractTextFromUrl(url: string): Promise<string> {
  // Validate URL
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid URL format");
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Only HTTP and HTTPS URLs are supported");
  }
  // Block internal/private IPs
  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("172.") ||
    hostname === "[::1]"
  ) {
    throw new Error("Internal URLs are not allowed");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), URL_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Odigos/1.0; +https://odigosauto.com)",
        "Accept": "text/html,application/xhtml+xml,*/*",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL (status ${response.status})`);
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > URL_MAX_CONTENT_LENGTH) {
      throw new Error("Page content is too large to process");
    }

    const html = await response.text();
    if (html.length > URL_MAX_CONTENT_LENGTH) {
      throw new Error("Page content is too large to process");
    }

    // Use jsdom to extract text content
    const { JSDOM } = await import("jsdom");
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Remove non-content elements
    const removeSelectors = ["script", "style", "nav", "footer", "header", "noscript", "iframe", "svg"];
    for (const selector of removeSelectors) {
      document.querySelectorAll(selector).forEach((el: Element) => el.remove());
    }

    // Try to find main content area
    const mainContent =
      document.querySelector("main") ||
      document.querySelector("[role='main']") ||
      document.querySelector("article") ||
      document.querySelector(".content") ||
      document.querySelector("#content") ||
      document.body;

    const text = (mainContent?.textContent ?? "")
      .replace(/\s+/g, " ")
      .trim();

    return text;
  } finally {
    clearTimeout(timeout);
  }
}

export async function extractTextFromFile(buffer: Buffer, mimetype: string): Promise<string> {
  if (IMAGE_MIME_TYPES.includes(mimetype)) {
    const result = await extractTextViaVision(buffer, mimetype);
    if (!result.isRelevantDocument) {
      throw new IrrelevantContentError(
        result.rejectionReason ?? "This image doesn't appear to be a car dealer document.",
        result.documentType,
      );
    }
    return result.extractedText.trim();
  }

  if (mimetype === PDF_MIME_TYPE) {
    const { default: pdfParse } = await import("pdf-parse") as any;
    let text = "";
    try {
      const data = await pdfParse(buffer);
      text = data.text?.trim() ?? "";
    } catch {
      throw new Error("Could not parse PDF file");
    }

    if (text.length < 50) {
      throw new Error("PDF contained insufficient extractable text");
    }

    return text;
  }

  throw new Error(`Unsupported file type: ${mimetype}`);
}
