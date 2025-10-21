import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FileText, Send, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * Comprehensive Life Insurance Intake Form
 * Collects all required data points for accurate underwriting and quote generation
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

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} className={`w-full rounded-2xl border p-2 outline-none focus:ring-2 shadow-sm ${props.className || ""}`} rows={3} />
);

function fmtUSD(n: string | number): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(n || 0));
}

export default function Home() {
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    age: "",
    sex: "Male",
    maritalStatus: "Single",
    heightIn: "70",
    weightLb: "190",
    occupation: "",
    state: "OH",
    citizenship: "U.S. Citizen",
    
    // Contact Information
    address: "",
    city: "",
    zipCode: "",
    phone: "",
    email: "",
    
    // Coverage Details
    productType: "Term",
    coverage: "500000",
    termYears: "30",
    purposeOfInsurance: "",
    desiredRiders: "",
    
    // Health and Medical Information
    tobaccoUse: "No",
    tobaccoType: "",
    tobaccoFrequency: "",
    tobaccoQuitDate: "",
    preexistingConditions: "",
    medications: "",
    familyMedicalHistory: "",
    recentMedicalExams: "",
    doctorNames: "",
    doctorPhone: "",
    
    // Specific Medical History
    cancerHistoryYears: "",
    heartEventYears: "",
    uncontrolledDiabetes: "No",
    uncontrolledHypertension: "No",
    insulinDependent: "No",
    copd: "No",
    
    // Lifestyle and Risk Factors
    alcoholConsumption: "No",
    alcoholFrequency: "",
    drugUse: "No",
    duiYears: "",
    drivingViolations: "",
    hazardousOccupation: "No",
    occupationDetails: "",
    avocationRisk: "No",
    hazardousHobbies: "",
    
    // Financial Information
    annualIncome: "80000",
    netWorth: "",
    existingPolicies: "",
    financialJustification: "",
    
    // Beneficiary Information
    beneficiaryName: "",
    beneficiaryRelationship: "",
    beneficiaryDOB: "",
    beneficiarySSN: "",
    beneficiaryPercentage: "100",
    contingentBeneficiary: "",
    
    // Policy Ownership
    policyOwner: "Self",
    premiumPayor: "Self",
    paymentMethod: "Bank Draft",
    
    // Identification
    driversLicenseNumber: "",
    licenseState: "OH",
    licenseExpiration: "",
    ssn: "",
    
    // Optional Information
    employerName: "",
    employerAddress: "",
    employmentLength: "",
    militaryService: "No",
    militaryDetails: "",
    bankruptcyYears: "",
    felonyYears: "",
  });

  const bmi = useMemo(() => {
    const h = Number(data.heightIn || 0);
    const w = Number(data.weightLb || 0);
    if (!h || !w) return "";
    return ((w / (h * h)) * 703).toFixed(1);
  }, [data.heightIn, data.weightLb]);

  const age = useMemo(() => {
    if (!data.dateOfBirth) return "";
    const today = new Date();
    const birthDate = new Date(data.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  }, [data.dateOfBirth]);

  const submitMutation = trpc.intake.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (error) => {
      toast.error("Failed to submit: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email || !data.dateOfBirth || !data.state) {
      toast.error("Please fill in all required fields");
      return;
    }

    submitMutation.mutate({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      state: data.state,
      age: Number(age || data.age),
      sex: data.sex,
      heightIn: Number(data.heightIn),
      weightLb: Number(data.weightLb),
      bmi: bmi,
      annualIncome: Number(data.annualIncome),
      coverage: Number(data.coverage),
      productType: data.productType,
      termYears: data.termYears ? Number(data.termYears) : undefined,
      tobaccoUse: data.tobaccoUse,
      tobaccoYears: data.tobaccoQuitDate ? Math.floor((new Date().getTime() - new Date(data.tobaccoQuitDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : undefined,
      medications: data.medications,
      doctorNames: data.doctorNames,
      cancerHistoryYears: data.cancerHistoryYears ? Number(data.cancerHistoryYears) : undefined,
      heartEventYears: data.heartEventYears ? Number(data.heartEventYears) : undefined,
      duiYears: data.duiYears ? Number(data.duiYears) : undefined,
      felonyYears: data.felonyYears ? Number(data.felonyYears) : undefined,
      bankruptcyYears: data.bankruptcyYears ? Number(data.bankruptcyYears) : undefined,
      hazardousOccupation: data.hazardousOccupation,
      avocationRisk: data.avocationRisk,
      travelHighRisk: "No",
      uncontrolledDiabetes: data.uncontrolledDiabetes,
      uncontrolledHypertension: data.uncontrolledHypertension,
      insulinDependent: data.insulinDependent,
      copd: data.copd,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Life Insurance Intake Form</h1>
          <p className="text-gray-600">Complete all required fields. A licensed agent will review and contact you with carrier recommendations.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-8">
            <form onSubmit={handleSubmit}>
              {/* Personal Information */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b pb-2">Personal Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="First Name" required>
                    <Input value={data.firstName} onChange={(e) => setData({ ...data, firstName: e.target.value })} required />
                  </Field>
                  <Field label="Last Name" required>
                    <Input value={data.lastName} onChange={(e) => setData({ ...data, lastName: e.target.value })} required />
                  </Field>
                  <Field label="Date of Birth" required>
                    <Input type="date" value={data.dateOfBirth} onChange={(e) => setData({ ...data, dateOfBirth: e.target.value, age: "" })} required />
                  </Field>
                  <Field label="Age (auto-calculated)">
                    <Input value={age || data.age} readOnly className="bg-gray-50" />
                  </Field>
                  <Field label="Sex" required>
                    <Select value={data.sex} onChange={(e) => setData({ ...data, sex: e.target.value })} options={["Male", "Female", "Other"]} />
                  </Field>
                  <Field label="Marital Status">
                    <Select value={data.maritalStatus} onChange={(e) => setData({ ...data, maritalStatus: e.target.value })} options={["Single", "Married", "Divorced", "Widowed", "Domestic Partnership"]} />
                  </Field>
                  <Field label="Height (inches)" required>
                    <Input type="number" value={data.heightIn} onChange={(e) => setData({ ...data, heightIn: e.target.value })} required />
                  </Field>
                  <Field label="Weight (lbs)" required>
                    <Input type="number" value={data.weightLb} onChange={(e) => setData({ ...data, weightLb: e.target.value })} required />
                  </Field>
                  <Field label="BMI (auto-calculated)">
                    <Input value={bmi} readOnly className="bg-gray-50" />
                  </Field>
                  <Field label="Occupation" required>
                    <Input value={data.occupation} onChange={(e) => setData({ ...data, occupation: e.target.value })} required />
                  </Field>
                  <Field label="State of Residence" required>
                    <Input value={data.state} onChange={(e) => setData({ ...data, state: e.target.value })} required />
                  </Field>
                  <Field label="Citizenship Status">
                    <Select value={data.citizenship} onChange={(e) => setData({ ...data, citizenship: e.target.value })} options={["U.S. Citizen", "Permanent Resident", "Work Visa", "Other"]} />
                  </Field>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b pb-2">Contact Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Street Address" required>
                    <Input value={data.address} onChange={(e) => setData({ ...data, address: e.target.value })} required />
                  </Field>
                  <Field label="City" required>
                    <Input value={data.city} onChange={(e) => setData({ ...data, city: e.target.value })} required />
                  </Field>
                  <Field label="ZIP Code" required>
                    <Input value={data.zipCode} onChange={(e) => setData({ ...data, zipCode: e.target.value })} required />
                  </Field>
                  <Field label="Phone" required>
                    <Input type="tel" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} required />
                  </Field>
                  <Field label="Email" required>
                    <Input type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} required />
                  </Field>
                </div>
              </div>

              {/* Coverage Details */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b pb-2">Coverage Details</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Product Type" required>
                    <Select value={data.productType} onChange={(e) => setData({ ...data, productType: e.target.value })} options={["Term", "Whole Life", "Universal Life", "Indexed Universal Life (IUL)", "Variable Universal Life"]} />
                  </Field>
                  <Field label="Coverage Amount ($)" required>
                    <Input type="number" value={data.coverage} onChange={(e) => setData({ ...data, coverage: e.target.value })} required />
                  </Field>
                  {data.productType === "Term" && (
                    <Field label="Term Length (years)">
                      <Select value={data.termYears} onChange={(e) => setData({ ...data, termYears: e.target.value })} options={["10", "15", "20", "25", "30"]} />
                    </Field>
                  )}
                  <Field label="Purpose of Insurance">
                    <Input value={data.purposeOfInsurance} onChange={(e) => setData({ ...data, purposeOfInsurance: e.target.value })} placeholder="Income replacement, mortgage protection, etc." />
                  </Field>
                  <Field label="Desired Riders (optional)">
                    <Input value={data.desiredRiders} onChange={(e) => setData({ ...data, desiredRiders: e.target.value })} placeholder="Waiver of Premium, Child Rider, etc." />
                  </Field>
                </div>
              </div>

              {/* Health and Medical Information */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b pb-2">Health and Medical Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Tobacco or Nicotine Use?">
                    <Select value={data.tobaccoUse} onChange={(e) => setData({ ...data, tobaccoUse: e.target.value })} options={["No", "Yes"]} />
                  </Field>
                  {data.tobaccoUse === "Yes" && (
                    <>
                      <Field label="Tobacco Type">
                        <Input value={data.tobaccoType} onChange={(e) => setData({ ...data, tobaccoType: e.target.value })} placeholder="Cigarettes, cigars, vape, etc." />
                      </Field>
                      <Field label="Frequency">
                        <Input value={data.tobaccoFrequency} onChange={(e) => setData({ ...data, tobaccoFrequency: e.target.value })} placeholder="Daily, weekly, etc." />
                      </Field>
                      <Field label="Quit Date (if applicable)">
                        <Input type="date" value={data.tobaccoQuitDate} onChange={(e) => setData({ ...data, tobaccoQuitDate: e.target.value })} />
                      </Field>
                    </>
                  )}
                  <Field label="Pre-existing Medical Conditions">
                    <Textarea value={data.preexistingConditions} onChange={(e) => setData({ ...data, preexistingConditions: e.target.value })} placeholder="List any diagnosed conditions" />
                  </Field>
                  <Field label="Current Medications">
                    <Textarea value={data.medications} onChange={(e) => setData({ ...data, medications: e.target.value })} placeholder="Name, dosage, and purpose" />
                  </Field>
                  <Field label="Family Medical History">
                    <Textarea value={data.familyMedicalHistory} onChange={(e) => setData({ ...data, familyMedicalHistory: e.target.value })} placeholder="Parents/siblings - age and cause of death if deceased" />
                  </Field>
                  <Field label="Recent Medical Exams or Tests">
                    <Textarea value={data.recentMedicalExams} onChange={(e) => setData({ ...data, recentMedicalExams: e.target.value })} placeholder="Date and type of exam/test" />
                  </Field>
                  <Field label="Primary Care Physician Name">
                    <Input value={data.doctorNames} onChange={(e) => setData({ ...data, doctorNames: e.target.value })} />
                  </Field>
                  <Field label="Physician Phone Number">
                    <Input type="tel" value={data.doctorPhone} onChange={(e) => setData({ ...data, doctorPhone: e.target.value })} />
                  </Field>
                </div>

                <div className="mt-4">
                  <h3 className="font-semibold mb-3 text-gray-800">Specific Medical History</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Cancer treatment - years since last?">
                      <Input type="number" value={data.cancerHistoryYears} onChange={(e) => setData({ ...data, cancerHistoryYears: e.target.value })} placeholder="Leave blank if none" />
                    </Field>
                    <Field label="Heart attack/stent - years since?">
                      <Input type="number" value={data.heartEventYears} onChange={(e) => setData({ ...data, heartEventYears: e.target.value })} placeholder="Leave blank if none" />
                    </Field>
                    <Field label="Uncontrolled Diabetes?">
                      <Select value={data.uncontrolledDiabetes} onChange={(e) => setData({ ...data, uncontrolledDiabetes: e.target.value })} options={["No", "Yes"]} />
                    </Field>
                    <Field label="Uncontrolled Hypertension?">
                      <Select value={data.uncontrolledHypertension} onChange={(e) => setData({ ...data, uncontrolledHypertension: e.target.value })} options={["No", "Yes"]} />
                    </Field>
                    <Field label="Insulin-Dependent?">
                      <Select value={data.insulinDependent} onChange={(e) => setData({ ...data, insulinDependent: e.target.value })} options={["No", "Yes"]} />
                    </Field>
                    <Field label="COPD?">
                      <Select value={data.copd} onChange={(e) => setData({ ...data, copd: e.target.value })} options={["No", "Yes"]} />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Lifestyle and Risk Factors */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b pb-2">Lifestyle and Risk Factors</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Alcohol Consumption?">
                    <Select value={data.alcoholConsumption} onChange={(e) => setData({ ...data, alcoholConsumption: e.target.value })} options={["No", "Yes"]} />
                  </Field>
                  {data.alcoholConsumption === "Yes" && (
                    <Field label="Frequency/Amount">
                      <Input value={data.alcoholFrequency} onChange={(e) => setData({ ...data, alcoholFrequency: e.target.value })} placeholder="e.g., 2-3 drinks per week" />
                    </Field>
                  )}
                  <Field label="Recreational Drug Use?">
                    <Select value={data.drugUse} onChange={(e) => setData({ ...data, drugUse: e.target.value })} options={["No", "Yes"]} />
                  </Field>
                  <Field label="DUI - years since last?">
                    <Input type="number" value={data.duiYears} onChange={(e) => setData({ ...data, duiYears: e.target.value })} placeholder="Leave blank if none" />
                  </Field>
                  <Field label="Driving Violations (last 5 years)">
                    <Input value={data.drivingViolations} onChange={(e) => setData({ ...data, drivingViolations: e.target.value })} placeholder="Speeding tickets, accidents, etc." />
                  </Field>
                  <Field label="Hazardous Occupation?">
                    <Select value={data.hazardousOccupation} onChange={(e) => setData({ ...data, hazardousOccupation: e.target.value })} options={["No", "Yes"]} />
                  </Field>
                  {data.hazardousOccupation === "Yes" && (
                    <Field label="Occupation Details">
                      <Input value={data.occupationDetails} onChange={(e) => setData({ ...data, occupationDetails: e.target.value })} placeholder="Construction, aviation, law enforcement, etc." />
                    </Field>
                  )}
                  <Field label="Hazardous Hobbies/Avocations?">
                    <Select value={data.avocationRisk} onChange={(e) => setData({ ...data, avocationRisk: e.target.value })} options={["No", "Yes"]} />
                  </Field>
                  {data.avocationRisk === "Yes" && (
                    <Field label="Hobby Details">
                      <Input value={data.hazardousHobbies} onChange={(e) => setData({ ...data, hazardousHobbies: e.target.value })} placeholder="Skydiving, scuba, racing, climbing, etc." />
                    </Field>
                  )}
                </div>
              </div>

              {/* Financial Information */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b pb-2">Financial Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Annual Income ($)" required>
                    <Input type="number" value={data.annualIncome} onChange={(e) => setData({ ...data, annualIncome: e.target.value })} required />
                  </Field>
                  <Field label="Net Worth ($)">
                    <Input type="number" value={data.netWorth} onChange={(e) => setData({ ...data, netWorth: e.target.value })} />
                  </Field>
                  <Field label="Existing Life Insurance Policies">
                    <Textarea value={data.existingPolicies} onChange={(e) => setData({ ...data, existingPolicies: e.target.value })} placeholder="Carrier, face amount, purpose" />
                  </Field>
                  <Field label="Financial Justification (for high coverage)">
                    <Textarea value={data.financialJustification} onChange={(e) => setData({ ...data, financialJustification: e.target.value })} placeholder="Business needs, estate planning, etc." />
                  </Field>
                </div>
              </div>

              {/* Beneficiary Information */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b pb-2">Beneficiary Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Primary Beneficiary Name" required>
                    <Input value={data.beneficiaryName} onChange={(e) => setData({ ...data, beneficiaryName: e.target.value })} required />
                  </Field>
                  <Field label="Relationship" required>
                    <Input value={data.beneficiaryRelationship} onChange={(e) => setData({ ...data, beneficiaryRelationship: e.target.value })} placeholder="Spouse, child, parent, etc." required />
                  </Field>
                  <Field label="Beneficiary Date of Birth">
                    <Input type="date" value={data.beneficiaryDOB} onChange={(e) => setData({ ...data, beneficiaryDOB: e.target.value })} />
                  </Field>
                  <Field label="Beneficiary SSN">
                    <Input value={data.beneficiarySSN} onChange={(e) => setData({ ...data, beneficiarySSN: e.target.value })} placeholder="XXX-XX-XXXX" />
                  </Field>
                  <Field label="Percentage (%)">
                    <Input type="number" value={data.beneficiaryPercentage} onChange={(e) => setData({ ...data, beneficiaryPercentage: e.target.value })} />
                  </Field>
                  <Field label="Contingent Beneficiary (optional)">
                    <Input value={data.contingentBeneficiary} onChange={(e) => setData({ ...data, contingentBeneficiary: e.target.value })} placeholder="Name and relationship" />
                  </Field>
                </div>
              </div>

              {/* Policy Ownership and Payment */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b pb-2">Policy Ownership and Payment</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Policy Owner">
                    <Select value={data.policyOwner} onChange={(e) => setData({ ...data, policyOwner: e.target.value })} options={["Self", "Spouse", "Business", "Trust", "Other"]} />
                  </Field>
                  <Field label="Premium Payor">
                    <Select value={data.premiumPayor} onChange={(e) => setData({ ...data, premiumPayor: e.target.value })} options={["Self", "Spouse", "Business", "Other"]} />
                  </Field>
                  <Field label="Payment Method">
                    <Select value={data.paymentMethod} onChange={(e) => setData({ ...data, paymentMethod: e.target.value })} options={["Bank Draft", "Check", "Credit Card", "Payroll Deduction"]} />
                  </Field>
                </div>
              </div>

              {/* Identification and Compliance */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b pb-2">Identification and Compliance</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Driver's License Number" required>
                    <Input value={data.driversLicenseNumber} onChange={(e) => setData({ ...data, driversLicenseNumber: e.target.value })} required />
                  </Field>
                  <Field label="License State" required>
                    <Input value={data.licenseState} onChange={(e) => setData({ ...data, licenseState: e.target.value })} required />
                  </Field>
                  <Field label="License Expiration" required>
                    <Input type="date" value={data.licenseExpiration} onChange={(e) => setData({ ...data, licenseExpiration: e.target.value })} required />
                  </Field>
                  <Field label="Social Security Number" required>
                    <Input value={data.ssn} onChange={(e) => setData({ ...data, ssn: e.target.value })} placeholder="XXX-XX-XXXX" required />
                  </Field>
                </div>
              </div>

              {/* Optional Information */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b pb-2">Optional Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Employer Name">
                    <Input value={data.employerName} onChange={(e) => setData({ ...data, employerName: e.target.value })} />
                  </Field>
                  <Field label="Employer Address">
                    <Input value={data.employerAddress} onChange={(e) => setData({ ...data, employerAddress: e.target.value })} />
                  </Field>
                  <Field label="Length of Employment">
                    <Input value={data.employmentLength} onChange={(e) => setData({ ...data, employmentLength: e.target.value })} placeholder="e.g., 5 years" />
                  </Field>
                  <Field label="Military Service?">
                    <Select value={data.militaryService} onChange={(e) => setData({ ...data, militaryService: e.target.value })} options={["No", "Yes"]} />
                  </Field>
                  {data.militaryService === "Yes" && (
                    <Field label="Military Details">
                      <Input value={data.militaryDetails} onChange={(e) => setData({ ...data, militaryDetails: e.target.value })} placeholder="Branch, years of service, etc." />
                    </Field>
                  )}
                  <Field label="Bankruptcy - years since discharge?">
                    <Input type="number" value={data.bankruptcyYears} onChange={(e) => setData({ ...data, bankruptcyYears: e.target.value })} placeholder="Leave blank if none" />
                  </Field>
                  <Field label="Felony - years since conviction?">
                    <Input type="number" value={data.felonyYears} onChange={(e) => setData({ ...data, felonyYears: e.target.value })} placeholder="Leave blank if none" />
                  </Field>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center mt-8">
                <Button type="submit" size="lg" disabled={submitMutation.isPending} className="px-12">
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
    </div>
  );
}

