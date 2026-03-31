import { useLocation } from "wouter";

export type DateRange = "today" | "week" | "month" | "all";

export const RANGE_LABELS: Record<DateRange, string> = {
  today: "Today",
  week: "Last 7 Days",
  month: "Last 30 Days",
  all: "All Time",
};

export function useTimeRange(): [DateRange, (r: DateRange) => void] {
  const [location, setLocation] = useLocation();

  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const raw = params.get("range");
  const range: DateRange =
    raw === "today" || raw === "week" || raw === "month" || raw === "all"
      ? raw
      : "all";

  const setRange = (r: DateRange) => {
    const url = new URL(window.location.href);
    url.searchParams.set("range", r);
    setLocation(url.pathname + url.search, { replace: true });
  };

  return [range, setRange];
}

export function TimeRangeSelector({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (r: DateRange) => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      {(Object.keys(RANGE_LABELS) as DateRange[]).map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          data-testid={`range-${r}`}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            value === r
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {RANGE_LABELS[r]}
        </button>
      ))}
    </div>
  );
}
