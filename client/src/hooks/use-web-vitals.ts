import { useEffect } from "react";
import { onCLS, onINP, onLCP, onFCP, onTTFB } from "web-vitals";
import type { Metric } from "web-vitals";

function sendVital(name: string, value: number, rating: string) {
  fetch("/api/vitals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, value, rating }),
  }).catch(() => {});
}

export function useWebVitals() {
  useEffect(() => {
    const report = (metric: Metric) => sendVital(metric.name, metric.value, metric.rating);
    onLCP(report);
    onCLS(report);
    onINP(report);
    onFCP(report);
    onTTFB(report);
  }, []);
}
