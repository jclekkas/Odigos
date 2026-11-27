/**
 * One wording of a doc-fee assessment for every output surface.
 * Legal accusations are emitted only when the assessment classification is illegal.
 */

export interface SurfaceAssessment {
  classification: string;
  chargedAmount: number | null;
  hardCeiling: number | null;
  conditionalCeiling: number | null;
  exceedsStoredCap: boolean;
  jurisdiction: string;
  statutoryReference: string;
  summary: string;
}

export interface SurfaceCapCheck {
  violated: boolean;
  capAmount: number;
  chargedAmount: number;
  overage: number;
  statuteCitation: string | null;
}

export interface SurfaceSignal {
  priority: number;
  category: "legal" | "info_gap";
  label: string;
  detail: string;
  action: string;
  severity: "critical" | "warning";
}

export interface SurfaceCallout {
  tone: "violation" | "unverified" | "conditional";
  title: string;
  body: string;
  action: string;
}

export interface DocFeeSurfaceCopy {
  capCheck: SurfaceCapCheck | null;
  signal: SurfaceSignal | null;
  callout: SurfaceCallout | null;
  scorecardLine: string | null;
  /** Market-intelligence sentence. Present only for a verified illegal finding. */
  marketMessage: string | null;
}

function money(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return Number.isInteger(rounded) ? `$${rounded}` : `$${rounded.toFixed(2)}`;
}

function ceilingOf(assessment: SurfaceAssessment): number | null {
  if (assessment.hardCeiling != null) return assessment.hardCeiling;
  return assessment.conditionalCeiling;
}

function citationOf(assessment: SurfaceAssessment): string | null {
  if (!assessment.statutoryReference || assessment.statutoryReference === "needs_source") return null;
  return assessment.statutoryReference;
}

export function docFeeSurfaceCopy(assessment: SurfaceAssessment): DocFeeSurfaceCopy {
  const charged = assessment.chargedAmount;
  const ceiling = ceilingOf(assessment);
  const citation = citationOf(assessment);

  if (assessment.classification === "illegal" && charged != null && ceiling != null) {
    const overage = Math.round((charged - ceiling) * 100) / 100;
    const cite = citation ? ` per ${citation}` : "";
    const action = `Your doc fee of ${money(charged)} exceeds the legal cap of ${money(ceiling)} in ${assessment.jurisdiction}${cite}. Please reduce it to ${money(ceiling)} or below.`;
    return {
      capCheck: {
        violated: true,
        capAmount: ceiling,
        chargedAmount: charged,
        overage,
        statuteCitation: citation,
      },
      signal: {
        priority: 1,
        category: "legal",
        label: "Doc fee exceeds state cap",
        detail: assessment.summary,
        action,
        severity: "critical",
      },
      callout: {
        tone: "violation",
        title: "State fee cap exceeded",
        body: assessment.summary,
        action,
      },
      scorecardLine: assessment.summary,
      marketMessage: "Doc fee exceeds the legal state cap.",
    };
  }

  if (assessment.classification === "needs_source" && assessment.exceedsStoredCap && charged != null) {
    const action =
      `Ask the dealer to itemize the ${money(charged)} documentation fee. The stored cap could not be verified, so this is not a cap violation.`;
    return {
      capCheck: null,
      signal: {
        priority: 3,
        category: "info_gap",
        label: "Doc fee is high and the cap could not be verified",
        detail: assessment.summary,
        action,
        severity: "warning",
      },
      callout: {
        tone: "unverified",
        title: "Documentation fee needs a source",
        body: assessment.summary,
        action,
      },
      scorecardLine: assessment.summary,
      marketMessage: null,
    };
  }

  if (assessment.classification === "potentially_noncompliant" && charged != null) {
    const action = `${assessment.summary} Please confirm the statutory condition in writing.`;
    return {
      capCheck:
        ceiling == null
          ? null
          : {
              violated: false,
              capAmount: ceiling,
              chargedAmount: charged,
              overage: 0,
              statuteCitation: citation,
            },
      signal: {
        priority: 3,
        category: "info_gap",
        label: "Conditional documentation fee",
        detail: assessment.summary,
        action,
        severity: "warning",
      },
      callout: {
        tone: "conditional",
        title: "Documentation fee depends on a condition",
        body: assessment.summary,
        action,
      },
      scorecardLine: assessment.summary,
      marketMessage: null,
    };
  }

  if (
    (assessment.classification === "permissible" || assessment.classification === "potentially_noncompliant") &&
    charged != null &&
    ceiling != null
  ) {
    return {
      capCheck: {
        violated: false,
        capAmount: ceiling,
        chargedAmount: charged,
        overage: 0,
        statuteCitation: citation,
      },
      signal: null,
      callout: null,
      scorecardLine: null,
      marketMessage: null,
    };
  }

  return {
    capCheck: null,
    signal: null,
    callout: null,
    scorecardLine: null,
    marketMessage: null,
  };
}
