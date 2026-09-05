import { ClusteredIncident, DispatchActionPlan } from '../types/civic';
import { getWardSOPProfile } from '../data/wardProfiles';

export function generateSOPActionPlan(incident: ClusteredIncident): DispatchActionPlan {
  const isP1 = incident.priority.overallScore >= 75;
  const isP2 = incident.priority.overallScore >= 45;

  const priorityLevel: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_STANDARD' = isP1
    ? 'P1_CRITICAL'
    : isP2
    ? 'P2_HIGH'
    : 'P3_STANDARD';

  // Look up ward-specific SOP overrides first
  const wardProfile = getWardSOPProfile(incident.ward, incident.category);

  if (incident.category === 'waterlogging' || incident.category === 'drainage') {
    const defaultActions = [
      'Deploy high-capacity dewatering pumps to the affected area.',
      'Erect physical cordon and divert traffic to alternate routes.',
      'Inspect stormwater pump station circuit breakers and clear inlet debris.',
      'Establish sandbag barriers near critical facilities.',
      'Send SMS advisories to nearby schools and healthcare facilities.'
    ];
    const defaultEquipment = [
      { name: '100 HP High-Volume Submersible Dewatering Pump', count: 2, assignedUnit: 'MCD Pumping Yard' },
      { name: 'Heavy-Duty 8-inch PVC Discharge Hose (150m)', count: 4, assignedUnit: 'Drainage Rapid Tender' },
      { name: 'Reflective Traffic Barrier Cones & Warning Signage', count: 12, assignedUnit: 'Traffic Division' },
      { name: 'Rapid Response Civil Defence Personnel', count: 8, assignedUnit: 'Zonal Battalion' },
      { name: 'Reinforced Coir Sandbags (50kg)', count: 80, assignedUnit: 'Flood Control Depot' }
    ];

    return {
      id: `plan-${incident.id}`,
      incidentId: incident.id,
      primaryDepartment: wardProfile?.primaryDepartment ?? 'MCD Drainage & Flood Control Division',
      secondaryDepartment: wardProfile?.secondaryDepartments?.join(' & ') ?? 'Delhi Traffic Police & Civil Defence Quick Response Unit',
      priorityLevel,
      targetLocation: wardProfile?.targetLocation ?? incident.ward,
      actions: wardProfile?.recommendedActions ?? defaultActions,
      equipment: defaultEquipment,
      status: 'pending_review',
      etaMinutes: wardProfile?.etaMinutes ?? 22,
      notes: `Automated SOP generated for ${incident.category} incident in ${incident.ward}. Rainfall: ${incident.priority.factors.weatherRiskScore > 10 ? 'Heavy' : 'Moderate'}.`
    };
  }

  if (incident.category === 'road_hazard') {
    return {
      id: `plan-${incident.id}`,
      incidentId: incident.id,
      primaryDepartment: wardProfile?.primaryDepartment ?? 'Public Works Department (PWD) Road Maintenance',
      secondaryDepartment: wardProfile?.secondaryDepartments?.join(' & ') ?? 'Traffic Police Road Safety Wing',
      priorityLevel,
      targetLocation: wardProfile?.targetLocation ?? incident.ward,
      actions: wardProfile?.recommendedActions ?? [
        'Deploy mobile road repair van with cold-mix asphalt patch compound.',
        'Install high-visibility retro-reflective barricade around crater / open manhole.',
        'Post traffic marshal for vehicular speed calming.'
      ],
      equipment: [
        { name: 'Cold-Mix Asphalt Patch Compactor Unit', count: 1, assignedUnit: 'PWD Ward Yard' },
        { name: 'Reflective Warning Barricades', count: 4, assignedUnit: 'Traffic Division' }
      ],
      status: 'pending_review',
      etaMinutes: wardProfile?.etaMinutes ?? 30,
      notes: 'Standard PWD Road Safety SOP triggered.'
    };
  }

  // Generic fallback
  return {
    id: `plan-${incident.id}`,
    incidentId: incident.id,
    primaryDepartment: wardProfile?.primaryDepartment ?? 'Municipal Corporation General Emergency Services',
    secondaryDepartment: wardProfile?.secondaryDepartments?.join(' & ') ?? 'Zonal Engineering Wing',
    priorityLevel,
    targetLocation: wardProfile?.targetLocation ?? incident.ward,
    actions: wardProfile?.recommendedActions ?? [
      'Field inspection by Zonal Junior Engineer within 30 minutes.',
      'Coordinate municipal crew for immediate hazard mitigation.'
    ],
    equipment: [
      { name: 'Zonal Quick Response Inspection Van', count: 1, assignedUnit: 'MCD Zone Desk' }
    ],
    status: 'pending_review',
    etaMinutes: wardProfile?.etaMinutes ?? 35,
    notes: 'Standard municipal triage protocol.'
  };
}

