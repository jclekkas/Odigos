import { useState, useEffect, useRef, useCallback } from "react";
import AnalysisProgressBar from "@/components/AnalysisProgressBar";
import { Link, useSearch } from "wouter";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { z } from "zod";
import { drawScorecard } from "@/components/ShareCard";
import {
  trackPageView,
  trackFormStart,
  trackFormFocus,
  trackFileUploadFailed,
  trackAnalysisFailed,
  trackCheckoutFailed,
  trackScorecardDownloaded,
  trackCopySummary,
  trackOptionalDetailsExpanded,
  getSessionId,
} from "@/lib/tracking";
import { capture } from "@/lib/analytics";
import { trackConversion, useExperiment } from "@/lib/experiments";
import { tagFlow } from "@/lib/sentry";
import { setSeoMeta } from "@/lib/seo";
import { howToSchema } from "@/lib/jsonld";
import { 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  Copy, 
  Check, 
  HelpCircle,
  DollarSign,
  FileText,
  MessageSquare,
  Info,
  Lock,
  Upload,
  Download,
  Share2
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { AnalysisResponse, DetectedFields, MissingInfo, ConfidenceLevel, MarketContext } from "@shared/schema";
import { ThumbsUp, ThumbsDown } from "lucide-react";

type AnalysisResponseWithExtras = AnalysisResponse & {
  listingId?: string;
};

const formSchema = z.object({
  dealerText: z.string().min(1, "Please paste dealer text to analyze"),
  condition: z.enum(["unknown", "new", "used"]),
  vehicle: z.string().optional(),
  zipCode: z.string().optional(),
  purchaseType: z.enum(["unknown", "cash", "finance", "lease"]),
  apr: z.string().optional(),
  termMonths: z.string().optional(),
  downPayment: z.string().optional(),
  source: z.enum(["paste", "upload"]).default("paste").optional(),
});

type FormValues = z.infer<typeof formSchema>;

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "Not specified";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface DealScoreBadgeProps {
  score: "GREEN" | "YELLOW" | "RED";
  goNoGo: "GO" | "NO-GO" | "NEED-MORE-INFO";
  confidenceLevel: ConfidenceLevel;
  verdictLabel: string;
  missingInfo: MissingInfo[];
}

function DealScoreBadge({ score, goNoGo, confidenceLevel, verdictLabel, missingInfo }: DealScoreBadgeProps) {
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
    "GO": "Deal appears reasonable — a few things to confirm",
    "NO-GO": "Significant red flags found — key information is missing or unclear",
    "NEED-MORE-INFO": "Proceed with caution — several pricing concerns detected",
  };

  const verdictSubtext: Record<string, string> = {
    "GO": "The quote looks broadly in line with market norms. The details below are worth verifying before you sign.",
    "NO-GO": "This quote has enough gaps or warning signs that visiting the dealership without resolving them first is high-risk.",
    "NEED-MORE-INFO": "There are open questions in this quote that could meaningfully change the out-the-door price. Get answers before proceeding.",
  };

  const config = scoreConfig[score];
  const previewIssues = missingInfo.slice(0, 3);

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-5 space-y-4`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold tracking-wide border ${config.chipBg} ${config.chipBorder} ${config.text}`}>
              {goNoGo}
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

