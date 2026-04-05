/**
 * Per-cluster Open Graph images for social sharing and SERP differentiation.
 *
 * To add a cluster-specific OG image:
 * 1. Create a 1200x630 PNG in client/public/ (e.g., og-otd-cluster.png)
 * 2. Add the mapping here
 * 3. Pages in that cluster will automatically use the image via setSeoMeta
 *
 * Pages without a cluster match fall back to the default og-image.png.
 */

const CANONICAL_ORIGIN = "https://odigosauto.com";

interface OgImageConfig {
  url: string;
  alt: string;
}

const CLUSTER_OG_IMAGES: Record<string, OgImageConfig> = {
  otd: {
    url: `${CANONICAL_ORIGIN}/og-otd-cluster.png`,
    alt: "Odigos — Out-the-Door Price Guide",
  },
  "state-fees": {
    url: `${CANONICAL_ORIGIN}/og-state-fees-cluster.png`,
    alt: "Odigos — Car Dealer Fees by State",
  },
  "dealer-tactics": {
    url: `${CANONICAL_ORIGIN}/og-dealer-tactics-cluster.png`,
    alt: "Odigos — Dealer Pricing Tactics Guide",
  },
  "add-ons": {
    url: `${CANONICAL_ORIGIN}/og-add-ons-cluster.png`,
    alt: "Odigos — Dealer Add-Ons Guide",
  },
};

const PATH_TO_CLUSTER: Record<string, string> = {
  "/out-the-door-price": "otd",
  "/out-the-door-price-calculator": "otd",
  "/calculate-out-the-door-price": "otd",
  "/what-does-out-the-door-price-include": "otd",
  "/out-the-door-price-vs-msrp": "otd",
  "/out-the-door-price-vs-monthly-payment": "otd",
  "/out-the-door-price-example": "otd",
  "/monthly-payment-trap": "otd",
  "/dealer-wont-give-otd-price": "otd",
  "/why-dealers-wont-give-out-the-door-price": "otd",

  "/car-dealer-fees-explained": "state-fees",
  "/car-dealer-fees-list": "state-fees",
  "/car-dealer-fees-by-state": "state-fees",
  "/dealer-doc-fee": "state-fees",
  "/dealer-doc-fee-by-state": "state-fees",
  "/what-is-a-dealer-doc-fee": "state-fees",
  "/doc-fee-too-high": "state-fees",
  "/are-dealer-fees-negotiable": "state-fees",
  "/hidden-dealer-fees": "state-fees",
  "/market-adjustment-fee": "state-fees",
  "/dealer-prep-fee": "state-fees",
  "/dealer-reconditioning-fee": "state-fees",

  "/dealer-pricing-tactics": "dealer-tactics",
  "/dealer-pricing-problems": "dealer-tactics",
  "/dealer-added-fees-after-agreement": "dealer-tactics",
  "/dealer-changed-price-after-deposit": "dealer-tactics",
  "/finance-office-changed-the-numbers": "dealer-tactics",

  "/are-dealer-add-ons-mandatory": "add-ons",
  "/are-dealer-add-ons-negotiable": "add-ons",
  "/are-dealer-add-ons-required-by-law": "add-ons",
  "/how-to-remove-dealer-add-ons": "add-ons",
  "/dealer-add-ons-explained": "add-ons",
  "/dealer-add-ons-list": "add-ons",
};

/**
 * Get the OG image config for a given path.
 * State fee pages (car-dealer-fees-*) are matched by prefix.
 * Returns undefined if no cluster-specific image exists.
 */
export function getClusterOgImage(path: string): OgImageConfig | undefined {
  // Check static path map first
  const cluster = PATH_TO_CLUSTER[path];
  if (cluster) return CLUSTER_OG_IMAGES[cluster];

  // Match state fee pages by prefix
  if (path.startsWith("/car-dealer-fees-")) return CLUSTER_OG_IMAGES["state-fees"];

  return undefined;
}
