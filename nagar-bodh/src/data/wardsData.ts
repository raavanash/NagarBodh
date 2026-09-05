import { WardMetric } from '../types/civic';

/**
 * Historical baseline data per ward.
 * NOTE: activeIncidentsCount and criticalIncidentsCount have been removed.
 * They are now computed dynamically from the live incidents[] array in CivicContext.
 * avgResolutionTimeHours and slaCompliancePercent are historical baselines only.
 */
export const WARDS_DATA: WardMetric[] = [
  {
    wardId: 'ward-15',
    wardName: 'Ward 15 - Sector 15 / Mayur Enclave',
    avgResolutionTimeHours: 2.1,
    slaCompliancePercent: 88,
    populationDensityPerSqKm: 18400,
    primaryZone: 'East / Trans-River Zone'
  },
  {
    wardId: 'ward-14',
    wardName: 'Ward 14 - Karol Bagh Commercial',
    avgResolutionTimeHours: 3.8,
    slaCompliancePercent: 92,
    populationDensityPerSqKm: 24500,
    primaryZone: 'Central Zone'
  },
  {
    wardId: 'ward-22',
    wardName: 'Ward 22 - Connaught Place & Ring Road',
    avgResolutionTimeHours: 1.5,
    slaCompliancePercent: 97,
    populationDensityPerSqKm: 12000,
    primaryZone: 'New Delhi VIP Zone'
  },
  {
    wardId: 'ward-09',
    wardName: 'Ward 09 - Rohini Sector 7 Residential',
    avgResolutionTimeHours: 4.2,
    slaCompliancePercent: 84,
    populationDensityPerSqKm: 16800,
    primaryZone: 'North West Zone'
  }
];
// CITY_WEATHER_ALERTS removed — use currentStep.weatherCondition from CivicContext instead.

