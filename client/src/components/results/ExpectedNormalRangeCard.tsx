import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FACTORY_STICKER_COMPARISON } from "@shared/windowSticker";
import { formatCurrencyRange } from "./utils";

export interface ExpectedNormalRangeCardProps {
  normalOtdMin: number | null | undefined;
  normalOtdMax: number | null | undefined;
  marketValueStatus?: "verified" | "unverified" | null;
  benchmarkKind?: "factory_msrp" | "market_transaction" | null;
  msrpSummary?: string | null;
}

export default function ExpectedNormalRangeCard({ normalOtdMin, normalOtdMax, marketValueStatus, benchmarkKind, msrpSummary }: ExpectedNormalRangeCardProps) {
  if (benchmarkKind === "factory_msrp" || msrpSummary) {
    return (
      <Card className="bg-muted/20 border-border/40" data-testid="expected-normal-range-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
            <Target className="w-4 h-4" aria-hidden="true" />
            Factory MSRP comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-base leading-relaxed text-foreground" data-testid="expected-normal-range-value">
            {msrpSummary ?? FACTORY_STICKER_COMPARISON}
          </p>
          {marketValueStatus !== "verified" && (
            <p className="text-sm leading-relaxed text-muted-foreground" data-testid="expected-normal-range-market">
              Independent market valuation is a separate check and is not verified. No market price range is shown.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  const range = formatCurrencyRange(normalOtdMin, normalOtdMax);
  if (!range) {
    if (marketValueStatus !== "unverified") return null;
    return (
      <Card className="bg-muted/20 border-border/40" data-testid="expected-normal-range-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
            <Target className="w-4 h-4" aria-hidden="true" />
            Market value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base leading-relaxed text-foreground" data-testid="expected-normal-range-value">
            Market value not verified. No independent price range is shown.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-muted/20 border-border/40" data-testid="expected-normal-range-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
          <Target className="w-4 h-4" aria-hidden="true" />
          Expected normal range
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-base leading-relaxed text-foreground">
          A more normal out-the-door price for this deal would likely be around{" "}
          <span className="font-semibold font-mono text-foreground" data-testid="expected-normal-range-value">
            {range}
          </span>
          .
        </p>
      </CardContent>
    </Card>
  );
}
