import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import AnalysisProgressBar from "@/components/AnalysisProgressBar";
import { Link, useSearch } from "wouter";
import { Helmet } from "react-helmet-async";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { z } from "zod";
import { drawScorecard } from "@/components/ShareCard";
import { docFeeSurfaceCopy } from "@shared/docFeeSurfaceCopy";
import {
  track,
  trackPageView,
  trackCheckoutFailed,
  trackSubmissionEvent,
  trackPaywallView,
  trackCheckoutInitiated,
  getSessionId,
} from "@/lib/tracking";
import { captureSubmissionEvent } from "@/lib/analytics";
import { isSyntheticSubmission } from "@shared/syntheticSubmission";
import { trackConversion, useExperiment } from "@/lib/experiments";
import { tagFlow } from "@/lib/sentry";
import {
  uploadFileForExtraction,
  maxUploadBytesFor,
  FileTooLargeError,
  UploadExtractionError,
  ContentNotRelevantError,
} from "@/lib/uploadForExtraction";
import { setSeoMeta } from "@/lib/seo";
import { howToSchema } from "@/lib/jsonld";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Copy,
  Check,
  CheckCircle2,
  HelpCircle,
  DollarSign,
  FileText,
  MessageSquare,
  Info,
  Lock,
  Upload,
  Download,
  Share2,
  Link2 as LinkIcon,
  AlertTriangle,
  TrendingUp,
  Target,
  Camera,
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { apiRequest } from "@/lib/queryClient";
import type { AnalysisResponse, DetectedFields, MissingInfo, ConfidenceLevel, MarketContext, RankedSignal, MarketSignal, FlaggedItemEvidence, MarketConfidenceTier, GoNoGo } from "@shared/schema";
import { FACTORY_STICKER_COMPARISON } from "@shared/windowSticker";
import LeaseMathBlock from "@/components/LeaseMathBlock";
import FinancialImpactHeroComponent from "@/components/results/FinancialImpactHero";
import StatutoryCapCalloutComponent from "@/components/results/StatutoryCapCallout";
import SignalActionCard from "@/components/results/SignalActionCard";
import MarketIntelligencePanel from "@/components/results/MarketIntelligencePanel";
import ExpectedNormalRangeCardComponent from "@/components/results/ExpectedNormalRangeCard";
import DealScoreBadgeComponent from "@/components/results/DealScoreBadge";
import DetectedFieldsCardComponent from "@/components/results/DetectedFieldsCard";
import MissingInfoCardComponent from "@/components/results/MissingInfoCard";
import SuggestedReplyCardComponent from "@/components/results/SuggestedReplyCard";
import FeedbackWidgetComponent from "@/components/results/FeedbackWidget";
import BuyerReportedCard from "@/components/results/BuyerReportedCard";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import {
  getActivePass,
  savePass,
  formatRemaining,
  PASS_PRODUCTS,
  type PassProductKey,
  type ActivePass,
} from "@/lib/pass";

// Stripe client SDK imports — loaded statically so Vite bundles them.
// `loadStripe` must be called with the publishable key at build time (via
// VITE_STRIPE_PUBLISHABLE_KEY). The resulting promise is passed to
// `EmbeddedCheckoutProvider`, which awaits it internally.
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

function getStripePromise(): Promise<Stripe | null> | null {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key) return null;
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

/**
 * Wrapper for Stripe Embedded Checkout. Renders the Stripe modal inline
 * using the clientSecret from /api/checkout.
 */
function StripeEmbeddedCheckoutWrapper({
  clientSecret,
  onClose,
}: {
  clientSecret: string;
  onClose: () => void;
}) {
  const sp = getStripePromise();
  if (!sp) return null;
  return (
    <div className="relative border rounded-lg p-4 bg-background shadow-lg">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground text-sm z-10"
        aria-label="Close checkout"
      >
        &times;
      </button>
      <EmbeddedCheckoutProvider stripe={sp} options={{ clientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}

type AnalysisResponseWithExtras = AnalysisResponse & {
  listingId?: string;
  rankedSignals?: RankedSignal[];
  marketSignals?: MarketSignal[];
  flaggedItemEvidence?: FlaggedItemEvidence[];
  dealerSeenBefore?: boolean;
  dealerPriorQuoteCount?: number;
  dealerPatternSummary?: string | null;
  /** Server-signed carrier for the "email me this" feature. */
  emailToken?: string;
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
  factoryWindowStickerMsrp: z.string().optional().refine((value) => {
    if (value == null || value.trim() === "") return true;
    const amount = Number(value);
    return Number.isFinite(amount) && amount >= 1000 && amount <= 2_000_000;
  }, "Enter the Monroney MSRP in dollars (1000 or more), or leave this blank."),
  vin: z.string().optional(),
  buyerBookAmount: z.string().optional(),
  buyerBookSource: z.string().optional(),
  competingQuoteText: z.string().optional(),
  californiaDmvBusinessPartner: z.enum(["unspecified", "yes", "no"]),
  oregonIntegratorElection: z.enum(["unspecified", "yes", "no"]),
  pennsylvaniaElectronicProcessing: z.enum(["unspecified", "yes", "no"]),
  comps: z.array(z.object({
    askingPrice: z.string(),
    source: z.string(),
    url: z.string(),
    mileage: z.string(),
  })).max(5),
  source: z.enum(["paste", "upload", "url", "camera"]).default("paste").optional(),
}).superRefine((data, ctx) => {
  const vin = (data.vin ?? "").replace(/[\s-]/g, "");
  if (vin && !/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["vin"],
      message: "A VIN is 17 characters and does not use the letters I, O, or Q. Leave this blank if you do not have one.",
    });
  }
  data.comps.forEach((row, index) => {
    const price = row.askingPrice.trim();
    const extra = row.source.trim() || row.url.trim() || row.mileage.trim();
    if (!price && !extra) return;
    const amount = Number(price);
    if (!price || !Number.isFinite(amount) || amount <= 0 || amount > 2_000_000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["comps", index, "askingPrice"],
        message: "Enter the asking price in dollars, or remove this listing.",
      });
    }
    if (row.mileage.trim()) {
      const miles = Number(row.mileage);
      if (!Number.isInteger(miles) || miles < 0 || miles > 1_000_000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["comps", index, "mileage"],
          message: "Mileage should be a whole number of miles, or leave it blank.",
        });
      }
    }
  });
  const bookAmount = (data.buyerBookAmount ?? "").trim();
  const bookSource = (data.buyerBookSource ?? "").trim();
  if (bookAmount && !bookSource) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["buyerBookSource"],
      message: "Name the site you used, such as KBB or Edmunds. Odigos does not look it up.",
    });
  }
  if (!bookAmount && bookSource) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["buyerBookAmount"],
      message: "Enter the book value you saw, or clear the site name.",
    });
  }
  if (bookAmount) {
    const amount = Number(bookAmount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 2_000_000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["buyerBookAmount"],
        message: "Enter the book value in dollars, or leave it blank.",
      });
    }
  }
  if ((data.competingQuoteText ?? "").length > 20_000) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["competingQuoteText"],
      message: "That second quote is too long. Paste the price lines only.",
    });
  }
});

type FormValues = z.infer<typeof formSchema>;

/** Explicit state machine for image intake (camera capture and upload). */
type ImageIntakeStatus = "idle" | "processing" | "success" | "partial" | "failed" | "invalid";

function optionalBoolean(value: "unspecified" | "yes" | "no" | undefined): boolean | undefined {
  if (value === "yes") return true;
  if (value === "no") return false;
  return undefined;
}

function submissionAnalyticsInput(data: { dealerText?: string; competingQuoteText?: string; synthetic?: boolean }) {
  return {
    synthetic: data.synthetic,
    dealerText: data.dealerText ?? "",
    competingQuoteText: data.competingQuoteText ?? "",
  };
}

