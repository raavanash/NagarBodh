# NagarBodh (नगर बोध) — Autonomous Municipal Intelligence Platform

NagarBodh is an AI-powered municipal command center for real-time civic incident detection, clustering, context enrichment, priority calculation, dynamic response planning, human-in-the-loop dispatch, and AI resolution verification.

---

## 🔒 Security Notice

> [!CAUTION]
> **Rotate Previously Exposed Credentials Before Production Use**:
> Any API keys or bearer tokens previously committed to git or exposed in client bundles MUST be revoked and rotated immediately in your production API console (OpenWeather, Twitter/X, Google AI Studio).
> NagarBodh uses a server-side proxy architecture (`server/apiProxy.ts`) so production secrets stay securely on the backend server and are NOT exposed in client-side JS bundles (`dist/`).

---

## ⚙️ Environment Variables & Configuration

Create a `.env.local` file in the root directory with your API credentials:

```ini
# Server-Side API Keys (Preferred - Kept secure on backend, never leaked to client bundles)
OPENWEATHER_API_KEY=your_openweather_api_key_here
X_BEARER_TOKEN=your_x_bearer_token_here
GEMINI_API_KEY=your_gemini_api_key_here

# Legacy VITE_ Environment Variables (Development Fallbacks)
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
VITE_X_BEARER_TOKEN=your_x_bearer_token_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 🚀 Local Setup & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server with Backend API Proxy
```bash
npm run dev
```
Starts the Vite development server with built-in API proxy middleware at `http://localhost:5173`.

### 3. Run Automated Test Suite
```bash
npm test
```
Runs Vitest test suite (59 unit tests across 12 test files).

### 4. Production Build & Verification
```bash
npm run build
```
Compiles TypeScript and builds production assets into `dist/`. Production bundles are audited to ensure zero secret strings exist in browser JS files.

### 5. Start Standalone Production Node Server
```bash
npm start
```
Launches the standalone Node server at `http://localhost:3000` with static asset serving and API proxy handlers.

---

## 🌐 Ingestion Modes: LIVE vs SIMULATION

NagarBodh features a prominent mode switcher pill in the top Navigation Bar:

- **LIVE API Mode (`LIVE`)**:
  - Fetches real live weather telemetry from OpenWeatherMap via `/api/weather`.
  - Ingests real civic/social signals from X (Twitter) API v2 via `/api/social`.
  - Routes multi-lingual citizen reports to Gemini 2.0 Flash via `/api/gemini`.
  - Normalizes real observations into the NagarBodh Context Data Layer, Evidence Engine, and Priority Calculator.
  - Exposes explicit error states (`mode: "error"`) with HTTP status and reason if API keys are missing or requests fail. Does NOT fabricate fake "LIVE" data.

- **SIMULATION Mode (`SIMULATION`)**:
  - Uses deterministic simulation steps (`SIMULATION_STEPS`) and mock datasets for demonstrations.
  - Context data points are explicitly labeled as `mode: "simulation"` or `mode: "demo_fallback"`.

---

## 📊 External API Integration Status

| Provider / Integration | Real API Connected | Endpoint | Live Behavior | Error Handling |
| :--- | :---: | :--- | :--- | :--- |
| **OpenWeatherMap** | ✅ YES | `/api/weather` | Fetches live temp, humidity, pressure, wind, rain mm/hr, condition | Exposes `mode: "error"` with HTTP status |
| **X / Twitter API v2** | ✅ YES | `/api/social` | Searches live tweets for waterlogging/civic keywords | Exposes `mode: "error"` on CORS/Auth fail |
| **Google Gemini AI** | ✅ YES | `/api/gemini` | Gemini 2.0 Flash multi-lingual NLP analysis & vision | Uses fallback parser tagged `fallbackUsed: true` |
| **Geospatial Risk** | ⚠️ Simulated | Local Topography | Topographic basin model (`mode: "simulation"`) | Explicitly labeled as simulated baseline |
| **Historical Incidents** | ⚠️ Simulated | Local OLAP DB | 30d/90d recurrence metrics (`mode: "simulation"`) | Explicitly labeled as simulated baseline |
| **Admin Boundaries** | ⚠️ Simulated | Local Spatial Index | Delhi Ward 14/15/22 polygon bounds (`mode: "simulation"`) | Explicitly labeled as simulated baseline |
| **Critical Assets** | ⚠️ Simulated | Local GIS Registry | Proximity to schools, hospitals & transit (`mode: "simulation"`) | Explicitly labeled as simulated baseline |

---

## 🏛️ System Architecture & Data Flow

```
External APIs (OpenWeather, X API, Gemini 2.0)
       ↓
Server Proxy Layer (/api/weather, /api/social, /api/gemini)
       ↓
Providers (WeatherContextProvider, PublicSocialXProvider, SignalAnalystAgent)
       ↓
Signal Ingestion & Normalizer (SignalIngestionService)
       ↓
Civic Context Data Layer (CivicContextDataLayer)
       ↓
NagarBodh Context & Decision Engine (Priority Engine, SOP Response Planner)
       ↓
UI Layers (Live Map, WeatherBanner, Dossier, Authority Board, Verification)
```

---

## 🎮 Scripted Demo Engine Architecture

The Demo Command Center (`DemoCommandCenter`) dispatches real domain events into `CivicContext`:

- **Step 1-5**: Baseline signals & spatial clustering.
- **Step 6-7**: Priority Spike (Score: 94/100 Red Alert), SOP plan generated.
- **Step 8-10**: Officer approval (`APPROVED`), crew deployment (`DISPATCHED` → `ON_SITE`).
- **Step 11-13**: Mitigation (`RESOLVING`), field completion (`RESOLVED`), AI verification (`VERIFIED`).
