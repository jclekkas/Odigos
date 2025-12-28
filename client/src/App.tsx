import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import Analyze from "@/pages/home";
import OutTheDoorPrice from "@/pages/out-the-door-price";
import MonthlyPaymentTrap from "@/pages/monthly-payment-trap";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/analyze" component={Analyze} />
      <Route path="/out-the-door-price" component={OutTheDoorPrice} />
      <Route path="/monthly-payment-trap" component={MonthlyPaymentTrap} />
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
