# Insurance Intake Checker

A professional life insurance intake application that collects client information and performs server-side carrier eligibility analysis. Built with React, Node.js, and tRPC.

## 🎯 Overview

This application provides a client-facing intake questionnaire for life insurance applications. Clients complete a comprehensive form, and licensed insurance agents receive detailed carrier eligibility analysis via email notifications.

### Key Features

- **Client-Facing Intake Form** - Clean, professional questionnaire collecting:
  - Personal information (name, age, contact details, state)
  - Physical metrics (height, weight, BMI auto-calculation)
  - Financial information (income, desired coverage)
  - Product preferences (Term, Whole Life, IUL)
  - Health history and medical conditions
  - Risk factors (tobacco, DUI, felony, bankruptcy, occupation, travel)
  
- **Server-Side Carrier Analysis** - Automatic evaluation against 6 major carriers:
  - National Life Group
  - Mutual of Omaha
  - Ameritas
  - Lafayette Life
  - Transamerica
  - American Amicable

- **Agent Notifications** - Comprehensive email notifications including:
  - Complete client information
  - Eligibility status for each carrier
  - Decline triggers and program flags
  - Underwriting notes
  - Personalized document checklists

- **Database Storage** - All submissions stored securely with full audit trail

## 🚀 Tech Stack

- **Frontend**: React 19, Tailwind CSS 4, Framer Motion, shadcn/ui
- **Backend**: Node.js, Express, tRPC
- **Database**: MySQL with Drizzle ORM
- **Build Tools**: Vite, TypeScript
- **Package Manager**: pnpm

## 📋 Prerequisites

- Node.js 22.x or higher
- pnpm 10.x or higher
- MySQL database

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/CoryLawsonxMortgageAI/insurance-intake-checker.git
   cd insurance-intake-checker
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=mysql://user:password@localhost:3306/insurance_intake
   JWT_SECRET=your-jwt-secret-here
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   pnpm db:push
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
insurance-intake-checker/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # Reusable UI components (shadcn/ui)
│       ├── contexts/      # React contexts
│       ├── hooks/         # Custom React hooks
│       ├── lib/           # Utility functions
│       ├── pages/         # Page components
│       │   └── Home.tsx   # Main intake form
│       ├── App.tsx        # App router and layout
│       └── main.tsx       # React entry point
├── server/                # Backend Node.js application
│   ├── _core/            # Core server infrastructure
│   ├── routers.ts        # tRPC API routes
│   ├── carrierAnalysis.ts # Carrier evaluation logic
│   ├── emailNotification.ts # Email notification system
│   └── db.ts             # Database connection
├── drizzle/              # Database schema and migrations
│   └── schema.ts         # Database schema definitions
└── shared/               # Shared types and constants
```

## 🎨 Carrier Rules

The application evaluates client information against embedded carrier guidelines:

### National Life Group
- Max Issue Age: 80
- Min Coverage: $25,000
- Income Multiple Cap: 30×
- Tobacco Lookback: 2 years

### Mutual of Omaha
- Max Issue Age: 75
- Min Coverage: $50,000
- Income Multiple Cap: 25×
- Tobacco Lookback: 2 years

### Ameritas
- Max Issue Age: 80
- Min Coverage: $100,000
- Income Multiple Cap: 30×
- Tobacco Lookback: 2 years

### Lafayette Life
- Max Issue Age: 85
- Min Coverage: $25,000
- Income Multiple Cap: 35×
- Tobacco Lookback: 2 years

### Transamerica
- Max Issue Age: 79
- Min Coverage: $25,000
- Income Multiple Cap: 25×
- Tobacco Lookback: 1 year

### American Amicable
- Max Issue Age: 85
- Min Coverage: $25,000
- Income Multiple Cap: 20×
- Tobacco Lookback: 2 years

## 📊 Database Schema

### `intake_submissions` Table
Stores all client intake submissions with:
- Personal information (name, email, phone, state, age, sex)
- Physical metrics (height, weight, BMI)
- Financial data (annual income, coverage amount)
- Product preferences (type, term length)
- Health history (medications, medical events)
- Risk factors (tobacco, DUI, felony, bankruptcy, occupation, travel)
- Medical conditions (diabetes, hypertension, insulin dependency, COPD)
- Carrier analysis results
- Timestamp

## 🔒 Security Features

- Server-side carrier analysis (hidden from clients)
- Database-backed storage with audit trail
- Input validation and sanitization
- Secure environment variable management
- HTTPS ready for production deployment

## 📧 Email Notifications

The application sends comprehensive notifications to insurance agents including:

- **Client Profile**: Complete demographic and contact information
- **Coverage Details**: Product type, coverage amount, income details
- **Health Assessment**: Medical history, medications, conditions
- **Risk Evaluation**: Tobacco use, DUI, felony, bankruptcy, occupation risks
- **Carrier Analysis**: Eligibility status, decline triggers, program flags, underwriting notes
- **Document Checklist**: Required paperwork based on client profile

## 🚢 Deployment

### Production Build

```bash
pnpm build
```

### Environment Variables for Production

```env
DATABASE_URL=mysql://user:password@production-host:3306/insurance_intake
JWT_SECRET=strong-random-secret
NODE_ENV=production
```

### Deployment Platforms

This application can be deployed to:
- Vercel
- Netlify
- AWS (EC2, ECS, Lambda)
- DigitalOcean
- Heroku
- Any Node.js hosting platform

## 🔧 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm db:push` - Push database schema changes
- `pnpm check` - Run TypeScript type checking

## 📝 Customization

### Adding New Carriers

Edit `server/carrierAnalysis.ts` and add a new carrier object to the `CARRIER_RULES` array:

```typescript
{
  id: "new_carrier",
  name: "New Carrier Name",
  products: ["Term", "Whole Life", "IUL"],
  maxIssueAge: 80,
  minCoverage: 25000,
  maxCoverageMultiplierOfIncome: 30,
  tobaccoLookbackYears: 2,
  declineReasons: ({ age, /* other factors */ }) => {
    const reasons = [];
    // Add your decline logic here
    return reasons;
  },
}
```

### Modifying Form Fields

Edit `client/src/pages/Home.tsx` to add or modify form fields in the intake questionnaire.

### Customizing Email Notifications

Edit `server/emailNotification.ts` to customize the email content and formatting.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **VIP Group Financial** - Insurance agency specializing in life insurance solutions

## 📞 Support

For questions or support, please contact:
- Email: vipgroupfinancial@outlook.com
- Email: clawson444@gmail.com

## ⚠️ Disclaimer

This application provides preliminary carrier eligibility analysis based on embedded guidelines. Final underwriting decisions are made by the insurance carriers. All carrier rules and guidelines should be verified with current official underwriting manuals before making recommendations to clients.

## 🔄 Version History

- **v1.0.0** (2025-10-21)
  - Initial release
  - Client-facing intake form
  - Server-side carrier analysis for 6 carriers
  - Email notification system
  - Database storage with MySQL
  - Professional thank you page

