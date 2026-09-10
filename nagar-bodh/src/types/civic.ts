export type SignalChannel = 'citizen_app' | 'social_x' | 'social_bluesky' | 'grievance_portal' | 'helpline_311';
export type DetectedLanguage = 'hi' | 'hinglish' | 'en';
export type CivicCategory = 'waterlogging' | 'road_hazard' | 'drainage' | 'garbage' | 'electricity' | 'traffic' | 'healthcare' | 'education' | 'water' | 'sanitation' | 'transport' | 'roads' | 'digital_connectivity' | 'public_safety' | 'other';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'emerging' | 'triaged' | 'dispatch_pending' | 'dispatched' | 'resolving' | 'resolved' | 'verified';

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
  | 'dispatch_approved'
  | 'crew_dispatched'
  | 'resolution_begun'
  | 'resolution_confirmed'
  | 'field_verification';

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

export interface PriorityBreakdown {
  overallScore: number; // 0 - 100
  level: SeverityLevel;
  factors: {
    severityScore: number; // out of 25
    velocityScore: number; // out of 25
    assetVulnerabilityScore: number; // out of 25
    weatherRiskScore: number; // out of 15
    historicalRecurrenceScore: number; // out of 10
  };
  formulaExplanation: string;
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

export interface DispatchActionPlan {
  id: string;
  incidentId: string;
  primaryDepartment: string;
  secondaryDepartment?: string;
  priorityLevel: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_STANDARD';
  actions: string[];
  equipment: Array<{ name: string; count: number; assignedUnit: string }>;
  status: 'pending_review' | 'approved' | 'in_transit' | 'on_site' | 'resolved';
  dispatchedAt?: string;
  approvedBy?: string;
  etaMinutes: number;
  targetLocation: string;
  notes?: string;
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
  priority: PriorityBreakdown;
  auditableInsight: AuditableInsight;
  actionPlan?: DispatchActionPlan;
  resolutionConfirmedSignals?: string[];
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
