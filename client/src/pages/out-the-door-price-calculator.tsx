import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

const STATE_TAX_DEFAULTS: Record<string, number> = {
  CA: 7.75,
  TX: 6.25,
  NY: 8.0,
  FL: 6.0,
  OH: 5.75,
};

const STATES = ["CA", "TX", "NY", "FL", "OH"] as const;

const OTD_MESSAGE = `Hi, I'm interested in [YEAR MAKE MODEL TRIM]. Before I come in, could you send me the full out-the-door price in writing? I'd like to see the sale price, taxes, title/registration, doc fee, and any dealer-installed add-ons itemized separately. Thanks!`;

function formatUSD(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default function OutTheDoorPriceCalculator() {
  const [vehiclePrice, setVehiclePrice] = useState<string>("");
  const [state, setState] = useState<string>("CA");
  const [salesTax, setSalesTax] = useState<string>("7.75");
  const [docFee, setDocFee] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return setSeoMeta({
      title: "Out-the-Door Price Calculator (2026) - Estimate Car Total Cost Instantly",
      description: "Use this out-the-door price calculator to estimate your total car cost with taxes and dealer fees. Get a real OTD estimate in seconds.",
      path: "/out-the-door-price-calculator",
    });
  }, []);

  const handleStateChange = (newState: string) => {
    setState(newState);
    const defaultTax = STATE_TAX_DEFAULTS[newState];
    if (defaultTax !== undefined) {
      setSalesTax(String(defaultTax));
    }
  };

  const price = parseFloat(vehiclePrice) || 0;
  const taxRate = parseFloat(salesTax) || 0;
  const fee = parseFloat(docFee) || 0;
  const estimatedTax = price * (taxRate / 100);
  const totalOtd = price + estimatedTax + fee;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(OTD_MESSAGE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = OTD_MESSAGE;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <ArticleLayout title="Out-the-Door Price Calculator">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({
          title: "Out-the-Door Price Calculator (2026) - Estimate Car Total Cost Instantly",
          description: "Use this out-the-door price calculator to estimate your total car cost with taxes and dealer fees. Get a real OTD estimate in seconds.",
          path: "/out-the-door-price-calculator",
        }))}</script>
      </Helmet>

      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight" data-testid="text-otd-calc-headline">
        Out-the-Door Price Calculator
      </h1>

      <p className="text-lg text-muted-foreground mb-8">
        Estimate your total car price including taxes, fees, and dealer add-ons in seconds. Enter your numbers below to see a realistic out-the-door figure before you walk into the dealership.
      </p>

      {/* Interactive Calculator */}
      <Card className="p-6 mb-6 border border-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="vehicle-price">
              Vehicle Price ($)
            </label>
            <input
              id="vehicle-price"
              type="number"
              min="0"
              placeholder="e.g. 32000"
              value={vehiclePrice}
              onChange={(e) => setVehiclePrice(e.target.value)}
              data-testid="vehicle-price-input"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="state-select">
              State
            </label>
            <select
              id="state-select"
              value={state}
              onChange={(e) => handleStateChange(e.target.value)}
              data-testid="state-select"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="sales-tax">
              Sales Tax (%)
            </label>
            <input
              id="sales-tax"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 7.75"
              value={salesTax}
              onChange={(e) => setSalesTax(e.target.value)}
              data-testid="sales-tax-input"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="doc-fee">
              Dealer Doc Fee ($){" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              id="doc-fee"
              type="number"
              min="0"
              placeholder="e.g. 499"
              value={docFee}
              onChange={(e) => setDocFee(e.target.value)}
              data-testid="doc-fee-input"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>

        {/* Live Output */}
        <div className="rounded-md bg-muted/50 border border-border p-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Estimated Sales Tax</span>
            <span className="font-medium text-foreground" data-testid="estimated-sales-tax">
              {price > 0 ? formatUSD(estimatedTax) : "—"}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Estimated Doc Fee</span>
            <span className="font-medium text-foreground" data-testid="estimated-doc-fee">
              {fee > 0 ? formatUSD(fee) : "—"}
            </span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between items-center">
            <span className="font-semibold text-foreground">Total Out-the-Door Price</span>
            <span className="text-xl font-bold text-foreground" data-testid="total-otd-price">
              {price > 0 ? formatUSD(totalOtd) : "—"}
            </span>
          </div>
        </div>
      </Card>

      {/* Top CTA */}
      <div className="mb-10 p-5 rounded-lg bg-muted/30 border border-border">
        <p className="text-sm font-medium text-foreground mb-3">
          Want a real breakdown from your actual dealer quote?
        </p>
        <Link href="/analyze">
          <Button variant="cta" data-testid="analyze-my-deal-top">
            Analyze My Deal
          </Button>
        </Link>
      </div>

      {/* SEO Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none">

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What is an out-the-door price?</h2>
        <p className="text-muted-foreground mb-6">
          The out-the-door (OTD) price is the total amount you pay for a car, including taxes,{" "}
          <Link href="/dealer-doc-fee" className="underline text-foreground">dealer documentation fees</Link>,
          and any add-ons. It's the only number that matters when comparing offers — not the monthly payment or sticker price. The{" "}
          <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC's car buying guide</a>{" "}
          recommends always getting this figure in writing before committing to any deal.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What's included in an out-the-door price?</h2>
        <ul className="space-y-2 mb-6 text-muted-foreground">
          {[
            "Vehicle sale price",
            "Sales tax (varies by state)",
            "Dealer documentation fee",
            "Registration and title fees",
            "Optional dealer add-ons (if not removed)",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mb-8">
          Doc fees vary enormously depending on where you buy. Check{" "}
          <Link href="/car-dealer-fees-by-state" className="underline text-foreground">fees by state</Link>{" "}
          to understand what's typical in your area, or read our full guide on{" "}
          <Link href="/calculate-out-the-door-price" className="underline text-foreground">how to calculate out-the-door price</Link>{" "}
          step by step.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Common mistakes when calculating OTD price</h2>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          {[
            "Ignoring dealer doc fees (can be $85–$800+ depending on state)",
            "Forgetting add-ons like VIN etching or protection packages",
            "Using the wrong tax rate for your location",
            "Focusing on monthly payment instead of total price",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How dealers manipulate the out-the-door price</h2>
        <p className="text-muted-foreground mb-6">
          Many dealers anchor conversations on monthly payments rather than the total cost. By keeping your attention on a monthly figure, they can quietly add fees and add-ons that inflate the OTD price without the number feeling significant. Fees are often withheld until the finance office — at which point you've already agreed in principle to the deal. This makes it difficult to compare offers across dealerships and frequently leads to overpaying by hundreds or thousands of dollars.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Copy-paste message to request an itemized OTD</h2>
        <p className="text-muted-foreground mb-3">
          Send this to any dealer before visiting. It's direct, professional, and covers everything you need to verify your estimate:
        </p>
        <Card className="relative p-5 bg-muted/50 mb-8">
          <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic pr-10">
            {OTD_MESSAGE}
          </blockquote>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-3 right-3"
            onClick={handleCopy}
            data-testid="button-copy-otd-calc-message"
            aria-label="Copy message"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
          {copied && (
            <span className="absolute top-3 right-14 text-xs text-green-600 dark:text-green-400 font-medium">Copied</span>
          )}
        </Card>

        {/* Bottom CTA */}
        <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-2">Get a real breakdown of your deal</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Paste your quote and we'll calculate your true out-the-door price, flag hidden fees, and tell you exactly what to say to the dealer.
          </p>
          <Link href="/analyze">
            <Button variant="cta" data-testid="analyze-my-deal-bottom">
              Analyze My Deal
            </Button>
          </Link>
        </div>

      </div>

      <ArticleCta />

      <p className="text-xs text-muted-foreground mt-12">
        Not affiliated with any dealership. Optimized for U.S. car purchases.
      </p>
    </ArticleLayout>
  );
}
