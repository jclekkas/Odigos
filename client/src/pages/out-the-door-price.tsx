import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy, AlertTriangle, CircleDollarSign } from "lucide-react";
import logoImage from "@assets/odigos_logo.png";

const OTD_MESSAGE = `Before I come in, can you confirm the out-the-door price in writing, including the sale price, all taxes, title/registration, doc fee, and any dealer add-ons? If there are add-ons, please itemize them with prices. I'm ready to proceed once I can review the full OTD breakdown.`;

const sampleBreakdown = [
  { label: "Vehicle sale price", value: "$32,500" },
  { label: "Sales tax (6.25%)", value: "$2,031" },
  { label: "Title & registration", value: "$285" },
  { label: "Dealer documentation fee", value: "$499" },
  { label: "Dealer add-ons (paint protection)", value: "$695" },
  { label: "Total out-the-door price", value: "$36,010", isTotal: true },
];

export default function OutTheDoorPrice() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Out-the-Door Price: What It Means & What It Should Include | Odigos";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", "Out-the-door price (OTD) is the total cost to buy a car. Learn what it includes, what dealers leave out, red flags to avoid, and a copy-paste message to request an itemized OTD quote.");
    return () => {
      document.title = "Is This a Good Car Deal? | Odigos";
      if (meta) {
        meta.setAttribute("content", "Paste dealer texts or emails. Odigos flags what's missing, risky, or unclear before you go to the dealership.");
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(OTD_MESSAGE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = OTD_MESSAGE;
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
        <article className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-otd-headline">
            Out-the-Door Price (OTD): What It Means & What It Should Include
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-4">
              The out-the-door price (OTD) is the total amount you actually pay to drive a car off the lot. It includes the vehicle price, taxes, registration, dealer fees, and any add-ons. It's the only number that tells you what a car really costs.
            </p>
            <p className="text-lg text-muted-foreground mb-10">
              If a dealer won't give you the OTD price in writing, you don't know the real cost. A sticker price or monthly payment alone hides too much. Always ask for the full breakdown before you visit.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What an Out-the-Door Price Includes</h2>
            <ul className="space-y-2 mb-4 text-muted-foreground">
              {[
                "Vehicle sale price",
                "Sales tax",
                "Title & registration",
                "Dealer documentation fee",
                "Mandatory state/local fees",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mb-8">
              Not sure whether your <Link href="/dealer-doc-fee" className="underline text-foreground">dealer documentation fees</Link> are normal? We break down what's typical by state and how to push back.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What's Often NOT Included (But Should Be)</h2>
            <p className="text-muted-foreground mb-3">
              These items frequently get added after the initial price is quoted. If you don't ask, they'll show up in the finance office:
            </p>
            <ul className="space-y-2 mb-8 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                <span>Dealer add-ons (paint protection, nitrogen-filled tires, VIN etching, etc.) — learn which <Link href="/mandatory-dealer-add-ons" className="underline text-foreground">mandatory dealer add-ons</Link> are actually optional</span>
              </li>
              {[
                "Dealer-installed accessories",
                "Extended warranty / service contract",
                "GAP insurance",
                '"Protection packages" or "dealer services"',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Why Dealers Avoid Giving OTD Prices</h2>
            <ul className="space-y-2 mb-8 text-muted-foreground">
              {[
                'They focus on the monthly payment instead of total price\u2014making it harder to compare deals.',
                '"Come in and we\'ll work it out" keeps you from doing homework beforehand.',
                "Add-ons are introduced later during F&I (Finance & Insurance), when you're already committed.",
                "Rebates and incentives come with conditions that aren't clear upfront.",
                'The "doc fee" and miscellaneous fees are often left out of initial quotes.',
                "Without a written OTD, dealers can adjust numbers at the last minute.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
              Red Flags to Watch For
            </h2>
            <ul className="space-y-2 mb-8 text-muted-foreground">
              {[
                "Payment-only quote with no total price listed",
                'APR "depends on credit" with no tier or range specified',
                '"Mandatory" packages with unclear or missing prices',
                "OTD won't be provided in writing before your visit",
                'Fees labeled "market adjustment," "dealer services," or "reconditioning" on a new car',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Copy-Paste Message to Ask for an Itemized OTD</h2>
            <p className="text-muted-foreground mb-3">
              Send this to any dealer before visiting. It's direct, polite, and covers the essentials:
            </p>
            <Card className="relative p-5 bg-muted/50 mb-8">
              <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic pr-10">
                {OTD_MESSAGE}
              </blockquote>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-3 right-3"
                onClick={handleCopy}
                data-testid="button-copy-otd-message"
                aria-label="Copy message"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
              {copied && (
                <span className="absolute top-3 right-14 text-xs text-green-600 dark:text-green-400 font-medium">Copied</span>
              )}
            </Card>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground flex items-center gap-2">
              <CircleDollarSign className="h-5 w-5 shrink-0" />
              Example: Itemized OTD Breakdown (Sample)
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              This is a simplified example. Your numbers will differ by state, dealer, and vehicle.
            </p>
            <div className="rounded-md border border-border overflow-hidden mb-4">
              <table className="w-full text-sm" data-testid="table-otd-breakdown">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Line item</th>
                    <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleBreakdown.map((row) => (
                    <tr
                      key={row.label}
                      className={row.isTotal ? "border-t-2 border-border bg-muted/30 font-semibold" : "border-t border-border/50"}
                    >
                      <td className={`py-2.5 px-4 ${row.isTotal ? "text-foreground" : "text-muted-foreground"}`}>
                        {row.label}
                      </td>
                      <td className={`py-2.5 px-4 text-right ${row.isTotal ? "text-foreground" : "text-muted-foreground"}`}>
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground mb-8">
              Your numbers will differ by state and dealer. What matters is that every line item is visible before you sign anything.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-semibold mb-2 text-foreground" data-testid="text-otd-cta-heading">
              Already have dealer texts or a quote?
            </h2>
            <p className="text-muted-foreground mb-4">
              Odigos can flag what's missing, risky, or unclear from real dealer messages\u2014so you know what to ask before you go in.
            </p>
            <Link href="/">
              <Button size="lg" data-testid="button-cta-otd">
                Analyze My Dealer Messages
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
