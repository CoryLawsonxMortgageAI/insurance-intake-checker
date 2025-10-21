import { notifyOwner } from "./_core/notification";

interface IntakeSubmissionData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  state: string;
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
  carrierAnalysis: string;
}

function fmtUSD(n: number): string {
  return new Intl.NumberFormat(undefined, { 
    style: "currency", 
    currency: "USD", 
    maximumFractionDigits: 0 
  }).format(n || 0);
}

export async function sendIntakeNotification(data: IntakeSubmissionData): Promise<boolean> {
  const title = `🔔 New Insurance Intake Submission — ${data.firstName} ${data.lastName}`;
  
  const content = `
╔═══════════════════════════════════════════════════════════════╗
  LIFE INSURANCE INTAKE SUBMISSION
  Submitted: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST
╚═══════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  APPLICANT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Full Name:        ${data.firstName} ${data.lastName}
Email:            ${data.email}
Phone:            ${data.phone || "Not provided"}
State:            ${data.state}
Age:              ${data.age} years
Sex:              ${data.sex}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  COVERAGE REQUEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Product Type:     ${data.productType}${data.termYears ? ` (${data.termYears}-year term)` : ""}
Coverage Amount:  ${fmtUSD(data.coverage)}
Annual Income:    ${fmtUSD(data.annualIncome)}
Income Multiple:  ${(data.coverage / data.annualIncome).toFixed(1)}×

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PHYSICAL PROFILE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Height:           ${data.heightIn} inches (${Math.floor(data.heightIn / 12)}' ${data.heightIn % 12}")
Weight:           ${data.weightLb} lbs
BMI:              ${data.bmi}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  HEALTH & RISK ASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tobacco Use:                ${data.tobaccoUse}${data.tobaccoYears !== undefined && data.tobaccoYears !== null ? ` (${data.tobaccoYears} years since cessation)` : ""}
Uncontrolled Diabetes:      ${data.uncontrolledDiabetes}
Uncontrolled Hypertension:  ${data.uncontrolledHypertension}
Insulin Dependent:          ${data.insulinDependent}
COPD:                       ${data.copd}
Hazardous Occupation:       ${data.hazardousOccupation}
High-Risk Avocation:        ${data.avocationRisk}
High-Risk Travel:           ${data.travelHighRisk}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  MEDICAL & LEGAL HISTORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${data.cancerHistoryYears !== undefined && data.cancerHistoryYears !== null ? `Cancer Treatment:     ${data.cancerHistoryYears} years ago\n` : ""}${data.heartEventYears !== undefined && data.heartEventYears !== null ? `Cardiovascular Event: ${data.heartEventYears} years ago\n` : ""}${data.duiYears !== undefined && data.duiYears !== null ? `DUI Conviction:       ${data.duiYears} years ago\n` : ""}${data.felonyYears !== undefined && data.felonyYears !== null ? `Felony Conviction:    ${data.felonyYears} years ago\n` : ""}${data.bankruptcyYears !== undefined && data.bankruptcyYears !== null ? `Bankruptcy:           ${data.bankruptcyYears} years ago\n` : ""}${!data.cancerHistoryYears && !data.heartEventYears && !data.duiYears && !data.felonyYears && !data.bankruptcyYears ? "No significant medical or legal history disclosed.\n" : ""}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  MEDICATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${data.medications && data.medications.trim() ? data.medications : "None disclosed"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PHYSICIANS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${data.doctorNames && data.doctorNames.trim() ? data.doctorNames : "None disclosed"}


${data.carrierAnalysis}


╔═══════════════════════════════════════════════════════════════╗
  NEXT STEPS
╚═══════════════════════════════════════════════════════════════╝

1. Review carrier eligibility analysis above
2. Identify best-fit carriers based on applicant profile
3. Collect required documentation per carrier checklists
4. Contact applicant at ${data.email} or ${data.phone || "(phone not provided)"}
5. Proceed with formal application for selected carrier(s)

This submission has been saved to the database for record-keeping.

`;

  try {
    const result = await notifyOwner({ title, content });
    return result;
  } catch (error) {
    console.error("Failed to send intake notification:", error);
    return false;
  }
}

