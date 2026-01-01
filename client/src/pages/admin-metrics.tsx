import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowLeft, DollarSign, Users, TrendingUp, BarChart3, Clock } from "lucide-react";

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

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon 
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  icon: typeof DollarSign;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`stat-${title.toLowerCase().replace(/\s/g, '-')}`}>{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function ScoreBar({ green, yellow, red }: { green: number; yellow: number; red: number }) {
  const total = green + yellow + red;
  if (total === 0) return <div className="text-muted-foreground text-sm">No data yet</div>;
  
  const greenPct = (green / total) * 100;
  const yellowPct = (yellow / total) * 100;
  const redPct = (red / total) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex h-4 w-full overflow-hidden rounded-md">
        <div className="bg-green-500" style={{ width: `${greenPct}%` }} />
        <div className="bg-yellow-500" style={{ width: `${yellowPct}%` }} />
        <div className="bg-red-500" style={{ width: `${redPct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>GREEN: {green} ({greenPct.toFixed(0)}%)</span>
        <span>YELLOW: {yellow} ({yellowPct.toFixed(0)}%)</span>
        <span>RED: {red} ({redPct.toFixed(0)}%)</span>
      </div>
    </div>
  );
}

function SubmissionsChart({ data }: { data: Array<{ date: string; count: number }> }) {
  if (data.length === 0) return <div className="text-muted-foreground text-sm">No data yet</div>;
  
  const maxCount = Math.max(...data.map(d => d.count), 1);
  
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
          <div 
            className="w-full bg-primary rounded-t"
            style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? '4px' : '0' }}
          />
          <span className="text-[10px] text-muted-foreground rotate-45 origin-left whitespace-nowrap">
            {d.date.slice(5)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminMetrics() {
  const urlParams = new URLSearchParams(window.location.search);
  const adminKey = urlParams.get("key") || "odigos-admin-2024";
  
  const { data: metrics, isLoading, error } = useQuery<MetricsSummary>({
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
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">Failed to load metrics. Please try again.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <a className="text-muted-foreground hover:text-foreground" data-testid="link-back-home">
              <ArrowLeft className="h-5 w-5" />
            </a>
          </Link>
          <h1 className="text-2xl font-bold">Odigos Metrics</h1>
          <Badge variant="secondary">Admin</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Submissions"
            value={metrics?.totalSubmissions ?? 0}
            subtitle="Deals analyzed"
            icon={Users}
          />
          <StatCard
            title="Payments"
            value={metrics?.totalPayments ?? 0}
            subtitle="Paid customers"
            icon={TrendingUp}
          />
          <StatCard
            title="Revenue"
            value={`$${metrics?.revenue ?? 0}`}
            subtitle="Total earned"
            icon={DollarSign}
          />
          <StatCard
            title="Conversion Rate"
            value={`${(metrics?.conversionRate ?? 0).toFixed(1)}%`}
            subtitle="Submissions to payment"
            icon={BarChart3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deal Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreBar 
                green={metrics?.scoreDistribution.green ?? 0}
                yellow={metrics?.scoreDistribution.yellow ?? 0}
                red={metrics?.scoreDistribution.red ?? 0}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Submissions (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <SubmissionsChart data={metrics?.submissionsByDay ?? []} />
            </CardContent>
          </Card>
        </div>

        {metrics?.pageViews && metrics.pageViews.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Page Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics.pageViews.map((pv) => (
                  <div key={pv.page} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{pv.page}</span>
                    <Badge variant="secondary">{pv.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metrics?.recentEvents && metrics.recentEvents.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {metrics.recentEvents.map((event, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          event.eventType === "payment_completed" ? "default" :
                          event.eventType === "submission" ? "secondary" : "outline"
                        }
                      >
                        {event.eventType.replace(/_/g, " ")}
                      </Badge>
                      {event.metadata?.dealScore && (
                        <Badge 
                          variant="outline"
                          className={
                            event.metadata.dealScore === "GREEN" ? "text-green-600 border-green-600" :
                            event.metadata.dealScore === "YELLOW" ? "text-yellow-600 border-yellow-600" :
                            "text-red-600 border-red-600"
                          }
                        >
                          {String(event.metadata.dealScore)}
                        </Badge>
                      )}
                      {event.metadata?.vehicle && (
                        <span className="text-sm text-muted-foreground">{String(event.metadata.vehicle)}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No events recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
