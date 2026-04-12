import { useState } from "react";
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
  LayoutDashboard,
} from "lucide-react";

const DASHBOARDS = [
  {
    href: "/admin/prod",
    label: "Command Center",
    icon: LayoutDashboard,
    description: "Plain-English overview of business health, revenue, and issues.",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-500/10",
  },
  {
    href: "/admin/metrics",
    label: "Metrics",
    icon: BarChart3,
    description: "Submissions, revenue, conversion funnel, and live activity feed.",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    href: "/admin/business",
    label: "Business",
    icon: Briefcase,
    description: "BI funnel, SEO content attribution, and user behavior panels.",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    href: "/admin/technical",
    label: "Technical",
    icon: Server,
    description: "API performance, error rates, AI usage costs, and system health.",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    href: "/admin/seo",
    label: "SEO",
    icon: Search,
    description: "Google Search Console indexing status in plain English.",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10",
  },
  {
    href: "/admin/experiments",
    label: "Experiments",
    icon: FlaskConical,
    description: "A/B test variant performance and statistical significance.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    href: "/admin/content",
    label: "Content",
    icon: FileText,
    description: "Per-page sessions, analyze starts, conversions, and conversion rate.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    description: "Session lookup, event history, analysis and payment records.",
    color: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-500/10",
  },
];

export default function AdminHub() {
  const [adminKey, setAdminKey] = useAdminKey();
  const [keyInput, setKeyInput] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-admin-hub">Admin Hub</h1>
          <p className="text-muted-foreground mt-1">Select a dashboard to get started.</p>
        </div>

        {!adminKey && (
          <Card className="border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20" data-testid="card-key-entry">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-amber-800 dark:text-amber-400">
                <KeyRound className="h-4 w-4" />
                Enter Admin Key
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                Most dashboards require an admin key. Enter it once here and it will be saved for your session.
              </p>
              <div className="flex gap-2 max-w-sm">
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
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="grid-dashboards">
          {DASHBOARDS.map(({ href, label, icon: Icon, description, color, bg }) => (
            <Link
              key={href}
              href={href}
              className="block group"
              data-testid={`card-dashboard-${label.toLowerCase()}`}
            >
              <Card className="h-full transition-all duration-150 hover:shadow-md hover:border-primary/30 cursor-pointer">
                <CardContent className="pt-6">
                  <div className={`inline-flex p-3 rounded-xl ${bg} mb-4`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                  </div>
                  <h2 className="text-base font-semibold mb-1 group-hover:text-primary transition-colors">
                    {label}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
