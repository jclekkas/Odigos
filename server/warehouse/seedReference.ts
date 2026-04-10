import { db } from "../db.js";
import { sql } from "drizzle-orm";
import { coreStates, coreMetroAreas } from "../../shared/warehouse.js";
import stateRef from "../state_fee_reference.json";

type StateData = {
  name: string;
  abbreviation: string;
  docFeeCap: boolean;
  docFeeCapAmount: number | null;
  stateSalesTaxRate: number;
  tradeInTaxCredit: boolean;
};

type StateRefJson = {
  states: Record<string, StateData>;
};

async function seedStates(): Promise<void> {
  const refData = stateRef as StateRefJson;
  const rows = Object.entries(refData.states).map(([code, data]) => ({
    stateCode: code,
    stateName: data.name,
    docFeeCap: data.docFeeCap && data.docFeeCapAmount != null
      ? String(data.docFeeCapAmount)
      : null,
    docFeeCapType: data.docFeeCap ? "fixed" : null,
    docFeeCapStatute: null,
    salesTaxBase: data.stateSalesTaxRate != null
      ? String(data.stateSalesTaxRate)
      : null,
    tradeInCredit: data.tradeInTaxCredit ?? false,
    updatedAt: new Date(),
  }));

  for (const row of rows) {
    await db
      .insert(coreStates)
      .values(row)
      .onConflictDoNothing();
  }

  console.log(`[seedReference] Upserted ${rows.length} states into core.states.`);
}

const METRO_AREAS: Array<{
  metroName: string;
  stateCode: string;
  population: number;
}> = [
  { metroName: "Los Angeles", stateCode: "CA", population: 13200000 },
  { metroName: "New York", stateCode: "NY", population: 20100000 },
  { metroName: "Chicago", stateCode: "IL", population: 9534000 },
  { metroName: "Houston", stateCode: "TX", population: 7340000 },
  { metroName: "Phoenix", stateCode: "AZ", population: 5000000 },
  { metroName: "Dallas", stateCode: "TX", population: 7760000 },
  { metroName: "San Antonio", stateCode: "TX", population: 2600000 },
  { metroName: "San Diego", stateCode: "CA", population: 3300000 },
  { metroName: "San Jose", stateCode: "CA", population: 1990000 },
  { metroName: "Austin", stateCode: "TX", population: 2300000 },
  { metroName: "Jacksonville", stateCode: "FL", population: 1600000 },
  { metroName: "Fort Worth", stateCode: "TX", population: 2400000 },
  { metroName: "Columbus", stateCode: "OH", population: 2100000 },
  { metroName: "Charlotte", stateCode: "NC", population: 2700000 },
  { metroName: "Indianapolis", stateCode: "IN", population: 2100000 },
  { metroName: "San Francisco", stateCode: "CA", population: 4700000 },
  { metroName: "Seattle", stateCode: "WA", population: 4000000 },
  { metroName: "Denver", stateCode: "CO", population: 2900000 },
  { metroName: "Nashville", stateCode: "TN", population: 2100000 },
  { metroName: "Oklahoma City", stateCode: "OK", population: 1400000 },
  { metroName: "Las Vegas", stateCode: "NV", population: 2200000 },
  { metroName: "Louisville", stateCode: "KY", population: 1400000 },
  { metroName: "Baltimore", stateCode: "MD", population: 2800000 },
  { metroName: "Milwaukee", stateCode: "WI", population: 1600000 },
  { metroName: "Portland", stateCode: "OR", population: 2500000 },
];

async function seedMetroAreas(): Promise<void> {
  for (const metro of METRO_AREAS) {
    await db
      .insert(coreMetroAreas)
      .values({
        metroName: metro.metroName,
        stateCode: metro.stateCode,
        population: metro.population,
      })
      .onConflictDoNothing({ target: [coreMetroAreas.metroName, coreMetroAreas.stateCode] });
  }

  console.log(`[seedReference] Inserted ${METRO_AREAS.length} metro areas into core.metro_areas.`);
}

export async function seedReferenceData(): Promise<void> {
  console.log("[seedReference] Starting reference data seeding...");
  await seedStates();
  await seedMetroAreas();
  console.log("[seedReference] Reference data seeding complete.");
}

// Only auto-execute when this file is run directly as an ESM script
const isMain = process.argv[1]?.endsWith("seedReference.ts") ||
  process.argv[1]?.endsWith("seedReference.js");

if (isMain) {
  seedReferenceData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[seedReference] Fatal error:", err);
      process.exit(1);
    });
}
