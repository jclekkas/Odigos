import { describe, expect, it, vi } from "vitest";
import {
  NHTSA_VPIC_ORIGIN,
  checkVin,
  findVin,
  isPlausibleVin,
  vpicDecodeVinValuesUrl,
  type NhtsaFetch,
} from "../../server/nhtsaVin.js";

const VIN = "4T1G11AK5NU123456";

function payload(row: Record<string, string>) {
  return {
    Count: 1,
    Message: "Results returned successfully. NOTE: Any missing decoded values should be interpreted as NHTSA does not have data on the specific variable. Missing value should NOT be interpreted as an indication that a feature or technology is unavailable for a vehicle.",
    SearchCriteria: `VIN(s): ${VIN}`,
    Results: [
      {
        ModelYear: "2023",
        Make: "TOYOTA",
        Model: "Camry",
        Trim: "LE",
        Trim2: "",
        Series: "70 Series",
        BasePrice: "",
        ErrorCode: "0",
        ErrorText: "0 - VIN decoded clean. Check Digit (9th position) is correct",
        ...row,
      },
    ],
  };
}

function fetchOk(body: unknown): NhtsaFetch {
  return vi.fn(async (url: string) => {
    expect(url.startsWith(`${NHTSA_VPIC_ORIGIN}/api/vehicles/DecodeVinValues/`)).toBe(true);
    expect(url).toContain("format=json");
    expect(url.toLowerCase()).not.toContain("api_key");
    expect(url.toLowerCase()).not.toContain("apikey");
    return { ok: true, status: 200, text: async () => JSON.stringify(body) };
  });
}

const camryQuote = {
  year: 2025,
  make: "Toyota",
  model: "Camry XLE",
  vehicleText: "2025 Toyota Camry XLE",
};

describe("NHTSA vPIC VIN check", () => {
  it("builds the official DecodeVinValues URL and does not send an API key", () => {
    const url = vpicDecodeVinValuesUrl(VIN);
    expect(url).toBe(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${VIN}?format=json`);
    expect(isPlausibleVin(VIN)).toBe(true);
    expect(isPlausibleVin("123")).toBe(false);
  });

  it("flags a quote that says 2025 Camry XLE when the VIN decodes to a 2023 Camry LE", async () => {
    const fetchImpl = fetchOk(payload({}));
    const result = await checkVin({
      explicitVin: VIN,
      dealerText: "no vin here",
      identity: camryQuote,
      fetchImpl,
    });
    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(result.status).toBe("decoded");
    expect(result.source).toBe("nhtsa_vpic");
    expect(result.provenance).toBe("buyer-reported");
    expect(result.decoded).toMatchObject({ year: 2023, make: "TOYOTA", model: "Camry", trim: "LE" });
    expect(result.mismatches.map((item) => item.field)).toEqual(["year", "trim"]);
    expect(result.summary).toMatch(/2025 Toyota Camry XLE/i);
    expect(result.summary).toMatch(/2023/);
    expect(result.summary).toMatch(/Camry LE/i);
    expect(result.summary).toMatch(/not a market value/i);
    expect(result.basePrice).toBeNull();
  });

  it("matches the quote when year, make, model, and trim agree", async () => {
    const result = await checkVin({
      dealerText: `VIN ${VIN} is on the quote`,
      identity: { year: 2023, make: "Toyota", model: "Camry LE" },
      fetchImpl: fetchOk(payload({})),
    });
    expect(result.status).toBe("decoded");
    expect(result.provenance).toBe("quote");
    expect(result.mismatches).toEqual([]);
    expect(result.summary).toMatch(/matches the quote/i);
  });

  it("shows Base Price only when NHTSA sends one, labeled as standard equipment", async () => {
    const present = await checkVin({
      explicitVin: VIN,
      identity: { year: 2023, make: "Toyota", model: "Camry LE" },
      fetchImpl: fetchOk(payload({ BasePrice: "26320" })),
    });
    expect(present.basePrice).toMatchObject({
      amount: 26320,
      label: "Base price for standard equipment",
      citationStatus: "sourced",
    });
    expect(present.basePrice?.detail).toMatch(/not the MSRP with options/i);
    expect(present.basePrice?.detail).toMatch(/not a market value/i);
    expect(present.summary).toMatch(/standard equipment/i);

    const absent = await checkVin({
      explicitVin: VIN,
      identity: { year: 2023, make: "Toyota", model: "Camry LE" },
      fetchImpl: fetchOk(payload({ BasePrice: "" })),
    });
    expect(absent.basePrice).toBeNull();
    expect(absent.summary).not.toMatch(/\$0/);
  });

  it("keeps a check-digit warning and still returns the decoded vehicle", async () => {
    const result = await checkVin({
      explicitVin: VIN,
      identity: camryQuote,
      fetchImpl: fetchOk(payload({
        ErrorCode: "1",
        ErrorText: "1 - Check Digit (9th position) does not calculate properly",
      })),
    });
    expect(result.status).toBe("decoded");
    expect(result.mismatches.length).toBeGreaterThan(0);
    expect(result.summary).toMatch(/Check Digit/i);
  });

  it("fails gracefully when the decoder times out or returns garbage", async () => {
    const hanging: NhtsaFetch = (_url, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          const error = new Error("The operation was aborted");
          error.name = "AbortError";
          reject(error);
        });
      });
    const timedOut = await checkVin({
      explicitVin: VIN,
      identity: camryQuote,
      fetchImpl: hanging,
      timeoutMs: 15,
    });
    expect(timedOut.status).toBe("failed");
    expect(timedOut.decoded).toBeNull();
    expect(timedOut.basePrice).toBeNull();
    expect(timedOut.summary).toMatch(/timed out/i);
    expect(timedOut.summary).toMatch(/not a market value/i);

    const broken = await checkVin({
      explicitVin: VIN,
      identity: camryQuote,
      fetchImpl: async () => {
        throw new Error("network down");
      },
    });
    expect(broken.status).toBe("failed");
    expect(broken.summary).toMatch(/could not be completed/i);

    const notJson = await checkVin({
      explicitVin: VIN,
      identity: camryQuote,
      fetchImpl: async () => ({ ok: true, status: 200, text: async () => "<html>nope</html>" }),
    });
    expect(notJson.status).toBe("failed");
    expect(notJson.decoded).toBeNull();
  });

  it("does not call NHTSA for a VIN that is not 17 valid characters", async () => {
    const fetchImpl = vi.fn();
    const result = await checkVin({
      explicitVin: "123",
      dealerText: `A real VIN ${VIN} is also in the quote`,
      identity: camryQuote,
      fetchImpl,
    });
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(result.status).toBe("invalid");
    expect(result.provenance).toBe("buyer-reported");
    expect(findVin(undefined, `see ${VIN} here`).vin).toBe(VIN);
  });
});
