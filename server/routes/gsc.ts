/**
 * Google Search Console (GSC) Summary Route
 *
 * Required environment variable:
 *   GOOGLE_SERVICE_ACCOUNT_JSON — a JSON string of a Google service account key file.
 *   The service account must be added to Google Search Console as an owner or full user
 *   for the property you want to inspect (e.g. https://odigosauto.com/).
 *
 * The JSON should look like:
 * {
 *   "type": "service_account",
 *   "project_id": "...",
 *   "private_key_id": "...",
 *   "private_key": "-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n",
 *   "client_email": "your-sa@your-project.iam.gserviceaccount.com",
 *   "client_id": "...",
 *   "auth_uri": "https://accounts.google.com/o/oauth2/auth",
 *   "token_uri": "https://oauth2.googleapis.com/token"
 * }
 *
 * GSC status codes → plain-English mapping:
 *   INDEXED           → Indexed & working
 *   CRAWLED_CURRENTLY_NOT_INDEXED      → Crawled, not indexed
 *   DISCOVERED_CURRENTLY_NOT_INDEXED   → Discovered, not yet crawled
 *   DUPLICATE_WITHOUT_CANONICAL_TAG    → Duplicate content detected
 *   DUPLICATE_WITH_PROPER_CANONICAL_TAG → Google chose a different canonical
 *   NOT_FOUND                          → Page not found (404)
 *   SERVER_ERROR                       → Server error
 *   REDIRECT_ERROR                     → Redirect error
 *   BLOCKED_BY_ROBOTS_TXT             → Blocked by robots.txt
 *   BLOCKED_BY_META_TAG               → Blocked by noindex tag
 *   BLOCKED_BY_HTTP_HEADER            → Blocked by HTTP header
 *   ALTERNATE_PAGE_WITH_PROPER_CANONICAL_TAG → Not the canonical version
 *   PAGE_WITH_REDIRECT                → Has a redirect
 *   EXCLUDED_BY_NOINDEX               → Excluded by noindex
 *   SOFT_404                          → Soft 404
 */

import type { Express } from "express";
import { requireAdminKey } from "./admin";
import * as fs from "fs";
import * as path from "path";
import { XMLParser } from "fast-xml-parser";

function buildSiteUrl(raw: string): string {
  if (raw.startsWith("sc-domain:")) return raw;
  return raw.replace(/\/?$/, "/");
}

const CONFIGURED_SITE_URL = process.env.GSC_SITE_URL
  ? buildSiteUrl(process.env.GSC_SITE_URL)
  : null;

const URL_PREFIX_DEFAULT = "https://odigosauto.com/";
const DOMAIN_PROPERTY_DEFAULT = "sc-domain:odigosauto.com";

let _resolvedSiteUrl: string | null = CONFIGURED_SITE_URL;

async function getResolvedSiteUrl(accessToken: string): Promise<string> {
  if (_resolvedSiteUrl) return _resolvedSiteUrl;

  for (const candidate of [URL_PREFIX_DEFAULT, DOMAIN_PROPERTY_DEFAULT]) {
    try {
      const result = await fetchSearchAnalyticsRaw(accessToken, candidate);
      if (result.ok) {
        console.log(`GSC: auto-detected site URL format: ${candidate}`);
        _resolvedSiteUrl = candidate;
        return candidate;
      }
      console.warn(`GSC: site URL candidate ${candidate} returned ${result.status}`);
    } catch (e: any) {
      console.warn(`GSC: site URL candidate ${candidate} error:`, e?.message);
    }
  }

  _resolvedSiteUrl = URL_PREFIX_DEFAULT;
  return _resolvedSiteUrl;
}

interface GscPageItem {
  url: string;
  status: string;
  reason: string;
  nextStep: string;
  clicks: number;
  impressions: number;
  inSitemap: boolean;
}

type AnalyticsErrorCode = "PERMISSION_DENIED" | "PROPERTY_NOT_FOUND" | "UNKNOWN";

interface AnalyticsError {
  code: AnalyticsErrorCode;
  detail: string;
}

interface GscSummary {
  indexed: GscPageItem[];
  discoveredNotIndexed: GscPageItem[];
  errors: GscPageItem[];
  notInSitemap: GscPageItem[];
  totalSitemapUrls: number;
  totalIndexed: number;
  totalNeedingAttention: number;
  apiWarnings?: string[];
  analyticsError?: AnalyticsError;
}

