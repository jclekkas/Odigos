import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

export default function CarLeaseFeesExplained() {
  useEffect(() => {
    setSeoMeta({
      title: "Car Lease Fees Explained: Every Fee on Your Lease Quote | Odigos",
      description: "A complete breakdown of every fee on a car lease: acquisition fee, disposition fee, excess mileage, wear-and-tear charges, early termination, and more. Know what you're paying before you sign.",
      path: "/car-lease-fees-explained",
    });
  }, []);

  return (
    <ArticleLayout title="Car Lease Fees Explained">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "Car Lease Fees Explained: Every Fee on Your Lease Quote | Odigos", description: "A complete breakdown of every fee on a car lease: acquisition fee, disposition fee, excess mileage, wear-and-tear charges, early termination, and more. Know what you're paying before you sign.", path: "/car-lease-fees-explained" }))}</script>
      </Helmet>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-lease-fees-headline">
        Car Lease Fees Explained: Every Fee on Your Lease Quote
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground">
          Leasing a car involves a different set of fees than buying one outright. Some are charged upfront, some are baked into your monthly payment, and others only appear if you break the rules at lease-end. Understanding every fee on your lease quote is the only way to know whether you're getting a fair deal — or overpaying by thousands over the life of the lease.
        </p>
        <p className="text-lg text-muted-foreground">
          This guide covers every fee you're likely to see on a car lease, explains who sets each one, and tells you which are negotiable.
        </p>

        <p className="text-sm text-muted-foreground">
          Already have a dealer quote? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and see if anything looks off.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Acquisition Fee (Bank Fee)</h2>
        <p className="text-muted-foreground">
          The <Link href="/glossary/acquisition-fee" className="underline text-foreground">acquisition fee</Link> — sometimes called a "bank fee" or "lease inception fee" — is charged by the leasing company (the bank or captive lender, not the dealer) to originate the lease. Think of it as the lease equivalent of a loan origination fee.
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Typical range:</strong> $595 to $1,095, depending on the brand and leasing company</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Who sets it:</strong> The leasing company. This fee is generally non-negotiable at the dealer level.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">How it's paid:</strong> Either upfront at signing or rolled into the monthly payment. Rolling it in costs slightly more over the lease term because you'll pay interest (via the <Link href="/glossary/money-factor" className="underline text-foreground">money factor</Link>) on it.</span>
          </li>
        </ul>
        <p className="text-muted-foreground">
          The acquisition fee is legitimate, but you should know the exact amount before signing. If a dealer quotes an acquisition fee significantly higher than what the manufacturer's leasing arm charges, ask for clarification — an inflated bank fee is a red flag.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Disposition Fee</h2>
        <p className="text-muted-foreground">
          The <Link href="/glossary/disposition-fee" className="underline text-foreground">disposition fee</Link> is charged at the end of the lease when you return the vehicle. It covers the leasing company's cost of inspecting, reconditioning, and reselling the car. You only pay it if you return the vehicle — not if you buy it out or lease another vehicle from the same brand.
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Typical range:</strong> $300 to $500</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">When it's due:</strong> At lease-end, only if you turn the car in</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">How to avoid it:</strong> Purchase the vehicle at lease-end, or lease another vehicle from the same manufacturer (many brands waive the fee for loyalty)</span>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-foreground">Excess Mileage Charges</h2>
        <p className="text-muted-foreground">
          Every lease contract specifies an annual mileage allowance — typically 10,000, 12,000, or 15,000 miles per year. If you exceed that limit over the life of the lease, you'll owe a per-mile penalty when you return the vehicle.
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Typical rate:</strong> $0.15 to $0.30 per mile over the limit. Luxury brands tend to charge at the higher end.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Example:</strong> On a 36-month lease with a 12,000-mile annual limit (36,000 total), driving 42,000 miles would mean 6,000 excess miles. At $0.20/mile, that's a $1,200 bill at lease-end.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Tip:</strong> It's almost always cheaper to buy extra miles upfront (typically $0.10–$0.15/mile) than to pay the overage penalty later. Be honest about how much you drive.</span>
          </li>
        </ul>
        <p className="text-muted-foreground">
          If you're consistently driving more than 15,000 miles per year, leasing may not be the most cost-effective option. Run the numbers against a purchase before committing.
        </p>

        <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm font-semibold text-foreground mb-2">Not sure what's in your lease quote?</p>
          <p className="text-sm text-muted-foreground mb-3">
            Paste your dealer lease quote into Odigos. We'll break down every fee, flag anything unusual, and show you the real cost of the lease.
          </p>
          <Link href="/analyze">
            <Button variant="cta" size="sm" data-testid="button-cta-mid-article-lease-fees">
              Check This Quote
            </Button>
          </Link>
        </div>

        <h2 className="text-2xl font-semibold text-foreground">Excess Wear-and-Tear Charges</h2>
        <p className="text-muted-foreground">
          When you return a leased vehicle, it goes through an inspection. Normal wear is expected — small door dings, light scratches, and minor interior wear are generally acceptable. But damage beyond "normal" will cost you.
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">What counts as excess:</strong> Dents larger than a quarter, deep scratches, cracked windshields, heavily stained upholstery, tire tread below 4/32", missing equipment</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Typical cost:</strong> $500 to $2,000+ depending on the damage. Each item is billed separately.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Tip:</strong> Get the pre-return inspection done 30–60 days before lease-end. This gives you time to fix issues yourself at a body shop for less than the leasing company would charge.</span>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-foreground">Early Termination Fee</h2>
        <p className="text-muted-foreground">
          If you need to end your lease before the contract term is up, you'll face an early termination fee. This is one of the most expensive penalties in any lease agreement.
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">How it's calculated:</strong> Typically the difference between what you still owe on the lease (remaining payments plus residual) and the current market value of the vehicle. The earlier you terminate, the larger the gap.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Typical cost:</strong> Several thousand dollars. Terminating a $400/month lease 18 months early could easily cost $3,000–$6,000+.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Alternatives:</strong> Lease transfer services (like Swapalease or LeaseTrader) let you transfer the lease to another person, potentially avoiding the early termination penalty altogether.</span>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-foreground">Security Deposit</h2>
        <p className="text-muted-foreground">
          Some leasing companies require — or offer the option of — a security deposit at lease signing. The deposit is refundable at lease-end, assuming you return the vehicle in acceptable condition.
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Typical amount:</strong> One monthly payment, rounded up to the nearest $50</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Benefit:</strong> Some manufacturers (notably BMW and Mercedes) will reduce your money factor — and therefore your monthly payment — if you put down multiple security deposits (MSDs). This can be one of the most effective ways to lower lease cost.</span>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-foreground">Other Fees You May See</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Documentation fee (doc fee):</strong> The dealer's paperwork charge, identical to what you'd pay on a purchase. See our <Link href="/junk-fees-explained" className="underline text-foreground">junk fees guide</Link> for context.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Title and registration:</strong> Government fees — legitimate and non-negotiable.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Sales tax on lease:</strong> Varies by state. Some states tax the full vehicle price; others tax only the monthly payments. This can make a significant difference in total cost.</span>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-foreground">How to Protect Yourself</h2>
        <p className="text-muted-foreground">
          Before signing any lease, make sure you can answer these questions:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>What is the acquisition fee, and is it being rolled into the payment or paid upfront?</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>What is the <Link href="/glossary/money-factor" className="underline text-foreground">money factor</Link>, and what APR does that translate to?</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>What is the annual mileage allowance, and what's the per-mile overage charge?</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>What is the disposition fee if I return the car?</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>What does the early termination clause say?</span>
          </li>
        </ul>
        <p className="text-muted-foreground">
          If the dealer can't or won't answer these questions clearly, that's a signal to slow down. A transparent lease should have every fee itemized before you sit down in the finance office.
        </p>
      </div>

      <ArticleCta />

      <p className="text-xs text-muted-foreground mt-12">
        Not affiliated with any dealership. Optimized for U.S. car leases.
      </p>
    </ArticleLayout>
  );
}
