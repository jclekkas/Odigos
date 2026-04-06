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

const SELECTIVE_REFUSAL_MESSAGE = `After reviewing the add-ons in the quote, I'd like to proceed without the following items: [list each add-on by name]. I'm fine keeping [any item you want to keep], but I'd like an updated out-the-door price that reflects the removal of the items listed above. Please confirm this is possible before I come in.`;

export default function DealerAddOnsExplained() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSeoMeta({
      title: "Dealer Add-Ons Explained: What Each One Actually Is | Odigos",
      description: "Plain-language explanations of every common dealer add-on — what it is, what the dealer says, what's actually true, and whether it's worth paying for.",
      path: "/dealer-add-ons-explained",
    });
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SELECTIVE_REFUSAL_MESSAGE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = SELECTIVE_REFUSAL_MESSAGE;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <ArticleLayout title="Dealer Add-Ons Explained">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "Dealer Add-Ons Explained: What Each One Actually Is | Odigos", description: "Plain-language explanations of every common dealer add-on — what it is, what the dealer says, what's actually true, and whether it's worth paying for.", path: "/dealer-add-ons-explained" }))}</script>
      </Helmet>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-explained-headline">
        Dealer Add-Ons Explained: What Each One Actually Is
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-6">
          Dealer add-ons show up on quotes with names that sound official, protective, or manufacturer-backed. Most aren't any of those things. This guide explains what each common add-on actually is, what the dealer typically says about it, what's actually true, and whether it's worth paying for.
        </p>

        <p className="text-lg text-muted-foreground mb-6">
          This is about understanding the products — not the pricing. For a breakdown of typical costs and markup ranges, the <Link href="/dealer-add-ons-list" className="underline text-foreground">dealer add-ons list</Link> covers that in detail. If you're trying to determine which add-ons you're actually obligated to pay for, see <Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">are dealer add-ons mandatory</Link>.
        </p>

        <p className="text-sm text-muted-foreground mb-6">
          Already have a quote with add-ons? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and see what's actually in it.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Paint protection film / paint sealant</h2>

        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What it is:</strong> Either a clear physical film applied over paint panels, or a liquid polymer sealant applied to the entire exterior. Film (PPF) and sealant are very different products, but dealers sometimes use the terms interchangeably.</p>
        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What the dealer says:</strong> It protects your paint from chips, scratches, and UV damage and maintains resale value.</p>
        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What's actually true:</strong> High-quality PPF from a reputable installer does offer real protection, especially on high-impact areas. Dealer-applied sealant is often a basic product that wears off within months. The issue isn't the concept — it's that dealers charge $500–$1,500 for something that costs them $50–$150 and may be applied hastily before delivery.</p>
        <p className="text-lg text-muted-foreground mb-6"><strong className="text-foreground">Verdict:</strong> Decide for yourself. If paint protection matters to you, get a quote from a dedicated detailing shop or PPF installer. You'll get better work for less.</p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Fabric / upholstery protection</h2>

        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What it is:</strong> A spray-on treatment applied to seats and carpets, similar to Scotchgard. Sometimes marketed as "leather conditioning" for leather interiors.</p>
        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What the dealer says:</strong> It repels stains and spills and extends the life of your interior.</p>
        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What's actually true:</strong> Fabric protection sprays are real products with real utility — but the version a dealer applies before delivery is typically a commodity spray that costs them $30–$75. You can buy equivalent products at any auto parts store and apply them yourself in 20 minutes.</p>
        <p className="text-lg text-muted-foreground mb-6"><strong className="text-foreground">Verdict:</strong> Skip. Buy your own if you want it.</p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">VIN etching</h2>

        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What it is:</strong> Your Vehicle Identification Number (VIN) is etched or chemically applied to your windows. The idea is that thieves won't steal a car with traceable glass.</p>
        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What the dealer says:</strong> It deters theft and some insurance companies offer a discount for it.</p>
        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What's actually true:</strong> VIN etching has a marginal deterrent effect at best. The "insurance discount" claim is often exaggerated or doesn't apply to your insurer. The process takes a few minutes and costs the dealer $20–$30. Dealers charge $200–$400. The National Insurance Crime Bureau offers free VIN etching kits, and many auto clubs do as well.</p>
        <p className="text-lg text-muted-foreground mb-6"><strong className="text-foreground">Verdict:</strong> Skip. Not worth the markup.</p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Nitrogen-filled tires</h2>

        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What it is:</strong> Your tires are inflated with pure nitrogen instead of regular air (which is 78% nitrogen anyway).</p>
        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What the dealer says:</strong> Nitrogen maintains tire pressure more consistently, improves fuel economy, and extends tire life.</p>
        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What's actually true:</strong> The benefits are real but negligible for everyday passenger vehicles — the differences in pressure stability are measured in fractions of a PSI. Race teams and aircraft use nitrogen because pressure consistency is critical at high performance. For your daily driver, it's not meaningful. Many tire shops offer nitrogen top-offs for free.</p>
        <p className="text-lg text-muted-foreground mb-6"><strong className="text-foreground">Verdict:</strong> Skip. The benefit doesn't justify any charge.</p>

        <div className="rounded-lg border border-border bg-muted/30 p-5 mb-8">
          <p className="text-sm font-medium text-foreground mb-2">Seeing add-ons in your quote?</p>
          <p className="text-sm text-muted-foreground">
            <Link href="/analyze" className="underline text-foreground">Paste your dealer quote into Odigos</Link> and we'll identify each add-on, flag the ones with the highest markup, and show you your real out-the-door price without the extras.
          </p>
        </div>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Window tint</h2>

        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What it is:</strong> A film applied to the inside of your windows to reduce heat, glare, and UV exposure. Dealers sometimes apply it before delivery; other times it's listed as a service to be completed at pickup.</p>
        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What the dealer says:</strong> It reduces interior heat, protects upholstery from UV, and improves privacy.</p>
        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What's actually true:</strong> These benefits are legitimate. Quality window tint does all of these things. The issue is dealer pricing ($300–$800) versus aftermarket shops ($100–$250 for comparable work, often with a warranty). Tint darkness is also regulated by state law — confirm the dealer is applying a legal tint level for your state.</p>
        <p className="text-lg text-muted-foreground mb-6"><strong className="text-foreground">Verdict:</strong> Decide for yourself — but get it done at a dedicated tint shop for less.</p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Door edge guards / door sill protectors</h2>

        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What it is:</strong> Plastic or rubber trim strips applied to door edges to prevent minor dings when opening doors near other cars.</p>
        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What the dealer says:</strong> Prevents scratches and protects resale value.</p>
        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What's actually true:</strong> Door edge guards work. They're also $15–$40 on Amazon and take about ten minutes to install. Dealers charge $100–$300.</p>
        <p className="text-lg text-muted-foreground mb-6"><strong className="text-foreground">Verdict:</strong> Skip from the dealer. Buy and install your own if you want them.</p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Wheel locks</h2>

        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What it is:</strong> A set of lug nuts with a unique pattern that requires a special key to remove — preventing wheel theft.</p>
        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What the dealer says:</strong> Protects your wheels from theft, especially on vehicles with desirable rims.</p>
        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What's actually true:</strong> Wheel locks have genuine utility if you have aftermarket or desirable wheels. A standard set costs $20–$40 at any auto parts store. Dealers charge $75–$200.</p>
        <p className="text-lg text-muted-foreground mb-6"><strong className="text-foreground">Verdict:</strong> Decide for yourself — but buy them yourself if you want them.</p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">All-weather floor mats</h2>

        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What it is:</strong> Heavy-duty rubber or thermoplastic mats that fit the vehicle's floor. Often presented as "OEM-compatible" or vehicle-specific.</p>
        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What the dealer says:</strong> Custom fit, durable, and protect your factory carpet.</p>
        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What's actually true:</strong> Good all-weather mats are genuinely useful. The dealer version might be the actual OEM product or an equivalent generic. Dealer price: $150–$400. Aftermarket brands like WeatherTech or Husky Liners: $100–$150 with custom fit and a warranty.</p>
        <p className="text-lg text-muted-foreground mb-6"><strong className="text-foreground">Verdict:</strong> Decide for yourself — but compare to aftermarket first.</p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Theft deterrent / GPS tracking system</h2>

        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What it is:</strong> A dealer-installed GPS unit or alarm system — sometimes branded as LoJack, Ravelco, or a proprietary system. Allows vehicle recovery if stolen.</p>
        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What the dealer says:</strong> Protects your vehicle against theft and may reduce your insurance premium.</p>
        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What's actually true:</strong> GPS-based recovery systems have legitimate value in high-theft areas or for high-value vehicles. The problem is that dealers charge $300–$1,000 and often pre-install the unit, then claim it can't be removed. Many modern vehicles already have factory-integrated theft protection. Check your vehicle's specs before paying for a duplicate.</p>
        <p className="text-lg text-muted-foreground mb-6"><strong className="text-foreground">Verdict:</strong> Decide for yourself — but verify whether your vehicle already has this feature and compare prices before accepting the dealer's version.</p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">"Protection package" (bundled add-ons)</h2>

        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What it is:</strong> A single line item that bundles several of the above add-ons — typically paint protection, fabric protection, and VIN etching — under one price.</p>
        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What the dealer says:</strong> A complete protection solution at a bundled rate.</p>
        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What's actually true:</strong> Bundling makes it harder to evaluate each item individually. The "bundled rate" is almost always more than what individual items would cost separately, and each item in the bundle is itself marked up significantly. Always ask for the bundle to be broken out into individual items with separate pricing.</p>
        <p className="text-lg text-muted-foreground mb-6"><strong className="text-foreground">Verdict:</strong> Skip until itemized. Ask for individual pricing before agreeing to anything.</p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Extended warranty / service contract</h2>

        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What it is:</strong> A service contract that extends coverage beyond the manufacturer's warranty. Not technically a warranty — these are contracts with specific terms and exclusions.</p>
        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What the dealer says:</strong> Peace of mind coverage for major repairs after the factory warranty expires.</p>
        <p className="text-lg text-muted-foreground mb-2"><strong className="text-foreground">What's actually true:</strong> Service contracts can have real value — but they're never a good deal at dealer prices ($1,500–$4,000). Third-party providers offer equivalent or broader coverage for significantly less. You can also purchase them after the sale, giving you time to research and compare. Read the contract carefully for deductibles, exclusions, and the claims process before agreeing to anything.</p>
        <p className="text-lg text-muted-foreground mb-6"><strong className="text-foreground">Verdict:</strong> Decide for yourself — but don't buy at the dealer and don't buy during the sale. Research and purchase separately.</p>

        <p className="text-lg text-muted-foreground mb-6">
          If you're working through what to do with the add-ons in your specific quote, <Link href="/how-to-remove-dealer-add-ons" className="underline text-foreground">how to remove dealer add-ons</Link> walks through the process step by step. If you're wondering whether <Link href="/are-dealer-add-ons-negotiable" className="underline text-foreground">add-ons are negotiable</Link>, that depends on which ones and when — that guide covers the tactics in detail.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What to say to the dealer</h2>

        <p className="text-muted-foreground mb-4">
          Once you've reviewed the add-ons and decided which ones you don't want, use this message to decline specific items while keeping others. Replace the bracketed sections with the actual item names:
        </p>

        <Card className="relative p-5 bg-muted/50 mb-4">
          <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic pr-10">
            {SELECTIVE_REFUSAL_MESSAGE}
          </blockquote>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-3 right-3"
            onClick={handleCopy}
            data-testid="button-copy-explained-message"
            aria-label="Copy message"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </Card>

        <p className="text-muted-foreground mb-8">
          This message works because it's selective, not blanket. You're showing that you've actually read the quote, you know which items are in it, and you're making informed decisions — not just trying to strip everything out. It's harder for a dealer to refuse when you're being specific and professional.
        </p>
      </div>

      <ArticleCta />

      <p className="text-xs text-muted-foreground mt-12">
        Not affiliated with any dealership. Optimized for U.S. car purchases.
      </p>
    </ArticleLayout>
  );
}
