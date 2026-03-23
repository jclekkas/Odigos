import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

export default function MandatoryDealerAddOns() {
  useEffect(() => {
    return setSeoMeta({
      title: "Mandatory Dealer Add-Ons: Which Are Actually Required by the Dealer | Odigos",
      description: "Understand which dealer add-ons are truly required, which are optional, and why dealers pre-install extras to increase profit.",
      path: "/mandatory-dealer-add-ons",
    });
  }, []);

  return (
    <ArticleLayout title="Are Dealer Add-Ons Really Mandatory?">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "Mandatory Dealer Add-Ons: Which Are Actually Required by the Dealer | Odigos", description: "Understand which dealer add-ons are truly required, which are optional, and why dealers pre-install extras to increase profit.", path: "/mandatory-dealer-add-ons" }))}</script>
      </Helmet>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-add-ons-headline">
            Mandatory Dealer Add-Ons: Which Are Actually Required
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-4">
              Walk into almost any dealership and you'll eventually hear some version of: "These add-ons are already installed — they're part of the vehicle." Paint protection, nitrogen-filled tires, VIN etching, fabric coating, wheel locks, window tinting. The list varies by dealer, but the approach is the same: present optional products as if they're non-negotiable.
            </p>
            <p className="text-lg text-muted-foreground mb-10">
              The truth? Almost none of these add-ons are legally required. Understanding what's truly mandatory versus what's dealer profit padding can save you hundreds — sometimes thousands — on your next car purchase.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What Counts as a Dealer Add-On?</h2>
            <p className="text-muted-foreground mb-4">
              A dealer add-on is any product or service the dealership installs or bundles on top of the manufacturer's base vehicle. These are not factory options chosen by the buyer — they're installed by the dealer before you arrive, often without any notification upfront.
            </p>
            <p className="text-muted-foreground mb-8">
              The full <Link href="/dealer-add-ons-list" className="underline text-foreground">dealer add-ons list</Link> covers the most common extras in detail, including typical markup ranges. Some dealers bundle multiple items into a single "protection package" with a combined price, making it harder to see what you're actually paying for each product.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What's Actually Required by Law?</h2>
            <p className="text-muted-foreground mb-4">
              Very little. In most states, the only fees legally required on a car purchase are:
            </p>
            <ul className="space-y-2 mb-4 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                <span>State and local sales tax</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                <span>Title and registration fees (set by the state)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                <span>Emission or inspection fees (where applicable)</span>
              </li>
            </ul>
            <p className="text-muted-foreground mb-8">
              Everything beyond that — documentation fees, dealer-installed accessories, protection packages — is set by the dealer, not the government. The <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC's new car buying guide</a> confirms this distinction. If someone tells you an add-on is "required by law," ask them to show you the statute. They won't be able to, because it doesn't exist.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What Each Add-On Actually Costs the Dealer</h2>
            <p className="text-muted-foreground mb-4">
              The markup on dealer add-ons is where the real money is. Here's what dealers typically charge versus what these products actually cost them:
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">Paint Protection / Ceramic Coating</h3>
            <p className="text-muted-foreground mb-4">
              Dealers charge $500–$1,500 for paint protection that often costs them $50–$100 to apply. Factory paint is already designed to resist normal wear. Aftermarket ceramic coatings from a detailer are typically better quality and far cheaper than the dealer's version. See <a href="https://www.edmunds.com/car-buying/what-fees-should-you-pay-at-a-car-dealership.html" target="_blank" rel="noopener" className="underline text-foreground">Edmunds' fee breakdown</a> for more on what these charges really cost.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">Nitrogen-Filled Tires</h3>
            <p className="text-muted-foreground mb-4">
              Nitrogen does lose pressure slightly slower than regular air, but the difference is negligible for everyday driving. Dealers charge $100–$300 for something that many tire shops offer for free or near-free. You can fill your tires with regular air at any gas station without issue.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">VIN Etching</h3>
            <p className="text-muted-foreground mb-4">
              VIN etching involves engraving your vehicle identification number on windows as a theft deterrent. Dealers charge $200–$400 for this. DIY kits cost $20–$30. Some insurance companies offer it for free. The actual theft deterrence value is debatable, and it is never legally required.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">Protection Packages / Dealer Bundles</h3>
            <p className="text-muted-foreground mb-8">
              The most common tactic is bundling several low-cost items into one package priced at $1,000–$2,500. You'll see names like "Advantage Package," "Dealer Protection Plan," or "Certified Shield." Each individual item might cost the dealer $20–$50. The combined price is almost entirely profit margin. Bundling also prevents you from evaluating each item on its merits.
            </p>

            <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm font-semibold text-foreground mb-2">Have a dealer quote with add-ons included?</p>
              <p className="text-sm text-muted-foreground mb-3">
                Paste it into Odigos and we'll flag which charges are optional, what they're typically marked up to, and what to say to get them removed.
              </p>
              <Link href="/analyze">
                <Button variant="cta" size="sm" data-testid="button-cta-mid-article-mandatory-addons">
                  Analyze My Dealer Quote
                </Button>
              </Link>
            </div>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">When Dealers Say "It's Already Installed"</h2>
            <p className="text-muted-foreground mb-4">
              This is the most common justification for charging for add-ons. The dealer pre-installs products on inventory vehicles, then tells buyers the items can't be removed because they're "already on the car."
            </p>
            <p className="text-muted-foreground mb-4">
              Here's what they won't tell you: the decision to install those products was the dealer's, not yours. You didn't request them. In many cases, the dealer chose to install them specifically because they increase the final price and improve their margin.
            </p>
            <p className="text-muted-foreground mb-8">
              You are under no obligation to pay for products you didn't ask for. If a dealer won't sell you the car without the package, you can walk away — or negotiate the overall price down to offset the add-ons. For specific language to use in this situation, see our guide on <Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">what to say when a dealer claims add-ons are mandatory</Link>.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How to Push Back</h2>
            <p className="text-muted-foreground mb-3">
              You don't need to get confrontational. A direct, professional response works best:
            </p>
            <div className="rounded-md border border-border p-5 bg-muted/50 mb-4">
              <p className="text-sm md:text-base text-foreground leading-relaxed italic">
                "I'm not interested in the add-on package. I'd like the out-the-door price based on the vehicle sale price, taxes, registration, and doc fee only. Can you provide that in writing?"
              </p>
            </div>
            <p className="text-muted-foreground mb-4">
              If they say the add-ons can't be removed:
            </p>
            <div className="rounded-md border border-border p-5 bg-muted/50 mb-8">
              <p className="text-sm md:text-base text-foreground leading-relaxed italic">
                "I understand the items are installed. I'm asking you to reduce the vehicle price by the cost of the add-on package so the total out-the-door price reflects the car's value without optional accessories."
              </p>
            </div>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Why Getting a Written OTD Price Matters</h2>
            <p className="text-muted-foreground mb-4">
              Add-ons are most dangerous when they're buried in a monthly payment. A $1,500 protection package adds about $25–$30/month over a 60-month loan — small enough that many buyers don't notice. But you're paying interest on that amount too, so the real cost is even higher.
            </p>
            <p className="text-muted-foreground mb-4">
              That's why the <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> is the only number that matters. It shows every dollar you'll pay, including add-ons, fees, and taxes. When you see each line item broken out, it's much easier to spot what's legitimate and what's padding. Use <a href="https://www.kbb.com/car-advice/" target="_blank" rel="noopener" className="underline text-foreground">Kelley Blue Book</a> to research fair vehicle values so you have a baseline before negotiating.
            </p>
            <p className="text-muted-foreground mb-8">
              Always request a written, itemized OTD quote before visiting the dealership. If a dealer won't provide one, see our guide on <Link href="/dealer-wont-give-otd" className="underline text-foreground">what to do when a dealer won't give you the out-the-door price</Link>.
            </p>
          </div>


          <ArticleCta />

          <p className="text-xs text-muted-foreground mt-12">
            Not affiliated with any dealership. Optimized for U.S. car purchases.
          </p>
    </ArticleLayout>
  );
}
