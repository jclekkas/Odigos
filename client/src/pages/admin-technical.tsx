import { useState, useEffect } from "react";
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
  };
  piiRetention: {
    overdueCount: number;
    oldestOverdueDays: number | null;
  };
}

function getAdminKey(): string {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return params.get("key") || "odigos-admin-2024";
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

export default function AdminTechnical() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const adminKey = getAdminKey();

  const healthQuery = useQuery<HealthData>({
    queryKey: ["/api/health"],
    refetchInterval: 60000,
  });

  const techQuery = useQuery<TechnicalSummary>({
    queryKey: ["/api/technical", adminKey],
    queryFn: async () => {
      const res = await fetch(`/api/technical?key=${encodeURIComponent(adminKey)}`);
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (techQuery.dataUpdatedAt) {
      setLastUpdated(new Date(techQuery.dataUpdatedAt));
    }
  }, [techQuery.dataUpdatedAt]);

  const handleRefresh = () => {
    healthQuery.refetch();
    techQuery.refetch();
    setLastUpdated(new Date());
  };

  const health = healthQuery.data;
  const tech = techQuery.data;
  const isLoading = healthQuery.isLoading || techQuery.isLoading;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin/metrics">
              <Button variant="ghost" size="sm" data-testid="link-back-metrics">
                <ArrowLeft className="h-4 w-4 mr-1" /> Metrics
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Technical & Ops Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Engineering health, reliability, and operational efficiency
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
                        ? "The key in the URL does not match the configured ADMIN_KEY. Add ?key=<your-key> to the URL."
                        : "An unexpected error occurred. Check the server logs for details."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        <Card data-testid="panel-system-health">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Server className="h-4 w-4" /> System Health
            </CardTitle>
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
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Heap Used</p>
                  <p className="font-semibold" data-testid="stat-heap-used">{health.memory.heapUsedMb} MB</p>
                  <p className="text-xs text-muted-foreground">of {health.memory.heapTotalMb} MB</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">RSS Memory</p>
                  <p className="font-semibold" data-testid="stat-rss">{health.memory.rssMb} MB</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Unable to load health data</p>
            )}
          </CardContent>
        </Card>

        <Card data-testid="panel-pii-retention">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" /> PII Retention
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!tech ? (
              <div className="h-12 bg-muted animate-pulse rounded" />
            ) : tech.piiRetention.overdueCount === 0 ? (
              <div className="flex items-center gap-2" data-testid="status-pii-retention">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  All clear
                </span>
                <span className="text-sm text-muted-foreground">No overdue PII records</span>
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

        <Card data-testid="panel-api-performance">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4" /> API Performance (last 24h)
            </CardTitle>
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
                        <th className="text-right py-2 px-4 font-medium">p50</th>
                        <th className="text-right py-2 px-4 font-medium">p95</th>
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
                  <p className="text-xs text-muted-foreground mb-2">Request volume by hour — per endpoint (last 24h)</p>
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
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="panel-error-rate">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4" /> Error Rate (last 24h)
            </CardTitle>
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
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Errors</p>
                    <p className={`text-2xl font-bold ${tech.totalErrors > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`} data-testid="stat-total-errors">
                      {tech.totalErrors}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Error Rate</p>
                    <p className={`text-2xl font-bold ${tech.overallErrorRate > 5 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`} data-testid="stat-error-rate">
                      {tech.overallErrorRate.toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Error rate % over time (last 24h)</p>
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
                    <p className="text-xs font-medium text-muted-foreground mb-2">Errors by status code</p>
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

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Recent Errors (last 20)</p>
                  {tech.errorLog.length === 0 ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm py-4">
                      <CheckCircle className="h-4 w-4" />
                      No errors in the last 24 hours
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto space-y-1" data-testid="list-error-log">
                      {tech.errorLog.map((err, idx) => (
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
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="panel-ai-usage">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-4 w-4" /> AI Usage & Cost (last 7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!tech ? (
              <div className="h-40 bg-muted animate-pulse rounded" />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">API Calls</p>
                    <p className="text-2xl font-bold" data-testid="stat-ai-calls">{tech.aiUsage.callCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Tokens</p>
                    <p className="text-2xl font-bold" data-testid="stat-ai-tokens">{tech.aiUsage.totalTokens.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{tech.aiUsage.promptTokens.toLocaleString()} prompt + {tech.aiUsage.completionTokens.toLocaleString()} completion</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Est. Cost (GPT-4o)</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400" data-testid="stat-ai-cost">
                      ${tech.aiUsage.estimatedCostUsd.toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Latency</p>
                    <p className="text-2xl font-bold" data-testid="stat-ai-latency">{tech.aiUsage.avgLatencyMs > 0 ? `${tech.aiUsage.avgLatencyMs}ms` : "—"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Daily AI calls & tokens</p>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={tech.aiUsage.dailyBuckets}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis yAxisId="calls" orientation="left" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis yAxisId="tokens" orientation="right" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
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

        <Card data-testid="panel-file-processing">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" /> PDF / File Processing
            </CardTitle>
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
                    <p className="text-xs text-muted-foreground">Successes</p>
                    <p className={`text-2xl font-bold ${tech.fileProcessing.successes > 0 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`} data-testid="stat-file-successes">
                      {tech.fileProcessing.successes}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Failures</p>
                    <p className={`text-2xl font-bold ${tech.fileProcessing.failures > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`} data-testid="stat-file-failures">
                      {tech.fileProcessing.failures}
                    </p>
                  </div>
                </div>
                {tech.fileProcessing.failureReasons.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Failure Reasons</p>
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

        <Card data-testid="panel-stripe-webhooks">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" /> Stripe Webhook Health
            </CardTitle>
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
                  <p className="text-xs text-muted-foreground">Succeeded</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="stat-webhook-succeeded">{tech.stripeWebhooks.succeeded}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Failed</p>
                  <p className={`text-2xl font-bold ${tech.stripeWebhooks.failed > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`} data-testid="stat-webhook-failed">
                    {tech.stripeWebhooks.failed}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Event</p>
                  <p className="font-semibold text-sm" data-testid="stat-webhook-last">
                    {tech.stripeWebhooks.lastEventAt ? formatTime(tech.stripeWebhooks.lastEventAt) : "Never"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="panel-web-vitals">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Monitor className="h-4 w-4" /> Core Web Vitals (today)
            </CardTitle>
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
                  Vitals are collected from real user sessions and averaged over today. Data populates as users visit the site.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
