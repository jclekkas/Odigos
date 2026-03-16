import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { setSeoMeta } from "@/lib/seo";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

export default function CarDealerFeesExplained() {
  useEffect(() => {
    return setSeoMeta({
      title: "Common Car Dealer Fees Explained | Odigos",
      description: "When you buy a car, the sale price is only part of what you pay. Learn which dealer fees are required, which are optional, and how to protect yourself before signing.",
      path: "/car-dealer-fees-explained",
    });
  }, []);

  return (
    <ArticleLayout>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-fees-headline">
            Common Car Dealer Fees Explained: What You Should (and Shouldn't) Pay
          </h1>
          
          <p className="text-lg text-muted-foreground mb-6">
            When you buy a car, the sale price is only part of what you'll pay. Dealers add a range of fees — some required by law, others entirely optional, even when they're not presented that way. Knowing the difference can save you hundreds or thousands.
          </p>

          <p className="text-sm text-muted-foreground mb-6">
            Already have a dealer quote? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and see if anything is missing.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Fees you should expect to pay</h2>

          <p className="text-muted-foreground mb-4">
            Certain charges are unavoidable because they're set or collected by government agencies. The <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC's guide for new car buyers</a> outlines what dealers are legally required to disclose, and these fees are part of that picture.
          </p>

          <ul className="space-y-2 mb-6 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <span><strong className="text-foreground">Sales tax</strong> — set by your state and local government, not negotiable. The rate depends on where you live, not where the dealership is located.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <span><strong className="text-foreground">Title and registration</strong> — government fees that typically range from $100 to $500 depending on your state. These go directly to your DMV or equivalent agency.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <span><strong className="text-foreground">Dealer documentation fees</strong> — these cover the cost of processing paperwork and vary widely. Some states cap them at relatively low amounts, while others have no cap at all and you might see charges of $500 or more. It's worth checking what's typical in your area before negotiating.</span>
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Fees that are often negotiable or optional</h2>

          <p className="text-muted-foreground mb-4">
            Many line items on a dealer's worksheet are add-ons, not requirements. According to <a href="https://www.edmunds.com/car-buying/what-fees-should-you-pay-at-a-car-dealership.html" target="_blank" rel="noopener" className="underline text-foreground">Edmunds</a>, buyers can often push back on these charges — or decline them entirely.
          </p>

          <ul className="space-y-2 mb-6 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <span><strong className="text-foreground">Dealer prep / reconditioning fees</strong> — these cover tasks like washing and inspecting the vehicle, which are often already included in the MSRP. Paying extra for them is rarely justified.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <span><strong className="text-foreground">Paint or fabric protection</strong> — the dealer's cost is usually $50 to $100, but it's commonly marked up to $500–$1,500. Aftermarket alternatives are widely available for far less.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <span><strong className="text-foreground">VIN etching</strong> — DIY kits cost $20–$30, yet dealers charge $200–$400 for the same service. It's a valid theft deterrent, but not at that markup.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <span><strong className="text-foreground">Nitrogen-filled tires</strong> — the benefit for everyday driving is negligible. Many tire shops offer nitrogen fills for free, so paying a dealership for it rarely makes sense.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <span><strong className="text-foreground">Market adjustment / ADM</strong> — this is pure dealer profit added on top of MSRP. It's always negotiable, especially when inventory is available and demand has cooled.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <span><strong className="text-foreground">Extended warranties</strong> — these can usually be purchased later from third-party providers for significantly less than what the dealer charges at signing.</span>
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How to protect yourself</h2>

          <p className="text-muted-foreground mb-6">
            The simplest defense is requesting the full <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> in writing before you visit the dealership. An itemized OTD quote shows every dollar — taxes, fees, and add-ons — and makes it straightforward to spot optional charges and negotiate them out before you're sitting in the finance office.
          </p>

          <p className="text-muted-foreground mb-8">
            If a dealer won't provide an itemized breakdown, that's worth treating as a signal. Transparent pricing shouldn't be hard to get.
          </p>
          

          <ArticleCta />

          <p className="text-xs text-muted-foreground mt-12">
            Not affiliated with any dealership. Optimized for U.S. car purchases.
          </p>
    </ArticleLayout>
  );
}
