import { loadMetrics } from "./events.js";

export interface MetricsSummary {
  totalSubmissions: number;
  totalPayments: number;
  totalCheckouts: number;
  revenue: number;
  conversionRate: number;
  checkoutToPaymentRate: number;
  scoreDistribution: {
    green: number;
    yellow: number;
    red: number;
  };
  recentEvents: Array<{
    eventType: string;
    createdAt: Date;
    metadata: unknown;
  }>;
  submissionsByDay: Array<{
    date: string;
    count: number;
  }>;
  revenueByDay: Array<{
    date: string;
    revenue: number;
  }>;
  hourlyActivity: Array<{
    hour: number;
    count: number;
  }>;
  pageViews: Array<{
    page: string;
    count: number;
  }>;
  referrers: Array<{
    source: string;
    count: number;
  }>;
  trends: {
    submissionsToday: number;
    submissionsYesterday: number;
    revenueToday: number;
    revenueYesterday: number;
    submissionsThisWeek: number;
    submissionsLastWeek: number;
    revenueThisWeek: number;
    revenueLastWeek: number;
  };
  funnel: {
    submissions: number;
    checkouts: number;
    payments: number;
  };
  engagement: {
    totalPageViews: number;
    landingPageViews: number;
    analyzePageViews: number;
    ctaClicks: number;
    formStarts: number;
    landingToAnalyzeCtr: number;
    analyzeToSubmissionRate: number;
    formStartToSubmissionRate: number;
    ctaClicksByButton: Array<{ ctaId: string; label: string; count: number }>;
  };
}

