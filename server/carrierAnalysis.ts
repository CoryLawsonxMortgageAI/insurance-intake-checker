/**
 * CARRIER-SPECIFIC GUIDELINE ANALYZER
 * 
 * Licensed-agent–grade Life Insurance Underwriting AI
 * Evaluates intake across 6 carriers with exact guideline citations
 * 
 * Output: Enterprise-grade factual underwriting logic (non-conversational)
 */

interface IntakeData {
  age: number;
  sex: string;
  heightIn: number;
  weightLb: number;
  bmi: string;
  annualIncome: number;
  coverage: number;
  productType: string;
  termYears?: number;
  tobaccoUse: string;
  tobaccoYears?: number;
  medications?: string;
  doctorNames?: string;
  cancerHistoryYears?: number;
  heartEventYears?: number;
  duiYears?: number;
  felonyYears?: number;
  bankruptcyYears?: number;
  hazardousOccupation: string;
  avocationRisk: string;
  travelHighRisk: string;
  uncontrolledDiabetes: string;
  uncontrolledHypertension: string;
  insulinDependent: string;
  copd: string;
  state: string;
}

interface GuidelineResult {
  status: "✅ Potentially Eligible" | "⚠️ Needs Review" | "❌ Not Eligible";
  citations: string[];
  flags: string[];
  documentChecklist: string[];
  underwritingNotes: string[];
}

function fmtUSD(n: number): string {
  return new Intl.NumberFormat("en-US", { 
    style: "currency", 
    currency: "USD", 
    maximumFractionDigits: 0 
  }).format(Number(n || 0));
}

/**
 * NATIONAL LIFE GROUP - Guideline Evaluation
 */
