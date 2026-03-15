import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy, AlertTriangle, CircleDollarSign } from "lucide-react";
import logoImage from "@assets/odigos_logo.png";
import { setSeoMeta } from "@/lib/seo";

const OTD_MESSAGE = `Before I come in, can you confirm the full out-the-door price in writing, including sale price, taxes, title/registration, doc fee, and any dealer add-ons? If add-ons are included, please itemize each one with pricing. I'm ready to move forward once I can review the complete OTD breakdown.`;

const sampleBreakdown = [
  { label: "Vehicle sale price", value: "$32,500" },
  { label: "Sales tax (6.25%)", value: "$2,031" },
  { label: "Title & registration", value: "$285" },
  { label: "Dealer documentation fee", value: "$499" },
  { label: "Paint protection package", value: "$695" },
  { label: "Total Out-the-Door Price", value: "$36,010", isTotal: true },
];

export default function OutTheDoorPrice() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return setSeoMeta({
      title: "What Is an Out-the-Door Price (OTD)? The Only Number That Matters | Odigos",
      description: "The out-the-door price (OTD) is the total you pay to leave the dealership with the keys. Learn what it includes, what dealers leave out, red flags, and a copy-paste message to get the full OTD in writing.",
      path: "/out-the-door-price",
    });
  }, []);

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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center gap-3">
          <Link href="/">
            <img src={logoImage} alt="Odigos" className="h-28 w-auto cursor-pointer" data-testid="link-logo-home" />
          </Link>
        </div>
      </header>

      <main className="py-12 md:py-20 px-6">
        <article className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-otd-headline">
            What Is an Out-the-Door Price (OTD)? The Only Number That Matters When Buying a Car
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-sm text-muted-foreground mb-6">
              Already have a dealer quote? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and see if anything is missing.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">The Out-the-Door Price (OTD) Is the Real Cost of a Car</h2>
            <p className="text-lg text-muted-foreground mb-4">
              The out-the-door price (OTD) is the total amount you pay to leave the dealership with the keys in your hand.
            </p>
            <p className="text-muted-foreground mb-3">It includes:</p>
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
            <p className="text-muted-foreground mb-4">
              If you don't have the full OTD in writing, you do not know what the car costs. For a broader overview of what to expect, see the <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC's guide to buying a new car</a>.
            </p>
            <p className="text-muted-foreground mb-10">
              Dealers often focus on the monthly payment. That hides fees. The OTD price is what protects you.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What an Out-the-Door Price Includes</h2>
            <p className="text-muted-foreground mb-3">An itemized OTD breakdown should look like this:</p>
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
            <p className="text-muted-foreground mb-8">
              If even one of these is missing from a quote, the price is incomplete.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What Dealers Often Leave Out of the First Quote</h2>
            <p className="text-muted-foreground mb-3">
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
            <p className="text-muted-foreground mb-8">
              Many of these are optional — even when labeled "mandatory." Learn more about <Link href="/mandatory-dealer-add-ons" className="underline text-foreground">mandatory dealer add-ons</Link> and which ones you can decline. Resources like <a href="https://www.edmunds.com/car-buying/what-fees-should-you-pay-at-a-car-dealership.html" target="_blank" rel="noopener" className="underline text-foreground">Edmunds' breakdown of dealer fees</a> can help you identify common charges.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Why Dealers Avoid Giving the OTD Price in Writing</h2>
            <p className="text-muted-foreground mb-3">There's a reason some dealerships hesitate.</p>
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
            <p className="text-muted-foreground mb-8">
              Without a written OTD, numbers can shift in the finance office. Use tools like <a href="https://www.kbb.com/car-advice/" target="_blank" rel="noopener" className="underline text-foreground">Kelley Blue Book</a> to compare fair pricing before you negotiate.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
              Red Flags That the Quote Isn't Complete
            </h2>
            <p className="text-muted-foreground mb-3">Watch for:</p>
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
            <p className="text-muted-foreground mb-8">
              If the dealer won't provide the total in writing, assume the number will change.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground flex items-center gap-2">
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
            <p className="text-muted-foreground mb-8">If you can't see every dollar, you don't have the real number.</p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Copy-Paste Message to Get the OTD Price in Writing</h2>
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
            <p className="text-muted-foreground mb-8">If they refuse, that's a signal.</p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Want to Estimate Your OTD First?</h2>
            <p className="text-muted-foreground mb-2">
              You can try our <Link href="/out-the-door-price-calculator" className="underline text-foreground">out-the-door price calculator</Link> to get a baseline estimate before contacting a dealer.
            </p>
            <p className="text-muted-foreground mb-2">Just remember: calculators don't reveal hidden add-ons.</p>
            <p className="text-muted-foreground mb-2">
              Not sure what the numbers should look like? See a <Link href="/out-the-door-price-example" className="underline text-foreground">real out-the-door price example</Link> with a full cost breakdown for a $30,000 vehicle.
            </p>
            <p className="text-muted-foreground mb-8">
              When you're ready to contact a dealer, use the <Link href="/how-to-ask-for-out-the-door-price" className="underline text-foreground">exact message to ask for an out-the-door price in writing</Link>.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Related Guides</h2>
            <p className="text-muted-foreground mb-4">
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
              <li><Link href="/how-to-ask-for-out-the-door-price" className="underline text-foreground">How to Ask a Dealer for an Out-the-Door Price</Link></li>
              <li><Link href="/otd-price-vs-msrp" className="underline text-foreground">OTD Price vs. MSRP: What Car Buyers Get Wrong</Link></li>
              <li><Link href="/out-the-door-price-example" className="underline text-foreground">Out-the-Door Price Example: What a $30,000 Car Really Costs</Link></li>
            </ul>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-semibold mb-2 text-foreground" data-testid="text-otd-cta-heading">
              Not sure if the dealer quote is complete?
            </h2>
            <p className="text-muted-foreground mb-2">Paste the message or quote you received. Odigos checks for:</p>
            <ul className="space-y-2 mb-6 text-muted-foreground">
              {[
                "Missing OTD components",
                "Hidden or vague fees",
                "Risky language",
                "APR ambiguity",
                'Add-ons framed as "mandatory"',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/analyze">
              <Button size="lg" data-testid="button-cta-otd">
                Check the Quote with Odigos
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-12">
            Not affiliated with any dealership. Built for U.S. car buyers.
          </p>
        </article>
      </main>
    </div>
  );
}
