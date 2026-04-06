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

const REMOVAL_MESSAGE = `Hi — I'd like to move forward on the vehicle, but I need an updated quote that removes the following dealer-installed add-ons: [list each add-on by name]. Please send me an out-the-door price with only the base vehicle price, sales tax, title, registration, and documentation fee. If any of those items cannot be removed, please confirm that in writing and provide individual pricing for each one.`;

export default function HowToRemoveDealerAddOns() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSeoMeta({
      title: "How to Remove Dealer Add-Ons: Step-by-Step Guide | Odigos",
      description: "A step-by-step guide to removing dealer add-ons before you sign. What to do before the visit, in the finance office, and after an initial refusal.",
      path: "/how-to-remove-dealer-add-ons",
    });
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(REMOVAL_MESSAGE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = REMOVAL_MESSAGE;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <ArticleLayout title="How to Remove Dealer Add-Ons">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "How to Remove Dealer Add-Ons: Step-by-Step Guide | Odigos", description: "A step-by-step guide to removing dealer add-ons before you sign. What to do before the visit, in the finance office, and after an initial refusal.", path: "/how-to-remove-dealer-add-ons" }))}</script>
      </Helmet>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-remove-headline">
        How to Remove Dealer Add-Ons: A Step-by-Step Guide
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground">
          Dealer add-ons appear at every stage of the car-buying process — in the online listing, the initial quote, and again in the finance office. The good news is that most are removable. The bad news is that dealers count on buyer inertia to keep them in the deal.
        </p>

        <p className="text-lg text-muted-foreground">
          This guide walks through what to do at each stage: before you visit, during negotiations, in the finance office, and after a first refusal.
        </p>

        <p className="text-sm text-muted-foreground">
          Have a quote already? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> to see which add-ons are in it and what they're worth.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Step 1: Before you visit — request the out-the-door price in writing</h2>

        <p className="text-lg text-muted-foreground">
          The most effective time to deal with add-ons is before you set foot in the dealership. Request a full <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> by email or text, with every line item listed: vehicle price, taxes, title, registration, documentation fee, and any dealer-installed products separately itemized.
        </p>

        <p className="text-lg text-muted-foreground">
          When you can see each charge in writing, you can respond to specific items before you're in a high-pressure environment. Most dealers will provide this if you ask directly. If a dealer <Link href="/dealer-wont-give-otd-price" className="underline text-foreground">won't give you a clear out-the-door price</Link>, treat that as a warning sign.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Step 2: Respond by email — name the add-ons you want removed</h2>

        <p className="text-lg text-muted-foreground">
          Once you have the itemized quote, reply in writing naming each add-on you want removed. Don't call — email creates a paper trail, gives the dealer time to respond without feeling cornered, and makes it harder to claim there was a misunderstanding later.
        </p>

        <p className="text-lg text-muted-foreground">
          Be specific. Instead of "I don't want the extras," say "Please remove the paint protection, VIN etching, and fabric coating from the quote." Specificity signals that you've read the contract and know what you're declining.
        </p>

        <div className="rounded-lg border border-border bg-muted/30 p-5 mb-8">
          <p className="text-sm font-medium text-foreground mb-2">Before you negotiate</p>
          <p className="text-sm text-muted-foreground">
            If you're not sure which items are dealer add-ons vs. standard fees, <Link href="/analyze" className="underline text-foreground">paste your quote into Odigos</Link>. We'll label each line item and flag the ones with the most markup.
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-foreground">Step 3: Handle common dealer responses</h2>

        <p className="text-lg text-muted-foreground">
          Here's what you'll likely hear, and what it actually means:
        </p>

        <ul className="space-y-4 mb-6 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>
              <strong className="text-foreground">"It's already installed."</strong> This is true but irrelevant. The dealer chose to pre-install it. You didn't request it and didn't agree to pay for it. Ask for the vehicle price to be reduced by that amount instead.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>
              <strong className="text-foreground">"We don't sell without it."</strong> This is a business policy, not a legal requirement. It means the dealer is choosing not to negotiate — not that you're required to accept it. See if <Link href="/are-dealer-add-ons-negotiable" className="underline text-foreground">negotiating the add-on price</Link> is possible, or look for another dealer selling the same vehicle.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>
              <strong className="text-foreground">"It's part of our package pricing."</strong> Bundling is how dealers obscure the cost of individual items. Ask them to break out each item separately with individual pricing. If they won't, that tells you something.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>
              <strong className="text-foreground">"It protects your investment."</strong> This is a sales argument, not a reason you're required to purchase. Every add-on has a pitch — evaluate it on its actual cost vs. benefit, not the framing.
            </span>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-foreground">Step 4: In the finance office</h2>

        <p className="text-lg text-muted-foreground">
          The finance office is where add-ons get reintroduced — often ones you already declined, or new ones disguised as standard contract terms. Go in with your written quote in hand. Before signing anything, compare the contract line by line to the quote you agreed on.
        </p>

        <p className="text-lg text-muted-foreground">
          If new charges appear, stop and ask for each one to be explained and removed before you sign. Dealers will sometimes say you already agreed to these items — you have the written quote to refute that. This is why getting everything in writing beforehand matters.
        </p>

        <p className="text-lg text-muted-foreground">
          Extended warranties and service contracts are commonly pitched here. They're always optional — regardless of how they're presented — and can almost always be purchased later from third-party providers for less. Don't feel rushed to decide.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Step 5: After a first refusal — escalate or walk</h2>

        <p className="text-lg text-muted-foreground">
          If the initial salesperson says the add-ons can't be removed, you have options:
        </p>

        <ul className="space-y-2 mb-6 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Ask to speak with the sales manager directly. The salesperson may not have authority to make concessions the manager does.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Present a competing quote from another dealer for the same vehicle without the add-ons. Real competition creates real pressure.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Ask for a price reduction on the vehicle that offsets the add-ons you don't want. The total cost is what matters — getting a $500 reduction is equivalent to removing a $500 add-on.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Walk. This is always an option, and dealers know it. A buyer who leaves is often called back with improved terms.</span>
          </li>
        </ul>

        <p className="text-lg text-muted-foreground">
          For more on what dealers are actually <Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">required to include vs. what's optional</Link>, that guide covers the legal side in detail.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">What to say to the dealer</h2>

        <p className="text-muted-foreground">
          Use this message when you're ready to request an updated quote without specific add-ons. Replace the bracketed section with the items from your quote:
        </p>

        <Card className="relative p-5 bg-muted/50 mb-4">
          <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic pr-10">
            {REMOVAL_MESSAGE}
          </blockquote>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-3 right-3"
            onClick={handleCopy}
            data-testid="button-copy-remove-message"
            aria-label="Copy message"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </Card>

        <p className="text-muted-foreground">
          This works because it's direct, lists specific items, and requests a written confirmation if something can't be removed. That last clause matters — it puts the dealer on record rather than leaving the conversation vague.
        </p>
      </div>

      <ArticleCta />

      <p className="text-xs text-muted-foreground mt-12">
        Not affiliated with any dealership. Optimized for U.S. car purchases.
      </p>
    </ArticleLayout>
  );
}
