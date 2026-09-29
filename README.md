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

The system helps answer five practical municipal questions:

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
           ↓

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