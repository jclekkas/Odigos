/**
 * Shared admin dashboard components and utilities.
 *
 * Consolidates duplicated TrendBadge, MetricCard, LivePulse, DateRangeSelector,
 * PanelErrorCard, EmptyState, PanelSkeleton, ChartErrorBoundary, and constants
 * that were previously copy-pasted across every admin-*.tsx page.
 */

import { Component, type ReactNode, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export type DateRange = "today" | "week" | "month" | "all";

export const RANGE_LABELS: Record<DateRange, string> = {
  today: "Today",
  week: "Last 7 Days",
  month: "Last 30 Days",
  all: "All Time",
};

/** Refetch intervals (ms). Use these instead of magic numbers. */
export const REFETCH_REALTIME = 30_000;
export const REFETCH_STANDARD = 60_000;
export const REFETCH_SLOW = 300_000;

/** Shared Recharts tooltip inline-style that respects the theme. */
export const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
};

// ---------------------------------------------------------------------------
// Reliability helpers
// ---------------------------------------------------------------------------

/**
 * Determine whether a query error is permanent and refetching should stop.
 * Replaces the fragile `errMsg.startsWith("401")` pattern.
 */
export function isPermanentError(error: unknown): boolean {
  const msg = (error as Error)?.message ?? "";
  // Error messages from our fetch wrappers are formatted as "STATUS: body"
  return /^(401|403|503)\b/.test(msg);
}

/**
 * TanStack Query refetchInterval callback that stops polling on permanent errors.
 * Usage: `refetchInterval: refetchUnlessPermanent(REFETCH_SLOW)`
 */
export function refetchUnlessPermanent(intervalMs: number) {
  return (query: { state: { error: unknown } }): number | false => {
    return isPermanentError(query.state.error) ? false : intervalMs;
  };
}

/**
 * Map an HTTP status code embedded in an error message to a human-readable
 * explanation. Falls back to a generic message.
 */
export function friendlyErrorMessage(error: unknown): string {
  const msg = (error as Error)?.message ?? "";
  if (msg.startsWith("401")) return "Authentication failed — check your admin key.";
  if (msg.startsWith("403")) return "Access forbidden — you don't have permission.";
  if (msg.startsWith("503")) return "Service unavailable — admin key may not be configured on the server.";
  if (msg.startsWith("500")) return "Server error — try refreshing the page.";
  if (msg.startsWith("404")) return "Not found — this endpoint may not exist yet.";
  return "Failed to load data. Check your connection and try again.";
}

// ---------------------------------------------------------------------------
// TrendBadge
// ---------------------------------------------------------------------------

export function TrendBadge({
  current,
  previous,
  suffix = "",
}: {
  current: number;
  previous: number;
  suffix?: string;
}) {
  if (previous === 0 && current === 0) {
    return (
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <Minus className="h-3 w-3" /> No change
      </span>
    );
  }
  if (previous === 0) {
    return (
      <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
        <ArrowUpRight className="h-3 w-3" /> New{suffix}
      </span>
    );
  }
  const change = ((current - previous) / previous) * 100;
  if (change > 0) {
    return (
      <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
        <ArrowUpRight className="h-3 w-3" /> +{change.toFixed(0)}%{suffix}
      </span>
    );
  }
  if (change < 0) {
    return (
      <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
        <ArrowDownRight className="h-3 w-3" /> {change.toFixed(0)}%{suffix}
      </span>
    );
  }
  return (
    <span className="text-xs text-muted-foreground flex items-center gap-1">
      <Minus className="h-3 w-3" /> No change
    </span>
  );
}

// ---------------------------------------------------------------------------
// MetricCard (merges MetricCard from metrics + StatCard from business)
// ---------------------------------------------------------------------------

