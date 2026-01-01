import { db } from "./db";
import { metricsEvents, type MetricsEvent } from "@shared/schema";
import { desc } from "drizzle-orm";

export type EventType = 
  | "submission"
  | "submission_score"
  | "checkout_started"
  | "payment_completed"
  | "page_view";

export interface EventMetadata {
  dealScore?: "GREEN" | "YELLOW" | "RED";
  vehicle?: string;
  zipCode?: string;
  tier?: "49" | "79";
  page?: string;
  referrer?: string;
  [key: string]: unknown;
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === retries - 1) throw error;
      if (error?.code === 'EAI_AGAIN' || error?.message?.includes('EAI_AGAIN')) {
        await new Promise(r => setTimeout(r, delay * (i + 1)));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Retry failed');
}

export async function trackEvent(eventType: EventType, metadata?: EventMetadata): Promise<void> {
  try {
    await withRetry(() => db.insert(metricsEvents).values({
      eventType,
      metadata: metadata || {},
    }));
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
}

export async function getMetricsSummary(): Promise<MetricsSummary> {
  const allEvents: MetricsEvent[] = await withRetry(() => 
    db.select().from(metricsEvents).orderBy(desc(metricsEvents.createdAt))
  );
  
  const submissions = allEvents.filter((e: MetricsEvent) => e.eventType === "submission");
  const payments = allEvents.filter((e: MetricsEvent) => e.eventType === "payment_completed");
  const scores = allEvents.filter((e: MetricsEvent) => e.eventType === "submission_score");
  const pageViewEvents = allEvents.filter((e: MetricsEvent) => e.eventType === "page_view");
  
  const scoreDistribution = {
    green: scores.filter((e: MetricsEvent) => (e.metadata as EventMetadata)?.dealScore === "GREEN").length,
    yellow: scores.filter((e: MetricsEvent) => (e.metadata as EventMetadata)?.dealScore === "YELLOW").length,
    red: scores.filter((e: MetricsEvent) => (e.metadata as EventMetadata)?.dealScore === "RED").length,
  };
  
  const revenue = payments.reduce((sum: number, p: MetricsEvent) => {
    const tier = (p.metadata as EventMetadata)?.tier;
    return sum + (tier === "49" ? 49 : tier === "79" ? 79 : 0);
  }, 0);
  
  const submissionsByDay: Record<string, number> = {};
  submissions.forEach((s: MetricsEvent) => {
    const date = s.createdAt.toISOString().split("T")[0];
    submissionsByDay[date] = (submissionsByDay[date] || 0) + 1;
  });
  
  const pageViewCounts: Record<string, number> = {};
  pageViewEvents.forEach((e: MetricsEvent) => {
    const page = (e.metadata as EventMetadata)?.page || "unknown";
    pageViewCounts[page] = (pageViewCounts[page] || 0) + 1;
  });
  
  return {
    totalSubmissions: submissions.length,
    totalPayments: payments.length,
    revenue,
    conversionRate: submissions.length > 0 ? (payments.length / submissions.length) * 100 : 0,
    scoreDistribution,
    recentEvents: allEvents.slice(0, 20).map((e: MetricsEvent) => ({
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
