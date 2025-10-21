import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, FileText, ClipboardList, Search } from "lucide-react";

/**
 * Insurance Carrier Guidelines Checker – Single-file React App
 * ------------------------------------------------------------------
 * What this does
 * - Presents a client-facing intake questionnaire
 * - Runs a lightweight rules engine against embedded carrier guidelines
 * - Produces an eligibility summary, flags, and a document checklist
 */

// ---------------------------
// Example Carrier Rule Set
// ---------------------------
const CARRIER_RULES = [
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

// ---------------------------
// Lightweight rules engine
// ---------------------------
function evaluateCarrier(carrier: any, data: any): { eligible: boolean; notes: string[]; flags: string[]; decline: string[]; checklist: string[] } {
  const notes = [];
  const flags = [];

  // Basic product availability
  if (!carrier.products.includes(data.productType)) {
    flags.push(`Product not offered: ${data.productType}`);
  }

  // Coverage sanity using income multiple
  if (data.coverage && data.annualIncome && carrier.maxCoverageMultiplierOfIncome) {
    const cap = data.annualIncome * carrier.maxCoverageMultiplierOfIncome;
    if (data.coverage > cap) {
      flags.push(
        `Coverage (${fmtUSD(data.coverage)}) exceeds ${carrier.name}'s income multiple cap (${carrier.maxCoverageMultiplierOfIncome}× = ${fmtUSD(cap)})`
      );
    }
  }

  // Min coverage
  if (data.coverage && carrier.minCoverage && data.coverage < carrier.minCoverage) {
    flags.push(`Coverage below minimum (${fmtUSD(carrier.minCoverage)})`);
  }

  // Max age
  if (data.age && carrier.maxIssueAge && data.age > carrier.maxIssueAge) {
    flags.push(`Age ${data.age} exceeds maximum (${carrier.maxIssueAge})`);
  }

  // Tobacco lookback
  if (data.tobaccoUse && data.tobaccoUse === "Yes" && data.tobaccoYears !== null) {
    if (data.tobaccoYears < carrier.tobaccoLookbackYears) {
      notes.push(
        `Tobacco use within ${carrier.tobaccoLookbackYears} years → likely Tobacco class.`
      );
    } else {
      notes.push("Tobacco use beyond lookback → Non‑Tobacco class may be considered.");
    }
  }

  // Custom decline reasons
  const decline = carrier.declineReasons(normalizeDataForRules(data));
  const eligible = decline.length === 0;

  // Build document checklist
  const checklist = buildChecklist(data);

  return { eligible, notes, flags, decline, checklist };
}

function normalizeDataForRules(d: any) {
  const coerceNum = (v: any) => (v === "" || v === undefined ? null : Number(v));
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

function fmtUSD(n: any) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(n || 0));
}

// ---------------------------
// UI Components
// ---------------------------
const Field = ({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-1">
      {label} {required && <span className="text-red-600">*</span>}
    </label>
    {children}
  </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`w-full rounded-2xl border p-2 outline-none focus:ring-2 shadow-sm ${props.className || ""}`} />
);

const Select = ({ value, onChange, options }: { value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[] }) => (
  <select value={value} onChange={onChange} className="w-full rounded-2xl border p-2 outline-none focus:ring-2 shadow-sm">
    {options.map((o) => (
      <option key={o} value={o}>{o}</option>
    ))}
  </select>
);

