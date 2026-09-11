import {
  CanonicalDevelopmentCategory,
  DevelopmentContext,
  DevelopmentDemandHotspot,
  DevelopmentGap,
  DevelopmentPriority,
  DevelopmentRequest,
  DevelopmentRequestChannel,
  DevelopmentRequestEvidence
} from '../types/development';

import { DevelopmentContextDataLayer } from './context/DevelopmentContextDataLayer';
import { calculateDevelopmentGap } from './developmentGapEngine';
import { calculateDemandScore, calculateDevelopmentPriority } from './developmentPriorityEngine';
import { generateProjectRecommendation } from './projectRecommendationEngine';

const GEOGRAPHIC_DISTANCE_THRESHOLD_KM = 2.5; // ~2.5 km radius for regional development demand clusters

/**
 * Calculates Haversine distance between two lat/lng coordinates in kilometers.
 */
function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Maps DevelopmentRequest categories to descriptive Hotspot Titles using objective demand language.
 */
function generateHotspotTitle(category: string, locationName: string): string {
  const loc = locationName || 'Regional Sector';
  switch (category.toUpperCase()) {
    case 'HEALTHCARE':
      return `Development Hotspot: Healthcare Access & Primary Clinic Demand (${loc})`;
    case 'EDUCATION':
      return `Development Hotspot: School Infrastructure & Learning Facility Gap (${loc})`;
    case 'WATER':
      return `Development Hotspot: Clean Drinking Water & Drainage Supply Deficit (${loc})`;
    case 'SANITATION':
      return `Development Hotspot: Sanitation & Waste Management Need (${loc})`;
    case 'TRANSPORT':
      return `Development Hotspot: Public Transit & Transport Corridor Deficit (${loc})`;
    case 'ROADS':
      return `Development Hotspot: Road Safety & Infrastructure Modernization Need (${loc})`;
    case 'ELECTRICITY':
      return `Development Hotspot: Substation Reliability & Grid Expansion Need (${loc})`;
    case 'DIGITAL_CONNECTIVITY':
      return `Development Hotspot: Digital Public Infrastructure & Broadband Connectivity Gap (${loc})`;
    case 'PUBLIC_SAFETY':
      return `Development Hotspot: Street Lighting & Public Safety Coverage Deficit (${loc})`;
    case 'HOUSING':
      return `Development Hotspot: Housing Upgrade & Shelter Infrastructure Need (${loc})`;
    default:
      return `Development Hotspot: ${category} Need in ${loc}`;
  }
}

/**
 * Clusters canonical DevelopmentRequest objects into DevelopmentDemandHotspot abstractions
 * using spatial proximity, sector categorization, and multi-channel aggregation.
 */
