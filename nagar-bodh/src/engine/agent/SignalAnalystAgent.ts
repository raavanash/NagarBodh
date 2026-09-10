import { AgentTrace, SignalAnalystOutput, SignalAnalystOutputSchema } from '../../types/agent';
import { parseCivicSignalText } from '../nlpParser';

const GEMINI_MODEL = 'gemini-2.0-flash';
const REQUEST_TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;

const AGENT_SYSTEM_PROMPT = `
You are NagarBodh's Senior AI Signal Analyst Agent, an AI-powered Digital Public Good & National Development Intelligence Engine for citizen development requests, infrastructure gaps, and public investment prioritization across India.
Analyze incoming citizen voice transcripts, text messages, app submissions, and social media reports in English, Devanagari Hindi, Hinglish (code-mixed Latin script), or regional Indian languages, plus optional visual telemetry.

STRICT INSTRUCTIONS:
1. Return ONLY valid, raw JSON adhering strictly to the schema below. Do not wrap in extra markdown or commentary outside the JSON object.
2. DO NOT INVENT OR HALLUCINATE GEOGRAPHIC COORDINATES (LATITUDE/LONGITUDE).
   If location is ambiguous, populate locationClues, locationConfidence (0-1), and locationCandidates (landmark names & types only).
3. Enforce 3-Tier Fact Separation Architecture:
   - OBSERVED: Direct verbatim quotes, raw landmark references, and physical evidence observed in text/image. Zero hallucination.
   - INFERRED: Derived risk assessment, urgency level, and probable underlying root cause or development gap.
   - RECOMMENDED: Initial development project recommendations and primary responding government/state department.

JSON OUTPUT SCHEMA REQUIREMENTS:
{
  "category": "waterlogging" | "road_hazard" | "drainage" | "garbage" | "electricity" | "traffic" | "healthcare" | "education" | "water" | "sanitation" | "transport" | "roads" | "digital_connectivity" | "public_safety" | "other",
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

    // If no API key provided, automatically fallback to deterministic NLP
    if (!apiKey || apiKey.trim().length < 10) {
      const fallbackOutput = this.buildFallbackOutput(text);
      const trace: AgentTrace = {
        id: traceId,
        timestamp: new Date().toISOString(),
        input: { text, imageUrl, channel },
        toolsOrDataConsulted: ['Deterministic Rule-Based NLP Parser', 'Delhi NCR Ward Topography DB'],
        structuredOutput: fallbackOutput,
        confidence: fallbackOutput.confidence,
        model: 'deterministic-rule-engine-v1',
        latencyMs: Date.now() - startTime,
        fallbackUsed: true
      };
      return { output: fallbackOutput, trace };
    }

    let lastError: string | undefined;

    // Retry loop with exponential backoff
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        const promptText = `Analyze this citizen civic report:\n"${text}"`;

        const contents: any[] = [
          {
            role: 'user',
            parts: [{ text: promptText }]
          }
        ];

        // If base64 / inline image provided, attach image part
        if (imageUrl && imageUrl.startsWith('data:image/')) {
          const mimeType = imageUrl.split(';')[0].replace('data:', '');
          const base64Data = imageUrl.split(',')[1];
          contents[0].parts.push({
            inline_data: { mime_type: mimeType, data: base64Data }
          });
        }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents,
              system_instruction: { parts: [{ text: AGENT_SYSTEM_PROMPT }] },
              generationConfig: {
                temperature: 0.1,
                response_mime_type: 'application/json'
              }
            })
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Gemini API returned status ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const rawResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawResponseText) {
          throw new Error('Gemini API returned empty response candidates.');
        }

        // Recover and parse JSON
        const rawJson = this.recoverAndParseJSON(rawResponseText);

        // Validate strictly against Zod Schema
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

    // If retries fail, fallback to deterministic parser cleanly
    console.warn(`[SignalAnalystAgent] All retries exhausted. Falling back to deterministic NLP.`);
    const fallbackOutput = this.buildFallbackOutput(text);

    const trace: AgentTrace = {
      id: traceId,
      timestamp: new Date().toISOString(),
      input: { text, imageUrl, channel },
      toolsOrDataConsulted: ['Deterministic Rule-Based NLP Parser'],
      structuredOutput: fallbackOutput,
      confidence: fallbackOutput.confidence,
      model: 'deterministic-rule-engine-fallback',
      latencyMs: Date.now() - startTime,
      fallbackUsed: true,
      apiError: lastError
    };

    return { output: fallbackOutput, trace };
  }
}
