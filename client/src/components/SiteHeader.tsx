import { Link } from "wouter";

interface SiteHeaderProps {
  maxWidth?: string;
}

export default function SiteHeader({ maxWidth = "max-w-4xl" }: SiteHeaderProps) {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded">
        Skip to main content
      </a>
      <div className={`${maxWidth} mx-auto px-6 py-5 flex items-center justify-between`}>
        <Link href="/">
          <span
            className="text-[22px] md:text-[26px] font-semibold tracking-[0.04em] text-foreground cursor-pointer select-none"
            style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
            data-testid="link-logo-home"
          >
            Odigos
          </span>
        </Link>
        <nav>
          <Link href="/analyze">
            <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              Analyze a Deal
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
