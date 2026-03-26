import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Eye, TrendingUp, FileText, MousePointerClick, AlertTriangle, BarChart3 } from "lucide-react";
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

interface PageAttribution {
  page: string;
  views: number;
  ctaClicks: number;
  ctaClickRate: number;
  attributedSubmissions: number;
}

type SortKey = "views" | "ctaClickRate" | "attributedSubmissions" | "ctaClicks";

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

  const { data, isLoading, isError } = useQuery<{ pages: PageAttribution[] }>({
    queryKey: ["/api/admin/bi/attribution", adminKey, range],
    queryFn: async () => {
      const res = await fetch(`/api/admin/bi/attribution?range=${range}`, {
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

  const totalViews = allPages.reduce((s, p) => s + p.views, 0);
  const totalCtaClicks = allPages.reduce((s, p) => s + p.ctaClicks, 0);
  const totalSubmissions = allPages.reduce((s, p) => s + p.attributedSubmissions, 0);
  const overallCtaRate = totalViews > 0 ? (totalCtaClicks / totalViews) * 100 : 0;

  const chartData = allPages.slice(0, 10).map(p => ({
    page: p.page.length > 28 ? "…" + p.page.slice(-25) : p.page,
    views: p.views,
    ctaClicks: p.ctaClicks,
    submissions: p.attributedSubmissions,
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
                  Last-touch attribution — which pages convert to submissions
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card data-testid="stat-total-views">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Page Views</p>
              </div>
              <p className="text-3xl font-bold">{totalViews.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-total-cta">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground uppercase tracking-wide">CTA Clicks ({overallCtaRate.toFixed(1)}%)</p>
              </div>
              <p className="text-3xl font-bold">{totalCtaClicks.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-total-submissions">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Attributed Submissions</p>
              </div>
              <p className="text-3xl font-bold">{totalSubmissions.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {!isLoading && chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top 10 Pages — Views vs CTA Clicks
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
                    <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Views" />
                    <Bar dataKey="ctaClicks" fill="#22c55e" radius={[0, 4, 4, 0]} name="CTA Clicks" />
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
                <SortBtn k="ctaClicks" label="CTA Clicks" />
                <SortBtn k="ctaClickRate" label="CTA Rate" />
                <SortBtn k="attributedSubmissions" label="Submissions" />
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
                <p className="text-sm">No page attribution data yet</p>
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
                        <th className="text-right py-2 px-2 font-medium">CTA Clicks</th>
                        <th className="text-right py-2 px-2 font-medium">CTA Rate</th>
                        <th className="text-right py-2 pl-2 font-medium">Submissions</th>
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
                          <td className="text-right py-2 px-2">{p.ctaClicks.toLocaleString()}</td>
                          <td className="text-right py-2 px-2">
                            <Badge
                              variant={p.ctaClickRate > 10 ? "default" : p.ctaClickRate > 5 ? "secondary" : "outline"}
                              className="text-xs"
                            >
                              {p.ctaClickRate.toFixed(1)}%
                            </Badge>
                          </td>
                          <td className="text-right py-2 pl-2">
                            <span className={p.attributedSubmissions > 0 ? "font-semibold text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                              {p.attributedSubmissions}
                            </span>
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
