import { CriticalAsset } from '../types/civic';
import { CRITICAL_ASSETS } from '../data/criticalAssets';

/**
 * Calculates great-circle distance between two geographic coordinates in meters
 */
export function calculateHaversineDistance(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (coord1.lat * Math.PI) / 180;
  const phi2 = (coord2.lat * Math.PI) / 180;
  const deltaPhi = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const deltaLambda = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export interface ProximityAnalysisResult {
  nearestAsset: {
    asset: CriticalAsset | null;
    distanceMeters: number | null;
  };
  nearestSchool: {
    asset: CriticalAsset | null;
    distanceMeters: number | null;
  };
  nearestHospital: {
    asset: CriticalAsset | null;
    distanceMeters: number | null;
  };
  allNearbyAssetsWithin500m: Array<{
    asset: CriticalAsset;
    distanceMeters: number;
    withinRiskBuffer: boolean;
  }>;
}

export function analyzeSpatialContext(centroid: { lat: number; lng: number }): ProximityAnalysisResult {
  let nearestAsset: CriticalAsset | null = null;
  let minAssetDist: number = Infinity;

  let nearestSchool: CriticalAsset | null = null;
  let minSchoolDist: number = Infinity;

  let nearestHospital: CriticalAsset | null = null;
  let minHospitalDist: number = Infinity;

  const nearby: Array<{ asset: CriticalAsset; distanceMeters: number; withinRiskBuffer: boolean }> = [];

  for (const asset of CRITICAL_ASSETS) {
    const dist = calculateHaversineDistance(centroid, asset.coordinates);

    if (dist < minAssetDist) {
      minAssetDist = dist;
      nearestAsset = asset;
    }

    if (asset.type === 'school' && dist < minSchoolDist) {
      minSchoolDist = dist;
      nearestSchool = asset;
    }

    if (asset.type === 'hospital' && dist < minHospitalDist) {
      minHospitalDist = dist;
      nearestHospital = asset;
    }

    if (dist <= 600) {
      nearby.push({
        asset,
        distanceMeters: dist,
        withinRiskBuffer: dist <= asset.vulnerabilityBufferMeters
      });
    }
  }

  return {
    nearestAsset: {
      asset: nearestAsset,
      distanceMeters: minAssetDist === Infinity ? null : minAssetDist
    },
    nearestSchool: {
      asset: nearestSchool,
      distanceMeters: minSchoolDist === Infinity ? null : minSchoolDist
    },
    nearestHospital: {
      asset: nearestHospital,
      distanceMeters: minHospitalDist === Infinity ? null : minHospitalDist
    },
    allNearbyAssetsWithin500m: nearby.sort((a, b) => a.distanceMeters - b.distanceMeters)
  };
}
