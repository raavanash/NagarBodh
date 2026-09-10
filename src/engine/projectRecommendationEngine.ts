import { CivicCategory } from '../types/civic';
import { DemographicContext, DevelopmentCategory, DevelopmentGap, DevelopmentProjectRecommendation, InfrastructureContext, InvestmentContext } from '../types/development';

export function generateProjectRecommendation(
  hotspotId: string,
  category: DevelopmentCategory | CivicCategory | string,
  wardName: string,
  locationName: string,
  priorityScore: number,
  developmentGap: DevelopmentGap,
  demographics: DemographicContext,
  infrastructure: InfrastructureContext,
  investment: InvestmentContext
): DevelopmentProjectRecommendation {
  const projId = `proj-rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  let projectTitle = `Priority Infrastructure Development in ${wardName}`;
  let primaryDepartment = 'Ministry of Housing & Urban Affairs / State PWD';
  let supportingDepartments: string[] = ['Department of Expenditure', 'State Nodal Planning Agency'];
  const investGap = investment.investmentGapLakhs ?? (investment.plannedInvestment - investment.existingInvestment);
  let estimatedCostLakhs = investGap > 0 ? investGap : 250;
  let estimatedCompletionMonths = 12;
  const popEst = demographics.totalPopulationEstimate ?? demographics.population ?? 500000;
  const vulnRatio = demographics.vulnerableGroupRatio ?? (demographics.population > 0 ? demographics.vulnerablePopulation / demographics.population : 0.25);
  const unaddressedCount = investment.unaddressedRequestsCount ?? 20;

  switch (category) {
    case 'healthcare':
      projectTitle = `Primary Health Sub-Center & Emergency Access Corridor (${wardName})`;
      primaryDepartment = 'Department of Health & Family Welfare';
      supportingDepartments = ['Public Works Department (PWD)', 'National Health Mission'];
      estimatedCostLakhs = 450;
      estimatedCompletionMonths = 18;
      break;
    case 'education':
      projectTitle = `Model Secondary School Infrastructure Upgrade & Safe Transit Zone (${wardName})`;
      primaryDepartment = 'Department of School Education & Literacy';
      supportingDepartments = ['Urban Local Body', 'State Transport Department'];
      estimatedCostLakhs = 320;
      estimatedCompletionMonths = 14;
      break;
    case 'water':
    case 'waterlogging':
    case 'drainage':
      projectTitle = `Subway Inundation Mitigation & Stormwater Pumping Main Pipeline (${locationName || wardName})`;
      primaryDepartment = 'Delhi Jal Board / Municipal Infrastructure Department';
      supportingDepartments = ['Flood Control & Irrigation Dept', 'Disaster Management Authority'];
      estimatedCostLakhs = 580;
      estimatedCompletionMonths = 9;
      break;
    case 'sanitation':
    case 'garbage':
      projectTitle = `Integrated Solid Waste Processing Facility & Transfer Station (${wardName})`;
      primaryDepartment = 'Municipal Sanitation & Waste Management Dept';
      supportingDepartments = ['State Environment Protection Agency', 'Urban Local Body'];
      estimatedCostLakhs = 280;
      estimatedCompletionMonths = 8;
      break;
    case 'transport':
    case 'traffic':
    case 'roads':
    case 'road_hazard':
      projectTitle = `Urban Corridor Road Reconstruction & Traffic Bottleneck Elimination (${locationName || wardName})`;
      primaryDepartment = 'Public Works Department (PWD) / NHAI';
      supportingDepartments = ['Traffic Police Department', 'Urban Mass Transit Corp'];
      estimatedCostLakhs = 750;
      estimatedCompletionMonths = 12;
      break;
    case 'electricity':
      projectTitle = `High-Voltage Grid Substation Modernization & Underground Cabling (${wardName})`;
      primaryDepartment = 'State Electricity Distribution Board (DISCOM)';
      supportingDepartments = ['Power Grid Corporation', 'Municipal Infrastructure Division'];
      estimatedCostLakhs = 620;
      estimatedCompletionMonths = 10;
      break;
    case 'digital_connectivity':
      projectTitle = `Public Wi-Fi & Fibre Optical Digital Public Infrastructure Expansion (${wardName})`;
      primaryDepartment = 'Department of Telecommunications / Digital India Nodal Agency';
      supportingDepartments = ['State IT Department', 'Municipal Telecom Authority'];
      estimatedCostLakhs = 180;
      estimatedCompletionMonths = 6;
      break;
    case 'public_safety':
      projectTitle = `Smart City Surveillance, Street Lighting & Public Safety Hub (${wardName})`;
      primaryDepartment = 'Home Department / State Police Nodal Agency';
      supportingDepartments = ['Municipal Electrical Division', 'Women & Child Safety Cell'];
      estimatedCostLakhs = 240;
      estimatedCompletionMonths = 7;
      break;
  }

  const priorityLevel: 'P1_NATIONAL_HIGH_PRIORITY' | 'P2_STATE_PRIORITY' | 'P3_STANDARD_DEVELOPMENT' =
    priorityScore >= 80 ? 'P1_NATIONAL_HIGH_PRIORITY' : priorityScore >= 60 ? 'P2_STATE_PRIORITY' : 'P3_STANDARD_DEVELOPMENT';

  const beneficiaryCount = Math.round(popEst * 0.65);
  const deficitReductionPercent = Math.min(95, Math.round(developmentGap.overallGapIndex * 0.85));

  const recommendedActions = [
    {
      id: `act-1-${Date.now()}`,
      actionText: `Authorize Detailed Project Report (DPR) and land sanction for ${projectTitle}.`,
      department: primaryDepartment,
      rationale: `Directly addresses citizen demand gap of ${developmentGap.demandGapScore}/30 in ${wardName}.`,
      isSopRule: true,
      isAiRecommendation: false
    },
    {
      id: `act-2-${Date.now()}`,
      actionText: `Allocate capital grant of ₹${estimatedCostLakhs} Lakhs under National Infrastructure Plan (NIP) / State Development Fund.`,
      department: supportingDepartments[0] || 'Department of Expenditure',
      rationale: `Unfunded investment gap in ${wardName} currently stands at ₹${investGap} Lakhs.`,
      isSopRule: true,
      isAiRecommendation: true
    },
    {
      id: `act-3-${Date.now()}`,
      actionText: `Establish multi-agency coordination committee for fast-tracked execution within ${estimatedCompletionMonths} months.`,
      department: primaryDepartment,
      rationale: `Benefiting approximately ${beneficiaryCount.toLocaleString()} residents (${Math.round(vulnRatio * 100)}% vulnerable groups).`,
      isSopRule: false,
      isAiRecommendation: true
    }
  ];

  const justification =
    `Project recommended based on deterministic Priority Score of ${priorityScore}/100 and Development Gap Index of ${developmentGap.overallGapIndex}/100. Addressable beneficiary population is estimated at ${beneficiaryCount.toLocaleString()} citizens in ${wardName}.`;

  const protectedAssetsList = infrastructure.criticalAssetsNearby ? infrastructure.criticalAssetsNearby.map(a => a.name) : ['Local Ward Infrastructure'];

  return {
    id: projId,
    hotspotId,
    projectTitle,
    category: (category as DevelopmentCategory) || 'other',
    primaryDepartment,
    supportingDepartments,
    priorityLevel,
    estimatedCostLakhs,
    estimatedCompletionMonths,
    recommendedActions,
    expectedImpact: {
      beneficiaryCount,
      deficitReductionPercent,
      protectedAssets: protectedAssetsList,
      narrative: `Project expected to reduce infrastructure deficit by ${deficitReductionPercent}% and resolve ${unaddressedCount} pending citizen requests.`
    },
    status: 'pending_policy_review',
    targetLocation: locationName || wardName,
    justification
  };
}