function DetectedFieldsCard({ fields }: { fields: DetectedFields }) {
  const items = [
    { label: "Sale Price", value: fields.salePrice, format: formatCurrency },
    { label: "MSRP", value: fields.msrp, format: formatCurrency },
    { label: "Rebates/Incentives", value: fields.rebates, format: formatCurrency },
    { label: "Out-the-Door Price", value: fields.outTheDoorPrice, format: formatCurrency },
    { label: "Monthly Payment", value: fields.monthlyPayment, format: formatCurrency },
    { label: "Trade-In Value", value: fields.tradeInValue, format: formatCurrency },
    { label: "APR", value: fields.apr, format: (v: number | null) => v != null ? `${v}%` : "Not specified" },
    { label: "Term", value: fields.termMonths, format: (v: number | null) => v != null ? `${v} months` : "Not specified" },
    { label: "Down Payment", value: fields.downPayment, format: formatCurrency },
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5 text-muted-foreground" />
          What We Detected
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className={`text-sm font-medium font-mono ${item.value != null ? "text-foreground" : "text-muted-foreground/60"}`}>
                {item.format(item.value)}
              </span>
            </div>
          ))}
        </div>
        
        {fields.fees && fields.fees.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              Itemized Fees
            </h4>
            <div className="space-y-2">
              {fields.fees.map((fee, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 bg-muted/30 rounded-md px-3">
                  <span className="text-sm">{fee.name}</span>
                  <span className="text-sm font-mono font-medium">
                    {fee.amount != null ? formatCurrency(fee.amount) : "Amount unclear"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface MissingInfoCardProps {
  items: MissingInfo[];
  confidenceLevel: ConfidenceLevel;
  verdictLabel: string;
  onCopy: () => void;
}

function MissingInfoCard({ items, confidenceLevel, verdictLabel, onCopy }: MissingInfoCardProps) {
  const [copied, setCopied] = useState(false);

  const isProceedVerdict = verdictLabel.includes("PROCEED");
  const displayItems = isProceedVerdict ? items.slice(0, 3) : items;

  const handleCopy = () => {
    const questions = displayItems.map((item) => item.question).join("\n\n");
    navigator.clipboard.writeText(questions);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy();
  };

  if (displayItems.length === 0 || confidenceLevel === "HIGH") return null;

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-amber-700 dark:text-amber-400">
          <HelpCircle className="w-5 h-5" />
          {isProceedVerdict ? "Confirm These Details" : "Missing Information"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {isProceedVerdict 
            ? "Before you visit, quickly confirm these points:"
            : "Ask the dealer these questions to get the full picture:"}
        </p>
        <ul className="space-y-3 mb-4">
          {displayItems.map((item, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center justify-center">
                {idx + 1}
              </span>
              <div>
                <p className="text-sm font-medium">{item.field}</p>
                <p className="text-sm text-muted-foreground">{item.question}</p>
              </div>
            </li>
          ))}
        </ul>
        {items.length > displayItems.length && (
          <p className="text-xs text-muted-foreground mb-3">
            + {items.length - displayItems.length} more questions available in full analysis
          </p>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="w-full"
          data-testid="button-copy-questions"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Questions to Send to Dealer
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

const SAMPLE_GOOD_DEAL = `Hey! Confirming we can do $32,245.18 out-the-door on a 2026 Kia Sportage LX AWD with 1.99% APR for 60 months (tier 1 credit). Taxes and fees included. Let me know what time you can come in and we'll have the buyer's order ready.`;

const SAMPLE_BAD_DEAL = `Hey my friend!! Great news!!!
We can get you driving TODAY for only $589/month
No worries about price details, we'll explain everything when you get here.
APR depends on credit but it will be competitive!
Low down payment options available.
We added some protection packages that everyone gets, but we can talk about that later.
Let me know what time you're coming in today!!!`;

type UnlockTier = "free" | "49";

interface LockedTier2Props {
  onUnlock: () => void;
  isLoading: boolean;
  stripeConfigured: boolean;
  ctaLabel?: string;
}

function LockedTier2Section({ onUnlock, isLoading, stripeConfigured, ctaLabel }: LockedTier2Props) {
  return (
    <Card className="border-border bg-muted/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Lock className="w-4 h-4 text-muted-foreground" />
          Unlock the full review
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 mb-4">
          {[
            "Checklist of missing information to request from the dealer",
            "Copy-paste reply you can send to the dealer directly",
            "Detailed breakdown of fees, add-ons, and negotiation risks",
            "Clear guidance on whether to proceed, push back, or walk away",
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          Use the full review when you need to reply to the dealer, pressure-test the quote, or decide whether to keep negotiating.
        </p>
        <Button
          variant="default"
          onClick={onUnlock}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white"
          disabled={isLoading || !stripeConfigured}
          data-testid="button-unlock-49"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : !stripeConfigured ? (
            "Checkout unavailable"
          ) : (
            ctaLabel ?? "Unlock Full Deal Review — $49 (one-time)"
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Unlocks immediately after payment · One-time · Not affiliated with any dealership
        </p>
        <p className="text-xs text-muted-foreground text-center mt-4">
          <Link href="/example-analysis" className="underline underline-offset-2 hover:text-foreground transition-colors" data-testid="link-example-analysis-paywall">
            Still unsure? See a full example analysis
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

/* $79 Negotiation Pack - Hidden for single-tier pricing
interface LockedTier3Props {
  onUnlock: () => void;
  isLoading: boolean;
  stripeConfigured: boolean;
}

function LockedTier3Section({ onUnlock, isLoading, stripeConfigured }: LockedTier3Props) {
  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lock className="w-5 h-5 text-amber-500" />
          Unlock Negotiation Pack
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Get a copy-paste reply to send the dealer + the full reasoning behind this analysis.
        </p>
        <ul className="space-y-2 mb-4">
          {[
            "Copy-paste reply tailored to this deal",
            "Full analysis reasoning and methodology"
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground mb-4">
          One-time payment. Not affiliated with any dealership.
        </p>
        {stripeConfigured ? (
          <Button
            variant="default"
            onClick={onUnlock}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            disabled={isLoading}
            data-testid="button-unlock-79"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Unlock for $79"
            )}
          </Button>
        ) : (
          <p className="text-sm text-center text-muted-foreground">
            Payments not configured
          </p>
        )}
      </CardContent>
    </Card>
  );
}
*/

function SuggestedReplyCard({ reply }: { reply: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="w-5 h-5 text-muted-foreground" />
          Suggested Reply to Dealer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/30 rounded-lg p-4 mb-4">
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{reply}</p>
        </div>
        <Button
          variant="default"
          onClick={handleCopy}
          className="w-full"
          data-testid="button-copy-reply"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Reply
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function MarketContextCard({ marketContext }: { marketContext: MarketContext }) {
  const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const state = marketContext.stateCode ?? "your state";

  const narratives: { testId: string; text: string }[] = [];

  if (
    marketContext.docFeeVsStateAvg != null &&
    Number.isFinite(marketContext.docFeeVsStateAvg) &&
    marketContext.stateTotalAnalyses != null
  ) {
    const delta = marketContext.docFeeVsStateAvg;
    const absDelta = fmt.format(Math.abs(delta));
    const direction = delta >= 0 ? "above" : "below";
    const dealWord = marketContext.stateTotalAnalyses === 1 ? "deal" : "deals";
    narratives.push({
      testId: "market-context-doc-fee-delta",
      text: `Doc fee is ${absDelta} ${direction} the ${state} average across ${marketContext.stateTotalAnalyses.toLocaleString()} analyzed ${dealWord}.`,
    });
  } else if (
    marketContext.stateAvgDocFee != null &&
    Number.isFinite(marketContext.stateAvgDocFee) &&
    marketContext.stateTotalAnalyses != null
  ) {
    const dealWord = marketContext.stateTotalAnalyses === 1 ? "deal" : "deals";
    narratives.push({
      testId: "market-context-state-avg-doc-fee",
      text: `Average doc fee in ${state} is ${fmt.format(marketContext.stateAvgDocFee)} across ${marketContext.stateTotalAnalyses.toLocaleString()} analyzed ${dealWord}.`,
    });
  } else if (marketContext.stateTotalAnalyses != null) {
    const dealWord = marketContext.stateTotalAnalyses === 1 ? "deal" : "deals";
    narratives.push({
      testId: "market-context-state-analyses",
      text: `We have analyzed ${marketContext.stateTotalAnalyses.toLocaleString()} ${dealWord} in ${state}.`,
    });
  }

  if (
    marketContext.dealerAvgDealScore != null &&
    Number.isFinite(marketContext.dealerAvgDealScore) &&
    marketContext.dealerAnalysisCount != null
  ) {
    const quoteWord = marketContext.dealerAnalysisCount === 1 ? "quote" : "quotes";
    narratives.push({
      testId: "market-context-dealer-score",
      text: `This dealer's average deal score is ${marketContext.dealerAvgDealScore.toFixed(1)} across ${marketContext.dealerAnalysisCount} analyzed ${quoteWord}.`,
    });
  }

  if (narratives.length === 0) return null;

  return (
    <Card className="bg-muted/20 border-border/40" data-testid="market-context-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          How This Compares
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {narratives.map((line) => (
          <p key={line.testId} className="text-sm text-muted-foreground leading-relaxed" data-testid={line.testId}>
            {line.text}
          </p>
        ))}
        <p className="text-xs text-muted-foreground leading-relaxed">
          Doc fee limits and other dealer fees vary by state. See our{" "}
          <Link href="/car-dealer-fees-by-state" className="underline underline-offset-2 hover:text-foreground transition-colors" data-testid="link-fees-by-state-context">
            car dealer fees by state
          </Link>{" "}
          breakdown.
        </p>
      </CardContent>
    </Card>
  );
}

type FeedbackStatus = "idle" | "submitting" | "submitted" | "error";

function FeedbackWidget({ listingId }: { listingId: string }) {
  const [rating, setRating] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<FeedbackStatus>("idle");

  const handleSubmit = async () => {
    if (rating === null) return;
    setStatus("submitting");
    try {
      const body: Record<string, unknown> = { listingId, rating };
      const trimmed = comment.trim();
      if (trimmed) body.comment = trimmed;
      const res = await apiRequest("POST", "/api/feedback", body);
      if (!res.ok) throw new Error("server error");
      setStatus("submitted");
    } catch {
      setStatus("error");
    }
  };

  const disabled = status === "submitting" || status === "submitted";

  return (
    <div className="border border-border/40 rounded-xl p-4 space-y-3 bg-muted/10" data-testid="feedback-widget">
      <p className="text-sm font-medium text-foreground">Was this analysis helpful?</p>

      {status === "submitted" ? (
        <p className="text-sm text-muted-foreground" data-testid="feedback-confirmation">
          Thanks for the feedback!
        </p>
      ) : (
        <>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => !disabled && setRating(true)}
              disabled={disabled}
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
              onClick={() => !disabled && setRating(false)}
              disabled={disabled}
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
            disabled={disabled}
            placeholder="Optional: share a quick note (max 500 chars)"
            rows={2}
            className="w-full text-sm rounded-lg border border-border/50 bg-background px-3 py-2 resize-none placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
            data-testid="feedback-comment-input"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSubmit}
            disabled={disabled || rating === null}
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
      )}
    </div>
  );
}

type EmailPreviewStatus = "idle" | "success" | "error";

function EmailPreviewForm({ analysisResult }: { analysisResult: AnalysisResponseWithExtras }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<EmailPreviewStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const emailMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await apiRequest("POST", "/api/email-preview", {
          email,
          analysisResult: {
            goNoGo: analysisResult.goNoGo,
            verdictLabel: analysisResult.verdictLabel,
            confidenceLevel: analysisResult.confidenceLevel,
            missingInfo: analysisResult.missingInfo.slice(0, 3),
            detectedFields: analysisResult.detectedFields,
            summary: analysisResult.summary,
          },
        });
        return response.json();
      } catch (err) {
        if (err instanceof Error) {
          const match = err.message.match(/^\d+: ([\s\S]+)$/);
          if (match) {
            try {
              const parsed = JSON.parse(match[1]) as { message?: string };
              throw new Error(parsed.message ?? "Could not send the email. Please try again.");
            } catch (parseErr) {
              if (parseErr instanceof Error && parseErr !== err) throw parseErr;
            }
          }
        }
        throw new Error("Could not send the email. Please try again.");
      }
    },
    onSuccess: () => {
      setStatus("success");
    },
    onError: (err) => {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    },
  });

  const handleSend = () => {
    setStatus("idle");
    setErrorMessage(null);
    emailMutation.mutate();
  };

  if (status === "success") {
    return (
      <div
        className="border border-border/40 rounded-xl px-4 py-3 bg-muted/10 flex items-center gap-2"
        data-testid="email-preview-success"
      >
        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
        <p className="text-sm text-muted-foreground">Check your inbox!</p>
      </div>
    );
  }

  return (
    <div
      className="border border-border/40 rounded-xl px-4 py-3 bg-muted/10 space-y-2"
      data-testid="email-preview-form"
    >
      <p className="text-sm font-medium text-foreground">Email me a copy</p>
      <div className="flex gap-2 items-start">
        <div className="flex-1 min-w-0">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") {
                setStatus("idle");
                setErrorMessage(null);
              }
            }}
            disabled={emailMutation.isPending}
            className="text-sm h-9"
            data-testid="input-email-preview"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 h-9"
          disabled={emailMutation.isPending || !email.trim()}
          onClick={handleSend}
          data-testid="button-send-email-preview"
        >
          {emailMutation.isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              Sending…
            </>
          ) : (
            "Send"
          )}
        </Button>
      </div>
      {status === "error" && errorMessage && (
        <p className="text-xs text-destructive" data-testid="email-preview-error">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

function getStoredTier(): UnlockTier {
  try {
    if (localStorage.getItem("paid_negotiation_pack") === "true") return "49";
    if (localStorage.getItem("paid_deal_clarity") === "true") return "49";
    if (localStorage.getItem("odigos_unlock_tier") === "79") return "49";
    if (localStorage.getItem("odigos_unlock_tier") === "49") return "49";
    if (localStorage.getItem("odigos_premium_unlocked") === "true") return "49";
    return "free";
  } catch {
    return "free";
  }
}

const ALLOWED_UPLOAD_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const UNLOCK_CTA_LABELS: Record<string, string> = {
  control: "Unlock Full Deal Review — $49 (one-time)",
  value: "Unlock Full Deal Review — $49 (Less Than Most Doc Fees)",
};

export default function Home() {
  const search = useSearch();
  const [isOptionalOpen, setIsOptionalOpen] = useState(false);
  const [result, setResult] = useState<AnalysisResponseWithExtras | null>(null);
  const [unlockTier, setUnlockTier] = useState<UnlockTier>(getStoredTier);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [formStartTracked, setFormStartTracked] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [inputTab, setInputTab] = useState<"paste" | "upload">("paste");
  const [summaryCopied, setSummaryCopied] = useState<"idle" | "success" | "failed">("idle");
  const [scorecardDownloading, setScorecardDownloading] = useState(false);
  const [showDoneState, setShowDoneState] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputStartedRef = useRef(false);
  const resultFiredRef = useRef(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const unlockCtaVariant = useExperiment("unlock_cta");
  const unlockCtaLabel = UNLOCK_CTA_LABELS[unlockCtaVariant || "control"] ?? UNLOCK_CTA_LABELS.control;

  useEffect(() => {
    trackPageView("/analyze");
    capture("analyze_page_viewed", { route: "/analyze" });
    return setSeoMeta({
      title: "Analyze Your Car Deal | Odigos",
      description: "Paste dealer texts, emails, or quotes into Odigos. Get an instant GO/NO-GO recommendation with hidden fee detection and suggested questions for the dealer.",
      path: "/analyze",
    });
  }, []);


  const handleFormStart = () => {
    if (!formStartTracked) {
      trackFormStart("/analyze");
      setFormStartTracked(true);
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dealerText: "",
      condition: "unknown",
      vehicle: "",
      zipCode: "",
      purchaseType: "unknown",
      apr: "",
      termMonths: "",
      downPayment: "",
      source: "paste",
    },
  });

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = "";
    if (!file) return;

    setUploadError(null);

    if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
      const reason = "unsupported_file_type";
      setUploadError("That file type isn't supported. Please upload a PNG, JPG, WEBP, or PDF.");
      capture("file_upload_failed", { reason, file_type: file.type });
      trackFileUploadFailed(reason);
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      const reason = "file_too_large";
      setUploadError("That file is too large to process. Please use a file under 10 MB.");
      capture("file_upload_failed", { reason, file_size_bytes: file.size });
      trackFileUploadFailed(reason);
      return;
    }

    setUploadLoading(true);
    try {
      tagFlow("extract-text", "/api/extract-text");
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/extract-text", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) {
        const reason = data.message ?? "server_error";
        setUploadError(data.message ?? "We couldn't process that file. Please try again.");
        capture("file_upload_failed", { reason, status: response.status });
        trackFileUploadFailed(reason);
        return;
      }
      form.setValue("dealerText", data.text);
      form.setValue("source", "upload");
      setInputTab("paste");
    } catch (err) {
      const reason = "network_error";
      setUploadError("Something went wrong. Please try again or paste the text manually.");
      capture("file_upload_failed", { reason });
      trackFileUploadFailed(reason);
    } finally {
      setUploadLoading(false);
    }
  }, [form]);

  const { data: stripeStatus } = useQuery<{ configured: boolean }>({
    queryKey: ["/api/stripe-status"],
  });

  const { data: statsData, isLoading: statsLoading, isError: statsError } = useQuery<{ count: number; type: string }>({
    queryKey: ["/api/stats/count"],
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const stripeConfigured = stripeStatus?.configured ?? false;

  useEffect(() => {
    const params = new URLSearchParams(search);
    const example = params.get("example");

    if (example === "good") {
      form.setValue("dealerText", SAMPLE_GOOD_DEAL);
      window.history.replaceState({}, "", window.location.pathname);
    } else if (example === "bad") {
      form.setValue("dealerText", SAMPLE_BAD_DEAL);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [search, form]);

  useEffect(() => {
    setCheckoutLoading(false);
    
    const params = new URLSearchParams(window.location.search);
    const paid = params.get("paid");
    const product = params.get("product");
    const canceled = params.get("canceled");

    if (canceled === "0" || canceled === "1") {
      if (canceled === "0" || paid === "0") {
        toast({
          title: "Payment Canceled",
          description: "You can try again anytime.",
        });
      }
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }

    if (paid === "1" && product) {
      try {
        if (product === "deal_clarity" || product === "negotiation_pack") {
          localStorage.setItem("paid_deal_clarity", "true");
          capture("paid_conversion", { product: "full_review" });
          trackConversion("paid_conversion");
          setUnlockTier("49");
          toast({
            title: "Payment Successful",
            description: "Full Deal Review unlocked!",
          });
        }
      } catch {}
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [toast]);

  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView?.({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  const handleUnlockTier = async () => {
    setCheckoutLoading(true);
    
    try {
      tagFlow("checkout", "/api/checkout");
      const response = await apiRequest("POST", "/api/checkout", { product: "deal_clarity", sessionId: getSessionId() });
      const data = await response.json();
      
      if (data.error === "PAYMENTS_NOT_CONFIGURED") {
        capture("checkout_failed", { reason: "payments_not_configured" });
        trackCheckoutFailed("payments_not_configured");
        toast({
          title: "Payments Not Configured",
          description: "Please check STRIPE_SECRET_KEY and price IDs.",
          variant: "destructive",
        });
        setCheckoutLoading(false);
        return;
      }
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      const reason = error instanceof Error && error.message ? error.message : "unknown_error";
      capture("checkout_failed", { reason });
      trackCheckoutFailed(reason);
      toast({
        title: "Checkout Error",
        description: "Could not start checkout. Please try again.",
        variant: "destructive",
      });
      setCheckoutLoading(false);
    }
  };

  const formatIssueLabel = useCallback((field: string): string => {
    const ISSUE_LABELS: Record<string, string> = {
      out_the_door_price: "Out-the-door price",
      sale_price: "Sale price",
      monthly_payment: "Monthly payment",
      apr: "APR",
      loan_term: "Loan term",
      down_payment: "Down payment",
      doc_fee: "Documentation fee",
      dealer_fee: "Dealer fee",
      add_on: "Add-on",
      trade_in_value: "Trade-in value",
      residual_value: "Residual value",
      money_factor: "Money factor",
      mileage_limit: "Mileage limit",
      taxes: "Taxes",
      registration_fee: "Registration fee",
      title_fee: "Title fee",
    };
    if (ISSUE_LABELS[field]) return ISSUE_LABELS[field];
    return field
      .replace(/[_-]+/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase());
  }, []);

  const sanitizeIssueLabel = useCallback((field: string): string => {
    const label = formatIssueLabel(field);
    return label
      .replace(/\$[\d,.]+/g, "")
      .replace(/\b\d{4,}\b/g, "")
      .replace(/\d+(\.\d+)?%/g, "")
      .replace(/\d+\.\d{2,}/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }, [formatIssueLabel]);

  const getTopShareIssues = useCallback((): string[] => {
    if (!result) return [];
    return result.missingInfo.slice(0, 3).map((item) => sanitizeIssueLabel(item.field));
  }, [result, sanitizeIssueLabel]);

  const purchaseType = form.watch("purchaseType");

  function getInputLengthBucket(length: number): string {
    if (length < 100) return "1-99";
    if (length < 300) return "100-299";
    if (length < 600) return "300-599";
    return "600+";
  }

  const analyzeMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      tagFlow("analyze", "/api/analyze");
      const payload = {
        dealerText: data.dealerText,
        condition: data.condition,
        vehicle: data.vehicle || undefined,
        zipCode: data.zipCode || undefined,
        purchaseType: data.purchaseType,
        source: data.source ?? "paste",
        apr: data.apr ? parseFloat(data.apr) : undefined,
        termMonths: data.termMonths ? parseInt(data.termMonths) : undefined,
        downPayment: data.downPayment ? parseFloat(data.downPayment) : undefined,
        sessionId: getSessionId(),
        language: "en" as "en" | "es",
      };
      const response = await apiRequest("POST", "/api/analyze", payload);
      return response.json() as Promise<AnalysisResponseWithExtras>;
    },
    onSuccess: (data) => {
      setResult(data);
      setShowDoneState(true);
      setTimeout(() => setShowDoneState(false), 1500);
      if (!resultFiredRef.current) {
        resultFiredRef.current = true;
        capture("analysis_completed", { result_available: true });
      }
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "unknown_error";
      capture("analysis_failed", { errorMessage });
      trackAnalysisFailed(errorMessage);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    setResult(null);
    setShowDoneState(false);
    resultFiredRef.current = false;
    capture("analysis_submitted", {
      input_mode: data.source ?? "paste",
      input_length_bucket: getInputLengthBucket(data.dealerText.length),
    });
    analyzeMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(howToSchema())}</script>
      </Helmet>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div className="max-w-2xl mx-auto mb-2" data-testid="section-analyzer-context">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground" data-testid="text-analyzer-heading">Analyze Your Car Dealer Quote</h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed" data-testid="text-analyzer-description">
            Paste a dealer quote, email, or text message. Odigos flags missing out-the-door pricing, hidden fees, and common dealership tactics.
          </p>
          <a
            href="/how-odigos-works"
            className="inline-block mt-2 text-sm text-muted-foreground underline-offset-4 hover:underline hover:text-foreground transition-colors"
            data-testid="link-methodology"
          >
            How does Odigos work? →
          </a>

          {!statsError && (
            <div className="mt-3" data-testid="container-deals-counter-analyzer">
              {statsLoading ? (
                <Skeleton className="h-5 w-44 rounded-full" data-testid="skeleton-deals-counter-analyzer" />
              ) : statsData && statsData.count >= 100 && statsData.type !== "none" ? (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs text-muted-foreground"
                  data-testid="text-deals-counter-analyzer"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  {statsData.count.toLocaleString()}{" "}
                  {statsData.type === "real_deals"
                    ? "real deals analyzed"
                    : "public auto-finance records analyzed"}
                </span>
              ) : null}
            </div>
          )}
        </div>
        <div className="max-w-2xl mx-auto" data-testid="section-what-you-get">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Free preview includes:</p>
          <ul className="space-y-1 text-sm text-muted-foreground" data-testid="list-what-you-get">
            <li>GO / NO-GO verdict with confidence level</li>
            <li>Deal score out of 100</li>
            <li>Pricing terms found in the quote</li>
            <li>Top issues detected (full list in paid review)</li>
          </ul>
        </div>

        <div className="border border-border/60 rounded-xl bg-card/50 p-4 md:p-6" data-testid="section-analyzer-module">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Your Dealer Quote</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={inputTab} onValueChange={(v) => setInputTab(v as "paste" | "upload")} className="w-full" data-testid="tabs-input-mode">
                  <TabsList className="w-full flex h-11 mb-4" data-testid="tabs-input-mode-list">
                    <TabsTrigger value="paste" className="flex-1 text-sm font-medium" data-testid="tab-paste-text">
                      <FileText className="h-4 w-4 mr-2" />
                      Paste Text
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex-1 text-sm font-medium" data-testid="tab-upload">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image / PDF
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="paste" className="mt-0 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => form.setValue("dealerText", SAMPLE_GOOD_DEAL)}
                        data-testid="button-sample-good"
                      >
                        Try a good deal example
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => form.setValue("dealerText", SAMPLE_BAD_DEAL)}
                        data-testid="button-sample-bad"
                      >
                        Try a bad deal example
                      </Button>
                    </div>

                    <div className="rounded-lg bg-muted/40 border border-border/40 px-4 py-3" data-testid="block-example-message">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs font-medium text-muted-foreground">Example dealer message</p>
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60 border border-border/50 rounded px-1.5 py-0.5 leading-none">Example</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed italic" data-testid="text-example-message">
                        "Hi, the vehicle is $28,995. With taxes, fees, and protection package you're looking at $34,200 OTD. Monthly comes out to about $540 depending on credit. Let me know when you can come in."
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="dealerText"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <FormLabel className="text-sm font-medium text-foreground">Paste a dealer quote, email, or text message.</FormLabel>
                            <Link href="/example-analysis" className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors shrink-0" data-testid="link-example-analysis-textarea">
                              Not sure what to paste? See an example
                            </Link>
                          </div>
                          <FormControl>
                            <Textarea
                              {...field}
                              onFocus={() => handleFormStart()}
                              onChange={(e) => {
                                field.onChange(e);
                                if (uploadError) setUploadError(null);
                              }}
                              onInput={() => {
                                if (!inputStartedRef.current) {
                                  inputStartedRef.current = true;
                                  capture("analysis_input_started", { input_method: "typing" });
                                }
                              }}
                              onPaste={() => {
                                if (!inputStartedRef.current) {
                                  inputStartedRef.current = true;
                                  capture("analysis_input_started", { input_method: "paste" });
                                }
                              }}
                              placeholder="Paste the dealer's email, text message, or quote — any format works"
                              className="min-h-48 text-base resize-y"
                              data-testid="input-dealer-text"
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground" data-testid="text-input-guidance">
                            For best results, include pricing, fees, and any messages from the dealer.
                          </p>
                        </FormItem>
                      )}
                    />
                    <p className="text-xs text-muted-foreground" data-testid="text-privacy-reassurance">
                      Your information is not shared with any dealership. This is an independent analysis.
                    </p>
                  </TabsContent>

                  <TabsContent value="upload" className="mt-0">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp,.pdf"
                      className="hidden"
                      onChange={handleFileUpload}
                      data-testid="input-file-upload"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadLoading}
                      className="w-full min-h-48 flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border/80 bg-muted/30 hover:bg-muted/50 hover:border-foreground/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      data-testid="button-upload-file"
                    >
                      {uploadLoading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      ) : (
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      )}
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">
                          {uploadLoading ? "Processing file…" : "Upload a screenshot or PDF of the dealer quote"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, JPEG, WEBP, or PDF — up to 10 MB
                        </p>
                      </div>
                    </button>
                    {uploadError && (
                      <p className="text-xs text-destructive mt-2" data-testid="text-upload-error">
                        {uploadError}
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Collapsible
              open={isOptionalOpen}
              onOpenChange={(open) => {
                setIsOptionalOpen(open);
                if (open) {
                  capture("optional_details_expanded");
                  trackOptionalDetailsExpanded();
                }
              }}
            >
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover-elevate active-elevate-2 rounded-t-xl">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Info className="w-5 h-5 text-muted-foreground" />
                        Optional Details
                        <span className="text-sm font-normal text-muted-foreground">(improves accuracy)</span>
                      </CardTitle>
                      {isOptionalOpen ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="condition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Condition</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-condition">
                                  <SelectValue placeholder="Select condition" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="unknown">Unknown</SelectItem>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="used">Used</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="vehicle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g., 2024 Toyota Camry XLE"
                                data-testid="input-vehicle"
                                onFocus={() => trackFormFocus("vehicle")}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g., 90210"
                                maxLength={5}
                                data-testid="input-zip"
                                onFocus={() => trackFormFocus("zip_code")}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="purchaseType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Purchase Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-purchase-type">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="unknown">Unknown</SelectItem>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="finance">Finance</SelectItem>
                                <SelectItem value="lease">Lease</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    {purchaseType === "finance" && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <FormField
                          control={form.control}
                          name="apr"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>APR (%)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  placeholder="e.g., 5.99"
                                  data-testid="input-apr"
                                  onFocus={() => trackFormFocus("apr")}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="termMonths"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Term (months)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  placeholder="e.g., 60"
                                  data-testid="input-term"
                                  onFocus={() => trackFormFocus("term_months")}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="downPayment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Down Payment ($)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  placeholder="e.g., 5000"
                                  data-testid="input-down-payment"
                                  onFocus={() => trackFormFocus("down_payment")}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            <div className="border-t border-border/40 pt-5">
            <Button
              variant="cta"
              type="submit"
              size="lg"
              className="w-full"
              disabled={analyzeMutation.isPending || showDoneState}
              data-testid="button-analyze"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing your deal…
                </>
              ) : showDoneState ? (
                "Done — see your results ↓"
              ) : (
                "Analyze Deal"
              )}
            </Button>
            {analyzeMutation.isPending ? (
              <p className="text-xs text-muted-foreground text-center mt-2" data-testid="text-what-happens-next">
                Still working — this is normal and usually takes 40–60 seconds. Stay on this page.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground text-center mt-2" data-testid="text-what-happens-next">
                Results usually take about 40–60 seconds and will appear below.
              </p>
            )}
            {analyzeMutation.isPending && <AnalysisProgressBar isPending={analyzeMutation.isPending} />}
            <p className="text-xs text-muted-foreground text-center mt-3" data-testid="text-data-disclosure">
              Pricing signals (not your personal details) are stored anonymously to improve our dealer fee database. Your submission is not shared with any dealership.{" "}
              <a href="/privacy" className="underline hover:text-foreground transition-colors">Privacy Policy</a>
            </p>
            </div>
          </form>
        </Form>
        </div>

        {!result && (
          <div className="border-t pt-6 mt-2">
            <p className="text-sm font-medium text-muted-foreground mb-2">Why Odigos instead of generic AI?</p>
            <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
              <li>Built specifically for car dealer quotes — not general answers</li>
              <li>Consistent detection of fees, add-ons, and missing pricing</li>
              <li>Structured output with clear next steps</li>
              <li>Designed for real negotiation situations</li>
            </ul>
          </div>
        )}

        {result && (
          <div ref={resultsRef} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-t border-border/50 pt-8">
              <h2 className="text-sm font-medium text-muted-foreground text-center mb-4 uppercase tracking-wider">Your deal analysis</h2>
              
              <DealScoreBadge 
                score={result.dealScore} 
                goNoGo={result.goNoGo}
                confidenceLevel={result.confidenceLevel}
                verdictLabel={result.verdictLabel}
                missingInfo={unlockTier === "free" ? result.missingInfo : []}
              />
            </div>

            <div className="flex items-center justify-center gap-3" data-testid="section-share-actions">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const topIssues = getTopShareIssues();
                  const issueLines = topIssues.length > 0
                    ? topIssues.map((i) => `• ${i}`).join("\n")
                    : "• No major issues surfaced in this summary";
                  const text = `Odigos Deal Scorecard\nVerdict: ${result.goNoGo}\n${result.verdictLabel}\n\nIssues flagged:\n${issueLines}\n\nAnalyzed by Odigos — odigosauto.com`;
                  navigator.clipboard.writeText(text).then(() => {
                    setSummaryCopied("success");
                    setTimeout(() => setSummaryCopied("idle"), 2000);
                    capture("copy_summary", { verdict: result.goNoGo });
                    trackCopySummary();
                  }).catch(() => {
                    setSummaryCopied("failed");
                    setTimeout(() => setSummaryCopied("idle"), 2000);
                  });
                }}
                data-testid="button-copy-summary"
              >
                {summaryCopied === "success" ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : summaryCopied === "failed" ? (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Copy failed
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Copy summary
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={scorecardDownloading}
                onClick={() => {
                  setScorecardDownloading(true);
                  try {
                    const dataUrl = drawScorecard({
                      goNoGo: result.goNoGo,
                      verdictLabel: result.verdictLabel,
                      topIssues: getTopShareIssues(),
                    });
                    const link = document.createElement("a");
                    link.download = "odigos-deal-scorecard.png";
                    link.href = dataUrl;
                    link.click();
                    capture("scorecard_downloaded", { verdict: result.goNoGo });
                    trackScorecardDownloaded();
                  } catch {
                    toast({
                      title: "Download failed",
                      description: "Could not generate the scorecard. Please try again.",
                      variant: "destructive",
                    });
                  } finally {
                    setScorecardDownloading(false);
                  }
                }}
                data-testid="button-download-scorecard"
              >
                {scorecardDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download scorecard
                  </>
                )}
              </Button>
            </div>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  What This Deal Likely Means
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-w-[750px] mx-auto">
                  <p className="text-base leading-relaxed text-muted-foreground" data-testid="text-summary">
                    {result.summary}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">How to use this</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="shrink-0">&bull;</span>
                    <span>Ask for a full itemized out-the-door price before discussing payments.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="shrink-0">&bull;</span>
                    <span>Push back on any add-ons that are not clearly optional.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="shrink-0">&bull;</span>
                    <span>If the dealer avoids giving clear answers, treat it as a red flag.</span>
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground pt-2">
                  Use the full review if you want a ready-to-send reply and a complete breakdown.
                </p>
              </CardContent>
            </Card>

            <DetectedFieldsCard fields={result.detectedFields} />

            {result.marketContext && (
              <MarketContextCard marketContext={result.marketContext} />
            )}
            <p className="text-xs text-muted-foreground" data-testid="text-market-context-disclosure">
              {result.marketContextStrength === "strong" || result.marketContextStrength === "moderate"
                ? "This analysis includes local market data."
                : result.marketContextStrength === "thin"
                ? "This analysis uses limited local market data."
                : "This analysis is based on general pricing knowledge (limited local data available)."}
            </p>

            {unlockTier === "free" && (
              <EmailPreviewForm analysisResult={result} />
            )}

            {unlockTier === "free" ? (
              <LockedTier2Section
                onUnlock={() => handleUnlockTier()}
                isLoading={checkoutLoading || isCheckingPayment}
                stripeConfigured={stripeConfigured}
                ctaLabel={unlockCtaLabel}
              />
            ) : (
              <>
                <MissingInfoCard 
                  items={result.missingInfo}
                  confidenceLevel={result.confidenceLevel}
                  verdictLabel={result.verdictLabel}
                  onCopy={() => toast({ title: "Questions copied to clipboard" })}
                />
                <SuggestedReplyCard reply={result.suggestedReply} />
                <Card className="bg-muted/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Info className="w-4 h-4" />
                      Analysis Reasoning
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-reasoning">
                      {result.reasoning}
                    </p>
                  </CardContent>
                </Card>
              </>
            )}

            {result.listingId && (
              <FeedbackWidget listingId={result.listingId} />
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-border/50 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Odigos provides estimates based on the information you share.
            Always verify details directly with the dealership.
          </p>
          <nav className="flex justify-center gap-4 text-xs text-muted-foreground">
            <Link href="/car-dealer-fees-by-state" className="hover:text-foreground transition-colors" data-testid="link-footer-fees-by-state">Fees by State</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors" data-testid="link-footer-privacy">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors" data-testid="link-footer-terms">Terms</Link>
            <Link href="/car-dealer-fees-by-state" className="hover:text-foreground transition-colors" data-testid="link-footer-fees-by-state">Dealer Fees by State</Link>
          </nav>
        </div>
      </footer>

    </div>
  );
}
