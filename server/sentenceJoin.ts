/**
 * Join prose findings so a missing period is not swallowed.
 *
 * "A dealer fee needs an itemized explanation" plus "Market value not verified."
 * becomes "A dealer fee needs an itemized explanation. Market value not verified."
 */

function ensureTerminalPunctuation(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  return /[.!?]["')\]]*$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

export function joinSentences(parts: Array<string | null | undefined>): string {
  const sentences = parts.map((part) => part?.trim() ?? "").filter((part) => part.length > 0);
  if (sentences.length === 0) return "";
  return sentences
    .map((part, index) => (index < sentences.length - 1 ? ensureTerminalPunctuation(part) : part))
    .join(" ");
}
