import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy } from "lucide-react";
import { setSeoMeta } from "@/lib/seo";
import ArticleHeader from "@/components/ArticleHeader";
import { trackCtaClick } from "@/lib/tracking";
import DirectAnswerBlock from "@/components/DirectAnswerBlock";

const DOC_FEE_MESSAGE = `Hi — I'd like to move forward, but first I need a few things in writing. Can you send me the full out-the-door price with every fee itemized? Specifically, please break out the documentation fee separately and show me what it covers. I'd also like to see taxes, title, and registration listed on their own lines so I can compare easily. Thanks.`;

export default function DocFeeTooHigh() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return setSeoMeta({
      title: "Dealer Doc Fee Too High? What You Can Actually Do | Odigos",
      description: "Doc fees vary widely by state and dealer. Learn what's normal, whether you can negotiate, and what red flags to watch for when a dealer's documentation fee seems too high.",
      path: "/doc-fee-too-high",
    });
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(DOC_FEE_MESSAGE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = DOC_FEE_MESSAGE;
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

      <ArticleHeader slug="doc-fee-too-high" />

      <main className="py-12 md:py-20 px-6">
        <article className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-doc-fee-headline">
            Dealer Doc Fee Too High? What You Can Actually Do
          </h1>

          <DirectAnswerBlock
            question="Is the dealer's doc fee too high?"
            answer="Doc fees above $500 may be high depending on your state. Some states cap them by law while others have no limit. Although usually non-negotiable, you can ask the dealer to offset it against the sale price. Researching typical doc fees in your state helps you recognize when one is genuinely outside the normal range."
          />

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              The documentation fee — sometimes called a "doc fee" or "dealer prep fee" — is one of the most common charges added to a car deal. It's supposed to cover the cost of processing your paperwork: title, registration, loan documents, and filing. But the amount dealers charge for this work varies wildly, from under $100 in some states to over $1,000 in others. If your doc fee looks too high, you're right to question it.
            </p>

            <div className="my-6 rounded-lg border border-border bg-muted/40 p-4">
              <p className="font-medium text-foreground mb-3">Doc fee looks too high? Paste your quote to see how it stacks up.</p>
              <Link href="/analyze?src=doc-fee-too-high">
                <Button size="sm" data-testid="button-callout-doc-fee-high" onClick={() => trackCtaClick({ location: "article_top_callout", article: "doc-fee-too-high" })}>Check My Deal</Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-2">Takes 10 seconds · No signup required</p>
            </div>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What's a normal doc fee?</h2>

            <p className="text-lg text-muted-foreground mb-6">
              There's no single "normal" amount — it depends on where you're buying. Some states cap doc fees by law. For example, California limits the fee to $85, while Florida and Colorado have no cap at all. In states without regulation, dealers may charge $500, $700, or even more. For a deeper look at what the <Link href="/dealer-doc-fee" className="underline text-foreground">dealer doc fee</Link> typically covers and how it varies by state, see our full breakdown.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              A reasonable rule of thumb: if the doc fee is significantly higher than what other dealers in your area charge for the same service, it's worth pushing back. You can check what's typical in your state through the <a href="https://www.ftc.gov/business-guidance/resources/dealers-guide-federal-requirement-used-car-rule" target="_blank" rel="noopener" className="underline text-foreground">FTC's dealer guidance</a> and your state's attorney general website.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Can you negotiate a doc fee?</h2>

            <p className="text-lg text-muted-foreground mb-6">
              In most cases, yes — but it depends on the state and the dealer. Some dealers claim the doc fee is "set by the state" or "non-negotiable." In states without a cap, that's not true. The fee is set by the dealership, and it's the same for every customer only because the dealer chooses to make it that way.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              Even in states that cap doc fees, the cap is a maximum — not a minimum. You can always ask the dealer to reduce it. If the dealer won't budge on the doc fee specifically, you can negotiate the vehicle price down by the same amount. The total <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> is what matters, not any individual line item.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What to say to the dealer</h2>

            <p className="text-muted-foreground mb-4">
              If the doc fee looks too high or wasn't disclosed upfront, send this message. You can copy and paste it directly:
            </p>

            <Card className="relative p-5 bg-muted/50 mb-4">
              <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic pr-10">
                {DOC_FEE_MESSAGE}
              </blockquote>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-3 right-3"
                onClick={handleCopy}
                data-testid="button-copy-doc-fee-message"
                aria-label="Copy message"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </Card>

            <p className="text-muted-foreground mb-6">
              This works because it's specific and professional. You're not accusing anyone — you're asking for a clear breakdown so you can evaluate the total deal on your terms.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What to ask upfront</h2>

            <p className="text-lg text-muted-foreground mb-6">
              Before you get deep into negotiation, ask the dealer to provide the full out-the-door price — including the doc fee. This way, the doc fee is part of the total number you're evaluating, not a surprise at the end.
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>"What is your documentation fee, and is it included in the OTD price you quoted?"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>"Is the doc fee the same for every customer, or is there flexibility?"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>"Can you send me an itemized breakdown of every fee included in the total price?"</span>
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Red flags</h2>

            <p className="text-lg text-muted-foreground mb-6">
              Not every high doc fee is a problem on its own — but certain patterns suggest the fee is being used to inflate the deal:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">The fee wasn't disclosed until the finance office.</strong> If you negotiated a price and then a $700 doc fee appeared at signing, the dealer intentionally withheld it from the earlier discussion.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">The fee is well above the local average.</strong> If dealers in your area typically charge $200–$400 and you're being quoted $900, that's padding.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">The dealer says the fee is "required by law."</strong> No state requires a specific doc fee amount. States may cap it, but no state mandates a minimum.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">There are multiple vague fees that look like the same thing.</strong> If you see a "doc fee" plus a "processing fee" plus a "dealer services fee," some of those may be duplicative or made up entirely. This kind of stacking is also common with <Link href="/market-adjustment-fee" className="underline text-foreground">market adjustment fees</Link>.</span>
              </li>
            </ul>

            <p className="text-lg text-muted-foreground mb-8">
              If charges appeared on your deal that weren't part of the original discussion, that's a separate issue — read about <Link href="/dealer-added-fees-after-agreement" className="underline text-foreground">fees added after the agreement</Link>. If you already have a quote with a doc fee that seems high, Odigos can analyze the full breakdown and flag anything that doesn't add up.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-semibold mb-3 text-foreground" data-testid="text-doc-fee-high-cta-heading">
              Doc fee look inflated to you?
            </h2>
            <p className="text-muted-foreground mb-6">Paste the quote and Odigos flags the fee, compares it to your state, and tells you exactly what to say to push back.</p>
            <Link href="/analyze?src=doc-fee-too-high">
              <Button size="lg" data-testid="button-cta-doc-fee" onClick={() => trackCtaClick({ location: "article_bottom_cta", article: "doc-fee-too-high" })}>
                Check the Doc Fee
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
