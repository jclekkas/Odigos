"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Loader2,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  MessageSquareText,
  Lock,
  ArrowRight,
  Shield
} from "lucide-react";

// Sample quotes for demo
const SAMPLE_GOOD_DEAL = `Hey! Confirming we can do $32,245.18 out-the-door on a 2026 Kia Sportage LX AWD with 1.99% APR for 60 months (tier 1 credit). Taxes and fees included. Let me know what time you can come in and we'll have the buyer's order ready.`;

const SAMPLE_BAD_DEAL = `Hey my friend!! Great news!!!
We can get you driving TODAY for only $589/month
No worries about price details, we'll explain everything when you get here.
APR depends on credit but it will be competitive!
Low down payment options available.
We added some protection packages that everyone gets, but we can talk about that later.
Let me know what time you're coming in today!!!`;

// Mock analysis result for preview
const MOCK_RESULT = {
  score: "YELLOW" as const,
  goNoGo: "NEED-MORE-INFO" as const,
  confidenceLevel: "MEDIUM" as const,
  verdictLabel: "Needs Clarification",
  detectedFields: {
    monthlyPayment: 589,
    salePrice: null,
    msrp: null,
    rebates: null,
    outTheDoorPrice: null,
    tradeInValue: null,
    apr: null,
    termMonths: null,
    downPayment: null,
    fees: []
  },
  missingInfo: [
    { field: "Out-the-door price", question: "What is the total out-the-door price including all taxes and fees?" },
    { field: "APR", question: "What is the exact APR for the financing?" },
    { field: "Loan term", question: "What is the loan term in months?" },
    { field: "Protection packages", question: "What protection packages are included and what do they cost individually?" }
  ],
  suggestedReply: "Hi, thanks for reaching out. Before I come in, I'd like to get a few details in writing:\n\n1. What is the total out-the-door price including all taxes, fees, and any add-ons?\n2. What is the exact APR for financing?\n3. What is the loan term?\n4. Can you itemize any protection packages that are included?\n\nI appreciate your help getting these details. Thanks!"
};

type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

interface VerdictDisplayProps {
  score: "GREEN" | "YELLOW" | "RED";
  confidenceLevel: ConfidenceLevel;
  verdictLabel: string;
}

function VerdictDisplay({ score, confidenceLevel, verdictLabel }: VerdictDisplayProps) {
  const scoreConfig = {
    GREEN: {
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      border: "border-emerald-200 dark:border-emerald-800/50",
      text: "text-emerald-700 dark:text-emerald-400",
      icon: CheckCircle2,
      message: "This quote appears complete and straightforward.",
    },
    YELLOW: {
      bg: "bg-amber-50 dark:bg-amber-950/30",
      border: "border-amber-200 dark:border-amber-800/50",
      text: "text-amber-700 dark:text-amber-500",
      icon: AlertCircle,
      message: "Some details need clarification before you proceed.",
    },
    RED: {
      bg: "bg-red-50 dark:bg-red-950/30",
      border: "border-red-200 dark:border-red-800/50",
      text: "text-red-700 dark:text-red-400",
      icon: XCircle,
      message: "This quote has significant concerns. Proceed with caution.",
    },
  };

  const confidenceLabels = {
    HIGH: "High confidence",
    MEDIUM: "Medium confidence",
    LOW: "Low confidence - limited information provided",
  };

  const config = scoreConfig[score];
  const Icon = config.icon;

  return (
    <div className={`rounded-2xl border ${config.border} ${config.bg} p-6 md:p-8`}>
      <div className="flex flex-col items-center text-center">
        <Icon className={`w-12 h-12 ${config.text} mb-3`} />
        <h3 className={`text-2xl md:text-3xl font-semibold ${config.text} mb-1`}>
          {verdictLabel}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {confidenceLabels[confidenceLevel]}
        </p>
        <p className={`text-base ${config.text}`}>
          {config.message}
        </p>
      </div>
    </div>
  );
}

interface DetectedFields {
  salePrice: number | null;
  msrp: number | null;
  rebates: number | null;
  outTheDoorPrice: number | null;
  monthlyPayment: number | null;
  tradeInValue: number | null;
  apr: number | null;
  termMonths: number | null;
  downPayment: number | null;
  fees: { name: string; amount: number | null }[];
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

  const specifiedItems = items.filter(item => item.value != null);
  const unspecifiedItems = items.filter(item => item.value == null);

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <FileText className="w-4 h-4 text-muted-foreground" />
        What we found in your quote
      </h3>
      
