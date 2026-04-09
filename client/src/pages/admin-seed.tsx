/**
 * /admin/seed — private seed-quote submission UI.
 *
 * Lets the operator paste a single dealer quote, validate it, and commit
 * it as a seeded row via the ADMIN_KEY-gated /api/admin/seed/* endpoints.
 * All the validation rules and row-tagging behavior live server-side in
 * server/services/seedService.ts so this page is a thin form + result
 * viewer only.
 *
 * This route is NOT linked from the main nav. You get to it by typing
 * /admin/seed in the URL bar, and it's gated by the same AdminShell /
 * useAdminKey hooks the other admin dashboards use.
 */

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle2, AlertCircle, FileText } from "lucide-react";

// ---------------------------------------------------------------------------
// Form shape + defaults
// ---------------------------------------------------------------------------

interface SeedFormState {
  vehicle: string;
  stateCode: string;
  zipCode: string;
  condition: "new" | "used" | "unknown";
  purchaseType: "finance" | "lease" | "cash" | "unknown";
  msrp: string;
  sellingPrice: string;
  docFee: string;
  otdPrice: string;
  dealerText: string;
  sourceId: string;
  batchId: string;
}

function todayBatchId(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `seed-${y}-${m}-${day}-manual`;
}

function emptyForm(): SeedFormState {
  return {
    vehicle: "",
    stateCode: "",
    zipCode: "",
    condition: "new",
    purchaseType: "finance",
    msrp: "",
    sellingPrice: "",
    docFee: "",
    otdPrice: "",
    dealerText: "",
    sourceId: "",
    batchId: todayBatchId(),
  };
}

// ---------------------------------------------------------------------------
// Types matching the server responses
// ---------------------------------------------------------------------------

interface ValidateResponse {
  valid: boolean;
  errors: string[];
  missingStateCode: boolean;
}

interface StateAggregateSummaryRow {
  stateCode: string;
  avgDocFee: number | null;
  count: number;
}

interface CommitResponseCommitted {
  status: "committed";
  listingId: string;
  coreListingId: string | null;
  costUsd: number;
  analysis: {
    dealScore?: string;
    verdictLabel?: string;
    goNoGo?: string;
    summary?: string;
    financialSummary?: string | null;
    primaryIssue?: string | null;
    marketComparison?: string | null;
    estimatedOverpaymentMin?: number | null;
    estimatedOverpaymentMax?: number | null;
    estimatedNormalOtdMin?: number | null;
    estimatedNormalOtdMax?: number | null;
    financialImpactConfidence?: string | null;
  };
  stateAggregateSummary: StateAggregateSummaryRow[];
}

interface CommitResponseNotCommitted {
  status: "validation_failed" | "duplicate" | "cost_capped" | "analysis_failed";
  errors?: string[];
  existingId?: string;
  projectedCostUsd?: number;
  maxCostUsd?: number;
  error?: string;
}

type CommitResponse = CommitResponseCommitted | CommitResponseNotCommitted;

