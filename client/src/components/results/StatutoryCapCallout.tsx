import { useState } from "react";
import { AlertTriangle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DocFeeAssessmentPublic, DocFeeCapCheck } from "@shared/schema";
import { docFeeSurfaceCopy } from "@shared/docFeeSurfaceCopy";

export interface StatutoryCapCalloutProps {
  docFeeCapCheck?: DocFeeCapCheck | null;
  docFeeAssessment?: DocFeeAssessmentPublic | null;
}

export default function StatutoryCapCallout({ docFeeCapCheck, docFeeAssessment }: StatutoryCapCalloutProps) {
  const [copied, setCopied] = useState(false);
  const projected = docFeeAssessment ? docFeeSurfaceCopy(docFeeAssessment) : null;
  const callout = projected?.callout ?? null;

  if (callout) {
    const unverified = callout.tone !== "violation";
    const handleCopy = () => {
      navigator.clipboard.writeText(callout.action).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    };
    return (
      <div
        role="alert"
        className={
          unverified
            ? "rounded-xl border-2 border-amber-500/40 bg-amber-500/10 p-5 sm:p-6 space-y-3 shadow-sm"
            : "rounded-xl border-2 border-red-500/40 bg-red-500/10 p-5 sm:p-6 space-y-3 shadow-sm"
        }
        data-testid={unverified ? "statutory-cap-unverified" : "statutory-cap-callout"}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle
            className={unverified ? "w-5 h-5 text-amber-700 dark:text-amber-400 flex-shrink-0" : "w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0"}
            aria-hidden="true"
          />
          <span
            className={
              unverified
                ? "text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300"
                : "text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-400"
            }
          >
            {callout.title}
          </span>
        </div>
        <p className={unverified ? "text-base leading-relaxed text-foreground" : "text-lg sm:text-xl font-bold leading-snug text-red-700 dark:text-red-300"}>
          {callout.body}
        </p>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">What to do:</span>
          <p className="text-sm text-foreground/90 flex-1">{callout.action}</p>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 h-7 px-2"
            onClick={handleCopy}
            data-testid="statutory-cap-copy"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>
    );
  }

  if (!docFeeCapCheck?.violated) return null;

  const { chargedAmount, capAmount, overage, stateName, statuteCitation } = docFeeCapCheck;
  const actionText = statuteCitation
    ? `Your doc fee of $${chargedAmount} exceeds the legal cap of $${capAmount} in ${stateName} per ${statuteCitation}. Please reduce it to $${capAmount} or below.`
    : `Your doc fee of $${chargedAmount} exceeds the legal cap of $${capAmount} in ${stateName}. Please reduce it to $${capAmount} or below.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(actionText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      role="alert"
      className="rounded-xl border-2 border-red-500/40 bg-red-500/10 p-5 sm:p-6 space-y-3 shadow-sm"
      data-testid="statutory-cap-callout"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-400">
          State fee cap exceeded
        </span>
      </div>
      <p className="text-lg sm:text-xl font-bold leading-snug text-red-700 dark:text-red-300">
        This dealer&rsquo;s ${chargedAmount} doc fee exceeds {stateName}&rsquo;s ${capAmount} cap
      </p>
      <p className="text-sm text-foreground/80 leading-relaxed">
        That is ${overage} over the legal limit.
        {statuteCitation ? (
          <> Per <span className="font-medium">{statuteCitation}</span>, dealers in {stateName} cannot charge more than ${capAmount} for documentation fees.</>
        ) : (
          <> {stateName} law limits documentation fees to ${capAmount}. Request the dealer lower this fee to comply.</>
        )}
      </p>
      <div className="flex items-center gap-2 pt-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-400">
          What to do:
        </span>
        <p className="text-sm text-foreground/90 flex-1">{actionText}</p>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 h-7 px-2 text-red-700 dark:text-red-400 hover:text-red-800 hover:bg-red-500/10"
          onClick={handleCopy}
          data-testid="statutory-cap-copy"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </Button>
      </div>
    </div>
  );
}
