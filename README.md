# OmniAudit AI — Intelligent Document Processing & Automated GST Compliance Audit

OmniAudit AI is a full-stack, production-ready web application designed for automated invoice document ingestion, Indian GST compliance auditing, state-code tax routing (Intrastate CGST/SGST vs Interstate IGST), arithmetic verification, and monthly GSTR-1/GSTR-2 summary reporting.

---

## Key Features

- **Intelligent Multimodal Vision Extraction (`@google/genai`)**: Uses Gemini Vision API (`gemini-3.6-flash`) to parse raw PNG, JPG, WEBP, or PDF invoice documents and convert them into structured JSON metadata.
- **Automated GST Compliance & Tax Split Engine**:
  - Automatically inspects the first 2 digits of the Supplier GSTIN and Recipient GSTIN.
  - **Intrastate (Same State Code)**: Splits tax evenly into **50% CGST** and **50% SGST** (IGST = 0).
  - **Interstate (Different State Code)**: Routes 100% of the tax to **IGST** (CGST = 0, SGST = 0).
  - **Arithmetic Verification**: Programmatically checks `Subtotal + Tax == Grand Total` (margin ±1.00 INR) and line item sum equality.
- **Gen-Z Minimalist Bento UI**: Dark-mode interface inspired by Vercel and Linear with glassmorphism cards (`rounded-2xl`, `bg-zinc-950`), glowing status badges (`PASSED` vs `FLAGGED_MISMATCH`), and micro-interactions.
- **GSTR-1 & GSTR-2 Reconciliation Summary**: Monthly breakdown of Total Subtotal, CGST, SGST, IGST, HSN/SAC code distribution, and CSV report export.
- **Security & Validation**: JWT token authentication, `bcryptjs` password hashing, and `Zod` payload schema validation.

---

## Technical Architecture

```
/omni-audit-ai
  ├── /backend
  │   ├── /models
  │   │   ├── User.js            # User authentication schema
  │   │   └── Invoice.js         # Audit log & tax split schema
  │   ├── /routes
  │   │   ├── authRoutes.js      # Register, Login, Me endpoints
  │   │   └── auditRoutes.js     # Upload, History, GSTR Summary
  │   ├── /services
  │   │   ├── geminiService.js   # @google/genai SDK integration
  │   │   └── gstEngine.js       # 2-Digit State Code & GST Tax Split logic
  │   ├── /middleware
  │   │   └── auth.js            # JWT verification middleware
  │   ├── /tests
  │   │   └── gstEngine.test.js  # Automated unit test suite
  │   ├── server.js              # Express app & Mongoose connection
  │   └── package.json
  │
  ├── /frontend
  │   ├── /src
  │   │   ├── /components
  │   │   │   ├── Navbar.jsx
  │   │   │   ├── BentoGrid.jsx
  │   │   │   ├── UploadDropzone.jsx
  │   │   │   └── InvoiceAuditResultModal.jsx
  │   │   ├── /pages
  │   │   │   ├── DashboardView.jsx
  │   │   │   ├── UploadView.jsx
  │   │   │   ├── GstrSummaryView.jsx
  │   │   │   ├── HistoryView.jsx
  │   │   │   ├── LoginView.jsx
  │   │   │   └── RegisterView.jsx
  │   │   ├── /context
  │   │   │   └── AuthContext.jsx
  │   │   ├── App.jsx
  │   │   ├── main.jsx
  │   │   └── index.css
  │   ├── vite.config.js
  │   └── package.json
  └── README.md
```

---

## Environment Variables

### Backend (`/backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/omniaudit
JWT_SECRET=omniaudit_jwt_secret_key_2026
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```
> **Note**: If `GEMINI_API_KEY` is not supplied, OmniAudit AI automatically switches to an intelligent vision fallback parser so all audit features can be tested offline without API key dependency.

---

## Quick Start & Local Execution

### 1. Install & Run Backend Server
```bash
cd backend
npm install
npm test            # Run GST engine unit tests
npm start           # Starts API server on http://localhost:5000
```

### 2. Install & Run Frontend Client
```bash
cd frontend
npm install
npm run dev         # Launches Vite dev server on http://localhost:3000
```

---

## 1-Click Demo Testing

1. Open `http://localhost:3000` in your web browser.
2. Click **"Audit New Invoice"** or use the **1-Click Demo** buttons on the dashboard:
   - **Intrastate (MH -> MH)**: Verifies 50% CGST + 50% SGST split.
   - **Interstate (KA -> MH)**: Verifies 100% IGST routing.
   - **Tax Mismatch Invoice**: Flags tax routing errors and arithmetic discrepancies.
3. Click **"Inspect"** on any invoice row to view side-by-side verification and diagnostic findings.
