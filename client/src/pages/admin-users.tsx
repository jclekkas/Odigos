import { useState, useEffect } from "react";
import { setRobotsMeta } from "@/lib/seo";
import { AdminNav } from "@/components/admin-nav";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Users, Search, User, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { useAdminKey } from "@/hooks/use-admin-key";

interface BIAnalysis {
  timestamp: string;
  verdict: string;
  dealerId?: string;
  vehicleYear?: number;
  vehicleMake?: string;
}

interface UserSession {
  sessionId: string;
  firstSeen: string;
  lastSeen: string;
  eventCount: number;
  eventTypes: string[];
  hasPaid: boolean;
  verdicts: string[];
  stripeSessionIds: string[];
  analysisHistory: BIAnalysis[];
  paymentHistory: Array<{ timestamp: string; stripeSessionId: string }>;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  payment_completed: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
  submission: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  checkout_started: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  page_view: "bg-muted text-muted-foreground",
  cta_click: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
  form_focus: "bg-muted text-muted-foreground",
  rate_limit_breach: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
};

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function SessionCard({ session }: { session: UserSession }) {
  const [expanded, setExpanded] = useState(false);

  const displayTypes = session.eventTypes.filter(t => t !== "page_view" && t !== "form_focus");

  return (
    <div
      className={`rounded-lg border p-4 space-y-3 transition-colors ${
        session.hasPaid
          ? "border-green-500/30 bg-green-500/5"
          : "border-border bg-card hover:bg-muted/30"
      }`}
      data-testid={`session-card-${session.sessionId.slice(0, 8)}`}
    >
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-start gap-2">
          <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-mono text-xs font-medium break-all">{session.sessionId}</p>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                First: {formatRelativeTime(session.firstSeen)}
              </span>
              <span className="text-xs text-muted-foreground">
                Last: {formatRelativeTime(session.lastSeen)}
              </span>
              <span className="text-xs text-muted-foreground">
                {session.eventCount} events
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {session.hasPaid && (
            <Badge className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30 gap-1">
              <CheckCircle className="h-3 w-3" />
              Paid
            </Badge>
          )}
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            {expanded ? "less" : "details"}
          </button>
        </div>
      </div>

      {displayTypes.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {displayTypes.map(t => (
            <span
              key={t}
              className={`text-xs px-1.5 py-0.5 rounded border font-mono ${
                EVENT_TYPE_COLORS[t] ?? "bg-muted text-muted-foreground"
              }`}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {expanded && (
        <div className="pt-2 border-t border-muted/50 space-y-4">
          {session.analysisHistory.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-2 uppercase tracking-wide">Analysis History ({session.analysisHistory.length})</p>
              <div className="space-y-1.5">
                {session.analysisHistory.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs p-2 rounded-md bg-muted/50">
                    <Badge
                      variant="outline"
                      className={`text-xs font-mono shrink-0 ${
                        a.verdict === "great_deal" || a.verdict === "GREEN" ? "border-green-500/50 text-green-700 dark:text-green-400" :
                        a.verdict === "fair_deal" || a.verdict === "YELLOW" ? "border-yellow-500/50 text-yellow-700 dark:text-yellow-400" :
                        a.verdict === "overpriced" || a.verdict === "RED" ? "border-red-500/50 text-red-700 dark:text-red-400" :
                        "text-muted-foreground"
                      }`}
                    >
                      {a.verdict}
                    </Badge>
                    <span className="text-muted-foreground">
                      {new Date(a.timestamp).toLocaleString()}
                      {a.vehicleYear && a.vehicleMake && ` · ${a.vehicleYear} ${a.vehicleMake}`}
                      {a.dealerId && ` · Dealer: ${a.dealerId}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {session.paymentHistory.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-2 uppercase tracking-wide">Payment History ({session.paymentHistory.length})</p>
              <div className="space-y-1">
                {session.paymentHistory.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
                    <span className="text-muted-foreground">{new Date(p.timestamp).toLocaleString()}</span>
                    <span className="font-mono text-muted-foreground break-all">{p.stripeSessionId}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wide">All Event Types</p>
            <div className="flex gap-1 flex-wrap">
              {session.eventTypes.map(t => (
                <span
                  key={t}
                  className={`text-xs px-1.5 py-0.5 rounded border font-mono ${
                    EVENT_TYPE_COLORS[t] ?? "bg-muted text-muted-foreground"
                  }`}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div><span className="font-medium">First seen:</span> {new Date(session.firstSeen).toLocaleString()}</div>
            <div><span className="font-medium">Last seen:</span> {new Date(session.lastSeen).toLocaleString()}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminUsers() {
  const [adminKey, setAdminKey, clearKey] = useAdminKey();
  const [keyInput, setKeyInput] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    return setRobotsMeta("noindex, nofollow");
  }, []);
  const [query, setQuery] = useState("");

  const { data, isLoading, isError, error } = useQuery<{ sessions: UserSession[] }>({
    queryKey: ["/api/admin/users/search", adminKey, query],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "50" });
      if (query) params.set("q", query);
      const res = await fetch(`/api/admin/users/search?${params}`, {
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    refetchInterval: q => {
      const errMsg = (q.state.error as Error)?.message ?? "";
      return errMsg.startsWith("401") ? false : 120000;
    },
    enabled: !!adminKey,
  });

  const sessions = data?.sessions ?? [];
  const paidSessions = sessions.filter(s => s.hasPaid);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(searchInput.trim());
  };

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
      {adminKey && (<>
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-12 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Link href="/admin/metrics">
                <Button variant="ghost" size="icon" data-testid="link-back-metrics">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Users className="h-6 w-6 text-muted-foreground" />
                  User Lookup
                </h1>
                <p className="text-sm text-muted-foreground">Search sessions by session ID</p>
              </div>
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

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {isError && (
          <div className="flex items-start gap-3 p-4 rounded-lg border border-red-400 bg-red-50 dark:bg-red-950/20" data-testid="error-user-lookup">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 dark:text-red-400 text-sm font-medium">
                Failed to load session data {(error as Error)?.message ? `(${(error as Error).message})` : ""}
              </p>
              <p className="text-red-600 dark:text-red-500 text-xs mt-0.5">Check your admin key or try again.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              className="w-full border rounded-md pl-9 pr-4 py-2 text-sm bg-background"
              placeholder="Search by session ID or Stripe customer ID (cus_...)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              data-testid="input-session-search"
            />
          </div>
          <Button type="submit" data-testid="button-search">
            Search
          </Button>
          {query && (
            <Button
              type="button"
              variant="outline"
              onClick={() => { setSearchInput(""); setQuery(""); }}
              data-testid="button-clear-search"
            >
              Clear
            </Button>
          )}
        </form>

        {!query && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Sessions Shown</p>
                <p className="text-3xl font-bold" data-testid="stat-session-count">{sessions.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Most recent 50</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Paying Sessions</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400" data-testid="stat-paid-sessions">{paidSessions.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {sessions.length > 0 ? ((paidSessions.length / sessions.length) * 100).toFixed(1) : 0}% of shown
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Avg Events / Session</p>
                <p className="text-3xl font-bold" data-testid="stat-avg-events">
                  {sessions.length > 0
                    ? (sessions.reduce((s, sess) => s + sess.eventCount, 0) / sessions.length).toFixed(1)
                    : "—"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {query ? `Results for "${query}"` : "Recent Sessions"} ({sessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                <Search className="h-8 w-8 opacity-40" />
                <p className="text-sm">{query ? `No sessions matching "${query}"` : "No session data yet"}</p>
              </div>
            ) : (
              <div className="space-y-3" data-testid="sessions-list">
                {sessions.map(session => (
                  <SessionCard key={session.sessionId} session={session} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </>)}
    </div>
  );
}
