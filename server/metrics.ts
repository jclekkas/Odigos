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
  | "system_health";

export interface EventMetadata {
  dealScore?: "GREEN" | "YELLOW" | "RED";
  vehicle?: string;
  zipCode?: string;
  tier?: "49";
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
  
  const getRevenue = (evts: typeof payments) => evts.reduce((sum) => {
    return sum + 49;
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
    const amount = 49;
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
