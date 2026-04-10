import { openai } from "./openaiClient.js";

const IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
const PDF_MIME_TYPE = "application/pdf";

const VISION_PROMPT =
  "Extract all text from this image exactly as it appears. Include all numbers, fees, prices, and terms. Output only the extracted text with no commentary, labels, or formatting beyond plain text.";

async function extractTextViaVision(buffer: Buffer, mimetype: string): Promise<string> {
  const base64 = buffer.toString("base64");
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
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
  });
  return response.choices[0]?.message?.content ?? "";
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
    const text = await extractTextViaVision(buffer, mimetype);
    return text.trim();
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
