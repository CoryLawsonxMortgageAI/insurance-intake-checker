import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Send, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * Client-facing Insurance Intake Form
 * Carrier eligibility analysis is performed server-side and sent to agents only
 */

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

function fmtUSD(n: string | number): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(n || 0));
}

export default function Home() {
  const [submitted, setSubmitted] = useState(false);
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

  const submitMutation = trpc.intake.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Your intake form has been submitted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to submit form. Please try again.");
      console.error("Submission error:", error);
    },
  });

  const on = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => 
    setData((s) => ({ ...s, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email || !data.state || !data.age) {
      toast.error("Please fill in all required fields");
      return;
    }

    submitMutation.mutate({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      state: data.state,
      age: Number(data.age),
      sex: data.sex,
      heightIn: Number(data.heightIn),
      weightLb: Number(data.weightLb),
      bmi: bmi,
      annualIncome: Number(data.annualIncome),
      coverage: Number(data.coverage),
      productType: data.productType,
      termYears: data.termYears ? Number(data.termYears) : undefined,
      tobaccoUse: data.tobaccoUse,
      tobaccoYears: data.tobaccoYears ? Number(data.tobaccoYears) : undefined,
      medications: data.medications,
      doctorNames: data.doctorNames,
      cancerHistoryYears: data.cancerHistoryYears ? Number(data.cancerHistoryYears) : undefined,
      heartEventYears: data.heartEventYears ? Number(data.heartEventYears) : undefined,
      duiYears: data.duiYears ? Number(data.duiYears) : undefined,
      felonyYears: data.felonyYears ? Number(data.felonyYears) : undefined,
      bankruptcyYears: data.bankruptcyYears ? Number(data.bankruptcyYears) : undefined,
      hazardousOccupation: data.hazardousOccupation,
      avocationRisk: data.avocationRisk,
      travelHighRisk: data.travelHighRisk,
      uncontrolledDiabetes: data.uncontrolledDiabetes,
      uncontrolledHypertension: data.uncontrolledHypertension,
      insulinDependent: data.insulinDependent,
      copd: data.copd,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-6">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Thank You!</h1>
          <p className="text-lg text-gray-600 mb-6">
            Your insurance intake form has been successfully submitted.
          </p>
          <p className="text-gray-600 mb-8">
            Our licensed insurance agents have received your information and will review it shortly. 
            They will analyze which carriers are the best fit for your needs and contact you at <strong>{data.email}</strong> with personalized recommendations.
          </p>
          <div className="bg-blue-50 rounded-2xl p-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">1.</span>
                <span>Our agents will evaluate your application against multiple carrier guidelines</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">2.</span>
                <span>We'll identify the carriers that offer the best coverage and rates for your situation</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">3.</span>
                <span>You'll receive a personalized recommendation within 1-2 business days</span>
              </li>
            </ul>
          </div>
          <div className="mt-6 pt-6 border-t text-sm text-gray-600">
            <p><strong>Your Licensed Agent:</strong> Daniel J Purdy</p>
            <p><strong>Agency:</strong> VIP Group Financial</p>
            <p><strong>Ohio Insurance License:</strong> #1581039</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-900">Life Insurance Intake Form</h1>
            <p className="text-gray-600">Complete all required fields. A licensed agent will review and contact you with carrier recommendations.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="First Name" required><Input value={data.firstName} onChange={on("firstName")} required /></Field>
              <Field label="Last Name" required><Input value={data.lastName} onChange={on("lastName")} required /></Field>
              <Field label="Email" required><Input type="email" value={data.email} onChange={on("email")} required /></Field>
              <Field label="Phone"><Input value={data.phone} onChange={on("phone")} /></Field>
              <Field label="State" required><Input value={data.state} onChange={on("state")} required /></Field>
              <Field label="Age" required><Input type="number" min="0" value={data.age} onChange={on("age")} required /></Field>
              <Field label="Sex"><Select value={data.sex} onChange={on("sex")} options={["Male","Female","Other"]} /></Field>
              <Field label="Annual Income ($)" required><Input type="number" value={data.annualIncome} onChange={on("annualIncome")} required /></Field>
              <Field label="Coverage Amount ($)" required><Input type="number" value={data.coverage} onChange={on("coverage")} required /></Field>
              <Field label="Product Type" required><Select value={data.productType} onChange={on("productType")} options={["Term","Whole Life","IUL"]} /></Field>
              <Field label="Term Length (years)"><Input type="number" value={data.termYears} onChange={on("termYears")} /></Field>
              <Field label="Height (in)"><Input type="number" value={data.heightIn} onChange={on("heightIn")} /></Field>
              <Field label="Weight (lb)"><Input type="number" value={data.weightLb} onChange={on("weightLb")} /></Field>
              <Field label="BMI (auto)"><Input value={bmi} readOnly className="bg-gray-50" /></Field>
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <Field label="Tobacco use in last 24 months?">
                <Select value={data.tobaccoUse} onChange={on("tobaccoUse")} options={["No","Yes"]} />
              </Field>
              {data.tobaccoUse === "Yes" && (
                <Field label="If yes, how many years since last use?">
                  <Input type="number" value={data.tobaccoYears} onChange={on("tobaccoYears")} />
                </Field>
              )}
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <Field label="Cancer treatment – years since last?"><Input type="number" value={data.cancerHistoryYears} onChange={on("cancerHistoryYears")} /></Field>
              <Field label="Heart attack/stent – years since?"><Input type="number" value={data.heartEventYears} onChange={on("heartEventYears")} /></Field>
              <Field label="DUI – years since last?"><Input type="number" value={data.duiYears} onChange={on("duiYears")} /></Field>
              <Field label="Felony – years since conviction?"><Input type="number" value={data.felonyYears} onChange={on("felonyYears")} /></Field>
              <Field label="Bankruptcy – years since discharge?"><Input type="number" value={data.bankruptcyYears} onChange={on("bankruptcyYears")} /></Field>
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <Field label="Uncontrolled Diabetes?"><Select value={data.uncontrolledDiabetes} onChange={on("uncontrolledDiabetes")} options={["No","Yes"]} /></Field>
              <Field label="Uncontrolled Hypertension?"><Select value={data.uncontrolledHypertension} onChange={on("uncontrolledHypertension")} options={["No","Yes"]} /></Field>
              <Field label="Insulin-Dependent?"><Select value={data.insulinDependent} onChange={on("insulinDependent")} options={["No","Yes"]} /></Field>
              <Field label="COPD?"><Select value={data.copd} onChange={on("copd")} options={["No","Yes"]} /></Field>
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <Field label="Hazardous Occupation? (e.g., logging)"><Select value={data.hazardousOccupation} onChange={on("hazardousOccupation")} options={["No","Yes"]} /></Field>
              <Field label="Risky Avocation? (diving/aviation/climbing)"><Select value={data.avocationRisk} onChange={on("avocationRisk")} options={["No","Yes"]} /></Field>
              <Field label="High-Risk Travel Planned?"><Select value={data.travelHighRisk} onChange={on("travelHighRisk")} options={["No","Yes"]} /></Field>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
              <Field label="Current Medications (name & dosage)"><Input value={data.medications} onChange={on("medications")} placeholder="Metoprolol 50mg daily; ..." /></Field>
              <Field label="Primary/Attending Physician(s)"><Input value={data.doctorNames} onChange={on("doctorNames")} placeholder="Dr. Smith – OhioHealth; ..." /></Field>
            </div>

            <div className="mt-8 flex justify-center">
              <Button 
                type="submit" 
                size="lg"
                disabled={submitMutation.isPending}
                className="px-12 py-6 text-lg rounded-2xl"
              >
                {submitMutation.isPending ? (
                  <>Submitting...</>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Information Panel */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">What Happens After Submission?</h3>
          </div>
          <div className="space-y-4 text-gray-700">
            <p>
              After you submit this form, our licensed insurance agents will:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Review your information against guidelines from multiple top-rated carriers</li>
              <li>Identify which carriers offer the best coverage options for your specific situation</li>
              <li>Prepare a personalized recommendation with competitive rates</li>
              <li>Contact you within 1-2 business days to discuss your options</li>
            </ul>
            <div className="bg-blue-50 rounded-2xl p-4 mt-6">
              <p className="text-sm text-gray-700">
                <strong>Privacy Notice:</strong> Your information is secure and will only be used to evaluate insurance options. 
                We work with National Life Group, Mutual of Omaha, Ameritas, Lafayette Life, Transamerica, and American Amicable.
              </p>
            </div>
            <div className="border-t pt-6 mt-6">
              <p className="text-sm text-gray-600">
                <strong>Licensed Agent:</strong> Daniel J Purdy<br />
                <strong>Agency:</strong> VIP Group Financial<br />
                <strong>Ohio Insurance License:</strong> #1581039<br />
                <strong>State:</strong> Ohio
              </p>
              <p className="text-xs text-gray-500 mt-3">
                This form is provided by a licensed insurance agent in the State of Ohio. 
                All insurance products are subject to underwriting approval and state regulations.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

