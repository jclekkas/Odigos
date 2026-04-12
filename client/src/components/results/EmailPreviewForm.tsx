import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { track } from "@/lib/tracking";
import type { AnalysisResponse } from "@shared/schema";

type AnalysisResponseWithExtras = AnalysisResponse & {
  listingId?: string;
};

export type EmailPreviewStatus = "idle" | "success" | "error";

export interface EmailPreviewFormProps {
  analysisResult: AnalysisResponseWithExtras;
}

export default function EmailPreviewForm({ analysisResult }: EmailPreviewFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<EmailPreviewStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const emailMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await apiRequest("POST", "/api/email-preview", {
          email,
          analysisResult: {
            goNoGo: analysisResult.goNoGo,
            verdictLabel: analysisResult.verdictLabel,
            confidenceLevel: analysisResult.confidenceLevel,
            missingInfo: analysisResult.missingInfo.slice(0, 3),
            detectedFields: analysisResult.detectedFields,
            summary: analysisResult.summary,
          },
        });
        return response.json();
      } catch (err) {
        if (err instanceof Error) {
          const match = err.message.match(/^\d+: ([\s\S]+)$/);
          if (match) {
            try {
              const parsed = JSON.parse(match[1]) as { message?: string };
              throw new Error(parsed.message ?? "Could not send the email. Please try again.");
            } catch (parseErr) {
              if (parseErr instanceof Error && parseErr !== err) throw parseErr;
            }
          }
        }
        throw new Error("Could not send the email. Please try again.");
      }
    },
    onSuccess: () => {
      setStatus("success");
    },
    onError: (err) => {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    },
  });

  const handleSend = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid email address");
      setStatus("error");
      return;
    }
    setStatus("idle");
    setErrorMessage(null);
    setEmail(email.trim());
    track("email_capture_submitted");
    emailMutation.mutate();
  };

  if (status === "success") {
    return (
      <div
        className="border border-border/40 rounded-xl px-4 py-3 bg-muted/10 flex items-center gap-2"
        data-testid="email-preview-success"
      >
        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
        <p className="text-sm text-muted-foreground">Check your inbox — we sent your analysis</p>
      </div>
    );
  }

  return (
    <div
      className="border border-border/40 rounded-xl px-4 py-3 bg-muted/10 space-y-2"
      data-testid="email-preview-form"
    >
      <p className="text-sm font-medium text-foreground">Want a copy of this analysis?</p>
      <p className="text-xs text-muted-foreground">Send it to your email so you can review it later</p>
      <div className="flex gap-2 items-start">
        <div className="flex-1 min-w-0">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") {
                setStatus("idle");
                setErrorMessage(null);
              }
            }}
            disabled={emailMutation.isPending}
            className="text-sm h-9"
            data-testid="input-email-preview"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 h-9"
          disabled={emailMutation.isPending || !email.trim()}
          onClick={handleSend}
          data-testid="button-send-email-preview"
        >
          {emailMutation.isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              Sending…
            </>
          ) : (
            "Email me this analysis"
          )}
        </Button>
      </div>
      {status === "error" && errorMessage && (
        <p className="text-xs text-destructive" data-testid="email-preview-error">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
