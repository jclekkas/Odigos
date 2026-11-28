import * as Sentry from "@sentry/react";
import { syntheticTelemetrySuppressed } from "@/lib/syntheticLatch";

export function tagFlow(feature: string, route: string): void {
  if (syntheticTelemetrySuppressed()) return;
  Sentry.getCurrentScope().setTag("feature", feature);
  Sentry.getCurrentScope().setTag("route", route);
}
