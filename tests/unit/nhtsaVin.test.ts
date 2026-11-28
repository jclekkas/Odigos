import { describe, expect, it, vi } from "vitest";
import {
  NHTSA_VPIC_ORIGIN,
  checkVin,
  compareDecodedVin,
  findVin,
  isPlausibleVin,
  vinCheckDigitIsValid,
  vinPositivelyAgrees,
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

  it("finds a lowercase VIN and uppercases it", () => {
    const located = findVin(undefined, "vin 4t1g11ak5nu123456 is on the quote");
    expect(located.vin).toBe(VIN);
    expect(located.provenance).toBe("quote");
    expect(located.conflictingVins).toEqual([]);
  });

  it("does not pick one VIN when the quote contains two", () => {
    const other = "1G4AH59H45G118341";
    const located = findVin(undefined, `VIN ${VIN} or vin ${other.toLowerCase()}`);
    expect(located.vin).toBeNull();
    expect(located.conflictingVins).toEqual([VIN, other]);
  });

  it("uses the check digit from 49 CFR 565.15 and does not treat Camry as Camry Hybrid", () => {
    expect(vinCheckDigitIsValid("1G4AH59H45G118341")).toBe(true);
    expect(vinCheckDigitIsValid("1G4AH59H55G118341")).toBe(false);
    expect(vinCheckDigitIsValid(VIN)).toBe(false);
    const ambiguous = compareDecodedVin(
      {
        year: 2023,
        make: "TOYOTA",
        model: "Camry Hybrid",
        trim: "LE",
        trim2: null,
        series: null,
        basePrice: null,
        errorCode: "0",
        errorText: "0 - VIN decoded clean. Check Digit (9th position) is correct",
      },
      { year: 2023, make: "Toyota", model: "Camry" },
    );
    expect(ambiguous.map((item) => item.field)).toEqual(["trim", "powertrain"]);
    expect(ambiguous).toEqual([
      { field: "trim", quoteValue: "not stated", decodedValue: "LE" },
      { field: "powertrain", quoteValue: "not stated", decodedValue: "hybrid" },
    ]);
  });
});

const CLEAN = "0 - VIN decoded clean. Check Digit (9th position) is correct";
const ACCORD_VIN = "1HGCM82633A004352";
const CAMRY_HYBRID_VIN = "4T1BD1FK7DU096294";

function nhtsaBody(vin: string, row: Record<string, string>) {
  return {
    Count: 1,
    Message: "Results returned successfully. NOTE: Any missing decoded values should be interpreted as NHTSA does not have data on the specific variable. Missing value should NOT be interpreted as an indication that a feature or technology is unavailable for a vehicle.",
    SearchCriteria: `VIN(s): ${vin}`,
    Results: [row],
  };
}

/** Fields taken from a live DecodeVinValues response for 1HGCM82633A004352. */
const ACCORD_ROW: Record<string, string> = {
  ModelYear: "2003",
  Make: "HONDA",
  Model: "Accord",
  Trim: "EX-V6",
  Trim2: "",
  Series: "",
  Series2: "",
  BodyClass: "Coupe",
  EngineCylinders: "6",
  EngineConfiguration: "V-Shaped",
  EngineModel: "J30A4",
  EngineHP: "240",
  DisplacementL: "2.998832712",
  FuelTypePrimary: "Gasoline",
  FuelTypeSecondary: "",
  ElectrificationLevel: "",
  BasePrice: "",
  ErrorCode: "0",
  ErrorText: CLEAN,
  VIN: ACCORD_VIN,
};

/** Fields taken from a live DecodeVinValues response for 4T1BD1FK7DU096294. */
const CAMRY_HYBRID_ROW: Record<string, string> = {
  ModelYear: "2013",
  Make: "TOYOTA",
  Model: "Camry",
  Trim: "Hybrid",
  Trim2: "",
  Series: "ASV50L/GSV50L/AVV50L",
  BodyClass: "Sedan/Saloon",
  EngineCylinders: "4",
  EngineConfiguration: "In-Line",
  EngineModel: "2AR-FXE+2JM",
  EngineHP: "156",
  DisplacementL: "2.5",
  FuelTypePrimary: "Gasoline",
  FuelTypeSecondary: "Electric",
  ElectrificationLevel: "Strong HEV (Hybrid Electric Vehicle)",
  BasePrice: "",
  ErrorCode: "0",
  ErrorText: CLEAN,
  VIN: CAMRY_HYBRID_VIN,
};

