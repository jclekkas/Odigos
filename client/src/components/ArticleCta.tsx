import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function ArticleCta() {
  return (
    <div
      className="rounded-xl border border-border bg-muted/30 p-6 mt-12"
      data-testid="section-article-cta"
    >
      <h3 className="text-base font-semibold text-foreground mb-2">
        Think your dealer quote is clean?
      </h3>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        Paste it and find out. Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. It does not estimate a fair vehicle price, and it does not treat an unverified fee range as a legal limit.
      </p>
      <Link href="/analyze">
        <Button variant="cta" size="lg" data-testid="button-cta-article">
          Check This Quote
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