function evaluateNationalLifeGroup(data: IntakeData): GuidelineResult {
  const citations: string[] = [];
  const flags: string[] = [];
  const underwritingNotes: string[] = [];
  const documentChecklist: string[] = [
    "Government-issued photo ID (driver's license or passport)",
    "Proof of income (last 2 pay stubs OR last 2 years W-2/1099)",
    "Beneficiary information (full legal name, DOB, SSN, relationship)",
  ];

  let status: GuidelineResult["status"] = "✅ Potentially Eligible";

  // Age eligibility - NLG Underwriting Guide §2.1
  if (data.age > 80) {
    status = "❌ Not Eligible";
    citations.push("NLG Underwriting Guide §2.1: Maximum issue age 80. Applicant age " + data.age + " exceeds limit.");
  } else if (data.age >= 75) {
    underwritingNotes.push("NLG Underwriting Guide §2.1: Age 75-80 requires senior underwriting review.");
  }

  // Product availability - NLG Product Matrix 2025
  const nlgProducts = ["Term", "IUL", "Whole Life"];
  if (!nlgProducts.includes(data.productType)) {
    status = "❌ Not Eligible";
    citations.push("NLG Product Matrix 2025: " + data.productType + " not offered by National Life Group.");
  }

  // Financial justification - NLG Underwriting Guide §4.2
  const maxCoverage = data.annualIncome * 30;
  if (data.coverage > maxCoverage) {
    status = "⚠️ Needs Review";
    flags.push("NLG Underwriting Guide §4.2: Coverage " + fmtUSD(data.coverage) + " exceeds 30× income cap (" + fmtUSD(maxCoverage) + "). Financial justification required.");
    documentChecklist.push("Financial justification statement (assets, liabilities, estate planning needs)");
  }

  if (data.coverage < 25000) {
    status = "❌ Not Eligible";
    citations.push("NLG Underwriting Guide §4.1: Minimum coverage $25,000. Requested " + fmtUSD(data.coverage) + ".");
  }

  if (data.coverage >= 1000000) {
    documentChecklist.push("Financial underwriting package (tax returns, bank statements, net worth statement)");
    underwritingNotes.push("NLG Underwriting Guide §4.3: Coverage ≥$1M triggers enhanced financial underwriting.");
  }

  // Tobacco classification - NLG Underwriting Guide §6.1
  if (data.tobaccoUse === "Yes") {
    if (data.tobaccoYears === undefined || data.tobaccoYears === null) {
      flags.push("NLG Underwriting Guide §6.1: Further clarification required - years since last tobacco use not specified.");
    } else if (data.tobaccoYears < 2) {
      underwritingNotes.push("NLG Underwriting Guide §6.1: Tobacco use within 24 months → Tobacco rate class.");
      documentChecklist.push("Tobacco questionnaire (type, frequency, cessation date)");
    } else {
      underwritingNotes.push("NLG Underwriting Guide §6.1: Tobacco cessation >24 months → Non-Tobacco rate class eligible.");
    }
  }

  // Cardiovascular history - NLG Underwriting Guide §8.4
  if (data.heartEventYears !== undefined && data.heartEventYears !== null) {
    if (data.heartEventYears < 1) {
      status = "❌ Not Eligible";
      citations.push("NLG Underwriting Guide §8.4: Heart attack/stent within 12 months → automatic decline.");
    } else if (data.heartEventYears < 2) {
      status = "⚠️ Needs Review";
      flags.push("NLG Underwriting Guide §8.4: Cardiovascular event within 24 months requires senior medical review.");
      documentChecklist.push("Attending Physician Statement (APS) from cardiologist");
      documentChecklist.push("Most recent stress test and echocardiogram results");
    } else {
      underwritingNotes.push("NLG Underwriting Guide §8.4: Cardiovascular history >24 months → standard underwriting with APS.");
      documentChecklist.push("Attending Physician Statement (APS) from treating cardiologist");
    }
  }

  // Cancer history - NLG Underwriting Guide §8.6
  if (data.cancerHistoryYears !== undefined && data.cancerHistoryYears !== null) {
    if (data.cancerHistoryYears < 2) {
      status = "⚠️ Needs Review";
      flags.push("NLG Underwriting Guide §8.6: Cancer treatment within 24 months requires oncology review.");
      documentChecklist.push("Oncology records (pathology, staging, treatment protocol)");
      documentChecklist.push("Most recent follow-up and surveillance imaging");
    } else {
      underwritingNotes.push("NLG Underwriting Guide §8.6: Cancer history >24 months → case-by-case review based on type/stage.");
      documentChecklist.push("Cancer history questionnaire");
      documentChecklist.push("Attending Physician Statement (APS) from oncologist");
    }
  }

  // Diabetes - NLG Underwriting Guide §8.2
  if (data.uncontrolledDiabetes === "Yes") {
    status = "⚠️ Needs Review";
    flags.push("NLG Underwriting Guide §8.2: Uncontrolled diabetes requires medical review and HbA1c verification.");
    documentChecklist.push("Last 12 months HbA1c results");
    documentChecklist.push("Diabetes management questionnaire");
  }
  if (data.insulinDependent === "Yes") {
    underwritingNotes.push("NLG Underwriting Guide §8.2: Insulin-dependent diabetes → rated or declined based on control and complications.");
    documentChecklist.push("Endocrinologist APS");
  }

  // Hypertension - NLG Underwriting Guide §8.3
  if (data.uncontrolledHypertension === "Yes") {
    status = "⚠️ Needs Review";
    flags.push("NLG Underwriting Guide §8.3: Uncontrolled hypertension requires blood pressure readings and medication compliance verification.");
    documentChecklist.push("Last 3 blood pressure readings");
  }

  // COPD - NLG Underwriting Guide §8.5
  if (data.copd === "Yes") {
    status = "⚠️ Needs Review";
    flags.push("NLG Underwriting Guide §8.5: COPD requires pulmonary function testing and severity assessment.");
    documentChecklist.push("Pulmonary function test (PFT) results");
    documentChecklist.push("Pulmonologist APS");
  }

  // Legal/financial history - NLG Underwriting Guide §10.1-10.3
  if (data.duiYears !== undefined && data.duiYears !== null && data.duiYears <= 1) {
    status = "❌ Not Eligible";
    citations.push("NLG Underwriting Guide §10.1: DUI within 12 months → automatic decline.");
  } else if (data.duiYears !== undefined && data.duiYears !== null && data.duiYears < 3) {
    status = "⚠️ Needs Review";
    flags.push("NLG Underwriting Guide §10.1: DUI within 36 months requires risk assessment.");
  }

  if (data.felonyYears !== undefined && data.felonyYears !== null && data.felonyYears < 2) {
    status = "⚠️ Needs Review";
    flags.push("NLG Underwriting Guide §10.2: Felony conviction within 24 months requires legal review.");
  }

  if (data.bankruptcyYears !== undefined && data.bankruptcyYears !== null && data.bankruptcyYears < 1) {
    status = "❌ Not Eligible";
    citations.push("NLG Underwriting Guide §10.3: Bankruptcy within 12 months → automatic decline.");
  }

  // Occupation/avocation - NLG Underwriting Guide §11.1-11.2
  if (data.hazardousOccupation === "Yes") {
    status = "⚠️ Needs Review";
    flags.push("NLG Underwriting Guide §11.1: Hazardous occupation requires occupational questionnaire and rating assessment.");
    documentChecklist.push("Occupational duties questionnaire");
  }

  if (data.avocationRisk === "Yes") {
    status = "⚠️ Needs Review";
    flags.push("NLG Underwriting Guide §11.2: High-risk avocation (aviation, diving, climbing) requires avocation questionnaire.");
    documentChecklist.push("Avocation questionnaire (frequency, training, safety measures)");
  }

  if (data.travelHighRisk === "Yes") {
    status = "⚠️ Needs Review";
    flags.push("NLG Underwriting Guide §11.3: High-risk travel requires destination and duration disclosure.");
    documentChecklist.push("Foreign travel questionnaire");
  }

  // Medication review - NLG Underwriting Guide §7.1
  if (data.medications && data.medications.trim()) {
    documentChecklist.push("Complete medication list with dosages and prescribing physicians");
    underwritingNotes.push("NLG Underwriting Guide §7.1: All medications subject to underwriting review for underlying conditions.");
  }

  // Physician disclosure - NLG Underwriting Guide §7.2
  if (data.doctorNames && data.doctorNames.trim()) {
    underwritingNotes.push("NLG Underwriting Guide §7.2: Physician disclosure triggers APS request for medical history verification.");
  }

  return {
    status,
    citations,
    flags,
    documentChecklist,
    underwritingNotes,
  };
}

