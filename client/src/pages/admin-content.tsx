import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Eye, TrendingUp, FileText, MousePointerClick, BarChart3, Users } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import {
  type DateRange,
  DateRangeSelector,
  PanelErrorCard,
  ChartErrorBoundary,
  TOOLTIP_STYLE,
  REFETCH_SLOW,
  refetchUnlessPermanent,
} from "@/components/admin-dashboard-utils";
import { formatNumber } from "@/lib/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ContentPage {
  page: string;
  views: number;
  sessions: number;
  analyzeStarts: number;
  conversions: number;
  conversionRate: number;
  ctaClicks: number;
}

interface ContentMetrics {
  pages: ContentPage[];
  totalViews: number;
  totalSessions: number;
  totalAnalyzeStarts: number;
  totalConversions: number;
}

type SortKey = "views" | "sessions" | "analyzeStarts" | "conversions" | "conversionRate" | "ctaClicks";

export default function AdminContent() {
  return (
    <AdminShell>
      {(adminKey, clearKey) => <AdminContentInner adminKey={adminKey} clearKey={clearKey} />}
    </AdminShell>
  );
}

function AdminContentInner({ adminKey, clearKey }: { adminKey: string; clearKey: () => void }) {
  const [range, setRange] = useState<DateRange>("all");
  const [sortKey, setSortKey] = useState<SortKey>("views");
  const [showAll, setShowAll] = useState(false);

  const { data, isLoading, isError, error } = useQuery<ContentMetrics>({
    queryKey: ["/api/admin/content", adminKey, range],
    queryFn: async () => {
      const res = await fetch(`/api/admin/content?range=${range}`, {
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    refetchInterval: refetchUnlessPermanent(REFETCH_SLOW),
    enabled: !!adminKey,
  });

  const allPages = (data?.pages ?? []).slice().sort((a, b) => b[sortKey] - a[sortKey]);
  const visiblePages = showAll ? allPages : allPages.slice(0, 25);

  const chartData = allPages.slice(0, 10).map(p => ({
    page: p.page.length > 28 ? "…" + p.page.slice(-25) : p.page,
    views: p.views,
    sessions: p.sessions,
    analyzeStarts: p.analyzeStarts,
    conversions: p.conversions,
  }));

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => setSortKey(k)}
      data-testid={`sort-${k}`}
      className={`text-xs px-2 py-1.5 rounded cursor-pointer transition-colors ${
        sortKey === k
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {label}
    </button>
  );

  const overallConversionRate = (data?.totalSessions ?? 0) > 0
    ? ((data?.totalConversions ?? 0) / (data?.totalSessions ?? 1)) * 100
    : 0;

  return (
    <>
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-12 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Link href="/admin/metrics">
                <Button variant="ghost" size="icon" data-testid="link-back-metrics">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Content Performance</h1>
                <p className="text-sm text-muted-foreground">
                  Page-by-page sessions, analyze starts, and conversions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DateRangeSelector value={range} onChange={setRange} />
              <Button
                variant="ghost"
                size="sm"
                onClick={clearKey}
                className="text-xs text-muted-foreground"
                data-testid="button-clear-key"
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {isError && <PanelErrorCard error={error} label="content data" />}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card data-testid="stat-total-views">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Page Views</p>
              </div>
              <p className="text-3xl font-bold">{(data?.totalViews ?? 0).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-total-sessions">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Sessions</p>
              </div>
              <p className="text-3xl font-bold">{(data?.totalSessions ?? 0).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-total-starts">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Analyze Starts</p>
              </div>
              <p className="text-3xl font-bold">{(data?.totalAnalyzeStarts ?? 0).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-total-conversions">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  Conversions ({overallConversionRate.toFixed(1)}%)
                </p>
              </div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {(data?.totalConversions ?? 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {!isLoading && chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top 10 Pages — Sessions, Analyze Starts, Conversions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ChartErrorBoundary fallbackHeight="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="page"
                      width={180}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Sessions" />
                    <Bar dataKey="analyzeStarts" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Analyze Starts" />
                    <Bar dataKey="conversions" fill="#22c55e" radius={[0, 4, 4, 0]} name="Conversions" />
                  </BarChart>
                </ResponsiveContainer>
                </ChartErrorBoundary>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  All Pages ({allPages.length})
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Showing {visiblePages.length} of {allPages.length} pages
                </p>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-xs text-muted-foreground mr-1">Sort:</span>
                <SortBtn k="views" label="Views" />
                <SortBtn k="sessions" label="Sessions" />
                <SortBtn k="analyzeStarts" label="Starts" />
                <SortBtn k="conversions" label="Conversions" />
                <SortBtn k="conversionRate" label="Rate" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-10 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : allPages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                <Eye className="h-8 w-8 opacity-40" />
                <p className="text-sm">No page data yet</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" data-testid="table-content-attribution">
                    <thead>
                      <tr className="border-b text-muted-foreground text-xs">
                        <th className="text-left py-3 pr-4 font-semibold">#</th>
                        <th className="text-left py-3 pr-4 font-semibold">Page</th>
                        <th className="text-right py-3 px-3 font-semibold">Views</th>
                        <th className="text-right py-3 px-3 font-semibold">Sessions</th>
                        <th className="text-right py-3 px-3 font-semibold">Starts</th>
                        <th className="text-right py-3 px-3 font-semibold">Conversions</th>
                        <th className="text-right py-2 pl-2 font-medium">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visiblePages.map((p, idx) => (
                        <tr
                          key={p.page}
                          className="border-b border-muted/50 hover:bg-muted/30 transition-colors"
                          data-testid={`content-row-${idx}`}
                        >
                          <td className="py-2 pr-4 text-xs text-muted-foreground">{idx + 1}</td>
                          <td className="py-2 pr-4">
                            <a
                              href={p.page}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs hover:underline text-primary truncate max-w-xs block"
                            >
                              {p.page}
                            </a>
                          </td>
                          <td className="text-right py-2 px-2 font-semibold">{p.views.toLocaleString()}</td>
                          <td className="text-right py-2 px-2">{p.sessions.toLocaleString()}</td>
                          <td className="text-right py-2 px-2">{p.analyzeStarts.toLocaleString()}</td>
                          <td className="text-right py-2 px-2">
                            <span className={p.conversions > 0 ? "font-semibold text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                              {p.conversions}
                            </span>
                          </td>
                          <td className="text-right py-2 pl-2">
                            {p.sessions > 0 ? (
                              <Badge
                                variant={p.conversionRate > 5 ? "default" : p.conversionRate > 1 ? "secondary" : "outline"}
                                className="text-xs"
                              >
                                {p.conversionRate.toFixed(1)}%
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!showAll && allPages.length > 25 && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAll(true)}
                      data-testid="button-show-all"
                    >
                      Show all {allPages.length} pages
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
