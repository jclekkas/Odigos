import { ExternalLink } from "lucide-react";
import { extractDomain } from "@/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface SourceCitationProps {
  sources: string[];
  lastVerified?: string;
  className?: string;
}

function formatVerifiedDate(raw: string): string {
  const [year, month] = raw.split("-");
  if (!year || !month) return raw;
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

export default function SourceCitation({
  sources,
  lastVerified,
  className = "",
}: SourceCitationProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <span className={`inline-flex items-center gap-1 flex-wrap ${className}`}>
      {sources.map((url) => (
        <Tooltip key={url}>
          <TooltipTrigger asChild>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 rounded-sm bg-muted/60 hover:bg-muted px-1.5 py-0.5 text-[11px] leading-none text-muted-foreground no-underline transition-colors align-middle"
              aria-label={`Source: ${extractDomain(url)} (opens in new tab)`}
            >
              <ExternalLink className="h-2.5 w-2.5 shrink-0" />
              {extractDomain(url)}
            </a>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="text-xs break-all">{url}</p>
            {lastVerified && (
              <p className="text-xs text-muted-foreground mt-1">
                Last verified: {formatVerifiedDate(lastVerified)}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      ))}
    </span>
  );
}
