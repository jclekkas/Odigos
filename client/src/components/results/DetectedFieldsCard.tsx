import { FileText, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DetectedFields } from "@shared/schema";
import { formatCurrency } from "./utils";

export interface DetectedFieldsCardProps {
  fields: DetectedFields;
}

export default function DetectedFieldsCard({ fields }: DetectedFieldsCardProps) {
  const items = [
    { label: "Sale Price", value: fields.salePrice, format: formatCurrency },
    { label: "MSRP", value: fields.msrp, format: formatCurrency },
    { label: "Rebates/Incentives", value: fields.rebates, format: formatCurrency },
    { label: "Out-the-Door Price", value: fields.outTheDoorPrice, format: formatCurrency },
    { label: "Monthly Payment", value: fields.monthlyPayment, format: formatCurrency },
    { label: "Trade-In Value", value: fields.tradeInValue, format: formatCurrency },
    { label: "APR", value: fields.apr, format: (v: number | null) => v != null ? `${v}%` : "Not specified" },
    { label: "Term", value: fields.termMonths, format: (v: number | null) => v != null ? `${v} months` : "Not specified" },
    { label: "Down Payment", value: fields.downPayment, format: formatCurrency },
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5 text-muted-foreground" />
          What We Detected
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className={`text-sm font-medium font-mono ${item.value != null ? "text-foreground" : "text-muted-foreground/60"}`}>
                {item.format(item.value)}
              </span>
            </div>
          ))}
        </div>

        {fields.fees && fields.fees.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              Itemized Fees
            </h4>
            <div className="space-y-2">
              {fields.fees.map((fee, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 bg-muted/30 rounded-md px-3">
                  <span className="text-sm">{fee.name}</span>
                  <span className="text-sm font-mono font-medium">
                    {fee.amount != null ? formatCurrency(fee.amount) : "Amount unclear"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
