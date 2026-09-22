import { AuditLogEntry } from '../context/CivicContext';
import {
  AuditEventType,
  CivicCategory,
  CivicSignal,
  ClusteredIncident,
  CriticalAsset,
  DetectedLanguage,
  DispatchActionPlan,
  EvidenceItem,
  IncidentStatus,
  PriorityBreakdown,
  SeverityLevel,
  SignalChannel,
  StateTransitionRecord
} from './civic';
import { IngestedCivicSignal } from './ingestion';

export type CanonicalDevelopmentCategory =
  | 'HEALTHCARE'
  | 'EDUCATION'
  | 'WATER'
  | 'SANITATION'
  | 'TRANSPORT'
  | 'ROADS'
  | 'ELECTRICITY'
  | 'DIGITAL_CONNECTIVITY'
  | 'PUBLIC_SAFETY'
  | 'HOUSING'
  | 'OTHER';

export type DevelopmentRequestChannel =
  | 'VOICE'
  | 'TEXT'
  | 'MESSAGING'
  | 'SOCIAL'
  | 'GOVERNMENT_PORTAL'
  | 'REPLAY';

import type { CanonicalLocation, ResolutionStatus } from './location';

export type DevelopmentRequestMode = 'LIVE' | 'REPLAY' | 'SIMULATION';

export interface DevelopmentRequestLocation {
  locationId?: string;
  country: string;
  state: string;
  district: string;
  subDistrict?: string;
  block?: string;
  village?: string;
  ward?: string;
  pincode?: string;
  latitude?: number | null;
  longitude?: number | null;
  geohash?: string;
  locationName?: string;
  locationConfidence?: number;
  resolutionStatus?: ResolutionStatus;
  canonicalLocation?: CanonicalLocation;
}

export interface DevelopmentRequestEvidence {
  classification: 'OBSERVED' | 'CALCULATED' | 'INFERRED' | 'RECOMMENDED';
  snippet: string;
  source: string;
  confidence?: number;
}

export interface DevelopmentRequest {
  id: string;
  rawText: string;
  language: DetectedLanguage | string;
  sourceChannel: DevelopmentRequestChannel;
  source: string;
  mode: DevelopmentRequestMode;
  timestamp: string;

  location: DevelopmentRequestLocation;

  category: CanonicalDevelopmentCategory;
  subcategory?: string;

  extractedEntities: string[];

  demandIntensity: number; // 0.0 - 1.0
  affectedPopulation?: number;
  urgency?: DevelopmentUrgency;
  vulnerableGroups?: string[];

  evidence: DevelopmentRequestEvidence[];
  confidence: number;

  status: 'pending' | 'triaged' | 'clustered' | 'analyzed' | 'rejected';
}

export type DevelopmentCategory =
  | 'healthcare'
  | 'education'
  | 'water'
  | 'sanitation'
  | 'transport'
  | 'roads'
  | 'electricity'
  | 'digital_connectivity'
  | 'public_safety'
  | 'other';

export type DevelopmentUrgency = 'standard' | 'high' | 'urgent' | 'critical';

export type DevelopmentPolicyStatus =
  | 'demand_identified'
  | 'gap_analyzed'
  | 'project_proposed'
  | 'under_policy_review'
  | 'investment_approved'
  | 'budget_allocated'
  | 'under_construction'
  | 'completed'
  | 'impact_verified';

export interface GeographicHierarchy {
  countryCode: string; // e.g. "IN", scalable to "BR", "RU", "CN", "ZA"
  country: string; // "India"
  state: string;
  district: string;
  subDistrict?: string;
  villageOrWard?: string;
}

export interface ContextProvenance {
  source: string; // e.g. "NagarBodh Realistic Sample Dataset"
  mode: 'LIVE' | 'REPLAY' | 'SIMULATION';
  timestamp: string;
  freshness: string; // e.g. "Q3 2026", "Real-time"
  coverage: string; // e.g. "District Level", "Ward Level"
  confidence: number;
}

export interface DemographicContext {
  population: number;
  populationDensity: number; // per sq km
  populationGrowth: number; // annual % growth
  urbanizationRate: number; // %
  vulnerablePopulation: number; // absolute count
  youthPopulation: number; // under 25 count
  elderlyPopulation: number; // over 60 count
  wardId?: string;
  wardName?: string;
  populationDensityPerSqKm?: number;
  totalPopulationEstimate?: number;
  populationImpactIndex?: number; // 0 - 100
  vulnerableGroupRatio?: number; // 0.0 - 1.0 (children, elderly, low income)
  vulnerabilityIndex?: number; // 0 - 100 (composite socio-economic and hazard exposure index)
  primaryLivelihoodZone?: string;
  literacyPercent?: number;
}

