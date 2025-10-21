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
  const title = `New Insurance Intake: ${data.firstName} ${data.lastName}`;
  
  const content = `
**Client Information**
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Phone: ${data.phone || "(not provided)"}
State: ${data.state}
Age: ${data.age}
Sex: ${data.sex}

**Coverage Details**
Product Type: ${data.productType}${data.termYears ? ` (${data.termYears} years)` : ""}
Coverage Amount: ${fmtUSD(data.coverage)}
Annual Income: ${fmtUSD(data.annualIncome)}

**Physical Metrics**
Height: ${data.heightIn} inches
Weight: ${data.weightLb} lbs
BMI: ${data.bmi}

**Health & Risk Factors**
Tobacco Use: ${data.tobaccoUse}${data.tobaccoYears ? ` (${data.tobaccoYears} years since last use)` : ""}
Uncontrolled Diabetes: ${data.uncontrolledDiabetes}
Uncontrolled Hypertension: ${data.uncontrolledHypertension}
Insulin Dependent: ${data.insulinDependent}
COPD: ${data.copd}
Hazardous Occupation: ${data.hazardousOccupation}
Risky Avocation: ${data.avocationRisk}
High-Risk Travel: ${data.travelHighRisk}

**Medical History**
${data.cancerHistoryYears !== undefined && data.cancerHistoryYears !== null ? `Cancer Treatment: ${data.cancerHistoryYears} years ago` : ""}
${data.heartEventYears !== undefined && data.heartEventYears !== null ? `Heart Event: ${data.heartEventYears} years ago` : ""}
${data.duiYears !== undefined && data.duiYears !== null ? `DUI: ${data.duiYears} years ago` : ""}
${data.felonyYears !== undefined && data.felonyYears !== null ? `Felony: ${data.felonyYears} years ago` : ""}
${data.bankruptcyYears !== undefined && data.bankruptcyYears !== null ? `Bankruptcy: ${data.bankruptcyYears} years ago` : ""}

**Medications**
${data.medications || "(none listed)"}

**Physicians**
${data.doctorNames || "(none listed)"}

---

**CARRIER ELIGIBILITY ANALYSIS**

${data.carrierAnalysis}

---

This intake was submitted via the online form and has been saved to the database.
`;

  try {
    const result = await notifyOwner({ title, content });
    return result;
  } catch (error) {
    console.error("Failed to send intake notification:", error);
    return false;
  }
}

