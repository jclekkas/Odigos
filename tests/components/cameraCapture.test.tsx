// @vitest-environment jsdom
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { HelmetProvider } from "react-helmet-async";
import Home from "../../client/src/pages/home";
import { getQueryFn } from "../../client/src/lib/queryClient";

vi.stubEnv("NODE_ENV", "test");

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        queryFn: getQueryFn({ on401: "returnNull" }),
        retry: false,
        staleTime: 0,
      },
      mutations: { retry: false },
    },
  });
}

function renderHome(queryClient = makeQueryClient()) {
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Home />
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

const mockStripeStatus = { configured: false };
const mockStatsCount = { count: 42, type: "none" };

function setupFetchMock(extractResponse?: { ok: boolean; status: number; body: object }) {
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string, opts?: RequestInit) => {
      if (url.includes("stripe-status")) {
        return Promise.resolve({
          ok: true, status: 200,
          json: () => Promise.resolve(mockStripeStatus),
          text: () => Promise.resolve(JSON.stringify(mockStripeStatus)),
        });
      }
      if (url.includes("stats")) {
        return Promise.resolve({
          ok: true, status: 200,
          json: () => Promise.resolve(mockStatsCount),
          text: () => Promise.resolve(JSON.stringify(mockStatsCount)),
        });
      }
      if (url.includes("/api/extract-text") && extractResponse) {
        return Promise.resolve({
          ok: extractResponse.ok,
          status: extractResponse.status,
          json: () => Promise.resolve(extractResponse.body),
          text: () => Promise.resolve(JSON.stringify(extractResponse.body)),
        });
      }
      return Promise.resolve({
        ok: true, status: 200,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve("{}"),
      });
    })
  );
}

/** Override matchMedia to simulate mobile viewport (<768px). */
function mockMobileViewport() {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 375 });
  window.matchMedia = vi.fn().mockImplementation((query: string) => {
    const matches = query.includes("max-width") && query.includes("767");
    return {
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  });
}

/** Override matchMedia to simulate desktop viewport (>=768px). */
function mockDesktopViewport() {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1280 });
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function createFakeImageFile(name = "photo.jpg", type = "image/jpeg", sizeKB = 50): File {
  const buffer = new ArrayBuffer(sizeKB * 1024);
  return new File([buffer], name, { type });
}

