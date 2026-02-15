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
import DealerWontGiveOtd from "@/pages/dealer-wont-give-otd";
import CarDealerFeesExplained from "@/pages/car-dealer-fees-explained";
import DealerDocFee from "@/pages/dealer-doc-fee";
import MandatoryDealerAddOns from "@/pages/mandatory-dealer-add-ons";
import OutTheDoorPriceCalculator from "@/pages/out-the-door-price-calculator";
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
      <Route path="/dealer-wont-give-otd" component={DealerWontGiveOtd} />
      <Route path="/car-dealer-fees-explained" component={CarDealerFeesExplained} />
      <Route path="/dealer-doc-fee" component={DealerDocFee} />
      <Route path="/mandatory-dealer-add-ons" component={MandatoryDealerAddOns} />
      <Route path="/out-the-door-price-calculator" component={OutTheDoorPriceCalculator} />
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
