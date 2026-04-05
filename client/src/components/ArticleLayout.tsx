import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { breadcrumbListSchema } from "@/lib/jsonld";

interface ArticleLayoutProps {
  children: React.ReactNode;
  title: string;
  showBreadcrumbs?: boolean;
  breadcrumbPath?: string;
}

export default function ArticleLayout({ children, title, showBreadcrumbs = true, breadcrumbPath }: ArticleLayoutProps) {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Dealer Pricing Problems", url: "/dealer-pricing-problems" },
    ...(breadcrumbPath ? [{ name: title, url: breadcrumbPath }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="py-12 md:py-20 px-6">
        <div className="max-w-[700px] mx-auto">
          {showBreadcrumbs && title && (
            <>
              <Helmet>
                <script type="application/ld+json">{JSON.stringify(breadcrumbListSchema(breadcrumbItems))}</script>
              </Helmet>
              <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb" data-testid="nav-breadcrumbs">
                <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                <span className="mx-1.5">/</span>
                <Link href="/dealer-pricing-problems" className="hover:text-foreground transition-colors">Dealer Pricing Problems</Link>
                <span className="mx-1.5">/</span>
                <span className="text-foreground/70">{title}</span>
              </nav>
            </>
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
