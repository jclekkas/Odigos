import { describe, expect, it } from "vitest";
import { classifyDocFee, classifySeparateFilingCharges } from "../../server/regulatoryClassification.js";
import { applyRuleEngine } from "../../server/ruleEngine.js";
import { getStateFeeData } from "../../server/stateFeeLookup.js";
import dataset from "../../data/state_fees.json" with { type: "json" };
import type { AnalysisResponse, DetectedFields } from "../../shared/schema.js";

describe("California document processing charge", () => {
  const ca = getStateFeeData("CA")!;

  it("stores both statutory ceilings from the fetched statute", () => {
    const conditions = dataset.states.CA.docFeeConditions;
    expect(conditions.map((item) => item.maxAmount)).toEqual([85, 70]);
    expect(conditions[0].effectiveDate).toBe("2019-01-01");
    expect(conditions[0].officialSource).toContain("leginfo.legislature.ca.gov");
    expect(conditions[0].statutoryReference).toContain("4456.5");
    expect(conditions.every((item) => item.lastVerificationDate === "2026-11-27")).toBe(true);
  });

  it("treats $85 as conditional when partner status is unknown", () => {
    const result = classifyDocFee([{ name: "doc fee", amount: 85 }], ca, null);
    expect(result.classification).toBe("potentially_noncompliant");
    expect(result.hardCeiling).toBe(85);
    expect(result.conditionalCeiling).toBe(70);
  });

  it("allows $85 only when the partner agreement is confirmed", () => {
    expect(classifyDocFee([{ name: "doc fee", amount: 85 }], ca, true).classification).toBe("permissible");
    expect(classifyDocFee([{ name: "doc fee", amount: 80 }], ca, false).classification).toBe("illegal");
  });

  it("treats $70 as permissible and anything above $85 as illegal", () => {
    expect(classifyDocFee([{ name: "documentation fee", amount: 70 }], ca, null).classification).toBe("permissible");
    expect(classifyDocFee([{ name: "documentation fee", amount: 85.01 }], ca, true).classification).toBe("illegal");
    expect(classifyDocFee([{ name: "documentation fee", amount: 199 }], ca, null).classification).toBe("illegal");
  });

  it("does not call an unverified stored cap a legal violation", () => {
    const il = getStateFeeData("IL")!;
    const result = classifyDocFee([{ name: "processing fee", amount: 400 }], il, null);
    expect(result.classification).toBe("needs_source");
    expect(result.exceedsStoredCap).toBe(true);
    expect(result.statutoryReference).toBe("needs_source");
    expect(result.summary.toLowerCase()).not.toContain("illegal");
  });
});

