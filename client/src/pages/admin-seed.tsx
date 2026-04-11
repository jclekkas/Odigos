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

import { useEffect, useMemo, useRef, useState } from "react";
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
import { Loader2, CheckCircle2, AlertCircle, FileText, Sparkles, RotateCcw } from "lucide-react";

// ---------------------------------------------------------------------------
// Friction-reducing helpers
// ---------------------------------------------------------------------------

/**
 * Best-effort regex extraction of pricing fields from dealer prose. Good
 * enough for ~80% of quotes; the user can override any field manually.
 * Runs on the client — no cost, no latency, non-destructive (only fills
 * fields that are still empty).
 *
 * Pattern strategy:
 *  - NUMBER fragment is strict: `42,150` or `42150` or `42150.00`, never
 *    captures a trailing comma (which would pollute neighbouring labels).
 *  - Each field tries "number-first" patterns first (e.g. "$800 doc fee")
 *    then falls back to permissive "label-first" patterns with `[^\d$]{0,N}`
 *    filler so phrases like "doc fee is only $129" still match.
 */
// NUMBER: a dollar amount like 42,150 / 42150 / 42150.00; never trailing comma.
const NUM = "(\\d{1,3}(?:,\\d{3})+(?:\\.\\d{2})?|\\d+(?:\\.\\d{2})?)";

function extractPricingFromText(text: string): {
  msrp?: number;
  sellingPrice?: number;
  docFee?: number;
  otdPrice?: number;
} {
  const result: { msrp?: number; sellingPrice?: number; docFee?: number; otdPrice?: number } = {};

  const firstMatch = (patterns: RegExp[]): number | undefined => {
    for (const re of patterns) {
      const m = text.match(re);
      if (m && m[1]) {
        const cleaned = m[1].replace(/,/g, "").replace(/\.00?$/, "");
        const n = parseInt(cleaned, 10);
        if (Number.isFinite(n) && n > 0 && n < 1_000_000) return n;
      }
    }
    return undefined;
  };

  // MSRP / sticker / list price — label before OR after the number
  result.msrp = firstMatch([
    new RegExp(`MSRP[^\\d$]{0,30}\\$?\\s*${NUM}`, "i"),
    new RegExp(`\\$?\\s*${NUM}\\s+MSRP`, "i"),
    new RegExp(`(?:sticker|list)\\s*price[^\\d$]{0,30}\\$?\\s*${NUM}`, "i"),
  ]);

  // Selling / sale price — label before or after the number; "price" is
  // optional ("Selling $37,505" should still match).
  result.sellingPrice = firstMatch([
    new RegExp(`(?:selling|sale)\\s*price[^\\d$]{0,30}\\$?\\s*${NUM}`, "i"),
    new RegExp(`(?:selling|sale)\\s+\\$?\\s*${NUM}`, "i"),
    new RegExp(`(?:sell|sold)(?:ing)?\\s*(?:at|for)[^\\d$]{0,30}\\$?\\s*${NUM}`, "i"),
    new RegExp(`\\$?\\s*${NUM}\\s+(?:selling|sale)\\s*price`, "i"),
  ]);

  // Doc / documentation / processing fee — "number first" tried before
  // "label first" so "$800 doc fee and $100 DMV" correctly captures 800
  // rather than skipping to the next number after the label.
  result.docFee = firstMatch([
    new RegExp(`\\$?\\s*${NUM}\\s+doc[\\w\\/]*\\s*(?:fee|fees|charge|charges)`, "i"),
    new RegExp(`\\$?\\s*${NUM}\\s+documentation\\s*(?:fee|fees|charge)`, "i"),
    new RegExp(`\\$?\\s*${NUM}\\s+processing\\s*(?:fee|fees|charge)`, "i"),
    new RegExp(`doc[\\w\\/]*\\s*(?:fee|fees|charge|charges)[^\\d$]{0,30}\\$?\\s*${NUM}`, "i"),
    new RegExp(`documentation\\s*(?:fee|charge)[^\\d$]{0,30}\\$?\\s*${NUM}`, "i"),
    new RegExp(`processing\\s*(?:fee|fees|charge)[^\\d$]{0,30}\\$?\\s*${NUM}`, "i"),
  ]);

  // Out-the-door / OTD — label before or after the number. The label-first
  // fallback uses [^$\d]{0,50} for its filler so it can't accidentally
  // latch onto a vehicle year like "2025" that sits between the label
  // and the actual price (see fixture cases involving
  // "out-the-door on the 2025 Explorer…"). It also requires an explicit
  // $ before the number to avoid false positives.
  result.otdPrice = firstMatch([
    new RegExp(`\\$?\\s*${NUM}\\s+(?:out[- ]the[- ]door|OTD\\b)`, "i"),
    new RegExp(`(?:out[- ]the[- ]door|OTD)\\b[^$\\d]{0,50}\\$\\s*${NUM}`, "i"),
    new RegExp(`OTD\\s*(?:price|total)[^$\\d]{0,30}\\$\\s*${NUM}`, "i"),
  ]);

  return result;
}

