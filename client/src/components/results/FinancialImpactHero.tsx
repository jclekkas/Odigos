import { DollarSign } from "lucide-react";
import { formatCurrency } from "./utils";
import { formatCurrencyRange } from "./utils";

export type FinancialImpactConfidence = "low" | "medium" | "high";

export interface FinancialImpactHeroProps {
  overpaymentMin: number | null | undefined;
  overpaymentMax: number | null | undefined;
  confidence: FinancialImpactConfidence | null | undefined;
  financialSummary: string | null | undefined;
  fallbackSummary: string;
}

export default function FinancialImpactHero({
  overpaymentMin,
  overpaymentMax,
  confidence,
  financialSummary,
  fallbackSummary,
}: FinancialImpactHeroProps) {
  const range = formatCurrencyRange(overpaymentMin, overpaymentMax);
  const hasRange = range != null;

  // Tone: "roughly fair" if the range starts at 0 and max is small; otherwise
  // treat as a money-at-risk situation. Threshold is intentionally loose —
  // the LLM is the source of truth, we just pick visual tone.
  const isRoughlyFair = hasRange && overpaymentMin === 0 && (overpaymentMax ?? 0) <= 500;

  const headline = hasRange
    ? isRoughlyFair
      ? `Likely fair deal · Savings opportunity: ${range}`
      : `You may be overpaying by ${range}`
    : "Dollar impact not yet estimable";

  const toneClasses = !hasRange
    ? {
        border: "border-border/60",
        bg: "bg-muted/30",
        text: "text-foreground",
        chipBg: "bg-muted/50",
        chipBorder: "border-border/60",
        chipText: "text-muted-foreground",
      }
    : isRoughlyFair
    ? {
        border: "border-emerald-500/30",
        bg: "bg-emerald-500/5",
        text: "text-emerald-700 dark:text-emerald-400",
        chipBg: "bg-emerald-500/15",
        chipBorder: "border-emerald-500/30",
        chipText: "text-emerald-700 dark:text-emerald-400",
      }
    : {
        border: "border-red-500/30",
        bg: "bg-red-500/5",
        text: "text-red-700 dark:text-red-400",
        chipBg: "bg-red-500/15",
        chipBorder: "border-red-500/30",
        chipText: "text-red-700 dark:text-red-400",
      };

  const confidenceChipLabel: Record<FinancialImpactConfidence, string> = {
    low: "Low confidence",
    medium: "Medium confidence",
    high: "High confidence",
  };

  return (
    <div
      className={`rounded-xl border-2 ${toneClasses.border} ${toneClasses.bg} p-6 sm:p-8 space-y-4 shadow-sm`}
      data-testid="financial-impact-hero"
    >
      <div className="flex items-center gap-2">
        <DollarSign className={`w-5 h-5 ${toneClasses.text}`} aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Money at risk
        </span>
      </div>
      <h3
        className={`text-2xl sm:text-3xl font-bold leading-tight ${toneClasses.text}`}
        data-testid="financial-impact-headline"
      >
        {headline}
      </h3>
      <p
        className="text-base leading-relaxed text-foreground/90"
        data-testid="financial-impact-summary"
      >
        {financialSummary ?? fallbackSummary}
      </p>
      {confidence && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${toneClasses.chipBg} ${toneClasses.chipBorder} ${toneClasses.chipText}`}
            data-testid="financial-impact-confidence-chip"
          >
            {confidenceChipLabel[confidence]}
          </span>
          {!hasRange && (
            <span className="text-xs text-muted-foreground">
              We need more pricing details to quantify the range.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
