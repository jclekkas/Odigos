import OpenAI from "openai";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string }>;

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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

export async function extractTextFromFile(buffer: Buffer, mimetype: string): Promise<string> {
  if (IMAGE_MIME_TYPES.includes(mimetype)) {
    const text = await extractTextViaVision(buffer, mimetype);
    return text.trim();
  }

  if (mimetype === PDF_MIME_TYPE) {
    let text = "";
    try {
      const data = await pdfParse(buffer);
      text = data.text?.trim() ?? "";
    } catch {
      text = "";
    }

    if (text.length >= 50) {
      return text;
    }

    const fallback = await extractTextViaVision(buffer, "image/png");
    return fallback.trim();
  }

  throw new Error(`Unsupported file type: ${mimetype}`);
}
