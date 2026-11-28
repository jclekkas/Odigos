/**
 * Reference data for the top 15 lease brands in the US market.
 *
 * These figures are buyer benchmarks only. No captive-finance program sheet
 * was fetched for them, so each one is unverified (needs_source). A difference
 * from a stored figure is not a markup, and matching one can never unlock GO.
 */

export interface LeaseBrandInfo {
  brand: string;
  captiveLender: string;
  /**
   * Stored buyer benchmark. Not a captive-finance program sheet.
   * A difference from this figure is not a markup.
   */
  buyRateMF: number;
  /** Stored buyer benchmark for the acquisition fee. Not a published lender fee. */
  standardAcquisitionFee: number;
  /** Unverified residual-percent bands by term. Missing terms are not filled from 36 months. */
  typicalResidualPct: Record<number, [number, number]>;
  verification: "unverified";
  sourceStatus: "needs_source";
  informationalOnly: true;
  /** Buyer benchmarks can never authorize a GO. */
  canUnlockGo: false;
}

const RAW_LEASE_BRAND_DATA: Record<string, Omit<LeaseBrandInfo, "verification" | "sourceStatus" | "informationalOnly" | "canUnlockGo">> = {
  toyota: {
    brand: "Toyota",
    captiveLender: "Toyota Financial Services",
    buyRateMF: 0.00080,
    standardAcquisitionFee: 650,
    typicalResidualPct: { 24: [62, 70], 36: [55, 62], 39: [52, 59] },
  },
  honda: {
    brand: "Honda",
    captiveLender: "Honda Financial Services",
    buyRateMF: 0.00070,
    standardAcquisitionFee: 595,
    typicalResidualPct: { 24: [60, 68], 36: [53, 60], 39: [50, 57] },
  },
  bmw: {
    brand: "BMW",
    captiveLender: "BMW Financial Services",
    buyRateMF: 0.00120,
    standardAcquisitionFee: 925,
    typicalResidualPct: { 24: [62, 70], 36: [55, 63], 39: [52, 60] },
  },
  "mercedes-benz": {
    brand: "Mercedes-Benz",
    captiveLender: "Mercedes-Benz Financial Services",
    buyRateMF: 0.00110,
    standardAcquisitionFee: 1095,
    typicalResidualPct: { 24: [57, 65], 36: [50, 58], 39: [47, 55] },
  },
  lexus: {
    brand: "Lexus",
    captiveLender: "Lexus Financial Services",
    buyRateMF: 0.00075,
    standardAcquisitionFee: 650,
    typicalResidualPct: { 24: [62, 70], 36: [55, 63], 39: [52, 60] },
  },
  hyundai: {
    brand: "Hyundai",
    captiveLender: "Hyundai Motor Finance",
    buyRateMF: 0.00090,
    standardAcquisitionFee: 650,
    typicalResidualPct: { 24: [55, 63], 36: [48, 55], 39: [45, 52] },
  },
  kia: {
    brand: "Kia",
    captiveLender: "Kia Motors Finance",
    buyRateMF: 0.00085,
    standardAcquisitionFee: 650,
    typicalResidualPct: { 24: [53, 60], 36: [46, 53], 39: [43, 50] },
  },
  nissan: {
    brand: "Nissan",
    captiveLender: "Nissan Motor Acceptance",
    buyRateMF: 0.00080,
    standardAcquisitionFee: 650,
    typicalResidualPct: { 24: [55, 63], 36: [48, 55], 39: [45, 52] },
  },
  audi: {
    brand: "Audi",
    captiveLender: "Audi Financial Services",
    buyRateMF: 0.00110,
    standardAcquisitionFee: 895,
    typicalResidualPct: { 24: [59, 67], 36: [52, 60], 39: [49, 57] },
  },
  volkswagen: {
    brand: "Volkswagen",
    captiveLender: "VW Credit",
    buyRateMF: 0.00090,
    standardAcquisitionFee: 695,
    typicalResidualPct: { 24: [55, 63], 36: [48, 56], 39: [45, 53] },
  },
  subaru: {
    brand: "Subaru",
    captiveLender: "Chase (Subaru Motors Finance)",
    buyRateMF: 0.00090,
    standardAcquisitionFee: 595,
    typicalResidualPct: { 24: [59, 66], 36: [52, 58], 39: [49, 55] },
  },
  mazda: {
    brand: "Mazda",
    captiveLender: "Chase (Mazda Financial Services)",
    buyRateMF: 0.00085,
    standardAcquisitionFee: 595,
    typicalResidualPct: { 24: [57, 64], 36: [50, 57], 39: [47, 54] },
  },
  chevrolet: {
    brand: "Chevrolet",
    captiveLender: "GM Financial",
    buyRateMF: 0.00100,
    standardAcquisitionFee: 650,
    typicalResidualPct: { 24: [54, 62], 36: [47, 55], 39: [44, 52] },
  },
  ford: {
    brand: "Ford",
    captiveLender: "Ford Motor Credit",
    buyRateMF: 0.00095,
    standardAcquisitionFee: 645,
    typicalResidualPct: { 24: [54, 62], 36: [47, 54], 39: [44, 51] },
  },
  jeep: {
    brand: "Jeep",
    captiveLender: "Chrysler Capital",
    buyRateMF: 0.00100,
    standardAcquisitionFee: 695,
    typicalResidualPct: { 24: [52, 60], 36: [45, 53], 39: [42, 50] },
  },
};

/**
 * No captive-finance program was fetched for these figures.
 * They stay unverified. They are informational only and cannot unlock a GO.
 */
const LEASE_BRAND_DATA: Record<string, LeaseBrandInfo> = Object.fromEntries(
  Object.entries(RAW_LEASE_BRAND_DATA).map(([key, info]) => [
    key,
    {
      ...info,
      verification: "unverified" as const,
      sourceStatus: "needs_source" as const,
      informationalOnly: true as const,
      canUnlockGo: false as const,
    },
  ]),
);

/** Common aliases for fuzzy brand matching. */
const BRAND_ALIASES: Record<string, string> = {
  chevy: "chevrolet",
  vw: "volkswagen",
  "mercedes benz": "mercedes-benz",
  mercedes: "mercedes-benz",
  "mb": "mercedes-benz",
  benz: "mercedes-benz",
};

/**
 * Look up brand data by vehicle make string.
 * Handles case-insensitive matching and common aliases.
 * Returns null if the make is unknown or not in the top 15.
 */
export function lookupBrand(make?: string | null): LeaseBrandInfo | null {
  if (!make) return null;
  const normalized = make.trim().toLowerCase();
  if (!normalized) return null;

  // Direct match
  if (LEASE_BRAND_DATA[normalized]) return LEASE_BRAND_DATA[normalized];

  // Alias match
  const aliased = BRAND_ALIASES[normalized];
  if (aliased && LEASE_BRAND_DATA[aliased]) return LEASE_BRAND_DATA[aliased];

  // Substring match — e.g. "Mercedes-Benz USA" → "mercedes-benz"
  for (const key of Object.keys(LEASE_BRAND_DATA)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return LEASE_BRAND_DATA[key];
    }
  }

  return null;
}
