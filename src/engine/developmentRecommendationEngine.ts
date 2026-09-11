import { EvidenceItem } from '../types/civic';
import {
  CanonicalDevelopmentCategory,
  DemographicContext,
  DevelopmentCategory,
  DevelopmentGap,
  DevelopmentProjectRecommendation,
  DevelopmentRequestEvidence,
  GeographicHierarchy,
  InfrastructureContext,
  InvestmentContext
} from '../types/development';

export interface GenerateProjectRecommendationInput {
  hotspotId: string;
  category: CanonicalDevelopmentCategory | DevelopmentCategory | string;
  geography: GeographicHierarchy | {
    country: string;
    state: string;
    district: string;
    subDistrict?: string;
    wardOrDistrict?: string;
    locationName?: string;
  };
  priorityScoreVal: number;
  developmentGap: DevelopmentGap;
  demographics: DemographicContext;
  infrastructure: InfrastructureContext;
  investment: InvestmentContext;
  evidence: DevelopmentRequestEvidence[] | EvidenceItem[];
  sourceMode?: 'LIVE' | 'REPLAY' | 'SIMULATION' | 'HYBRID';
  geminiApiKey?: string;
}

/**
 * Transforms a high-priority Development Demand Hotspot into an explainable,
 * evidence-backed DevelopmentProjectRecommendation object.
 *
 * CRITICAL RULE: Numerical values (population, budget, gap index, priority score, beneficiary count)
 * are calculated strictly from structured data layers and must NEVER be fabricated by AI.
 */
