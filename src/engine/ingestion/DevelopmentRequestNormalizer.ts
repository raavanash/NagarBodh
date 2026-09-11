import {
  CanonicalDevelopmentCategory,
  DevelopmentRequest,
  DevelopmentRequestChannel,
  DevelopmentRequestEvidence,
  DevelopmentRequestLocation,
  DevelopmentRequestMode,
  DevelopmentUrgency
} from '../../types/development';
import { RawSignalPayload } from '../../types/ingestion';
import { parseCivicSignalText } from '../nlpParser';

const HINDI_REGEX = /[\u0900-\u097F]/;
const HINGLISH_REGEX = /\b(paani|pani|bhar|gaya|rasta|sadak|sadke|gaddha|gaddhe|kachra|nala|naala|bijli|aspatal|bache|bachhe|gaadi|gadi|bahut|bohot|hai|hain|nahi|karo|bhejo|bachao|batti|yahan|hamare|samagri)\b/i;

/**
 * Normalizes multi-channel, multilingual citizen payloads into canonical DevelopmentRequest objects.
 */
export class DevelopmentRequestNormalizer {
  /**
   * Detect language (Hindi Devanagari, Hinglish, or English/Other)
   */
  public static detectLanguage(text: string): string {
    if (HINDI_REGEX.test(text)) return 'hi';
    if (HINGLISH_REGEX.test(text)) return 'hinglish';
    return 'en';
  }

  /**
   * Map raw channel strings to canonical DevelopmentRequestChannel
   */
  public static normalizeChannel(rawChannel?: string): DevelopmentRequestChannel {
    if (!rawChannel) return 'TEXT';
    const upper = rawChannel.toUpperCase();
    if (upper === 'TEXT' || upper === 'VOICE' || upper === 'MESSAGING' || upper === 'SOCIAL' || upper === 'GOVERNMENT_PORTAL' || upper === 'REPLAY') {
      return upper as DevelopmentRequestChannel;
    }
    const lower = rawChannel.toLowerCase();
    if (lower.includes('voice') || lower.includes('speech') || lower.includes('audio') || lower.includes('call')) return 'VOICE';
    if (lower.includes('bluesky') || lower.includes('bsky') || lower.includes('social') || lower.includes('twitter') || lower === 'x') return 'SOCIAL';
    if (lower.includes('whatsapp') || lower.includes('telegram') || lower.includes('msg') || lower.includes('messag') || lower.includes('chat')) return 'MESSAGING';
    if (lower.includes('grievance') || lower.includes('portal') || lower.includes('govt') || lower.includes('311') || lower.includes('helpline')) return 'GOVERNMENT_PORTAL';
    if (lower.includes('replay')) return 'REPLAY';
    return 'TEXT';
  }

