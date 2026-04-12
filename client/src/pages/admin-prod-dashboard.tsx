import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminShell } from "@/components/admin-shell";
import {
  MetricCard,
  LivePulse,
  PanelSkeleton,
  PanelErrorCard,
  ChartErrorBoundary,
  TOOLTIP_STYLE,
  REFETCH_REALTIME,
  REFETCH_STANDARD,
  REFETCH_SLOW,
  refetchUnlessPermanent,
} from "@/components/admin-dashboard-utils";
import { formatCurrency, formatNumber, formatPercent, formatShortDate } from "@/lib/format";
import {
  AlertTriangle,
  XCircle,
  CheckCircle,
  DollarSign,
  Users,
  Target,
  Eye,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Globe,
  Zap,
  Brain,
  Server,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ---------------------------------------------------------------------------
// TypeScript interfaces (matching API response shapes)
// ---------------------------------------------------------------------------

interface HealthData {
  status: "healthy" | "degraded" | "down";
  uptimeSeconds: number;
  memory: { heapUsedMb: number; heapTotalMb: number; rssMb: number };
}

interface MetricsSummary {
  totalSubmissions: number;
  totalPayments: number;
  totalCheckouts: number;
  revenue: number;
  conversionRate: number;
  scoreDistribution: { green: number; yellow: number; red: number };
  trends: {
    submissionsToday: number;
    submissionsYesterday: number;
    revenueToday: number;
    revenueYesterday: number;
  };
  funnel: { submissions: number; checkouts: number; payments: number };
  engagement: {
    totalPageViews: number;
    ctaClicksByButton: Array<{ ctaId: string; label: string; count: number }>;
  };
}

interface TechnicalSummary {
  apiPerformance: Array<{
    endpoint: string;
    requestCount: number;
    errorCount: number;
    errorRate: number;
  }>;
  fileProcessing: {
    uploadAttempts: number;
    successes: number;
    failures: number;
  };
  stripeWebhooks: { received: number; succeeded: number; failed: number };
  webVitals: {
    lcp: { avg: number | null; rating: string | null };
    cls: { avg: number | null; rating: string | null };
    fid: { avg: number | null; rating: string | null };
    inp: { avg: number | null; rating: string | null };
    fcp: { avg: number | null; rating: string | null };
  };
  aiUsage: {
    monthly: { callCount: number; totalTokens: number; estimatedCostUsd: number };
  };
}

interface AlertsData {
  rules: Array<{
    name: string;
    description: string;
    tripped: boolean;
    currentValue: number | null;
    threshold: number;
  }>;
}

interface FunnelStage {
  name: string;
  today: number;
  week: number;
  allTime: number;
  dropoffPct: number | null;
  alert: boolean;
}

interface RevenueData {
  totalRevenue: number;
  revenueThisWeek: number;
  revenueLastWeek: number;
  avgRevenuePerPayer: number;
  estimatedMonthlyRunRate: number;
  paymentConversionRate: number;
  revenueByDay: Array<{ date: string; revenue: number }>;
}

interface DealOutcomeData {
  scoreDistribution: { green: number; yellow: number; red: number };
  topTacticFlags: Array<{ tactic: string; count: number }>;
  topFeeTypes: Array<{ feeName: string; count: number }>;
}

interface AcquisitionData {
  sources: Array<{
    source: string;
    views: number;
    sessions: number;
    submissions: number;
    payments: number;
    paymentRate: number;
  }>;
}

interface BehaviorData {
  bounceRate: number;
  avgPagesPerSession: number;
  returnVisitRate: number;
  topEntryPages: Array<{ page: string; count: number }>;
  topExitPages: Array<{ page: string; count: number }>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface Alert {
  level: "red" | "yellow";
  message: string;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(" ");
}

function buildAlerts(
  health: HealthData | undefined,
  metrics: MetricsSummary | undefined,
  technical: TechnicalSummary | undefined,
  alerts: AlertsData | undefined,
  funnel: { stages: FunnelStage[] } | undefined,
): Alert[] {
  const out: Alert[] = [];

  // Health
  if (health) {
    if (health.status === "down") out.push({ level: "red", message: "The app appears to be down." });
    else if (health.status === "degraded") out.push({ level: "yellow", message: "The app is running but in a degraded state." });
    const memPct = health.memory.heapTotalMb > 0 ? health.memory.heapUsedMb / health.memory.heapTotalMb : 0;
    if (memPct >= 0.9) out.push({ level: "red", message: `Memory usage is critical (${Math.round(memPct * 100)}% used).` });
    else if (memPct >= 0.8) out.push({ level: "yellow", message: `Memory usage is getting high (${Math.round(memPct * 100)}% used).` });
  }

  // Technical — API error rates
  if (technical) {
    for (const ep of technical.apiPerformance) {
      if (ep.errorRate > 5 && ep.requestCount >= 5) {
        out.push({ level: "red", message: `The ${ep.endpoint} endpoint is returning errors ${formatPercent(ep.errorRate)} of the time.` });
      }
    }
    // File upload failures
    if (technical.fileProcessing.failures > 0) {
      out.push({
        level: "red",
        message: `The file upload feature has failed ${technical.fileProcessing.failures} time${technical.fileProcessing.failures === 1 ? "" : "s"} today (out of ${technical.fileProcessing.uploadAttempts} attempt${technical.fileProcessing.uploadAttempts === 1 ? "" : "s"}).`,
      });
    }
    // Stripe webhook failures
    if (technical.stripeWebhooks.failed > 0) {
      out.push({
        level: "red",
        message: `${technical.stripeWebhooks.failed} Stripe webhook${technical.stripeWebhooks.failed === 1 ? " has" : "s have"} failed.`,
      });
    }
    // Poor web vitals
    if (technical.webVitals.lcp.rating === "poor") {
      out.push({ level: "red", message: "Your site is loading slowly (LCP rated 'poor')." });
    }
    if (technical.webVitals.cls.rating === "poor") {
      out.push({ level: "yellow", message: "Your site has layout shift issues (CLS rated 'poor')." });
    }
    if (technical.webVitals.inp.rating === "poor") {
      out.push({ level: "yellow", message: "Your site feels sluggish to interact with (INP rated 'poor')." });
    }
  }

  // Tripped alert rules
  if (alerts) {
    for (const rule of alerts.rules) {
      if (rule.tripped) {
        out.push({ level: "red", message: `Alert: ${rule.description || rule.name}` });
      }
    }
  }

  // Metrics
  if (metrics) {
    if (metrics.trends.revenueToday === 0) {
      out.push({ level: "yellow", message: "No one has paid in the last 24 hours." });
    }
    // CTAs with 0 clicks
    for (const cta of metrics.engagement.ctaClicksByButton) {
      if (cta.count === 0) {
        out.push({ level: "yellow", message: `The '${cta.label}' button hasn't been clicked at all today.` });
      }
    }
  }

  // Funnel — stages with >60% drop-off
  if (funnel) {
    for (const stage of funnel.stages) {
      if (stage.dropoffPct !== null && stage.dropoffPct > 60) {
        out.push({
          level: "yellow",
          message: `${Math.round(stage.dropoffPct)}% of people drop off at "${stage.name}".`,
        });
      }
    }
  }

  // Sort: red first, then yellow
  out.sort((a, b) => (a.level === "red" && b.level !== "red" ? -1 : a.level !== "red" && b.level === "red" ? 1 : 0));
  return out;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

function DashboardInner({ adminKey }: { adminKey: string; clearKey: () => void }) {
  // --- Data fetching (9 parallel queries) ---
  const healthQ = useQuery<HealthData>({
    queryKey: ["/api/health"],
    queryFn: async () => {
      const res = await fetch("/api/health");
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    refetchInterval: refetchUnlessPermanent(REFETCH_REALTIME),
  });

  const metricsQ = useQuery<MetricsSummary>({
    queryKey: ["/api/metrics", adminKey],
    queryFn: async () => {
      const res = await fetch("/api/metrics", { headers: { Authorization: `Bearer ${adminKey}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    refetchInterval: refetchUnlessPermanent(REFETCH_STANDARD),
    enabled: !!adminKey,
  });

  const technicalQ = useQuery<TechnicalSummary>({
    queryKey: ["/api/technical", adminKey],
    queryFn: async () => {
      const res = await fetch("/api/technical", { headers: { Authorization: `Bearer ${adminKey}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    refetchInterval: refetchUnlessPermanent(REFETCH_STANDARD),
    enabled: !!adminKey,
  });

  const alertsQ = useQuery<AlertsData>({
    queryKey: ["/api/alerts", adminKey],
    queryFn: async () => {
      const res = await fetch("/api/alerts", { headers: { Authorization: `Bearer ${adminKey}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    refetchInterval: refetchUnlessPermanent(REFETCH_STANDARD),
    enabled: !!adminKey,
  });

  const funnelQ = useQuery<{ stages: FunnelStage[] }>({
    queryKey: ["/api/admin/bi/funnel", adminKey, "week"],
    queryFn: async () => {
      const res = await fetch("/api/admin/bi/funnel?range=week", { headers: { Authorization: `Bearer ${adminKey}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    refetchInterval: refetchUnlessPermanent(REFETCH_SLOW),
    enabled: !!adminKey,
  });

  const revenueQ = useQuery<RevenueData>({
    queryKey: ["/api/admin/bi/revenue", adminKey, "week"],
    queryFn: async () => {
      const res = await fetch("/api/admin/bi/revenue?range=week", { headers: { Authorization: `Bearer ${adminKey}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    refetchInterval: refetchUnlessPermanent(REFETCH_SLOW),
    enabled: !!adminKey,
  });

  const dealOutcomeQ = useQuery<DealOutcomeData>({
    queryKey: ["/api/admin/bi/deal-outcome", adminKey, "week"],
    queryFn: async () => {
      const res = await fetch("/api/admin/bi/deal-outcome?range=week", { headers: { Authorization: `Bearer ${adminKey}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    refetchInterval: refetchUnlessPermanent(REFETCH_SLOW),
    enabled: !!adminKey,
  });

  const acquisitionQ = useQuery<AcquisitionData>({
    queryKey: ["/api/admin/bi/acquisition", adminKey, "week"],
    queryFn: async () => {
      const res = await fetch("/api/admin/bi/acquisition?range=week", { headers: { Authorization: `Bearer ${adminKey}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    refetchInterval: refetchUnlessPermanent(REFETCH_SLOW),
    enabled: !!adminKey,
  });

  const behaviorQ = useQuery<BehaviorData>({
    queryKey: ["/api/admin/bi/behavior", adminKey, "week"],
    queryFn: async () => {
      const res = await fetch("/api/admin/bi/behavior?range=week", { headers: { Authorization: `Bearer ${adminKey}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    refetchInterval: refetchUnlessPermanent(REFETCH_SLOW),
    enabled: !!adminKey,
  });

  const alertItems = buildAlerts(healthQ.data, metricsQ.data, technicalQ.data, alertsQ.data, funnelQ.data);
  const anyLoading = healthQ.isLoading || metricsQ.isLoading || technicalQ.isLoading || alertsQ.isLoading;
  const criticalErrors = [
    metricsQ.isError && "metrics",
    technicalQ.isError && "technical",
    alertsQ.isError && "alerts",
  ].filter(Boolean) as string[];
  const hasDataFailures = criticalErrors.length > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
          <p className="text-muted-foreground mt-1">Your daily business briefing — updated live.</p>
        </div>
        <LivePulse lastUpdated={metricsQ.dataUpdatedAt ? new Date(metricsQ.dataUpdatedAt) : undefined} refetchIntervalMs={REFETCH_STANDARD} />
      </div>

      {/* Section 1: Things That Need Your Attention */}
      <section data-section="attention">
        {anyLoading ? (
          <PanelSkeleton height="h-24" />
        ) : hasDataFailures ? (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Things That Need Your Attention
            </h2>
            <div className="flex items-start gap-3 p-3 rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
              <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-300">
                Problem: Could not load data from the server ({criticalErrors.join(", ")}). The API endpoints may be down or your admin key may be incorrect. Try refreshing, or check that the same key works on the{" "}
                <a href="/admin/metrics" className="underline font-medium">Metrics dashboard</a>.
              </p>
            </div>
            {alertItems.map((a, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  a.level === "red"
                    ? "border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800"
                    : "border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800"
                }`}
              >
                {a.level === "red" ? (
                  <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                )}
                <p className={`text-sm ${a.level === "red" ? "text-red-800 dark:text-red-300" : "text-yellow-800 dark:text-yellow-300"}`}>
                  {a.level === "red" ? "Problem: " : "Heads up: "}
                  {a.message}
                </p>
              </div>
            ))}
          </div>
        ) : alertItems.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-green-300 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-green-800 dark:text-green-300 text-sm font-medium">Everything looks good — no issues detected.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Things That Need Your Attention
            </h2>
            {alertItems.map((a, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  a.level === "red"
                    ? "border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800"
                    : "border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800"
                }`}
              >
                {a.level === "red" ? (
                  <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                )}
                <p className={`text-sm ${a.level === "red" ? "text-red-800 dark:text-red-300" : "text-yellow-800 dark:text-yellow-300"}`}>
                  {a.level === "red" ? "Problem: " : "Heads up: "}
                  {a.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Today's Snapshot */}
      <section data-section="snapshot">
        <h2 className="text-lg font-semibold mb-4">Today's Snapshot</h2>
        {metricsQ.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <PanelSkeleton key={i} height="h-32" />)}
          </div>
        ) : metricsQ.isError ? (
          <PanelErrorCard error={metricsQ.error} label="today's metrics" />
        ) : metricsQ.data ? (
          (() => {
            const m = metricsQ.data;
            const totalScored = m.scoreDistribution.green + m.scoreDistribution.yellow + m.scoreDistribution.red;
            const riskyPct = totalScored > 0 ? (m.scoreDistribution.red / totalScored) * 100 : 0;
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricCard
                  title="Deals Analyzed"
                  value={formatNumber(m.trends.submissionsToday)}
                  icon={BarChart3}
                  trend={{ current: m.trends.submissionsToday, previous: m.trends.submissionsYesterday, label: "yesterday" }}
                />
                <MetricCard
                  title="Revenue"
                  value={formatCurrency(m.trends.revenueToday)}
                  icon={DollarSign}
                  color={m.trends.revenueToday > 0 ? "success" : "default"}
                  trend={{ current: m.trends.revenueToday, previous: m.trends.revenueYesterday, label: "yesterday" }}
                />
                <MetricCard
                  title="Paying Customers"
                  value={formatNumber(m.totalPayments)}
                  icon={CreditCard}
                  subtitle="all time"
                />
                <MetricCard
                  title="Risky Deals Found"
                  value={formatPercent(riskyPct)}
                  icon={ShieldCheck}
                  color={riskyPct > 30 ? "danger" : riskyPct > 15 ? "warning" : "default"}
                  subtitle={`${m.scoreDistribution.red} of ${totalScored} scored RED`}
                />
                <MetricCard
                  title="Site Visitors"
                  value={formatNumber(m.engagement.totalPageViews)}
                  icon={Eye}
                  subtitle="page views"
                />
                <MetricCard
                  title="Checkouts Started"
                  value={formatNumber(m.totalCheckouts)}
                  icon={Target}
                  subtitle="all time"
                />
              </div>
            );
          })()
        ) : null}
      </section>

      {/* Section 3: How's the Money? */}
      <section data-section="revenue">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              How's the Money?
            </CardTitle>
          </CardHeader>
          <CardContent>
            {revenueQ.isLoading ? (
              <PanelSkeleton />
            ) : revenueQ.isError ? (
              <PanelErrorCard error={revenueQ.error} label="revenue data" />
            ) : revenueQ.data ? (
              (() => {
                const r = revenueQ.data;
                const weekDiff = r.revenueThisWeek - r.revenueLastWeek;
                const weekUp = weekDiff >= 0;
                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">This week vs last week</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">{formatCurrency(r.revenueThisWeek)}</span>
                          <span className="text-muted-foreground">vs</span>
                          <span className="text-lg text-muted-foreground">{formatCurrency(r.revenueLastWeek)}</span>
                          {weekUp ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">At this pace, you'll make</p>
                        <p className="text-2xl font-bold">~{formatCurrency(r.estimatedMonthlyRunRate)} <span className="text-sm font-normal text-muted-foreground">this month</span></p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">The average customer pays</p>
                        <p className="text-xl font-semibold">{formatCurrency(r.avgRevenuePerPayer)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Visitors who end up paying</p>
                        <p className="text-xl font-semibold">{formatPercent(r.paymentConversionRate)}</p>
                      </div>
                    </div>
                    {r.revenueByDay.length > 0 && (
                      <ChartErrorBoundary fallbackHeight="h-48">
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={r.revenueByDay}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 12 }} />
                            <YAxis tickFormatter={(v: number) => `$${v}`} tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => [formatCurrency(value), "Revenue"]} labelFormatter={formatShortDate} />
                            <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartErrorBoundary>
                    )}
                  </div>
                );
              })()
            ) : null}
          </CardContent>
        </Card>
      </section>

      {/* Section 4: Where People Drop Off */}
      <section data-section="funnel">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Where People Drop Off
            </CardTitle>
          </CardHeader>
          <CardContent>
            {funnelQ.isLoading ? (
              <PanelSkeleton />
            ) : funnelQ.isError ? (
              <PanelErrorCard error={funnelQ.error} label="funnel data" />
            ) : funnelQ.data ? (
              (() => {
                const stages = funnelQ.data.stages;
                // Map to 5 simplified stages
                const keyStages = [
                  { label: "Visited", key: "Page Visit" },
                  { label: "Started Analyzing", key: "Submission" },
                  { label: "Got Results", key: "Scorecard Downloaded" },
                  { label: "Started Checkout", key: "Checkout Initiated" },
                  { label: "Paid", key: "Payment Completed" },
                ];
                const mapped = keyStages.map(({ label, key }) => {
                  const found = stages.find((s) => s.name === key);
                  return { label, count: found?.week ?? 0, dropoffPct: found?.dropoffPct ?? null };
                });
                const maxCount = Math.max(...mapped.map((s) => s.count), 1);
                const first = mapped[0].count || 100;

                // Find biggest leak
                const leaks = stages.filter((s) => s.dropoffPct !== null).sort((a, b) => (b.dropoffPct ?? 0) - (a.dropoffPct ?? 0));
                const biggestLeak = leaks[0];

                return (
                  <div className="space-y-4">
                    {/* Visual funnel */}
                    <div className="space-y-2">
                      {mapped.map((stage, idx) => {
                        const barPct = (stage.count / maxCount) * 100;
                        return (
                          <div key={stage.label} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium flex items-center gap-1">
                                {idx > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                                {stage.label}
                              </span>
                              <span className="font-bold">{formatNumber(stage.count)}</span>
                            </div>
                            <div className="h-6 bg-muted rounded overflow-hidden">
                              <div
                                className="h-full rounded bg-primary/70 transition-all duration-500"
                                style={{ width: `${Math.max(barPct, 2)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Plain-English narrative */}
                    {first > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {Math.round((mapped[1].count / first) * 100)} out of 100 visitors start analyzing.{" "}
                        {Math.round((mapped[3].count / first) * 100)} start checkout.{" "}
                        {Math.round((mapped[4].count / first) * 100)} pay.
                      </p>
                    )}

                    {/* Biggest leak callout */}
                    {biggestLeak && biggestLeak.dropoffPct !== null && biggestLeak.dropoffPct > 20 && (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                          Your biggest leak: {Math.round(biggestLeak.dropoffPct)}% of people leave at "{biggestLeak.name}".
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : null}
          </CardContent>
        </Card>
      </section>

      {/* Section 5: What Dealers Are Doing */}
      <section data-section="deals">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              What Dealers Are Doing
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dealOutcomeQ.isLoading ? (
              <PanelSkeleton height="h-32" />
            ) : dealOutcomeQ.isError ? (
              <PanelErrorCard error={dealOutcomeQ.error} label="deal outcome data" />
            ) : dealOutcomeQ.data ? (
              (() => {
                const d = dealOutcomeQ.data;
                const total = d.scoreDistribution.green + d.scoreDistribution.yellow + d.scoreDistribution.red;
                const safePct = total > 0 ? (d.scoreDistribution.green / total) * 100 : 0;
                const issuePct = total > 0 ? (d.scoreDistribution.yellow / total) * 100 : 0;
                const riskyPct = total > 0 ? (d.scoreDistribution.red / total) * 100 : 0;
                const topTactic = d.topTacticFlags[0];
                const topFee = d.topFeeTypes[0];
                return (
                  <div className="space-y-3">
                    {total > 0 ? (
                      <>
                        <div className="flex items-center gap-4 flex-wrap">
                          <Badge variant="outline" className="text-green-700 dark:text-green-400 border-green-300">
                            {formatPercent(safePct, 0)} look safe
                          </Badge>
                          <Badge variant="outline" className="text-yellow-700 dark:text-yellow-400 border-yellow-300">
                            {formatPercent(issuePct, 0)} have some issues
                          </Badge>
                          <Badge variant="outline" className="text-red-700 dark:text-red-400 border-red-300">
                            {formatPercent(riskyPct, 0)} are risky
                          </Badge>
                        </div>
                        {topTactic && (
                          <p className="text-sm text-muted-foreground">
                            Most common problem we catch: <span className="font-medium text-foreground">{topTactic.tactic}</span>
                          </p>
                        )}
                        {topFee && (
                          <p className="text-sm text-muted-foreground">
                            Most common fees we flag: <span className="font-medium text-foreground">{topFee.feeName}</span>
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">No deals analyzed this week yet.</p>
                    )}
                  </div>
                );
              })()
            ) : null}
          </CardContent>
        </Card>
      </section>

      {/* Section 6: How People Find You */}
      <section data-section="acquisition">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              How People Find You
            </CardTitle>
          </CardHeader>
          <CardContent>
            {acquisitionQ.isLoading ? (
              <PanelSkeleton height="h-32" />
            ) : acquisitionQ.isError ? (
              <PanelErrorCard error={acquisitionQ.error} label="acquisition data" />
            ) : acquisitionQ.data ? (
              (() => {
                const sources = acquisitionQ.data.sources;
                const totalViews = sources.reduce((acc, s) => acc + s.views, 0) || 1;
                const top5 = sources.slice(0, 5);
                const paying = sources.filter((s) => s.payments > 0).slice(0, 5);
                return (
                  <div className="space-y-4">
                    {top5.length > 0 ? (
                      <>
                        <div className="space-y-2">
                          {top5.map((s) => (
                            <div key={s.source} className="flex items-center justify-between text-sm">
                              <span className="font-medium capitalize">{s.source}</span>
                              <span className="text-muted-foreground">{formatPercent((s.views / totalViews) * 100)} of traffic</span>
                            </div>
                          ))}
                        </div>
                        {paying.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1 font-medium">Sources that lead to payments:</p>
                            <div className="flex flex-wrap gap-2">
                              {paying.map((s) => (
                                <Badge key={s.source} variant="secondary" className="capitalize">
                                  {s.source} ({s.payments} paid)
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">No traffic data this week yet.</p>
                    )}
                  </div>
                );
              })()
            ) : null}
          </CardContent>
        </Card>
      </section>

      {/* Section 7: How People Behave */}
      <section data-section="behavior">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              How People Behave
            </CardTitle>
          </CardHeader>
          <CardContent>
            {behaviorQ.isLoading ? (
              <PanelSkeleton height="h-32" />
            ) : behaviorQ.isError ? (
              <PanelErrorCard error={behaviorQ.error} label="behavior data" />
            ) : behaviorQ.data ? (
              (() => {
                const b = behaviorQ.data;
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Leave without doing anything</p>
                        <p className="text-xl font-semibold">{formatPercent(b.bounceRate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Average pages per visit</p>
                        <p className="text-xl font-semibold">{b.avgPagesPerSession.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Come back for another visit</p>
                        <p className="text-xl font-semibold">{formatPercent(b.returnVisitRate)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {b.topEntryPages.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 font-medium">Where people arrive:</p>
                          <ul className="space-y-1">
                            {b.topEntryPages.slice(0, 3).map((p) => (
                              <li key={p.page} className="text-sm flex justify-between">
                                <span className="truncate">{p.page}</span>
                                <span className="text-muted-foreground ml-2 flex-shrink-0">{formatNumber(p.count)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {b.topExitPages.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 font-medium">Where people leave:</p>
                          <ul className="space-y-1">
                            {b.topExitPages.slice(0, 3).map((p) => (
                              <li key={p.page} className="text-sm flex justify-between">
                                <span className="truncate">{p.page}</span>
                                <span className="text-muted-foreground ml-2 flex-shrink-0">{formatNumber(p.count)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : null}
          </CardContent>
        </Card>
      </section>

      {/* Section 8: Behind the Scenes */}
      <section data-section="technical">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Behind the Scenes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(technicalQ.isLoading || healthQ.isLoading) ? (
              <PanelSkeleton height="h-24" />
            ) : (technicalQ.isError && healthQ.isError) ? (
              <PanelErrorCard error={technicalQ.error} label="technical data" />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* AI costs */}
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><Brain className="h-3.5 w-3.5" /> AI costs this month</p>
                  <p className="text-xl font-semibold">
                    {technicalQ.data ? formatCurrency(technicalQ.data.aiUsage.monthly.estimatedCostUsd) : "—"}
                  </p>
                </div>
                {/* App speed */}
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> App speed</p>
                  <p className="text-xl font-semibold">
                    {technicalQ.data?.webVitals.lcp.rating === "good" ? "Good" : technicalQ.data?.webVitals.lcp.rating === "needs-improvement" ? "Okay" : technicalQ.data?.webVitals.lcp.rating === "poor" ? "Slow" : "—"}
                  </p>
                </div>
                {/* Uptime */}
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><Activity className="h-3.5 w-3.5" /> Uptime</p>
                  <p className="text-xl font-semibold">
                    {healthQ.data ? formatUptime(healthQ.data.uptimeSeconds) : "—"}
                  </p>
                </div>
                {/* Memory */}
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><Server className="h-3.5 w-3.5" /> Memory</p>
                  {healthQ.data ? (
                    (() => {
                      const pct = healthQ.data.memory.heapTotalMb > 0
                        ? healthQ.data.memory.heapUsedMb / healthQ.data.memory.heapTotalMb
                        : 0;
                      const label = pct >= 0.9 ? "Critical" : pct >= 0.7 ? "Getting High" : "Fine";
                      const color = pct >= 0.9 ? "text-red-600 dark:text-red-400" : pct >= 0.7 ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400";
                      return <p className={`text-xl font-semibold ${color}`}>{label}</p>;
                    })()
                  ) : (
                    <p className="text-xl font-semibold">—</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Default export
// ---------------------------------------------------------------------------

export default function AdminProdDashboard() {
  return (
    <AdminShell>
      {(adminKey, clearKey) => <DashboardInner adminKey={adminKey} clearKey={clearKey} />}
    </AdminShell>
  );
}
