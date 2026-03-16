import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { setSeoMeta } from "@/lib/seo";
import logoImage from "@assets/odigos_logo.png";

export default function DealerWontGiveOutTheDoorPrice() {
  useEffect(() => {
    return setSeoMeta({
      title: "Dealer Won't Give an Out-the-Door Price? What to Do | Odigos",
      description: "If a dealer won't give you the out-the-door price in writing, you don't know the real cost. Learn why dealerships avoid OTD pricing and what to do.",
      path: "/dealer-wont-give-out-the-door-price",
    });
  }, []);

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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-otd-refuse-headline">
            Dealer Won't Give an Out-the-Door Price? What to Do
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              If a dealer refuses to give you the out-the-door price (OTD) in writing, that is usually a red flag.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              The out-the-door price is the total amount you will actually pay to drive the car off the lot. It includes the vehicle price, taxes, registration, dealer documentation fees, and any add-ons already included in the deal.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              Without that number, you cannot compare offers or understand the real cost of the car.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              Dealers sometimes avoid giving the OTD price because it removes their ability to add fees later in the process.
            </p>

            <p className="text-sm text-muted-foreground mb-6">
              Already have a dealer quote? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and see if anything is missing.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Why Some Dealers Avoid Giving the OTD Price</h2>

            <p className="text-muted-foreground mb-4">
              There are a few common reasons dealerships hesitate to provide the full out-the-door number.
            </p>

            <h3 className="text-xl font-semibold mt-8 mb-3 text-foreground">They want you focused on the monthly payment</h3>

            <p className="text-muted-foreground mb-6">
              Dealers often try to shift the conversation toward monthly payments instead of total price. That makes it easier to bury fees inside the financing.
            </p>

            <h3 className="text-xl font-semibold mt-8 mb-3 text-foreground">Fees can be added later in the process</h3>

            <p className="text-muted-foreground mb-4">
              Some dealerships wait until the paperwork stage to introduce extra charges such as:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2"><span>•</span><span>documentation fees</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>dealer-installed add-ons</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>protection packages</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>VIN etching</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>nitrogen-filled tires</span></li>
            </ul>

            <p className="text-muted-foreground mb-6">
              If you only know the vehicle price, those costs can appear later.
            </p>

            <p className="text-muted-foreground mb-6">
              If a dealership agrees on a price but introduces new charges during paperwork, see <Link href="/dealer-added-fees-after-agreement" className="underline text-foreground">Dealer Added Fees After We Agreed on Price</Link> to understand why this happens and what you can do.
            </p>

            <h3 className="text-xl font-semibold mt-8 mb-3 text-foreground">They want you at the dealership first</h3>

            <p className="text-muted-foreground mb-6">
              Many dealers prefer to discuss final pricing in person. Once you have spent time visiting, test driving, and negotiating, it becomes harder to walk away.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What the Out-the-Door Price Should Include</h2>

            <p className="text-muted-foreground mb-4">
              A legitimate OTD price should include:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2"><span>•</span><span>vehicle sale price</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>sales tax</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>title and registration</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>dealer documentation fee</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>required state or local fees</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>any add-ons already included in the quote</span></li>
            </ul>

            <p className="text-muted-foreground mb-6">
              If a dealer gives you only the sale price or a vague estimate, you still do not know the real cost.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What to Say If a Dealer Won't Give the OTD Price</h2>

            <p className="text-muted-foreground mb-4">
              Use a message like this:
            </p>

            <blockquote className="border-l-4 border-border pl-4 mb-6 text-muted-foreground italic">
              "Before I come in, could you send the full out-the-door price including taxes, registration, and all dealer fees?"
            </blockquote>

            <p className="text-muted-foreground mb-6">
              If they still refuse, that is useful information. Transparent dealers usually have no problem giving this number.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How to Protect Yourself</h2>

            <p className="text-muted-foreground mb-6">
              Before visiting the dealership, try to get the full pricing breakdown in writing. If you're not sure how to phrase the request, see <Link href="/how-to-ask-for-out-the-door-price" className="underline text-foreground">how to ask a dealer for an out-the-door price</Link> for a copy-paste message you can send directly.
            </p>

            <p className="text-muted-foreground mb-6">
              If the quote is vague, missing fees, or only shows a monthly payment, assume the deal is incomplete until you see the full <Link href="/out-the-door-price" className="underline text-foreground">out-the-door number</Link>. A simple <Link href="/out-the-door-price-example" className="underline text-foreground">out-the-door price example</Link> can show you what a complete breakdown should look like.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How Odigos Helps</h2>

            <p className="text-muted-foreground mb-4">
              If a dealer sends you a quote, text, or email but the pricing looks unclear, paste the message into Odigos.
            </p>

            <p className="text-muted-foreground mb-4">
              Odigos checks for:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2"><span>•</span><span>missing out-the-door pricing</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>hidden fees</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>dealer add-ons</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>common dealership pricing tactics</span></li>
            </ul>

            <p className="text-muted-foreground mb-6">
              so you know what you are agreeing to before you go in.
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
              <Button size="lg" data-testid="button-cta-otd-refuse">
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
