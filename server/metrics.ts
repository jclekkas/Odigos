export type EventType = 
  | "submission"
  | "submission_score"
  | "checkout_started"
  | "payment_completed"
  | "page_view"
  | "cta_click"
  | "form_start"
  | "form_focus"
  | "api_request"
  | "api_error"
  | "system_health"
  | "state_detection"
  | "vitals"
  | "file_processing"
  | "stripe_webhook";

export interface EventMetadata {
  dealScore?: "GREEN" | "YELLOW" | "RED";
  vehicle?: string;
  zipCode?: string;
  tier?: "49" | "79";
  page?: string;
  referrer?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  responseTimeMs?: number;
  errorMessage?: string;
  memoryUsageMb?: number;
  stripeSessionId?: string;
  ctaId?: string;
  ctaLabel?: string;
  fieldName?: string;
  sessionId?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  vitalsName?: string;
  vitalsValue?: number;
  vitalsRating?: string;
  fileSuccess?: boolean;
  fileFailReason?: string;
  webhookEvent?: string;
  webhookStatus?: string;
  [key: string]: unknown;
}

interface StoredEvent {
  id: number;
  eventType: EventType;
  createdAt: string;
  metadata: EventMetadata;
}

const REPLIT_DB_URL = process.env.REPLIT_DB_URL;

async function kvGet(key: string): Promise<string | null> {
  if (!REPLIT_DB_URL) return null;
  try {
    const res = await fetch(`${REPLIT_DB_URL}/${encodeURIComponent(key)}`);
    if (res.status === 404) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function kvSet(key: string, value: string): Promise<void> {
  if (!REPLIT_DB_URL) return;
  try {
    await fetch(REPLIT_DB_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    });
  } catch (error) {
    console.error("KV set failed:", error);
  }
}

const METRICS_KEY = "odigos_metrics_v1";

async function loadMetrics(): Promise<{ events: StoredEvent[]; nextId: number }> {
  try {
    const data = await kvGet(METRICS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn("Could not load metrics, starting fresh");
  }
  return { events: [], nextId: 1 };
}

async function saveMetrics(events: StoredEvent[], nextId: number): Promise<void> {
  try {
    const trimmed = events.length > 5000 ? events.slice(-5000) : events;
    await kvSet(METRICS_KEY, JSON.stringify({ events: trimmed, nextId }));
  } catch (error) {
    console.error("Failed to save metrics:", error);
  }
}

export async function trackEvent(eventType: EventType, metadata?: EventMetadata): Promise<void> {
  try {
    const { events, nextId } = await loadMetrics();
    const event: StoredEvent = {
      id: nextId,
      eventType,
      createdAt: new Date().toISOString(),
      metadata: metadata || {},
    };
    events.push(event);
    await saveMetrics(events, nextId + 1);
  } catch (error) {
    console.error("Failed to track event:", error);
  }
}

export async function getImportedSessionIds(): Promise<Set<string>> {
  try {
    const { events } = await loadMetrics();
    const sessionIds = new Set<string>();
    
    for (const event of events) {
      const sessionId = event.metadata?.stripeSessionId;
      if (sessionId && typeof sessionId === 'string') {
        sessionIds.add(sessionId);
      }
    }
    
    return sessionIds;
  } catch (error) {
    console.error("Failed to get imported session IDs:", error);
    return new Set();
  }
}

export async function importHistoricalEvents(newEvents: Array<{
  eventType: EventType;
  createdAt: string;
  metadata: EventMetadata;
}>): Promise<void> {
  try {
    const { events, nextId } = await loadMetrics();
    let currentId = nextId;
    
    for (const evt of newEvents) {
      events.push({
        id: currentId++,
        eventType: evt.eventType,
        createdAt: evt.createdAt,
        metadata: evt.metadata,
      });
    }
    
    events.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    await saveMetrics(events, currentId);
    console.log(`Imported ${newEvents.length} historical events`);
  } catch (error) {
    console.error("Failed to import historical events:", error);
    throw error;
  }
}

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
  const aiErrorEvents = allEvents.filter(e =>
    e.eventType === "api_error" && e.metadata?.endpoint === "openai_chat" && e.createdAt >= last7d
  );
  
  const aiCallCount = aiEvents.length;
  const totalTokens = aiEvents.reduce((sum, e) => sum + ((e.metadata?.totalTokens as number) || 0), 0);
  const promptTokens = aiEvents.reduce((sum, e) => sum + ((e.metadata?.promptTokens as number) || 0), 0);
  const completionTokens = aiEvents.reduce((sum, e) => sum + ((e.metadata?.completionTokens as number) || 0), 0);
  const estimatedCostUsd = (promptTokens / 1000) * GPT4O_PROMPT_COST_PER_1K + (completionTokens / 1000) * GPT4O_COMPLETION_COST_PER_1K;
  const aiLatencies = aiEvents.map(e => (e.metadata?.responseTimeMs as number) || 0).filter(v => v > 0);
  const avgLatencyMs = aiLatencies.length > 0 ? Math.round(aiLatencies.reduce((a, b) => a + b, 0) / aiLatencies.length) : 0;

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
      callCount: aiCallCount,
      totalTokens,
      promptTokens,
      completionTokens,
      estimatedCostUsd: Math.round(estimatedCostUsd * 10000) / 10000,
      avgLatencyMs,
      dailyBuckets: aiDailyBuckets,
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
    },
  };
}
// ============================================================================
// Business Intelligence Aggregations
// ============================================================================

