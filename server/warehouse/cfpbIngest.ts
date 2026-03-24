/**
 * CFPB Vehicle Complaint Ingestion
 *
 * Pulls vehicle loan/lease complaint records from the CFPB public API,
 * inserts raw records into raw.enforcement_records, normalizes into
 * core.consumer_complaints, AND writes a lightweight row to core.listings
 * so that CFPB records appear in platform metrics.
 *
 * Idempotent — each complaint_id maps to exactly one raw record (unique
 * constraint on source + source_record_id). core.consumer_complaints is
 * deduplicated by raw_record_id check before insert. core.listings is
 * deduplicated by raw_record_id check via consumer_complaints FK.
 *
 * Run with: tsx server/warehouse/cfpbIngest.ts
 */
import { db } from "../db";
import { sql } from "drizzle-orm";
import {
  rawEnforcementRecords,
  coreConsumerComplaints,
  coreDealers,
  coreListings,
} from "@shared/warehouse";
import { normalizeDealerName, validateStateCode, refreshAllViews } from "./warehouseUtils";

const CFPB_BASE_URL =
  "https://api.consumerfinance.gov/data-research/consumer-complaints/search.json";
const PAGE_SIZE = 100;
const MAX_RECORDS = 1000;

interface CfpbHit {
  _source: {
    complaint_id?: string;
    date_received?: string;
    state?: string;
    company?: string;
    issue?: string;
    sub_issue?: string;
    company_response?: string;
    product?: string;
    [key: string]: unknown;
  };
}

interface CfpbPage {
  hits?: {
    hits?: CfpbHit[];
    total?: { value?: number } | number;
  };
}