const COLOR_CLASSES = {
  default: "text-foreground",
  success: "text-green-600 dark:text-green-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  danger: "text-red-600 dark:text-red-400",
} as const;

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  color = "default",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { current: number; previous: number; label?: string };
  icon: LucideIcon;
  color?: keyof typeof COLOR_CLASSES;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="p-2 rounded-md bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={`text-3xl font-bold ${COLOR_CLASSES[color]}`}
          data-testid={`stat-${title.toLowerCase().replace(/\s+/g, "-")}`}
        >
          {value}
        </div>
        <div className="flex items-center justify-between mt-1 gap-2">
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trend && (
            <TrendBadge
              current={trend.current}
              previous={trend.previous}
              suffix={trend.label ? ` vs ${trend.label}` : ""}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// LivePulse — now staleness-aware
// ---------------------------------------------------------------------------

export function LivePulse({
  lastUpdated,
  refetchIntervalMs,
}: {
  lastUpdated?: Date;
  refetchIntervalMs?: number;
}) {
  const [, setTick] = useState(0);

  // Re-render every 10s to keep the staleness indicator current
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 10_000);
    return () => clearInterval(id);
  }, []);

  const isStale =
    lastUpdated && refetchIntervalMs
      ? Date.now() - lastUpdated.getTime() > refetchIntervalMs * 2
      : false;

  if (isStale && lastUpdated) {
    const agoSec = Math.round((Date.now() - lastUpdated.getTime()) / 1000);
    const agoLabel = agoSec >= 60 ? `${Math.round(agoSec / 60)}m ago` : `${agoSec}s ago`;
    return (
      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500" />
        </span>
        <span className="text-xs text-yellow-600 dark:text-yellow-400">Stale — updated {agoLabel}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
      </span>
      <span className="text-xs text-muted-foreground">Live</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DateRangeSelector
// ---------------------------------------------------------------------------

export function DateRangeSelector({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (r: DateRange) => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      {(Object.keys(RANGE_LABELS) as DateRange[]).map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          data-testid={`range-${r}`}
          className={`px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-colors ${
            value === r
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          {RANGE_LABELS[r]}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PanelErrorCard — human-readable error display
// ---------------------------------------------------------------------------

export function PanelErrorCard({ error, label }: { error: unknown; label?: string }) {
  return (
    <div
      className="flex items-start gap-3 p-4 rounded-lg border border-red-400 bg-red-50 dark:bg-red-950/20"
      data-testid="panel-error-card"
    >
      <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-red-700 dark:text-red-400 text-sm font-medium">
          Failed to load {label ?? "panel data"}
        </p>
        <p className="text-red-600 dark:text-red-500 text-xs mt-0.5">
          {friendlyErrorMessage(error)}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EmptyState — with optional guidance text
// ---------------------------------------------------------------------------

export function EmptyState({
  icon: Icon,
  label,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
      <Icon className="h-8 w-8 opacity-40" />
      <p className="text-sm">{label}</p>
      {hint && <p className="text-xs opacity-60 max-w-xs text-center">{hint}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PanelSkeleton
// ---------------------------------------------------------------------------

export function PanelSkeleton({ height = "h-64" }: { height?: string }) {
  return <div className={`${height} animate-pulse bg-muted rounded-lg`} />;
}

// ---------------------------------------------------------------------------
// ChartErrorBoundary
// ---------------------------------------------------------------------------

interface ChartErrorBoundaryProps {
  children: ReactNode;
  fallbackHeight?: string;
}

interface ChartErrorBoundaryState {
  hasError: boolean;
}

export class ChartErrorBoundary extends Component<ChartErrorBoundaryProps, ChartErrorBoundaryState> {
  state: ChartErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ChartErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Chart render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className={`flex flex-col items-center justify-center gap-2 text-muted-foreground ${this.props.fallbackHeight ?? "h-64"}`}
        >
          <XCircle className="h-8 w-8 opacity-40" />
          <p className="text-sm">Chart failed to render</p>
          <button
            className="text-xs underline hover:no-underline"
            onClick={() => this.setState({ hasError: false })}
          >
            Click to retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Score icons for accessibility (GREEN/YELLOW/RED with icons, not just color)
// ---------------------------------------------------------------------------

export function ScoreIcon({ score }: { score: "GREEN" | "YELLOW" | "RED" }) {
  switch (score) {
    case "GREEN":
      return <CheckCircle className="h-3.5 w-3.5 text-green-500 inline-block" />;
    case "YELLOW":
      return <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 inline-block" />;
    case "RED":
      return <XCircle className="h-3.5 w-3.5 text-red-500 inline-block" />;
  }
}
