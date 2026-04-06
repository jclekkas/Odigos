import { Link } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

interface ArticleLayoutProps {
  children: React.ReactNode;
  title: string;
  showBreadcrumbs?: boolean;
}

export default function ArticleLayout({ children, title, showBreadcrumbs = true }: ArticleLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="py-10 md:py-16 px-6">
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
          <article>
            {children}
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
