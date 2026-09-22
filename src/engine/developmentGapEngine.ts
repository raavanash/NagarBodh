import { ClusteredIncident, CivicSignal } from '../types/civic';
import {
  DemographicContext,
  DevelopmentCategory,
  DevelopmentGap,
  InfrastructureContext,
  InvestmentContext,
  InvestmentExplanationDossier,
  PriorityCalculationFactorDossier,
  TraceableEvidenceStep
} from '../types/development';
import {
  calculateDevelopmentPriority,
  DemandScoreInput
} from './developmentPriorityEngine';
import { generateDevelopmentProjectRecommendation } from './developmentRecommendationEngine';
import { calculateDevelopmentImpact } from './developmentImpactEngine';
import { BASELINE_SIGNALS, SECTOR_15_SIMULATION_SIGNALS } from '../data/initialData';

export function calculateDevelopmentGap(
  category: DevelopmentCategory,
  requestCount: number,
  velocityPerHour: number,
  demographics: DemographicContext,
  infrastructure: InfrastructureContext,
  investment: InvestmentContext
): DevelopmentGap {
  // 1. Demand Gap Score (out of 30)
  const volumeFactor = Math.min(15, Math.round(requestCount * 1.5));
  const velocityFactor = Math.min(15, Math.round(velocityPerHour * 2.5));
  const demandGapScore = Math.min(30, volumeFactor + velocityFactor);

  // 2. Infrastructure Deficit Score (out of 25)
  const nearestDist = infrastructure.nearestFacilityDistanceMeters ?? 1000;
  const capUtil = infrastructure.capacityUtilizationPercent ?? 75;
  const distancePenalty = Math.min(15, Math.round(nearestDist / 100));
  const capacityPenalty = Math.min(10, Math.round((capUtil - 50) / 5));
  const infrastructureDeficitScore = Math.min(25, Math.max(5, distancePenalty + Math.max(0, capacityPenalty)));

  // 3. Demographic Vulnerability Score (out of 20)
  const popDensity = demographics.populationDensityPerSqKm ?? demographics.populationDensity ?? 10000;
  const vulnRatio = demographics.vulnerableGroupRatio ?? (demographics.population > 0 ? demographics.vulnerablePopulation / demographics.population : 0.25);
  const densityScore = Math.min(10, Math.round(popDensity / 2000));
  const vulnerabilityScore = Math.round(vulnRatio * 10);
  const demographicVulnerabilityScore = Math.min(20, densityScore + vulnerabilityScore);

  // 4. Investment Deficit Score (out of 15)
  const approvedBudget = investment.approvedBudgetLakhs ?? investment.existingInvestment ?? 1000;
  const investGap = investment.investmentGapLakhs ?? (investment.plannedInvestment - investment.existingInvestment);
  const unaddressedCount = investment.unaddressedRequestsCount ?? 20;

  const gapRatio = approvedBudget > 0 ? investGap / approvedBudget : 1.0;
  const investmentDeficitScore = Math.min(15, Math.round(gapRatio * 15));

  // 5. Environmental & Recurrence Risk Score (out of 10)
  const unaddressedPenalty = Math.min(10, Math.round(unaddressedCount * 2));
  const environmentalRiskScore = Math.min(10, unaddressedPenalty);

  // Overall Gap Index (0 - 100)
  const overallGapIndex = Math.min(
    100,
    demandGapScore + infrastructureDeficitScore + demographicVulnerabilityScore + investmentDeficitScore + environmentalRiskScore
  );

  const explanationBullets: string[] = [
    `Citizen Demand Gap: Aggregated ${requestCount} citizen requests (${velocityPerHour.toFixed(1)} req/hr velocity).`,
    `Infrastructure Deficit: Nearest ${infrastructure.nearestFacilityName || 'facility'} is ${nearestDist}m away with ${capUtil}% utilization.`,
    `Demographic Vulnerability: ${demographics.wardName || 'Region'} density ${popDensity}/km² (${Math.round(vulnRatio * 100)}% vulnerable population).`,
    `Investment Deficit: Unfunded gap of ₹${investGap} Lakhs across ${unaddressedCount} historical unaddressed requests.`
  ];

  return {
    overallGapIndex,
    demandGapScore,
    infrastructureDeficitScore,
    demographicVulnerabilityScore,
    investmentDeficitScore,
    environmentalRiskScore,
    explanationBullets
  };
}

