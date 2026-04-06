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

const CONCESSION_MESSAGE = `I've reviewed the quote and I'm ready to move forward, but I'd like to meet in the middle on a few of the dealer-installed items. Specifically, I'm looking to either remove [add-on name] and [add-on name], or have the vehicle price adjusted down to reflect not wanting those items. I have a competing quote without these extras — I'd prefer to work with you if the numbers are close.`;

export default function AreDealerAddOnsNegotiable() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSeoMeta({
      title: "Are Dealer Add-Ons Negotiable? What Dealers Will Actually Concede | Odigos",
      description: "Most dealer add-ons are negotiable, but not all. Learn which extras dealers will drop, when to push, and how to anchor your ask to get real concessions.",
      path: "/are-dealer-add-ons-negotiable",
    });
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CONCESSION_MESSAGE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = CONCESSION_MESSAGE;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <ArticleLayout title="Are Dealer Add-Ons Negotiable?">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "Are Dealer Add-Ons Negotiable? What Dealers Will Actually Concede | Odigos", description: "Most dealer add-ons are negotiable, but not all. Learn which extras dealers will drop, when to push, and how to anchor your ask to get real concessions.", path: "/are-dealer-add-ons-negotiable" }))}</script>
      </Helmet>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-negotiable-headline">
        Are Dealer Add-Ons Negotiable? What Dealers Will Actually Concede
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground">
          Yes — most dealer add-ons are negotiable, even when the dealer tells you they're not. The key is knowing which ones dealers regularly drop, when your timing gives you leverage, and how to frame the ask so you're negotiating the right thing.
        </p>

        <p className="text-lg text-muted-foreground">
          This isn't about arguing. It's about understanding that add-ons are a profit center, not a fixed cost — and that dealers have more flexibility than they let on.
        </p>

        <p className="text-sm text-muted-foreground">
          Already have a quote with add-ons? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and see what's actually negotiable.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">What dealers will almost always concede</h2>

        <p className="text-lg text-muted-foreground">
          Some add-ons are easy wins because they're cheap to produce and the dealer knows their value is hard to defend:
        </p>

        <ul className="space-y-2 mb-6 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">VIN etching</strong> — a $20–$30 service marked up to $200–$400. Dealers rarely fight hard to keep this one.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">Nitrogen-filled tires</strong> — the cost is minimal and many tire shops offer nitrogen for free. Dealers will often remove or reduce this without much pushback.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">Door edge guards and wheel locks</strong> — low-cost accessories that dealers can drop when they sense a deal is at risk.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">Protection packages</strong> — these bundles have the most inflated margins, which means there's the most room to negotiate. Asking for individual pricing on each item in the bundle often gets you a better deal or removal of items you don't want.</span>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-foreground">What dealers will rarely remove</h2>

        <p className="text-lg text-muted-foreground">
          Some add-ons are harder to negotiate out because they're physically installed or have a plausible value argument:
        </p>

        <ul className="space-y-2 mb-6 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">Window tint</strong> — already applied to the glass. The dealer will say it can't be removed. The price, however, is still negotiable — the vehicle price can be reduced to offset it.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">Paint sealant or ceramic coating</strong> — applied before delivery. Same dynamic: removal isn't realistic, but the price impact on your total is negotiable.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">GPS or theft recovery systems</strong> — often wired into the vehicle. These are the toughest to negotiate out entirely, though some dealers will reduce the price or include them free.</span>
          </li>
        </ul>

        <p className="text-lg text-muted-foreground">
          The point isn't whether something can be physically removed — it's whether you're paying for it. If a dealer pre-installed paint protection before you arrived, that was their business decision. You're negotiating the <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link>, not a parts manifest.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">When timing gives you leverage</h2>

        <p className="text-lg text-muted-foreground">
          Timing matters more than most buyers realize:
        </p>

        <ul className="space-y-2 mb-6 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">End of month</strong> — salespeople are working toward monthly quotas. The last few days of the month, dealers are more willing to cut margins to close deals.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">Vehicle sitting on the lot</strong> — if a car has been there 60–90 days, the dealer is paying floor plan interest on it. They're more motivated to move it.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">Multiple competing quotes in hand</strong> — showing that another dealer is offering the same vehicle without the add-ons creates real leverage. It's not a bluff if it's true.</span>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-foreground">How to anchor the negotiation correctly</h2>

        <p className="text-lg text-muted-foreground">
          Most buyers make the mistake of negotiating the monthly payment. This obscures the real numbers and lets the dealer absorb concessions in ways you can't see. Always negotiate the total vehicle price — or the specific add-on price — not the monthly number.
        </p>

        <p className="text-lg text-muted-foreground">
          If a dealer won't remove an add-on, ask for the vehicle price to be reduced by that amount. If they won't do that, ask them to itemize each add-on individually with pricing. When dealers have to defend individual line items, the inflated markup becomes harder to justify.
        </p>

        <p className="text-lg text-muted-foreground">
          For a broader look at whether <Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">add-ons are required at all</Link>, or if you want to know <Link href="/how-to-remove-dealer-add-ons" className="underline text-foreground">how to remove dealer add-ons</Link> step by step, those guides cover the process in more detail.
        </p>

        <div className="rounded-lg border border-border bg-muted/30 p-5 mb-8">
          <p className="text-sm font-medium text-foreground mb-2">Mid-article check</p>
          <p className="text-sm text-muted-foreground">
            If you already have a quote and want to know which add-ons have the most margin — and which ones are most likely to budge — <Link href="/analyze" className="underline text-foreground">paste it into Odigos</Link> for a breakdown.
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-foreground">What to say to the dealer</h2>

        <p className="text-muted-foreground">
          When you're ready to push back on specific add-ons, use this message. Replace the bracketed items with the actual add-on names from your quote:
        </p>

        <Card className="relative p-5 bg-muted/50 mb-4">
          <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic pr-10">
            {CONCESSION_MESSAGE}
          </blockquote>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-3 right-3"
            onClick={handleCopy}
            data-testid="button-copy-negotiable-message"
            aria-label="Copy message"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </Card>

        <p className="text-muted-foreground">
          This works because it anchors to specific items, references a competing quote (if you have one), and signals you're a serious buyer — not someone walking away over price in general. It gives the dealer a clear path to close the deal.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">If the negotiation goes nowhere</h2>

        <p className="text-lg text-muted-foreground">
          If a dealer won't budge at all on add-ons or the vehicle price, that's useful information. Check whether the <Link href="/dealer-wont-give-otd-price" className="underline text-foreground">dealer is refusing to give you an out-the-door price</Link> — that's a separate red flag. And remember: walking is always an option. Dealers know that a buyer who leaves is often a buyer who comes back — or finds a better deal elsewhere.
        </p>
      </div>

      <ArticleCta />

      <p className="text-xs text-muted-foreground mt-12">
        Not affiliated with any dealership. Optimized for U.S. car purchases.
      </p>
    </ArticleLayout>
  );
}