beforeEach(() => {
  localStorage.setItem("odigos_upload_consent", "accepted");
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Mobile-only UI exposure ─────────────────────────────────────────────────

describe("Mobile-only camera UI", () => {
  it("shows camera capture button on mobile", async () => {
    mockMobileViewport();
    setupFetchMock();
    renderHome();
    const cameraBtn = await screen.findByTestId("button-camera-capture");
    expect(cameraBtn).toBeInTheDocument();
  });

  it("shows upload button on mobile", async () => {
    mockMobileViewport();
    setupFetchMock();
    renderHome();
    const uploadBtn = await screen.findByTestId("button-upload-file");
    expect(uploadBtn).toBeInTheDocument();
  });

  it("shows textarea immediately on mobile (no tab switch needed)", async () => {
    mockMobileViewport();
    setupFetchMock();
    renderHome();
    const textarea = await screen.findByTestId("input-dealer-text");
    expect(textarea).toBeInTheDocument();
  });

  it("does NOT show camera button on desktop", async () => {
    mockDesktopViewport();
    setupFetchMock();
    renderHome();
    // Wait for the page to render the desktop tabs
    await screen.findByTestId("tabs-input-mode-list");
    expect(screen.queryByTestId("button-camera-capture")).not.toBeInTheDocument();
  });

  it("shows desktop tabs on desktop viewport", async () => {
    mockDesktopViewport();
    setupFetchMock();
    renderHome();
    const tabsList = await screen.findByTestId("tabs-input-mode-list");
    expect(tabsList).toBeInTheDocument();
  });

  it("does NOT show desktop tabs on mobile", async () => {
    mockMobileViewport();
    setupFetchMock();
    renderHome();
    await screen.findByTestId("button-camera-capture");
    expect(screen.queryByTestId("tabs-input-mode-list")).not.toBeInTheDocument();
  });

  it("camera input has capture='environment' attribute", async () => {
    mockMobileViewport();
    setupFetchMock();
    renderHome();
    const cameraInput = await screen.findByTestId("input-camera-capture");
    expect(cameraInput).toHaveAttribute("capture", "environment");
    expect(cameraInput).toHaveAttribute("accept", "image/*");
  });
});

// ─── Shared image-ingestion path ─────────────────────────────────────────────

describe("Shared image-ingestion pipeline", () => {
  it("camera capture triggers extract-text API", async () => {
    mockMobileViewport();
    setupFetchMock({ ok: true, status: 200, body: { text: "OTD $35,000. APR 4.9% for 60 months." } });
    renderHome();

    const cameraInput = await screen.findByTestId("input-camera-capture");
    const file = createFakeImageFile();
    fireEvent.change(cameraInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/extract-text"),
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("upload triggers the same extract-text API on mobile", async () => {
    mockMobileViewport();
    setupFetchMock({ ok: true, status: 200, body: { text: "Sale price $30,000." } });
    renderHome();

    const fileInput = await screen.findByTestId("input-file-upload");
    const file = createFakeImageFile("screenshot.png", "image/png");
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/extract-text"),
        expect.objectContaining({ method: "POST" })
      );
    });
  });
});

// ─── Successful OCR flow ─────────────────────────────────────────────────────

describe("Successful OCR flow", () => {
  it("populates textarea with extracted text after camera capture", async () => {
    mockMobileViewport();
    const extractedText = "OTD $35,000. APR 4.9% for 60 months. Doc fee $199.";
    setupFetchMock({ ok: true, status: 200, body: { text: extractedText } });
    renderHome();

    const cameraInput = await screen.findByTestId("input-camera-capture");
    fireEvent.change(cameraInput, { target: { files: [createFakeImageFile()] } });

    const textarea = await screen.findByTestId("input-dealer-text");
    await waitFor(() => {
      expect(textarea).toHaveValue(extractedText);
    });
  });

  it("shows success message after OCR extraction", async () => {
    mockMobileViewport();
    setupFetchMock({ ok: true, status: 200, body: { text: "OTD $35,000. APR 4.9% for 60 months." } });
    renderHome();

    const cameraInput = await screen.findByTestId("input-camera-capture");
    fireEvent.change(cameraInput, { target: { files: [createFakeImageFile()] } });

    const successMsg = await screen.findByTestId("text-ocr-success");
    expect(successMsg).toBeInTheDocument();
    expect(successMsg).toHaveTextContent("review and edit");
  });

  it("extracted text remains editable", async () => {
    mockMobileViewport();
    setupFetchMock({ ok: true, status: 200, body: { text: "OTD $35,000" } });
    const user = userEvent.setup();
    renderHome();

    const cameraInput = await screen.findByTestId("input-camera-capture");
    fireEvent.change(cameraInput, { target: { files: [createFakeImageFile()] } });

    const textarea = await screen.findByTestId("input-dealer-text");
    await waitFor(() => {
      expect(textarea).toHaveValue("OTD $35,000");
    });

    await user.click(textarea);
    await user.type(textarea, " plus doc fee $199");
    expect(textarea).toHaveValue("OTD $35,000 plus doc fee $199");
  });
});

// ─── Append vs replace behavior ──────────────────────────────────────────────

describe("Append vs replace behavior", () => {
  it("replaces empty textarea with OCR text", async () => {
    mockMobileViewport();
    setupFetchMock({ ok: true, status: 200, body: { text: "New OCR text here" } });
    renderHome();

    const textarea = await screen.findByTestId("input-dealer-text");
    expect(textarea).toHaveValue("");

    const cameraInput = await screen.findByTestId("input-camera-capture");
    fireEvent.change(cameraInput, { target: { files: [createFakeImageFile()] } });

    await waitFor(() => {
      expect(textarea).toHaveValue("New OCR text here");
    });
  });

  it("appends OCR text to existing content with separator", async () => {
    mockMobileViewport();
    setupFetchMock({ ok: true, status: 200, body: { text: "Second quote details" } });
    const user = userEvent.setup();
    renderHome();

    const textarea = await screen.findByTestId("input-dealer-text");
    await user.type(textarea, "First quote details");
    expect(textarea).toHaveValue("First quote details");

    const cameraInput = await screen.findByTestId("input-camera-capture");
    fireEvent.change(cameraInput, { target: { files: [createFakeImageFile()] } });

    await waitFor(() => {
      const val = (textarea as HTMLTextAreaElement).value;
      expect(val).toContain("First quote details");
      expect(val).toContain("Second quote details");
      expect(val).toContain("---");
    });
  });
});

// ─── Cancellation behavior ───────────────────────────────────────────────────

describe("Cancellation behavior", () => {
  it("returns to idle state when user cancels camera picker (no file selected)", async () => {
    mockMobileViewport();
    setupFetchMock();
    renderHome();

    const cameraInput = await screen.findByTestId("input-camera-capture");
    // Simulate cancellation: change event fires with no files
    fireEvent.change(cameraInput, { target: { files: [] } });

    // No error, no crash, camera button still functional
    const cameraBtn = await screen.findByTestId("button-camera-capture");
    expect(cameraBtn).toBeInTheDocument();
    expect(cameraBtn).not.toBeDisabled();

    // No error message should appear
    expect(screen.queryByTestId("text-upload-error")).not.toBeInTheDocument();

    // No success message either
    expect(screen.queryByTestId("text-ocr-success")).not.toBeInTheDocument();

    // Textarea remains intact
    const textarea = await screen.findByTestId("input-dealer-text");
    expect(textarea).toHaveValue("");
  });

  it("preserves existing textarea content when user cancels", async () => {
    mockMobileViewport();
    setupFetchMock();
    const user = userEvent.setup();
    renderHome();

    const textarea = await screen.findByTestId("input-dealer-text");
    await user.type(textarea, "Existing content");

    const cameraInput = await screen.findByTestId("input-camera-capture");
    fireEvent.change(cameraInput, { target: { files: [] } });

    expect(textarea).toHaveValue("Existing content");
    // No error or loading state from a cancellation
    expect(screen.queryByTestId("text-upload-error")).not.toBeInTheDocument();
  });

  it("cancellation after a previous error clears no additional state", async () => {
    mockMobileViewport();
    setupFetchMock({ ok: false, status: 500, body: { message: "Server error" } });
    renderHome();

    // First: trigger a real failure
    const cameraInput = await screen.findByTestId("input-camera-capture");
    fireEvent.change(cameraInput, { target: { files: [createFakeImageFile()] } });
    await screen.findByTestId("text-upload-error");

    // Then: cancel a second attempt (empty files)
    fireEvent.change(cameraInput, { target: { files: [] } });

    // Camera button should still be enabled for retry
    const cameraBtn = await screen.findByTestId("button-camera-capture");
    expect(cameraBtn).not.toBeDisabled();
  });
});

// ─── Invalid file handling ───────────────────────────────────────────────────

describe("Invalid file handling", () => {
  it("shows error for unsupported file type", async () => {
    mockMobileViewport();
    setupFetchMock();
    renderHome();

    const cameraInput = await screen.findByTestId("input-camera-capture");
    const badFile = new File(["data"], "doc.txt", { type: "text/plain" });
    fireEvent.change(cameraInput, { target: { files: [badFile] } });

    const error = await screen.findByTestId("text-upload-error");
    expect(error).toBeInTheDocument();
    expect(error).toHaveTextContent("file type");
  });

  it("keeps existing textarea content intact after invalid file", async () => {
    mockMobileViewport();
    setupFetchMock();
    const user = userEvent.setup();
    renderHome();

    const textarea = await screen.findByTestId("input-dealer-text");
    await user.type(textarea, "My dealer quote");

    const cameraInput = await screen.findByTestId("input-camera-capture");
    const badFile = new File(["data"], "doc.txt", { type: "text/plain" });
    fireEvent.change(cameraInput, { target: { files: [badFile] } });

    await screen.findByTestId("text-upload-error");
    expect(textarea).toHaveValue("My dealer quote");
  });

  it("shows error for file that is too large", async () => {
    mockMobileViewport();
    setupFetchMock();
    renderHome();

    // Images are capped at 15 MB (OpenAI Vision binary ceiling); anything
    // larger is rejected client-side before any upload attempt.
    const bigFile = createFakeImageFile("huge.jpg", "image/jpeg", 16 * 1024);
    const cameraInput = await screen.findByTestId("input-camera-capture");
    fireEvent.change(cameraInput, { target: { files: [bigFile] } });

    const error = await screen.findByTestId("text-upload-error");
    expect(error).toBeInTheDocument();
    expect(error).toHaveTextContent("too large");
  });
});

// ─── Empty OCR result ────────────────────────────────────────────────────────

describe("Empty OCR result", () => {
  it("shows failure message when OCR returns empty text", async () => {
    mockMobileViewport();
    setupFetchMock({ ok: true, status: 200, body: { text: "" } });
    renderHome();

    const cameraInput = await screen.findByTestId("input-camera-capture");
    fireEvent.change(cameraInput, { target: { files: [createFakeImageFile()] } });

    const error = await screen.findByTestId("text-upload-error");
    expect(error).toBeInTheDocument();
    expect(error).toHaveTextContent("couldn't read");
  });

  it("shows failure message when OCR returns whitespace-only text", async () => {
    mockMobileViewport();
    setupFetchMock({ ok: true, status: 200, body: { text: "   \n  " } });
    renderHome();

    const cameraInput = await screen.findByTestId("input-camera-capture");
    fireEvent.change(cameraInput, { target: { files: [createFakeImageFile()] } });

    const error = await screen.findByTestId("text-upload-error");
    expect(error).toBeInTheDocument();
  });

  it("does not show success state when OCR is empty", async () => {
    mockMobileViewport();
    setupFetchMock({ ok: true, status: 200, body: { text: "" } });
    renderHome();

    const cameraInput = await screen.findByTestId("input-camera-capture");
    fireEvent.change(cameraInput, { target: { files: [createFakeImageFile()] } });

    await screen.findByTestId("text-upload-error");
    expect(screen.queryByTestId("text-ocr-success")).not.toBeInTheDocument();
  });
});

// ─── OCR exception / timeout ─────────────────────────────────────────────────

describe("OCR exception / timeout", () => {
  it("shows error when OCR API returns server error", async () => {
    mockMobileViewport();
    setupFetchMock({ ok: false, status: 500, body: { message: "Internal server error" } });
    renderHome();

    const cameraInput = await screen.findByTestId("input-camera-capture");
    fireEvent.change(cameraInput, { target: { files: [createFakeImageFile()] } });

    const error = await screen.findByTestId("text-upload-error");
    expect(error).toBeInTheDocument();
  });

  it("shows error when network request fails entirely", async () => {
    mockMobileViewport();
    vi.stubGlobal("fetch", vi.fn((url: string) => {
      if (url.includes("stripe-status")) {
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(mockStripeStatus), text: () => Promise.resolve("{}") });
      }
      if (url.includes("stats")) {
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(mockStatsCount), text: () => Promise.resolve("{}") });
      }
      if (url.includes("/api/extract-text")) {
        return Promise.reject(new Error("Network failure"));
      }
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}), text: () => Promise.resolve("{}") });
    }));
    renderHome();

    const cameraInput = await screen.findByTestId("input-camera-capture");
    fireEvent.change(cameraInput, { target: { files: [createFakeImageFile()] } });

    const error = await screen.findByTestId("text-upload-error");
    expect(error).toBeInTheDocument();
    expect(error).toHaveTextContent("Something went wrong");
  });

  it("clears loading state after OCR failure", async () => {
    mockMobileViewport();
    setupFetchMock({ ok: false, status: 500, body: { message: "Server error" } });
    renderHome();

    const cameraInput = await screen.findByTestId("input-camera-capture");
    fireEvent.change(cameraInput, { target: { files: [createFakeImageFile()] } });

    await screen.findByTestId("text-upload-error");
    const cameraBtn = await screen.findByTestId("button-camera-capture");
    expect(cameraBtn).not.toBeDisabled();
  });

  it("preserves textarea content after OCR failure", async () => {
    mockMobileViewport();
    setupFetchMock({ ok: false, status: 500, body: { message: "Server error" } });
    const user = userEvent.setup();
    renderHome();

    const textarea = await screen.findByTestId("input-dealer-text");
    await user.type(textarea, "My existing deal notes");

    const cameraInput = await screen.findByTestId("input-camera-capture");
    fireEvent.change(cameraInput, { target: { files: [createFakeImageFile()] } });

    await screen.findByTestId("text-upload-error");
    expect(textarea).toHaveValue("My existing deal notes");
  });
});