export interface SectorInvestmentMetric {
  category: 'HEALTHCARE' | 'WATER' | 'TRANSPORT' | 'EDUCATION';
  label: string;
  demandScore: number;
  infraIndex: number;
  gapLakhs: number;
  affectedPop: string;
  status: 'CRITICAL DEFICIT' | 'HIGH DEFICIT' | 'MODERATE DEFICIT';
  color: string;
}

export interface InvestmentGapRow {
  id: string;
  district: string;
  ward: string;
  category: 'HEALTHCARE' | 'WATER' | 'TRANSPORT' | 'EDUCATION';
  need: string;
  demandScore: number;
  infraIndex: number;
  gapLakhs: number;
  affectedPop: number;
  aiExplanation: string;
  incidentId?: string;
  explanationDossier?: InvestmentExplanationDossier;
}

interface SectorConfig {
  category: 'HEALTHCARE' | 'WATER' | 'TRANSPORT' | 'EDUCATION';
  label: string;
  color: string;
  district: string;
  ward: string;
  matchingCategories: string[];
  demographics: DemographicContext;
  infrastructure: InfrastructureContext;
  investment: InvestmentContext;
  defaultNeed: string;
}

const SECTOR_CONFIGS: SectorConfig[] = [
  {
    category: 'HEALTHCARE',
    label: 'Healthcare Infrastructure',
    color: '#ef4444',
    district: 'North East Delhi',
    ward: 'Ward 15 — Seelampur / Mayur Enclave',
    matchingCategories: ['healthcare', 'garbage', 'sanitation'],
    demographics: {
      population: 148000,
      populationDensity: 14200,
      populationGrowth: 1.5,
      urbanizationRate: 94,
      vulnerablePopulation: 38000,
      youthPopulation: 52000,
      elderlyPopulation: 18000,
      wardName: 'Ward 15 — Seelampur / Mayur Enclave'
    },
    infrastructure: {
      healthcareIndex: 38,
      educationIndex: 45,
      waterIndex: 35,
      sanitationIndex: 40,
      transportIndex: 48,
      electricityIndex: 75,
      digitalConnectivityIndex: 85,
      infrastructureDeficitIndex: 62,
      nearestFacilityName: 'Government Secondary Hospital',
      nearestFacilityDistanceMeters: 28000,
      capacityUtilizationPercent: 88
    },
    investment: {
      existingInvestment: 250,
      plannedInvestment: 700,
      activeProjects: 2,
      plannedProjects: 1,
      investmentByCategory: { HEALTHCARE: 700 },
      investmentGapLakhs: 450,
      unaddressedRequestsCount: 18
    },
    defaultNeed: 'Primary Health Sub-Center & Mobile Emergency Unit'
  },
  {
    category: 'WATER',
    label: 'Water & Urban Drainage',
    color: '#f59e0b',
    district: 'East Delhi',
    ward: 'Ward 15 — Sector 15 / Laxmi Nagar Dip',
    matchingCategories: ['waterlogging', 'drainage', 'water'],
    demographics: {
      population: 184000,
      populationDensity: 18400,
      populationGrowth: 1.6,
      urbanizationRate: 98,
      vulnerablePopulation: 45000,
      youthPopulation: 64000,
      elderlyPopulation: 22000,
      wardName: 'Ward 15 — Sector 15 / Laxmi Nagar Dip'
    },
    infrastructure: {
      healthcareIndex: 70,
      educationIndex: 80,
      waterIndex: 35,
      sanitationIndex: 45,
      transportIndex: 75,
      electricityIndex: 80,
      digitalConnectivityIndex: 90,
      infrastructureDeficitIndex: 65,
      nearestFacilityName: 'Trunk Drain Outfall #4',
      nearestFacilityDistanceMeters: 1800,
      capacityUtilizationPercent: 92
    },
    investment: {
      existingInvestment: 200,
      plannedInvestment: 550,
      activeProjects: 1,
      plannedProjects: 1,
      investmentByCategory: { WATER: 550 },
      investmentGapLakhs: 350,
      unaddressedRequestsCount: 22
    },
    defaultNeed: 'Sub-surface Automated Stormwater Pumping Array'
  },
  {
    category: 'TRANSPORT',
    label: 'Public Transit & Arterials',
    color: '#3b82f6',
    district: 'North West Delhi',
    ward: 'Ward 08 — Rohini Sector 16',
    matchingCategories: ['traffic', 'road_hazard', 'transport', 'roads'],
    demographics: {
      population: 210000,
      populationDensity: 16800,
      populationGrowth: 1.8,
      urbanizationRate: 96,
      vulnerablePopulation: 42000,
      youthPopulation: 75000,
      elderlyPopulation: 26000,
      wardName: 'Ward 08 — Rohini Sector 16'
    },
    infrastructure: {
      healthcareIndex: 75,
      educationIndex: 78,
      waterIndex: 60,
      sanitationIndex: 55,
      transportIndex: 48,
      electricityIndex: 82,
      digitalConnectivityIndex: 88,
      infrastructureDeficitIndex: 52,
      nearestFacilityName: 'Rohini West Feeder Terminal',
      nearestFacilityDistanceMeters: 2400,
      capacityUtilizationPercent: 85
    },
    investment: {
      existingInvestment: 320,
      plannedInvestment: 600,
      activeProjects: 2,
      plannedProjects: 2,
      investmentByCategory: { TRANSPORT: 600 },
      investmentGapLakhs: 280,
      unaddressedRequestsCount: 16
    },
    defaultNeed: 'Feeder Transit Corridor & Bus Terminal Upgrade'
  },
  {
    category: 'EDUCATION',
    label: 'Primary School Infrastructure',
    color: '#10b981',
    district: 'South West Delhi',
    ward: 'Ward 24 — Dwarka Sector 12',
    matchingCategories: ['education', 'electricity'],
    demographics: {
      population: 92000,
      populationDensity: 12000,
      populationGrowth: 1.4,
      urbanizationRate: 92,
      vulnerablePopulation: 22000,
      youthPopulation: 38000,
      elderlyPopulation: 12000,
      wardName: 'Ward 24 — Dwarka Sector 12'
    },
    infrastructure: {
      healthcareIndex: 80,
      educationIndex: 55,
      waterIndex: 65,
      sanitationIndex: 60,
      transportIndex: 70,
      electricityIndex: 78,
      digitalConnectivityIndex: 92,
      infrastructureDeficitIndex: 45,
      nearestFacilityName: 'Primary School Annex',
      nearestFacilityDistanceMeters: 1400,
      capacityUtilizationPercent: 78
    },
    investment: {
      existingInvestment: 170,
      plannedInvestment: 350,
      activeProjects: 1,
      plannedProjects: 1,
      investmentByCategory: { EDUCATION: 350 },
      investmentGapLakhs: 180,
      unaddressedRequestsCount: 12
    },
    defaultNeed: 'Maternal & Primary Care Smart Annex'
  }
];

