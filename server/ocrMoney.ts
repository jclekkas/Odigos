/**
 * Normalize common OCR / paste damage in dealer quotes before dollar parsing.
 *
 * - `$28,00O` (letter O) becomes `$28,000`
 * - `S3,500` (letter S standing in for $) becomes `$3,500`
 * - `$ 28,000` and `$28, 000` collapse to `$28,000`
 *
 * A percentage such as `7.75%` is not given a dollar sign.
 */

export function normalizeOcrMoney(text: string): string {
  let normalized = text.replace(/[\u00a0\u2007\u202f]/g, " ");
  normalized = normalized.replace(
    /(^|[\s:(])S(\d{1,3}(?:,\d{3})+(?:\.\d{2})?)/g,
    "$1$$$2",
  );
  normalized = normalized.replace(/\$\s+(?=[0-9Oo])/g, "$");
  normalized = normalized.replace(/\$(\d{1,3}),\s+(\d{3})\b/g, "$$$1,$2");
  normalized = normalized.replace(/\$((?:[0-9]|[Oo]|,)+)/g, (_match, token: string) => {
    if (!/[Oo]/.test(token) || !/\d/.test(token)) return `$${token}`;
    return `$${token.replace(/[Oo]/g, "0")}`;
  });
  return normalized;
}

/**
 * A label on one line and its dollar amount on the next is one charge.
 * Lines that already contain a dollar are left as printed.
 */
export function stitchWrappedAmounts(text: string): string {
  const lines = text.split(/\r?\n/);
  const stitched: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const next = lines[i + 1];
    const labelOnly = !/\$\d/.test(lines[i]) && /[A-Za-z]/.test(lines[i]);
    const amountOnly = next != null && /^\s*\$\d[\d,]*(?:\.\d{2})?\s*$/.test(next);
    if (labelOnly && amountOnly) {
      stitched.push(`${lines[i].trim()} ${next.trim()}`);
      i += 1;
      continue;
    }
    stitched.push(lines[i]);
  }
  return stitched.join("\n");
}
