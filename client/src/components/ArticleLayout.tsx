import { Link } from "wouter";
import logoImage from "@assets/odigos_logo.png";

interface ArticleLayoutProps {
  children: React.ReactNode;
}

export default function ArticleLayout({ children }: ArticleLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center">
          <Link href="/">
            <img
              src={logoImage}
              alt="Odigos"
              className="h-8 md:h-9 w-auto cursor-pointer"
              data-testid="link-logo-home"
            />
          </Link>
        </div>
      </header>
      <main className="py-12 md:py-20 px-6">
        <article className="max-w-2xl mx-auto">
          {children}
        </article>
      </main>
    </div>
  );
}
