// Carrier rules and evaluation logic
export const CARRIER_RULES = [
  {
    id: "nlg",
    name: "National Life Group",
    products: ["Term", "IUL", "Whole Life"],
    maxIssueAge: 80,
    minCoverage: 25000,
    maxCoverageMultiplierOfIncome: 30,
    tobaccoLookbackYears: 2,
    declineReasons: ({ age, duiYears, bankruptcyYears, travelHighRisk }: any) => {
      const reasons = [];
      if (age > 80) reasons.push("Age over maximum (80)");
      if (duiYears !== null && duiYears <= 1) reasons.push("DUI within 12 months");
      if (bankruptcyYears !== null && bankruptcyYears < 1) reasons.push("Bankruptcy within 12 months");
      if (travelHighRisk) reasons.push("High-risk travel disclosed");
      return reasons;
    },
  },
  {
    id: "mutual_of_omaha",
    name: "Mutual of Omaha",
    products: ["Term", "Whole Life"],
    maxIssueAge: 75,
    minCoverage: 50000,
    maxCoverageMultiplierOfIncome: 25,
    tobaccoLookbackYears: 2,
    declineReasons: ({ age, cancerHistoryYears, uncontrolledDiabetes, bmi }: any) => {
      const reasons = [];
      if (age > 75) reasons.push("Age over maximum (75)");
      if (cancerHistoryYears !== null && cancerHistoryYears < 2) reasons.push("Cancer treatment within 24 months");
      if (uncontrolledDiabetes) reasons.push("Uncontrolled diabetes disclosed");
      if (bmi && bmi > 50) reasons.push("BMI above program limits");
      return reasons;
    },
  },
  {
    id: "ameritas",
    name: "Ameritas",
    products: ["Term", "IUL"],
    maxIssueAge: 80,
    minCoverage: 100000,
    maxCoverageMultiplierOfIncome: 30,
    tobaccoLookbackYears: 2,
    declineReasons: ({ age, hazardousOccupation, avocationRisk }: any) => {
      const reasons = [];
      if (age > 80) reasons.push("Age over maximum (80)");
      if (hazardousOccupation) reasons.push("Hazardous occupation risk");
      if (avocationRisk) reasons.push("High-risk avocation (diving, aviation, etc.)");
      return reasons;
    },
  },
  {
    id: "lafayette_life",
    name: "Lafayette Life",
    products: ["Whole Life", "IUL"],
    maxIssueAge: 85,
    minCoverage: 25000,
    maxCoverageMultiplierOfIncome: 35,
    tobaccoLookbackYears: 2,
    declineReasons: ({ age, uncontrolledHypertension, insulinDependent }: any) => {
      const reasons = [];
      if (age > 85) reasons.push("Age over maximum (85)");
      if (uncontrolledHypertension) reasons.push("Uncontrolled hypertension");
      if (insulinDependent) reasons.push("Insulin-dependent diabetes (program specific)");
      return reasons;
    },
  },
  {
    id: "transamerica",
    name: "Transamerica",
    products: ["Term"],
    maxIssueAge: 79,
    minCoverage: 25000,
    maxCoverageMultiplierOfIncome: 25,
    tobaccoLookbackYears: 1,
    declineReasons: ({ age, felonyYears }: any) => {
      const reasons = [];
      if (age > 79) reasons.push("Age over maximum (79)");
      if (felonyYears !== null && felonyYears < 2) reasons.push("Felony conviction within 24 months");
      return reasons;
    },
  },
  {
    id: "american_amicable",
    name: "American Amicable",
    products: ["Term", "Whole Life"],
    maxIssueAge: 85,
    minCoverage: 25000,
    maxCoverageMultiplierOfIncome: 20,
    tobaccoLookbackYears: 2,
    declineReasons: ({ age, copd, heartEventYears }: any) => {
      const reasons = [];
      if (age > 85) reasons.push("Age over maximum (85)");
      if (copd) reasons.push("COPD disclosed");
      if (heartEventYears !== null && heartEventYears < 1) reasons.push("Heart attack/stent within 12 months");
      return reasons;
    },
  },
];

function fmtUSD(n: number): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(n || 0));
}

