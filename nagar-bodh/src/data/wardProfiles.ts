import { CivicCategory } from '../types/civic';

export interface WardSOPProfile {
  rootCause?: string;
  targetLocation?: string;
  etaMinutes?: number;
  primaryDepartment?: string;
  secondaryDepartments?: string[];
  recommendedActions?: string[];
}

export const WARD_SOP_PROFILES: Partial<Record<string, Partial<Record<CivicCategory, WardSOPProfile>>>> = {
  'Ward 15 - Central Sub-city': {
    waterlogging: {
      rootCause:
        'Monsoon cloudburst coupled with storm trunk drain #4 pump failure and localized debris choking at underpass siphon basin.',
      targetLocation: 'Sector 15 Underpass & Subway Incline (near St. Jude School)',
      etaMinutes: 18,
      primaryDepartment: 'MCD Drainage & Flood Control Division (Zone East)',
      secondaryDepartments: ['Delhi Traffic Police & Civil Defence Quick Response Unit'],
      recommendedActions: [
        'Deploy 2x high-capacity 100 HP mobile diesel-driven dewatering pump trailers to Underpass Incline.',
        'Immediate physical cordon of subway entry ramps: Divert traffic via Outer Ring Road flyover.',
        'Inspect Stormwater Trunk Pumping Station #4 circuit breakers and clear inlet debris grate.',
        'Establish 30-meter sandbag safety barrier along Sanjivani Hospital emergency approach ramp.',
        'Send automated SMS advisory to St. Jude Primary School transport coordinator and local RWA desks.'
      ]
    },
    drainage: {
      rootCause:
        'Storm trunk drain overflow at Sector 15 junction caused by debris accumulation and undersized culvert capacity.',
      targetLocation: 'Sector 15 Stormwater Drain Network (Trunk Line #4)',
      etaMinutes: 20,
      primaryDepartment: 'MCD Drainage & Dewatering Wing',
      secondaryDepartments: ['Delhi Jal Board Emergency Response']
    }
  }
};

export function getWardSOPProfile(
  wardName: string,
  category: CivicCategory
): WardSOPProfile | undefined {
  return WARD_SOP_PROFILES[wardName]?.[category];
}
