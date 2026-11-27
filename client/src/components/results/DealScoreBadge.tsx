import type { ConfidenceLevel, GoNoGo, MissingInfo } from "@shared/schema";

export interface DealScoreBadgeProps {
  score: "GREEN" | "YELLOW" | "RED";
  goNoGo: GoNoGo;
  confidenceLevel: ConfidenceLevel;
  verdictLabel: string;
  missingInfo: MissingInfo[];
}

export default function DealScoreBadge({ score, goNoGo, confidenceLevel, verdictLabel, missingInfo }: DealScoreBadgeProps) {
  const scoreConfig = {
    GREEN: {
      bg: "bg-emerald-500/5",
      border: "border-emerald-500/20",
      chipBg: "bg-emerald-500/15",
      chipBorder: "border-emerald-500/30",
      text: "text-emerald-700 dark:text-emerald-400",
    },
    YELLOW: {
      bg: "bg-amber-500/5",
      border: "border-amber-500/20",
      chipBg: "bg-amber-500/15",
      chipBorder: "border-amber-500/30",
      text: "text-amber-700 dark:text-amber-400",
    },
    RED: {
      bg: "bg-red-500/5",
      border: "border-red-500/20",
      chipBg: "bg-red-500/15",
      chipBorder: "border-red-500/30",
      text: "text-red-700 dark:text-red-400",
    },
  };

  const confidenceLabels: Record<ConfidenceLevel, string> = {
    HIGH: "High confidence",
    MEDIUM: "Medium confidence",
    LOW: "Low confidence",
  };

  const verdictHeadings: Record<string, string> = {
    "GO": "Checked math, fees, and an independent price benchmark support this quote",
    "NO-GO": "Do not sign yet — a material problem is in this quote",
    "NEED-MORE-INFO": "Proceed with caution — resolve the items below before you agree",
    "PROCEED-WITH-CAUTION": "Proceed with caution — resolve the items below before you agree",
    "INSUFFICIENT-INFORMATION": "Not enough verified information to call this a good price",
  };

  const verdictSubtext: Record<string, string> = {
    "GO": "The selling price sits inside an independent benchmark, and the checked math and fee rules are clean.",
    "NO-GO": "A financial, regulatory, or transactional problem was established from the quote. Resolve it before you sign.",
    "NEED-MORE-INFO": "Specific items in this quote still need an answer.",
    "PROCEED-WITH-CAUTION": "Specific items in this quote still need an answer. A clean fee list is not a price approval.",
    "INSUFFICIENT-INFORMATION": "Market value not verified, or a required fact is missing. This is not a recommendation to buy.",
  };

  const config = scoreConfig[score];
  const previewIssues = missingInfo.slice(0, 3);

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-5 space-y-4`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold tracking-wide border ${config.chipBg} ${config.chipBorder} ${config.text}`}>
              {goNoGo === "PROCEED-WITH-CAUTION" ? "PROCEED WITH CAUTION" : goNoGo === "INSUFFICIENT-INFORMATION" ? "INSUFFICIENT INFORMATION" : goNoGo}
            </span>
            <span className="text-xs text-muted-foreground border border-border/60 px-2 py-0.5 rounded bg-muted/40">
              {confidenceLabels[confidenceLevel]}
            </span>
          </div>
          <p className={`text-base font-semibold leading-snug mb-2 ${config.text}`}>
            {verdictHeadings[goNoGo] ?? verdictLabel}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {verdictSubtext[goNoGo]}
          </p>
        </div>
      </div>

      <div className="border-t border-border/40 pt-4 space-y-3">
        {previewIssues.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Key issues found
            </p>
            <div className="space-y-1.5">
              {previewIssues.map((item, idx) => (
                <div key={idx} className="flex items-baseline gap-2 text-sm" data-testid={`issue-row-${idx}`}>
                  <span className="font-medium text-foreground shrink-0">{item.field}:</span>
                  <span className="text-muted-foreground leading-snug">{item.question}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground leading-relaxed">
          Quotes like this can obscure the real out-the-door price or bury fees that only appear in the final paperwork. Knowing what's missing helps you decide whether to push back or walk away.
        </p>
      </div>
    </div>
  );
}
