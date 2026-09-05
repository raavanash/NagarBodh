import { CivicCategory, DetectedLanguage, SeverityLevel, SignalChannel } from '../../types/civic';
import { IngestedCivicSignal, NormalizationResult, ProviderType, RawSignalPayload, SourceMetadata } from '../../types/ingestion';
import { parseCivicSignalText } from '../nlpParser';

// Delhi NCR Spatial Bounds
const DELHI_BOUNDS = {
  minLat: 28.3,
  maxLat: 29.1,
  minLng: 76.8,
  maxLng: 77.6,
  defaultLat: 28.5835,
  defaultLng: 77.3185
};

const HINDI_REGEX = /[\u0900-\u097F]/;
const HINGLISH_REGEX = /\b(paani|pani|bhar|gaya|doob|rasta|sadak|sadke|gaddha|gaddhe|kachra|nala|naala|phans|bache|bachhe|gaadi|gadi|pura|poora|bahut|bohot|hai|hain|nahi|karo|bhejo|bachao|bijli)\b/i;

const CIVIC_RELEVANCE_KEYWORDS = [
  'water', 'waterlogging', 'flooding', 'flood', 'submerged', 'paani', 'pani', 'subway',
  'underpass', 'knee-deep', 'waist-deep', 'drain', 'drainage', 'gutter', 'sewer', 'sewage',
  'clogged', 'blocked', 'nala', 'naala', 'pothole', 'potholes', 'crater', 'manhole', 'broken road',
  'sinkhole', 'gaddha', 'gaddhe', 'garbage', 'trash', 'waste', 'dump', 'smell', 'kachra', 'malba',
  'traffic', 'jam', 'gridlock', 'bottleneck', 'signals', 'signal', 'sparking', 'transformer',
  'wire', 'cable', 'bijli', 'करंट', 'पानी', 'डूबा', 'गड्ढा', 'कचरा', 'जाम', 'बिजली'
];

/**
 * Normalizes heterogeneous raw input payloads into standardized IngestedCivicSignal objects.
 */
