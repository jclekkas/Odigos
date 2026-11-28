import posthog from "posthog-js";
import { shouldEmitSubmissionAnalytics } from "@shared/syntheticSubmission";
import { syntheticTelemetrySuppressed } from "@/lib/syntheticLatch";

export interface SubmissionAnalyticsInput {
  synthetic?: boolean | null;
  dealerText?: string | null;
  competingQuoteText?: string | null;
}

export function captureSubmissionEvent(
  submission: SubmissionAnalyticsInput,
  eventName: string,
  properties?: Record<string, unknown>,
): void {
  if (syntheticTelemetrySuppressed()) return;
  if (!shouldEmitSubmissionAnalytics(submission)) return;
  capture(eventName, properties);
}

let initialized = false;

export function initAnalytics(): void {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (!key || initialized) return;

  posthog.init(key, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || "https://app.posthog.com",
    autocapture: false,
    capture_pageview: false,
  });

  initialized = true;
}

export function capture(eventName: string, properties?: Record<string, unknown>): void {
  if (syntheticTelemetrySuppressed()) return;
  if (!initialized) return;
  posthog.capture(eventName, properties);
}
