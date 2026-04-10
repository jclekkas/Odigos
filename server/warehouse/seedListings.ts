/**
 * Seed Dataset Generator
 *
 * Generates 500–1,000 synthetic but realistic car deal listings across
 * 50–75 synthetic dealers. All rows use ingestion_source='seed' and are
 * excluded from real_analyzed_deals metrics.
 *
 * Run with: npm run warehouse:seed
 */
import { db } from "../db.js";
import { sql } from "drizzle-orm";
import { coreDealers, coreListings, coreStates } from "../../shared/warehouse.js";
import { normalizeDealerName, refreshAllViews } from "./warehouseUtils.js";

// ─── Vehicle catalogue ───────────────────────────────────────────────────────

const VEHICLES = [
  { make: "Toyota", model: "Camry", type: "sedan", baseMsrp: 27000 },
  { make: "Honda", model: "Accord", type: "sedan", baseMsrp: 29000 },
  { make: "Ford", model: "F-150", type: "truck", baseMsrp: 38000 },
  { make: "Chevrolet", model: "Equinox", type: "suv", baseMsrp: 30000 },
  { make: "Hyundai", model: "Tucson", type: "suv", baseMsrp: 28000 },
  { make: "RAM", model: "1500", type: "truck", baseMsrp: 40000 },
  { make: "Kia", model: "Telluride", type: "suv", baseMsrp: 36000 },
  { make: "Nissan", model: "Rogue", type: "suv", baseMsrp: 29000 },
  { make: "Subaru", model: "Outback", type: "wagon", baseMsrp: 31000 },
  { make: "Tesla", model: "Model 3", type: "sedan", baseMsrp: 42000 },
];

// ─── State distribution (weighted) ──────────────────────────────────────────

const STATE_WEIGHTS: [string, number][] = [
  ["CA", 0.12],
  ["TX", 0.10],
  ["FL", 0.08],
  ["NY", 0.06],
  ["PA", 0.04],
  ["IL", 0.04],
  ["OH", 0.03],
  ["GA", 0.03],
  ["NC", 0.03],
  ["MI", 0.03],
  ["NJ", 0.02],
  ["VA", 0.02],
  ["WA", 0.02],
  ["AZ", 0.02],
  ["TN", 0.02],
  ["IN", 0.02],
  ["MO", 0.02],
  ["MD", 0.02],
  ["CO", 0.02],
  ["WI", 0.02],
  ["MN", 0.015],
  ["SC", 0.015],
  ["AL", 0.015],
  ["LA", 0.015],
  ["KY", 0.015],
  ["OR", 0.01],
  ["OK", 0.01],
  ["CT", 0.01],
  ["IA", 0.01],
  ["MS", 0.01],
  ["NV", 0.01],
  ["AR", 0.01],
  ["UT", 0.01],
  ["NM", 0.005],
  ["WV", 0.005],
  ["NE", 0.005],
  ["ID", 0.005],
  ["NH", 0.005],
  ["ME", 0.005],
  ["HI", 0.005],
];

// States with doc fee caps (approximate, for realistic seeding)
const DOC_FEE_CAPS: Record<string, number> = {
  CA: 85,
  CO: 689,
  NM: 189,
  WI: 210,
  MN: 125,
  MD: 500,
  NY: 175,
  MA: 25,
  OR: 115,
};

// Typical doc fee ranges for uncapped states
const UNCAPPED_DOC_FEE_RANGE = [200, 800] as const;

// City prefixes for synthetic dealer names by state
const CITY_PREFIXES: Record<string, string[]> = {
  CA: ["Bay Area", "Sunset", "Golden Gate", "Pacific", "Silicon Valley"],
  TX: ["Lone Star", "Bluebonnet", "Alamo", "Lone Star", "Texan"],
  FL: ["Sunshine", "Palmetto", "Gulf Coast", "Tropical", "Coastal"],
  NY: ["Empire", "Metro", "Hudson", "Gotham", "Capital"],
  PA: ["Keystone", "Liberty", "Steel City", "Quaker", "Penn"],
  IL: ["Windy City", "Prairie", "Lakeside", "Heartland", "Lincoln"],
  OH: ["Buckeye", "Lakefront", "Midwest", "Tri-State", "Riverview"],
  GA: ["Peach State", "Atlanta", "Southern", "Magnolia", "Peachtree"],
  NC: ["Tar Heel", "Carolina", "Blue Ridge", "Piedmont", "Cape Fear"],
  MI: ["Great Lakes", "Motor City", "Wolverine", "Inland", "Lake Shore"],
  DEFAULT: ["Metro", "Premier", "Elite", "Prestige", "National"],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rng(): number {
  return Math.random();
}

function randomBetween(min: number, max: number): number {
  return min + rng() * (max - min);
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1));
}