describe("Oregon document processing fee", () => {
  const or = getStateFeeData("OR")!;

  it("stores both statutory ceilings from the fetched statute", () => {
    const conditions = dataset.states.OR.docFeeConditions;
    expect(conditions.map((item) => item.maxAmount)).toEqual([250, 200]);
    expect(conditions[0].officialSource).toContain("oregonlegislature.gov");
    expect(conditions[0].statutoryReference).toContain("822.043");
    expect(conditions[0].effectiveDate).toBeNull();
    expect(conditions.every((item) => item.lastVerificationDate === "2026-11-27")).toBe(true);
  });

  it("treats $200 as permissible and $201–$250 as conditional when integrator status is unknown", () => {
    expect(classifyDocFee([{ name: "doc fee", amount: 200 }], or, null, null).classification).toBe("permissible");
    const conditional = classifyDocFee([{ name: "document processing fee", amount: 225 }], or, null, null);
    expect(conditional.classification).toBe("potentially_noncompliant");
    expect(conditional.hardCeiling).toBe(250);
    expect(conditional.conditionalCeiling).toBe(200);
    expect(conditional.officialSource).toContain("oregonlegislature.gov");
    expect(conditional.lastVerificationDate).toBe("2026-11-27");
    expect(classifyDocFee([{ name: "doc fee", amount: 250 }], or, null, null).classification).toBe("potentially_noncompliant");
  });

  it("allows $250 only when integrator use is confirmed", () => {
    expect(classifyDocFee([{ name: "doc fee", amount: 250 }], or, null, true).classification).toBe("permissible");
    expect(classifyDocFee([{ name: "doc fee", amount: 201 }], or, null, false).classification).toBe("illegal");
    expect(classifyDocFee([{ name: "doc fee", amount: 200 }], or, null, false).classification).toBe("permissible");
  });

  it("treats a fee above $250 as a violation", () => {
    const result = classifyDocFee([{ name: "documentation fee", amount: 250.01 }], or, null, true);
    expect(result.classification).toBe("illegal");
    expect(result.summary.toLowerCase()).not.toMatch(/not a legal violation/);
    expect(classifyDocFee([{ name: "documentation fee", amount: 275 }], or, null, null).classification).toBe("illegal");
  });

  it("asks the buyer to verify integrator status instead of approving $250", () => {
    const fields = {
      salePrice: 32000,
      outTheDoorPrice: 36000,
      fees: [{ name: "document processing fee", amount: 225 }],
    } as DetectedFields;
    const llm = {
      dealScore: "GREEN",
      confidenceLevel: "MEDIUM",
      verdictLabel: "PROCEED",
      goNoGo: "GO",
      summary: "fixture",
      detectedFields: fields,
      missingInfo: [],
      suggestedReply: "fixture",
      reasoning: "fixture",
    } as AnalysisResponse;
    const result = applyRuleEngine(llm, fields, null, "cash", null, { stateData: or });
    expect(result.goNoGo).toBe("PROCEED-WITH-CAUTION");
    expect(result.verdictLabel.toUpperCase()).toContain("CONDITIONAL DOC FEE");
    expect(result.suggestedReply).toMatch(/integrator/i);
    expect(result.suggestedReply).not.toMatch(/1685/);
    expect(result.suggestedReply?.toLowerCase()).not.toContain("illegal");
  });
});

describe("caps checked against a fetched government page", () => {
  it("enforces the New York, Arkansas, and Michigan dollar ceilings", () => {
    const ny = getStateFeeData("NY")!;
    const ar = getStateFeeData("AR")!;
    const mi = getStateFeeData("MI")!;
    expect(classifyDocFee([{ name: "doc fee", amount: 175 }], ny).classification).toBe("permissible");
    expect(classifyDocFee([{ name: "doc fee", amount: 175.01 }], ny).classification).toBe("illegal");
    expect(classifyDocFee([{ name: "doc fee", amount: 129 }], ar).classification).toBe("permissible");
    expect(classifyDocFee([{ name: "doc fee", amount: 130 }], ar).classification).toBe("illegal");
    expect(classifyDocFee([{ name: "documentary preparation fee", amount: 280 }], mi).classification).toBe("permissible");
    expect(classifyDocFee([{ name: "doc fee", amount: 281 }], mi).classification).toBe("illegal");
  });

  it("never labels a still-unverified cap illegal", () => {
    for (const [code, state] of Object.entries(dataset.states)) {
      const capUnverified =
        state.source_status === "needs_source" || (state.unverified_fields ?? []).includes("docFeeCapAmount");
      if (!capUnverified || code === "CA" || code === "OR") continue;
      const charged = (state.docFeeCapAmount ?? 1000) + 500;
      const result = classifyDocFee([{ name: "doc fee", amount: charged }], getStateFeeData(code)!);
      expect(result.classification, code).not.toBe("illegal");
      expect(result.summary.toLowerCase(), code).not.toContain("illegal");
    }
  });
});

function quote(partial: Partial<DetectedFields>): DetectedFields {
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
    moneyFactor: null,
    residualValue: null,
    residualPercent: null,
    acquisitionFee: null,
    dispositionFee: null,
    mileageAllowance: null,
    excessMileageRate: null,
    ...partial,
  };
}

