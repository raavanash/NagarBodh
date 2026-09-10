# NagarBodh — System Architecture Specification

## 1. High-Level Architecture Overview

NagarBodh is constructed on a hybrid architecture combining a high-performance React 19 client with a secure, zero-dependency Node.js / Vercel Serverless backend proxy.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER (React 19 + Vite)                  │
│                                                                             │
│  ┌──────────────┐   ┌─────────────────┐   ┌──────────────────────────────┐  │
│  │   Live Map   │   │ Incident Dossier│   │   Response Planner & Modal   │  │
│  │  (Leaflet +  │   │  (Explainable   │   │ (Human-in-the-loop Approval, │  │
│  │   OSM Tiles) │   │   Priority)     │   │   SOP Resource Allocation)   │  │
│  └──────┬───────┘   └────────┬────────┘   └──────────────┬───────────────┘  │
│         │                    │                           │                  │
│  ┌──────┴────────────────────┴───────────────────────────┴───────────────┐  │
│  │                   Canonical CivicContext State Engine                 │  │
│  │   - Unified 9-Stage Incident Lifecycle Management                     │  │
│  │   - Spatio-Temporal Clustering (Haversine + Time Decay)               │  │
│  │   - Closed-Loop Resolution Verification Telemetry                     │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│  ┌───────────────────────────────────┴───────────────────────────────────┐  │
│  │                       Civic Context Data Layer                        │  │
│  │   WeatherProvider ──► GoogleWeather / OpenWeather / Replay            │  │
│  │   AdminBoundaryProvider, CriticalAssetGIS, HistoricalLogProvider      │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
└──────────────────────────────────────┼──────────────────────────────────────┘
                                       │ HTTP /api/*
┌──────────────────────────────────────┼──────────────────────────────────────┐
│                                      ▼                                      │
│                  BACKEND & SERVERLESS PROXY LAYER                           │
│     (Vercel Serverless api/*.ts  &  Local Node server/apiProxy.ts)          │
│                                                                             │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────┐  │
│  │     /api/weather      │  │      /api/social      │  │   /api/gemini   │  │
│  │ (Google / OpenWeather │  │   (X API v2 Bearer    │  │ (Gemini 2.0     │  │
│  │      / Replay)        │  │     Search Stream)    │  │  Flash Proxy)   │  │
│  └───────────┬───────────┘  └───────────┬───────────┘  └────────┬────────┘  │
└──────────────┼──────────────────────────┼───────────────────────┼───────────┘
               │                          │                       │
               ▼                          ▼                       ▼
      Google / OpenWeather             X / Twitter         Google Generative AI
           Weather API                    API v2            (Gemini 2.0 Flash)
```

---

## 2. Core Architectural Components

### A. Frontend Client Layer
- **Framework**: React 19.2.8 + TypeScript 6.0.2 + Vite 8.2.2.
- **Styling**: Vanilla CSS tokens (`src/index.css`) with curated HSL color palette, dark mode, high-contrast indicators, and glassmorphism accents.
- **Geospatial Visualization**: Leaflet 1.9.4 utilizing standard, public OpenStreetMap raster tiles styled with an inverted high-contrast dark CSS filter. **Zero third-party mapping API keys required; zero broken tile risks.**
- **Icons**: Lucide React.
- **Schema Validation**: Zod 4.5.4 for strict runtime validation of AI outputs and ingestion payloads.

### B. Backend & Deployment Layer
- **Vercel Serverless Architecture**:
  - `api/weather.ts`: Proxies weather requests to Google Weather or OpenWeatherMap, keeping keys on the server.
  - `api/social.ts`: Proxies social signal searches to X API v2.
  - `api/gemini.ts`: Proxies prompt payloads to Google Gemini 2.0 Flash without client-side key transmission.
  - `vercel.json`: Handles API routes and SPA rewrites (`/(.*) -> /index.html`).
- **Local Dev & Standalone Server**:
  - `vite.config.ts`: Embeds `apiProxyPlugin()` during local development for identical API routing at `localhost:5173`.
  - `server/server.js`: Standalone Node HTTP server for containerized or custom server hosting at `localhost:3000`.

### C. Weather Provider Abstraction
```
WeatherProvider (Orchestrator)
├── GoogleWeatherProvider   (Live Hyperlocal Grid via Google Weather API / Maps Demo Key)
├── OpenWeatherProvider     (Live Regional Telemetry via OpenWeatherMap)
└── ReplayWeatherProvider   (Deterministic Historical Calibrated Simulation Baseline)
```
- Fallback hierarchy: `Google Weather` ──► `OpenWeatherMap` ──► `ReplayWeatherProvider`.
- If server keys are unconfigured, the system never fabricates live data; it returns explicit fallback markers and honest replay data.

### D. Incident Clustering & Priority Engine
- **Clustering**: Deterministic spatial proximity (Haversine formula within 450m radius) + temporal window (45 minutes) + category matching.
- **Priority Calculation**:
  $$\text{Score (0-100)} = \text{Severity (25)} + \text{Velocity (25)} + \text{Population (20)} + \text{Critical Asset (15)} + \text{Environmental Risk (10)} + \text{Recurrence/SLA (10)}$$
- Fully auditable: Gemini generates explanations, but code calculates the priority score deterministically.

---

## 3. Implementation Status Classification

| Component | Status | Environment / Provenance |
| :--- | :--- | :--- |
| **Multilingual NLP Ingestion** | **IMPLEMENTED** | Gemini 2.0 Flash (`/api/gemini`) with deterministic fallback parser |
| **Clustering Engine** | **IMPLEMENTED** | Deterministic Spatio-Temporal Haversine (`src/engine/clusteringEngine.ts`) |
| **Deterministic Priority Engine** | **IMPLEMENTED** | 6-Factor Multi-Criteria Scoring (`src/engine/priorityEngine.ts`) |
| **Canonical 9-State Lifecycle** | **IMPLEMENTED** | Single Source of Truth in `CivicContext` (`EMERGING` to `VERIFIED`) |
| **Response Planner & Human Modal** | **IMPLEMENTED** | SOP Matching with Human Review, Edit, Approve, Reject |
| **Resolution Verification Engine** | **IMPLEMENTED** | Signal reduction delta & sentiment verification |
| **OpenWeatherMap Integration** | **LIVE / IMPLEMENTED** | Live API when `OPENWEATHER_API_KEY` configured; Replay fallback |
| **X (Twitter) API Integration** | **LIVE / IMPLEMENTED** | Live API v2 when `X_BEARER_TOKEN` configured; Replay fallback |
| **Google Weather Integration** | **IMPLEMENTED** | Supports Google Weather API / Maps Demo Key via `/api/weather?provider=google` |
| **Administrative Ward Boundaries** | **SIMULATION** | High-fidelity polygon boundaries for Delhi Wards 14, 15, and 22 |
| **Critical Asset GIS Proximity** | **SIMULATION** | Delhi NCR schools, hospitals, and transit hubs registry |
| **Historical Recurrence Logs** | **SIMULATION / REPLAY**| 90-day municipal recurrence baseline model |
| **IMD Radar Telemetry Integration** | **FUTURE INTEGRATION**| Formal access requires government departmental authorization |
