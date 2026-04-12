import { useState } from "react";
import { HelpCircle, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { MissingInfo, ConfidenceLevel } from "@shared/schema";

export interface MissingInfoCardProps {
  items: MissingInfo[];
  confidenceLevel: ConfidenceLevel;
  verdictLabel: string;
  onCopy: () => void;
}

export default function MissingInfoCard({ items, confidenceLevel, verdictLabel, onCopy }: MissingInfoCardProps) {
  const [copied, setCopied] = useState(false);

  const isProceedVerdict = verdictLabel.includes("PROCEED");
  const displayItems = isProceedVerdict ? items.slice(0, 3) : items;

  const handleCopy = () => {
    const questions = displayItems.map((item) => item.question).join("\n\n");
    navigator.clipboard.writeText(questions);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy();
  };

  if (displayItems.length === 0 || confidenceLevel === "HIGH") return null;

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-amber-700 dark:text-amber-400">
          <HelpCircle className="w-5 h-5" />
          {isProceedVerdict ? "Confirm These Details" : "Missing Information"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {isProceedVerdict
            ? "Before you visit, quickly confirm these points:"
            : "Ask the dealer these questions to get the full picture:"}
        </p>
        <ul className="space-y-3 mb-4">
          {displayItems.map((item, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center justify-center">
                {idx + 1}
              </span>
              <div>
                <p className="text-sm font-medium">{item.field}</p>
                <p className="text-sm text-muted-foreground">{item.question}</p>
              </div>
            </li>
          ))}
        </ul>
        {items.length > displayItems.length && (
          <p className="text-xs text-muted-foreground mb-3">
            + {items.length - displayItems.length} more questions available in full analysis
          </p>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="w-full"
          data-testid="button-copy-questions"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Questions to Send to Dealer
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