const llmFixture = {
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

describe("Michigan 5% cash-price ceiling", () => {
  const mi = getStateFeeData("MI")!;

  it("uses the lesser of $280 and 5% of a known vehicle cash price", () => {
    const result = classifyDocFee(
      [{ name: "documentation fee", amount: 250 }],
      mi,
      null,
      null,
      { vehicleCashPrice: 4000 },
    );
    expect(result.classification).toBe("illegal");
    expect(result.hardCeiling).toBe(200);
    expect(result.chargedAmount).toBe(250);
    expect(result.officialSource).toContain("michigan.gov");
    expect(result.statutoryReference).toContain("492.113");
    expect(result.lastVerificationDate).toBe("2026-11-27");
    expect(result.summary).toContain("$200");
    expect(result.summary).toContain("5%");
  });

  it("NO-GOs a $250 documentation fee on a $4,000 Michigan vehicle", () => {
    const result = applyRuleEngine(
      llmFixture,
      quote({
        salePrice: 4000,
        outTheDoorPrice: 4800,
        fees: [{ name: "documentation fee", amount: 250 }],
      }),
      null,
      "cash",
      null,
      { stateData: mi },
    );
    expect(result.goNoGo).toBe("NO-GO");
    expect(result.verdictLabel).toMatch(/DOC FEE/i);
    expect(result.docFeeAssessment?.hardCeiling).toBe(200);
    expect(result.docFeeAssessment?.chargedAmount).toBe(250);
  });

  it("falls back to the $280 ceiling when the cash price is unknown and notes the 5% rule", () => {
    const under = classifyDocFee([{ name: "doc fee", amount: 250 }], mi);
    expect(under.classification).toBe("permissible");
    expect(under.hardCeiling).toBe(280);
    expect(under.summary).toMatch(/5%/);
    expect(under.summary).toMatch(/not on the quote|was not applied/i);
    expect(classifyDocFee([{ name: "doc fee", amount: 281 }], mi).classification).toBe("illegal");
  });

  it("keeps a $280 fee permissible when 5% of the cash price is higher", () => {
    const result = classifyDocFee([{ name: "documentary preparation fee", amount: 280 }], mi, null, null, {
      vehicleCashPrice: 10000,
    });
    expect(result.classification).toBe("permissible");
    expect(result.hardCeiling).toBe(280);
  });
});

describe("Arkansas service-and-handling aliases", () => {
  const ar = getStateFeeData("AR")!;
  const ca = getStateFeeData("CA")!;

  it("checks dealer service and handling names against the $129 ceiling", () => {
    expect(classifyDocFee([{ name: "dealer service and handling fee", amount: 129 }], ar).classification).toBe("permissible");
    expect(classifyDocFee([{ name: "service and handling fee", amount: 130 }], ar).classification).toBe("illegal");
    expect(classifyDocFee([{ name: "service & handling", amount: 140 }], ar).classification).toBe("illegal");
    expect(classifyDocFee([{ name: "dealer service fee", amount: 150 }], ar).classification).toBe("illegal");
    const over = classifyDocFee([{ name: "Dealer Service and Handling Fee", amount: 200 }], ar);
    expect(over.hardCeiling).toBe(129);
    expect(over.statutoryReference).toMatch(/23-112-317|410-801/);
    expect(over.officialSource).toContain("codeofarrules.arkansas.gov");
  });

  it("does not treat an Arkansas service-and-handling label as a California document processing charge", () => {
    const result = classifyDocFee([{ name: "service and handling fee", amount: 200 }], ca);
    expect(result.classification).toBe("not_checked");
    expect(result.chargedAmount).toBeNull();
  });

  it("NO-GOs an Arkansas service and handling fee above $129", () => {
    const result = applyRuleEngine(
      llmFixture,
      quote({
        salePrice: 18000,
        outTheDoorPrice: 20000,
        fees: [{ name: "service and handling fee", amount: 140 }],
      }),
      null,
      "cash",
      null,
      { stateData: ar },
    );
    expect(result.goNoGo).toBe("NO-GO");
    expect(result.docFeeAssessment?.chargedAmount).toBe(140);
    expect(result.docFeeAssessment?.hardCeiling).toBe(129);
  });
});

describe("aggregated documentation charges", () => {
  const ca = getStateFeeData("CA")!;

  it("NO-GOs two $60 California documentation charges because $120 exceeds both ceilings", () => {
    const fees = [
      { name: "documentation fee", amount: 60 },
      { name: "doc fee", amount: 60 },
    ];
    const partner = classifyDocFee(fees, ca, true);
    const unknown = classifyDocFee(fees, ca, null);
    expect(partner.chargedAmount).toBe(120);
    expect(partner.classification).toBe("illegal");
    expect(unknown.classification).toBe("illegal");
    expect(partner.summary).toMatch(/\$85|\$120/);

    const result = applyRuleEngine(
      llmFixture,
      quote({ salePrice: 28000, outTheDoorPrice: 32000, fees }),
      null,
      "cash",
      null,
      { stateData: ca, privateIndustryPartner: true },
    );
    expect(result.goNoGo).toBe("NO-GO");
    expect(result.docFeeAssessment?.chargedAmount).toBe(120);
  });

  it("does not add separate government title or registration fees to the documentation total", () => {
    const result = classifyDocFee(
      [
        { name: "documentation fee", amount: 60 },
        { name: "title fee", amount: 60 },
        { name: "registration fee", amount: 90 },
        { name: "registration processing fee", amount: 40 },
      ],
      ca,
      false,
    );
    expect(result.chargedAmount).toBe(60);
    expect(result.classification).toBe("permissible");
  });

  it("does not add a separate broad dealer fee on top of an itemized documentation fee", () => {
    const result = classifyDocFee(
      [
        { name: "doc fee", amount: 50 },
        { name: "dealer fee", amount: 80 },
      ],
      ca,
      false,
    );
    expect(result.chargedAmount).toBe(50);
    expect(result.classification).toBe("permissible");
  });
});

describe("Oregon purchaser election under ORS 822.043(5) and (6)", () => {
  const oregon = getStateFeeData("OR")!;

  it("carries the fetched integrator payment and election rights on every Oregon result", () => {
    const result = classifyDocFee([{ name: "document processing fee", amount: 225 }], oregon, null, null);
    expect(result.condition).toMatch(/822\.043\(5\)/);
    expect(result.condition).toMatch(/\$35/);
    expect(result.condition).toMatch(/822\.043\(6\)/);
    expect(result.condition).toMatch(/elect/i);
    expect(result.officialSource).toContain("oregonlegislature.gov");
    expect(result.lastVerificationDate).toBe("2026-11-27");
    expect(result.summary).toMatch(/elect/i);
    expect(result.summary).toMatch(/\$35/);
  });

  it("asks the buyer to make the integrator election instead of citing California", () => {
    const result = applyRuleEngine(
      llmFixture,
      quote({
        salePrice: 32000,
        outTheDoorPrice: 36000,
        fees: [{ name: "document processing fee", amount: 225 }],
      }),
      null,
      "cash",
      null,
      { stateData: oregon },
    );
    expect(result.goNoGo).toBe("PROCEED-WITH-CAUTION");
    expect(result.suggestedReply).toMatch(/822\.043\(6\)/);
    expect(result.suggestedReply).toMatch(/elect/i);
    expect(result.suggestedReply).toMatch(/\$35/);
    expect(result.suggestedReply).not.toMatch(/1685/);
  });
});

describe("Pennsylvania, Rhode Island, Minnesota, and Ohio conditional rules", () => {
  const pa = getStateFeeData("PA")!;
  const ri = getStateFeeData("RI")!;
  const mn = getStateFeeData("MN")!;
  const oh = getStateFeeData("OH")!;

  it("treats a Pennsylvania fee between $409 and $490 as conditional until electronic processing is known", () => {
    const dated = { asOf: "2026-11-27" };
    expect(classifyDocFee([{ name: "documentary preparation fee", amount: 409 }], pa, null, null, dated).classification).toBe("permissible");
    const conditional = classifyDocFee([{ name: "documentary preparation fee", amount: 450 }], pa, null, null, dated);
    expect(conditional.classification).toBe("potentially_noncompliant");
    expect(conditional.hardCeiling).toBe(490);
    expect(conditional.conditionalCeiling).toBe(409);
    expect(conditional.officialSource).toContain("pa.gov");
    expect(conditional.lastVerificationDate).toBe("2026-11-27");
    expect(classifyDocFee([{ name: "doc fee", amount: 450 }], pa, null, null, { electronicTransaction: true, asOf: "2026-11-27" }).classification).toBe("permissible");
    expect(classifyDocFee([{ name: "doc fee", amount: 450 }], pa, null, null, { electronicTransaction: false, asOf: "2026-11-27" }).classification).toBe("illegal");
    expect(classifyDocFee([{ name: "doc fee", amount: 491 }], pa, null, null, { electronicTransaction: true, asOf: "2026-11-27" }).classification).toBe("illegal");

    const result = applyRuleEngine(
      llmFixture,
      quote({ salePrice: 32000, outTheDoorPrice: 36000, fees: [{ name: "documentary preparation fee", amount: 450 }] }),
      null,
      "cash",
      null,
      { stateData: pa, asOf: "2026-11-27" },
    );
    expect(result.goNoGo).toBe("PROCEED-WITH-CAUTION");
    expect(result.suggestedReply).toMatch(/818\.327/);
    expect(result.suggestedReply).not.toMatch(/1685/);
  });

  it("prohibits any Rhode Island documentary fee on a sale under $10,000 and caps sales over $10,000 at $400", () => {
    const under = classifyDocFee([{ name: "documentary preparation fee", amount: 50 }], ri, null, null, { vehicleCashPrice: 9000 });
    expect(under.classification).toBe("illegal");
    expect(under.hardCeiling).toBe(0);
    expect(under.officialSource).toContain("rules.sos.ri.gov");
    expect(classifyDocFee([{ name: "documentary preparation fee", amount: 400 }], ri, null, null, { vehicleCashPrice: 10001 }).classification).toBe("permissible");
    expect(classifyDocFee([{ name: "documentary preparation fee", amount: 401 }], ri, null, null, { vehicleCashPrice: 15000 }).classification).toBe("illegal");
    const exact = classifyDocFee([{ name: "documentary preparation fee", amount: 100 }], ri, null, null, { vehicleCashPrice: 10000 });
    expect(exact.classification).toBe("needs_source");
    expect(exact.summary).toMatch(/exactly \$10,000/);
    const unknown = classifyDocFee([{ name: "documentary preparation fee", amount: 400 }], ri);
    expect(unknown.classification).toBe("permissible");
    expect(unknown.summary).toMatch(/\$10,000/);
    expect(unknown.summary).toMatch(/not applied/i);
    const titleOnly = classifyDocFee([{ name: "Title Preparation Fee", amount: 20 }], ri, null, null, { vehicleCashPrice: 9000 });
    expect(titleOnly.chargedAmount).toBeNull();
    expect(titleOnly.classification).toBe("not_checked");
  });

  it("uses the lesser of $350 and 10% of the Minnesota sale value", () => {
    const low = classifyDocFee([{ name: "document administration fee", amount: 250 }], mn, null, null, { vehicleCashPrice: 2000 });
    expect(low.classification).toBe("illegal");
    expect(low.hardCeiling).toBe(200);
    expect(low.statutoryReference).toContain("subd. 31");
    expect(low.officialSource).toContain("revisor.mn.gov");
    expect(low.lastVerificationDate).toBe("2026-11-27");
    expect(classifyDocFee([{ name: "documentary fee", amount: 200 }], mn, null, null, { vehicleCashPrice: 2000 }).classification).toBe("permissible");
    expect(classifyDocFee([{ name: "doc fee", amount: 350 }], mn, null, null, { vehicleCashPrice: 20000 }).classification).toBe("permissible");
    const unknown = classifyDocFee([{ name: "doc fee", amount: 350 }], mn);
    expect(unknown.classification).toBe("permissible");
    expect(unknown.hardCeiling).toBe(350);
    expect(unknown.summary).toMatch(/10%/);
    expect(unknown.summary).toMatch(/not applied/i);
    expect(classifyDocFee([{ name: "doc fee", amount: 351 }], mn).classification).toBe("illegal");
  });

  it("uses the lesser of Ohio's $398 registrar amount and 10% of the contract amount excluding tax, title, registration, and negative equity", () => {
    const low = classifyDocFee(
      [
        { name: "documentary service charge", amount: 350 },
        { name: "sales tax", amount: 200 },
        { name: "title fee", amount: 18 },
        { name: "negative equity", amount: 1000 },
      ],
      oh,
      null,
      null,
      { vehicleCashPrice: 3000, asOf: "2026-11-27" },
    );
    expect(low.classification).toBe("illegal");
    expect(low.hardCeiling).toBe(335);
    expect(low.officialSource).toContain("codes.ohio.gov");
    expect(low.lastVerificationDate).toBe("2026-11-27");
    expect(low.summary).toMatch(/4517\.261/);

    const within = classifyDocFee(
      [
        { name: "documentary service charge", amount: 300 },
        { name: "sales tax", amount: 200 },
        { name: "title fee", amount: 18 },
      ],
      oh,
      null,
      null,
      { vehicleCashPrice: 3000, asOf: "2026-11-27" },
    );
    expect(within.classification).toBe("permissible");
    expect(within.hardCeiling).toBe(330);

    const ordinary = classifyDocFee([{ name: "doc fee", amount: 398 }], oh, null, null, { vehicleCashPrice: 32000, asOf: "2026-11-27" });
    expect(ordinary.classification).toBe("permissible");
    expect(ordinary.hardCeiling).toBe(398);

    const unknown = classifyDocFee([{ name: "doc fee", amount: 398 }], oh, null, null, { asOf: "2026-11-27" });
    expect(unknown.classification).toBe("permissible");
    expect(unknown.summary).toMatch(/not applied/i);
    expect(classifyDocFee([{ name: "doc fee", amount: 399 }], oh, null, null, { asOf: "2026-11-27" }).classification).toBe("illegal");
  });
});

describe("exact documentation aliases take precedence over administrative aliases", () => {
  const ca = getStateFeeData("CA")!;

  it("measures the $60 doc fee and does not add a $60 administrative processing charge for the same service", () => {
    const fees = [
      { name: "doc fee", amount: 60 },
      { name: "administrative processing charge", amount: 60 },
    ];
    const result = classifyDocFee(fees, ca, false);
    // Vehicle Code § 4456.5(a)(1) authorizes one document processing charge.
    // Civil Code § 2982(a)(1)(B) itemizes that charge on its own line.
    // The exact "doc fee" line is the charge compared with the ceiling.
    // The broader administrative alias names the same service and is not added again.
    expect(result.chargedAmount).toBe(60);
    expect(result.classification).toBe("permissible");
    expect(result.summary.toLowerCase()).not.toContain("illegal");

    const onlyBroad = classifyDocFee([{ name: "administrative processing charge", amount: 120 }], ca, true);
    expect(onlyBroad.chargedAmount).toBe(120);
    expect(onlyBroad.classification).toBe("illegal");
  });
});

describe("electronic filing and optional electronic transfer are not doc fees", () => {
  const ca = getStateFeeData("CA")!;
  const mn = getStateFeeData("MN")!;

  it("does not add a California electronic filing charge to the document processing ceiling", () => {
    const result = classifyDocFee(
      [
        { name: "doc fee", amount: 70 },
        { name: "electronic filing fee", amount: 30 },
      ],
      ca,
      false,
    );
    expect(result.chargedAmount).toBe(70);
    expect(result.classification).toBe("permissible");

    const filing = classifySeparateFilingCharges(
      [
        { name: "doc fee", amount: 70 },
        { name: "electronic filing fee", amount: 30 },
      ],
      ca,
    );
    expect(filing).toHaveLength(1);
    expect(filing[0].kind).toBe("ca_electronic_filing");
    expect(filing[0].classification).toBe("potentially_noncompliant");
    expect(filing[0].classification).not.toBe("illegal");
    expect(filing[0].summary.toLowerCase()).not.toContain("illegal");
    expect(filing[0].summary).toMatch(/4456\.5/);
    expect(filing[0].summary).toMatch(/not added to the document processing ceiling/i);
    expect(filing[0].officialSource).toContain("leginfo.legislature.ca.gov");
    expect(filing[0].unconfirmed.length).toBeGreaterThan(0);
  });

  it("flags a California electronic filing charge above the handbook's $33 figure without calling it a statutory violation", () => {
    const filing = classifySeparateFilingCharges([{ name: "electronic filing charge", amount: 50 }], ca);
    expect(filing[0].classification).not.toBe("illegal");
    expect(filing[0].summary).toMatch(/\$33/);
    expect(filing[0].summary).toMatch(/not fetched|flagged/i);
    const doc = classifyDocFee([{ name: "electronic filing charge", amount: 50 }], ca, true);
    expect(doc.chargedAmount).toBeNull();
    expect(doc.classification).toBe("not_checked");
  });

  it("does not treat a registration service charge as the California document processing charge", () => {
    const doc = classifyDocFee(
      [
        { name: "document processing charge", amount: 70 },
        { name: "registration service fee", amount: 45 },
      ],
      ca,
      false,
    );
    expect(doc.chargedAmount).toBe(70);
    const filing = classifySeparateFilingCharges(
      [
        { name: "electronic filing fee", amount: 25 },
        { name: "registration service fee", amount: 45 },
      ],
      ca,
    );
    expect(filing.map((item) => item.kind).sort()).toEqual(["ca_electronic_filing", "ca_registration_service"]);
    const service = filing.find((item) => item.kind === "ca_registration_service");
    expect(service?.classification).toBe("needs_source");
    expect(service?.summary.toLowerCase()).not.toContain("illegal");
    const electronic = filing.find((item) => item.kind === "ca_electronic_filing");
    expect(electronic?.unconfirmed.join(" ")).toMatch(/registration service/i);
    expect(electronic?.classification).not.toBe("illegal");
  });

  it("excludes a Minnesota optional electronic transfer fee from the documentary fee", () => {
    const doc = classifyDocFee(
      [
        { name: "documentary fee", amount: 125 },
        { name: "optional electronic transfer fee", amount: 40 },
      ],
      mn,
      null,
      null,
      { vehicleCashPrice: 20000 },
    );
    expect(doc.chargedAmount).toBe(125);
    expect(doc.classification).toBe("permissible");
    const filing = classifySeparateFilingCharges(
      [{ name: "optional electronic transfer fee", amount: 40 }],
      mn,
    );
    expect(filing[0].kind).toBe("mn_electronic_transfer");
    expect(filing[0].classification).toBe("potentially_noncompliant");
    expect(filing[0].summary).toMatch(/168\.27/);
    expect(filing[0].summary).toMatch(/53C\.01/);
    expect(filing[0].summary.toLowerCase()).not.toContain("illegal");
    expect(filing[0].officialSource).toContain("revisor.mn.gov");
  });

  it("does not fold a Minnesota electronic filing line into the documentary fee when the statutory name is missing", () => {
    const doc = classifyDocFee(
      [
        { name: "document administration fee", amount: 300 },
        { name: "electronic filing fee", amount: 25 },
      ],
      mn,
    );
    expect(doc.chargedAmount).toBe(300);
    const filing = classifySeparateFilingCharges([{ name: "electronic filing fee", amount: 25 }], mn);
    expect(filing[0].classification).not.toBe("illegal");
    expect(filing[0].unconfirmed.join(" ")).toMatch(/optional electronic transfer fee/i);
  });
});

describe("printed line positions", () => {
  const ca = getStateFeeData("CA")!;

  it("counts one printed doc fee once when the model extracted it twice", () => {
    const dealerText = "Doc fee: $60\nSelling price: $28,000";
    const result = classifyDocFee(
      [
        { name: "Doc fee", amount: 60 },
        { name: "Doc fee", amount: 60 },
      ],
      ca,
      false,
      null,
      { dealerText },
    );
    expect(result.chargedAmount).toBe(60);
    expect(result.classification).toBe("permissible");
  });

  it("counts two identical doc fee lines that are both printed", () => {
    const dealerText = "Doc fee: $60\nSelling price: $28,000\nDoc fee: $60";
    const result = classifyDocFee([{ name: "Doc fee", amount: 60 }], ca, true, null, { dealerText });
    expect(result.chargedAmount).toBe(120);
    expect(result.classification).toBe("illegal");
  });

  it("keeps two different source lines when the raw text is not supplied", () => {
    const result = classifyDocFee(
      [
        { name: "doc fee", amount: 60, sourceLine: 1 },
        { name: "doc fee", amount: 60, sourceLine: 8 },
      ],
      ca,
      true,
    );
    expect(result.chargedAmount).toBe(120);
  });
});