export async function clusterDevelopmentRequests(
  requests: DevelopmentRequest[],
  contextDataLayer: DevelopmentContextDataLayer = new DevelopmentContextDataLayer('sample')
): Promise<DevelopmentDemandHotspot[]> {
  if (requests.length === 0) return [];

  // 1. Group requests by category
  const categoryGroups = new Map<string, DevelopmentRequest[]>();
  for (const req of requests) {
    const catKey = (req.category || 'OTHER').toUpperCase();
    if (!categoryGroups.has(catKey)) {
      categoryGroups.set(catKey, []);
    }
    categoryGroups.get(catKey)!.push(req);
  }

  const hotspots: DevelopmentDemandHotspot[] = [];

  // 2. Process spatial clusters within each category group
  for (const [catKey, catRequests] of categoryGroups.entries()) {
    const spatialClusters: DevelopmentRequest[][] = [];

    for (const req of catRequests) {
      let matchedCluster: DevelopmentRequest[] | null = null;

      for (const cluster of spatialClusters) {
        const leader = cluster[0];

        // Check if both have explicit lat/lng
        if (
          req.location.latitude != null &&
          req.location.longitude != null &&
          leader.location.latitude != null &&
          leader.location.longitude != null
        ) {
          const distKm = haversineDistanceKm(
            req.location.latitude,
            req.location.longitude,
            leader.location.latitude,
            leader.location.longitude
          );
          if (distKm <= GEOGRAPHIC_DISTANCE_THRESHOLD_KM) {
            matchedCluster = cluster;
            break;
          }
        } else {
          // District / Location name matching fallback
          if (
            req.location.district.toLowerCase() === leader.location.district.toLowerCase() ||
            (req.location.locationName && leader.location.locationName &&
              req.location.locationName.toLowerCase() === leader.location.locationName.toLowerCase())
          ) {
            matchedCluster = cluster;
            break;
          }
        }
      }

      if (matchedCluster) {
        matchedCluster.push(req);
      } else {
        spatialClusters.push([req]);
      }
    }

    // 3. Assemble DevelopmentDemandHotspot for each spatial cluster
    for (const clusterRequests of spatialClusters) {
      const leader = clusterRequests[0];
      const requestCount = clusterRequests.length;

      // Centroid Calculation
      let latSum = 0;
      let lngSum = 0;
      let validCoordsCount = 0;

      for (const r of clusterRequests) {
        if (r.location.latitude != null && r.location.longitude != null) {
          latSum += r.location.latitude;
          lngSum += r.location.longitude;
          validCoordsCount++;
        }
      }

      const centroidLat = validCoordsCount > 0 ? latSum / validCoordsCount : (leader.location.latitude ?? 28.6139);
      const centroidLng = validCoordsCount > 0 ? lngSum / validCoordsCount : (leader.location.longitude ?? 77.2090);

      // Calculate radius
      let maxDistMeters = 500;
      if (validCoordsCount > 0) {
        for (const r of clusterRequests) {
          if (r.location.latitude != null && r.location.longitude != null) {
            const d = haversineDistanceKm(centroidLat, centroidLng, r.location.latitude, r.location.longitude) * 1000;
            if (d > maxDistMeters) maxDistMeters = d;
          }
        }
      }
      const radiusMeters = Math.min(5000, Math.max(300, Math.round(maxDistMeters)));

      // Collect Languages and Source Channels
      const languages = Array.from(new Set(clusterRequests.map(r => r.language))).filter(Boolean);
      const sourceChannels = Array.from(new Set(clusterRequests.map(r => r.sourceChannel))) as DevelopmentRequestChannel[];

      // Time range & Velocity
      const timestamps = clusterRequests.map(r => new Date(r.timestamp).getTime()).sort((a, b) => a - b);
      const firstRequestTime = new Date(timestamps[0]).toISOString();
      const latestRequestTime = new Date(timestamps[timestamps.length - 1]).toISOString();
      const timeSpanHours = Math.max(1, (timestamps[timestamps.length - 1] - timestamps[0]) / (1000 * 3600));
      const requestVelocity = parseFloat((requestCount / timeSpanHours).toFixed(2));

      // Fetch Development Context for region
      const context: DevelopmentContext = await contextDataLayer.getContextForLocation(
        leader.location.state || 'Delhi NCR',
        leader.location.district || 'Central Delhi',
        leader.location.subDistrict
      );

      // Calculate Demand Score & Gap
      const avgIntensity = clusterRequests.reduce((sum, r) => sum + r.demandIntensity, 0) / requestCount;
      const demandScore = calculateDemandScore({
        requestCount,
        averageIntensity: avgIntensity,
        velocityPerHour: requestVelocity,
        surgeMultiplier: requestCount > 5 ? 1.5 : 1.0,
        channelCount: sourceChannels.length
      });

      const developmentGap: DevelopmentGap = calculateDevelopmentGap(
        catKey.toLowerCase() as any,
        requestCount,
        requestVelocity,
        context.demographic,
        context.infrastructure,
        context.investment
      );

      // Deterministic Priority Score
      const hotspotId = `hotspot-${catKey.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const priorityScore: DevelopmentPriority = calculateDevelopmentPriority(
        hotspotId,
        catKey as CanonicalDevelopmentCategory,
        { requestCount, averageIntensity: avgIntensity, velocityPerHour: requestVelocity, channelCount: sourceChannels.length },
        context.demographic,
        context.infrastructure,
        context.investment
      );

      // Title & Location Labels
      const locationName = leader.location.locationName || leader.location.district || 'Regional Sub-district';
      const title = generateHotspotTitle(catKey, locationName);

      // Evidence Aggregation (preserving citizen wording provenance)
      const evidence: DevelopmentRequestEvidence[] = [];
      clusterRequests.slice(0, 3).forEach((r, idx) => {
        evidence.push({
          classification: 'OBSERVED',
          snippet: `Citizen report #${idx + 1}: "${r.rawText.slice(0, 120)}"`,
          source: `${r.sourceChannel} Channel (${r.language})`,
          confidence: r.confidence
        });
      });
      evidence.push({
        classification: 'CALCULATED',
        snippet: `Citizen demand indicates an unaddressed development need for ${catKey} (Priority Score: ${priorityScore.priorityScore}/100, Level ${priorityScore.priorityLevel}).`,
        source: 'Deterministic Development Priority Engine',
        confidence: 1.0
      });

      // Project Recommendation
      const projectRecommendation = generateProjectRecommendation(
        hotspotId,
        catKey,
        context.demographic.wardName || locationName,
        locationName,
        priorityScore.priorityScore,
        developmentGap,
        context.demographic,
        context.infrastructure,
        context.investment
      );

      hotspots.push({
        id: hotspotId,
        title,
        category: catKey as CanonicalDevelopmentCategory,
        status: 'demand_identified',
        geographicArea: {
          centroid: { lat: centroidLat, lng: centroidLng },
          radiusMeters,
          wardOrDistrict: context.hierarchy.villageOrWard || context.hierarchy.subDistrict || context.hierarchy.district,
          state: context.hierarchy.state
        },
        centroid: { lat: centroidLat, lng: centroidLng },
        radiusMeters,
        ward: context.demographic.wardName || locationName,
        locationName,
        requestCount,
        demandScore,
        affectedPopulation: context.demographic.population || 25000,
        languages: languages.length > 0 ? languages : ['en'],
        sourceChannels: sourceChannels.length > 0 ? sourceChannels : ['TEXT'],
        requestVelocity,
        demandVelocityPerHour: requestVelocity,
        firstRequestTime,
        latestRequestTime,
        signalIds: clusterRequests.map(r => r.id),
        developmentGap,
        priorityScore,
        demographics: context.demographic,
        infrastructure: context.infrastructure,
        investment: context.investment,
        context,
        evidence,
        projectRecommendation
      });
    }
  }

  // Sort hotspots by priority score descending (P1 first)
  return hotspots.sort((a, b) => b.priorityScore.priorityScore - a.priorityScore.priorityScore);
}
