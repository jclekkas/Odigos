import { AlertTriangle, DollarSign, TrendingUp, Target, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { LeaseMathResult } from "@shared/schema";

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtPct(n: number, decimals = 2): string {
  return `${n.toFixed(decimals)}%`;
}

// ---------------------------------------------------------------------------
// Hero callout — the single biggest lease math finding
// ---------------------------------------------------------------------------

interface HeroItem {
  icon: typeof AlertTriangle;
  text: string;
  priority: number;
}

function getHeroItems(lm: LeaseMathResult): HeroItem[] {
  const items: HeroItem[] = [];

  if (lm.paymentValidation?.isSignificant) {
    const d = lm.paymentValidation.discrepancy;
    const dir = d > 0 ? "too high" : "too low";
    items.push({
      icon: DollarSign,
      text: `Your payment appears ~${fmt(Math.abs(Math.round(d)))}/month ${dir}`,
      priority: 1,
    });
  }

  if (lm.rateMarkup && lm.rateMarkup.totalMarkupDollars > 0) {
    items.push({
      icon: TrendingUp,
      text: `Dealer rate markup may cost you ${fmt(lm.rateMarkup.totalMarkupDollars)} over this lease`,
      priority: 2,
    });
  }

  if (lm.residualCheck?.status === "low") {
    items.push({
      icon: Target,
      text: "Residual appears lower than typical for this vehicle",
      priority: 3,
    });
  }

  if (lm.acquisitionFeeBenchmark?.isMarkedUp) {
    items.push({
      icon: AlertTriangle,
      text: `Acquisition fee appears marked up by ${fmt(lm.acquisitionFeeBenchmark.overage)}`,
      priority: 4,
    });
  }

  return items.sort((a, b) => a.priority - b.priority);
}

// ---------------------------------------------------------------------------
// Evidence cards
// ---------------------------------------------------------------------------

function APRCard({ apr }: { apr: number }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
      <TrendingUp className="mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div className="text-sm">
        <p className="font-medium">APR Equivalent</p>
        <p className="text-muted-foreground">Money factor converts to <strong>{fmtPct(apr)}</strong> APR</p>
      </div>
    </div>
  );
}

function RateMarkupCard({ rateMarkup }: { rateMarkup: NonNullable<LeaseMathResult["rateMarkup"]> }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
      <DollarSign className="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-500 flex-shrink-0" />
      <div className="text-sm">
        <p className="font-medium">Rate Markup</p>
        <p className="text-muted-foreground">
          Dealer APR: <strong>{fmtPct(rateMarkup.dealerAPR)}</strong> vs.
          lender base: <strong>{fmtPct(rateMarkup.buyRateAPR)}</strong>
        </p>
        <p className="text-muted-foreground">
          Markup: {fmt(Math.abs(rateMarkup.markupPerMonth))}/mo ({fmt(Math.abs(rateMarkup.totalMarkupDollars))} total)
        </p>
      </div>
    </div>
  );
}

function PaymentCard({ pv }: { pv: NonNullable<LeaseMathResult["paymentValidation"]> }) {
  const dir = pv.discrepancy > 0 ? "higher" : "lower";
  return (
    <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
      <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-500 flex-shrink-0" />
      <div className="text-sm">
        <p className="font-medium">Payment Validation</p>
        <p className="text-muted-foreground">
          Quoted: <strong>{fmt(pv.quotedPayment)}</strong>/mo vs.
          expected: <strong>{fmt(Math.round(pv.expectedPaymentPreTax))}</strong>/mo (pre-tax)
        </p>
        <p className="text-muted-foreground">
          {fmt(Math.abs(Math.round(pv.discrepancy)))}/mo {dir} than expected
        </p>
      </div>
    </div>
  );
}

