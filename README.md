# NagarBodh (नगर बोध)

## Municipal Intelligence for Explainable Public Investment Decisions

> **Code for Communities 2.0 Hackathon Submission**  
> **Category:** AI for Digital Public Infrastructure & Governance

NagarBodh turns fragmented citizen signals and public context into **explainable municipal investment decisions with projected impact**.

It is designed around a simple decision flow:

**City Signals → Civic Intelligence → Government Decision → Intervention → Projected Impact**

Unlike a conventional complaint dashboard, NagarBodh does not stop at recording what citizens report. It connects signals to spatial and public-context evidence, calculates explainable intervention priorities, generates an AI-assisted decision brief, keeps the final intervention under human authority, and models the expected impact of that intervention.

---

# 🏛️ Core Product Statement

> **NagarBodh turns fragmented citizen signals and public context into explainable investment decisions with projected impact.**

The system helps answer four practical municipal questions:

| Stage | Question |
|---|---|
| **INVEST** | Where does intervention matter most? |
| **MAP** | Where is the problem occurring and what surrounds it? |
| **DECIDE** | What evidence supports the intervention decision? |
| **IMPACT** | What outcome does the proposed intervention project? |

The final decision remains under **human authority**. NagarBodh organizes evidence, calculates deterministic intelligence, and explains the recommendation; it does not autonomously allocate public funds.

---

# 🧭 Product Flow

```text
Citizen & Public Signals
          ↓
   Civic Intelligence
          ↓
Spatial + Contextual Evidence
          ↓
Explainable Priority & Investment Gap
          ↓
     Human Decision
          ↓
   Intervention Record
          ↓
Projected / Modelled Impact
```

The primary application experience follows:

**INVEST → MAP → DECIDE → IMPACT**

Additional analytical tools are available under **MORE**, including Citizen Signals & Telemetry, Policy Intelligence, Historical Dossiers, and Scenario Lab.

---

# 💡 What NagarBodh Actually Does

### 1. Collects fragmented signals

NagarBodh can work with citizen reports, public social signals, weather telemetry, and other contextual inputs.

Signals can originate from multiple channels and are kept distinguishable by provenance rather than being treated as interchangeable ground truth.

### 2. Converts signals into civic intelligence

Deterministic engines evaluate factors such as:

- citizen demand pressure
- infrastructure deficit
- vulnerability
- population exposure
- contextual evidence
- investment requirements

The resulting priority is explainable and inspectable rather than generated as an opaque AI score.

### 3. Connects intelligence to investment

NagarBodh translates identified civic gaps into an investment-oriented decision view, including:

- priority score
- intervention priority
- infrastructure context
- estimated investment gap
- vulnerable population
- projected beneficiaries
- supporting evidence

### 4. Keeps humans in control

NagarBodh recommends and explains.

A human decision-maker remains responsible for approving an intervention.

> **The system recommends. The human authorizes.**

### 5. Projects the expected impact

After an intervention is authorized in the demonstration workflow, NagarBodh models the expected outcome using its deterministic impact engine.

These values are explicitly presented as:

**PROJECTED / MODELLED**

They are not represented as measured real-world government outcomes.

---

# 🧠 AI Architecture

NagarBodh deliberately separates **deterministic civic intelligence** from **AI-generated explanation**.

### Deterministic Layer

Core civic calculations are performed by local deterministic engines.

These include:

- development gap analysis
- development priority scoring
- investment recommendations
- decision brief inputs
- impact modelling
- response planning
- scenario calculations

The deterministic layer establishes the canonical numerical values used by the application.

### Gemini Explanation Layer

Gemini is used to transform the established evidence and calculated recommendation into an understandable decision brief.

Gemini does **not**:

- override the canonical priority score
- recalculate the investment gap
- invent evidence
- replace deterministic scoring
- change projected impact values

This separation makes the AI layer explainable and auditable.

---

# 🔎 Evidence & Data Provenance

NagarBodh explicitly distinguishes different kinds of information.