function buyerRequestFields(data: FormValues): {
  vin?: string;
  buyerComparables?: { askingPrice: number; url?: string; source?: string; mileage?: number }[];
  buyerBookValue?: { amount: number; sourceLabel: string };
  competingQuoteText?: string;
} {
  const payload: {
    vin?: string;
    buyerComparables?: { askingPrice: number; url?: string; source?: string; mileage?: number }[];
    buyerBookValue?: { amount: number; sourceLabel: string };
    competingQuoteText?: string;
  } = {};
  const vin = (data.vin ?? "").replace(/[\s-]/g, "").toUpperCase();
  if (vin) payload.vin = vin;
  const comps = data.comps
    .map((row) => {
      const askingPrice = Number(row.askingPrice);
      if (!row.askingPrice.trim() || !Number.isFinite(askingPrice) || askingPrice <= 0) return null;
      const mileage = row.mileage.trim() ? Number(row.mileage) : undefined;
      return {
        askingPrice,
        url: row.url.trim() || undefined,
        source: row.source.trim() || undefined,
        mileage: mileage != null && Number.isInteger(mileage) ? mileage : undefined,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row != null);
  if (comps.length > 0) payload.buyerComparables = comps;
  const bookAmount = Number((data.buyerBookAmount ?? "").trim());
  const bookSource = (data.buyerBookSource ?? "").trim();
  if ((data.buyerBookAmount ?? "").trim() && bookSource && Number.isFinite(bookAmount) && bookAmount > 0) {
    payload.buyerBookValue = { amount: bookAmount, sourceLabel: bookSource };
  }
  const competing = (data.competingQuoteText ?? "").trim();
  if (competing) payload.competingQuoteText = competing;
  return payload;
}

function parseFactoryWindowStickerMsrp(raw: string | undefined): number | undefined {
  if (raw == null || raw.trim() === "") return undefined;
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount < 1000 || amount > 2_000_000) return undefined;
  return amount;
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "Not specified";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// -----------------------------------------------------------------------
// Financial-impact presentation (the "money at risk" hero block + peers).
//
// These components lead the result page so the buyer sees dollars before
// verdicts, flags, or explanations. They intentionally display ranges
// (never false precision) and hedge when confidence is low.
// -----------------------------------------------------------------------

function formatCurrencyRange(min: number | null | undefined, max: number | null | undefined): string | null {
  if (min == null || max == null) return null;
  if (min === max) return formatCurrency(min);
  return `${formatCurrency(min)}–${formatCurrency(max)}`;
}

type FinancialImpactConfidence = "low" | "medium" | "high";

interface FinancialImpactHeroProps {
  overpaymentMin: number | null | undefined;
  overpaymentMax: number | null | undefined;
  confidence: FinancialImpactConfidence | null | undefined;
  financialSummary: string | null | undefined;
  fallbackSummary: string;
}

function FinancialImpactHero({
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
          {confidence === "low" && hasRange && (
            <span className="text-xs text-muted-foreground">
              This estimate is based on limited comparable data — the range may shift as we see more deals in your area.
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface MarketComparisonBlockProps {
  marketComparison: string | null | undefined;
  marketContext: MarketContext | null | undefined;
  detectedDocFee: number | null;
}

function MarketComparisonBlock({ marketComparison, marketContext, detectedDocFee }: MarketComparisonBlockProps) {
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
        {!hasLocalData && !sentence.toLowerCase().includes("market value not verified") && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            A state doc-fee average is not a vehicle price comparison.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface BiggestIssueCardProps {
  primaryIssue: string | null | undefined;
}

function BiggestIssueCard({ primaryIssue }: BiggestIssueCardProps) {
  // Only render when the LLM actually surfaced a primary issue. We do NOT
  // fall back to verdictLabel here — that field is a verdict statement
  // ("GO — TERMS LOOK CLEAN"), not an issue description.
  const issue = primaryIssue?.trim();
  if (!issue) return null;

  return (
    <Card className="border-l-4 border-l-amber-500 border-amber-500/30 bg-amber-500/5" data-testid="biggest-issue-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          Biggest issue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold leading-snug text-foreground" data-testid="biggest-issue-text">
          {issue}
        </p>
      </CardContent>
    </Card>
  );
}

interface ExpectedNormalRangeCardProps {
  normalOtdMin: number | null | undefined;
  normalOtdMax: number | null | undefined;
  marketValueStatus?: "verified" | "unverified" | null;
  benchmarkKind?: "factory_msrp" | "market_transaction" | null;
  msrpSummary?: string | null;
}

function ExpectedNormalRangeCard({ normalOtdMin, normalOtdMax, marketValueStatus, benchmarkKind, msrpSummary }: ExpectedNormalRangeCardProps) {
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

interface DealScoreBadgeProps {
  score: "GREEN" | "YELLOW" | "RED";
  goNoGo: GoNoGo;
  confidenceLevel: ConfidenceLevel;
  verdictLabel: string;
}

function verdictChip(goNoGo: GoNoGo): string {
  if (goNoGo === "PROCEED-WITH-CAUTION") return "PROCEED WITH CAUTION";
  if (goNoGo === "INSUFFICIENT-INFORMATION") return "INSUFFICIENT INFORMATION";
  return goNoGo;
}

function DealScoreBadge({ score, goNoGo, confidenceLevel, verdictLabel }: DealScoreBadgeProps) {
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
    "NEED-MORE-INFO": "Specific items in this quote still need an answer. Market value is a separate question.",
    "PROCEED-WITH-CAUTION": "Specific items in this quote still need an answer. A clean fee list is not a price approval.",
    "INSUFFICIENT-INFORMATION": "Market value not verified, or a required fact is missing. This is not a recommendation to buy.",
  };

  const config = scoreConfig[score];

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-5 space-y-4`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold tracking-wide border ${config.chipBg} ${config.chipBorder} ${config.text}`}>
              {verdictChip(goNoGo)}
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
    </div>
  );
}

function DetectedFieldsCard({ fields, flaggedItemEvidence }: { fields: DetectedFields; flaggedItemEvidence?: FlaggedItemEvidence[] }) {
  const evidenceMap = new Map<string, FlaggedItemEvidence>();
  if (flaggedItemEvidence) {
    for (const ev of flaggedItemEvidence) {
      evidenceMap.set(ev.itemLabel.toLowerCase().trim(), ev);
    }
  }
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
              {fields.fees.map((fee, idx) => {
                const ev = evidenceMap.get(fee.name.toLowerCase().trim());
                return (
                  <div key={idx} className="py-2 bg-muted/30 rounded-md px-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{fee.name}</span>
                      <span className="text-sm font-mono font-medium">
                        {fee.amount != null ? formatCurrency(fee.amount) : "Amount unclear"}
                      </span>
                    </div>
                    {ev && (
                      <div className={`flex items-center gap-2 mt-1.5 rounded px-2 py-1 ${
                        ev.confidenceTier === "high"
                          ? "bg-red-500/5 border border-red-500/15"
                          : ev.confidenceTier === "medium"
                          ? "bg-amber-500/5 border border-amber-500/15"
                          : ""
                      }`} data-testid={`fee-evidence-${idx}`}>
                        <p className={`text-xs leading-relaxed ${
                          ev.confidenceTier === "low" ? "text-muted-foreground" : "text-foreground/80"
                        }`}>{ev.message}</p>
                        <ConfidencePill tier={ev.confidenceTier} />
                      </div>
                    )}
                  </div>
                );
              })}
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

type UnlockTier = "free" | "active";

interface PaywallCardsProps {
  onUnlock: (productKey: PassProductKey) => void;
  isLoading: boolean;
  loadingProduct: PassProductKey | null;
  stripeConfigured: boolean;
  carBuyerCtaLabel?: string;
}

function PaywallCards({
  onUnlock,
  isLoading,
  loadingProduct,
  stripeConfigured,
  carBuyerCtaLabel,
}: PaywallCardsProps) {
  useEffect(() => {
    trackPaywallView();
  }, []);

  const features = [
    "Unlimited scans inside your window",
    "Every red flag & hidden fee",
    "Copy-paste dealer replies",
    "Full analysis reasoning & negotiation guidance",
  ];

  return (
    <div>
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold">Pick a pass to unlock the full review</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Both passes unlock the same things — pick the window that matches how long you'll be shopping.
        </p>
        <p className="mt-2 text-sm font-medium text-foreground">
          Most buyers run multiple quotes — don't stop at the first offer.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 items-stretch">
        {/* ── WEEKEND WARRIOR — secondary ─────────────────────────── */}
        <Card className="border-border bg-card flex flex-col" data-testid="card-paywall-weekend">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-baseline justify-between">
              <span>Weekend Warrior Pass</span>
              <span className="text-sm text-muted-foreground">$29 / 72h</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <p className="text-sm text-muted-foreground mb-2">
              Only for 2–3 dealer quotes. Ideal if you're ready to decide this weekend.
            </p>
            <ul className="space-y-1.5 mb-3">
              {features.map((f, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-amber-600/90 dark:text-amber-400/90 mb-4 leading-relaxed">
              ⚠ Most buyers need more than a weekend — if you're still comparing next week, you'll need another pass. Choosing $29 when you need more time can cost you $58 total.
            </p>
            <div className="mt-auto">
              <Button
                variant="outline"
                onClick={() => onUnlock("weekend_warrior")}
                className="w-full whitespace-normal h-auto py-3"
                disabled={isLoading || !stripeConfigured}
                data-testid="button-unlock-weekend-warrior"
              >
                {isLoading && loadingProduct === "weekend_warrior" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : !stripeConfigured ? (
                  "Checkout unavailable"
                ) : (
                  "Get Weekend Pass — $29"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── CAR BUYER'S PASS — primary ──────────────────────────── */}
        <Card
          className="border-2 border-primary bg-primary/5 flex flex-col relative md:scale-[1.02] shadow-md"
          data-testid="card-paywall-car-buyer"
        >
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-0.5 rounded-full">
            Most popular
          </span>
          <CardHeader className="pb-3 pt-5">
            <CardTitle className="text-base font-semibold flex items-baseline justify-between">
              <span>Car Buyer's Pass</span>
              <span className="text-sm text-muted-foreground">$49 / 14d</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <p className="text-sm mb-1">
              Most buyers compare 4–6 quotes before deciding. Covers your entire car shopping process.
            </p>
            <p className="text-sm font-medium mb-1">
              One pass. Every dealer. No limits.
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Costs less than one dealer fee — protects your entire purchase.
            </p>
            <ul className="space-y-1.5 mb-4">
              {features.map((f, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              <Button
                variant="cta"
                onClick={() => onUnlock("car_buyers_pass")}
                className="w-full whitespace-normal h-auto py-3"
                disabled={isLoading || !stripeConfigured}
                data-testid="button-unlock-car-buyers-pass"
              >
                {isLoading && loadingProduct === "car_buyers_pass" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : !stripeConfigured ? (
                  "Checkout unavailable"
                ) : (
                  carBuyerCtaLabel ?? "Start 14 Days of Unlimited Scans — $49"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4">
        One-time charge. No subscription. No auto-renewal.
      </p>
      <p className="text-xs text-muted-foreground text-center mt-3">
        <Link
          href="/example-analysis"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
          data-testid="link-example-analysis-paywall"
        >
          Still unsure? See a full example analysis
        </Link>
      </p>
    </div>
  );
}

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

interface NegotiationActionCardProps {
  suggestedReply: string;
  missingInfo: MissingInfo[];
  confidenceLevel: ConfidenceLevel;
  verdictLabel: string;
  unlockTier: UnlockTier;
  onCopyQuestions: () => void;
  onUnlock: (productKey: PassProductKey) => void;
  isLoading?: boolean;
  loadingProduct?: PassProductKey | null;
  stripeConfigured?: boolean;
}

function NegotiationActionCard({
  suggestedReply,
  missingInfo,
  confidenceLevel,
  verdictLabel,
  unlockTier,
  onCopyQuestions,
  onUnlock,
  isLoading,
  loadingProduct,
  stripeConfigured,
}: NegotiationActionCardProps) {
  const [replyCopied, setReplyCopied] = useState(false);
  const [questionsCopied, setQuestionsCopied] = useState(false);

  const isProceedVerdict = verdictLabel.includes("PROCEED");
  const displayItems = isProceedVerdict ? missingInfo.slice(0, 3) : missingInfo;

  const handleCopyReply = () => {
    navigator.clipboard.writeText(suggestedReply);
    setReplyCopied(true);
    setTimeout(() => setReplyCopied(false), 2000);
  };

  const handleCopyQuestions = () => {
    const questions = displayItems.map((item) => item.question).join("\n\n");
    navigator.clipboard.writeText(questions);
    setQuestionsCopied(true);
    setTimeout(() => setQuestionsCopied(false), 2000);
    onCopyQuestions();
  };

  return (
    <Card
      className="border-2 border-primary/30 bg-primary/5"
      data-testid="negotiation-action-card"
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="w-5 h-5 text-primary" />
          What to Say Back
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          A ready-to-send message based on the issues we found.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {unlockTier === "free" ? (
          <>
            {/* Truncated preview with gradient fade */}
            <div className="relative overflow-hidden rounded-lg bg-muted/30 p-4">
              <p className="text-sm leading-relaxed line-clamp-3 text-foreground/70">
                {suggestedReply}
              </p>
              <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-muted/80 to-transparent" />
            </div>
            {confidenceLevel === "LOW" && (
              <p className="text-xs text-muted-foreground">
                This reply is based on our early analysis — unlock the full version for the most complete response.
              </p>
            )}
            <Button
              variant="cta"
              className="w-full"
              onClick={() => onUnlock("car_buyers_pass")}
              disabled={isLoading || !stripeConfigured}
            >
              {isLoading && loadingProduct === "car_buyers_pass" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Unlock Your Full Reply
                </>
              )}
            </Button>
            {displayItems.length > 0 && (
              <div className="pt-2 border-t border-border/40">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  We also found {displayItems.length} question{displayItems.length !== 1 ? "s" : ""} to ask
                </p>
                <ul className="space-y-1.5">
                  {displayItems.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="flex items-baseline gap-2 text-sm">
                      <span className="font-medium text-foreground shrink-0">{item.field}:</span>
                      <span className="text-muted-foreground leading-snug">{item.question}</span>
                    </li>
                  ))}
                </ul>
                {displayItems.length > 3 && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    + {displayItems.length - 3} more in the full review
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Full reply — paid tier */}
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{suggestedReply}</p>
            </div>
            <Button
              variant="default"
              onClick={handleCopyReply}
              className="w-full"
              data-testid="button-copy-reply"
            >
              {replyCopied ? (
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

            {/* Questions to ask */}
            {displayItems.length > 0 && confidenceLevel !== "HIGH" && (
              <div className="pt-3 border-t border-border/40 space-y-3">
                <p className="text-sm font-semibold">
                  {isProceedVerdict ? "Confirm These Details" : "Questions to Ask the Dealer"}
                </p>
                <ul className="space-y-2">
                  {displayItems.map((item, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{item.field}</p>
                        <p className="text-sm text-muted-foreground">{item.question}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyQuestions}
                  className="w-full"
                  data-testid="button-copy-questions"
                >
                  {questionsCopied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Questions
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ConfidencePill({ tier }: { tier: MarketConfidenceTier }) {
  const config = {
    low: { label: "Early signal", className: "bg-muted/40 text-muted-foreground border-border/50" },
    medium: { label: "Moderate signal", className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30" },
    high: { label: "Strong signal", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" },
  };
  const c = config[tier];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${c.className}`} data-testid={`confidence-pill-${tier}`}>
      {c.label}
    </span>
  );
}

function MarketIntelligenceCard({
  marketContext,
  marketSignals,
  dealerSeenBefore,
  dealerPriorQuoteCount,
  dealerPatternSummary,
}: {
  marketContext: MarketContext;
  marketSignals?: MarketSignal[];
  dealerSeenBefore?: boolean;
  dealerPriorQuoteCount?: number;
  dealerPatternSummary?: string | null;
}) {
  const signals = marketSignals ?? [];
  const state = marketContext.stateCode ?? "your state";

  // Also keep legacy narratives as fallback
  const hasSignals = signals.length > 0;
  const hasLegacyData = (marketContext.stateTotalAnalyses != null && marketContext.stateTotalAnalyses > 0) ||
    (marketContext.dealerAnalysisCount != null && marketContext.dealerAnalysisCount > 0);

  if (!hasSignals && !hasLegacyData) return null;

  return (
    <Card className="bg-muted/20 border-border/40" data-testid="market-intelligence-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          <TrendingUp className="w-4 h-4" />
          Market Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {(marketContext.overallStrength === "thin" || marketContext.overallStrength === "none") && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded px-3 py-1.5">
            <Info className="w-3 h-3 flex-shrink-0" />
            Based on limited data — treat as early signal
          </div>
        )}
        {dealerSeenBefore && dealerPriorQuoteCount != null && dealerPriorQuoteCount >= 1 && (
          <div className="flex items-start gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 px-3 py-2" data-testid="dealer-seen-banner">
            <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            <div className="text-sm">
              <p className="font-medium text-foreground">We've seen this dealer before</p>
              <p className={dealerPriorQuoteCount != null && dealerPriorQuoteCount >= 3 ? "text-foreground/90 font-medium" : "text-muted-foreground"}>
                {dealerPatternSummary ?? `Across ${dealerPriorQuoteCount} prior ${dealerPriorQuoteCount === 1 ? "quote" : "quotes"}.`}
              </p>
            </div>
          </div>
        )}

        {hasSignals ? (
          <div className="space-y-2">
            {signals.map((signal, i) => (
              <div key={i} className="flex items-start justify-between gap-2" data-testid={`market-signal-${signal.source}`}>
                <div className="flex-1">
                  <p className="text-sm text-foreground leading-relaxed">{signal.message}</p>
                  {signal.sampleSize != null && signal.sampleSize > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Based on {signal.sampleSize.toLocaleString()} analyzed {signal.sampleSize === 1 ? "quote" : "quotes"}
                    </p>
                  )}
                </div>
                <ConfidencePill tier={signal.confidenceTier} />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {marketContext.stateAvgDocFee != null && marketContext.stateTotalAnalyses != null && (
              <p className="text-sm text-muted-foreground leading-relaxed" data-testid="market-context-state-avg-doc-fee">
                Average doc fee in {state} is ${Math.round(marketContext.stateAvgDocFee)} across {marketContext.stateTotalAnalyses.toLocaleString()} analyzed {marketContext.stateTotalAnalyses === 1 ? "deal" : "deals"}.
              </p>
            )}
            {marketContext.dealerAvgDealScore != null && marketContext.dealerAnalysisCount != null && (
              <p className="text-sm text-muted-foreground leading-relaxed" data-testid="market-context-dealer-score">
                This dealer's average deal score is {marketContext.dealerAvgDealScore.toFixed(1)} across {marketContext.dealerAnalysisCount} analyzed {marketContext.dealerAnalysisCount === 1 ? "quote" : "quotes"}.
              </p>
            )}
          </div>
        )}

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

/** @deprecated Use MarketIntelligenceCard instead */
function MarketContextCard({ marketContext }: { marketContext: MarketContext }) {
  return <MarketIntelligenceCard marketContext={marketContext} />;
}

type FeedbackStatus = "idle" | "submitting" | "submitted" | "error";

function FeedbackWidget({ listingId }: { listingId: string }) {
  const [rating, setRating] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<FeedbackStatus>("idle");
  // Enhanced feedback fields
  const [paidAmount, setPaidAmount] = useState("");
  const [docFeeRemoved, setDocFeeRemoved] = useState<boolean | null>(null);
  const [overpaymentAccurate, setOverpaymentAccurate] = useState<boolean | null>(null);

  const handleSubmit = async () => {
    if (rating === null) return;
    setStatus("submitting");
    try {
      const body: Record<string, unknown> = { listingId, rating };
      const trimmed = comment.trim();
      if (trimmed) body.comment = trimmed;
      const parsedAmount = parseFloat(paidAmount);
      if (Number.isFinite(parsedAmount) && parsedAmount > 0) body.userPaidAmountFinal = parsedAmount;
      if (docFeeRemoved !== null) body.docFeeRemoved = docFeeRemoved;
      if (overpaymentAccurate !== null) body.overpaymentEstimateFeltAccurate = overpaymentAccurate;
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
      <p className="text-sm font-medium text-foreground">Was this analysis accurate?</p>

      {status === "submitted" ? (
        <p className="text-sm text-muted-foreground" data-testid="feedback-confirmation">
          Thanks for the feedback! Your input helps improve future analyses.
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

          {rating !== null && (
            <div className="space-y-3 pt-2 border-t border-border/30" data-testid="feedback-followup">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">What did you end up paying? (optional)</label>
                <Input
                  type="number"
                  placeholder="e.g. 38500"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  disabled={disabled}
                  className="h-8 text-sm"
                  data-testid="feedback-paid-amount"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Were you able to remove the doc fee?</label>
                <div className="flex gap-2">
                  <button type="button" disabled={disabled} onClick={() => setDocFeeRemoved(true)}
                    className={`px-3 py-1 rounded text-xs border transition-colors ${docFeeRemoved === true ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-400" : "border-border/50 text-muted-foreground hover:bg-muted/40"} disabled:opacity-50`}
                    data-testid="feedback-doc-fee-yes">Yes</button>
                  <button type="button" disabled={disabled} onClick={() => setDocFeeRemoved(false)}
                    className={`px-3 py-1 rounded text-xs border transition-colors ${docFeeRemoved === false ? "bg-red-500/15 border-red-500/40 text-red-700 dark:text-red-400" : "border-border/50 text-muted-foreground hover:bg-muted/40"} disabled:opacity-50`}
                    data-testid="feedback-doc-fee-no">No</button>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Was the overpayment estimate accurate?</label>
                <div className="flex gap-2">
                  <button type="button" disabled={disabled} onClick={() => setOverpaymentAccurate(true)}
                    className={`px-3 py-1 rounded text-xs border transition-colors ${overpaymentAccurate === true ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-400" : "border-border/50 text-muted-foreground hover:bg-muted/40"} disabled:opacity-50`}
                    data-testid="feedback-overpayment-yes">Yes</button>
                  <button type="button" disabled={disabled} onClick={() => setOverpaymentAccurate(false)}
                    className={`px-3 py-1 rounded text-xs border transition-colors ${overpaymentAccurate === false ? "bg-red-500/15 border-red-500/40 text-red-700 dark:text-red-400" : "border-border/50 text-muted-foreground hover:bg-muted/40"} disabled:opacity-50`}
                    data-testid="feedback-overpayment-no">No</button>
                </div>
              </div>
            </div>
          )}

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
        // The email body is carried inside the server-signed emailToken, so
        // there is nothing for the client to send but the recipient.
        const response = await apiRequest("POST", "/api/email-preview", {
          email,
          emailToken: analysisResult.emailToken,
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid email address");
      setStatus("error");
      return;
    }
    setStatus("idle");
    setErrorMessage(null);
    setEmail(email.trim());
    track("email_capture_submitted");
    emailMutation.mutate();
  };

  if (status === "success") {
    return (
      <div
        className="border border-border/40 rounded-xl px-4 py-3 bg-muted/10 flex items-center gap-2"
        data-testid="email-preview-success"
      >
        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
        <p className="text-sm text-muted-foreground">Check your inbox — we sent your analysis</p>
      </div>
    );
  }

  return (
    <div
      className="border border-border/40 rounded-xl px-4 py-3 bg-muted/10 space-y-2"
      data-testid="email-preview-form"
    >
      <p className="text-sm font-medium text-foreground">Want a copy of this analysis?</p>
      <p className="text-xs text-muted-foreground">Send it to your email so you can review it later</p>
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
            "Email me this analysis"
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
  // Full analysis is free for everyone, including visitors without a stored pass.
  return "active";
}

const ALLOWED_UPLOAD_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];

function formatSizeCopy(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

const UNLOCK_CTA_LABELS: Record<string, string> = {
  control: "Start 14 Days of Unlimited Scans — $49",
  value: "$49 = 14 days of unlimited scans (less than one doc fee)",
};

export default function Home() {
  const search = useSearch();
  const [isOptionalOpen, setIsOptionalOpen] = useState(false);
  const [result, setResult] = useState<AnalysisResponseWithExtras | null>(null);
  const [unlockTier, setUnlockTier] = useState<UnlockTier>(getStoredTier);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState<PassProductKey | null>(null);
  const [activePass, setActivePass] = useState<ActivePass | null>(() => getActivePass());
  const [checkoutClientSecret, setCheckoutClientSecret] = useState<string | null>(null);
  const [formStartTracked, setFormStartTracked] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [inputTab, setInputTab] = useState<"paste" | "upload" | "url" | "camera">("paste");
  const [imageIntakeStatus, setImageIntakeStatus] = useState<ImageIntakeStatus>("idle");
  const [urlInput, setUrlInput] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [summaryCopied, setSummaryCopied] = useState<"idle" | "success" | "failed">("idle");
  const [scorecardDownloading, setScorecardDownloading] = useState(false);
  const [showDoneState, setShowDoneState] = useState(false);
  const [consentChecked, setConsentChecked] = useState(() => {
    try {
      return localStorage.getItem("odigos_upload_consent") === "accepted";
    } catch {
      return false;
    }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const inputStartedRef = useRef(false);
  const resultFiredRef = useRef(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const unlockCtaVariant = useExperiment("unlock_cta");
  const unlockCtaLabel = UNLOCK_CTA_LABELS[unlockCtaVariant || "control"] ?? UNLOCK_CTA_LABELS.control;

  useEffect(() => {
    trackPageView("/analyze");
    captureIfReal("analyze_page_viewed", { route: "/analyze" });
    setSeoMeta({
      title: "Analyze Your Car Deal | Odigos",
      description: "Paste dealer texts, emails, or quotes into Odigos. The audit checks disclosure, math, and verified fee caps. A factory window sticker MSRP does not verify market value. Independent market valuation stays unverified.",
      path: "/analyze",
    });
  }, []);


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
      factoryWindowStickerMsrp: "",
      vin: "",
      buyerBookAmount: "",
      buyerBookSource: "",
      competingQuoteText: "",
      californiaDmvBusinessPartner: "unspecified",
      oregonIntegratorElection: "unspecified",
      pennsylvaniaElectronicProcessing: "unspecified",
      comps: [],
      source: "paste",
    },
  });
  const listingFields = useFieldArray({ control: form.control, name: "comps" });
  const captureIfReal = (eventName: string, properties?: Record<string, unknown>, extraText?: string) => {
    const values = form.getValues();
    captureSubmissionEvent(submissionAnalyticsInput({
      dealerText: `${values.dealerText ?? ""}\n${extraText ?? ""}`,
      competingQuoteText: values.competingQuoteText ?? "",
    }), eventName, properties);
  };
  const trackIfReal = (
    eventType: Parameters<typeof trackSubmissionEvent>[1],
    metadata?: Parameters<typeof trackSubmissionEvent>[2],
    extraText?: string,
  ) => {
    const values = form.getValues();
    trackSubmissionEvent(submissionAnalyticsInput({
      dealerText: `${values.dealerText ?? ""}\n${extraText ?? ""}`,
      competingQuoteText: values.competingQuoteText ?? "",
    }), eventType, metadata);
  };
  const handleFormStart = () => {
    if (!formStartTracked) {
      trackIfReal("form_start", { page: "/analyze" });
      setFormStartTracked(true);
    }
  };

  /**
   * Shared image-ingestion pipeline used by both camera capture and file upload.
   * Validates the file, sends it through the OCR endpoint, and populates the
   * textarea with extracted text (append if content already exists, replace if empty).
   */
  const handleImageIngestion = useCallback(async (file: File, source: "upload" | "camera") => {
    setUploadError(null);
    setImageIntakeStatus("idle");

    if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
      const reason = "unsupported_file_type";
      setUploadError("That file type isn't supported. Please upload a PNG, JPG, WEBP, or PDF.");
      captureIfReal("file_upload_failed", { reason, file_type: file.type, input_method: source });
      trackIfReal("file_upload_failed", { reason });
      setImageIntakeStatus("invalid");
      return;
    }
    const maxBytes = maxUploadBytesFor(file.type);
    if (file.size > maxBytes) {
      const reason = "file_too_large";
      setUploadError(`That file is too large to process. Please use a file under ${formatSizeCopy(maxBytes)}.`);
      captureIfReal("file_upload_failed", { reason, file_size_bytes: file.size, input_method: source });
      trackIfReal("file_upload_failed", { reason });
      setImageIntakeStatus("invalid");
      return;
    }

    if (!inputStartedRef.current) {
      inputStartedRef.current = true;
      captureIfReal("analysis_input_started", { input_method: source });
    }

    setUploadLoading(true);
    setImageIntakeStatus("processing");
    try {
      let extractedText = "";
      try {
        const currentQuote = form.getValues();
        const result = await uploadFileForExtraction(file, {
          synthetic: isSyntheticSubmission({
            dealerText: currentQuote.dealerText,
            competingQuoteText: currentQuote.competingQuoteText,
          }),
        });
        extractedText = result.text ?? "";
        if (result.compressed) {
          captureIfReal("file_upload_compressed", {
            original_bytes: result.compressed.originalBytes,
            compressed_bytes: result.compressed.compressedBytes,
            input_method: source,
          }, extractedText);
        }
      } catch (err) {
        if (err instanceof ContentNotRelevantError) {
          const reason = "content_not_relevant";
          setUploadError(err.message);
          captureIfReal("file_upload_failed", { reason, documentType: err.documentType, input_method: source }, extractedText);
          trackIfReal("file_upload_failed", { reason }, extractedText);
          setImageIntakeStatus("invalid");
          return;
        }
        if (err instanceof FileTooLargeError) {
          const reason = "file_too_large";
          setUploadError(`That file is too large to process. Please use a file under ${formatSizeCopy(err.cap)}.`);
          captureIfReal("file_upload_failed", { reason, file_size_bytes: file.size, input_method: source }, extractedText);
          trackIfReal("file_upload_failed", { reason }, extractedText);
          setImageIntakeStatus("invalid");
          return;
        }
        if (err instanceof UploadExtractionError) {
          const reason = err.reason || "server_error";
          setUploadError(err.message);
          captureIfReal("file_upload_failed", { reason, status: err.status, input_method: source }, extractedText);
          trackIfReal("file_upload_failed", { reason }, extractedText);
          setImageIntakeStatus("failed");
          return;
        }
        throw err;
      }
      if (!extractedText.trim()) {
        setUploadError("We couldn't read any text from that image. Try a clearer, well-lit photo, or paste the quote manually.");
        captureIfReal("file_upload_failed", { reason: "empty_ocr_result", input_method: source }, extractedText);
        trackIfReal("file_upload_failed", { reason: "empty_ocr_result" }, extractedText);
        setImageIntakeStatus("failed");
        return;
      }

      // Append-vs-replace: preserve existing user content
      const currentText = form.getValues("dealerText") ?? "";
      if (currentText.trim()) {
        form.setValue("dealerText", currentText.trimEnd() + "\n\n---\n\n" + extractedText);
      } else {
        form.setValue("dealerText", extractedText);
      }
      form.setValue("source", source);
      setInputTab("paste");

      // Partial-OCR classification: flag extractions that likely represent
      // an incomplete read rather than a valid short quote.
      //
      // A pure character-count threshold misclassifies short-but-valid dealer
      // notes like "$499 doc fee" or "399/mo 3k down" as partial failures.
      //
      // Heuristic: text is "partial" only when it is both short AND lacks any
      // numeric content.  Short strings that contain numbers (dollar amounts,
      // percentages, monthly payments) are treated as successful — the source
      // material was simply concise.  Short strings with zero numbers are more
      // likely OCR noise / junk fragments.
      const PARTIAL_LENGTH_THRESHOLD = 30;
      const trimmed = extractedText.trim();
      const hasNumericContent = /\d/.test(trimmed);
      const isPartial = trimmed.length < PARTIAL_LENGTH_THRESHOLD && !hasNumericContent;
      if (isPartial) {
        setUploadError("We could only read a small amount of text. Review and edit what we found, or try a clearer image.");
        setImageIntakeStatus("partial");
      } else {
        setImageIntakeStatus("success");
      }
    } catch {
      const reason = "network_error";
      setUploadError("Something went wrong. Please try again or paste the text manually.");
      captureIfReal("file_upload_failed", { reason, input_method: source });
      trackIfReal("file_upload_failed", { reason });
      setImageIntakeStatus("failed");
    } finally {
      setUploadLoading(false);
    }
  }, [form]);

  /** Standard file upload handler (desktop upload tab + mobile upload option). */
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = "";
    if (!file) return;
    handleImageIngestion(file, "upload");
  }, [handleImageIngestion]);

  /** Camera capture handler (mobile only). */
  const handleCameraCapture = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = "";
    if (!file) return;
    handleImageIngestion(file, "camera");
  }, [handleImageIngestion]);

  const handleUrlExtract = useCallback(async () => {
    if (!urlInput.trim()) return;
    setUrlError(null);
    setUrlLoading(true);
    try {
      const currentQuote = form.getValues();
      const response = await fetch("/api/extract-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: urlInput.trim(),
          ...(isSyntheticSubmission({
            dealerText: currentQuote.dealerText,
            competingQuoteText: currentQuote.competingQuoteText,
          }) ? { synthetic: true } : {}),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setUrlError(data.message ?? "We couldn't process that URL. Please try pasting the text directly.");
        captureIfReal("url_extract_failed", { reason: data.message ?? "server_error", status: response.status }, typeof data.text === "string" ? data.text : undefined);
        return;
      }
      form.setValue("dealerText", data.text);
      form.setValue("source", "url");
      setInputTab("paste");
      setUrlInput("");
    } catch {
      setUrlError("Something went wrong. Please try again or paste the text manually.");
      captureIfReal("url_extract_failed", { reason: "network_error" });
    } finally {
      setUrlLoading(false);
    }
  }, [urlInput, form]);

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

    const heroText = sessionStorage.getItem("odigos_hero_text");
    if (heroText) {
      form.setValue("dealerText", heroText);
      sessionStorage.removeItem("odigos_hero_text");
    }
  }, [search, form]);

  useEffect(() => {
    setCheckoutLoading(false);

    const params = new URLSearchParams(window.location.search);
    // Stripe Embedded Checkout returns to `return_url` with a `session_id`
    // query param. `product` is passed through as a hint; the authoritative
    // passProduct comes from the server via /api/verify-session, which
    // reads it from Stripe session metadata.
    const sessionId = params.get("session_id");
    const product = params.get("product");
    const canceled = params.get("canceled");

    if (canceled === "1") {
      toast({
        title: "Payment Canceled",
        description: "You can try again anytime.",
      });
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }

    if (!sessionId) return;

    // Verify the session with the server before activating the pass.
    // This guards against URL tampering and is the same contract used by
    // the webhook path.
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/verify-session?session_id=${encodeURIComponent(sessionId)}`,
        );
        const data = await res.json();
        if (cancelled) return;

        if (!data?.paid) {
          // Payment not confirmed by Stripe — don't activate, don't toast.
          window.history.replaceState({}, "", window.location.pathname);
          return;
        }

        // Prefer server-verified passProduct; fall back to the URL hint for
        // legacy sessions that predate metadata.
        const serverPass = data.passProduct as string | null | undefined;
        const productKey: PassProductKey | null =
          serverPass === "weekend_warrior" || serverPass === "car_buyers_pass"
            ? serverPass
            : product === "weekend_warrior"
              ? "weekend_warrior"
              : product === "car_buyers_pass" ||
                  product === "deal_clarity" ||
                  product === "negotiation_pack"
                ? "car_buyers_pass"
                : null;

        if (!productKey) {
          window.history.replaceState({}, "", window.location.pathname);
          return;
        }

        const pass = savePass(productKey);
        setActivePass(pass);
        setUnlockTier("active");
        captureIfReal("paid_conversion", { product: productKey, selected_pass: productKey });
        trackConversion("paid_conversion");

        const productInfo = PASS_PRODUCTS[productKey];
        const title =
          productKey === "weekend_warrior"
            ? `Weekend Pass activated — ${productInfo.durationLabel} of unlimited scans`
            : `Car Buyer's Pass activated — ${productInfo.durationLabel} of unlimited scans`;
        toast({
          title,
          description:
            "Now run every quote you have — most buyers miss hidden fees on their second offer.",
        });
      } catch {
        // Swallow errors — user can retry; don't flash a scary toast over a
        // successful payment.
      } finally {
        if (!cancelled) {
          window.history.replaceState({}, "", window.location.pathname);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [toast]);

  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView?.({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  // Old pass links must never start checkout now that analysis is free.
  const handleUnlockPass = (_productKey: PassProductKey) => { setUnlockTier("active"); };

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
    const lines: string[] = [];
    if (result.docFeeAssessment) {
      const line = docFeeSurfaceCopy(result.docFeeAssessment).scorecardLine;
      if (line) lines.push(line);
    }
    for (const item of result.missingInfo) {
      if (lines.length >= 3) break;
      lines.push(sanitizeIssueLabel(item.field));
    }
    return lines.slice(0, 3);
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
        factoryWindowStickerMsrp: parseFactoryWindowStickerMsrp(data.factoryWindowStickerMsrp),
        californiaDmvBusinessPartner: optionalBoolean(data.californiaDmvBusinessPartner),
        oregonIntegratorElection: optionalBoolean(data.oregonIntegratorElection),
        pennsylvaniaElectronicProcessing: optionalBoolean(data.pennsylvaniaElectronicProcessing),
        ...buyerRequestFields(data),
        sessionId: getSessionId(),
        language: "en" as "en" | "es",
        ...(isSyntheticSubmission({
          dealerText: data.dealerText,
          competingQuoteText: data.competingQuoteText,
        }) ? { synthetic: true as const } : {}),
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
        const submission = submissionAnalyticsInput(form.getValues());
        captureSubmissionEvent(submission, "analysis_completed", { result_available: true });
        trackSubmissionEvent(submission, "analysis_complete", {
          dealScore: data.verdictLabel,
          confidence: String(data.confidenceLevel ?? ""),
        });
      }
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "unknown_error";
      const submission = submissionAnalyticsInput(form.getValues());
      captureSubmissionEvent(submission, "analysis_failed", { errorMessage });
      trackSubmissionEvent(submission, "analysis_failed", { errorMessage });

      // The apiRequest helper throws errors with format "STATUS: JSON_BODY".
      // Parse the body to detect content-relevance rejections and show a
      // nuanced toast instead of the raw error string.
      let title = "Analysis Failed";
      let description: string = error instanceof Error ? error.message : "Something went wrong";
      try {
        const bodyMatch = errorMessage.match(/^\d+:\s*(.+)$/s);
        if (bodyMatch) {
          const parsed = JSON.parse(bodyMatch[1]);
          if (parsed.error === "content_not_relevant") {
            title = "Not a Dealer Quote";
            description = parsed.message;
          }
        }
      } catch {
        // Fall through to default message
      }

      toast({ title, description, variant: "destructive" });
    },
  });

  const onSubmit = (data: FormValues) => {
    setResult(null);
    setShowDoneState(false);
    resultFiredRef.current = false;
    const submission = submissionAnalyticsInput(data);
    trackSubmissionEvent(submission, "analyze_start");
    captureSubmissionEvent(submission, "analysis_submitted", {
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
            Paste a dealer quote, email, or text message. Odigos checks whether charges are disclosed, whether the totals reconcile, and whether a fee exceeds a verified state cap. Factory MSRP comparison and independent market valuation are different. An optional factory window sticker MSRP is compared with the selling price and does not verify market value. That figure is not a live market transaction price.
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
            <li>Verdict: GO, PROCEED WITH CAUTION, INSUFFICIENT INFORMATION, or NO-GO</li>
            <li>Separate checks for disclosure, math, verified fee rules, and market value</li>
            <li>Pricing terms found in the quote</li>
            <li>A dealer reply limited to those findings</li>
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
                {isMobile ? (
                  /* ── Mobile: textarea-first with camera action ── */
                  <div className="space-y-4" data-testid="mobile-input-surface">
                    {/* Hidden camera file input — opens rear camera via capture="environment" */}
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleCameraCapture}
                      aria-label="Take a photo of your dealer quote"
                      data-testid="input-camera-capture"
                    />
                    {/* Hidden standard file input for upload */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp,.pdf"
                      className="hidden"
                      onChange={handleFileUpload}
                      aria-label="Upload a screenshot or PDF"
                      data-testid="input-file-upload"
                    />

                    {/* Textarea — always visible, always primary */}
                    <FormField
                      control={form.control}
                      name="dealerText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-foreground">
                            Paste, upload, or snap your dealer quote
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              onFocus={() => handleFormStart()}
                              onChange={(e) => {
                                field.onChange(e);
                                if (uploadError) setUploadError(null);
                                if (imageIntakeStatus !== "idle" && imageIntakeStatus !== "processing") {
                                  setImageIntakeStatus("idle");
                                }
                              }}
                              onInput={() => {
                                if (!inputStartedRef.current) {
                                  inputStartedRef.current = true;
                                  captureIfReal("analysis_input_started", { input_method: "typing" });
                                }
                              }}
                              onPaste={() => {
                                if (!inputStartedRef.current) {
                                  inputStartedRef.current = true;
                                  captureIfReal("analysis_input_started", { input_method: "paste" });
                                }
                              }}
                              placeholder="Paste the dealer's email, text message, or quote — any format works"
                              className="min-h-36 text-base resize-y"
                              data-testid="input-dealer-text"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Camera + Upload actions */}
                    <div className="flex gap-2" data-testid="mobile-action-buttons">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        disabled={uploadLoading}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border/80 bg-muted/30 hover:bg-muted/50 hover:border-foreground/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed py-3 px-4 min-h-[48px]"
                        aria-label="Take a photo of your dealer quote"
                        data-testid="button-camera-capture"
                      >
                        {uploadLoading && imageIntakeStatus === "processing" ? (
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground shrink-0" />
                        ) : (
                          <Camera className="h-5 w-5 text-muted-foreground shrink-0" />
                        )}
                        <span className="text-sm font-medium text-foreground">
                          {uploadLoading && imageIntakeStatus === "processing" ? "Processing..." : "Take Photo"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadLoading}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border/80 bg-muted/30 hover:bg-muted/50 hover:border-foreground/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed py-3 px-4 min-h-[48px]"
                        aria-label="Upload a screenshot or PDF"
                        data-testid="button-upload-file"
                      >
                        <Upload className="h-5 w-5 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium text-foreground">Upload</span>
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground" data-testid="text-input-guidance">
                      Works with worksheets, screenshots, buyer's orders, and handwritten dealer notes. You can edit the extracted text before analyzing.
                    </p>

                    {/* Image intake status messages */}
                    {uploadError && (
                      <p className="text-xs text-destructive" role="alert" data-testid="text-upload-error">
                        {uploadError}
                      </p>
                    )}
                    {imageIntakeStatus === "success" && !uploadError && (
                      <p className="text-xs text-green-600" role="status" data-testid="text-ocr-success">
                        Text extracted — review and edit above, then analyze.
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground" data-testid="text-privacy-reassurance">
                      Your information is not shared with any dealership. This is an independent analysis.
                    </p>
                  </div>
                ) : (
                  /* ── Desktop: tabbed input (Paste | Upload | URL) ── */
                  <Tabs value={inputTab} onValueChange={(v) => setInputTab(v as "paste" | "upload" | "url")} className="w-full" data-testid="tabs-input-mode">
                    <TabsList className="w-full flex h-11 mb-4" data-testid="tabs-input-mode-list">
                      <TabsTrigger value="paste" className="flex-1 text-sm font-medium" data-testid="tab-paste-text">
                        <FileText className="h-4 w-4 mr-2" />
                        Paste Text
                      </TabsTrigger>
                      <TabsTrigger value="upload" className="flex-1 text-sm font-medium" data-testid="tab-upload">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </TabsTrigger>
                      <TabsTrigger value="url" className="flex-1 text-sm font-medium" data-testid="tab-url">
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Listing URL
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
                                    captureIfReal("analysis_input_started", { input_method: "typing" });
                                  }
                                }}
                                onPaste={() => {
                                  if (!inputStartedRef.current) {
                                    inputStartedRef.current = true;
                                    captureIfReal("analysis_input_started", { input_method: "paste" });
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
                            {uploadLoading ? "Processing file..." : "Upload a screenshot or PDF of the dealer quote"}
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
                    <TabsContent value="url" className="mt-0">
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="https://www.dealer-website.com/listing/..."
                            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            disabled={urlLoading}
                            data-testid="input-url"
                          />
                          <Button
                            type="button"
                            onClick={handleUrlExtract}
                            disabled={urlLoading || !urlInput.trim()}
                            variant="outline"
                            size="default"
                            data-testid="button-fetch-url"
                          >
                            {urlLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Fetch"
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Paste a dealer listing URL and we'll extract the pricing details automatically.
                        </p>
                        {urlError && (
                          <p className="text-xs text-destructive" data-testid="text-url-error">
                            {urlError}
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>

            <FormField
              control={form.control}
              name="factoryWindowStickerMsrp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Factory Window Sticker MSRP (optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={1000}
                      step="0.01"
                      inputMode="decimal"
                      placeholder="e.g., 28700"
                      data-testid="input-factory-window-sticker-msrp"
                      onFocus={() => trackIfReal("form_focus", { fieldName: "factory_window_sticker_msrp" })}
                    />
                  </FormControl>
                  <FormDescription data-testid="text-factory-window-sticker-help">
                    A manufacturer Monroney sticker MSRP compares the selling price with that sticker. A dealer-printed addendum is not the factory window sticker. This does not verify market value. Independent market valuation is a separate check and stays unverified unless a third-party source is configured.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card data-testid="section-buyer-price-checks">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Your own price checks (optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-buyer-reported-disclosure">
                  These numbers are buyer-reported. Odigos does not look them up and does not treat them as a verified market value. They cannot turn the result into a GO on their own. If your price is above every listing you type, that can add a caution. The dollar gap is not guaranteed savings.
                </p>

                <FormField
                  control={form.control}
                  name="vin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VIN (optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          maxLength={17}
                          autoCapitalize="characters"
                          spellCheck={false}
                          placeholder="17 characters, no I, O, or Q"
                          data-testid="input-vin"
                          onFocus={() => trackIfReal("form_focus", { fieldName: "vin" })}
                        />
                      </FormControl>
                      <FormDescription>
                        If the quote already includes a VIN, you can leave this blank and we will use that one. We check it with the free NHTSA decoder to see whether the year, make, model, and trim match the quote. This does not price the car.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Similar cars you found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter 1 to 5 asking prices. A site name, a link, and mileage are optional. We do not open the links. This is not a verified market value.
                    </p>
                  </div>
                  {listingFields.fields.map((row, index) => (
                    <div key={row.id} className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-md border border-border/60 p-3">
                      <FormField
                        control={form.control}
                        name={`comps.${index}.askingPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Asking price</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min={1} inputMode="decimal" placeholder="e.g., 27900" data-testid={`input-comp-price-${index}`} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`comps.${index}.mileage`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mileage (optional)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min={0} inputMode="numeric" placeholder="e.g., 32000" data-testid={`input-comp-mileage-${index}`} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`comps.${index}.source`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Where you saw it (optional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., dealer site" data-testid={`input-comp-source-${index}`} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`comps.${index}.url`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Link (optional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://..." data-testid={`input-comp-url-${index}`} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="sm:col-span-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => listingFields.remove(index)} data-testid={`button-remove-listing-${index}`}>
                          Remove this listing
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={listingFields.fields.length >= 5}
                    onClick={() => listingFields.append({ askingPrice: "", source: "", url: "", mileage: "" })}
                    data-testid="button-add-listing"
                  >
                    Add a listing
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="buyerBookAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Book value you looked up (optional)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min={1} inputMode="decimal" placeholder="e.g., 27500" data-testid="input-book-value" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="buyerBookSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Where you saw that number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., KBB or Edmunds" data-testid="input-book-source" />
                        </FormControl>
                        <FormDescription>
                          Type the number you saw in your own browser. Odigos does not visit those sites, and this number is not verified.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="competingQuoteText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Another dealer quote (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="min-h-28"
                          placeholder="Paste a second quote. Include the selling price, doc fee, add-ons, tax, and out-the-door total if you have them."
                          data-testid="input-competing-quote"
                        />
                      </FormControl>
                      <FormDescription>
                        We compare selling price, documentation fee, add-ons, tax and government fees, and the out-the-door total. This is a comparison of the two quotes you pasted, not a market valuation.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Collapsible
              open={isOptionalOpen}
              onOpenChange={(open) => {
                setIsOptionalOpen(open);
                if (open) {
                  captureIfReal("optional_details_expanded");
                  trackIfReal("optional_details_expanded");
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
                                onFocus={() => trackIfReal("form_focus", { fieldName: "vehicle" })}
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
                                onFocus={() => trackIfReal("form_focus", { fieldName: "zip_code" })}
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="californiaDmvBusinessPartner"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>California DMV business partner</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-ca-dmv-partner">
                                  <SelectValue placeholder="Not stated" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="unspecified">Not stated</SelectItem>
                                <SelectItem value="yes">Yes, the dealer is a partner</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>Only if the quote or the dealer said so. Odigos does not guess.</FormDescription>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="oregonIntegratorElection"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Oregon integrator election</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-or-integrator">
                                  <SelectValue placeholder="Not stated" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="unspecified">Not stated</SelectItem>
                                <SelectItem value="yes">Purchaser elects an integrator</SelectItem>
                                <SelectItem value="no">Purchaser elects no integrator</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="pennsylvaniaElectronicProcessing"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pennsylvania electronic processing</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-pa-electronic">
                                  <SelectValue placeholder="Not stated" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="unspecified">Not stated</SelectItem>
                                <SelectItem value="yes">Electronic</SelectItem>
                                <SelectItem value="no">Not electronic</SelectItem>
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
                                  onFocus={() => trackIfReal("form_focus", { fieldName: "apr" })}
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
                                  onFocus={() => trackIfReal("form_focus", { fieldName: "term_months" })}
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
                                  onFocus={() => trackIfReal("form_focus", { fieldName: "down_payment" })}
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
            {!consentChecked && (
              <div className="mb-4 p-3 rounded-lg border border-border/60 bg-muted/30" data-testid="section-upload-consent">
                <label className="flex gap-3 cursor-pointer items-start" htmlFor="upload-consent-checkbox">
                  <input
                    id="upload-consent-checkbox"
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-border accent-primary flex-shrink-0"
                    defaultChecked={false}
                    onChange={(e) => {
                      if (e.target.checked) {
                        try { localStorage.setItem("odigos_upload_consent", "accepted"); } catch {}
                        setConsentChecked(true);
                      }
                    }}
                    data-testid="checkbox-upload-consent"
                  />
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    By analyzing, I agree that anonymized pricing signals from my submission may be used to improve Odigos. No personal info is retained beyond 90 days.{" "}
                    <a href="/terms#data-license" className="underline hover:text-foreground transition-colors">Learn more</a>
                  </span>
                </label>
              </div>
            )}
            <Button
              variant="cta"
              type="submit"
              size="lg"
              className="w-full"
              disabled={analyzeMutation.isPending || showDoneState || !consentChecked}
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
            <AnalysisProgressBar isPending={analyzeMutation.isPending} />
            {analyzeMutation.isPending ? (
              <p className="text-xs text-muted-foreground text-center mt-2" data-testid="text-what-happens-next">
                Still working — this is normal and usually takes 40–60 seconds. Stay on this page.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground text-center mt-2" data-testid="text-what-happens-next">
                Results usually take about 40–60 seconds and will appear below.
              </p>
            )}
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
            <p className="text-sm font-medium text-muted-foreground mb-2">What this audit checks</p>
            <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
              <li>Whether the charges in the quote are itemized</li>
              <li>Whether the out-the-door total and payment reconcile</li>
              <li>Whether a documentation fee exceeds a verified state cap</li>
              <li>Factory MSRP comparison and independent market valuation are different. Entering a factory MSRP does not verify market value</li>
              <li>A VIN can be checked with the free NHTSA decoder. Listings, a book value, and a second quote that you type stay buyer-reported and do not verify market value</li>
            </ul>
          </div>
        )}

        {result && (
          <div ref={resultsRef} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-sm text-center text-muted-foreground" data-testid="banner-free-access">
              Full analysis is free. No pass or payment required.
            </p>
            <div className="border-t border-border/50 pt-8 space-y-6">
              <h2 className="text-sm font-medium text-muted-foreground text-center uppercase tracking-wider">Your deal analysis</h2>

              {/* 1) Financial impact hero — dollars first, always visible */}
              <FinancialImpactHeroComponent
                overpaymentMin={result.estimatedOverpaymentMin}
                overpaymentMax={result.estimatedOverpaymentMax}
                confidence={result.financialImpactConfidence ?? null}
                financialSummary={result.financialSummary}
                marketValueStatus={result.marketValueStatus}
                benchmarkKind={result.marketBenchmarkKind}
                sourceReference={result.marketValueStatus === "verified" ? result.marketValuation?.reference ?? null : null}
                fallbackSummary={
                  result.marketValueStatus === "unverified"
                    ? "Market value not verified. Savings are not estimated."
                    : result.summary
                }
              />

              {/* 1.5) Statutory cap violation — urgent legal callout with action */}
              <StatutoryCapCalloutComponent
                docFeeCapCheck={result.docFeeCapCheck}
                docFeeAssessment={result.docFeeAssessment}
              />

              {/* 2) Verdict — moved up for immediate clarity */}
              <DealScoreBadge
                score={result.dealScore}
                goNoGo={result.goNoGo}
                confidenceLevel={result.confidenceLevel}
                verdictLabel={result.verdictLabel}
              />

              <BuyerReportedCard vinCheck={result.vinCheck} buyerReported={result.buyerReported} />

              {result.dimensions && (
                <Card data-testid="analysis-dimensions">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Separate checks</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {(
                      [
                        ["Pricing transparency", result.dimensions.pricingTransparency],
                        ["Mathematical accuracy", result.dimensions.mathematicalAccuracy],
                        ["Regulatory compliance", result.dimensions.regulatoryCompliance],
                        ["Market competitiveness", result.dimensions.marketCompetitiveness],
                        ["Negotiation opportunities", result.dimensions.negotiationOpportunities],
                        ["Information completeness", result.dimensions.informationCompleteness],
                      ] as const
                    ).map(([label, dimension]) => (
                      <p key={label}>
                        <span className="font-medium text-foreground">{label}: </span>
                        <span className="text-muted-foreground">{dimension.summary}</span>
                      </p>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* 2.5) Ranked signals — deterministic, action-oriented negotiation moves */}
              {result.rankedSignals && result.rankedSignals.length > 0 && (
                <SignalActionCard signals={result.rankedSignals} maxVisible={3} />
              )}

              {/* 3) Biggest problem — the single primary issue */}
              <BiggestIssueCard primaryIssue={result.primaryIssue} />

              {/* 4) Market Intelligence — moved up from position 12 */}
              {result.marketContext && (
                <MarketIntelligenceCard
                  marketContext={result.marketContext}
                  marketSignals={result.marketSignals}
                  dealerSeenBefore={result.dealerSeenBefore}
                  dealerPriorQuoteCount={result.dealerPriorQuoteCount}
                  dealerPatternSummary={result.dealerPatternSummary}
                />
              )}

              {/* 5) What to say back — THE solution, not a side feature */}
              <NegotiationActionCard
                suggestedReply={result.suggestedReply}
                missingInfo={result.missingInfo}
                confidenceLevel={result.confidenceLevel}
                verdictLabel={result.verdictLabel}
                unlockTier={unlockTier}
                onCopyQuestions={() => toast({ title: "Questions copied to clipboard" })}
                onUnlock={(productKey) => handleUnlockPass(productKey)}
                isLoading={checkoutLoading || isCheckingPayment}
                loadingProduct={loadingProduct}
                stripeConfigured={stripeConfigured}
              />

              {/* 6) Share actions */}
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
                      captureIfReal("copy_summary", { verdict: result.goNoGo });
                      trackIfReal("copy_summary");
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
                      captureIfReal("scorecard_downloaded", { verdict: result.goNoGo });
                      trackIfReal("scorecard_downloaded");
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

              {/* 7) Supporting details — collapsible */}
              <details className="group" data-testid="section-supporting-details">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground flex items-center gap-2 py-3 select-none">
                  <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                  Full analysis details
                </summary>
                <div className="space-y-6 pt-4">
                  <MarketComparisonBlock
                    marketComparison={result.marketComparison}
                    marketContext={result.marketContext ?? null}
                    detectedDocFee={
                      (result.detectedFields?.fees ?? [])
                        .find((f) => /doc.?fee|document/i.test(f.name))?.amount ?? null
                    }
                  />

                  <ExpectedNormalRangeCard
                    normalOtdMin={result.estimatedNormalOtdMin}
                    normalOtdMax={result.estimatedNormalOtdMax}
                    marketValueStatus={result.marketValueStatus}
                    benchmarkKind={result.marketBenchmarkKind}
                    msrpSummary={result.msrpComparison?.status === "compared" ? result.msrpComparison.summary : null}
                  />

                  <LeaseMathBlock leaseMath={result.leaseMath} />

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

                  <DetectedFieldsCard fields={result.detectedFields} flaggedItemEvidence={result.flaggedItemEvidence} />

                  <p className="text-xs text-muted-foreground" data-testid="text-market-context-disclosure">
                    {result.marketContextStrength === "strong" || result.marketContextStrength === "moderate"
                      ? "This analysis includes local market data."
                      : result.marketContextStrength === "thin"
                      ? "This analysis uses limited local market data."
                      : "This analysis is based on general pricing knowledge (limited local data available)."}
                  </p>
                </div>
              </details>
            </div>

            {/* 8) Email / Paywall. Shown only when the server issued a token,
                which requires ALERT_SMTP_URL and a signing secret. */}
            {result.emailToken && (
              <EmailPreviewForm analysisResult={result} />
            )}

            {unlockTier === "free" ? (
              <>
                {checkoutClientSecret ? (
                  <Suspense fallback={<div className="text-center py-4 text-sm text-muted-foreground">Loading checkout...</div>}>
                    <StripeEmbeddedCheckoutWrapper
                      clientSecret={checkoutClientSecret}
                      onClose={() => setCheckoutClientSecret(null)}
                    />
                  </Suspense>
                ) : (
                  <PaywallCards
                    onUnlock={(productKey) => handleUnlockPass(productKey)}
                    isLoading={checkoutLoading || isCheckingPayment}
                    loadingProduct={loadingProduct}
                    stripeConfigured={stripeConfigured}
                    carBuyerCtaLabel={unlockCtaLabel}
                  />
                )}
              </>
            ) : (
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
            )}

            {/* 12) Feedback widget with progressive disclosure */}
            {result.listingId && (
              <FeedbackWidgetComponent listingId={result.listingId} />
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
