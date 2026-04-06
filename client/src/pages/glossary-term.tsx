import { useEffect } from "react";
import { Link, useParams, Redirect } from "wouter";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";
import { glossaryTerms } from "@/data/glossary-terms";

export default function GlossaryTerm() {
  const { slug } = useParams<{ slug: string }>();
  const term = glossaryTerms.find((t) => t.slug === slug);

  useEffect(() => {
    if (term) {
      setSeoMeta({
        title: term.seoTitle,
        description: term.seoDescription,
        path: `/glossary/${term.slug}`,
      });
    }
  }, [term]);

  if (!term) {
    return <Redirect to="/glossary" />;
  }

  return (
    <ArticleLayout title={term.term}>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "DefinedTerm",
          "name": term.term,
          "description": term.shortDefinition,
          "url": `https://odigosauto.com/glossary/${term.slug}`,
          "inDefinedTermSet": {
            "@type": "DefinedTermSet",
            "name": "Car Buying Glossary",
            "url": "https://odigosauto.com/glossary",
          },
        })}</script>
      </Helmet>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-glossary-term-headline">
        {term.term}
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-4 font-medium">
          {term.shortDefinition}
        </p>

        <div className="mt-8 mb-8">
          <p className="text-muted-foreground leading-relaxed">
            {term.fullDefinition}
          </p>
        </div>

        {term.relatedPages.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Related Guides</h2>
            <ul className="space-y-2">
              {term.relatedPages.map((page) => (
                <li key={page.path} className="flex items-start gap-2 text-muted-foreground">
                  <span className="mt-1.5 shrink-0">•</span>
                  <Link href={page.path} className="underline text-foreground hover:text-foreground/80">
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10">
          <p className="text-sm text-muted-foreground">
            <Link href="/glossary" className="underline text-foreground/70 hover:text-foreground">&larr; Back to glossary</Link>
          </p>
        </div>
      </div>

      <ArticleCta />
    </ArticleLayout>
  );
}
