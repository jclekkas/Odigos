import { describe, it, expect } from "vitest";
import { redactPII } from "../../server/piiRedact.js";

describe("redactPII", () => {
  // ── Email ──────────────────────────────────────────────────────────────────

  it("redacts email addresses", () => {
    const result = redactPII("Contact me at john.doe@example.com for details.");
    expect(result).not.toContain("john.doe@example.com");
    expect(result).toContain("[EMAIL]");
  });

  it("redacts email addresses with subdomains", () => {
    const result = redactPII("Reach us at support@mail.subdomain.example.org");
    expect(result).not.toContain("support@mail.subdomain.example.org");
    expect(result).toContain("[EMAIL]");
  });

  it("redacts email with plus addressing", () => {
    const result = redactPII("Send to user+tag@example.com");
    expect(result).not.toContain("user+tag@example.com");
    expect(result).toContain("[EMAIL]");
  });

  it("does not redact a bare word without @ sign", () => {
    const result = redactPII("The model is a Honda Accord.");
    expect(result).not.toContain("[EMAIL]");
  });

  // ── Phone ──────────────────────────────────────────────────────────────────

  it("redacts US phone numbers — (555) 123-4567 format", () => {
    const result = redactPII("Call me at (555) 123-4567.");
    expect(result).not.toContain("123-4567");
    expect(result).toContain("[PHONE]");
  });

  it("redacts US phone numbers — dashed format 555-123-4567", () => {
    const result = redactPII("My number is 555-123-4567.");
    expect(result).toContain("[PHONE]");
  });

  it("redacts US phone numbers — dot format 555.123.4567", () => {
    const result = redactPII("Reach me at 555.123.4567.");
    expect(result).toContain("[PHONE]");
  });

  it("redacts US phone numbers with +1 prefix — +1 555-123-4567", () => {
    const result = redactPII("International: +1 555-123-4567");
    expect(result).not.toContain("555-123-4567");
    expect(result).toContain("[PHONE]");
  });

  it("redacts US phone numbers with +1 prefix and dots — +1.555.123.4567", () => {
    const result = redactPII("Call +1.555.123.4567 for info.");
    expect(result).not.toContain("555.123.4567");
    expect(result).toContain("[PHONE]");
  });

  it("does not redact a 4-digit number as a phone", () => {
    const result = redactPII("Price is $1234.");
    expect(result).not.toContain("[PHONE]");
  });

  // ── SSN ────────────────────────────────────────────────────────────────────

  it("redacts SSN — 123-45-6789 format", () => {
    const result = redactPII("SSN: 123-45-6789");
    expect(result).not.toContain("123-45-6789");
    expect(result).toContain("[SSN]");
  });

  it("redacts SSN embedded in a sentence", () => {
    const result = redactPII("My social is 987-65-4321, please verify.");
    expect(result).not.toContain("987-65-4321");
    expect(result).toContain("[SSN]");
  });

  it("does not redact a date that looks like SSN", () => {
    const result = redactPII("Term expires 01-01-2025.");
    expect(result).not.toContain("[SSN]");
  });

  // ── Credit card ────────────────────────────────────────────────────────────

  it("redacts credit card numbers with spaces", () => {
    const result = redactPII("Card: 4111 1111 1111 1111");
    expect(result).not.toContain("4111");
    expect(result).toContain("[CARD]");
  });

  it("redacts credit card numbers with dashes", () => {
    const result = redactPII("Card: 5500-0000-0000-0004");
    expect(result).not.toContain("5500");
    expect(result).toContain("[CARD]");
  });

  it("redacts 15-digit Amex card format", () => {
    const result = redactPII("Amex: 3782 822463 10005");
    expect(result).not.toContain("3782");
    expect(result).toContain("[CARD]");
  });

  it("does not redact a short number like a model year", () => {
    const result = redactPII("Model year 2024, price $35999.");
    expect(result).not.toContain("[CARD]");
  });

  // ── Salutation ─────────────────────────────────────────────────────────────

  it("redacts salutation names — Dear John", () => {
    const result = redactPII("Dear John, here is your quote.");
    expect(result).not.toContain("Dear John");
    expect(result).toContain("Dear [NAME]");
  });

  it("redacts salutation names — Hi Sarah", () => {
    const result = redactPII("Hi Sarah, the price is $35,000.");
    expect(result).toContain("[NAME]");
    expect(result).not.toContain("Hi Sarah");
  });

  it("redacts salutation names — Hello Mike", () => {
    const result = redactPII("Hello Mike, please review the attached quote.");
    expect(result).toContain("Hello [NAME]");
    expect(result).not.toContain("Hello Mike");
  });

  it("redacts salutation names — Hey Jake", () => {
    const result = redactPII("Hey Jake! Here is your deal summary.");
    expect(result).toContain("Hey [NAME]");
    expect(result).not.toContain("Hey Jake");
  });

  it("does not redact a lowercase word after a salutation", () => {
    const result = redactPII("Hi there, welcome!");
    expect(result).not.toContain("[NAME]");
  });

  // ── Combination and preservation ───────────────────────────────────────────

  it("redacts multiple PII items in the same string", () => {
    const text = "Contact john@test.com or call (555) 987-6543.";
    const result = redactPII(text);
    expect(result).toContain("[EMAIL]");
    expect(result).toContain("[PHONE]");
    expect(result).not.toContain("john@test.com");
    expect(result).not.toContain("987-6543");
  });

  it("preserves non-PII content unchanged", () => {
    const text = "Out-the-door price: $35,000. APR: 4.9%. Term: 60 months.";
    const result = redactPII(text);
    expect(result).toBe(text);
  });

  it("handles empty string without error", () => {
    expect(redactPII("")).toBe("");
  });
});