export interface InfrastructureContext {
  healthcareIndex: number; // 0 - 100
  educationIndex: number; // 0 - 100
  waterIndex: number; // 0 - 100
  sanitationIndex: number; // 0 - 100
  transportIndex: number; // 0 - 100
  electricityIndex: number; // 0 - 100
  digitalConnectivityIndex: number; // 0 - 100
  existingFacilitiesCount?: number;
  nearestFacilityName?: string;
  nearestFacilityDistanceMeters?: number;
  capacityUtilizationPercent?: number;
  infrastructureDeficitIndex?: number; // 0 - 100
  criticalAssetsNearby?: CriticalAsset[];
}

export interface InvestmentContext {
  existingInvestment: number; // ₹ Lakhs
  plannedInvestment: number; // ₹ Lakhs
  activeProjects: number; // count
  plannedProjects: number; // count
  investmentByCategory: Record<CanonicalDevelopmentCategory | string, number>; // ₹ Lakhs
  approvedBudgetLakhs?: number;
  allocatedFundingLakhs?: number;
  investmentGapLakhs?: number;
  investmentGapIndex?: number; // 0 - 100
  historicalProjectsCompleted?: number;
  unaddressedRequestsCount?: number;
}

export interface DevelopmentContext {
  id: string;
  hierarchy: GeographicHierarchy;
  demographic: DemographicContext;
  infrastructure: InfrastructureContext;
  investment: InvestmentContext;
  provenance: ContextProvenance;
}

export interface DevelopmentGap {
  overallGapIndex: number; // 0 - 100
  demandGapScore: number; // out of 30
  infrastructureDeficitScore: number; // out of 25
  demographicVulnerabilityScore: number; // out of 20
  investmentDeficitScore: number; // out of 15
  environmentalRiskScore: number; // out of 10
  explanationBullets: string[];
}

export interface DevelopmentPriorityBreakdown {
  overallScore: number; // 0 - 100
  level: DevelopmentUrgency;
  factors: {
    citizenDemandScore: number; // 30%
    infrastructureDeficitScore: number; // 25%
    demographicImpactScore: number; // 20%
    publicInvestmentGapScore: number; // 15%
    environmentalRiskScore: number; // 10%
  };
  whyPrioritizedBullets: Array<{
    reasonText: string;
    evidenceSource: string;
  }>;
  formulaExplanation: string;
}

export interface StructuredPriorityFactor {
  factor: string;
  score: number; // 0 - 100
  contribution: number; // weighted contribution points to final score
  evidence: string;
  source: string;
}

export interface DevelopmentPriority {
  hotspotId: string;
  category: CanonicalDevelopmentCategory | DevelopmentCategory | string;
  priorityScore: number; // 0 - 100
  priorityLevel: 'P1' | 'P2' | 'P3';
  demandScore: number; // 0 - 100
  infrastructureGap: number; // 0 - 100
  investmentGap: number; // 0 - 100
  populationImpact: number; // 0 - 100
  vulnerabilityScore: number; // 0 - 100
  factors: StructuredPriorityFactor[];
  evidence: DevelopmentRequestEvidence[];
}

export interface DevelopmentProjectRecommendation {
  id: string;
  hotspotId: string;
  title: string;
  projectTitle?: string; // backward-compatibility alias
  category: CanonicalDevelopmentCategory | DevelopmentCategory | string;
  geography: GeographicHierarchy | {
    country: string;
    state: string;
    district: string;
    subDistrict?: string;
    wardOrDistrict?: string;
    locationName?: string;
  };
  problemStatement: string;
  recommendedIntervention: string;
  priorityScore: number;
  priorityLevel?: 'P1_CRITICAL_PRIORITY' | 'P2_ELEVATED_PRIORITY' | 'P3_STANDARD_DEVELOPMENT' | 'P1_NATIONAL_HIGH_PRIORITY' | 'P2_STATE_PRIORITY';
  expectedBeneficiaries: number;
  estimatedImpact: {
    infrastructureIndexImprovement?: number;
    beneficiaryCount?: number;
    deficitReductionPercent?: number;
    protectedAssets?: string[];
    narrative: string;
  };
  supportingEvidence: DevelopmentRequestEvidence[] | EvidenceItem[];
  rationale: string;
  implementationConsiderations: string[];
  confidence: number;
  sourceMode: 'LIVE' | 'REPLAY' | 'SIMULATION' | 'HYBRID';
  status: 'pending_policy_review' | 'approved' | 'modified' | 'rejected' | 'allocated';
  approvedBy?: string;
  modifiedNotes?: string;
  rejectionReason?: string;
  
