type EventType =
  | "page_view"
  | "cta_click"
  | "form_start"
  | "form_focus"
  | "file_upload_failed"
  | "analysis_failed"
  | "checkout_failed"
  | "scorecard_downloaded"
  | "copy_summary"
  | "optional_details_expanded"
  | "analyze_start"
  | "analysis_complete"
  | "paywall_view"
  | "checkout_initiated"
  | "email_capture_submitted"
  | "email_capture_failed";

interface TrackingMetadata {
  page?: string;
  ctaId?: string;
  ctaLabel?: string;
  fieldName?: string;
  referrer?: string;
  sessionId?: string;
  reason?: string;
  errorMessage?: string;
  [key: string]: unknown;
}

export function getSessionId(): string {
  let sessionId = sessionStorage.getItem("odigos_session_id");
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem("odigos_session_id", sessionId);
  }
  return sessionId;
}

export async function track(eventType: EventType, metadata?: TrackingMetadata): Promise<void> {
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType,
        metadata: {
          ...metadata,
          sessionId: getSessionId(),
          referrer: document.referrer || undefined,
        },
      }),
    });
  } catch (error) {
    console.warn("Tracking failed:", error);
  }
}

export function trackPageView(page: string): void {
  track("page_view", { page });
}

export function trackCtaClick(ctaId: string, ctaLabel?: string): void {
  track("cta_click", { ctaId, ctaLabel, page: window.location.pathname });
}

export function trackFormStart(page: string): void {
  track("form_start", { page });
}

export function trackFormFocus(fieldName: string): void {
  track("form_focus", { fieldName, page: window.location.pathname });
}

export function trackFileUploadFailed(reason: string): void {
  track("file_upload_failed", { reason, page: window.location.pathname });
}

export function trackAnalysisFailed(errorMessage: string): void {
  track("analysis_failed", { errorMessage, page: window.location.pathname });
}

export function trackCheckoutFailed(reason: string): void {
  track("checkout_failed", { reason, page: window.location.pathname });
}

export function trackScorecardDownloaded(): void {
  track("scorecard_downloaded", { page: window.location.pathname });
}

export function trackCopySummary(): void {
  track("copy_summary", { page: window.location.pathname });
}

export function trackOptionalDetailsExpanded(): void {
  track("optional_details_expanded", { page: window.location.pathname });
}

export function trackAnalyzeStart(): void {
  track("analyze_start", { page: window.location.pathname });
}

export function trackAnalysisComplete(properties?: TrackingMetadata): void {
  track("analysis_complete", { ...properties, page: window.location.pathname });
}

export function trackPaywallView(): void {
  track("paywall_view", { page: window.location.pathname });
}

export function trackCheckoutInitiated(selectedPass?: "weekend_warrior" | "car_buyers_pass"): void {
  track("checkout_initiated", {
    page: window.location.pathname,
    ...(selectedPass ? { selected_pass: selectedPass } : {}),
  });
}
