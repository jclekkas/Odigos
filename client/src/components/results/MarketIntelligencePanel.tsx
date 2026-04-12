import { TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MarketContext, MarketContextStrength } from "@shared/schema";
import { formatCurrency } from "./utils";

interface MarketIntelligencePanelProps {
  marketContext: MarketContext | null | undefined;
  marketComparison: string | null | undefined;
  detectedDocFee: number | null;
  overallStrength: MarketContextStrength | undefined;
}

const strengthLabels: Record<string, { label: string; classes: string }> = {
  strong: {
    label: "Strong dataset",
    classes: "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
  },
  moderate: {
    label: "Growing dataset",
    classes: "bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-400",
  },
  thin: {
    label: "Early signal",
    classes: "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400",
  },
};

export default function MarketIntelligencePanel({
  marketContext,
  marketComparison,
  detectedDocFee,
  overallStrength,
}: MarketIntelligencePanelProps) {
  const mc = marketContext;
  const strength = overallStrength ?? mc?.overallStrength ?? "none";

  // Nothing to show at all
  if (strength === "none" && !marketComparison) {
    return (
      <Card className="bg-muted/10 border-border/30" data-testid="market-intelligence-panel">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" aria-hidden="true" />
            Market Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We're building market data for your area. Submit more deals to improve accuracy.
          </p>
        </CardContent>
      </Card>
    );
  }

  const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const state = mc?.stateCode ?? "your state";
  const strengthBadge = strengthLabels[strength];

  // Build the market comparison section
  const fallback = "We do not yet have enough local examples for a strong state comparison.";
  const comparisonSentence = marketComparison?.trim() || fallback;

  // Build dealer narratives
  const narratives: { testId: string; text: string }[] = [];

  if (mc) {
    if (
      mc.docFeeVsStateAvg != null &&
      Number.isFinite(mc.docFeeVsStateAvg) &&
      mc.stateTotalAnalyses != null
    ) {
      const delta = mc.docFeeVsStateAvg;
      const absDelta = fmt.format(Math.abs(delta));
      const direction = delta >= 0 ? "above" : "below";
      const dealWord = mc.stateTotalAnalyses === 1 ? "deal" : "deals";
      const prefix = strength === "thin" ? "(Limited data) " : "";
      narratives.push({
        testId: "market-context-doc-fee-delta",
        text: `${prefix}Doc fee is ${absDelta} ${direction} the ${state} average across ${mc.stateTotalAnalyses.toLocaleString()} analyzed ${dealWord}.`,
      });
    } else if (
      mc.stateAvgDocFee != null &&
      Number.isFinite(mc.stateAvgDocFee) &&
      mc.stateTotalAnalyses != null
    ) {
      const dealWord = mc.stateTotalAnalyses === 1 ? "deal" : "deals";
      const prefix = strength === "thin" ? "(Limited data) " : "";
      narratives.push({
        testId: "market-context-state-avg-doc-fee",
        text: `${prefix}Average doc fee in ${state} is ${fmt.format(mc.stateAvgDocFee)} across ${mc.stateTotalAnalyses.toLocaleString()} analyzed ${dealWord}.`,
      });
    } else if (mc.stateTotalAnalyses != null) {
      const dealWord = mc.stateTotalAnalyses === 1 ? "deal" : "deals";
      narratives.push({
        testId: "market-context-state-analyses",
        text: `We have analyzed ${mc.stateTotalAnalyses.toLocaleString()} ${dealWord} in ${state}.`,
      });
    }

    if (
      mc.dealerAvgDealScore != null &&
      Number.isFinite(mc.dealerAvgDealScore) &&
      mc.dealerAnalysisCount != null
    ) {
      const quoteWord = mc.dealerAnalysisCount === 1 ? "quote" : "quotes";
      const prefix = (mc.dealerStrength === "thin") ? "(Limited data) " : "";
      narratives.push({
        testId: "market-context-dealer-score",
        text: `${prefix}This dealer's average deal score is ${mc.dealerAvgDealScore.toFixed(1)} across ${mc.dealerAnalysisCount} analyzed ${quoteWord}.`,
      });
    }
  }

  const hasDocFeeGrid =
    mc != null &&
    state != null &&
    mc.stateAvgDocFee != null &&
    detectedDocFee != null;

  return (
    <Card className="border-border/50" data-testid="market-intelligence-panel">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
          <TrendingUp className="w-4 h-4" aria-hidden="true" />
          Market Intelligence
          {strengthBadge && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${strengthBadge.classes}`}
              data-testid="market-strength-badge"
            >
              {strengthBadge.label}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Market comparison sentence */}
        <p
          className="text-base leading-relaxed text-foreground"
          data-testid="market-comparison-sentence"
        >
          {comparisonSentence}
        </p>

        {/* Doc fee comparison grid */}
        {hasDocFeeGrid && (
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${strength === "thin" ? "opacity-70" : ""}`}
          >
            <div className="rounded-md border border-border/50 bg-background/60 px-3 py-2">
              <div className="text-xs text-muted-foreground">Your doc fee</div>
              <div className="text-base font-semibold font-mono text-foreground">
                {formatCurrency(detectedDocFee)}
              </div>
            </div>
            <div className="rounded-md border border-border/50 bg-background/60 px-3 py-2">
              <div className="text-xs text-muted-foreground">
                {state} average
              </div>
              <div className="text-base font-semibold font-mono text-foreground">
                {formatCurrency(mc!.stateAvgDocFee!)}
              </div>
            </div>
          </div>
        )}

        {/* Dealer + state narratives */}
        {narratives.length > 0 && (
          <div className="space-y-1.5">
            {narratives.map((line) => (
              <p
                key={line.testId}
                className="text-sm text-muted-foreground leading-relaxed"
                data-testid={line.testId}
              >
                {line.text}
              </p>
            ))}
          </div>
        )}

        {/* Confidence qualifier + link */}
        <div className="space-y-1 pt-1">
          <p className="text-xs text-muted-foreground leading-relaxed" data-testid="text-market-context-disclosure">
            {strength === "strong" || strength === "moderate"
              ? "This analysis includes local market data."
              : strength === "thin"
              ? "This analysis uses limited local market data."
              : "This analysis is based on general pricing knowledge (limited local data available)."}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Doc fee limits and other dealer fees vary by state. See our{" "}
            <Link href="/car-dealer-fees-by-state" className="underline underline-offset-2 hover:text-foreground transition-colors" data-testid="link-fees-by-state-context">
              car dealer fees by state
            </Link>{" "}
            breakdown.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
