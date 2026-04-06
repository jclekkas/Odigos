import { useEffect } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";
import { glossaryTerms } from "@/data/glossary-terms";

export default function Glossary() {
  useEffect(() => {
    setSeoMeta({
      title: "Car Buying Glossary: Dealer Fees & Lease Terms Explained | Odigos",
      description: "Plain-English definitions of dealer fees, lease terms, and pricing jargon. Understand every line item on your car deal.",
      path: "/glossary",
    });
  }, []);

  return (
    <ArticleLayout title="Glossary">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "DefinedTermSet",
          "name": "Car Buying Glossary",
          "description": "Plain-English definitions of dealer fees, lease terms, and pricing jargon.",
          "url": "https://odigosauto.com/glossary",
          "hasDefinedTerm": glossaryTerms.map((t) => ({
            "@type": "DefinedTerm",
            "name": t.term,
            "description": t.shortDefinition,
            "url": `https://odigosauto.com/glossary/${t.slug}`,
          })),
        })}</script>
      </Helmet>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-glossary-headline">
        Car Buying Glossary
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground">
          Plain-English definitions of every fee, term, and piece of jargon you'll encounter when buying or leasing a car. Click any term for a full explanation.
        </p>

        <p className="text-sm text-muted-foreground">
          Have a dealer quote with terms you don't recognize? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and we'll explain everything.
        </p>

        <div className="space-y-8 mt-8">
          {glossaryTerms.map((term) => (
            <div key={term.slug} id={term.slug} className="scroll-mt-24">
              <h2 className="text-xl font-semibold mb-2 text-foreground">
                <Link href={`/glossary/${term.slug}`} className="hover:underline">
                  {term.term}
                </Link>
              </h2>
              <p className="text-muted-foreground mb-2">
                {term.shortDefinition}
              </p>
              <Link
                href={`/glossary/${term.slug}`}
                className="text-sm underline text-foreground/70 hover:text-foreground"
              >
                Full definition &rarr;
              </Link>
            </div>
          ))}
        </div>
      </div>

      <ArticleCta />
    </ArticleLayout>
  );
}