      {specifiedItems.length > 0 && (
        <div className="space-y-2 mb-4">
          {specifiedItems.map((item) => (
            <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="text-sm font-medium text-foreground font-mono">
                {item.format(item.value)}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {unspecifiedItems.length > 0 && (
        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-2">Not found in quote:</p>
          <div className="flex flex-wrap gap-2">
            {unspecifiedItems.map((item) => (
              <span key={item.label} className="text-xs px-2 py-1 rounded-md bg-muted/50 text-muted-foreground">
                {item.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface MissingInfo {
  field: string;
  question: string;
}

function QuestionsToAsk({ items }: { items: MissingInfo[] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const questions = items.map((item) => item.question).join("\n\n");
    navigator.clipboard.writeText(questions);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
      <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-primary" />
        Questions to ask before you visit
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Send these to the dealer to get the full picture.
      </p>
      <ul className="space-y-3 mb-5">
        {items.map((item, idx) => (
          <li key={idx} className="flex gap-3">
            <span className="shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-medium flex items-center justify-center mt-0.5">
              {idx + 1}
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">{item.field}</p>
              <p className="text-sm text-muted-foreground">{item.question}</p>
            </div>
          </li>
        ))}
      </ul>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="w-full rounded-xl"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Copied to clipboard
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            Copy questions
          </>
        )}
      </Button>
    </div>
  );
}

function UnlockSection() {
  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">
            Unlock full analysis
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            See the complete breakdown, missing information, and a ready-to-send response for the dealer.
          </p>
          <ul className="space-y-2 mb-5">
            {[
              "Complete red flag breakdown",
              "Missing information checklist",
              "Copy-paste dealer response",
              "Full analysis reasoning"
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
          <Button className="w-full rounded-xl">
            Unlock for $49
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-3">
            One-time payment. Secure checkout via Stripe.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  const [dealerText, setDealerText] = useState("");
  const [isOptionalOpen, setIsOptionalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<typeof MOCK_RESULT | null>(null);

  const handleAnalyze = async () => {
    if (!dealerText.trim()) return;
    
    setIsAnalyzing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setResult(MOCK_RESULT);
    setIsAnalyzing(false);
  };

  const loadExample = (type: "good" | "bad") => {
    setDealerText(type === "good" ? SAMPLE_GOOD_DEAL : SAMPLE_BAD_DEAL);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-lg font-semibold text-foreground">Odigos</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-primary/70" />
            <span className="hidden sm:inline">Independent analysis</span>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
              Analyze your dealer quote
            </h1>
            <p className="text-muted-foreground">
              Paste the message exactly as you received it.
            </p>
          </div>

          {/* Input Form */}
          <div className="space-y-4 mb-8">
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <label className="block text-sm font-medium text-foreground mb-3">
                Dealer text, email, or quote
              </label>
              <textarea
                value={dealerText}
                onChange={(e) => setDealerText(e.target.value)}
                placeholder="Paste the dealer's message here..."
                className="w-full h-40 px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-muted-foreground">Try an example:</span>
                <button
                  type="button"
                  onClick={() => loadExample("good")}
                  className="text-xs text-primary hover:underline"
                >
                  Good quote
                </button>
                <span className="text-xs text-muted-foreground">·</span>
                <button
                  type="button"
                  onClick={() => loadExample("bad")}
                  className="text-xs text-primary hover:underline"
                >
                  Vague quote
                </button>
              </div>
            </div>

            {/* Optional Details */}
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
              <button
                type="button"
                onClick={() => setIsOptionalOpen(!isOptionalOpen)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/30 transition-colors"
              >
                <span className="text-sm font-medium text-foreground">Optional details</span>
                {isOptionalOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              {isOptionalOpen && (
                <div className="px-6 pb-6 space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Adding context helps us give you a more accurate analysis.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Vehicle</label>
                      <input
                        type="text"
                        placeholder="e.g., 2026 Honda CR-V"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">ZIP Code</label>
                      <input
                        type="text"
                        placeholder="e.g., 90210"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={!dealerText.trim() || isAnalyzing}
              className="w-full h-12 rounded-xl text-base font-medium"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze Quote
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-6">
              <VerdictDisplay
                score={result.score}
                confidenceLevel={result.confidenceLevel}
                verdictLabel={result.verdictLabel}
              />
              
              <DetectedFieldsCard fields={result.detectedFields} />
              
              <QuestionsToAsk items={result.missingInfo} />
              
              <UnlockSection />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
