import { CivicSignal, CriticalAsset, PriorityBreakdown, SeverityLevel } from '../types/civic';
import { calculateHaversineDistance } from './contextAgent';

export interface PriorityCalculationParams {
  signals: CivicSignal[];
  velocityPerHour: number;
  velocitySurgePercent?: number;
  firstSignalTime?: string;
  latestSignalTime?: string;
  wardName?: string;
  category?: string;
  populationDensityPerSqKm?: number;
  nearestAsset?: {
    asset: CriticalAsset | null;
    distanceMeters: number | null;
  };
  nearbyAssets?: Array<{ asset: CriticalAsset; distanceMeters: number }>;
  rainfallMmPerHour?: number;
  elevationMeters?: number;
  drainageBottleneckPercent?: number;
  historical30dCount?: number;
  slaBaselineHours?: number;
}

export function calculateDeterministicPriority(params: PriorityCalculationParams): PriorityBreakdown {
  const {
    signals,
    velocityPerHour,
    velocitySurgePercent = 0,
    firstSignalTime,
    latestSignalTime,
    populationDensityPerSqKm = 18400,
    nearestAsset,
    nearbyAssets = [],
    rainfallMmPerHour = 0,
    elevationMeters = 205,
    drainageBottleneckPercent = 30,
    historical30dCount = 3,
    slaBaselineHours = 2.5
  } = params;

  const nowMs = latestSignalTime ? new Date(latestSignalTime).getTime() : Date.now();
  const firstMs = firstSignalTime ? new Date(firstSignalTime).getTime() : nowMs - 45 * 60 * 1000;
  const unresolvedDurationHours = Math.max(0.1, Number(((nowMs - firstMs) / (1000 * 60 * 60)).toFixed(1)));

  // 1. SEVERITY SCORE (0 - 25)
  // Evaluates reported severity levels, sentiment urgency, and verbatim keyword severity
  let severityScore = 0;
  const criticalCount = signals.filter(s => s.reportedSeverity === 'critical').length;
  const highCount = signals.filter(s => s.reportedSeverity === 'high').length;
  const mediumCount = signals.filter(s => s.reportedSeverity === 'medium').length;

  if (criticalCount > 0) {
    severityScore = Math.min(25, 18 + criticalCount * 2 + highCount);
  } else if (highCount > 0) {
    severityScore = Math.min(20, 12 + highCount * 1.8 + mediumCount * 0.5);
  } else if (mediumCount > 0) {
    severityScore = Math.min(14, 7 + mediumCount * 1.2);
  } else {
    severityScore = 5;
  }

  // Verbatim keyword hazard check
  const hasSubmergedOrTrapped = signals.some(s =>
    /submerged|trapped|4 foot|skidding|short circuit|overflow|crater/i.test(s.rawText)
  );
  if (hasSubmergedOrTrapped && severityScore < 25) {
    severityScore = Math.min(25, severityScore + 3);
  }

  // 2. VELOCITY SCORE (0 - 25)
  // Evaluates arrival velocity, surge acceleration %, and multi-channel source diversity
  let velocityScore = 0;
  if (velocityPerHour >= 15) velocityScore = 15;
  else if (velocityPerHour >= 8) velocityScore = 12;
  else if (velocityPerHour >= 4) velocityScore = 8;
  else if (velocityPerHour >= 2) velocityScore = 5;
  else velocityScore = 2;

  // Velocity acceleration surge bonus
  if (velocitySurgePercent >= 200) velocityScore += 5;
  else if (velocitySurgePercent >= 100) velocityScore += 3;
  else if (velocitySurgePercent >= 50) velocityScore += 2;

  // Source channel diversity bonus (multi-channel corroboration)
  const distinctChannels = new Set(signals.map(s => s.channel)).size;
  if (distinctChannels >= 3) velocityScore += 5;
  else if (distinctChannels === 2) velocityScore += 3;

  velocityScore = Math.min(25, velocityScore);

  // 3. POPULATION IMPACT SCORE (0 - 20)
  // Evaluates ward population density + estimated commuters/students affected
  let populationImpactScore = 0;

  // Base density factor (Karol Bagh 24.5k = 8, Rohini 16.8k = 5)
  const densityFactor = Math.min(8, Math.round(populationDensityPerSqKm / 3000));
  populationImpactScore += densityFactor;

  // Affected volume multiplier (schools/metro hubs/bus depots in vicinity)
  const hasHighFootfallAsset = nearbyAssets.some(a =>
    a.asset.type === 'metro' || a.asset.capacity?.includes('Footfall') || a.asset.capacity?.includes('Students')
  );
  if (hasHighFootfallAsset) {
    populationImpactScore += 7;
  } else {
    populationImpactScore += 3;
  }

  // Multi-report accumulation bonus
  populationImpactScore += Math.min(5, Math.round(signals.length * 0.8));
  populationImpactScore = Math.min(20, populationImpactScore);

  // 4. CRITICAL ASSET EXPOSURE SCORE (0 - 15)
  // Evaluates proximity to schools, hospitals, metro stations, pumping stations
  let criticalAssetExposureScore = 0;
  const schoolAssets = nearbyAssets.filter(a => a.asset.type === 'school');
  const hospitalAssets = nearbyAssets.filter(a => a.asset.type === 'hospital');
  const metroAssets = nearbyAssets.filter(a => a.asset.type === 'metro' || a.asset.type === 'pumping_station');

  if (hospitalAssets.some(a => a.distanceMeters <= 400)) {
    criticalAssetExposureScore += 7; // Trauma response route threat
  }
  if (schoolAssets.some(a => a.distanceMeters <= 300)) {
    criticalAssetExposureScore += 5; // Active morning student dispersal threat
  }
  if (metroAssets.some(a => a.distanceMeters <= 300)) {
    criticalAssetExposureScore += 3; // Transit corridor disruption
  }

  if (criticalAssetExposureScore === 0 && nearestAsset?.distanceMeters && nearestAsset.distanceMeters <= 500) {
    criticalAssetExposureScore = 4;
  }
  criticalAssetExposureScore = Math.min(15, Math.max(1, criticalAssetExposureScore));

  // 5. ENVIRONMENTAL RISK SCORE (0 - 10)
  // Evaluates precipitation rate (mm/hr) + low-lying elevation / drain bottleneck
  let environmentalRiskScore = 0;
  if (rainfallMmPerHour >= 50) environmentalRiskScore += 6;
  else if (rainfallMmPerHour >= 25) environmentalRiskScore += 4;
  else if (rainfallMmPerHour >= 10) environmentalRiskScore += 2;
  else if (rainfallMmPerHour > 0) environmentalRiskScore += 1;

  if (elevationMeters < 200 || drainageBottleneckPercent >= 70) {
    environmentalRiskScore += 4; // Low-lying topography depression
  }
  environmentalRiskScore = Math.min(10, environmentalRiskScore);

  // 6. SLA & RECURRENCE SCORE (0 - 10)
  // Evaluates 30-day historical recurrence count + unresolved duration & SLA risk
  let slaRecurrenceScore = 0;

  // Historical recurrence (max 4 pts)
  slaRecurrenceScore += Math.min(4, Math.round(historical30dCount * 0.8));

  // Unresolved duration (max 3 pts)
  if (unresolvedDurationHours >= 2.0) slaRecurrenceScore += 3;
  else if (unresolvedDurationHours >= 1.0) slaRecurrenceScore += 2;

  // SLA breach risk % (current age / target SLA)
  const slaRiskPercent = (unresolvedDurationHours / slaBaselineHours) * 100;
  if (slaRiskPercent >= 75) slaRecurrenceScore += 3;
  else if (slaRiskPercent >= 40) slaRecurrenceScore += 1;

  slaRecurrenceScore = Math.min(10, slaRecurrenceScore);

  // DETERMINISTIC TOTAL SUM (0 - 100)
  const overallScore = Math.min(
    100,
    Math.max(
      0,
      severityScore +
        velocityScore +
        populationImpactScore +
        criticalAssetExposureScore +
        environmentalRiskScore +
        slaRecurrenceScore
    )
  );

  let level: SeverityLevel = 'low';
  if (overallScore >= 80) level = 'critical';
  else if (overallScore >= 60) level = 'high';
  else if (overallScore >= 35) level = 'medium';
  else level = 'low';

  // GENERATE "WHY THIS INCIDENT IS PRIORITIZED" EVIDENCE BULLETS & LINKS
  const whyPrioritizedBullets: PriorityBreakdown['whyPrioritizedBullets'] = [];

  // Top signal quote evidence link
  const topSignal = signals.find(s => s.reportedSeverity === 'critical') || signals[0];
  if (topSignal) {
    whyPrioritizedBullets.push({
      reasonText: `High citizen severity reported (${topSignal.reportedSeverity.toUpperCase()}) across ${signals.length} verified reports.`,
      evidenceLink: {
        id: `link-sig-${topSignal.id}`,
        label: `Signal Quote (${topSignal.channel.replace('_', ' ')})`,
        type: 'signal',
        targetId: topSignal.id,
        snippet: `"${topSignal.rawText.slice(0, 75)}..."`
      }
    });
  }

  // Velocity surge evidence link
  if (velocitySurgePercent > 0 || velocityPerHour >= 5) {
    whyPrioritizedBullets.push({
      reasonText: `Accelerating report velocity (+${velocitySurgePercent}% surge/hr across ${distinctChannels} channels).`,
      evidenceLink: {
        id: 'link-velocity-surge',
        label: `Velocity Telemetry (+${velocitySurgePercent}%/hr)`,
        type: 'signal',
        snippet: `${velocityPerHour} reports/hr across ${distinctChannels} channel sources`
      }
    });
  }

  // Critical asset evidence link
  const nearestSchool = schoolAssets[0];
  const nearestHosp = hospitalAssets[0];
  if (nearestSchool) {
    whyPrioritizedBullets.push({
      reasonText: `Active school vulnerability zone (${nearestSchool.asset.name}, ${nearestSchool.distanceMeters}m distance).`,
      evidenceLink: {
        id: `link-asset-${nearestSchool.asset.id}`,
        label: `${nearestSchool.asset.name} (${nearestSchool.distanceMeters}m)`,
        type: 'asset',
        targetId: nearestSchool.asset.id,
        snippet: `Vulnerability Buffer: ${nearestSchool.asset.vulnerabilityBufferMeters}m • ${nearestSchool.asset.capacity || ''}`
      }
    });
  } else if (nearestHosp) {
    whyPrioritizedBullets.push({
      reasonText: `Emergency healthcare access threat (${nearestHosp.asset.name}, ${nearestHosp.distanceMeters}m distance).`,
      evidenceLink: {
        id: `link-asset-${nearestHosp.asset.id}`,
        label: `${nearestHosp.asset.name} (${nearestHosp.distanceMeters}m)`,
        type: 'asset',
        targetId: nearestHosp.asset.id,
        snippet: `ER Unit Access Corridor • ${nearestHosp.asset.capacity || ''}`
      }
    });
  }

  // Environmental radar link
  if (rainfallMmPerHour > 0) {
    whyPrioritizedBullets.push({
      reasonText: `Monsoonal precipitation telemetry (${rainfallMmPerHour} mm/hr heavy downpour).`,
      evidenceLink: {
        id: 'link-weather-radar',
        label: `IMD Radar Telemetry (${rainfallMmPerHour} mm/hr)`,
        type: 'weather',
        snippet: `Rainfall rate: ${rainfallMmPerHour} mm/hr • Flood multiplier active`
      }
    });
  }

  // SLA & Recurrence link
  whyPrioritizedBullets.push({
    reasonText: `Ward historical recurrence (${historical30dCount} events in 30 days, ${unresolvedDurationHours}h unresolved).`,
    evidenceLink: {
      id: 'link-ward-sla',
      label: `Historical Ward SLA (${unresolvedDurationHours}h age)`,
      type: 'sla',
      snippet: `SLA baseline: ${slaBaselineHours}h • 30-day recurrence count: ${historical30dCount}`
    }
  });

  const formulaExplanation = `Deterministic Formula: Priority (100) = Severity (${severityScore}/25) + Velocity (${velocityScore}/25) + Population Impact (${populationImpactScore}/20) + Critical Asset Exposure (${criticalAssetExposureScore}/15) + Environmental Risk (${environmentalRiskScore}/10) + SLA/Recurrence (${slaRecurrenceScore}/10) = ${overallScore}/100`;

  return {
    overallScore,
    level,
    factors: {
      severityScore,
      velocityScore,
      populationImpactScore,
      criticalAssetExposureScore,
      environmentalRiskScore,
      slaRecurrenceScore
    },
    whyPrioritizedBullets,
    formulaExplanation
  };
}
