import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  RefreshCw,
  Eye,
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertTriangle,
  MapPin,
  Globe,
  Users,
  Activity,
  Zap,
  CheckCircle,
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

type DateRange = "today" | "week" | "month" | "all";

const RANGE_LABELS: Record<DateRange, string> = {
  today: "Today",
  week: "Last 7 Days",
  month: "Last 30 Days",
  all: "All Time",
};

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

function DateRangeSelector({ value, onChange }: { value: DateRange; onChange: (r: DateRange) => void }) {
  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      {(Object.keys(RANGE_LABELS) as DateRange[]).map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          data-testid={`range-${r}`}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            value === r
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {RANGE_LABELS[r]}
        </button>
      ))}
    </div>
  );
}

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) {
    return <span className="text-xs text-muted-foreground flex items-center gap-1"><Minus className="h-3 w-3" /> —</span>;
  }
  if (previous === 0) {
    return <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1"><ArrowUpRight className="h-3 w-3" /> New</span>;
  }
  const change = ((current - previous) / previous) * 100;
  if (change > 0) {
    return <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1"><ArrowUpRight className="h-3 w-3" /> +{change.toFixed(0)}%</span>;
  } else if (change < 0) {
    return <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1"><ArrowDownRight className="h-3 w-3" /> {change.toFixed(0)}%</span>;
  }
  return <span className="text-xs text-muted-foreground flex items-center gap-1"><Minus className="h-3 w-3" /> —</span>;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "default",
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: typeof DollarSign;
  color?: "default" | "success" | "warning" | "danger";
  trend?: { current: number; previous: number };
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
        <div
          className={`text-3xl font-bold ${colorClasses[color]}`}
          data-testid={`stat-${title.toLowerCase().replace(/\s+/g, "-")}`}
        >
          {value}
        </div>
        <div className="flex items-center justify-between mt-1 gap-2">
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trend && <TrendBadge current={trend.current} previous={trend.previous} />}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon: Icon, label }: { icon: typeof Activity; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
      <Icon className="h-8 w-8 opacity-40" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
};

// ============================================================================
// Funnel Panel
// ============================================================================
interface FunnelStage {
  name: string;
  today: number;
  week: number;
  allTime: number;
  dropoffPct: number | null;
  alert: boolean;
}

