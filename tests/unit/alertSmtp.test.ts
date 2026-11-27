import { describe, it, expect, afterEach } from "vitest";
import { isAlertSmtpConfigured } from "../../server/alerts.js";

const KEY = "ALERT_SMTP_URL";

describe("isAlertSmtpConfigured", () => {
  const previous = process.env[KEY];

  afterEach(() => {
    if (previous === undefined) delete process.env[KEY];
    else process.env[KEY] = previous;
  });

  it("is false when ALERT_SMTP_URL is unset", () => {
    delete process.env[KEY];
    expect(isAlertSmtpConfigured()).toBe(false);
  });

  it("is false when ALERT_SMTP_URL is blank or whitespace", () => {
    process.env[KEY] = "";
    expect(isAlertSmtpConfigured()).toBe(false);
    process.env[KEY] = "   \n\t";
    expect(isAlertSmtpConfigured()).toBe(false);
  });

  it("is true when ALERT_SMTP_URL has a URL, ignoring surrounding whitespace", () => {
    process.env[KEY] = "  smtp://127.0.0.1:2525  ";
    expect(isAlertSmtpConfigured()).toBe(true);
  });
});
