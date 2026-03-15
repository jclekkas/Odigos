import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Link } from "wouter";
import { trackPageView, trackFormStart, trackFormFocus } from "@/lib/tracking";
import { setSeoMeta } from "@/lib/seo";
import { 
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
  Info,
  Lock,
  ArrowRight,
  Shield,
  ChevronLeft
} from "lucide-react";
import logoImage from "@assets/odigos_logo.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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

interface VerdictDisplayProps {
  score: "GREEN" | "YELLOW" | "RED";
  goNoGo: "GO" | "NO-GO" | "NEED-MORE-INFO";
  confidenceLevel: ConfidenceLevel;
  verdictLabel: string;
}

function VerdictDisplay({ score, goNoGo, confidenceLevel, verdictLabel }: VerdictDisplayProps) {
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
      
      {fields.fees && fields.fees.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border/30">
          <h4 className="text-sm font-medium mb-3 text-foreground">Fees mentioned</h4>
          <div className="space-y-2">
            {fields.fees.map((fee, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 bg-muted/20 rounded-lg px-3">
                <span className="text-sm text-muted-foreground">{fee.name}</span>
                <span className="text-sm font-mono font-medium text-foreground">
                  {fee.amount != null ? formatCurrency(fee.amount) : "Amount unclear"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface QuestionsToAskProps {
  items: MissingInfo[];
  confidenceLevel: ConfidenceLevel;
  onCopy: () => void;
}

function QuestionsToAsk({ items, confidenceLevel, onCopy }: QuestionsToAskProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const questions = items.map((item) => item.question).join("\n\n");
    navigator.clipboard.writeText(questions);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy();
  };

  if (items.length === 0 || confidenceLevel === "HIGH") return null;

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
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-medium flex items-center justify-center mt-0.5">
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

function SuggestedReplyCard({ reply }: { reply: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
        <MessageSquareText className="w-4 h-4 text-muted-foreground" />
        Suggested response to dealer
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Copy and customize this reply before sending.
      </p>
      <div className="bg-muted/30 rounded-xl p-4 mb-4">
        <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">{reply}</p>
      </div>
      <Button
        variant="default"
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
            Copy response
          </>
        )}
      </Button>
    </div>
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

interface UnlockSectionProps {
  onUnlock: () => void;
  isLoading: boolean;
  stripeConfigured: boolean;
}

function UnlockSection({ onUnlock, isLoading, stripeConfigured }: UnlockSectionProps) {
  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
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
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
          <Button
            onClick={onUnlock}
            className="w-full rounded-xl"
            disabled={isLoading || !stripeConfigured}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : !stripeConfigured ? (
              "Checkout unavailable"
            ) : (
              <>
                Unlock for $49
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-3">
            One-time payment. Secure checkout via Stripe.
          </p>
        </div>
      </div>
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
    return setSeoMeta({
      title: "Analyze Your Car Deal | Odigos",
      description: "Paste dealer texts, emails, or quotes into Odigos. Get an instant analysis with hidden fee detection and suggested questions for the dealer.",
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
            description: "Full analysis unlocked.",
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
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <img src={logoImage} alt="Odigos" className="h-6 w-auto" />
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Main Input */}
              <div className="rounded-2xl border border-border/50 bg-card p-1">
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
                          className="min-h-[180px] text-base resize-y border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </FormControl>
                      <FormMessage className="px-3 pb-2" />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-between px-3 py-2 border-t border-border/30">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground h-7"
                      onClick={() => form.setValue("dealerText", SAMPLE_GOOD_DEAL)}
                    >
                      Try good example
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground h-7"
                      onClick={() => form.setValue("dealerText", SAMPLE_BAD_DEAL)}
                    >
                      Try bad example
                    </Button>
                  </div>
                </div>
              </div>

              {/* Optional Details */}
              <Collapsible open={isOptionalOpen} onOpenChange={setIsOptionalOpen}>
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border/50 bg-card hover:bg-muted/30 transition-colors"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      <Info className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">Additional details</span>
                      <span className="text-muted-foreground">(optional)</span>
                    </span>
                    {isOptionalOpen ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="condition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Condition</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-xl">
                                  <SelectValue placeholder="Select" />
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
                        name="purchaseType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Purchase Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-xl">
                                  <SelectValue placeholder="Select" />
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

                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="vehicle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Vehicle</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g., 2024 Toyota Camry"
                                className="rounded-xl"
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
                            <FormLabel className="text-xs">ZIP Code</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g., 90210"
                                maxLength={5}
                                className="rounded-xl"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {purchaseType === "finance" && (
                      <div className="grid grid-cols-3 gap-3">
                        <FormField
                          control={form.control}
                          name="apr"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">APR (%)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  placeholder="5.99"
                                  className="rounded-xl"
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
                              <FormLabel className="text-xs">Term (months)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  placeholder="60"
                                  className="rounded-xl"
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
                              <FormLabel className="text-xs">Down ($)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  placeholder="5000"
                                  className="rounded-xl"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full rounded-xl h-12"
                disabled={analyzeMutation.isPending}
              >
                {analyzeMutation.isPending ? (
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
            </form>
          </Form>

          {/* Results */}
          {result && (
            <div className="mt-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="h-px bg-border/50" />
              
              <VerdictDisplay 
                score={result.dealScore} 
                goNoGo={result.goNoGo}
                confidenceLevel={result.confidenceLevel}
                verdictLabel={result.verdictLabel}
              />

              {/* Summary */}
              <div className="rounded-2xl border border-border/50 bg-card p-6">
                <h3 className="font-semibold text-foreground mb-3">Summary</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {result.summary}
                </p>
              </div>

              <DetectedFieldsCard fields={result.detectedFields} />

              {unlockTier === "free" ? (
                <UnlockSection
                  onUnlock={() => handleUnlockTier()}
                  isLoading={checkoutLoading || isCheckingPayment}
                  stripeConfigured={stripeConfigured}
                />
              ) : (
                <>
                  <QuestionsToAsk 
                    items={result.missingInfo}
                    confidenceLevel={result.confidenceLevel}
                    onCopy={() => toast({ title: "Questions copied to clipboard" })}
                  />
                  <SuggestedReplyCard reply={result.suggestedReply} />
                  
                  {/* Reasoning */}
                  <div className="rounded-2xl border border-border/50 bg-muted/20 p-6">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4 text-muted-foreground" />
                      Analysis reasoning
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {result.reasoning}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Odigos provides estimates based on the information you share. 
            Always verify details directly with the dealership before making a purchase.
          </p>
        </div>
      </footer>
    </div>
  );
}
