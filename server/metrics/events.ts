import { db } from "../db";
import { sql } from "drizzle-orm";

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
  | "url_processing"
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
  | "analysis_complete"
  | "paywall_view"
  | "checkout_initiated"
  | "rate_limit_breach"
  | "feedback_signal";

export interface EventMetadata {
  dealScore?: "GREEN" | "YELLOW" | "RED";
  vehicle?: string;
  zipCode?: string;
  tier?: "29" | "49" | "79";
  selected_pass?: "weekend_warrior" | "car_buyers_pass";
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

const MAX_EVENTS = 5000;

async function saveMetrics(_events: StoredEvent[], _nextId: number): Promise<void> {
  // No-op: persistence is now handled row-by-row in PostgreSQL.
  // Retained for interface compatibility.
}

export async function loadMetrics(): Promise<{ events: StoredEvent[]; nextId: number }> {
  try {
    const rows = await db.execute<{ id: number; event_type: string; created_at: Date; metadata: unknown }>(sql`
      SELECT id, event_type, created_at, metadata
      FROM metrics_events
      ORDER BY id ASC
      LIMIT ${MAX_EVENTS}
    `);

    const events: StoredEvent[] = rows.rows.map((r) => ({
      id: r.id,
      eventType: r.event_type as EventType,
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      metadata: (r.metadata as EventMetadata) || {},
    }));

    const maxId = events.length > 0 ? Math.max(...events.map((e) => e.id)) : 0;
    return { events, nextId: maxId + 1 };
  } catch (error) {
    console.warn("Could not load metrics, starting fresh:", error);
    return { events: [], nextId: 1 };
  }
}

export async function trackEvent(eventType: EventType, metadata?: EventMetadata): Promise<void> {
  try {
    await db.execute(sql`
      INSERT INTO metrics_events (event_type, created_at, metadata)
      VALUES (${eventType}, now(), ${JSON.stringify(metadata || {})}::jsonb)
    `);

    await db.execute(sql`
      DELETE FROM metrics_events
      WHERE id NOT IN (
        SELECT id FROM metrics_events ORDER BY id DESC LIMIT ${MAX_EVENTS}
      )
    `);
  } catch (error) {
    console.error("Failed to track event:", error);
  }
}

export async function getImportedSessionIds(): Promise<Set<string>> {
  try {
    const rows = await db.execute<{ session_id: string }>(sql`
      SELECT metadata->>'stripeSessionId' AS session_id
      FROM metrics_events
      WHERE event_type = 'payment_completed'
        AND metadata->>'stripeSessionId' IS NOT NULL
    `);

    const sessionIds = new Set<string>();
    for (const row of rows.rows) {
      if (row.session_id) sessionIds.add(row.session_id);
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
  if (newEvents.length === 0) return;
  try {
    const sorted = [...newEvents].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    for (const evt of sorted) {
      await db.execute(sql`
        INSERT INTO metrics_events (event_type, created_at, metadata)
        VALUES (${evt.eventType}, ${evt.createdAt}::timestamptz, ${JSON.stringify(evt.metadata)}::jsonb)
      `);
    }

    await db.execute(sql`
      DELETE FROM metrics_events
      WHERE id NOT IN (
        SELECT id FROM metrics_events ORDER BY id DESC LIMIT ${MAX_EVENTS}
      )
    `);

    console.log(`Imported ${newEvents.length} historical events`);
  } catch (error) {
    console.error("Failed to import historical events:", error);
    throw error;
  }
}