function mapStatusToPlainEnglish(verdict: string, coverageState: string): { reason: string; nextStep: string } {
  const state = coverageState || verdict || "";

  const mapping: Record<string, { reason: string; nextStep: string }> = {
    INDEXED: {
      reason: "Google is showing this page in search results.",
      nextStep: "",
    },
    CRAWLED_CURRENTLY_NOT_INDEXED: {
      reason: "Google visited this page but decided not to include it in search results.",
      nextStep: "Google visited this page but decided not to include it in search results. This usually means the content is too short or too similar to another page. Try adding more detailed, unique content.",
    },
    DISCOVERED_CURRENTLY_NOT_INDEXED: {
      reason: "Google knows this page exists but hasn't visited it yet.",
      nextStep: "Google knows this page exists but hasn't visited it yet. No action needed right now — check back in a week. If it still shows here after two weeks, try requesting indexing via the GSC link below.",
    },
    DUPLICATE_WITHOUT_CANONICAL_TAG: {
      reason: "Google thinks this page is too similar to another page on your site and is ignoring it.",
      nextStep: "Google thinks this page is too similar to another page on your site and is ignoring it. Check that both pages cover clearly different topics, or if one page is a copy, consider removing it and redirecting to the original.",
    },
    DUPLICATE_WITH_PROPER_CANONICAL_TAG: {
      reason: "You told Google this is the main version of the page, but Google disagreed and picked a different one.",
      nextStep: "You told Google this is the main version of the page, but Google disagreed and picked a different one. Open the GSC link below, look at the 'User-declared canonical' vs 'Google-selected canonical' fields, and make sure your canonical tag matches Google's choice.",
    },
    ALTERNATE_PAGE_WITH_PROPER_CANONICAL_TAG: {
      reason: "This page correctly points to another URL as the main version, so Google isn't indexing this one.",
      nextStep: "This is expected behaviour if you intentionally set a canonical tag pointing elsewhere. If you want this page indexed instead, update your canonical tag.",
    },
    NOT_FOUND: {
      reason: "Google tried to visit this page but it no longer exists.",
      nextStep: "Google tried to visit this page but it no longer exists. Find any links on your site pointing here and update them to a working page.",
    },
    SERVER_ERROR: {
      reason: "When Google tried to visit this page, your site returned an error.",
      nextStep: "When Google tried to visit this page, your site returned an error. This needs a developer to investigate — share the GSC link below with your dev.",
    },
    REDIRECT_ERROR: {
      reason: "Google tried to follow a redirect from this page but the redirect is broken.",
      nextStep: "Google tried to follow a redirect from this page but the redirect is broken. Check that any redirect chains are set up correctly and end at a valid page.",
    },
    BLOCKED_BY_ROBOTS_TXT: {
      reason: "Your site is telling Google not to visit this page.",
      nextStep: "Your site is telling Google not to visit this page. If you want it indexed, you'll need to update your robots.txt file to allow it.",
    },
    BLOCKED_BY_META_TAG: {
      reason: "This page has a 'noindex' tag telling Google not to index it.",
      nextStep: "This page has a 'noindex' tag telling Google not to index it. If you want it indexed, remove the noindex tag from the page's HTML.",
    },
    BLOCKED_BY_HTTP_HEADER: {
      reason: "Your server is sending an HTTP header telling Google not to index this page.",
      nextStep: "Your server is sending an HTTP header telling Google not to index this page. If you want it indexed, ask your developer to remove the 'X-Robots-Tag: noindex' header.",
    },
    PAGE_WITH_REDIRECT: {
      reason: "This URL redirects to another page.",
      nextStep: "This URL redirects to another page. If it's intentional, no action needed. If you want Google to index this URL directly, remove the redirect.",
    },
    EXCLUDED_BY_NOINDEX: {
      reason: "This page is excluded from Google's index because it has a noindex directive.",
      nextStep: "This page is excluded because it has a noindex directive. If you want it indexed, remove the noindex tag or header from this page.",
    },
    SOFT_404: {
      reason: "Google thinks this page looks like a 'not found' page even though it returned a 200 OK status.",
      nextStep: "Google thinks this page looks like a 'not found' page even though it returned a 200 OK status. Make sure the page has meaningful content, and if it's truly a missing page, return a real 404 status code.",
    },
  };

  return mapping[state] ?? {
    reason: `Status: ${state}`,
    nextStep: `Google reported an unfamiliar status for this page (${state}). Open the GSC link below for more details.`,
  };
}

