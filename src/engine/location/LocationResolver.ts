import type { CanonicalLocation, ResolutionStatus } from '../../types/location';

export class LocationResolver {
  /**
   * Generates a stable canonical geographic identifier:
   * Format: "IN/{state}/{district}/{subDistrict-or-ward}"
   * Example: "IN/Delhi/Central-Delhi/Ward-14"
   */
  public static generateCanonicalLocationId(loc: {
    countryCode?: string;
    state?: string;
    district?: string;
    subDistrict?: string;
    ward?: string;
    locationName?: string;
  }): string {
    const cc = (loc.countryCode || 'IN').toUpperCase();
    const cleanSegment = (str?: string) =>
      (str || 'unspecified')
        .trim()
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-');

    const state = cleanSegment(loc.state || 'Delhi');
    const district = cleanSegment(loc.district || 'Central-Delhi');
    const localUnit = cleanSegment(loc.subDistrict || loc.ward || loc.locationName || 'General');

    return `${cc}/${state}/${district}/${localUnit}`;
  }

  /**
   * Geohash calculation utility (Base32 7-character string)
   */
  public static calculateGeohash(lat: number, lng: number, precision = 7): string {
    const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
    let isEven = true;
    let latMin = -90.0, latMax = 90.0;
    let lngMin = -180.0, lngMax = 180.0;
    let bit = 0;
    let ch = 0;
    let geohash = '';

    while (geohash.length < precision) {
      if (isEven) {
        const lngMid = (lngMin + lngMax) / 2;
        if (lng >= lngMid) {
          ch |= (1 << (4 - bit));
          lngMin = lngMid;
        } else {
          lngMax = lngMid;
        }
      } else {
        const latMid = (latMin + latMax) / 2;
        if (lat >= latMid) {
          ch |= (1 << (4 - bit));
          latMin = latMid;
        } else {
          latMax = latMid;
        }
      }

      isEven = !isEven;
      if (bit < 4) {
        bit++;
      } else {
        geohash += BASE32[ch];
        bit = 0;
        ch = 0;
      }
    }

    return geohash;
  }

