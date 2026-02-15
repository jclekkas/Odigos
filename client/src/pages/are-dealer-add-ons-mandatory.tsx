import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import logoImage from "@assets/odigos_logo.png";
import SeoHead from "@/components/SeoHead";

const REMOVE_ADDONS_MSG = `I'm not interested in these add-ons. Please remove them from the quote so I can evaluate the base price.`;

const ADJUST_PRICE_MSG = `If it can't be removed, I'll need the total price adjusted accordingly.`;

const WALKAWAY_MSG = `I understand. I'll continue shopping and come back if needed.`;

const faqs = [
  {
    q: "Are dealer add-ons required by law?",
    a: "In most cases, no. Taxes and registration are required, but protection packages and accessories are optional.",
  },
  {
    q: "Can a dealership force you to buy add-ons?",
    a: "They can refuse to sell under certain terms, but they cannot misrepresent optional items as legally required.",
  },
  {
    q: "What if the add-ons are already installed?",
    a: "You can still negotiate the price. Installation does not eliminate your negotiating power.",
  },
  {
    q: "Should I walk away over add-ons?",
    a: "If the dealer refuses transparency or won't negotiate unwanted items, walking away can be your best leverage.",
  },
];

export default function AreDealerAddOnsMandatory() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2500);
  };

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Are Dealer Add-Ons Mandatory? What You Can Refuse | Odigos"
        description="Are dealer add-ons required when buying a car? Learn what's optional, what's negotiable, and what to say if a dealership won't remove them."
        path="/are-dealer-add-ons-mandatory"
      />

      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center gap-3">
          <Link href="/">
            <img src={logoImage} alt="Odigos" className="h-12 md:h-14 w-auto cursor-pointer" data-testid="link-logo-home" />
          </Link>
        </div>
      </header>

      <main className="py-12 md:py-20 px-6">
        <article className="max-w-2xl mx-auto">
          <p className="text-sm text-muted-foreground mb-4">
            <Link href="/dealer-pricing-tactics" className="underline text-foreground" data-testid="link-breadcrumb-hub">Dealer Pricing Tactics</Link> &rsaquo; This Article
          </p>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 leading-[1.15]" data-testid="text-addons-headline">
            Are Dealer Add-Ons Mandatory? Here's What You Can Refuse
          </h1>

          <p className="text-sm text-muted-foreground mb-8" data-testid="text-last-updated">Last updated: Feb 2026</p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-4">
              Short answer: <strong className="text-foreground">No — most dealer add-ons are not mandatory.</strong>
            </p>
            <p className="text-muted-foreground mb-3">
              But dealerships often present them as if they are.
            </p>
            <p className="text-muted-foreground mb-3">
              If you've been told:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4 text-muted-foreground">
              <li>"It comes with the package."</li>
              <li>"We can't remove that."</li>
              <li>"It's already installed."</li>
              <li>"All our vehicles include this."</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              You're not alone.
            </p>
            <p className="text-muted-foreground mb-4">
              Here's what's actually required — and what isn't. You can also <Link href="/analyze" className="underline text-foreground" data-testid="link-inline-analyze-top">paste any dealer quote into Odigos</Link> to see exactly which add-ons are optional.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What Counts as a Dealer Add-On?</h2>
            <p className="text-muted-foreground mb-3">
              Dealer add-ons are extras added by the dealership — not the manufacturer.
            </p>
            <p className="text-muted-foreground mb-3">
              Common examples include:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4 text-muted-foreground">
              <li>Paint protection</li>
              <li>Fabric protection</li>
              <li>Nitrogen-filled tires</li>
              <li>VIN etching</li>
              <li>Window tint</li>
              <li>Door edge guards</li>
              <li>Wheel locks</li>
              <li>Alarm systems</li>
              <li>"Protection packages"</li>
              <li>Market adjustment fees</li>
            </ul>
            <p className="text-muted-foreground mb-8">
              These are not factory requirements. They are dealership profit items.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Are Any Add-Ons Legally Required?</h2>
            <p className="text-muted-foreground mb-3">
              In most states:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4 text-muted-foreground">
              <li>Taxes are required</li>
              <li>Title and registration fees are required</li>
              <li>State-mandated documentation fees may be required</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              But add-ons like protection packages, accessories, service contracts, and extended warranties are typically optional.
            </p>
            <p className="text-muted-foreground mb-8">
              If a dealer claims something is legally required, ask: "Can you show me where that's required by state law?"
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Why Dealers Say Add-Ons Are "Mandatory"</h2>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">1) They're Already Installed</h3>
            <p className="text-muted-foreground mb-8">
              Sometimes dealers pre-install accessories and claim they can't remove them. That doesn't mean you must pay full price. You can negotiate.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">2) They Bundle Them Into One Package</h3>
            <p className="text-muted-foreground mb-8">
              Instead of listing items separately, dealers combine them (e.g., "Premium Protection Package – $2,995"). Bundling makes it harder to compare value.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">3) They Present It as Standard Policy</h3>
            <p className="text-muted-foreground mb-8">
              "All our cars include this." Store policy is not law. Policy can be negotiated.
            </p>

            <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm font-semibold text-foreground mb-2">Not sure which add-ons are optional in your quote?</p>
              <p className="text-sm text-muted-foreground mb-3">
                Paste your dealer quote into Odigos and we'll flag bundled extras, hidden fees, and what's negotiable — before you visit.
              </p>
              <Link href="/analyze">
                <Button size="sm" data-testid="button-cta-mid-article">
                  Analyze My Dealer Quote
                </Button>
              </Link>
            </div>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What You Can Refuse</h2>
            <p className="text-muted-foreground mb-3">
              You can refuse most:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4 text-muted-foreground">
              <li>Paint/fabric protection</li>
              <li>Nitrogen tires</li>
              <li>VIN etching</li>
              <li>Dealer-installed accessories</li>
              <li>Service contracts</li>
              <li>Extended warranties</li>
              <li>Protection bundles</li>
            </ul>
            <p className="text-muted-foreground mb-8">
              You can also refuse to sign until unwanted items are removed from the quote.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What to Say If They Won't Remove Add-Ons (Copy This)</h2>
            <div className="relative my-4 rounded-lg border border-border bg-muted/40 p-5 pr-14" data-testid="block-remove-addons">
              <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic">
                {REMOVE_ADDONS_MSG}
              </blockquote>
              <button
                type="button"
                className="absolute top-3 right-3 inline-flex items-center justify-center rounded-md border border-border bg-background p-2"
                onClick={() => handleCopy(REMOVE_ADDONS_MSG, 0)}
                data-testid="button-copy-remove-addons"
                aria-label="Copy message"
              >
                {copiedIdx === 0 ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
              {copiedIdx === 0 && (
                <span className="absolute top-3 right-14 text-xs text-green-600 dark:text-green-400 font-medium">Copied</span>
              )}
            </div>
            <p className="text-muted-foreground mb-3">
              If they say they can't remove it:
            </p>
            <div className="relative my-4 rounded-lg border border-border bg-muted/40 p-5 pr-14" data-testid="block-adjust-price">
              <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic">
                {ADJUST_PRICE_MSG}
              </blockquote>
              <button
                type="button"
                className="absolute top-3 right-3 inline-flex items-center justify-center rounded-md border border-border bg-background p-2"
                onClick={() => handleCopy(ADJUST_PRICE_MSG, 1)}
                data-testid="button-copy-adjust-price"
                aria-label="Copy message"
              >
                {copiedIdx === 1 ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
              {copiedIdx === 1 && (
                <span className="absolute top-3 right-14 text-xs text-green-600 dark:text-green-400 font-medium">Copied</span>
              )}
            </div>
            <p className="text-muted-foreground mb-3">
              If they still refuse:
            </p>
            <div className="relative my-4 rounded-lg border border-border bg-muted/40 p-5 pr-14" data-testid="block-walkaway">
              <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic">
                {WALKAWAY_MSG}
              </blockquote>
              <button
                type="button"
                className="absolute top-3 right-3 inline-flex items-center justify-center rounded-md border border-border bg-background p-2"
                onClick={() => handleCopy(WALKAWAY_MSG, 2)}
                data-testid="button-copy-walkaway"
                aria-label="Copy message"
              >
                {copiedIdx === 2 ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
              {copiedIdx === 2 && (
                <span className="absolute top-3 right-14 text-xs text-green-600 dark:text-green-400 font-medium">Copied</span>
              )}
            </div>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What If the Add-On Is Already Installed?</h2>
            <p className="text-muted-foreground mb-8">
              Installed doesn't mean non-negotiable. You're negotiating price — not parts removal.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">When Add-Ons Become a Red Flag</h2>
            <p className="text-muted-foreground mb-3">
              Be cautious if:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4 text-muted-foreground marker:text-amber-500">
              <li>Add-ons appear late in the process</li>
              <li>The price increases right before signing</li>
              <li>They refuse to itemize charges</li>
              <li>They pressure you to sign quickly</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How to Review Add-Ons Before You Go In</h2>
            <p className="text-muted-foreground mb-8">
              Ask for a full itemized out-the-door quote, review each line item, and compare across dealerships. Separate vehicle price from extras.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">The Bottom Line</h2>
            <p className="text-muted-foreground mb-8">
              Dealer add-ons are usually optional. They are profit centers. You can decline, negotiate, or walk away.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Frequently Asked Questions</h2>
            <div className="space-y-6 mb-8">
              {faqs.map((faq, idx) => (
                <div key={idx}>
                  <h3 className="text-base font-semibold text-foreground mb-1" data-testid={`text-faq-q-${idx}`}>{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>

            <p className="text-muted-foreground mb-8">
              Back to <Link href="/dealer-pricing-tactics" className="underline text-foreground" data-testid="link-back-hub">all dealer pricing tactics</Link>.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-semibold mb-2 text-foreground" data-testid="text-addons-cta-heading">
              Want to Know What's Actually Negotiable?
            </h2>
            <p className="text-muted-foreground mb-3">
              Run the full quote through Odigos. We flag hidden or bundled extras, common pricing tactics, and negotiation leverage points.
            </p>
            <Link href="/analyze">
              <Button size="lg" data-testid="button-cta-addons-bottom">
                Analyze My Dealer Quote
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
