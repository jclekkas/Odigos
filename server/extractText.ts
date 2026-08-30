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
const URL_MAX_REDIRECTS = 5;

/**
 * Parse a dotted-quad IPv4 literal into its four octets.
 *
 * Deliberately strict: only plain decimal `a.b.c.d` is accepted. Alternative
 * encodings that resolvers still honour (`2130706433`, `0177.0.0.1`,
 * `0x7f.0.0.1`) return null here and are then rejected by the caller, because
 * a hostname that is not a valid IP literal and not resolvable is not
 * something we should be fetching anyway.
 */
function parseIpv4(host: string): number[] | null {
  const parts = host.split(".");
  if (parts.length !== 4) return null;
  const octets: number[] = [];
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const n = Number(part);
    if (n > 255) return null;
    octets.push(n);
  }
  return octets;
}

/**
 * True for any address we must never let the server connect to.
 *
 * Covers loopback, RFC 1918 private space, link-local (which includes the
 * 169.254.169.254 cloud metadata endpoint), carrier-grade NAT, the
 * "this network" range, and the IPv6 equivalents including IPv4-mapped
 * addresses like ::ffff:127.0.0.1.
 */
export function isBlockedAddress(address: string): boolean {
  const host = address.toLowerCase().replace(/^\[|\]$/g, "");

  const v4 = parseIpv4(host);
  if (v4) {
    const [a, b] = v4;
    if (a === 0) return true;                                   // 0.0.0.0/8
    if (a === 10) return true;                                  // private
    if (a === 127) return true;                                 // loopback
    if (a === 169 && b === 254) return true;                    // link-local + metadata
    if (a === 172 && b >= 16 && b <= 31) return true;           // private
    if (a === 192 && b === 168) return true;                    // private
    if (a === 100 && b >= 64 && b <= 127) return true;          // carrier-grade NAT
    if (a === 192 && b === 0) return true;                      // IETF protocol assignments
    if (a >= 224) return true;                                  // multicast + reserved + broadcast
    return false;
  }

  if (host.includes(":")) {
    if (host === "::" || host === "::1") return true;           // unspecified + loopback

    // IPv4-mapped / IPv4-compatible in dotted form: ::ffff:127.0.0.1
    const mapped = host.match(/^::(?:ffff:)?(\d{1,3}(?:\.\d{1,3}){3})$/);
    if (mapped) return isBlockedAddress(mapped[1]);

    // The same address after the URL parser normalises it to hex groups:
    // ::ffff:127.0.0.1 comes back out of `new URL()` as ::ffff:7f00:1
    const mappedHex = host.match(/^::(?:ffff:)?([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
    if (mappedHex) {
      const high = parseInt(mappedHex[1], 16);
      const low = parseInt(mappedHex[2], 16);
      const dotted = [high >> 8, high & 0xff, low >> 8, low & 0xff].join(".");
      return isBlockedAddress(dotted);
    }
    if (/^f[cd][0-9a-f]{2}:/.test(host)) return true;           // unique local fc00::/7
    if (/^fe[89ab][0-9a-f]:/.test(host)) return true;           // link-local fe80::/10
    return false;
  }

  return false;
}

/**
 * Reject a URL that points anywhere internal, before we open a connection.
 *
 * Called for the original URL *and* for every redirect hop — the previous
 * implementation validated only the first URL and then let fetch follow
 * redirects itself, so any external page could bounce the server to
 * http://169.254.169.254/ and read back the response.
 */
async function assertUrlIsFetchable(target: URL): Promise<void> {
  if (target.protocol !== "https:" && target.protocol !== "http:") {
    throw new Error("Only HTTP and HTTPS URLs are supported");
  }
  if (target.username || target.password) {
    throw new Error("Internal URLs are not allowed");
  }

  const hostname = target.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new Error("Internal URLs are not allowed");
  }
  if (isBlockedAddress(hostname)) {
    throw new Error("Internal URLs are not allowed");
  }

  // A bare number or hex string is an alternative IP encoding (2130706433,
  // 0x7f000001). We can't safely normalise every form, so refuse them.
  if (/^(\d+|0x[0-9a-f]+)$/.test(hostname)) {
    throw new Error("Internal URLs are not allowed");
  }

  // If the name is not already an IP literal, resolve it and check every
  // address it points at. A DNS failure is left alone: the fetch that follows
  // uses the same resolver and will fail too, so there is nothing to reach.
  if (parseIpv4(hostname) || hostname.includes(":")) return;

  const { lookup } = await import("node:dns/promises");
  let resolved: Array<{ address: string }>;
  try {
    resolved = await lookup(hostname, { all: true });
  } catch {
    return;
  }
  for (const entry of resolved) {
    if (isBlockedAddress(entry.address)) {
      throw new Error("Internal URLs are not allowed");
    }
  }
}

export async function extractTextFromUrl(url: string): Promise<string> {
  // Validate URL
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid URL format");
  }
  await assertUrlIsFetchable(parsed);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), URL_FETCH_TIMEOUT_MS);

  try {
    // Follow redirects by hand so each hop gets the same guard as the
    // original URL.
    let currentUrl = url;
    let response!: Awaited<ReturnType<typeof fetch>>;

    for (let hop = 0; ; hop++) {
      response = await fetch(currentUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Odigos/1.0; +https://odigosauto.com)",
          "Accept": "text/html,application/xhtml+xml,*/*",
        },
        redirect: "manual",
      });

      const location = response.status >= 300 && response.status < 400
        ? response.headers.get("location")
        : null;
      if (!location) break;

      if (hop >= URL_MAX_REDIRECTS) {
        throw new Error("Too many redirects");
      }
      const next = new URL(location, currentUrl);
      await assertUrlIsFetchable(next);
      currentUrl = next.toString();
    }

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