  /**
   * Main entry point to resolve a canonical location from raw text and optional payload fields.
   */
  public static resolveLocation(
    rawText: string,
    payload?: {
      lat?: number | string | null;
      lng?: number | string | null;
      latitude?: number | string | null;
      longitude?: number | string | null;
      coordinates?: { lat: number; lng: number };
      ward?: string;
      locationName?: string;
      location?: string;
      district?: string;
      state?: string;
      country?: string;
      countryCode?: string;
      pincode?: string;
    }
  ): CanonicalLocation {
    const text = rawText.toLowerCase();

    // Default administrative hierarchy
    let countryCode = payload?.countryCode || 'IN';
    let country = payload?.country || 'India';
    let state = payload?.state || 'Delhi NCR';
    let district = payload?.district || 'Central Delhi';
    let subDistrict: string | undefined = payload?.ward || undefined;
    let ward: string | undefined = payload?.ward || undefined;
    let locationName = payload?.locationName || payload?.location || '';
    let pincode = payload?.pincode || undefined;

    // Detect known multi-state regions in India
    if (text.includes('karol bagh') || text.includes('करोल बाग')) {
      state = 'Delhi NCR';
      district = 'Central Delhi';
      ward = 'Ward 14 - Karol Bagh';
      subDistrict = 'Karol Bagh Zone';
      locationName = locationName || 'Karol Bagh';
    } else if (text.includes('mayur vihar') || text.includes('मयूर विहार')) {
      state = 'Delhi NCR';
      district = 'East Delhi';
      ward = 'Ward 22 - Mayur Vihar';
      subDistrict = 'Mayur Vihar Sub-zone';
      locationName = locationName || 'Mayur Vihar Phase 1';
    } else if (text.includes('rohini') || text.includes('रोहिणी')) {
      state = 'Delhi NCR';
      district = 'North West Delhi';
      ward = 'Ward 12 - Rohini Sector 7';
      subDistrict = 'Rohini Zone';
      locationName = locationName || 'Rohini Sector 7';
    } else if (text.includes('noida') || text.includes('नोएडा')) {
      state = 'Uttar Pradesh';
      district = 'Gautam Buddha Nagar';
      subDistrict = 'Noida Sector Zone';
      locationName = locationName || 'Noida Sector 62';
    } else if (text.includes('lucknow') || text.includes('लखनऊ') || text.includes('hazratganj')) {
      state = 'Uttar Pradesh';
      district = 'Lucknow';
      subDistrict = 'Hazratganj Zone';
      locationName = locationName || 'Hazratganj Lucknow';
    } else if (text.includes('gurgaon') || text.includes('gurugram') || text.includes('गुड़गांव')) {
      state = 'Haryana';
      district = 'Gurugram';
      subDistrict = 'DLF Phase Zone';
      locationName = locationName || 'Gurugram Cyber City';
    } else if (text.includes('mumbai') || text.includes('andheri') || text.includes('bandra')) {
      state = 'Maharashtra';
      district = 'Mumbai Suburban';
      subDistrict = text.includes('bandra') ? 'Bandra West' : 'Andheri East';
      locationName = locationName || (text.includes('bandra') ? 'Bandra Mumbai' : 'Andheri Mumbai');
    } else if (text.includes('bengaluru') || text.includes('bangalore') || text.includes('whitefield') || text.includes('koramangala')) {
      state = 'Karnataka';
      district = 'Bengaluru Urban';
      subDistrict = text.includes('whitefield') ? 'Whitefield Zone' : 'Koramangala Zone';
      locationName = locationName || (text.includes('whitefield') ? 'Whitefield Bengaluru' : 'Koramangala Bengaluru');
    } else if (text.includes('chennai') || text.includes('velachery') || text.includes('t. nagar')) {
      state = 'Tamil Nadu';
      district = 'Chennai';
      subDistrict = 'T. Nagar Zone';
      locationName = locationName || 'Chennai T. Nagar';
    } else if (text.includes('patna') || text.includes('kankerbagh')) {
      state = 'Bihar';
      district = 'Patna';
      subDistrict = 'Kankerbagh Zone';
      locationName = locationName || 'Kankerbagh Patna';
    }

    if (!locationName) {
      locationName = ward || subDistrict || `${district}, ${state}`;
    }

    // Latitude & Longitude validation
    let lat: number | null = null;
    let lng: number | null = null;

    const valLat = payload?.lat ?? payload?.latitude ?? payload?.coordinates?.lat;
    const valLng = payload?.lng ?? payload?.longitude ?? payload?.coordinates?.lng;

    const parsedLat = valLat !== undefined && valLat !== null ? parseFloat(String(valLat)) : NaN;
    const parsedLng = valLng !== undefined && valLng !== null ? parseFloat(String(valLng)) : NaN;

    const isValidLat = !isNaN(parsedLat) && parsedLat >= 8.0 && parsedLat <= 37.0;
    const isValidLng = !isNaN(parsedLng) && parsedLng >= 68.0 && parsedLng <= 97.0;

    if (isValidLat && isValidLng) {
      lat = parseFloat(parsedLat.toFixed(5));
      lng = parseFloat(parsedLng.toFixed(5));
    }

    // Resolution Confidence Calculation
    let locationConfidence = 0.40;
    let resolutionStatus: ResolutionStatus = 'uncertain';

    const hasValidCoords = lat !== null && lng !== null;
    const hasSpecificWard = Boolean(ward || subDistrict);
    const hasKnownLandmark = locationName && locationName !== 'Unspecified Landmark' && !locationName.includes('Central Delhi');

    if (hasValidCoords && hasSpecificWard) {
      locationConfidence = 1.0;
      resolutionStatus = 'exact';
    } else if (hasValidCoords || (hasSpecificWard && hasKnownLandmark)) {
      locationConfidence = 0.85;
      resolutionStatus = 'approximate';
    } else if (district && state) {
      locationConfidence = 0.65;
      resolutionStatus = 'district_level';
    } else {
      locationConfidence = 0.40;
      resolutionStatus = 'uncertain';
    }

    // Geohash computation
    const geohash = hasValidCoords ? this.calculateGeohash(lat!, lng!) : undefined;

    // Stable Canonical Identifier
    const id = this.generateCanonicalLocationId({
      countryCode,
      state,
      district,
      subDistrict,
      ward,
      locationName,
    });

    return {
      id,
      countryCode,
      country,
      state,
      district,
      subDistrict,
      ward,
      pincode,
      latitude: lat,
      longitude: lng,
      geohash,
      locationName,
      locationConfidence,
      resolutionStatus,
    };
  }
}
