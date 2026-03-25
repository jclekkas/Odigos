import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function ArticleCta() {
  return (
    <div
      className="rounded-xl border border-border bg-muted/30 p-6 mt-12"
      data-testid="section-article-cta"
    >
      <h3 className="text-base font-semibold text-foreground mb-2">
        Not sure if your dealer quote is complete?
      </h3>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        Paste the message or quote you received. Odigos checks for missing out-the-door pricing, hidden fees, and common dealer tactics — results usually take about a minute.
      </p>
      <Link href="/analyze">
        <Button variant="cta" size="lg" data-testid="button-cta-article">
          Check My Deal with Odigos
        </Button>
      </Link>
      <p className="mt-3 text-xs text-muted-foreground">
        <Link href="/example-analysis" className="underline underline-offset-2 hover:text-foreground transition-colors" data-testid="link-example-analysis-article-cta">
          See an example analysis →
        </Link>
      </p>
    </div>
  );
}
