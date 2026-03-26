import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, FlaskConical, Trophy, Users, TrendingUp, RefreshCw, CheckCircle2, Clock } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";

function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const poly =
    t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const pdf = Math.exp((-z * z) / 2) / Math.sqrt(2 * Math.PI);
  const result = 1 - pdf * poly;
  return z >= 0 ? result : 1 - result;
}

function zTestTwoProportions(
  n1: number, x1: number,
  n2: number, x2: number
): { z: number; pValue: number; significant: boolean; lift: number } {
  if (n1 === 0 || n2 === 0) return { z: 0, pValue: 1, significant: false, lift: 0 };
  const p1 = x1 / n1;
  const p2 = x2 / n2;
  const pPool = (x1 + x2) / (n1 + n2);
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / n1 + 1 / n2));
  if (se === 0) return { z: 0, pValue: 1, significant: false, lift: 0 };
  const z = Math.abs(p1 - p2) / se;
  const pValue = 2 * (1 - normalCDF(z));
  const lift = p1 > 0 ? ((p2 - p1) / p1) * 100 : 0;
  return { z, pValue, significant: pValue < 0.05, lift };
}

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
  const { t } = useTranslation();
  if (!isWinner) return null;
  return (
    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1">
      <Trophy className="w-3 h-3" />
      {t("admin.winning")}
    </Badge>
  );
}

function VariantRow({ variant, isWinner, total }: { variant: ExperimentVariantStats; isWinner: boolean; total: number }) {
  const { t } = useTranslation();
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
            {t("admin.assignments")}
          </p>
          <p className="text-lg font-semibold tabular-nums" data-testid={`variant-assignments-${variant.variant}`}>
            {variant.assignments.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">{pct.toFixed(1)}% {t("admin.ofTotal")}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {t("admin.conversions")}
          </p>
          <p className="text-lg font-semibold tabular-nums" data-testid={`variant-conversions-${variant.variant}`}>
            {variant.conversions.toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">{t("admin.convRate")}</p>
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

function SignificanceBadge({ sig }: { sig: { z: number; pValue: number; significant: boolean; lift: number } }) {
  if (sig.pValue >= 1) return null;
  if (sig.significant) {
    return (
      <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1 text-xs">
        <CheckCircle2 className="w-3 h-3" />
        p={sig.pValue.toFixed(3)} · {sig.lift > 0 ? "+" : ""}{sig.lift.toFixed(1)}% lift
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground gap-1 text-xs">
      <Clock className="w-3 h-3" />
      Not significant (p={sig.pValue.toFixed(3)})
    </Badge>
  );
}

function ExperimentCard({ exp }: { exp: ExperimentStats }) {
  const { t } = useTranslation();
  const total = exp.variants.reduce((sum, v) => sum + v.assignments, 0);

  const control = exp.variants.find(v => v.variant === "control") ?? exp.variants[0];
  const treatment = exp.variants.find(v => v.variant !== "control" && v !== control);

  const significance =
    control && treatment
      ? zTestTwoProportions(
          control.assignments, control.conversions,
          treatment.assignments, treatment.conversions
        )
      : null;

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
            {significance && <SignificanceBadge sig={significance} />}
            {exp.winner ? (
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                {t("admin.winner_label", { variant: exp.winner })}
              </Badge>
            ) : total > 0 ? (
              <Badge variant="outline" className="text-muted-foreground">
                {t("admin.noWinnerYet")}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                {t("admin.noData")}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {exp.variants.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">{t("admin.noVariantData")}</p>
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
          {t("admin.totalSample")} {total.toLocaleString()} {t("admin.assignment_other")}
        </p>
      </CardContent>
    </Card>
  );
}

export default function AdminExperiments() {
  const { t } = useTranslation();
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
                {t("admin.admin_back")}
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-muted-foreground" />
                {t("admin.experimentsTitle")}
              </h1>
              <p className="text-sm text-muted-foreground">{t("admin.experimentsSubtitle")}</p>
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
            {t("admin.refresh")}
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
              <p className="text-sm text-destructive">{t("admin.failedToLoadExperiments")}</p>
            </CardContent>
          </Card>
        ) : !data || data.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center space-y-3">
              <FlaskConical className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-medium">{t("admin.noExperimentData")}</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {t("admin.noExperimentDataDesc")}
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
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.howToReadHeading")}</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• <Trans i18nKey="admin.howToReadAssignments"><strong>Assignments</strong>: users deterministically bucketed into this variant (stable across reloads)</Trans></li>
            <li>• <Trans i18nKey="admin.howToReadConversions"><strong>Conversions</strong>: paid conversions attributed to users in this variant</Trans></li>
            <li>• <Trans i18nKey="admin.howToReadRate"><strong>Conv. Rate</strong>: conversions / assignments. Lower sample sizes are less reliable.</Trans></li>
            <li>• <Trans i18nKey="admin.howToReadWinner"><strong>Winner</strong>: variant with the higher conversion rate. Statistical significance shown as a badge (two-proportion z-test, α=0.05). "Not significant" means more data is needed.</Trans></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
