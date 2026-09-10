# NagarBodh — Flagship Demo Guide

## Scenario: Urban Waterlogging & Transit Crisis (Sector 15 Underpass)
**Target**: Demonstrate complete closed-loop lifecycle from emerging citizen distress to AI resolution verification under 5 minutes.

---

## 1. Quick Launch
1. Ensure the dev server is active:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:5173/` in your browser.
3. The platform boots directly into **Sector 15 Command Mode** with the Live Map active.

---

## 2. Step-by-Step Judging Walkthrough

### Phase 1: Signal Ingestion & Multilingual Understanding (08:00 AM – 09:30 AM)
- **What to Observe**:
  - The map loads with OpenStreetMap high-contrast dark tiles centered on the Delhi NCR corridor.
  - Telemetry bar shows current weather and baseline civic status.
  - In the bottom playback bar, click **Play** (or step through with **Step Forward**).
  - As simulated time advances to 09:30 AM, citizen signals in English, Hindi, and Hinglish begin trickling in:
    - *"Sector 15 underpass me paani bhar gaya hai..."*
    - *"Dewatering pump not functioning near subway..."*
- **Action**: Switch to the **Signal Explorer** tab to inspect normalized NLP fact separation:
  - Click on any signal to see `[OBSERVED]` facts, detected language, and confidence score.

### Phase 2: Spatio-Temporal Clustering & Priority Spike (10:00 AM)
- **What to Observe**:
  - Click **"Trigger Waterlogging Surge (10:00 AM)"** button or jump to Step 8.
  - Weather shifts to **Red Alert** (45 mm/hr torrential rainfall).
  - 14 citizen signals across X, 155304 / 112 Helpline, and Citizen App cluster into a single critical incident:
    `"Waterlogging at Sector 15 Underpass"`.
  - Priority spikes to **94 / 100 (P1 · Critical)**.
  - The map displays a prominent pulsing red cluster marker with a 450m hazard perimeter.
- **Action**: Switch to the **Incident Intelligence** tab:
  - View the 6-factor deterministic priority breakdown (Severity: 24, Velocity: 23, Population: 18, Asset: 14, Weather: 8, SLA: 7).
  - Review the evidence chain linking to the stranded yellow school van and St. Jude School (120m away).

### Phase 3: Response Planning & Human-in-the-Loop Approval (10:15 AM)
- **What to Observe**:
  - The top navigation bar displays a golden notification badge on **Response Planner**.
  - Click **Response Planner**: The system displays the automated SOP action plan:
    - Primary Department: *MCD Dewatering Wing*
    - Recommended Units: *2x High-Capacity Dewatering Pumps (500 HP)*, *Emergency Traffic Barriers*
    - Calculated ETA: *25 minutes*
- **Action**:
  - Click **"Review & Authorize Plan"** to open the **Human Approval Modal**.
  - Point out that **AI cannot unilaterally dispatch municipal resources**.
  - Inspect the editable fields: officer notes, assigned department, and action items.
  - Click **"✅ Grant Approval & Dispatch"**.
  - The incident status transitions immediately: `APPROVED ──► DISPATCHED`.

### Phase 4: Field Operations & Physical Progress (10:30 AM – 11:30 AM)
- **What to Observe**:
  - Advance the simulation steps to 10:45 AM and 11:15 AM.
  - Field crews report arrival: status transitions to `ON_SITE`.
  - Pumping begins; flood depth drops from 45 cm to 10 cm.
  - Status advances to `RESOLVING`.
  - All screens (Live Map, Dossier, Response Planner, Authority Board) reflect the **same canonical status**.

### Phase 5: AI Closed-Loop Resolution Verification (12:00 PM – 12:15 PM)
- **What to Observe**:
  - Advance to Step 14 (12:15 PM).
  - Citizen confirmation signals arrive: *"Traffic moving smoothly under subway now, water cleared."*
  - Status advances to `RESOLVED` and then **`VERIFIED`**.
- **Action**: Switch to **Resolution Verification** tab:
  - Inspect the post-resolution metrics:
    - **Signal Reduction**: -87% drop in distress reports.
    - **Time to Resolution**: 2 hours 18 minutes (within the 2.5 hr SLA).
    - **AI Verification Confidence**: 94%.
  - Point out the closed-loop audit entry added to the immutable audit timeline.

---

## 3. Demo Resilience Checklist
- ✅ Offline-capable: Scenario runs completely deterministically without external internet.
- ✅ Zero API failure risk: If live API keys are missing, the app continues seamlessly in calibrated replay mode.
- ✅ Single canonical state: No screen ever shows a contradictory lifecycle status.
- ✅ Free OSM map tiles: Zero tile errors, zero Mapbox/Google watermark warnings.
