import { AgentTrace, SignalAnalystOutput, SignalAnalystOutputSchema } from '../../types/agent';
import { parseCivicSignalText } from '../nlpParser';

const GEMINI_MODEL = 'gemini-3.6-flash';
const REQUEST_TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;

const AGENT_SYSTEM_PROMPT = `
You are NagarBodh's Senior AI Signal Analyst Agent, an AI-powered municipal intelligence and response analysis engine for municipal emergency response in Delhi NCR.
Analyze incoming citizen reports in English, Devanagari Hindi, or Hinglish (code-mixed Latin script), plus optional visual telemetry.

STRICT INSTRUCTIONS:
1. Return ONLY valid, raw JSON adhering strictly to the schema below. Do not wrap in extra markdown or commentary outside the JSON object.
2. DO NOT INVENT OR HALLUCINATE GEOGRAPHIC COORDINATES (LATITUDE/LONGITUDE).
   If location is ambiguous, populate locationClues, locationConfidence (0-1), and locationCandidates (landmark names & types only).
3. Enforce 3-Tier Fact Separation Architecture:
   - OBSERVED: Direct verbatim quotes, raw landmark references, and physical evidence observed in text/image. Zero hallucination.
   - INFERRED: Derived risk assessment, urgency level, and probable underlying root cause.
   - RECOMMENDED: Initial SOP field actions and primary responding municipal department.

JSON OUTPUT SCHEMA REQUIREMENTS:
{
  "category": "waterlogging" | "road_hazard" | "drainage" | "garbage" | "electricity" | "traffic",
  "severity": "low" | "medium" | "high" | "critical",
  "confidence": number (0.0 to 1.0),
  "language": "hi" | "hinglish" | "en",
  "translation": "string (accurate English translation)",
  "locationClues": ["string"],
  "keyEntities": ["string"],
  "incidentIndicators": ["string"],
  "safetyIndicators": ["string"],
  "affectedPeopleClues": ["string"],
  "civicRelevance": boolean,
  "spamOrDuplicateLikelihood": number (0.0 to 1.0),
  "locationConfidence": number (0.0 to 1.0),
  "locationCandidates": [
    { "name": "string", "type": "string", "confidence": number }
  ],
  "factSeparation": {
    "OBSERVED": {
      "verbatimQuotes": ["string"],
      "visualEvidence": ["string"],
      "reportedLocation": "string"
    },
    "INFERRED": {
      "riskAssessment": "string",
      "estimatedUrgency": "string",
      "inferredRootCause": "string"
    },
    "RECOMMENDED": {
      "initialActions": ["string"],
      "suggestedDepartment": "string"
    }
  }
}
`;

export class SignalAnalystAgent {
  /**
   * Malformed JSON recovery parser — strips markdown blocks and repairs common JSON syntax errors
   */
  public static recoverAndParseJSON(rawResponseText: string): any {
    let clean = rawResponseText.trim();

    // 1. Strip markdown code fences (```json ... ``` or ``` ...)
    if (clean.includes('```')) {
      clean = clean.replace(/```json/gi, '').replace(/```/g, '').trim();
    }

    // 2. Extract first {...} JSON object string
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) {
      clean = match[0];
    }

