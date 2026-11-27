/**
 * Analysis events are recorded only for real buyer submissions.
 * Synthetic QA never reaches metrics_events.
 */

import type { EventMetadata, EventType } from "./events.js";
import { trackEvent } from "./events.js";
import { logger } from "./logger.js";
import { shouldEmitSubmissionAnalytics } from "./syntheticGuard.js";

export function recordAnalysisEvent(
  submission: {
    synthetic?: boolean | null;
    dealerText?: string | null;
    competingQuoteText?: string | null;
  },
  eventType: EventType,
  metadata?: EventMetadata,
): void {
  if (!shouldEmitSubmissionAnalytics(submission)) return;
  trackEvent(eventType, metadata).catch((err) =>
    logger.error("analysis event failed", { source: "tracking", eventType, error: String(err) }),
  );
}
