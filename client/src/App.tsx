import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import Privacy from "@/pages/privacy";
import DealerPricingProblems from "@/pages/dealer-pricing-problems";
import HowOdigosWorks from "@/pages/how-odigos-works";
import ExampleAnalysis from "@/pages/example-analysis";
import AreDealerAddOnsNegotiable from "@/pages/are-dealer-add-ons-negotiable";
import HowToRemoveDealerAddOns from "@/pages/how-to-remove-dealer-add-ons";
import AreDealerAddOnsRequiredByLaw from "@/pages/are-dealer-add-ons-required-by-law";
import DealerAddOnsExplained from "@/pages/dealer-add-ons-explained";
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
      <Route path="/privacy" component={Privacy} />
      <Route path="/dealer-pricing-problems" component={DealerPricingProblems} />
      <Route path="/how-odigos-works" component={HowOdigosWorks} />
      <Route path="/example-analysis" component={ExampleAnalysis} />
      <Route path="/are-dealer-add-ons-negotiable" component={AreDealerAddOnsNegotiable} />
      <Route path="/how-to-remove-dealer-add-ons" component={HowToRemoveDealerAddOns} />
      <Route path="/are-dealer-add-ons-required-by-law" component={AreDealerAddOnsRequiredByLaw} />
      <Route path="/dealer-add-ons-explained" component={DealerAddOnsExplained} />
      <Route component={NotFound} />
    </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
