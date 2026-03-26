import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Eye, TrendingUp, FileText, MousePointerClick, AlertTriangle, BarChart3, Users } from "lucide-react";
import { useAdminKey } from "@/hooks/use-admin-key";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DateRange = "today" | "week" | "month" | "all";

const RANGE_LABELS: Record<DateRange, string> = {
  today: "Today",
  week: "Last 7 Days",
  month: "Last 30 Days",
  all: "All Time",
};

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

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
};

export default function AdminContent() {
  const [adminKey, setAdminKey, clearKey] = useAdminKey();
  const [keyInput, setKeyInput] = useState("");
  const [range, setRange] = useState<DateRange>("all");
  const [sortKey, setSortKey] = useState<SortKey>("views");
  const [showAll, setShowAll] = useState(false);

  const { data, isLoading, isError } = useQuery<ContentMetrics>({
    queryKey: ["/api/admin/content", adminKey, range],
    queryFn: async () => {
      const res = await fetch(`/api/admin/content?range=${range}`, {
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    refetchInterval: q => {
      const errMsg = (q.state.error as Error)?.message ?? "";
      return errMsg.startsWith("401") ? false : 300000;
    },
    enabled: !!adminKey,
  });

  if (!adminKey) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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
    );
  }

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
      className={`text-xs px-2 py-1 rounded transition-colors ${
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
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Link href="/admin/metrics">
                <Button variant="ghost" size="icon" data-testid="link-back-metrics">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                  SEO / Content Performance
                </h1>
                <p className="text-sm text-muted-foreground">
                  Per-page: sessions, analyze starts, conversions, conversion rate
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex rounded-md border overflow-hidden">
                {(Object.keys(RANGE_LABELS) as DateRange[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    data-testid={`range-${r}`}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      range === r
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {RANGE_LABELS[r]}
                  </button>
                ))}
              </div>
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
        {isError && (
          <div className="flex items-start gap-3 p-4 rounded-lg border border-red-400 bg-red-50 dark:bg-red-950/20">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-400 text-sm">Failed to load content data. Check your admin key.</p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card data-testid="stat-total-views">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Page Views</p>
              </div>
              <p className="text-3xl font-bold">{(data?.totalViews ?? 0).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-total-sessions">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Sessions</p>
              </div>
              <p className="text-3xl font-bold">{(data?.totalSessions ?? 0).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-total-starts">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Analyze Starts</p>
              </div>
              <p className="text-3xl font-bold">{(data?.totalAnalyzeStarts ?? 0).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-total-conversions">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
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
                    <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Sessions" />
                    <Bar dataKey="analyzeStarts" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Analyze Starts" />
                    <Bar dataKey="conversions" fill="#22c55e" radius={[0, 4, 4, 0]} name="Conversions" />
                  </BarChart>
                </ResponsiveContainer>
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
                <SortBtn k="conversions" label="Conv." />
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
                        <th className="text-left py-2 pr-4 font-medium">#</th>
                        <th className="text-left py-2 pr-4 font-medium">Page</th>
                        <th className="text-right py-2 px-2 font-medium">Views</th>
                        <th className="text-right py-2 px-2 font-medium">Sessions</th>
                        <th className="text-right py-2 px-2 font-medium">Starts</th>
                        <th className="text-right py-2 px-2 font-medium">Conv.</th>
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
    </div>
  );
}
