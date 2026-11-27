import { z } from "zod";

/**
 * Buyer-typed price checks and the NHTSA VIN identity check.
 *
 * Buyer-typed numbers are labeled buyer-reported. They are not an independent
 * market valuation. The VIN decode is a vehicle-identity check from NHTSA
 * vPIC, not a price benchmark.
 */

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => {
      const trimmed = value?.trim() ?? "";
      return trimmed === "" ? null : trimmed;
    });

export const buyerComparableSchema = z.object({
  askingPrice: z.number().finite().positive().max(2_000_000),
  url: optionalText(500),
  source: optionalText(80),
  mileage: z.number().int().nonnegative().max(1_000_000).nullish(),
});

export const buyerComparablesSchema = z.array(buyerComparableSchema).max(5);

export const buyerBookValueSchema = z.object({
  amount: z.number().finite().positive().max(2_000_000),
  sourceLabel: z.string().trim().min(1).max(80),
});

export const competingQuoteTextSchema = z.string().trim().min(1).max(20_000);

export const vinInputSchema = z
  .string()
  .trim()
  .max(24)
  .transform((value) => value.replace(/[\s-]/g, "").toUpperCase());

export const citationStatusSchema = z.enum(["sourced", "needs_source"]);

export const vinMismatchSchema = z.object({
  field: z.enum(["year", "make", "model", "trim"]),
  quoteValue: z.string(),
  decodedValue: z.string(),
});

export const vinBasePriceSchema = z.object({
  amount: z.number(),
  label: z.literal("Base price for standard equipment"),
  detail: z.string(),
  citation: z.string(),
  citationStatus: z.literal("sourced"),
});

export const vinCheckSchema = z.object({
  status: z.enum(["not_provided", "invalid", "decoded", "failed"]),
  provenance: z.enum(["buyer-reported", "quote"]).nullable(),
  source: z.enum(["nhtsa_vpic"]).nullable(),
  vin: z.string().nullable(),
  decoded: z
    .object({
      year: z.number().int().nullable(),
      make: z.string().nullable(),
      model: z.string().nullable(),
      trim: z.string().nullable(),
      trim2: z.string().nullable(),
      series: z.string().nullable(),
    })
    .nullable(),
  mismatches: z.array(vinMismatchSchema),
  basePrice: vinBasePriceSchema.nullable(),
  errorText: z.string().nullable(),
  summary: z.string(),
});

export const buyerCompPositionSchema = z.enum(["above_all", "inside", "below_all", "unavailable"]);

export const buyerReportedSchema = z.object({
  label: z.literal("buyer-reported"),
  verifiesMarketValue: z.literal(false),
  citationStatus: z.literal("needs_source"),
  comps: z
    .object({
      count: z.number().int(),
      min: z.number(),
      max: z.number(),
      median: z.number(),
      aboveCount: z.number().int(),
      position: buyerCompPositionSchema,
      listings: z.array(
        z.object({
          askingPrice: z.number(),
          url: z.string().nullable(),
          source: z.string().nullable(),
          mileage: z.number().nullable(),
        }),
      ),
      summary: z.string(),
    })
    .nullable(),
  bookValue: z
    .object({
      amount: z.number(),
      sourceLabel: z.string(),
      relation: z.enum(["above", "at_or_below", "unavailable"]),
      citationStatus: z.literal("needs_source"),
      summary: z.string(),
    })
    .nullable(),
  competingQuote: z
    .object({
      status: z.enum(["compared", "unparsed"]),
      citationStatus: z.literal("needs_source"),
      lines: z.array(
        z.object({
          key: z.enum(["sellingPrice", "docFee", "addOns", "taxAndFees", "outTheDoor"]),
          label: z.string(),
          thisQuote: z.number().nullable(),
          otherQuote: z.number().nullable(),
          detail: z.string().nullable(),
        }),
      ),
      summary: z.string(),
    })
    .nullable(),
  summary: z.string(),
});

export type BuyerComparableInput = z.infer<typeof buyerComparableSchema>;
export type BuyerBookValueInput = z.infer<typeof buyerBookValueSchema>;
export type VinCheck = z.infer<typeof vinCheckSchema>;
export type BuyerReported = z.infer<typeof buyerReportedSchema>;
export type VinMismatch = z.infer<typeof vinMismatchSchema>;
