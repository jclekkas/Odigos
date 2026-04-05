import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { AdminShell, AdminAccessDenied } from "@/components/admin-shell";
import {
  MetricCard,
  TrendBadge,
  LivePulse,
  EmptyState,
  PanelSkeleton,
  ChartErrorBoundary,
  ScoreIcon,
  SectionHeader,
  StatRow,
  TOOLTIP_STYLE,
  REFETCH_REALTIME,
} from "@/components/admin-dashboard-utils";
import { formatCurrency, formatCurrencyCompact, formatNumber, formatShortDate } from "@/lib/format";
import {
  ArrowLeft,
  DollarSign,
  Users,
  TrendingUp,
  BarChart3,
  Activity,
  RefreshCw,
  CheckCircle,
  Eye,
  Download,
  Upload,
  Clock,
  Zap,
  Target,
  MousePointer,
  FileText,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
} from "recharts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EventMetadata {
  dealScore?: "GREEN" | "YELLOW" | "RED";
  vehicle?: string;
  tier?: string;
  page?: string;
}

interface MetricsSummary {
  totalSubmissions: number;
  totalPayments: number;
  totalCheckouts: number;
  revenue: number;
  conversionRate: number;
  checkoutToPaymentRate: number;
  scoreDistribution: { green: number; yellow: number; red: number };
  recentEvents: Array<{ eventType: string; createdAt: string; metadata: EventMetadata | null }>;
  submissionsByDay: Array<{ date: string; count: number }>;
  revenueByDay: Array<{ date: string; revenue: number }>;
  hourlyActivity: Array<{ hour: number; count: number }>;
  pageViews: Array<{ page: string; count: number }>;
  referrers: Array<{ source: string; count: number }>;
  trends: {
    submissionsToday: number;
    submissionsYesterday: number;
    revenueToday: number;
    revenueYesterday: number;
    submissionsThisWeek: number;
    submissionsLastWeek: number;
    revenueThisWeek: number;
    revenueLastWeek: number;
  };
  funnel: { submissions: number; checkouts: number; payments: number };
  engagement: {
    totalPageViews: number;
    landingPageViews: number;
    analyzePageViews: number;
    ctaClicks: number;
    formStarts: number;
    landingToAnalyzeCtr: number;
    analyzeToSubmissionRate: number;
    formStartToSubmissionRate: number;
    ctaClicksByButton: Array<{ ctaId: string; label: string; count: number }>;
  };
}

// ---------------------------------------------------------------------------
// Hero KPI Card — larger, more prominent than standard MetricCard
// ---------------------------------------------------------------------------

