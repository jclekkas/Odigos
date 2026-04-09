import { useState, useEffect } from "react";
import { Link } from "wouter";

const STORAGE_KEY = "odigos_cookie_consent";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-sm shadow-lg"
      role="dialog"
      aria-label="Cookie consent"
      data-testid="cookie-consent-banner"
    >
      <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <p className="text-sm text-muted-foreground flex-1 leading-relaxed">
          Odigos uses cookies and local storage to remember your preferences. We don't use tracking cookies or sell your data. See our{" "}
          <Link href="/privacy" className="underline hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          {" "}and{" "}
          <Link href="/legal" className="underline hover:text-foreground transition-colors">
            Legal
          </Link>{" "}
          for details.
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-1.5 text-sm rounded-md border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
            data-testid="button-cookie-decline"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            data-testid="button-cookie-accept"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