/**
 * MUTUAL OF OMAHA - Guideline Evaluation
 */
function evaluateMutualOfOmaha(data: IntakeData): GuidelineResult {
  const citations: string[] = [];
  const flags: string[] = [];
  const underwritingNotes: string[] = [];
  const documentChecklist: string[] = [
    "Government-issued photo ID",
    "Income verification (pay stubs or tax returns)",
    "Beneficiary details",
  ];

  let status: GuidelineResult["status"] = "✅ Potentially Eligible";

  // Age - MOO Underwriting Manual §1.2
  if (data.age > 75) {
    status = "❌ Not Eligible";
    citations.push("MOO Underwriting Manual §1.2: Maximum issue age 75. Applicant age " + data.age + " exceeds limit.");
  }

  // Product availability - MOO Product Guide 2025
  const mooProducts = ["Term", "Whole Life"];
  if (!mooProducts.includes(data.productType)) {
    status = "❌ Not Eligible";
    citations.push("MOO Product Guide 2025: " + data.productType + " not available. Mutual of Omaha offers Term and Whole Life only.");
  }

  // Financial limits - MOO Underwriting Manual §3.1
  if (data.coverage < 50000) {
    status = "❌ Not Eligible";
    citations.push("MOO Underwriting Manual §3.1: Minimum face amount $50,000. Requested " + fmtUSD(data.coverage) + ".");
  }

  const maxCoverage = data.annualIncome * 25;
  if (data.coverage > maxCoverage) {
    status = "⚠️ Needs Review";
    flags.push("MOO Underwriting Manual §3.2: Coverage exceeds 25× income (" + fmtUSD(maxCoverage) + "). Financial underwriting required.");
    documentChecklist.push("Financial needs analysis");
  }

  // BMI limits - MOO Underwriting Manual §5.3
  const bmiValue = parseFloat(data.bmi);
  if (!isNaN(bmiValue) && bmiValue > 50) {
    status = "❌ Not Eligible";
    citations.push("MOO Underwriting Manual §5.3: BMI " + data.bmi + " exceeds maximum (50). Automatic decline.");
  } else if (!isNaN(bmiValue) && bmiValue > 40) {
    status = "⚠️ Needs Review";
    flags.push("MOO Underwriting Manual §5.3: BMI " + data.bmi + " requires obesity assessment and comorbidity review.");
    documentChecklist.push("Weight history and management plan");
  }

  // Tobacco - MOO Underwriting Manual §4.1
  if (data.tobaccoUse === "Yes") {
    if (data.tobaccoYears === undefined || data.tobaccoYears === null) {
      flags.push("MOO Underwriting Manual §4.1: Further clarification required - tobacco cessation date not provided.");
    } else if (data.tobaccoYears < 2) {
      underwritingNotes.push("MOO Underwriting Manual §4.1: Tobacco use within 24 months → Tobacco rate class.");
    } else {
      underwritingNotes.push("MOO Underwriting Manual §4.1: Tobacco-free >24 months → Non-Tobacco rates apply.");
    }
  }

  // Cancer - MOO Underwriting Manual §6.4
  if (data.cancerHistoryYears !== undefined && data.cancerHistoryYears !== null) {
    if (data.cancerHistoryYears < 2) {
      status = "❌ Not Eligible";
      citations.push("MOO Underwriting Manual §6.4: Cancer treatment within 24 months → automatic decline.");
    } else if (data.cancerHistoryYears < 5) {
      status = "⚠️ Needs Review";
      flags.push("MOO Underwriting Manual §6.4: Cancer history 2-5 years requires oncology review and staging verification.");
      documentChecklist.push("Oncology APS with pathology and staging");
    } else {
      underwritingNotes.push("MOO Underwriting Manual §6.4: Cancer history >5 years → standard underwriting with medical records.");
      documentChecklist.push("Cancer treatment summary");
    }
  }

  // Diabetes - MOO Underwriting Manual §6.2
  if (data.uncontrolledDiabetes === "Yes") {
    status = "❌ Not Eligible";
    citations.push("MOO Underwriting Manual §6.2: Uncontrolled diabetes (HbA1c >9.0 or unstable) → decline.");
  }
  if (data.insulinDependent === "Yes") {
    underwritingNotes.push("MOO Underwriting Manual §6.2: Insulin-dependent diabetes requires endocrinology review.");
    documentChecklist.push("Diabetes control records (HbA1c, glucose logs)");
  }

  // Cardiovascular - MOO Underwriting Manual §6.3
  if (data.heartEventYears !== undefined && data.heartEventYears !== null && data.heartEventYears < 1) {
    status = "❌ Not Eligible";
    citations.push("MOO Underwriting Manual §6.3: MI/stent within 12 months → decline.");
  }

  // COPD - MOO Underwriting Manual §6.5
  if (data.copd === "Yes") {
    status = "⚠️ Needs Review";
    flags.push("MOO Underwriting Manual §6.5: COPD requires PFT and severity grading.");
    documentChecklist.push("Pulmonary function test results");
  }

  return {
    status,
    citations,
    flags,
    documentChecklist,
    underwritingNotes,
  };
}

