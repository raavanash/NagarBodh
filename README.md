# NagarBodh (नगर बोध)

## Municipal Intelligence & Explainable Public Investment Platform

> **Code for Communities 2.0 Hackathon Submission**  
> **Category:** AI for Digital Public Infrastructure & Governance  
> **Core Value:** Turning Fragmented Citizen Signals & Public Context into Explainable Municipal Investment Decisions with Projected Impact

---

## 🏛️ Executive Summary for Judges

NagarBodh addresses a fundamental challenge in urban governance: **cities have an abundance of citizen complaints, but lack a systematic, explainable framework to convert raw signals into prioritized public capital investments.**

Instead of operating as a traditional complaint tracker, NagarBodh connects citizen signals to spatial evidence, calculates deterministic intervention priorities, generates AI-assisted decision briefs, preserves human operational authority, and projects post-intervention outcomes.

### The 4-Stage Decision Architecture

| Stage | Core Governance Question | Key Output |
|---|---|---|
| **INVEST** | *Where does intervention matter most?* | Capital priority queue, investment gap (₹350L), vulnerability index |
| **MAP** | *Where is the problem occurring and what surrounds it?* | Interactive Leaflet GIS spatial evidence & infrastructure proximity |
| **DECIDE** | *What evidence supports the intervention decision?* | Explainable Investment Dossier, Gemini AI synthesis, data provenance |
| **IMPACT** | *What outcome does the proposed intervention project?* | Modelled beneficiary impact (119,600 people) & demand reduction |

> **Core Philosophy**: *The system recommends. The human authorizes.*

---

## 🔌 Integrations & Tech Stack Summary

NagarBodh integrates live digital public infrastructure (DPI), open data platforms, and real-time social streams:

| System / Provider | Role & Integration | Provenance Classification | Status |
|---|---|---|---|
| **Google Gemini 2.0 Flash** | AI synthesis of decision briefs from deterministic evidence | AI Explanation Layer | **LIVE / IMPLEMENTED** |
| **OpenWeatherMap API** | Live hydrological & precipitation telemetry for flood risk | `[LIVE STREAM]` / `[REPLAY]` | **LIVE / IMPLEMENTED** |
| **Bluesky Jetstream (WebSocket)** | Real-time live citizen signal ingestion stream | `[EXTERNAL PUBLIC SIGNAL]` | **LIVE / IMPLEMENTED** |
| **Open Government Data (data.gov.in)** | Delhi Govt directory of hospitals & health facilities | `[BASELINE CONTEXT]` | **LIVE / IMPLEMENTED** |
| **Deterministic Scoring Engine** | 6-factor multi-criteria priority & gap calculation | `[CALCULATED]` | **IMPLEMENTED** |
| **Leaflet & OpenStreetMap** | Geospatial ward boundary & asset mapping | Spatial Evidence | **IMPLEMENTED** |
| **Scenario Lab Sandbox** | Bounded what-if simulation & surge testing | `[SIMULATION]` | **IMPLEMENTED** |

---

## 🧠 Responsible AI Architecture: Math vs. Explanation

NagarBodh enforces a strict separation between **deterministic calculation** and **AI explanation**:

1. **Deterministic Calculation Layer**: All priority scores (0–100), vulnerability ratios, population impact metrics, and investment gaps (e.g., ₹350L) are calculated by local, fully inspectable algorithms.
2. **Gemini Explanation Layer**: Gemini 2.0 Flash is supplied with the established evidence and calculated metrics to format an auditable, natural-language Decision Brief for municipal officers.
3. **No Hallucination Risk**: Gemini does *not* calculate priority scores, invent evidence, or alter canonical investment gaps.

---

## 🔎 Data Provenance & Evidence Classification

To ensure complete data honesty, every data point in NagarBodh carries explicit provenance metadata:

| Provenance Label | Description |
|---|---|
| **`[OBSERVED]`** | Verified citizen report or telemetry reading |
| **`[EXTERNAL PUBLIC SIGNAL]`** | Corroborative public social activity (e.g., Bluesky posts) |
| **`[BASELINE CONTEXT]`** | Official government data (e.g., data.gov.in hospital registry) |
| **`[CALCULATED]`** | Deterministic score or gap derived by NagarBodh algorithms |
| **`[PROJECTED]`** | Modelled future outcome post-intervention |
| **`[SIMULATION]`** | Operational demonstration state |
| **`[LIVE STREAM]`** | Real-time live API telemetry |
| **`[REPLAY]`** | Deterministic historical baseline for offline judging |