function HeroKPI({
  label,
  value,
  trend,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  trend?: { current: number; previous: number; label: string };
  icon: typeof DollarSign;
  accent: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${accent}`} />
      <CardContent className="pt-5 pb-5 pl-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-4xl font-bold tracking-tight" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>
              {value}
            </p>
            {trend && (
              <div className="pt-1">
                <TrendBadge current={trend.current} previous={trend.previous} suffix={` vs ${trend.label}`} />
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-muted`}>
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Conversion Funnel — visual step-down funnel
// ---------------------------------------------------------------------------

function ConversionFunnel({ funnel }: { funnel: { submissions: number; checkouts: number; payments: number } }) {
  const stages = [
    { name: "Submissions", value: funnel.submissions, icon: FileText, color: "bg-blue-500" },
    { name: "Checkouts", value: funnel.checkouts, icon: Target, color: "bg-amber-500" },
    { name: "Payments", value: funnel.payments, icon: CheckCircle, color: "bg-green-500" },
  ];
  const maxValue = Math.max(...stages.map(s => s.value), 1);
  const overallRate = funnel.submissions > 0 ? ((funnel.payments / funnel.submissions) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-5">
      {stages.map((stage, idx) => {
        const width = Math.max((stage.value / maxValue) * 100, 3);
        const convFromPrev = idx > 0 && stages[idx - 1].value > 0
          ? ((stage.value / stages[idx - 1].value) * 100).toFixed(1)
          : null;
        const Icon = stage.icon;
        return (
          <div key={stage.name}>
            {idx > 0 && convFromPrev && (
              <div className="flex items-center gap-2 py-1.5 pl-4">
                <ArrowDownRight className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">{convFromPrev}% converted</span>
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-md ${stage.color}/10`}>
                    <Icon className={`h-4 w-4 ${stage.color.replace("bg-", "text-")}`} />
                  </div>
                  <span className="font-medium text-sm">{stage.name}</span>
                </div>
                <span className="text-2xl font-bold tabular-nums">{formatNumber(stage.value)}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${stage.color} rounded-full transition-all duration-700`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
      <div className="pt-3 mt-3 border-t flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">Overall Conversion</span>
        <span className="text-xl font-bold text-green-600 dark:text-green-400">{overallRate}%</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Score Distribution — horizontal bars (more readable than pie)
// ---------------------------------------------------------------------------

function ScoreDistribution({ data }: { data: { green: number; yellow: number; red: number } }) {
  const total = data.green + data.yellow + data.red;
  if (total === 0) {
    return <EmptyState icon={BarChart3} label="No scores recorded yet" hint="Scores appear after deal analyses are completed." />;
  }

  const scores = [
    { label: "Good Deal", score: "GREEN" as const, value: data.green, color: "bg-green-500", textColor: "text-green-600 dark:text-green-400" },
    { label: "Fair Deal", score: "YELLOW" as const, value: data.yellow, color: "bg-yellow-500", textColor: "text-yellow-600 dark:text-yellow-400" },
    { label: "Overpriced", score: "RED" as const, value: data.red, color: "bg-red-500", textColor: "text-red-600 dark:text-red-400" },
  ];

  return (
    <div className="space-y-4">
      {scores.map(s => {
        const pct = total > 0 ? (s.value / total) * 100 : 0;
        return (
          <div key={s.score} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScoreIcon score={s.score} />
                <span className="text-sm font-medium">{s.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold tabular-nums ${s.textColor}`}>{s.value}</span>
                <span className="text-xs text-muted-foreground">({pct.toFixed(0)}%)</span>
              </div>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div className={`h-full ${s.color} rounded-full transition-all duration-500`} style={{ width: `${Math.max(pct, 1)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Charts
// ---------------------------------------------------------------------------

function SubmissionsChart({ data }: { data: Array<{ date: string; count: number }> }) {
  if (data.length === 0) return <EmptyState icon={TrendingUp} label="No submission data yet" />;

  const chartData = data.map(d => ({ date: formatShortDate(d.date), submissions: d.count }));

  return (
    <div className="h-72">
      <ChartErrorBoundary>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gradSubmissions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} label={{ value: "Submissions", angle: -90, position: "insideLeft", style: { fill: "hsl(var(--muted-foreground))", fontSize: 12 } }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Area type="monotone" dataKey="submissions" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#gradSubmissions)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartErrorBoundary>
    </div>
  );
}

function RevenueChart({ data }: { data: Array<{ date: string; revenue: number }> }) {
  if (data.length === 0) return <EmptyState icon={DollarSign} label="No revenue data yet" />;

  const chartData = data.map(d => ({ date: formatShortDate(d.date), revenue: d.revenue }));

  return (
    <div className="h-72">
      <ChartErrorBoundary>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
            <YAxis tickFormatter={formatCurrencyCompact} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} label={{ value: "Revenue", angle: -90, position: "insideLeft", style: { fill: "hsl(var(--muted-foreground))", fontSize: 12 } }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => [formatCurrency(value), "Revenue"]} />
            <Area type="monotone" dataKey="revenue" stroke="#22c55e" fillOpacity={1} fill="url(#gradRevenue)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartErrorBoundary>
    </div>
  );
}

function HourlyHeatmap({ data }: { data: Array<{ hour: number; count: number }> }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-12 gap-1.5">
        {data.map(d => {
          const intensity = d.count / maxCount;
          const bg = intensity === 0 ? "bg-muted" : intensity < 0.33 ? "bg-primary/20" : intensity < 0.66 ? "bg-primary/50" : "bg-primary";
          return (
            <div
              key={d.hour}
              className={`h-10 rounded-md ${bg} flex items-center justify-center text-xs font-medium transition-colors`}
              title={`${d.hour}:00 — ${d.count} events`}
            >
              {d.count > 0 && <span className="tabular-nums">{d.count}</span>}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>11 PM</span>
      </div>
    </div>
  );
}

function TrafficSources({ data }: { data: Array<{ source: string; count: number }> }) {
  if (data.length === 0) return <EmptyState icon={Eye} label="No referrer data yet" />;

  const maxCount = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="space-y-3">
      {data.slice(0, 6).map(d => {
        const pct = (d.count / maxCount) * 100;
        return (
          <div key={d.source} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground truncate max-w-[200px]" title={d.source}>{d.source}</span>
              <span className="font-semibold tabular-nums">{formatNumber(d.count)}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary/60 rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Activity Feed
// ---------------------------------------------------------------------------

function LiveActivityFeed({ events }: { events: Array<{ eventType: string; createdAt: string; metadata: EventMetadata | null }> }) {
  if (events.length === 0) {
    return <EmptyState icon={Activity} label="No activity recorded yet" hint="Events appear as users interact with your site." />;
  }

  const getEventStyle = (type: string) => {
    switch (type) {
      case "payment_completed": return { icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" };
      case "submission": return { icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" };
      case "checkout_started": return { icon: Target, color: "text-amber-500", bg: "bg-amber-500/10" };
      case "submission_score": return { icon: BarChart3, color: "text-purple-500", bg: "bg-purple-500/10" };
      case "page_view": return { icon: Eye, color: "text-muted-foreground", bg: "bg-muted" };
      default: return { icon: Activity, color: "text-muted-foreground", bg: "bg-muted" };
    }
  };

  const formatTime = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="space-y-1 max-h-[50vh] overflow-y-auto">
      {events.slice(0, 50).map((event, idx) => {
        const style = getEventStyle(event.eventType);
        const Icon = style.icon;
        return (
          <div key={idx} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors">
            <div className={`p-2 rounded-lg ${style.bg} flex-shrink-0`}>
              <Icon className={`h-4 w-4 ${style.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm capitalize">{event.eventType.replace(/_/g, " ")}</span>
                {event.metadata?.dealScore && (
                  <Badge variant="outline" className={`text-xs gap-1 ${
                    event.metadata.dealScore === "GREEN" ? "text-green-600 border-green-600" :
                    event.metadata.dealScore === "YELLOW" ? "text-yellow-600 border-yellow-600" :
                    "text-red-600 border-red-600"
                  }`}>
                    <ScoreIcon score={event.metadata.dealScore} />
                    {event.metadata.dealScore === "GREEN" ? "Good" : event.metadata.dealScore === "YELLOW" ? "Fair" : "Poor"}
                  </Badge>
                )}
                {event.metadata?.tier && <Badge variant="secondary" className="text-xs">${event.metadata.tier}</Badge>}
              </div>
              {event.metadata?.vehicle && <p className="text-xs text-muted-foreground truncate">{event.metadata.vehicle}</p>}
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTime(event.createdAt)}</span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Engagement Funnel — step-down bars with drop-off percentages
// ---------------------------------------------------------------------------

function EngagementFunnel({ metrics }: { metrics: MetricsSummary }) {
  const steps = [
    { label: "Landing Page Views", value: metrics.engagement?.landingPageViews ?? 0, color: "bg-blue-500" },
    { label: "Button Clicks", value: metrics.engagement?.ctaClicks ?? 0, color: "bg-indigo-500" },
    { label: "Analyze Page Views", value: metrics.engagement?.analyzePageViews ?? 0, color: "bg-purple-500" },
    { label: "Form Starts", value: metrics.engagement?.formStarts ?? 0, color: "bg-violet-500" },
    { label: "Submissions", value: metrics.funnel?.submissions ?? 0, color: "bg-amber-500" },
    { label: "Checkouts", value: metrics.funnel?.checkouts ?? 0, color: "bg-orange-500" },
    { label: "Payments", value: metrics.funnel?.payments ?? 0, color: "bg-green-500" },
  ];
  const maxVal = Math.max(...steps.map(s => s.value), 1);

  return (
    <div className="space-y-3">
      {steps.map((step, idx) => {
        const pct = (step.value / maxVal) * 100;
        const dropoff = idx > 0 && steps[idx - 1].value > 0
          ? ((steps[idx - 1].value - step.value) / steps[idx - 1].value * 100).toFixed(0)
          : null;
        return (
          <div key={step.label}>
            {dropoff && Number(dropoff) > 0 && (
              <div className="flex items-center gap-1.5 py-1 pl-2">
                <ArrowDownRight className="h-3 w-3 text-red-400" />
                <span className="text-xs text-red-500 dark:text-red-400 font-medium">-{dropoff}% drop-off</span>
              </div>
            )}
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{step.label}</span>
              <span className="text-sm font-bold tabular-nums">{formatNumber(step.value)}</span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div className={`h-full ${step.color} rounded-full transition-all duration-500`} style={{ width: `${Math.max(pct, 1)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CSV Export
// ---------------------------------------------------------------------------

function exportToCSV(metrics: MetricsSummary) {
  const rows = [
    ["Metric", "Value"],
    ["Total Submissions", String(metrics.totalSubmissions)],
    ["Total Payments", String(metrics.totalPayments)],
    ["Total Revenue", formatCurrency(metrics.revenue)],
    ["Conversion Rate", `${metrics.conversionRate.toFixed(1)}%`],
    ["Green Scores", String(metrics.scoreDistribution.green)],
    ["Yellow Scores", String(metrics.scoreDistribution.yellow)],
    ["Red Scores", String(metrics.scoreDistribution.red)],
    [],
    ["Date", "Submissions"],
    ...metrics.submissionsByDay.map(d => [d.date, String(d.count)]),
  ];
  const csvContent = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `odigos-metrics-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function AdminMetrics() {
  return (
    <AdminShell>
      {(adminKey, clearKey) => <AdminMetricsInner adminKey={adminKey} clearKey={clearKey} />}
    </AdminShell>
  );
}

function AdminMetricsInner({ adminKey, clearKey }: { adminKey: string; clearKey: () => void }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);

  const { data: metrics, isLoading, error, refetch, isFetching, dataUpdatedAt } = useQuery<MetricsSummary>({
    queryKey: ["/api/metrics", adminKey],
    queryFn: async () => {
      const res = await fetch("/api/metrics", { headers: { Authorization: `Bearer ${adminKey}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    refetchInterval: REFETCH_REALTIME,
    enabled: !!adminKey,
  });

  const lastUpdatedDate = dataUpdatedAt ? new Date(dataUpdatedAt) : undefined;
  const lastUpdated = lastUpdatedDate ? lastUpdatedDate.toLocaleTimeString() : "Never";

  const handleImportStripeHistory = async () => {
    if (!window.confirm("Import Stripe payment history? This makes multiple API calls to Stripe and may take a moment.")) return;
    setIsImporting(true);
    setImportResult(null);
    try {
      const res = await fetch("/api/admin/import-stripe-history", { method: "POST", headers: { Authorization: `Bearer ${adminKey}` } });
      const data = await res.json();
      if (res.ok) { setImportResult({ success: true, message: data.message || `Imported ${data.imported} payments` }); refetch(); }
      else { setImportResult({ success: false, message: data.error || "Import failed" }); }
    } catch (err: unknown) {
      setImportResult({ success: false, message: (err as Error).message || "Import failed" });
    } finally { setIsImporting(false); }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <PanelSkeleton height="h-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <PanelSkeleton key={i} height="h-36" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PanelSkeleton height="h-80" />
          <PanelSkeleton height="h-80" />
        </div>
      </div>
    );
  }

  if (error) return <AdminAccessDenied clearKey={clearKey} />;

  return (
    <>
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-12 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="icon" data-testid="link-back-home">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
                  <LivePulse lastUpdated={lastUpdatedDate} refetchIntervalMs={REFETCH_REALTIME} />
                </div>
                <p className="text-sm text-muted-foreground">Last updated {lastUpdated}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleImportStripeHistory} disabled={isImporting} data-testid="button-import-stripe" className="text-muted-foreground">
                <Upload className={`h-4 w-4 mr-1.5 ${isImporting ? "animate-pulse" : ""}`} />
                {isImporting ? "Importing…" : "Import"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => metrics && exportToCSV(metrics)} data-testid="button-export-csv" className="text-muted-foreground">
                <Download className="h-4 w-4 mr-1.5" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} data-testid="button-refresh-metrics">
                <RefreshCw className={`h-4 w-4 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        {/* Import result banner */}
        {importResult && (
          <div className={`p-4 rounded-lg ${importResult.success ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"}`}>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm">{importResult.message}</span>
              <Button variant="ghost" size="sm" onClick={() => setImportResult(null)}>Dismiss</Button>
            </div>
          </div>
        )}

        {/* ── Hero KPIs ───────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <HeroKPI
            label="Total Revenue"
            value={formatCurrency(metrics?.revenue ?? 0)}
            trend={metrics ? { current: metrics.trends.revenueToday, previous: metrics.trends.revenueYesterday, label: "yesterday" } : undefined}
            icon={DollarSign}
            accent="bg-green-500"
          />
          <HeroKPI
            label="Submissions"
            value={formatNumber(metrics?.totalSubmissions ?? 0)}
            trend={metrics ? { current: metrics.trends.submissionsToday, previous: metrics.trends.submissionsYesterday, label: "yesterday" } : undefined}
            icon={Users}
            accent="bg-blue-500"
          />
          <HeroKPI
            label="Conversion Rate"
            value={`${(metrics?.conversionRate ?? 0).toFixed(1)}%`}
            icon={Target}
            accent="bg-amber-500"
          />
          <HeroKPI
            label="Paid Customers"
            value={formatNumber(metrics?.totalPayments ?? 0)}
            icon={CheckCircle}
            accent="bg-purple-500"
          />
        </div>

        {/* ── Tabs ─────────────────────────────────────────── */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
            {[
              { value: "overview", label: "Overview" },
              { value: "engagement", label: "Engagement" },
              { value: "revenue", label: "Revenue" },
              { value: "activity", label: "Activity" },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                data-testid={`tab-${tab.value}`}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-sm font-medium"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Overview Tab ──────────────────────────────── */}
          <TabsContent value="overview" className="space-y-8 pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Submissions — Last 30 Days</CardTitle>
                  <p className="text-sm text-muted-foreground">Daily submission volume trend</p>
                </CardHeader>
                <CardContent>
                  <SubmissionsChart data={metrics?.submissionsByDay ?? []} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Conversion Funnel</CardTitle>
                  <p className="text-sm text-muted-foreground">From submission to payment</p>
                </CardHeader>
                <CardContent>
                  <ConversionFunnel funnel={metrics?.funnel ?? { submissions: 0, checkouts: 0, payments: 0 }} />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Deal Score Breakdown</CardTitle>
                  <p className="text-sm text-muted-foreground">How deals are scoring overall</p>
                </CardHeader>
                <CardContent>
                  <ScoreDistribution data={metrics?.scoreDistribution ?? { green: 0, yellow: 0, red: 0 }} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Peak Activity Hours</CardTitle>
                  <p className="text-sm text-muted-foreground">When users are most active (24h)</p>
                </CardHeader>
                <CardContent>
                  <HourlyHeatmap data={metrics?.hourlyActivity ?? []} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Traffic Sources</CardTitle>
                  <p className="text-sm text-muted-foreground">Where visitors are coming from</p>
                </CardHeader>
                <CardContent>
                  <TrafficSources data={metrics?.referrers ?? []} />
                </CardContent>
              </Card>
            </div>

            {/* Top Pages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Top Pages</CardTitle>
                <p className="text-sm text-muted-foreground">Most visited pages by view count</p>
              </CardHeader>
              <CardContent>
                {metrics?.pageViews && metrics.pageViews.length > 0 ? (
                  <div className="divide-y divide-muted/50">
                    {metrics.pageViews.slice(0, 8).map((pv) => (
                      <StatRow key={pv.page} label={pv.page} value={formatNumber(pv.count)} />
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={Eye} label="No page views yet" />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Engagement Tab ────────────────────────────── */}
          <TabsContent value="engagement" className="space-y-8 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard title="Page Views" value={formatNumber(metrics?.engagement?.totalPageViews ?? 0)} subtitle="All pages" icon={Eye} />
              <MetricCard title="Button Clicks" value={formatNumber(metrics?.engagement?.ctaClicks ?? 0)} subtitle="Call-to-action clicks" icon={MousePointer} />
              <MetricCard title="Form Starts" value={formatNumber(metrics?.engagement?.formStarts ?? 0)} subtitle="Users who began typing" icon={FileText} />
              <MetricCard title="Click-Through Rate" value={`${(metrics?.engagement?.landingToAnalyzeCtr ?? 0).toFixed(1)}%`} subtitle="Landing page to button click" icon={Percent} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Full Engagement Funnel</CardTitle>
                  <p className="text-sm text-muted-foreground">Every step from landing page to payment, with drop-off rates</p>
                </CardHeader>
                <CardContent>
                  {metrics && <EngagementFunnel metrics={metrics} />}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Button Click Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {metrics?.engagement?.ctaClicksByButton && metrics.engagement.ctaClicksByButton.length > 0 ? (
                      <div className="divide-y divide-muted/50">
                        {metrics.engagement.ctaClicksByButton.map(cta => (
                          <StatRow key={cta.ctaId} label={cta.label} value={formatNumber(cta.count)} />
                        ))}
                      </div>
                    ) : (
                      <EmptyState icon={MousePointer} label="No button clicks tracked yet" />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Key Rates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y divide-muted/50">
                      <StatRow label="Analyze page → submission" value={`${(metrics?.engagement?.analyzeToSubmissionRate ?? 0).toFixed(1)}%`} />
                      <StatRow label="Form start → submission" value={`${(metrics?.engagement?.formStartToSubmissionRate ?? 0).toFixed(1)}%`} />
                      <StatRow label="Checkout → payment" value={`${(metrics?.checkoutToPaymentRate ?? 0).toFixed(1)}%`} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ── Revenue Tab ───────────────────────────────── */}
          <TabsContent value="revenue" className="space-y-8 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard title="Today's Revenue" value={formatCurrency(metrics?.trends.revenueToday ?? 0)} trend={metrics ? { current: metrics.trends.revenueToday, previous: metrics.trends.revenueYesterday, label: "yesterday" } : undefined} icon={DollarSign} color="success" />
              <MetricCard title="This Week" value={formatCurrency(metrics?.trends.revenueThisWeek ?? 0)} trend={metrics ? { current: metrics.trends.revenueThisWeek, previous: metrics.trends.revenueLastWeek, label: "last week" } : undefined} icon={TrendingUp} color="success" />
              <MetricCard title="Avg. per Sale" value={formatCurrency(metrics?.totalPayments ? Math.round(metrics.revenue / metrics.totalPayments) : 0)} subtitle="Average order value" icon={Zap} />
              <MetricCard title="Checkout Rate" value={`${(metrics?.checkoutToPaymentRate ?? 0).toFixed(1)}%`} subtitle="Checkout to payment" icon={Target} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Revenue Over Time</CardTitle>
                <p className="text-sm text-muted-foreground">Daily revenue trend for the last 30 days</p>
              </CardHeader>
              <CardContent>
                <RevenueChart data={metrics?.revenueByDay ?? []} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Conversion Funnel Details</CardTitle>
              </CardHeader>
              <CardContent>
                <ConversionFunnel funnel={metrics?.funnel ?? { submissions: 0, checkouts: 0, payments: 0 }} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Activity Tab ──────────────────────────────── */}
          <TabsContent value="activity" className="space-y-8 pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base font-semibold">Live Activity Feed</CardTitle>
                    <LivePulse lastUpdated={lastUpdatedDate} refetchIntervalMs={REFETCH_REALTIME} />
                  </div>
                  <p className="text-sm text-muted-foreground">Real-time events from your site</p>
                </CardHeader>
                <CardContent>
                  <LiveActivityFeed events={metrics?.recentEvents ?? []} />
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Peak Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <HourlyHeatmap data={metrics?.hourlyActivity ?? []} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Today at a Glance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y divide-muted/50">
                      <StatRow label="Events Today" value={formatNumber(metrics?.trends.submissionsToday ?? 0)} />
                      <StatRow label="Revenue Today" value={formatCurrency(metrics?.trends.revenueToday ?? 0)} highlight />
                      <StatRow label="Total Checkouts" value={formatNumber(metrics?.totalCheckouts ?? 0)} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
