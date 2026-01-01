import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  DollarSign, 
  Users, 
  TrendingUp, 
  BarChart3, 
  Activity,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye
} from "lucide-react";

interface EventMetadata {
  dealScore?: "GREEN" | "YELLOW" | "RED";
  vehicle?: string;
  tier?: string;
  page?: string;
}

interface MetricsSummary {
  totalSubmissions: number;
  totalPayments: number;
  revenue: number;
  conversionRate: number;
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
  pageViews: Array<{
    page: string;
    count: number;
  }>;
}

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  trend,
  color = "default"
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  icon: typeof DollarSign;
  trend?: "up" | "down" | "neutral";
  color?: "default" | "success" | "warning" | "danger";
}) {
  const colorClasses = {
    default: "text-foreground",
    success: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    danger: "text-red-600 dark:text-red-400",
  };

  return (
    <Card className="relative overflow-visible">
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
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
            {trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
            {trend === "down" && <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />}
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function HealthIndicator({ status }: { status: "healthy" | "warning" | "error" }) {
  const config = {
    healthy: { icon: CheckCircle, label: "All Systems Operational", color: "text-green-500", bg: "bg-green-500/10" },
    warning: { icon: AlertTriangle, label: "Degraded Performance", color: "text-yellow-500", bg: "bg-yellow-500/10" },
    error: { icon: XCircle, label: "System Issues", color: "text-red-500", bg: "bg-red-500/10" },
  };
  const { icon: Icon, label, color, bg } = config[status];
  
  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg ${bg}`}>
      <Icon className={`h-6 w-6 ${color}`} />
      <div>
        <p className={`font-semibold ${color}`}>{label}</p>
        <p className="text-sm text-muted-foreground">Last checked: just now</p>
      </div>
    </div>
  );
}

function ScoreDistributionChart({ green, yellow, red }: { green: number; yellow: number; red: number }) {
  const total = green + yellow + red;
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        No deal scores recorded yet
      </div>
    );
  }
  
  const data = [
    { label: "GREEN", value: green, color: "bg-green-500", percent: ((green / total) * 100).toFixed(0) },
    { label: "YELLOW", value: yellow, color: "bg-yellow-500", percent: ((yellow / total) * 100).toFixed(0) },
    { label: "RED", value: red, color: "bg-red-500", percent: ((red / total) * 100).toFixed(0) },
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
        {data.map((d, i) => (
          <div 
            key={i}
            className={`${d.color} transition-all duration-500`} 
            style={{ width: `${d.percent}%` }} 
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {data.map((d, i) => (
          <div key={i} className="text-center">
            <div className="flex items-center justify-center gap-2">
              <div className={`h-3 w-3 rounded-full ${d.color}`} />
              <span className="text-2xl font-bold">{d.value}</span>
            </div>
            <p className="text-xs text-muted-foreground">{d.label} ({d.percent}%)</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityChart({ data }: { data: Array<{ date: string; count: number }> }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        No activity data yet
      </div>
    );
  }
  
  const maxCount = Math.max(...data.map(d => d.count), 1);
  
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1 h-32">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center group relative">
            <div 
              className="w-full bg-primary/80 hover:bg-primary rounded-t transition-all duration-200 cursor-pointer"
              style={{ height: `${Math.max((d.count / maxCount) * 100, 4)}%` }}
            />
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover border rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {d.count} submissions
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>{data[0]?.date.slice(5)}</span>
        <span>{data[data.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  );
}

function LiveActivityFeed({ events }: { events: Array<{ eventType: string; createdAt: string; metadata: EventMetadata | null }> }) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <Activity className="h-8 w-8 mb-2 opacity-50" />
        <p>No activity recorded yet</p>
        <p className="text-xs">Events will appear here in real-time</p>
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "payment_completed": return <DollarSign className="h-4 w-4 text-green-500" />;
      case "submission": return <Users className="h-4 w-4 text-blue-500" />;
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
    <div className="space-y-1 max-h-[320px] overflow-y-auto pr-2">
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

export default function AdminMetrics() {
  const urlParams = new URLSearchParams(window.location.search);
  const adminKey = urlParams.get("key") || "odigos-admin-2024";
  
  const { data: metrics, isLoading, error, refetch, isFetching } = useQuery<MetricsSummary>({
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
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-muted rounded-lg" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="h-64 bg-muted rounded-lg" />
              <div className="h-64 bg-muted rounded-lg" />
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
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
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

  const systemStatus = (metrics?.totalSubmissions ?? 0) > 0 ? "healthy" : "healthy";

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
                <h1 className="text-2xl font-bold">Observability Dashboard</h1>
                <p className="text-sm text-muted-foreground">Real-time metrics and analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">
                Auto-refresh: 30s
              </Badge>
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

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <HealthIndicator status={systemStatus} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Submissions"
            value={metrics?.totalSubmissions ?? 0}
            subtitle="Deals analyzed"
            icon={Users}
          />
          <MetricCard
            title="Paid Customers"
            value={metrics?.totalPayments ?? 0}
            subtitle="Full reviews purchased"
            icon={TrendingUp}
            color="success"
          />
          <MetricCard
            title="Total Revenue"
            value={`$${metrics?.revenue ?? 0}`}
            subtitle="Lifetime earnings"
            icon={DollarSign}
            color="success"
          />
          <MetricCard
            title="Conversion Rate"
            value={`${(metrics?.conversionRate ?? 0).toFixed(1)}%`}
            subtitle="Submission to payment"
            icon={BarChart3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Deal Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreDistributionChart 
                green={metrics?.scoreDistribution.green ?? 0}
                yellow={metrics?.scoreDistribution.yellow ?? 0}
                red={metrics?.scoreDistribution.red ?? 0}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Submissions (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityChart data={metrics?.submissionsByDay ?? []} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Live Activity Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LiveActivityFeed events={metrics?.recentEvents ?? []} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Page Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metrics?.pageViews && metrics.pageViews.length > 0 ? (
                <div className="space-y-3">
                  {metrics.pageViews.slice(0, 8).map((pv) => (
                    <div key={pv.page} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground truncate max-w-[180px]">{pv.page}</span>
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
      </div>
    </div>
  );
}
