import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy } from "lucide-react";
import { setSeoMeta } from "@/lib/seo";
import logoImage from "@assets/odigos_logo.png";

const DECLINE_ADDONS_MESSAGE = `I'd like to move forward with the vehicle, but without the dealer-installed add-ons. Please send me an updated out-the-door price with only the base vehicle price, taxes, title, registration, and your documentation fee. If any add-ons can't be removed, please list each one separately with pricing so I can evaluate them individually.`;

export default function AreDealerAddOnsMandatory() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return setSeoMeta({
      title: "Are Dealer Add-Ons Mandatory? What You Can Actually Refuse | Odigos",
      description: "Most dealer add-ons are optional, even when presented as required. Learn which charges you can decline, how to tell the difference, and what to say to get them removed.",
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
    <div className="min-h-screen bg-background">

      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center gap-3">
          <Link href="/">
            <img src={logoImage} alt="Odigos" className="h-28 w-auto cursor-pointer" data-testid="link-logo-home" />
          </Link>
        </div>
      </header>

      <main className="py-12 md:py-20 px-6">
        <article className="max-w-[700px] mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-addons-headline">
            Are Dealer Add-Ons Mandatory? What You Can Actually Refuse
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              You found the car you want, asked for the price, and the quote came back with a list of extras you didn't ask for — paint protection, fabric coating, VIN etching, nitrogen tires, a "protection package." The dealer says they're included, already installed, or required. In almost every case, they're not.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              Dealer add-ons are products or services added by the dealership, not the manufacturer. They're profit items. Understanding which charges are actually required and which are optional puts you in a much stronger position before you sign anything.
            </p>

            <p className="text-sm text-muted-foreground mb-6">
              Already have a dealer quote? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and see if anything is missing.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What's actually required vs. what's optional</h2>

            <p className="text-lg text-muted-foreground mb-4">
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

            <p className="text-lg text-muted-foreground mb-4">
              Everything beyond those categories is a dealer-added product — and virtually all of them are optional, regardless of how they're presented:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Paint or fabric protection</strong> — dealer cost is typically $50–$100, often marked up to $500–$1,500.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">VIN etching</strong> — a $20–$30 service commonly charged at $200–$400.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Nitrogen-filled tires</strong> — negligible benefit for everyday driving. Many tire shops offer nitrogen for free.</span>
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
                <span><strong className="text-foreground">"Protection packages"</strong> — bundles that combine several low-cost items into a single high-markup line item. Bundling makes it harder to evaluate each product individually.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Extended warranties and service contracts</strong> — these can have value, but they're always optional and can usually be purchased later from third-party providers for less.</span>
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Why dealers present add-ons as mandatory</h2>

            <p className="text-lg text-muted-foreground mb-6">
              Dealer add-ons are a significant profit center. When a dealer says "it comes with the car" or "we can't remove that," they're usually describing a business decision, not a legal requirement. Common tactics include pre-installing products before you arrive so they can claim removal isn't possible, bundling multiple low-value items into a single package with a higher price tag, presenting optional extras as though they come standard with every vehicle on the lot, and using language like "mandatory" or "required" for charges that are neither.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              None of this means every dealer is trying to mislead you. But it does mean you should treat any charge beyond taxes, title, registration, and the doc fee as something you can question. Some dealers also add a <Link href="/market-adjustment-fee" className="underline text-foreground">market adjustment fee</Link> on top of add-ons — pure markup with no product attached. The <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC's guide for car buyers</a> outlines what dealers are required to disclose and what rights you have as a buyer.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What "already installed" actually means</h2>

            <p className="text-lg text-muted-foreground mb-6">
              One of the most common responses you'll hear is "it's already on the car." This is true — the product may already be applied or installed. But that doesn't mean you agreed to pay for it, and it doesn't eliminate your ability to negotiate the price. If a dealer added paint protection before you walked in, that was their decision. You're negotiating the total price, not approving a parts list. If you don't want to pay for a pre-installed add-on, you can ask for the vehicle price to be reduced by that amount.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What to say when you want add-ons removed</h2>

            <p className="text-muted-foreground mb-4">
              If your quote includes add-ons you didn't ask for, send this message. You can copy and paste it directly:
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

            <p className="text-muted-foreground mb-6">
              This works because it doesn't argue about individual products — it asks for the clean baseline price and leaves room to evaluate each add-on on its own merits. It's specific, professional, and puts the burden of itemization on the dealer.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">If the dealer won't budge</h2>

            <p className="text-lg text-muted-foreground mb-6">
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
                <span>Ask the dealer to separate each add-on with individual pricing. If they won't itemize, that's a red flag worth taking seriously.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Walk away. You are never obligated to sign, and walking is often the most effective negotiating tool you have. For a broader view of how dealers structure pricing, see our <Link href="/dealer-pricing-tactics" className="underline text-foreground">complete guide to dealer pricing tactics</Link>.</span>
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How to spot add-ons before you go in</h2>

            <p className="text-lg text-muted-foreground mb-6">
              The best time to deal with unwanted add-ons is before you visit the dealership. Request the full <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> in writing — every line item visible, including the vehicle price, taxes, government fees, the doc fee, and any dealer-installed products. When you can see each charge individually, you can decide what's worth paying for and what to push back on before you're in the finance office.
            </p>

            <p className="text-lg text-muted-foreground mb-8">
              If you already have a dealer quote and aren't sure which charges are optional, paste it into Odigos. We'll flag the add-ons, show you what's negotiable, and give you a clear picture of what the car actually costs without the extras. And if new charges appeared after you thought the deal was done, read about <Link href="/dealer-added-fees-after-agreement" className="underline text-foreground">fees added after the agreement</Link>.
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
              <Button size="lg" data-testid="button-cta-addons">
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
