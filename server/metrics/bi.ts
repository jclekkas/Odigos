import { loadMetrics } from "./events";

// ── In-memory cache for heavy BI aggregations (TTL: 2 minutes) ───────────────
const BI_CACHE_TTL_MS = 2 * 60 * 1000;
const biCache = new Map<string, { value: unknown; expiresAt: number }>();

function getCached<T>(key: string): T | null {
  const entry = biCache.get(key);
  if (!entry || Date.now() > entry.expiresAt) return null;
  return entry.value as T;
}

function setCached<T>(key: string, value: T): T {
  biCache.set(key, { value, expiresAt: Date.now() + BI_CACHE_TTL_MS });
  return value;
}

export type DateRange = "today" | "week" | "month" | "all";

export function getDateBounds(range: DateRange): { start: Date | null; end: Date } {
  const now = new Date();
  const end = now;
  if (range === "all") return { start: null, end };
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === "today") return { start: todayStart, end };
  if (range === "week") return { start: new Date(todayStart.getTime() - 7 * 86400000), end };
  if (range === "month") return { start: new Date(todayStart.getTime() - 30 * 86400000), end };
  return { start: null, end };
}

export function filterByRange<T extends { createdAt: Date }>(events: T[], range: DateRange): T[] {
  const { start } = getDateBounds(range);
  if (!start) return events;
  return events.filter(e => e.createdAt >= start!);
}

export interface BIFunnelData {
  stages: Array<{
    name: string;
    today: number;
    week: number;
    allTime: number;
    dropoffPct: number | null;
    alert: boolean;
  }>;
}

export async function getBIFunnel(range: DateRange = "all"): Promise<BIFunnelData> {
  const { events } = await loadMetrics();
  const allEvents = events.map(e => ({ ...e, createdAt: new Date(e.createdAt) }));

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart.getTime() - 7 * 86400000);

  const stageTypes = [
    { name: "Page Visit", type: "page_view" },
    { name: "CTA Click", type: "cta_click" },
    { name: "Form Start", type: "form_start" },
    { name: "Submission", type: "submission" },
    { name: "Optional Details Expanded", type: "optional_details_expanded" },
    { name: "Scorecard Downloaded", type: "scorecard_downloaded" },
    { name: "Summary Copied", type: "copy_summary" },
    { name: "Checkout Initiated", type: "checkout_started" },
    { name: "Payment Completed", type: "payment_completed" },
  ];

  const counts = stageTypes.map(s => ({
    name: s.name,
    today: allEvents.filter(e => e.eventType === s.type && e.createdAt >= todayStart).length,
    week: allEvents.filter(e => e.eventType === s.type && e.createdAt >= weekStart).length,
    allTime: allEvents.filter(e => e.eventType === s.type).length,
  }));

  const stages = counts.map((c, idx) => {
    const prev = idx > 0 ? counts[idx - 1] : null;
    const dropoffPct = prev && prev.allTime > 0
      ? ((prev.allTime - c.allTime) / prev.allTime) * 100
      : null;
    return {
      ...c,
      dropoffPct,
      alert: dropoffPct !== null && dropoffPct > 60,
    };
  });

  return { stages };
}

export interface BIPageAttribution {
  pages: Array<{
    page: string;
    views: number;
    ctaClicks: number;
    ctaClickRate: number;
    attributedSubmissions: number;
  }>;
}

export async function getBIPageAttribution(range: DateRange): Promise<BIPageAttribution> {
  const { events } = await loadMetrics();
  const allEvents = events.map(e => ({ ...e, createdAt: new Date(e.createdAt) }));
  const ranged = filterByRange(allEvents, range);

  const pageViews = ranged.filter(e => e.eventType === "page_view");
  const ctaClicks = ranged.filter(e => e.eventType === "cta_click");
  const submissions = ranged.filter(e => e.eventType === "submission");

  const pageViewCounts: Record<string, number> = {};
  const pageCtaCounts: Record<string, number> = {};
  pageViews.forEach(e => {
    const page = (e.metadata?.page as string) || "unknown";
    pageViewCounts[page] = (pageViewCounts[page] || 0) + 1;
  });
  ctaClicks.forEach(e => {
    const page = (e.metadata?.page as string) || "unknown";
    pageCtaCounts[page] = (pageCtaCounts[page] || 0) + 1;
  });

  const allSorted = allEvents.slice().sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const sessionPageViewTimeline: Record<string, Array<{ ts: number; page: string }>> = {};
  for (const evt of allSorted) {
    if (evt.eventType === "page_view" && evt.metadata?.sessionId && evt.metadata?.page) {
      const sid = evt.metadata.sessionId as string;
      if (!sessionPageViewTimeline[sid]) sessionPageViewTimeline[sid] = [];
      sessionPageViewTimeline[sid].push({ ts: evt.createdAt.getTime(), page: evt.metadata.page as string });
    }
  }

  const pageAttributedSubmissions: Record<string, number> = {};
  for (const sub of submissions) {
    const sessionId = sub.metadata?.sessionId as string | undefined;
    if (!sessionId) continue;
    const timeline = sessionPageViewTimeline[sessionId];
    if (!timeline) continue;
    const subTs = sub.createdAt.getTime();
    let lastPage: string | null = null;
    for (const pv of timeline) {
      if (pv.ts <= subTs) lastPage = pv.page;
      else break;
    }
    if (lastPage) {
      pageAttributedSubmissions[lastPage] = (pageAttributedSubmissions[lastPage] || 0) + 1;
    }
  }

  const allPages = new Set([
    ...Object.keys(pageViewCounts),
    ...Object.keys(pageCtaCounts),
    ...Object.keys(pageAttributedSubmissions),
  ]);

  const pages = Array.from(allPages).map(page => {
    const views = pageViewCounts[page] || 0;
    const ctaClicksForPage = pageCtaCounts[page] || 0;
    return {
      page,
      views,
      ctaClicks: ctaClicksForPage,
      ctaClickRate: views > 0 ? (ctaClicksForPage / views) * 100 : 0,
      attributedSubmissions: pageAttributedSubmissions[page] || 0,
    };
  }).sort((a, b) => b.views - a.views);

  return { pages };
}

