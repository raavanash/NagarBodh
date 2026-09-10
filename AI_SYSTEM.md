# NagarBodh — AI System Architecture & Responsible Governance

## 1. AI System Overview

NagarBodh leverages **Google Gemini 2.0 Flash** as a specialized reasoning and multilingual extraction engine. Generative AI is deployed strictly where it offers superior capability—understanding nuanced human language, cross-lingual entity recognition, and contextual synthesis—while deterministic algorithms handle numerical scoring, spatial clustering, and state transitions.

---

## 2. Multilingual Understanding & Taxonomy Extraction

In urban India, citizens report emergencies in a mixture of languages and scripts:
- **Formal English**: *"Severe waterlogging under the subway at Sector 15."*
- **Devanagari Hindi**: *"सेक्टर 15 अंडरपास में 4 फीट पानी भर गया है, बस फंसी हुई है।"*
- **Hinglish (Code-Mixed)**: *"Sector 15 underpass me paani bohot bhar gaya hai, yellow school van doob rahi hai SOS!"*

### Extraction Tasks Performed by Gemini:
1. **Category Classification**: Standardizes reports into municipal taxonomy (`waterlogging`, `road_hazard`, `drainage`, `garbage`, `electricity`, `traffic`).
2. **Severity Assessment**: Determines reported severity (`low`, `medium`, `high`, `critical`) based on physical danger indicators.
3. **Landmark & Entity Extraction**: Identifies local landmarks, metro pillars, institutions, and transit points without hallucinating GPS coordinates.
4. **Sentiment & Urgency Scoring**: Evaluates distress markers to prioritize life-safety concerns.

---

## 3. The 3-Tier Fact Separation Architecture

To prevent generative hallucinations from infiltrating municipal records, the AI prompt enforces a strict 3-tier fact separation schema:

```json
{
  "OBSERVED": {
    "verbatimText": "Raw quote from citizen",
    "landmarksMentioned": ["Sector 15 Underpass", "St. Jude Primary School Van"],
    "physicalCondition": "Yellow school bus submerged up to wheel arches"
  },
  "INFERRED": {
    "rootCause": "Localized storm drain surcharge exacerbated by low-lying underpass elevation",
    "urgencyAssessment": "Critical life-safety hazard due to stranded school children",
    "cascadeRisks": ["Feeder traffic gridlock on NH-48", "Electrical short circuit from submerged junction box"]
  },
  "RECOMMENDED": {
    "suggestedDepartment": "MCD Dewatering Wing",
    "secondaryAgencies": ["Traffic Police", "Civil Defence"],
    "initialActions": ["Deploy 500 HP mobile pump unit", "Set up diversion at NH-48 feeder"]
  }
}
```

- `OBSERVED`: Ground truth verified from the citizen's text/photo.
- `INFERRED`: Analytical interpretations by the model.
- `RECOMMENDED`: Non-binding suggestions submitted for human officer review.

---

## 4. Fault Tolerance & Deterministic Fallback

To ensure 100% demo reliability and zero runtime crashes:

### A. Malformed JSON Recovery Parser
If Gemini returns markdown fences (````json ... ````) or malformed trailing commas, `SignalAnalystAgent.recoverAndParseJSON()` cleans the response before passing it to `Zod` validation.

### B. Offline Deterministic Fallback Engine
If the network is offline, the Gemini API key is missing, or Google Cloud returns a rate limit (HTTP 429), `SignalAnalystAgent.buildFallbackOutput()` triggers automatically. It runs local regex-based keyword parsing, assigns standardized categories, and attaches an `AgentTrace` marked `fallbackUsed: true`. **The platform never hangs in an infinite loading state.**

---

## 5. Division of Responsibilities: AI vs Deterministic Code

| Function | Responsible Engine | Rationale |
| :--- | :--- | :--- |
| **Language Translation & Parsing** | **Gemini 2.0 Flash** | Handles informal Hinglish, slang, and Devanagari accurately |
| **Spatial Radius Clustering** | **Deterministic Code** | Haversine distance must be mathematically verifiable |
| **Numerical Priority (0–100)** | **Deterministic Code** | Eliminates subjective score drift; reproducible in court/audit |
| **Audit Log Generation** | **Deterministic Code** | Immutable, timestamped audit trail of all state transitions |
| **Lifecycle Transitions** | **Deterministic Code** | Single canonical state machine prevents desynchronized UI |
| **Response Authorization** | **Human Authority** | Municipal commanders retain legal responsibility for dispatch |