export async function getMetricsSummary(): Promise<MetricsSummary> {
  const { events } = await loadMetrics();
  
  const allEvents = events.map(e => ({
    ...e,
    createdAt: new Date(e.createdAt),
  })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
  const submissions = allEvents.filter(e => e.eventType === "submission");
  const payments = allEvents.filter(e => e.eventType === "payment_completed");
  const checkouts = allEvents.filter(e => e.eventType === "checkout_started");
  const scores = allEvents.filter(e => e.eventType === "submission_score");
  const pageViewEvents = allEvents.filter(e => e.eventType === "page_view");
  const ctaClickEvents = allEvents.filter(e => e.eventType === "cta_click");
  const formStartEvents = allEvents.filter(e => e.eventType === "form_start");
  
  const scoreDistribution = {
    green: scores.filter(e => e.metadata?.dealScore === "GREEN").length,
    yellow: scores.filter(e => e.metadata?.dealScore === "YELLOW").length,
    red: scores.filter(e => e.metadata?.dealScore === "RED").length,
  };
  
  const getRevenue = (evts: typeof payments) => evts.reduce((sum, p) => {
    const tier = p.metadata?.tier;
    return sum + (tier === "49" ? 49 : tier === "79" ? 79 : 49);
  }, 0);
  
  const revenue = getRevenue(payments);
  
  const submissionsByDay: Record<string, number> = {};
  submissions.forEach(s => {
    const date = s.createdAt.toISOString().split("T")[0];
    submissionsByDay[date] = (submissionsByDay[date] || 0) + 1;
  });
  
  const revenueByDayMap: Record<string, number> = {};
  payments.forEach(p => {
    const date = p.createdAt.toISOString().split("T")[0];
    const tier = p.metadata?.tier;
    const amount = tier === "49" ? 49 : tier === "79" ? 79 : 49;
    revenueByDayMap[date] = (revenueByDayMap[date] || 0) + amount;
  });
  
  const hourlyActivityMap: Record<number, number> = {};
  for (let i = 0; i < 24; i++) hourlyActivityMap[i] = 0;
  allEvents.forEach(e => {
    const hour = e.createdAt.getHours();
    hourlyActivityMap[hour] = (hourlyActivityMap[hour] || 0) + 1;
  });
  
  const pageViewCounts: Record<string, number> = {};
  pageViewEvents.forEach(e => {
    const page = e.metadata?.page || "unknown";
    pageViewCounts[page] = (pageViewCounts[page] || 0) + 1;
  });
  
  const referrerCounts: Record<string, number> = {};
  pageViewEvents.forEach(e => {
    const referrer = e.metadata?.referrer || "direct";
    referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;
  });
  
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
  const thisWeekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastWeekStart = new Date(todayStart.getTime() - 14 * 24 * 60 * 60 * 1000);
  
  const submissionsToday = submissions.filter(s => s.createdAt >= todayStart).length;
  const submissionsYesterday = submissions.filter(s => s.createdAt >= yesterdayStart && s.createdAt < todayStart).length;
  const submissionsThisWeek = submissions.filter(s => s.createdAt >= thisWeekStart).length;
  const submissionsLastWeek = submissions.filter(s => s.createdAt >= lastWeekStart && s.createdAt < thisWeekStart).length;
  
  const paymentsToday = payments.filter(p => p.createdAt >= todayStart);
  const paymentsYesterday = payments.filter(p => p.createdAt >= yesterdayStart && p.createdAt < todayStart);
  const paymentsThisWeek = payments.filter(p => p.createdAt >= thisWeekStart);
  const paymentsLastWeek = payments.filter(p => p.createdAt >= lastWeekStart && p.createdAt < thisWeekStart);
  
  return {
    totalSubmissions: submissions.length,
    totalPayments: payments.length,
    totalCheckouts: checkouts.length,
    revenue,
    conversionRate: submissions.length > 0 ? (payments.length / submissions.length) * 100 : 0,
    checkoutToPaymentRate: checkouts.length > 0 ? (payments.length / checkouts.length) * 100 : 0,
    scoreDistribution,
    recentEvents: allEvents.slice(0, 30).map(e => ({
      eventType: e.eventType,
      createdAt: e.createdAt,
      metadata: e.metadata,
    })),
    submissionsByDay: Object.entries(submissionsByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30),
    revenueByDay: Object.entries(revenueByDayMap)
      .map(([date, rev]) => ({ date, revenue: rev }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30),
    hourlyActivity: Object.entries(hourlyActivityMap)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => a.hour - b.hour),
    pageViews: Object.entries(pageViewCounts)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count),
    referrers: Object.entries(referrerCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count),
    trends: {
      submissionsToday,
      submissionsYesterday,
      revenueToday: getRevenue(paymentsToday),
      revenueYesterday: getRevenue(paymentsYesterday),
      submissionsThisWeek,
      submissionsLastWeek,
      revenueThisWeek: getRevenue(paymentsThisWeek),
      revenueLastWeek: getRevenue(paymentsLastWeek),
    },
    funnel: {
      submissions: submissions.length,
      checkouts: checkouts.length,
      payments: payments.length,
    },
    engagement: (() => {
      const landingPageViews = pageViewEvents.filter(e => e.metadata?.page === "/").length;
      const analyzePageViews = pageViewEvents.filter(e => e.metadata?.page === "/analyze").length;
      const totalPageViews = pageViewEvents.length;
      const ctaClicks = ctaClickEvents.length;
      const formStarts = formStartEvents.length;
      
      const sessionsWithLandingView = new Set(
        pageViewEvents.filter(e => e.metadata?.page === "/" && e.metadata?.sessionId)
          .map(e => e.metadata!.sessionId)
      );
      const sessionsWithCtaClick = new Set(
        ctaClickEvents.filter(e => e.metadata?.sessionId)
          .map(e => e.metadata!.sessionId)
      );
      const sessionsWithAnalyzeView = new Set(
        pageViewEvents.filter(e => e.metadata?.page === "/analyze" && e.metadata?.sessionId)
          .map(e => e.metadata!.sessionId)
      );
      const sessionsWithFormStart = new Set(
        formStartEvents.filter(e => e.metadata?.sessionId)
          .map(e => e.metadata!.sessionId)
      );
      const sessionsWithSubmission = new Set(
        submissions.filter(e => e.metadata?.sessionId)
          .map(e => e.metadata!.sessionId)
      );
      
      const uniqueLandingVisitors = sessionsWithLandingView.size || landingPageViews;
      const uniqueCtaClickers = sessionsWithCtaClick.size || ctaClicks;
      const uniqueAnalyzeVisitors = sessionsWithAnalyzeView.size || analyzePageViews;
      const uniqueFormStarters = sessionsWithFormStart.size || formStarts;
      const uniqueSubmitters = sessionsWithSubmission.size || submissions.length;
      
      const ctaClicksByButtonMap: Record<string, { label: string; count: number }> = {};
      ctaClickEvents.forEach(e => {
        const ctaId = e.metadata?.ctaId || "unknown";
        const label = e.metadata?.ctaLabel || ctaId;
        if (!ctaClicksByButtonMap[ctaId]) {
          ctaClicksByButtonMap[ctaId] = { label, count: 0 };
        }
        ctaClicksByButtonMap[ctaId].count++;
      });
      
      return {
        totalPageViews,
        landingPageViews,
        analyzePageViews,
        ctaClicks,
        formStarts,
        landingToAnalyzeCtr: uniqueLandingVisitors > 0 ? (uniqueCtaClickers / uniqueLandingVisitors) * 100 : 0,
        analyzeToSubmissionRate: uniqueAnalyzeVisitors > 0 ? (uniqueSubmitters / uniqueAnalyzeVisitors) * 100 : 0,
        formStartToSubmissionRate: uniqueFormStarters > 0 ? (uniqueSubmitters / uniqueFormStarters) * 100 : 0,
        ctaClicksByButton: Object.entries(ctaClicksByButtonMap)
          .map(([ctaId, data]) => ({ ctaId, label: data.label, count: data.count }))
          .sort((a, b) => b.count - a.count),
      };
    })(),
  };
}

