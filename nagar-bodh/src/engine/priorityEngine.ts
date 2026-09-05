import { CivicSignal, CriticalAsset, PriorityBreakdown, SeverityLevel } from '../types/civic';

export interface PriorityCalculationParams {
  signals: CivicSignal[];
  velocityPerHour: number;
  nearestAsset: {
    asset: CriticalAsset | null;
    distanceMeters: number | null;
  };
  rainfallMmPerHour: number;
  historicalIncidentCount?: number;
}

export function calculateDeterministicPriority(params: PriorityCalculationParams): PriorityBreakdown {
  const { signals, velocityPerHour, nearestAsset, rainfallMmPerHour, historicalIncidentCount = 2 } = params;

  // 1. Base Severity Score (0 - 25)
  // Evaluates highest reported severity and proportion of critical/high signals
  let severityScore = 0;
  const criticalCount = signals.filter(s => s.reportedSeverity === 'critical').length;
  const highCount = signals.filter(s => s.reportedSeverity === 'high').length;
  const mediumCount = signals.filter(s => s.reportedSeverity === 'medium').length;

  if (criticalCount > 0) {
    severityScore = Math.min(25, 18 + criticalCount * 2 + highCount);
  } else if (highCount > 0) {
    severityScore = Math.min(18, 12 + highCount * 1.5 + mediumCount * 0.5);
  } else if (mediumCount > 0) {
    severityScore = Math.min(12, 6 + mediumCount);
  } else {
    severityScore = 4;
  }

  // 2. Velocity / Growth Score (0 - 25)
  // Higher frequency of signals per hour indicates an accelerating emergency
  let velocityScore = 0;
  if (velocityPerHour >= 15) {
    velocityScore = 25; // Massive surge (>15 signals/hr)
  } else if (velocityPerHour >= 8) {
    velocityScore = 20;
  } else if (velocityPerHour >= 4) {
    velocityScore = 14;
  } else if (velocityPerHour >= 2) {
    velocityScore = 8;
  } else {
    velocityScore = 3;
  }

  // 3. Critical Asset Vulnerability Proximity Score (0 - 25)
  // Proximity to active schools, hospitals, or transit interchanges multiplies impact
  let assetVulnerabilityScore = 0;
  if (nearestAsset.asset && nearestAsset.distanceMeters !== null) {
    const dist = nearestAsset.distanceMeters;
    if (dist <= 150) {
      // Immediate impact zone (e.g. 120m from school)
      assetVulnerabilityScore = nearestAsset.asset.type === 'school' || nearestAsset.asset.type === 'hospital' ? 25 : 20;
    } else if (dist <= 300) {
      assetVulnerabilityScore = 18;
    } else if (dist <= 500) {
      assetVulnerabilityScore = 12;
    } else if (dist <= 1000) {
      assetVulnerabilityScore = 6;
    } else {
      assetVulnerabilityScore = 2;
    }
  } else {
    assetVulnerabilityScore = 2;
  }

  // 4. Weather Risk Multiplier Score (0 - 15)
  let weatherRiskScore = 0;
  if (rainfallMmPerHour >= 40) {
    weatherRiskScore = 15; // Extreme torrential runoff
  } else if (rainfallMmPerHour >= 25) {
    weatherRiskScore = 11;
  } else if (rainfallMmPerHour >= 15) {
    weatherRiskScore = 7;
  } else if (rainfallMmPerHour >= 5) {
    weatherRiskScore = 4;
  } else {
    weatherRiskScore = 1;
  }

  // 5. Historical Recurrence / SLA Risk Score (0 - 10)
  const historicalRecurrenceScore = Math.min(10, historicalIncidentCount * 3);

  // Overall Score Calculation (Clamped 0 - 100)
  const rawSum = severityScore + velocityScore + assetVulnerabilityScore + weatherRiskScore + historicalRecurrenceScore;
  const overallScore = Math.min(100, Math.max(0, Math.round(rawSum)));

  let level: SeverityLevel = 'low';
  if (overallScore >= 80) {
    level = 'critical';
  } else if (overallScore >= 60) {
    level = 'high';
  } else if (overallScore >= 35) {
    level = 'medium';
  } else {
    level = 'low';
  }

  const formulaExplanation = `Formula: Priority = min(100, Severity(${severityScore}/25) + Velocity(${velocityScore}/25) + AssetProximity(${assetVulnerabilityScore}/25) + Weather(${weatherRiskScore}/15) + Recurrence(${historicalRecurrenceScore}/10)) = ${overallScore}/100`;

  return {
    overallScore,
    level,
    factors: {
      severityScore,
      velocityScore,
      assetVulnerabilityScore,
      weatherRiskScore,
      historicalRecurrenceScore
    },
    formulaExplanation
  };
}
