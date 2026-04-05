/**
 * Centralized source registry for article pages.
 * Each key corresponds to the page's route slug (e.g. "/car-dealer-fees-explained").
 * Used by the SourceCitation component to render inline citation badges.
 */
export const ARTICLE_SOURCES: Record<
  string,
  { sources: string[]; lastVerified: string }
> = {
  "car-dealer-fees-explained": {
    sources: [
      "https://consumer.ftc.gov/articles/buying-new-car",
      "https://www.edmunds.com/car-buying/what-fees-should-you-pay-at-a-car-dealership.html",
    ],
    lastVerified: "2026-03",
  },
  "car-dealer-fees-list": {
    sources: ["https://consumer.ftc.gov/articles/buying-new-car"],
    lastVerified: "2026-03",
  },
  "dealer-doc-fee": {
    sources: [
      "https://www.edmunds.com/car-buying/what-fees-should-you-pay-at-a-car-dealership.html",
      "https://www.kbb.com/car-advice/",
      "https://consumer.ftc.gov/articles/buying-new-car",
    ],
    lastVerified: "2026-03",
  },
  "doc-fee-too-high": {
    sources: [
      "https://www.ftc.gov/business-guidance/resources/dealers-guide-federal-requirement-used-car-rule",
    ],
    lastVerified: "2026-03",
  },
  "out-the-door-price": {
    sources: [
      "https://consumer.ftc.gov/articles/buying-new-car",
      "https://www.edmunds.com/car-buying/what-fees-should-you-pay-at-a-car-dealership.html",
      "https://www.kbb.com/car-advice/",
    ],
    lastVerified: "2026-03",
  },
  "out-the-door-price-calculator": {
    sources: ["https://consumer.ftc.gov/articles/buying-new-car"],
    lastVerified: "2026-03",
  },
  "calculate-out-the-door-price": {
    sources: ["https://consumer.ftc.gov/articles/buying-new-car"],
    lastVerified: "2026-03",
  },
  "are-dealer-add-ons-mandatory": {
    sources: ["https://consumer.ftc.gov/articles/buying-new-car"],
    lastVerified: "2026-03",
  },
  "are-dealer-add-ons-required-by-law": {
    sources: ["https://consumer.ftc.gov/articles/buying-new-car"],
    lastVerified: "2026-03",
  },
  "mandatory-dealer-add-ons": {
    sources: [
      "https://consumer.ftc.gov/articles/buying-new-car",
      "https://www.edmunds.com/car-buying/what-fees-should-you-pay-at-a-car-dealership.html",
      "https://www.kbb.com/car-advice/",
    ],
    lastVerified: "2026-03",
  },
  "dealer-add-ons-list": {
    sources: ["https://consumer.ftc.gov/articles/buying-new-car"],
    lastVerified: "2026-03",
  },
  "market-adjustment-fee": {
    sources: [
      "https://www.edmunds.com/car-buying/dealer-markups-and-addendum-stickers.html",
    ],
    lastVerified: "2026-03",
  },
  "dealer-pricing-tactics": {
    sources: [
      "https://www.edmunds.com/car-buying/what-fees-should-you-pay-at-a-car-dealership.html",
      "https://consumer.ftc.gov/articles/buying-new-car",
    ],
    lastVerified: "2026-03",
  },
  "dealer-wont-give-otd-price": {
    sources: [
      "https://consumer.ftc.gov/articles/buying-new-car",
      "https://www.edmunds.com/car-buying/what-fees-should-you-pay-at-a-car-dealership.html",
      "https://www.kbb.com/car-advice/",
    ],
    lastVerified: "2026-03",
  },
  "dealer-wont-give-otd": {
    sources: ["https://consumer.ftc.gov/articles/buying-new-car"],
    lastVerified: "2026-03",
  },
  "dealer-added-fees-after-agreement": {
    sources: ["https://consumer.ftc.gov/articles/buying-new-car"],
    lastVerified: "2026-03",
  },
  "dealer-changed-price-after-deposit": {
    sources: [
      "https://www.ftc.gov/legal-library/browse/rules/motor-vehicle-dealers-trade-regulation-rule-combating-auto-retail-scams-cars-rule",
    ],
    lastVerified: "2026-03",
  },
  "finance-office-changed-the-numbers": {
    sources: ["https://www.ftc.gov/cars"],
    lastVerified: "2026-03",
  },
  "what-is-a-fair-price-for-a-car": {
    sources: [
      "https://www.kbb.com/car-values/",
      "https://www.edmunds.com/car-buying/what-fees-should-you-pay-at-a-car-dealership.html",
      "https://www.cargurus.com/Cars/new/nl-New-Cars-d0",
      "https://consumer.ftc.gov/articles/buying-new-car",
    ],
    lastVerified: "2026-03",
  },
  "monthly-payment-trap": {
    sources: [
      "https://www.edmunds.com/car-buying/what-fees-should-you-pay-at-a-car-dealership.html",
    ],
    lastVerified: "2026-03",
  },
};
