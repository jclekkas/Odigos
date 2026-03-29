import { useState } from "react";
import { AdminNav } from "@/components/admin-nav";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, FlaskConical, Trophy, Users, TrendingUp, RefreshCw, CheckCircle2, Clock, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

interface ExperimentVariantStats {
  variant: string;
  assignments: number;
  conversions: number;
  conversionRate: number;
  pValue: number | null;
  isSignificant: boolean;
}

interface ExperimentStats {
  experimentId: string;
  variants: ExperimentVariantStats[];
  winner: string | null;
}

const EXPERIMENT_LABELS: Record<string, string> = {
  hero_headline: "Hero Headline Copy",
  unlock_cta: "Unlock CTA Button Text / Price Framing",
};

const VARIANT_LABELS: Record<string, Record<string, string>> = {
  hero_headline: {
    control: "Control — \"Spot dealer pricing tricks before you agree to anything.\"",
    urgency: "Urgency — \"Don't sign until you know what the dealer isn't telling you.\"",
  },
  unlock_cta: {
    control: "Control — \"Unlock Full Deal Review — $49 (one-time)\"",
    value: "Value — \"Unlock Full Deal Review — $49 · Less Than a Doc Fee\"",
  },
};

function variantLabel(experimentId: string, variant: string): string {
  return VARIANT_LABELS[experimentId]?.[variant] ?? variant;
}

function experimentLabel(experimentId: string): string {
  return EXPERIMENT_LABELS[experimentId] ?? experimentId;
}

function WinnerBadge({ isWinner }: { isWinner: boolean }) {
  if (!isWinner) return null;
  return (
    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1">
      <Trophy className="w-3 h-3" />
      Winner ✓
    </Badge>
  );
}

function VerdictBadge({ pValue, isSignificant, hasWinner, total }: { pValue: number | null; isSignificant: boolean; hasWinner: boolean; total: number }) {
  if (total === 0) {
    return (
      <Badge variant="outline" className="text-muted-foreground gap-1 text-xs">
        <Clock className="w-3 h-3" />
        Not enough data
      </Badge>
    );
  }
  if (hasWinner && isSignificant) {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 text-xs">
        <CheckCircle2 className="w-3 h-3" />
        Winner ✓
      </Badge>
    );
  }
  if (total < 100) {
    return (
      <Badge variant="outline" className="text-muted-foreground gap-1 text-xs">
        <Clock className="w-3 h-3" />
        Too early to tell
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-300 gap-1 text-xs">
      <Clock className="w-3 h-3" />
      No winner yet
    </Badge>
  );
}

