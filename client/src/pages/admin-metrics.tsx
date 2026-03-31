import { useState, useEffect } from "react";
import { setRobotsMeta } from "@/lib/seo";

import { AdminNav } from "@/components/admin-nav";
import { useAdminKey } from "@/hooks/use-admin-key";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { TimeRangeSelector, useTimeRange } from "@/components/time-range-selector";
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
  Percent,
  ChevronDown,
  ChevronUp,
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
  context,
  trend,
  icon: Icon,
  color = "default"
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  context?: string;
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
        {context && <p className="text-xs text-muted-foreground mt-1 italic">{context}</p>}
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
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const [adminKey, setAdminKey, clearKey] = useAdminKey();
  const [keyInput, setKeyInput] = useState("");
  const [range, setRange] = useTimeRange();

  useEffect(() => {
    return setRobotsMeta("noindex, nofollow");
  }, []);
  
  const handleImportStripeHistory = async () => {
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
    } catch (err: any) {
      setImportResult({ success: false, message: err.message || "Import failed" });
    } finally {
      setIsImporting(false);
    }
  };
  
  const { data: metrics, isLoading, error, refetch, isFetching, dataUpdatedAt } = useQuery<MetricsSummary>({
    queryKey: ["/api/metrics", adminKey, range],
    queryFn: async () => {
      const res = await fetch(`/api/metrics?range=${range}`, {
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    refetchInterval: 30000,
    enabled: !!adminKey,
  });

  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : "Never";

  const currentLabel = range === "today" ? "today" : range === "week" ? "this week" : range === "month" ? "this month" : "all time";
  const priorLabel = range === "today" ? "yesterday" : range === "week" ? "last week" : range === "month" ? "last month" : null;

  const submissionsUpFromPrior = metrics
    ? metrics.trends.submissionsToday >= metrics.trends.submissionsYesterday
    : null;
  const revenueUpFromPrior = metrics
    ? metrics.trends.revenueToday >= metrics.trends.revenueYesterday
    : null;

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
      {adminKey && isLoading && (
        <div className="max-w-7xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-muted rounded w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-lg" />)}
            </div>
          </div>
        </div>
      )}
      {adminKey && error && (
        <div className="flex items-center justify-center p-6 py-24">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-4">Unable to load metrics. Please check your access key.</p>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={clearKey}
                  data-testid="button-clear-admin-key"
                >
                  Clear key and re-enter
                </Button>
                <Link href="/">
                  <Button variant="ghost" data-testid="button-back-home">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {adminKey && !isLoading && !error && (<>
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
                  <LivePulse />
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Last updated: {lastUpdated}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <TimeRangeSelector value={range} onChange={setRange} />
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

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {importResult && (
          <div className={`p-4 rounded-md ${importResult.success ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'}`}>
            <div className="flex items-center justify-between gap-4">
              <span>{importResult.message}</span>
              <Button variant="ghost" size="sm" onClick={() => setImportResult(null)}>Dismiss</Button>
            </div>
          </div>
        )}

        {/* Plain-English Summary */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-5 pb-4">
            <p className="text-sm font-medium text-foreground" data-testid="summary-banner">
              {metrics && (() => {
                const parts: string[] = [];
                if (metrics.trends.submissionsToday > 0) {
                  parts.push(`${metrics.trends.submissionsToday} submissions ${currentLabel}`);
                }
                if (metrics.trends.revenueToday > 0) {
                  parts.push(`$${metrics.trends.revenueToday} earned ${currentLabel}`);
                }
                if (metrics.totalPayments > 0) {
                  parts.push(`${metrics.totalPayments} total paid`);
                }
                if (parts.length === 0) return "No activity yet — data will appear as users start using the app.";
                return parts.join(" · ") + ".";
              })()}
            </p>
            {metrics && submissionsUpFromPrior !== null && priorLabel && (
              <p className="text-xs text-muted-foreground mt-1">
                {submissionsUpFromPrior
                  ? `↑ Submissions are up from ${priorLabel} — on track.`
                  : `↓ Submissions are down from ${priorLabel}.`}
                {revenueUpFromPrior !== null && (revenueUpFromPrior
                  ? " Revenue is trending up."
                  : " Revenue is trending down.")}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Key Numbers */}
        <section>
          <h2 className="text-base font-semibold mb-3">Key Numbers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Deal Submissions"
              value={metrics?.totalSubmissions ?? 0}
              subtitle="Lifetime total"
              context="How many deals people have submitted for review"
              trend={metrics && priorLabel ? { current: metrics.trends.submissionsToday, previous: metrics.trends.submissionsYesterday, label: priorLabel } : undefined}
              icon={Users}
            />
            <MetricCard
              title="Total Revenue"
              value={`$${metrics?.revenue ?? 0}`}
              subtitle="Lifetime total"
              context="Total money collected from paid reviews"
              trend={metrics && priorLabel ? { current: metrics.trends.revenueToday, previous: metrics.trends.revenueYesterday, label: priorLabel } : undefined}
              icon={DollarSign}
              color="success"
            />
            <MetricCard
              title="Submission-to-Payment Rate"
              value={`${(metrics?.conversionRate ?? 0).toFixed(1)}%`}
              subtitle="Of all who submitted, how many paid"
              context="Higher is better — aim for &gt;10%"
              icon={Target}
            />
            <MetricCard
              title="People Who Paid"
              value={metrics?.totalPayments ?? 0}
              subtitle="Lifetime total"
              context="Unique paying customers — all time"
              icon={CheckCircle}
              color="success"
            />
          </div>
        </section>

        {/* Trends */}
        <section>
          <h2 className="text-base font-semibold mb-3">Trends</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Submissions Over Time (30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityAreaChart data={metrics?.submissionsByDay ?? []} />
              </CardContent>
            </Card>

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
          </div>
        </section>

        {/* Funnel */}
        <section>
          <h2 className="text-base font-semibold mb-3">Conversion Funnel</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Submit → Checkout → Pay
                </CardTitle>
                <p className="text-xs text-muted-foreground">How many people make it each step of the way</p>
              </CardHeader>
              <CardContent>
                <ConversionFunnel funnel={metrics?.funnel ?? { submissions: 0, checkouts: 0, payments: 0 }} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Deal Score Distribution
                </CardTitle>
                <p className="text-xs text-muted-foreground">How deals are rated: Green = fair, Yellow = review, Red = problems found</p>
              </CardHeader>
              <CardContent>
                <ScoreDistributionPie data={metrics?.scoreDistribution ?? { green: 0, yellow: 0, red: 0 }} />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Engagement */}
        <section>
          <h2 className="text-base font-semibold mb-3">Engagement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Page Views"
              value={metrics?.engagement?.totalPageViews ?? 0}
              subtitle="All pages"
              context="Total times any page was loaded"
              icon={Eye}
            />
            <MetricCard
              title="Button Clicks"
              value={metrics?.engagement?.ctaClicks ?? 0}
              subtitle="CTA button taps"
              context="People who clicked a call-to-action"
              icon={MousePointer}
            />
            <MetricCard
              title="Form Starts"
              value={metrics?.engagement?.formStarts ?? 0}
              subtitle="Started typing in the form"
              context="People who began entering deal info"
              icon={FileText}
            />
            <MetricCard
              title="Landing-to-Analyze Rate"
              value={`${(metrics?.engagement?.landingToAnalyzeCtr ?? 0).toFixed(1)}%`}
              subtitle="Homepage visitors who click through"
              context="Higher = stronger homepage hook"
              icon={Percent}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    { label: "People Who Paid", value: metrics?.funnel?.payments ?? 0, color: "bg-green-500" },
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
                        <span className="text-sm text-muted-foreground truncate max-w-[200px]">{cta.label}</span>
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
        </section>

        {/* Revenue details */}
        <section>
          <h2 className="text-base font-semibold mb-3">Revenue Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title={`Earned ${currentLabel.charAt(0).toUpperCase() + currentLabel.slice(1)}`}
              value={`$${metrics?.trends.revenueToday ?? 0}`}
              context={revenueUpFromPrior && priorLabel ? `↑ Up from ${priorLabel}` : priorLabel ? `↓ Down from ${priorLabel}` : undefined}
              trend={metrics && priorLabel ? { current: metrics.trends.revenueToday, previous: metrics.trends.revenueYesterday, label: priorLabel } : undefined}
              icon={DollarSign}
              color="success"
            />
            <MetricCard
              title={`${currentLabel.charAt(0).toUpperCase() + currentLabel.slice(1)} Revenue`}
              value={`$${metrics?.trends.revenueThisWeek ?? 0}`}
              trend={metrics && priorLabel ? { current: metrics.trends.revenueThisWeek, previous: metrics.trends.revenueLastWeek, label: priorLabel } : undefined}
              icon={TrendingUp}
              color="success"
            />
            <MetricCard
              title="Average per Sale"
              value={`$${metrics?.totalPayments ? Math.round((metrics.revenue || 0) / metrics.totalPayments) : 0}`}
              subtitle="Average order value"
              context="Typical amount per paying customer"
              icon={Zap}
            />
            <MetricCard
              title="Checkout Success Rate"
              value={`${(metrics?.checkoutToPaymentRate ?? 0).toFixed(1)}%`}
              subtitle="Of people who start checkout, how many finish"
              icon={Target}
            />
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-base font-semibold mb-3">Recent Activity</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Eye className="h-4 w-4" />
                  Top Pages
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metrics?.pageViews && metrics.pageViews.length > 0 ? (
                  <div className="space-y-3">
                    {metrics.pageViews.slice(0, 6).map((pv) => (
                      <div key={pv.page} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground truncate max-w-[200px]">{pv.page}</span>
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

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Submissions {currentLabel}</span>
                  <Badge>{metrics?.trends.submissionsToday ?? 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Revenue {currentLabel}</span>
                  <Badge variant="secondary">${metrics?.trends.revenueToday ?? 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Checkouts started</span>
                  <Badge variant="outline">{metrics?.totalCheckouts ?? 0}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Technical Details accordion */}
        <Accordion title="Technical Details — Live Event Feed, Peak Hours, Traffic Sources">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Live Event Feed
                <LivePulse />
              </CardTitle>
              <p className="text-xs text-muted-foreground">Events from the last 24 hours</p>
            </CardHeader>
            <CardContent>
              <LiveActivityFeed events={metrics?.recentEvents ?? []} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-5 w-5" />
                  Peak Hours
                </CardTitle>
                <p className="text-xs text-muted-foreground">When users are most active (by hour)</p>
              </CardHeader>
              <CardContent>
                <HourlyHeatmap data={metrics?.hourlyActivity ?? []} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Eye className="h-5 w-5" />
                  Traffic Sources
                </CardTitle>
                <p className="text-xs text-muted-foreground">Where visitors come from</p>
              </CardHeader>
              <CardContent>
                <ReferrerChart data={metrics?.referrers ?? []} />
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
                <div className="mt-4 space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Analyze-page submission rate</span>
                    <span className="font-medium">{(metrics?.engagement?.analyzeToSubmissionRate ?? 0).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Form completion rate</span>
                    <span className="font-medium">{(metrics?.engagement?.formStartToSubmissionRate ?? 0).toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Accordion>
      </div>
      </>)}
    </div>
  );
}
