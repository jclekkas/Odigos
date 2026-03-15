type EventType = "page_view" | "cta_click" | "form_start" | "form_focus";

interface TrackingMetadata {
  page?: string;
  ctaId?: string;
  ctaLabel?: string;
  location?: string;
  article?: string;
  articleSource?: string;
  fieldName?: string;
  referrer?: string;
  sessionId?: string;
}

function getSessionId(): string {
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

export function trackPageView(page: string, articleSource?: string): void {
  track("page_view", { page, articleSource });
}

export function trackCtaClick(ctaIdOrParams: string | { location: string; article: string }, ctaLabel?: string): void {
  if (typeof ctaIdOrParams === "string") {
    track("cta_click", { ctaId: ctaIdOrParams, ctaLabel, page: window.location.pathname });
  } else {
    track("cta_click", {
      ctaId: `${ctaIdOrParams.location}|${ctaIdOrParams.article}`,
      location: ctaIdOrParams.location,
      article: ctaIdOrParams.article,
      page: window.location.pathname,
    });
  }
}

export function trackFormStart(page: string): void {
  track("form_start", { page });
}

export function trackFormFocus(fieldName: string): void {
  track("form_focus", { fieldName, page: window.location.pathname });
}
