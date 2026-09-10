# NagarBodh — Data Provenance & Integrity Architecture

## 1. Core Principles of Data Honesty

In government intelligence systems, **false claims of live connectivity destroy operational trust**. NagarBodh adheres to strict data provenance rules:
1. **Never masquerade simulation data as live government data.**
2. **Never claim live connection unless the API is actually reached and returns HTTP 200.**
3. **Clearly distinguish between OBSERVED facts, CALCULATED metrics, INFERRED analysis, and RECOMMENDED actions.**
4. **Never represent third-party or simulated weather as official IMD (India Meteorological Department) data.**

---

## 2. Ingestion Modes: LIVE vs REPLAY vs SIMULATION

Every piece of data entering the NagarBodh engine carries an explicit metadata envelope:

| Ingestion Mode | Meaning & Provenance | Visual Indicator |
| :--- | :--- | :--- |
| **`LIVE`** | Authenticated, real-time HTTP payload fetched from an external production API during the current session. | Green badge `[LIVE]` |
| **`REPLAY`** | Pre-recorded, calibrated historical sequence played back with exact chronological fidelity for testing and demonstration. | Amber badge `[REPLAY]` |
| **`SIMULATION`** | Synthetic baseline modeling data (e.g., ward boundary coordinates, static asset registers, topographic elevation). | Purple badge `[SIMULATION]` |

---

## 3. The 4 Evidence Classifications

NagarBodh categorizes every analytical finding into one of four standardized evidence types:

### 1. `OBSERVED`
- **Definition**: Direct empirical data captured from sensors, citizen texts, or photographs. Zero algorithmic speculation.
- **Examples**:
  - Citizen signal: `"[OBSERVED] SOS!! St. Jude primary school yellow van trapped in flood water"`
  - Live weather reading: `"[OBSERVED] Live precipitation: 24.0 mm/hr (OpenWeather Station)"`

### 2. `CALCULATED`
- **Definition**: Mathematical computations produced by deterministic algorithms from verified observations.
- **Examples**:
  - Signal velocity: `"[CALCULATED] Arrival velocity: 22 reports/hr (+280% acceleration surge)"`
  - Asset proximity: `"[CALCULATED] Distance to St. Jude School: 120m from incident centroid"`
  - Numerical priority: `"[CALCULATED] Deterministic priority score: 94/100 (P1 · Critical)"`

### 3. `INFERRED`
- **Definition**: Analytical deductions produced by AI models or statistical correlation.
- **Examples**:
  - Hazard root-cause: `"[INFERRED] Probable storm drain bottleneck due to low-lying subway elevation"`
  - Resolution status: `"[INFERRED] 87% signal reduction indicates floodwaters receded below roadway"`

### 4. `RECOMMENDED`
- **Definition**: Prescriptive operational advice submitted for human municipal review.
- **Examples**:
  - Action item: `"[RECOMMENDED] Deploy 2x 500 HP mobile dewatering pumps to Sector 15 underpass"`
  - Traffic routing: `"[RECOMMENDED] Issue localized diversion notice on NH-48 feeder road"`

---

## 4. Provider Provenance Audit

| Provider | Supported Mode | Actual Live Endpoint | Replay / Simulation Fallback Behavior |
| :--- | :---: | :--- | :--- |
| **Google Weather API** | `LIVE` / `REPLAY` | `https://weather.googleapis.com/v1/currentConditions:lookup` | If unconfigured or quota exceeded, falls back to OpenWeatherMap or Replay. Labeled `[REPLAY]` if key is missing. |
| **OpenWeatherMap** | `LIVE` / `REPLAY` | `https://api.openweathermap.org/data/2.5/weather` | If `OPENWEATHER_API_KEY` is missing, returns explicit `fallbackUsed: true` and labeled `[REPLAY]`. |
| **X (Twitter) API v2** | `LIVE` / `REPLAY` | `https://api.twitter.com/2/tweets/search/recent` | If `X_BEARER_TOKEN` is missing, delivers calibrated scenario tweets labeled `[REPLAY]`. |
| **India Meteorological Department (IMD)** | `NOT CONNECTED` | *None* | **Formal notice**: Real-time official IMD radar telemetry requires government departmental authorization not available for this prototype. Non-IMD data is never disguised as IMD. |
| **Municipal GIS Registry** | `SIMULATION` | Local GeoJSON indices | Standardized ward boundaries and critical asset locations for Delhi NCR. |