function pickWeighted<T>(weights: [T, number][]): T {
  const total = weights.reduce((s, [, w]) => s + w, 0);
  let r = rng() * total;
  for (const [item, w] of weights) {
    r -= w;
    if (r <= 0) return item;
  }
  return weights[weights.length - 1][0];
}

function toStr(n: number): string {
  return n.toFixed(2);
}

// ─── Synthetic dealer catalogue (50–75 unique dealers) ───────────────────────

function buildDealerCatalogue(): {
  name: string;
  stateCode: string;
  city: string;
}[] {
  const dealers: { name: string; stateCode: string; city: string }[] = [];
  const stateCount: Record<string, number> = {};

  const totalDealers = randomInt(50, 75);

  for (let i = 0; i < totalDealers; i++) {
    const stateCode = pickWeighted(STATE_WEIGHTS);
    const count = (stateCount[stateCode] ?? 0) + 1;
    stateCount[stateCode] = count;

    const prefixes =
      CITY_PREFIXES[stateCode as keyof typeof CITY_PREFIXES] ??
      CITY_PREFIXES.DEFAULT;
    const prefix = prefixes[i % prefixes.length];
    const vehicle = VEHICLES[i % VEHICLES.length];
    const suffix = ["Dealership", "Auto", "Cars", "Motors"][i % 4];
    const name = `${prefix} ${vehicle.make} ${suffix}`;
    const city = prefix.split(" ")[0]; // e.g. "Bay Area" -> "Bay Area"

    dealers.push({ name, stateCode, city });
  }

  return dealers;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("[seed] Starting seed data generation…");

  // Verify states are seeded
  const stateRows = await db.select({ stateCode: coreStates.stateCode }).from(coreStates);
  if (stateRows.length === 0) {
    throw new Error(
      "[seed] core.states is empty — run warehouse:setup (seedReference) first."
    );
  }
  const validStates = new Set(stateRows.map((r) => r.stateCode));

  // Build dealers
  const dealerCatalogue = buildDealerCatalogue();
  console.log(`[seed] Generating ${dealerCatalogue.length} synthetic dealers…`);

  const dealerIdMap = new Map<string, string>(); // name → id

  for (const d of dealerCatalogue) {
    if (!validStates.has(d.stateCode)) continue;
    const normalized = normalizeDealerName(d.name);

    const existing = await db
      .select({ id: coreDealers.id })
      .from(coreDealers)
      .where(
        sql`dealer_name_normalized = ${normalized} AND state_code = ${d.stateCode} AND city = ${d.city}`
      )
      .limit(1);

    if (existing.length > 0) {
      dealerIdMap.set(d.name, existing[0].id);
      continue;
    }

    const inserted = await db
      .insert(coreDealers)
      .values({
        dealerName: d.name,
        dealerNameNormalized: normalized,
        city: d.city,
        stateCode: d.stateCode,
      })
      .onConflictDoNothing()
      .returning({ id: coreDealers.id });

    if (inserted.length > 0) {
      dealerIdMap.set(d.name, inserted[0].id);
    } else {
      const refetch = await db
        .select({ id: coreDealers.id })
        .from(coreDealers)
        .where(
          sql`dealer_name_normalized = ${normalized} AND state_code = ${d.stateCode} AND city = ${d.city}`
        )
        .limit(1);
      if (refetch.length > 0) dealerIdMap.set(d.name, refetch[0].id);
    }
  }

  console.log(`[seed] Dealers upserted. Generating listings…`);

  const targetListings = randomInt(500, 1000);
  let inserted = 0;

  for (let i = 0; i < targetListings; i++) {
    // Pick a dealer
    const dealer = dealerCatalogue[i % dealerCatalogue.length];
    if (!validStates.has(dealer.stateCode)) continue;
    const dealerId = dealerIdMap.get(dealer.name);
    if (!dealerId) continue;

    // Vehicle
    const vehicle = VEHICLES[i % VEHICLES.length];
    const year = randomInt(2021, 2025);

    // Condition split: 40% new, 45% used, 15% CPO (stored as "used")
    const condRoll = rng();
    const isNew = condRoll < 0.40;
    const isCpo = condRoll >= 0.85;
    const vehicleType = isNew ? "new" : isCpo ? "cpo" : "used";

    // MSRP ±10%
    const msrpVariance = randomBetween(0.90, 1.10);
    const msrp = vehicle.baseMsrp * msrpVariance;

    // Listed price
    let listedPrice: number;
    if (isNew) {
      listedPrice = msrp * randomBetween(0.97, 1.05);
    } else if (isCpo) {
      listedPrice = msrp * randomBetween(0.78, 0.88);
    } else {
      listedPrice = msrp * randomBetween(0.65, 0.85);
    }

    // Doc fee
    const cap = DOC_FEE_CAPS[dealer.stateCode];
    const docFee = cap
      ? randomBetween(cap * 0.7, cap)
      : randomBetween(UNCAPPED_DOC_FEE_RANGE[0], UNCAPPED_DOC_FEE_RANGE[1]);

    // Market adjustment ~20% of listings
    const hasMarketAdj = rng() < 0.20;
    const marketAdjustment = hasMarketAdj ? randomBetween(500, 5000) : 0;

    // Add-ons ~35% of listings
    const hasAddons = rng() < 0.35;
    const addonTotal = hasAddons ? randomBetween(800, 3500) : 0;

    // OTD
    const otdPrice = listedPrice + docFee + marketAdjustment + addonTotal;

    // APR / term (skip if cash deal ~15%)
    const isCash = rng() < 0.15;
    const apr = isCash ? null : randomBetween(2.9, 11.9);
    const loanTermMonths = isCash
      ? null
      : [24, 36, 48, 60, 72, 84][randomInt(0, 5)];
    const downPayment = isCash ? null : listedPrice * randomBetween(0.05, 0.25);
    const monthlyPayment =
      apr && loanTermMonths && downPayment
        ? ((otdPrice - downPayment) *
            ((apr / 1200) * Math.pow(1 + apr / 1200, loanTermMonths))) /
          (Math.pow(1 + apr / 1200, loanTermMonths) - 1)
        : null;

    // Deal score: 30% GREEN (70), 45% YELLOW (50), 25% RED (30)
    const scoreRoll = rng();
    let dealScore: number;
    let verdict: string;
    if (scoreRoll < 0.30) {
      dealScore = randomInt(68, 82);
      verdict = "GO";
    } else if (scoreRoll < 0.75) {
      dealScore = randomInt(45, 67);
      verdict = "NEED-MORE-INFO";
    } else {
      dealScore = randomInt(15, 44);
      verdict = "NO-GO";
    }

    // Flags
    const flagList: string[] = [];
    if (hasMarketAdj) flagList.push("market_adjustment");
    if (hasAddons) flagList.push("high_cost_addons");
    if (docFee > (cap ?? 800)) flagList.push("doc_fee_high");
    if (!otdPrice) flagList.push("missing_otd");

    const docFeeOverStateCap = cap ? docFee > cap : false;
    const feeToPrice = otdPrice > 0 ? (docFee + addonTotal) / otdPrice : null;

    // listing_date: spread over last 18 months
    const daysAgo = randomInt(0, 548);
    const listingDate = new Date(Date.now() - daysAgo * 86400000);
    const listingDateStr = listingDate.toISOString().slice(0, 10);

    const analyzedAt = new Date(
      listingDate.getTime() + randomInt(0, 86400000)
    );

    await db.insert(coreListings).values({
      dealerId,
      ingestionSource: "seed",
      isFullyProcessed: true,
      countsTowardRealDeals: false,
      analysisVersion: 1,
      isDuplicate: false,
      isTestData: false,
      hasPipelineError: false,
      vehicleYear: year,
      vehicleMake: vehicle.make,
      vehicleModel: vehicle.model,
      vehicleType,
      listedPrice: toStr(listedPrice),
      otdPrice: toStr(otdPrice),
      monthlyPayment: monthlyPayment ? toStr(monthlyPayment) : null,
      aprValue: apr ? toStr(apr) : null,
      loanTermMonths,
      downPayment: downPayment ? toStr(downPayment) : null,
      docFee: toStr(docFee),
      docFeeOverStateCap,
      marketAdjustment: hasMarketAdj ? toStr(marketAdjustment) : null,
      addonTotal: hasAddons ? toStr(addonTotal) : null,
      feeNames: ["doc fee", ...(hasAddons ? ["dealer add-ons"] : []), ...(hasMarketAdj ? ["market adjustment"] : [])],
      flagCount: flagList.length,
      dealScore,
      verdict,
      flags: flagList,
      feeToPrice: feeToPrice ? toStr(feeToPrice) : null,
      stateCode: dealer.stateCode,
      listingDate: listingDateStr,
      analyzedAt,
    });

    inserted++;

    if (inserted % 100 === 0) {
      console.log(`[seed] Inserted ${inserted}/${targetListings} listings…`);
    }
  }

  console.log(`[seed] Done. Inserted ${inserted} seed listings.`);
  await refreshAllViews();
  process.exit(0);
}

main().catch((err) => {
  console.error("[seed] Fatal error:", err);
  process.exit(1);
});