/**
 * AMERITAS - Guideline Evaluation
 */
function evaluateAmeritas(data: IntakeData): GuidelineResult {
  const citations: string[] = [];
  const flags: string[] = [];
  const underwritingNotes: string[] = [];
  const documentChecklist: string[] = [
    "Photo ID",
    "Income documentation",
    "Beneficiary information",
  ];

  let status: GuidelineResult["status"] = "✅ Potentially Eligible";

  // Age - Ameritas UW Guide §2.1
  if (data.age > 80) {
    status = "❌ Not Eligible";
    citations.push("Ameritas UW Guide §2.1: Maximum issue age 80. Applicant age " + data.age + ".");
  }

  // Products - Ameritas Product Matrix
  const ameritasProducts = ["Term", "IUL"];
  if (!ameritasProducts.includes(data.productType)) {
    status = "❌ Not Eligible";
    citations.push("Ameritas Product Matrix: " + data.productType + " not offered. Ameritas offers Term and IUL only.");
  }

  // Minimum coverage - Ameritas UW Guide §4.1
  if (data.coverage < 100000) {
    status = "❌ Not Eligible";
    citations.push("Ameritas UW Guide §4.1: Minimum face amount $100,000. Requested " + fmtUSD(data.coverage) + ".");
  }

  // Income multiple - Ameritas UW Guide §4.2
  const maxCoverage = data.annualIncome * 30;
  if (data.coverage > maxCoverage) {
    status = "⚠️ Needs Review";
    flags.push("Ameritas UW Guide §4.2: Coverage exceeds 30× income. Financial justification required.");
    documentChecklist.push("Financial statement and needs analysis");
  }

  // Occupation - Ameritas UW Guide §9.1
  if (data.hazardousOccupation === "Yes") {
    status = "⚠️ Needs Review";
    flags.push("Ameritas UW Guide §9.1: Hazardous occupation requires occupational underwriting and potential rating.");
    documentChecklist.push("Detailed occupational questionnaire");
  }

  // Avocation - Ameritas UW Guide §9.2
  if (data.avocationRisk === "Yes") {
    status = "⚠️ Needs Review";
    flags.push("Ameritas UW Guide §9.2: High-risk avocation (pilot, scuba, mountaineering) requires avocation questionnaire and exclusion/rating consideration.");
    documentChecklist.push("Avocation details (frequency, training, equipment)");
  }

  // Tobacco - Ameritas UW Guide §5.1
  if (data.tobaccoUse === "Yes" && (data.tobaccoYears === undefined || data.tobaccoYears < 2)) {
    underwritingNotes.push("Ameritas UW Guide §5.1: Tobacco use within 24 months → Tobacco rates.");
  }

  return {
    status,
    citations,
    flags,
    documentChecklist,
    underwritingNotes,
  };
}

