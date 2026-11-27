import { describe, expect, it } from "vitest";
import { applyRuleEngine } from "../../server/ruleEngine.js";
import { getStateFeeData } from "../../server/stateFeeLookup.js";
import { classifyFeeBucket, splitFees } from "../../server/quoteMath.js";
import {
  coerceGovernmentFields,
  enrichDetectedFields,
  governmentChargeExtractionRules,
  parseGovernmentLines,
  resolvePurchaseLines,
} from "../../server/governmentCharges.js";
import { detectedFieldsSchema } from "../../shared/schema.js";
import type { AnalysisResponse, DetectedFields, Fee } from "../../shared/schema.js";

/**
 * Live failure after the purchase worksheet landed: the model returned null
 * for sales tax and registration even though the quote printed them, and the
 * worksheet treated the missing lines as zero.
 *
 * Test C: 45000 + 70 + 3500 + 400 = 48970. Dropping tax made the worksheet
 * compute 45470 and report a false $3,500 gap.
 * Test E: 34000 + 599 + 1295 + 2720 + 400 = 39014. Dropping tax and
 * registration made it compute 35894 and report a false $3,120 gap.
 * Test D is a real gap: 26000 + 70 + 2080 + 350 = 28500, printed 30000.
 */

const ca = getStateFeeData("CA");