  // Operational details & backward compatibility
  primaryDepartment?: string;
  supportingDepartments?: string[];
  estimatedCostLakhs?: number;
  estimatedCompletionMonths?: number;
  recommendedActions?: Array<{
    id: string;
    actionText: string;
    department: string;
    rationale: string;
    isSopRule: boolean;
    isAiRecommendation: boolean;
  }>;
  targetLocation?: string;
  justification?: string;
}

export interface DevelopmentSignal extends CivicSignal {
  developmentCategory: DevelopmentCategory;
  urgency: DevelopmentUrgency;
  inputMedium: 'voice_transcript' | 'text' | 'messaging_app' | 'social_media' | 'grievance_portal';
  targetBeneficiariesEstimate?: number;
}

export interface DevelopmentDemandHotspot {
  id: string;
  locationId?: string;
  canonicalLocation?: CanonicalLocation;
  title: string;
  category: CanonicalDevelopmentCategory | DevelopmentCategory | string;
  legacyCategory?: CivicCategory;
  status: DevelopmentPolicyStatus;
  legacyStatus?: IncidentStatus;
  geographicArea: {
    centroid: { lat: number; lng: number };
    radiusMeters: number;
    wardOrDistrict: string;
    state: string;
  };
  centroid: { lat: number; lng: number };
  radiusMeters: number;
  ward: string;
  locationName: string;
  requestCount: number;
  demandScore: number;
  affectedPopulation: number;
  languages: string[];
  sourceChannels: DevelopmentRequestChannel[];
  requestVelocity: number;
  demandVelocityPerHour?: number;
  firstRequestTime: string;
  latestRequestTime: string;
  signalIds: string[];

  developmentGap: DevelopmentGap;
  priorityScore: DevelopmentPriority;
  priority?: DevelopmentPriorityBreakdown;
  demographics: DemographicContext;
  infrastructure: InfrastructureContext;
  investment: InvestmentContext;
  context?: DevelopmentContext;

  evidence: DevelopmentRequestEvidence[];
  evidenceChain?: EvidenceItem[];
  projectRecommendation?: DevelopmentProjectRecommendation;
  statusHistory?: StateTransitionRecord[];
}

export interface DevelopmentImpactVerification {
  hotspotId: string;
  beforeDemandCount: number;
  beforePriorityScore: number;
  afterDemandCount: number;
  afterPriorityScore: number;
  demandReductionPercent: number;
  deficitReductionIndex: number;
  timeToAllocationDays: number;
  citizenSatisfactionScore: number; // 0 - 100
  outcome: 'IMPACT_VERIFIED' | 'NEEDS_POLICY_REASSESSMENT';
  aiConclusion: string;
}

export interface DevelopmentImpactMetrics {
  demandScore: number;
  infrastructureIndex: number;
  averageTravelDistanceKm?: number;
  serviceAccessScore: number;
  affectedPopulation: number;
}

export interface DevelopmentImpact {
  id: string;
  projectId: string;
  category: CanonicalDevelopmentCategory | DevelopmentCategory | string;
  baselineMetrics: DevelopmentImpactMetrics;
  postInterventionMetrics: DevelopmentImpactMetrics;
  change: {
    infrastructureIndexImprovement: number; // e.g. +29 (pts)
    infrastructureIndexChangePoints?: number; // e.g. +29 (pts)
    averageTravelDistanceReductionPercent: number; // e.g. -40 (%)
    travelDistanceReductionPercent?: number; // e.g. -40 (%)
    demandPressureReductionPercent: number; // e.g. -37 (pts)
    demandPressureChangePoints?: number; // e.g. -37 (pts)
    serviceAccessImprovement: number; // e.g. +30 (pts)
    serviceAccessChangePoints?: number; // e.g. +30 (pts)
  };
  impactScore: number; // 0 - 100
  measurementDate: string;
  source: string;
  mode: 'LIVE' | 'REPLAY' | 'SIMULATION';
  evidence: DevelopmentRequestEvidence[];
  aiSummary: string;
}

export type DevelopmentHotspot = DevelopmentDemandHotspot;

export type ProvenanceType =
  | 'OBSERVED'
  | 'CALCULATED'
  | 'BASELINE CONTEXT'
  | 'INFERRED'
  | 'RECOMMENDED'
  | 'PROJECTED'
  | 'SIMULATION';

