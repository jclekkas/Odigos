import { describe, it, expect } from "vitest";
import { redactPII } from "../../server/piiRedact";

describe("redactPII", () => {
  it("redacts email addresses", () => {
    const result = redactPII("Contact me at john.doe@example.com for details.");
    expect(result).not.toContain("john.doe@example.com");
    expect(result).toContain("[EMAIL]");
  });

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

  it("redacts SSN — 123-45-6789 format", () => {
    const result = redactPII("SSN: 123-45-6789");
    expect(result).not.toContain("123-45-6789");
    expect(result).toContain("[SSN]");
  });

  it("redacts credit card numbers with spaces", () => {
    const result = redactPII("Card: 4111 1111 1111 1111");
    expect(result).not.toContain("4111");
    expect(result).toContain("[CARD]");
  });

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

  it("does not redact innocent numbers that resemble cards but are too short", () => {
    const result = redactPII("Model year 2024, price $35999.");
    expect(result).not.toContain("[CARD]");
  });

  it("preserves non-PII content unchanged", () => {
    const text = "Out-the-door price: $35,000. APR: 4.9%. Term: 60 months.";
    const result = redactPII(text);
    expect(result).toBe(text);
  });

  it("redacts multiple PII items in the same string", () => {
    const text = "Contact john@test.com or call (555) 987-6543.";
    const result = redactPII(text);
    expect(result).toContain("[EMAIL]");
    expect(result).toContain("[PHONE]");
    expect(result).not.toContain("john@test.com");
    expect(result).not.toContain("987-6543");
  });
});
