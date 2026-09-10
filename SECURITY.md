# NagarBodh — Security & Secret Management Policy

## 1. Security Architecture & Threat Model

NagarBodh enforces a **Zero-Client-Secret Policy**. Municipal operational dashboards are accessed across multiple client machines and networks. At no point should third-party API credentials, service account tokens, or LLM access keys be delivered to or exposed within client-side JavaScript bundles.

---

## 2. Server-Side Protection Architecture

```
[ Browser Client ]
        │
        │ HTTP GET/POST /api/* (Zero API keys in request headers or body)
        ▼
[ Serverless API Proxy Layer: api/*.ts & server/apiProxy.ts ]
        │
        │ Reads secure server environment variables:
        │ process.env.OPENWEATHER_API_KEY
        │ process.env.GOOGLE_WEATHER_API_KEY
        │ process.env.X_BEARER_TOKEN
        │ process.env.GEMINI_API_KEY
        ▼
[ External Cloud Providers (Google, OpenWeather, X) ]
```

### Key Security Measures Implemented:
1. **No Client-Side Secrets**: All calls to Google Generative AI, OpenWeatherMap, and X API are proxied through serverless functions (`/api/gemini`, `/api/weather`, `/api/social`).
2. **Rejection of Client-Supplied Keys**: The backend `/api/gemini` endpoint rejects client-supplied API key parameters in JSON request bodies, preventing malicious key forwarding or tampering.
3. **Removal of `VITE_` Secret Variables**: Production configurations avoid `VITE_` prefixed variables for secrets, ensuring Vite does not inline sensitive strings into client `.js` chunks during `npm run build`.
4. **Git Repository Hygiene**:
   - `.env`, `.env.local`, and `*.local` files are strictly excluded via `.gitignore`.
   - Continuous repository inspection confirms no private keys or active secrets are committed in git history.

---

## 3. Credential Rotation Advisory

> [!CAUTION]
> **Production Key Rotation Requirement**:
> If any developer or team member previously utilized personal API keys during local testing, those credentials MUST be rotated and revoked in the respective provider consoles prior to public deployment:
> - **Google Cloud Console / Google AI Studio**: [https://aistudio.google.com/](https://aistudio.google.com/)
> - **OpenWeather Developer Portal**: [https://home.openweathermap.org/api_keys](https://home.openweathermap.org/api_keys)
> - **X (Twitter) Developer Portal**: [https://developer.twitter.com/en/portal/dashboard](https://developer.twitter.com/en/portal/dashboard)

---

## 4. Input Validation & Schema Guardrails

All incoming signals and model responses pass through **Zod runtime schema validation**:
- Malformed inputs are rejected with standardized HTTP error codes.
- Model generation outputs are strictly verified against `SignalAnalystOutputSchema` before being rendered into the DOM.
- Text content is sanitized against script injection before rendering in the React virtual DOM.
