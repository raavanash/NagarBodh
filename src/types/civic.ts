export type SignalChannel = 'citizen_app' | 'social_x' | 'grievance_portal' | 'helpline_311';
export type DetectedLanguage = 'hi' | 'hinglish' | 'en';
export type CivicCategory = 'waterlogging' | 'road_hazard' | 'drainage' | 'garbage' | 'electricity' | 'traffic';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus =
  | 'emerging'
  | 'triaged'
  | 'dispatch_pending'
  | 'approved'
  | 'dispatched'
  | 'on_site'
  | 'resolving'
  | 'resolved'
  | 'verified';

export interface StateTransitionRecord {
  id: string;
  incidentId: string;
  timestamp: string; // ISO string
  simulatedTimeLabel: string; // e.g. "10:15 AM"
  previousState: IncidentStatus;
  newState: IncidentStatus;
  actor: string;
  notes: string;
  auditLogId: string;
}

// Full audit event type union — every transition must fire one of these
export type AuditEventType =
  | 'signal_ingested'
  | 'signal_analyzed'
  | 'cluster_formed'
  | 'cluster_updated'
  | 'incident_triaged'
  | 'priority_assigned'
  | 'response_plan_generated'
  | 'priority_spike'
  | 'human_approval_opened'
  | 'dispatch_approved'
  | 'plan_modified'
  | 'plan_rejected'
  | 'crew_dispatched'
  | 'units_on_site'
  | 'resolution_begun'
  | 'resolution_confirmed'
  | 'field_verification'
  | 'state_transition';

export interface CivicSignal {
  id: string;
  timestamp: string; // ISO string
  simulatedTimeLabel: string; // e.g., "08:15 AM"
  channel: SignalChannel;
  rawText: string;
  detectedLanguage: DetectedLanguage;
  englishTranslation: string;
  category: CivicCategory;
  reportedSeverity: SeverityLevel;
  confidenceScore: number; // 0.0 - 1.0
  coordinates: {
    lat: number;
    lng: number;
  };
  locationName: string;
  ward: string;
  authorHandle?: string;
  upvotes?: number;
  imageUrl?: string;
  sentiment: 'negative' | 'urgent' | 'neutral' | 'positive_confirmation';
  keyEntities: string[];
}

export interface CriticalAsset {
  id: string;
  name: string;
  type: 'school' | 'hospital' | 'metro' | 'pumping_station' | 'fire_station';
  coordinates: {
    lat: number;
    lng: number;
  };
  ward: string;
  vulnerabilityBufferMeters: number; // radius of high alert
  contactPerson?: string;
  capacity?: string;
}

export interface EvidenceLink {
  id: string;
  label: string;
  type: 'signal' | 'asset' | 'weather' | 'ward' | 'sla' | 'geospatial';
  targetId?: string;
  snippet?: string;
}

export interface EvidenceItem {
  id: string;
  source: string;              // e.g. "Citizen signal #sig-s15-05 (@Parent_PoojaG)"
  type: string;                // e.g. "X/public signal", "Telemetry sensor", "Critical asset proximity"
  timestamp: string;           // e.g. "10:14 AM"
  location: string;            // e.g. "Sector 15 Underpass"
  dataFreshness: string;       // e.g. "< 2 mins ago", "Live Stream"
  usedFor: string;             // e.g. "Used for incident detection", "Used for environmental risk"
  snippet?: string;
  confidence?: number;
  classification?: 'OBSERVED' | 'CALCULATED' | 'INFERRED' | 'RECOMMENDED';
  evidenceMode?: 'LIVE' | 'REPLAY' | 'SIMULATION';
}

export interface PriorityBreakdown {
  overallScore: number; // 0 - 100
  level: SeverityLevel;
  factors: {
    severityScore: number; // out of 25
    velocityScore: number; // out of 25
    populationImpactScore: number; // out of 20
    criticalAssetExposureScore: number; // out of 15
    environmentalRiskScore: number; // out of 10
    slaRecurrenceScore: number; // out of 10
  };
  whyPrioritizedBullets?: Array<{
    reasonText: string;
    evidenceLink: EvidenceLink;
  }>;
  formulaExplanation: string;
  evidenceChain?: EvidenceItem[];
}

export interface IncidentExplanation {
  summaryText: string;
  spatialProximitySummary: string;
  temporalProximitySummary: string;
  semanticAffinitySummary: string;
  crossChannelCorroborationSummary: string;
  explanationBullets: string[];
  duplicateCount: number;
}