function categorise(item: GscPageItem): "indexed" | "discoveredNotIndexed" | "errors" {
  const errorStates = [
    "NOT_FOUND", "SERVER_ERROR", "REDIRECT_ERROR",
    "BLOCKED_BY_ROBOTS_TXT", "BLOCKED_BY_META_TAG", "BLOCKED_BY_HTTP_HEADER",
    "SOFT_404", "EXCLUDED_BY_NOINDEX",
  ];
  const discoveredStates = [
    "CRAWLED_CURRENTLY_NOT_INDEXED", "DISCOVERED_CURRENTLY_NOT_INDEXED",
    "DUPLICATE_WITHOUT_CANONICAL_TAG", "DUPLICATE_WITH_PROPER_CANONICAL_TAG",
    "ALTERNATE_PAGE_WITH_PROPER_CANONICAL_TAG", "PAGE_WITH_REDIRECT",
  ];

  if (errorStates.includes(item.status)) return "errors";
  if (discoveredStates.includes(item.status)) return "discoveredNotIndexed";
  return "indexed";
}

async function getGoogleAccessToken(serviceAccountJson: string): Promise<string> {
  const { google } = await import("googleapis");
  const credentials = JSON.parse(serviceAccountJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/webmasters.readonly",
      "https://www.googleapis.com/auth/webmasters",
    ],
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  return tokenResponse.token ?? "";
}

function parseSitemapUrls(): string[] {
  try {
    const sitemapPath = path.resolve("sitemap.xml");
    const xml = fs.readFileSync(sitemapPath, "utf8");
    const parser = new XMLParser();
    const result = parser.parse(xml);
    const urls: string[] = [];
    const urlset = result?.urlset?.url;
    if (!urlset) return [];
    const entries = Array.isArray(urlset) ? urlset : [urlset];
    for (const entry of entries) {
      if (entry?.loc) urls.push(entry.loc.trim());
    }
    return urls;
  } catch (e) {
    console.error("Failed to parse sitemap:", e);
    return [];
  }
}

