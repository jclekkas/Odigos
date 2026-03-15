import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { setSeoMeta } from "@/lib/seo";
import ArticleHeader from "@/components/ArticleHeader";

export default function OutTheDoorPriceExample() {
  useEffect(() => {
    return setSeoMeta({
      title: "Out-the-Door Price Example: What a $30,000 Car Really Costs | Odigos",
      description: "See a simple out-the-door price example showing how a $30,000 car turns into a higher real total once taxes, fees, and add-ons are included.",
      path: "/out-the-door-price-example",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">

      <ArticleHeader />

      <main className="py-12 md:py-20 px-6">
        <article className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-otd-example-headline">
            Out-the-Door Price Example: What a $30,000 Car Really Costs
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              When buying a car, the advertised price is rarely the final amount you pay.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              The <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> (OTD) includes taxes, registration, and dealer fees in addition to the vehicle price. Looking at a simple example can help explain how the final number is calculated.
            </p>

            <div className="my-6 rounded-lg border border-border bg-muted/40 p-4">
              <p className="font-medium text-foreground mb-3">Have a real dealer quote? Compare it to what a clean breakdown looks like.</p>
              <Link href="/analyze">
                <Button size="sm" data-testid="button-callout-otd-example">Check My Deal</Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-2">Takes 10 seconds · No signup required</p>
            </div>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Example Breakdown</h2>

            <p className="text-muted-foreground mb-6">
              Imagine a car with a negotiated sale price of $30,000. Here's how the total might look once other charges are added.
            </p>

            <div className="border border-border rounded-lg overflow-hidden mb-4">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    { label: "Vehicle price", value: "$30,000" },
                    { label: "Sales tax (example 7%)", value: "$2,100" },
                    { label: "Title and registration", value: "$350" },
                    { label: "Dealer documentation fee", value: "$300" },
                  ].map((row, i) => (
                    <tr key={i} className="border-t border-border/50 first:border-t-0">
                      <td className="py-3 px-4 text-muted-foreground">{row.label}</td>
                      <td className="py-3 px-4 text-right text-foreground">{row.value}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border bg-muted/30 font-semibold">
                    <td className="py-3 px-4 text-foreground">Estimated out-the-door price</td>
                    <td className="py-3 px-4 text-right text-foreground">$32,750</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted-foreground mb-6">
              This is an illustrative example. Actual amounts vary by state, dealership, and vehicle.
            </p>

            <p className="text-muted-foreground mb-6">
              This is the number you would actually pay to purchase the vehicle.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Why the Final Price Is Often Higher Than Buyers Expect</h2>

            <p className="text-muted-foreground mb-4">
              Several factors can increase the total cost beyond a simple example.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <p className="font-medium text-foreground"><Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">Dealer add-ons</Link></p>
                <p className="text-muted-foreground">Some dealerships install accessories such as paint protection, wheel locks, or VIN etching. These can add several hundred dollars or more.</p>
              </div>
              <div>
                <p className="font-medium text-foreground"><Link href="/market-adjustment-fee" className="underline text-foreground">Market adjustments</Link></p>
                <p className="text-muted-foreground">For high-demand vehicles, some dealers add an additional markup above MSRP.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">State taxes</p>
                <p className="text-muted-foreground">Sales tax rates vary significantly by location. A higher rate can add thousands to the final price.</p>
              </div>
            </div>

            <p className="text-muted-foreground mb-6">
              Because of these variables, the exact OTD price will differ depending on the dealer and where you live.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Which Charges Are Normal vs. Negotiable</h2>

            <p className="text-muted-foreground mb-4">
              Certain charges are standard parts of a vehicle purchase. These usually include:
            </p>

            <ul className="space-y-2 mb-4 text-muted-foreground">
              <li className="flex items-start gap-2"><span>•</span><span>sales tax</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>title and registration</span></li>
              <li className="flex items-start gap-2"><span>•</span><span><Link href="/dealer-doc-fee" className="underline text-foreground">documentation fee</Link></span></li>
            </ul>

            <p className="text-muted-foreground mb-4">
              These are common across most dealerships.
            </p>

            <p className="text-muted-foreground mb-4">
              Some costs depend on the dealership and may be optional or negotiable:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2"><span>•</span><span>dealer add-ons</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>accessories</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>market adjustment fees</span></li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How to Use an Example Like This at the Dealership</h2>

            <p className="text-muted-foreground mb-4">
              When you receive a quote from a dealership, compare it to a simple example breakdown. Check whether the quote includes:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2"><span>•</span><span>vehicle price</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>taxes</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>registration</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>dealer fees</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>add-ons</span></li>
            </ul>

            <p className="text-muted-foreground mb-6">
              If something is missing, the number may not represent the true final price.
            </p>

            <p className="text-muted-foreground mb-6">
              Before visiting the dealership, it can help to <Link href="/how-to-ask-for-out-the-door-price" className="underline text-foreground">ask for the full OTD price in writing</Link>. If a <Link href="/dealer-wont-give-out-the-door-price" className="underline text-foreground">dealer won't provide it</Link>, that's worth paying attention to.
            </p>

            <p className="text-muted-foreground mb-6">
              You can also paste the dealer's message into Odigos to check whether any charges are unclear or missing.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-semibold mb-3 text-foreground" data-testid="text-otd-example-cta-heading">
              Have a real quote to compare?
            </h2>
            <p className="text-muted-foreground mb-6">Paste it and Odigos shows you whether it matches what a clean, complete OTD breakdown should look like.</p>
            <Link href="/analyze">
              <Button size="lg" data-testid="button-cta-otd-example">
                Compare My Quote
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
