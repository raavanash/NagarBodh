# NagarBodh (नगर बोध) — AI-Powered Municipal Intelligence & Response Platform

> **Code for Communities 2.0 Hackathon Submission**  
> *Category: AI for Digital Public Infrastructure & Governance — Leverage Artificial Intelligence to improve public services, governance systems, citizen experiences, and digital infrastructure efficiency.*

---

## 🏛️ Core Product Statement

> **“A complaint system records what citizens report. NagarBodh determines what those signals collectively mean, how urgent they are, why they deserve that priority, what response is appropriate, and whether the response actually resolved the problem.”**

NagarBodh transforms chaotic citizen grievances and multi-channel telemetry into explainable, prioritized municipal intelligence with human-in-the-loop operational response and closed-loop AI resolution verification.

---

## 📚 Complete Submission Documentation Suite

| Document | Purpose |
| :--- | :--- |
| **[HACKATHON_ALIGNMENT.md](file:///c:/ManiBeast/NagarBodh/HACKATHON_ALIGNMENT.md)** | Direct mapping to Code for Communities 2.0 governance problem statement |
| **[ARCHITECTURE.md](file:///c:/ManiBeast/NagarBodh/ARCHITECTURE.md)** | Full technical system architecture, data flow, and component breakdown |
| **[AI_SYSTEM.md](file:///c:/ManiBeast/NagarBodh/AI_SYSTEM.md)** | Gemini 2.0 Flash integration, 3-Tier Fact Separation, and fallback guardrails |
| **[DATA_PROVENANCE.md](file:///c:/ManiBeast/NagarBodh/DATA_PROVENANCE.md)** | Honest provenance: OBSERVED vs CALCULATED vs INFERRED vs RECOMMENDED |
| **[DEMO_GUIDE.md](file:///c:/ManiBeast/NagarBodh/DEMO_GUIDE.md)** | 5-minute flagship judging walkthrough of Urban Waterlogging scenario |
| **[LIMITATIONS.md](file:///c:/ManiBeast/NagarBodh/LIMITATIONS.md)** | Transparent scope boundaries, IMD authorization notice, and future roadmap |
| **[SECURITY.md](file:///c:/ManiBeast/NagarBodh/SECURITY.md)** | Zero-client-secret policy, server proxying, and key rotation advisory |

---

## 🔒 Security Architecture & Zero-Client-Secret Policy

> [!CAUTION]
> **Production Key Rotation Requirement**:
> If any developer or team member previously tested with personal API keys, rotate them in your provider consoles (Google AI Studio, OpenWeather, X).
> NagarBodh uses server-side proxy architecture (`server/apiProxy.ts` & Vercel serverless `api/*.ts`) ensuring production secrets remain strictly on the backend and are **never bundled into client JavaScript**.

---

## ⚙️ Environment Variables Configuration

Create a `.env.local` file in the root directory for live external integrations:

```ini
# Server-Side API Credentials (Kept securely on backend, never exposed to client)
GOOGLE_WEATHER_API_KEY=your_google_weather_or_maps_demo_key_here
OPENWEATHER_API_KEY=your_openweather_api_key_here
X_BEARER_TOKEN=your_x_bearer_token_here
GEMINI_API_KEY=your_gemini_api_key_here
```

*Note: The application operates completely out of the box in **Simulation / Replay Mode** without any API keys required.*

---

## 🚀 Quickstart & Verification

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Automated Verification Test Suite
```bash
npm test
```
*Executes all 59 unit tests across 12 test files with 100% pass rate.*

### 3. Build for Production
```bash
npm run build
```
*Compiles TypeScript and builds minified assets to `dist/`.*

### 4. Run Code Linter
```bash
npm run lint
```
*Ensures 0 errors across all code files.*

### 5. Launch Development Server
```bash
npm run dev
```
*Starts local Vite dev server with integrated API proxy at `http://localhost:5173`.*

---

## 🌐 Ingestion Modes: LIVE vs REPLAY vs SIMULATION

- **`LIVE` Mode**:
  - Connects to live OpenWeatherMap or Google Weather via `/api/weather`.
  - Ingests live keyword tweets from X API v2 via `/api/social`.
  - Routes multilingual citizen reports to Google Gemini 2.0 Flash via `/api/gemini`.
  - If keys are unconfigured, exposes explicit fallback notices; **never masquerades simulated data as live.**

- **`REPLAY` Mode**:
  - Delivers a deterministic, calibrated historical monsoon event sequence across 14 timeline steps.
  - Ideal for offline evaluation, judging demos, and automated testing.

- **`SIMULATION` Mode**:
  - Provides synthetic baseline models for Delhi NCR administrative boundaries, topography, and critical infrastructure registers.

---

## 📊 Feature & Integration Status Matrix

| Capability / Integration | Implementation Status | Data Mode | Live Endpoint |
| :--- | :---: | :---: | :--- |
| **Multilingual NLP Fact Extraction** | **IMPLEMENTED** | `LIVE` / `REPLAY` | `/api/gemini` (Gemini 2.0 Flash) |
| **Deterministic Clustering Engine** | **IMPLEMENTED** | `DETERMINISTIC` | Local Spatio-Temporal Haversine Engine |
| **6-Factor Explainable Priority** | **IMPLEMENTED** | `CALCULATED` | Local Deterministic Formula (0–100) |
| **Single Canonical 9-State Lifecycle** | **IMPLEMENTED** | `CANONICAL` | Single Source of Truth in `CivicContext` |
| **Human-in-the-Loop Approval Modal** | **IMPLEMENTED** | `OPERATIONAL` | Officer Review, Edit, Approve, Reject |
| **Closed-Loop Resolution Verification**| **IMPLEMENTED** | `INFERRED` | Post-Incident Signal Drop & Verification |
| **OpenWeatherMap Integration** | **IMPLEMENTED** | `LIVE` / `REPLAY` | `/api/weather?provider=openweather` |
| **Google Weather Provider** | **IMPLEMENTED** | `LIVE` / `REPLAY` | `/api/weather?provider=google` |
| **X (Twitter) API v2 Integration** | **IMPLEMENTED** | `LIVE` / `REPLAY` | `/api/social` |
| **Interactive Map (Leaflet + OSM)** | **IMPLEMENTED** | `LIVE OSM` | Public OSM Tiles (Zero API key required) |
| **Admin Ward Boundaries & GIS** | **IMPLEMENTED** | `SIMULATION` | Calibrated Delhi Wards 14, 15, and 22 |
| **Critical Infrastructure Registry** | **IMPLEMENTED** | `SIMULATION` | Delhi NCR Schools, Hospitals, Metros |
| **Official IMD Radar Integration** | **FUTURE INTEGRATION** | *None* | Requires formal government authorization |

---

## 🗺️ Visual Architecture: The Six Command Views

Each major screen in NagarBodh is purpose-built to answer a single critical operational question:

1. **Live Map** (`/`): *“What’s happening?”* — Geospatial situational awareness with pulsating incident clusters and hazard buffers.
2. **Incident Intelligence** (`/dossier`): *“Why does it matter?”* — 6-factor deterministic priority scoring and asset vulnerability links.
3. **Signal Explorer** (`/signals`): *“What evidence supports it?”* — Multi-channel citizen reports with 3-tier fact separation (`[OBSERVED]`, `[INFERRED]`, `[RECOMMENDED]`).
4. **Response Planner** (`/dispatch`): *“What should we do?”* — Standard Operating Procedure matching with mandatory human approval.
5. **Authority Board** (`/authority`): *“Where should we focus resources?”* — Cross-ward readiness metrics and inter-agency resource coordination.
6. **Resolution Verification** (`/timeline`): *“Did it work?”* — Closed-loop post-dispatch signal reduction telemetry and verification audit.
