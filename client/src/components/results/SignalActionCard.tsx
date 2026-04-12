import { useState } from "react";
import { AlertTriangle, Info, ShieldAlert, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { RankedSignal } from "@shared/schema";

interface SignalActionCardProps {
  signals: RankedSignal[];
  maxVisible?: number;
}

const severityConfig = {
  critical: {
    icon: ShieldAlert,
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    iconColor: "text-red-600 dark:text-red-400",
    badgeBg: "bg-red-500/15",
    badgeBorder: "border-red-500/30",
    badgeText: "text-red-700 dark:text-red-400",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    iconColor: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-500/15",
    badgeBorder: "border-amber-500/30",
    badgeText: "text-amber-700 dark:text-amber-400",
  },
  info: {
    icon: Info,
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    iconColor: "text-blue-600 dark:text-blue-400",
    badgeBg: "bg-blue-500/15",
    badgeBorder: "border-blue-500/30",
    badgeText: "text-blue-700 dark:text-blue-400",
  },
};

function SignalRow({ signal }: { signal: RankedSignal }) {
  const [copied, setCopied] = useState(false);
  const config = severityConfig[signal.severity];
  const Icon = config.icon;

  const handleCopy = () => {
    navigator.clipboard.writeText(signal.action).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className={`rounded-lg border ${config.border} ${config.bg} p-4 space-y-2`}
      data-testid={`signal-row-${signal.category}`}
    >
      <div className="flex items-start gap-2">
        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.iconColor}`} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-snug">
            {signal.label}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-1">
            {signal.detail}
          </p>
        </div>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${config.badgeBg} ${config.badgeBorder} ${config.badgeText} shrink-0`}
        >
          {signal.severity}
        </span>
      </div>
      <div className="flex items-center gap-2 pl-6">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">What to do:</span>
        <p className="text-sm text-foreground flex-1">{signal.action}</p>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 h-7 px-2"
          onClick={handleCopy}
          data-testid={`signal-copy-${signal.category}`}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}

export default function SignalActionCard({ signals, maxVisible = 3 }: SignalActionCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (signals.length === 0) return null;

  const visible = expanded ? signals : signals.slice(0, maxVisible);
  const hasMore = signals.length > maxVisible;

  return (
    <Card className="border-border/60" data-testid="signal-action-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4" aria-hidden="true" />
          What to negotiate
          <span className="text-xs font-normal normal-case tracking-normal">
            ({signals.length} signal{signals.length !== 1 ? "s" : ""})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {visible.map((signal, idx) => (
          <SignalRow key={`${signal.category}-${idx}`} signal={signal} />
        ))}
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() => setExpanded(!expanded)}
            data-testid="signal-show-more"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Show fewer
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Show {signals.length - maxVisible} more
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
