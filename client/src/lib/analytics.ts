import posthog from "posthog-js";

let initialized = false;

const firedOnce = new Set<string>();
const ONCE_EVENTS = new Set(["paywall_viewed", "purchase_completed"]);

export function track(eventName: string, props?: Record<string, unknown>): void {
  if (ONCE_EVENTS.has(eventName) && firedOnce.has(eventName)) return;
  if (ONCE_EVENTS.has(eventName)) firedOnce.add(eventName);
  const payload = { event: eventName, props, timestamp: new Date().toISOString() };
  fetch("/api/track-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

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
  if (!initialized) return;
  posthog.capture(eventName, properties);
}
