import { describe, expect, it } from "vitest";
import { applyRuleEngine, checkDocFeeCap } from "../../server/ruleEngine.js";
import { rankSignals } from "../../server/signalRanker.js";
import { classifyDocFee } from "../../server/regulatoryClassification.js";
import { getStateFeeData } from "../../server/stateFeeLookup.js";
import { findStatutoryThresholdGaps, listPassedThresholds } from "../../server/statutoryThresholds.js";
import { docFeeSurfaceCopy } from "../../shared/docFeeSurfaceCopy.js";
import type { AnalysisResponse, DetectedFields, Fee } from "../../shared/schema.js";

const FORBIDDEN = /\billegal\b|exceeds the legal cap|over the legal limit/i;

const llm = {
  dealScore: "GREEN",
  confidenceLevel: "MEDIUM",
  verdictLabel: "PROCEED",
  goNoGo: "GO",
  summary: "fixture",
  detectedFields: {} as DetectedFields,
  missingInfo: [],
  suggestedReply: "fixture",
  reasoning: "fixture",
} as AnalysisResponse;

function fields(partial: Partial<DetectedFields>): DetectedFields {
  return {
    salePrice: null,
    msrp: null,
    rebates: null,
    fees: [],
    outTheDoorPrice: null,
    monthlyPayment: null,
    tradeInValue: null,
    apr: null,
    termMonths: null,
    downPayment: null,
    ...partial,
  };
}

function surfaces(input: {
  state: string;
  fee: number;
  salePrice?: number | null;
  asOf?: string;
  feeName?: string;
}) {
  const stateData = getStateFeeData(input.state)!;
  const salePrice = input.salePrice === undefined ? 28000 : input.salePrice;
  const parsed = fields({
    salePrice,
    outTheDoorPrice: salePrice == null ? null : salePrice + input.fee + 1000,
    fees: [
      { name: input.feeName ?? "doc fee", amount: input.fee },
      { name: "sales tax", amount: 1000 },
    ] as Fee[],
    apr: 4.9,
    termMonths: 60,
  });
  const asOf = input.asOf ?? "2026-11-27";
  const engine = applyRuleEngine(llm, parsed, null, "cash", null, { stateData, asOf });
  const assessment = engine.docFeeAssessment!;
  const copy = docFeeSurfaceCopy(assessment);
  const signals = rankSignals({
    docFeeAssessment: assessment,
    detectedFields: parsed,
    marketContext: null,
    ruleEngineResult: engine,
    leaseMath: null,
    missingInfo: [],
  });
  const cap = checkDocFeeCap(parsed.fees, stateData, {
    asOf,
    vehicleCashPrice: salePrice,
  });
  const publicResult = {
    goNoGo: engine.goNoGo,
    verdictLabel: engine.verdictLabel,
    summary: engine.summary,
    primaryIssue: engine.primaryIssue,
    suggestedReply: engine.suggestedReply,
    reasoning: engine.reasoning,
    dimensions: engine.dimensions,
    docFeeAssessment: assessment,
    docFeeCapCheck: cap,
    rankedSignals: signals,
    scorecardIssues: [engine.verdictLabel, copy.scorecardLine].filter(Boolean),
  };
  const texts = [
    engine.verdictLabel,
    engine.summary,
    engine.primaryIssue,
    engine.suggestedReply,
    engine.reasoning,
    engine.dimensions?.regulatoryCompliance.summary,
    copy.callout?.title,
    copy.callout?.body,
    copy.callout?.action,
    copy.scorecardLine,
    copy.marketMessage,
    ...signals.flatMap((signal) => [signal.label, signal.detail, signal.action]),
    JSON.stringify(publicResult),
  ].filter((text): text is string => typeof text === "string");
  return { engine, assessment, copy, signals, cap, publicResult, texts };
}

describe("one regulatory result on every surface", () => {
  it("does not call an Illinois $500 doc fee or a West Virginia fee over the stored ceiling a legal violation", () => {
    for (const input of [
      { state: "IL", fee: 500 },
      { state: "WV", fee: 700 },
    ]) {
      const result = surfaces(input);
      expect(result.assessment.classification, input.state).toBe("needs_source");
      expect(result.assessment.exceedsStoredCap, input.state).toBe(true);
      expect(result.engine.goNoGo, input.state).not.toBe("NO-GO");
      expect(result.cap, input.state).toBeNull();
      expect(result.publicResult.docFeeCapCheck, input.state).toBeNull();
      expect(result.signals.some((signal) => signal.severity === "critical"), input.state).toBe(false);
      expect(result.assessment.summary, input.state).toMatch(/high/i);
      expect(result.assessment.summary, input.state).toMatch(/could not be verified/i);
      for (const text of result.texts) {
        expect(text, `${input.state}: ${text}`).not.toMatch(FORBIDDEN);
      }
      for (const text of [
        result.engine.primaryIssue,
        result.engine.suggestedReply,
        result.engine.dimensions?.regulatoryCompliance.summary,
        result.copy.callout?.body,
        result.copy.scorecardLine,
        result.signals.find((signal) => signal.detail === result.assessment.summary)?.detail,
      ]) {
        expect(text, input.state).toContain(result.assessment.summary);
      }
      expect(JSON.stringify(result.publicResult)).toContain(result.assessment.summary);
      expect(result.publicResult.docFeeAssessment.classification).toBe(result.assessment.classification);
    }
  });

  it("keeps verified California, New York, and Michigan violations as NO-GO with the same legal wording", () => {
    const cases = [
      surfaces({ state: "CA", fee: 199 }),
      surfaces({ state: "NY", fee: 176 }),
      surfaces({ state: "MI", fee: 250, salePrice: 4000 }),
    ];
    for (const result of cases) {
      expect(result.assessment.classification, result.assessment.jurisdiction).toBe("illegal");
      expect(result.engine.goNoGo, result.assessment.jurisdiction).toBe("NO-GO");
      expect(result.engine.verdictLabel).toMatch(/DOC FEE EXCEEDS/);
      expect(result.cap?.violated).toBe(true);
      expect(result.signals[0]?.severity).toBe("critical");
      expect(result.signals[0]?.category).toBe("legal");
      expect(result.texts.some((text) => /exceeds the legal cap/i.test(text))).toBe(true);
      expect(result.engine.suggestedReply).toContain(result.assessment.summary);
      expect(result.copy.callout?.body).toBe(result.assessment.summary);
      expect(result.copy.scorecardLine).toBe(result.assessment.summary);
      expect(result.signals[0]?.detail).toBe(result.assessment.summary);
      expect(result.publicResult.docFeeCapCheck?.violated).toBe(true);
      expect(result.publicResult.docFeeAssessment.summary).toBe(result.assessment.summary);
    }
    expect(cases[2].assessment.summary).toMatch(/5%/);
    expect(cases[2].assessment.hardCeiling).toBe(200);
  });
});

