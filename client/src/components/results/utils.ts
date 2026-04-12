export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "Not specified";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyRange(min: number | null | undefined, max: number | null | undefined): string | null {
  if (min == null || max == null) return null;
  if (min === max) return formatCurrency(min);
  return `${formatCurrency(min)}–${formatCurrency(max)}`;
}
