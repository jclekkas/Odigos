/**
 * CFPB Vehicle Complaint Ingestion
 *
 * Pulls vehicle loan/lease complaint records from the CFPB public API,
 * inserts raw records into raw.enforcement_records, and normalizes them
 * into core.consumer_complaints with fuzzy dealer matching.
 *
 * Run with: npm run warehouse:cfpb
 */
import { db } from "../db";
import { sql } from "drizzle-orm";
import {
  rawEnforcementRecords,
  coreConsumerComplaints,
  coreDealers,
} from "@shared/warehouse";
import { normalizeDealerName, refreshAllViews } from "./warehouseUtils";

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
    const entries = Array.from(dealerMap.entries());
    for (const [key, id] of entries) {
      if (key.startsWith(normalized) || normalized.startsWith(key)) {
        return id;
      }
    }
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

    // Insert into raw.enforcement_records — skip if already present
    let rawRecordId: number | null = null;
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

      if (rawResult.length === 0) {
        // Already exists — look up existing row's id
        const existing = await db
          .select({ id: rawEnforcementRecords.id })
          .from(rawEnforcementRecords)
          .where(
            sql`source = 'cfpb' AND source_record_id = ${String(complaintId)}`
          )
          .limit(1);
        rawRecordId = existing[0]?.id ?? null;
      } else {
        rawRecordId = rawResult[0].id;
      }
    } catch (err) {
      console.warn(
        `[cfpb] raw insert failed for complaint ${complaintId}:`,
        err
      );
      continue;
    }

    // Normalize into core.consumer_complaints
    const stateCode = src.state?.toUpperCase().slice(0, 2) ?? null;
    const companyName = src.company ?? null;
    const complaintType = src.issue ?? null;
    const complaintSubtype = src.sub_issue ?? null;
    const companyResponse = src.company_response ?? null;
    const complaintDateStr = src.date_received ?? null;
    const complaintDate =
      complaintDateStr && /^\d{4}-\d{2}-\d{2}/.test(complaintDateStr)
        ? complaintDateStr.slice(0, 10)
        : null;

    const dealerId = companyName ? matchDealer(companyName, dealerMap) : null;

    try {
      await db.insert(coreConsumerComplaints).values({
        rawRecordId,
        complaintDate,
        stateCode,
        companyName,
        dealerId,
        complaintType,
        complaintSubtype,
        companyResponse,
      });
      inserted++;
    } catch (err) {
      // Likely duplicate — swallow silently
      console.warn(
        `[cfpb] complaint insert failed for ${complaintId}:`,
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