/**
 * Derives dynamic Civic Investment Board metrics from current application incident state
 * using existing domain engines (developmentGapEngine, developmentPriorityEngine, developmentRecommendationEngine).
 */
export function deriveInvestmentBoardMetrics(
  incidents: ClusteredIncident[]
): {
  sectorMetrics: SectorInvestmentMetric[];
  gapRows: InvestmentGapRow[];
} {
  const sectorMetrics: SectorInvestmentMetric[] = [];
  const gapRows: InvestmentGapRow[] = [];

  SECTOR_CONFIGS.forEach((cfg, idx) => {
    // Find matching active incidents in current application state
    const matchedIncidents = incidents.filter(i =>
      cfg.matchingCategories.includes(i.category.toLowerCase())
    );

    // Pick the most critical matching incident, if any
    const activeIncident = matchedIncidents.length > 0
      ? [...matchedIncidents].sort((a, b) => b.priority.overallScore - a.priority.overallScore)[0]
      : null;

    const requestCount = activeIncident
      ? (activeIncident.signalIds?.length || activeIncident.auditableInsight?.calculatedMetrics?.signalCount || 10)
      : (idx === 0 ? 14 : idx === 1 ? 8 : idx === 2 ? 10 : 6);

    const velocityPerHour = activeIncident
      ? (activeIncident.velocityPerHour || 2.5)
      : (idx === 0 ? 3.2 : idx === 1 ? 2.0 : idx === 2 ? 2.8 : 1.5);

    const surgeMultiplier = activeIncident
      ? 1.0 + Math.min(2.0, (activeIncident.velocitySurgePercent || 0) / 100)
      : 1.0;

    const isSurging = activeIncident && (
      (activeIncident.velocitySurgePercent && activeIncident.velocitySurgePercent >= 100) ||
      ((activeIncident.signalIds?.length || (activeIncident as any).signalsCount || 0) >= 10) ||
      (activeIncident.priority && (activeIncident.priority.overallScore >= 80 || (activeIncident.priority as any).severity === 'p1')) ||
      (cfg.category === 'WATER' && (activeIncident.category === 'waterlogging' || (activeIncident.ward && activeIncident.ward.toLowerCase().includes('sector 15'))))
    );

    const demographics: DemographicContext = isSurging && cfg.category === 'WATER'
      ? {
          ...cfg.demographics,
          populationImpactIndex: 95,
          vulnerabilityIndex: 91,
          vulnerableGroupRatio: 0.245,
          vulnerablePopulation: 45000
        }
      : (activeIncident?.demographics || cfg.demographics);

    const infrastructure: InfrastructureContext = isSurging && cfg.category === 'WATER'
      ? { ...cfg.infrastructure, capacityUtilizationPercent: 98, infrastructureDeficitIndex: 94 }
      : (activeIncident?.infrastructure || cfg.infrastructure);

    const investment: InvestmentContext = isSurging && cfg.category === 'WATER'
      ? { ...cfg.investment, investmentGapIndex: 93, investmentGapLakhs: 350 }
      : (activeIncident?.investment || cfg.investment);

    const demandInput = isSurging && cfg.category === 'WATER'
      ? {
          requestCount: requestCount || 32,
          velocityPerHour: Math.max(velocityPerHour, 11.5),
          surgeMultiplier: Math.max(surgeMultiplier, 4.5),
          channelCount: 4,
          averageIntensity: 0.96
        }
      : {
          requestCount,
          velocityPerHour,
          surgeMultiplier
        };

    // 1. Run developmentGapEngine
    const gap = activeIncident?.developmentGap || calculateDevelopmentGap(
      cfg.category.toLowerCase() as any,
      demandInput.requestCount,
      demandInput.velocityPerHour,
      demographics,
      infrastructure,
      investment
    );

    // 2. Run developmentPriorityEngine
    const priority = calculateDevelopmentPriority(
      activeIncident?.id || `sector-gap-${cfg.category.toLowerCase()}`,
      cfg.category,
      demandInput,
      demographics,
      infrastructure,
      investment
    );

    // 3. Run developmentRecommendationEngine
    const recommendation = activeIncident?.projectRecommendation || generateDevelopmentProjectRecommendation({
      hotspotId: activeIncident?.id || `hotspot-${cfg.category.toLowerCase()}`,
      category: cfg.category,
      geography: {
        country: 'India',
        state: 'Delhi NCR',
        district: activeIncident?.ward || cfg.district,
        wardOrDistrict: activeIncident?.ward || cfg.ward,
        locationName: activeIncident?.locationName || cfg.ward
      },
      priorityScoreVal: priority.priorityScore,
      developmentGap: gap,
      demographics,
      infrastructure,
      investment,
      evidence: activeIncident?.evidenceChain || []
    });

    const infraIndex = cfg.category === 'HEALTHCARE'
      ? (infrastructure.healthcareIndex ?? 38)
      : cfg.category === 'WATER'
      ? (infrastructure.waterIndex ?? 35)
      : cfg.category === 'TRANSPORT'
      ? (infrastructure.transportIndex ?? 48)
      : (infrastructure.educationIndex ?? 55);

    const gapLakhs = recommendation.estimatedCostLakhs || investment.investmentGapLakhs || 300;
    const demandScore = priority.demandScore;
    const affectedPop = demographics.totalPopulationEstimate ?? demographics.population ?? 100000;

    const effectivePriority = priority.priorityScore;

    const status: 'CRITICAL DEFICIT' | 'HIGH DEFICIT' | 'MODERATE DEFICIT' =
      effectivePriority >= 80 ? 'CRITICAL DEFICIT' : effectivePriority >= 65 ? 'HIGH DEFICIT' : 'MODERATE DEFICIT';

    sectorMetrics.push({
      category: cfg.category,
      label: cfg.label,
      demandScore,
      infraIndex,
      gapLakhs,
      affectedPop: affectedPop.toLocaleString(),
      status,
      color: cfg.color
    });

    const aiExplanation = activeIncident
      ? `[OBSERVED DEMAND] ${demandScore}/100 (${demandInput.requestCount} signals in ${activeIncident.ward}). [BASELINE CONTEXT] ${gap.explanationBullets[1] || `Current index: ${infraIndex}/100`}. [CALCULATED CAPEX] ₹${gapLakhs}L.`
      : `[OBSERVED DEMAND] ${demandScore}/100 baseline. [BASELINE CONTEXT] Infra index ${infraIndex}/100 in ${cfg.ward}. [CALCULATED CAPEX] Unfunded gap ₹${gapLakhs}L.`;

    const explanationDossier = buildInvestmentExplanationDossier(cfg.category, incidents);

    gapRows.push({
      id: `gap-${cfg.category.toLowerCase()}`,
      district: cfg.district,
      ward: activeIncident?.ward || cfg.ward,
      category: cfg.category,
      need: recommendation.recommendedIntervention || cfg.defaultNeed,
      demandScore,
      infraIndex,
      gapLakhs,
      affectedPop,
      aiExplanation,
      incidentId: activeIncident?.id || incidents[0]?.id,
      explanationDossier
    });
  });

  return { sectorMetrics, gapRows };
}

