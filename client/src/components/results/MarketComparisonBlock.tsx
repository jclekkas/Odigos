import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MarketContext } from "@shared/schema";
import { formatCurrency } from "./utils";

export interface MarketComparisonBlockProps {
  marketComparison: string | null | undefined;
  marketContext: MarketContext | null | undefined;
  detectedDocFee: number | null;
}

export default function MarketComparisonBlock({ marketComparison, marketContext, detectedDocFee }: MarketComparisonBlockProps) {
  const state = marketContext?.stateCode ?? null;
  const stateAvgDocFee = marketContext?.stateAvgDocFee ?? null;

  const hasLocalData = state != null && stateAvgDocFee != null;
  const fallback = "We do not yet have enough local examples for a strong state comparison.";
  const sentence = marketComparison?.trim() || fallback;

  return (
    <Card className="bg-muted/20 border-border/40" data-testid="market-comparison-block">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
          <TrendingUp className="w-4 h-4" aria-hidden="true" />
          Market comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p
          className="text-base leading-relaxed text-foreground"
          data-testid="market-comparison-sentence"
        >
          {sentence}
        </p>
        {hasLocalData && detectedDocFee != null && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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
                {formatCurrency(stateAvgDocFee)}
              </div>
            </div>
          </div>
        )}
        {!hasLocalData && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            Based on limited local examples in your state — treat as early signal only.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
