import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  DollarSign, 
  Users, 
  TrendingUp, 
  TrendingDown,
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
  ArrowUpRight,
  ArrowDownRight,
  Minus,
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
  Legend,
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
  articleFunnel: Array<{
    slug: string;
    ctaClicks: number;
    analyzerLoads: number;
    submissions: number;
    payments: number;
  }>;
}

function TrendBadge({ current, previous, suffix = "" }: { current: number; previous: number; suffix?: string }) {
  if (previous === 0 && current === 0) {
    return <span className="text-xs text-muted-foreground flex items-center gap-1"><Minus className="h-3 w-3" /> No change</span>;
  }
  if (previous === 0) {
    return <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1"><ArrowUpRight className="h-3 w-3" /> New{suffix}</span>;
  }
  const change = ((current - previous) / previous) * 100;
  if (change > 0) {
    return <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1"><ArrowUpRight className="h-3 w-3" /> +{change.toFixed(0)}%{suffix}</span>;
  } else if (change < 0) {
    return <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1"><ArrowDownRight className="h-3 w-3" /> {change.toFixed(0)}%{suffix}</span>;
  }
  return <span className="text-xs text-muted-foreground flex items-center gap-1"><Minus className="h-3 w-3" /> No change</span>;
}

function MetricCard({ 
  title, 
  value, 
  subtitle,
  trend,
  icon: Icon,
  color = "default"
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  trend?: { current: number; previous: number; label: string };
  icon: typeof DollarSign;
  color?: "default" | "success" | "warning" | "danger";
}) {
  const colorClasses = {
    default: "text-foreground",
    success: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    danger: "text-red-600 dark:text-red-400",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="p-2 rounded-md bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${colorClasses[color]}`} data-testid={`stat-${title.toLowerCase().replace(/\s/g, '-')}`}>
          {value}
        </div>
        <div className="flex items-center justify-between mt-1">
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trend && <TrendBadge current={trend.current} previous={trend.previous} suffix={` vs ${trend.label}`} />}
        </div>
      </CardContent>
    </Card>
  );
}