interface RecentRow {
  id: string;
  seedBatchId: string | null;
  seededAt: string | null;
  stateCode: string | null;
  dealScore: string;
  verdictLabel: string;
  salePrice: string | null;
  otdPrice: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtMoney(v: number | null | undefined): string {
  if (v == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
}

function fmtRange(min: number | null | undefined, max: number | null | undefined): string {
  if (min == null || max == null) return "—";
  if (min === max) return fmtMoney(min);
  return `${fmtMoney(min)}–${fmtMoney(max)}`;
}

function toNumberOrNull(v: string): number | null {
  if (!v.trim()) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function buildPayload(form: SeedFormState) {
  return {
    reviewStatus: "approved",
    sourceId: form.sourceId || `manual-${Date.now()}`,
    vehicle: form.vehicle || undefined,
    stateCode: form.stateCode || undefined,
    zipCode: form.zipCode || undefined,
    condition: form.condition,
    purchaseType: form.purchaseType,
    msrp: toNumberOrNull(form.msrp),
    sellingPrice: toNumberOrNull(form.sellingPrice),
    docFee: toNumberOrNull(form.docFee),
    otdPrice: toNumberOrNull(form.otdPrice),
    dealerText: form.dealerText,
    batchId: form.batchId,
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminSeedPage() {
  return (
    <AdminShell>
      {(adminKey, clearKey) => <AdminSeedInner adminKey={adminKey} clearKey={clearKey} />}
    </AdminShell>
  );
}

function AdminSeedInner({ adminKey, clearKey: _clearKey }: { adminKey: string; clearKey: () => void }) {
  const [form, setForm] = useState<SeedFormState>(emptyForm);
  const [validation, setValidation] = useState<ValidateResponse | null>(null);
  const [commitResult, setCommitResult] = useState<CommitResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof SeedFormState>(k: K, v: SeedFormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  // Clear validation/result whenever any form field changes (stale state
  // from a previous submission is misleading).
  useEffect(() => {
    setValidation(null);
    setCommitResult(null);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    form.vehicle,
    form.stateCode,
    form.zipCode,
    form.condition,
    form.purchaseType,
    form.msrp,
    form.sellingPrice,
    form.docFee,
    form.otdPrice,
    form.dealerText,
  ]);

  const recentQuery = useQuery<{ rows: RecentRow[] }>({
    queryKey: ["/api/admin/seed/recent", adminKey],
    queryFn: async () => {
      const res = await fetch("/api/admin/seed/recent?limit=20", {
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    enabled: !!adminKey,
    refetchInterval: 30000,
  });

  const handleValidate = async () => {
    setError(null);
    setIsValidating(true);
    setCommitResult(null);
    try {
      const res = await fetch("/api/admin/seed/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify(buildPayload(form)),
      });
      if (!res.ok && res.status !== 400) {
        throw new Error(`Server error ${res.status}`);
      }
      const data = (await res.json()) as ValidateResponse;
      setValidation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsValidating(false);
    }
  };

  const handleCommit = async () => {
    if (!window.confirm(
      "Commit this quote as a seed row? This will call OpenAI (~$0.03), write to the database, and refresh the materialized views.",
    )) {
      return;
    }
    setError(null);
    setIsCommitting(true);
    setCommitResult(null);
    try {
      const res = await fetch("/api/admin/seed/commit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify(buildPayload(form)),
      });
      const data = (await res.json()) as CommitResponse;
      setCommitResult(data);
      if (data.status === "committed") {
        // Refetch the recent list so the operator sees their new row
        void recentQuery.refetch();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsCommitting(false);
    }
  };

  const handleReset = () => {
    setForm(emptyForm());
    setValidation(null);
    setCommitResult(null);
    setError(null);
  };

  const hasRequired = useMemo(() => {
    const hasPricing =
      form.msrp.trim() !== "" ||
      form.sellingPrice.trim() !== "" ||
      form.docFee.trim() !== "" ||
      form.otdPrice.trim() !== "";
    return form.dealerText.trim() !== "" && hasPricing && form.batchId.trim() !== "";
  }, [form]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="heading-admin-seed">
          Seed a dealer quote
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Paste a quote, validate, and commit it as a seeded row. This page is private — not linked
          from anywhere, and every request requires your admin key.
        </p>
      </div>

      {/* ─── Form ─────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Quote details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label htmlFor="dealerText">Dealer quote text *</Label>
            <Textarea
              id="dealerText"
              value={form.dealerText}
              onChange={(e) => update("dealerText", e.target.value)}
              placeholder="Paste or reconstruct the dealer's quote here — 2–6 sentences, mentioning the specific numbers (OTD, doc fee, MSRP, selling price)."
              rows={8}
              className="font-mono text-sm"
              data-testid="input-dealer-text"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vehicle">Vehicle</Label>
              <Input
                id="vehicle"
                value={form.vehicle}
                onChange={(e) => update("vehicle", e.target.value)}
                placeholder="2025 Honda CR-V Hybrid Sport Touring"
                data-testid="input-vehicle"
              />
            </div>
            <div>
              <Label htmlFor="stateCode">State code</Label>
              <Input
                id="stateCode"
                value={form.stateCode}
                onChange={(e) => update("stateCode", e.target.value.toUpperCase().slice(0, 2))}
                placeholder="NC"
                maxLength={2}
                data-testid="input-state-code"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Required to contribute to state-level marketContext. 2-letter code.
              </p>
            </div>
            <div>
              <Label htmlFor="zipCode">ZIP code</Label>
              <Input
                id="zipCode"
                value={form.zipCode}
                onChange={(e) => update("zipCode", e.target.value)}
                placeholder="28202"
                maxLength={10}
                data-testid="input-zip-code"
              />
            </div>
            <div>
              <Label htmlFor="condition">Condition</Label>
              <Select
                value={form.condition}
                onValueChange={(v) => update("condition", v as SeedFormState["condition"])}
              >
                <SelectTrigger id="condition" data-testid="select-condition">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="purchaseType">Purchase type</Label>
              <Select
                value={form.purchaseType}
                onValueChange={(v) => update("purchaseType", v as SeedFormState["purchaseType"])}
              >
                <SelectTrigger id="purchaseType" data-testid="select-purchase-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="lease">Lease</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sourceId">Source ID (optional)</Label>
              <Input
                id="sourceId"
                value={form.sourceId}
                onChange={(e) => update("sourceId", e.target.value)}
                placeholder="Auto-generated if blank"
                data-testid="input-source-id"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold">Pricing (at least one required)</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
              <div>
                <Label htmlFor="msrp" className="text-xs text-muted-foreground">MSRP</Label>
                <Input
                  id="msrp"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={form.msrp}
                  onChange={(e) => update("msrp", e.target.value)}
                  placeholder="42150"
                  data-testid="input-msrp"
                />
              </div>
              <div>
                <Label htmlFor="sellingPrice" className="text-xs text-muted-foreground">Selling price</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={form.sellingPrice}
                  onChange={(e) => update("sellingPrice", e.target.value)}
                  placeholder="39400"
                  data-testid="input-selling-price"
                />
              </div>
              <div>
                <Label htmlFor="docFee" className="text-xs text-muted-foreground">Doc fee</Label>
                <Input
                  id="docFee"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={form.docFee}
                  onChange={(e) => update("docFee", e.target.value)}
                  placeholder="800"
                  data-testid="input-doc-fee"
                />
              </div>
              <div>
                <Label htmlFor="otdPrice" className="text-xs text-muted-foreground">OTD price</Label>
                <Input
                  id="otdPrice"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={form.otdPrice}
                  onChange={(e) => update("otdPrice", e.target.value)}
                  placeholder="41500"
                  data-testid="input-otd-price"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="batchId">Batch ID</Label>
            <Input
              id="batchId"
              value={form.batchId}
              onChange={(e) => update("batchId", e.target.value)}
              placeholder="seed-2026-04-09-manual"
              data-testid="input-batch-id"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Letters, digits, hyphens, underscores. Used to group rows for traceability.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleValidate}
              disabled={!hasRequired || isValidating || isCommitting}
              data-testid="button-validate"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validating…
                </>
              ) : (
                "Validate"
              )}
            </Button>
            <Button
              type="button"
              onClick={handleCommit}
              disabled={!hasRequired || isValidating || isCommitting}
              data-testid="button-commit"
            >
              {isCommitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing & seeding…
                </>
              ) : (
                "Analyze & Seed"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleReset}
              disabled={isValidating || isCommitting}
              data-testid="button-reset"
            >
              Reset form
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5" data-testid="card-error">
          <CardContent className="pt-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* ─── Validate result ──────────────────────────────────────────── */}
      {validation && !commitResult && (
        <Card
          className={
            validation.valid
              ? "border-emerald-500/30 bg-emerald-500/5"
              : "border-destructive/30 bg-destructive/5"
          }
          data-testid="card-validation-result"
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              {validation.valid ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Validation passed
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  Validation failed
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {validation.valid ? (
              <p className="text-sm text-muted-foreground">
                Ready to commit.
                {validation.missingStateCode &&
                  " Note: no stateCode — this row will be analyzed but will NOT contribute to any state-level aggregate."}
              </p>
            ) : (
              <ul className="text-sm text-destructive list-disc list-inside space-y-1" data-testid="list-validation-errors">
                {validation.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── Commit result ────────────────────────────────────────────── */}
      {commitResult && <CommitResultPanel result={commitResult} />}

      {/* ─── Recent seeds ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4 text-muted-foreground" />
            Recently seeded ({recentQuery.data?.rows?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : recentQuery.isError ? (
            <p className="text-sm text-destructive">Failed to load recent seeds.</p>
          ) : (recentQuery.data?.rows?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">No seeded rows yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-recent-seeds">
                <thead className="text-xs text-muted-foreground uppercase tracking-wider border-b">
                  <tr>
                    <th className="text-left font-medium py-2 pr-3">When</th>
                    <th className="text-left font-medium py-2 pr-3">State</th>
                    <th className="text-left font-medium py-2 pr-3">Verdict</th>
                    <th className="text-left font-medium py-2 pr-3">Sale</th>
                    <th className="text-left font-medium py-2 pr-3">OTD</th>
                    <th className="text-left font-medium py-2 pr-3">Batch</th>
                  </tr>
                </thead>
                <tbody>
                  {recentQuery.data!.rows.map((row) => (
                    <tr key={row.id} className="border-b border-border/40 last:border-0">
                      <td className="py-2 pr-3 text-xs text-muted-foreground">
                        {row.seededAt ? new Date(row.seededAt).toLocaleString() : "—"}
                      </td>
                      <td className="py-2 pr-3 font-mono text-xs">{row.stateCode ?? "—"}</td>
                      <td className="py-2 pr-3">{row.dealScore}</td>
                      <td className="py-2 pr-3 font-mono text-xs">
                        {row.salePrice ? fmtMoney(Number(row.salePrice)) : "—"}
                      </td>
                      <td className="py-2 pr-3 font-mono text-xs">
                        {row.otdPrice ? fmtMoney(Number(row.otdPrice)) : "—"}
                      </td>
                      <td className="py-2 pr-3 font-mono text-xs text-muted-foreground">
                        {row.seedBatchId ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CommitResultPanel — inline preview of analysis + state aggregate impact
// ---------------------------------------------------------------------------

function CommitResultPanel({ result }: { result: CommitResponse }) {
  if (result.status !== "committed") {
    const label: Record<typeof result.status, string> = {
      validation_failed: "Validation failed",
      duplicate: "Already seeded (duplicate content hash)",
      cost_capped: "Aborted — cost cap exceeded",
      analysis_failed: "LLM analysis failed",
    };
    return (
      <Card className="border-destructive/30 bg-destructive/5" data-testid="card-commit-failure">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="w-4 h-4 text-destructive" />
            {label[result.status]}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-destructive space-y-1">
          {result.errors?.map((e, i) => <p key={i}>{e}</p>)}
          {result.existingId && (
            <p>Existing listing ID: <code className="text-xs">{result.existingId}</code></p>
          )}
          {result.projectedCostUsd != null && result.maxCostUsd != null && (
            <p>Projected ${result.projectedCostUsd.toFixed(3)} exceeds cap ${result.maxCostUsd.toFixed(3)}</p>
          )}
          {result.error && <p className="font-mono text-xs">{result.error}</p>}
        </CardContent>
      </Card>
    );
  }

  const r = result;
  const a = r.analysis;

  return (
    <div className="space-y-4">
      <Card className="border-emerald-500/30 bg-emerald-500/5" data-testid="card-commit-success">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            Seeded successfully
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MiniStat label="Listing ID" value={r.listingId.slice(0, 8) + "…"} mono />
            <MiniStat label="Deal score" value={a.dealScore ?? "—"} />
            <MiniStat label="Verdict" value={a.goNoGo ?? "—"} />
            <MiniStat label="Cost" value={`$${r.costUsd.toFixed(3)}`} />
          </div>
          {a.verdictLabel && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Verdict label:</span> {a.verdictLabel}
            </p>
          )}
          {a.summary && (
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Summary
              </div>
              <p className="text-sm leading-relaxed">{a.summary}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial impact preview — same fields as the live hero */}
      {(a.financialSummary || a.primaryIssue || a.marketComparison ||
        a.estimatedOverpaymentMin != null || a.estimatedNormalOtdMin != null) && (
        <Card data-testid="card-financial-impact-preview">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Financial impact preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {a.financialSummary && <p className="leading-relaxed">{a.financialSummary}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {a.primaryIssue && (
                <MiniStat label="Primary issue" value={a.primaryIssue} />
              )}
              {a.financialImpactConfidence && (
                <MiniStat label="Confidence" value={a.financialImpactConfidence} />
              )}
              {a.estimatedOverpaymentMin != null && a.estimatedOverpaymentMax != null && (
                <MiniStat
                  label="Est. overpayment"
                  value={fmtRange(a.estimatedOverpaymentMin, a.estimatedOverpaymentMax)}
                  mono
                />
              )}
              {a.estimatedNormalOtdMin != null && a.estimatedNormalOtdMax != null && (
                <MiniStat
                  label="Est. normal OTD"
                  value={fmtRange(a.estimatedNormalOtdMin, a.estimatedNormalOtdMax)}
                  mono
                />
              )}
            </div>
            {a.marketComparison && (
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Market comparison
                </div>
                <p className="leading-relaxed">{a.marketComparison}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* State aggregate summary after refresh */}
      <Card data-testid="card-state-aggregate-summary">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">State aggregates after seeding</CardTitle>
        </CardHeader>
        <CardContent>
          {r.stateAggregateSummary.length === 0 ? (
            <p className="text-sm text-muted-foreground">No state aggregate rows available yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground uppercase tracking-wider border-b">
                  <tr>
                    <th className="text-left font-medium py-2 pr-3">State</th>
                    <th className="text-left font-medium py-2 pr-3">Avg doc fee</th>
                    <th className="text-left font-medium py-2 pr-3">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {r.stateAggregateSummary.map((row) => (
                    <tr key={row.stateCode} className="border-b border-border/40 last:border-0">
                      <td className="py-2 pr-3 font-mono">{row.stateCode}</td>
                      <td className="py-2 pr-3 font-mono">{fmtMoney(row.avgDocFee)}</td>
                      <td className="py-2 pr-3 font-mono">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MiniStat({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-border/50 bg-background/60 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-sm font-medium ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}
