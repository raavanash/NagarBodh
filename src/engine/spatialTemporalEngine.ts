import { calculateHaversineDistance } from './contextAgent';

/**
 * Calculates weighted or mean centroid of lat/lng coordinates.
 */
export function calculateCentroid(
  coords: Array<{ lat: number; lng: number }>
): { lat: number; lng: number } {
  if (coords.length === 0) return { lat: 0, lng: 0 };
  const sumLat = coords.reduce((acc, c) => acc + c.lat, 0);
  const sumLng = coords.reduce((acc, c) => acc + c.lng, 0);
  return {
    lat: parseFloat((sumLat / coords.length).toFixed(6)),
    lng: parseFloat((sumLng / coords.length).toFixed(6))
  };
}

/**
 * Calculates cluster radius in meters from centroid to furthest signal (bounded [50m, 600m]).
 */
export function calculateClusterRadius(
  centroid: { lat: number; lng: number },
  coords: Array<{ lat: number; lng: number }>
): number {
  if (coords.length === 0) return 50;
  let maxDist = 50; // minimum radius display
  for (const c of coords) {
    const dist = calculateHaversineDistance(centroid, c);
    if (dist > maxDist) maxDist = dist;
  }
  return Math.min(600, Math.round(maxDist));
}

/**
 * Calculates signal velocity (reports per hour) over total duration or sliding window.
 */
export function calculateSignalVelocity(timestamps: string[]): {
  velocityPerHour: number;
  firstTime: string;
  latestTime: string;
  durationHours: number;
} {
  if (timestamps.length === 0) {
    const now = new Date().toISOString();
    return { velocityPerHour: 0, firstTime: now, latestTime: now, durationHours: 0 };
  }

  const sorted = [...timestamps].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );
  const firstTime = sorted[0];
  const latestTime = sorted[sorted.length - 1];

  const durationMs = new Date(latestTime).getTime() - new Date(firstTime).getTime();
  const durationHours = Math.max(0.5, durationMs / (1000 * 60 * 60)); // minimum 30 min baseline
  const velocityPerHour = parseFloat((timestamps.length / durationHours).toFixed(1));

  return {
    velocityPerHour,
    firstTime,
    latestTime,
    durationHours
  };
}

/**
 * Detects velocity surge percentage compared to previous velocity or baseline (2.0/hr).
 */
export function calculateVelocitySurge(
  currentVelocity: number,
  previousVelocity?: number,
  baselineVelocity: number = 2.0
): number {
  const reference = previousVelocity && previousVelocity > 0 ? previousVelocity : baselineVelocity;
  if (currentVelocity <= reference) return 0;
  return Math.round(((currentVelocity - reference) / reference) * 100);
}

/**
 * Checks temporal proximity between two timestamp strings.
 */
export function checkTemporalProximity(
  timeA: string,
  timeB: string,
  windowMinutes: number = 90
): boolean {
  const diffMs = Math.abs(new Date(timeA).getTime() - new Date(timeB).getTime());
  return diffMs / (1000 * 60) <= windowMinutes;
}
