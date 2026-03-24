import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";
import { initAnalytics } from "./lib/analytics";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const IS_PRODUCTION = import.meta.env.MODE === "production";
const SENTRY_ENABLED = import.meta.env.VITE_SENTRY_ENABLED === "true";

const SENSITIVE_KEYS = [
  "dealerText", "body", "text", "content", "rawBody",
  "file", "buffer", "password", "token", "authorization",
];

if (SENTRY_DSN && (IS_PRODUCTION || SENTRY_ENABLED)) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
    beforeSend(event) {
      if (event.request) {
        delete event.request.data;
        if (event.request.headers) {
          const headers = event.request.headers as Record<string, unknown>;
          delete headers["cookie"];
          delete headers["authorization"];
        }
      }
      if (event.extra) {
        for (const key of SENSITIVE_KEYS) {
          if (key in event.extra) {
            delete event.extra[key];
          }
        }
      }
      return event;
    },
  });
}

initAnalytics();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
