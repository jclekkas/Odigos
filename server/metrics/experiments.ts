import { loadMetrics } from "./events";

export interface ExperimentVariantStats {
  variant: string;
  assignments: number;
  conversions: number;
  conversionRate: number;
  pValue: number | null;
  isSignificant: boolean;
}

export interface ExperimentStats {
  experimentId: string;
  variants: ExperimentVariantStats[];
  winner: string | null;
}

function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422820 * Math.exp(-0.5 * z * z);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302744))));
  return z > 0 ? 1 - p : p;
}

function zTestTwoProportions(n1: number, c1: number, n2: number, c2: number): number | null {
  if (n1 < 1 || n2 < 1) return null;
  const p1 = c1 / n1;
  const p2 = c2 / n2;
  const pooled = (c1 + c2) / (n1 + n2);
  const denom = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));
  if (denom === 0) return null;
  const z = Math.abs(p1 - p2) / denom;
  return 2 * (1 - normalCDF(z));
}

export async function getExperimentStats(): Promise<ExperimentStats[]> {
  const { events } = await loadMetrics();

  const assignments = events.filter((e) => e.eventType === "experiment_assigned");
  const conversions = events.filter((e) => e.eventType === "experiment_converted");

  const experimentIds = Array.from(
    new Set(assignments.map((e) => e.metadata?.experimentId as string).filter(Boolean))
  );

  return experimentIds.map((experimentId) => {
    const expAssignments = assignments.filter(
      (e) => e.metadata?.experimentId === experimentId
    );

    const variantIds = Array.from(
      new Set(expAssignments.map((e) => e.metadata?.variant as string).filter(Boolean))
    );

    const variantStats: ExperimentVariantStats[] = variantIds.map((variant) => {
      const variantAssignments = expAssignments.filter(
        (e) => e.metadata?.variant === variant
      );

      const variantConversions = conversions.filter((e) => {
        const exps = e.metadata?.experiments as Record<string, string> | undefined;
        return exps && exps[experimentId] === variant;
      });

      const assignmentCount = variantAssignments.length;
      const conversionCount = variantConversions.length;
      const conversionRate = assignmentCount > 0
        ? (conversionCount / assignmentCount) * 100
        : 0;

      return {
        variant,
        assignments: assignmentCount,
        conversions: conversionCount,
        conversionRate,
        pValue: null,
        isSignificant: false,
      };
    });

    const controlVariant = variantStats.find(v => v.variant === "control") ?? variantStats[0];

    const variantsWithSignificance = variantStats.map(v => {
      if (!controlVariant || v.variant === controlVariant.variant) {
        return { ...v, pValue: null, isSignificant: false };
      }
      const pValue = zTestTwoProportions(
        controlVariant.assignments, controlVariant.conversions,
        v.assignments, v.conversions,
      );
      return { ...v, pValue, isSignificant: pValue !== null && pValue < 0.05 };
    });

    let winner: string | null = null;
    if (variantsWithSignificance.length >= 2) {
      const sorted = [...variantsWithSignificance].sort((a, b) => b.conversionRate - a.conversionRate);
      if (sorted[0].conversionRate > sorted[1].conversionRate) {
        winner = sorted[0].variant;
      }
    }

    return {
      experimentId,
      variants: variantsWithSignificance,
      winner,
    };
  });
}
