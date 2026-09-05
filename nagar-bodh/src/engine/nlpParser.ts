import { CivicCategory, DetectedLanguage, SeverityLevel } from '../types/civic';
import { SignalAnalystAgent } from './agent/SignalAnalystAgent';
import { AgentTrace } from '../types/agent';

export interface ParsedSignalResult {
  category: CivicCategory;
  detectedLanguage: DetectedLanguage;
  englishTranslation: string;
  reportedSeverity: SeverityLevel;
  confidenceScore: number;
  sentiment: 'negative' | 'urgent' | 'neutral' | 'positive_confirmation';
  keyEntities: string[];
  extractedLocationName?: string;
  agentTrace?: AgentTrace;
}

// Common civic dictionaries for Hindi and Hinglish
const HINDI_DEVANAGARI_REGEX = /[\u0900-\u097F]/;

const HINGLISH_PATTERNS = [
  /\b(paani|pani|bhar|gaya|doob|rasta|sadak|sadke|gaddha|gaddhe|kachra|nala|naala|phans|bache|bachhe|gaadi|gadi|pura|poora|bahut|bohot|hai|hain|nahi|karo|bhejo|bachao|madad|chori|bijli)\b/i
];

const WATERLOGGING_KEYWORDS = [
  'water', 'waterlogging', 'flooding', 'flood', 'submerged', 'paani', 'pani', 'subway',
  'underpass', 'knee-deep', 'waist-deep', 'lake', 'dewatering', 'inundated', 'डूबा', 'जलभराव', 'पानी'
];

const DRAINAGE_KEYWORDS = [
  'drain', 'drainage', 'gutter', 'sewer', 'sewage', 'clogged', 'blocked', 'nala', 'naala',
  'desilted', 'overflow', 'overflowing', 'नाला', 'गटर', 'सीवर', 'सीवरेज'
];

const ROAD_HAZARD_KEYWORDS = [
  'pothole', 'potholes', 'crater', 'manhole', 'broken road', 'cave-in', 'sinkhole', 'gaddha',
  'gaddhe', 'manhole cover', 'गड्ढा', 'मैनहोल', 'सड़क धंस'
];

const GARBAGE_KEYWORDS = [
  'garbage', 'trash', 'waste', 'dump', 'smell', 'kachra', 'malba', 'filth', 'कचरा', 'कूड़ा', 'सफाई'
];

const TRAFFIC_KEYWORDS = [
  'traffic', 'jam', 'gridlock', 'bottleneck', 'signals', 'signal', 'light', 'diversion',
  'जाम', 'ट्रैफिक', 'बत्ती'
];

const ELECTRICITY_KEYWORDS = [
  'sparking', 'transformer', 'wire', 'cable', 'current', 'shock', 'pole', 'streetlight',
  'blackout', 'bijli', 'करंट', 'ट्रांसफार्मर', 'तार', 'बिजली'
];

const CRITICAL_INDICATORS = [
  'sos', 'emergency', 'trapped', 'danger', 'lethal', 'fatal', 'hospital', 'ambulance',
  'children', 'school van', 'school bus', 'sparking', 'submerged', 'floating', '4 feet',
  'life', 'save', 'phans gayi', 'bache', 'emergency ramp', 'जान', 'खतरा', 'फंसे', 'बच्चे'
];

const RESOLUTION_INDICATORS = [
  'cleared', 'receded', 'drained', 'fixed', 'resolved', 'working now', 'clean', 'open now',
  'down by', 'pumps finally active', 'dhanyawad', 'thank you', 'safai ho gayi', 'साफ', 'उतर गया'
];

