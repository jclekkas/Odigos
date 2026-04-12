import { useEffect } from "react";
import { Check, CheckCircle2, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trackPaywallView } from "@/lib/tracking";
import type { PassProductKey } from "@/lib/pass";

export interface PaywallCardsProps {
  onUnlock: (productKey: PassProductKey) => void;
  isLoading: boolean;
  loadingProduct: PassProductKey | null;
  stripeConfigured: boolean;
  carBuyerCtaLabel?: string;
}

export default function PaywallCards({
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
        {/* -- WEEKEND WARRIOR -- secondary -------------------------------- */}
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

        {/* -- CAR BUYER'S PASS -- primary --------------------------------- */}
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