// ─── Retry behavior after failure ────────────────────────────────────────────

describe("Retry behavior after failure", () => {
  it("allows successful retry after a failed OCR attempt", async () => {
    mockMobileViewport();
    let extractCallCount = 0;
    // Mock fetch to fail on first extract-text call, succeed on second
    vi.stubGlobal("fetch", vi.fn((url: string) => {
      if (url.includes("stripe-status")) {
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(mockStripeStatus), text: () => Promise.resolve("{}") });
      }
      if (url.includes("stats")) {
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(mockStatsCount), text: () => Promise.resolve("{}") });
      }
      if (url.includes("/api/extract-text")) {
        extractCallCount++;
        if (extractCallCount === 1) {
          return Promise.resolve({
            ok: false, status: 500,
            json: () => Promise.resolve({ message: "Server error" }),
            text: () => Promise.resolve("{}"),
          });
        }
        return Promise.resolve({
          ok: true, status: 200,
          json: () => Promise.resolve({ text: "Retry succeeded: OTD $35,000 with APR 4.9% for 60 months." }),
          text: () => Promise.resolve(JSON.stringify({ text: "Retry succeeded: OTD $35,000 with APR 4.9% for 60 months." })),
        });
      }
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}), text: () => Promise.resolve("{}") });
    }));
    renderHome();

    // First attempt: fails
    const cameraInput = await screen.findByTestId("input-camera-capture");
    fireEvent.change(cameraInput, { target: { files: [createFakeImageFile()] } });

    // Verify failure state
    await screen.findByTestId("text-upload-error");
    const cameraBtn = await screen.findByTestId("button-camera-capture");
    expect(cameraBtn).not.toBeDisabled();

    // Second attempt: succeeds (same fetch mock, different call count)
    const cameraInputRetry = await screen.findByTestId("input-camera-capture");
    fireEvent.change(cameraInputRetry, { target: { files: [createFakeImageFile("retry.jpg")] } });

    const textarea = await screen.findByTestId("input-dealer-text");
    await waitFor(() => {
      expect(textarea).toHaveValue("Retry succeeded: OTD $35,000 with APR 4.9% for 60 months.");
    });

    // Error should be cleared after successful retry
    expect(screen.queryByTestId("text-upload-error")).not.toBeInTheDocument();

    // Success message should appear
    await waitFor(() => {
      expect(screen.getByTestId("text-ocr-success")).toBeInTheDocument();
    });
  });

  it("allows retry after empty OCR result", async () => {
    mockMobileViewport();
    let extractCallCount = 0;
    // Mock fetch: first extract-text returns empty, second returns real text
    vi.stubGlobal("fetch", vi.fn((url: string) => {
      if (url.includes("stripe-status")) {
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(mockStripeStatus), text: () => Promise.resolve("{}") });
      }
      if (url.includes("stats")) {
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(mockStatsCount), text: () => Promise.resolve("{}") });
      }
      if (url.includes("/api/extract-text")) {
        extractCallCount++;
        if (extractCallCount === 1) {
          return Promise.resolve({
            ok: true, status: 200,
            json: () => Promise.resolve({ text: "" }),
            text: () => Promise.resolve(JSON.stringify({ text: "" })),
          });
        }
        return Promise.resolve({
          ok: true, status: 200,
          json: () => Promise.resolve({ text: "Now it worked: $28,995 OTD" }),
          text: () => Promise.resolve(JSON.stringify({ text: "Now it worked: $28,995 OTD" })),
        });
      }
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}), text: () => Promise.resolve("{}") });
    }));
    renderHome();

    // First attempt: empty OCR
    const cameraInput = await screen.findByTestId("input-camera-capture");
    fireEvent.change(cameraInput, { target: { files: [createFakeImageFile()] } });
    await screen.findByTestId("text-upload-error");
    expect(screen.queryByTestId("text-ocr-success")).not.toBeInTheDocument();

    // Second attempt: success
    const cameraInputRetry = await screen.findByTestId("input-camera-capture");
    fireEvent.change(cameraInputRetry, { target: { files: [createFakeImageFile("clearer.jpg")] } });

    const textarea = await screen.findByTestId("input-dealer-text");
    await waitFor(() => {
      expect(textarea).toHaveValue("Now it worked: $28,995 OTD");
    });
  });
});

