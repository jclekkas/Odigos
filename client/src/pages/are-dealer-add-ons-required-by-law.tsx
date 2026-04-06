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

const LEGAL_CLARITY_MESSAGE = `I'd like to clarify something before we proceed. In reviewing the quote, I see several charges listed alongside taxes and registration. Can you confirm in writing which of these are legally required government fees versus which are dealer-elected products or services? I want to make sure I understand what I'm legally obligated to pay versus what's a dealership business decision.`;

export default function AreDealerAddOnsRequiredByLaw() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSeoMeta({
      title: "Are Dealer Add-Ons Required by Law? What's Mandatory vs. Optional | Odigos",
      description: "Dealers sometimes present add-ons as legally required. Here's what the law actually mandates — and how to tell the difference between a government fee and a dealer upsell.",
      path: "/are-dealer-add-ons-required-by-law",
    });
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(LEGAL_CLARITY_MESSAGE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = LEGAL_CLARITY_MESSAGE;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <ArticleLayout title="Are Dealer Add-Ons Required by Law?">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "Are Dealer Add-Ons Required by Law? What's Mandatory vs. Optional | Odigos", description: "Dealers sometimes present add-ons as legally required. Here's what the law actually mandates — and how to tell the difference between a government fee and a dealer upsell.", path: "/are-dealer-add-ons-required-by-law" }))}</script>
      </Helmet>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-required-law-headline">
        Are Dealer Add-Ons Required by Law? What's Mandatory vs. Optional
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-6">
          No. Dealer add-ons are not required by law. The only charges legally mandated in a car purchase are government fees set by your state — not products the dealership chose to add to the vehicle.{" "}<SourceCitation sources={ARTICLE_SOURCES["are-dealer-add-ons-required-by-law"].sources} lastVerified={ARTICLE_SOURCES["are-dealer-add-ons-required-by-law"].lastVerified} />
        </p>

        <p className="text-lg text-muted-foreground mb-6">
          This distinction matters because dealers sometimes use language that implies certain charges are mandatory or regulatory when they're not. Understanding exactly what the law requires — and what it doesn't — puts you in a much clearer position to push back.
        </p>

        <p className="text-sm text-muted-foreground mb-6">
          Have a quote with charges that seem mandatory? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and we'll flag what's legally required vs. what's a dealer decision.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What is actually required by law</h2>

        <p className="text-lg text-muted-foreground mb-4">
          Every car purchase in the U.S. includes a small set of government-mandated charges. These are set by your state, not the dealership, and they're genuinely non-negotiable:
        </p>

        <ul className="space-y-2 mb-6 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">Sales tax</strong> — calculated based on your state and local jurisdiction. The rate is fixed by law, not by the dealer.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">Title fee</strong> — a government charge to transfer legal ownership of the vehicle to you.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">Registration fee</strong> — paid to your state to register the vehicle and receive license plates. The amount depends on the state, vehicle weight, and sometimes the vehicle's value.</span>
          </li>
        </ul>

        <p className="text-lg text-muted-foreground mb-6">
          Some states also require emissions testing fees or county-level surcharges. These will appear as government fees, not dealer products, and the amounts are publicly verifiable through your state's DMV.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What is not required by law</h2>

        <p className="text-lg text-muted-foreground mb-4">
          Everything else in a dealer quote is a business decision — either a dealer-elected fee or a product the dealer chose to add. None of the following are legally required:
        </p>

        <ul className="space-y-2 mb-6 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">Paint or fabric protection</strong> — a dealer-applied product. No law requires you to purchase it.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">VIN etching</strong> — sometimes pitched as a theft prevention measure "required by your insurance." That's false. Your insurer does not require it, and no state mandates it.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">Extended warranties and service contracts</strong> — always optional, always negotiable, always available cheaper from third parties after purchase.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">GAP insurance</strong> — sometimes useful if you're financing, but never legally required. You can purchase it from your own insurance company for significantly less than the dealer charges.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">Theft recovery systems</strong> — no law requires you to purchase a dealer-installed GPS or alarm system, even if it's already wired in.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">"Protection packages"</strong> — bundled dealer products. The word "protection" sounds official, but these are profit items, not regulatory requirements.</span>
          </li>
        </ul>

        <div className="rounded-lg border border-border bg-muted/30 p-5 mb-8">
          <p className="text-sm font-medium text-foreground mb-2">Checking your quote</p>
          <p className="text-sm text-muted-foreground">
            Not sure which charges in your quote are government fees and which are dealer add-ons? <Link href="/analyze" className="underline text-foreground">Paste your quote into Odigos</Link> and we'll label each line.
          </p>
        </div>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">The gray area: documentation fees</h2>

        <p className="text-lg text-muted-foreground mb-6">
          The <Link href="/dealer-doc-fee" className="underline text-foreground">documentation fee</Link> sits in a different category from add-ons. It's a dealer-set processing charge for handling paperwork — not a government fee — but it's standard practice at virtually every dealership. Some states cap it; others don't. While it's technically a dealer decision, it's rarely waived entirely. It's worth knowing the typical range in your state before you walk in.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What the FTC says</h2>

        <p className="text-lg text-muted-foreground mb-6">
          The Federal Trade Commission has clear guidance on car buying. Dealers are required to disclose the price of optional add-ons and cannot include charges in the contract that weren't agreed to. The <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC's guide for buying a new car</a> specifically warns buyers to read contracts carefully and confirm that any optional items you declined aren't included in the final paperwork.
        </p>

        <p className="text-lg text-muted-foreground mb-6">
          In 2024, the FTC finalized the CARS Rule (Combating Auto Retail Scams), which imposes new requirements on dealers regarding price disclosure and add-on transparency. While enforcement timelines vary, the direction of regulation is toward greater transparency — not less.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How dealers make optional charges sound mandatory</h2>

        <p className="text-lg text-muted-foreground mb-4">
          There are specific patterns worth recognizing:
        </p>

        <ul className="space-y-2 mb-6 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">Grouping add-ons with government fees</strong> — placing paint protection next to sales tax in a quote makes it look equally non-negotiable.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">Using regulatory-sounding names</strong> — "compliance fee," "dealer prep fee," "state-required inspection" — these can be dealer-elected charges despite the language.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">Claiming add-ons are "required by the lender"</strong> — this is almost never true. GAP insurance and similar products are not typically required by lenders, and if they are, they can be purchased separately for less.</span>
          </li>
        </ul>

        <p className="text-lg text-muted-foreground mb-6">
          For a broader look at <Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">which add-ons you can actually refuse</Link>, that page covers the full picture. If you're trying to get specific items removed from your quote, see <Link href="/how-to-remove-dealer-add-ons" className="underline text-foreground">how to remove dealer add-ons</Link>.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What to say to the dealer</h2>

        <p className="text-muted-foreground mb-4">
          If you're getting unclear answers about which charges are legally required, use this message to ask the dealer to clarify in writing:
        </p>

        <Card className="relative p-5 bg-muted/50 mb-4">
          <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic pr-10">
            {LEGAL_CLARITY_MESSAGE}
          </blockquote>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-3 right-3"
            onClick={handleCopy}
            data-testid="button-copy-legal-message"
            aria-label="Copy message"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </Card>

        <p className="text-muted-foreground mb-8">
          This message is deliberately non-confrontational. It's asking a reasonable question that any transparent dealer should be able to answer. A dealer who can't — or won't — clearly distinguish government fees from dealer products is telling you something important about how they operate.
        </p>
      </div>

      <ArticleCta />

      <p className="text-xs text-muted-foreground mt-12">
        Not affiliated with any dealership. Optimized for U.S. car purchases.
      </p>
    </ArticleLayout>
  );
}