describe("model, trim, engine, and powertrain are separate dimensions", () => {
  it("matches a 2003 Accord EX-V6 quote to the NHTSA decode, including a lowercase VIN", async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      expect(url).toBe(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${ACCORD_VIN}?format=json`);
      expect(url).not.toContain(ACCORD_VIN.toLowerCase());
      return { ok: true, status: 200, text: async () => JSON.stringify(nhtsaBody(ACCORD_VIN, ACCORD_ROW)) };
    });
    const identity = {
      year: 2003,
      make: "Honda",
      model: "Accord EX-V6",
      vehicleText: "2003 Honda Accord EX-V6",
    };
    const result = await checkVin({
      explicitVin: ACCORD_VIN.toLowerCase(),
      dealerText: `vin ${ACCORD_VIN.toLowerCase()}`,
      identity,
      fetchImpl,
    });
    expect(vinCheckDigitIsValid(ACCORD_VIN)).toBe(true);
    expect(result.status).toBe("decoded");
    expect(result.vin).toBe(ACCORD_VIN);
    expect(result.mismatches).toEqual([]);
    expect(result.summary).toBe(
      "The VIN matches the quote (2003 Honda Accord EX-V6). NHTSA decoded this VIN. This is a vehicle identity check, not a market value.",
    );
    expect(vinPositivelyAgrees(result, identity).affirmative).toBe(true);
  });

  it("still matches when the NHTSA model field itself is Accord EX-V6", async () => {
    const identity = { year: 2003, make: "Honda", model: "Accord EX-V6" };
    const result = await checkVin({
      explicitVin: ACCORD_VIN,
      identity,
      fetchImpl: fetchOk(nhtsaBody(ACCORD_VIN, { ...ACCORD_ROW, Model: "Accord EX-V6", Trim: "" })),
    });
    expect(result.mismatches).toEqual([]);
    expect(result.summary).toMatch(/matches the quote \(2003 Honda Accord EX-V6\)/);
    expect(vinPositivelyAgrees(result, identity).affirmative).toBe(true);
  });

  it("does not treat Accord EX as Accord EX-V6", async () => {
    const result = await checkVin({
      explicitVin: ACCORD_VIN,
      identity: { year: 2003, make: "Honda", model: "Accord EX" },
      fetchImpl: fetchOk(nhtsaBody(ACCORD_VIN, ACCORD_ROW)),
    });
    expect(result.mismatches).toEqual([
      { field: "engine", quoteValue: "not stated", decodedValue: "V6" },
    ]);
    expect(result.summary).toBe(
      "The quote says 2003 Honda Accord EX, but the VIN decodes to a 2003 Honda Accord EX-V6. The mismatch is on engine. This is a vehicle identity check from NHTSA, not a market value.",
    );
    expect(vinPositivelyAgrees(result, { year: 2003, make: "Honda", model: "Accord EX" }).affirmative).toBe(false);
  });

  it("does not match a plain Camry quote to a Camry Hybrid decode", async () => {
    const identity = { year: 2013, make: "Toyota", model: "Camry", vehicleText: "2013 Toyota Camry" };
    const result = await checkVin({
      explicitVin: CAMRY_HYBRID_VIN,
      identity,
      fetchImpl: fetchOk(nhtsaBody(CAMRY_HYBRID_VIN, CAMRY_HYBRID_ROW)),
    });
    expect(vinCheckDigitIsValid(CAMRY_HYBRID_VIN)).toBe(true);
    expect(result.decoded).toMatchObject({
      year: 2013,
      make: "TOYOTA",
      model: "Camry",
      trim: "Hybrid",
      electrificationLevel: "Strong HEV (Hybrid Electric Vehicle)",
    });
    expect(result.mismatches).toEqual([
      { field: "powertrain", quoteValue: "not stated", decodedValue: "hybrid" },
    ]);
    expect(result.summary).toBe(
      "The quote says 2013 Toyota Camry, but the VIN decodes to a 2013 Toyota Camry Hybrid. The mismatch is on powertrain. This is a vehicle identity check from NHTSA, not a market value.",
    );
    expect(vinPositivelyAgrees(result, identity)).toEqual({
      affirmative: false,
      reason: "The VIN does not affirmatively match the quote on powertrain (quote not stated, VIN hybrid). A partial, ambiguous, or conflicting vehicle name is not a confirmed match.",
    });
  });

  it("matches a Camry Hybrid quote to that same decode", async () => {
    const identity = { year: 2013, make: "Toyota", model: "Camry Hybrid" };
    const result = await checkVin({
      explicitVin: CAMRY_HYBRID_VIN,
      identity,
      fetchImpl: fetchOk(nhtsaBody(CAMRY_HYBRID_VIN, CAMRY_HYBRID_ROW)),
    });
    expect(result.mismatches).toEqual([]);
    expect(result.summary).toMatch(/matches the quote \(2013 Toyota Camry Hybrid\)/);
    expect(vinPositivelyAgrees(result, identity).affirmative).toBe(true);
  });

  it("does not treat a missing trim or an unstated hybrid as agreement", async () => {
    const missingTrim = await checkVin({
      explicitVin: "1G4AH59H45G118341",
      identity: { year: 2023, make: "Toyota", model: "Camry" },
      fetchImpl: fetchOk(payload({})),
    });
    expect(missingTrim.mismatches).toEqual([
      { field: "trim", quoteValue: "not stated", decodedValue: "LE" },
    ]);
    expect(missingTrim.summary).toBe(
      "The quote says 2023 Toyota Camry, but the VIN decodes to a 2023 Toyota Camry LE. The mismatch is on trim. This is a vehicle identity check from NHTSA, not a market value.",
    );
    expect(vinPositivelyAgrees(missingTrim, { year: 2023, make: "Toyota", model: "Camry" }).affirmative).toBe(false);

    const unstatedHybrid = await checkVin({
      explicitVin: CAMRY_HYBRID_VIN,
      identity: { year: 2013, make: "Toyota", model: "Camry LE" },
      fetchImpl: fetchOk(nhtsaBody(CAMRY_HYBRID_VIN, { ...CAMRY_HYBRID_ROW, Trim: "LE" })),
    });
    expect(unstatedHybrid.mismatches).toEqual([
      { field: "powertrain", quoteValue: "not stated", decodedValue: "hybrid" },
    ]);
    expect(unstatedHybrid.summary).toBe(
      "The quote says 2013 Toyota Camry LE, but the VIN decodes to a 2013 Toyota Camry LE hybrid. The mismatch is on powertrain. This is a vehicle identity check from NHTSA, not a market value.",
    );
    expect(vinPositivelyAgrees(unstatedHybrid, { year: 2013, make: "Toyota", model: "Camry LE" }).affirmative).toBe(false);
  });

  it("does not treat a plain hybrid quote as a plug-in hybrid", async () => {
    const result = await checkVin({
      explicitVin: CAMRY_HYBRID_VIN,
      identity: { year: 2013, make: "Toyota", model: "Camry Hybrid" },
      fetchImpl: fetchOk(nhtsaBody(CAMRY_HYBRID_VIN, {
        ...CAMRY_HYBRID_ROW,
        Trim: "Plug-in Hybrid",
        ElectrificationLevel: "PHEV (Plug-in Hybrid Electric Vehicle)",
      })),
    });
    expect(result.mismatches).toEqual([
      { field: "powertrain", quoteValue: "hybrid", decodedValue: "plug-in hybrid" },
    ]);
    expect(vinPositivelyAgrees(result, { year: 2013, make: "Toyota", model: "Camry Hybrid" }).affirmative).toBe(false);
  });
});
