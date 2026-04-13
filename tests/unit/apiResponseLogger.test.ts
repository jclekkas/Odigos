import { describe, it, expect } from "vitest";
import { buildApiLogLine } from "../../server/index.js";

describe("API response logger log-line construction", () => {
  it("successful response includes only method, path, status, duration", () => {
    const line = buildApiLogLine("GET", "/api/deals", 200, 42, { id: 1, email: "user@example.com", data: [1, 2, 3] });
    expect(line).toBe("GET /api/deals 200 in 42ms");
    expect(line).not.toContain("email");
    expect(line).not.toContain("user@example.com");
    expect(line).not.toContain("data");
  });

  it("successful response with no captured body includes only safe metadata", () => {
    const line = buildApiLogLine("POST", "/api/analyze", 201, 100, undefined);
    expect(line).toBe("POST /api/analyze 201 in 100ms");
  });

  it("successful response body is never included in log line", () => {
    const body = { name: "John Doe", ssn: "123-45-6789", results: { score: 99 } };
    const line = buildApiLogLine("GET", "/api/metrics", 200, 15, body);
    expect(line).not.toContain("John Doe");
    expect(line).not.toContain("123-45-6789");
    expect(line).not.toContain("results");
    expect(line).not.toContain("score");
    expect(line).not.toContain(JSON.stringify(body));
  });

  it("error response appends sanitized message string when present", () => {
    const line = buildApiLogLine("POST", "/api/analyze", 400, 10, { message: "Invalid input" });
    expect(line).toBe("POST /api/analyze 400 in 10ms :: Invalid input");
  });

  it("error response appends sanitized error string when message absent", () => {
    const line = buildApiLogLine("GET", "/api/deals", 404, 5, { error: "Not found" });
    expect(line).toBe("GET /api/deals 404 in 5ms :: Not found");
  });

  it("error response prefers message over error when both present", () => {
    const line = buildApiLogLine("DELETE", "/api/resource", 403, 8, { message: "Forbidden", error: "Access denied" });
    expect(line).toContain("Forbidden");
    expect(line).not.toContain("Access denied");
  });

  it("error response does not include full body when message is not a string", () => {
    const body = { message: { nested: "object" }, code: 400 };
    const line = buildApiLogLine("POST", "/api/track", 500, 20, body);
    expect(line).toBe("POST /api/track 500 in 20ms");
    expect(line).not.toContain("nested");
    expect(line).not.toContain(JSON.stringify(body));
  });

  it("error response does not include arrays in log", () => {
    const body = { errors: ["field1 required", "field2 invalid"], message: ["arr1", "arr2"] };
    const line = buildApiLogLine("POST", "/api/checkout", 422, 12, body);
    expect(line).toBe("POST /api/checkout 422 in 12ms");
    expect(line).not.toContain("field1");
    expect(line).not.toContain("arr1");
  });

  it("error response with no safe string logs only metadata", () => {
    const line = buildApiLogLine("GET", "/api/extract-text", 500, 30, { code: 500, stack: "Error\n  at fn (file.ts:1)" });
    expect(line).toBe("GET /api/extract-text 500 in 30ms");
    expect(line).not.toContain("stack");
    expect(line).not.toContain("Error");
  });

  it("error response with undefined captured body logs only metadata", () => {
    const line = buildApiLogLine("PATCH", "/api/user", 401, 7, undefined);
    expect(line).toBe("PATCH /api/user 401 in 7ms");
  });
});
