<p align="center">
  <img src="public/icon.png" alt="AyurMed Logo" width="80" height="80" style="border-radius: 16px;" />
</p>

<h1 align="center">AyurMed — Hospital Prescription & Expenditure Tracker</h1>

<p align="center">
  <strong>A full-stack web application for Ayurvedic hospitals to manage prescriptions, track drug expenditure, and generate patient attendance statistics — all from a single, modern dashboard.</strong>
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://www.prisma.io"><img src="https://img.shields.io/badge/Prisma-6.4-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://vercel.com"><img src="https://img.shields.io/badge/Deployed_on-Vercel-000?style=flat-square&logo=vercel" alt="Vercel" /></a>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#%EF%B8%8F-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-database-schema">Database</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-license">License</a>
</p>

---

## ✨ Features

### 📋 Prescription Management
- **Smart Prescription Form** — Multi-drug basket system with real-time cost calculation, auto-dose suggestions, and inline drug search.
- **Patient Demographics** — Capture gender, age category, and Ayurvedic system category per prescription for downstream statistical analysis.
- **Prescription Log** — Searchable, paginated log of all prescriptions with bulk-delete support and date/patient filters.

### 💊 Drug Catalog
- **Full CRUD Operations** — Add, edit, and delete drugs with details including name, category, size/unit, unit price, and standard dose.
- **Smart Search & Filter** — Instant search across drug names with category filtering (Arishta, Churna, Kwatha, Thaila, Gulika, etc.).
- **Bulk Management** — Multi-select drugs for batch deletion with confirmation dialogs.
- **650+ Pre-seeded Medicines** — Hospital-specific Ayurvedic drug catalog pre-loaded via automated seeding.

### 📊 Expenditure & Summary Reports
- **Period-based Summaries** — View daily, weekly, monthly, or all-time expenditure breakdowns with per-drug cost and quantity analytics.
- **Drug-level Filtering** — Drill down into individual drug consumption across any time period.
- **Expandable Breakdown Rows** — Each period row expands to reveal a full drug-by-drug cost, quantity, and prescription count table.
- **PDF Export** — One-click PDF generation of the expenditure summary report (browser print).

### 👥 Patient Attendance Statistics
- **Cross-Tabulation Matrix** — Gender × Age Category × System Category matrix with row and column totals.
- **Separate Male / Female / Combined Tables** — Three independent matrix views with sticky columns for horizontal scrolling.
- **KPI Summary Cards** — At-a-glance total patients, male/female/other breakdowns with percentage indicators.
- **PDF Report Generation** — Export beautifully formatted A4 landscape PDF reports with hospital branding and date-stamped headers.

### 🔐 Authentication & Security
- **JWT-based Sessions** — Secure cookie-based authentication using `jose` for token signing/verification.
- **Email Verification** — SMTP-powered email verification flow with token-based confirmation links.
- **Password Recovery** — Full forgot-password → reset-password flow with time-limited tokens.
- **Route Protection** — Middleware-based route guards that redirect unauthenticated users to login.
- **Multi-Hospital Isolation** — Data is scoped per hospital; users only see their own hospital's records.