// ─── Partial OCR result ──────────────────────────────────────────────────────

// Partial-OCR classification rule:
//
// Text is "partial" only when BOTH conditions are true:
//   1. Fewer than 30 characters (short)
//   2. Contains no digits (no numeric pricing content)
//
// Short strings WITH numbers (e.g. "$499 doc fee", "399/mo 3k down") are
// treated as successful — the source material was simply concise.
// Short strings WITHOUT numbers are likely OCR noise/junk.

describe("Partial OCR result", () => {
  it("flags short text with no numbers as partial", async () => {
    mockMobileViewport();
    // Short AND no digits → partial
    setupFetchMock({ ok: true, status: 200, body: { text: "see attached sheet" } });
    renderHome();

    const cameraInput = await screen.findByTestId("input-camera-capture");
    fireEvent.change(cameraInput, { target: { files: [createFakeImageFile()] } });

    const textarea = await screen.findByTestId("input-dealer-text");
    await waitFor(() => {
      expect(textarea).toHaveValue("see attached sheet");
    });

    const warning = await screen.findByTestId("text-upload-error");
    expect(warning).toBeInTheDocument();
    expect(warning).toHaveTextContent("small amount");
  });

  it("treats '$499 doc fee' as success, not partial", async () => {
    mockMobileViewport();
    // Short but contains a dollar amount → success
    setupFetchMock({ ok: true, status: 200, body: { text: "$499 doc fee" } });
    renderHome();

    const cameraInput = await screen.findByTestId("input-camera-capture");
    fireEvent.change(cameraInput, { target: { files: [createFakeImageFile()] } });

    const textarea = await screen.findByTestId("input-dealer-text");
    await waitFor(() => {
      expect(textarea).toHaveValue("$499 doc fee");
    });

    // Should be success, not partial — no warning shown
    expect(screen.queryByTestId("text-upload-error")).not.toBeInTheDocument();
    await screen.findByTestId("text-ocr-success");
  });

  it("treats '399/mo 3k down' as success, not partial", async () => {
    mockMobileViewport();
    setupFetchMock({ ok: true, status: 200, body: { text: "399/mo 3k down" } });
    renderHome();

    const cameraInput = await screen.findByTestId("input-camera-capture");
    fireEvent.change(cameraInput, { target: { files: [createFakeImageFile()] } });

    const textarea = await screen.findByTestId("input-dealer-text");
    await waitFor(() => {
      expect(textarea).toHaveValue("399/mo 3k down");
    });

    expect(screen.queryByTestId("text-upload-error")).not.toBeInTheDocument();
    await screen.findByTestId("text-ocr-success");
  });

  it("treats 'OTD 32,800' as success, not partial", async () => {
    mockMobileViewport();
    setupFetchMock({ ok: true, status: 200, body: { text: "OTD 32,800" } });
    renderHome();

    const cameraInput = await screen.findByTestId("input-camera-capture");
    fireEvent.change(cameraInput, { target: { files: [createFakeImageFile()] } });

    const textarea = await screen.findByTestId("input-dealer-text");
    await waitFor(() => {
      expect(textarea).toHaveValue("OTD 32,800");
    });

    expect(screen.queryByTestId("text-upload-error")).not.toBeInTheDocument();
    await screen.findByTestId("text-ocr-success");
  });

  it("still flags short non-numeric junk text as partial", async () => {
    mockMobileViewport();
    // Junk OCR noise with no pricing content
    setupFetchMock({ ok: true, status: 200, body: { text: "blurry text here" } });
    renderHome();

    const cameraInput = await screen.findByTestId("input-camera-capture");
    fireEvent.change(cameraInput, { target: { files: [createFakeImageFile()] } });

    const textarea = await screen.findByTestId("input-dealer-text");
    await waitFor(() => {
      expect(textarea).toHaveValue("blurry text here");
    });

    const warning = await screen.findByTestId("text-upload-error");
    expect(warning).toBeInTheDocument();
    expect(warning).toHaveTextContent("small amount");
  });
});

