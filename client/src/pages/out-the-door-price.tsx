import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy, AlertTriangle, CircleDollarSign } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";
import SourceCitation from "@/components/SourceCitation";
import { ARTICLE_SOURCES } from "@/data/articleSources";

const STATE_TAX_DEFAULTS: Record<string, number> = {
  CA: 7.75,
  TX: 6.25,
  NY: 8.0,
  FL: 6.0,
  OH: 5.75,
};

const STATES = ["CA", "TX", "NY", "FL", "OH"] as const;

const OTD_MESSAGE = `Before I come in, can you confirm the full out-the-door price in writing, including sale price, taxes, title/registration, doc fee, and any dealer add-ons? If add-ons are included, please itemize each one with pricing. I'm ready to move forward once I can review the complete OTD breakdown.`;

const sampleBreakdown = [
  { label: "Vehicle sale price", value: "$32,500" },
  { label: "Sales tax (6.25%)", value: "$2,031" },
  { label: "Title & registration", value: "$285" },
  { label: "Dealer documentation fee", value: "$499" },
  { label: "Paint protection package", value: "$695" },
  { label: "Total Out-the-Door Price", value: "$36,010", isTotal: true },
];

function formatUSD(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default function OutTheDoorPrice() {
  const [vehiclePrice, setVehiclePrice] = useState<string>("");
  const [state, setState] = useState<string>("CA");
  const [salesTax, setSalesTax] = useState<string>("7.75");
  const [docFee, setDocFee] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSeoMeta({
      title: "Out-the-Door Price Calculator & Hidden Fee Checker (2026)",
      description: "Calculate your exact out-the-door price and spot hidden dealer fees. Interactive OTD calculator plus a complete guide to what's included, red flags, and how to get the full price in writing.",
      path: "/out-the-door-price",
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
    <ArticleLayout title="Out-the-Door Price Calculator & Hidden Fee Checker">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({
          title: "Out-the-Door Price Calculator & Hidden Fee Checker (2026)",
          description: "Calculate your exact out-the-door price and spot hidden dealer fees. Interactive OTD calculator plus a complete guide to what's included, red flags, and how to get the full price in writing.",
          path: "/out-the-door-price",
        }))}</script>
      </Helmet>

      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight" data-testid="text-otd-headline">
        Out-the-Door Price Calculator & Hidden Fee Checker
      </h1>

      <p className="text-lg text-muted-foreground">
        Calculate your exact out-the-door price and spot if a dealer is padding the quote with hidden markups, inflated doc fees, or illegal add-ons. Enter your numbers below — then paste your actual dealer quote into Odigos for a full hidden-fee check.{" "}<SourceCitation sources={ARTICLE_SOURCES["out-the-door-price"].sources} lastVerified={ARTICLE_SOURCES["out-the-door-price"].lastVerified} />
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

      {/* Educational Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none">

        <h2 className="text-2xl font-semibold text-foreground">What Odigos checks in your out-the-door price</h2>
        <p className="text-lg text-muted-foreground">
          When you paste your dealer quote, we check every line against the five components of a complete out-the-door price.
        </p>
        <p className="text-muted-foreground">A complete OTD includes:</p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          {[
            "The negotiated vehicle price",
            "Sales tax",
            "Title and registration",
            "Dealer documentation fees",
            "Required state fees",
            "Any dealer add-ons or packages",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground">
          If you don't have the full OTD in writing, you do not know what the car costs. For a broader overview of what to expect, see the <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC's guide to buying a new car</a>.
        </p>
        <p className="text-muted-foreground">
          Dealers often focus on the monthly payment. That hides fees. The OTD price is what protects you.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">What an Out-the-Door Price Includes</h2>
        <p className="text-muted-foreground">An itemized OTD breakdown should look like this:</p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          {[
            "Vehicle sale price",
            "Sales tax",
            "Title & registration",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><Link href="/dealer-doc-fee" className="underline text-foreground">Dealer documentation fee</Link></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>Required state/local fees</span>
          </li>
        </ul>
        <p className="text-muted-foreground">
          If even one of these is missing from a quote, the price is incomplete.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">What Dealers Often Leave Out of the First Quote</h2>
        <p className="text-muted-foreground">
          These frequently appear later — usually in the finance office:
        </p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          {[
            "Paint protection",
            "VIN etching",
            "Nitrogen-filled tires",
            '"Protection packages"',
            "Dealer-installed accessories",
            "GAP insurance",
            "Extended warranties",
            "Market adjustment fees",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground">
          Many of these are optional — even when labeled "mandatory." Learn more about <Link href="/mandatory-dealer-add-ons" className="underline text-foreground">mandatory dealer add-ons</Link> and which ones you can decline. Resources like <a href="https://www.edmunds.com/car-buying/what-fees-should-you-pay-at-a-car-dealership.html" target="_blank" rel="noopener" className="underline text-foreground">Edmunds' breakdown of dealer fees</a> can help you identify common charges.
        </p>

        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          Red Flags That the Quote Isn't Complete
        </h2>
        <p className="text-muted-foreground">Watch for:</p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          {[
            '"What monthly payment are you looking for?"',
            'APR "depends on credit" with no range',
            "No written total price",
            '"We\'ll finalize numbers when you come in."',
            'Fees labeled "market adjustment," "reconditioning," or "dealer services"',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-amber-500 mt-1.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground">
          If the dealer won't provide the total in writing, assume the number will change.
        </p>

        <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm font-semibold text-foreground mb-2">The gap between the sticker price and your OTD price is where dealers make extra margin.</p>
          <Link href="/analyze">
            <Button variant="cta" size="sm" data-testid="button-cta-mid-article-otd">
              See What's Hiding in Your Quote
            </Button>
          </Link>
        </div>

        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <CircleDollarSign className="h-5 w-5 shrink-0" />
          Example: Itemized Out-the-Door Price Breakdown
        </h2>
        <div className="rounded-md border border-border overflow-hidden mb-4">
          <table className="w-full text-sm" data-testid="table-otd-breakdown">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Line Item</th>
                <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {sampleBreakdown.map((row) => (
                <tr
                  key={row.label}
                  className={row.isTotal ? "border-t-2 border-border bg-muted/30 font-semibold" : "border-t border-border/50"}
                >
                  <td className={`py-2.5 px-4 ${row.isTotal ? "text-foreground" : "text-muted-foreground"}`}>
                    {row.label}
                  </td>
                  <td className={`py-2.5 px-4 text-right ${row.isTotal ? "text-foreground" : "text-muted-foreground"}`}>
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-muted-foreground mb-2">Every dollar is visible.</p>
        <p className="text-muted-foreground">If you can't see every dollar, you don't have the real number.</p>

        <h2 className="text-2xl font-semibold text-foreground">Common mistakes when calculating OTD price</h2>
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

        <h2 className="text-2xl font-semibold text-foreground">How dealers manipulate the out-the-door price</h2>
        <p className="text-muted-foreground">
          Many dealers anchor conversations on monthly payments rather than the total cost. By keeping your attention on a monthly figure, they can quietly add fees and add-ons that inflate the OTD price without the number feeling significant. Fees are often withheld until the finance office — at which point you've already agreed in principle to the deal. This makes it difficult to compare offers across dealerships and frequently leads to overpaying by hundreds or thousands of dollars.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Why Dealers Avoid Giving the OTD Price in Writing</h2>
        <p className="text-muted-foreground">There's a reason some dealerships hesitate.</p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          {[
            "It makes comparison shopping easier",
            "It removes leverage from payment-based negotiations",
            "It prevents surprise fees later",
            "It locks them into a real number",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground">
          Without a written OTD, numbers can shift in the finance office. Use tools like <a href="https://www.kbb.com/car-advice/" target="_blank" rel="noopener" className="underline text-foreground">Kelley Blue Book</a> to compare fair pricing before you negotiate.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Copy-Paste Message to Get the OTD Price in Writing</h2>
        <Card className="relative p-5 bg-muted/50 mb-4">
          <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic pr-10">
            {OTD_MESSAGE}
          </blockquote>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-3 right-3"
            onClick={handleCopy}
            data-testid="button-copy-otd-message"
            aria-label="Copy message"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
          {copied && (
            <span className="absolute top-3 right-14 text-xs text-green-600 dark:text-green-400 font-medium">Copied</span>
          )}
        </Card>
        <p className="text-muted-foreground">If they refuse, that's a signal.</p>

        <h2 className="text-2xl font-semibold text-foreground">Related Guides</h2>
        <p className="text-muted-foreground">
          If you're trying to understand dealership pricing tactics and hidden charges, these guides explain the most common situations buyers run into.
        </p>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          <li><Link href="/doc-fee-too-high" className="underline text-foreground">Dealer Doc Fee Too High? What You Can Actually Do</Link></li>
          <li><Link href="/market-adjustment-fee" className="underline text-foreground">Market Adjustment Fees Explained: Can Dealers Charge Them?</Link></li>
          <li><Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">Are Dealer Add-Ons Mandatory? What You Can Actually Refuse</Link></li>
          <li><Link href="/dealer-added-fees-after-agreement" className="underline text-foreground">Dealer Added Fees After Agreement? What to Do Next</Link></li>
          <li><Link href="/dealer-changed-price-after-deposit" className="underline text-foreground">Dealer Changed the Price After Your Deposit? What It Means</Link></li>
          <li><Link href="/finance-office-changed-the-numbers" className="underline text-foreground">Why the Finance Office Numbers Look Different</Link></li>
          <li><Link href="/monthly-payment-trap" className="underline text-foreground">The Monthly Payment Trap in Car Buying</Link></li>
          <li><Link href="/dealer-wont-give-otd-price" className="underline text-foreground">Dealer Won't Give You an Out-the-Door Price? Here's Why</Link></li>
          <li><Link href="/car-dealer-fees-by-state" className="underline text-foreground">Car Dealer Fees by State: What Buyers Should Expect</Link></li>
          <li><Link href="/dealer-add-ons-list" className="underline text-foreground">Dealer Add-Ons List: What Dealers Try to Sell and What You Can Refuse</Link></li>
          <li><Link href="/dealer-doc-fee-by-state" className="underline text-foreground">Dealer Doc Fee by State: What Buyers Should Expect</Link></li>
          <li><Link href="/car-dealer-fees-list" className="underline text-foreground">Car Dealer Fees List: Common Charges Explained</Link></li>
          <li><Link href="/calculate-out-the-door-price" className="underline text-foreground">How to Calculate Out-the-Door Price on a Car</Link></li>
        </ul>

        {/* Bottom CTA */}
        <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-2">Get a real breakdown of your deal</h2>
          <p className="text-sm text-muted-foreground">
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
        Not affiliated with any dealership. Built for U.S. car buyers.
      </p>
    </ArticleLayout>
  );
}