function ResidualCard({ rc }: { rc: NonNullable<LeaseMathResult["residualCheck"]> }) {
  const statusLabel = rc.status === "low" ? "Below typical" : rc.status === "high" ? "Above typical" : "Within range";
  const statusColor = rc.status === "normal"
    ? "text-green-600 dark:text-green-500"
    : "text-amber-600 dark:text-amber-500";
  return (
    <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
      <Target className="mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div className="text-sm">
        <p className="font-medium">Residual Value</p>
        <p className="text-muted-foreground">
          Your residual: <strong>{fmtPct(rc.residualPercent, 1)}</strong> — brand range: {fmtPct(rc.brandRange[0], 0)}-{fmtPct(rc.brandRange[1], 0)}
        </p>
        <p className={statusColor}>{statusLabel}</p>
      </div>
    </div>
  );
}

function AcqFeeCard({ af }: { af: NonNullable<LeaseMathResult["acquisitionFeeBenchmark"]> }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
      <Info className="mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div className="text-sm">
        <p className="font-medium">Acquisition Fee</p>
        <p className="text-muted-foreground">
          Charged: <strong>{fmt(af.charged)}</strong> — lender standard: <strong>{fmt(af.brandStandard)}</strong>
        </p>
        {af.isMarkedUp && (
          <p className="text-amber-600 dark:text-amber-500">Marked up by {fmt(af.overage)}</p>
        )}
        {!af.isMarkedUp && (
          <p className="text-green-600 dark:text-green-500">At or below standard</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Action items
// ---------------------------------------------------------------------------

function getActionItems(lm: LeaseMathResult): string[] {
  const items: string[] = [];
  if (lm.rateMarkup && lm.rateMarkup.totalMarkupDollars > 0) {
    items.push("Ask the dealer for the buy rate money factor from the captive lender");
  }
  if (lm.paymentValidation?.isSignificant) {
    items.push("Request a full lease worksheet showing how the payment is calculated");
  }
  if (lm.residualCheck?.status === "low") {
    items.push("Ask which bank set the residual and whether a higher residual is available");
  }
  if (lm.acquisitionFeeBenchmark?.isMarkedUp) {
    items.push("Ask if the acquisition fee matches the lender's base fee");
  }
  return items.slice(0, 4);
}

// ---------------------------------------------------------------------------
// Main block
// ---------------------------------------------------------------------------

export default function LeaseMathBlock({ leaseMath }: { leaseMath: LeaseMathResult | null | undefined }) {
  if (!leaseMath) return null;

  const heroItems = getHeroItems(leaseMath);
  const actionItems = getActionItems(leaseMath);
  const hasAnyCard =
    leaseMath.apr != null ||
    leaseMath.rateMarkup != null ||
    leaseMath.paymentValidation != null ||
    leaseMath.residualCheck != null ||
    leaseMath.acquisitionFeeBenchmark != null;

  if (!hasAnyCard && heroItems.length === 0) return null;

  return (
    <Card className="border-blue-500/30 bg-blue-500/5" data-testid="lease-math-block">
      <CardContent className="pt-5 space-y-4">
        {/* Brand tag */}
        {leaseMath.brandMatched && (
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Lease math &middot; {leaseMath.brandMatched}
          </p>
        )}
        {!leaseMath.brandMatched && (
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Lease math
          </p>
        )}

        {/* Hero callouts */}
        {heroItems.length > 0 && (
          <div className="space-y-2">
            {heroItems.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <item.icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-500" />
                <p className="text-sm font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Evidence cards */}
        {hasAnyCard && (
          <div className="space-y-2">
            {leaseMath.apr != null && <APRCard apr={leaseMath.apr} />}
            {leaseMath.rateMarkup != null && <RateMarkupCard rateMarkup={leaseMath.rateMarkup} />}
            {leaseMath.paymentValidation != null && <PaymentCard pv={leaseMath.paymentValidation} />}
            {leaseMath.residualCheck != null && <ResidualCard rc={leaseMath.residualCheck} />}
            {leaseMath.acquisitionFeeBenchmark != null && <AcqFeeCard af={leaseMath.acquisitionFeeBenchmark} />}
          </div>
        )}

        {/* Action items */}
        {actionItems.length > 0 && (
          <div className="border-t border-border/50 pt-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">What to ask</p>
            <ul className="space-y-1">
              {actionItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-foreground mt-0.5">&#8226;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