### 🎨 Design & UX
- **Responsive Design** — Fully optimised for desktop, tablet (iPad), and mobile viewports.
- **Slim Sidebar Navigation** — Icon-based desktop sidebar with mobile bottom navigation bar and top header.
- **Modern Aesthetics** — Clean emerald-themed UI with glassmorphism cards, smooth transitions, and Lucide icons.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org) |
| **UI Library** | [React 19](https://react.dev) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com) |
| **Database** | MySQL (via [Prisma ORM 6.4](https://www.prisma.io)) |
| **Authentication** | JWT ([jose](https://github.com/panva/jose)) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| **Email** | [Nodemailer](https://nodemailer.com) (SMTP / Gmail) |
| **Validation** | [Zod 4](https://zod.dev) |
| **Icons** | [Lucide React](https://lucide.dev) |
| **Select Components** | [React Select](https://react-select.com) |
| **Deployment** | [Vercel](https://vercel.com) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **MySQL** 8.x (or a hosted MySQL-compatible database like PlanetScale, Aiven, etc.)
- **npm** ≥ 9.x

### 1. Clone the Repository

```bash
git clone https://github.com/AhryRaj/hospital_prescription_tracker.git
cd hospital_prescription_tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Database
DATABASE_URL="mysql://root:your_password@localhost:3306/hospital_db"

# Authentication
JWT_SECRET="your-secure-random-secret-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email (Gmail example)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"
SMTP_FROM="Hospital System <noreply@yourhospital.lk>"
```

### 4. Set Up the Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production

```bash
npm run build
npm start
```

---

## 🗄️ Database Schema

The application uses four core models, all scoped by `hospital_id` for multi-tenancy:

```
┌──────────────┐       ┌──────────────┐
│   Hospital   │──────<│     User     │
│──────────────│       │──────────────│
│ id           │       │ id           │
│ name         │       │ hospital_id  │
│ code (unique)│       │ email        │
│ email        │       │ password_hash│
│ phone        │       │ name         │
│ address      │       │ is_verified  │
│ created_at   │       │ created_at   │
└──────┬───────┘       └──────────────┘
       │
       ├──────────────<┌──────────────┐
       │               │     Drug     │
       │               │──────────────│
       │               │ id           │
       │               │ hospital_id  │
       │               │ name         │
       │               │ category     │
       │               │ size_amount  │
       │               │ size_unit    │
       │               │ unit_price   │
       │               │ standard_dose│
       │               └──────┬───────┘
       │                      │
       └──────────────<┌──────┴───────┐
                       │ Prescription │
                       │──────────────│
                       │ id           │
                       │ hospital_id  │
                       │ date         │
                       │ patient_id   │
                       │ gender       │
                       │ age_category │
                       │ system_cat.  │
                       │ drug_id (FK) │
                       │ total_qty    │
                       │ total_cost   │
                       │ created_at   │
                       └──────────────┘
```

---

## 📂 Project Structure

```
hospital_prescription_tracker/
├── app/
│   ├── api/                    # REST API route handlers
│   │   ├── auth/               # Login, register, verify, reset password
│   │   ├── drugs/              # Drug CRUD operations
│   │   ├── patient-stats/      # Patient statistics matrix endpoint
│   │   ├── prescriptions/      # Prescription CRUD operations
│   │   └── summaries/          # Expenditure summary aggregations
│   ├── auth/                   # Authentication pages (login, register, etc.)
│   ├── components/             # Reusable UI components
│   │   ├── CategorySelect.tsx  # Ayurvedic drug category selector
│   │   ├── CustomSelect.tsx    # Styled select dropdown
│   │   ├── DrugCombobox.tsx    # Searchable drug combobox
│   │   ├── Pagination.tsx      # Pagination controls
│   │   └── Sidebar.tsx         # Main navigation sidebar
│   ├── drugs/                  # Drug catalog page
│   ├── patient-stats/          # Patient demographics & statistics page
│   ├── prescribe/              # Prescription entry form
│   ├── prescriptions/          # Prescription log page
│   ├── summaries/              # Expenditure summary page
│   ├── globals.css             # Global styles & Tailwind base
│   ├── layout.tsx              # Root layout with sidebar
│   └── page.tsx                # Dashboard / Overview page
├── lib/
│   ├── auth.ts                 # JWT token utilities
│   ├── email.ts                # Email sending (Nodemailer)
│   └── prisma.ts               # Prisma client singleton
├── prisma/
│   └── schema.prisma           # Database schema definition
├── proxy.ts                    # Auth middleware (route protection)
├── public/                     # Static assets (icons, images)
├── .env.example                # Environment variable template
├── package.json                # Dependencies and scripts
└── tsconfig.json               # TypeScript configuration
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate and receive JWT |
| `POST` | `/api/auth/logout` | Clear session cookie |
| `GET` | `/api/auth/session` | Get current session info |
| `POST` | `/api/auth/verify-email` | Verify email with token |
| `POST` | `/api/auth/forgot-password` | Request password reset |
| `POST` | `/api/auth/reset-password` | Reset password with token |
| `GET` | `/api/drugs` | List all drugs (filtered by hospital) |
| `POST` | `/api/drugs` | Add a new drug |
| `PUT` | `/api/drugs` | Update an existing drug |
| `DELETE` | `/api/drugs` | Delete drug(s) |
| `GET` | `/api/prescriptions` | List all prescriptions |
| `POST` | `/api/prescriptions` | Create prescription(s) |
| `DELETE` | `/api/prescriptions` | Delete prescription(s) |
| `GET` | `/api/summaries` | Get expenditure summaries |
| `GET` | `/api/patient-stats` | Get patient statistics matrix |

---

## 🏥 Ayurvedic System Categories

The application tracks prescriptions against traditional Ayurvedic classification systems:

| Code | System | Description |
|------|--------|-------------|
| `b / o` | B / O | General classification |
| `c / SP 60` | C / SP 60 | SP system — 60 series |
| `e / SM 39` | E / SM 39 | SM system — 39 series |
| `g / O` | G / O | General classification |
| `h / SP 12` | H / SP 12 | SP system — 12 series |
| `i / O` | I / O | General classification |
| `j / SP 41` | J / SP 41 | SP system — 41 series |
| `k / O` | K / O | General classification |
| `l / SK 95` | L / SK 95 | SK system — 95 series |
| `m / SN 49` | M / SN 49 | SN system — 49 series |
| `n / O` | N / O | General classification |

---

## 📱 Responsive Design

The application is fully responsive and tested across:

- **Desktop** — Full sidebar navigation with expanded data tables
- **Tablet (iPad)** — Optimised touch targets, sticky table columns, and adapted layouts
- **Mobile** — Bottom navigation bar, stacked cards, and swipeable tables

---

## 🚢 Deployment

The application is deployed on **Vercel** with automatic deployments on push:

- `main` branch → **Production** deployment
- `develop` branch → **Preview** deployment

### Deploy Your Own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AhryRaj/hospital_prescription_tracker)

> **Note:** You will need to configure environment variables in the Vercel dashboard after deployment.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

<p align="center">
  Built with 💚 for Ayurvedic Healthcare
</p>