function FunnelPanel({ adminKey, range }: { adminKey: string; range: DateRange }) {
  const { data, isLoading } = useQuery<{ stages: FunnelStage[] }>({
    queryKey: ["/api/admin/bi/funnel", adminKey, range],
    queryFn: async () => {
      const res = await fetch(`/api/admin/bi/funnel?key=${encodeURIComponent(adminKey)}&range=${range}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 300000,
  });

  if (isLoading) return <div className="h-64 animate-pulse bg-muted rounded-lg" />;

  const stages = data?.stages ?? [];
  const maxAllTime = Math.max(...stages.map((s) => s.allTime), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Acquisition-to-Revenue Funnel
        </CardTitle>
        <p className="text-xs text-muted-foreground">Full funnel with drop-off rates — red alerts at &gt;60% drop-off</p>
      </CardHeader>
      <CardContent>
        {stages.length === 0 ? (
          <EmptyState icon={Target} label="No funnel data yet" />
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-4 text-xs text-muted-foreground font-medium mb-1 px-1">
              <span>Stage</span>
              <span className="text-right">Today</span>
              <span className="text-right">This Week</span>
              <span className="text-right">All Time</span>
            </div>
            {stages.map((stage) => {
              const barWidth = (stage.allTime / maxAllTime) * 100;
              return (
                <div key={stage.name} className="space-y-1">
                  <div className="grid grid-cols-4 items-center text-sm px-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stage.name}</span>
                      {stage.alert && (
                        <span title="High drop-off!">
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                        </span>
                      )}
                    </div>
                    <span className="text-right text-muted-foreground">{stage.today}</span>
                    <span className="text-right text-muted-foreground">{stage.week}</span>
                    <span className="text-right font-semibold">{stage.allTime}</span>
                  </div>
                  <div className="h-5 bg-muted rounded overflow-hidden mx-1">
                    <div
                      className={`h-full rounded transition-all duration-500 ${
                        stage.alert ? "bg-red-500" : "bg-primary"
                      }`}
                      style={{ width: `${Math.max(barWidth, 1)}%` }}
                    />
                  </div>
                  {stage.dropoffPct !== null && (
                    <div className="text-right text-xs px-1">
                      <span
                        className={
                          stage.alert
                            ? "text-red-600 dark:text-red-400 font-semibold"
                            : "text-muted-foreground"
                        }
                        data-testid={`dropoff-${stage.name.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        ↓ {stage.dropoffPct.toFixed(1)}% drop-off from previous
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// SEO Content Attribution Panel
// ============================================================================
interface PageAttribution {
  page: string;
  views: number;
  ctaClicks: number;
  ctaClickRate: number;
  attributedSubmissions: number;
}

type AttributionSortKey = "views" | "ctaClickRate" | "attributedSubmissions";

function AttributionPanel({ adminKey, range }: { adminKey: string; range: DateRange }) {
  const [sortKey, setSortKey] = useState<AttributionSortKey>("views");

  const { data, isLoading } = useQuery<{ pages: PageAttribution[] }>({
    queryKey: ["/api/admin/bi/attribution", adminKey, range],
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/bi/attribution?key=${encodeURIComponent(adminKey)}&range=${range}`
      );
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 300000,
  });

  if (isLoading) return <div className="h-64 animate-pulse bg-muted rounded-lg" />;

  const pages = (data?.pages ?? [])
    .slice()
    .sort((a, b) => b[sortKey] - a[sortKey])
    .slice(0, 20);

  const SortBtn = ({ k, label }: { k: AttributionSortKey; label: string }) => (
    <button
      onClick={() => setSortKey(k)}
      data-testid={`sort-attr-${k}`}
      className={`text-xs px-2 py-1 rounded ${
        sortKey === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              SEO Content Attribution
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Last-touch attribution — which content converts to submissions
            </p>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-1">Sort:</span>
            <SortBtn k="views" label="Views" />
            <SortBtn k="ctaClickRate" label="CTA Rate" />
            <SortBtn k="attributedSubmissions" label="Submissions" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {pages.length === 0 ? (
          <EmptyState icon={Eye} label="No page attribution data yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left py-2 pr-4 font-medium">Page</th>
                  <th className="text-right py-2 px-2 font-medium">Views</th>
                  <th className="text-right py-2 px-2 font-medium">CTA Rate</th>
                  <th className="text-right py-2 pl-2 font-medium">Submissions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr
                    key={p.page}
                    className="border-b border-muted/50 hover:bg-muted/30 transition-colors"
                    data-testid={`attr-row-${p.page}`}
                  >
                    <td className="py-2 pr-4 font-mono text-xs truncate max-w-[200px]">{p.page}</td>
                    <td className="text-right py-2 px-2">{p.views.toLocaleString()}</td>
                    <td className="text-right py-2 px-2">
                      <Badge
                        variant={p.ctaClickRate > 10 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {p.ctaClickRate.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="text-right py-2 pl-2 font-semibold">{p.attributedSubmissions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// User Behavior Panel
// ============================================================================
interface UserBehavior {
  fieldEngagement: Array<{ fieldName: string; focusCount: number; abandonCount: number }>;
  avgPagesPerSession: number;
  bounceRate: number;
  topEntryPages: Array<{ page: string; count: number }>;
  topExitPages: Array<{ page: string; count: number }>;
}

function BehaviorPanel({ adminKey, range }: { adminKey: string; range: DateRange }) {
  const { data, isLoading } = useQuery<UserBehavior>({
    queryKey: ["/api/admin/bi/behavior", adminKey, range],
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/bi/behavior?key=${encodeURIComponent(adminKey)}&range=${range}`
      );
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 300000,
  });

  if (isLoading) return <div className="h-64 animate-pulse bg-muted rounded-lg" />;

  const maxFocus = Math.max(...(data?.fieldEngagement ?? []).map((f) => f.focusCount), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Avg Pages / Session"
          value={(data?.avgPagesPerSession ?? 0).toFixed(1)}
          subtitle="Session depth indicator"
          icon={Activity}
        />
        <StatCard
          title="Bounce Rate"
          value={`${(data?.bounceRate ?? 0).toFixed(1)}%`}
          subtitle="Single-page sessions"
          icon={TrendingDown}
          color={(data?.bounceRate ?? 0) > 60 ? "danger" : "default"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" />
            Form Field Engagement &amp; Abandonment
          </CardTitle>
          <p className="text-xs text-muted-foreground">Focus = sessions that focused on this field. Abandon = sessions that focused but never submitted.</p>
        </CardHeader>
        <CardContent>
          {(data?.fieldEngagement ?? []).length === 0 ? (
            <EmptyState icon={Activity} label="No form focus data yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left py-2 pr-4 font-medium">Field</th>
                    <th className="text-right py-2 px-2 font-medium">Focuses</th>
                    <th className="text-right py-2 px-2 font-medium">Abandonments</th>
                    <th className="text-right py-2 pl-2 font-medium">Abandon Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.fieldEngagement ?? []).slice(0, 15).map((f) => {
                    const abandonRate = f.focusCount > 0 ? (f.abandonCount / f.focusCount) * 100 : 0;
                    return (
                      <tr
                        key={f.fieldName}
                        className="border-b border-muted/50 hover:bg-muted/30"
                        data-testid={`field-row-${f.fieldName}`}
                      >
                        <td className="py-2 pr-4 font-medium">{f.fieldName}</td>
                        <td className="text-right py-2 px-2">{f.focusCount}</td>
                        <td className="text-right py-2 px-2">{f.abandonCount}</td>
                        <td className="text-right py-2 pl-2">
                          <Badge
                            variant={abandonRate > 50 ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {abandonRate.toFixed(0)}%
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Entry Pages</CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.topEntryPages ?? []).length === 0 ? (
              <EmptyState icon={Eye} label="No data yet" />
            ) : (
              <div className="space-y-2">
                {(data?.topEntryPages ?? []).map((p) => (
                  <div key={p.page} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-xs truncate max-w-[160px]">{p.page}</span>
                    <Badge variant="secondary">{p.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Exit Pages</CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.topExitPages ?? []).length === 0 ? (
              <EmptyState icon={Eye} label="No data yet" />
            ) : (
              <div className="space-y-2">
                {(data?.topExitPages ?? []).map((p) => (
                  <div key={p.page} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-xs truncate max-w-[160px]">{p.page}</span>
                    <Badge variant="secondary">{p.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// Deal Outcome Intelligence Panel
// ============================================================================
interface DealOutcome {
  scoreDistribution: { green: number; yellow: number; red: number };
  avgScoreByDay: Array<{ date: string; avgScore: number }>;
  topFeeTypes: Array<{ feeName: string; count: number }>;
  topTacticFlags: Array<{ tactic: string; count: number }>;
}

function DealOutcomePanel({ adminKey, range }: { adminKey: string; range: DateRange }) {
  const { data, isLoading } = useQuery<DealOutcome>({
    queryKey: ["/api/admin/bi/deal-outcome", adminKey, range],
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/bi/deal-outcome?key=${encodeURIComponent(adminKey)}&range=${range}`
      );
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 300000,
  });

  if (isLoading) return <div className="h-64 animate-pulse bg-muted rounded-lg" />;

  const dist = data?.scoreDistribution ?? { green: 0, yellow: 0, red: 0 };
  const total = dist.green + dist.yellow + dist.red;

  const donutData = [
    { name: "GREEN", value: dist.green, color: "#22c55e" },
    { name: "YELLOW", value: dist.yellow, color: "#eab308" },
    { name: "RED", value: dist.red, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  const trendData = (data?.avgScoreByDay ?? []).map((d) => ({
    date: d.date.slice(5),
    score: parseFloat(d.avgScore.toFixed(2)),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Verdict Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {total === 0 ? (
              <EmptyState icon={BarChart3} label="No scores yet" />
            ) : (
              <>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {donutData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-1">
                  {donutData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-xs text-muted-foreground">{d.name}: {d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Avg Deal Score Trend
            </CardTitle>
            <p className="text-xs text-muted-foreground">3=Green, 2=Yellow, 1=Red</p>
          </CardHeader>
          <CardContent>
            {trendData.length === 0 ? (
              <EmptyState icon={TrendingUp} label="No trend data yet" />
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis domain={[1, 3]} ticks={[1, 2, 3]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Green Deals"
          value={dist.green}
          subtitle="Good to go"
          icon={CheckCircle}
          color="success"
        />
        <StatCard
          title="Yellow Deals"
          value={dist.yellow}
          subtitle="Need more info"
          icon={AlertTriangle}
          color="warning"
        />
        <StatCard
          title="Red Deals"
          value={dist.red}
          subtitle="Red flags detected"
          icon={AlertTriangle}
          color="danger"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Most Common Fee Types
            </CardTitle>
            <p className="text-xs text-muted-foreground">Fee names extracted from flagged submissions</p>
          </CardHeader>
          <CardContent>
            {(data?.topFeeTypes ?? []).length === 0 ? (
              <EmptyState icon={BarChart3} label="No fee type data yet" />
            ) : (
              <div className="space-y-2">
                {(data?.topFeeTypes ?? []).map((f) => (
                  <div
                    key={f.feeName}
                    className="flex items-center justify-between text-sm"
                    data-testid={`fee-row-${f.feeName}`}
                  >
                    <span className="capitalize truncate max-w-[200px]">{f.feeName}</span>
                    <Badge variant="secondary">{f.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Dealer Tactic Flags
            </CardTitle>
            <p className="text-xs text-muted-foreground">Most commonly flagged dealer tactics in submissions</p>
          </CardHeader>
          <CardContent>
            {(data?.topTacticFlags ?? []).length === 0 ? (
              <EmptyState icon={AlertTriangle} label="No tactic flag data yet" />
            ) : (
              <div className="space-y-2">
                {(data?.topTacticFlags ?? []).map((t) => (
                  <div
                    key={t.tactic}
                    className="flex items-center justify-between text-sm"
                    data-testid={`tactic-row-${t.tactic}`}
                  >
                    <span>{t.tactic}</span>
                    <Badge variant={t.count > 5 ? "destructive" : "secondary"}>{t.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// Geographic Panel
// ============================================================================
interface GeoState {
  state: string;
  submissionCount: number;
  paymentCount: number;
  paymentRate: number;
  avgScore: number;
}

type GeoSortKey = "submissionCount" | "paymentRate" | "avgScore";

function GeographicPanel({ adminKey, range }: { adminKey: string; range: DateRange }) {
  const [sortKey, setSortKey] = useState<GeoSortKey>("submissionCount");

  const { data, isLoading } = useQuery<{ states: GeoState[] }>({
    queryKey: ["/api/admin/bi/geographic", adminKey, range],
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/bi/geographic?key=${encodeURIComponent(adminKey)}&range=${range}`
      );
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 300000,
  });

  if (isLoading) return <div className="h-64 animate-pulse bg-muted rounded-lg" />;

  const states = (data?.states ?? []).slice().sort((a, b) => b[sortKey] - a[sortKey]);

  const SortBtn = ({ k, label }: { k: GeoSortKey; label: string }) => (
    <button
      onClick={() => setSortKey(k)}
      data-testid={`sort-geo-${k}`}
      className={`text-xs px-2 py-1 rounded ${
        sortKey === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Geographic Breakdown
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              State-level submission and conversion data
            </p>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-1">Sort:</span>
            <SortBtn k="submissionCount" label="Volume" />
            <SortBtn k="paymentRate" label="Pay Rate" />
            <SortBtn k="avgScore" label="Avg Score" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {states.length === 0 ? (
          <EmptyState icon={MapPin} label="No geographic data yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left py-2 pr-4 font-medium">State</th>
                  <th className="text-right py-2 px-2 font-medium">Submissions</th>
                  <th className="text-right py-2 px-2 font-medium">Payments</th>
                  <th className="text-right py-2 px-2 font-medium">Pay Rate</th>
                  <th className="text-right py-2 pl-2 font-medium">Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {states.map((s) => (
                  <tr
                    key={s.state}
                    className="border-b border-muted/50 hover:bg-muted/30 transition-colors"
                    data-testid={`geo-row-${s.state}`}
                  >
                    <td className="py-2 pr-4 font-semibold">{s.state}</td>
                    <td className="text-right py-2 px-2">{s.submissionCount}</td>
                    <td className="text-right py-2 px-2">{s.paymentCount}</td>
                    <td className="text-right py-2 px-2">
                      <Badge
                        variant={s.paymentRate > 20 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {s.paymentRate.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="text-right py-2 pl-2">
                      <span
                        className={
                          s.avgScore >= 2.5
                            ? "text-green-600 dark:text-green-400"
                            : s.avgScore >= 1.5
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                        }
                      >
                        {s.avgScore > 0 ? s.avgScore.toFixed(1) : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Acquisition & Referrer Panel
// ============================================================================
interface AcqSource {
  source: string;
  views: number;
  sessions: number;
  submissions: number;
  submissionRate: number;
  payments: number;
  paymentRate: number;
}

function AcquisitionPanel({ adminKey, range }: { adminKey: string; range: DateRange }) {
  const { data, isLoading } = useQuery<{ sources: AcqSource[] }>({
    queryKey: ["/api/admin/bi/acquisition", adminKey, range],
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/bi/acquisition?key=${encodeURIComponent(adminKey)}&range=${range}`
      );
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 300000,
  });

  if (isLoading) return <div className="h-64 animate-pulse bg-muted rounded-lg" />;

  const sources = (data?.sources ?? []).slice(0, 15);
  const chartData = sources.slice(0, 8).map((s) => ({
    source: s.source.length > 20 ? s.source.slice(0, 20) + "…" : s.source,
    views: s.views,
    submissions: s.submissions,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Traffic Sources
          </CardTitle>
          <p className="text-xs text-muted-foreground">Page views, sessions, submissions, and payments by referrer domain</p>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <EmptyState icon={Globe} label="No referrer data yet" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis
                    type="category"
                    dataKey="source"
                    width={120}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend />
                  <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Views" />
                  <Bar dataKey="submissions" fill="#22c55e" radius={[0, 4, 4, 0]} name="Submissions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conversion by Source</CardTitle>
          <p className="text-xs text-muted-foreground">Sub rate = submissions ÷ sessions. Pay rate = payments ÷ submissions.</p>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <EmptyState icon={Globe} label="No data yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left py-2 pr-4 font-medium">Source</th>
                    <th className="text-right py-2 px-2 font-medium">Views</th>
                    <th className="text-right py-2 px-2 font-medium">Sessions</th>
                    <th className="text-right py-2 px-2 font-medium">Sub Rate</th>
                    <th className="text-right py-2 px-2 font-medium">Payments</th>
                    <th className="text-right py-2 pl-2 font-medium">Pay Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((s) => (
                    <tr
                      key={s.source}
                      className="border-b border-muted/50 hover:bg-muted/30"
                      data-testid={`acq-row-${s.source}`}
                    >
                      <td className="py-2 pr-4 truncate max-w-[180px] font-mono text-xs">{s.source}</td>
                      <td className="text-right py-2 px-2">{s.views}</td>
                      <td className="text-right py-2 px-2">{s.sessions}</td>
                      <td className="text-right py-2 px-2">
                        <Badge variant="secondary" className="text-xs">
                          {s.submissionRate.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="text-right py-2 px-2">{s.payments}</td>
                      <td className="text-right py-2 pl-2">
                        <Badge
                          variant={s.paymentRate > 10 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {s.paymentRate.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Revenue Health Panel
// ============================================================================
interface RevenueHealth {
  totalRevenue: number;
  revenueThisWeek: number;
  revenueLastWeek: number;
  avgRevenuePerPayer: number;
  estimatedMonthlyRunRate: number;
  paymentConversionRate: number;
  revenueByDay: Array<{ date: string; revenue: number }>;
  paymentConversionByDay: Array<{ date: string; rate: number }>;
}

function RevenuePanel({ adminKey, range }: { adminKey: string; range: DateRange }) {
  const { data, isLoading } = useQuery<RevenueHealth>({
    queryKey: ["/api/admin/bi/revenue", adminKey, range],
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/bi/revenue?key=${encodeURIComponent(adminKey)}&range=${range}`
      );
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 300000,
  });

  if (isLoading) return <div className="h-64 animate-pulse bg-muted rounded-lg" />;

  const revenueChartData = (data?.revenueByDay ?? []).map((d) => ({
    date: d.date.slice(5),
    revenue: d.revenue,
  }));

  const conversionChartData = (data?.paymentConversionByDay ?? []).map((d) => ({
    date: d.date.slice(5),
    rate: parseFloat(d.rate.toFixed(1)),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`$${(data?.totalRevenue ?? 0).toLocaleString()}`}
          subtitle="In range"
          icon={DollarSign}
          color="success"
        />
        <StatCard
          title="This Week"
          value={`$${(data?.revenueThisWeek ?? 0).toLocaleString()}`}
          subtitle="vs last week"
          icon={TrendingUp}
          color="success"
          trend={{ current: data?.revenueThisWeek ?? 0, previous: data?.revenueLastWeek ?? 0 }}
        />
        <StatCard
          title="Avg Revenue / Payer"
          value={`$${(data?.avgRevenuePerPayer ?? 0).toFixed(0)}`}
          subtitle="Average order value"
          icon={Zap}
        />
        <StatCard
          title="Est. Monthly Run Rate"
          value={`$${(data?.estimatedMonthlyRunRate ?? 0).toLocaleString()}`}
          subtitle="Based on last 30 days"
          icon={BarChart3}
          color="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              30-Day Rolling Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {revenueChartData.length === 0 ? (
              <EmptyState icon={DollarSign} label="No revenue data yet" />
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`$${v}`, "Revenue"]} />
                    <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="url(#revGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Payment Conversion Rate Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {conversionChartData.length === 0 ? (
              <EmptyState icon={Target} label="No conversion data yet" />
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={conversionChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, "Conversion"]} />
                    <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// Fallout / Abandonment Panel
// ============================================================================
interface Fallout {
  checkoutsWithoutPayment: number;
  avgMinutesSubmissionToCheckout: number | null;
  dropoffByHour: Array<{ hour: number; checkouts: number; payments: number; dropoff: number }>;
}

function FalloutPanel({ adminKey, range }: { adminKey: string; range: DateRange }) {
  const { data, isLoading } = useQuery<Fallout>({
    queryKey: ["/api/admin/bi/fallout", adminKey, range],
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/bi/fallout?key=${encodeURIComponent(adminKey)}&range=${range}`
      );
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 300000,
  });

  if (isLoading) return <div className="h-64 animate-pulse bg-muted rounded-lg" />;

  const avgMins = data?.avgMinutesSubmissionToCheckout;
  const avgMinsDisplay =
    avgMins === null || avgMins === undefined
      ? "—"
      : avgMins < 60
      ? `${avgMins.toFixed(1)} min`
      : `${(avgMins / 60).toFixed(1)} hr`;

  const hourlyData = (data?.dropoffByHour ?? []).filter((h) => h.checkouts > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Checkouts Without Payment"
          value={data?.checkoutsWithoutPayment ?? 0}
          subtitle="Reached checkout but didn't pay"
          icon={AlertTriangle}
          color={(data?.checkoutsWithoutPayment ?? 0) > 0 ? "warning" : "default"}
        />
        <StatCard
          title="Avg Time: Submission → Checkout"
          value={avgMinsDisplay}
          subtitle="Time between submitting and checkout"
          icon={Clock}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Drop-off by Hour of Day
          </CardTitle>
          <p className="text-xs text-muted-foreground">Checkouts vs. payments by hour — shows when users abandon</p>
        </CardHeader>
        <CardContent>
          {hourlyData.length === 0 ? (
            <EmptyState icon={Clock} label="No checkout data yet" />
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.dropoffByHour ?? []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="hour"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    tickFormatter={(h) => `${h}h`}
                  />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    labelFormatter={(l) => `Hour: ${l}:00`}
                  />
                  <Legend />
                  <Bar dataKey="checkouts" fill="hsl(var(--primary))" name="Checkouts" />
                  <Bar dataKey="payments" fill="#22c55e" name="Payments" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Main Page
// ============================================================================
const PANELS = [
  { id: "funnel", label: "Funnel" },
  { id: "attribution", label: "SEO Attribution" },
  { id: "behavior", label: "User Behavior" },
  { id: "deal-outcome", label: "Deal Outcomes" },
  { id: "geographic", label: "Geographic" },
  { id: "acquisition", label: "Acquisition" },
  { id: "revenue", label: "Revenue Health" },
  { id: "fallout", label: "Fallout" },
];

export default function AdminBusiness() {
  const [range, setRange] = useState<DateRange>("all");
  const [activePanel, setActivePanel] = useState("funnel");
  const urlParams = new URLSearchParams(window.location.search);
  const adminKey = urlParams.get("key") || "odigos-admin-2024";

  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  useEffect(() => {
    const interval = setInterval(() => setLastUpdated(new Date().toLocaleTimeString()), 300000);
    return () => clearInterval(interval);
  }, []);

  const authQuery = useQuery({
    queryKey: ["/api/admin/bi/__auth__", adminKey],
    queryFn: async () => {
      const res = await fetch(`/api/admin/bi/funnel?key=${encodeURIComponent(adminKey)}&range=all`);
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    retry: 0,
    staleTime: 300000,
    refetchInterval: false,
  });

  const authErrorMsg = authQuery.isError ? ((authQuery.error as Error)?.message ?? "") : "";
  const authIs503 = authErrorMsg.startsWith("503");
  const authIs401 = authErrorMsg.startsWith("401");

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <Link href={`/admin/metrics?key=${encodeURIComponent(adminKey)}`}>
                <Button variant="ghost" size="icon" data-testid="link-back-metrics">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">Business Intelligence</h1>
                  <LivePulse />
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Last updated: {lastUpdated} · Auto-refreshes every 5 min
                </p>
              </div>
            </div>
            <DateRangeSelector value={range} onChange={setRange} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-3">
          <div className="flex gap-1 overflow-x-auto">
            {PANELS.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePanel(p.id)}
                data-testid={`panel-nav-${p.id}`}
                className={`whitespace-nowrap px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activePanel === p.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {authQuery.isError && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="flex items-start gap-3 p-4 rounded-lg border border-red-400 bg-red-50 dark:bg-red-950/20" data-testid="banner-admin-error">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 dark:text-red-400 font-semibold text-sm">
                {authIs503 ? "Admin key not configured on server" : authIs401 ? "Invalid admin key" : "Failed to load dashboard data"}
              </p>
              <p className="text-red-600/80 dark:text-red-400/80 text-xs mt-0.5">
                {authIs503
                  ? "The ADMIN_KEY environment variable is not set. Set it in the Replit secrets panel and restart the server."
                  : authIs401
                  ? "The key in the URL does not match the configured ADMIN_KEY. Add ?key=<your-key> to the URL."
                  : "An unexpected error occurred. Check the server logs for details."}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        {activePanel === "funnel" && <FunnelPanel adminKey={adminKey} range={range} />}
        {activePanel === "attribution" && <AttributionPanel adminKey={adminKey} range={range} />}
        {activePanel === "behavior" && <BehaviorPanel adminKey={adminKey} range={range} />}
        {activePanel === "deal-outcome" && <DealOutcomePanel adminKey={adminKey} range={range} />}
        {activePanel === "geographic" && <GeographicPanel adminKey={adminKey} range={range} />}
        {activePanel === "acquisition" && <AcquisitionPanel adminKey={adminKey} range={range} />}
        {activePanel === "revenue" && <RevenuePanel adminKey={adminKey} range={range} />}
        {activePanel === "fallout" && <FalloutPanel adminKey={adminKey} range={range} />}
      </div>
    </div>
  );
}