export interface BIUserBehavior {
  fieldEngagement: Array<{ fieldName: string; focusCount: number; abandonCount: number }>;
  avgPagesPerSession: number;
  bounceRate: number;
  returnVisitRate: number;
  topEntryPages: Array<{ page: string; count: number }>;
  topExitPages: Array<{ page: string; count: number }>;
}

export async function getBIUserBehavior(range: DateRange): Promise<BIUserBehavior> {
  const { events } = await loadMetrics();
  const allEvents = events.map(e => ({ ...e, createdAt: new Date(e.createdAt) }));
  const ranged = filterByRange(allEvents, range);

  const formFocusEvents = ranged.filter(e => e.eventType === "form_focus");
  const pageViewEvents = ranged.filter(e => e.eventType === "page_view");
  const submissions = ranged.filter(e => e.eventType === "submission");

  const fieldFocusCounts: Record<string, number> = {};
  formFocusEvents.forEach(e => {
    const field = (e.metadata?.fieldName as string) || "unknown";
    fieldFocusCounts[field] = (fieldFocusCounts[field] || 0) + 1;
  });

  const sessionFocusedFields: Record<string, Set<string>> = {};
  formFocusEvents.forEach(e => {
    const sid = e.metadata?.sessionId as string | undefined;
    const field = e.metadata?.fieldName as string | undefined;
    if (!sid || !field) return;
    if (!sessionFocusedFields[sid]) sessionFocusedFields[sid] = new Set();
    sessionFocusedFields[sid].add(field);
  });
  const submittedSessions = new Set(
    submissions
      .map(e => e.metadata?.sessionId as string | undefined)
      .filter((s): s is string => !!s)
  );

  const fieldAbandonCounts: Record<string, number> = {};
  for (const [sid, fields] of Object.entries(sessionFocusedFields)) {
    if (!submittedSessions.has(sid)) {
      for (const field of Array.from(fields)) {
        fieldAbandonCounts[field] = (fieldAbandonCounts[field] || 0) + 1;
      }
    }
  }

  const allFieldKeys = Array.from(new Set([...Object.keys(fieldFocusCounts), ...Object.keys(fieldAbandonCounts)]));
  const fieldEngagement = allFieldKeys.map(fieldName => ({
    fieldName,
    focusCount: fieldFocusCounts[fieldName] || 0,
    abandonCount: fieldAbandonCounts[fieldName] || 0,
  })).sort((a, b) => b.focusCount - a.focusCount);

  const sessionPages: Record<string, string[]> = {};
  const sessionSorted = pageViewEvents.slice().sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  sessionSorted.forEach(e => {
    const sessionId = (e.metadata?.sessionId as string) || `anon-${e.id}`;
    const page = (e.metadata?.page as string) || "unknown";
    if (!sessionPages[sessionId]) sessionPages[sessionId] = [];
    sessionPages[sessionId].push(page);
  });

  const sessionList = Object.values(sessionPages);
  const avgPagesPerSession = sessionList.length > 0
    ? sessionList.reduce((sum, pages) => sum + pages.length, 0) / sessionList.length
    : 0;
  const bounceSessions = sessionList.filter(pages => pages.length === 1).length;
  const bounceRate = sessionList.length > 0 ? (bounceSessions / sessionList.length) * 100 : 0;

  const entryPageCounts: Record<string, number> = {};
  const exitPageCounts: Record<string, number> = {};
  sessionList.forEach(pages => {
    if (pages.length > 0) {
      entryPageCounts[pages[0]] = (entryPageCounts[pages[0]] || 0) + 1;
      exitPageCounts[pages[pages.length - 1]] = (exitPageCounts[pages[pages.length - 1]] || 0) + 1;
    }
  });

  const topEntryPages = Object.entries(entryPageCounts)
    .map(([page, count]) => ({ page, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topExitPages = Object.entries(exitPageCounts)
    .map(([page, count]) => ({ page, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const sessionFirstSeen: Record<string, Date> = {};
  const sessionIpHash: Record<string, string> = {};
  const sortedPageViews = allEvents
    .filter(e => e.eventType === "page_view")
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  sortedPageViews.forEach(e => {
    const sid = e.metadata?.sessionId as string | undefined;
    const ip = e.metadata?.ipHash as string | undefined;
    if (!sid) return;
    if (!sessionFirstSeen[sid]) {
      sessionFirstSeen[sid] = e.createdAt;
      if (ip) sessionIpHash[sid] = ip;
    }
  });

  const ipEarliestSession: Record<string, { sid: string; firstSeen: Date }> = {};
  Object.entries(sessionFirstSeen)
    .sort(([, a], [, b]) => a.getTime() - b.getTime())
    .forEach(([sid, firstSeen]) => {
      const ip = sessionIpHash[sid];
      if (!ip) return;
      if (!ipEarliestSession[ip]) {
        ipEarliestSession[ip] = { sid, firstSeen };
      }
    });

  const rangedSessionIds = Object.keys(sessionPages);
  const returningSessions = rangedSessionIds.filter(sid => {
    const ip = sessionIpHash[sid];
    if (!ip) return false;
    const earliest = ipEarliestSession[ip];
    if (!earliest) return false;
    return earliest.sid !== sid;
  }).length;
  const returnVisitRate = rangedSessionIds.length > 0 ? (returningSessions / rangedSessionIds.length) * 100 : 0;

  return { fieldEngagement, avgPagesPerSession, bounceRate, returnVisitRate, topEntryPages, topExitPages };
}

export interface BIDealOutcome {
  scoreDistribution: { green: number; yellow: number; red: number };
  avgScoreByDay: Array<{ date: string; avgScore: number }>;
  topFeeTypes: Array<{ feeName: string; count: number }>;
  topTacticFlags: Array<{ tactic: string; count: number }>;
}

export async function getBIDealOutcome(range: DateRange): Promise<BIDealOutcome> {
  const cacheKey = `deal-outcome:${range}`;
  const cached = getCached<BIDealOutcome>(cacheKey);
  if (cached) return cached;

  const { events } = await loadMetrics();
  const allEvents = events.map(e => ({ ...e, createdAt: new Date(e.createdAt) }));
  const ranged = filterByRange(allEvents, range);

  const scores = ranged.filter(e => e.eventType === "submission_score");
  const scoreDistribution = {
    green: scores.filter(e => e.metadata?.dealScore === "GREEN").length,
    yellow: scores.filter(e => e.metadata?.dealScore === "YELLOW").length,
    red: scores.filter(e => e.metadata?.dealScore === "RED").length,
  };

  const scoreValue = (s: string | undefined) => s === "GREEN" ? 3 : s === "YELLOW" ? 2 : 1;
  const scoresByDay: Record<string, number[]> = {};
  scores.forEach(e => {
    const date = e.createdAt.toISOString().split("T")[0];
    if (!scoresByDay[date]) scoresByDay[date] = [];
    scoresByDay[date].push(scoreValue(e.metadata?.dealScore as string | undefined));
  });
  const avgScoreByDay = Object.entries(scoresByDay)
    .map(([date, vals]) => ({ date, avgScore: vals.reduce((a, b) => a + b, 0) / vals.length }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  let topFeeTypes: Array<{ feeName: string; count: number }> = [];
  let topTacticFlags: Array<{ tactic: string; count: number }> = [];

  if (process.env.DATABASE_URL) {
    const { db } = await import("../db");
    const { dealerSubmissions } = await import("@shared/schema");
    const { gte, and, eq } = await import("drizzle-orm");

    const { start } = getDateBounds(range);
    // Exclude seeded rows from funnel/business metrics via
    // exclude_from_metrics = false (NOT ingestion_source = 'user'; the
    // boolean flag is future-proof for non-seed exclusions).
    const excludeSeeded = eq(dealerSubmissions.excludeFromMetrics, false);
    const rows = await (start
      ? db.select({
          feeNames: dealerSubmissions.feeNames,
          flagMarketAdjustment: dealerSubmissions.flagMarketAdjustment,
          flagPaymentOnly: dealerSubmissions.flagPaymentOnly,
          flagMissingOtd: dealerSubmissions.flagMissingOtd,
          flagVagueFees: dealerSubmissions.flagVagueFees,
          flagHighCostAddons: dealerSubmissions.flagHighCostAddons,
        }).from(dealerSubmissions).where(and(gte(dealerSubmissions.submittedAt, start), excludeSeeded))
      : db.select({
          feeNames: dealerSubmissions.feeNames,
          flagMarketAdjustment: dealerSubmissions.flagMarketAdjustment,
          flagPaymentOnly: dealerSubmissions.flagPaymentOnly,
          flagMissingOtd: dealerSubmissions.flagMissingOtd,
          flagVagueFees: dealerSubmissions.flagVagueFees,
          flagHighCostAddons: dealerSubmissions.flagHighCostAddons,
        }).from(dealerSubmissions).where(excludeSeeded));

    const feeNameCounts: Record<string, number> = {};
    const tacticCounts: Record<string, number> = {
      "Market Adjustment": 0,
      "Payment-Only Quote": 0,
      "Missing OTD Price": 0,
      "Vague Fees": 0,
      "High-Cost Add-ons": 0,
    };

    for (const row of rows) {
      if (Array.isArray(row.feeNames)) {
        for (const name of row.feeNames) {
          if (typeof name === "string" && name.trim()) {
            const normalized = name.trim().toLowerCase();
            feeNameCounts[normalized] = (feeNameCounts[normalized] || 0) + 1;
          }
        }
      }
      if (row.flagMarketAdjustment) tacticCounts["Market Adjustment"]++;
      if (row.flagPaymentOnly) tacticCounts["Payment-Only Quote"]++;
      if (row.flagMissingOtd) tacticCounts["Missing OTD Price"]++;
      if (row.flagVagueFees) tacticCounts["Vague Fees"]++;
      if (row.flagHighCostAddons) tacticCounts["High-Cost Add-ons"]++;
    }

    topFeeTypes = Object.entries(feeNameCounts)
      .map(([feeName, count]) => ({ feeName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    topTacticFlags = Object.entries(tacticCounts)
      .filter(([, count]) => count > 0)
      .map(([tactic, count]) => ({ tactic, count }))
      .sort((a, b) => b.count - a.count);
  }

  return setCached(cacheKey, { scoreDistribution, avgScoreByDay, topFeeTypes, topTacticFlags });
}

export interface BIGeographic {
  states: Array<{
    state: string;
    submissionCount: number;
    paymentCount: number;
    paymentRate: number;
    avgScore: number;
  }>;
}

export async function getBIGeographic(range: DateRange): Promise<BIGeographic> {
  const cacheKey = `geographic:${range}`;
  const cached = getCached<BIGeographic>(cacheKey);
  if (cached) return cached;

  const { events } = await loadMetrics();
  const allKvEvents = events.map(e => ({ ...e, createdAt: new Date(e.createdAt) }));
  const rangedKv = filterByRange(allKvEvents, range);

  const kvSubmissions = rangedKv.filter(e => e.eventType === "submission");
  const kvPayments = rangedKv.filter(e => e.eventType === "payment_completed");

  const sessionIdToState: Record<string, string> = {};
  const statePayments: Record<string, number> = {};

  if (process.env.DATABASE_URL) {
    const { db } = await import("../db");
    const { dealerSubmissions } = await import("@shared/schema");
    const { gte, and, eq } = await import("drizzle-orm");

    const { start } = getDateBounds(range);
    // Exclude seeded rows from geographic/funnel metrics.
    const excludeSeeded = eq(dealerSubmissions.excludeFromMetrics, false);
    const rows = await (start
      ? db.select({
          stateCode: dealerSubmissions.stateCode,
          dealScore: dealerSubmissions.dealScore,
        }).from(dealerSubmissions).where(and(gte(dealerSubmissions.submittedAt, start), excludeSeeded))
      : db.select({
          stateCode: dealerSubmissions.stateCode,
          dealScore: dealerSubmissions.dealScore,
        }).from(dealerSubmissions).where(excludeSeeded));

    const stateCounts: Record<string, { submissions: number; scores: number[] }> = {};
    const scoreVal = (s: string) => s === "GREEN" ? 3 : s === "YELLOW" ? 2 : 1;

    for (const row of rows) {
      const state = row.stateCode ?? "Unknown";
      if (!stateCounts[state]) stateCounts[state] = { submissions: 0, scores: [] };
      stateCounts[state].submissions++;
      stateCounts[state].scores.push(scoreVal(row.dealScore));
    }

    const kvStateDetections = allKvEvents.filter(
      e => e.eventType === "state_detection" && e.metadata?.state && e.metadata?.capViolation === undefined
    );

    const sortedStateDetections = kvStateDetections.slice().sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );

    kvSubmissions.forEach(subEvt => {
      const sessionId = subEvt.metadata?.sessionId as string | undefined;
      if (!sessionId || sessionIdToState[sessionId]) return;
      const subTs = subEvt.createdAt.getTime();
      let best: { state: string; delta: number } | null = null;
      for (const sd of sortedStateDetections) {
        const delta = Math.abs(sd.createdAt.getTime() - subTs);
        if (delta < 60000 && (!best || delta < best.delta)) {
          best = { state: sd.metadata?.state as string, delta };
        }
      }
      if (best) sessionIdToState[sessionId] = best.state;
    });

    for (const payEvt of kvPayments) {
      const sessionId = payEvt.metadata?.sessionId as string | undefined;
      if (!sessionId) continue;
      const state = sessionIdToState[sessionId];
      if (!state) continue;
      statePayments[state] = (statePayments[state] || 0) + 1;
    }

    const states = Object.entries(stateCounts).map(([state, data]) => {
      const paymentCount = statePayments[state] || 0;
      return {
        state,
        submissionCount: data.submissions,
        paymentCount,
        paymentRate: data.submissions > 0 ? (paymentCount / data.submissions) * 100 : 0,
        avgScore: data.scores.length > 0 ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length : 0,
      };
    }).sort((a, b) => b.submissionCount - a.submissionCount);

    return setCached(cacheKey, { states });
  }

  const stateDetections = rangedKv.filter(
    e => e.eventType === "state_detection" && e.metadata?.state && e.metadata?.capViolation === undefined
  );

  const stateCounts: Record<string, { submissions: number }> = {};
  stateDetections.forEach(e => {
    const state = e.metadata?.state as string;
    if (!state) return;
    if (!stateCounts[state]) stateCounts[state] = { submissions: 0 };
    stateCounts[state].submissions++;
  });

  const states = Object.entries(stateCounts).map(([state, data]) => ({
    state,
    submissionCount: data.submissions,
    paymentCount: 0,
    paymentRate: 0,
    avgScore: 0,
  })).sort((a, b) => b.submissionCount - a.submissionCount);

  return setCached(cacheKey, { states });
}

export interface BIAcquisition {
  sources: Array<{
    source: string;
    views: number;
    sessions: number;
    submissions: number;
    submissionRate: number;
    payments: number;
    paymentRate: number;
  }>;
}

export async function getBIAcquisition(range: DateRange): Promise<BIAcquisition> {
  const { events } = await loadMetrics();
  const allEvents = events.map(e => ({ ...e, createdAt: new Date(e.createdAt) }));
  const ranged = filterByRange(allEvents, range);

  const pageViews = ranged.filter(e => e.eventType === "page_view");
  const submissions = ranged.filter(e => e.eventType === "submission");
  const payments = ranged.filter(e => e.eventType === "payment_completed");

  const sessionSource: Record<string, string> = {};
  pageViews.forEach(e => {
    const sessionId = e.metadata?.sessionId as string | undefined;
    if (!sessionId) return;
    if (!sessionSource[sessionId]) {
      const referrer = e.metadata?.referrer as string | undefined;
      if (!referrer || referrer === "") {
        sessionSource[sessionId] = "direct";
      } else {
        try {
          const url = new URL(referrer);
          sessionSource[sessionId] = url.hostname;
        } catch {
          sessionSource[sessionId] = referrer.length > 50 ? referrer.slice(0, 50) : referrer;
        }
      }
    }
  });

  const sourceStats: Record<string, {
    views: number;
    sessions: Set<string>;
    submissions: number;
    payments: number;
  }> = {};

  pageViews.forEach(e => {
    const sessionId = e.metadata?.sessionId as string | undefined;
    const source = (sessionId && sessionSource[sessionId]) || "direct";
    if (!sourceStats[source]) sourceStats[source] = { views: 0, sessions: new Set(), submissions: 0, payments: 0 };
    sourceStats[source].views++;
    if (sessionId) sourceStats[source].sessions.add(sessionId);
  });

  submissions.forEach(e => {
    const sessionId = e.metadata?.sessionId as string | undefined;
    const source = (sessionId && sessionSource[sessionId]) || "unknown";
    if (!sourceStats[source]) sourceStats[source] = { views: 0, sessions: new Set(), submissions: 0, payments: 0 };
    sourceStats[source].submissions++;
  });

  payments.forEach(e => {
    const sessionId = e.metadata?.sessionId as string | undefined;
    const source = (sessionId && sessionSource[sessionId]) || "unknown";
    if (!sourceStats[source]) sourceStats[source] = { views: 0, sessions: new Set(), submissions: 0, payments: 0 };
    sourceStats[source].payments++;
  });

  const sources = Object.entries(sourceStats).map(([source, data]) => ({
    source,
    views: data.views,
    sessions: data.sessions.size,
    submissions: data.submissions,
    submissionRate: data.sessions.size > 0 ? (data.submissions / data.sessions.size) * 100 : 0,
    payments: data.payments,
    paymentRate: data.submissions > 0 ? (data.payments / data.submissions) * 100 : 0,
  })).filter(s => s.source !== "unknown" || s.views > 0)
    .sort((a, b) => b.views - a.views);

  return { sources };
}

export interface BIRevenue {
  totalRevenue: number;
  revenueThisWeek: number;
  revenueLastWeek: number;
  avgRevenuePerPayer: number;
  estimatedMonthlyRunRate: number;
  paymentConversionRate: number;
  revenueByDay: Array<{ date: string; revenue: number }>;
  paymentConversionByDay: Array<{ date: string; rate: number }>;
}

export async function getBIRevenue(range: DateRange): Promise<BIRevenue> {
  const { events } = await loadMetrics();
  const allEvents = events.map(e => ({ ...e, createdAt: new Date(e.createdAt) }));
  const ranged = filterByRange(allEvents, range);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart.getTime() - 7 * 86400000);
  const lastWeekStart = new Date(todayStart.getTime() - 14 * 86400000);

  const getRevAmount = (e: (typeof allEvents)[0]) => {
    const tier = e.metadata?.tier;
    return tier === "49" ? 49 : tier === "79" ? 79 : 49;
  };

  const payments = ranged.filter(e => e.eventType === "payment_completed");
  const submissions = ranged.filter(e => e.eventType === "submission");

  const totalRevenue = payments.reduce((sum, e) => sum + getRevAmount(e), 0);
  const revenueThisWeek = allEvents
    .filter(e => e.eventType === "payment_completed" && e.createdAt >= weekStart)
    .reduce((sum, e) => sum + getRevAmount(e), 0);
  const revenueLastWeek = allEvents
    .filter(e => e.eventType === "payment_completed" && e.createdAt >= lastWeekStart && e.createdAt < weekStart)
    .reduce((sum, e) => sum + getRevAmount(e), 0);

  const avgRevenuePerPayer = payments.length > 0 ? totalRevenue / payments.length : 0;

  const thirtyDaysAgo = new Date(todayStart.getTime() - 30 * 86400000);
  const revLast30 = allEvents
    .filter(e => e.eventType === "payment_completed" && e.createdAt >= thirtyDaysAgo)
    .reduce((sum, e) => sum + getRevAmount(e), 0);
  const estimatedMonthlyRunRate = revLast30;

  const paymentConversionRate = submissions.length > 0 ? (payments.length / submissions.length) * 100 : 0;

  const revByDayMap: Record<string, number> = {};
  const subsByDayMap: Record<string, number> = {};
  const paysByDayMap: Record<string, number> = {};

  payments.forEach(e => {
    const date = e.createdAt.toISOString().split("T")[0];
    revByDayMap[date] = (revByDayMap[date] || 0) + getRevAmount(e);
    paysByDayMap[date] = (paysByDayMap[date] || 0) + 1;
  });
  submissions.forEach(e => {
    const date = e.createdAt.toISOString().split("T")[0];
    subsByDayMap[date] = (subsByDayMap[date] || 0) + 1;
  });

  const revenueByDay = Object.entries(revByDayMap)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  const paymentConversionByDay = Object.entries(subsByDayMap).map(([date, subs]) => ({
    date,
    rate: subs > 0 ? ((paysByDayMap[date] || 0) / subs) * 100 : 0,
  })).sort((a, b) => a.date.localeCompare(b.date)).slice(-30);

  return {
    totalRevenue,
    revenueThisWeek,
    revenueLastWeek,
    avgRevenuePerPayer,
    estimatedMonthlyRunRate,
    paymentConversionRate,
    revenueByDay,
    paymentConversionByDay,
  };
}

export interface BIFallout {
  checkoutsWithoutPayment: number;
  avgMinutesSubmissionToCheckout: number | null;
  dropoffByHour: Array<{ hour: number; checkouts: number; payments: number; dropoff: number }>;
}

export async function getBIFallout(range: DateRange): Promise<BIFallout> {
  const { events } = await loadMetrics();
  const allEvents = events.map(e => ({ ...e, createdAt: new Date(e.createdAt) }));
  const ranged = filterByRange(allEvents, range);

  const checkouts = ranged.filter(e => e.eventType === "checkout_started");
  const payments = ranged.filter(e => e.eventType === "payment_completed");
  const submissions = ranged.filter(e => e.eventType === "submission");

  const paidSessions = new Set(
    payments.map(e => e.metadata?.stripeSessionId as string | undefined).filter(Boolean)
  );
  const checkoutsWithoutPayment = checkouts.filter(e => {
    const sid = e.metadata?.stripeSessionId as string | undefined;
    return !sid || !paidSessions.has(sid);
  }).length;

  const submissionBySession: Record<string, Date> = {};
  submissions.forEach(e => {
    const sid = e.metadata?.sessionId as string | undefined;
    if (sid) submissionBySession[sid] = e.createdAt;
  });
  const checkoutBySession: Record<string, Date> = {};
  checkouts.forEach(e => {
    const sid = e.metadata?.sessionId as string | undefined;
    if (sid) checkoutBySession[sid] = e.createdAt;
  });

  const deltas: number[] = [];
  for (const [sid, subTime] of Object.entries(submissionBySession)) {
    if (checkoutBySession[sid]) {
      const delta = (checkoutBySession[sid].getTime() - subTime.getTime()) / 60000;
      if (delta >= 0 && delta < 1440) deltas.push(delta);
    }
  }
  const avgMinutesSubmissionToCheckout = deltas.length > 0
    ? deltas.reduce((a, b) => a + b, 0) / deltas.length
    : null;

  const checkoutsByHour: Record<number, number> = {};
  const paymentsByHour: Record<number, number> = {};
  for (let i = 0; i < 24; i++) { checkoutsByHour[i] = 0; paymentsByHour[i] = 0; }
  checkouts.forEach(e => { checkoutsByHour[e.createdAt.getHours()]++; });
  payments.forEach(e => { paymentsByHour[e.createdAt.getHours()]++; });

  const dropoffByHour = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    checkouts: checkoutsByHour[hour],
    payments: paymentsByHour[hour],
    dropoff: checkoutsByHour[hour] > 0
      ? ((checkoutsByHour[hour] - paymentsByHour[hour]) / checkoutsByHour[hour]) * 100
      : 0,
  }));

  return { checkoutsWithoutPayment, avgMinutesSubmissionToCheckout, dropoffByHour };
}

export interface BISubscriptionHealth {
  totalPayers: number;
  newPayersThisWeek: number;
  newPayersLastWeek: number;
  weekOverWeekGrowthPct: number | null;
  checkoutConversionRate: number;
  checkoutsWithoutPayment: number;
  estimatedRevenue: number;
  tierBreakdown: { tier49: number; tier79: number; other: number };
  dailyNewPayers: Array<{ date: string; count: number }>;
}

export async function getBISubscriptionHealth(range: DateRange): Promise<BISubscriptionHealth> {
  const { events } = await loadMetrics();
  const allEvents = events.map(e => ({ ...e, createdAt: new Date(e.createdAt) }));
  const ranged = filterByRange(allEvents, range);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart.getTime() - 7 * 86400000);
  const lastWeekStart = new Date(todayStart.getTime() - 14 * 86400000);

  const payments = ranged.filter(e => e.eventType === "payment_completed");
  const checkouts = ranged.filter(e => e.eventType === "checkout_started");

  const totalPayers = new Set(
    payments.map(e => e.metadata?.sessionId as string).filter(Boolean)
  ).size;

  const newPayersThisWeek = new Set(
    allEvents
      .filter(e => e.eventType === "payment_completed" && e.createdAt >= weekStart)
      .map(e => e.metadata?.sessionId as string)
      .filter(Boolean)
  ).size;

  const newPayersLastWeek = new Set(
    allEvents
      .filter(e => e.eventType === "payment_completed" && e.createdAt >= lastWeekStart && e.createdAt < weekStart)
      .map(e => e.metadata?.sessionId as string)
      .filter(Boolean)
  ).size;

  const weekOverWeekGrowthPct = newPayersLastWeek > 0
    ? ((newPayersThisWeek - newPayersLastWeek) / newPayersLastWeek) * 100
    : null;

  const checkoutConversionRate = checkouts.length > 0 ? (payments.length / checkouts.length) * 100 : 0;

  const paidStripeIds = new Set(
    payments.map(e => e.metadata?.stripeSessionId as string | undefined).filter(Boolean)
  );
  const checkoutsWithoutPayment = checkouts.filter(e => {
    const sid = e.metadata?.stripeSessionId as string | undefined;
    return !sid || !paidStripeIds.has(sid);
  }).length;

  const tierBreakdown = { tier49: 0, tier79: 0, other: 0 };
  let estimatedRevenue = 0;
  payments.forEach(e => {
    const tier = e.metadata?.tier;
    if (tier === "49") { tierBreakdown.tier49++; estimatedRevenue += 49; }
    else if (tier === "79") { tierBreakdown.tier79++; estimatedRevenue += 79; }
    else { tierBreakdown.other++; estimatedRevenue += 49; }
  });

  const thirtyDaysAgo = new Date(todayStart.getTime() - 30 * 86400000);
  const recentPayments = allEvents.filter(e => e.eventType === "payment_completed" && e.createdAt >= thirtyDaysAgo);
  const paysByDayMap: Record<string, Set<string>> = {};
  recentPayments.forEach(e => {
    const date = e.createdAt.toISOString().split("T")[0];
    const sid = e.metadata?.sessionId as string | undefined;
    if (!paysByDayMap[date]) paysByDayMap[date] = new Set();
    if (sid) paysByDayMap[date].add(sid);
    else paysByDayMap[date].add(`anon-${e.id ?? Math.random()}`);
  });

  const dailyNewPayers = Object.entries(paysByDayMap)
    .map(([date, sids]) => ({ date, count: sids.size }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { totalPayers, newPayersThisWeek, newPayersLastWeek, weekOverWeekGrowthPct, checkoutConversionRate, checkoutsWithoutPayment, estimatedRevenue, tierBreakdown, dailyNewPayers };
}

export interface BIAnalysis {
  timestamp: string;
  verdict: string;
  dealerId?: string;
  vehicleYear?: number;
  vehicleMake?: string;
}

export interface BIUserSession {
  sessionId: string;
  firstSeen: string;
  lastSeen: string;
  eventCount: number;
  eventTypes: string[];
  hasPaid: boolean;
  verdicts: string[];
  stripeSessionIds: string[];
  analysisHistory: BIAnalysis[];
  paymentHistory: Array<{ timestamp: string; stripeSessionId: string }>;
}

export async function lookupUserSessions(query: string, limit = 50, stripeCustomerSessionIds: string[] = []): Promise<BIUserSession[]> {
  const { events } = await loadMetrics();
  const allEvents = events.map(e => ({ ...e, createdAt: new Date(e.createdAt) }));

  const q = query.trim().toLowerCase();
  const customerSessionSet = new Set(stripeCustomerSessionIds.map(s => s.toLowerCase()));

  const sessionMatchesQuery = (sid: string, evts: Array<{ eventType: string; metadata?: Record<string, unknown> | null }>) => {
    if (!q) return true;
    if (sid.toLowerCase().includes(q)) return true;
    return evts.some(e => {
      const stripeSid = e.metadata?.stripeSessionId as string | undefined;
      if (stripeSid && stripeSid.toLowerCase().includes(q)) return true;
      if (customerSessionSet.size > 0 && stripeSid && customerSessionSet.has(stripeSid.toLowerCase())) return true;
      return false;
    });
  };

  const sessionMap: Record<string, typeof allEvents> = {};
  allEvents.forEach(e => {
    const sid = e.metadata?.sessionId as string | undefined;
    if (!sid) return;
    if (!sessionMap[sid]) sessionMap[sid] = [];
    sessionMap[sid].push(e);
  });

  return Object.entries(sessionMap)
    .filter(([sid, evts]) => sessionMatchesQuery(sid, evts))
    .map(([sessionId, evts]) => buildSessionSummary(sessionId, evts))
    .sort((a, b) => b.lastSeen.localeCompare(a.lastSeen))
    .slice(0, limit);
}

function buildSessionSummary(sessionId: string, evts: Array<{ createdAt: Date; eventType: string; metadata?: Record<string, unknown> | null }>): BIUserSession {
  const sorted = evts.slice().sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const types = Array.from(new Set(evts.map(e => e.eventType)));
  const hasPaid = types.includes("payment_completed");
  const verdicts = evts
    .filter(e => e.eventType === "submission" && e.metadata?.dealScore)
    .map(e => e.metadata!.dealScore as string);
  const stripeSessionIds = Array.from(new Set(
    evts
      .filter(e => e.metadata?.stripeSessionId)
      .map(e => e.metadata!.stripeSessionId as string)
  ));
  const analysisHistory: BIAnalysis[] = evts
    .filter(e => e.eventType === "submission" && e.metadata?.dealScore)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map(e => ({
      timestamp: e.createdAt.toISOString(),
      verdict: e.metadata!.dealScore as string,
      dealerId: e.metadata?.dealerId as string | undefined,
      vehicleYear: e.metadata?.vehicleYear as number | undefined,
      vehicleMake: e.metadata?.vehicleMake as string | undefined,
    }));
  const paymentHistory = evts
    .filter(e => e.eventType === "payment_completed" && e.metadata?.stripeSessionId)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map(e => ({
      timestamp: e.createdAt.toISOString(),
      stripeSessionId: e.metadata!.stripeSessionId as string,
    }));
  return {
    sessionId,
    firstSeen: sorted[0].createdAt.toISOString(),
    lastSeen: sorted[sorted.length - 1].createdAt.toISOString(),
    eventCount: evts.length,
    eventTypes: types,
    hasPaid,
    verdicts,
    stripeSessionIds,
    analysisHistory,
    paymentHistory,
  };
}

export interface BIContentPage {
  page: string;
  views: number;
  sessions: number;
  analyzeStarts: number;
  conversions: number;
  conversionRate: number;
  ctaClicks: number;
}

export interface BIContentMetrics {
  pages: BIContentPage[];
  totalViews: number;
  totalSessions: number;
  totalAnalyzeStarts: number;
  totalConversions: number;
}

export async function getBIContentMetrics(range: DateRange): Promise<BIContentMetrics> {
  const { events } = await loadMetrics();
  const allEvents = events.map(e => ({ ...e, createdAt: new Date(e.createdAt) }));
  const ranged = filterByRange(allEvents, range);

  const pageViews = ranged.filter(e => e.eventType === "page_view");
  const analyzeStarts = ranged.filter(e => e.eventType === "analyze_start" || e.eventType === "submission");
  const payments = ranged.filter(e => e.eventType === "payment_completed");
  const ctaClicks = ranged.filter(e => e.eventType === "cta_click");

  const getPageSlug = (e: { metadata?: Record<string, unknown> | null }): string => {
    return (e.metadata?.page_slug as string) || (e.metadata?.page as string) || "/";
  };

  const sessionEntryPage: Record<string, string> = {};
  const pageViewsSorted = pageViews.slice().sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  pageViewsSorted.forEach(e => {
    const sid = e.metadata?.sessionId as string | undefined;
    const page = getPageSlug(e);
    if (sid && !sessionEntryPage[sid]) sessionEntryPage[sid] = page;
  });

  const pageStats: Record<string, {
    views: number;
    sessions: Set<string>;
    analyzeStarts: number;
    conversions: number;
    ctaClicks: number;
  }> = {};

  const getOrCreate = (page: string) => {
    if (!pageStats[page]) pageStats[page] = { views: 0, sessions: new Set(), analyzeStarts: 0, conversions: 0, ctaClicks: 0 };
    return pageStats[page];
  };

  pageViews.forEach(e => {
    const page = getPageSlug(e);
    const sid = e.metadata?.sessionId as string | undefined;
    const ps = getOrCreate(page);
    ps.views++;
    if (sid) ps.sessions.add(sid);
  });

  ctaClicks.forEach(e => {
    const sid = e.metadata?.sessionId as string | undefined;
    const page = (sid && sessionEntryPage[sid]) || getPageSlug(e);
    getOrCreate(page).ctaClicks++;
  });

  analyzeStarts.forEach(e => {
    const slug = getPageSlug(e);
    const sid = e.metadata?.sessionId as string | undefined;
    const page = slug !== "/" ? slug : (sid && sessionEntryPage[sid]) || "/";
    getOrCreate(page).analyzeStarts++;
  });

  payments.forEach(e => {
    const sid = e.metadata?.sessionId as string | undefined;
    const page = (sid && sessionEntryPage[sid]) || "/";
    getOrCreate(page).conversions++;
  });

  const pages: BIContentPage[] = Object.entries(pageStats)
    .map(([page, data]) => ({
      page,
      views: data.views,
      sessions: data.sessions.size,
      analyzeStarts: data.analyzeStarts,
      conversions: data.conversions,
      conversionRate: data.sessions.size > 0 ? (data.conversions / data.sessions.size) * 100 : 0,
      ctaClicks: data.ctaClicks,
    }))
    .sort((a, b) => b.views - a.views);

  return {
    pages,
    totalViews: pages.reduce((s, p) => s + p.views, 0),
    totalSessions: new Set(pageViews.map(e => e.metadata?.sessionId as string).filter(Boolean)).size,
    totalAnalyzeStarts: analyzeStarts.length,
    totalConversions: payments.length,
  };
}
