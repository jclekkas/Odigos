import { describe, it, expect, vi, afterEach } from "vitest";
import { extractTextFromUrl } from "../../server/extractText.js";

describe("extractTextFromUrl — URL validation", () => {
  it("rejects invalid URL format", async () => {
    await expect(extractTextFromUrl("not-a-url")).rejects.toThrow("Invalid URL");
  });

  it("rejects empty string", async () => {
    await expect(extractTextFromUrl("")).rejects.toThrow("Invalid URL");
  });

  it("rejects non-HTTP protocols (ftp)", async () => {
    await expect(extractTextFromUrl("ftp://example.com")).rejects.toThrow("Only HTTP and HTTPS");
  });

  it("rejects file:// protocol", async () => {
    await expect(extractTextFromUrl("file:///etc/passwd")).rejects.toThrow("Only HTTP and HTTPS");
  });

  it("rejects javascript: protocol", async () => {
    await expect(extractTextFromUrl("javascript:alert(1)")).rejects.toThrow("Only HTTP and HTTPS");
  });

  it("rejects data: protocol", async () => {
    await expect(extractTextFromUrl("data:text/html,<h1>x</h1>")).rejects.toThrow("Only HTTP and HTTPS");
  });
});

describe("extractTextFromUrl — SSRF protection", () => {
  it("rejects localhost URLs", async () => {
    await expect(extractTextFromUrl("http://localhost:3000/listing")).rejects.toThrow("Internal URLs");
  });

  it("rejects localhost URLs regardless of case", async () => {
    await expect(extractTextFromUrl("http://LOCALHOST/listing")).rejects.toThrow("Internal URLs");
  });

  it("rejects 127.0.0.1 URLs", async () => {
    await expect(extractTextFromUrl("http://127.0.0.1/listing")).rejects.toThrow("Internal URLs");
  });

  it("rejects private IP ranges (10.x)", async () => {
    await expect(extractTextFromUrl("http://10.0.0.1/listing")).rejects.toThrow("Internal URLs");
  });

  it("rejects private IP ranges (10.255.255.255)", async () => {
    await expect(extractTextFromUrl("http://10.255.255.255/listing")).rejects.toThrow("Internal URLs");
  });

  it("rejects private IP ranges (192.168.x)", async () => {
    await expect(extractTextFromUrl("http://192.168.1.1/listing")).rejects.toThrow("Internal URLs");
  });

  it("rejects private IP ranges (172.16.x — RFC 1918)", async () => {
    await expect(extractTextFromUrl("http://172.16.0.1/listing")).rejects.toThrow("Internal URLs");
  });

  it("rejects private IP ranges (172.31.x — upper end of RFC 1918 /12)", async () => {
    await expect(extractTextFromUrl("http://172.31.255.254/listing")).rejects.toThrow("Internal URLs");
  });

  it("rejects 0.0.0.0", async () => {
    await expect(extractTextFromUrl("http://0.0.0.0/listing")).rejects.toThrow("Internal URLs");
  });

  it("rejects IPv6 loopback", async () => {
    await expect(extractTextFromUrl("http://[::1]/listing")).rejects.toThrow("Internal URLs");
  });

  // ── Gaps found in the original denylist ────────────────────────────────────
  // It checked hostname prefixes only, so the cloud metadata endpoint, the
  // rest of the loopback range, alternative IP encodings and most IPv6 forms
  // all walked straight through.

  it("rejects the cloud metadata endpoint", async () => {
    await expect(extractTextFromUrl("http://169.254.169.254/latest/meta-data/")).rejects.toThrow(
      "Internal URLs",
    );
  });

  it("rejects link-local addresses generally", async () => {
    await expect(extractTextFromUrl("http://169.254.1.1/")).rejects.toThrow("Internal URLs");
  });

  it("rejects loopback addresses other than 127.0.0.1", async () => {
    await expect(extractTextFromUrl("http://127.0.0.2/listing")).rejects.toThrow("Internal URLs");
    await expect(extractTextFromUrl("http://127.1.2.3/listing")).rejects.toThrow("Internal URLs");
  });

  it("rejects carrier-grade NAT space", async () => {
    await expect(extractTextFromUrl("http://100.64.0.1/listing")).rejects.toThrow("Internal URLs");
  });

  it("rejects decimal-encoded loopback", async () => {
    await expect(extractTextFromUrl("http://2130706433/listing")).rejects.toThrow("Internal URLs");
  });

  it("rejects hex-encoded loopback", async () => {
    await expect(extractTextFromUrl("http://0x7f000001/listing")).rejects.toThrow("Internal URLs");
  });

  it("rejects IPv4-mapped IPv6 loopback", async () => {
    await expect(extractTextFromUrl("http://[::ffff:127.0.0.1]/listing")).rejects.toThrow(
      "Internal URLs",
    );
  });

  it("rejects IPv6 unique-local and link-local addresses", async () => {
    await expect(extractTextFromUrl("http://[fd00::1]/listing")).rejects.toThrow("Internal URLs");
    await expect(extractTextFromUrl("http://[fe80::1]/listing")).rejects.toThrow("Internal URLs");
  });

  it("rejects credentials embedded in the URL", async () => {
    await expect(extractTextFromUrl("http://user:pass@example.com/listing")).rejects.toThrow(
      "Internal URLs",
    );
  });

  it("rejects a .localhost hostname", async () => {
    await expect(extractTextFromUrl("http://api.localhost/listing")).rejects.toThrow(
      "Internal URLs",
    );
  });

  it("still allows a public address", async () => {
    // 93.184.216.34 is a public IP literal, so no DNS is involved.
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => null },
        text: () => Promise.resolve("<html><main>Price $20,000 OTD</main></html>"),
      }),
    );
    await expect(extractTextFromUrl("http://93.184.216.34/listing")).resolves.toContain(
      "$20,000",
    );
    vi.unstubAllGlobals();
  });
});

