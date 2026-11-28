/**
 * The amount financed has to be printed on the quote as its own figure.
 * Computing it from the price is not a disclosure.
 */

const AMOUNT_FINANCED =
  /\b(?:amount\s+(?:to\s+be\s+)?financed|financed\s+amount)\b\s*[:\-]?\s*\$?\s*(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{2}))?/gi;

function dollars(whole: string, fraction: string | undefined): number | null {
  const value = Number(whole.replace(/,/g, "")) + (fraction ? Number(fraction) / 100 : 0);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100) / 100;
}

/** The single labeled amount financed, or null when it is missing or ambiguous. */
export function disclosedAmountFinanced(text: string | null | undefined): number | null {
  if (!text) return null;
  const found: number[] = [];
  for (const match of text.matchAll(AMOUNT_FINANCED)) {
    const amount = dollars(match[1], match[2]);
    if (amount == null) continue;
    if (!found.some((existing) => Math.abs(existing - amount) < 0.01)) found.push(amount);
  }
  if (found.length !== 1) return null;
  return found[0];
}
