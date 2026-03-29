import { useState, useEffect } from "react";

import { AdminNav } from "@/components/admin-nav";
import { useAdminKey } from "@/hooks/use-admin-key";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowLeft,
  RefreshCw,
  Server,
  Zap,
  AlertTriangle,
  Brain,
  FileText,
  CreditCard,
  Monitor,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  TrendingUp,
  Bell,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

interface HealthData {
  status: "healthy" | "degraded" | "down";
  uptimeSeconds: number;
  memory: { heapUsedMb: number; heapTotalMb: number; rssMb: number };
}

interface TechnicalSummary {
  apiPerformance: Array<{
    endpoint: string;
    requestCount: number;
    p50Ms: number;
    p95Ms: number;
    errorCount: number;
    errorRate: number;
    hourlyBuckets: Array<{ hour: string; count: number; avgMs: number }>;
  }>;
  errorLog: Array<{
    timestamp: string;
    endpoint: string;
    statusCode: number;
    message: string;
  }>;
  totalErrors: number;
  totalRequests: number;
  overallErrorRate: number;
  errorsByEndpoint: Array<{ endpoint: string; errorCount: number; errorRate: number }>;
  errorsByStatusCode: Array<{ statusCode: number; count: number }>;
  hourlyErrorRate: Array<{ hour: string; errors: number; requests: number; errorRate: number }>;
  aiUsage: {
    callCount: number;
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    estimatedCostUsd: number;
    avgLatencyMs: number;
    dailyBuckets: Array<{ date: string; calls: number; tokens: number; costUsd: number }>;
    monthly: {
      callCount: number;
      totalTokens: number;
      estimatedCostUsd: number;
    };
  };
  fileProcessing: {
    uploadAttempts: number;
    successes: number;
    failures: number;
    failureReasons: Array<{ reason: string; count: number }>;
  };
  stripeWebhooks: {
    received: number;
    succeeded: number;
    failed: number;
    lastEventAt: string | null;
  };
  webVitals: {
    lcp: { avg: number | null; rating: string | null };
    cls: { avg: number | null; rating: string | null };
    fid: { avg: number | null; rating: string | null };
    inp: { avg: number | null; rating: string | null };
    fcp: { avg: number | null; rating: string | null };
  };
  piiRetention: {
    overdueCount: number;
    oldestOverdueDays: number | null;
    warehouseUnavailable?: boolean;
  };
}

interface AlertStatus {
  ruleId: string;
  name: string;
  description: string;
  metric: string;
  comparator: "lt" | "gt" | "eq";
  threshold: number;
  currentValue: number | null;
  tripped: boolean;
  lastFiredAt: string | null;
}

interface AlertFiredRecord {
  ruleId: string;
  firedAt: string;
  value: number;
}

interface AlertsStatusData {
  rules: AlertStatus[];
  recentFired: AlertFiredRecord[];
  webhookConfigured: boolean;
  smtpConfigured: boolean;
  webhookUrlMasked: string | null;
}