export interface TechnicalSummary {
  apiPerformance: Array<{
    endpoint: string;
    requestCount: number;
    p50Ms: number;
    p95Ms: number;
    errorCount: number;
    errorRate: number;
    hourlyBuckets: Array<{ hour: string; count: number; avgMs: number }>;
  }>;
  errorLog: Array<{
    timestamp: string;
    endpoint: string;
    statusCode: number;
    message: string;
  }>;
  totalErrors: number;
  totalRequests: number;
  overallErrorRate: number;
  errorsByEndpoint: Array<{ endpoint: string; errorCount: number; errorRate: number }>;
  errorsByStatusCode: Array<{ statusCode: number; count: number }>;
  hourlyErrorRate: Array<{ hour: string; errors: number; requests: number; errorRate: number }>;
  aiUsage: {
    callCount: number;
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    estimatedCostUsd: number;
    avgLatencyMs: number;
    dailyBuckets: Array<{ date: string; calls: number; tokens: number; costUsd: number }>;
    monthly: {
      callCount: number;
      totalTokens: number;
      estimatedCostUsd: number;
    };
  };
  fileProcessing: {
    uploadAttempts: number;
    successes: number;
    failures: number;
    failureReasons: Array<{ reason: string; count: number }>;
  };
  stripeWebhooks: {
    received: number;
    succeeded: number;
    failed: number;
    lastEventAt: string | null;
  };
  webVitals: {
    lcp: { avg: number | null; rating: string | null };
    cls: { avg: number | null; rating: string | null };
    fid: { avg: number | null; rating: string | null };
    inp: { avg: number | null; rating: string | null };
    fcp: { avg: number | null; rating: string | null };
  };
}

const GPT4O_PROMPT_COST_PER_1K = 0.005;
const GPT4O_COMPLETION_COST_PER_1K = 0.015;

