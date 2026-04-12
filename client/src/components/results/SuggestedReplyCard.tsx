import { useState } from "react";
import { MessageSquare, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface SuggestedReplyCardProps {
  reply: string;
}

export default function SuggestedReplyCard({ reply }: SuggestedReplyCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="w-5 h-5 text-muted-foreground" />
          Suggested Reply to Dealer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/30 rounded-lg p-4 mb-4">
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{reply}</p>
        </div>
        <Button
          variant="default"
          onClick={handleCopy}
          className="w-full"
          data-testid="button-copy-reply"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Reply
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