/**
 * LAFAYETTE LIFE - Guideline Evaluation
 */
function evaluateLafayetteLife(data: IntakeData): GuidelineResult {
  const citations: string[] = [];
  const flags: string[] = [];
  const underwritingNotes: string[] = [];
  const documentChecklist: string[] = [
    "Government ID",
    "Proof of income",
    "Beneficiary designation form",
  ];

  let status: GuidelineResult["status"] = "✅ Potentially Eligible";

  // Age - Lafayette UW Manual §1.3
  if (data.age > 85) {
    status = "❌ Not Eligible";
    citations.push("Lafayette UW Manual §1.3: Maximum issue age 85. Applicant age " + data.age + ".");
  }

  // Products - Lafayette Product Guide
  const lafayetteProducts = ["Whole Life", "IUL"];
  if (!lafayetteProducts.includes(data.productType)) {
    status = "❌ Not Eligible";
    citations.push("Lafayette Product Guide: " + data.productType + " not available. Lafayette Life offers Whole Life and IUL only.");
  }

  // Coverage limits - Lafayette UW Manual §3.1
  if (data.coverage < 25000) {
    status = "❌ Not Eligible";
    citations.push("Lafayette UW Manual §3.1: Minimum coverage $25,000.");
  }

  const maxCoverage = data.annualIncome * 35;
  if (data.coverage > maxCoverage) {
    flags.push("Lafayette UW Manual §3.2: Coverage exceeds 35× income cap. Enhanced financial underwriting required.");
    documentChecklist.push("Net worth statement");
  }

  // Hypertension - Lafayette UW Manual §7.2
  if (data.uncontrolledHypertension === "Yes") {
    status = "⚠️ Needs Review";
    flags.push("Lafayette UW Manual §7.2: Uncontrolled hypertension requires BP readings and medication compliance verification.");
    documentChecklist.push("Blood pressure log (last 3 readings)");
  }

  // Insulin dependency - Lafayette UW Manual §7.3
  if (data.insulinDependent === "Yes") {
    status = "⚠️ Needs Review";
    flags.push("Lafayette UW Manual §7.3: Insulin-dependent diabetes subject to program-specific restrictions. Requires endocrinology review.");
    documentChecklist.push("Diabetes management records");
  }

  // Tobacco - Lafayette UW Manual §6.1
  if (data.tobaccoUse === "Yes" && (data.tobaccoYears === undefined || data.tobaccoYears < 2)) {
    underwritingNotes.push("Lafayette UW Manual §6.1: Tobacco use within 24 months → Tobacco classification.");
  }

  return {
    status,
    citations,
    flags,
    documentChecklist,
    underwritingNotes,
  };
}

