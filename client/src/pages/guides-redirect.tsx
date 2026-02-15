import { useEffect } from "react";
import { useLocation } from "wouter";

export default function GuidesRedirect() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/dealer-pricing-tactics", { replace: true });
  }, [setLocation]);

  return null;
}