function LivePulse() {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </span>
      <span className="text-xs text-muted-foreground">Live</span>
    </div>
  );
}

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
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
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
    date: d.date.slice(5),
    submissions: d.count,
  }));

  return (
    <div className="h-64">
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
          <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }} 
          />
          <Area 
            type="monotone" 
            dataKey="submissions" 
            stroke="hsl(var(--primary))" 
            fillOpacity={1} 
            fill="url(#colorSubmissions)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function RevenueLineChart({ data }: { data: Array<{ date: string; revenue: number }> }) {
  if (data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">No revenue data yet</div>;
  }

  const chartData = data.map(d => ({
    date: d.date.slice(5),
    revenue: d.revenue,
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${v}`} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
            formatter={(value: number) => [`$${value}`, 'Revenue']}
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
    visits: d.count,
  }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis type="number" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis type="category" dataKey="source" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} width={100} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }} 
          />
          <Bar dataKey="visits" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
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
    <div className="space-y-1 max-h-[400px] overflow-y-auto">
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
                    event.metadata.dealScore === "GREEN" ? "text-green-600 border-green-600 text-xs" :
                    event.metadata.dealScore === "YELLOW" ? "text-yellow-600 border-yellow-600 text-xs" :
                    "text-red-600 border-red-600 text-xs"
                  }
                >
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
    ["Total Revenue", `$${metrics.revenue}`],
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
  const [activeTab, setActiveTab] = useState("overview");
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const urlParams = new URLSearchParams(window.location.search);
  const adminKey = urlParams.get("key") || "odigos-admin-2024";
  
  const handleImportStripeHistory = async () => {
    setIsImporting(true);
    setImportResult(null);
    try {
      const res = await fetch(`/api/admin/import-stripe-history?key=${encodeURIComponent(adminKey)}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setImportResult({ success: true, message: data.message || `Imported ${data.imported} payments` });
        refetch();
      } else {
        setImportResult({ success: false, message: data.error || "Import failed" });
      }
    } catch (err: any) {
      setImportResult({ success: false, message: err.message || "Import failed" });
    } finally {
      setIsImporting(false);
    }
  };
  
  const { data: metrics, isLoading, error, refetch, isFetching, dataUpdatedAt } = useQuery<MetricsSummary>({
    queryKey: ["/api/metrics", adminKey],
    queryFn: async () => {
      const res = await fetch(`/api/metrics?key=${encodeURIComponent(adminKey)}`);
      if (!res.ok) throw new Error("Unauthorized or failed to fetch");
      return res.json();
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-muted rounded w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-lg" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">Unable to load metrics. Please check your access key.</p>
            <Link href="/">
              <Button variant="outline" data-testid="button-back-home">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : "Never";

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
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
                  <LivePulse />
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Last updated: {lastUpdated}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleImportStripeHistory}
                disabled={isImporting}
                data-testid="button-import-stripe"
              >
                <Upload className={`h-4 w-4 mr-2 ${isImporting ? 'animate-pulse' : ''}`} />
                {isImporting ? "Importing..." : "Import Stripe History"}
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
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="engagement" data-testid="tab-engagement">Engagement</TabsTrigger>
            <TabsTrigger value="revenue" data-testid="tab-revenue">Revenue</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            <TabsTrigger value="activity" data-testid="tab-activity">Activity</TabsTrigger>
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
                value={`$${metrics?.revenue ?? 0}`}
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
                          <span className="text-sm text-muted-foreground truncate max-w-[160px]">{pv.page}</span>
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
                title="CTA Clicks"
                value={metrics?.engagement?.ctaClicks ?? 0}
                subtitle="Button clicks"
                icon={MousePointer}
              />
              <MetricCard
                title="Form Starts"
                value={metrics?.engagement?.formStarts ?? 0}
                subtitle="Users who began typing"
                icon={FileText}
              />
              <MetricCard
                title="Landing CTR"
                value={`${(metrics?.engagement?.landingToAnalyzeCtr ?? 0).toFixed(1)}%`}
                subtitle="Landing → CTA click"
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
                      { label: "CTA Clicks", value: metrics?.engagement?.ctaClicks ?? 0, color: "bg-indigo-500" },
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
                    CTA Click Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics?.engagement?.ctaClicksByButton && metrics.engagement.ctaClicksByButton.length > 0 ? (
                    <div className="space-y-3">
                      {metrics.engagement.ctaClicksByButton.map((cta) => (
                        <div key={cta.ctaId} className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground truncate max-w-[200px]">{cta.label}</span>
                          <Badge variant="secondary">{cta.count}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                      <MousePointer className="h-6 w-6 mb-2 opacity-50" />
                      <p className="text-sm">No CTA clicks tracked yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {metrics?.articleFunnel && metrics.articleFunnel.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Article Funnel Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" data-testid="table-article-funnel">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Article</th>
                          <th className="text-right py-2 px-3 font-medium text-muted-foreground">CTA Clicks</th>
                          <th className="text-right py-2 px-3 font-medium text-muted-foreground">Analyzer Loads</th>
                          <th className="text-right py-2 px-3 font-medium text-muted-foreground">Submissions</th>
                          <th className="text-right py-2 pl-3 font-medium text-muted-foreground">Payments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metrics.articleFunnel.map((row) => (
                          <tr key={row.slug} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="py-2 pr-4 font-medium truncate max-w-[220px]" title={row.slug}>{row.slug}</td>
                            <td className="text-right py-2 px-3">{row.ctaClicks}</td>
                            <td className="text-right py-2 px-3">{row.analyzerLoads}</td>
                            <td className="text-right py-2 px-3">{row.submissions}</td>
                            <td className="text-right py-2 pl-3">
                              {row.payments > 0 ? (
                                <Badge variant="secondary" className="text-green-600">{row.payments}</Badge>
                              ) : (
                                <span className="text-muted-foreground">0</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

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
                value={`$${metrics?.trends.revenueToday ?? 0}`}
                trend={metrics ? { current: metrics.trends.revenueToday, previous: metrics.trends.revenueYesterday, label: "yesterday" } : undefined}
                icon={DollarSign}
                color="success"
              />
              <MetricCard
                title="This Week"
                value={`$${metrics?.trends.revenueThisWeek ?? 0}`}
                trend={metrics ? { current: metrics.trends.revenueThisWeek, previous: metrics.trends.revenueLastWeek, label: "last week" } : undefined}
                icon={TrendingUp}
                color="success"
              />
              <MetricCard
                title="Avg per Sale"
                value={`$${metrics?.totalPayments ? Math.round((metrics.revenue || 0) / metrics.totalPayments) : 0}`}
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
                    <LivePulse />
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
                      <Badge variant="secondary">${metrics?.trends.revenueToday ?? 0}</Badge>
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
    </div>
  );
}
