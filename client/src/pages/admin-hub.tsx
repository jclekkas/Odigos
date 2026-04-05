import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAdminKey } from "@/hooks/use-admin-key";
import { AdminNav } from "@/components/admin-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Briefcase,
  Server,
  Search,
  FlaskConical,
  FileText,
  Users,
  KeyRound,
  ArrowRight,
  Clock,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

const DASHBOARDS = [
  {
    href: "/admin/metrics",
    label: "Metrics",
    icon: BarChart3,
    description:
      "Track submissions, revenue, conversion funnel, and live activity feed in real time.",
    accent: "border-l-blue-500",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    hoverBorder: "hover:border-blue-300 dark:hover:border-blue-700",
  },
  {
    href: "/admin/business",
    label: "Business Intelligence",
    icon: Briefcase,
    description:
      "Explore the BI funnel, SEO content attribution, and user behavior panels for growth insights.",
    accent: "border-l-violet-500",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10",
    hoverBorder: "hover:border-violet-300 dark:hover:border-violet-700",
  },
  {
    href: "/admin/technical",
    label: "Technical Health",
    icon: Server,
    description:
      "Monitor API performance, error rates, AI usage costs, and overall system health at a glance.",
    accent: "border-l-orange-500",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10",
    hoverBorder: "hover:border-orange-300 dark:hover:border-orange-700",
  },
  {
    href: "/admin/seo",
    label: "SEO Overview",
    icon: Search,
    description:
      "Google Search Console indexing status, crawl insights, and ranking trends in plain English.",
    accent: "border-l-green-500",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10",
    hoverBorder: "hover:border-green-300 dark:hover:border-green-700",
  },
  {
    href: "/admin/experiments",
    label: "Experiments",
    icon: FlaskConical,
    description:
      "Review A/B test variant performance, statistical significance, and rollout recommendations.",
    accent: "border-l-emerald-500",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-700",
  },
  {
    href: "/admin/content",
    label: "Content Performance",
    icon: FileText,
    description:
      "Per-page sessions, analysis starts, conversions, and conversion rate breakdown by content.",
    accent: "border-l-amber-500",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    hoverBorder: "hover:border-amber-300 dark:hover:border-amber-700",
  },
  {
    href: "/admin/users",
    label: "User Management",
    icon: Users,
    description:
      "Session lookup, event history, analysis records, and payment details for any user.",
    accent: "border-l-pink-500",
    color: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-500/10",
    hoverBorder: "hover:border-pink-300 dark:hover:border-pink-700",
  },
];

function useCurrentTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function formatGreeting(date: Date): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminHub() {
  const [adminKey, setAdminKey] = useAdminKey();
  const [keyInput, setKeyInput] = useState("");
  const now = useCurrentTime();

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Welcome header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1
              className="text-3xl sm:text-4xl font-bold tracking-tight"
              data-testid="heading-admin-hub"
            >
              {formatGreeting(now)}.
            </h1>
            <p className="text-muted-foreground mt-2 text-base">
              {formatDate(now)}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {formatTime(now)}
            </span>
            {adminKey ? (
              <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400">
                <ShieldCheck className="h-4 w-4" />
                Authenticated
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <ShieldAlert className="h-4 w-4" />
                No key set
              </span>
            )}
          </div>
        </div>

        {/* Admin key entry */}
        {!adminKey && (
          <Card
            className="border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20"
            data-testid="card-key-entry"
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2.5 text-lg text-amber-800 dark:text-amber-400">
                <div className="inline-flex p-2 rounded-lg bg-amber-500/10">
                  <KeyRound className="h-5 w-5" />
                </div>
                Admin Authentication Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-4 leading-relaxed">
                Most dashboards require an admin key to load data. Enter your key
                below and it will be saved for this session.
              </p>
              <div className="flex gap-2 max-w-md">
                <input
                  type="password"
                  className="flex-1 border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-shadow"
                  placeholder="Paste your admin key..."
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && keyInput) setAdminKey(keyInput);
                  }}
                  data-testid="input-admin-key"
                  autoFocus
                />
                <Button
                  onClick={() => {
                    if (keyInput) setAdminKey(keyInput);
                  }}
                  disabled={!keyInput}
                  className="px-6"
                  data-testid="button-submit-admin-key"
                >
                  Authenticate
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section title */}
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Dashboards</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {DASHBOARDS.length} dashboards available. Pick one to dive in.
          </p>
        </div>

        {/* Dashboard grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          data-testid="grid-dashboards"
        >
          {DASHBOARDS.map(
            ({
              href,
              label,
              icon: Icon,
              description,
              accent,
              color,
              bg,
              hoverBorder,
            }) => (
              <Link
                key={href}
                href={href}
                className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
                data-testid={`card-dashboard-${label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <Card
                  className={`h-full border-l-4 ${accent} transition-all duration-200 ${hoverBorder} hover:shadow-lg hover:-translate-y-0.5 cursor-pointer`}
                >
                  <CardContent className="p-6 flex flex-col h-full">
                    {/* Icon + Title row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`inline-flex p-3 rounded-xl ${bg}`}>
                        <Icon className={`h-6 w-6 ${color}`} />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
                    </div>

                    {/* Label */}
                    <h3 className="text-base font-semibold mb-2 group-hover:text-primary transition-colors">
                      {label}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
}