export async function getTechnicalSummary(): Promise<TechnicalSummary> {
  const { events } = await loadMetrics();
  
  const allEvents = events.map(e => ({
    ...e,
    createdAt: new Date(e.createdAt),
  }));

  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const trackedEndpoints = ["/api/analyze", "/api/extract-text", "/api/track", "/api/metrics", "/api/checkout"];

  const apiRequests = allEvents.filter(e => e.eventType === "api_request" && e.createdAt >= last24h);
  const apiErrors = allEvents.filter(e => e.eventType === "api_error" && e.createdAt >= last24h);

  const apiPerformance = trackedEndpoints.map(endpoint => {
    const reqs = apiRequests.filter(e => e.metadata?.endpoint === endpoint);
    const errs = apiErrors.filter(e => e.metadata?.endpoint === endpoint);
    const allForEndpoint = [...reqs, ...errs];
    const totalCount = allForEndpoint.length;
    const latencies = allForEndpoint
      .map(e => e.metadata?.responseTimeMs as number)
      .filter(v => typeof v === "number")
      .sort((a, b) => a - b);

    const p50 = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.5)] : 0;
    const p95 = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.95)] : 0;

    const hourlyMap: Record<string, { count: number; totalMs: number }> = {};
    for (let i = 0; i < 24; i++) {
      const h = new Date(last24h.getTime() + i * 60 * 60 * 1000);
      const key = h.toISOString().slice(0, 13);
      hourlyMap[key] = { count: 0, totalMs: 0 };
    }
    allForEndpoint.forEach(e => {
      const key = e.createdAt.toISOString().slice(0, 13);
      if (hourlyMap[key]) {
        hourlyMap[key].count++;
        hourlyMap[key].totalMs += (e.metadata?.responseTimeMs as number) || 0;
      }
    });

    const hourlyBuckets = Object.entries(hourlyMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([hour, data]) => ({
        hour: hour.slice(11) + ":00",
        count: data.count,
        avgMs: data.count > 0 ? Math.round(data.totalMs / data.count) : 0,
      }));

    return {
      endpoint,
      requestCount: totalCount,
      p50Ms: p50,
      p95Ms: p95,
      errorCount: errs.length,
      errorRate: totalCount > 0 ? (errs.length / totalCount) * 100 : 0,
      hourlyBuckets,
    };
  });

  const recentErrors = apiErrors
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 20)
    .map(e => ({
      timestamp: e.createdAt.toISOString(),
      endpoint: String(e.metadata?.endpoint || "unknown"),
      statusCode: Number(e.metadata?.statusCode || 0),
      message: String(e.metadata?.errorMessage || ""),
    }));

  const totalRequests = apiRequests.length + apiErrors.length;
  const totalErrors = apiErrors.length;

  const errorsByEndpointMap: Record<string, { errors: number; total: number }> = {};
  trackedEndpoints.forEach(ep => { errorsByEndpointMap[ep] = { errors: 0, total: 0 }; });
  apiRequests.forEach(e => {
    const ep = String(e.metadata?.endpoint || "");
    if (errorsByEndpointMap[ep]) errorsByEndpointMap[ep].total++;
  });
  apiErrors.forEach(e => {
    const ep = String(e.metadata?.endpoint || "");
    if (errorsByEndpointMap[ep]) { errorsByEndpointMap[ep].errors++; errorsByEndpointMap[ep].total++; }
  });
  const errorsByEndpoint = Object.entries(errorsByEndpointMap)
    .map(([endpoint, data]) => ({
      endpoint,
      errorCount: data.errors,
      errorRate: data.total > 0 ? (data.errors / data.total) * 100 : 0,
    }))
    .sort((a, b) => b.errorCount - a.errorCount);

  const statusCodeMap: Record<number, number> = {};
  apiErrors.forEach(e => {
    const code = Number(e.metadata?.statusCode || 0);
    statusCodeMap[code] = (statusCodeMap[code] || 0) + 1;
  });
  const errorsByStatusCode = Object.entries(statusCodeMap)
    .map(([code, count]) => ({ statusCode: Number(code), count }))
    .sort((a, b) => b.count - a.count);

  const hourlyErrMap: Record<string, { errors: number; requests: number }> = {};
  for (let i = 0; i < 24; i++) {
    const h = new Date(last24h.getTime() + i * 60 * 60 * 1000);
    const key = h.toISOString().slice(0, 13);
    hourlyErrMap[key] = { errors: 0, requests: 0 };
  }
  apiRequests.forEach(e => {
    const key = e.createdAt.toISOString().slice(0, 13);
    if (hourlyErrMap[key]) hourlyErrMap[key].requests++;
  });
  apiErrors.forEach(e => {
    const key = e.createdAt.toISOString().slice(0, 13);
    if (hourlyErrMap[key]) { hourlyErrMap[key].errors++; hourlyErrMap[key].requests++; }
  });
  const hourlyErrorRate = Object.entries(hourlyErrMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, data]) => ({
      hour: key.slice(11) + ":00",
      errors: data.errors,
      requests: data.requests,
      errorRate: data.requests > 0 ? Math.round((data.errors / data.requests) * 1000) / 10 : 0,
    }));

  const aiEvents = allEvents.filter(e => 
    e.eventType === "api_request" && e.metadata?.endpoint === "openai_chat" && e.createdAt >= last7d
  );
  
  const totalTokens = aiEvents.reduce((sum, e) => sum + ((e.metadata?.totalTokens as number) || 0), 0);
  const promptTokens = aiEvents.reduce((sum, e) => sum + ((e.metadata?.promptTokens as number) || 0), 0);
  const completionTokens = aiEvents.reduce((sum, e) => sum + ((e.metadata?.completionTokens as number) || 0), 0);
  const estimatedCostUsd = (promptTokens / 1000) * GPT4O_PROMPT_COST_PER_1K + (completionTokens / 1000) * GPT4O_COMPLETION_COST_PER_1K;
  const aiLatencies = aiEvents.map(e => (e.metadata?.responseTimeMs as number) || 0).filter(v => v > 0);
  const avgLatencyMs = aiLatencies.length > 0 ? Math.round(aiLatencies.reduce((a, b) => a + b, 0) / aiLatencies.length) : 0;

  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const aiEventsMonthly = allEvents.filter(e =>
    e.eventType === "api_request" && e.metadata?.endpoint === "openai_chat" && e.createdAt >= last30d
  );
  const monthlyPromptTokens = aiEventsMonthly.reduce((sum, e) => sum + ((e.metadata?.promptTokens as number) || 0), 0);
  const monthlyCompletionTokens = aiEventsMonthly.reduce((sum, e) => sum + ((e.metadata?.completionTokens as number) || 0), 0);
  const monthlyEstimatedCostUsd = (monthlyPromptTokens / 1000) * GPT4O_PROMPT_COST_PER_1K + (monthlyCompletionTokens / 1000) * GPT4O_COMPLETION_COST_PER_1K;

  const aiDailyMap: Record<string, { calls: number; tokens: number; promptTok: number; completionTok: number }> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(last7d.getTime() + i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    aiDailyMap[key] = { calls: 0, tokens: 0, promptTok: 0, completionTok: 0 };
  }
  aiEvents.forEach(e => {
    const key = e.createdAt.toISOString().split("T")[0];
    if (aiDailyMap[key]) {
      aiDailyMap[key].calls++;
      aiDailyMap[key].tokens += (e.metadata?.totalTokens as number) || 0;
      aiDailyMap[key].promptTok += (e.metadata?.promptTokens as number) || 0;
      aiDailyMap[key].completionTok += (e.metadata?.completionTokens as number) || 0;
    }
  });
  const aiDailyBuckets = Object.entries(aiDailyMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, data]) => ({
      date: date.slice(5),
      calls: data.calls,
      tokens: data.tokens,
      costUsd: (data.promptTok / 1000) * GPT4O_PROMPT_COST_PER_1K + (data.completionTok / 1000) * GPT4O_COMPLETION_COST_PER_1K,
    }));

  const fileEvents = allEvents.filter(e => e.eventType === "file_processing");
  const fileSuccesses = fileEvents.filter(e => e.metadata?.fileSuccess === true).length;
  const fileFailures = fileEvents.filter(e => e.metadata?.fileSuccess === false).length;
  const failReasonMap: Record<string, number> = {};
  fileEvents.filter(e => e.metadata?.fileSuccess === false).forEach(e => {
    const reason = String(e.metadata?.fileFailReason || "unknown");
    failReasonMap[reason] = (failReasonMap[reason] || 0) + 1;
  });
  const failureReasons = Object.entries(failReasonMap)
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);

  const webhookEvents = allEvents.filter(e => e.eventType === "stripe_webhook");
  const webhookSucceeded = webhookEvents.filter(e => e.metadata?.webhookStatus === "success").length;
  const webhookFailed = webhookEvents.filter(e => e.metadata?.webhookStatus === "failed").length;
  const lastWebhook = webhookEvents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

  const vitalsEvents = allEvents.filter(e => e.eventType === "vitals");
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayVitals = vitalsEvents.filter(e => e.createdAt >= todayStart);

  const computeVitalAvg = (name: string) => {
    const vals = todayVitals
      .filter(e => e.metadata?.vitalsName === name)
      .map(e => e.metadata?.vitalsValue as number)
      .filter(v => typeof v === "number" && v >= 0);
    if (vals.length === 0) return { avg: null, rating: null };
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    const ratings = todayVitals
      .filter(e => e.metadata?.vitalsName === name && e.metadata?.vitalsRating)
      .map(e => String(e.metadata?.vitalsRating));
    const ratingCount: Record<string, number> = {};
    ratings.forEach(r => { ratingCount[r] = (ratingCount[r] || 0) + 1; });
    const rating = Object.entries(ratingCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    return { avg: Math.round(avg * 10) / 10, rating };
  };

  return {
    apiPerformance,
    errorLog: recentErrors,
    totalErrors,
    totalRequests,
    overallErrorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
    errorsByEndpoint,
    errorsByStatusCode,
    hourlyErrorRate,
    aiUsage: {
      callCount: aiEvents.length,
      totalTokens,
      promptTokens,
      completionTokens,
      estimatedCostUsd: Math.round(estimatedCostUsd * 10000) / 10000,
      avgLatencyMs,
      dailyBuckets: aiDailyBuckets,
      monthly: {
        callCount: aiEventsMonthly.length,
        totalTokens: monthlyPromptTokens + monthlyCompletionTokens,
        estimatedCostUsd: Math.round(monthlyEstimatedCostUsd * 10000) / 10000,
      },
    },
    fileProcessing: {
      uploadAttempts: fileEvents.length,
      successes: fileSuccesses,
      failures: fileFailures,
      failureReasons,
    },
    stripeWebhooks: {
      received: webhookEvents.length,
      succeeded: webhookSucceeded,
      failed: webhookFailed,
      lastEventAt: lastWebhook ? lastWebhook.createdAt.toISOString() : null,
    },
    webVitals: {
      lcp: computeVitalAvg("LCP"),
      cls: computeVitalAvg("CLS"),
      fid: computeVitalAvg("FID"),
      inp: computeVitalAvg("INP"),
      fcp: computeVitalAvg("FCP"),
    },
  };
}

