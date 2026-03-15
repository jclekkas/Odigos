import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import Analyze from "@/pages/home";
import OutTheDoorPrice from "@/pages/out-the-door-price";
import MonthlyPaymentTrap from "@/pages/monthly-payment-trap";
import IsThisAGoodCarDeal from "@/pages/is-this-a-good-car-deal";
import DealerWontGiveOutTheDoorPrice from "@/pages/dealer-wont-give-out-the-door-price";
import CarDealerFeesExplained from "@/pages/car-dealer-fees-explained";
import DealerDocFee from "@/pages/dealer-doc-fee";
import MandatoryDealerAddOns from "@/pages/mandatory-dealer-add-ons";
import OutTheDoorPriceCalculator from "@/pages/out-the-door-price-calculator";
import DealerPricingTactics from "@/pages/dealer-pricing-tactics";
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
import HowToAskForOutTheDoorPrice from "@/pages/how-to-ask-for-out-the-door-price";
import OtdPriceVsMsrp from "@/pages/otd-price-vs-msrp";
import OutTheDoorPriceExample from "@/pages/out-the-door-price-example";
import CarDealerFeesState from "@/pages/car-dealer-fees-state";
import ScenarioPage from "@/pages/scenario-page";
import DealerPricingProblems from "@/pages/dealer-pricing-problems";
import GuidesRedirect from "@/pages/guides-redirect";
import AdminMetrics from "@/pages/admin-metrics";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/analyze" component={Analyze} />
      <Route path="/out-the-door-price" component={OutTheDoorPrice} />
      <Route path="/monthly-payment-trap" component={MonthlyPaymentTrap} />
      <Route path="/is-this-a-good-car-deal" component={IsThisAGoodCarDeal} />
      <Route path="/dealer-wont-give-out-the-door-price" component={DealerWontGiveOutTheDoorPrice} />
      <Route path="/car-dealer-fees-explained" component={CarDealerFeesExplained} />
      <Route path="/dealer-doc-fee" component={DealerDocFee} />
      <Route path="/mandatory-dealer-add-ons" component={MandatoryDealerAddOns} />
      <Route path="/out-the-door-price-calculator" component={OutTheDoorPriceCalculator} />
      <Route path="/dealer-pricing-tactics" component={DealerPricingTactics} />
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
      <Route path="/how-to-ask-for-out-the-door-price" component={HowToAskForOutTheDoorPrice} />
      <Route path="/otd-price-vs-msrp" component={OtdPriceVsMsrp} />
      <Route path="/out-the-door-price-example" component={OutTheDoorPriceExample} />
      <Route path="/dealer-pricing-problems" component={DealerPricingProblems} />
      <Route path="/dealer-raised-price-when-i-arrived" component={ScenarioPage} />
      <Route path="/dealer-changed-price-after-test-drive" component={ScenarioPage} />
      <Route path="/dealer-added-fees-after-deposit" component={ScenarioPage} />
      <Route path="/dealer-wont-give-written-quote" component={ScenarioPage} />
      <Route path="/dealer-only-gives-monthly-payment" component={ScenarioPage} />
      <Route path="/dealer-refuses-itemized-price" component={ScenarioPage} />
      <Route path="/dealer-added-warranty-without-asking" component={ScenarioPage} />
      <Route path="/dealer-added-gap-insurance" component={ScenarioPage} />
      <Route path="/dealer-added-nitrogen-tires" component={ScenarioPage} />
      <Route path="/dealer-added-vin-etching" component={ScenarioPage} />
      <Route path="/dealer-added-protection-package" component={ScenarioPage} />
      <Route path="/dealer-changed-price-before-signing" component={ScenarioPage} />
      <Route path="/dealer-increased-interest-rate" component={ScenarioPage} />
      <Route path="/dealer-added-market-adjustment-after-deposit" component={ScenarioPage} />
      <Route path="/dealer-says-add-ons-required" component={ScenarioPage} />
      <Route path="/car-dealer-fees-:state" component={CarDealerFeesState} />
      <Route path="/guides" component={GuidesRedirect} />
      <Route path="/admin/metrics" component={AdminMetrics} />
      <Route component={NotFound} />
    </Switch>
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
