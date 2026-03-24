import * as Sentry from "@sentry/react";

export function tagFlow(feature: string, route: string): void {
  Sentry.getCurrentScope().setTag("feature", feature);
  Sentry.getCurrentScope().setTag("route", route);
}
