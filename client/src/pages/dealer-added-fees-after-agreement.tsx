import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy } from "lucide-react";
import { setSeoMeta } from "@/lib/seo";
import logoImage from "@assets/odigos_logo.png";

const FEES_CHANGED_MESSAGE = `Thanks. Before I move forward, I need the updated out-the-door price in writing with every added fee itemized. Please separate taxes and government fees from dealer-installed products or optional add-ons. If anything was added after our earlier quote, please show exactly what changed and why.`;

export default function DealerAddedFeesAfterAgreement() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return setSeoMeta({
      title: "Dealer Added Fees After Agreement? What to Do Next | Odigos",
      description: "You agreed on a price and now new charges appeared. Learn which dealer fees are legitimate, which are optional, and exactly what to say to get clarity before you sign.",
      path: "/dealer-added-fees-after-agreement",
    });
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(FEES_CHANGED_MESSAGE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = FEES_CHANGED_MESSAGE;
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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-dealer-added-fees-headline">
            Dealer Added Fees After Agreement? What to Do Next
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              You thought the price was settled. Maybe you got a number over text, agreed on a worksheet, or shook hands on the sales floor. Then the paperwork came out — and the total was higher. New line items appeared that weren't part of the original conversation.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              This is one of the most common frustrations in car buying. Taxes, title, and registration are expected — they're government fees that apply to every purchase. But when dealer-added charges show up after you've already committed time and energy to a deal, that's a different situation. And it's one you can handle if you know what to look for.
            </p>

            <p className="text-sm text-muted-foreground mb-6">
              Already have a dealer quote? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and see if anything is missing.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Why dealers add fees after the agreement</h2>

            <p className="text-lg text-muted-foreground mb-6">
              Many dealerships separate the buying process into stages. You negotiate the vehicle price with a salesperson, then move to the finance office for the paperwork. By the time you're sitting across from the finance manager, you've already invested hours — test drives, trade-in appraisals, back-and-forth on price. That momentum works in the dealer's favor.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              Common patterns include introducing add-on products late in the process, presenting optional items as though they come standard with the vehicle, slipping protection packages into the worksheet without a separate conversation, and relying on buyer fatigue after a long negotiation. None of this means every dealer is acting in bad faith — but it does mean the buyer needs to stay attentive when the final numbers come out.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Which fees are legitimate and which are red flags</h2>

            <p className="text-lg text-muted-foreground mb-4">
              Some charges are unavoidable. These are set or collected by government agencies and will appear on every car purchase:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Sales tax</strong> — determined by your state and local jurisdiction.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Title and registration</strong> — government fees that vary by state, typically $100–$500.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground"><Link href="/dealer-doc-fee" className="underline text-foreground">Dealer documentation fee</Link></strong> — a processing charge that's standard but varies widely. Some states cap it; others don't.</span>
              </li>
            </ul>

            <p className="text-lg text-muted-foreground mb-4">
              Then there are charges that should prompt questions. These aren't automatically illegitimate, but a fee appearing on paperwork doesn't make it required. The <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC's guide for car buyers</a> outlines what dealers must disclose — and many of the items below fall outside that:
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
                <span><strong className="text-foreground">Nitrogen-filled tires</strong> — negligible benefit for everyday driving; many tire shops offer nitrogen for free.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Theft recovery systems</strong> — often pre-installed and presented as non-removable, but rarely required.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Reconditioning or dealer prep fees</strong> — covers tasks already included in the vehicle's price.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Market adjustment / ADM</strong> — pure dealer profit above MSRP. Always negotiable when inventory allows.</span>
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What to say when the price changes</h2>

            <p className="text-muted-foreground mb-4">
              If new fees appear after your original agreement, send this message. You can copy and paste it directly:
            </p>

            <Card className="relative p-5 bg-muted/50 mb-4">
              <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic pr-10">
                {FEES_CHANGED_MESSAGE}
              </blockquote>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-3 right-3"
                onClick={handleCopy}
                data-testid="button-copy-fees-message"
                aria-label="Copy message"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </Card>

            <p className="text-muted-foreground mb-6">
              This works because it's specific and calm. It doesn't accuse anyone of anything — it simply asks for transparency. By requesting that government fees be separated from dealer-added products, you make it easy to see exactly what changed and decide what to accept.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What if they say the fees are non-negotiable?</h2>

            <p className="text-lg text-muted-foreground mb-6">
              Even when a dealer says a charge can't be removed, you still have options:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Ask which items are required by state law and which are dealer-added. That question alone separates the real fees from the optional ones.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Request removal of any optional products you didn't agree to — protection packages, etching, nitrogen, extended warranties.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>If the dealer won't budge on a fixed charge like the doc fee, negotiate the vehicle price down to offset it. The total is what matters.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>If the breakdown is still vague or the dealer won't itemize, you can walk away. You are not obligated to sign.</span>
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How to protect yourself before you go in</h2>

            <p className="text-lg text-muted-foreground mb-6">
              The strongest position is having the full <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> in writing before you visit the dealership — every dollar itemized, including tax, title, registration, doc fee, and any dealer-installed products. When you have that baseline, anything that changes later is something you can name and question. Without it, you're comparing a memory to a worksheet, and that's a much harder negotiation.
            </p>

            <p className="text-lg text-muted-foreground mb-8">
              If you already have a text, quote, or worksheet where the numbers changed from what you originally agreed to, paste it into Odigos. We'll show you what's there, what's missing, and what to ask next — before you sign anything.
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
              <Button size="lg" data-testid="button-cta-dealer-added-fees">
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