---

## 📍 Flagship Demonstration Scenario: Sector 15

The canonical demonstration is calibrated for an urban waterlogging crisis in **Delhi Ward 15 (Sector 15 / Mayur Enclave)**:

| Canonical Metric | Benchmark Value | Description |
|---|---:|---|
| **Priority Score** | **94 / 100** | Top municipal capital priority |
| **Priority Level** | **P1 (Critical)** | Requires emergency & capital allocation |
| **Total Population** | **184,000** | Ward 15 resident density |
| **Vulnerable Population** | **45,000** | Elderly, school children, low-lying residents |
| **Vulnerability Index** | **91 / 100** | Socio-spatial vulnerability score |
| **Citizen Signals** | **32** | Corroborated cross-channel signals |
| **Estimated Investment Gap** | **₹350L** | Capital required for dewatering & drainage overhaul |
| **Projected Beneficiaries** | **119,600** | Modelled residents benefiting post-intervention |
| **Projected Impact Score** | **84 / 100** | Expected civic resilience improvement |

---

## 🎬 5-Minute Judging Walkthrough Guide

Judges can evaluate the full application workflow using the recommended demo sequence:

1. **00:00 — INVEST (Priority Queue)**  
   Open the application. Highlight Sector 15 at the top of the queue with Priority **94/100 (P1)** and an Investment Gap of **₹350L**. Emphasize that scores are deterministically calculated.
2. **01:15 — MAP (Spatial Intelligence)**  
   Switch to the map view. Inspect the spatial concentration of waterlogging signals near the Sector 15 metro underpass and surrounding critical health facilities.
3. **01:50 — DECIDE (Explainable Dossier)**  
   Open the **Explainable Investment Dossier**. Point out the clear data provenance tags (`[OBSERVED]`, `[BASELINE CONTEXT]`, `[CALCULATED]`) and inspect the Gemini-generated decision summary.
4. **02:40 — HUMAN AUTHORITY (Approval Workflow)**  
   Trigger the Human Approval action. Demonstrate how a municipal officer reviews, edits, and authorizes the intervention order. *The system recommends; the human dispatches.*
5. **03:20 — IMPACT (Projected Outcomes)**  
   View the post-authorization impact projections: **84/100 Impact Score** and **119,600 Projected Beneficiaries**.
6. **04:05 — SCENARIO LAB (What-If Sandbox)**  
   Navigate to Scenario Lab under **MORE**. Apply a *Monsoon Inflow Surge* scenario to observe real-time recalculations. Demonstrate that sandbox experiments leave canonical live data untouched.

---

## ✅ Quality & Technical Verification

NagarBodh has undergone comprehensive static and runtime verification:

- **Automated Test Suite**: 36 test files, **215 / 215 tests passing**
- **TypeScript Compilation**: **0 errors** (`tsc -b` strictly enforced)
- **Production Build**: Verified standalone Vercel / Vite production bundle
- **Zero Client Secrets**: All API keys proxied securely server-side via `/api/*`

---

## 📚 Technical Documentation Index

For deep-dive technical evaluations, refer to the accompanying architecture documents:

| Document | Purpose for Judges |
|---|---|
| **`HACKATHON_ALIGNMENT.md`** | Detailed alignment with Code for Communities 2.0 objectives |
| **`ARCHITECTURE.md`** | Technical system architecture & component diagrams |
| **`AI_SYSTEM.md`** | Gemini 2.0 Flash prompt design & AI guardrails |
| **`DATA_PROVENANCE.md`** | Comprehensive evidence provenance & data classification matrix |
| **`DEMO_GUIDE.md`** | Detailed step-by-step judging script |
| **`LIMITATIONS.md`** | Prototype scope, environment boundaries & future roadmap |
| **`SECURITY.md`** | Server-side proxy architecture & zero-client-secret policy |

---

> **NagarBodh — From Citizen Signals to Public Investment Decisions with Evidence at Every Step.**