function VariantRow({ variant, isWinner, total }: { variant: ExperimentVariantStats; isWinner: boolean; total: number }) {
  const pct = total > 0 ? (variant.assignments / total) * 100 : 0;

  return (
    <div
      className={`rounded-lg border p-4 space-y-3 ${isWinner ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-muted/10"}`}
      data-testid={`variant-row-${variant.variant}`}
    >
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <p className="text-sm font-medium text-foreground leading-snug flex-1 min-w-0" data-testid={`variant-label-${variant.variant}`}>
          {variant.variant}
        </p>
        <WinnerBadge isWinner={isWinner} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5 flex items-center gap-1">
            <Users className="w-3 h-3" />
            People Shown
          </p>
          <p className="text-lg font-semibold tabular-nums" data-testid={`variant-assignments-${variant.variant}`}>
            {variant.assignments.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">{pct.toFixed(1)}% of total</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Conversions
          </p>
          <p className="text-lg font-semibold tabular-nums" data-testid={`variant-conversions-${variant.variant}`}>
            {variant.conversions.toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Conv. Rate</p>
          <p
            className={`text-lg font-semibold tabular-nums ${isWinner ? "text-emerald-700 dark:text-emerald-400" : ""}`}
            data-testid={`variant-rate-${variant.variant}`}
          >
            {variant.conversionRate.toFixed(2)}%
          </p>
        </div>
      </div>

      {variant.assignments > 0 && (
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isWinner ? "bg-emerald-500" : "bg-muted-foreground/40"}`}
            style={{ width: `${Math.min(variant.conversionRate * 10, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function StatDetails({ pValue, isSignificant, lift }: { pValue: number | null; isSignificant: boolean; lift: number }) {
  if (pValue === null) return null;
  return (
    <p className="text-xs text-muted-foreground">
      p-value: {pValue.toFixed(3)} · lift: {lift > 0 ? "+" : ""}{lift.toFixed(1)}% ·{" "}
      {isSignificant ? "statistically significant (α=0.05)" : "not yet significant"}
    </p>
  );
}

function ExperimentCard({ exp }: { exp: ExperimentStats }) {
  const [showStats, setShowStats] = useState(false);
  const total = exp.variants.reduce((sum, v) => sum + v.assignments, 0);

  const control = exp.variants.find(v => v.variant === "control") ?? exp.variants[0];
  const treatment = exp.variants.find(v => v.variant !== "control" && v !== control);
  const lift = control && treatment && control.assignments > 0
    ? ((treatment.conversionRate - control.conversionRate) / (control.conversionRate || 1)) * 100
    : 0;

  const hasWinner = !!exp.winner;
  const isSignificant = treatment?.isSignificant ?? false;

  return (
    <Card data-testid={`experiment-card-${exp.experimentId}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-muted-foreground" />
              {experimentLabel(exp.experimentId)}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1 font-mono">{exp.experimentId}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <VerdictBadge
              pValue={treatment?.pValue ?? null}
              isSignificant={isSignificant}
              hasWinner={hasWinner}
              total={total}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {exp.variants.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No variant data available.</p>
        ) : (
          exp.variants.map((v) => (
            <VariantRow
              key={v.variant}
              variant={v}
              isWinner={exp.winner === v.variant}
              total={total}
            />
          ))
        )}

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-muted-foreground">
            Total people shown: {total.toLocaleString()}
          </p>
          {treatment?.pValue !== null && treatment !== undefined && (
            <button
              onClick={() => setShowStats(s => !s)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              data-testid={`button-show-stats-${exp.experimentId}`}
            >
              {showStats ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showStats ? "Hide" : "Show"} statistical details
            </button>
          )}
        </div>

        {showStats && treatment !== undefined && (
          <div className="border rounded-md p-3 bg-muted/20">
            <p className="text-xs font-medium text-muted-foreground mb-1">Statistical Details</p>
            <StatDetails
              pValue={treatment.pValue}
              isSignificant={treatment.isSignificant}
              lift={lift}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminExperiments() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<ExperimentStats[]>({
    queryKey: ["/api/experiments"],
    queryFn: async () => {
      const res = await fetch("/api/experiments");
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    staleTime: 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/admin/metrics">
              <Button variant="outline" size="sm" className="gap-2" data-testid="button-back-admin">
                <ArrowLeft className="w-4 h-4" />
                Admin
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-muted-foreground" />
                A/B Experiments
              </h1>
              <p className="text-sm text-muted-foreground">Which version is performing better?</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
            data-testid="button-refresh-experiments"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-muted rounded w-48" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <Card className="border-red-400 bg-red-50 dark:bg-red-950/20">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3" data-testid="error-experiments">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                    Failed to load experiments. Check your connection or admin key.{(error as Error)?.message ? ` (HTTP ${(error as Error).message})` : ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : !data || data.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center space-y-3">
              <FlaskConical className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-medium">No experiment data yet</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Experiments will appear here once users have been bucketed into variants and conversions have been tracked.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {data.map((exp) => (
              <ExperimentCard key={exp.experimentId} exp={exp} />
            ))}
          </div>
        )}

        <div className="border border-border/40 rounded-lg p-4 bg-muted/10 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">How to read this</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• <strong>Winner ✓</strong>: one version is clearly converting better with enough data to be confident</li>
            <li>• <strong>No winner yet</strong>: there's a difference, but we need more data to be sure</li>
            <li>• <strong>Too early to tell</strong>: fewer than 100 people have been shown this test</li>
            <li>• <strong>Not enough data</strong>: no one has been assigned to this experiment yet</li>
            <li>• Conv. Rate = people who paid ÷ people shown the variant. Click "Show statistical details" for p-values.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