/**
 * Generate a human-readable sourceId from the vehicle + state + a short
 * random suffix. Falls back to "manual-<ts>" if there's no vehicle.
 */
function generateSourceId(vehicle: string | undefined, stateCode: string | undefined): string {
  const vehicleSlug = (vehicle ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const stateSlug = (stateCode ?? "").toLowerCase();
  const suffix = Math.random().toString(36).slice(2, 6);
  const parts = [vehicleSlug || "manual", stateSlug, suffix].filter(Boolean);
  return parts.join("-");
}

// ---------------------------------------------------------------------------
// sessionStorage draft persistence — scoped to the tab, cleared on success
// ---------------------------------------------------------------------------

const DRAFT_STORAGE_KEY = "odigos_admin_seed_draft_v1";

function readDraft(): Partial<SeedFormState> | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed != null ? parsed : null;
  } catch {
    return null;
  }
}

function writeDraft(form: SeedFormState): void {
  try {
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(form));
  } catch {
    // Quota exceeded or storage disabled — silently drop.
  }
}

function clearDraft(): void {
  try {
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

function draftIsMeaningful(draft: Partial<SeedFormState> | null): boolean {
  if (!draft) return false;
  return !!(
    draft.dealerText?.trim() ||
    draft.vehicle?.trim() ||
    draft.stateCode?.trim() ||
    draft.msrp?.trim() ||
    draft.sellingPrice?.trim() ||
    draft.docFee?.trim() ||
    draft.otdPrice?.trim()
  );
}

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
    sourceId: form.sourceId || generateSourceId(form.vehicle, form.stateCode),
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
  // Restore any session-persisted draft on mount so accidental refreshes
  // don't wipe the operator's work. The draft is cleared on successful
  // commit and on explicit Reset. sessionStorage is per-tab — closing the
  // tab clears it automatically.
  const [form, setForm] = useState<SeedFormState>(() => {
    const draft = readDraft();
    if (draftIsMeaningful(draft)) {
      return { ...emptyForm(), ...draft } as SeedFormState;
    }
    return emptyForm();
  });
  const [draftWasRestored, setDraftWasRestored] = useState<boolean>(() =>
    draftIsMeaningful(readDraft()),
  );
  const [validation, setValidation] = useState<ValidateResponse | null>(null);
  const [commitResult, setCommitResult] = useState<CommitResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Tracks which pricing fields were auto-filled by extractPricingFromText
  // so we can show a subtle "Auto-filled" hint. Never used to block edits.
  const [autoFilled, setAutoFilled] = useState<{
    msrp: boolean;
    sellingPrice: boolean;
    docFee: boolean;
    otdPrice: boolean;
  }>({ msrp: false, sellingPrice: false, docFee: false, otdPrice: false });

  const update = <K extends keyof SeedFormState>(k: K, v: SeedFormState[K]) => {
    // Any manual edit to a pricing field clears its auto-filled flag.
    if (k === "msrp" || k === "sellingPrice" || k === "docFee" || k === "otdPrice") {
      setAutoFilled((prev) => ({ ...prev, [k]: false }));
    }
    setForm((prev) => ({ ...prev, [k]: v }));
  };

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

  // Persist the form to sessionStorage on every change (debounced 300ms).
  useEffect(() => {
    const t = setTimeout(() => {
      if (draftIsMeaningful(form)) {
        writeDraft(form);
      } else {
        clearDraft();
      }
    }, 300);
    return () => clearTimeout(t);
  }, [form]);

  // Auto-extract pricing from the dealer text (debounced 500ms).
  // Non-destructive: only fills fields that are currently empty. The user
  // can always override by typing into a pricing field, which both
  // clears the auto-filled flag and suppresses further re-extraction for
  // that field.
  useEffect(() => {
    const text = form.dealerText;
    if (!text || text.length < 20) return;
    const t = setTimeout(() => {
      const extracted = extractPricingFromText(text);
      setForm((prev) => {
        const next = { ...prev };
        const nextAuto = { ...autoFilled };
        if (!prev.msrp && extracted.msrp != null) {
          next.msrp = String(extracted.msrp);
          nextAuto.msrp = true;
        }
        if (!prev.sellingPrice && extracted.sellingPrice != null) {
          next.sellingPrice = String(extracted.sellingPrice);
          nextAuto.sellingPrice = true;
        }
        if (!prev.docFee && extracted.docFee != null) {
          next.docFee = String(extracted.docFee);
          nextAuto.docFee = true;
        }
        if (!prev.otdPrice && extracted.otdPrice != null) {
          next.otdPrice = String(extracted.otdPrice);
          nextAuto.otdPrice = true;
        }
        setAutoFilled(nextAuto);
        return next;
      });
    }, 500);
    return () => clearTimeout(t);
    // autoFilled is intentionally omitted — we read it inside the updater
    // but don't want to re-run the effect when it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.dealerText]);

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
        // Successful commit — clear the saved draft so we don't
        // accidentally re-submit the same quote on next visit.
        clearDraft();
        setDraftWasRestored(false);
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
    setAutoFilled({ msrp: false, sellingPrice: false, docFee: false, otdPrice: false });
    clearDraft();
    setDraftWasRestored(false);
  };

  const handleSeedAnother = () => {
    handleReset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasRequired = useMemo(() => {
    const hasPricing =
      form.msrp.trim() !== "" ||
      form.sellingPrice.trim() !== "" ||
      form.docFee.trim() !== "" ||
      form.otdPrice.trim() !== "";
    return form.dealerText.trim() !== "" && hasPricing && form.batchId.trim() !== "";
  }, [form]);

  // Cmd/Ctrl+Enter anywhere on the page triggers Analyze & Seed. We route
  // through a ref so the keydown handler doesn't re-register on every
  // keystroke (which would be noisy) while still capturing the latest
  // handleCommit + hasRequired values.
  const commitRef = useRef<() => void>(() => {});
  commitRef.current = () => {
    if (hasRequired && !isCommitting && !isValidating) {
      void handleCommit();
    }
  };
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        commitRef.current();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="heading-admin-seed">
          Seed a dealer quote
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Paste a quote — pricing auto-extracts from the text. Use{" "}
          <kbd className="px-1 py-0.5 text-xs font-mono bg-muted rounded border border-border/60">
            ⌘ Enter
          </kbd>{" "}
          to submit. Drafts are saved per-tab and restored on refresh.
        </p>
      </div>

      {draftWasRestored && (
        <div
          className="flex items-center justify-between gap-3 rounded-md border border-blue-500/30 bg-blue-500/5 px-3 py-2 text-sm"
          data-testid="banner-draft-restored"
        >
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <RotateCcw className="w-4 h-4" />
            <span>Restored an in-progress draft from this session.</span>
          </div>
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              handleReset();
              setDraftWasRestored(false);
            }}
            data-testid="button-discard-draft"
          >
            Discard and start over
          </button>
        </div>
      )}

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
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Pricing (at least one required)</Label>
              {(autoFilled.msrp || autoFilled.sellingPrice || autoFilled.docFee || autoFilled.otdPrice) && (
                <span
                  className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400"
                  data-testid="hint-autofilled"
                >
                  <Sparkles className="w-3 h-3" />
                  Auto-filled from text — verify or override
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
              <div>
                <Label htmlFor="msrp" className="text-xs text-muted-foreground flex items-center gap-1">
                  MSRP
                  {autoFilled.msrp && <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" aria-label="auto-filled" />}
                </Label>
                <Input
                  id="msrp"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={form.msrp}
                  onChange={(e) => update("msrp", e.target.value)}
                  placeholder="42150"
                  className={autoFilled.msrp ? "border-emerald-500/40" : undefined}
                  data-testid="input-msrp"
                />
              </div>
              <div>
                <Label htmlFor="sellingPrice" className="text-xs text-muted-foreground flex items-center gap-1">
                  Selling price
                  {autoFilled.sellingPrice && <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" aria-label="auto-filled" />}
                </Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={form.sellingPrice}
                  onChange={(e) => update("sellingPrice", e.target.value)}
                  placeholder="39400"
                  className={autoFilled.sellingPrice ? "border-emerald-500/40" : undefined}
                  data-testid="input-selling-price"
                />
              </div>
              <div>
                <Label htmlFor="docFee" className="text-xs text-muted-foreground flex items-center gap-1">
                  Doc fee
                  {autoFilled.docFee && <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" aria-label="auto-filled" />}
                </Label>
                <Input
                  id="docFee"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={form.docFee}
                  onChange={(e) => update("docFee", e.target.value)}
                  placeholder="800"
                  className={autoFilled.docFee ? "border-emerald-500/40" : undefined}
                  data-testid="input-doc-fee"
                />
              </div>
              <div>
                <Label htmlFor="otdPrice" className="text-xs text-muted-foreground flex items-center gap-1">
                  OTD price
                  {autoFilled.otdPrice && <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" aria-label="auto-filled" />}
                </Label>
                <Input
                  id="otdPrice"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={form.otdPrice}
                  onChange={(e) => update("otdPrice", e.target.value)}
                  placeholder="41500"
                  className={autoFilled.otdPrice ? "border-emerald-500/40" : undefined}
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
            <span className="text-xs text-muted-foreground self-center ml-auto hidden sm:inline">
              <kbd className="px-1 py-0.5 font-mono bg-muted rounded border border-border/60">⌘</kbd>
              {" + "}
              <kbd className="px-1 py-0.5 font-mono bg-muted rounded border border-border/60">Enter</kbd>
              {" to submit"}
            </span>
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
      {commitResult && (
        <CommitResultPanel result={commitResult} onSeedAnother={handleSeedAnother} />
      )}

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

function CommitResultPanel({
  result,
  onSeedAnother,
}: {
  result: CommitResponse;
  onSeedAnother: () => void;
}) {
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
          <CardTitle className="flex items-center justify-between gap-2 text-base text-emerald-700 dark:text-emerald-400">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Seeded successfully
            </span>
            <Button
              type="button"
              size="sm"
              onClick={onSeedAnother}
              data-testid="button-seed-another"
            >
              Seed another quote
            </Button>
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
