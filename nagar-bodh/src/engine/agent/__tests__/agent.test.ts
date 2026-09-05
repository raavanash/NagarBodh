import { describe, expect, it } from 'vitest';
import { SignalAnalystOutputSchema } from '../../../types/agent';
import { SignalAnalystAgent } from '../SignalAnalystAgent';

describe('SignalAnalystAgent', () => {
  it('recovers and parses markdown JSON', () => {
    const sampleMarkdownJSON = '```json\n' + JSON.stringify({
      category: 'waterlogging',
      severity: 'critical',
      confidence: 0.95,
      language: 'hinglish',
      translation: 'Waterlogging 4 feet high in Sector 15 underpass',
      locationClues: ['Sector 15 underpass'],
      keyEntities: ['Sector 15', 'underpass'],
      incidentIndicators: ['waterlogging', 'submerged'],
      safetyIndicators: ['trapped vehicles'],
      affectedPeopleClues: ['school bus driver'],
      civicRelevance: true,
      spamOrDuplicateLikelihood: 0.05,
      locationConfidence: 0.9,
      locationCandidates: [
        { name: 'Sector 15 Metro Underpass', type: 'subway', confidence: 0.9 }
      ],
      factSeparation: {
        OBSERVED: {
          verbatimQuotes: ['Sector 15 underpass me paani 4 foot ho gaya hai'],
          visualEvidence: ['Submerged van'],
          reportedLocation: 'Sector 15 underpass'
        },
        INFERRED: {
          riskAssessment: 'Critical life safety hazard due to trapped vehicle',
          estimatedUrgency: 'IMMEDIATE',
          inferredRootCause: 'Storm drain pump failure during heavy rainfall'
        },
        RECOMMENDED: {
          initialActions: ['Deploy heavy dewatering pumps', 'Close underpass traffic ramps'],
          suggestedDepartment: 'MCD Dewatering Wing'
        }
      }
    }, null, 2) + '\n```';

    const parsedJson = SignalAnalystAgent.recoverAndParseJSON(sampleMarkdownJSON);
    expect(parsedJson).not.toBeNull();
    expect(typeof parsedJson).toBe('object');

    const validated = SignalAnalystOutputSchema.safeParse(parsedJson);
    expect(validated.success).toBe(true);
    expect(validated.data?.category).toBe('waterlogging');
  });

  it('builds fallback output when API key is missing', async () => {
    const fallbackOut = SignalAnalystAgent.buildFallbackOutput('Huge pothole near Karol Bagh market gate 3');
    expect(fallbackOut.factSeparation.OBSERVED.verbatimQuotes).toContain('Huge pothole near Karol Bagh market gate 3');

    const { output, trace } = await SignalAnalystAgent.analyzeSignal('Severe traffic jam at Connaught Place block B', undefined, undefined);
    expect(output).toBeDefined();
    expect(trace.fallbackUsed).toBe(true);
    expect(trace.model).toBe('deterministic-rule-engine-v1');
  });
});