| Label | Meaning |
|---|---|
| **[OBSERVED]** | Directly observed citizen or system signal |
| **[EXTERNAL PUBLIC SIGNAL]** | Public external signal such as Bluesky activity |
| **[BASELINE CONTEXT]** | Official or contextual public information used to understand the situation |
| **[CALCULATED]** | Deterministic value calculated by NagarBodh |
| **[PROJECTED]** | Modelled future outcome |
| **[SIMULATION]** | Temporary synthetic or operational demonstration state |
| **[LIVE STREAM]** | Incoming live provider telemetry |
| **[REPLAY]** | Deterministic replay/fallback data |

This provenance is surfaced directly in the evidence interface so users can distinguish:

**what was observed → what was sourced → what was calculated → what was projected.**

---

# 🌐 External Evidence Integrations

## Delhi Government / OGD Context

NagarBodh integrates contextual government data through the Open Government Data ecosystem.

The current integration includes Delhi government hospital/facility information used as:

> **[BASELINE CONTEXT]**

This contextual evidence helps enrich an investment dossier without artificially attributing facilities to a specific hotspot when the underlying source does not provide that level of spatial precision.

The OGD API credential is kept server-side.

---

## Bluesky Public Signals

NagarBodh can consume public Bluesky activity as:

> **[EXTERNAL PUBLIC SIGNAL]**

These signals provide corroborative public context around civic issues such as waterlogging.

Bluesky signals are **not treated as canonical citizen complaints or ground truth**, and they do not directly alter the canonical priority calculation.

---

## Weather Telemetry

Weather context can be obtained through the existing weather provider chain:

- Google Weather
- OpenWeatherMap
- deterministic replay fallback

Provider availability is surfaced explicitly rather than presenting replay data as live telemetry.

---

# 🧪 Scenario Lab

NagarBodh includes a sandboxed **Scenario Lab** for bounded what-if analysis.

Users can vary assumptions such as:

- population
- vulnerable population
- signal volume
- infrastructure index

It also includes predefined stress scenarios such as:

- **Monsoon Inflow Surge**
- **Rapid Sector Growth**
- **Pre-emptive Drainage Upgrade**

Scenario calculations reuse NagarBodh's existing deterministic engines.

### Scenario Provenance

```text
Scenario Inputs
    [SIMULATION]
         ↓
Deterministic Calculations
    [CALCULATED]
         ↓
Projected Outcomes
    [PROJECTED]
```

### Sandbox Guarantee

Scenario Lab changes are temporary.

They do **not** modify:

- canonical investment recommendations
- live data
- intervention records
- simulation state
- canonical decision values

This allows users to explore assumptions without contaminating the actual decision workflow.

---

# 📍 Demonstration Scenario

The flagship demonstration uses a Delhi civic waterlogging scenario centred on **Sector 15**.

The canonical demonstration values are:

| Metric | Value |
|---|---:|
| **Priority** | **94 / 100** |
| **Priority Level** | **P1** |
| Population | **184,000** |
| Vulnerable Population | **45,000** |
| Vulnerable Ratio | **24.5%** |
| Vulnerability Index | **91 / 100** |
| Citizen Signals | **32** |
| Investment Gap | **₹350L** |
| Projected Impact | **84 / 100** |
| Projected Beneficiaries | **119,600** |

These values are produced by NagarBodh's canonical deterministic engines and are kept stable across the demonstration flow.

---

# 🗺️ Application Experience

## INVEST

The investment intelligence view identifies where intervention matters.

It surfaces:

- priority capital intervention queue
- priority scores
- infrastructure deficits
- vulnerable population
- estimated investment gap
- projected impact
- evidence access

The goal is not simply to display complaints, but to help frame an investment decision.

---

## MAP

The map provides the spatial evidence layer.

It helps users understand:

- where signals are concentrated
- where hotspots occur
- surrounding infrastructure
- spatial context
- supporting evidence

The map supports the decision; it is not the product's endpoint.

---

## DECIDE

The decision workflow brings together:

- citizen signals
- public contextual evidence
- government baseline context
- deterministic calculations
- investment gap
- recommendation rationale
- AI-generated explanation

The **Explainable Investment Dossier** is the canonical evidence view.

---

## HUMAN AUTHORITY

NagarBodh does not automatically authorize public intervention.

The workflow explicitly separates:

**AI-assisted recommendation**

from

**human authorization.**

Once approved within the demonstration workflow, the intervention is recorded in the simulated operational registry.

---

