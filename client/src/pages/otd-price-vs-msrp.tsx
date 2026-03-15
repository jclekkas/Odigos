import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { setSeoMeta } from "@/lib/seo";
import ArticleHeader from "@/components/ArticleHeader";
import { trackCtaClick } from "@/lib/tracking";

export default function OtdPriceVsMsrp() {
  useEffect(() => {
    return setSeoMeta({
      title: "OTD Price vs MSRP: What Car Buyers Get Wrong | Odigos",
      description: "MSRP is not the same as the out-the-door price. Learn the difference, what extra charges get added, and which number you should negotiate around.",
      path: "/otd-price-vs-msrp",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">

      <ArticleHeader slug="otd-price-vs-msrp" />

      <main className="py-12 md:py-20 px-6">
        <article className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-otd-vs-msrp-headline">
            OTD Price vs. MSRP: What Car Buyers Get Wrong
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              Many car buyers focus on the MSRP when comparing vehicles.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              But the MSRP is not the final price you pay.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              The number that matters most is the <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link>, which includes taxes, fees, and other charges. Understanding the difference can help you avoid surprises at the dealership.
            </p>

            <div className="my-6 rounded-lg border border-border bg-muted/40 p-4">
              <p className="font-medium text-foreground mb-3">Have a quote with only an MSRP? See what the actual OTD price will be.</p>
              <Link href="/analyze?src=otd-price-vs-msrp">
                <Button size="sm" data-testid="button-callout-otd-vs-msrp" onClick={() => trackCtaClick({ location: "article_top_callout", article: "otd-price-vs-msrp" })}>Check My Deal</Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-2">Takes 10 seconds · No signup required</p>
            </div>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What MSRP Actually Means</h2>

            <p className="text-muted-foreground mb-4">
              MSRP stands for Manufacturer's Suggested Retail Price. It is the price recommended by the car manufacturer for the vehicle.
            </p>

            <p className="text-muted-foreground mb-4">
              The MSRP usually includes:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2"><span>•</span><span>Base vehicle price</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>Factory-installed options</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>Destination charge</span></li>
            </ul>

            <p className="text-muted-foreground mb-6">
              However, it does not include taxes, registration, or most dealer fees. That means the amount you actually pay will usually be higher.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What the Out-the-Door Price Includes</h2>

            <p className="text-muted-foreground mb-4">
              The out-the-door price represents the total cost to purchase the car. It typically includes:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2"><span>•</span><span>Vehicle sale price</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>Sales tax</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>Title and registration</span></li>
              <li className="flex items-start gap-2"><span>•</span><span><Link href="/dealer-doc-fee" className="underline text-foreground">Dealer documentation fee</Link></span></li>
              <li className="flex items-start gap-2"><span>•</span><span><Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">Dealer add-ons or accessories</Link></span></li>
            </ul>

            <p className="text-muted-foreground mb-6">
              Because it includes everything, the OTD price is the most accurate number for comparing offers between dealerships.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Why Monthly Payment Quotes Confuse Buyers</h2>

            <p className="text-muted-foreground mb-4">
              Many dealerships focus on the monthly payment instead of the total price. Monthly payments depend on several variables:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2"><span>•</span><span>loan term</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>interest rate</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>down payment</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>trade-in value</span></li>
            </ul>

            <p className="text-muted-foreground mb-6">
              Two offers with the same payment may have very different total costs. That's why it's usually better to compare out-the-door price first, then discuss financing separately.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What Gets Added on Top of MSRP</h2>

            <p className="text-muted-foreground mb-4">
              Several charges often appear after the vehicle price is discussed. These may include:
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <p className="font-medium text-foreground">Sales tax</p>
                <p className="text-muted-foreground">Based on your state's tax rate.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Title and registration fees</p>
                <p className="text-muted-foreground">Required to legally register the car.</p>
              </div>
              <div>
                <p className="font-medium text-foreground"><Link href="/dealer-doc-fee" className="underline text-foreground">Dealer documentation fee</Link></p>
                <p className="text-muted-foreground">A fee for processing paperwork.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Dealer add-ons</p>
                <p className="text-muted-foreground">Optional products installed by the dealership.</p>
              </div>
              <div>
                <p className="font-medium text-foreground"><Link href="/market-adjustment-fee" className="underline text-foreground">Market adjustment fees</Link></p>
                <p className="text-muted-foreground">Additional markups some dealers add for high-demand vehicles.</p>
              </div>
            </div>

            <p className="text-muted-foreground mb-6">
              These additions explain why the final price often differs significantly from the MSRP.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Which Number Should You Compare?</h2>

            <p className="text-muted-foreground mb-6">
              When comparing dealerships, focus on the out-the-door price. The OTD price shows the full amount you will pay.
            </p>

            <p className="text-muted-foreground mb-6">
              Two dealers may offer the same vehicle at the same MSRP but have very different OTD totals because of fees or add-ons.
            </p>

            <p className="text-muted-foreground mb-6">
              Before visiting the dealership, <Link href="/how-to-ask-for-out-the-door-price" className="underline text-foreground">ask for the full out-the-door price in writing</Link>. If <Link href="/dealer-wont-give-out-the-door-price" className="underline text-foreground">a dealer avoids providing it</Link>, that can be a sign the final cost may be higher than expected.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Simple Example: MSRP vs OTD</h2>

            <p className="text-muted-foreground mb-4">
              A car with a $30,000 MSRP might end up with an out-the-door price closer to:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2"><span>•</span><span>$31,800 after tax</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>$32,200 after registration and doc fees</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>$33,000 or more if add-ons are included</span></li>
            </ul>

            <p className="text-muted-foreground mb-6">
              This is why understanding the OTD price is essential when negotiating. For a more detailed breakdown, see a full <Link href="/out-the-door-price-example" className="underline text-foreground">out-the-door price example</Link> using a $30,000 vehicle.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Before Visiting the Dealership</h2>

            <p className="text-muted-foreground mb-6">
              Once you receive a written quote, review the breakdown carefully. Make sure the OTD price includes every major charge.
            </p>

            <p className="text-muted-foreground mb-6">
              If you're unsure whether something is missing, you can paste the quote into Odigos to check for hidden fees or incomplete pricing.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-semibold mb-3 text-foreground" data-testid="text-otd-vs-msrp-cta-heading">
              Only seeing MSRP in your quote?
            </h2>
            <p className="text-muted-foreground mb-6">Paste the quote and Odigos estimates the full OTD price — and flags any fees that look unusual.</p>
            <Link href="/analyze?src=otd-price-vs-msrp">
              <Button size="lg" data-testid="button-cta-otd-vs-msrp" onClick={() => trackCtaClick({ location: "article_bottom_cta", article: "otd-price-vs-msrp" })}>
                Get the Real Price
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-3">Takes 10 seconds · No signup required</p>
          </div>

          <p className="text-xs text-muted-foreground mt-12">
            Not affiliated with any dealership. Optimized for U.S. car purchases.
          </p>
        </article>
      </main>
    </div>
  );
}
