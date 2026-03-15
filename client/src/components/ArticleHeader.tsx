import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/odigos_logo.png";

export default function ArticleHeader() {
  return (
    <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-3">
        <Link href="/">
          <img src={logoImage} alt="Odigos" className="h-24 w-auto cursor-pointer" data-testid="link-logo-home" />
        </Link>
        <div className="flex flex-col items-end gap-1">
          <Link href="/analyze">
            <Button size="sm" data-testid="button-header-cta">
              Check My Deal
            </Button>
          </Link>
          <span className="text-xs text-muted-foreground">Takes 10 seconds · No signup required</span>
        </div>
      </div>
    </header>
  );
}