// In-memory cache for heavy BI aggregations (TTL: 2 minutes)
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

function getDateBounds(range: DateRange): { start: Date | null; end: Date } {
  const now = new Date();
  const end = now;
  if (range === "all") return { start: null, end };
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === "today") return { start: todayStart, end };
  if (range === "week") return { start: new Date(todayStart.getTime() - 7 * 86400000), end };
  if (range === "month") return { start: new Date(todayStart.getTime() - 30 * 86400000), end };
  return { start: null, end };
}

function filterByRange<T extends { createdAt: Date }>(events: T[], range: DateRange): T[] {
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
  const ranged = filterByRange(allEvents, range);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart.getTime() - 7 * 86400000);

  const stageTypes = [
    { name: "Page Visit", type: "page_view" },
    { name: "CTA Click", type: "cta_click" },
    { name: "Form Start", type: "form_start" },
    { name: "Submission", type: "submission" },
    { name: "Checkout Initiated", type: "checkout_started" },
    { name: "Payment Completed", type: "payment_completed" },
  ];

  // Funnel always shows three consistent columns: Today, This Week, All Time.
  // The date range filter (param) is intentionally not applied here — the funnel provides
  // a fixed temporal breakdown so operators can see the full conversion picture at a glance.
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

  // Last-touch attribution: for each submission, find the last page_view in the same session
  // that occurred BEFORE the submission timestamp.
  const allSorted = allEvents.slice().sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  // Build index: sessionId -> sorted list of {createdAt, page} for page_view events
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
    // Find last page view strictly before this submission
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

  // Field engagement: focus counts per field
  const fieldFocusCounts: Record<string, number> = {};
  formFocusEvents.forEach(e => {
    const field = (e.metadata?.fieldName as string) || "unknown";
    fieldFocusCounts[field] = (fieldFocusCounts[field] || 0) + 1;
  });

  // Field abandonment: sessions that focused on a field but never submitted
  // Group form_focus events by session
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

  // For each field, count sessions that focused on it but did NOT submit
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

  // Group page views by session
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

  return { fieldEngagement, avgPagesPerSession, bounceRate, topEntryPages, topExitPages };
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

  // Numeric score: GREEN=3, YELLOW=2, RED=1
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

  // Fee types and tactic flags come from dealer_submissions SQL table (authoritative source).
  // This table has feeNames[] array and boolean tactic columns populated by the ingestor.
  let topFeeTypes: Array<{ feeName: string; count: number }> = [];
  let topTacticFlags: Array<{ tactic: string; count: number }> = [];

  if (process.env.DATABASE_URL) {
    const { db } = await import("./db");
    const { dealerSubmissions } = await import("@shared/schema");
    const { gte } = await import("drizzle-orm");

    const { start } = getDateBounds(range);
    const rows = await (start
      ? db.select({
          feeNames: dealerSubmissions.feeNames,
          flagMarketAdjustment: dealerSubmissions.flagMarketAdjustment,
          flagPaymentOnly: dealerSubmissions.flagPaymentOnly,
          flagMissingOtd: dealerSubmissions.flagMissingOtd,
          flagVagueFees: dealerSubmissions.flagVagueFees,
          flagHighCostAddons: dealerSubmissions.flagHighCostAddons,
        }).from(dealerSubmissions).where(gte(dealerSubmissions.submittedAt, start))
      : db.select({
          feeNames: dealerSubmissions.feeNames,
          flagMarketAdjustment: dealerSubmissions.flagMarketAdjustment,
          flagPaymentOnly: dealerSubmissions.flagPaymentOnly,
          flagMissingOtd: dealerSubmissions.flagMissingOtd,
          flagVagueFees: dealerSubmissions.flagVagueFees,
          flagHighCostAddons: dealerSubmissions.flagHighCostAddons,
        }).from(dealerSubmissions));

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

  // Load KV events for payment linkage (sessionId cross-join)
  const { events } = await loadMetrics();
  const allKvEvents = events.map(e => ({ ...e, createdAt: new Date(e.createdAt) }));
  const rangedKv = filterByRange(allKvEvents, range);

  const kvSubmissions = rangedKv.filter(e => e.eventType === "submission");
  const kvPayments = rangedKv.filter(e => e.eventType === "payment_completed");

  // sessionId → state: filled from the DB path below, used for payment attribution
  const sessionIdToState: Record<string, string> = {};

  // Count how many sessions (with known sessionId) resulted in payments
  // These are joined to states via the SQL path if DB is available
  const statePayments: Record<string, number> = {};

  if (process.env.DATABASE_URL) {
    // Use dealer_submissions SQL table for accurate state-level submission counts.
    // The KV event system fires state_detection twice per submission (pre-LLM + post-LLM),
    // making it unsuitable for geographic counting. The DB has one row per submission.
    const { db } = await import("./db");
    const { dealerSubmissions } = await import("@shared/schema");
    const { gte } = await import("drizzle-orm");

    const { start } = getDateBounds(range);
    const rows = await (start
      ? db.select({
          stateCode: dealerSubmissions.stateCode,
          dealScore: dealerSubmissions.dealScore,
        }).from(dealerSubmissions).where(gte(dealerSubmissions.submittedAt, start))
      : db.select({
          stateCode: dealerSubmissions.stateCode,
          dealScore: dealerSubmissions.dealScore,
        }).from(dealerSubmissions));

    const stateCounts: Record<string, { submissions: number; scores: number[] }> = {};
    const scoreVal = (s: string) => s === "GREEN" ? 3 : s === "YELLOW" ? 2 : 1;

    for (const row of rows) {
      const state = row.stateCode ?? "Unknown";
      if (!stateCounts[state]) stateCounts[state] = { submissions: 0, scores: [] };
      stateCounts[state].submissions++;
      stateCounts[state].scores.push(scoreVal(row.dealScore));
    }

    // For payment linkage: use KV submission events (which carry sessionId) as a bridge.
    // submission.sessionId is now propagated from the frontend analyze call.
    // Map each submission's sessionId to a state via KV's state_detection events
    // (state_detection fires pre-LLM without capViolation, giving one event per analyze request).
    const kvStateDetections = allKvEvents.filter(
      e => e.eventType === "state_detection" && e.metadata?.state && e.metadata?.capViolation === undefined
    );

    // Build a timestamp-proximity map: for each submission event with sessionId,
    // find the closest state_detection event by timestamp (within 60s window)
    // since state_detection fires just before submission during the same request.
    const sortedStateDetections = kvStateDetections.slice().sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );

    kvSubmissions.forEach(subEvt => {
      const sessionId = subEvt.metadata?.sessionId as string | undefined;
      if (!sessionId || sessionIdToState[sessionId]) return;
      const subTs = subEvt.createdAt.getTime();
      // Find the state_detection event closest in time (within 60s before or after)
      let best: { state: string; delta: number } | null = null;
      for (const sd of sortedStateDetections) {
        const delta = Math.abs(sd.createdAt.getTime() - subTs);
        if (delta < 60000 && (!best || delta < best.delta)) {
          best = { state: sd.metadata?.state as string, delta };
        }
      }
      if (best) sessionIdToState[sessionId] = best.state;
    });

    // Count payments per state using the sessionId bridge
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

  // Fallback when no DB (dev without DATABASE_URL): use submission events from KV store
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

  // Map sessionId → source from first page_view in each session
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

  // Count views, unique sessions, submissions, and payments per source.
  // submission and payment_completed events now carry sessionId (added post-wiring).
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

  // 30-day run rate: use last 30 days revenue
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

  // Payment session IDs
  const paidSessions = new Set(
    payments.map(e => e.metadata?.stripeSessionId as string | undefined).filter(Boolean)
  );
  const checkoutSessions = new Set(
    checkouts.map(e => e.metadata?.stripeSessionId as string | undefined).filter(Boolean)
  );
  const checkoutsWithoutPayment = checkouts.filter(e => {
    const sid = e.metadata?.stripeSessionId as string | undefined;
    return !sid || !paidSessions.has(sid);
  }).length;

  // Average time from submission to checkout_started, cross-joined by sessionId.
  // submission events now carry sessionId (propagated from frontend via analyze request).
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
      if (delta >= 0 && delta < 1440) deltas.push(delta); // cap at 24h to exclude stale sessions
    }
  }
  const avgMinutesSubmissionToCheckout = deltas.length > 0
    ? deltas.reduce((a, b) => a + b, 0) / deltas.length
    : null;

  // Dropoff by hour
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

export interface PiiExpiryStatus {
  overdueCount: number;
  oldestOverdueDays: number | null;
}

export async function getPiiExpiryStatus(): Promise<PiiExpiryStatus> {
  const { db } = await import("./db");
  const { sql } = await import("drizzle-orm");

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
}
