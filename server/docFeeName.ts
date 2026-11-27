/**
 * Documentation-fee name matching shared by the rule engine and the
 * competing-quote comparison so both sides use the same fee bucket.
 */

export const DOC_FEE_KEYWORDS_EXACT = [
  "doc fee",
  "documentation fee",
  "document fee",
  "documentary fee",
  "documentary service",
  "documentary preparation",
  "document processing",
];

export const DOC_FEE_KEYWORDS_BROAD = [
  "dealer fee",
  "processing fee",
  "admin fee",
  "administrative fee",
];

export function isDocFeeName(nameLower: string): boolean {
  return (
    DOC_FEE_KEYWORDS_EXACT.some((keyword) => nameLower.includes(keyword)) ||
    DOC_FEE_KEYWORDS_BROAD.some((keyword) => nameLower.includes(keyword))
  );
}
