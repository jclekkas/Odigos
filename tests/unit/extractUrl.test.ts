import { describe, it, expect } from "vitest";
import { extractTextFromUrl } from "../../server/extractText";

describe("extractTextFromUrl", () => {
  it("rejects invalid URL format", async () => {
    await expect(extractTextFromUrl("not-a-url")).rejects.toThrow("Invalid URL");
  });

  it("rejects non-HTTP protocols", async () => {
    await expect(extractTextFromUrl("ftp://example.com")).rejects.toThrow("Only HTTP and HTTPS");
  });

  it("rejects localhost URLs", async () => {
    await expect(extractTextFromUrl("http://localhost:3000/listing")).rejects.toThrow("Internal URLs");
  });

  it("rejects 127.0.0.1 URLs", async () => {
    await expect(extractTextFromUrl("http://127.0.0.1/listing")).rejects.toThrow("Internal URLs");
  });

  it("rejects private IP ranges (10.x)", async () => {
    await expect(extractTextFromUrl("http://10.0.0.1/listing")).rejects.toThrow("Internal URLs");
  });

  it("rejects private IP ranges (192.168.x)", async () => {
    await expect(extractTextFromUrl("http://192.168.1.1/listing")).rejects.toThrow("Internal URLs");
  });

  it("rejects 0.0.0.0", async () => {
    await expect(extractTextFromUrl("http://0.0.0.0/listing")).rejects.toThrow("Internal URLs");
  });

  it("rejects IPv6 loopback", async () => {
    await expect(extractTextFromUrl("http://[::1]/listing")).rejects.toThrow("Internal URLs");
  });
});