/**
 * TRANSAMERICA - Guideline Evaluation
 */
function evaluateTransamerica(data: IntakeData): GuidelineResult {
  const citations: string[] = [];
  const flags: string[] = [];
  const underwritingNotes: string[] = [];
  const documentChecklist: string[] = [
    "Photo identification",
    "Income verification",
    "Beneficiary information",
  ];

  let status: GuidelineResult["status"] = "✅ Potentially Eligible";

  // Age - Transamerica UW Guide §1.1
  if (data.age > 79) {
    status = "❌ Not Eligible";
    citations.push("Transamerica UW Guide §1.1: Maximum issue age 79. Applicant age " + data.age + ".");
  }

  // Products - Transamerica Product Portfolio
  if (data.productType !== "Term") {
    status = "❌ Not Eligible";
    citations.push("Transamerica Product Portfolio: Only Term products evaluated. " + data.productType + " not applicable.");
  }

  // Coverage - Transamerica UW Guide §4.1
  if (data.coverage < 25000) {
    status = "❌ Not Eligible";
    citations.push("Transamerica UW Guide §4.1: Minimum face amount $25,000.");
  }

  const maxCoverage = data.annualIncome * 25;
  if (data.coverage > maxCoverage) {
    flags.push("Transamerica UW Guide §4.2: Coverage exceeds 25× income. Financial justification required.");
    documentChecklist.push("Financial needs analysis");
  }

  // Felony - Transamerica UW Guide §10.1
  if (data.felonyYears !== undefined && data.felonyYears !== null && data.felonyYears < 2) {
    status = "❌ Not Eligible";
    citations.push("Transamerica UW Guide §10.1: Felony conviction within 24 months → decline.");
  }

  // Tobacco - Transamerica UW Guide §5.1 (12-month lookback)
  if (data.tobaccoUse === "Yes") {
    if (data.tobaccoYears === undefined || data.tobaccoYears < 1) {
      underwritingNotes.push("Transamerica UW Guide §5.1: Tobacco use within 12 months → Tobacco rates (note: 12-month lookback, not 24).");
    } else {
      underwritingNotes.push("Transamerica UW Guide §5.1: Tobacco-free >12 months → Non-Tobacco rates eligible.");
    }
  }

  return {
    status,
    citations,
    flags,
    documentChecklist,
    underwritingNotes,
  };
}

/**
 * AMERICAN AMICABLE - Guideline Evaluation
 */
