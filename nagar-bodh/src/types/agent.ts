import { z } from 'zod';
import { CivicCategory, DetectedLanguage, SeverityLevel } from './civic';

/**
 * Zod Schema for Location Candidates (Landmark name/type only — NO invented coordinates)
 */
export const LocationCandidateSchema = z.object({
  name: z.string(),
  type: z.string(),
  confidence: z.number().min(0).max(1)
});

export type LocationCandidate = z.infer<typeof LocationCandidateSchema>;

/**
 * Zod Schema for 3-Tier Fact Separation Architecture
 */
export const FactSeparationSchema = z.object({
  OBSERVED: z.object({
    verbatimQuotes: z.array(z.string()),
    visualEvidence: z.array(z.string()).optional(),
    reportedLocation: z.string()
  }),
  INFERRED: z.object({
    riskAssessment: z.string(),
    estimatedUrgency: z.string(),
    inferredRootCause: z.string()
  }),
  RECOMMENDED: z.object({
    initialActions: z.array(z.string()),
    suggestedDepartment: z.string()
  })
});

export type FactSeparation = z.infer<typeof FactSeparationSchema>;

/**
 * Full Zod Schema for Structured Signal Analyst Agent Output
 */
export const SignalAnalystOutputSchema = z.object({
  category: z.enum(['waterlogging', 'road_hazard', 'drainage', 'garbage', 'electricity', 'traffic', 'healthcare', 'education', 'water', 'sanitation', 'transport', 'roads', 'digital_connectivity', 'public_safety', 'other']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  confidence: z.number().min(0).max(1),
  language: z.enum(['hi', 'hinglish', 'en']),
  translation: z.string(),
  locationClues: z.array(z.string()),
  keyEntities: z.array(z.string()),
  incidentIndicators: z.array(z.string()),
  safetyIndicators: z.array(z.string()),
  affectedPeopleClues: z.array(z.string()),
  civicRelevance: z.boolean(),
  spamOrDuplicateLikelihood: z.number().min(0).max(1),
  locationConfidence: z.number().min(0).max(1),
  locationCandidates: z.array(LocationCandidateSchema),
  factSeparation: FactSeparationSchema
});

export type SignalAnalystOutput = z.infer<typeof SignalAnalystOutputSchema>;

/**
 * AgentTrace log object recording execution provenance, prompt, latency, and confidence
 */
export interface AgentTrace {
  id: string;
  timestamp: string;
  input: {
    text: string;
    imageUrl?: string;
    channel?: string;
  };
  toolsOrDataConsulted: string[];
  structuredOutput: SignalAnalystOutput;
  confidence: number;
  model: string;
  latencyMs: number;
  fallbackUsed: boolean;
  apiError?: string;
}
