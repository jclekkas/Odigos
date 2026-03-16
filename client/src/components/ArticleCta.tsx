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
        Paste the message or quote you received. Odigos checks for missing out-the-door pricing, hidden fees, and common dealer tactics — in about 10 seconds.
      </p>
      <Link href="/analyze">
        <Button size="lg" data-testid="button-cta-article">
          Check My Deal with Odigos
        </Button>
      </Link>
    </div>
  );
}