  /**
   * Map keywords & category inputs to canonical CanonicalDevelopmentCategory
   */
  public static normalizeCategory(rawCategory?: string, text?: string): CanonicalDevelopmentCategory {
    const combined = `${rawCategory || ''} ${text || ''}`.toLowerCase();

    const HEALTHCARE_KW = ['health', 'hospital', 'doctor', 'clinic', 'dispensary', 'ambulance', 'medicine', 'aspatal', 'अस्पताल', 'दवा', 'इलाज'];
    const EDUCATION_KW = ['education', 'school', 'college', 'teacher', 'classroom', 'desk', 'bache', 'bachhe', 'padhai', 'स्कूल', 'शिक्षा', 'किताब', 'छात्र'];
    const WATER_KW = ['water', 'waterlogging', 'flooding', 'pani', 'paani', 'pipeline', 'drinking water', 'supply', 'dewatering', 'पानी', 'जलभराव', 'जल', 'पेयजल'];
    const SANITATION_KW = ['sanitation', 'garbage', 'trash', 'waste', 'dump', 'sewer', 'sewage', 'drain', 'drainage', 'nala', 'naala', 'kachra', 'कचरा', 'सफाई', 'गटर', 'कूड़ा'];
    const TRANSPORT_KW = ['transport', 'bus', 'metro', 'transit', 'auto', 'rickshaw', 'route', 'passengers', 'बस', 'मेट्रो', 'यातायात', 'परिवहन'];
    const ROADS_KW = ['road', 'roads', 'pothole', 'potholes', 'gaddha', 'gaddhe', 'bridge', 'flyover', 'highway', 'sadak', 'सड़क', 'गड्ढा', 'पुल'];
    const ELECTRICITY_KW = ['electricity', 'power', 'transformer', 'wire', 'cable', 'outage', 'street light', 'light', 'bijli', 'bijlee', 'बिजली', 'लाइट', 'तार'];
    const DIGITAL_KW = ['digital', 'internet', 'broadband', 'wifi', 'optical fiber', 'tower', 'network', 'connectivity', 'इंटरनेट', 'टावर', 'डिजिटल'];
    const SAFETY_KW = ['safety', 'police', 'crime', 'light', 'surveillance', 'cctv', 'security', 'women safety', 'सुरक्षा', 'पुलिस', 'अपराध'];
    const HOUSING_KW = ['housing', 'house', 'slum', 'shelter', 'quarter', 'makan', 'मकान', 'आवास', 'बस्ती'];

    if (HEALTHCARE_KW.some(k => combined.includes(k))) return 'HEALTHCARE';
    if (EDUCATION_KW.some(k => combined.includes(k))) return 'EDUCATION';
    if (WATER_KW.some(k => combined.includes(k))) return 'WATER';
    if (SANITATION_KW.some(k => combined.includes(k))) return 'SANITATION';
    if (TRANSPORT_KW.some(k => combined.includes(k))) return 'TRANSPORT';
    if (ROADS_KW.some(k => combined.includes(k))) return 'ROADS';
    if (ELECTRICITY_KW.some(k => combined.includes(k))) return 'ELECTRICITY';
    if (DIGITAL_KW.some(k => combined.includes(k))) return 'DIGITAL_CONNECTIVITY';
    if (SAFETY_KW.some(k => combined.includes(k))) return 'PUBLIC_SAFETY';
    if (HOUSING_KW.some(k => combined.includes(k))) return 'HOUSING';

    return 'OTHER';
  }

  /**
   * Parse structured location without fabricating missing coordinates
   */
  public static normalizeLocation(payload: RawSignalPayload, text: string): DevelopmentRequestLocation {
    const lowerText = text.toLowerCase();

    // Default geographical container
    let state = 'Delhi NCR';
    let district = 'Central Delhi';
    let subDistrict: string | undefined = payload.ward || undefined;
    let locationName = payload.locationName || payload.location;

    // Check known NCR / Indian regions
    if (lowerText.includes('karol bagh') || lowerText.includes('करोल बाग')) {
      district = 'Central Delhi';
      subDistrict = 'Ward 14 - Karol Bagh';
      locationName = locationName || 'Karol Bagh';
    } else if (lowerText.includes('mayur vihar') || lowerText.includes('मयूर विहार')) {
      district = 'East Delhi';
      subDistrict = 'Ward 22 - Mayur Vihar';
      locationName = locationName || 'Mayur Vihar Phase 1';
    } else if (lowerText.includes('noida') || lowerText.includes('नोएडा')) {
      state = 'Uttar Pradesh';
      district = 'Gautam Buddha Nagar';
      subDistrict = 'Noida Sector';
      locationName = locationName || 'Noida';
    } else if (lowerText.includes('gurgaon') || lowerText.includes('gurugram') || lowerText.includes('गुड़गांव')) {
      state = 'Haryana';
      district = 'Gurugram';
      subDistrict = 'Gurugram Sub-region';
      locationName = locationName || 'Gurugram';
    } else if (lowerText.includes('ghaziabad') || lowerText.includes('गाजियाबाद')) {
      state = 'Uttar Pradesh';
      district = 'Ghaziabad';
      subDistrict = 'Ghaziabad Sector';
      locationName = locationName || 'Ghaziabad';
    }

    // Latitude / Longitude: Preserve if explicitly provided, else null (Zero Fabrication)
    let lat: number | null = null;
    let lng: number | null = null;

    const valLat = payload.lat ?? payload.latitude ?? payload.coordinates?.lat;
    const valLng = payload.lng ?? payload.longitude ?? payload.coordinates?.lng;

    const rawLat = valLat !== undefined && valLat !== null ? parseFloat(String(valLat)) : NaN;
    const rawLng = valLng !== undefined && valLng !== null ? parseFloat(String(valLng)) : NaN;

    if (!isNaN(rawLat) && !isNaN(rawLng) && rawLat >= 8.0 && rawLat <= 37.0 && rawLng >= 68.0 && rawLng <= 97.0) {
      lat = parseFloat(rawLat.toFixed(5));
      lng = parseFloat(rawLng.toFixed(5));
    }

    return {
      country: 'India',
      state,
      district,
      subDistrict,
      latitude: lat,
      longitude: lng,
      locationName: locationName || 'Unspecified Landmark'
    };
  }

