import React, { useState } from 'react';
import {
  CheckCircle2,
  Globe,
  Mic,
  MicOff,
  MessageSquare,
  Radio,
  Send,
  Sparkles,
  Volume2,
  Edit3,
  MapPin,
  AlertCircle,
  RefreshCw,
  Check,
  ShieldAlert,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { CanonicalDevelopmentCategory, DevelopmentRequest } from '../../types/development';
import { TextProvider } from '../../engine/ingestion/providers/TextProvider';
import { VoiceProvider } from '../../engine/ingestion/providers/VoiceProvider';
import { MessagingReplayProvider } from '../../engine/ingestion/providers/MessagingReplayProvider';
import { SocialProvider } from '../../engine/ingestion/providers/SocialProvider';
import { DuplicateDetector } from '../../engine/ingestion/DuplicateDetector';
import { DevelopmentRequestNormalizer } from '../../engine/ingestion/DevelopmentRequestNormalizer';

interface MultilingualCitizenIngestionPanelProps {
  onIngestRequest?: (request: DevelopmentRequest) => void;
}

export interface AIInterpretation {
  rawText: string;
  category: CanonicalDevelopmentCategory;
  needStatement: string;
  locationName: string;
  isLocationConfirmed: boolean;
  channel: 'VOICE' | 'TEXT' | 'MESSAGING' | 'SOCIAL';
  language: string;
  confidence: number;
  mode: 'LIVE' | 'REPLAY' | 'SIMULATION';
  isEditing: boolean;
}

export const MultilingualCitizenIngestionPanel: React.FC<MultilingualCitizenIngestionPanelProps> = ({
  onIngestRequest
}) => {
  const [activeTab, setActiveTab] = useState<'voice' | 'text' | 'messaging' | 'social'>('text');

  // Input states
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);

  // Fixture selection states
  const [selectedVoiceFixtureIdx, setSelectedVoiceFixtureIdx] = useState<number | null>(null);
  const [selectedMsgFixtureIdx, setSelectedMsgFixtureIdx] = useState<number | null>(null);
  const [selectedSocialFixtureIdx, setSelectedSocialFixtureIdx] = useState<number | null>(null);

  // Step 2 & 3: Interactive Interpretation & Confirmation state
  const [interpretation, setInterpretation] = useState<AIInterpretation | null>(null);
  const [submittedRequest, setSubmittedRequest] = useState<DevelopmentRequest | null>(null);
  const [dedupStatus, setDedupStatus] = useState<{ isDuplicate: boolean; reason?: string } | null>(null);

  // Instantiated providers & detector
  const [textProvider] = useState(() => new TextProvider('LIVE'));
  const [voiceProvider] = useState(() => new VoiceProvider('LIVE'));
  const [messagingProvider] = useState(() => new MessagingReplayProvider());
  const [socialProvider] = useState(() => new SocialProvider('REPLAY'));
  const [detector] = useState(() => new DuplicateDetector());

  const sampleLanguageTexts = [
    {
      label: 'Hinglish (Prompt)',
      text: 'Humare area mein hospital bahut door hai.',
      lang: 'hinglish'
    },
    {
      label: 'Hindi (हिंदी)',
      text: 'हमारे गांव में अस्पताल बहुत दूर है और पक्की सड़क नहीं है।',
      lang: 'hi'
    },
    {
      label: 'English',
      text: 'Nearest secondary school is 18 km away with no public transit.',
      lang: 'en'
    }
  ];

  const canonicalCategories: { value: CanonicalDevelopmentCategory; label: string }[] = [
    { value: 'HEALTHCARE', label: '🏥 Healthcare' },
    { value: 'EDUCATION', label: '🎓 Education' },
    { value: 'WATER', label: '💧 Water Supply' },
    { value: 'SANITATION', label: '🧹 Sanitation & Waste' },
    { value: 'ROADS', label: '🛣️ Roads & Potholes' },
    { value: 'TRANSPORT', label: '🚌 Public Transport' },
    { value: 'ELECTRICITY', label: '⚡ Electricity & Lights' },
    { value: 'DIGITAL_CONNECTIVITY', label: '📶 Digital Connectivity' },
    { value: 'PUBLIC_SAFETY', label: '🛡️ Public Safety' },
    { value: 'HOUSING', label: '🏠 Housing & Shelter' },
    { value: 'OTHER', label: '📦 Other Development' }
  ];

  // Helper to extract initial AI understanding from text/payload
  const analyzeInputText = async (
    text: string,
    channel: 'VOICE' | 'TEXT' | 'MESSAGING' | 'SOCIAL',
    locationHint?: string,
    modeHint: 'LIVE' | 'REPLAY' | 'SIMULATION' = 'LIVE'
  ) => {
    setIsProcessing(true);
    setSubmittedRequest(null);

    // AI parsing simulation
    await new Promise(r => setTimeout(r, 250));

    const detectedLang = DevelopmentRequestNormalizer.detectLanguage(text);
    const category = DevelopmentRequestNormalizer.normalizeCategory(undefined, text);

    let needStatement = text;
    if (category === 'HEALTHCARE') {
      needStatement = 'Improved healthcare access & primary health center';
    } else if (category === 'ROADS') {
      needStatement = 'Road repair & pothole resurfacing';
    } else if (category === 'WATER') {
      needStatement = 'Clean drinking water pipeline & supply';
    } else if (category === 'EDUCATION') {
      needStatement = 'School infrastructure & teacher availability';
    } else if (category === 'TRANSPORT') {
      needStatement = 'Public transit connectivity & bus routes';
    }

    const loc = locationHint || 'Ward 14, Greater Noida (Detected)';

    setInterpretation({
      rawText: text,
      category,
      needStatement,
      locationName: loc,
      isLocationConfirmed: false,
      channel,
      language: detectedLang,
      confidence: 0.94,
      mode: modeHint,
      isEditing: false
    });

    setIsProcessing(false);
  };

  // Submit confirmed request
  const handleConfirmAndSubmit = async () => {
    if (!interpretation) return;

    setIsProcessing(true);

    // Build canonical DevelopmentRequest using confirmed values
    const rawReq = await textProvider.ingestRequest(interpretation.rawText);

    const confirmedReq: DevelopmentRequest = {
      ...rawReq,
      category: interpretation.category,
      sourceChannel: interpretation.channel as any,
      mode: interpretation.mode,
      location: {
        ...rawReq.location,
        locationName: interpretation.locationName.replace(' (Detected)', '').replace(' (Confirmation Required)', ''),
        district: rawReq.location?.district || 'Gautam Buddha Nagar',
        state: rawReq.location?.state || 'Uttar Pradesh',
        country: rawReq.location?.country || 'India',
        locationConfidence: interpretation.isLocationConfirmed ? 1.0 : 0.85,
        resolutionStatus: interpretation.isLocationConfirmed ? 'exact' : 'approximate'
      },
      extractedEntities: [interpretation.needStatement],
      confidence: interpretation.confidence
    };

    const check = detector.isDuplicate(confirmedReq);
    setDedupStatus(check);

    if (!check.isDuplicate) {
      detector.register(confirmedReq);
      onIngestRequest?.(confirmedReq);
    }

    setSubmittedRequest(confirmedReq);
    setIsProcessing(false);
  };

  const handleIngestVoiceFixture = async (idx: number) => {
    setSelectedVoiceFixtureIdx(idx);
    const fixture = VoiceProvider.SAMPLE_VOICE_FIXTURES[idx];
    await analyzeInputText(fixture.rawText, 'VOICE', fixture.location, 'LIVE');
  };

  const handleIngestMessagingFixture = async (idx: number) => {
    setSelectedMsgFixtureIdx(idx);
    const fixture = MessagingReplayProvider.SAMPLE_MESSAGING_FIXTURES[idx];
    await analyzeInputText(fixture.rawText, 'MESSAGING', fixture.location, 'REPLAY');
  };

  const handleIngestSocialFixture = async (idx: number) => {
    setSelectedSocialFixtureIdx(idx);
    const fixture = SocialProvider.SAMPLE_X_FIXTURES[idx] || SocialProvider.SAMPLE_X_FIXTURES[0];
    await analyzeInputText(fixture.rawText, 'SOCIAL', fixture.locationName, 'REPLAY');
  };

  const handleSimulateVoiceRecord = () => {
    setIsVoiceRecording(true);
    setTimeout(async () => {
      setIsVoiceRecording(false);
      const sampleVoiceText = 'Humare area mein hospital bahut door hai.';
      setInputText(sampleVoiceText);
      await analyzeInputText(sampleVoiceText, 'VOICE', 'Ward 14, Greater Noida (Voice Telemetry)', 'LIVE');
    }, 1500);
  };

  return (
    <div
      className="card citizen-experience-card"
      style={{
        padding: '1.25rem',
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-accent)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-md)'
      }}
    >
      {/* Primary Question Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(37, 99, 235, 0.08) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: '10px',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <Sparkles size={18} color="var(--cyan-400)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-heading)' }}>
              "What does your community need?"
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Multilingual Citizen Experience Gateway • Voice, Text & Messaging Intake in Hindi, English & Hinglish
          </p>
        </div>

        {/* Language & Channel Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>
            🇮🇳 Hindi (हिंदी)
          </span>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc' }}>
            🗣️ Hinglish
          </span>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399' }}>
            🇬🇧 English
          </span>
        </div>
      </div>

      {/* Channel Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', background: 'var(--bg-canvas)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)', gap: '2px' }}>
          <button
            onClick={() => setActiveTab('text')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'text' ? 'var(--cyan-500)' : 'transparent',
              color: activeTab === 'text' ? '#fff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Globe size={14} />
            <span>Text Channel</span>
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'voice' ? 'var(--cyan-500)' : 'transparent',
              color: activeTab === 'voice' ? '#fff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Mic size={14} />
            <span>Voice Intake</span>
          </button>

          <button
            onClick={() => setActiveTab('messaging')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'messaging' ? 'var(--cyan-500)' : 'transparent',
              color: activeTab === 'messaging' ? '#fff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <MessageSquare size={14} />
            <span>Messaging (WhatsApp/SMS)</span>
          </button>

          <button
            onClick={() => setActiveTab('social')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'social' ? 'var(--cyan-500)' : 'transparent',
              color: activeTab === 'social' ? '#fff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Radio size={14} />
            <span>Social / X</span>
          </button>
        </div>

        {/* Mode Tag */}
        <span
          style={{
            fontSize: '0.68rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '4px',
            background: activeTab === 'text' || activeTab === 'voice' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: activeTab === 'text' || activeTab === 'voice' ? '#10b981' : '#f59e0b',
            border: `1px solid ${activeTab === 'text' || activeTab === 'voice' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
          }}
        >
          MODE: {activeTab === 'text' || activeTab === 'voice' ? 'LIVE INGESTION' : 'REPLAY FIXTURE'}
        </span>
      </div>

      {/* TAB 1: TEXT */}
      {activeTab === 'text' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', alignSelf: 'center', fontWeight: 600 }}>Quick Examples:</span>
            {sampleLanguageTexts.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(sample.text);
                  analyzeInputText(sample.text, 'TEXT', 'Ward 14, Greater Noida', 'LIVE');
                }}
                style={{
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                + {sample.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <textarea
              rows={2}
              placeholder="State what your community needs in Hindi, English, or Hinglish... e.g. 'Humare area mein hospital bahut door hai.'"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: '8px',
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.84rem',
                fontFamily: 'inherit'
              }}
            />
            <button
              onClick={() => analyzeInputText(inputText, 'TEXT', 'Ward 14, Greater Noida', 'LIVE')}
              disabled={isProcessing || !inputText.trim()}
              style={{
                padding: '0 1.1rem',
                borderRadius: '8px',
                background: 'var(--cyan-500)',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Send size={15} />
              <span>Analyze Need</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: VOICE */}
      {activeTab === 'voice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-canvas)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ padding: '0.4rem', borderRadius: '50%', background: isVoiceRecording ? 'rgba(239, 68, 68, 0.2)' : 'rgba(6, 182, 212, 0.15)' }}>
                <Mic size={18} color={isVoiceRecording ? '#ef4444' : 'var(--cyan-400)'} />
              </div>
              <div>
                <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                  {isVoiceRecording ? 'Listening to Citizen Speech...' : 'Speak Your Community Need'}
                </strong>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Multilingual Speech-to-Text • Hindi, English, Hinglish Auto-Detect
                </div>
              </div>
            </div>

            <button
              onClick={handleSimulateVoiceRecord}
              disabled={isVoiceRecording}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                background: isVoiceRecording ? '#ef4444' : 'var(--cyan-500)',
                color: '#fff',
                border: 'none',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              {isVoiceRecording ? <MicOff size={14} /> : <Mic size={14} />}
              <span>{isVoiceRecording ? 'Recording...' : 'Record Voice Speech'}</span>
            </button>
          </div>

          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Or Select Pre-Recorded Voice Fixture:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {VoiceProvider.SAMPLE_VOICE_FIXTURES.map((fixture, idx) => (
              <div
                key={fixture.id}
                onClick={() => handleIngestVoiceFixture(idx)}
                style={{
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  background: selectedVoiceFixtureIdx === idx ? 'var(--civic-blue-50)' : 'var(--bg-canvas)',
                  border: selectedVoiceFixtureIdx === idx ? '1.5px solid var(--cyan-400)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Volume2 size={15} color="var(--cyan-400)" />
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>[{fixture.language.toUpperCase()}]</strong>: "{fixture.rawText}"
                  </div>
                </div>
                <span style={{ fontSize: '0.66rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan-400)', fontWeight: 700 }}>
                  PROCESS VOICE AI →
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MESSAGING */}
      {activeTab === 'messaging' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ background: '#0b141a', border: '1px solid #202c33', borderRadius: '10px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ fontSize: '0.72rem', color: '#00a884', fontWeight: 800, textTransform: 'uppercase' }}>
              Simulated WhatsApp / SMS Citizen Channel
            </div>
            {MessagingReplayProvider.SAMPLE_MESSAGING_FIXTURES.map((fixture, idx) => (
              <div
                key={fixture.id}
                onClick={() => handleIngestMessagingFixture(idx)}
                style={{
                  padding: '0.65rem 0.75rem',
                  borderRadius: '8px',
                  background: selectedMsgFixtureIdx === idx ? '#111b21' : '#182229',
                  border: selectedMsgFixtureIdx === idx ? '1.5px solid #00a884' : '1px solid #222d34',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#00a884', fontWeight: 700 }}>
                  <span>{fixture.sender}</span>
                  <span style={{ color: '#8696a0' }}>LANG: {fixture.language.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#e9edef' }}>
                  "{fixture.rawText}"
                </div>
                <div style={{ fontSize: '0.68rem', color: '#8696a0' }}>
                  Location: <strong>{fixture.location}</strong> • Click to analyze
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SOCIAL */}
      {activeTab === 'social' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {SocialProvider.SAMPLE_X_FIXTURES.map((fixture, idx) => (
            <div
              key={fixture.id}
              onClick={() => handleIngestSocialFixture(idx)}
              style={{
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                background: selectedSocialFixtureIdx === idx ? 'var(--civic-blue-50)' : 'var(--bg-canvas)',
                border: selectedSocialFixtureIdx === idx ? '1.5px solid var(--purple-400)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                fontSize: '0.78rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--purple-400)', fontWeight: 700 }}>
                <span>SOURCE: X / REPLAY ({fixture.authorHandle})</span>
                <span>LANG: {fixture.language.toUpperCase()}</span>
              </div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                "{fixture.rawText}"
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                <span>Location: {fixture.locationName}</span>
                <span style={{ color: 'var(--cyan-400)', fontWeight: 700 }}>INGEST SOCIAL SIGNAL →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STEP 2 & 3: INTERACTIVE AI INTERPRETATION & CITIZEN CONFIRMATION CARD */}
      {interpretation && !submittedRequest && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: '10px',
            background: 'var(--bg-canvas)',
            border: '1.5px solid var(--cyan-400)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 800, color: 'var(--cyan-400)' }}>
              <Sparkles size={16} />
              <span>Step 2 & 3: AI Interpretation & Citizen Confirmation</span>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan-400)' }}>
              CONFIDENCE: {(interpretation.confidence * 100).toFixed(0)}%
            </span>
          </div>

          {/* Raw Citizen Input */}
          <div style={{ fontSize: '0.78rem', padding: '0.65rem', background: 'var(--bg-surface)', borderRadius: '6px', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
              RAW CITIZEN INPUT ({interpretation.channel} • {interpretation.language.toUpperCase()}):
            </span>
            "{interpretation.rawText}"
          </div>

          {/* Editable Fields Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            
            {/* Category Selector */}
            <div style={{ background: 'var(--bg-surface)', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <label style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                DEVELOPMENT CATEGORY (EDITABLE):
              </label>
              <select
                value={interpretation.category}
                onChange={e => setInterpretation({ ...interpretation, category: e.target.value as CanonicalDevelopmentCategory })}
                style={{
                  width: '100%',
                  padding: '0.45rem',
                  borderRadius: '6px',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}
              >
                {canonicalCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Location Input & Confirmation */}
            <div style={{ background: 'var(--bg-surface)', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <label style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                  LOCATION (CONFIRMATION REQUIRED):
                </label>
                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: interpretation.isLocationConfirmed ? '#10b981' : '#f59e0b' }}>
                  {interpretation.isLocationConfirmed ? 'CONFIRMED' : 'DETECTED'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <input
                  type="text"
                  value={interpretation.locationName}
                  onChange={e => setInterpretation({ ...interpretation, locationName: e.target.value, isLocationConfirmed: true })}
                  style={{
                    flex: 1,
                    padding: '0.4rem',
                    borderRadius: '6px',
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    fontSize: '0.78rem'
                  }}
                />
                <button
                  onClick={() => setInterpretation({ ...interpretation, isLocationConfirmed: !interpretation.isLocationConfirmed })}
                  style={{
                    padding: '0.4rem 0.6rem',
                    borderRadius: '6px',
                    background: interpretation.isLocationConfirmed ? '#10b981' : 'var(--cyan-500)',
                    color: '#fff',
                    border: 'none',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {interpretation.isLocationConfirmed ? '✓ Confirmed' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>

          {/* Need Statement Edit */}
          <div style={{ background: 'var(--bg-surface)', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <label style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
              EXTRACTED DEVELOPMENT NEED (EDITABLE):
            </label>
            <input
              type="text"
              value={interpretation.needStatement}
              onChange={e => setInterpretation({ ...interpretation, needStatement: e.target.value })}
              style={{
                width: '100%',
                padding: '0.45rem',
                borderRadius: '6px',
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            />
          </div>

          {/* Confirmation & Submit Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.2rem' }}>
            <button
              onClick={() => setInterpretation(null)}
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: '6px',
                background: 'transparent',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-secondary)',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAndSubmit}
              disabled={isProcessing}
              style={{
                padding: '0.5rem 1.1rem',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <CheckCircle2 size={16} />
              <span>Confirm & Submit Request</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SUBMITTED REQUEST CONFIRMATION */}
      {submittedRequest && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1.5px solid rgba(16, 185, 129, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 800, fontSize: '0.85rem' }}>
              <CheckCircle2 size={18} />
              <span>Development Request Submitted to Municipal Queue</span>
            </div>
            <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              REQ #{submittedRequest.id}
            </span>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>
            <strong>Category:</strong> {submittedRequest.category} • <strong>Location:</strong> {submittedRequest.location.locationName}
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            <strong>Confirmed Need:</strong> "{submittedRequest.extractedEntities[0] || submittedRequest.rawText}"
          </div>

          {dedupStatus && (
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: dedupStatus.isDuplicate ? '#f59e0b' : '#10b981' }}>
              {dedupStatus.isDuplicate ? '⚠️ Duplicate request merged with existing cluster' : '✅ Registered as new unique development demand signal'}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
            <button
              onClick={() => {
                setSubmittedRequest(null);
                setInterpretation(null);
                setInputText('');
              }}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              + Submit Another Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