## IMPACT

The impact view shows the expected effect of the proposed intervention.

Examples include:

- projected infrastructure improvement
- projected demand reduction
- projected beneficiaries
- projected impact score

These values are clearly labelled **PROJECTED / MODELLED**.

NagarBodh does not claim that a simulated intervention constitutes a measured real-world government outcome.

---

# 🏗️ Technical Architecture

```text
                    ┌─────────────────────┐
                    │  Citizen / Public   │
                    │      Signals        │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │   Evidence Layer    │
                    │ Provenance + Context │
                    └──────────┬──────────┘
                               ↓
              ┌────────────────────────────────┐
              │     Deterministic Engines      │
              │                                │
              │ • Priority                     │
              │ • Development Gap               │
              │ • Recommendation                │
              │ • Decision Brief Inputs         │
              │ • Impact                        │
              │ • Scenario Simulation           │
              └───────────────┬────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │  Investment /       │
                    │  Decision Dossier   │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Gemini Explanation   │
                    │      Layer           │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Human Authorization │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Intervention Record │
                    │    [SIMULATION]     │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Projected Impact    │
                    │    [PROJECTED]      │
                    └─────────────────────┘
```

---

# 🔐 Security Architecture

NagarBodh uses a server-side proxy architecture for external credentials.

Provider credentials are never intended to be bundled into client-side JavaScript.

Relevant server-side components include:

```text
server/apiProxy.ts
api/*.ts
```

The architecture supports server-side handling of:

- Gemini credentials
- weather provider credentials
- OGD credentials
- other external provider credentials

### Production Security Note

If API keys were previously used during development or testing, they should be rotated through the respective provider consoles before production deployment.

---

# ⚙️ Environment Variables

Create a `.env.local` file in the project root for optional live integrations.

Example:

```ini
# Server-side provider credentials

GEMINI_API_KEY=your_gemini_api_key

GOOGLE_WEATHER_API_KEY=your_google_weather_api_key

OPENWEATHER_API_KEY=your_openweather_api_key

DATAGOVINDIA_API_KEY=your_data_gov_india_api_key
```

The application can operate using replay/simulation data without requiring all live provider credentials.

**Never commit `.env.local` or provider secrets to source control.**

---

# 🔄 LIVE vs REPLAY vs SIMULATION

## LIVE

Uses configured external providers where available.

Examples:

- live weather telemetry
- live public social signals
- live Gemini explanation
- live OGD requests

Unavailable providers must surface their fallback state rather than silently presenting replay data as live.

---

## REPLAY

Provides deterministic replay data for:

- offline demonstrations
- testing
- judging environments
- environments without provider credentials

Replay data is explicitly labelled.

---

## SIMULATION

Represents synthetic operational state used for:

- demonstration workflows
- intervention records
- scenario analysis
- controlled civic decision experiments

Simulation state is not presented as real-world government action.

---

# 📊 Feature & Integration Status

| Capability | Status | Provenance / Mode |
|---|---|---|
| Explainable Priority Engine | **IMPLEMENTED** | CALCULATED |
| Development Gap Engine | **IMPLEMENTED** | CALCULATED |
| Investment Recommendation Engine | **IMPLEMENTED** | CALCULATED |
| Explainable Investment Dossier | **IMPLEMENTED** | Evidence-driven |
| Gemini Decision Explanation | **IMPLEMENTED** | AI explanation |
| Human Approval Workflow | **IMPLEMENTED** | Human authority |
| Projected Impact Engine | **IMPLEMENTED** | PROJECTED |
| Scenario Lab | **IMPLEMENTED** | SIMULATION / CALCULATED / PROJECTED |
| Interactive Leaflet Map | **IMPLEMENTED** | Spatial evidence |
| Weather Integration | **IMPLEMENTED** | LIVE / REPLAY |
| Bluesky Public Signals | **IMPLEMENTED** | EXTERNAL PUBLIC SIGNAL |
| Delhi Government Hospital Context | **IMPLEMENTED** | BASELINE CONTEXT / REPLAY |
| OGD Server Proxy | **IMPLEMENTED** | Server-side |
| Historical Incident Dossiers | **IMPLEMENTED** | Historical context |
| Policy Intelligence | **IMPLEMENTED** | Analytical context |
| Official IMD Radar | **FUTURE** | Requires appropriate authorization |