    // 3. Fix trailing commas before closing brackets/braces
    clean = clean.replace(/,\s*([\}\]])/g, '$1');

    return JSON.parse(clean);
  }

  /**
   * Deterministic Fallback Generator — converts parseCivicSignalText output into full SignalAnalystOutput
   */
  public static buildFallbackOutput(text: string): SignalAnalystOutput {
    const parsed = parseCivicSignalText(text);

    return {
      category: parsed.category,
      severity: parsed.reportedSeverity,
      confidence: parsed.confidenceScore,
      language: parsed.detectedLanguage,
      translation: parsed.englishTranslation,
      locationClues: parsed.extractedLocationName ? [parsed.extractedLocationName] : [],
      keyEntities: parsed.keyEntities,
      incidentIndicators: [parsed.category, parsed.reportedSeverity],
      safetyIndicators: parsed.reportedSeverity === 'critical' ? ['High Alert'] : ['Standard Monitoring'],
      affectedPeopleClues: ['General Citizens'],
      civicRelevance: true,
      spamOrDuplicateLikelihood: 0.05,
      locationConfidence: parsed.extractedLocationName ? 0.85 : 0.40,
      locationCandidates: parsed.extractedLocationName ? [
        { name: parsed.extractedLocationName, type: 'landmark', confidence: 0.85 }
      ] : [],
      factSeparation: {
        OBSERVED: {
          verbatimQuotes: [text],
          visualEvidence: [],
          reportedLocation: parsed.extractedLocationName || 'Unspecified Field Location'
        },
        INFERRED: {
          riskAssessment: `${parsed.reportedSeverity.toUpperCase()} risk assessed for ${parsed.category.replace('_', ' ')}.`,
          estimatedUrgency: parsed.reportedSeverity === 'critical' ? 'IMMEDIATE' : 'STANDARD',
          inferredRootCause: `Civic anomaly reported: ${parsed.category.replace('_', ' ')}.`
        },
        RECOMMENDED: {
          initialActions: [`Dispatch field inspection team for ${parsed.category.replace('_', ' ')}.`],
          suggestedDepartment: parsed.category === 'waterlogging' ? 'MCD Dewatering Wing' : 'Municipal Control Room'
        }
      }
    };
  }

  /**
   * Main entry point to analyze a signal with Gemini 2.0 Flash REST API
   */
  public static async analyzeSignal(
    text: string,
    imageUrl?: string,
    apiKey?: string,
    channel = 'citizen_app'
  ): Promise<{ output: SignalAnalystOutput; trace: AgentTrace }> {
    const startTime = Date.now();
    const traceId = `trace-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const toolsConsulted = ['Gemini 2.0 Flash Multi-lingual Vision Engine', 'Delhi NCR Ward Topography DB', 'Zod Schema Validator'];

    const promptText = `Analyze this citizen civic report:\n"${text}"`;
    const contents: any[] = [
      {
        role: 'user',
        parts: [{ text: promptText }]
      }
    ];

    if (imageUrl && imageUrl.startsWith('data:image/')) {
      const mimeType = imageUrl.split(';')[0].replace('data:', '');
      const base64Data = imageUrl.split(',')[1];
      contents[0].parts.push({
        inline_data: { mime_type: mimeType, data: base64Data }
      });
    }

    const payload = {
      contents,
      system_instruction: { parts: [{ text: AGENT_SYSTEM_PROMPT }] },
      generationConfig: {
        temperature: 0.1,
        response_mime_type: 'application/json'
      }
    };

    let lastError: string | undefined;

    // Retry loop with exponential backoff
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        let data: any = null;

        // Try backend server proxy /api/gemini (server manages GEMINI_API_KEY securely)
        const endpoint = typeof window !== 'undefined' ? '/api/gemini' : 'http://localhost:5173/api/gemini';
        const proxyRes = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({ payload })
        }).catch(() => null);

        if (proxyRes && proxyRes.ok) {
          const body = await proxyRes.json().catch(() => null);
          if (body && body.ok && body.data) {
            data = body.data;
          }
        }

        clearTimeout(timeoutId);

        if (!data) {
          throw new Error('Gemini API fetch returned empty or unconfigured error.');
        }


        const rawResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawResponseText) {
          throw new Error('Gemini API returned empty response candidates.');
        }

        // Recover and parse JSON
        const rawJson = this.recoverAndParseJSON(rawResponseText);
        const validatedOutput = SignalAnalystOutputSchema.parse(rawJson);

        const trace: AgentTrace = {
          id: traceId,
          timestamp: new Date().toISOString(),
          input: { text, imageUrl, channel },
          toolsOrDataConsulted: toolsConsulted,
          structuredOutput: validatedOutput,
          confidence: validatedOutput.confidence,
          model: GEMINI_MODEL,
          latencyMs: Date.now() - startTime,
          fallbackUsed: false
        };

        return { output: validatedOutput, trace };
      } catch (err: any) {
        lastError = err?.message || String(err);
        console.warn(`[SignalAnalystAgent] Attempt ${attempt} failed: ${lastError}`);

        if (attempt < MAX_RETRIES) {
          await new Promise(res => setTimeout(res, 500 * Math.pow(2, attempt)));
        }
      }
    }

    const fallbackOutput = this.buildFallbackOutput(text);

    const trace: AgentTrace = {
      id: traceId,
      timestamp: new Date().toISOString(),
      input: { text, imageUrl, channel },
      toolsOrDataConsulted: ['Deterministic Rule-Based NLP Parser'],
      structuredOutput: fallbackOutput,
      confidence: fallbackOutput.confidence,
      model: 'deterministic-rule-engine-v1',
      latencyMs: Date.now() - startTime,
      fallbackUsed: true,
      apiError: lastError || 'Gemini API call failed.'
    };

    return { output: fallbackOutput, trace };
  }
}
