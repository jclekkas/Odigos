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
import SourceCitation from "@/components/SourceCitation";
import { ARTICLE_SOURCES } from "@/data/articleSources";

const DECLINE_ADDONS_MESSAGE = `I'd like to move forward with the vehicle, but without the dealer-installed add-ons. Please send me an updated out-the-door price with only the base vehicle price, taxes, title, registration, and your documentation fee. If any add-ons can't be removed, please list each one separately with pricing so I can evaluate them individually.`;

export default function AreDealerAddOnsMandatory() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSeoMeta({
      title: "Are Dealer Add-Ons Mandatory? What You Can Refuse | Odigos",
      description: "Are dealer add-ons mandatory? Learn which are legally required vs optional, what each one actually costs the dealer, and how to push back without losing the deal.",
      path: "/are-dealer-add-ons-mandatory",
    });
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(DECLINE_ADDONS_MESSAGE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = DECLINE_ADDONS_MESSAGE;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <ArticleLayout title="Are Dealer Add-Ons Mandatory? What You Can Actually Refuse">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "Are Dealer Add-Ons Mandatory? What You Can Refuse | Odigos", description: "Are dealer add-ons mandatory? Learn which are legally required vs optional, what each one actually costs the dealer, and how to push back without losing the deal.", path: "/are-dealer-add-ons-mandatory" }))}</script>
      </Helmet>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-addons-headline">
            Are Dealer Add-Ons Mandatory? What You Can Refuse and What You Can't
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground">
              You found the car you want, asked for the price, and the quote came back with a list of extras you didn't ask for — paint protection, fabric coating, VIN etching, nitrogen tires, a "protection package." The dealer says they're included, already installed, or required. In almost every case, they're not.{" "}<SourceCitation sources={ARTICLE_SOURCES["are-dealer-add-ons-mandatory"].sources} lastVerified={ARTICLE_SOURCES["are-dealer-add-ons-mandatory"].lastVerified} />
            </p>

            <p className="text-lg text-muted-foreground">
              Dealer add-ons are products or services added by the dealership, not the manufacturer. They're profit items. Understanding what's truly mandatory versus what's dealer profit padding can save you hundreds — sometimes thousands — on your next car purchase.
            </p>

            <h2 className="text-2xl font-semibold text-foreground">What's actually required vs. what's optional</h2>

            <p className="text-lg text-muted-foreground">
              Every car purchase includes government-mandated charges. These are non-negotiable because they're set by your state, not the dealer:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Sales tax</strong> — determined by your state and local jurisdiction.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Title and registration</strong> — government fees that vary by state.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground"><Link href="/dealer-doc-fee" className="underline text-foreground">Documentation fee</Link></strong> — a dealer processing charge. Some states cap it; others don't. It's standard, though the amount varies widely.</span>
              </li>
            </ul>

            <p className="text-lg text-muted-foreground">
              Everything beyond those categories is a dealer-added product. The <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC's new car buying guide</a> confirms this distinction. If someone tells you an add-on is "required by law," ask them to show you the statute. They won't be able to.
            </p>

            <h2 className="text-2xl font-semibold text-foreground">What each add-on actually costs the dealer</h2>

            <p className="text-lg text-muted-foreground">
              The markup on dealer add-ons is where the real money is. Here's what dealers typically charge versus what these products actually cost them:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Paint or fabric protection</strong> — dealer cost is typically $50–$100, often marked up to $500–$1,500. Factory paint is already designed to resist normal wear. Aftermarket ceramic coatings from a detailer are typically better quality and far cheaper. See <a href="https://www.edmunds.com/car-buying/what-fees-should-you-pay-at-a-car-dealership.html" target="_blank" rel="noopener" className="underline text-foreground">Edmunds' fee breakdown</a> for more on what these charges really cost.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">VIN etching</strong> — a $20–$30 DIY service commonly charged at $200–$400. Some insurance companies offer it for free.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Nitrogen-filled tires</strong> — negligible benefit for everyday driving. Dealers charge $100–$300. Many tire shops offer nitrogen for free.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Window tint, door edge guards, wheel locks</strong> — dealer-installed accessories with significant markup over aftermarket alternatives.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Theft recovery or alarm systems</strong> — often pre-installed and presented as non-removable, but rarely required.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">"Protection packages"</strong> — bundles that combine several low-cost items (each $20–$50 to the dealer) into a single $1,000–$2,500 line item. Bundling makes it harder to evaluate each product individually.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Extended warranties and service contracts</strong> — these can have value, but they're always optional and can usually be purchased later from third-party providers for less.</span>
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground">Why dealers present add-ons as mandatory</h2>

            <p className="text-lg text-muted-foreground">
              Dealer add-ons are a significant profit center. When a dealer says "it comes with the car" or "we can't remove that," they're usually describing a business decision, not a legal requirement. Common tactics include pre-installing products before you arrive so they can claim removal isn't possible, bundling multiple low-value items into a single package with a higher price tag, presenting optional extras as though they come standard, and using language like "mandatory" or "required" for charges that are neither.
            </p>

            <h2 className="text-2xl font-semibold text-foreground">What "already installed" actually means</h2>

            <p className="text-lg text-muted-foreground">
              This is the most common justification. The dealer pre-installs products on inventory vehicles, then tells buyers the items can't be removed because they're "already on the car." Here's what they won't tell you: the decision to install those products was the dealer's, not yours. You didn't request them. You are under no obligation to pay for products you didn't ask for.
            </p>
            <p className="text-lg text-muted-foreground">
              If a dealer won't sell you the car without the package, you can walk away — or negotiate the overall price down to offset the add-ons. If you don't want to pay for a pre-installed add-on, ask for the vehicle price to be reduced by that amount.
            </p>

            <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm font-semibold text-foreground mb-2">Not sure which charges in your quote are optional?</p>
              <p className="text-sm text-muted-foreground mb-3">
                Paste your dealer quote into Odigos. We'll flag every add-on, show what's negotiable, and give you the specific language to push back.
              </p>
              <Link href="/analyze">
                <Button variant="cta" size="sm" data-testid="button-cta-mid-article-are-mandatory">
                  Analyze My Dealer Quote
                </Button>
              </Link>
            </div>

            <h2 className="text-2xl font-semibold text-foreground">How to push back</h2>

            <p className="text-muted-foreground">
              You don't need to get confrontational. A direct, professional response works best:
            </p>
            <div className="rounded-md border border-border p-5 bg-muted/50 mb-4">
              <p className="text-sm md:text-base text-foreground leading-relaxed italic">
                "I'm not interested in the add-on package. I'd like the out-the-door price based on the vehicle sale price, taxes, registration, and doc fee only. Can you provide that in writing?"
              </p>
            </div>
            <p className="text-muted-foreground">
              If they say the add-ons can't be removed:
            </p>
            <div className="rounded-md border border-border p-5 bg-muted/50 mb-4">
              <p className="text-sm md:text-base text-foreground leading-relaxed italic">
                "I understand the items are installed. I'm asking you to reduce the vehicle price by the cost of the add-on package so the total out-the-door price reflects the car's value without optional accessories."
              </p>
            </div>

            <p className="text-muted-foreground">
              Or copy and paste this message to request a clean quote:
            </p>

            <Card className="relative p-5 bg-muted/50 mb-4">
              <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic pr-10">
                {DECLINE_ADDONS_MESSAGE}
              </blockquote>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-3 right-3"
                onClick={handleCopy}
                data-testid="button-copy-addons-message"
                aria-label="Copy message"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </Card>

            <h2 className="text-2xl font-semibold text-foreground">If the dealer won't budge</h2>

            <p className="text-lg text-muted-foreground">
              Some dealers genuinely won't remove pre-installed add-ons. That doesn't mean you're stuck:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Ask for the vehicle price to be reduced to offset the cost of unwanted add-ons. The total is what matters.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Get quotes from other dealers selling the same vehicle. If one includes $2,000 in add-ons and another doesn't, you have clear leverage.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Ask the dealer to separate each add-on with individual pricing. If they won't itemize, that's a red flag.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Walk away. You are never obligated to sign, and walking is often the most effective negotiating tool you have.</span>
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground">How to spot add-ons before you go in</h2>

            <p className="text-lg text-muted-foreground">
              The best time to deal with unwanted add-ons is before you visit the dealership. Request the full <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> in writing — every line item visible. When you can see each charge individually, you can decide what's worth paying for and what to push back on before you're in the finance office.
            </p>

            <p className="text-lg text-muted-foreground">
              Add-ons are most dangerous when they're buried in a monthly payment. A $1,500 protection package adds about $25–$30/month over a 60-month loan — small enough that many buyers don't notice. But you're paying interest on that amount too, so the real cost is even higher. That's why the out-the-door price is the only number that matters.
            </p>

            <p className="text-lg text-muted-foreground">
              Watch for <Link href="/market-adjustment-fee" className="underline text-foreground">market adjustment fees</Link> too — these are a separate type of markup that appears above MSRP on the sticker itself, distinct from dealer-installed add-ons. The full <Link href="/dealer-add-ons-list" className="underline text-foreground">dealer add-ons list</Link> covers the most common extras in detail, including typical markup ranges.
            </p>
          </div>

          <ArticleCta />

          <p className="text-xs text-muted-foreground mt-12">
            Not affiliated with any dealership. Optimized for U.S. car purchases.
          </p>
    </ArticleLayout>
  );
}
