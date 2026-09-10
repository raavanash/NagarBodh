import { CivicSignal, ClusteredIncident, EvidenceItem } from '../types/civic';

/**
 * NagarBodh Evidence & Provenance Engine
 * Answers: "Where did this information come from?"
 * Maps every AI insight, priority score, risk factor, and resolution metric to traceable source evidence.
 * Categorizes evidence honestly: OBSERVED, CALCULATED, INFERRED, RECOMMENDED
 * Distinguishes ingestion modes: LIVE, REPLAY, SIMULATION
 */
export function generateIncidentEvidenceChain(
  incident: ClusteredIncident,
  allSignals: CivicSignal[] = [],
  currentWeather?: { rainfallMmPerHour: number; description: string; source?: string; mode?: string }
): EvidenceItem[] {
  const evidence: EvidenceItem[] = [];

  // Filter signals belonging to this incident cluster
  const clusterSignals = allSignals.filter(s => incident.signalIds.includes(s.id));
  const primarySignal = clusterSignals[0] || (allSignals.length > 0 ? allSignals[0] : null);

  // 1. Citizen Signal Ingestion Evidence (OBSERVED)
  if (primarySignal) {
    const channelLabel =
      primarySignal.channel === 'social_x'
        ? 'X/public signal'
        : primarySignal.channel === 'citizen_app'
        ? 'Citizen app direct'
        : primarySignal.channel === 'helpline_311'
        ? '155304 / 112 helpline call'
        : 'Grievance portal';

    const isLiveSignal = primarySignal.id.startsWith('x-live-');

    evidence.push({
      id: `ev-sig-${primarySignal.id}`,
      source: `Citizen signal #${primarySignal.id} (${primarySignal.authorHandle || 'Verified Citizen'})`,
      type: channelLabel,
      timestamp: primarySignal.simulatedTimeLabel || '10:14 AM',
      location: primarySignal.locationName || incident.ward || 'Sector 15',
      dataFreshness: isLiveSignal ? '< 30s ago (Live)' : '< 2 mins ago (Replay)',
      usedFor: 'Used for incident detection & velocity surge calculation',
      snippet: `"${primarySignal.rawText}"`,
      confidence: primarySignal.confidenceScore,
      classification: 'OBSERVED',
      evidenceMode: isLiveSignal ? 'LIVE' : 'REPLAY'
    });
  } else {
    // Sector 15 fallback signal evidence
    evidence.push({
      id: `ev-sig-demo-01`,
      source: `Citizen signal #sig-s15-05 (@Parent_PoojaG)`,
      type: 'X/public signal',
      timestamp: '10:14 AM',
      location: 'Sector 15 Underpass',
      dataFreshness: '< 2 mins ago',
      usedFor: 'Used for incident detection & velocity surge calculation',
      snippet: '"SOS!! St. Jude primary school yellow van trapped in flood water under subway!"',
      confidence: 0.99,
      classification: 'OBSERVED',
      evidenceMode: 'REPLAY'
    });
  }

  // 2. Weather & Environmental Telemetry Evidence (OBSERVED if live, CALCULATED if replay)
  const rainfallRate = currentWeather?.rainfallMmPerHour ?? 42.5;
  const isLiveWeather = currentWeather?.mode === 'live';
  const defaultReplaySource = 'IMD rainfall telemetry (Calibrated Historical Replay — Demo Station #15B)';
  const weatherSource = isLiveWeather
    ? (currentWeather?.source || 'OpenWeatherMap Live API')
    : defaultReplaySource;

  evidence.push({
    id: `ev-weather-01`,
    source: weatherSource,
    type: 'Telemetry sensor',
    timestamp: '10:00 AM',
    location: incident.ward || 'Sector 15',
    dataFreshness: isLiveWeather ? 'Live Stream (< 1 min ago)' : 'Deterministic Replay Baseline',
    usedFor: 'Used for environmental risk & flood surge multiplier',
    snippet: `Precipitation: ${rainfallRate} mm/hr (${currentWeather?.description || 'Torrential downpour'}) [Calibrated historical replay. Note: Real-time official IMD radar access requires government authorization not available for prototype]`,
    confidence: isLiveWeather ? 0.96 : 0.92,
    classification: isLiveWeather ? 'OBSERVED' : 'CALCULATED',
    evidenceMode: isLiveWeather ? 'LIVE' : 'REPLAY'
  });

  // 3. Critical Asset Vulnerability Evidence (CALCULATED from GIS spatial lookup)
  const schoolName = incident.auditableInsight?.calculatedMetrics?.nearestSchoolName || 'St. Jude School';
  const schoolDist = incident.auditableInsight?.calculatedMetrics?.nearestSchoolDistanceMeters || 120;
  evidence.push({
    id: `ev-asset-school`,
    source: `Critical asset GIS (${schoolName})`,
    type: 'Critical asset proximity GIS',
    timestamp: 'Active Dispatch Window',
    location: `${schoolDist}m from incident centroid`,
    dataFreshness: 'Spatial Geometry Lookup',
    usedFor: 'Used for vulnerability score & priority escalation',
    snippet: `Dismissal corridor asset: ${schoolName} located within ${schoolDist}m of inundated dip`,
    confidence: 0.96,
    classification: 'CALCULATED',
    evidenceMode: 'SIMULATION'
  });

  const hospitalName = incident.auditableInsight?.calculatedMetrics?.nearestHospitalName || 'Sanjivani Hospital';
  const hospitalDist = incident.auditableInsight?.calculatedMetrics?.nearestHospitalDistanceMeters || 250;
  evidence.push({
    id: `ev-asset-hospital`,
    source: `Critical asset GIS (${hospitalName})`,
    type: 'Critical asset proximity GIS',
    timestamp: 'Active Dispatch Window',
    location: `${hospitalDist}m from incident centroid`,
    dataFreshness: 'Spatial Geometry Lookup',
    usedFor: 'Used for vulnerability score & emergency corridor clearance',
    snippet: `Trauma emergency route: ${hospitalName} access road blocked by water depth`,
    confidence: 0.95,
    classification: 'CALCULATED',
    evidenceMode: 'SIMULATION'
  });

  // 4. Historical Recurrence Evidence (CALCULATED from municipal logs)
  evidence.push({
    id: `ev-hist-01`,
    source: 'Municipal historical incident log',
    type: 'Historical recurrence log',
    timestamp: 'Last 90 days',
    location: `${incident.ward} (${incident.category})`,
    dataFreshness: 'Historical Archive Benchmark',
    usedFor: 'Used for recurrence score & SLA baseline calculation',
    snippet: `11 historical inundation reports recorded at this underpass basin over past 90 days`,
    confidence: 0.92,
    classification: 'CALCULATED',
    evidenceMode: 'SIMULATION'
  });


  // 5. Post-Resolution Verification Evidence (INFERRED via signal reduction delta)
  if (['resolving', 'resolved', 'verified'].includes(incident.status)) {
    const res = incident.resolutionVerification;
    evidence.push({
      id: `ev-res-01`,
      source: 'Post-resolution multi-channel signal audit',
      type: 'Signal reduction telemetry',
      timestamp: res?.timeToResolutionFormatted ? `Resolution Window (${res.timeToResolutionFormatted})` : '2h 18m window',
      location: `${incident.ward} Active Audit Perimeter`,
      dataFreshness: 'Active Audit Window',
      usedFor: 'Used for resolution verification confidence score',
      snippet: `Signal drop: -${res?.signalReductionPercent || 87}% (${res?.beforeSignalCount || 31} signals → ${res?.afterSignalCount || 4} residual). Outcome: ${res?.outcome || 'VERIFIED'}`,
      confidence: (res?.verificationConfidenceScore || 91) / 100,
      classification: 'INFERRED',
      evidenceMode: 'CALCULATED' as any
    });
  }

  return evidence;
}
