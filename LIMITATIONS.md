# NagarBodh — Limitations & Prototype Scope

## 1. Prototype Scope & Environment Boundaries

NagarBodh was designed and engineered as a high-fidelity **prototype and demonstration platform** for the Code for Communities 2.0 hackathon. It is not an active production deployment within Delhi municipal agencies (MCD, NDMC, or Delhi Traffic Police).

---

## 2. Specific Technical Limitations

### A. Weather Data Sources & IMD Authorization
- **Official IMD Radar Access**: The India Meteorological Department (IMD) operates Doppler Weather Radars across Delhi NCR. However, real-time automated API integration requires formal government inter-departmental authorization and credentials that are not accessible for public hackathon prototypes.
- **Provider Status**: NagarBodh integrates with OpenWeatherMap and Google Weather (via Maps Demo Key or standard key) for live feeds, and provides a calibrated historical replay engine for demonstrations. **Non-IMD data is never misrepresented as official IMD telemetry.**

### B. Emergency Vehicle Dispatch
- **Simulation Boundary**: The Response Planner and Human Approval Modal simulate dispatch orders, telemetry tracking, and crew updates. The system does not dispatch real physical vehicles, pumps, or municipal personnel onto public roads.
- **Human Authority**: The platform explicitly disclaims autonomous government execution. An authorized human officer must review and sign off on any action plan.

### C. Geographic Coverage
- **Calibrated Topography**: The current prototype is calibrated for the central Delhi NCR corridor, specifically Delhi Municipal Wards 14 (Karol Bagh), 15 (Sector 15 / Mayur Enclave), and 22 (Connaught Place).
- **Expansion Requirements**: Scaling to nationwide or metropolitan-wide coverage requires ingesting localized GIS shapefiles, administrative ward boundaries, and elevation models from respective state urban local bodies (ULBs).

### D. External API Quotas & Rate Limits
- **X (Twitter) API v2**: The Free and Basic access tiers impose strict monthly read caps and recent search limits.
- **Google Weather API / Maps Demo Key**: The Maps Demo Key provides free prototyping access but is subject to daily project request limits.
- **Graceful Degradation**: NagarBodh is architected with deterministic fallbacks so that if any external provider rate-limits or fails, the application automatically preserves full demo functionality without crashing or stalling.

---

## 3. Future Roadmap for Production Readiness
1. **Official Digilocker / e-Pramaan Authentication**: For role-based municipal officer sign-on.
2. **State Disaster Management Authority (SDMA) Integration**: Direct bidirectional bridge into state emergency response operating centers (EROCs).
3. **Automated Drone Telemetry**: Ingesting aerial drone photogrammetry to verify flood depth before and after pump deployment.