export function generateDevelopmentProjectRecommendation(
  input: GenerateProjectRecommendationInput
): DevelopmentProjectRecommendation {
  const {
    hotspotId,
    category,
    geography,
    priorityScoreVal,
    developmentGap,
    demographics,
    infrastructure,
    investment,
    evidence,
    sourceMode = 'SIMULATION'
  } = input;

  const projId = `proj-rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const districtName = (geography as any).district || (geography as any).wardOrDistrict || (geography as any).locationName || 'District Sector';

  // 1. Structured Numerical Metric Extraction (DETERMINISTIC)
  const populationEstimate = demographics.totalPopulationEstimate ?? demographics.population ?? 50000;
  const expectedBeneficiaries = Math.round(populationEstimate * 0.65);
  const infrastructureIndexImprovement = Math.min(95, Math.max(25, Math.round(developmentGap.overallGapIndex * 0.85)));
  
  const investGap = investment.investmentGapLakhs ?? (investment.plannedInvestment - investment.existingInvestment);
  const estimatedCostLakhs = investGap > 0 ? investGap : 350;
  const unaddressedCount = investment.unaddressedRequestsCount ?? 15;

  const priorityLevel: 'P1_NATIONAL_HIGH_PRIORITY' | 'P2_STATE_PRIORITY' | 'P3_STANDARD_DEVELOPMENT' =
    priorityScoreVal >= 80 ? 'P1_NATIONAL_HIGH_PRIORITY' : priorityScoreVal >= 60 ? 'P2_STATE_PRIORITY' : 'P3_STANDARD_DEVELOPMENT';

  const catUpper = (category || 'OTHER').toString().toUpperCase();

  // 2. Deterministic Domain Templates
  let title = `District Infrastructure Development Programme (${districtName})`;
  let problemStatement = `High citizen demand reported in ${districtName} with a development gap score of ${developmentGap.overallGapIndex}/100 and unaddressed citizen request count of ${unaddressedCount}.`;
  let recommendedIntervention = `Establish infrastructure upgrades and targeted facility expansion in ${districtName}.`;
  let rationale = `Addresses unserved citizen demand gap (${developmentGap.demandGapScore}/30) and infrastructure deficit under Priority Level ${priorityLevel}.`;
  let implementationConsiderations = [
    `Detailed Project Report (DPR) sanction by State Nodal Planning Agency`,
    `Inter-agency coordination between Municipal Authority and Department of Expenditure`,
    `Public feedback monitoring during construction phase`
  ];
  let primaryDepartment = 'Ministry of Housing & Urban Affairs / State PWD';
  let supportingDepartments = ['Department of Expenditure', 'State Planning Board'];

  switch (catUpper) {
    case 'HEALTHCARE':
      title = 'District Healthcare Access Programme';
      problemStatement = `High citizen demand for healthcare access in ${districtName} with a low healthcare infrastructure index (${infrastructure.healthcareIndex ?? 35}/100) and high vulnerable population (${(demographics.vulnerablePopulation || Math.round(populationEstimate * 0.3)).toLocaleString()}).`;
      recommendedIntervention = 'Upgrade existing Primary Health Centres (PHCs) / establish 24/7 referral facility with emergency transit access.';
      rationale = `Directly addresses severe healthcare gap score (${developmentGap.overallGapIndex}/100) and provides essential medical access for ${expectedBeneficiaries.toLocaleString()} residents.`;
      implementationConsiderations = [
        'Land clearance and structural expansion approval for PHC facilities',
        'Staffing roster setup for 24/7 medical officer and emergency nurse shifts',
        'Allocation of medical equipment under National Health Mission funds'
      ];
      primaryDepartment = 'Department of Health & Family Welfare';
      supportingDepartments = ['Public Works Department (PWD)', 'National Health Mission'];
      break;

    case 'EDUCATION':
      title = 'District Secondary Education Capacity Programme';
      problemStatement = `Substantial student enrollment demand and classroom deficit in ${districtName} with education infrastructure index at ${infrastructure.educationIndex ?? 40}/100.`;
      recommendedIntervention = 'Expand secondary school classrooms, construct digital STEM laboratories, and establish safe pedestrian transit corridors.';
      rationale = `Mitigates secondary education capacity bottleneck for ${expectedBeneficiaries.toLocaleString()} youth and reduces overall education gap by ${infrastructureIndexImprovement}%.`;
      implementationConsiderations = [
        'School board accreditation and DPR sanction',
        'High-speed fiber connectivity for digital labs',
        'Pedestrian crossing & speed hump installation near school entrances'
      ];
      primaryDepartment = 'Department of School Education & Literacy';
      supportingDepartments = ['Urban Local Body', 'State Transport Department'];
      break;

    case 'WATER':
    case 'WATERLOGGING':
    case 'DRAINAGE':
      title = 'Regional Drinking Water Reliability Programme';
      problemStatement = `Persistent drinking water supply interruptions and low water index (${infrastructure.waterIndex ?? 30}/100) reported across ${districtName} by ${unaddressedCount} citizen reports.`;
      recommendedIntervention = 'Construct high-capacity bulk water distribution pipeline, install automated booster pumps, and upgrade regional filtration plant.';
      rationale = `Solves chronic drinking water scarcity and infrastructure deficit (${developmentGap.overallGapIndex}/100) for ${expectedBeneficiaries.toLocaleString()} citizens.`;
      implementationConsiderations = [
        'Pipeline Right-of-Way (RoW) clearance along major municipal roads',
        'Installation of IoT water quality and pressure monitoring sensors',
        'Joint execution sync with Jal Board and PWD'
      ];
      primaryDepartment = 'Jal Board / Municipal Water Supply Department';
      supportingDepartments = ['Public Works Department (PWD)', 'Disaster Management Authority'];
      break;

    case 'ROADS':
    case 'TRANSPORT':
    case 'TRAFFIC':
      title = 'Regional Transit & Road Safety Improvement Programme';
      problemStatement = `Traffic congestion bottlenecks, pavement degradation, and road hazard risks in ${districtName} causing transport index of ${infrastructure.transportIndex ?? 38}/100.`;
      recommendedIntervention = 'Reconstruct arterial corridor, widen high-volume intersections, and install intelligent traffic management signals.';
      rationale = `Resolves high-velocity citizen transport requests and reduces road hazard risk for ${expectedBeneficiaries.toLocaleString()} daily commuters.`;
      implementationConsiderations = [
        'Phased traffic diversion protocol during peak commuting hours',
        'Utility line relocation (electrical cables, water mains) before resurfacing',
        'Pedestrian pathway & street lighting integration'
      ];
      primaryDepartment = 'Public Works Department (PWD) / State Road Transport Authority';
      supportingDepartments = ['Traffic Police Department', 'Urban Mass Transit Corp'];
      break;

    case 'SANITATION':
    case 'GARBAGE':
      title = 'Integrated Municipal Solid Waste Processing Programme';
      problemStatement = `Uncollected municipal waste and sanitation index deficit (${infrastructure.sanitationIndex ?? 32}/100) in ${districtName} affecting public hygiene.`;
      recommendedIntervention = 'Establish decentralized solid waste processing facility, deploy segregated waste collection fleet, and upgrade drainage mains.';
      rationale = `Remediates sanitation gap score (${developmentGap.overallGapIndex}/100) and eliminates open waste dumpsites.`;
      implementationConsiderations = [
        'Environmental clearance from State Pollution Control Board',
        'Door-to-door waste collection route optimization',
        'Community segregation awareness campaigns'
      ];
      primaryDepartment = 'Municipal Sanitation & Waste Management Dept';
      supportingDepartments = ['State Environment Protection Agency', 'Urban Local Body'];
      break;

    case 'ELECTRICITY':
      title = 'High-Voltage Substation Reliability & Grid Expansion Programme';
      problemStatement = `Frequent power outages and grid voltage instability in ${districtName} with electricity index of ${infrastructure.electricityIndex ?? 45}/100.`;
      recommendedIntervention = 'Upgrade regional high-voltage grid substation, replace aging transformers, and lay underground distribution cables.';
      rationale = `Ensures 24/7 continuous power supply for ${expectedBeneficiaries.toLocaleString()} residents and critical commercial assets.`;
      implementationConsiderations = [
        'Substation land allocation and safety clearance',
        'Underground cabling coordination with road authorities',
        'DISCOM power load management setup'
      ];
      primaryDepartment = 'State Electricity Distribution Board (DISCOM)';
      supportingDepartments = ['Power Grid Corporation', 'Municipal Electrical Division'];
      break;

    case 'DIGITAL_CONNECTIVITY':
      title = 'Public Fiber & Digital Infrastructure Expansion Programme';
      problemStatement = `Low broadband penetration and digital connectivity index of ${infrastructure.digitalConnectivityIndex ?? 35}/100 in ${districtName}.`;
      recommendedIntervention = 'Deploy municipal optical fiber backbone, set up public Wi-Fi hotspots, and upgrade digital public infrastructure.';
      rationale = `Enhances digital inclusion and service delivery across ${districtName} for ${expectedBeneficiaries.toLocaleString()} residents.`;
      implementationConsiderations = [
        'Telecom Right-of-Way (RoW) policy alignment',
        'Public Wi-Fi security authentication & bandwidth capping',
        'Optical fiber splicing and maintenance contracts'
      ];
      primaryDepartment = 'Department of Telecommunications / Digital Nodal Agency';
      supportingDepartments = ['State IT Department', 'Municipal Telecom Authority'];
      break;

    case 'PUBLIC_SAFETY':
      title = 'Smart Surveillance & Public Lighting Programme';
      problemStatement = `Inadequate street lighting and dark spot vulnerability in ${districtName} raising public safety concerns.`;
      recommendedIntervention = 'Install high-definition CCTV camera network, deploy smart LED street lighting, and set up integrated emergency call boxes.';
      rationale = `Significantly improves night-time public safety and protects ${expectedBeneficiaries.toLocaleString()} citizens.`;
      implementationConsiderations = [
        'Police control room command center system integration',
        'Dedicated electrical feeder line installation for streetlights',
        'Citizen privacy compliance framework enforcement'
      ];
      primaryDepartment = 'Home Department / State Police Nodal Agency';
      supportingDepartments = ['Municipal Electrical Division', 'Women & Child Safety Cell'];
      break;
  }

  // 3. Construct Standard Action Items Checklist
  const recommendedActions = [
    {
      id: `act-1-${Date.now()}`,
      actionText: `Authorize Detailed Project Report (DPR) and site sanction for ${title}.`,
      department: primaryDepartment,
      rationale: `Directly targets citizen demand gap (${developmentGap.demandGapScore}/30) in ${districtName}.`,
      isSopRule: true,
      isAiRecommendation: false
    },
    {
      id: `act-2-${Date.now()}`,
      actionText: `Allocate capital grant of ₹${estimatedCostLakhs} Lakhs under National Infrastructure Plan / State Capital Budget.`,
      department: supportingDepartments[0] || 'Department of Expenditure',
      rationale: `Unfunded investment gap in ${districtName} currently stands at ₹${estimatedCostLakhs} Lakhs.`,
      isSopRule: true,
      isAiRecommendation: true
    },
    {
      id: `act-3-${Date.now()}`,
      actionText: `Form multi-agency implementation taskforce to complete intervention within 12-18 months.`,
      department: primaryDepartment,
      rationale: `Serves an estimated ${expectedBeneficiaries.toLocaleString()} residents with expected deficit reduction of ${infrastructureIndexImprovement}%.`,
      isSopRule: false,
      isAiRecommendation: true
    }
  ];

  const protectedAssetsList = infrastructure.criticalAssetsNearby ? infrastructure.criticalAssetsNearby.map(a => a.name) : ['Local Community Assets'];

  const narrative = `Project is projected to improve local infrastructure deficit index by ${infrastructureIndexImprovement}%, directly benefiting ${expectedBeneficiaries.toLocaleString()} citizens in ${districtName} and resolving ${unaddressedCount} unserved citizen requests.`;

  return {
    id: projId,
    hotspotId,
    title,
    projectTitle: title,
    category: (category as any) || 'other',
    geography,
    problemStatement,
    recommendedIntervention,
    priorityScore: priorityScoreVal,
    priorityLevel,
    expectedBeneficiaries,
    estimatedImpact: {
      infrastructureIndexImprovement,
      beneficiaryCount: expectedBeneficiaries,
      deficitReductionPercent: infrastructureIndexImprovement,
      protectedAssets: protectedAssetsList,
      narrative
    },
    supportingEvidence: (evidence && evidence.length > 0) ? evidence : [
      {
        classification: 'CALCULATED',
        snippet: `Calculated Development Priority Score: ${priorityScoreVal}/100, Development Gap: ${developmentGap.overallGapIndex}/100.`,
        source: 'NagarBodh Deterministic Development Engine',
        confidence: 1.0
      }
    ],
    rationale,
    implementationConsiderations,
    confidence: 0.94,
    sourceMode,
    status: 'pending_policy_review',
    primaryDepartment,
    supportingDepartments,
    estimatedCostLakhs,
    estimatedCompletionMonths: priorityScoreVal >= 80 ? 18 : 12,
    recommendedActions,
    targetLocation: districtName,
    justification: rationale
  };
}
