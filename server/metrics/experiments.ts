import { loadMetrics } from "./events";

export interface ExperimentVariantStats {
  variant: string;
  assignments: number;
  conversions: number;
  conversionRate: number;
}

export interface ExperimentStats {
  experimentId: string;
  variants: ExperimentVariantStats[];
  winner: string | null;
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
      };
    });

    let winner: string | null = null;
    if (variantStats.length >= 2) {
      const sorted = [...variantStats].sort((a, b) => b.conversionRate - a.conversionRate);
      if (sorted[0].conversionRate > sorted[1].conversionRate) {
        winner = sorted[0].variant;
      }
    }

    return {
      experimentId,
      variants: variantStats,
      winner,
    };
  });
}
