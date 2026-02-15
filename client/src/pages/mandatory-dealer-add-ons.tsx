import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/odigos_logo.png";

export default function MandatoryDealerAddOns() {
  useEffect(() => {
    document.title = "Mandatory Dealer Add-Ons Explained | Odigos";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", "Dealers often claim add-ons are mandatory. Learn what's legally required, what's optional, and how to avoid paying for unnecessary dealer-installed products.");
    return () => {
      document.title = "Is This a Good Car Deal? | Odigos";
      if (meta) {
        meta.setAttribute("content", "Paste dealer texts or emails. Odigos flags what's missing, risky, or unclear before you go to the dealership.");
      }
    };
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
        <article className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-add-ons-headline">
            Are Dealer Add-Ons Really Mandatory?
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-4">
              Walk into almost any dealership and you'll eventually hear some version of: "These add-ons are already installed — they're part of the vehicle." Paint protection, nitrogen-filled tires, VIN etching, fabric coating, wheel locks, window tinting. The list varies by dealer, but the approach is the same: present optional products as if they're non-negotiable.
            </p>
            <p className="text-lg text-muted-foreground mb-10">
              The truth? Almost none of these add-ons are legally required. Understanding what's truly mandatory versus what's dealer profit padding can save you hundreds — sometimes thousands — on your next car purchase.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What Counts as a Dealer Add-On?</h2>
            <p className="text-muted-foreground mb-4">
              A dealer add-on is any product or service the dealership installs or bundles on top of the manufacturer's base vehicle. These are not factory options chosen by the buyer. They're installed by the dealer before you arrive, often without you requesting them.
            </p>
            <p className="text-muted-foreground mb-8">
              Common examples include paint sealant, interior fabric protection, pinstripes, door edge guards, theft deterrent systems (like VIN etching), nitrogen tire fill, and all-weather floor mats. Some dealers bundle multiple items into a single "protection package" with a combined price.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What's Actually Required by Law?</h2>
            <p className="text-muted-foreground mb-4">
              Very little. In most states, the only fees legally required on a car purchase are:
            </p>
            <ul className="space-y-2 mb-4 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                <span>State and local sales tax</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                <span>Title and registration fees (set by the state)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                <span>Emission or inspection fees (where applicable)</span>
              </li>
            </ul>
            <p className="text-muted-foreground mb-8">
              Everything beyond that — documentation fees, dealer-installed accessories, protection packages — is set by the dealer, not the government. If someone tells you an add-on is "required by law," ask them to show you the statute. They won't be able to, because it doesn't exist.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Common Add-Ons to Watch For</h2>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">Paint Protection / Ceramic Coating</h3>
            <p className="text-muted-foreground mb-4">
              Dealers charge $500–$1,500 for paint protection that often costs them $50–$100 to apply. Factory paint is already designed to resist normal wear. Aftermarket ceramic coatings from a detailer are typically better quality and far cheaper than the dealer's version.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">Nitrogen-Filled Tires</h3>
            <p className="text-muted-foreground mb-4">
              Nitrogen does lose pressure slightly slower than regular air, but the difference is negligible for everyday driving. Dealers charge $100–$300 for something that many tire shops offer for free or near-free. You can fill your tires with regular air at any gas station without issue.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">VIN Etching</h3>
            <p className="text-muted-foreground mb-4">
              VIN etching involves engraving your vehicle identification number on windows as a theft deterrent. Dealers charge $200–$400 for this. DIY kits cost $20–$30. Some insurance companies offer it for free. The actual theft deterrence value is debatable.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">Protection Packages / Dealer Bundles</h3>
            <p className="text-muted-foreground mb-8">
              The most common tactic is bundling several low-cost items into one package priced at $1,000–$2,500. You'll see names like "Advantage Package," "Dealer Protection Plan," or "Certified Shield." Each individual item might cost the dealer $20–$50. The combined price is almost entirely profit margin.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">When Dealers Say "It's Already Installed"</h2>
            <p className="text-muted-foreground mb-4">
              This is the most common justification for charging for add-ons. The dealer pre-installs products on inventory vehicles, then tells buyers the items can't be removed because they're "already on the car."
            </p>
            <p className="text-muted-foreground mb-4">
              Here's what they won't tell you: the decision to install those products was the dealer's, not yours. You didn't request them. In many cases, the dealer chose to install them specifically because they increase the final price and improve their margin.
            </p>
            <p className="text-muted-foreground mb-8">
              You are under no obligation to pay for products you didn't ask for. If a dealer won't sell you the car without the package, you can walk away — or negotiate the overall price down to offset the add-ons.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How to Push Back</h2>
            <p className="text-muted-foreground mb-3">
              You don't need to get confrontational. A direct, professional response works best:
            </p>
            <div className="rounded-md border border-border p-5 bg-muted/50 mb-4">
              <p className="text-sm md:text-base text-foreground leading-relaxed italic">
                "I'm not interested in the add-on package. I'd like the out-the-door price based on the vehicle sale price, taxes, registration, and doc fee only. Can you provide that in writing?"
              </p>
            </div>
            <p className="text-muted-foreground mb-4">
              If they say the add-ons can't be removed:
            </p>
            <div className="rounded-md border border-border p-5 bg-muted/50 mb-8">
              <p className="text-sm md:text-base text-foreground leading-relaxed italic">
                "I understand the items are installed. I'm asking you to reduce the vehicle price by the cost of the add-on package so the total out-the-door price reflects the car's value without optional accessories."
              </p>
            </div>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Why Getting a Written OTD Price Matters</h2>
            <p className="text-muted-foreground mb-4">
              Add-ons are most dangerous when they're buried in a monthly payment. A $1,500 protection package adds about $25–$30/month over a 60-month loan — small enough that many buyers don't notice. But you're paying interest on that amount too, so the real cost is even higher.
            </p>
            <p className="text-muted-foreground mb-4">
              That's why the out-the-door price is the only number that matters. It shows every dollar you'll pay, including add-ons, fees, and taxes. When you see each line item broken out, it's much easier to spot what's legitimate and what's padding.
            </p>
            <p className="text-muted-foreground mb-8">
              Always request a written, itemized OTD quote before visiting the dealership. If a dealer won't provide one, that's a red flag in itself.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-semibold mb-2 text-foreground" data-testid="text-add-ons-cta-heading">
              Have a dealer quote already?
            </h2>
            <p className="text-muted-foreground mb-4">
              Paste it into Odigos and we'll flag hidden fees, unnecessary add-ons, and anything that doesn't add up — so you know exactly what to push back on.
            </p>
            <Link href="/">
              <Button size="lg" data-testid="button-cta-add-ons">
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