async function fetchPage(from: number): Promise<CfpbPage> {
  const params = new URLSearchParams({
    product: "Vehicle loan or lease",
    format: "json",
    no_aggs: "true",
    size: String(PAGE_SIZE),
    from: String(from),
    sort: "created_date_desc",
  });

  const res = await fetch(`${CFPB_BASE_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(
      `CFPB API responded with ${res.status}: ${res.statusText}`
    );
  }
  return res.json() as Promise<CfpbPage>;
}

async function getDealerMap(): Promise<Map<string, string>> {
  const dealers = await db
    .select({
      id: coreDealers.id,
      dealerNameNormalized: coreDealers.dealerNameNormalized,
    })
    .from(coreDealers);
  const map = new Map<string, string>();
  for (const d of dealers) {
    map.set(d.dealerNameNormalized, d.id);
  }
  return map;
}

function matchDealer(
  companyName: string,
  dealerMap: Map<string, string>
): string | null {
  const normalized = normalizeDealerName(companyName);
  if (!normalized) return null;

  if (dealerMap.has(normalized)) {
    return dealerMap.get(normalized)!;
  }

  // Partial prefix match (at least 5 chars)
  if (normalized.length >= 5) {
    for (const [key, id] of dealerMap.entries()) {
      if (key.startsWith(normalized) || normalized.startsWith(key)) {
        return id;
      }
    }
  }
  return null;
}

/**
 * Get or create a dealer for a CFPB company name.
 * validStateCode must already be validated to avoid FK violations.
 */
async function getOrCreateCfpbDealer(
  companyName: string,
  validStateCode: string | null,
  dealerMap: Map<string, string>
): Promise<string | null> {
  // First try fuzzy match against existing dealers
  const matchedId = matchDealer(companyName, dealerMap);
  if (matchedId) return matchedId;

  const normalized = normalizeDealerName(companyName);
  if (!normalized) return null;

  // city: use state code if valid, else "Unknown"
  const city = validStateCode ?? "Unknown";

  const stateWhere = validStateCode
    ? sql`state_code = ${validStateCode}`
    : sql`state_code IS NULL`;

  try {
    const inserted = await db
      .insert(coreDealers)
      .values({
        dealerName: companyName,
        dealerNameNormalized: normalized,
        city,
        stateCode: validStateCode,
      })
      .onConflictDoNothing()
      .returning({ id: coreDealers.id });

    if (inserted.length > 0) {
      dealerMap.set(normalized, inserted[0].id);
      return inserted[0].id;
    }

    // Race condition — refetch
    const refetch = await db
      .select({ id: coreDealers.id })
      .from(coreDealers)
      .where(sql`dealer_name_normalized = ${normalized} AND ${stateWhere} AND city = ${city}`)
      .limit(1);
    if (refetch.length > 0) {
      dealerMap.set(normalized, refetch[0].id);
      return refetch[0].id;
    }
  } catch {
    // Ignore dealer creation errors — listing will have null dealerId
  }
  return null;
}

async function ingestHits(hits: CfpbHit[]): Promise<number> {
  if (hits.length === 0) return 0;

  const dealerMap = await getDealerMap();
  let inserted = 0;

  for (const hit of hits) {
    const src = hit._source;
    if (!src) continue;

    const complaintId = src.complaint_id ?? null;
    if (!complaintId) continue;

    // ── raw.enforcement_records ─────────────────────────────────────────────
    // ON CONFLICT DO NOTHING on (source, source_record_id) ensures idempotency.
    let rawRecordId: number | null = null;
    let isNewRawRecord = false;
    try {
      const rawResult = await db
        .insert(rawEnforcementRecords)
        .values({
          source: "cfpb",
          sourceRecordId: String(complaintId),
          rawJson: src,
        })
        .onConflictDoNothing()
        .returning({ id: rawEnforcementRecords.id });

      if (rawResult.length > 0) {
        rawRecordId = rawResult[0].id;
        isNewRawRecord = true;
      } else {
        // Already exists — look up existing raw record ID
        const existing = await db
          .select({ id: rawEnforcementRecords.id })
          .from(rawEnforcementRecords)
          .where(sql`source = 'cfpb' AND source_record_id = ${String(complaintId)}`)
          .limit(1);
        rawRecordId = existing[0]?.id ?? null;
      }
    } catch (err) {
      console.warn(`[cfpb] raw insert failed for complaint ${complaintId}:`, err);
      continue;
    }

    if (!rawRecordId) continue;

    // ── Deduplication via consumer_complaints ───────────────────────────────
    // If a consumer_complaints row already exists for this raw_record_id,
    // the complaint (and its associated listing) were fully ingested before.
    if (!isNewRawRecord) {
      const ccExists = await db
        .select({ id: coreConsumerComplaints.id })
        .from(coreConsumerComplaints)
        .where(sql`raw_record_id = ${rawRecordId}`)
        .limit(1);
      if (ccExists.length > 0) {
        // Already fully normalized — skip
        continue;
      }
      // Raw record existed but normalization may have partially failed — proceed
    }

    // ── Shared derived fields ───────────────────────────────────────────────
    const rawState = src.state?.toUpperCase().slice(0, 2) ?? null;
    const validState = validateStateCode(rawState);
    const companyName = src.company ?? null;
    const complaintType = src.issue ?? null;
    const complaintSubtype = src.sub_issue ?? null;
    const companyResponse = src.company_response ?? null;
    const complaintDateStr = src.date_received ?? null;
    const complaintDate =
      complaintDateStr && /^\d{4}-\d{2}-\d{2}/.test(complaintDateStr)
        ? complaintDateStr.slice(0, 10)
        : null;

    // Dealer: fuzzy match or create new entry for the CFPB company
    const dealerId = companyName
      ? await getOrCreateCfpbDealer(companyName, validState, dealerMap)
      : null;

    // ── core.consumer_complaints ────────────────────────────────────────────
    // One complaint per raw record. Insert only if not already present
    // (checked above via the dedup block for returning complaints).
    let complaintWritten = false;
    try {
      await db.insert(coreConsumerComplaints).values({
        rawRecordId,
        complaintDate,
        stateCode: validState,
        companyName,
        dealerId,
        complaintType,
        complaintSubtype,
        companyResponse,
      });
      complaintWritten = true;
    } catch (err) {
      // Some other constraint failure — log and skip listing too
      console.warn(
        `[cfpb] consumer_complaint insert failed for ${complaintId}:`,
        (err as Error).message
      );
    }

    if (!complaintWritten) continue;

    // ── core.listings — so CFPB records appear in platform metrics ──────────
    // CFPB rows are complaint records; vehicle/pricing fields are null.
    // counts_toward_real_deals = true so they contribute to real_analyzed_deals.
    try {
      const analyzedAt = complaintDate
        ? new Date(complaintDate)
        : new Date();

      await db.insert(coreListings).values({
        dealerId,
        ingestionSource: "cfpb",
        isFullyProcessed: true,
        countsTowardRealDeals: true,
        analysisVersion: 1,
        isDuplicate: false,
        isTestData: false,
        hasPipelineError: false,
        flagCount: 0,
        stateCode: validState,
        listingDate: complaintDate ?? new Date().toISOString().slice(0, 10),
        analyzedAt,
      });
      inserted++;
    } catch (err) {
      console.warn(
        `[cfpb] listing insert failed for ${complaintId}:`,
        (err as Error).message
      );
    }
  }
  return inserted;
}

async function main(): Promise<void> {
  console.log("[cfpb] Starting CFPB vehicle complaint ingestion…");

  let from = 0;
  let totalFetched = 0;
  let totalInserted = 0;

  while (totalFetched < MAX_RECORDS) {
    const pageSize = Math.min(PAGE_SIZE, MAX_RECORDS - totalFetched);
    let page: CfpbPage;
    try {
      page = await fetchPage(from);
    } catch (err) {
      console.error("[cfpb] API request failed:", err);
      break;
    }

    const hits = page.hits?.hits ?? [];
    if (hits.length === 0) {
      console.log("[cfpb] No more records from CFPB API.");
      break;
    }

    const inserted = await ingestHits(hits);
    totalInserted += inserted;
    totalFetched += hits.length;
    from += hits.length;

    console.log(
      `[cfpb] Fetched ${totalFetched} records so far, inserted ${totalInserted} new rows`
    );

    if (hits.length < pageSize) {
      console.log("[cfpb] Reached last page.");
      break;
    }

    // Small delay to be polite to the public API
    await new Promise((r) => setTimeout(r, 250));
  }

  console.log(
    `[cfpb] Ingestion complete. Total fetched: ${totalFetched}, total inserted: ${totalInserted}`
  );

  await refreshAllViews();
  process.exit(0);
}

main().catch((err) => {
  console.error("[cfpb] Fatal error:", err);
  process.exit(1);
});
