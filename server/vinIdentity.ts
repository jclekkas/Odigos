/**
 * VIN characters read off the quote itself.
 *
 * This does not decode the vehicle. NHTSA still does that. It only notices
 * more than one VIN, a VIN printed in lowercase, and a check digit that does
 * not match the ISO 3779 weights.
 */

const VIN_PATTERN = /\b[A-HJ-NPR-Za-hj-npr-z0-9]{17}\b/g;

const TRANSLITERATE: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
};

const CHECK_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

export interface VinScan {
  /** Distinct VINs in first-seen order, uppercased. */
  vins: string[];
  /** Tokens that contained a lowercase letter before they were uppercased. */
  lowercaseRaw: string[];
  conflicting: boolean;
  badCheckDigits: string[];
}

export function expectedVinCheckDigit(vin: string): string | null {
  const chars = vin.toUpperCase();
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(chars) || !/[A-HJ-NPR-Z]/.test(chars)) return null;
  let sum = 0;
  for (let index = 0; index < 17; index += 1) {
    const char = chars[index];
    const value = /[0-9]/.test(char) ? Number(char) : TRANSLITERATE[char];
    if (value == null) return null;
    sum += value * CHECK_WEIGHTS[index];
  }
  const remainder = sum % 11;
  return remainder === 10 ? "X" : String(remainder);
}

export function isVinCheckDigitValid(vin: string): boolean {
  const expected = expectedVinCheckDigit(vin);
  return expected != null && vin.toUpperCase()[8] === expected;
}

export function scanVins(text: string | null | undefined): VinScan {
  const vins: string[] = [];
  const lowercaseRaw: string[] = [];
  const badCheckDigits: string[] = [];
  if (!text) {
    return { vins, lowercaseRaw, conflicting: false, badCheckDigits };
  }
  for (const token of text.match(VIN_PATTERN) ?? []) {
    const upper = token.toUpperCase();
    if (!/[A-HJ-NPR-Z]/.test(upper)) continue;
    if (token !== upper && !lowercaseRaw.includes(token)) lowercaseRaw.push(token);
    if (!vins.includes(upper)) vins.push(upper);
  }
  for (const vin of vins) {
    if (!isVinCheckDigitValid(vin) && !badCheckDigits.includes(vin)) badCheckDigits.push(vin);
  }
  return {
    vins,
    lowercaseRaw,
    conflicting: vins.length >= 2,
    badCheckDigits,
  };
}
