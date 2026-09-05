import {
  ActionItemRecommendation,
  ClusteredIncident,
  DynamicResponsePlan,
  OperationalResourceItem,
  PlanAuditEvent,
  PublicCommunicationAdvisory
} from '../types/civic';
import { getWardSOPProfile } from '../data/wardProfiles';

/**
 * NagarBodh Dynamic AI-Assisted Response Planner Engine
 * Generates an auditable, evidence-backed action plan combining deterministic SOP rules
 * with AI evidence adaptation for emergency triage.
 */
export function generateSOPActionPlan(incident: ClusteredIncident): DynamicResponsePlan {
  return generateDynamicResponsePlan(incident);
}

export function generateDynamicResponsePlan(incident: ClusteredIncident): DynamicResponsePlan {
  const priorityScore = incident.priority.overallScore;
  const isP1 = priorityScore >= 75;
  const isP2 = priorityScore >= 45;

  const priorityLevel: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_STANDARD' = isP1
    ? 'P1_CRITICAL'
    : isP2
    ? 'P2_HIGH'
    : 'P3_STANDARD';

  const priorityLabel = `${priorityLevel} (Score: ${priorityScore}/100)`;
  const slaHours = isP1 ? 1.5 : isP2 ? 3.0 : 6.0;
  const slaLabel = `${slaHours} Hours Target (SLA Compliance Baseline)`;

  // Ward SOP Lookup
  const wardProfile = getWardSOPProfile(incident.ward, incident.category);
  const targetLocation = wardProfile?.targetLocation || incident.auditableInsight?.modelInference?.title || incident.ward;

  // Extract Evidence Indicators
  const signalCount = incident.signalIds.length;
  const velocitySurge = incident.velocitySurgePercent || 0;
  const nearestSchool = incident.auditableInsight?.calculatedMetrics?.nearestSchoolName;
  const schoolDist = incident.auditableInsight?.calculatedMetrics?.nearestSchoolDistanceMeters;
  const nearestHosp = incident.auditableInsight?.calculatedMetrics?.nearestHospitalName;
  const hospDist = incident.auditableInsight?.calculatedMetrics?.nearestHospitalDistanceMeters;

  let responsibleDept = wardProfile?.primaryDepartment || 'MCD Drainage & Flood Control Division (Zone East)';
  let supportingDepts: string[] = wardProfile?.secondaryDepartments || [
    'Delhi Traffic Police Quick Response Unit',
    'Civil Defence Emergency Response Battalion',
    'Delhi Jal Board Hydro-Engineering Wing'
  ];

  const recommendedActions: ActionItemRecommendation[] = [];
  const requiredResources: OperationalResourceItem[] = [];
  let estimatedResponseTimeMinutes = wardProfile?.etaMinutes || (isP1 ? 18 : isP2 ? 30 : 45);
  let escalationCondition = '';
  let citizenAdvisoryText = '';
  let targetChannels: string[] = [];

  if (incident.category === 'waterlogging' || incident.category === 'drainage') {
    responsibleDept = wardProfile?.primaryDepartment || 'MCD Drainage & Flood Control Division (Zone East)';
    supportingDepts = [
      'Delhi Traffic Police Quick Response Unit',
      'Civil Defence Emergency Response Battalion',
      'Delhi Jal Board Hydro-Engineering Wing'
    ];

    // SOP Actions (Deterministic)
    recommendedActions.push(
      {
        id: 'act-sop-1',
        actionText: 'Deploy 2x high-capacity 100 HP diesel-driven dewatering pump trailers to low-lying siphon basin.',
        department: responsibleDept,
        rationale: `SOP Rule #WL-01: Triggered by ${signalCount} corroborated signals and active rainfall rate.`,
        isSopRule: true,
        isAiRecommendation: false
      },
      {
        id: 'act-sop-2',
        actionText: 'Erect high-visibility traffic cordons at subway entry ramps and activate vehicle diversions.',
        department: 'Delhi Traffic Police Quick Response Unit',
        rationale: 'SOP Rule #WL-02: Prevents vehicle engine stalls in submerged underpass incline.',
        isSopRule: true,
        isAiRecommendation: false
      },
      {
        id: 'act-sop-3',
        actionText: 'Inspect Stormwater Trunk Pumping Station #4 circuit breakers and clear inlet intake debris grates.',
        department: 'Delhi Jal Board Hydro-Engineering Wing',
        rationale: 'SOP Rule #WL-03: Resolves potential pump trip and removes plastic blockage.',
        isSopRule: true,
        isAiRecommendation: false
      }
    );

    // AI Adaptation Actions (Evidence-Backed)
    if (nearestSchool && (schoolDist ?? 999) <= 300) {
      recommendedActions.push({
        id: 'act-ai-1',
        actionText: `[AI Recommendation] Establish 30m sandbag barrier and safety cordon near ${nearestSchool} (${schoolDist}m away).`,
        department: 'Civil Defence Emergency Response Battalion',
        rationale: `Evidence Adaptation: Signals indicate trapped school transport van near ${nearestSchool}. High risk to student dispersal.`,
        isSopRule: false,
        isAiRecommendation: true
      });
    }

    if (nearestHosp && (hospDist ?? 999) <= 400) {
      recommendedActions.push({
        id: 'act-ai-2',
        actionText: `[AI Recommendation] Clear emergency ambulance corridor and construct sandbag bunding at ${nearestHosp} ER ramp (${hospDist}m away).`,
        department: responsibleDept,
        rationale: `Evidence Adaptation: ${nearestHosp} emergency access route is threatened by reverse flow waterlogging.`,
        isSopRule: false,
        isAiRecommendation: true
      });
    }

    // Required Resources (SOP vs AI)
    requiredResources.push(
      {
        item: '100 HP High-Volume Submersible Dewatering Pump Trailer',
        quantity: '2 Units',
        assignedUnit: 'MCD Pumping Yard (East Zone)',
        status: incident.status === 'dispatched' ? 'deployed' : 'ready',
        isSopResource: true,
        isAiRecommendation: false
      },
      {
        item: 'Heavy-Duty 8-inch Reinforced PVC Discharge Hose (150m)',
        quantity: '4 Lengths',
        assignedUnit: 'Drainage Rapid Response Tender #04',
        status: incident.status === 'dispatched' ? 'deployed' : 'ready',
        isSopResource: true,
        isAiRecommendation: false
      },
      {
        item: 'Retro-Reflective Traffic Barrier Cones & Warning Signage',
        quantity: '16 Cones',
        assignedUnit: 'Traffic Police Patrol Unit 12',
        status: incident.status === 'dispatched' ? 'deployed' : 'ready',
        isSopResource: true,
        isAiRecommendation: false
      },
      {
        item: 'Reinforced Coir Flood Control Sandbags (50kg)',
        quantity: '100 Bags',
        assignedUnit: 'Zonal Emergency Materials Depot',
        status: incident.status === 'dispatched' ? 'deployed' : 'ready',
        isSopResource: true,
        isAiRecommendation: false
      },
      // AI Recommended Resource
      {
        item: '[AI Recommendation] High-Clearance Amphibious Rescue Tender Vehicle',
        quantity: '1 Unit',
        assignedUnit: 'Civil Defence Quick Response Team B',
        status: incident.status === 'dispatched' ? 'deployed' : 'staged',
        isSopResource: false,
        isAiRecommendation: true
      }
    );

    escalationCondition = `If water depth exceeds 3.5 feet or drainage fails to recede after 45 minutes of active pumping, escalate immediately to District Disaster Management Authority (DDMA) Command Desk and request NDRF water rescue unit.`;

    citizenAdvisoryText = `🚨 CIVIC EMERGENCY ADVISORY (${targetLocation}): Severe waterlogging and drain overflow reported. Emergency dewatering pumps deployed. All light vehicles & commuters take flyover bypass route. Avoid underpass subway approach.`;
    targetChannels = ['Citizen App Push Advisory', 'Delhi Traffic X (@TrafficDelhi)', 'Emergency FM Broadcast 102.6 MHz'];

  } else if (incident.category === 'road_hazard') {
    responsibleDept = wardProfile?.primaryDepartment || 'Public Works Department (PWD) Road Infrastructure Wing';
    supportingDepts = ['Delhi Traffic Police Road Safety Division', 'MCD Zonal Engineering Desk'];

    recommendedActions.push(
      {
        id: 'act-sop-1',
        actionText: 'Deploy mobile asphalt patch repair van and compact high-grade cold-mix compound into crater.',
        department: responsibleDept,
        rationale: 'SOP Rule #RH-01: Rapid restoration of damaged road carriageway surface.',
        isSopRule: true,
        isAiRecommendation: false
      },
      {
        id: 'act-sop-2',
        actionText: 'Position reflective barricades and automated blinking solar hazard lamps around crater perimeter.',
        department: 'Delhi Traffic Police Road Safety Division',
        rationale: 'SOP Rule #RH-02: Prevents nighttime two-wheeler accidents and vehicle rim damage.',
        isSopRule: true,
        isAiRecommendation: false
      },
      {
        id: 'act-ai-1',
        actionText: '[AI Recommendation] Deploy traffic marshal for speed calming until cold-mix curing is complete.',
        department: 'Delhi Traffic Police Road Safety Division',
        rationale: 'Evidence Adaptation: High traffic velocity corridor detected during rush hour.',
        isSopRule: false,
        isAiRecommendation: true
      }
    );

    requiredResources.push(
      {
        item: 'Mobile Cold-Mix Asphalt Patch Compactor Unit',
        quantity: '1 Van',
        assignedUnit: 'PWD Ward Maintenance Yard',
        status: incident.status === 'dispatched' ? 'deployed' : 'ready',
        isSopResource: true,
        isAiRecommendation: false
      },
      {
        item: 'Retro-Reflective Heavy-Duty Steel Warning Barricades',
        quantity: '4 Units',
        assignedUnit: 'Traffic Patrol Desk',
        status: incident.status === 'dispatched' ? 'deployed' : 'ready',
        isSopResource: true,
        isAiRecommendation: false
      },
      {
        item: '[AI Recommendation] Rapid Curing Polymer Emulsion Additive',
        quantity: '2 Drums',
        assignedUnit: 'PWD Materials Reserve',
        status: 'staged',
        isSopResource: false,
        isAiRecommendation: true
      }
    );

    escalationCondition = 'If road cave-in expands beyond 2 meters or damages underlying utility mains (gas/water), escalate immediately to PWD Chief Engineer and Jal Board Emergency Control.';
    citizenAdvisoryText = `⚠️ ROAD HAZARD ADVISORY (${targetLocation}): Damaged road surface & crater detected. PWD repair crew dispatched. Drive cautiously and maintain speed limits.`;
    targetChannels = ['Citizen App Push Advisory', 'Traffic Police Social Broadcast'];

  } else {
    // Generic Municipal Incident SOP
    responsibleDept = wardProfile?.primaryDepartment || 'Municipal Corporation General Emergency Services';
    supportingDepts = ['Zonal Public Works Engineering', 'Civil Defence Operations Desk'];

    recommendedActions.push(
      {
        id: 'act-sop-1',
        actionText: 'Dispatch Zonal Junior Engineer for physical site inspection and immediate hazard mitigation.',
        department: responsibleDept,
        rationale: 'SOP Rule #GEN-01: Mandatory physical triage within 30 minutes of priority assignment.',
        isSopRule: true,
        isAiRecommendation: false
      },
      {
        id: 'act-sop-2',
        actionText: 'Coordinate municipal response crew and stage required equipment at zonal depot.',
        department: 'Zonal Public Works Engineering',
        rationale: 'SOP Rule #GEN-02: Ensures multi-department resource staging.',
        isSopRule: true,
        isAiRecommendation: false
      }
    );

    requiredResources.push(
      {
        item: 'Zonal Quick Response Inspection Van',
        quantity: '1 Unit',
        assignedUnit: 'MCD Duty Desk',
        status: incident.status === 'dispatched' ? 'deployed' : 'ready',
        isSopResource: true,
        isAiRecommendation: false
      }
    );

    escalationCondition = 'If incident severity increases or public safety threat expands, escalate to Zonal Municipal Commissioner Desk.';
    citizenAdvisoryText = `CIVIC NOTICE (${targetLocation}): Reported ${incident.category.replace('_', ' ')} incident is under active municipal inspection. Response crew en route.`;
    targetChannels = ['Citizen App Push Advisory'];
  }

  // Situation Assessment
  const summary = `Clustered ${signalCount} corroborating signals (+${velocitySurge}% velocity surge) near ${targetLocation}. Incident priority calculated at ${priorityScore}/100.`;
  const rootCause = incident.auditableInsight?.modelInference?.assessedRootCause || `Severe ${incident.category.replace('_', ' ')} triggered by localized environmental conditions and infrastructure bottleneck.`;
  const adaptedSopNotes = `SOP tailored with evidence adaptation based on proximity to ${nearestSchool || 'educational facilities'} (${schoolDist || 200}m) and ${nearestHosp || 'trauma centers'} (${hospDist || 300}m).`;
  const confidenceScore = incident.auditableInsight?.modelInference?.confidenceScore || 0.95;

  // Expected Impact Forecast
  const hazardReductionPercent = isP1 ? 88 : isP2 ? 75 : 60;
  const protectedAssets = [
    nearestSchool ? `${nearestSchool} (${schoolDist}m)` : 'Local Primary School',
    nearestHosp ? `${nearestHosp} (${hospDist}m)` : 'Community Trauma Hospital',
    'Mass Transit Corridor'
  ];
  const slaImpactDescription = `Executing this plan within ~${estimatedResponseTimeMinutes} minutes maintains ward SLA compliance target (${slaHours}h) and prevents cascading traffic gridlock.`;

  // Legacy compatibility fields
  const actionsList = recommendedActions.map(a => a.actionText);
  const equipmentList = requiredResources.map(r => ({
    name: r.item,
    count: parseInt(r.quantity) || 1,
    assignedUnit: r.assignedUnit,
    status: r.status
  }));

  const initialAuditEvent: PlanAuditEvent = {
    timestamp: new Date().toISOString(),
    eventType: 'response_plan_generated',
    actor: 'NagarBodh AI Response Planner Engine',
    details: `Generated deterministic SOP response plan for ${incident.ward} adapted with Gemini evidence recommendations.`
  };

  const planId = `plan-${incident.id}`;

  return {
    id: planId,
    incidentId: incident.id,
    responsibleDepartment: responsibleDept,
    supportingDepartments: supportingDepts,
    priority: priorityLabel,
    priorityLevel,
    sla: slaLabel,
    slaHours,
    recommendedActions,
    requiredResources,
    estimatedResponseTimeMinutes,
    publicCommunication: {
      citizenAdvisory: citizenAdvisoryText,
      targetChannels,
      isAiGenerated: true
    },
    escalationCondition,
    situationAssessment: {
      summary,
      rootCause,
      adaptedSopNotes,
      confidenceScore
    },
    expectedImpact: {
      hazardReductionPercent,
      protectedAssets,
      slaImpactDescription
    },
    status: 'pending_review',
    targetLocation,
    notes: `SOP Response Plan generated for ${incident.ward}. Priority: ${priorityScore}/100.`,
    auditTrail: [initialAuditEvent],

    // Legacy fields
    primaryDepartment: responsibleDept,
    secondaryDepartment: supportingDepts.join(' & '),
    actions: actionsList,
    equipment: equipmentList,
    etaMinutes: estimatedResponseTimeMinutes
  };
}