export async function getPaymentCountLastNHours(hours: number): Promise<number> {
  const { events } = await loadMetrics();
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  return events.filter(
    (e) => e.eventType === "payment_completed" && new Date(e.createdAt).getTime() >= cutoff
  ).length;
}

export interface PiiExpiryStatus {
  overdueCount: number;
  oldestOverdueDays: number | null;
  warehouseUnavailable?: boolean;
}

export async function getPiiExpiryStatus(): Promise<PiiExpiryStatus> {
  const { db } = await import("../db");
  const { sql } = await import("drizzle-orm");
  try {
    const result = await db.execute(sql`
      SELECT
        SUM(overdue_count)::int AS overdue_count,
        MAX(oldest_overdue_days)::int AS oldest_overdue_days
      FROM (
        SELECT
          COUNT(*) AS overdue_count,
          MAX(EXTRACT(EPOCH FROM (NOW() - raw_text_expires_at)) / 86400) AS oldest_overdue_days
        FROM dealer_submissions
        WHERE raw_text_expires_at < NOW()
          AND raw_text_redacted IS NOT NULL
        UNION ALL
        SELECT
          COUNT(*) AS overdue_count,
          MAX(EXTRACT(EPOCH FROM (NOW() - retention_expires_at)) / 86400) AS oldest_overdue_days
        FROM raw.user_analyses
        WHERE retention_expires_at < NOW()
          AND submitted_text_redacted IS NOT NULL
      ) AS combined
    `);

    const row = result.rows[0] as { overdue_count: number | null; oldest_overdue_days: number | null };
    const overdueCount = row.overdue_count ?? 0;

    return {
      overdueCount,
      oldestOverdueDays: overdueCount === 0 ? null : (row.oldest_overdue_days ?? null),
    };
  } catch (err: any) {
    console.warn("[metrics] getPiiExpiryStatus: warehouse unavailable —", err?.message);
    return { overdueCount: 0, oldestOverdueDays: null, warehouseUnavailable: true };
  }
}