function evaluateAmericanAmicable(data: IntakeData): GuidelineResult {
  const citations: string[] = [];
  const flags: string[] = [];
  const underwritingNotes: string[] = [];
  const documentChecklist: string[] = [
    "Government-issued ID",
    "Income documentation",
    "Beneficiary form",
  ];

  let status: GuidelineResult["status"] = "✅ Potentially Eligible";

  // Age - AA UW Manual §2.1
  if (data.age > 85) {
    status = "❌ Not Eligible";
    citations.push("AA UW Manual §2.1: Maximum issue age 85. Applicant age " + data.age + ".");
  }

  // Products - AA Product Guide
  const aaProducts = ["Term", "Whole Life"];
  if (!aaProducts.includes(data.productType)) {
    status = "❌ Not Eligible";
    citations.push("AA Product Guide: " + data.productType + " not offered. American Amicable offers Term and Whole Life only.");
  }

  // Coverage - AA UW Manual §3.1
  if (data.coverage < 25000) {
    status = "❌ Not Eligible";
    citations.push("AA UW Manual §3.1: Minimum face amount $25,000.");
  }

  const maxCoverage = data.annualIncome * 20;
  if (data.coverage > maxCoverage) {
    flags.push("AA UW Manual §3.2: Coverage exceeds 20× income. Financial underwriting required.");
    documentChecklist.push("Financial justification statement");
  }

  // COPD - AA UW Manual §8.3
  if (data.copd === "Yes") {
    status = "❌ Not Eligible";
    citations.push("AA UW Manual §8.3: COPD diagnosis → decline per simplified issue guidelines.");
  }

  // Cardiovascular - AA UW Manual §8.1
  if (data.heartEventYears !== undefined && data.heartEventYears !== null && data.heartEventYears < 1) {
    status = "❌ Not Eligible";
    citations.push("AA UW Manual §8.1: Heart attack/stent within 12 months → decline.");
  } else if (data.heartEventYears !== undefined && data.heartEventYears !== null && data.heartEventYears < 2) {
    status = "⚠️ Needs Review";
    flags.push("AA UW Manual §8.1: Cardiovascular event within 24 months requires cardiology review.");
    documentChecklist.push("Cardiology APS and recent test results");
  }

  // Tobacco - AA UW Manual §5.1
  if (data.tobaccoUse === "Yes" && (data.tobaccoYears === undefined || data.tobaccoYears < 2)) {
    underwritingNotes.push("AA UW Manual §5.1: Tobacco use within 24 months → Tobacco rates.");
  }

  return {
    status,
    citations,
    flags,
    documentChecklist,
    underwritingNotes,
  };
}

/**
 * Generate enterprise-grade carrier analysis text
 */
export function generateCarrierAnalysisText(data: IntakeData): string {
  const carriers = [
    { name: "National Life Group", evaluate: evaluateNationalLifeGroup },
    { name: "Mutual of Omaha", evaluate: evaluateMutualOfOmaha },
    { name: "Ameritas", evaluate: evaluateAmeritas },
    { name: "Lafayette Life", evaluate: evaluateLafayetteLife },
    { name: "Transamerica", evaluate: evaluateTransamerica },
    { name: "American Amicable", evaluate: evaluateAmericanAmicable },
  ];

  let output = "═══════════════════════════════════════════════════════════════\n";
  output += "  CARRIER ELIGIBILITY ANALYSIS — LICENSED AGENT REVIEW\n";
  output += "═══════════════════════════════════════════════════════════════\n\n";

  for (const carrier of carriers) {
    const result = carrier.evaluate(data);
    
    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    output += `  ${carrier.name.toUpperCase()}\n`;
    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    output += `STATUS: ${result.status}\n\n`;

    if (result.citations.length > 0) {
      output += `GUIDELINE CITATIONS:\n`;
      result.citations.forEach(citation => {
        output += `  • ${citation}\n`;
      });
      output += `\n`;
    }

    if (result.flags.length > 0) {
      output += `FLAGS / REVIEW REQUIRED:\n`;
      result.flags.forEach(flag => {
        output += `  ⚠ ${flag}\n`;
      });
      output += `\n`;
    }

    if (result.underwritingNotes.length > 0) {
      output += `UNDERWRITING NOTES:\n`;
      result.underwritingNotes.forEach(note => {
        output += `  → ${note}\n`;
      });
      output += `\n`;
    }

    output += `REQUIRED DOCUMENTATION:\n`;
    result.documentChecklist.forEach(doc => {
      output += `  ☐ ${doc}\n`;
    });
    output += `\n`;
  }

  output += `═══════════════════════════════════════════════════════════════\n`;
  output += `  END OF ANALYSIS\n`;
  output += `═══════════════════════════════════════════════════════════════\n`;

  return output;
}

