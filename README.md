# AICTE Approval Workflow Automation, Compliance Monitoring & Alert Management System

## Smart India Hackathon (SIH) Problem ID: SIH26262

An enterprise-grade, hybrid full-stack web application designed for the **All India Council for Technical Education (AICTE)**, Ministry of Education, Government of India.

---

## 🌟 Key Highlights & Architecture

### 1. Zero-Crash Hybrid Architecture
- **Full-Stack Mode (Render / Local)**: Powered by Express REST API (`/api/*`) and persistent database (`server/db.json`).
- **Static Resilient Mode (Netlify / Vercel)**: When Express backend is offline, the fail-safe service layer (`src/services/api.js`) automatically falls back to client-side storage (`localStorage`) initialized from `src/data/aicte_seed.json`.
- State transitions, SLA countdown timers, APH rule evaluations, and cryptographic SHA-256 audit logs work **100% seamlessly** in both modes.

### 2. Live 5-Role Perspective Switcher
1. **Institution / College Admin**: Manage annual EoA, "+ Submit New AICTE Application" wizard with live pre-submission rule checks, upload conditional undertakings proof (tax bills & geotagged photos), and renew expiring statutory documents.
2. **Stage 1: Scrutiny Committee Officer**: Desk verification of official municipal corporation blueprints, land titles, Tehsildar deeds, fire safety NOCs, structural stability, and 1:15 faculty ratio before dispatching physical visits.
3. **Stage 2: EVC Inspector**: 30-minute continuous satellite & campus walkthrough video verifier with timestamp checkpoints (02:15 GPS Main Gate, 09:30 Classrooms Laser Measurement, 17:45 Lab Stock Register & GST Tax Bills, 25:10 Library Bandwidth Meter) and ground physical sliders.
4. **Stage 3: SAC / SHC Appellate Officer**: Quasi-Judicial appellate forum under Chapter II of APH for hearing institutional appeals against EVC/Scrutiny deficiency rejections.
5. **AICTE Regional / Bureau Command Center**: Central governance dashboard with multi-regional KPIs (WRO, SRO, ERO, NRO), automated statutory document expiry vault, and **1-click official Digital Extension of Approval (EoA) Certificate Generator** with QR code verification.

### 3. Dynamic 4-Path Workflow Router
- **Path 1**: Only Scrutiny (`Submitted -> Stage 1 Scrutiny -> Regional Officer Approval -> EoA Issued`)
- **Path 2**: Scrutiny + EVC (`Submitted -> Stage 1 Scrutiny -> Stage 2 EVC Queue -> Regional Officer -> EoA Issued`)
- **Path 3**: Only EVC (`Submitted -> Direct Stage 2 EVC Queue -> Conditional Undertaking -> Regional Officer -> EoA Issued`)
- **Path 4**: EVC + SAC/SHC (`Submitted -> Inspection Deficiency -> Stage 3 SAC Hearing -> Regional Officer -> EoA Issued`)

### 4. Automated 3-Tier Alert Sentinel & Time Simulator
- **"+7 Days SLA Simulator"**: Advances the system calendar by 7 days in 1 click, recalculating all SLA countdowns and scanning statutory document expiry dates.
  - **Tier 1**: Advance Reminders (&le; 30 Days before document / bank FDR maturity).
  - **Tier 2**: Overdue SLA Warnings (Desk Scrutiny / EVC Inspection queue timeline exceeded).
  - **Tier 3**: Senior Officer Auto-Escalations (Critical expired Fire NOCs or lapsed bank guarantees escalated to Member Secretary).

### 5. Cryptographic Digital Audit Trail
- Every stage transition, rule change, and evidence upload is sealed with an immutable **SHA-256 hash**, timestamp, user role, and remarks.

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation
```bash
git clone <repo-url>
cd aicte-workflow-sih26262
npm install
```

### Run Frontend & Backend Concurrently
```bash
# Starts Node/Express server on port 5000 and Vite frontend on port 5173
npm run fullstack
```

### Run Frontend Only (Vite)
```bash
npm run dev
```

### Run Backend Only (Express)
```bash
npm run server
```

---

## 🌐 1-Click Cloud Deployment

### 1. Deploying to Netlify (Static Instant Demo)
- Pre-configured `netlify.toml` with SPA redirects and build command (`npm run build`).
- Build Command: `npm run build`
- Publish Directory: `dist`
- Works instantly with 0 backend configuration!

### 2. Deploying to Render (Full-Stack Mode)
- Pre-configured `render.yaml`.
- Build Command: `npm install && npm run build`
- Start Command: `npm run start`
- Runs Node Express server hosting both the REST API and the production React bundle on one unified URL.

---

## 🏛️ Government Specifications Followed
- AICTE Approval Process Handbook (APH 2026-2027)
- Clause 2.4 (Desk Scrutiny of Documents & Blueprints)
- Clause 2.6 (Expert Visiting Committee EVC Guidelines)
- Clause 2.7 (Time-Bound Undertakings for Minor Shortages)
- Chapter II (Appellate Committee SAC / SHC Hearings)
