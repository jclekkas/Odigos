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
  | "stripe_webhook"
  | "file_upload_failed"
  | "analysis_failed"
  | "checkout_failed"
  | "scorecard_downloaded"
  | "copy_summary"
  | "optional_details_expanded"
  | "experiment_assigned"
  | "experiment_converted"
  | "analyze_start"
  | "rate_limit_breach";

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
  experimentId?: string;
  variant?: string;
  conversionType?: string;
  experiments?: Record<string, string>;
  [key: string]: unknown;
}

export interface StoredEvent {
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

export async function loadMetrics(): Promise<{ events: StoredEvent[]; nextId: number }> {
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
