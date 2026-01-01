export type EventType = 
  | "submission"
  | "submission_score"
  | "checkout_started"
  | "payment_completed"
  | "page_view"
  | "api_request"
  | "api_error"
  | "system_health";

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

export interface MetricsSummary {
  totalSubmissions: number;
  totalPayments: number;
  revenue: number;
  conversionRate: number;
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
  pageViews: Array<{
    page: string;
    count: number;
  }>;
  observability: {
    systemHealth: "healthy" | "degraded" | "down";
    uptimeSeconds: number;
    totalApiRequests: number;
    totalApiErrors: number;
    errorRate: number;
    avgResponseTimeMs: number;
    endpointStats: Array<{
      endpoint: string;
      requests: number;
      errors: number;
      avgResponseMs: number;
    }>;
    recentErrors: Array<{
      timestamp: Date;
      endpoint: string;
      errorMessage: string;
    }>;
    requestsPerHour: Array<{
      hour: string;
      count: number;
    }>;
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
  const scores = allEvents.filter(e => e.eventType === "submission_score");
  const pageViewEvents = allEvents.filter(e => e.eventType === "page_view");
  
  const scoreDistribution = {
    green: scores.filter(e => e.metadata?.dealScore === "GREEN").length,
    yellow: scores.filter(e => e.metadata?.dealScore === "YELLOW").length,
    red: scores.filter(e => e.metadata?.dealScore === "RED").length,
  };
  
  const revenue = payments.reduce((sum, p) => {
    const tier = p.metadata?.tier;
    return sum + (tier === "49" ? 49 : tier === "79" ? 79 : 0);
  }, 0);
  
  const submissionsByDay: Record<string, number> = {};
  submissions.forEach(s => {
    const date = s.createdAt.toISOString().split("T")[0];
    submissionsByDay[date] = (submissionsByDay[date] || 0) + 1;
  });
  
  const pageViewCounts: Record<string, number> = {};
  pageViewEvents.forEach(e => {
    const page = e.metadata?.page || "unknown";
    pageViewCounts[page] = (pageViewCounts[page] || 0) + 1;
  });
  
  return {
    totalSubmissions: submissions.length,
    totalPayments: payments.length,
    revenue,
    conversionRate: submissions.length > 0 ? (payments.length / submissions.length) * 100 : 0,
    scoreDistribution,
    recentEvents: allEvents.slice(0, 20).map(e => ({
      eventType: e.eventType,
      createdAt: e.createdAt,
      metadata: e.metadata,
    })),
    submissionsByDay: Object.entries(submissionsByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30),
    pageViews: Object.entries(pageViewCounts)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count),
  };
}