async function fetchUrlInspection(
  accessToken: string,
  siteUrl: string,
  inspectionUrl: string
): Promise<{ verdict: string; coverageState: string }> {
  const response = await fetch(
    "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inspectionUrl,
        siteUrl,
      }),
    }
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GSC URL inspection failed for ${inspectionUrl}: ${response.status} ${text}`);
  }
  const data = await response.json() as any;
  const indexStatus = data?.inspectionResult?.indexStatusResult ?? {};
  return {
    verdict: indexStatus.verdict ?? "UNKNOWN",
    coverageState: indexStatus.coverageState ?? indexStatus.verdict ?? "UNKNOWN",
  };
}

type GscDateRange = "today" | "week" | "month" | "all";

function buildAnalyticsRequestBody(range: GscDateRange = "all") {
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 1);
  let startDate: Date;
  if (range === "today") {
    startDate = new Date(endDate);
  } else if (range === "week") {
    startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);
  } else if (range === "month") {
    startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 29);
  } else {
    startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 27);
  }
  return { startDate: fmt(startDate), endDate: fmt(endDate), dimensions: ["page"], rowLimit: 5000 };
}

async function fetchSearchAnalyticsRaw(
  accessToken: string,
  siteUrl: string,
  range: GscDateRange = "all"
): Promise<Response> {
  return fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildAnalyticsRequestBody(range)),
    }
  );
}

class GscAnalyticsError extends Error {
  constructor(public readonly statusCode: number, detail: string) {
    super(`GSC search analytics request failed: ${statusCode} ${detail}`);
    this.name = "GscAnalyticsError";
  }
}

async function fetchSearchAnalytics(
  accessToken: string,
  siteUrl: string,
  range: GscDateRange = "all"
): Promise<Map<string, { clicks: number; impressions: number }>> {
  const response = await fetchSearchAnalyticsRaw(accessToken, siteUrl, range);

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new GscAnalyticsError(response.status, text);
  }

  const map = new Map<string, { clicks: number; impressions: number }>();
  const data = await response.json() as any;
  for (const row of data?.rows ?? []) {
    const url: string = row.keys?.[0] ?? "";
    if (url) {
      map.set(url, { clicks: row.clicks ?? 0, impressions: row.impressions ?? 0 });
    }
  }
  return map;
}

export function registerGscRoutes(app: Express): void {
  app.get("/api/admin/gsc/summary", async (req, res) => {
    if (!requireAdminKey(req, res)) return;

    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      return res.status(503).json({ setup_required: true });
    }

    try {
      const rawRange = typeof req.query.range === "string" ? req.query.range : "all";
      const VALID_GSC_RANGES: GscDateRange[] = ["today", "week", "month", "all"];
      const gscRange: GscDateRange = (VALID_GSC_RANGES as string[]).includes(rawRange) ? rawRange as GscDateRange : "all";

      const accessToken = await getGoogleAccessToken(serviceAccountJson);
      const sitemapUrls = parseSitemapUrls();
      const apiWarnings: string[] = [];

      const resolvedSiteUrl = await getResolvedSiteUrl(accessToken);

      let analyticsMap = new Map<string, { clicks: number; impressions: number }>();
      let analyticsError: AnalyticsError | undefined;
      try {
        analyticsMap = await fetchSearchAnalytics(accessToken, resolvedSiteUrl, gscRange);
      } catch (e: any) {
        console.warn("GSC analytics unavailable:", e?.message);
        let code: AnalyticsErrorCode;
        let detail: string;
        if (e instanceof GscAnalyticsError && e.statusCode === 403) {
          code = "PERMISSION_DENIED";
          detail = resolvedSiteUrl;
        } else if (e instanceof GscAnalyticsError && e.statusCode === 404) {
          code = "PROPERTY_NOT_FOUND";
          detail = resolvedSiteUrl;
        } else {
          code = "UNKNOWN";
          detail = e?.message ?? "";
        }
        analyticsError = { code, detail };
        apiWarnings.push("Analytics data unavailable.");
      }

      const normalizeUrl = (u: string) => u.replace(/\/$/, "");

      const analyticsNormalizedMap = new Map<string, { clicks: number; impressions: number }>();
      for (const [url, perf] of Array.from(analyticsMap.entries())) {
        analyticsNormalizedMap.set(normalizeUrl(url), perf);
      }

      const indexed: GscPageItem[] = [];
      const discoveredNotIndexed: GscPageItem[] = [];
      const errors: GscPageItem[] = [];

      const BATCH_SIZE = 5;
      for (let i = 0; i < sitemapUrls.length; i += BATCH_SIZE) {
        const batch = sitemapUrls.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map(async (url) => {
            try {
              const { verdict, coverageState } = await fetchUrlInspection(accessToken, resolvedSiteUrl, url);
              const { reason, nextStep } = mapStatusToPlainEnglish(verdict, coverageState);
              const perf = analyticsNormalizedMap.get(normalizeUrl(url)) ?? { clicks: 0, impressions: 0 };
              const item: GscPageItem = {
                url,
                status: coverageState || verdict,
                reason,
                nextStep,
                clicks: perf.clicks,
                impressions: perf.impressions,
                inSitemap: true,
              };
              const cat = categorise(item);
              if (cat === "indexed") indexed.push(item);
              else if (cat === "discoveredNotIndexed") discoveredNotIndexed.push(item);
              else errors.push(item);
            } catch (e: any) {
              console.warn(`Failed to inspect ${url}:`, e?.message);
            }
          })
        );
        if (i + BATCH_SIZE < sitemapUrls.length) {
          await new Promise((r) => setTimeout(r, 200));
        }
      }

      const SITE_ORIGIN = resolvedSiteUrl.startsWith("sc-domain:")
        ? `https://${resolvedSiteUrl.slice("sc-domain:".length)}`
        : resolvedSiteUrl.replace(/\/$/, "");
      const SITE_PREFIX = resolvedSiteUrl.startsWith("sc-domain:")
        ? `${SITE_ORIGIN}/`
        : resolvedSiteUrl;
      const sitemapNormalizedSet = new Set(sitemapUrls.map(normalizeUrl));
      const notInSitemap: GscPageItem[] = [];
      for (const [url, perf] of Array.from(analyticsMap.entries())) {
        if (!sitemapNormalizedSet.has(normalizeUrl(url)) && (url.startsWith(SITE_PREFIX) || url.startsWith(SITE_ORIGIN))) {
          notInSitemap.push({
            url,
            status: "NOT_IN_SITEMAP",
            reason: "Google found this page through a link but it's not in your sitemap.",
            nextStep: "Google found this page through a link but it's not in your sitemap. If you want Google to index it, add its URL to your sitemap.xml file. If you don't want it indexed, add a 'noindex' tag to the page.",
            clicks: perf.clicks,
            impressions: perf.impressions,
            inSitemap: false,
          });
        }
      }

      const totalNeedingAttention =
        discoveredNotIndexed.length + errors.length + notInSitemap.length;

      const summary: GscSummary = {
        indexed,
        discoveredNotIndexed,
        errors,
        notInSitemap,
        totalSitemapUrls: sitemapUrls.length,
        totalIndexed: indexed.length,
        totalNeedingAttention,
        ...(apiWarnings.length > 0 ? { apiWarnings } : {}),
        ...(analyticsError ? { analyticsError } : {}),
      };

      res.json(summary);
    } catch (e: any) {
      console.error("GSC summary error:", e?.message || e);
      res.status(500).json({ error: "Failed to fetch GSC data", message: e?.message });
    }
  });
}
