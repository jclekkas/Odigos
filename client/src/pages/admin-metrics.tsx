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
  LivePulse,
  EmptyState,
  PanelSkeleton,
  ChartErrorBoundary,
  ScoreIcon,
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
  Percent
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
} from "recharts";

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
  scoreDistribution: {
    green: number;
    yellow: number;
    red: number;
  };
  recentEvents: Array<{
    eventType: string;
    createdAt: string;
    metadata: EventMetadata | null;
  }>;
  submissionsByDay: Array<{
    date: string;
    count: number;
  }>;
  revenueByDay: Array<{
    date: string;
    revenue: number;
  }>;
  hourlyActivity: Array<{
    hour: number;
    count: number;
  }>;
  pageViews: Array<{
    page: string;
    count: number;
  }>;
  referrers: Array<{
    source: string;
    count: number;
  }>;
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
  funnel: {
    submissions: number;
    checkouts: number;
    payments: number;
  };
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

// TrendBadge, MetricCard, LivePulse imported from admin-dashboard-utils

function ConversionFunnel({ funnel }: { funnel: { submissions: number; checkouts: number; payments: number } }) {
  const stages = [
    { name: "Submissions", value: funnel.submissions, color: "hsl(var(--primary))" },
    { name: "Checkouts", value: funnel.checkouts, color: "hsl(var(--chart-2))" },
    { name: "Payments", value: funnel.payments, color: "hsl(142, 71%, 45%)" },
  ];

  const maxValue = Math.max(...stages.map(s => s.value), 1);

  return (
    <div className="space-y-4">
      {stages.map((stage, idx) => {
        const width = (stage.value / maxValue) * 100;
        const conversionFromPrev = idx > 0 && stages[idx - 1].value > 0
          ? ((stage.value / stages[idx - 1].value) * 100).toFixed(1)
          : null;
        
        return (
          <div key={stage.name} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{stage.name}</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{stage.value}</span>
                {conversionFromPrev && (
                  <Badge variant="secondary" className="text-xs">{conversionFromPrev}%</Badge>
                )}
              </div>
            </div>
            <div className="h-8 bg-muted rounded-md overflow-hidden">
              <div 
                className="h-full rounded-md transition-all duration-500"
                style={{ width: `${Math.max(width, 2)}%`, backgroundColor: stage.color }}
              />
            </div>
          </div>
        );
      })}
      {funnel.submissions > 0 ? (
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Conversion</span>
            <span className="font-bold text-green-600 dark:text-green-400">
              {((funnel.payments / funnel.submissions) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      ) : (
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Conversion</span>
            <span className="font-bold text-muted-foreground">0%</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreDistributionPie({ data }: { data: { green: number; yellow: number; red: number } }) {
  const total = data.green + data.yellow + data.red;
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        No scores recorded yet
      </div>
    );
  }

  const chartData = [
    { name: "GREEN", value: data.green, color: "#22c55e" },
    { name: "YELLOW", value: data.yellow, color: "#eab308" },
    { name: "RED", value: data.red, color: "#ef4444" },
  ].filter(d => d.value > 0);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 -mt-4">
        {chartData.map(d => (
          <div key={d.name} className="flex items-center gap-1">
            <ScoreIcon score={d.name as "GREEN" | "YELLOW" | "RED"} />
            <span className="text-xs text-muted-foreground">{d.name}: {d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityAreaChart({ data }: { data: Array<{ date: string; count: number }> }) {
  if (data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">No activity data yet</div>;
  }

  const chartData = data.map(d => ({
    date: formatShortDate(d.date),
    submissions: d.count,
  }));

  return (
    <div className="h-64">
      <ChartErrorBoundary>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} label={{ value: "Submissions", angle: -90, position: "insideLeft", style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 } }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Area
            type="monotone"
            dataKey="submissions"
            stroke="hsl(var(--primary))"
            fillOpacity={1}
            fill="url(#colorSubmissions)"
          />
        </AreaChart>
      </ResponsiveContainer>
      </ChartErrorBoundary>
    </div>
  );
}

function RevenueLineChart({ data }: { data: Array<{ date: string; revenue: number }> }) {
  if (data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">No revenue data yet</div>;
  }

  const chartData = data.map(d => ({
    date: formatShortDate(d.date),
    revenue: d.revenue,
  }));

  return (
    <div className="h-64">
      <ChartErrorBoundary>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={formatCurrencyCompact} label={{ value: "Revenue", angle: -90, position: "insideLeft", style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 } }} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value: number) => [formatCurrency(value), 'Revenue']}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ fill: '#22c55e', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
      </ChartErrorBoundary>
    </div>
  );
}

function HourlyHeatmap({ data }: { data: Array<{ hour: number; count: number }> }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-1">
        {data.map(d => {
          const intensity = d.count / maxCount;
          const bg = intensity === 0 
            ? 'bg-muted' 
            : intensity < 0.33 
            ? 'bg-primary/20' 
            : intensity < 0.66 
            ? 'bg-primary/50' 
            : 'bg-primary';
          
          return (
            <div 
              key={d.hour}
              className={`h-8 rounded ${bg} flex items-center justify-center text-xs font-medium transition-colors`}
              title={`${d.hour}:00 - ${d.count} events`}
            >
              {d.count > 0 && d.count}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>12AM</span>
        <span>6AM</span>
        <span>12PM</span>
        <span>6PM</span>
        <span>11PM</span>
      </div>
    </div>
  );
}

function ReferrerChart({ data }: { data: Array<{ source: string; count: number }> }) {
  if (data.length === 0) {
    return <div className="flex items-center justify-center h-48 text-muted-foreground">No referrer data yet</div>;
  }

  const chartData = data.slice(0, 6).map(d => ({
    source: d.source.length > 20 ? d.source.slice(0, 20) + '...' : d.source,
    fullSource: d.source,
    visits: d.count,
  }));

  return (
    <div className="h-48">
      <ChartErrorBoundary fallbackHeight="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis type="number" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis type="category" dataKey="source" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} width={100} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="visits" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
      </ChartErrorBoundary>
    </div>
  );
}

function LiveActivityFeed({ events }: { events: Array<{ eventType: string; createdAt: string; metadata: EventMetadata | null }> }) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <Activity className="h-8 w-8 mb-2 opacity-50" />
        <p>No activity recorded yet</p>
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "payment_completed": return <DollarSign className="h-4 w-4 text-green-500" />;
      case "submission": return <Users className="h-4 w-4 text-blue-500" />;
      case "checkout_started": return <Target className="h-4 w-4 text-orange-500" />;
      case "submission_score": return <BarChart3 className="h-4 w-4 text-purple-500" />;
      case "page_view": return <Eye className="h-4 w-4 text-gray-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-1 max-h-[50vh] overflow-y-auto">
      {events.map((event, idx) => (
        <div 
          key={idx} 
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="p-2 rounded-full bg-muted">
            {getEventIcon(event.eventType)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm capitalize">
                {event.eventType.replace(/_/g, " ")}
              </span>
              {event.metadata?.dealScore && (
                <Badge
                  variant="outline"
                  className={
                    event.metadata.dealScore === "GREEN" ? "text-green-600 border-green-600 text-xs gap-1" :
                    event.metadata.dealScore === "YELLOW" ? "text-yellow-600 border-yellow-600 text-xs gap-1" :
                    "text-red-600 border-red-600 text-xs gap-1"
                  }
                >
                  <ScoreIcon score={event.metadata.dealScore} />
                  {event.metadata.dealScore}
                </Badge>
              )}
              {event.metadata?.tier && (
                <Badge variant="secondary" className="text-xs">${event.metadata.tier}</Badge>
              )}
            </div>
            {event.metadata?.vehicle && (
              <p className="text-xs text-muted-foreground truncate">{event.metadata.vehicle}</p>
            )}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatTime(event.createdAt)}
          </span>
        </div>
      ))}
    </div>
  );
}

function exportToCSV(metrics: MetricsSummary) {
  const rows = [
    ["Metric", "Value"],
    ["Total Submissions", metrics.totalSubmissions],
    ["Total Payments", metrics.totalPayments],
    ["Total Revenue", formatCurrency(metrics.revenue)],
    ["Conversion Rate", `${metrics.conversionRate.toFixed(1)}%`],
    ["Green Scores", metrics.scoreDistribution.green],
    ["Yellow Scores", metrics.scoreDistribution.yellow],
    ["Red Scores", metrics.scoreDistribution.red],
    [],
    ["Date", "Submissions"],
    ...metrics.submissionsByDay.map(d => [d.date, d.count]),
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
      const res = await fetch(`/api/metrics`, {
        headers: { Authorization: `Bearer ${adminKey}` },
      });
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
      const res = await fetch(`/api/admin/import-stripe-history`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      const data = await res.json();
      if (res.ok) {
        setImportResult({ success: true, message: data.message || `Imported ${data.imported} payments` });
        refetch();
      } else {
        setImportResult({ success: false, message: data.error || "Import failed" });
      }
    } catch (err: unknown) {
      setImportResult({ success: false, message: (err as Error).message || "Import failed" });
    } finally {
      setIsImporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <PanelSkeleton height="h-10" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <PanelSkeleton key={i} height="h-32" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <AdminAccessDenied clearKey={clearKey} />;
  }

  return (
    <>
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-12 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" data-testid="link-back-home">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
                  <LivePulse lastUpdated={lastUpdatedDate} refetchIntervalMs={REFETCH_REALTIME} />
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Last updated: {lastUpdated}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/admin/business">
                <Button variant="outline" size="sm" data-testid="link-business-dashboard">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  BI Dashboard
                </Button>
              </Link>
              <Link href="/admin/content">
                <Button variant="outline" size="sm" data-testid="link-content-dashboard">
                  <FileText className="h-4 w-4 mr-2" />
                  Content
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button variant="outline" size="sm" data-testid="link-users-dashboard">
                  <Users className="h-4 w-4 mr-2" />
                  Users
                </Button>
              </Link>
              <Link href="/admin/seo">
                <Button variant="outline" size="sm" data-testid="link-seo-dashboard">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  SEO
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleImportStripeHistory}
                disabled={isImporting}
                data-testid="button-import-stripe"
              >
                <Upload className={`h-4 w-4 mr-2 ${isImporting ? 'animate-pulse' : ''}`} />
                {isImporting ? "Importing…" : "Import Stripe History"}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => metrics && exportToCSV(metrics)}
                data-testid="button-export-csv"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
                disabled={isFetching}
                data-testid="button-refresh-metrics"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {importResult && (
          <div className={`mb-4 p-4 rounded-md ${importResult.success ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'}`}>
            <div className="flex items-center justify-between gap-4">
              <span>{importResult.message}</span>
              <Button variant="ghost" size="sm" onClick={() => setImportResult(null)}>Dismiss</Button>
            </div>
          </div>
        )}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" data-testid="tab-overview">Metrics</TabsTrigger>
            <TabsTrigger value="engagement" data-testid="tab-engagement">Engagement Funnel</TabsTrigger>
            <TabsTrigger value="revenue" data-testid="tab-revenue">Revenue</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Submissions</TabsTrigger>
            <TabsTrigger value="activity" data-testid="tab-activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Submissions"
                value={metrics?.totalSubmissions ?? 0}
                subtitle="All time"
                trend={metrics ? { current: metrics.trends.submissionsToday, previous: metrics.trends.submissionsYesterday, label: "yesterday" } : undefined}
                icon={Users}
              />
              <MetricCard
                title="Total Revenue"
                value={formatCurrency(metrics?.revenue ?? 0)}
                subtitle="Lifetime earnings"
                trend={metrics ? { current: metrics.trends.revenueToday, previous: metrics.trends.revenueYesterday, label: "yesterday" } : undefined}
                icon={DollarSign}
                color="success"
              />
              <MetricCard
                title="Conversion Rate"
                value={`${(metrics?.conversionRate ?? 0).toFixed(1)}%`}
                subtitle="Submissions to payment"
                icon={Target}
              />
              <MetricCard
                title="Paid Customers"
                value={metrics?.totalPayments ?? 0}
                subtitle="Full reviews"
                icon={CheckCircle}
                color="success"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Submissions Trend (30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivityAreaChart data={metrics?.submissionsByDay ?? []} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Conversion Funnel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ConversionFunnel funnel={metrics?.funnel ?? { submissions: 0, checkouts: 0, payments: 0 }} />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Deal Score Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScoreDistributionPie data={metrics?.scoreDistribution ?? { green: 0, yellow: 0, red: 0 }} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Hourly Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <HourlyHeatmap data={metrics?.hourlyActivity ?? []} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Top Pages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics?.pageViews && metrics.pageViews.length > 0 ? (
                    <div className="space-y-3">
                      {metrics.pageViews.slice(0, 6).map((pv) => (
                        <div key={pv.page} className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground truncate max-w-[160px]" title={pv.page}>{pv.page}</span>
                          <Badge variant="secondary">{pv.count}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                      <Eye className="h-6 w-6 mb-2 opacity-50" />
                      <p className="text-sm">No page views yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Page Views"
                value={metrics?.engagement?.totalPageViews ?? 0}
                subtitle="All pages"
                icon={Eye}
              />
              <MetricCard
                title="Button Clicks"
                value={metrics?.engagement?.ctaClicks ?? 0}
                subtitle="Call-to-action button clicks"
                icon={MousePointer}
              />
              <MetricCard
                title="Form Starts"
                value={metrics?.engagement?.formStarts ?? 0}
                subtitle="Users who began typing"
                icon={FileText}
              />
              <MetricCard
                title="Landing Click-Through %"
                value={`${(metrics?.engagement?.landingToAnalyzeCtr ?? 0).toFixed(1)}%`}
                subtitle="Landing page → button click rate"
                icon={Percent}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Full Engagement Funnel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: "Landing Page Views", value: metrics?.engagement?.landingPageViews ?? 0, color: "bg-blue-500" },
                      { label: "Button Clicks", value: metrics?.engagement?.ctaClicks ?? 0, color: "bg-indigo-500" },
                      { label: "Analyze Page Views", value: metrics?.engagement?.analyzePageViews ?? 0, color: "bg-purple-500" },
                      { label: "Form Starts", value: metrics?.engagement?.formStarts ?? 0, color: "bg-violet-500" },
                      { label: "Submissions", value: metrics?.funnel?.submissions ?? 0, color: "bg-amber-500" },
                      { label: "Checkouts", value: metrics?.funnel?.checkouts ?? 0, color: "bg-orange-500" },
                      { label: "Payments", value: metrics?.funnel?.payments ?? 0, color: "bg-green-500" },
                    ].map((step, idx, arr) => {
                      const maxVal = Math.max(...arr.map(s => s.value), 1);
                      const pct = (step.value / maxVal) * 100;
                      const dropoff = idx > 0 && arr[idx - 1].value > 0
                        ? ((arr[idx - 1].value - step.value) / arr[idx - 1].value * 100).toFixed(0)
                        : null;
                      return (
                        <div key={step.label}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{step.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold">{step.value}</span>
                              {dropoff && <span className="text-xs text-muted-foreground">(-{dropoff}%)</span>}
                            </div>
                          </div>
                          <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full ${step.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MousePointer className="h-5 w-5" />
                    Button Click Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics?.engagement?.ctaClicksByButton && metrics.engagement.ctaClicksByButton.length > 0 ? (
                    <div className="space-y-3">
                      {metrics.engagement.ctaClicksByButton.map((cta) => (
                        <div key={cta.ctaId} className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground truncate max-w-[200px]" title={cta.label}>{cta.label}</span>
                          <Badge variant="secondary">{cta.count}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                      <MousePointer className="h-6 w-6 mb-2 opacity-50" />
                      <p className="text-sm">No button clicks tracked yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Analyze Page Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{(metrics?.engagement?.analyzeToSubmissionRate ?? 0).toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">Visitors who submit after reaching analyze page</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Form Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{(metrics?.engagement?.formStartToSubmissionRate ?? 0).toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">Users who submit after starting to type</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Page Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Landing (/)</span>
                      <span className="font-medium">{metrics?.engagement?.landingPageViews ?? 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Analyze (/analyze)</span>
                      <span className="font-medium">{metrics?.engagement?.analyzePageViews ?? 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Other pages</span>
                      <span className="font-medium">{(metrics?.engagement?.totalPageViews ?? 0) - (metrics?.engagement?.landingPageViews ?? 0) - (metrics?.engagement?.analyzePageViews ?? 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Today's Revenue"
                value={formatCurrency(metrics?.trends.revenueToday ?? 0)}
                trend={metrics ? { current: metrics.trends.revenueToday, previous: metrics.trends.revenueYesterday, label: "yesterday" } : undefined}
                icon={DollarSign}
                color="success"
              />
              <MetricCard
                title="This Week"
                value={formatCurrency(metrics?.trends.revenueThisWeek ?? 0)}
                trend={metrics ? { current: metrics.trends.revenueThisWeek, previous: metrics.trends.revenueLastWeek, label: "last week" } : undefined}
                icon={TrendingUp}
                color="success"
              />
              <MetricCard
                title="Avg per Sale"
                value={formatCurrency(metrics?.totalPayments ? Math.round((metrics.revenue || 0) / metrics.totalPayments) : 0)}
                subtitle="Average order value"
                icon={Zap}
              />
              <MetricCard
                title="Checkout Rate"
                value={`${(metrics?.checkoutToPaymentRate ?? 0).toFixed(1)}%`}
                subtitle="Checkout to payment"
                icon={Target}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RevenueLineChart data={metrics?.revenueByDay ?? []} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel Details</CardTitle>
              </CardHeader>
              <CardContent>
                <ConversionFunnel funnel={metrics?.funnel ?? { submissions: 0, checkouts: 0, payments: 0 }} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Today's Users"
                value={metrics?.trends.submissionsToday ?? 0}
                trend={metrics ? { current: metrics.trends.submissionsToday, previous: metrics.trends.submissionsYesterday, label: "yesterday" } : undefined}
                icon={Users}
              />
              <MetricCard
                title="This Week"
                value={metrics?.trends.submissionsThisWeek ?? 0}
                trend={metrics ? { current: metrics.trends.submissionsThisWeek, previous: metrics.trends.submissionsLastWeek, label: "last week" } : undefined}
                icon={TrendingUp}
              />
              <MetricCard
                title="Total Page Views"
                value={metrics?.pageViews.reduce((sum, pv) => sum + pv.count, 0) ?? 0}
                icon={Eye}
              />
              <MetricCard
                title="Green Deals"
                value={metrics?.scoreDistribution.green ?? 0}
                subtitle="High quality deals"
                icon={CheckCircle}
                color="success"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScoreDistributionPie data={metrics?.scoreDistribution ?? { green: 0, yellow: 0, red: 0 }} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReferrerChart data={metrics?.referrers ?? []} />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>User Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityAreaChart data={metrics?.submissionsByDay ?? []} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Live Activity Feed
                    <LivePulse lastUpdated={lastUpdatedDate} refetchIntervalMs={REFETCH_REALTIME} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LiveActivityFeed events={metrics?.recentEvents ?? []} />
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Peak Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <HourlyHeatmap data={metrics?.hourlyActivity ?? []} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Events Today</span>
                      <Badge>{metrics?.trends.submissionsToday ?? 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Revenue Today</span>
                      <Badge variant="secondary">{formatCurrency(metrics?.trends.revenueToday ?? 0)}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Checkouts</span>
                      <Badge variant="outline">{metrics?.totalCheckouts ?? 0}</Badge>
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