---

# 🧪 Verification

The final implementation has been validated with:

```bash
npm test
```

**36 test files — 215 tests passing**

TypeScript project compilation:

```bash
npx tsc -b
```

**0 TypeScript errors**

Production build:

```bash
npm run build
```

**Successful production build**

The verification suite includes coverage for:

- deterministic scoring
- evidence provenance
- external evidence isolation
- OGD integration
- scenario sandbox invariance
- intervention workflow
- impact modelling
- canonical values
- AI explanation boundaries

---

# 🚀 Quickstart

## 1. Install dependencies

```bash
npm install
```

## 2. Run the test suite

```bash
npm test
```

## 3. Type-check the project

```bash
npx tsc -b
```

## 4. Build for production

```bash
npm run build
```

## 5. Start the development server

```bash
npm run dev
```

The Vite development server runs locally at:

```text
http://localhost:5173
```

---

# 🎬 Five-Minute Demonstration Flow

The recommended judging flow is:

### 00:00 — INVEST

Introduce the problem:

> Cities have abundant citizen signals. The harder problem is turning those fragmented signals into defensible public investment decisions.

Show the Sector 15 priority.

### 00:30 — Investment Intelligence

Show:

- Priority 94/100
- vulnerable population
- infrastructure deficit
- ₹350L investment gap

Explain that the core calculation is deterministic and inspectable.

### 01:15 — MAP

Move into spatial evidence.

Show where the problem occurs and the contextual infrastructure around it.

Do not turn this into a generic map demonstration.

### 01:50 — DECIDE

Open the evidence dossier.

Show the separation between:

- observed signals
- public signals
- government baseline context
- calculated intelligence
- projected outcomes

Then show the Gemini-generated explanation.

### 02:40 — HUMAN AUTHORITY

Show the approval workflow.

Key message:

> **The system recommends. The human authorizes.**

### 03:20 — IMPACT

Show:

- projected impact: **84/100**
- projected beneficiaries: **119,600**

Make the distinction explicit:

> These are modelled projected outcomes, not measured real-world government results.

### 04:05 — SCENARIO LAB

Open Scenario Lab through **MORE**.

Change an assumption, calculate the scenario, inspect the delta, then reset it.

Demonstrate that the sandbox does not alter the canonical recommendation.

### 04:45 — Close

> **NagarBodh isn't another complaint dashboard. It connects citizen signals to civic intelligence, turns that intelligence into an explainable investment decision, keeps humans in control of intervention, and makes projected impact visible.**

> **From citizen signal to public investment decision — with evidence at every step.**

---

# ⚠️ Data Honesty & Limitations

NagarBodh intentionally distinguishes between different levels of evidence.

It does not claim:

- that public social posts represent all citizens
- that external public signals are ground truth
- that replay data is live data
- that simulated interventions have physically occurred
- that projected impact is measured real-world impact
- that AI-generated explanations are independent evidence

External datasets may have incomplete geographic precision, provider availability constraints, latency, or coverage limitations.

Government data used as contextual evidence is labelled accordingly.

The system is designed as a **decision-support and civic intelligence platform**, not as an autonomous public-sector decision-maker.

---

# 📚 Documentation

Additional project documentation:

| Document | Purpose |
|---|---|
| **HACKATHON_ALIGNMENT.md** | Mapping NagarBodh to the Code for Communities 2.0 governance challenge |
| **ARCHITECTURE.md** | Technical architecture and data flow |
| **AI_SYSTEM.md** | Gemini integration and AI guardrails |
| **DATA_PROVENANCE.md** | Evidence provenance and data classification |
| **DEMO_GUIDE.md** | Flagship judging walkthrough |
| **LIMITATIONS.md** | Scope, limitations, and future integrations |
| **SECURITY.md** | Security architecture and credential handling |

---

# 🏁 Project Positioning

NagarBodh is built around a simple principle:

> **Public investment decisions need more than complaints. They need evidence, context, explainability, human authority, and a clear view of expected impact.**

NagarBodh provides that evidence layer between fragmented civic signals and public investment decisions.

**Signals → Intelligence → Decision → Intervention → Projected Impact**