export default function Home() {
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    state: "OH",
    age: "",
    sex: "Male",
    heightIn: "70",
    weightLb: "190",
    annualIncome: "80000",
    coverage: "500000",
    productType: "Term",
    termYears: "30",
    tobaccoUse: "No",
    tobaccoYears: "",
    medications: "",
    doctorNames: "",
    cancerHistoryYears: "",
    heartEventYears: "",
    duiYears: "",
    felonyYears: "",
    bankruptcyYears: "",
    hazardousOccupation: "No",
    avocationRisk: "No",
    travelHighRisk: "No",
    uncontrolledDiabetes: "No",
    uncontrolledHypertension: "No",
    insulinDependent: "No",
    copd: "No",
  });

  const bmi = useMemo(() => {
    const h = Number(data.heightIn || 0);
    const w = Number(data.weightLb || 0);
    if (!h || !w) return "";
    return ((w / (h * h)) * 703).toFixed(1);
  }, [data.heightIn, data.weightLb]);

  const results = useMemo(() => {
    const enriched = { ...data, bmi };
    return CARRIER_RULES.map((carrier) => ({ carrier, ...evaluateCarrier(carrier, enriched) }));
  }, [data, bmi]);

  const on = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setData((s) => ({ ...s, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Intake Panel */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow p-6">
          <h1 className="text-2xl font-semibold mb-1">Client Intake – Life Insurance</h1>
          <p className="text-sm text-gray-600 mb-4">Complete all required fields. A licensed agent will validate and submit to carriers.</p>

          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name" required><Input value={data.firstName} onChange={on("firstName")} /></Field>
            <Field label="Last Name" required><Input value={data.lastName} onChange={on("lastName")} /></Field>
            <Field label="Email" required><Input type="email" value={data.email} onChange={on("email")} /></Field>
            <Field label="Phone"><Input value={data.phone} onChange={on("phone")} /></Field>
            <Field label="State" required><Input value={data.state} onChange={on("state")} /></Field>
            <Field label="Age" required><Input type="number" min="0" value={data.age} onChange={on("age")} /></Field>
            <Field label="Sex"><Select value={data.sex} onChange={on("sex")} options={["Male","Female","Other"]} /></Field>
            <Field label="Annual Income ($)" required><Input type="number" value={data.annualIncome} onChange={on("annualIncome")} /></Field>
            <Field label="Coverage Amount ($)" required><Input type="number" value={data.coverage} onChange={on("coverage")} /></Field>
            <Field label="Product Type" required><Select value={data.productType} onChange={on("productType")} options={["Term","Whole Life","IUL"]} /></Field>
            <Field label="Term Length (years)"><Input type="number" value={data.termYears} onChange={on("termYears")} /></Field>
            <Field label="Height (in)"><Input type="number" value={data.heightIn} onChange={on("heightIn")} /></Field>
            <Field label="Weight (lb)"><Input type="number" value={data.weightLb} onChange={on("weightLb")} /></Field>
            <Field label="BMI (auto)"><Input value={bmi} readOnly /></Field>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label="Tobacco use in last 24 months?">
              <Select value={data.tobaccoUse} onChange={on("tobaccoUse")} options={["No","Yes"]} />
            </Field>
            {data.tobaccoUse === "Yes" && (
              <Field label="If yes, how many years since last use?">
                <Input type="number" value={data.tobaccoYears} onChange={on("tobaccoYears")} />
              </Field>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label="Cancer treatment – years since last?"><Input type="number" value={data.cancerHistoryYears} onChange={on("cancerHistoryYears")} /></Field>
            <Field label="Heart attack/stent – years since?"><Input type="number" value={data.heartEventYears} onChange={on("heartEventYears")} /></Field>
            <Field label="DUI – years since last?"><Input type="number" value={data.duiYears} onChange={on("duiYears")} /></Field>
            <Field label="Felony – years since conviction?"><Input type="number" value={data.felonyYears} onChange={on("felonyYears")} /></Field>
            <Field label="Bankruptcy – years since discharge?"><Input type="number" value={data.bankruptcyYears} onChange={on("bankruptcyYears")} /></Field>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label="Uncontrolled Diabetes?"><Select value={data.uncontrolledDiabetes} onChange={on("uncontrolledDiabetes")} options={["No","Yes"]} /></Field>
            <Field label="Uncontrolled Hypertension?"><Select value={data.uncontrolledHypertension} onChange={on("uncontrolledHypertension")} options={["No","Yes"]} /></Field>
            <Field label="Insulin-Dependent?"><Select value={data.insulinDependent} onChange={on("insulinDependent")} options={["No","Yes"]} /></Field>
            <Field label="COPD?"><Select value={data.copd} onChange={on("copd")} options={["No","Yes"]} /></Field>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label="Hazardous Occupation? (e.g., logging)"><Select value={data.hazardousOccupation} onChange={on("hazardousOccupation")} options={["No","Yes"]} /></Field>
            <Field label="Risky Avocation? (diving/aviation/climbing)"><Select value={data.avocationRisk} onChange={on("avocationRisk")} options={["No","Yes"]} /></Field>
            <Field label="High-Risk Travel Planned?"><Select value={data.travelHighRisk} onChange={on("travelHighRisk")} options={["No","Yes"]} /></Field>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <Field label="Current Medications (name & dosage)"><Input value={data.medications} onChange={on("medications")} placeholder="Metoprolol 50mg daily; ..." /></Field>
            <Field label="Primary/Attending Physician(s)"><Input value={data.doctorNames} onChange={on("doctorNames")} placeholder="Dr. Smith – OhioHealth; ..." /></Field>
          </div>
        </motion.div>

        {/* Results Panel */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Carrier Eligibility & Analysis</h2>
          </div>

          {results.map(({ carrier, eligible, flags, notes, decline, checklist }) => (
            <div key={carrier.id} className="border rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">{carrier.name}</div>
                {eligible ? (
                  <span className="inline-flex items-center gap-1 text-green-700"><CheckCircle className="w-5 h-5"/>Potentially Eligible</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-700"><AlertTriangle className="w-5 h-5"/>Needs Review</span>
                )}
              </div>

              {decline.length > 0 && (
                <div className="text-sm text-amber-800 bg-amber-50 rounded-xl p-3 mb-2">
                  <div className="font-medium mb-1">Potential Decline Triggers</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {decline.map((r: string, i: number) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}

              {flags.length > 0 && (
                <div className="text-sm text-red-800 bg-red-50 rounded-xl p-3 mb-2">
                  <div className="font-medium mb-1">Program Flags</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {flags.map((r: string, i: number) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}

              {notes.length > 0 && (
                <div className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3 mb-2">
                  <div className="font-medium mb-1">Underwriting Notes</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {notes.map((r: string, i: number) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}

              <div className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3">
                <div className="flex items-center gap-2 font-medium mb-1"><ClipboardList className="w-4 h-4"/> Document Checklist</div>
                <ul className="list-disc pl-5 space-y-1">
                  {checklist.map((r: string, i: number) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            </div>
          ))}

          <div className="text-xs text-gray-500 mt-4">
            Results are preliminary and for screening only. Final decisions follow the carrier's official underwriting guidelines, state availability, and product filings.
          </div>
        </motion.div>
      </div>

      {/* Printable Summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto mt-6 bg-white rounded-2xl shadow p-6">
        <div className="flex items-center gap-2 mb-3"><FileText className="w-5 h-5"/><h3 className="text-lg font-semibold">Case Summary (copy/paste into CRM)</h3></div>
        <pre className="whitespace-pre-wrap text-sm leading-6">
{`Client: ${data.firstName} ${data.lastName} | Age ${data.age} | State ${data.state}
Coverage: ${fmtUSD(data.coverage)} | Product: ${data.productType} ${data.termYears ? `(${data.termYears}yr)` : ""}
Income: ${fmtUSD(data.annualIncome)} | BMI: ${bmi || "n/a"}
Tobacco: ${data.tobaccoUse}${data.tobaccoUse === "Yes" && data.tobaccoYears ? ` – ${data.tobaccoYears} yrs since last use` : ""}
Medications: ${data.medications || "(none listed)"}
Physicians: ${data.doctorNames || "(none listed)"}
Flags/Notes are shown per carrier below.
`}
        </pre>
      </motion.div>
    </div>
  );
}