// ─── Accessibility basics ────────────────────────────────────────────────────

describe("Accessibility basics", () => {
  it("camera button has accessible aria-label", async () => {
    mockMobileViewport();
    setupFetchMock();
    renderHome();

    const cameraBtn = await screen.findByTestId("button-camera-capture");
    expect(cameraBtn).toHaveAttribute("aria-label");
  });

  it("camera file input has aria-label", async () => {
    mockMobileViewport();
    setupFetchMock();
    renderHome();

    const cameraInput = await screen.findByTestId("input-camera-capture");
    expect(cameraInput).toHaveAttribute("aria-label");
  });

  it("upload error message has role=alert", async () => {
    mockMobileViewport();
    setupFetchMock({ ok: false, status: 500, body: { message: "Error" } });
    renderHome();

    const cameraInput = await screen.findByTestId("input-camera-capture");
    fireEvent.change(cameraInput, { target: { files: [createFakeImageFile()] } });

    const error = await screen.findByTestId("text-upload-error");
    expect(error).toHaveAttribute("role", "alert");
  });

  it("success message has role=status", async () => {
    mockMobileViewport();
    setupFetchMock({ ok: true, status: 200, body: { text: "OTD $35,000. APR 4.9% for 60 months." } });
    renderHome();

    const cameraInput = await screen.findByTestId("input-camera-capture");
    fireEvent.change(cameraInput, { target: { files: [createFakeImageFile()] } });

    const success = await screen.findByTestId("text-ocr-success");
    expect(success).toHaveAttribute("role", "status");
  });

  it("camera and upload buttons meet minimum tap target size (48px)", async () => {
    mockMobileViewport();
    setupFetchMock();
    renderHome();

    const cameraBtn = await screen.findByTestId("button-camera-capture");
    expect(cameraBtn.className).toContain("min-h-[48px]");

    const uploadBtn = await screen.findByTestId("button-upload-file");
    expect(uploadBtn.className).toContain("min-h-[48px]");
  });
});