const llm = {
  dealScore: "GREEN",
  confidenceLevel: "HIGH",
  verdictLabel: "GO — TERMS LOOK CLEAN",
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

function audit(partial: Partial<DetectedFields>, dealerText: string) {
  return applyRuleEngine(llm, fields(partial), null, "cash", null, { stateData: ca, dealerText });
}

function differenceLine(result: ReturnType<typeof audit>): string | undefined {
  return result.mathematicalDerivation?.find((line) => line.startsWith("Out-the-door difference"));
}

const isDoc = (name: string) => name.includes("doc fee");

describe("parseGovernmentLines", () => {
  it("reads the labeled dollar phrasings dealers actually print", () => {
    const cases: { line: string; kind: string; amount: number }[] = [
      { line: "Sales Tax: $3,500", kind: "tax", amount: 3500 },
      { line: "CA Sales Tax: $3,500", kind: "tax", amount: 3500 },
      { line: "State Tax: $2,080", kind: "tax", amount: 2080 },
      { line: "Tax $2,720", kind: "tax", amount: 2720 },
      { line: "Sales tax: $2,176.59", kind: "tax", amount: 2176.59 },
      { line: "Sales tax (7.75%): $3,500", kind: "tax", amount: 3500 },
      { line: "Registration: $400", kind: "registration", amount: 400 },
      { line: "Reg & Title: $400", kind: "titleReg", amount: 400 },
      { line: "Registration and title: $400", kind: "titleReg", amount: 400 },
      { line: "Title & Registration: $400", kind: "titleReg", amount: 400 },
      { line: "Title & Reg: $350", kind: "titleReg", amount: 350 },
      { line: "Title/License/Reg: $350", kind: "titleReg", amount: 350 },
      { line: "License/Registration: $400", kind: "titleReg", amount: 400 },
      { line: "DMV Fees: $400", kind: "gov", amount: 400 },
      { line: "License fee: $55", kind: "registration", amount: 55 },
    ];
    for (const item of cases) {
      const parsed = parseGovernmentLines(item.line);
      expect(parsed, item.line).toHaveLength(1);
      expect(parsed[0].kind, item.line).toBe(item.kind);
      expect(parsed[0].amount, item.line).toBe(item.amount);
    }
  });

  it("reads two labeled amounts on one line", () => {
    const parsed = parseGovernmentLines("Sales tax: $3,500  Registration: $400");
    expect(parsed).toEqual([
      expect.objectContaining({ kind: "tax", amount: 3500 }),
      expect.objectContaining({ kind: "registration", amount: 400 }),
    ]);
  });

  it("sums distinct state and county tax lines and does not repeat a duplicate line", () => {
    const parsed = parseGovernmentLines(
      ["State sales tax: $2,000", "County tax: $500", "State sales tax: $2,000"].join("\n"),
    );
    const taxes = parsed.filter((line) => line.kind === "tax");
    expect(taxes.map((line) => line.amount).sort((a, b) => a - b)).toEqual([500, 2000]);
  });

  it("does not read a tax rate, a bare number, or an unlabeled price as a government charge", () => {
    const silent = [
      "Tax rate: 7.75%",
      "Estimated sales tax rate 7.75 percent",
      "Sales tax 7.25%",
      "Sales tax: 3500",
      "Tax: 7.75",
      "Selling price: $45,000",
      "Doc fee: $70",
      "Out the door: $48,970",
      "Out the door including tax: $48,970",
      "Taxable amount: $45,000",
      "Tax credit: $500",
      "pre-tax amount: $45,000",
      "No tax or registration listed.",
    ];
    for (const line of silent) {
      expect(parseGovernmentLines(line), line).toEqual([]);
    }
  });

  it("keeps a dollar amount that sits next to a rate and ignores the rate", () => {
    const parsed = parseGovernmentLines("CA Sales Tax (7.75%): $3,487.50");
    expect(parsed).toEqual([expect.objectContaining({ kind: "tax", amount: 3487.5 })]);
  });
});

describe("fee buckets the worksheet adds", () => {
  it("sends combined, DMV, and license lines to government fees rather than add-ons", () => {
    const names = [
      "Sales Tax",
      "CA Sales Tax",
      "State Tax",
      "Registration",
      "Reg & Title",
      "Title/License/Reg",
      "License/Registration",
      "DMV Fees",
      "Title & Registration",
      "License fee",
      "Government fees",
    ];
    for (const name of names) {
      const bucket = classifyFeeBucket(name);
      expect(bucket, name).not.toBeNull();
      const split = splitFees([{ name, amount: 100 }], isDoc);
      expect(split.addOns, name).toBe(0);
      expect(split.docFee, name).toBe(0);
    }
  });

  it("does not treat a license-plate frame as registration", () => {
    const split = splitFees([{ name: "License plate frame", amount: 199 }], isDoc);
    expect(split.registrationFee).toBe(0);
    expect(split.govFees).toBe(0);
    expect(split.addOns).toBe(199);
  });

  it("counts a generic government entry once, including when the numeric field repeats it", () => {
    const fromFees = resolvePurchaseLines(
      { fees: [{ name: "DMV fees", amount: 400 }, { name: "Sales tax", amount: 3500 }], govFees: 400, taxes: 3500 },
      isDoc,
    );
    expect(fromFees.statedTax).toBe(3500);
    expect(fromFees.govFees).toBe(400);
    expect(fromFees.addOns).toBe(0);

    const fromNumber = resolvePurchaseLines(
      { fees: [{ name: "Doc fee", amount: 70 }], taxes: 3500, govFees: 400 },
      isDoc,
    );
    expect(fromNumber.statedTax).toBe(3500);
    expect(fromNumber.govFees).toBe(400);
    expect(fromNumber.docFee).toBe(70);
  });

  it("does not add a same-dollar registration line on top of a combined government fee", () => {
    const lines = resolvePurchaseLines(
      {
        fees: [
          { name: "Doc fee", amount: 70 },
          { name: "Sales tax", amount: 3500 },
          { name: "Reg & title", amount: 400 },
        ],
      },
      isDoc,
      "Sales tax: $3,500\nRegistration: $400",
    );
    expect(lines.statedTax).toBe(3500);
    expect(lines.govFees).toBe(400);
    expect(lines.registrationFee).toBe(0);
    expect(lines.docFee).toBe(70);
  });
});

describe("coerceGovernmentFields", () => {
  it("keeps government lines that arrived on an unread array or alias", () => {
    const df: Record<string, unknown> = {
      fees: [{ name: "Doc fee", amount: 70 }],
      salesTax: null,
      govFees: [
        { name: "Sales tax", amount: 3500 },
        { name: "Registration", amount: 400 },
      ],
    };
    coerceGovernmentFields(df);
    expect(df.govFees).toBeUndefined();
    expect(df.fees).toEqual([
      { name: "Doc fee", amount: 70 },
      { name: "Sales tax", amount: 3500 },
      { name: "Registration", amount: 400 },
    ]);
  });

  it("does not turn a percentage string into a tax amount", () => {
    const df: Record<string, unknown> = { taxes: "7.75%", registrationFee: "$400" };
    coerceGovernmentFields(df);
    expect(df.taxes).toBeNull();
    expect(df.registrationFee).toBe(400);
  });

  it("accepts the numeric fields on the detected-fields schema", () => {
    const parsed = detectedFieldsSchema.safeParse({
      salePrice: 45000,
      msrp: null,
      rebates: null,
      fees: [],
      taxes: 3500,
      titleFee: null,
      registrationFee: 400,
      govFees: null,
      outTheDoorPrice: 48970,
      monthlyPayment: null,
      tradeInValue: null,
      apr: null,
      termMonths: null,
      downPayment: null,
    });
    expect(parsed.success).toBe(true);
  });
});

describe("quotes A–E", () => {
  const quoteA = [
    "2025 Toyota Camry LE",
    "California",
    "Cash purchase",
    "Selling price: $28,000",
    "Doc fee: $85",
    "Sales tax: $2,176.59",
    "Registration and title: $400",
    "Out-the-door: $30,661.59",
  ].join("\n");
  const quoteB = [
    "2025 Toyota Camry LE",
    "California",
    "Cash purchase",
    "Selling price: $45,000",
    "Doc fee: $85",
    "Sales tax: $3,500",
    "Registration and title: $400",
    "Out-the-door: $48,985",
  ].join("\n");
  const quoteC = [
    "2025 Toyota Camry LE",
    "California",
    "Cash purchase",
    "Selling price: $45,000",
    "Doc fee: $70",
    "Sales tax: $3,500",
    "Registration: $400",
    "Out-the-door: $48,970",
    "No add-ons.",
  ].join("\n");
  const quoteD = [
    "California",
    "Cash purchase",
    "Selling price: $26,000",
    "Doc fee: $70",
    "Sales tax: $2,080",
    "Title & Reg: $350",
    "Out-the-door: $30,000",
  ].join("\n");
  const quoteE = [
    "2025 Honda CR-V EX",
    "California",
    "Cash purchase",
    "Selling price: $34,000",
    "Doc fee: $599",
    "Dealer paint protection: $1,295 (buyer declined)",
    "Sales tax: $2,720",
    "Registration: $400",
    "Out-the-door: $39,014",
  ].join("\n");

  const fullA: Fee[] = [
    { name: "Doc fee", amount: 85 },
    { name: "Sales tax", amount: 2176.59 },
    { name: "Registration and title", amount: 400 },
  ];
  const fullB: Fee[] = [
    { name: "Doc fee", amount: 85 },
    { name: "Sales tax", amount: 3500 },
    { name: "Registration and title", amount: 400 },
  ];
  const fullC: Fee[] = [
    { name: "Doc fee", amount: 70 },
    { name: "Sales tax", amount: 3500 },
    { name: "Registration", amount: 400 },
  ];
  const fullD: Fee[] = [
    { name: "Doc fee", amount: 70 },
    { name: "Sales tax", amount: 2080 },
    { name: "Title & Reg", amount: 350 },
  ];
  const fullE: Fee[] = [
    { name: "Doc fee", amount: 599 },
    { name: "Dealer paint protection (buyer declined)", amount: 1295 },
    { name: "Sales tax", amount: 2720 },
    { name: "Registration", amount: 400 },
  ];

  function expectReconciled(result: ReturnType<typeof audit>, total: string) {
    expect(differenceLine(result)).toContain("$0.00");
    expect(result.mathematicalDerivation?.some((line) => line.startsWith("Computed out-the-door") && line.includes(total))).toBe(true);
    expect(result.dimensions?.mathematicalAccuracy.status).toBe("clear");
    expect(result.verdictLabel).not.toMatch(/DOESN'T ADD UP/i);
  }

  it("keeps A and B on the conditional doc fee when tax and registration are extracted", () => {
    expect(28000 + 85 + 2176.59 + 400).toBeCloseTo(30661.59, 2);
    expect(45000 + 85 + 3500 + 400).toBe(48985);
    const a = audit({
      salePrice: 28000,
      outTheDoorPrice: 30661.59,
      fees: fullA,
      vehicle_make: "Toyota",
      vehicle_model: "Camry",
      vehicle_year: 2025,
    }, quoteA);
    const b = audit({
      salePrice: 45000,
      outTheDoorPrice: 48985,
      fees: fullB,
      vehicle_make: "Toyota",
      vehicle_model: "Camry",
      vehicle_year: 2025,
    }, quoteB);
    expectReconciled(a, "$30661.59");
    expectReconciled(b, "$48985.00");
    expect(a.verdictLabel).toMatch(/CONDITIONAL DOC FEE/i);
    expect(b.verdictLabel).toMatch(/CONDITIONAL DOC FEE/i);
    expect(a.goNoGo).toBe("PROCEED-WITH-CAUTION");
    expect(b.goNoGo).toBe("PROCEED-WITH-CAUTION");
  });

  it("restores A's tax and combined registration line when the model drops them", () => {
    const dropped = audit({
      salePrice: 28000,
      outTheDoorPrice: 30661.59,
      fees: [{ name: "Doc fee", amount: 85 }],
      taxes: null,
      registrationFee: null,
      govFees: null,
      vehicle_make: "Toyota",
      vehicle_model: "Camry",
      vehicle_year: 2025,
    }, quoteA);
    expectReconciled(dropped, "$30661.59");
    expect(dropped.verdictLabel).toMatch(/CONDITIONAL DOC FEE/i);
  });

  it("does not report a false $3,500 gap on test C when sales tax comes back null", () => {
    expect(45000 + 70 + 3500 + 400).toBe(48970);
    expect(45000 + 70 + 400).toBe(45470);
    const extracted = audit({
      salePrice: 45000,
      outTheDoorPrice: 48970,
      fees: fullC,
      vehicle_make: "Toyota",
      vehicle_model: "Camry",
      vehicle_year: 2025,
    }, quoteC);
    const droppedTax = audit({
      salePrice: 45000,
      outTheDoorPrice: 48970,
      fees: [
        { name: "Doc fee", amount: 70 },
        { name: "Registration", amount: 400 },
      ],
      taxes: null,
      vehicle_make: "Toyota",
      vehicle_model: "Camry",
      vehicle_year: 2025,
    }, quoteC);
    expectReconciled(extracted, "$48970.00");
    expectReconciled(droppedTax, "$48970.00");
    expect(extracted.goNoGo).toBe("INSUFFICIENT-INFORMATION");
    expect(droppedTax.goNoGo).toBe("INSUFFICIENT-INFORMATION");
    expect(extracted.verdictLabel).toMatch(/MARKET VALUE NOT VERIFIED/i);
    expect(droppedTax.verdictLabel).toMatch(/MARKET VALUE NOT VERIFIED/i);
  });

  it("still flags test D's real $1,500 out-the-door gap", () => {
    expect(26000 + 70 + 2080 + 350).toBe(28500);
    const run = (fees: Fee[]) => audit({ salePrice: 26000, outTheDoorPrice: 30000, fees }, quoteD);
    for (const fees of [fullD, [{ name: "Doc fee", amount: 70 }]]) {
      const result = run(fees);
      expect(result.goNoGo).toBe("PROCEED-WITH-CAUTION");
      expect(result.verdictLabel).toMatch(/DOESN'T ADD UP/i);
      expect(differenceLine(result)).toContain("$1500.00");
      expect(result.dimensions?.mathematicalAccuracy.status).toBe("fail");
    }
  });

  it("does not report a false $3,120 gap on test E when tax and registration come back null", () => {
    expect(34000 + 599 + 1295 + 2720 + 400).toBe(39014);
    expect(34000 + 599 + 1295).toBe(35894);
    expect(2720 + 400).toBe(3120);
    const base = {
      salePrice: 34000,
      outTheDoorPrice: 39014,
      vehicle_make: "Honda",
      vehicle_model: "CR-V",
      vehicle_year: 2025,
    };
    const extracted = audit({ ...base, fees: fullE }, quoteE);
    const droppedBoth = audit({
      ...base,
      fees: [
        { name: "Doc fee", amount: 599 },
        { name: "Dealer paint protection (buyer declined)", amount: 1295 },
      ],
      taxes: null,
      registrationFee: null,
    }, quoteE);
    const droppedTaxOnly = audit({
      ...base,
      fees: [
        { name: "Doc fee", amount: 599 },
        { name: "Dealer paint protection (buyer declined)", amount: 1295 },
        { name: "Registration", amount: 400 },
      ],
      taxes: null,
    }, quoteE);
    for (const result of [extracted, droppedBoth, droppedTaxOnly]) {
      expectReconciled(result, "$39014.00");
      expect(result.goNoGo).toBe("NO-GO");
      expect(result.verdictLabel).toMatch(/DOC FEE/i);
    }
  });

  it("restores a dropped sales tax, a dropped registration line, or both", () => {
    const cases: { name: string; text: string; sale: number; otd: number; full: Fee[]; dropped: Fee[]; total: string; verdict: RegExp; go: string }[] = [
      {
        name: "B",
        text: quoteB,
        sale: 45000,
        otd: 48985,
        full: fullB,
        dropped: [{ name: "Doc fee", amount: 85 }],
        total: "$48985.00",
        verdict: /CONDITIONAL DOC FEE/i,
        go: "PROCEED-WITH-CAUTION",
      },
      {
        name: "C registration",
        text: quoteC,
        sale: 45000,
        otd: 48970,
        full: fullC,
        dropped: [
          { name: "Doc fee", amount: 70 },
          { name: "Sales tax", amount: 3500 },
        ],
        total: "$48970.00",
        verdict: /MARKET VALUE NOT VERIFIED/i,
        go: "INSUFFICIENT-INFORMATION",
      },
      {
        name: "C both",
        text: quoteC,
        sale: 45000,
        otd: 48970,
        full: fullC,
        dropped: [{ name: "Doc fee", amount: 70 }],
        total: "$48970.00",
        verdict: /MARKET VALUE NOT VERIFIED/i,
        go: "INSUFFICIENT-INFORMATION",
      },
      {
        name: "E registration",
        text: quoteE,
        sale: 34000,
        otd: 39014,
        full: fullE,
        dropped: [
          { name: "Doc fee", amount: 599 },
          { name: "Dealer paint protection (buyer declined)", amount: 1295 },
          { name: "Sales tax", amount: 2720 },
        ],
        total: "$39014.00",
        verdict: /DOC FEE/i,
        go: "NO-GO",
      },
    ];
    for (const item of cases) {
      const result = audit({
        salePrice: item.sale,
        outTheDoorPrice: item.otd,
        fees: item.dropped,
        taxes: null,
        titleFee: null,
        registrationFee: null,
        govFees: null,
      }, item.text);
      expectReconciled(result, item.total);
      expect(result.goNoGo, item.name).toBe(item.go);
      expect(result.verdictLabel, item.name).toMatch(item.verdict);
      const lines = resolvePurchaseLines({ fees: item.full }, isDoc, item.text);
      const again = resolvePurchaseLines({ fees: item.dropped, taxes: null, registrationFee: null }, isDoc, item.text);
      expect(lines.statedTax, item.name).toBe(again.statedTax);
      expect(lines.titleFee + lines.registrationFee + lines.govFees, item.name)
        .toBe(again.titleFee + again.registrationFee + again.govFees);
    }
  });

  it("does not double-count a line that the model and the quote both contain", () => {
    const once = enrichDetectedFields(fields({
      salePrice: 45000,
      outTheDoorPrice: 48970,
      fees: fullC,
      taxes: 3500,
      registrationFee: 400,
    }), quoteC);
    const twice = enrichDetectedFields(once, quoteC);
    const lines = resolvePurchaseLines(twice, isDoc, quoteC);
    expect(lines.statedTax).toBe(3500);
    expect(lines.registrationFee).toBe(400);
    expect(lines.govFees).toBe(0);
    expect(lines.docFee).toBe(70);
    expect(once.fees.filter((fee) => fee.amount === 3500)).toHaveLength(1);
    expect(twice.fees).toEqual(once.fees);
  });
});

describe("nothing is invented when the quote is silent", () => {
  const text = [
    "Selling price: $20,000",
    "Doc fee: $70",
    "Out the door: $22,000",
  ].join("\n");

  it("leaves tax and registration null", () => {
    const enriched = enrichDetectedFields(fields({
      salePrice: 20000,
      outTheDoorPrice: 22000,
      fees: [{ name: "Doc fee", amount: 70 }],
      taxes: null,
      titleFee: null,
      registrationFee: null,
      govFees: null,
    }), text);
    expect(enriched.taxes).toBeNull();
    expect(enriched.titleFee).toBeNull();
    expect(enriched.registrationFee).toBeNull();
    expect(enriched.govFees).toBeNull();
    expect(enriched.fees).toEqual([{ name: "Doc fee", amount: 70 }]);
  });

  it("does not call the unexplained total a math failure", () => {
    const result = audit({
      salePrice: 20000,
      outTheDoorPrice: 22000,
      fees: [{ name: "Doc fee", amount: 70 }],
    }, text);
    expect(result.verdictLabel).not.toMatch(/DOESN'T ADD UP/i);
    expect(result.dimensions?.mathematicalAccuracy.status).not.toBe("fail");
    expect(result.dimensions?.mathematicalAccuracy.summary).toMatch(/not itemized/i);
    expect(differenceLine(result)).toBeUndefined();
  });
});

describe("extraction instructions", () => {
  it("tells the model which fields the worksheet adds and not to store a rate as dollars", () => {
    const rules = governmentChargeExtractionRules();
    expect(rules).toMatch(/taxes/);
    expect(rules).toMatch(/titleFee/);
    expect(rules).toMatch(/registrationFee/);
    expect(rules).toMatch(/govFees/);
    expect(rules).toMatch(/7\.75%/);
    expect(rules).toMatch(/Do not calculate tax from a rate/);
  });
});
