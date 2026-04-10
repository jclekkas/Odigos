import { zipToStateCode } from "./zipToState.js";
import stateFeeReferenceJson from "./state_fee_reference.json" with { type: "json" };

interface CpiIndexing {
  isIndexed: boolean;
  baseAmount: number | null;
  baseYear: number | null;
  currentAmount: number;
  effectiveDate: string;
  frequency: "annual" | "biennial";
  indexType: string;
  nextExpectedDate: string | null;
}

interface StateFeeData {
  name: string;
  abbreviation: string;
  docFeeCap: boolean;
  docFeeCapAmount: number | null;
  docFeeTypicalRange: [number, number];
  docFeeAverage: number | null;
  stateSalesTaxRate: number;
  maxCombinedTaxRate: number;
  vehicleTaxNotes: string;
  tradeInTaxCredit: boolean;
  tradeInTaxCreditNotes?: string;
  titleFee: number | null;
  registrationFee: string;
  specialNotes: string | null;
  statuteCitation: string | null;
  cpiIndexing?: CpiIndexing;
  sources: string[];
  lastVerified: string;
  confidence: string;
  verificationMethod: string;
}

interface StateFeeReference {
  _metadata: Record<string, unknown>;
  states: Record<string, StateFeeData>;
}

const STATE_FEE_DATA: StateFeeReference = stateFeeReferenceJson as unknown as StateFeeReference;

const STATE_ABBREVIATIONS: Record<string, string> = {
  "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
  "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
  "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID",
  "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
  "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
  "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
  "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
  "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
  "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV",
  "Wisconsin": "WI", "Wyoming": "WY", "District of Columbia": "DC",
};

const ALL_STATE_ABBREVS = new Set([
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
]);

const UNAMBIGUOUS_CITY_TO_STATE: Record<string, string> = {
  "houston": "TX",
  "miami": "FL",
  "chicago": "IL",
  "phoenix": "AZ",
  "denver": "CO",
  "nashville": "TN",
  "atlanta": "GA",
  "detroit": "MI",
  "seattle": "WA",
  "las vegas": "NV",
  "minneapolis": "MN",
  "boston": "MA",
  "baltimore": "MD",
  "indianapolis": "IN",
  "memphis": "TN",
  "louisville": "KY",
  "albuquerque": "NM",
  "tucson": "AZ",
  "fresno": "CA",
  "sacramento": "CA",
};

const AMBIGUOUS_CITIES = new Set([
  "portland",
  "kansas city",
  "vancouver",
  "springfield",
  "columbia",
  "richmond",
  "jackson",
  "columbus",
  "franklin",
  "washington",
  "burlington",
  "manchester",
  "dover",
  "newport",
]);

const AMBIGUOUS_CITY_STATE_OPTIONS: Record<string, [string, string]> = {
  "portland": ["Oregon", "Maine"],
  "kansas city": ["Kansas", "Missouri"],
  "vancouver": ["Washington", "British Columbia"],
  "springfield": ["Illinois", "Missouri"],
  "columbia": ["South Carolina", "Missouri"],
  "richmond": ["Virginia", "California"],
  "jackson": ["Mississippi", "Wyoming"],
  "columbus": ["Ohio", "Georgia"],
  "franklin": ["Tennessee", "Kentucky"],
  "washington": ["D.C.", "state"],
  "burlington": ["Vermont", "North Carolina"],
  "manchester": ["New Hampshire", "Tennessee"],
  "dover": ["Delaware", "New Hampshire"],
  "newport": ["Rhode Island", "Kentucky"],
};

export interface StateDetectionResult {
  state: string | null;
  method: "zip" | "abbreviation" | "city" | null;
  ambiguousCity: string | null;
}

// Common English words that happen to be valid state abbreviations — these are still checked
// in the bare-abbreviation fallback, but only when preceded by location-signal words.
const PROSE_RISK_ABBREVS = new Set(["IN", "OR", "ME", "OH", "OK", "HI", "ID", "IA", "AS"]);

// Location-signal words that indicate the following/nearby abbreviation is a state, not prose.
// e.g. "dealer in OH", "located in IA", "at our ME location"
const LOCATION_SIGNAL_RE = /\b(?:in|at|located in|dealership in|dealer in|from|near|based in|out of)\s+([A-Z]{2})\b/gi;