export class SignalNormalizer {
  /**
   * Simple hash generator for deduplication & fingerprinting
   */
  public static generateFingerprintHash(text: string, lat: number, lng: number): string {
    const sanitizedText = text.toLowerCase().replace(/[^a-z0-9]/gi, '').slice(0, 100);
    const roundedLat = lat.toFixed(3);
    const roundedLng = lng.toFixed(3);
    const str = `${sanitizedText}:${roundedLat}:${roundedLng}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `fp-${Math.abs(hash).toString(36)}`;
  }

  /**
   * Detect language (Hindi Devanagari, Hinglish code-mixed, or English)
   */
  public static detectLanguage(text: string): DetectedLanguage {
    if (HINDI_REGEX.test(text)) return 'hi';
    if (HINGLISH_REGEX.test(text)) return 'hinglish';
    return 'en';
  }

  /**
   * Validate and parse lat/lng coordinates
   */
  public static normalizeCoordinates(rawLat?: any, rawLng?: any, fallbackCoords?: { lat: number; lng: number }): { lat: number; lng: number } {
    let lat = parseFloat(rawLat);
    let lng = parseFloat(rawLng);

    if (isNaN(lat) || isNaN(lng) || lat < DELHI_BOUNDS.minLat || lat > DELHI_BOUNDS.maxLat || lng < DELHI_BOUNDS.minLng || lng > DELHI_BOUNDS.maxLng) {
      if (fallbackCoords && !isNaN(fallbackCoords.lat) && !isNaN(fallbackCoords.lng)) {
        return fallbackCoords;
      }
      return { lat: DELHI_BOUNDS.defaultLat, lng: DELHI_BOUNDS.defaultLng };
    }

    return { lat: parseFloat(lat.toFixed(5)), lng: parseFloat(lng.toFixed(5)) };
  }

  /**
   * Convert various timestamp representations into an ISO 8601 string & simulated time label
   */
  public static normalizeTimestamp(rawTime?: string): { isoTimestamp: string; timeLabel: string } {
    let date = new Date();
    if (rawTime) {
      const parsed = new Date(rawTime);
      if (!isNaN(parsed.getTime())) {
        date = parsed;
      }
    }

    const isoTimestamp = date.toISOString();
    const timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return { isoTimestamp, timeLabel };
  }

  /**
   * Check if payload text contains civic infrastructure keywords
   */
  public static isCivicRelevant(text: string): boolean {
    if (!text || text.trim().length < 5) return false;
    const lower = text.toLowerCase();
    return CIVIC_RELEVANCE_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()));
  }

  /**
   * Main normalization function
   */
  public static normalize(
    payload: RawSignalPayload,
    providerId: string,
    providerType: ProviderType,
    isMockOrReplay = false
  ): NormalizationResult {
    const rawText = (payload.rawText || payload.text || payload.body || payload.message || '').trim();

    if (!rawText) {
      return { success: false, error: 'Empty signal payload text.' };
    }

    const isRelevant = this.isCivicRelevant(rawText);
    if (!isRelevant) {
      return {
        success: false,
        error: 'Non-civic noise signal rejected.',
        isCivicRelevant: false
      };
    }

    // Coordinates normalization
    const coords = this.normalizeCoordinates(
      payload.lat || payload.latitude || payload.coordinates?.lat,
      payload.lng || payload.longitude || payload.coordinates?.lng
    );

    // Timestamp normalization
    const { isoTimestamp, timeLabel } = this.normalizeTimestamp(payload.timestamp || payload.createdAt || payload.time);

    // Channel mapping
    let channel: SignalChannel = 'citizen_app';
    const rawChannel = (payload.sourceChannel || payload.channel || 'citizen_app').toString().toLowerCase();
    if (rawChannel.includes('x') || rawChannel.includes('social')) channel = 'social_x';
    else if (rawChannel.includes('grievance') || rawChannel.includes('portal') || rawChannel.includes('govt')) channel = 'grievance_portal';
    else if (rawChannel.includes('311') || rawChannel.includes('helpline')) channel = 'helpline_311';

    // Parse NLP metadata
    const parsedNLP = parseCivicSignalText(rawText);

    const fingerprintHash = this.generateFingerprintHash(rawText, coords.lat, coords.lng);

    const sourceMetadata: SourceMetadata = {
      providerId,
      providerType,
      rawChannel,
      originalId: payload.id,
      ingestedAt: new Date().toISOString(),
      fingerprintHash,
      isMockOrReplay
    };

    const signal: IngestedCivicSignal = {
      id: payload.id && payload.id.startsWith('sig-') ? payload.id : `sig-${providerType}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: isoTimestamp,
      simulatedTimeLabel: payload.simulatedTimeLabel || timeLabel,
      channel,
      rawText,
      detectedLanguage: parsedNLP.detectedLanguage,
      englishTranslation: parsedNLP.englishTranslation,
      category: (payload.category as CivicCategory) || parsedNLP.category,
      reportedSeverity: (payload.severity as SeverityLevel) || parsedNLP.reportedSeverity,
      confidenceScore: payload.confidenceScore || parsedNLP.confidenceScore,
      coordinates: coords,
      locationName: payload.locationName || payload.location || parsedNLP.extractedLocationName || 'Reported Field Location',
      ward: payload.ward || 'Ward 15 - Central Sub-city',
      authorHandle: payload.authorHandle || payload.author || '@CitizenReporter',
      upvotes: payload.upvotes || 1,
      imageUrl: payload.imageUrl || payload.mediaUrl,
      sentiment: parsedNLP.sentiment,
      keyEntities: parsedNLP.keyEntities,
      sourceMetadata,
      isCivicRelevant: true
    };

    return {
      success: true,
      signal,
      isCivicRelevant: true
    };
  }
}
