import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface BiggestIssueCardProps {
  primaryIssue: string | null | undefined;
}

export default function BiggestIssueCard({ primaryIssue }: BiggestIssueCardProps) {
  // Only render when the LLM actually surfaced a primary issue. We do NOT
  // fall back to verdictLabel here — that field is a verdict statement
  // ("GO — TERMS LOOK CLEAN"), not an issue description.
  const issue = primaryIssue?.trim();
  if (!issue) return null;

  return (
    <Card className="border-amber-500/30 bg-amber-500/5" data-testid="biggest-issue-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          Biggest issue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold leading-snug text-foreground" data-testid="biggest-issue-text">
          {issue}
        </p>
      </CardContent>
    </Card>
  );
}
