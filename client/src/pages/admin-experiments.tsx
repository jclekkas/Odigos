import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, FlaskConical, Trophy, Users, TrendingUp, RefreshCw } from "lucide-react";

interface ExperimentVariantStats {
  variant: string;
  assignments: number;
  conversions: number;
  conversionRate: number;
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
    value: "Value — \"Unlock Full Deal Review — $49 (Less Than Most Doc Fees)\"",
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
      Winning
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
            Assignments
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

function ExperimentCard({ exp }: { exp: ExperimentStats }) {
  const total = exp.variants.reduce((sum, v) => sum + v.assignments, 0);

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

          {exp.winner ? (
            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
              Winner: {exp.winner}
            </Badge>
          ) : total > 0 ? (
            <Badge variant="outline" className="text-muted-foreground">
              No winner yet
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              No data
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {exp.variants.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No variant data recorded yet.</p>
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

        <p className="text-xs text-muted-foreground pt-1">
          Total sample: {total.toLocaleString()} assignment{total !== 1 ? "s" : ""}
        </p>
      </CardContent>
    </Card>
  );
}

export default function AdminExperiments() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery<ExperimentStats[]>({
    queryKey: ["/api/experiments"],
    staleTime: 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-background">
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
              <p className="text-sm text-muted-foreground">Per-experiment conversion rates by variant</p>
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
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">Failed to load experiment data. Please try again.</p>
            </CardContent>
          </Card>
        ) : !data || data.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center space-y-3">
              <FlaskConical className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-medium">No experiment data yet</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Experiments will appear here once users are assigned to variants. Visit the landing page to trigger assignment.
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
            <li>• <strong>Assignments</strong>: users deterministically bucketed into this variant (stable across reloads)</li>
            <li>• <strong>Conversions</strong>: paid conversions attributed to users in this variant</li>
            <li>• <strong>Conv. Rate</strong>: conversions / assignments. Lower sample sizes are less reliable.</li>
            <li>• <strong>Winner</strong>: variant with the higher conversion rate (no statistical significance test applied)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
