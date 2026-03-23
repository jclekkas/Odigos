import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useWebVitals } from "@/hooks/use-web-vitals";
import Landing from "@/pages/landing";
import Analyze from "@/pages/home";
import OutTheDoorPrice from "@/pages/out-the-door-price";
import MonthlyPaymentTrap from "@/pages/monthly-payment-trap";
import IsThisAGoodCarDeal from "@/pages/is-this-a-good-car-deal";
import DealerWontGiveOtd from "@/pages/dealer-wont-give-otd";
import CarDealerFeesExplained from "@/pages/car-dealer-fees-explained";
import DealerDocFee from "@/pages/dealer-doc-fee";
import MandatoryDealerAddOns from "@/pages/mandatory-dealer-add-ons";
import OutTheDoorPriceCalculator from "@/pages/out-the-door-price-calculator";
import DealerPricingTactics from "@/pages/dealer-pricing-tactics";
import DealerWontGiveOtdPrice from "@/pages/dealer-wont-give-otd-price";
import AreDealerAddOnsMandatory from "@/pages/are-dealer-add-ons-mandatory";
import DealerAddedFeesAfterAgreement from "@/pages/dealer-added-fees-after-agreement";
import MarketAdjustmentFee from "@/pages/market-adjustment-fee";
import DocFeeTooHigh from "@/pages/doc-fee-too-high";
import DealerChangedPriceAfterDeposit from "@/pages/dealer-changed-price-after-deposit";
import FinanceOfficeChangedTheNumbers from "@/pages/finance-office-changed-the-numbers";
import CarDealerFeesByState from "@/pages/car-dealer-fees-by-state";
import DealerAddOnsList from "@/pages/dealer-add-ons-list";
import DealerDocFeeByState from "@/pages/dealer-doc-fee-by-state";
import CarDealerFeesList from "@/pages/car-dealer-fees-list";
import CalculateOutTheDoorPrice from "@/pages/calculate-out-the-door-price";
import GuidesRedirect from "@/pages/guides-redirect";
import AdminMetrics from "@/pages/admin-metrics";
import AdminTechnical from "@/pages/admin-technical";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import About from "@/pages/about";
import DealerPricingProblems from "@/pages/dealer-pricing-problems";
import HowOdigosWorks from "@/pages/how-odigos-works";
import ExampleAnalysis from "@/pages/example-analysis";
import AreDealerAddOnsNegotiable from "@/pages/are-dealer-add-ons-negotiable";
import HowToRemoveDealerAddOns from "@/pages/how-to-remove-dealer-add-ons";
import AreDealerAddOnsRequiredByLaw from "@/pages/are-dealer-add-ons-required-by-law";
import DealerAddOnsExplained from "@/pages/dealer-add-ons-explained";
import WhatDoesOutTheDoorPriceInclude from "@/pages/what-does-out-the-door-price-include";
import OutTheDoorPriceVsMsrp from "@/pages/out-the-door-price-vs-msrp";
import OutTheDoorPriceVsMonthlyPayment from "@/pages/out-the-door-price-vs-monthly-payment";
import WhyDealersWontGiveOutTheDoorPrice from "@/pages/why-dealers-wont-give-out-the-door-price";
import OutTheDoorPriceExample from "@/pages/out-the-door-price-example";
import WhatIsADealerDocFee from "@/pages/what-is-a-dealer-doc-fee";
import AreDealerFeesNegotiable from "@/pages/are-dealer-fees-negotiable";
import HiddenDealerFees from "@/pages/hidden-dealer-fees";
import DealerPrepFee from "@/pages/dealer-prep-fee";
import DealerReconditioningFee from "@/pages/dealer-reconditioning-fee";
import HowToTellIfACarDealIsGood from "@/pages/how-to-tell-if-a-car-deal-is-good";
import WhatIsAFairPriceForACar from "@/pages/what-is-a-fair-price-for-a-car";
import HowMuchShouldYouPayForACar from "@/pages/how-much-should-you-pay-for-a-car";
import HowToCompareCarDeals from "@/pages/how-to-compare-car-deals";
import BestWayToCheckIfACarDealIsGood from "@/pages/best-way-to-check-if-a-car-deal-is-good";
import CarDealerFeesState from "@/pages/car-dealer-fees-state";
import NotFound from "@/pages/not-found";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
      <Route path="/" component={Landing} />
      <Route path="/analyze" component={Analyze} />
      <Route path="/out-the-door-price" component={OutTheDoorPrice} />
      <Route path="/monthly-payment-trap" component={MonthlyPaymentTrap} />
      <Route path="/is-this-a-good-car-deal" component={IsThisAGoodCarDeal} />
      <Route path="/dealer-wont-give-otd" component={DealerWontGiveOtd} />
      <Route path="/car-dealer-fees-explained" component={CarDealerFeesExplained} />
      <Route path="/dealer-doc-fee" component={DealerDocFee} />
      <Route path="/mandatory-dealer-add-ons" component={MandatoryDealerAddOns} />
      <Route path="/out-the-door-price-calculator" component={OutTheDoorPriceCalculator} />
      <Route path="/dealer-pricing-tactics" component={DealerPricingTactics} />
      <Route path="/dealer-wont-give-otd-price" component={DealerWontGiveOtdPrice} />
      <Route path="/are-dealer-add-ons-mandatory" component={AreDealerAddOnsMandatory} />
      <Route path="/dealer-added-fees-after-agreement" component={DealerAddedFeesAfterAgreement} />
      <Route path="/market-adjustment-fee" component={MarketAdjustmentFee} />
      <Route path="/doc-fee-too-high" component={DocFeeTooHigh} />
      <Route path="/dealer-changed-price-after-deposit" component={DealerChangedPriceAfterDeposit} />
      <Route path="/finance-office-changed-the-numbers" component={FinanceOfficeChangedTheNumbers} />
      <Route path="/car-dealer-fees-by-state" component={CarDealerFeesByState} />
      <Route path="/dealer-add-ons-list" component={DealerAddOnsList} />
      <Route path="/dealer-doc-fee-by-state" component={DealerDocFeeByState} />
      <Route path="/car-dealer-fees-list" component={CarDealerFeesList} />
      <Route path="/calculate-out-the-door-price" component={CalculateOutTheDoorPrice} />
      <Route path="/guides" component={GuidesRedirect} />
      <Route path="/admin/metrics" component={AdminMetrics} />
      <Route path="/admin/technical" component={AdminTechnical} />
      <Route path="/about" component={About} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/dealer-pricing-problems" component={DealerPricingProblems} />
      <Route path="/how-odigos-works" component={HowOdigosWorks} />
      <Route path="/example-analysis" component={ExampleAnalysis} />
      <Route path="/are-dealer-add-ons-negotiable" component={AreDealerAddOnsNegotiable} />
      <Route path="/how-to-remove-dealer-add-ons" component={HowToRemoveDealerAddOns} />
      <Route path="/are-dealer-add-ons-required-by-law" component={AreDealerAddOnsRequiredByLaw} />
      <Route path="/dealer-add-ons-explained" component={DealerAddOnsExplained} />
      <Route path="/what-does-out-the-door-price-include" component={WhatDoesOutTheDoorPriceInclude} />
      <Route path="/out-the-door-price-vs-msrp" component={OutTheDoorPriceVsMsrp} />
      <Route path="/out-the-door-price-vs-monthly-payment" component={OutTheDoorPriceVsMonthlyPayment} />
      <Route path="/why-dealers-wont-give-out-the-door-price" component={WhyDealersWontGiveOutTheDoorPrice} />
      <Route path="/out-the-door-price-example" component={OutTheDoorPriceExample} />
      <Route path="/what-is-a-dealer-doc-fee" component={WhatIsADealerDocFee} />
      <Route path="/are-dealer-fees-negotiable" component={AreDealerFeesNegotiable} />
      <Route path="/hidden-dealer-fees" component={HiddenDealerFees} />
      <Route path="/dealer-prep-fee" component={DealerPrepFee} />
      <Route path="/dealer-reconditioning-fee" component={DealerReconditioningFee} />
      <Route path="/how-to-tell-if-a-car-deal-is-good" component={HowToTellIfACarDealIsGood} />
      <Route path="/what-is-a-fair-price-for-a-car" component={WhatIsAFairPriceForACar} />
      <Route path="/how-much-should-you-pay-for-a-car" component={HowMuchShouldYouPayForACar} />
      <Route path="/how-to-compare-car-deals" component={HowToCompareCarDeals} />
      <Route path="/best-way-to-check-if-a-car-deal-is-good" component={BestWayToCheckIfACarDealIsGood} />
      <Route path={/^\/car-dealer-fees-.+/} component={CarDealerFeesState} />
      <Route component={NotFound} />
    </Switch>
    </>
  );
}

function VitalsTracker() {
  useWebVitals();
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <VitalsTracker />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
