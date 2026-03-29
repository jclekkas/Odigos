/**
 * Best-effort PII redaction applied to dealer submission text before Tier 2 storage.
 *
 * IMPORTANT: This is best-effort only and is NOT guaranteed to perfectly anonymize
 * every submission. Unusual formatting, non-standard separators, or novel patterns
 * may escape detection. Do not treat redacted output as fully anonymized.
 *
 * Regex audit (completed 2026-03-29):
 *
 * Email: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g
 *   - The `\-` inside the character class is a valid escaped hyphen (equivalent to a
 *     literal `-`). NO malformed character class. Covers subdomains (multiple dots in
 *     domain part), plus-addressing, and all standard TLDs.
 *
 * Phone: /(\+1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/g
 *   - Covers (555) 123-4567, 555-123-4567, 555.123.4567, and all +1 prefix variants
 *     with dash/dot/space separator. No character-class issues.
 *
 * SSN: /\b\d{3}-\d{2}-\d{4}\b/g
 *   - Correctly matches 123-45-6789. Word boundaries prevent over-matching longer
 *     numbers. No character-class issues.
 *
 * Card: /\b(?:\d[-\s]?){12,15}\d\b/g
 *   - Matches 13–16 digit sequences with optional spaces or dashes between digits.
 *     The `[-\s]` character class is valid (literal hyphen at start of class).
 *     Covers Visa (16), Mastercard (16), Amex (15), Discover (16) formats.
 *
 * Salutation: /\b(Dear|Hi|Hello|Hey)\s+[A-Z][a-z]{1,20}\b/g
 *   - Captures the salutation keyword then a capitalized name (1 upper + 1–20 lower).
 *     No character-class issues. Negative case: lowercase words after salutation (e.g.
 *     "Hi there") are correctly NOT matched because `[A-Z]` requires a capital letter.
 *
 * Conclusion: All five patterns are correct. No bugs found; no changes required.
 */
export function redactPII(text: string): string {
  return (
    text
      // Email addresses — covers subdomains, plus-addressing, standard TLDs
      .replace(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, "[EMAIL]")
      // US phone numbers — covers (555) 123-4567, 555-123-4567, 555.123.4567, +1 variants
      .replace(
        /(\+1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/g,
        "[PHONE]",
      )
      // SSN patterns: 123-45-6789
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[SSN]")
      // Credit/debit card numbers: 13–16 digits with optional spaces or dashes
      .replace(/\b(?:\d[-\s]?){12,15}\d\b/g, "[CARD]")
      // Salutation first names: "Dear John", "Hi Sarah", "Hello Mike", "Hey Jake"
      .replace(
        /\b(Dear|Hi|Hello|Hey)\s+[A-Z][a-z]{1,20}\b/g,
        "$1 [NAME]",
      )
  );
}
