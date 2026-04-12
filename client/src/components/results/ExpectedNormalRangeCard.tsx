import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyRange } from "./utils";

export interface ExpectedNormalRangeCardProps {
  normalOtdMin: number | null | undefined;
  normalOtdMax: number | null | undefined;
}

export default function ExpectedNormalRangeCard({ normalOtdMin, normalOtdMax }: ExpectedNormalRangeCardProps) {
  const range = formatCurrencyRange(normalOtdMin, normalOtdMax);
  if (!range) return null;

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
