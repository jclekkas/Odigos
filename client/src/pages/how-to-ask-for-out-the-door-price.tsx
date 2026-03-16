import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy } from "lucide-react";
import { setSeoMeta } from "@/lib/seo";
import logoImage from "@assets/odigos_logo.png";

const OTD_REQUEST_MESSAGE = `Can you send me the full out-the-door price in writing, including vehicle price, dealer fees, taxes, registration, and any add-ons?`;

export default function HowToAskForOutTheDoorPrice() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return setSeoMeta({
      title: "How to Ask a Dealer for an Out-the-Door Price | Odigos",
      description: "Learn how to ask a dealer for an out-the-door price in writing, what to say, what should be included, and what to do if they avoid giving a full number.",
      path: "/how-to-ask-for-out-the-door-price",
    });
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(OTD_REQUEST_MESSAGE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = OTD_REQUEST_MESSAGE;
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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-how-to-ask-headline">
            How to Ask a Dealer for an Out-the-Door Price
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              When you're shopping for a car, the most important number isn't the sticker price. It's the <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link>.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              The out-the-door price (OTD) is the total amount you will actually pay to drive the car off the lot. It includes the vehicle price, taxes, registration, dealer fees, and any add-ons.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              If a dealer only quotes the vehicle price or a monthly payment, you still don't know what the car really costs.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              Before visiting a dealership, you should always ask for the full out-the-door price in writing.
            </p>

            <p className="text-sm text-muted-foreground mb-6">
              Already have a dealer quote? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and see if anything is missing.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Why You Should Ask for the OTD Price First</h2>

            <p className="text-muted-foreground mb-4">
              Many buyers walk into a dealership with only the vehicle price or payment quote.
            </p>

            <p className="text-muted-foreground mb-4">
              The problem is that several charges often get added later, including:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2"><span>•</span><span>Sales tax</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>Title and registration</span></li>
              <li className="flex items-start gap-2"><span>•</span><span><Link href="/dealer-doc-fee" className="underline text-foreground">Dealer documentation fees</Link></span></li>
              <li className="flex items-start gap-2"><span>•</span><span><Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">Dealer add-ons</Link></span></li>
              <li className="flex items-start gap-2"><span>•</span><span>Market adjustment fees</span></li>
            </ul>

            <p className="text-muted-foreground mb-6">
              These can add thousands of dollars to the final price.
            </p>

            <p className="text-muted-foreground mb-6">
              When you ask for the full OTD price before visiting, you remove most of the uncertainty. You also make it easier to compare offers between dealerships.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">The Best Way to Ask for the Price</h2>

            <p className="text-muted-foreground mb-6">
              The easiest way to get a clear answer is to ask by text or email. Written quotes prevent misunderstandings and make it harder for numbers to change later.
            </p>

            <p className="text-muted-foreground mb-4">
              You can use a simple message like this:
            </p>

            <Card className="mb-6">
              <div className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3 font-medium">Example message</p>
                <p className="text-foreground leading-relaxed mb-4">
                  "{OTD_REQUEST_MESSAGE}"
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2"
                  data-testid="button-copy-otd-request"
                >
                  {copied ? (
                    <><Check className="w-4 h-4" /> Copied</>
                  ) : (
                    <><Copy className="w-4 h-4" /> Copy message</>
                  )}
                </Button>
              </div>
            </Card>

            <p className="text-muted-foreground mb-6">
              This tells the dealer exactly what you expect in the quote.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What the Out-the-Door Price Should Include</h2>

            <p className="text-muted-foreground mb-4">
              A proper OTD price breakdown usually includes:
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <p className="font-medium text-foreground">Vehicle sale price</p>
                <p className="text-muted-foreground">The negotiated price of the car itself.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Sales tax</p>
                <p className="text-muted-foreground">State and sometimes local tax based on where the car will be registered.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Title and registration fees</p>
                <p className="text-muted-foreground">Fees required by your state to register the vehicle.</p>
              </div>
              <div>
                <p className="font-medium text-foreground"><Link href="/dealer-doc-fee" className="underline text-foreground">Dealer documentation fee</Link></p>
                <p className="text-muted-foreground">A fee charged by the dealership for paperwork.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Any dealer add-ons</p>
                <p className="text-muted-foreground">Items like paint protection, VIN etching, wheel locks, or nitrogen-filled tires.</p>
              </div>
            </div>

            <p className="text-muted-foreground mb-6">
              Some of these charges are normal. Others may be optional or negotiable. If a dealer refuses to include them in the quote, the number you received is not the real price.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What to Do If the Dealer Avoids the Question</h2>

            <p className="text-muted-foreground mb-4">
              Sometimes dealers will respond with something like:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2"><span>•</span><span>"Come into the dealership and we'll go over it."</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>"We can discuss the final numbers in person."</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>"Let's talk about monthly payments instead."</span></li>
            </ul>

            <p className="text-muted-foreground mb-6">
              These responses usually mean the dealership prefers not to provide the full number yet.
            </p>

            <p className="text-muted-foreground mb-4">
              You can reply politely but directly:
            </p>

            <blockquote className="border-l-4 border-border pl-4 mb-6 text-muted-foreground italic">
              "I'm comparing offers from several dealers and just need the full out-the-door price in writing before scheduling a visit."
            </blockquote>

            <p className="text-muted-foreground mb-6">
              Most dealers will provide it when asked clearly. If they refuse, you may want to consider another dealership.
            </p>

            <p className="text-muted-foreground mb-6">
              You can also read <Link href="/dealer-wont-give-out-the-door-price" className="underline text-foreground">what to do if a dealer won't give an out-the-door price</Link> before you visit.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Red Flags to Watch For</h2>

            <p className="text-muted-foreground mb-4">
              A few common warning signs appear when buyers ask for OTD pricing.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <p className="font-medium text-foreground">Incomplete price breakdown</p>
                <p className="text-muted-foreground">If the quote only shows the vehicle price, taxes may still be missing.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Add-ons listed without prices</p>
                <p className="text-muted-foreground">Sometimes dealers list products but don't include the cost until later.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Sudden new charges</p>
                <p className="text-muted-foreground">If the OTD price changes significantly when you arrive, ask for a full explanation.</p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Before You Go to the Dealership</h2>

            <p className="text-muted-foreground mb-4">
              Once you receive the quote, review it carefully. Make sure the breakdown includes:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2"><span>•</span><span>Vehicle price</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>Taxes</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>Registration</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>Dealer fees</span></li>
              <li className="flex items-start gap-2"><span>•</span><span>Add-ons</span></li>
            </ul>

            <p className="text-muted-foreground mb-6">
              If anything seems unclear, ask for clarification before visiting. You can also paste the dealer's message into Odigos to check whether anything is missing or unusual before you go in.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">FAQ</h2>

            <div className="space-y-6 mb-6">
              <div>
                <p className="font-medium text-foreground mb-2">Do dealers have to give an out-the-door price?</p>
                <p className="text-muted-foreground">No law requires dealers to provide one immediately, but many will when asked directly.</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-2">Should I negotiate using MSRP or OTD price?</p>
                <p className="text-muted-foreground">The OTD price is usually the best number to compare because it reflects the real total cost.</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-2">Can the OTD price change later?</p>
                <p className="text-muted-foreground">It can change if new items are added or if the quote was incomplete. That's why getting the breakdown in writing is important.</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-muted-foreground mb-4">
              Not sure if the dealer quote is complete?
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Paste the message or quote you received. Odigos checks for missing out-the-door pricing, add-ons, and unclear fees.
            </p>
            <Link href="/analyze">
              <Button size="lg" data-testid="button-cta-how-to-ask">
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
