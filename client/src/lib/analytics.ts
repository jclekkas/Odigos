import posthog from "posthog-js";

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
  if (!initialized) return;
  posthog.capture(eventName, properties);
}
