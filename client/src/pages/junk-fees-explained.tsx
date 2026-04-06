import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

export default function JunkFeesExplained() {
  useEffect(() => {
    setSeoMeta({
      title: "Car Dealer Junk Fees: The Complete 2026 Guide | Odigos",
      description: "Junk fees are hidden or surprise charges that provide little value to the buyer. Learn the 15+ most common dealer junk fees, which are legal, and how to fight back.",
      path: "/junk-fees-explained",
    });
  }, []);

  return (
    <ArticleLayout title="Junk Fees Explained">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "Car Dealer Junk Fees: The Complete 2026 Guide | Odigos", description: "Junk fees are hidden or surprise charges that provide little value to the buyer. Learn the 15+ most common dealer junk fees, which are legal, and how to fight back.", path: "/junk-fees-explained" }))}</script>
      </Helmet>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-junk-fees-headline">
        Car Dealer Junk Fees: What They Are and How to Spot Them
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground">
          A "junk fee" is any charge on a car deal that provides little or no real value to the buyer, was not clearly disclosed upfront, or duplicates costs already covered elsewhere in the transaction. The FTC defines junk fees as "hidden or surprise fees that were not clearly disclosed" — and they are one of the most common ways dealerships inflate the final price of a vehicle.
        </p>
        <p className="text-lg text-muted-foreground">
          This guide covers every common junk fee you're likely to encounter, explains what each one actually is, and tells you which ones you can push back on.
        </p>

        <p className="text-sm text-muted-foreground">
          Already have a dealer quote? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and we'll flag every junk fee automatically.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">What Makes a Fee a "Junk Fee"?</h2>
        <p className="text-muted-foreground">
          Not every dealer fee is a junk fee. Government-mandated charges like sales tax, title transfer, and registration fees are legitimate — they go to the state, not the dealer. A fee becomes a junk fee when it meets one or more of these criteria:
        </p>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong>No real value delivered</strong> — the buyer receives nothing meaningful in return (e.g., nitrogen tire fill, VIN etching)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong>Not disclosed upfront</strong> — the fee appears only in the finance office or on the final contract, not in the original quote</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong>Duplicates another charge</strong> — the service is already included in the vehicle price or another line item</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong>Presented as mandatory when it's optional</strong> — the dealer implies you must pay for something you can legally decline</span>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-foreground">The Most Common Dealer Junk Fees</h2>

        <h3 className="text-xl font-semibold text-foreground">1. Nitrogen Tire Fill ($50–$300)</h3>
        <p className="text-muted-foreground">
          Dealers charge for filling tires with nitrogen instead of regular air, claiming it maintains tire pressure longer. The actual benefit is negligible for passenger vehicles, and nitrogen is available free at many tire shops. This is one of the most universally recognized junk fees in the industry.
        </p>

        <h3 className="text-xl font-semibold text-foreground">2. VIN Etching ($100–$400)</h3>
        <p className="text-muted-foreground">
          The vehicle identification number is etched onto windows as a theft deterrent. While the concept has some merit, the cost is wildly inflated — DIY kits cost $20–$30. Dealers often present it as mandatory or already installed, making it harder to decline.
        </p>

        <h3 className="text-xl font-semibold text-foreground">3. Paint Protection / Ceramic Coating ($300–$1,500)</h3>
        <p className="text-muted-foreground">
          A sealant or coating applied to the vehicle's exterior paint. Professional ceramic coatings have value, but dealer-applied versions are typically low-quality spray-on products applied in minutes and marked up significantly. If you want paint protection, get it done independently after purchase.
        </p>

        <h3 className="text-xl font-semibold text-foreground">4. Fabric / Interior Protection ($200–$600)</h3>
        <p className="text-muted-foreground">
          A spray-on fabric or leather treatment that dealers claim protects against stains and wear. A $10 can of Scotchgard provides comparable protection. This fee almost always delivers minimal value relative to its cost.
        </p>

        <h3 className="text-xl font-semibold text-foreground">5. Dealer Prep Fee ($200–$500)</h3>
        <p className="text-muted-foreground">
          A charge for washing, detailing, and inspecting the vehicle before delivery. Preparing cars for sale is a normal cost of doing business — not an expense that should be passed to buyers. Learn more in our <Link href="/dealer-prep-fee" className="underline text-foreground">dealer prep fee guide</Link>.
        </p>

        <h3 className="text-xl font-semibold text-foreground">6. Anti-Theft Package ($200–$800)</h3>
        <p className="text-muted-foreground">
          Includes items like steering wheel locks, GPS tracking devices, or alarm system upgrades. Often pre-installed on the lot so the dealer can claim it can't be removed. The value is questionable — most modern vehicles already have comprehensive factory anti-theft systems.
        </p>

        <h3 className="text-xl font-semibold text-foreground">7. Undercoating ($300–$1,000)</h3>
        <p className="text-muted-foreground">
          A rust-prevention coating sprayed on the underside of the vehicle. Modern vehicles already have factory-applied corrosion protection. Dealer undercoating is rarely needed and can even void manufacturer warranties if improperly applied.
        </p>

        <h3 className="text-xl font-semibold text-foreground">8. Pinstriping ($100–$500)</h3>
        <p className="text-muted-foreground">
          Decorative lines applied along the body of the vehicle. Often pre-applied so dealers can add it to the price without asking. Costs the dealer under $20 in materials.
        </p>

        <h3 className="text-xl font-semibold text-foreground">9. Window Tint ($100–$500)</h3>
        <p className="text-muted-foreground">
          Can have legitimate value (UV protection, privacy), but dealer pricing is typically 2–3x what an independent tint shop would charge. If you want window tint, get it done after purchase for a fraction of the cost.
        </p>

        <h3 className="text-xl font-semibold text-foreground">10. Wheel Locks ($50–$200)</h3>
        <p className="text-muted-foreground">
          Special lug nuts that require a unique key to remove, intended to deter wheel theft. Available online for $15–$30. Dealer markup makes this a low-value add-on.
        </p>

        <h3 className="text-xl font-semibold text-foreground">11. Market Adjustment / ADM ($500–$10,000+)</h3>
        <p className="text-muted-foreground">
          A markup added above MSRP on high-demand vehicles. While technically not a "fee," it functions the same way — it increases the price without adding value. This is one of the most significant charges a dealer can add. See our <Link href="/market-adjustment-fee" className="underline text-foreground">market adjustment guide</Link> for how to handle it.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Fees That Are NOT Junk Fees</h2>
        <p className="text-muted-foreground">
          Some dealer charges are legitimate, even if they feel expensive:
        </p>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong>Documentation fee (doc fee)</strong> — a dealer-set charge for paperwork processing. It's regulated or capped in many states. See our <Link href="/dealer-doc-fee" className="underline text-foreground">doc fee guide</Link> and <Link href="/dealer-doc-fee-by-state" className="underline text-foreground">state-by-state caps</Link>.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong>Sales tax</strong> — set by your state and local government, not the dealer</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong>Title and registration</strong> — government-mandated fees for transferring vehicle ownership</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong>Destination charge</strong> — the manufacturer's charge for shipping the vehicle from the factory to the dealer</span>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-foreground">How to Fight Back Against Junk Fees</h2>
        <ol className="space-y-3 mb-8 text-muted-foreground list-decimal list-inside">
          <li><strong>Request an itemized out-the-door price</strong> before visiting the dealership. This forces every fee into the open.</li>
          <li><strong>Identify each line item</strong> and ask whether it's a government fee, a dealer fee, or an optional add-on.</li>
          <li><strong>Decline optional add-ons</strong> — you are not legally required to purchase dealer-installed accessories, protection packages, or services.</li>
          <li><strong>Know your state's doc fee cap</strong> — if the dealer's doc fee exceeds your state's legal limit, that's a violation. Check the <Link href="/car-dealer-fees-by-state" className="underline text-foreground">fees by state</Link> page.</li>
          <li><strong>Get a second opinion</strong> — <Link href="/analyze" className="underline text-foreground">paste your dealer quote into Odigos</Link> and we'll flag every junk fee, tell you what's missing, and give you the exact words to say back.</li>
        </ol>

        <h2 className="text-2xl font-semibold text-foreground">The FTC and Junk Fees in 2026</h2>
        <p className="text-muted-foreground">
          The Federal Trade Commission has made junk fees a regulatory priority. The FTC's Combating Auto Retail Scams (CARS) Rule, finalized in 2024, prohibits dealers from charging for add-ons that provide no benefit to the consumer and requires upfront disclosure of all fees. Several states have enacted their own junk fee laws with additional protections. This regulatory momentum means consumers have more leverage than ever to push back on suspicious charges.
        </p>
      </div>

      <ArticleCta />
    </ArticleLayout>
  );
}