describe("extractTextFromUrl — redirect handling", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function redirectThen(location: string, finalHtml = "<main>ok $1</main>") {
    let call = 0;
    return vi.fn().mockImplementation(() => {
      call += 1;
      if (call === 1) {
        return Promise.resolve({
          ok: false,
          status: 302,
          headers: { get: (n: string) => (n.toLowerCase() === "location" ? location : null) },
          text: () => Promise.resolve(""),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: { get: () => null },
        text: () => Promise.resolve(finalHtml),
      });
    });
  }

  // This is the bypass that made the denylist above decorative: the original
  // code passed redirect:"follow" to fetch, so only the FIRST url was ever
  // checked. Any external page could bounce the server to an internal address
  // and the body came back to the caller.
  it("re-checks the destination when a page redirects to the metadata endpoint", async () => {
    vi.stubGlobal("fetch", redirectThen("http://169.254.169.254/latest/meta-data/"));
    await expect(extractTextFromUrl("https://93.184.216.34/listing")).rejects.toThrow(
      "Internal URLs",
    );
  });

  it("re-checks the destination when a page redirects to localhost", async () => {
    vi.stubGlobal("fetch", redirectThen("http://127.0.0.1:5000/admin"));
    await expect(extractTextFromUrl("https://93.184.216.34/listing")).rejects.toThrow(
      "Internal URLs",
    );
  });

  it("blocks a relative redirect that lands on a blocked scheme", async () => {
    vi.stubGlobal("fetch", redirectThen("file:///etc/passwd"));
    await expect(extractTextFromUrl("https://93.184.216.34/listing")).rejects.toThrow(
      "Only HTTP and HTTPS",
    );
  });

  it("follows a redirect to another public address", async () => {
    vi.stubGlobal("fetch", redirectThen("http://93.184.216.35/moved", "<main>Deal $9,000</main>"));
    await expect(extractTextFromUrl("https://93.184.216.34/listing")).resolves.toContain("$9,000");
  });

  it("gives up after too many redirects", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 302,
        headers: {
          get: (n: string) =>
            n.toLowerCase() === "location" ? "http://93.184.216.34/loop" : null,
        },
        text: () => Promise.resolve(""),
      }),
    );
    await expect(extractTextFromUrl("https://93.184.216.34/listing")).rejects.toThrow(
      "Too many redirects",
    );
  });
});

describe("extractTextFromUrl — successful extraction", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function mockHtmlFetch(html: string, headers: Record<string, string> = {}) {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: {
          get: (name: string) => headers[name.toLowerCase()] ?? null,
        },
        text: () => Promise.resolve(html),
      }),
    );
  }

  it("extracts main content text and collapses whitespace", async () => {
    mockHtmlFetch(
      "<html><body><main>   2024 Honda   Civic\nOTD $28,500\n\nAPR 3.9% for 60 months.  </main></body></html>",
    );
    const text = await extractTextFromUrl("https://example.com/listing");
    expect(text).toBe("2024 Honda Civic OTD $28,500 APR 3.9% for 60 months.");
  });

  it("strips script, style, nav, footer, header, iframe, and svg tags", async () => {
    mockHtmlFetch(
      `<html><body>
        <header>Header junk</header>
        <nav>Nav junk</nav>
        <script>window.x = 1;</script>
        <style>.a { color: red }</style>
        <iframe src="x"></iframe>
        <svg><circle/></svg>
        <main>Keep this $30,000 OTD</main>
        <footer>Footer junk</footer>
      </body></html>`,
    );
    const text = await extractTextFromUrl("https://example.com/listing");
    expect(text).toBe("Keep this $30,000 OTD");
    expect(text).not.toContain("Header junk");
    expect(text).not.toContain("Nav junk");
    expect(text).not.toContain("window.x");
    expect(text).not.toContain("color: red");
    expect(text).not.toContain("Footer junk");
  });

  it("falls back to document.body when no main/article/content container exists", async () => {
    mockHtmlFetch(
      "<html><body><div>Price: $25,000</div><p>APR 4.5%</p></body></html>",
    );
    const text = await extractTextFromUrl("https://example.com/listing");
    expect(text).toContain("Price: $25,000");
    expect(text).toContain("APR 4.5%");
  });

  it("rejects when content-length header exceeds the 5MB cap", async () => {
    mockHtmlFetch("<html></html>", { "content-length": String(6 * 1024 * 1024) });
    await expect(extractTextFromUrl("https://example.com/big")).rejects.toThrow(
      "too large",
    );
  });

  it("rejects when fetched HTML body exceeds the 5MB cap", async () => {
    const huge = "<main>" + "a".repeat(6 * 1024 * 1024) + "</main>";
    mockHtmlFetch(huge);
    await expect(extractTextFromUrl("https://example.com/huge")).rejects.toThrow(
      "too large",
    );
  });

  it("rejects when upstream returns a non-2xx status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        headers: { get: () => null },
        text: () => Promise.resolve("<html></html>"),
      }),
    );
    await expect(extractTextFromUrl("https://example.com/missing")).rejects.toThrow(
      /Failed to fetch URL.*404/,
    );
  });

  it("sets a descriptive User-Agent header on outbound fetch", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      text: () => Promise.resolve("<html><main>ok $10</main></html>"),
    });
    vi.stubGlobal("fetch", fetchMock);

    await extractTextFromUrl("https://example.com/listing");

    const callArgs = fetchMock.mock.calls[0];
    expect(callArgs[0]).toBe("https://example.com/listing");
    const init = callArgs[1] as { headers: Record<string, string> };
    expect(init.headers["User-Agent"]).toMatch(/Odigos/);
  });
});