  /**
   * Main entry point to normalize any raw payload into a canonical DevelopmentRequest
   */
  public static normalizeToDevelopmentRequest(
    payload: RawSignalPayload,
    sourceProviderId = 'provider-citizen-direct',
    mode: DevelopmentRequestMode = 'LIVE'
  ): DevelopmentRequest {
    const rawText = (payload.rawText || payload.text || payload.body || payload.message || '').trim();

    const language = this.detectLanguage(rawText);
    const sourceChannel = this.normalizeChannel(payload.sourceChannel || payload.channel);
    const category = this.normalizeCategory(payload.category, rawText);
    const location = this.normalizeLocation(payload, rawText);

    // Extract NLP metadata
    const parsedNLP = parseCivicSignalText(rawText);

    // Compute demand intensity (0.0 to 1.0)
    let demandIntensity = 0.5;
    if (parsedNLP.reportedSeverity === 'critical') demandIntensity = 0.95;
    else if (parsedNLP.reportedSeverity === 'high') demandIntensity = 0.80;
    else if (parsedNLP.reportedSeverity === 'medium') demandIntensity = 0.60;

    // Urgency level
    let urgency: DevelopmentUrgency = 'standard';
    if (parsedNLP.reportedSeverity === 'critical') urgency = 'critical';
    else if (parsedNLP.reportedSeverity === 'high') urgency = 'urgent';
    else if (parsedNLP.reportedSeverity === 'medium') urgency = 'high';

    // 4-Tier Evidence Classification
    const evidence: DevelopmentRequestEvidence[] = [
      {
        classification: 'OBSERVED',
        snippet: rawText.slice(0, 140),
        source: `${sourceChannel} Citizen Report (${payload.authorHandle || payload.author || '@Citizen'})`,
        confidence: 1.0
      },
      {
        classification: 'INFERRED',
        snippet: `Extracted development need for ${category} in ${location.locationName || location.district}.`,
        source: 'Multilingual AI Intent Classifier',
        confidence: parsedNLP.confidenceScore
      },
      {
        classification: 'CALCULATED',
        snippet: `Demand intensity computed at ${(demandIntensity * 100).toFixed(0)}% (Urgency: ${urgency.toUpperCase()}).`,
        source: 'Development Gap Engine',
        confidence: 0.90
      },
      {
        classification: 'RECOMMENDED',
        snippet: `Flagged for policy review under ${category} development priorities in ${location.state}.`,
        source: 'Project Recommendation Engine',
        confidence: 0.85
      }
    ];

    const timestamp = payload.timestamp || payload.createdAt || new Date().toISOString();

    return {
      id: payload.id && payload.id.startsWith('dev-req-')
        ? payload.id
        : `dev-req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      rawText,
      language,
      sourceChannel,
      source: sourceProviderId,
      mode,
      timestamp,
      location,
      category,
      subcategory: payload.subcategory || category.toLowerCase(),
      extractedEntities: parsedNLP.keyEntities && parsedNLP.keyEntities.length > 0 ? parsedNLP.keyEntities : [location.locationName || 'Local Region'],
      demandIntensity,
      affectedPopulation: payload.affectedPopulation || 1500,
      urgency,
      vulnerableGroups: payload.vulnerableGroups || ['local_commuters', 'residents'],
      evidence,
      confidence: parsedNLP.confidenceScore || 0.88,
      status: 'pending'
    };
  }
}
