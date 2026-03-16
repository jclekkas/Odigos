/**
 * Best-effort PII redaction applied to dealer submission text before Tier 2 storage.
 *
 * IMPORTANT: This is best-effort only and is NOT guaranteed to perfectly anonymize
 * every submission. Unusual formatting, non-standard separators, or novel patterns
 * may escape detection. Do not treat redacted output as fully anonymized.
 */
export function redactPII(text: string): string {
  return (
    text
      // Email addresses
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