export function buildInvestmentExplanationDossier(
  categoryOrGapId: string,
  incidents: ClusteredIncident[],
  allSignals: CivicSignal[] = []
): InvestmentExplanationDossier {
  const normCat = categoryOrGapId.replace(/^gap-/, '').toUpperCase();
  const cfg = SECTOR_CONFIGS.find(c => c.category === normCat) || SECTOR_CONFIGS[0];

  const activeIncident = incidents.find(i =>
    cfg.matchingCategories.includes(i.category.toLowerCase()) ||
    (i.ward && i.ward.toLowerCase().includes(cfg.category.toLowerCase())) ||
    (cfg.category === 'WATER' && (i.category === 'waterlogging' || i.title.toLowerCase().includes('sector 15') || i.title.toLowerCase().includes('flood')))
  );

  const isSurging = activeIncident && (
    (activeIncident.velocitySurgePercent && activeIncident.velocitySurgePercent >= 100) ||
    ((activeIncident.signalIds?.length || (activeIncident as any).signalsCount || 0) >= 10) ||
    (activeIncident.priority && (activeIncident.priority.overallScore >= 80 || (activeIncident.priority as any).severity === 'p1')) ||
    (cfg.category === 'WATER' && (activeIncident.category === 'waterlogging' || (activeIncident.ward && activeIncident.ward.toLowerCase().includes('sector 15'))))
  );

  const demographics: DemographicContext = isSurging && cfg.category === 'WATER'
    ? {
        ...cfg.demographics,
        populationImpactIndex: 95,
        vulnerabilityIndex: 91,
        vulnerableGroupRatio: 0.245,
        vulnerablePopulation: 45000
      }
    : (activeIncident?.demographics || cfg.demographics);

  const infrastructure: InfrastructureContext = isSurging && cfg.category === 'WATER'
    ? { ...cfg.infrastructure, capacityUtilizationPercent: 98, infrastructureDeficitIndex: 94 }
    : (activeIncident?.infrastructure || cfg.infrastructure);

  const investment: InvestmentContext = isSurging && cfg.category === 'WATER'
    ? { ...cfg.investment, investmentGapIndex: 93, investmentGapLakhs: 350 }
    : (activeIncident?.investment || cfg.investment);

  const requestCount = activeIncident ? (activeIncident.signalIds?.length || (activeIncident as any).signalsCount || 1) : 1;
  const velocityPerHour = activeIncident?.velocityPerHour ?? 1.5;
  const surgeMultiplier = activeIncident?.velocitySurgePercent ? (1 + activeIncident.velocitySurgePercent / 100) : 1.0;

  // Representative signals
  const matchingSignals = allSignals.filter(s =>
    activeIncident?.signalIds?.includes(s.id) ||
    cfg.matchingCategories.includes(s.category?.toLowerCase() || '')
  );
  const fallbackSignals = cfg.category === 'WATER'
    ? SECTOR_15_SIMULATION_SIGNALS
    : BASELINE_SIGNALS.filter(s => cfg.matchingCategories.includes(s.category?.toLowerCase() || ''));
  const candidateSignals = matchingSignals.length > 0 ? matchingSignals : fallbackSignals;

  const representativeSignals = candidateSignals.slice(0, 3).map(s => ({
    id: s.id,
    rawText: s.rawText,
    channel: s.channel,
    timestamp: s.simulatedTimeLabel || '10:14 AM',
    authorHandle: s.authorHandle || '@CitizenContributor',
    detectedLanguage: s.detectedLanguage || 'en'
  }));

  const channelSet = new Set(candidateSignals.map(s => s.channel));
  const signalChannels = channelSet.size > 0 ? Array.from(channelSet) : ['citizen_app', 'helpline_112', 'social_x'];

  const demandInput: DemandScoreInput = isSurging && cfg.category === 'WATER'
    ? {
        requestCount: requestCount || 32,
        velocityPerHour: Math.max(velocityPerHour, 11.5),
        surgeMultiplier: Math.max(surgeMultiplier, 4.5),
        channelCount: Math.max(signalChannels.length, 4),
        averageIntensity: 0.96
      }
    : {
        requestCount,
        velocityPerHour,
        surgeMultiplier,
        channelCount: activeIncident ? signalChannels.length : 1
      };

  // 1. Run developmentGapEngine
  const gap = calculateDevelopmentGap(
    cfg.category.toLowerCase() as DevelopmentCategory,
    demandInput.requestCount,
    demandInput.velocityPerHour,
    demographics,
    infrastructure,
    investment
  );

  // 2. Run developmentPriorityEngine
  const priority = calculateDevelopmentPriority(
    activeIncident?.id || `sector-gap-${cfg.category.toLowerCase()}`,
    cfg.category,
    demandInput,
    demographics,
    infrastructure,
    investment
  );

  // 3. Run developmentRecommendationEngine
  const recommendation = activeIncident?.projectRecommendation || generateDevelopmentProjectRecommendation({
    hotspotId: activeIncident?.id || `hotspot-${cfg.category.toLowerCase()}`,
    category: cfg.category,
    geography: {
      country: 'India',
      state: 'Delhi NCR',
      district: activeIncident?.ward || cfg.district,
      wardOrDistrict: activeIncident?.ward || cfg.ward,
      locationName: activeIncident?.locationName || cfg.ward
    },
    priorityScoreVal: priority.priorityScore,
    developmentGap: gap,
    demographics,
    infrastructure,
    investment,
    evidence: activeIncident?.evidenceChain || []
  });

  const infraIndex = cfg.category === 'HEALTHCARE'
    ? (infrastructure.healthcareIndex ?? 38)
    : cfg.category === 'WATER'
    ? (infrastructure.waterIndex ?? 35)
    : cfg.category === 'TRANSPORT'
    ? (infrastructure.transportIndex ?? 48)
    : (infrastructure.educationIndex ?? 55);

  const gapLakhs = recommendation.estimatedCostLakhs || investment.investmentGapLakhs || 350;
  const demandScore = priority.demandScore;
  const affectedPop = demographics.totalPopulationEstimate ?? demographics.population ?? 100000;
  const effectivePriority = priority.priorityScore;

  const status: 'CRITICAL DEFICIT' | 'HIGH DEFICIT' | 'MODERATE DEFICIT' =
    effectivePriority >= 80 ? 'CRITICAL DEFICIT' : effectivePriority >= 65 ? 'HIGH DEFICIT' : 'MODERATE DEFICIT';

  // 4. Run developmentImpactEngine for deterministic projected outcomes
  const impact = calculateDevelopmentImpact({
    project: recommendation,
    context: {
      demographic: demographics,
      infrastructure,
      investment,
      environmental: { rainfallMmPerHour: 42, floodRiskZone: true, temperatureCelsius: 28, airQualityIndex: 165 } as any,
      source: 'Civic Context Registry',
      mode: 'SIMULATION'
    } as any,
    mode: 'SIMULATION'
  });

  // 5. Factors with weights and explanations
  const factors: PriorityCalculationFactorDossier[] = [
    {
      factor: 'Citizen Demand',
      score: priority.demandScore,
      weightPercent: 25,
      contribution: parseFloat((priority.demandScore * 0.25).toFixed(1)),
      evidence: `${demandInput.requestCount} citizen requests (${demandInput.velocityPerHour.toFixed(1)} req/hr velocity across ${demandInput.channelCount ?? signalChannels.length} channels)`,
      source: 'Multi-channel Citizen Signal Stream [OBSERVED]',
      provenance: 'CALCULATED'
    },
    {
      factor: 'Infrastructure Deficit',
      score: priority.infrastructureGap,
      weightPercent: 25,
      contribution: parseFloat((priority.infrastructureGap * 0.25).toFixed(1)),
      evidence: `Deficit Index ${priority.infrastructureGap}/100. Nearest facility ${infrastructure.nearestFacilityName || 'facility'} at ${infrastructure.nearestFacilityDistanceMeters}m (${infrastructure.capacityUtilizationPercent}% capacity)`,
      source: 'Ward Infrastructure Baseline Profile [BASELINE CONTEXT]',
      provenance: 'CALCULATED'
    },
    {
      factor: 'Population Impact',
      score: priority.populationImpact,
      weightPercent: 20,
      contribution: parseFloat((priority.populationImpact * 0.20).toFixed(1)),
      evidence: `${affectedPop.toLocaleString()} area population with density ${(demographics.populationDensityPerSqKm ?? demographics.populationDensity ?? 12000).toLocaleString()}/km²`,
      source: 'Municipal Demographic Profile [BASELINE CONTEXT]',
      provenance: 'CALCULATED'
    },
    {
      factor: 'Vulnerable Population',
      score: priority.vulnerabilityScore,
      weightPercent: 15,
      contribution: parseFloat((priority.vulnerabilityScore * 0.15).toFixed(1)),
      evidence: demographics.vulnerabilityIndex !== undefined
        ? `Vulnerability Index ${priority.vulnerabilityScore}/100 across ${(demographics.vulnerablePopulation ?? 0).toLocaleString()} vulnerable residents (${((demographics.vulnerableGroupRatio ?? 0.245) * 100).toFixed(1)}% demographic ratio)`
        : `${((demographics.vulnerableGroupRatio ?? 0.25) * 100).toFixed(1)}% vulnerable group ratio (${(demographics.vulnerablePopulation ?? 0).toLocaleString()} residents)`,
      source: 'Ward Socio-Demographic Context [BASELINE CONTEXT]',
      provenance: 'CALCULATED'
    },
    {
      factor: 'Investment Gap',
      score: priority.investmentGap,
      weightPercent: 15,
      contribution: parseFloat((priority.investmentGap * 0.15).toFixed(1)),
      evidence: `Unfunded gap of ₹${gapLakhs.toLocaleString()} Lakhs (${investment.unaddressedRequestsCount ?? 0} historical unaddressed requests)`,
      source: 'Municipal Capital Budget Profile [BASELINE CONTEXT]',
      provenance: 'CALCULATED'
    }
  ];

  // 6. Traceable evidence chain
  const evidenceChain: TraceableEvidenceStep[] = [
    {
      id: `step-1-${cfg.category.toLowerCase()}`,
      stepNumber: 1,
      stepName: 'Citizen Signals',
      title: `${demandInput.requestCount} Citizen Signals [OBSERVED]`,
      detail: `Reported across ${signalChannels.join(', ')} with ${demandInput.velocityPerHour.toFixed(1)} req/hr velocity and ${Math.round((demandInput.surgeMultiplier ?? 1.0) * 100 - 100)}% surge rate.`,
      sourceId: 'signal-intake-stream',
      classification: 'OBSERVED'
    },
    {
      id: `step-2-${cfg.category.toLowerCase()}`,
      stepNumber: 2,
      stepName: 'Demand Hotspot',
      title: activeIncident?.title || `${cfg.label} Hotspot Cluster`,
      detail: `Spatial cluster in ${activeIncident?.ward || cfg.ward} with demand intensity score of ${priority.demandScore}/100.`,
      sourceId: 'spatial-cluster-engine',
      classification: 'OBSERVED'
    },
    {
      id: `step-3-${cfg.category.toLowerCase()}`,
      stepNumber: 3,
      stepName: 'Infrastructure Deficit',
      title: `${infrastructure.nearestFacilityName || 'Public Asset'} Deficit`,
      detail: `Nearest facility at ${infrastructure.nearestFacilityDistanceMeters}m with ${infrastructure.capacityUtilizationPercent}% utilization. Deficit score ${gap.infrastructureDeficitScore}/25.`,
      sourceId: 'ward-infrastructure-baseline',
      classification: 'BASELINE CONTEXT'
    },
    {
      id: `step-4-${cfg.category.toLowerCase()}`,
      stepNumber: 4,
      stepName: 'Priority Score',
      title: `Deterministic Priority: ${priority.priorityScore}/100 (${priority.priorityLevel})`,
      detail: `5-factor weighted calculation: Demand (${(priority.demandScore * 0.25).toFixed(1)} pts), Deficit (${(priority.infrastructureGap * 0.25).toFixed(1)} pts), Pop (${(priority.populationImpact * 0.2).toFixed(1)} pts), Vuln (${(priority.vulnerabilityScore * 0.15).toFixed(1)} pts), Cap (${(priority.investmentGap * 0.15).toFixed(1)} pts).`,
      sourceId: 'developmentPriorityEngine',
      classification: 'CALCULATED'
    },
    {
      id: `step-5-${cfg.category.toLowerCase()}`,
      stepNumber: 5,
      stepName: 'Recommended Intervention',
      title: recommendation.title,
      detail: `${recommendation.recommendedIntervention} (Estimated capex ₹${gapLakhs} Lakhs, Led by ${recommendation.primaryDepartment || 'PWD'}).`,
      sourceId: 'developmentProjectRecommendationEngine',
      classification: 'RECOMMENDED'
    },
    {
      id: `step-6-${cfg.category.toLowerCase()}`,
      stepNumber: 6,
      stepName: 'Projected Impact',
      title: `Impact Score: ${impact.impactScore}/100`,
      detail: `Projected +${impact.change.infrastructureIndexImprovement} infra index gain, ${Math.abs(impact.change.averageTravelDistanceReductionPercent)}% travel distance reduction, and ${Math.abs(impact.change.demandPressureReductionPercent)} pt drop in recurring demand pressure.`,
      sourceId: 'developmentImpactEngine',
      classification: 'PROJECTED'
    }
  ];

  // 7. Plain-language answer
  const plainLanguageWhy = `NagarBodh recommends ${recommendation.recommendedIntervention} in ${activeIncident?.ward || cfg.ward} because citizen demand pressure (${demandScore}/100 across ${demandInput.requestCount} citizen signals [OBSERVED]) critically outpaces existing infrastructure (capacity at ${infrastructure.capacityUtilizationPercent}%). Deterministic scoring ranks this as a ${status} (Priority ${priority.priorityScore}/100) projected to deliver a +${impact.change.infrastructureIndexImprovement} point infrastructure index improvement and a ${Math.abs(impact.change.demandPressureReductionPercent)} point drop in recurring demand pressure.`;

  return {
    gapId: `gap-${cfg.category.toLowerCase()}`,
    category: cfg.category,
    categoryLabel: cfg.label,
    district: cfg.district,
    ward: activeIncident?.ward || cfg.ward,
    incidentId: activeIncident?.id,
    plainLanguageWhy,
    problemSignal: {
      requestCount: demandInput.requestCount,
      signalChannels,
      velocityPerHour: demandInput.velocityPerHour,
      surgeMultiplier: demandInput.surgeMultiplier ?? 1.0,
      locationName: activeIncident?.location?.name || activeIncident?.locationName || cfg.ward,
      ward: activeIncident?.ward || cfg.ward,
      representativeSignals,
      provenance: 'OBSERVED'
    },
    infrastructureContext: {
      infrastructureIndex: infraIndex,
      infrastructureDeficitScore: gap.infrastructureDeficitScore,
      nearestFacilityName: infrastructure.nearestFacilityName || 'Municipal Facility',
      nearestFacilityDistanceMeters: infrastructure.nearestFacilityDistanceMeters || 1200,
      capacityUtilizationPercent: infrastructure.capacityUtilizationPercent || 80,
      criticalAssetsNearby: (infrastructure.criticalAssetsNearby || ['Transit corridor', 'District substation']).map(a => typeof a === 'string' ? a : (a as any).name || 'Public Asset'),
      provenance: 'BASELINE CONTEXT'
    },
    affectedPopulation: {
      totalEstimate: affectedPop,
      vulnerableEstimate: demographics.vulnerablePopulation || Math.round(affectedPop * (demographics.vulnerableGroupRatio ?? 0.245)),
      vulnerabilityRatio: demographics.vulnerableGroupRatio ?? 0.245,
      vulnerabilityScore: priority.vulnerabilityScore,
      primaryLivelihoodZone: demographics.primaryLivelihoodZone || 'Commercial & Mixed Residential',
      sourceContext: 'Municipal Demographic Census & District Socio-Economic Profile [BASELINE CONTEXT]',
      provenance: 'BASELINE CONTEXT'
    },
    priorityCalculation: {
      overallScore: priority.priorityScore,
      priorityLevel: priority.priorityLevel,
      formulaExplanation: 'Deterministic 5-factor weighted scoring: 25% Citizen Demand + 25% Infrastructure Deficit + 20% Population Impact + 15% Vulnerability + 15% Investment Gap',
      factors,
      provenance: 'CALCULATED'
    },
    capitalRequirement: {
      recommendedProjectTitle: recommendation.title,
      estimatedCostLakhs: gapLakhs,
      interventionCategory: cfg.label,
      recommendedIntervention: recommendation.recommendedIntervention || cfg.defaultNeed,
      primaryDepartment: recommendation.primaryDepartment || 'Department of Public Works',
      supportingDepartments: recommendation.supportingDepartments || ['Municipal Corporation', 'Planning Board'],
      implementationConsiderations: recommendation.implementationConsiderations || [
        'Detailed Project Report (DPR) preparation',
        'Inter-agency capital clearance and municipal sanction'
      ],
      provenance: 'RECOMMENDED'
    },
    projectedOutcome: {
      impactScore: impact.impactScore,
      infrastructureIndexGain: impact.change.infrastructureIndexImprovement,
      travelDistanceReductionPercent: impact.change.averageTravelDistanceReductionPercent,
      demandPressureDrop: impact.change.demandPressureReductionPercent,
      serviceAccessGain: impact.change.serviceAccessImprovement,
      scenarioMode: 'SIMULATION',
      provenance: 'PROJECTED'
    },
    evidenceChain
  };
}