function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(" ");
}

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return d.toLocaleDateString();
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    healthy: { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", label: "Healthy" },
    degraded: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Degraded" },
    down: { color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", label: "Down" },
  };
  const c = config[status as keyof typeof config] || config.degraded;
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${c.color}`}>{c.label}</span>;
}

function VitalsRating({ rating, value, unit }: { rating: string | null; value: number | null; unit?: string }) {
  if (value === null) {
    return <span className="text-muted-foreground text-sm">No data</span>;
  }
  const colors = {
    good: "text-green-600 dark:text-green-400",
    "needs-improvement": "text-yellow-600 dark:text-yellow-400",
    poor: "text-red-600 dark:text-red-400",
  };
  const color = colors[rating as keyof typeof colors] || "text-foreground";
  return (
    <div>
      <span className={`text-2xl font-bold ${color}`}>{value}{unit || ""}</span>
      {rating && (
        <div className={`text-xs mt-0.5 capitalize ${color}`}>{rating.replace("-", " ")}</div>
      )}
    </div>
  );
}

function EndpointShort(ep: string): string {
  return ep.replace("/api/", "");
}

function AutoRefreshCountdown({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    setRemaining(seconds);
    const interval = setInterval(() => {
      setRemaining(r => (r <= 1 ? seconds : r - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);
  return <span className="text-xs text-muted-foreground">Refreshes in {remaining}s</span>;
}

function TrafficLight({ health, tech, alerts }: { health: HealthData | undefined; tech: TechnicalSummary | undefined; alerts: AlertsStatusData | undefined }) {
  if (!health && !tech) {
    return (
      <Card className="border-muted">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-muted animate-pulse" />
            <span className="text-sm text-muted-foreground">Loading system status…</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const trippedAlerts = alerts?.rules.filter(r => r.tripped) ?? [];
  const errorRate = tech?.overallErrorRate ?? 0;
  const healthStatus = health?.status ?? "healthy";
  const hasFailedWebhooks = (tech?.stripeWebhooks.failed ?? 0) > 0;
  const piiOverdue = (tech?.piiRetention.overdueCount ?? 0) > 0 && !tech?.piiRetention.warehouseUnavailable;

  let trafficStatus: "green" | "yellow" | "red" = "green";
  let label = "All Good";
  let description = "Everything is running normally.";

  if (healthStatus === "down" || errorRate > 10 || trippedAlerts.length > 0) {
    trafficStatus = "red";
    label = "Something is Down";
    const issues: string[] = [];
    if (healthStatus === "down") issues.push("server is down");
    if (errorRate > 10) issues.push(`${errorRate.toFixed(1)}% error rate`);
    if (trippedAlerts.length > 0) issues.push(`${trippedAlerts.length} alert${trippedAlerts.length > 1 ? "s" : ""} firing`);
    description = issues.join(", ") + ".";
  } else if (healthStatus === "degraded" || errorRate > 2 || hasFailedWebhooks || piiOverdue) {
    trafficStatus = "yellow";
    label = "Issues Detected";
    const issues: string[] = [];
    if (healthStatus === "degraded") issues.push("server degraded");
    if (errorRate > 2) issues.push(`${errorRate.toFixed(1)}% error rate`);
    if (hasFailedWebhooks) issues.push("Stripe webhook failures");
    if (piiOverdue) issues.push("PII retention overdue");
    description = issues.join(", ") + ".";
  }

  const dotColors = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  };
  const borderColors = {
    green: "border-green-200 dark:border-green-900",
    yellow: "border-yellow-200 dark:border-yellow-900",
    red: "border-red-300 dark:border-red-800",
  };
  const bgColors = {
    green: "bg-green-50 dark:bg-green-950/20",
    yellow: "bg-yellow-50 dark:bg-yellow-950/20",
    red: "bg-red-50 dark:bg-red-950/20",
  };

  return (
    <Card className={`border ${borderColors[trafficStatus]} ${bgColors[trafficStatus]}`} data-testid="banner-system-status">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className={`h-4 w-4 rounded-full flex-shrink-0 ${dotColors[trafficStatus]}`} />
          <div>
            <p className="font-semibold text-sm" data-testid="stat-system-status-label">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        data-testid={`accordion-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <span>{title}</span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <div className="p-4 border-t space-y-6">
          {children}
        </div>
      )}
    </div>
  );
}

