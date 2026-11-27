import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BuyerReported, VinCheck } from "@shared/buyerReported";
import { NHTSA_DOCS_URL } from "./nhtsaCopy";
import { formatCurrency } from "./utils";

function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") return url.toString();
  } catch {
    return null;
  }
  return null;
}

function moneyOrMissing(value: number | null): string {
  if (value == null) return "Not found";
  return formatCurrency(value);
}

export default function BuyerReportedCard({
  vinCheck,
  buyerReported,
}: {
  vinCheck?: VinCheck | null;
  buyerReported?: BuyerReported | null;
}) {
  const showVin = vinCheck != null && vinCheck.status !== "not_provided";
  const showBuyer = buyerReported != null && (buyerReported.comps != null || buyerReported.bookValue != null || buyerReported.competingQuote != null);
  if (!showVin && !showBuyer) return null;

  return (
    <Card className="border-border/60" data-testid="buyer-reported-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldAlert className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          VIN check and numbers you typed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm leading-relaxed">
        <p className="text-muted-foreground" data-testid="text-buyer-reported-result-note">
          Prices you type are buyer-reported. Odigos does not look them up and does not treat them as a verified market value. A VIN check only asks the free NHTSA decoder what vehicle that VIN is. It does not price the car.
        </p>

        {showVin && vinCheck && (
          <section className="space-y-2" data-testid="section-vin-check">
            <h3 className="font-medium text-foreground">VIN check</h3>
            <p data-testid="vin-check-summary">{vinCheck.summary}</p>
            {vinCheck.mismatches.length > 0 && (
              <ul className="list-disc pl-5 space-y-1" data-testid="vin-mismatch-list">
                {vinCheck.mismatches.map((mismatch) => (
                  <li key={mismatch.field} data-testid={`vin-mismatch-${mismatch.field}`}>
                    The quote says {mismatch.quoteValue} for {mismatch.field}. NHTSA decoded {mismatch.decodedValue}.
                  </li>
                ))}
              </ul>
            )}
            {vinCheck.basePrice && (
              <p data-testid="vin-base-price">
                <span className="font-medium text-foreground">{vinCheck.basePrice.label}: </span>
                {formatCurrency(vinCheck.basePrice.amount)}. {vinCheck.basePrice.detail}{" "}
                <a href={NHTSA_DOCS_URL} className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">
                  NHTSA vPIC
                </a>
                .
              </p>
            )}
            {vinCheck.provenance === "buyer-reported" && (
              <p className="text-xs text-muted-foreground">The VIN was typed by you (buyer-reported). The decode, when it succeeds, comes from NHTSA.</p>
            )}
          </section>
        )}

        {buyerReported?.comps && (
          <section className="space-y-2" data-testid="section-buyer-comps">
            <h3 className="font-medium text-foreground">Listings you entered <span className="font-normal text-muted-foreground">(buyer-reported, needs_source)</span></h3>
            <p data-testid="buyer-comps-summary">{buyerReported.comps.summary}</p>
            <ul className="list-disc pl-5 space-y-1">
              {buyerReported.comps.listings.map((listing, index) => {
                const href = safeHttpUrl(listing.url);
                return (
                  <li key={`${listing.askingPrice}-${index}`}>
                    {formatCurrency(listing.askingPrice)}
                    {listing.source ? ` from ${listing.source}` : ""}
                    {listing.mileage != null ? `, ${listing.mileage.toLocaleString("en-US")} miles` : ""}
                    {href ? (
                      <>
                        {" "}
                        <a href={href} className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">
                          link you entered
                        </a>
                      </>
                    ) : listing.url ? ` (${listing.url})` : ""}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {buyerReported?.bookValue && (
          <section className="space-y-1" data-testid="section-buyer-book">
            <h3 className="font-medium text-foreground">Book value you entered <span className="font-normal text-muted-foreground">(buyer-reported, needs_source)</span></h3>
            <p data-testid="buyer-book-summary">{buyerReported.bookValue.summary}</p>
          </section>
        )}

        {buyerReported?.competingQuote && (
          <section className="space-y-2" data-testid="section-competing-quote">
            <h3 className="font-medium text-foreground">Other dealer quote <span className="font-normal text-muted-foreground">(buyer-reported, needs_source)</span></h3>
            <p data-testid="competing-quote-summary">{buyerReported.competingQuote.summary}</p>
            {buyerReported.competingQuote.lines.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="py-1 pr-3 font-medium">Line</th>
                      <th className="py-1 pr-3 font-medium">This quote</th>
                      <th className="py-1 font-medium">Other quote</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buyerReported.competingQuote.lines.map((line) => (
                      <tr key={line.key} data-testid={`competing-line-${line.key}`} className="border-t border-border/50">
                        <td className="py-1 pr-3">{line.label}</td>
                        <td className="py-1 pr-3">{moneyOrMissing(line.thisQuote)}</td>
                        <td className="py-1">{moneyOrMissing(line.otherQuote)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </CardContent>
    </Card>
  );
}
