# NagarBodh (नगर बोध) — Autonomous Municipal Intelligence Platform

NagarBodh is an AI-powered municipal command center for real-time civic incident detection, clustering, context enrichment, priority calculation, dynamic response planning, human-in-the-loop dispatch, and AI resolution verification.

---

## 🏛️ System Architecture

- **Frontend**: React 18, TypeScript, Vite, Custom Minimal UI System (Vanilla CSS + CSS Variables)
- **Map Layer**: Leaflet / React-Leaflet with OpenStreetMap dark tile raster renderer
- **Testing**: Vitest (`npx vitest run`) with 59 automated test cases across 12 test suites

---

## 🔄 Canonical State & Lifecycle Architecture

### 1. Overview
NagarBodh enforces **ONE Canonical Source of Truth** for civic incidents across all 7 operational screens (`Live Map`, `Incident Intelligence`, `Signal Explorer`, `Response Planner`, `Authority Board`, `Resolution Verification`, and `Demo Engine`). No screen maintains an independent copy of incident lifecycle state.

### 2. Architectural Data Flow

```
Signal Ingestion (Citizen, X/Social, 311, Grievance)
       ↓
Signal Analyst Agent
       ↓
Incident Clusterer
       ↓
Canonical Incident Store (CivicContext)
       ↓
Context Enrichment (IMD Weather, Asset Exposure)
       ↓
Priority Engine (0-100 Score & Factor Breakdown)
       ↓
Response Planner (Dynamic SOP Recommendation)
       ↓
Human Officer Approval & Dispatch
       ↓
Field Resolution & Telemetry
       ↓
AI Resolution Verification
```

### 3. Strongly Typed 9-State Lifecycle Machine

All incidents progress through a strongly typed, validated 9-state lifecycle enum:

```ts
export type IncidentStatus =
  | 'emerging'          // Initial signal cluster detected
  | 'triaged'           // Severity and ward validated
  | 'dispatch_pending'  // SOP action plan generated
  | 'approved'          // Officer approved dispatch
  | 'dispatched'        // Emergency response unit deployed
  | 'on_site'           // Crew arrived at target location
  | 'resolving'         // Active remediation underway
  | 'resolved'          // Crew confirmed issue resolved
  | 'verified';         // AI verified resolution via signals & telemetry
```

### 4. Centralized Transition Mechanism

Every state transition is strictly governed by `transitionIncidentState(incidentId, nextState, actor, notes)` inside `CivicContext`:

```ts
// Example state transition invocation
transitionIncidentState(
  'inc-w15-01',
  'approved',
  'Officer Sharma (Command Center)',
  'Approved 2x Submersible Pumps + Crew Dispatch'
);
```

#### Transition Execution Rules:
1. **Transition Validation**: Ensures state moves strictly through allowed forward/reversal paths, rejecting illegal state jumps (e.g. `emerging` directly to `verified`).
2. **State History Tracking**: Records a `StateTransitionRecord` in `incident.statusHistory`.
3. **Audit Event Logging**: Logs a structured `PlanAuditEvent` in `incident.actionPlan.auditTrail`.
4. **Subscriber Notification**: React context triggers instant, synchronous re-renders across all 7 screens.

---

## 🎮 Demo Engine Architecture

The Demo Command Center (`DemoCommandCenter`) does not maintain parallel fake UI states. All demo control steps dispatch real domain events and state transitions into the canonical `CivicContext` store:

- **Step 1-5 (Emergence & Ingestion)**: Ingests synthetic signals, triggers spatial clustering, attaches IMD rainfall context.
- **Step 6-7 (Priority Spike & SOP)**: Priority reaches Critical (Score: 94/100), generates `DynamicResponsePlan`.
- **Step 8-10 (Approval & Dispatch)**: Human officer approves, state transitions `APPROVED` → `DISPATCHED` → `ON_SITE`.
- **Step 11-13 (Resolution & Verification)**: Crew resolves issue, AI verifies signal reduction, state transitions `RESOLVING` → `RESOLVED` → `VERIFIED`.

### Synchronous Screen Consistency
When Demo Mode reaches **Step 13 (VERIFIED)**:
- **Live Map**: Displays `VERIFIED / RESOLVED` badge with green indicator.
- **Incident Intelligence**: Dossier badge reflects `VERIFIED`.
- **Response Planner**: Action plan status reads `COMPLETED / VERIFIED`.
- **Authority Board**: Active incident counter decrements, verified counter increments.
- **Resolution Verification**: Displays `100% VERIFIED` AI conclusion.

---

## 🧪 Automated Testing & Verification

Run the test suite:
```bash
npx vitest run
```

Run the production build:
```bash
npm run build
```

- **Test Results**: 12 passed test suites (59/59 unit tests passed).
- **TypeScript Build**: Clean compilation (`npx tsc -b`) with 0 errors.

---

## ⚠️ Technical Risks & Mitigations

1. **Third-Party API Rate Limits**: External APIs (such as Twitter/X) enforce browser CORS and rate limits. NagarBodh uses robust local JSON fallback providers (`/mock/social_x_mock.json`).
2. **Map Render Engine**: OpenStreetMap raster tiles with dark CSS filter (`brightness(0.65) invert(1) contrast(2.2)`) are used to prevent third-party vector map tile key requirements or watermarks.