export function evaluateCarrier(carrier: any, data: any) {
  const notes = [];
  const flags = [];

  if (!carrier.products.includes(data.productType)) {
    flags.push(`Product not offered: ${data.productType}`);
  }

  if (data.coverage && data.annualIncome && carrier.maxCoverageMultiplierOfIncome) {
    const cap = data.annualIncome * carrier.maxCoverageMultiplierOfIncome;
    if (data.coverage > cap) {
      flags.push(
        `Coverage (${fmtUSD(data.coverage)}) exceeds ${carrier.name}'s income multiple cap (${carrier.maxCoverageMultiplierOfIncome}× = ${fmtUSD(cap)})`
      );
    }
  }

  if (data.coverage && carrier.minCoverage && data.coverage < carrier.minCoverage) {
    flags.push(`Coverage below minimum (${fmtUSD(carrier.minCoverage)})`);
  }

  if (data.age && carrier.maxIssueAge && data.age > carrier.maxIssueAge) {
    flags.push(`Age ${data.age} exceeds maximum (${carrier.maxIssueAge})`);
  }

  if (data.tobaccoUse && data.tobaccoUse === "Yes" && data.tobaccoYears !== null) {
    if (data.tobaccoYears < carrier.tobaccoLookbackYears) {
      notes.push(`Tobacco use within ${carrier.tobaccoLookbackYears} years → likely Tobacco class.`);
    } else {
      notes.push("Tobacco use beyond lookback → Non‑Tobacco class may be considered.");
    }
  }

  const decline = carrier.declineReasons(normalizeDataForRules(data));
  const eligible = decline.length === 0 && flags.length === 0;

  const checklist = buildChecklist(data);

  return { eligible, notes, flags, decline, checklist };
}

function normalizeDataForRules(d: any) {
  const coerceNum = (v: any) => (v === "" || v === undefined || v === null ? null : Number(v));
  return {
    age: coerceNum(d.age),
    duiYears: coerceNum(d.duiYears),
    felonyYears: coerceNum(d.felonyYears),
    bankruptcyYears: coerceNum(d.bankruptcyYears),
    cancerHistoryYears: coerceNum(d.cancerHistoryYears),
    heartEventYears: coerceNum(d.heartEventYears),
    bmi: coerceNum(d.bmi),
    insulinDependent: d.insulinDependent === "Yes",
    uncontrolledDiabetes: d.uncontrolledDiabetes === "Yes",
    uncontrolledHypertension: d.uncontrolledHypertension === "Yes",
    hazardousOccupation: d.hazardousOccupation === "Yes",
    avocationRisk: d.avocationRisk === "Yes",
    travelHighRisk: d.travelHighRisk === "Yes",
    copd: d.copd === "Yes",
  };
}

function buildChecklist(d: any) {
  const checklist = [
    "Government ID (driver's license or passport)",
    "Proof of income (last 2 pay stubs or last 2 years 1099/W-2)",
    "Beneficiary information",
  ];
  if (Number(d.coverage) >= 1000000) checklist.push("Financial justification (income + assets)");
  if (d.medications?.trim()) checklist.push("Medication list with dosages");
  if (d.doctorNames?.trim()) checklist.push("Primary/attending physician contact");
  if (d.productType === "IUL") checklist.push("Product illustration acknowledgment");
  if (d.travelHighRisk === "Yes") checklist.push("Travel questionnaire");
  if (d.avocationRisk === "Yes") checklist.push("Avocation questionnaire");
  if (d.hazardousOccupation === "Yes") checklist.push("Occupational risk questionnaire");
  return checklist;
}

export function generateCarrierAnalysisText(data: any): string {
  const results = CARRIER_RULES.map((carrier) => ({
    carrier,
    ...evaluateCarrier(carrier, data),
  }));

  let analysis = "";
  
  for (const { carrier, eligible, flags, notes, decline, checklist } of results) {
    analysis += `\n**${carrier.name}**\n`;
    analysis += `Status: ${eligible ? "✅ Potentially Eligible" : "⚠️ Needs Review"}\n\n`;
    
    if (decline.length > 0) {
      analysis += "Potential Decline Triggers:\n";
      decline.forEach((r: string) => {
        analysis += `  • ${r}\n`;
      });
      analysis += "\n";
    }
    
    if (flags.length > 0) {
      analysis += "Program Flags:\n";
      flags.forEach((r: string) => {
        analysis += `  • ${r}\n`;
      });
      analysis += "\n";
    }
    
    if (notes.length > 0) {
      analysis += "Underwriting Notes:\n";
      notes.forEach((r: string) => {
        analysis += `  • ${r}\n`;
      });
      analysis += "\n";
    }
    
    analysis += "Document Checklist:\n";
    checklist.forEach((r: string) => {
      analysis += `  • ${r}\n`;
    });
    analysis += "\n";
  }
  
  return analysis;
}