export function detectStateFromText(text: string, zipCode?: string): StateDetectionResult {
  if (zipCode) {
    const state = zipToStateCode(zipCode);
    // Allow territory codes through so the "not found in reference" warning path is exercised
    if (state) {
      if (ALL_STATE_ABBREVS.has(state)) {
        return { state, method: "zip", ambiguousCity: null };
      }
      // Non-50-state territory detected via ZIP (PR, GU, VI, etc.) — return it so callers
      // can emit the required warning and skip injection
      return { state, method: "zip", ambiguousCity: null };
    }
  }

  // Geo-context pattern: match "ProperCityName, ST" — requires properly-cased city name(s)
  // (each word starts uppercase followed by lowercase letters) before the comma.
  // Handles multi-word cities like "San Antonio, TX" and "Las Vegas, NV".
  // Does NOT match "looks good, OK" (lowercase "good") or "Portland, or can ship" (lowercase "or").
  const geoPattern = /\b([A-Z][a-z]{1,}(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2})\b/g;
  let match: RegExpExecArray | null;
  while ((match = geoPattern.exec(text)) !== null) {
    const abbrev = match[2];
    if (ALL_STATE_ABBREVS.has(abbrev)) {
      return { state: abbrev, method: "abbreviation", ambiguousCity: null };
    }
  }

  const upperText = text.toUpperCase();

  // Full state name scan (before bare abbreviation to catch "Texas", "Oregon", etc.)
  const lowerText = text.toLowerCase();
  for (const [fullName, abbrev] of Object.entries(STATE_ABBREVIATIONS)) {
    const namePattern = new RegExp(`\\b${fullName.toLowerCase().replace(/\s+/g, "\\s+")}\\b`);
    if (namePattern.test(lowerText)) {
      return { state: abbrev, method: "abbreviation", ambiguousCity: null };
    }
  }

  // Bare abbreviation fallback: scan uppercased text for any valid state abbreviation.
  // For abbreviations that are also common English words (IN/OR/ME/OH/OK/HI/ID/IA),
  // only accept them when accompanied by a location-signal word (e.g., "dealer in OH").
  const abbrevPattern = /\b([A-Z]{2})\b/g;
  while ((match = abbrevPattern.exec(upperText)) !== null) {
    const abbrev = match[1];
    if (!ALL_STATE_ABBREVS.has(abbrev)) continue;
    if (!PROSE_RISK_ABBREVS.has(abbrev)) {
      // Unambiguous abbreviation — accept directly
      return { state: abbrev, method: "abbreviation", ambiguousCity: null };
    }
    // Prose-risk abbreviation — require a location-signal word near it
    const locationSignalInText = new RegExp(
      `\\b(?:in|at|located in|dealership in|dealer in|from|near|based in|out of)\\s+${abbrev}\\b`,
      "i"
    );
    if (locationSignalInText.test(text)) {
      return { state: abbrev, method: "abbreviation", ambiguousCity: null };
    }
  }

  // Check for location-signal pattern as a final pass for any prose-risk abbreviation
  // not already caught in the inline check above (e.g., "The dealership, in OH, charges...")
  // Reset lastIndex since LOCATION_SIGNAL_RE is a module-level /gi regex
  LOCATION_SIGNAL_RE.lastIndex = 0;
  let sigMatch: RegExpExecArray | null;
  while ((sigMatch = LOCATION_SIGNAL_RE.exec(text)) !== null) {
    const abbrev = sigMatch[1].toUpperCase();
    if (ALL_STATE_ABBREVS.has(abbrev)) {
      return { state: abbrev, method: "abbreviation", ambiguousCity: null };
    }
  }

  for (const [city, stateAbbrev] of Object.entries(UNAMBIGUOUS_CITY_TO_STATE)) {
    const cityPattern = new RegExp(`\\b${city.replace(/\s+/g, "\\s+")}\\b`, "i");
    if (cityPattern.test(text)) {
      return { state: stateAbbrev, method: "city", ambiguousCity: null };
    }
  }

  for (const ambigCity of Array.from(AMBIGUOUS_CITIES)) {
    const cityPattern = new RegExp(`\\b${ambigCity.replace(/\s+/g, "\\s+")}\\b`, "i");
    if (cityPattern.test(text)) {
      return { state: null, method: null, ambiguousCity: ambigCity };
    }
  }

  return { state: null, method: null, ambiguousCity: null };
}

export function getStateFeeData(stateAbbr: string): StateFeeData | null {
  return STATE_FEE_DATA.states[stateAbbr] ?? null;
}

export function getAmbiguousCityOptions(city: string): [string, string] | null {
  return AMBIGUOUS_CITY_STATE_OPTIONS[city.toLowerCase()] ?? null;
}
