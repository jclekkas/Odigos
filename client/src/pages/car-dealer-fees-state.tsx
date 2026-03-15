import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { setSeoMeta } from "@/lib/seo";
import { trackCtaClick } from "@/lib/tracking";
import ArticleHeader from "@/components/ArticleHeader";
import DirectAnswerBlock from "@/components/DirectAnswerBlock";
import { getStateFee } from "@/data/stateFees";
import NotFound from "@/pages/not-found";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function CarDealerFeesState() {
  const params = useParams<{ state: string }>();
  const stateSlug = params.state ?? "";
  const data = getStateFee(stateSlug);

  const slug = `car-dealer-fees-${stateSlug}`;

  useEffect(() => {
    if (!data) return;
    return setSeoMeta({
      title: `Car Dealer Fees in ${data.state}: Doc Fees, Taxes, and What to Watch For | Odigos`,
      description: `What car buyers in ${data.state} should know about dealer fees, documentation charges, ${data.hasDocFeeCap ? "state doc fee caps," : "uncapped doc fees,"} and taxes. Includes what's typical and what should make you ask questions.`,
      path: `/${slug}`,
    });
  }, [data, slug]);

  if (!data) return <NotFound />;

  return (
    <div className="min-h-screen bg-background">
      <ArticleHeader slug={slug} />

      <main className="py-12 md:py-20 px-6">
        <article className="max-w-2xl mx-auto">

          <h1
            className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight"
            data-testid={`text-${stateSlug}-headline`}
          >
            Car Dealer Fees in {data.state}: Doc Fees, Taxes, and What to Watch For
          </h1>

          <DirectAnswerBlock
            question={`What are car dealer fees in ${data.state}?`}
            answer={data.snippetAnswer}
          />

          <div className="prose prose-lg dark:prose-invert max-w-none">

            <p className="text-lg text-muted-foreground mb-6">{data.introAngle}</p>

            <div className="my-6 rounded-lg border border-border bg-muted/40 p-4">
              <p className="font-medium text-foreground mb-3">
                Have a {data.state} dealer quote? Check whether the fees match what's typical.
              </p>
              <Link href={`/analyze?src=${slug}`}>
                <Button
                  size="sm"
                  data-testid={`button-callout-${stateSlug}`}
                  onClick={() => trackCtaClick({ location: "article_top_callout", article: slug })}
                >
                  Check My Deal
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-2">Takes 10 seconds · No signup required</p>
            </div>

            <p className="text-muted-foreground mb-6">{data.whatToBuyersNeed}</p>

            {/* Doc fee section */}
            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">
              Documentation fees in {data.state}
            </h2>
            {data.hasDocFeeCap && data.docFeeCap && (
              <div className="flex items-start gap-2 mb-4 p-3 rounded-md bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{data.state} regulates doc fees.</span>{" "}
                  The documentation fee is generally capped at {data.docFeeCap}.
                </p>
              </div>
            )}
            {!data.hasDocFeeCap && (
              <div className="flex items-start gap-2 mb-4 p-3 rounded-md bg-amber-500/10 border border-amber-500/20">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{data.state} has no cap on documentation fees.</span>{" "}
                  Dealers set their own rate — {data.docFeeRange.toLowerCase()}.
                </p>
              </div>
            )}
            <p className="text-muted-foreground mb-6">{data.docFeeSection}</p>

            {/* Tax & registration section */}
            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">
              Sales tax and registration in {data.state}
            </h2>
            <p className="text-sm font-medium text-foreground mb-1">
              Effective rate: <span className="text-muted-foreground font-normal">{data.salesTaxRate}</span>
            </p>
            <p className="text-muted-foreground mb-4">{data.salesTaxNote}</p>
            <p className="text-muted-foreground mb-6">{data.registrationNote}</p>

            {/* What's typical vs. what should make you ask questions */}
            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">
              {data.typicalVsQuestionable.heading}
            </h2>
            <p className="text-muted-foreground mb-4">
              When you receive a dealer quote in {data.state}, some numbers fall within a normal range and some should prompt a closer look before you sign.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Typically expected
                </p>
                <ul className="space-y-2">
                  {data.typicalVsQuestionable.typical.map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5 shrink-0">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  Worth asking about
                </p>
                <ul className="space-y-2">
                  {data.typicalVsQuestionable.questionable.map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* What to watch for */}
            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">
              What {data.state} buyers should watch for
            </h2>
            <div className="space-y-4 mb-6">
              {data.watchForItems.map((item, i) => (
                <div key={i} className="border-l-2 border-amber-500/40 pl-4 py-1">
                  <p className="text-sm font-semibold text-foreground mb-1">{item.flag}</p>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </div>

            {/* Mid CTA */}
            <div className="my-8 rounded-lg border border-border bg-muted/40 p-4">
              <p className="font-medium text-foreground mb-3">
                Paste your {data.state} dealer quote and Odigos flags anything that looks off.
              </p>
              <Link href={`/analyze?src=${slug}`}>
                <Button
                  size="sm"
                  data-testid={`button-mid-cta-${stateSlug}`}
                  onClick={() => trackCtaClick({ location: "article_mid_cta", article: slug })}
                >
                  Check My Deal
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-2">Takes 10 seconds · No signup required</p>
            </div>

            {/* Negotiation section */}
            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">
              Negotiation approach for {data.state} buyers
            </h2>
            <p className="text-muted-foreground mb-6">{data.negotiationNote}</p>

            {/* Related links */}
            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Related guides</h2>
            <ul className="space-y-2 mb-6">
              {data.relatedLinks.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-foreground underline underline-offset-2 hover:text-muted-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

          </div>

          {/* Bottom CTA */}
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-semibold mb-3 text-foreground" data-testid={`text-${stateSlug}-cta-heading`}>
              {data.ctaHeading}
            </h2>
            <p className="text-muted-foreground mb-6">{data.ctaBody}</p>
            <Link href={`/analyze?src=${slug}`}>
              <Button
                size="lg"
                data-testid={`button-cta-${stateSlug}`}
                onClick={() => trackCtaClick({ location: "article_bottom_cta", article: slug })}
              >
                Check My Deal
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-3">Takes 10 seconds · No signup required</p>
          </div>

          <p className="text-xs text-muted-foreground mt-12">
            Not affiliated with any dealership. Fee ranges are approximate and may vary. Optimized for U.S. car purchases.
          </p>
        </article>
      </main>
    </div>
  );
}