describe("date-aware Ohio and Pennsylvania ceilings", () => {
  const oh = getStateFeeData("OH")!;
  const pa = getStateFeeData("PA")!;

  it("uses Ohio's $398 ceiling in 2026 and $412 from January 1, 2027, with the 10% limb", () => {
    const in2026 = classifyDocFee([{ name: "doc fee", amount: 399 }], oh, null, null, { asOf: "2026-06-01", vehicleCashPrice: 32000 });
    expect(in2026.classification).toBe("illegal");
    expect(in2026.summary).toMatch(/\$398/);
    expect(in2026.effectiveDate).toBe("2026-01-01/2026-12-31");

    const at2027 = classifyDocFee([{ name: "doc fee", amount: 412 }], oh, null, null, { asOf: "2027-01-01", vehicleCashPrice: 32000 });
    expect(at2027.classification).toBe("permissible");
    expect(at2027.hardCeiling).toBe(412);

    const over2027 = classifyDocFee([{ name: "doc fee", amount: 413 }], oh, null, null, { asOf: "2027-06-15" });
    expect(over2027.classification).toBe("illegal");
    expect(over2027.summary).toMatch(/exceeds the legal cap/);
    expect(over2027.summary).toMatch(/\$412/);

    const percent = classifyDocFee(
      [{ name: "documentary service charge", amount: 300 }, { name: "sales tax", amount: 200 }],
      oh,
      null,
      null,
      { asOf: "2027-03-01", vehicleCashPrice: 2500 },
    );
    expect(percent.classification).toBe("illegal");
    expect(percent.hardCeiling).toBe(280);
    expect(percent.summary).toMatch(/10%/);
  });

  it("keeps Pennsylvania's 2026 split and does not invent a 2027 legal cap", () => {
    const electronic = classifyDocFee([{ name: "documentary preparation fee", amount: 490 }], pa, null, null, {
      asOf: "2026-11-27",
      electronicTransaction: true,
    });
    expect(electronic.classification).toBe("permissible");
    expect(electronic.hardCeiling).toBe(490);

    const nonElectronic = classifyDocFee([{ name: "documentary preparation fee", amount: 410 }], pa, null, null, {
      asOf: "2026-11-27",
      electronicTransaction: false,
    });
    expect(nonElectronic.classification).toBe("illegal");
    expect(nonElectronic.summary).toMatch(/\$409/);

    const nextYear = classifyDocFee([{ name: "doc fee", amount: 600 }], pa, null, null, { asOf: "2027-02-01" });
    expect(nextYear.classification).toBe("needs_source");
    expect(nextYear.summary.toLowerCase()).not.toMatch(FORBIDDEN);
    expect(nextYear.summary).toMatch(/could not be verified/i);

    const prior = classifyDocFee([{ name: "doc fee", amount: 450 }], pa, null, null, { asOf: "2025-06-01" });
    expect(prior.classification).toBe("potentially_noncompliant");
    expect(prior.hardCeiling).toBe(477);
    expect(prior.conditionalCeiling).toBe(398);
  });

  it("flags passed thresholds and a calendar year with no dollar amount", () => {
    const passed = listPassedThresholds("2026-11-27").map((threshold) => threshold.id);
    expect(passed).toEqual(expect.arrayContaining([
      "pa-electronic-2024",
      "pa-nonelectronic-2024",
      "pa-electronic-2025",
      "pa-nonelectronic-2025",
    ]));
    expect(passed.some((id) => id.startsWith("oh-"))).toBe(false);

    expect(findStatutoryThresholdGaps("2026-11-27").filter((gap) => gap.abbreviation === "OH" || gap.abbreviation === "PA")).toEqual([]);

    const next = findStatutoryThresholdGaps("2027-06-01");
    expect(next.some((gap) => gap.abbreviation === "PA" && gap.reason === "no_value_for_current_year")).toBe(true);
    expect(next.some((gap) => gap.abbreviation === "PA" && gap.reason === "effective_to_passed" && gap.thresholdId === "pa-electronic-2026")).toBe(true);
    expect(next.some((gap) => gap.abbreviation === "OH" && gap.reason === "no_value_for_current_year")).toBe(false);
    expect(listPassedThresholds("2027-06-01").some((threshold) => threshold.id === "oh-registrar-2026")).toBe(true);
  });
});