export interface ProblemSignalDossier {
  requestCount: number;
  signalChannels: string[];
  velocityPerHour: number;
  surgeMultiplier: number;
  locationName: string;
  ward: string;
  representativeSignals: Array<{
    id: string;
    rawText: string;
    channel: string;
    timestamp: string;
    authorHandle?: string;
    detectedLanguage?: string;
  }>;
  provenance: 'OBSERVED';
}

export interface InfrastructureContextDossier {
  infrastructureIndex: number;
  infrastructureDeficitScore: number;
  nearestFacilityName: string;
  nearestFacilityDistanceMeters: number;
  capacityUtilizationPercent: number;
  criticalAssetsNearby: string[];
  provenance: 'BASELINE CONTEXT';
}

export interface AffectedPopulationDossier {
  totalEstimate: number;
  vulnerableEstimate: number;
  vulnerabilityRatio: number;
  vulnerabilityScore?: number; // 0 - 100 composite vulnerability index
  primaryLivelihoodZone: string;
  sourceContext: string;
  provenance: 'BASELINE CONTEXT';
}

export interface PriorityCalculationFactorDossier {
  factor: string;
  score: number;
  weightPercent: number;
  contribution: number;
  evidence: string;
  source: string;
  provenance: 'CALCULATED';
}

export interface PriorityCalculationDossier {
  overallScore: number;
  priorityLevel: 'P1' | 'P2' | 'P3';
  formulaExplanation: string;
  factors: PriorityCalculationFactorDossier[];
  provenance: 'CALCULATED';
}

export interface CapitalRequirementDossier {
  recommendedProjectTitle: string;
  estimatedCostLakhs: number;
  interventionCategory: string;
  recommendedIntervention: string;
  primaryDepartment: string;
  supportingDepartments: string[];
  implementationConsiderations: string[];
  provenance: 'RECOMMENDED';
}

export interface ProjectedOutcomeDossier {
  impactScore: number;
  infrastructureIndexGain: number;
  travelDistanceReductionPercent: number;
  demandPressureDrop: number;
  serviceAccessGain: number;
  scenarioMode: 'SIMULATION' | 'PROJECTED';
  provenance: 'PROJECTED';
}

export interface TraceableEvidenceStep {
  id: string;
  stepNumber: number;
  stepName: 'Citizen Signals' | 'Demand Hotspot' | 'Infrastructure Deficit' | 'Priority Score' | 'Recommended Intervention' | 'Projected Impact';
  title: string;
  detail: string;
  sourceId: string;
  classification: ProvenanceType;
}

export interface InvestmentExplanationDossier {
  gapId: string;
  category: string;
  categoryLabel: string;
  district: string;
  ward: string;
  incidentId?: string;
  plainLanguageWhy: string;
  problemSignal: ProblemSignalDossier;
  infrastructureContext: InfrastructureContextDossier;
  affectedPopulation: AffectedPopulationDossier;
  priorityCalculation: PriorityCalculationDossier;
  capitalRequirement: CapitalRequirementDossier;
  projectedOutcome: ProjectedOutcomeDossier;
  evidenceChain: TraceableEvidenceStep[];
}

export type InterventionLifecycleStatus =
  | 'RECOMMENDED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'INTERVENTION_RECORDED'
  | 'IMPACT_MEASURED';

export interface InterventionRecord {
  id: string;
  recommendationId: string;
  incidentId: string;
  gapId: string;
  category: string;
  categoryLabel: string;
  projectTitle: string;
  locationName: string;
  ward: string;
  district: string;
  priorityScore: number;
  priorityLevel: 'P1' | 'P2' | 'P3';
  affectedPopulation: number;
  vulnerablePopulation: number;
  approvedCapitalLakhs: number;
  recommendationRationale: string;
  recommendedIntervention: string;
  leadAgency: string;
  status: InterventionLifecycleStatus;
  approvedBy?: string;
  approvedAt?: string;
  recordedAt?: string;
  dataMode: 'SIMULATION' | 'PROJECTED' | 'LIVE' | 'REPLAY';
  provenance: 'RECOMMENDED' | 'APPROVED' | 'SIMULATION' | 'CALCULATED';
  expectedImpact: {
    demandPressureChangePoints: number; // e.g. -37 (Index points)
    infrastructureIndexChangePoints: number; // e.g. +29 (Index points)
    travelDistanceReductionPercent: number; // e.g. -40 (%)
    serviceAccessChangePoints: number; // e.g. +30 (Index points)
    impactScore: number; // e.g. 84 (Composite Score)
    demandPressureReductionPercent?: number; // legacy alias
    infrastructureIndexImprovement?: number; // legacy alias
    serviceAccessImprovement?: number; // legacy alias
  };
  sourceEvidenceSnippets: string[];
}

