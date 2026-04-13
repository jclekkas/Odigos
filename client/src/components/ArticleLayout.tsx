import { Link, useLocation } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FadeIn from "@/components/FadeIn";
import { breadcrumbListSchema } from "@/lib/jsonld";

interface ArticleLayoutProps {
  children: React.ReactNode;
  title: string;
  showBreadcrumbs?: boolean;
}

export default function ArticleLayout({ children, title, showBreadcrumbs = true }: ArticleLayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      {showBreadcrumbs && title && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbListSchema([
            { name: "Guides", path: "/dealer-pricing-problems" },
            { name: title, path: location },
          ]))}
        </script>
      )}
      <main className="py-12 md:py-20 px-6">
        <div className="max-w-[700px] mx-auto">
          {showBreadcrumbs && title && (
            <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb" data-testid="nav-breadcrumbs">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <span className="mx-1.5">/</span>
              <Link href="/dealer-pricing-problems" className="hover:text-foreground transition-colors">Dealer Pricing Problems</Link>
              <span className="mx-1.5">/</span>
              <span className="text-foreground/70">{title}</span>
            </nav>
          )}
          <FadeIn>
            <article>
              {children}
            </article>
          </FadeIn>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
