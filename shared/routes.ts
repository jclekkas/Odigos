export const STATIC_ROUTES: string[] = [
  "/",
  "/analyze",
  "/out-the-door-price",
  "/monthly-payment-trap",
  "/is-this-a-good-car-deal",
  "/car-dealer-fees-explained",
  "/dealer-doc-fee",
  "/dealer-pricing-tactics",
  "/dealer-wont-give-otd-price",
  "/are-dealer-add-ons-mandatory",
  "/dealer-added-fees-after-agreement",
  "/market-adjustment-fee",
  "/doc-fee-too-high",
  "/dealer-changed-price-after-deposit",
  "/finance-office-changed-the-numbers",
  "/car-dealer-fees-by-state",
  "/dealer-add-ons-list",
  "/dealer-doc-fee-by-state",
  "/car-dealer-fees-list",
  "/calculate-out-the-door-price",
  "/guides",
  "/admin/metrics",
  "/about",
  "/privacy",
  "/terms",
  "/dealer-pricing-problems",
  "/how-odigos-works",
  "/example-analysis",
  "/are-dealer-add-ons-negotiable",
  "/how-to-remove-dealer-add-ons",
  "/are-dealer-add-ons-required-by-law",
  "/dealer-add-ons-explained",
  "/what-does-out-the-door-price-include",
  "/out-the-door-price-vs-msrp",
  "/out-the-door-price-vs-monthly-payment",
  "/why-dealers-wont-give-out-the-door-price",
  "/out-the-door-price-example",
  "/are-dealer-fees-negotiable",
  "/hidden-dealer-fees",
  "/dealer-prep-fee",
  "/dealer-reconditioning-fee",
  "/how-much-should-you-pay-for-a-car",
  "/how-to-compare-car-deals",
  "/glossary",
  "/car-lease-fees-explained",
  "/money-factor-explained",
  "/residual-value-explained",
  "/legal",
  "/admin",
  "/admin/technical",
  "/admin/business",
  "/admin/experiments",
  "/admin/content",
  "/admin/users",
  "/admin/seo",
];

export const VALID_STATE_SLUGS = new Set([
  "alabama",
  "alaska",
  "arizona",
  "arkansas",
  "california",
  "colorado",
  "connecticut",
  "delaware",
  "district-of-columbia",
  "florida",
  "georgia",
  "hawaii",
  "idaho",
  "illinois",
  "indiana",
  "iowa",
  "kansas",
  "kentucky",
  "louisiana",
  "maine",
  "maryland",
  "massachusetts",
  "michigan",
  "minnesota",
  "mississippi",
  "missouri",
  "montana",
  "nebraska",
  "nevada",
  "new-hampshire",
  "new-jersey",
  "new-mexico",
  "new-york",
  "north-carolina",
  "north-dakota",
  "ohio",
  "oklahoma",
  "oregon",
  "pennsylvania",
  "rhode-island",
  "south-carolina",
  "south-dakota",
  "tennessee",
  "texas",
  "utah",
  "vermont",
  "virginia",
  "washington",
  "west-virginia",
  "wisconsin",
  "wyoming",
]);

const STATIC_ROUTES_SET = new Set(STATIC_ROUTES);

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isKnownRoute(pathname: string): boolean {
  const normalized = normalizePath(pathname);

  if (STATIC_ROUTES_SET.has(normalized)) {
    return true;
  }

  const stateMatch = normalized.match(/^\/car-dealer-fees-(.+)$/);
  if (stateMatch && VALID_STATE_SLUGS.has(stateMatch[1])) {
    return true;
  }

  if (normalized.startsWith("/glossary/") && normalized.split("/").length === 3) {
    return true;
  }

  return false;
}
