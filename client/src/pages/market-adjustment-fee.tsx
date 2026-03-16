import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy } from "lucide-react";
import { setSeoMeta } from "@/lib/seo";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

const MARKET_ADJUSTMENT_MESSAGE = `Hi, I'm interested in this vehicle and want to understand the full pricing. Can you send me a breakdown showing the MSRP, any market adjustment or additional dealer markup, and the final out-the-door price with taxes and fees separated? I'd like to see how the adjusted price compares to the manufacturer's suggested retail price before moving forward.`;

export default function MarketAdjustmentFee() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return setSeoMeta({
      title: "Market Adjustment Fees Explained: Can Dealers Charge Them? | Odigos",
      description: "Market adjustment fees (ADM) add thousands to a car's MSRP. Learn what they are, whether they're legal, how to negotiate them, and what to watch for in your dealer quote.",
      path: "/market-adjustment-fee",
    });
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(MARKET_ADJUSTMENT_MESSAGE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = MARKET_ADJUSTMENT_MESSAGE;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <ArticleLayout title="Market Adjustment Fees Explained: Can Dealers Charge Them?">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-market-adjustment-headline">
            Market Adjustment Fees Explained: Can Dealers Charge Them?
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              You found the car you want, but the window sticker has a second price label — sometimes called an "Additional Dealer Markup" (ADM) or "Market Adjustment." It can add $2,000, $5,000, or even $10,000 or more on top of the manufacturer's suggested retail price. If you've never seen one before, it can be confusing — and if you have, it's probably frustrating. Here's what's actually going on and what you can do about it.
            </p>

            <p className="text-sm text-muted-foreground mb-6">
              Already have a dealer quote? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and see if anything is missing.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What a market adjustment fee is</h2>

            <p className="text-lg text-muted-foreground mb-6">
              A market adjustment is a price increase that the dealer adds above the vehicle's MSRP. It's not set by the manufacturer — it's determined entirely by the dealership based on local demand and available inventory. When a particular model is in high demand or short supply, some dealers add this markup to take advantage of the scarcity. You'll typically see it on a separate addendum sticker next to the factory Monroney sticker on the window.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              Unlike taxes, registration, or title fees, a market adjustment is pure profit for the dealership. It doesn't correspond to any additional product, service, or government requirement. It's simply a higher price because the dealer believes someone will pay it. This is different from <Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">mandatory dealer add-ons</Link>, which bundle products or services into the price — a market adjustment adds nothing except a higher number.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Is it legal?</h2>

            <p className="text-lg text-muted-foreground mb-6">
              In most states, yes. Dealers are generally allowed to sell vehicles at any price above or below MSRP — the "suggested" in MSRP means exactly that. The manufacturer sets a recommended price, but the final sale price is between you and the dealer. Some states require that any addendum sticker be clearly disclosed, and a few have introduced legislation to limit markups, but in practice most dealerships operate within the law when they add a market adjustment.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              That said, legal doesn't mean non-negotiable. A dealer can set any price they want, and you can choose not to pay it.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Can you negotiate it?</h2>

            <p className="text-lg text-muted-foreground mb-6">
              Often, yes — especially as inventory conditions change. When a model first launches or when supply is genuinely constrained, some dealers hold firm on the markup. But as more units arrive or as the initial rush fades, many dealers will negotiate the adjustment down or remove it entirely. Your leverage depends on a few things: how many other dealers in your area carry the same vehicle, how long the car has been sitting on the lot, and whether you're willing to walk away.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              If a dealer won't budge, check with other dealerships — including ones further away. Some dealers advertise MSRP pricing as a policy, and the trip may be worth the savings. <a href="https://www.edmunds.com/car-buying/dealer-markups-and-addendum-stickers.html" target="_blank" rel="noopener" className="underline text-foreground">Edmunds</a> tracks dealer pricing trends and can help you identify fair pricing for specific models.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What to send the dealer</h2>

            <p className="text-muted-foreground mb-4">
              Before committing to a vehicle with a market adjustment, send this message to the dealer. You can copy and paste it directly:
            </p>

            <Card className="relative p-5 bg-muted/50 mb-4">
              <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic pr-10">
                {MARKET_ADJUSTMENT_MESSAGE}
              </blockquote>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-3 right-3"
                onClick={handleCopy}
                data-testid="button-copy-market-adjustment-message"
                aria-label="Copy message"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </Card>

            <p className="text-muted-foreground mb-6">
              This works because it's direct and professional. You're not arguing about the markup — you're asking to see the numbers clearly. Once you have the MSRP and the adjusted price side by side, you can decide whether the premium is worth it or shop elsewhere.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Questions worth asking</h2>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>"Is the market adjustment negotiable, or is it fixed?" — This alone tells you whether you're in a conversation or at a take-it-or-leave-it price.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>"How long has this vehicle been on the lot?" — A car that's been sitting for weeks or months suggests the markup may not be justified by demand.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>"Can you show me the out-the-door price including the adjustment?" — This forces the dealer to present the full cost, including the markup, taxes, and fees combined.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>"Are there any incoming allocations at MSRP?" — Some dealers will sell future inventory at MSRP even if current stock has a markup.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>"What's included in the addendum sticker besides the market adjustment?" — Sometimes the addendum also bundles in dealer-installed accessories or protection packages you didn't ask for.</span>
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What to watch for in the quote</h2>

            <p className="text-lg text-muted-foreground mb-6">
              If a dealer sends you a quote or a breakdown, look carefully at how the market adjustment is presented. Sometimes it's listed as a separate line item, which is transparent. Other times it's folded into the vehicle price without explanation, or buried under a vague label like "additional equipment" or "dealer accessories." If the total price doesn't match MSRP plus tax, title, and registration, ask what accounts for the difference.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              Also be aware that a market adjustment can interact with your financing. If you're financing above MSRP, you may end up underwater on the loan immediately — meaning you owe more than the car is worth the moment you drive off. This is especially risky on longer loan terms.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              The best defense is knowing your <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> and comparing it across multiple dealers before committing.
            </p>

            <p className="text-lg text-muted-foreground mb-8">
              If you have a dealer quote and you're not sure whether the pricing is fair, Odigos can break it down for you and flag anything that looks off.
            </p>
          </div>


          <ArticleCta />

          <p className="text-xs text-muted-foreground mt-12">
            Not affiliated with any dealership. Optimized for U.S. car purchases.
          </p>
    </ArticleLayout>
  );
}
