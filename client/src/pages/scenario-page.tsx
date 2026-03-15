import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { setSeoMeta } from "@/lib/seo";
import { trackCtaClick } from "@/lib/tracking";
import ArticleHeader from "@/components/ArticleHeader";
import DirectAnswerBlock from "@/components/DirectAnswerBlock";
import { getScenario } from "@/data/scenarioPages";
import NotFound from "@/pages/not-found";
import { MessageSquareQuote } from "lucide-react";

export default function ScenarioPage() {
  const [location] = useLocation();
  const slug = location.replace(/^\//, "");
  const data = getScenario(slug);

  useEffect(() => {
    if (!data) return;
    return setSeoMeta({
      title: data.seoTitle,
      description: data.seoDescription,
      path: `/${data.slug}`,
    });
  }, [data]);

  if (!data) return <NotFound />;

  return (
    <div className="min-h-screen bg-background">
      <ArticleHeader slug={data.slug} />

      <main className="py-12 md:py-20 px-6">
        <article className="max-w-2xl mx-auto">

          <h1
            className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight"
            data-testid={`text-${data.slug}-headline`}
          >
            {data.title}
          </h1>

          <DirectAnswerBlock
            question={data.snippetQuestion}
            answer={data.snippetAnswer}
          />

          <div className="prose prose-lg dark:prose-invert max-w-none">

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What&rsquo;s happening</h2>
            {data.whatsHappening.map((p, i) => (
              <p key={i} className="text-lg text-muted-foreground mb-4">{p}</p>
            ))}

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Is this legal or common?</h2>
            {data.isItLegal.map((p, i) => (
              <p key={i} className="text-muted-foreground mb-4">{p}</p>
            ))}

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What you should do next</h2>
            <ul className="space-y-3 mb-6">
              {data.whatToDoNext.map((item, i) => (
                <li key={i} className="text-muted-foreground flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5 shrink-0">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="my-8 rounded-lg border border-border bg-muted/30 p-5">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquareQuote className="h-4 w-4 text-primary shrink-0" />
                <p className="text-sm font-semibold text-foreground">What to say to the dealer</p>
              </div>
              <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic border-l-2 border-primary/40 pl-4">
                {data.dealerScript}
              </blockquote>
            </div>

            <div className="my-8 rounded-lg border border-border bg-muted/40 p-4">
              <p className="font-medium text-foreground mb-3">{data.ctaHeading}</p>
              <p className="text-sm text-muted-foreground mb-3">{data.ctaBody}</p>
              <Link href={`/analyze?src=${data.slug}`}>
                <Button
                  size="sm"
                  data-testid={`button-cta-${data.slug}`}
                  onClick={() => trackCtaClick({ location: "article_mid_cta", article: data.slug })}
                >
                  Check My Deal
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-2">Takes 10 seconds &middot; No signup required</p>
            </div>

            {data.faqs.length > 0 && (
              <>
                <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Common questions</h2>
                <div className="space-y-5 mb-6">
                  {data.faqs.map((faq, i) => (
                    <div key={i}>
                      <p className="text-sm font-semibold text-foreground mb-1.5">{faq.question}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

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

            <p className="text-sm text-muted-foreground mt-2">
              Part of:{" "}
              <Link href="/dealer-pricing-problems" className="underline underline-offset-2 text-foreground hover:text-muted-foreground transition-colors">
                Common Dealer Pricing Problems
              </Link>
            </p>

          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-semibold mb-3 text-foreground" data-testid={`text-${data.slug}-bottom-cta`}>
              {data.ctaHeading}
            </h2>
            <p className="text-muted-foreground mb-6">{data.ctaBody}</p>
            <Link href={`/analyze?src=${data.slug}`}>
              <Button
                size="lg"
                data-testid={`button-bottom-cta-${data.slug}`}
                onClick={() => trackCtaClick({ location: "article_bottom_cta", article: data.slug })}
              >
                Check My Deal
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-3">Takes 10 seconds &middot; No signup required</p>
          </div>

          <p className="text-xs text-muted-foreground mt-12">
            Not affiliated with any dealership. This is general guidance, not legal advice. Optimized for U.S. car purchases.
          </p>
        </article>
      </main>
    </div>
  );
}
