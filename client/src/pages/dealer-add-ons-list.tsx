import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy } from "lucide-react";
import { setSeoMeta } from "@/lib/seo";
import logoImage from "@assets/odigos_logo.png";

const ADDONS_MESSAGE = `Hi — I'm interested in the vehicle but I'd like to see a breakdown of every dealer-installed add-on included in the price. For each one, please list the product name, what it does, and the individual cost. I'd also like to know which add-ons can be removed and what the out-the-door price would be without them. Thanks.`;

export default function DealerAddOnsList() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return setSeoMeta({
      title: "Dealer Add-Ons List: Common Dealer Extras and What's Optional | Odigos",
      description: "See the full list of common dealer add-ons, what they cost, and which ones you can refuse. Know what's optional before you sign anything.",
      path: "/dealer-add-ons-list",
    });
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ADDONS_MESSAGE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = ADDONS_MESSAGE;
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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-addons-list-headline">
            Dealer Add-Ons List: What Dealers Try to Sell and What You Can Refuse
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              When you buy a car from a dealership, the price you were quoted often includes extras you never asked for. These dealer add-ons — sometimes called "dealer-installed options" or "accessories" — are products or services the dealership adds to the vehicle before you arrive. They're a significant profit center for the dealer, and most of them are completely optional.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              Understanding what's on the list — and what each item actually costs — puts you in a much stronger position to negotiate the total price or have charges removed entirely.
            </p>

            <p className="text-sm text-muted-foreground mb-6">
              Already have a dealer quote? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and see if anything is missing.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Common dealer add-ons</h2>

            <p className="text-lg text-muted-foreground mb-4">
              Below is a list of the most frequently added dealer extras. Nearly all of them are optional, even when presented as "included" or "already installed."
            </p>

            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm border border-border rounded-md">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 font-semibold text-foreground border-b border-border">Add-On</th>
                    <th className="text-left p-3 font-semibold text-foreground border-b border-border">Typical Dealer Price</th>
                    <th className="text-left p-3 font-semibold text-foreground border-b border-border">Actual Cost</th>
                    <th className="text-left p-3 font-semibold text-foreground border-b border-border">Optional?</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-foreground">Paint protection film / sealant</td>
                    <td className="p-3">$500 – $1,500</td>
                    <td className="p-3">$50 – $150</td>
                    <td className="p-3">Yes</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-foreground">Fabric / upholstery protection</td>
                    <td className="p-3">$300 – $1,000</td>
                    <td className="p-3">$30 – $75</td>
                    <td className="p-3">Yes</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-foreground">VIN etching</td>
                    <td className="p-3">$200 – $400</td>
                    <td className="p-3">$20 – $30</td>
                    <td className="p-3">Yes</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-foreground">Nitrogen-filled tires</td>
                    <td className="p-3">$100 – $300</td>
                    <td className="p-3">Often free at tire shops</td>
                    <td className="p-3">Yes</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-foreground">Window tint</td>
                    <td className="p-3">$300 – $800</td>
                    <td className="p-3">$100 – $250 aftermarket</td>
                    <td className="p-3">Yes</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-foreground">Door edge guards</td>
                    <td className="p-3">$100 – $300</td>
                    <td className="p-3">$15 – $40</td>
                    <td className="p-3">Yes</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-foreground">Wheel locks</td>
                    <td className="p-3">$75 – $200</td>
                    <td className="p-3">$20 – $40</td>
                    <td className="p-3">Yes</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-foreground">Theft deterrent / alarm system</td>
                    <td className="p-3">$300 – $1,000</td>
                    <td className="p-3">$50 – $150</td>
                    <td className="p-3">Yes</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-foreground">All-weather floor mats</td>
                    <td className="p-3">$150 – $400</td>
                    <td className="p-3">$50 – $120</td>
                    <td className="p-3">Yes</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-foreground">"Protection package" (bundle)</td>
                    <td className="p-3">$1,000 – $3,000</td>
                    <td className="p-3">Varies (sum of parts)</td>
                    <td className="p-3">Yes</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-foreground">Extended warranty / service contract</td>
                    <td className="p-3">$1,500 – $4,000</td>
                    <td className="p-3">Available cheaper from third parties</td>
                    <td className="p-3">Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Which add-ons are optional?</h2>

            <p className="text-lg text-muted-foreground mb-6">
              Virtually all dealer add-ons are optional. The only charges you truly cannot avoid are government-mandated fees: sales tax, title, and registration. A <Link href="/car-dealer-fees-explained" className="underline text-foreground">documentation fee</Link> is standard at most dealerships, though the amount varies and may be negotiable depending on your state.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              Everything else — paint protection, VIN etching, nitrogen tires, protection packages, extended warranties — is a dealer profit item. Even when the dealer says "it's already on the car," you are not obligated to pay for products you didn't request. You can ask for the price to be reduced by the cost of unwanted add-ons, or request a quote on a vehicle without them. For a deeper look at <Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">whether add-ons are truly mandatory</Link>, see our detailed guide.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Typical costs and markup ranges</h2>

            <p className="text-lg text-muted-foreground mb-6">
              The pattern across nearly every dealer add-on is the same: the dealer's actual cost is a fraction of what they charge. Paint sealant that costs the dealer $50 in product is billed at $800. VIN etching that takes five minutes and costs $25 in materials is charged at $300. Protection packages bundle several of these low-cost items together and present a single price of $1,500 or more, making it harder to evaluate each item individually. Some dealers also layer on a <Link href="/market-adjustment-fee" className="underline text-foreground">market adjustment fee</Link> above MSRP — pure markup with no product attached at all.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              This doesn't mean every add-on is worthless — window tint and floor mats have legitimate value. But you can almost always get the same products aftermarket for significantly less. The key is knowing what you're paying for so you can make an informed decision rather than accepting a bundled price.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What to say to the dealer</h2>

            <p className="text-muted-foreground mb-4">
              If your quote includes add-ons you didn't ask for, use this message to request a clean breakdown. You can copy and paste it directly:
            </p>

            <Card className="relative p-5 bg-muted/50 mb-4">
              <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic pr-10">
                {ADDONS_MESSAGE}
              </blockquote>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-3 right-3"
                onClick={handleCopy}
                data-testid="button-copy-addons-list-message"
                aria-label="Copy message"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </Card>

            <p className="text-muted-foreground mb-6">
              This works because it's professional and specific. You're not arguing about individual products — you're asking for transparency so you can evaluate the total deal.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How Odigos helps</h2>

            <p className="text-lg text-muted-foreground mb-6">
              If you already have a dealer quote and aren't sure which charges are add-ons, paste it into Odigos. We'll identify every dealer-installed extra, flag the ones with high markup, and show you what the <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> would look like without them. No guesswork, no math — just a clear picture of what's optional and what's not.
            </p>

            <p className="text-lg text-muted-foreground mb-8">
              For more on how dealer fees work across different states, see our <Link href="/car-dealer-fees-explained" className="underline text-foreground">car dealer fees explained</Link> guide, or check the <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC's guide for car buyers</a> for your rights as a consumer.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-muted-foreground mb-4">
              Not sure if the dealer quote is complete?
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Paste the message or quote you received. Odigos checks for missing out-the-door pricing, add-ons, and unclear fees.
            </p>
            <Link href="/analyze">
              <Button size="lg" data-testid="button-cta-addons-list">
                Check the Quote with Odigos
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-12">
            Not affiliated with any dealership. Optimized for U.S. car purchases.
          </p>
        </article>
      </main>
    </div>
  );
}