// ─── Source field propagation ────────────────────────────────────────────────

describe("Source field propagation", () => {
  it("camera capture sets source to 'camera' and submits it to the API", async () => {
    mockMobileViewport();
    const extractedText = "OTD $35,000. APR 4.9% for 60 months.";
    // Mock both extract-text and analyze endpoints
    vi.stubGlobal("fetch", vi.fn((url: string, opts?: RequestInit) => {
      if (url.includes("stripe-status")) {
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(mockStripeStatus), text: () => Promise.resolve("{}") });
      }
      if (url.includes("stats")) {
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(mockStatsCount), text: () => Promise.resolve("{}") });
      }
      if (url.includes("/api/extract-text")) {
        return Promise.resolve({
          ok: true, status: 200,
          json: () => Promise.resolve({ text: extractedText }),
          text: () => Promise.resolve(JSON.stringify({ text: extractedText })),
        });
      }
      if (url.includes("/api/analyze") && opts?.method === "POST") {
        // Capture the payload and verify source field
        const body = JSON.parse(opts.body as string);
        expect(body.source).toBe("camera");
        return Promise.resolve({
          ok: true, status: 200,
          json: () => Promise.resolve({
            dealScore: "GREEN", confidenceLevel: "HIGH", verdictLabel: "GO",
            goNoGo: "GO", summary: "OK", detectedFields: {
              salePrice: 35000, msrp: null, rebates: null, fees: [],
              outTheDoorPrice: 35000, monthlyPayment: null, tradeInValue: null,
              apr: 4.9, termMonths: 60, downPayment: null,
            },
            missingInfo: [], suggestedReply: "", reasoning: "", docFeeCapCheck: null,
          }),
          text: () => Promise.resolve("{}"),
        });
      }
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}), text: () => Promise.resolve("{}") });
    }));
    const user = userEvent.setup();
    renderHome();

    // Camera capture → OCR fills textarea
    const cameraInput = await screen.findByTestId("input-camera-capture");
    fireEvent.change(cameraInput, { target: { files: [createFakeImageFile()] } });
    const textarea = await screen.findByTestId("input-dealer-text");
    await waitFor(() => {
      expect(textarea).toHaveValue(extractedText);
    });

    // Submit the form — the assertion on body.source is inside the fetch mock above
    const analyzeBtn = await screen.findByTestId("button-analyze");
    await user.click(analyzeBtn);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/analyze"),
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("standard upload sets source to 'upload', not 'camera'", async () => {
    mockMobileViewport();
    vi.stubGlobal("fetch", vi.fn((url: string, opts?: RequestInit) => {
      if (url.includes("stripe-status")) {
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(mockStripeStatus), text: () => Promise.resolve("{}") });
      }
      if (url.includes("stats")) {
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(mockStatsCount), text: () => Promise.resolve("{}") });
      }
      if (url.includes("/api/extract-text")) {
        return Promise.resolve({
          ok: true, status: 200,
          json: () => Promise.resolve({ text: "Upload text here for testing." }),
          text: () => Promise.resolve(JSON.stringify({ text: "Upload text here for testing." })),
        });
      }
      if (url.includes("/api/analyze") && opts?.method === "POST") {
        const body = JSON.parse(opts.body as string);
        expect(body.source).toBe("upload");
        return Promise.resolve({
          ok: true, status: 200,
          json: () => Promise.resolve({
            dealScore: "GREEN", confidenceLevel: "HIGH", verdictLabel: "GO",
            goNoGo: "GO", summary: "OK", detectedFields: {
              salePrice: 30000, msrp: null, rebates: null, fees: [],
              outTheDoorPrice: 30000, monthlyPayment: null, tradeInValue: null,
              apr: null, termMonths: null, downPayment: null,
            },
            missingInfo: [], suggestedReply: "", reasoning: "", docFeeCapCheck: null,
          }),
          text: () => Promise.resolve("{}"),
        });
      }
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}), text: () => Promise.resolve("{}") });
    }));
    const user = userEvent.setup();
    renderHome();

    // Use the upload input (not camera)
    const fileInput = await screen.findByTestId("input-file-upload");
    fireEvent.change(fileInput, { target: { files: [createFakeImageFile("screenshot.png", "image/png")] } });
    const textarea = await screen.findByTestId("input-dealer-text");
    await waitFor(() => {
      expect(textarea).toHaveValue("Upload text here for testing.");
    });

    const analyzeBtn = await screen.findByTestId("button-analyze");
    await user.click(analyzeBtn);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/analyze"),
        expect.objectContaining({ method: "POST" })
      );
    });
  });
});