export default function AdminTechnical() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [adminKey, setAdminKey, clearKey] = useAdminKey();
  const [keyInput, setKeyInput] = useState("");

  const healthQuery = useQuery<HealthData>({
    queryKey: ["/api/health"],
    refetchInterval: 60000,
  });

  const techQuery = useQuery<TechnicalSummary>({
    queryKey: ["/api/technical", adminKey],
    queryFn: async () => {
      const res = await fetch(`/api/technical`, {
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    refetchInterval: techQuery => {
      const errMsg = (techQuery.state.error as Error)?.message ?? "";
      return errMsg.startsWith("401") ? false : 60000;
    },
    enabled: !!adminKey,
  });

  const alertsQuery = useQuery<AlertsStatusData>({
    queryKey: ["/api/alerts", adminKey],
    queryFn: async () => {
      const res = await fetch(`/api/alerts`, {
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    refetchInterval: alertsQuery => {
      const errMsg = (alertsQuery.state.error as Error)?.message ?? "";
      return errMsg.startsWith("401") ? false : 60000;
    },
    enabled: !!adminKey,
  });

  useEffect(() => {
    const techErr = (techQuery.error as Error)?.message ?? "";
    const alertsErr = (alertsQuery.error as Error)?.message ?? "";
    if (techErr.startsWith("401") || alertsErr.startsWith("401")) {
      clearKey();
    }
  }, [techQuery.error, alertsQuery.error]);

  useEffect(() => {
    if (techQuery.dataUpdatedAt) {
      setLastUpdated(new Date(techQuery.dataUpdatedAt));
    }
  }, [techQuery.dataUpdatedAt]);

  const handleRefresh = () => {
    healthQuery.refetch();
    techQuery.refetch();
    alertsQuery.refetch();
    setLastUpdated(new Date());
  };

  const health = healthQuery.data;
  const tech = techQuery.data;
  const alerts = alertsQuery.data;
  const isLoading = healthQuery.isLoading || techQuery.isLoading;

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      {!adminKey && (
        <div className="flex items-center justify-center py-24">
          <div className="w-full max-w-sm space-y-4 p-6">
            <h1 className="text-xl font-bold text-center">Admin Access</h1>
            <p className="text-sm text-muted-foreground text-center">Enter your admin key to continue</p>
            <div className="flex gap-2">
              <input
                type="password"
                className="flex-1 border rounded-md px-3 py-2 text-sm bg-background"
                placeholder="Admin key"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && keyInput) setAdminKey(keyInput); }}
                data-testid="input-admin-key"
                autoFocus
              />
              <Button
                onClick={() => { if (keyInput) setAdminKey(keyInput); }}
                disabled={!keyInput}
                data-testid="button-submit-admin-key"
              >
                Go
              </Button>
            </div>
          </div>
        </div>
      )}
      {adminKey && (
      <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin/metrics">
              <Button variant="ghost" size="sm" data-testid="link-back-metrics">
                <ArrowLeft className="h-4 w-4 mr-1" /> Metrics
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Technical &amp; Ops Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Server health, errors, and system reliability
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AutoRefreshCountdown seconds={60} />
            <span className="text-xs text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              data-testid="button-refresh"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {techQuery.isError && (() => {
          const msg = (techQuery.error as Error)?.message ?? "";
          const is503 = msg.startsWith("503");
          const is401 = msg.startsWith("401");
          return (
            <Card className="border-red-400 bg-red-50 dark:bg-red-950/20" data-testid="banner-admin-error">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-700 dark:text-red-400 font-semibold text-sm">
                      {is503 ? "Admin key not configured on server" : is401 ? "Invalid admin key" : "Failed to load technical metrics"}
                    </p>
                    <p className="text-red-600/80 dark:text-red-400/80 text-xs mt-0.5">
                      {is503
                        ? "The ADMIN_KEY environment variable is not set. Set it in the Replit secrets panel and restart the server."
                        : is401
                        ? "The key does not match the configured ADMIN_KEY."
                        : "An unexpected error occurred. Check the server logs for details."}
                    </p>
                    {is401 && (
                      <button
                        onClick={clearKey}
                        className="mt-2 text-xs text-red-600 dark:text-red-400 underline hover:no-underline"
                        data-testid="button-clear-admin-key"
                      >
                        Clear key and re-enter
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* Traffic Light Status Banner */}
        <TrafficLight health={health} tech={tech} alerts={alerts} />

        {/* System Health */}
        <Card data-testid="panel-system-health">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Server className="h-4 w-4" /> Server Status
            </CardTitle>
            <p className="text-xs text-muted-foreground">How long the server has been running and how much memory it's using</p>
          </CardHeader>
          <CardContent>
            {healthQuery.isLoading ? (
              <div className="h-20 bg-muted animate-pulse rounded" />
            ) : health ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <StatusBadge status={health.status} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Uptime</p>
                  <p className="font-semibold" data-testid="stat-uptime">{formatUptime(health.uptimeSeconds)}</p>
                  <p className="text-xs text-muted-foreground">how long it's been running</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Memory Used</p>
                  <p className="font-semibold" data-testid="stat-heap-used">{health.memory.heapUsedMb} MB</p>
                  <p className="text-xs text-muted-foreground">of {health.memory.heapTotalMb} MB available</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Process Memory</p>
                  <p className="font-semibold" data-testid="stat-rss">{health.memory.rssMb} MB</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Unable to load health data</p>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card data-testid="panel-alerts">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4" /> Alerts
            </CardTitle>
            <p className="text-xs text-muted-foreground">Automated checks that fire when something goes wrong</p>
          </CardHeader>
          <CardContent>
            {alertsQuery.isLoading ? (
              <div className="h-32 bg-muted animate-pulse rounded" />
            ) : alertsQuery.isError ? (
              <p className="text-muted-foreground text-sm">Unable to load alert status</p>
            ) : alerts ? (
              <div className="space-y-5">
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    Webhook notifications:
                    {alerts.webhookConfigured ? (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {alerts.webhookUrlMasked ?? "configured"}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">not configured (set ALERT_WEBHOOK_URL)</span>
                    )}
                  </span>
                  <span className="flex items-center gap-1">
                    Email notifications:
                    {alerts.smtpConfigured ? (
                      <span className="text-green-600 dark:text-green-400 font-medium">configured</span>
                    ) : (
                      <span className="text-muted-foreground italic">not configured (set ALERT_SMTP_URL + ALERT_EMAIL_TO)</span>
                    )}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Active Checks</p>
                  <div className="space-y-2" data-testid="list-alert-rules">
                    {alerts.rules.map((rule) => (
                      <div
                        key={rule.ruleId}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${
                          rule.tripped
                            ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
                            : "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/10"
                        }`}
                        data-testid={`alert-rule-${rule.ruleId}`}
                      >
                        {rule.tripped ? (
                          <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <p className="text-sm font-medium">{rule.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {rule.currentValue !== null && (
                                <span>
                                  Current:{" "}
                                  <span className={`font-semibold ${rule.tripped ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                                    {rule.currentValue.toFixed(2)}
                                  </span>
                                </span>
                              )}
                              <span>
                                Threshold: {rule.comparator === "lt" ? "<" : rule.comparator === "gt" ? ">" : "="} {rule.threshold}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{rule.description}</p>
                          {rule.lastFiredAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Last fired: {formatTime(rule.lastFiredAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {alerts.recentFired.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Recently Fired (last 20)</p>
                    <div className="max-h-48 overflow-y-auto space-y-1" data-testid="list-recent-alerts">
                      {alerts.recentFired.map((record, idx) => {
                        const ruleName = alerts.rules.find((r) => r.ruleId === record.ruleId)?.name ?? record.ruleId;
                        return (
                          <div key={idx} className="flex items-center gap-3 p-2 rounded bg-muted/40 text-sm">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                            <span className="text-xs text-muted-foreground font-mono">{formatTime(record.firedAt)}</span>
                            <span className="text-xs font-medium flex-1">{ruleName}</span>
                            <Badge variant="destructive" className="text-xs px-1.5 py-0">
                              {record.value.toFixed(2)}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {alerts.recentFired.length === 0 && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm py-2">
                    <CheckCircle className="h-4 w-4" />
                    No alerts have fired recently
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Error Summary */}
        <Card data-testid="panel-error-rate">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4" /> Errors (last 24h)
            </CardTitle>
            <p className="text-xs text-muted-foreground">How often something goes wrong with API requests</p>
          </CardHeader>
          <CardContent>
            {!tech ? (
              <div className="h-40 bg-muted animate-pulse rounded" />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Requests</p>
                    <p className="text-2xl font-bold" data-testid="stat-total-requests">{tech.totalRequests}</p>
                    <p className="text-xs text-muted-foreground">in last 24h</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Errors</p>
                    <p className={`text-2xl font-bold ${tech.totalErrors > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`} data-testid="stat-total-errors">
                      {tech.totalErrors}
                    </p>
                    <p className="text-xs text-muted-foreground">{tech.totalErrors === 0 ? "none" : "requests that failed"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Error Rate</p>
                    <p className={`text-2xl font-bold ${tech.overallErrorRate > 5 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`} data-testid="stat-error-rate">
                      {tech.overallErrorRate.toFixed(2)}%
                    </p>
                    <p className="text-xs text-muted-foreground">{tech.overallErrorRate < 2 ? "healthy" : tech.overallErrorRate < 5 ? "slightly elevated" : "needs attention"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Error rate over time</p>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={tech.hourlyErrorRate}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="hour" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                        <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}%`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                          formatter={(v: number) => [`${v}%`, "Error Rate"]}
                        />
                        <Line type="monotone" dataKey="errorRate" stroke="#ef4444" strokeWidth={2} dot={false} name="Error Rate %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {tech.errorLog.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Recent Errors</p>
                    <div className="max-h-48 overflow-y-auto space-y-1" data-testid="list-error-log">
                      {tech.errorLog.slice(0, 10).map((err, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-2 rounded bg-muted/40 text-sm">
                          <XCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs text-muted-foreground">{formatTime(err.timestamp)}</span>
                              <span className="font-mono text-xs">{err.endpoint}</span>
                              <Badge variant="destructive" className="text-xs px-1.5 py-0">{err.statusCode}</Badge>
                            </div>
                            {err.message && <p className="text-xs text-muted-foreground truncate mt-0.5">{err.message}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {tech.errorLog.length === 0 && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm py-4">
                    <CheckCircle className="h-4 w-4" />
                    No errors in the last 24 hours
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* File Processing */}
        <Card data-testid="panel-file-processing">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" /> File Uploads (PDF Processing)
            </CardTitle>
            <p className="text-xs text-muted-foreground">When users upload a PDF deal document, how often does it succeed?</p>
          </CardHeader>
          <CardContent>
            {!tech ? (
              <div className="h-24 bg-muted animate-pulse rounded" />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Upload Attempts</p>
                    <p className="text-2xl font-bold" data-testid="stat-file-attempts">{tech.fileProcessing.uploadAttempts}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Succeeded</p>
                    <p className={`text-2xl font-bold ${tech.fileProcessing.successes > 0 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`} data-testid="stat-file-successes">
                      {tech.fileProcessing.successes}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Failed</p>
                    <p className={`text-2xl font-bold ${tech.fileProcessing.failures > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`} data-testid="stat-file-failures">
                      {tech.fileProcessing.failures}
                    </p>
                  </div>
                </div>
                {tech.fileProcessing.failureReasons.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Why uploads fail</p>
                    <div className="space-y-1">
                      {tech.fileProcessing.failureReasons.map(r => (
                        <div key={r.reason} className="flex justify-between items-center text-sm p-2 bg-muted/40 rounded">
                          <span className="font-mono text-xs">{r.reason}</span>
                          <Badge variant="secondary">{r.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {tech.fileProcessing.uploadAttempts === 0 && (
                  <p className="text-muted-foreground text-sm">No file uploads recorded yet</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Technical Details accordion */}
        <Accordion title="Technical Details — AI Usage, API Endpoints, Core Web Vitals, PII Retention, Stripe Webhooks">
          {/* AI Usage */}
          <Card data-testid="panel-ai-usage">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-4 w-4" /> AI Analysis Cost (last 7 days)
              </CardTitle>
              <p className="text-xs text-muted-foreground">How much we're spending on AI to analyze deals</p>
            </CardHeader>
            <CardContent>
              {!tech ? (
                <div className="h-40 bg-muted animate-pulse rounded" />
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Deals Analyzed</p>
                      <p className="text-2xl font-bold" data-testid="stat-ai-calls">{tech.aiUsage.callCount}</p>
                      <p className="text-xs text-muted-foreground">last 7 days</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cost per Analysis</p>
                      <p className="text-2xl font-bold text-amber-600 dark:text-amber-400" data-testid="stat-ai-cost-per-analysis">
                        {tech.aiUsage.callCount > 0 ? `$${(tech.aiUsage.estimatedCostUsd / tech.aiUsage.callCount).toFixed(4)}` : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">avg per deal</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">7-Day Total Cost</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-400" data-testid="stat-ai-cost">
                        ${tech.aiUsage.estimatedCostUsd.toFixed(4)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">30-Day Total Cost</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-400" data-testid="stat-ai-cost-monthly">
                        ${tech.aiUsage.monthly.estimatedCostUsd.toFixed(4)}
                      </p>
                      <p className="text-xs text-muted-foreground">{tech.aiUsage.monthly.callCount} analyses</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Typical Response Time</p>
                      <p className="text-2xl font-bold" data-testid="stat-ai-latency">{tech.aiUsage.avgLatencyMs > 0 ? `${tech.aiUsage.avgLatencyMs}ms` : "—"}</p>
                      <p className="text-xs text-muted-foreground">per AI call</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Tokens Used</p>
                      <p className="text-2xl font-bold" data-testid="stat-ai-tokens">{tech.aiUsage.totalTokens.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{tech.aiUsage.promptTokens.toLocaleString()} in / {tech.aiUsage.completionTokens.toLocaleString()} out</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Daily AI calls</p>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={tech.aiUsage.dailyBuckets}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                          <YAxis yAxisId="calls" orientation="left" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                          <YAxis yAxisId="tokens" orientation="right" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                          <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                          <Legend />
                          <Line yAxisId="calls" type="monotone" dataKey="calls" stroke="hsl(var(--primary))" strokeWidth={2} name="Calls" />
                          <Line yAxisId="tokens" type="monotone" dataKey="tokens" stroke="#22c55e" strokeWidth={2} name="Tokens" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* API Performance */}
          <Card data-testid="panel-api-performance">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4" /> API Performance (last 24h)
              </CardTitle>
              <p className="text-xs text-muted-foreground">p50 = typical response time (half of requests), p95 = slow requests (top 5%)</p>
            </CardHeader>
            <CardContent>
              {!tech ? (
                <div className="h-40 bg-muted animate-pulse rounded" />
              ) : (
                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" data-testid="table-api-performance">
                      <thead>
                        <tr className="text-muted-foreground text-xs border-b">
                          <th className="text-left py-2 pr-4 font-medium">Endpoint</th>
                          <th className="text-right py-2 px-4 font-medium">Requests</th>
                          <th className="text-right py-2 px-4 font-medium">p50 (typical)</th>
                          <th className="text-right py-2 px-4 font-medium">p95 (slow)</th>
                          <th className="text-right py-2 px-4 font-medium">Errors</th>
                          <th className="text-right py-2 pl-4 font-medium">Error Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tech.apiPerformance.map(ep => (
                          <tr key={ep.endpoint} className="border-b last:border-0 hover:bg-muted/30">
                            <td className="py-2 pr-4 font-mono text-xs">{ep.endpoint}</td>
                            <td className="text-right py-2 px-4" data-testid={`stat-requests-${EndpointShort(ep.endpoint)}`}>{ep.requestCount}</td>
                            <td className="text-right py-2 px-4 text-blue-600 dark:text-blue-400">{ep.p50Ms}ms</td>
                            <td className="text-right py-2 px-4 text-purple-600 dark:text-purple-400">{ep.p95Ms}ms</td>
                            <td className="text-right py-2 px-4 text-red-600 dark:text-red-400">{ep.errorCount}</td>
                            <td className="text-right py-2 pl-4">
                              <span className={ep.errorRate > 5 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}>
                                {ep.errorRate.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Request volume by hour — per endpoint</p>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={(() => {
                            const hours = tech.apiPerformance[0]?.hourlyBuckets.map(b => b.hour) ?? [];
                            return hours.map(hour => {
                              const row: Record<string, string | number> = { hour };
                              tech.apiPerformance.forEach(ep => {
                                const bucket = ep.hourlyBuckets.find(b => b.hour === hour);
                                row[EndpointShort(ep.endpoint)] = bucket?.count ?? 0;
                              });
                              return row;
                            });
                          })()}
                        >
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="hour" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                          <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                          {tech.apiPerformance.map((ep, i) => {
                            const colors = ["hsl(var(--primary))", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];
                            return (
                              <Bar
                                key={ep.endpoint}
                                dataKey={EndpointShort(ep.endpoint)}
                                fill={colors[i % colors.length]}
                                radius={[2, 2, 0, 0]}
                                stackId="a"
                              />
                            );
                          })}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Errors by endpoint</p>
                      <div className="space-y-1" data-testid="table-errors-by-endpoint">
                        {tech.errorsByEndpoint.filter(e => e.errorCount > 0).length === 0 ? (
                          <p className="text-xs text-muted-foreground">No errors</p>
                        ) : (
                          tech.errorsByEndpoint.filter(e => e.errorCount > 0).map(e => (
                            <div key={e.endpoint} className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/30">
                              <span className="font-mono">{e.endpoint}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-red-600 dark:text-red-400 font-medium">{e.errorCount}</span>
                                <span className="text-muted-foreground">({e.errorRate.toFixed(1)}%)</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Errors by HTTP status code</p>
                      <div className="space-y-1" data-testid="table-errors-by-status">
                        {tech.errorsByStatusCode.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No errors</p>
                        ) : (
                          tech.errorsByStatusCode.map(e => (
                            <div key={e.statusCode} className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/30">
                              <Badge variant="destructive" className="text-xs">{e.statusCode}</Badge>
                              <span className="font-medium">{e.count}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* PII Retention */}
          <Card data-testid="panel-pii-retention">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" /> PII Data Retention
              </CardTitle>
              <p className="text-xs text-muted-foreground">Checks that personal information is deleted on schedule (legal compliance)</p>
            </CardHeader>
            <CardContent>
              {!tech ? (
                <div className="h-12 bg-muted animate-pulse rounded" />
              ) : tech.piiRetention.warehouseUnavailable ? (
                <div className="flex items-center gap-2" data-testid="status-pii-retention">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    Warehouse unavailable
                  </span>
                  <span className="text-sm text-muted-foreground">PII data pending bootstrap</span>
                </div>
              ) : tech.piiRetention.overdueCount === 0 ? (
                <div className="flex items-center gap-2" data-testid="status-pii-retention">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    All clear
                  </span>
                  <span className="text-sm text-muted-foreground">No personal data past its deletion date</span>
                </div>
              ) : (
                <div className="space-y-1" data-testid="status-pii-retention">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                      {tech.piiRetention.overdueCount} records overdue
                    </span>
                  </div>
                  {tech.piiRetention.oldestOverdueDays !== null && (
                    <p className="text-xs text-muted-foreground pl-6">
                      oldest: {tech.piiRetention.oldestOverdueDays} {tech.piiRetention.oldestOverdueDays === 1 ? "day" : "days"} past due
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stripe Webhooks */}
          <Card data-testid="panel-stripe-webhooks">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4" /> Stripe Payment Notifications
              </CardTitle>
              <p className="text-xs text-muted-foreground">Stripe sends us a message whenever someone pays — this tracks whether those messages arrive correctly</p>
            </CardHeader>
            <CardContent>
              {!tech ? (
                <div className="h-20 bg-muted animate-pulse rounded" />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Received</p>
                    <p className="text-2xl font-bold" data-testid="stat-webhook-received">{tech.stripeWebhooks.received}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Processed OK</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="stat-webhook-succeeded">{tech.stripeWebhooks.succeeded}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Failed</p>
                    <p className={`text-2xl font-bold ${tech.stripeWebhooks.failed > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`} data-testid="stat-webhook-failed">
                      {tech.stripeWebhooks.failed}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Received</p>
                    <p className="font-semibold text-sm" data-testid="stat-webhook-last">
                      {tech.stripeWebhooks.lastEventAt ? formatTime(tech.stripeWebhooks.lastEventAt) : "Never"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Core Web Vitals */}
          <Card data-testid="panel-web-vitals">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Monitor className="h-4 w-4" /> Core Web Vitals (today)
              </CardTitle>
              <p className="text-xs text-muted-foreground">Page speed metrics measured from real user visits — affects Google search ranking</p>
            </CardHeader>
            <CardContent>
              {!tech ? (
                <div className="h-24 bg-muted animate-pulse rounded" />
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">LCP</p>
                      <p className="text-xs text-muted-foreground mb-1">Largest Contentful Paint</p>
                      <VitalsRating rating={tech.webVitals.lcp.rating} value={tech.webVitals.lcp.avg} unit="ms" />
                      <p className="text-xs text-muted-foreground mt-1">Good &lt;2500ms</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">CLS</p>
                      <p className="text-xs text-muted-foreground mb-1">Cumulative Layout Shift</p>
                      <VitalsRating rating={tech.webVitals.cls.rating} value={tech.webVitals.cls.avg} />
                      <p className="text-xs text-muted-foreground mt-1">Good &lt;0.1</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">FCP</p>
                      <p className="text-xs text-muted-foreground mb-1">First Contentful Paint</p>
                      <VitalsRating rating={tech.webVitals.fcp.rating} value={tech.webVitals.fcp.avg} unit="ms" />
                      <p className="text-xs text-muted-foreground mt-1">Good &lt;1800ms</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">INP</p>
                      <p className="text-xs text-muted-foreground mb-1">Interaction to Next Paint</p>
                      <VitalsRating rating={tech.webVitals.inp.rating} value={tech.webVitals.inp.avg} unit="ms" />
                      <p className="text-xs text-muted-foreground mt-1">Good &lt;200ms</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Collected from real user sessions and averaged over today. Populates as users visit the site.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </Accordion>
      </div>
      </div>
      )}
    </div>
  );
}