export function parseCivicSignalText(text: string): ParsedSignalResult {
  const lower = text.toLowerCase();

  // 1. Language Detection
  let detectedLanguage: DetectedLanguage = 'en';
  if (HINDI_DEVANAGARI_REGEX.test(text)) {
    detectedLanguage = 'hi';
  } else if (HINGLISH_PATTERNS.some(regex => regex.test(lower))) {
    detectedLanguage = 'hinglish';
  }

  // 2. Category Classification
  let category: CivicCategory = 'waterlogging'; // default if ambiguous
  let categoryConfidence = 0.85;

  if (WATERLOGGING_KEYWORDS.some(k => lower.includes(k))) {
    category = 'waterlogging';
    categoryConfidence = 0.96;
  } else if (DRAINAGE_KEYWORDS.some(k => lower.includes(k))) {
    category = 'drainage';
    categoryConfidence = 0.94;
  } else if (ROAD_HAZARD_KEYWORDS.some(k => lower.includes(k))) {
    category = 'road_hazard';
    categoryConfidence = 0.95;
  } else if (GARBAGE_KEYWORDS.some(k => lower.includes(k))) {
    category = 'garbage';
    categoryConfidence = 0.93;
  } else if (TRAFFIC_KEYWORDS.some(k => lower.includes(k))) {
    category = 'traffic';
    categoryConfidence = 0.92;
  } else if (ELECTRICITY_KEYWORDS.some(k => lower.includes(k))) {
    category = 'electricity';
    categoryConfidence = 0.95;
  }

  // 3. Sentiment & Urgency Assessment
  const isResolution = RESOLUTION_INDICATORS.some(k => lower.includes(k));
  const isCritical = CRITICAL_INDICATORS.some(k => lower.includes(k));

  let sentiment: 'negative' | 'urgent' | 'neutral' | 'positive_confirmation' = 'negative';
  let reportedSeverity: SeverityLevel = 'medium';

  if (isResolution) {
    sentiment = 'positive_confirmation';
    reportedSeverity = 'low';
  } else if (isCritical) {
    sentiment = 'urgent';
    reportedSeverity = 'critical';
  } else if (lower.includes('heavy') || lower.includes('overflow') || lower.includes('stuck') || lower.includes('halted') || lower.includes('3km')) {
    sentiment = 'urgent';
    reportedSeverity = 'high';
  } else if (lower.includes('starting') || lower.includes('blinking') || lower.includes('light')) {
    sentiment = 'neutral';
    reportedSeverity = 'low';
  }

  // 4. Entity Extraction
  const entities: string[] = [];
  if (lower.includes('underpass') || lower.includes('अंडरपास')) entities.push('Underpass Basin');
  if (lower.includes('st. jude') || lower.includes('school')) entities.push('St. Jude School');
  if (lower.includes('sanjivani') || lower.includes('hospital') || lower.includes('ambulance')) entities.push('Sanjivani Hospital Corridor');
  if (lower.includes('metro') || lower.includes('pillar 42')) entities.push('Sector 15 Metro Station');
  if (lower.includes('pump') || lower.includes('pumping station')) entities.push('Stormwater Pumping Station #4');
  if (lower.includes('van') || lower.includes('bus') || lower.includes('bache')) entities.push('School Transportation');
  if (lower.includes('transformer') || lower.includes('sparking')) entities.push('High Voltage Transformer');
  if (lower.includes('manhole')) entities.push('Open Manhole Chamber');

  // 5. English Translation logic (Dictionary + Heuristic for Hindi/Hinglish)
  let englishTranslation = text;
  if (detectedLanguage === 'hi') {
    if (text.includes('नाला ओवरफ्लो')) {
      englishTranslation = 'Main drain is overflowing, foul water spilling onto roadway. Turn on dewatering pumps immediately.';
    } else if (text.includes('गाड़ियों का इंजन')) {
      englishTranslation = 'Vehicle engines have stalled in underpass flood water. People pushing cars, please dispatch emergency assistance.';
    } else if (text.includes('नाला साफ')) {
      englishTranslation = 'Drain desilting complete and water receded. Situation restored to normal.';
    } else if (text.includes('स्ट्रीट लाइट')) {
      englishTranslation = 'Street light poles 14 to 19 non-operational for 3 days. Complete darkness at night.';
    } else {
      englishTranslation = `[Hindi Report]: Civic anomaly reported regarding ${category}. Immediate field inspection requested.`;
    }
  } else if (detectedLanguage === 'hinglish') {
    if (lower.includes('st. jude') || lower.includes('school ki van')) {
      englishTranslation = 'SOS!! St. Jude primary school yellow van trapped in underpass floodwater! 15 children trapped inside, water reaching window sill!';
    } else if (lower.includes('paani bhar raha hai') || lower.includes('underpass me')) {
      englishTranslation = 'Water accumulating in Sector 15 underpass incline, two-wheelers skidding! Civic authorities please attend.';
    } else if (lower.includes('sanjivani') || lower.includes('hospital')) {
      englishTranslation = 'Water reaching hospital emergency ramp. Medical personnel urgently requesting sandbag barriers.';
    } else if (lower.includes('pura sector 15 lake')) {
      englishTranslation = 'Entire Sector 15 transformed into a lake. School children safely rescued, but hospital route remains cut off.';
    } else {
      englishTranslation = `[Hinglish Report]: Urgent civic notice regarding ${category} issue in ward perimeter.`;
    }
  }

  return {
    category,
    detectedLanguage,
    englishTranslation,
    reportedSeverity,
    confidenceScore: categoryConfidence,
    sentiment,
    keyEntities: entities.length > 0 ? entities : ['Urban Corridor', 'Local Sub-ward'],
    extractedLocationName: entities[0] || 'Reported Location'
  };
}

/**
 * Optional Gemini API caller with graceful deterministic fallback
 */
export async function parseSignalWithGemini(
  rawText: string,
  apiKey?: string,
  imageUrl?: string
): Promise<ParsedSignalResult> {
  const { output, trace } = await SignalAnalystAgent.analyzeSignal(rawText, imageUrl, apiKey);

  let sentiment: 'negative' | 'urgent' | 'neutral' | 'positive_confirmation' = 'negative';
  if (output.severity === 'critical' || output.severity === 'high') sentiment = 'urgent';

  return {
    category: output.category,
    detectedLanguage: output.language,
    englishTranslation: output.translation,
    reportedSeverity: output.severity,
    confidenceScore: output.confidence,
    sentiment,
    keyEntities: output.keyEntities,
    extractedLocationName: output.locationCandidates?.[0]?.name || output.locationClues?.[0],
    agentTrace: trace
  };
}
