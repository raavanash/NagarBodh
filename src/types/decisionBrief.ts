import { DevelopmentCategory } from './development';

export interface DecisionBriefFactorDetail {
  name: string;
  rawScore: number; // 0 - 100 raw pillar score
  weightPercent: number; // e.g. 25 (%)
  contributionPoints: number; // e.g. 23.8 (points towards overall priority)
  evidence: string;
}

export interface DecisionBriefSignalEvidence {
  requestCount: number;
  velocityPerHour: number;
  surgeMultiplier: number;
  channels: string[];
  locationName: string;
  ward: string;
  district: string;
}

export interface DecisionBriefInfrastructureDeficit {
  infrastructureDeficitIndex: number; // 0 - 100 deficit score
  nearestFacilityName: string;
  nearestFacilityDistanceMeters: number;
  capacityUtilizationPercent: number;
}

export interface DecisionBriefDemographics {
  totalPopulation: number;
  vulnerablePopulation: number;
  vulnerableGroupRatio: number; // e.g. 0.245 (24.5%)
  vulnerabilityIndex: number; // 0 - 100 composite index
}

export interface DecisionBriefPriority {
  overallScore: number; // 0 - 100
  priorityLevel: string; // e.g. 'P1'
  formulaExplanation: string;
  factors: DecisionBriefFactorDetail[];
}

export interface DecisionBriefCapital {
  projectTitle: string;
  category: DevelopmentCategory | string;
  categoryLabel: string;
  recommendedIntervention: string;
  estimatedCostLakhs: number; // e.g. 350
  investmentGapLakhs: number;
  leadDepartment: string;
  implementationConsiderations: string[];
}

export interface DecisionBriefImpact {
  demandPressureChangePoints: number; // e.g. -37 (Index Points drop, NOT percentage)
  infrastructureIndexChangePoints: number; // e.g. +29 (Index Points gain, NOT percentage)
  serviceAccessChangePoints: number; // e.g. +30 (Index Points gain, NOT percentage)
  travelDistanceReductionPercent: number; // e.g. -40 (Actual Percentage Reduction)
  impactScore: number; // 0 - 100 composite impact score (e.g. 84)
}

export interface GroundedDecisionBriefInput {
  incidentId: string;
  gapId: string;

  // Normalized Canonical Domain Sections
  signalEvidence: DecisionBriefSignalEvidence;
  infrastructure: DecisionBriefInfrastructureDeficit;
  demographics: DecisionBriefDemographics;
  priority: DecisionBriefPriority;
  investment: DecisionBriefCapital;
  impact: DecisionBriefImpact;

  // Provenance & Simulation Metadata
  dataMode: 'SIMULATION' | 'REAL' | 'REPLAY' | 'PROJECTED';
  provenance: {
    dataSource: string;
    isSimulated: boolean;
    evidenceSnippets: string[];
  };

  // Direct Semantic Shortcuts (Unambiguous typed aliases)
  category: DevelopmentCategory | string;
  categoryLabel: string;
  locationName: string;
  ward: string;
  district: string;
  citizenSignalCount: number;
  signalVelocityPerHour: number;
  infrastructureDeficitIndex: number;
  populationContext: number;
  vulnerablePopulationCount: number;
  vulnerableGroupRatio: number;
  vulnerabilityIndex: number;
  investmentGapLakhs: number;
  priorityScore: number;
  priorityLevel: string;
  projectTitle: string;
  estimatedCostLakhs: number;
  recommendedIntervention: string;
  projectedImpact: DecisionBriefImpact;
}

export interface DecisionBriefSection {
  title: string;
  content: string;
  provenanceBadge: 'OBSERVED' | 'BASELINE CONTEXT' | 'CALCULATED' | 'RECOMMENDED' | 'PROJECTED' | 'SIMULATION';
}

export interface GroundedDecisionBriefOutput {
  id: string;
  incidentId: string;
  generatedAt: string;
  model: 'GEMINI' | 'DETERMINISTIC FALLBACK';
  modelIdentifier: string;
  problem: string;
  whyItMatters: string;
  evidence: string;
  recommendation: string;
  capitalRequirement: string;
  expectedOutcome: string;
  caveats: string;
  decision: string;
  sections: DecisionBriefSection[];
  rawText?: string;
  isValidated: boolean;
  validationWarnings?: string[];
  evidenceBasisSummary: Array<{
    label: string;
    value: string | number;
    badge: string;
  }>;
}