export interface AuditableInsight {
  observedData: {
    signalIds: string[];
    rawExcerpts: Array<{
      original: string;
      language: DetectedLanguage;
      channel: SignalChannel;
      time: string;
    }>;
    centroidCoordinates: { lat: number; lng: number };
    firstReportedAt: string;
    latestReportedAt: string;
    sourceDistribution: Record<SignalChannel, number>;
  };
  calculatedMetrics: {
    signalCount: number;
    velocityPerHour: number;
    velocityDeltaPercent: number;
    clusterRadiusMeters: number;
    nearestHospitalDistanceMeters: number | null;
    nearestHospitalName?: string;
    nearestSchoolDistanceMeters: number | null;
    nearestSchoolName?: string;
    priorityScore: number;
    duplicatesDetected?: number;
  };
  modelInference: {
    title: string;
    summary: string;
    assessedRootCause: string;
    confidenceScore: number;
    languageBreakdown: Record<DetectedLanguage, number>;
  };
  explanation?: IncidentExplanation;
  recommendation: {
    primaryDepartment: string;
    secondaryDepartments: string[];
    recommendedActions: string[];
    requiredResources: Array<{ item: string; quantity: string; status: 'ready' | 'deployed' }>;
    estimatedSLAHours: number;
    justification: string;
  };
}

export interface ActionItemRecommendation {
  id: string;
  actionText: string;
  department: string;
  rationale: string; // Why this action is recommended based on evidence
  isSopRule: boolean;
  isAiRecommendation: boolean;
}

export interface OperationalResourceItem {
  item: string;
  quantity: string;
  assignedUnit: string;
  status: 'ready' | 'deployed' | 'staged';
  isSopResource: boolean;
  isAiRecommendation: boolean;
}

export interface PublicCommunicationAdvisory {
  citizenAdvisory: string;
  targetChannels: string[];
  isAiGenerated: boolean;
}

export interface PlanAuditEvent {
  timestamp: string;
  eventType: AuditEventType;
  actor: string;
  details: string;
}

export interface DynamicResponsePlan {
  id: string;
  incidentId: string;
  responsibleDepartment: string;
  supportingDepartments: string[];
  priority: string; // e.g. "P1_CRITICAL (Score: 94/100)"
  priorityLevel: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_STANDARD';
  sla: string; // e.g. "1.5 Hours SLA Target"
  slaHours: number;
  recommendedActions: ActionItemRecommendation[];
  requiredResources: OperationalResourceItem[];
  estimatedResponseTimeMinutes: number;
  publicCommunication: PublicCommunicationAdvisory;
  escalationCondition: string;
  situationAssessment: {
    summary: string;
    rootCause: string;
    adaptedSopNotes: string;
    confidenceScore: number;
  };
  expectedImpact: {
    hazardReductionPercent: number;
    protectedAssets: string[];
    slaImpactDescription: string;
  };
  status: 'pending_review' | 'approved' | 'modified' | 'rejected' | 'resolved';
  dispatchedAt?: string;
  approvedBy?: string;
  targetLocation: string;
  notes?: string;
  auditTrail?: PlanAuditEvent[];

  // Backward compatibility properties for legacy views
  primaryDepartment: string;
  secondaryDepartment?: string;
  actions: string[];
  equipment: Array<{ name: string; count: number; assignedUnit: string; status?: 'ready' | 'deployed' | 'staged' }>;
  etaMinutes: number;
}

export type DispatchActionPlan = DynamicResponsePlan;

export interface ResolutionVerificationData {
  beforeSignalCount: number;
  beforePriorityScore: number;
  afterSignalCount: number;
  afterPriorityScore: number;
  signalReductionPercent: number;
  priorityReductionPoints: number;
  timeToResolutionFormatted: string;
  timeToResolutionMinutes: number;
  recurringComplaintsDetected: boolean;
  positiveConfirmationCount: number;
  verificationConfidenceScore: number; // 0 - 100
  outcome: 'VERIFIED' | 'NEEDS_REVIEW';
  aiConclusion: string;
  disclaimerText: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface ClusteredIncident {
  id: string;
  title: string;
  category: CivicCategory;
  status: IncidentStatus;
  centroid: {
    lat: number;
    lng: number;
  };
  radiusMeters: number;
  signalIds: string[];
  firstSignalTime: string;
  latestSignalTime: string;
  velocityPerHour: number;
  velocitySurgePercent: number;
  ward: string;
  locationName?: string;
  location?: {
    name: string;
    lat: number;
    lng: number;
  };
  priority: PriorityBreakdown;
  auditableInsight: AuditableInsight;
  actionPlan?: DispatchActionPlan;
  resolutionConfirmedSignals?: string[];
  statusHistory?: StateTransitionRecord[];
  resolutionVerification?: ResolutionVerificationData;
  evidenceChain?: EvidenceItem[];
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface WardMetric {
  wardId: string;
  wardName: string;
  /** Historical SLA baseline — do not use for live counts. Use computed values from incidents[]. */
  avgResolutionTimeHours: number;
  slaCompliancePercent: number;
  populationDensityPerSqKm: number;
  primaryZone: string;
}

export interface SimulationStep {
  stepIndex: number;
  simulatedTime: string; // e.g. "08:15 AM"
  signalsAdded: CivicSignal[];
  weatherCondition: {
    rainfallMmPerHour: number;
    alertLevel: 'none' | 'yellow' | 'orange' | 'red';
    description: string;
  };
  description: string;
}
