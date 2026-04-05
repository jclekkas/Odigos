import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { setSeoMeta } from "@/lib/seo";
import { faqPageSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";
import NotFound from "@/pages/not-found";
import { STATE_FEES } from "@/data/stateFees";
import SourceCitation from "@/components/SourceCitation";

export default function CarDealerFeesState() {
  const [location] = useLocation();
  const stateSlug = location
    .replace(/^\/car-dealer-fees-/, "")
    .split(/[?#]/)[0];
  const data = STATE_FEES[stateSlug];
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!data) return;
    return setSeoMeta({
      title: data.pageTitle ?? `Car Dealer Fees in ${data.name}: What You'll Actually Pay | Odigos`,
      description: data.metaDescription,
      path: `/car-dealer-fees-${data.slug}`,
    });
  }, [data]);

  if (!data) return <NotFound />;

  const baseFaqQuestions = [
    {
      question: `What is the dealer doc fee in ${data.name}?`,
      answer: `The typical dealer documentation fee in ${data.name} is ${data.docFeeRange}. ${data.capNote}`,
    },
    {
      question: `What is the sales tax on cars in ${data.name}?`,
      answer: data.salesTaxNote,
    },
    {
      question: `What should ${data.name} car buyers watch out for?`,
      answer: data.watchFor.join(" "),
    },
    {
      question: `How can I negotiate a better deal in ${data.name}?`,
      answer: data.negotiationNote,
    },
  ];

  const commonQsFaqFormat = (data.commonQuestions ?? []).map((cq) => ({
    question: cq.q,
    answer: cq.a,
  }));

  const allFaqsForSchema = [...baseFaqQuestions, ...commonQsFaqFormat];

  function handleCopy() {
    navigator.clipboard.writeText(data.dealerMessage).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const pageHeading = data.pageTitle
    ? data.pageTitle.replace(/ \| Odigos$/, "")
    : `Car Dealer Fees in ${data.name}: What You'll Actually Pay`;

  return (
    <ArticleLayout title={pageHeading}>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqPageSchema({ questions: allFaqsForSchema }))}</script>
      </Helmet>
      <h1
        className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight"
        data-testid={`text-${data.slug}-headline`}
      >
        {pageHeading}
      </h1>

      <div className="rounded-lg border border-border bg-muted/30 p-5 mb-8" data-testid={`block-snippet-${data.slug}`}>
        <p className="text-sm font-semibold text-foreground mb-2">Quick answer</p>
        <p className="text-sm text-muted-foreground">{data.snippetAnswer} <SourceCitation sources={data.sources} lastVerified={data.lastVerified} /></p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-6">{data.introAngle}</p>

        <p className="text-sm text-muted-foreground mb-6">
          Already have a {data.name} dealer quote?{" "}
          <Link href="/analyze" className="underline text-foreground">
            Paste it here
          </Link>{" "}
          and see if any fees look off.
        </p>

        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-5 mb-8" data-testid={`cta-top-${data.slug}`}>
          <p className="text-base font-semibold text-foreground mb-2">{data.ctaHeading}</p>
          <p className="text-sm text-muted-foreground mb-3">
            Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.
          </p>
          <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white font-semibold" data-testid={`button-cta-top-${data.slug}`}>
            <Link href="/analyze">Check my {data.name} quote</Link>
          </Button>
        </div>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">
          Documentation fee in {data.name}
        </h2>

        <p className="text-lg text-muted-foreground mb-4">
          <strong className="text-foreground">Typical range: {data.docFeeRange}</strong>{" "}
          <SourceCitation sources={data.sources} lastVerified={data.lastVerified} />
        </p>

        <p className="text-lg text-muted-foreground mb-6">{data.capNote}</p>

        <p className="text-lg text-muted-foreground mb-6">
          The{" "}
          <Link href="/dealer-doc-fee" className="underline text-foreground">
            documentation fee
          </Link>{" "}
          covers the dealer's cost of processing your paperwork — title transfer, registration filing, loan documents, and contract preparation. It appears on nearly every deal in {data.name} and is one of the first line items to verify when reviewing a quote. For comparison across all states, see the{" "}
          <Link href="/car-dealer-fees-by-state" className="underline text-foreground">
            fees across all states
          </Link>{" "}
          guide.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">
          Sales tax and registration in {data.name}
        </h2>

        <p className="text-lg text-muted-foreground mb-4">
          <strong className="text-foreground">Sales tax / title tax:</strong>{" "}
          {data.salesTaxNote}{" "}
          <SourceCitation sources={data.sources} lastVerified={data.lastVerified} />
        </p>

        <p className="text-lg text-muted-foreground mb-6">
          <strong className="text-foreground">Registration fees:</strong>{" "}
          {data.registrationNote}{" "}
          <SourceCitation sources={data.sources} lastVerified={data.lastVerified} />
        </p>

        <p className="text-lg text-muted-foreground mb-6">
          Government fees — sales tax, title, and registration — are non-negotiable. They're set by the state and local authorities and don't vary between dealerships. If two {data.name} dealers quote different tax amounts on the same vehicle, the math on one of them is likely wrong. For a full breakdown of which charges are fixed and which are negotiable, see{" "}
          <Link href="/car-dealer-fees-explained" className="underline text-foreground">
            car dealer fees explained
          </Link>
          .
        </p>

        {data.specialNotes && (
          <>
            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">
              Special notes for {data.name} buyers
            </h2>
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-5 mb-8">
              <p className="text-base text-muted-foreground">{data.specialNotes}</p>
            </div>
          </>
        )}

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">
          What {data.name} buyers should watch for
        </h2>

        <ul className="space-y-4 mb-8 text-muted-foreground">
          {data.watchFor.map((item, i) => {
            const colonIdx = item.indexOf(":");
            const hasBold = colonIdx > 0 && colonIdx < 60;
            return (
              <li key={i} className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1">•</span>
                <span>
                  {hasBold ? (
                    <>
                      <strong className="text-foreground">{item.slice(0, colonIdx)}: </strong>
                      {item.slice(colonIdx + 2)}
                    </>
                  ) : (
                    item
                  )}
                </span>
              </li>
            );
          })}
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">
          Negotiation note for {data.name} buyers
        </h2>

        <p className="text-lg text-muted-foreground mb-6">{data.negotiationNote}</p>

        <p className="text-lg text-muted-foreground mb-6">
          The most important number to negotiate toward is the{" "}
          <Link href="/out-the-door-price" className="underline text-foreground">
            out-the-door price
          </Link>{" "}
          — the total you pay to drive the car home, including every fee, tax, and add-on. This is the only number that lets you compare two {data.name} dealers fairly. A dealer with a lower vehicle price but higher doc fee or more add-ons may cost more overall than one with a slightly higher vehicle price and clean fee structure.
        </p>

        <p className="text-lg text-muted-foreground mb-8">
          Most{" "}
          <Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">
            dealer add-ons
          </Link>{" "}
          — protection packages, paint sealant, nitrogen tires, VIN etching — are optional even when presented as part of the vehicle or as "standard." Removing or negotiating these down is one of the most effective ways to reduce a {data.name} OTD total.
        </p>

        {data.competitorGapSection && (
          <>
            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">
              What most guides miss for {data.name} buyers
            </h2>
            <p className="text-lg text-muted-foreground mb-8">{data.competitorGapSection}</p>
          </>
        )}

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">
          What to say to the dealer
        </h2>

        <p className="text-lg text-muted-foreground mb-4">
          Before visiting any {data.name} dealership, send this message to get a complete itemized quote you can actually compare:
        </p>

        <div className="relative rounded-lg border border-border bg-muted/50 p-5 mb-8" data-testid={`block-dealer-message-${data.slug}`}>
          <p className="text-sm text-foreground leading-relaxed pr-10">{data.dealerMessage}</p>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 p-1.5 rounded border border-border bg-background hover:bg-muted transition-colors"
            data-testid={`button-copy-dealer-message-${data.slug}`}
            aria-label="Copy dealer message"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {data.commonQuestions && data.commonQuestions.length > 0 && (
          <>
            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">
              Common questions from {data.name} buyers
            </h2>
            <div className="space-y-6 mb-8">
              {data.commonQuestions.map((cq, idx) => (
                <div key={idx}>
                  <h3 className="text-base font-semibold text-foreground mb-1" data-testid={`text-common-q-${data.slug}-${idx}`}>{cq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{cq.a}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Related guides</h2>

        <ul className="space-y-2 mb-8 text-muted-foreground">
          {data.internalLinks.map((link) => (
            <li key={link.href} className="flex items-start gap-2">
              <span className="text-muted-foreground">→</span>
              <Link href={link.href} className="underline text-foreground">
                {link.label.charAt(0).toUpperCase() + link.label.slice(1)}
              </Link>
            </li>
          ))}
        </ul>

        {data.sources && data.sources.length > 0 && (
          <>
            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Sources</h2>
            <ul className="space-y-2 mb-8 text-muted-foreground text-sm">
              {data.sources.map((src) => (
                <li key={src} className="flex items-start gap-2">
                  <span>↗</span>
                  <a
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-foreground break-all"
                    data-testid={`link-source-${data.slug}`}
                  >
                    {src}
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <ArticleCta />

      <p className="text-xs text-muted-foreground mt-12">
        These figures are approximate and based on {data.lastVerified} source data. Verify with your state's attorney general or motor vehicle agency.
      </p>
    </ArticleLayout>
  );
}
