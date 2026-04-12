import { useState } from "react";
import { ThumbsUp, ThumbsDown, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { apiRequest } from "@/lib/queryClient";

type FeedbackStatus = "idle" | "submitting" | "submitted" | "error";
type OutcomeStatus = "bought_as_is" | "negotiated_down" | "walked_away" | "still_negotiating" | null;
type OutcomeSubmitStatus = "idle" | "submitting" | "submitted" | "error";

export default function FeedbackWidget({ listingId }: { listingId: string }) {
  // Stage 1: thumbs up/down + comment
  const [rating, setRating] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<FeedbackStatus>("idle");

  // Stage 2: progressive disclosure outcome fields
  const [showOutcome, setShowOutcome] = useState(false);
  const [outcomeStatus, setOutcomeStatus] = useState<OutcomeStatus>(null);
  const [finalPaidAmount, setFinalPaidAmount] = useState("");
  const [feesRemoved, setFeesRemoved] = useState<boolean | null>(null);
  const [outcomeSubmitStatus, setOutcomeSubmitStatus] = useState<OutcomeSubmitStatus>("idle");

  const handleSubmitRating = async () => {
    if (rating === null) return;
    setStatus("submitting");
    try {
      const body: Record<string, unknown> = { listingId, rating };
      const trimmed = comment.trim();
      if (trimmed) body.comment = trimmed;
      const res = await apiRequest("POST", "/api/feedback", body);
      if (!res.ok) throw new Error("server error");
      setStatus("submitted");
      setTimeout(() => setShowOutcome(true), 1500);
    } catch {
      setStatus("error");
    }
  };

  const handleSubmitOutcome = async () => {
    setOutcomeSubmitStatus("submitting");
    try {
      const body: Record<string, unknown> = {};
      if (outcomeStatus) body.outcomeStatus = outcomeStatus;
      if (finalPaidAmount) {
        const parsed = parseFloat(finalPaidAmount);
        if (!isNaN(parsed) && parsed > 0) body.finalPaidAmount = parsed;
      }
      if (feesRemoved !== null) body.feesRemoved = feesRemoved;
      if (Object.keys(body).length === 0) return;
      const res = await apiRequest("PATCH", `/api/feedback/${listingId}/outcome`, body);
      if (!res.ok) throw new Error("server error");
      setOutcomeSubmitStatus("submitted");
    } catch {
      setOutcomeSubmitStatus("error");
    }
  };

  const ratingDisabled = status === "submitting" || status === "submitted";

  const outcomeOptions: { value: NonNullable<OutcomeStatus>; label: string }[] = [
    { value: "bought_as_is", label: "Bought as-is" },
    { value: "negotiated_down", label: "Negotiated down" },
    { value: "walked_away", label: "Walked away" },
    { value: "still_negotiating", label: "Still negotiating" },
  ];

  return (
    <div className="border border-border/40 rounded-xl p-4 space-y-3 bg-muted/10" data-testid="feedback-widget">
      <p className="text-sm font-medium text-foreground">Was this analysis helpful?</p>

      {/* Stage 1: Rating */}
      {status === "submitted" && !showOutcome ? (
        <p className="text-sm text-muted-foreground" data-testid="feedback-confirmation">
          Thanks for the feedback!
        </p>
      ) : status !== "submitted" ? (
        <>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => !ratingDisabled && setRating(true)}
              disabled={ratingDisabled}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                rating === true
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                  : "border-border/50 text-muted-foreground hover:bg-muted/40"
              } disabled:opacity-50`}
              data-testid="feedback-thumb-up"
            >
              <ThumbsUp className="w-4 h-4" />
              Yes
            </button>
            <button
              type="button"
              onClick={() => !ratingDisabled && setRating(false)}
              disabled={ratingDisabled}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                rating === false
                  ? "bg-red-500/15 border-red-500/40 text-red-700 dark:text-red-400"
                  : "border-border/50 text-muted-foreground hover:bg-muted/40"
              } disabled:opacity-50`}
              data-testid="feedback-thumb-down"
            >
              <ThumbsDown className="w-4 h-4" />
              No
            </button>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 500))}
            disabled={ratingDisabled}
            placeholder="Optional: share a quick note (max 500 chars)"
            rows={2}
            className="w-full text-sm rounded-lg border border-border/50 bg-background px-3 py-2 resize-none placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
            data-testid="feedback-comment-input"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSubmitRating}
            disabled={ratingDisabled || rating === null}
            data-testid="feedback-submit"
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit feedback"
            )}
          </Button>
          {status === "error" && (
            <p className="text-xs text-destructive">Something went wrong. Please try again.</p>
          )}
        </>
      ) : null}

      {/* Stage 2: Progressive disclosure outcome */}
      {showOutcome && outcomeSubmitStatus !== "submitted" && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full">
            <ChevronDown className="w-4 h-4" />
            Help improve our accuracy
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">What happened with this deal?</p>
              <div className="flex flex-wrap gap-2">
                {outcomeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setOutcomeStatus(outcomeStatus === opt.value ? null : opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                      outcomeStatus === opt.value
                        ? "bg-primary/10 border-primary/40 text-primary font-medium"
                        : "border-border/50 text-muted-foreground hover:bg-muted/40"
                    }`}
                    data-testid={`outcome-${opt.value}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Final out-the-door price? (optional)</p>
              <Input
                type="number"
                placeholder="e.g., 38500"
                value={finalPaidAmount}
                onChange={(e) => setFinalPaidAmount(e.target.value)}
                className="h-8 text-sm"
                data-testid="outcome-final-amount"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Were any fees removed?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFeesRemoved(feesRemoved === true ? null : true)}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                    feesRemoved === true
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                      : "border-border/50 text-muted-foreground hover:bg-muted/40"
                  }`}
                  data-testid="outcome-fees-removed-yes"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setFeesRemoved(feesRemoved === false ? null : false)}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                    feesRemoved === false
                      ? "bg-red-500/15 border-red-500/40 text-red-700 dark:text-red-400"
                      : "border-border/50 text-muted-foreground hover:bg-muted/40"
                  }`}
                  data-testid="outcome-fees-removed-no"
                >
                  No
                </button>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSubmitOutcome}
              disabled={outcomeSubmitStatus === "submitting" || (outcomeStatus === null && !finalPaidAmount && feesRemoved === null)}
              data-testid="outcome-submit"
            >
              {outcomeSubmitStatus === "submitting" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save outcome"
              )}
            </Button>
            {outcomeSubmitStatus === "error" && (
              <p className="text-xs text-destructive">Something went wrong. Please try again.</p>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}

      {outcomeSubmitStatus === "submitted" && (
        <p className="text-sm text-muted-foreground" data-testid="outcome-confirmation">
          Thanks! Your outcome data helps us improve.
        </p>
      )}
    </div>
  );
}
