import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { trackPageView, trackFormStart, trackFormFocus } from "@/lib/tracking";
import { 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  Copy, 
  Check, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  DollarSign,
  FileText,
  MessageSquare,
  Info,
  Lock
} from "lucide-react";
import logoImage from "@assets/odigos_logo.png";
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
import type { AnalysisResponse, DetectedFields, MissingInfo, ConfidenceLevel } from "@shared/schema";

const formSchema = z.object({
  dealerText: z.string().min(1, "Please paste dealer text to analyze"),
  condition: z.enum(["unknown", "new", "used"]),
  vehicle: z.string().optional(),
  zipCode: z.string().optional(),
  purchaseType: z.enum(["unknown", "cash", "finance", "lease"]),
  apr: z.string().optional(),
  termMonths: z.string().optional(),
  downPayment: z.string().optional(),
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
}

function DealScoreBadge({ score, goNoGo, confidenceLevel, verdictLabel }: DealScoreBadgeProps) {
  const scoreConfig = {
    GREEN: {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      border: "border-emerald-500/30",
      text: "text-emerald-700 dark:text-emerald-400",
      icon: CheckCircle2,
    },
    YELLOW: {
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      border: "border-amber-500/30",
      text: "text-amber-700 dark:text-amber-400",
      icon: AlertTriangle,
    },
    RED: {
      bg: "bg-red-500/10 dark:bg-red-500/20",
      border: "border-red-500/30",
      text: "text-red-700 dark:text-red-400",
      icon: XCircle,
    },
  };

  const confidenceConfig = {
    HIGH: { label: "High Confidence", color: "text-emerald-600 dark:text-emerald-400" },
    MEDIUM: { label: "Medium Confidence", color: "text-amber-600 dark:text-amber-400" },
    LOW: { label: "Low Confidence", color: "text-red-600 dark:text-red-400" },
  };

  const goNoGoMessages = {
    "GO": "This deal appears reasonable. Consider visiting the dealership.",
    "NO-GO": "Red flags detected. We recommend looking elsewhere.",
    "NEED-MORE-INFO": "Get answers to the questions below before visiting.",
  };

  const config = scoreConfig[score];
  const confConfig = confidenceConfig[confidenceLevel];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border-2 ${config.border} ${config.bg} p-8 text-center`}>
      <div className="flex items-center justify-center gap-3 mb-2">
        <Icon className={`w-12 h-12 ${config.text}`} />
        <span className={`text-5xl font-bold ${config.text}`}>{score}</span>
      </div>
      <p className={`text-lg font-semibold ${config.text} mb-3`}>{verdictLabel}</p>
      <div className="flex items-center justify-center gap-4 mb-3">
        <div className={`inline-block px-4 py-2 rounded-lg ${config.bg} border ${config.border}`}>
          <span className={`text-xl font-bold ${config.text}`}>{goNoGo}</span>
        </div>
        <span className={`text-sm font-medium ${confConfig.color}`}>
          {confConfig.label}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        {goNoGoMessages[goNoGo]}
      </p>
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
}

function LockedTier2Section({ onUnlock, isLoading, stripeConfigured }: LockedTier2Props) {
  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lock className="w-5 h-5 text-amber-500" />
          Unlock Full Deal Review
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          See what's missing, what's risky, and exactly what to ask the dealer.
        </p>
        <ul className="space-y-2 mb-4">
          {[
            "Red flags and risks in this deal",
            "Missing information to request",
            "Copy-paste reply for the dealer",
            "Full analysis reasoning"
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
            "Unlock Full Deal Review — $49 (one-time)"
          )}
        </Button>
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

export default function Home() {
  const [isOptionalOpen, setIsOptionalOpen] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [unlockTier, setUnlockTier] = useState<UnlockTier>(getStoredTier);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [formStartTracked, setFormStartTracked] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    trackPageView("/analyze");
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
    },
  });

  const { data: stripeStatus } = useQuery<{ configured: boolean }>({
    queryKey: ["/api/stripe-status"],
  });

  const stripeConfigured = stripeStatus?.configured ?? false;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const example = params.get("example");
    
    if (example === "good") {
      form.setValue("dealerText", SAMPLE_GOOD_DEAL);
      window.history.replaceState({}, "", window.location.pathname);
    } else if (example === "bad") {
      form.setValue("dealerText", SAMPLE_BAD_DEAL);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [form]);

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

  const handleUnlockTier = async () => {
    setCheckoutLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/checkout", { product: "deal_clarity" });
      const data = await response.json();
      
      if (data.error === "PAYMENTS_NOT_CONFIGURED") {
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
      toast({
        title: "Checkout Error",
        description: "Could not start checkout. Please try again.",
        variant: "destructive",
      });
      setCheckoutLoading(false);
    }
  };

  const purchaseType = form.watch("purchaseType");

  const analyzeMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const payload = {
        dealerText: data.dealerText,
        condition: data.condition,
        vehicle: data.vehicle || undefined,
        zipCode: data.zipCode || undefined,
        purchaseType: data.purchaseType,
        apr: data.apr ? parseFloat(data.apr) : undefined,
        termMonths: data.termMonths ? parseInt(data.termMonths) : undefined,
        downPayment: data.downPayment ? parseFloat(data.downPayment) : undefined,
      };
      const response = await apiRequest("POST", "/api/analyze", payload);
      return response.json() as Promise<AnalysisResponse>;
    },
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    setResult(null);
    analyzeMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center gap-2">
          <a href="/">
            <img src={logoImage} alt="Odigos" className="h-28 w-auto cursor-pointer" data-testid="link-logo-home" />
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Paste Dealer Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button
                    type="button"
                    variant="outline"
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
                <FormField
                  control={form.control}
                  name="dealerText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Dealer text</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          onFocus={() => handleFormStart()}
                          placeholder="Paste dealer texts, emails, or quotes here..."
                          className="min-h-48 text-base resize-y"
                          data-testid="input-dealer-text"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Collapsible open={isOptionalOpen} onOpenChange={setIsOptionalOpen}>
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

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={analyzeMutation.isPending}
              data-testid="button-analyze"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Deal...
                </>
              ) : (
                "Analyze Deal"
              )}
            </Button>
          </form>
        </Form>

        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-t border-border/50 pt-8">
              <h2 className="text-xl font-semibold mb-6 text-center">Analysis Results</h2>
              
              <DealScoreBadge 
                score={result.dealScore} 
                goNoGo={result.goNoGo}
                confidenceLevel={result.confidenceLevel}
                verdictLabel={result.verdictLabel}
              />
            </div>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  What This Deal Likely Means
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-relaxed text-muted-foreground" data-testid="text-summary">
                  {result.summary}
                </p>
              </CardContent>
            </Card>

            <DetectedFieldsCard fields={result.detectedFields} />

            {unlockTier === "free" ? (
              <LockedTier2Section
                onUnlock={() => handleUnlockTier()}
                isLoading={checkoutLoading || isCheckingPayment}
                stripeConfigured={stripeConfigured}
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
          </div>
        )}
      </main>

      <footer className="border-t border-border/50 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Odigos provides estimates based on the information you share. 
            Always verify details directly with the dealership.
          </p>
        </div>
      </footer>
    </div>
  );
}
